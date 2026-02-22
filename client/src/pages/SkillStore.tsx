/*
 * iClawd SkillStore - 技能商店
 * 
 * 功能：技能浏览、一键安装、已安装管理
 * 风格：工业终端，六边形图标，应用商店布局
 */

import { useState } from "react";
import { Zap, Download, CheckCircle, Search, Filter, Star, Package, Globe, Image, Calendar, Music, Code, FileText, Bot, Cpu, Shield } from "lucide-react";
import { toast } from "sonner";

const skillCategories = ["全部", "搜索", "创作", "工具", "通讯", "数据"];

const skills = [
  {
    id: "web-search",
    name: "网页搜索",
    desc: "实时搜索互联网，获取最新信息",
    icon: Globe,
    category: "搜索",
    rating: 4.9,
    installs: "12.4k",
    installed: true,
    color: "oklch(0.78 0.18 200)",
    version: "2.1.0",
    author: "官方",
  },
  {
    id: "image-gen",
    name: "AI 绘图",
    desc: "使用 DALL-E / Stable Diffusion 生成图像",
    icon: Image,
    category: "创作",
    rating: 4.7,
    installs: "8.2k",
    installed: true,
    color: "oklch(0.72 0.18 280)",
    version: "1.5.2",
    author: "官方",
  },
  {
    id: "calendar",
    name: "日历助手",
    desc: "管理日程、设置提醒、查看日历",
    icon: Calendar,
    category: "工具",
    rating: 4.5,
    installs: "5.1k",
    installed: false,
    color: "oklch(0.78 0.18 65)",
    version: "1.2.0",
    author: "社区",
  },
  {
    id: "music",
    name: "音乐播放",
    desc: "控制 Spotify / 网易云，搜索播放音乐",
    icon: Music,
    category: "通讯",
    rating: 4.3,
    installs: "3.8k",
    installed: false,
    color: "oklch(0.82 0.22 140)",
    version: "1.0.5",
    author: "社区",
  },
  {
    id: "code-exec",
    name: "代码执行",
    desc: "在沙箱中运行 Python/JS 代码，返回结果",
    icon: Code,
    category: "数据",
    rating: 4.8,
    installs: "9.7k",
    installed: true,
    color: "oklch(0.78 0.18 200)",
    version: "3.0.1",
    author: "官方",
  },
  {
    id: "doc-reader",
    name: "文档解析",
    desc: "读取 PDF、Word、Excel 等文档内容",
    icon: FileText,
    category: "工具",
    rating: 4.6,
    installs: "7.3k",
    installed: false,
    color: "oklch(0.78 0.18 65)",
    version: "2.0.0",
    author: "官方",
  },
  {
    id: "multi-bot",
    name: "多 Bot 协作",
    desc: "协调多个 AI Agent 并行处理任务",
    icon: Bot,
    category: "工具",
    rating: 4.4,
    installs: "2.1k",
    installed: false,
    color: "oklch(0.72 0.18 280)",
    version: "0.9.0-beta",
    author: "社区",
  },
  {
    id: "data-analysis",
    name: "数据分析",
    desc: "分析 CSV/JSON 数据，生成可视化图表",
    icon: Cpu,
    category: "数据",
    rating: 4.7,
    installs: "6.5k",
    installed: false,
    color: "oklch(0.82 0.22 140)",
    version: "1.8.0",
    author: "官方",
  },
  {
    id: "security-scan",
    name: "安全扫描",
    desc: "检测 URL 安全性，过滤恶意内容",
    icon: Shield,
    category: "工具",
    rating: 4.2,
    installs: "1.9k",
    installed: false,
    color: "oklch(0.62 0.22 25)",
    version: "1.1.0",
    author: "社区",
  },
];

