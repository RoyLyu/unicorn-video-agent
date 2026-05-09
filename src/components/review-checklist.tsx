import type { ReviewChecklistRecord } from "@/db/repositories/review-repository";

export function ReviewChecklist({
  checklist,
  onChange
}: {
  checklist: ReviewChecklistRecord[];
  onChange: (items: ReviewChecklistRecord[]) => void;
}) {
  return (
    <section className="panel">
      <h2>导出前 Checklist</h2>
      <div className="checklist-grid">
        {checklist.map((item) => (
          <label key={item.key} className="checklist-item">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={(event) =>
                onChange(
                  checklist.map((current) =>
                    current.key === item.key
                      ? { ...current, completed: event.target.checked }
                      : current
                  )
                )
              }
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
