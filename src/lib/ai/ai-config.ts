import { AiConfigError } from "./ai-errors";

export type AiEnvironment = Partial<Record<string, string | undefined>>;

export type AiConfig =
  | {
      ok: true;
      provider: "openai";
      model: string;
      apiKey: string;
    }
  | {
      ok: false;
      error: AiConfigError;
    };

export function readAiConfig(env: AiEnvironment = process.env): AiConfig {
  const provider = env.AI_PROVIDER?.trim();
  const apiKey = env.OPENAI_API_KEY?.trim();
  const model = env.AI_MODEL?.trim();

  if (!provider) {
    return {
      ok: false,
      error: new AiConfigError("AI_PROVIDER is required.", "missing_provider")
    };
  }

  if (provider !== "openai") {
    return {
      ok: false,
      error: new AiConfigError(
        `Unsupported AI_PROVIDER: ${provider}.`,
        "unsupported_provider"
      )
    };
  }

  if (!apiKey) {
    return {
      ok: false,
      error: new AiConfigError("OPENAI_API_KEY is required.", "missing_api_key")
    };
  }

  if (!model) {
    return {
      ok: false,
      error: new AiConfigError("AI_MODEL is required.", "missing_model")
    };
  }

  return {
    ok: true,
    provider,
    model,
    apiKey
  };
}

export function readDefaultGenerationMode(env: AiEnvironment = process.env) {
  return env.GENERATION_MODE === "ai" ? "ai" : "mock";
}
