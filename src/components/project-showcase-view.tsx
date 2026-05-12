import Link from "next/link";

import { ShowcaseAgentSummary } from "./showcase-agent-summary";
import { ShowcaseRiskSummary } from "./showcase-risk-summary";
import { ShowcaseScriptSection } from "./showcase-script-section";
import { ShowcaseStoryboardSection } from "./showcase-storyboard-section";
import { StatusBadge } from "./status-badge";
import type { ShowcaseViewModel } from "@/lib/showcase/showcase-types";

export function ProjectShowcaseView({
  showcase
}: {
  showcase: ShowcaseViewModel;
}) {
  return (
    <div className="showcase-page">
      <section className="showcase-hero">
        <div>
          <div className="metadata-row">
            <StatusBadge tone={showcase.generation.productionPackMode === "ai" ? "green" : "neutral"}>
              {showcase.generation.generationModeLabel}
            </StatusBadge>
            {showcase.isDemo ? (
              <StatusBadge tone="placeholder">Demo Mode</StatusBadge>
            ) : (
              <StatusBadge tone="green">AI Demo</StatusBadge>
            )}
            <StatusBadge tone={showcase.generation.fallbackUsed ? "yellow" : "green"}>
              fallback: {showcase.generation.fallbackUsed ? "yes" : "no"}
            </StatusBadge>
          </div>
          <h1>{showcase.projectTitle}</h1>
          <p>{showcase.coreSummary}</p>
          <div className="showcase-warning">
            当前为视频号生产包展示，不是最终成片视频。{showcase.disclaimer}
          </div>
          {showcase.fallbackWarning ? (
            <div className="showcase-warning showcase-warning--fallback">
              {showcase.fallbackWarning}
            </div>
          ) : null}
          {showcase.fallbackBlockedWarning ? (
            <div className="showcase-warning showcase-warning--blocked">
              {showcase.fallbackBlockedWarning}
            </div>
          ) : null}
          {showcase.titleOnlyWarning ? (
            <div className="showcase-warning showcase-warning--title-only">
              {showcase.titleOnlyWarning}
            </div>
          ) : null}
          {showcase.titleOnlyFactReportWarning ? (
            <div className="showcase-warning showcase-warning--title-only">
              {showcase.titleOnlyFactReportWarning}
            </div>
          ) : null}
          <div className="showcase-warning">
            <strong>Shot / Prompt Gate：</strong>
            profile: {showcase.productionStudioGate.densityProfile} / lock:{" "}
            {showcase.productionStudioGate.lockStatus} / last gate:{" "}
            {showcase.productionStudioGate.latestGateStatus} / edits:{" "}
            {showcase.productionStudioGate.editedCount} /{" "}
            90s: {showcase.productionStudioGate.shotCount90s} shots / 180s:{" "}
            {showcase.productionStudioGate.shotCount180s} shots / prompts:{" "}
            {showcase.productionStudioGate.promptCount} / alignment:{" "}
            {showcase.productionStudioGate.alignment}
          </div>
          <div className="showcase-warning">
            <strong>AIGC Production Contract：</strong>
            Visual Bible {showcase.productionStudioGate.visualBibleScore}/5 / Continuity{" "}
            {showcase.productionStudioGate.continuityScore}/5 / Shot Function{" "}
            {showcase.productionStudioGate.shotFunctionCoverageScore}/5 / Production Method{" "}
            {showcase.productionStudioGate.productionMethodScore}/5 / Editing{" "}
            {showcase.productionStudioGate.editingReadinessScore}/5 / Prompt Completeness{" "}
            {showcase.productionStudioGate.promptFieldCompletenessScore}/5 / Report Completeness{" "}
            {showcase.productionStudioGate.reportCompletenessScore}/5
          </div>
          <div className="showcase-warning">
            Prompt 字段完整性：{showcase.productionStudioGate.promptFieldCompletenessScore >= 4 ? "pass" : "fail"} / 报告字段完整性：{showcase.productionStudioGate.reportFieldCompleteness}
          </div>
          <div className="showcase-warning">
            <strong>Shot Function Coverage：</strong>
            {showcase.productionStudioGate.shotFunctionCoverageScore >= 4 ? "pass" : "fail"} / 90s:{" "}
            {formatCountMap(showcase.productionStudioGate.shotFunctionDistribution90s)} / 180s:{" "}
            {formatCountMap(showcase.productionStudioGate.shotFunctionDistribution180s)}
            {showcase.productionStudioGate.missingFunctions90s.length ||
            showcase.productionStudioGate.missingFunctions180s.length ||
            showcase.productionStudioGate.overRepeatedFunctions90s.length ||
            showcase.productionStudioGate.overRepeatedFunctions180s.length
              ? ` / missing: ${[
                  ...showcase.productionStudioGate.missingFunctions90s,
                  ...showcase.productionStudioGate.missingFunctions180s
                ].join(" / ") || "none"} / overRepeated: ${[
                  ...showcase.productionStudioGate.overRepeatedFunctions90s,
                  ...showcase.productionStudioGate.overRepeatedFunctions180s
                ].join(" / ") || "none"}`
              : null}
          </div>
          {showcase.productionStudioGate.lockStatus === "locked" ? (
            <div className="showcase-warning showcase-warning--ready">
              Production Studio 已锁版：已锁定交付版本。
            </div>
          ) : null}
          {showcase.productionStudioGate.needsFix ? (
            <div className="showcase-warning showcase-warning--blocked">
              需要重跑 / 人工修正
              {showcase.productionStudioGate.fixReasons.length ? `：${showcase.productionStudioGate.fixReasons.join("；")}` : null}
            </div>
          ) : null}
        </div>
        <div className="showcase-cta">
          {showcase.blockProductionDownload ? (
            <span className="primary-link is-disabled" aria-disabled="true">
              下载完整 production-pack.md
            </span>
          ) : (
            <a className="primary-link" href={showcase.links.downloadProductionPack}>
              下载完整 production-pack.md
            </a>
          )}
          <a className="ghost-button" href={showcase.links.downloadProductionPack}>
            查看完整 Production Report
          </a>
          {showcase.blockProductionDownload ? (
            <Link className="ghost-button" href={showcase.regenerateUrl}>
              重新生成真实 AI 版本
            </Link>
          ) : null}
          <Link className="ghost-button" href={showcase.links.productionStudio}>
            Production Studio
          </Link>
          <Link className="ghost-button" href={showcase.links.review}>
            进入 Review
          </Link>
          <Link className="ghost-button" href={showcase.links.export}>
            进入 Export
          </Link>
          <Link className="ghost-button" href={showcase.links.agentRuns}>
            进入 Agent Runs
          </Link>
        </div>
      </section>

      <ShowcaseAgentSummary
        generation={showcase.generation}
        agentSummary={showcase.agentSummary}
      />

      <section className="showcase-grid">
        <article className="panel showcase-highlight">
          <h2>Creative Concept</h2>
          <p>{showcase.creativeDirection.creativeConcept}</p>
          <p>{showcase.creativeDirection.visualMetaphor}</p>
          <p>{showcase.creativeDirection.mainVisualMotif}</p>
        </article>
        <article className="panel">
          <h2>Visual / Continuity Bible</h2>
          <p>{showcase.visualBibleSummary}</p>
          <p>{showcase.continuityBibleSummary}</p>
          <details className="showcase-details">
            <summary>Shot Function / Production Method 分布</summary>
            <PromptList
              title="Shot Function"
              items={Object.entries(showcase.productionStudioGate.shotFunctionCounts).map(([key, value]) => `${key}: ${value}`)}
            />
            <PromptList
              title="Production Method"
              items={Object.entries(showcase.productionStudioGate.productionMethodCounts).map(([key, value]) => `${key}: ${value}`)}
            />
          </details>
        </article>
      </section>

      <section className="showcase-grid">
        <article className="panel showcase-highlight">
          <h2>核心观点</h2>
          <ul className="info-list">
            {showcase.coreViewpoints.map((viewpoint) => (
              <li key={viewpoint}>{viewpoint}</li>
            ))}
          </ul>
          <p>{showcase.videoAngle}</p>
          <p>{showcase.audienceTakeaway}</p>
        </article>

        <article className="panel">
          <h2>视频号标题候选</h2>
          <ol className="showcase-title-list">
            {showcase.publishCopy.titleCandidates.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ol>
          <h3>封面标题</h3>
          <p>{showcase.publishCopy.coverTitle}</p>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>脚本展示</h2>
          <span>90s / 180s</span>
        </div>
        <div className="showcase-script-grid">
          <ShowcaseScriptSection script={showcase.scripts.video90s} />
          <ShowcaseScriptSection script={showcase.scripts.video180s} />
        </div>
      </section>

      <ShowcaseStoryboardSection shots={showcase.storyboard} />

      <section className="showcase-grid">
        <article className="panel">
          <h2>Prompt 摘要</h2>
          <p>
            图像 Prompt {showcase.promptSummary.imagePromptCount} 条，视频 Prompt{" "}
            {showcase.promptSummary.videoPromptCount} 条，素材搜索线索{" "}
            {showcase.promptSummary.searchLeadCount} 条。
          </p>
          <details className="showcase-details">
            <summary>展开 Prompt 和搜索线索</summary>
            <PromptList title="Image Prompt" items={showcase.promptSummary.imagePrompts} />
            <PromptList title="Video Prompt" items={showcase.promptSummary.videoPrompts} />
            <PromptList title="Search Lead" items={showcase.promptSummary.searchLeads} />
          </details>
        </article>

        <article className="panel">
          <h2>发布文案</h2>
          <StatusBadge tone={showcase.publishCopy.isManual ? "green" : "placeholder"}>
            {showcase.publishCopy.isManual ? "人工编辑" : "确定性 fallback"}
          </StatusBadge>
          <p className="showcase-publish-copy">{showcase.publishCopy.publishText}</p>
          <p>{showcase.publishCopy.tags.map((tag) => `#${tag.replace(/^#/, "")}`).join(" ")}</p>
          <p>{showcase.publishCopy.riskNotice}</p>
        </article>
      </section>

      <ShowcaseRiskSummary riskSummary={showcase.riskSummary} />
    </div>
  );
}

function formatCountMap(values: Record<string, number>) {
  const entries = Object.entries(values).filter(([, value]) => value > 0);

  return entries.length
    ? entries.map(([key, value]) => `${key}:${value}`).join(" / ")
    : "none";
}

function PromptList({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <h3>{title}</h3>
      <ul className="info-list">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </>
  );
}
