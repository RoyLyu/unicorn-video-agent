"use client";

import { useState } from "react";

import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { StatusBadge } from "./status-badge";

export function ProductionPackStatus() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <div className="pack-status">
      <StatusBadge>Batch 02 / Mock Pipeline</StatusBadge>
      <span>{pack.articleInput.title}</span>
      <small>mode: {pack.mode}</small>
    </div>
  );
}
