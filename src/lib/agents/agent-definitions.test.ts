import { describe, expect, it } from "vitest";

import { agentDefinitions } from "./agent-definitions";

const requiredSlugs = [
  "article-analyst",
  "thesis-agent",
  "script-writer",
  "storyboard-agent",
  "prompt-generator",
  "asset-finder",
  "qa-agent"
];

describe("Batch 07 agent definitions", () => {
  it("contains the seven required mock agents", () => {
    expect(agentDefinitions.map((agent) => agent.slug)).toEqual(requiredSlugs);
  });

  it("defines context, schema summaries, modes and QA checklist for every agent", () => {
    for (const agent of agentDefinitions) {
      expect(agent.requiredContext.length).toBeGreaterThan(0);
      expect(agent.inputSchemaSummary.length).toBeGreaterThan(0);
      expect(agent.outputSchemaSummary.length).toBeGreaterThan(0);
      expect(agent.qaChecklist.length).toBeGreaterThan(0);
      expect(agent.currentMode).toBe("mock");
      expect(agent.futureMode).toBe("real_ai_pending");
    }
  });

  it("does not expose real AI provider configuration", () => {
    const serialized = JSON.stringify(agentDefinitions).toLowerCase();

    expect(serialized).not.toContain("api_key");
    expect(serialized).not.toContain("apikey");
    expect(serialized).not.toContain("openai");
    expect(serialized).not.toContain("anthropic");
    expect(serialized).not.toContain("endpoint");
  });
});
