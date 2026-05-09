CREATE TABLE `fact_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`item_type` text NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`source_url` text NOT NULL,
	`status` text NOT NULL,
	`notes` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `publish_copies` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`cover_title` text NOT NULL,
	`title_candidates_json` text NOT NULL,
	`publish_text` text NOT NULL,
	`tags_json` text NOT NULL,
	`risk_notice` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_checklists` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`item_key` text NOT NULL,
	`label` text NOT NULL,
	`completed` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `video_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
