"use client";
// app/tools/ToolsClient.jsx — Redesigned tools home (AI + Career tools only)

import { useState } from "react";
import Link from "next/link";

const TOOLS = [
  {
    category: "AI Tools",
    categoryIcon: "🤖",
    categoryColor: "#2563eb",
    categoryBg: "rgba(37,99,235,0.06)",
    categoryBorder: "rgba(124,58,237,0.15)",
    items: [
      { href:"/tools/ai/email-writer",   emoji:"📧", label:"AI Email Writer",        desc:"Write professional emails instantly. 24 types, 6 tones, 11 languages. Open in Gmail or Outlook.", badge:"Popular", badgeColor:"#ef4444" },
      { href:"/tools/ai/summarizer",     emoji:"📝", label:"AI Summarizer",          desc:"Paste any article and get a smart AI summary in seconds. Short, medium, long or bullet points.", badge:"3 Free", badgeColor:"#059669" },
      { href:"/tools/ai/paraphraser",    emoji:"🔄", label:"AI Paraphraser",         desc:"Rewrite text in academic, casual, formal or creative styles. Powered by Groq AI.", badge:"3 Free", badgeColor:"#059669" },
      { href:"/tools/ai/linkedin-bio",   emoji:"💼", label:"AI LinkedIn Bio",         desc:"Generate a powerful LinkedIn About section in seconds. Choose tone, length and style.", badge:"Free", badgeColor:"#0a66c2" },
      { href:"/tools/ai/interview-prep", emoji:"🎯", label:"AI Interview Prep",       desc:"Enter a job title — get interview questions with ideal answers. Technical, behavioral & HR.", badge:"Free", badgeColor:"#1a3a8f" },
    ],
  },
    {
    category: "Career Tools",
    categoryIcon: "💼",
    categoryColor: "#d97706",
    categoryBg: "rgba(217,119,6,0.06)",
    categoryBorder: "rgba(217,119,6,0.18)",
    items: [
      { href:"/tools/career/cv-maker",           emoji:"🧑‍💼", label:"CV Maker",           desc:"AI-powered CV builder. 17 premium templates, ATS score checker, instant PDF. 100% free.", badge:"17 Templates", badgeColor:"#d97706" },
      { href:"/tools/career/cover-letter-maker", emoji:"✉️",  label:"Cover Letter Maker", desc:"AI writes any field. 6 templates, live A4 preview, print to PDF. No sign-up needed.",       badge:"6 Templates", badgeColor:"#d97706" },
    ],
  },
  {
    category: "PDF Tools",
    categoryIcon: "📄",
    categoryColor: "#059669",
    categoryBg: "rgba(5,150,105,0.06)",
    categoryBorder: "rgba(5,150,105,0.18)",
    items: [
      { href:"/tools/pdf/image-to-pdf", emoji:"🖼️", label:"Image to PDF", desc:"Convert images to high-quality PDFs instantly. No sign-up needed.", badge:"Free", badgeColor:"#059669" },
      { href:"/tools/pdf/word-to-pdf",  emoji:"📄", label:"Word to PDF",  desc:"Convert Word documents to PDF with one click. Preserve formatting and layout.", badge:"Free", badgeColor:"#059669" },
    ],
  },
  {
    category: "Image Tools",
    categoryIcon: "🖼️",
    categoryColor: "#d946ef",
    categoryBg: "rgba(217,119,6,0.06)",
    categoryBorder: "rgba(217,119,6,0.18)",
    items: [
      { href:"/tools/image/jpg-to-png", emoji:"🖼️", label:"JPG to PNG", desc:"Convert JPG images to high-quality PNGs instantly. No sign-up needed.", badge:"Free", badgeColor:"#d946ef" },
    ],
  },

];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:.2;transform:scale(.7)}}
@keyframes orbFloat1{from{transform:translate(0,0) scale(1)}to{transform:translate(-35px,25px) scale(1.06)}}
@keyframes orbFloat2{from{transform:translate(0,0) scale(1)}to{transform:translate(28px,-22px) scale(1.08)}}
.fade-1{animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .05s both}
.fade-2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .12s both}
.fade-3{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .2s both}

