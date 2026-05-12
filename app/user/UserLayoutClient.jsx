"use client";
// app/user/UserLayoutClient.jsx
// 3 tabs: Home · Forum · Profile
// Design: white + yellow #f59e0b, DM Sans, mobile-first 320px+
// Zero SSR — all client side

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const TABS = [
  { to: "/user",         label: "Home",    icon: "⚡" },
  { to: "/user/forum",   label: "Forum",   icon: "💬" },
  { to: "/user/profile", label: "Profile", icon: "👤" },
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

.ul-wrap {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(245,158,11,.08), transparent 32rem),
    linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%);
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #0f172a;
  overflow-x: hidden;
}

/* ── Header ── */
.ul-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.88);
  border-bottom: 1px solid rgba(226,232,240,.72);
  box-shadow: 0 10px 30px rgba(15,23,42,0.06);
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
}

.ul-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(12px,4vw,28px);
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Top row ── */
.ul-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  padding: 8px 0 6px;
}

/* Brand */
.ul-brand {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.35rem,7vw,1.75rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  text-decoration: none;
  flex-shrink: 0;
  line-height: 1;
  text-shadow: 0 1px 0 #fff;
}
.ul-brand span { color: #f59e0b; }

/* Greeting */
.ul-greeting {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ul-greet-text {
  font-size: clamp(0.72rem, 2.5vw, 0.9rem);
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-greet-text strong {
  color: #0f172a;
  font-weight: 800;
}
.ul-greet-tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  border-radius: 50%;
  margin-left: 5px;
  flex-shrink: 0;
  vertical-align: middle;
}
.ul-greet-tick svg {
  width: 9px;
  height: 9px;
  stroke: #fff;
  stroke-width: 3;
  fill: none;
}

/* Logout */
.ul-logout {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  justify-content: center;
  padding: 0;
  border-radius: 12px;
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
.ul-logout:hover {
  background: #fff1f2;
  border-color: rgba(252,165,165,0.6);
  color: #dc2626;
  transform: translateY(-1px);
}
.ul-logout:focus-visible { outline: 2px solid #ef4444; outline-offset: 2px; }
.ul-logout-text { display: none; }

/* ── Nav tabs ── */
.ul-nav-wrap {
  position: relative;
  padding: 0 0 10px;
}

.ul-tabs {
  display: flex;
  gap: 4px;
  position: relative;
  width: 100%;
  max-width: 100%;
  padding: 5px;
  border: 1px solid rgba(226,232,240,.85);
  border-radius: 16px;
  background: rgba(241,245,249,.82);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
}

.ul-tab.active::before {
  content:"";
  position:absolute;
  inset:5px;
  z-index:0;
  background:#fff;
  border:1px solid rgba(226,232,240,.78);
  border-radius:12px;
  box-shadow:0 8px 20px rgba(15,23,42,.08);
}
.ul-tab > * { position:relative; z-index:1; }

.ul-tab {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  text-decoration: none;
  font-weight: 750;
  font-size: 0.84rem;
  color: #64748b;
  transition: color 0.18s;
  white-space: nowrap;
  position: relative;
  letter-spacing: -0.01em;
}
.ul-tab:hover:not(.active) { color: #0f172a; }
.ul-tab.active { color: #0f172a; font-weight: 900; }
.ul-tab:focus-visible { outline: 2px solid #f59e0b; outline-offset: -2px; border-radius: 8px; }
.ul-tab-icon { font-size: 0.95rem; line-height: 1; }

/* ── Main content ── */
.ul-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(12px,3vw,28px) clamp(10px,4vw,28px) 48px;
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
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
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
  font-size: 1.2rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.03em;
}

/* ── RESPONSIVE ── */

/* 480px+ */
@media (min-width: 480px) {
  .ul-logout-text { display: inline; }
  .ul-logout { width:auto; padding:0 14px; }
}

/* 640px+ */
@media (min-width: 640px) {
  .ul-inner { padding: 0 24px; }
  .ul-top-row { min-height: 66px; }
  .ul-tab { padding: 11px 18px; font-size: 0.9rem; }
}

/* 900px+ */
@media (min-width: 900px) {
  .ul-inner { padding: 0 32px; }
  .ul-top-row { min-height: 72px; }
  .ul-brand { font-size: 2rem; }
  .ul-tab { padding: 12px 24px; }
}

/* 320px edge */
@media (max-width: 360px) {
  .ul-inner { padding: 0 10px; }
  .ul-brand { font-size: 1.22rem; }
  .ul-greeting { display:none; }
  .ul-logout { width:38px; height:38px; font-size: 0.72rem; }
  .ul-main { padding: 10px 8px 30px; }
  .ul-outlet { padding: 12px 10px; border-radius: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .ul-wrap *, .ul-wrap *::before, .ul-wrap *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default function UserLayoutClient({ children }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const [userName,   setUserName]   = useState("");
  const [isVerified, setIsVerified] = useState(false);

  /* Fetch profile name + verified status */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("users_profiles")
        .select("full_name, is_verified")
        .eq("user_id", user.id)
        .single();
      if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
      if (data?.is_verified) setIsVerified(true);
    })();
  }, [user]);

  /* Greeting word */
  const hour = new Date().getHours();
  const greetWord =
    hour >= 5  && hour < 12 ? "Morning"   :
    hour >= 12 && hour < 17 ? "Afternoon" :
    hour >= 17 && hour < 21 ? "Evening"   : "Night";

  /* Loading state */
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ul-loading" role="status" aria-label="Loading AIDLA">
          <div className="ul-spinner" aria-hidden="true" />
          <span className="ul-loading-text">AIDLA</span>
        </div>
      </>
    );
  }

  return (
    <div className="ul-wrap">
      <style>{CSS}</style>

      <header className="ul-header">
        <div className="ul-inner">

          {/* Top row */}
          <div className="ul-top-row">
            <Link href="/" className="ul-brand" aria-label="AIDLA home">
              AID<span>L</span>A
            </Link>

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

            <button onClick={logout} className="ul-logout" aria-label="Logout">
              <LogoutIcon />
              <span className="ul-logout-text">Logout</span>
            </button>
          </div>

          {/* Nav */}
          <div className="ul-nav-wrap">
            <nav id="ul-tabs" className="ul-tabs" aria-label="User navigation">
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

        </div>
      </header>

      <main className="ul-main" id="main-content">
        <div className="ul-outlet">
          {children}
        </div>
      </main>
    </div>
  );
}
