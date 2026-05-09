"use client";

import { useState } from "react";

import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { StatusBadge } from "./status-badge";

export function ProductionPackStatus({
  productionPack
}: {
  productionPack?: ProductionPack;
}) {
  const [pack] = useState<ProductionPack>(() => productionPack ?? loadProductionPack());

  return (
    <div className="pack-status">
      <StatusBadge>Batch 06 / SQLite Demo</StatusBadge>
      <span>{pack.articleInput.title}</span>
      <small>mode: {pack.mode}</small>
    </div>
  );
}
