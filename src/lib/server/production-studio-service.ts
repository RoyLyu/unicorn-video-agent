import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";
import {
  createProductionStudioGateRun,
  getProductionStudioState,
  saveProductionStudioEdits,
  setProductionStudioLock,
  type ProductionStudioGateRun
} from "@/db/repositories/production-studio-repository";
import type { DbClient } from "@/db";
import { readShotDensityProfile, type ShotDensityProfile } from "@/lib/production-studio/density-profile";
import { resolveEffectiveProductionPack } from "@/lib/production-studio/effective-production-pack";
import { mapProductionStudioViewModel } from "@/lib/production-studio/production-studio-mapper";
import type { ProductionStudioEditInput } from "@/lib/production-studio/production-studio-schemas";

export function getProductionStudioPayload(
  projectId: string,
  densityProfile: ShotDensityProfile = readShotDensityProfile(),
  client?: DbClient
) {
  const saved = getProductionPackByProjectId(projectId, client);

  if (!saved) {
    return null;
  }

  const initialState = getProductionStudioState(projectId, densityProfile, client);
  const effectiveProfile = initialState.latestGateRun?.densityProfile ?? densityProfile;
  const studioState = effectiveProfile === densityProfile
    ? initialState
    : getProductionStudioState(projectId, effectiveProfile, client);
  const effectiveResult = resolveEffectiveProductionPack({
    productionPack: saved.productionPack,
    edits: studioState.edits,
    densityProfile: effectiveProfile
  });
  const studio = mapProductionStudioViewModel({
    projectId,
    projectTitle: saved.project.title,
    productionPack: effectiveResult.effective,
    densityProfile: effectiveProfile,
    studioState
  });

  return {
    project: saved.project,
    densityProfile: effectiveProfile,
    profileOptions: ["lite", "standard", "dense"] as const,
    originalProductionPack: effectiveResult.original,
    effectiveProductionPack: effectiveResult.effective,
    summary: effectiveResult.summary,
    editedCount: effectiveResult.editedCount,
    edits: studioState.edits,
    latestGateRun: studioState.latestGateRun,
    lock: studioState.lock,
    studio
  };
}

export function saveProductionStudioEditPayload(
  projectId: string,
  edits: ProductionStudioEditInput[],
  densityProfile: ShotDensityProfile = readShotDensityProfile(),
  client?: DbClient
) {
  if (!getProductionPackByProjectId(projectId, client)) {
    return null;
  }

  saveProductionStudioEdits(projectId, edits, client);

  return getProductionStudioPayload(projectId, densityProfile, client);
}

export function revalidateProductionStudio(
  projectId: string,
  densityProfile: ShotDensityProfile = readShotDensityProfile(),
  client?: DbClient
): { payload: NonNullable<ReturnType<typeof getProductionStudioPayload>>; gateRun: ProductionStudioGateRun } | null {
  const payload = getProductionStudioPayload(projectId, densityProfile, client);

  if (!payload) {
    return null;
  }

  const gateRun = createProductionStudioGateRun(
    projectId,
    densityProfile,
    payload.summary,
    client
  );
  const nextPayload = getProductionStudioPayload(projectId, densityProfile, client);

  if (!nextPayload) {
    return null;
  }

  return {
    payload: nextPayload,
    gateRun
  };
}

export function lockProductionStudio(
  projectId: string,
  lockNote: string | null = null,
  densityProfile: ShotDensityProfile = readShotDensityProfile(),
  client?: DbClient
) {
  const payload = getProductionStudioPayload(projectId, densityProfile, client);

  if (!payload) {
    return { status: "not_found" as const };
  }

  if (!payload.latestGateRun || payload.latestGateRun.status !== "pass") {
    return { status: "gate_failed" as const, payload };
  }

  setProductionStudioLock(
    projectId,
    {
      locked: true,
      gateRunId: payload.latestGateRun.id,
      lockNote
    },
    client
  );

  return {
    status: "locked" as const,
    payload: getProductionStudioPayload(projectId, densityProfile, client)
  };
}

export function unlockProductionStudio(
  projectId: string,
  densityProfile: ShotDensityProfile = readShotDensityProfile(),
  client?: DbClient
) {
  const payload = getProductionStudioPayload(projectId, densityProfile, client);

  if (!payload) {
    return null;
  }

  setProductionStudioLock(projectId, { locked: false }, client);

  return getProductionStudioPayload(projectId, densityProfile, client);
}
