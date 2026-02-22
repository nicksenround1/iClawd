/*
 * iClawd Soul Editor - OpenClaw SOUL.md + 记忆管理
 *
 * 功能：
 *  - SOUL.md 可视化编辑（性格标签 → 自动生成 SOUL.md 内容）
 *  - 记忆卡片管理（增删改查、置顶）
 *  - 实时保存到后端 tRPC API
 */

import { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Soul Presets ─────────────────────────────────────────────────────────────

const PERSONALITY_TAGS = [
  { id: "helpful", label: "乐于助人", emoji: "🤝", desc: "主动提供帮助，回答详尽" },
  { id: "concise", label: "简洁精炼", emoji: "✂️", desc: "回复简短，直击要点" },
  { id: "witty", label: "幽默风趣", emoji: "😄", desc: "适时加入幽默，轻松愉快" },
  { id: "academic", label: "学术严谨", emoji: "🎓", desc: "引用来源，逻辑严密" },
  { id: "creative", label: "富有创意", emoji: "🎨", desc: "提供新颖独特的想法" },
  { id: "empathetic", label: "善解人意", emoji: "💙", desc: "关注情感，给予支持" },
  { id: "direct", label: "直接坦率", emoji: "🎯", desc: "不绕弯子，直接说重点" },
  { id: "cautious", label: "谨慎保守", emoji: "🛡️", desc: "不确定时明确说明" },
];

const LANGUAGE_TAGS = [
  { id: "zh", label: "中文优先", emoji: "🇨🇳" },
  { id: "en", label: "英文优先", emoji: "🇺🇸" },
  { id: "bilingual", label: "双语切换", emoji: "🌐" },
];

const CREATURE_PRESETS = [
  { id: "lobster", label: "龙虾", emoji: "🦞", desc: "ClawDBot 的默认形态" },
  { id: "robot", label: "机器人", emoji: "🤖", desc: "经典 AI 助手形象" },
  { id: "cat", label: "猫咪", emoji: "🐱", desc: "可爱亲切的伙伴" },
  { id: "owl", label: "猫头鹰", emoji: "🦉", desc: "智慧博学的顾问" },
  { id: "dragon", label: "龙", emoji: "🐉", desc: "强大神秘的存在" },
  { id: "fox", label: "狐狸", emoji: "🦊", desc: "机智灵活的助手" },
];

function generateSoulMd(
  selectedTags: string[],
  selectedLang: string,
  selectedCreature: string,
  botName: string,
  customVibe: string
): string {
  const creature = CREATURE_PRESETS.find((c) => c.id === selectedCreature);
  const tags = PERSONALITY_TAGS.filter((t) => selectedTags.includes(t.id));
  const lang = LANGUAGE_TAGS.find((l) => l.id === selectedLang);

  const personalityDesc =
    tags.length > 0 ? tags.map((t) => t.desc).join("；") : "乐于助人，回答准确";

  return `# ${creature?.emoji ?? "🤖"} ${botName}

## Identity
You are ${botName}, ${creature ? `a ${creature.label} (${creature.emoji})` : "an AI assistant"} powered by OpenClaw.

## Personality
${personalityDesc}。

${customVibe ? `## Vibe\n${customVibe}\n` : ""}
## Language
${lang?.label ?? "中文优先"}。根据用户使用的语言自动切换回复语言。

## Core Principles
- 始终保持诚实，不确定时明确说明
- 尊重用户隐私，不主动索取敏感信息
- 遇到超出能力范围的问题，诚实告知并建议其他途径
`;
}

// ─── Memory Card ──────────────────────────────────────────────────────────────

interface Memory {
  id: number;
  title: string;
  content: string;
  isPinned: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

function MemoryCard({
  memory,
  onPin,
  onDelete,
}: {
  memory: Memory;
  onPin: (id: number, pinned: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const categoryColors: Record<string, string> = {
    preference: "oklch(0.78 0.18 200)",
    fact: "oklch(0.82 0.22 140)",
    context: "oklch(0.72 0.18 280)",
    reminder: "oklch(0.78 0.18 65)",
    other: "oklch(0.52 0.05 215)",
  };
  const color = categoryColors[memory.category] ?? categoryColors.other;

  return (
    <div
      className="p-4 rounded-sm transition-all duration-150"
      style={{
        background: memory.isPinned ? "oklch(0.78 0.18 65 / 0.04)" : "oklch(0.12 0.018 237)",
        border: `1px solid ${memory.isPinned ? "oklch(0.78 0.18 65 / 0.35)" : "oklch(0.18 0.025 235)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {memory.isPinned === 1 && (
              <Pin size={10} style={{ color: "oklch(0.78 0.18 65)" }} />
            )}
            <span
              className="text-xs px-1.5 py-0.5 rounded-sm"
              style={{
                background: `${color}/0.1`,
                border: `1px solid ${color}/0.3`,
                color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {memory.category}
            </span>
          </div>
          <div
            className="text-sm font-medium mb-1"
            style={{ color: "oklch(0.88 0.02 210)", fontFamily: "'IBM Plex Sans', sans-serif" }}
          >
            {memory.title}
          </div>
          <div
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "oklch(0.55 0.04 215)" }}
          >
            {memory.content}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onPin(memory.id, memory.isPinned !== 1)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-150 hover:scale-110"
            style={{
              background: "oklch(0.78 0.18 65 / 0.1)",
              border: "1px solid oklch(0.78 0.18 65 / 0.3)",
              color: "oklch(0.78 0.18 65)",
            }}
          >
            {memory.isPinned === 1 ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button
            onClick={() => onDelete(memory.id)}
            className="w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-150 hover:scale-110"
            style={{
              background: "oklch(0.65 0.22 30 / 0.1)",
              border: "1px solid oklch(0.65 0.22 30 / 0.3)",
              color: "oklch(0.65 0.22 30)",
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SoulEditor() {
  const [selectedTags, setSelectedTags] = useState<string[]>(["helpful", "concise"]);
  const [selectedLang, setSelectedLang] = useState("zh");
  const [selectedCreature, setSelectedCreature] = useState("lobster");
  const [botName, setBotName] = useState("ClawDBot");
  const [customVibe, setCustomVibe] = useState("");
  const [soulPreview, setSoulPreview] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  // Memory state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("preference");
  const [showAddForm, setShowAddForm] = useState(false);

  // Data fetching
  const { data: config } = trpc.dashboard.getConfig.useQuery(undefined, { retry: 1 });
  const {
    data: memoriesData,
    isLoading: memoriesLoading,
    refetch: refetchMemories,
  } = trpc.dashboard.getMemories.useQuery(undefined, { retry: 1 });

  const saveSoulMutation = trpc.dashboard.saveSoul.useMutation({
    onSuccess: () => toast.success("SOUL.md 已保存"),
    onError: () => toast.error("保存失败，请重试"),
  });

  const createMemoryMutation = trpc.dashboard.createMemory.useMutation({
    onSuccess: () => {
      toast.success("记忆已添加");
      setNewTitle("");
      setNewContent("");
      setShowAddForm(false);
      refetchMemories();
    },
    onError: () => toast.error("添加失败"),
  });

  const updateMemoryMutation = trpc.dashboard.updateMemory.useMutation({
    onSuccess: () => refetchMemories(),
  });

  const deleteMemoryMutation = trpc.dashboard.deleteMemory.useMutation({
    onSuccess: () => {
      toast.success("记忆已删除");
      refetchMemories();
    },
  });

  // Sync config to local state
  useEffect(() => {
    if (config) {
      setBotName(config.botName);
      if (config.soulMd) setSoulPreview(config.soulMd);
    }
  }, [config]);

  // Regenerate SOUL.md preview when tags change
  useEffect(() => {
    const generated = generateSoulMd(
      selectedTags,
      selectedLang,
      selectedCreature,
      botName,
      customVibe
    );
    setSoulPreview(generated);
  }, [selectedTags, selectedLang, selectedCreature, botName, customVibe]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSaveSoul = () => {
    saveSoulMutation.mutate({ soulMd: soulPreview });
  };

  const handleAddMemory = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }
    createMemoryMutation.mutate({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      isPinned: false,
    });
  };

  const handlePinMemory = (id: number, pinned: boolean) => {
    updateMemoryMutation.mutate({ id, isPinned: pinned });
  };

  const handleDeleteMemory = (id: number) => {
    deleteMemoryMutation.mutate({ id });
  };

  const memories = memoriesData ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs mb-1"
            style={{ color: "oklch(0.72 0.18 280)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            SOUL & MEMORY / EDITOR
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            灵魂与记忆
          </h1>
        </div>
        <button
          onClick={handleSaveSoul}
          disabled={saveSoulMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105 disabled:opacity-50"
          style={{
            background: "oklch(0.72 0.18 280 / 0.15)",
            border: "1px solid oklch(0.72 0.18 280 / 0.5)",
            color: "oklch(0.72 0.18 280)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {saveSoulMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          保存 SOUL.md
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左列：性格配置 */}
        <div className="space-y-5">
          {/* Bot 基础信息 */}
          <div className="panel-card p-5">
            <div
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              BOT IDENTITY
            </div>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs mb-1.5 block"
                  style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Bot 名称
                </label>
                <input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-sm outline-none"
                  style={{
                    background: "oklch(0.12 0.018 237)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  placeholder="ClawDBot"
                />
              </div>
              <div>
                <label
                  className="text-xs mb-1.5 block"
                  style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  自定义 Vibe（可选）
                </label>
                <input
                  value={customVibe}
                  onChange={(e) => setCustomVibe(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-sm outline-none"
                  style={{
                    background: "oklch(0.12 0.018 237)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  placeholder="例如：像一位老朋友一样聊天..."
                />
              </div>
            </div>
          </div>

          {/* 形象选择 */}
          <div className="panel-card p-5">
            <div
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              CREATURE FORM
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CREATURE_PRESETS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCreature(c.id)}
                  className="p-3 rounded-sm text-center transition-all duration-150 hover:scale-105"
                  style={{
                    background:
                      selectedCreature === c.id
                        ? "oklch(0.72 0.18 280 / 0.15)"
                        : "oklch(0.12 0.018 237)",
                    border: `1px solid ${
                      selectedCreature === c.id
                        ? "oklch(0.72 0.18 280 / 0.5)"
                        : "oklch(0.18 0.025 235)"
                    }`,
                  }}
                >
                  <div className="text-2xl mb-1">{c.emoji}</div>
                  <div
                    className="text-xs"
                    style={{
                      color:
                        selectedCreature === c.id
                          ? "oklch(0.72 0.18 280)"
                          : "oklch(0.52 0.05 215)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {c.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 性格标签 */}
          <div className="panel-card p-5">
            <div
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              PERSONALITY TAGS ({selectedTags.length} 已选)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITY_TAGS.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-2 p-2.5 rounded-sm text-left transition-all duration-150"
                    style={{
                      background: active
                        ? "oklch(0.72 0.18 280 / 0.12)"
                        : "oklch(0.12 0.018 237)",
                      border: `1px solid ${
                        active ? "oklch(0.72 0.18 280 / 0.4)" : "oklch(0.18 0.025 235)"
                      }`,
                    }}
                  >
                    <span className="text-base">{tag.emoji}</span>
                    <div>
                      <div
                        className="text-xs font-medium"
                        style={{
                          color: active ? "oklch(0.72 0.18 280)" : "oklch(0.75 0.04 210)",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {tag.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 语言偏好 */}
          <div className="panel-card p-5">
            <div
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              LANGUAGE PREFERENCE
            </div>
            <div className="flex gap-2">
              {LANGUAGE_TAGS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-sm transition-all duration-150"
                  style={{
                    background:
                      selectedLang === lang.id
                        ? "oklch(0.78 0.18 200 / 0.12)"
                        : "oklch(0.12 0.018 237)",
                    border: `1px solid ${
                      selectedLang === lang.id
                        ? "oklch(0.78 0.18 200 / 0.4)"
                        : "oklch(0.18 0.025 235)"
                    }`,
                    color:
                      selectedLang === lang.id
                        ? "oklch(0.78 0.18 200)"
                        : "oklch(0.52 0.05 215)",
                  }}
                >
                  <span>{lang.emoji}</span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右列：SOUL.md 预览 + 记忆管理 */}
        <div className="space-y-5">
          {/* SOUL.md 预览 */}
          <div className="panel-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                SOUL.md PREVIEW
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={12} style={{ color: "oklch(0.72 0.18 280)" }} />
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-xs flex items-center gap-1"
                  style={{
                    color: "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showRaw ? "折叠" : "展开原文"}
                </button>
              </div>
            </div>
            <div
              className="rounded-sm p-3 text-xs leading-relaxed overflow-auto"
              style={{
                background: "oklch(0.08 0.012 240)",
                border: "1px solid oklch(0.18 0.025 235)",
                color: "oklch(0.72 0.18 280)",
                fontFamily: "'JetBrains Mono', monospace",
                maxHeight: showRaw ? "none" : "280px",
                whiteSpace: "pre-wrap",
              }}
            >
              {soulPreview}
            </div>
            <div
              className="mt-2 text-xs"
              style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              此内容将保存到 SOUL.md，作为 ClawDBot 的系统提示词
            </div>
          </div>

          {/* 记忆管理 */}
          <div className="panel-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                MEMORY ATLAS ({memories.length})
              </div>
              <div className="flex items-center gap-2">
                {memoriesLoading && (
                  <Loader2
                    size={12}
                    className="animate-spin"
                    style={{ color: "oklch(0.52 0.05 215)" }}
                  />
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm transition-all duration-150"
                  style={{
                    background: "oklch(0.82 0.22 140 / 0.1)",
                    border: "1px solid oklch(0.82 0.22 140 / 0.4)",
                    color: "oklch(0.82 0.22 140)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Plus size={12} />
                  添加记忆
                </button>
              </div>
            </div>

            {/* 添加表单 */}
            {showAddForm && (
              <div
                className="mb-4 p-3 rounded-sm space-y-2"
                style={{
                  background: "oklch(0.10 0.015 238)",
                  border: "1px solid oklch(0.20 0.028 232)",
                }}
              >
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="记忆标题..."
                  className="w-full px-3 py-2 text-xs rounded-sm outline-none"
                  style={{
                    background: "oklch(0.12 0.018 237)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="记忆内容..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-sm outline-none resize-none"
                  style={{
                    background: "oklch(0.12 0.018 237)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs rounded-sm outline-none"
                    style={{
                      background: "oklch(0.12 0.018 237)",
                      border: "1px solid oklch(0.22 0.03 230)",
                      color: "oklch(0.88 0.02 210)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <option value="preference">偏好</option>
                    <option value="fact">事实</option>
                    <option value="context">背景</option>
                    <option value="reminder">提醒</option>
                    <option value="other">其他</option>
                  </select>
                  <button
                    onClick={handleAddMemory}
                    disabled={createMemoryMutation.isPending}
                    className="px-3 py-1.5 text-xs rounded-sm transition-all duration-150 disabled:opacity-50"
                    style={{
                      background: "oklch(0.82 0.22 140 / 0.15)",
                      border: "1px solid oklch(0.82 0.22 140 / 0.5)",
                      color: "oklch(0.82 0.22 140)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {createMemoryMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      "保存"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 记忆列表 */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {memories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Brain
                    size={28}
                    style={{ color: "oklch(0.38 0.04 220)", opacity: 0.5 }}
                  />
                  <div
                    className="text-xs"
                    style={{
                      color: "oklch(0.45 0.04 220)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    暂无记忆条目
                  </div>
                  <div
                    className="text-xs text-center"
                    style={{ color: "oklch(0.38 0.04 220)" }}
                  >
                    ClawDBot 会在对话中自动积累记忆，
                    <br />
                    或点击"添加记忆"手动创建
                  </div>
                </div>
              ) : (
                memories.map((m) => (
                  <MemoryCard
                    key={m.id}
                    memory={m}
                    onPin={handlePinMemory}
                    onDelete={handleDeleteMemory}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
