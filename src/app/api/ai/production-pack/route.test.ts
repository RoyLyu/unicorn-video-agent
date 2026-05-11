import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { listRecentProjects } from "@/db/repositories/project-repository";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { handleAiProductionPackRequest } from "./route";

const cleanArticleInput = {
  ...demoArticleInput,
  rawText:
    "这是一篇用于测试真实 AI 输出的完整文章材料，包含公司事件、行业背景、风险提示和人工核验要求。",
  sourceName: "独角兽早知道"
};

describe("POST /api/ai/production-pack", () => {
  it("uses single-pack mode by default when AI env is configured", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify(cleanArticleInput)
        }),
        {
          client,
          env: {
            AI_PROVIDER: "minimax",
            AI_MODEL: "MiniMax-M2.7",
            MINIMAX_API_KEY: "test-key",
            MINIMAX_BASE_URL: "https://api.minimaxi.com/v1"
          },
          chatCompletionExecutor: async () => JSON.stringify({
            ...cleanArticleInput,
            invalid: true
          })
        }
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.agentMode).toBe("single_pack");
    } finally {
      client.close();
    }
  });

  it("returns 422 and no project when strict real output has missing AI env", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify(cleanArticleInput)
        }),
        { client, env: {} }
      );
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.projectId).toBeUndefined();
      expect(body.agentRunId).toBeTruthy();
      expect(body.fallbackUsed).toBe(false);
      expect(body.generationMode).toBe("ai");
      expect(body.failureReason).toBe("ai_config");
      expect(body.safeErrorSummary).toContain(".env.local");
      expect(JSON.stringify(body)).not.toContain("MINIMAX_API_KEY=");
      expect(listRecentProjects(10, {}, client)).toHaveLength(0);
    } finally {
      client.close();
    }
  });

  it("allows explicit fast-demo fallback and marks it as mock", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify({
            ...demoArticleInput,
            generationProfile: "fast_demo"
          })
        }),
        { client, env: {} }
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.projectId).toBeTruthy();
      expect(body.fallbackUsed).toBe(true);
      expect(body.generationMode).toBe("mock");
      expect(body.productionPack.mode).toBe("mock");
      expect(listRecentProjects(10, {}, client)).toHaveLength(1);
    } finally {
      client.close();
    }
  });

  it("rejects contaminated AI output before saving a project", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify(cleanArticleInput)
        }),
        {
          client,
          env: {
            AI_PROVIDER: "minimax",
            AI_MODEL: "MiniMax-M2.7",
            MINIMAX_API_KEY: "test-key",
            MINIMAX_BASE_URL: "https://api.minimaxi.com/v1"
          },
          chatCompletionExecutor: async () =>
            JSON.stringify({
              ...demoProductionPack,
              id: "ai-clean-output",
              mode: "ai",
              articleInput: cleanArticleInput,
              analysis: {
                ...demoProductionPack.analysis,
                summary: "这篇 mock 文章来自 Batch 02 占位模板"
              }
            })
        }
      );
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.failureReason).toBe("contaminated_output");
      expect(body.safeErrorSummary).toContain("analysis.summary");
      expect(listRecentProjects(10, {}, client)).toHaveLength(0);
    } finally {
      client.close();
    }
  });

  it("returns 400 for invalid ArticleInput", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify({
            ...demoArticleInput,
            rawText: ""
          })
        }),
        { client }
      );

      expect(response.status).toBe(400);
    } finally {
      client.close();
    }
  });
});
