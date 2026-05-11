import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { getAgentRunDetail } from "@/db/repositories/agent-run-repository";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";

import { runAiSinglePackPipeline } from "./run-ai-single-pack-pipeline";

describe("runAiSinglePackPipeline", () => {
  it("saves normalized AI production pack with completed agent steps", async () => {
    const client = createTestDbClient();

    try {
      const result = await runAiSinglePackPipeline(demoArticleInput, {
        client,
        env: {
          AI_PROVIDER: "minimax",
          AI_MODEL: "MiniMax-M2.7",
          MINIMAX_API_KEY: "test-key",
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1"
        },
        chatCompletionExecutor: async () => JSON.stringify({
          ...demoProductionPack,
          mode: "ai",
          storyboard: {
            shots: demoProductionPack.storyboard.shots.slice(0, 2)
          }
        })
      });
      const detail = getAgentRunDetail(result.agentRunId, client);

      expect(result.fallbackUsed).toBe(false);
      expect(result.generationMode).toBe("ai");
      expect(result.productionPack.mode).toBe("ai");
      expect(result.productionPack.storyboard.shots.length).toBeGreaterThanOrEqual(8);
      expect(detail?.run.status).toBe("completed");
      expect(detail?.steps).toHaveLength(7);
      expect(detail?.steps.every((step) => step.status === "completed")).toBe(true);
    } finally {
      client.close();
    }
  });

  it("accepts compact MiniMax shape with prompts nested in storyboard shots", async () => {
    const client = createTestDbClient();
    const compactPack = {
      ...demoProductionPack,
      id: undefined,
      createdAt: undefined,
      assetPrompts: undefined,
      metadata: { note: "provider-specific compact output" },
      mode: "ai",
      storyboard: {
        shots: demoProductionPack.storyboard.shots.map((shot) => ({
          ...shot,
          imagePrompt: "compact image prompt",
          videoPrompt: "compact video prompt",
          negativePrompt: "fake logo"
        }))
      }
    };

    try {
      const result = await runAiSinglePackPipeline(demoArticleInput, {
        client,
        env: {
          AI_PROVIDER: "minimax",
          AI_MODEL: "MiniMax-M2.7",
          MINIMAX_API_KEY: "test-key",
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1"
        },
        chatCompletionExecutor: async () => JSON.stringify(compactPack)
      });

      expect(result.fallbackUsed).toBe(false);
      expect(result.productionPack.assetPrompts.imagePrompts).toHaveLength(8);
      expect(result.productionPack.assetPrompts.videoPrompts).toHaveLength(8);
    } finally {
      client.close();
    }
  });
});
