"use client";
// app/admin/ai-content/page.jsx — AI Content Engine Dashboard

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.aic-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
.aic-header { margin-bottom: 24px; }
.aic-title { font-size: 1.3rem; font-weight: 900; color: #0f172a; margin: 0 0 4px; }
.aic-sub { font-size: 0.8rem; color: #64748b; }
.aic-stats { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 28px; }
@media(min-width:600px) { .aic-stats { grid-template-columns: repeat(4,1fr); } }
.aic-stat {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px;
  padding: 16px 18px;
}
.aic-stat-val { font-size: 1.6rem; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 4px; }
.aic-stat-label { font-size: 0.74rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.07em; }
.aic-stat-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 3px; }
.aic-section { margin-bottom: 28px; }
.aic-section-title {
  font-size: 0.78rem; font-weight: 900; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
}
.aic-tabs { display: flex; gap: 0; border-bottom: 2px solid #f1f5f9; margin-bottom: 16px; }
.aic-tab {
  padding: 9px 16px; border: none; background: none;
  font-size: 0.83rem; font-weight: 700; color: #64748b;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; font-family: inherit;
}
.aic-tab.active { color: #1a3a8f; border-bottom-color: #1a3a8f; }
.aic-table-wrap { overflow-x: auto; }
.aic-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
.aic-table th { padding: 8px 12px; text-align: left; font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1.5px solid #f1f5f9; }
.aic-table td { padding: 10px 12px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.aic-table tr:hover td { background: #f8fafc; }
.aic-badge {
  display: inline-block; padding: 2px 8px; border-radius: 20px;
  font-size: 0.68rem; font-weight: 800; white-space: nowrap;
}
.aic-badge-pending  { background: rgba(245,158,11,0.1); color: #b45309; }
.aic-badge-approved { background: rgba(22,163,74,0.1);  color: #15803d; }
.aic-badge-rejected { background: rgba(239,68,68,0.1);  color: #dc2626; }
.aic-badge-blog     { background: rgba(59,130,246,0.1); color: #1d4ed8; }
.aic-badge-news     { background: rgba(239,68,68,0.1);  color: #b91c1c; }
.aic-badge-faq      { background: rgba(139,92,246,0.1); color: #7c3aed; }
.aic-score {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.78rem; font-weight: 800;
}
.aic-actions { display: flex; gap: 6px; }
.aic-btn {
  padding: 4px 11px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 0.74rem; font-weight: 800; font-family: inherit;
  transition: opacity 0.15s;
}
.aic-btn:hover { opacity: 0.8; }
.aic-btn-approve { background: rgba(22,163,74,0.1); color: #15803d; }
.aic-btn-reject  { background: rgba(239,68,68,0.1);  color: #dc2626; }
.aic-voice-wrap {
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 20px;
}
.aic-voice-label { font-size: 0.82rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.aic-voice-hint { font-size: 0.75rem; color: #64748b; margin-bottom: 12px; }
.aic-textarea {
  width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px;
  padding: 12px 14px; font-family: inherit; font-size: 0.84rem;
  color: #0f172a; resize: vertical; outline: none; min-height: 120px;
  transition: border-color 0.15s;
}
.aic-textarea:focus { border-color: #1a3a8f; }
.aic-save-btn {
  margin-top: 12px; padding: 9px 22px; background: #1a3a8f; color: #fff;
  border: none; border-radius: 9px; font-size: 0.84rem; font-weight: 800;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
}
.aic-save-btn:hover { opacity: 0.88; }
.aic-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.aic-msg { font-size: 0.78rem; font-weight: 700; margin-top: 8px; }
.aic-msg-ok  { color: #15803d; }
.aic-msg-err { color: #dc2626; }
.aic-empty { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 0.85rem; }
.aic-shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: sh 1.4s infinite; border-radius: 6px; }
@keyframes sh { to { background-position: -200% 0; } }
`;

const SCORE_COLOR = s => s >= 80 ? "#15803d" : s >= 60 ? "#b45309" : "#dc2626";
const SCORE_ICON  = s => s >= 80 ? "✅" : s >= 60 ? "⚠️" : "❌";

const VOICE_KEY = "aidla_brand_voice";

function loadVoice() {
  try { return localStorage.getItem(VOICE_KEY) || DEFAULT_VOICE; } catch { return DEFAULT_VOICE; }
}
function saveVoice(v) {
  try { localStorage.setItem(VOICE_KEY, v); } catch {}
}

const DEFAULT_VOICE = `AIDLA Brand Voice Guidelines:
- Tone: Professional yet approachable; inspiring but grounded
- Audience: Pakistani students and early-career professionals aged 16–30
- Language: Clear English; Urdu phrases welcome for warmth
- Values: Education, ambition, community, AI-powered growth
- Avoid: Jargon overload, negative framing, overpromising
- Always include: A practical takeaway or next step`;

export default function AIContentEngine() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats]               = useState({ total: 0, pending: 0, approved: 0, rejected: 0, avgScore: 0 });
  const [queueTab, setQueueTab]         = useState("blog");
  const [queue, setQueue]               = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [voice, setVoice]               = useState("");
  const [savingVoice, setSavingVoice]   = useState(false);
  const [voiceMsg, setVoiceMsg]         = useState("");
  const [actionMsg, setActionMsg]       = useState("");

  useEffect(() => { setVoice(loadVoice()); }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const [bRes, nRes, fRes] = await Promise.all([
      supabase.from("blogs_posts").select("ai_review_status,ai_quality_score").eq("ai_generated", true).is("deleted_at", null),
      supabase.from("news_posts").select("ai_review_status,ai_quality_score").eq("ai_generated", true),
      supabase.from("faqs").select("ai_review_status,ai_quality_score").eq("ai_generated", true),
    ]);
    const all = [...(bRes.data || []), ...(nRes.data || []), ...(fRes.data || [])];
    const scores = all.map(r => r.ai_quality_score).filter(Boolean);
    setStats({
      total:    all.length,
      pending:  all.filter(r => r.ai_review_status === "pending_review").length,
      approved: all.filter(r => r.ai_review_status === "auto_approved").length,
      rejected: all.filter(r => r.ai_review_status === "rejected").length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    });
    setStatsLoading(false);
  }, []);

  const loadQueue = useCallback(async (tab) => {
    setQueueLoading(true);
    const table = tab === "blog" ? "blogs_posts" : tab === "news" ? "news_posts" : "faqs";
    const select = tab === "faq"
      ? "id,question,ai_quality_score,ai_review_status,created_at"
      : "id,title,author_name,slug,ai_quality_score,ai_review_status,created_at";
    const { data } = await supabase
      .from(table)
      .select(select)
      .eq("ai_generated", true)
      .eq("ai_review_status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(30);
    setQueue((data || []).map(r => ({ ...r, _table: table, _tab: tab })));
    setQueueLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadQueue(queueTab); }, [queueTab, loadQueue]);

  async function handleAction(item, status) {
    setActionMsg("");
    const { error } = await supabase
      .from(item._table)
      .update({ ai_review_status: status })
      .eq("id", item.id);
    if (error) { setActionMsg("Error: " + error.message); return; }
    setQueue(q => q.filter(r => r.id !== item.id));
    setStats(s => ({
      ...s,
      pending:  s.pending - 1,
      approved: status === "auto_approved" ? s.approved + 1 : s.approved,
      rejected: status === "rejected" ? s.rejected + 1 : s.rejected,
    }));
    setActionMsg(`✅ ${status === "auto_approved" ? "Approved" : "Rejected"}`);
    setTimeout(() => setActionMsg(""), 2000);
  }

  async function handleSaveVoice() {
    setSavingVoice(true);
    saveVoice(voice);
    await new Promise(r => setTimeout(r, 400));
    setSavingVoice(false);
    setVoiceMsg("Saved!");
    setTimeout(() => setVoiceMsg(""), 2500);
  }

  return (
    <div className="aic-wrap">
      <style>{CSS}</style>
      <div className="aic-header">
        <h1 className="aic-title">AI Content Engine</h1>
        <p className="aic-sub">Quality dashboard, review queue, and brand voice for all AI-generated content</p>
      </div>

      {/* Stats */}
      <div className="aic-stats">
        {statsLoading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aic-stat">
            <div className="aic-shimmer" style={{ height: 32, width: 60, marginBottom: 6 }} />
            <div className="aic-shimmer" style={{ height: 10, width: 80 }} />
          </div>
        )) : <>
          <div className="aic-stat">
            <div className="aic-stat-val">{stats.total}</div>
            <div className="aic-stat-label">Total AI Posts</div>
            <div className="aic-stat-sub">Blogs + News + FAQs</div>
          </div>
          <div className="aic-stat">
            <div className="aic-stat-val" style={{ color: "#b45309" }}>{stats.pending}</div>
            <div className="aic-stat-label">Pending Review</div>
            <div className="aic-stat-sub">Needs your attention</div>
          </div>
          <div className="aic-stat">
            <div className="aic-stat-val" style={{ color: "#15803d" }}>{stats.approved}</div>
            <div className="aic-stat-label">Approved</div>
            <div className="aic-stat-sub">Live on platform</div>
          </div>
          <div className="aic-stat">
            <div className="aic-stat-val" style={{ color: stats.avgScore >= 75 ? "#15803d" : "#b45309" }}>
              {stats.avgScore > 0 ? stats.avgScore + "%" : "—"}
            </div>
            <div className="aic-stat-label">Avg Quality</div>
            <div className="aic-stat-sub">AI quality score</div>
          </div>
        </>}
      </div>

      {/* Review Queue */}
      <div className="aic-section">
        <div className="aic-section-title">Pending Review Queue</div>
        <div className="aic-tabs">
          {[["blog","Blogs"],["news","News"],["faq","FAQs"]].map(([id,label]) => (
            <button key={id} className={`aic-tab${queueTab===id?" active":""}`} onClick={() => setQueueTab(id)}>{label}</button>
          ))}
        </div>
        {actionMsg && <div className="aic-msg aic-msg-ok">{actionMsg}</div>}
        {queueLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aic-shimmer" style={{ height: 44, borderRadius: 8 }} />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="aic-empty">✅ No pending reviews — you&apos;re all caught up!</div>
        ) : (
          <div className="aic-table-wrap">
            <table className="aic-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(item => {
                  const sc = item.ai_quality_score;
                  const label = item._tab === "faq" ? item.question : item.title;
                  return (
                    <tr key={item.id}>
                      <td style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.83rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {label}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>
                          {item._tab === "blog" && item.author_name ? item.author_name : item.slug || ""}
                        </div>
                      </td>
                      <td>
                        {sc != null ? (
                          <span className="aic-score" style={{ color: SCORE_COLOR(sc) }}>
                            {SCORE_ICON(sc)} {sc}%
                          </span>
                        ) : <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>—</span>}
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {new Date(item.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric" })}
                      </td>
                      <td>
                        <div className="aic-actions">
                          <button className="aic-btn aic-btn-approve" onClick={() => handleAction(item, "auto_approved")}>Approve</button>
                          <button className="aic-btn aic-btn-reject"  onClick={() => handleAction(item, "rejected")}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Brand Voice */}
      <div className="aic-section">
        <div className="aic-section-title">Brand Voice Guidelines</div>
        <div className="aic-voice-wrap">
          <div className="aic-voice-label">AI Writing Instructions</div>
          <div className="aic-voice-hint">
            These guidelines are used by auto-blog, auto-news, and auto-FAQ functions.
            Update them to steer tone, style, and audience targeting.
          </div>
          <textarea
            className="aic-textarea"
            value={voice}
            onChange={e => setVoice(e.target.value)}
            placeholder="Enter brand voice guidelines…"
            rows={8}
          />
          <button className="aic-save-btn" onClick={handleSaveVoice} disabled={savingVoice}>
            {savingVoice ? "Saving…" : "Save Guidelines"}
          </button>
          {voiceMsg && <div className="aic-msg aic-msg-ok">{voiceMsg}</div>}
        </div>
      </div>
    </div>
  );
}
