import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { getAgentRunDetail } from "@/db/repositories/agent-run-repository";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";

import { isAiSinglePackFailure, runAiSinglePackPipeline } from "./run-ai-single-pack-pipeline";

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
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1",
          AI_BANNED_OUTPUT_TERMS: "forbidden-only"
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
      expect(isAiSinglePackFailure(result)).toBe(false);
      if (isAiSinglePackFailure(result)) {
        throw new Error(result.safeErrorSummary);
      }
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
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1",
          AI_BANNED_OUTPUT_TERMS: "forbidden-only"
        },
        chatCompletionExecutor: async () => JSON.stringify(compactPack)
      });

      expect(result.fallbackUsed).toBe(false);
      expect(isAiSinglePackFailure(result)).toBe(false);
      if (isAiSinglePackFailure(result)) {
        throw new Error(result.safeErrorSummary);
      }
      expect(result.productionPack.assetPrompts.imagePrompts).toHaveLength(result.productionPack.storyboard.shots.length);
      expect(result.productionPack.assetPrompts.videoPrompts).toHaveLength(result.productionPack.storyboard.shots.length);
      expect(result.productionPack.assetPrompts.promptBundles).toHaveLength(result.productionPack.storyboard.shots.length);
    } finally {
      client.close();
    }
  });

  it("coerces MiniMax script arrays into schema-compatible script blocks", async () => {
    const client = createTestDbClient();
    const compactPack = {
      ...demoProductionPack,
      mode: "ai",
      scripts: {
        video90s: [
          { timeRange: "00:00-00:20", voiceover: "90 秒第一段", visualDescription: "图表开场", overlayText: "机会" },
          { timeRange: "00:20-01:30", voiceover: "90 秒第二段", visualDescription: "行业镜头", overlayText: "变化" }
        ],
        video180s: [
          { timeRange: "00:00-00:30", voiceover: "180 秒第一段", visualDescription: "观点卡", overlayText: "观点" },
          { timeRange: "00:30-03:00", voiceover: "180 秒第二段", visualDescription: "风险卡", overlayText: "风险" }
        ]
      }
    };

    try {
      const result = await runAiSinglePackPipeline(demoArticleInput, {
        client,
        env: {
          AI_PROVIDER: "minimax",
          AI_MODEL: "MiniMax-M2.7",
          MINIMAX_API_KEY: "test-key",
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1",
          AI_BANNED_OUTPUT_TERMS: "forbidden-only"
        },
        chatCompletionExecutor: async () => JSON.stringify(compactPack)
      });

      expect(isAiSinglePackFailure(result)).toBe(false);
      if (isAiSinglePackFailure(result)) {
        throw new Error(result.safeErrorSummary);
      }
      expect(result.productionPack.scripts.video90s.duration).toBe(90);
      expect(result.productionPack.scripts.video90s.lines[0].narration).toBe("90 秒第一段");
      expect(result.productionPack.scripts.video180s.duration).toBe(180);
      expect(result.productionPack.scripts.video180s.lines[0].onScreenText).toBe("观点");
    } finally {
      client.close();
    }
  });

  it("coerces provider shotNumber strings into numeric shot numbers", async () => {
    const client = createTestDbClient();
    const compactPack = {
      ...demoProductionPack,
      mode: "ai",
      storyboard: {
        shots: demoProductionPack.storyboard.shots.slice(0, 2).map((shot, index) => ({
          ...shot,
          id: `S90-0${index + 1}`,
          versionType: "90s",
          shotNumber: `S90-0${index + 1}`
        }))
      },
      assetPrompts: {
        ...demoProductionPack.assetPrompts,
        promptBundles: demoProductionPack.storyboard.shots.slice(0, 2).map((shot, index) => ({
          versionType: "90s",
          shotNumber: `90s-0${index + 1}`,
          shotId: `S90-0${index + 1}`,
          imagePrompt: `${shot.visual} image`,
          videoPrompt: `${shot.visual} video`,
          negativePrompt: "fake logo, unreadable text, distorted Chinese characters, artificial face, excessive cyberpunk",
          styleLock: "cinematic business documentary style, Bloomberg-inspired, dark navy and silver color palette, realistic footage, low saturation, soft contrast, natural lighting, premium consulting video",
          aspectRatio: "9:16",
          usageWarning: "不得生成真实 Logo、新闻图、创始人肖像、招股书截图或可读品牌文字。"
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
          MINIMAX_BASE_URL: "https://api.minimaxi.com/v1",
          AI_BANNED_OUTPUT_TERMS: "forbidden-only"
        },
        chatCompletionExecutor: async () => JSON.stringify(compactPack)
      });

      expect(isAiSinglePackFailure(result)).toBe(false);
      if (isAiSinglePackFailure(result)) {
        throw new Error(result.safeErrorSummary);
      }
      expect(result.productionPack.storyboard.shots[0].shotNumber).toBe(1);
      expect(result.productionPack.assetPrompts.promptBundles?.[0].shotNumber).toBe(1);
    } finally {
      client.close();
    }
  });
});
