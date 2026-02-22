/*
 * iClawd Home - 产品落地页
 * 
 * 功能：产品介绍、核心功能展示、路线图、CTA
 * 风格：工业终端，英雄区大图，功能卡片，暗黑科技
 */

import { Link } from "wouter";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Brain,
  Zap,
  Shield,
  ChevronRight,
  Activity,
  Terminal,
  CheckCircle,
  ArrowRight,
  Github,
  Star,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "机甲驾驶舱",
    subtitle: "COCKPIT",
    desc: "实时心跳监控、Token 消耗追踪、API 余额预警。一键重启，掌控全局。",
    color: "oklch(0.78 0.18 200)",
    gradient: "from-cyan-500/10 to-transparent",
  },
  {
    icon: Brain,
    title: "灵魂与记忆",
    subtitle: "SOUL & MEMORY",
    desc: "性格标签化配置，告别 JSON 地狱。记忆卡片可视化，随时增删改查。",
    color: "oklch(0.72 0.18 280)",
    gradient: "from-purple-500/10 to-transparent",
  },
  {
    icon: Zap,
    title: "技能商店",
    subtitle: "SKILL GALLERY",
    desc: "像安装 App 一样扩展 AI 能力。搜索、绘图、代码执行，一键安装配置。",
    color: "oklch(0.82 0.22 140)",
    gradient: "from-green-500/10 to-transparent",
  },
  {
    icon: Shield,
    title: "安全第一",
    subtitle: "LOCAL FIRST",
    desc: "所有 API Key 本地加密存储，iClawd 绝不上传任何敏感信息。",
    color: "oklch(0.78 0.18 65)",
    gradient: "from-amber-500/10 to-transparent",
  },
];

