/*
 * iClawd Dashboard - 驾驶舱主页
 * 
 * 功能：心跳监控、资源监控、对话直达、最近活动
 * 风格：工业终端，切角卡片，呼吸灯，数字滚动
 */

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// 模拟数据
const tokenData = [
  { time: "00:00", tokens: 120 },
  { time: "04:00", tokens: 80 },
  { time: "08:00", tokens: 340 },
  { time: "12:00", tokens: 520 },
  { time: "16:00", tokens: 280 },
  { time: "20:00", tokens: 410 },
  { time: "23:59", tokens: 190 },
];

const recentActivities = [
  { time: "2分钟前", event: "收到新消息", type: "message", user: "张三" },
  { time: "15分钟前", event: "执行搜索技能", type: "skill", detail: "搜索: 今日天气" },
  { time: "1小时前", event: "记忆更新", type: "memory", detail: "记录了用户偏好" },
  { time: "3小时前", event: "模型切换", type: "model", detail: "GPT-4o → Claude-3.5" },
  { time: "昨天", event: "系统重启", type: "system", detail: "版本更新至 v2.1.3" },
];

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

export default function Dashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [restarting, setRestarting] = useState(false);

  const handleRestart = () => {
    setRestarting(true);
    setIsOnline(false);
    toast.info("正在重启 ClawDBot...", { duration: 2000 });
    setTimeout(() => {
      setIsOnline(true);
      setRestarting(false);
      toast.success("ClawDBot 已成功重启！");
    }, 3000);
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
        <div
          className="text-xs px-3 py-1.5 rounded-sm"
          style={{
            background: "oklch(0.78 0.18 200 / 0.08)",
            border: "1px solid oklch(0.78 0.18 200 / 0.25)",
            color: "oklch(0.78 0.18 200)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          LAST SYNC: {new Date().toLocaleTimeString("zh-CN", { hour12: false })}
        </div>
      </div>

      {/* 顶部状态卡片行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 心跳监控卡片 */}
        <div
          className="panel-card p-4 scanline-bg"
          style={{
            borderColor: isOnline ? "oklch(0.82 0.22 140 / 0.4)" : "oklch(0.62 0.22 25 / 0.4)",
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
                  color: isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.62 0.22 25)",
                }}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`status-dot ${isOnline ? "heartbeat-online" : "heartbeat-offline"}`}
                style={{
                  background: isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.62 0.22 25)",
                  width: "12px",
                  height: "12px",
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {isOnline ? (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
                <CheckCircle size={12} style={{ color: "oklch(0.82 0.22 140)" }} />
                运行时长: 72h 14m
              </div>
            ) : (
              <button
                onClick={handleRestart}
                disabled={restarting}
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
          </div>
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
            <AnimatedCounter target={24680} />
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
            <TrendingUp size={11} style={{ color: "oklch(0.78 0.18 65)" }} />
            较昨日 +12.4%
          </div>
        </div>

        {/* API 余额 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            API BALANCE
          </div>
          <div
            className="text-2xl font-bold counter-value"
            style={{ color: "oklch(0.78 0.18 65)" }}
          >
            ¥ 42.80
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: "oklch(0.52 0.05 215)" }}>
              <span>预计可用</span>
              <span style={{ color: "oklch(0.78 0.18 65)" }}>~18 天</span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.22 0.03 230)" }}
            >
              <div
                className="h-full progress-glow rounded-full"
                style={{
                  width: "42%",
                  background: "linear-gradient(90deg, oklch(0.78 0.18 65), oklch(0.82 0.22 140))",
                }}
              />
            </div>
          </div>
        </div>

        {/* 今日对话数 */}
        <div className="panel-card p-4">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            CONVERSATIONS
          </div>
          <div
            className="text-2xl font-bold counter-value"
            style={{ color: "oklch(0.72 0.18 280)" }}
          >
            <AnimatedCounter target={47} duration={800} />
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "oklch(0.52 0.05 215)" }}>
            <MessageSquare size={11} />
            今日活跃用户: 12
          </div>
        </div>
      </div>

      {/* 中间区域：图表 + 活动日志 */}
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
              </div>
            </div>
            <BarChart3 size={14} style={{ color: "oklch(0.52 0.05 215)" }} />
          </div>
          <div style={{ height: "160px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
          </div>
        </div>

        {/* 系统资源 */}
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
                    style={{ color: item.color }}
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
                disabled={restarting || !isOnline}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-all duration-150"
                style={{
                  background: "oklch(0.62 0.22 25 / 0.1)",
                  border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                  color: "oklch(0.62 0.22 25)",
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: (!isOnline && restarting) ? 0.5 : 1,
                }}
              >
                <RefreshCw size={12} className={restarting ? "animate-spin" : ""} />
                {restarting ? "重启中..." : "重启 Bot"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            RECENT ACTIVITY LOG
          </div>
          <Activity size={14} style={{ color: "oklch(0.52 0.05 215)" }} />
        </div>
        <div className="space-y-0">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 py-2.5 transition-colors duration-150"
              style={{
                borderBottom: index < recentActivities.length - 1 ? "1px solid oklch(0.18 0.025 235)" : "none",
              }}
            >
              <div
                className="text-xs flex-shrink-0 mt-0.5"
                style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace", width: "72px" }}
              >
                <Clock size={9} className="inline mr-1" />
                {activity.time}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.78 0.02 210)" }}
                  >
                    {activity.event}
                  </span>
                  <span
                    className="tag-chip text-xs"
                    style={{
                      borderColor: activity.type === "message" ? "oklch(0.78 0.18 200 / 0.4)" :
                        activity.type === "skill" ? "oklch(0.72 0.18 280 / 0.4)" :
                          activity.type === "memory" ? "oklch(0.82 0.22 140 / 0.4)" :
                            "oklch(0.52 0.05 215 / 0.4)",
                      color: activity.type === "message" ? "oklch(0.78 0.18 200)" :
                        activity.type === "skill" ? "oklch(0.72 0.18 280)" :
                          activity.type === "memory" ? "oklch(0.82 0.22 140)" :
                            "oklch(0.52 0.05 215)",
                    }}
                  >
                    {activity.type}
                  </span>
                </div>
                {(activity.detail || activity.user) && (
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    {activity.detail || `来自: ${activity.user}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
