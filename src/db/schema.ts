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

export const agentDefinitions = sqliteTable("agent_definitions", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  requiredContextJson: text("required_context_json").notNull(),
  inputSchemaSummary: text("input_schema_summary").notNull(),
  outputSchemaSummary: text("output_schema_summary").notNull(),
  currentMode: text("current_mode").notNull(),
  futureMode: text("future_mode").notNull(),
  qaChecklistJson: text("qa_checklist_json").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const agentRuns = sqliteTable("agent_runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => videoProjects.id, {
    onDelete: "cascade"
  }),
  articleTitle: text("article_title").notNull(),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  errorMessage: text("error_message")
});

export const agentRunSteps = sqliteTable("agent_run_steps", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => agentRuns.id, { onDelete: "cascade" }),
  agentSlug: text("agent_slug").notNull(),
  stepOrder: integer("step_order").notNull(),
  status: text("status").notNull(),
  inputJson: text("input_json").notNull(),
  outputJson: text("output_json"),
  inputSummary: text("input_summary").notNull(),
  outputSummary: text("output_summary"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  errorMessage: text("error_message")
});

export const agentContextSnapshots = sqliteTable("agent_context_snapshots", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => agentRuns.id, { onDelete: "cascade" }),
  stepId: text("step_id")
    .notNull()
    .references(() => agentRunSteps.id, { onDelete: "cascade" }),
  agentSlug: text("agent_slug").notNull(),
  contextJson: text("context_json").notNull(),
  summary: text("summary").notNull(),
  createdAt: text("created_at").notNull()
});

export const qaResults = sqliteTable("qa_results", {
  id: text("id").primaryKey(),
  runId: text("run_id")
    .notNull()
    .references(() => agentRuns.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => videoProjects.id, {
    onDelete: "cascade"
  }),
  summaryJson: text("summary_json").notNull(),
  redRightsRiskCount: integer("red_rights_risk_count").notNull(),
  factQaJson: text("fact_qa_json").notNull(),
  scriptQaJson: text("script_qa_json").notNull(),
  copyrightQaJson: text("copyright_qa_json").notNull(),
  exportQaJson: text("export_qa_json").notNull(),
  publishQaJson: text("publish_qa_json").notNull(),
  createdAt: text("created_at").notNull()
});

export const productionStudioEdits = sqliteTable("production_studio_edits", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  versionType: text("version_type").notNull(),
  shotNumber: integer("shot_number").notNull(),
  editType: text("edit_type").notNull(),
  patchJson: text("patch_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const productionStudioGateRuns = sqliteTable("production_studio_gate_runs", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  densityProfile: text("density_profile").notNull(),
  status: text("status").notNull(),
  shotCount90s: integer("shot_count_90s").notNull(),
  shotCount180s: integer("shot_count_180s").notNull(),
  promptCount: integer("prompt_count").notNull(),
  unmatchedShotsJson: text("unmatched_shots_json").notNull(),
  unmatchedPromptsJson: text("unmatched_prompts_json").notNull(),
  redRisksWithoutReplacementJson: text("red_risks_without_replacement_json").notNull(),
  scoresJson: text("scores_json").notNull(),
  needsFix: integer("needs_fix", { mode: "boolean" }).notNull(),
  fixReasonsJson: text("fix_reasons_json").notNull(),
  createdAt: text("created_at").notNull()
});

export const productionStudioLocks = sqliteTable("production_studio_locks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => videoProjects.id, { onDelete: "cascade" }),
  locked: integer("locked", { mode: "boolean" }).notNull(),
  lockedAt: text("locked_at"),
  lockNote: text("lock_note"),
  gateRunId: text("gate_run_id").references(() => productionStudioGateRuns.id, {
    onDelete: "set null"
  }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export type ArticleRow = typeof articles.$inferSelect;
export type VideoProjectRow = typeof videoProjects.$inferSelect;
export type PublishCopyRow = typeof publishCopies.$inferSelect;
export type FactCheckRow = typeof factChecks.$inferSelect;
export type ReviewChecklistRow = typeof reviewChecklists.$inferSelect;
export type AgentDefinitionRow = typeof agentDefinitions.$inferSelect;
export type AgentRunRow = typeof agentRuns.$inferSelect;
export type AgentRunStepRow = typeof agentRunSteps.$inferSelect;
export type AgentContextSnapshotRow = typeof agentContextSnapshots.$inferSelect;
export type QaResultRow = typeof qaResults.$inferSelect;
export type ProductionStudioEditRow = typeof productionStudioEdits.$inferSelect;
export type ProductionStudioGateRunRow = typeof productionStudioGateRuns.$inferSelect;
export type ProductionStudioLockRow = typeof productionStudioLocks.$inferSelect;
