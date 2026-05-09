import type { ProductionPack } from "@/lib/schemas/production-pack";

export function generatePromptPackMarkdown(productionPack: ProductionPack) {
  const imagePrompts = productionPack.assetPrompts.imagePrompts
    .map(
      (prompt) => `## ${prompt.id}

- sceneRef：${prompt.sceneRef}
- imagePrompt：${prompt.prompt}
- negativePrompt：${prompt.negativePrompt}
- aspectRatio：9:16
- stylePreset：财经编辑部 / clean editorial
- notes：${prompt.notes}`
    )
    .join("\n\n");

  const videoPrompts = productionPack.assetPrompts.videoPrompts
    .map(
      (prompt) => `## ${prompt.id}

- sceneRef：${prompt.sceneRef}
- videoPrompt：${prompt.prompt}
- negativePrompt：${prompt.negativePrompt}
- aspectRatio：9:16
- stylePreset：财经短视频 / restrained motion
- notes：${prompt.notes}`
    )
    .join("\n\n");

  return `# Prompt Pack

# Image Prompts

${imagePrompts}

# Video Prompts

${videoPrompts}
`;
}