const roadmapItems = [
  {
    version: "MVP",
    label: "最小可行性产品",
    status: "current",
    items: ["可视化 JSON 读写", "模型切换", "在线状态监控"],
  },
  {
    version: "V1.5",
    label: "体验升级",
    status: "upcoming",
    items: ["Skill 商店", "一键安装包", "Electron 桌面应用"],
  },
  {
    version: "V2.0",
    label: "深度定制",
    status: "future",
    items: ["完整灵魂编辑器", "多 Bot 管理", "记忆图谱"],
  },
];

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);
  return <>{displayed}<span className="opacity-70">|</span></>;
}

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.085 0.015 240)" }}
    >
      {/* 导航栏 */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: "oklch(0.085 0.015 240 / 0.9)",
          borderBottom: "1px solid oklch(0.22 0.03 230)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://private-us-east-1.manuscdn.com/sessionFile/IKlXMo9WTJl7E2oJy3drln/sandbox/Na3chyG3qQlQjxRaJCPz1U_1771759105259_na1fn_aWNsYXdkLWxvZ28taWNvbg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUtsWE1vOVdUSmw3RTJvSnkzZHJsbi9zYW5kYm94L05hM2NoeUczcVFsUWp4UmFKQ1B6MVVfMTc3MTc1OTEwNTI1OV9uYTFmbl9hV05zWVhka0xXeHZaMjh0YVdOdmJnLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=hJaF33rLZbLs5mkeVUbStxC-FTcZxu8g3cTPrJUVW-0MxYHeFi3VouQ~Flf8PzVb3KxJTvnIP~eLMTAsBppdZ7~EhCmW3EZlEq7KZm9k9MEt2TSEtnqXTWAW307YdKOcp9mvEqmz9lCVVHiE-WjpKkdh4XvvsUdBjJEYxHeNhnp8QfhOVh7-mdT8yPj1xAvkDZBIzZ0~FonPdBtVPhQliAhszHoda2sKqsY8eEUy7iQrTYdnO~DjGRuHqT-5Vq6q84smVWxBlogxf3Ml8yma~4sdZiL6emUnZ~MlnEvXdVRXt-i8mJg6d7OAotuNymFgSJDk0ErdQrS1RsgQy8AhAg__"
            alt="iClawd"
            className="w-7 h-7 object-contain"
          />
          <span
            className="text-lg font-bold neon-text"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            iClawd
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-sm"
            style={{
              background: "oklch(0.78 0.18 65 / 0.15)",
              border: "1px solid oklch(0.78 0.18 65 / 0.3)",
              color: "oklch(0.78 0.18 65)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            alpha
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <button
              className="text-sm transition-colors"
              style={{ color: "oklch(0.52 0.05 215)" }}
            >
              驾驶舱
            </button>
          </Link>
          <Link href="/setup">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150"
              style={{
                background: "oklch(0.78 0.18 200 / 0.15)",
                border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              快速开始
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* 英雄区 */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ paddingTop: "80px" }}
      >
        {/* 背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("https://private-us-east-1.manuscdn.com/sessionFile/IKlXMo9WTJl7E2oJy3drln/sandbox/Na3chyG3qQlQjxRaJCPz1U-img-1_1771759087000_na1fn_aWNsYXdkLWhlcm8tYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUtsWE1vOVdUSmw3RTJvSnkzZHJsbi9zYW5kYm94L05hM2NoeUczcVFsUWp4UmFKQ1B6MVUtaW1nLTFfMTc3MTc1OTA4NzAwMF9uYTFmbl9hV05zWVhka0xXaGxjbTh0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=qVQ5qwedx0aMXHfVX1nKcZLDbwoI-hLc2jA0BnI63aA3ie5ypgma8mjLN4LaEOgd7Vxg9LBkwHJS9OIt86HqsbhPHR2NQcOOZkuWLvtq8Xqfeg8dHmC0gN9Mij0rgAUkqQHqkZkOJbhuhgUh9iE1GWPaKaQdFreXA-T9EMaqig7GdNPIAsDLw5E7gUlna-VQOowBVHkYguXOjz1N1fxZH0VENSQRQ5rDdGnzYaWrsMWlFngeEZ335JyYZkOrTS3TwfmKIlI2UVAol7UdRYh520rVi-vy9JYicR0tWIh1uQ0Vq7L-o9EpoXyW2qIg8uyajgNCU4-Munae64rxB4Xbtw__")`,
            opacity: 0.35,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, oklch(0.085 0.015 240 / 0.95) 40%, oklch(0.085 0.015 240 / 0.4) 100%)",
          }}
        />

        {/* 网格背景 */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* 内容 */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">
          <div className="max-w-2xl">
            {/* 标签 */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-6 text-xs"
              style={{
                background: "oklch(0.82 0.22 140 / 0.1)",
                border: "1px solid oklch(0.82 0.22 140 / 0.3)",
                color: "oklch(0.82 0.22 140)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Activity size={10} />
              AI 时代的机甲驾驶舱
            </div>

            {/* 主标题 */}
            <h1
              className="text-5xl font-bold leading-tight mb-4"
              style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.95 0.02 210)" }}
            >
              <span className="neon-text">iClawd</span>
              <br />
              <span className="text-3xl" style={{ color: "oklch(0.75 0.04 210)" }}>
                <TypewriterText text="让每个人都能驾驭" delay={600} />
              </span>
              <br />
              <span className="text-3xl" style={{ color: "oklch(0.75 0.04 210)" }}>
                自己的数字生命
              </span>
            </h1>

            {/* 副标题 */}
            <p
              className="text-base mb-8 leading-relaxed"
              style={{ color: "oklch(0.58 0.05 215)" }}
            >
              ClawDBot 的图形化管理界面。告别 JSON 配置地狱，用滑块、开关和卡片驾驭你的 AI Agent。
            </p>

            {/* CTA 按钮 */}
            <div className="flex items-center gap-4">
              <Link href="/setup">
                <button
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.18 280 / 0.15))",
                    border: "1px solid oklch(0.78 0.18 200 / 0.6)",
                    color: "oklch(0.78 0.18 200)",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                    boxShadow: "0 0 20px oklch(0.78 0.18 200 / 0.2)",
                  }}
                >
                  <Terminal size={16} />
                  立即开始配置
                  <ArrowRight size={14} />
                </button>
              </Link>
              <Link href="/dashboard">
                <button
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all duration-150"
                  style={{
                    background: "transparent",
                    border: "1px solid oklch(0.28 0.03 230)",
                    color: "oklch(0.52 0.05 215)",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  查看演示
                  <ChevronRight size={14} />
                </button>
              </Link>
            </div>

            {/* 统计数据 */}
            <div className="flex items-center gap-8 mt-10 pt-8" style={{ borderTop: "1px solid oklch(0.22 0.03 230)" }}>
              {[
                { label: "开源免费", value: "100%", color: "oklch(0.82 0.22 140)" },
                { label: "本地存储", value: "零上传", color: "oklch(0.78 0.18 200)" },
                { label: "支持模型", value: "10+", color: "oklch(0.72 0.18 280)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-xl font-bold counter-value"
                    style={{ color: stat.color, fontFamily: "'Space Mono', monospace" }}
                  >
                    {statsVisible ? stat.value : "---"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 220)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 功能特性区 */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs px-3 py-1.5 rounded-sm mb-4"
              style={{
                background: "oklch(0.78 0.18 200 / 0.08)",
                border: "1px solid oklch(0.78 0.18 200 / 0.2)",
                color: "oklch(0.78 0.18 200)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              CORE MODULES
            </div>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
            >
              四大核心模块
            </h2>
            <p className="text-sm mt-3" style={{ color: "oklch(0.52 0.05 215)" }}>
              从监控到定制，全面掌控你的 AI Agent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="panel-card p-6 fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${feature.color}/0.1`,
                        border: `1px solid ${feature.color}/0.3`,
                      }}
                    >
                      <Icon size={22} style={{ color: feature.color }} />
                    </div>
                    <div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: feature.color, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {feature.subtitle}
                      </div>
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.04 215)" }}>
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 路线图区 */}
      <section
        className="py-20 px-8"
        style={{ borderTop: "1px solid oklch(0.15 0.02 235)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-block text-xs px-3 py-1.5 rounded-sm mb-4"
              style={{
                background: "oklch(0.72 0.18 280 / 0.08)",
                border: "1px solid oklch(0.72 0.18 280 / 0.2)",
                color: "oklch(0.72 0.18 280)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ROADMAP
            </div>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
            >
              产品路线图
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmapItems.map((item, index) => (
              <div
                key={item.version}
                className="panel-card p-5 fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  borderColor: item.status === "current" ? "oklch(0.82 0.22 140 / 0.4)" :
                    item.status === "upcoming" ? "oklch(0.78 0.18 200 / 0.3)" :
                      "oklch(0.22 0.03 230)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: item.status === "current" ? "oklch(0.82 0.22 140)" :
                        item.status === "upcoming" ? "oklch(0.78 0.18 200)" :
                          "oklch(0.52 0.05 215)",
                    }}
                  >
                    {item.version}
                  </span>
                  <span
                    className="tag-chip text-xs"
                    style={{
                      borderColor: item.status === "current" ? "oklch(0.82 0.22 140 / 0.4)" :
                        item.status === "upcoming" ? "oklch(0.78 0.18 200 / 0.4)" :
                          "oklch(0.38 0.04 220 / 0.4)",
                      color: item.status === "current" ? "oklch(0.82 0.22 140)" :
                        item.status === "upcoming" ? "oklch(0.78 0.18 200)" :
                          "oklch(0.38 0.04 220)",
                    }}
                  >
                    {item.status === "current" ? "进行中" : item.status === "upcoming" ? "计划中" : "未来"}
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "oklch(0.52 0.05 215)" }}>
                  {item.label}
                </p>
                <div className="space-y-2">
                  {item.items.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.65 0.04 215)" }}>
                      <CheckCircle
                        size={12}
                        style={{
                          color: item.status === "current" ? "oklch(0.82 0.22 140)" :
                            item.status === "upcoming" ? "oklch(0.78 0.18 200 / 0.5)" :
                              "oklch(0.38 0.04 220)",
                        }}
                      />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 区 */}
      <section
        className="py-20 px-8 relative overflow-hidden"
        style={{ borderTop: "1px solid oklch(0.15 0.02 235)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url("https://private-us-east-1.manuscdn.com/sessionFile/IKlXMo9WTJl7E2oJy3drln/sandbox/Na3chyG3qQlQjxRaJCPz1U-img-2_1771759102000_na1fn_aWNsYXdkLXNvdWwtYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUtsWE1vOVdUSmw3RTJvSnkzZHJsbi9zYW5kYm94L05hM2NoeUczcVFsUWp4UmFKQ1B6MVUtaW1nLTJfMTc3MTc1OTEwMjAwMF9uYTFmbl9hV05zWVhka0xYTnZkV3d0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=S0SG9uOJDxcnBga0XYf-hjhQkbHSyam4AA8pRbM26Tky-m3wi8wVWwl7eSAKjWgOdxkpKGV~cYr9FVM4AHhqnVitY6fA5kS4XmGPirvKqzRS~5TPFVhTcd7Bxdos1njUx82x79zGs7NivRFMqW2T1w-A78BtLBd540HHS13m4p7R9MZC~09Jp6CVPj8vot6cuEYVsiiPfDirLBjrjfq6FIb7kcl8fMfN8yJ2N5Q5Zo13zwt9ItnQVHSnpxuew-03FAqDzWbLz67IG0iflvNMChOXO2ApDuvm9Q4e~uwLHkxUg~9DLdVH~hZzs0XkoXobtstCyx4fR72-i~NS0mZGxQ__")`,
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            准备好驾驭你的
            <span className="neon-text"> AI </span>
            了吗？
          </h2>
          <p className="text-sm mb-8" style={{ color: "oklch(0.52 0.05 215)" }}>
            三步完成配置，立即开始你的 AI 驾驶舱之旅
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/setup">
              <button
                className="flex items-center gap-2 px-8 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.2), oklch(0.72 0.18 280 / 0.15))",
                  border: "1px solid oklch(0.78 0.18 200 / 0.6)",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 30px oklch(0.78 0.18 200 / 0.2)",
                }}
              >
                <Terminal size={16} />
                开始配置向导
              </button>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 text-sm rounded-sm transition-all duration-150"
              style={{
                background: "transparent",
                border: "1px solid oklch(0.28 0.03 230)",
                color: "oklch(0.52 0.05 215)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Github size={14} />
              GitHub
              <Star size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer
        className="py-8 px-8 text-center"
        style={{ borderTop: "1px solid oklch(0.15 0.02 235)" }}
      >
        <p
          className="text-xs"
          style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          iClawd v0.1.0-alpha · MIT License · 数据本地存储，隐私优先
        </p>
      </footer>
    </div>
  );
}
