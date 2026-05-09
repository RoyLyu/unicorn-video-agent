export const createSchemaSql = `
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  source_name TEXT NOT NULL,
  industry_tags_json TEXT NOT NULL,
  target_durations_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_projects (
  id TEXT PRIMARY KEY NOT NULL,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  status TEXT NOT NULL,
  production_pack_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analysis_runs (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_facts_json TEXT NOT NULL,
  industry_data_json TEXT NOT NULL,
  risks_json TEXT NOT NULL,
  core_theses_json TEXT NOT NULL,
  video_angle TEXT NOT NULL,
  audience_takeaway TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scripts (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  lines_json TEXT NOT NULL,
  closing TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shots (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  shot_id TEXT NOT NULL,
  time_range TEXT NOT NULL,
  scene TEXT NOT NULL,
  narration TEXT NOT NULL,
  visual TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  rights_level TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_prompts (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  scene_ref TEXT,
  prompt TEXT,
  negative_prompt TEXT,
  query TEXT,
  platform TEXT,
  intended_use TEXT,
  license_requirement TEXT,
  notes TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rights_checks (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  level TEXT NOT NULL,
  reason TEXT NOT NULL,
  action TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS export_manifests (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  files_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_logs (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS publish_copies (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  cover_title TEXT NOT NULL,
  title_candidates_json TEXT NOT NULL,
  publish_text TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  risk_notice TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_checks (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_checklists (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  completed INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
