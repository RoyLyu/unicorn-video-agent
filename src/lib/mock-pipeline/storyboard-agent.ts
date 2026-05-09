import type {
  ArticleInput,
  ScriptResult,
  StoryboardResult
} from "../schemas/production-pack";

export function createStoryboard(
  input: ArticleInput,
  scripts: ScriptResult
): StoryboardResult {
  return {
    shots: [
      {
        id: "S01",
        timeRange: scripts.video90s.lines[0].timeRange,
        scene: "Mock 流程开场",
        narration: scripts.video90s.lines[0].narration,
        visual: "标题卡、输入字段和 mock 状态标签",
        assetType: "text",
        rightsLevel: "green"
      },
      {
        id: "S02",
        timeRange: "00:10-00:55",
        scene: "行业观点展示",
        narration: scripts.video90s.lines[1].narration,
        visual: `${input.industryTags.join("、")} 信息卡和观点摘要`,
        assetType: "chart",
        rightsLevel: "green"
      },
      {
        id: "S03",
        timeRange: "00:55-01:30",
        scene: "版权与导出边界",
        narration: scripts.video90s.lines[2].narration,
        visual: "版权风险表和导出 manifest",
        assetType: "screen",
        rightsLevel: "placeholder"
      }
    ]
  };
}
