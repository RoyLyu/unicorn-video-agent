"use client";

import { useState } from "react";

import type { ProductionPack } from "@/lib/schemas/production-pack";
import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import { ProductionPackStatus } from "./production-pack-status";
import { ScriptViewer } from "./script-viewer";

export function ProductionPackScriptsView() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <>
      <ProductionPackStatus />
      <ScriptViewer scripts={pack.scripts} />
    </>
  );
}
