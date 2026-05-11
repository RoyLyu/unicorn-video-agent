import { describe, expect, it } from "vitest";

import { getReviewApiPayload } from "./review-api";
import { createTestDbClient } from "@/db/test-utils";

describe("Batch 05 review API helpers", () => {
  it("returns null for a missing project", () => {
    const client = createTestDbClient();

    try {
      expect(getReviewApiPayload("missing-project", client)).toBeNull();
    } finally {
      client.close();
    }
  });
});
