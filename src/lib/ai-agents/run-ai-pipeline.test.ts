import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import {
  getAgentRunDetail,
  getLatestAgentRunForProject
} from "@/db/repositories/agent-run-repository";
import { getQaResultByRunId } from "@/db/repositories/qa-result-repository";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { ProductionPackSchema } from "@/lib/schemas/production-pack";

import { runAiPipeline } from "./run-ai-pipeline";

const expectedStepOrder = [
  "article-analyst",
  "thesis-agent",
  "script-writer",
  "storyboard-agent",
  "prompt-generator",
  "asset-finder",
  "qa-agent"
];

describe("Batch 08 AI pipeline fallback", () => {
  it("falls back to mock when OPENAI_API_KEY is missing", async () => {
    const client = createTestDbClient();

    try {
      const result = await runAiPipeline(demoArticleInput, {
        client,
        env: {
          AI_PROVIDER: "openai",
          AI_MODEL: "test-model",
          GENERATION_MODE: "ai"
        }
      });
      const latestRun = getLatestAgentRunForProject(result.saved.project.id, client);
      const detail = getAgentRunDetail(result.agentRunId, client);
      const qaResult = getQaResultByRunId(result.agentRunId, client);

      expect(result.fallbackUsed).toBe(true);
      expect(result.generationMode).toBe("mock");
      expect(result.productionPack.mode).toBe("mock");
      expect(() => ProductionPackSchema.parse(result.productionPack)).not.toThrow();
      expect(result.saved.project.status).toBe("ai_fallback_mock_saved");
      expect(latestRun?.status).toBe("completed_with_fallback");
      expect(detail?.steps.map((step) => step.agentSlug)).toEqual(expectedStepOrder);
      expect(
        detail?.steps.every((step) => step.status === "completed_with_fallback")
      ).toBe(true);
      expect(detail?.contextSnapshots).toHaveLength(expectedStepOrder.length);
      expect(qaResult?.summary.script.has90sScript).toBe(true);
    } finally {
      client.close();
    }
  });

  it("falls back to mock when AI_MODEL is missing", async () => {
    const client = createTestDbClient();

    try {
      const result = await runAiPipeline(demoArticleInput, {
        client,
        env: {
          OPENAI_API_KEY: "test-key",
          AI_PROVIDER: "openai",
          GENERATION_MODE: "ai"
        }
      });

      expect(result.fallbackUsed).toBe(true);
      expect(result.generationMode).toBe("mock");
      expect(result.saved.project.status).toBe("ai_fallback_mock_saved");
    } finally {
      client.close();
    }
  });

  it("continues after a single AI agent schema failure", async () => {
    const client = createTestDbClient();

    try {
      const result = await runAiPipeline(demoArticleInput, {
        client,
        env: {
          OPENAI_API_KEY: "test-key",
          AI_PROVIDER: "openai",
          AI_MODEL: "test-model",
          GENERATION_MODE: "ai"
        },
        aiExecutor: async ({ agentSlug, fallbackOutput }) => {
          if (agentSlug === "script-writer") {
            return { invalid: true };
          }

          return fallbackOutput;
        }
      });
      const detail = getAgentRunDetail(result.agentRunId, client);
      const scriptStep = detail?.steps.find(
        (step) => step.agentSlug === "script-writer"
      );

      expect(result.fallbackUsed).toBe(true);
      expect(result.generationMode).toBe("ai");
      expect(result.productionPack.mode).toBe("ai");
      expect(result.saved.project.status).toBe("ai_saved_with_fallback");
      expect(detail?.run.status).toBe("completed_with_fallback");
      expect(scriptStep?.status).toBe("completed_with_fallback");
      expect(scriptStep?.errorMessage).toContain("schema");
      expect(result.productionPack.scripts.video90s.lines.length).toBeGreaterThan(0);
      expect(result.productionPack.scripts.video180s.lines.length).toBeGreaterThan(0);
    } finally {
      client.close();
    }
  });
});
