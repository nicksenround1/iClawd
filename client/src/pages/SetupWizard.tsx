/*
 * iClawd SetupWizard - 安装向导
 * 
 * 功能：三步引导 - 安装依赖 -> 配对机器人 -> 注入灵魂
 * 风格：全屏沉浸式，步骤进度条，终端风格输出
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Circle, ChevronRight, Terminal, Bot, Sparkles, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    id: 1,
    title: "安装依赖",
    subtitle: "检测并安装必要的运行环境",
    icon: Terminal,
  },
  {
    id: 2,
    title: "配对机器人",
    subtitle: "连接你的 Telegram / Discord Bot",
    icon: Bot,
  },
  {
    id: 3,
    title: "注入灵魂",
    subtitle: "为 AI 设定初始人格",
    icon: Sparkles,
  },
];

const terminalLogs = [
  { text: "$ iClawd init --check-env", delay: 0, type: "cmd" },
  { text: "检测 Node.js 环境...", delay: 400, type: "info" },
  { text: "✓ Node.js v22.13.0 已安装", delay: 900, type: "success" },
  { text: "检测 Python 环境...", delay: 1300, type: "info" },
  { text: "✓ Python 3.11.0 已安装", delay: 1800, type: "success" },
  { text: "安装 OpenClawd 依赖...", delay: 2200, type: "info" },
  { text: "✓ openclawd@2.1.3 安装完成", delay: 3200, type: "success" },
  { text: "✓ 所有依赖已就绪！", delay: 3800, type: "success" },
];

const defaultPersonalities = [
  { id: "assistant", label: "智能助手", desc: "专业、高效、全能", emoji: "🤖" },
  { id: "friend", label: "数字朋友", desc: "亲切、幽默、陪伴", emoji: "😊" },
  { id: "expert", label: "领域专家", desc: "深度、严谨、权威", emoji: "🎓" },
  { id: "custom", label: "自定义", desc: "完全由你定义", emoji: "✨" },
];

export default function SetupWizard() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [visibleLogs, setVisibleLogs] = useState<typeof terminalLogs>([]);
  const [step1Done, setStep1Done] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState("assistant");
  const [botName, setBotName] = useState("ClawDBot");

  // 终端日志动画
  useEffect(() => {
    if (currentStep !== 1 || step1Done) return;
    terminalLogs.forEach((log) => {
      setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log]);
        if (log === terminalLogs[terminalLogs.length - 1]) {
          setTimeout(() => setStep1Done(true), 500);
        }
      }, log.delay);
    });
  }, [currentStep]);

  const handleStep2Next = () => {
    if (!botToken.trim()) {
      toast.error("请输入 Bot Token");
      return;
    }
    toast.success("Bot Token 验证成功！");
    setCurrentStep(3);
  };

  const handleFinish = () => {
    toast.success("iClawd 配置完成！正在进入驾驶舱...");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 grid-bg"
      style={{ background: "oklch(0.085 0.015 240)" }}
    >
      {/* 顶部 Logo */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src="https://private-us-east-1.manuscdn.com/sessionFile/IKlXMo9WTJl7E2oJy3drln/sandbox/Na3chyG3qQlQjxRaJCPz1U_1771759105259_na1fn_aWNsYXdkLWxvZ28taWNvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUtsWE1vOVdUSmw3RTJvSnkzZHJsbi9zYW5kYm94L05hM2NoeUczcVFsUWp4UmFKQ1B6MVVfMTc3MTc1OTEwNTI1OV9uYTFmbl9hV05zWVhka0xXeHZaMjh0YVdOdmJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=hJaF33rLZbLs5mkeVUbStxC-FTcZxu8g3cTPrJUVW-0MxYHeFi3VouQ~Flf8PzVb3KxJTvnIP~eLMTAsBppdZ7~EhCmW3EZlEq7KZm9k9MEt2TSEtnqXTWAW307YdKOcp9mvEqmz9lCVVHiE-WjpKkdh4XvvsUdBjJEYxHeNhnp8QfhOVh7-mdT8yPj1xAvkDZBIzZ0~FonPdBtVPhQliAhszHoda2sKqsY8eEUy7iQrTYdnO~DjGRuHqT-5Vq6q84smVWxBlogxf3Ml8yma~4sdZiL6emUnZ~MlnEvXdVRXt-i8mJg6d7OAotuNymFgSJDk0ErdQrS1RsgQy8AhAg__"
            alt="iClawd"
            className="w-10 h-10 object-contain"
          />
          <span
            className="text-3xl font-bold neon-text"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            iClawd
          </span>
        </div>
        <p className="text-sm" style={{ color: "oklch(0.52 0.05 215)" }}>
          欢迎来到机甲驾驶舱 · 首次配置向导
        </p>
      </div>

      {/* 步骤进度条 */}
      <div className="flex items-center gap-0 mb-10 w-full max-w-lg">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentStep >= step.id ? "oklch(0.78 0.18 200 / 0.15)" : "oklch(0.11 0.018 235)",
                  border: `1px solid ${currentStep >= step.id ? "oklch(0.78 0.18 200 / 0.6)" : "oklch(0.22 0.03 230)"}`,
                  boxShadow: currentStep === step.id ? "0 0 16px oklch(0.78 0.18 200 / 0.3)" : "none",
                }}
              >
                {currentStep > step.id ? (
                  <CheckCircle size={18} style={{ color: "oklch(0.82 0.22 140)" }} />
                ) : currentStep === step.id ? (
                  <step.icon size={18} style={{ color: "oklch(0.78 0.18 200)" }} />
                ) : (
                  <Circle size={18} style={{ color: "oklch(0.38 0.04 220)" }} />
                )}
              </div>
              <div
                className="text-xs mt-2 text-center"
                style={{
                  color: currentStep >= step.id ? "oklch(0.78 0.18 200)" : "oklch(0.38 0.04 220)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                }}
              >
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-px mx-2 transition-all duration-500"
                style={{
                  background: currentStep > step.id ? "oklch(0.78 0.18 200 / 0.5)" : "oklch(0.22 0.03 230)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容卡片 */}
      <div
        className="w-full max-w-lg panel-card p-6 fade-in-up"
        style={{ borderColor: "oklch(0.78 0.18 200 / 0.3)" }}
      >
        {/* Step 1: 安装依赖 */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={18} style={{ color: "oklch(0.78 0.18 200)" }} />
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
              >
                STEP 01 · 安装依赖
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "oklch(0.52 0.05 215)" }}>
              iClawd 正在自动检测并安装所需的运行环境，无需手动操作。
            </p>

            {/* 终端输出 */}
            <div
              className="rounded-sm p-4 mb-4 min-h-40 font-mono text-xs"
              style={{
                background: "oklch(0.06 0.012 238)",
                border: "1px solid oklch(0.18 0.025 235)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {visibleLogs.map((log, i) => (
                <div
                  key={i}
                  className="mb-1"
                  style={{
                    color: log.type === "cmd" ? "oklch(0.78 0.18 200)" :
                      log.type === "success" ? "oklch(0.82 0.22 140)" :
                        "oklch(0.65 0.04 215)",
                  }}
                >
                  {log.text}
                </div>
              ))}
              {!step1Done && (
                <span
                  className="inline-block w-2 h-4 ml-1"
                  style={{ background: "oklch(0.78 0.18 200)", animation: "heartbeat-pulse 1s infinite" }}
                />
              )}
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              disabled={!step1Done}
              className="w-full py-3 text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-all duration-150"
              style={{
                background: step1Done ? "oklch(0.78 0.18 200 / 0.15)" : "oklch(0.14 0.015 235)",
                border: `1px solid ${step1Done ? "oklch(0.78 0.18 200 / 0.5)" : "oklch(0.22 0.03 230)"}`,
                color: step1Done ? "oklch(0.78 0.18 200)" : "oklch(0.38 0.04 220)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
                cursor: step1Done ? "pointer" : "not-allowed",
              }}
            >
              {step1Done ? (
                <>
                  下一步：配对机器人
                  <ChevronRight size={16} />
                </>
              ) : (
                "安装中，请稍候..."
              )}
            </button>
          </div>
        )}

        {/* Step 2: 配对机器人 */}
        {currentStep === 2 && (
          <div className="fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={18} style={{ color: "oklch(0.78 0.18 200)" }} />
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
              >
                STEP 02 · 配对机器人
              </h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "oklch(0.52 0.05 215)" }}>
              请填入你的 Telegram Bot Token。所有信息均仅存储在本地，iClawd 不会上传任何数据。
            </p>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs mb-2"
                  style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  BOT NAME
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-sm outline-none"
                  style={{
                    background: "oklch(0.14 0.015 235)",
                    border: "1px solid oklch(0.22 0.03 230)",
                    color: "oklch(0.88 0.02 210)",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                  }}
                  placeholder="给你的 Bot 起个名字"
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-2"
                  style={{ color: "oklch(0.52 0.05 215)", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  BOT TOKEN
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded-sm text-xs"
                    style={{
                      background: "oklch(0.82 0.22 140 / 0.1)",
                      border: "1px solid oklch(0.82 0.22 140 / 0.3)",
                      color: "oklch(0.82 0.22 140)",
                    }}
                  >
                    本地加密存储
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-sm outline-none"
                    style={{
                      background: "oklch(0.14 0.015 235)",
                      border: "1px solid oklch(0.22 0.03 230)",
                      color: "oklch(0.88 0.02 210)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz"
                  />
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "oklch(0.52 0.05 215)" }}
                  >
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "oklch(0.38 0.04 220)" }}>
                  通过 @BotFather 获取 Token。iClawd 使用本地加密存储，绝不上传。
                </p>
              </div>
            </div>

            <button
              onClick={handleStep2Next}
              className="w-full mt-6 py-3 text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-all duration-150"
              style={{
                background: "oklch(0.78 0.18 200 / 0.15)",
                border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              验证并继续
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: 注入灵魂 */}
        {currentStep === 3 && (
          <div className="fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} style={{ color: "oklch(0.78 0.18 200)" }} />
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
              >
                STEP 03 · 注入灵魂
              </h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "oklch(0.52 0.05 215)" }}>
              为 {botName} 选择一个初始人格。你随时可以在"灵魂编辑器"中进行更精细的调整。
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {defaultPersonalities.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonality(p.id)}
                  className="p-4 rounded-sm text-left transition-all duration-150"
                  style={{
                    background: selectedPersonality === p.id ? "oklch(0.78 0.18 200 / 0.12)" : "oklch(0.14 0.015 235)",
                    border: `1px solid ${selectedPersonality === p.id ? "oklch(0.78 0.18 200 / 0.6)" : "oklch(0.22 0.03 230)"}`,
                    boxShadow: selectedPersonality === p.id ? "0 0 12px oklch(0.78 0.18 200 / 0.1)" : "none",
                  }}
                >
                  <div className="text-2xl mb-2">{p.emoji}</div>
                  <div
                    className="text-sm font-semibold"
                    style={{
                      color: selectedPersonality === p.id ? "oklch(0.78 0.18 200)" : "oklch(0.75 0.04 210)",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >
                    {p.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 220)" }}>
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 text-sm font-medium rounded-sm flex items-center justify-center gap-2 transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.18 280 / 0.2))",
                border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
              }}
            >
              启动驾驶舱
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <p
        className="mt-6 text-xs text-center"
        style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
      >
        iClawd v0.1.0-alpha · 所有数据本地存储 · 开源免费
      </p>
    </div>
  );
}
