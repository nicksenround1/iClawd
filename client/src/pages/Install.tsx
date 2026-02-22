/**
 * iClawd Install - 本地安装指南页面
 *
 * 功能：三平台安装步骤、一键脚本下载、Docker 方案、常见问题
 * 设计：工业终端风格，标签页切换平台
 */

import { useState } from "react";
import { Link } from "wouter";
import {
  Terminal,
  Copy,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Monitor,
  Apple,
  Package,
  AlertTriangle,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "mac" | "windows" | "linux" | "docker";

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("已复制到剪贴板");
    });
  };

  return (
    <div
      className="relative rounded-sm overflow-hidden my-3"
      style={{
        background: "oklch(0.06 0.012 240)",
        border: "1px solid oklch(0.22 0.03 230)",
      }}
    >
      {label && (
        <div
          className="px-4 py-1.5 text-xs border-b flex items-center justify-between"
          style={{
            borderColor: "oklch(0.22 0.03 230)",
            background: "oklch(0.08 0.014 238)",
            color: "oklch(0.52 0.05 215)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>{label}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: "oklch(0.78 0.18 200)" }}
          >
            <Copy size={11} />
            复制
          </button>
        </div>
      )}
      <pre
        className="px-4 py-3 text-sm overflow-x-auto"
        style={{
          color: "oklch(0.82 0.22 140)",
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.7,
        }}
      >
        {code}
      </pre>
      {!label && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs rounded-sm transition-colors"
          style={{
            background: "oklch(0.12 0.018 238)",
            border: "1px solid oklch(0.22 0.03 230)",
            color: "oklch(0.52 0.05 215)",
          }}
        >
          <Copy size={10} />
        </button>
      )}
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

function Step({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0">
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold"
          style={{
            background: "oklch(0.78 0.18 200 / 0.12)",
            border: "1px solid oklch(0.78 0.18 200 / 0.4)",
            color: "oklch(0.78 0.18 200)",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {num}
        </div>
        {/* 连接线 */}
        <div
          className="w-px mx-auto mt-1"
          style={{
            height: "calc(100% - 2rem)",
            background: "oklch(0.22 0.03 230)",
          }}
        />
      </div>
      <div className="flex-1 pb-2">
        <h3
          className="text-base font-bold mb-3"
          style={{
            fontFamily: "'Space Mono', monospace",
            color: "oklch(0.92 0.02 210)",
          }}
        >
          {title}
        </h3>
        <div style={{ color: "oklch(0.65 0.04 215)" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Platform Tabs ────────────────────────────────────────────────────────────

const platforms: { id: Platform; label: string; icon: React.ElementType }[] = [
  { id: "mac", label: "macOS", icon: Apple },
  { id: "windows", label: "Windows", icon: Monitor },
  { id: "linux", label: "Linux", icon: Terminal },
  { id: "docker", label: "Docker", icon: Package },
];

// ─── Platform Content ─────────────────────────────────────────────────────────

function MacContent() {
  return (
    <div>
      <Step num={1} title="安装 Node.js（如已安装可跳过）">
        <p className="text-sm mb-2">推荐使用 Homebrew 安装 Node.js 22+：</p>
        <CodeBlock label="Terminal" code={`# 安装 Homebrew（如未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node`} />
        <p className="text-sm">或直接从 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "oklch(0.78 0.18 200)" }}>nodejs.org</a> 下载安装包。</p>
      </Step>

      <Step num={2} title="下载 iClawd">
        <p className="text-sm mb-2">克隆仓库到本地：</p>
        <CodeBlock label="Terminal" code={`git clone https://github.com/nicksenround1/iClawd.git
cd iclawd`} />
      </Step>

      <Step num={3} title="安装依赖并启动">
        <p className="text-sm mb-2">一键安装并启动：</p>
        <CodeBlock label="Terminal" code={`# 安装依赖
npm install

# 启动 iClawd（本地模式）
npm run start:local`} />
        <div
          className="flex items-start gap-2 p-3 rounded-sm mt-3 text-sm"
          style={{
            background: "oklch(0.82 0.22 140 / 0.08)",
            border: "1px solid oklch(0.82 0.22 140 / 0.25)",
            color: "oklch(0.82 0.22 140)",
          }}
        >
          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>启动成功后，浏览器访问 <strong>http://localhost:3000</strong> 即可使用 iClawd，可直接连接本机的 OpenClawd Gateway。</span>
        </div>
      </Step>

      <Step num={4} title="配对 OpenClawd Gateway">
        <p className="text-sm mb-2">打开 iClawd 后，进入配置向导，填写：</p>
        <CodeBlock code={`Gateway URL:   http://localhost:18789
Gateway Token: （你的 openclawd 访问令牌，可选）`} />
        <p className="text-sm">配置完成后即可在驾驶舱看到实时心跳状态。</p>
      </Step>
    </div>
  );
}

function WindowsContent() {
  return (
    <div>
      <Step num={1} title="安装 Node.js（如已安装可跳过）">
        <p className="text-sm mb-2">从官网下载 Windows 安装包（推荐 LTS 版本）：</p>
        <a
          href="https://nodejs.org/en/download"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-sm mb-3"
          style={{
            background: "oklch(0.78 0.18 200 / 0.1)",
            border: "1px solid oklch(0.78 0.18 200 / 0.3)",
            color: "oklch(0.78 0.18 200)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Download size={14} />
          下载 Node.js for Windows
          <ExternalLink size={12} />
        </a>
        <p className="text-sm">安装完成后，打开 PowerShell 验证：</p>
        <CodeBlock label="PowerShell" code={`node --version   # 应显示 v22.x.x 或更高`} />
      </Step>

      <Step num={2} title="下载 iClawd">
        <p className="text-sm mb-2">在 PowerShell 中执行：</p>
        <CodeBlock label="PowerShell" code={`git clone https://github.com/nicksenround1/iClawd.git
cd iclawd`} />
        <p className="text-sm">或直接从 GitHub 下载 ZIP 压缩包并解压。</p>
      </Step>

      <Step num={3} title="安装依赖并启动">
        <CodeBlock label="PowerShell" code={`# 安装依赖
npm install

# 启动 iClawd
npm run start:local`} />
        <div
          className="flex items-start gap-2 p-3 rounded-sm mt-3 text-sm"
          style={{
            background: "oklch(0.82 0.22 140 / 0.08)",
            border: "1px solid oklch(0.82 0.22 140 / 0.25)",
            color: "oklch(0.82 0.22 140)",
          }}
        >
          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>启动后访问 <strong>http://localhost:3000</strong>，Windows 防火墙可能弹出提示，选择"允许"即可。</span>
        </div>
      </Step>

      <Step num={4} title="配对 OpenClawd Gateway">
        <CodeBlock code={`Gateway URL:   http://localhost:18789
Gateway Token: （你的 openclawd 访问令牌，可选）`} />
      </Step>
    </div>
  );
}

function LinuxContent() {
  return (
    <div>
      <Step num={1} title="安装 Node.js 22+">
        <p className="text-sm mb-2">推荐使用 nvm 管理 Node.js 版本：</p>
        <CodeBlock label="Bash" code={`# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell
source ~/.bashrc

# 安装并使用 Node.js 22
nvm install 22
nvm use 22`} />
      </Step>

      <Step num={2} title="克隆并安装">
        <CodeBlock label="Bash" code={`git clone https://github.com/nicksenround1/iClawd.git
cd iclawd
npm install`} />
      </Step>

      <Step num={3} title="启动 iClawd">
        <p className="text-sm mb-2">前台运行（开发/测试）：</p>
        <CodeBlock label="Bash" code={`npm run start:local`} />
        <p className="text-sm mb-2 mt-3">后台常驻运行（推荐生产使用）：</p>
        <CodeBlock label="Bash" code={`# 使用 pm2 管理进程
npm install -g pm2
pm2 start "npm run start:local" --name iclawd
pm2 save
pm2 startup   # 设置开机自启`} />
        <div
          className="flex items-start gap-2 p-3 rounded-sm mt-3 text-sm"
          style={{
            background: "oklch(0.82 0.22 140 / 0.08)",
            border: "1px solid oklch(0.82 0.22 140 / 0.25)",
            color: "oklch(0.82 0.22 140)",
          }}
        >
          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>访问 <strong>http://localhost:3000</strong> 开始使用。</span>
        </div>
      </Step>

      <Step num={4} title="配对 OpenClawd Gateway">
        <CodeBlock code={`Gateway URL:   http://localhost:18789
Gateway Token: （你的 openclawd 访问令牌，可选）`} />
      </Step>
    </div>
  );
}

function DockerContent() {
  return (
    <div>
      <Step num={1} title="确保 Docker 已安装">
        <p className="text-sm mb-2">验证 Docker 版本：</p>
        <CodeBlock label="Terminal" code={`docker --version          # Docker 20.10+
docker compose version    # Docker Compose v2+`} />
      </Step>

      <Step num={2} title="创建 docker-compose.yml">
        <p className="text-sm mb-2">在任意目录创建以下文件：</p>
        <CodeBlock label="docker-compose.yml" code={`version: '3.8'

services:
  iclawd:
    image: ghcr.io/nicksenround1/iclawd:latest
    container_name: iclawd
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://iclawd:iclawd@db:3306/iclawd
    depends_on:
      - db
    restart: unless-stopped
    # 使用 host 网络模式可直接访问宿主机 localhost
    # network_mode: "host"  # 取消注释以访问宿主机 Gateway

  db:
    image: mysql:8.0
    container_name: iclawd-db
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: iclawd
      MYSQL_USER: iclawd
      MYSQL_PASSWORD: iclawd
    volumes:
      - iclawd-db:/var/lib/mysql
    restart: unless-stopped

volumes:
  iclawd-db:`} />
      </Step>

      <Step num={3} title="启动服务">
        <CodeBlock label="Terminal" code={`docker compose up -d

# 查看日志
docker compose logs -f iclawd`} />
        <div
          className="flex items-start gap-2 p-3 rounded-sm mt-3 text-sm"
          style={{
            background: "oklch(0.78 0.18 65 / 0.08)",
            border: "1px solid oklch(0.78 0.18 65 / 0.25)",
            color: "oklch(0.78 0.18 65)",
          }}
        >
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>Docker 容器默认无法访问宿主机的 localhost。如需连接本机 Gateway，请取消注释 <code>network_mode: "host"</code>（仅 Linux 支持），或使用 <code>host.docker.internal</code> 作为 Gateway 地址（macOS/Windows）。</span>
        </div>
      </Step>

      <Step num={4} title="配对 OpenClawd Gateway">
        <p className="text-sm mb-2">macOS/Windows Docker 用户使用特殊地址：</p>
        <CodeBlock code={`# macOS / Windows Docker Desktop
Gateway URL: http://host.docker.internal:18789

# Linux（需启用 host 网络模式）
Gateway URL: http://localhost:18789`} />
      </Step>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "为什么推荐本地安装而不是直接用网页版？",
    a: "网页版（云端部署）受浏览器安全策略限制，HTTPS 页面无法直接访问 HTTP 的 localhost 服务（Mixed Content 限制）。本地安装后，iClawd 运行在 http://localhost:3000，与 OpenClawd Gateway 同处本机，完全无跨域限制。",
  },
  {
    q: "iClawd 会上传我的 API Key 或配置吗？",
    a: "不会。本地安装模式下，所有数据（API Key、Bot Token、配置、记忆）均存储在你本机的数据库中，iClawd 不连接任何外部服务器，完全离线运行。",
  },
  {
    q: "OpenClawd Gateway 的默认端口是多少？",
    a: "OpenClawd Gateway 默认监听 18789 端口。如果你修改过配置，请在 iClawd 的安装向导中填写对应的端口号。",
  },
  {
    q: "如何更新 iClawd 到最新版本？",
    a: "进入 iClawd 目录，执行 git pull && npm install && npm run start:local 即可更新到最新版本。",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Install() {
  const [platform, setPlatform] = useState<Platform>("mac");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.085 0.015 240)" }}
    >
      {/* 导航栏 */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: "oklch(0.085 0.015 240 / 0.95)",
          borderBottom: "1px solid oklch(0.22 0.03 230)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link href="/">
          <button
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "oklch(0.52 0.05 215)" }}
          >
            <ArrowLeft size={14} />
            返回首页
          </button>
        </Link>
        <div
          className="text-sm font-bold"
          style={{
            fontFamily: "'Space Mono', monospace",
            color: "oklch(0.78 0.18 200)",
          }}
        >
          INSTALL GUIDE
        </div>
        <Link href="/dashboard">
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-sm"
            style={{
              background: "oklch(0.78 0.18 200 / 0.1)",
              border: "1px solid oklch(0.78 0.18 200 / 0.3)",
              color: "oklch(0.78 0.18 200)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            在线演示
            <ChevronRight size={12} />
          </button>
        </Link>
      </nav>

      {/* 主内容 */}
      <div className="max-w-3xl mx-auto px-8 pt-28 pb-20">
        {/* 标题区 */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4 text-xs"
            style={{
              background: "oklch(0.82 0.22 140 / 0.1)",
              border: "1px solid oklch(0.82 0.22 140 / 0.3)",
              color: "oklch(0.82 0.22 140)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Terminal size={10} />
            LOCAL DEPLOYMENT
          </div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{
              fontFamily: "'Space Mono', monospace",
              color: "oklch(0.95 0.02 210)",
            }}
          >
            本地安装指南
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.58 0.05 215)" }}>
            将 iClawd 安装到你的本机，与 OpenClawd Gateway 同处一台电脑，无任何跨域限制，数据完全本地存储。
          </p>
        </div>

        {/* 前置要求 */}
        <div
          className="p-4 rounded-sm mb-8"
          style={{
            background: "oklch(0.78 0.18 200 / 0.06)",
            border: "1px solid oklch(0.78 0.18 200 / 0.2)",
          }}
        >
          <div
            className="text-xs font-bold mb-2"
            style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            PREREQUISITES
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Node.js", version: "v22+", desc: "JavaScript 运行时" },
              { label: "OpenClawd", version: "已运行", desc: "本机 Gateway 服务" },
              { label: "Git", version: "任意版本", desc: "用于克隆仓库" },
            ].map((req) => (
              <div
                key={req.label}
                className="flex items-center gap-3 p-2 rounded-sm"
                style={{ background: "oklch(0.09 0.016 238)" }}
              >
                <CheckCircle size={14} style={{ color: "oklch(0.82 0.22 140)", flexShrink: 0 }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: "oklch(0.88 0.02 210)" }}>
                    {req.label} <span style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem" }}>{req.version}</span>
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.48 0.04 220)" }}>{req.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 平台选择 */}
        <div className="flex gap-2 mb-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all duration-150"
                style={{
                  background: platform === p.id ? "oklch(0.78 0.18 200 / 0.15)" : "transparent",
                  border: `1px solid ${platform === p.id ? "oklch(0.78 0.18 200 / 0.5)" : "oklch(0.22 0.03 230)"}`,
                  color: platform === p.id ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Icon size={14} />
                {p.label}
              </button>
            );
          })}
        </div>

        {/* 平台内容 */}
        <div
          className="p-6 rounded-sm mb-10"
          style={{
            background: "oklch(0.09 0.016 238)",
            border: "1px solid oklch(0.22 0.03 230)",
          }}
        >
          {platform === "mac" && <MacContent />}
          {platform === "windows" && <WindowsContent />}
          {platform === "linux" && <LinuxContent />}
          {platform === "docker" && <DockerContent />}
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <div
            className="text-xs font-bold mb-4"
            style={{ color: "oklch(0.78 0.18 200)", fontFamily: "'JetBrains Mono', monospace" }}
          >
            FAQ · 常见问题
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-sm overflow-hidden"
                style={{ border: "1px solid oklch(0.22 0.03 230)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors"
                  style={{
                    background: openFaq === i ? "oklch(0.78 0.18 200 / 0.06)" : "oklch(0.09 0.016 238)",
                    color: "oklch(0.82 0.02 210)",
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    size={14}
                    className="flex-shrink-0 transition-transform"
                    style={{
                      color: "oklch(0.52 0.05 215)",
                      transform: openFaq === i ? "rotate(90deg)" : "none",
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div
                    className="px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "oklch(0.085 0.015 240)",
                      color: "oklch(0.62 0.04 215)",
                      borderTop: "1px solid oklch(0.22 0.03 230)",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部 CTA */}
        <div
          className="p-6 rounded-sm text-center"
          style={{
            background: "oklch(0.09 0.016 238)",
            border: "1px solid oklch(0.22 0.03 230)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "oklch(0.58 0.05 215)" }}>
            安装完成后，访问 <code style={{ color: "oklch(0.82 0.22 140)", fontFamily: "'JetBrains Mono', monospace" }}>http://localhost:3000</code> 开始配置
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/setup">
              <button
                className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-sm transition-all duration-150"
                style={{
                  background: "oklch(0.78 0.18 200 / 0.15)",
                  border: "1px solid oklch(0.78 0.18 200 / 0.5)",
                  color: "oklch(0.78 0.18 200)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <Terminal size={14} />
                打开配置向导
                <ChevronRight size={12} />
              </button>
            </Link>
            <a
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-sm transition-all duration-150"
              style={{
                background: "transparent",
                border: "1px solid oklch(0.28 0.03 230)",
                color: "oklch(0.52 0.05 215)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              OpenClawd 文档
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
