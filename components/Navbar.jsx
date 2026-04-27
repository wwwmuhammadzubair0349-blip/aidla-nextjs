"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─────────────────────────────────────────
// Animated SVG White Cat
// ─────────────────────────────────────────
function CatPet({ mood, size = 40 }) {
  const isSleepy  = mood === "sleepy";
  const isPlayful = mood === "playful";
  return (
    <svg
      className={`pub-cat-svg mood-${mood}`}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, flexShrink: 0, overflow: "visible" }}
      aria-hidden="true"
      focusable="false"
      suppressHydrationWarning
    >
      <style>{`
        .mood-happy   { animation: catHappyBob  0.9s infinite alternate ease-in-out; }
        .mood-playful { animation: catPlayWig    1.4s infinite ease-in-out; }
        .mood-relaxed { animation: catRelaxFloat 3s   infinite ease-in-out; }
        .mood-sleepy  { animation: catSleepBrth  4s   infinite ease-in-out; }
        @keyframes catHappyBob  { from{transform:translateY(0)}             to{transform:translateY(-4px)} }
        @keyframes catPlayWig   { 0%,100%{transform:rotate(-6deg)}          50%{transform:rotate(6deg)} }
        @keyframes catRelaxFloat{ 0%,100%{transform:translateY(0)scale(1)}  50%{transform:translateY(-3px)scale(1.02)} }
        @keyframes catSleepBrth { 0%,100%{transform:scale(1)}               50%{transform:scale(1.04)} }
        .pub-cat-tail { transform-origin:20px 52px; animation:tailWag 1.6s infinite ease-in-out; }
        @keyframes tailWag { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
        .pub-ear-l { transform-origin:10px 14px; animation:earL 3s infinite ease-in-out; }
        .pub-ear-r { transform-origin:54px 14px; animation:earR 3s 0.4s infinite ease-in-out; }
        @keyframes earL { 0%,80%,100%{transform:rotate(0)} 90%{transform:rotate(-12deg)} }
        @keyframes earR { 0%,80%,100%{transform:rotate(0)} 90%{transform:rotate(12deg)} }
        .pub-eye-l,.pub-eye-r { animation:eyeBlink 4s 1.5s infinite; }
        @keyframes eyeBlink { 0%,94%,100%{transform:scaleY(1)} 96%{transform:scaleY(0.05)} }
        .pub-zzz { opacity:0; }
        .pub-zzz.show  { animation:floatZShow 2s infinite ease-in-out; }
        .pub-zzz.show2 { animation:floatZShow 2s 0.8s infinite ease-in-out; }
        @keyframes floatZShow { 0%{opacity:0;transform:translateY(0)scale(0.6)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-12px)scale(1)} }
        .pub-spark { opacity:0; }
        .pub-spark.show { animation:sparkPop 1.4s 0.6s infinite ease-out; }
        @keyframes sparkPop { 0%,100%{opacity:0;transform:scale(0)} 40%{opacity:1;transform:scale(1.2)} 70%{opacity:0.6;transform:scale(0.8)} }
      `}</style>
      <ellipse cx="32" cy="60" rx="14" ry="3" fill="rgba(0,0,0,0.07)" />
      <g className="pub-cat-tail">
        <path d="M20 52 Q6 50 8 40 Q10 34 16 38" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M20 52 Q6 50 8 40 Q10 34 16 38" stroke="white"   strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </g>
      <ellipse cx="32" cy="46" rx="16" ry="13" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      <ellipse cx="32" cy="48" rx="8"  ry="7"  fill="#fafafa" stroke="#f1f5f9" strokeWidth="1"/>
      <g className="pub-ear-l">
        <polygon points="12,18 8,6 20,14"  fill="white" stroke="#e2e8f0" strokeWidth="1.5" strokeLinejoin="round"/>
        <polygon points="13,17 10,8 19,14" fill="#fecdd3" opacity="0.6"/>
      </g>
      <g className="pub-ear-r">
        <polygon points="52,18 56,6 44,14"  fill="white" stroke="#e2e8f0" strokeWidth="1.5" strokeLinejoin="round"/>
        <polygon points="51,17 54,8 45,14"  fill="#fecdd3" opacity="0.6"/>
      </g>
      <circle cx="32" cy="26" r="17" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      {isSleepy ? (
        <>
          <path d="M23 25 Q26 22 29 25" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M35 25 Q38 22 41 25" stroke="#334155" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </>
      ) : (
        <>
          <g className="pub-eye-l" style={{transformOrigin:"26px 25px"}}>
            <circle cx="26" cy="25" r="4.5" fill="#1e293b"/>
            <circle cx="26" cy="25" r="3"   fill="#334155"/>
            <circle cx="24.5" cy="23.5" r="1.2" fill="white" opacity="0.9"/>
          </g>
          <g className="pub-eye-r" style={{transformOrigin:"38px 25px"}}>
            <circle cx="38" cy="25" r="4.5" fill="#1e293b"/>
            <circle cx="38" cy="25" r="3"   fill="#334155"/>
            <circle cx="36.5" cy="23.5" r="1.2" fill="white" opacity="0.9"/>
          </g>
        </>
      )}
      <polygon points="32,30 30,32 34,32" fill="#fda4af"/>
      <path d="M30 32 Q32 35 34 32" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <line x1="14" y1="29" x2="26" y2="31" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <line x1="14" y1="32" x2="26" y2="32" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <line x1="15" y1="35" x2="26" y2="33" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <line x1="50" y1="29" x2="38" y2="31" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <line x1="50" y1="32" x2="38" y2="32" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <line x1="49" y1="35" x2="38" y2="33" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round"/>
      <ellipse cx="24" cy="58" rx="5" ry="3.5" fill="white" stroke="#e2e8f0" strokeWidth="1.2"/>
      <ellipse cx="40" cy="58" rx="5" ry="3.5" fill="white" stroke="#e2e8f0" strokeWidth="1.2"/>
      <text className={`pub-zzz  ${isSleepy ? "show"  : ""}`} x="46" y="16" fontSize="9" fill="#94a3b8" fontWeight="bold">z</text>
      <text className={`pub-zzz  ${isSleepy ? "show2" : ""}`} x="50" y="9"  fontSize="7" fill="#94a3b8" fontWeight="bold">z</text>
      <text className={`pub-spark ${isPlayful ? "show" : ""}`} x="48" y="12" fontSize="10" fill="#fbbf24">✦</text>
    </svg>
  );
}

