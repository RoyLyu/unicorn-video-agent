"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import {
  ArticleInputSchema,
  type GenerationMode,
  type ProductionPack
} from "@/lib/schemas/production-pack";
import { saveProductionPack } from "@/lib/storage/production-pack-storage";

type MockProductionPackResponse = {
  projectId: string;
  productionPack: ProductionPack;
  fallbackUsed?: boolean;
  generationMode?: GenerationMode;
};

export function ArticleInputForm({
  defaultGenerationMode = "mock"
}: {
  defaultGenerationMode?: GenerationMode;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>(defaultGenerationMode);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    overrideMode?: GenerationMode
  ) {
    event.preventDefault();
    const selectedMode = overrideMode ?? generationMode;
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const targetDurations = formData
      .getAll("targetDurations")
      .map((value) => Number(value));

    const parsed = ArticleInputSchema.safeParse({
      title: formData.get("title"),
      rawText: formData.get("rawText"),
      sourceUrl: formData.get("sourceUrl"),
      publishDate: formData.get("publishDate"),
      sourceName: formData.get("sourceName"),
      industryTags: String(formData.get("industryTags") ?? "")
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      targetDurations
    });

    if (!parsed.success) {
      setError("请检查标题、正文、链接、日期、行业标签和目标时长。");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint =
        selectedMode === "ai"
          ? "/api/ai/production-pack"
          : "/api/mock/production-pack";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedMode === "ai"
            ? { ...parsed.data, generationProfile: "real_output" }
            : parsed.data
        )
      });

      if (!response.ok) {
        setError(
          selectedMode === "ai"
            ? "AI Agent 真实生成失败。请检查配置或输入完整事实材料；Mock 只用于开发测试。"
            : "Mock 生产包生成失败，请检查输入。"
        );
        return;
      }

      const result = (await response.json()) as MockProductionPackResponse;
      saveProductionPack(result.productionPack);
      router.push(`/projects/${result.projectId}/analysis`);
    } catch {
      setError(
          selectedMode === "ai"
          ? "AI Agent 请求失败。请检查配置或输入完整事实材料。"
          : "本地 mock 请求失败。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMockFallback(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    if (!form) {
      return;
    }

    handleSubmit(
      {
        preventDefault: () => undefined,
        currentTarget: form
      } as React.FormEvent<HTMLFormElement>,
      "mock"
    );
  }

  return (
    <section className="panel">
      <div className="notice">
        当前为 Batch 12A：AI Agent 使用严格真实输出模式，不允许 fallback/mock 伪装为成品。Mock 仅用于开发测试。要生成可投入使用的报告，必须输入完整文章正文或事实材料。
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <fieldset className="field fieldset field--full">
          <legend>生成模式</legend>
          <label>
            <input
              name="generationMode"
              type="radio"
              value="mock"
              checked={generationMode === "mock"}
              onChange={() => setGenerationMode("mock")}
            />
            Mock
          </label>
          <label>
            <input
              name="generationMode"
              type="radio"
              value="ai"
              checked={generationMode === "ai"}
              onChange={() => setGenerationMode("ai")}
            />
            AI Agent
          </label>
        </fieldset>
        <div className="field">
          <label htmlFor="title">公众号文章标题</label>
          <input id="title" name="title" defaultValue={demoArticleInput.title} />
        </div>
        <div className="field">
          <label htmlFor="sourceUrl">文章链接</label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            defaultValue={demoArticleInput.sourceUrl}
          />
        </div>
        <div className="field">
          <label htmlFor="publishDate">发布日期</label>
          <input
            id="publishDate"
            name="publishDate"
            type="date"
            defaultValue={demoArticleInput.publishDate}
          />
        </div>
        <div className="field">
          <label htmlFor="sourceName">来源</label>
          <input
            id="sourceName"
            name="sourceName"
            defaultValue={demoArticleInput.sourceName}
          />
        </div>
        <div className="field">
          <label htmlFor="industryTags">行业标签</label>
          <input
            id="industryTags"
            name="industryTags"
            defaultValue={demoArticleInput.industryTags.join("，")}
          />
        </div>
        <fieldset className="field fieldset">
          <legend>目标时长</legend>
          <label>
            <input
              name="targetDurations"
              type="checkbox"
              value="90"
              defaultChecked
            />
            90s
          </label>
          <label>
            <input
              name="targetDurations"
              type="checkbox"
              value="180"
              defaultChecked
            />
            180s
          </label>
        </fieldset>
        <div className="field field--full">
          <label htmlFor="rawText">公众号文章正文</label>
          <textarea
            id="rawText"
            name="rawText"
            defaultValue={demoArticleInput.rawText}
          />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="form-actions">
          <button className="primary-link" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? generationMode === "ai"
                ? "AI Agent 生成中..."
                : "Mock 生成中..."
              : generationMode === "ai"
                ? "AI Agent 生成"
                : "生成 Mock 生产包"}
          </button>
          {error && generationMode === "ai" ? (
            <button
              className="ghost-button"
              type="button"
              disabled={isSubmitting}
              onClick={handleMockFallback}
            >
              开发测试：改用 Mock
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
