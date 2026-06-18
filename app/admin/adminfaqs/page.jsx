// app/admin/faqs/page.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────── Inline Styles ──────────────── */
const S = {
  root: { minHeight:"100vh", background:"#f0f4ff", fontFamily:"'DM Sans',sans-serif", padding:"0 0 60px" },
  header: { background:"linear-gradient(135deg,#0b1437,#1a3a8f)", color:"#fff", padding:"20px 20px 16px", position:"sticky", top:0, zIndex:100, boxShadow:"0 4px 20px rgba(11,20,55,0.25)" },
  headerInner: { maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 },
  headerTitle: { fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:900, margin:0 },
  headerSub: { fontSize:"0.75rem", color:"rgba(255,255,255,0.6)", marginTop:2 },
  main: { maxWidth:1100, margin:"0 auto", padding:"24px 16px" },
  tabs: { display:"flex", gap:8, marginBottom:24, overflowX:"auto", paddingBottom:4 },
  tab: { padding:"9px 18px", borderRadius:30, border:"1.5px solid rgba(26,58,143,0.2)", background:"#fff", color:"#64748b", fontWeight:700, fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s", minHeight:40 },
  tabActive: { background:"linear-gradient(135deg,#0b1437,#1a3a8f)", color:"#fff", border:"1.5px solid transparent", boxShadow:"0 4px 12px rgba(11,20,55,0.22)" },
  card: { background:"#fff", borderRadius:18, boxShadow:"0 4px 20px rgba(11,20,55,0.07)", border:"1px solid rgba(59,130,246,0.08)", padding:"20px", marginBottom:14 },
  label: { fontSize:"0.7rem", fontWeight:800, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5, display:"block" },
  input: { width:"100%", padding:"10px 13px", border:"1.5px solid rgba(26,58,143,0.15)", borderRadius:10, fontSize:"0.92rem", color:"#0b1437", outline:"none", fontFamily:"inherit", background:"#fafbff", marginBottom:12, boxSizing:"border-box" },
  inputMono: { width:"100%", padding:"10px 13px", border:"1.5px solid rgba(26,58,143,0.15)", borderRadius:10, fontSize:"0.85rem", color:"#0b1437", outline:"none", fontFamily:"monospace", background:"#fafbff", marginBottom:4, boxSizing:"border-box" },
  textarea: { width:"100%", padding:"10px 13px", border:"1.5px solid rgba(26,58,143,0.15)", borderRadius:10, fontSize:"0.9rem", color:"#0b1437", outline:"none", fontFamily:"inherit", background:"#fafbff", marginBottom:12, resize:"vertical", minHeight:110, boxSizing:"border-box" },
  select: { width:"100%", padding:"10px 13px", border:"1.5px solid rgba(26,58,143,0.15)", borderRadius:10, fontSize:"0.9rem", color:"#0b1437", outline:"none", fontFamily:"inherit", background:"#fafbff", marginBottom:12, boxSizing:"border-box" },
  row2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  btnPrimary: { padding:"10px 22px", borderRadius:30, background:"linear-gradient(135deg,#0b1437,#1a3a8f)", color:"#fff", border:"none", fontWeight:800, fontSize:"0.85rem", cursor:"pointer", transition:"opacity 0.2s" },
  btnSuccess: { padding:"10px 22px", borderRadius:30, background:"linear-gradient(135deg,#059669,#10b981)", color:"#fff", border:"none", fontWeight:800, fontSize:"0.85rem", cursor:"pointer" },
  btnDanger:  { padding:"8px 16px", borderRadius:30, background:"rgba(239,68,68,0.1)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.25)", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" },
  btnGhost:   { padding:"8px 16px", borderRadius:30, background:"rgba(100,116,139,0.1)", color:"#475569", border:"1px solid rgba(100,116,139,0.2)", fontWeight:700, fontSize:"0.78rem", cursor:"pointer" },
  btnSm:      { padding:"6px 13px", borderRadius:20, border:"none", fontWeight:700, fontSize:"0.72rem", cursor:"pointer" },
  btnLive:    { padding:"6px 13px", borderRadius:20, border:"none", fontWeight:700, fontSize:"0.72rem", cursor:"pointer", background:"rgba(16,185,129,0.1)", color:"#059669", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 },
  flash: { padding:"12px 16px", borderRadius:10, fontWeight:700, fontSize:"0.85rem", marginBottom:16 },
  flashOk:  { background:"#dcfce7", color:"#166534", border:"1px solid #86efac" },
  flashErr: { background:"#fee2e2", color:"#b91c1c", border:"1px solid #fca5a5" },
  badge: { display:"inline-flex", alignItems:"center", padding:"2px 9px", borderRadius:20, fontSize:"0.65rem", fontWeight:800 },
  statRow: { display:"flex", gap:16, flexWrap:"wrap", marginBottom:20 },
  statCard: { flex:1, minWidth:100, background:"#fff", border:"1px solid rgba(59,130,246,0.1)", borderRadius:14, padding:"14px 16px", textAlign:"center", boxShadow:"0 2px 10px rgba(11,20,55,0.05)" },
  statNum:  { fontSize:"1.6rem", fontWeight:900, color:"#0b1437", display:"block" },
  statLbl:  { fontSize:"0.7rem", color:"#64748b", fontWeight:700, marginTop:2, display:"block" },
  divider:  { height:1, background:"rgba(59,130,246,0.08)", margin:"14px 0" },
  empty: { textAlign:"center", padding:"40px 20px", color:"#94a3b8", fontSize:"0.9rem" },
  actionRow: { display:"flex", gap:8, flexWrap:"wrap", marginTop:12 },
  sectionTitle: { fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:900, color:"#0b1437", marginBottom:16 },
  schedLine: { background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  slugHint: { fontSize:"0.72rem", color:"#64748b", marginBottom:12, marginTop:-2 },
  slugWarn: { fontSize:"0.75rem", color:"#92400e", background:"#fef3c7", border:"1px solid #fcd34d", padding:"8px 12px", borderRadius:8, marginTop:-8, marginBottom:12 },
  slugPreview: { fontSize:"0.72rem", color:"#1a3a8f", background:"#f0f4ff", border:"1px solid rgba(26,58,143,0.15)", padding:"6px 10px", borderRadius:8, marginBottom:12, fontFamily:"monospace", wordBreak:"break-all" },
};

const CATS = [
  { value: "general",               label: "🌐 General" },
  { value: "coins_rewards",         label: "🪙 Coins & Rewards" },
  { value: "tests_quizzes",         label: "📝 Tests & Quizzes" },
  { value: "lucky_draw",            label: "🎲 Lucky Draw & Wheel" },
  { value: "account_profile",       label: "👤 Account & Profile" },
  { value: "withdrawals",           label: "💵 Withdrawals" },
  { value: "education",             label: "🎓 Education" },
  { value: "career",                label: "💼 Career" },
  { value: "finance",               label: "💰 Finance" },
  { value: "health",                label: "🏥 Health" },
  { value: "scholarships",          label: "🏅 Scholarships" },
  { value: "pakistan_boards",       label: "📋 Pakistan Boards" },
  { value: "university_admissions", label: "🏛️ University Admissions" },
  { value: "study_abroad",          label: "✈️ Study Abroad" },
  { value: "technology",            label: "💻 Technology" },
  { value: "css_pms",               label: "🏛 CSS & PMS" },
];

const STATUSES = ["draft","scheduled","published"];

const SITE_URL = "https://www.aidla.online";

/* ── Slug utilities ── */
function autoSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

function slugLooksUrdu(question, slug) {
  return question.trim().length > 5 && slug.length < 4;
}

function sanitizeSlug(val) {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ── Status / category helpers ── */
function statusBadge(s) {
  const map = {
    published: { bg:"#dcfce7", color:"#166534", label:"✅ Published" },
    scheduled:  { bg:"#fef3c7", color:"#92400e", label:"📅 Scheduled" },
    draft:      { bg:"#f1f5f9", color:"#475569", label:"📋 Draft" },
    pending:    { bg:"#dbeafe", color:"#1e40af", label:"⏳ Pending" },
    answered:   { bg:"#dcfce7", color:"#166534", label:"✅ Answered" },
    rejected:   { bg:"#fee2e2", color:"#b91c1c", label:"❌ Rejected" },
  };
  const m = map[s] || { bg:"#f1f5f9", color:"#475569", label: s };
  return <span style={{ ...S.badge, background:m.bg, color:m.color }}>{m.label}</span>;
}

function catLabel(v) { return CATS.find(c => c.value === v)?.label || v; }

function Flash({ msg, type }) {
  if (!msg) return null;
  return <div style={{ ...S.flash, ...(type === "ok" ? S.flashOk : S.flashErr) }}>{msg}</div>;
}

/* ── Confirm Dialog ── */
function Confirm({ msg, onYes, onNo }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:18, padding:28, maxWidth:320, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize:"2rem", marginBottom:10 }}>⚠️</div>
        <div style={{ fontWeight:800, color:"#0b1437", marginBottom:8 }}>Are you sure?</div>
        <div style={{ color:"#64748b", fontSize:"0.88rem", marginBottom:22 }}>{msg}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button style={{ ...S.btnGhost }} onClick={onNo}>Cancel</button>
          <button style={{ ...S.btnDanger, background:"#ef4444", color:"#fff", border:"none" }} onClick={onYes}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── FAQ Form (Create / Edit) ─────────────────────── */
function FAQForm({ initial, onSave, onCancel, loading }) {
  const blank = {
    question:"", answer:"", category:"general",
    status:"draft", sort_order:0, is_visible:true,
    scheduled_at:"", slug:"",
  };
  const [form, setForm]           = useState(initial || blank);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm(initial);
      setSlugEdited(true); // existing FAQ — treat slug as already set
    }
  }, [initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* Auto-update slug from question when admin hasn't manually set it */
  const handleQuestionChange = (val) => {
    set("question", val);
    if (!slugEdited) {
      set("slug", autoSlug(val));
    }
  };

  const handleSlugChange = (val) => {
    setSlugEdited(true);
    set("slug", sanitizeSlug(val));
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    const payload = { ...form };
    if (payload.status === "scheduled" && !payload.scheduled_at) {
      alert("Please set a publish date for scheduled FAQs."); return;
    }
    payload.scheduled_at = payload.scheduled_at
      ? new Date(payload.scheduled_at).toISOString()
      : null;
    payload.sort_order = parseInt(payload.sort_order) || 0;
    // Clean slug — DB trigger also sanitizes, but be clean upfront
    payload.slug = payload.slug
      ? sanitizeSlug(payload.slug)
      : ""; // empty → DB trigger auto-generates
    onSave(payload);
  };

  const previewSlug = form.slug || autoSlug(form.question);
  const urduWarning = slugLooksUrdu(form.question, previewSlug);

  return (
    <div style={{ ...S.card, border:"2px solid rgba(26,58,143,0.2)" }}>
      <div style={{ ...S.sectionTitle, marginBottom:18 }}>
        {initial ? "✏️ Edit FAQ" : "➕ Create New FAQ"}
      </div>

      {/* Question */}
      <label style={S.label}>Question *</label>
      <input
        style={S.input}
        value={form.question}
        onChange={e => handleQuestionChange(e.target.value)}
        placeholder="Enter the question..."
      />

      {/* Slug */}
      <label style={S.label}>
        URL Slug
        <span style={{ fontWeight:500, textTransform:"none", letterSpacing:0, marginLeft:6, color:"#94a3b8", fontSize:"0.68rem" }}>
          (auto-generated — you can override)
        </span>
      </label>
      <input
        style={S.inputMono}
        value={form.slug}
        onChange={e => handleSlugChange(e.target.value)}
        placeholder={autoSlug(form.question) || "auto-generated-from-question"}
      />

      {/* Slug preview URL */}
      {previewSlug && (
        <div style={S.slugPreview}>
          🔗 {SITE_URL}/faqs/<strong>{previewSlug}</strong>
        </div>
      )}

      {/* Urdu warning */}
      {urduWarning && (
        <div style={S.slugWarn}>
          ⚠️ Auto-slug looks too short — the question may be in Urdu or mixed language. Please type a custom English slug above, or leave blank and the database will generate a fallback.
        </div>
      )}

      {!urduWarning && (
        <div style={S.slugHint}>
          Only lowercase letters, numbers, and hyphens. Leave blank to auto-generate from the question.
        </div>
      )}

      {/* Answer */}
      <label style={S.label}>Answer *</label>
      <textarea
        style={S.textarea}
        value={form.answer}
        onChange={e => set("answer", e.target.value)}
        placeholder="Write a detailed, helpful answer..."
        rows={5}
      />

      {/* Category + Status */}
      <div style={S.row2}>
        <div>
          <label style={S.label}>Category</label>
          <select style={S.select} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>Status</label>
          <select style={S.select} value={form.status} onChange={e => set("status", e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Sort order + Visibility */}
      <div style={S.row2}>
        <div>
          <label style={S.label}>Sort Order</label>
          <input style={S.input} type="number" value={form.sort_order} onChange={e => set("sort_order", e.target.value)} min={0} />
        </div>
        <div>
          <label style={S.label}>Visible to public</label>
          <select style={S.select} value={form.is_visible ? "yes" : "no"} onChange={e => set("is_visible", e.target.value === "yes")}>
            <option value="yes">Yes — Visible</option>
            <option value="no">No — Hidden</option>
          </select>
        </div>
      </div>

      {/* Scheduled date */}
      {form.status === "scheduled" && (
        <>
          <label style={S.label}>📅 Scheduled Publish Date & Time</label>
          <input style={S.input} type="datetime-local" value={form.scheduled_at?.slice(0,16) || ""} onChange={e => set("scheduled_at", e.target.value)} />
          <div style={{ fontSize:"0.75rem", color:"#92400e", background:"#fef3c7", padding:"8px 12px", borderRadius:8, marginBottom:12 }}>
            ⏰ This FAQ will automatically go live on the scheduled date. pg_cron checks every hour.
          </div>
        </>
      )}

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", flexWrap:"wrap" }}>
        {onCancel && <button style={S.btnGhost} onClick={onCancel}>Cancel</button>}
        <button style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }} onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : initial ? "💾 Save Changes" : "✅ Create FAQ"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Answer Question Form ─────────────────────── */
function AnswerForm({ uq, onPublish, onReject, onCancel, loading }) {
  const [answer, setAnswer]     = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus]     = useState("published");
  const [schedAt, setSchedAt]   = useState("");
  const [notify, setNotify]     = useState(true);
  const [rejectReason, setRej]  = useState("");
  const [mode, setMode]         = useState("answer"); // "answer" | "reject"

  return (
    <div style={{ ...S.card, border:"2px solid rgba(16,185,129,0.3)" }}>
      <div style={{ marginBottom:14 }}>
        <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#64748b", textTransform:"uppercase" }}>User Question</span>
        <div style={{ fontWeight:700, color:"#0b1437", fontSize:"0.95rem", marginTop:6, lineHeight:1.5 }}>"{uq.question}"</div>
        <div style={{ fontSize:"0.72rem", color:"#64748b", marginTop:4 }}>— {uq.name} ({uq.email}) · {new Date(uq.created_at).toLocaleDateString()}</div>
      </div>
      <div style={S.divider} />

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button style={{ ...S.btnSm, background: mode==="answer"?"#0b1437":"#f1f5f9", color: mode==="answer"?"#fff":"#475569" }} onClick={()=>setMode("answer")}>✅ Answer & Publish</button>
        <button style={{ ...S.btnSm, background: mode==="reject"?"#ef4444":"#f1f5f9", color: mode==="reject"?"#fff":"#475569" }} onClick={()=>setMode("reject")}>❌ Reject</button>
      </div>

      {mode === "answer" && (
        <>
          <label style={S.label}>Your Answer *</label>
          <textarea style={S.textarea} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write a clear, helpful answer that will appear publicly in the FAQs..." rows={5} />
          <div style={S.row2}>
            <div>
              <label style={S.label}>Category</label>
              <select style={S.select} value={category} onChange={e => setCategory(e.target.value)}>
                {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Publish as</label>
              <select style={S.select} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="published">Publish Now</option>
                <option value="scheduled">Schedule</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
          </div>
          {status === "scheduled" && (
            <>
              <label style={S.label}>📅 Schedule for</label>
              <input style={S.input} type="datetime-local" value={schedAt} onChange={e => setSchedAt(e.target.value)} />
            </>
          )}
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:"0.85rem", fontWeight:600, color:"#0b1437", marginBottom:16 }}>
            <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ width:16, height:16 }} />
            📧 Email notification to {uq.email}
          </label>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", flexWrap:"wrap" }}>
            <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
            <button style={{ ...S.btnSuccess, opacity: loading ? 0.6 : 1 }} onClick={() => onPublish({ answer, category, status, scheduled_at: schedAt || null, notify })} disabled={loading || !answer.trim()}>
              {loading ? "Publishing…" : "🚀 Publish Answer"}
            </button>
          </div>
        </>
      )}

      {mode === "reject" && (
        <>
          <label style={S.label}>Rejection Reason (optional — not shown to user)</label>
          <textarea style={S.textarea} value={rejectReason} onChange={e => setRej(e.target.value)} placeholder="Internal note: why is this being rejected?" rows={3} />
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", flexWrap:"wrap" }}>
            <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
            <button style={{ ...S.btnDanger, padding:"10px 22px", fontWeight:800 }} onClick={() => onReject(rejectReason)} disabled={loading}>
              {loading ? "Rejecting…" : "❌ Reject Question"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function AdminFAQs() {
  const [tab, setTab]             = useState("published");
  const [faqs, setFaqs]           = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [flash, setFlash]         = useState({ msg:"", type:"ok" });
  const [editingId, setEditingId] = useState(null);
  const [answeringId, setAnsweringId] = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [filterCat, setFilterCat]     = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]           = useState("");

  const showFlash = (msg, type="ok") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash({ msg:"", type:"ok" }), 4000);
  };

  /* ── Load data ── */
  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
  const channel = supabase
    .channel("faq_realtime")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "user_questions" },
      () => loadAll()
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: f }, { data: q }] = await Promise.all([
      supabase.from("faqs").select("*").order("sort_order").order("created_at"),
      supabase.from("user_questions").select("*").order("created_at", { ascending: false }),
    ]);
    setFaqs(f || []);
    setQuestions(q || []);
    setLoading(false);
  };

  /* ── Stats ── */
  const stats = {
    total:     faqs.length,
    published: faqs.filter(f => f.status === "published").length,
    scheduled: faqs.filter(f => f.status === "scheduled").length,
    draft:     faqs.filter(f => f.status === "draft").length,
    pending:   questions.filter(q => q.status === "pending").length,
    aiPending: faqs.filter(f => f.ai_review_status === "pending_review").length,
  };

  /* ── Filtered FAQs ── */
  const filteredFaqs = faqs.filter(f => {
    if (tab === "published" && f.status !== "published") return false;
    if (tab === "scheduled" && f.status !== "scheduled") return false;
    if (tab === "draft"     && f.status !== "draft")     return false;
    if (filterCat !== "all" && f.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.question.toLowerCase().includes(q) && !f.answer.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredQuestions = questions.filter(q => {
    if (tab !== "questions") return false;
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase()) && !q.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ── Create FAQ ── */
  const handleCreate = async (payload) => {
    setSaving(true);
    const { error } = await supabase.from("faqs").insert(payload);
    if (error) { showFlash("❌ " + error.message, "err"); }
    else { showFlash("✅ FAQ created!"); setShowCreate(false); await loadAll(); }
    setSaving(false);
  };

  /* ── Edit FAQ ── */
  const handleEdit = async (payload) => {
    setSaving(true);
    const { error } = await supabase.from("faqs").update(payload).eq("id", editingId);
    if (error) { showFlash("❌ " + error.message, "err"); }
    else { showFlash("✅ FAQ updated!"); setEditingId(null); await loadAll(); }
    setSaving(false);
  };

  /* ── Quick field update ── */
  const quickUpdate = async (id, patch) => {
    await supabase.from("faqs").update(patch).eq("id", id);
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirmDel) return;
    if (confirmDel.table === "faqs") {
      await supabase.from("faqs").delete().eq("id", confirmDel.id);
      setFaqs(prev => prev.filter(f => f.id !== confirmDel.id));
      showFlash("🗑 FAQ deleted");
    } else {
      await supabase.from("user_questions").delete().eq("id", confirmDel.id);
      setQuestions(prev => prev.filter(q => q.id !== confirmDel.id));
      showFlash("🗑 Question deleted");
    }
    setConfirmDel(null);
  };

  /* ── Answer user question → publish as FAQ ── */
  const handlePublishAnswer = async ({ answer, category, status, scheduled_at, notify }) => {
    const uq = questions.find(q => q.id === answeringId);
    if (!uq) return;
    setSaving(true);
    try {
      const faqPayload = {
        question: uq.question,
        answer,
        category,
        status,
        scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : null,
        is_visible: true,
        sort_order: 99,
        source_question_id: uq.id,
        slug: "", // let DB trigger auto-generate from question
      };
      const { data: newFaq, error: faqErr } = await supabase
        .from("faqs").insert(faqPayload).select().single();
      if (faqErr) throw faqErr;

      await supabase.from("user_questions")
        .update({ status:"answered", answered_faq_id: newFaq.id })
        .eq("id", uq.id);

      if (notify && status === "published") {
        let emailSuccess = false;
        try {
          const { data: fnData } = await supabase.functions.invoke("notify-faq-answer", {
            body: { to: uq.email, name: uq.name, question: uq.question, answer, faq_id: newFaq.id },
          });
          emailSuccess = !fnData?.error;
        } catch (e) {
          console.error("Email invoke exception:", e);
        }

        if (emailSuccess) {
          await supabase.from("user_questions")
            .update({ notified_at: new Date().toISOString() })
            .eq("id", uq.id);
          showFlash("✅ Answer published & email sent to " + uq.email + "!");
        } else {
          showFlash("✅ Answer published! ⚠️ Email failed — check Edge Function logs.", "err");
        }
      } else {
        showFlash("✅ Answer published" + (status === "scheduled" ? " (scheduled)" : "") + "!");
      }

      setAnsweringId(null);
      await loadAll();
    } catch (err) {
      showFlash("❌ " + err.message, "err");
    }
    setSaving(false);
  };

  /* ── Reject user question ── */
  const handleReject = async (reason) => {
    setSaving(true);
    await supabase.from("user_questions")
      .update({ status:"rejected", rejection_reason: reason || null })
      .eq("id", answeringId);
    setAnsweringId(null);
    setQuestions(prev => prev.map(q => q.id === answeringId ? { ...q, status:"rejected" } : q));
    showFlash("Question rejected");
    setSaving(false);
  };

  const editingFaq  = faqs.find(f => f.id === editingId);
  const answeringQ  = questions.find(q => q.id === answeringId);

  const scheduled = faqs
    .filter(f => f.status === "scheduled")
    .sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  return (
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');button{font-family:'DM Sans',sans-serif;}input,select,textarea{font-family:'DM Sans',sans-serif;}`}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerInner}>
          <div>
            <h1 style={S.headerTitle}>📚 FAQ Manager</h1>
            <p style={S.headerSub}>Create, schedule and manage all FAQs + user questions</p>
          </div>
          <button
            style={{ ...S.btnSm, background:"linear-gradient(135deg,#f59e0b,#fcd34d)", color:"#0b1437", padding:"10px 20px", fontSize:"0.82rem" }}
            onClick={() => { setShowCreate(true); setEditingId(null); setTab("published"); window.scrollTo({top:200,behavior:"smooth"}); }}
          >
            ➕ New FAQ
          </button>
        </div>
      </div>

      <div style={S.main}>
        <Flash msg={flash.msg} type={flash.type} />

        {/* ── Stats ── */}
        <div style={S.statRow}>
          {[
            { n: stats.total,     l: "Total FAQs",  c:"#0b1437" },
            { n: stats.published, l: "Published",   c:"#059669" },
            { n: stats.scheduled, l: "Scheduled",   c:"#d97706" },
            { n: stats.draft,     l: "Drafts",      c:"#64748b" },
            { n: stats.pending,   l: "Pending Qs",  c:"#1a3a8f" },
            { n: stats.aiPending, l: "AI Review",   c:"#7c3aed" },
          ].map((s,i) => (
            <div key={i} style={S.statCard}>
              <span style={{ ...S.statNum, color: s.c }}>{s.n}</span>
              <span style={S.statLbl}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={S.tabs}>
          {[
            { id:"published", label:`✅ Published (${stats.published})` },
            { id:"scheduled", label:`📅 Scheduled (${stats.scheduled})` },
            { id:"draft",     label:`📋 Drafts (${stats.draft})` },
            { id:"questions", label:`💬 User Questions (${stats.pending} pending)` },
          ].map(t => (
            <button
              key={t.id}
              style={{ ...S.tab, ...(tab===t.id ? S.tabActive : {}) }}
              onClick={() => { setTab(t.id); setEditingId(null); setAnsweringId(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Search + Filter bar ── */}
        <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
          <input
            style={{ ...S.input, marginBottom:0, flex:1, minWidth:160, fontSize:"0.88rem" }}
            placeholder="🔍 Search FAQs or questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {tab !== "questions" && (
            <select
              style={{ ...S.select, marginBottom:0, width:"auto", minWidth:150, fontSize:"0.85rem" }}
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}
          {tab === "questions" && (
            <select
              style={{ ...S.select, marginBottom:0, width:"auto", minWidth:150, fontSize:"0.85rem" }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>

        {/* ── Create form ── */}
        {showCreate && (
          <FAQForm onSave={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
        )}

        {/* ── Edit form ── */}
        {editingId && editingFaq && (
          <FAQForm initial={editingFaq} onSave={handleEdit} onCancel={() => setEditingId(null)} loading={saving} />
        )}

        {/* ── Answer form ── */}
        {answeringId && answeringQ && (
          <AnswerForm
            uq={answeringQ}
            onPublish={handlePublishAnswer}
            onReject={handleReject}
            onCancel={() => setAnsweringId(null)}
            loading={saving}
          />
        )}

        {loading && <div style={S.empty}>Loading...</div>}

        {/* ── SCHEDULED TIMELINE ── */}
        {!loading && tab === "scheduled" && (
          <>
            <div style={S.sectionTitle}>📅 Publishing Schedule</div>
            {scheduled.length === 0 ? (
              <div style={S.empty}>No scheduled FAQs. Create one using "Scheduled" status in the FAQ form.</div>
            ) : (
              scheduled.map(f => (
                <div key={f.id} style={S.schedLine}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.78rem", fontWeight:800, color:"#92400e", marginBottom:3 }}>
                      📅 {new Date(f.scheduled_at).toLocaleString("en-PK", { weekday:"short", day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </div>
                    <div style={{ fontWeight:700, color:"#0b1437", fontSize:"0.9rem", lineHeight:1.3 }}>{f.question}</div>
                    <div style={{ fontSize:"0.72rem", color:"#64748b", marginTop:3 }}>{catLabel(f.category)}</div>
                    {f.slug && (
                      <div style={{ fontSize:"0.68rem", color:"#94a3b8", marginTop:2, fontFamily:"monospace" }}>
                        /faqs/{f.slug}
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                    <button style={{ ...S.btnSm, background:"rgba(26,58,143,0.08)", color:"#1a3a8f" }} onClick={() => { setEditingId(f.id); window.scrollTo({top:0,behavior:"smooth"}); }}>✏️ Edit</button>
                    <button style={{ ...S.btnSm, background:"rgba(16,185,129,0.1)", color:"#059669" }} onClick={() => quickUpdate(f.id, { status:"published", scheduled_at:null })}>▶ Publish Now</button>
                    <button style={{ ...S.btnSm, background:"rgba(239,68,68,0.08)", color:"#dc2626" }} onClick={() => setConfirmDel({ id:f.id, table:"faqs" })}>🗑</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── FAQ CARDS ── */}
        {!loading && tab !== "questions" && tab !== "scheduled" && (
          <>
            {filteredFaqs.length === 0 ? (
              <div style={S.empty}>
                {search ? `No results for "${search}"` : `No ${tab} FAQs yet.`}
              </div>
            ) : (
              filteredFaqs.map(f => (
                <div key={f.id} style={{ ...S.card, opacity: f.is_visible ? 1 : 0.65 }}>

                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, color:"#0b1437", fontSize:"0.95rem", lineHeight:1.4, marginBottom:6 }}>
                        {f.question}
                      </div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                        {statusBadge(f.status)}
                        <span style={{ ...S.badge, background:"#f0f4ff", color:"#1a3a8f" }}>{catLabel(f.category)}</span>
                        {!f.is_visible && <span style={{ ...S.badge, background:"#fee2e2", color:"#b91c1c" }}>👁 Hidden</span>}
                        {f.source_question_id && <span style={{ ...S.badge, background:"#f0fdf4", color:"#166534" }}>💬 From user</span>}
                        {f.ai_generated && <span style={{ ...S.badge, background:"rgba(124,58,237,0.1)", color:"#7c3aed" }}>🤖 AI {f.ai_quality_score ? `${f.ai_quality_score}/100` : "generated"}</span>}
                      </div>
                      {/* Slug display */}
                      {f.slug && (
                        <div style={{ fontSize:"0.68rem", color:"#94a3b8", marginTop:5, fontFamily:"monospace" }}>
                          🔗 /faqs/<span style={{ color:"#1a3a8f" }}>{f.slug}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink:0, textAlign:"right", fontSize:"0.7rem", color:"#94a3b8" }}>
                      <div>👁 {f.view_count} views</div>
                      <div>👍 {f.helpful_yes} 👎 {f.helpful_no}</div>
                      <div>Sort: #{f.sort_order}</div>
                    </div>
                  </div>

                  {/* Answer preview */}
                  <div style={{ fontSize:"0.82rem", color:"#475569", lineHeight:1.55, background:"#f8faff", borderRadius:8, padding:"10px 12px", marginBottom:12, borderLeft:"3px solid #3b82f6" }}>
                    {f.answer.length > 200 ? f.answer.slice(0,200) + "…" : f.answer}
                  </div>

                  <div style={S.divider} />

                  {/* Quick actions */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                    <button
                      style={{ ...S.btnSm, background:"rgba(26,58,143,0.08)", color:"#1a3a8f" }}
                      onClick={() => { setEditingId(f.id); setShowCreate(false); window.scrollTo({top:0,behavior:"smooth"}); }}
                    >
                      ✏️ Edit
                    </button>

                    {/* View Live — only shown when published and has a slug */}
                    {f.status === "published" && f.slug && (
                      <a
                        href={`${SITE_URL}/faqs/${f.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={S.btnLive}
                      >
                        🔗 View Live
                      </a>
                    )}

                    <button
                      style={{ ...S.btnSm, background: f.is_visible ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", color: f.is_visible ? "#d97706" : "#059669" }}
                      onClick={() => quickUpdate(f.id, { is_visible: !f.is_visible })}
                    >
                      {f.is_visible ? "👁 Hide" : "👁 Show"}
                    </button>

                    <select
                      value={f.status}
                      style={{ fontSize:"0.72rem", padding:"5px 10px", borderRadius:20, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontFamily:"inherit" }}
                      onChange={e => quickUpdate(f.id, { status: e.target.value })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                      value={f.sort_order}
                      style={{ fontSize:"0.72rem", padding:"5px 10px", borderRadius:20, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontFamily:"inherit", width:80 }}
                      onChange={e => quickUpdate(f.id, { sort_order: parseInt(e.target.value) })}
                    >
                      {[0,1,2,3,4,5,10,20,50,99].map(n => <option key={n} value={n}>#{n}</option>)}
                    </select>

                    <button style={{ ...S.btnDanger }} onClick={() => setConfirmDel({ id:f.id, table:"faqs" })}>🗑 Delete</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── USER QUESTIONS ── */}
        {!loading && tab === "questions" && (
          <>
            <div style={S.sectionTitle}>
              💬 User Submitted Questions
              <span style={{ fontSize:"0.8rem", fontWeight:600, color:"#64748b", marginLeft:10 }}>
                ({filteredQuestions.length} shown)
              </span>
            </div>
            {filteredQuestions.length === 0 ? (
              <div style={S.empty}>No questions match your filter.</div>
            ) : (
              filteredQuestions.map(q => (
                <div
                  key={q.id}
                  style={{
                    ...S.card,
                    borderLeft: q.status==="pending"
                      ? "4px solid #f59e0b"
                      : q.status==="answered"
                        ? "4px solid #10b981"
                        : "4px solid #ef4444",
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, color:"#0b1437", fontSize:"0.95rem", lineHeight:1.4, marginBottom:5 }}>
                        {q.question}
                      </div>
                      <div style={{ fontSize:"0.75rem", color:"#64748b" }}>
                        👤 {q.name} · ✉️ {q.email} · {new Date(q.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {statusBadge(q.status)}
                  </div>

                  {q.rejection_reason && (
                    <div style={{ fontSize:"0.78rem", color:"#b91c1c", background:"#fee2e2", borderRadius:8, padding:"7px 10px", marginBottom:8 }}>
                      Rejection note: {q.rejection_reason}
                    </div>
                  )}

                  {q.notified_at && (
                    <div style={{ fontSize:"0.72rem", color:"#059669" }}>
                      ✉️ Notified at {new Date(q.notified_at).toLocaleString()}
                    </div>
                  )}

                  {/* Show link to the FAQ if it was answered */}
                  {q.status === "answered" && q.answered_faq_id && (() => {
                    const faq = faqs.find(f => f.id === q.answered_faq_id);
                    return faq?.slug ? (
                      <div style={{ fontSize:"0.72rem", marginTop:6 }}>
                        <a
                          href={`${SITE_URL}/faqs/${faq.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color:"#1a3a8f", fontWeight:700, textDecoration:"none" }}
                        >
                          🔗 View published FAQ → /faqs/{faq.slug}
                        </a>
                      </div>
                    ) : null;
                  })()}

                  <div style={S.actionRow}>
                    {q.status === "pending" && (
                      <button
                        style={{ ...S.btnSuccess }}
                        onClick={() => { setAnsweringId(q.id); window.scrollTo({top:0,behavior:"smooth"}); }}
                      >
                        ✅ Answer & Publish
                      </button>
                    )}
                    <button style={S.btnDanger} onClick={() => setConfirmDel({ id:q.id, table:"user_questions" })}>🗑 Delete</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmDel && (
        <Confirm
          msg="This cannot be undone."
          onYes={handleDelete}
          onNo={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}