// ─────────────────────────────────────────
// Nav links config 
// ─────────────────────────────────────────
const NAV_LINKS =[
  { href: "/",            label: "Home",        icon: "🏠" },
  { href: "/about",       label: "About",       icon: "💡" },
  { href: "/blogs",       label: "Blogs",       icon: "📝" },
  { href: "/news",        label: "News",        icon: "📰" },
  { href: "/faqs",        label: "FAQs",        icon: "❓" },
  { href: "/tools",       label: "Tools",       icon: "🧰" },
  { href: "/courses",     label: "Courses",     icon: "🎓" },
  { href: "/resources",   label: "Resources",   icon: "📚" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted and initialize clock
  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  },[]);

  // Close menu on route change
  useEffect(() => { 
    setMenuOpen(false); 
  }, [pathname]);

  const hour = mounted ? time.getHours() : 12;
  const mood =
    hour >= 5  && hour < 12 ? "happy"   :
    hour >= 12 && hour < 17 ? "playful" :
    hour >= 17 && hour < 21 ? "relaxed" : "sleepy";
  const greetWord =
    hour >= 5  && hour < 12 ? "Morning"   :
    hour >= 12 && hour < 17 ? "Afternoon" :
    hour >= 17 && hour < 21 ? "Evening"   : "Night";

  // Prevent SSR hydration mismatch on dates/times
  const dateStr = mounted ? time.toLocaleString(undefined, { weekday:"short", month:"short", day:"numeric" }) : "---";
  const timeStr = mounted ? time.toLocaleString(undefined, { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true }) : "--:--:--";

  return (
    <>
      <style suppressHydrationWarning>{PH_CSS}</style>
      <header className="ph-header">
        <div className="ph-inner">
          <div className="ph-top">
            <Link href="/" className="ph-logo">AIDLA</Link>
            <div className="ph-cat-widget" aria-hidden="true" role="presentation">
              <CatPet mood={mood} size={38} />
              <div className="ph-datetime">
                <span className="ph-greet">{mounted ? `Good ${greetWord}!` : ""}</span>
                <span className="ph-dt">
                  <span className="ph-dt-date">{mounted ? dateStr : ""}</span>
                  {mounted && <span className="ph-dt-sep">·</span>}
                  <span className="ph-dt-time">{mounted ? timeStr : ""}</span>
                </span>
              </div>
            </div>
            <div className="ph-auth">
              <Link href="/signup" className="ph-btn-ghost">Sign up</Link>
              <Link href="/login"  className="ph-btn-solid">Login</Link>
            </div>
            <button
              className={`ph-burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="ph-mobile-menu"
            >
              <span /><span /><span />
            </button>
          </div>

          <nav className="ph-nav-desktop" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              
              return (
                <Link
                  key={href} 
                  href={href}
                  className={`ph-nav-link${isActive ? " active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div
          id="ph-mobile-menu"
          className={`ph-mobile-menu ${menuOpen ? "open" : ""}`}
          aria-hidden={!menuOpen}
        >
          <div className="ph-mob-auth">
            <Link href="/signup" className="ph-btn-ghost full" onClick={() => setMenuOpen(false)}>Sign up</Link>
            <Link href="/login"  className="ph-btn-solid full" onClick={() => setMenuOpen(false)}>Login</Link>
          </div>
          <nav className="ph-mob-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);

              return (
                <Link
                  key={href} 
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`ph-mob-link${isActive ? " active" : ""}`}
                >
                  <span className="ph-mob-icon" aria-hidden="true">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}

// ─────────────────────────────────────────
// CSS - Minified to prevent hydration mismatches
// ─────────────────────────────────────────
const PH_CSS = `.ph-header{position:sticky;top:0;z-index:200;background:rgba(255,255,255,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(203,213,225,0.35);box-shadow:0 2px 20px rgba(15,23,42,0.06);font-family:'Inter',system-ui,-apple-system,sans-serif}.ph-inner{max-width:1200px;margin:0 auto;padding:10px 24px 0;display:flex;flex-direction:column;gap:0}.ph-top{display:flex;align-items:center;gap:14px;padding-bottom:10px}.ph-logo{text-decoration:none;font-size:1.9rem;font-weight:900;letter-spacing:-1px;line-height:1;flex-shrink:0;background:linear-gradient(135deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(1px 1px 3px rgba(30,58,138,0.15))}.ph-cat-widget{flex:1;min-width:0;display:flex;align-items:center;gap:10px;background:#f8fafc;padding:6px 14px;border-radius:50px;box-shadow:inset 2px 2px 5px rgba(15,23,42,0.04),inset -2px -2px 5px #fff;overflow:hidden}.ph-datetime{display:flex;flex-direction:column;min-width:0;overflow:hidden}.ph-greet{font-size:.8rem;font-weight:800;color:#1e3a8a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ph-dt{display:flex;align-items:center;gap:4px;flex-wrap:nowrap}.ph-dt-date{font-size:.68rem;font-weight:600;color:#64748b;white-space:nowrap}.ph-dt-sep{font-size:.68rem;color:#cbd5e1}.ph-dt-time{font-size:.68rem;font-weight:600;color:#94a3b8;white-space:nowrap;font-family:'Courier New',monospace}.ph-auth{display:flex;gap:8px;flex-shrink:0}.ph-btn-ghost{padding:7px 14px;border-radius:30px;border:1.5px solid #e2e8f0;background:transparent;color:#334155;font-weight:600;font-size:.85rem;text-decoration:none;transition:border-color .2s,color .2s;white-space:nowrap}.ph-btn-ghost:hover{border-color:#3b82f6;color:#3b82f6}.ph-btn-solid{padding:7px 18px;border-radius:30px;border:none;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-weight:700;font-size:.85rem;text-decoration:none;transition:filter .2s,transform .2s,box-shadow .2s;white-space:nowrap;box-shadow:0 3px 10px rgba(59,130,246,0.3)}.ph-btn-solid:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 5px 14px rgba(59,130,246,0.4)}.ph-btn-ghost.full,.ph-btn-solid.full{flex:1;text-align:center}.ph-burger{display:none}.ph-nav-desktop{display:flex;gap:4px;border-top:1px solid rgba(203,213,225,0.25);padding:6px 0}.ph-nav-link{padding:6px 14px;border-radius:30px;text-decoration:none;font-size:.88rem;font-weight:600;color:#475569;transition:color .18s,background .18s}.ph-nav-link:hover{color:#1e3a8a;background:rgba(30,58,138,0.05)}.ph-nav-link.active{color:#1e3a8a;background:#e0e7ff;font-weight:700}.ph-mobile-menu{display:none;flex-direction:column;background:rgba(255,255,255,0.98);backdrop-filter:blur(16px);border-top:1px solid rgba(203,213,225,0.3);overflow:hidden;max-height:0;transition:max-height .3s cubic-bezier(0.16,1,0.3,1),opacity .2s;opacity:0}.ph-mobile-menu.open{max-height:480px;opacity:1}.ph-mob-auth{display:flex;gap:8px;padding:12px 16px 8px}.ph-mob-nav{display:flex;flex-direction:column;padding:4px 10px 12px}.ph-mob-link{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;text-decoration:none;font-size:.85rem;font-weight:600;color:#475569;transition:all .15s}.ph-mob-link:hover{background:rgba(30,58,138,0.05);color:#1e3a8a}.ph-mob-link.active{background:rgba(224,231,255,0.8);color:#1e3a8a;font-weight:700;border-left:3px solid #3b82f6;padding-left:9px}.ph-mob-icon{font-size:1rem;width:24px;flex-shrink:0}@media (max-width:768px){.ph-inner{padding:8px 16px 0}.ph-nav-desktop{gap:2px}.ph-nav-link{padding:5px 10px;font-size:.82rem}}@media (max-width:640px){.ph-inner{padding:4px 10px 0}.ph-top{gap:6px;padding-bottom:5px}.ph-logo{font-size:1.4rem}.ph-cat-widget{padding:5px 10px;border-radius:40px;gap:7px}.ph-cat-widget .pub-cat-svg{width:30px!important;height:30px!important}.ph-greet{font-size:.72rem}.ph-dt-date,.ph-dt-sep,.ph-dt-time{font-size:.6rem}.ph-auth{display:none}.ph-nav-desktop{display:none}.ph-burger{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4.5px;width:38px;height:38px;border-radius:10px;border:none;flex-shrink:0;background:#f1f5f9;cursor:pointer;box-shadow:3px 3px 7px rgba(15,23,42,0.07),-3px -3px 7px #fff;transition:background .2s,box-shadow .2s}.ph-burger span{display:block;width:18px;height:2px;background:#334155;border-radius:2px;transition:all .25s cubic-bezier(0.16,1,0.3,1);transform-origin:center}.ph-burger.open{background:#e0e7ff;box-shadow:inset 2px 2px 5px rgba(15,23,42,0.08),inset -2px -2px 5px rgba(255,255,255,0.8)}.ph-burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);background:#1e3a8a}.ph-burger.open span:nth-child(2){transform:scaleX(0);opacity:0}.ph-burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);background:#1e3a8a}.ph-mobile-menu{display:flex}.ph-mob-link{padding:8px 10px;font-size:.8rem;gap:10px}.ph-mob-icon{font-size:.95rem;width:22px}.ph-mob-nav{padding:4px 8px 12px}}@media (max-width:480px){.ph-mob-link{padding:7px 10px;font-size:.75rem;gap:8px}.ph-mob-icon{font-size:.9rem;width:20px}.ph-mob-auth{padding:10px 12px 6px;gap:6px}.ph-mob-nav{padding:2px 6px 10px}}@media (max-width:380px){.ph-logo{font-size:1.2rem}.ph-cat-widget{padding:4px 8px;gap:5px}.ph-cat-widget .pub-cat-svg{width:26px!important;height:26px!important}.ph-greet{font-size:.66rem}.ph-dt-date,.ph-dt-sep{display:none}.ph-mob-link{padding:6px 8px;font-size:.7rem;gap:6px}.ph-mob-icon{font-size:.85rem;width:18px}}`;