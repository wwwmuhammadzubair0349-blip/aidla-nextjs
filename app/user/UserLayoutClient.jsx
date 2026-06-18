"use client";
// app/user/UserLayoutClient.jsx

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import FloatingAssistant from "@/components/FloatingAssistant";
import SkeletonDashboard from "@/components/SkeletonDashboard";

const FULLSCREEN_ROUTES = ["/user/learning", "/user/aidla-ai", "/user/battle"];

const TABS = [
  { to: "/user",              label: "Home",      icon: "⚡" },
  { to: "/user/learn",        label: "Learn",     icon: "📚" },
  { to: "/user/test",         label: "Compete",   icon: "🏆" },
  { to: "/user/community",    label: "Community", icon: "💬" },
  { to: "/user/profile",      label: "Profile",   icon: "👤" },
];

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const CSS = `
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Wrapper ── */
.ul-wrap {
  width: 100%;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(245,158,11,.08), transparent 32rem),
    linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%);
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #0f172a;
  overflow-x: hidden;
}
.ul-wrap-fs {
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ul-wrap-fs .ul-header   { flex-shrink: 0; }
.ul-wrap-fs .ul-main-fs  { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; align-items: center; padding-top: 6px; }

/* ── Header ── */
.ul-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.92);
  border-bottom: 1px solid rgba(226,232,240,.72);
  box-shadow: 0 4px 16px rgba(15,23,42,0.06);
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
}

/* ── Inner — always full width ── */
.ul-inner {
  width: 100%;
  padding: 0 clamp(12px,3vw,28px);
  display: flex;
  align-items: center;
  height: 50px;
  gap: 0;
}

/* ── Brand ── */
.ul-brand {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.1rem,5vw,1.45rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  text-decoration: none;
  flex-shrink: 0;
  line-height: 1;
  margin-right: 12px;
}
.ul-brand span { color: #f59e0b; }

/* ── Desktop tabs wrapper (hidden mobile, flex:1 desktop) ── */
.ul-tabs-wrap {
  display: none;
}
.ul-tabs-desktop {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid rgba(226,232,240,.85);
  border-radius: 12px;
  background: rgba(241,245,249,.82);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
  width: 100%;
  max-width: 600px;
}

/* ── Right group (greeting + mobile dropdown + logout) ── */
.ul-right {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Greeting ── */
.ul-greeting {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ul-greet-text {
  font-size: clamp(0.68rem,2.4vw,0.84rem);
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-greet-text strong { color: #0f172a; font-weight: 800; }
.ul-greet-tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  background: #f59e0b;
  border-radius: 50%;
  margin-left: 4px;
  flex-shrink: 0;
  vertical-align: middle;
}
.ul-greet-tick svg { width:8px; height:8px; stroke:#fff; stroke-width:3; fill:none; }

/* ── Mobile nav dropdown ── */
.ul-nav-mobile {
  position: relative;
  flex-shrink: 0;
}
.ul-nav-select {
  -webkit-appearance: none;
  appearance: none;
  background: rgba(241,245,249,.92);
  border: 1px solid rgba(226,232,240,.9);
  border-radius: 10px;
  padding: 5px 22px 5px 9px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  font-family: 'DM Sans', system-ui, sans-serif;
  max-width: 118px;
  min-width: 90px;
  line-height: 1.2;
  outline: none;
  transition: border-color .15s;
}
.ul-nav-select:focus { border-color: rgba(245,158,11,.5); }
.ul-nav-mobile::after {
  content: "▾";
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 0.72rem;
  color: #64748b;
}

/* ── Icon buttons (search, bell, logout) ── */
.ul-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 34px; height: 34px;
  border-radius: 10px; border: 1.5px solid #e2e8f0;
  background: rgba(248,250,252,.9); color: #475569;
  cursor: pointer; transition: all 0.18s; position: relative; text-decoration: none;
}
.ul-icon-btn:hover { background: #f0f4ff; border-color: rgba(26,58,143,0.2); color: #1a3a8f; transform: translateY(-1px); }
.ul-icon-btn.bell-active { color: #f59e0b; border-color: rgba(245,158,11,0.3); }
.ul-notif-dot {
  position: absolute; top: 5px; right: 5px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #ef4444; border: 1.5px solid #fff;
}

/* ── Logout ── */
.ul-logout {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  justify-content: center;
  padding: 0;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: rgba(248,250,252,.9);
  color: #ef4444;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.ul-logout:hover { background:#fff1f2; border-color:rgba(252,165,165,0.6); color:#dc2626; transform:translateY(-1px); }
.ul-logout:focus-visible { outline: 2px solid #ef4444; outline-offset: 2px; }
.ul-logout-text { display: none; }

/* ── Tab styles ── */
.ul-tab {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.78rem;
  color: #64748b;
  border-radius: 9px;
  transition: color 0.18s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-tab:hover:not(.active) { color: #0f172a; }
.ul-tab.active {
  color: #0f172a;
  font-weight: 900;
  background: #fff;
  border: 1px solid rgba(226,232,240,.78);
  box-shadow: 0 2px 8px rgba(15,23,42,.07);
}
.ul-tab:focus-visible { outline: 2px solid #f59e0b; outline-offset: -2px; }
.ul-tab-icon { font-size: 0.85rem; line-height: 1; flex-shrink: 0; }

/* ── Main content ── */
.ul-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(12px,3vw,28px) clamp(10px,4vw,28px) 48px;
}
.ul-main-fs {
  max-width: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}
.ul-outlet {
  background: #ffffff;
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: clamp(16px,3vw,24px);
  padding: clamp(14px,3vw,32px);
  box-shadow: 0 18px 60px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,.9);
  animation: ul-popin 0.35s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes ul-popin {
  from { opacity:0; transform:translateY(12px); }
  to   { opacity:1; transform:none; }
}

/* ── Auth loading ── */
.ul-loading {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px;
  background: #ffffff;
  z-index: 9999;
}
.ul-spinner {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(245,158,11,0.2);
  border-top-color: #f59e0b;
  animation: ul-spin 0.65s linear infinite;
}
@keyframes ul-spin { to { transform: rotate(360deg); } }
.ul-loading-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem; font-weight: 900;
  color: #0f172a; letter-spacing: -0.03em;
}

/* ── RESPONSIVE ── */

/* 480px+ — show logout text */
@media (min-width: 480px) {
  .ul-logout-text { display: inline; }
  .ul-logout { width: auto; padding: 0 12px; }
}

/* 600px+ — switch to desktop tab pills, 3-section layout */
@media (min-width: 600px) {
  .ul-inner { height: 52px; }

  /* Show the tabs wrapper (flex:1 = fills the middle) */
  .ul-tabs-wrap {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0 12px;
  }

  /* Greeting+right group: fixed-size right side */
  .ul-right {
    flex: 0 0 auto;
    gap: 10px;
  }
  .ul-greeting {
    flex: 0 1 auto;
    justify-content: flex-end;
  }
  .ul-nav-mobile { display: none; }
}

/* 900px+ */
@media (min-width: 900px) {
  .ul-inner { height: 54px; }
  .ul-brand { font-size: 1.6rem; margin-right: 16px; }
  .ul-tabs-desktop { max-width: 580px; }
  .ul-tab { padding: 7px 12px; font-size: 0.82rem; }
  .ul-tabs-wrap { padding: 0 20px; }
}

/* 1280px+ */
@media (min-width: 1280px) {
  .ul-inner { padding: 0 40px; }
  .ul-tabs-desktop { max-width: 620px; }
}

/* 360px edge */
@media (max-width: 360px) {
  .ul-inner { padding: 0 8px; height: 46px; }
  .ul-brand { font-size: 1rem; margin-right: 6px; }
  .ul-nav-select { max-width: 88px; font-size: 0.73rem; padding: 4px 20px 4px 7px; }
}

@media (prefers-reduced-motion: reduce) {
  .ul-wrap *, .ul-wrap *::before, .ul-wrap *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/* ── FAB for /user pages ── */
const FAB_CSS = `
  .ulfab-wrap {
    position:fixed; bottom:24px; right:20px; z-index:9998;
    display:flex; flex-direction:column; align-items:flex-end; gap:10px;
    pointer-events:none;
  }
  .ulfab-wrap>*{pointer-events:auto;}
  .ulfab-greeting{
    background:#fff; border:1px solid rgba(15,23,42,0.08);
    border-radius:14px; padding:14px 16px 12px;
    box-shadow:0 8px 28px rgba(15,23,42,0.12);
    max-width:220px; position:relative;
    animation:ulfabIn .3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes ulfabIn{from{opacity:0;transform:translateY(8px) scale(0.97);}to{opacity:1;transform:none;}}
  .ulfab-arrow{position:absolute;bottom:-7px;right:20px;width:13px;height:13px;background:#fff;border-right:1px solid rgba(15,23,42,0.08);border-bottom:1px solid rgba(15,23,42,0.08);transform:rotate(45deg);}
  .ulfab-close{position:absolute;top:7px;right:8px;background:none;border:none;font-size:15px;color:#94a3b8;cursor:pointer;line-height:1;padding:2px 4px;border-radius:4px;}
  .ulfab-close:hover{color:#475569;}
  .ulfab-title{font-size:.86rem;font-weight:800;color:#0f172a;margin-bottom:3px;}
  .ulfab-sub{font-size:.78rem;color:#64748b;font-weight:500;line-height:1.4;margin-bottom:10px;}
  .ulfab-cta{display:block;width:100%;padding:7px 10px;background:linear-gradient(135deg,#1a3a8f,#3b82f6);color:#fff;border:none;border-radius:9px;font-size:.76rem;font-weight:700;cursor:pointer;font-family:inherit;}
  .ulfab-cta:hover{filter:brightness(1.08);}
  .ulfab-btn{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1a3a8f,#3b82f6);border:none;box-shadow:0 4px 18px rgba(59,130,246,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:transform .2s cubic-bezier(0.34,1.56,0.64,1),box-shadow .2s;}
  .ulfab-btn:hover{transform:scale(1.08);box-shadow:0 6px 24px rgba(59,130,246,0.5);}
  .ulfab-btn:active{transform:scale(0.96);}
  .ulfab-btn-open{background:linear-gradient(135deg,#334155,#475569);box-shadow:0 4px 14px rgba(15,23,42,0.22);}
  @media(max-width:640px){.ulfab-wrap{bottom:18px;right:14px;}.ulfab-btn{width:48px;height:48px;}}
`;

function FloatingTrigger() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [dismissed,    setDismissed]    = useState(false);

  useEffect(() => {
    if (dismissed || isOpen) return;
    const t = setTimeout(() => setShowGreeting(true), 2500);
    return () => clearTimeout(t);
  }, [dismissed, isOpen]);

  useEffect(() => { if (isOpen) setShowGreeting(false); }, [isOpen]);

  const toggle = () => {
    if (isOpen) setIsOpen(false);
    else { setShowGreeting(false); setIsOpen(true); }
  };

  return (
    <>
      <style>{FAB_CSS}</style>
      <div className="ulfab-wrap">
        {showGreeting && !dismissed && !isOpen && (
          <div className="ulfab-greeting">
            <button className="ulfab-close" onClick={() => { setDismissed(true); setShowGreeting(false); }} aria-label="Dismiss">×</button>
            <div className="ulfab-title">Need help? 👋</div>
            <div className="ulfab-sub">How may I help you?</div>
            <button className="ulfab-cta" onClick={() => { setShowGreeting(false); setIsOpen(true); }}>Start a conversation →</button>
            <div className="ulfab-arrow" aria-hidden="true" />
          </div>
        )}
        <button className={`ulfab-btn${isOpen ? " ulfab-btn-open" : ""}`} onClick={toggle} aria-label={isOpen ? "Close chat" : "Open chat"}>
          {isOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          )}
        </button>
      </div>
      <FloatingAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default function UserLayoutClient({ children }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const isFullscreen = FULLSCREEN_ROUTES.some(p => pathname.startsWith(p));
  const { user, loading, logout } = useAuth();

  const [userName,     setUserName]     = useState("");
  const [isVerified,   setIsVerified]   = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("users_profiles")
        .select("full_name, is_verified, onboarding_completed")
        .eq("user_id", user.id)
        .single();
      if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
      if (data?.is_verified) setIsVerified(true);
      if (data?.onboarding_completed === false && pathname === "/user") {
        router.replace("/user/onboarding");
      }
      // Unread notifications count
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (count) setUnreadCount(count);
    })();
  }, [user, pathname, router]);

  const hour = new Date().getHours();
  const greetWord =
    hour >= 5  && hour < 12 ? "Morning"   :
    hour >= 12 && hour < 17 ? "Afternoon" :
    hour >= 17 && hour < 21 ? "Evening"   : "Night";

  const currentTabTo = TABS.find(t =>
    t.to === "/user" ? pathname === "/user" : pathname.startsWith(t.to)
  )?.to || "/user";

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        {/* Branded header stays visible during auth — no blank flash */}
        <div className="ul-wrap">
          <header className="ul-header">
            <div className="ul-inner">
              <span className="ul-brand" aria-label="AIDLA">AID<span>L</span>A</span>
            </div>
          </header>
          <main className="ul-main">
            <div className="ul-outlet">
              <SkeletonDashboard />
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
    <div className={`ul-wrap${isFullscreen ? " ul-wrap-fs" : ""}`}>
      <style>{CSS}</style>

      <header className="ul-header">
        <div className="ul-inner">

          {/* Brand — always left */}
          <Link href="/" className="ul-brand" aria-label="AIDLA home">
            AID<span>L</span>A
          </Link>

          {/* Desktop: centered tab pills wrapper (flex:1, hidden mobile) */}
          <div className="ul-tabs-wrap">
            <nav className="ul-tabs-desktop" aria-label="User navigation">
              {TABS.map(({ to, label, icon }) => {
                const isActive = to === "/user" ? pathname === "/user" : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`ul-tab${isActive ? " active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="ul-tab-icon" aria-hidden="true">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right group: greeting + mobile dropdown + logout */}
          <div className="ul-right">
            <div className="ul-greeting" aria-label={`Good ${greetWord}${userName ? `, ${userName}` : ""}`}>
              <p className="ul-greet-text">
                Good {greetWord}{userName ? <>, <strong>{userName}</strong></> : ""}
                {isVerified && (
                  <span className="ul-greet-tick" aria-label="Verified" title="Verified profile">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </p>
            </div>

            {/* Mobile only: nav dropdown */}
            <div className="ul-nav-mobile" aria-label="Navigate">
              <select
                className="ul-nav-select"
                value={currentTabTo}
                onChange={e => router.push(e.target.value)}
                aria-label="Navigation"
              >
                {TABS.map(({ to, label, icon }) => (
                  <option key={to} value={to}>{icon} {label}</option>
                ))}
                <option value="/user/insights">✨ Insights</option>
                <option value="/user/tools">🤖 Tools</option>
                <option value="/user/achievements">🏆 Achievements</option>
                <option value="/user/changelog">📋 Changelog</option>
                <option value="/user/search">🔍 Search</option>
                <option value="/user/notifications">🔔 Notifications</option>
                <option value="/user/settings">⚙️ Settings</option>
              </select>
            </div>

            {/* Search */}
            <Link href="/user/search" className="ul-icon-btn" aria-label="Search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </Link>

            {/* Notifications bell */}
            <Link href="/user/notifications" className={`ul-icon-btn${unreadCount > 0 ? " bell-active" : ""}`} aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && <span className="ul-notif-dot" aria-hidden="true" />}
            </Link>

            <button onClick={logout} className="ul-logout" aria-label="Logout">
              <LogoutIcon />
              <span className="ul-logout-text">Logout</span>
            </button>
          </div>

        </div>
      </header>

      <main className={`ul-main${isFullscreen ? " ul-main-fs" : ""}`} id="main-content">
        {isFullscreen ? children : <div className="ul-outlet">{children}</div>}
      </main>
    </div>
    <FloatingTrigger />
    </>
  );
}
