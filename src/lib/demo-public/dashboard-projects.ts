import type { RecentProject } from "@/db/repositories/project-repository";

export function splitDashboardProjects(
  demoProjects: RecentProject[],
  recentProjects: RecentProject[]
) {
  const demoIds = new Set(demoProjects.map((project) => project.id));

  return {
    demoProjects,
    recentProjects: recentProjects.filter(
      (project) => !project.isDemo && !demoIds.has(project.id)
    )
  };
}
