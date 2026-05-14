"use client";
// app/admin/layout.jsx
// Converted from React Router AdminLayout.jsx
//
// Changes:
//   1. "use client" directive
//   2. import { Outlet } removed → uses {children} prop instead
//   3. useNavigate → useRouter from next/navigation
//   4. NavLink → Link from next/link (active state via usePathname)
//   5. ProtectedRoute removed → middleware.js handles auth at edge
//   6. useAuth hook for logout + admin check

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// ── Tab component (NavLink → Link + usePathname) ──
function Tab({ to, label }) {
  const pathname = usePathname();
  const isActive = pathname === to || (to !== "/admin" && pathname.startsWith(to));
  return (
    <Link href={to} className={isActive ? "tab-3d active" : "tab-3d"}>
      {label}
    </Link>
  );
}

const ADMIN_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .admin-layout-wrapper {
    min-height: 100vh;
    background: #f0f4f8;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    overflow-x: hidden;
    position: relative;
  }

  .bg-orb {
    position: fixed; border-radius: 50%; filter: blur(90px);
    z-index: 0; animation: float 20s infinite alternate ease-in-out;
    pointer-events: none;
  }
  .orb-1 { width: 500px; height: 500px; background: rgba(30,58,138,0.12); top: -150px; left: -150px; }
  .orb-2 { width: 400px; height: 400px; background: rgba(59,130,246,0.12); bottom: -100px; right: -100px; animation-duration: 25s; }
  @keyframes float {
    0%   { transform: translate(0,0) scale(1); }
    100% { transform: translate(50px,50px) scale(1.1); }
  }

  .admin-header-2060 {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,1);
    box-shadow: 0 10px 30px rgba(15,23,42,0.05);
    padding: 15px 20px 0 20px;
  }

  .header-top {
    max-width: 1400px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    gap: 15px; flex-wrap: wrap; padding-bottom: 15px;
  }

  .brand-title {
    font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    filter: drop-shadow(2px 2px 4px rgba(30,58,138,0.15));
    display: flex; align-items: center; gap: 8px; margin: 0;
  }
  .brand-title span {
    font-weight: 500; color: #64748b; -webkit-text-fill-color: #64748b; font-size: 1.4rem;
  }

  .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .action-btn-3d {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 16px; background: #f8fafc; color: #1e3a8a;
    font-weight: 700; font-size: 0.85rem; border: none; border-radius: 12px;
    box-shadow: 4px 4px 10px rgba(15,23,42,0.06), -4px -4px 10px rgba(255,255,255,1);
    transition: all 0.2s ease; cursor: pointer;
  }
  .action-btn-3d:hover { color: #3b82f6; transform: translateY(-2px); box-shadow: 6px 6px 12px rgba(15,23,42,0.08), -6px -6px 12px rgba(255,255,255,1); }
  .action-btn-3d:active { transform: translateY(1px); box-shadow: inset 2px 2px 5px rgba(15,23,42,0.06), inset -2px -2px 5px rgba(255,255,255,1); }
  .action-btn-3d svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.5; fill: none; }
  .action-btn-3d:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

  .btn-logout { color: #ef4444; }
  .btn-logout:hover { color: #dc2626; }

  .tabs-wrapper { max-width: 1400px; margin: 0 auto; padding: 5px 0 15px 0; }
  .tabs-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }

  .tab-3d {
    padding: 10px 16px; border-radius: 12px; text-decoration: none;
    font-weight: 600; font-size: 0.9rem; color: #64748b; background: #f1f5f9;
    box-shadow: 4px 4px 8px rgba(15,23,42,0.05), -4px -4px 8px rgba(255,255,255,1);
    transition: all 0.2s ease; white-space: nowrap;
  }
  .tab-3d:hover { color: #1e3a8a; transform: translateY(-1px); }
  .tab-3d.active {
    background: #e0e7ff; color: #1e3a8a; font-weight: 800;
    box-shadow: inset 3px 3px 6px rgba(15,23,42,0.08), inset -3px -3px 6px rgba(255,255,255,1);
    transform: translateY(1px);
  }
  .tab-3d:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; }

  .admin-main {
    position: relative; z-index: 10;
    max-width: 1400px; margin: 0 auto; padding: 30px 20px;
  }

  .outlet-card-2060 {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,1); border-radius: 24px; padding: 30px;
    box-shadow:
      15px 15px 40px rgba(15,23,42,0.05),
      -15px -15px 40px rgba(255,255,255,0.8),
      inset 0 0 0 1px rgba(255,255,255,0.5);
    animation: popIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes popIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Auth loading */
  .auth-loading {
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(160deg,#f0f4ff 0%,#fffbf0 60%,#e8f4fd 100%);
    z-index: 9999;
  }
  .auth-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid rgba(26,58,143,0.12);
    border-top-color: #1a3a8f;
    animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .header-top { justify-content: center; text-align: center; gap: 12px; }
    .header-actions { justify-content: center; width: 100%; gap: 8px; }
    .action-btn-3d { padding: 8px 12px; font-size: 0.75rem; }
    .action-btn-3d svg { width: 12px; height: 12px; }
    .tabs-container { gap: 8px; }
    .tab-3d { padding: 8px 12px; font-size: 0.8rem; }
    .admin-main { padding: 20px 10px; }
    .outlet-card-2060 { padding: 15px; border-radius: 18px; }
  }
`;

export default function AdminLayout({ children }) {
  const router  = useRouter();
  const { user, loading, logout } = useAuth({ requireAdmin: true });

  function goBack() {
    router.back();
  }

  function switchToUser() {
    router.push("/user");
  }

  // Show spinner while auth check runs
  if (loading) {
    return (
      <>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}.auth-loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#f0f4ff 0%,#fffbf0 60%,#e8f4fd 100%);z-index:9999}.auth-spinner{width:40px;height:40px;border-radius:50%;border:3px solid rgba(26,58,143,0.12);border-top-color:#1a3a8f;animation:spin .65s linear infinite}`}</style>
        <div className="auth-loading"><div className="auth-spinner" /></div>
      </>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <style>{ADMIN_CSS}</style>

      <div className="bg-orb orb-1" aria-hidden="true"/>
      <div className="bg-orb orb-2" aria-hidden="true"/>

      <header className="admin-header-2060">
        <div className="header-top">
          <h1 className="brand-title">
            AIDLA <span>Admin</span>
          </h1>

          <div className="header-actions">
            <button onClick={goBack} className="action-btn-3d" aria-label="Go back">
              <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <button onClick={switchToUser} className="action-btn-3d" aria-label="Switch to user area">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Switch to User
            </button>
            <button onClick={logout} className="action-btn-3d btn-logout" aria-label="Logout">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs nav */}
        <div className="tabs-wrapper">
          <nav className="tabs-container" aria-label="Admin navigation">
            <Tab to="/admin"                      label="Admin Pool"        />
            <Tab to="/admin/tests"                label="Test Mgmt"         />
            <Tab to="/admin/lucky-wheel"          label="Lucky Wheel"       />
            <Tab to="/admin/lucky-draw"           label="Lucky Draw"        />
            <Tab to="/admin/shop"                 label="Shop"              />
            <Tab to="/admin/blogs"                label="Blogs"             />
            <Tab to="/admin/news"                 label="News"              />
            <Tab to="/admin/mining"               label="Mining"            />
            <Tab to="/admin/invite"               label="Invite Friend"     />
            <Tab to="/admin/courses"              label="Courses"           />
            <Tab to="/admin/deposits"             label="Deposits"          />
            <Tab to="/admin/withdraws"            label="Withdraws"         />
            <Tab to="/admin/users"                label="Users"             />
            <Tab to="/admin/leaderboard"          label="Leaderboard"       />
            <Tab to="/admin/homepage"             label="Post Generator"    />
            <Tab to="/admin/AdminHome"            label="AdminHome"         />
            <Tab to="/admin/adminfaqs"            label="FAQs"              />
            <Tab to="/admin/FeedAdmin"            label="Forum Admin"       />
            <Tab to="/admin/AdminStudyMaterials"  label="Study Materials"   />
            <Tab to="/admin/AutoBlogTab"          label="Auto Blog"         />
            <Tab to="/admin/AutoNewsTab"          label="Auto News"         />
            <Tab to="/admin/dailyquizz"           label="Daily Quiz"        />
            <Tab to="/admin/battle"               label="Battle Arena"      />
            <Tab to="/admin/AdminProjects"             label="Projects"          />
            <Tab to="/admin/reviews"                  label="Reviews"           />
            <Tab to="/admin/email-blast"              label="Email Blast"       />
          </nav>
        </div>
      </header>

      <main className="admin-main">
        <div className="outlet-card-2060">
          {children}   {/* ← replaces <Outlet /> */}
        </div>
      </main>
    </div>
  );
}