export default function SkillStore() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedSkills, setInstalledSkills] = useState<string[]>(
    skills.filter((s) => s.installed).map((s) => s.id)
  );
  const [installingSkill, setInstallingSkill] = useState<string | null>(null);

  const handleInstall = (skillId: string, skillName: string) => {
    if (installedSkills.includes(skillId)) {
      setInstalledSkills((prev) => prev.filter((id) => id !== skillId));
      toast.success(`${skillName} 已卸载`);
      return;
    }
    setInstallingSkill(skillId);
    toast.info(`正在安装 ${skillName}...`, { duration: 2000 });
    setTimeout(() => {
      setInstalledSkills((prev) => [...prev, skillId]);
      setInstallingSkill(null);
      toast.success(`${skillName} 安装成功！config.json 已更新。`);
    }, 2500);
  };

  const filteredSkills = skills.filter((skill) => {
    const matchCategory = activeCategory === "全部" || skill.category === activeCategory;
    const matchSearch =
      skill.name.includes(searchQuery) || skill.desc.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const installedCount = installedSkills.length;

  return (
    <div className="p-6 space-y-6 fade-in-up">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: "oklch(0.92 0.02 210)" }}
          >
            SKILL GALLERY
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "oklch(0.52 0.05 215)" }}>
            扩展 AI 能力 · 已安装 {installedCount} 个技能
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-sm"
            style={{
              background: "oklch(0.82 0.22 140 / 0.1)",
              border: "1px solid oklch(0.82 0.22 140 / 0.3)",
              color: "oklch(0.82 0.22 140)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Package size={12} />
            {installedCount} INSTALLED
          </div>
        </div>
      </div>

      {/* 搜索和过滤栏 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "oklch(0.52 0.05 215)" }}
          />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-sm outline-none"
            style={{
              background: "oklch(0.11 0.018 235)",
              border: "1px solid oklch(0.22 0.03 230)",
              color: "oklch(0.78 0.02 210)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>
        <div className="flex items-center gap-1">
          {skillCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 text-xs rounded-sm transition-all duration-150"
              style={{
                background: activeCategory === cat ? "oklch(0.78 0.18 200 / 0.15)" : "transparent",
                border: `1px solid ${activeCategory === cat ? "oklch(0.78 0.18 200 / 0.5)" : "oklch(0.22 0.03 230)"}`,
                color: activeCategory === cat ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 技能网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill, index) => {
          const isInstalled = installedSkills.includes(skill.id);
          const isInstalling = installingSkill === skill.id;
          const Icon = skill.icon;

          return (
            <div
              key={skill.id}
              className="skill-card p-4 rounded-sm fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* 卡片顶部 */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${skill.color}/0.12`,
                    border: `1px solid ${skill.color}/0.3`,
                  }}
                >
                  <Icon size={18} style={{ color: skill.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: "oklch(0.88 0.02 210)", fontFamily: "'IBM Plex Sans', sans-serif" }}
                    >
                      {skill.name}
                    </span>
                    {isInstalled && (
                      <CheckCircle size={12} style={{ color: "oklch(0.82 0.22 140)", flexShrink: 0 }} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      v{skill.version}
                    </span>
                    <span
                      className="tag-chip"
                      style={{
                        borderColor: skill.author === "官方" ? "oklch(0.78 0.18 200 / 0.3)" : "oklch(0.52 0.05 215 / 0.3)",
                        color: skill.author === "官方" ? "oklch(0.78 0.18 200)" : "oklch(0.52 0.05 215)",
                        fontSize: "10px",
                      }}
                    >
                      {skill.author}
                    </span>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <p
                className="text-xs mb-3 leading-relaxed"
                style={{ color: "oklch(0.55 0.04 215)" }}
              >
                {skill.desc}
              </p>

              {/* 底部信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.78 0.18 65)" }}>
                    <Star size={10} fill="oklch(0.78 0.18 65)" />
                    {skill.rating}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "oklch(0.45 0.04 220)" }}>
                    <Download size={10} />
                    {skill.installs}
                  </div>
                </div>
                <button
                  onClick={() => handleInstall(skill.id, skill.name)}
                  disabled={isInstalling}
                  className="install-btn"
                  style={{
                    background: isInstalled ? "oklch(0.82 0.22 140 / 0.1)" : "transparent",
                    borderColor: isInstalled ? "oklch(0.82 0.22 140 / 0.5)" : "oklch(0.78 0.18 200 / 0.5)",
                    color: isInstalled ? "oklch(0.82 0.22 140)" : "oklch(0.78 0.18 200)",
                    opacity: isInstalling ? 0.7 : 1,
                  }}
                >
                  {isInstalling ? "安装中..." : isInstalled ? "已安装" : "安装"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div
          className="text-center py-16"
          style={{ color: "oklch(0.38 0.04 220)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          <Zap size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">未找到匹配的技能</p>
        </div>
      )}
    </div>
  );
}
