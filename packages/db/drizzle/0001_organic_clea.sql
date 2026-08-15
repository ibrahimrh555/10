PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`push_enabled` integer DEFAULT false NOT NULL,
	`game_invitations_enabled` integer DEFAULT true NOT NULL,
	`game_reminders_enabled` integer DEFAULT true NOT NULL,
	`chat_messages_enabled` integer DEFAULT true NOT NULL,
	`circle_updates_enabled` integer DEFAULT true NOT NULL,
	`marketing_enabled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notification_preferences`("id", "user_id", "push_enabled", "game_invitations_enabled", "game_reminders_enabled", "chat_messages_enabled", "circle_updates_enabled", "marketing_enabled", "created_at", "updated_at") SELECT "id", "user_id", "push_enabled", "game_invitations_enabled", "game_reminders_enabled", "chat_messages_enabled", "circle_updates_enabled", "marketing_enabled", "created_at", "updated_at" FROM `notification_preferences`;--> statement-breakpoint
DROP TABLE `notification_preferences`;--> statement-breakpoint
ALTER TABLE `__new_notification_preferences` RENAME TO `notification_preferences`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `notification_preferences_user_uidx` ON `notification_preferences` (`user_id`);