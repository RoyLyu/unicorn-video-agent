type StatusTone = "neutral" | "green" | "yellow" | "red" | "placeholder";

const toneClass: Record<StatusTone, string> = {
  neutral: "status-badge status-badge--neutral",
  green: "status-badge status-badge--green",
  yellow: "status-badge status-badge--yellow",
  red: "status-badge status-badge--red",
  placeholder: "status-badge status-badge--placeholder"
};

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: StatusTone;
}) {
  return <span className={toneClass[tone]}>{children}</span>;
}