.tools-root{min-height:100vh;background:#fffbeb;font-family:'DM Sans',sans-serif;overflow-x:hidden;position:relative;display:flex;flex-direction:column;color:#0f172a}
.bg-orbs{display:none}

.tools-hero{position:relative;background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 55%,#fde68a 100%);border-bottom:1px solid #f0c96a;overflow:hidden;padding:clamp(18px,3vw,30px) clamp(14px,4vw,28px);text-align:center}
.tools-hero::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(15,23,42,0.03) 1px,transparent 1px);background-size:22px 22px;pointer-events:none}
.tools-hero::after{content:'';position:absolute;inset:0;background-image:radial-gradient(circle at 85% 15%,rgba(255,255,255,.55) 0%,transparent 48%);pointer-events:none}
.tools-hero-inner{position:relative;z-index:1;max-width:620px;margin:0 auto}

.tools-wrap{flex:1;width:100%;max-width:1100px;margin:0 auto;padding:clamp(20px,4vw,34px) clamp(14px,5vw,32px) clamp(40px,8vw,70px);position:relative;z-index:2}

/* Hero text — white on dark */
.tools-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.55);color:#92400e;border:1px solid rgba(215,119,6,.3);padding:5px 16px;border-radius:999px;font-size:.58rem;font-family:'Space Mono',monospace;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:10px}
.tools-badge::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#d97706;opacity:.75;animation:pulse 2s ease-in-out infinite}
.tools-title{font-family:'Playfair Display',serif;font-size:clamp(1.55rem,5vw,2.55rem);font-weight:900;color:#0f172a;line-height:1.06;margin-bottom:8px}
.tools-title-accent{color:#d97706;font-style:italic}
.tools-sub{color:#475569;font-size:clamp(.82rem,2vw,.95rem);max-width:500px;margin:0 auto 16px;line-height:1.6;font-weight:400}

/* Search */
.tools-search-wrap{position:relative;max-width:500px;margin:0 auto}
.tools-search-icon{position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none;opacity:.45}
.tools-search{width:100%;padding:12px 44px;border:1.5px solid rgba(215,119,6,.25);border-radius:999px;font-size:clamp(13.5px,2.5vw,15px);font-family:'DM Sans',sans-serif;font-weight:400;color:#0b1437;background:rgba(255,255,255,.72);outline:none;box-shadow:0 4px 16px rgba(15,23,42,.06);transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;appearance:none}
.tools-search::placeholder{color:#a0aac8}
.tools-search::-webkit-search-cancel-button,.tools-search::-webkit-search-decoration{display:none}
.tools-search:focus{border-color:#f59e0b;box-shadow:0 4px 16px rgba(15,23,42,.06),0 0 0 4px rgba(245,158,11,.14)}

/* Category section */
.tools-cat-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:14px;border-bottom:1.5px solid rgba(11,20,55,.06)}
.tools-cat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.tools-cat-title{font-family:'Playfair Display',serif;font-size:clamp(1.1rem,3vw,1.4rem);font-weight:700;color:#0b1437}
.tools-cat-count{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;color:#92400e;margin-left:auto;background:#fffbeb;border-radius:999px;padding:3px 10px;border:1px solid rgba(245,158,11,.22)}

/* Tool grid */
.tools-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:34px}
@media(min-width:580px){.tools-grid{gap:14px}}
@media(min-width:900px){.tools-grid{grid-template-columns:repeat(3,1fr)}}

/* Tool card */
.tools-card{position:relative;background:rgba(255,255,255,.92);border-radius:12px;border:1px solid rgba(245,158,11,.18);box-shadow:0 4px 18px rgba(15,23,42,.05);overflow:hidden;text-decoration:none;color:inherit;display:flex;flex-direction:column;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;backdrop-filter:blur(12px);min-height:192px}
.tools-card:hover{transform:translateY(-4px);box-shadow:0 14px 36px rgba(245,158,11,.16);border-color:rgba(245,158,11,.42)}
.tools-card:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
.tools-card::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:.9}
.tools-card-accent{height:4px;flex-shrink:0;position:relative;z-index:1}
.tools-card-body{padding:clamp(10px,3vw,22px);flex:1;display:flex;flex-direction:column;gap:8px;position:relative;z-index:1}
.tools-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.tools-emoji{width:36px;height:36px;border-radius:10px;background:#fffbeb;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;border:1px solid rgba(245,158,11,.22)}
.tools-badge-small{font-size:8px;font-weight:800;padding:2px 6px;border-radius:999px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;font-family:'Space Mono',monospace;flex-shrink:0;border:1px solid transparent}
.tools-card-title{font-family:'Playfair Display',serif;font-size:clamp(.82rem,2.5vw,1.1rem);font-weight:700;color:#0b1437;line-height:1.25}
.tools-card-desc{font-size:clamp(.68rem,2vw,.86rem);color:#64748b;line-height:1.45;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.tools-card-footer{display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid #f1f5f9;margin-top:auto}
.tools-card-free{font-size:10px;font-weight:800;color:#059669;font-family:'Space Mono',monospace;letter-spacing:.06em}
.tools-card-arrow{font-size:13px;font-weight:800;color:#d97706}
.tool-email{border-radius:8px 8px 14px 14px}
.tool-email::before{clip-path:polygon(0 0,50% 45%,100% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(245,158,11,.14),transparent 55%)}
.tool-summary::before{background:repeating-linear-gradient(180deg,transparent 0 22px,rgba(15,23,42,.055) 23px 24px)}
.tool-paraphrase::before{background:radial-gradient(circle at 18% 25%,rgba(217,119,6,.13) 0 28px,transparent 29px),radial-gradient(circle at 82% 74%,rgba(16,185,129,.12) 0 34px,transparent 35px)}
.tool-linkedin{border-left:5px solid #0a66c2}.tool-linkedin .tools-emoji{background:#e8f3ff;border-color:#b7d8ff}
.tool-interview::before{background:linear-gradient(90deg,transparent 48%,rgba(245,158,11,.12) 49% 51%,transparent 52%),linear-gradient(180deg,transparent 48%,rgba(245,158,11,.12) 49% 51%,transparent 52%)}
.tool-cv{border-radius:6px}.tool-cv::before{background:linear-gradient(90deg,rgba(15,23,42,.08) 0 28%,transparent 28%),repeating-linear-gradient(180deg,transparent 0 28px,rgba(15,23,42,.045) 29px 30px)}
.tool-cover::before{clip-path:polygon(0 0,50% 42%,100% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(217,119,6,.16),transparent 56%)}
.tool-image-pdf{border-radius:18px 6px 18px 6px}.tool-image-pdf::before{background:linear-gradient(135deg,transparent 62%,rgba(5,150,105,.14) 63%),radial-gradient(circle at 28% 32%,rgba(5,150,105,.14) 0 32px,transparent 33px)}
.tool-word-pdf::before{background:linear-gradient(90deg,rgba(37,99,235,.1) 0 24%,transparent 24%),repeating-linear-gradient(180deg,transparent 0 24px,rgba(15,23,42,.045) 25px 26px)}
.tool-jpg-png{border-radius:8px}.tool-jpg-png::before{background:linear-gradient(135deg,rgba(217,70,239,.12),transparent 45%),linear-gradient(45deg,transparent 70%,rgba(217,70,239,.15) 71%)}

/* Stats */
.tools-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));align-items:center;gap:0;margin-bottom:28px;background:#fff;border:1px solid rgba(245,158,11,.18);border-radius:18px;padding:12px 14px;box-shadow:0 2px 12px rgba(15,23,42,.05)}
.tools-stat{text-align:center}
.tools-stat-val{font-family:'Playfair Display',serif;font-size:clamp(1.2rem,4vw,1.6rem);font-weight:900;color:#d97706;line-height:1.1;letter-spacing:-.02em}
.tools-stat-lbl{font-size:9px;color:#a0aac8;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-top:3px;font-family:'Space Mono',monospace}
.tools-stat-div{width:1px;height:36px;background:rgba(245,158,11,.22);justify-self:center}

/* CTA */
.tools-cta{margin-top:16px;border-radius:20px;padding:clamp(24px,5vw,44px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;position:relative;overflow:hidden;border:1px solid rgba(215,119,6,.3);background:linear-gradient(135deg,#f59e0b,#d97706);box-shadow:0 16px 34px rgba(245,158,11,.24);color:#0f172a}
.tools-cta::before{content:'';position:absolute;top:-80px;right:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(200,146,42,.16),transparent 70%);pointer-events:none}
.tools-cta-free{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;font-size:8.5px;font-weight:700;color:#78350f;margin-bottom:10px;letter-spacing:.12em;text-transform:uppercase;position:relative;z-index:1;font-family:'Space Mono',monospace}
.tools-cta h2{font-family:'Playfair Display',serif;font-size:clamp(1.3rem,4vw,1.8rem);font-weight:800;margin-bottom:6px;color:#0f172a;position:relative;z-index:1;letter-spacing:-.02em;line-height:1.15}
.tools-cta p{font-size:clamp(.8rem,2.5vw,.92rem);color:#78350f;line-height:1.65;position:relative;z-index:1}
.tools-cta-btn{background:#0f172a;color:#fff!important;padding:13px 28px;border-radius:999px;font-weight:800;font-size:.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(15,23,42,.18);transition:transform .2s,box-shadow .2s;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Playfair Display',serif;position:relative;z-index:1;min-height:46px;letter-spacing:-.01em}
.tools-cta-btn:hover{transform:scale(1.05) translateY(-2px);box-shadow:0 12px 32px rgba(200,146,42,.5)}
.tools-cta-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
@media(max-width:500px){.tools-cta{flex-direction:column;text-align:center}.tools-cta-btn{width:100%;justify-content:center}}
@media(max-width:500px){
  .tools-wrap{padding-left:10px;padding-right:10px}
  .tools-stats{grid-template-columns:repeat(2,minmax(0,1fr));border-radius:16px;padding:10px;margin-bottom:24px}
  .tools-stat{padding:8px 4px}
  .tools-stat-val{font-size:1.15rem}
  .tools-stat-lbl{font-size:7.5px;letter-spacing:.07em}
  .tools-stat-div{display:none}
  .tools-cat-header{gap:10px;margin-bottom:14px;padding-bottom:12px}
  .tools-cat-icon{width:36px;height:36px;border-radius:10px;font-size:18px}
  .tools-cat-title{font-size:1.1rem}
  .tools-card-free{font-size:8px}
  .tools-card-arrow{font-size:11px}
}

/* No results */
.tools-no-results{text-align:center;padding:60px 20px;color:#a0aac8}
.tools-no-results-icon{font-size:48px;margin-bottom:16px}
.tools-no-results-h{font-family:'Playfair Display',serif;font-size:1.2rem;color:#3a4a7a;margin-bottom:8px}
`;

const ALL_TOOLS = TOOLS.flatMap(cat => cat.items.map(t => ({ ...t, category: cat.category })));

export default function ToolsClient() {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = q
    ? ALL_TOOLS.filter(t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="tools-root">

        {/* Dark hero — full-bleed */}
        <header className="tools-hero fade-1">
          <div className="tools-hero-inner">
            <p className="tools-badge">10+ Free Tools</p>
            <h1 className="tools-title fade-2">
              Free <span className="tools-title-accent">AI &amp; Career</span> Tools
            </h1>
            <p className="tools-sub fade-2">
              AI Email Writer, CV Maker, Cover Letter, Summarizer, Paraphraser, LinkedIn Bio and Interview Prep — all free, no sign-up.
            </p>
            <div className="tools-search-wrap fade-3" role="search" aria-label="Search tools">
              <span className="tools-search-icon" aria-hidden="true">🔍</span>
              <label htmlFor="tools-search" className="sr-only">Search tools</label>
              <input
                id="tools-search"
                className="tools-search"
                type="search"
                placeholder="Search tools…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>
        </header>

        <div className="tools-wrap">
          {/* Stats */}
          <div className="tools-stats fade-3" aria-label="Tool statistics">
            {[["10+","Free Tools"],["0","Sign-up Needed"],["4","Categories"],["100%","Free"]].map(([v,l],i,arr) => (
              <div key={v} style={{ display:"contents" }}>
                <div className="tools-stat">
                  <div className="tools-stat-val">{v}</div>
                  <div className="tools-stat-lbl">{l}</div>
                </div>
                {i < arr.length - 1 && <div className="tools-stat-div" aria-hidden="true"/>}
              </div>
            ))}
          </div>

          {/* Live status */}
          <p className="sr-only" role="status" aria-live="polite">
            {filtered ? `${filtered.length} tool${filtered.length !== 1 ? "s" : ""} found` : `${ALL_TOOLS.length} tools available`}
          </p>

          {/* Search results */}
          {filtered !== null && (
            <section aria-label="Search results">
              {filtered.length > 0 ? (
                <div className="tools-grid">
                  {filtered.map(tool => <ToolCard key={tool.href} tool={tool} accentColor="#1a3a8f"/>)}
                </div>
              ) : (
                <div className="tools-no-results">
                  <div className="tools-no-results-icon" aria-hidden="true">🔍</div>
                  <h2 className="tools-no-results-h">No tools found</h2>
                  <p style={{ fontSize:".88rem" }}>Try email, CV, summarize or interview</p>
                </div>
              )}
            </section>
          )}

          {/* Category sections */}
          {filtered === null && TOOLS.map(cat => (
            <section key={cat.category} aria-labelledby={`cat-${cat.category}`} style={{ marginBottom: 48 }}>
              <div className="tools-cat-header">
                <div className="tools-cat-icon" style={{ background: cat.categoryBg, border: `1px solid ${cat.categoryBorder}` }}>
                  {cat.categoryIcon}
                </div>
                <h2 className="tools-cat-title" id={`cat-${cat.category}`}>{cat.category}</h2>
                <span className="tools-cat-count">{cat.items.length} tools</span>
              </div>
              <div className="tools-grid" role="list" aria-label={`${cat.category} tools`}>
                {cat.items.map(tool => (
                  <div key={tool.href} role="listitem">
                    <ToolCard tool={tool} accentColor={cat.categoryColor} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="tools-cta" role="complementary" aria-label="Join AIDLA">
            <div>
              <p className="tools-cta-free">✦ Free · No Account Needed</p>
              <h2>Earn while you learn 🚀</h2>
              <p>Join AIDLA and start earning rewards as you build your skills with AI.</p>
            </div>
            <Link href="/signup" className="tools-cta-btn" aria-label="Join AIDLA for free">Join now ✦</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function ToolCard({ tool, accentColor }) {
  const shapeClass = {
    "AI Email Writer": "tool-email",
    "AI Summarizer": "tool-summary",
    "AI Paraphraser": "tool-paraphrase",
    "AI LinkedIn Bio": "tool-linkedin",
    "AI Interview Prep": "tool-interview",
    "CV Maker": "tool-cv",
    "Cover Letter Maker": "tool-cover",
    "Image to PDF": "tool-image-pdf",
    "Word to PDF": "tool-word-pdf",
    "JPG to PNG": "tool-jpg-png",
  }[tool.label] || "";

  return (
    <Link href={tool.href} className={`tools-card ${shapeClass}`} aria-label={`${tool.label} — ${tool.desc}`}>
      <div className="tools-card-accent" style={{ background: accentColor }}/>
      <div className="tools-card-body">
        <div className="tools-card-top">
          <div className="tools-emoji" aria-hidden="true">{tool.emoji}</div>
          {tool.badge && (
            <span className="tools-badge-small" style={{ background:`${tool.badgeColor}14`, color:tool.badgeColor, borderColor:`${tool.badgeColor}28` }}>
              {tool.badge}
            </span>
          )}
        </div>
        <h3 className="tools-card-title">{tool.label}</h3>
        <p className="tools-card-desc">{tool.desc}</p>
        <div className="tools-card-footer">
          <span className="tools-card-free">✓ FREE</span>
          <span className="tools-card-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
