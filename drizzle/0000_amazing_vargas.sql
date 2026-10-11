CREATE TABLE `administrators` (
	`slot` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bound_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`slug` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`joined_at` text NOT NULL,
	`accepted_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `article_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`action` text NOT NULL,
	`revision` integer NOT NULL,
	`saved_at` text NOT NULL,
	`saved_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_article_revisions_slug_saved_at` ON `article_revisions` (`slug`,`saved_at`);