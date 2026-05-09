import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  rawText: text("raw_text").notNull(),
  sourceUrl: text("source_url").notNull(),
  publishDate: text("publish_date").notNull(),
  sourceName: text("source_name").notNull(),
  industryTagsJson: text("industry_tags_json").notNull(),
  targetDurationsJson: text("target_durations_json").notNull(),
  createdAt: text("created_at").notNull()
});

export const videoProjects = sqliteTable("video_projects", {
  id: text("id").primaryKey(),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sourceName: text("source_name").notNull(),
  status: text("status").notNull(),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  productionPackJson: text("production_pack_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const analysisRuns = sqliteTable("analysis_runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  keyFactsJson: text("key_facts_json").notNull(),
  industryDataJson: text("industry_data_json").notNull(),
  risksJson: text("risks_json").notNull(),
  coreThesesJson: text("core_theses_json").notNull(),
  videoAngle: text("video_angle").notNull(),
  audienceTakeaway: text("audience_takeaway").notNull(),
  createdAt: text("created_at").notNull()
});

export const scripts = sqliteTable("scripts", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(),
  title: text("title").notNull(),
  hook: text("hook").notNull(),
  linesJson: text("lines_json").notNull(),
  closing: text("closing").notNull()
});

export const shots = sqliteTable("shots", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  shotId: text("shot_id").notNull(),
  timeRange: text("time_range").notNull(),
  scene: text("scene").notNull(),
  narration: text("narration").notNull(),
  visual: text("visual").notNull(),
  assetType: text("asset_type").notNull(),
  rightsLevel: text("rights_level").notNull(),
  position: integer("position").notNull()
});

export const assetPrompts = sqliteTable("asset_prompts", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  promptType: text("prompt_type").notNull(),
  sceneRef: text("scene_ref"),
  prompt: text("prompt"),
  negativePrompt: text("negative_prompt"),
  query: text("query"),
  platform: text("platform"),
  intendedUse: text("intended_use"),
  licenseRequirement: text("license_requirement"),
  notes: text("notes"),
  position: integer("position").notNull()
});

export const rightsChecks = sqliteTable("rights_checks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  item: text("item").notNull(),
  level: text("level").notNull(),
  reason: text("reason").notNull(),
  action: text("action").notNull(),
  position: integer("position").notNull()
});

export const exportManifests = sqliteTable("export_manifests", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  filesJson: text("files_json").notNull(),
  createdAt: text("created_at").notNull()
});

export const reviewLogs = sqliteTable("review_logs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull()
});

export const publishCopies = sqliteTable("publish_copies", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  coverTitle: text("cover_title").notNull(),
  titleCandidatesJson: text("title_candidates_json").notNull(),
  publishText: text("publish_text").notNull(),
  tagsJson: text("tags_json").notNull(),
  riskNotice: text("risk_notice").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const factChecks = sqliteTable("fact_checks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sourceUrl: text("source_url").notNull(),
  status: text("status").notNull(),
  notes: text("notes").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const reviewChecklists = sqliteTable("review_checklists", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  itemKey: text("item_key").notNull(),
  label: text("label").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export type ArticleRow = typeof articles.$inferSelect;
export type VideoProjectRow = typeof videoProjects.$inferSelect;
export type PublishCopyRow = typeof publishCopies.$inferSelect;
export type FactCheckRow = typeof factChecks.$inferSelect;
export type ReviewChecklistRow = typeof reviewChecklists.$inferSelect;
