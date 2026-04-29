"use client";
// app/user/page.jsx  (User Dashboard)
// Converted from React Router Dashboard.jsx
//
// Changes:
//   1. "use client" directive
//   2. useNavigate → useRouter from next/navigation
//   3. navigate(to) → router.push(to)
//   4. CSS string identical to original

import { useRouter } from "next/navigation";

/* ── Floating AIDLA Bot Bubble ── */
function BotBubble({ onClick }) {
  return (
    <div className="bot-wrap" onClick={onClick} title="Ask AIDLA Bot" role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}>
      <div className="bot-ring ring-1" aria-hidden="true"/>
      <div className="bot-ring ring-2" aria-hidden="true"/>
      <button className="bot-fab" aria-label="Ask AIDLA Bot">
        <span className="bot-icon" aria-hidden="true">🤖</span>
      </button>
      <div className="bot-tooltip" aria-hidden="true">Ask AIDLA Bot</div>
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

/* ── Section ── */
function Section({ label, labelClass, children }) {
  return (
    <div className="section-block">
      <div className={`section-label ${labelClass}`} role="heading" aria-level={3}>{label}</div>
      <div className="cards-grid">{children}</div>
    </div>
  );
}

/* ── CSS (identical to original) ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');

  .dashboard {
    font-family: 'DM Sans', system-ui, sans-serif;
    position: relative;
    min-height: 60vh;
    animation: dashIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes dashIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }

  .dashboard::before {
    content: '';
    position: fixed; inset: 0;
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
    border: none; border-radius: 22px; padding: 22px 20px 20px;
    cursor: pointer; text-align: left; position: relative; overflow: hidden;
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s;
    display: flex; flex-direction: column;
    box-shadow: 0 2px 0 rgba(255,255,255,0.8) inset, 0 8px 32px rgba(15,23,42,0.07);
  }
  .hero-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.75); pointer-events: none;
  }
  .hero-card:hover  { transform: translateY(-4px); box-shadow: 0 2px 0 rgba(255,255,255,0.8) inset, 0 16px 40px rgba(15,23,42,0.10); }
  .hero-card:active { transform: scale(0.98); }
  .hero-card:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }

  .hero-blue    { background: rgba(219,234,254,0.62); }
  .hero-emerald { background: rgba(209,250,229,0.62); }

  .hero-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px;
    display: inline-block; margin-bottom: 14px; backdrop-filter: blur(8px); width: fit-content;
  }
  .badge-blue    { background: rgba(219,234,254,0.9); color: #1e40af; border: 1px solid rgba(147,197,253,0.5); }
  .badge-emerald { background: rgba(209,250,229,0.9); color: #065f46; border: 1px solid rgba(110,231,183,0.5); }

  .hero-icon  { font-size: 2rem; margin-bottom: 10px; display: block; }
  .hero-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; letter-spacing: -0.3px; }
  .hero-sub   { font-size: 0.78rem; color: #475569; line-height: 1.5; flex: 1; }
  .hero-arrow {
    position: absolute; bottom: 18px; right: 20px;
    font-size: 1rem; color: rgba(15,23,42,0.2);
    transition: color 0.2s, transform 0.2s;
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
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), background 0.18s, box-shadow 0.18s;
    position: relative; overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 8px rgba(15,23,42,0.04); width: 100%;
  }
  .reg-card:hover { background: rgba(255,255,255,0.78); transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 20px rgba(15,23,42,0.07); }
  .reg-card:active  { transform: scale(0.97); }
  .reg-card:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .reg-card:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; border-radius: 16px; }

  .reg-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; backdrop-filter: blur(8px); }
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
  .bot-wrap { position: fixed; bottom: 28px; right: 24px; z-index: 9999; cursor: pointer; }
  .bot-ring { position: absolute; border-radius: 50%; background: rgba(59,130,246,0.2); top: 50%; left: 50%; transform: translate(-50%,-50%); }
  .ring-1 { width: 58px; height: 58px; animation: botPulse 2.4s infinite ease-out; }
  .ring-2 { width: 58px; height: 58px; animation: botPulse 2.4s 0.8s infinite ease-out; }
  @keyframes botPulse {
    0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
    100% { transform: translate(-50%,-50%) scale(2); opacity: 0; }
  }
  .bot-fab {
    position: relative; z-index: 2; width: 54px; height: 54px; border-radius: 50%;
    background: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.95);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 20px rgba(59,130,246,0.25), 0 1px 0 rgba(255,255,255,0.9) inset;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s;
  }
  .bot-fab:hover  { transform: scale(1.1); box-shadow: 0 8px 28px rgba(59,130,246,0.35), 0 1px 0 rgba(255,255,255,0.9) inset; }
  .bot-fab:active { transform: scale(0.93); }
  .bot-icon { font-size: 22px; line-height: 1; }
  .bot-tooltip {
    position: absolute; bottom: 62px; right: 0;
    background: rgba(255,255,255,0.88); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.95); border-radius: 10px;
    padding: 6px 12px; font-size: 11px; font-weight: 700; color: #1e3a8a;
    white-space: nowrap; box-shadow: 0 4px 16px rgba(15,23,42,0.08);
    opacity: 0; pointer-events: none; transform: translateY(4px);
    transition: opacity 0.2s, transform 0.2s;
  }
  .bot-wrap:hover .bot-tooltip { opacity: 1; transform: translateY(0); }

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
    .bot-fab  { width: 48px; height: 48px; }
    .bot-icon { font-size: 20px; }
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

export default function UserDashboard() {
  const router = useRouter();

  return (
    <div className="dashboard">
      <style>{CSS}</style>

      {/* Header */}
      <header className="dash-header">
        <h2 className="dash-title">Dashboard</h2>
        <p className="dash-sub">Welcome to your AIDLA user area. Explore your features below.</p>
      </header>

      {/* Hero Row */}
      <div className="hero-row">
        <HeroCard
          title="AI Career Coach"
          subtitle="Your personalized AI-powered career advisor, always ready."
          icon="📖"
          to="/user/learning"
          accentClass="hero-blue"
          badgeColor="badge-blue"
        />
        <HeroCard
          title="Courses"
          subtitle="Paid & free specialized courses tailored for your growth."
          icon="🎓"
          to="/user/courses"
          accentClass="hero-emerald"
          badgeColor="badge-emerald"
        />
      </div>

      {/* Learn */}
      <Section label="📘 Learn" labelClass="label-blue">
        <RegCard title="Test"      subtitle="Testing & assessments"          icon="✅" to="/user/test"         iconClass="ic-blue" />
        <RegCard title="Resources" subtitle="Study materials & past papers"   icon="📚" to="/user/UserResources" iconClass="ic-blue" />
        <RegCard title="Mining"    subtitle="Start mining AIDLA coins"        icon="💎" to="/user/mining"        iconClass="ic-blue" />
      </Section>

      {/* Earn & Play */}
      <Section label="🏆 Earn & Play" labelClass="label-amber">
        <RegCard title="Lucky Draw"  subtitle="Scheduled draws & big prizes"  icon="🎟️" to="/user/lucky-draw"  iconClass="ic-amber" />
        <RegCard title="Lucky Wheel" subtitle="Spin the wheel & win rewards"  icon="🎡" to="/user/lucky-wheel" iconClass="ic-amber" />
        <RegCard title="Shop"        subtitle="Buy products with AIDLA coins" icon="🛍️" to="/user/shop"        iconClass="ic-amber" />
      </Section>

      {/* Career */}
      <Section label="📄 Career" labelClass="label-blue">
        <RegCard title="My CV Maker"        subtitle="Edit, save & download your CV anytime"        icon="📝" to="/user/cv-maker"      iconClass="ic-blue"   />
       {/* <RegCard title="Build New CV"        subtitle="Create a CV from scratch in 5 minutes"        icon="✨" to="/cv-builder"          iconClass="ic-amber"  /> */}
        <RegCard title="My Cover Letters"    subtitle="Manage your AI-crafted cover letters"          icon="✉️" to="/user/cover-letter"  iconClass="ic-purple" />
       {/* <RegCard title="Build Cover Letter"  subtitle="Write a tailored cover letter with AI"         icon="🤖" to="/cover-letter"        iconClass="ic-green"  /> */}
      </Section>

      {/* Tools */}
      <Section label="🛠️ Tools" labelClass="label-purple">
        <RegCard title="AutoTube"  subtitle="Full YouTube automation assistant" icon="🎬" to="/user/AutoTubeStudio" iconClass="ic-purple" />
        <RegCard title="Follow Us" subtitle="Join our social media channels"    icon="📱" to="/user/social"         iconClass="ic-coral"  />
      </Section>

      {/* Floating Bot */}
      <BotBubble onClick={() => router.push("/user/bot")} />
    </div>
  );
}