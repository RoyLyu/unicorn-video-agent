import { describe, expect, it } from "vitest";

import {
  exportFiles,
  navigationItems,
  requiredBatch01Routes,
  rightsRisks
} from "./demo-data";

describe("Batch 01 demo data", () => {
  it("contains exactly the required Batch 01 routes", () => {
    expect(navigationItems.map((item) => item.href)).toEqual(
      requiredBatch01Routes
    );
    expect(requiredBatch01Routes).toEqual([
      "/",
      "/dashboard",
      "/articles/new",
      "/articles/demo",
      "/projects/demo/analysis",
      "/projects/demo/scripts",
      "/projects/demo/shots",
      "/projects/demo/rights",
      "/projects/demo/export",
      "/settings"
    ]);
  });

  it("covers all four copyright risk levels", () => {
    const levels = new Set(rightsRisks.map((risk) => risk.level));

    expect(levels).toEqual(
      new Set(["Green", "Yellow", "Red", "Placeholder"])
    );
  });

  it("marks export files as planned only and not generated", () => {
    expect(exportFiles.length).toBeGreaterThan(0);
    expect(exportFiles.every((file) => file.status === "Planned")).toBe(true);
    expect(exportFiles.every((file) => file.generated === false)).toBe(true);
  });
});
