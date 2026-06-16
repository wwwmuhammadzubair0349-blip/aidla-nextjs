// app/admin/blogs/page.jsx
"use client";

import { useEffect, useMemo, useState, useRef, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
const SocialAutoPost = lazy(() => import("./SocialAutoPost.jsx"));

function slugify(str) {
  const latin = String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return latin || `post-${Date.now()}`;
}

const statusColors = {
  draft:     { bg: "rgba(100,116,139,0.1)", color: "#475569", border: "rgba(100,116,139,0.2)" },
  published: { bg: "rgba(22,163,74,0.1)",   color: "#15803d", border: "rgba(22,163,74,0.25)" },
  scheduled: { bg: "rgba(245,158,11,0.1)",  color: "#b45309", border: "rgba(245,158,11,0.3)" },
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
      style={{ minHeight: 400, maxHeight: 600, padding: "18px 20px", border: "1px solid rgba(26,58,143,0.2)", borderRadius: 12, outline: "none", fontSize: 15, lineHeight: 1.8, color: "#1e293b", fontFamily: "'DM Sans', sans-serif", overflowY: "auto" }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN ADMIN BLOGS COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Blogs() {
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState("");
  const [msgType, setMsgType]           = useState("info");
  const [posts, setPosts]               = useState([]);
  const [editing, setEditing]           = useState(null);
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
  const [suggestingImage, setSuggestingImage] = useState(false);
  const [suggestedImages, setSuggestedImages] = useState([]);
  const [tags, setTags]                 = useState("");
  const [activeTab, setActiveTab]       = useState("content");

  const [comments, setComments]         = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const showMsg = (text, type = "info") => { setMsg(text); setMsgType(type); };

  const resetForm = () => {
    setEditing(null);
    setTitle(""); setAuthorName(""); setSlug(""); setExcerpt(""); setContentHtml("");
    setStatus("draft"); setScheduledAt("");
    setMetaTitle(""); setMetaDescription("");
    setCanonicalUrl(""); setCoverUrl(""); setCoverPath(""); setTags("");
    setComments([]); setShowComments(false);
    setSuggestedImages([]);
    showMsg("", "info");
  };

  const load = async () => {
    setLoading(true); showMsg("", "info");
    const { data, error } = await supabase
      .from("blogs_posts")
      .select("id,title,author_name,slug,status,excerpt,cover_image_url,published_at,scheduled_at,updated_at,created_at,deleted_at,view_count")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) { showMsg(error.message, "error"); setPosts([]); setLoading(false); return; }
    setPosts(data || []); setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (editing) return; setSlug(slugify(title)); }, [title, editing]);

  const loadComments = async (postId) => {
    setCommentsLoading(true);
    const { data } = await supabase.from("blogs_comments")
      .select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments(data || []);
    setCommentsLoading(false);
  };

  const onPickEdit = async (row) => {
    showMsg("", "info");
    const { data, error } = await supabase.from("blogs_posts").select("*").eq("id", row.id).maybeSingle();
    if (error) return showMsg(error.message, "error");
    if (!data)  return showMsg("Blog not found", "error");
    setEditing(data);
    setTitle(data.title || ""); setAuthorName(data.author_name || ""); setSlug(data.slug || ""); setExcerpt(data.excerpt || "");
    setContentHtml(data.content_html || data.content || "");
    setStatus(data.status || "draft");
    if (data.scheduled_at) {
      const dt = new Date(data.scheduled_at);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset()*60000).toISOString().slice(0,16);
      setScheduledAt(local);
    } else {
      setScheduledAt("");
    }
    setMetaTitle(data.meta_title || ""); setMetaDescription(data.meta_description || "");
    setCanonicalUrl(data.canonical_url || ""); setCoverUrl(data.cover_image_url || "");
    setCoverPath(data.cover_image_path || "");
    setTags((data.tags || []).join(", "));
    setActiveTab("content"); setShowComments(false);
    await loadComments(data.id);
  };

  const onDelete = async (row) => {
    if (!confirm("Delete this blog post?")) return;
    showMsg("", "info");
    const { data, error } = await supabase.rpc("blogs_admin_delete_post", { p_id: row.id });
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Delete failed", "error");
    resetForm(); await load(); showMsg("Deleted ✅", "success");
  };

  const onDuplicate = async () => {
    if (!editing) return;
    showMsg("", "info");
    const newSlug = `${slug}-copy-${Date.now()}`;
    const payload = {
      p_id: null,
      p_title: `${title} (Copy)`,
      p_author_name: authorName.trim(),
      p_slug: newSlug,
      p_excerpt: excerpt.trim(),
      p_content: "",
      p_content_html: contentHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: "draft",
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: "",
      p_tags: (typeof tags === "string" ? tags : (tags || []).join(", ")).split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      p_scheduled_at: null,
    };
    const { data, error } = await supabase.rpc("blogs_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Duplicate failed", "error");
    await load(); showMsg("Post duplicated as draft ✅", "success");
  };

  const onSave = async () => {
    showMsg("", "info");
    if (!title.trim())       return showMsg("Title required", "error");
    if (!slug.trim())        return showMsg("Slug required", "error");
    if (!contentHtml.trim()) return showMsg("Content required", "error");
    if (status === "scheduled" && !scheduledAt) return showMsg("Please set a scheduled date & time", "error");

    const finalHtml = contentHtml;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = finalHtml;
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
      p_content_html: finalHtml,
      p_cover_image_url: coverUrl || "",
      p_cover_image_path: coverPath || "",
      p_status: status,
      p_meta_title: metaTitle.trim(),
      p_meta_description: metaDescription.trim(),
      p_canonical_url: canonicalUrl.trim(),
      p_tags: (typeof tags === "string" ? tags : (tags || []).join(", ")).split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      p_scheduled_at: scheduledIso,
    };
    const { data, error } = await supabase.rpc("blogs_admin_upsert_post", payload);
    if (error) return showMsg(error.message, "error");
    if (!data?.ok) return showMsg(data?.error || "Save failed", "error");
    await load(); showMsg(editing ? "Updated ✅" : "Created ✅", "success"); resetForm();
  };

  async function compressImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob), "image/webp", 0.80);
      };
      img.src = url;
    });
  }

  const suggestCoverImage = async (forceRefresh = false) => {
    if (!title.trim()) return showMsg("Enter a title first to get image suggestions", "error");
    setSuggestingImage(true);
    setSuggestedImages([]);
    try {
      const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-blog`;
      const CRON_SECRET  = process.env.NEXT_PUBLIC_AUTO_BLOG_SECRET || "aidla_auto_blog_2025";
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: CRON_SECRET, mode: "image_suggest", title, _t: Date.now() })
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      setSuggestedImages(data.images || []);
      if (!data.images?.length) showMsg("No images found, try a different title", "info");
    } catch (e) {
      showMsg(`Error: ${e.message || "Could not fetch suggestions"}`, "error");
    }
    setSuggestingImage(false);
  };

  const onUploadCover = async (file) => {
    showMsg("", "info"); if (!file) return; setUploading(true);
    try {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr; if (!auth?.user) throw new Error("Not logged in");
      const uid = auth.user.id;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = ["jpg","jpeg","png","webp"].includes(ext) ? ext : "jpg";
      const filePath = `covers/${uid}/${Date.now()}.${safeExt}`;
      const compressed = await compressImage(file);
      const { error: upErr } = await supabase.storage.from("blogs").upload(filePath, compressed, { upsert: true });
      if (upErr) throw upErr;
      const { data: pubData } = supabase.storage.from("blogs").getPublicUrl(filePath);
      if (!pubData?.publicUrl) throw new Error("Public URL not generated");
      setCoverPath(filePath); setCoverUrl(pubData.publicUrl);
      showMsg("Image uploaded ✅  Click Save to publish.", "success");
    } catch(e) { showMsg("Upload failed: " + (e?.message || String(e)), "error"); }
    finally { setUploading(false); }
  };

  const onPinComment = async (commentId) => {
    const { error } = await supabase.rpc("blogs_pin_comment", { p_comment_id: commentId, p_post_id: editing?.id });
    if (error) { showMsg(error.message, "error"); return; }
    await loadComments(editing.id);
    showMsg("Comment pinned 📌", "success");
  };
  const onUnpinComment = async () => {
    const { error } = await supabase.from("blogs_comments")
      .update({ is_pinned: false }).eq("post_id", editing?.id);
    if (!error) { await loadComments(editing.id); showMsg("Comment unpinned", "success"); }
  };
  const onDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("blogs_comments").delete().eq("id", commentId);
    if (!error) { await loadComments(editing.id); showMsg("Comment deleted", "success"); }
  };

  const previewUrl = useMemo(() => { const s = slugify(slug); return s ? `/blogs/${s}` : ""; }, [slug]);
  const sc = statusColors[status] || statusColors.draft;

  const scheduledDisplay = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" });
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)}
      style={{ padding:"7px 16px", border:"none", borderRadius:8, background:activeTab===id?"linear-gradient(135deg,#1a3a8f,#3b82f6)":"transparent", color:activeTab===id?"#fff":"#64748b", fontWeight:700, fontSize:"0.78rem", cursor:"pointer", transition:"all 0.2s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ padding:16, maxWidth:1400, margin:"0 auto" }}>
      <style>{CSS}</style>

      <div className="ab-header">
        <div className="ab-header-icon">✍️</div>
        <div>
          <h1 className="ab-title">Blog Management</h1>
          <div className="ab-sub">Create · Schedule · Publish · Manage Comments</div>
        </div>
      </div>

      {msg && (
        <div className={`ab-msg ab-msg-${msgType}`}>
          <span>{msg}</span>
          <button className="ab-msg-close" onClick={() => setMsg("")}>×</button>
        </div>
      )}

      <div className="ab-grid">
        {/* ── LEFT: POST LIST ── */}
        <div className="ab-card ab-list-card">
          <div className="ab-list-header">
            <span className="ab-card-title">All Posts <span className="ab-count">{posts.length}</span></span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={load} className="ab-btn ab-btn-ghost" title="Refresh">↻</button>
              <button onClick={resetForm} className="ab-btn ab-btn-primary">+ New</button>
            </div>
          </div>

          {loading ? (
            <div className="ab-loading"><div className="ab-spinner"/> Loading…</div>
          ) : posts.length === 0 ? (
            <div className="ab-empty">No blog posts yet.<br/>Create one!</div>
          ) : (
            <div className="ab-list-scroll">
              {posts.map(p => {
                const psc = statusColors[p.status] || statusColors.draft;
                return (
                  <div key={p.id} className={`ab-post-item${editing?.id===p.id?" ab-post-item-active":""}`} onClick={() => onPickEdit(p)}>
                    {p.cover_image_url && <div className="ab-post-thumb"><img src={p.cover_image_url} alt=""/></div>}
                    <div className="ab-post-body">
                      <div className="ab-post-top">
                        <span className="ab-post-name">{p.title}</span>
                        <span className="ab-status-pill" style={{ background:psc.bg, color:psc.color, border:`1px solid ${psc.border}` }}>{p.status}</span>
                      </div>
                      <div className="ab-post-slug">/blogs/{p.slug}</div>
                      {p.status==="scheduled" && p.scheduled_at && (
                        <div style={{ fontSize:10, color:"#b45309", fontWeight:700, marginTop:3 }}>
                          🕐 {scheduledDisplay(p.scheduled_at)}
                        </div>
                      )}
                      {p.view_count > 0 && (
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>👁 {p.view_count.toLocaleString()} views</div>
                      )}
                      {p.excerpt && <div className="ab-post-excerpt">{p.excerpt}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: EDITOR ── */}
        <div className="ab-card ab-editor-card">
          <div className="ab-editor-header">
            <div>
              <div className="ab-card-title">{editing ? "Edit Post" : "New Post"}</div>
              {editing && <div className="ab-id-badge">ID: {editing.id}</div>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {editing && (
                <>
                  <button className="ab-btn ab-btn-ghost" onClick={onDuplicate} title="Duplicate as draft">⧉ Duplicate</button>
                  <button className="ab-btn" style={{ background:"rgba(245,158,11,0.1)", color:"#b45309", border:"1px solid rgba(245,158,11,0.25)" }}
                    onClick={() => setShowComments(v => !v)}>
                    💬 Comments {comments.length > 0 ? `(${comments.length})` : ""}
                  </button>
                  <button className="ab-btn ab-btn-danger" onClick={() => onDelete(editing)}>🗑 Delete</button>
                </>
              )}
              <button className="ab-btn ab-btn-save" onClick={onSave} disabled={uploading}>
                💾 {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>

          {/* ── COMMENTS PANEL ── */}
          {showComments && editing && (
            <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#92400e", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:12 }}>
                📌 Comment Management
              </div>
              {commentsLoading ? (
                <div className="ab-loading"><div className="ab-spinner"/> Loading comments…</div>
              ) : comments.length === 0 ? (
                <div style={{ color:"#94a3b8", fontSize:"0.83rem", textAlign:"center", padding:"14px 0" }}>No comments yet on this post.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:340, overflowY:"auto" }}>
                  {comments.map(c => (
                    <div key={c.id} style={{ background:"#fff", border:`1px solid ${c.is_pinned?"rgba(245,158,11,0.4)":"rgba(26,58,143,0.08)"}`, borderRadius:12, padding:"12px 14px", position:"relative" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:900, flexShrink:0 }}>
                            {(c.author_name||"?")[0].toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight:800, fontSize:"0.82rem", color:"#0f172a" }}>{c.author_name}</span>
                            {c.is_pinned && <span style={{ marginLeft:6, fontSize:"0.58rem", background:"rgba(245,158,11,0.2)", color:"#78350f", border:"1px solid rgba(245,158,11,0.3)", padding:"1px 7px", borderRadius:10, fontWeight:800 }}>📌 Pinned</span>}
                            {c.is_flagged && <span style={{ marginLeft:6, fontSize:"0.58rem", background:"rgba(239,68,68,0.1)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.2)", padding:"1px 7px", borderRadius:10, fontWeight:800 }}>🚩 Flagged</span>}
                            {c.parent_id && <span style={{ marginLeft:6, fontSize:"0.58rem", color:"#94a3b8", fontWeight:600 }}>↩ Reply</span>}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                          {!c.is_pinned
                            ? <button onClick={() => onPinComment(c.id)} style={{ padding:"3px 10px", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, background:"rgba(245,158,11,0.07)", color:"#92400e", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>📌 Pin</button>
                            : <button onClick={onUnpinComment} style={{ padding:"3px 10px", border:"1px solid rgba(100,116,139,0.2)", borderRadius:20, background:"rgba(100,116,139,0.07)", color:"#475569", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>Unpin</button>
                          }
                          <button onClick={() => onDeleteComment(c.id)} style={{ padding:"3px 10px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:20, background:"rgba(239,68,68,0.07)", color:"#dc2626", fontSize:"0.65rem", fontWeight:800, cursor:"pointer" }}>🗑</button>
                        </div>
                      </div>
                      <p style={{ margin:0, fontSize:"0.85rem", color:"#374151", lineHeight:1.6 }}>{c.body}</p>
                      <div style={{ marginTop:6, fontSize:"0.62rem", color:"#94a3b8", fontWeight:600 }}>
                        {new Date(c.created_at).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"numeric", minute:"2-digit" })}
                        {c.edited_at && " · (edited)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── FORM ── */}
          <div className="ab-form">
            <div className="ab-section-title">📝 Basic Info</div>
            <div className="ab-grid2">
              <div className="ab-field">
                <label className="ab-label">Title *</label>
                <input className="ab-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter post title…"/>
              </div>
              <div className="ab-field">
                <label className="ab-label">Author Name <span className="ab-label-opt">(optional)</span></label>
                <input className="ab-input" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="e.g., Muhammad Zubair Afridi"/>
              </div>
              <div className="ab-field">
                <label className="ab-label">Slug (SEO URL)</label>
                <input className="ab-input" value={slug} onChange={e => setSlug(e.target.value)}/>
                {previewUrl && <div className="ab-hint">Preview: <strong>{previewUrl}</strong></div>}
              </div>

              <div className="ab-field">
                <label className="ab-label">Status</label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <select className="ab-input" value={status} onChange={e => setStatus(e.target.value)} style={{ flex:1 }}>
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="scheduled">🕐 Scheduled</option>
                  </select>
                  <span className="ab-status-pill" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`, flexShrink:0 }}>{status}</span>
                </div>
                {status === "scheduled" && (
                  <div style={{ marginTop:10 }}>
                    <label className="ab-label">📅 Publish Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="ab-input"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      min={new Date(Date.now()+60000).toISOString().slice(0,16)}
                    />
                    {scheduledAt && (
                      <div className="ab-hint" style={{ color:"#b45309", fontWeight:700 }}>
                        🕐 Will auto-publish: {scheduledDisplay(scheduledAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="ab-field ab-col-2">
                <label className="ab-label">Tags <span className="ab-label-opt">(comma separated)</span></label>
                <input className="ab-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="urdu, education, technology…"/>
                {tags && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
                    {tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} style={{ background:"rgba(26,58,143,0.08)", color:"#1a3a8f", border:"1px solid rgba(26,58,143,0.15)", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700 }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ab-field ab-col-2">
                <label className="ab-label">Excerpt <span className="ab-label-opt">(short preview)</span></label>
                <textarea className="ab-input ab-textarea" value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Brief summary shown in listings…"/>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, margin:"20px 0 12px", padding:"4px", background:"#f1f5f9", borderRadius:10, width:"fit-content" }}>
              <TabBtn id="content" label="📝 HTML"/>
              <TabBtn id="preview" label="👁 Preview"/>
              <TabBtn id="seo"     label="🔍 SEO"/>
              <TabBtn id="cover"   label="🖼 Cover"/>
              <TabBtn id="social"  label="📣 Social"/>
            </div>

            {/* ── Content (HTML) Tab ── */}
            {activeTab === "content" && (
              <div>
                <div className="ab-section-title">HTML Content *</div>
                <textarea
                  className="ab-input ab-textarea"
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
                <div className="ab-section-title">👁 Preview (editable — changes sync back to HTML)</div>
                <HtmlPreview value={contentHtml} onChange={setContentHtml} />
              </div>
            )}

            {/* ── SEO Tab ── */}
            {activeTab === "seo" && (
              <div>
                <div className="ab-section-title">🔍 SEO Settings</div>
                <div className="ab-grid2">
                  <div className="ab-field">
                    <label className="ab-label">Meta Title <span className="ab-label-opt">(optional)</span></label>
                    <input className="ab-input" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Defaults to post title"/>
                    <div className="ab-hint">{metaTitle.length}/60 chars recommended</div>
                  </div>
                  <div className="ab-field">
                    <label className="ab-label">Meta Description <span className="ab-label-opt">(optional)</span></label>
                    <textarea className="ab-input ab-textarea" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="Defaults to excerpt (160 chars ideal)"/>
                    <div className="ab-hint">{metaDescription.length}/160 chars recommended</div>
                  </div>
                  <div className="ab-field ab-col-2">
                    <label className="ab-label">Canonical URL <span className="ab-label-opt">(optional)</span></label>
                    <input className="ab-input" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} placeholder="https://…"/>
                  </div>
                </div>
                <div style={{ marginTop:16, padding:16, background:"#fff", border:"1px solid #e2e8f0", borderRadius:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Google Preview</div>
                  <div style={{ fontSize:18, color:"#1a0dab", fontWeight:400, marginBottom:3, lineHeight:1.3 }}>{metaTitle||title||"Page Title"}</div>
                  <div style={{ fontSize:13, color:"#006621", marginBottom:4 }}>aidla.online{previewUrl}</div>
                  <div style={{ fontSize:13, color:"#545454", lineHeight:1.5 }}>{metaDescription||excerpt||"Page description will appear here…"}</div>
                </div>
              </div>
            )}

            {/* ── Cover Tab ── */}
            {activeTab === "cover" && (
              <div>
                <div className="ab-section-title">🖼 Cover Image</div>
                <div className="ab-cover-zone">
                  {coverUrl ? (
                    <div className="ab-cover-preview">
                      <img src={coverUrl} alt="cover"/>
                      <div className="ab-cover-actions">
                        <label className="ab-btn ab-btn-ghost" style={{ cursor:"pointer" }}>
                          ↑ Replace
                          <input type="file" accept="image/*" disabled={uploading} style={{ display:"none" }} onChange={e => onUploadCover(e.target.files?.[0])}/>
                        </label>
                        <button className="ab-btn ab-btn-danger" onClick={() => { setCoverUrl(""); setCoverPath(""); }}>✕ Remove</button>
                      </div>
                    </div>
                  ) : (
                    <label className={`ab-upload-area${uploading?" ab-upload-area-busy":""}`}>
                      <div className="ab-upload-icon">📷</div>
                      <div className="ab-upload-text">{uploading?"Uploading…":"Click to upload cover image"}</div>
                      <div className="ab-upload-hint">JPG, PNG, WebP · Recommended 1200×630px</div>
                      <input type="file" accept="image/*" disabled={uploading} style={{ display:"none" }} onChange={e => onUploadCover(e.target.files?.[0])}/>
                    </label>
                  )}
                  {!coverUrl && (
                    <div style={{ marginTop:12 }}>
                      <label className="ab-label">Or enter image URL directly</label>
                      <input
                        className="ab-input"
                        value={coverUrl}
                        onChange={e => setCoverUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/…"
                      />
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <button
                          type="button"
                          onClick={() => suggestCoverImage()}
                          disabled={suggestingImage}
                          style={{ padding:"8px 16px", background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:"0.8rem", cursor:suggestingImage?"not-allowed":"pointer", opacity:suggestingImage?0.7:1, flex:1 }}
                        >
                          {suggestingImage ? "✨ Finding images…" : "✨ AI Suggest Images"}
                        </button>
                        <button
                          type="button"
                          onClick={() => suggestCoverImage(true)}
                          disabled={suggestingImage}
                          style={{ padding:"8px 16px", background:"#f1f5f9", border:"1px solid #cbd5e1", borderRadius:8, fontWeight:700, fontSize:"0.8rem", cursor:suggestingImage?"not-allowed":"pointer", color:"#334155" }}
                        >
                          🔄 Refresh
                        </button>
                      </div>
                      {suggestedImages.length > 0 && (
                        <div style={{ marginTop:14 }}>
                          <div style={{ fontSize:"0.72rem", fontWeight:800, color:"#7c3aed", marginBottom:8, textTransform:"uppercase", letterSpacing:"1px" }}>
                            Click to use →
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                            {suggestedImages.map((img, i) => (
                              <div
                                key={i}
                                onClick={() => { setCoverUrl(img.url); setSuggestedImages([]); showMsg("Image selected! Click Save to publish.", "success"); }}
                                style={{ cursor:"pointer", borderRadius:10, overflow:"hidden", border:"2px solid transparent", transition:"border 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.border="2px solid #7c3aed"}
                                onMouseLeave={e => e.currentTarget.style.border="2px solid transparent"}
                              >
                                <img src={img.url} alt={img.description} style={{ width:"100%", height:80, objectFit:"cover", display:"block" }}/>
                                <div style={{ padding:"4px 6px", background:"#f8faff", fontSize:"0.6rem", color:"#475569", fontWeight:600 }}>
                                  📷 {img.photographer}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Social Tab ── */}
            {activeTab === "social" && (
              <div>
                <Suspense fallback={<div style={{color:"#94a3b8",padding:20}}>Loading…</div>}>
                  <SocialAutoPost post={{
                    id:              editing?.id,
                    title:           title,
                    slug:            slug,
                    excerpt:         excerpt,
                    cover_image_url: coverUrl,
                    tags:            tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
                    status:          status,
                  }}/>
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800;900&display=swap');

.ab-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 8px 0 4px;
  animation: abIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
}
@keyframes abIn {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: none; }
}

.ab-header-icon { font-size: clamp(24px,4vw,34px); }
.ab-title {
  font-size: clamp(1.2rem,3vw,1.7rem);
  font-weight: 900;
  letter-spacing: -0.5px;
  margin: 0;
  background: linear-gradient(135deg,#0b1437,#1a3a8f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.ab-sub {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.ab-msg {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  animation: abMsgIn 0.3s ease;
}
@keyframes abMsgIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
.ab-msg-info    { background: rgba(26,58,143,0.07); border: 1px solid rgba(26,58,143,0.2); color: #1a3a8f; }
.ab-msg-success { background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.25); color: #15803d; }
.ab-msg-error   { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); color: #dc2626; }
.ab-msg-close   { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; padding: 0 0 0 8px; font-weight: 700; line-height: 1; }

.ab-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width:860px) { .ab-grid { grid-template-columns: 1fr; } }

.ab-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(11,20,55,0.08);
  animation: abCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
  opacity: 0;
}
@keyframes abCardIn { to { opacity: 1; } }
.ab-list-card   { position: sticky; top: 12px; }
.ab-editor-card { min-width: 0; }

.ab-card-title { font-weight: 800; font-size: 0.95rem; letter-spacing: 0.5px; color: #334155; display: flex; align-items: center; gap: 8px; }
.ab-count { display: inline-flex; padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 800; background: rgba(26,58,143,0.1); color: #1a3a8f; border: 1px solid rgba(26,58,143,0.2); }
.ab-id-badge { font-size: 10px; color: #64748b; margin-top: 3px; font-family: monospace; }

.ab-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.ab-list-scroll { display: flex; flex-direction: column; gap: 10px; max-height: 74vh; overflow-y: auto; padding-right: 4px; }
.ab-list-scroll::-webkit-scrollbar { width: 4px; }
.ab-list-scroll::-webkit-scrollbar-thumb { background: rgba(26,58,143,0.2); border-radius: 100px; }

.ab-post-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; border: 1px solid rgba(26,58,143,0.1); background: #fff; cursor: pointer; transition: all 0.15s; box-shadow: 2px 2px 6px rgba(15,23,42,0.04); }
.ab-post-item:hover { border-color: rgba(26,58,143,0.3); transform: translateX(4px); }
.ab-post-item-active { background: linear-gradient(135deg,rgba(26,58,143,0.05),rgba(59,130,246,0.08)) !important; border-color: rgba(26,58,143,0.35) !important; box-shadow: 0 0 14px rgba(26,58,143,0.12) !important; }

.ab-post-thumb { width: 64px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 1px solid rgba(0,0,0,0.05); }
.ab-post-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ab-post-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.ab-post-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; margin-bottom: 2px; }
.ab-post-name { font-weight: 800; font-size: 0.85rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.ab-post-slug { font-size: 10px; color: #64748b; font-weight: 600; margin-bottom: 4px; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ab-post-excerpt { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ab-status-pill { padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }

.ab-editor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 10px; flex-wrap: wrap; }
.ab-section-title { font-size: 0.72rem; font-weight: 800; letter-spacing: 1.8px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(26,58,143,0.07); display: flex; align-items: center; gap: 8px; }

.ab-grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.ab-col-2 { grid-column: 1 / -1; }
.ab-field { display: flex; flex-direction: column; }
.ab-label { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px; letter-spacing: 0.3px; }
.ab-label-opt { font-weight: 400; opacity: 0.7; }
.ab-hint { font-size: 11px; color: #64748b; margin-top: 4px; }
.ab-hint strong { color: #1a3a8f; }
.ab-input { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(26,58,143,0.15); background: #f8fafc; font-size: 0.88rem; color: #0f172a; width: 100%; box-sizing: border-box; transition: all 0.2s; outline: none; font-family: inherit; }
.ab-input:focus { background: #fff; border-color: rgba(26,58,143,0.45); box-shadow: 0 0 0 4px rgba(26,58,143,0.08); }
.ab-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

.ab-btn { padding: 10px 18px; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
.ab-btn-primary { background: linear-gradient(135deg,#1a3a8f,#3b82f6); color: #fff; box-shadow: 0 3px 0 #1e3a8a; }
.ab-btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 0 #1e3a8a; }
.ab-btn-primary:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 1px 0 #1e3a8a; }
.ab-btn-save { background: linear-gradient(135deg,#0f766e,#14b8a6); color: #fff; box-shadow: 0 3px 0 #0f766e; }
.ab-btn-save:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 0 #0f766e; }
.ab-btn-save:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 1px 0 #0f766e; }
.ab-btn-save:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
.ab-btn-danger { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }
.ab-btn-danger:hover { background: rgba(239,68,68,0.14); }
.ab-btn-ghost { background: rgba(100,116,139,0.08); color: #475569; border: 1px solid rgba(100,116,139,0.2); }
.ab-btn-ghost:hover { background: rgba(100,116,139,0.14); }

.ab-cover-zone { margin-top: 4px; }
.ab-upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px 20px; border: 2px dashed rgba(26,58,143,0.25); border-radius: 14px; cursor: pointer; transition: all 0.2s; background: rgba(26,58,143,0.02); width: 100%; box-sizing: border-box; }
.ab-upload-area:hover { border-color: rgba(26,58,143,0.5); background: rgba(26,58,143,0.05); }
.ab-upload-area-busy { opacity: 0.6; cursor: wait; }
.ab-upload-icon { font-size: 32px; }
.ab-upload-text { font-weight: 700; font-size: 0.9rem; color: #334155; }
.ab-upload-hint { font-size: 11px; color: #94a3b8; }
.ab-cover-preview { border-radius: 14px; overflow: hidden; border: 1px solid rgba(26,58,143,0.15); }
.ab-cover-preview img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
.ab-cover-actions { display: flex; gap: 8px; padding: 10px 12px; background: rgba(248,250,252,0.9); }

.ab-loading { display: flex; align-items: center; gap: 8px; padding: 20px; color: #64748b; font-size: 0.85rem; font-weight: 600; justify-content: center; }
.ab-spinner { width: 20px; height: 20px; border: 2.5px solid rgba(26,58,143,0.2); border-top-color: #1a3a8f; border-radius: 50%; animation: abSpin 0.7s linear infinite; flex-shrink: 0; }
@keyframes abSpin { to { transform: rotate(360deg); } }
.ab-empty { color: #64748b; font-size: 0.85rem; padding: 30px 0; font-weight: 600; text-align: center; line-height: 1.8; }

.ab-form { animation: abFadeIn 0.3s ease; }
@keyframes abFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
`;
