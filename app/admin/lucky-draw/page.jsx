// app/admin/lucky-draw/page.jsx
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const DUBAI_OFFSET_MIN = 4 * 60; // +04:00

function dubaiLocalToISO(localValue) {
  if (!localValue) return null;
  const [datePart, timePart] = localValue.split("T");
  if (!datePart || !timePart) return null;

  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);

  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - DUBAI_OFFSET_MIN * 60 * 1000;
  return new Date(utcMs).toISOString();
}

function isoToDubaiLocalInput(isoString) {
  if (!isoString) return "";
  const ms = new Date(isoString).getTime() + DUBAI_OFFSET_MIN * 60 * 1000;
  const d = new Date(ms);

  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-` +
    `${pad(d.getUTCMonth() + 1)}-` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}:` +
    `${pad(d.getUTCMinutes())}`
  );
}

function dubaiNowPlusMinutesLocalInput(mins) {
  const ms = Date.now() + DUBAI_OFFSET_MIN * 60 * 1000 + mins * 60 * 1000;
  const d = new Date(ms);

  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-` +
    `${pad(d.getUTCMonth() + 1)}-` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}:` +
    `${pad(d.getUTCMinutes())}`
  );
}

const defaultPrize = () => ({ type: "coins", coins: 1000, name: "" });

// Simplified styles – only essential scrollbar and subtle transitions
const baseStyles = `
/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary-900), var(--primary-500));
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-300));
}

/* 2060 Design System */
:root {
  --primary-900: #1e3a8a;
  --primary-700: #1e4a8a;
  --primary-500: #3b82f6;
  --primary-300: #93c5fd;
  --primary-100: #dbeafe;
  --gray-900: #0f172a;
  --gray-700: #334155;
  --gray-500: #64748b;
  --gray-300: #cbd5e1;
  --gray-100: #f1f5f9;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.5);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.ld-animate-initial {
  animation: fadeInUp 0.3s ease forwards;
}

.ld-animate-header {
  animation: fadeInDown 0.3s ease 0.1s forwards;
  opacity: 0;
}

.ld-animate-stats {
  animation: fadeInUp 0.3s ease 0.2s forwards;
  opacity: 0;
}

.ld-animate-tabs {
  animation: fadeInUp 0.3s ease 0.3s forwards;
  opacity: 0;
}

.ld-animate-content {
  animation: fadeInUp 0.3s ease 0.4s forwards;
  opacity: 0;
}

.ld-animate-tab-content {
  animation: fadeInLeft 0.2s ease forwards;
}

.ld-animate-actions {
  animation: fadeInUp 0.3s ease 0.5s forwards;
  opacity: 0;
}

.ld-animate-footer {
  animation: fadeInUp 0.3s ease 0.6s forwards;
  opacity: 0;
}

.ld-animate-toast-in {
  animation: fadeInUp 0.2s ease forwards;
}

.ld-animate-toast-out {
  animation: fadeInDown 0.2s ease reverse forwards;
}

.ld-animate-prize {
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

.ld-card-hover:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.ld-tab-hover:hover {
  transform: translateY(-1px);
}

.ld-tab-active:active {
  transform: scale(0.98);
}

.ld-btn-hover:hover {
  transform: scale(1.02) translateY(-1px);
}

.ld-btn-active:active {
  transform: scale(0.98);
}

.ld-input-focus:focus {
  transform: scale(1.01);
}
`;

