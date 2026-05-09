import { DataTable } from "./data-table";
import { StatusBadge } from "./status-badge";
import type { RightsCheckResult } from "@/lib/schemas/production-pack";

const toneByLevel = {
  green: "green",
  yellow: "yellow",
  red: "red",
  placeholder: "placeholder"
} as const;

export function RightsRiskTable({ risks }: { risks: RightsCheckResult[] }) {
  return (
    <DataTable
      caption="ProductionPack rights checks"
      rows={risks}
      columns={[
        { key: "item", header: "项目", render: (row) => row.item },
        {
          key: "level",
          header: "等级",
          render: (row) => (
            <StatusBadge tone={toneByLevel[row.level]}>{row.level}</StatusBadge>
          )
        },
        { key: "reason", header: "原因", render: (row) => row.reason },
        { key: "action", header: "处理方式", render: (row) => row.action }
      ]}
    />
  );
}
