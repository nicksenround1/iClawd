/*
 * iClawd Models - 模型配对与 API Key 管理
 *
 * 功能：
 *  - 可视化切换主模型（对齐 openclawd models.primary 配置）
 *  - 备用模型配置（fallbacks）
 *  - API Key 加密保险箱（本地存储，展示时脱敏）
 *  - 支持 OpenAI / Anthropic / Gemini / Mistral / 本地模型
 */

import { useState, useEffect } from "react";
import {
  Cpu,
  Key,
  Check,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Model Catalog ────────────────────────────────────────────────────────────

interface ModelDef {
  id: string;
  name: string;
  provider: string;
  providerKey: string;
  emoji: string;
  desc: string;
  contextWindow: string;
  speed: "fast" | "medium" | "slow";
  quality: "high" | "medium" | "budget";
  popular?: boolean;
  free?: boolean;
}

const MODELS: ModelDef[] = [
  {
    id: "anthropic/claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    providerKey: "anthropic",
    emoji: "🎭",
    desc: "最强推理能力，适合复杂任务和长文档处理",
    contextWindow: "200K",
    speed: "slow",
    quality: "high",
    popular: true,
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    providerKey: "anthropic",
    emoji: "🎵",
    desc: "性能与速度的完美平衡，日常使用首选",
    contextWindow: "200K",
    speed: "medium",
    quality: "high",
    popular: true,
  },
  {
    id: "anthropic/claude-haiku-3-5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    providerKey: "anthropic",
    emoji: "⚡",
    desc: "极速响应，适合简单问答和实时交互",
    contextWindow: "200K",
    speed: "fast",
    quality: "medium",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerKey: "openai",
    emoji: "🤖",
    desc: "多模态旗舰模型，支持图像理解和代码生成",
    contextWindow: "128K",
    speed: "medium",
    quality: "high",
    popular: true,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerKey: "openai",
    emoji: "🚀",
    desc: "高性价比，适合高频调用场景",
    contextWindow: "128K",
    speed: "fast",
    quality: "medium",
  },
  {
    id: "openai/o1-preview",
    name: "o1 Preview",
    provider: "OpenAI",
    providerKey: "openai",
    emoji: "🧠",
    desc: "深度推理模型，擅长数学和科学问题",
    contextWindow: "128K",
    speed: "slow",
    quality: "high",
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    providerKey: "google",
    emoji: "💎",
    desc: "谷歌最新多模态模型，支持超长上下文",
    contextWindow: "1M",
    speed: "fast",
    quality: "high",
    popular: true,
  },
  {
    id: "google/gemini-2.0-flash-thinking",
    name: "Gemini 2.0 Flash Thinking",
    provider: "Google",
    providerKey: "google",
    emoji: "🔮",
    desc: "带思维链的推理模型，解题能力出色",
    contextWindow: "32K",
    speed: "medium",
    quality: "high",
  },
  {
    id: "mistral/mistral-large-latest",
    name: "Mistral Large",
    provider: "Mistral",
    providerKey: "mistral",
    emoji: "🌊",
    desc: "欧洲顶级开源模型，代码和多语言能力强",
    contextWindow: "128K",
    speed: "medium",
    quality: "high",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    providerKey: "deepseek",
    emoji: "🐋",
    desc: "高性价比中文模型，编程和推理能力优秀",
    contextWindow: "64K",
    speed: "medium",
    quality: "high",
    popular: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "Meta",
    providerKey: "openrouter",
    emoji: "🦙",
    desc: "Meta 开源旗舰，通过 OpenRouter 调用",
    contextWindow: "128K",
    speed: "medium",
    quality: "medium",
    free: true,
  },
];

const PROVIDERS = [
  { key: "openai", name: "OpenAI", placeholder: "sk-...", color: "oklch(0.82 0.22 140)" },
  { key: "anthropic", name: "Anthropic", placeholder: "sk-ant-...", color: "oklch(0.78 0.18 200)" },
  { key: "google", name: "Google AI", placeholder: "AIza...", color: "oklch(0.78 0.18 65)" },
  { key: "mistral", name: "Mistral", placeholder: "...", color: "oklch(0.72 0.18 280)" },
  { key: "deepseek", name: "DeepSeek", placeholder: "sk-...", color: "oklch(0.75 0.18 340)" },
  { key: "openrouter", name: "OpenRouter", placeholder: "sk-or-...", color: "oklch(0.78 0.18 30)" },
];

const SPEED_LABELS = { fast: "极速", medium: "均衡", slow: "深思" };
const QUALITY_LABELS = { high: "旗舰", medium: "标准", budget: "经济" };
const SPEED_COLORS = {
  fast: "oklch(0.82 0.22 140)",
  medium: "oklch(0.78 0.18 200)",
  slow: "oklch(0.72 0.18 280)",
};
const QUALITY_COLORS = {
  high: "oklch(0.78 0.18 65)",
  medium: "oklch(0.78 0.18 200)",
  budget: "oklch(0.52 0.05 215)",
};

// ─── Model Card ───────────────────────────────────────────────────────────────

function ModelCard({
  model,
  isActive,
  onSelect,
}: {
  model: ModelDef;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(model.id)}
      className="w-full text-left p-4 rounded-sm transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: isActive ? "oklch(0.78 0.18 200 / 0.08)" : "oklch(0.11 0.016 236)",
        border: `1px solid ${isActive ? "oklch(0.78 0.18 200 / 0.5)" : "oklch(0.18 0.025 235)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 text-xl"
          style={{
            background: isActive ? "oklch(0.78 0.18 200 / 0.15)" : "oklch(0.12 0.018 237)",
            border: `1px solid ${isActive ? "oklch(0.78 0.18 200 / 0.4)" : "oklch(0.18 0.025 235)"}`,
          }}
        >
          {model.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-medium"
              style={{ color: "oklch(0.88 0.02 210)", fontFamily: "'IBM Plex Sans', sans-serif" }}
            >
              {model.name}
            </span>
            {model.popular && (
              <Star size={11} fill="oklch(0.78 0.18 65)" style={{ color: "oklch(0.78 0.18 65)" }} />
            )}
            {model.free && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-sm"
                style={{
                  background: "oklch(0.82 0.22 140 / 0.1)",
                  border: "1px solid oklch(0.82 0.22 140 / 0.3)",
                  color: "oklch(0.82 0.22 140)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                免费
              </span>
            )}
          </div>
          <div className="text-xs mb-2" style={{ color: "oklch(0.52 0.05 215)" }}>
            {model.desc}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-1.5 py-0.5 rounded-sm"
              style={{
                background: `${SPEED_COLORS[model.speed]}/0.1`,
                border: `1px solid ${SPEED_COLORS[model.speed]}/0.3`,
                color: SPEED_COLORS[model.speed],
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {SPEED_LABELS[model.speed]}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-sm"
              style={{
                background: `${QUALITY_COLORS[model.quality]}/0.1`,
                border: `1px solid ${QUALITY_COLORS[model.quality]}/0.3`,
                color: QUALITY_COLORS[model.quality],
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {QUALITY_LABELS[model.quality]}
            </span>
            <span
              className="text-xs"
              style={{ color: "oklch(0.45 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {model.contextWindow} ctx
            </span>
          </div>
        </div>
        {isActive && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.78 0.18 200 / 0.2)", border: "1px solid oklch(0.78 0.18 200 / 0.5)" }}
          >
            <Check size={11} style={{ color: "oklch(0.78 0.18 200)" }} />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Models() {
  const [activeModel, setActiveModel] = useState("anthropic/claude-opus-4-5");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [filterProvider, setFilterProvider] = useState("all");

  const { data: config, isLoading } = trpc.dashboard.getConfig.useQuery(undefined, { retry: 1 });

  const saveModelsMutation = trpc.dashboard.saveModels.useMutation({
    onSuccess: () => {
      toast.success("模型配置已保存");
      setIsSaving(false);
    },
    onError: () => {
      toast.error("保存失败，请重试");
      setIsSaving(false);
    },
  });

  // Sync from config
  useEffect(() => {
    if (config) {
      if (config.activeModel) setActiveModel(config.activeModel);
      // Extract API keys from models.env (they are masked, just show placeholder)
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(apiKeys)) {
      if (v && !v.includes("*")) {
        env[`${k.toUpperCase()}_API_KEY`] = v;
      }
    }
    saveModelsMutation.mutate({
      primary: activeModel,
      ...(Object.keys(env).length > 0 && { env }),
    });
  };

  const filteredModels = MODELS.filter(
    (m) => filterProvider === "all" || m.providerKey === filterProvider
  );

  const providers = ["all", ...Array.from(new Set(MODELS.map((m) => m.providerKey)))];

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <div
            className="text-xs mb-1"
            style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            MODEL PAIRING / CONFIGURATION
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            模型配对
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
            当前主模型：
            <span style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}>
              {activeModel}
            </span>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || saveModelsMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105 disabled:opacity-50"
          style={{
            background: "oklch(0.78 0.18 200 / 0.15)",
            border: "1px solid oklch(0.78 0.18 200 / 0.5)",
            color: "oklch(0.78 0.18 200)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：模型选择 */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="text-xs px-3 py-2 rounded-sm"
            style={{
              background: "oklch(0.78 0.18 200 / 0.05)",
              border: "1px solid oklch(0.78 0.18 200 / 0.15)",
              color: "oklch(0.52 0.05 215)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: "oklch(0.78 0.18 200)" }}>PRIMARY MODEL</span>
            {" "}— 选择 ClawDBot 的主要对话模型。点击卡片即可切换。
          </div>

          {/* 厂商过滤 */}
          <div className="flex items-center gap-2 flex-wrap">
            {providers.map((p) => {
              const label =
                p === "all"
                  ? "全部"
                  : PROVIDERS.find((pr) => pr.key === p)?.name ?? p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterProvider(p)}
                  className="px-3 py-1.5 text-xs rounded-sm transition-all duration-150"
                  style={{
                    background:
                      filterProvider === p
                        ? "oklch(0.78 0.18 200 / 0.15)"
                        : "oklch(0.12 0.018 237)",
                    border: `1px solid ${
                      filterProvider === p
                        ? "oklch(0.78 0.18 200 / 0.5)"
                        : "oklch(0.18 0.025 235)"
                    }`,
                    color:
                      filterProvider === p
                        ? "oklch(0.78 0.18 200)"
                        : "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: "oklch(0.52 0.05 215)" }} />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isActive={activeModel === model.id}
                  onSelect={setActiveModel}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右侧：API Key 保险箱 */}
        <div className="space-y-4">
          <div
            className="text-xs px-3 py-2 rounded-sm"
            style={{
              background: "oklch(0.78 0.18 65 / 0.05)",
              border: "1px solid oklch(0.78 0.18 65 / 0.15)",
              color: "oklch(0.52 0.05 215)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: "oklch(0.78 0.18 65)" }}>API KEY VAULT</span>
            {" "}— 密钥仅存储在本地数据库，不会上传到任何第三方服务。
          </div>

          <div
            className="flex items-center gap-2 text-xs p-3 rounded-sm"
            style={{
              background: "oklch(0.82 0.22 140 / 0.05)",
              border: "1px solid oklch(0.82 0.22 140 / 0.15)",
              color: "oklch(0.52 0.05 215)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Shield size={12} style={{ color: "oklch(0.82 0.22 140)" }} />
            数据本地存储 · 零上传 · 隐私优先
          </div>

          <div className="space-y-3">
            {PROVIDERS.map((provider) => {
              const isVisible = showKeys[provider.key];
              const value = apiKeys[provider.key] ?? "";
              const masked = config?.models?.env
                ? (config.models.env as Record<string, string | null>)[
                    `${provider.key.toUpperCase()}_API_KEY`
                  ]
                : null;

              return (
                <div
                  key={provider.key}
                  className="p-3 rounded-sm"
                  style={{
                    background: "oklch(0.11 0.016 236)",
                    border: "1px solid oklch(0.18 0.025 235)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key size={12} style={{ color: provider.color }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: provider.color, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {provider.name}
                      </span>
                    </div>
                    {masked && (
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.82 0.22 140)", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        ✓ 已配置
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={value || (masked ?? "")}
                      onChange={(e) =>
                        setApiKeys((prev) => ({ ...prev, [provider.key]: e.target.value }))
                      }
                      placeholder={masked ? masked : provider.placeholder}
                      className="w-full pr-8 pl-3 py-2 text-xs rounded-sm outline-none"
                      style={{
                        background: "oklch(0.10 0.015 238)",
                        border: "1px solid oklch(0.22 0.03 230)",
                        color: "oklch(0.88 0.02 210)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                    <button
                      onClick={() =>
                        setShowKeys((prev) => ({ ...prev, [provider.key]: !isVisible }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.45 0.04 220)" }}
                    >
                      {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 快速导航 */}
          <div
            className="p-3 rounded-sm"
            style={{
              background: "oklch(0.11 0.016 236)",
              border: "1px solid oklch(0.18 0.025 235)",
            }}
          >
            <div
              className="text-xs mb-2"
              style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
            >
              快速获取 API Key
            </div>
            {[
              { name: "OpenAI Platform", url: "https://platform.openai.com/api-keys" },
              { name: "Anthropic Console", url: "https://console.anthropic.com" },
              { name: "Google AI Studio", url: "https://aistudio.google.com" },
              { name: "OpenRouter", url: "https://openrouter.ai/keys" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-1.5 text-xs transition-colors hover:opacity-80"
                style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {link.name}
                <ChevronRight size={11} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
