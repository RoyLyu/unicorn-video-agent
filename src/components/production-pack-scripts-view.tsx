"use client";

import { useState } from "react";

import type { ProductionPack } from "@/lib/schemas/production-pack";
import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import { ProductionPackStatus } from "./production-pack-status";
import { ScriptViewer } from "./script-viewer";

export function ProductionPackScriptsView({
  productionPack
}: {
  productionPack?: ProductionPack;
}) {
  const [pack] = useState<ProductionPack>(() => productionPack ?? loadProductionPack());

  return (
    <>
      <ProductionPackStatus productionPack={pack} />
      <ScriptViewer scripts={pack.scripts} />
    </>
  );
}
