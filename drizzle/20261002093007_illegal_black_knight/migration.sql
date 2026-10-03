PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
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
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	CONSTRAINT `fk_accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`id`, `user_id`, `type`, `provider`, `provider_account_id`, `access_token`, `refresh_token`, `expires_at`, `token_type`, `scope`, `id_token`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `type`, `provider`, `provider_account_id`, `access_token`, `refresh_token`, `expires_at`, `token_type`, `scope`, `id_token`, `created_at`, `updated_at` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_api_keys` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL UNIQUE,
	`key_preview` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	`last_used_at` text,
	CONSTRAINT `fk_api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_api_keys`(`id`, `user_id`, `name`, `key_hash`, `key_preview`, `created_at`, `last_used_at`) SELECT `id`, `user_id`, `name`, `key_hash`, `key_preview`, `created_at`, `last_used_at` FROM `api_keys`;--> statement-breakpoint
DROP TABLE `api_keys`;--> statement-breakpoint
ALTER TABLE `__new_api_keys` RENAME TO `api_keys`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ideas` (
	`id` text PRIMARY KEY,
	`user_id` text,
	`content` text NOT NULL,
	`source` text DEFAULT 'web',
	`status` text DEFAULT 'inbox',
	`tags` text,
	`pinned` integer DEFAULT 0,
	`background_color` text,
	`deleted_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	CONSTRAINT `fk_ideas_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_ideas`(`id`, `user_id`, `content`, `source`, `status`, `tags`, `pinned`, `background_color`, `deleted_at`, `created_at`, `updated_at`) SELECT `id`, `user_id`, `content`, `source`, `status`, `tags`, `pinned`, `background_color`, `deleted_at`, `created_at`, `updated_at` FROM `ideas`;--> statement-breakpoint
DROP TABLE `ideas`;--> statement-breakpoint
ALTER TABLE `__new_ideas` RENAME TO `ideas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY,
	`name` text,
	`email` text NOT NULL UNIQUE,
	`image` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `name`, `email`, `image`, `created_at`, `updated_at`) SELECT `id`, `name`, `email`, `image`, `created_at`, `updated_at` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_accounts_user_id` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_provider_account` ON `accounts` (`provider`,`provider_account_id`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_user_id` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_key_hash` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `idx_ideas_user_status_created` ON `ideas` (`user_id`,`status`,`created_at`);