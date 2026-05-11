import type { ShowcaseScriptSection as ShowcaseScriptSectionType } from "@/lib/showcase/showcase-types";

export function ShowcaseScriptSection({
  script
}: {
  script: ShowcaseScriptSectionType;
}) {
  return (
    <article className="showcase-script-card">
      <div>
        <span>{script.duration}s</span>
        <h3>{script.title}</h3>
        <p>{script.hook}</p>
      </div>
      <ol>
        {script.lines.map((line) => (
          <li key={`${script.duration}-${line.timeRange}-${line.narration}`}>
            <time>{line.timeRange}</time>
            <p>{line.narration}</p>
            <small>
              画面：{line.visual} · 屏幕文字：{line.onScreenText}
            </small>
          </li>
        ))}
      </ol>
      <p className="showcase-script-closing">{script.closing}</p>
    </article>
  );
}
