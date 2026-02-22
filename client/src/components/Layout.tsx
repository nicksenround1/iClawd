/*
 * iClawd Layout - OpenClaw 驾驶舱布局
 * 
 * 设计：左侧固定导航栏 + 顶部 Gateway 状态栏 + 主内容区
 * 风格：深蓝黑背景，亮青色激活状态，切角卡片
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Brain,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  MessageSquare,
  Shield,
  Clock,
  Cpu,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const navItems = [
  { icon: LayoutDashboard, label: "驾驶舱", path: "/dashboard", shortLabel: "仪表" },
  { icon: Brain, label: "灵魂与记忆", path: "/soul", shortLabel: "灵魂" },
  { icon: Zap, label: "技能商店", path: "/skills", shortLabel: "技能" },
  { icon: Cpu, label: "模型配置", path: "/models", shortLabel: "模型" },
  { icon: Settings, label: "系统设置", path: "/settings", shortLabel: "设置" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 真实 Gateway 状态
  const { data: gatewayStatus, isLoading: gwLoading } = trpc.dashboard.gatewayStatus.useQuery(undefined, {
    refetchInterval: 30_000,
    retry: 1,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });

  const isOnline = gatewayStatus?.online ?? false;
  const botName = (gatewayStatus as { botName?: string } | undefined)?.botName ?? "ClawDBot";
  const botEmoji = (gatewayStatus as { botEmoji?: string } | undefined)?.botEmoji ?? "🦞";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.085 0.015 240)" }}>
      {/* 侧边导航栏 */}
      <aside
        className="flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-20"
        style={{
          width: collapsed ? "64px" : "220px",
          background: "oklch(0.09 0.016 238)",
          borderRight: "1px solid oklch(0.22 0.03 230)",
        }}
      >
        {/* Logo 区域 */}
        <div
          className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.22 0.03 230)", height: "64px" }}
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xl">
            {botEmoji}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div
                className="font-bold text-base leading-tight"
                style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.78 0.18 200)" }}
              >
                iClawd
              </div>
              <div
                className="text-xs leading-tight truncate"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {botName}
              </div>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            const isPlaceholder = item.path === "/settings";
            return (
              <Link
                key={item.path}
                href={isPlaceholder ? "#" : item.path}
                onClick={
                  isPlaceholder
                    ? (e) => {
                        e.preventDefault();
                        import("sonner").then(({ toast }) => toast.info("设置功能即将推出"));
                      }
                    : undefined
                }
              >
                <div
                  className="flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-sm transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? "oklch(0.78 0.18 200 / 0.12)" : "transparent",
                    borderLeft: isActive ? "2px solid oklch(0.78 0.18 200)" : "2px solid transparent",
                    color: isActive ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)",
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" style={{ color: isActive ? "oklch(0.78 0.18 200)" : undefined }} />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 底部状态区 */}
        {!collapsed && (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid oklch(0.22 0.03 230)" }}>
            <div className="flex items-center gap-2 mb-2">
              {gwLoading ? (
                <Loader2 size={10} className="animate-spin" style={{ color: "oklch(0.52 0.05 215)" }} />
              ) : isOnline ? (
                <div className="status-dot heartbeat-online flex-shrink-0" style={{ background: "oklch(0.82 0.22 140)" }} />
              ) : (
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "oklch(0.65 0.22 30)" }} />
              )}
              <span
                className="text-xs"
                style={{
                  color: isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.65 0.22 30)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {gwLoading ? "检测中..." : isOnline ? "Gateway 在线" : "Gateway 离线"}
              </span>
            </div>
            <div className="text-xs" style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}>
              <Clock size={10} className="inline mr-1" />
              {formatTime(currentTime)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}>
              {formatDate(currentTime)}
            </div>
          </div>
        )}

        {/* 折叠按钮 */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-30 transition-all duration-150 hover:scale-110"
          style={{
            background: "oklch(0.15 0.02 235)",
            border: "1px solid oklch(0.22 0.03 230)",
            color: "oklch(0.52 0.05 215)",
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <header
          className="flex items-center justify-between px-6 flex-shrink-0"
          style={{
            height: "64px",
            background: "oklch(0.09 0.016 238)",
            borderBottom: "1px solid oklch(0.22 0.03 230)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Gateway 状态 */}
            <div
              className="text-xs px-2 py-1 rounded-sm flex items-center gap-1.5"
              style={{
                background: isOnline ? "oklch(0.82 0.22 140 / 0.1)" : "oklch(0.65 0.22 30 / 0.1)",
                border: `1px solid ${isOnline ? "oklch(0.82 0.22 140 / 0.3)" : "oklch(0.65 0.22 30 / 0.3)"}`,
                color: isOnline ? "oklch(0.82 0.22 140)" : "oklch(0.65 0.22 30)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {gwLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : isOnline ? (
                <Wifi size={10} />
              ) : (
                <WifiOff size={10} />
              )}
              {gwLoading ? "CHECKING" : isOnline ? "GATEWAY ONLINE" : "GATEWAY OFFLINE"}
            </div>
            <div
              className="text-xs px-2 py-1 rounded-sm flex items-center gap-1.5"
              style={{
                background: "oklch(0.78 0.18 200 / 0.1)",
                border: "1px solid oklch(0.78 0.18 200 / 0.3)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Shield size={10} />
              LOCAL FIRST
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs" style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}>
              <Activity size={10} className="inline mr-1" />
              OpenClaw Gateway
            </div>
            <Link href="/setup">
              <button
                className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm transition-all duration-150"
                style={{
                  background: "oklch(0.78 0.18 200 / 0.1)",
                  border: "1px solid oklch(0.78 0.18 200 / 0.4)",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <MessageSquare size={12} />
                配置向导
              </button>
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
