import { describe, expect, it } from "vitest";

import type { RecentProject } from "@/db/repositories/project-repository";
import { splitDashboardProjects } from "./dashboard-projects";

const baseProject = {
  sourceName: "Demo",
  status: "mock_saved",
  createdAt: "2026-05-09T00:00:00.000Z",
  updatedAt: "2026-05-09T00:00:00.000Z"
};

describe("dashboard project split", () => {
  it("keeps demo projects separate from recent projects", () => {
    const demoProject: RecentProject = {
      ...baseProject,
      id: "demo-1",
      title: "公开 Demo",
      isDemo: true
    };
    const normalProject: RecentProject = {
      ...baseProject,
      id: "normal-1",
      title: "普通项目",
      isDemo: false
    };

    const result = splitDashboardProjects([demoProject], [demoProject, normalProject]);

    expect(result.demoProjects).toEqual([demoProject]);
    expect(result.recentProjects).toEqual([normalProject]);
  });
});
