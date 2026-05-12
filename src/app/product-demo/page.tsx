import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  frozenProductDemo,
  productDemoExportLinks,
  productDemoNavigationLinks
} from "@/lib/product-demo/frozen-product-demo";
import { getProductionStudioPayload } from "@/lib/server/production-studio-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function ProductDemoPage() {
  const payload = getFrozenProductDemoSafely();
  const summary = payload?.summary;
  const pack = payload?.effectiveProductionPack;

  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 13E / Internal Product Demo"
        title="内部产品入口"
        description="《独角兽早知道》财经文章 -> 微信视频号 AIGC 生产包。此页面只读取冻结成功项目，不调用 AI。"
        actions={
          <div className="action-row">
            {productDemoNavigationLinks.map((link) => (
              <Link className="ghost-button" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        }
      />

      <section className="panel">
        <div className="section-heading">
          <h2>冻结项目</h2>
          <StatusBadge tone={payload ? "green" : "red"}>
            {payload ? "available" : "database missing"}
          </StatusBadge>
        </div>
        <div className="metric-grid">
          <FrozenMetric label="projectId" value={frozenProductDemo.projectId} />
          <FrozenMetric label="agentRunId" value={frozenProductDemo.agentRunId} />
          <FrozenMetric label="fallbackUsed" value="false" />
          <FrozenMetric label="generationMode" value="ai" />
          <FrozenMetric label="ProductionPack.mode" value="ai" />
          <FrozenMetric label="prompt count = shot count" value="72" />
          <FrozenMetric label="shot_function_coverage_score" value="5/5" />
          <FrozenMetric label="Production Studio Gate" value="pass" />
        </div>
        {!payload ? (
          <div className="showcase-warning showcase-warning--blocked">
            本机 SQLite 暂时找不到冻结项目。请先恢复 `backups/` 中的 SQLite，或重新运行成功 audit 后再使用 Product Demo。
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>快捷入口</h2>
        <div className="action-row">
          {productDemoNavigationLinks.map((link) => (
            <Link className="primary-link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          {productDemoExportLinks.map((link) => (
            <Link className="ghost-button" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>展示重点</h2>
        <div className="card-grid">
          {frozenProductDemo.qualityHighlights.map((item) => (
            <article className="route-card" key={item}>
              <StatusBadge tone="green">ready</StatusBadge>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Production Studio 状态</h2>
        <ul className="info-list">
          <li>Density Profile：{payload?.densityProfile ?? "standard"}</li>
          <li>Gate：{payload?.latestGateRun?.status ?? frozenProductDemo.status.productionStudioGate}</li>
          <li>Lock：{payload?.lock?.locked ? "locked" : "unlocked"}</li>
          <li>90s shots：{summary?.shotCount90s ?? 24}</li>
          <li>180s shots：{summary?.shotCount180s ?? 48}</li>
          <li>Total prompts：{summary?.totalPrompts ?? frozenProductDemo.status.promptCount}</li>
          <li>Prompt Completeness：{scoreLabel(summary?.scores.promptFieldCompletenessScore)}</li>
          <li>Shot Function Coverage：{scoreLabel(summary?.scores.shotFunctionCoverageScore)}</li>
          <li>Production Method Coverage：{scoreLabel(summary?.scores.productionMethodScore)}</li>
          <li>Editing Readiness：{scoreLabel(summary?.scores.editingReadinessScore)}</li>
          <li>Report Completeness：{scoreLabel(summary?.scores.reportCompletenessScore)}</li>
        </ul>
      </section>

      <section className="panel">
        <h2>AIGC 制作规格摘要</h2>
        <div className="card-grid">
          <article className="route-card">
            <h3>Creative Direction</h3>
            <p>{pack?.creativeDirection?.creativeConcept ?? "见 Showcase 与 production-pack.md。"}</p>
            <p>{pack?.creativeDirection?.visualMetaphor ?? ""}</p>
          </article>
          <article className="route-card">
            <h3>Visual Style Bible</h3>
            <p>{pack?.visualStyleBible?.aspectRatio ?? "9:16 vertical"}</p>
            <p>{pack?.visualStyleBible?.imageType ?? "商业纪录片 / 科技财经视觉系统。"}</p>
          </article>
          <article className="route-card">
            <h3>Continuity Bible</h3>
            <p>{pack?.continuityBible?.environmentBible ?? "见完整 Production Report。"}</p>
          </article>
          <article className="route-card">
            <h3>交付边界</h3>
            <p>这是视频号生产包，不是最终成片视频。需人工完成事实核验和版权复核，不构成投资建议。</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function FrozenMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function scoreLabel(score: number | undefined) {
  return typeof score === "number" ? `${score}/5` : "5/5";
}

function getFrozenProductDemoSafely() {
  try {
    return getProductionStudioPayload(frozenProductDemo.projectId);
  } catch {
    return null;
  }
}
