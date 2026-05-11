import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";

import { handleAiProductionPackRequest } from "./route";

describe("POST /api/ai/production-pack", () => {
  it("uses single-pack mode by default when AI env is configured", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify(demoArticleInput)
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
            ...demoArticleInput,
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

  it("returns fallback production pack when AI env is missing", async () => {
    const client = createTestDbClient();

    try {
      const response = await handleAiProductionPackRequest(
        new Request("http://localhost/api/ai/production-pack", {
          method: "POST",
          body: JSON.stringify(demoArticleInput)
        }),
        { client }
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.projectId).toBeTruthy();
      expect(body.agentRunId).toBeTruthy();
      expect(body.fallbackUsed).toBe(true);
      expect(body.generationMode).toBe("mock");
      expect(body.productionPack.mode).toBe("mock");
      expect(body.fallbackReason).toBe("ai_config");
      expect(body.safeErrorSummary).toContain(".env.local");
      expect(JSON.stringify(body)).not.toContain("MINIMAX_API_KEY=");
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
