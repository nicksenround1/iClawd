CREATE TABLE `bot_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`botName` varchar(128) NOT NULL DEFAULT 'ClawDBot',
	`telegramToken` text,
	`openaiApiKey` text,
	`anthropicApiKey` text,
	`activeModel` varchar(64) NOT NULL DEFAULT 'gpt-4o',
	`personalityTags` varchar(512) DEFAULT '["direct","logical"]',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bot_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`hourBucket` bigint NOT NULL,
	`promptTokens` int NOT NULL DEFAULT 0,
	`completionTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`costCents` int NOT NULL DEFAULT 0,
	`model` varchar(64) NOT NULL DEFAULT 'gpt-4o',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `token_usage_id` PRIMARY KEY(`id`)
);
