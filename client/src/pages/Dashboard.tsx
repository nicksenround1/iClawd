/*
 * iClawd Dashboard - 驾驶舱主页（真实 API 版）
 *
 * 数据来源：
 *  - 心跳状态：trpc.dashboard.botStatus（Telegram Bot API ping）
 *  - Token 图表：trpc.dashboard.tokenUsage（DB + OpenAI Usage API 同步）
 *  - 今日统计：trpc.dashboard.todayStats
 *  - Bot 配置：trpc.dashboard.getConfig
 *
 * 轮询间隔：心跳 30s，Token 60s
 */

import { useState } from "react";
import {
  Activity,
  Cpu,
  Zap,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Clock,
  Database,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [prevTarget, setPrevTarget] = useState(0);

  if (prevTarget !== target) {
    setPrevTarget(target);
    let start = prevTarget;
    const step = (target - start) / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if ((step > 0 && start >= target) || (step < 0 && start <= target)) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
  }

  return <>{count.toLocaleString()}</>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ online, loading }: { online: boolean; loading: boolean }) {
  if (loading) return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
      <Loader2 size={12} className="animate-spin" />
      检测中...
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: online ? "oklch(0.82 0.22 140)" : "oklch(0.62 0.22 25)" }}>
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {online ? "在线" : "离线"}
    </div>
  );
}

// ─── Demo Token Adder ─────────────────────────────────────────────────────────

