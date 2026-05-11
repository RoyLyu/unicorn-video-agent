import Link from "next/link";

const projectNavItems = [
  { label: "Showcase", segment: "showcase" },
  { label: "Production Studio", segment: "production-studio" },
  { label: "Analysis", segment: "analysis" },
  { label: "Scripts", segment: "scripts" },
  { label: "Shots", segment: "shots" },
  { label: "Rights", segment: "rights" },
  { label: "Agent Runs", segment: "agent-runs" },
  { label: "Review", segment: "review" },
  { label: "Export", segment: "export" }
];

export function ProjectNav({ projectId }: { projectId: string }) {
  return (
    <nav className="project-nav" aria-label="项目页面导航">
      {projectNavItems.map((item) => (
        <Link key={item.segment} href={`/projects/${projectId}/${item.segment}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
