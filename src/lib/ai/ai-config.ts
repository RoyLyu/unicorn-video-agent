import { AiConfigError } from "./ai-errors";

export type AiEnvironment = Partial<Record<string, string | undefined>>;

export type AiConfig =
  | {
      ok: true;
      provider: "minimax" | "openai";
      model: string;
      apiKey: string;
      baseURL: string;
      agentMode: "single_pack" | "sequential";
      requestTimeoutMs: number;
      maxTokens: number;
    }
  | {
      ok: false;
      error: AiConfigError;
      agentMode: "single_pack" | "sequential";
    };

export function readAiConfig(env: AiEnvironment = process.env): AiConfig {
  const provider = env.AI_PROVIDER?.trim();
  const model = env.AI_MODEL?.trim();
  const agentMode = env.AI_AGENT_MODE === "sequential" ? "sequential" : "single_pack";
  const requestTimeoutMs = parsePositiveInt(env.AI_REQUEST_TIMEOUT_MS, 180000);
  const maxTokens = parsePositiveInt(env.AI_MAX_TOKENS, 4000);

  if (!provider) {
    return {
      ok: false,
      agentMode,
      error: new AiConfigError("AI_PROVIDER is required.", "missing_provider")
    };
  }

  if (provider !== "openai" && provider !== "minimax") {
    return {
      ok: false,
      agentMode,
      error: new AiConfigError(
        `Unsupported AI_PROVIDER: ${provider}.`,
        "unsupported_provider"
      )
    };
  }

  const apiKey =
    provider === "minimax"
      ? env.MINIMAX_API_KEY?.trim() || env.OPENAI_API_KEY?.trim()
      : env.OPENAI_API_KEY?.trim();
  const baseURL =
    provider === "minimax"
      ? env.MINIMAX_BASE_URL?.trim() || env.OPENAI_BASE_URL?.trim() || "https://api.minimaxi.com/v1"
      : env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";

  if (!apiKey) {
    return {
      ok: false,
      agentMode,
      error: new AiConfigError("AI API key is required.", "missing_api_key")
    };
  }

  if (!model) {
    return {
      ok: false,
      agentMode,
      error: new AiConfigError("AI_MODEL is required.", "missing_model")
    };
  }

  if (!baseURL) {
    return {
      ok: false,
      agentMode,
      error: new AiConfigError("AI base URL is required.", "missing_base_url")
    };
  }

  return {
    ok: true,
    provider,
    model,
    apiKey,
    baseURL,
    agentMode,
    requestTimeoutMs,
    maxTokens
  };
}

export function readDefaultGenerationMode(env: AiEnvironment = process.env) {
  return env.GENERATION_MODE === "ai" ? "ai" : "mock";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
