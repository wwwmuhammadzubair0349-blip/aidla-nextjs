// app/admin/tests/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

// ── Server-side API helper (passes auth token to protected routes) ─────────────
async function adminFetch(path, opts = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || "";
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  return res.json();
}

const UAE_TZ = "Asia/Dubai";

function fmtUAE(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", { timeZone: UAE_TZ });
}

// ── FIX: Correctly convert UTC ISO → UAE local datetime-local string ──
function toLocalInputValueUAE(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  // Get date/time parts in UAE timezone
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UAE_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find(p => p.type === type)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

// ── FIX: Convert UAE local datetime-local string → UTC ISO ──
function localInputToISO(localValue) {
  if (!localValue) return null;
  // localValue is "YYYY-MM-DDTHH:mm" in UAE time
  // UAE is UTC+4, so subtract 4 hours to get UTC
  const [datePart, timePart] = localValue.split("T");
  const [y, mo, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  // Create date as if UTC, then subtract UAE offset (+4h = +14400000ms)
  const utcMs = Date.UTC(y, mo - 1, d, h, mi) - 4 * 60 * 60 * 1000;
  return new Date(utcMs).toISOString();
}

const emptyTest = () => ({
  title: "New Test",
  description: "",
  status: "scheduled",
  entry_type: "free",
  entry_cost: 0,

  registration_open_at: "",
  registration_close_at: "",
  test_start_at: "",
  test_end_at: "",
  results_announce_at: "",

  questions_per_user: 10,
  time_per_question_sec: 10,
  allow_late_entry_until_end: true,

  revive_enabled: true,
  revive_limit: 1,
  revive_price: 5,

  skip_enabled: true,
  skip_limit: 1,
  skip_price: 5,

  add_time_enabled: true,
  add_time_limit: 1,
  add_time_price: 5,
  add_time_seconds: 5,

  max_winners: 3,
  blur_limit: 3,
  auto_kick_on_blur: false,
});

export default function AdminTests() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info"); // "info" | "error" | "success"

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyTest());

  const [bulkJson, setBulkJson] = useState("");
  const [activeTab, setActiveTab] = useState("details"); // "details" | "questions" | "sponsors" | "prizes" | "winners"

  const [sponsors, setSponsors] = useState([]);
  const [newSponsor, setNewSponsor] = useState({
    name: "",
    sponsor_type: "title",
    image_url: "",
    link_url: "",
    enabled: true,
    priority: 1,
    placements: {
      test_list: true,
      registration: true,
      enter_modal: true,
      powerup_popups: true,
      between_questions: true,
      leaderboard: true,
      results: true,
    },
  });

  const [prizes, setPrizes] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedWinners, setSelectedWinners] = useState([]);

  const showMsg = (text, type = "info") => { setMsg(text); setMsgType(type); };

  const loadTests = async () => {
    showMsg("", "info");
    setLoading(true);
    const { data, error } = await supabase
      .from("test_tests")
      .select("*")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) { showMsg("Load failed: " + error.message, "error"); setLoading(false); return; }
    setTests(data || []);
    setLoading(false);
  };

  const loadExtras = async (testId) => {
    const s = await supabase.from("test_sponsors").select("*").eq("test_id", testId).order("priority", { ascending: true });
    setSponsors(s.data || []);
    const p = await supabase.from("test_prizes").select("*").eq("test_id", testId).order("rank_no", { ascending: true });
    setPrizes(p.data || []);
    const c = await supabase.from("test_winner_candidates").select("*").eq("test_id", testId).order("rank_no", { ascending: true });
    setCandidates(c.data || []);
    setSelectedWinners([]);
  };

  useEffect(() => { loadTests(); }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyTest());
    setSponsors([]); setPrizes([]); setCandidates([]); setSelectedWinners([]);
    setBulkJson(""); setActiveTab("details");
    showMsg("", "info");
  };

  const startEdit = async (t) => {
    setEditingId(t.id);
    setForm({
      ...t,
      registration_open_at:  t.registration_open_at  ? toLocalInputValueUAE(t.registration_open_at)  : "",
      registration_close_at: t.registration_close_at ? toLocalInputValueUAE(t.registration_close_at) : "",
      test_start_at:         t.test_start_at         ? toLocalInputValueUAE(t.test_start_at)         : "",
      test_end_at:           t.test_end_at           ? toLocalInputValueUAE(t.test_end_at)           : "",
      results_announce_at:   t.results_announce_at   ? toLocalInputValueUAE(t.results_announce_at)   : "",
    });
    setBulkJson(""); setActiveTab("details");
    await loadExtras(t.id);
  };

  const saveTest = async () => {
    showMsg("", "info");
    const payload = {
      ...form,
      entry_cost:           form.entry_type === "paid" ? Math.max(0, parseInt(form.entry_cost || 0, 10)) : 0,
      questions_per_user:   Math.max(1, parseInt(form.questions_per_user || 10, 10)),
      time_per_question_sec:Math.max(1, parseInt(form.time_per_question_sec || 10, 10)),
      revive_limit:         Math.max(0, parseInt(form.revive_limit || 0, 10)),
      revive_price:         Math.max(0, parseInt(form.revive_price || 0, 10)),
      skip_limit:           Math.max(0, parseInt(form.skip_limit || 0, 10)),
      skip_price:           Math.max(0, parseInt(form.skip_price || 0, 10)),
      add_time_limit:       Math.max(0, parseInt(form.add_time_limit || 0, 10)),
      add_time_price:       Math.max(0, parseInt(form.add_time_price || 0, 10)),
      add_time_seconds:     Math.max(1, parseInt(form.add_time_seconds || 5, 10)),
      max_winners:          Math.max(1, parseInt(form.max_winners || 3, 10)),
      blur_limit:           Math.max(0, parseInt(form.blur_limit || 0, 10)),
      registration_open_at:  form.registration_open_at  ? localInputToISO(form.registration_open_at)  : null,
      registration_close_at: form.registration_close_at ? localInputToISO(form.registration_close_at) : null,
      test_start_at:         form.test_start_at         ? localInputToISO(form.test_start_at)         : null,
      test_end_at:           form.test_end_at           ? localInputToISO(form.test_end_at)           : null,
      results_announce_at:   form.results_announce_at   ? localInputToISO(form.results_announce_at)   : null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.title?.trim()) { showMsg("Title required", "error"); return; }

    // Block saves on live tests (server also enforces this)
    if (selectedTest?.status === "live" && form.status === "live") {
      showMsg("Test is live — only status and schedule fields can be changed.", "error"); return;
    }

    if (!editingId) {
      // ── CREATE via server-side API ──
      const result = await adminFetch("/api/admin/tests", {
        method: "POST",
        body: JSON.stringify({ ...payload, title: payload.title.trim() }),
      });
      if (result.error) { showMsg("Create failed: " + result.error, "error"); return; }
      showMsg("Created ✅ — sending announcement email…", "success");
      await loadTests();
      await startEdit(result.data);
      // Send new test announcement email (non-blocking)
      adminFetch("/api/admin/tests/notify", {
        method: "POST",
        body: JSON.stringify({ test_id: result.data.id, type: "new_test" }),
      }).then(r => r.ok ? showMsg("Created ✅ — announcement email sent", "success") : null).catch(() => {});
      return;
    }

    // ── UPDATE via server-side API ──
    const prevStatus = selectedTest?.status;
    const result = await adminFetch("/api/admin/tests", {
      method: "PUT",
      body: JSON.stringify({ id: editingId, ...payload }),
    });
    if (result.error) { showMsg("Save failed: " + result.error, "error"); return; }
    showMsg("Saved ✅", "success");
    await loadTests();

    // Email triggers on status transitions
    if (prevStatus !== form.status) {
      if (form.status === "live") {
        showMsg("Saved ✅ — sending 'test started' emails to registered users…", "success");
        adminFetch("/api/admin/tests/notify", {
          method: "POST",
          body: JSON.stringify({ test_id: editingId, type: "test_started" }),
        }).then(r => r.sent != null ? showMsg(`Saved ✅ — started email sent to ${r.sent} users`, "success") : null).catch(() => {});
      } else if (form.status === "ended") {
        showMsg("Saved ✅ — sending qualification emails…", "success");
        adminFetch("/api/admin/tests/notify", {
          method: "POST",
          body: JSON.stringify({ test_id: editingId, type: "test_ended_qualified" }),
        }).then(r => r.sent != null ? showMsg(`Saved ✅ — qualification email sent to ${r.sent} users`, "success") : null).catch(() => {});
      }
    }
  };

  const deleteTest = async (id) => {
    const t = tests.find(x => x.id === id);
    if (t?.status === "live") { showMsg("Cannot delete a live test.", "error"); return; }
    if (!window.confirm(`Delete "${t?.title || "this test"}"?\n\nThis will also remove all related registrations and leaderboard data. This action cannot be undone.`)) return;
    showMsg("", "info");
    const result = await adminFetch("/api/admin/tests", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (result.error) { showMsg("Delete failed: " + result.error, "error"); return; }
    showMsg("Deleted ✅", "success");
    setEditingId(null); setForm(emptyTest());
    await loadTests();
  };

  const bulkInsertQuestions = async () => {
    showMsg("", "info");
    if (!editingId) { showMsg("Select a test first.", "error"); return; }
    let arr;
    try {
      arr = JSON.parse(bulkJson);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array");
    } catch (e) { showMsg("Invalid JSON: " + e.message, "error"); return; }

    const rows = arr.map((q) => ({
      test_id: editingId,
      question_text: String(q.question_text || q.question || "").trim(),
      options: q.options ?? { A: q.A, B: q.B, C: q.C, D: q.D },
      correct_option: String(q.correct_option || q.correct || "").trim(),
      explanation: q.explanation ?? null,
      difficulty: q.difficulty ?? null,
      tags: q.tags ?? null,
      is_active: q.is_active !== false,
    })).filter((x) => {
      if (!x.question_text || !x.correct_option) return false;
      if (!x.options || typeof x.options !== "object") return false;
      const optKeys = Object.keys(x.options);
      if (optKeys.length < 2) return false;
      if (!optKeys.includes(x.correct_option)) return false; // correct_option must be a valid key
      return true;
    });

    if (rows.length === 0) { showMsg("No valid questions found.", "error"); return; }
    const { error } = await supabase.from("test_questions").insert(rows);
    if (error) { showMsg("Insert failed: " + error.message, "error"); return; }
    showMsg(`Inserted ${rows.length} questions ✅`, "success");
    setBulkJson("");
  };

  const addSponsor = async () => {
    showMsg("", "info");
    if (!editingId) { showMsg("Select a test first.", "error"); return; }
    if (!newSponsor.name.trim()) { showMsg("Sponsor name required.", "error"); return; }
    if (sponsors.length >= 5) { showMsg("Max 5 sponsors allowed.", "error"); return; }
    const { error } = await supabase.from("test_sponsors").insert([{ ...newSponsor, test_id: editingId }]);
    if (error) { showMsg("Sponsor add failed: " + error.message, "error"); return; }
    setNewSponsor(s => ({ ...s, name: "", image_url: "", link_url: "" }));
    await loadExtras(editingId);
    showMsg("Sponsor added ✅", "success");
  };

  const toggleSponsor = async (id, enabled) => {
    const { error } = await supabase.from("test_sponsors").update({ enabled }).eq("id", id);
    if (error) { showMsg("Sponsor update failed: " + error.message, "error"); return; }
    await loadExtras(editingId);
  };

  const upsertPrize = async (rankNo, prizeType, prizeText, coins) => {
    showMsg("", "info");
    if (!editingId) { showMsg("Select a test first.", "error"); return; }
    const payload = {
      test_id: editingId, rank_no: rankNo, prize_type: prizeType,
      prize_text: prizeText || "",
      coins_amount: prizeType === "coins" ? Number(coins || 0) : 0,
      prize: prizeType === "coins" ? { coins: Number(coins || 0) } : { name: prizeText || "Item" },
      enabled: true,
    };
    const { error } = await supabase.from("test_prizes").upsert(payload, { onConflict: "test_id,rank_no" });
    if (error) { showMsg("Prize save failed: " + error.message, "error"); return; }
    await loadExtras(editingId);
    showMsg("Prize saved ✅", "success");
  };

  const generateCandidates = async () => {
    showMsg("", "info");
    if (!editingId) { showMsg("Select a test first.", "error"); return; }
    const result = await adminFetch("/api/admin/tests/generate-candidates", {
      method: "POST",
      body: JSON.stringify({ test_id: editingId }),
    });
    if (result.error) { showMsg("Generate failed: " + result.error, "error"); return; }
    await loadExtras(editingId);
    showMsg("Candidates generated ✅", "success");
  };

  const approveWinners = async () => {
    showMsg("", "info");
    if (!editingId) { showMsg("Select a test first.", "error"); return; }
    if (selectedWinners.length === 0) { showMsg("Select winners first.", "error"); return; }

    // ── Confirmation required (irreversible financial action) ──
    const names = candidates
      .filter(c => selectedWinners.includes(c.user_id))
      .map(c => `${c.rank_no === 1 ? "🥇" : c.rank_no === 2 ? "🥈" : "🥉"} ${c.user_name}`)
      .join("\n");
    if (!window.confirm(
      `Approve ${selectedWinners.length} winner(s)?\n\n${names}\n\nThis action:\n• Cannot be undone\n• Will announce winners publicly\n• Will send winner emails automatically\n\nProceed?`
    )) return;

    showMsg("Approving winners and sending emails…", "info");
    const result = await adminFetch("/api/admin/tests/approve-winners", {
      method: "POST",
      body: JSON.stringify({ test_id: editingId, winner_ids: selectedWinners }),
    });
    if (result.error) { showMsg("Approve failed: " + result.error, "error"); return; }
    showMsg("Winners approved ✅ — winner emails sent automatically", "success");
    await loadTests(); await loadExtras(editingId);
  };

  const selectedTest = useMemo(() => tests.find((x) => x.id === editingId) || null, [tests, editingId]);

  const statusColors = {
    draft: { bg: "rgba(100,116,139,0.1)", color: "#475569", border: "rgba(100,116,139,0.2)" },
    scheduled: { bg: "rgba(245,158,11,0.1)", color: "#b45309", border: "rgba(245,158,11,0.25)" },
    live: { bg: "rgba(22,163,74,0.1)", color: "#15803d", border: "rgba(22,163,74,0.25)" },
    ended: { bg: "rgba(30,58,138,0.08)", color: "#1e3a8a", border: "rgba(30,58,138,0.2)" },
    results_published: { bg: "rgba(251,191,36,0.1)", color: "#b45309", border: "rgba(251,191,36,0.3)" },
    cancelled: { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
  };

  const tabs = [
    { id: "details",   label: "Details",   icon: "📋" },
    { id: "questions", label: "Questions", icon: "❓" },
    { id: "sponsors",  label: "Sponsors",  icon: "🤝" },
    { id: "prizes",    label: "Prizes",    icon: "🏆" },
    { id: "winners",   label: "Winners",   icon: "🎖" },
  ];

  return (
    <div style={styles.page}>
      <style>{adminCSS}</style>

      {/* Header */}
      <div className="at-header">
        <div className="at-header-icon">⚙️</div>
        <div>
          <h1 className="at-title">Admin Tests</h1>
          <div className="at-sub">Manage competitive quiz tests</div>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`at-msg at-msg-${msgType}`}>
          <span>{msg}</span>
          <button className="at-msg-close" onClick={() => setMsg("")}>×</button>
        </div>
      )}

      <div className="at-grid">
        {/* LEFT: List */}
        <div className="at-card at-list-card">
          <div className="at-list-header">
            <span className="at-card-title">All Tests</span>
            <button onClick={startCreate} className="at-btn at-btn-primary">+ New Test</button>
          </div>

          {loading ? (
            <div className="at-loading"><div className="at-spinner" /> Loading…</div>
          ) : tests.length === 0 ? (
            <div className="at-empty">No tests yet. Create one!</div>
          ) : (
            <div className="at-list-scroll">
              {tests.map(t => {
                const sc = statusColors[t.status] || statusColors.draft;
                return (
                  <div key={t.id} className={`at-test-item ${editingId === t.id ? "at-test-item-active" : ""}`}>
                    <div className="at-test-item-body" onClick={() => startEdit(t)}>
                      <div className="at-test-item-top">
                        <span className="at-test-item-name">{t.title}</span>
                        <span className="at-status-pill" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {t.status}
                        </span>
                      </div>
                      <div className="at-test-item-meta">
                        {t.entry_type === "paid" ? `⭐ ${t.entry_cost} perks` : "🆓 Free"} · {t.questions_per_user}Qs · {t.time_per_question_sec}s/Q
                      </div>
                      <div className="at-test-item-dates">
                        <span>📅 {fmtUAE(t.registration_open_at)}</span>
                        <span>🏁 {fmtUAE(t.test_end_at)}</span>
                      </div>
                    </div>
                    <button onClick={() => deleteTest(t.id)} className="at-delete-btn" title="Delete">🗑</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Editor */}
        <div className="at-card at-editor-card">
          {/* Editor Header */}
          <div className="at-editor-header">
            <div>
              <div className="at-card-title">{editingId ? "Edit Test" : "Create Test"}</div>
              {selectedTest && <div className="at-id-badge">ID: {selectedTest.id}</div>}
            </div>
            <button onClick={saveTest} disabled={selectedTest?.status === "live" && form.status === "live"} className="at-btn at-btn-save">💾 Save</button>
          </div>

          {/* Live test lock warning */}
          {selectedTest?.status === "live" && (
            <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: "0.82rem", fontWeight: 700, color: "#dc2626" }}>
              🔴 This test is LIVE — editing is locked. Only status and schedule fields can be changed.
            </div>
          )}

          {/* Tabs */}
          {editingId && (
            <div className="at-tabs">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`at-tab ${activeTab === t.id ? "at-tab-active" : ""}`}>
                  <span className="at-tab-icon">{t.icon}</span>
                  <span className="at-tab-label">{t.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── TAB: DETAILS ── */}
          {(!editingId || activeTab === "details") && (
            <div className="at-form">
              <div className="at-section-title">Basic Info</div>
              <div className="at-grid2">
                <div className="at-field at-col-2">
                  <label className="at-label">Title *</label>
                  <input className="at-input" value={form.title} onChange={e => setForm(x => ({ ...x, title: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Status</label>
                  <select className="at-input" value={form.status} onChange={e => setForm(x => ({ ...x, status: e.target.value }))}>
                    <option value="draft">draft</option>
                    <option value="scheduled">scheduled</option>
                    <option value="live">live</option>
                    <option value="ended">ended</option>
                    <option value="results_published">results_published</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
                <div className="at-field at-col-2">
                  <label className="at-label">Description</label>
                  <input className="at-input" value={form.description || ""} onChange={e => setForm(x => ({ ...x, description: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Entry Type</label>
                  <select className="at-input" value={form.entry_type} onChange={e => setForm(x => ({ ...x, entry_type: e.target.value }))}>
                    <option value="free">free</option>
                    <option value="paid">paid</option>
                  </select>
                </div>
                <div className="at-field">
                  <label className="at-label">Entry Cost (perks)</label>
                  <input className="at-input" type="number" disabled={form.entry_type !== "paid"} value={form.entry_cost} onChange={e => setForm(x => ({ ...x, entry_cost: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Questions per user</label>
                  <input className="at-input" type="number" value={form.questions_per_user} onChange={e => setForm(x => ({ ...x, questions_per_user: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Time per question (sec)</label>
                  <input className="at-input" type="number" value={form.time_per_question_sec} onChange={e => setForm(x => ({ ...x, time_per_question_sec: e.target.value }))} />
                </div>
              </div>

              <div className="at-section-title" style={{ marginTop: 18 }}>📅 Schedule (UAE Time)</div>
              <div className="at-grid2">
                <div className="at-field">
                  <label className="at-label">Registration Opens</label>
                  <input className="at-input" type="datetime-local" value={form.registration_open_at} onChange={e => setForm(x => ({ ...x, registration_open_at: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label" title="Legacy field — registration now closes automatically at Test Start time">Registration Closes <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>(unused)</span></label>
                  <input className="at-input" type="datetime-local" value={form.registration_close_at} onChange={e => setForm(x => ({ ...x, registration_close_at: e.target.value }))} style={{ opacity: 0.55 }} />
                </div>
                <div className="at-field">
                  <label className="at-label">Test Start</label>
                  <input className="at-input" type="datetime-local" value={form.test_start_at} onChange={e => setForm(x => ({ ...x, test_start_at: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Test End</label>
                  <input className="at-input" type="datetime-local" value={form.test_end_at} onChange={e => setForm(x => ({ ...x, test_end_at: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Results Announce</label>
                  <input className="at-input" type="datetime-local" value={form.results_announce_at} onChange={e => setForm(x => ({ ...x, results_announce_at: e.target.value }))} />
                </div>
              </div>

              <div className="at-section-title" style={{ marginTop: 18 }}>⚡ Power-Ups</div>
              <div className="at-powerup-grid">
                <PowerupRow
                  icon="💊" title="Revive"
                  enabled={form.revive_enabled} onToggle={v => setForm(x => ({ ...x, revive_enabled: v }))}
                  limit={form.revive_limit}    onLimit={v => setForm(x => ({ ...x, revive_limit: v }))}
                  price={form.revive_price}    onPrice={v => setForm(x => ({ ...x, revive_price: v }))}
                />
                <PowerupRow
                  icon="⏭" title="Skip"
                  enabled={form.skip_enabled} onToggle={v => setForm(x => ({ ...x, skip_enabled: v }))}
                  limit={form.skip_limit}    onLimit={v => setForm(x => ({ ...x, skip_limit: v }))}
                  price={form.skip_price}    onPrice={v => setForm(x => ({ ...x, skip_price: v }))}
                />
                <div className="at-pu-row">
                  <div className="at-pu-row-title"><span className="at-pu-icon">⌛</span> Add Time</div>
                  <div className="at-pu-fields">
                    <div className="at-field">
                      <label className="at-label">Enabled</label>
                      <select className="at-input" value={form.add_time_enabled ? "yes" : "no"} onChange={e => setForm(x => ({ ...x, add_time_enabled: e.target.value === "yes" }))}>
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                      </select>
                    </div>
                    <div className="at-field">
                      <label className="at-label">Limit</label>
                      <input className="at-input" type="number" value={form.add_time_limit} onChange={e => setForm(x => ({ ...x, add_time_limit: e.target.value }))} />
                    </div>
                    <div className="at-field">
                      <label className="at-label">Price (perks)</label>
                      <input className="at-input" type="number" value={form.add_time_price} onChange={e => setForm(x => ({ ...x, add_time_price: e.target.value }))} />
                    </div>
                    <div className="at-field">
                      <label className="at-label">Seconds added</label>
                      <input className="at-input" type="number" value={form.add_time_seconds} onChange={e => setForm(x => ({ ...x, add_time_seconds: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="at-section-title" style={{ marginTop: 18 }}>🏆 Winner Settings</div>
              <div className="at-grid2">
                <div className="at-field">
                  <label className="at-label">Max Winners</label>
                  <input className="at-input" type="number" value={form.max_winners} onChange={e => setForm(x => ({ ...x, max_winners: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Blur Limit</label>
                  <input className="at-input" type="number" value={form.blur_limit} onChange={e => setForm(x => ({ ...x, blur_limit: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Auto-kick on blur</label>
                  <select className="at-input" value={form.auto_kick_on_blur ? "yes" : "no"} onChange={e => setForm(x => ({ ...x, auto_kick_on_blur: e.target.value === "yes" }))}>
                    <option value="no">no</option>
                    <option value="yes">yes</option>
                  </select>
                </div>
                <div className="at-field">
                  <label className="at-label">Late entry until end</label>
                  <select className="at-input" value={form.allow_late_entry_until_end ? "yes" : "no"} onChange={e => setForm(x => ({ ...x, allow_late_entry_until_end: e.target.value === "yes" }))}>
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: QUESTIONS ── */}
          {editingId && activeTab === "questions" && (
            <div className="at-tab-content">
              <div className="at-section-title">Bulk Question Insert (JSON Array)</div>
              <div className="at-info-box">
                <div className="at-info-box-title">Expected Format</div>
                <pre className="at-pre">{`[
  {
    "question_text": "Who invented the telephone?",
    "options": {"A": "Edison", "B": "Bell", "C": "Tesla", "D": "Morse"},
    "correct_option": "B",
    "explanation": "Alexander Graham Bell",
    "difficulty": "easy"
  }
]`}</pre>
              </div>
              <textarea
                className="at-textarea"
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
                placeholder="Paste JSON array here…"
              />
              <button onClick={bulkInsertQuestions} className="at-btn at-btn-primary" style={{ marginTop: 10 }}>
                ⬆ Insert Questions
              </button>
            </div>
          )}

          {/* ── TAB: SPONSORS ── */}
          {editingId && activeTab === "sponsors" && (
            <div className="at-tab-content">
              <div className="at-section-title">Add Sponsor <span className="at-badge">{sponsors.length}/5</span></div>
              <div className="at-sponsor-form">
                <div className="at-field">
                  <label className="at-label">Name *</label>
                  <input className="at-input" placeholder="Sponsor name" value={newSponsor.name} onChange={e => setNewSponsor(x => ({ ...x, name: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Type</label>
                  <select className="at-input" value={newSponsor.sponsor_type} onChange={e => setNewSponsor(x => ({ ...x, sponsor_type: e.target.value }))}>
                    <option value="title">title</option>
                    <option value="gold">gold</option>
                    <option value="silver">silver</option>
                    <option value="partner">partner</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="at-field">
                  <label className="at-label">Image URL</label>
                  <input className="at-input" placeholder="https://…" value={newSponsor.image_url} onChange={e => setNewSponsor(x => ({ ...x, image_url: e.target.value }))} />
                </div>
                <div className="at-field">
                  <label className="at-label">Link URL</label>
                  <input className="at-input" placeholder="https://…" value={newSponsor.link_url} onChange={e => setNewSponsor(x => ({ ...x, link_url: e.target.value }))} />
                </div>
                <button onClick={addSponsor} className="at-btn at-btn-primary" style={{ alignSelf: "flex-end" }}>+ Add</button>
              </div>

              {sponsors.length === 0 ? (
                <div className="at-empty">No sponsors yet.</div>
              ) : (
                <div className="at-sponsor-list">
                  {sponsors.map(s => (
                    <div key={s.id} className="at-sponsor-item">
                      <div className="at-sponsor-info">
                        <div className="at-sponsor-name">{s.name} <span className="at-badge">{s.sponsor_type}</span></div>
                        <div className="at-sponsor-meta">Priority: {s.priority}</div>
                        <div className="at-sponsor-placements">
                          {JSON.stringify(s.placements || {})}
                        </div>
                      </div>
                      <button onClick={() => toggleSponsor(s.id, !s.enabled)}
                        className={`at-btn ${s.enabled ? "at-btn-warn" : "at-btn-success"}`}>
                        {s.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PRIZES ── */}
          {editingId && activeTab === "prizes" && (
            <div className="at-tab-content">
              <div className="at-section-title">Prize by Rank</div>
              <PrizeEditor maxWinners={Number(form.max_winners || 1)} prizes={prizes} onSave={upsertPrize} />
            </div>
          )}

          {/* ── TAB: WINNERS ── */}
          {editingId && activeTab === "winners" && (
            <div className="at-tab-content">
              <div className="at-winners-header">
                <div className="at-section-title">Finalist Candidates</div>
                <button className="at-btn at-btn-primary" onClick={generateCandidates}>⚡ Generate Candidates</button>
              </div>

              {candidates.length === 0 ? (
                <div className="at-empty">No candidates yet. Click "Generate Candidates" after the test ends.</div>
              ) : (
                <>
                  <div className="at-table-wrap">
                    <table className="at-table">
                      <thead>
                        <tr>
                          <th>Rank</th><th>Name</th><th>Score</th><th>Time (ms)</th><th>Select</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map(c => (
                          <tr key={c.id} className={selectedWinners.includes(c.user_id) ? "at-tr-selected" : ""}>
                            <td><span className="at-rank-badge">{c.rank_no === 1 ? "🥇" : c.rank_no === 2 ? "🥈" : c.rank_no === 3 ? "🥉" : `#${c.rank_no}`}</span></td>
                            <td className="at-td-name">{c.user_name}</td>
                            <td><strong>{c.score}</strong></td>
                            <td>{c.total_time_ms}</td>
                            <td>
                              <input type="checkbox" className="at-checkbox"
                                checked={selectedWinners.includes(c.user_id)}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setSelectedWinners(prev => {
                                    const max = Number(form.max_winners || 1);
                                    if (checked) {
                                      if (prev.length >= max) return prev;
                                      return [...prev, c.user_id];
                                    }
                                    return prev.filter(x => x !== c.user_id);
                                  });
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="at-winners-footer">
                    <div className="at-selected-info">
                      {selectedWinners.length} / {form.max_winners} selected
                    </div>
                    <button onClick={approveWinners} className="at-btn at-btn-gold" disabled={selectedWinners.length === 0}>
                      🏆 Approve & Announce Winners
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PowerupRow({ icon, title, enabled, onToggle, limit, onLimit, price, onPrice }) {
  return (
    <div className="at-pu-row">
      <div className="at-pu-row-title"><span className="at-pu-icon">{icon}</span> {title}</div>
      <div className="at-pu-fields">
        <div className="at-field">
          <label className="at-label">Enabled</label>
          <select className="at-input" value={enabled ? "yes" : "no"} onChange={e => onToggle(e.target.value === "yes")}>
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
        </div>
        <div className="at-field">
          <label className="at-label">Limit</label>
          <input className="at-input" type="number" value={limit} onChange={e => onLimit(e.target.value)} />
        </div>
        <div className="at-field">
          <label className="at-label">Price (coins)</label>
          <input className="at-input" type="number" value={price} onChange={e => onPrice(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function PrizeEditor({ maxWinners, prizes, onSave }) {
  const [rows, setRows] = useState(() => buildRows(maxWinners, prizes));

  useEffect(() => {
    setRows(buildRows(maxWinners, prizes));
  }, [maxWinners, prizes]);

  function buildRows(max, pz) {
    const out = [];
    for (let i = 1; i <= max; i++) {
      const existing = pz.find(p => p.rank_no === i);
      out.push({
        rank_no: i,
        prize_type: existing?.prize_type || "coins",
        prize_text: existing?.prize_text || "",
        coins_amount: existing?.coins_amount || 0,
      });
    }
    return out;
  }

  return (
    <div className="at-prize-list">
      {rows.map((r, idx) => (
        <div key={r.rank_no} className="at-prize-row">
          <div className="at-prize-rank">{r.rank_no === 1 ? "🥇" : r.rank_no === 2 ? "🥈" : r.rank_no === 3 ? "🥉" : `#${r.rank_no}`}</div>
          <div className="at-prize-fields">
            <div className="at-field">
              <label className="at-label">Type</label>
              <select className="at-input" value={r.prize_type} onChange={e => setRows(prev => prev.map((x, i) => i === idx ? { ...x, prize_type: e.target.value } : x))}>
                <option value="coins">perks</option>
                <option value="item">item</option>
                <option value="other">other</option>
              </select>
            </div>
            <div className="at-field" style={{ flex: 2 }}>
              <label className="at-label">Prize Text / Description</label>
              <input className="at-input" value={r.prize_text} placeholder="e.g. iPhone 15, 1000 perks…"
                onChange={e => setRows(prev => prev.map((x, i) => i === idx ? { ...x, prize_text: e.target.value } : x))} />
            </div>
            <div className="at-field">
              <label className="at-label">Perks Amount</label>
              <input className="at-input" type="number" value={r.coins_amount} disabled={r.prize_type !== "coins"}
                onChange={e => setRows(prev => prev.map((x, i) => i === idx ? { ...x, coins_amount: e.target.value } : x))} />
            </div>
            <div className="at-field" style={{ alignSelf: "flex-end" }}>
              <button className="at-btn at-btn-save" onClick={() => onSave(r.rank_no, r.prize_type, r.prize_text, r.coins_amount)}>
                Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: 16, maxWidth: 1300, margin: "0 auto" },
};

const adminCSS = `
  :root {
    --at-deep: #1e3a8a; --at-blue: #3b82f6; --at-text: #0f172a;
    --at-sub: #334155; --at-muted: #64748b; --at-border: rgba(30,58,138,0.1);
    --at-bg: rgba(255,255,255,0.88); --at-radius: 16px;
  }

  .at-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; padding:8px 0 4px; animation:atIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
  @keyframes atIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
  .at-header-icon { font-size:clamp(24px,4vw,34px); }
  .at-title { font-size:clamp(1.2rem,3vw,1.7rem); font-weight:900; letter-spacing:-0.5px; margin:0; background:linear-gradient(135deg,#1e3a8a,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .at-sub { color:var(--at-muted); font-size:0.72rem; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; }

  .at-msg { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-radius:12px; font-size:0.85rem; font-weight:600; margin-bottom:12px; animation:atMsgIn 0.3s ease; }
  @keyframes atMsgIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
  .at-msg-info { background:rgba(59,130,246,0.07); border:1px solid rgba(59,130,246,0.2); color:var(--at-deep); }
  .at-msg-success { background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.25); color:#15803d; }
  .at-msg-error { background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.2); color:#dc2626; }
  .at-msg-close { background:none; border:none; font-size:18px; cursor:pointer; color:var(--at-muted); padding:0 0 0 8px; font-weight:700; }

  .at-grid { display:grid; grid-template-columns:320px 1fr; gap:14px; align-items:start; }
  @media(max-width:800px) { .at-grid { grid-template-columns:1fr; } }

  .at-card { background:var(--at-bg); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.9); border-radius:var(--at-radius); padding:16px; box-shadow:10px 10px 36px rgba(15,23,42,0.07),-6px -6px 24px rgba(255,255,255,0.8),inset 0 0 0 1px rgba(255,255,255,0.5); animation:atCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
  @keyframes atCardIn { to{opacity:1} }
  .at-list-card { position:sticky; top:12px; }
  .at-editor-card { min-width:0; }

  .at-card-title { font-weight:800; font-size:0.85rem; letter-spacing:0.5px; color:var(--at-sub); }
  .at-id-badge { font-size:10px; color:var(--at-muted); margin-top:3px; font-family:monospace; }

  .at-list-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .at-list-scroll { display:flex; flex-direction:column; gap:8px; max-height:72vh; overflow-y:auto; }
  .at-list-scroll::-webkit-scrollbar { width:4px; }
  .at-list-scroll::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.3); border-radius:100px; }

  .at-test-item { display:flex; align-items:stretch; border-radius:12px; border:1px solid var(--at-border); background:#fff; overflow:hidden; cursor:pointer; transition:all 0.15s; box-shadow:2px 2px 6px rgba(15,23,42,0.04); }
  .at-test-item:hover { border-color:rgba(59,130,246,0.3); transform:translateX(2px); }
  .at-test-item-active { background:linear-gradient(135deg,rgba(30,58,138,0.05),rgba(59,130,246,0.08))!important; border-color:rgba(59,130,246,0.35)!important; box-shadow:0 0 14px rgba(59,130,246,0.12)!important; }
  .at-test-item-body { flex:1; padding:10px 12px; min-width:0; }
  .at-test-item-top { display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:4px; }
  .at-test-item-name { font-weight:800; font-size:0.84rem; color:var(--at-text); word-break:break-word; }
  .at-test-item-meta { font-size:10px; color:var(--at-muted); font-weight:600; margin-bottom:4px; }
  .at-test-item-dates { display:flex; flex-direction:column; gap:1px; font-size:10px; color:var(--at-muted); }
  .at-delete-btn { padding:0 12px; background:transparent; border:none; border-left:1px solid var(--at-border); color:#dc2626; cursor:pointer; font-size:16px; transition:background 0.15s; flex-shrink:0; }
  .at-delete-btn:hover { background:rgba(239,68,68,0.07); }

  .at-status-pill { padding:2px 8px; border-radius:100px; font-size:10px; font-weight:700; white-space:nowrap; }

  .at-editor-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; gap:10px; }

  .at-tabs { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid rgba(30,58,138,0.1); }
  .at-tab { display:flex; align-items:center; gap:5px; padding:7px 12px; border-radius:10px; border:1px solid transparent; background:transparent; font-size:0.8rem; font-weight:700; cursor:pointer; color:var(--at-muted); transition:all 0.15s; }
  .at-tab:hover { background:rgba(30,58,138,0.06); color:var(--at-sub); }
  .at-tab-active { background:linear-gradient(135deg,rgba(30,58,138,0.08),rgba(59,130,246,0.1)); border-color:rgba(59,130,246,0.25); color:var(--at-deep); }
  .at-tab-icon { font-size:14px; }
  .at-tab-label { }
  @media(max-width:600px) { .at-tab-label { display:none; } .at-tab { padding:8px 10px; } }

  .at-tab-content { }
  .at-form { }

  .at-section-title { font-size:0.72rem; font-weight:800; letter-spacing:1.8px; text-transform:uppercase; color:var(--at-muted); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(30,58,138,0.07); display:flex; align-items:center; gap:8px; }

  .at-grid2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; }
  .at-col-2 { grid-column: 1 / -1; }
  .at-field { display:flex; flex-direction:column; }
  .at-label { font-size:11px; font-weight:700; color:var(--at-muted); margin-bottom:5px; letter-spacing:0.3px; }
  .at-input { padding:9px 12px; border-radius:10px; border:1px solid rgba(30,58,138,0.15); background:#fff; font-size:0.85rem; color:var(--at-text); width:100%; box-sizing:border-box; transition:border-color 0.15s; outline:none; }
  .at-input:focus { border-color:rgba(59,130,246,0.45); box-shadow:0 0 0 3px rgba(59,130,246,0.08); }
  .at-input:disabled { background:#f8fafc; color:var(--at-muted); cursor:not-allowed; }

  .at-powerup-grid { display:flex; flex-direction:column; gap:8px; }
  .at-pu-row { background:rgba(248,250,252,0.8); border:1px solid rgba(30,58,138,0.08); border-radius:12px; padding:12px; }
  .at-pu-row-title { font-weight:800; font-size:0.82rem; color:var(--at-sub); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .at-pu-icon { font-size:16px; }
  .at-pu-fields { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:8px; }

  .at-btn { padding:9px 16px; border-radius:10px; border:none; font-size:0.83rem; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .at-btn-primary { background:linear-gradient(135deg,#1e3a8a,#3b82f6); color:#fff; box-shadow:0 3px 0 #1e40af; }
  .at-btn-primary:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .at-btn-save { background:linear-gradient(135deg,#0f766e,#14b8a6); color:#fff; box-shadow:0 3px 0 #0f766e; }
  .at-btn-save:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .at-btn-gold { background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; box-shadow:0 3px 0 #b45309; }
  .at-btn-gold:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); }
  .at-btn-gold:disabled { background:#e2e8f0; color:#94a3b8; box-shadow:none; cursor:not-allowed; }
  .at-btn-warn { background:rgba(239,68,68,0.08); color:#dc2626; border:1px solid rgba(239,68,68,0.2); }
  .at-btn-warn:hover { background:rgba(239,68,68,0.14); }
  .at-btn-success { background:rgba(22,163,74,0.08); color:#15803d; border:1px solid rgba(22,163,74,0.2); }
  .at-btn-success:hover { background:rgba(22,163,74,0.14); }

  .at-info-box { background:rgba(248,250,252,0.9); border:1px solid rgba(30,58,138,0.1); border-radius:12px; padding:12px; margin-bottom:12px; }
  .at-info-box-title { font-size:11px; font-weight:700; color:var(--at-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; }
  .at-pre { margin:0; font-size:11px; color:var(--at-sub); overflow-x:auto; line-height:1.6; }

  .at-textarea { width:100%; min-height:160px; padding:12px; border-radius:10px; border:1px solid rgba(30,58,138,0.15); font-family:monospace; font-size:0.82rem; color:var(--at-text); box-sizing:border-box; resize:vertical; outline:none; }
  .at-textarea:focus { border-color:rgba(59,130,246,0.45); box-shadow:0 0 0 3px rgba(59,130,246,0.08); }

  .at-sponsor-form { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px; align-items:flex-end; }
  .at-sponsor-form .at-field { min-width:160px; flex:1; }
  .at-sponsor-list { display:flex; flex-direction:column; gap:8px; }
  .at-sponsor-item { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:12px; border-radius:12px; background:rgba(248,250,252,0.8); border:1px solid var(--at-border); }
  .at-sponsor-info { flex:1; min-width:0; }
  .at-sponsor-name { font-weight:800; font-size:0.88rem; color:var(--at-text); margin-bottom:3px; }
  .at-sponsor-meta { font-size:11px; color:var(--at-muted); }
  .at-sponsor-placements { font-size:10px; color:var(--at-muted); font-family:monospace; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .at-badge { display:inline-flex; padding:2px 8px; border-radius:100px; font-size:10px; font-weight:700; background:rgba(59,130,246,0.1); color:#1e3a8a; border:1px solid rgba(59,130,246,0.2); margin-left:4px; }

  .at-prize-list { display:flex; flex-direction:column; gap:10px; }
  .at-prize-row { display:flex; align-items:flex-start; gap:12px; padding:12px; border-radius:12px; background:rgba(248,250,252,0.8); border:1px solid var(--at-border); }
  .at-prize-rank { font-size:22px; padding-top:20px; flex-shrink:0; width:32px; text-align:center; }
  .at-prize-fields { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; flex:1; align-items:end; }

  .at-winners-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
  .at-table-wrap { overflow-x:auto; border-radius:12px; border:1px solid var(--at-border); }
  .at-table { width:100%; border-collapse:collapse; min-width:480px; }
  .at-table th { text-align:left; padding:10px 12px; font-size:11px; font-weight:700; color:var(--at-muted); letter-spacing:0.5px; background:rgba(248,250,252,0.9); border-bottom:1px solid var(--at-border); }
  .at-table td { padding:10px 12px; font-size:0.85rem; color:var(--at-text); border-bottom:1px solid rgba(30,58,138,0.05); }
  .at-table tbody tr:last-child td { border-bottom:none; }
  .at-table tbody tr:hover { background:rgba(59,130,246,0.03); }
  .at-tr-selected { background:rgba(251,191,36,0.07)!important; }
  .at-rank-badge { font-size:16px; }
  .at-td-name { font-weight:700; }
  .at-checkbox { width:16px; height:16px; cursor:pointer; accent-color:#1e3a8a; }
  .at-winners-footer { display:flex; justify-content:space-between; align-items:center; margin-top:12px; flex-wrap:wrap; gap:10px; }
  .at-selected-info { font-size:0.82rem; font-weight:700; color:var(--at-muted); }

  .at-loading { display:flex; align-items:center; gap:8px; padding:20px; color:var(--at-muted); font-size:0.85rem; font-weight:600; justify-content:center; }
  .at-spinner { width:18px; height:18px; border:2px solid rgba(59,130,246,0.2); border-top-color:var(--at-blue); border-radius:50%; animation:atSpin 0.7s linear infinite; flex-shrink:0; }
  @keyframes atSpin { to{transform:rotate(360deg)} }
  .at-empty { color:var(--at-muted); font-size:0.83rem; padding:12px 0; font-weight:600; text-align:center; }
`;