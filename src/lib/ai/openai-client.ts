import OpenAI from "openai";

import type { AiConfig } from "./ai-config";

export function createOpenAiClient(config: Extract<AiConfig, { ok: true }>) {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });
}
