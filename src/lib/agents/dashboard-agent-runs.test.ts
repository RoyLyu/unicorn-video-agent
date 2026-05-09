import { describe, expect, it } from "vitest";

import type { RecentProject } from "@/db/repositories/project-repository";
import type { AgentRunSummary } from "@/db/repositories/agent-run-repository";
import { attachLatestAgentRunStatus } from "./dashboard-agent-runs";

const project: RecentProject = {
  id: "project-1",
  title: "Demo Project",
  sourceName: "Demo",
  status: "mock_saved",
  isDemo: true,
  createdAt: "2026-05-09T00:00:00.000Z",
  updatedAt: "2026-05-09T00:00:00.000Z"
};

const run: AgentRunSummary = {
  id: "run-1",
  projectId: "project-1",
  articleTitle: "Demo Project",
  status: "completed",
  startedAt: "2026-05-09T00:00:00.000Z",
  completedAt: "2026-05-09T00:00:01.000Z",
  errorMessage: null
};

describe("dashboard agent run status helper", () => {
  it("attaches the latest agent run status to projects", () => {
    const result = attachLatestAgentRunStatus([project], (projectId) =>
      projectId === "project-1" ? run : null
    );

    expect(result[0].latestAgentRun?.id).toBe("run-1");
    expect(result[0].latestAgentRun?.status).toBe("completed");
  });
});
