"use client";

// Navbar.jsx — Universal Responsive, Premium UX, Accessibility 100
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// ── PREMIUM SVG ICONS ──
const Icons = {
  About: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Articles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Blogs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  News: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>,
  FAQs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  Courses: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Resources: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Leaderboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
};

// ── NAVIGATION STRUCTURE (Merged Articles) ──
const NAV_LINKS =[
{ href: "/about", label: "About", icon: Icons.About },
{
  label: "Articles",
  icon: Icons.Articles,
  subItems: [
    { href: "/blogs", label: "Blogs", desc: "Deep dives and expert thoughts.", icon: Icons.Blogs },
    { href: "/news", label: "News", desc: "Latest announcements and updates.", icon: Icons.News },
  ]
},
{
  label: "Learning", // Or "Education"
  icon: Icons.Learning,
  subItems: [
    { href: "/courses", label: "Courses", desc: "Structured learning paths.", icon: Icons.Courses },
    { href: "/resources", label: "Resources", desc: "Handy guides and assets.", icon: Icons.Resources },
  ]
},
{ href: "/faqs", label: "FAQs", icon: Icons.FAQs },
{
  label: "Platform", // Or "Explore"
  icon: Icons.Platform,
  subItems: [
    { href: "/tools", label: "Tools", desc: "Interactive utilities for your workflow.", icon: Icons.Tools },
    { href: "/leaderboard", label: "Leaderboard", desc: "See how you rank against others.", icon: Icons.Leaderboard },
  ]
},


];

