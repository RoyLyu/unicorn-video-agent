import { desc, eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { qaResults, type QaResultRow } from "../schema";
import type { AgentQaSummary } from "@/lib/agents/agent-run-types";

export type QaResultRecord = {
  id: string;
  runId: string;
  projectId: string | null;
  summary: AgentQaSummary;
  redRightsRiskCount: number;
  createdAt: string;
};

export function saveQaResult(
  input: {
    runId: string;
    projectId: string | null;
    summary: AgentQaSummary;
  },
  client: DbClient = getDbClient()
): QaResultRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  client.db
    .insert(qaResults)
    .values({
      id,
      runId: input.runId,
      projectId: input.projectId,
      summaryJson: JSON.stringify(input.summary),
      redRightsRiskCount: input.summary.copyright.redRightsRiskCount,
      factQaJson: JSON.stringify(input.summary.fact),
      scriptQaJson: JSON.stringify(input.summary.script),
      copyrightQaJson: JSON.stringify(input.summary.copyright),
      exportQaJson: JSON.stringify(input.summary.export),
      publishQaJson: JSON.stringify(input.summary.publish),
      createdAt: now
    })
    .run();

  return {
    id,
    runId: input.runId,
    projectId: input.projectId,
    summary: input.summary,
    redRightsRiskCount: input.summary.copyright.redRightsRiskCount,
    createdAt: now
  };
}

export function getQaResultByRunId(
  runId: string,
  client: DbClient = getDbClient()
): QaResultRecord | null {
  const row = client.db
    .select()
    .from(qaResults)
    .where(eq(qaResults.runId, runId))
    .orderBy(desc(qaResults.createdAt))
    .limit(1)
    .get();

  return row ? toQaResultRecord(row) : null;
}

export function getLatestQaResultByProjectId(
  projectId: string,
  client: DbClient = getDbClient()
): QaResultRecord | null {
  const row = client.db
    .select()
    .from(qaResults)
    .where(eq(qaResults.projectId, projectId))
    .orderBy(desc(qaResults.createdAt))
    .limit(1)
    .get();

  return row ? toQaResultRecord(row) : null;
}

function toQaResultRecord(row: QaResultRow): QaResultRecord {
  return {
    id: row.id,
    runId: row.runId,
    projectId: row.projectId,
    summary: JSON.parse(row.summaryJson) as AgentQaSummary,
    redRightsRiskCount: row.redRightsRiskCount,
    createdAt: row.createdAt
  };
}
