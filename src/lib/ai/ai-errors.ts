export type AiErrorCode =
  | "missing_provider"
  | "unsupported_provider"
  | "missing_api_key"
  | "missing_model"
  | "provider_error"
  | "schema_error";

export class AiPipelineError extends Error {
  constructor(
    message: string,
    public readonly code: AiErrorCode,
    public readonly causeValue?: unknown
  ) {
    super(message);
    this.name = "AiPipelineError";
  }
}

export class AiConfigError extends AiPipelineError {
  constructor(message: string, code: Exclude<AiErrorCode, "provider_error" | "schema_error">) {
    super(message, code);
    this.name = "AiConfigError";
  }
}

export class AiProviderError extends AiPipelineError {
  constructor(message: string, causeValue?: unknown) {
    super(message, "provider_error", causeValue);
    this.name = "AiProviderError";
  }
}

export class AiSchemaError extends AiPipelineError {
  constructor(message: string, causeValue?: unknown) {
    super(message, "schema_error", causeValue);
    this.name = "AiSchemaError";
  }
}

export function normalizeAiError(error: unknown) {
  if (error instanceof AiPipelineError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      code: "provider_error" as const,
      message: error.message
    };
  }

  return {
    name: "UnknownAiError",
    code: "provider_error" as const,
    message: String(error)
  };
}
