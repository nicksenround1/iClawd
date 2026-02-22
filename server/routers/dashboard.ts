/**
 * iClawd Dashboard Router - OpenClaw Aligned
 *
 * Procedures:
 *  - dashboard.gatewayStatus   → Check OpenClaw Gateway health
 *  - dashboard.getConfig       → Get current OpenClaw config (keys masked)
 *  - dashboard.saveConfig      → Save gateway URL, bot identity, channels
 *  - dashboard.saveModels      → Save model providers + API keys
 *  - dashboard.saveSkills      → Save skills configuration
 *  - dashboard.saveSoul        → Save SOUL.md content
 *  - dashboard.tokenUsage      → Get 24h token usage chart
 *  - dashboard.todayStats      → Today's total tokens + cost
 *  - dashboard.addTokenUsage   → Record a token usage entry (demo/testing)
 *  - dashboard.exportConfig    → Export openclaw.json config snippet
 *  - dashboard.getMemories     → List all memory entries
 *  - dashboard.createMemory    → Create a new memory entry
 *  - dashboard.updateMemory    → Update a memory entry
 *  - dashboard.deleteMemory    → Delete a memory entry
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createMemoryEntry,
  deleteMemoryEntry,
  getMemoryEntries,
  getOpenclawConfig,
  getTokenUsageLast24h,
  getTodayTokenTotal,
  recordTokenUsage,
  updateMemoryEntry,
  upsertOpenclawConfig,
} from "../db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function checkGatewayHealth(gatewayUrl: string, token?: string | null) {
  try {
    const httpUrl = gatewayUrl.replace(/^ws(s?):\/\//, "http$1://");
    const url = `${httpUrl}/health`;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      return { online: true, data };
    }
    return { online: false, error: `HTTP ${res.status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      return { online: false, error: "Gateway not running (connection refused)" };
    }
    return { online: false, error: msg };
  }
}

function buildHourlyChart(rows: Array<{ hourBucket: number; totalTokens: number }>) {
  const now = Date.now();
  const hourMs = 3600 * 1000;
  const buckets: Record<number, number> = {};

  for (let i = 23; i >= 0; i--) {
    const bucket = Math.floor((now - i * hourMs) / hourMs) * hourMs;
    buckets[bucket] = 0;
  }

  for (const row of rows) {
    if (row.hourBucket in buckets) {
      buckets[row.hourBucket] = (buckets[row.hourBucket] ?? 0) + row.totalTokens;
    }
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([ts, tokens]) => {
      const d = new Date(Number(ts));
      return {
        time: `${String(d.getHours()).padStart(2, "0")}:00`,
        tokens,
        timestamp: Number(ts),
      };
    });
}

function maskKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.length <= 10) return "***";
  return `${key.slice(0, 6)}${"*".repeat(Math.max(0, key.length - 10))}${key.slice(-4)}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const dashboardRouter = router({
  gatewayStatus: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { online: false, configured: false, error: "Not authenticated" };

    const config = await getOpenclawConfig(userId);
    if (!config) {
      return { online: false, configured: false, error: "No gateway configured" };
    }

    const status = await checkGatewayHealth(config.gatewayUrl, config.gatewayToken);
    return {
      ...status,
      configured: true,
      gatewayUrl: config.gatewayUrl,
      botName: config.botName,
      botEmoji: config.botEmoji,
    };
  }),

  getConfig: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return null;

    const config = await getOpenclawConfig(userId);
    if (!config) return null;

    let channels: Record<string, unknown> = {};
    let models: Record<string, unknown> = {};
    let skills: Record<string, unknown> = {};

    try {
      channels = JSON.parse(config.channelsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }
    try {
      models = JSON.parse(config.modelsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }
    try {
      skills = JSON.parse(config.skillsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }

    const maskedEnv: Record<string, string | null> = {};
    const env = (models.env ?? {}) as Record<string, string>;
    for (const [k, v] of Object.entries(env)) {
      maskedEnv[k] = maskKey(v);
    }

    return {
      gatewayUrl: config.gatewayUrl,
      gatewayTokenConfigured: !!config.gatewayToken,
      gatewayTokenMasked: maskKey(config.gatewayToken),
      botName: config.botName,
      botEmoji: config.botEmoji,
      botVibe: config.botVibe,
      botCreature: config.botCreature,
      activeModel: config.activeModel,
      soulMd: config.soulMd,
      channels,
      models: { ...models, env: maskedEnv },
      skills,
    };
  }),

  saveConfig: publicProcedure
    .input(
      z.object({
        gatewayUrl: z.string().optional(),
        gatewayToken: z.string().optional(),
        botName: z.string().min(1).max(128).optional(),
        botEmoji: z.string().max(16).optional(),
        botVibe: z.string().max(256).optional(),
        botCreature: z.string().max(128).optional(),
        channels: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await upsertOpenclawConfig({
        userId,
        ...(input.gatewayUrl && { gatewayUrl: input.gatewayUrl }),
        ...(input.gatewayToken !== undefined && { gatewayToken: input.gatewayToken }),
        ...(input.botName && { botName: input.botName }),
        ...(input.botEmoji && { botEmoji: input.botEmoji }),
        ...(input.botVibe && { botVibe: input.botVibe }),
        ...(input.botCreature && { botCreature: input.botCreature }),
        ...(input.channels && { channelsJson: JSON.stringify(input.channels) }),
      });

      return { success: true };
    }),

  saveModels: publicProcedure
    .input(
      z.object({
        primary: z.string().optional(),
        fallbacks: z.array(z.string()).optional(),
        env: z.record(z.string(), z.string()).optional(),
        providers: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const existing = await getOpenclawConfig(userId);
      let currentModels: Record<string, unknown> = {};
      try {
        currentModels = JSON.parse(existing?.modelsJson ?? "{}") as Record<string, unknown>;
      } catch { /* ignore */ }

      const updatedModels = {
        ...currentModels,
        ...(input.primary && { primary: input.primary }),
        ...(input.fallbacks && { fallbacks: input.fallbacks }),
        ...(input.env && { env: { ...(currentModels.env as object ?? {}), ...input.env } }),
        ...(input.providers && { providers: { ...(currentModels.providers as object ?? {}), ...input.providers } }),
      };

      await upsertOpenclawConfig({
        userId,
        modelsJson: JSON.stringify(updatedModels),
        ...(input.primary && { activeModel: input.primary }),
      });

      return { success: true };
    }),

  saveSkills: publicProcedure
    .input(
      z.object({
        entries: z.record(
          z.string(),
          z.object({
            enabled: z.boolean(),
            apiKey: z.string().optional(),
            env: z.record(z.string(), z.string()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await upsertOpenclawConfig({
        userId,
        skillsJson: JSON.stringify({ entries: input.entries }),
      });

      return { success: true };
    }),

  saveSoul: publicProcedure
    .input(z.object({ soulMd: z.string().max(50000) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await upsertOpenclawConfig({ userId, soulMd: input.soulMd });
      return { success: true };
    }),

  exportConfig: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) throw new Error("Not authenticated");

    const config = await getOpenclawConfig(userId);
    if (!config) throw new Error("No config found");

    let models: Record<string, unknown> = {};
    let channels: Record<string, unknown> = {};
    let skills: Record<string, unknown> = {};

    try {
      models = JSON.parse(config.modelsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }
    try {
      channels = JSON.parse(config.channelsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }
    try {
      skills = JSON.parse(config.skillsJson ?? "{}") as Record<string, unknown>;
    } catch { /* ignore */ }

    const openclawJson = {
      gateway: {
        port: 18789,
        bind: "loopback",
        ...(config.gatewayToken && { auth: { mode: "token", token: config.gatewayToken } }),
      },
      agents: {
        defaults: {
          model: {
            primary: config.activeModel,
            fallbacks: (models.fallbacks as string[]) ?? [],
          },
        },
        list: [
          {
            id: "main",
            identity: {
              name: config.botName,
              creature: config.botCreature,
              vibe: config.botVibe,
              emoji: config.botEmoji,
            },
          },
        ],
      },
      channels,
      models: {
        mode: "merge",
        providers: (models.providers as object) ?? {},
      },
      env: (models.env as object) ?? {},
      skills,
    };

    return { json: JSON.stringify(openclawJson, null, 2) };
  }),

  tokenUsage: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { chart: buildHourlyChart([]), synced: false };
    const rows = await getTokenUsageLast24h(userId);
    return { chart: buildHourlyChart(rows), synced: false };
  }),

  todayStats: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { totalTokens: 0, costCents: 0, conversations: 0 };
    const stats = await getTodayTokenTotal(userId);
    return { ...stats, conversations: 0 };
  }),

  addTokenUsage: publicProcedure
    .input(
      z.object({
        promptTokens: z.number().int().min(0),
        completionTokens: z.number().int().min(0),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const totalTokens = input.promptTokens + input.completionTokens;
      const hourBucket = Math.floor(Date.now() / 3600000) * 3600000;

      await recordTokenUsage({
        userId,
        hourBucket,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens,
        costCents: Math.round(totalTokens * 0.002),
        model: input.model ?? "anthropic/claude-opus-4-5",
      });

      return { success: true, totalTokens };
    }),

  getMemories: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return [];
    return getMemoryEntries(userId);
  }),

  createMemory: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        content: z.string().min(1).max(10000),
        category: z.string().max(64).default("general"),
        isPinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await createMemoryEntry({
        userId,
        title: input.title,
        content: input.content,
        category: input.category,
        isPinned: input.isPinned ? 1 : 0,
      });

      return { success: true };
    }),

  updateMemory: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(256).optional(),
        content: z.string().min(1).max(10000).optional(),
        category: z.string().max(64).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { id, isPinned, ...rest } = input;
      await updateMemoryEntry(id, userId, {
        ...rest,
        ...(isPinned !== undefined && { isPinned: isPinned ? 1 : 0 }),
      });

      return { success: true };
    }),

  deleteMemory: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await deleteMemoryEntry(input.id, userId);
      return { success: true };
    }),
});
