"use client";

import { useState } from "react";

import type { ProductionPack } from "@/lib/schemas/production-pack";
import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import { ProductionPackStatus } from "./production-pack-status";
import { StoryboardTable } from "./storyboard-table";

export function ProductionPackStoryboardView() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <>
      <ProductionPackStatus />
      <section className="panel">
        <StoryboardTable storyboard={pack.storyboard} />
      </section>
    </>
  );
}
