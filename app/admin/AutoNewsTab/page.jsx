// app/admin/news/auto/page.jsx
"use client";

// AutoNewsTab.jsx — v1.0 (Claude-powered)
// Drop into AdminNews as the "🤖 Auto" tab
// Import:  import AutoNewsTab from "./AutoNewsTab.jsx";
// Usage:   {activeTab === "auto" && <AutoNewsTab onEditPost={onPickEdit} />}

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-news`;
const CRON_SECRET  = process.env.NEXT_PUBLIC_AUTO_BLOG_SECRET || "aidla_auto_blog_2025";

/* ─── Helpers ─── */
function formatRelativeTime(iso) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function isoToLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function localToIso(local) {
  if (!local) return "";
  return new Date(local).toISOString();
}

const CAT_COLORS = {
  education:     "#0891b2",
  technology:    "#0f766e",
  community:     "#16a34a",
  general:       "#3b82f6",
  announcements: "#dc2626",
  events:        "#d97706",
};

const CAT_LABELS = {
  education:     "📚 Education",
  technology:    "💻 Technology",
  community:     "🤝 Community",
  general:       "🌐 General",
  announcements: "📢 Announcements",
  events:        "🎯 Events",
};

const CATEGORIES = [
  { value: "",              label: "🎲 Auto Pick" },
  { value: "education",     label: "📚 Education" },
  { value: "technology",    label: "💻 Technology" },
  { value: "community",     label: "🤝 Community" },
  { value: "general",       label: "🌐 General" },
  { value: "announcements", label: "📢 Announcements" },
  { value: "events",        label: "🎯 Events" },
];

const POLLING_STEPS = [
  "📡 Claude is researching trending Pakistani news…",
  "✍️ Claude is writing the article…",
  "🏷️ Building SEO metadata and schema…",
  "🖼️ Finding the perfect cover image…",
  "💾 Saving to database…",
  "🔍 Almost done — checking for new article…",
];

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub, color = "#d97706" }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${color}22`, borderRadius: 14, padding: "14px 16px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: "1.35rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: "0.63rem", color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ─── Schedule Picker ─── */
function SchedulePicker({ value, onChange, label = "Custom Publish Time" }) {
  const minDate = isoToLocal(new Date(Date.now() + 5 * 60 * 1000).toISOString());
  return (
    <div>
      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
        📅 {label} <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional — blank = smart auto-schedule)</span>
      </label>
      <input type="datetime-local" value={value} min={minDate}
        onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: "0.86rem", color: "#0b1437", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }}
        onFocus={e => e.target.style.borderColor = "#d97706"}
        onBlur={e => e.target.style.borderColor = "rgba(217,119,6,0.2)"}
      />
      {value && (
        <div style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          🕐 Will publish: {formatDateTime(localToIso(value))}
          <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 11, padding: 0 }}>✕ clear</button>
        </div>
      )}
    </div>
  );
}

