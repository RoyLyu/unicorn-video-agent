CREATE TABLE `analysis_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`summary` text NOT NULL,
	`key_facts_json` text NOT NULL,
	`industry_data_json` text NOT NULL,
	`risks_json` text NOT NULL,
	`core_theses_json` text NOT NULL,
	`video_angle` text NOT NULL,
	`audience_takeaway` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`raw_text` text NOT NULL,
	`source_url` text NOT NULL,
	`publish_date` text NOT NULL,
	`source_name` text NOT NULL,
	`industry_tags_json` text NOT NULL,
	`target_durations_json` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `asset_prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`prompt_type` text NOT NULL,
	`scene_ref` text,
	`prompt` text,
	`negative_prompt` text,
	`query` text,
	`platform` text,
	`intended_use` text,
	`license_requirement` text,
	`notes` text,
	`position` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `export_manifests` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`files_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`event_type` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rights_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`item` text NOT NULL,
	`level` text NOT NULL,
	`reason` text NOT NULL,
	`action` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`duration` integer NOT NULL,
	`title` text NOT NULL,
	`hook` text NOT NULL,
	`lines_json` text NOT NULL,
	`closing` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `shots` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`shot_id` text NOT NULL,
	`time_range` text NOT NULL,
	`scene` text NOT NULL,
	`narration` text NOT NULL,
	`visual` text NOT NULL,
	`asset_type` text NOT NULL,
	`rights_level` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `video_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`title` text NOT NULL,
	`source_name` text NOT NULL,
	`status` text NOT NULL,
	`production_pack_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
