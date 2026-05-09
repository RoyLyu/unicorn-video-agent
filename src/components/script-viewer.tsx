import type { ScriptResult } from "@/lib/schemas/production-pack";

export function ScriptViewer({ scripts }: { scripts: ScriptResult }) {
  return (
    <section className="script-grid">
      <ScriptBlock title="90s 脚本" script={scripts.video90s} />
      <ScriptBlock title="180s 脚本" script={scripts.video180s} />
    </section>
  );
}

function ScriptBlock({
  title,
  script
}: {
  title: string;
  script: ScriptResult["video90s"] | ScriptResult["video180s"];
}) {
  return (
    <article className="script-card">
      <h2>{title}</h2>
      <p>{script.hook}</p>
      {script.lines.map((line) => (
        <div key={line.timeRange} className="script-line">
          <time>{line.timeRange}</time>
          <p>{line.narration}</p>
          <p>{line.visual}</p>
          <strong>{line.onScreenText}</strong>
        </div>
      ))}
      <p>{script.closing}</p>
    </article>
  );
}
