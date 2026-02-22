# iClawd TODO

- [x] 首页落地页（产品介绍、路线图、CTA）
- [x] 机甲驾驶舱页面（模拟数据）
- [x] 灵魂编辑器页面
- [x] 技能商店页面
- [x] 安装向导页面
- [x] 工业终端暗黑科技风格设计
- [x] 升级项目为全栈（tRPC + 后端服务）
- [x] 恢复 Home.tsx 原有内容（升级冲突）
- [x] 后端：Bot 心跳检测 API（Telegram Bot API ping）
- [x] 后端：Token 消耗统计 API（OpenAI Usage API 代理）
- [x] 后端：Bot 配置存储（保存 Bot Token / API Key 到数据库）
- [x] 前端：驾驶舱接入真实心跳状态（轮询后端 API）
- [x] 前端：驾驶舱接入真实 Token 消耗图表（24h 历史数据）
- [x] 前端：设置页面（填写 Bot Token / OpenAI API Key，通过 saveConfig 接口保存）
- [x] 数据库 schema 更新（bot_configs + token_usage 表）
- [x] vitest 单元测试（13 个测试全部通过）

## OpenClaw 对齐重构（v2）

- [x] 调研 OpenClaw.ai 产品架构、RWA JSON 结构、Gateway API
- [x] 数据库 schema 重构（openclaw_configs + memory_entries 表）
- [x] 后端 dashboard router 重构（getConfig/saveConfig/saveModels/saveSkills/saveSoul/gatewayStatus/tokenUsage/todayStats/Memory CRUD）
- [x] Layout 重构（对齐 OpenClaw 模块：驾驶舱/灵魂&记忆/技能商店/模型配置/安装向导）
- [x] Dashboard 重构（Gateway 心跳/模型显示/Token 图表/活动日志）
- [x] SoulEditor 重构（SOUL.md 编辑器 + 记忆卡片 CRUD）
- [x] SkillStore 重构（对齐 OpenClaw Skills 配置，接入真实 API）
- [x] Models 页面新增（模型配对 + API Key 加密保险箱）
- [x] SetupWizard 重构（Gateway URL + Token + 模型 + 人格三步引导）
- [x] vitest 单元测试（22 个测试全部通过）

## Bug 修复

- [x] 修复 SetupWizard Gateway 连接测试：改为 no-cors 模式浏览器端直接 fetch，支持本地 localhost Gateway
- [x] 修复 Dashboard + Layout 的 Gateway 心跳检测：全部改为浏览器端直接 ping，删除服务端代理
