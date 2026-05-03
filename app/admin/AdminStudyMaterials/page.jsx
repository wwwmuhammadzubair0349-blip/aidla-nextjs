// app/admin/study-materials/page.jsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Constants ─────────────────────────────────────────────
const CATEGORIES = [
  { value: "notes",         label: "📝 Notes",           icon: "📝" },
  { value: "past_papers",   label: "📋 Past Papers",      icon: "📋" },
  { value: "thesis",        label: "🎓 Thesis",           icon: "🎓" },
  { value: "templates",     label: "📐 Templates",        icon: "📐" },
  { value: "books",         label: "📚 Books",            icon: "📚" },
  { value: "video_link",    label: "🎥 Video Link",       icon: "🎥" },
  { value: "external_link", label: "🔗 External Link",    icon: "🔗" },
  { value: "other",         label: "📦 Other",            icon: "📦" },
];

const LANGUAGES = [
  { value: "en",    label: "English" },
  { value: "ur",    label: "اردو (Urdu)" },
  { value: "multi", label: "Multiple" },
];

const ACCESS_OPTIONS = [
  { value: "free",           label: "🌐 Free — Anyone can download" },
  { value: "login_required", label: "🔐 Login Required" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "✅ Published" },
  { value: "draft",     label: "📝 Draft" },
  { value: "archived",  label: "📦 Archived" },
];