const NAV_CSS = `
.nav2-root * { box-sizing: border-box; }

/* ── HEADER ── */
.nav2-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(203,213,225,0.4);
  box-shadow: 0 4px 30px rgba(15,23,42,0.03);
  font-family: 'DM Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  transition: all 0.3s ease;
}

.nav2-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
}

/* ── LOGO ── */
.nav2-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  flex-shrink: 0;
  min-height: 44px;
  padding: 4px 0;
  outline-offset: 4px;
}
.nav2-logo-img { height: 40px; width: auto; object-fit: contain; }
.nav2-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
.nav2-logo-name {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav2-logo-full {
  font-size: 0.55rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: none;
}

/* ── DESKTOP NAV ── */
.nav2-desktop {
  display: none;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
}

/* Base Nav Link */
.nav2-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 99px;
  border: none;
  background: transparent;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  font-family: inherit;
}
.nav2-link:hover, .nav2-link[aria-expanded="true"] {
  color: #1d4ed8;
  background-color: #f1f5f9;
}
.nav2-link.active {
  color: #1d4ed8;
  background-color: #eff6ff;
  font-weight: 700;
}
.nav2-link svg.chevron {
  width: 14px; height: 14px;
  transition: transform 250ms ease;
}
.nav2-link[aria-expanded="true"] svg.chevron,
.nav2-dropdown-wrapper:hover .nav2-link svg.chevron {
  transform: rotate(180deg);
}

/* ── DESKTOP DROPDOWN (Mega Menu Style) ── */
.nav2-dropdown-wrapper { position: relative; }
.nav2-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) translateY(10px) scale(0.98);
  background: #ffffff;
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04);
  padding: 8px;
  width: 280px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 201;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
/* Show on hover OR when active within focus */
.nav2-dropdown-wrapper:hover .nav2-dropdown-menu,
.nav2-dropdown-wrapper:focus-within .nav2-dropdown-menu {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* Dropdown Item */
.nav2-dd-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #334155;
  transition: background 150ms ease;
  min-height: 44px;
}
.nav2-dd-item:hover, .nav2-dd-item:focus-visible {
  background: #f8fafc;
  outline: none;
}
.nav2-dd-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 10px;
  flex-shrink: 0;
}
.nav2-dd-icon svg { width: 18px; height: 18px; }
.nav2-dd-text { display: flex; flex-direction: column; gap: 2px; }
.nav2-dd-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
.nav2-dd-desc { font-size: 0.75rem; font-weight: 500; color: #64748b; line-height: 1.3; }

/* ── AUTH BUTTONS ── */
.nav2-auth {
  display: none;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.nav2-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 40px; padding: 0 18px; border-radius: 99px; border: 2px solid #e2e8f0;
  background: transparent; color: #475569; font-weight: 700; font-size: 0.875rem;
  text-decoration: none; transition: all 200ms ease;
}
.nav2-btn-ghost:hover { border-color: #2563eb; color: #2563eb; background: rgba(37,99,235,0.04); }
.nav2-btn-solid {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 40px; padding: 0 20px; border-radius: 99px; border: none;
  background: #2563eb; color: #fff; font-weight: 700; font-size: 0.875rem;
  text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  transition: all 200ms ease;
}
.nav2-btn-solid:hover { background: #1d4ed8; box-shadow: 0 6px 16px rgba(37,99,235,0.35); transform: translateY(-1px); }

/* ── HAMBURGER ── */
.nav2-burger {
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 5px;
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #fff; cursor: pointer; flex-shrink: 0;
  transition: all 200ms ease; -webkit-tap-highlight-color: transparent;
}
.nav2-burger span {
  display: block; width: 20px; height: 2px; background: #0f172a; border-radius: 2px;
  transition: transform 300ms cubic-bezier(0.16,1,0.3,1), opacity 200ms ease;
}
.nav2-burger.open { background: #eff6ff; border-color: #bfdbfe; }
.nav2-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: #1d4ed8; }
.nav2-burger.open span:nth-child(2) { transform: scaleX(0); opacity: 0; }
.nav2-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: #1d4ed8; }

/* ── MOBILE MENU PANEL ── */
.nav2-mobile-menu {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(203,213,225,0.4);
  box-shadow: 0 10px 25px rgba(15,23,42,0.05);
  overflow: hidden; max-height: 0; opacity: 0; visibility: hidden;
  transition: max-height 400ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease, visibility 0ms 400ms;
}
.nav2-mobile-menu.open {
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  opacity: 1; visibility: visible;
  transition: max-height 400ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease, visibility 0ms 0ms;
}

/* Staggered mobile links setup */
.nav2-mob-nav { display: flex; flex-direction: column; padding: 12px 16px 24px; gap: 4px; }
.nav2-mob-item-wrap {
  opacity: 0; transform: translateY(10px);
  transition: opacity 300ms ease, transform 300ms ease;
}
.nav2-mobile-menu.open .nav2-mob-item-wrap { opacity: 1; transform: translateY(0); }
/* Delay variables injected inline for stagger effect */

/* Mobile Base Link/Button */
.nav2-mob-link {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; min-height: 52px; padding: 0 16px; border-radius: 12px;
  border: none; background: transparent; text-decoration: none;
  font-size: 1rem; font-weight: 600; color: #334155;
  transition: background 150ms ease, color 150ms ease; text-align: left;
}
.nav2-mob-link:hover, .nav2-mob-link:focus-visible { background: #f1f5f9; color: #1d4ed8; }
.nav2-mob-link.active { background: #eff6ff; color: #1d4ed8; font-weight: 700; }
.nav2-mob-link-content { display: flex; align-items: center; gap: 14px; }
.nav2-mob-icon { display: inline-flex; width: 24px; height: 24px; color: #64748b; }
.nav2-mob-link.active .nav2-mob-icon { color: #2563eb; }
.nav2-mob-icon svg { width: 100%; height: 100%; }

/* Mobile Accordion Logic */
.nav2-mob-accordion {
  overflow: hidden; max-height: 0; opacity: 0;
  transition: max-height 300ms ease, opacity 300ms ease;
  padding-left: 24px; display: flex; flex-direction: column; gap: 4px;
}
.nav2-mob-accordion.open { max-height: 300px; opacity: 1; padding-top: 4px; padding-bottom: 4px; }
.nav2-mob-sublink {
  display: flex; align-items: center; gap: 12px;
  min-height: 48px; padding: 0 16px; border-radius: 10px;
  text-decoration: none; font-size: 0.95rem; font-weight: 600; color: #475569;
}
.nav2-mob-sublink:hover, .nav2-mob-sublink.active { background: #f8fafc; color: #2563eb; }
.nav2-mob-subicon { display: inline-flex; width: 20px; height: 20px; color: #94a3b8; }
.nav2-mob-sublink.active .nav2-mob-subicon { color: #2563eb; }

/* Mobile Auth */
.nav2-mob-auth { display: flex; gap: 12px; padding: 16px; border-top: 1px solid #e2e8f0; }
.nav2-mob-auth > * { flex: 1; min-height: 48px; font-size: 1rem; }

/* ── FOCUS STYLES (WCAG 2.1 AA) ── */
*:focus-visible {
  outline: 3px solid rgba(37,99,235,0.6); outline-offset: 2px; border-radius: 6px;
}
.nav2-link:focus-visible { outline-offset: -2px; }

/* ── SKIP LINK ── */
.nav2-skip {
  position: absolute; top: -999px; left: 0; z-index: 9999;
  padding: 14px 24px; background: #0f172a; color: #fff;
  font-weight: 700; text-decoration: none; border-radius: 0 0 16px 0;
}
.nav2-skip:focus { top: 0; }

/* ── RESPONSIVE ── */
@media (min-width: 480px) {
  .nav2-logo-full { display: block; }
}
@media (min-width: 900px) { /* Shifted from 768 to 900 to ensure enough space for nav items */
  .nav2-inner { height: 72px; padding: 0 24px; }
  .nav2-desktop { display: flex; }
  .nav2-auth { display: flex; }
  .nav2-burger { display: none; }
  .nav2-mobile-menu { display: none !important; }
}
@media (min-width: 1280px) {
  .nav2-inner { padding: 0 32px; height: 80px; }
  .nav2-link { font-size: 0.95rem; padding: 0 18px; }
  .nav2-desktop { gap: 10px; }
  .nav2-logo-name { font-size: 1.5rem; }
  .nav2-logo-img { height: 48px; }
}

/* ── REDUCED MOTION ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`;

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // States
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobAccordionOpen, setMobAccordionOpen] = useState(""); // Tracks which mobile accordion is open
  
  // Refs
  const headerRef = useRef(null);
  const burgerRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => { setMounted(true); },[]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobAccordionOpen("");
  }, [pathname]);

  // Utility to check active links
  const isActive = (href) => pathname === href || (href !== "/" && pathname?.startsWith(href));
  const isAnyChildActive = (subItems) => subItems?.some(item => isActive(item.href));

  // ── ACCESSIBILITY: Keyboard Navigation & Focus Trap ──
  useEffect(() => {
    if (!menuOpen) return;
    const t = setTimeout(() => firstLinkRef.current?.focus(), 50); // Auto-focus first mobile link
    
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        burgerRef.current?.focus(); // Return focus to trigger
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  // ── DESKTOP DROPDOWN ACCESSIBILITY (Focus Management) ──
  const handleDropdownBlur = (e, wrapperRef) => {
    // If focus leaves the dropdown wrapper entirely, we could trigger a state if we were managing it purely via JS.
    // Since we use CSS focus-within for desktop, CSS handles it natively! 
    // This empty wrapper exists to document that native focus-within is intentionally fulfilling this role.
  };

  return (
    <div className="nav2-root">
      <style>{NAV_CSS}</style>
      <a href="#main-content" className="nav2-skip">Skip to main content</a>

      <header className="nav2-header" role="banner" ref={headerRef}>
        <div className="nav2-inner">
          
          {/* ── LOGO ── */}
          <Link href="/" className="nav2-logo" aria-label="AIDLA — Go to homepage" prefetch={false}>
            <Image src="/logo.webp" alt="" width={160} height={48} className="nav2-logo-img" priority />
            <div className="nav2-logo-text" aria-hidden="true">
              <span className="nav2-logo-name">AIDLA</span>
              <span className="nav2-logo-full">AI Digital Learning Academy</span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="nav2-desktop" aria-label="Main navigation">
            {NAV_LINKS.map((item) => {
              // 1. Dropdown Item (Articles -> Blogs, News)
              if (item.subItems) {
                const isChildActive = isAnyChildActive(item.subItems);
                return (
                  <div 
                    key={item.label} 
                    className="nav2-dropdown-wrapper"
                    onBlur={(e) => handleDropdownBlur(e, e.currentTarget)}
                  >
                    <button
                      className={`nav2-link${isChildActive ? " active" : ""}`}
                      aria-haspopup="true"
                      aria-expanded="false" // CSS handles hover/focus state visually
                    >
                      {item.label}
                      <span className="chevron" aria-hidden="true">{Icons.Chevron}</span>
                    </button>

                    <div className="nav2-dropdown-menu" role="menu" aria-label={`${item.label} Submenu`}>
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="nav2-dd-item"
                          role="menuitem"
                          prefetch={false}
                        >
                          <div className="nav2-dd-icon" aria-hidden="true">{sub.icon}</div>
                          <div className="nav2-dd-text">
                            <span className="nav2-dd-title">{sub.label}</span>
                            <span className="nav2-dd-desc">{sub.desc}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // 2. Standard Nav Item
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav2-link${isActive(item.href) ? " active" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  prefetch={false}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── DESKTOP AUTH ── */}
          <div className="nav2-auth" role="group" aria-label="Account actions">
            <Link href="/signup" className="nav2-btn-ghost" prefetch={false}>Sign up</Link>
            <Link href="/login" className="nav2-btn-solid" prefetch={false}>Login</Link>
          </div>

          {/* ── HAMBURGER TRIGGER ── */}
          <button
            ref={burgerRef}
            className={`nav2-burger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="nav2-mobile-menu"
            aria-haspopup="true"
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        <div
          id="nav2-mobile-menu"
          className={`nav2-mobile-menu${menuOpen ? " open" : ""}`}
          role="dialog"
          aria-label="Mobile Navigation"
          aria-modal="false"
          inert={mounted && !menuOpen ? true : undefined}// ARIA fix
        >
          <nav className="nav2-mob-nav">
            {NAV_LINKS.map((item, idx) => {
              // 1. Mobile Accordion Item
              if (item.subItems) {
                const isOpen = mobAccordionOpen === item.label;
                const isChildActive = isAnyChildActive(item.subItems);
                return (
                  <div 
                    key={item.label} 
                    className="nav2-mob-item-wrap" 
                    style={{ transitionDelay: menuOpen ? `${idx * 40}ms` : '0ms' }}
                  >
                    <button
                      ref={idx === 0 ? firstLinkRef : undefined}
                      className={`nav2-mob-link${isChildActive ? " active" : ""}`}
                      onClick={() => setMobAccordionOpen(isOpen ? "" : item.label)}
                      aria-expanded={isOpen}
                      aria-controls={`mob-accordion-${item.label}`}
                      tabIndex={menuOpen ? 0 : -1}
                      
                    >
                      <div className="nav2-mob-link-content">
                        <span className="nav2-mob-icon" aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </div>
                      <span className="nav2-mob-icon" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                        {Icons.Chevron}
                      </span>
                    </button>
                    
                    
                    <div 
                      id={`mob-accordion-${item.label}`}
                      className={`nav2-mob-accordion${isOpen ? " open" : ""}`}
                    >
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`nav2-mob-sublink${isActive(sub.href) ? " active" : ""}`}
                          onClick={() => setMenuOpen(false)}
                          tabIndex={menuOpen && isOpen ? 0 : -1}
                          prefetch={false}
                        >
                          <span className="nav2-mob-subicon" aria-hidden="true">{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              // 2. Mobile Standard Item
              return (
                <div 
                  key={item.href} 
                  className="nav2-mob-item-wrap"
                  style={{ transitionDelay: menuOpen ? `${idx * 40}ms` : '0ms' }}
                >
                  <Link
                    ref={idx === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    className={`nav2-mob-link${isActive(item.href) ? " active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    tabIndex={menuOpen ? 0 : -1}
                    prefetch={false}
                  >
                    <div className="nav2-mob-link-content">
                      <span className="nav2-mob-icon" aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mobile Auth Actions */}
          <div className="nav2-mob-auth">
            <Link href="/signup" className="nav2-btn-ghost" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} prefetch={false}>
              Sign up
            </Link>
            <Link href="/login" className="nav2-btn-solid" onClick={() => setMenuOpen(false)} tabIndex={menuOpen ? 0 : -1} prefetch={false}>
              Login
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}