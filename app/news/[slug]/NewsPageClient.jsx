// app/news/[slug]/NewsPageClient.jsx
"use client";

import React, {
  useEffect, useState, useRef, useCallback, useMemo
} from "react";
import Link            from "next/link";
import Image           from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase }    from "@/lib/supabase";
import "./newspage.css";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const SITE_URL = "https://www.aidla.online";

const CAT_COLORS = {
  general:       "#3b82f6",
  politics:      "#8b5cf6",
  education:     "#0891b2",
  technology:    "#0f766e",
  community:     "#16a34a",
  events:        "#d97706",
  announcements: "#dc2626",
};
const CAT_LABELS = {
  general:       "🌐 General",
  politics:      "🏛️ Politics",
  education:     "📚 Education",
  technology:    "💻 Technology",
  community:     "🤝 Community",
  events:        "🎯 Events",
  announcements: "📢 Announcements",
};
const KNOWN_CATS = Object.keys(CAT_COLORS);

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function readTime(html = "") {
  const text  = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/* Extract headings from HTML string for TOC — WITH SAFETY */
function extractHeadings(html) {
  if (!html || typeof DOMParser === "undefined") return [];
  
  try {
    const parser   = new DOMParser();
    const doc      = parser.parseFromString(html, "text/html");
    const elements = doc.querySelectorAll("h2, h3, h4");
    return Array.from(elements).map((el, i) => ({
      id:    el.id || `heading-${i}`,
      text:  el.textContent,
      level: parseInt(el.tagName[1]),
    }));
  } catch (e) {
    console.warn("Failed to extract headings:", e);
    return [];
  }
}

/* Inject IDs into heading elements in raw HTML */
function injectHeadingIds(html) {
  if (!html) return "";
  let i = 0;
  return html.replace(/<(h[234])([^>]*)>/gi, (match, tag, attrs) => {
    if (/id=/i.test(attrs)) return match;
    return `<${tag}${attrs} id="heading-${i++}">`;
  });
}

/* Fingerprint for votes — same pattern used throughout site */
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

/* ══════════════════════════════════════════════
   TOAST — ephemeral notification
══════════════════════════════════════════════ */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="np-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

/* ══════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════ */
function ConfirmDialog({ title, sub, onConfirm, onCancel }) {
  return (
    <div className="np-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="np-confirm-box">
        <div className="np-confirm-icon" aria-hidden="true">🗑️</div>
        <h3 id="confirm-title" className="np-confirm-title">{title}</h3>
        <p className="np-confirm-sub">{sub}</p>
        <div className="np-confirm-btns">
          <button className="np-confirm-delete" onClick={onConfirm}>Delete</button>
          <button className="np-confirm-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   READING PROGRESS BAR — FIXED
══════════════════════════════════════════════ */
function ProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      if (!el) return;
      
      const total  = el.scrollHeight - el.clientHeight;
      const scroll = el.scrollTop || document.body?.scrollTop || 0;
      setPct(total > 0 ? Math.min(100, (scroll / total) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="np-progress"
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
   TABLE OF CONTENTS
══════════════════════════════════════════════ */
function TOC({ headings }) {
  const [open, setOpen] = useState(true);

  if (!headings?.length) return null;

  return (
    <nav className="np-toc" aria-label="Table of contents">
      <div
        className="np-toc-title"
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && setOpen(o => !o)}
      >
        <span aria-hidden="true">📋</span>
        Contents
        <span aria-hidden="true" style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            className="np-toc-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {headings.map(h => (
              <li
                key={h.id}
                className={`np-toc-item${h.level === 3 ? " h3" : h.level === 4 ? " h4" : ""}`}
              >
                <a
                  href={`#${h.id}`}
                  onClick={e => {
                    e.preventDefault();
                    document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >{h.text}</a>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ══════════════════════════════════════════════
   ENGAGEMENT BAR — like + share
══════════════════════════════════════════════ */
function EngageBar({ post }) {
  const [liked,    setLiked]    = useState(false);
  const [likes,    setLikes]    = useState(post.like_count || 0);
  const [copied,   setCopied]   = useState(false);
  const [toast,    setToast]    = useState(null);
  const fp = useRef(null);

  useEffect(() => {
    fp.current = getFingerprint();
    /* Check if this device already liked */
    supabase
      .from("news_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("fingerprint", fp.current)
      .maybeSingle()
      .then(({ data }) => { if (data) setLiked(true); });
  }, [post.id]);

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setLikes(l => l + 1);
    await supabase.from("news_likes").insert({
      post_id:     post.id,
      fingerprint: fp.current,
    }).then(() => {
      supabase.from("news_posts").update({ like_count: likes + 1 }).eq("id", post.id);
    });
  }, [liked, likes, post.id]);

  const shareUrl = `${SITE_URL}/news/${post.slug}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setToast("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this link:", shareUrl);
    }
  }, [shareUrl]);

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`;
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <div className="np-engage" aria-label="Article engagement">
        {/* Like */}
        <button
          className={`np-like-btn${liked ? " liked" : ""}`}
          onClick={handleLike}
          disabled={liked}
          aria-label={liked ? `Liked — ${likes} likes` : `Like this article — ${likes} likes`}
          aria-pressed={liked}
        >
          <span className="heart" aria-hidden="true">{liked ? "❤️" : "🤍"}</span>
          {liked ? "Liked" : "Like"}
          <span>({likes.toLocaleString()})</span>
        </button>

        {/* Share buttons */}
        <div className="np-share-group">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="np-share-btn np-share-wa"
            aria-label="Share on WhatsApp"
          >
            <span aria-hidden="true">💬</span> WhatsApp
          </a>
          <a
            href={twUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="np-share-btn np-share-tw"
            aria-label="Share on Twitter"
          >
            <span aria-hidden="true">🐦</span> Twitter
          </a>
          <button
            className={`np-share-btn np-share-copy${copied ? " copied" : ""}`}
            onClick={handleCopy}
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
   COMMENTS SYSTEM
   Full feature parity with original:
   - Post comment (name + email + body)
   - Nested replies (1 level)
   - Edit own comment (fingerprint-matched)
   - Delete own comment (with confirm dialog)
   - Like any comment
   - Flag inappropriate comment
   - Pinned badge
   - Loading skeleton
══════════════════════════════════════════════ */

/* ── Comment Form (top-level) ── */
function CommentForm({ postId, onPosted }) {
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [body,   setBody]   = useState("");
  const [state,  setState]  = useState("idle"); // idle | loading | ok | err
  const [msg,    setMsg]    = useState("");
  const fp = useRef(getFingerprint());

  const submit = async () => {
    if (!name.trim() || !email.trim() || !body.trim()) {
      setState("err"); setMsg("Please fill in all fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("err"); setMsg("Please enter a valid email address."); return;
    }
    if (body.trim().length < 5) {
      setState("err"); setMsg("Comment is too short."); return;
    }
    setState("loading");
    const { error } = await supabase.from("news_comments").insert({
      post_id:     postId,
      author_name: name.trim(),
      author_email: email.trim().toLowerCase(),
      body:        body.trim(),
      fingerprint: fp.current,
      parent_id:   null,
      is_approved: true,
    });
    if (error) {
      setState("err"); setMsg("Something went wrong. Please try again.");
    } else {
      setState("ok"); setMsg("✅ Comment posted!");
      setName(""); setEmail(""); setBody("");
      if (onPosted) onPosted();
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <div className="np-cmt-form" aria-labelledby="cmt-form-heading">
      <h3 id="cmt-form-heading" className="np-cmt-form-title">Leave a Comment</h3>

      {state === "err" && (
        <div className="np-error" role="alert" style={{ marginBottom: 12 }}>{msg}</div>
      )}
      {state === "ok" && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 10, marginBottom: 12, fontSize: "0.88rem", fontWeight: 600 }} role="status">
          {msg}
        </div>
      )}

      <div className="np-form-row">
        <div>
          <label htmlFor="cmt-name" style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: 5 }}>Name *</label>
          <input
            id="cmt-name"
            className="np-form-input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="cmt-email" style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: 5 }}>Email * (private)</label>
          <input
            id="cmt-email"
            className="np-form-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      <label htmlFor="cmt-body" style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: 5 }}>Comment *</label>
      <textarea
        id="cmt-body"
        className="np-form-textarea"
        placeholder="Share your thoughts…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={4}
        maxLength={1000}
      />

      <button
        className="np-cmt-submit"
        onClick={submit}
        disabled={state === "loading"}
        aria-busy={state === "loading"}
      >
        {state === "loading" ? "Posting…" : "Post Comment"}
      </button>
    </div>
  );
}

/* ── Reply Form (inline) ── */
function ReplyForm({ postId, parentId, parentAuthor, onPosted, onCancel }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [body,  setBody]  = useState("");
  const [state, setState] = useState("idle");
  const fp = useRef(getFingerprint());

  const submit = async () => {
    if (!name.trim() || !email.trim() || !body.trim()) return;
    setState("loading");
    const { error } = await supabase.from("news_comments").insert({
      post_id:      postId,
      author_name:  name.trim(),
      author_email: email.trim().toLowerCase(),
      body:         body.trim(),
      fingerprint:  fp.current,
      parent_id:    parentId,
      is_approved:  true,
    });
    if (!error) {
      if (onPosted) onPosted();
    } else {
      setState("idle");
    }
  };

  return (
    <div className="np-reply-form" aria-label={`Reply to ${parentAuthor}`}>
      <p className="np-reply-form-title">Replying to {parentAuthor}</p>
      <div className="np-reply-row">
        <input
          className="np-form-input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoComplete="name"
          aria-label="Name"
        />
        <input
          className="np-form-input"
          type="email"
          placeholder="Email (private)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          aria-label="Email"
        />
      </div>
      <textarea
        className="np-reply-textarea"
        placeholder="Write your reply…"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        maxLength={800}
        aria-label="Reply"
      />
      <div className="np-reply-actions">
        <button
          className="np-reply-submit"
          onClick={submit}
          disabled={state === "loading" || !name.trim() || !body.trim()}
          aria-busy={state === "loading"}
        >
          {state === "loading" ? "Posting…" : "Post Reply"}
        </button>
        <button className="np-reply-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Single Comment ── */
function CommentItem({ comment, postId, myFp, onRefresh, showToast, depth = 0 }) {
  const isMine   = comment.fingerprint === myFp;
  const [replyOpen, setReplyOpen] = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [editBody,  setEditBody]  = useState(comment.body);
  const [liked,     setLiked]     = useState(false);
  const [likes,     setLikes]     = useState(comment.like_count || 0);
  const [flagged,   setFlagged]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  /* Like */
  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setLikes(l => l + 1);
    await supabase.from("news_comment_likes").insert({
      comment_id:  comment.id,
      fingerprint: myFp,
    });
  }, [liked, comment.id, myFp]);

  /* Edit save */
  const handleSave = useCallback(async () => {
    if (!editBody.trim()) return;
    const { error } = await supabase
      .from("news_comments")
      .update({ body: editBody.trim(), is_edited: true })
      .eq("id", comment.id)
      .eq("fingerprint", myFp);
    if (!error) { setEditing(false); onRefresh(); }
  }, [editBody, comment.id, myFp, onRefresh]);

  /* Delete */
  const handleDelete = useCallback(async () => {
    setConfirmDel(false);
    const { error } = await supabase
      .from("news_comments")
      .delete()
      .eq("id", comment.id)
      .eq("fingerprint", myFp);
    if (!error) { showToast("Comment deleted."); onRefresh(); }
  }, [comment.id, myFp, onRefresh, showToast]);

  /* Flag */
  const handleFlag = useCallback(async () => {
    if (flagged || isMine) return;
    setFlagged(true);
    await supabase.from("news_comments").update({ is_flagged: true }).eq("id", comment.id);
    showToast("Comment reported. Thank you.");
  }, [flagged, isMine, comment.id, showToast]);

  return (
    <>
      {confirmDel && (
        <ConfirmDialog
          title="Delete Comment?"
          sub="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(false)}
        />
      )}

      <div
        className={`np-cmt-item${isMine ? " mine" : ""}${comment.is_pinned ? " pinned" : ""}${comment.is_flagged ? " flagged" : ""}`}
      >
        <div className="np-cmt-header">
          <div className="np-cmt-author-row">
            <div className={`np-cmt-avatar${isMine ? " mine" : ""}`} aria-hidden="true">
              {(comment.author_name?.[0] || "A").toUpperCase()}
            </div>
            <span className="np-cmt-name">{comment.author_name || "Anonymous"}</span>
            <span className="np-cmt-date">
              <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
            </span>
            {isMine   && <span className="np-mine-badge">You</span>}
            {comment.is_pinned  && <span className="np-pin-badge">📌 Pinned</span>}
            {comment.is_edited  && <span className="np-cmt-edited">(edited)</span>}
          </div>
        </div>

        {/* Body / Edit area */}
        {editing ? (
          <>
            <textarea
              className="np-cmt-edit-area"
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              maxLength={1000}
              aria-label="Edit comment"
            />
            <div className="np-cmt-actions">
              <button className="np-cmt-action-btn np-cmt-save-btn" onClick={handleSave}>Save</button>
              <button className="np-cmt-action-btn np-cmt-cancel-btn" onClick={() => { setEditing(false); setEditBody(comment.body); }}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p className="np-cmt-body">{comment.body}</p>
            <div className="np-cmt-actions">
              <button
                className={`np-cmt-like-btn${liked ? " liked" : ""}`}
                onClick={handleLike}
                disabled={liked}
                aria-label={`Like this comment — ${likes} likes`}
                aria-pressed={liked}
              >
                <span aria-hidden="true">{liked ? "❤️" : "🤍"}</span>
                {likes > 0 ? likes : "Like"}
              </button>

              {depth === 0 && (
                <button
                  className="np-cmt-reply-btn"
                  onClick={() => setReplyOpen(o => !o)}
                  aria-expanded={replyOpen}
                >
                  <span aria-hidden="true">↩</span> Reply
                </button>
              )}

              {isMine && (
                <>
                  <button className="np-cmt-action-btn np-cmt-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
                  <button className="np-cmt-action-btn np-cmt-del-btn" onClick={() => setConfirmDel(true)}>🗑️ Delete</button>
                </>
              )}

              {!isMine && (
                <button
                  className={`np-cmt-action-btn np-cmt-flag-btn${flagged ? " flagged" : ""}`}
                  onClick={handleFlag}
                  disabled={flagged}
                  aria-label={flagged ? "Reported" : "Report this comment"}
                >
                  {flagged ? "Reported" : "⚑ Report"}
                </button>
              )}
            </div>
          </>
        )}

        {/* Reply form */}
        {replyOpen && depth === 0 && (
          <ReplyForm
            postId={postId}
            parentId={comment.id}
            parentAuthor={comment.author_name}
            onPosted={() => { setReplyOpen(false); onRefresh(); }}
            onCancel={() => setReplyOpen(false)}
          />
        )}

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div className="np-cmt-replies" aria-label={`Replies to ${comment.author_name}`}>
            {comment.replies.map(r => (
              <CommentItem
                key={r.id}
                comment={r}
                postId={postId}
                myFp={myFp}
                onRefresh={onRefresh}
                showToast={showToast}
                depth={1}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Comments Section ── */
function CommentsSection({ postId }) {
  const [comments,  setComments]  = useState(null); // null = loading
  const [toast,     setToast]     = useState(null);
  const myFp = useRef(null);

  useEffect(() => {
    myFp.current = getFingerprint();
  }, []);

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from("news_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_approved", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true });

    if (!data) { setComments([]); return; }

    /* Build tree — top-level with replies nested */
    const top     = data.filter(c => !c.parent_id);
    const replies = data.filter(c =>  c.parent_id);
    const tree    = top.map(c => ({
      ...c,
      replies: replies.filter(r => r.parent_id === c.id),
    }));
    setComments(tree);
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const topLevel = comments?.filter(c => !c.parent_id) || [];
  const count    = comments === null ? null : comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <section className="np-comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="np-comments-title">
        <span aria-hidden="true">💬</span>
        Comments
        {count !== null && (
          <span className="np-cmt-count" aria-label={`${count} comments`}>{count}</span>
        )}
      </h2>

      <CommentForm postId={postId} onPosted={loadComments} />

      {comments === null ? (
        <div aria-label="Loading comments">
          {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div className="skel-bg" style={{ height: 80 }} />
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <p className="np-no-comments">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="np-cmt-list" role="list">
          {topLevel.map(c => (
            <div key={c.id} className="np-cmt-thread" role="listitem">
              <CommentItem
                comment={c}
                postId={postId}
                myFp={myFp.current}
                onRefresh={loadComments}
                showToast={showToast}
                depth={0}
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
   RELATED POSTS
══════════════════════════════════════════════ */
function RelatedPosts({ posts }) {
  if (!posts?.length) return null;

  return (
    <section className="np-related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="np-related-title">Related News</h2>
      <div className="np-related-grid">
        {posts.map(p => (
          <Link key={p.id} href={`/news/${p.slug}`} className="np-related-card">
            <div className="np-related-img">
              {p.cover_image_url ? (
                <Image
                  src={p.cover_image_url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 220px"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <span aria-hidden="true" style={{ fontSize: "1.8rem" }}>📰</span>
              )}
            </div>
            <div className="np-related-text">
              <h3 style={{
                fontSize: "0.85rem",
                color: "var(--navy)",
                margin: "0 0 4px",
                fontWeight: 700,
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>{p.title}</h3>
              <span>{p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   COVER IMAGE DOWNLOAD
══════════════════════════════════════════════ */
function CoverDownloadBtn({ src, title }) {
  const handleDownload = async () => {
    try {
      const res  = await fetch(src);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  return (
    <button
      className="np-cover-dl"
      onClick={handleDownload}
      aria-label="Download cover image"
      title="Download cover image"
    >
      <span aria-hidden="true">⬇</span> Save Image
    </button>
  );
}

/* ══════════════════════════════════════════════
   MAIN CLIENT COMPONENT — FIXED
   Props: post (full row), related (array)
══════════════════════════════════════════════ */
export default function NewsPageClient({ post, related }) {
  const [isMounted, setIsMounted] = useState(false);
  
  /* Track view once per session */
  useEffect(() => {
    if (!post?.id) return;
    const key = `np_viewed_${post.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      Promise.resolve(supabase.rpc("news_increment_view", { p_post_id: post.id })).catch(() => {});
    }
    
    setIsMounted(true);
  }, [post?.id]);

  /* Derived */
  const rt       = readTime(post?.content || post?.excerpt || "");
  const postTags = post?.tags || [];
  const pCat     = postTags.find(t => KNOWN_CATS.includes(t));
  const isBreaking = postTags.includes("breaking");
  const displayTags = postTags.filter(t => !KNOWN_CATS.includes(t) && t !== "breaking");

  /* TOC — client side only (needs DOM parser) — FIXED */
  const [headings,      setHeadings]      = useState([]);
  const [processedHtml, setProcessedHtml] = useState(post?.content || "");
  const [contentReady,  setContentReady]  = useState(false);

  useEffect(() => {
    if (!post?.content || !isMounted) return;
    
    // Process on next tick to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        const withIds = injectHeadingIds(post.content);
        setProcessedHtml(withIds);
        setHeadings(extractHeadings(withIds));
      } catch (e) {
        console.warn("Content processing failed:", e);
        setProcessedHtml(post.content);
        setHeadings([]);
      }
      setContentReady(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [post?.content, isMounted]);

  /* Urdu/Arabic detection */
  const isRTL = /[\u0600-\u06FF\u0750-\u077F]/.test(post?.title || "");

  // Show loading state during content processing
  if (!contentReady && isMounted) {
    return (
      <div className="np-root">
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "400px",
          flexDirection: "column",
          gap: "16px"
        }} aria-busy="true">
          <div className="skel-bg" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressBar />

      <div className="np-root">
        <div className="np-orbs" aria-hidden="true">
          <div className="np-orb-1" /><div className="np-orb-2" />
        </div>

        <main className="np-container">

          {/* ── Back link ── */}
          <Link href="/news" className="np-back" aria-label="Back to all news">
            <span aria-hidden="true">←</span> All News
          </Link>

          <article className="np-article" itemScope itemType="https://schema.org/NewsArticle">

            {/* ── Cover image ── */}
            {post.cover_image_url ? (
              <div className="np-cover-wrap">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 860px) 100vw, 860px"
                  style={{ objectFit: "cover" }}
                  itemProp="image"
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 55%, rgba(11,20,55,0.3) 100%)",
                  zIndex: 1,
                }} aria-hidden="true" />
                <CoverDownloadBtn src={post.cover_image_url} title={post.title} />
              </div>
            ) : (
              <div className="np-cover-wrap">
                <div className="np-cover-ph" aria-hidden="true">📰</div>
              </div>
            )}

            {/* ── Article body ── */}
            <div className="np-body">

              {/* Badges row */}
              <div style={{ marginBottom: 8 }}>
                <span className="np-label">News</span>
                <span className="np-readtime" aria-label={`${rt} minute read`}>
                  <span aria-hidden="true">⏱</span> {rt} min read
                </span>
                {isBreaking && (
                  <span className="np-breaking-badge" aria-label="Breaking news">
                    🔴 Breaking
                  </span>
                )}
                {pCat && (
                  <span
                    className="np-cat-badge"
                    style={{
                      background: `${CAT_COLORS[pCat]}15`,
                      color:       CAT_COLORS[pCat],
                      border:      `1px solid ${CAT_COLORS[pCat]}28`,
                    }}
                  >{CAT_LABELS[pCat]}</span>
                )}
              </div>

              {/* Title — H1, clean text for crawlers */}
              <h1
                className={`np-title${isRTL ? " urdu" : ""}`}
                itemProp="headline"
                lang={isRTL ? "ur" : "en"}
              >
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="np-meta">
                <div className="np-author">
                  <div className="np-author-icon" aria-hidden="true">✍</div>
                  <span itemProp="author">AIDLA News Desk · Education updates team</span>
                </div>
                <div className="np-dot" aria-hidden="true" />
                {post.published_at && (
                  <span className="np-date-pill">
                    <time dateTime={post.published_at} itemProp="datePublished">
                      {formatDate(post.published_at)}
                    </time>
                  </span>
                )}
                {post.updated_at && post.updated_at !== post.published_at && (
                  <>
                    <div className="np-dot" aria-hidden="true" />
                    <span className="np-stat-text">
                      Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                    </span>
                  </>
                )}
                <div className="np-dot" aria-hidden="true" />
                <span className="np-stat-text">👁 {(post.view_count || 0).toLocaleString()} views</span>
              </div>

              {/* Tags */}
              {displayTags.length > 0 && (
                <div className="np-tags" aria-label="Article tags">
                  {displayTags.map(t => (
                    <span key={t} className="np-tag">#{t}</span>
                  ))}
                </div>
              )}

              {/* Excerpt / lead */}
              {post.excerpt && (
                <blockquote className="np-excerpt" itemProp="description">
                  {post.excerpt}
                </blockquote>
              )}

              {/* Table of contents */}
              {headings.length >= 3 && <TOC headings={headings} />}

              <div className="np-divider" aria-hidden="true" />

              {/* Article content — dangerouslySetInnerHTML is necessary for rich CMS content */}
              {processedHtml ? (
                <div
                  className="np-content"
                  itemProp="articleBody"
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              ) : post.excerpt ? (
                <div className="np-content" itemProp="articleBody">
                  <p>{post.excerpt}</p>
                </div>
              ) : null}

            </div>

            {/* ── Engagement bar ── */}
            <EngageBar post={post} />

            {/* ── Related posts ── */}
            <div style={{ padding: "0 16px" }}>
              <RelatedPosts posts={related} />
            </div>

            {/* ── Footer CTA ── */}
            <div className="np-footer-cta">
              <p className="np-footer-cta-text">Want more news like this?</p>
              <Link href="/news" className="np-back-btn">
                <span aria-hidden="true">←</span> Browse All News
              </Link>
            </div>

          </article>

          {/* ── Comments ── */}
          <CommentsSection postId={post.id} />

        </main>
      </div>
    </>
  );
}
