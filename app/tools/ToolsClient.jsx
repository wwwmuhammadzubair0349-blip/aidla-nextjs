"use client";

import { useState } from "react";
import Link from "next/link";
import "./ToolsClient.css";

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
