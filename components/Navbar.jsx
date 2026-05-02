"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ─────────────────────────────────────────
// NAV LINKS — Home removed (logo = home)
// ─────────────────────────────────────────
const NAV_LINKS = [
  { href: "/about",       label: "About",       icon: "💡" },
  { href: "/blogs",       label: "Blogs",       icon: "📝" },
  { href: "/news",        label: "News",        icon: "📰" },
  { href: "/faqs",        label: "FAQs",        icon: "❓" },
  { href: "/tools",       label: "Tools",       icon: "🧰" },
  { href: "/courses",     label: "Courses",     icon: "🎓" },
  { href: "/resources",   label: "Resources",   icon: "📚" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
];

// ─────────────────────────────────────────
// ALL CSS — prefixed with "nav2-" to avoid
// any conflict with old navbar CSS classes
// ─────────────────────────────────────────
const NAV_CSS = `
.nav2-root * { box-sizing: border-box; }

/* ── HEADER ── */
.nav2-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255,255,255,0.93);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(203,213,225,0.45);
  box-shadow: 0 1px 28px rgba(15,23,42,0.07);
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
}

/* ── INNER CONTAINER ── */
.nav2-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 60px;
}

/* ── LOGO BLOCK ── */
.nav2-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.nav2-logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.nav2-logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.nav2-logo-name {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.nav2-logo-full {
  font-size: 0.52rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.01em;
  white-space: nowrap;
  margin-top: 2px;
}

/* ── DESKTOP NAV ── */
.nav2-desktop {
  display: none;
  align-items: center;
  gap: 2px;
  flex: 1;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav2-desktop::-webkit-scrollbar { display: none; }

.nav2-link {
  padding: 7px 13px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  transition: color 150ms ease, background-color 150ms ease;
}
.nav2-link:hover {
  color: #1e3a8a;
  background-color: rgba(30,58,138,0.05);
}
.nav2-link.active {
  color: #1d4ed8;
  background-color: #eff6ff;
  font-weight: 700;
}

/* ── AUTH BUTTONS ── */
.nav2-auth {
  display: none;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.nav2-btn-ghost {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: transparent;
  color: #334155;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 150ms ease, color 150ms ease;
  font-family: inherit;
}
.nav2-btn-ghost:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.nav2-btn-solid {
  padding: 7px 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 3px 12px rgba(59,130,246,0.35);
  transition: all 200ms ease;
  font-family: inherit;
}
.nav2-btn-solid:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
  box-shadow: 0 5px 18px rgba(59,130,246,0.45);
}

/* ── HAMBURGER ── */
.nav2-burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 3px 3px 8px rgba(15,23,42,0.08), -2px -2px 6px #fff;
  transition: background 150ms ease, box-shadow 150ms ease;
  -webkit-tap-highlight-color: transparent;
}
.nav2-burger span {
  display: block;
  width: 18px;
  height: 2px;
  background: #334155;
  border-radius: 2px;
  transition: all 250ms cubic-bezier(0.16,1,0.3,1);
  transform-origin: center;
}
.nav2-burger.open {
  background: #e0e7ff;
  box-shadow: inset 2px 2px 5px rgba(15,23,42,0.08), inset -2px -2px 5px rgba(255,255,255,0.8);
}
.nav2-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: #1e3a8a; }
.nav2-burger.open span:nth-child(2) { transform: scaleX(0); opacity: 0; }
.nav2-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #1e3a8a; }

/* ── MOBILE MENU PANEL ── */
.nav2-mobile-menu {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(203,213,225,0.3);
  transition: max-height 320ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease;
}
.nav2-mobile-menu.open {
  max-height: 580px;
  opacity: 1;
}

/* Auth row inside mobile menu */
.nav2-mob-auth {
  display: flex;
  gap: 8px;
  padding: 10px 14px 6px;
}
.nav2-mob-auth .nav2-btn-ghost,
.nav2-mob-auth .nav2-btn-solid {
  flex: 1;
  text-align: center;
}

/* Mobile nav links */
.nav2-mob-nav {
  display: flex;
  flex-direction: column;
  padding: 4px 10px 14px;
}
.nav2-mob-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  min-height: 44px;
  transition: all 150ms ease;
}
.nav2-mob-link:hover {
  background: rgba(30,58,138,0.05);
  color: #1e3a8a;
}
.nav2-mob-link.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  border-left: 3px solid #3b82f6;
  padding-left: 11px;
}
.nav2-mob-icon {
  font-size: 1rem;
  width: 22px;
  flex-shrink: 0;
}

/* ── FOCUS STYLES ── */
.nav2-link:focus-visible,
.nav2-mob-link:focus-visible,
.nav2-btn-ghost:focus-visible,
.nav2-btn-solid:focus-visible,
.nav2-burger:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* ══════════════════════════════════════
   RESPONSIVE BREAKPOINTS — mobile first
   Base: 320px
   ══════════════════════════════════════ */

/* 375px */
@media (min-width: 375px) {
  .nav2-inner { padding: 0 12px; }
  .nav2-logo-name { font-size: 1.3rem; }
  .nav2-logo-full { font-size: 0.54rem; }
}

/* 480px */
@media (min-width: 480px) {
  .nav2-inner { padding: 0 16px; }
  .nav2-logo-img { height: 38px; }
  .nav2-logo-name { font-size: 1.35rem; }
  .nav2-logo-full { font-size: 0.56rem; }
}

/* 640px — tablet: show desktop nav + auth, hide burger */
@media (min-width: 640px) {
  .nav2-inner { height: 64px; padding: 0 20px; }
  .nav2-desktop { display: flex; }
  .nav2-auth { display: flex; }
  .nav2-burger { display: none; }
  .nav2-mobile-menu { display: none !important; }
  .nav2-logo-img { height: 40px; }
}

/* 768px */
@media (min-width: 768px) {
  .nav2-inner { height: 66px; padding: 0 24px; }
  .nav2-link { font-size: 0.9rem; }
  .nav2-logo-img { height: 42px; }
  .nav2-logo-name { font-size: 1.4rem; }
  .nav2-logo-full { font-size: 0.58rem; }
}

/* 1024px */
@media (min-width: 1024px) {
  .nav2-inner { height: 70px; padding: 0 32px; }
  .nav2-desktop { gap: 4px; overflow-x: visible; }
  .nav2-link { padding: 8px 16px; font-size: 0.92rem; }
  .nav2-logo-img { height: 44px; }
  .nav2-logo-name { font-size: 1.5rem; }
  .nav2-logo-full { font-size: 0.6rem; }
}

/* 1280px */
@media (min-width: 1280px) {
  .nav2-inner { max-width: 1280px; }
}

/* 1536px — Full HD */
@media (min-width: 1536px) {
  .nav2-inner { max-width: 1440px; height: 74px; }
  .nav2-link { padding: 9px 18px; font-size: 0.95rem; }
  .nav2-logo-img { height: 48px; }
  .nav2-logo-name { font-size: 1.6rem; }
  .nav2-logo-full { font-size: 0.62rem; }
}

/* 2560px — QHD */
@media (min-width: 2560px) {
  .nav2-inner { max-width: 1800px; height: 84px; padding: 0 48px; }
  .nav2-link { padding: 12px 22px; font-size: 1.05rem; }
  .nav2-logo-img { height: 56px; }
  .nav2-logo-name { font-size: 1.9rem; }
  .nav2-logo-full { font-size: 0.72rem; }
  .nav2-btn-ghost, .nav2-btn-solid { padding: 10px 22px; font-size: 0.95rem; }
}

/* 3840px — 4K UHD */
@media (min-width: 3840px) {
  .nav2-inner { max-width: 2200px; height: 100px; padding: 0 64px; }
  .nav2-link { padding: 14px 26px; font-size: 1.2rem; }
  .nav2-logo-img { height: 68px; }
  .nav2-logo-name { font-size: 2.2rem; }
  .nav2-logo-full { font-size: 0.82rem; }
  .nav2-btn-ghost, .nav2-btn-solid { padding: 12px 28px; font-size: 1.05rem; }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  .nav2-burger span,
  .nav2-mobile-menu,
  .nav2-btn-solid,
  .nav2-link,
  .nav2-mob-link,
  .nav2-burger {
    transition: none !important;
    animation: none !important;
  }
}
`;

// ─────────────────────────────────────────
// MAIN NAVBAR COMPONENT
// ─────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  // Close on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close on outside click
  const handleOutsideClick = useCallback((e) => {
    if (
      menuOpen &&
      menuRef.current &&
      !menuRef.current.contains(e.target) &&
      burgerRef.current &&
      !burgerRef.current.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  // Active link check
  const isActive = (href) => pathname?.startsWith(href);

  return (
    // nav2-root scopes all CSS — no conflict with old navbar
    <div className="nav2-root">
      <style>{NAV_CSS}</style>
      <header className="nav2-header">

        {/* ── TOP ROW ── */}
        <div className="nav2-inner">

          {/* Logo + Brand Text */}
          <Link href="/" className="nav2-logo" aria-label="AIDLA Home">
            <Image
              src="/logo.png"
              alt="AIDLA Logo"
              width={160}
              height={44}
              className="nav2-logo-img"
              priority
            />
            <div className="nav2-logo-text">
              <span className="nav2-logo-name">AIDLA</span>
              <span className="nav2-logo-full">Artificial Intelligence Digital Learning Academy</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="nav2-desktop" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav2-link${isActive(href) ? " active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="nav2-auth">
            <Link href="/signup" className="nav2-btn-ghost">Sign up</Link>
            <Link href="/login"  className="nav2-btn-solid">Login</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            ref={burgerRef}
            className={`nav2-burger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav2-mobile-menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        <div
          id="nav2-mobile-menu"
          ref={menuRef}
          className={`nav2-mobile-menu${menuOpen ? " open" : ""}`}
          aria-hidden={!menuOpen}
        >
          {/* Auth buttons */}
          <div className="nav2-mob-auth">
            <Link href="/signup" className="nav2-btn-ghost" onClick={() => setMenuOpen(false)}>Sign up</Link>
            <Link href="/login"  className="nav2-btn-solid" onClick={() => setMenuOpen(false)}>Login</Link>
          </div>

          {/* Nav links with icons */}
          <nav className="nav2-mob-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav2-mob-link${isActive(href) ? " active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav2-mob-icon" aria-hidden="true">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>
        </div>

      </header>
    </div>
  );
}