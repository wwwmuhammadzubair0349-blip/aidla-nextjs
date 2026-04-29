"use client";
// app/cover-letter/CoverLetterClient.jsx
// Public multi-step cover letter wizard — same system as /cv-builder.

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildCoverLetterHtml, CL_TEMPLATES, CL_ACCENTS, TemplateSVG } from "./coverLetterRenderer";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const WIZARD_KEY  = "cl_wizard_v1";
const TOTAL_STEPS = 8;

const INIT_DATA = () => ({
  fullName: "", email: "",
  currentTitle: "", careerLevel: "mid",
  location: "", phoneCode: "+971", phoneNum: "",
  targetCompany: "", targetRole: "",
  jobDescription: "",
  whyCompany: "", uniqueValue: "", keyAchievement: "",
  skills: "",
  tone: "professional", length: "standard",
  letterContent: "",
});

const CAREER_LEVELS = [
  { id: "entry",  label: "Entry Level", sub: "0–2 yrs",  icon: "🌱" },
  { id: "mid",    label: "Mid Level",   sub: "3–6 yrs",  icon: "🚀" },
  { id: "senior", label: "Senior",      sub: "7–12 yrs", icon: "⭐" },
  { id: "exec",   label: "Executive",   sub: "12+ yrs",  icon: "👑" },
];

const TONES = [
  { id: "professional",   label: "Professional", icon: "👔", desc: "Formal & authoritative" },
  { id: "conversational", label: "Warm",         icon: "😊", desc: "Approachable & genuine" },
  { id: "enthusiastic",   label: "Passionate",   icon: "🔥", desc: "Energetic & driven" },
];

const LENGTHS = [
  { id: "concise",  label: "Concise",  desc: "~150 words · short & punchy" },
  { id: "standard", label: "Standard", desc: "~250 words · ideal for most" },
  { id: "detailed", label: "Detailed", desc: "~400 words · comprehensive" },
];

const PHONE_CODES = [
  {c:"+971",l:"🇦🇪 UAE"},{c:"+966",l:"🇸🇦 KSA"},{c:"+974",l:"🇶🇦 Qatar"},
  {c:"+1",l:"🇺🇸 USA"},{c:"+44",l:"🇬🇧 UK"},{c:"+91",l:"🇮🇳 India"},
  {c:"+92",l:"🇵🇰 Pakistan"},{c:"+20",l:"🇪🇬 Egypt"},{c:"+49",l:"🇩🇪 Germany"},
];

