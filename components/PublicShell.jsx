"use client";
// components/PublicShell.jsx
// Reads the current pathname and decides whether to render
// the public header and footer.
//
// Rules:
//   /user/*  → no public header/footer  (UserLayout has its own)
//   /admin/* → no public header/footer  (AdminLayout has its own)
//   everything else → show public header + footer
//
// This replaces the old React Router logic in App.jsx:
//   const hidePublicHeader = location.pathname.startsWith("/user") ||
//                            location.pathname.startsWith("/admin");

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PublicHeader from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingAssistant from "@/components/FloatingAssistant";

const HIDE_PUBLIC_CHROME = ["/user", "/admin"];
const HIDE_ASSISTANT = ["/login", "/signup", "/forgot-password", "/reset-password"];
const WIZARD_PAGES = ["/cover-letter", "/cv-builder"];

function FloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) { setIsOpen(false); } else { setShowGreeting(false); setIsOpen(true); }
  };

  return (
    <>
      <style>{FAB_CSS}</style>
      <div className="gcfab-wrap">
        {showGreeting && !dismissed && !isOpen && (
          <div className="gcfab-greeting" onClick={e => e.stopPropagation()}>
            <button
              className="gcfab-greeting-close"
              onClick={() => { setDismissed(true); setShowGreeting(false); }}
              aria-label="Dismiss"
            >×</button>
            <div className="gcfab-greeting-title">Need help? 👋</div>
            <div className="gcfab-greeting-sub">How may I help you?</div>
            <button
              className="gcfab-greeting-cta"
              onClick={() => { setShowGreeting(false); setIsOpen(true); }}
            >Start a conversation →</button>
            <div className="gcfab-greeting-arrow" aria-hidden="true" />
          </div>
        )}
        <button
          className={`gcfab-btn${isOpen ? " gcfab-btn-open" : ""}`}
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
      <FloatingAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

const FAB_CSS = `
  .gcfab-wrap {
    position: fixed; bottom: 28px; right: 24px; z-index: 9997;
    display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
  }
  .gcfab-btn {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #1a3a8f, #3b82f6);
    border: none;
    box-shadow: 0 4px 20px rgba(59,130,246,0.4), 0 2px 8px rgba(15,23,42,0.12);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #fff;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  }
  .gcfab-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(59,130,246,0.5), 0 2px 8px rgba(15,23,42,0.14);
  }
  .gcfab-btn:active { transform: scale(0.96); }
  .gcfab-btn-open {
    background: linear-gradient(135deg, #334155, #475569);
    box-shadow: 0 4px 16px rgba(15,23,42,0.25);
  }
  .gcfab-greeting {
    background: #fff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 16px;
    padding: 16px 18px 14px;
    box-shadow: 0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06);
    max-width: 240px;
    position: relative;
    animation: gcfabGreetIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes gcfabGreetIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .gcfab-greeting-arrow {
    position: absolute; bottom: -7px; right: 22px;
    width: 14px; height: 14px; background: #fff;
    border-right: 1px solid rgba(15,23,42,0.08);
    border-bottom: 1px solid rgba(15,23,42,0.08);
    transform: rotate(45deg);
  }
  .gcfab-greeting-close {
    position: absolute; top: 8px; right: 10px;
    background: none; border: none; font-size: 16px; color: #94a3b8;
    cursor: pointer; line-height: 1; padding: 2px 4px; border-radius: 4px;
    transition: color 0.15s ease;
  }
  .gcfab-greeting-close:hover { color: #475569; }
  .gcfab-greeting-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
  .gcfab-greeting-sub { font-size: 0.8rem; color: #64748b; font-weight: 500; line-height: 1.45; margin-bottom: 12px; }
  .gcfab-greeting-cta {
    display: block; width: 100%; padding: 8px 12px;
    background: linear-gradient(135deg, #1a3a8f, #3b82f6);
    color: #fff; border: none; border-radius: 10px;
    font-size: 0.78rem; font-weight: 700; cursor: pointer;
    transition: filter 0.15s ease; font-family: inherit;
  }
  .gcfab-greeting-cta:hover { filter: brightness(1.1); }
  @media (max-width: 640px) {
    .gcfab-wrap { bottom: 18px; right: 16px; }
    .gcfab-btn  { width: 50px; height: 50px; }
    .gcfab-greeting { max-width: 210px; }
  }
`;

export default function PublicShell({ children }) {
  const pathname = usePathname();

  const hideChrome    = HIDE_PUBLIC_CHROME.some(p => pathname.startsWith(p));
  const hideAssistant = HIDE_ASSISTANT.some(p => pathname.startsWith(p));
  const isWizard      = WIZARD_PAGES.some(p => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  if (isWizard) {
    return (
      <>
        <PublicHeader />
        {children}
        {!hideAssistant && <FloatingTrigger />}
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <Footer />
      {!hideAssistant && <FloatingTrigger />}
    </>
  );
}