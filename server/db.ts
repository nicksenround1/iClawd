import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMemoryEntry,
  InsertOpenclawConfig,
  InsertTokenUsage,
  InsertUser,
  MemoryEntry,
  OpenclawConfig,
  memoryEntries,
  openclawConfigs,
  tokenUsage,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
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
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── OpenClaw Config ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG: Omit<InsertOpenclawConfig, "userId"> = {
  gatewayUrl: "ws://localhost:18789",
  gatewayToken: null,
  botName: "ClawDBot",
  botEmoji: "🦞",
  botVibe: "helpful and concise",
  botCreature: "AI assistant",
  channelsJson: JSON.stringify({ telegram: { enabled: false }, whatsapp: { enabled: false } }),
  modelsJson: JSON.stringify({
    primary: "anthropic/claude-opus-4-5",
    fallbacks: ["openai/gpt-4o-mini"],
    providers: {},
    env: {},
  }),
  skillsJson: JSON.stringify({ entries: {} }),
  soulMd: "# Soul\n\nI am a helpful AI assistant.",
  activeModel: "anthropic/claude-opus-4-5",
};

export async function getOpenclawConfig(userId: number): Promise<OpenclawConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(openclawConfigs).where(eq(openclawConfigs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertOpenclawConfig(
  data: Partial<InsertOpenclawConfig> & { userId: number }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getOpenclawConfig(data.userId);
  if (existing) {
    const updateSet: Record<string, unknown> = {};
    const fields = [
      "gatewayUrl", "gatewayToken", "botName", "botEmoji", "botVibe", "botCreature",
      "channelsJson", "modelsJson", "skillsJson", "soulMd", "activeModel",
    ] as const;
    for (const f of fields) {
      if (data[f] !== undefined) updateSet[f] = data[f];
    }
    if (Object.keys(updateSet).length > 0) {
      await db.update(openclawConfigs).set(updateSet).where(eq(openclawConfigs.userId, data.userId));
    }
  } else {
    await db.insert(openclawConfigs).values({ ...DEFAULT_CONFIG, ...data });
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
  return db
    .select()
    .from(tokenUsage)
    .where(and(eq(tokenUsage.userId, userId), gte(tokenUsage.hourBucket, since)))
    .orderBy(desc(tokenUsage.hourBucket));
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
  return {
    totalTokens: rows.reduce((s, r) => s + r.totalTokens, 0),
    costCents: rows.reduce((s, r) => s + r.costCents, 0),
  };
}

// ─── Memory Entries ───────────────────────────────────────────────────────────

export async function getMemoryEntries(userId: number): Promise<MemoryEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(memoryEntries)
    .where(eq(memoryEntries.userId, userId))
    .orderBy(desc(memoryEntries.isPinned), desc(memoryEntries.updatedAt));
}

export async function createMemoryEntry(data: InsertMemoryEntry): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(memoryEntries).values(data);
}

export async function updateMemoryEntry(
  id: number,
  userId: number,
  updates: Partial<Pick<InsertMemoryEntry, "title" | "content" | "isPinned" | "category">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(memoryEntries)
    .set(updates)
    .where(and(eq(memoryEntries.id, id), eq(memoryEntries.userId, userId)));
}

export async function deleteMemoryEntry(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(memoryEntries).where(and(eq(memoryEntries.id, id), eq(memoryEntries.userId, userId)));
}
