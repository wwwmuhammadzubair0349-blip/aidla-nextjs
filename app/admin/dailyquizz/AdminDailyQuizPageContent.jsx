"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const BULK_FORMAT = `[
  {
    "question_text": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correct_option_index": 1,
    "category": "Math",
    "difficulty": "easy"
  }
]`;

export default function AdminDailyQuizPage() {
  const [tab, setTab] = useState("config");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const [cfg, setCfg] = useState({
    is_enabled: false,
    generation_mode: "ai",
    total_questions: 10,
    time_per_question_sec: 30,
    pass_threshold: 7,
    prize_coins: 100,
    max_winners: 10,
    max_attempts_per_day: 2,
    attempt_cooldown_minutes: 5,
    hint_enabled: false,
    hint_cost_coins: 10,
    streak_bonus_enabled: false,
    streak_bonus_coins: 20,
    ai_system_prompt: "You generate educational MCQs for students.",
  });

  const [questions, setQuestions] = useState([]);
  const [bulkJson, setBulkJson] = useState(BULK_FORMAT);
  const [newQ, setNewQ] = useState({ question_text: "", options: ["", "", "", ""], correct_option_index: 0, category: "", difficulty: "medium" });
  const [stats, setStats] = useState(null);
  const [statsDate, setStatsDate] = useState(new Date().toISOString().split("T")[0]);
  const [winnersHistory, setWinnersHistory] = useState([]);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { init(); }, []);

  async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }
    // Add your admin check here
    await Promise.all([loadConfig(), loadQuestions(), loadStats(new Date().toISOString().split("T")[0])]);
    setLoading(false);
  }

  async function loadConfig() {
    const { data } = await supabase.from("daily_quiz_config").select("*").eq("id", 1).single();
    if (data) setCfg(data);
  }

  async function loadQuestions() {
    const { data } = await supabase.from("daily_quiz_questions").select("*").order("created_at", { ascending: false });
    setQuestions(data || []);
  }

  async function loadStats(date) {
    const { data } = await supabase.rpc("daily_quiz_admin_stats", { p_date: date });
    setStats(data);
  }

  async function loadWinnersHistory(date) {
    const { data } = await supabase.rpc("daily_quiz_leaderboard", { p_date: date });
    setWinnersHistory(data?.winners || []);
  }

  async function saveConfig() {
    if (cfg.pass_threshold > cfg.total_questions) { flash("Pass threshold > total questions", false); return; }
    setSaving(true);
    const { error } = await supabase.from("daily_quiz_config").update(cfg).eq("id", 1);
    setSaving(false);
    flash(error ? error.message : "Saved!", !error);
  }

  async function addQuestion() {
    if (!newQ.question_text || newQ.options.some(o => !o.trim())) { flash("Fill all fields", false); return; }
    const { error } = await supabase.from("daily_quiz_questions").insert({ ...newQ });
    if (error) { flash(error.message, false); return; }
    flash("Question added!");
    setNewQ({ question_text: "", options: ["", "", "", ""], correct_option_index: 0, category: "", difficulty: "medium" });
    loadQuestions();
  }

  async function bulkInsert() {
    try {
      const parsed = JSON.parse(bulkJson);
      const { data, error } = await supabase.rpc("daily_quiz_bulk_insert_questions", { p_questions: parsed });
      if (error) { flash(error.message, false); return; }
      flash(`Inserted ${data.inserted} questions!`);
      loadQuestions();
    } catch (e) { flash("Invalid JSON: " + e.message, false); }
  }

  async function toggleQuestion(id, current) {
    await supabase.from("daily_quiz_questions").update({ is_active: !current }).eq("id", id);
    loadQuestions();
  }

  async function deleteQuestion(id) {
    if (!confirm("Delete?")) return;
    await supabase.from("daily_quiz_questions").delete().eq("id", id);
    loadQuestions();
  }

  function flash(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 4000);
  }

  const tabs = ["config", "questions", "bulk", "stats", "history"];

  if (loading) return <div style={S.center}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <Link href="/dashboard" style={S.back}>← Dashboard</Link>
        <span style={S.title}>Daily Quiz Admin</span>
        <span style={{ ...S.badge, background: cfg.is_enabled ? "#dcfce7" : "#fee2e2", color: cfg.is_enabled ? "#166534" : "#991b1b" }}>
          {cfg.is_enabled ? "LIVE" : "OFF"}
        </span>
      </div>

      {msg.text && <div style={{ ...S.msg, background: msg.ok ? "#dcfce7" : "#fee2e2", color: msg.ok ? "#166534" : "#991b1b" }}>{msg.text}</div>}

      <div style={S.tabs}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={S.content}>

        {/* CONFIG TAB */}
        {tab === "config" && (
          <div style={S.card}>
            <h2 style={S.h2}>Configuration</h2>

            <Row label="Enable Quiz">
              <label style={S.toggle}>
                <input type="checkbox" checked={cfg.is_enabled} onChange={e => setCfg({ ...cfg, is_enabled: e.target.checked })} />
                <span>{cfg.is_enabled ? "Enabled" : "Disabled"}</span>
              </label>
            </Row>

            <Row label="Generation Mode">
              <select style={S.input} value={cfg.generation_mode} onChange={e => setCfg({ ...cfg, generation_mode: e.target.value })}>
                <option value="ai">AI (personalized per user)</option>
                <option value="manual">Manual (admin question bank)</option>
              </select>
            </Row>

            <div style={S.grid2}>
              <Row label="Total Questions">
                <input style={S.input} type="number" min={1} max={50} value={cfg.total_questions} onChange={e => setCfg({ ...cfg, total_questions: +e.target.value })} />
              </Row>
              <Row label="Time/Question (sec)">
                <input style={S.input} type="number" min={5} max={300} value={cfg.time_per_question_sec} onChange={e => setCfg({ ...cfg, time_per_question_sec: +e.target.value })} />
              </Row>
              <Row label="Pass Threshold">
                <input style={S.input} type="number" min={1} max={cfg.total_questions} value={cfg.pass_threshold} onChange={e => setCfg({ ...cfg, pass_threshold: +e.target.value })} />
              </Row>
              <Row label="Prize Coins 🪙">
                <input style={S.input} type="number" min={0} value={cfg.prize_coins} onChange={e => setCfg({ ...cfg, prize_coins: +e.target.value })} />
              </Row>
              <Row label="Max Winners">
                <input style={S.input} type="number" min={1} value={cfg.max_winners} onChange={e => setCfg({ ...cfg, max_winners: +e.target.value })} />
              </Row>
              <Row label="Max Attempts/Day">
                <input style={S.input} type="number" min={1} max={10} value={cfg.max_attempts_per_day} onChange={e => setCfg({ ...cfg, max_attempts_per_day: +e.target.value })} />
              </Row>
              <Row label="Cooldown (min)">
                <input style={S.input} type="number" min={0} value={cfg.attempt_cooldown_minutes} onChange={e => setCfg({ ...cfg, attempt_cooldown_minutes: +e.target.value })} />
              </Row>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Hints</div>
              <Row label="Enable Hints">
                <label style={S.toggle}>
                  <input type="checkbox" checked={cfg.hint_enabled} onChange={e => setCfg({ ...cfg, hint_enabled: e.target.checked })} />
                  <span>{cfg.hint_enabled ? "On" : "Off"}</span>
                </label>
              </Row>
              {cfg.hint_enabled && (
                <Row label="Hint Cost (coins)">
                  <input style={S.input} type="number" min={0} value={cfg.hint_cost_coins} onChange={e => setCfg({ ...cfg, hint_cost_coins: +e.target.value })} />
                </Row>
              )}
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Streak Bonus</div>
              <Row label="Enable Streak Bonus">
                <label style={S.toggle}>
                  <input type="checkbox" checked={cfg.streak_bonus_enabled} onChange={e => setCfg({ ...cfg, streak_bonus_enabled: e.target.checked })} />
                  <span>{cfg.streak_bonus_enabled ? "On" : "Off"}</span>
                </label>
              </Row>
              {cfg.streak_bonus_enabled && (
                <Row label="Streak Bonus Coins">
                  <input style={S.input} type="number" min={0} value={cfg.streak_bonus_coins} onChange={e => setCfg({ ...cfg, streak_bonus_coins: +e.target.value })} />
                </Row>
              )}
            </div>

            {cfg.generation_mode === "ai" && (
              <div style={S.section}>
                <div style={S.sectionTitle}>AI Prompt</div>
                <textarea style={{ ...S.input, height: 80, resize: "vertical" }} value={cfg.ai_system_prompt} onChange={e => setCfg({ ...cfg, ai_system_prompt: e.target.value })} />
              </div>
            )}

            <button style={S.btnPrimary} onClick={saveConfig} disabled={saving}>
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {tab === "questions" && (
          <div>
            <div style={S.card}>
              <h2 style={S.h2}>Add Question</h2>
              <Row label="Question">
                <textarea style={{ ...S.input, height: 60, resize: "vertical" }} value={newQ.question_text} onChange={e => setNewQ({ ...newQ, question_text: e.target.value })} placeholder="Enter question..." />
              </Row>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input type="radio" name="correct" checked={newQ.correct_option_index === i} onChange={() => setNewQ({ ...newQ, correct_option_index: i })} />
                  <input style={{ ...S.input, flex: 1, marginBottom: 0, border: newQ.correct_option_index === i ? "1px solid #10b981" : "1px solid #e2e8f0" }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}${newQ.correct_option_index === i ? " ✓ correct" : ""}`}
                    value={newQ.options[i]} onChange={e => { const o = [...newQ.options]; o[i] = e.target.value; setNewQ({ ...newQ, options: o }); }} />
                </div>
              ))}
              <div style={S.grid2}>
                <Row label="Category">
                  <input style={S.input} value={newQ.category} onChange={e => setNewQ({ ...newQ, category: e.target.value })} placeholder="e.g. Math" />
                </Row>
                <Row label="Difficulty">
                  <select style={S.input} value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Row>
              </div>
              <button style={S.btnPrimary} onClick={addQuestion}>Add Question</button>
            </div>

            <div style={S.card}>
              <h2 style={S.h2}>Question Bank ({questions.length})</h2>
              {questions.length === 0 ? <p style={S.empty}>No questions yet.</p> : questions.map(q => (
                <div key={q.id} style={{ ...S.qItem, opacity: q.is_active ? 1 : 0.5 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ ...S.pill, background: "#e0e7ff", color: "#3730a3" }}>{q.difficulty}</span>
                    {q.category && <span style={{ ...S.pill, background: "#f1f5f9", color: "#475569" }}>{q.category}</span>}
                    <span style={{ ...S.pill, background: q.is_active ? "#dcfce7" : "#fee2e2", color: q.is_active ? "#166534" : "#991b1b" }}>{q.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 14 }}>{q.question_text}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
                    {(q.options || []).map((opt, i) => (
                      <span key={i} style={{ fontSize: 13, padding: "2px 8px", borderRadius: 6, background: i === q.correct_option_index ? "#dcfce7" : "#f8fafc", fontWeight: i === q.correct_option_index ? 700 : 400 }}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={S.btnSmall} onClick={() => toggleQuestion(q.id, q.is_active)}>{q.is_active ? "Deactivate" : "Activate"}</button>
                    <button style={{ ...S.btnSmall, color: "#dc2626" }} onClick={() => deleteQuestion(q.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BULK TAB */}
        {tab === "bulk" && (
          <div style={S.card}>
            <h2 style={S.h2}>Bulk Insert Questions</h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Paste a JSON array of questions in the format below:</p>
            <textarea style={{ ...S.input, height: 300, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={bulkJson} onChange={e => setBulkJson(e.target.value)} />
            <div style={{ marginTop: 4, marginBottom: 16, fontSize: 12, color: "#94a3b8" }}>
              Required fields: question_text, options (array of 4), correct_option_index (0-3)<br />
              Optional: category, difficulty (easy/medium/hard)
            </div>
            <button style={S.btnPrimary} onClick={bulkInsert}>Insert All Questions</button>
          </div>
        )}

        {/* STATS TAB */}
        {tab === "stats" && (
          <div style={S.card}>
            <h2 style={S.h2}>Today's Statistics</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Date</label>
                <input style={S.input} type="date" value={statsDate} onChange={e => setStatsDate(e.target.value)} />
              </div>
              <button style={{ ...S.btnSmall, padding: "8px 16px" }} onClick={() => loadStats(statsDate)}>Load</button>
            </div>
            {stats && (
              <>
                <div style={S.statsGrid}>
                  {[
                    ["Total Attempts", stats.total_attempts, "#e0e7ff", "#3730a3"],
                    ["Passed ✅", stats.passed, "#dcfce7", "#166534"],
                    ["Eliminated ❌", stats.eliminated, "#fee2e2", "#991b1b"],
                    ["In Progress", stats.in_progress, "#fef9c3", "#854d0e"],
                    ["Coins Out 🪙", stats.total_coins_out, "#fce7f3", "#9d174d"],
                    ["Avg Score", stats.avg_score, "#f1f5f9", "#334155"],
                    ["Flagged ⚠️", stats.flagged_answers, "#fff7ed", "#c2410c"],
                  ].map(([label, val, bg, color]) => (
                    <div key={label} style={{ background: bg, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{val ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {stats.winners?.length > 0 && (
                  <>
                    <div style={S.sectionTitle}>Winners</div>
                    <table style={S.table}>
                      <thead><tr>{["Rank", "Name", "Score", "Coins"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {stats.winners.map((w, i) => (
                          <tr key={i}>
                            <td style={S.td}>#{w.rank}</td>
                            <td style={S.td}>{w.full_name}</td>
                            <td style={S.td}>{w.score}</td>
                            <td style={S.td}>{w.coins_earned} 🪙</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div style={S.card}>
            <h2 style={S.h2}>Winners History</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Date</label>
                <input style={S.input} type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} />
              </div>
              <button style={{ ...S.btnSmall, padding: "8px 16px" }} onClick={() => loadWinnersHistory(historyDate)}>Load</button>
            </div>
            {winnersHistory.length === 0 ? (
              <p style={S.empty}>No winners for this date.</p>
            ) : (
              <table style={S.table}>
                <thead><tr>{["Rank", "Name", "Score", "Time", "Coins", "Streak"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {winnersHistory.map((w, i) => (
                    <tr key={i}>
                      <td style={S.td}>#{w.rank}</td>
                      <td style={S.td}>{w.full_name}</td>
                      <td style={S.td}>{w.score}/{w.total_questions}</td>
                      <td style={S.td}>{w.time_taken_seconds}s</td>
                      <td style={S.td}>{w.coins_earned} 🪙</td>
                      <td style={S.td}>{w.streak_days > 0 ? `🔥 ${w.streak_days}` : "—"}</td>
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

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

const S = {
  wrap: { fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f1f5f9", color: "#0f172a" },
  header: { background: "#1e293b", color: "white", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 },
  back: { color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 600 },
  title: { flex: 1, fontSize: 18, fontWeight: 800 },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  tabs: { display: "flex", gap: 6, padding: "14px 24px", background: "white", borderBottom: "1px solid #e2e8f0", overflowX: "auto" },
  tab: { padding: "8px 16px", border: "none", background: "#f1f5f9", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" },
  tabActive: { background: "#6366f1", color: "white" },
  content: { maxWidth: 900, margin: "0 auto", padding: 24 },
  card: { background: "white", borderRadius: 14, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  h2: { margin: "0 0 20px", fontSize: 18, fontWeight: 800 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#f8fafc", boxSizing: "border-box", marginBottom: 0 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  section: { background: "#f8fafc", borderRadius: 10, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 },
  toggle: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  btnPrimary: { width: "100%", padding: "12px", background: "#6366f1", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 8 },
  btnSmall: { padding: "6px 12px", border: "1px solid #e2e8f0", background: "white", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  qItem: { border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, marginBottom: 10 },
  pill: { padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 },
  empty: { textAlign: "center", color: "#94a3b8", padding: 20, fontSize: 14 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "10px", fontSize: 13, borderBottom: "1px solid #f1f5f9" },
  msg: { padding: "12px 24px", fontSize: 14, fontWeight: 600 },
  center: { textAlign: "center", padding: 80, fontFamily: "sans-serif" },
};