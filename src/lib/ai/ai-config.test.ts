import { describe, expect, it } from "vitest";

import { readAiConfig } from "./ai-config";

describe("AI config for MiniMax single-pack", () => {
  it("defaults to single_pack agent mode", () => {
    const config = readAiConfig({
      AI_PROVIDER: "minimax",
      AI_MODEL: "MiniMax-M2.7",
      MINIMAX_API_KEY: "minimax-key",
      MINIMAX_BASE_URL: "https://api.minimaxi.com/v1"
    });

    expect(config.ok).toBe(true);
    expect(config.ok && config.agentMode).toBe("single_pack");
  });

  it("prefers MiniMax key and base URL over OpenAI-compatible fallbacks", () => {
    const config = readAiConfig({
      AI_PROVIDER: "minimax",
      AI_MODEL: "MiniMax-M2.7",
      MINIMAX_API_KEY: "minimax-key",
      OPENAI_API_KEY: "openai-key",
      MINIMAX_BASE_URL: "https://api.minimaxi.com/v1",
      OPENAI_BASE_URL: "https://fallback.example/v1",
      AI_AGENT_MODE: "sequential",
      AI_REQUEST_TIMEOUT_MS: "180000",
      AI_MAX_TOKENS: "4000"
    });

    expect(config.ok).toBe(true);
    if (!config.ok) {
      return;
    }

    expect(config.provider).toBe("minimax");
    expect(config.apiKey).toBe("minimax-key");
    expect(config.baseURL).toBe("https://api.minimaxi.com/v1");
    expect(config.agentMode).toBe("sequential");
    expect(config.requestTimeoutMs).toBe(180000);
    expect(config.maxTokens).toBe(4000);
  });
});
