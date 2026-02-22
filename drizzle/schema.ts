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
 * OpenClaw configuration - mirrors ~/.openclaw/openclaw.json structure
 * Each user stores their OpenClaw Gateway connection info and config
 */
export const openclawConfigs = mysqlTable("openclaw_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),

  // Gateway connection
  gatewayUrl: varchar("gatewayUrl", { length: 256 }).notNull(),
  gatewayToken: text("gatewayToken"),

  // Bot identity
  botName: varchar("botName", { length: 128 }).notNull(),
  botEmoji: varchar("botEmoji", { length: 16 }).notNull(),
  botVibe: varchar("botVibe", { length: 256 }).notNull(),
  botCreature: varchar("botCreature", { length: 128 }).notNull(),

  // Channels (JSON) - telegram/whatsapp/discord config
  channelsJson: text("channelsJson"),

  // Models (JSON) - primary model + fallbacks + provider API keys
  modelsJson: text("modelsJson"),

  // Skills (JSON) - enabled/disabled skills + API keys
  skillsJson: text("skillsJson"),

  // SOUL.md content
  soulMd: text("soulMd"),

  // Active model shorthand
  activeModel: varchar("activeModel", { length: 128 }).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OpenclawConfig = typeof openclawConfigs.$inferSelect;
export type InsertOpenclawConfig = typeof openclawConfigs.$inferInsert;

/**
 * Token usage records - stores per-hour token consumption snapshots
 */
export const tokenUsage = mysqlTable("token_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  hourBucket: bigint("hourBucket", { mode: "number" }).notNull(),
  promptTokens: int("promptTokens").default(0).notNull(),
  completionTokens: int("completionTokens").default(0).notNull(),
  totalTokens: int("totalTokens").default(0).notNull(),
  costCents: int("costCents").default(0).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type InsertTokenUsage = typeof tokenUsage.$inferInsert;

/**
 * Memory entries - mirrors ~/.openclaw/workspace/memory/ files
 */
export const memoryEntries = mysqlTable("memory_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  isPinned: int("isPinned").default(0).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemoryEntry = typeof memoryEntries.$inferSelect;
export type InsertMemoryEntry = typeof memoryEntries.$inferInsert;
