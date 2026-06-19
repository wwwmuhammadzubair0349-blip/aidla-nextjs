"use client";
// app/user/page.jsx  (User Dashboard)
// Converted from React Router Dashboard.jsx
//
// Changes:
//   1. "use client" directive
//   2. useNavigate → useRouter from next/navigation
//   3. navigate(to) → router.push(to)
//   4. CSS string identical to original
//   5. Performance optimized — removed expensive backdrop-filter, transforms, pulse animations
//   6. Hover effects refined — flat, elegant, opacity/border-based only
//   7. Floating bot converted to component with state

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ── Floating AIDLA Bot Bubble ── */
function BotBubble({ onClick, onClose, isOpen }) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || isOpen) return;
    const t = setTimeout(() => setShowGreeting(true), 2000);
    return () => clearTimeout(t);
  }, [dismissed, isOpen]);

  useEffect(() => {
    if (isOpen) setShowGreeting(false);
  }, [isOpen]);

  const handleBtnClick = () => {
    if (isOpen) { onClose(); } else { setShowGreeting(false); onClick(); }
  };

  return (
    <div className="bot-wrap">
      {showGreeting && !dismissed && !isOpen && (
        <div className="bot-greeting" onClick={e => e.stopPropagation()}>
          <button className="bot-greeting-close" onClick={() => { setDismissed(true); setShowGreeting(false); }} aria-label="Dismiss">×</button>
          <div className="bot-greeting-title">Need help? 👋</div>
          <div className="bot-greeting-sub">How may I help you?</div>
          <button className="bot-greeting-cta" onClick={() => { setShowGreeting(false); onClick(); }}>
            Start a conversation →
          </button>
          <div className="bot-greeting-arrow" aria-hidden="true" />
        </div>
      )}
      <button
        className={`bot-fab${isOpen ? " bot-fab-open" : ""}`}
        onClick={handleBtnClick}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          </svg>
        )}
      </button>
    </div>
  );
}

/* ── Hero Card ── */
function HeroCard({ title, subtitle, icon, to, accentClass, badgeColor }) {
  const router = useRouter();
  return (
    <button
      className={`hero-card ${accentClass}`}
      onClick={() => router.push(to)}
      aria-label={title}
    >
      <span className={`hero-badge ${badgeColor}`}>✦ Featured</span>
      <span className="hero-icon" aria-hidden="true">{icon}</span>
      <div className="hero-title">{title}</div>
      <div className="hero-sub">{subtitle}</div>
      <span className="hero-arrow" aria-hidden="true">→</span>
    </button>
  );
}

/* ── Regular Card ── */
function RegCard({ title, subtitle, icon, to, iconClass, isSoon }) {
  const router = useRouter();
  return (
    <button
      className="reg-card"
      onClick={() => !isSoon && router.push(to)}
      disabled={isSoon}
      aria-label={`${title}${isSoon ? " — coming soon" : ""}`}
    >
      <div className={`reg-icon ${iconClass}`} aria-hidden="true">
        <span className="reg-icon-inner">{icon}</span>
      </div>
      <div className="reg-text">
        <div className="reg-title">{title}</div>
        <div className="reg-sub">{subtitle}</div>
      </div>
      {isSoon && <span className="badge-soon">Soon</span>}
    </button>
  );
}

