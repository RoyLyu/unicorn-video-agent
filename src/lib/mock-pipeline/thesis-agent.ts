import type {
  AnalysisResult,
  ArticleInput,
  ThesisResult
} from "../schemas/production-pack";

export function createThesis(
  input: ArticleInput,
  analysis: AnalysisResult
): ThesisResult {
  return {
    coreTheses: [
      `${input.industryTags[0]} 叙事需要从行业信号讲起，而不是只讲单条新闻。`,
      "视频号脚本应把事实、判断和版权边界拆清楚。",
      analysis.risks[0]
    ],
    videoAngle: "用一篇虚构融资文章演示财经内容如何转成视频号生产包。",
    audienceTakeaway: "观众应理解：Batch 02 是本地 mock 闭环，不代表真实 AI 生成结果。"
  };
}
