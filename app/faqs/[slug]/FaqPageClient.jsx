"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./faqspage.css";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const SITE_URL = "https://www.aidla.online";

const CATEGORIES = [
  { id: "general",               label: "General",          icon: "🌐" },
  { id: "coins_rewards",         label: "Coins & Rewards",  icon: "🪙" },
  { id: "tests_quizzes",         label: "Tests & Quizzes",  icon: "📝" },
  { id: "lucky_draw",            label: "Lucky Draw",       icon: "🎲" },
  { id: "account_profile",       label: "Account",          icon: "👤" },
  { id: "withdrawals",           label: "Withdrawals",      icon: "💵" },
  { id: "education",             label: "Education",        icon: "🎓" },
  { id: "career",                label: "Career",           icon: "💼" },
  { id: "finance",               label: "Finance",          icon: "💰" },
  { id: "health",                label: "Health",           icon: "🏥" },
  { id: "scholarships",          label: "Scholarships",     icon: "🏅" },
  { id: "pakistan_boards",       label: "Pakistan Boards",  icon: "📋" },
  { id: "university_admissions", label: "Admissions",       icon: "🏛️" },
  { id: "study_abroad",          label: "Study Abroad",     icon: "✈️" },
  { id: "technology",            label: "Technology",       icon: "💻" },
  { id: "css_pms",               label: "CSS & PMS",        icon: "🏛"  },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function getFingerprint() {
  if (typeof window === "undefined") return "ssr-fp";
  const key = "aidla_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = "fp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(key, fp);
  }
  return fp;
}

