import { demoProductionPack } from "../mock-pipeline/demo-production-pack";
import {
  ProductionPackSchema,
  type ProductionPack
} from "../schemas/production-pack";

export const PRODUCTION_PACK_STORAGE_KEY =
  "unicorn-video-agent.production-pack.v1";

export function saveProductionPack(pack: ProductionPack) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    PRODUCTION_PACK_STORAGE_KEY,
    JSON.stringify(ProductionPackSchema.parse(pack))
  );
}

export function loadProductionPack(): ProductionPack {
  if (!canUseStorage()) {
    return demoProductionPack;
  }

  const raw = window.localStorage.getItem(PRODUCTION_PACK_STORAGE_KEY);

  if (!raw) {
    return demoProductionPack;
  }

  try {
    return ProductionPackSchema.parse(JSON.parse(raw));
  } catch {
    return demoProductionPack;
  }
}

export function clearProductionPack() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(PRODUCTION_PACK_STORAGE_KEY);
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}
