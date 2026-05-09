import { eq } from "drizzle-orm";

import { createArticle } from "./article-repository";
import { toProjectDetail, type ProjectDetail } from "./project-repository";
import { getDbClient, type DbClient } from "../index";
import {
  analysisRuns,
  assetPrompts,
  exportManifests,
  reviewLogs,
  rightsChecks,
  scripts,
  shots,
  videoProjects
} from "../schema";
import {
  ProductionPackSchema,
  type ProductionPack
} from "@/lib/schemas/production-pack";

export type SavedProductionPack = {
  project: ProjectDetail;
  productionPack: ProductionPack;
};

export function saveProductionPack(
  productionPack: ProductionPack,
  client: DbClient = getDbClient()
): SavedProductionPack {
  const parsedPack = ProductionPackSchema.parse(productionPack);
  const article = createArticle(parsedPack.articleInput, client);
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();

  client.db.transaction(() => {
    client.db
      .insert(videoProjects)
      .values({
        id: projectId,
        articleId: article.id,
        title: parsedPack.articleInput.title,
        sourceName: parsedPack.articleInput.sourceName,
        status: "mock_saved",
        productionPackJson: JSON.stringify(parsedPack),
        createdAt: now,
        updatedAt: now
      })
      .run();

    client.db
      .insert(analysisRuns)
      .values({
        id: crypto.randomUUID(),
        projectId,
        summary: parsedPack.analysis.summary,
        keyFactsJson: JSON.stringify(parsedPack.analysis.keyFacts),
        industryDataJson: JSON.stringify(parsedPack.analysis.industryData),
        risksJson: JSON.stringify(parsedPack.analysis.risks),
        coreThesesJson: JSON.stringify(parsedPack.thesis.coreTheses),
        videoAngle: parsedPack.thesis.videoAngle,
        audienceTakeaway: parsedPack.thesis.audienceTakeaway,
        createdAt: now
      })
      .run();

    client.db
      .insert(scripts)
      .values([
        scriptRow(projectId, parsedPack.scripts.video90s),
        scriptRow(projectId, parsedPack.scripts.video180s)
      ])
      .run();

    client.db
      .insert(shots)
      .values(
        parsedPack.storyboard.shots.map((shot, index) => ({
          id: crypto.randomUUID(),
          projectId,
          shotId: shot.id,
          timeRange: shot.timeRange,
          scene: shot.scene,
          narration: shot.narration,
          visual: shot.visual,
          assetType: shot.assetType,
          rightsLevel: shot.rightsLevel,
          position: index
        }))
      )
      .run();

    const imagePromptRows = parsedPack.assetPrompts.imagePrompts.map(
      (prompt, index) => ({
        id: crypto.randomUUID(),
        projectId,
        promptType: "image",
        sceneRef: prompt.sceneRef,
        prompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        query: null,
        platform: null,
        intendedUse: null,
        licenseRequirement: null,
        notes: prompt.notes,
        position: index
      })
    );
    const videoPromptRows = parsedPack.assetPrompts.videoPrompts.map(
      (prompt, index) => ({
        id: crypto.randomUUID(),
        projectId,
        promptType: "video",
        sceneRef: prompt.sceneRef,
        prompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        query: null,
        platform: null,
        intendedUse: null,
        licenseRequirement: null,
        notes: prompt.notes,
        position: imagePromptRows.length + index
      })
    );
    const searchLeadRows = parsedPack.assetPrompts.searchLeads.map(
      (lead, index) => ({
        id: crypto.randomUUID(),
        projectId,
        promptType: "search",
        sceneRef: null,
        prompt: null,
        negativePrompt: null,
        query: lead.query,
        platform: lead.platform,
        intendedUse: lead.intendedUse,
        licenseRequirement: lead.licenseRequirement,
        notes: null,
        position: imagePromptRows.length + videoPromptRows.length + index
      })
    );

    const promptRows = [...imagePromptRows, ...videoPromptRows, ...searchLeadRows];
    if (promptRows.length > 0) {
      client.db.insert(assetPrompts).values(promptRows).run();
    }

    client.db
      .insert(rightsChecks)
      .values(
        parsedPack.rightsChecks.map((risk, index) => ({
          id: crypto.randomUUID(),
          projectId,
          item: risk.item,
          level: risk.level,
          reason: risk.reason,
          action: risk.action,
          position: index
        }))
      )
      .run();

    client.db
      .insert(exportManifests)
      .values({
        id: crypto.randomUUID(),
        projectId,
        filesJson: JSON.stringify(parsedPack.exportManifest.files),
        createdAt: now
      })
      .run();

    client.db
      .insert(reviewLogs)
      .values({
        id: crypto.randomUUID(),
        projectId,
        eventType: "mock_pipeline_saved",
        message: "Batch 03 local mock ProductionPack saved to SQLite.",
        createdAt: now
      })
      .run();
  });

  return {
    project: {
      id: projectId,
      articleId: article.id,
      title: parsedPack.articleInput.title,
      sourceName: parsedPack.articleInput.sourceName,
      status: "mock_saved",
      createdAt: now,
      updatedAt: now
    },
    productionPack: parsedPack
  };
}

export function getProductionPackByProjectId(
  projectId: string,
  client: DbClient = getDbClient()
): SavedProductionPack | null {
  const row = client.db
    .select()
    .from(videoProjects)
    .where(eq(videoProjects.id, projectId))
    .get();

  if (!row) {
    return null;
  }

  return {
    project: toProjectDetail(row),
    productionPack: ProductionPackSchema.parse(JSON.parse(row.productionPackJson))
  };
}

function scriptRow(
  projectId: string,
  script: ProductionPack["scripts"]["video90s"] | ProductionPack["scripts"]["video180s"]
) {
  return {
    id: crypto.randomUUID(),
    projectId,
    duration: script.duration,
    title: script.title,
    hook: script.hook,
    linesJson: JSON.stringify(script.lines),
    closing: script.closing
  };
}
