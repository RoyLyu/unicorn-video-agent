import { describe, expect, it } from "vitest";

import { canonicalizeAiOutput } from "./canonicalize-ai-output";

describe("canonicalizeAiOutput", () => {
  it("maps natural language editing enums into schema values", () => {
    const result = canonicalizeAiOutput({
      storyboard: {
        shots: [
          {
            editing: {
              cutType: "硬切",
              rollType: "A-roll",
              pace: "快速"
            }
          },
          {
            editing: {
              cutType: "graphic match cut",
              rollType: "motion graphics",
              pace: "moderate"
            }
          }
        ]
      }
    });

    const shots = (result.value as {
      storyboard: { shots: Array<{ editing: { cutType: string; rollType: string; pace: string } }> };
    }).storyboard.shots;

    expect(shots[0].editing.cutType).toBe("hard_cut");
    expect(shots[0].editing.rollType).toBe("a_roll");
    expect(shots[0].editing.pace).toBe("fast");
    expect(shots[1].editing.cutType).toBe("graphic_match");
    expect(shots[1].editing.rollType).toBe("graphic_roll");
    expect(shots[1].editing.pace).toBe("medium");
    expect(result.report.changedFields.map((field) => field.path)).toContain(
      "storyboard.shots.0.editing.cutType"
    );
    expect(result.report.unknownEnumFields).toEqual([]);
  });

  it("maps shot function, production method and rights risk variants", () => {
    const result = canonicalizeAiOutput({
      storyboard: {
        shots: [
          {
            shotFunction: "Hook Shot",
            productionMethod: "Text-to-Image + Edit",
            copyrightRisk: "needs review",
            rightsLevel: "low"
          }
        ]
      },
      rightsChecks: [
        {
          level: "high"
        },
        {
          riskLevel: "pending"
        }
      ]
    });
    const output = result.value as {
      storyboard: {
        shots: Array<{
          shotFunction: string;
          productionMethod: string;
          copyrightRisk: string;
          rightsLevel: string;
        }>;
      };
      rightsChecks: Array<{ level?: string; riskLevel?: string }>;
    };

    expect(output.storyboard.shots[0].shotFunction).toBe("hook_shot");
    expect(output.storyboard.shots[0].productionMethod).toBe("text_to_image_edit");
    expect(output.storyboard.shots[0].copyrightRisk).toBe("yellow");
    expect(output.storyboard.shots[0].rightsLevel).toBe("green");
    expect(output.rightsChecks[0].level).toBe("red");
    expect(output.rightsChecks[1].riskLevel).toBe("placeholder");
  });

  it("keeps unknown enum values and reports them for strict schema failure", () => {
    const result = canonicalizeAiOutput({
      storyboard: {
        shots: [
          {
            shotFunction: "mystery shot",
            editing: {
              cutType: "spiral morph",
              rollType: "unknown roll",
              pace: "ultra"
            }
          }
        ]
      }
    });
    const output = result.value as {
      storyboard: { shots: Array<{ shotFunction: string; editing: { cutType: string } }> };
    };

    expect(output.storyboard.shots[0].shotFunction).toBe("mystery shot");
    expect(output.storyboard.shots[0].editing.cutType).toBe("spiral morph");
    expect(result.report.unknownEnumFields.map((field) => field.path)).toEqual([
      "storyboard.shots.0.shotFunction",
      "storyboard.shots.0.editing.cutType",
      "storyboard.shots.0.editing.rollType",
      "storyboard.shots.0.editing.pace"
    ]);
  });

  it("does not leak API key names or values in the report", () => {
    const result = canonicalizeAiOutput({
      storyboard: { shots: [{ editing: { cutType: "hard cut" } }] },
      note: "MINIMAX_API_KEY=secret OPENAI_API_KEY=secret"
    });

    expect(JSON.stringify(result.report)).not.toContain("MINIMAX_API_KEY");
    expect(JSON.stringify(result.report)).not.toContain("OPENAI_API_KEY");
    expect(JSON.stringify(result.report)).not.toContain("secret");
  });
});
