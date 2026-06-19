"use client";
// app/user/wallet/page.jsx — Premium Wallet Overview
//
// Enhancements:
//   - Mobile-first responsive design (320px–ultrawide)
//   - Clean flat card design — no 3D transforms, no heavy shadows
//   - Copy TXN numbers to clipboard
//   - Colored amount indicators with arrows
//   - Refined transaction cards with icon indicators
//   - Safe area support for notched devices
//   - Static-friendly — no SSR, no server components
//   - FIXED: Transaction card overflow on all devices

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Transaction Type Config ────────────────────────────────────────────────
const TXN_TYPE_CONFIG = {
  deposit:   { label: "Deposit",   icon: "📥", bg: "rgba(22,163,74,0.08)",  color: "#15803d", border: "rgba(22,163,74,0.15)" },
  withdraw:  { label: "Withdraw",  icon: "📤", bg: "rgba(220,38,38,0.08)",  color: "#b91c1c", border: "rgba(220,38,38,0.15)" },
  referral:  { label: "Referral",  icon: "🎁", bg: "rgba(217,119,6,0.08)",  color: "#92400e", border: "rgba(217,119,6,0.15)" },
  mining:    { label: "Mining",    icon: "⛏️", bg: "rgba(37,99,235,0.08)",  color: "#1e40af", border: "rgba(37,99,235,0.15)" },
  purchase:  { label: "Purchase",  icon: "🛍️", bg: "rgba(147,51,234,0.08)", color: "#7c3aed", border: "rgba(147,51,234,0.15)" },
  reward:    { label: "Reward",    icon: "🏆", bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.15)" },
  transfer:  { label: "Transfer",  icon: "💸", bg: "rgba(71,85,105,0.08)",  color: "#475569", border: "rgba(71,85,105,0.15)" },
};

function getTxnConfig(type) {
  const key = type?.toLowerCase();
  return TXN_TYPE_CONFIG[key] || { label: type || "Unknown", icon: "📌", bg: "rgba(100,116,139,0.06)", color: "#64748b", border: "rgba(100,116,139,0.12)" };
}

