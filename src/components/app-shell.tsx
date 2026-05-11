import Link from "next/link";

import { batchStatus } from "@/lib/demo-data";
import { SidebarNav } from "./sidebar-nav";
import { StatusBadge } from "./status-badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="返回项目总览">
          <span>独角兽早知道</span>
          <strong>Video Agent</strong>
        </Link>
        <SidebarNav />
      </aside>
      <div className="workspace">
        <div className="topbar">
          <div>
            <StatusBadge>{batchStatus.label}</StatusBadge>
            <p>{batchStatus.description}</p>
          </div>
          <span className="topbar-note">Local Demo Mode</span>
        </div>
        {children}
      </div>
    </div>
  );
}
