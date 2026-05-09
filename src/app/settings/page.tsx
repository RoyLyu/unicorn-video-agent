import { PageHeader } from "@/components/page-header";
import { settings } from "@/lib/demo-data";

export default function SettingsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="设置"
        description="项目配置占位页。当前只展示栏目名、视频号标准、版权策略和 Agent 模式。"
      />

      <section className="settings-grid">
        {settings.map((item) => (
          <div key={item.label} className="setting-item">
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
