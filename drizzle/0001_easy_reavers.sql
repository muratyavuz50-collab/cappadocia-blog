CREATE TABLE `site_metrics` (
	`day` text NOT NULL,
	`kind` text NOT NULL,
	`path` text NOT NULL,
	`source` text NOT NULL,
	`label` text NOT NULL,
	`bucket` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `kind`, `path`, `source`, `label`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
