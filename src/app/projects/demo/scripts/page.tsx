import { PageHeader } from "@/components/page-header";
import { scripts } from "@/lib/demo-data";

export default function ScriptsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="视频号脚本"
        description="展示 90s 与 180s 两套假脚本。Batch 01 不调用 AI，也不生成真实业务脚本。"
      />

      <section className="script-grid">
        <ScriptBlock title="90s 脚本" lines={scripts.video90s} />
        <ScriptBlock title="180s 脚本" lines={scripts.video180s} />
      </section>
    </main>
  );
}

function ScriptBlock({
  title,
  lines
}: {
  title: string;
  lines: Array<{ time: string; narration: string; visual: string }>;
}) {
  return (
    <article className="script-card">
      <h2>{title}</h2>
      {lines.map((line) => (
        <div key={line.time} className="script-line">
          <time>{line.time}</time>
          <p>{line.narration}</p>
          <p>{line.visual}</p>
        </div>
      ))}
    </article>
  );
}
