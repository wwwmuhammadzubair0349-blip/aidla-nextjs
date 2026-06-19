// app/admin/feed/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "zkafridi317@gmail.com";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
}

function Avatar({ profile, size = 34 }) {
  const initials = profile?.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  if (profile?.avatar_url) return (
    <img src={profile.avatar_url} alt={profile.full_name}
      style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
  );
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,#1e3a8a,#3b82f6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#fff", fontWeight:800, fontSize:size*0.35,
    }}>{initials}</div>
  );
}

function BlueTick() {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:15, height:15, borderRadius:"50%",
      background:"#1d9bf0", marginLeft:4, flexShrink:0,
    }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    </span>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────
function Tab({ label, count, active, onClick }) {
  return (
    <button className={`fa-tab ${active ? "fa-tab-active" : ""}`} onClick={onClick}>
      {label}
      {count > 0 && <span className="fa-tab-badge">{count}</span>}
    </button>
  );
}

// ── Post row ───────────────────────────────────────────────────────────────
function AdminPostRow({ post, onDelete, onPin, onUnpin, onExpand, expanded, comments, onDeleteComment, loadComments }) {
  const isAdminPost = post.profiles?.email === ADMIN_EMAIL;
  const displayName = isAdminPost ? "AIDLA_Official" : (post.profiles?.full_name || "Unknown");

  return (
    <div className={`fa-row ${post.is_pinned ? "fa-row-pinned" : ""}`}>
      <div className="fa-row-header">
        <Avatar profile={post.profiles} size={36} />
        <div className="fa-row-meta">
          <div className="fa-row-name">
            {displayName}{isAdminPost && <BlueTick />}
            {post.is_pinned && <span className="fa-pinned-label">📌 Pinned</span>}
          </div>
          <div className="fa-row-time">{timeAgo(post.created_at)} · {post.like_count} likes · {post.comment_count} comments · {post.repost_count} reposts</div>
        </div>
        <div className="fa-row-actions">
          {post.is_pinned
            ? <button className="fa-btn fa-btn-warn" onClick={() => onUnpin(post.id)}>📌 Unpin</button>
            : <button className="fa-btn fa-btn-blue" onClick={() => onPin(post.id)}>📌 Pin</button>
          }
          <button className="fa-btn fa-btn-ghost" onClick={() => { onExpand(post.id); if(!expanded) loadComments(post.id); }}>
            {expanded ? "▲ Hide" : "▼ Comments"}
          </button>
          <button className="fa-btn fa-btn-red" onClick={() => onDelete(post.id)}>🗑 Delete</button>
        </div>
      </div>
      <div className="fa-post-content">{post.content}</div>
      {post.location && <div className="fa-post-tag">📍 {post.location}</div>}
      {post.feeling  && <div className="fa-post-tag">{post.feeling}</div>}

      {expanded && (
        <div className="fa-comments-list">
          <div className="fa-comments-title">Comments ({comments.length})</div>
          {comments.length === 0
            ? <div className="fa-no-comments">No comments yet.</div>
            : comments.map(c => (
              <div key={c.id} className="fa-comment-row">
                <Avatar profile={c.profiles} size={28} />
                <div className="fa-comment-body">
                  <span className="fa-comment-name">{c.profiles?.full_name || "User"}</span>
                  <span className="fa-comment-time">{timeAgo(c.created_at)}</span>
                  <p className="fa-comment-text">{c.content}</p>
                </div>
                <button className="fa-btn fa-btn-red fa-btn-sm" onClick={() => onDeleteComment(c.id, post.id)}>🗑</button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── Report row ─────────────────────────────────────────────────────────────
function ReportRow({ report, onMarkReviewed, onDeleteTarget }) {
  return (
    <div className={`fa-row ${report.is_reviewed ? "fa-row-reviewed" : ""}`}>
      <div className="fa-row-header">
        <div className="fa-report-type">
          {report.post_id ? "📝 Post Report" : "💬 Comment Report"}
        </div>
        <div className="fa-row-meta">
          <div className="fa-row-name">Reported by: {report.reporter?.full_name || "User"}</div>
          <div className="fa-row-time">{timeAgo(report.created_at)}</div>
        </div>
        {report.is_reviewed && <span className="fa-reviewed-badge">✓ Reviewed</span>}
      </div>
      <div className="fa-report-reason"><strong>Reason:</strong> {report.reason}</div>

      {report.post_content && (
        <div className="fa-report-content">
          <strong>Post:</strong> "{report.post_content}"
        </div>
      )}
      {report.comment_content && (
        <div className="fa-report-content">
          <strong>Comment:</strong> "{report.comment_content}"
        </div>
      )}

      {!report.is_reviewed && (
        <div className="fa-report-actions">
          <button className="fa-btn fa-btn-red"
            onClick={() => onDeleteTarget(report)}>
            🗑 Delete {report.post_id ? "Post" : "Comment"}
          </button>
          <button className="fa-btn fa-btn-ghost"
            onClick={() => onMarkReviewed(report.id)}>
            ✓ Mark Reviewed
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Admin ─────────────────────────────────────────────────────────────
export default function FeedAdmin() {
  const [userEmail,   setUserEmail]   = useState(null);
  const [authorized,  setAuthorized]  = useState(null); // null=loading
  const [activeTab,   setActiveTab]   = useState("posts");
  const [posts,       setPosts]       = useState([]);
  const [reports,     setReports]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [expandedPost,setExpandedPost]= useState(null);
  const [commentsMap, setCommentsMap] = useState({}); // postId -> comments[]
  const [showReviewed,setShowReviewed]= useState(false);
  const [toast,       setToast]       = useState(null);

  const notify = (msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthorized(false); return; }
      setUserEmail(user.email);
      setAuthorized(user.email === ADMIN_EMAIL);
    })();
  }, []);

  // ── Load posts ────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feed_posts").select("*")
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profileRows } = await supabase
        .from("users_profiles").select("user_id,full_name,avatar_url,email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profileRows||[]).map(p=>[p.user_id,p]));
      setPosts(data.map(p => ({ ...p, profiles: profileMap[p.user_id] || null })));
    } else { setPosts([]); }
    setLoading(false);
  }, []);

  // ── Load reports ──────────────────────────────────────────────
  const loadReports = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("feed_reports").select("*")
      .order("created_at", { ascending: false }).limit(200);
    if (!data || data.length === 0) { setReports([]); setLoading(false); return; }

    // Fetch reporter profiles, posts and comments separately
    const reporterIds = [...new Set(data.map(r => r.reporter_id))];
    const postIds     = data.map(r => r.post_id).filter(Boolean);
    const commentIds  = data.map(r => r.comment_id).filter(Boolean);

    const [{ data: reporters }, { data: posts }, { data: comments }] = await Promise.all([
      supabase.from("users_profiles").select("user_id,full_name").in("user_id", reporterIds),
      postIds.length    ? supabase.from("feed_posts").select("id,content").in("id", postIds)       : { data: [] },
      commentIds.length ? supabase.from("feed_comments").select("id,content").in("id", commentIds) : { data: [] },
    ]);

    const reporterMap = Object.fromEntries((reporters||[]).map(r=>[r.user_id,r]));
    const postMap     = Object.fromEntries((posts||[]).map(p=>[p.id,p]));
    const commentMap  = Object.fromEntries((comments||[]).map(c=>[c.id,c]));

    const enriched = data.map(r => ({
      ...r,
      reporter:        reporterMap[r.reporter_id] || null,
      post_content:    r.post_id    ? (postMap[r.post_id]?.content       || null) : null,
      comment_content: r.comment_id ? (commentMap[r.comment_id]?.content || null) : null,
    }));
    setReports(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authorized) { loadPosts(); loadReports(); }
  }, [authorized, loadPosts, loadReports]);

  // ── Load comments for a post ──────────────────────────────────
  const loadComments = async (postId) => {
    const { data } = await supabase
      .from("feed_comments").select("*")
      .eq("post_id", postId).eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profileRows } = await supabase
        .from("users_profiles").select("user_id,full_name,avatar_url,email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profileRows||[]).map(p=>[p.user_id,p]));
      setCommentsMap(p => ({ ...p, [postId]: data.map(c => ({ ...c, profiles: profileMap[c.user_id]||null })) }));
    } else {
      setCommentsMap(p => ({ ...p, [postId]: [] }));
    }
  };

  // ── Actions ───────────────────────────────────────────────────
  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    // Hard DELETE — bypasses the update RLS entirely.
    // Admin has no ownership of other users' posts so UPDATE is_deleted fails silently.
    const { error } = await supabase.from("feed_posts").delete().eq("id", postId);
    if (error) {
      console.error("[admin deletePost]", error);
      notify("Delete failed: " + (error.message || error.code), "err");
      return;
    }
    setPosts(p => p.filter(x => x.id !== postId));
    notify("Post deleted.");
  };

  const pinPost = async (postId) => {
    const { error } = await supabase.from("feed_posts").update({ is_pinned: true }).eq("id", postId);
    if (error) { notify("Pin failed: " + (error.message || error.code), "err"); return; }
    setPosts(p => p.map(x => x.id === postId ? { ...x, is_pinned: true } : x));
    notify("Post pinned ✓");
  };

  const unpinPost = async (postId) => {
    const { error } = await supabase.from("feed_posts").update({ is_pinned: false }).eq("id", postId);
    if (error) { notify("Unpin failed: " + (error.message || error.code), "err"); return; }
    setPosts(p => p.map(x => x.id === postId ? { ...x, is_pinned: false } : x));
    notify("Post unpinned.");
  };

  const deleteComment = async (commentId, postId) => {
    await supabase.from("feed_comments").delete().eq("id", commentId);
    setCommentsMap(p => ({
      ...p,
      [postId]: (p[postId] || []).filter(c => c.id !== commentId),
    }));
    notify("Comment deleted.");
  };

  const markReviewed = async (reportId) => {
    await supabase.from("feed_reports").update({ is_reviewed: true }).eq("id", reportId);
    setReports(p => p.map(r => r.id === reportId ? { ...r, is_reviewed: true } : r));
    notify("Marked as reviewed.");
  };

  const deleteReportTarget = async (report) => {
    if (!window.confirm(`Delete this ${report.post_id ? "post" : "comment"}?`)) return;
    if (report.post_id) {
      await supabase.from("feed_posts").update({ is_deleted: true }).eq("id", report.post_id);
      setPosts(p => p.filter(x => x.id !== report.post_id));
    } else {
      await supabase.from("feed_comments").delete().eq("id", report.comment_id);
    }
    await supabase.from("feed_reports").update({ is_reviewed: true }).eq("id", report.id);
    setReports(p => p.map(r => r.id === report.id ? { ...r, is_reviewed: true } : r));
    notify("Content deleted and report closed.");
  };

  const pendingReports = reports.filter(r => !r.is_reviewed).length;
  const visibleReports = showReviewed ? reports : reports.filter(r => !r.is_reviewed);

  // ── Guards ────────────────────────────────────────────────────
  if (authorized === null) return (
    <div className="fa-root"><style>{CSS}</style>
      <div className="fa-loading"><div className="fa-spinner" /></div>
    </div>
  );
  if (!authorized) return (
    <div className="fa-root"><style>{CSS}</style>
      <div className="fa-denied">
        <div style={{ fontSize:48 }}>🔒</div>
        <h2>Access Denied</h2>
        <p>This page is for AIDLA admins only.</p>
      </div>
    </div>
  );

  return (
    <div className="fa-root">
      <style>{CSS}</style>

      {toast && (
        <div className={`fa-toast ${toast.type === "err" ? "fa-toast-err" : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="fa-header">
        <div className="fa-header-left">
          <div className="fa-header-icon">🛡️</div>
          <div>
            <h1 className="fa-title">Forum Admin Panel</h1>
            <div className="fa-subtitle">AIDLA_Official <BlueTick /> · Logged in as {userEmail}</div>
          </div>
        </div>
        <button className="fa-refresh-btn" onClick={() => { loadPosts(); loadReports(); }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="fa-stats">
        {[
          { label:"Total Posts",    val: posts.length,       icon:"📝" },
          { label:"Pinned",         val: posts.filter(p=>p.is_pinned).length, icon:"📌" },
          { label:"Pending Reports",val: pendingReports,     icon:"🚩", warn: pendingReports > 0 },
          { label:"Total Reports",  val: reports.length,     icon:"📋" },
        ].map(s => (
          <div key={s.label} className={`fa-stat-card ${s.warn ? "fa-stat-warn" : ""}`}>
            <div className="fa-stat-icon">{s.icon}</div>
            <div className="fa-stat-val">{s.val}</div>
            <div className="fa-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="fa-tabs">
        <Tab label="All Posts" count={posts.length} active={activeTab==="posts"} onClick={() => setActiveTab("posts")} />
        <Tab label="Reports" count={pendingReports} active={activeTab==="reports"} onClick={() => setActiveTab("reports")} />
      </div>

      {loading && (
        <div className="fa-loading"><div className="fa-spinner" /><span>Loading…</span></div>
      )}

      {/* ── Posts tab ── */}
      {activeTab === "posts" && !loading && (
        <div className="fa-list">
          {posts.length === 0
            ? <div className="fa-empty">No posts found.</div>
            : posts.map(post => (
              <AdminPostRow
                key={post.id}
                post={post}
                onDelete={deletePost}
                onPin={pinPost}
                onUnpin={unpinPost}
                onExpand={id => setExpandedPost(p => p === id ? null : id)}
                expanded={expandedPost === post.id}
                comments={commentsMap[post.id] || []}
                onDeleteComment={deleteComment}
                loadComments={loadComments}
              />
            ))
          }
        </div>
      )}

      {/* ── Reports tab ── */}
      {activeTab === "reports" && !loading && (
        <div className="fa-list">
          <div className="fa-reports-toolbar">
            <span className="fa-reports-count">
              {pendingReports} pending · {reports.length} total
            </span>
            <label className="fa-toggle">
              <input type="checkbox" checked={showReviewed} onChange={e=>setShowReviewed(e.target.checked)} />
              Show reviewed
            </label>
          </div>
          {visibleReports.length === 0
            ? <div className="fa-empty">🎉 No pending reports!</div>
            : visibleReports.map(report => (
              <ReportRow
                key={report.id}
                report={report}
                onMarkReviewed={markReviewed}
                onDeleteTarget={deleteReportTarget}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
  .fa-root {
    max-width: 860px; margin: 0 auto;
    font-family: 'Inter', system-ui, sans-serif;
    color: #0f172a; padding-bottom: 40px;
  }

  /* ── Toast ── */
  .fa-toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: #15803d; color: #fff; padding: 9px 22px; border-radius: 100px;
    font-size: 0.84rem; font-weight: 700; z-index: 9999; white-space: nowrap;
    box-shadow: 0 8px 24px rgba(21,128,61,0.3);
    animation: faToast 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .fa-toast-err { background: #dc2626; box-shadow: 0 8px 24px rgba(220,38,38,0.3); }
  @keyframes faToast { from{opacity:0;transform:translateX(-50%) translateY(-12px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }

  /* ── Header ── */
  .fa-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; padding-bottom: 18px;
    border-bottom: 1px solid rgba(30,58,138,0.08);
  }
  .fa-header-left { display: flex; align-items: center; gap: 13px; }
  .fa-header-icon {
    width: 48px; height: 48px; border-radius: 15px; font-size: 24px;
    background: linear-gradient(135deg,#1e3a8a,#3b82f6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 5px 16px rgba(59,130,246,0.3); flex-shrink: 0;
  }
  .fa-title {
    font-size: clamp(1.1rem,2.5vw,1.4rem); font-weight: 900;
    letter-spacing: -0.4px; margin: 0 0 2px;
    background: linear-gradient(135deg,#1e3a8a,#3b82f6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .fa-subtitle {
    font-size: 0.78rem; color: #64748b; font-weight: 600;
    display: flex; align-items: center; gap: 3px; flex-wrap: wrap;
  }
  .fa-refresh-btn {
    padding: 8px 18px; border-radius: 100px;
    border: 1.5px solid rgba(30,58,138,0.15);
    background: rgba(30,58,138,0.05); color: #1e3a8a;
    font-size: 0.83rem; font-weight: 700; cursor: pointer; transition: all 0.15s;
  }
  .fa-refresh-btn:hover { background: rgba(30,58,138,0.12); }

  /* ── Stats ── */
  .fa-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px;
  }
  .fa-stat-card {
    background: rgba(255,255,255,0.9); border: 1px solid rgba(30,58,138,0.09);
    border-radius: 14px; padding: 14px 12px; text-align: center;
    box-shadow: 3px 3px 10px rgba(15,23,42,0.04), -3px -3px 8px rgba(255,255,255,0.9);
  }
  .fa-stat-warn {
    border-color: rgba(239,68,68,0.25);
    background: rgba(239,68,68,0.03);
  }
  .fa-stat-icon { font-size: 1.3rem; margin-bottom: 5px; }
  .fa-stat-val { font-size: 1.5rem; font-weight: 900; color: #0f172a; }
  .fa-stat-label { font-size: 0.72rem; color: #64748b; font-weight: 600; margin-top: 2px; }

  /* ── Tabs ── */
  .fa-tabs { display: flex; gap: 6px; margin-bottom: 18px; }
  .fa-tab {
    padding: 9px 20px; border-radius: 100px;
    border: 1.5px solid rgba(30,58,138,0.12);
    background: transparent; font-size: 0.85rem; font-weight: 700;
    color: #475569; cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 7px;
  }
  .fa-tab:hover { background: rgba(30,58,138,0.06); }
  .fa-tab-active {
    background: linear-gradient(135deg,#1e3a8a,#3b82f6);
    border-color: transparent; color: #fff;
  }
  .fa-tab-active:hover { filter: brightness(1.08); }
  .fa-tab-badge {
    background: #ef4444; color: #fff; border-radius: 100px;
    padding: 1px 7px; font-size: 0.72rem; font-weight: 800;
  }
  .fa-tab-active .fa-tab-badge { background: rgba(255,255,255,0.3); }

  /* ── List ── */
  .fa-list { display: flex; flex-direction: column; gap: 12px; }

  /* ── Row ── */
  .fa-row {
    background: rgba(255,255,255,0.9); border: 1px solid rgba(30,58,138,0.08);
    border-radius: 16px; padding: 16px;
    box-shadow: 3px 3px 12px rgba(15,23,42,0.04), -3px -3px 8px rgba(255,255,255,0.9);
  }
  .fa-row-pinned { border-color: rgba(245,158,11,0.3); }
  .fa-row-reviewed { opacity: 0.55; }
  .fa-row-header {
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;
  }
  .fa-row-meta { flex: 1; min-width: 0; }
  .fa-row-name {
    font-weight: 700; font-size: 0.88rem; color: #0f172a;
    display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
  }
  .fa-row-time { font-size: 0.74rem; color: #94a3b8; font-weight: 500; margin-top: 2px; }
  .fa-pinned-label {
    font-size: 0.72rem; color: #b45309; font-weight: 700;
    background: rgba(245,158,11,0.1); padding: 2px 8px; border-radius: 100px;
  }
  .fa-reviewed-badge {
    font-size: 0.72rem; color: #15803d; font-weight: 700;
    background: rgba(22,163,74,0.1); padding: 2px 8px; border-radius: 100px;
    white-space: nowrap;
  }
  .fa-row-actions { display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0; }

  /* ── Buttons ── */
  .fa-btn {
    padding: 6px 13px; border-radius: 9px; border: none;
    font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .fa-btn-red    { background: rgba(239,68,68,0.08);  color:#dc2626; border: 1px solid rgba(239,68,68,0.2); }
  .fa-btn-red:hover { background: rgba(239,68,68,0.15); }
  .fa-btn-blue   { background: rgba(30,58,138,0.07); color:#1e3a8a; border: 1px solid rgba(30,58,138,0.18); }
  .fa-btn-blue:hover { background: rgba(30,58,138,0.13); }
  .fa-btn-warn   { background: rgba(245,158,11,0.08); color:#b45309; border: 1px solid rgba(245,158,11,0.2); }
  .fa-btn-warn:hover { background: rgba(245,158,11,0.15); }
  .fa-btn-ghost  { background: rgba(100,116,139,0.07); color:#475569; border: 1px solid rgba(100,116,139,0.15); }
  .fa-btn-ghost:hover { background: rgba(100,116,139,0.13); }
  .fa-btn-sm { padding: 4px 9px; font-size: 0.73rem; }

  /* ── Post content ── */
  .fa-post-content {
    font-size: 0.88rem; color: #334155; line-height: 1.6; margin-bottom: 8px;
    white-space: pre-wrap; word-break: break-word;
  }
  .fa-post-tag {
    display: inline-block; font-size: 0.76rem; color: #64748b;
    background: rgba(30,58,138,0.05); border-radius: 100px;
    padding: 2px 10px; margin-right: 6px; margin-bottom: 6px;
  }

  /* ── Comments ── */
  .fa-comments-list {
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(30,58,138,0.07);
    display: flex; flex-direction: column; gap: 8px;
  }
  .fa-comments-title { font-size: 0.78rem; font-weight: 800; color: #475569; margin-bottom: 6px; }
  .fa-no-comments { font-size: 0.82rem; color: #94a3b8; font-style: italic; padding: 6px 0; }
  .fa-comment-row {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 8px; background: rgba(30,58,138,0.03); border-radius: 10px;
  }
  .fa-comment-body { flex: 1; min-width: 0; }
  .fa-comment-name { font-weight: 700; font-size: 0.8rem; color: #0f172a; margin-right: 7px; }
  .fa-comment-time { font-size: 0.72rem; color: #94a3b8; }
  .fa-comment-text { font-size: 0.83rem; color: #334155; margin: 3px 0 0; word-break: break-word; }

  /* ── Reports ── */
  .fa-report-type {
    font-size: 0.78rem; font-weight: 800; color: #dc2626;
    background: rgba(239,68,68,0.07); padding: 3px 10px; border-radius: 100px;
    white-space: nowrap; flex-shrink: 0;
  }
  .fa-report-reason {
    font-size: 0.83rem; color: #475569; margin-bottom: 6px;
  }
  .fa-report-content {
    font-size: 0.83rem; color: #334155;
    background: rgba(30,58,138,0.04); padding: 8px 12px; border-radius: 10px;
    margin-bottom: 8px; font-style: italic; word-break: break-word;
    border-left: 3px solid rgba(30,58,138,0.15);
  }
  .fa-report-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .fa-reports-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .fa-reports-count { font-size: 0.82rem; font-weight: 700; color: #64748b; }
  .fa-toggle { display: flex; align-items: center; gap: 7px; font-size: 0.82rem; color: #64748b; cursor: pointer; }

  /* ── Loading / empty / denied ── */
  .fa-loading {
    display: flex; align-items: center; gap: 10px; justify-content: center;
    padding: 30px; color: #64748b; font-size: 0.86rem; font-weight: 600;
  }
  .fa-spinner {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2.5px solid rgba(59,130,246,0.2); border-top-color: #3b82f6;
    animation: faSpin 0.7s linear infinite;
  }
  @keyframes faSpin { to { transform: rotate(360deg); } }
  .fa-empty { text-align: center; padding: 30px; color: #94a3b8; font-size: 0.88rem; font-weight: 600; }
  .fa-denied { text-align: center; padding: 60px 20px; color: #64748b; }
  .fa-denied h2 { font-size: 1.3rem; font-weight: 900; color: #0f172a; margin: 12px 0 8px; }

  /* ── Mobile ── */
  @media (max-width: 580px) {
    .fa-stats { grid-template-columns: repeat(2,1fr); }
    .fa-row-header { flex-direction: column; }
    .fa-row-actions { width: 100%; }
    .fa-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  }
`;