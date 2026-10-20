CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`session` text NOT NULL,
	`day` text NOT NULL,
	`at` integer NOT NULL,
	`seq` integer NOT NULL,
	`kind` text NOT NULL,
	`action` text DEFAULT '' NOT NULL,
	`screen` text NOT NULL,
	`entity` text DEFAULT '' NOT NULL,
	`active_ms` integer DEFAULT 0 NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`device` text NOT NULL,
	`traffic` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_day_idx` ON `analytics_events` (`day`,`traffic`);--> statement-breakpoint
CREATE INDEX `analytics_session_idx` ON `analytics_events` (`session`,`at`,`seq`);--> statement-breakpoint
CREATE INDEX `analytics_visitor_idx` ON `analytics_events` (`visitor`,`day`);--> statement-breakpoint
CREATE TABLE `analytics_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`traffic` text NOT NULL,
	`visitors` integer NOT NULL,
	`sessions` integer NOT NULL,
	`new_visitors` integer NOT NULL,
	`returning_visitors` integer NOT NULL,
	`page_views` integer NOT NULL,
	`clicks` integer NOT NULL,
	`active_ms` integer NOT NULL,
	`guide_views` integer NOT NULL,
	`plans` integer NOT NULL,
	`errors` integer NOT NULL,
	`globe_loads` integer NOT NULL,
	`globe_load_ms` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_daily_day_idx` ON `analytics_daily` (`day`,`traffic`);--> statement-breakpoint
CREATE TABLE `analytics_visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`first_day` text NOT NULL,
	`last_day` text NOT NULL,
	`traffic` text NOT NULL
);
