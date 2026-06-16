"use client";
// app/tools/ToolsClient.jsx — Redesigned tools home

import { useState } from "react";
import Link from "next/link";

const TOOLS = [
  {
    category: "AI Tools",
    slug: "ai",
    icon: "🤖",
    gradient: "135deg, #2563eb 0%, #7c3aed 100%",
    color: "#2563eb",
    items: [
      {
        href: "/tools/ai/email-writer",
        icon: "📧",
        label: "AI Email Writer",
        desc: "Write professional emails in seconds. 24 types, 6 tones, 11 languages. Open in Gmail or Outlook.",
        badge: "Popular",
        badgeColor: "#ef4444",
        tags: ["24 Types", "11 Languages"],
      },
      {
        href: "/tools/ai/summarizer",
        icon: "📝",
        label: "AI Text Summarizer",
        desc: "Paste any article and get a smart AI summary. Short, medium, long or bullet points.",
        badge: "3 Free",
        badgeColor: "#059669",
        tags: ["Bullet Points", "Any Length"],
      },
      {
        href: "/tools/ai/paraphraser",
        icon: "🔄",
        label: "AI Paraphraser",
        desc: "Rewrite text in academic, casual, formal or creative styles. Powered by Groq AI.",
        badge: "3 Free",
        badgeColor: "#059669",
        tags: ["4 Styles", "Groq AI"],
      },
      {
        href: "/tools/ai/linkedin-bio",
        icon: "💼",
        label: "AI LinkedIn Bio",
        desc: "Generate a powerful LinkedIn About section instantly. Choose tone, length and style.",
        badge: "Free",
        badgeColor: "#0a66c2",
        tags: ["Custom Tone", "Multiple Styles"],
      },
      {
        href: "/tools/ai/interview-prep",
        icon: "🎯",
        label: "AI Interview Prep",
        desc: "Enter a job title — get interview questions with ideal answers. Technical, behavioral & HR.",
        badge: "Free",
        badgeColor: "#1a3a8f",
        tags: ["All Industries", "Q&A Format"],
      },
    ],
  },
  {
    category: "Career Tools",
    slug: "career",
    icon: "💼",
    gradient: "135deg, #d97706 0%, #f59e0b 100%",
    color: "#d97706",
    items: [
      {
        href: "/tools/career/cv-maker",
        icon: "🧑‍💼",
        label: "CV / Resume Maker",
        desc: "AI-powered CV builder with 17 premium templates. ATS score checker, instant PDF download.",
        badge: "17 Templates",
        badgeColor: "#d97706",
        tags: ["ATS Checker", "PDF Export"],
      },
      {
        href: "/tools/career/cover-letter-maker",
        icon: "✉️",
        label: "Cover Letter Maker",
        desc: "AI writes for any field. 6 templates, live A4 preview, print to PDF. No sign-up needed.",
        badge: "6 Templates",
        badgeColor: "#d97706",
        tags: ["Live Preview", "Any Field"],
      },
    ],
  },
  {
    category: "Calculators",
    slug: "calculators",
    icon: "🧮",
    gradient: "135deg, #059669 0%, #0891b2 100%",
    color: "#059669",
    items: [
      {
        href: "/tools/education/cgpa-calculator",
        icon: "🎓",
        label: "CGPA Calculator",
        desc: "Calculate your CGPA on a 4.0 scale instantly. Includes GPA ↔ percentage converter and full grade reference table.",
        badge: "New",
        badgeColor: "#7c3aed",
        tags: ["4.0 Scale", "% Converter"],
      },
      {
        href: "/tools/finance/salary-calculator",
        icon: "💰",
        label: "Salary Calculator",
        desc: "Compare take-home pay across Pakistan, UAE, USA, UK and India. FBR 2024–25 tax slabs included.",
        badge: "New",
        badgeColor: "#7c3aed",
        tags: ["5 Countries", "Tax Slabs"],
      },
    ],
  },
  {
    category: "PDF & Image",
    slug: "utilities",
    icon: "📄",
    gradient: "135deg, #7c3aed 0%, #d946ef 100%",
    color: "#7c3aed",
    items: [
      {
        href: "/tools/pdf/image-to-pdf",
        icon: "🖼️",
        label: "Image to PDF",
        desc: "Convert images to high-quality PDFs instantly. No sign-up, no limits.",
        badge: "Free",
        badgeColor: "#7c3aed",
        tags: ["Instant", "No Login"],
      },
      {
        href: "/tools/pdf/word-to-pdf",
        icon: "📄",
        label: "Word to PDF",
        desc: "Convert Word documents to PDF with one click. Preserves formatting and layout perfectly.",
        badge: "Free",
        badgeColor: "#7c3aed",
        tags: ["One Click", "Formatting"],
      },
      {
        href: "/tools/image/jpg-to-png",
        icon: "🎨",
        label: "JPG to PNG",
        desc: "Convert JPG images to high-quality PNGs instantly. Transparency supported.",
        badge: "Free",
        badgeColor: "#7c3aed",
        tags: ["High Quality", "Transparent"],
      },
    ],
  },
];