/* ── CSS ───────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.cl-root{
  font-family:'Outfit',sans-serif;
  min-height:100dvh;width:100%;
  background:linear-gradient(135deg,#1a0533 0%,#3b1278 40%,#6d28d9 70%,#8b5cf6 100%);
  display:flex;flex-direction:column;align-items:stretch;
  padding:12px 12px 60px;
  -webkit-font-smoothing:antialiased;
  position:relative;overflow-x:hidden;
}
.cl-root::before{
  content:'';position:fixed;inset:0;
  background:radial-gradient(ellipse 60% 60% at 20% 80%,rgba(139,92,246,.18),transparent),
             radial-gradient(ellipse 40% 40% at 80% 20%,rgba(167,139,250,.12),transparent);
  pointer-events:none;z-index:0;
}
.cl-root>*{position:relative;z-index:1;}

.cl-header{
  width:100%;max-width:560px;margin-left:auto;margin-right:auto;
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 0 16px;
}
.cl-logo{font-family:'Sora',sans-serif;font-size:.9rem;font-weight:900;color:#fff;text-decoration:none;letter-spacing:-.5px;}
.cl-step-label{
  font-size:.72rem;font-weight:700;color:rgba(255,255,255,.7);
  background:rgba(255,255,255,.12);padding:4px 12px;border-radius:99px;backdrop-filter:blur(8px);
}

.cl-progress{width:100%;max-width:560px;margin-left:auto;margin-right:auto;margin-bottom:20px;}
.cl-prog-bar{height:4px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden;}
.cl-prog-fill{height:100%;background:linear-gradient(90deg,#c4b5fd,#a78bfa);border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1);}
.cl-prog-dots{display:flex;justify-content:space-between;margin-top:6px;}
.cl-prog-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);transition:background .3s,transform .3s;flex-shrink:0;}
.cl-prog-dot.done{background:#a78bfa;}
.cl-prog-dot.active{background:#fff;transform:scale(1.5);}

.cl-card{
  width:100%;max-width:560px;margin-left:auto;margin-right:auto;
  background:rgba(255,255,255,.97);
  border-radius:24px;padding:28px 24px 24px;
  box-shadow:0 20px 60px rgba(0,0,0,.28),0 1px 0 rgba(255,255,255,.6) inset;
  animation:clFadeIn .3s ease;
}
@media(min-width:600px){.cl-card{padding:36px 32px 28px;}}
@keyframes clFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.cl-step-icon{font-size:2rem;margin-bottom:10px;display:block;}
.cl-step-title{font-family:'Sora',sans-serif;font-size:clamp(1.2rem,5vw,1.6rem);font-weight:900;color:#0b1437;margin-bottom:6px;line-height:1.2;}
.cl-step-sub{font-size:.85rem;color:#64748b;margin-bottom:24px;line-height:1.5;}

.cl-field{display:flex;flex-direction:column;gap:5px;}
.cl-lbl{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#374151;}
.cl-inp{
  width:100%;height:48px;border-radius:12px;
  border:1.5px solid #e2e8f0;background:#f8fafc;
  padding:0 14px;font-family:'Outfit',sans-serif;
  font-size:.9rem;font-weight:500;color:#0b1437;
  outline:none;transition:border-color .15s,box-shadow .15s;
  -webkit-appearance:none;appearance:none;
}
.cl-inp:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12);background:#fff;}
textarea.cl-inp{height:auto;min-height:90px;padding:12px 14px;resize:vertical;line-height:1.6;}
select.cl-inp{
  cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234b5563' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;
}

.cl-g2{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:400px){.cl-g2{grid-template-columns:1fr 1fr;}}
.cl-span2{grid-column:1/-1;}

.cl-level-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px;}
.cl-level-btn{
  padding:14px 12px;border-radius:14px;border:2px solid #e2e8f0;
  background:#f8fafc;cursor:pointer;text-align:left;
  transition:.15s;-webkit-tap-highlight-color:transparent;
}
.cl-level-btn:hover{border-color:#c4b5fd;background:#f5f3ff;}
.cl-level-btn.on{border-color:#7c3aed;background:#f5f3ff;box-shadow:0 0 0 3px rgba(124,58,237,.1);}
.cl-level-btn .lv-icon{font-size:1.4rem;display:block;margin-bottom:4px;}
.cl-level-btn .lv-title{font-size:.82rem;font-weight:800;color:#0b1437;display:block;}
.cl-level-btn .lv-sub{font-size:.68rem;color:#64748b;}

.cl-tone-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;}
.cl-tone-btn{
  padding:14px 8px;border-radius:14px;border:2px solid #e2e8f0;
  background:#f8fafc;cursor:pointer;text-align:center;
  transition:.15s;-webkit-tap-highlight-color:transparent;
}
.cl-tone-btn:hover{border-color:#c4b5fd;background:#f5f3ff;}
.cl-tone-btn.on{border-color:#7c3aed;background:#f5f3ff;box-shadow:0 0 0 3px rgba(124,58,237,.1);}
.cl-tone-btn .t-icon{font-size:1.5rem;display:block;margin-bottom:4px;}
.cl-tone-btn .t-label{font-size:.78rem;font-weight:800;color:#0b1437;display:block;}
.cl-tone-btn .t-desc{font-size:.62rem;color:#64748b;}

.cl-length-grid{display:flex;flex-direction:column;gap:8px;}
.cl-length-btn{
  display:flex;align-items:center;gap:12px;
  padding:12px 14px;border-radius:12px;border:2px solid #e2e8f0;
  background:#f8fafc;cursor:pointer;text-align:left;
  transition:.15s;-webkit-tap-highlight-color:transparent;
}
.cl-length-btn:hover{border-color:#c4b5fd;background:#f5f3ff;}
.cl-length-btn.on{border-color:#7c3aed;background:#f5f3ff;box-shadow:0 0 0 3px rgba(124,58,237,.1);}
.cl-length-radio{width:18px;height:18px;border-radius:50%;border:2px solid #c4b5fd;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.cl-length-btn.on .cl-length-radio{background:#7c3aed;border-color:#7c3aed;}
.cl-length-radio-dot{width:7px;height:7px;border-radius:50%;background:#fff;}
.cl-length-label{font-size:.85rem;font-weight:800;color:#0b1437;}
.cl-length-desc{font-size:.72rem;color:#64748b;}

.cl-nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px;gap:12px;}
.cl-back-btn{
  height:48px;padding:0 20px;border-radius:12px;border:1.5px solid #e2e8f0;
  background:#f8fafc;color:#64748b;font-family:'Outfit',sans-serif;
  font-size:.85rem;font-weight:700;cursor:pointer;transition:background .12s;flex-shrink:0;
}
.cl-back-btn:hover{background:#f1f5f9;}
.cl-next-btn{
  flex:1;height:48px;padding:0 24px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;
  font-family:'Outfit',sans-serif;font-size:.9rem;font-weight:800;cursor:pointer;
  box-shadow:0 4px 16px rgba(124,58,237,.35);
  transition:transform .12s,box-shadow .12s,opacity .12s;
  -webkit-tap-highlight-color:transparent;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.cl-next-btn:hover:not(:disabled){transform:scale(1.02);box-shadow:0 6px 20px rgba(124,58,237,.45);}
.cl-next-btn:active:not(:disabled){transform:scale(0.98);}
.cl-next-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.cl-next-btn.gold{background:linear-gradient(135deg,#d97706,#f59e0b);box-shadow:0 4px 16px rgba(217,119,6,.35);}
.cl-next-btn.gold:hover:not(:disabled){box-shadow:0 6px 20px rgba(217,119,6,.45);}
.cl-next-btn.green{background:linear-gradient(135deg,#047857,#059669);box-shadow:0 4px 16px rgba(4,120,87,.35);}

.cl-skip-btn{background:none;border:none;font-size:.75rem;font-weight:600;color:#94a3b8;cursor:pointer;padding:4px 8px;flex-shrink:0;}
.cl-skip-btn:hover{color:#64748b;}

.cl-phone-row{display:grid;grid-template-columns:110px 1fr;gap:8px;}

/* Transition screen */
.cl-transition-screen{
  text-align:center;padding:48px 20px;
  display:flex;flex-direction:column;align-items:center;gap:20px;
  min-height:380px;justify-content:center;
}
.cl-tr-emoji{font-size:3.5rem;animation:clBounce .6s cubic-bezier(.36,.07,.19,.97) both;}
@keyframes clBounce{0%{transform:translateY(20px);opacity:0}60%{transform:translateY(-8px)}100%{transform:translateY(0);opacity:1}}
.cl-tr-dots{display:flex;gap:8px;align-items:center;}
.cl-tr-dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a78bfa);}
.cl-tr-dot:nth-child(1){animation:clPulse 1.4s ease-in-out infinite 0s;}
.cl-tr-dot:nth-child(2){animation:clPulse 1.4s ease-in-out infinite .22s;}
.cl-tr-dot:nth-child(3){animation:clPulse 1.4s ease-in-out infinite .44s;}
@keyframes clPulse{0%,100%{opacity:.2;transform:scale(.75)}50%{opacity:1;transform:scale(1.3)}}
.cl-tr-badge{font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;background:rgba(124,58,237,.08);padding:4px 14px;border-radius:99px;border:1px solid rgba(124,58,237,.18);}
.cl-tr-title{font-family:'Sora',sans-serif;font-size:clamp(1.1rem,5vw,1.45rem);font-weight:900;color:#0b1437;line-height:1.2;max-width:340px;}
.cl-tr-sub{font-size:.88rem;color:#475569;line-height:1.65;max-width:300px;font-style:italic;}
.cl-tr-bar{width:220px;height:3px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:4px;}
.cl-tr-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#a78bfa);border-radius:99px;animation:clFill 2s ease forwards;}
@keyframes clFill{0%{width:0%}100%{width:100%}}

/* Preview step */
.cl-tmpl-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;}
@media(min-width:400px){.cl-tmpl-grid{grid-template-columns:repeat(4,1fr);}}
.cl-tmpl-card{border-radius:12px;border:2px solid #e2e8f0;overflow:hidden;cursor:pointer;transition:border-color .15s,box-shadow .15s;background:#f8fafc;-webkit-tap-highlight-color:transparent;}
.cl-tmpl-card:hover{border-color:#c4b5fd;}
.cl-tmpl-card.on{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15);}
.cl-tmpl-thumb{width:100%;aspect-ratio:62/82;display:flex;align-items:center;justify-content:center;background:#f1f5f9;}
.cl-tmpl-thumb svg{width:100%;height:100%;}
.cl-tmpl-name{font-size:.62rem;font-weight:700;color:#0b1437;padding:5px 6px;text-align:center;background:#fff;border-top:1px solid #e2e8f0;}

.cl-prev-wrap{background:#c5cfe0;border-radius:12px;padding:8px;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:16px;max-height:400px;}
.cl-prev-inner{position:relative;overflow:hidden;}
.cl-prev-inner>div{transform-origin:top left;}

.cl-accent-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}
.cl-acc-dot{width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.15);cursor:pointer;transition:transform .15s;-webkit-tap-highlight-color:transparent;}
.cl-acc-dot:hover{transform:scale(1.2);}
.cl-acc-dot.on{outline:3px solid #0f172a;outline-offset:2px;}

.cl-edit-toggle{display:flex;border-radius:10px;overflow:hidden;border:1.5px solid #e2e8f0;margin-bottom:12px;}
.cl-edit-tab{flex:1;height:36px;border:none;background:#f8fafc;font-family:'Outfit',sans-serif;font-size:.78rem;font-weight:700;color:#64748b;cursor:pointer;transition:background .12s;}
.cl-edit-tab.on{background:#7c3aed;color:#fff;}

.cl-generating{display:flex;flex-direction:column;align-items:center;gap:16px;padding:40px 20px;text-align:center;min-height:200px;justify-content:center;}
.cl-gen-spinner{width:40px;height:40px;border:3px solid rgba(124,58,237,.15);border-top-color:#7c3aed;border-radius:50%;animation:clSpin .8s linear infinite;}
@keyframes clSpin{to{transform:rotate(360deg)}}

.cl-spinner{width:10px;height:10px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:clSpin .6s linear infinite;display:inline-block;flex-shrink:0;}

.cl-account-summ{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:14px 16px;margin-bottom:20px;}
.cl-account-name{font-size:.95rem;font-weight:800;color:#0b1437;}
.cl-account-email{font-size:.78rem;color:#7c3aed;margin-top:3px;}

.cl-change-email{display:inline-flex;align-items:center;gap:4px;font-size:.7rem;font-weight:700;color:#7c3aed;background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px;-webkit-tap-highlight-color:transparent;}
.cl-change-email:hover{color:#6d28d9;}

.cl-exists-banner{display:flex;align-items:flex-start;gap:10px;background:rgba(4,120,87,.06);border:1px solid rgba(4,120,87,.2);border-radius:14px;padding:14px 16px;margin-bottom:20px;}
.cl-exists-ico{font-size:1.4rem;flex-shrink:0;}
.cl-exists-text{font-size:.82rem;font-weight:600;color:#064e3b;line-height:1.5;}
.cl-exists-text span{display:block;font-size:.72rem;font-weight:500;color:#047857;margin-top:2px;}

.cl-banner{display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,rgba(124,58,237,.07),rgba(167,139,250,.04));border:1px solid rgba(124,58,237,.14);border-radius:12px;padding:12px 14px;margin-bottom:20px;font-size:.78rem;font-weight:600;color:#4c1d95;}
.cl-banner-icon{font-size:1.3rem;flex-shrink:0;}

.cl-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;font-size:.82rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:9999;pointer-events:none;animation:toastPop .2s ease;white-space:nowrap;}
.cl-toast.ok{background:#064e3b;}
.cl-toast.err{background:#7f1d1d;}
@keyframes toastPop{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.cl-success{text-align:center;padding:20px 0 8px;}
.cl-success-ico{font-size:3.5rem;margin-bottom:14px;display:block;}
.cl-success-title{font-family:'Sora',sans-serif;font-size:1.5rem;font-weight:900;color:#0b1437;margin-bottom:8px;}
.cl-success-sub{font-size:.88rem;color:#64748b;line-height:1.6;margin-bottom:24px;}

.cl-err{font-size:.72rem;color:#7f1d1d;font-weight:600;margin-top:4px;}

.cl-ai-btn{
  display:inline-flex;align-items:center;gap:5px;
  height:32px;padding:0 13px;border-radius:99px;
  border:1.5px solid rgba(124,58,237,.35);background:rgba(124,58,237,.07);color:#4c1d95;
  font-family:'Outfit',sans-serif;font-size:.72rem;font-weight:700;
  cursor:pointer;white-space:nowrap;transition:background .12s;
  -webkit-tap-highlight-color:transparent;flex-shrink:0;
}
.cl-ai-btn:hover:not(:disabled){background:rgba(124,58,237,.14);}
.cl-ai-btn:disabled{opacity:.4;cursor:not-allowed;}

.cl-field-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}

.cl-intro-hero{text-align:center;padding:4px 0 18px;}
.cl-intro-emoji{font-size:3rem;display:block;margin-bottom:10px;}
.cl-intro-headline{font-family:'Sora',sans-serif;font-size:clamp(1.3rem,6vw,1.75rem);font-weight:900;color:#0b1437;line-height:1.15;margin-bottom:10px;}
.cl-intro-sub{font-size:.85rem;color:#64748b;line-height:1.65;margin-bottom:20px;}
.cl-benefits{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
.cl-benefit-item{display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:11px 13px;border:1px solid #e2e8f0;}
.cl-benefit-icon{font-size:1.25rem;flex-shrink:0;margin-top:1px;}
.cl-benefit-title{font-size:.8rem;font-weight:800;color:#0b1437;margin-bottom:2px;}
.cl-benefit-desc{font-size:.7rem;color:#64748b;line-height:1.5;}
.cl-intro-social{font-size:.7rem;text-align:center;color:#7c3aed;font-weight:700;margin-bottom:18px;padding:8px 12px;background:#f5f3ff;border-radius:8px;border:1px solid rgba(124,58,237,.15);}
.cl-intro-cta{width:100%;padding:15px;background:linear-gradient(135deg,#7c3aed,#4c1d95);color:#fff;border:none;border-radius:14px;font-family:'Sora',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:-.2px;transition:filter .2s,transform .15s;box-shadow:0 8px 24px rgba(124,58,237,.35);}
.cl-intro-cta:hover{filter:brightness(1.08);transform:translateY(-1px);}
`;

/* ── Main Component ─────────────────────────────────────────────────────────── */
export default function CoverLetterClient() {
  const router = useRouter();

  const [step,         setStep]         = useState(0);
  const [showIntro,    setShowIntro]    = useState(true);
  const [data,         setData]         = useState(INIT_DATA);
  const [tmpl,         setTmpl]         = useState("modern");
  const [accent,       setAccent]       = useState("#1e3a8a");
  const [zoom,         setZoom]         = useState(0.42);
  const [editMode,     setEditMode]     = useState(false);
  const [generating,   setGenerating]   = useState(false);
  const [genError,     setGenError]     = useState(false);
  const [password,     setPassword]     = useState("");
  const [pwError,      setPwError]      = useState("");
  const [creating,     setCreating]     = useState(false);
  const [done,         setDone]         = useState(false);
  const [toast,        setToast]        = useState(null);
  const [transitioning,    setTransitioning]    = useState(false);
  const [transitionMsg,    setTransitionMsg]    = useState({ emoji: "", title: "", sub: "" });
  const [emailExists,      setEmailExists]      = useState(null);
  const [emailChecking,    setEmailChecking]    = useState(false);
  const [editingEmail,     setEditingEmail]     = useState(false);
  const [emailDraft,       setEmailDraft]       = useState("");
  const [aiStep,           setAiStep]           = useState(null); // "jd"|"why"|"unique"|"skills"

  const prevScrollRef = useRef(null);
  const saveTimer     = useRef(null);

  /* Load from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIZARD_KEY);
      if (!raw) return;
      const sv = JSON.parse(raw);
      if (sv.data)   setData(d => ({ ...d, ...sv.data }));
      if (sv.step != null && sv.step > 0 && sv.step < TOTAL_STEPS - 1) { setStep(sv.step); setShowIntro(false); }
      if (sv.tmpl)   setTmpl(sv.tmpl);
      if (sv.accent) setAccent(sv.accent);
    } catch {}
  }, []);

  /* Auto-save */
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(WIZARD_KEY, JSON.stringify({ data, step, tmpl, accent })); } catch {}
    }, 300);
  }, [data, step, tmpl, accent]);

  const sf = (k, v) => setData(d => ({ ...d, [k]: v }));

  const showToast = (msg, type = "inf", dur = 2800) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  };

  /* Zoom fit */
  const fitZoom = useCallback(() => {
    const el = prevScrollRef.current;
    if (!el) return;
    setZoom(Math.min(0.9, +((el.clientWidth - 16) / 794).toFixed(3)));
  }, []);

  useEffect(() => {
    if (step === 6) setTimeout(fitZoom, 120);
  }, [step, fitZoom]);

  /* AI helpers */
  const callAI = async (prompt) => {
    const res  = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cv-ai`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }
    );
    const json = await res.json();
    return json.result || "";
  };

  const generateLetter = async (forceRegen = false) => {
    if (!forceRegen && data.letterContent?.trim()) return; // already have a letter
    setGenerating(true);
    setGenError(false);
    try {
      const toneDesc = {
        professional:   "formal and authoritative",
        conversational: "warm and approachable",
        enthusiastic:   "energetic and passionate",
      }[data.tone] || "formal and authoritative";
      const wordTarget = data.length === "concise" ? "150" : data.length === "detailed" ? "400" : "250";

      const text = await callAI(
        `Write a compelling cover letter for:
Name: ${data.fullName || "the applicant"}
Current Title: ${data.currentTitle || "Professional"}
Applying for: ${data.targetRole || "the position"} at ${data.targetCompany || "the company"}
Career Level: ${data.careerLevel}
Location: ${data.location || ""}
Job Description: ${data.jobDescription || "Not provided"}
Why this company: ${data.whyCompany || ""}
Unique value: ${data.uniqueValue || ""}
Key achievement: ${data.keyAchievement || ""}
Key skills: ${data.skills || ""}
Tone: ${toneDesc}
Target length: approximately ${wordTarget} words

Instructions:
- Open with "Dear Hiring Manager," on the first line
- Strong opening: mention the role and genuine excitement
- Middle: connect experience to job requirements; quantify the key achievement
- Closing: confident call to action requesting an interview
- End with "Sincerely," then "${data.fullName || "Applicant"}" on the next line
- Output the letter text ONLY — no labels or explanations
- Separate paragraphs with a blank line`
      );
      if (!text) throw new Error("Empty response");
      sf("letterContent", text);
    } catch {
      setGenError(true);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Per-section AI helpers ─────────────────────────────────────────────── */
  const aiJobDescription = async () => {
    if (!data.targetRole && !data.targetCompany) return;
    setAiStep("jd");
    try {
      const text = await callAI(
        `Generate 6–8 key requirements/responsibilities for:
Role: ${data.targetRole || "this position"}
Company: ${data.targetCompany || ""}
Write as plain sentences, one per line. No bullets, no numbers. Focus on what the employer likely looks for.`
      );
      if (text) { sf("jobDescription", text); showToast("Requirements generated ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally { setAiStep(null); }
  };

  const aiWhyCompany = async () => {
    setAiStep("why");
    try {
      const text = await callAI(
        `Write 2 sentences explaining why a ${data.currentTitle || "professional"} would genuinely want to work at ${data.targetCompany || "this company"} as a ${data.targetRole || "professional"}.
Be specific: mention the company's reputation, mission, innovation, or growth. Sound authentic, not generic. Output text only.`
      );
      if (text) { sf("whyCompany", text); showToast("Why company filled ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally { setAiStep(null); }
  };

  const aiUniqueValue = async () => {
    setAiStep("unique");
    try {
      const text = await callAI(
        `Write one powerful sentence describing the unique value a ${data.careerLevel}-level ${data.currentTitle || data.targetRole || "professional"} brings when applying for ${data.targetRole || "this role"} at ${data.targetCompany || "this company"}.
Be specific, confident, and results-focused. Output the sentence only.`
      );
      if (text) { sf("uniqueValue", text); showToast("Unique value filled ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally { setAiStep(null); }
  };

  const aiSuggestSkills = async () => {
    setAiStep("skills");
    try {
      const text = await callAI(
        `Generate 8 ATS-optimized skills for a ${data.targetRole || "professional"} applying at ${data.targetCompany || "a company"}.
Job description context: ${data.jobDescription || ""}
Rules: One skill per line. Mix technical and soft skills. No bullets. No numbers.`
      );
      if (text) { sf("skills", text); showToast("Skills suggested ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally { setAiStep(null); }
  };

  /* Email check */
  const checkEmailExists = (email) => {
    if (!email) return;
    setEmailChecking(true);
    setEmailExists(null);
    supabase
      .from("users_profiles")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle()
      .then(({ data: row }) => { setEmailExists(!!row); setEmailChecking(false); })
      .catch(() => { setEmailExists(false); setEmailChecking(false); });
  };

  /* Inline email change */
  const confirmEmailChange = () => {
    const newEmail = emailDraft.trim().toLowerCase();
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) return;
    sf("email", newEmail);
    setEditingEmail(false);
    setEmailExists(null);
    checkEmailExists(newEmail);
  };

  /* Existing user redirect */
  const handleExistingUserRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/user/cover-letter" : `/login?redirect=${encodeURIComponent("/user/cover-letter")}`);
  };

  /* Navigation */
  const canNext = () => {
    if (step === 0) return !!(data.fullName?.trim() && data.email?.trim() && /\S+@\S+\.\S+/.test(data.email));
    if (step === 2) return !!(data.targetCompany?.trim() && data.targetRole?.trim());
    return true;
  };

  const buildTransitionMsg = (toStep) => {
    const name = (data.fullName || "").split(" ")[0] || "you";
    const msgs = {
      1: { emoji: "✨", title: `You're taking the right step, ${name}!`, sub: "Great opportunities don't wait — let's build something recruiters can't ignore." },
      2: { emoji: "💼", title: "You're on your way!",                     sub: "AIDLA is tailoring everything to your career level. Keep the momentum going..." },
      3: { emoji: "🎯", title: "Target locked!",                          sub: "Every top role goes to the person who shows exactly why they belong there. That's you." },
      4: { emoji: "💡", title: "Your story is your superpower!",          sub: "Most candidates list duties. You're showing impact. That's the difference that gets interviews." },
      5: { emoji: "🚀", title: "Almost there!",                           sub: "The best jobs go to those who clearly show their value. You're doing exactly that." },
      6: { emoji: "✍️", title: "Writing your letter…",                    sub: "AIDLA AI is crafting a personalised, ATS-optimized cover letter that makes recruiters stop scrolling." },
      7: { emoji: "🎉", title: "Your letter looks incredible!",           sub: "One final step — save it and it's yours forever. Your dream job is closer than ever." },
    };
    return msgs[toStep] || { emoji: "⚡", title: "Processing...", sub: "" };
  };

  const goNext = () => {
    if (!canNext()) return;
    const nextStep = Math.min(step + 1, TOTAL_STEPS - 1);
    if (step === 0)        checkEmailExists(data.email);
    if (nextStep === 6)    generateLetter(); // fire in background during transition
    setTransitionMsg(buildTransitionMsg(nextStep));
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      setStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2100);
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Account creation */
  const createAccount = async () => {
    if (!password || password.length < 6) { setPwError("Password must be at least 6 characters"); return; }
    setPwError("");
    setCreating(true);
    try {
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email, password,
        options: { data: { full_name: data.fullName } },
      });
      if (signUpErr) throw signUpErr;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Sign-up succeeded but no user ID returned.");

      // Generate unique referral code (same as signup page)
      let myReferCode, isUnique = false;
      while (!isUnique) {
        const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
        myReferCode  = `AIDLA-${digits}`;
        const { data: existing } = await supabase.from("users_profiles").select("user_id").eq("my_refer_code", myReferCode).maybeSingle();
        if (!existing) isUnique = true;
      }

      await supabase.from("users_profiles").insert([{
        user_id: userId,
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        referral_code_used: null,
        my_refer_code: myReferCode,
      }]);

      await supabase.from("user_cover_letters").insert({
        user_id: userId,
        name: data.fullName ? `${data.fullName}'s Cover Letter` : "My Cover Letter",
        data,
        letter: data.letterContent || "",
        template: tmpl,
        accent,
        font_id: "outfit",
      });

      localStorage.removeItem(WIZARD_KEY);
      setDone(true);
      setTimeout(() => router.push("/user/cover-letter"), 2800);
    } catch (err) {
      setPwError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  /* Success screen */
  if (done) {
    return (
      <>
        <style>{CSS}</style>
        <div className="cl-root">
          <div className="cl-header"><span className="cl-logo">AIDLA</span></div>
          <div className="cl-card">
            <div className="cl-success">
              <span className="cl-success-ico">🎉</span>
              <div className="cl-success-title">Account created!</div>
              <p className="cl-success-sub">
                Check your email to confirm your account.<br />
                Your cover letter is saved and ready in your dashboard.
              </p>
              <button className="cl-next-btn green" style={{ width:"100%", maxWidth:280, margin:"0 auto" }}
                onClick={() => router.push("/user/cover-letter")}>
                Go to My Dashboard →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Intro screen ───────────────────────────────────────────────────────── */
  if (showIntro) {
    return (
      <>
        <style>{CSS}</style>
        <div className="cl-root">
          <header className="cl-header">
            <span className="cl-logo">AIDLA</span>
          </header>
          <div className="cl-card" key="intro">
            {StepIntro()}
          </div>
        </div>
      </>
    );
  }

  /* ── Main render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="cl-root">

        <header className="cl-header">
          <span className="cl-logo">AIDLA</span>
          <span className="cl-step-label">Step {step + 1} of {TOTAL_STEPS}</span>
        </header>

        <div className="cl-progress" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={TOTAL_STEPS - 1}>
          <div className="cl-prog-bar">
            <div className="cl-prog-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="cl-prog-dots" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`cl-prog-dot${i < step ? " done" : i === step ? " active" : ""}`} />
            ))}
          </div>
        </div>

        {transitioning ? (
          <div className="cl-card">
            <div className="cl-transition-screen">
              <span className="cl-tr-emoji">{transitionMsg.emoji}</span>
              <div className="cl-tr-dots">
                <span className="cl-tr-dot" /><span className="cl-tr-dot" /><span className="cl-tr-dot" />
              </div>
              <div className="cl-tr-badge">✦ AIDLA AI</div>
              <div className="cl-tr-title">{transitionMsg.title}</div>
              <p className="cl-tr-sub">{transitionMsg.sub}</p>
              <div className="cl-tr-bar"><div className="cl-tr-bar-fill" /></div>
            </div>
          </div>
        ) : (
          <main className="cl-card" key={step}>
            {step === 0 && StepHook()}
            {step === 1 && StepBackground()}
            {step === 2 && StepJob()}
            {step === 3 && StepStory()}
            {step === 4 && StepSkills()}
            {step === 5 && StepTone()}
            {step === 6 && StepPreview()}
            {step === 7 && StepAccount()}
          </main>
        )}

        {toast && <div className={`cl-toast ${toast.type}`} role="status">{toast.msg}</div>}
      </div>
    </>
  );

  /* ════════════════════════════════════════════════════════════════════════════
     STEP FUNCTIONS — called as plain functions, never as JSX components
  ════════════════════════════════════════════════════════════════════════════ */

  function Nav({ skip = false, nextLabel = "Continue →", nextClass = "", onNext }) {
    return (
      <div className="cl-nav">
        {step > 0 ? <button className="cl-back-btn" onClick={goBack}>← Back</button> : <span />}
        {skip && <button className="cl-skip-btn" onClick={goNext}>Skip</button>}
        <button className={`cl-next-btn ${nextClass}`} onClick={onNext || goNext} disabled={!canNext()}>
          {nextLabel}
        </button>
      </div>
    );
  }

  /* Intro — Landing screen shown before the wizard starts */
  function StepIntro() {
    return (
      <>
        <div className="cl-intro-hero">
          <span className="cl-intro-emoji">✉️</span>
          <h1 className="cl-intro-headline">Your Dream Job is<br/>One Letter Away</h1>
          <p className="cl-intro-sub">
            Stop sending generic letters that get ignored. AIDLA writes a personalised, ATS-optimized cover letter tailored to your exact role — in just 3 minutes. Completely free.
          </p>
        </div>

        <div className="cl-benefits">
          <div className="cl-benefit-item">
            <span className="cl-benefit-icon">🎯</span>
            <div>
              <div className="cl-benefit-title">Beats ATS Filters Automatically</div>
              <div className="cl-benefit-desc">Engineered to pass automated screening and land on a real recruiter's desk.</div>
            </div>
          </div>
          <div className="cl-benefit-item">
            <span className="cl-benefit-icon">⚡</span>
            <div>
              <div className="cl-benefit-title">Ready in 3 Minutes</div>
              <div className="cl-benefit-desc">No blank page. No writer's block. Answer 8 quick questions — AI writes the rest perfectly.</div>
            </div>
          </div>
          <div className="cl-benefit-item">
            <span className="cl-benefit-icon">💾</span>
            <div>
              <div className="cl-benefit-title">Save, Edit & Download Forever — Free</div>
              <div className="cl-benefit-desc">No credit card. No hidden fees. Your letters saved and accessible anytime, anywhere.</div>
            </div>
          </div>
        </div>

        <div className="cl-intro-social">✦ Thousands of job seekers landed interviews with AIDLA — your turn</div>

        <button className="cl-intro-cta" onClick={() => setShowIntro(false)}>
          Build My Cover Letter Free →
        </button>
        <p style={{ marginTop: 14, fontSize: ".72rem", color: "#94a3b8", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#7c3aed", fontWeight: 700 }}>Log in</a>
        </p>
      </>
    );
  }

  /* Step 0 — Hook */
  function StepHook() {
    return (
      <>
        <span className="cl-step-icon">✉️</span>
        <h1 className="cl-step-title">Write a powerful cover letter in 3 minutes</h1>
        <p className="cl-step-sub">AI-powered and ATS-optimized. Tailored to your exact role. Free forever.</p>
        <div className="cl-g2">
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-name">Your Full Name *</label>
            <input id="cl-name" className="cl-inp" value={data.fullName} placeholder="John Smith"
              autoComplete="name" autoFocus
              onChange={e => sf("fullName", e.target.value)}
              onKeyDown={e => e.key === "Enter" && goNext()} />
          </div>
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-email">Email Address *</label>
            <input id="cl-email" className="cl-inp" type="email" value={data.email} placeholder="you@email.com"
              autoComplete="email"
              onChange={e => sf("email", e.target.value)}
              onKeyDown={e => e.key === "Enter" && goNext()} />
          </div>
        </div>
        <div className="cl-nav" style={{ marginTop: 28 }}>
          <span />
          <button className="cl-next-btn gold" onClick={goNext} disabled={!canNext()} style={{ flex: 1 }}>
            Let's Write My Cover Letter →
          </button>
        </div>
      </>
    );
  }

  /* Step 1 — Background */
  function StepBackground() {
    return (
      <>
        <span className="cl-step-icon">👔</span>
        <h2 className="cl-step-title">Your professional background</h2>
        <p className="cl-step-sub">Helps AI tailor the tone and language to your experience level.</p>
        <div className="cl-g2" style={{ marginBottom: 20 }}>
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-title">Current / Most Recent Job Title</label>
            <input id="cl-title" className="cl-inp" value={data.currentTitle} placeholder="Senior Software Engineer"
              onChange={e => sf("currentTitle", e.target.value)} />
          </div>
          <div className="cl-field">
            <label className="cl-lbl" htmlFor="cl-location">Location</label>
            <input id="cl-location" className="cl-inp" value={data.location} placeholder="Dubai, UAE"
              onChange={e => sf("location", e.target.value)} />
          </div>
          <div className="cl-field cl-span2">
            <label className="cl-lbl">Phone (optional)</label>
            <div className="cl-phone-row">
              <select className="cl-inp" value={data.phoneCode} aria-label="Country code"
                onChange={e => sf("phoneCode", e.target.value)}>
                {PHONE_CODES.map(p => <option key={p.c} value={p.c}>{p.l} {p.c}</option>)}
              </select>
              <input className="cl-inp" type="tel" value={data.phoneNum} placeholder="50 123 4567"
                onChange={e => sf("phoneNum", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="cl-lbl" style={{ display: "block", marginBottom: 10 }}>Career Level</div>
        <div className="cl-level-grid">
          {CAREER_LEVELS.map(l => (
            <button key={l.id} className={`cl-level-btn${data.careerLevel === l.id ? " on" : ""}`}
              onClick={() => sf("careerLevel", l.id)}>
              <span className="lv-icon">{l.icon}</span>
              <span className="lv-title">{l.label}</span>
              <span className="lv-sub">{l.sub}</span>
            </button>
          ))}
        </div>
        <Nav skip />
      </>
    );
  }

  /* Step 2 — The Job */
  function StepJob() {
    return (
      <>
        <span className="cl-step-icon">🎯</span>
        <h2 className="cl-step-title">The role you're applying for</h2>
        <p className="cl-step-sub">The more detail you give, the better AI can tailor your letter to this specific job.</p>
        <div className="cl-g2">
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-company">Company Name *</label>
            <input id="cl-company" className="cl-inp" value={data.targetCompany} placeholder="Google, Noon, ADNOC…"
              onChange={e => sf("targetCompany", e.target.value)} />
          </div>
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-role">Position / Job Title *</label>
            <input id="cl-role" className="cl-inp" value={data.targetRole} placeholder="Senior Product Manager"
              onChange={e => sf("targetRole", e.target.value)} />
          </div>
          <div className="cl-field cl-span2">
            <div className="cl-field-header">
              <label className="cl-lbl" htmlFor="cl-jd">
                Job Description
                <span style={{ textTransform: "none", fontWeight: 500, color: "#94a3b8", marginLeft: 4 }}>(optional)</span>
              </label>
              <button className="cl-ai-btn" onClick={aiJobDescription} disabled={aiStep === "jd" || (!data.targetRole && !data.targetCompany)}>
                {aiStep === "jd" ? <><span className="cl-spinner" /> Writing…</> : "✨ AI Generate"}
              </button>
            </div>
            <textarea id="cl-jd" className="cl-inp" rows={5} value={data.jobDescription}
              placeholder="Paste the job description here, or tap ✨ AI Generate and we'll create typical requirements based on the role."
              onChange={e => sf("jobDescription", e.target.value)} />
          </div>
        </div>
        <Nav />
      </>
    );
  }

  /* Step 3 — Your Story */
  function StepStory() {
    return (
      <>
        <span className="cl-step-icon">💡</span>
        <h2 className="cl-step-title">Why are YOU the right fit?</h2>
        <p className="cl-step-sub">These personal insights make your letter stand out from hundreds of generic ones.</p>
        <div className="cl-g2">
          <div className="cl-field cl-span2">
            <div className="cl-field-header">
              <label className="cl-lbl" htmlFor="cl-why">Why this company?</label>
              <button className="cl-ai-btn" onClick={aiWhyCompany} disabled={aiStep === "why"}>
                {aiStep === "why" ? <><span className="cl-spinner" /> Writing…</> : "✨ AI Write"}
              </button>
            </div>
            <textarea id="cl-why" className="cl-inp" rows={3} value={data.whyCompany}
              placeholder="What genuinely excites you about this company — their mission, culture, growth, product?"
              onChange={e => sf("whyCompany", e.target.value)} />
          </div>
          <div className="cl-field cl-span2">
            <div className="cl-field-header">
              <label className="cl-lbl" htmlFor="cl-unique">Your Unique Value</label>
              <button className="cl-ai-btn" onClick={aiUniqueValue} disabled={aiStep === "unique"}>
                {aiStep === "unique" ? <><span className="cl-spinner" /> Writing…</> : "✨ AI Write"}
              </button>
            </div>
            <input id="cl-unique" className="cl-inp" value={data.uniqueValue}
              placeholder="What separates you from other candidates?"
              onChange={e => sf("uniqueValue", e.target.value)} />
          </div>
          <div className="cl-field cl-span2">
            <label className="cl-lbl" htmlFor="cl-achievement">Your #1 Career Achievement</label>
            <input id="cl-achievement" className="cl-inp" value={data.keyAchievement}
              placeholder="e.g. Led a team that grew revenue by 40% in 6 months"
              onChange={e => sf("keyAchievement", e.target.value)} />
          </div>
        </div>
        <Nav skip />
      </>
    );
  }

  /* Step 4 — Skills */
  function StepSkills() {
    const chips = (data.skills || "").split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    return (
      <>
        <span className="cl-step-icon">🛠</span>
        <h2 className="cl-step-title">Skills to highlight</h2>
        <p className="cl-step-sub">List 4–8 skills most relevant to this role. AI will weave them naturally into your letter.</p>
        <div className="cl-banner">
          <span className="cl-banner-icon">💡</span>
          <span>Match skills from the job description for maximum ATS impact.</span>
        </div>
        <div className="cl-field">
          <div className="cl-field-header">
            <label className="cl-lbl" htmlFor="cl-skills">Key Skills (comma or line separated)</label>
            <button className="cl-ai-btn" onClick={aiSuggestSkills} disabled={aiStep === "skills"}>
              {aiStep === "skills" ? <><span className="cl-spinner" /> Thinking…</> : "✨ AI Suggest"}
            </button>
          </div>
          <textarea id="cl-skills" className="cl-inp" rows={4}
            placeholder="Project Management, React.js, Team Leadership, Data Analysis"
            value={data.skills} onChange={e => sf("skills", e.target.value)} />
        </div>
        {chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {chips.map((s, i) => (
              <span key={i} style={{ padding: "3px 10px", borderRadius: 99, background: "#ede9fe", border: "1px solid #ddd6fe", fontSize: ".65rem", fontWeight: 700, color: "#4c1d95" }}>{s}</span>
            ))}
          </div>
        )}
        <Nav skip />
      </>
    );
  }

  /* Step 5 — Tone & Style */
  function StepTone() {
    return (
      <>
        <span className="cl-step-icon">🎨</span>
        <h2 className="cl-step-title">Tone & length</h2>
        <p className="cl-step-sub">Choose what fits your personality and the role.</p>

        <div className="cl-lbl" style={{ display: "block", marginBottom: 10 }}>Letter Tone</div>
        <div className="cl-tone-grid">
          {TONES.map(t => (
            <button key={t.id} className={`cl-tone-btn${data.tone === t.id ? " on" : ""}`}
              onClick={() => sf("tone", t.id)}>
              <span className="t-icon">{t.icon}</span>
              <span className="t-label">{t.label}</span>
              <span className="t-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="cl-lbl" style={{ display: "block", marginBottom: 10 }}>Letter Length</div>
        <div className="cl-length-grid">
          {LENGTHS.map(l => (
            <button key={l.id} className={`cl-length-btn${data.length === l.id ? " on" : ""}`}
              onClick={() => sf("length", l.id)}>
              <div className="cl-length-radio">
                {data.length === l.id && <div className="cl-length-radio-dot" />}
              </div>
              <div>
                <div className="cl-length-label">{l.label}</div>
                <div className="cl-length-desc">{l.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <Nav nextLabel="Generate My Letter →" nextClass="gold" />
      </>
    );
  }

  /* Step 6 — Preview */
  function StepPreview() {
    const html = buildCoverLetterHtml(data, tmpl, accent, "outfit");
    return (
      <>
        <span className="cl-step-icon">📄</span>
        <h2 className="cl-step-title">Your cover letter</h2>
        <p className="cl-step-sub">AI-crafted and tailored to your role. Edit it if needed, then save it forever.</p>

        {/* Template picker */}
        <div className="cl-lbl" style={{ display: "block", marginBottom: 10 }}>Template</div>
        <div className="cl-tmpl-grid">
          {CL_TEMPLATES.map(t => (
            <div key={t.id} className={`cl-tmpl-card${tmpl === t.id ? " on" : ""}`}
              onClick={() => setTmpl(t.id)} role="button" aria-pressed={tmpl === t.id}>
              <div className="cl-tmpl-thumb">
                <TemplateSVG id={t.id} accent={accent} />
              </div>
              <div className="cl-tmpl-name">{t.name}</div>
            </div>
          ))}
        </div>

        {/* Accent colour */}
        <div className="cl-lbl" style={{ display: "block", marginBottom: 8 }}>Colour</div>
        <div className="cl-accent-row">
          {CL_ACCENTS.map(c => (
            <button key={c} className={`cl-acc-dot${accent === c ? " on" : ""}`} style={{ background: c }}
              aria-label={`Accent colour ${c}`} onClick={() => setAccent(c)} />
          ))}
        </div>

        {/* Edit toggle (only when we have a letter) */}
        {data.letterContent && (
          <div className="cl-edit-toggle">
            <button className={`cl-edit-tab${!editMode ? " on" : ""}`} onClick={() => setEditMode(false)}>👁 Preview</button>
            <button className={`cl-edit-tab${editMode ? " on" : ""}`}  onClick={() => setEditMode(true)}>✏ Edit Letter</button>
          </div>
        )}

        {/* Content area */}
        {generating ? (
          <div className="cl-generating">
            <div className="cl-gen-spinner" />
            <div style={{ fontWeight: 700, color: "#4c1d95", fontSize: ".9rem" }}>✦ AIDLA AI is writing your letter…</div>
            <div style={{ fontSize: ".78rem", color: "#64748b" }}>This takes about 10–15 seconds</div>
          </div>
        ) : genError ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>⚠️</div>
            <div style={{ fontWeight: 700, color: "#7f1d1d", marginBottom: 12 }}>AI generation failed</div>
            <button className="cl-next-btn" style={{ maxWidth: 200, margin: "0 auto" }} onClick={() => generateLetter(true)}>
              Try Again
            </button>
          </div>
        ) : editMode ? (
          <textarea
            className="cl-inp"
            style={{ minHeight: 320, fontSize: ".82rem", lineHeight: 1.8, marginBottom: 16 }}
            value={data.letterContent}
            onChange={e => sf("letterContent", e.target.value)}
          />
        ) : (
          <div className="cl-prev-wrap" ref={prevScrollRef} role="region" aria-label="Cover letter preview">
            <div className="cl-prev-inner" style={{ width: `${794 * zoom}px`, height: `${1123 * zoom}px` }}>
              <div style={{ width: "794px", transform: `scale(${zoom})`, transformOrigin: "top left", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.12)" }}
                dangerouslySetInnerHTML={{ __html: html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '') }} />
            </div>
          </div>
        )}

        {/* Regenerate link */}
        {data.letterContent && !generating && (
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <button onClick={() => generateLetter(true)}
              style={{ background: "none", border: "none", fontSize: ".72rem", color: "#7c3aed", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
              ↺ Regenerate letter
            </button>
          </div>
        )}

        <div className="cl-nav" style={{ marginTop: 8 }}>
          <button className="cl-back-btn" onClick={goBack}>← Back</button>
          {emailChecking ? (
            <button className="cl-next-btn" disabled><span className="cl-spinner" /> Checking…</button>
          ) : emailExists ? (
            <button className="cl-next-btn green" onClick={handleExistingUserRedirect}>Access My Dashboard →</button>
          ) : (
            <button className="cl-next-btn gold" onClick={goNext} disabled={generating}>Save Forever →</button>
          )}
        </div>
      </>
    );
  }

  /* Step 7 — Account */
  function StepAccount() {
    if (emailExists) {
      return (
        <>
          <span className="cl-step-icon">👋</span>
          <h2 className="cl-step-title">Welcome back!</h2>
          <p className="cl-step-sub">
            This email already has an AIDLA account. Log in to access your dashboard — your cover letter is saved and waiting.
          </p>
          <div className="cl-exists-banner">
            <span className="cl-exists-ico">✅</span>
            <div className="cl-exists-text">
              Your cover letter is ready.
              <span>Log in and it will be pre-loaded in your dashboard.</span>
            </div>
          </div>
          <div className="cl-account-summ">
            <div className="cl-account-name">{data.fullName}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <div className="cl-account-email">{data.email}</div>
            </div>
          </div>
          <div className="cl-nav">
            <button className="cl-back-btn" onClick={goBack}>← Back</button>
            <button className="cl-next-btn green" onClick={handleExistingUserRedirect}>Log in & Access My Letter →</button>
          </div>
        </>
      );
    }

    return (
      <>
        <span className="cl-step-icon">🔒</span>
        <h2 className="cl-step-title">Save your cover letter forever</h2>
        <p className="cl-step-sub">
          Create your free AIDLA account. Your letter is saved instantly — edit, download, and use it anytime.
        </p>
        <div className="cl-account-summ">
          <div className="cl-account-name">{data.fullName}</div>
          {editingEmail ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
              <input className="cl-inp" type="email" value={emailDraft} autoFocus
                style={{ flex: "1 1 160px", height: 40, fontSize: ".82rem" }} placeholder="Enter new email"
                onChange={e => setEmailDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") confirmEmailChange(); if (e.key === "Escape") setEditingEmail(false); }} />
              <button className="cl-next-btn green" style={{ flex: "none", height: 40, padding: "0 16px", fontSize: ".8rem", boxShadow: "none" }}
                onClick={confirmEmailChange}>Save</button>
              <button className="cl-back-btn" style={{ flex: "none", height: 40, padding: "0 12px", fontSize: ".8rem" }}
                onClick={() => setEditingEmail(false)}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <div className="cl-account-email">{data.email}</div>
              <button className="cl-change-email" onClick={() => { setEmailDraft(data.email); setEditingEmail(true); }}>✏ Change</button>
            </div>
          )}
        </div>

        <div className="cl-field" style={{ marginBottom: 20 }}>
          <label className="cl-lbl" htmlFor="cl-password">Create a Password</label>
          <input id="cl-password" className="cl-inp" type="password" value={password}
            placeholder="At least 6 characters" autoComplete="new-password"
            onChange={e => { setPassword(e.target.value); setPwError(""); }}
            onKeyDown={e => e.key === "Enter" && !creating && createAccount()} />
          {pwError && <div className="cl-err">{pwError}</div>}
        </div>

        <div className="cl-nav">
          <button className="cl-back-btn" onClick={goBack}>← Back</button>
          <button className="cl-next-btn green" onClick={createAccount} disabled={creating || !password}>
            {creating ? <><span className="cl-spinner" /> Creating account…</> : "Create Account & Save Letter →"}
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: ".72rem", color: "#94a3b8", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#7c3aed", fontWeight: 700 }}>Log in</a>
        </p>
        <p style={{ marginTop: 8, fontSize: ".65rem", color: "#cbd5e1", textAlign: "center", lineHeight: 1.6 }}>
          By creating an account you agree to our Terms of Service. We never spam or sell your data.
        </p>
      </>
    );
  }
}
