"use client";
// app/user/feed/page.jsx
// Premium Community Feed — Facebook-style with reactions, compact compose, rich reposts

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ── Constants ──────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "zkafridi317@gmail.com";
const PAGE_SIZE = 10;

const FEELINGS = [
  "😊 Happy", "😂 Amused", "😍 Loved", "🥳 Excited", "😎 Cool",
  "😢 Sad", "😡 Angry", "😴 Tired", "🤔 Thoughtful", "🙏 Grateful",
  "💪 Motivated", "📚 Studying", "🎉 Celebrating", "❤️ Thankful", "😤 Frustrated",
  "😇 Blessed", "🤗 Hopeful", "😌 Relaxed", "🤪 Silly", "🥺 Worried",
  "😲 Surprised", "😏 Proud",
];

// ── Facebook-style Reactions ───────────────────────────────────────────────
const REACTIONS = {
  like:    { emoji: "👍", label: "Like",    color: "#2078f4" },
  love:    { emoji: "❤️", label: "Love",    color: "#f33e58" },
  care:    { emoji: "🫂", label: "Care",    color: "#f7b125" },
  haha:    { emoji: "😆", label: "Haha",    color: "#f7b125" },
  wow:     { emoji: "😮", label: "Wow",     color: "#f7b125" },
  sad:     { emoji: "😢", label: "Sad",     color: "#f7b125" },
  angry:   { emoji: "😡", label: "Angry",   color: "#e23237" },
};

const REACTION_ORDER = ["like", "love", "care", "haha", "wow", "sad", "angry"];

const BANNED_WORDS = [
  "fuck", "shit", "ass", "bitch", "bastard", "dick", "pussy", "cock", "nigger", "faggot",
  "whore", "slut", "rape", "kill yourself", "kys", "sex", "nude", "naked", "porn",
  "xxx", "boobs", "penis", "vagina", "harassment", "abuse",
  "madarchod", "bhenchod", "gaand", "lund", "chutiya", "harami", "kamina", "randi",
];

function containsBanned(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BANNED_WORDS.some(w => lower.includes(w));
}
function containsPhone(text) {
  if (!text) return false;
  return /(\+?92|0)?[\s.-]?3[0-9]{2}[\s.-]?[0-9]{7}|(\d[\s.-]?){10,}/.test(text);
}
function validateContent(text) {
  if (containsBanned(text)) return "Your message contains inappropriate content.";
  if (containsPhone(text)) return "Phone numbers are not allowed in posts or comments.";
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ profile, size = 38 }) {
  const initials = profile?.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  if (profile?.avatar_url) return (
    <img src={profile.avatar_url} alt={profile.full_name || "User avatar"}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
  return (
    <div aria-hidden="true" style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "#eff6ff", border: "1px solid rgba(59,130,246,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#1e3a8a", fontWeight: 700, fontSize: size * 0.34,
    }}>{initials}</div>
  );
}

function BlueTick() {
  return (
    <span title="AIDLA Official" aria-label="Verified" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 15, height: 15, borderRadius: "50%",
      background: "#1d9bf0", marginLeft: 3, flexShrink: 0,
    }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  );
}

