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
import PublicHeader from "@/components/Navbar"; // your existing header
import Footer from "@/components/Footer";             // your existing footer

const HIDE_PUBLIC_CHROME  = ["/user", "/admin"];
// Wizard pages need the nav but not a <main> container or footer
const WIZARD_PAGES = ["/cover-letter", "/cv-builder"];

export default function PublicShell({ children }) {
  const pathname = usePathname();

  const hideChrome = HIDE_PUBLIC_CHROME.some(p => pathname.startsWith(p));
  const isWizard   = WIZARD_PAGES.some(p => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  if (isWizard) {
    // Show navbar but let the wizard's root div fill the full viewport
    return (
      <>
        <PublicHeader />
        {children}
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}