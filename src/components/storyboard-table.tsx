import { DataTable } from "./data-table";
import { StatusBadge } from "./status-badge";
import type { StoryboardResult } from "@/lib/schemas/production-pack";

const toneByLevel = {
  green: "green",
  yellow: "yellow",
  red: "red",
  placeholder: "placeholder"
} as const;

export function StoryboardTable({ storyboard }: { storyboard: StoryboardResult }) {
  return (
    <DataTable
      caption="ProductionPack storyboard shots"
      rows={storyboard.shots}
      columns={[
        { key: "id", header: "镜号", render: (row) => row.id },
        { key: "timeRange", header: "时间", render: (row) => row.timeRange },
        { key: "scene", header: "场景", render: (row) => row.scene },
        { key: "narration", header: "旁白", render: (row) => row.narration },
        { key: "visual", header: "画面", render: (row) => row.visual },
        { key: "assetType", header: "素材类型", render: (row) => row.assetType },
        {
          key: "rightsLevel",
          header: "版权等级",
          render: (row) => (
            <StatusBadge tone={toneByLevel[row.rightsLevel]}>
              {row.rightsLevel}
            </StatusBadge>
          )
        }
      ]}
    />
  );
}
