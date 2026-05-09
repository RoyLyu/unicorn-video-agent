import type {
  ArticleInput,
  AssetPromptResult,
  StoryboardResult
} from "../schemas/production-pack";

export function generatePrompts(
  input: ArticleInput,
  storyboard: StoryboardResult
): AssetPromptResult {
  const firstShot = storyboard.shots[0]?.id ?? "S01";

  return {
    imagePrompts: [
      {
        id: "IMG-01",
        sceneRef: firstShot,
        prompt: `Editorial business infographic about ${input.industryTags.join(", ")}, abstract data flow, clean vertical layout, no logos, no real people`,
        negativePrompt: "real company logos, news photos, celebrities, watermarks, copyrighted stills",
        notes: "仅作为未来 AI 图像提示词，不在 Batch 02 生成图片。"
      }
    ],
    videoPrompts: [
      {
        id: "VID-01",
        sceneRef: firstShot,
        prompt: "Slow vertical motion through abstract financial data panels and AI infrastructure nodes, clean editorial style",
        negativePrompt: "news footage, recognizable brands, copyrighted clips, realistic public figures",
        notes: "仅作为未来 AI 视频提示词，不在 Batch 02 生成视频。"
      }
    ],
    searchLeads: [
      {
        query: `${input.industryTags.join(" ")} abstract data center royalty free vertical video`,
        platform: "Pexels / Pixabay / Storyblocks",
        intendedUse: "寻找非特定公司、非新闻现场的抽象氛围素材。",
        licenseRequirement: "必须人工确认可商用、可二创和署名要求。"
      }
    ]
  };
}
