import { asc, desc, eq, isNull } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import {
  agentContextSnapshots,
  agentRuns,
  agentRunSteps,
  type AgentContextSnapshotRow,
  type AgentRunRow,
  type AgentRunStepRow
} from "../schema";
import type { AgentRunStatus, AgentSlug, AgentStepStatus } from "@/lib/agents/agent-run-types";

export type AgentRunSummary = {
  id: string;
  projectId: string | null;
  articleTitle: string;
  status: AgentRunStatus;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
};

export type AgentRunStepRecord = {
  id: string;
  runId: string;
  agentSlug: AgentSlug;
  stepOrder: number;
  status: AgentStepStatus;
  inputJson: unknown;
  outputJson: unknown;
  inputSummary: string;
  outputSummary: string;
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
};

export type AgentContextSnapshotRecord = {
  id: string;
  runId: string;
  stepId: string;
  agentSlug: AgentSlug;
  context: unknown;
  summary: string;
  createdAt: string;
};

export type AgentRunDetail = {
  run: AgentRunSummary;
  steps: AgentRunStepRecord[];
  contextSnapshots: AgentContextSnapshotRecord[];
};

export function createAgentRun(
  articleTitle: string,
  client: DbClient = getDbClient()
): AgentRunSummary {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  client.db
    .insert(agentRuns)
    .values({
      id,
      projectId: null,
      articleTitle,
      status: "running",
      startedAt: now,
      completedAt: null,
      errorMessage: null
    })
    .run();

  return {
    id,
    projectId: null,
    articleTitle,
    status: "running",
    startedAt: now,
    completedAt: null,
    errorMessage: null
  };
}

export function recordAgentRunStep(
  input: {
    runId: string;
    agentSlug: AgentSlug;
    stepOrder: number;
    status: AgentStepStatus;
    inputJson: unknown;
    outputJson?: unknown;
    inputSummary: string;
    outputSummary?: string;
    errorMessage?: string | null;
  },
  client: DbClient = getDbClient()
): AgentRunStepRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  client.db
    .insert(agentRunSteps)
    .values({
      id,
      runId: input.runId,
      agentSlug: input.agentSlug,
      stepOrder: input.stepOrder,
      status: input.status,
      inputJson: JSON.stringify(input.inputJson),
      outputJson: JSON.stringify(input.outputJson ?? null),
      inputSummary: input.inputSummary,
      outputSummary: input.outputSummary ?? "",
      startedAt: now,
      completedAt: now,
      errorMessage: input.errorMessage ?? null
    })
    .run();

  return {
    id,
    runId: input.runId,
    agentSlug: input.agentSlug,
    stepOrder: input.stepOrder,
    status: input.status,
    inputJson: input.inputJson,
    outputJson: input.outputJson ?? null,
    inputSummary: input.inputSummary,
    outputSummary: input.outputSummary ?? "",
    startedAt: now,
    completedAt: now,
    errorMessage: input.errorMessage ?? null
  };
}

export function saveAgentContextSnapshot(
  input: {
    runId: string;
    stepId: string;
    agentSlug: AgentSlug;
    context: unknown;
    summary: string;
  },
  client: DbClient = getDbClient()
): AgentContextSnapshotRecord {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  client.db
    .insert(agentContextSnapshots)
    .values({
      id,
      runId: input.runId,
      stepId: input.stepId,
      agentSlug: input.agentSlug,
      contextJson: JSON.stringify(input.context),
      summary: input.summary,
      createdAt: now
    })
    .run();

  return {
    id,
    runId: input.runId,
    stepId: input.stepId,
    agentSlug: input.agentSlug,
    context: input.context,
    summary: input.summary,
    createdAt: now
  };
}

export function bindAgentRunToProject(
  runId: string,
  projectId: string,
  client: DbClient = getDbClient()
) {
  client.db
    .update(agentRuns)
    .set({ projectId })
    .where(eq(agentRuns.id, runId))
    .run();
}

export function completeAgentRun(
  runId: string,
  client: DbClient = getDbClient(),
  status: Extract<AgentRunStatus, "completed" | "completed_with_fallback"> = "completed"
) {
  client.db
    .update(agentRuns)
    .set({ status, completedAt: new Date().toISOString() })
    .where(eq(agentRuns.id, runId))
    .run();
}

