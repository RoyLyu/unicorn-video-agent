import { describe, expect, it } from "vitest";

import {
  ArticleInputSchema,
  VideoProductionPackageSchema
} from "./video-production";
import { sampleArticleInput } from "../fixtures/sample-article-input";
import { sampleProductionPackage } from "../fixtures/sample-production-package";

describe("ArticleInputSchema", () => {
  it("accepts the Batch 00 sample article input", () => {
    expect(() => ArticleInputSchema.parse(sampleArticleInput)).not.toThrow();
  });

  it("rejects an unsupported target duration", () => {
    const result = ArticleInputSchema.safeParse({
      ...sampleArticleInput,
      targetDuration: 120
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty article body", () => {
    const result = ArticleInputSchema.safeParse({
      ...sampleArticleInput,
      body: ""
    });

    expect(result.success).toBe(false);
  });
});

describe("VideoProductionPackageSchema", () => {
  it("accepts the Batch 00 sample production package", () => {
    expect(() =>
      VideoProductionPackageSchema.parse(sampleProductionPackage)
    ).not.toThrow();
  });

  it("rejects a malformed production package without a 90s script", () => {
    const result = VideoProductionPackageSchema.safeParse({
      ...sampleProductionPackage,
      scripts: {
        video180s: sampleProductionPackage.scripts.video180s
      }
    });

    expect(result.success).toBe(false);
  });
});