/* ─── Background Progress ─── */
function BackgroundProgress({ step, elapsed, onCancel }) {
  return (
    <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#b45309" }}>{step}</div>
        <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{elapsed}s elapsed</span>
      </div>
      <div style={{ height: 4, background: "#fde68a", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${Math.min(95, (elapsed / 120) * 100)}%`, background: "linear-gradient(90deg,#d97706,#f59e0b)", borderRadius: 99, transition: "width 1s linear" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "0.7rem", color: "#92400e" }}>Claude is generating in background — takes 60–90 seconds</div>
        <button onClick={onCancel} style={{ fontSize: "0.68rem", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>cancel polling</button>
      </div>
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({ preview, onPublish, onDiscard, publishing }) {
  const [previewSchedule, setPreviewSchedule] = useState("");
  const article    = preview.article;
  const catColor   = CAT_COLORS[article.category] || "#d97706";
  const publishTime = previewSchedule ? localToIso(previewSchedule) : article.scheduled_for;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "min(820px,96vw)", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.28)" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "2px" }}>📰 Claude Preview</span>
              {article.is_breaking && <span style={{ fontSize: "0.6rem", fontWeight: 800, background: "rgba(239,68,68,0.9)", color: "#fff", padding: "1px 8px", borderRadius: 4 }}>🔴 BREAKING</span>}
              {article.category && <span style={{ fontSize: "0.65rem", fontWeight: 700, background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30`, padding: "2px 9px", borderRadius: 20 }}>{CAT_LABELS[article.category] || article.category}</span>}
            </div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0b1437", lineHeight: 1.4 }}>{article.title}</h3>
          </div>
          <button onClick={onDiscard} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8", flexShrink: 0 }}>✕</button>
        </div>

        {/* Info banner */}
        <div style={{ padding: "10px 24px", background: "rgba(217,119,6,0.04)", borderBottom: "1px solid #f1f5f9", fontSize: "0.78rem", color: "#b45309", fontWeight: 600 }}>
          ℹ️ Full article (900–1200 words) will be written by Claude in the background after you confirm. Check <strong>Recent AI Articles</strong> in ~90 seconds.
        </div>

        {/* Meta badges */}
        <div style={{ padding: "10px 24px", background: "#fef9f0", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {article.cover_source && <span style={{ fontSize: "0.68rem", color: "#64748b" }}>📷 {article.cover_source === "pexels" ? "Pexels" : "Unsplash"} — {article.cover_photographer}</span>}
          {article.primary_keyword && <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(217,119,6,0.1)", color: "#b45309", padding: "2px 9px", borderRadius: 20 }}>🎯 {article.primary_keyword}</span>}
        </div>

        {/* Cover + excerpt */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 16, alignItems: "flex-start" }}>
          {article.cover_image_url && <img src={article.cover_image_url} alt="cover" style={{ width: 160, height: 95, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid #e2e8f0" }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", marginBottom: 3, textTransform: "uppercase" }}>Excerpt / Lede</div>
            <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#374151", lineHeight: 1.65 }}>{article.excerpt}</p>
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#94a3b8", marginBottom: 3, textTransform: "uppercase" }}>Meta Description</div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{article.meta_description}</p>
          </div>
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ padding: "8px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 5 }}>
            {article.tags.map(t => (
              <span key={t} style={{ fontSize: "0.62rem", fontWeight: 700,
                background: t === "breaking" ? "rgba(239,68,68,0.1)" : CAT_COLORS[t] ? `${CAT_COLORS[t]}15` : "rgba(217,119,6,0.07)",
                color: t === "breaking" ? "#dc2626" : CAT_COLORS[t] || "#b45309",
                border: `1px solid ${t === "breaking" ? "rgba(239,68,68,0.2)" : CAT_COLORS[t] ? `${CAT_COLORS[t]}30` : "rgba(217,119,6,0.2)"}`,
                padding: "2px 8px", borderRadius: 20 }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Schedule override */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <SchedulePicker value={previewSchedule} onChange={setPreviewSchedule} label="Override Publish Time" />
          {!previewSchedule && <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 4 }}>Auto-scheduled: <strong style={{ color: "#374151" }}>{formatDateTime(article.scheduled_for)}</strong></div>}
        </div>

        {/* Content placeholder */}
        <div style={{ flex: 1, overflow: "auto", padding: "14px 24px" }}
          dangerouslySetInnerHTML={{ __html: article.content_html }} />

        {/* Actions */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginRight: "auto" }}>
            Publishing: <strong style={{ color: "#374151" }}>{formatDateTime(publishTime)}</strong>
          </span>
          <button onClick={onDiscard} style={{ padding: "9px 18px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", color: "#64748b" }}>
            ✕ Cancel
          </button>
          <button onClick={() => onPublish(previewSchedule ? localToIso(previewSchedule) : "")} disabled={publishing}
            style={{ padding: "9px 24px", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", cursor: publishing ? "not-allowed" : "pointer", fontWeight: 800, fontSize: "0.84rem", opacity: publishing ? 0.7 : 1 }}>
            {publishing ? "⏳ Starting…" : "✅ Confirm & Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Recent Articles ─── */
function RecentAutoArticles({ posts, onView }) {
  if (!posts.length) return (
    <div style={{ textAlign: "center", padding: "28px 0", color: "#94a3b8", fontSize: "0.84rem" }}>No auto-generated articles yet. Generate your first one! 🚀</div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {posts.map(p => {
        const pCat = (p.tags || []).find(t => CAT_COLORS[t]);
        const pBreaking = (p.tags || []).includes("breaking");
        const catColor = CAT_COLORS[pCat] || "#d97706";
        return (
          <div key={p.id}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "1px solid rgba(217,119,6,0.1)", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef9f0"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            onClick={() => onView(p)}
          >
            {p.cover_image_url && <img src={p.cover_image_url} alt="" style={{ width: 56, height: 38, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                {pBreaking && <span style={{ fontSize: "0.55rem", fontWeight: 800, background: "rgba(239,68,68,0.9)", color: "#fff", padding: "1px 5px", borderRadius: 4 }}>🔴 BREAKING</span>}
                {pCat && <span style={{ fontSize: "0.6rem", fontWeight: 700, background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30`, padding: "1px 6px", borderRadius: 10 }}>{CAT_LABELS[pCat] || pCat}</span>}
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#0b1437", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.67rem", color: "#94a3b8" }}>{p.status === "scheduled" ? `🕐 ${formatDateTime(p.scheduled_at)}` : `✅ ${formatDateTime(p.published_at)}`}</span>
                {p.word_count > 0 && <span style={{ fontSize: "0.67rem", color: "#94a3b8" }}>📝 {p.word_count.toLocaleString()}w</span>}
              </div>
            </div>
            <span style={{ fontSize: "0.62rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: p.status === "published" ? "rgba(22,163,74,0.1)" : "rgba(245,158,11,0.1)", color: p.status === "published" ? "#15803d" : "#b45309", border: `1px solid ${p.status === "published" ? "rgba(22,163,74,0.2)" : "rgba(245,158,11,0.25)"}`, flexShrink: 0 }}>
              {p.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function AutoNewsTab({ onEditPost }) {
  const [settings, setSettings]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const [polling, setPolling]         = useState(false);
  const [pollingStep, setPollingStep] = useState("");
  const [pollingElapsed, setPollingElapsed] = useState(0);
  const [msg, setMsg]                 = useState("");
  const [msgType, setMsgType]         = useState("info");
  const [recentPosts, setRecentPosts] = useState([]);
  const [preview, setPreview]         = useState(null);
  const [totalAutoPosts, setTotalAutoPosts] = useState(0);

  // Input state
  const [inputMode, setInputMode]       = useState("auto");
  const [customTopic, setCustomTopic]   = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [userParagraph, setUserParagraph] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");

  const pollIntervalRef = useRef(null);
  const pollElapsedRef  = useRef(null);
  const pollStartCount  = useRef(0);

  const showMsg = useCallback((text, type = "info") => {
    setMsg(text); setMsgType(type);
    if (type !== "error") setTimeout(() => setMsg(""), 7000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: sd }, { data: pd }, { count }] = await Promise.all([
      supabase.from("auto_news_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("news_posts")
        .select("id,title,slug,status,cover_image_url,published_at,scheduled_at,created_at,word_count,tags")
        .in("author_name", ["AIDLA AI", "AIDLA News Desk"]).is("deleted_at", null)
        .order("created_at", { ascending: false }).limit(10),
      supabase.from("news_posts").select("*", { count: "exact", head: true })
        .in("author_name", ["AIDLA AI", "AIDLA News Desk"]).is("deleted_at", null),
    ]);
    if (sd) setSettings(sd);
    if (pd) setRecentPosts(pd);
    setTotalAutoPosts(count || 0);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollElapsedRef.current)  clearInterval(pollElapsedRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (pollElapsedRef.current)  { clearInterval(pollElapsedRef.current);  pollElapsedRef.current  = null; }
    setPolling(false); setPollingElapsed(0); setPollingStep("");
  }, []);

  const startPolling = useCallback((knownCount) => {
    setPolling(true); setPollingElapsed(0);
    let stepIdx = 0;
    setPollingStep(POLLING_STEPS[0]);
    pollStartCount.current = knownCount;

    pollElapsedRef.current = setInterval(() => {
      setPollingElapsed(prev => {
        const next = prev + 1;
        if (next % 12 === 0) { stepIdx = (stepIdx + 1) % POLLING_STEPS.length; setPollingStep(POLLING_STEPS[stepIdx]); }
        if (next >= 180) { stopPolling(); showMsg("Generation is taking longer than expected. Check Recent AI Articles in a few minutes.", "info"); }
        return next;
      });
    }, 1000);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const { count } = await supabase.from("news_posts")
          .select("*", { count: "exact", head: true })
          .in("author_name", ["AIDLA AI", "AIDLA News Desk"]).is("deleted_at", null);
        if ((count || 0) > pollStartCount.current) {
          stopPolling();
          await loadData();
          showMsg("✅ Article generated and scheduled successfully! Check Recent AI Articles below.", "success");
        }
      } catch { /* ignore */ }
    }, 7000);
  }, [stopPolling, loadData, showMsg]);

  const handleToggle = async () => {
    if (!settings || toggling) return;
    setToggling(true);
    const newVal = !settings.enabled;
    const { error } = await supabase.from("auto_news_settings").update({ enabled: newVal, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) showMsg(error.message, "error");
    else { setSettings(s => ({ ...s, enabled: newVal })); showMsg(newVal ? "✅ Auto-news enabled!" : "⏸ Paused.", newVal ? "success" : "info"); }
    setToggling(false);
  };

  const buildBody = (publishDirectly = false, overrideSchedule = "") => {
    const body = { secret: CRON_SECRET, preview: !publishDirectly, force: true };
    if (inputMode === "topic" && customTopic.trim())         body.topic    = customTopic.trim();
    if (inputMode === "paragraph" && userParagraph.trim())   body.user_paragraph = userParagraph.trim();
    if (customCategory)                                      body.category = customCategory;
    const sched = overrideSchedule || (customSchedule ? localToIso(customSchedule) : "");
    if (sched) body.custom_schedule = sched;
    return body;
  };

  const handlePreview = async () => {
    setGenerating(true); setPreview(null); showMsg("", "info");
    try {
      const res  = await fetch(FUNCTION_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(false)) });
      const data = await res.json();
      if (!data.ok) { showMsg(data.error || data.reason || "Preview failed", "error"); return; }
      setPreview(data);
    } catch (err) { showMsg(`Error: ${err?.message}`, "error"); }
    finally { setGenerating(false); }
  };

  const handleGenerateAndSchedule = async (overrideSchedule = "") => {
    setPublishing(true); setPreview(null); showMsg("", "info");
    const { count: currentCount } = await supabase.from("news_posts")
      .select("*", { count: "exact", head: true })
      .in("author_name", ["AIDLA AI", "AIDLA News Desk"]).is("deleted_at", null);
    try {
      const res  = await fetch(FUNCTION_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(true, overrideSchedule)) });
      const data = await res.json();
      if (!data.ok) { showMsg(data.error || data.reason || "Generation failed", "error"); return; }
      showMsg("📰 Claude is writing your article in the background. Takes 60–90 seconds…", "info");
      startPolling(currentCount || 0);
      setCustomTopic(""); setUserParagraph(""); setCustomSchedule(""); setCustomCategory("");
    } catch (err) { showMsg(`Error: ${err?.message}`, "error"); }
    finally { setPublishing(false); }
  };

  if (loading) return (
    <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📰</div>Loading auto-news engine…
    </div>
  );

  const isEnabled      = settings?.enabled || false;
  const publishedCount = recentPosts.filter(p => p.status === "published").length;
  const scheduledCount = recentPosts.filter(p => p.status === "scheduled").length;
  const wPosts         = recentPosts.filter(p => p.word_count > 0);
  const avgWords       = wPosts.length > 0 ? Math.round(wPosts.reduce((s, p) => s + p.word_count, 0) / wPosts.length) : 0;

  return (
    <div style={{ maxWidth: 760 }}>

      {/* Message */}
      {msg && (
        <div style={{ marginBottom: 16, padding: "11px 16px", borderRadius: 12, fontSize: "0.84rem", fontWeight: 600,
          background: msgType === "error" ? "rgba(239,68,68,0.08)" : msgType === "success" ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
          color: msgType === "error" ? "#dc2626" : msgType === "success" ? "#15803d" : "#b45309",
          border: `1px solid ${msgType === "error" ? "rgba(239,68,68,0.2)" : msgType === "success" ? "rgba(22,163,74,0.2)" : "rgba(217,119,6,0.2)"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: 0.5 }}>✕</button>
        </div>
      )}

      {/* Master Toggle */}
      <div style={{ background: isEnabled ? "linear-gradient(130deg,#92400e,#d97706)" : "#fff", border: isEnabled ? "none" : "1.5px solid #e2e8f0", borderRadius: 18, padding: "20px 22px", marginBottom: 16, boxShadow: isEnabled ? "0 8px 24px rgba(217,119,6,0.2)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: isEnabled ? "rgba(255,255,255,0.5)" : "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 5 }}>AUTO-NEWS ENGINE v1.0 — CLAUDE SONNET</div>
            <h3 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 800, color: isEnabled ? "#fff" : "#0b1437" }}>{isEnabled ? "🟢 Active — 1 article/day" : "⏸ Paused"}</h3>
            <p style={{ margin: 0, fontSize: "0.78rem", color: isEnabled ? "rgba(255,255,255,0.65)" : "#64748b", lineHeight: 1.5 }}>
              {isEnabled ? "Trending news → Claude writes 900+ word journalist-quality article → auto-schedules at peak time" : "Enable to auto-publish 1 professional news article per day from trending Pakistani topics"}
            </p>
          </div>
          <button onClick={handleToggle} disabled={toggling}
            style={{ position: "relative", width: 58, height: 30, flexShrink: 0, background: isEnabled ? "#22c55e" : "#cbd5e1", borderRadius: 99, border: "none", cursor: "pointer", transition: "background 0.25s", boxShadow: isEnabled ? "0 0 0 3px rgba(34,197,94,0.25)" : "none" }}>
            <span style={{ position: "absolute", top: 3, left: isEnabled ? 30 : 3, width: 24, height: 24, background: "#fff", borderRadius: "50%", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
              {toggling ? "⌛" : isEnabled ? "✓" : ""}
            </span>
          </button>
        </div>
        {isEnabled && settings?.last_run_at && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", flexWrap: "wrap", gap: 20 }}>
            {[
              { label: "Last run",   value: formatRelativeTime(settings.last_run_at) },
              { label: "Last topic", value: settings.last_topic ? settings.last_topic.slice(0, 55) + "…" : "—" },
              { label: "Next run",   value: "Tomorrow 9am PKT" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
                <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard icon="📰" label="Total AI Articles" value={totalAutoPosts}  color="#d97706" />
        <StatCard icon="🕐" label="Scheduled"         value={scheduledCount}  color="#b45309" />
        <StatCard icon="✅" label="Published"         value={publishedCount}  color="#059669" />
        <StatCard icon="📊" label="Avg Words"         value={avgWords > 0 ? `${(avgWords/1000).toFixed(1)}k` : "—"} sub="target: 1k+" color="#7c3aed" />
      </div>

      {/* Manual Generate */}
      <div style={{ background: "#fff", border: "1px solid rgba(217,119,6,0.15)", borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 16 }}>⚡ Manual Generate</div>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fef3c7", padding: 4, borderRadius: 10, width: "fit-content" }}>
          {[{ id: "auto", label: "🤖 Auto" }, { id: "topic", label: "✏️ Custom Topic" }, { id: "paragraph", label: "📄 My Paragraph" }].map(m => (
            <button key={m.id} onClick={() => setInputMode(m.id)}
              style={{ padding: "6px 14px", border: "none", borderRadius: 7, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", transition: "all 0.15s", background: inputMode === m.id ? "#fff" : "transparent", color: inputMode === m.id ? "#d97706" : "#92400e", boxShadow: inputMode === m.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {m.label}
            </button>
          ))}
        </div>

        {inputMode === "auto" && (
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.1)", borderRadius: 10, fontSize: "0.78rem", color: "#92400e" }}>
            Claude will pull today's trending Pakistani news and select the best angle automatically.
          </div>
        )}

        {inputMode === "topic" && (
          <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Custom Topic</label>
              <input value={customTopic} onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. HEC announces new merit criteria for 2026 university admissions"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: "0.86rem", color: "#0b1437", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#d97706"}
                onBlur={e => e.target.style.borderColor = "rgba(217,119,6,0.2)"}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Category</label>
              <select value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: "0.86rem", color: "#0b1437", outline: "none", fontFamily: "inherit", background: "#fff" }}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {inputMode === "paragraph" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Your Notes / Context</label>
            <textarea value={userParagraph} onChange={e => setUserParagraph(e.target.value)} rows={4}
              placeholder="Paste your notes, research findings, or story tips here. Claude will write a full professional news article incorporating these facts and angles…"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(217,119,6,0.2)", borderRadius: 10, fontSize: "0.86rem", color: "#0b1437", outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "#d97706"}
              onBlur={e => e.target.style.borderColor = "rgba(217,119,6,0.2)"}
            />
            <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: 3 }}>Claude will build a 900–1200 word article around your facts.</div>
          </div>
        )}

        {/* Custom schedule */}
        <div style={{ marginBottom: 16 }}>
          <SchedulePicker value={customSchedule} onChange={setCustomSchedule} />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={handlePreview} disabled={generating || polling}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: "0.84rem", cursor: (generating || polling) ? "not-allowed" : "pointer", opacity: (generating || polling) ? 0.7 : 1 }}>
            {generating ? "⚙️ Fetching preview…" : "🔍 Preview First"}
          </button>
          <button onClick={() => handleGenerateAndSchedule()} disabled={generating || polling || publishing}
            style={{ padding: "10px 22px", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: "0.84rem", cursor: (generating || polling || publishing) ? "not-allowed" : "pointer", opacity: (generating || polling || publishing) ? 0.7 : 1 }}>
            {publishing ? "⏳ Starting…" : "⚡ Generate & Schedule"}
          </button>
        </div>

        {polling && <BackgroundProgress step={pollingStep} elapsed={pollingElapsed} onCancel={stopPolling} />}
      </div>

      {/* Recent Articles */}
      <div style={{ background: "#fff", border: "1px solid rgba(217,119,6,0.12)", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            📋 Recent AI Articles
            {polling && <span style={{ marginLeft: 8, fontSize: "0.62rem", color: "#b45309", fontWeight: 700, animation: "an-blink 1.5s infinite" }}>● watching…</span>}
          </div>
          <button onClick={loadData} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>↻ Refresh</button>
        </div>
        <RecentAutoArticles posts={recentPosts} onView={p => onEditPost?.(p)} />
      </div>

      {/* How it works */}
      <div style={{ background: "rgba(217,119,6,0.03)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontSize: "0.67rem", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>⚙️ How it works</div>
        {[
          ["📡", "Trending news",       "NewsData.io fetches today's top Pakistani education, tech, and youth headlines"],
          ["✍️", "Claude Sonnet",       "Writes 900–1200 word journalist-quality articles — inverted pyramid structure, real Pakistani context"],
          ["🔴", "Breaking flag",       "Auto-assigns breaking status for announcements and urgent education news"],
          ["🏷️", "Category + SEO",      "Auto-assigns category, builds NewsArticle JSON-LD schema, keywords, readability score"],
          ["📷", "Unique cover images", "Pexels → Unsplash proper API → static fallback. Random page + result = never repeats"],
          ["⏰", "Smart scheduling",    "Education → 9am PKT, Technology → 1pm PKT, Community → 7pm PKT"],
          ["🔄", "529 retry",           "Immediate retries (10s → 25s → 45s) on Claude overload, then 1-hour self-retry via DB"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1, fontWeight: 700, color: "#d97706", minWidth: 18 }}>{icon}</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0b1437" }}>{title} — </span>
              <span style={{ fontSize: "0.76rem", color: "#64748b" }}>{desc}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, fontSize: "0.72rem", color: "#dc2626", fontWeight: 600 }}>
          ⚠️ Required Supabase secrets: <code>ANTHROPIC_API_KEY</code> · <code>AUTO_BLOG_SECRET</code> · <code>NEWSDATA_API_KEY</code> · <code>PEXELS_API_KEY</code> · <code>UNSPLASH_ACCESS_KEY</code>
          <br/>Cron: <code>0 4 * * *</code> (4am UTC = 9am PKT)
        </div>
      </div>

      <style>{`@keyframes an-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

      {preview && (
        <PreviewModal
          preview={preview}
          onPublish={handleGenerateAndSchedule}
          onDiscard={() => setPreview(null)}
          publishing={publishing}
        />
      )}
    </div>
  );
}