"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  buildQuickDemoShowcaseUrl,
  createTitleOnlyArticleInput,
  quickDemoContentTypes,
  type QuickDemoContentType
} from "@/lib/quick-demo/title-only-article";
import type { GenerationMode, ProductionPack } from "@/lib/schemas/production-pack";

type AiProductionPackResponse = {
  projectId: string;
  productionPack: ProductionPack;
  agentRunId?: string;
  fallbackUsed?: boolean;
  generationMode?: GenerationMode;
  fallbackReason?: "ai_config" | "timeout" | "schema" | "provider" | "unknown";
  safeErrorSummary?: string;
};

export function QuickDemoForm() {
  const router = useRouter();
  const [contentType, setContentType] =
    useState<QuickDemoContentType>("ipo");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const articleInput = createTitleOnlyArticleInput({
        title: String(formData.get("title") ?? ""),
        contentType,
        industryTagsText: String(formData.get("industryTags") ?? "")
      });

      const response = await fetch("/api/ai/production-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleInput)
      });

      if (!response.ok) {
        setError("Title-only Demo 生成失败。请稍后重试，或使用完整文章输入流程。");
        return;
      }

      const result = (await response.json()) as AiProductionPackResponse;
      const showcaseUrl = buildQuickDemoShowcaseUrl(result.projectId);

      if (result.fallbackUsed) {
        setStatusMessage(createFallbackMessage(result));
        window.setTimeout(() => router.push(showcaseUrl), 1200);
        return;
      }

      router.push(showcaseUrl);
    } catch {
      setError("请填写标题。行业标签可留空，系统会按内容类型使用默认标签。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel quick-demo-panel">
      <div className="notice">
        当前为 Title-only Demo：适合快速展示 AI Agent 工作流，不适合正式发布。正式生产仍应输入完整文章正文。
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field field--full">
          <label htmlFor="quick-demo-title">标题</label>
          <input
            id="quick-demo-title"
            name="title"
            placeholder="例如：虚构家庭医疗公司冲刺上市"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="quick-demo-content-type">内容类型</label>
          <select
            id="quick-demo-content-type"
            name="contentType"
            value={contentType}
            onChange={(event) =>
              setContentType(event.currentTarget.value as QuickDemoContentType)
            }
          >
            {quickDemoContentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="quick-demo-industry-tags">行业标签</label>
          <input
            id="quick-demo-industry-tags"
            name="industryTags"
            placeholder="可选，例如：医疗，IPO"
          />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
        <div className="form-actions">
          <button className="primary-link" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "AI Agent 生成中..." : "生成并进入 Showcase"}
          </button>
        </div>
      </form>
    </section>
  );
}

function createFallbackMessage(result: AiProductionPackResponse) {
  if (result.fallbackReason === "ai_config") {
    return "当前使用 fallback 结果。请检查 .env.local 中的 AI provider、model、服务端 API key 和 baseURL 配置。";
  }

  if (result.fallbackReason === "timeout") {
    return "当前使用 fallback 结果。AI 请求超时，可改用短标题或稍后重试。";
  }

  return result.safeErrorSummary
    ? `当前使用 fallback 结果。${result.safeErrorSummary}`
    : "当前使用 fallback 结果。系统将继续进入 Showcase，演示时请说明这是降级生产包。";
}
