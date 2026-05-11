import type { ProductionPack } from "@/lib/schemas/production-pack";
import { getPromptBundles } from "@/lib/production-studio/shot-prompt-alignment";

export function generatePromptPackMarkdown(productionPack: ProductionPack) {
  const bundles = [...getPromptBundles(productionPack)]
    .sort((a, b) => {
      if (a.versionType !== b.versionType) {
        return a.versionType === "90s" ? -1 : 1;
      }

      return a.shotNumber - b.shotNumber;
    })
    .map(
      (prompt) => `## ${prompt.versionType} #${prompt.shotNumber} / ${prompt.shotId}

- versionType：${prompt.versionType}
- shotNumber：${prompt.shotNumber}
- shotId：${prompt.shotId}
- shotCode：${prompt.shotCode ?? prompt.shotId}
- duration：${prompt.duration ?? ""}
- subject：${prompt.subject ?? ""}
- environment：${prompt.environment ?? ""}
- camera：${prompt.camera ?? ""}
- lighting：${prompt.lighting ?? ""}
- style：${prompt.style ?? ""}
- imagePrompt：${prompt.imagePrompt}
- videoPrompt：${prompt.videoPrompt}
- negativePrompt：${prompt.negativePrompt}
- negativeConstraints：${prompt.negativeConstraints ?? prompt.negativePrompt}
- forbiddenElements：${(prompt.forbiddenElements ?? []).join(" / ")}
- styleLock：${prompt.styleLock}
- aspectRatio：${prompt.aspectRatio}
- usageWarning：${prompt.usageWarning}`
    )
    .join("\n\n");

  return `# Prompt Pack

# Shot Prompt Bundles

${bundles}
`;
}
