CREATE TABLE `production_studio_edits` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version_type` text NOT NULL,
	`shot_number` integer NOT NULL,
	`edit_type` text NOT NULL,
	`patch_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `production_studio_gate_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`density_profile` text NOT NULL,
	`status` text NOT NULL,
	`shot_count_90s` integer NOT NULL,
	`shot_count_180s` integer NOT NULL,
	`prompt_count` integer NOT NULL,
	`unmatched_shots_json` text NOT NULL,
	`unmatched_prompts_json` text NOT NULL,
	`red_risks_without_replacement_json` text NOT NULL,
	`scores_json` text NOT NULL,
	`needs_fix` integer NOT NULL,
	`fix_reasons_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `production_studio_locks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`locked` integer NOT NULL,
	`locked_at` text,
	`lock_note` text,
	`gate_run_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gate_run_id`) REFERENCES `production_studio_gate_runs`(`id`) ON UPDATE no action ON DELETE set null
);
