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
});
