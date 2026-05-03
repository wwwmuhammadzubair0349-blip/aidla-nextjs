// app/blogs/[slug]/BlogPostClient.jsx
"use client";

import React, {
  useEffect, useState, useCallback, useRef
} from "react";
import Link          from "next/link";
import Image         from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase }  from "@/lib/supabase";
import "./BlogPost.css";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const SITE_URL = "https://www.aidla.online";

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function isUrdu(t) {
  return t ? /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(t) : false;
}

// SSR-safe fingerprint (matches News exactly)
function getFingerprint() {
  if (typeof window === "undefined") return "ssr-fp";
  const KEY = "aidla_fp";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = "fp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

// Read-time from HTML (pure, no DOM — safe server/client)
function estimateReadTime(html = "") {
  if (!html) return null;
  const text  = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function formatDate(d) {
  if (!d) return "New";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// Pure-function heading extractor (mirrors News — no reliance on hooks)
function extractHeadings(html) {
  if (!html || typeof DOMParser === "undefined") return [];
  
  try {
    const doc      = new DOMParser().parseFromString(html, "text/html");
    const elements = doc.querySelectorAll("h2, h3, h4");
    return Array.from(elements).map((el, i) => ({
      id:    el.id || `bp-h-${i}`,
      text:  el.textContent,
      level: parseInt(el.tagName[1]),
    }));
  } catch (e) {
    console.warn("Failed to extract headings:", e);
    return [];
  }
}

// Inject IDs into raw HTML string (mirrors News)
function injectHeadingIds(html) {
  if (!html) return "";
  let i = 0;
  return html.replace(/<(h[234])([^>]*)>/gi, (match, tag, attrs) => {
    if (/id=/i.test(attrs)) return match;
    return `<${tag}${attrs} id="bp-h-${i++}">`;
  });
}

// Sanitise links in a DOM node (unchanged from original)
function sanitiseLinks(container) {
  if (!container || !container.querySelectorAll) return;
  
  container.querySelectorAll("a").forEach(a => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
    const href = a.getAttribute("href") || "";
    if (href.toLowerCase().startsWith("javascript:")) {
      a.removeAttribute("href");
    } else if (href && !href.startsWith("http") && !href.startsWith("/") && !href.startsWith("#") && !href.startsWith("mailto:")) {
      a.setAttribute("href", `https://${href}`);
    }
  });
}

// Safe HTML processing with error boundary
function processContent(html) {
  if (!html) return { headings: [], processedHtml: "" };
  
  try {
    const withIds = injectHeadingIds(html);
    
    // Use try-catch for DOM operations
    let processedHtml = withIds;
    try {
      const tmp = document.createElement("div");
      tmp.innerHTML = withIds;
      sanitiseLinks(tmp);
      processedHtml = tmp.innerHTML;
    } catch (e) {
      console.warn("DOM processing failed, using raw HTML:", e);
      processedHtml = withIds;
    }
    
    const headings = extractHeadings(processedHtml);
    
    return { headings, processedHtml };
  } catch (e) {
    console.error("Content processing failed:", e);
    return { headings: [], processedHtml: html };
  }
}

function buildTree(flat) {
  const map  = {};
  flat.forEach(c => { map[c.id] = { ...c, replies: [] }; });
  const roots = [];
  flat.forEach(c => {
    if (c.parent_id && map[c.parent_id]) map[c.parent_id].replies.push(map[c.id]);
    else roots.push(map[c.id]);
  });
  return roots;
}

/* ══════════════════════════════════════════════
   TOAST (extracted component — mirrors News)
══════════════════════════════════════════════ */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="bp-toast" role="status" aria-live="polite">{message}</div>
  );
}

