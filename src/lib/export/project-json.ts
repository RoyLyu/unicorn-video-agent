import type { ProductionPack } from "@/lib/schemas/production-pack";
import type { ExportGenerationOptions } from "./export-types";

export function generateProjectJson(
  productionPack: ProductionPack,
  productionStudio?: ExportGenerationOptions["productionStudio"]
) {
  if (!productionStudio) {
    return JSON.stringify(productionPack, null, 2);
  }

  return JSON.stringify(
    {
      productionPack,
      productionStudio: {
        densityProfile: productionStudio.densityProfile,
        lockStatus: productionStudio.lockStatus,
        latestGateStatus: productionStudio.latestGateStatus,
        editedCount: productionStudio.editedCount,
        summary: productionStudio.summary,
        originalProductionPack: productionStudio.originalProductionPack
      }
    },
    null,
    2
  );
}
