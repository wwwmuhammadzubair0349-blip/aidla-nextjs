"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.ch-wrap { font-family:'DM Sans',system-ui,sans-serif; color:#0f172a; }
.ch-head { margin-bottom:20px; }
.ch-head h1 { font-size:1.5rem; font-weight:900; margin:0 0 4px; }
.ch-head p { font-size:.88rem; color:#64748b; margin:0; }
.ch-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:24px; }
.ch-sum-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:14px 16px; text-align:center; }
.ch-sum-card.balance { background:linear-gradient(135deg,#1e3a8a,#3b82f6); border-color:transparent; }
.ch-sum-card.balance .ch-sum-val { color:#fff; }
.ch-sum-card.balance .ch-sum-label { color:rgba(255,255,255,.75); }
.ch-sum-val { font-size:1.4rem; font-weight:900; color:#0f172a; line-height:1; }
.ch-sum-label { font-size:.74rem; font-weight:600; color:#64748b; margin-top:3px; }
.ch-month { margin-bottom:20px; }
.ch-month-title { font-size:.8rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; padding:8px 0 10px; border-bottom:1px solid #f1f5f9; margin-bottom:10px; }
.ch-txn { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f8fafc; }
.ch-txn:last-child { border-bottom:none; }
.ch-txn-icon { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
.ch-txn-icon.credit { background:#dcfce7; }
.ch-txn-icon.debit  { background:#fee2e2; }
.ch-txn-info { flex:1; min-width:0; }
.ch-txn-desc { font-size:.86rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ch-txn-date { font-size:.75rem; color:#94a3b8; margin-top:2px; }
.ch-txn-amount { font-size:.95rem; font-weight:800; flex-shrink:0; }
.ch-txn-amount.credit { color:#16a34a; }
.ch-txn-amount.debit  { color:#dc2626; }
.ch-empty { text-align:center; padding:48px 0; color:#94a3b8; }
.ch-empty-icon { font-size:2.5rem; margin-bottom:10px; }
.ch-shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sh .9s infinite; border-radius:10px; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@media(max-width:480px){ .ch-summary{ grid-template-columns:1fr 1fr; } .ch-summary .balance{ grid-column:1/-1; } }
`;

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

function groupByMonth(txns) {
  const months = {};
  for (const t of txns) {
    const key = new Date(t.created_at).toLocaleDateString("en-GB", { month:"long", year:"numeric" });
    if (!months[key]) months[key] = [];
    months[key].push(t);
  }
  return months;
}

export default function CoinHistoryContent() {
  const [user,    setUser]    = useState(null);
  const [txns,    setTxns]    = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: txnData }, { data: prof }] = await Promise.all([
        supabase.from("users_transactions")
          .select("id,amount,txn_no,description,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("users_profiles")
          .select("total_aidla_coins")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      setTxns(txnData || []);
      setBalance(prof?.total_aidla_coins || 0);
      setLoading(false);
    })();
  }, [user]);

  const totalEarned = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent  = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const grouped = groupByMonth(txns);

  return (
    <div className="ch-wrap">
      <style>{CSS}</style>
      <div className="ch-head">
        <h1>Coin History</h1>
        <p>Your complete AIDLA coin transaction history.</p>
      </div>

      {loading ? (
        <>
          <div className="ch-summary">
            {[1,2,3].map(i => <div key={i} className="ch-shimmer" style={{height:72}} />)}
          </div>
          {[1,2,3,4,5].map(i => <div key={i} className="ch-shimmer" style={{height:52,marginBottom:10}} />)}
        </>
      ) : (
        <>
          <div className="ch-summary">
            <div className="ch-sum-card balance">
              <div className="ch-sum-val">🪙 {balance.toLocaleString()}</div>
              <div className="ch-sum-label">Current Balance</div>
            </div>
            <div className="ch-sum-card">
              <div className="ch-sum-val" style={{color:"#16a34a"}}>+{totalEarned.toLocaleString()}</div>
              <div className="ch-sum-label">Total Earned</div>
            </div>
            <div className="ch-sum-card">
              <div className="ch-sum-val" style={{color:"#dc2626"}}>-{totalSpent.toLocaleString()}</div>
              <div className="ch-sum-label">Total Spent</div>
            </div>
          </div>

          {txns.length === 0 ? (
            <div className="ch-empty">
              <div className="ch-empty-icon">🪙</div>
              <div>No transactions yet</div>
            </div>
          ) : (
            Object.entries(grouped).map(([month, list]) => (
              <div className="ch-month" key={month}>
                <div className="ch-month-title">{month}</div>
                {list.map(t => {
                  const isCredit = t.amount >= 0;
                  return (
                    <div className="ch-txn" key={t.id}>
                      <div className={`ch-txn-icon ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? "➕" : "➖"}
                      </div>
                      <div className="ch-txn-info">
                        <div className="ch-txn-desc">{t.description || t.txn_no || "Transaction"}</div>
                        <div className="ch-txn-date">{fmt(t.created_at)}</div>
                      </div>
                      <div className={`ch-txn-amount ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? "+" : ""}{t.amount.toLocaleString()} 🪙
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