const FILTERS = [
  { slug: "all",         label: "All Tools"     },
  { slug: "ai",         label: "🤖 AI Tools"    },
  { slug: "career",     label: "💼 Career"      },
  { slug: "calculators",label: "🧮 Calculators" },
  { slug: "utilities",  label: "📄 PDF & Image" },
];

const ALL_TOOLS = TOOLS.flatMap(cat =>
  cat.items.map(t => ({ ...t, catSlug: cat.slug, catColor: cat.color, catGradient: cat.gradient }))
);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(-28px,36px)}}
@keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(32px,-24px)}}

/* Root */
.tr-root{min-height:100vh;background:#f8faff;font-family:'DM Sans',sans-serif;color:#0f172a;overflow-x:hidden}

/* ─── HERO ─────────────────────────────────────── */
.tr-hero{position:relative;background:linear-gradient(140deg,#060d24 0%,#0b1437 45%,#1a3a8f 100%);padding:clamp(44px,7vw,88px) clamp(16px,5vw,32px) clamp(52px,8vw,96px);text-align:center;overflow:hidden}

.tr-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}

.tr-hero-glow{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px)}
.tr-glow-1{width:560px;height:560px;background:radial-gradient(circle,rgba(59,130,246,.2),transparent 70%);top:-220px;left:-140px;animation:drift1 14s ease-in-out infinite}
.tr-glow-2{width:440px;height:440px;background:radial-gradient(circle,rgba(124,58,237,.16),transparent 70%);bottom:-180px;right:-100px;animation:drift2 11s ease-in-out infinite}

.tr-hero-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both}

.tr-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.8);padding:6px 18px;border-radius:999px;font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:22px;backdrop-filter:blur(6px);font-family:'Space Mono',monospace}
.tr-badge-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ade80;flex-shrink:0;animation:pulse 2s ease-in-out infinite}

