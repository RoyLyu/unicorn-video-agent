import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { saveProductionPack } from "@/db/repositories/production-pack-repository";
import {
  deleteDemoProjects,
  listDemoProjects,
  listRecentProjects
} from "@/db/repositories/project-repository";
import {
  publicDemoArticles,
  publicDemoForbiddenTerms
} from "./public-demo-articles";
import { seedPublicDemoProjects } from "./seed-public-demo";

describe("Batch 06 public demo seed", () => {
  it("creates exactly two public demo projects marked as demo", () => {
    const client = createTestDbClient();

    try {
      const result = seedPublicDemoProjects(client);
      const demoProjects = listDemoProjects(10, client);

      expect(result.projectIds).toHaveLength(2);
      expect(result.projects).toHaveLength(2);
      expect(demoProjects).toHaveLength(2);
      expect(demoProjects.every((project) => project.isDemo)).toBe(true);
      expect(demoProjects.every((project) => project.status === "public_demo")).toBe(
        true
      );
    } finally {
      client.close();
    }
  });

  it("does not use configured real company or real asset terms", () => {
    const demoText = JSON.stringify(publicDemoArticles);

    for (const forbiddenTerm of publicDemoForbiddenTerms) {
      expect(demoText).not.toContain(forbiddenTerm);
    }
  });

  it("reset deletes demo projects without deleting ordinary projects", () => {
    const client = createTestDbClient();

    try {
      const normalProject = saveProductionPack(runMockPipeline(demoArticleInput), client);
      seedPublicDemoProjects(client);
      const deleted = deleteDemoProjects(client);
      const recentWithoutDemo = listRecentProjects(10, { includeDemo: false }, client);

      expect(deleted).toBe(2);
      expect(listDemoProjects(10, client)).toHaveLength(0);
      expect(recentWithoutDemo.map((project) => project.id)).toContain(
        normalProject.project.id
      );
      expect(recentWithoutDemo.every((project) => !project.isDemo)).toBe(true);
    } finally {
      client.close();
    }
  });
});
