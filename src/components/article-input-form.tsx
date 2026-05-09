"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { ArticleInputSchema, type ProductionPack } from "@/lib/schemas/production-pack";
import { saveProductionPack } from "@/lib/storage/production-pack-storage";

type MockProductionPackResponse = {
  projectId: string;
  productionPack: ProductionPack;
};

export function ArticleInputForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const response = await fetch("/api/mock/production-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });

      if (!response.ok) {
        setError("Mock 生产包生成失败，请检查输入。");
        return;
      }

      const result = (await response.json()) as MockProductionPackResponse;
      saveProductionPack(result.productionPack);
      router.push(`/projects/${result.projectId}/analysis`);
    } catch {
      setError("本地 mock 请求失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <div className="notice">
        当前为 Batch 06 本地 mock，会写入 SQLite；不接真实 AI，不代表真实生成结果。
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
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
            {isSubmitting ? "生成中..." : "生成 Mock 生产包"}
          </button>
        </div>
      </form>
    </section>
  );
}