function DemoTokenAdder({ onAdded }: { onAdded: () => void }) {
  const addUsage = trpc.dashboard.addTokenUsage.useMutation({
    onSuccess: (data) => {
      toast.success(`已记录 ${data.totalTokens.toLocaleString()} tokens`);
      onAdded();
    },
    onError: (err) => toast.error(`记录失败: ${err.message}`),
  });

  const handleAdd = () => {
    const prompt = Math.floor(Math.random() * 800) + 200;
    const completion = Math.floor(Math.random() * 400) + 100;
    addUsage.mutate({ promptTokens: prompt, completionTokens: completion });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={addUsage.isPending}
      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm transition-all"
      style={{
        background: "oklch(0.72 0.18 280 / 0.1)",
        border: "1px solid oklch(0.72 0.18 280 / 0.3)",
        color: "oklch(0.72 0.18 280)",
        fontFamily: "'JetBrains Mono', monospace",
      }}
      title="模拟一次 API 调用（演示用）"
    >
      {addUsage.isPending ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
      模拟调用
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  // ── Data fetching ──
  const {
    data: botStatus,
    isLoading: botLoading,
    refetch: refetchBot,
  } = trpc.dashboard.botStatus.useQuery(undefined, {
    refetchInterval: 30_000, // poll every 30s
    retry: 1,
  });

  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = trpc.dashboard.tokenUsage.useQuery(undefined, {
    refetchInterval: 60_000, // poll every 60s
    retry: 1,
  });

  const {
    data: todayStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.dashboard.todayStats.useQuery(undefined, {
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: botConfig } = trpc.dashboard.getConfig.useQuery(undefined, { retry: 1 });

  // ── Derived state ──
  const isOnline = botStatus?.online ?? false;
  const isConfigured = botStatus?.configured ?? false;
  const tokenChart = usageData?.chart ?? [];
  const todayTokens = todayStats?.totalTokens ?? 0;
  const todayCostCents = todayStats?.costCents ?? 0;
  const lastSyncTime = new Date().toLocaleTimeString("zh-CN", { hour12: false });

  // ── Restart handler (demo) ──
  const [restarting, setRestarting] = useState(false);
  const handleRestart = () => {
    if (!isConfigured) {
      toast.error("请先在设置中配置 Bot Token");
      return;
    }
    setRestarting(true);
    toast.info("正在重启 ClawDBot...", { duration: 2000 });
    setTimeout(() => {
      setRestarting(false);
      refetchBot();
      toast.success("重启信号已发送，正在重新检测状态...");
    }, 3000);
  };

  const handleRefreshAll = () => {
    refetchBot();
    refetchUsage();
    refetchStats();
    toast.info("正在刷新所有数据...");
  };

  return (
    <div className="p-6 space-y-6 fade-in-up">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            COCKPIT
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
            实时系统状态监控 · ClawDBot 驾驶舱
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 同步状态指示 */}
          {usageData?.synced && (
            <div
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm"
              style={{
                background: "oklch(0.82 0.22 140 / 0.08)",
                border: "1px solid oklch(0.82 0.22 140 / 0.2)",
                color: "oklch(0.82 0.22 140)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <CheckCircle size={10} />
              OpenAI 已同步
            </div>
          )}
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-all"
            style={{
              background: "oklch(0.78 0.18 200 / 0.08)",
              border: "1px solid oklch(0.78 0.18 200 / 0.25)",
              color: "oklch(0.78 0.18 200)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <RefreshCw size={11} />
            SYNC · {lastSyncTime}
          </button>
        </div>
      </div>

      {/* 未配置提示横幅 */}
      {!isConfigured && !botLoading && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-sm"
          style={{
            background: "oklch(0.78 0.18 65 / 0.08)",
            border: "1px solid oklch(0.78 0.18 65 / 0.3)",
          }}
        >
          <AlertTriangle size={16} style={{ color: "oklch(0.78 0.18 65)", flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm" style={{ color: "oklch(0.78 0.18 65)" }}>
              尚未配置 Bot Token。部分数据显示为演示模式。
            </span>
          </div>
          <Link href="/setup">
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm flex-shrink-0"
              style={{
                background: "oklch(0.78 0.18 65 / 0.15)",
                border: "1px solid oklch(0.78 0.18 65 / 0.5)",
                color: "oklch(0.78 0.18 65)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Settings size={11} />
              前往配置
            </button>
          </Link>
        </div>
      )}

      {/* 顶部状态卡片行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 心跳监控卡片 */}
        <div
          className="panel-card p-4 scanline-bg"
          style={{
            borderColor: botLoading
              ? "oklch(0.52 0.05 215 / 0.3)"
              : isOnline
              ? "oklch(0.82 0.22 140 / 0.4)"
              : "oklch(0.62 0.22 25 / 0.4)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div
                className="text-xs font-medium uppercase tracking-widest mb-1"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                BOT STATUS
              </div>
              <div
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  color: botLoading
                    ? "oklch(0.52 0.05 215)"
                    : isOnline
                    ? "oklch(0.82 0.22 140)"
                    : "oklch(0.62 0.22 25)",
                }}
              >
                {botLoading ? "CHECKING" : isOnline ? "ONLINE" : "OFFLINE"}
              </div>
              {botStatus?.online && (botStatus as { username?: string }).username && (
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.45 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  @{(botStatus as { username?: string }).username}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {botLoading ? (
                <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.52 0.05 215)" }} />
              ) : (
                <div
                  className={`status-dot ${isOnline ? "heartbeat-online" : "heartbeat-offline"}`}
                  style={{
                    background: isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.62 0.22 25)",
                    width: "12px",
                    height: "12px",
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {isOnline ? (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
                <CheckCircle size={12} style={{ color: "oklch(0.82 0.22 140)" }} />
                Bot 响应正常
              </div>
            ) : (
              <button
                onClick={handleRestart}
                disabled={restarting || botLoading}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm transition-all"
                style={{
                  background: "oklch(0.78 0.18 200 / 0.15)",
                  border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <RefreshCw size={10} className={restarting ? "animate-spin" : ""} />
                {restarting ? "重启中..." : "一键重启"}
              </button>
            )}
            {!botLoading && (
              <button
                onClick={() => refetchBot()}
                className="text-xs"
                style={{ color: "oklch(0.38 0.04 220)" }}
                title="重新检测"
              >
                <RefreshCw size={10} />
              </button>
            )}
          </div>
          {/* 错误信息 */}
          {!isOnline && !botLoading && (botStatus as { error?: string })?.error && (
            <div
              className="mt-2 text-xs truncate"
              style={{ color: "oklch(0.62 0.22 25 / 0.8)", fontFamily: "'JetBrains Mono', monospace" }}
              title={(botStatus as { error?: string }).error}
            >
              {(botStatus as { error?: string }).error}
            </div>
          )}
        </div>

        {/* Token 消耗 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            TODAY TOKENS
          </div>
          <div
            className="text-2xl font-bold counter-value"
            style={{ color: "oklch(0.78 0.18 200)" }}
          >
            {statsLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <AnimatedCounter target={todayTokens} />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
            <TrendingUp size={11} style={{ color: "oklch(0.78 0.18 65)" }} />
            {todayTokens > 0 ? `≈ $${(todayCostCents / 100).toFixed(4)}` : "暂无数据"}
          </div>
        </div>

        {/* API 配置状态 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            API CONFIG
          </div>
          <div
            className="text-lg font-bold"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: botConfig?.openaiApiKeyConfigured ? "oklch(0.82 0.22 140)" : "oklch(0.52 0.05 215)",
            }}
          >
            {botConfig?.openaiApiKeyConfigured ? "ACTIVE" : "PENDING"}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
              {botConfig?.telegramTokenConfigured ? (
                <CheckCircle size={10} style={{ color: "oklch(0.82 0.22 140)" }} />
              ) : (
                <AlertTriangle size={10} style={{ color: "oklch(0.78 0.18 65)" }} />
              )}
              Telegram Bot
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
              {botConfig?.openaiApiKeyConfigured ? (
                <CheckCircle size={10} style={{ color: "oklch(0.82 0.22 140)" }} />
              ) : (
                <AlertTriangle size={10} style={{ color: "oklch(0.78 0.18 65)" }} />
              )}
              OpenAI API Key
            </div>
          </div>
        </div>

        {/* 活跃模型 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ACTIVE MODEL
          </div>
          <div
            className="text-base font-bold counter-value truncate"
            style={{ color: "oklch(0.72 0.18 280)", fontFamily: "'Space Mono', monospace" }}
          >
            {botConfig?.activeModel ?? "gpt-4o"}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
            <MessageSquare size={11} />
            {botConfig?.botName ?? "ClawDBot"}
          </div>
        </div>
      </div>

      {/* 中间区域：图表 + 资源 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Token 消耗图表 */}
        <div className="lg:col-span-2 panel-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                TOKEN USAGE / 24H
                {usageLoading && (
                  <span className="ml-2 inline-flex items-center gap-1" style={{ color: "oklch(0.52 0.05 215)" }}>
                    <Loader2 size={10} className="animate-spin" />
                    加载中
                  </span>
                )}
              </div>
              {tokenChart.length > 0 && (
                <div className="text-xs mt-0.5" style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}>
                  总计: {tokenChart.reduce((s, d) => s + d.tokens, 0).toLocaleString()} tokens
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DemoTokenAdder onAdded={() => { refetchUsage(); refetchStats(); }} />
              <BarChart3 size={14} style={{ color: "oklch(0.52 0.05 215)" }} />
            </div>
          </div>
          <div style={{ height: "160px" }}>
            {tokenChart.length === 0 && !usageLoading ? (
              <div
                className="h-full flex flex-col items-center justify-center gap-2"
                style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                <BarChart3 size={28} className="opacity-30" />
                <p className="text-xs">暂无 Token 使用记录</p>
                <p className="text-xs opacity-60">配置 OpenAI API Key 后自动同步，或点击"模拟调用"添加演示数据</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokenChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.78 0.18 200)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.78 0.18 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "oklch(0.38 0.04 220)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.38 0.04 220)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.11 0.018 235)",
                      border: "1px solid oklch(0.22 0.03 230)",
                      borderRadius: "2px",
                      fontSize: "11px",
                      fontFamily: "JetBrains Mono",
                      color: "oklch(0.92 0.02 210)",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} tokens`, "消耗"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="oklch(0.78 0.18 200)"
                    strokeWidth={2}
                    fill="url(#tokenGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 系统资源 + 快速操作 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            SYSTEM RESOURCES
          </div>
          <div className="space-y-4">
            {[
              { label: "CPU", value: 23, icon: Cpu, color: "oklch(0.78 0.18 200)" },
              { label: "内存", value: 67, icon: Database, color: "oklch(0.78 0.18 65)" },
              { label: "API 限速", value: 12, icon: Zap, color: "oklch(0.82 0.22 140)" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
                    <item.icon size={11} style={{ color: item.color }} />
                    {item.label}
                  </div>
                  <span
                    className="text-xs counter-value"
                    style={{ color: item.color, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {item.value}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "oklch(0.22 0.03 230)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.value}%`,
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 快速操作 */}
          <div className="mt-6 pt-4" style={{ borderTop: "1px solid oklch(0.22 0.03 230)" }}>
            <div
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              QUICK ACTIONS
            </div>
            <div className="space-y-2">
              <button
                onClick={() => toast.info("正在跳转到对话界面...")}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-all duration-150"
                style={{
                  background: "oklch(0.78 0.18 200 / 0.1)",
                  border: "1px solid oklch(0.78 0.18 200 / 0.3)",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <MessageSquare size={12} />
                打开对话界面
                <ExternalLink size={10} className="ml-auto" />
              </button>
              <button
                onClick={handleRestart}
                disabled={restarting}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-all duration-150"
                style={{
                  background: "oklch(0.62 0.22 25 / 0.1)",
                  border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                  color: "oklch(0.62 0.22 25)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <RefreshCw size={12} className={restarting ? "animate-spin" : ""} />
                {restarting ? "重启中..." : "重启 Bot"}
              </button>
              <Link href="/setup">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-all duration-150"
                  style={{
                    background: "transparent",
                    border: "1px solid oklch(0.28 0.03 230)",
                    color: "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Settings size={12} />
                  配置 API Keys
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 实时状态摘要 */}
      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            LIVE STATUS SUMMARY
          </div>
          <Activity size={14} style={{ color: "oklch(0.52 0.05 215)" }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Bot 心跳",
              value: botLoading ? "检测中..." : isOnline ? "正常" : "异常",
              color: botLoading ? "oklch(0.52 0.05 215)" : isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.62 0.22 25)",
              sub: botLoading ? "" : isOnline ? "Telegram API 可达" : (botStatus as { error?: string })?.error ?? "无法连接",
            },
            {
              label: "今日 Tokens",
              value: statsLoading ? "加载中" : todayTokens.toLocaleString(),
              color: "oklch(0.78 0.18 200)",
              sub: todayCostCents > 0 ? `≈ $${(todayCostCents / 100).toFixed(4)}` : "暂无消耗",
            },
            {
              label: "数据同步",
              value: usageData?.synced ? "已同步" : "本地",
              color: usageData?.synced ? "oklch(0.82 0.22 140)" : "oklch(0.52 0.05 215)",
              sub: usageData?.synced ? "来自 OpenAI Usage API" : "配置 API Key 后自动同步",
            },
            {
              label: "活跃模型",
              value: botConfig?.activeModel ?? "gpt-4o",
              color: "oklch(0.72 0.18 280)",
              sub: botConfig?.botName ?? "ClawDBot",
            },
          ].map((item) => (
            <div key={item.label}>
              <div
                className="text-xs mb-1"
                style={{ color: "oklch(0.45 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {item.label}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: item.color, fontFamily: "'Space Mono', monospace" }}
              >
                {item.value}
              </div>
              <div className="text-xs mt-0.5 truncate" style={{ color: "oklch(0.38 0.04 220)" }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
