"use client";
// app/user/projects/page.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProjectIdeaGenerator from "@/components/ProjectIdeaGenerator";

function useSEO(title) {
  useEffect(() => {
    document.title = title;
    let rob = document.querySelector('meta[name="robots"]');
    if (!rob) { rob = document.createElement("meta"); rob.setAttribute("name", "robots"); document.head.appendChild(rob); }
    rob.setAttribute("content", "noindex,nofollow");
    return () => { rob.setAttribute("content", "index,follow"); };
  }, [title]);
}

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

const DOMAIN_COLORS = {
  web: "#3b82f6", mobile: "#8b5cf6", ai_ml: "#06b6d4", iot: "#10b981",
  blockchain: "#f59e0b", data_science: "#6366f1", cybersecurity: "#ef4444",
  ar_vr: "#ec4899", other: "#64748b",
};

const STATUS_STYLE = {
  pending:  { bg: "rgba(245,158,11,0.08)",  color: "#b45309", border: "rgba(245,158,11,0.25)", label: "⏳ Pending" },
  approved: { bg: "rgba(22,163,74,0.08)",   color: "#15803d", border: "rgba(22,163,74,0.2)",  label: "✅ Approved" },
  rejected: { bg: "rgba(239,68,68,0.08)",   color: "#dc2626", border: "rgba(239,68,68,0.2)",  label: "❌ Rejected" },
};

const DIFF_COLORS = {
  beginner:     { bg: "rgba(22,163,74,0.08)",  color: "#15803d" },
  intermediate: { bg: "rgba(245,158,11,0.08)", color: "#b45309" },
  advanced:     { bg: "rgba(239,68,68,0.08)",  color: "#dc2626" },
};

function getFileType(n) {
  if (!n) return "other";
  const e = n.split(".").pop()?.toLowerCase();
  if (["doc", "docx"].includes(e)) return "doc";
  if (["ppt", "pptx"].includes(e)) return "ppt";
  if (["xls", "xlsx", "csv"].includes(e)) return "xls";
  if (["zip", "rar", "7z"].includes(e)) return "zip";
  if (["mp4", "mov", "avi"].includes(e)) return "mp4";
  if (e === "pdf") return "pdf";
  return "other";
}

function slugify(str) {
  return String(str || "").toLowerCase().trim()
    .replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "") || `idea-${Date.now()}`;
}

const LIMIT = 15;

const EMPTY_FORM = {
  title: "", domain: "web", type: "mini_project", difficulty: "intermediate",
  subject: "", course: "", educational_level: "", university: "",
  tech_stack: "", features: "", challenges: "", reference_links: "",
  tags: "", team_size_min: 1, team_size_max: 4, estimated_duration: "",
  description: "", html_preview: "",
  file_url: "", file_path: "", file_type: "", file_size_bytes: null,
  external_url: "",
};

const inputSt = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const selSt   = { ...inputSt, cursor: "pointer" };

function FormField({ label, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "#94a3b8" }}>{hint}</div>}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: "#f1f5f9", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: "#f1f5f9", borderRadius: 5, marginBottom: 6, width: "55%" }} />
        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 5, width: "35%" }} />
      </div>
    </div>
  );
}

