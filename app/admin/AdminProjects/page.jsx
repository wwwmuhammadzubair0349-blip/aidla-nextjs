"use client";
// app/admin/AdminProjects/page.jsx

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const DOMAINS = [
  { value: "web",           label: "Web",            icon: "🌐" },
  { value: "mobile",        label: "Mobile",         icon: "📱" },
  { value: "ai_ml",         label: "AI / ML",        icon: "🤖" },
  { value: "iot",           label: "IoT",            icon: "📡" },
  { value: "blockchain",    label: "Blockchain",     icon: "⛓️" },
  { value: "data_science",  label: "Data Science",   icon: "📊" },
  { value: "cybersecurity", label: "Cybersecurity",  icon: "🔒" },
  { value: "ar_vr",         label: "AR / VR",        icon: "🥽" },
  { value: "other",         label: "Other",          icon: "📦" },
];

const TYPES = [
  { value: "fyp",          label: "FYP" },
  { value: "mini_project", label: "Mini Project" },
  { value: "semester",     label: "Semester Project" },
  { value: "research",     label: "Research" },
  { value: "internship",   label: "Internship" },
  { value: "other",        label: "Other" },
];

const DIFFICULTIES = [
  { value: "beginner",     label: "🟢 Beginner" },
  { value: "intermediate", label: "🟡 Intermediate" },
  { value: "advanced",     label: "🔴 Advanced" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "✅ Published" },
  { value: "draft",     label: "📝 Draft" },
  { value: "archived",  label: "📦 Archived" },
];

const APPROVAL_STYLE = {
  pending:  { bg: "rgba(245,158,11,0.08)",  color: "#b45309", border: "rgba(245,158,11,0.25)", label: "⏳ Pending" },
  approved: { bg: "rgba(22,163,74,0.08)",   color: "#15803d", border: "rgba(22,163,74,0.2)",  label: "✅ Approved" },
  rejected: { bg: "rgba(239,68,68,0.08)",   color: "#dc2626", border: "rgba(239,68,68,0.2)",  label: "❌ Rejected" },
};

const DOMAIN_COLORS = {
  web: "#3b82f6", mobile: "#8b5cf6", ai_ml: "#06b6d4", iot: "#10b981",
  blockchain: "#f59e0b", data_science: "#6366f1", cybersecurity: "#ef4444",
  ar_vr: "#ec4899", other: "#64748b",
};

function slugify(str) {
  return String(str || "").toLowerCase().trim()
    .replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/, "") || `idea-${Date.now()}`;
}

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function getFileType(n) {
  if (!n) return "link";
  const e = n.split(".").pop()?.toLowerCase();
  if (["doc", "docx"].includes(e)) return "doc";
  if (["ppt", "pptx"].includes(e)) return "ppt";
  if (["xls", "xlsx", "csv"].includes(e)) return "xls";
  if (["zip", "rar", "7z"].includes(e)) return "zip";
  if (["mp4", "mov", "avi"].includes(e)) return "mp4";
  if (e === "pdf") return "pdf";
  return "other";
}

const Field = ({ label, required, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "#94a3b8" }}>{hint}</div>}
  </div>
);

const EMPTY_FORM = {
  title: "", slug: "", description: "", html_preview: "",
  difficulty: "intermediate", type: "mini_project", domain: "web",
  subject: "", course: "", educational_level: "", university: "",
  tech_stack: "", features: "", challenges: "", reference_links: "",
  tags: "", team_size_min: 1, team_size_max: 4, estimated_duration: "",
  file_url: "", file_path: "", file_type: "", file_size_bytes: null,
  status: "published",
};

