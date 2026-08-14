CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_provider_account_uidx` ON `account` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`threshold` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "badges_threshold_check" CHECK("badges"."threshold" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `badges_category_threshold_uidx` ON `badges` (`category`,`threshold`);--> statement-breakpoint
CREATE INDEX `badges_active_idx` ON `badges` (`active`);--> statement-breakpoint
CREATE TABLE `circle_members` (
	`id` text PRIMARY KEY NOT NULL,
	`circle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `circle_members_circle_user_uidx` ON `circle_members` (`circle_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `circle_members_user_idx` ON `circle_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `circle_members_status_idx` ON `circle_members` (`status`);--> statement-breakpoint
CREATE TABLE `circles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`privacy` text DEFAULT 'private' NOT NULL,
	`share_code` text NOT NULL,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `circles_share_code_unique` ON `circles` (`share_code`);--> statement-breakpoint
CREATE INDEX `circles_owner_idx` ON `circles` (`owner_id`);--> statement-breakpoint
CREATE INDEX `circles_name_idx` ON `circles` (`name`);--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`country_code` text DEFAULT 'MA' NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`google_place_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_google_place_id_unique` ON `cities` (`google_place_id`);--> statement-breakpoint
CREATE INDEX `cities_name_idx` ON `cities` (`name`);--> statement-breakpoint
CREATE INDEX `cities_country_idx` ON `cities` (`country_code`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` text PRIMARY KEY NOT NULL,
	`city_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`phone` text,
	`image` text,
	`google_place_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_google_place_id_unique` ON `clubs` (`google_place_id`);--> statement-breakpoint
CREATE INDEX `clubs_city_idx` ON `clubs` (`city_id`);--> statement-breakpoint
CREATE INDEX `clubs_name_idx` ON `clubs` (`name`);--> statement-breakpoint
CREATE TABLE `connection_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "connection_requests_not_self_check" CHECK("connection_requests"."sender_id" <> "connection_requests"."receiver_id")
);
--> statement-breakpoint
CREATE INDEX `connection_requests_sender_idx` ON `connection_requests` (`sender_id`);--> statement-breakpoint
CREATE INDEX `connection_requests_receiver_idx` ON `connection_requests` (`receiver_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `connection_requests_pending_pair_uidx` ON `connection_requests` (min("sender_id", "receiver_id"), max("sender_id", "receiver_id")) WHERE "status" = 'pending';--> statement-breakpoint
CREATE TABLE `game_circles` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`circle_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_circles_game_circle_uidx` ON `game_circles` (`game_id`,`circle_id`);--> statement-breakpoint
CREATE INDEX `game_circles_circle_idx` ON `game_circles` (`circle_id`);--> statement-breakpoint
CREATE TABLE `game_formats` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`players_per_team` integer NOT NULL,
	`max_players` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "format_capacity_check" CHECK("game_formats"."players_per_team" > 0 and "game_formats"."max_players" >= "game_formats"."players_per_team" * 2)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_formats_name_unique` ON `game_formats` (`name`);--> statement-breakpoint
CREATE TABLE `game_guests` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`sponsor_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'accepted' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sponsor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `game_guests_game_idx` ON `game_guests` (`game_id`);--> statement-breakpoint
CREATE INDEX `game_guests_sponsor_idx` ON `game_guests` (`sponsor_id`);--> statement-breakpoint
CREATE TABLE `game_players` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`user_id` text NOT NULL,
	`invited_by_id` text,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`is_host` integer DEFAULT false NOT NULL,
	`joined_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`invited_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_players_game_user_uidx` ON `game_players` (`game_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `game_players_game_idx` ON `game_players` (`game_id`);--> statement-breakpoint
CREATE INDEX `game_players_user_idx` ON `game_players` (`user_id`);--> statement-breakpoint
CREATE INDEX `game_players_status_idx` ON `game_players` (`status`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`host_id` text NOT NULL,
	`club_id` text NOT NULL,
	`format_id` text NOT NULL,
	`date` integer NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'MAD' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`joinable_at` integer,
	`invitation_code` text NOT NULL,
	`cancellation_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`host_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`format_id`) REFERENCES `game_formats`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "games_price_check" CHECK("games"."price" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_invitation_code_unique` ON `games` (`invitation_code`);--> statement-breakpoint
CREATE INDEX `games_host_idx` ON `games` (`host_id`);--> statement-breakpoint
CREATE INDEX `games_club_idx` ON `games` (`club_id`);--> statement-breakpoint
CREATE INDEX `games_format_idx` ON `games` (`format_id`);--> statement-breakpoint
CREATE INDEX `games_date_idx` ON `games` (`date`);--> statement-breakpoint
CREATE INDEX `games_status_idx` ON `games` (`status`);--> statement-breakpoint
CREATE INDEX `games_visibility_idx` ON `games` (`visibility`);--> statement-breakpoint
CREATE TABLE `notification_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`subscription_id` text NOT NULL,
	`platform` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_seen_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_devices_subscription_id_unique` ON `notification_devices` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `notification_devices_user_idx` ON `notification_devices` (`user_id`);--> statement-breakpoint
CREATE INDEX `notification_devices_active_idx` ON `notification_devices` (`active`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`push_enabled` integer DEFAULT true NOT NULL,
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
CREATE UNIQUE INDEX `notification_preferences_user_id_unique` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`read_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`read_at`);--> statement-breakpoint
CREATE INDEX `notifications_created_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_inbox_idx` ON `notifications` (`user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_expires_idx` ON `session` (`expires_at`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`phone_number` text,
	`phone_number_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`date_of_birth` integer,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`city_id` text,
	`profile_photo_step_completed` integer DEFAULT false NOT NULL,
	`notification_permission_asked` integer DEFAULT false NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);--> statement-breakpoint
CREATE INDEX `user_city_idx` ON `user` (`city_id`);--> statement-breakpoint
CREATE INDEX `user_name_idx` ON `user` (`name`);--> statement-breakpoint
CREATE INDEX `user_deleted_idx` ON `user` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`badge_id` text NOT NULL,
	`unlocked_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_badges_user_badge_uidx` ON `user_badges` (`user_id`,`badge_id`);--> statement-breakpoint
CREATE INDEX `user_badges_badge_idx` ON `user_badges` (`badge_id`);--> statement-breakpoint
CREATE TABLE `user_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_one_id` text NOT NULL,
	`user_two_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_one_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_two_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "user_connections_canonical_check" CHECK("user_connections"."user_one_id" < "user_connections"."user_two_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_connections_pair_uidx` ON `user_connections` (`user_one_id`,`user_two_id`);--> statement-breakpoint
CREATE INDEX `user_connections_two_idx` ON `user_connections` (`user_two_id`);--> statement-breakpoint
CREATE TABLE `user_tracking` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`games_played` integer DEFAULT 0 NOT NULL,
	`games_hosted` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "tracking_nonnegative_check" CHECK("user_tracking"."games_played" >= 0 and "user_tracking"."games_hosted" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_tracking_user_id_unique` ON `user_tracking` (`user_id`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `verification_expires_idx` ON `verification` (`expires_at`);
