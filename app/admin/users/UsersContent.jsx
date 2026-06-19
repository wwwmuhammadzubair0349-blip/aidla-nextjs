// app/admin/users/page.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --navy: #0b1437;
    --royal: #1a3a8f;
    --sky: #3b82f6;
    --gold: #f59e0b;
    --gold-light: #fcd34d;
    --slate: #64748b;
    --card-bg: rgba(255,255,255,0.97);
    --green: #10b981;
    --red: #ef4444;
    --pink: #ec4899;
  }

  * { box-sizing: border-box; }

  .usr-root {
    min-height: 100vh;
    background: linear-gradient(160deg, #f0f4ff 0%, #fffbf0 60%, #e8f4fd 100%);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    position: relative;
  }

  .bg-orbs { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .bg-orb-1 { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: rgba(59,130,246,0.06); filter: blur(80px); top: -200px; left: -200px; }
  .bg-orb-2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: rgba(245,158,11,0.05); filter: blur(80px); top: 300px; right: -250px; }
  .bg-orb-3 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(16,185,129,0.04); filter: blur(80px); bottom: 200px; left: 20%; }

  .usr-container {
    max-width: 1000px; margin: 0 auto;
    padding: clamp(20px,5vw,60px) clamp(14px,4vw,32px) clamp(40px,8vw,80px);
    position: relative; z-index: 2; width: 100%;
  }

  .sec-label {
    display: inline-block;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: var(--navy); padding: 6px 14px; border-radius: 30px;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(245,158,11,0.25);
  }
  .sec-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem,6vw,2.5rem); font-weight: 900;
    color: var(--navy); line-height: 1.15; margin-bottom: 8px;
  }
  .sec-title span {
    background: linear-gradient(135deg, var(--royal), var(--sky));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .sec-desc { color: var(--slate); font-size: clamp(0.85rem,2vw,1rem); line-height: 1.5; max-width: 520px; margin-bottom: 28px; }

  .usr-tabs { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
  .usr-tab {
    padding: 9px 20px; border-radius: 30px; font-size: 0.75rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
    background: var(--card-bg); color: var(--slate);
    box-shadow: 0 2px 10px rgba(11,20,55,0.06);
    border: 1px solid rgba(59,130,246,0.08); transition: all 0.2s;
  }
  .usr-tab:hover { color: var(--navy); box-shadow: 0 4px 16px rgba(11,20,55,0.1); }
  .usr-tab.active {
    background: linear-gradient(135deg, var(--royal), var(--sky));
    color: #fff; box-shadow: 0 4px 16px rgba(26,58,143,0.28); border-color: transparent;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(200px,100%),1fr));
    gap: 14px; margin-bottom: 20px;
  }
  .stat-card {
    background: var(--card-bg); border-radius: 18px;
    border: 1px solid rgba(59,130,246,0.08);
    box-shadow: 0 4px 20px rgba(11,20,55,0.05);
    padding: 20px 22px; display: flex; align-items: center; gap: 14px;
  }
  .stat-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; flex-shrink: 0;
  }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: var(--navy); }
  .stat-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate); margin-top: 2px; }

  .usr-section {
    background: var(--card-bg); border-radius: 24px;
    box-shadow: 0 8px 40px rgba(11,20,55,0.06);
    border: 1px solid rgba(59,130,246,0.08); overflow: hidden; margin-bottom: 20px;
  }
  .usr-section-header {
    padding: clamp(14px,3.5vw,20px) clamp(16px,4vw,28px);
    border-bottom: 1px solid rgba(59,130,246,0.08);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  }
  .usr-section-title {
    font-family: 'Playfair Display', serif; font-size: clamp(1rem,3vw,1.2rem);
    font-weight: 800; color: var(--navy); margin: 0;
  }

  .search-bar {
    display: flex; align-items: center; gap: 10px;
    margin: clamp(14px,3vw,20px) clamp(16px,4vw,28px);
    background: rgba(59,130,246,0.04); border: 1px solid rgba(59,130,246,0.12);
    border-radius: 12px; padding: 10px 16px;
  }
  .search-icon { font-size: 0.9rem; color: var(--slate); flex-shrink: 0; }
  .search-input {
    border: none; outline: none; background: transparent;
    font-size: 0.88rem; color: var(--navy); flex: 1; font-family: 'DM Sans', sans-serif;
  }
  .search-input::placeholder { color: var(--slate); }
  .search-clear {
    background: none; border: none; cursor: pointer; color: var(--slate);
    font-size: 1.1rem; padding: 0; line-height: 1; transition: color 0.15s;
  }
  .search-clear:hover { color: var(--navy); }

  .usr-table-wrap { overflow-x: auto; }
  .usr-table { width: 100%; border-collapse: collapse; }
  .usr-th {
    padding: 10px clamp(14px,3vw,20px); text-align: left;
    font-size: 0.65rem; font-weight: 800; color: var(--slate);
    text-transform: uppercase; letter-spacing: 0.06em;
    background: rgba(59,130,246,0.03);
    border-bottom: 1px solid rgba(59,130,246,0.08);
  }
  .usr-th.right { text-align: right; }
  .usr-td {
    padding: 12px clamp(14px,3vw,20px); font-size: 0.85rem; color: var(--navy);
    border-bottom: 1px solid rgba(59,130,246,0.05); vertical-align: middle;
  }
  .usr-td.muted { color: var(--slate); }
  .usr-td.right { text-align: right; }
  .usr-tr:last-child .usr-td { border-bottom: none; }
  .usr-tr:hover .usr-td { background: rgba(59,130,246,0.02); }

  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;
  }
  .user-cell { display: flex; align-items: center; gap: 10px; }
  .user-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }

  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 0.65rem; font-weight: 700; white-space: nowrap;
  }
  .badge-blue { background: rgba(59,130,246,0.1); color: var(--royal); }
  .badge-gold { background: rgba(245,158,11,0.12); color: #92400e; }

  .btn-delete {
    padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 700;
    background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.2);
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-delete:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); }
  .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

  .bar-list { padding: clamp(14px,3vw,20px) clamp(16px,4vw,28px); display: flex; flex-direction: column; gap: 12px; }
  .bar-meta { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 5px; }
  .bar-name { font-weight: 600; color: var(--navy); }
  .bar-count { color: var(--slate); font-weight: 600; }
  .bar-track { height: 5px; border-radius: 4px; background: rgba(59,130,246,0.08); overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }

  .skel-bg {
    background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
    background-size: 400% 100%; animation: skel-load 1.5s ease-in-out infinite; border-radius: 6px;
  }
  @keyframes skel-load { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .usr-empty { text-align: center; padding: clamp(28px,6vw,48px) 20px; color: var(--slate); font-size: 0.88rem; }
  .usr-empty-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
  .usr-error {
    background: rgba(254,226,226,0.9); border: 1px solid #fca5a5; color: #991b1b;
    padding: 10px 16px; border-radius: 12px; font-size: 0.82rem; font-weight: 600;
    margin-bottom: 16px;
  }
  .table-footer {
    padding: 10px clamp(16px,4vw,28px); font-size: 0.7rem; color: var(--slate);
    border-top: 1px solid rgba(59,130,246,0.06); font-weight: 600;
  }
  .two-col {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px,100%),1fr));
    gap: 14px; margin-bottom: 20px;
  }

  @media (max-width:640px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .hide-mobile { display: none; }
  }
  @media (max-width:400px) {
    .stat-grid { grid-template-columns: 1fr; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function fmtCoins(val) {
  const n = Number(val);
  if (!n && n !== 0) return "0";
  return Math.floor(n).toLocaleString();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function avatarColor(name) {
  const colors = ["#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899","#8b5cf6","#14b8a6","#f97316"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function buildGrowthData(users) {
  const byDay = {};
  users.forEach((u) => {
    const day = u.created_at?.slice(0, 10);
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  });
  const sorted = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;
  return sorted.map(([date, count]) => {
    cumulative += count;
    return { date, "New Users": count, "Total Users": cumulative };
  });
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */
function StatCard({ emoji, label, value, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>{emoji}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function BarList({ title, data, color }) {
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 10);
  const max = sorted[0]?.[1] || 1;
  return (
    <div className="usr-section">
      <div className="usr-section-header">
        <h3 className="usr-section-title">{title}</h3>
        <span style={{ fontSize: "0.7rem", color: "var(--slate)", fontWeight: 600 }}>{sorted.length} entries</span>
      </div>
      <div className="bar-list">
        {sorted.length === 0 && <div className="usr-empty"><span className="usr-empty-icon">🌍</span>No data yet</div>}
        {sorted.map(([name, count], i) => (
          <div key={name}
            style={{ opacity: 1, transform: "translateX(0px)", transition: `opacity 0.2s, transform 0.2s` }}>
            <div className="bar-meta">
              <span className="bar-name">{name}</span>
              <span className="bar-count">{count}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(count / max) * 100}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 6 }) {
  return (
    <div style={{ padding: "12px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderBottom: "1px solid rgba(59,130,246,0.05)" }}>
          <div className="skel-bg" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skel-bg" style={{ height: 13, width: 130, marginBottom: 6 }} />
            <div className="skel-bg" style={{ height: 10, width: 180 }} />
          </div>
          <div className="skel-bg" style={{ height: 13, width: 60 }} />
          <div className="skel-bg" style={{ height: 13, width: 80 }} />
          <div className="skel-bg" style={{ height: 13, width: 70 }} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════ */
function Dashboard({ users }) {
  const countryData = useMemo(() => groupBy(users, "country"), [users]);
  const cityData    = useMemo(() => groupBy(users, "city"),    [users]);
  const growthData  = useMemo(() => buildGrowthData(users),    [users]);
  const totalCoins  = useMemo(() =>
    users.reduce((s, u) => s + (parseFloat(u.total_aidla_coins) || 0), 0), [users]);

  return (
    <>
      <div className="stat-grid">
        <StatCard emoji="👥" label="Total Users"       value={users.length.toLocaleString()} bg="rgba(99,102,241,0.1)" />
        <StatCard emoji="🌍" label="Countries"         value={Object.keys(countryData).length} bg="rgba(16,185,129,0.1)" />
        <StatCard emoji="🏙️" label="Cities"            value={Object.keys(cityData).length}    bg="rgba(245,158,11,0.1)" />
        <StatCard emoji="🪙" label="Total AIDLA Coins" value={fmtCoins(totalCoins)}             bg="rgba(236,72,153,0.1)" />
      </div>

      {/* Growth Chart */}
      <div className="usr-section" style={{ marginBottom: 20 }}>
        <div className="usr-section-header">
          <h3 className="usr-section-title">📈 User Growth Over Time</h3>
        </div>
        <div style={{ padding: "20px 16px 12px" }}>
          {growthData.length === 0 ? (
            <div className="usr-empty"><span className="usr-empty-icon">📈</span>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a3a8f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a3a8f" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-new" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid rgba(59,130,246,0.12)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
                  labelStyle={{ fontWeight: 700, color: "#0b1437" }}
                />
                <Area type="monotone" dataKey="Total Users" stroke="#1a3a8f" strokeWidth={2} fill="url(#grad-total)" dot={false} />
                <Area type="monotone" dataKey="New Users"   stroke="#10b981" strokeWidth={2} fill="url(#grad-new)"   dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Country + City breakdown */}
      <div className="two-col">
        <BarList title="🌍 Users by Country" data={countryData} color="linear-gradient(90deg,#1a3a8f,#3b82f6)" />
        <BarList title="🏙️ Users by City"    data={cityData}    color="linear-gradient(90deg,#10b981,#34d399)" />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USERS LIST TAB
═══════════════════════════════════════════════════════════════ */
function UsersList({ users, loading, onDelete }) {
  const [search,    setSearch]    = useState("");
  const [deleting,  setDeleting]  = useState(null); // userId being deleted

  async function handleDelete(u) {
    if (!confirm(`Delete "${u.full_name || u.email}"? This cannot be undone.`)) return;
    setDeleting(u.user_id);
    const res = await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.user_id }),
    });
    const json = await res.json();
    setDeleting(null);
    if (!res.ok) { alert("Error: " + json.error); return; }
    onDelete(u.user_id);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.country?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="usr-section">
      <div className="usr-section-header">
        <h3 className="usr-section-title">👤 All Users</h3>
        <span style={{ fontSize: "0.7rem", color: "var(--slate)", fontWeight: 600 }}>{users.length} total</span>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by name, email, city or country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={() => setSearch("")}>×</button>}
      </div>

      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <>
          <div className="usr-table-wrap">
            <table className="usr-table">
              <thead>
                <tr>
                  <th className="usr-th">Name</th>
                  <th className="usr-th">Email</th>
                  <th className="usr-th hide-mobile">City</th>
                  <th className="usr-th hide-mobile">Country</th>
                  <th className="usr-th right">AIDLA Coins</th>
                  <th className="usr-th hide-mobile">Joined</th>
                  <th className="usr-th right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="usr-empty">
                        <span className="usr-empty-icon">🔍</span>
                        No users match your search.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => {
                    const bg      = avatarColor(u.full_name);
                    const initial = u.full_name?.[0]?.toUpperCase() || "?";
                    return (
                      <tr key={u.user_id} className="usr-tr"
                        style={{ opacity: 1, transform: "translateY(0px)", transition: `opacity 0.2s, transform 0.2s` }}>
                        <td className="usr-td">
                          <div className="user-cell">
                            <div className="user-avatar" style={{ background: bg }}>{initial}</div>
                            <span className="user-name">{u.full_name || "—"}</span>
                          </div>
                        </td>
                        <td className="usr-td muted" style={{ fontSize: "0.8rem" }}>{u.email}</td>
                        <td className="usr-td muted hide-mobile">{u.city || "—"}</td>
                        <td className="usr-td hide-mobile">
                          {u.country
                            ? <span className="badge badge-blue">{u.country}</span>
                            : "—"}
                        </td>
                        <td className="usr-td right">
                          {Number(u.total_aidla_coins) > 0
                            ? <span className="badge badge-gold">🪙 {fmtCoins(u.total_aidla_coins)}</span>
                            : <span style={{ color: "var(--slate)" }}>0</span>}
                        </td>
                        <td className="usr-td muted hide-mobile" style={{ fontSize: "0.78rem" }}>
                          {fmtDate(u.created_at)}
                        </td>
                        <td className="usr-td right">
                          <button
                            className="btn-delete"
                            disabled={deleting === u.user_id}
                            onClick={() => handleDelete(u)}
                          >
                            {deleting === u.user_id ? "…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            Showing {filtered.length} of {users.length} users
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "list",      label: "👥 All Users"  },
];

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    supabase
      .from("users_profiles")
      .select("user_id,full_name,email,city,country,total_aidla_coins,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setUsers(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="usr-root">
      <style>{styles}</style>
      <div className="bg-orbs">
        <div className="bg-orb-1" /><div className="bg-orb-2" /><div className="bg-orb-3" />
      </div>

      <div className="usr-container">
        <div style={{ opacity: 1, transform: "translateY(0px)", transition: "opacity 0.5s, transform 0.5s" }}>
          <span className="sec-label">Admin</span>
          <h2 className="sec-title">User <span>Management</span></h2>
          <p className="sec-desc">Overview and management of all registered AIDLA platform members.</p>
        </div>

        <div className="usr-tabs" style={{ opacity: 1, transform: "translateY(0px)", transition: "opacity 0.2s, transform 0.2s" }}>
          {TABS.map(t => (
            <button key={t.id} className={`usr-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="usr-error">⚠️ {error}</div>}

        <div key={activeTab}
          style={{ opacity: 1, transform: "translateY(0px)", transition: "opacity 0.22s, transform 0.22s" }}>
          {activeTab === "dashboard" && (
            loading
              ? <div className="usr-empty"><span className="usr-empty-icon">⏳</span>Loading dashboard…</div>
              : <Dashboard users={users} />
          )}
          {activeTab === "list" && (
            <UsersList
              users={users}
              loading={loading}
              onDelete={(uid) => setUsers((prev) => prev.filter((u) => u.user_id !== uid))}
            />
          )}
        </div>
      </div>
    </div>
  );
}