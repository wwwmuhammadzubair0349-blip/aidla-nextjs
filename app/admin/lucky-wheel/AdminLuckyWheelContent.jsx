// app/admin/lucky-wheel/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const SLICE_TYPES =[
  { value: "try_again_free", label: "Try Again" },
  { value: "plus1_chance", label: "+1 Chance" },
  { value: "gift", label: "Gift" },
  { value: "coins", label: "Coins" },
];

const SLICE_COLORS =["#1E3A8A", "#3B82F6", "#0EA5E9", "#8B5CF6"];

const defaultSlices =[
  { label: "Slice 1", type: "try_again_free", value: 0 },
  { label: "Slice 2", type: "plus1_chance", value: 0 },
  { label: "Slice 3", type: "gift", value: 0 },
  { label: "Slice 4", type: "coins", value: 10 },
];

const defaultCaps = {
  try_again_free: 999999,
  plus1_chance: 999999,
  gift: 999999,
  coins: 5,
};

export default function AdminLuckyWheel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const[msg, setMsg] = useState("");

  const [dailyLimit, setDailyLimit] = useState(3);
  const [entryType, setEntryType] = useState("free");
  const[entryCost, setEntryCost] = useState(0);
  const [slices, setSlices] = useState(defaultSlices);

  const [forcedEnabled, setForcedEnabled] = useState(false);
  const[forcedSliceIndex, setForcedSliceIndex] = useState(null);
  const [caps, setCaps] = useState(defaultCaps);

  const slicePreview = useMemo(() => {
    return slices.map((s, idx) => ({
      ...s,
      label: s.label?.trim() || `Slice ${idx + 1}`,
      value: Number.isFinite(Number(s.value)) ? Number(s.value) : 0,
      type: SLICE_TYPES.some((t) => t.value === s.type) ? s.type : "try_again_free",
    }));
  }, [slices]);

  const capsPreview = useMemo(() => {
    const out = {};
    for (const t of SLICE_TYPES) {
      const raw = caps?.[t.value];
      const n = Number.isFinite(Number(raw)) ? parseInt(raw, 10) : 0;
      out[t.value] = Math.max(0, n);
    }
    return out;
  }, [caps]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setMsg("");

      const { data, error } = await supabase
        .from("luckywheel_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!mounted) return;

      if (error) {
        setMsg(`Error loading settings: ${error.message}`);
        setLoading(false);
        return;
      }

      setDailyLimit(data.daily_limit ?? 3);
      setEntryType(data.entry_type ?? "free");
      setEntryCost(data.entry_cost ?? 0);

      const incomingSlices = Array.isArray(data.slices) ? data.slices : null;
      setSlices(incomingSlices && incomingSlices.length === 4 ? incomingSlices : defaultSlices);

      setForcedEnabled(Boolean(data.forced_enabled ?? false));
      setForcedSliceIndex(Number.isInteger(data.forced_slice_index) ? data.forced_slice_index : null);

      const incomingCaps = data.daily_caps && typeof data.daily_caps === "object" ? data.daily_caps : null;
      setCaps({ ...defaultCaps, ...(incomingCaps || {}) });

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  },[]);

  const updateSlice = (index, patch) => {
    setSlices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const updateCap = (type, value) => {
    setCaps((prev) => ({ ...prev, [type]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMsg("");

    const cleanDaily = Math.max(1, parseInt(dailyLimit || 1, 10));
    const cleanCost = Math.max(0, parseInt(entryCost || 0, 10));

    const payloadSlices = slicePreview.map((s, idx) => ({
      label: s.label || `Slice ${idx + 1}`,
      type: SLICE_TYPES.some((t) => t.value === s.type) ? s.type : "try_again_free",
      value: Math.max(0, parseInt(s.value || 0, 10)),
    }));

    const forcedIdx =
      forcedEnabled && Number.isInteger(Number(forcedSliceIndex))
        ? Math.min(3, Math.max(0, parseInt(forcedSliceIndex, 10)))
        : null;

    const { error } = await supabase
      .from("luckywheel_settings")
      .update({
        daily_limit: cleanDaily,
        entry_type: entryType,
        entry_cost: entryType === "paid" ? cleanCost : 0,
        slices: payloadSlices,
        forced_enabled: forcedEnabled,
        forced_slice_index: forcedIdx,
        daily_caps: capsPreview,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setMsg(`Save failed: ${error.message}`);
    } else {
      setMsg("Settings saved successfully! ✅");
      setTimeout(() => setMsg(""), 4000);
    }
    setSaving(false);
  };

  return (
    <div className="admin-lw-container">
      <style>{styles}</style>
      
      <div className="admin-header-row">
        <div>
          <h2 className="admin-title">Lucky Wheel Settings</h2>
          <p className="admin-subtitle">Configure entries, slices, quotas, and forced outcomes.</p>
        </div>
        <div className="admin-header-actions">
          {msg && <span className={`admin-msg ${msg.includes("failed") ? "error" : "success"}`}>{msg}</span>}
          <button onClick={onSave} disabled={saving || loading} className="admin-btn-primary">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loader">Loading configuration...</div>
      ) : (
        <div className="admin-grid-layout">
          
          {/* LEFT COLUMN: Settings */}
          <div className="admin-col">
            
            {/* GENERAL SETTINGS */}
            <div className="admin-card">
              <h3 className="admin-card-title">General Entry Settings</h3>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Daily Limit (per user)</label>
                  <input type="number" min={1} value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} className="admin-input" />
                </div>
                <div className="admin-form-group">
                  <label>Entry Type</label>
                  <select value={entryType} onChange={(e) => setEntryType(e.target.value)} className="admin-input">
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Entry Cost (Coins)</label>
                  <input 
                    type="number" min={0} value={entryCost} 
                    onChange={(e) => setEntryCost(e.target.value)} 
                    className="admin-input" 
                    disabled={entryType !== "paid"} 
                  />
                </div>
              </div>
            </div>

            {/* SLICES CONFIGURATION */}
            <div className="admin-card">
              <h3 className="admin-card-title">Wheel Slices (4 Required)</h3>
              <div className="admin-slices-list">
                {slices.map((slice, idx) => (
                  <div key={idx} className="admin-slice-row">
                    <div className="admin-slice-badge" style={{ backgroundColor: SLICE_COLORS[idx] }}>
                      #{idx + 1}
                    </div>
                    <div className="admin-form-group">
                      <label>Label</label>
                      <input value={slice.label ?? `Slice ${idx + 1}`} onChange={(e) => updateSlice(idx, { label: e.target.value })} className="admin-input" placeholder={`Slice ${idx + 1}`} />
                    </div>
                    <div className="admin-form-group">
                      <label>Outcome Type</label>
                      <select value={slice.type ?? "try_again_free"} onChange={(e) => updateSlice(idx, { type: e.target.value })} className="admin-input">
                        {SLICE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label>Value {slice.type === "coins" ? "(Coins)" : ""}</label>
                      <input 
                        type="number" min={0} value={slice.value ?? 0} 
                        onChange={(e) => updateSlice(idx, { value: e.target.value })} 
                        className="admin-input" 
                        disabled={slice.type !== "coins" && slice.type !== "gift"} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Quotas, Forces, & Preview */}
          <div className="admin-col">

            {/* LIVE PREVIEW (Replacing JSON) */}
            <div className="admin-card preview-card">
              <h3 className="admin-card-title">Live Preview</h3>
              <div className="preview-layout">
                <div className="preview-wheel-container">
                  <div className="mini-wheel"></div>
                  <div className="mini-wheel-center"></div>
                  <div className="mini-wheel-pointer"></div>
                </div>
                <div className="preview-stats">
                  <div className="preview-stat-badge">
                    <span>Entry</span>
                    <strong>{entryType === "paid" ? `${entryCost} Coins` : "Free"}</strong>
                  </div>
                  <div className="preview-stat-badge">
                    <span>Daily Limit</span>
                    <strong>{dailyLimit} Draws</strong>
                  </div>
                  <div className="preview-stat-badge">
                    <span>Forced Outcome</span>
                    <strong>{forcedEnabled && forcedSliceIndex !== null ? `Slice ${forcedSliceIndex + 1}` : "Random"}</strong>
                  </div>
                </div>
              </div>
              
              <div className="preview-slice-legend">
                {slicePreview.map((s, idx) => (
                  <div key={idx} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: SLICE_COLORS[idx] }}></div>
                    <span className="legend-label">{s.label}</span>
                    <span className="legend-desc">({s.type === 'coins' ? `${s.value} Coins` : SLICE_TYPES.find(t=>t.value===s.type)?.label})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DAILY QUOTAS */}
            <div className="admin-card">
              <h3 className="admin-card-title">Daily Win Quotas (Global Caps)</h3>
              <p className="admin-help-text">Max unique users per day allowed to win each type. (999999 = unlimited)</p>
              <div className="admin-form-grid 2-col">
                {SLICE_TYPES.map((t) => (
                  <div key={t.value} className="admin-form-group">
                    <label>{t.label} Cap</label>
                    <input type="number" min={0} value={caps?.[t.value] ?? 0} onChange={(e) => updateCap(t.value, e.target.value)} className="admin-input" />
                  </div>
                ))}
              </div>
            </div>

            {/* FORCED OUTCOME */}
            <div className="admin-card">
              <h3 className="admin-card-title">Forced Outcome</h3>
              <p className="admin-help-text">Rig the wheel to land on a specific slice (if quota permits).</p>
              <div className="admin-form-grid 2-col">
                <div className="admin-form-group">
                  <label>Status</label>
                  <select value={forcedEnabled ? "yes" : "no"} onChange={(e) => setForcedEnabled(e.target.value === "yes")} className="admin-input">
                    <option value="no">Disabled (Random)</option>
                    <option value="yes">Enabled (Forced)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Target Slice</label>
                  <select 
                    value={forcedSliceIndex === null ? "" : String(forcedSliceIndex)} 
                    onChange={(e) => setForcedSliceIndex(e.target.value === "" ? null : parseInt(e.target.value, 10))} 
                    className="admin-input" disabled={!forcedEnabled}
                  >
                    <option value="">Select Target...</option>
                    {slices.map((_, i) => <option key={i} value={i}>Slice {i + 1}</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// CLEAN ADMIN CSS STYLES
// ----------------------------------------------------
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .admin-lw-container {
    font-family: 'Inter', system-ui, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    color: #0f172a;
    animation: fadeIn 0.4s ease;
  }

  .admin-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .admin-title { margin: 0 0 4px 0; font-size: 1.8rem; font-weight: 700; color: #1e293b; letter-spacing: -0.5px; }
  .admin-subtitle { margin: 0; color: #64748b; font-size: 0.95rem; }

  .admin-header-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  
  .admin-btn-primary {
    background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px;
    font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2);
  }
  .admin-btn-primary:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
  .admin-btn-primary:active:not(:disabled) { transform: translateY(1px); box-shadow: none; }
  .admin-btn-primary:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }

  .admin-msg { font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; }
  .admin-msg.success { background: #dcfce7; color: #166534; }
  .admin-msg.error { background: #fee2e2; color: #991b1b; }

  .admin-loader { text-align: center; padding: 40px; color: #64748b; font-weight: 500; }

  /* GRID LAYOUT */
  .admin-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  .admin-col { display: flex; flex-direction: column; gap: 20px; }

  /* CARDS */
  .admin-card {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  }
  .admin-card-title { margin: 0 0 16px 0; font-size: 1.1rem; font-weight: 600; color: #334155; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
  .admin-help-text { font-size: 0.8rem; color: #64748b; margin: -10px 0 14px 0; line-height: 1.4; }

  /* FORMS */
  .admin-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
  .admin-form-grid.2-col { grid-template-columns: 1fr 1fr; }
  
  .admin-form-group { display: flex; flex-direction: column; gap: 6px; }
  .admin-form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
  
  .admin-input {
    width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #cbd5e1;
    background: #f8fafc; font-family: inherit; font-size: 0.9rem; color: #0f172a;
    transition: all 0.2s; outline: none;
  }
  .admin-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  .admin-input:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }

  /* SLICES LIST */
  .admin-slices-list { display: flex; flex-direction: column; gap: 12px; }
  .admin-slice-row {
    display: grid; grid-template-columns: auto 2fr 1.5fr 1fr; gap: 12px; align-items: end;
    background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9;
  }
  .admin-slice-badge {
    width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 0.8rem; align-self: end; margin-bottom: 2px;
  }

  /* VISUAL PREVIEW WIDGET */
  .preview-card { background: linear-gradient(180deg, #ffffff, #f8fafc); }
  .preview-layout { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
  
  .preview-wheel-container { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
  .mini-wheel {
    width: 100%; height: 100%; border-radius: 50%;
    background: conic-gradient(#1E3A8A 0deg 90deg, #3B82F6 90deg 180deg, #0EA5E9 180deg 270deg, #8B5CF6 270deg 360deg);
    border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .mini-wheel-center {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 24px; height: 24px; background: #fff; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }
  .mini-wheel-pointer {
    position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #ef4444;
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
  }

  .preview-stats { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .preview-stat-badge {
    display: flex; justify-content: space-between; align-items: center;
    background: #fff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.85rem;
  }
  .preview-stat-badge span { color: #64748b; font-weight: 500; }
  .preview-stat-badge strong { color: #0f172a; font-weight: 700; }

  .preview-slice-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #fff; padding: 12px; border-radius: 10px; border: 1px dashed #cbd5e1; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
  .legend-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
  .legend-label { font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .legend-desc { color: #94a3b8; font-size: 0.75rem; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  /* RESPONSIVE OPTIMIZATION */
  @media (max-width: 900px) {
    .admin-grid-layout { grid-template-columns: 1fr; }
    .admin-card { padding: 16px; }
  }

  @media (max-width: 600px) {
    .admin-header-row { flex-direction: column; align-items: flex-start; gap: 12px; }
    .admin-slice-row { grid-template-columns: 1fr; gap: 10px; position: relative; padding-top: 36px; }
    .admin-slice-badge { position: absolute; top: 12px; left: 12px; margin: 0; width: auto; padding: 2px 8px; }
    .preview-layout { flex-direction: column; align-items: center; text-align: center; }
    .preview-stats { width: 100%; }
    .preview-slice-legend { grid-template-columns: 1fr; }
    .admin-form-grid.2-col { grid-template-columns: 1fr; }
  }
`;