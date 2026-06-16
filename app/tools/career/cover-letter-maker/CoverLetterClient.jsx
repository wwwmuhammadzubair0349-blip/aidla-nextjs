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
import "./CoverLetterClient.css";

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
