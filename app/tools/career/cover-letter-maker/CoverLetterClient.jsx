"use client";
// app/tools/career/cover-letter-maker/CoverLetterClient.jsx
// Converted from React Router + Vite + framer-motion → Next.js App Router
//
// Changes from original:
//   1. "use client" directive added
//   2. import.meta.env.VITE_* → process.env.NEXT_PUBLIC_*
//   3. <Link to="…"> (react-router-dom) → <Link href="…"> (next/link)
//   4. import { motion, AnimatePresence } from "framer-motion" → CSS animations
//   5. import { Helmet } → removed (metadata handled in page.jsx server-side)
//   6. cover-letter.css → inlined as CSS string (no separate file import)
//   7. All logic, AI calls, state, helpers 100% preserved

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   ENV  (Next.js: process.env.NEXT_PUBLIC_*)
───────────────────────────────────────────── */
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/* ─────────────────────────────────────────────
   API
───────────────────────────────────────────── */
async function callEdge(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/cover-letter-ai`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "apikey":        SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Request failed");
  return data.result;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function safeText(v) { return String(v ?? "").trim(); }
function splitLines(v) {
  return safeText(v).split("\n").map(s => s.replace(/^[•\s]+/, "").trim()).filter(Boolean);
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const TONES = [
  { key: "professional", label: "💼 Professional" },
  { key: "enthusiastic", label: "🔥 Enthusiastic" },
  { key: "confident",    label: "🎯 Confident"    },
  { key: "formal",       label: "🎩 Formal"       },
];

const LENGTHS = [
  { key: "short",  label: "Short",  sub: "~100 words" },
  { key: "medium", label: "Medium", sub: "~180 words" },
  { key: "long",   label: "Long",   sub: "~250 words" },
];

const TEMPLATES = [
  { key: "classic",      label: "Classic"      },
  { key: "professional", label: "Professional" },
  { key: "corporate",    label: "Corporate"    },
  { key: "modern",       label: "Modern"       },
  { key: "executive",    label: "Executive"    },
  { key: "creative",     label: "Creative"     },
];

const ACCENT_PALETTES = ["#1e3a8a","#0f766e","#7c2d12","#334155","#6d28d9","#b45309"];

const SIGNOFFS = ["Sincerely","Best regards","Kind regards","Respectfully","With appreciation"];

const QUICK_CHIPS = [
  "Make it shorter","More confident opening","Highlight leadership",
  "Add more enthusiasm","Stronger closing","More formal",
  "Emphasize technical skills","Focus on achievements",
];

const DEFAULT = {
  fullName:"", title:"", phone:"", email:"", location:"", linkedin:"",
  company:"", hiringManager:"", jobTitle:"", jobLocation:"", reference:"",
  date: typeof window !== "undefined"
    ? new Date().toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" })
    : "",
  tone:"professional", length:"medium", signOff:"Sincerely",
  highlights:"", customParagraph:"", jobDescription:"",
};

/* ─────────────────────────────────────────────
   Letter Builder (identical to original)
───────────────────────────────────────────── */
function compressJd(jd) {
  const one = jd.replace(/\s+/g," ").replace(/[•\u2022]/g,"").trim();
  if (!one) return "support key responsibilities effectively";
  const cut = one.slice(0,160);
  const end = cut.lastIndexOf(" ");
  return ((end > 80 ? cut.slice(0,end) : cut).trim()).toLowerCase();
}

function buildLetterData(d) {
  const name       = safeText(d.fullName) || "Your Name";
  const contactArr = [safeText(d.email),safeText(d.phone),safeText(d.location),safeText(d.linkedin)].filter(Boolean);
  const company    = safeText(d.company)  || "Company Name";
  const jobTitle   = safeText(d.jobTitle) || "the position";
  const roleLine   = safeText(d.jobLocation) ? `${jobTitle} (${safeText(d.jobLocation)})` : jobTitle;
  const salutation = safeText(d.hiringManager) ? `Dear ${safeText(d.hiringManager)},` : "Dear Hiring Manager,";

  const toneMap = {
    professional: { opener:"I am pleased to apply for",          vibe:"I would welcome the opportunity to bring my skills and experience to your team.",           close:"Thank you for your consideration. I look forward to discussing how I can contribute."                                       },
    formal:       { opener:"I am writing to express my interest in", vibe:"I would welcome the opportunity to contribute my skills and experience to your team.", close:"Thank you for your time and consideration. I look forward to the possibility of discussing my application." },
    enthusiastic: { opener:"I'm thrilled to apply for",          vibe:"I'm genuinely excited about the possibility of joining your team and making a real impact.",  close:"I'd love the chance to discuss how my passion and skills align with your goals."                        },
    confident:    { opener:"I'm excited to apply for",           vibe:"I'm confident I can deliver strong results from day one and contribute measurable impact.",    close:"I'd appreciate the chance to discuss how I can help your team achieve its goals."                    },
  };
  const t = toneMap[d.tone || "professional"] || toneMap.professional;

  const highlights  = splitLines(d.highlights);
  const bulletBlock = highlights.length
    ? `Here are a few highlights that align well with your needs:\n${highlights.map(h => `• ${h}`).join("\n")}`
    : "";
  const jdBlock     = safeText(d.jobDescription)
    ? `From your job description, I understand you are looking for someone who can ${compressJd(safeText(d.jobDescription))}. My background aligns with these requirements through hands-on delivery, clear communication, and a strong focus on quality.`
    : "";
  const customBlock = safeText(d.customParagraph);
  const wantMore    = d.length === "long";
  const wantLess    = d.length === "short";
  const midExtra    = wantMore
    ? `I am also comfortable working cross-functionally, documenting work clearly, and maintaining high standards of quality and compliance. I value ownership, continuous improvement, and reliability — especially in fast-paced environments.`
    : "";
  const conciseTrim = wantLess
    ? `I bring strong execution, attention to detail, and a practical problem-solving approach.`
    : `I bring strong execution, attention to detail, and a practical problem-solving approach — from planning and implementation through to reporting and stakeholder coordination.`;

  const paragraphs = [
    `${t.opener} the ${roleLine} at ${company}.`,
    conciseTrim,
    bulletBlock  || null,
    jdBlock      || null,
    customBlock  || null,
    midExtra     || null,
    `${t.vibe} ${t.close}`,
  ].filter(Boolean);

  return { name, title:safeText(d.title), contact:contactArr, date:safeText(d.date), reference:safeText(d.reference), salutation, paragraphs, signOff:safeText(d.signOff)||"Sincerely," };
}

function buildPlainText(d) {
  const ld = buildLetterData(d);
  const contactLine = ld.contact.join(" · ");
  const parts = [
    ld.date, "",
    ld.reference ? `Reference: ${ld.reference}` : null, "",
    ld.salutation, "",
    ...ld.paragraphs.flatMap(p => [p,""]),
    ld.signOff,"",
    ld.name,
    ld.title || null,
    contactLine || null,
  ].filter(x => x !== null);
  return parts.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}

const PAPER_W = 794;
const PAPER_H = 1123;

/* ─────────────────────────────────────────────
   Inlined CSS  (replaces cover-letter.css import)
   framer-motion animations → CSS keyframes
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700;800&family=Crimson+Pro:wght@400;600;700&display=swap');

:root {
  --navy:#0b1437;--royal:#1a3a8f;--sky:#3b82f6;--gold:#f59e0b;--gold-l:#fcd34d;
  --slate:#64748b;--ok:#059669;--red:#dc2626;--ai:#7c3aed;--ai-l:#a78bfa;
  --bg:linear-gradient(160deg,#f0f4ff 0%,#fffbf0 60%,#e8f4fd 100%);
  --card-bg:rgba(255,255,255,0.93);--border:rgba(59,130,246,0.11);
  --shadow:0 6px 24px rgba(11,20,55,0.07);--radius:20px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* Fade-up animation — replaces framer-motion */
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes toastSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.fade-up{animation:fadeUp .4s ease both}
.fade-up-1{animation:fadeUp .4s ease .05s both}
.fade-up-2{animation:fadeUp .4s ease .1s both}
.fade-up-3{animation:fadeUp .4s ease .14s both}
.fade-up-4{animation:fadeUp .4s ease .18s both}
.fade-up-5{animation:fadeUp .4s ease .22s both}
.fade-up-6{animation:fadeUp .4s ease .28s both}
.fade-in{animation:fadeIn .35s ease both}
.toast-anim{animation:toastSlide .2s ease both}

.cvm-root{min-height:100vh;max-width:100vw;background:var(--bg);font-family:'DM Sans',sans-serif;color:var(--navy);position:relative;overflow-x:hidden;display:flex;flex-direction:column;}
.cvm-orbs{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.cvm-orb{position:absolute;border-radius:50%;filter:blur(80px);}
.cvm-orb1{width:380px;height:380px;background:rgba(59,130,246,.07);top:-100px;left:-100px;}
.cvm-orb2{width:320px;height:320px;background:rgba(245,158,11,.06);top:40%;right:-130px;}
.cvm-orb3{width:280px;height:280px;background:rgba(124,58,237,.05);bottom:-40px;left:30%;}
.cvm-wrap{flex:1;max-width:1140px;width:100%;margin:0 auto;padding:clamp(12px,4vw,48px) clamp(12px,4vw,24px) clamp(24px,6vw,60px);position:relative;z-index:2;}

/* Breadcrumb */
.cvm-crumb{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:16px;flex-wrap:wrap;}
.cvm-crumb a{color:#94a3b8;text-decoration:none;transition:color .15s;}
.cvm-crumb a:hover{color:var(--navy);}
.cvm-crumb a:focus-visible{outline:2px solid var(--sky);outline-offset:2px;border-radius:3px;}

/* Hero */
.cvm-hero{margin-bottom:12px;}
.cvm-badge{display:inline-block;background:linear-gradient(135deg,var(--gold),var(--gold-l));color:var(--navy);padding:4px 14px;border-radius:99px;font-size:clamp(.6rem,2vw,.68rem);font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;box-shadow:0 4px 12px rgba(245,158,11,.28);}
.cvm-title{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,6vw,2.7rem);font-weight:900;line-height:1.1;margin-bottom:6px;}
.cvm-title-acc{background:linear-gradient(135deg,var(--royal),var(--sky));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.cvm-sub{color:var(--slate);font-size:clamp(.82rem,3vw,.96rem);line-height:1.55;max-width:560px;}

/* Pills */
.cvm-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;}
.cvm-pill{background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:99px;padding:3px 10px;font-size:clamp(.6rem,2vw,.7rem);font-weight:700;color:var(--royal);white-space:nowrap;}

/* Toast */
.cvm-toast{border-radius:12px;padding:10px 14px;font-weight:700;font-size:clamp(.78rem,3vw,.84rem);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;}
.cvm-toast.success{background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.25);color:#065f46;}
.cvm-toast.error{background:rgba(220,38,38,.07);border:1px solid rgba(220,38,38,.2);color:#991b1b;}
.cvm-toast.info{background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.2);color:#1e40af;}
.cvm-toast-close{background:none;border:none;cursor:pointer;font-weight:900;color:inherit;font-size:1rem;line-height:1;padding:2px 4px;flex-shrink:0;min-height:44px;display:flex;align-items:center;}

/* Tab bar */
.cvm-tab-bar{display:flex;gap:7px;margin-bottom:12px;align-items:center;flex-wrap:nowrap;}
@media(min-width:960px){.cvm-tab-bar{display:none;}}

/* Stats */
.cvm-stats{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px;padding:9px 14px;background:rgba(245,158,11,.06);border-radius:12px;border-left:4px solid var(--gold);}
.cvm-stat{font-size:clamp(.66rem,2.5vw,.74rem);font-weight:700;color:var(--navy);}
.cvm-stat.g{color:var(--ok);}
.cvm-stat-div{width:1px;height:12px;background:rgba(0,0,0,.1);}

/* Fill all banner */
.cvm-fill-all-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px;padding:clamp(12px,3vw,16px) clamp(14px,4vw,20px);background:linear-gradient(135deg,rgba(124,58,237,.08),rgba(167,139,250,.06));border:1.5px solid rgba(124,58,237,.18);border-radius:16px;}
.cvm-fill-all-left{display:flex;align-items:center;gap:12px;}
.cvm-fill-all-icon{font-size:22px;flex-shrink:0;}
.cvm-fill-all-title{font-size:clamp(.84rem,3vw,.94rem);font-weight:800;color:var(--navy);margin-bottom:2px;}
.cvm-fill-all-sub{font-size:clamp(.68rem,2.5vw,.76rem);color:var(--slate);}
.cvm-fill-all-actions{display:flex;gap:8px;align-items:center;flex-shrink:0;}

/* Layout */
.cvm-layout{display:grid;grid-template-columns:1fr;gap:12px;align-items:start;}
@media(min-width:960px){.cvm-layout{grid-template-columns:430px 1fr;}}
.cvm-col-hidden{display:none!important;}
@media(min-width:960px){.cvm-col-form,.cvm-preview-panel{display:block!important;}}

/* Card */
.cvm-card{background:var(--card-bg);backdrop-filter:blur(6px);border-radius:var(--radius);border:1px solid var(--border);box-shadow:var(--shadow);padding:clamp(14px,3.5vw,22px);margin-bottom:12px;}
.cvm-card-title{font-family:'Playfair Display',serif;font-size:clamp(.9rem,3.5vw,1rem);font-weight:700;color:var(--navy);margin-bottom:14px;}
.cvm-gen-card{background:linear-gradient(135deg,rgba(11,20,55,.97),rgba(26,58,143,.95));border:1px solid rgba(59,130,246,.2);}
.cvm-gen-card .cvm-card-title{color:#fff;}
.cvm-gen-desc{font-size:clamp(.78rem,3vw,.86rem);color:rgba(255,255,255,.65);margin-bottom:14px;}

/* Form grid */
.cvm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
@media(max-width:400px){.cvm-form-grid{grid-template-columns:1fr;}}

/* Field */
.cvm-field{display:flex;flex-direction:column;gap:4px;}
.cvm-field-label{font-size:clamp(.6rem,2vw,.68rem);font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--slate);display:block;}

/* Input */
.cvm-input{width:100%;padding:9px 11px;border-radius:11px;border:1.5px solid rgba(59,130,246,.18);background:#fff;font-family:'DM Sans',sans-serif;font-size:clamp(.78rem,3vw,.85rem);font-weight:600;outline:none;transition:border-color .15s,box-shadow .15s;color:var(--navy);-webkit-appearance:none;appearance:none;}
.cvm-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(245,158,11,.1);}
.cvm-input:focus-visible{outline:3px solid var(--gold);outline-offset:1px;}
.cvm-input::placeholder{color:#94a3b8;font-weight:500;}
.cvm-textarea{resize:vertical;line-height:1.6;min-height:76px;}
.cvm-ai-loading{opacity:.55;background:#f8f9ff;}

/* AI field */
.cvm-ai-field{display:flex;flex-direction:column;gap:5px;}
.cvm-ai-field-header{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.cvm-ai-field-btns{display:flex;gap:5px;align-items:center;flex-shrink:0;}

/* Section row */
.cvm-section-row{display:flex;flex-direction:column;gap:6px;}
.cvm-section-label{font-size:clamp(.6rem,2vw,.68rem);font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--slate);}
.cvm-tog-group{display:flex;flex-wrap:wrap;gap:5px;}
.cvm-tog-sub{font-size:.6rem;color:inherit;opacity:.65;}

/* Buttons */
.cvm-btn{padding:clamp(8px,2.5vw,10px) clamp(12px,3.5vw,18px);border-radius:99px;border:none;font-family:'DM Sans',sans-serif;font-size:clamp(.74rem,2.8vw,.84rem);font-weight:800;cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}
.cvm-btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}
.cvm-btn:focus-visible{outline:3px solid var(--gold);outline-offset:2px;}
.cvm-btn-sm{padding:6px 13px;font-size:.75rem;}
.cvm-btn-primary{background:linear-gradient(135deg,var(--gold),var(--gold-l));color:var(--navy);box-shadow:0 4px 14px rgba(245,158,11,.3);}
.cvm-btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 18px rgba(245,158,11,.45);}
.cvm-btn-ai{background:linear-gradient(135deg,var(--ai),var(--ai-l));color:#fff;box-shadow:0 4px 14px rgba(124,58,237,.3);}
.cvm-btn-ai:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 18px rgba(124,58,237,.45);}
.cvm-btn-ai-sm{background:linear-gradient(135deg,var(--ai),var(--ai-l));color:#fff;padding:4px 10px;border-radius:99px;font-size:.68rem;font-weight:800;font-family:'DM Sans',sans-serif;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all .15s;white-space:nowrap;}
.cvm-btn-ai-sm:disabled{opacity:.45;cursor:not-allowed;}
.cvm-btn-ai-sm:hover:not(:disabled){transform:translateY(-1px);}
.cvm-btn-ai-sm:focus-visible{outline:2px solid var(--ai);outline-offset:2px;}
.cvm-btn-revert{background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.25);color:var(--ok);padding:4px 9px;border-radius:99px;font-size:.67rem;font-weight:800;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .13s;white-space:nowrap;}
.cvm-btn-revert:hover{background:rgba(5,150,105,.14);}
.cvm-btn-generate{width:100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;font-size:clamp(.88rem,3vw,1rem);font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;box-shadow:0 4px 18px rgba(124,58,237,.35);}
.cvm-btn-generate:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07);}
.cvm-btn-generate:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.cvm-btn-ghost-dark{background:rgba(124,58,237,.08);border:1.5px solid rgba(124,58,237,.2);color:var(--ai);font-family:'DM Sans',sans-serif;}
.cvm-btn-ghost-dark:hover{background:rgba(124,58,237,.14);}
.cvm-btn-outline{background:rgba(59,130,246,.06);border:1.5px solid rgba(59,130,246,.18);color:var(--royal);font-family:'DM Sans',sans-serif;}
.cvm-btn-outline:hover{background:rgba(59,130,246,.12);}
.cvm-btn-copy{padding:7px 13px;border:1px solid #e2e8f0;background:#fff;color:var(--slate);border-radius:99px;font-size:.75rem;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;}
.cvm-btn-copy.copied{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.25);color:var(--ok);}
.cvm-btn-regen{padding:10px 16px;border:none;border-radius:12px;background:linear-gradient(135deg,rgba(124,58,237,.7),rgba(167,139,250,.8));color:#fff;font-size:clamp(.78rem,3vw,.88rem);font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;display:inline-flex;align-items:center;gap:5px;}
.cvm-btn-regen:disabled{opacity:.5;cursor:not-allowed;}
.cvm-btn-clear{padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:12px;background:#fff;font-size:.8rem;font-weight:700;color:#94a3b8;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;}
.cvm-btn-clear:hover{color:var(--red);border-color:rgba(220,38,38,.3);}
.cvm-tog-btn{padding:6px 11px;border-radius:20px;border:1.5px solid rgba(59,130,246,.18);background:#fff;font-family:'DM Sans',sans-serif;font-size:clamp(.62rem,2vw,.72rem);font-weight:700;color:var(--slate);cursor:pointer;transition:all .12s;white-space:nowrap;-webkit-tap-highlight-color:transparent;}
.cvm-tog-btn:hover{border-color:var(--gold);color:var(--navy);}
.cvm-tog-btn.active{background:linear-gradient(135deg,var(--gold),var(--gold-l));border-color:transparent;color:var(--navy);box-shadow:0 2px 8px rgba(245,158,11,.25);}
.cvm-tog-btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}

/* Progress */
.cvm-prog-wrap{margin-bottom:12px;}
.cvm-prog-row{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:5px;}
.cvm-prog-track{height:4px;background:rgba(255,255,255,.15);border-radius:99px;overflow:hidden;}
.cvm-prog-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--ai-l),#fff);transition:width .5s ease;}
.cvm-result-card .cvm-prog-row{color:var(--slate);}
.cvm-result-card .cvm-prog-track{background:#f1f5f9;}
.cvm-result-card .cvm-prog-bar{background:linear-gradient(90deg,var(--ai),var(--ai-l));}
.cvm-regen-box .cvm-prog-row{color:var(--slate);}
.cvm-regen-box .cvm-prog-track{background:#f1f5f9;}
.cvm-regen-box .cvm-prog-bar{background:linear-gradient(90deg,var(--ai),var(--ai-l));}

/* Spinner */
.cvm-spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0;}
.cvm-spin-sm{width:10px;height:10px;border-width:1.5px;}
@keyframes spin{to{transform:rotate(360deg)}}

/* Result card */
.cvm-result-card{padding:0;overflow:hidden;}
.cvm-result-accent-line{height:3px;background:linear-gradient(90deg,var(--ai),var(--ai-l),transparent);}
.cvm-result-hdr{padding:13px 16px;background:#f8faff;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.cvm-result-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--ai),var(--ai-l));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.cvm-result-name{font-size:13px;font-weight:800;color:var(--navy);display:flex;align-items:center;gap:6px;}
.cvm-result-sub{font-size:10px;color:#94a3b8;margin-top:1px;}
.cvm-ai-badge{font-size:9px;font-weight:800;color:var(--ok);background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.2);border-radius:99px;padding:1px 7px;}
.cvm-result-body{padding:20px;}
.cvm-letter-text{font-size:clamp(12px,3vw,14px);color:#374151;line-height:1.85;white-space:pre-wrap;word-break:break-word;font-family:'DM Sans',sans-serif;}

/* Regen box */
.cvm-regen-box{padding:16px;background:rgba(248,250,255,.8);border-top:1px solid #f1f5f9;}
.cvm-regen-title{font-size:13px;font-weight:800;color:var(--navy);margin-bottom:3px;}
.cvm-chips{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0;}
.cvm-chip{padding:4px 10px;background:#f8faff;border:1px solid #e2e8f0;border-radius:99px;font-size:11px;font-weight:600;color:var(--slate);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap;}
.cvm-chip:hover{background:rgba(124,58,237,.06);color:var(--ai);border-color:rgba(124,58,237,.2);}
.cvm-regen-input{width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:11px;font-size:13px;font-weight:600;color:var(--navy);background:#fff;outline:none;font-family:'DM Sans',sans-serif;margin:8px 0;transition:border-color .15s;}
.cvm-regen-input:focus{border-color:rgba(124,58,237,.35);}
.cvm-regen-row{display:flex;gap:8px;flex-wrap:wrap;}

/* Action bar */
.cvm-action{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;padding:12px 16px;background:linear-gradient(135deg,var(--navy),var(--royal));border-radius:16px;flex-wrap:nowrap;}
.cvm-action-info{flex:1;min-width:0;}
@media(max-width:440px){.cvm-action-info{display:none;}}
.cvm-action-label{font-size:.6rem;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.06em;text-transform:uppercase;display:block;}
.cvm-action-value{font-size:clamp(.74rem,2.5vw,.84rem);font-weight:700;color:rgba(255,255,255,.9);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cvm-action-btns{display:flex;gap:7px;align-items:center;flex-shrink:0;}
.cvm-btn-danger{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.55);font-family:'DM Sans',sans-serif;}
.cvm-btn-danger:hover{background:rgba(220,38,38,.2);color:#fff;border-color:rgba(220,38,38,.4);}
.cvm-btn-ghost-act{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.85);font-family:'DM Sans',sans-serif;padding:8px 14px;border-radius:99px;font-size:.9rem;cursor:pointer;transition:all .15s;}
.cvm-btn-ghost-act:hover{background:rgba(255,255,255,.15);color:#fff;}

/* Preview panel */
.cvm-preview-panel{border-radius:var(--radius);border:1px solid var(--border);background:var(--card-bg);backdrop-filter:blur(6px);box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;}
@media(min-width:960px){.cvm-preview-panel{position:sticky;top:24px;height:calc(100vh - 48px);}}
.cvm-preview-header{padding:10px 14px;border-bottom:1px solid rgba(59,130,246,.1);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;flex-shrink:0;}
.cvm-preview-header-title{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(.88rem,3vw,1rem);color:var(--navy);}

/* Controls */
.cvm-controls{padding:10px 12px;border-bottom:1px solid rgba(59,130,246,.08);flex-shrink:0;}
.cvm-tpl-label{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--slate);margin-bottom:7px;}
.cvm-style-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:8px;}
@media(min-width:960px){.cvm-style-grid{grid-template-columns:repeat(6,1fr);}}
.cvm-style-card{padding:6px 4px 5px;border-radius:10px;border:1.5px solid rgba(59,130,246,.12);text-align:center;cursor:pointer;transition:all .12s;background:#fff;}
.cvm-style-card:hover{border-color:var(--gold);}
.cvm-style-card.active{border-color:var(--gold);background:rgba(245,158,11,.06);box-shadow:0 0 0 2px rgba(245,158,11,.2);}
.cvm-style-card:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.cvm-thumb-svg{width:100%;height:auto;display:block;border-radius:4px;}
.cvm-style-label{font-size:.6rem;font-weight:800;color:var(--slate);margin-top:4px;}
.cvm-style-card.active .cvm-style-label{color:var(--navy);}
.cvm-accent-row{display:flex;align-items:center;gap:8px;margin-top:4px;}
.cvm-accent-label{font-size:.65rem;font-weight:700;color:var(--slate);white-space:nowrap;}
.cvm-dots{display:flex;gap:7px;flex-wrap:wrap;}
.cvm-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;transition:transform .1s;flex-shrink:0;border:2px solid transparent;}
.cvm-dot:hover{transform:scale(1.2);}
.cvm-dot.selected{outline:3px solid var(--navy);outline-offset:2px;}
.cvm-dot:focus-visible{outline:3px solid var(--sky);outline-offset:2px;}

/* Preview scroll */
.cvm-preview-scroll{flex:1;background:#d8dff0;padding:16px;overflow-y:auto;overflow-x:hidden;display:flex;justify-content:center;align-items:flex-start;}
@media(min-width:960px){.cvm-preview-scroll{align-items:center;overflow:hidden;}}

/* Suggestions */
.cvm-suggest-label{font-size:clamp(.72rem,2.5vw,.78rem);color:var(--slate);margin-bottom:10px;font-weight:600;}
.cvm-suggest{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:10px;}
@media(min-width:480px){.cvm-suggest{grid-template-columns:repeat(auto-fit,minmax(170px,1fr));}}
.cvm-suggest a{display:flex;align-items:center;gap:7px;padding:9px 12px;background:rgba(255,255,255,.6);border-radius:99px;border:1px solid rgba(59,130,246,.1);color:var(--navy);text-decoration:none;font-weight:600;font-size:clamp(.75rem,3vw,.86rem);transition:all .1s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cvm-suggest a:hover{background:#fff;border-color:var(--gold);}
.cvm-suggest a:focus-visible{outline:2px solid var(--sky);outline-offset:2px;border-radius:99px;}
.cvm-cta{margin-top:14px;background:linear-gradient(135deg,var(--navy),var(--royal));border-radius:18px;padding:clamp(14px,4vw,22px) clamp(14px,4vw,24px);color:#fff;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;}
.cvm-cta h3{font-family:'Playfair Display',serif;font-size:clamp(.92rem,4vw,1.1rem);margin-bottom:2px;}
.cvm-cta p{opacity:.75;font-size:clamp(.76rem,3vw,.86rem);}
.cvm-cta-link{background:linear-gradient(135deg,var(--gold),var(--gold-l));color:var(--navy);padding:9px 20px;border-radius:99px;font-weight:800;text-decoration:none;white-space:nowrap;font-family:'DM Sans',sans-serif;font-size:clamp(.8rem,3vw,.9rem);flex-shrink:0;}
.cvm-cta-link:focus-visible{outline:3px solid #fff;outline-offset:2px;border-radius:99px;}

/* ── LETTER DOC ──────────────────────────────── */
.cl-paper-wrap{width:794px;height:1123px;max-height:1123px;background:#fff;border-radius:12px;overflow:hidden;margin:0 auto;box-shadow:0 4px 24px rgba(15,23,42,.14);border:1px solid rgba(15,23,42,.07);-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}
.cl-doc{width:100%;height:100%;box-sizing:border-box;font-size:13px!important;line-height:1.45!important;}
.tpl-classic.cl-doc,.tpl-professional.cl-doc,.tpl-modern.cl-doc,.tpl-executive.cl-doc{padding:14mm 16mm!important;}
.tpl-classic.cl-doc{font-family:'Crimson Pro',Georgia,serif;color:#0f172a;font-size:13.5px!important;}
.tpl-classic .doc-header{margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #e2e8f0;}
.tpl-classic .doc-name{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--accent);letter-spacing:-.5px;line-height:1;}
.tpl-classic .doc-role{font-size:12.5px;font-weight:600;color:#475569;margin-top:5px;text-transform:uppercase;letter-spacing:2px;font-family:'DM Sans',sans-serif;}
.tpl-classic .doc-contact{font-size:11.5px;color:#64748b;margin-top:8px;font-family:'DM Sans',sans-serif;}
.tpl-classic .doc-contact span:not(:last-child)::after{content:"  ·  ";opacity:.5;}
.tpl-professional.cl-doc{font-family:'DM Sans',sans-serif;color:#0f172a;}
.tpl-professional .doc-header{margin-bottom:20px;border-bottom:3px solid var(--accent);padding-bottom:12px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;}
.tpl-professional .doc-name{font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-.5px;}
.tpl-professional .doc-role{font-size:12.5px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:1.5px;margin-top:4px;}
.tpl-professional .doc-contact-col{font-size:11px;color:#475569;text-align:right;display:flex;flex-direction:column;gap:3px;}
.tpl-professional .doc-contact span:not(:last-child)::after{display:none;}
.tpl-corporate.cl-doc{padding:0!important;font-family:'DM Sans',sans-serif;color:#0f172a;}
.tpl-corporate .doc-header{padding:14mm 16mm 14mm;background:var(--accent);color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.tpl-corporate .doc-name{font-size:32px;font-weight:900;letter-spacing:-.5px;color:#fff;}
.tpl-corporate .doc-role{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.88);margin-top:5px;text-transform:uppercase;letter-spacing:1.5px;}
.tpl-corporate .doc-contact{font-size:11.5px;color:rgba(255,255,255,.75);margin-top:10px;}
.tpl-corporate .doc-contact span:not(:last-child)::after{content:"  ·  ";color:rgba(255,255,255,.4);}
.tpl-corporate .doc-body{padding:14mm 16mm 16mm;}
.tpl-modern.cl-doc{font-family:'DM Sans',sans-serif;color:#0f172a;}
.tpl-modern .doc-header{margin-bottom:20px;border-left:6px solid var(--accent);padding-left:14px;}
.tpl-modern .doc-name{font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-.5px;}
.tpl-modern .doc-role{font-size:12.5px;font-weight:700;color:var(--accent);margin-top:5px;text-transform:uppercase;letter-spacing:1.5px;}
.tpl-modern .doc-contact{font-size:11.5px;color:#64748b;margin-top:8px;}
.tpl-modern .doc-contact span:not(:last-child)::after{content:"  ·  ";opacity:.5;}
.tpl-executive.cl-doc{font-family:'Crimson Pro',Georgia,serif;color:#0f172a;font-size:13.5px!important;}
.tpl-executive .doc-header{margin-bottom:20px;text-align:center;}
.tpl-executive .doc-header-executive{text-align:center;}
.tpl-executive .doc-name{font-family:'DM Sans',sans-serif;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;}
.tpl-executive .doc-rule{height:2px;background:var(--accent);margin:8px auto;width:60px;border-radius:0;}
.tpl-executive .doc-role{font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:2.5px;margin-top:6px;font-family:'DM Sans',sans-serif;}
.tpl-executive .doc-contact{font-size:11px;color:#64748b;margin-top:10px;text-align:center;font-family:'DM Sans',sans-serif;}
.tpl-executive .doc-contact span:not(:last-child)::after{content:"  ·  ";opacity:.45;}
.tpl-creative.cl-doc{padding:0!important;font-family:'DM Sans',sans-serif;color:#0f172a;}
.tpl-creative .doc-header{position:relative;background:var(--accent);padding:14mm 16mm 10mm;clip-path:polygon(0 0,100% 0,100% 78%,0 100%);margin-bottom:6mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.tpl-creative .doc-name{font-family:'Playfair Display',serif;font-size:30px;font-weight:900;color:#fff;letter-spacing:-.5px;}
.tpl-creative .doc-role{font-size:12px;font-weight:700;color:rgba(255,255,255,.85);margin-top:5px;text-transform:uppercase;letter-spacing:2px;}
.tpl-creative .doc-contact{font-size:11.5px;color:rgba(255,255,255,.75);margin-top:10px;}
.tpl-creative .doc-contact span:not(:last-child)::after{content:"  ·  ";color:rgba(255,255,255,.4);}
.tpl-creative .doc-body{padding:0 16mm 16mm;}
.doc-meta{margin-bottom:16px;color:#334155;font-size:12px;}
.doc-salutation{margin-bottom:12px;font-weight:700;font-size:14px;}
.doc-p{margin-bottom:8px;text-align:justify;}
.doc-bullets{margin:4px 0 8px 18px;}
.doc-bullets li{margin-bottom:4px;}
.doc-signoff{margin-top:18px;}
.doc-signoff-name{font-weight:700;margin-top:20px;font-size:14px;color:#0f172a;}
.doc-signoff-title{font-size:11.5px;color:var(--slate);margin-top:2px;text-transform:uppercase;letter-spacing:1px;font-family:'DM Sans',sans-serif;}
.doc-contact span{display:inline-block;}

@media print{
  body>*:not(#cvm-print-root){display:none!important}
  #cvm-print-root{display:block!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;background:white!important;z-index:99999!important}
  #cvm-print-root .cl-paper-wrap{width:210mm!important;height:297mm!important;max-height:297mm!important;box-shadow:none!important;border:none!important;border-radius:0!important;margin:0 auto!important;transform:none!important;overflow:hidden!important;page-break-after:avoid!important;page-break-inside:avoid!important}
  @page{margin:0;size:A4}
}
`;

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Field({ label, id, children }) {
  return (
    <div className="cvm-field">
      <label className="cvm-field-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function AIField({ label, fieldKey, value, onChange, placeholder, fieldAI, onAIWrite, onRevert, isTextarea, rows = 3, maxLength }) {
  const state    = fieldAI[fieldKey] || {};
  const loading  = state.loading;
  const canRevert = state.prevValue !== null && state.prevValue !== undefined;
  const inputId  = `ai-field-${fieldKey}`;
  return (
    <div className="cvm-ai-field">
      <div className="cvm-ai-field-header">
        <label className="cvm-field-label" htmlFor={inputId}>{label}</label>
        <div className="cvm-ai-field-btns">
          {canRevert && (
            <button className="cvm-btn cvm-btn-revert" onClick={() => onRevert(fieldKey)}
              aria-label={`Revert ${fieldKey} to previous value`}>↩ Revert</button>
          )}
          <button className="cvm-btn-ai-sm" onClick={() => onAIWrite(fieldKey)} disabled={loading}
            aria-label={`AI write ${fieldKey}`}>
            {loading ? <><span className="cvm-spin cvm-spin-sm" aria-hidden="true" />Writing…</> : "✨ AI Write"}
          </button>
        </div>
      </div>
      {isTextarea ? (
        <textarea id={inputId} className={`cvm-input cvm-textarea${loading ? " cvm-ai-loading" : ""}`}
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          rows={rows} disabled={loading} maxLength={maxLength} aria-busy={loading} />
      ) : (
        <input id={inputId} className={`cvm-input${loading ? " cvm-ai-loading" : ""}`}
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          disabled={loading} maxLength={maxLength} aria-busy={loading} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Template Thumbs (SVG — identical to original)
───────────────────────────────────────────── */
function TemplateThumb({ templateKey, accent }) {
  const thumbs = {
    classic: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <text x="6" y="16" fontFamily="Georgia,serif" fontSize="9" fontWeight="900" fill={accent}>John Smith</text>
        <line x1="6" y1="20" x2="54" y2="20" stroke="#e2e8f0" strokeWidth="1"/>
        <rect x="6" y="24" width="28" height="2" rx="1" fill="#cbd5e1"/>
        <rect x="6" y="29" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="33" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="37" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
    professional: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <rect x="6" y="6" width="48" height="18" fill="#f8faff"/>
        <text x="8" y="17" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#0f172a">John Smith</text>
        <line x1="6" y1="24" x2="54" y2="24" stroke={accent} strokeWidth="2"/>
        <rect x="6" y="29" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="33" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="37" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
    corporate: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <rect width="60" height="26" fill={accent}/>
        <text x="6" y="14" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#fff">John Smith</text>
        <text x="6" y="22" fontFamily="Arial,sans-serif" fontSize="5" fill="rgba(255,255,255,0.8)">Marketing Manager</text>
        <rect x="6" y="32" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="36" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="40" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
    modern: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <rect x="6" y="6" width="4" height="20" rx="2" fill={accent}/>
        <text x="14" y="16" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#0f172a">John Smith</text>
        <text x="14" y="23" fontFamily="Arial,sans-serif" fontSize="5" fill={accent}>MANAGER</text>
        <rect x="6" y="32" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="36" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="40" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
    executive: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <text x="6" y="13" fontFamily="Georgia,serif" fontSize="8" fontWeight="400" fill="#0f172a" letterSpacing="2">JOHN SMITH</text>
        <rect x="6" y="16" width="48" height="1.5" rx="0" fill={accent}/>
        <rect x="6" y="19" width="24" height="1" rx="0" fill="#cbd5e1"/>
        <rect x="6" y="28" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="32" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="36" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
    creative: (
      <svg viewBox="0 0 60 76" className="cvm-thumb-svg" aria-hidden="true">
        <rect width="60" height="76" fill="#fff"/>
        <polygon points="0,0 60,0 60,22 0,30" fill={accent}/>
        <text x="6" y="14" fontFamily="Georgia,serif" fontSize="8" fontWeight="900" fill="#fff">John Smith</text>
        <text x="6" y="21" fontFamily="Arial,sans-serif" fontSize="4.5" fill="rgba(255,255,255,0.85)">CREATIVE DIRECTOR</text>
        <rect x="6" y="36" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="40" width="48" height="1.5" rx="1" fill="#e2e8f0"/>
        <rect x="6" y="44" width="40" height="1.5" rx="1" fill="#e2e8f0"/>
      </svg>
    ),
  };
  return thumbs[templateKey] || thumbs.classic;
}

/* ─────────────────────────────────────────────
   LetterDoc (identical to original)
───────────────────────────────────────────── */
function LetterDoc({ templateKey, data }) {
  const isProfessional = templateKey === "professional";
  const isExecutive    = templateKey === "executive";

  return (
    <div className={`cl-doc tpl-${templateKey}`}>
      <div className="doc-header">
        {isProfessional ? (
          <>
            <div className="doc-header-left">
              <div className="doc-name">{data.name}</div>
              {data.title && <div className="doc-role">{data.title}</div>}
            </div>
            {data.contact.length > 0 && (
              <div className="doc-contact doc-contact-col">
                {data.contact.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </>
        ) : isExecutive ? (
          <div className="doc-header-executive">
            <div className="doc-name">{data.name.toUpperCase()}</div>
            <div className="doc-rule" aria-hidden="true" />
            {data.title && <div className="doc-role">{data.title}</div>}
            {data.contact.length > 0 && (
              <div className="doc-contact">
                {data.contact.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="doc-header-left">
              <div className="doc-name">{data.name}</div>
              {data.title && <div className="doc-role">{data.title}</div>}
            </div>
            {data.contact.length > 0 && (
              <div className="doc-contact">
                {data.contact.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="doc-body">
        <div className="doc-meta">
          {data.date && <div>{data.date}</div>}
          {data.reference && <div style={{ marginTop: 4 }}>Reference: {data.reference}</div>}
        </div>
        <div className="doc-salutation">{data.salutation}</div>
        <div className="doc-paragraphs">
          {data.paragraphs.map((p, i) => {
            if (p.includes("•")) {
              const lines   = p.split("\n");
              const intro   = lines[0];
              const bullets = lines.slice(1).map(l => l.replace("•","").trim()).filter(Boolean);
              return (
                <div key={i} className="doc-p">
                  {intro}
                  <ul className="doc-bullets">
                    {bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              );
            }
            return <p key={i} className="doc-p">{p}</p>;
          })}
        </div>
        <div className="doc-signoff">
          <div>{data.signOff},</div>
          <div className="doc-signoff-name">{data.name}</div>
          {data.title && <div className="doc-signoff-title">{data.title}</div>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Client Component
───────────────────────────────────────────── */
export default function CoverLetterClient() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return DEFAULT;
    try {
      const raw = localStorage.getItem("aidla_clm_v3");
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch { return DEFAULT; }
  });

  const [template, setTemplate]   = useState("classic");
  const [accent, setAccent]       = useState(ACCENT_PALETTES[0]);
  const [mobileTab, setMobileTab] = useState("form");

  const [genLetter, setGenLetter]         = useState(null);
  const [genLoading, setGenLoading]       = useState(false);
  const [genProgress, setGenProgress]     = useState(0);
  const [regenNote, setRegenNote]         = useState("");
  const [regenLoading, setRegenLoading]   = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);
  const [copied, setCopied]               = useState("");
  const [fieldAI, setFieldAI]             = useState({});
  const [fillAllLoading, setFillAllLoading] = useState(false);
  const [fillAllPrev, setFillAllPrev]       = useState(null);
  const [toast, setToast]                 = useState("");
  const [toastType, setToastType]         = useState("info");

  const previewScrollRef = useRef(null);
  const resultRef        = useRef(null);
  const [scale, setScale] = useState(0.4);

  const showToast = useCallback((msg, type = "info") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3500);
  }, []);

  /* Scale calculator */
  useEffect(() => {
    const el = previewScrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width === 0) return;
      const isDesktop = window.innerWidth >= 960;
      const scaleW = width / PAPER_W;
      let scaleH = scaleW;
      if (isDesktop && height > 0) scaleH = height / PAPER_H;
      setScale(Math.min(scaleW, scaleH, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mobileTab]);

  /* Persist */
  useEffect(() => {
    try { localStorage.setItem("aidla_clm_v3", JSON.stringify(data)); } catch {}
  }, [data]);

  /* Set date on client (avoids SSR mismatch) */
  useEffect(() => {
    if (!data.date) {
      setData(d => ({ ...d, date: new Date().toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" }) }));
    }
  }, []);

  const update = useCallback((patch) => setData(prev => ({ ...prev, ...patch })), []);

  const letterData = useMemo(() => buildLetterData(data), [data]);
  const plainText  = useMemo(() => buildPlainText(data), [data]);

  /* ── Generate ── */
  const handleGenerate = useCallback(async () => {
    if (!data.jobTitle.trim()) return showToast("Job title is required.", "error");
    setGenLoading(true); setGenProgress(0); setGenLetter(null);
    const tick = setInterval(() => setGenProgress(p => Math.min(p + 9, 88)), 550);
    try {
      const res = await callEdge({
        mode:"generate", applicantName:data.fullName, jobTitle:data.jobTitle, company:data.company,
        hiringMgr:data.hiringManager, experience:"", skills:data.highlights,
        whyCompany:"", tone:data.tone, length:data.length,
      });
      clearInterval(tick); setGenProgress(100);
      setTimeout(() => {
        setGenLetter(res.letter);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
      }, 200);
    } catch (e) {
      clearInterval(tick); setGenProgress(0);
      showToast(e.message || "Generation failed.", "error");
    }
    setTimeout(() => setGenLoading(false), 300);
  }, [data, showToast]);

  /* ── Regen ── */
  const handleRegen = useCallback(async () => {
    if (!genLetter || regenLoading) return;
    setRegenLoading(true); setRegenProgress(0);
    const tick = setInterval(() => setRegenProgress(p => Math.min(p + 10, 88)), 500);
    try {
      const res = await callEdge({
        mode:"regen", isRegen:true, jobTitle:data.jobTitle, company:data.company,
        tone:data.tone, length:data.length, previousLetter:genLetter,
        regenInstructions:regenNote.trim() || "Write a fresh variation",
      });
      clearInterval(tick); setRegenProgress(100);
      setTimeout(() => { setGenLetter(res.letter); setRegenNote(""); }, 200);
    } catch (e) { showToast(e.message || "Rewrite failed.", "error"); }
    setTimeout(() => setRegenLoading(false), 300);
  }, [genLetter, regenLoading, data, regenNote, showToast]);

  /* ── Per-field AI ── */
  const handleFieldAI = useCallback(async (field) => {
    const currentVal = data[field] || "";
    setFieldAI(prev => ({ ...prev, [field]: { loading:true, prevValue:currentVal } }));
    try {
      const res = await callEdge({
        mode:"rewrite_field", field, fieldContent:currentVal,
        jobTitle:data.jobTitle, company:data.company, hiringMgr:data.hiringManager,
        tone:data.tone, applicantName:data.fullName, experience:data.highlights, skills:data.highlights,
      });
      update({ [field]: res.fieldContent });
      setFieldAI(prev => ({ ...prev, [field]: { loading:false, prevValue:currentVal } }));
    } catch (e) {
      showToast(e.message || "AI write failed.", "error");
      setFieldAI(prev => ({ ...prev, [field]: { loading:false, prevValue:null } }));
    }
  }, [data, update, showToast]);

  const handleFieldRevert = useCallback((field) => {
    const prev = fieldAI[field]?.prevValue;
    if (prev !== null && prev !== undefined) {
      update({ [field]: prev });
      setFieldAI(p => ({ ...p, [field]: { ...p[field], prevValue:null } }));
    }
  }, [fieldAI, update]);

  /* ── Fill All ── */
  const handleFillAll = useCallback(async () => {
    if (!data.jobTitle.trim()) return showToast("Add a job title first.", "error");
    setFillAllLoading(true);
    setFillAllPrev({ highlights:data.highlights, customParagraph:data.customParagraph, reference:data.reference });
    try {
      const res = await callEdge({
        mode:"fill_all", applicantName:data.fullName, jobTitle:data.jobTitle, company:data.company,
        hiringMgr:data.hiringManager, experience:data.highlights, skills:data.highlights,
        whyCompany:"", tone:data.tone, length:data.length,
      });
      update({
        highlights:      res.highlights      || data.highlights,
        customParagraph: res.customParagraph || data.customParagraph,
        reference:       res.reference       || data.reference,
      });
      showToast("✨ All fields filled by AI!", "success");
    } catch (e) {
      showToast(e.message || "Fill all failed.", "error");
      setFillAllPrev(null);
    }
    setFillAllLoading(false);
  }, [data, update, showToast]);

  const handleFillAllRevert = useCallback(() => {
    if (fillAllPrev) { update(fillAllPrev); setFillAllPrev(null); showToast("Reverted.", "info"); }
  }, [fillAllPrev, update, showToast]);

  /* ── Copy ── */
  const handleCopy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(id); setTimeout(() => setCopied(""), 2200);
    showToast("Copied to clipboard ✅", "success");
  };

  /* ── Print (identical to original, accent injected via CSS var) ── */
  const handlePrint = useCallback(() => {
    if (!safeText(data.fullName)) return showToast("Full name is required.", "error");
    if (!safeText(data.company))  return showToast("Company name is required.", "error");
    if (!safeText(data.jobTitle)) return showToast("Job title is required.", "error");

    const previewPaper = document.querySelector(".cvm-preview-scroll .cl-paper-wrap");
    if (!previewPaper) return showToast("Preview not found.", "error");

    let styleEl = document.getElementById("cvm-print-style");
    if (!styleEl) { styleEl = document.createElement("style"); styleEl.id = "cvm-print-style"; document.head.appendChild(styleEl); }

    styleEl.textContent = `
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
      @media print {
        body>*:not(#cvm-print-root){display:none!important}
        #cvm-print-root{display:block!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;background:white!important;z-index:99999!important}
        #cvm-print-root .cl-paper-wrap{width:210mm!important;height:297mm!important;max-height:297mm!important;box-shadow:none!important;border:none!important;border-radius:0!important;margin:0 auto!important;transform:none!important;--accent:${accent};overflow:hidden!important;page-break-after:avoid!important;page-break-inside:avoid!important}
        #cvm-print-root .tpl-corporate .doc-header{background-color:${accent}!important;background:${accent}!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        #cvm-print-root .tpl-classic .doc-name{color:${accent}!important}
        #cvm-print-root .tpl-professional .doc-header{border-bottom-color:${accent}!important}
        #cvm-print-root .tpl-professional .doc-role{color:${accent}!important}
        #cvm-print-root .tpl-modern .doc-header{border-left-color:${accent}!important}
        #cvm-print-root .tpl-modern .doc-role{color:${accent}!important}
        #cvm-print-root .tpl-executive .doc-rule{background:${accent}!important}
        #cvm-print-root .tpl-creative .doc-header{background:${accent}!important}
        @page{margin:0;size:A4}
      }
    `;

    let printRoot = document.getElementById("cvm-print-root");
    if (!printRoot) { printRoot = document.createElement("div"); printRoot.id = "cvm-print-root"; document.body.appendChild(printRoot); }

    const clone = previewPaper.cloneNode(true);
    clone.style.cssText = `--accent:${accent};width:210mm;height:297mm;max-height:297mm;transform:none!important;border-radius:0!important;box-shadow:none!important;border:none!important;margin:0 auto!important;overflow:hidden!important;page-break-after:avoid!important;page-break-inside:avoid!important;`;

    [".doc-header",".doc-name",".doc-role"].forEach(sel => {
      const cloneNode = clone.querySelector(sel);
      const liveNode  = previewPaper.querySelector(sel);
      if (!cloneNode || !liveNode) return;
      const cs = window.getComputedStyle(liveNode);
      const bg = cs.backgroundColor;
      const col = cs.color;
      if (bg && bg !== "rgba(0, 0, 0, 0)") { cloneNode.style.setProperty("background-color",bg,"important"); cloneNode.style.setProperty("background",bg,"important"); }
      if (col) cloneNode.style.setProperty("color",col,"important");
    });

    if (template === "corporate") {
      const hdr = clone.querySelector(".doc-header");
      if (hdr) { hdr.style.setProperty("background-color",accent,"important"); hdr.style.setProperty("background",accent,"important"); hdr.style.setProperty("-webkit-print-color-adjust","exact","important"); }
    }

    printRoot.innerHTML = "";
    printRoot.appendChild(clone);
    setTimeout(() => window.print(), 200);
  }, [data, accent, template, showToast]);

  /* ── Reset ── */
  const handleReset = () => {
    if (!window.confirm("Reset all fields?")) return;
    localStorage.removeItem("aidla_clm_v3");
    setData(DEFAULT); setTemplate("classic"); setAccent(ACCENT_PALETTES[0]);
    setGenLetter(null); setFillAllPrev(null); setFieldAI({});
    showToast("Reset ✅", "success");
  };

  const fieldCount = [data.fullName,data.title,data.email,data.phone,data.company,data.jobTitle].filter(Boolean).length;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>

      <div className="cvm-root">
        <div className="cvm-orbs" aria-hidden="true">
          <div className="cvm-orb cvm-orb1" /><div className="cvm-orb cvm-orb2" /><div className="cvm-orb cvm-orb3" />
        </div>

        <div className="cvm-wrap">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="cvm-crumb">
            <Link href="/">Home</Link><span aria-hidden="true">›</span>
            <Link href="/tools">Tools</Link><span aria-hidden="true">›</span>
            <Link href="/tools/career">Career</Link><span aria-hidden="true">›</span>
            <span aria-current="page">Cover Letter Maker</span>
          </nav>

          {/* Hero */}
          <header className="cvm-hero fade-up">
            <p className="cvm-badge">✉️ AIDLA AI — Cover Letter</p>
            <h1 className="cvm-title">Cover Letter <span className="cvm-title-acc">Maker</span></h1>
            <p className="cvm-sub">Fill your details manually or let AI write any field. 6 templates, live preview, print to PDF — no sign-up needed.</p>
          </header>

          {/* Pills */}
          <ul className="cvm-pills fade-up-1" role="list" aria-label="Features" style={{ listStyle:"none",padding:0 }}>
            {["✓ 6 Templates","✓ AI Write per Field","✓ AI Fill All","✓ Live Preview","✓ 1-Page PDF limit","✓ Auto-saved"].map(p => (
              <li key={p} className="cvm-pill">{p}</li>
            ))}
          </ul>

          {/* Toast */}
          {toast && (
            <div className={`cvm-toast ${toastType} toast-anim`} role="alert" aria-live="polite">
              <span>{toast}</span>
              <button className="cvm-toast-close" onClick={() => setToast("")} aria-label="Dismiss notification">×</button>
            </div>
          )}

          {/* Mobile tab bar */}
          <div className="cvm-tab-bar" role="tablist" aria-label="View sections">
            <button className={`cvm-tog-btn${mobileTab==="form"?" active":""}`}
              role="tab" aria-selected={mobileTab==="form"} onClick={() => setMobileTab("form")}>✍️ Edit</button>
            <button className={`cvm-tog-btn${mobileTab==="preview"?" active":""}`}
              role="tab" aria-selected={mobileTab==="preview"} onClick={() => setMobileTab("preview")}>👁 Preview</button>
            <button className="cvm-btn cvm-btn-primary cvm-btn-sm" style={{ marginLeft:"auto" }}
              onClick={handlePrint} aria-label="Print cover letter as PDF">🖨️ Print</button>
          </div>

          {/* Stats bar */}
          {fieldCount > 0 && (
            <div className="cvm-stats fade-in" role="status" aria-live="polite">
              <div className="cvm-stat g">✅ {fieldCount} field{fieldCount !== 1?"s":""} filled</div>
              <div className="cvm-stat-div" aria-hidden="true" />
              <div className="cvm-stat">🎙️ {TONES.find(t=>t.key===data.tone)?.label.split(" ").slice(1).join(" ")}</div>
              <div className="cvm-stat-div" aria-hidden="true" />
              <div className="cvm-stat">📏 {LENGTHS.find(l=>l.key===data.length)?.label}</div>
            </div>
          )}

          {/* Fill All Banner */}
          <div className="cvm-fill-all-banner fade-up-2">
            <div className="cvm-fill-all-left">
              <span className="cvm-fill-all-icon" aria-hidden="true">✨</span>
              <div>
                <div className="cvm-fill-all-title">AI Fill All</div>
                <div className="cvm-fill-all-sub">Instantly fill Highlights, Custom Paragraph &amp; Reference from your job details</div>
              </div>
            </div>
            <div className="cvm-fill-all-actions">
              {fillAllPrev && (
                <button className="cvm-btn cvm-btn-ghost-dark" onClick={handleFillAllRevert}>↩ Revert</button>
              )}
              <button className="cvm-btn cvm-btn-ai" onClick={handleFillAll} disabled={fillAllLoading}
                aria-busy={fillAllLoading} aria-label="Fill all fields with AI">
                {fillAllLoading ? <><span className="cvm-spin" aria-hidden="true" />Filling…</> : "✨ Fill All Fields"}
              </button>
            </div>
          </div>

          {/* Main Layout */}
          <div className="cvm-layout">

            {/* ── LEFT: FORM ── */}
            <div className={`cvm-col-form${mobileTab==="preview"?" cvm-col-hidden":""}`}
              role="tabpanel" aria-label="Edit cover letter">

              {/* Personal Details */}
              <section className="cvm-card fade-up-3" aria-labelledby="personal-heading">
                <h2 className="cvm-card-title" id="personal-heading">👤 Personal Details</h2>
                <div className="cvm-form-grid">
                  <Field label="Full Name *" id="cl-fullname">
                    <input id="cl-fullname" className="cvm-input" value={data.fullName} onChange={e=>update({fullName:e.target.value})} placeholder="e.g. Ahmed Ali" maxLength={60} autoComplete="name" />
                  </Field>
                  <Field label="Your Title" id="cl-title">
                    <input id="cl-title" className="cvm-input" value={data.title} onChange={e=>update({title:e.target.value})} placeholder="e.g. Marketing Manager" maxLength={60} />
                  </Field>
                  <Field label="Email" id="cl-email">
                    <input id="cl-email" className="cvm-input" type="email" value={data.email} onChange={e=>update({email:e.target.value})} placeholder="you@email.com" maxLength={80} autoComplete="email" />
                  </Field>
                  <Field label="Phone" id="cl-phone">
                    <input id="cl-phone" className="cvm-input" type="tel" value={data.phone} onChange={e=>update({phone:e.target.value})} placeholder="+1 234 567 890" maxLength={30} autoComplete="tel" />
                  </Field>
                  <Field label="Location" id="cl-location">
                    <input id="cl-location" className="cvm-input" value={data.location} onChange={e=>update({location:e.target.value})} placeholder="Dubai, UAE" maxLength={60} />
                  </Field>
                  <Field label="LinkedIn / Website" id="cl-linkedin">
                    <input id="cl-linkedin" className="cvm-input" value={data.linkedin} onChange={e=>update({linkedin:e.target.value})} placeholder="linkedin.com/in/..." maxLength={100} />
                  </Field>
                </div>
              </section>

              {/* Job & Company */}
              <section className="cvm-card fade-up-3" aria-labelledby="job-heading">
                <h2 className="cvm-card-title" id="job-heading">🏢 Job &amp; Company</h2>
                <div className="cvm-form-grid">
                  <Field label="Company *" id="cl-company">
                    <input id="cl-company" className="cvm-input" value={data.company} onChange={e=>update({company:e.target.value})} placeholder="e.g. Google" maxLength={80} />
                  </Field>
                  <Field label="Job Title *" id="cl-jobtitle">
                    <input id="cl-jobtitle" className="cvm-input" value={data.jobTitle} onChange={e=>update({jobTitle:e.target.value})} placeholder="e.g. Senior Developer" maxLength={80} />
                  </Field>
                  <Field label="Hiring Manager" id="cl-manager">
                    <input id="cl-manager" className="cvm-input" value={data.hiringManager} onChange={e=>update({hiringManager:e.target.value})} placeholder="e.g. Ms. Jane Doe" maxLength={60} />
                  </Field>
                  <Field label="Job Location" id="cl-joblocation">
                    <input id="cl-joblocation" className="cvm-input" value={data.jobLocation} onChange={e=>update({jobLocation:e.target.value})} placeholder="Remote / Dubai, UAE" maxLength={60} />
                  </Field>
                  <Field label="Date" id="cl-date">
                    <input id="cl-date" className="cvm-input" value={data.date} onChange={e=>update({date:e.target.value})} maxLength={40} />
                  </Field>
                  <Field label="Sign-off" id="cl-signoff">
                    <select id="cl-signoff" className="cvm-input" value={data.signOff} onChange={e=>update({signOff:e.target.value})}>
                      {SIGNOFFS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <div style={{ marginTop:10 }}>
                  <AIField label="Reference / Subject" fieldKey="reference" value={data.reference}
                    onChange={v=>update({reference:v})} placeholder="e.g. Application for Senior Developer – REF-2026"
                    fieldAI={fieldAI} onAIWrite={handleFieldAI} onRevert={handleFieldRevert}
                    isTextarea={false} maxLength={100} />
                </div>
              </section>

              {/* Letter Content */}
              <section className="cvm-card fade-up-4" aria-labelledby="content-heading">
                <h2 className="cvm-card-title" id="content-heading">💡 Letter Content (1-Page Limits)</h2>

                <div className="cvm-section-row">
                  <span className="cvm-section-label" id="tone-label">Tone</span>
                  <div className="cvm-tog-group" role="radiogroup" aria-labelledby="tone-label">
                    {TONES.map(t=>(
                      <button key={t.key} className={`cvm-tog-btn${data.tone===t.key?" active":""}`}
                        aria-pressed={data.tone===t.key} onClick={()=>update({tone:t.key})}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="cvm-section-row" style={{ marginTop:12 }}>
                  <span className="cvm-section-label" id="length-label">Length</span>
                  <div className="cvm-tog-group" role="radiogroup" aria-labelledby="length-label">
                    {LENGTHS.map(l=>(
                      <button key={l.key} className={`cvm-tog-btn${data.length===l.key?" active":""}`}
                        aria-pressed={data.length===l.key} onClick={()=>update({length:l.key})}>
                        {l.label} <span className="cvm-tog-sub">{l.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                  <AIField label="Highlights / Key Strengths (Max 350 Chars)" fieldKey="highlights"
                    value={data.highlights} onChange={v=>update({highlights:v})}
                    placeholder={"• 5 years frontend experience\n• Led team of 4 developers\n• Increased app performance by 40%"}
                    fieldAI={fieldAI} onAIWrite={handleFieldAI} onRevert={handleFieldRevert}
                    isTextarea rows={4} maxLength={350} />

                  <Field label="Job Description (optional — helps AI tailor your letter)" id="cl-jd">
                    <textarea id="cl-jd" className="cvm-input cvm-textarea" value={data.jobDescription}
                      onChange={e=>update({jobDescription:e.target.value})}
                      placeholder="Paste the job description here…" rows={3} maxLength={1500} />
                  </Field>

                  <AIField label="Custom Paragraph (Max 400 Chars)" fieldKey="customParagraph"
                    value={data.customParagraph} onChange={v=>update({customParagraph:v})}
                    placeholder={"Write your own or give AI a prompt:\n'Write a paragraph about my passion for building user-friendly products'"}
                    fieldAI={fieldAI} onAIWrite={handleFieldAI} onRevert={handleFieldRevert}
                    isTextarea rows={4} maxLength={400} />
                </div>
              </section>

              {/* Generate full letter */}
              <section className="cvm-card cvm-gen-card fade-up-5" aria-labelledby="generate-heading">
                <h2 className="cvm-card-title" id="generate-heading">🤖 Generate Full Letter with AI</h2>
                <p className="cvm-gen-desc">AI will write a complete, polished cover letter using all your details above.</p>
                {genLoading && (
                  <div className="cvm-prog-wrap" role="status" aria-live="polite" aria-label={`Generating: ${Math.round(genProgress)}%`}>
                    <div className="cvm-prog-row"><span>✍️ Writing your cover letter…</span><span>{Math.round(genProgress)}%</span></div>
                    <div className="cvm-prog-track"><div className="cvm-prog-bar" style={{ width:`${genProgress}%` }} /></div>
                  </div>
                )}
                <button className="cvm-btn-generate" onClick={handleGenerate}
                  disabled={genLoading || !data.jobTitle.trim()}
                  aria-busy={genLoading} aria-label="Generate full cover letter with AI">
                  {genLoading ? <><span className="cvm-spin" aria-hidden="true" />Writing…</> : "✉️ Generate Full Cover Letter"}
                </button>
              </section>

              {/* Generated result */}
              <div ref={resultRef}>
                {genLetter && (
                  <div className="cvm-card cvm-result-card fade-in">
                    <div className="cvm-result-accent-line" aria-hidden="true" />
                    <div className="cvm-result-hdr">
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div className="cvm-result-icon" aria-hidden="true">✉️</div>
                        <div>
                          <div className="cvm-result-name">
                            AI Generated Letter
                            <span className="cvm-ai-badge">✨ AI</span>
                          </div>
                          <div className="cvm-result-sub">{data.tone} · {data.length}{data.jobTitle?` · ${data.jobTitle}`:""}{data.company?` at ${data.company}`:""}</div>
                        </div>
                      </div>
                      <button className={`cvm-btn cvm-btn-copy${copied==="gen"?" copied":""}`}
                        onClick={()=>handleCopy(genLetter,"gen")} aria-label="Copy generated letter">
                        {copied==="gen"?"✅ Copied!":"📋 Copy"}
                      </button>
                    </div>
                    <div className="cvm-result-body">
                      <pre className="cvm-letter-text">{genLetter}</pre>
                    </div>

                    {/* Regen */}
                    <div className="cvm-regen-box">
                      <div className="cvm-regen-title">🔄 Refine with Instructions</div>
                      <div className="cvm-chips" role="list" aria-label="Quick refinement options">
                        {QUICK_CHIPS.map(c=>(
                          <button key={c} className="cvm-chip" role="listitem"
                            onClick={()=>setRegenNote(n=>n?`${n}. ${c}`:c)}>+ {c}</button>
                        ))}
                      </div>
                      <label htmlFor="regen-input" className="sr-only">Refinement instructions</label>
                      <input id="regen-input" className="cvm-regen-input"
                        placeholder="e.g. 'Shorter and more direct'"
                        value={regenNote} onChange={e=>setRegenNote(e.target.value)} maxLength={100} />
                      {regenLoading && (
                        <div className="cvm-prog-wrap" role="status" aria-live="polite">
                          <div className="cvm-prog-row"><span>✍️ Rewriting…</span><span>{Math.round(regenProgress)}%</span></div>
                          <div className="cvm-prog-track"><div className="cvm-prog-bar" style={{ width:`${regenProgress}%` }} /></div>
                        </div>
                      )}
                      <div className="cvm-regen-row">
                        <button className="cvm-btn cvm-btn-regen" onClick={handleRegen}
                          disabled={regenLoading||genLoading} aria-busy={regenLoading}>
                          {regenLoading?<><span className="cvm-spin" aria-hidden="true" />Rewriting…</>:regenNote.trim()?"✨ Apply & Rewrite":"🔄 New Variation"}
                        </button>
                        {regenNote && <button className="cvm-btn cvm-btn-clear" onClick={()=>setRegenNote("")}>Clear</button>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="cvm-action fade-up-6">
                <div className="cvm-action-info">
                  <span className="cvm-action-label">Ready to export</span>
                  <span className="cvm-action-value">{safeText(data.fullName)||"Your Name"} · {template} · A4</span>
                </div>
                <div className="cvm-action-btns">
                  <button className="cvm-btn cvm-btn-danger" onClick={handleReset} aria-label="Reset all fields">Clear</button>
                  <button className="cvm-btn cvm-btn-ghost-act" onClick={()=>handleCopy(plainText,"plain")}
                    aria-label="Copy plain text letter" title="Copy plain text">
                    {copied==="plain"?"✅":"📋"}
                  </button>
                  <button className="cvm-btn cvm-btn-primary" onClick={handlePrint} aria-label="Print as PDF">🖨️ Print PDF</button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: PREVIEW ── */}
            <div className={`cvm-preview-panel${mobileTab==="form"?" cvm-col-hidden":""}`}
              role="tabpanel" aria-label="Cover letter preview">

              <div className="cvm-preview-header">
                <div className="cvm-preview-header-title">Live Preview</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  <button className="cvm-btn cvm-btn-sm cvm-btn-outline"
                    onClick={()=>handleCopy(plainText,"prev")} aria-label="Copy plain text">
                    {copied==="prev"?"✅":"📋"}
                  </button>
                  <button className="cvm-btn cvm-btn-primary cvm-btn-sm" onClick={handlePrint} aria-label="Print PDF">🖨️ Print PDF</button>
                </div>
              </div>

              {/* Template selector */}
              <div className="cvm-controls">
                <div className="cvm-tpl-label" id="template-label">Template</div>
                <div className="cvm-style-grid" role="radiogroup" aria-labelledby="template-label">
                  {TEMPLATES.map(t=>(
                    <button key={t.key}
                      className={`cvm-style-card${template===t.key?" active":""}`}
                      onClick={()=>setTemplate(t.key)}
                      aria-pressed={template===t.key}
                      aria-label={`Select ${t.label} template`}>
                      <TemplateThumb templateKey={t.key} accent={accent} />
                      <div className="cvm-style-label">{t.label}</div>
                    </button>
                  ))}
                </div>
                <div className="cvm-accent-row">
                  <span className="cvm-accent-label" id="accent-label">Accent Colour</span>
                  <div className="cvm-dots" role="radiogroup" aria-labelledby="accent-label">
                    {ACCENT_PALETTES.map(p=>(
                      <button key={p} className={`cvm-dot${accent===p?" selected":""}`}
                        style={{ background:p }} onClick={()=>setAccent(p)}
                        aria-label={`Accent colour ${p}`} aria-pressed={accent===p} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Paper */}
              <div className="cvm-preview-scroll" ref={previewScrollRef} aria-label="Cover letter A4 preview" role="region">
                <div style={{ width:PAPER_W*scale, height:PAPER_H*scale, position:"relative", flexShrink:0 }}>
                  <div style={{ transform:`scale(${scale})`, transformOrigin:"top left", position:"absolute", left:0, top:0, width:PAPER_W, height:PAPER_H }}>
                    <div className="cl-paper-wrap" style={{ "--accent":accent }}>
                      <LetterDoc templateKey={template} data={letterData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{/* /cvm-layout */}

          {/* Bottom suggestions */}
          <div className="cvm-card fade-in" style={{ marginTop:12 }}>
            <p className="cvm-suggest-label">Need something else?</p>
            <nav className="cvm-suggest" aria-label="Related tools">
              <Link href="/tools/career/cv-maker"><span aria-hidden="true">📄</span> CV Maker</Link>
              <Link href="/tools/ai/cover-letter"><span aria-hidden="true">🤖</span> AI Cover Letter</Link>
              <Link href="/tools/pdf/word-to-pdf"><span aria-hidden="true">📝</span> Word → PDF</Link>
              <Link href="/tools/image/jpg-to-png"><span aria-hidden="true">🔄</span> JPG → PNG</Link>
            </nav>
            <div className="cvm-cta">
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(.92rem,4vw,1.1rem)", marginBottom:2, color:"#fff" }}>More AI Tools 🚀</h2>
                <p style={{ opacity:.75, fontSize:"clamp(.76rem,3vw,.86rem)", color:"#fff" }}>AI Email Writer, LinkedIn Bio, Interview Prep and more.</p>
              </div>
              <Link href="/tools" className="cvm-cta-link">Explore Tools ✨</Link>
            </div>
          </div>

        </div>{/* /cvm-wrap */}
      </div>{/* /cvm-root */}
    </>
  );
}