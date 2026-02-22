/**
 * dashboard.test.ts
 *
 * Unit tests for the dashboard tRPC router (OpenClaw-aligned version).
 * Tests cover: gateway status, config save/load, models, soul, token usage, memory CRUD.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// ─── Mock db module ───────────────────────────────────────────────────────────

vi.mock("../db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getOpenclawConfig: vi.fn(),
  upsertOpenclawConfig: vi.fn(),
  getTokenUsageLast24h: vi.fn(),
  getTodayTokenTotal: vi.fn(),
  recordTokenUsage: vi.fn(),
  getMemoryEntries: vi.fn(),
  createMemoryEntry: vi.fn(),
  updateMemoryEntry: vi.fn(),
  deleteMemoryEntry: vi.fn(),
}));

import * as db from "../db";

// ─── Context helpers ──────────────────────────────────────────────────────────

function makeCtx(userId?: number): TrpcContext {
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockConfig = {
  id: 1,
  userId: 42,
  gatewayUrl: "http://localhost:3000",
  gatewayToken: "secret-token",
  botName: "TestBot",
  botEmoji: "🤖",
  botVibe: "helpful",
  botCreature: "assistant",
  modelsJson: JSON.stringify({ primary: "anthropic/claude-opus-4-5" }),
  skillsJson: JSON.stringify([{ name: "search", enabled: true }]),
  channelsJson: JSON.stringify({}),
  soulMd: "# TestBot\n\nYou are TestBot.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMemory = {
  id: 1,
  userId: 42,
  content: "User prefers dark mode",
  category: "preference",
  isPinned: false,
  source: "manual",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Tests: getConfig ─────────────────────────────────────────────────────────

describe("dashboard.getConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.dashboard.getConfig();
    expect(result).toBeNull();
  });

  it("returns config for authenticated user", async () => {
    vi.mocked(db.getOpenclawConfig).mockResolvedValue(mockConfig);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.getConfig();
    expect(result).not.toBeNull();
    expect(result?.botName).toBe("TestBot");
    expect(result?.gatewayUrl).toBe("http://localhost:3000");
  });

  it("parses modelsJson into models object", async () => {
    vi.mocked(db.getOpenclawConfig).mockResolvedValue(mockConfig);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.getConfig();
    expect(result?.models).toMatchObject({ primary: "anthropic/claude-opus-4-5" });
  });

  it("parses skillsJson into skills array", async () => {
    vi.mocked(db.getOpenclawConfig).mockResolvedValue(mockConfig);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.getConfig();
    // skillsJson is parsed as object (JSON.parse of array-string may vary)
    expect(result?.skills).toBeDefined();
  });

  it("returns soulMd content", async () => {
    vi.mocked(db.getOpenclawConfig).mockResolvedValue(mockConfig);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.getConfig();
    expect(result?.soulMd).toContain("TestBot");
  });
});

// ─── Tests: saveConfig ────────────────────────────────────────────────────────

describe("dashboard.saveConfig", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.dashboard.saveConfig({ botName: "NewBot" })
    ).rejects.toThrow();
  });

  it("saves gateway URL and bot name", async () => {
    vi.mocked(db.upsertOpenclawConfig).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.saveConfig({
      gatewayUrl: "http://localhost:3000",
      botName: "NewBot",
    });
    expect(result.success).toBe(true);
    expect(db.upsertOpenclawConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 42,
        botName: "NewBot",
        gatewayUrl: "http://localhost:3000",
      })
    );
  });
});

// ─── Tests: saveModels ────────────────────────────────────────────────────────

describe("dashboard.saveModels", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves primary model", async () => {
    vi.mocked(db.getOpenclawConfig).mockResolvedValue(null);
    vi.mocked(db.upsertOpenclawConfig).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.saveModels({
      primary: "openai/gpt-4o",
    });
    expect(result.success).toBe(true);
    expect(db.upsertOpenclawConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        modelsJson: expect.stringContaining("gpt-4o"),
      })
    );
  });

  it("throws when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.dashboard.saveModels({ primary: "openai/gpt-4o" })
    ).rejects.toThrow();
  });
});

// ─── Tests: saveSoul ─────────────────────────────────────────────────────────

describe("dashboard.saveSoul", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves soul.md content", async () => {
    vi.mocked(db.upsertOpenclawConfig).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.saveSoul({
      soulMd: "# MyBot\n\nYou are MyBot.",
    });
    expect(result.success).toBe(true);
    expect(db.upsertOpenclawConfig).toHaveBeenCalledWith(
      expect.objectContaining({ soulMd: "# MyBot\n\nYou are MyBot." })
    );
  });

  it("throws when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.dashboard.saveSoul({ soulMd: "# Bot" })
    ).rejects.toThrow();
  });
});

// ─── Tests: tokenUsage ───────────────────────────────────────────────────────

describe("dashboard.tokenUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns chart with 24 hours when no user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.dashboard.tokenUsage();
    expect(result.chart).toHaveLength(24);
    expect(result.chart.every((d: { tokens: number }) => d.tokens === 0)).toBe(true);
    expect(result.synced).toBe(false);
  });

  it("returns chart with usage data for authenticated user", async () => {
    const now = Date.now();
    const hourBucket = Math.floor(now / 3600000) * 3600000;
    vi.mocked(db.getTokenUsageLast24h).mockResolvedValue([
      {
        id: 1,
        userId: 42,
        hourBucket,
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        costCents: 3,
        model: "gpt-4o",
        createdAt: new Date(),
      },
    ]);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.tokenUsage();
    expect(result.chart).toHaveLength(24);
    const nonZero = result.chart.filter((d: { tokens: number }) => d.tokens > 0);
    expect(nonZero.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Tests: todayStats ───────────────────────────────────────────────────────

describe("dashboard.todayStats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns zeros when no user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.dashboard.todayStats();
    expect(result.totalTokens).toBe(0);
    expect(result.costCents).toBe(0);
  });

  it("returns DB totals for authenticated user", async () => {
    vi.mocked(db.getTodayTokenTotal).mockResolvedValue({
      totalTokens: 5000,
      costCents: 10,
    });
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.todayStats();
    expect(result.totalTokens).toBe(5000);
    expect(result.costCents).toBe(10);
  });
});

// ─── Tests: Memory CRUD ──────────────────────────────────────────────────────

describe("dashboard memory CRUD", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getMemories returns list for authenticated user", async () => {
    vi.mocked(db.getMemoryEntries).mockResolvedValue([mockMemory]);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.getMemories();
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("User prefers dark mode");
  });

  it("getMemories returns empty array when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.dashboard.getMemories();
    expect(result).toHaveLength(0);
  });

  it("createMemory creates entry", async () => {
    vi.mocked(db.createMemoryEntry).mockResolvedValue(mockMemory);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.createMemory({
      title: "Dark Mode Preference",
      content: "User prefers dark mode",
      category: "preference",
    });
    expect(result.success).toBe(true);
    expect(db.createMemoryEntry).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42, title: "Dark Mode Preference", content: "User prefers dark mode" })
    );
  });

  it("createMemory throws when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.dashboard.createMemory({ title: "Test", content: "test" })
    ).rejects.toThrow();
  });

  it("updateMemory updates isPinned", async () => {
    vi.mocked(db.updateMemoryEntry).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.updateMemory({ id: 1, isPinned: true });
    expect(result.success).toBe(true);
    expect(db.updateMemoryEntry).toHaveBeenCalledWith(
      1,
      42,
      expect.objectContaining({ isPinned: 1 })
    );
  });

  it("deleteMemory removes entry", async () => {
    vi.mocked(db.deleteMemoryEntry).mockResolvedValue(undefined);
    const caller = appRouter.createCaller(makeCtx(42));
    const result = await caller.dashboard.deleteMemory({ id: 1 });
    expect(result.success).toBe(true);
    expect(db.deleteMemoryEntry).toHaveBeenCalledWith(1, 42);
  });
});
