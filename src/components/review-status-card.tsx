import { StatusBadge } from "./status-badge";
import type {
  ReviewStatus,
  ReviewSubStatus,
  ReviewSummary
} from "@/db/repositories/review-repository";

const statusTone: Record<ReviewStatus | ReviewSubStatus, "neutral" | "green" | "yellow" | "red" | "placeholder"> = {
  ready: "green",
  verified: "green",
  in_review: "yellow",
  blocked: "red",
  not_started: "placeholder"
};

export function ReviewStatusCard({ summary }: { summary: ReviewSummary }) {
  return (
    <section className="panel">
      <h2>审阅总览</h2>
      <div className="review-status-grid">
        <StatusItem label="总状态" value={summary.status} />
        <StatusItem
          label="Checklist"
          value={`${summary.checklistCompleted}/${summary.checklistTotal}`}
          tone={summary.checklistCompletion === 1 ? "green" : "yellow"}
        />
        <StatusItem label="事实核验" value={summary.factStatus} />
        <StatusItem label="版权复核" value={summary.rightsStatus} />
        <StatusItem
          label="发布文案"
          value={summary.publishCopyEdited ? "manual" : "fallback"}
          tone={summary.publishCopyEdited ? "green" : "placeholder"}
        />
      </div>
    </section>
  );
}

function StatusItem({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "yellow" | "red" | "placeholder";
}) {
  const resolvedTone = tone ?? statusTone[value as ReviewStatus | ReviewSubStatus] ?? "neutral";

  return (
    <div className="review-status-item">
      <span>{label}</span>
      <StatusBadge tone={resolvedTone}>{value}</StatusBadge>
    </div>
  );
}
