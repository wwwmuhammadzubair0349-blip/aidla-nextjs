"use client";
// app/user/social/page.jsx
// Premium Community & Social page
//
// Enhancements:
//   - Mobile-first responsive grid (320px–ultrawide)
//   - Removed all backdrop-filter (GPU optimized)
//   - Flat design — no 3D transforms, no heavy shadows
//   - Clean transitions — opacity/background/border only
//   - Fluid typography with clamp()
//   - Touch-optimized mobile interactions
//   - Safe area support for notched devices
//   - Static-friendly — no SSR, no server components

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ── Social links config ───────────────────────────────────────────────────
const SOCIAL_LINKS = [
  {
    id: "facebook", label: "Facebook", handle: "@AIDLA Official",
    desc: "Follow us for daily updates, prize announcements & community highlights.",
    url: "https://www.facebook.com/profile.php?id=61586195563121",
    color: "#1877f2", bg: "rgba(24,119,242,0.08)", border: "rgba(24,119,242,0.15)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>,
  },
  {
    id: "instagram", label: "Instagram", handle: "@aidla_official",
    desc: "Behind the scenes, winner celebrations & student success stories.",
    url: "https://www.instagram.com/aidla_official/",
    color: "#e1306c", bg: "rgba(225,48,108,0.08)", border: "rgba(225,48,108,0.15)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  {
    id: "tiktok", label: "TikTok", handle: "@aidla_official",
    desc: "Short study tips, quiz challenges & viral education content.",
    url: "https://www.tiktok.com/@aidla_official",
    color: "#010101", bg: "rgba(1,1,1,0.06)", border: "rgba(1,1,1,0.12)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/></svg>,
  },
  {
    id: "linkedin", label: "LinkedIn", handle: "AIDLA",
    desc: "Career tips, professional development & AIDLA company updates.",
    url: "https://www.linkedin.com/company/aidla",
    color: "#0a66c2", bg: "rgba(10,102,194,0.08)", border: "rgba(10,102,194,0.15)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    id: "whatsapp", label: "WhatsApp Channel", handle: "AIDLA Official",
    desc: "Instant notifications for new prizes, draws & platform updates.",
    url: "https://whatsapp.com/channel/0029VbC6yju0rGiV5JaCqj42",
    color: "#25d366", bg: "rgba(37,211,102,0.08)", border: "rgba(37,211,102,0.15)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  {
    id: "twitter", label: "X (Twitter)", handle: "@AIDLA",
    desc: "Quick updates, education threads & community discussions.",
    url: "https://twitter.com",
    color: "#000000", bg: "rgba(0,0,0,0.05)", border: "rgba(0,0,0,0.1)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
];

// ── Star picker ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor 😔", "Fair 😐", "Good 🙂", "Very Good 😊", "Excellent 🤩"];
  return (
    <div className="sc-star-row" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          className={`sc-star${s <= (hover || value) ? " sc-star-on" : ""}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          aria-pressed={value === s}
        >★</button>
      ))}
      {(hover || value) > 0 && (
        <span className="sc-star-label" aria-live="polite">{labels[hover || value]}</span>
      )}
    </div>
  );
}

// ── Review card ────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const initials = review.full_name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso);
    if (diff < 3600000)    return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)   return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}d ago`;
    return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
  };
  return (
    <div className="sc-review-card">
      <div className="sc-review-top">
        <div className="sc-review-avatar" aria-hidden="true">{initials}</div>
        <div className="sc-review-meta">
          <div className="sc-review-name">{review.full_name}</div>
          <div className="sc-review-time">{timeAgo(review.created_at)}</div>
        </div>
        <div className="sc-review-stars" aria-label={`${review.rating} out of 5 stars`}>
          {"★".repeat(review.rating)}
          <span className="sc-review-stars-dim">{"★".repeat(5 - review.rating)}</span>
        </div>
      </div>
      <p className="sc-review-text">&ldquo;{review.review_text}&rdquo;</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Social() {
  const [user,         setUser]         = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [reviews,      setReviews]      = useState([]);
  const [myReview,     setMyReview]     = useState(null);

  const [rating,       setRating]       = useState(0);
  const [text,         setText]         = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [status,       setStatus]       = useState(null);

  const [editing,           setEditing]           = useState(false);
  const [editRating,        setEditRating]        = useState(0);
  const [editText,          setEditText]          = useState("");
  const [editSaving,        setEditSaving]        = useState(false);
  const [editStatus,        setEditStatus]        = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied,         setCopied]         = useState(null);

  // ── Load user + reviews ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);

      const { data: p } = await supabase.from("users_profiles")
        .select("full_name, email").eq("user_id", u.id).single();
      if (p) setProfile(p);

      const { data: rv } = await supabase.from("user_reviews")
        .select("id, full_name, email, rating, review_text, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false }).limit(50);
      setReviews(rv || []);

      const email = p?.email || u.email;
      if (email) {
        const { data: mine } = await supabase.from("user_reviews")
          .select("id, rating, review_text")
          .eq("email", email.toLowerCase()).maybeSingle();
        if (mine) setMyReview(mine);
      }

      setReviewsLoading(false);
    })();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from("user_reviews")
      .select("id, full_name, email, rating, review_text, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false }).limit(50);
    if (data) setReviews(data);
  };

  // ── Edit review ────────────────────────────────────────────────────────
  const startEdit = () => {
    setEditRating(myReview.rating);
    setEditText(myReview.review_text);
    setEditStatus(null);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setEditStatus(null); };

  const saveEdit = async () => {
    if (editRating === 0 || editText.trim().length < 20 || editSaving) return;
    setEditSaving(true); setEditStatus(null);
    const userEmail = (profile?.email || user?.email || "").toLowerCase();
    try {
      const { data, error } = await supabase.from("user_reviews")
        .update({ rating: editRating, review_text: editText.trim() })
        .eq("id", myReview.id).select();
      if (error) {
        setEditStatus("err");
      } else if (!data || data.length === 0) {
        const { data: data2, error: error2 } = await supabase.from("user_reviews")
          .update({ rating: editRating, review_text: editText.trim() })
          .eq("email", userEmail).select();
        if (error2 || !data2?.length) { setEditStatus("err"); }
        else {
          setMyReview({ ...myReview, rating: editRating, review_text: editText.trim() });
          setEditing(false); await fetchReviews();
        }
      } else {
        setMyReview({ ...myReview, rating: editRating, review_text: editText.trim() });
        setEditing(false); await fetchReviews();
      }
    } catch { setEditStatus("err"); }
    finally { setEditSaving(false); }
  };

  // ── Delete review ──────────────────────────────────────────────────────
  const deleteReview = async () => {
    if (!myReview || deleting) return;
    setDeleting(true);
    const userEmail = (profile?.email || user?.email || "").toLowerCase();
    try {
      const { error } = await supabase.from("user_reviews")
        .delete().eq("id", myReview.id).select();
      if (error) {
        const { error: error2 } = await supabase.from("user_reviews")
          .delete().eq("email", userEmail).select();
        if (!error2) {
          setMyReview(null); setShowDeleteConfirm(false);
          setEditing(false); setRating(0); setText("");
          await fetchReviews();
        }
      } else {
        setMyReview(null); setShowDeleteConfirm(false);
        setEditing(false); setRating(0); setText("");
        await fetchReviews();
      }
    } catch (e) { console.error("[deleteReview] catch:", e); }
    finally { setDeleting(false); }
  };

  // ── Submit review ──────────────────────────────────────────────────────
  const submitReview = async () => {
    if (rating === 0 || text.trim().length < 20 || submitting) return;
    setSubmitting(true); setStatus(null);
    const email    = profile?.email || user?.email || "";
    const fullName = profile?.full_name || user?.email?.split("@")[0] || "User";
    try {
      const { error } = await supabase.from("user_reviews").insert({
        full_name: fullName, email: email.toLowerCase(),
        rating, review_text: text.trim(), is_approved: true,
      });
      if (error?.code === "23505") { setStatus("dup"); }
      else if (error) { setStatus("err"); }
      else {
        setStatus("ok");
        setMyReview({ rating, review_text: text.trim() });
        setText(""); setRating(0);
        await fetchReviews();
      }
    } catch { setStatus("err"); }
    finally { setSubmitting(false); }
  };

  const copyLink = (url, id) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const fullName = profile?.full_name || user?.email?.split("@")[0] || "You";

  return (
    <div className="sc-root">
      <style>{CSS}</style>

      {/* Page header */}
      <div className="sc-page-header">
        <div className="sc-page-header-icon" aria-hidden="true">🌐</div>
        <div>
          <h1 className="sc-page-title">Community &amp; Social</h1>
          <p className="sc-page-sub">Connect · Share · Celebrate with AIDLA</p>
        </div>
      </div>

      {/* Social links */}
      <section className="sc-section" aria-labelledby="socials-heading">
        <div className="sc-section-header">
          <span className="sc-section-badge">📡 Follow Us</span>
          <h2 className="sc-section-title" id="socials-heading">Find AIDLA Everywhere</h2>
          <p className="sc-section-sub">Stay connected — get prize alerts, learning tips &amp; community highlights</p>
        </div>

        <div className="sc-socials-grid">
          {SOCIAL_LINKS.map(s => (
            <div key={s.id} className="sc-social-card"
              style={{ "--s-color":s.color, "--s-bg":s.bg, "--s-border":s.border }}>
              <div className="sc-social-top">
                <div className="sc-social-icon-wrap" style={{ color:s.color, background:s.bg }}>
                  {s.icon}
                </div>
                <div className="sc-social-info">
                  <div className="sc-social-name">{s.label}</div>
                  <div className="sc-social-handle">{s.handle}</div>
                </div>
              </div>
              <p className="sc-social-desc">{s.desc}</p>
              <div className="sc-social-actions">
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="sc-follow-btn" style={{ background:s.color }}
                  aria-label={`Follow AIDLA on ${s.label}`}>
                  Follow →
                </a>
                <button className="sc-copy-btn" onClick={() => copyLink(s.url, s.id)}
                  aria-label={`Copy ${s.label} link`}>
                  {copied === s.id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  )}
                  {copied === s.id ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="sc-section" aria-labelledby="reviews-heading">
        <div className="sc-section-header">
          <span className="sc-section-badge">⭐ Reviews</span>
          <h2 className="sc-section-title" id="reviews-heading">What Learners Say</h2>
          {avgRating && (
            <div className="sc-avg-rating" aria-label={`Average rating: ${avgRating} out of 5`}>
              <span className="sc-avg-num">{avgRating}</span>
              <span className="sc-avg-stars" aria-hidden="true">{"★".repeat(Math.round(Number(avgRating)))}</span>
              <span className="sc-avg-count">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Write / edit review */}
        <div className="sc-review-form-card">
          {myReview ? (
            <div className="sc-already-reviewed">
              {/* Delete confirm modal */}
              {showDeleteConfirm && (
                <div className="sc-del-overlay" onClick={() => setShowDeleteConfirm(false)}
                  role="dialog" aria-modal="true" aria-label="Confirm delete review">
                  <div className="sc-del-box" onClick={e => e.stopPropagation()}>
                    <div className="sc-del-icon" aria-hidden="true">🗑️</div>
                    <div className="sc-del-title">Delete your review?</div>
                    <div className="sc-del-sub">This cannot be undone. You can write a new one after.</div>
                    <div className="sc-del-actions">
                      <button className="sc-del-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                      <button className="sc-del-confirm" onClick={deleteReview} disabled={deleting}>
                        {deleting ? "Deleting…" : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editing ? (
                <div className="sc-edit-form">
                  <div className="sc-edit-header">
                    <span className="sc-edit-title">✏️ Edit Your Review</span>
                    <button className="sc-edit-cancel-btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                  <div className="sc-form-label">Your Rating *</div>
                  <StarPicker value={editRating} onChange={setEditRating}/>
                  <div className="sc-form-label" style={{ marginTop:14 }}>
                    Your Review * <span className="sc-form-hint">(min. 20 characters)</span>
                  </div>
                  <textarea className="sc-textarea" value={editText}
                    onChange={e => setEditText(e.target.value)}
                    maxLength={500} rows={4} placeholder="Update your experience…"
                    aria-label="Edit your review"/>
                  <div className="sc-char-count" aria-live="polite">{editText.length}/500</div>
                  {editStatus === "err" && (
                    <div className="sc-status sc-status-err" role="alert">❌ Something went wrong. Please try again.</div>
                  )}
                  <button className="sc-submit-btn" onClick={saveEdit}
                    disabled={editSaving || editRating === 0 || editText.trim().length < 20}
                    aria-busy={editSaving}>
                    {editSaving ? <><span className="sc-submit-spinner" aria-hidden="true"/> Saving…</> : "💾 Save Changes"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="sc-ar-top">
                    <div className="sc-ar-icon" aria-hidden="true">✅</div>
                    <div className="sc-ar-body">
                      <div className="sc-ar-title">Your Review</div>
                      <div className="sc-ar-stars" aria-label={`Your rating: ${myReview.rating} stars`}>
                        {"★".repeat(myReview.rating)}
                        <span className="sc-ar-stars-dim">{"★".repeat(5 - myReview.rating)}</span>
                      </div>
                      <p className="sc-ar-text">&ldquo;{myReview.review_text}&rdquo;</p>
                    </div>
                  </div>
                  <div className="sc-ar-actions">
                    <button className="sc-ar-edit-btn" onClick={startEdit} aria-label="Edit your review">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <button className="sc-ar-delete-btn" onClick={() => setShowDeleteConfirm(true)} aria-label="Delete your review">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="sc-form-header">
                <div className="sc-form-avatar" aria-hidden="true">{fullName.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="sc-form-name">{fullName}</div>
                  <div className="sc-form-email">{profile?.email || user?.email}</div>
                </div>
              </div>

              <div className="sc-form-label">Your Rating *</div>
              <StarPicker value={rating} onChange={setRating}/>

              <div className="sc-form-label" style={{ marginTop:16 }}>
                Your Review * <span className="sc-form-hint">(min. 20 characters)</span>
              </div>
              <label htmlFor="sc-review-text" style={{ position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0,0,0,0)" }}>
                Your review
              </label>
              <textarea id="sc-review-text" className="sc-textarea"
                placeholder="Share your experience with AIDLA — what do you love most? How has it helped you?"
                value={text} onChange={e => setText(e.target.value)}
                maxLength={500} rows={4}/>
              <div className="sc-char-count" aria-live="polite">{text.length}/500</div>

              {status === "ok"  && <div className="sc-status sc-status-ok" role="status">✅ Review submitted! Thank you, {fullName.split(" ")[0]}! 🎉</div>}
              {status === "dup" && <div className="sc-status sc-status-warn" role="status">ℹ️ You&apos;ve already submitted a review.</div>}
              {status === "err" && <div className="sc-status sc-status-err" role="alert">❌ Something went wrong. Please try again.</div>}

              <button className="sc-submit-btn" onClick={submitReview}
                disabled={submitting || rating === 0 || text.trim().length < 20}
                aria-busy={submitting}>
                {submitting
                  ? <><span className="sc-submit-spinner" aria-hidden="true"/> Submitting…</>
                  : "⭐ Submit Review"}
              </button>
            </>
          )}
        </div>

        {/* Reviews list */}
        {reviewsLoading ? (
          <div className="sc-loading" aria-live="polite">
            <div className="sc-spinner" aria-hidden="true"/>
            <span>Loading reviews…</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="sc-empty-reviews">
            <div className="sc-empty-icon" aria-hidden="true">💬</div>
            <p>No reviews yet — be the first!</p>
          </div>
        ) : (
          <div className="sc-reviews-grid" role="list" aria-label="Community reviews">
            {reviews.map(r => (
              <div key={r.id} role="listitem">
                <ReviewCard review={r}/>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── CSS (performance optimized, mobile-first) ──────────────────────────────
const CSS = `
  .sc-root {
    max-width: 900px;
    margin: 0 auto;
    font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    padding: 0 16px 40px;
  }

  /* Page header */
  .sc-page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(15,23,42,0.06);
    animation: scFadeIn 0.35s ease both;
  }
  @keyframes scFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sc-page-header-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: #eff6ff;
    border: 1px solid rgba(59,130,246,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .sc-page-title {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-weight: 800;
    letter-spacing: -0.3px;
    color: #0f172a;
    margin: 0 0 2px;
    line-height: 1.2;
  }
  .sc-page-sub {
    font-size: clamp(0.75rem, 2vw, 0.82rem);
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }

  /* Sections */
  .sc-section {
    margin-bottom: 36px;
  }
  .sc-section-header {
    text-align: center;
    margin-bottom: 20px;
  }
  .sc-section-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 100px;
    background: rgba(30,58,138,0.06);
    border: 1px solid rgba(30,58,138,0.1);
    font-size: clamp(0.68rem, 1.5vw, 0.74rem);
    font-weight: 700;
    color: #1e3a8a;
    letter-spacing: 0.3px;
    margin-bottom: 8px;
  }
  .sc-section-title {
    font-size: clamp(1rem, 2.5vw, 1.35rem);
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px;
    letter-spacing: -0.2px;
  }
  .sc-section-sub {
    font-size: clamp(0.76rem, 2vw, 0.84rem);
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }

  /* Average rating */
  .sc-avg-rating {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(245,158,11,0.06);
    border: 1px solid rgba(245,158,11,0.2);
  }
  .sc-avg-num {
    font-size: 1.1rem;
    font-weight: 800;
    color: #b45309;
  }
  .sc-avg-stars {
    font-size: 0.95rem;
    color: #f59e0b;
    letter-spacing: 1px;
  }
  .sc-avg-count {
    font-size: 0.76rem;
    color: #78716c;
    font-weight: 600;
  }

  /* Social cards grid */
  .sc-socials-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .sc-social-card {
    background: #ffffff;
    border: 1px solid var(--s-border);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
    animation: scCardIn 0.3s ease both;
  }
  .sc-social-card:hover {
    box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 6px 20px rgba(15,23,42,0.05);
    border-color: var(--s-color);
  }
  @keyframes scCardIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sc-social-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sc-social-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sc-social-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #0f172a;
  }
  .sc-social-handle {
    font-size: 0.74rem;
    color: #64748b;
    font-weight: 500;
    margin-top: 1px;
  }
  .sc-social-desc {
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.5;
    flex: 1;
  }
  .sc-social-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .sc-follow-btn {
    flex: 1;
    text-align: center;
    padding: 9px 16px;
    border-radius: 10px;
    border: none;
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s ease;
    display: block;
    opacity: 0.92;
  }
  .sc-follow-btn:hover {
    opacity: 1;
  }
  .sc-follow-btn:focus-visible {
    outline: 3px solid rgba(255,255,255,0.7);
    outline-offset: 2px;
  }
  .sc-copy-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(15,23,42,0.1);
    background: #f8fafc;
    color: #475569;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
    white-space: nowrap;
    font-family: inherit;
  }
  .sc-copy-btn:hover {
    background: #f1f5f9;
    color: #1e3a8a;
  }
  .sc-copy-btn:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Review form card */
  .sc-review-form-card {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.07);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.03);
  }
  .sc-form-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(15,23,42,0.06);
  }
  .sc-form-avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
    background: #eff6ff;
    border: 1px solid rgba(59,130,246,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e3a8a;
    font-size: 0.88rem;
    font-weight: 700;
  }
  .sc-form-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: #0f172a;
  }
  .sc-form-email {
    font-size: 0.74rem;
    color: #64748b;
    margin-top: 1px;
  }
  .sc-form-label {
    font-size: 0.74rem;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 8px;
  }
  .sc-form-hint {
    text-transform: none;
    font-weight: 500;
    color: #94a3b8;
  }

  /* Star picker */
  .sc-star-row {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: wrap;
    white-space: normal;
  }
  .sc-star {
    font-size: 1.35rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #cbd5e1;
    transition: color 0.12s ease;
    padding: 3px;
    line-height: 1;
    font-family: inherit;
    min-width: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sc-star-on {
    color: #f59e0b;
  }
  .sc-star:focus-visible {
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
    border-radius: 6px;
  }
  .sc-star-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #f59e0b;
    margin-left: 0;
    width: 100%;
    margin-top: 2px;
    animation: scFadeIn 0.2s ease;
  }

  /* Textarea */
  .sc-textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(15,23,42,0.1);
    background: #f8fafc;
    font-family: inherit;
    font-size: 0.88rem;
    color: #0f172a;
    line-height: 1.55;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    box-sizing: border-box;
  }
  .sc-textarea:focus {
    outline: none;
    background: #ffffff;
    border-color: rgba(59,130,246,0.35);
  }
  .sc-char-count {
    text-align: right;
    font-size: 0.72rem;
    color: #94a3b8;
    font-weight: 600;
    margin-top: 4px;
  }

  /* Status messages */
  .sc-status {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    margin: 10px 0;
  }
  .sc-status-ok {
    background: rgba(22,163,74,0.06);
    color: #15803d;
    border: 1px solid rgba(22,163,74,0.15);
  }
  .sc-status-warn {
    background: rgba(245,158,11,0.06);
    color: #b45309;
    border: 1px solid rgba(245,158,11,0.15);
  }
  .sc-status-err {
    background: rgba(239,68,68,0.06);
    color: #dc2626;
    border: 1px solid rgba(239,68,68,0.15);
  }

  /* Submit button */
  .sc-submit-btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: #1e3a8a;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 14px;
    transition: background-color 0.15s ease, opacity 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: inherit;
  }
  .sc-submit-btn:hover:not(:disabled) {
    background: #1e40af;
  }
  .sc-submit-btn:active:not(:disabled) {
    opacity: 0.9;
  }
  .sc-submit-btn:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
  .sc-submit-spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    animation: scSpin 0.7s linear infinite;
  }
  @keyframes scSpin {
    to { transform: rotate(360deg); }
  }

  /* Already reviewed */
  .sc-already-reviewed {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .sc-ar-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .sc-ar-icon {
    font-size: 1.6rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .sc-ar-body {
    flex: 1;
    min-width: 0;
  }
  .sc-ar-title {
    font-weight: 700;
    font-size: 0.88rem;
    color: #15803d;
    margin-bottom: 4px;
  }
  .sc-ar-stars {
    font-size: 1rem;
    color: #f59e0b;
    margin-bottom: 6px;
  }
  .sc-ar-stars-dim {
    opacity: 0.2;
  }
  .sc-ar-text {
    font-size: 0.84rem;
    color: #475569;
    line-height: 1.55;
    font-style: italic;
    margin: 0;
  }
  .sc-ar-actions {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid rgba(15,23,42,0.06);
  }
  .sc-ar-edit-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(30,58,138,0.15);
    background: transparent;
    color: #1e3a8a;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .sc-ar-edit-btn:hover {
    background: rgba(30,58,138,0.06);
  }
  .sc-ar-delete-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(239,68,68,0.15);
    background: transparent;
    color: #dc2626;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .sc-ar-delete-btn:hover {
    background: rgba(239,68,68,0.06);
  }

  /* Edit form */
  .sc-edit-form {
    width: 100%;
  }
  .sc-edit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(15,23,42,0.06);
  }
  .sc-edit-title {
    font-weight: 700;
    font-size: 0.9rem;
    color: #0f172a;
  }
  .sc-edit-cancel-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(15,23,42,0.12);
    background: transparent;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .sc-edit-cancel-btn:hover {
    background: #f1f5f9;
  }

  /* Delete confirm modal */
  .sc-del-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(15,23,42,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .sc-del-box {
    background: #fff;
    border-radius: 18px;
    padding: 26px 22px;
    text-align: center;
    max-width: 340px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(15,23,42,0.12);
    animation: scConfirmIn 0.2s ease forwards;
  }
  @keyframes scConfirmIn {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .sc-del-icon {
    font-size: 38px;
    margin-bottom: 8px;
  }
  .sc-del-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }
  .sc-del-sub {
    font-size: 0.82rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 20px;
  }
  .sc-del-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
  .sc-del-cancel {
    padding: 9px 20px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: transparent;
    color: #475569;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .sc-del-cancel:hover {
    background: #f8fafc;
  }
  .sc-del-confirm {
    padding: 9px 20px;
    border-radius: 10px;
    border: none;
    background: #dc2626;
    color: #fff;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: inherit;
  }
  .sc-del-confirm:hover:not(:disabled) {
    background: #b91c1c;
  }
  .sc-del-confirm:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Reviews grid */
  .sc-reviews-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .sc-review-card {
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.06);
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 1px 3px rgba(15,23,42,0.03);
    animation: scCardIn 0.25s ease both;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sc-review-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sc-review-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
    background: #eff6ff;
    border: 1px solid rgba(59,130,246,0.12);
    color: #1e3a8a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    font-weight: 700;
  }
  .sc-review-name {
    font-weight: 700;
    font-size: 0.85rem;
    color: #0f172a;
  }
  .sc-review-time {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 500;
    margin-top: 1px;
  }
  .sc-review-stars {
    margin-left: auto;
    font-size: 0.82rem;
    color: #f59e0b;
    white-space: nowrap;
  }
  .sc-review-stars-dim {
    opacity: 0.2;
  }
  .sc-review-text {
    font-size: 0.82rem;
    color: #475569;
    line-height: 1.55;
    font-style: italic;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Loading */
  .sc-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 600;
    padding: 20px;
    justify-content: center;
  }
  .sc-spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(59,130,246,0.15);
    border-top-color: #3b82f6;
    animation: scSpin 0.7s linear infinite;
  }

  /* Empty reviews */
  .sc-empty-reviews {
    text-align: center;
    padding: 30px;
    color: #94a3b8;
    font-size: 0.86rem;
    font-weight: 600;
  }
  .sc-empty-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }

  /* ── Mobile-first responsive breakpoints ── */

  /* 480px+ — two-column social cards */
  @media (min-width: 480px) {
    .sc-socials-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .sc-reviews-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* 640px+ — larger touch targets */
  @media (min-width: 640px) {
    .sc-root {
      padding: 0 20px 48px;
    }
    .sc-page-header-icon {
      width: 48px;
      height: 48px;
      font-size: 24px;
      border-radius: 15px;
    }
    .sc-review-form-card {
      padding: 24px;
      border-radius: 18px;
    }
    .sc-social-card {
      padding: 18px;
    }
    .sc-star {
      font-size: 1.9rem;
    }
  }

  /* 768px+ — three-column grids */
  @media (min-width: 768px) {
    .sc-socials-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .sc-reviews-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .sc-section {
      margin-bottom: 48px;
    }
  }

  /* 1024px+ — refined spacing */
  @media (min-width: 1024px) {
    .sc-root {
      padding: 0 24px 56px;
    }
    .sc-section-header {
      margin-bottom: 24px;
    }
  }

  /* Safe area for notched devices */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .sc-root {
      padding-bottom: calc(40px + env(safe-area-inset-bottom));
    }
    @media (min-width: 640px) {
      .sc-root {
        padding-bottom: calc(48px + env(safe-area-inset-bottom));
      }
    }
    @media (min-width: 1024px) {
      .sc-root {
        padding-bottom: calc(56px + env(safe-area-inset-bottom));
      }
    }
  }
`;