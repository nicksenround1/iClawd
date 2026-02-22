# iClawd — AI 时代的机甲驾驶舱

> ClawDBot 的可视化管理面板。告别 JSON 配置地狱，用滑块、开关和卡片驾驭你的 AI Agent。

**iClawd** 是 [OpenClawd](https://openclaw.ai) 的图形化控制面板，专为不熟悉代码的用户设计。安装 OpenClawd 后，通过 iClawd 可以：

- 🤖 **配对 ClawDBot** — 填写 Gateway URL 和 Token，一键连接
- 🧠 **管理模型** — 可视化切换 GPT-4o / Claude / Gemini 等，安全存储 API Key
- ⚡ **安装技能** — 像 App 商店一样安装搜索、绘图、代码执行等 Skills
- 💾 **编辑灵魂** — 用性格标签配置 Bot 人格，管理长期记忆卡片
- 📊 **驾驶舱监控** — 实时心跳、Token 消耗图表、活动日志

---

## 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- 本地运行的 [OpenClawd Gateway](https://openclaw.ai)（默认端口 `18789`）

### 一键启动

```bash
git clone https://github.com/nicksenround1/iClawd.git
cd iClawd
cp .env.example .env
pnpm install
pnpm dev
```

浏览器访问 **http://localhost:3000**，即可看到 iClawd 界面。

> **为什么必须本地运行？**
> iClawd 需要直接访问你本机的 OpenClawd Gateway（`localhost:18789`）。
> 浏览器安全策略不允许云端网站访问本地服务，因此 iClawd 必须在本机运行。

---

## 环境变量

复制 `.env.example` 为 `.env`，根据需要修改：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | iClawd 服务端口 | `3000` |
| `DATABASE_URL` | 数据库连接（可选，用于持久化配置） | 内置 SQLite |

所有 **Bot Token 和 API Key** 均存储在本地，**不会上传到任何第三方服务**。

---

## 项目结构

```
iClawd/
├── client/          # React 前端（Vite + Tailwind）
│   └── src/
│       ├── pages/   # 各功能页面
│       └── components/
├── server/          # Express + tRPC 后端
│   └── routers/     # API 路由
├── drizzle/         # 数据库 Schema
└── README.md
```

---

## 技术栈

- **前端**: React 19 + Vite + Tailwind CSS 4 + Recharts
- **后端**: Express + tRPC + Drizzle ORM
- **数据库**: MySQL / TiDB（可配置）
- **测试**: Vitest（22 个测试全部通过）

---

## 路线图

| 阶段 | 目标 | 状态 |
|------|------|------|
| MVP | Gateway 连接、模型管理、在线监控 | ✅ 进行中 |
| V1.5 | openclawd.json 导出/导入、实时日志 | 🔜 计划中 |
| V2.0 | 多 Bot 管理、记忆图谱、Electron 桌面版 | 🔮 未来 |

---

## License

MIT © [OpenClawd](https://openclaw.ai)
