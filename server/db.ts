import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ─── Bot Configs ──────────────────────────────────────────────────────────────
import { and, desc, gte } from "drizzle-orm";
import { botConfigs, tokenUsage, type BotConfig, type InsertBotConfig, type InsertTokenUsage } from "../drizzle/schema";

export async function getBotConfig(userId: number): Promise<BotConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(botConfigs).where(eq(botConfigs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBotConfig(data: InsertBotConfig): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getBotConfig(data.userId);
  if (existing) {
    const updateSet: Partial<InsertBotConfig> = {};
    if (data.botName !== undefined) updateSet.botName = data.botName;
    if (data.telegramToken !== undefined) updateSet.telegramToken = data.telegramToken;
    if (data.openaiApiKey !== undefined) updateSet.openaiApiKey = data.openaiApiKey;
    if (data.anthropicApiKey !== undefined) updateSet.anthropicApiKey = data.anthropicApiKey;
    if (data.activeModel !== undefined) updateSet.activeModel = data.activeModel;
    if (data.personalityTags !== undefined) updateSet.personalityTags = data.personalityTags;
    await db.update(botConfigs).set(updateSet).where(eq(botConfigs.userId, data.userId));
  } else {
    await db.insert(botConfigs).values(data);
  }
}

// ─── Token Usage ──────────────────────────────────────────────────────────────

export async function recordTokenUsage(data: InsertTokenUsage): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tokenUsage).values(data);
}

export async function getTokenUsageLast24h(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const rows = await db
    .select()
    .from(tokenUsage)
    .where(and(eq(tokenUsage.userId, userId), gte(tokenUsage.hourBucket, since)))
    .orderBy(desc(tokenUsage.hourBucket));
  return rows;
}

export async function getTodayTokenTotal(userId: number) {
  const db = await getDb();
  if (!db) return { totalTokens: 0, costCents: 0 };
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const rows = await db
    .select()
    .from(tokenUsage)
    .where(and(eq(tokenUsage.userId, userId), gte(tokenUsage.hourBucket, startOfDay.getTime())));
  const totalTokens = rows.reduce((sum, r) => sum + r.totalTokens, 0);
  const costCents = rows.reduce((sum, r) => sum + r.costCents, 0);
  return { totalTokens, costCents };
}
