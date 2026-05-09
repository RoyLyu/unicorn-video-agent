import { StatusBadge } from "./status-badge";

export function PageHeader({
  eyebrow = "Batch 01 / UI Shell",
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <StatusBadge>{eyebrow}</StatusBadge>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
