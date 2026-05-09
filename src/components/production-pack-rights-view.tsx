"use client";

import { useState } from "react";

import type { ProductionPack } from "@/lib/schemas/production-pack";
import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import { ProductionPackStatus } from "./production-pack-status";
import { RightsRiskTable } from "./rights-risk-table";

export function ProductionPackRightsView() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <>
      <ProductionPackStatus />
      <section className="panel">
        <RightsRiskTable risks={pack.rightsChecks} />
      </section>
    </>
  );
}
