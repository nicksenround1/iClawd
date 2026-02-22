/*
 * iClawd Skill Store - OpenClaw Skills 管理
 *
 * 功能：
 *  - 展示 OpenClaw 支持的技能列表（对齐 openclawd skills 配置）
 *  - 一键安装/卸载技能
 *  - 技能 API Key 配置（如需要）
 *  - 保存到后端 tRPC API → openclawd skillsJson
 */

import { useState, useEffect } from "react";
import {
  Zap,
  Check,
  Loader2,
  Search,
  ExternalLink,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Skill Catalog ────────────────────────────────────────────────────────────

interface SkillDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  category: "search" | "media" | "productivity" | "dev" | "communication";
  requiresKey: boolean;
  keyLabel?: string;
  keyPlaceholder?: string;
  popular?: boolean;
}

const SKILLS: SkillDef[] = [
  {
    id: "web_search",
    name: "网络搜索",
    emoji: "🔍",
    desc: "让 ClawDBot 能够实时搜索互联网，获取最新信息",
    category: "search",
    requiresKey: true,
    keyLabel: "Tavily API Key",
    keyPlaceholder: "tvly-...",
    popular: true,
  },
  {
    id: "image_generation",
    name: "图像生成",
    emoji: "🎨",
    desc: "通过 DALL-E 或 Stable Diffusion 生成图片",
    category: "media",
    requiresKey: true,
    keyLabel: "OpenAI API Key",
    keyPlaceholder: "sk-...",
    popular: true,
  },
  {
    id: "code_execution",
    name: "代码执行",
    emoji: "💻",
    desc: "在安全沙盒中运行 Python/JavaScript 代码",
    category: "dev",
    requiresKey: false,
    popular: true,
  },
  {
    id: "weather",
    name: "天气查询",
    emoji: "🌤️",
    desc: "查询全球任意城市的实时天气和预报",
    category: "search",
    requiresKey: true,
    keyLabel: "OpenWeather API Key",
    keyPlaceholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "calendar",
    name: "日历管理",
    emoji: "📅",
    desc: "读写 Google Calendar，管理日程和提醒",
    category: "productivity",
    requiresKey: true,
    keyLabel: "Google OAuth Token",
    keyPlaceholder: "ya29...",
  },
  {
    id: "email",
    name: "邮件助手",
    emoji: "📧",
    desc: "通过 Gmail 收发邮件，自动回复和整理",
    category: "communication",
    requiresKey: true,
    keyLabel: "Gmail OAuth Token",
    keyPlaceholder: "ya29...",
  },
  {
    id: "file_manager",
    name: "文件管理",
    emoji: "📁",
    desc: "读取和操作本地文件系统中的文件",
    category: "productivity",
    requiresKey: false,
  },
  {
    id: "browser",
    name: "浏览器控制",
    emoji: "🌐",
    desc: "控制浏览器访问网页，提取内容和截图",
    category: "dev",
    requiresKey: false,
  },
  {
    id: "github",
    name: "GitHub 集成",
    emoji: "🐙",
    desc: "查看仓库、Issues、PR，自动化代码工作流",
    category: "dev",
    requiresKey: true,
    keyLabel: "GitHub Personal Access Token",
    keyPlaceholder: "ghp_...",
  },
  {
    id: "notion",
    name: "Notion 集成",
    emoji: "📝",
    desc: "读写 Notion 数据库和页面，管理知识库",
    category: "productivity",
    requiresKey: true,
    keyLabel: "Notion Integration Token",
    keyPlaceholder: "secret_...",
  },
  {
    id: "telegram_notify",
    name: "Telegram 通知",
    emoji: "📨",
    desc: "主动向指定 Telegram 频道发送通知消息",
    category: "communication",
    requiresKey: false,
  },
  {
    id: "calculator",
    name: "高级计算",
    emoji: "🧮",
    desc: "执行复杂数学计算、统计分析和单位换算",
    category: "productivity",
    requiresKey: false,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "全部",
  search: "搜索",
  media: "媒体",
  productivity: "效率",
  dev: "开发",
  communication: "通讯",
};

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  enabled,
  apiKey,
  onToggle,
  onKeyChange,
}: {
  skill: SkillDef;
  enabled: boolean;
  apiKey: string;
  onToggle: (id: string, enabled: boolean) => void;
  onKeyChange: (id: string, key: string) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  const categoryColors: Record<string, string> = {
    search: "oklch(0.78 0.18 200)",
    media: "oklch(0.72 0.18 280)",
    productivity: "oklch(0.82 0.22 140)",
    dev: "oklch(0.78 0.18 65)",
    communication: "oklch(0.75 0.18 340)",
  };
  const color = categoryColors[skill.category] ?? "oklch(0.52 0.05 215)";

  return (
    <div
      className="p-4 rounded-sm transition-all duration-200"
      style={{
        background: enabled ? `${color}/0.04` : "oklch(0.11 0.016 236)",
        border: `1px solid ${enabled ? `${color}/0.35` : "oklch(0.18 0.025 235)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 text-xl"
          style={{
            background: enabled ? `${color}/0.15` : "oklch(0.12 0.018 237)",
            border: `1px solid ${enabled ? `${color}/0.4` : "oklch(0.18 0.025 235)"}`,
          }}
        >
          {skill.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                >
                  {skill.name}
                </span>
                {skill.popular && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: "oklch(0.78 0.18 65 / 0.1)",
                      border: "1px solid oklch(0.78 0.18 65 / 0.3)",
                      color: "oklch(0.78 0.18 65)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    热门
                  </span>
                )}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
                {skill.desc}
              </div>
            </div>
            <button
              onClick={() => onToggle(skill.id, !enabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all duration-150 flex-shrink-0 hover:scale-105"
              style={{
                background: enabled ? `${color}/0.15` : "oklch(0.12 0.018 237)",
                border: `1px solid ${enabled ? `${color}/0.5` : "oklch(0.22 0.03 230)"}`,
                color: enabled ? color : "oklch(0.52 0.05 215)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {enabled ? <Check size={11} /> : <Zap size={11} />}
              {enabled ? "已安装" : "安装"}
            </button>
          </div>

          {/* API Key 配置 */}
          {enabled && skill.requiresKey && (
            <div className="mt-3">
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-1.5 text-xs mb-2"
                style={{
                  color: "oklch(0.52 0.05 215)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Key size={11} />
                {skill.keyLabel}
                {showKey ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {apiKey && (
                  <span style={{ color: "oklch(0.82 0.22 140)" }}>✓ 已配置</span>
                )}
              </button>
              {showKey && (
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => onKeyChange(skill.id, e.target.value)}
                  placeholder={skill.keyPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-sm outline-none"
                  style={{
                    background: "oklch(0.10 0.015 238)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SkillStore() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillStates, setSkillStates] = useState<Record<string, boolean>>({});
  const [skillKeys, setSkillKeys] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: config, isLoading } = trpc.dashboard.getConfig.useQuery(undefined, {
    retry: 1,
  });

  const saveSkillsMutation = trpc.dashboard.saveSkills.useMutation({
    onSuccess: () => {
      toast.success("技能配置已保存");
      setIsSaving(false);
    },
    onError: () => {
      toast.error("保存失败，请重试");
      setIsSaving(false);
    },
  });

  // Sync from config
  useEffect(() => {
    if (config?.skills) {
      try {
        const entries = (config.skills as Record<string, unknown>).entries as
          | Record<string, { enabled: boolean; apiKey?: string }>
          | undefined;
        if (entries) {
          const states: Record<string, boolean> = {};
          const keys: Record<string, string> = {};
          for (const [id, val] of Object.entries(entries)) {
            states[id] = val.enabled;
            if (val.apiKey) keys[id] = val.apiKey;
          }
          setSkillStates(states);
          setSkillKeys(keys);
        }
      } catch {
        // ignore
      }
    }
  }, [config]);

  const handleToggle = (id: string, enabled: boolean) => {
    setSkillStates((prev) => ({ ...prev, [id]: enabled }));
    if (!enabled) {
      setSkillKeys((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleKeyChange = (id: string, key: string) => {
    setSkillKeys((prev) => ({ ...prev, [id]: key }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const entries: Record<string, { enabled: boolean; apiKey?: string }> = {};
    for (const skill of SKILLS) {
      if (skillStates[skill.id]) {
        entries[skill.id] = {
          enabled: true,
          ...(skillKeys[skill.id] && { apiKey: skillKeys[skill.id] }),
        };
      }
    }
    saveSkillsMutation.mutate({ entries });
  };

  const filteredSkills = SKILLS.filter((s) => {
    const matchCategory = activeCategory === "all" || s.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      s.name.includes(searchQuery) ||
      s.desc.includes(searchQuery) ||
      s.id.includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const installedCount = Object.values(skillStates).filter(Boolean).length;

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs mb-1"
            style={{
              color: "oklch(0.82 0.22 140)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            SKILL GALLERY / STORE
          </div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "oklch(0.92 0.02 210)",
            }}
          >
            技能商店
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
            已安装 {installedCount}/{SKILLS.length} 个技能
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || saveSkillsMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105 disabled:opacity-50"
          style={{
            background: "oklch(0.82 0.22 140 / 0.15)",
            border: "1px solid oklch(0.82 0.22 140 / 0.5)",
            color: "oklch(0.82 0.22 140)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          保存配置
        </button>
      </div>

      {/* 搜索 + 分类过滤 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "oklch(0.52 0.05 215)" }}
          />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-sm outline-none"
            style={{
              background: "oklch(0.12 0.018 237)",
              border: "1px solid oklch(0.22 0.03 230)",
              color: "oklch(0.88 0.02 210)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className="px-3 py-1.5 text-xs rounded-sm transition-all duration-150"
              style={{
                background:
                  activeCategory === key
                    ? "oklch(0.82 0.22 140 / 0.15)"
                    : "oklch(0.12 0.018 237)",
                border: `1px solid ${
                  activeCategory === key
                    ? "oklch(0.82 0.22 140 / 0.5)"
                    : "oklch(0.18 0.025 235)"
                }`,
                color:
                  activeCategory === key
                    ? "oklch(0.82 0.22 140)"
                    : "oklch(0.52 0.05 215)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 技能列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "oklch(0.52 0.05 215)" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              enabled={skillStates[skill.id] ?? false}
              apiKey={skillKeys[skill.id] ?? ""}
              onToggle={handleToggle}
              onKeyChange={handleKeyChange}
            />
          ))}
          {filteredSkills.length === 0 && (
            <div
              className="col-span-2 text-center py-12 text-sm"
              style={{
                color: "oklch(0.45 0.04 220)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              未找到匹配的技能
            </div>
          )}
        </div>
      )}

      {/* 底部提示 */}
      <div
        className="flex items-center gap-2 text-xs p-3 rounded-sm"
        style={{
          background: "oklch(0.78 0.18 200 / 0.05)",
          border: "1px solid oklch(0.78 0.18 200 / 0.15)",
          color: "oklch(0.52 0.05 215)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <ExternalLink size={12} style={{ color: "oklch(0.78 0.18 200)" }} />
        技能配置保存后将写入 openclawd 的 skills 配置段。API Key 仅存储在本地数据库，不会上传到任何第三方服务。
      </div>
    </div>
  );
}