// ── Transaction Card ───────────────────────────────────────────────────────
function TransactionCard({ txn }) {
  const [copied, setCopied] = useState(false);
  const config = getTxnConfig(txn.txn_type);
  const isIncoming = txn.direction?.toLowerCase() === "in";

  const handleCopy = () => {
    navigator.clipboard.writeText(txn.txn_no).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="wo-txn-card" role="listitem">
      {/* Top row: Icon + Type + TXN number + Amount */}
      <div className="wo-txn-top">
        <div className="wo-txn-icon" style={{ background: config.bg, color: config.color }}>
          {config.icon}
        </div>
        <div className="wo-txn-info">
          <div className="wo-txn-type" style={{ color: config.color }}>{config.label}</div>
          <button className="wo-txn-number" onClick={handleCopy} title="Click to copy TXN number">
            {copied ? "✓ Copied!" : txn.txn_no}
          </button>
        </div>
        <div className={`wo-txn-amount ${isIncoming ? "wo-amount-in" : "wo-amount-out"}`}>
          <span className="wo-amount-arrow">{isIncoming ? "+" : "−"}</span>
          <span className="wo-amount-value">{Number(txn.amount).toLocaleString()}</span>
        </div>
      </div>

      {/* Bottom row: Details */}
      <div className="wo-txn-bottom">
        <div className="wo-txn-detail">
          <span className="wo-txn-label">Direction</span>
          <span className={`wo-txn-badge ${isIncoming ? "wo-badge-in" : "wo-badge-out"}`}>
            {isIncoming ? "In" : "Out"}
          </span>
        </div>
        {txn.note && (
          <div className="wo-txn-detail">
            <span className="wo-txn-label">Note</span>
            <span className="wo-txn-note" title={txn.note}>{txn.note}</span>
          </div>
        )}
        <div className="wo-txn-detail">
          <span className="wo-txn-label">Balance</span>
          <span className="wo-txn-balance">{Number(txn.balance_after).toLocaleString()}</span>
        </div>
        <div className="wo-txn-date">
          {new Date(txn.created_at).toLocaleString(undefined, {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Wallet Overview ───────────────────────────────────────────────────
export default function WalletOverview() {
  const [loading, setLoading] = useState(true);
  const [txnLoading, setTxnLoading] = useState(true);
  const [coins, setCoins] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    (async () => {
      setMsg(""); setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) { setMsg("Not logged in."); setLoading(false); return; }

      const { data, error } = await supabase
        .from("users_profiles")
        .select("total_aidla_coins")
        .eq("user_id", userId)
        .single();

      if (error) setMsg(error.message);
      else setCoins(data?.total_aidla_coins ?? 0);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setTxnLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) { setTxnLoading(false); return; }

      const { data, error } = await supabase
        .from("users_transactions")
        .select("txn_no, txn_type, direction, amount, balance_after, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) console.error("Transaction error:", error);
      else setTransactions(data || []);
      setTxnLoading(false);
    })();
  }, []);

  useEffect(() => {
    let filtered = transactions;
    if (filterType !== "all") {
      filtered = filtered.filter(t => t.txn_type?.toLowerCase() === filterType.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.txn_no?.toLowerCase().includes(query) ||
        t.txn_type?.toLowerCase().includes(query) ||
        t.direction?.toLowerCase().includes(query) ||
        t.note?.toLowerCase().includes(query)
      );
    }
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterType]);

  const txnTypes = [...new Set(transactions.map(t => t.txn_type).filter(Boolean))];

  return (
    <div className="wo-root">
      <style>{CSS}</style>

      {/* Balance Card */}
      <div className="wo-balance-card" role="region" aria-label="Wallet balance">
        <div className="wo-balance-inner">
          <div className="wo-balance-top">
            <span className="wo-balance-icon" aria-hidden="true">💎</span>
            <span className="wo-balance-label">Total Balance</span>
          </div>
          <div className="wo-balance-amount" aria-live="polite">
            {loading ? (
              <span className="wo-balance-loading">Loading…</span>
            ) : (
              <>
                <span className="wo-balance-value">{Number(coins || 0).toLocaleString()}</span>
                <span className="wo-balance-currency">AIDLA</span>
              </>
            )}
          </div>
          {msg && (
            <div className="wo-balance-error" role="alert">{msg}</div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="wo-section">
        <div className="wo-section-header">
          <h2 className="wo-section-title">Latest Transactions</h2>
          <Link href="/user/wallet/transactions" className="wo-see-all">
            See All →
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="wo-filters">
          <div className="wo-search-wrap">
            <span className="wo-search-icon" aria-hidden="true">🔍</span>
            <label htmlFor="txn-search" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
              Search transactions
            </label>
            <input
              id="txn-search"
              type="search"
              className="wo-search-input"
              placeholder="Search by TXN number, type, or note…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <label htmlFor="txn-filter" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
            Filter by type
          </label>
          <select
            id="txn-filter"
            className="wo-filter-select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {txnTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Transactions Grid */}
        {txnLoading ? (
          <div className="wo-loading" aria-live="polite">
            <div className="wo-spinner" aria-hidden="true" />
            <span>Loading transactions…</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="wo-empty">
            <div className="wo-empty-icon" aria-hidden="true">📭</div>
            <p>{searchQuery || filterType !== "all" ? "No matching transactions" : "No transactions yet"}</p>
          </div>
        ) : (
          <div className="wo-txn-grid" role="list" aria-label="Transaction list">
            {filteredTransactions.slice(0, 4).map(txn => (
              <TransactionCard key={txn.txn_no} txn={txn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CSS (performance optimized, mobile-first, overflow fixed) ──────────────
const CSS = `
  .wo-root {
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    min-width: 0;
  }

  /* ── Balance Card ── */
  .wo-balance-card {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(30,58,138,0.12), 0 1px 3px rgba(15,23,42,0.06);
  }
  .wo-balance-inner {
    padding: clamp(20px, 5vw, 28px);
  }
  .wo-balance-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .wo-balance-icon {
    font-size: 1.2rem;
    line-height: 1;
  }
  .wo-balance-label {
    font-size: clamp(0.72rem, 2vw, 0.8rem);
    font-weight: 700;
    color: rgba(255,255,255,0.8);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .wo-balance-amount {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }
  .wo-balance-value {
    font-size: clamp(1.8rem, 6vw, 2.6rem);
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .wo-balance-currency {
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .wo-balance-loading {
    font-size: 1.4rem;
    color: rgba(255,255,255,0.6);
    font-weight: 600;
  }
  .wo-balance-error {
    margin-top: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(239,68,68,0.2);
    color: #fecaca;
    font-size: 0.78rem;
    font-weight: 600;
  }

  /* ── Section ── */
  .wo-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .wo-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .wo-section-title {
    font-size: clamp(1rem, 3vw, 1.2rem);
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.2px;
  }
  .wo-see-all {
    font-size: clamp(0.78rem, 1.5vw, 0.84rem);
    color: #3b82f6;
    text-decoration: none;
    font-weight: 700;
    transition: opacity 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .wo-see-all:hover {
    opacity: 0.75;
  }

  /* ── Filters ── */
  .wo-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .wo-search-wrap {
    flex: 1;
    min-width: 150px;
    position: relative;
    display: flex;
    align-items: center;
  }
  .wo-search-icon {
    position: absolute;
    left: 12px;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 1;
  }
  .wo-search-input {
    width: 100%;
    padding: 9px 14px 9px 36px;
    border-radius: 12px;
    border: 1.5px solid rgba(15,23,42,0.1);
    background: #f8fafc;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 500;
    color: #0f172a;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    outline: none;
    box-sizing: border-box;
  }
  .wo-search-input:focus {
    border-color: rgba(59,130,246,0.35);
    background: #ffffff;
  }
  .wo-filter-select {
    padding: 9px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(15,23,42,0.1);
    background: #f8fafc;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    outline: none;
    min-width: 120px;
    flex-shrink: 0;
  }
  .wo-filter-select:focus {
    border-color: rgba(59,130,246,0.35);
    background: #ffffff;
  }

  /* ── Transaction Grid ── */
  .wo-txn-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    min-width: 0;
  }

  /* ── Transaction Card ── */
  .wo-txn-card {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.03);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
  }
  .wo-txn-card:hover {
    border-color: rgba(59,130,246,0.15);
    box-shadow: 0 2px 8px rgba(15,23,42,0.05);
  }

  /* Top row */
  .wo-txn-top {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
  }
  .wo-txn-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .wo-txn-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .wo-txn-type {
    font-weight: 700;
    font-size: 0.84rem;
    margin-bottom: 2px;
  }
  .wo-txn-number {
    font-size: 0.68rem;
    color: #94a3b8;
    font-weight: 500;
    font-family: 'Courier New', Consolas, monospace;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
    transition: color 0.15s ease;
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .wo-txn-number:hover {
    color: #3b82f6;
  }
  .wo-txn-amount {
    font-size: 0.95rem;
    font-weight: 700;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }
  .wo-amount-in {
    color: #15803d;
  }
  .wo-amount-out {
    color: #b91c1c;
  }
  .wo-amount-arrow {
    font-size: 0.75rem;
  }
  .wo-amount-value {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
  }

  /* Bottom row */
  .wo-txn-bottom {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 10px;
    border-top: 1px solid rgba(15,23,42,0.05);
    min-width: 0;
  }
  .wo-txn-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .wo-txn-label {
    font-size: 0.74rem;
    color: #94a3b8;
    font-weight: 600;
    flex-shrink: 0;
  }
  .wo-txn-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  .wo-badge-in {
    background: rgba(22,163,74,0.08);
    color: #15803d;
  }
  .wo-badge-out {
    background: rgba(220,38,38,0.08);
    color: #b91c1c;
  }
  .wo-txn-note {
    font-size: 0.78rem;
    color: #475569;
    font-weight: 500;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 65%;
  }
  .wo-txn-balance {
    font-size: 0.78rem;
    color: #0f172a;
    font-weight: 700;
    flex-shrink: 0;
  }
  .wo-txn-date {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 500;
    text-align: right;
    margin-top: 2px;
  }

  /* ── Loading / Empty ── */
  .wo-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 24px;
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 600;
  }
  .wo-spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(59,130,246,0.12);
    border-top-color: #3b82f6;
    animation: woSpin 0.7s linear infinite;
  }
  @keyframes woSpin {
    to { transform: rotate(360deg); }
  }
  .wo-empty {
    text-align: center;
    padding: 28px 16px;
    color: #94a3b8;
    font-size: 0.84rem;
    font-weight: 600;
  }
  .wo-empty-icon {
    font-size: 34px;
    margin-bottom: 6px;
  }

  /* ── Mobile-first responsive breakpoints ── */
  @media (min-width: 480px) {
    .wo-txn-card {
      padding: 16px;
    }
  }
  @media (min-width: 640px) {
    .wo-root {
      gap: 24px;
    }
    .wo-txn-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .wo-filters {
      flex-wrap: nowrap;
    }
    .wo-txn-number {
      font-size: 0.7rem;
    }
  }
  @media (min-width: 900px) {
    .wo-txn-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .wo-balance-card {
      border-radius: 20px;
    }
  }
  @media (min-width: 1100px) {
    .wo-txn-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (max-width: 480px) {
    .wo-filters {
      flex-direction: column;
    }
    .wo-filter-select {
      width: 100%;
    }
    .wo-txn-amount {
      font-size: 0.85rem;
    }
  }

  /* Safe area */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .wo-root {
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
`;