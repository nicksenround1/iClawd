import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bot configurations - stores encrypted Bot Token and API keys
 * Each user can have one active bot config
 */
export const botConfigs = mysqlTable("bot_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  botName: varchar("botName", { length: 128 }).default("ClawDBot").notNull(),
  // Telegram Bot Token (stored as-is; in production should be encrypted)
  telegramToken: text("telegramToken"),
  // OpenAI API Key
  openaiApiKey: text("openaiApiKey"),
  // Other LLM provider keys
  anthropicApiKey: text("anthropicApiKey"),
  // Active model
  activeModel: varchar("activeModel", { length: 64 }).default("gpt-4o").notNull(),
  // Personality tags (JSON array stored as varchar)
  personalityTags: varchar("personalityTags", { length: 512 }).default('["direct","logical"]'),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotConfig = typeof botConfigs.$inferSelect;
export type InsertBotConfig = typeof botConfigs.$inferInsert;

/**
 * Token usage records - stores per-hour token consumption snapshots
 * Used to power the 24h Token usage chart in the dashboard
 */
export const tokenUsage = mysqlTable("token_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Hour bucket: Unix timestamp rounded to the hour (ms)
  hourBucket: bigint("hourBucket", { mode: "number" }).notNull(),
  // Token counts
  promptTokens: int("promptTokens").default(0).notNull(),
  completionTokens: int("completionTokens").default(0).notNull(),
  totalTokens: int("totalTokens").default(0).notNull(),
  // Estimated cost in USD cents
  costCents: int("costCents").default(0).notNull(),
  // Model used
  model: varchar("model", { length: 64 }).default("gpt-4o").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type InsertTokenUsage = typeof tokenUsage.$inferInsert;
