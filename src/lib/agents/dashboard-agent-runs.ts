import type { RecentProject } from "@/db/repositories/project-repository";
import type { AgentRunSummary } from "@/db/repositories/agent-run-repository";

export type ProjectWithAgentRun = RecentProject & {
  latestAgentRun: AgentRunSummary | null;
};

export function attachLatestAgentRunStatus(
  projects: RecentProject[],
  lookup: (projectId: string) => AgentRunSummary | null
): ProjectWithAgentRun[] {
  return projects.map((project) => ({
    ...project,
    latestAgentRun: lookup(project.id)
  }));
}
