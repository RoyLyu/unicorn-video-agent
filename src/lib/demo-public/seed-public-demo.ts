import {
  deleteDemoProjects,
  listDemoProjects,
  type RecentProject
} from "@/db/repositories/project-repository";
import { saveProductionPack } from "@/db/repositories/production-pack-repository";
import type { DbClient } from "@/db/index";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";

import { publicDemoArticles } from "./public-demo-articles";

export type PublicDemoSeedResult = {
  projectIds: string[];
  projects: RecentProject[];
};

export function seedPublicDemoProjects(client?: DbClient): PublicDemoSeedResult {
  deleteDemoProjects(client);

  const projectIds = publicDemoArticles.map((articleInput) => {
    const productionPack = runMockPipeline(articleInput);
    const saved = saveProductionPack(productionPack, client, {
      isDemo: true,
      status: "public_demo"
    });

    return saved.project.id;
  });

  return {
    projectIds,
    projects: listDemoProjects(10, client)
  };
}
