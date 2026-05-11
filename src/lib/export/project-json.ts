import type { ProductionPack } from "@/lib/schemas/production-pack";

export function generateProjectJson(productionPack: ProductionPack) {
  return JSON.stringify(productionPack, null, 2);
}
