"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase.js";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const nfmt = n => Number(n || 0).toLocaleString();
const shortDate = v => v ? new Date(v).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

function isOut(tx) {
  return tx?.direction === "OUT"
    || String(tx?.txn_type || "").toUpperCase().includes("SEND")
    || String(tx?.txn_no || "").startsWith("RES-APR");
}

async function safe(label, fn) {
  try { return { label, data: await fn(), error: null }; }
  catch (e) { return { label, data: null, error: e?.message || String(e) }; }
}

function Stat({ label, value, tone = "blue", hint }) {
  return (
    <div className={`ad-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function QueueCard({ title, count, href, tone = "amber", meta }) {
  return (
    <Link href={href} className={`ad-queue ${tone}`}>
      <div>
        <span>{title}</span>
        {meta && <small>{meta}</small>}
      </div>
      <strong>{count}</strong>
    </Link>
  );
}

function MiniBars({ items }) {
  const max = Math.max(...items.map(i => Number(i.value || 0)), 1);
  return (
    <div className="ad-chart-bars">
      {items.map(item => (
        <div className="ad-bar-row" key={item.label}>
          <span>{item.label}</span>
          <div><i style={{ width: `${Math.max(3, (Number(item.value || 0) / max) * 100)}%` }} /></div>
          <b>{nfmt(item.value)}</b>
        </div>
      ))}
    </div>
  );
}

function Donut({ pending }) {
  const pct = Math.min(100, pending * 8);
  return (
    <div className="ad-donut-wrap">
      <div className="ad-donut" style={{ "--pct": `${pct}%` }}>
        <strong>{nfmt(pending)}</strong>
        <span>open</span>
      </div>
      <div className="ad-donut-meta">
        <b>{pending ? "Attention required" : "Queues clear"}</b>
        <span>Tracked across withdrawals, shop, content, FAQs, and reviews</span>
      </div>
    </div>
  );
}

export default function AdminCommandCenter() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [pool, setPool] = useState(null);
  const [txs, setTxs] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [shop, setShop] = useState({ orders: [], cashbacks: [], products: [] });
  const [study, setStudy] = useState([]);
  const [projects, setProjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  const [email, setEmail] = useState("");
  const [userFound, setUserFound] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    const results = await Promise.all([
      safe("users", async () => (await supabase.from("users_profiles").select("user_id,full_name,email,total_aidla_perks,created_at,city,country").order("created_at", { ascending: false })).data || []),
      safe("pool", async () => (await supabase.from("admin_pool").select("total_aidla_coins").eq("id", 1).single()).data),
      safe("transactions", async () => (await supabase.from("admin_pool_transactions").select("*").order("created_at", { ascending: false }).limit(250)).data || []),
      safe("withdraws", async () => (await supabase.rpc("wd_admin_get_all")).data?.requests || []),
      safe("shop", async () => (await supabase.rpc("shop_admin_load")).data || {}),
      safe("study", async () => (await supabase.from("study_materials").select("id,approval_status,uploader_type,created_at")).data || []),
      safe("projects", async () => (await supabase.from("project_ideas").select("id,approval_status,uploader_type,created_at")).data || []),
      safe("questions", async () => (await supabase.from("user_questions").select("id,status,created_at")).data || []),
      safe("reviews", async () => (await supabase.from("user_reviews").select("id,is_approved,created_at")).data || []),
      safe("emails", async () => (await supabase.from("email_logs").select("id,subject,sent_count,failed_count,status,sent_at,created_at").order("sent_at", { ascending: false }).limit(250)).data || []),
    ]);

    const by = Object.fromEntries(results.map(r => [r.label, r]));
    setUsers(by.users.data || []);
    setPool(by.pool.data?.total_aidla_coins ?? null);
    setTxs(by.transactions.data || []);
    setWithdraws(by.withdraws.data || []);
    setShop({
      orders: by.shop.data?.orders || [],
      cashbacks: by.shop.data?.cashbacks || [],
      products: by.shop.data?.products || [],
    });
    setStudy(by.study.data || []);
    setProjects(by.projects.data || []);
    setQuestions(by.questions.data || []);
    setReviews(by.reviews.data || []);
    setEmailLogs(by.emails.data || []);
    setErrors(results.filter(r => r.error).map(r => `${r.label}: ${r.error}`));
    setLoading(false);
  }

  useEffect(() => { loadDashboard(); }, []);

  async function findUser() {
    setMsg("");
    setUserFound(null);
    setLoadingUser(true);
    try {
      const clean = email.trim().toLowerCase();
      if (!clean) throw new Error("Enter user email");
      const { data, error } = await supabase
        .from("users_profiles")
        .select("full_name,email,total_aidla_perks,user_id")
        .eq("email", clean)
        .single();
      if (error) throw new Error(error.code === "PGRST116" ? "No account found for this email." : error.message);
      setUserFound(data);
    } catch (e) {
      setMsg(e.message || "User lookup failed");
    } finally {
      setLoadingUser(false);
    }
  }

  async function doTransfer(mode) {
    setMsg("");
    setSending(true);
    try {
      if (!userFound?.email) throw new Error("Find a user first");
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const { data, error } = await supabase.rpc("admin_transfer_coins", {
        target_email: userFound.email,
        amount: amt,
        mode,
        note: note || null,
      });
      if (error) throw error;
      const res = Array.isArray(data) ? data[0] : data;
      setMsg(`Success. Transaction: ${res?.txn_no || "created"}`);
      setAmount("");
      setNote("");
      await loadDashboard();
      await findUser();
    } catch (e) {
      setMsg(e.message || "Transfer failed");
    } finally {
      setSending(false);
    }
  }

  const stats = useMemo(() => {
    const today = startOfToday();
    const todayUsers = users.filter(u => new Date(u.created_at) >= today).length;
    const userCoins = users.reduce((s, u) => s + Number(u.total_aidla_perks || 0), 0);
    const sent = txs.filter(isOut).reduce((s, t) => s + Number(t.amount || 0), 0);
    const received = txs.filter(t => !isOut(t)).reduce((s, t) => s + Number(t.amount || 0), 0);
    const todaySent = txs.filter(t => isOut(t) && new Date(t.created_at) >= today).reduce((s, t) => s + Number(t.amount || 0), 0);
    const todayReceived = txs.filter(t => !isOut(t) && new Date(t.created_at) >= today).reduce((s, t) => s + Number(t.amount || 0), 0);
    const pendingWithdraws = withdraws.filter(r => r.status === "pending");
    const pendingOrders = shop.orders.filter(o => o.status === "pending");
    const pendingCashbacks = shop.cashbacks.filter(c => c.status === "pending");
    const lowStock = shop.products.filter(p => !p.unlimited_stock && Number(p.stock) <= Number(p.low_stock_threshold || 0));
    const pendingStudy = study.filter(x => x.uploader_type === "user" && x.approval_status !== "approved");
    const pendingProjects = projects.filter(x => x.uploader_type === "user" && x.approval_status !== "approved");
    const pendingQuestions = questions.filter(q => !q.status || q.status === "pending" || q.status === "new");
    const pendingReviews = reviews.filter(r => !r.is_approved);
    const emailsToday = emailLogs.filter(e => new Date(e.sent_at || e.created_at) >= today).reduce((s, e) => s + Number(e.sent_count || 0), 0);
    const emailFailedToday = emailLogs.filter(e => new Date(e.sent_at || e.created_at) >= today).reduce((s, e) => s + Number(e.failed_count || 0), 0);
    return {
      todayUsers, userCoins, sent, received, todaySent, todayReceived,
      pendingWithdraws, pendingOrders, pendingCashbacks, lowStock,
      pendingStudy, pendingProjects, pendingQuestions, pendingReviews,
      emailsToday, emailFailedToday,
    };
  }, [users, txs, withdraws, shop, study, projects, questions, reviews, emailLogs]);

  const recent = useMemo(() => [
    ...txs.slice(0, 8).map(t => ({ type: isOut(t) ? "Perks sent" : "Perks received", text: `${isOut(t) ? "-" : "+"}${nfmt(t.amount)} AIDLA`, sub: t.target_user_email || t.note || t.txn_no, date: t.created_at })),
    ...withdraws.slice(0, 4).map(w => ({ type: "Withdrawal", text: `${w.status} - ${nfmt(w.coins_requested)} perks`, sub: w.user_email, date: w.created_at })),
    ...shop.orders.slice(0, 4).map(o => ({ type: "Shop order", text: `${o.status} - ${o.product_name}`, sub: o.user_email, date: o.created_at })),
    ...emailLogs.slice(0, 4).map(e => ({ type: "Email blast", text: `${nfmt(e.sent_count)} sent`, sub: e.subject, date: e.sent_at || e.created_at })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10), [txs, withdraws, shop.orders, emailLogs]);

  return (
    <div className="ad-root">
      <style>{CSS}</style>
      <header className="ad-hero">
        <div>
          <span>Dashboard</span>
          <h2>Admin Dashboard</h2>
          <p>Live platform health, financial movement, pending queues, and admin workload.</p>
        </div>
        <button className="ad-refresh" onClick={loadDashboard} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
      </header>

      {errors.length > 0 && (
        <div className="ad-alert">
          Some dashboard sources could not load: {errors.slice(0, 2).join(" | ")}
        </div>
      )}

      <nav className="ad-tabs" aria-label="Admin command center">
        {[
          ["overview", "Overview"],
          ["pool", "Pool Transfer"],
          ["history", "Coin Ledger"],
        ].map(([id, label]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      {tab === "overview" && (
        <>
          <section className="ad-grid">
            <Stat label="Total Users" value={nfmt(users.length)} />
            <Stat label="Joined Today" value={nfmt(stats.todayUsers)} tone="green" />
            <Stat label="Admin Pool" value={pool === null ? "-" : nfmt(pool)} hint="AIDLA perks" tone="indigo" />
            <Stat label="User Perks" value={nfmt(stats.userCoins)} hint="total balances" tone="gold" />
            <Stat label="Perks Sent" value={nfmt(stats.sent)} tone="red" />
            <Stat label="Perks Received" value={nfmt(stats.received)} tone="green" />
            <Stat label="Today Sent" value={nfmt(stats.todaySent)} tone="red" />
            <Stat label="Today Received" value={nfmt(stats.todayReceived)} tone="green" />
            <Stat label="Emails Today" value={nfmt(stats.emailsToday)} hint="manual logs" tone="blue" />
            <Stat label="Email Failed" value={nfmt(stats.emailFailedToday)} hint="today" tone="red" />
          </section>

          <section className="ad-insights">
            <div className="ad-panel">
              <div className="ad-panel-head">
                <h3>Financial Flow</h3>
                <small>All-time and today</small>
              </div>
              <MiniBars items={[
                { label: "Perks sent", value: stats.sent },
                { label: "Perks received", value: stats.received },
                { label: "Today sent", value: stats.todaySent },
                { label: "Today received", value: stats.todayReceived },
              ]} />
            </div>
            <div className="ad-panel">
              <div className="ad-panel-head">
                <h3>Workload Clearance</h3>
                <small>Pending queues</small>
              </div>
              <Donut pending={stats.pendingWithdraws.length + stats.pendingOrders.length + stats.pendingCashbacks.length + stats.lowStock.length + stats.pendingStudy.length + stats.pendingProjects.length + stats.pendingQuestions.length + stats.pendingReviews.length} />
            </div>
          </section>

          <section className="ad-split">
            <div className="ad-panel">
              <div className="ad-panel-head">
                <h3>Action Inbox</h3>
                <small>Highest priority pending work</small>
              </div>
              <div className="ad-queues">
                <QueueCard title="Withdrawals" count={stats.pendingWithdraws.length} href="/admin/withdraws" />
                <QueueCard title="Shop Orders" count={stats.pendingOrders.length} href="/admin/shop" />
                <QueueCard title="Cashbacks" count={stats.pendingCashbacks.length} href="/admin/shop" tone="violet" />
                <QueueCard title="Low Stock" count={stats.lowStock.length} href="/admin/shop" tone="red" />
                <QueueCard title="Study Uploads" count={stats.pendingStudy.length} href="/admin/AdminStudyMaterials" tone="blue" />
                <QueueCard title="Project Ideas" count={stats.pendingProjects.length} href="/admin/AdminProjects" tone="blue" />
                <QueueCard title="FAQ Questions" count={stats.pendingQuestions.length} href="/admin/adminfaqs" tone="slate" />
                <QueueCard title="Reviews" count={stats.pendingReviews.length} href="/admin/reviews" tone="slate" />
              </div>
            </div>

            <div className="ad-panel">
              <div className="ad-panel-head">
                <h3>Recent Activity</h3>
                <small>{recent.length} latest events</small>
              </div>
              <div className="ad-feed">
                {recent.length === 0 && <div className="ad-empty">No activity yet.</div>}
                {(recentOpen ? recent : recent.slice(0, 4)).map((item, i) => (
                  <div className="ad-feed-item" key={`${item.type}-${i}`}>
                    <div>
                      <strong>{item.type}</strong>
                      <span>{item.sub || "-"}</span>
                    </div>
                    <div>
                      <b>{item.text}</b>
                      <small>{shortDate(item.date)}</small>
                    </div>
                  </div>
                ))}
              </div>
              {recent.length > 4 && (
                <button className="ad-expand" onClick={() => setRecentOpen(v => !v)}>
                  {recentOpen ? "Show less" : `Expand ${recent.length - 4} more events`}
                </button>
              )}
            </div>
          </section>
        </>
      )}

      {tab === "pool" && (
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h3>Admin Pool Transfer</h3>
            <small>Current pool: {pool === null ? "-" : `${nfmt(pool)} AIDLA`}</small>
          </div>
          <div className="ad-form-grid">
            <div>
              <label>User email</label>
              <div className="ad-inline">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
                <button onClick={findUser} disabled={loadingUser}>{loadingUser ? "Searching" : "Search"}</button>
              </div>
              {userFound && (
                <div className="ad-user">
                  <b>{userFound.full_name || "User"}</b>
                  <span>{userFound.email}</span>
                  <strong>{nfmt(userFound.total_aidla_perks)} perks</strong>
                </div>
              )}
            </div>
            <div>
              <label>Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1500" />
            </div>
            <div>
              <label>Reference note</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="ad-actions">
            <button onClick={() => doTransfer("SEND")} disabled={sending || !userFound}>Send to User</button>
            <button className="secondary" onClick={() => doTransfer("RECEIVE")} disabled={sending || !userFound}>Receive from User</button>
          </div>
          {msg && <div className={`ad-msg ${msg.startsWith("Success") ? "ok" : "err"}`}>{msg}</div>}
        </section>
      )}

      {tab === "history" && (
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h3>Coin Ledger</h3>
            <small>{txs.length} recent transactions</small>
          </div>
          <div className="ad-ledger">
            {(ledgerOpen ? txs : txs.slice(0, 8)).map(tx => {
              const out = isOut(tx);
              return (
                <div className="ad-ledger-row" key={tx.id || tx.txn_no}>
                  <div>
                    <strong>{tx.target_user_name || tx.target_user_email || "Unknown user"}</strong>
                    <span>{tx.txn_no} - {shortDate(tx.created_at)}</span>
                  </div>
                  <div className={out ? "out" : "in"}>
                    {out ? "-" : "+"}{nfmt(tx.amount)} AIDLA
                  </div>
                </div>
              );
            })}
          </div>
          {txs.length > 8 && (
            <button className="ad-expand" onClick={() => setLedgerOpen(v => !v)}>
              {ledgerOpen ? "Show less" : `Expand ${txs.length - 8} more transactions`}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

const CSS = `
.ad-root{font-family:Inter,system-ui,sans-serif;color:#172033}
.ad-hero{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #e5eaf3}
.ad-hero span{font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.08em;color:#2563eb}
.ad-hero h2{font-size:clamp(22px,5vw,34px);line-height:1.05;margin:4px 0 6px;font-weight:900;letter-spacing:-.03em;color:#0f172a}
.ad-hero p{margin:0;color:#65758b;font-size:13px;line-height:1.5;max-width:620px}
.ad-refresh,.ad-tabs button,.ad-actions button,.ad-inline button{border:0;border-radius:9px;background:#1f3b8f;color:white;font-weight:800;padding:10px 13px;cursor:pointer}
.ad-refresh{min-width:96px}
.ad-refresh:disabled,.ad-actions button:disabled,.ad-inline button:disabled{opacity:.55;cursor:not-allowed}
.ad-alert{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:12px;font-weight:700}
.ad-tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;scrollbar-width:none}
.ad-tabs::-webkit-scrollbar{display:none}
.ad-tabs button{background:#f1f5fb;color:#334155;white-space:nowrap;border:1px solid #e5eaf3}
.ad-tabs button.on{background:#1f3b8f;color:#fff;border-color:#1f3b8f}
.ad-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:12px}
.ad-stat{background:#fff;border:1px solid #dfe7f2;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.ad-stat span{font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.07em}
.ad-stat strong{display:block;font-size:clamp(22px,6vw,30px);line-height:1.05;margin-top:8px;color:#1f3b8f}
.ad-stat small{display:block;color:#8b9aaf;font-weight:700;margin-top:4px;font-size:12px}
.ad-stat.green strong{color:#15803d}.ad-stat.red strong{color:#b91c1c}.ad-stat.gold strong{color:#b45309}.ad-stat.indigo strong{color:#3730a3}
.ad-split{display:grid;grid-template-columns:1fr;gap:12px}
.ad-insights{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:12px}
.ad-panel{background:#fff;border:1px solid #dfe7f2;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(15,23,42,.04);margin-bottom:12px}
.ad-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}
.ad-panel-head h3{margin:0;font-size:16px;font-weight:900;color:#0f172a}
.ad-panel-head small{color:#64748b;font-weight:700;text-align:right;font-size:12px}
.ad-queues{display:grid;grid-template-columns:1fr;gap:8px}
.ad-queue{display:flex;justify-content:space-between;align-items:center;gap:12px;text-decoration:none;color:#0f172a;background:#f8fafc;border:1px solid #e5eaf3;border-left:3px solid #f59e0b;border-radius:10px;padding:11px 12px}
.ad-queue span{font-weight:850;font-size:13px}.ad-queue small{display:block;color:#64748b;margin-top:3px}.ad-queue strong{font-size:22px;color:#92400e}
.ad-queue.red{border-left-color:#ef4444}.ad-queue.red strong{color:#b91c1c}.ad-queue.green{border-left-color:#22c55e}.ad-queue.violet{border-left-color:#8b5cf6}.ad-queue.violet strong{color:#6d28d9}.ad-queue.blue{border-left-color:#3b82f6}.ad-queue.blue strong{color:#1e40af}.ad-queue.slate{border-left-color:#64748b}.ad-queue.slate strong{color:#334155}
.ad-feed,.ad-ledger{display:grid;gap:8px}
.ad-feed-item,.ad-ledger-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid #edf2f7}
.ad-feed-item span,.ad-ledger-row span{display:block;color:#64748b;font-size:12px;margin-top:3px;word-break:break-word}
.ad-feed-item b,.ad-ledger-row .in,.ad-ledger-row .out{font-weight:900;text-align:right;white-space:nowrap}
.ad-feed-item small{display:block;color:#94a3b8;margin-top:3px;text-align:right}
.ad-ledger-row .in{color:#15803d}.ad-ledger-row .out{color:#b91c1c}
.ad-chart-bars{display:grid;gap:11px}
.ad-bar-row{display:grid;grid-template-columns:112px 1fr auto;gap:10px;align-items:center}
.ad-bar-row span{font-size:12px;font-weight:850;color:#64748b}
.ad-bar-row div{height:10px;background:#eef2f7;border-radius:999px;overflow:hidden}
.ad-bar-row i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1e3a8a,#d4af37)}
.ad-bar-row b{font-size:12px;color:#0f172a;text-align:right}
.ad-donut-wrap{display:flex;align-items:center;gap:18px;min-height:138px}
.ad-donut{width:118px;height:118px;border-radius:50%;display:grid;place-content:center;text-align:center;background:conic-gradient(#1e3a8a var(--pct),#e8eef7 0);position:relative;flex:0 0 auto}
.ad-donut:after{content:"";position:absolute;inset:13px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 1px #e5edf7}
.ad-donut strong,.ad-donut span{position:relative;z-index:1}
.ad-donut strong{font-size:26px;font-weight:950;color:#1e3a8a;line-height:1}
.ad-donut span{font-size:11px;font-weight:900;text-transform:uppercase;color:#8b9aaf;margin-top:4px}
.ad-donut-meta b{display:block;font-size:17px;color:#0f172a;margin-bottom:5px}
.ad-donut-meta span{display:block;font-size:13px;color:#64748b;line-height:1.5}
.ad-expand{margin-top:10px;width:100%;border:1px solid #dbe5f3;background:#f8fafc;color:#1e3a8a;border-radius:10px;padding:11px 12px;font-weight:850;cursor:pointer}
.ad-expand:hover{background:#eef4ff}
.ad-form-grid{display:grid;grid-template-columns:1fr;gap:12px}
.ad-form-grid label{display:block;font-size:12px;font-weight:900;text-transform:uppercase;color:#64748b;margin-bottom:6px}
.ad-form-grid input{width:100%;border:1px solid #cbd5e1;border-radius:9px;padding:11px 12px;font:inherit;color:#0f172a;background:#fff}
.ad-inline{display:grid;grid-template-columns:1fr;gap:8px}
.ad-user{margin-top:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px}
.ad-user span{display:block;color:#64748b;font-size:13px;margin:3px 0}.ad-user strong{color:#1e3a8a}
.ad-actions{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.ad-actions .secondary{background:#334155}
.ad-msg{margin-top:12px;padding:12px;border-radius:12px;font-weight:800}.ad-msg.ok{background:#dcfce7;color:#166534}.ad-msg.err{background:#fee2e2;color:#991b1b}
.ad-empty{padding:24px;text-align:center;color:#94a3b8;font-weight:700}
@media(min-width:420px){.ad-grid{grid-template-columns:repeat(2,1fr)}.ad-queues{grid-template-columns:repeat(2,1fr)}.ad-inline{grid-template-columns:1fr auto}.ad-actions{flex-direction:row}}
@media(min-width:900px){.ad-grid{grid-template-columns:repeat(5,1fr)}.ad-split,.ad-insights{grid-template-columns:1.05fr .95fr}.ad-form-grid{grid-template-columns:1.4fr .8fr 1fr}.ad-panel{padding:16px}}
@media(max-width:520px){.ad-bar-row{grid-template-columns:1fr}.ad-bar-row b{text-align:left}.ad-donut-wrap{align-items:flex-start;flex-direction:column}}
@media(max-width:380px){.ad-hero{display:block}.ad-refresh{margin-top:12px;width:100%}.ad-feed-item,.ad-ledger-row{align-items:flex-start;flex-direction:column}.ad-feed-item b,.ad-ledger-row .in,.ad-ledger-row .out{text-align:left}}
`;
