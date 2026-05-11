import type { ProductionPack } from "@/lib/schemas/production-pack";
import { getPromptBundles } from "@/lib/production-studio/shot-prompt-alignment";

export function generatePromptPackMarkdown(productionPack: ProductionPack) {
  const shotsByPromptKey = new Map(
    productionPack.storyboard.shots.map((shot) => [
      `${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}:${shot.id}`,
      shot
    ])
  );
  const bundles = [...getPromptBundles(productionPack)]
    .sort((a, b) => {
      if (a.versionType !== b.versionType) {
        return a.versionType === "90s" ? -1 : 1;
      }

      return a.shotNumber - b.shotNumber;
    })
    .map((prompt) => {
      const shot = shotsByPromptKey.get(`${prompt.versionType}:${prompt.shotNumber}:${prompt.shotId}`);

      return `## ${prompt.versionType} #${prompt.shotNumber} / ${prompt.shotCode ?? prompt.shotId}

- versionType：${prompt.versionType}
- shotNumber：${prompt.shotNumber}
- shotId：${prompt.shotId}
- shotCode：${prompt.shotCode ?? prompt.shotId}
- duration：${prompt.duration ?? shot?.duration ?? ""}
- subject：${prompt.subject ?? shot?.subject ?? ""}
- environment：${prompt.environment ?? shot?.environment ?? ""}
- camera：${prompt.camera ?? shot?.camera ?? ""}
- lighting：${prompt.lighting ?? shot?.lighting ?? ""}
- style：${prompt.style ?? shot?.style ?? ""}
- productionMethod：${shot?.productionMethod ?? ""}
- methodReason：${shot?.methodReason ?? ""}
- continuityAssets：${shot?.continuityAssets?.join(" / ") ?? ""}
- imagePrompt：${prompt.imagePrompt}
- videoPrompt：${prompt.videoPrompt}
- negativePrompt：${prompt.negativePrompt}
- negativeConstraints：${prompt.negativeConstraints ?? prompt.negativePrompt}
- forbiddenElements：${(prompt.forbiddenElements ?? []).join(" / ")}
- styleLock：${prompt.styleLock}
- aspectRatio：${prompt.aspectRatio}
- usageWarning：${prompt.usageWarning}`
    })
    .join("\n\n");

  return `# Prompt Pack

## Creative Concept

${productionPack.creativeDirection?.creativeConcept ?? "未提供"}

## Visual Style Bible 摘要

- Aspect Ratio：${productionPack.visualStyleBible?.aspectRatio ?? "未提供"}
- Image Type：${productionPack.visualStyleBible?.imageType ?? "未提供"}
- Style Lock：${productionPack.visualStyleBible ? `${productionPack.visualStyleBible.colorSystem.primaryColor} / ${productionPack.visualStyleBible.lightingSystem.atmosphere} / ${productionPack.visualStyleBible.typographyStyle.fontMood}` : "未提供"}
- Forbidden Elements：${productionPack.visualStyleBible?.forbiddenElements.join(" / ") ?? "未提供"}

## Continuity Bible 摘要

- Character：${productionPack.continuityBible?.mainCharacterBible ?? "未提供"}
- Environment：${productionPack.continuityBible?.environmentBible ?? "未提供"}
- Objects：${productionPack.continuityBible?.objectBible ?? "未提供"}
- Motion：${productionPack.continuityBible?.motionContinuity ?? "未提供"}

# Shot Prompt Bundles

${bundles}
`;
}
