import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseAiJsonWithSchema } from "./structured-output";

describe("AI structured output parsing", () => {
  it("skips unfinished thinking text and parses the first schema-valid JSON object", () => {
    const schema = z.object({ ok: z.literal(true), value: z.string() });
    const parsed = parseAiJsonWithSchema(
      '<think>try examples like {"not":"the final output"}\n{"ok":true,"value":"done"}',
      schema
    );

    expect(parsed).toEqual({ ok: true, value: "done" });
  });
});
