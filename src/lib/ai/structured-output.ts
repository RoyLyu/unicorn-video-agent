import { zodTextFormat } from "openai/helpers/zod";
import { ZodError } from "zod";
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

export function cleanAiJsonText(text: string) {
  const withoutThinking = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = withoutThinking.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? withoutThinking;

  return extractFirstJsonObject(candidate);
}

export function parseAiJsonWithSchema<TSchema extends z.ZodType>(
  text: string,
  schema: TSchema
): z.infer<TSchema> {
  const candidates = extractJsonObjectCandidates(text);
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      return schema.parse(JSON.parse(candidate));
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof ZodError) {
    throw new AiSchemaError(
      lastError.issues
        .map((issue) => `path=${issue.path.join(".")} message=${issue.message}`)
        .join("; "),
      lastError
    );
  }

  if (lastError instanceof Error) {
    throw new AiSchemaError(lastError.message, lastError);
  }

  throw new AiSchemaError("AI output did not contain a parseable JSON object.");
}

export function parseAiJsonObject(text: string): unknown {
  const candidates = extractJsonObjectCandidates(text);
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw new AiSchemaError(lastError.message, lastError);
  }

  throw new AiSchemaError("AI output did not contain a parseable JSON object.");
}

function extractFirstJsonObject(text: string) {
  const candidate = extractJsonObjectCandidates(text)[0];

  if (!candidate) {
    throw new AiSchemaError("AI output did not contain a JSON object.");
  }

  return candidate;
}

function extractJsonObjectCandidates(text: string) {
  const normalized = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidateText = fenced?.[1]?.trim() ?? normalized;
  const candidates: string[] = [];

  for (let start = candidateText.indexOf("{"); start >= 0; start = candidateText.indexOf("{", start + 1)) {
    const candidate = extractBalancedJsonObject(candidateText, start);

    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates.sort((a, b) => b.length - a.length);
}

function extractBalancedJsonObject(text: string, start: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
}
