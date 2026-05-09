CREATE TABLE `agent_context_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`step_id` text NOT NULL,
	`agent_slug` text NOT NULL,
	`context_json` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`step_id`) REFERENCES `agent_run_steps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_definitions` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`description` text NOT NULL,
	`required_context_json` text NOT NULL,
	`input_schema_summary` text NOT NULL,
	`output_schema_summary` text NOT NULL,
	`current_mode` text NOT NULL,
	`future_mode` text NOT NULL,
	`qa_checklist_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agent_run_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`agent_slug` text NOT NULL,
	`step_order` integer NOT NULL,
	`status` text NOT NULL,
	`input_json` text NOT NULL,
	`output_json` text,
	`input_summary` text NOT NULL,
	`output_summary` text,
	`started_at` text NOT NULL,
	`completed_at` text,
	`error_message` text,
	FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agent_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text,
	`article_title` text NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`error_message` text,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `qa_results` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`project_id` text,
	`summary_json` text NOT NULL,
	`red_rights_risk_count` integer NOT NULL,
	`fact_qa_json` text NOT NULL,
	`script_qa_json` text NOT NULL,
	`copyright_qa_json` text NOT NULL,
	`export_qa_json` text NOT NULL,
	`publish_qa_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `agent_runs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
