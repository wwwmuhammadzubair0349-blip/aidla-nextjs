"use client";
// app/user/forum/page.jsx
// AIDLA Discussion Forum — Reddit-inspired, educational, mobile-first

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ── Constants ──────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "zkafridi317@gmail.com";
const PAGE_SIZE = 15;

const CATEGORIES = [
  { id: "all",          label: "All",          emoji: "🌐" },
  { id: "General",      label: "General",      emoji: "💬" },
  { id: "Study Help",   label: "Study Help",   emoji: "📚" },
  { id: "Math",         label: "Math",         emoji: "➗" },
  { id: "Science",      label: "Science",      emoji: "🔬" },
  { id: "English",      label: "English",      emoji: "📝" },
  { id: "Career",       label: "Career",       emoji: "💼" },
  { id: "Tech",         label: "Tech",         emoji: "💻" },
  { id: "Announcements",label: "Announcements",emoji: "📢" },
  { id: "Off-Topic",    label: "Off-Topic",    emoji: "🎉" },
];

const REPORT_REASONS = [
  "Spam or misleading", "Harassment or bullying", "Hate speech",
  "Sexual content", "Violence", "Misinformation", "Other",
];

const RANKS = [
  { key: "learner", label: "Learner", icon: "🌱", color: "#059669", bg: "#ECFDF5" },
  { key: "achiever", label: "Achiever", icon: "⭐", color: "#D97706", bg: "#FFFBEB" },
  { key: "champion", label: "Champion", icon: "🔥", color: "#DC2626", bg: "#FEF2F2" },
  { key: "ambassador", label: "Ambassador", icon: "💎", color: "#7C3AED", bg: "#F5F3FF" },
  { key: "legend", label: "Legend", icon: "👑", color: "#B45309", bg: "#FFFBEB" },
];

const BANNED_WORDS = [
  "fuck", "shit", "ass", "bitch", "bastard", "dick", "pussy", "cock", "nigger", "faggot",
  "whore", "slut", "rape", "kill yourself", "kys", "sex", "nude", "naked", "porn",
  "xxx", "boobs", "penis", "vagina", "harassment", "abuse",
  "madarchod", "bhenchod", "gaand", "lund", "chutiya", "harami", "kamina", "randi",
];

function containsBanned(text) {
  if (!text) return false;
  return BANNED_WORDS.some(w => text.toLowerCase().includes(w));
}
function containsPhone(text) {
  if (!text) return false;
  return /(\+?92|0)?[\s.-]?3[0-9]{2}[\s.-]?[0-9]{7}|(\d[\s.-]?){10,}/.test(text);
}
function validateContent(text) {
  if (containsBanned(text)) return "Your post contains inappropriate content.";
  if (containsPhone(text)) return "Phone numbers are not allowed.";
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)     return "just now";
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Posts are stored as "TITLE\n\nBODY" — first line is title, rest is body
function parsePost(content) {
  if (!content) return { title: "", body: "" };
  const idx = content.indexOf("\n\n");
  if (idx === -1) return { title: content.trim(), body: "" };
  return { title: content.slice(0, idx).trim(), body: content.slice(idx + 2).trim() };
}

function Avatar({ profile, size = 34 }) {
  const initials = profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (profile?.avatar_url) return (
    <Image src={profile.avatar_url} alt={profile.full_name || "User"} width={size} height={size} unoptimized
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "#eff6ff", border: "1px solid rgba(59,130,246,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#1e3a8a", fontWeight: 700, fontSize: size * 0.36,
    }}>{initials}</div>
  );
}

function BlueTick() {
  return (
    <span title="Verified" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 14, height: 14, borderRadius: "50%",
      background: "#1d9bf0", marginLeft: 3, flexShrink: 0,
    }}>
      <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  );
}

function RankBadge({ profile }) {
  const rank = RANKS.find(r => r.key === profile?.rank) || RANKS[0];
  return (
    <span className="fr-rank-badge" style={{ background: rank.bg, color: rank.color }}>
      {rank.icon} {rank.label}
    </span>
  );
}

function ProfileLink({ userId, children, className }) {
  if (!userId) return <span className={className}>{children}</span>;
  return <Link href={`/user/profile/${userId}`} className={className}>{children}</Link>;
}

function CategoryBadge({ cat }) {
  const found = CATEGORIES.find(c => c.id === cat);
  if (!found || cat === "all") return null;
  return (
    <span className="fr-cat-badge">{found.emoji} {found.label}</span>
  );
}

