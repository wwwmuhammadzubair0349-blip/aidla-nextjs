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
import { useState } from "react";
import PublicHeader from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingAssistant from "@/components/FloatingAssistant";

const HIDE_PUBLIC_CHROME = ["/user", "/admin"];
const HIDE_ASSISTANT = ["/login", "/signup", "/forgot-password", "/reset-password"];
const WIZARD_PAGES = ["/cover-letter", "/cv-builder"];

function FloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AIDLA Bot"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9997,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#f59e0b,#d97706)",
          border: "none",
          boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          transition: "transform 0.2s,box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(245,158,11,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,0.4)"; }}
      >
        🤖
      </button>
      <FloatingAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

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