/* ── Dashboard Hero Stats ── */
const DH_CSS = `
.dh-wrap { margin-bottom: 22px; }
.dh-greeting { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
.dh-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px;
}
.dh-stat {
  background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.9);
  border-radius: 14px; padding: 10px 8px; text-align: center;
  box-shadow: 0 1px 4px rgba(15,23,42,0.05);
}
.dh-stat-val { font-size: 1.2rem; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 3px; }
.dh-stat-lbl { font-size: 0.62rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
.dh-stat-icon { font-size: 1rem; margin-bottom: 2px; display: block; }
.dh-widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dh-widget {
  border-radius: 16px; padding: 13px 14px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
  cursor: pointer; text-decoration: none; display: block;
}
.dh-widget:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.09); }
.dh-widget-quiz { background: linear-gradient(135deg, rgba(254,243,199,0.8), rgba(253,230,138,0.5)); }
.dh-widget-learn { background: linear-gradient(135deg, rgba(219,234,254,0.8), rgba(191,219,254,0.5)); }
.dh-widget-tag { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; background: rgba(255,255,255,0.6); border-radius: 20px; padding: 2px 7px; display: inline-block; margin-bottom: 5px; }
.dh-widget-learn .dh-widget-tag { color: #1e40af; }
.dh-widget-icon { font-size: 1.4rem; display: block; margin-bottom: 4px; }
.dh-widget-title { font-size: 0.82rem; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
.dh-widget-sub { font-size: 0.7rem; color: #475569; line-height: 1.35; }
.dh-progress { height: 4px; background: rgba(15,23,42,0.08); border-radius: 4px; margin-top: 8px; overflow: hidden; }
.dh-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #1a3a8f, #3b82f6); transition: width 0.4s ease; }
@media(max-width:480px) { .dh-stats { grid-template-columns: repeat(2, 1fr); } .dh-widgets { grid-template-columns: 1fr; } }
`;

