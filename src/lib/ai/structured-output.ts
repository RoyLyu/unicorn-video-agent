import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

import type { AgentSlug } from "@/lib/agents/agent-run-types";

import type { AiConfig } from "./ai-config";
import { AiProviderError, AiSchemaError } from "./ai-errors";
import { createOpenAiClient } from "./openai-client";

export type StructuredOutputRequest<TSchema extends z.ZodType> = {
  config: Extract<AiConfig, { ok: true }>;
  agentSlug: AgentSlug;
  schemaName: string;
  schema: TSchema;
  systemPrompt: string;
  userInput: unknown;
};

export async function requestStructuredOutput<TSchema extends z.ZodType>(
  request: StructuredOutputRequest<TSchema>
): Promise<z.infer<TSchema>> {
  try {
    const client = createOpenAiClient(request.config);
    const response = await client.responses.parse({
      model: request.config.model,
      input: [
        {
          role: "system",
          content: request.systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(request.userInput)
        }
      ],
      text: {
        format: zodTextFormat(request.schema, request.schemaName)
      }
    });

    if (!response.output_parsed) {
      throw new AiSchemaError(`${request.agentSlug} returned no parsed output.`);
    }

    return request.schema.parse(response.output_parsed);
  } catch (error) {
    if (error instanceof AiSchemaError) {
      throw error;
    }

    if (error instanceof Error && /parse|schema|zod/i.test(error.message)) {
      throw new AiSchemaError(error.message, error);
    }

    throw new AiProviderError(
      error instanceof Error ? error.message : String(error),
      error
    );
  }
}