export default function AdminProjects() {
  const [mainTab,  setMainTab]  = useState("adminIdeas");
  const [ideas,    setIdeas]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterDomain, setFilterDomain] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // User submissions
  const [userIdeas,      setUserIdeas]      = useState([]);
  const [userLoading,    setUserLoading]    = useState(false);
  const [userFilter,     setUserFilter]     = useState("pending");
  const [approvingId,    setApprovingId]    = useState(null);
  const [rejectTarget,   setRejectTarget]   = useState(null);
  const [rejectNote,     setRejectNote]     = useState("");
  const [rejectingId,    setRejectingId]    = useState(null);

  // Form
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [msg,       setMsg]       = useState({ text: "", type: "info" });
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const fileRef = useRef(null);
  const showMsg  = (text, type = "info") => setMsg({ text, type });
  const clearMsg = () => setMsg({ text: "", type: "info" });

  const inputStyle  = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
  const selectStyle = { ...inputStyle, cursor: "pointer" };

  // ── Auto-slug ──
  useEffect(() => {
    if (editing) return;
    setForm(f => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, editing]);

  // ── Load admin ideas ──
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("project_ideas_admin_list");
    if (error) { showMsg(error.message, "error"); setLoading(false); return; }
    setIdeas(data || []);
    setLoading(false);
  }, []);

  // ── Load user submissions ──
  const loadUserIdeas = useCallback(async () => {
    setUserLoading(true);
    const { data, error } = await supabase
      .from("project_ideas")
      .select("id,title,domain,type,difficulty,approval_status,rejection_note,created_at,uploaded_by_user_id")
      .eq("uploader_type", "user")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const userIds = [...new Set(data.map(m => m.uploaded_by_user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("users_profiles")
        .select("user_id,full_name,email")
        .in("user_id", userIds);
      const profileMap = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p; });
      setUserIdeas(data.map(m => ({ ...m, uploader: profileMap[m.uploaded_by_user_id] || null })));
    } else {
      setUserIdeas([]);
    }
    setUserLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (mainTab === "userIdeas") loadUserIdeas(); }, [mainTab, loadUserIdeas]);

  // ── File upload ──
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("Not logged in");
      const path = `uploads/${auth.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage.from("project-ideas").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("project-ideas").getPublicUrl(path);
      setForm(f => ({ ...f, file_url: pub.publicUrl, file_path: path, file_type: getFileType(file.name), file_size_bytes: file.size }));
      showMsg("File uploaded ✅", "success");
    } catch (e) {
      showMsg("Upload failed: " + e.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Save ──
  const handleSave = async () => {
    clearMsg();
    if (!form.title.trim()) return showMsg("Title is required", "error");
    if (!form.slug.trim())  return showMsg("Slug is required", "error");
    if (!form.domain)       return showMsg("Domain is required", "error");
    if (!form.type)         return showMsg("Type is required", "error");

    const parseArr = (str) => str.split("\n").map(s => s.trim()).filter(Boolean);
    const parseTags = (str) => str.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    const payload = {
      p_id:                editing?.id || null,
      p_title:             form.title.trim(),
      p_slug:              slugify(form.slug),
      p_description:       form.description.trim() || null,
      p_html_preview:      form.html_preview.trim() || null,
      p_difficulty:        form.difficulty   || null,
      p_type:              form.type         || null,
      p_domain:            form.domain       || null,
      p_subject:           form.subject.trim()           || null,
      p_course:            form.course.trim()            || null,
      p_educational_level: form.educational_level.trim() || null,
      p_university:        form.university.trim()        || null,
      p_tech_stack:        parseTags(form.tech_stack),
      p_features:          parseArr(form.features),
      p_challenges:        parseArr(form.challenges),
      p_reference_links:   parseArr(form.reference_links),
      p_tags:              parseTags(form.tags),
      p_team_size_min:     Number(form.team_size_min) || 1,
      p_team_size_max:     Number(form.team_size_max) || 4,
      p_estimated_duration:form.estimated_duration.trim() || null,
      p_file_url:          form.file_url  || null,
      p_file_path:         form.file_path || null,
      p_file_type:         form.file_type || null,
      p_file_size_bytes:   form.file_size_bytes || null,
      p_status:            form.status || "published",
    };

    const { data, error } = await supabase.rpc("project_ideas_admin_upsert", payload);
    if (error)     return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Save failed", "error");

    showMsg(editing ? "Updated ✅" : "Created ✅", "success");
    await load();
    resetForm();
    setMainTab("adminIdeas");
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    const { data, error } = await supabase.rpc("project_ideas_admin_delete", { p_id: id });
    if (error || !data?.ok) return showMsg(error?.message || "Delete failed", "error");
    showMsg("Deleted ✅", "success");
    setShowDeleteConfirm(null);
    if (editing?.id === id) resetForm();
    await load();
  };

  // ── Edit ──
  const handleEdit = async (row) => {
    const { data, error } = await supabase.from("project_ideas").select("*").eq("id", row.id).maybeSingle();
    if (error || !data) return showMsg("Could not load idea", "error");
    setEditing(data);
    setForm({
      title:             data.title             || "",
      slug:              data.slug              || "",
      description:       data.description       || "",
      html_preview:      data.html_preview      || "",
      difficulty:        data.difficulty        || "intermediate",
      type:              data.type              || "mini_project",
      domain:            data.domain            || "web",
      subject:           data.subject           || "",
      course:            data.course            || "",
      educational_level: data.educational_level || "",
      university:        data.university        || "",
      tech_stack:        (data.tech_stack || []).join(", "),
      features:          (data.features   || []).join("\n"),
      challenges:        (data.challenges || []).join("\n"),
      reference_links:   (data.reference_links || []).join("\n"),
      tags:              (data.tags       || []).join(", "),
      team_size_min:     data.team_size_min     || 1,
      team_size_max:     data.team_size_max     || 4,
      estimated_duration:data.estimated_duration|| "",
      file_url:          data.file_url          || "",
      file_path:         data.file_path         || "",
      file_type:         data.file_type         || "",
      file_size_bytes:   data.file_size_bytes   || null,
      status:            data.status            || "published",
    });
    setMainTab("form");
    clearMsg();
  };

  const resetForm = () => { setEditing(null); setForm(EMPTY_FORM); clearMsg(); };

  // ── Approve / Reject ──
  const handleApprove = async (id) => {
    setApprovingId(id);
    const { data, error } = await supabase.rpc("project_idea_approve", { p_idea_id: id });
    setApprovingId(null);
    if (error || !data?.ok) { showMsg(error?.message || "Approval failed", "error"); return; }
    showMsg("Approved ✅", "success");
    await loadUserIdeas();
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejectingId(rejectTarget.id);
    const { data, error } = await supabase.rpc("project_idea_reject", { p_idea_id: rejectTarget.id, p_note: rejectNote.trim() || null });
    setRejectingId(null);
    setRejectTarget(null);
    setRejectNote("");
    if (error || !data?.ok) { showMsg(error?.message || "Reject failed", "error"); return; }
    showMsg("Rejected", "success");
    await loadUserIdeas();
  };

  // ── Filtered list ──
  const filtered = ideas.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.university?.toLowerCase().includes(q);
    const matchDomain = !filterDomain || m.domain === filterDomain;
    return matchSearch && matchDomain;
  });

  const filteredUserIdeas = userIdeas.filter(m => m.approval_status === userFilter);

  return (
    <div style={{ padding: 16, maxWidth: 1400, margin: "0 auto", fontFamily: "'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #f1f5f9", flexWrap: "wrap" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💡</div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: "#0b1437" }}>Project Ideas</h1>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Manage ideas · Review submissions · Add new ideas</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => { resetForm(); setMainTab("form"); }}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            + Add Idea
          </button>
        </div>
      </div>

      {/* Global message */}
      {msg.text && (
        <div style={{ padding: "11px 16px", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", background: msg.type === "error" ? "rgba(239,68,68,0.08)" : msg.type === "success" ? "rgba(22,163,74,0.08)" : "rgba(59,130,246,0.08)", border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.2)" : msg.type === "success" ? "rgba(22,163,74,0.2)" : "rgba(59,130,246,0.2)"}`, color: msg.type === "error" ? "#dc2626" : msg.type === "success" ? "#15803d" : "#1d4ed8", fontSize: 14 }}>
          <span>{msg.text}</span>
          <button onClick={clearMsg} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "inherit", opacity: 0.6 }}>×</button>
        </div>
      )}

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "4px", background: "#f1f5f9", borderRadius: 10, width: "fit-content", marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "adminIdeas", label: "🏛️ Admin Ideas",       count: ideas.length },
          { id: "userIdeas",  label: "👥 User Submissions",   count: userIdeas.filter(u => u.approval_status === "pending").length },
          { id: "form",       label: editing ? "✏️ Edit Idea" : "➕ Add Idea" },
        ].map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)} style={{ padding: "8px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", fontFamily: "inherit", background: mainTab === t.id ? "linear-gradient(135deg,#0f172a,#1e3a8a)" : "transparent", color: mainTab === t.id ? "#fff" : "#64748b" }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, background: mainTab === t.id ? "rgba(255,255,255,0.25)" : "rgba(26,58,143,0.12)", color: mainTab === t.id ? "#fff" : "#1a3a8f", borderRadius: 20, padding: "1px 6px" }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ ADMIN IDEAS TAB ══ */}
      {mainTab === "adminIdeas" && (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total",     value: ideas.length,                                color: "#3b82f6" },
              { label: "Published", value: ideas.filter(m => m.status === "published").length, color: "#16a34a" },
              { label: "Draft",     value: ideas.filter(m => m.status === "draft").length,     color: "#d97706" },
              { label: "AI Gen",    value: ideas.filter(m => m.is_ai_generated).length,        color: "#06b6d4" },
            ].map(s => (
              <div key={s.label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by title, subject…"
              style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", flex: "1 1 260px", maxWidth: 400, fontFamily: "inherit" }} />
            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", cursor: "pointer", outline: "none", fontFamily: "inherit", minWidth: 160 }}>
              <option value="">All Domains</option>
              {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
            </select>
            <button onClick={load} style={{ padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 600, fontFamily: "inherit" }}>↻ Refresh</button>
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div><div>Loading ideas…</div></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", border: "2px dashed #e2e8f0", borderRadius: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No ideas found</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(m => {
                const domObj = DOMAINS.find(d => d.value === m.domain);
                const accentColor = DOMAIN_COLORS[m.domain] || "#64748b";
                return (
                  <div key={m.id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {domObj?.icon || "📦"}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <span style={{ color: accentColor, fontWeight: 700 }}>{domObj?.label}</span>
                        {m.type       && <span>{TYPES.find(t => t.value === m.type)?.label}</span>}
                        {m.difficulty && <span>{m.difficulty}</span>}
                        {m.subject    && <span>📖 {m.subject}</span>}
                        {m.university && <span>🏛 {m.university}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: m.status === "published" ? "rgba(22,163,74,0.08)" : "rgba(245,158,11,0.08)", color: m.status === "published" ? "#15803d" : "#b45309", border: `1px solid ${m.status === "published" ? "rgba(22,163,74,0.2)" : "rgba(245,158,11,0.2)"}` }}>
                        {m.status}
                      </span>
                      {m.is_ai_generated && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(6,182,212,0.08)", color: "#0891b2", border: "1px solid rgba(6,182,212,0.2)" }}>✨ AI</span>}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
                      <span>⬆ {m.upvotes_count || 0}</span>
                      <span>👁 {m.view_count || 0}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleEdit(m)} style={{ padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#334155", fontFamily: "inherit" }}>✏️ Edit</button>
                      <button onClick={() => setShowDeleteConfirm(m)} style={{ padding: "6px 14px", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, background: "rgba(239,68,68,0.05)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#dc2626", fontFamily: "inherit" }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ USER SUBMISSIONS TAB ══ */}
      {mainTab === "userIdeas" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { id: "pending",  label: "⏳ Pending",  color: "#b45309" },
              { id: "approved", label: "✅ Approved", color: "#15803d" },
              { id: "rejected", label: "❌ Rejected", color: "#dc2626" },
            ].map(f => (
              <button key={f.id} onClick={() => setUserFilter(f.id)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit", background: userFilter === f.id ? f.color : "#fff", color: userFilter === f.id ? "#fff" : f.color, borderColor: f.color }}>
                {f.label} <span style={{ opacity: 0.7 }}>({userIdeas.filter(u => u.approval_status === f.id).length})</span>
              </button>
            ))}
            <button onClick={loadUserIdeas} style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 600, fontFamily: "inherit" }}>↻ Refresh</button>
          </div>

          {userLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}><div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div><div>Loading submissions…</div></div>
          ) : filteredUserIdeas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", border: "2px dashed #e2e8f0", borderRadius: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
              <div style={{ fontWeight: 700 }}>No {userFilter} submissions</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredUserIdeas.map(m => {
                const sc     = APPROVAL_STYLE[m.approval_status] || APPROVAL_STYLE.pending;
                const domObj = DOMAINS.find(d => d.value === m.domain);
                const accentColor = DOMAIN_COLORS[m.domain] || "#64748b";
                return (
                  <div key={m.id} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ padding: "8px 16px", background: sc.bg, borderBottom: `1px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{sc.label}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        Submitted {new Date(m.created_at).toLocaleDateString()} by{" "}
                        <strong style={{ color: "#334155" }}>{m.uploader?.full_name || m.uploader?.email || "Unknown"}</strong>
                      </span>
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {domObj?.icon || "📦"}
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 2 }}>{m.title}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {domObj && <span style={{ color: accentColor, fontWeight: 700 }}>{domObj.label}</span>}
                          {m.type && <span>{TYPES.find(t => t.value === m.type)?.label}</span>}
                          {m.difficulty && <span>{m.difficulty}</span>}
                        </div>
                        {m.rejection_note && (
                          <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>Note: {m.rejection_note}</div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                        <button onClick={() => handleEdit(m)} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#334155", fontFamily: "inherit" }}>✏️ Edit</button>
                        {m.approval_status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(m.id)} disabled={approvingId === m.id}
                              style={{ padding: "6px 14px", border: "none", borderRadius: 8, background: approvingId === m.id ? "rgba(22,163,74,0.1)" : "linear-gradient(135deg,#16a34a,#22c55e)", color: approvingId === m.id ? "#15803d" : "#fff", cursor: approvingId === m.id ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                              {approvingId === m.id ? "Approving…" : "✅ Approve"}
                            </button>
                            <button onClick={() => { setRejectTarget(m); setRejectNote(""); }}
                              style={{ padding: "6px 14px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, background: "rgba(239,68,68,0.05)", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ FORM TAB ══ */}
      {mainTab === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Basic Info */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>📝 Basic Info</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <Field label="Title" required>
                    <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Student Result Management System" />
                  </Field>
                </div>
                <Field label="Slug" required hint={`/projects/${form.slug || "auto-generated"}`}>
                  <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </Field>
                <Field label="Estimated Duration">
                  <input style={inputStyle} value={form.estimated_duration} onChange={e => setForm(f => ({ ...f, estimated_duration: e.target.value }))} placeholder="e.g. 3 months" />
                </Field>
                <div style={{ gridColumn: "1/-1" }}>
                  <Field label="Description">
                    <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical", lineHeight: 1.6 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the project idea…" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>🏷️ Classification</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Domain" required>
                  <select style={selectStyle} value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
                    {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                  </select>
                </Field>
                <Field label="Project Type" required>
                  <select style={selectStyle} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Difficulty">
                  <select style={selectStyle} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </Field>
                <Field label="Subject / Course Name">
                  <input style={inputStyle} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Database Systems" />
                </Field>
                <Field label="Course Code">
                  <input style={inputStyle} value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. CS401" />
                </Field>
                <Field label="Educational Level">
                  <input style={inputStyle} value={form.educational_level} onChange={e => setForm(f => ({ ...f, educational_level: e.target.value }))} placeholder="e.g. BS, MS, Matric" />
                </Field>
                <Field label="University">
                  <input style={inputStyle} value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} placeholder="e.g. FAST NUCES" />
                </Field>
                <Field label="Tags" hint="Comma separated">
                  <input style={inputStyle} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="react, node, fyp, web" />
                </Field>
                <Field label="Tech Stack" hint="Comma separated">
                  <input style={inputStyle} value={form.tech_stack} onChange={e => setForm(f => ({ ...f, tech_stack: e.target.value }))} placeholder="React, Node.js, MongoDB" />
                </Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label="Team Min">
                    <input type="number" min={1} max={10} style={inputStyle} value={form.team_size_min} onChange={e => setForm(f => ({ ...f, team_size_min: e.target.value }))} />
                  </Field>
                  <Field label="Team Max">
                    <input type="number" min={1} max={10} style={inputStyle} value={form.team_size_max} onChange={e => setForm(f => ({ ...f, team_size_max: e.target.value }))} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Features / Challenges / References */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>📋 Details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Features" hint="One per line">
                  <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.7 }} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"User authentication\nDashboard with analytics\nExport to PDF"} />
                </Field>
                <Field label="Challenges" hint="One per line">
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.7 }} value={form.challenges} onChange={e => setForm(f => ({ ...f, challenges: e.target.value }))} placeholder={"Real-time data sync\nScalability"} />
                </Field>
                <Field label="Reference Links" hint="One URL per line">
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.7 }} value={form.reference_links} onChange={e => setForm(f => ({ ...f, reference_links: e.target.value }))} placeholder={"https://github.com/example\nhttps://docs.example.com"} />
                </Field>
              </div>
            </div>

            {/* HTML Preview */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px" }}>🖥 HTML Preview (Optional)</div>
                {form.html_preview && (
                  <button onClick={() => setShowHtmlPreview(v => !v)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>
                    {showHtmlPreview ? "Hide Preview" : "Preview"}
                  </button>
                )}
              </div>
              <Field label="HTML Code" hint="Paste full HTML. Will be rendered in an iframe on the detail page.">
                <textarea style={{ ...inputStyle, minHeight: 140, resize: "vertical", lineHeight: 1.6, fontFamily: "monospace", fontSize: 12 }}
                  value={form.html_preview}
                  onChange={e => setForm(f => ({ ...f, html_preview: e.target.value }))}
                  placeholder={"<!DOCTYPE html>\n<html>\n<body>\n  <h1>Project Preview</h1>\n</body>\n</html>"}
                />
              </Field>
              {showHtmlPreview && form.html_preview && (
                <div style={{ marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <iframe srcDoc={form.html_preview} style={{ width: "100%", height: 300, border: "none" }} title="HTML Preview" sandbox="allow-scripts" />
                </div>
              )}
            </div>

            {/* File */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>📎 File (Optional)</div>
              {form.file_url ? (
                <div style={{ background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>File uploaded</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{form.file_type?.toUpperCase()} · {formatBytes(form.file_size_bytes)}</div>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, file_url: "", file_path: "", file_type: "", file_size_bytes: null }))}
                    style={{ padding: "4px 10px", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, background: "rgba(239,68,68,0.05)", cursor: "pointer", fontSize: 12, color: "#dc2626", fontFamily: "inherit" }}>
                    Remove
                  </button>
                </div>
              ) : (
                <label style={{ display: "block", border: "2px dashed #e2e8f0", borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer", background: "#fafafa", marginBottom: 10 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
                  <div style={{ fontWeight: 700, color: "#334155", marginBottom: 4 }}>{uploading ? "Uploading…" : "Click to upload file"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>PDF, DOC, PPT, XLS, ZIP, MP4 · Max 5MB</div>
                  <input type="file" style={{ display: "none" }} disabled={uploading} ref={fileRef}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.csv,.html"
                    onChange={e => handleFileUpload(e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b1437", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>⚙️ Publish</div>
              <Field label="Status">
                <select style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handleSave} disabled={uploading}
                style={{ padding: "13px 0", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: uploading ? 0.6 : 1, fontFamily: "inherit" }}>
                💾 {editing ? "Update Idea" : "Save & Publish"}
              </button>
              <button onClick={() => { resetForm(); setMainTab("adminIdeas"); }}
                style={{ padding: "10px 0", background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              {editing && (
                <button onClick={() => setShowDeleteConfirm(editing)}
                  style={{ padding: "10px 0", background: "rgba(239,68,68,0.05)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  🗑 Delete Idea
                </button>
              )}
            </div>

            {form.slug && (
              <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: 14, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: 6, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Public URL</div>
                <div style={{ color: "#1a3a8f", wordBreak: "break-all" }}>aidla.online/projects/{form.slug}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: "min(420px,95vw)", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", textAlign: "center", fontSize: 17, color: "#0f172a" }}>Delete Idea?</h3>
            <p style={{ margin: "0 0 20px", textAlign: "center", color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              "<strong>{showDeleteConfirm.title}</strong>" will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: "11px 0", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm.id)} style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: 28, width: "min(440px,95vw)", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 10 }}>❌</div>
            <h3 style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16, color: "#0f172a" }}>Reject Submission</h3>
            <p style={{ margin: "0 0 16px", textAlign: "center", color: "#64748b", fontSize: 13 }}>"<strong>{rejectTarget.title}</strong>"</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Reason (optional)</label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Tell the user why it was rejected…" rows={3}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setRejectTarget(null); setRejectNote(""); }} style={{ flex: 1, padding: "11px 0", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleReject} disabled={!!rejectingId} style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 10, background: "linear-gradient(135deg,#dc2626,#ef4444)", color: "#fff", cursor: rejectingId ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, opacity: rejectingId ? 0.7 : 1, fontFamily: "inherit" }}>
                {rejectingId ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}