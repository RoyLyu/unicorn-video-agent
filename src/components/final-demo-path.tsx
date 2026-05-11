import Link from "next/link";

const finalDemoSteps = [
  {
    label: "Step 1: Quick Demo",
    description: "输入标题与内容类型",
    href: "/quick-demo"
  },
  {
    label: "Step 2: AI Generate",
    description: "调用 AI Agent 生成生产包",
    href: "/quick-demo"
  },
  {
    label: "Step 3: Showcase",
    description: "展示核心观点、脚本、分镜和风险",
    href: "/quick-demo"
  },
  {
    label: "Step 4: Export",
    description: "下载 production-pack.md",
    href: "/quick-demo"
  }
];

export function FinalDemoPath() {
  return (
    <section className="panel final-demo-path" aria-label="最终演示路径">
      <div className="section-heading">
        <h2>最终演示路径</h2>
        <Link className="ghost-button" href="/quick-demo">
          打开 Quick Demo
        </Link>
      </div>
      <div className="flow-grid">
        {finalDemoSteps.map((step) => (
          <Link className="flow-step" href={step.href} key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