export function failAgentRun(
  runId: string,
  errorMessage: string,
  client: DbClient = getDbClient()
) {
  client.db
    .update(agentRuns)
    .set({
      status: "failed",
      completedAt: new Date().toISOString(),
      errorMessage
    })
    .where(eq(agentRuns.id, runId))
    .run();
}

export function getLatestAgentRunForProject(
  projectId: string | null,
  client: DbClient = getDbClient()
): AgentRunSummary | null {
  const row = client.db
    .select()
    .from(agentRuns)
    .where(projectId === null ? isNull(agentRuns.projectId) : eq(agentRuns.projectId, projectId))
    .orderBy(desc(agentRuns.startedAt))
    .limit(1)
    .get();

  return row ? toAgentRunSummary(row) : null;
}

export function listAgentRunsByProject(
  projectId: string,
  client: DbClient = getDbClient()
): AgentRunSummary[] {
  return client.db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.projectId, projectId))
    .orderBy(desc(agentRuns.startedAt))
    .all()
    .map(toAgentRunSummary);
}

export function listRecentAgentRunsByAgent(
  agentSlug: string,
  limit = 10,
  client: DbClient = getDbClient()
): AgentRunSummary[] {
  const rows = client.db
    .select({
      id: agentRuns.id,
      projectId: agentRuns.projectId,
      articleTitle: agentRuns.articleTitle,
      status: agentRuns.status,
      startedAt: agentRuns.startedAt,
      completedAt: agentRuns.completedAt,
      errorMessage: agentRuns.errorMessage
    })
    .from(agentRunSteps)
    .innerJoin(agentRuns, eq(agentRunSteps.runId, agentRuns.id))
    .where(eq(agentRunSteps.agentSlug, agentSlug))
    .orderBy(desc(agentRuns.startedAt))
    .limit(limit)
    .all();

  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    articleTitle: row.articleTitle,
    status: row.status as AgentRunStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    errorMessage: row.errorMessage
  }));
}

export function getAgentRunDetail(
  runId: string,
  client: DbClient = getDbClient()
): AgentRunDetail | null {
  const run = client.db.select().from(agentRuns).where(eq(agentRuns.id, runId)).get();

  if (!run) {
    return null;
  }

  const steps = client.db
    .select()
    .from(agentRunSteps)
    .where(eq(agentRunSteps.runId, runId))
    .orderBy(asc(agentRunSteps.stepOrder))
    .all()
    .map(toAgentRunStepRecord);
  const contextSnapshots = client.db
    .select()
    .from(agentContextSnapshots)
    .where(eq(agentContextSnapshots.runId, runId))
    .orderBy(asc(agentContextSnapshots.createdAt))
    .all()
    .map(toAgentContextSnapshotRecord);

  return {
    run: toAgentRunSummary(run),
    steps,
    contextSnapshots
  };
}

function toAgentRunSummary(row: AgentRunRow): AgentRunSummary {
  return {
    id: row.id,
    projectId: row.projectId,
    articleTitle: row.articleTitle,
    status: row.status as AgentRunStatus,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    errorMessage: row.errorMessage
  };
}

function toAgentRunStepRecord(row: AgentRunStepRow): AgentRunStepRecord {
  return {
    id: row.id,
    runId: row.runId,
    agentSlug: row.agentSlug as AgentSlug,
    stepOrder: row.stepOrder,
    status: row.status as AgentStepStatus,
    inputJson: JSON.parse(row.inputJson),
    outputJson: row.outputJson ? JSON.parse(row.outputJson) : null,
    inputSummary: row.inputSummary,
    outputSummary: row.outputSummary ?? "",
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    errorMessage: row.errorMessage
  };
}

function toAgentContextSnapshotRecord(
  row: AgentContextSnapshotRow
): AgentContextSnapshotRecord {
  return {
    id: row.id,
    runId: row.runId,
    stepId: row.stepId,
    agentSlug: row.agentSlug as AgentSlug,
    context: JSON.parse(row.contextJson),
    summary: row.summary,
    createdAt: row.createdAt
  };
}
