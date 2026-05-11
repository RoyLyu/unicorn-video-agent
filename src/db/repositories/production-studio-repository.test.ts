import { describe, expect, it } from "vitest";

import { createTestDbClient } from "@/db/test-utils";
import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { saveProductionPack } from "./production-pack-repository";
import {
  createProductionStudioGateRun,
  getLatestProductionStudioGateRun,
  getProductionStudioLock,
  saveProductionStudioEdits,
  setProductionStudioLock
} from "./production-studio-repository";
import { analyzeShotPromptAlignment } from "@/lib/production-studio/shot-prompt-alignment";

describe("production studio repository", () => {
  it("records edits, gate runs, lock and unlock state", () => {
    const client = createTestDbClient();

    try {
      const saved = saveProductionPack(normalizeProductionPack(demoProductionPack, "standard"), client);
      const edits = saveProductionStudioEdits(saved.project.id, [
        {
          versionType: "90s",
          shotNumber: 1,
          editType: "rights",
          patch: { replacementPlan: "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。" }
        }
      ], client);
      const summary = analyzeShotPromptAlignment(saved.productionPack, "standard");
      const gateRun = createProductionStudioGateRun(saved.project.id, "standard", summary, client);

      expect(edits).toHaveLength(1);
      expect(gateRun.status).toBe("pass");
      expect(getLatestProductionStudioGateRun(saved.project.id, client)?.id).toBe(gateRun.id);

      setProductionStudioLock(saved.project.id, { locked: true, gateRunId: gateRun.id }, client);
      expect(getProductionStudioLock(saved.project.id, client)?.locked).toBe(true);

      setProductionStudioLock(saved.project.id, { locked: false }, client);
      expect(getProductionStudioLock(saved.project.id, client)?.locked).toBe(false);
    } finally {
      client.close();
    }
  });
});
