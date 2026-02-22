/**
 * iClawd Dashboard Router
 *
 * Procedures:
 *  - dashboard.botStatus   → Check Telegram Bot heartbeat via Bot API
 *  - dashboard.tokenUsage  → Get 24h token usage chart data
 *  - dashboard.todayStats  → Today's total tokens + cost
 *  - dashboard.saveConfig  → Save Bot Token / API Key to DB
 *  - dashboard.getConfig   → Get current bot config (keys masked)
 *  - dashboard.addTokenUsage → Record a new token usage entry (for testing)
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getBotConfig,
  getTokenUsageLast24h,
  getTodayTokenTotal,
  recordTokenUsage,
  upsertBotConfig,
} from "../db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Ping Telegram Bot API to check if the token is valid and the bot is reachable.
 * Returns { online, botName, uptimeMs } or { online: false, error }
 */
async function checkTelegramBotStatus(token: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
    const data = (await res.json()) as { ok: boolean; result?: { first_name: string; username: string } };
    if (!data.ok) return { online: false, error: "Telegram API returned ok=false" };
    return {
      online: true,
      botName: data.result?.first_name ?? "ClawDBot",
      username: data.result?.username ?? "",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { online: false, error: msg };
  }
}

/**
 * Fetch OpenAI usage for today via the Usage API.
 * Returns total tokens or null if unavailable.
 */
async function fetchOpenAIUsageToday(apiKey: string) {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const res = await fetch(
      `https://api.openai.com/v1/usage?date=${today}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: Array<{ n_context_tokens_total: number; n_generated_tokens_total: number }>;
    };
    if (!data.data) return null;
    const promptTokens = data.data.reduce((s, d) => s + (d.n_context_tokens_total ?? 0), 0);
    const completionTokens = data.data.reduce((s, d) => s + (d.n_generated_tokens_total ?? 0), 0);
    return { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens };
  } catch {
    return null;
  }
}

/**
 * Build a 24-hour chart from DB rows, filling missing hours with 0.
 */
function buildHourlyChart(rows: Array<{ hourBucket: number; totalTokens: number }>) {
  const now = Date.now();
  const hourMs = 3600 * 1000;
  const buckets: Record<number, number> = {};

  // Initialize last 24 hours with 0
  for (let i = 23; i >= 0; i--) {
    const bucket = Math.floor((now - i * hourMs) / hourMs) * hourMs;
    buckets[bucket] = 0;
  }

  // Fill actual data
  for (const row of rows) {
    if (row.hourBucket in buckets) {
      buckets[row.hourBucket] = (buckets[row.hourBucket] ?? 0) + row.totalTokens;
    }
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([ts, tokens]) => {
      const d = new Date(Number(ts));
      const h = d.getHours();
      return {
        time: `${String(h).padStart(2, "0")}:00`,
        tokens,
        timestamp: Number(ts),
      };
    });
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const dashboardRouter = router({
  /**
   * Check Telegram Bot heartbeat.
   * If no token configured, returns { online: false, configured: false }
   */
  botStatus: publicProcedure
    .input(z.object({ userId: z.number().optional() }).optional())
    .query(async ({ ctx }) => {
      // Try to get config from DB if user is logged in
      const userId = ctx.user?.id;
      if (!userId) {
        return { online: false, configured: false, error: "Not authenticated" };
      }

      const config = await getBotConfig(userId);
      if (!config?.telegramToken) {
        return { online: false, configured: false, error: "No Bot Token configured" };
      }

      const status = await checkTelegramBotStatus(config.telegramToken);
      return {
        ...status,
        configured: true,
        botName: status.online ? (status as { botName?: string }).botName ?? config.botName : config.botName,
      };
    }),

  /**
   * Get 24-hour token usage chart data from DB.
   * Also attempts to sync latest usage from OpenAI if API key is configured.
   */
  tokenUsage: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { chart: buildHourlyChart([]), synced: false };

    // Try to sync from OpenAI
    const config = await getBotConfig(userId);
    let synced = false;
    if (config?.openaiApiKey) {
      const usage = await fetchOpenAIUsageToday(config.openaiApiKey);
      if (usage && usage.totalTokens > 0) {
        const hourBucket = Math.floor(Date.now() / 3600000) * 3600000;
        // Only record if we don't already have a recent entry for this hour
        const existing = await getTokenUsageLast24h(userId);
        const thisHour = existing.find((r) => r.hourBucket === hourBucket);
        if (!thisHour) {
          await recordTokenUsage({
            userId,
            hourBucket,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            costCents: Math.round(usage.totalTokens * 0.002), // rough estimate
            model: config.activeModel ?? "gpt-4o",
          });
        }
        synced = true;
      }
    }

    const rows = await getTokenUsageLast24h(userId);
    return { chart: buildHourlyChart(rows), synced };
  }),

  /**
   * Today's totals: token count + estimated cost
   */
  todayStats: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return { totalTokens: 0, costCents: 0, conversations: 0 };
    const stats = await getTodayTokenTotal(userId);
    return { ...stats, conversations: 0 }; // conversations tracked separately
  }),

  /**
   * Save bot configuration (Bot Token + API Keys)
   */
  saveConfig: publicProcedure
    .input(
      z.object({
        botName: z.string().min(1).max(128).optional(),
        telegramToken: z.string().optional(),
        openaiApiKey: z.string().optional(),
        anthropicApiKey: z.string().optional(),
        activeModel: z.string().optional(),
        personalityTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id;
      if (!userId) throw new Error("Not authenticated");

      await upsertBotConfig({
        userId,
        botName: input.botName ?? "ClawDBot",
        telegramToken: input.telegramToken ?? null,
        openaiApiKey: input.openaiApiKey ?? null,
        anthropicApiKey: input.anthropicApiKey ?? null,
        activeModel: input.activeModel ?? "gpt-4o",
        personalityTags: input.personalityTags ? JSON.stringify(input.personalityTags) : undefined,
      });

      return { success: true };
    }),

  /**
   * Get current bot config (API keys are masked for security)
   */
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) return null;

    const config = await getBotConfig(userId);
    if (!config) return null;

    // Mask sensitive keys
    const maskKey = (key: string | null | undefined) =>
      key ? `${key.slice(0, 6)}${"*".repeat(Math.max(0, key.length - 10))}${key.slice(-4)}` : null;

    return {
      botName: config.botName,
      activeModel: config.activeModel,
      personalityTags: config.personalityTags,
      telegramTokenConfigured: !!config.telegramToken,
      telegramTokenMasked: maskKey(config.telegramToken),
      openaiApiKeyConfigured: !!config.openaiApiKey,
      openaiApiKeyMasked: maskKey(config.openaiApiKey),
      anthropicApiKeyConfigured: !!config.anthropicApiKey,
    };
  }),

  /**
   * Manually add a token usage record (for demo / testing purposes)
   */
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
        model: input.model ?? "gpt-4o",
      });

      return { success: true, totalTokens };
    }),
});
