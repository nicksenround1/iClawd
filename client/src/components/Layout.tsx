/*
 * iClawd Layout - 工业终端侧边栏布局
 * 
 * 设计：左侧固定导航栏 + 顶部状态栏 + 主内容区
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
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "驾驶舱", path: "/dashboard", shortLabel: "仪表" },
  { icon: Brain, label: "灵魂与记忆", path: "/soul", shortLabel: "灵魂" },
  { icon: Zap, label: "技能商店", path: "/skills", shortLabel: "技能" },
  { icon: Settings, label: "系统设置", path: "/settings", shortLabel: "设置" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <img
              src="https://private-us-east-1.manuscdn.com/sessionFile/IKlXMo9WTJl7E2oJy3drln/sandbox/Na3chyG3qQlQjxRaJCPz1U_1771759105259_na1fn_aWNsYXdkLWxvZ28taWNvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUtsWE1vOVdUSmw3RTJvSnkzZHJsbi9zYW5kYm94L05hM2NoeUczcVFsUWp4UmFKQ1B6MVVfMTc3MTc1OTEwNTI1OV9uYTFmbl9hV05zWVhka0xXeHZaMjh0YVdOdmJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=hJaF33rLZbLs5mkeVUbStxC-FTcZxu8g3cTPrJUVW-0MxYHeFi3VouQ~Flf8PzVb3KxJTvnIP~eLMTAsBppdZ7~EhCmW3EZlEq7KZm9k9MEt2TSEtnqXTWAW307YdKOcp9mvEqmz9lCVVHiE-WjpKkdh4XvvsUdBjJEYxHeNhnp8QfhOVh7-mdT8yPj1xAvkDZBIzZ0~FonPdBtVPhQliAhszHoda2sKqsY8eEUy7iQrTYdnO~DjGRuHqT-5Vq6q84smVWxBlogxf3Ml8yma~4sdZiL6emUnZ~MlnEvXdVRXt-i8mJg6d7OAotuNymFgSJDk0ErdQrS1RsgQy8AhAg__"
              alt="iClawd"
              className="w-8 h-8 object-contain"
            />
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
                className="text-xs leading-tight"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                v0.1.0-alpha
              </div>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path === "/settings" ? "#" : item.path}>
                <div
                  className="flex items-center gap-3 mx-2 mb-1 px-3 py-2.5 rounded-sm transition-all duration-150 cursor-pointer group"
                  style={{
                    background: isActive ? "oklch(0.78 0.18 200 / 0.12)" : "transparent",
                    borderLeft: isActive ? "2px solid oklch(0.78 0.18 200)" : "2px solid transparent",
                    color: isActive ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)",
                  }}
                  onClick={() => {
                    if (item.path === "/settings") {
                      import("sonner").then(({ toast }) => toast.info("设置功能即将推出"));
                    }
                  }}
                >
                  <Icon
                    size={18}
                    className="flex-shrink-0 transition-colors duration-150"
                    style={{ color: isActive ? "oklch(0.78 0.18 200)" : undefined }}
                  />
                  {!collapsed && (
                    <span
                      className="text-sm font-medium truncate"
                      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
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
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid oklch(0.22 0.03 230)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="status-dot heartbeat-online flex-shrink-0"
                style={{ background: "oklch(0.82 0.22 140)" }}
              />
              <span
                className="text-xs"
                style={{ color: "oklch(0.82 0.22 140)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                ClawDBot 在线
              </span>
            </div>
            <div
              className="text-xs"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Clock size={10} className="inline mr-1" />
              {formatTime(currentTime)}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
            >
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
          <div className="flex items-center gap-4">
            <div
              className="text-xs px-2 py-1 rounded-sm flex items-center gap-1.5"
              style={{
                background: "oklch(0.82 0.22 140 / 0.1)",
                border: "1px solid oklch(0.82 0.22 140 / 0.3)",
                color: "oklch(0.82 0.22 140)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Activity size={10} />
              SYS ONLINE
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
              LOCAL STORAGE
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="text-xs"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              TOKEN 余额: <span style={{ color: "oklch(0.78 0.18 65)" }}>¥ 42.80</span>
            </div>
            <Link href="/">
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
                开始对话
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
