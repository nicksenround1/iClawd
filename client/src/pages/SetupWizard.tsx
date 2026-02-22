/*
 * iClawd Setup Wizard - OpenClaw 安装向导
 *
 * 三步走：
 *  Step 1: 连接 Gateway（填写 Gateway URL + Token）
 *  Step 2: 配置主模型（选择 LLM + 填写 API Key）
 *  Step 3: 注入灵魂（选择人格模板 + 自定义 Bot 名字）
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Terminal,
  ChevronRight,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  Brain,
  Cpu,
  ArrowRight,
  Activity,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "连接 Gateway", icon: Terminal, color: "oklch(0.78 0.18 200)" },
  { id: 2, label: "配置模型", icon: Cpu, color: "oklch(0.82 0.22 140)" },
  { id: 3, label: "注入灵魂", icon: Brain, color: "oklch(0.72 0.18 280)" },
];

// ─── Personality Templates ────────────────────────────────────────────────────

const PERSONALITIES = [
  {
    id: "assistant",
    name: "专业助手",
    emoji: "🤝",
    vibe: "professional, helpful, precise",
    creature: "assistant",
    desc: "严谨专业，回答准确，适合工作场景",
    color: "oklch(0.78 0.18 200)",
  },
  {
    id: "friend",
    name: "贴心朋友",
    emoji: "😊",
    vibe: "friendly, warm, casual, empathetic",
    creature: "companion",
    desc: "温暖亲切，像朋友一样陪伴左右",
    color: "oklch(0.82 0.22 140)",
  },
  {
    id: "expert",
    name: "技术极客",
    emoji: "💻",
    vibe: "technical, analytical, detail-oriented",
    creature: "engineer",
    desc: "深度技术分析，代码和数据是强项",
    color: "oklch(0.78 0.18 65)",
  },
  {
    id: "creative",
    name: "创意大师",
    emoji: "🎨",
    vibe: "creative, imaginative, artistic, playful",
    creature: "artist",
    desc: "天马行空，擅长创意写作和头脑风暴",
    color: "oklch(0.72 0.18 280)",
  },
  {
    id: "tutor",
    name: "耐心导师",
    emoji: "📚",
    vibe: "educational, patient, encouraging, clear",
    creature: "teacher",
    desc: "循循善诱，擅长解释复杂概念",
    color: "oklch(0.75 0.18 340)",
  },
  {
    id: "custom",
    name: "自定义",
    emoji: "⚙️",
    vibe: "",
    creature: "",
    desc: "完全自定义人格，在灵魂编辑器中精细配置",
    color: "oklch(0.52 0.05 215)",
  },
];

const QUICK_MODELS = [
  { id: "anthropic/claude-opus-4-5", name: "Claude Opus 4.5", emoji: "🎭", provider: "anthropic" },
  { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5", emoji: "🎵", provider: "anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o", emoji: "🤖", provider: "openai" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", emoji: "💎", provider: "google" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", emoji: "🐋", provider: "deepseek" },
];

// ─── Terminal Log Component ───────────────────────────────────────────────────

function TerminalLog({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded-sm p-4 font-mono text-xs space-y-1 max-h-32 overflow-y-auto"
      style={{
        background: "oklch(0.07 0.012 238)",
        border: "1px solid oklch(0.18 0.025 235)",
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex items-start gap-2"
          style={{
            color: line.startsWith("✓")
              ? "oklch(0.82 0.22 140)"
              : line.startsWith("✗")
              ? "oklch(0.62 0.22 25)"
              : line.startsWith("→")
              ? "oklch(0.78 0.18 200)"
              : "oklch(0.55 0.04 215)",
          }}
        >
          <span style={{ color: "oklch(0.38 0.04 220)" }}>$</span>
          {line}
        </div>
      ))}
      <div className="flex items-center gap-1" style={{ color: "oklch(0.78 0.18 200)" }}>
        <span>$</span>
        <span className="animate-pulse">_</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SetupWizard() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);

  // Step 1 state
  const [gatewayUrl, setGatewayUrl] = useState("http://localhost:3000");
  const [gatewayToken, setGatewayToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [gatewayLogs, setGatewayLogs] = useState<string[]>([
    "→ 等待 Gateway 配置...",
  ]);

  // Step 2 state
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-opus-4-5");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Step 3 state
  const [botName, setBotName] = useState("ClawDBot");
  const [selectedPersonality, setSelectedPersonality] = useState("assistant");

  const saveConfigMutation = trpc.dashboard.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("配置已保存！");
    },
    onError: () => {
      toast.error("保存失败，请重试");
    },
  });

  const saveModelsMutation = trpc.dashboard.saveModels.useMutation({
    onError: () => toast.error("模型保存失败，请重试"),
  });

  const saveSoulMutation = trpc.dashboard.saveSoul.useMutation();

  // ─── Step 1: Test Gateway ─────────────────────────────────────────────────

  const handleTestGateway = async () => {
    if (!gatewayUrl) {
      toast.error("请填写 Gateway URL");
      return;
    }
    setIsTestingGateway(true);
    setGatewayLogs([`→ 正在连接 ${gatewayUrl}...`]);

    await new Promise((r) => setTimeout(r, 800));
    setGatewayLogs((prev) => [...prev, "→ 发送 health check 请求..."]);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await fetch(`${gatewayUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      if (res?.ok) {
        setGatewayLogs((prev) => [
          ...prev,
          "✓ Gateway 连接成功",
          "✓ OpenClawd 服务正在运行",
        ]);
        toast.success("Gateway 连接成功！");
      } else {
        setGatewayLogs((prev) => [
          ...prev,
          "→ Gateway 未响应，保存配置继续...",
          "→ 稍后可在驾驶舱中验证连接状态",
        ]);
      }
    } catch {
      setGatewayLogs((prev) => [
        ...prev,
        "→ 无法直接访问 Gateway（跨域限制）",
        "→ 配置已保存，将在驾驶舱中验证连接",
      ]);
    }

    saveConfigMutation.mutate({
      gatewayUrl,
      ...(gatewayToken && { gatewayToken }),
    });

    setCompleted((prev) => Array.from(new Set([...prev, 1])));
    setIsTestingGateway(false);
  };

  // ─── Step 2: Save Model ───────────────────────────────────────────────────

  const handleSaveModel = () => {
    if (!selectedModel) {
      toast.error("请选择一个模型");
      return;
    }

    saveModelsMutation.mutate({ primary: selectedModel });
    setCompleted((prev) => Array.from(new Set([...prev, 2])));
    toast.success("模型配置已保存！");
    setCurrentStep(3);
  };

  // ─── Step 3: Save Soul ────────────────────────────────────────────────────

  const handleSaveSoul = () => {
    const personality = PERSONALITIES.find((p) => p.id === selectedPersonality);
    if (!personality) return;

    const soulMd =
      personality.id === "custom"
        ? `# ${botName}\n\n你是 ${botName}，一个由 OpenClawd 驱动的 AI 助手。\n\n请在灵魂编辑器中进一步定制你的人格。`
        : `# ${botName}\n\n你是 ${botName}，${personality.desc}。\n\n## 人格特征\n\n- 风格：${personality.vibe}\n- 类型：${personality.creature}\n\n## 行为准则\n\n1. 始终保持你的人格特征\n2. 用中文回复（除非用户使用其他语言）\n3. 简洁清晰，避免冗余\n`;

    saveConfigMutation.mutate({
      botName,
      botEmoji: personality.emoji,
      botVibe: personality.vibe,
      botCreature: personality.creature,
    });

    saveSoulMutation.mutate({ soulMd });

    setCompleted((prev) => Array.from(new Set([...prev, 3])));
    toast.success("灵魂注入成功！正在进入驾驶舱...");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const isStepCompleted = (step: number) => completed.includes(step);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "oklch(0.085 0.015 240)" }}
    >
      {/* 背景网格 */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4 text-xs"
            style={{
              background: "oklch(0.78 0.18 200 / 0.1)",
              border: "1px solid oklch(0.78 0.18 200 / 0.3)",
              color: "oklch(0.78 0.18 200)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Activity size={10} />
            SETUP WIZARD / 安装向导
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            配置你的{" "}
            <span
              style={{
                color: "oklch(0.78 0.18 200)",
                textShadow: "0 0 20px oklch(0.78 0.18 200 / 0.5)",
              }}
            >
              ClawDBot
            </span>
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.52 0.05 215)" }}>
            三步完成配置，让 AI 驾驶舱就绪
          </p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = isStepCompleted(step.id);
            return (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  onClick={() => (isDone || isActive ? setCurrentStep(step.id) : null)}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm transition-all duration-150"
                  style={{
                    background: isActive
                      ? `${step.color}/0.15`
                      : isDone
                      ? "oklch(0.82 0.22 140 / 0.08)"
                      : "oklch(0.11 0.016 236)",
                    border: `1px solid ${
                      isActive
                        ? `${step.color}/0.5`
                        : isDone
                        ? "oklch(0.82 0.22 140 / 0.3)"
                        : "oklch(0.18 0.025 235)"
                    }`,
                  }}
                >
                  {isDone ? (
                    <Check size={14} style={{ color: "oklch(0.82 0.22 140)" }} />
                  ) : (
                    <Icon
                      size={14}
                      style={{ color: isActive ? step.color : "oklch(0.45 0.04 220)" }}
                    />
                  )}
                  <span
                    className="text-xs"
                    style={{
                      color: isActive
                        ? step.color
                        : isDone
                        ? "oklch(0.82 0.22 140)"
                        : "oklch(0.45 0.04 220)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight size={14} style={{ color: "oklch(0.28 0.03 230)" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* 步骤内容卡片 */}
        <div
          className="rounded-sm p-6"
          style={{
            background: "oklch(0.10 0.015 238)",
            border: "1px solid oklch(0.18 0.025 235)",
          }}
        >
          {/* ─── Step 1: Gateway ─────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <div
                  className="text-xs mb-1"
                  style={{
                    color: "oklch(0.78 0.18 200)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  STEP 01 / CONNECT GATEWAY
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "oklch(0.92 0.02 210)",
                  }}
                >
                  连接 OpenClawd Gateway
                </h2>
                <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.05 215)" }}>
                  填写你本地运行的 OpenClawd Gateway 地址和访问令牌
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    className="text-xs block mb-1.5"
                    style={{
                      color: "oklch(0.52 0.05 215)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    GATEWAY_URL
                  </label>
                  <input
                    type="text"
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="w-full px-3 py-2.5 text-sm rounded-sm outline-none"
                    style={{
                      background: "oklch(0.08 0.012 238)",
                      border: "1px solid oklch(0.22 0.03 230)",
                      color: "oklch(0.88 0.02 210)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-xs block mb-1.5"
                    style={{
                      color: "oklch(0.52 0.05 215)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    GATEWAY_TOKEN{" "}
                    <span style={{ color: "oklch(0.45 0.04 220)" }}>(可选)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={gatewayToken}
                      onChange={(e) => setGatewayToken(e.target.value)}
                      placeholder="your-secret-token"
                      className="w-full pr-10 pl-3 py-2.5 text-sm rounded-sm outline-none"
                      style={{
                        background: "oklch(0.08 0.012 238)",
                        border: "1px solid oklch(0.22 0.03 230)",
                        color: "oklch(0.88 0.02 210)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.45 0.04 220)" }}
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <TerminalLog lines={gatewayLogs} />

              <div
                className="flex items-center gap-2 text-xs p-3 rounded-sm"
                style={{
                  background: "oklch(0.82 0.22 140 / 0.05)",
                  border: "1px solid oklch(0.82 0.22 140 / 0.15)",
                  color: "oklch(0.52 0.05 215)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Shield size={11} style={{ color: "oklch(0.82 0.22 140)" }} />
                Token 仅存储在本地数据库，不会上传到任何第三方服务
              </div>

              <div className="flex items-center justify-between">
                <Link href="/">
                  <button
                    className="text-sm transition-colors"
                    style={{
                      color: "oklch(0.45 0.04 220)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    返回首页
                  </button>
                </Link>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTestGateway}
                    disabled={isTestingGateway}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105 disabled:opacity-50"
                    style={{
                      background: "oklch(0.78 0.18 200 / 0.15)",
                      border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                      color: "oklch(0.78 0.18 200)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {isTestingGateway ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Terminal size={14} />
                    )}
                    测试连接
                  </button>
                  {isStepCompleted(1) && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105"
                      style={{
                        background: "oklch(0.82 0.22 140 / 0.15)",
                        border: "1px solid oklch(0.82 0.22 140 / 0.5)",
                        color: "oklch(0.82 0.22 140)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      下一步
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: Model ───────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <div
                  className="text-xs mb-1"
                  style={{
                    color: "oklch(0.82 0.22 140)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  STEP 02 / CONFIGURE MODEL
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "oklch(0.92 0.02 210)",
                  }}
                >
                  选择 AI 模型
                </h2>
                <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.05 215)" }}>
                  选择 ClawDBot 的主要对话模型，并填写对应的 API Key
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {QUICK_MODELS.map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className="flex items-center gap-3 p-3 rounded-sm text-left transition-all duration-150"
                      style={{
                        background: isSelected
                          ? "oklch(0.82 0.22 140 / 0.08)"
                          : "oklch(0.08 0.012 238)",
                        border: `1px solid ${
                          isSelected
                            ? "oklch(0.82 0.22 140 / 0.4)"
                            : "oklch(0.18 0.025 235)"
                        }`,
                      }}
                    >
                      <span className="text-xl">{model.emoji}</span>
                      <span
                        className="text-sm flex-1"
                        style={{
                          color: isSelected
                            ? "oklch(0.88 0.02 210)"
                            : "oklch(0.65 0.04 215)",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {model.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color: "oklch(0.38 0.04 220)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {model.provider}
                      </span>
                      {isSelected && (
                        <Check size={14} style={{ color: "oklch(0.82 0.22 140)" }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  className="text-xs block mb-1.5"
                  style={{
                    color: "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  API KEY{" "}
                  <span style={{ color: "oklch(0.45 0.04 220)" }}>(用于调用所选模型)</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      selectedModel.startsWith("anthropic")
                        ? "sk-ant-..."
                        : selectedModel.startsWith("openai")
                        ? "sk-..."
                        : selectedModel.startsWith("google")
                        ? "AIza..."
                        : "your-api-key"
                    }
                    className="w-full pr-10 pl-3 py-2.5 text-sm rounded-sm outline-none"
                    style={{
                      background: "oklch(0.08 0.012 238)",
                      border: "1px solid oklch(0.22 0.03 230)",
                      color: "oklch(0.88 0.02 210)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.45 0.04 220)" }}
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm transition-colors"
                  style={{
                    color: "oklch(0.45 0.04 220)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  上一步
                </button>
                <button
                  onClick={handleSaveModel}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150 hover:scale-105"
                  style={{
                    background: "oklch(0.82 0.22 140 / 0.15)",
                    border: "1px solid oklch(0.82 0.22 140 / 0.5)",
                    color: "oklch(0.82 0.22 140)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Cpu size={14} />
                  保存并继续
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Soul ────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <div
                  className="text-xs mb-1"
                  style={{
                    color: "oklch(0.72 0.18 280)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  STEP 03 / INJECT SOUL
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: "oklch(0.92 0.02 210)",
                  }}
                >
                  注入灵魂
                </h2>
                <p className="text-sm mt-1" style={{ color: "oklch(0.52 0.05 215)" }}>
                  给你的 Bot 起个名字，选择一个人格模板
                </p>
              </div>

              <div>
                <label
                  className="text-xs block mb-1.5"
                  style={{
                    color: "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  BOT_NAME
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="ClawDBot"
                  className="w-full px-3 py-2.5 text-sm rounded-sm outline-none"
                  style={{
                    background: "oklch(0.08 0.012 238)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PERSONALITIES.map((p) => {
                  const isSelected = selectedPersonality === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersonality(p.id)}
                      className="p-3 rounded-sm text-left transition-all duration-150"
                      style={{
                        background: isSelected
                          ? `${p.color}/0.1`
                          : "oklch(0.08 0.012 238)",
                        border: `1px solid ${
                          isSelected ? `${p.color}/0.4` : "oklch(0.18 0.025 235)"
                        }`,
                      }}
                    >
                      <div className="text-xl mb-1">{p.emoji}</div>
                      <div
                        className="text-sm font-medium mb-0.5"
                        style={{
                          color: isSelected ? p.color : "oklch(0.72 0.04 215)",
                          fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                      >
                        {p.name}
                      </div>
                      <div className="text-xs" style={{ color: "oklch(0.45 0.04 220)" }}>
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm transition-colors"
                  style={{
                    color: "oklch(0.45 0.04 220)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  上一步
                </button>
                <button
                  onClick={handleSaveSoul}
                  disabled={saveConfigMutation.isPending || saveSoulMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-sm transition-all duration-150 hover:scale-105 disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.18 280 / 0.15))",
                    border: "1px solid oklch(0.72 0.18 280 / 0.5)",
                    color: "oklch(0.72 0.18 280)",
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: "0 0 20px oklch(0.72 0.18 280 / 0.15)",
                  }}
                >
                  {saveConfigMutation.isPending || saveSoulMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  注入灵魂，进入驾驶舱
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          已有配置？
          <Link href="/dashboard">
            <span
              className="ml-1 cursor-pointer hover:underline"
              style={{ color: "oklch(0.78 0.18 200)" }}
            >
              直接进入驾驶舱 →
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