function DashHero({ name, streak, coins, rank, coursesCount, lastCourse }) {
  const router = useRouter();
  const streakLabel = streak >= 3 ? `🔥 ${streak}` : `${streak}`;
  const firstName = name?.split(" ")[0] || "there";
  return (
    <>
      <style>{DH_CSS}</style>
      <div className="dh-wrap">
        <div className="dh-greeting">Hi, {firstName}! 👋</div>
        <div className="dh-stats">
          <div className="dh-stat">
            <span className="dh-stat-icon">🔥</span>
            <div className="dh-stat-val">{streakLabel}</div>
            <div className="dh-stat-lbl">Streak</div>
          </div>
          <div className="dh-stat">
            <span className="dh-stat-icon">🪙</span>
            <div className="dh-stat-val">{coins >= 1000 ? `${(coins/1000).toFixed(1)}k` : coins}</div>
            <div className="dh-stat-lbl">Coins</div>
          </div>
          <div className="dh-stat">
            <span className="dh-stat-icon">📈</span>
            <div className="dh-stat-val" style={{ fontSize: "0.75rem" }}>{rank || "Learner"}</div>
            <div className="dh-stat-lbl">Rank</div>
          </div>
          <div className="dh-stat">
            <span className="dh-stat-icon">🎓</span>
            <div className="dh-stat-val">{coursesCount}</div>
            <div className="dh-stat-lbl">Courses</div>
          </div>
        </div>
        <div className="dh-widgets">
          <button className="dh-widget dh-widget-quiz" onClick={() => router.push("/user/dailyquizz")}>
            <span className="dh-widget-tag">Today</span>
            <span className="dh-widget-icon">❓</span>
            <div className="dh-widget-title">Daily Quiz</div>
            <div className="dh-widget-sub">+15 coins · 2 min</div>
          </button>
          {lastCourse ? (
            <button className="dh-widget dh-widget-learn" onClick={() => router.push(`/user/course/${lastCourse.id}`)}>
              <span className="dh-widget-tag">Continue</span>
              <span className="dh-widget-icon">📚</span>
              <div className="dh-widget-title" style={{ fontSize: "0.76rem" }}>{lastCourse.title?.slice(0, 28)}{lastCourse.title?.length > 28 ? "…" : ""}</div>
              <div className="dh-widget-sub">{lastCourse.category || "Course"}</div>
              {lastCourse.progress > 0 && (
                <div className="dh-progress"><div className="dh-progress-fill" style={{ width: `${Math.min(100, lastCourse.progress)}%` }} /></div>
              )}
            </button>
          ) : (
            <button className="dh-widget dh-widget-learn" onClick={() => router.push("/user/learn")}>
              <span className="dh-widget-tag">Browse</span>
              <span className="dh-widget-icon">📚</span>
              <div className="dh-widget-title">Start Learning</div>
              <div className="dh-widget-sub">Explore free & paid courses</div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Section ── */
function Section({ label, labelClass, children }) {
  return (
    <div className="section-block">
      <div className={`section-label ${labelClass}`} role="heading" aria-level={3}>{label}</div>
      <div className="cards-grid">{children}</div>
    </div>
  );
}

/* ── CSS (performance optimized) ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');

  .dashboard {
    font-family: 'DM Sans', system-ui, sans-serif;
    position: relative;
    min-height: 60vh;
    animation: dashIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes dashIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dashboard::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 20%, rgba(219,234,254,0.55) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 80%, rgba(209,250,229,0.45) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 60% 30%, rgba(237,233,254,0.35) 0%, transparent 60%);
    pointer-events: none; z-index: 0;
  }
  .dashboard > * { position: relative; z-index: 1; }

  /* Header */
  .dash-header { margin-bottom: 22px; }
  .dash-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem; font-weight: 400;
    color: #0f172a; letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 6px;
  }
  .dash-sub { font-size: 0.88rem; color: #64748b; font-weight: 500; }

  /* Hero Row */
  .hero-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }

  .hero-card {
    border: 1px solid rgba(255,255,255,0.75);
    border-radius: 22px; padding: 22px 20px 20px;
    cursor: pointer; text-align: left; position: relative; overflow: hidden;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    display: flex; flex-direction: column;
    box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
  }
  .hero-card:hover {
    box-shadow: 0 1px 3px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.06);
    border-color: rgba(255,255,255,0.95);
  }
  .hero-card:active { opacity: 0.95; }
  .hero-card:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }

  .hero-blue    { background: rgba(219,234,254,0.62); }
  .hero-emerald { background: rgba(209,250,229,0.62); }

  .hero-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px;
    display: inline-block; margin-bottom: 14px; width: fit-content;
  }
  .badge-blue    { background: rgba(219,234,254,0.9); color: #1e40af; border: 1px solid rgba(147,197,253,0.5); }
  .badge-emerald { background: rgba(209,250,229,0.9); color: #065f46; border: 1px solid rgba(110,231,183,0.5); }

  .hero-icon  { font-size: 2rem; margin-bottom: 10px; display: block; }
  .hero-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; letter-spacing: -0.3px; }
  .hero-sub   { font-size: 0.78rem; color: #475569; line-height: 1.5; flex: 1; }
  .hero-arrow {
    position: absolute; bottom: 18px; right: 20px;
    font-size: 1rem; color: rgba(15,23,42,0.2);
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .hero-card:hover .hero-arrow { color: rgba(15,23,42,0.5); transform: translateX(3px); }

  /* Section */
  .section-block { margin-bottom: 22px; }
  .section-label {
    font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
    margin-bottom: 10px; padding: 0 2px;
  }
  .label-blue   { color: #1e40af; }
  .label-amber  { color: #92400e; }
  .label-purple { color: #5b21b6; }

  /* Cards Grid */
  .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* Regular Card */
  .reg-card {
    background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85);
    border-radius: 16px; padding: 13px; cursor: pointer; text-align: left;
    display: flex; align-items: center; gap: 11px;
    transition: background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    position: relative; overflow: hidden;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04); width: 100%;
  }
  .reg-card:hover {
    background: rgba(255,255,255,0.78);
    box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.05);
    border-color: rgba(255,255,255,0.95);
  }
  .reg-card:active { opacity: 0.9; }
  .reg-card:disabled { opacity: 0.5; cursor: not-allowed; }
  .reg-card:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 16px; }

  .reg-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .reg-icon-inner { font-size: 18px; line-height: 1; }

  .ic-blue   { background: rgba(219,234,254,0.8); border: 1px solid rgba(147,197,253,0.35); }
  .ic-amber  { background: rgba(254,243,199,0.8); border: 1px solid rgba(252,211,77,0.35);  }
  .ic-purple { background: rgba(237,233,254,0.8); border: 1px solid rgba(196,181,253,0.35); }
  .ic-coral  { background: rgba(254,226,226,0.8); border: 1px solid rgba(252,165,165,0.35); }
  .ic-green  { background: rgba(209,250,229,0.8); border: 1px solid rgba(110,231,183,0.35); }

  .reg-title { font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.15px; }
  .reg-sub   { font-size: 0.7rem; color: #64748b; line-height: 1.3; }

  .badge-soon {
    position: absolute; top: 9px; right: 9px;
    background: rgba(241,245,249,0.85); color: #94a3b8;
    font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;
    padding: 3px 7px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.8);
  }

  /* Floating Bot */
  .bot-wrap { position: fixed; bottom: 28px; right: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
  .bot-fab {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #1a3a8f, #3b82f6);
    border: none;
    box-shadow: 0 4px 20px rgba(59,130,246,0.4), 0 2px 8px rgba(15,23,42,0.12);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    color: #fff;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .bot-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(59,130,246,0.5), 0 2px 8px rgba(15,23,42,0.14);
  }
  .bot-fab:active { transform: scale(0.96); }
  .bot-fab-open {
    background: linear-gradient(135deg, #334155, #475569);
    box-shadow: 0 4px 16px rgba(15,23,42,0.25);
  }

  .bot-greeting {
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 16px;
    padding: 16px 18px 14px;
    box-shadow: 0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06);
    max-width: 240px;
    position: relative;
    animation: greetIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes greetIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .bot-greeting-arrow {
    position: absolute; bottom: -7px; right: 22px;
    width: 14px; height: 14px;
    background: #fff;
    border-right: 1px solid rgba(15,23,42,0.08);
    border-bottom: 1px solid rgba(15,23,42,0.08);
    transform: rotate(45deg);
  }
  .bot-greeting-close {
    position: absolute; top: 8px; right: 10px;
    background: none; border: none; font-size: 16px; color: #94a3b8;
    cursor: pointer; line-height: 1; padding: 2px 4px; border-radius: 4px;
    transition: color 0.15s ease;
  }
  .bot-greeting-close:hover { color: #475569; }
  .bot-greeting-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
  .bot-greeting-sub { font-size: 0.8rem; color: #64748b; font-weight: 500; line-height: 1.45; margin-bottom: 12px; }
  .bot-greeting-cta {
    display: block; width: 100%;
    padding: 8px 12px;
    background: linear-gradient(135deg, #1a3a8f, #3b82f6);
    color: #fff; border: none; border-radius: 10px;
    font-size: 0.78rem; font-weight: 700; cursor: pointer;
    transition: filter 0.15s ease; font-family: inherit;
  }
  .bot-greeting-cta:hover { filter: brightness(1.1); }


  /* Mobile ≤ 640px */
  @media (max-width: 640px) {
    .dash-title { font-size: 1.55rem; }
    .dash-sub   { font-size: 0.8rem; }
    .dash-header { margin-bottom: 16px; }
    .hero-row { gap: 10px; margin-bottom: 20px; }
    .hero-card { padding: 14px 13px 30px; border-radius: 17px; }
    .hero-icon  { font-size: 1.6rem; margin-bottom: 7px; }
    .hero-title { font-size: 0.82rem; }
    .hero-sub   { font-size: 0.68rem; }
    .hero-badge { font-size: 8px; padding: 3px 8px; margin-bottom: 10px; }
    .cards-grid { gap: 8px; }
    .reg-card   { padding: 11px 10px; border-radius: 13px; gap: 9px; }
    .reg-icon   { width: 34px; height: 34px; border-radius: 9px; }
    .reg-icon-inner { font-size: 15px; }
    .reg-title  { font-size: 0.75rem; }
    .reg-sub    { font-size: 0.62rem; }
    .section-block { margin-bottom: 16px; }
    .section-label { font-size: 9px; }
    .bot-wrap { bottom: 18px; right: 16px; }
    .bot-fab  { width: 50px; height: 50px; }
    .bot-greeting { max-width: 210px; }
  }

  /* Extra small ≤ 380px */
  @media (max-width: 380px) {
    .hero-card { padding: 12px 10px 28px; border-radius: 14px; }
    .hero-title { font-size: 0.76rem; }
    .hero-sub   { font-size: 0.62rem; }
    .hero-icon  { font-size: 1.4rem; }
    .reg-card   { padding: 9px 8px; gap: 7px; }
    .reg-icon   { width: 30px; height: 30px; border-radius: 8px; }
    .reg-icon-inner { font-size: 13px; }
    .reg-title  { font-size: 0.7rem; }
    .reg-sub    { font-size: 0.58rem; }
  }
`;

const GETTING_STARTED_CSS = `
.gs-banner {
  background: linear-gradient(135deg,rgba(219,234,254,0.7),rgba(237,233,254,0.5));
  border: 1px solid rgba(147,197,253,0.4);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 22px;
}
.gs-heading {
  font-size: 0.9rem;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0 0 6px;
}
.gs-sub {
  font-size: 0.78rem;
  color: #475569;
  font-weight: 500;
  margin: 0 0 14px;
  line-height: 1.5;
}
.gs-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gs-step {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: 'DM Sans', system-ui, sans-serif;
  transition: box-shadow 0.15s;
}
.gs-step:hover { box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
.gs-step-icon { font-size: 1.1rem; flex-shrink: 0; }
.gs-step-text {}
.gs-step-title { font-size: 0.8rem; font-weight: 800; color: #0f172a; margin: 0 0 1px; }
.gs-step-desc  { font-size: 0.7rem; color: #64748b; margin: 0; }
.gs-step-coins { margin-left: auto; font-size: 0.72rem; font-weight: 700; color: #d97706; flex-shrink: 0; }
@media (min-width: 480px) {
  .gs-steps { flex-direction: row; flex-wrap: wrap; }
  .gs-step   { flex: 1 1 calc(50% - 4px); }
}
`;

function GettingStartedBanner() {
  const router = useRouter();
  return (
    <>
      <style>{GETTING_STARTED_CSS}</style>
      <div className="gs-banner">
        <p className="gs-heading">👋 Welcome to AIDLA — here&apos;s how to get started</p>
        <p className="gs-sub">Complete these 3 actions to earn your first coins and unlock your full profile.</p>
        <div className="gs-steps">
          <button className="gs-step" onClick={() => router.push("/user/dailyquizz")}>
            <span className="gs-step-icon">❓</span>
            <div className="gs-step-text">
              <p className="gs-step-title">Take today&apos;s quiz</p>
              <p className="gs-step-desc">2 minutes · Knowledge challenge</p>
            </div>
            <span className="gs-step-coins">+15 coins</span>
          </button>
          <button className="gs-step" onClick={() => router.push("/user/learn")}>
            <span className="gs-step-icon">🎓</span>
            <div className="gs-step-text">
              <p className="gs-step-title">Enroll in a course</p>
              <p className="gs-step-desc">Free · Start learning today</p>
            </div>
            <span className="gs-step-coins">+10/lesson</span>
          </button>
          <button className="gs-step" onClick={() => router.push("/user/cv-maker")}>
            <span className="gs-step-icon">📝</span>
            <div className="gs-step-text">
              <p className="gs-step-title">Build your CV</p>
              <p className="gs-step-desc">AI-powered · 5 minutes</p>
            </div>
            <span className="gs-step-coins">Free</span>
          </button>
          <button className="gs-step" onClick={() => router.push("/user/battle")}>
            <span className="gs-step-icon">⚔️</span>
            <div className="gs-step-text">
              <p className="gs-step-title">Try a battle</p>
              <p className="gs-step-desc">1v1 quiz · Win coins</p>
            </div>
            <span className="gs-step-coins">+25 win</span>
          </button>
        </div>
      </div>
    </>
  );
}

const STREAK_CSS = `
.ds-wrap{background:#fff;border:1px solid rgba(226,232,240,.7);border-radius:18px;padding:16px 20px;margin-bottom:18px;box-shadow:0 4px 16px rgba(15,23,42,.05);}
.ds-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ds-title{font-size:.82rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;}
.ds-days{display:flex;gap:6px;align-items:center;}
.ds-day{display:flex;flex-direction:column;align-items:center;gap:3px;}
.ds-circle{width:28px;height:28px;border-radius:50%;background:#f1f5f9;border:2px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:#94a3b8;transition:all .2s;}
.ds-circle.done{background:linear-gradient(135deg,#f59e0b,#ef4444);border-color:transparent;color:#fff;}
.ds-circle.today{box-shadow:0 0 0 3px rgba(245,158,11,.2);}
.ds-day-lbl{font-size:.6rem;color:#94a3b8;font-weight:600;}
.ds-stats{display:flex;gap:14px;margin-left:auto;flex-shrink:0;}
.ds-stat{text-align:center;}
.ds-stat-val{font-size:1.1rem;font-weight:900;color:#f59e0b;line-height:1;}
.ds-stat-lbl{font-size:.65rem;color:#94a3b8;font-weight:600;}
@media(max-width:480px){.ds-stats{margin-left:0;width:100%;justify-content:flex-start;}.ds-circle{width:24px;height:24px;font-size:.58rem;}}
`;

function DashStreak({ weekDays, currentStreak }) {
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return (
    <div className="ds-wrap">
      <style>{STREAK_CSS}</style>
      <div className="ds-row">
        <span className="ds-title">🔥 Weekly Streak</span>
        <div className="ds-days">
          {weekDays.map((d, i) => (
            <div className="ds-day" key={i}>
              <div className={`ds-circle${d.done ? " done" : ""}${d.isToday ? " today" : ""}`}>
                {d.done ? "✓" : DAY_NAMES[d.dayOfWeek][0]}
              </div>
              <div className="ds-day-lbl">{DAY_NAMES[d.dayOfWeek]}</div>
            </div>
          ))}
        </div>
        <div className="ds-stats">
          <div className="ds-stat">
            <div className="ds-stat-val">{currentStreak}</div>
            <div className="ds-stat-lbl">Current</div>
          </div>
          <div className="ds-stat">
            <div className="ds-stat-val">{weekDays.filter(d => d.done).length}/7</div>
            <div className="ds-stat-lbl">This Week</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [isNewUser,    setIsNewUser]    = useState(false);
  const [heroData,     setHeroData]     = useState({ name: "", streak: 0, coins: 0, rank: "Learner", coursesCount: 0, lastCourse: null });
  const [weekDays,     setWeekDays]     = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;

        const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
        const [profileRes, enrollRes, streakRes, weekRes] = await Promise.all([
          supabase.from("users_profiles").select("full_name,coins,rank").eq("user_id", uid).single(),
          supabase.from("course_enrollments").select("course_id,progress,enrolled_at,course_courses(id,title,category)").eq("user_id", uid).order("enrolled_at", { ascending: false }).limit(10),
          supabase.from("daily_quiz_attempts").select("streak_days").eq("user_id", uid).order("attempt_date", { ascending: false }).limit(1).single(),
          supabase.from("daily_quiz_attempts").select("attempt_date").eq("user_id", uid).gte("attempt_date", sevenDaysAgo),
        ]);

        const profile      = profileRes.data || {};
        const enrollments  = enrollRes.data  || [];
        const latestStreak = streakRes.data?.streak_days || 0;

        const doneDates = new Set((weekRes.data || []).map(r => r.attempt_date?.slice(0, 10)));
        const today = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const iso = d.toISOString().slice(0, 10);
          return { dayOfWeek: d.getDay(), done: doneDates.has(iso), isToday: i === 6 };
        });
        setWeekDays(days);

        const lastEnrollment = enrollments[0];
        const lastCourse = lastEnrollment?.course_courses
          ? { ...lastEnrollment.course_courses, progress: lastEnrollment.progress || 0 }
          : null;

        setIsNewUser(enrollments.length === 0);
        setHeroData({
          name:         profile.full_name  || "",
          streak:       latestStreak,
          coins:        profile.coins      || 0,
          rank:         profile.rank       || "Learner",
          coursesCount: enrollments.length,
          lastCourse,
        });
      } catch (_) {}
    }
    load();
  }, []);

  return (
    <div className="dashboard">
      <style>{CSS}</style>

      {/* Hero Stats Bar */}
      <DashHero {...heroData} />

      {/* 7-Day Streak Widget */}
      {weekDays.length > 0 && <DashStreak weekDays={weekDays} currentStreak={heroData.streak} />}

      {/* Getting Started — shown only for new users with no course enrollments */}
      {isNewUser && <GettingStartedBanner />}

      {/* Hero Row */}
      <div className="hero-row">
        <HeroCard
          title="AIDLA AI"
          subtitle="AI-powered career assistant — chat, plan, and grow smarter."
          icon="🤖"
          to="/user/aidla-ai"
          accentClass="hero-blue"
          badgeColor="badge-blue"
        />
        <HeroCard
          title="Learn"
          subtitle="Paid & free specialized courses tailored for your growth."
          icon="🎓"
          to="/user/learn"
          accentClass="hero-emerald"
          badgeColor="badge-emerald"
        />
      </div>

      {/* Learning */}
      <Section label="📘 Learning" labelClass="label-blue">
        <RegCard title="Daily Quiz"   subtitle="Daily knowledge challenge"          icon="❓" to="/user/dailyquizz"  iconClass="ic-blue"   />
        <RegCard title="Assessments"  subtitle="Tests & skill evaluations"          icon="✅" to="/user/test"         iconClass="ic-blue"   />
        <RegCard title="Resources"    subtitle="Study materials & past papers"       icon="📚" to="/user/resources"   iconClass="ic-blue"   />
        <RegCard title="Projects"     subtitle="Project ideas & FYP guidance"        icon="🛠️" to="/user/projects"    iconClass="ic-blue"   />
      </Section>

      {/* Career */}
      <Section label="💼 Career Toolkit" labelClass="label-purple">
        <RegCard title="CV Maker"      subtitle="Build, edit & download your CV"  icon="📝" to="/user/cv-maker"     iconClass="ic-purple" />
        <RegCard title="Cover Letters" subtitle="AI-crafted professional letters" icon="✉️" to="/user/cover-letter" iconClass="ic-purple" />
      </Section>

      {/* Earn & Win */}
      <Section label="🏆 Earn & Win" labelClass="label-amber">
        <RegCard title="Battle Arena" subtitle="Compete in skill-based 1v1 battles" icon="⚔️" to="/user/battle"      iconClass="ic-amber" />
        <RegCard title="Mining"       subtitle="Mine AIDLA coins passively"         icon="💎" to="/user/mining"       iconClass="ic-amber" />
        <RegCard title="Lucky Draw"   subtitle="Scheduled draws & big prizes"       icon="🎟️" to="/user/lucky-draw"  iconClass="ic-amber" />
        <RegCard title="Lucky Wheel"  subtitle="Spin the wheel & win rewards"       icon="🎡" to="/user/lucky-wheel" iconClass="ic-amber" />
        <RegCard title="Shop"         subtitle="Spend AIDLA coins on rewards"       icon="🛍️" to="/user/shop"        iconClass="ic-amber" />
        <RegCard title="Community"    subtitle="Forum, channels & social"           icon="💬" to="/user/community"  iconClass="ic-coral" />
      </Section>

    </div>
  );
}