.tr-hero-title{font-family:'Playfair Display',serif;font-size:clamp(2.1rem,5.5vw,3.6rem);font-weight:900;color:#fff;line-height:1.06;letter-spacing:-.03em;margin-bottom:18px}
.tr-title-em{color:#facc15;font-style:italic}

.tr-hero-sub{color:rgba(255,255,255,.55);font-size:clamp(.88rem,2.2vw,1.05rem);line-height:1.7;max-width:520px;margin:0 auto 32px;font-weight:400}

/* Search */
.tr-search-wrap{position:relative;max-width:480px;margin:0 auto;display:flex;align-items:center}
.tr-search-icon-svg{position:absolute;left:18px;color:rgba(255,255,255,.4);pointer-events:none;flex-shrink:0}
.tr-search{width:100%;padding:14px 50px;border:1.5px solid rgba(255,255,255,.14);border-radius:999px;font-size:clamp(14px,2.5vw,16px);font-family:'DM Sans',sans-serif;color:#fff;background:rgba(255,255,255,.09);outline:none;backdrop-filter:blur(12px);transition:border-color .2s,background .2s,box-shadow .2s;-webkit-appearance:none;appearance:none}
.tr-search::placeholder{color:rgba(255,255,255,.32)}
.tr-search:focus{border-color:rgba(255,255,255,.32);background:rgba(255,255,255,.13);box-shadow:0 0 0 4px rgba(99,102,241,.22)}
.tr-search::-webkit-search-cancel-button{display:none}
.tr-search-clear{position:absolute;right:16px;background:none;border:none;color:rgba(255,255,255,.45);font-size:13px;cursor:pointer;padding:4px 6px;line-height:1;border-radius:50%;transition:color .15s}
.tr-search-clear:hover{color:rgba(255,255,255,.8)}

/* ─── MAIN ────────────────────────────────────── */
.tr-main{max-width:1100px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(14px,4vw,32px) clamp(60px,8vw,100px)}

/* Stats strip */
.tr-stats{display:grid;grid-template-columns:repeat(4,1fr);background:#0b1437;border-radius:16px;overflow:hidden;margin-bottom:32px;box-shadow:0 8px 32px rgba(11,20,55,.18)}
.tr-stat{padding:20px 12px;text-align:center;border-right:1px solid rgba(255,255,255,.07)}
.tr-stat:last-child{border-right:none}
.tr-stat-val{display:block;font-family:'Playfair Display',serif;font-size:clamp(1.35rem,3.5vw,1.9rem);font-weight:900;color:#facc15;letter-spacing:-.02em;line-height:1}
.tr-stat-lbl{display:block;font-size:.62rem;color:rgba(255,255,255,.4);font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-top:5px;font-family:'Space Mono',monospace}

/* Filter pills */
.tr-filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px}
.tr-filter-pill{padding:9px 20px;border-radius:999px;border:1.5px solid rgba(26,58,143,.16);background:#fff;color:#475569;font-size:.82rem;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;white-space:nowrap;line-height:1}
.tr-filter-pill:hover{border-color:rgba(26,58,143,.32);color:#1a3a8f;background:rgba(26,58,143,.04)}
.tr-filter-pill.active{background:#1a3a8f;border-color:#1a3a8f;color:#fff;box-shadow:0 4px 16px rgba(26,58,143,.28)}

/* Category section */
.tr-cat-section{margin-bottom:52px}
.tr-cat-header{display:flex;align-items:center;gap:14px;margin-bottom:22px;padding-bottom:16px;border-bottom:1.5px solid rgba(11,20,55,.06)}
.tr-cat-icon-wrap{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,.14)}
.tr-cat-meta{flex:1}
.tr-cat-title{font-family:'Playfair Display',serif;font-size:clamp(1.15rem,3vw,1.45rem);font-weight:800;color:#0b1437;line-height:1.2}
.tr-cat-count{font-size:.73rem;color:#94a3b8;font-weight:500;margin-top:2px}

/* Grid */
.tr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
@media(min-width:640px){.tr-grid{gap:18px}}
@media(min-width:900px){.tr-grid{grid-template-columns:repeat(3,1fr);gap:20px}}

/* Card */
.tr-card{position:relative;background:#fff;border-radius:18px;border:1.5px solid rgba(26,58,143,.09);text-decoration:none;color:inherit;display:block;overflow:hidden;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;box-shadow:0 2px 14px rgba(11,20,55,.06)}
.tr-card:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(11,20,55,.13);border-color:rgba(26,58,143,.18)}
.tr-card:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
.tr-card-glow{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .28s;z-index:0}
.tr-card:hover .tr-card-glow{opacity:1}
.tr-card-inner{position:relative;z-index:1;padding:clamp(14px,3vw,22px);display:flex;flex-direction:column;gap:10px;min-height:210px}

.tr-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.tr-icon-wrap{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.16)}
.tr-icon{font-size:22px;line-height:1}

.tr-badge{display:inline-block;font-size:.6rem;font-weight:800;padding:3px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.06em;border:1px solid transparent;white-space:nowrap;flex-shrink:0;font-family:'Space Mono',monospace;align-self:flex-start}

.tr-card-title{font-family:'Playfair Display',serif;font-size:clamp(.9rem,2.5vw,1.1rem);font-weight:800;color:#0b1437;line-height:1.25}
.tr-card-desc{font-size:clamp(.72rem,2vw,.84rem);color:#64748b;line-height:1.55;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}

.tr-card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.tr-tag{font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:6px;background:#f1f5f9;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-family:'Space Mono',monospace}

.tr-card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid #f1f5f9;margin-top:auto}
.tr-card-free{font-size:.65rem;font-weight:800;color:#059669;font-family:'Space Mono',monospace;letter-spacing:.07em}
.tr-card-cta{font-size:.8rem;font-weight:700;transition:transform .18s;display:flex;align-items:center;gap:3px}
.tr-card:hover .tr-card-cta{transform:translateX(4px)}

/* Search results header */
.tr-search-label{font-size:.88rem;color:#64748b;margin-bottom:18px}
.tr-search-label strong{color:#0b1437;font-weight:700}

/* Empty state */
.tr-empty{text-align:center;padding:70px 20px}
.tr-empty-icon{font-size:56px;margin-bottom:14px}
.tr-empty-h{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:800;color:#0b1437;margin-bottom:8px}
.tr-empty-p{font-size:.88rem;color:#94a3b8}

/* CTA block */
.tr-cta{position:relative;border-radius:22px;overflow:hidden;background:linear-gradient(140deg,#060d24 0%,#0b1437 50%,#1a3a8f 100%);padding:clamp(32px,5vw,56px);margin-top:16px;box-shadow:0 20px 56px rgba(11,20,55,.24)}
.tr-cta-glow{position:absolute;top:-80px;right:-80px;width:380px;height:380px;background:radial-gradient(circle,rgba(250,204,21,.12),transparent 65%);pointer-events:none}
.tr-cta-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none}
.tr-cta-inner{position:relative;z-index:1;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:28px}
.tr-cta-text{flex:1;min-width:220px}
.tr-cta-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(250,204,21,.1);border:1px solid rgba(250,204,21,.22);color:#facc15;padding:5px 14px;border-radius:999px;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px;font-family:'Space Mono',monospace}
.tr-cta-title{font-family:'Playfair Display',serif;font-size:clamp(1.45rem,4vw,2.1rem);font-weight:900;color:#fff;margin-bottom:10px;letter-spacing:-.02em;line-height:1.12}
.tr-cta-sub{font-size:clamp(.82rem,2vw,.95rem);color:rgba(255,255,255,.5);line-height:1.65;max-width:480px}
.tr-cta-btn{display:inline-flex;align-items:center;gap:10px;background:#facc15;color:#0b1437!important;padding:15px 32px;border-radius:999px;font-weight:800;font-size:.95rem;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 4px 20px rgba(250,204,21,.28);font-family:'DM Sans',sans-serif;white-space:nowrap;flex-shrink:0}
.tr-cta-btn:hover{transform:scale(1.04) translateY(-2px);box-shadow:0 12px 32px rgba(250,204,21,.38)}
.tr-cta-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}

/* Responsive */
@media(max-width:640px){
  .tr-stats{grid-template-columns:repeat(2,1fr)}
  .tr-stat:nth-child(2){border-right:none}
  .tr-stat:nth-child(3){border-top:1px solid rgba(255,255,255,.07);border-right:1px solid rgba(255,255,255,.07)}
  .tr-stat:nth-child(4){border-top:1px solid rgba(255,255,255,.07)}
  .tr-filters{gap:6px}
  .tr-filter-pill{padding:7px 14px;font-size:.78rem}
  .tr-cta-inner{flex-direction:column;align-items:flex-start}
  .tr-cta-btn{width:100%;justify-content:center}
}
@media(max-width:420px){
  .tr-grid{grid-template-columns:1fr}
}
`;

export default function ToolsClient() {
  const [search, setSearch]         = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const q = search.trim().toLowerCase();

  const searchResults = q
    ? ALL_TOOLS.filter(t =>
        t.label.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    : null;

  const visibleCategories = (!q && activeFilter !== "all")
    ? TOOLS.filter(c => c.slug === activeFilter)
    : TOOLS;

  return (
    <>
      <style>{CSS}</style>
      <div className="tr-root">

        {/* ── Hero ── */}
        <header className="tr-hero">
          <div className="tr-hero-grid" aria-hidden="true" />
          <div className="tr-hero-glow tr-glow-1" aria-hidden="true" />
          <div className="tr-hero-glow tr-glow-2" aria-hidden="true" />

          <div className="tr-hero-inner">
            <div className="tr-hero-badge">
              <span className="tr-badge-dot" aria-hidden="true" />
              12 Free Tools — No Sign-up Required
            </div>

            <h1 className="tr-hero-title">
              The <span className="tr-title-em">Complete</span> Toolkit<br />
              for Students &amp; Professionals
            </h1>
            <p className="tr-hero-sub">
              AI writing, career builders, calculators and utilities — all in one place, 100% free.
            </p>

            <div className="tr-search-wrap" role="search" aria-label="Search tools">
              <svg className="tr-search-icon-svg" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <label htmlFor="tr-search" className="sr-only">Search tools</label>
              <input
                id="tr-search"
                className="tr-search"
                type="search"
                placeholder="Search tools…"
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveFilter("all"); }}
                autoComplete="off"
                spellCheck="false"
              />
              {search && (
                <button className="tr-search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>
              )}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="tr-main">

          {/* Stats */}
          <div className="tr-stats" aria-label="Tool statistics">
            {[
              ["12",   "Free Tools"    ],
              ["0",    "Sign-up Needed"],
              ["4",    "Categories"    ],
              ["100%", "Always Free"   ],
            ].map(([v, l]) => (
              <div className="tr-stat" key={l}>
                <span className="tr-stat-val">{v}</span>
                <span className="tr-stat-lbl">{l}</span>
              </div>
            ))}
          </div>

          {/* Category filter pills */}
          {!q && (
            <div className="tr-filters" role="tablist" aria-label="Filter tools by category">
              {FILTERS.map(f => (
                <button
                  key={f.slug}
                  role="tab"
                  aria-selected={activeFilter === f.slug}
                  className={`tr-filter-pill${activeFilter === f.slug ? " active" : ""}`}
                  onClick={() => setActiveFilter(f.slug)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Screen-reader live region */}
          <p className="sr-only" role="status" aria-live="polite">
            {searchResults
              ? `${searchResults.length} tool${searchResults.length !== 1 ? "s" : ""} found`
              : `Showing ${activeFilter === "all" ? "all" : activeFilter} tools`}
          </p>

          {/* Search results */}
          {searchResults !== null && (
            <section aria-label="Search results">
              <p className="tr-search-label">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for <strong>&ldquo;{q}&rdquo;</strong>
              </p>
              {searchResults.length > 0 ? (
                <div className="tr-grid">
                  {searchResults.map(tool => (
                    <ToolCard key={tool.href} tool={tool} color={tool.catColor} gradient={tool.catGradient} />
                  ))}
                </div>
              ) : (
                <div className="tr-empty">
                  <p className="tr-empty-icon" aria-hidden="true">🔍</p>
                  <h2 className="tr-empty-h">No tools found</h2>
                  <p className="tr-empty-p">Try &ldquo;email&rdquo;, &ldquo;CV&rdquo;, &ldquo;CGPA&rdquo; or &ldquo;salary&rdquo;</p>
                </div>
              )}
            </section>
          )}

          {/* Category sections */}
          {searchResults === null && visibleCategories.map(cat => (
            <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`} className="tr-cat-section">
              <div className="tr-cat-header">
                <div
                  className="tr-cat-icon-wrap"
                  style={{ background: `linear-gradient(${cat.gradient})` }}
                  aria-hidden="true"
                >
                  {cat.icon}
                </div>
                <div className="tr-cat-meta">
                  <h2 id={`cat-${cat.slug}`} className="tr-cat-title">{cat.category}</h2>
                  <p className="tr-cat-count">{cat.items.length} {cat.items.length === 1 ? "tool" : "tools"}</p>
                </div>
              </div>
              <div className="tr-grid" role="list" aria-label={`${cat.category} tools`}>
                {cat.items.map(tool => (
                  <div key={tool.href} role="listitem">
                    <ToolCard tool={tool} color={cat.color} gradient={cat.gradient} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="tr-cta" role="complementary">
            <div className="tr-cta-glow" aria-hidden="true" />
            <div className="tr-cta-grid" aria-hidden="true" />
            <div className="tr-cta-inner">
              <div className="tr-cta-text">
                <span className="tr-cta-badge">✦ Free · No Account Needed</span>
                <h2 className="tr-cta-title">Earn rewards while you grow</h2>
                <p className="tr-cta-sub">
                  Join AIDLA's learning community. Complete tasks, use tools, and earn real rewards as you build your career.
                </p>
              </div>
              <Link href="/signup" className="tr-cta-btn" aria-label="Create a free AIDLA account">
                Create Free Account <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}

function ToolCard({ tool, color, gradient }) {
  return (
    <Link href={tool.href} className="tr-card" aria-label={`${tool.label}: ${tool.desc}`}>
      <div
        className="tr-card-glow"
        aria-hidden="true"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}1a, transparent 60%)` }}
      />
      <div className="tr-card-inner">
        <div className="tr-card-head">
          <div
            className="tr-icon-wrap"
            aria-hidden="true"
            style={{ background: `linear-gradient(${gradient})` }}
          >
            <span className="tr-icon">{tool.icon}</span>
          </div>
          {tool.badge && (
            <span
              className="tr-badge"
              style={{
                color:            tool.badgeColor,
                background:       `${tool.badgeColor}16`,
                borderColor:      `${tool.badgeColor}30`,
              }}
            >
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="tr-card-title">{tool.label}</h3>
        <p className="tr-card-desc">{tool.desc}</p>

        {tool.tags?.length > 0 && (
          <div className="tr-card-tags" aria-label="Features">
            {tool.tags.map(tag => (
              <span key={tag} className="tr-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="tr-card-footer">
          <span className="tr-card-free">✓ FREE</span>
          <span className="tr-card-cta" style={{ color }} aria-hidden="true">
            Try now →
          </span>
        </div>
      </div>
    </Link>
  );
}
