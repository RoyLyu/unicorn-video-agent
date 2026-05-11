export type AiFallbackReason =
  | "ai_config"
  | "timeout"
  | "schema"
  | "provider"
  | "unknown";

export type AiFallbackSummary = {
  fallbackReason: AiFallbackReason;
  safeErrorSummary: string;
};

export function classifyAiFallbackReason(
  errorMessage: string | null | undefined
): AiFallbackSummary {
  const message = errorMessage ?? "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("missing_provider") ||
    normalized.includes("missing_api_key") ||
    normalized.includes("missing_model") ||
    normalized.includes("unsupported_provider") ||
    normalized.includes("ai_provider") ||
    normalized.includes("openai_api_key") ||
    normalized.includes("minimax_api_key") ||
    normalized.includes("ai_model")
  ) {
    return {
      fallbackReason: "ai_config",
      safeErrorSummary:
        "AI 配置缺失或不完整，请检查 .env.local 中的 AI_PROVIDER、AI_MODEL、MINIMAX_API_KEY / OPENAI_API_KEY 和 baseURL 配置。"
    };
  }

  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("aborted") ||
    normalized.includes("aborterror") ||
    normalized.includes("request was aborted")
  ) {
    return {
      fallbackReason: "timeout",
      safeErrorSummary:
        "AI 请求超时或被中断，当前已使用 fallback 结果；可改用短标题或稍后重试。"
    };
  }

  if (
    normalized.includes("schema_error") ||
    normalized.includes("schema validation") ||
    normalized.includes("zod") ||
    normalized.includes("invalid")
  ) {
    return {
      fallbackReason: "schema",
      safeErrorSummary:
        "AI 输出未通过结构校验，当前已使用 fallback 结果；请在演示时说明该结果经过降级处理。"
    };
  }

  if (
    normalized.includes("provider_error") ||
    normalized.includes("provider") ||
    normalized.includes("minimax") ||
    normalized.includes("openai")
  ) {
    return {
      fallbackReason: "provider",
      safeErrorSummary:
        "AI 服务暂时不可用或返回异常，当前已使用 fallback 结果；请稍后重试。"
    };
  }

  return {
    fallbackReason: "unknown",
    safeErrorSummary:
      "AI 生成未完成，当前已使用 fallback 结果；请在演示时说明这是降级生产包。"
  };
}