// ── Report Modal ───────────────────────────────────────────────────────────
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  return (
    <div className="fr-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fr-modal" onClick={e => e.stopPropagation()}>
        <div className="fr-modal-title">🚩 Report Post</div>
        <p className="fr-modal-sub">Select a reason. Our team will review it within 24 h.</p>
        <div className="fr-report-reasons">
          {REPORT_REASONS.map(r => (
            <button key={r} className={`fr-reason-btn${reason === r ? " active" : ""}`}
              onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
        {reason === "Other" && (
          <textarea className="fr-modal-textarea" placeholder="Describe the issue…"
            value={custom} onChange={e => setCustom(e.target.value)} rows={3} maxLength={300} />
        )}
        <div className="fr-modal-actions">
          <button className="fr-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="fr-modal-confirm"
            disabled={!reason || (reason === "Other" && !custom.trim())}
            onClick={() => onSubmit(reason === "Other" ? custom.trim() : reason)}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comment ────────────────────────────────────────────────────────────────
function Comment({ c, currentUserId, isAdmin, postOwnerId, onDelete }) {
  const canDelete = isAdmin || currentUserId === c.user_id || currentUserId === postOwnerId;
  const isAdminComment = c.profiles?.email === ADMIN_EMAIL;
  const showTick = isAdminComment || c.profiles?.is_verified;

  return (
    <div className="fr-comment">
      <ProfileLink userId={c.user_id} className="fr-author-link">
        <Avatar profile={c.profiles} size={26} />
      </ProfileLink>
      <div className="fr-comment-body">
        <div className="fr-comment-header">
          <ProfileLink userId={c.user_id} className="fr-comment-name">
            {isAdminComment ? "AIDLA_Official" : (c.profiles?.full_name || "User")}
            {showTick && <BlueTick />}
          </ProfileLink>
          <RankBadge profile={c.profiles} />
          <span className="fr-comment-time">{timeAgo(c.created_at)}</span>
          {canDelete && (
            <button className="fr-comment-del" onClick={() => onDelete(c.id)} aria-label="Delete comment">🗑</button>
          )}
        </div>
        <p className="fr-comment-text">{c.content}</p>
      </div>
    </div>
  );
}

// ── Thread Card ────────────────────────────────────────────────────────────
function ThreadCard({ post, currentUserId, currentProfile, isAdmin, onDelete }) {
  const [comments, setComments]           = useState([]);
  const [showComments, setShowComments]   = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [commentCount, setCommentCount]   = useState(post.comment_count || 0);
  const [upvotes, setUpvotes]             = useState(post.upvote_count || 0);
  const [upvoted, setUpvoted]             = useState(post.user_upvoted || false);
  const [posting, setPosting]             = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [reportTarget, setReportTarget]   = useState(null);
  const [reportDone, setReportDone]       = useState(false);
  const menuRef = useRef(null);

  const isOwner     = currentUserId === post.user_id;
  const isAdminPost = post.profiles?.email === ADMIN_EMAIL;
  const showTick    = isAdminPost || post.profiles?.is_verified;
  const displayName = isAdminPost ? "AIDLA_Official" : (post.profiles?.full_name || "User");
  const { title, body } = parsePost(post.content);
  const category    = post.feeling || "General";

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleUpvote = async () => {
    if (!currentUserId) return;
    const next = !upvoted;
    setUpvoted(next);
    setUpvotes(v => next ? v + 1 : Math.max(v - 1, 0));
    if (next) {
      await supabase.from("feed_reactions").upsert(
        { post_id: post.id, user_id: currentUserId, reaction_type: "like" },
        { onConflict: "post_id,user_id" }
      );
    } else {
      await supabase.from("feed_reactions").delete()
        .eq("post_id", post.id).eq("user_id", currentUserId);
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from("feed_comments").select("*")
      .eq("post_id", post.id).eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (!data || data.length === 0) { setComments([]); return; }
    const ids = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
      .from("users_profiles").select("user_id,full_name,avatar_url,email,is_verified,rank").in("user_id", ids);
    const map = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
    setComments(data.map(c => ({ ...c, profiles: map[c.user_id] || null })));
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) await loadComments();
    setShowComments(p => !p);
  };

  const handleComment = async () => {
    if (!commentText.trim() || posting) return;
    const err = validateContent(commentText);
    if (err) { alert(err); return; }
    setPosting(true);
    const { data, error } = await supabase.from("feed_comments")
      .insert({ post_id: post.id, user_id: currentUserId, content: commentText.trim() })
      .select("*").single();
    if (!error && data) {
      setComments(p => [...p, { ...data, profiles: currentProfile }]);
      setCommentCount(c => c + 1);
      setCommentText("");
      setShowComments(true);
    }
    setPosting(false);
  };

  const handleDeleteComment = async (id) => {
    await supabase.from("feed_comments").delete().eq("id", id);
    setComments(p => p.filter(c => c.id !== id));
    setCommentCount(c => Math.max(c - 1, 0));
  };

  const handleReport = async (reason) => {
    await supabase.from("feed_reports").insert({
      reporter_id: currentUserId,
      post_id: reportTarget?.id || null,
      reason,
    });
    setReportTarget(null);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 3000);
  };

  return (
    <article className={`fr-thread${post.is_pinned ? " fr-pinned" : ""}`}>
      {reportTarget && <ReportModal onClose={() => setReportTarget(null)} onSubmit={handleReport} />}
      {reportDone && <div className="fr-toast" role="status">✅ Reported. Thank you!</div>}

      {/* Left: upvote column */}
      <div className="fr-vote-col">
        <button
          className={`fr-upvote-btn${upvoted ? " fr-upvoted" : ""}`}
          onClick={handleUpvote}
          aria-label={upvoted ? "Remove upvote" : "Upvote"}
          aria-pressed={upvoted}
        >▲</button>
        <span className={`fr-vote-count${upvoted ? " fr-upvoted-count" : ""}`}>{upvotes}</span>
      </div>

      {/* Right: content */}
      <div className="fr-thread-body">
        {post.is_pinned && <span className="fr-pin-badge">📌 Pinned</span>}

        <div className="fr-thread-meta-top">
          <CategoryBadge cat={category} />
          <span className="fr-meta-sep">·</span>
          <ProfileLink userId={post.user_id} className="fr-author-link">
            <Avatar profile={post.profiles} size={16} />
          </ProfileLink>
          <ProfileLink userId={post.user_id} className="fr-author-name">
            {isAdminPost ? "AIDLA_Official" : displayName}
            {showTick && <BlueTick />}
          </ProfileLink>
          <RankBadge profile={post.profiles} />
          <span className="fr-meta-sep">·</span>
          <span className="fr-time">{timeAgo(post.created_at)}</span>

          {/* Menu */}
          <div className="fr-menu-wrap" ref={menuRef} style={{ marginLeft: "auto" }}>
            <button className="fr-dot-btn" onClick={() => setMenuOpen(p => !p)} aria-label="Options">⋯</button>
            {menuOpen && (
              <div className="fr-dropdown" role="menu">
                {(isOwner || isAdmin) && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onDelete(post.id); }}>🗑 Delete</button>
                )}
                {!isOwner && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); setReportTarget({ id: post.id }); }}>🚩 Report</button>
                )}
                <button role="menuitem" onClick={() => {
                  setMenuOpen(false);
                  navigator.clipboard.writeText(`${window.location.origin}/user/forum`).catch(() => {});
                  alert("Link copied! 🔗");
                }}>🔗 Copy Link</button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="fr-thread-title">{title || "(No title)"}</h3>

        {/* Body excerpt */}
        {body && <p className="fr-thread-excerpt">{body}</p>}

        {/* Actions row */}
        <div className="fr-actions-row">
          <button className="fr-action-pill" onClick={toggleComments} aria-expanded={showComments}>
            💬 {commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}` : "Comment"}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="fr-comments-section">
            {comments.length === 0 && (
              <p className="fr-no-comments">No replies yet. Be the first!</p>
            )}
            {comments.map(c => (
              <Comment key={c.id} c={c}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                postOwnerId={post.user_id}
                onDelete={handleDeleteComment} />
            ))}
            {currentUserId && (
              <div className="fr-comment-input-row">
                <label htmlFor={`reply-${post.id}`} className="fr-sr-only">Write a reply</label>
                <input
                  id={`reply-${post.id}`}
                  className="fr-comment-input"
                  placeholder="Write a reply…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                  maxLength={500}
                />
                <button className="fr-comment-send" onClick={handleComment}
                  disabled={!commentText.trim() || posting} aria-label="Send reply">
                  ➤
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── New Thread Compose ─────────────────────────────────────────────────────
function NewThreadModal({ profile, userId, isAdmin, onPosted, onClose }) {
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [category, setCategory] = useState("General");
  const [error, setError]       = useState("");
  const [posting, setPosting]   = useState(false);

  const displayName = isAdmin ? "AIDLA_Official" : (profile?.full_name || "You");

  const handlePost = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    const fullContent = body.trim() ? `${title.trim()}\n\n${body.trim()}` : title.trim();
    const err = validateContent(fullContent);
    if (err) { setError(err); return; }
    setPosting(true); setError("");
    const { data, error: dbErr } = await supabase.from("feed_posts")
      .insert({
        user_id: userId,
        content: fullContent,
        feeling: category,
        location: null,
        repost_of: null,
      })
      .select("*").single();
    if (dbErr) {
      setError(dbErr.message || "Failed to post.");
    } else {
      onPosted({ ...data, profiles: profile, upvote_count: 0, comment_count: 0, user_upvoted: false });
      onClose();
    }
    setPosting(false);
  };

  return (
    <div className="fr-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="New thread">
      <div className="fr-compose-modal" onClick={e => e.stopPropagation()}>
        <div className="fr-compose-modal-header">
          <div className="fr-compose-modal-title-row">
            <Avatar profile={profile} size={32} />
            <div>
              <span className="fr-compose-author">{displayName}{(isAdmin || profile?.is_verified) && <BlueTick />}</span>
              <RankBadge profile={profile} />
              <span className="fr-compose-sub">Starting a discussion</span>
            </div>
          </div>
          <button className="fr-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="fr-compose-form">
          <label className="fr-label" htmlFor="thread-category">Category</label>
          <select id="thread-category" className="fr-select"
            value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.filter(c => c.id !== "all").map(c => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>

          <label className="fr-label" htmlFor="thread-title">Title <span className="fr-required">*</span></label>
          <input
            id="thread-title"
            className="fr-title-input"
            placeholder="What's your question or topic?"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(""); }}
            maxLength={150}
            autoFocus
          />
          <span className="fr-char-count">{title.length}/150</span>

          <label className="fr-label" htmlFor="thread-body">Details (optional)</label>
          <textarea
            id="thread-body"
            className="fr-body-textarea"
            placeholder="Add more context, details or ask your full question here…"
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={2000}
            rows={5}
          />
          <span className="fr-char-count">{body.length}/2000</span>

          {error && <div className="fr-compose-error" role="alert">⚠️ {error}</div>}
        </div>

        <div className="fr-compose-modal-footer">
          <button className="fr-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="fr-post-btn" onClick={handlePost}
            disabled={posting || !title.trim()} aria-busy={posting}>
            {posting ? "Posting…" : "Post Thread"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Forum ─────────────────────────────────────────────────────────────
export default function Forum() {
  const [profile, setProfile]         = useState(null);
  const [userId, setUserId]           = useState(null);
  const [userEmail, setUserEmail]     = useState(null);
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [hasMore, setHasMore]         = useState(false);
  const [page, setPage]               = useState(0);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const loaderRef    = useRef(null);
  const userIdRef    = useRef(null);

  const isAdmin = userEmail === ADMIN_EMAIL;

  const doLoadPosts = useCallback(async (pageNum, replace, uid) => {
    if (replace) setLoading(true); else setFetchingMore(true);
    const from = pageNum * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    let query = supabase.from("feed_posts").select("*")
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (activeCategory !== "all") {
      query = query.eq("feeling", activeCategory);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const postIds = data.map(p => p.id);
      const userIds = [...new Set(data.map(p => p.user_id))];

      const { data: profileRows } = await supabase
        .from("users_profiles").select("user_id,full_name,avatar_url,email,is_verified,rank").in("user_id", userIds);
      const profileMap = Object.fromEntries((profileRows || []).map(p => [p.user_id, p]));

      // Upvote counts
      const { data: allReactions } = await supabase
        .from("feed_reactions").select("post_id,reaction_type").in("post_id", postIds);
      const upvoteMap = {};
      (allReactions || []).forEach(r => {
        if (r.reaction_type === "like") upvoteMap[r.post_id] = (upvoteMap[r.post_id] || 0) + 1;
      });

      // User's upvotes
      let userUpvoteMap = {};
      if (uid) {
        const { data: myReactions } = await supabase
          .from("feed_reactions").select("post_id").eq("user_id", uid).eq("reaction_type", "like").in("post_id", postIds);
        (myReactions || []).forEach(r => { userUpvoteMap[r.post_id] = true; });
      }

      // Comment counts
      const { data: commentCounts } = await supabase
        .from("feed_comments").select("post_id").eq("is_deleted", false).in("post_id", postIds);
      const commentMap = {};
      (commentCounts || []).forEach(c => { commentMap[c.post_id] = (commentMap[c.post_id] || 0) + 1; });

      const enriched = data.map(p => ({
        ...p,
        profiles:     profileMap[p.user_id] || null,
        upvote_count: upvoteMap[p.id] || 0,
        comment_count: commentMap[p.id] || 0,
        user_upvoted:  userUpvoteMap[p.id] || false,
      }));

      setPosts(prev => replace ? enriched : [...prev, ...enriched]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } else {
      if (replace) setPosts([]);
      setHasMore(false);
    }

    if (replace) setLoading(false); else setFetchingMore(false);
  }, [activeCategory]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { doLoadPosts(0, true, null); return; }
      setUserId(user.id);
      setUserEmail(user.email);
      userIdRef.current = user.id;
      const { data: p } = await supabase.from("users_profiles")
        .select("user_id,full_name,avatar_url,email,is_verified,rank").eq("user_id", user.id).single();
      if (p) setProfile(p);
      doLoadPosts(0, true, user.id);
    })();
  }, [doLoadPosts]);

  const loadPosts = useCallback((pageNum, replace) => {
    doLoadPosts(pageNum, replace, userIdRef.current);
  }, [doLoadPosts]);

  const hasMoreRef       = useRef(hasMore);
  const isFetchingRef    = useRef(fetchingMore);
  const pageRef          = useRef(page);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isFetchingRef.current = fetchingMore; }, [fetchingMore]);
  useEffect(() => { pageRef.current = page; }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || isFetchingRef.current || !hasMoreRef.current) return;
      loadPosts(pageRef.current + 1, false);
    }, { rootMargin: "200px", threshold: 0 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadPosts]);

  const handlePosted = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this thread?")) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    await supabase.from("feed_posts").update({ is_deleted: true }).eq("id", postId);
  };

  return (
    <div className="fr-root">
      <style>{CSS}</style>

      {/* Header */}
      <div className="fr-header">
        <div className="fr-header-left">
          <h1 className="fr-title">💬 Community Forum</h1>
          <p className="fr-subtitle">Ask questions, share knowledge, help each other</p>
        </div>
        {userId && (
          <button className="fr-new-thread-btn" onClick={() => setShowCompose(true)}>
            + New Thread
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="fr-categories" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`fr-cat-tab${activeCategory === cat.id ? " active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="fr-threads" aria-label="Discussion threads" aria-live="polite">
        {loading ? (
          <div className="fr-loading">
            <div className="fr-spinner" aria-hidden="true" />
            <span>Loading threads…</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="fr-empty">
            <div className="fr-empty-icon">💬</div>
            <p>No threads yet in this category.</p>
            {userId && (
              <button className="fr-start-btn" onClick={() => setShowCompose(true)}>Start a discussion</button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <ThreadCard
              key={post.id}
              post={post}
              currentUserId={userId}
              currentProfile={profile}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))
        )}

        {fetchingMore && (
          <div className="fr-loading">
            <div className="fr-spinner" aria-hidden="true" />
            <span>Loading more…</span>
          </div>
        )}

        {!loading && !fetchingMore && !hasMore && posts.length > 0 && (
          <div className="fr-end">You&apos;ve seen all threads ✓</div>
        )}
      </div>

      {hasMore && <div ref={loaderRef} style={{ height: 20 }} aria-hidden="true" />}

      {/* New thread modal */}
      {showCompose && (
        <NewThreadModal
          profile={profile}
          userId={userId}
          isAdmin={isAdmin}
          onPosted={handlePosted}
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
  .fr-root {
    max-width: 780px;
    margin: 0 auto;
    font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    padding: 0 12px 48px;
  }

  /* Header */
  .fr-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 0 12px;
    flex-wrap: wrap;
  }
  .fr-header-left { flex: 1; min-width: 0; }
  .fr-title {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 2px;
    letter-spacing: -0.3px;
  }
  .fr-subtitle {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }
  .fr-new-thread-btn {
    padding: 9px 18px;
    border-radius: 10px;
    border: none;
    background: #1e3a8a;
    color: #fff;
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: background-color 0.15s;
    flex-shrink: 0;
  }
  .fr-new-thread-btn:hover { background: #1e40af; }

  /* Category tabs */
  .fr-categories {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-bottom: 10px;
  }
  .fr-categories::-webkit-scrollbar { display: none; }
  .fr-cat-tab {
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: 100px;
    border: 1.5px solid rgba(15,23,42,0.08);
    background: #ffffff;
    color: #475569;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .fr-cat-tab:hover { background: #f1f5f9; border-color: rgba(59,130,246,0.2); }
  .fr-cat-tab.active {
    background: #1e3a8a;
    color: #fff;
    border-color: #1e3a8a;
  }

  /* Thread card */
  .fr-thread {
    display: flex;
    gap: 10px;
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 8px;
    position: relative;
    transition: border-color 0.15s, box-shadow 0.15s;
    animation: frIn 0.18s ease both;
  }
  @keyframes frIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fr-thread:hover {
    border-color: rgba(59,130,246,0.12);
    box-shadow: 0 2px 8px rgba(59,130,246,0.04);
  }
  .fr-pinned { border-color: rgba(245,158,11,0.2); }

  /* Vote column */
  .fr-vote-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    width: 36px;
    padding-top: 2px;
  }
  .fr-upvote-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #94a3b8;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.15s, background-color 0.15s;
    line-height: 1;
    font-family: inherit;
  }
  .fr-upvote-btn:hover, .fr-upvote-btn.fr-upvoted {
    color: #f97316;
    background: rgba(249,115,22,0.06);
  }
  .fr-vote-count {
    font-size: 0.76rem;
    font-weight: 700;
    color: #64748b;
    line-height: 1;
  }
  .fr-upvoted-count { color: #f97316; }

  /* Thread body */
  .fr-thread-body { flex: 1; min-width: 0; }

  .fr-pin-badge {
    display: inline-block;
    margin-bottom: 5px;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.15);
    font-size: 0.68rem;
    font-weight: 700;
    color: #b45309;
  }

  .fr-thread-meta-top {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 5px;
    font-size: 0.72rem;
    color: #64748b;
  }
  .fr-meta-sep { color: #cbd5e1; }
  .fr-author-name {
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 2px;
    text-decoration: none;
  }
  .fr-author-link { display: inline-flex; align-items: center; flex-shrink: 0; text-decoration: none; color: inherit; }
  .fr-author-name:hover, .fr-comment-name:hover { color: #1e3a8a; text-decoration: underline; }
  .fr-rank-badge {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 2px 6px; border-radius: 999px;
    font-size: 0.6rem; font-weight: 900;
    border: 1px solid rgba(15,23,42,.06);
    white-space: nowrap;
  }
  .fr-time { color: #94a3b8; }

  .fr-cat-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(30,58,138,0.05);
    border: 1px solid rgba(30,58,138,0.1);
    color: #1e3a8a;
    font-size: 0.68rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .fr-thread-title {
    font-size: 0.97rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
    line-height: 1.4;
    letter-spacing: -0.1px;
    word-break: break-word;
  }
  .fr-thread-excerpt {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.5;
    margin: 0 0 8px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    word-break: break-word;
  }

  .fr-actions-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .fr-action-pill {
    padding: 5px 10px;
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.07);
    background: transparent;
    color: #64748b;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.15s;
  }
  .fr-action-pill:hover { background: #f1f5f9; }

  /* Menu */
  .fr-menu-wrap { position: relative; }
  .fr-dot-btn {
    background: none; border: none; cursor: pointer;
    color: #94a3b8; font-size: 1rem; padding: 3px 5px;
    border-radius: 6px; transition: background-color 0.15s;
    font-family: inherit;
  }
  .fr-dot-btn:hover { background: rgba(15,23,42,0.04); color: #475569; }
  .fr-dropdown {
    position: absolute; top: calc(100% + 2px); right: 0; z-index: 50;
    background: #fff; border: 1px solid rgba(15,23,42,0.06);
    border-radius: 10px; padding: 4px;
    box-shadow: 0 6px 20px rgba(15,23,42,0.07);
    min-width: 140px;
    animation: frDrop 0.1s ease;
  }
  @keyframes frDrop {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
  .fr-dropdown button {
    display: block; width: 100%; text-align: left;
    padding: 7px 10px; border: none; background: transparent;
    font-size: 0.76rem; font-weight: 600; color: #334155;
    border-radius: 7px; cursor: pointer;
    transition: background-color 0.1s; font-family: inherit;
  }
  .fr-dropdown button:hover { background: rgba(15,23,42,0.03); }

  /* Comments */
  .fr-comments-section {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(15,23,42,0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .fr-no-comments { font-size: 0.76rem; color: #94a3b8; font-weight: 500; margin: 0; }
  .fr-comment { display: flex; gap: 7px; align-items: flex-start; }
  .fr-comment-body { flex: 1; min-width: 0; }
  .fr-comment-header {
    display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-bottom: 2px;
  }
  .fr-comment-name {
    font-weight: 700; font-size: 0.76rem; color: #0f172a;
    display: flex; align-items: center; gap: 2px;
    text-decoration: none;
  }
  .fr-comment-time { font-size: 0.66rem; color: #94a3b8; font-weight: 500; }
  .fr-comment-del {
    background: none; border: none; cursor: pointer;
    font-size: 0.7rem; color: #cbd5e1; padding: 2px 4px;
    border-radius: 4px; transition: color 0.15s; margin-left: auto;
    font-family: inherit;
  }
  .fr-comment-del:hover { color: #ef4444; }
  .fr-comment-text {
    font-size: 0.81rem; color: #334155; line-height: 1.45; margin: 0; word-break: break-word;
  }
  .fr-comment-input-row { display: flex; gap: 6px; align-items: center; margin-top: 4px; }
  .fr-comment-input {
    flex: 1; padding: 7px 12px; border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.08); background: #f8fafc;
    font-family: inherit; font-size: 0.8rem; color: #0f172a; outline: none;
    transition: border-color 0.15s;
  }
  .fr-comment-input:focus { border-color: rgba(59,130,246,0.25); background: #fff; }
  .fr-comment-send {
    width: 30px; height: 30px; border-radius: 50%;
    border: none; background: #1e3a8a; color: #fff;
    font-size: 0.75rem; cursor: pointer; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background-color 0.15s; font-family: inherit;
  }
  .fr-comment-send:hover:not(:disabled) { background: #1e40af; }
  .fr-comment-send:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Compose modal */
  .fr-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,23,42,0.25);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .fr-compose-modal {
    background: #fff; border-radius: 18px; width: 100%; max-width: 560px;
    box-shadow: 0 20px 60px rgba(15,23,42,0.12);
    animation: frModalIn 0.18s ease; display: flex; flex-direction: column; max-height: 90vh;
    overflow: hidden;
  }
  @keyframes frModalIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .fr-compose-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 18px 12px; border-bottom: 1px solid rgba(15,23,42,0.06);
    flex-shrink: 0;
  }
  .fr-compose-modal-title-row {
    display: flex; align-items: center; gap: 10px;
  }
  .fr-compose-author {
    display: flex; align-items: center; gap: 2px;
    font-weight: 700; font-size: 0.86rem; color: #0f172a;
  }
  .fr-compose-sub { display: block; font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
  .fr-close-btn {
    background: none; border: none; cursor: pointer;
    font-size: 1rem; color: #94a3b8; padding: 6px;
    border-radius: 8px; transition: background-color 0.15s; font-family: inherit;
  }
  .fr-close-btn:hover { background: rgba(15,23,42,0.04); color: #475569; }

  .fr-compose-form {
    padding: 14px 18px; overflow-y: auto; flex: 1;
    display: flex; flex-direction: column; gap: 4px;
  }
  .fr-label {
    font-size: 0.74rem; font-weight: 700; color: #475569; margin-top: 6px; display: block;
  }
  .fr-required { color: #ef4444; }
  .fr-select {
    width: 100%; padding: 8px 12px; border-radius: 10px;
    border: 1.5px solid rgba(15,23,42,0.08); background: #f8fafc;
    font-family: inherit; font-size: 0.84rem; color: #0f172a; outline: none;
    transition: border-color 0.15s; cursor: pointer;
  }
  .fr-select:focus { border-color: rgba(59,130,246,0.3); background: #fff; }
  .fr-title-input {
    width: 100%; padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid rgba(15,23,42,0.08); background: #f8fafc;
    font-family: inherit; font-size: 0.92rem; font-weight: 600; color: #0f172a; outline: none;
    box-sizing: border-box; transition: border-color 0.15s;
  }
  .fr-title-input:focus { border-color: rgba(59,130,246,0.3); background: #fff; }
  .fr-body-textarea {
    width: 100%; padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid rgba(15,23,42,0.08); background: #f8fafc;
    font-family: inherit; font-size: 0.86rem; color: #0f172a; outline: none;
    resize: vertical; min-height: 80px; box-sizing: border-box;
    line-height: 1.55; transition: border-color 0.15s;
  }
  .fr-body-textarea:focus { border-color: rgba(59,130,246,0.3); background: #fff; }
  .fr-char-count {
    font-size: 0.68rem; color: #94a3b8; font-weight: 500; text-align: right; display: block;
  }
  .fr-compose-error {
    font-size: 0.74rem; color: #dc2626; font-weight: 600;
    padding: 7px 10px; background: rgba(239,68,68,0.04);
    border: 1px solid rgba(239,68,68,0.08); border-radius: 8px;
  }
  .fr-compose-modal-footer {
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 12px 18px; border-top: 1px solid rgba(15,23,42,0.06); flex-shrink: 0;
  }
  .fr-cancel-btn {
    padding: 8px 16px; border-radius: 9px;
    border: 1px solid rgba(15,23,42,0.1); background: transparent;
    font-size: 0.82rem; font-weight: 600; color: #64748b;
    cursor: pointer; font-family: inherit; transition: background-color 0.15s;
  }
  .fr-cancel-btn:hover { background: #f8fafc; }
  .fr-post-btn {
    padding: 8px 20px; border-radius: 9px; border: none;
    background: #1e3a8a; color: #fff;
    font-size: 0.84rem; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: background-color 0.15s;
  }
  .fr-post-btn:hover:not(:disabled) { background: #1e40af; }
  .fr-post-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Report modal */
  .fr-modal {
    background: #fff; border-radius: 16px; padding: 20px 18px;
    max-width: 380px; width: 100%;
    box-shadow: 0 16px 48px rgba(15,23,42,0.1);
    animation: frModalIn 0.18s ease;
  }
  .fr-modal-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .fr-modal-sub { font-size: 0.78rem; color: #64748b; margin-bottom: 12px; }
  .fr-report-reasons { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .fr-reason-btn {
    padding: 6px 11px; border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.1); background: transparent;
    font-size: 0.74rem; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s; font-family: inherit;
  }
  .fr-reason-btn.active, .fr-reason-btn:hover {
    background: rgba(30,58,138,0.05); border-color: rgba(30,58,138,0.2); color: #1e3a8a;
  }
  .fr-modal-textarea {
    width: 100%; padding: 9px 11px; border-radius: 10px;
    border: 1px solid rgba(15,23,42,0.1); background: #f8fafc;
    font-family: inherit; font-size: 0.8rem; resize: none;
    box-sizing: border-box; outline: none; margin-bottom: 10px;
  }
  .fr-modal-actions { display: flex; gap: 7px; justify-content: flex-end; }
  .fr-modal-cancel {
    padding: 7px 16px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: transparent;
    font-size: 0.8rem; font-weight: 600; color: #64748b;
    cursor: pointer; transition: background-color 0.15s; font-family: inherit;
  }
  .fr-modal-cancel:hover { background: #f8fafc; }
  .fr-modal-confirm {
    padding: 7px 16px; border-radius: 8px; border: none;
    background: #dc2626; color: #fff;
    font-size: 0.8rem; font-weight: 700; cursor: pointer;
    transition: background-color 0.15s; font-family: inherit;
  }
  .fr-modal-confirm:hover:not(:disabled) { background: #b91c1c; }
  .fr-modal-confirm:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Toast */
  .fr-toast {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: #15803d; color: #fff; padding: 5px 14px;
    border-radius: 100px; font-size: 0.74rem; font-weight: 700;
    white-space: nowrap; z-index: 10;
  }

  /* Loading / empty / end */
  .fr-loading {
    display: flex; align-items: center; gap: 8px; justify-content: center;
    padding: 24px; color: #64748b; font-size: 0.8rem; font-weight: 600;
  }
  .fr-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(59,130,246,0.1); border-top-color: #3b82f6;
    animation: frSpin 0.7s linear infinite;
  }
  @keyframes frSpin { to { transform: rotate(360deg); } }
  .fr-empty {
    text-align: center; padding: 40px 16px; color: #94a3b8;
    font-size: 0.86rem; font-weight: 600;
  }
  .fr-empty-icon { font-size: 40px; margin-bottom: 8px; }
  .fr-start-btn {
    margin-top: 12px; padding: 9px 18px; border-radius: 10px;
    border: none; background: #1e3a8a; color: #fff;
    font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: background-color 0.15s;
  }
  .fr-start-btn:hover { background: #1e40af; }
  .fr-end {
    text-align: center; padding: 14px; color: #cbd5e1; font-size: 0.74rem; font-weight: 600;
  }

  /* Accessibility */
  .fr-sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  /* Responsive */
  @media (min-width: 480px) {
    .fr-root { padding: 0 16px 52px; }
    .fr-thread { padding: 16px; gap: 12px; }
    .fr-vote-col { width: 40px; }
  }
  @media (min-width: 640px) {
    .fr-root { padding: 0 20px 56px; }
    .fr-thread-title { font-size: 1.02rem; }
  }
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .fr-root { padding-bottom: calc(48px + env(safe-area-inset-bottom)); }
  }
`;
