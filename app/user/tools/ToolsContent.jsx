"use client";
// app/user/tools/ToolsContent.jsx — AI Tools Hub

import Link from "next/link";

const CSS = `
.tools-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
.tools-header { margin-bottom: 24px; }
.tools-title { font-size: 1.35rem; font-weight: 900; color: #0f172a; margin: 0 0 4px; }
.tools-sub { font-size: 0.8rem; color: #64748b; }
.tools-section-title {
  font-size: 0.72rem; font-weight: 900; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;
}
.tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
@media(min-width:600px) { .tools-grid { grid-template-columns: 1fr 1fr 1fr; } }
@media(min-width:900px) { .tools-grid-wide { grid-template-columns: 1fr 1fr 1fr 1fr; } }
.tool-card {
  border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px 16px;
  background: #fff; text-decoration: none; display: flex; flex-direction: column;
  gap: 8px; cursor: pointer;
  transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
  position: relative; overflow: hidden;
}
.tool-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.10); border-color: #c7d2fe; transform: translateY(-1px); }
.tool-card::before {
  content: ""; position: absolute; inset: 0; border-radius: 14px;
  background: var(--tool-color); opacity: 0.04; pointer-events: none;
}
.tool-card:hover::before { opacity: 0.08; }
.tool-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; flex-shrink: 0;
}
.tool-name { font-size: 0.9rem; font-weight: 800; color: #0f172a; line-height: 1.25; }
.tool-desc { font-size: 0.76rem; color: #64748b; line-height: 1.4; flex: 1; }
.tool-arrow {
  font-size: 0.72rem; font-weight: 700; color: var(--tool-color);
  margin-top: 4px; display: flex; align-items: center; gap: 4px;
}
.tools-banner {
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(135deg, rgba(26,58,143,0.05), rgba(99,102,241,0.05));
  border: 1.5px solid rgba(26,58,143,0.12); border-radius: 16px;
  padding: 16px 20px; text-decoration: none; margin-bottom: 28px;
  transition: background 0.15s;
}
.tools-banner:hover { background: linear-gradient(135deg, rgba(26,58,143,0.09), rgba(99,102,241,0.09)); }
.tools-banner-icon { font-size: 2rem; flex-shrink: 0; }
.tools-banner-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; }
.tools-banner-sub { font-size: 0.78rem; color: #64748b; margin-top: 2px; }
`;

const AI_TOOLS = [
  {
    name: "AIDLA AI",
    desc: "Your personal AI learning & career assistant",
    icon: "🤖",
    href: "/user/learning",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    label: "Chat now",
  },
  {
    name: "Career Counselor",
    desc: "AI-guided career planning and direction",
    icon: "🎯",
    href: "/user/aidla-ai",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    label: "Get advice",
  },
  {
    name: "CV Maker",
    desc: "Build a professional CV with AI assistance",
    icon: "📄",
    href: "/user/cv-maker",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    label: "Build CV",
  },
  {
    name: "Cover Letter",
    desc: "Generate tailored cover letters instantly",
    icon: "✉️",
    href: "/user/cover-letter",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    label: "Write letter",
  },
];

const LEARNING_TOOLS = [
  {
    name: "Battle Arena",
    desc: "Live quiz battles against other students",
    icon: "⚔️",
    href: "/user/battle",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    label: "Battle now",
  },
  {
    name: "Daily Quiz",
    desc: "Daily challenges to keep skills sharp",
    icon: "📝",
    href: "/user/dailyquizz",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.12)",
    label: "Take quiz",
  },
  {
    name: "Resources",
    desc: "Notes, past papers, books, and templates",
    icon: "📚",
    href: "/user/resources",
    color: "#6366f1",
    bg: "rgba(99,102,246,0.12)",
    label: "Browse",
  },
  {
    name: "Projects",
    desc: "Real-world projects to build your portfolio",
    icon: "🛠️",
    href: "/user/projects",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
    label: "View projects",
  },
];

function ToolCard({ tool }) {
  return (
    <Link href={tool.href} className="tool-card" style={{ "--tool-color": tool.color }}>
      <div className="tool-icon" style={{ background: tool.bg }}>
        {tool.icon}
      </div>
      <div className="tool-name">{tool.name}</div>
      <div className="tool-desc">{tool.desc}</div>
      <div className="tool-arrow">
        {tool.label} →
      </div>
    </Link>
  );
}

export default function ToolsContent() {
  return (
    <div className="tools-wrap">
      <style>{CSS}</style>

      <div className="tools-header">
        <h1 className="tools-title">AI Tools</h1>
        <p className="tools-sub">All your learning and career tools in one place</p>
      </div>

      <Link href="/user/learning" className="tools-banner">
        <div className="tools-banner-icon">🤖</div>
        <div>
          <div className="tools-banner-title">AIDLA AI — Your Learning Assistant</div>
          <div className="tools-banner-sub">Ask anything about your courses, career, or studies</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: "1.2rem", color: "#1a3a8f" }}>→</span>
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div className="tools-section-title">AI Career Tools</div>
        <div className="tools-grid">
          {AI_TOOLS.map(t => <ToolCard key={t.href} tool={t} />)}
        </div>
      </div>

      <div>
        <div className="tools-section-title">Learning Tools</div>
        <div className="tools-grid">
          {LEARNING_TOOLS.map(t => <ToolCard key={t.href} tool={t} />)}
        </div>
      </div>
    </div>
  );
}
