import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import {
  getAgentRunDetail,
  getLatestAgentRunForProject
} from "@/db/repositories/agent-run-repository";
import { getQaResultByRunId } from "@/db/repositories/qa-result-repository";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { runTrackedMockPipeline } from "./tracked-mock-pipeline";

const expectedStepOrder = [
  "article-analyst",
  "thesis-agent",
  "script-writer",
  "storyboard-agent",
  "prompt-generator",
  "asset-finder",
  "qa-agent"
];

describe("Batch 07 tracked mock pipeline", () => {
  it("creates a completed agent run with ordered steps and context snapshots", () => {
    const client = createTestDbClient();

    try {
      const result = runTrackedMockPipeline(demoArticleInput, { client });
      const latestRun = getLatestAgentRunForProject(result.saved.project.id, client);
      const detail = getAgentRunDetail(result.agentRunId, client);

      expect(result.agentRunId).toBeTruthy();
      expect(latestRun?.id).toBe(result.agentRunId);
      expect(detail?.run.status).toBe("completed");
      expect(detail?.run.projectId).toBe(result.saved.project.id);
      expect(detail?.steps.map((step) => step.agentSlug)).toEqual(expectedStepOrder);
      expect(detail?.steps.every((step) => step.status === "completed")).toBe(true);
      expect(detail?.steps.every((step) => step.inputSummary.length > 0)).toBe(true);
      expect(detail?.steps.every((step) => step.outputSummary.length > 0)).toBe(true);
      expect(detail?.contextSnapshots).toHaveLength(expectedStepOrder.length);
    } finally {
      client.close();
    }
  });

  it("saves QA results for the run", () => {
    const client = createTestDbClient();

    try {
      const result = runTrackedMockPipeline(demoArticleInput, { client });
      const qaResult = getQaResultByRunId(result.agentRunId, client);

      expect(qaResult?.redRightsRiskCount).toBe(1);
      expect(qaResult?.summary.script.has90sScript).toBe(true);
      expect(qaResult?.summary.export.hasRequiredManifestFiles).toBe(true);
    } finally {
      client.close();
    }
  });

  it("marks the run failed when a tracked pipeline step throws", () => {
    const client = createTestDbClient();

    try {
      expect(() =>
        runTrackedMockPipeline(demoArticleInput, {
          client,
          failAtAgentSlug: "script-writer"
        })
      ).toThrow("Simulated script-writer failure");

      const latestRun = getLatestAgentRunForProject(null, client);
      expect(latestRun?.status).toBe("failed");
      expect(latestRun?.errorMessage).toContain("Simulated script-writer failure");
    } finally {
      client.close();
    }
  });
});
