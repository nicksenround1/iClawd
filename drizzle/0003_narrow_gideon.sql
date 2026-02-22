CREATE TABLE `memory_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`isPinned` int NOT NULL DEFAULT 0,
	`category` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memory_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `openclaw_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gatewayUrl` varchar(256) NOT NULL,
	`gatewayToken` text,
	`botName` varchar(128) NOT NULL,
	`botEmoji` varchar(16) NOT NULL,
	`botVibe` varchar(256) NOT NULL,
	`botCreature` varchar(128) NOT NULL,
	`channelsJson` text,
	`modelsJson` text,
	`skillsJson` text,
	`soulMd` text,
	`activeModel` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `openclaw_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `openclaw_configs_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
DROP TABLE `bot_configs`;--> statement-breakpoint
ALTER TABLE `token_usage` MODIFY COLUMN `model` varchar(128) NOT NULL;