export default function AdminLuckyDraw() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [hoveredPrize, setHoveredPrize] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const saveButtonRef = useRef(null);

  // IMPORTANT: start empty, do not auto-default on first render
  const [title, setTitle] = useState("");
  const [entryType, setEntryType] = useState("free");
  const [entryCost, setEntryCost] = useState(0);

  const [drawsCount, setDrawsCount] = useState(1);
  const [intervalSeconds, setIntervalSeconds] = useState(10);

  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [drawAt, setDrawAt] = useState("");

  const [prizes, setPrizes] = useState([defaultPrize()]);

  // keep prizes length = drawsCount
  useEffect(() => {
    setPrizes((prev) => {
      const next = [...prev];
      const dc = Number(drawsCount || 1);
      if (next.length < dc) while (next.length < dc) next.push(defaultPrize());
      if (next.length > dc) next.length = dc;
      return next;
    });
  }, [drawsCount]);

  const loadSettings = async () => {
    // Deterministic load: we want row id=1
    const { data, error } = await supabase
      .from("luckydraw_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data || null };
  };

  const ensureRowExists = async () => {
    // Create id=1 if missing (or if select is blocked but upsert is allowed)
    const payload = {
      id: 1,
      title: "LuckyDraw June",
      entry_type: "free",
      entry_cost: 0,
      draws_count: 1,
      interval_seconds: 10,
      registration_open_at: dubaiLocalToISO(dubaiNowPlusMinutesLocalInput(10)),
      registration_close_at: dubaiLocalToISO(dubaiNowPlusMinutesLocalInput(11)),
      draw_at: dubaiLocalToISO(dubaiNowPlusMinutesLocalInput(12)),
      prizes: [defaultPrize()],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("luckydraw_settings").upsert(payload, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  };

  const applyToState = (data) => {
    setTitle(data.title ?? "LuckyDraw June");
    setEntryType(data.entry_type ?? "free");
    setEntryCost(data.entry_cost ?? 0);
    setDrawsCount(Number(data.draws_count ?? 1));
    setIntervalSeconds(Number(data.interval_seconds ?? 10));

    setOpenAt(isoToDubaiLocalInput(data.registration_open_at));
    setCloseAt(isoToDubaiLocalInput(data.registration_close_at));
    setDrawAt(isoToDubaiLocalInput(data.draw_at));

    const incoming = Array.isArray(data.prizes) ? data.prizes : null;
    setPrizes(incoming && incoming.length ? incoming : [defaultPrize()]);
  };

  // Load on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setMsg("");

      const first = await loadSettings();
      if (!mounted) return;

      if (!first.ok) {
        showMessage(`Error loading settings: ${first.error}`, "error");
        setLoading(false);
        return;
      }

      if (!first.data) {
        // row missing -> create -> reload
        const created = await ensureRowExists();
        if (!created.ok) {
          showMessage(`Settings row missing and create failed: ${created.error}`, "error");
          setLoading(false);
          return;
        }

        const again = await loadSettings();
        if (again.ok && again.data) applyToState(again.data);
        setLoading(false);
        return;
      }

      applyToState(first.data);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const showMessage = (text, type = "info") => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg("");
      setMsgType("info");
    }, 4000);
  };

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    const openISO = dubaiLocalToISO(openAt);
    const closeISO = dubaiLocalToISO(closeAt);
    const drawISO = dubaiLocalToISO(drawAt);

    if (!openISO || !closeISO || !drawISO) {
      errors.schedule = "Please fill all schedule times";
    } else {
      if (new Date(openISO).getTime() >= new Date(closeISO).getTime()) {
        errors.schedule = "Open time must be before close time";
      }
      if (new Date(closeISO).getTime() >= new Date(drawISO).getTime()) {
        errors.schedule = "Draw time must be after registration close";
      }
    }

    if (entryType === "paid" && (entryCost <= 0 || isNaN(entryCost))) {
      errors.entryCost = "Entry cost must be greater than 0";
    }

    // Validate prizes
    prizes.slice(0, Number(drawsCount || 1)).forEach((prize, index) => {
      if (prize.type === "coins" && (!prize.coins || prize.coins < 1)) {
        errors[`prize_${index}`] = `Prize ${index + 1} coins must be at least 1`;
      }
      if (prize.type === "item" && !prize.name?.trim()) {
        errors[`prize_${index}`] = `Prize ${index + 1} item name is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const cleanPrizes = useMemo(() => {
    const dc = Number(drawsCount || 1);
    return prizes.slice(0, dc).map((p, idx) => {
      const type = p.type === "item" ? "item" : "coins";
      if (type === "coins") {
        return {
          type: "coins",
          coins: Math.max(1, parseInt(p.coins || 0, 10) || 0),
          name: "",
          label: `Prize ${idx + 1}`,
        };
      }
      return {
        type: "item",
        coins: 0,
        name: (p.name || "").trim() || "Other",
        label: `Prize ${idx + 1}`,
      };
    });
  }, [prizes, drawsCount]);

  const updatePrize = (idx, patch) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    // Clear validation error for this prize
    if (validationErrors[`prize_${idx}`]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[`prize_${idx}`];
        return next;
      });
    }
  };

  const onSave = async () => {
    if (!validateForm()) {
      showMessage("Please fix validation errors", "error");
      return;
    }

    setSaving(true);
    setMsg("");

    const cleanDraws = Math.max(1, Math.min(10, parseInt(drawsCount || 1, 10)));
    const cleanCost = Math.max(0, parseInt(entryCost || 0, 10));
    const cleanInterval = Math.max(1, parseInt(intervalSeconds || 10, 10));

    const openISO = dubaiLocalToISO(openAt);
    const closeISO = dubaiLocalToISO(closeAt);
    const drawISO = dubaiLocalToISO(drawAt);

    const { error } = await supabase
      .from("luckydraw_settings")
      .upsert(
        {
          id: 1,
          title: title.trim(),
          entry_type: entryType,
          entry_cost: entryType === "paid" ? cleanCost : 0,
          draws_count: cleanDraws,
          interval_seconds: cleanInterval,
          registration_open_at: openISO,
          registration_close_at: closeISO,
          draw_at: drawISO,
          prizes: cleanPrizes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      showMessage(`Save failed: ${error.message}`, "error");
      setSaving(false);
      return;
    }

    // publish into active draw
    const pub = await supabase.rpc("ld_publish_active");
    if (pub.error) {
      showMessage(`Saved but publish failed: ${pub.error.message}`, "warning");
      setSaving(false);
      return;
    }

    // Reload from DB so the page cannot "shift"
    const again = await loadSettings();
    if (again.ok && again.data) {
      applyToState(again.data);
    }

    showMessage("Settings saved successfully! ✨", "success");
    setSaving(false);
  };

  const onRunDrawNow = async () => {
    setMsg("");
    const { data, error } = await supabase.rpc("ld_run_draw_now");
    if (error) return showMessage(`Draw failed: ${error.message}`, "error");
    if (!data?.ok) return showMessage(data?.error || "Draw failed", "error");
    showMessage("Draw executed successfully! 🎲", "success");
  };

  const getMessageStyles = () => {
    const base = {
      padding: "16px 20px",
      borderRadius: 16,
      fontWeight: 600,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.3)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    };

    switch (msgType) {
      case "success":
        return { ...base, background: "rgba(16, 185, 129, 0.2)", color: "#065f46", borderColor: "#10b981" };
      case "error":
        return { ...base, background: "rgba(239, 68, 68, 0.2)", color: "#991b1b", borderColor: "#ef4444" };
      case "warning":
        return { ...base, background: "rgba(245, 158, 11, 0.2)", color: "#92400e", borderColor: "#f59e0b" };
      default:
        return { ...base, background: "rgba(59, 130, 246, 0.1)", color: "#1e3a8a", borderColor: "#3b82f6" };
    }
  };

  return (
    <div
      className="ld-animate-initial"
      style={{ 
        padding: 24, 
        maxWidth: 1200, 
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e6edf5 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <style>{baseStyles}</style>

      {/* Background Orbs – static, no animation */}
      <div style={{
        position: "fixed",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "rgba(59, 130, 246, 0.1)",
        filter: "blur(80px)",
        top: "-200px",
        left: "-200px",
        zIndex: 0
      }} />
      <div style={{
        position: "fixed",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "rgba(30, 58, 138, 0.1)",
        filter: "blur(80px)",
        bottom: "-150px",
        right: "-150px",
        zIndex: 0
      }} />

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="ld-animate-header" style={{ marginBottom: 30 }}>
          <h1 style={{ 
            fontSize: "3rem", 
            margin: 0,
            background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 6px rgba(30, 58, 138, 0.2))"
          }}>
            Lucky Draw 2060
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.1rem", marginTop: 5 }}>
            Next-generation draw management system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="ld-animate-stats" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16,
          marginBottom: 24
        }}>
          {[
            { label: "Total Draws", value: drawsCount, icon: "🎲", color: "#3b82f6" },
            { label: "Entry Type", value: entryType === "free" ? "Free Entry" : "Paid Entry", icon: entryType === "free" ? "🎟️" : "💰", color: "#10b981" },
            { label: "Interval", value: `${intervalSeconds}s`, icon: "⏱️", color: "#f59e0b" },
            { label: "Status", value: loading ? "Loading..." : "Active", icon: "⚡", color: "#ef4444" }
          ].map((stat, index) => (
            <div
              key={index}
              className="ld-card-hover"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2rem" }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b" }}>{stat.label}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ld-animate-tabs" style={{ 
          display: "flex", 
          gap: 10, 
          marginBottom: 20,
          borderBottom: "2px solid rgba(203, 213, 225, 0.5)",
          paddingBottom: 10
        }}>
          {[
            { id: "basic", label: "Basic Settings", icon: "⚙️" },
            { id: "schedule", label: "Schedule", icon: "📅" },
            { id: "prizes", label: "Prizes", icon: "🏆" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`ld-tab-hover ${activeTab === tab.id ? "ld-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: activeTab === tab.id 
                  ? "linear-gradient(135deg, #1e3a8a, #3b82f6)"
                  : "rgba(255,255,255,0.5)",
                color: activeTab === tab.id ? "#fff" : "#334155",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                boxShadow: activeTab === tab.id 
                  ? "0 10px 20px rgba(59, 130, 246, 0.3)"
                  : "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{
            width: 60,
            height: 60,
            border: "4px solid var(--gray-300)",
            borderTop: "4px solid var(--primary-500)",
            borderRadius: "50%",
            margin: "100px auto",
            animation: "spin 1s linear infinite"
          }} />
        ) : (
          <div className="ld-animate-content" style={{ 
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: 24,
            padding: 30,
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            {/* Basic Settings Tab */}
            {activeTab === "basic" && (
              <div className="ld-animate-tab-content" style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Draw Title
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: validationErrors.title ? "2px solid #ef4444" : "2px solid #e5e7eb",
                        fontSize: "1rem",
                        background: "#ffffff",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Grand Draw 2026"
                    />
                    {validationErrors.title && (
                      <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 5 }}>{validationErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Entry Type
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem",
                        background: "#ffffff"
                      }}
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value)}
                    >
                      <option value="free">🎟️ Free Entry</option>
                      <option value="paid">💰 Paid Entry (Coins)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Entry Cost (Coins)
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: validationErrors.entryCost ? "2px solid #ef4444" : "2px solid #e5e7eb",
                        fontSize: "1rem",
                        background: entryType === "paid" ? "#ffffff" : "#f1f5f9",
                        opacity: entryType === "paid" ? 1 : 0.6,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="number"
                      min={1}
                      disabled={entryType !== "paid"}
                      value={entryCost}
                      onChange={(e) => setEntryCost(e.target.value)}
                    />
                    {validationErrors.entryCost && (
                      <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 5 }}>{validationErrors.entryCost}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Number of Draws
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="number"
                      min={1}
                      max={10}
                      value={drawsCount}
                      onChange={(e) => setDrawsCount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Seconds Between Draws
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e5e7eb",
                        fontSize: "1rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="number"
                      min={1}
                      value={intervalSeconds}
                      onChange={(e) => setIntervalSeconds(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <div className="ld-animate-tab-content" style={{ display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Registration Opens (UAE)
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: validationErrors.schedule ? "2px solid #ef4444" : "2px solid #e5e7eb",
                        fontSize: "1rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="datetime-local"
                      value={openAt}
                      onChange={(e) => setOpenAt(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Registration Closes (UAE)
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: validationErrors.schedule ? "2px solid #ef4444" : "2px solid #e5e7eb",
                        fontSize: "1rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="datetime-local"
                      value={closeAt}
                      onChange={(e) => setCloseAt(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: "#1e3a8a" }}>
                      Draw Time (UAE)
                    </label>
                    <input
                      className="ld-input-focus"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: validationErrors.schedule ? "2px solid #ef4444" : "2px solid #e5e7eb",
                        fontSize: "1rem",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none"
                      }}
                      type="datetime-local"
                      value={drawAt}
                      onChange={(e) => setDrawAt(e.target.value)}
                    />
                  </div>
                </div>
                
                {validationErrors.schedule && (
                  <div style={{
                    padding: 12,
                    borderRadius: 8,
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    animation: "fadeInDown 0.3s ease"
                  }}>
                    ⚠️ {validationErrors.schedule}
                  </div>
                )}

                <div style={{ marginTop: 10, fontSize: "0.9rem", color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.2rem" }}>⏰</span>
                  All times are in Dubai (UAE) timezone
                </div>
              </div>
            )}

            {/* Prizes Tab */}
            {activeTab === "prizes" && (
              <div className="ld-animate-tab-content" style={{ display: "grid", gap: 20 }}>
                {prizes.slice(0, Number(drawsCount || 1)).map((prize, index) => (
                  <div
                    key={index}
                    className="ld-animate-prize ld-card-hover"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      border: hoveredPrize === index 
                        ? "2px solid #3b82f6" 
                        : validationErrors[`prize_${index}`]
                          ? "2px solid #ef4444"
                          : "2px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 20,
                      background: hoveredPrize === index ? "rgba(59, 130, 246, 0.02)" : "#ffffff",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={() => setHoveredPrize(index)}
                    onMouseLeave={() => setHoveredPrize(null)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 15 }}>
                      <span style={{ 
                        fontSize: "1.5rem",
                        background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff"
                      }}>
                        #{index + 1}
                      </span>
                      <h3 style={{ margin: 0, color: "#1e3a8a" }}>Draw #{index + 1} Prize</h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                      <div>
                        <label style={{ display: "block", marginBottom: 5, fontSize: "0.9rem", color: "#64748b" }}>
                          Prize Type
                        </label>
                        <select
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: "1rem"
                          }}
                          value={prize.type}
                          onChange={(e) => updatePrize(index, { type: e.target.value })}
                        >
                          <option value="coins">💰 Coins</option>
                          <option value="item">🎁 Item / Other</option>
                        </select>
                      </div>

                      {prize.type === "coins" ? (
                        <div>
                          <label style={{ display: "block", marginBottom: 5, fontSize: "0.9rem", color: "#64748b" }}>
                            Coins Amount
                          </label>
                          <input
                            className="ld-input-focus"
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 8,
                              border: validationErrors[`prize_${index}`] ? "1px solid #ef4444" : "1px solid #e5e7eb",
                              fontSize: "1rem",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              outline: "none"
                            }}
                            type="number"
                            min={1}
                            value={prize.coins}
                            onChange={(e) => updatePrize(index, { coins: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: "block", marginBottom: 5, fontSize: "0.9rem", color: "#64748b" }}>
                            Item Description
                          </label>
                          <input
                            className="ld-input-focus"
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 8,
                              border: validationErrors[`prize_${index}`] ? "1px solid #ef4444" : "1px solid #e5e7eb",
                              fontSize: "1rem",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              outline: "none"
                            }}
                            value={prize.name || ""}
                            placeholder="e.g., iPhone 15, PlayStation 5, Gift Card..."
                            onChange={(e) => updatePrize(index, { name: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    {validationErrors[`prize_${index}`] && (
                      <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: 10 }}>
                        ⚠️ {validationErrors[`prize_${index}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Display */}
        {msg && (
          <div
            className={msg ? "ld-animate-toast-in" : "ld-animate-toast-out"}
            style={{
              ...getMessageStyles(),
              marginTop: 20,
              position: "fixed",
              bottom: 30,
              right: 30,
              maxWidth: 400,
              zIndex: 1000
            }}
          >
            {msgType === "success" && "✅ "}
            {msgType === "error" && "❌ "}
            {msgType === "warning" && "⚠️ "}
            {msg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="ld-animate-actions" style={{ 
          display: "flex", 
          gap: 15, 
          marginTop: 30,
          justifyContent: "flex-end"
        }}>
          <button
            ref={saveButtonRef}
            className="ld-btn-hover ld-btn-active"
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "16px 32px",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 15px 25px rgba(59, 130, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: saving ? 0.7 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {saving ? (
              <>
                <span>⚙️</span>
                Saving...
              </>
            ) : (
              <>
                💾 Save Settings
              </>
            )}
          </button>

          <button
            className="ld-btn-hover ld-btn-active"
            onClick={onRunDrawNow}
            style={{
              padding: "16px 32px",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 15px 25px rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            🎲 Run Draw Now
          </button>
        </div>

        {/* Footer */}
        <div className="ld-animate-footer" style={{
          marginTop: 40,
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.9rem",
          padding: 20,
          borderTop: "1px solid rgba(203, 213, 225, 0.3)"
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10 }}>
            <span>⚡ Real-time updates</span>
            <span>🔒 Secured by Supabase</span>
            <span>🎯 Dubai Timezone</span>
          </div>
          <p>Lucky Draw Management System v2.0 - 2060 Edition</p>
        </div>
      </div>
    </div>
  );
}