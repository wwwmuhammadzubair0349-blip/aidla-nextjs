"use client";
// app/user/wallet/transactions/page.jsx
// Converted from React Router WalletTransactions.jsx
//
// Changes:
//   1. "use client" directive
//   2. supabase import: ../../../lib/supabase → @/lib/supabase
//   3. All logic identical

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WalletTransactions() {
  const [loading,     setLoading]     = useState(true);
  const [rows,        setRows]        = useState([]);
  const [msg,         setMsg]         = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [copied,      setCopied]      = useState(null);

  useEffect(() => {
    (async () => {
      setMsg(""); setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) { setMsg("Not logged in."); setLoading(false); return; }

      const { data, error } = await supabase
        .from("users_transactions")
        .select("txn_no, txn_type, direction, amount, balance_before, balance_after, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) setMsg(error.message);
      else setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const grouped = rows.reduce((acc, row) => {
    const dateKey = new Date(row.created_at).toLocaleDateString("en-US", {
      weekday:"short", year:"numeric", month:"short", day:"numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(row);
    return acc;
  }, {});

  function copyTxn(txnNo) {
    navigator.clipboard.writeText(txnNo).then(() => {
      setCopied(txnNo);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function toggleRow(txnNo) {
    setExpandedRow(prev => prev === txnNo ? null : txnNo);
  }

  const css = `
    .transactions-wrapper{padding-bottom:20px}
    .transactions-wrapper h2{margin-top:0;font-size:1.1rem;color:#1e3a8a;font-weight:800;margin-bottom:16px}
    .txn-msg{color:#b91c1c;font-weight:600;font-size:.85rem}
    .txn-empty{color:#64748b;font-weight:600;font-size:.85rem;padding:20px 0;text-align:center}
    .txn-loading{color:#64748b;font-weight:600;font-size:.85rem;padding:20px 0;text-align:center}
    .txn-date-group{margin-bottom:18px}
    .txn-date-label{font-size:.7rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.8px;padding:6px 10px;background:#e2e8f0;border-radius:8px;margin-bottom:6px;display:inline-block}
    .txn-row-wrap{background:#fff;border-radius:12px;margin-bottom:6px;border:1px solid #e2e8f0;overflow:hidden;transition:box-shadow .2s}
    .txn-row-wrap:hover{box-shadow:0 2px 10px rgba(15,23,42,.08)}
    .txn-row-main{display:grid;grid-template-columns:1fr 1fr auto auto;align-items:center;gap:8px;padding:11px 12px;cursor:pointer;user-select:none}
    .txn-row-main:focus-visible{outline:2px solid #3b82f6;outline-offset:-2px}
    .txn-type-text{font-size:.75rem;font-weight:700;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .txn-type-sub{font-size:.62rem;color:#94a3b8;font-weight:500;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .txn-amount-col{text-align:right}
    .txn-amount{font-size:.85rem;font-weight:800;white-space:nowrap}
    .txn-balance{font-size:.65rem;color:#94a3b8;font-weight:600;text-align:right;margin-top:2px}
    .txn-balance-col{text-align:right;min-width:42px}
    .txn-balance-val{font-size:.72rem;font-weight:700;color:#475569;white-space:nowrap}
    .txn-balance-lbl{font-size:.58rem;color:#94a3b8;margin-top:2px}
    .txn-chevron{font-size:.65rem;color:#94a3b8;transition:transform .2s;margin-left:4px;flex-shrink:0;display:inline-block}
    .txn-chevron.open{transform:rotate(180deg)}
    .txn-detail{background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 14px;display:flex;flex-direction:column;gap:8px}
    .txn-detail-row{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .txn-detail-label{font-size:.65rem;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.4px;flex-shrink:0}
    .txn-detail-value{font-size:.72rem;font-weight:700;color:#334155;text-align:right;word-break:break-all;font-family:monospace}
    .txn-copy-btn{background:#e0e7ff;color:#1e3a8a;border:none;border-radius:7px;padding:4px 10px;font-size:.65rem;font-weight:800;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;font-family:inherit}
    .txn-copy-btn:hover{background:#c7d2fe}
    .txn-copy-btn.copied{background:#dcfce7;color:#15803d}
    .txn-copy-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
    .txn-detail-note{font-size:.7rem;color:#64748b;font-style:italic;font-family:inherit}
    .amount-in{color:#15803d}
    .amount-out{color:#b91c1c}
    @media(max-width:380px){.txn-row-main{gap:5px;padding:10px}.txn-type-text{font-size:.7rem}.txn-amount{font-size:.8rem}}
  `;

  return (
    <div className="transactions-wrapper">
      <style>{css}</style>
      <h2>Transactions</h2>

      {loading  && <div className="txn-loading" aria-live="polite">Loading…</div>}
      {msg      && <div className="txn-msg" role="alert">{msg}</div>}
      {!loading && !rows.length && <div className="txn-empty">No transactions yet.</div>}

      {Object.entries(grouped).map(([dateLabel, dateRows]) => (
        <div className="txn-date-group" key={dateLabel}>
          <div className="txn-date-label">📅 {dateLabel}</div>

          {dateRows.map(r => {
            const isIn      = r.direction?.toLowerCase() === "in";
            const isExpanded = expandedRow === r.txn_no;
            const timeStr   = new Date(r.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
            const fullDateTime = new Date(r.created_at).toLocaleString("en-US", {
              month:"short", day:"numeric", year:"numeric",
              hour:"2-digit", minute:"2-digit", second:"2-digit",
            });

            return (
              <div className="txn-row-wrap" key={r.txn_no}>
                <div
                  className="txn-row-main"
                  onClick={() => toggleRow(r.txn_no)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={e => e.key === "Enter" && toggleRow(r.txn_no)}
                >
                  <div>
                    <div className="txn-type-text">{r.txn_type?.replace(/_/g, " ")}</div>
                    <div className="txn-type-sub">{timeStr}</div>
                  </div>
                  <div className="txn-amount-col">
                    <div className={`txn-amount ${isIn ? "amount-in" : "amount-out"}`}>
                      {isIn ? "+" : "-"}{Number(r.amount).toLocaleString()}
                    </div>
                    <div className="txn-balance">AIDLA</div>
                  </div>
                  <div className="txn-balance-col">
                    <div className="txn-balance-val">{Number(r.balance_after).toLocaleString()}</div>
                    <div className="txn-balance-lbl">Balance</div>
                  </div>
                  <span className={`txn-chevron${isExpanded ? " open" : ""}`} aria-hidden="true">▼</span>
                </div>

                {isExpanded && (
                  <div className="txn-detail" role="region" aria-label="Transaction details">
                    <div className="txn-detail-row">
                      <span className="txn-detail-label">TXN No</span>
                      <span className="txn-detail-value">{r.txn_no}</span>
                      <button
                        className={`txn-copy-btn${copied === r.txn_no ? " copied" : ""}`}
                        onClick={e => { e.stopPropagation(); copyTxn(r.txn_no); }}
                        aria-label="Copy transaction number"
                      >
                        {copied === r.txn_no ? "✅ Copied" : "📋 Copy"}
                      </button>
                    </div>
                    <div className="txn-detail-row">
                      <span className="txn-detail-label">Date &amp; Time</span>
                      <span className="txn-detail-value" style={{ fontFamily:"inherit" }}>{fullDateTime}</span>
                    </div>
                    {r.note && (
                      <div className="txn-detail-row">
                        <span className="txn-detail-label">Note</span>
                        <span className="txn-detail-note">{r.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}