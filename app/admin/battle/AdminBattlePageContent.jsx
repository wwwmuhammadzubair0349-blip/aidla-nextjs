"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminBattlePage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("daily");
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [tab, setTab] = useState("overview");

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    await Promise.all([loadStats("daily"), loadLeaderboard("daily"), loadActiveRooms()]);
    setLoading(false);
  }

  async function loadStats(p) {
    const { data } = await supabase.rpc("battle_admin_stats", { p_period: p });
    setStats(data);
  }

  async function loadLeaderboard(p) {
    const { data } = await supabase.rpc("battle_leaderboard", { p_period: p });
    setLeaderboard(data || []);
  }

  async function loadActiveRooms() {
    const { data } = await supabase
      .from("battle_rooms")
      .select("id, mode, status, player1_name, player2_name, bot_name, is_bot, created_at, coins_staked")
      .in("status", ["waiting", "selecting", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(50);
    setActiveRooms(data || []);
  }

  function changePeriod(p) {
    setPeriod(p);
    loadStats(p);
    loadLeaderboard(p);
  }

  if (loading) return <div style={{ textAlign:"center", padding:80, fontFamily:"sans-serif" }}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <Link href="/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.title}>⚔️ Battle Admin</span>
        <button style={S.refreshBtn} onClick={() => { loadStats(period); loadLeaderboard(period); loadActiveRooms(); }}>↻</button>
      </div>

      {/* Period selector */}
      <div style={S.periodRow}>
        {["daily","weekly","monthly"].map(p => (
          <button key={p} style={{ ...S.periodBtn, ...(period===p ? S.periodActive : {}) }} onClick={() => changePeriod(p)}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {[["overview","📊 Overview"],["rooms","🏠 Rooms"],["leaderboard","🏆 Leaders"]].map(([id,label]) => (
          <button key={id} style={{ ...S.tab, ...(tab===id ? S.tabActive : {}) }} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div style={S.content}>

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <div>
            <div style={S.statsGrid}>
              {[
                ["Total Battles", stats.total_battles, "#e0e7ff", "#3730a3"],
                ["Real Battles", stats.real_battles, "#dcfce7", "#166534"],
                ["Bot Battles", stats.bot_battles, "#fef9c3", "#854d0e"],
                ["Active Now", stats.active_rooms, "#eff6ff", "#1e40af"],
                ["Coins In", stats.coins_collected+"🪙", "#dcfce7", "#166534"],
                ["Coins Out", stats.coins_paid_out+"🪙", "#fee2e2", "#991b1b"],
                ["Net Revenue", stats.net_revenue+"🪙", "#f0fdf4", "#15803d"],
                ["Free Spent", stats.free_coins_spent+"🪙", "#fff7ed", "#c2410c"],
              ].map(([label, val, bg, color]) => (
                <div key={label} style={{ background:bg, borderRadius:10, padding:"14px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800, color }}>{val ?? "—"}</div>
                  <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>

            {stats.top_players?.length > 0 && (
              <div style={S.card}>
                <div style={S.cardTitle}>🏆 Top Players</div>
                <table style={S.table}>
                  <thead><tr>{["Name","Wins","Coins"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats.top_players.map((p, i) => (
                      <tr key={i}>
                        <td style={S.td}>{p.full_name}</td>
                        <td style={S.td}>{p.wins}</td>
                        <td style={S.td}>{p.coins}🪙</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE ROOMS */}
        {tab === "rooms" && (
          <div style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={S.cardTitle}>Active Rooms ({activeRooms.length})</div>
              <button style={S.smBtn} onClick={loadActiveRooms}>↻ Refresh</button>
            </div>
            {activeRooms.length === 0 ? (
              <p style={S.empty}>No active rooms.</p>
            ) : activeRooms.map((r, i) => (
              <div key={i} style={{ border:"1px solid #e2e8f0", borderRadius:10, padding:12, marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>
                    {r.player1_name} vs {r.is_bot ? r.bot_name+"🤖" : (r.player2_name || "Waiting...")}
                  </span>
                  <span style={{ ...S.pill, background: r.status==="in_progress"?"#dcfce7":r.status==="waiting"?"#fef9c3":"#eff6ff", color: r.status==="in_progress"?"#166534":r.status==="waiting"?"#854d0e":"#3730a3" }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>
                  Mode: {r.mode} · Stake: {r.coins_staked}🪙 · {new Date(r.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD */}
        {tab === "leaderboard" && (
          <div style={S.card}>
            <div style={S.cardTitle}>Leaderboard — {period.charAt(0).toUpperCase()+period.slice(1)}</div>
            {leaderboard.length === 0 ? (
              <p style={S.empty}>No data yet.</p>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr>{["#","Player","W","L","T","Coins"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {leaderboard.map((l, i) => (
                    <tr key={i} style={{ background: i%2===0?"#f8fafc":"white" }}>
                      <td style={S.td}>{i+1}</td>
                      <td style={S.td}>{l.full_name}</td>
                      <td style={S.td}>{l.wins}</td>
                      <td style={S.td}>{l.losses}</td>
                      <td style={S.td}>{l.ties}</td>
                      <td style={{ ...S.td, fontWeight:700, color:"#059669" }}>+{l.coins_earned}🪙</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  wrap: { fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", background:"#f1f5f9" },
  header: { background:"#1e293b", color:"white", padding:"16px 24px", display:"flex", alignItems:"center", gap:16 },
  back: { color:"#94a3b8", textDecoration:"none", fontSize:14, fontWeight:600 },
  title: { flex:1, fontSize:18, fontWeight:800 },
  refreshBtn: { background:"rgba(255,255,255,0.1)", border:"none", color:"white", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:16 },
  periodRow: { display:"flex", gap:8, padding:"12px 24px", background:"white", borderBottom:"1px solid #e2e8f0" },
  periodBtn: { padding:"8px 16px", border:"1px solid #e2e8f0", borderRadius:8, background:"white", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", color:"#334155" },
  periodActive: { background:"#6366f1", color:"white", border:"1px solid #6366f1" },
  tabs: { display:"flex", gap:6, padding:"12px 24px", background:"white", borderBottom:"1px solid #e2e8f0" },
  tab: { padding:"8px 16px", border:"none", background:"#f1f5f9", borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", color:"#334155" },
  tabActive: { background:"#6366f1", color:"white" },
  content: { maxWidth:900, margin:"0 auto", padding:24 },
  card: { background:"white", borderRadius:14, padding:20, marginBottom:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  cardTitle: { fontWeight:800, fontSize:15, marginBottom:12 },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 },
  smBtn: { padding:"6px 12px", border:"1px solid #e2e8f0", background:"white", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  pill: { padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 },
  table: { width:"100%", borderCollapse:"collapse" },
  th: { padding:"8px 10px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0" },
  td: { padding:"10px", fontSize:13, borderBottom:"1px solid #f1f5f9" },
  empty: { textAlign:"center", color:"#94a3b8", padding:20, fontSize:14 },
};