// ── Reaction Picker ────────────────────────────────────────────────────────
function ReactionPicker({ onSelect, onClose }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="fd-reaction-picker" onMouseLeave={onClose}>
      {REACTION_ORDER.map(key => (
        <button
          key={key}
          className={`fd-reaction-emoji${hovered === key ? " fd-reaction-hovered" : ""}`}
          onClick={() => onSelect(key)}
          onMouseEnter={() => setHovered(key)}
          aria-label={REACTIONS[key].label}
          title={REACTIONS[key].label}
        >
          <span>{REACTIONS[key].emoji}</span>
          {hovered === key && (
            <span className="fd-reaction-tooltip">{REACTIONS[key].label}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Report Modal ───────────────────────────────────────────────────────────
const REPORT_REASONS = [
  "Spam or misleading", "Harassment or bullying", "Hate speech",
  "Sexual content", "Violence", "Misinformation", "Other",
];

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  return (
    <div className="fd-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Report content">
      <div className="fd-modal" onClick={e => e.stopPropagation()}>
        <div className="fd-modal-title">🚩 Report Content</div>
        <p className="fd-modal-sub">Select a reason. Our team will review it.</p>
        <div className="fd-report-reasons" role="radiogroup" aria-label="Report reason">
          {REPORT_REASONS.map(r => (
            <button key={r} className={`fd-reason-btn${reason === r ? " active" : ""}`}
              onClick={() => setReason(r)} aria-pressed={reason === r}>{r}</button>
          ))}
        </div>
        {reason === "Other" && (
          <textarea className="fd-modal-textarea" placeholder="Describe the issue…"
            value={custom} onChange={e => setCustom(e.target.value)} rows={3} maxLength={300}
            aria-label="Describe the issue" />
        )}
        <div className="fd-modal-actions">
          <button className="fd-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="fd-modal-confirm fd-modal-report"
            disabled={!reason || (reason === "Other" && !custom.trim())}
            onClick={() => onSubmit(reason === "Other" ? custom.trim() : reason)}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comment ────────────────────────────────────────────────────────────────
function Comment({ c, currentUserId, isAdmin, postOwnerId, onDelete, onReport }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canDelete = isAdmin || currentUserId === c.user_id || currentUserId === postOwnerId;
  const isAdminComment = c.profiles?.email === ADMIN_EMAIL;

  return (
    <div className="fd-comment">
      <Avatar profile={c.profiles} size={28} />
      <div className="fd-comment-body">
        <div className="fd-comment-header">
          <span className="fd-comment-name">
            {isAdminComment ? "AIDLA_Official" : (c.profiles?.full_name || "User")}
            {isAdminComment && <BlueTick />}
          </span>
          <span className="fd-comment-time">{timeAgo(c.created_at)}</span>
          <div className="fd-comment-menu-wrap">
            <button className="fd-dot-btn" onClick={() => setMenuOpen(p => !p)}
              aria-label="Comment options" aria-expanded={menuOpen}>⋯</button>
            {menuOpen && (
              <div className="fd-dropdown" role="menu">
                {canDelete && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onDelete(c.id); }}>🗑 Delete</button>
                )}
                {currentUserId !== c.user_id && (
                  <button role="menuitem" onClick={() => { setMenuOpen(false); onReport(c.id, "comment"); }}>🚩 Report</button>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="fd-comment-text">{c.content}</p>
      </div>
    </div>
  );
}

// ── Mini Post Preview (for reposts) ────────────────────────────────────────
function MiniPostPreview({ post }) {
  const displayName = post.profiles?.email === ADMIN_EMAIL ? "AIDLA_Official" : (post.profiles?.full_name || "User");
  return (
    <div className="fd-mini-post">
      <div className="fd-mini-post-header">
        <Avatar profile={post.profiles} size={20} />
        <span className="fd-mini-post-name">
          {displayName}
          {post.profiles?.email === ADMIN_EMAIL && <BlueTick />}
        </span>
        <span className="fd-mini-post-time">{timeAgo(post.created_at)}</span>
      </div>
      <p className="fd-mini-post-content">
        {post.content?.length > 150 ? post.content.slice(0, 150) + "…" : post.content}
      </p>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────
function PostCard({ post, currentUserId, currentEmail, currentUserProfile, isAdmin, onDelete, onReport, onCommentDelete, onRepost }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userReaction, setUserReaction] = useState(post.user_reaction || null);
  const [reactionCounts, setReactionCounts] = useState(post.reaction_counts || {});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [posting, setPosting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportDone, setReportDone] = useState(false);
  const menuRef = useRef(null);
  const reactionTimeoutRef = useRef(null);

  const isOwner = currentUserId === post.user_id;
  const isAdminPost = post.profiles?.email === ADMIN_EMAIL;
  const displayName = isAdminPost ? "AIDLA_Official" : (post.profiles?.full_name || "User");

  // Calculate total reaction count
  const totalReactions = Object.values(reactionCounts).reduce((sum, c) => sum + c, 0);
  // Get top 3 reactions for display
  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadComments = async () => {
    const { data } = await supabase
      .from("feed_comments").select("*")
      .eq("post_id", post.id).eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (!data || data.length === 0) { setComments([]); return; }
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profileRows } = await supabase
      .from("users_profiles").select("user_id,full_name,avatar_url,email").in("user_id", userIds);
    const profileMap = Object.fromEntries((profileRows || []).map(p => [p.user_id, p]));
    setComments(data.map(c => ({ ...c, profiles: profileMap[c.user_id] || null })));
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) await loadComments();
    setShowComments(p => !p);
  };

  const handleReactionSelect = async (reactionType) => {
    setShowReactionPicker(false);
    if (!currentUserId) return;

    const prevReaction = userReaction;

    // Optimistic update
    if (prevReaction === reactionType) {
      // Remove reaction
      setUserReaction(null);
      setReactionCounts(prev => {
        const next = { ...prev };
        next[reactionType] = Math.max((next[reactionType] || 0) - 1, 0);
        if (next[reactionType] === 0) delete next[reactionType];
        return next;
      });
    } else {
      // Add/change reaction
      setUserReaction(reactionType);
      setReactionCounts(prev => {
        const next = { ...prev };
        if (prevReaction) {
          next[prevReaction] = Math.max((next[prevReaction] || 0) - 1, 0);
          if (next[prevReaction] === 0) delete next[prevReaction];
        }
        next[reactionType] = (next[reactionType] || 0) + 1;
        return next;
      });
    }

    // Save to database
    if (prevReaction === reactionType) {
      await supabase.from("feed_reactions").delete()
        .eq("post_id", post.id).eq("user_id", currentUserId);
    } else {
      await supabase.from("feed_reactions").upsert({
        post_id: post.id,
        user_id: currentUserId,
        reaction_type: reactionType,
      }, { onConflict: "post_id,user_id" });
    }
  };

  const handleLikeClick = () => {
    if (userReaction) {
      handleReactionSelect(userReaction); // Remove existing reaction
    } else {
      handleReactionSelect("like"); // Default like
    }
  };

  const handleReactionHover = () => {
    clearTimeout(reactionTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleReactionLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
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
      setComments(p => [...p, { ...data, profiles: currentUserProfile }]);
      setCommentCount(c => c + 1);
      setCommentText("");
      setShowComments(true);
    }
    setPosting(false);
  };

  const handleDeleteComment = async (commentId) => {
    await supabase.from("feed_comments").delete().eq("id", commentId);
    setComments(p => p.filter(c => c.id !== commentId));
    setCommentCount(c => Math.max(c - 1, 0));
    if (onCommentDelete) onCommentDelete(commentId);
  };

  const handleReport = async (reason) => {
    const { type, id } = reportTarget;
    await supabase.from("feed_reports").insert({
      reporter_id: currentUserId,
      post_id: type === "post" ? id : null,
      comment_id: type === "comment" ? id : null,
      reason,
    });
    setReportTarget(null);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 3000);
  };

  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/feed/post/${post.id}`
    : `/feed/post/${post.id}`;

  const handleShare = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    alert("Post link copied! Share it anywhere 🔗");
  };

  // Check if this is a repost with original post
  const isRepost = post.repost_of && post.original;

  return (
    <article className={`fd-post-card${post.is_pinned ? " fd-pinned" : ""}`}>
      {post.is_pinned && <div className="fd-pin-badge">📌 Pinned</div>}

      {reportTarget && (
        <ReportModal onClose={() => setReportTarget(null)} onSubmit={handleReport} />
      )}
      {reportDone && (
        <div className="fd-report-toast" role="status">✅ Report submitted. Thank you!</div>
      )}

      {/* Repost indicator */}
      {isRepost && (
        <div className="fd-repost-header">
          <span className="fd-repost-icon">🔁</span>
          <span className="fd-repost-label">
            <strong>{displayName}</strong> reposted
          </span>
        </div>
      )}

      {/* Original post preview (for reposts) */}
      {isRepost && post.original && (
        <MiniPostPreview post={post.original} />
      )}

      {/* Main post content (if repost has additional text) */}
      {(isRepost || post.content) && (
        <>
          <div className="fd-post-header">
            <Avatar profile={post.profiles} size={40} />
            <div className="fd-post-meta">
              <div className="fd-post-author">
                {displayName}
                {isAdminPost && <BlueTick />}
              </div>
              <div className="fd-post-info">
                <span>{timeAgo(post.created_at)}</span>
                {post.location && <><span className="fd-dot">·</span><span>📍 {post.location}</span></>}
                {post.feeling && <><span className="fd-dot">·</span><span>{post.feeling}</span></>}
              </div>
            </div>
            <div className="fd-post-menu-wrap" ref={menuRef}>
              <button className="fd-dot-btn fd-dot-btn-lg" onClick={() => setMenuOpen(p => !p)}
                aria-label="Post options" aria-expanded={menuOpen}>⋯</button>
              {menuOpen && (
                <div className="fd-dropdown fd-dropdown-right" role="menu">
                  {(isOwner || isAdmin) && (
                    <button role="menuitem" onClick={() => { setMenuOpen(false); onDelete(post.id); }}>
                      🗑 Delete Post
                    </button>
                  )}
                  {!isOwner && (
                    <button role="menuitem" onClick={() => { setMenuOpen(false); setReportTarget({ id: post.id, type: "post" }); }}>
                      🚩 Report Post
                    </button>
                  )}
                  <button role="menuitem" onClick={() => { setMenuOpen(false); handleShare(); }}>🔗 Copy Link</button>
                </div>
              )}
            </div>
          </div>

          {(!isRepost || post.content !== `Reposted from @${post.original?.profiles?.full_name || "User"}`) && (
            <div className="fd-post-content">{post.content}</div>
          )}
        </>
      )}

      {/* Reaction bar */}
      {totalReactions > 0 && (
        <div className="fd-reaction-bar">
          <span className="fd-reaction-emojis">
            {topReactions.map(key => (
              <span key={key} className="fd-reaction-emoji-icon">{REACTIONS[key].emoji}</span>
            ))}
          </span>
          <span className="fd-reaction-count">{totalReactions}</span>
        </div>
      )}

      {/* Post actions */}
      <div className="fd-post-actions" role="group" aria-label="Post actions">
        <div
          className="fd-reaction-btn-wrap"
          onMouseEnter={handleReactionHover}
          onMouseLeave={handleReactionLeave}
        >
          <button
            className={`fd-action-btn${userReaction ? " fd-reacted" : ""}`}
            onClick={handleLikeClick}
            style={userReaction ? { color: REACTIONS[userReaction]?.color } : {}}
            aria-label={userReaction ? `Reacted ${REACTIONS[userReaction]?.label}` : "Like"}
            aria-pressed={!!userReaction}
          >
            <span className="fd-action-icon" aria-hidden="true">
              {userReaction ? REACTIONS[userReaction].emoji : "👍"}
            </span>
            <span className="fd-action-label">
              {userReaction ? REACTIONS[userReaction].label : "Like"}
            </span>
          </button>
          {showReactionPicker && (
            <ReactionPicker
              onSelect={handleReactionSelect}
              onClose={() => setShowReactionPicker(false)}
            />
          )}
        </div>

        <button className="fd-action-btn" onClick={toggleComments}
          aria-label={showComments ? "Hide comments" : "Show comments"} aria-expanded={showComments}>
          <span className="fd-action-icon" aria-hidden="true">💬</span>
          <span className="fd-action-label">{commentCount > 0 ? commentCount : "Comment"}</span>
        </button>
        <button className="fd-action-btn" onClick={() => onRepost(post)} aria-label="Repost">
          <span className="fd-action-icon" aria-hidden="true">🔁</span>
          <span className="fd-action-label">{post.repost_count > 0 ? post.repost_count : "Repost"}</span>
        </button>
        <button className="fd-action-btn" onClick={handleShare} aria-label="Share post">
          <span className="fd-action-icon" aria-hidden="true">📤</span>
          <span className="fd-action-label">Share</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="fd-comments-section" aria-label="Comments">
          {comments.map(c => (
            <Comment key={c.id} c={c}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              postOwnerId={post.user_id}
              onDelete={handleDeleteComment}
              onReport={(id) => setReportTarget({ id, type: "comment" })} />
          ))}
          <div className="fd-comment-input-row">
            <div className="fd-comment-input-wrap">
              <Avatar profile={currentUserProfile} size={24} />
              <label htmlFor={`comment-${post.id}`} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                Write a comment
              </label>
              <input
                id={`comment-${post.id}`}
                className="fd-comment-input"
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleComment()}
                maxLength={500} />
              <button className="fd-comment-send" onClick={handleComment}
                disabled={!commentText.trim() || posting} aria-label="Send comment">
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ── Compact Compose Box ────────────────────────────────────────────────────
function ComposeBox({ profile, userId, isAdmin, onPosted, repostOf = null, onCancelRepost }) {
  const [content, setContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [showFeelings, setShowFeelings] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const displayName = isAdmin ? "AIDLA_Official" : (profile?.full_name || "You");

  // Auto-expand when reposting
  useEffect(() => {
    if (repostOf) setExpanded(true);
  }, [repostOf]);

  const handlePost = async () => {
    const text = repostOf
      ? (content.trim() || `Reposted from @${repostOf.profiles?.full_name || "User"}`)
      : content.trim();
    if (!text) return;
    const contentErr = validateContent(text);
    if (contentErr) { setError(contentErr); return; }
    setPosting(true); setError("");
    const payload = {
      user_id: userId,
      content: text,
      feeling: feeling || null,
      location: location.trim() || null,
      repost_of: repostOf?.id || null,
    };
    const { data, error: err } = await supabase.from("feed_posts")
      .insert(payload).select("*").single();
    if (err) {
      setError(err.message || "Failed to post. Please try again.");
    } else {
      setContent(""); setFeeling(""); setLocation(""); setShowFeelings(false);
      setExpanded(false);
      if (onPosted) onPosted({
        ...data,
        profiles: profile,
        user_liked: false,
        repost_count: 0,
        original: repostOf || null,
      });
      if (onCancelRepost) onCancelRepost();
    }
    setPosting(false);
  };

  return (
    <div className={`fd-compose${expanded || repostOf ? " fd-compose-expanded" : ""}`} role="form" aria-label="Create a post">
      {/* Repost preview */}
      {repostOf && (
        <div className="fd-repost-preview-full">
          <div className="fd-rp-full-header">
            <span className="fd-rp-full-icon">🔁</span>
            <span className="fd-rp-full-label">Reposting</span>
            <button className="fd-rp-full-cancel" onClick={onCancelRepost}>✕</button>
          </div>
          <MiniPostPreview post={repostOf} />
        </div>
      )}

      {/* Collapsed state: clickable input */}
      {!expanded && !repostOf && (
        <button className="fd-compose-collapsed" onClick={() => setExpanded(true)}>
          <Avatar profile={profile} size={36} />
          <span className="fd-compose-placeholder">
            What&apos;s on your mind, {displayName.split(" ")[0]}?
          </span>
        </button>
      )}

      {/* Expanded state */}
      {(expanded || repostOf) && (
        <>
          <div className="fd-compose-header">
            <Avatar profile={profile} size={36} />
            <div className="fd-compose-name">
              {displayName}{isAdmin && <BlueTick />}
            </div>
          </div>

          <label htmlFor="compose-textarea" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
            What&apos;s on your mind
          </label>
          <textarea
            id="compose-textarea"
            className="fd-compose-textarea"
            placeholder={repostOf ? "Say something about this… (optional)" : `What's on your mind, ${displayName.split(" ")[0]}?`}
            value={content}
            onChange={e => { setContent(e.target.value); setError(""); }}
            maxLength={2000}
            rows={repostOf ? 2 : 3}
            autoFocus
          />
          {error && <div className="fd-compose-error" role="alert">⚠️ {error}</div>}

          <div className="fd-compose-extras">
            <div className="fd-compose-tags">
              <div className="fd-feelings-wrap">
                <button className="fd-tag-btn" onClick={() => setShowFeelings(p => !p)}
                  aria-expanded={showFeelings} aria-label="Select feeling">
                  {feeling || "😊 Feeling"}
                </button>
                {showFeelings && (
                  <div className="fd-feelings-dropdown" role="listbox" aria-label="Feelings">
                    {FEELINGS.map(f => (
                      <button key={f} className="fd-feeling-item" role="option"
                        onClick={() => { setFeeling(f); setShowFeelings(false); }}>
                        {f}
                      </button>
                    ))}
                    {feeling && (
                      <button className="fd-feeling-item fd-feeling-clear"
                        onClick={() => { setFeeling(""); setShowFeelings(false); }}>
                        ✕ Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
              <input
                className="fd-location-input"
                placeholder="📍 Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                maxLength={80}
                aria-label="Location"
              />
            </div>

            <div className="fd-compose-footer">
              <div className="fd-compose-footer-left">
                <span className="fd-char-count">{content.length}/2000</span>
              </div>
              <div className="fd-compose-footer-right">
                {!repostOf && (
                  <button className="fd-cancel-btn" onClick={() => { setExpanded(false); setContent(""); }}>
                    Cancel
                  </button>
                )}
                <button className="fd-post-btn" onClick={handlePost}
                  disabled={posting || (!content.trim() && !repostOf)} aria-busy={posting}>
                  {posting ? "Posting…" : repostOf ? "🔁 Repost" : "Post"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Feed ──────────────────────────────────────────────────────────────
export default function Feed() {
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [repostOf, setRepostOf] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const loaderRef = useRef(null);
  const userIdRef = useRef(null);

  const isAdmin = userEmail === ADMIN_EMAIL;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email);
      userIdRef.current = user.id;
      const { data: p } = await supabase.from("users_profiles")
        .select("full_name,avatar_url,email").eq("user_id", user.id).single();
      if (p) setProfile(p);
      doLoadPosts(0, true, user.id);
    })();
  }, []);

  const doLoadPosts = async (pageNum, replace, uid) => {
    if (replace) setLoading(true);
    else setFetchingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("feed_posts").select("*")
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data && data.length > 0) {
      const postIds = data.map(p => p.id);
      const userIds = [...new Set(data.map(p => p.user_id))];
      const repostIds = data.map(p => p.repost_of).filter(Boolean);

      const { data: profileRows } = await supabase
        .from("users_profiles").select("user_id,full_name,avatar_url,email").in("user_id", userIds);
      const profileMap = Object.fromEntries((profileRows || []).map(p => [p.user_id, p]));

      // Load original posts for reposts
      let originalMap = {};
      if (repostIds.length > 0) {
        const { data: origRows } = await supabase
          .from("feed_posts").select("id,content,user_id,created_at,location,feeling").in("id", repostIds).eq("is_deleted", false);
        if (origRows) {
          const origUserIds = [...new Set(origRows.map(r => r.user_id))];
          const { data: origProfiles } = await supabase
            .from("users_profiles").select("user_id,full_name,avatar_url,email").in("user_id", origUserIds);
          const origProfMap = Object.fromEntries((origProfiles || []).map(p => [p.user_id, p]));
          origRows.forEach(r => { originalMap[r.id] = { ...r, profiles: origProfMap[r.user_id] || null }; });
        }
      }

      // Load user reactions
      const { data: reactionRows } = await supabase
        .from("feed_reactions").select("post_id,reaction_type").eq("user_id", uid).in("post_id", postIds);
      const userReactionMap = {};
      (reactionRows || []).forEach(r => { userReactionMap[r.post_id] = r.reaction_type; });

      // Load all reaction counts
      const { data: allReactions } = await supabase
        .from("feed_reactions").select("post_id,reaction_type").in("post_id", postIds);
      const countsMap = {};
      (allReactions || []).forEach(r => {
        if (!countsMap[r.post_id]) countsMap[r.post_id] = {};
        countsMap[r.post_id][r.reaction_type] = (countsMap[r.post_id][r.reaction_type] || 0) + 1;
      });

      const enriched = data.map(p => ({
        ...p,
        profiles: profileMap[p.user_id] || null,
        original: p.repost_of ? (originalMap[p.repost_of] || null) : null,
        user_reaction: userReactionMap[p.id] || null,
        reaction_counts: countsMap[p.id] || {},
      }));

      setPosts(prev => replace ? enriched : [...prev, ...enriched]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } else if (!error) {
      if (replace) setPosts([]);
      setHasMore(false);
    }

    if (replace) setLoading(false);
    else setFetchingMore(false);
  };

  const loadPosts = useCallback((pageNum, replace) => {
    const uid = userIdRef.current;
    if (!uid) return;
    doLoadPosts(pageNum, replace, uid);
  }, []);

  const hasMoreRef = useRef(hasMore);
  const isFetchingMoreRef = useRef(fetchingMore);
  const pageRef = useRef(page);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isFetchingMoreRef.current = fetchingMore; }, [fetchingMore]);
  useEffect(() => { pageRef.current = page; }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      if (isFetchingMoreRef.current || !hasMoreRef.current) return;
      loadPosts(pageRef.current + 1, false);
    }, { rootMargin: "200px", threshold: 0 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadPosts]);

  const handlePosted = (newPost) => {
    setPosts(prev => [{ ...newPost, user_reaction: null, reaction_counts: {} }, ...prev]);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    const { error: softErr } = await supabase
      .from("feed_posts").update({ is_deleted: true }).eq("id", postId);
    if (!softErr) return;
    const { error: hardErr } = await supabase
      .from("feed_posts").delete().eq("id", postId);
    if (!hardErr) return;
    alert("Could not delete this post.");
    loadPosts(0, true);
  };

  return (
    <div className="fd-root">
      <style>{CSS}</style>

      <div className="fd-feed-header">
        <h2 className="fd-feed-title">
          {isAdmin ? "📡 AIDLA Feed — Admin View" : "📡 Community Feed"}
        </h2>
        {isAdmin && (
          <span className="fd-admin-badge">Admin Mode <BlueTick /></span>
        )}
      </div>

      {userId && (
        <ComposeBox
          profile={profile}
          userId={userId}
          isAdmin={isAdmin}
          onPosted={handlePosted}
          repostOf={repostOf}
          onCancelRepost={() => setRepostOf(null)}
        />
      )}

      <div className="fd-posts-list" aria-label="Posts" aria-live="polite">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={userId}
            currentEmail={userEmail}
            currentUserProfile={profile}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onReport={() => {}}
            onCommentDelete={() => {}}
            onRepost={p => { setRepostOf(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        ))}
      </div>

      {loading && (
        <div className="fd-loading" aria-live="polite">
          <div className="fd-spinner" aria-hidden="true" />
          <span>Loading posts…</span>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="fd-empty">
          <div className="fd-empty-icon" aria-hidden="true">💬</div>
          <p>No posts yet. Be the first to post!</p>
        </div>
      )}

      {fetchingMore && (
        <div className="fd-loading" aria-live="polite">
          <div className="fd-spinner" aria-hidden="true" />
          <span>Loading more…</span>
        </div>
      )}

      {!loading && !fetchingMore && !hasMore && posts.length > 0 && (
        <div className="fd-end">You&apos;ve seen all posts ✓</div>
      )}

      {hasMore && <div ref={loaderRef} style={{ height: 20 }} aria-hidden="true" />}
    </div>
  );
}

// ── CSS (performance optimized, mobile-first) ──────────────────────────────
const CSS = `
  .fd-root {
    max-width: 680px;
    margin: 0 auto;
    font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    padding: 0 12px 40px;
  }

  /* Feed header */
  .fd-feed-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .fd-feed-title {
    font-size: clamp(1rem, 2.5vw, 1.15rem);
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.2px;
    margin: 0;
  }
  .fd-admin-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(29,155,240,0.08);
    border: 1px solid rgba(29,155,240,0.15);
    color: #0369a1;
    font-size: 0.72rem;
    font-weight: 700;
  }

  /* ── COMPACT COMPOSE BOX ── */
  .fd-compose {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 14px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.03);
    transition: border-color 0.2s ease;
  }
  .fd-compose-expanded {
    padding: 14px;
    border-color: rgba(15,23,42,0.1);
  }

  /* Collapsed state */
  .fd-compose-collapsed {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 14px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 14px;
    transition: background-color 0.15s ease;
    font-family: inherit;
    text-align: left;
  }
  .fd-compose-collapsed:hover {
    background: rgba(15,23,42,0.02);
  }
  .fd-compose-placeholder {
    flex: 1;
    padding: 8px 14px;
    border-radius: 100px;
    background: #f8fafc;
    border: 1px solid rgba(15,23,42,0.08);
    font-size: 0.86rem;
    color: #94a3b8;
    font-weight: 500;
    line-height: 1.4;
  }

  .fd-compose-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .fd-compose-name {
    font-weight: 700;
    font-size: 0.86rem;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .fd-compose-textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1.5px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    font-family: inherit;
    font-size: 0.88rem;
    color: #0f172a;
    line-height: 1.55;
    resize: none;
    box-sizing: border-box;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    min-height: 60px;
  }
  .fd-compose-textarea:focus {
    outline: none;
    background: #ffffff;
    border-color: rgba(59,130,246,0.3);
  }
  .fd-compose-error {
    font-size: 0.74rem;
    color: #dc2626;
    font-weight: 600;
    margin: 6px 0;
    padding: 7px 10px;
    background: rgba(239,68,68,0.04);
    border: 1px solid rgba(239,68,68,0.08);
    border-radius: 8px;
  }
  .fd-compose-extras {
    margin-top: 8px;
  }
  .fd-compose-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .fd-tag-btn {
    padding: 5px 10px;
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    color: #475569;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
    min-height: 32px;
  }
  .fd-tag-btn:hover {
    background: #f1f5f9;
  }
  .fd-feelings-wrap {
    position: relative;
  }
  .fd-feelings-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 100;
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 8px 24px rgba(15,23,42,0.06);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    min-width: 200px;
    animation: fdDropIn 0.12s ease;
  }
  .fd-feeling-item {
    padding: 6px 8px;
    border-radius: 7px;
    border: none;
    background: transparent;
    text-align: left;
    font-size: 0.76rem;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: background-color 0.1s ease;
    font-family: inherit;
  }
  .fd-feeling-item:hover {
    background: rgba(59,130,246,0.05);
  }
  .fd-feeling-clear {
    color: #ef4444;
    grid-column: span 2;
  }
  .fd-location-input {
    flex: 1;
    min-width: 100px;
    padding: 5px 10px;
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    font-size: 0.74rem;
    font-family: inherit;
    color: #475569;
    outline: none;
    transition: border-color 0.15s ease;
    min-height: 32px;
  }
  .fd-location-input:focus {
    border-color: rgba(59,130,246,0.25);
    background: #ffffff;
  }
  .fd-compose-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .fd-compose-footer-left {
    display: flex;
    align-items: center;
  }
  .fd-compose-footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fd-char-count {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 600;
  }
  .fd-cancel-btn {
    padding: 7px 14px;
    border-radius: 100px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .fd-cancel-btn:hover {
    background: rgba(15,23,42,0.04);
  }
  .fd-post-btn {
    padding: 7px 20px;
    border-radius: 100px;
    border: none;
    background: #1e3a8a;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
    min-height: 36px;
  }
  .fd-post-btn:hover:not(:disabled) {
    background: #1e40af;
  }
  .fd-post-btn:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }

  /* Repost preview (full in compose) */
  .fd-repost-preview-full {
    background: rgba(59,130,246,0.03);
    border: 1px solid rgba(59,130,246,0.08);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
  }
  .fd-rp-full-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }
  .fd-rp-full-icon {
    font-size: 0.85rem;
  }
  .fd-rp-full-label {
    font-size: 0.76rem;
    font-weight: 600;
    color: #3b82f6;
    flex: 1;
  }
  .fd-rp-full-cancel {
    font-size: 0.72rem;
    color: #94a3b8;
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .fd-rp-full-cancel:hover {
    background: rgba(15,23,42,0.04);
  }

  /* ── MINI POST PREVIEW (for reposts) ── */
  .fd-mini-post {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .fd-mini-post-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }
  .fd-mini-post-name {
    font-weight: 700;
    font-size: 0.78rem;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .fd-mini-post-time {
    font-size: 0.68rem;
    color: #94a3b8;
    margin-left: auto;
  }
  .fd-mini-post-content {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Repost header on post card */
  .fd-repost-header {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
    font-size: 0.74rem;
    color: #64748b;
    font-weight: 500;
  }
  .fd-repost-icon {
    font-size: 0.85rem;
  }

  /* ── POST CARD ── */
  .fd-post-card {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 10px;
    position: relative;
    box-shadow: 0 1px 2px rgba(15,23,42,0.02);
    animation: fdCardIn 0.2s ease both;
  }
  @keyframes fdCardIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fd-pinned {
    border-color: rgba(245,158,11,0.15);
  }
  .fd-pin-badge {
    display: inline-block;
    margin-bottom: 6px;
    padding: 2px 8px;
    border-radius: 100px;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.15);
    font-size: 0.7rem;
    font-weight: 700;
    color: #b45309;
  }
  .fd-post-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }
  .fd-post-meta {
    flex: 1;
    min-width: 0;
  }
  .fd-post-author {
    font-weight: 700;
    font-size: 0.86rem;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .fd-post-info {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 1px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
  }
  .fd-dot { color: #cbd5e1; }
  .fd-post-content {
    font-size: 0.9rem;
    color: #1e293b;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 8px;
  }

  /* Menu */
  .fd-post-menu-wrap, .fd-comment-menu-wrap { position: relative; }
  .fd-dot-btn {
    background: none; border: none; cursor: pointer;
    color: #94a3b8; font-size: 1rem; padding: 4px 6px;
    border-radius: 6px; transition: background-color 0.15s ease;
    line-height: 1; font-family: inherit; min-width: 32px; min-height: 32px;
  }
  .fd-dot-btn:hover { background: rgba(15,23,42,0.04); color: #475569; }
  .fd-dot-btn-lg { font-size: 1.15rem; }
  .fd-dropdown {
    position: absolute; top: calc(100% + 2px); right: 0; z-index: 50;
    background: #fff; border: 1px solid rgba(15,23,42,0.06);
    border-radius: 10px; padding: 4px;
    box-shadow: 0 6px 20px rgba(15,23,42,0.06);
    min-width: 140px; animation: fdDropIn 0.12s ease;
  }
  @keyframes fdDropIn {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
  .fd-dropdown button {
    display: block; width: 100%; text-align: left;
    padding: 7px 10px; border: none; background: transparent;
    font-size: 0.76rem; font-weight: 600; color: #334155;
    border-radius: 7px; cursor: pointer;
    transition: background-color 0.1s ease; font-family: inherit;
  }
  .fd-dropdown button:hover { background: rgba(15,23,42,0.03); }

  /* Reaction bar */
  .fd-reaction-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
    margin-bottom: 2px;
  }
  .fd-reaction-emojis {
    display: flex;
    gap: 0;
  }
  .fd-reaction-emoji-icon {
    font-size: 0.85rem;
    margin-right: -2px;
  }
  .fd-reaction-count {
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 500;
    margin-left: 4px;
  }

  /* Post actions */
  .fd-post-actions {
    display: flex;
    gap: 2px;
    padding-top: 6px;
    border-top: 1px solid rgba(15,23,42,0.04);
  }
  .fd-reaction-btn-wrap {
    position: relative;
    flex: 1;
  }
  .fd-action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 4px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 0.76rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: background-color 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
    min-height: 36px;
  }
  .fd-action-btn:hover {
    background: rgba(15,23,42,0.03);
  }
  .fd-action-icon {
    font-size: 0.9rem;
  }

  /* Reaction picker popup */
  .fd-reaction-picker {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 100px;
    padding: 6px 10px;
    box-shadow: 0 6px 24px rgba(15,23,42,0.1);
    z-index: 20;
    animation: fdReactionIn 0.15s ease;
  }
  @keyframes fdReactionIn {
    from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.9); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .fd-reaction-emoji {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0;
  }
  .fd-reaction-emoji:hover,
  .fd-reaction-hovered {
    transform: scale(1.35);
  }
  .fd-reaction-tooltip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #fff;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
  }

  /* Comments */
  .fd-comments-section {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(15,23,42,0.04);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .fd-comment {
    display: flex;
    gap: 7px;
    align-items: flex-start;
  }
  .fd-comment-body { flex: 1; min-width: 0; }
  .fd-comment-header {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  .fd-comment-name {
    font-weight: 700;
    font-size: 0.76rem;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .fd-comment-time {
    font-size: 0.66rem;
    color: #94a3b8;
    font-weight: 500;
  }
  .fd-comment-text {
    font-size: 0.82rem;
    color: #334155;
    line-height: 1.45;
    margin: 1px 0 0;
    word-break: break-word;
  }
  .fd-comment-input-row { margin-top: 4px; }
  .fd-comment-input-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .fd-comment-input {
    flex: 1;
    padding: 7px 12px;
    border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.08);
    background: #f8fafc;
    font-family: inherit;
    font-size: 0.8rem;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s ease;
  }
  .fd-comment-input:focus {
    border-color: rgba(59,130,246,0.25);
    background: #ffffff;
  }
  .fd-comment-send {
    width: 30px; height: 30px; border-radius: 50%;
    border: none; background: #1e3a8a; color: #fff;
    font-size: 0.75rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background-color 0.15s ease;
    flex-shrink: 0; font-family: inherit;
  }
  .fd-comment-send:hover:not(:disabled) { background: #1e40af; }
  .fd-comment-send:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Modal */
  .fd-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,23,42,0.2);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .fd-modal {
    background: #fff; border-radius: 16px; padding: 22px 18px;
    max-width: 380px; width: 100%;
    box-shadow: 0 16px 48px rgba(15,23,42,0.1);
    animation: fdModalIn 0.18s ease;
  }
  @keyframes fdModalIn {
    from { opacity: 0; transform: scale(0.97) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .fd-modal-title { font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  .fd-modal-sub { font-size: 0.78rem; color: #64748b; margin-bottom: 12px; }
  .fd-report-reasons { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .fd-reason-btn {
    padding: 6px 11px; border-radius: 100px;
    border: 1px solid rgba(15,23,42,0.1); background: transparent;
    font-size: 0.74rem; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s ease; font-family: inherit;
  }
  .fd-reason-btn.active, .fd-reason-btn:hover {
    background: rgba(30,58,138,0.05); border-color: rgba(30,58,138,0.2); color: #1e3a8a;
  }
  .fd-modal-textarea {
    width: 100%; padding: 9px 11px; border-radius: 10px;
    border: 1px solid rgba(15,23,42,0.1); background: #f8fafc;
    font-family: inherit; font-size: 0.8rem; resize: none;
    box-sizing: border-box; outline: none; margin-bottom: 10px;
  }
  .fd-modal-actions { display: flex; gap: 7px; justify-content: flex-end; }
  .fd-modal-cancel {
    padding: 7px 16px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: transparent;
    font-size: 0.8rem; font-weight: 600; color: #64748b;
    cursor: pointer; transition: background-color 0.15s ease; font-family: inherit;
  }
  .fd-modal-cancel:hover { background: #f8fafc; }
  .fd-modal-confirm {
    padding: 7px 16px; border-radius: 8px; border: none;
    font-size: 0.8rem; font-weight: 700; cursor: pointer;
    transition: background-color 0.15s ease; font-family: inherit;
  }
  .fd-modal-report { background: #dc2626; color: #fff; }
  .fd-modal-report:hover:not(:disabled) { background: #b91c1c; }
  .fd-modal-report:disabled { background: #cbd5e1; cursor: not-allowed; }

  /* Toast */
  .fd-report-toast {
    position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
    background: #15803d; color: #fff; padding: 5px 12px;
    border-radius: 100px; font-size: 0.74rem; font-weight: 700;
    white-space: nowrap; z-index: 10; animation: fdToastIn 0.2s ease;
  }
  @keyframes fdToastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* Loading, empty, end */
  .fd-loading {
    display: flex; align-items: center; gap: 8px; justify-content: center;
    padding: 18px; color: #64748b; font-size: 0.8rem; font-weight: 600;
  }
  .fd-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(59,130,246,0.12); border-top-color: #3b82f6;
    animation: fdSpin 0.7s linear infinite;
  }
  @keyframes fdSpin { to { transform: rotate(360deg); } }
  .fd-empty {
    text-align: center; padding: 32px 16px; color: #94a3b8;
    font-size: 0.84rem; font-weight: 600;
  }
  .fd-empty-icon { font-size: 36px; margin-bottom: 6px; }
  .fd-end {
    text-align: center; padding: 14px; color: #cbd5e1;
    font-size: 0.74rem; font-weight: 600;
  }
  .fd-posts-list { display: flex; flex-direction: column; }

  /* ── Mobile Responsive ── */
  @media (min-width: 480px) {
    .fd-root { padding: 0 16px 44px; }
    .fd-compose-expanded { padding: 16px; }
    .fd-post-card { padding: 16px; }
  }
  @media (min-width: 640px) {
    .fd-root { padding: 0 20px 48px; }
    .fd-post-content { font-size: 0.92rem; }
  }
  @media (max-width: 480px) {
    .fd-action-label { display: none; }
    .fd-action-btn { padding: 8px 4px; font-size: 0; gap: 0; }
    .fd-action-icon { font-size: 1.1rem; }
    .fd-feelings-dropdown { grid-template-columns: 1fr; min-width: 150px; }
  }
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .fd-root { padding-bottom: calc(40px + env(safe-area-inset-bottom)); }
  }
`;