/* ══════════════════════════════════════════════
   ASK FORM
══════════════════════════════════════════════ */
function AskForm() {
  const [form,      setForm]      = useState({ name: "", email: "", question: "" });
  const [state,     setState]     = useState("idle");
  const [msg,       setMsg]       = useState("");
  const [duplicate, setDuplicate] = useState(null);
  const charLeft = 500 - form.question.length;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.question.trim()) {
      setState("err"); setMsg("Please fill in all fields."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setState("err"); setMsg("Please enter a valid email address."); return;
    }
    if (form.question.length < 10) {
      setState("err"); setMsg("Question must be at least 10 characters."); return;
    }
    setState("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-faq-generator`,
        {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            secret:   "aidla_faqs_2025",
            action:   "check_duplicate",
            question: form.question.trim(),
          }),
        }
      );
      const data = await res.json();
      if (data.ok && data.isDuplicate && data.matchedSlug) {
        setDuplicate({ question: data.matchedQuestion, slug: data.matchedSlug });
        setState("idle");
        return;
      }
    } catch {}

    const { error } = await supabase.from("user_questions").insert({
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      question: form.question.trim(),
    });
    if (error) {
      setState("err"); setMsg("Something went wrong. Please try again.");
    } else {
      setState("ok");
      setMsg("✅ Question submitted! Our team will answer and publish it soon.");
      setForm({ name: "", email: "", question: "" });
    }
  };

  const handleSubmitAnyway = async () => {
    setDuplicate(null); setState("loading");
    const { error } = await supabase.from("user_questions").insert({
      name:     form.name.trim(),
      email:    form.email.trim().toLowerCase(),
      question: form.question.trim(),
    });
    if (error) {
      setState("err"); setMsg("Something went wrong. Please try again.");
    } else {
      setState("ok");
      setMsg("✅ Question submitted!");
      setForm({ name: "", email: "", question: "" });
    }
  };

  return (
    <>
      {duplicate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 9999, display: "flex", alignItems: "center",
          justifyContent: "center", padding: 20,
        }}
          role="dialog" aria-modal="true" aria-labelledby="dup-modal-title"
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }} aria-hidden="true">💡</div>
            <h3 id="dup-modal-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 900, color: "#0b1437", margin: "0 0 8px" }}>
              We Already Have This Answer!
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 16px" }}>
              Your question is similar to an existing FAQ:
            </p>
            <div style={{ background: "#f0f4ff", border: "1.5px solid rgba(26,58,143,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: "0.9rem", fontWeight: 700, color: "#0b1437", lineHeight: 1.4 }}>
              "{duplicate.question}"
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href={`/faqs/${duplicate.slug}`} style={{ padding: "10px 22px", borderRadius: 30, background: "linear-gradient(135deg,#0b1437,#1a3a8f)", color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: "0.88rem" }}>
                View Answer →
              </Link>
              <button onClick={handleSubmitAnyway} suppressHydrationWarning style={{ padding: "10px 22px", borderRadius: 30, background: "#fff", border: "1.5px solid rgba(26,58,143,0.2)", color: "#475569", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                Submit Anyway
              </button>
              <button onClick={() => setDuplicate(null)} suppressHydrationWarning style={{ padding: "10px 22px", borderRadius: 30, background: "#fff", border: "1.5px solid #e2e8f0", color: "#94a3b8", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ask-form-wrap" id="ask-question">
        <div className="ask-form-header">
          <span className="ask-form-icon" aria-hidden="true">💬</span>
          <div>
            <h2 className="ask-form-title">Can't find your answer?</h2>
            <p className="ask-form-sub">Ask us — our team will answer and publish it to help others.</p>
          </div>
        </div>
        {state === "ok"  && <div className="ask-msg ask-msg--ok"  role="alert">{msg}</div>}
        {state === "err" && <div className="ask-msg ask-msg--err" role="alert">{msg}</div>}
        {state !== "ok" && (
          <>
            <div className="ask-row-2">
              <div>
                <label className="ask-label" htmlFor="faqp-name">Your Name *</label>
                <input id="faqp-name" className="ask-input" placeholder="Muhammad Ali" value={form.name} onChange={e => set("name", e.target.value)} autoComplete="name" suppressHydrationWarning />
              </div>
              <div>
                <label className="ask-label" htmlFor="faqp-email">Email Address *</label>
                <input id="faqp-email" className="ask-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" suppressHydrationWarning />
              </div>
            </div>
            <label className="ask-label" htmlFor="faqp-question">Your Question *</label>
            <textarea id="faqp-question" className="ask-textarea" placeholder="Type your question clearly..." value={form.question} onChange={e => set("question", e.target.value.slice(0, 500))} rows={4} suppressHydrationWarning />
            <div className="ask-char-count" aria-live="polite">{charLeft} characters left</div>
            <button className="ask-submit" onClick={handleSubmit} disabled={state === "loading"} aria-busy={state === "loading"} suppressHydrationWarning>
              {state === "loading" ? <span className="ask-spinner" aria-hidden="true" /> : "🚀 Submit Question"}
            </button>
            <p className="ask-privacy">🔒 Your email is only used to notify you — never shared publicly.</p>
          </>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   Props: faq (full row, server-fetched)
══════════════════════════════════════════════ */
export default function FaqPageClient({ faq: initialFaq }) {
  const [faq,      setFaq]      = useState(initialFaq);
  const [related,  setRelated]  = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [shared,   setShared]   = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const fp = useRef("");

  // Set contentReady after mount to replace skeleton with real content
  useEffect(() => {
    setContentReady(true);
  }, []);

  useEffect(() => {
    fp.current = getFingerprint();

    const init = async () => {
      // View tracking — sessionStorage dedup
      const viewKey = `faq_viewed_${faq.id}`;
      if (!sessionStorage.getItem(viewKey)) {
        sessionStorage.setItem(viewKey, "1");
        try {
          if (window.requestIdleCallback) {
            requestIdleCallback(() => supabase.rpc("faq_increment_view", { p_faq_id: faq.id }));
          } else {
            await supabase.rpc("faq_increment_view", { p_faq_id: faq.id });
          }
        } catch {}
      }

      // Related FAQs (low priority)
      try {
        if (window.requestIdleCallback) {
          requestIdleCallback(async () => {
            const { data } = await supabase.rpc("get_related_faqs", {
              p_faq_id:   faq.id,
              p_category: faq.category,
              p_question: faq.question,
              p_limit:    5,
            });
            setRelated(data || []);
          });
        } else {
          const { data } = await supabase.rpc("get_related_faqs", {
            p_faq_id:   faq.id,
            p_category: faq.category,
            p_question: faq.question,
            p_limit:    5,
          });
          setRelated(data || []);
        }
      } catch {}

      // Load user's existing vote
      try {
        const { data } = await supabase
          .from("faq_helpful_votes")
          .select("vote")
          .eq("faq_id", faq.id)
          .eq("fingerprint", fp.current)
          .maybeSingle();
        setUserVote(data?.vote || null);
      } catch {}
    };

    init();
  }, [faq.id]);

  const handleVote = useCallback(async (vote) => {
    const prev    = userVote;
    const newVote = prev === vote ? null : vote;

    // Optimistic update
    setUserVote(newVote);
    setFaq(f => {
      let yes = f.helpful_yes;
      let no  = f.helpful_no;
      if (prev === "yes") yes--;
      if (prev === "no")  no--;
      if (newVote === "yes") yes++;
      if (newVote === "no")  no++;
      return { ...f, helpful_yes: Math.max(0, yes), helpful_no: Math.max(0, no) };
    });

    try {
      const { data } = await supabase.rpc("faq_toggle_helpful", {
        p_faq_id:      faq.id,
        p_fingerprint: fp.current,
        p_vote:        vote,
      });
      if (data) {
        setFaq(f => f ? { ...f, helpful_yes: data.helpful_yes, helpful_no: data.helpful_no } : f);
      }
    } catch {}
  }, [faq.id, userVote]);

  const handleShare = useCallback(() => {
    const url = `${SITE_URL}/faqs/${faq.slug}`;
    if (navigator.share) {
      navigator.share({ title: faq.question, url });
    } else {
      navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }, [faq.slug, faq.question]);

  const cat        = CAT_MAP[faq.category];
  const totalVotes = faq.helpful_yes + faq.helpful_no;
  const helpfulPct = totalVotes > 0 ? Math.round((faq.helpful_yes / totalVotes) * 100) : null;

  return (
    <main
      className="faqp-page"
      id="main-content"
      itemScope
      itemType="https://schema.org/QAPage"
    >
      {/* ── Hero ── */}
      <header className="faqp-hero">
        <div className="faqp-hero-bg" aria-hidden="true" />
        <div className="faqp-hero-inner">
          <nav className="faqp-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <span aria-hidden="true">›</span>
              <li><Link href="/faqs">FAQs</Link></li>
              <span aria-hidden="true">›</span>
              <li><Link href={`/faqs?cat=${faq.category}`}>{cat?.icon} {cat?.label}</Link></li>
            </ol>
          </nav>

          <div className="faqp-cat-badge">
            <span aria-hidden="true">{cat?.icon}</span>
            <span>{cat?.label}</span>
          </div>

          <h1 className="faqp-hero-title" itemProp="name">
            {faq.question}
          </h1>

          <div className="faqp-hero-meta">
            <span>👁 {faq.view_count} views</span>
            <span className="faqp-meta-dot" aria-hidden="true">·</span>
            <span>👍 {faq.helpful_yes} found helpful</span>
            {faq.updated_at && (
              <>
                <span className="faqp-meta-dot" aria-hidden="true">·</span>
                <span>
                  Updated{" "}
                  <time dateTime={faq.updated_at}>
                    {new Date(faq.updated_at).toLocaleDateString("en-PK", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </time>
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="faqp-content-wrap">
        {/* Skeleton placeholder until content is ready */}
        {!contentReady ? (
          <div className="faqp-answer-skeleton">
            <div className="faqp-skeleton-line" />
            <div className="faqp-skeleton-line short" />
            <div className="faqp-skeleton-line medium" />
            <div className="faqp-skeleton-line short" />
          </div>
        ) : (
          <article
            className="faqp-answer-card"
            itemScope
            itemType="https://schema.org/Answer"
            itemProp="acceptedAnswer"
          >
            <div className="faqp-answer-label">
              <span className="faqp-answer-label-dot" aria-hidden="true" />
              Official Answer
            </div>
            <div
              className="faqp-answer-text"
              itemProp="text"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
            <div className="faqp-answer-author">
              <div className="faqp-author-avatar" aria-hidden="true">A</div>
              <div>
                <div className="faqp-author-name">AIDLA Support Team</div>
                <div className="faqp-author-role">
                  Official Answer ·{" "}
                  <time dateTime={faq.updated_at || faq.created_at}>
                    {new Date(faq.updated_at || faq.created_at).toLocaleDateString("en-PK", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Helpful + Share */}
        <div className="faqp-actions-row">
          <div className="faqp-helpful-wrap">
            <span className="faqp-helpful-label">Was this helpful?</span>
            <div className="faqp-vote-btns">
              <button
                className={`faqp-vote-btn${userVote === "yes" ? " faqp-vote-btn--active faqp-vote-btn--yes" : ""}`}
                onClick={() => handleVote("yes")}
                aria-pressed={userVote === "yes"}
                suppressHydrationWarning
              >
                👍 Yes <span className="faqp-vote-count">{faq.helpful_yes}</span>
              </button>
              <button
                className={`faqp-vote-btn${userVote === "no" ? " faqp-vote-btn--active faqp-vote-btn--no" : ""}`}
                onClick={() => handleVote("no")}
                aria-pressed={userVote === "no"}
                suppressHydrationWarning
              >
                👎 No <span className="faqp-vote-count">{faq.helpful_no}</span>
              </button>
            </div>
            {helpfulPct !== null && (
              <span className="faqp-helpful-pct">{helpfulPct}% found this helpful</span>
            )}
          </div>
          <button
            className="faqp-share-btn"
            onClick={handleShare}
            aria-label="Share this FAQ"
            suppressHydrationWarning
          >
            {shared ? "✅ Copied!" : "🔗 Share"}
          </button>
        </div>

        {/* Related FAQs */}
        {related.length > 0 && (
          <section className="faqp-related" aria-labelledby="related-heading">
            <h2 className="faqp-related-title" id="related-heading">
              <span aria-hidden="true">{cat?.icon}</span> More {cat?.label} Questions
            </h2>
            <div className="faqp-related-list">
              {related.map(r => (
                <Link key={r.id} href={`/faqs/${r.slug}`} className="faqp-related-card">
                  <span className="faqp-related-q">{r.question}</span>
                  <span className="faqp-related-arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <Link href={`/faqs?cat=${faq.category}`} className="faqp-see-all">
              See all {cat?.label} FAQs →
            </Link>
          </section>
        )}

        {/* Back link */}
        <div className="faqp-back-row">
          <Link href="/faqs" className="faqp-back-link">← Back to all FAQs</Link>
        </div>

        {/* Ask form */}
        <AskForm />
      </div>
    </main>
  );
}