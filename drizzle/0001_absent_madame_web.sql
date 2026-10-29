CREATE TABLE `analytics_daily_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`traffic` text NOT NULL,
	`module` text NOT NULL,
	`visitors` integer NOT NULL,
	`sessions` integer NOT NULL,
	`clicks` integer NOT NULL,
	`views` integer NOT NULL,
	`active_ms` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_modules_day_idx` ON `analytics_daily_modules` (`day`,`traffic`);--> statement-breakpoint
ALTER TABLE `analytics_events` ADD `module` text DEFAULT 'unattributed' NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_daily` ADD `trip_adds` integer;