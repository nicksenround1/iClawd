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

## 本地部署改造（v3）

- [x] 首页改造：突出"本地安装"为主 CTA，云端网站定位为产品介绍页
- [x] 新增 /install 安装指南页面（macOS/Windows/Linux 三平台步骤）
- [ ] 提供 start.sh（Mac/Linux）和 start.bat（Windows）一键启动脚本
- [ ] 提供 docker-compose.yml 一键 Docker 部署方案
- [ ] 首页导航更新：添加"安装指南"入口
- [ ] 驾驶舱页面：当检测到运行在 localhost 时显示"本地模式"标识

## Bug 修复（v3.1）

- [x] 修复 Install.tsx 中不存在的 GitHub 仓库地址（更新为真实仓库 nicksenround1/iClawd）
- [x] 修复 Home.tsx 中 GitHub 按钮链接

## 最终修复（v3.2）

- [x] 修复 updateMemory 测试：期望值与实际返回值 {success: true} 对齐
- [x] 修复 deleteMemory 测试：deleteMemoryEntry(id, userId) 参数顺序修正
- [x] 22 个单元测试全部通过

## 本地安装 Bug 修复（v3.3）

- [x] 移除 @builder.io/vite-plugin-jsx-loc（与 Vite 7 不兼容，导致 npm install 失败）
- [x] 添加 start:local 脚本（用户按 README 执行 npm run start:local 报错）
- [x] 从 vite.config.ts 中移除 jsxLocPlugin 导入和使用

## 本地运行 Bug 修复（v3.4）

- [x] 修复 VITE_ANALYTICS_ENDPOINT/VITE_ANALYTICS_WEBSITE_ID 未定义导致 URIError 崩溃（从 index.html 移除 analytics 脚本）
- [x] 修复 OAUTH_SERVER_URL 未配置错误（改为信息日志，不再报 ERROR）
- [x] 实现本地模式：OAUTH_SERVER_URL 未配置时自动使用内置 local-user，所有功能正常工作
