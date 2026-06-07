"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const NAV_GROUPS = [
  {
    title: "Control",
    items: [
      ["/admin", "Dashboard"],
      ["/admin/users", "Users"],
      ["/admin/leaderboard", "Leaderboard"],
    ],
  },
  {
    title: "Finance",
    items: [
      ["/admin/withdraws", "Withdrawals"],
      ["/admin/deposits", "Deposits"],
      ["/admin/mining", "Mining"],
      ["/admin/invite", "Invite Rewards"],
    ],
  },
  {
    title: "Commerce",
    items: [
      ["/admin/shop", "Shop"],
      ["/admin/lucky-wheel", "Lucky Wheel"],
      ["/admin/lucky-draw", "Lucky Draw"],
    ],
  },
  {
    title: "Articles",
    items: [
      ["/admin/blogs", "Blogs"],
      ["/admin/news", "News"],
      ["/admin/homepage", "Post Generator"],
      ["/admin/AutoBlogTab", "Auto Blog"],
      ["/admin/AutoNewsTab", "Auto News"],
    ],
  },
  {
    title: "Learning",
    items: [
      ["/admin/courses", "Courses"],
      ["/admin/tests", "Tests"],
      ["/admin/dailyquizz", "Daily Quiz"],
      ["/admin/battle", "Battle Arena"],
      ["/admin/AdminStudyMaterials", "Study Materials"],
      ["/admin/AdminProjects", "Projects"],
    ],
  },
  {
    title: "Community",
    items: [
      ["/admin/FeedAdmin", "Forum"],
      ["/admin/adminfaqs", "FAQs"],
      ["/admin/reviews", "Reviews"],
      ["/admin/email-blast", "Email Blast"],
      ["/admin/AdminHome", "Admin Home"],
    ],
  },
];

function isActivePath(pathname, to) {
  return pathname === to || (to !== "/admin" && pathname.startsWith(to));
}

function NavLinkItem({ to, label, onClick }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, to);
  return (
    <Link href={to} onClick={onClick} className={active ? "adm-link active" : "adm-link"}>
      <span>{label}</span>
    </Link>
  );
}