/* ══════════════════════════════════════════════
   READING PROGRESS BAR (extracted component — mirrors News)
══════════════════════════════════════════════ */
function ProgressBar() {
  const [pct, setPct] = useState(0);
  
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      if (!el) return;
      
      const total = el.scrollHeight - el.clientHeight;
      const scroll = el.scrollTop || document.body?.scrollTop || 0;
      setPct(total > 0 ? Math.min(100, (scroll / total) * 100) : 0);
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  
  return (
    <div
      className="bp-progress-bar"
      style={{ width: `${pct}%` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
}

/* ══════════════════════════════════════════════
   TABLE OF CONTENTS (extracted component — mirrors News)
══════════════════════════════════════════════ */
function TOC({ headings }) {
  const [open, setOpen] = useState(true);
  if (!headings?.length) return null;
  
  return (
    <nav className="bp-toc" aria-label="Table of contents">
      <div
        className="bp-toc-title"
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
      >
        📋 Table of Contents
        <span style={{ marginLeft: "auto", fontSize: "0.8em" }} aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            className="bp-toc-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {headings.map(item => (
              <li key={item.id} className={`bp-toc-item ${item.level === 3 ? "h3" : item.level === 4 ? "h4" : ""}`}>
                <a
                  href={`#${item.id}`}
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >{item.text}</a>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ══════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════ */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div
      className="bp-confirm-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bp-confirm-title"
    >
      <motion.div
        className="bp-confirm-box"
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bp-confirm-icon" aria-hidden="true">🗑️</div>
        <div id="bp-confirm-title" className="bp-confirm-title">Delete Comment?</div>
        <div className="bp-confirm-sub">This cannot be undone. The comment and all its replies will be removed.</div>
        <div className="bp-confirm-btns">
          <button className="bp-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="bp-confirm-delete" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPLY FORM
══════════════════════════════════════════════ */
function ReplyForm({ onSubmit, onCancel, loading }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="bp-reply-form">
      <div className="bp-reply-form-title">↩ Write a Reply</div>
      <div className="bp-reply-row">
        <input
          className="bp-form-input"
          placeholder="Your name *"
          value={name}
          onChange={e => setName(e.target.value)}
          aria-label="Your name"
        />
        <input
          className="bp-form-input"
          placeholder="Email (optional)"
          defaultValue=""
          aria-label="Email (optional)"
        />
      </div>
      <textarea
        className="bp-reply-textarea"
        placeholder="Write your reply…"
        value={body}
        onChange={e => setBody(e.target.value)}
        aria-label="Reply"
      />
      <div className="bp-reply-actions">
        <button
          className="bp-reply-submit"
          onClick={() => onSubmit(name, body)}
          disabled={loading || !name.trim() || !body.trim()}
          aria-busy={loading}
        >
          {loading ? "Posting…" : "Post Reply →"}
        </button>
        <button className="bp-reply-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMMENT NODE
══════════════════════════════════════════════ */
function CommentNode({ node, fp, depth = 0, onDelete, onEdit, onReply, onLikeComment, commentLikes }) {
  const [editing,     setEditing]     = useState(false);
  const [editBody,    setEditBody]    = useState(node.body);
  const [saving,      setSaving]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReply,   setShowReply]   = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [flagged,     setFlagged]     = useState(node.is_flagged);

  const isMine = node.fingerprint === fp;
  const likes  = commentLikes[node.id] || { count: 0, liked: false };

  const handleSave = async () => {
    if (!editBody.trim() || editBody.trim() === node.body) { setEditing(false); return; }
    setSaving(true);
    await onEdit(node.id, editBody.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleReplySubmit = async (name, body) => {
    setReplyLoading(true);
    await onReply({ parentId: node.id, name, body });
    setReplyLoading(false);
    setShowReply(false);
  };

  const handleFlag = async () => {
    if (flagged || isMine) return;
    const { error } = await supabase.rpc("blogs_flag_comment", { p_comment_id: node.id });
    if (!error) setFlagged(true);
  };

  return (
    <>
      <div className={`bp-comment-item${isMine ? " is-mine" : ""}${node.is_pinned ? " is-pinned" : ""}${flagged ? " is-flagged" : ""}`}>
        <div className="bp-comment-header">
          <div className="bp-comment-author-row">
            <div className={`bp-comment-avatar${isMine ? " mine" : ""}`} aria-hidden="true">
              {(node.author_name || "?")[0].toUpperCase()}
            </div>
            <span className="bp-comment-name">{node.author_name}</span>
            {isMine       && <span className="bp-mine-badge">You</span>}
            {node.is_pinned && <span className="bp-pin-badge">📌 Pinned</span>}
            {node.edited_at && <span className="bp-comment-edited">(edited)</span>}
          </div>
          <span className="bp-comment-date">
            <time dateTime={node.created_at}>{formatDate(node.created_at)}</time>
          </span>
        </div>

        {editing ? (
          <>
            <textarea
              className="bp-comment-edit-area"
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              autoFocus
              aria-label="Edit comment"
            />
            <div style={{ display: "flex", gap: 7 }}>
              <button
                className="bp-cmt-action-btn bp-cmt-save-btn"
                onClick={handleSave}
                disabled={saving || !editBody.trim()}
              >{saving ? "Saving…" : "✅ Save"}</button>
              <button
                className="bp-cmt-action-btn bp-cmt-cancel-btn"
                onClick={() => { setEditBody(node.body); setEditing(false); }}
              >Cancel</button>
            </div>
          </>
        ) : (
          <p className="bp-comment-body">{node.body}</p>
        )}

        {!editing && (
          <div className="bp-comment-actions-row">
            <button
              className={`bp-cmt-like-btn${likes.liked ? " liked" : ""}`}
              onClick={() => onLikeComment(node.id)}
              aria-label={`Like this comment — ${likes.count} likes`}
              aria-pressed={likes.liked}
            >
              <span aria-hidden="true">{likes.liked ? "❤️" : "🤍"}</span>
              {likes.count > 0 ? likes.count : ""}
            </button>
            {depth === 0 && (
              <button
                className="bp-cmt-reply-btn"
                onClick={() => setShowReply(!showReply)}
                aria-expanded={showReply}
              >↩ Reply</button>
            )}
            {isMine && (
              <>
                <button
                  className="bp-cmt-action-btn bp-cmt-edit-btn"
                  onClick={() => { setEditBody(node.body); setEditing(true); }}
                >✏️ Edit</button>
                <button
                  className="bp-cmt-action-btn bp-cmt-delete-btn"
                  onClick={() => setShowConfirm(true)}
                >🗑 Delete</button>
              </>
            )}
            {!isMine && (
              <button
                className={`bp-cmt-action-btn bp-cmt-flag-btn${flagged ? " flagged" : ""}`}
                onClick={handleFlag}
                disabled={flagged}
                aria-label={flagged ? "Reported" : "Report this comment"}
              >{flagged ? "🚩 Reported" : "🚩 Report"}</button>
            )}
          </div>
        )}

        {showReply && (
          <ReplyForm
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReply(false)}
            loading={replyLoading}
          />
        )}
      </div>

      {node.replies?.length > 0 && (
        <div className="bp-comment-replies">
          {node.replies.map(child => (
            <CommentNode
              key={child.id}
              node={child}
              fp={fp}
              depth={depth + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              onLikeComment={onLikeComment}
              commentLikes={commentLikes}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showConfirm && (
          <ConfirmDialog
            onConfirm={() => { setShowConfirm(false); onDelete(node.id); }}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════
   ENGAGEMENT BAR (extracted component — mirrors News)
══════════════════════════════════════════════ */
function EngageBar({ post, fp }) {
  const [liked,      setLiked]      = useState(false);
  const [likeCount,  setLikeCount]  = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [toast,      setToast]      = useState(null);

  useEffect(() => {
    if (!fp) return;
    supabase
      .from("blogs_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id)
      .then(({ count }) => setLikeCount(count || 0));

    supabase
      .from("blogs_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("fingerprint", fp)
      .maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
  }, [post.id, fp]);

  const handleLike = useCallback(async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const { data, error } = await supabase.rpc("blogs_toggle_like", {
      p_post_id: post.id, p_fingerprint: fp,
    });
    if (!error && data?.ok) { setLiked(data.liked); setLikeCount(data.count); }
    setLikeLoading(false);
  }, [likeLoading, post.id, fp]);

  const shareUrl = `${SITE_URL}/blogs/${post.slug}`;

  const handleShare = useCallback((platform) => {
    if (platform === "wa") {
      window.open(`https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`, "_blank");
    } else if (platform === "tw") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setToast("Link copied! 📋");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [post.title, shareUrl]);

  return (
    <>
      <div className="bp-engage" aria-label="Article engagement">
        <span className="bp-engage-label">React & Share</span>
        <button
          className={`bp-like-btn${liked ? " liked" : ""}`}
          onClick={handleLike}
          disabled={likeLoading}
          aria-label={liked ? `Liked — ${likeCount} likes` : `Like this article — ${likeCount} likes`}
          aria-pressed={liked}
        >
          <span className="heart" aria-hidden="true">{liked ? "❤️" : "🤍"}</span>
          {liked ? "Liked" : "Like"}
          <span>({likeCount})</span>
        </button>
        <div className="bp-share-group">
          <button className="bp-share-btn bp-share-wa" onClick={() => handleShare("wa")} aria-label="Share on WhatsApp">
            <span aria-hidden="true">💬</span> WhatsApp
          </button>
          <button className="bp-share-btn bp-share-tw" onClick={() => handleShare("tw")} aria-label="Share on Twitter">
            <span aria-hidden="true">𝕏</span> Twitter
          </button>
          <button
            className={`bp-share-btn bp-share-copy${copied ? " copied" : ""}`}
            onClick={() => handleShare("copy")}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            <span aria-hidden="true">{copied ? "✅" : "🔗"}</span>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

/* ══════════════════════════════════════════════
   COVER IMAGE DOWNLOAD (extracted — mirrors News)
══════════════════════════════════════════════ */
function CoverDownloadBtn({ src, slug }) {
  const handleDownload = async () => {
    try {
      const res  = await fetch(src);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${slug}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };
  return (
    <button
      className="bp-cover-download"
      onClick={handleDownload}
      aria-label="Download cover image"
      title="Download cover image"
    >
      ⬇ Download Image
    </button>
  );
}

/* ══════════════════════════════════════════════
   RELATED POSTS (extracted — mirrors News)
══════════════════════════════════════════════ */
function RelatedPosts({ posts }) {
  if (!posts?.length) return null;
  return (
    <section className="bp-related-section" aria-labelledby="bp-related-heading">
      <h3 id="bp-related-heading" className="bp-related-title">You might also like...</h3>
      <div className="bp-related-grid">
        {posts.map(rp => (
          <Link href={`/blogs/${rp.slug}`} key={rp.id} className="bp-related-card">
            <div className="bp-related-img" style={{ position: "relative" }}>
              {rp.cover_image_url
                ? <Image src={rp.cover_image_url} alt={rp.title} fill sizes="300px" style={{ objectFit: "cover" }} loading="lazy" />
                : <span aria-hidden="true">📰</span>
              }
            </div>
            <div className="bp-related-text">
              <h4>{rp.title}</h4>
              <span>{formatDate(rp.published_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   COMMENTS SECTION (extracted component — mirrors News)
══════════════════════════════════════════════ */
function CommentsSection({ post, fp }) {
  const [comments,     setComments]     = useState([]);
  const [commentLikes, setCommentLikes] = useState({});
  const [cmtName,      setCmtName]      = useState("");
  const [cmtEmail,     setCmtEmail]     = useState("");
  const [cmtBody,      setCmtBody]      = useState("");
  const [cmtLoading,   setCmtLoading]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = useCallback((m) => {
    setToast(m);
  }, []);

  const loadComments = useCallback(async () => {
    const { data: cmts } = await supabase
      .from("blogs_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true });

    if (!cmts) return;
    setComments(cmts);

    const ids = cmts.map(c => c.id);
    if (!ids.length) return;

    const { data: cmtLikes } = await supabase
      .from("blogs_comment_likes")
      .select("comment_id,fingerprint")
      .in("comment_id", ids);

    if (cmtLikes) {
      const map = {};
      ids.forEach(id => { map[id] = { count: 0, liked: false }; });
      cmtLikes.forEach(l => {
        if (!map[l.comment_id]) map[l.comment_id] = { count: 0, liked: false };
        map[l.comment_id].count++;
        if (l.fingerprint === fp) map[l.comment_id].liked = true;
      });
      setCommentLikes(map);
    }
  }, [post.id, fp]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleComment = async () => {
    if (cmtLoading) return;
    setCmtLoading(true);
    const { data, error } = await supabase.rpc("blogs_add_comment", {
      p_post_id:     post.id,
      p_author_name: cmtName,
      p_author_email: cmtEmail,
      p_body:        cmtBody,
      p_fingerprint: fp,
      p_parent_id:   null,
    });
    if (error || !data?.ok) {
      showToast(data?.error || error?.message || "Failed to post");
    } else {
      await loadComments();
      setCmtName(""); setCmtEmail(""); setCmtBody("");
      showToast("Comment posted! 🎉");
    }
    setCmtLoading(false);
  };

  const handleReply = async ({ parentId, name, body }) => {
    const { data, error } = await supabase.rpc("blogs_add_comment", {
      p_post_id:      post.id,
      p_author_name:  name,
      p_author_email: "",
      p_body:         body,
      p_fingerprint:  fp,
      p_parent_id:    parentId,
    });
    if (error || !data?.ok) { showToast(data?.error || error?.message || "Failed"); return; }
    await loadComments();
    showToast("Reply posted! 💬");
  };

  const handleDeleteComment = async (id) => {
    const { error } = await supabase
      .from("blogs_comments")
      .delete()
      .eq("id", id)
      .eq("fingerprint", fp);
    if (error) { showToast("Could not delete comment"); return; }
    await loadComments();
    showToast("Comment deleted");
  };

  const handleEditComment = async (id, newBody) => {
    const { error } = await supabase
      .from("blogs_comments")
      .update({ body: newBody, edited_at: new Date().toISOString() })
      .eq("id", id)
      .eq("fingerprint", fp);
    if (error) { showToast("Could not update"); return; }
    await loadComments();
    showToast("Comment updated ✅");
  };

  const handleLikeComment = async (commentId) => {
    const { data, error } = await supabase.rpc("blogs_toggle_comment_like", {
      p_comment_id: commentId, p_fingerprint: fp,
    });
    if (!error && data?.ok) {
      setCommentLikes(prev => ({ ...prev, [commentId]: { count: data.count, liked: data.liked } }));
    }
  };

  const commentTree   = buildTree(comments);
  const totalComments = comments.length;

  return (
    <section className="bp-comments-section" aria-labelledby="bp-comments-heading">
      <h3 id="bp-comments-heading" className="bp-comments-title">
        💬 Comments <span className="bp-comment-count">{totalComments}</span>
      </h3>

      <div className="bp-comment-form">
        <div className="bp-comment-form-title">✍️ Leave a Comment</div>
        <div className="bp-form-row">
          <input
            className="bp-form-input"
            placeholder="Your name *"
            value={cmtName}
            onChange={e => setCmtName(e.target.value)}
            aria-label="Your name"
          />
          <input
            className="bp-form-input"
            placeholder="Email (optional)"
            type="email"
            value={cmtEmail}
            onChange={e => setCmtEmail(e.target.value)}
            aria-label="Email"
          />
        </div>
        <textarea
          className="bp-form-textarea"
          placeholder="Write your comment…"
          value={cmtBody}
          onChange={e => setCmtBody(e.target.value)}
          aria-label="Comment"
        />
        <button
          className="bp-comment-submit"
          onClick={handleComment}
          disabled={cmtLoading || !cmtName.trim() || !cmtBody.trim()}
          aria-busy={cmtLoading}
        >
          {cmtLoading ? "Posting…" : "Post Comment →"}
        </button>
      </div>

      {totalComments === 0 ? (
        <div className="bp-no-comments">No comments yet. Be the first! 💭</div>
      ) : (
        <div className="bp-comment-list" role="list">
          {commentTree.map(node => (
            <div key={node.id} className="bp-comment-thread" role="listitem">
              <CommentNode
                node={node}
                fp={fp}
                depth={0}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
                onReply={handleReply}
                onLikeComment={handleLikeComment}
                commentLikes={commentLikes}
              />
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </section>
  );
}

/* ══════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   Props: initialPost, relatedPosts, slug
══════════════════════════════════════════════ */
export default function BlogPostClient({ initialPost, relatedPosts, slug }) {
  const post = initialPost;

  // SSR-safe fingerprint (mirrors News)
  const [fp, setFp] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => { 
    setFp(getFingerprint()); 
    setIsMounted(true);
  }, []);

  // View tracking — sessionStorage dedup (mirrors News, more robust than useRef)
  useEffect(() => {
    if (!post?.id) return;
    const key = `bp_viewed_${post.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      Promise.resolve(supabase.rpc("blogs_increment_view", { p_post_id: post.id })).catch(() => {});
    }
  }, [post?.id]);

  // TOC + processed HTML — pure functions, no DOM (mirrors News)
  const rawHtml = post?.content_html || (
    post?.content
      ? post.content.split("\n").filter(l => l.trim()).map(l => `<p>${l}</p>`).join("")
      : ""
  );

  const [headings, setHeadings] = useState([]);
  const [processedHtml, setProcessedHtml] = useState(rawHtml);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!rawHtml || !isMounted) return;
    
    // Process on next tick to ensure DOM is ready
    const timer = setTimeout(() => {
      const { headings: h, processedHtml: ph } = processContent(rawHtml);
      setHeadings(h);
      setProcessedHtml(ph);
      setContentReady(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [rawHtml, isMounted]);

  const urduTitle = isUrdu(post?.title || "");

  // Show loading state during content processing
  if (!contentReady && isMounted) {
    return (
      <main className="blogpost-root">
        <div className="bp-loading" aria-busy="true">
          <div className="bp-spinner" />
          <p>Loading article...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <ProgressBar />

      <main className="blogpost-root">
        <div className="bp-orbs" aria-hidden="true">
          <div className="bp-orb-1" /><div className="bp-orb-2" /><div className="bp-orb-3" />
        </div>

        <article className="blogpost-container" itemScope itemType="https://schema.org/BlogPosting">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Link href="/blogs" className="bp-back" aria-label="Back to all articles">
              ‹ All Insights
            </Link>
          </motion.div>

          <motion.div
            className="bp-article-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* ── Cover Image ── */}
            <div className="bp-cover-wrap">
              {post.cover_image_url ? (
                <>
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 900px"
                    style={{ objectFit: "cover" }}
                    itemProp="image"
                  />
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, transparent 55%, rgba(11,20,55,0.3) 100%)",
                      zIndex: 1,
                    }}
                    aria-hidden="true"
                  />
                  <CoverDownloadBtn src={post.cover_image_url} slug={slug} />
                </>
              ) : (
                <div className="bp-cover-placeholder" aria-hidden="true">📰</div>
              )}
            </div>

            {/* ── Article Body ── */}
            <div className="bp-body">
              {/* Badges row */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                <span className="bp-label">AIDLA Insights</span>
                <span className="bp-readtime-badge" aria-label={estimateReadTime(post.content_html || post.content)}>
                  ⏱ {estimateReadTime(post.content_html || post.content)}
                </span>
              </div>

              {/* Title */}
              <h1
                className={`bp-title${urduTitle ? " urdu" : ""}`}
                itemProp="headline"
                lang={urduTitle ? "ur" : "en"}
              >
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="bp-meta">
                <div className="bp-author">
                  <span className="bp-author-icon" aria-hidden="true">✍️</span>
                  <span itemProp="author">{post.author_name || "AIDLA Team"}</span>
                </div>
                <span className="bp-dot" aria-hidden="true" />
                {post.published_at && (
                  <span className="bp-date-pill">
                    <time dateTime={post.published_at} itemProp="datePublished">
                      {formatDate(post.published_at)}
                    </time>
                  </span>
                )}
                {post.updated_at && post.updated_at !== post.published_at && (
                  <>
                    <span className="bp-dot" aria-hidden="true" />
                    <span className="bp-read-time">
                      Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                    </span>
                  </>
                )}
                <span className="bp-dot" aria-hidden="true" />
                <span className="bp-read-time">👁 {(post.view_count || 0).toLocaleString()} views</span>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="bp-tags" aria-label="Article tags">
                  {post.tags.map(t => <span key={t} className="bp-tag">#{t}</span>)}
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <blockquote className="bp-excerpt" itemProp="description">{post.excerpt}</blockquote>
              )}

              {/* TOC (extracted component — mirrors News) */}
              {headings.length >= 3 && <TOC headings={headings} />}

              <div className="bp-divider" aria-hidden="true" />

              {/* Article content */}
              {processedHtml ? (
                <div
                  className="bp-content"
                  dir={urduTitle ? "rtl" : "ltr"}
                  itemProp="articleBody"
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              ) : post.excerpt ? (
                <div className="bp-content" itemProp="articleBody">
                  <p>{post.excerpt}</p>
                </div>
              ) : null}

              {/* Related Posts (extracted — mirrors News) */}
              <RelatedPosts posts={relatedPosts} />
            </div>

            {/* ── Engagement Bar (extracted — mirrors News) ── */}
            <EngageBar post={post} fp={fp} />

            {/* ── Footer CTA ── */}
            <div className="bp-footer-cta">
              <span className="bp-footer-cta-text">Thanks for reading ✨</span>
              <Link href="/blogs" className="bp-back-btn">‹ More Insights</Link>
            </div>
          </motion.div>
        </article>

        {/* ── Comments (extracted section — mirrors News) ── */}
        {fp && <CommentsSection post={post} fp={fp} />}
      </main>
    </>
  );
}