const FILE_TYPE_COLORS = {
  pdf:  { bg: "rgba(239,68,68,0.1)",   color: "#dc2626",  border: "rgba(239,68,68,0.2)"   },
  doc:  { bg: "rgba(59,130,246,0.1)",  color: "#2563eb",  border: "rgba(59,130,246,0.2)"  },
  ppt:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706",  border: "rgba(245,158,11,0.2)"  },
  xls:  { bg: "rgba(16,185,129,0.1)",  color: "#059669",  border: "rgba(16,185,129,0.2)"  },
  zip:  { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed",  border: "rgba(139,92,246,0.2)"  },
  link: { bg: "rgba(14,165,233,0.1)",  color: "#0284c7",  border: "rgba(14,165,233,0.2)"  },
  mp4:  { bg: "rgba(236,72,153,0.1)",  color: "#db2777",  border: "rgba(236,72,153,0.2)"  },
};

function slugify(str) {
  return String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `material-${Date.now()}`;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getFileType(filename) {
  if (!filename) return "link";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["doc","docx"].includes(ext)) return "doc";
  if (["ppt","pptx"].includes(ext)) return "ppt";
  if (["xls","xlsx","csv"].includes(ext)) return "xls";
  if (["zip","rar","7z"].includes(ext)) return "zip";
  if (["mp4","mov","avi"].includes(ext)) return "mp4";
  if (ext === "pdf") return "pdf";
  return "link";
}
const Field = ({ label, required, children, hint }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" }}>
      {label}{required && <span style={{ color:"#ef4444", marginLeft:3 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize:11, color:"#94a3b8" }}>{hint}</div>}
  </div>
);

const TabBtn = ({ id, label, count, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    style={{
      padding:"8px 18px", border:"none", borderRadius:8, cursor:"pointer",
      fontWeight:700, fontSize:"0.82rem", transition:"all 0.2s",
      background: activeTab === id ? "linear-gradient(135deg,#1a3a8f,#3b82f6)" : "transparent",
      color: activeTab === id ? "#fff" : "#64748b",
    }}
  >
    {label}{count !== undefined && <span style={{ marginLeft:6, fontSize:10, opacity:0.8 }}>({count})</span>}
  </button>
);

// ── Empty form state ──────────────────────────────────────
const EMPTY_FORM = {
  title: "", slug: "", description: "", language: "en",
  category: "notes", subject: "", class_level: "", university: "",
  year: "", tags: "", file_url: "", file_path: "", file_type: "",
  file_size_bytes: null, external_url: "", access: "free",
  meta_title: "", meta_description: "", status: "published",
};

// ─────────────────────────────────────────────────────────
export default function AdminStudyMaterials() {
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(null);   // null = new
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [msg,        setMsg]        = useState({ text: "", type: "info" });
  const [uploading,  setUploading]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("list"); // list | form
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fileRef = useRef(null);

  const showMsg = (text, type = "info") => setMsg({ text, type });
  const clearMsg = () => setMsg({ text: "", type: "info" });

  // ── Load all materials ───────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("study_materials_admin_list", {
      p_include_deleted: false,
    });
    if (error) { showMsg(error.message, "error"); setLoading(false); return; }
    setMaterials(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-slug from title
  useEffect(() => {
    if (editing) return;
    setForm(f => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, editing]);

  // ── File upload ──────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("Not logged in");
      const ext  = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `uploads/${auth.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage
        .from("study-materials")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("study-materials").getPublicUrl(path);
      const ft = getFileType(file.name);
      setForm(f => ({
        ...f,
        file_url:        pub.publicUrl,
        file_path:       path,
        file_type:       ft,
        file_size_bytes: file.size,
      }));
      showMsg("File uploaded ✅", "success");
    } catch (e) {
      showMsg("Upload failed: " + e.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // ── Save ─────────────────────────────────────────────
  const handleSave = async () => {
    clearMsg();
    if (!form.title.trim()) return showMsg("Title is required", "error");
    if (!form.slug.trim())  return showMsg("Slug is required", "error");
    if (!form.category)     return showMsg("Category is required", "error");
    if (!form.file_url && !form.external_url)
      return showMsg("Either upload a file or provide an external URL", "error");

    const payload = {
      p_id:               editing?.id || null,
      p_title:            form.title.trim(),
      p_slug:             slugify(form.slug),
      p_description:      form.description.trim(),
      p_language:         form.language,
      p_category:         form.category,
      p_subject:          form.subject.trim() || null,
      p_class_level:      form.class_level.trim() || null,
      p_university:       form.university.trim() || null,
      p_year:             form.year.trim() || null,
      p_tags:             form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      p_file_url:         form.file_url || null,
      p_file_path:        form.file_path || null,
      p_file_type:        form.file_type || null,
      p_file_size_bytes:  form.file_size_bytes || null,
      p_external_url:     form.external_url.trim() || null,
      p_access:           form.access,
      p_meta_title:       form.meta_title.trim() || null,
      p_meta_description: form.meta_description.trim() || null,
      p_status:           form.status,
    };

    const { data, error } = await supabase.rpc("study_materials_admin_upsert", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Save failed", "error");

    showMsg(editing ? "Updated ✅" : "Created ✅", "success");
    await load();
    resetForm();
    setActiveTab("list");
  };

  // ── Delete ───────────────────────────────────────────
  const handleDelete = async (id) => {
    const { data, error } = await supabase.rpc("study_materials_admin_delete", { p_id: id });
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Delete failed", "error");
    showMsg("Deleted ✅", "success");
    setShowDeleteConfirm(null);
    if (editing?.id === id) resetForm();
    await load();
  };

  // ── Edit ─────────────────────────────────────────────
  const handleEdit = async (row) => {
    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("id", row.id)
      .maybeSingle();
    if (error || !data) return showMsg("Could not load material", "error");
    setEditing(data);
    setForm({
      title:            data.title || "",
      slug:             data.slug || "",
      description:      data.description || "",
      language:         data.language || "en",
      category:         data.category || "notes",
      subject:          data.subject || "",
      class_level:      data.class_level || "",
      university:       data.university || "",
      year:             data.year || "",
      tags:             (data.tags || []).join(", "),
      file_url:         data.file_url || "",
      file_path:        data.file_path || "",
      file_type:        data.file_type || "",
      file_size_bytes:  data.file_size_bytes || null,
      external_url:     data.external_url || "",
      access:           data.access || "free",
      meta_title:       data.meta_title || "",
      meta_description: data.meta_description || "",
      status:           data.status || "published",
    });
    setActiveTab("form");
    clearMsg();
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    clearMsg();
  };

  // ── Filtered list ────────────────────────────────────
  const filtered = materials.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.university?.toLowerCase().includes(q);
    const matchCat    = !filterCat || m.category === filterCat;
    return matchSearch && matchCat;
  });

  // ── UI helpers ───────────────────────────────────────


  const inputStyle = {
    padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8,
    fontSize:14, color:"#0f172a", background:"#fff", outline:"none",
    transition:"border 0.15s", width:"100%", boxSizing:"border-box",
  };

  const selectStyle = { ...inputStyle, cursor:"pointer" };



  const catObj = CATEGORIES.find(c => c.value === form.category);
  const isLink = ["video_link","external_link"].includes(form.category);

  return (
    <div style={{ padding:16, maxWidth:1400, margin:"0 auto", fontFamily:"'DM Sans',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, paddingBottom:16, borderBottom:"2px solid #f1f5f9" }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📚</div>
        <div>
          <h1 style={{ margin:0, fontSize:"1.4rem", fontWeight:900, color:"#0b1437" }}>Study Materials</h1>
          <div style={{ fontSize:13, color:"#64748b", marginTop:2 }}>Upload · Manage · Publish documents, notes, past papers & more</div>
        </div>
        <button
          onClick={() => { resetForm(); setActiveTab("form"); }}
          style={{ marginLeft:"auto", padding:"10px 20px", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer", flexShrink:0 }}
        >
          + Add Material
        </button>
      </div>

      {/* ── Message ── */}
      {msg.text && (
        <div style={{
          padding:"11px 16px", borderRadius:10, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between",
          background: msg.type === "error" ? "rgba(239,68,68,0.08)" : msg.type === "success" ? "rgba(22,163,74,0.08)" : "rgba(59,130,246,0.08)",
          border: `1px solid ${msg.type === "error" ? "rgba(239,68,68,0.2)" : msg.type === "success" ? "rgba(22,163,74,0.2)" : "rgba(59,130,246,0.2)"}`,
          color: msg.type === "error" ? "#dc2626" : msg.type === "success" ? "#15803d" : "#1d4ed8",
          fontSize:14,
        }}>
          <span>{msg.text}</span>
          <button onClick={clearMsg} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"inherit", opacity:0.6 }}>×</button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:4, padding:"4px", background:"#f1f5f9", borderRadius:10, width:"fit-content", marginBottom:20 }}>
        <TabBtn id="list" label="📋 All Materials" count={materials.length} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabBtn id="form" label={editing ? "✏️ Edit Material" : "➕ Add Material"} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* ══════════════════════════════════════════════════
          LIST TAB
      ══════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <div>
          {/* Search + Filter */}
          <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by title, subject, university…"
              style={{ ...inputStyle, flex:"1 1 260px", maxWidth:400 }}
            />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...selectStyle, width:"auto", minWidth:180 }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={load} style={{ padding:"9px 14px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, color:"#64748b", fontWeight:600 }}>↻ Refresh</button>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:20 }}>
            {[
              { label:"Total",     value: materials.length,                        color:"#3b82f6" },
              { label:"Published", value: materials.filter(m=>m.status==="published").length, color:"#16a34a" },
              { label:"Draft",     value: materials.filter(m=>m.status==="draft").length,     color:"#d97706" },
              { label:"Free",      value: materials.filter(m=>m.access==="free").length,       color:"#0284c7" },
              { label:"Protected", value: materials.filter(m=>m.access==="login_required").length, color:"#7c3aed" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"12px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#94a3b8", fontWeight:600, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
              <div>Loading materials…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8", border:"2px dashed #e2e8f0", borderRadius:16 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
              <div style={{ fontWeight:700, marginBottom:6 }}>No materials found</div>
              <div style={{ fontSize:13 }}>Add your first study material using the button above</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.map(m => {
                const ftc = FILE_TYPE_COLORS[m.file_type] || FILE_TYPE_COLORS.link;
                const catObj2 = CATEGORIES.find(c => c.value === m.category);
                return (
                  <div key={m.id} style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 4px rgba(0,0,0,0.04)", flexWrap:"wrap" }}>
                    {/* Category icon */}
                    <div style={{ width:40, height:40, borderRadius:10, background:"rgba(26,58,143,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      {catObj2?.icon || "📄"}
                    </div>

                    {/* Main info */}
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:2 }}>{m.title}</div>
                      <div style={{ fontSize:12, color:"#94a3b8", display:"flex", flexWrap:"wrap", gap:8 }}>
                        {m.subject    && <span>📖 {m.subject}</span>}
                        {m.university && <span>🏛 {m.university}</span>}
                        {m.class_level && <span>🎓 {m.class_level}</span>}
                        {m.year       && <span>📅 {m.year}</span>}
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
                      {m.file_type && (
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:ftc.bg, color:ftc.color, border:`1px solid ${ftc.border}`, textTransform:"uppercase" }}>
                          {m.file_type}
                        </span>
                      )}
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                        background: m.access==="free" ? "rgba(22,163,74,0.08)" : "rgba(139,92,246,0.08)",
                        color: m.access==="free" ? "#15803d" : "#7c3aed",
                        border: `1px solid ${m.access==="free" ? "rgba(22,163,74,0.2)" : "rgba(139,92,246,0.2)"}`,
                      }}>
                        {m.access==="free" ? "🌐 Free" : "🔐 Login"}
                      </span>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
                        background: m.status==="published" ? "rgba(22,163,74,0.08)" : m.status==="draft" ? "rgba(245,158,11,0.08)" : "rgba(100,116,139,0.08)",
                        color: m.status==="published" ? "#15803d" : m.status==="draft" ? "#b45309" : "#475569",
                        border: `1px solid ${m.status==="published" ? "rgba(22,163,74,0.2)" : m.status==="draft" ? "rgba(245,158,11,0.2)" : "rgba(100,116,139,0.2)"}`,
                      }}>
                        {m.status}
                      </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display:"flex", gap:12, fontSize:12, color:"#94a3b8", flexShrink:0 }}>
                      <span>⬇ {m.download_count || 0}</span>
                      <span>👁 {m.view_count || 0}</span>
                      {m.file_size_bytes && <span>{formatBytes(m.file_size_bytes)}</span>}
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => handleEdit(m)}
                        style={{ padding:"6px 14px", border:"1px solid #e2e8f0", borderRadius:8, background:"#f8fafc", cursor:"pointer", fontSize:12, fontWeight:600, color:"#334155" }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm(m)}
                        style={{ padding:"6px 14px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, background:"rgba(239,68,68,0.05)", cursor:"pointer", fontSize:12, fontWeight:600, color:"#dc2626" }}>
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          FORM TAB
      ══════════════════════════════════════════════════ */}
      {activeTab === "form" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20, alignItems:"start" }}>

          {/* ── Left: Main form ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Basic Info */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>📝 Basic Info</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <Field label="Title" required>
                    <input style={inputStyle} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Urdu Grammar Notes Class 10"/>
                  </Field>
                </div>
                <Field label="Slug (URL)" required hint={`/resources/${form.slug || "auto-generated"}`}>
                  <input style={inputStyle} value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="urdu-grammar-notes-class-10"/>
                </Field>
                <Field label="Language">
                  <select style={selectStyle} value={form.language} onChange={e=>setForm(f=>({...f,language:e.target.value}))}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
                <div style={{ gridColumn:"1/-1" }}>
                  <Field label="Description" hint="Shown on the detail page. Good for SEO.">
                    <textarea
                      style={{ ...inputStyle, minHeight:90, resize:"vertical", lineHeight:1.6 }}
                      value={form.description}
                      onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                      placeholder="Brief description of what this material covers…"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Classification */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>🏷️ Classification</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Category" required>
                  <select style={selectStyle} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Subject / Course">
                  <input style={inputStyle} value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="e.g. Mathematics, Urdu, Physics"/>
                </Field>
                <Field label="Class / Level">
                  <input style={inputStyle} value={form.class_level} onChange={e=>setForm(f=>({...f,class_level:e.target.value}))} placeholder="e.g. Grade 10, BS Semester 3"/>
                </Field>
                <Field label="University / Institution">
                  <input style={inputStyle} value={form.university} onChange={e=>setForm(f=>({...f,university:e.target.value}))} placeholder="e.g. University of Karachi"/>
                </Field>
                <Field label="Year">
                  <input style={inputStyle} value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="e.g. 2026"/>
                </Field>
                <Field label="Tags" hint="Comma separated">
                  <input style={inputStyle} value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="urdu, grammar, matric, notes"/>
                </Field>
              </div>
              {/* Tag preview */}
              {form.tags && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
                  {form.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=>(
                    <span key={t} style={{ background:"rgba(26,58,143,0.08)", color:"#1a3a8f", border:"1px solid rgba(26,58,143,0.15)", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* File / Link */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>📎 File / Link</div>

              {!isLink ? (
                <>
                  {/* File upload */}
                  {form.file_url ? (
                    <div style={{ background:"rgba(22,163,74,0.05)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <span style={{ fontSize:24 }}>✅</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#15803d" }}>File uploaded</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{form.file_type?.toUpperCase()} · {formatBytes(form.file_size_bytes)}</div>
                      </div>
                      <button onClick={()=>setForm(f=>({...f,file_url:"",file_path:"",file_type:"",file_size_bytes:null}))}
                        style={{ padding:"4px 10px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:6, background:"rgba(239,68,68,0.05)", cursor:"pointer", fontSize:12, color:"#dc2626" }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label style={{ display:"block", border:"2px dashed #e2e8f0", borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:uploading?"not-allowed":"pointer", background:"#fafafa", marginBottom:14 }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>📤</div>
                      <div style={{ fontWeight:700, color:"#334155", marginBottom:4 }}>{uploading ? "Uploading…" : "Click to upload file"}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>PDF, DOC, PPT, XLS, ZIP, MP4 · Max 50MB</div>
                      <input type="file" style={{ display:"none" }} disabled={uploading}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.csv"
                        onChange={e => handleFileUpload(e.target.files?.[0])}
                        ref={fileRef}
                      />
                    </label>
                  )}

                  <Field label="Or paste external URL" hint="Google Drive, Dropbox, etc.">
                    <input style={inputStyle} value={form.external_url} onChange={e=>setForm(f=>({...f,external_url:e.target.value}))} placeholder="https://drive.google.com/…"/>
                  </Field>
                </>
              ) : (
                <Field label={form.category === "video_link" ? "YouTube / Video URL" : "External URL"} required>
                  <input style={inputStyle} value={form.external_url} onChange={e=>setForm(f=>({...f,external_url:e.target.value}))} placeholder={form.category === "video_link" ? "https://youtube.com/watch?v=…" : "https://…"}/>
                </Field>
              )}
            </div>

            {/* SEO */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:24, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", textTransform:"uppercase", letterSpacing:"1px", marginBottom:16 }}>🔍 SEO</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <Field label="Meta Title" hint={`${form.meta_title.length}/60 chars`}>
                  <input style={inputStyle} value={form.meta_title} onChange={e=>setForm(f=>({...f,meta_title:e.target.value}))} placeholder="Defaults to title"/>
                </Field>
                <Field label="Meta Description" hint={`${form.meta_description.length}/160 chars`}>
                  <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" }} value={form.meta_description} onChange={e=>setForm(f=>({...f,meta_description:e.target.value}))} placeholder="Defaults to description (160 chars ideal)"/>
                </Field>

                {/* Google Preview */}
                <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Google Preview</div>
                  <div style={{ fontSize:17, color:"#1a0dab", fontWeight:400, marginBottom:2 }}>{form.meta_title || form.title || "Page Title"}</div>
                  <div style={{ fontSize:12, color:"#006621", marginBottom:3 }}>aidla.online/resources/{form.slug}</div>
                  <div style={{ fontSize:12, color:"#545454", lineHeight:1.5 }}>{form.meta_description || form.description || "Page description…"}</div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right: Settings sidebar ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, position:"sticky", top:20 }}>

            {/* Publish settings */}
            <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:20, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", textTransform:"uppercase", letterSpacing:"1px", marginBottom:14 }}>⚙️ Settings</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Field label="Status">
                  <select style={selectStyle} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Access Control">
                  <select style={selectStyle} value={form.access} onChange={e=>setForm(f=>({...f,access:e.target.value}))}>
                    {ACCESS_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </Field>
              </div>

              {/* Access preview */}
              <div style={{ marginTop:14, padding:"10px 12px", borderRadius:8,
                background: form.access==="free" ? "rgba(22,163,74,0.06)" : "rgba(139,92,246,0.06)",
                border: `1px solid ${form.access==="free" ? "rgba(22,163,74,0.2)" : "rgba(139,92,246,0.2)"}`,
                fontSize:12, color: form.access==="free" ? "#15803d" : "#7c3aed", lineHeight:1.5
              }}>
                {form.access==="free"
                  ? "🌐 Anyone can view and download this material for free."
                  : "🔐 Listed publicly but login required to download."}
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={handleSave} disabled={uploading}
                style={{ padding:"13px 0", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", opacity:uploading?0.6:1 }}>
                💾 {editing ? "Update Material" : "Save & Publish"}
              </button>
              <button onClick={() => { resetForm(); setActiveTab("list"); }}
                style={{ padding:"10px 0", background:"transparent", color:"#64748b", border:"1px solid #e2e8f0", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" }}>
                Cancel
              </button>
              {editing && (
                <button onClick={() => setShowDeleteConfirm(editing)}
                  style={{ padding:"10px 0", background:"rgba(239,68,68,0.05)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, fontWeight:600, fontSize:13, cursor:"pointer" }}>
                  🗑 Delete Material
                </button>
              )}
            </div>

            {/* Preview URL */}
            {form.slug && (
              <div style={{ background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:14, fontSize:12 }}>
                <div style={{ fontWeight:700, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", fontSize:10, letterSpacing:"0.08em" }}>Public URL</div>
                <div style={{ color:"#1a3a8f", wordBreak:"break-all" }}>aidla.online/resources/{form.slug}</div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#fff", borderRadius:18, padding:28, width:"min(420px,95vw)", boxShadow:"0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>🗑️</div>
            <h3 style={{ margin:"0 0 8px", textAlign:"center", fontSize:17, color:"#0f172a" }}>Delete Material?</h3>
            <p style={{ margin:"0 0 20px", textAlign:"center", color:"#64748b", fontSize:14, lineHeight:1.6 }}>
              "<strong>{showDeleteConfirm.title}</strong>" will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDeleteConfirm(null)}
                style={{ flex:1, padding:"11px 0", border:"1px solid #e2e8f0", borderRadius:10, background:"#f8fafc", cursor:"pointer", fontWeight:600, fontSize:14 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm.id)}
                style={{ flex:1, padding:"11px 0", border:"none", borderRadius:10, background:"linear-gradient(135deg,#dc2626,#ef4444)", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}