const CSS = `
*{box-sizing:border-box}
.admin-shell{min-height:100vh;background:#f6f8fc;color:#111827;font-family:Inter,system-ui,-apple-system,sans-serif}
.admin-shell:before{content:"";position:fixed;inset:0;pointer-events:none;background:linear-gradient(135deg,rgba(30,58,138,.06),transparent 35%),radial-gradient(circle at 92% 8%,rgba(212,175,55,.10),transparent 28%);z-index:0}
.adm-sidebar{position:fixed;inset:0 auto 0 0;width:286px;background:linear-gradient(180deg,#fff,#f8fbff);color:#102044;z-index:80;display:flex;flex-direction:column;border-right:1px solid #dbe5f3;box-shadow:18px 0 44px rgba(30,58,138,.10)}
.adm-brand{padding:22px 20px 18px;border-bottom:1px solid #e5edf7}
.adm-brand h1{margin:0;font-size:24px;letter-spacing:-.05em;line-height:1;color:#1e3a8a;font-weight:950}
.adm-brand span{display:block;margin-top:7px;font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#9f7a13;font-weight:900}
.adm-nav{padding:14px 14px 20px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#c7d2fe transparent}
.adm-group{margin-bottom:12px}
.adm-group-title{display:block;padding:11px 10px 7px;font-size:10px;font-weight:900;color:#7b8ca7;text-transform:uppercase;letter-spacing:.14em}
.adm-link{display:flex;align-items:center;min-height:37px;padding:9px 11px;border-radius:10px;color:#4b5f7d;text-decoration:none;font-size:13px;font-weight:760;transition:background .16s ease,color .16s ease,transform .16s ease}
.adm-link:hover{background:#eef4ff;color:#1e3a8a}
.adm-link.active{background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;box-shadow:0 10px 22px rgba(30,58,138,.22)}
.adm-rail-actions{margin-top:auto;padding:14px;border-top:1px solid #e5edf7;display:grid;gap:8px}
.adm-action{width:100%;border:1px solid #dbe5f3;background:#fff;color:#1e3a8a;border-radius:10px;padding:10px 12px;font-weight:820;cursor:pointer;text-align:left}
.adm-action:hover{background:#f2f6ff}
.adm-action.danger{color:#dc2626}
.adm-main{position:relative;z-index:1;margin-left:286px;min-height:100vh}
.adm-topbar{display:none}
.adm-page-title{min-width:0}
.adm-page-title strong{display:block;font-size:18px;font-weight:900;color:#0f172a}
.adm-page-title span{display:block;font-size:12px;color:#64748b;font-weight:700;margin-top:2px}
.adm-mobile-toggle{display:none;border:0;background:#111827;color:#fff;border-radius:11px;padding:10px 12px;font-weight:900}
.adm-content{padding:22px}
.adm-card{background:#fff;border:1px solid #dfe7f2;border-radius:20px;padding:20px;box-shadow:0 18px 50px rgba(15,23,42,.07)}
.auth-loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#f5f7fb;z-index:9999}
.auth-spinner{width:40px;height:40px;border-radius:50%;border:3px solid rgba(30,58,138,.14);border-top-color:#1e3a8a;animation:spin .65s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:1080px){
  .adm-sidebar{transform:translateX(-105%);transition:transform .2s ease}
  .adm-sidebar.open{transform:translateX(0)}
  .adm-main{margin-left:0}
  .adm-mobile-toggle{display:inline-flex}
  .adm-topbar{position:sticky;top:0;z-index:50;min-height:64px;display:flex;align-items:center;gap:14px;padding:10px 12px;background:rgba(255,255,255,.86);backdrop-filter:blur(18px);border-bottom:1px solid #e2e8f0}
  .adm-content{padding:12px}
  .adm-card{padding:12px;border-radius:16px}
  .adm-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.42);z-index:70}
}
@media(max-width:520px){
  .adm-page-title strong{font-size:16px}
  .adm-sidebar{width:min(86vw,310px)}
}
@media(max-width:340px){
  .adm-content{padding:8px}
  .adm-card{padding:10px;border-radius:14px}
}
`;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, logout } = useAuth({ requireAdmin: true });
  const [open, setOpen] = useState(false);

  const active = NAV_GROUPS.flatMap(g => g.items).find(([to]) => isActivePath(pathname, to));
  const title = active?.[1] || "Dashboard";

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="auth-loading"><div className="auth-spinner" /></div>
      </>
    );
  }

  return (
    <div className="admin-shell">
      <style>{CSS}</style>
      {open && <button className="adm-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}

      <aside className={open ? "adm-sidebar open" : "adm-sidebar"}>
        <div className="adm-brand">
          <h1>AIDLA Admin</h1>
          <span>Executive Console</span>
        </div>

        <nav className="adm-nav" aria-label="Admin navigation">
          {NAV_GROUPS.map(group => (
            <section className="adm-group" key={group.title}>
              <span className="adm-group-title">{group.title}</span>
              {group.items.map(([to, label]) => (
                <NavLinkItem key={to} to={to} label={label} onClick={() => setOpen(false)} />
              ))}
            </section>
          ))}
        </nav>

        <div className="adm-rail-actions">
          <button className="adm-action" onClick={() => router.push("/user")}>Switch to User</button>
          <button className="adm-action danger" onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar">
          <button className="adm-mobile-toggle" onClick={() => setOpen(true)}>Menu</button>
          <div className="adm-page-title">
            <strong>{title}</strong>
            <span>Operations dashboard and platform controls</span>
          </div>
        </header>

        <div className="adm-content">
          <div className="adm-card">{children}</div>
        </div>
      </main>
    </div>
  );
}
