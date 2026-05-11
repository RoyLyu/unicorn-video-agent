import { StatusBadge } from "./status-badge";
import type { ShowcaseStoryboardItem } from "@/lib/showcase/showcase-types";

export function ShowcaseStoryboardSection({
  shots
}: {
  shots: ShowcaseStoryboardItem[];
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>分镜摘要</h2>
        <span>{shots.length} shots</span>
      </div>
      <div className="showcase-shot-list">
        {shots.map((shot) => (
          <article key={shot.id} className="showcase-shot">
            <div>
              <strong>{shot.timeRange}</strong>
              <span>{shot.scene}</span>
            </div>
            <p>{shot.narration}</p>
            <small>{shot.visual}</small>
            <div className="metadata-row">
              <StatusBadge>{shot.assetType}</StatusBadge>
              <StatusBadge tone={shot.rightsLevel}>{shot.rightsLevel}</StatusBadge>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
