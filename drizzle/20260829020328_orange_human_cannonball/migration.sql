CREATE TABLE `accounts` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`created_at` text DEFAULT '',
	`updated_at` text DEFAULT '',
	CONSTRAINT `fk_accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL UNIQUE,
	`key_preview` text NOT NULL,
	`created_at` text DEFAULT '',
	`last_used_at` text,
	CONSTRAINT `fk_api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY,
	`user_id` text,
	`content` text NOT NULL,
	`source` text DEFAULT 'web',
	`status` text DEFAULT 'inbox',
	`tags` text,
	`pinned` integer DEFAULT 0,
	`background_color` text,
	`deleted_at` text,
	`created_at` text DEFAULT '',
	`updated_at` text DEFAULT '',
	CONSTRAINT `fk_ideas_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY,
	`name` text,
	`email` text NOT NULL UNIQUE,
	`image` text,
	`created_at` text DEFAULT '',
	`updated_at` text DEFAULT ''
);
--> statement-breakpoint
CREATE INDEX `idx_accounts_user_id` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_provider_account` ON `accounts` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_user_id` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_key_hash` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `idx_ideas_user_status_created` ON `ideas` (`user_id`,`status`,`created_at`);