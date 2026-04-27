"use client";
// app/user/wallet/layout.jsx
// Converted from React Router Wallet.jsx
//
// Changes:
//   1. "use client" directive
//   2. NavLink + Outlet (react-router-dom) → Link + usePathname (next/navigation)
//   3. <Outlet /> → {children}
//   4. Tab active state via usePathname() instead of NavLink isActive

import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({ href, label, exact }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={isActive ? "tab-3d active" : "tab-3d"}>
      {label}
    </Link>
  );
}

const CSS = `
  *{box-sizing:border-box}
  .wallet-wrapper{animation:fadeIn .2s cubic-bezier(.16,1,.3,1) forwards;font-family:'Inter',system-ui,-apple-system,sans-serif}
  .wallet-header{margin-bottom:25px}
  .wallet-title{font-size:2.2rem;font-weight:900;letter-spacing:-1px;color:#1e3a8a;margin:0;text-shadow:2px 2px 4px rgba(30,58,138,.1)}
  .wallet-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:25px;background:rgba(255,255,255,.5);padding:8px;border-radius:18px;box-shadow:inset 2px 2px 5px rgba(15,23,42,.02)}
  .tab-3d{display:flex;align-items:center;justify-content:center;text-align:center;padding:12px 15px;border-radius:12px;text-decoration:none;font-weight:700;font-size:.9rem;color:#64748b;background:#f8fafc;box-shadow:4px 4px 8px rgba(15,23,42,.05),-4px -4px 8px rgba(255,255,255,1);transition:all .2s ease;white-space:nowrap;user-select:none}
  .tab-3d:hover{color:#1e3a8a;transform:translateY(-2px)}
  .tab-3d:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
  .tab-3d.active{background:#e0e7ff;color:#1e3a8a;font-weight:800;box-shadow:inset 3px 3px 6px rgba(15,23,42,.08),inset -3px -3px 6px rgba(255,255,255,1);transform:translateY(1px)}
  .outlet-container{position:relative;animation:fadeIn .3s ease forwards}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @media(max-width:768px){.wallet-tabs{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:600px){.wallet-header{flex-direction:column;align-items:stretch;text-align:center;gap:15px}.wallet-tabs{grid-template-columns:repeat(2,1fr);gap:8px;padding:5px}.tab-3d{padding:10px;font-size:.85rem}}
`;

export default function WalletLayout({ children }) {
  return (
    <div className="wallet-wrapper">
      <style>{CSS}</style>

      <div className="wallet-header">
        <h1 className="wallet-title">My Wallet</h1>
      </div>

      <nav className="wallet-tabs" aria-label="Wallet sections">
        <Tab href="/user/wallet"              label="Overview"     exact />
        <Tab href="/user/wallet/transactions" label="Transactions"       />
        <Tab href="/user/wallet/withdraw"     label="Withdraw"          />
        <Tab href="/user/wallet/invite"       label="Invite"            />
      </nav>

      <div className="outlet-container">
        {children}  {/* ← replaces <Outlet /> */}
      </div>
    </div>
  );
}