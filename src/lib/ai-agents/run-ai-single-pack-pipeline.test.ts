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

  it("canonicalizes natural language enum values before strict schema parse", async () => {
    const client = createTestDbClient();
    const compactPack = {
      ...demoProductionPack,
      mode: "ai",
      storyboard: {
        shots: demoProductionPack.storyboard.shots.slice(0, 2).map((shot, index) => ({
          ...shot,
          id: `S90-0${index + 1}`,
          versionType: "90s",
          shotFunction: index === 0 ? "Hook Shot" : "Data Shot",
          productionMethod: index === 0 ? "Text-to-Video" : "Motion Graphics",
          copyrightRisk: index === 0 ? "low" : "needs review",
          rightsLevel: index === 0 ? "safe" : "medium",
          editing: {
            ...shot.editing,
            beat: "测试节奏",
            cutType: index === 0 ? "硬切" : "graphic match cut",
            transitionLogic: "从观点切到证据",
            screenTextTiming: "开场 0.5 秒出现",
            graphicTiming: "旁白关键词出现时进入",
            musicCue: "低频推进",
            sfxCue: "轻微 whoosh",
            rollType: index === 0 ? "A-roll" : "motion graphics",
            pace: index === 0 ? "快速" : "moderate"
          }
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
      const detail = getAgentRunDetail(result.agentRunId, client);

      expect(isAiSinglePackFailure(result)).toBe(false);
      if (isAiSinglePackFailure(result)) {
        throw new Error(result.safeErrorSummary);
      }
      expect(result.fallbackUsed).toBe(false);
      expect(result.productionPack.storyboard.shots[0].shotFunction).toBe("hook_shot");
      expect(result.productionPack.storyboard.shots[0].productionMethod).toBe("text_to_video");
      expect(result.productionPack.storyboard.shots[0].editing?.cutType).toBe("hard_cut");
      expect(result.canonicalizationReport?.changedFields.length).toBeGreaterThan(0);
      expect(detail?.steps[0].inputJson).toMatchObject({
        canonicalizationReport: {
          unknownEnumFields: []
        }
      });
    } finally {
      client.close();
    }
  });

  it("fails strict real output when enum values remain unknown after canonicalization", async () => {
    const client = createTestDbClient();
    const compactPack = {
      ...demoProductionPack,
      mode: "ai",
      storyboard: {
        shots: demoProductionPack.storyboard.shots.slice(0, 1).map((shot) => ({
          ...shot,
          shotFunction: "mystery shot",
          productionMethod: "Text-to-Video",
          editing: {
            ...shot.editing,
            beat: "测试节奏",
            cutType: "spiral morph",
            transitionLogic: "从观点切到证据",
            screenTextTiming: "开场 0.5 秒出现",
            graphicTiming: "旁白关键词出现时进入",
            musicCue: "低频推进",
            sfxCue: "轻微 whoosh",
            rollType: "A-roll",
            pace: "fast"
          }
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

      expect(isAiSinglePackFailure(result)).toBe(true);
      if (!isAiSinglePackFailure(result)) {
        throw new Error("Expected strict failure");
      }
      expect(result.failureReason).toBe("schema");
      expect(result.safeErrorSummary).toContain("canonicalization 后仍失败");
      expect(result.unknownEnumFields?.map((field) => field.path)).toContain(
        "storyboard.shots.0.shotFunction"
      );
      expect(result.schemaFailurePaths).toContain("storyboard.shots.0.shotFunction");
    } finally {
      client.close();
    }
  });
});
