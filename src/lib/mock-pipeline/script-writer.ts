import type {
  ArticleInput,
  ScriptResult,
  ThesisResult
} from "../schemas/production-pack";

export function writeScripts(
  input: ArticleInput,
  thesis: ThesisResult
): ScriptResult {
  return {
    video90s: {
      duration: 90,
      title: `${input.title} - 90s mock 脚本`,
      hook: "一篇财经文章，如何变成视频号生产包？",
      lines: [
        {
          timeRange: "00:00-00:10",
          narration: "今天用一个本地 mock 流程，演示文章到生产包的闭环。",
          visual: "Batch 02 / Mock Pipeline 状态卡",
          onScreenText: "本地 Mock，不是真实 AI"
        },
        {
          timeRange: "00:10-00:55",
          narration: thesis.coreTheses[0],
          visual: "行业标签、关键事实和观点卡片依次出现",
          onScreenText: input.industryTags.join(" / ")
        },
        {
          timeRange: "00:55-01:30",
          narration: "最后输出脚本、分镜、版权风险和导出清单，但不生成真实文件。",
          visual: "脚本、分镜、版权、导出四栏 UI",
          onScreenText: "只生成 JSON 生产包"
        }
      ],
      closing: "Batch 02 的价值，是先把本地闭环跑通。"
    },
    video180s: {
      duration: 180,
      title: `${input.title} - 180s mock 脚本`,
      hook: "如果要把财经文章做成视频号，第一步不是剪辑，而是结构化。",
      lines: [
        {
          timeRange: "00:00-00:20",
          narration: "这次我们不接真实 AI，只用本地纯函数模拟 Agent pipeline。",
          visual: "ArticleInput 到 ProductionPack 的流程图",
          onScreenText: "ArticleInput → ProductionPack"
        },
        {
          timeRange: "00:20-01:10",
          narration: thesis.videoAngle,
          visual: "分析结果和核心观点并排展示",
          onScreenText: "分析 / 观点"
        },
        {
          timeRange: "01:10-02:15",
          narration: "脚本之后还需要分镜、素材 prompt、搜索线索和版权风险。",
          visual: "分镜表、Prompt 列表、版权风险表",
          onScreenText: "分镜 / Prompt / Rights"
        },
        {
          timeRange: "02:15-03:00",
          narration: thesis.audienceTakeaway,
          visual: "导出 manifest，但所有文件保持 planned 状态",
          onScreenText: "不生成真实导出文件"
        }
      ],
      closing: "下一步 Batch 才能考虑更真实的生成和导出能力。"
    }
  };
}
