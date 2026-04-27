"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "./faqs.css";

const CATEGORIES =[
  { id: "all",                   label: "All",              icon: "◎"  },
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

function highlight(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="faq-highlight">{p}</mark>
      : p
  );
}

function highlightHtml(html, query) {
  if (!query.trim()) return html;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`(${escaped})`, "gi"), '<mark class="faq-highlight">$1</mark>');
}

function FAQItem({ faq, isOpen, onToggle, searchQuery, userVotes, onVote }) {
  const [copied, setCopied] = useState(false);
  const voted = userVotes[faq.id];
  const totalVotes = faq.helpful_yes + faq.helpful_no;
  const pct = totalVotes > 0 ? Math.round((faq.helpful_yes / totalVotes) * 100) : null;

  const handleShare = () => {
    const url = faq.slug
      ? `${window.location.origin}/faqs/${faq.slug}`
      : `${window.location.origin}/faqs#faq-${faq.id}`;
    if (navigator.share) {
      navigator.share({ title: faq.question, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id={`faq-${faq.id}`} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-body-${faq.id}`}
      >
        <span className="faq-q-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
        <h3 className="faq-q-text">{highlight(faq.question, searchQuery)}</h3>
      </button>

      <div
        id={`faq-body-${faq.id}`}
        className={`faq-answer-wrap${isOpen ? " faq-answer-wrap--open" : ""}`}
        role="region"
      >
        <div className="faq-answer-inner">
          <div
            className="faq-answer-text"
            dangerouslySetInnerHTML={{ __html: highlightHtml(faq.answer, searchQuery) }}
          />
          <div className="faq-meta-row">
            <span className="faq-views">👁 {faq.view_count} views</span>
            {faq.category !== "all" && (
              <span className="faq-cat-tag">
                {CAT_MAP[faq.category]?.icon} {CAT_MAP[faq.category]?.label}
              </span>
            )}
          </div>
          <div className="faq-helpful-row">
            <span className="faq-helpful-label">Was this helpful?</span>
            <button
              className={`faq-helpful-btn${voted === "yes" ? " faq-helpful-btn--active" : ""}`}
              onClick={() => onVote(faq.id, "yes")}
              aria-pressed={voted === "yes"}
            >👍 {faq.helpful_yes}</button>
            <button
              className={`faq-helpful-btn faq-helpful-no${voted === "no" ? " faq-helpful-btn--active faq-helpful-btn--no" : ""}`}
              onClick={() => onVote(faq.id, "no")}
              aria-pressed={voted === "no"}
            >👎 {faq.helpful_no}</button>
            {pct !== null && <span className="faq-helpful-pct">{pct}% found helpful</span>}
            <button className="faq-helpful-btn" onClick={handleShare} style={{ marginLeft: "auto" }}>
              {copied ? "✅ Copied!" : "🔗 Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AskForm({ onSubmit }) {
  const [form, setForm]   = useState({ name: "", email: "", question: "" });
  const [state, setState] = useState("idle");
  const [msg, setMsg]     = useState("");
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-faq-generator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ secret: "aidla_faqs_2025", action: "check_duplicate", question: form.question.trim() }),
      });
      const data = await res.json();
      if (data.ok && data.isDuplicate && data.matchedSlug) {
        setDuplicate({ question: data.matchedQuestion, slug: data.matchedSlug });
        setState("idle"); return;
      }
    } catch {}

    const { error } = await supabase.from("user_questions").insert({
      name: form.name.trim(), email: form.email.trim().toLowerCase(), question: form.question.trim(),
    });
    if (error) { setState("err"); setMsg("Something went wrong. Please try again."); }
    else {
      setState("ok"); setMsg("✅ Question submitted! Our team will answer and publish it soon.");
      setForm({ name: "", email: "", question: "" });
      if (onSubmit) onSubmit();
    }
  };

  const handleSubmitAnyway = async () => {
    setDuplicate(null); setState("loading");
    const { error } = await supabase.from("user_questions").insert({
      name: form.name.trim(), email: form.email.trim().toLowerCase(), question: form.question.trim(),
    });
    if (error) { setState("err"); setMsg("Something went wrong."); }
    else { setState("ok"); setMsg("✅ Question submitted!"); setForm({ name: "", email: "", question: "" }); if (onSubmit) onSubmit(); }
  };

  return (
    <>
      {duplicate && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#fff",borderRadius:20,padding:28,maxWidth:420,width:"100%",boxShadow:"0 24px 60px rgba(0,0,0,0.2)",textAlign:"center" }}>
            <div style={{ fontSize:"2.5rem",marginBottom:12 }}>💡</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:900,color:"#0b1437",margin:"0 0 8px" }}>We Already Have This Answer!</h3>
            <p style={{ fontSize:"0.85rem",color:"#64748b",margin:"0 0 16px" }}>Your question is similar to:</p>
            <div style={{ background:"#f0f4ff",border:"1.5px solid rgba(26,58,143,0.15)",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:"0.9rem",fontWeight:700,color:"#0b1437" }}>"{duplicate.question}"</div>
            <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
              <Link href={`/faqs/${duplicate.slug}`} style={{ padding:"10px 22px",borderRadius:30,background:"linear-gradient(135deg,#0b1437,#1a3a8f)",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:"0.88rem" }}>View Answer →</Link>
              <button onClick={handleSubmitAnyway} style={{ padding:"10px 22px",borderRadius:30,background:"#fff",border:"1.5px solid rgba(26,58,143,0.2)",color:"#475569",fontWeight:700,fontSize:"0.88rem",cursor:"pointer" }}>Submit Anyway</button>
              <button onClick={() => setDuplicate(null)} style={{ padding:"10px 22px",borderRadius:30,background:"#fff",border:"1.5px solid #e2e8f0",color:"#94a3b8",fontWeight:700,fontSize:"0.88rem",cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="ask-form-wrap" id="ask-question">
        <div className="ask-form-header">
          <span className="ask-form-icon">💬</span>
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
                <label className="ask-label" htmlFor="ask-name">Your Name *</label>
                <input id="ask-name" className="ask-input" placeholder="Muhammad Ali" value={form.name} onChange={e => set("name", e.target.value)} autoComplete="name" />
              </div>
              <div>
                <label className="ask-label" htmlFor="ask-email">Email Address *</label>
                <input id="ask-email" className="ask-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" />
              </div>
            </div>
            <label className="ask-label" htmlFor="ask-question">Your Question *</label>
            <textarea id="ask-question" className="ask-textarea" placeholder="Type your question clearly..." value={form.question} onChange={e => set("question", e.target.value.slice(0, 500))} rows={4} />
            <div className="ask-char-count">{charLeft} characters left</div>
            <button className="ask-submit" onClick={handleSubmit} disabled={state === "loading"}>
              {state === "loading" ? <span className="ask-spinner" /> : "🚀 Submit Question"}
            </button>
            <p className="ask-privacy">🔒 Your email is only used to notify you — never shared publicly.</p>
          </>
        )}
      </div>
    </>
  );
}

export default function FaqsClient({ initialFaqs, fetchError, initialCat = "all" }) {
  const router = useRouter();
  const [faqs,         setFaqs]         = useState(initialFaqs);
  const [search,       setSearch]       = useState("");
  
  // BOT FIX: Initialize state perfectly with Server data so no layout shift occurs
  const [activeCat,    setActiveCat]    = useState(initialCat);
  const [openIds,      setOpenIds]      = useState({});
  const[userVotes,    setUserVotes]    = useState({});
  const [searchResults,setSearchResults]= useState(null);
  const [searchLoading,setSearchLoading]= useState(false);
  
  const searchRef      = useRef(null);
  const searchTimeout  = useRef(null);
  const fp             = useRef("");

  useEffect(() => {
    fp.current = getFingerprint();
    loadVotes();
  },[]);

  const loadVotes = async () => {
    if (!fp.current) return;
    const { data } = await supabase.from("faq_helpful_votes").select("faq_id,vote").eq("fingerprint", fp.current);
    if (data) {
      const map = {};
      data.forEach(v => { map[v.faq_id] = v.vote; });
      setUserVotes(map);
    }
  };

  const handleCatChange = (catId) => {
    setActiveCat(catId);
    setOpenIds({});
    router.replace(catId !== "all" ? `/faqs?cat=${catId}` : "/faqs", { scroll: false });
  };

  const handleToggle = useCallback(async (id) => {
    const isOpen = openIds[id];
    if (!isOpen) {
      await supabase.rpc("faq_increment_view", { p_faq_id: id });
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, view_count: f.view_count + 1 } : f));
    }
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  }, [openIds]);

  const handleVote = useCallback(async (faqId, vote) => {
    const prev = userVotes[faqId];
    setUserVotes(p => ({ ...p, [faqId]: prev === vote ? undefined : vote }));
    const { data } = await supabase.rpc("faq_toggle_helpful", { p_faq_id: faqId, p_fingerprint: fp.current, p_vote: vote });
    if (data) setFaqs(p => p.map(f => f.id === faqId ? { ...f, helpful_yes: data.helpful_yes, helpful_no: data.helpful_no } : f));
  }, [userVotes]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!search.trim() || search.trim().length < 2) { setSearchResults(null); setOpenIds({}); setSearchLoading(false); return; }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc("search_faqs", { search_query: search.trim() });
        if (!error && data) {
          setSearchResults(data);
          const matches = {};
          data.forEach(f => { matches[f.id] = true; });
          setOpenIds(matches);
        } else { setSearchResults(null); }
      } catch { setSearchResults(null); }
      finally { setSearchLoading(false); }
    }, 400);
  }, [search]);

  const filtered = search.trim().length >= 2 && searchResults !== null
    ? searchResults
    : faqs.filter(f => {
        const catMatch = activeCat === "all" || f.category === activeCat;
        if (!catMatch) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      });

  const grouped = {};
  if (activeCat === "all") {
    CATEGORIES.filter(c => c.id !== "all").forEach(cat => {
      const items = filtered.filter(f => f.category === cat.id);
      if (items.length) grouped[cat.id] = items;
    });
    const knownIds = new Set(CATEGORIES.map(c => c.id));
    const orphans = filtered.filter(f => !knownIds.has(f.category));
    if (orphans.length) grouped["__other__"] = orphans;
  }

  return (
    <main className="faq-page">
      {/* Hero */}
      <section className="faq-hero" aria-label="FAQ page header">
        <div className="faq-hero-bg" aria-hidden="true" />
        <div className="faq-hero-inner">
          <nav className="faq-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <span aria-hidden="true">›</span>
              <li>FAQs</li>
            </ol>
          </nav>
          <h1 className="faq-hero-title">
            Frequently Asked<br />
            <span className="faq-hero-accent">Questions</span>
          </h1>
          <p className="faq-hero-sub">{faqs.length} answers — find yours instantly or ask below.</p>
          <div className="faq-search-wrap" role="search">
            <span className="faq-search-icon" aria-hidden="true">🔍</span>
            <input
              ref={searchRef}
              className="faq-search-input"
              type="search"
              placeholder="Search questions and answers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search FAQs"
            />
            {search && (
              <button className="faq-search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
            )}
          </div>
          {search && (
            <div className="faq-search-result-count" aria-live="polite">
              {searchLoading ? "🔍 Searching…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`}
            </div>
          )}
        </div>
      </section>

      {/* Category tabs */}
      <nav className="faq-cats-wrap" aria-label="FAQ Categories">
        <div className="faq-cats-inner">
          {CATEGORIES.map(cat => {
            // BOT FIX: Generate real URLs for AI bots to crawl
            const href = cat.id === "all" ? "/faqs" : `/faqs?cat=${cat.id}`;
            
            return (
              <Link
                key={cat.id}
                href={href}
                scroll={false}
                prefetch={false}
                style={{ textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  handleCatChange(cat.id);
                }}
              >
                <div
                  className={`faq-cat-btn${activeCat === cat.id ? " faq-cat-btn--active" : ""}`}
                  aria-pressed={activeCat === cat.id}
                >
                  <span className="faq-cat-icon" aria-hidden="true">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="faq-cat-count">
                    {cat.id === "all" ? faqs.length : faqs.filter(f => f.category === cat.id).length}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="faq-content-wrap">
        {fetchError && <div className="np-error">Unable to load FAQs right now. Please try again later.</div>}

        {filtered.length === 0 && (
          <div className="faq-empty" role="status">
            <span className="faq-empty-icon" aria-hidden="true">🤔</span>
            <h2 className="faq-empty-title">No results found</h2>
            <p className="faq-empty-sub">{search ? `Nothing matched "${search}".` : "No FAQs in this category yet."}</p>
            {search && <button className="faq-empty-btn" onClick={() => setSearch("")}>Clear search</button>}
          </div>
        )}

        {/* All grouped */}
        {activeCat === "all" && !search && filtered.length > 0 && (
          Object.entries(grouped).map(([catId, items]) => (
            <section key={catId} id={catId} className="faq-group" aria-labelledby={`cat-heading-${catId}`}>
              <div className="faq-group-header">
                <span className="faq-group-icon" aria-hidden="true">{CAT_MAP[catId]?.icon}</span>
                <h2 className="faq-group-title" id={`cat-heading-${catId}`}>{CAT_MAP[catId]?.label}</h2>
                <span className="faq-group-count">{items.length} question{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="faq-list">
                {items.map(faq => (
                  <FAQItem key={faq.id} faq={faq} isOpen={!!openIds[faq.id]} onToggle={() => handleToggle(faq.id)} searchQuery={search} userVotes={userVotes} onVote={handleVote} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Single cat or search */}
        {(activeCat !== "all" || search) && filtered.length > 0 && (
          <div className="faq-list faq-list--flat">
            {filtered.map(faq => (
              <FAQItem key={faq.id} faq={faq} isOpen={!!openIds[faq.id]} onToggle={() => handleToggle(faq.id)} searchQuery={search} userVotes={userVotes} onVote={handleVote} />
            ))}
          </div>
        )}

        <AskForm />
      </div>
    </main>
  );
}