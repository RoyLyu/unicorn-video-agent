import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { resetPublicDemo } from "./reset-demo";

describe("POST /api/demo/reset helper", () => {
  it("returns two demo project ids and demo projects", () => {
    const client = createTestDbClient();

    try {
      const result = resetPublicDemo(client);

      expect(result.projectIds).toHaveLength(2);
      expect(result.projects).toHaveLength(2);
      expect(result.projects.every((project) => project.isDemo)).toBe(true);
    } finally {
      client.close();
    }
  });
});
