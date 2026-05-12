import { describe, expect, it } from "vitest";

import {
  requiredNegativePrompt,
  singlePackProductionPrompt,
  visualStyleLock
} from "./single-pack-production-prompt";

describe("single-pack production prompt", () => {
  it("contains the visual style lock and required negative prompt terms", () => {
    const prompt = singlePackProductionPrompt();

    expect(prompt).toContain(visualStyleLock);
    for (const term of requiredNegativePrompt.split(",").map((part) => part.trim())) {
      expect(prompt).toContain(term);
    }
  });

  it("does not include forbidden internal template phrases", () => {
    const prompt = singlePackProductionPrompt();

    expect(prompt).not.toContain("mock");
    expect(prompt).not.toContain("Batch 02");
    expect(prompt).not.toContain("demo-data");
    expect(prompt).not.toContain("后续会补齐");
    expect(prompt).not.toContain("系统会补齐");
  });

  it("contains strict enum tables and rejects human-readable enum output", () => {
    const prompt = singlePackProductionPrompt();

    expect(prompt).toContain("cutType");
    expect(prompt).toContain("hard_cut");
    expect(prompt).toContain("rollType");
    expect(prompt).toContain("graphic_roll");
    expect(prompt).toContain("pace");
    expect(prompt).toContain("fast");
    expect(prompt).toContain("shotFunction");
    expect(prompt).toContain("hook_shot");
    expect(prompt).toContain("productionMethod");
    expect(prompt).toContain("text_to_video");
    expect(prompt).toContain("copyrightRisk");
    expect(prompt).toContain("placeholder");
    expect(prompt).toContain("不要输出中文 enum");
    expect(prompt).toContain("不要输出 human-readable enum");
    expect(prompt).toContain("不要输出空格形式");
  });

  it("contains a shotFunction sequencing plan for standard profile", () => {
    const prompt = singlePackProductionPrompt("standard");

    expect(prompt).toContain("90s 推荐分布");
    expect(prompt).toContain("hook_shot：2");
    expect(prompt).toContain("summary_shot：1");
    expect(prompt).toContain("180s 推荐分布");
    expect(prompt).toContain("transition_shot：5");
    expect(prompt).toContain("cta_shot：2");
    expect(prompt).toContain("不要连续 5 个以上相同 shotFunction");
    expect(prompt).toContain("每个 narrative beat 至少混合 2 种 shotFunction");
  });
});