function IdeaRow({ item }) {
  const domObj = DOMAINS.find(d => d.value === item.domain);
  const accentColor = DOMAIN_COLORS[item.domain] || "#64748b";
  const diffStyle = DIFF_COLORS[item.difficulty] || DIFF_COLORS.beginner;

  return (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#dce7fb"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#f1f5f9"; }}>
      <div style={{ height: 3, background: accentColor }} />
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
          {domObj?.icon || "📦"}
        </div>
        <div style={{ flex: 1, minWidth: 130 }}>
          <Link href={`/projects/${item.slug}`} style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.title}
          </Link>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span style={{ color: accentColor, fontWeight: 700 }}>{domObj?.label}</span>
            {item.type && <span>{TYPES.find(t => t.value === item.type)?.label}</span>}
          </div>
        </div>
        {item.difficulty && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.color}33`, whiteSpace: "nowrap" }}>
            {item.difficulty}
          </span>
        )}
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
          <span>⬆ {item.upvotes_count || 0}</span>
          <span>👁 {item.view_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default function UserProjectsPage() {
  const router = useRouter();
  useSEO("My Projects — AIDLA");

  const [user,         setUser]         = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [tab,          setTab]          = useState("browse");
  const [fullName,     setFullName]     = useState("");

  // Browse
  const [ideas,       setIdeas]       = useState([]);
  const [browseLoad,  setBrowseLoad]  = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [domainFilter,setDomainFilter]= useState("");

  // My submissions
  const [myIdeas,      setMyIdeas]      = useState([]);
  const [myLoading,    setMyLoading]    = useState(false);

  // Saved
  const [saved,        setSaved]        = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // Upload form
  const [showForm,     setShowForm]     = useState(false);
  const [uploadForm,   setUploadForm]   = useState(EMPTY_FORM);
  const [fileUploading,setFileUploading]= useState(false);
  const [uploadMsg,    setUploadMsg]    = useState({ text: "", type: "" });
  const [showHtmlPrev, setShowHtmlPrev] = useState(false);

  const fileRef    = useRef(null);
  const debounceRef= useRef(null);
  const searchRef  = useRef(null);

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.replace("/login?redirect=/user/projects"); return; }
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, []); // eslint-disable-line

  const loadProfile = useCallback(async (uid) => {
    const { data } = await supabase.from("users_profiles").select("full_name").eq("user_id", uid).single();
    if (data?.full_name) setFullName(data.full_name);
  }, []);

  const loadBrowse = useCallback(async (q = search, dom = domainFilter, p = page) => {
    setBrowseLoad(true);
    const { data, error } = await supabase.rpc("project_ideas_public_list", {
      p_search: q || null, p_domain: dom || null, p_type: null, p_difficulty: null,
      p_subject: null, p_course: null, p_educational_level: null, p_university: null,
      p_tech_stack: null, p_limit: LIMIT, p_offset: (p - 1) * LIMIT,
    });
    if (!error && data) { setIdeas(data); setTotal(data[0]?.total_count || 0); }
    setBrowseLoad(false);
  }, [search, domainFilter, page]);

  const loadMyIdeas = useCallback(async (uid) => {
    setMyLoading(true);
    const { data } = await supabase.rpc("project_ideas_user_list", { p_user_id: uid });
    setMyIdeas(data || []);
    setMyLoading(false);
  }, []);

  const loadSaved = useCallback(async (uid) => {
    setSavedLoading(true);
    const { data } = await supabase.rpc("project_ideas_user_saved", { p_user_id: uid });
    setSaved(data || []);
    setSavedLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!checkingAuth && user) { loadProfile(user.id); loadBrowse(); }
  }, [checkingAuth, user]); // eslint-disable-line

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!checkingAuth && user && tab === "submitted") loadMyIdeas(user.id);
    if (!checkingAuth && user && tab === "saved")     loadSaved(user.id);
  }, [tab, checkingAuth, user]); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); loadBrowse(val, domainFilter, 1); }, 350);
  };

  const handleDomain = (dom) => { setDomainFilter(dom); setPage(1); loadBrowse(search, dom, 1); };

  // ── File upload ──
  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileUploading(true);
    try {
      const path = `user-uploads/${user.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: upErr } = await supabase.storage.from("project-ideas").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("project-ideas").getPublicUrl(path);
      setUploadForm(f => ({ ...f, file_url: pub.publicUrl, file_path: path, file_type: getFileType(file.name), file_size_bytes: file.size }));
    } catch (e) {
      setUploadMsg({ text: "File upload failed: " + e.message, type: "err" });
    } finally {
      setFileUploading(false);
    }
  };

  // ── Submit idea ──
  const handleSubmit = async () => {
    if (!uploadForm.title.trim()) { setUploadMsg({ text: "Title is required", type: "err" }); return; }
    if (!uploadForm.domain)       { setUploadMsg({ text: "Domain is required", type: "err" }); return; }
    if (!uploadForm.type)         { setUploadMsg({ text: "Project type is required", type: "err" }); return; }

    const parseArr  = (str) => str.split("\n").map(s => s.trim()).filter(Boolean);
    const parseTags = (str) => str.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

    const { data, error } = await supabase.rpc("project_ideas_user_submit", {
      p_user_id:            user.id,
      p_title:              uploadForm.title.trim(),
      p_slug:               slugify(uploadForm.title),
      p_description:        uploadForm.description.trim()       || null,
      p_html_preview:       uploadForm.html_preview.trim()      || null,
      p_difficulty:         uploadForm.difficulty                || null,
      p_type:               uploadForm.type                     || null,
      p_domain:             uploadForm.domain                   || null,
      p_subject:            uploadForm.subject.trim()           || null,
      p_course:             uploadForm.course.trim()            || null,
      p_educational_level:  uploadForm.educational_level.trim() || null,
      p_university:         uploadForm.university.trim()        || null,
      p_tech_stack:         parseTags(uploadForm.tech_stack),
      p_features:           parseArr(uploadForm.features),
      p_challenges:         parseArr(uploadForm.challenges),
      p_reference_links:    parseArr(uploadForm.reference_links),
      p_tags:               parseTags(uploadForm.tags),
      p_team_size_min:      Number(uploadForm.team_size_min) || 1,
      p_team_size_max:      Number(uploadForm.team_size_max) || 4,
      p_estimated_duration: uploadForm.estimated_duration.trim() || null,
      p_file_url:           uploadForm.file_url   || null,
      p_file_path:          uploadForm.file_path  || null,
      p_file_type:          uploadForm.file_type  || null,
      p_file_size_bytes:    uploadForm.file_size_bytes || null,
    });

    if (error || !data?.ok) { setUploadMsg({ text: error?.message || data?.error || "Submission failed", type: "err" }); return; }
    setUploadMsg({ text: "Submitted! Pending admin review.", type: "ok" });
    setUploadForm(EMPTY_FORM);
    setShowForm(false);
    if (tab === "submitted") loadMyIdeas(user.id);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const userName   = fullName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div><div style={{ color: "#64748b" }}>Checking authentication…</div></div>
    </div>
  );

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        .up-page{min-height:100vh;background:#f8fafc;font-family:'DM Sans',sans-serif;}
        .up-header{background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 70%,#3b82f6 100%);padding:16px 12px 20px;}
        .up-header-inner{max-width:1100px;margin:0 auto;}
        .up-tabs{background:#fff;border-bottom:1px solid #f1f5f9;overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .up-tabs-inner{max-width:1100px;margin:0 auto;padding:0 8px;display:flex;}
        .up-tab{padding:11px 14px;border:none;background:none;font-weight:700;font-size:12px;cursor:pointer;white-space:nowrap;font-family:inherit;border-bottom:2px solid transparent;color:#64748b;transition:all 0.15s;}
        .up-tab.active{color:#1e3a8a;border-bottom-color:#1e3a8a;}
        .up-content{max-width:1100px;margin:0 auto;padding:16px 10px 60px;}
        .up-card{background:#fff;border:1px solid #f1f5f9;border-radius:12px;padding:10px 12px;box-shadow:0 1px 3px rgba(0,0,0,0.04);}
        .up-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .up-empty{text-align:center;padding:44px 14px;border:2px dashed #e2e8f0;border-radius:14px;}
        @media(max-width:600px){
          .up-form-grid{grid-template-columns:1fr!important;}
          .up-tab{padding:10px 10px;font-size:11px;}
        }
      `}</style>

      <div className="up-page">
        {/* Header */}
        <div className="up-header">
          <div className="up-header-inner">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>Welcome back 👋</div>
                <h1 style={{ margin: "0 0 2px", fontSize: "clamp(1.1rem,5vw,1.7rem)", fontWeight: 900, color: "#fff" }}>{userName}</h1>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{user?.email}</div>
              </div>
              <Link href="/projects" style={{ padding: "7px 14px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 600, border: "1px solid rgba(255,255,255,0.18)", whiteSpace: "nowrap" }}>
                📚 Browse Ideas
              </Link>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
              {[
                { icon: "💡", label: "Submitted",  value: myIdeas.length },
                { icon: "🔖", label: "Saved",      value: saved.length },
                { icon: "✅", label: "Approved",   value: myIdeas.filter(m => m.approval_status === "approved").length },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "10px 10px" }}>
                  <div style={{ fontSize: 14 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginTop: 3 }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="up-tabs">
          <div className="up-tabs-inner">
            {[
              { id: "browse",    label: "💡 Browse" },
              { id: "generate",  label: "✨ Generate" },
              { id: "submitted", label: "📤 Submitted" },
              { id: "saved",     label: "🔖 Saved" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`up-tab${tab === t.id ? " active" : ""}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="up-content">

          {/* ══ BROWSE TAB ══ */}
          {tab === "browse" && (
            <>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
                <input ref={searchRef} onChange={e => handleSearch(e.target.value)} placeholder="Search ideas…"
                  style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0", borderRadius: 9, fontSize: 13, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit" }} />
              </div>

              {/* Domain pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                <button onClick={() => handleDomain("")}
                  style={{ padding: "4px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid", background: !domainFilter ? "linear-gradient(135deg,#0f172a,#1e3a8a)" : "#fff", color: !domainFilter ? "#fff" : "#475569", borderColor: !domainFilter ? "#0f172a" : "#e2e8f0", fontFamily: "inherit" }}>
                  🗂️ All
                </button>
                {DOMAINS.map(d => (
                  <button key={d.value} onClick={() => handleDomain(d.value)}
                    style={{ padding: "4px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid", background: domainFilter === d.value ? "linear-gradient(135deg,#0f172a,#1e3a8a)" : "#fff", color: domainFilter === d.value ? "#fff" : "#475569", borderColor: domainFilter === d.value ? "#0f172a" : "#e2e8f0", fontFamily: "inherit" }}>
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                {browseLoad ? "Loading…" : `${total.toLocaleString()} Idea${total !== 1 ? "s" : ""}`}
              </div>

              {browseLoad ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : ideas.length === 0 ? (
                <div className="up-empty">
                  <div style={{ fontSize: 34, marginBottom: 7 }}>📭</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#334155", marginBottom: 4 }}>No ideas found</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>Try a different search or domain</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ideas.map(m => <IdeaRow key={m.id} item={m} />)}
                </div>
              )}

              {totalPages > 1 && !browseLoad && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, marginTop: 20, flexWrap: "wrap" }}>
                  <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); loadBrowse(search, domainFilter, p); }} disabled={page === 1}
                    style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#334155", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => { setPage(p); loadBrowse(search, domainFilter, p); }}
                      style={{ width: 32, height: 32, border: "1px solid", borderRadius: 7, cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "inherit", background: page === p ? "linear-gradient(135deg,#0f172a,#1e3a8a)" : "#fff", color: page === p ? "#fff" : "#334155", borderColor: page === p ? "#0f172a" : "#e2e8f0" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); loadBrowse(search, domainFilter, p); }} disabled={page === totalPages}
                    style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#334155", fontWeight: 600, fontSize: 12, fontFamily: "inherit" }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "generate" && <ProjectIdeaGenerator embedded />}

          {/* ══ SUBMITTED TAB ══ */}
          {tab === "submitted" && (
            <div>
              {/* Info + submit button */}
              <div style={{ background: "rgba(26,58,143,0.05)", border: "1px solid rgba(26,58,143,0.15)", borderRadius: 11, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a" }}>Submit a Project Idea</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>Share your idea with the community. Admin will review and publish it.</div>
                </div>
                {!showForm && (
                  <button onClick={() => setShowForm(true)}
                    style={{ padding: "8px 16px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    + Submit Idea
                  </button>
                )}
              </div>

              {/* Upload form */}
              {showForm && (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: "0 3px 16px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0b1437" }}>💡 Submit a Project Idea</div>
                    <button onClick={() => { setShowForm(false); setUploadForm(EMPTY_FORM); setUploadMsg({ text: "", type: "" }); }}
                      style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>×</button>
                  </div>

                  {uploadMsg.text && (
                    <div style={{ padding: "9px 12px", borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600, background: uploadMsg.type === "err" ? "#fee2e2" : "#dcfce7", color: uploadMsg.type === "err" ? "#991b1b" : "#166534", border: `1px solid ${uploadMsg.type === "err" ? "#fecaca" : "#86efac"}` }}>
                      {uploadMsg.type === "err" ? "⚠️" : "✅"} {uploadMsg.text}
                    </div>
                  )}

                  <div className="up-form-grid">
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Title" required>
                        <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Student Attendance System using Face Recognition" style={inputSt} />
                      </FormField>
                    </div>
                    <FormField label="Domain" required>
                      <select value={uploadForm.domain} onChange={e => setUploadForm(f => ({ ...f, domain: e.target.value }))} style={selSt}>
                        {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.icon} {d.label}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Project Type" required>
                      <select value={uploadForm.type} onChange={e => setUploadForm(f => ({ ...f, type: e.target.value }))} style={selSt}>
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Difficulty">
                      <select value={uploadForm.difficulty} onChange={e => setUploadForm(f => ({ ...f, difficulty: e.target.value }))} style={selSt}>
                        {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Duration">
                      <input value={uploadForm.estimated_duration} onChange={e => setUploadForm(f => ({ ...f, estimated_duration: e.target.value }))} placeholder="e.g. 3 months" style={inputSt} />
                    </FormField>
                    <FormField label="Subject">
                      <input value={uploadForm.subject} onChange={e => setUploadForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Software Engineering" style={inputSt} />
                    </FormField>
                    <FormField label="Course Code">
                      <input value={uploadForm.course} onChange={e => setUploadForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. SE401" style={inputSt} />
                    </FormField>
                    <FormField label="Level">
                      <input value={uploadForm.educational_level} onChange={e => setUploadForm(f => ({ ...f, educational_level: e.target.value }))} placeholder="e.g. BS, MS" style={inputSt} />
                    </FormField>
                    <FormField label="University">
                      <input value={uploadForm.university} onChange={e => setUploadForm(f => ({ ...f, university: e.target.value }))} placeholder="e.g. FAST NUCES" style={inputSt} />
                    </FormField>
                    <FormField label="Tech Stack" hint="Comma separated">
                      <input value={uploadForm.tech_stack} onChange={e => setUploadForm(f => ({ ...f, tech_stack: e.target.value }))} placeholder="React, Node.js, MongoDB" style={inputSt} />
                    </FormField>
                    <FormField label="Tags" hint="Comma separated">
                      <input value={uploadForm.tags} onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))} placeholder="fyp, ai, face-recognition" style={inputSt} />
                    </FormField>
                    <div style={{ display: "flex", gap: 8 }}>
                      <FormField label="Team Min">
                        <input type="number" min={1} max={10} value={uploadForm.team_size_min} onChange={e => setUploadForm(f => ({ ...f, team_size_min: e.target.value }))} style={inputSt} />
                      </FormField>
                      <FormField label="Team Max">
                        <input type="number" min={1} max={10} value={uploadForm.team_size_max} onChange={e => setUploadForm(f => ({ ...f, team_size_max: e.target.value }))} style={inputSt} />
                      </FormField>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Description">
                        <textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the project idea in detail…" rows={3} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
                      </FormField>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Features" hint="One per line">
                        <textarea value={uploadForm.features} onChange={e => setUploadForm(f => ({ ...f, features: e.target.value }))} placeholder={"Face recognition login\nAttendance dashboard\nExport reports"} rows={3} style={{ ...inputSt, resize: "vertical", lineHeight: 1.7 }} />
                      </FormField>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Challenges" hint="One per line">
                        <textarea value={uploadForm.challenges} onChange={e => setUploadForm(f => ({ ...f, challenges: e.target.value }))} placeholder={"Accuracy in low light\nReal-time processing"} rows={2} style={{ ...inputSt, resize: "vertical", lineHeight: 1.7 }} />
                      </FormField>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Reference Links" hint="One URL per line">
                        <textarea value={uploadForm.reference_links} onChange={e => setUploadForm(f => ({ ...f, reference_links: e.target.value }))} placeholder="https://github.com/example" rows={2} style={{ ...inputSt, resize: "vertical", lineHeight: 1.7 }} />
                      </FormField>
                    </div>

                    {/* HTML Preview */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>HTML Preview (Optional)</label>
                        {uploadForm.html_preview && (
                          <button onClick={() => setShowHtmlPrev(v => !v)}
                            style={{ fontSize: 11, fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                            {showHtmlPrev ? "Hide" : "Preview"}
                          </button>
                        )}
                      </div>
                      <textarea value={uploadForm.html_preview} onChange={e => setUploadForm(f => ({ ...f, html_preview: e.target.value }))}
                        placeholder={"<!DOCTYPE html>\n<html>\n<body>\n  <h1>My Project UI Preview</h1>\n</body>\n</html>"}
                        rows={3} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6, fontFamily: "monospace", fontSize: 12 }} />
                      {showHtmlPrev && uploadForm.html_preview && (
                        <div style={{ marginTop: 8, border: "1px solid #e2e8f0", borderRadius: 9, overflow: "hidden" }}>
                          <iframe srcDoc={uploadForm.html_preview} style={{ width: "100%", height: 200, border: "none" }} title="Preview" sandbox="allow-scripts" />
                        </div>
                      )}
                    </div>

                    {/* File upload */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <FormField label="Attach File (Optional)">
                        {uploadForm.file_url ? (
                          <div style={{ background: "rgba(22,163,74,0.05)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 9, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18 }}>✅</span>
                            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#15803d" }}>
                              File ready · {uploadForm.file_type?.toUpperCase()}
                            </div>
                            <button onClick={() => setUploadForm(f => ({ ...f, file_url: "", file_path: "", file_type: "", file_size_bytes: null }))}
                              style={{ padding: "3px 9px", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 5, background: "rgba(239,68,68,0.05)", cursor: "pointer", fontSize: 11, color: "#dc2626", fontFamily: "inherit" }}>
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label style={{ display: "block", border: "2px dashed #e2e8f0", borderRadius: 9, padding: "16px 14px", textAlign: "center", cursor: fileUploading ? "not-allowed" : "pointer", background: "#fafafa" }}>
                            <div style={{ fontSize: 22, marginBottom: 4 }}>📤</div>
                            <div style={{ fontWeight: 700, color: "#334155", fontSize: 12 }}>{fileUploading ? "Uploading…" : "Click to upload"}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>PDF, DOC, PPT, ZIP, MP4 — Max 5MB</div>
                            <input type="file" style={{ display: "none" }} disabled={fileUploading} ref={fileRef}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.html"
                              onChange={e => handleFileUpload(e.target.files?.[0])} />
                          </label>
                        )}
                      </FormField>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button onClick={() => { setShowForm(false); setUploadForm(EMPTY_FORM); setUploadMsg({ text: "", type: "" }); }}
                      style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: 9, background: "#f8fafc", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#64748b", fontFamily: "inherit" }}>
                      Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={fileUploading}
                      style={{ flex: 2, padding: "10px", border: "none", borderRadius: 9, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: fileUploading ? 0.6 : 1, fontFamily: "inherit" }}>
                      💡 Submit for Review
                    </button>
                  </div>
                </div>
              )}

              {/* My submissions list */}
              {myLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : myIdeas.length === 0 ? (
                <div className="up-empty">
                  <div style={{ fontSize: 34, marginBottom: 7 }}>💡</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#334155", marginBottom: 4 }}>No submissions yet</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Share your project ideas with the community</div>
                  {!showForm && (
                    <button onClick={() => setShowForm(true)}
                      style={{ padding: "9px 20px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                      + Submit First Idea
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {myIdeas.map(m => {
                    const sc     = STATUS_STYLE[m.approval_status] || STATUS_STYLE.pending;
                    const domObj = DOMAINS.find(d => d.value === m.domain);
                    const accentColor = DOMAIN_COLORS[m.domain] || "#64748b";
                    return (
                      <div key={m.id} className="up-card" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                          {domObj?.icon || "📦"}
                        </div>
                        <div style={{ flex: 1, minWidth: 130 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 2 }}>{m.title}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>
                            {domObj?.label} · {TYPES.find(t => t.value === m.type)?.label} · {new Date(m.created_at).toLocaleDateString()}
                          </div>
                          {m.approval_status === "rejected" && m.rejection_note && (
                            <div style={{ fontSize: 10, color: "#dc2626", marginTop: 2, fontWeight: 600 }}>Reason: {m.rejection_note}</div>
                          )}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: "nowrap" }}>
                          {sc.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ SAVED TAB ══ */}
          {tab === "saved" && (
            <div>
              <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 11, padding: "11px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔖</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>Saved Ideas</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>Ideas you bookmarked. View and upvote anytime.</div>
                </div>
              </div>

              {savedLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
              ) : saved.length === 0 ? (
                <div className="up-empty">
                  <div style={{ fontSize: 34, marginBottom: 7 }}>🔖</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#334155", marginBottom: 4 }}>No saved ideas yet</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Browse ideas and click Save to bookmark them</div>
                  <button onClick={() => setTab("browse")}
                    style={{ padding: "9px 20px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Browse Ideas
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {saved.map(m => {
                    const domObj = DOMAINS.find(d => d.value === m.domain);
                    const accentColor = DOMAIN_COLORS[m.domain] || "#64748b";
                    return (
                      <div key={m.id} className="up-card" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accentColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                          {domObj?.icon || "📦"}
                        </div>
                        <div style={{ flex: 1, minWidth: 130 }}>
                          <Link href={`/projects/${m.slug}`} style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textDecoration: "none", display: "block" }}>{m.title}</Link>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                            {domObj?.label} · {m.difficulty} · Saved {new Date(m.saved_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#94a3b8" }}>
                          <span>⬆ {m.upvotes_count || 0}</span>
                          <span>👁 {m.view_count || 0}</span>
                        </div>
                        <Link href={`/projects/${m.slug}`}
                          style={{ padding: "6px 12px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                          View →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
