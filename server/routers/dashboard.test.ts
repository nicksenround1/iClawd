/**
 * Unit tests for the dashboard router
 * Tests: botStatus, tokenUsage, todayStats, saveConfig, getConfig, addTokenUsage
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("../db", () => ({
  getBotConfig: vi.fn(),
  upsertBotConfig: vi.fn(),
  recordTokenUsage: vi.fn(),
  getTokenUsageLast24h: vi.fn(),
  getTodayTokenTotal: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getDb: vi.fn(),
}));

import * as db from "../db";

// ─── Mock fetch for Telegram API ──────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Helper: create test context ─────────────────────────────────────────────

function createCtx(userId?: number): TrpcContext {
  return {
    user: userId
      ? {
          id: userId,
          openId: "test-open-id",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("dashboard.botStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns not-authenticated when no user in context", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dashboard.botStatus();
    expect(result.online).toBe(false);
    expect(result.configured).toBe(false);
    expect(result.error).toContain("authenticated");
  });

  it("returns not-configured when no token in DB", async () => {
    vi.mocked(db.getBotConfig).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.botStatus();
    expect(result.online).toBe(false);
    expect(result.configured).toBe(false);
  });

  it("returns online=true when Telegram API responds ok", async () => {
    vi.mocked(db.getBotConfig).mockResolvedValue({
      id: 1,
      userId: 1,
      botName: "TestBot",
      telegramToken: "123456:ABC-DEF",
      openaiApiKey: null,
      anthropicApiKey: null,
      activeModel: "gpt-4o",
      personalityTags: '["direct"]',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        result: { first_name: "TestBot", username: "testbot" },
      }),
    });

    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.botStatus();
    expect(result.online).toBe(true);
    expect(result.configured).toBe(true);
    expect((result as { username?: string }).username).toBe("testbot");
  });

  it("returns online=false when Telegram API returns error", async () => {
    vi.mocked(db.getBotConfig).mockResolvedValue({
      id: 1,
      userId: 1,
      botName: "TestBot",
      telegramToken: "invalid-token",
      openaiApiKey: null,
      anthropicApiKey: null,
      activeModel: "gpt-4o",
      personalityTags: '["direct"]',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.botStatus();
    expect(result.online).toBe(false);
    expect((result as { error?: string }).error).toContain("401");
  });
});

describe("dashboard.tokenUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty chart when no user", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dashboard.tokenUsage();
    expect(result.chart).toHaveLength(24); // 24 hours always present
    expect(result.chart.every((d) => d.tokens === 0)).toBe(true);
    expect(result.synced).toBe(false);
  });

  it("returns chart with DB data when user is logged in", async () => {
    const now = Date.now();
    const hourBucket = Math.floor(now / 3600000) * 3600000;

    vi.mocked(db.getBotConfig).mockResolvedValue(null);
    vi.mocked(db.getTokenUsageLast24h).mockResolvedValue([
      {
        id: 1,
        userId: 1,
        hourBucket,
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        costCents: 1,
        model: "gpt-4o",
        createdAt: new Date(),
      },
    ]);

    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.tokenUsage();
    expect(result.chart).toHaveLength(24);
    const nonZero = result.chart.filter((d) => d.tokens > 0);
    expect(nonZero.length).toBeGreaterThanOrEqual(1);
    expect(nonZero[0]?.tokens).toBe(150);
  });
});

describe("dashboard.todayStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns zeros when no user", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dashboard.todayStats();
    expect(result.totalTokens).toBe(0);
    expect(result.costCents).toBe(0);
  });

  it("returns DB totals for authenticated user", async () => {
    vi.mocked(db.getTodayTokenTotal).mockResolvedValue({ totalTokens: 5000, costCents: 10 });
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.todayStats();
    expect(result.totalTokens).toBe(5000);
    expect(result.costCents).toBe(10);
  });
});

describe("dashboard.saveConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when not authenticated", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.dashboard.saveConfig({ telegramToken: "abc" })
    ).rejects.toThrow();
  });

  it("calls upsertBotConfig with correct data", async () => {
    vi.mocked(db.upsertBotConfig).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.saveConfig({
      botName: "MyBot",
      telegramToken: "123:abc",
      openaiApiKey: "sk-test",
      activeModel: "gpt-4o-mini",
    });
    expect(result.success).toBe(true);
    expect(db.upsertBotConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        botName: "MyBot",
        telegramToken: "123:abc",
        openaiApiKey: "sk-test",
        activeModel: "gpt-4o-mini",
      })
    );
  });
});

describe("dashboard.addTokenUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when not authenticated", async () => {
    const caller = appRouter.createCaller(createCtx());
    await expect(
      caller.dashboard.addTokenUsage({ promptTokens: 100, completionTokens: 50 })
    ).rejects.toThrow();
  });

  it("records usage and returns total", async () => {
    vi.mocked(db.recordTokenUsage).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createCtx(1));
    const result = await caller.dashboard.addTokenUsage({
      promptTokens: 200,
      completionTokens: 100,
    });
    expect(result.success).toBe(true);
    expect(result.totalTokens).toBe(300);
    expect(db.recordTokenUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        promptTokens: 200,
        completionTokens: 100,
        totalTokens: 300,
      })
    );
  });
});
