// app/admin/news/page.jsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

function slugify(str) {
  const latin = String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return latin || `news-${Date.now()}`;
}

const statusColors = {
  draft:     { bg: "rgba(100,116,139,0.1)", color: "#475569", border: "rgba(100,116,139,0.2)" },
  published: { bg: "rgba(22,163,74,0.1)",   color: "#15803d", border: "rgba(22,163,74,0.25)" },
  scheduled: { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.3)" },
};

const CATEGORIES = [
  { value: "", label: "No Category" },
  { value: "general", label: "🌐 General" },
  { value: "politics", label: "🏛️ Politics" },
  { value: "education", label: "📚 Education" },
  { value: "technology", label: "💻 Technology" },
  { value: "community", label: "🤝 Community" },
  { value: "events", label: "🎯 Events" },
  { value: "announcements", label: "📢 Announcements" },
];

const CAT_COLORS = {
  general: "#3b82f6", politics: "#8b5cf6", education: "#0891b2",
  technology: "#0f766e", community: "#16a34a", events: "#d97706", announcements: "#dc2626",
};

/* ══════════════════════════════════════════════════════════════
   HTML PREVIEW (editable rendered view)
   ══════════════════════════════════════════════════════════════ */
function HtmlPreview({ value, onChange }) {
  const ref = useRef(null);
  const skipUpdate = useRef(false);

  useEffect(() => {
    if (!ref.current || skipUpdate.current) return;
    if (ref.current.innerHTML !== (value || "")) ref.current.innerHTML = value || "";
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        skipUpdate.current = true;
        onChange(ref.current?.innerHTML || "");
        skipUpdate.current = false;
      }}
      style={{ minHeight: 400, maxHeight: 600, padding: "18px 20px", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 12, outline: "none", fontSize: 15, lineHeight: 1.8, color: "#1e293b", fontFamily: "'DM Sans', sans-serif", overflowY: "auto" }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN NEWS COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AdminNews() {
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState("");
  const [msgType, setMsgType]           = useState("info");
  const [posts, setPosts]               = useState([]);
  const [listSearch, setListSearch]     = useState("");
  const [listFilter, setListFilter]     = useState("all");
  const [editing, setEditing]           = useState(null);
  const [mobileView, setMobileView]     = useState("list");

  const [title, setTitle]               = useState("");
  const [authorName, setAuthorName]     = useState("");
  const [slug, setSlug]                 = useState("");
  const [excerpt, setExcerpt]           = useState("");
  const [contentHtml, setContentHtml]   = useState("");
  const [status, setStatus]             = useState("draft");
  const [scheduledAt, setScheduledAt]   = useState("");
  const [metaTitle, setMetaTitle]       = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [coverUrl, setCoverUrl]         = useState("");
  const [coverPath, setCoverPath]       = useState("");
  const [uploading, setUploading]       = useState(false);
  const [tags, setTags]                 = useState("");
  const [category, setCategory]         = useState("");
  const [isBreaking, setIsBreaking]     = useState(false);
  const [activeTab, setActiveTab]       = useState("content");

  const [comments, setComments]         = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const showMsg = (text, type = "info") => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(""), 4000); };

  const resetForm = () => {
    setEditing(null);
    setTitle(""); setAuthorName(""); setSlug(""); setExcerpt(""); setContentHtml("");
    setStatus("draft"); setScheduledAt("");
    setMetaTitle(""); setMetaDescription("");
    setCanonicalUrl(""); setCoverUrl(""); setCoverPath(""); setTags(""); setCategory(""); setIsBreaking(false);
    setComments([]); setShowComments(false); setActiveTab("content");
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_posts")
      .select("id,title,slug,status,excerpt,cover_image_url,published_at,scheduled_at,updated_at,view_count,tags")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) { showMsg(error.message, "error"); setPosts([]); } else setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (editing) return; setSlug(slugify(title)); }, [title, editing]);

  const loadComments = async (postId) => {
    setCommentsLoading(true);
    const { data } = await supabase.from("news_comments")
      .select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments(data || []);
    setCommentsLoading(false);
  };

  const onPickEdit = async (row) => {
    showMsg("", "info");
    const { data, error } = await supabase.from("news_posts").select("*").eq("id", row.id).maybeSingle();
    if (error) return showMsg(error.message, "error");
    if (!data)  return showMsg("Article not found", "error");
    setEditing(data);
    setTitle(data.title || ""); setAuthorName(data.author_name || ""); setSlug(data.slug || "");
    setExcerpt(data.excerpt || ""); setContentHtml(data.content_html || data.content || "");
    setStatus(data.status || "draft");
    if (data.scheduled_at) {
      const dt = new Date(data.scheduled_at);
      setScheduledAt(new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,16));
    } else setScheduledAt("");
    setMetaTitle(data.meta_title || ""); setMetaDescription(data.meta_description || "");
    setCanonicalUrl(data.canonical_url || ""); setCoverUrl(data.cover_image_url || "");
    setCoverPath(data.cover_image_path || "");
    const tagArr = data.tags || [];
    const catTag = tagArr.find(t => CATEGORIES.map(c => c.value).includes(t));
    setCategory(catTag || "");
    setIsBreaking(tagArr.includes("breaking"));
    setTags(tagArr.filter(t => t !== catTag && t !== "breaking").join(", "));
    setActiveTab("content"); setShowComments(false);
    await loadComments(data.id);
    setMobileView("editor");
  };

  const buildTagsArray = () => {
    const base = tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    if (category) base.unshift(category);
    if (isBreaking && !base.includes("breaking")) base.push("breaking");
    return [...new Set(base)];
  };

  const onSave = async () => {
    showMsg("", "info");
    if (!title.trim())       return showMsg("Title required", "error");
    if (!slug.trim())        return showMsg("Slug required", "error");
    if (!contentHtml.trim()) return showMsg("Content required", "error");
    if (status === "scheduled" && !scheduledAt) return showMsg("Please set a scheduled date & time", "error");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = contentHtml;
    const plainText = tempDiv.innerText || tempDiv.textContent || "";

    let scheduledIso = null;
    if (status === "scheduled" && scheduledAt) {
      scheduledIso = new Date(scheduledAt).toISOString();
    }

    const payload = {
      p_id: editing?.id || null,
      p_title: title.trim(),
      p_author_name: authorName.trim(),
      p_slug: slugify(slug),
      p_excerpt: excerpt.trim(),
      p_content: plainText,
      p_content_html: contentHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: status,
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: canonicalUrl.trim(),
      p_tags: buildTagsArray(),
      p_scheduled_at: scheduledIso,
    };
    const { data, error } = await supabase.rpc("news_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Save failed", "error");
    await load(); showMsg(editing ? "Updated ✅" : "Created ✅", "success"); resetForm();
  };

  const onDelete = async (row) => {
    if (!confirm("Delete this article?")) return;
    const { data, error } = await supabase.rpc("news_admin_delete_post", { p_id: row.id });
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Delete failed", "error");
    resetForm(); await load(); showMsg("Deleted ✅", "success");
  };

  const onDuplicate = async () => {
    if (!editing) return;
    const payload = {
      p_id: null,
      p_title: `${title} (Copy)`,
      p_author_name: authorName.trim(),
      p_slug: `${slugify(slug)}-copy-${Date.now()}`,
      p_excerpt: excerpt.trim(),
      p_content: "",
      p_content_html: contentHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: "draft",
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: "",
      p_tags: buildTagsArray(),
      p_scheduled_at: null,
    };
    const { data, error } = await supabase.rpc("news_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Duplicate failed", "error");
    await load(); showMsg("Duplicated as draft ✅", "success");
  };

  const onQuickStatus = async (row, newStatus) => {
    const { data, error } = await supabase.rpc("news_admin_upsert_post", {
      p_id: row.id,
      p_title: row.title,
      p_author_name: row.author_name || "",
      p_slug: row.slug,
      p_excerpt: row.excerpt || "",
      p_content: "",
      p_content_html: "",
      p_cover_image_url: row.cover_image_url || "",
      p_cover_image_path: row.cover_image_path || "",
      p_status: newStatus,
      p_meta_title: "",
      p_meta_description: "",
      p_canonical_url: "",
      p_tags: row.tags || [],
      p_scheduled_at: null,
    });
    if (!error && data?.ok) { await load(); showMsg(`Status → ${newStatus} ✅`, "success"); }
  };

  const onUploadCover = async (file) => {
    if (!file) return; setUploading(true);
    try {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr; if (!auth?.user) throw new Error("Not logged in");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
      const filePath = `covers/${auth.user.id}/${Date.now()}.${safeExt}`;
      const { error: upErr } = await supabase.storage.from("news").upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from("news").getPublicUrl(filePath);
      if (!pubData?.publicUrl) throw new Error("No public URL");
      setCoverPath(filePath); setCoverUrl(pubData.publicUrl);
      showMsg("Image uploaded ✅ Click Save to publish.", "success");
    } catch(e) { showMsg("Upload failed: " + (e?.message || String(e)), "error"); }
    finally { setUploading(false); }
  };

  const onPinComment   = async (id) => { const {error} = await supabase.rpc("news_pin_comment", {p_comment_id:id, p_post_id:editing?.id}); if(!error){ await loadComments(editing.id); showMsg("Pinned 📌","success"); } };
  const onUnpinComment = async ()   => { await supabase.from("news_comments").update({is_pinned:false}).eq("post_id", editing?.id); await loadComments(editing.id); showMsg("Unpinned","success"); };
  const onDeleteComment= async (id) => { if(!confirm("Delete comment?")) return; await supabase.from("news_comments").delete().eq("id",id); await loadComments(editing.id); showMsg("Comment deleted","success"); };

  const filteredPosts = useMemo(() => {
    let r = posts;
    if (listFilter !== "all") r = r.filter(p => p.status === listFilter);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      r = r.filter(p => p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q));
    }
    return r;
  }, [posts, listFilter, listSearch]);

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === "published").length,
    draft: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
  }), [posts]);

  const previewUrl = useMemo(() => { const s = slugify(slug); return s ? `/news/${s}` : ""; }, [slug]);
  const sc = statusColors[status] || statusColors.draft;
  const scheduledDisplay = (dt) => dt ? new Date(dt).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" }) : "";

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)}
      style={{ padding:"7px 16px", border:"none", borderRadius:8, background:activeTab===id?"linear-gradient(135deg,#d97706,#f59e0b)":"transparent", color:activeTab===id?"#fff":"#64748b", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", transition:"all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ padding:16, maxWidth:1400, margin:"0 auto" }}>
      <style>{css}</style>

      <div className="an-header">
        <div className="an-header-icon">📰</div>
        <div>
          <h1 className="an-title">News Management</h1>
          <div className="an-sub">Create · Schedule · Publish · Manage Comments</div>
        </div>
      </div>

      {msg && (
        <div className={`an-msg an-msg-${msgType}`}>
          <span>{msg}</span>
          <button className="an-msg-close" onClick={() => setMsg("")}>×</button>
        </div>
      )}

      <div className="an-mobile-tabs">
        <button className={`an-mtab${mobileView==="list"?" an-mtab-active":""}`} onClick={() => setMobileView("list")}>📋 Articles ({posts.length})</button>
        <button className={`an-mtab${mobileView==="editor"?" an-mtab-active":""}`} onClick={() => setMobileView("editor")}>✏️ Editor</button>
      </div>

      <div className="an-grid">
        {/* ── LEFT: LIST ── */}
        <div className={`an-card an-list-card${mobileView==="editor"?" an-hide":""}`}>
          <div className="an-stats-bar">
            {[["All", stats.total, "all", "#64748b"],
              ["Published", stats.published, "published", "#15803d"],
              ["Draft", stats.draft, "draft", "#475569"],
              ["Scheduled", stats.scheduled, "scheduled", "#b45309"]].map(([label, count, filter, color]) => (
              <button key={filter} onClick={() => setListFilter(filter)} className={`an-stat-btn${listFilter===filter?" an-stat-btn-active":""}`} style={{"--sc": color}}>
                <span className="an-stat-n" style={{color: listFilter===filter ? color : "#64748b"}}>{count}</span>
                <span className="an-stat-l">{label}</span>
              </button>
            ))}
          </div>

          <div className="an-list-search-wrap">
            <input className="an-list-search" placeholder="Search articles…" value={listSearch} onChange={e => setListSearch(e.target.value)}/>
            {listSearch ? <button className="an-list-search-clear" onClick={() => setListSearch("")}>✕</button> : <span className="an-list-search-icon">🔍</span>}
          </div>

          <div className="an-list-header">
            <span className="an-card-title">Articles <span className="an-count">{filteredPosts.length}</span></span>
            <div style={{display:"flex", gap:6}}>
              <button onClick={load} className="an-btn an-btn-ghost" title="Refresh">↻</button>
              <button onClick={() => { resetForm(); setMobileView("editor"); }} className="an-btn an-btn-primary">+ New</button>
            </div>
          </div>

          {loading ? (
            <div className="an-loading"><div className="an-spinner"/> Loading…</div>
          ) : filteredPosts.length === 0 ? (
            <div className="an-empty">{listSearch ? "No results found" : "No articles yet."}</div>
          ) : (
            <div className="an-list-scroll">
              {filteredPosts.map(p => {
                const psc = statusColors[p.status] || statusColors.draft;
                const pCat = (p.tags || []).find(t => CATEGORIES.map(c => c.value).filter(Boolean).includes(t));
                const pBreaking = (p.tags || []).includes("breaking");
                return (
                  <div key={p.id} className={`an-post-item${editing?.id===p.id?" an-post-item-active":""}`} onClick={() => onPickEdit(p)}>
                    {p.cover_image_url && <div className="an-post-thumb"><img src={p.cover_image_url} alt=""/></div>}
                    <div className="an-post-body">
                      <div className="an-post-top">
                        <div style={{display:"flex", flexDirection:"column", gap:3, flex:1, minWidth:0}}>
                          <span className="an-post-name">{p.title}</span>
                          <div style={{display:"flex", gap:5, flexWrap:"wrap", alignItems:"center"}}>
                            {pBreaking && <span style={{fontSize:"0.55rem", fontWeight:800, background:"rgba(239,68,68,0.9)", color:"#fff", padding:"1px 6px", borderRadius:4, letterSpacing:"0.08em", textTransform:"uppercase"}}>🔴 BREAKING</span>}
                            {pCat && <span style={{fontSize:"0.6rem", fontWeight:700, background:`rgba(${CAT_COLORS[pCat]?.slice(1).match(/../g)?.map(h=>parseInt(h,16)).join(",")},0.12)`, color:CAT_COLORS[pCat]||"#64748b", padding:"1px 7px", borderRadius:10, border:`1px solid ${CAT_COLORS[pCat]||"#64748b"}33`}}>{pCat}</span>}
                          </div>
                        </div>
                        <span className="an-status-pill" style={{background:psc.bg, color:psc.color, border:`1px solid ${psc.border}`}}>{p.status}</span>
                      </div>
                      <div className="an-post-slug">/news/{p.slug}</div>
                      {p.status==="scheduled" && p.scheduled_at && <div style={{fontSize:10, color:"#b45309", fontWeight:700, marginTop:3}}>🕐 {scheduledDisplay(p.scheduled_at)}</div>}
                      {(p.view_count||0)>0 && <div style={{fontSize:10, color:"#94a3b8", marginTop:2}}>👁 {p.view_count.toLocaleString()} views</div>}
                      {p.status==="draft" && (
                        <button onClick={e => { e.stopPropagation(); onQuickStatus(p, "published"); }}
                          style={{marginTop:6, padding:"3px 10px", border:"1px solid rgba(22,163,74,0.3)", borderRadius:20, background:"rgba(22,163,74,0.07)", color:"#15803d", fontSize:"0.62rem", fontWeight:800, cursor:"pointer"}}>
                          ⚡ Quick Publish
                        </button>
                      )}
                      {p.status==="published" && (
                        <button onClick={e => { e.stopPropagation(); onQuickStatus(p, "draft"); }}
                          style={{marginTop:6, padding:"3px 10px", border:"1px solid rgba(100,116,139,0.2)", borderRadius:20, background:"rgba(100,116,139,0.07)", color:"#475569", fontSize:"0.62rem", fontWeight:800, cursor:"pointer"}}>
                          ↩ Move to Draft
                        </button>
                      )}
                      {p.excerpt && <div className="an-post-excerpt">{p.excerpt}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: EDITOR ── */}
        <div className={`an-card an-editor-card${mobileView==="list"?" an-hide":""}`}>
          <div className="an-editor-header">
            <div>
              <div className="an-card-title">{editing ? "Edit Article" : "New Article"}</div>
              {editing && <div className="an-id-badge">ID: {editing.id}</div>}
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              {editing && (
                <>
                  <button className="an-btn an-btn-ghost" onClick={onDuplicate}>⧉ Duplicate</button>
                  <button className="an-btn" style={{background:"rgba(245,158,11,0.1)", color:"#b45309", border:"1px solid rgba(245,158,11,0.25)"}}
                    onClick={() => setShowComments(v => !v)}>
                    💬 Comments{comments.length>0 ? ` (${comments.length})` : ""}
                  </button>
                  <button className="an-btn an-btn-danger" onClick={() => onDelete(editing)}>🗑 Delete</button>
                </>
              )}
              <button className="an-btn an-btn-save" onClick={onSave} disabled={uploading}>
                💾 {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>

          {showComments && editing && (
            <div style={{background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, padding:16, marginBottom:16}}>
              <div style={{fontSize:"0.72rem", fontWeight:800, color:"#92400e", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12}}>📌 Comment Management</div>
              {commentsLoading ? (
                <div className="an-loading"><div className="an-spinner"/> Loading comments…</div>
              ) : comments.length === 0 ? (
                <div style={{color:"#94a3b8", fontSize:"0.83rem", textAlign:"center", padding:"14px 0"}}>No comments yet on this post.</div>
              ) : (
                <div style={{display:"flex", flexDirection:"column", gap:10, maxHeight:340, overflowY:"auto"}}>
                  {comments.map(c => (
                    <div key={c.id} style={{background:"#fff", border:`1px solid ${c.is_pinned?"rgba(245,158,11,0.4)":"rgba(217,119,6,0.1)"}`, borderRadius:12, padding:"12px 14px", position:"relative"}}>
                      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6}}>
                        <div style={{display:"flex", alignItems:"center", gap:7}}>
                          <div style={{width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:900, flexShrink:0}}>
                            {(c.author_name||"?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{fontWeight:800, fontSize:"0.82rem", color:"#0f172a"}}>{c.author_name}</span>
                            {c.is_pinned && <span style={{marginLeft:6, fontSize:"0.58rem", background:"rgba(245,158,11,0.2)", color:"#78350f", border:"1px solid rgba(245,158,11,0.3)", padding:"1px 7px", borderRadius:10, fontWeight:800}}>📌 Pinned</span>}
                            {c.is_flagged && <span style={{marginLeft:6, fontSize:"0.58rem", background:"rgba(239,68,68,0.1)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.2)", padding:"1px 7px", borderRadius:10, fontWeight:800}}>🚩 Flagged</span>}
                            {c.parent_id && <span style={{marginLeft:6, fontSize:"0.58rem", color:"#94a3b8", fontWeight:600}}>↩ Reply</span>}
                          </div>
                        </div>
                        <div style={{display:"flex", gap:5, flexShrink:0}}>
                          {!c.is_pinned
                            ? <button onClick={() => onPinComment(c.id)} style={{padding:"3px 10px", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, background:"rgba(245,158,11,0.07)", color:"#92400e", fontSize:"0.65rem", fontWeight:800, cursor:"pointer"}}>📌 Pin</button>
                            : <button onClick={onUnpinComment} style={{padding:"3px 10px", border:"1px solid rgba(100,116,139,0.2)", borderRadius:20, background:"rgba(100,116,139,0.07)", color:"#475569", fontSize:"0.65rem", fontWeight:800, cursor:"pointer"}}>Unpin</button>
                          }
                          <button onClick={() => onDeleteComment(c.id)} style={{padding:"3px 10px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:20, background:"rgba(239,68,68,0.07)", color:"#dc2626", fontSize:"0.65rem", fontWeight:800, cursor:"pointer"}}>🗑</button>
                        </div>
                      </div>
                      <p style={{margin:0, fontSize:"0.85rem", color:"#374151", lineHeight:1.6}}>{c.body}</p>
                      <div style={{marginTop:6, fontSize:"0.62rem", color:"#94a3b8", fontWeight:600}}>
                        {new Date(c.created_at).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" })}
                        {c.edited_at && " · (edited)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="an-form">
            <div className="an-section-title">📝 Basic Info</div>
            <div className="an-grid2">
              <div className="an-field">
                <label className="an-label">Title *</label>
                <input className="an-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter article title…"/>
              </div>
              <div className="an-field">
                <label className="an-label">Author Name <span className="an-label-opt">(optional)</span></label>
                <input className="an-input" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="e.g., Muhammad Zubair Afridi"/>
              </div>
              <div className="an-field">
                <label className="an-label">Slug (SEO URL)</label>
                <input className="an-input" value={slug} onChange={e => setSlug(e.target.value)}/>
                {previewUrl && <div className="an-hint">Preview: <strong>{previewUrl}</strong></div>}
              </div>
              <div className="an-field">
                <label className="an-label">Status</label>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <select className="an-input" value={status} onChange={e => setStatus(e.target.value)} style={{flex:1}}>
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="scheduled">🕐 Scheduled</option>
                  </select>
                  <span className="an-status-pill" style={{background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, flexShrink:0}}>{status}</span>
                </div>
                {status === "scheduled" && (
                  <div style={{marginTop:10}}>
                    <label className="an-label">📅 Publish Date & Time *</label>
                    <input type="datetime-local" className="an-input" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                      min={new Date(Date.now()+60000).toISOString().slice(0,16)}/>
                    {scheduledAt && <div className="an-hint" style={{color:"#b45309", fontWeight:700}}>🕐 Will publish: {scheduledDisplay(scheduledAt)}</div>}
                  </div>
                )}
              </div>
              <div className="an-field">
                <label className="an-label">Category</label>
                <select className="an-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="an-field" style={{justifyContent:"flex-end"}}>
                <label className="an-label">Breaking News</label>
                <label style={{display:"flex", alignItems:"center", gap:10, padding:"9px 12px", border:`1.5px solid ${isBreaking?"rgba(239,68,68,0.4)":"rgba(217,119,6,0.15)"}`, borderRadius:10, background:isBreaking?"rgba(239,68,68,0.05)":"#fff", cursor:"pointer", transition:"all 0.2s"}}>
                  <input type="checkbox" checked={isBreaking} onChange={e => setIsBreaking(e.target.checked)} style={{width:16, height:16, accentColor:"#ef4444", cursor:"pointer"}}/>
                  <span style={{fontSize:"0.85rem", fontWeight:700, color:isBreaking?"#dc2626":"#64748b"}}>
                    {isBreaking ? "🔴 Breaking News Active" : "Mark as Breaking News"}
                  </span>
                </label>
              </div>
              <div className="an-field an-col-2">
                <label className="an-label">Tags <span className="an-label-opt">(comma separated)</span></label>
                <input className="an-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="election, policy, update…"/>
                {tags && (
                  <div style={{display:"flex", flexWrap:"wrap", gap:5, marginTop:6}}>
                    {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} style={{background:"rgba(217,119,6,0.08)", color:"#92400e", border:"1px solid rgba(217,119,6,0.2)", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700}}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="an-field an-col-2">
                <label className="an-label">Excerpt <span className="an-label-opt">(short preview)</span></label>
                <textarea className="an-input an-textarea" value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Brief summary for listings…"/>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex", gap:4, margin:"20px 0 12px", padding:"4px", background:"#fef3c7", borderRadius:10, width:"fit-content"}}>
              <TabBtn id="content" label="📝 HTML"/>
              <TabBtn id="preview" label="👁 Preview"/>
              <TabBtn id="seo"     label="🔍 SEO"/>
              <TabBtn id="cover"   label="🖼 Cover"/>
            </div>

            {/* ── Content (HTML) Tab ── */}
            {activeTab === "content" && (
              <div>
                <div className="an-section-title">HTML Content *</div>
                <textarea
                  className="an-input an-textarea"
                  value={contentHtml}
                  onChange={e => setContentHtml(e.target.value)}
                  placeholder="<p>Write your content in HTML…</p>"
                  style={{ minHeight: 400, fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, resize: "vertical" }}
                />
              </div>
            )}

            {/* ── Preview Tab ── */}
            {activeTab === "preview" && (
              <div>
                <div className="an-section-title">👁 Preview (editable — changes sync back to HTML)</div>
                <HtmlPreview value={contentHtml} onChange={setContentHtml} />
              </div>
            )}

            {/* ── SEO Tab ── */}
            {activeTab === "seo" && (
              <div>
                <div className="an-section-title">🔍 SEO Settings</div>
                <div className="an-grid2">
                  <div className="an-field">
                    <label className="an-label">Meta Title <span className="an-label-opt">(optional)</span></label>
                    <input className="an-input" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Defaults to article title"/>
                    <div className="an-hint">{metaTitle.length}/60 chars recommended</div>
                  </div>
                  <div className="an-field">
                    <label className="an-label">Meta Description <span className="an-label-opt">(optional)</span></label>
                    <textarea className="an-input an-textarea" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="Defaults to excerpt (160 chars ideal)"/>
                    <div className="an-hint">{metaDescription.length}/160 chars recommended</div>
                  </div>
                  <div className="an-field an-col-2">
                    <label className="an-label">Canonical URL <span className="an-label-opt">(optional)</span></label>
                    <input className="an-input" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} placeholder="https://…"/>
                  </div>
                </div>
                <div style={{marginTop:16, padding:16, background:"#fff", border:"1px solid #e2e8f0", borderRadius:12}}>
                  <div style={{fontSize:11, fontWeight:700, color:"#64748b", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em"}}>Google Preview</div>
                  <div style={{fontSize:18, color:"#1a0dab", fontWeight:400, marginBottom:3, lineHeight:1.3}}>{metaTitle||title||"Article Title"}</div>
                  <div style={{fontSize:13, color:"#006621", marginBottom:4}}>aidla.online{previewUrl}</div>
                  <div style={{fontSize:13, color:"#545454", lineHeight:1.5}}>{metaDescription||excerpt||"Article description will appear here…"}</div>
                </div>
              </div>
            )}

            {/* ── Cover Tab ── */}
            {activeTab === "cover" && (
              <div>
                <div className="an-section-title">🖼 Cover Image</div>
                <div className="an-cover-zone">
                  {coverUrl ? (
                    <div className="an-cover-preview">
                      <img src={coverUrl} alt="cover"/>
                      <div className="an-cover-actions">
                        <label className="an-btn an-btn-ghost" style={{cursor:"pointer"}}>
                          ↑ Replace
                          <input type="file" accept="image/*" disabled={uploading} style={{display:"none"}} onChange={e => onUploadCover(e.target.files?.[0])}/>
                        </label>
                        <button className="an-btn an-btn-danger" onClick={() => { setCoverUrl(""); setCoverPath(""); }}>✕ Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`an-upload-area${uploading?" an-upload-area-busy":""}`}>
                      <div className="an-upload-icon">📷</div>
                      <div className="an-upload-text">{uploading?"Uploading…":"Click to upload cover image"}</div>
                      <div className="an-upload-hint">JPG, PNG, WebP · Recommended 1200×630px</div>
                      <input type="file" accept="image/*" disabled={uploading} style={{display:"none"}} onChange={e => onUploadCover(e.target.files?.[0])}/>
                    </label>
                  )}
                  {!coverUrl && (
                    <div style={{marginTop:12}}>
                      <label className="an-label">Or enter URL directly</label>
                      <input className="an-input" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://…"/>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
  .an-header{display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:8px 0 4px;animation:anIn 0.5s cubic-bezier(0.16,1,0.3,1)}
  @keyframes anIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
  .an-header-icon{font-size:clamp(24px,4vw,34px)}
  .an-title{font-size:clamp(1.2rem,3vw,1.7rem);font-weight:900;letter-spacing:-0.5px;margin:0;background:linear-gradient(135deg,#d97706,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .an-sub{color:#64748b;font-size:0.72rem;font-weight:600;letter-spacing:1.5px;text-transform:uppercase}
  .an-msg{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-radius:12px;font-size:0.85rem;font-weight:600;margin-bottom:12px;animation:anMsgIn 0.3s ease}
  @keyframes anMsgIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
  .an-msg-info{background:rgba(217,119,6,0.07);border:1px solid rgba(217,119,6,0.2);color:#d97706}
  .an-msg-success{background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.25);color:#15803d}
  .an-msg-error{background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#dc2626}
  .an-msg-close{background:none;border:none;font-size:18px;cursor:pointer;color:#64748b;padding:0 0 0 8px;font-weight:700}
  .an-mobile-tabs{display:none;gap:0;background:#f8fafc;border-radius:12px;padding:4px;margin-bottom:12px}
  .an-mtab{flex:1;padding:10px;border:none;border-radius:8px;background:transparent;font-size:0.82rem;font-weight:700;color:#64748b;cursor:pointer;transition:all 0.2s;touch-action:manipulation}
  .an-mtab-active{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;box-shadow:0 2px 8px rgba(217,119,6,0.2)}
  @media(max-width:768px){.an-mobile-tabs{display:flex}}
  .an-hide{display:none!important}
  @media(min-width:769px){.an-hide{display:block!important}}
  .an-grid{display:grid;grid-template-columns:300px 1fr;gap:14px;align-items:start}
  @media(max-width:860px){.an-grid{grid-template-columns:1fr}}
  .an-card{background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.9);border-radius:16px;padding:16px;box-shadow:0 4px 24px rgba(15,23,42,0.07);animation:anCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0}
  @keyframes anCardIn{to{opacity:1}}
  .an-list-card{position:sticky;top:12px}
  .an-editor-card{min-width:0}
  .an-stats-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
  .an-stat-btn{padding:7px 4px;border:1px solid rgba(217,119,6,0.12);border-radius:10px;background:#fff;cursor:pointer;text-align:center;transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:1px}
  .an-stat-btn-active{border-color:rgba(217,119,6,0.4);background:rgba(217,119,6,0.05)}
  .an-stat-n{font-size:1rem;font-weight:900;line-height:1}
  .an-stat-l{font-size:0.55rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em}
  .an-list-search-wrap{position:relative;margin-bottom:8px}
  .an-list-search{width:100%;padding:8px 32px 8px 12px;border:1px solid rgba(217,119,6,0.15);border-radius:10px;font-size:0.82rem;outline:none;font-family:inherit;color:#0f172a;background:#fff;box-sizing:border-box;transition:border-color 0.15s}
  .an-list-search:focus{border-color:rgba(217,119,6,0.4)}
  .an-list-search-icon{position:absolute;right:10px;top:50%;transform:translateY(-50%);opacity:0.4;font-size:0.85rem;pointer-events:none}
  .an-list-search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:rgba(100,116,139,0.15);border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:0.65rem;color:#475569;display:flex;align-items:center;justify-content:center}
  .an-card-title{font-weight:800;font-size:0.85rem;letter-spacing:0.5px;color:#334155;display:flex;align-items:center;gap:6px}
  .an-count{display:inline-flex;padding:1px 7px;border-radius:100px;font-size:10px;font-weight:700;background:rgba(217,119,6,0.1);color:#d97706;border:1px solid rgba(217,119,6,0.2)}
  .an-id-badge{font-size:10px;color:#64748b;margin-top:3px;font-family:monospace}
  .an-list-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .an-list-scroll{display:flex;flex-direction:column;gap:8px;max-height:62vh;overflow-y:auto;padding-right:2px}
  .an-list-scroll::-webkit-scrollbar{width:4px}
  .an-list-scroll::-webkit-scrollbar-thumb{background:rgba(217,119,6,0.3);border-radius:100px}
  .an-post-item{border-radius:12px;border:1px solid rgba(217,119,6,0.1);background:#fff;overflow:hidden;cursor:pointer;transition:all 0.15s;box-shadow:2px 2px 6px rgba(15,23,42,0.04)}
  .an-post-item:hover{border-color:rgba(217,119,6,0.3);transform:translateX(2px)}
  .an-post-item-active{background:linear-gradient(135deg,rgba(217,119,6,0.05),rgba(245,158,11,0.08))!important;border-color:rgba(217,119,6,0.35)!important;box-shadow:0 0 14px rgba(217,119,6,0.12)!important}
  .an-post-thumb{height:64px;overflow:hidden}
  .an-post-thumb img{width:100%;height:100%;object-fit:cover;display:block}
  .an-post-body{padding:10px 12px}
  .an-post-top{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:4px}
  .an-post-name{font-weight:800;font-size:0.84rem;color:#0f172a;word-break:break-word;line-height:1.3}
  .an-post-slug{font-size:10px;color:#64748b;font-weight:600;margin-bottom:3px;font-family:monospace}
  .an-post-excerpt{font-size:11px;color:#94a3b8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:4px}
  .an-status-pill{padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;white-space:nowrap}
  .an-editor-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:10px;flex-wrap:wrap}
  .an-section-title{font-size:0.72rem;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#64748b;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(217,119,6,0.08);display:flex;align-items:center;gap:8px}
  .an-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
  .an-col-2{grid-column:1 / -1}
  .an-field{display:flex;flex-direction:column}
  .an-label{font-size:11px;font-weight:700;color:#64748b;margin-bottom:5px;letter-spacing:0.3px}
  .an-label-opt{font-weight:400;opacity:0.7}
  .an-hint{font-size:11px;color:#64748b;margin-top:4px}
  .an-hint strong{color:#d97706}
  .an-input{padding:9px 12px;border-radius:10px;border:1px solid rgba(217,119,6,0.15);background:#fff;font-size:0.85rem;color:#0f172a;width:100%;box-sizing:border-box;transition:border-color 0.15s,box-shadow 0.15s;outline:none;font-family:inherit}
  .an-input:focus{border-color:rgba(217,119,6,0.45);box-shadow:0 0 0 3px rgba(217,119,6,0.08)}
  .an-textarea{resize:vertical;min-height:60px;line-height:1.6}
  .an-btn{padding:9px 16px;border-radius:10px;border:none;font-size:0.83rem;font-weight:700;cursor:pointer;transition:all 0.15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;touch-action:manipulation}
  .an-btn-primary{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;box-shadow:0 3px 0 #b45309}
  .an-btn-primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
  .an-btn-save{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 3px 0 #0f766e}
  .an-btn-save:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px)}
  .an-btn-save:disabled{background:#e2e8f0;color:#94a3b8;box-shadow:none;cursor:not-allowed}
  .an-btn-danger{background:rgba(239,68,68,0.08);color:#dc2626;border:1px solid rgba(239,68,68,0.2)}
  .an-btn-danger:hover{background:rgba(239,68,68,0.14)}
  .an-btn-ghost{background:rgba(100,116,139,0.08);color:#475569;border:1px solid rgba(100,116,139,0.2)}
  .an-btn-ghost:hover{background:rgba(100,116,139,0.14)}
  .an-cover-zone{margin-top:4px}
  .an-upload-area{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:32px 20px;border:2px dashed rgba(217,119,6,0.25);border-radius:14px;cursor:pointer;transition:all 0.2s;background:rgba(217,119,6,0.02);width:100%;box-sizing:border-box}
  .an-upload-area:hover{border-color:rgba(217,119,6,0.5);background:rgba(217,119,6,0.05)}
  .an-upload-area-busy{opacity:0.6;cursor:wait}
  .an-upload-icon{font-size:28px}
  .an-upload-text{font-weight:700;font-size:0.85rem;color:#334155}
  .an-upload-hint{font-size:11px;color:#94a3b8}
  .an-cover-preview{border-radius:14px;overflow:hidden;border:1px solid rgba(217,119,6,0.15)}
  .an-cover-preview img{width:100%;max-height:280px;object-fit:cover;display:block}
  .an-cover-actions{display:flex;gap:8px;padding:10px 12px;background:rgba(248,250,252,0.9)}
  .an-loading{display:flex;align-items:center;gap:8px;padding:20px;color:#64748b;font-size:0.85rem;font-weight:600;justify-content:center}
  .an-spinner{width:18px;height:18px;border:2px solid rgba(217,119,6,0.2);border-top-color:#d97706;border-radius:50%;animation:anSpin 0.7s linear infinite;flex-shrink:0}
  @keyframes anSpin{to{transform:rotate(360deg)}}
  .an-empty{color:#64748b;font-size:0.83rem;padding:20px 0;font-weight:600;text-align:center;line-height:1.8}
  .an-form{animation:anFadeIn 0.3s ease}
  @keyframes anFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
`;
