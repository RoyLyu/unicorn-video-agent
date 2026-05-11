import {
  deleteDemoProjects,
  listDemoProjects,
  type RecentProject
} from "@/db/repositories/project-repository";
import type { DbClient } from "@/db/index";
import { runTrackedMockPipeline } from "@/lib/agents/tracked-mock-pipeline";

import { publicDemoArticles } from "./public-demo-articles";

export type PublicDemoSeedResult = {
  projectIds: string[];
  projects: RecentProject[];
};

export function seedPublicDemoProjects(client?: DbClient): PublicDemoSeedResult {
  deleteDemoProjects(client);

  const projectIds = publicDemoArticles.map((articleInput) => {
    const result = runTrackedMockPipeline(articleInput, {
      client,
      saveOptions: {
        isDemo: true,
        status: "public_demo"
      }
    });

    return result.saved.project.id;
  });

  return {
    projectIds,
    projects: listDemoProjects(10, client)
  };
}
