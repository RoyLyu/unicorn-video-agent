import { and, desc, eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import {
  productionStudioEdits,
  productionStudioGateRuns,
  productionStudioLocks,
  type ProductionStudioEditRow,
  type ProductionStudioGateRunRow,
  type ProductionStudioLockRow
} from "../schema";
import type { ProductionStudioSummary } from "@/lib/production-studio/shot-prompt-alignment";
import type { ShotDensityProfile } from "@/lib/production-studio/density-profile";
import {
  ProductionStudioEditInputSchema,
  type ProductionStudioEditInput
} from "@/lib/production-studio/production-studio-schemas";

export type ProductionStudioEdit = ProductionStudioEditInput & {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductionStudioGateRun = {
  id: string;
  projectId: string;
  densityProfile: ShotDensityProfile;
  status: "pass" | "needs_fix";
  shotCount90s: number;
  shotCount180s: number;
  promptCount: number;
  unmatchedShots: string[];
  unmatchedPrompts: string[];
  redRisksWithoutReplacement: string[];
  scores: ProductionStudioSummary["scores"];
  needsFix: boolean;
  fixReasons: string[];
  createdAt: string;
};

export type ProductionStudioLock = {
  id: string;
  projectId: string;
  locked: boolean;
  lockedAt: string | null;
  lockNote: string | null;
  gateRunId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductionStudioState = {
  densityProfile: ShotDensityProfile;
  edits: ProductionStudioEdit[];
  latestGateRun: ProductionStudioGateRun | null;
  lock: ProductionStudioLock | null;
};

export function listProductionStudioEdits(
  projectId: string,
  client: DbClient = getDbClient()
): ProductionStudioEdit[] {
  return client.db
    .select()
    .from(productionStudioEdits)
    .where(eq(productionStudioEdits.projectId, projectId))
    .orderBy(productionStudioEdits.versionType, productionStudioEdits.shotNumber)
    .all()
    .map(mapEditRow);
}

export function saveProductionStudioEdits(
  projectId: string,
  edits: ProductionStudioEditInput[],
  client: DbClient = getDbClient()
): ProductionStudioEdit[] {
  const now = new Date().toISOString();
  const saved: ProductionStudioEdit[] = [];

  client.db.transaction(() => {
    for (const edit of edits) {
      const parsed = ProductionStudioEditInputSchema.parse(edit);
      const existing = client.db
        .select()
        .from(productionStudioEdits)
        .where(
          and(
            eq(productionStudioEdits.projectId, projectId),
            eq(productionStudioEdits.versionType, parsed.versionType),
            eq(productionStudioEdits.shotNumber, parsed.shotNumber),
            eq(productionStudioEdits.editType, parsed.editType)
          )
        )
        .get();

      if (existing) {
        client.db
          .update(productionStudioEdits)
          .set({
            patchJson: JSON.stringify(parsed.patch),
            updatedAt: now
          })
          .where(eq(productionStudioEdits.id, existing.id))
          .run();
        saved.push(mapEditRow({ ...existing, patchJson: JSON.stringify(parsed.patch), updatedAt: now }));
        continue;
      }

      const row = {
        id: crypto.randomUUID(),
        projectId,
        versionType: parsed.versionType,
        shotNumber: parsed.shotNumber,
        editType: parsed.editType,
        patchJson: JSON.stringify(parsed.patch),
        createdAt: now,
        updatedAt: now
      };

      client.db.insert(productionStudioEdits).values(row).run();
      saved.push(mapEditRow(row));
    }
  });

  return saved;
}

export function createProductionStudioGateRun(
  projectId: string,
  densityProfile: ShotDensityProfile,
  summary: ProductionStudioSummary,
  client: DbClient = getDbClient()
): ProductionStudioGateRun {
  const now = new Date().toISOString();
  const row = {
    id: crypto.randomUUID(),
    projectId,
    densityProfile,
    status: summary.needsFix ? "needs_fix" : "pass",
    shotCount90s: summary.shotCount90s,
    shotCount180s: summary.shotCount180s,
    promptCount: summary.totalPrompts,
    unmatchedShotsJson: JSON.stringify(summary.unmatchedShots),
    unmatchedPromptsJson: JSON.stringify(summary.unmatchedPrompts),
    redRisksWithoutReplacementJson: JSON.stringify(summary.redRisksWithoutReplacement),
    scoresJson: JSON.stringify(summary.scores),
    needsFix: summary.needsFix,
    fixReasonsJson: JSON.stringify(summary.fixReasons),
    createdAt: now
  };

  client.db.insert(productionStudioGateRuns).values(row).run();

  return mapGateRunRow(row);
}

export function getLatestProductionStudioGateRun(
  projectId: string,
  client: DbClient = getDbClient()
): ProductionStudioGateRun | null {
  const row = client.db
    .select()
    .from(productionStudioGateRuns)
    .where(eq(productionStudioGateRuns.projectId, projectId))
    .orderBy(desc(productionStudioGateRuns.createdAt))
    .limit(1)
    .get();

  return row ? mapGateRunRow(row) : null;
}

export function getProductionStudioLock(
  projectId: string,
  client: DbClient = getDbClient()
): ProductionStudioLock | null {
  const row = client.db
    .select()
    .from(productionStudioLocks)
    .where(eq(productionStudioLocks.projectId, projectId))
    .get();

  return row ? mapLockRow(row) : null;
}

export function setProductionStudioLock(
  projectId: string,
  input: { locked: boolean; gateRunId?: string | null; lockNote?: string | null },
  client: DbClient = getDbClient()
): ProductionStudioLock {
  const now = new Date().toISOString();
  const existing = getProductionStudioLock(projectId, client);
  const values = {
    locked: input.locked,
    lockedAt: input.locked ? now : null,
    lockNote: input.lockNote ?? existing?.lockNote ?? null,
    gateRunId: input.locked ? input.gateRunId ?? existing?.gateRunId ?? null : existing?.gateRunId ?? null,
    updatedAt: now
  };

  if (existing) {
    client.db
      .update(productionStudioLocks)
      .set(values)
      .where(eq(productionStudioLocks.id, existing.id))
      .run();

    return {
      ...existing,
      ...values
    };
  }

  const row = {
    id: crypto.randomUUID(),
    projectId,
    locked: input.locked,
    lockedAt: values.lockedAt,
    lockNote: values.lockNote,
    gateRunId: values.gateRunId,
    createdAt: now,
    updatedAt: now
  };

  client.db.insert(productionStudioLocks).values(row).run();

  return mapLockRow(row);
}

export function getProductionStudioState(
  projectId: string,
  densityProfile: ShotDensityProfile = "standard",
  client: DbClient = getDbClient()
): ProductionStudioState {
  return {
    densityProfile,
    edits: listProductionStudioEdits(projectId, client),
    latestGateRun: getLatestProductionStudioGateRun(projectId, client),
    lock: getProductionStudioLock(projectId, client)
  };
}

function mapEditRow(row: ProductionStudioEditRow): ProductionStudioEdit {
  const base = {
    id: row.id,
    projectId: row.projectId,
    versionType: row.versionType as "90s" | "180s",
    shotNumber: row.shotNumber,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };

  if (row.editType === "shot") {
    return {
      ...base,
      editType: "shot",
      patch: JSON.parse(row.patchJson) as Extract<ProductionStudioEdit, { editType: "shot" }>["patch"]
    };
  }

  if (row.editType === "prompt") {
    return {
      ...base,
      editType: "prompt",
      patch: JSON.parse(row.patchJson) as Extract<ProductionStudioEdit, { editType: "prompt" }>["patch"]
    };
  }

  return {
    ...base,
    editType: "rights",
    patch: JSON.parse(row.patchJson) as Extract<ProductionStudioEdit, { editType: "rights" }>["patch"]
  };
}

function mapGateRunRow(row: ProductionStudioGateRunRow): ProductionStudioGateRun {
  return {
    id: row.id,
    projectId: row.projectId,
    densityProfile: row.densityProfile as ShotDensityProfile,
    status: row.status as ProductionStudioGateRun["status"],
    shotCount90s: row.shotCount90s,
    shotCount180s: row.shotCount180s,
    promptCount: row.promptCount,
    unmatchedShots: JSON.parse(row.unmatchedShotsJson) as string[],
    unmatchedPrompts: JSON.parse(row.unmatchedPromptsJson) as string[],
    redRisksWithoutReplacement: JSON.parse(row.redRisksWithoutReplacementJson) as string[],
    scores: JSON.parse(row.scoresJson) as ProductionStudioSummary["scores"],
    needsFix: row.needsFix,
    fixReasons: JSON.parse(row.fixReasonsJson) as string[],
    createdAt: row.createdAt
  };
}

function mapLockRow(row: ProductionStudioLockRow): ProductionStudioLock {
  return {
    id: row.id,
    projectId: row.projectId,
    locked: row.locked,
    lockedAt: row.lockedAt,
    lockNote: row.lockNote,
    gateRunId: row.gateRunId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
