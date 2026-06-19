// app/admin/mining/page.jsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

function fmtShort(n) { return Number(n || 0).toFixed(2); }
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const DURATION_PRESETS = [
  { label: "6 hours",  value: 6 },
  { label: "12 hours", value: 12 },
  { label: "18 hours", value: 18 },
  { label: "24 hours", value: 24 },
  { label: "Custom",   value: "custom" },
];

export default function AdminMining() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: "", type: "" });

  // Settings
  const [enabled, setEnabled]           = useState(true);
  const [baseRate, setBaseRate]         = useState(10);
  const [durationHours, setDurationHours] = useState(12);
  const [durationPreset, setDurationPreset] = useState(12);
  const [cooldownHours, setCooldownHours] = useState(0);

  // Pool (read-only from admin_pool — managed via Admin Pool page)
  const [poolBalance, setPoolBalance]   = useState(0);

  // Boosters
  const [boosters, setBoosters]         = useState([]);
  const [newBooster, setNewBooster]     = useState({ name: "", icon: "⚡", multiplier: 1.5, duration_hours: 24, price_coins: 50, description: "" });
  const [savingBooster, setSavingBooster] = useState(false);
  const [deletingId, setDeletingId]     = useState(null);
  const [editBooster, setEditBooster]   = useState(null);

  // Stats
  const [stats, setStats]               = useState({ activeToday: 0, claimedToday: 0, coinsToday: 0 });

  const showMsg = (text, type = "ok", ms = 4000) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), ms);
  };

  const loadAll = useCallback(async () => {
    const [settRes, boostRes, statsRes, poolRes] = await Promise.all([
      supabase.from("mining_settings").select("*").eq("id", 1).single(),
      supabase.from("mining_boosters").select("*").order("price_coins"),
      supabase.from("mining_sessions")
        .select("id,status,actual_coins,created_at")
        .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      supabase.from("admin_pool").select("total_aidla_coins").eq("id", 1).single(),
    ]);

    if (settRes.data) {
      const d = settRes.data;
      setEnabled(d.enabled ?? true);
      setBaseRate(d.base_rate_per_hour ?? 10);
      const dur = d.session_duration_hours ?? 12;
      setDurationHours(dur);
      setDurationPreset(DURATION_PRESETS.some(p => p.value === dur) ? dur : "custom");
      setCooldownHours(d.cooldown_hours ?? 0);
    }
    setPoolBalance(poolRes.data?.total_aidla_coins ?? 0);
    setBoosters(boostRes.data || []);

    const rows = statsRes.data || [];
    setStats({
      activeToday:  rows.filter(r => r.status === "active").length,
      claimedToday: rows.filter(r => r.status === "claimed").length,
      coinsToday:   rows.filter(r => r.status === "claimed").reduce((s, r) => s + Number(r.actual_coins || 0), 0),
    });

    setLoading(false);
  }, []);

  useEffect(() => { setLoading(true); loadAll(); }, [loadAll]);

  const onSaveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from("mining_settings").update({
      enabled,
      base_rate_per_hour: Number(baseRate),
      session_duration_hours: Number(durationHours),
      cooldown_hours: Number(cooldownHours),
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setSaving(false);
    if (error) { showMsg(`Save failed: ${error.message}`, "err"); return; }
    showMsg("Settings saved ✅", "ok");
  };

  const onSaveBooster = async () => {
    const b = editBooster || newBooster;
    if (!b.name.trim()) { showMsg("Booster name required.", "err"); return; }
    setSavingBooster(true);
    const payload = {
      name: b.name.trim(),
      icon: b.icon || "⚡",
      multiplier: Number(b.multiplier),
      duration_hours: b.duration_hours ? Number(b.duration_hours) : null,
      price_coins: Number(b.price_coins),
      description: b.description || "",
      enabled: true,
    };
    let error;
    if (editBooster?.id) {
      ({ error } = await supabase.from("mining_boosters").update(payload).eq("id", editBooster.id));
    } else {
      ({ error } = await supabase.from("mining_boosters").insert([payload]));
    }
    setSavingBooster(false);
    if (error) { showMsg(`Failed: ${error.message}`, "err"); return; }
    showMsg(editBooster ? "Booster updated ✅" : "Booster added ✅", "ok");
    setEditBooster(null);
    setNewBooster({ name: "", icon: "⚡", multiplier: 1.5, duration_hours: 24, price_coins: 50, description: "" });
    await loadAll();
  };

  const onToggleBooster = async (id, enabled) => {
    await supabase.from("mining_boosters").update({ enabled: !enabled }).eq("id", id);
    await loadAll();
  };

  const onDeleteBooster = async (id) => {
    setDeletingId(id);
    await supabase.from("mining_boosters").delete().eq("id", id);
    setDeletingId(null);
    await loadAll();
  };

  const boosterForm = editBooster || newBooster;
  const setBoosterForm = editBooster ? setEditBooster : setNewBooster;

  return (
    <div className="adm-page">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="adm-header">
        <div>
          <h2 className="adm-title">⛏️ Mining Management</h2>
          <p className="adm-sub">Configure mining sessions, pool, and boosters.</p>
        </div>
        <div className="adm-header-right">
          {msg.text && <span className={`adm-msg ${msg.type === "err" ? "adm-msg-err" : "adm-msg-ok"}`}>{msg.text}</span>}
          <button onClick={onSaveSettings} disabled={saving || loading} className="adm-btn-primary">
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="adm-loader">Loading configuration…</div>
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div className="adm-stats-row">
            <StatCard icon="⛏️" label="Active Sessions (24h)" value={stats.activeToday} color="#0ea5e9" />
            <StatCard icon="✅" label="Claimed (24h)"          value={stats.claimedToday} color="#22c55e" />
            <StatCard icon="💰" label="Coins Distributed (24h)" value={fmtShort(stats.coinsToday)} color="#f59e0b" />
            <StatCard
              icon={poolBalance <= 100 ? "⚠️" : "🏦"}
              label="Pool Balance"
              value={fmtShort(poolBalance)}
              color={poolBalance <= 100 ? "#ef4444" : "#6366f1"}
              warn={poolBalance <= 100}
            />
          </div>

          <div className="adm-grid">

            {/* LEFT */}
            <div className="adm-col">

              {/* General Settings */}
              <div className="adm-card">
                <h3 className="adm-card-title">⚙️ General Settings</h3>
                <div className="adm-form-grid">

                  {/* Enable toggle */}
                  <div className="adm-form-group adm-span-2">
                    <label>Mining Status</label>
                    <div className="adm-toggle-row">
                      <button
                        onClick={() => setEnabled(true)}
                        className={`adm-toggle-btn ${enabled ? "adm-toggle-on" : ""}`}
                      >✅ Enabled</button>
                      <button
                        onClick={() => setEnabled(false)}
                        className={`adm-toggle-btn ${!enabled ? "adm-toggle-off" : ""}`}
                      >🚫 Disabled</button>
                    </div>
                  </div>

                  <div className="adm-form-group">
                    <label>Base Rate (coins/hour)</label>
                    <input type="number" min={0} step={0.1} value={baseRate} onChange={e => setBaseRate(e.target.value)} className="adm-input" />
                  </div>

                  <div className="adm-form-group">
                    <label>Cooldown Between Sessions (hours)</label>
                    <input type="number" min={0} value={cooldownHours} onChange={e => setCooldownHours(e.target.value)} className="adm-input" />
                    <span className="adm-hint">0 = no cooldown</span>
                  </div>

                  <div className="adm-form-group adm-span-2">
                    <label>Session Duration</label>
                    <div className="adm-preset-row">
                      {DURATION_PRESETS.map(p => (
                        <button
                          key={p.value}
                          onClick={() => {
                            setDurationPreset(p.value);
                            if (p.value !== "custom") setDurationHours(p.value);
                          }}
                          className={`adm-preset-btn ${durationPreset === p.value ? "adm-preset-active" : ""}`}
                        >{p.label}</button>
                      ))}
                    </div>
                    {durationPreset === "custom" && (
                      <input
                        type="number" min={1} value={durationHours}
                        onChange={e => setDurationHours(e.target.value)}
                        className="adm-input" style={{ marginTop: 8 }}
                        placeholder="Custom hours…"
                      />
                    )}
                  </div>

                </div>

                {/* Projection */}
                <div className="adm-projection">
                  <div className="adm-proj-item">
                    <span>Est. per session</span>
                    <strong>{fmtShort(Number(baseRate) * Number(durationHours))} coins</strong>
                  </div>
                  <div className="adm-proj-item">
                    <span>Est. per day (1 session)</span>
                    <strong>{fmtShort(Number(baseRate) * 24)} coins</strong>
                  </div>
                  <div className="adm-proj-item">
                    <span>Pool covers ~</span>
                    <strong>{fmtShort(Number(baseRate) * Number(durationHours)) > 0
                      ? Math.floor(Number(poolBalance) / (Number(baseRate) * Number(durationHours)))
                      : "∞"} sessions</strong>
                  </div>
                </div>
              </div>

              {/* Pool — read from admin_pool, managed via Admin Pool page */}
              <div className="adm-card">
                <h3 className="adm-card-title">🏦 Coin Pool Status</h3>
                <p className="adm-help">
                  Pool is shared across all features. Manage it from the <strong>Admin Pool</strong> page.
                  Mining claims deduct from this pool. Booster purchases add back to it.
                </p>
                <div className="adm-pool-display" style={{ borderColor: poolBalance <= 100 ? "#fca5a5" : "#bae6fd" }}>
                  <div className="adm-pool-label">Current Pool Balance</div>
                  <div className="adm-pool-value" style={{ color: poolBalance <= 100 ? "#dc2626" : "#0369a1" }}>
                    {Number(poolBalance).toLocaleString()}
                    <span className="adm-pool-unit">coins</span>
                  </div>
                  {poolBalance <= 100 && (
                    <div className="adm-pool-warn">⚠️ Pool critically low — go to Admin Pool to refill!</div>
                  )}
                </div>
                <a href="/admin/pool" className="adm-pool-link">
                  → Go to Admin Pool &amp; Logistics to refill
                </a>
              </div>

            </div>

            {/* RIGHT */}
            <div className="adm-col">

              {/* Add / Edit Booster */}
              <div className="adm-card">
                <h3 className="adm-card-title">{editBooster ? "✏️ Edit Booster" : "➕ Add Booster"}</h3>
                <div className="adm-form-grid">
                  <div className="adm-form-group">
                    <label>Icon (emoji)</label>
                    <input value={boosterForm.icon} onChange={e => setBoosterForm(p => ({...p, icon: e.target.value}))} className="adm-input adm-icon-input" maxLength={4} />
                  </div>
                  <div className="adm-form-group">
                    <label>Name</label>
                    <input value={boosterForm.name} onChange={e => setBoosterForm(p => ({...p, name: e.target.value}))} className="adm-input" placeholder="e.g. Speed Boost" />
                  </div>
                  <div className="adm-form-group">
                    <label>Multiplier (e.g. 1.5 = +50%)</label>
                    <input type="number" min={1} step={0.1} value={boosterForm.multiplier} onChange={e => setBoosterForm(p => ({...p, multiplier: e.target.value}))} className="adm-input" />
                  </div>
                  <div className="adm-form-group">
                    <label>Price (coins)</label>
                    <input type="number" min={0} value={boosterForm.price_coins} onChange={e => setBoosterForm(p => ({...p, price_coins: e.target.value}))} className="adm-input" />
                  </div>
                  <div className="adm-form-group">
                    <label>Duration (hours, blank = permanent)</label>
                    <input type="number" min={1} value={boosterForm.duration_hours || ""} onChange={e => setBoosterForm(p => ({...p, duration_hours: e.target.value}))} className="adm-input" placeholder="Leave blank for permanent" />
                  </div>
                  <div className="adm-form-group adm-span-2">
                    <label>Description (optional)</label>
                    <input value={boosterForm.description} onChange={e => setBoosterForm(p => ({...p, description: e.target.value}))} className="adm-input" placeholder="e.g. Doubles your mining speed for 24 hours" />
                  </div>
                </div>
                <div className="adm-booster-form-actions">
                  <button onClick={onSaveBooster} disabled={savingBooster} className="adm-btn-primary">
                    {savingBooster ? "Saving…" : editBooster ? "Update Booster" : "Add Booster"}
                  </button>
                  {editBooster && (
                    <button onClick={() => setEditBooster(null)} className="adm-btn-ghost">Cancel</button>
                  )}
                </div>
              </div>

              {/* Boosters List */}
              <div className="adm-card">
                <h3 className="adm-card-title">⚡ Boosters Catalog ({boosters.length})</h3>
                {boosters.length === 0 ? (
                  <div className="adm-empty">No boosters yet. Add one above.</div>
                ) : (
                  <div className="adm-boosters-list">
                    {boosters.map(b => (
                      <div key={b.id} className={`adm-booster-row ${!b.enabled ? "adm-booster-disabled" : ""}`}>
                        <div className="adm-booster-icon">{b.icon || "⚡"}</div>
                        <div className="adm-booster-info">
                          <div className="adm-booster-name">{b.name}</div>
                          <div className="adm-booster-meta">
                            <span>{b.multiplier}× rate</span>
                            <span>·</span>
                            <span>{b.duration_hours ? `${b.duration_hours}h` : "Permanent"}</span>
                            <span>·</span>
                            <span className="adm-booster-price">💰 {b.price_coins}</span>
                          </div>
                          {b.description && <div className="adm-booster-desc">{b.description}</div>}
                        </div>
                        <div className="adm-booster-actions">
                          <button
                            onClick={() => onToggleBooster(b.id, b.enabled)}
                            className={`adm-toggle-sm ${b.enabled ? "adm-toggle-sm-on" : "adm-toggle-sm-off"}`}
                            title={b.enabled ? "Disable" : "Enable"}
                          >{b.enabled ? "ON" : "OFF"}</button>
                          <button onClick={() => setEditBooster({ ...b })} className="adm-icon-btn" title="Edit">✏️</button>
                          <button
                            onClick={() => onDeleteBooster(b.id)}
                            disabled={deletingId === b.id}
                            className="adm-icon-btn adm-icon-del"
                            title="Delete"
                          >{deletingId === b.id ? "…" : "🗑️"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, warn }) {
  return (
    <div className={`adm-stat-card ${warn ? "adm-stat-warn" : ""}`} style={{ borderTopColor: color }}>
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-val" style={{ color }}>{value}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.adm-page *{box-sizing:border-box;}
.adm-page{
  font-family:'DM Sans',system-ui,sans-serif;
  color:#0f172a;
  max-width:1100px;
  margin:0 auto;
  padding:16px;
  display:flex;flex-direction:column;gap:16px;
  animation:admIn 0.4s ease;
}
@keyframes admIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}

/* ── Header ── */
.adm-header{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;}
.adm-title{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;margin:0 0 3px;color:#0f172a;}
.adm-sub{margin:0;color:#64748b;font-size:0.88rem;}
.adm-header-right{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.adm-msg{padding:6px 12px;border-radius:8px;font-size:0.82rem;font-weight:700;}
.adm-msg-ok{background:#dcfce7;color:#15803d;}
.adm-msg-err{background:#fee2e2;color:#b91c1c;}
.adm-loader{padding:40px;text-align:center;color:#64748b;font-weight:600;}

/* ── Buttons ── */
.adm-btn-primary{padding:9px 18px;border-radius:9px;border:none;background:#1e3a8a;color:#fff;font-weight:700;font-size:0.88rem;cursor:pointer;transition:all 0.15s;box-shadow:0 3px 0 #0f172a;}
.adm-btn-primary:hover:not(:disabled){background:#2563eb;transform:translateY(-1px);}
.adm-btn-primary:active:not(:disabled){transform:translateY(2px);box-shadow:none;}
.adm-btn-primary:disabled{background:#94a3b8;box-shadow:0 3px 0 #64748b;cursor:not-allowed;}
.adm-btn-ghost{padding:9px 16px;border-radius:9px;border:1.5px solid #e2e8f0;background:transparent;color:#64748b;font-weight:600;font-size:0.88rem;cursor:pointer;transition:all 0.15s;}
.adm-btn-ghost:hover{background:#f8fafc;color:#334155;}

/* ── Stats row ── */
.adm-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:700px){.adm-stats-row{grid-template-columns:repeat(2,1fr);}}
.adm-stat-card{background:#fff;border:1px solid #e2e8f0;border-top:3px solid;border-radius:14px;padding:14px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);transition:transform 0.2s;}
.adm-stat-card:hover{transform:translateY(-2px);}
.adm-stat-warn{animation:admWarn 1.5s ease-in-out infinite;}
@keyframes admWarn{0%,100%{box-shadow:none;}50%{box-shadow:0 0 0 3px rgba(239,68,68,0.15);}}
.adm-stat-icon{font-size:1.3rem;margin-bottom:6px;}
.adm-stat-val{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;line-height:1;margin-bottom:4px;}
.adm-stat-label{font-size:0.72rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}

/* ── Grid ── */
.adm-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
@media(max-width:800px){.adm-grid{grid-template-columns:1fr;}}
.adm-col{display:flex;flex-direction:column;gap:16px;}

/* ── Card ── */
.adm-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
.adm-card-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;margin:0 0 14px;color:#334155;padding-bottom:10px;border-bottom:1px solid #f1f5f9;}
.adm-help{font-size:0.78rem;color:#94a3b8;margin:-8px 0 14px;line-height:1.5;}

/* ── Forms ── */
.adm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.adm-form-group{display:flex;flex-direction:column;gap:5px;}
.adm-form-group label{font-size:0.72rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;}
.adm-span-2{grid-column:1/-1;}
.adm-input{padding:9px 11px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;font-family:inherit;font-size:0.88rem;color:#0f172a;transition:all 0.15s;outline:none;}
.adm-input:focus{border-color:#0ea5e9;background:#fff;box-shadow:0 0 0 3px rgba(14,165,233,0.1);}
.adm-icon-input{font-size:1.2rem;text-align:center;max-width:80px;}
.adm-hint{font-size:0.7rem;color:#94a3b8;}

/* ── Toggle ── */
.adm-toggle-row{display:flex;gap:8px;}
.adm-toggle-btn{flex:1;padding:9px;border-radius:9px;border:1.5px solid #e2e8f0;background:#f8fafc;font-weight:600;font-size:0.85rem;cursor:pointer;transition:all 0.15s;color:#64748b;}
.adm-toggle-on{background:#dcfce7;border-color:#4ade80;color:#15803d;}
.adm-toggle-off{background:#fee2e2;border-color:#fca5a5;color:#dc2626;}

/* ── Duration presets ── */
.adm-preset-row{display:flex;flex-wrap:wrap;gap:6px;}
.adm-preset-btn{padding:7px 14px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:0.82rem;font-weight:600;color:#64748b;cursor:pointer;transition:all 0.15s;}
.adm-preset-btn:hover{border-color:#0ea5e9;color:#0369a1;}
.adm-preset-active{background:#e0f2fe;border-color:#0ea5e9;color:#0369a1;}

/* ── Projection ── */
.adm-projection{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;}
.adm-proj-item{background:#f8fafc;border-radius:10px;padding:10px;text-align:center;border:1px solid #f1f5f9;}
.adm-proj-item span{display:block;font-size:0.65rem;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;}
.adm-proj-item strong{font-size:0.9rem;font-weight:800;color:#0f172a;}

/* ── Pool ── */
.adm-pool-display{border:1.5px solid;border-radius:14px;padding:16px;text-align:center;margin-bottom:14px;background:#f8fafc;}
.adm-pool-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:6px;}
.adm-pool-value{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;}
.adm-pool-unit{font-size:0.9rem;font-weight:600;margin-left:6px;opacity:0.7;}
.adm-pool-warn{font-size:0.78rem;font-weight:700;color:#dc2626;margin-top:6px;}
.adm-refill-row{display:flex;gap:10px;}
.adm-refill-row .adm-input{flex:1;}

/* ── Booster form actions ── */
.adm-booster-form-actions{display:flex;gap:8px;margin-top:14px;}

/* ── Boosters list ── */
.adm-boosters-list{display:flex;flex-direction:column;gap:8px;}
.adm-booster-row{display:flex;align-items:flex-start;gap:12px;padding:12px;background:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;transition:all 0.15s;}
.adm-booster-row:hover{border-color:#e2e8f0;box-shadow:0 2px 8px rgba(15,23,42,0.04);}
.adm-booster-disabled{opacity:0.55;}
.adm-booster-icon{font-size:1.5rem;flex-shrink:0;margin-top:1px;}
.adm-booster-info{flex:1;min-width:0;}
.adm-booster-name{font-weight:700;font-size:0.92rem;color:#0f172a;margin-bottom:3px;}
.adm-booster-meta{display:flex;gap:6px;font-size:0.75rem;color:#64748b;flex-wrap:wrap;margin-bottom:2px;}
.adm-booster-price{color:#b45309;font-weight:600;}
.adm-booster-desc{font-size:0.72rem;color:#94a3b8;margin-top:2px;}
.adm-booster-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.adm-toggle-sm{padding:4px 10px;border-radius:6px;border:none;font-size:0.72rem;font-weight:800;cursor:pointer;letter-spacing:0.5px;}
.adm-toggle-sm-on{background:#dcfce7;color:#15803d;}
.adm-toggle-sm-off{background:#f1f5f9;color:#94a3b8;}
.adm-icon-btn{padding:5px 7px;border-radius:7px;border:1px solid #f1f5f9;background:#fff;font-size:0.9rem;cursor:pointer;transition:all 0.15s;}
.adm-icon-btn:hover{background:#f8fafc;border-color:#e2e8f0;}
.adm-icon-del:hover{background:#fee2e2;border-color:#fca5a5;}

/* ── Empty ── */
.adm-empty{text-align:center;padding:20px;color:#94a3b8;font-size:0.85rem;background:#f8fafc;border-radius:10px;}

.adm-pool-link{display:inline-block;margin-top:10px;color:#0369a1;font-size:0.82rem;font-weight:700;text-decoration:none;}
.adm-pool-link:hover{text-decoration:underline;}
/* ── Responsive ── */
@media(max-width:600px){
  .adm-page{padding:10px;}
  .adm-form-grid{grid-template-columns:1fr;}
  .adm-projection{grid-template-columns:1fr 1fr;}
  .adm-refill-row{flex-direction:column;}
  .adm-booster-form-actions{flex-direction:column;}
  .adm-header{flex-direction:column;align-items:flex-start;}
}
`;