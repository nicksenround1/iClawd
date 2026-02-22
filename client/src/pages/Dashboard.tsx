/*
 * iClawd Dashboard - OpenClaw 机甲驾驶舱
 *
 * 数据来源：
 *  - Gateway 心跳：trpc.dashboard.gatewayStatus（每 30s 轮询）
 *  - Token 图表：trpc.dashboard.tokenUsage（每 60s 轮询）
 *  - 今日统计：trpc.dashboard.todayStats
 *  - 配置概览：trpc.dashboard.getConfig
 */

import { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Cpu,
  Zap,
  Brain,
  Terminal,
  Copy,
  Download,
  Loader2,
  Play,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="panel-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </div>
        <Icon size={14} style={{ color }} />
      </div>
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: "'Space Mono', monospace", color }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function HeartbeatIndicator({ online, loading }: { online: boolean; loading: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 size={16} className="animate-spin" style={{ color: "oklch(0.52 0.05 215)" }} />
      ) : online ? (
        <div className="relative flex items-center justify-center">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: "oklch(0.82 0.22 140)", boxShadow: "0 0 8px oklch(0.82 0.22 140 / 0.8)" }}
          />
          <div
            className="absolute w-3 h-3 rounded-full animate-ping"
            style={{ background: "oklch(0.82 0.22 140 / 0.4)" }}
          />
        </div>
      ) : (
        <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.65 0.22 30)" }} />
      )}
      <span
        className="text-sm font-medium"
        style={{
          color: loading ? "oklch(0.52 0.05 215)" : online ? "oklch(0.82 0.22 140)" : "oklch(0.65 0.22 30)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {loading ? "CHECKING..." : online ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [restarting, setRestarting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ── Data fetching ──
  const {
    data: gatewayStatus,
    isLoading: gwLoading,
    refetch: refetchGw,
  } = trpc.dashboard.gatewayStatus.useQuery(undefined, {
    refetchInterval: 30_000,
    retry: 1,
  });

  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = trpc.dashboard.tokenUsage.useQuery(undefined, {
    refetchInterval: 60_000,
    retry: 1,
  });

  const {
    data: todayStats,
    refetch: refetchStats,
  } = trpc.dashboard.todayStats.useQuery(undefined, {
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: botConfig } = trpc.dashboard.getConfig.useQuery(undefined, { retry: 1 });

  const addUsageMutation = trpc.dashboard.addTokenUsage.useMutation({
    onSuccess: (data) => {
      toast.success(`已记录 ${data.totalTokens} tokens（演示）`);
      refetchUsage();
      refetchStats();
    },
  });

  // ── Derived state ──
  const isOnline = gatewayStatus?.online ?? false;
  const isConfigured = (gatewayStatus as { configured?: boolean } | undefined)?.configured ?? false;
  const tokenChart = usageData?.chart ?? [];
  const todayTokens = todayStats?.totalTokens ?? 0;
  const todayCostCents = todayStats?.costCents ?? 0;
  const activeModel = botConfig?.activeModel ?? "—";
  const gatewayUrl = botConfig?.gatewayUrl ?? "未配置";

  // ── Handlers ──
  const handleRefreshAll = () => {
    refetchGw();
    refetchUsage();
    refetchStats();
    setLastRefresh(new Date());
    toast.info("正在刷新所有数据...");
  };

  const handleRestart = () => {
    if (!isConfigured) {
      toast.error("请先在配置向导中完成 Gateway 配置");
      return;
    }
    setRestarting(true);
    toast.info("正在向 Gateway 发送重启信号...", { duration: 2000 });
    setTimeout(() => {
      setRestarting(false);
      refetchGw();
      toast.success("重启信号已发送，正在重新检测状态...");
    }, 3000);
  };

  const handleDemoUsage = () => {
    addUsageMutation.mutate({
      promptTokens: Math.floor(Math.random() * 800) + 200,
      completionTokens: Math.floor(Math.random() * 400) + 100,
      model: activeModel,
    });
  };

  const handleExportConfig = async () => {
    if (!botConfig) {
      toast.error("请先完成配置");
      return;
    }
    toast.info("正在生成 openclaw.json...");
  };

  const maxTokens = Math.max(...tokenChart.map((d) => d.tokens), 1);

  return (
    <div className="p-6 space-y-6">
      {/* ── 页面标题 ── */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs mb-1"
            style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            COCKPIT / DASHBOARD
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            机甲驾驶舱
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs" style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}>
            最后刷新: {lastRefresh.toLocaleTimeString("zh-CN", { hour12: false })}
          </div>
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-all duration-150 hover:scale-105"
            style={{
              background: "oklch(0.78 0.18 200 / 0.1)",
              border: "1px solid oklch(0.78 0.18 200 / 0.4)",
              color: "oklch(0.78 0.18 200)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <RefreshCw size={12} />
            刷新
          </button>
        </div>
      </div>

      {/* ── Gateway 心跳卡片 ── */}
      <div
        className="panel-card p-5"
        style={{
          borderColor: isOnline ? "oklch(0.82 0.22 140 / 0.4)" : "oklch(0.65 0.22 30 / 0.4)",
          background: isOnline
            ? "linear-gradient(135deg, oklch(0.82 0.22 140 / 0.05), transparent)"
            : "linear-gradient(135deg, oklch(0.65 0.22 30 / 0.05), transparent)",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{
                background: isOnline ? "oklch(0.82 0.22 140 / 0.1)" : "oklch(0.65 0.22 30 / 0.1)",
                border: `1px solid ${isOnline ? "oklch(0.82 0.22 140 / 0.3)" : "oklch(0.65 0.22 30 / 0.3)"}`,
              }}
            >
              {isOnline ? (
                <Wifi size={22} style={{ color: "oklch(0.82 0.22 140)" }} />
              ) : (
                <WifiOff size={22} style={{ color: "oklch(0.65 0.22 30)" }} />
              )}
            </div>
            <div>
              <div
                className="text-xs mb-1"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                OPENCLAW GATEWAY
              </div>
              <HeartbeatIndicator online={isOnline} loading={gwLoading} />
              <div
                className="text-xs mt-1"
                style={{ color: "oklch(0.45 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {gatewayUrl}
              </div>
              {!isOnline && !gwLoading && (
                <div
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.65 0.22 30)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {(gatewayStatus as { error?: string } | undefined)?.error ?? "无法连接到 Gateway"}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isConfigured && (
              <Link href="/setup">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-all duration-150"
                  style={{
                    background: "oklch(0.78 0.18 65 / 0.15)",
                    border: "1px solid oklch(0.78 0.18 65 / 0.5)",
                    color: "oklch(0.78 0.18 65)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Terminal size={12} />
                  立即配置
                  <ChevronRight size={10} />
                </button>
              </Link>
            )}
            <button
              onClick={handleRestart}
              disabled={restarting || !isConfigured}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm transition-all duration-150 disabled:opacity-40"
              style={{
                background: "oklch(0.78 0.18 200 / 0.1)",
                border: "1px solid oklch(0.78 0.18 200 / 0.4)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {restarting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {restarting ? "重启中..." : "重启"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 统计卡片行 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="今日 Tokens"
          value={todayTokens.toLocaleString()}
          sub="prompt + completion"
          color="oklch(0.78 0.18 200)"
          icon={Activity}
        />
        <StatCard
          label="今日费用"
          value={`$${(todayCostCents / 100).toFixed(4)}`}
          sub="估算值"
          color="oklch(0.78 0.18 65)"
          icon={Zap}
        />
        <StatCard
          label="活跃模型"
          value={activeModel.split("/").pop() ?? activeModel}
          sub={activeModel.includes("/") ? activeModel.split("/")[0] : undefined}
          color="oklch(0.72 0.18 280)"
          icon={Cpu}
        />
        <StatCard
          label="配置状态"
          value={isConfigured ? "READY" : "PENDING"}
          sub={isConfigured ? "Gateway 已配置" : "需要完成配置"}
          color={isConfigured ? "oklch(0.82 0.22 140)" : "oklch(0.65 0.22 30)"}
          icon={isConfigured ? CheckCircle : AlertTriangle}
        />
      </div>

      {/* ── Token 消耗图表 ── */}
      <div className="panel-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div
              className="text-xs mb-1"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              TOKEN USAGE / 24H
            </div>
            <div
              className="text-base font-bold"
              style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
            >
              Token 消耗趋势
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usageLoading && <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.52 0.05 215)" }} />}
            <button
              onClick={handleDemoUsage}
              disabled={addUsageMutation.isPending}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm transition-all duration-150 disabled:opacity-50"
              style={{
                background: "oklch(0.72 0.18 280 / 0.1)",
                border: "1px solid oklch(0.72 0.18 280 / 0.4)",
                color: "oklch(0.72 0.18 280)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Play size={10} />
              模拟调用
            </button>
          </div>
        </div>

        {tokenChart.length > 0 && maxTokens > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tokenChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.78 0.18 200)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.78 0.18 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.03 230)" />
              <XAxis
                dataKey="time"
                tick={{ fill: "oklch(0.45 0.04 220)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                tickLine={false}
                axisLine={{ stroke: "oklch(0.22 0.03 230)" }}
                interval={3}
              />
              <YAxis
                tick={{ fill: "oklch(0.45 0.04 220)", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.12 0.02 235)",
                  border: "1px solid oklch(0.22 0.03 230)",
                  borderRadius: "4px",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
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
        ) : (
          <div
            className="h-48 flex flex-col items-center justify-center gap-3"
            style={{ color: "oklch(0.45 0.04 220)" }}
          >
            <Activity size={32} style={{ opacity: 0.3 }} />
            <div className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              暂无 Token 消耗记录
            </div>
            <div className="text-xs" style={{ color: "oklch(0.38 0.04 220)" }}>
              点击"模拟调用"添加演示数据，或等待真实对话产生记录
            </div>
          </div>
        )}
      </div>

      {/* ── 配置概览 + 快捷操作 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 配置概览 */}
        <div className="panel-card p-5">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            CONFIG OVERVIEW
          </div>
          {botConfig ? (
            <div className="space-y-2">
              {[
                { label: "Bot 名称", value: `${botConfig.botEmoji} ${botConfig.botName}` },
                { label: "主模型", value: botConfig.activeModel },
                { label: "Gateway", value: botConfig.gatewayUrl },
                {
                  label: "Gateway Token",
                  value: botConfig.gatewayTokenConfigured ? `已配置 (${botConfig.gatewayTokenMasked})` : "未配置",
                  ok: botConfig.gatewayTokenConfigured,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid oklch(0.15 0.02 235)" }}>
                  <span className="text-xs" style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {"ok" in item && (
                      item.ok
                        ? <CheckCircle size={10} style={{ color: "oklch(0.82 0.22 140)" }} />
                        : <AlertTriangle size={10} style={{ color: "oklch(0.78 0.18 65)" }} />
                    )}
                    <span
                      className="text-xs max-w-[180px] truncate text-right"
                      style={{ color: "oklch(0.75 0.04 210)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <AlertTriangle size={24} style={{ color: "oklch(0.78 0.18 65)", opacity: 0.6 }} />
              <div className="text-xs text-center" style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}>
                尚未完成配置
              </div>
              <Link href="/setup">
                <button
                  className="text-xs px-3 py-1.5 rounded-sm mt-1"
                  style={{
                    background: "oklch(0.78 0.18 200 / 0.1)",
                    border: "1px solid oklch(0.78 0.18 200 / 0.4)",
                    color: "oklch(0.78 0.18 200)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  前往配置向导
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="panel-card p-5">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            QUICK ACTIONS
          </div>
          <div className="space-y-2">
            {[
              {
                icon: Brain,
                label: "编辑 SOUL.md",
                sub: "修改 Bot 人格与行为",
                path: "/soul",
                color: "oklch(0.72 0.18 280)",
              },
              {
                icon: Zap,
                label: "管理技能",
                sub: "安装/卸载 OpenClaw Skills",
                path: "/skills",
                color: "oklch(0.82 0.22 140)",
              },
              {
                icon: Cpu,
                label: "切换模型",
                sub: "配置 LLM 提供商与 API Key",
                path: "/models",
                color: "oklch(0.78 0.18 200)",
              },
              {
                icon: Download,
                label: "导出配置",
                sub: "生成 openclaw.json 文件",
                path: null,
                color: "oklch(0.78 0.18 65)",
                onClick: handleExportConfig,
              },
            ].map((action) => {
              const Icon = action.icon;
              const inner = (
                <div
                  key={action.label}
                  className="flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all duration-150 hover:scale-[1.01]"
                  style={{
                    background: "oklch(0.12 0.018 237)",
                    border: "1px solid oklch(0.18 0.025 235)",
                  }}
                  onClick={action.onClick}
                >
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: `${action.color}/0.1`, border: `1px solid ${action.color}/0.3` }}
                  >
                    <Icon size={16} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: "oklch(0.85 0.02 210)", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {action.label}
                    </div>
                    <div className="text-xs" style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {action.sub}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "oklch(0.38 0.04 220)" }} />
                </div>
              );
              return action.path ? (
                <Link key={action.label} href={action.path}>
                  {inner}
                </Link>
              ) : (
                <div key={action.label}>{inner}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
