/*
 * iClawd SoulEditor - 灵魂与记忆管理
 * 
 * 功能：性格标签选择、记忆卡片管理、System Prompt 预览
 * 风格：工业终端，标签选择，卡片流
 */

import { useState } from "react";
import { Brain, Tag, Trash2, Pin, Search, Plus, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

const personalityTags = [
  { id: "witty", label: "毒舌", emoji: "⚡", desc: "犀利幽默，不留情面" },
  { id: "gentle", label: "温柔", emoji: "🌸", desc: "体贴入微，耐心倾听" },
  { id: "academic", label: "学术", emoji: "📚", desc: "严谨专业，引经据典" },
  { id: "minimal", label: "极简", emoji: "◻", desc: "言简意赅，直击要点" },
  { id: "creative", label: "创意", emoji: "🎨", desc: "天马行空，脑洞大开" },
  { id: "logical", label: "逻辑", emoji: "🔬", desc: "条理清晰，推理严密" },
  { id: "empathetic", label: "共情", emoji: "💙", desc: "感同身受，情感丰富" },
  { id: "humorous", label: "幽默", emoji: "😄", desc: "妙语连珠，轻松愉快" },
  { id: "direct", label: "直接", emoji: "🎯", desc: "开门见山，不绕弯子" },
  { id: "curious", label: "好奇", emoji: "🔍", desc: "求知欲强，探索精神" },
];

const initialMemories = [
  { id: 1, content: "用户喜欢简洁的回答，不喜欢过多废话", pinned: true, time: "2天前", category: "偏好" },
  { id: 2, content: "用户是一名后端开发工程师，熟悉 Python 和 Go", pinned: true, time: "1周前", category: "身份" },
  { id: 3, content: "用户的项目名叫 iClawd，是一个 AI Bot 管理界面", pinned: false, time: "3天前", category: "项目" },
  { id: 4, content: "用户不喜欢被称为您，更喜欢直接交流", pinned: false, time: "5天前", category: "偏好" },
  { id: 5, content: "用户对赛博朋克风格的设计有强烈偏好", pinned: false, time: "1周前", category: "偏好" },
  { id: 6, content: "用户的时区是 UTC+8，通常在晚上活跃", pinned: false, time: "2周前", category: "习惯" },
];

const categoryColors: { [key: string]: string } = {
  偏好: "oklch(0.78 0.18 200)",
  身份: "oklch(0.72 0.18 280)",
  项目: "oklch(0.82 0.22 140)",
  习惯: "oklch(0.78 0.18 65)",
};

export default function SoulEditor() {
  const [selectedTags, setSelectedTags] = useState<string[]>(["witty", "direct", "logical"]);
  const [memories, setMemories] = useState(initialMemories);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const deleteMemory = (id: number) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success("记忆已删除");
  };

  const togglePin = (id: number) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: !m.pinned } : m))
    );
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.includes(searchQuery)
  );

  const sortedMemories = [...filteredMemories].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const generatePrompt = () => {
    const tagDescriptions = selectedTags
      .map((id) => personalityTags.find((t) => t.id === id)?.desc)
      .filter(Boolean)
      .join("；");
    return `你是 ClawDBot，一个智能 AI 助手。你的性格特点：${tagDescriptions}。请始终保持这些特质与用户互动。`;
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
            SOUL & MEMORY
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
            定制 AI 人格 · 管理长期记忆
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm cursor-pointer transition-all"
          onClick={() => setShowPrompt(!showPrompt)}
          style={{
            background: "oklch(0.72 0.18 280 / 0.1)",
            border: "1px solid oklch(0.72 0.18 280 / 0.3)",
            color: "oklch(0.72 0.18 280)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {showPrompt ? <EyeOff size={12} /> : <Eye size={12} />}
          {showPrompt ? "隐藏 Prompt" : "预览 Prompt"}
        </div>
      </div>

      {/* Prompt 预览 */}
      {showPrompt && (
        <div
          className="panel-card p-4 fade-in-up"
          style={{ borderColor: "oklch(0.72 0.18 280 / 0.4)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: "oklch(0.72 0.18 280)" }} />
            <span
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.18 280)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              GENERATED SYSTEM PROMPT
            </span>
          </div>
          <div
            className="text-sm p-3 rounded-sm"
            style={{
              background: "oklch(0.08 0.014 238)",
              border: "1px solid oklch(0.18 0.025 235)",
              color: "oklch(0.75 0.04 210)",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1.7,
            }}
          >
            {generatePrompt()}
          </div>
          <div className="mt-2 text-xs" style={{ color: "oklch(0.38 0.04 220)" }}>
            * 此 Prompt 由选中的性格标签自动生成，保存后将写入 config.json
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 灵魂编辑器 */}
        <div className="space-y-4">
          <div className="panel-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} style={{ color: "oklch(0.78 0.18 200)" }} />
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                SOUL EDITOR · 性格标签
              </span>
              <span
                className="ml-auto text-xs"
                style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {selectedTags.length}/{personalityTags.length} 已选
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {personalityTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-start gap-2 p-3 rounded-sm text-left transition-all duration-150"
                    style={{
                      background: isSelected ? "oklch(0.78 0.18 200 / 0.12)" : "oklch(0.14 0.015 235)",
                      border: `1px solid ${isSelected ? "oklch(0.78 0.18 200 / 0.6)" : "oklch(0.22 0.03 230)"}`,
                      boxShadow: isSelected ? "0 0 12px oklch(0.78 0.18 200 / 0.1)" : "none",
                    }}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{tag.emoji}</span>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{
                          color: isSelected ? "oklch(0.78 0.18 200)" : "oklch(0.75 0.04 210)",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {tag.label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "oklch(0.45 0.04 220)" }}
                      >
                        {tag.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        className="ml-auto flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "oklch(0.78 0.18 200)" }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.08 0.015 240)" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => toast.success("灵魂配置已保存！config.json 已更新。")}
              className="w-full mt-4 py-2.5 text-sm font-medium rounded-sm transition-all duration-150"
              style={{
                background: "oklch(0.78 0.18 200 / 0.15)",
                border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              SAVE SOUL CONFIG
            </button>
          </div>
        </div>

        {/* 记忆图谱 */}
        <div className="space-y-4">
          <div className="panel-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} style={{ color: "oklch(0.82 0.22 140)" }} />
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                MEMORY ATLAS · {memories.length} 条记忆
              </span>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-3">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.52 0.05 215)" }}
              />
              <input
                type="text"
                placeholder="搜索记忆..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-sm outline-none"
                style={{
                  background: "oklch(0.14 0.015 235)",
                  border: "1px solid oklch(0.22 0.03 230)",
                  color: "oklch(0.78 0.02 210)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>

            {/* 记忆卡片列表 */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 rounded-sm transition-all duration-150 group"
                  style={{
                    background: memory.pinned ? "oklch(0.78 0.18 200 / 0.06)" : "oklch(0.14 0.015 235)",
                    border: `1px solid ${memory.pinned ? "oklch(0.78 0.18 200 / 0.25)" : "oklch(0.22 0.03 230)"}`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="tag-chip text-xs"
                          style={{
                            borderColor: `${categoryColors[memory.category] || "oklch(0.52 0.05 215)"}/0.4`,
                            color: categoryColors[memory.category] || "oklch(0.52 0.05 215)",
                          }}
                        >
                          {memory.category}
                        </span>
                        {memory.pinned && (
                          <span className="text-xs" style={{ color: "oklch(0.78 0.18 200)" }}>
                            📌 置顶
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "oklch(0.72 0.04 210)" }}
                      >
                        {memory.content}
                      </p>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {memory.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => togglePin(memory.id)}
                        className="p-1 rounded-sm transition-colors"
                        style={{ color: memory.pinned ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)" }}
                      >
                        <Pin size={12} />
                      </button>
                      <button
                        onClick={() => deleteMemory(memory.id)}
                        className="p-1 rounded-sm transition-colors"
                        style={{ color: "oklch(0.62 0.22 25)" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sortedMemories.length === 0 && (
                <div
                  className="text-center py-8 text-xs"
                  style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  未找到匹配的记忆
                </div>
              )}
            </div>

            <button
              onClick={() => toast.info("手动添加记忆功能即将推出")}
              className="w-full mt-3 py-2 text-xs rounded-sm flex items-center justify-center gap-2 transition-all duration-150"
              style={{
                background: "transparent",
                border: "1px dashed oklch(0.28 0.03 230)",
                color: "oklch(0.45 0.04 220)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Plus size={12} />
              手动添加记忆
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
