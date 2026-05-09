import { describe, expect, it } from "vitest";

import { createQaSummary } from "@/lib/agents/agent-summary";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import {
  GenerationModeSchema,
  ProductionPackSchema
} from "@/lib/schemas/production-pack";

import {
  AiAgentOutputSchemas,
  AssetFinderResultSchema,
  QaAgentResultSchema
} from "./schemas";

describe("Batch 08 AI agent schemas", () => {
  it("only allows mock and ai generation modes", () => {
    expect(GenerationModeSchema.options).toEqual(["mock", "ai"]);
    expect(GenerationModeSchema.safeParse("mock").success).toBe(true);
    expect(GenerationModeSchema.safeParse("ai").success).toBe(true);
    expect(GenerationModeSchema.safeParse("demo").success).toBe(false);
  });

  it("supports ai mode ProductionPack while preserving schema compatibility", () => {
    const pack = {
      ...runMockPipeline(demoArticleInput),
      mode: "ai"
    };

    expect(() => ProductionPackSchema.parse(pack)).not.toThrow();
  });

  it("defines schemas for all AI agent outputs", () => {
    expect(Object.keys(AiAgentOutputSchemas)).toEqual([
      "article-analyst",
      "thesis-agent",
      "script-writer",
      "storyboard-agent",
      "prompt-generator",
      "asset-finder",
      "qa-agent"
    ]);
  });

  it("validates asset finder and QA outputs", () => {
    const pack = runMockPipeline(demoArticleInput);

    expect(() =>
      AssetFinderResultSchema.parse({
        searchLeads: pack.assetPrompts.searchLeads,
        note: "只保存素材线索，不下载素材。"
      })
    ).not.toThrow();

    expect(() =>
      QaAgentResultSchema.parse({
        rightsChecks: pack.rightsChecks,
        qaSummary: createQaSummary(pack)
      })
    ).not.toThrow();
  });
});
