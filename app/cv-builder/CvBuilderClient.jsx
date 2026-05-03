"use client";
// app/cv-builder/CvBuilderClient.jsx
// Public multi-step CV wizard — the ad-landing page.
// Collects all CV data step by step, shows live preview with template switcher,
// then creates a Supabase account at the final step and saves the CV.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildCvHtml, PREMIUM_TEMPLATES } from "@/app/tools/career/cv-maker/cv/cvRenderer";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const WIZARD_KEY  = "cv_wizard_v1";
const TOTAL_STEPS = 11;
const uid         = () => Math.random().toString(36).slice(2, 9);

const INIT_DATA = () => ({
  fullName: "", title: "", email: "", phoneCode: "+971", phoneNum: "",
  location: "", linkedin: "", github: "", website: "",
  nationality: "", dob: "", marital: "", gender: "", notice: "", drivingLicense: "",
  photoDataUrl: "",
  summary: "", skills: "", hobbies: "",
  experience: [], education: [], projects: [],
  certifications: [], languages: [], awards: [],
  publications: [], volunteer: [], references: [],
  careerLevel: "mid", targetRole: "", targetIndustry: "", careerGoal: "",
});

const FONTS = [
  { id: "outfit",   l: "Outfit",   s: "'Outfit',sans-serif" },
  { id: "sora",     l: "Sora",     s: "'Sora',sans-serif" },
  { id: "jakarta",  l: "Jakarta",  s: "'Plus Jakarta Sans',sans-serif" },
  { id: "lora",     l: "Lora",     s: "'Lora','Georgia',serif" },
  { id: "garamond", l: "Garamond", s: "'Cormorant Garamond','Georgia',serif" },
  { id: "playfair", l: "Playfair", s: "'Playfair Display','Georgia',serif" },
];
const FSIZES = { small: "10.5px", medium: "12px", large: "13.5px" };
const PAPERS = {
  a4:     { w: 794, h: 1123, l: "A4" },
  letter: { w: 816, h: 1056, l: "Letter" },
};
const ACCENTS = [
  "#1e3a8a","#0f766e","#7c2d12","#4c1d95",
  "#065f46","#1f2937","#be123c","#0369a1",
];

const FEATURED_TEMPLATES = [
  { id: "modern-stack", name: "Modern"    },
  { id: "pure-white",   name: "Clean"     },
  { id: "sidebar-dark", name: "Dark"      },
  { id: "gulf-premium", name: "Gulf"      },
  { id: "navy-exec",    name: "Executive" },
  { id: "coral-modern", name: "Coral"     },
];

const INDUSTRIES = [
  "","Technology","Finance","Healthcare","Education","Engineering",
  "Marketing","Legal","Construction","Oil & Gas","Real Estate",
  "Hospitality","Retail","Manufacturing","Telecom","Media","Consulting","Other",
];
const CAREER_LEVELS = [
  { id: "entry",  label: "Entry Level", sub: "0–2 yrs",  icon: "🌱" },
  { id: "mid",    label: "Mid Level",   sub: "3–6 yrs",  icon: "🚀" },
  { id: "senior", label: "Senior",      sub: "7–12 yrs", icon: "⭐" },
  { id: "exec",   label: "Executive",   sub: "12+ yrs",  icon: "👑" },
];
const DEG_TYPES   = ["Bachelor's Degree","Master's Degree","PhD","MBA","Diploma","High School","Associate Degree","Professional Certification","Short Course"];
const EMP_TYPES   = ["Full-time","Part-time","Contract","Freelance","Internship"];
const LANG_LEVELS = ["Native","Fluent","Professional","Conversational","Elementary"];
const PHONE_CODES = [
  {c:"+971",l:"🇦🇪 UAE"},{c:"+966",l:"🇸🇦 KSA"},{c:"+974",l:"🇶🇦 Qatar"},
  {c:"+1",l:"🇺🇸 USA"},{c:"+44",l:"🇬🇧 UK"},{c:"+91",l:"🇮🇳 India"},
  {c:"+92",l:"🇵🇰 Pakistan"},{c:"+20",l:"🇪🇬 Egypt"},{c:"+49",l:"🇩🇪 Germany"},
  {c:"+55",l:"🇧🇷 Brazil"},{c:"+27",l:"🇿🇦 S.Africa"},{c:"+234",l:"🇳🇬 Nigeria"},
];

/* ── CSS ───────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.wzr-root{
  font-family:'Outfit',sans-serif;
  min-height:100dvh;
  background:linear-gradient(135deg,#0b1437 0%,#1a3a8f 40%,#2563eb 70%,#0ea5e9 100%);
  display:flex;flex-direction:column;align-items:center;
  padding:12px 12px 60px;
  -webkit-font-smoothing:antialiased;
  position:relative;overflow-x:hidden;
}
.wzr-root::before{
  content:'';position:fixed;inset:0;
  background:radial-gradient(ellipse 60% 60% at 20% 80%,rgba(59,130,246,.18),transparent),
             radial-gradient(ellipse 40% 40% at 80% 20%,rgba(14,165,233,.15),transparent);
  pointer-events:none;z-index:0;
}
.wzr-root>*{position:relative;z-index:1;}

.wzr-header{
  width:100%;max-width:560px;
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 0 16px;
}
.wzr-logo{
  font-family:'Sora',sans-serif;font-size:.9rem;font-weight:900;
  color:#fff;text-decoration:none;letter-spacing:-.5px;
}
.wzr-step-label{
  font-size:.72rem;font-weight:700;color:rgba(255,255,255,.7);
  background:rgba(255,255,255,.12);padding:4px 12px;border-radius:99px;
  backdrop-filter:blur(8px);
}

.wzr-progress{width:100%;max-width:560px;margin-bottom:20px;}
.wzr-prog-bar{height:4px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden;}
.wzr-prog-fill{height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1);}
.wzr-prog-dots{display:flex;justify-content:space-between;margin-top:6px;}
.wzr-prog-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.25);transition:background .3s,transform .3s;flex-shrink:0;}
.wzr-prog-dot.done{background:#f59e0b;}
.wzr-prog-dot.active{background:#fff;transform:scale(1.5);}

.wzr-card{
  width:100%;max-width:560px;
  background:rgba(255,255,255,.97);
  border-radius:24px;padding:28px 24px 24px;
  box-shadow:0 20px 60px rgba(0,0,0,.25),0 1px 0 rgba(255,255,255,.6) inset;
  animation:wzrFadeIn .3s ease;
}
@media(min-width:600px){.wzr-card{padding:36px 32px 28px;}}
@keyframes wzrFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.wzr-step-icon{font-size:2rem;margin-bottom:10px;display:block;}
.wzr-step-title{
  font-family:'Sora',sans-serif;
  font-size:clamp(1.2rem,5vw,1.7rem);font-weight:900;
  color:#0b1437;margin-bottom:6px;line-height:1.2;
}
.wzr-step-sub{font-size:.85rem;color:#64748b;margin-bottom:24px;line-height:1.5;}

.wzr-field{display:flex;flex-direction:column;gap:5px;}
.wzr-lbl{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#374151;}
.wzr-inp{
  width:100%;height:48px;border-radius:12px;
  border:1.5px solid #e2e8f0;background:#f8fafc;
  padding:0 14px;font-family:'Outfit',sans-serif;
  font-size:.9rem;font-weight:500;color:#0b1437;
  outline:none;transition:border-color .15s,box-shadow .15s;
  -webkit-appearance:none;appearance:none;
}
.wzr-inp:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12);background:#fff;}
textarea.wzr-inp{height:auto;min-height:90px;padding:12px 14px;resize:vertical;line-height:1.6;}
select.wzr-inp{
  cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234b5563' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;
}

.wzr-g2{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:400px){.wzr-g2{grid-template-columns:1fr 1fr;}}
.wzr-span2{grid-column:1/-1;}

.wzr-level-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px;}
.wzr-level-btn{
  padding:14px 12px;border-radius:14px;border:2px solid #e2e8f0;
  background:#f8fafc;cursor:pointer;text-align:left;
  transition:.15s;-webkit-tap-highlight-color:transparent;
}
.wzr-level-btn:hover{border-color:#93c5fd;background:#eff6ff;}
.wzr-level-btn.on{border-color:#2563eb;background:#eff6ff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
.wzr-level-btn .lv-icon{font-size:1.4rem;display:block;margin-bottom:4px;}
.wzr-level-btn .lv-title{font-size:.82rem;font-weight:800;color:#0b1437;display:block;}
.wzr-level-btn .lv-sub{font-size:.68rem;color:#64748b;}

.wzr-shell{
  background:#f8fafc;border-radius:14px;border:1.5px solid #e2e8f0;
  padding:14px;margin-bottom:10px;transition:border-color .15s;
}
.wzr-shell:focus-within{border-color:#93c5fd;}
.wzr-shell-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.wzr-shell-title{font-size:.8rem;font-weight:700;color:#374151;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.wzr-rm-btn{
  width:28px;height:28px;border-radius:8px;border:1px solid #fca5a5;
  background:#fef2f2;color:#7f1d1d;font-size:.75rem;font-weight:700;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:background .1s;
}
.wzr-rm-btn:hover{background:#fee2e2;}

.wzr-empty{
  display:flex;align-items:center;gap:8px;
  padding:14px;color:#94a3b8;font-size:.78rem;font-weight:600;
  border:1.5px dashed #e2e8f0;border-radius:12px;margin-bottom:10px;
}

.wzr-add-btn{
  display:inline-flex;align-items:center;gap:6px;
  height:40px;padding:0 16px;border-radius:99px;
  border:1.5px dashed #93c5fd;background:#eff6ff;color:#1e3a8a;
  font-family:'Outfit',sans-serif;font-size:.78rem;font-weight:700;
  cursor:pointer;transition:background .12s;width:100%;justify-content:center;
  -webkit-tap-highlight-color:transparent;
}
.wzr-add-btn:hover{background:#dbeafe;}

.wzr-nav{display:flex;justify-content:space-between;align-items:center;margin-top:24px;gap:12px;}
.wzr-back-btn{
  height:48px;padding:0 20px;border-radius:12px;border:1.5px solid #e2e8f0;
  background:#f8fafc;color:#64748b;font-family:'Outfit',sans-serif;
  font-size:.85rem;font-weight:700;cursor:pointer;transition:background .12s;
  flex-shrink:0;
}
.wzr-back-btn:hover{background:#f1f5f9;}
.wzr-next-btn{
  flex:1;height:48px;padding:0 24px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#2563eb,#0ea5e9);
  color:#fff;font-family:'Outfit',sans-serif;
  font-size:.9rem;font-weight:800;cursor:pointer;
  box-shadow:0 4px 16px rgba(37,99,235,.35);
  transition:transform .12s,box-shadow .12s,opacity .12s;
  -webkit-tap-highlight-color:transparent;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
}
.wzr-next-btn:hover:not(:disabled){transform:scale(1.02);box-shadow:0 6px 20px rgba(37,99,235,.45);}
.wzr-next-btn:active:not(:disabled){transform:scale(0.98);}
.wzr-next-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.wzr-next-btn.gold{background:linear-gradient(135deg,#d97706,#f59e0b);box-shadow:0 4px 16px rgba(217,119,6,.35);}
.wzr-next-btn.gold:hover:not(:disabled){box-shadow:0 6px 20px rgba(217,119,6,.45);}
.wzr-next-btn.green{background:linear-gradient(135deg,#047857,#059669);box-shadow:0 4px 16px rgba(4,120,87,.35);}

.wzr-skip-btn{background:none;border:none;font-size:.75rem;font-weight:600;color:#94a3b8;cursor:pointer;padding:4px 8px;flex-shrink:0;}
.wzr-skip-btn:hover{color:#64748b;}

.wzr-phone-row{display:grid;grid-template-columns:110px 1fr;gap:8px;}

.wzr-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}
.wzr-chip{padding:3px 10px;border-radius:99px;background:#eff6ff;border:1px solid #bfdbfe;font-size:.65rem;font-weight:700;color:#1e3a8a;}

.wzr-ai-btn{
  display:inline-flex;align-items:center;gap:5px;
  height:34px;padding:0 14px;border-radius:99px;
  border:1.5px solid rgba(217,119,6,.4);background:rgba(217,119,6,.07);color:#78350f;
  font-family:'Outfit',sans-serif;font-size:.72rem;font-weight:700;
  cursor:pointer;white-space:nowrap;transition:background .12s;
  -webkit-tap-highlight-color:transparent;
}
.wzr-ai-btn:hover:not(:disabled){background:rgba(217,119,6,.14);}
.wzr-ai-btn:disabled{opacity:.4;cursor:not-allowed;}

.wzr-spinner{
  width:10px;height:10px;border:2px solid currentColor;border-top-color:transparent;
  border-radius:50%;animation:wzrSpin .6s linear infinite;display:inline-block;flex-shrink:0;
}
@keyframes wzrSpin{to{transform:rotate(360deg)}}

/* ── Transition / AI-analyzing screen ─────────── */
.wzr-transition-screen{
  text-align:center;padding:48px 20px;
  display:flex;flex-direction:column;align-items:center;gap:20px;
  min-height:380px;justify-content:center;
}
.wzr-tr-emoji{font-size:3.5rem;animation:wzrBounce .6s cubic-bezier(.36,.07,.19,.97) both;}
@keyframes wzrBounce{
  0%{transform:translateY(20px);opacity:0}
  60%{transform:translateY(-8px)}
  100%{transform:translateY(0);opacity:1}
}
.wzr-tr-dots{display:flex;gap:8px;align-items:center;}
.wzr-tr-dot{
  width:10px;height:10px;border-radius:50%;
  background:linear-gradient(135deg,#2563eb,#0ea5e9);
}
.wzr-tr-dot:nth-child(1){animation:wzrPulse 1.4s ease-in-out infinite 0s;}
.wzr-tr-dot:nth-child(2){animation:wzrPulse 1.4s ease-in-out infinite .22s;}
.wzr-tr-dot:nth-child(3){animation:wzrPulse 1.4s ease-in-out infinite .44s;}
@keyframes wzrPulse{
  0%,100%{opacity:.2;transform:scale(.75)}
  50%{opacity:1;transform:scale(1.3)}
}
.wzr-tr-badge{
  font-size:.65rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;
  color:#2563eb;background:rgba(37,99,235,.08);
  padding:4px 14px;border-radius:99px;border:1px solid rgba(37,99,235,.18);
}
.wzr-tr-title{
  font-family:'Sora',sans-serif;
  font-size:clamp(1.15rem,5vw,1.55rem);font-weight:900;
  color:#0b1437;line-height:1.2;max-width:340px;
}
.wzr-tr-sub{
  font-size:.88rem;color:#475569;line-height:1.65;
  max-width:300px;font-style:italic;
}
.wzr-tr-bar{width:220px;height:3px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin-top:4px;}
.wzr-tr-bar-fill{
  height:100%;width:0%;
  background:linear-gradient(90deg,#2563eb,#0ea5e9);
  border-radius:99px;
  animation:wzrFill 2s ease forwards;
}
@keyframes wzrFill{0%{width:0%}100%{width:100%}}

.wzr-tmpl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
.wzr-tmpl-card{
  border-radius:12px;border:2px solid #e2e8f0;overflow:hidden;
  cursor:pointer;transition:border-color .15s,box-shadow .15s;background:#f8fafc;
  -webkit-tap-highlight-color:transparent;
}
.wzr-tmpl-card:hover{border-color:#93c5fd;}
.wzr-tmpl-card.on{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.15);}
.wzr-tmpl-thumb{width:100%;aspect-ratio:62/82;display:flex;align-items:center;justify-content:center;background:#f1f5f9;}
.wzr-tmpl-thumb svg{width:100%;height:100%;}
.wzr-tmpl-name{font-size:.62rem;font-weight:700;color:#0b1437;padding:5px 6px;text-align:center;background:#fff;border-top:1px solid #e2e8f0;}

.wzr-prev-wrap{
  background:#c5cfe0;border-radius:12px;padding:8px;
  overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;
  margin-bottom:16px;max-height:360px;
}
.wzr-prev-inner{position:relative;overflow:hidden;}
.wzr-prev-inner>div{transform-origin:top left;}

.wzr-accent-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px;}
.wzr-acc-dot{
  width:24px;height:24px;border-radius:50%;border:2px solid #fff;
  box-shadow:0 2px 5px rgba(0,0,0,.15);cursor:pointer;
  transition:transform .15s;-webkit-tap-highlight-color:transparent;
}
.wzr-acc-dot:hover{transform:scale(1.2);}
.wzr-acc-dot.on{outline:3px solid #0f172a;outline-offset:2px;}

.wzr-account-summ{
  background:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;
  padding:14px 16px;margin-bottom:20px;
}
.wzr-account-name{font-size:.95rem;font-weight:800;color:#0b1437;}
.wzr-account-email{font-size:.78rem;color:#0284c7;margin-top:3px;}

.wzr-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:#0f172a;color:#fff;padding:12px 20px;border-radius:12px;
  font-size:.82rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.3);
  z-index:9999;pointer-events:none;animation:toastPop .2s ease;white-space:nowrap;
}
.wzr-toast.ok{background:#064e3b;}
.wzr-toast.err{background:#7f1d1d;}
@keyframes toastPop{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.wzr-success{text-align:center;padding:20px 0 8px;}
.wzr-success-ico{font-size:3.5rem;margin-bottom:14px;display:block;}
.wzr-success-title{font-family:'Sora',sans-serif;font-size:1.5rem;font-weight:900;color:#0b1437;margin-bottom:8px;}
.wzr-success-sub{font-size:.88rem;color:#64748b;line-height:1.6;margin-bottom:24px;}

.wzr-photo-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.wzr-photo-thumb{
  width:64px;height:64px;border-radius:50%;border:2px solid #e2e8f0;
  overflow:hidden;background:#f1f5f9;display:flex;align-items:center;
  justify-content:center;font-size:1.6rem;flex-shrink:0;
}
.wzr-photo-thumb img{width:100%;height:100%;object-fit:cover;object-position:top center;}

.wzr-banner{
  display:flex;align-items:center;gap:10px;
  background:linear-gradient(135deg,rgba(37,99,235,.07),rgba(14,165,233,.04));
  border:1px solid rgba(37,99,235,.14);border-radius:12px;
  padding:12px 14px;margin-bottom:20px;
  font-size:.78rem;font-weight:600;color:#1e3a8a;
}
.wzr-banner-icon{font-size:1.3rem;flex-shrink:0;}

.wzr-err{font-size:.72rem;color:#7f1d1d;font-weight:600;margin-top:4px;}

.wzr-change-email{
  display:inline-flex;align-items:center;gap:4px;
  font-size:.7rem;font-weight:700;color:#2563eb;
  background:none;border:none;cursor:pointer;padding:0;
  text-decoration:underline;text-underline-offset:2px;
  -webkit-tap-highlight-color:transparent;
}
.wzr-change-email:hover{color:#1d4ed8;}

.wzr-exists-banner{
  display:flex;align-items:flex-start;gap:10px;
  background:rgba(4,120,87,.06);border:1px solid rgba(4,120,87,.2);
  border-radius:14px;padding:14px 16px;margin-bottom:20px;
}
.wzr-exists-ico{font-size:1.4rem;flex-shrink:0;}
.wzr-exists-text{font-size:.82rem;font-weight:600;color:#064e3b;line-height:1.5;}
.wzr-exists-text span{display:block;font-size:.72rem;font-weight:500;color:#047857;margin-top:2px;}

.wzr-upload-label{
  display:inline-flex;align-items:center;gap:6px;
  height:40px;padding:0 16px;border-radius:10px;
  border:1.5px solid #e2e8f0;background:#f1f5f9;color:#1e3a8a;
  font-family:'Outfit',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;
  transition:background .12s;-webkit-tap-highlight-color:transparent;
}
.wzr-upload-label:hover{background:#e0e7ff;}

.wzr-section-title{
  font-size:.75rem;font-weight:800;color:#0b1437;
  display:flex;justify-content:space-between;align-items:center;
  margin-bottom:10px;
}
.wzr-mini-add{
  display:inline-flex;align-items:center;gap:4px;
  height:30px;padding:0 12px;border-radius:99px;
  border:1.5px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;
  font-family:'Outfit',sans-serif;font-size:.68rem;font-weight:700;
  cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .12s;
}
.wzr-mini-add:hover{background:#dbeafe;}

.wzr-divider{height:1px;background:#f1f5f9;margin:20px 0;}

.wzr-intro-hero{text-align:center;padding:4px 0 18px;}
.wzr-intro-emoji{font-size:3rem;display:block;margin-bottom:10px;}
.wzr-intro-headline{font-family:'Sora',sans-serif;font-size:clamp(1.3rem,6vw,1.75rem);font-weight:900;color:#0b1437;line-height:1.15;margin-bottom:10px;}
.wzr-intro-sub{font-size:.85rem;color:#64748b;line-height:1.65;margin-bottom:20px;}
.wzr-benefits{display:flex;flex-direction:column;gap:9px;margin-bottom:20px;}
.wzr-benefit-item{display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:12px;padding:11px 13px;border:1px solid #e2e8f0;}
.wzr-benefit-icon{font-size:1.25rem;flex-shrink:0;margin-top:1px;}
.wzr-benefit-title{font-size:.8rem;font-weight:800;color:#0b1437;margin-bottom:2px;}
.wzr-benefit-desc{font-size:.7rem;color:#64748b;line-height:1.5;}
.wzr-intro-social{font-size:.7rem;text-align:center;color:#2563eb;font-weight:700;margin-bottom:18px;padding:8px 12px;background:#eff6ff;border-radius:8px;border:1px solid rgba(37,99,235,.15);}
.wzr-intro-cta{width:100%;padding:15px;background:linear-gradient(135deg,#2563eb,#1e3a8a);color:#fff;border:none;border-radius:14px;font-family:'Sora',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;letter-spacing:-.2px;transition:filter .2s,transform .15s;box-shadow:0 8px 24px rgba(37,99,235,.35);}
.wzr-intro-cta:hover{filter:brightness(1.08);transform:translateY(-1px);}
`;

/* ── Sub-components (defined outside to prevent remounting) ─────────────────── */

function ExpShell({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  return (
    <div className="wzr-shell">
      <div className="wzr-shell-head">
        <span className="wzr-shell-title">{L.role || "New Role"}{L.company ? " @ " + L.company : ""}</span>
        <button className="wzr-rm-btn" onClick={onRemove} aria-label="Remove role">✕</button>
      </div>
      <div className="wzr-g2">
        <div className="wzr-field">
          <label className="wzr-lbl">Role / Position *</label>
          <input className="wzr-inp" value={L.role} placeholder="Senior Engineer"
            onChange={e => upd("role", e.target.value)} />
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">Employment Type</label>
          <select className="wzr-inp" value={L.empType} onChange={e => upd("empType", e.target.value)}>
            {EMP_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="wzr-field wzr-span2">
          <label className="wzr-lbl">Company</label>
          <input className="wzr-inp" value={L.company} placeholder="Company name"
            onChange={e => upd("company", e.target.value)} />
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">Start</label>
          <input className="wzr-inp" value={L.start} placeholder="Jan 2021"
            onChange={e => upd("start", e.target.value)} />
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">End</label>
          <input className="wzr-inp" value={L.current ? "Present" : L.end} placeholder="Present"
            disabled={L.current} onChange={e => upd("end", e.target.value)} />
        </div>
        <div className="wzr-field wzr-span2">
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:".8rem", fontWeight:600, cursor:"pointer", minHeight:40 }}>
            <input type="checkbox" checked={!!L.current}
              onChange={e => { const n = { ...L, current: e.target.checked }; setL(n); onUpdate(n); }} />
            Currently working here
          </label>
        </div>
        <div className="wzr-field wzr-span2">
          <label className="wzr-lbl">Key Achievements (one per line)</label>
          <textarea className="wzr-inp" rows={3} value={L.bullets}
            placeholder={"Led team of 8 engineers on $2M project\nReduced operational costs by 23%"}
            onChange={e => upd("bullets", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function EduShell({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  return (
    <div className="wzr-shell">
      <div className="wzr-shell-head">
        <span className="wzr-shell-title">{L.degree || "New Education"}{L.school ? " — " + L.school : ""}</span>
        <button className="wzr-rm-btn" onClick={onRemove} aria-label="Remove education">✕</button>
      </div>
      <div className="wzr-g2">
        <div className="wzr-field">
          <label className="wzr-lbl">Degree Type</label>
          <select className="wzr-inp" value={L.degType} onChange={e => upd("degType", e.target.value)}>
            {DEG_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">Subject / Major</label>
          <input className="wzr-inp" value={L.degree} placeholder="Computer Science"
            onChange={e => upd("degree", e.target.value)} />
        </div>
        <div className="wzr-field wzr-span2">
          <label className="wzr-lbl">University / School</label>
          <input className="wzr-inp" value={L.school} placeholder="University name"
            onChange={e => upd("school", e.target.value)} />
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">From Year</label>
          <input className="wzr-inp" value={L.start} placeholder="2018"
            onChange={e => upd("start", e.target.value)} />
        </div>
        <div className="wzr-field">
          <label className="wzr-lbl">To Year</label>
          <input className="wzr-inp" value={L.end} placeholder="2022"
            onChange={e => upd("end", e.target.value)} />
        </div>
        <div className="wzr-field wzr-span2">
          <label className="wzr-lbl">GPA / Grade (optional)</label>
          <input className="wzr-inp" value={L.gpa} placeholder="3.8/4.0 or First Class"
            onChange={e => upd("gpa", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function CertShell({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  return (
    <div className="wzr-shell" style={{ marginBottom: 8 }}>
      <div className="wzr-shell-head">
        <span className="wzr-shell-title">{L.name || "New Certification"}</span>
        <button className="wzr-rm-btn" onClick={onRemove} aria-label="Remove cert">✕</button>
      </div>
      <div className="wzr-g2">
        <div className="wzr-field wzr-span2">
          <input className="wzr-inp" value={L.name} placeholder="AWS Solutions Architect"
            onChange={e => upd("name", e.target.value)} />
        </div>
        <div className="wzr-field">
          <input className="wzr-inp" value={L.issuer} placeholder="Issuer (e.g. Amazon)"
            onChange={e => upd("issuer", e.target.value)} />
        </div>
        <div className="wzr-field">
          <input className="wzr-inp" value={L.year} placeholder="Year (e.g. 2026)"
            onChange={e => upd("year", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function AwardShell({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  return (
    <div className="wzr-shell" style={{ marginBottom: 8 }}>
      <div className="wzr-shell-head">
        <span className="wzr-shell-title">{L.title || "New Award"}</span>
        <button className="wzr-rm-btn" onClick={onRemove} aria-label="Remove award">✕</button>
      </div>
      <div className="wzr-g2">
        <div className="wzr-field wzr-span2">
          <input className="wzr-inp" value={L.title} placeholder="Employee of the Year"
            onChange={e => upd("title", e.target.value)} />
        </div>
        <div className="wzr-field">
          <input className="wzr-inp" value={L.issuer} placeholder="Organization"
            onChange={e => upd("issuer", e.target.value)} />
        </div>
        <div className="wzr-field">
          <input className="wzr-inp" value={L.year} placeholder="Year"
            onChange={e => upd("year", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function LangShell({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
      <input className="wzr-inp" value={L.lang} placeholder="e.g. Arabic" style={{ flex:1 }}
        aria-label="Language name" onChange={e => upd("lang", e.target.value)} />
      <select className="wzr-inp" value={L.level} style={{ flex:1 }}
        aria-label="Proficiency level" onChange={e => upd("level", e.target.value)}>
        {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
      </select>
      <button className="wzr-rm-btn" onClick={onRemove} aria-label="Remove language">✕</button>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function CvBuilderClient() {
  const router = useRouter();

  const [step,     setStep]     = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [data,     setData]     = useState(INIT_DATA);
  const [tmpl,     setTmpl]     = useState("modern-stack");
  const [accent,   setAccent]   = useState("#1e3a8a");
  const [fontId,   setFontId]   = useState("outfit");
  const [fontSize, setFontSize] = useState("medium");
  const [paper,    setPaper]    = useState("a4");
  const [zoom,     setZoom]     = useState(0.38);
  const [password, setPassword] = useState("");
  const [pwError,  setPwError]  = useState("");
  const [creating, setCreating] = useState(false);
  const [done,     setDone]     = useState(false);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState({ emoji: "", title: "", sub: "" });
  // null = not checked yet, true = account exists, false = new user
  const [emailExists,   setEmailExists]   = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [editingEmail,  setEditingEmail]  = useState(false);
  const [emailDraft,    setEmailDraft]    = useState("");

  const paperRef     = useRef(null);
  const prevScrollRef = useRef(null);
  const saveTimer    = useRef(null);

  /* Load from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WIZARD_KEY);
      if (!raw) return;
      const sv = JSON.parse(raw);
      if (sv.data)  setData(d => ({ ...d, ...sv.data }));
      if (sv.step != null && sv.step > 0 && sv.step < TOTAL_STEPS - 1) { setStep(sv.step); setShowIntro(false); }
      if (sv.tmpl)  setTmpl(sv.tmpl);
      if (sv.accent) setAccent(sv.accent);
      if (sv.fontId) setFontId(sv.fontId);
    } catch {}
  }, []);

  /* Auto-save to localStorage */
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(WIZARD_KEY, JSON.stringify({ data, step, tmpl, accent, fontId, fontSize, paper }));
      } catch {}
    }, 300);
  }, [data, step, tmpl, accent, fontId, fontSize, paper]);

  /* Helpers */
  const sf         = (k, v) => setData(d => ({ ...d, [k]: v }));
  const addItem    = (sec, tpl) => setData(d => ({ ...d, [sec]: [...(d[sec] || []), { id: uid(), ...tpl }] }));
  const removeItem = (sec, id)  => setData(d => ({ ...d, [sec]: d[sec].filter(x => x.id !== id) }));
  const updateItem = (sec, upd) => setData(d => ({ ...d, [sec]: d[sec].map(x => x.id === upd.id ? upd : x) }));

  const showToast = (msg, type = "inf", dur = 2800) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  };

  /* Zoom fit for preview */
  const fitZoom = useCallback(() => {
    const el = prevScrollRef.current;
    if (!el) return;
    const cw = el.clientWidth - 16;
    setZoom(Math.min(0.9, +(cw / PAPERS[paper].w).toFixed(3)));
  }, [paper]);

  useEffect(() => {
    if (step === 9) setTimeout(fitZoom, 120);
  }, [step, fitZoom]);

  /* CV HTML */
  const cvHtml = useMemo(
    () => buildCvHtml(data, tmpl, accent, fontId, fontSize, paper, FONTS, FSIZES, PAPERS),
    [data, tmpl, accent, fontId, fontSize, paper]
  );

  /* AI helpers */
  const callAI = async (prompt) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cv-ai`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }
    );
    const json = await res.json();
    return json.result || "";
  };

  const aiSummary = async () => {
    setAiLoading(true);
    try {
      const expLine = (data.experience || []).slice(0, 2).map(e => `${e.role} at ${e.company}`).join("; ");
      const text = await callAI(
        `Write a punchy 2-3 sentence professional CV summary for:
Name: ${data.fullName || "Professional"}
Title: ${data.title || data.targetRole || "Professional"}
Level: ${data.careerLevel}
Industry: ${data.targetIndustry || ""}
Goal: ${data.careerGoal || ""}
Experience: ${expLine || ""}
Rules: Start with action word. Quantify impact. No labels. Output summary text only.`
      );
      if (text) { sf("summary", text); showToast("Summary written ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally  { setAiLoading(false); }
  };

  const aiSkills = async () => {
    setAiLoading(true);
    try {
      const expLine = (data.experience || []).slice(0, 3).map(e => `${e.role} at ${e.company}`).join(", ");
      const text = await callAI(
        `Generate 12 ATS-optimized skills for:
Title: ${data.title || data.targetRole || "Professional"}
Industry: ${data.targetIndustry || ""}
Experience: ${expLine || ""}
Rules: One skill per line. Mix technical and soft skills. No bullets or numbers.`
      );
      if (text) { sf("skills", text); showToast("12 skills added ✅", "ok"); }
    } catch { showToast("AI unavailable", "err"); }
    finally  { setAiLoading(false); }
  };

  /* Photo upload */
  const uploadPhoto = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return showToast("Pick an image file", "err");
    if (f.size > 5e6) return showToast("Max 5MB", "err");
    const r = new FileReader();
    r.onload = ev => { sf("photoDataUrl", ev.target.result); showToast("Photo uploaded ✅", "ok"); };
    r.readAsDataURL(f);
  };

  /* Navigation */
  const canNext = () => {
    if (step === 0) return !!(data.fullName?.trim() && data.email?.trim() && /\S+@\S+\.\S+/.test(data.email));
    return true;
  };

  const buildTransitionMsg = (toStep) => {
    const title = data.title || data.targetRole || "";
    const name  = (data.fullName || "").split(" ")[0] || "you";
    const motivate = (() => {
      const t = title.toLowerCase();
      if (t.includes("engineer"))                       return "Engineers who build great things deserve CVs that prove it.";
      if (t.includes("doctor") || t.includes("physic")) return "Healthcare heroes deserve opportunities that match their impact.";
      if (t.includes("teach") || t.includes("profess")) return "Great educators shape futures. Let your CV open bigger doors.";
      if (t.includes("manager") || t.includes("direct"))return "Leaders drive results. Make sure every recruiter sees yours.";
      if (t.includes("develop") || t.includes("program"))return "Your code changes the world. Your CV should too.";
      if (t.includes("design"))                         return "Great design starts with a great first impression.";
      if (t.includes("sales"))                          return "You close deals. Let your CV close the interview.";
      if (t.includes("finance") || t.includes("accoun"))return "Numbers tell stories. Your CV will tell yours powerfully.";
      if (t.includes("market"))                         return "You know how to build brands. Now let's brand YOU.";
      return title
        ? `${title}s who stand out deserve CVs that reflect their true worth.`
        : "You deserve a role that recognises your true potential.";
    })();

    const msgs = {
      1:  { emoji: "✨", title: `Welcome, ${name}!`,             sub: "Let's build your career story, step by step..." },
      2:  { emoji: "💼", title: "Career identity locked in!",    sub: `Tailoring your CV for ${title || "your role"} positions...` },
      3:  { emoji: "🎯", title: "Goals noted!",                  sub: "AIDLA AI is mapping your path to success..." },
      4:  { emoji: "💡", title: "Experience captured!",          sub: motivate },
      5:  { emoji: "🎓", title: "Education added!",              sub: "Your academic background is a real asset — let's show it." },
      6:  { emoji: "🛠", title: "Skills profiled!",              sub: "ATS match score is climbing with every skill you add..." },
      7:  { emoji: "🏆", title: "Credentials verified!",         sub: motivate },
      8:  { emoji: "🌐", title: "Digital presence noted!",       sub: "Recruiters check LinkedIn first. You're covered." },
      9:  { emoji: "👤", title: "Profile complete!",             sub: "AIDLA AI is generating your perfect CV preview..." },
      10: { emoji: "🎨", title: "Your CV looks incredible!",     sub: "One last step — save it and access it anywhere, forever." },
    };
    return msgs[toStep] || { emoji: "⚡", title: "Processing...", sub: "Almost ready..." };
  };

  /* Confirm inline email change in Step 10 */
  const confirmEmailChange = () => {
    const newEmail = emailDraft.trim().toLowerCase();
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) return;
    sf("email", newEmail);
    setEditingEmail(false);
    setEmailExists(null);
    checkEmailExists(newEmail);
  };

  /* Auto-fill empty fields with AI before showing the preview */
  const autoFillBeforePreview = async () => {
    const expLine = (data.experience || []).slice(0, 2).map(e => `${e.role} at ${e.company}`).join("; ");
    const fills = [];

    if (!data.summary?.trim()) {
      fills.push(
        callAI(
          `Write a punchy 2-3 sentence professional CV summary for:
Name: ${data.fullName || "Professional"}
Title: ${data.title || data.targetRole || "Professional"}
Level: ${data.careerLevel}
Industry: ${data.targetIndustry || ""}
Goal: ${data.careerGoal || ""}
Experience: ${expLine || ""}
Rules: Start with action word. Quantify impact. No labels. Output summary text only.`
        ).then(text => { if (text) sf("summary", text); }).catch(() => {})
      );
    }

    if (!data.skills?.trim()) {
      fills.push(
        callAI(
          `Generate 12 ATS-optimized skills for:
Title: ${data.title || data.targetRole || "Professional"}
Industry: ${data.targetIndustry || ""}
Experience: ${(data.experience || []).slice(0, 3).map(e => `${e.role} at ${e.company}`).join(", ") || ""}
Rules: One skill per line. Mix technical and soft skills. No bullets or numbers.`
        ).then(text => { if (text) sf("skills", text); }).catch(() => {})
      );
    }

    (data.experience || []).forEach(exp => {
      if (exp.role && !exp.bullets?.trim()) {
        fills.push(
          callAI(
            `Generate 3 strong achievement bullet points for a CV for someone who worked as:
Role: ${exp.role}
Company: ${exp.company || ""}
Type: ${exp.empType || "Full-time"}
Industry: ${data.targetIndustry || ""}
Rules: Start each with a strong past-tense action verb. Be specific and quantified. No bullet characters. One per line.`
          ).then(text => {
            if (text) updateItem("experience", { ...exp, bullets: text });
          }).catch(() => {})
        );
      }
    });

    if (fills.length > 0) {
      showToast("✨ AI is completing your CV…", "inf", 3500);
      await Promise.allSettled(fills);
    }
  };

  /* Check if email already has an account (same method as signup page) */
  const checkEmailExists = (email) => {
    if (!email) return;
    setEmailChecking(true);
    setEmailExists(null);
    supabase
      .from("users_profiles")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle()
      .then(({ data: row }) => {
        setEmailExists(!!row);
        setEmailChecking(false);
      })
      .catch(() => {
        setEmailExists(false);
        setEmailChecking(false);
      });
  };

  /* For existing users: save wizard data to localStorage then redirect */
  const handleExistingUserDownload = async () => {
    localStorage.setItem("cvmk_v11", JSON.stringify({
      data, tmpl, accent, fontId, fontSize, paper,
    }));
    localStorage.removeItem(WIZARD_KEY);
    // If already logged in go straight to dashboard, else go via login
    const { data: { session } } = await supabase.auth.getSession();
    router.push(session ? "/user/cv-maker" : `/login?redirect=${encodeURIComponent("/user/cv-maker")}`);
  };

  const goNext = () => {
    if (!canNext()) return;
    const nextStep = Math.min(step + 1, TOTAL_STEPS - 1);
    // Fire email check in background as we start the transition from step 0
    if (step === 0) checkEmailExists(data.email);
    // Auto-fill any empty fields with AI before showing the preview
    if (nextStep === 9) autoFillBeforePreview();
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
    if (!password || password.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    setPwError("");
    setCreating(true);
    try {
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email,
        password,
        options: { data: { full_name: data.fullName } },
      });
      if (signUpErr) throw signUpErr;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Sign-up succeeded but no user ID returned.");

      // Generate a unique referral code (same logic as signup page)
      let myReferCode;
      let isUnique = false;
      while (!isUnique) {
        const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
        myReferCode = `AIDLA-${digits}`;
        const { data: existing } = await supabase
          .from("users_profiles")
          .select("user_id")
          .eq("my_refer_code", myReferCode)
          .maybeSingle();
        if (!existing) isUnique = true;
      }

      await supabase.from("users_profiles").insert([{
        user_id: userId,
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        referral_code_used: null,
        my_refer_code: myReferCode,
      }]);

      await supabase.from("user_cvs").insert({
        user_id: userId,
        name: data.fullName ? `${data.fullName}'s CV` : "My CV",
        data,
        template: tmpl,
        accent,
        font_id: fontId,
        font_size: fontSize,
        paper,
      });

      localStorage.removeItem(WIZARD_KEY);
      setDone(true);
      setTimeout(() => router.push("/user/cv-maker"), 2800);
    } catch (err) {
      setPwError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  /* ── Success screen ──────────────────────────────────────────────────────── */
  if (done) {
    return (
      <>
        <style>{CSS}</style>
        <div className="wzr-root">
          <div className="wzr-header">
            <span className="wzr-logo">AIDLA</span>
          </div>
          <div className="wzr-card">
            <div className="wzr-success">
              <span className="wzr-success-ico">🎉</span>
              <div className="wzr-success-title">Account created!</div>
              <p className="wzr-success-sub">
                Check your email to confirm your account.<br />
                Your CV is saved and ready in your dashboard.
              </p>
              <button
                className="wzr-next-btn green"
                style={{ width: "100%", maxWidth: 280, margin: "0 auto" }}
                onClick={() => router.push("/user/cv-maker")}
              >
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
        <div className="wzr-root">
          <header className="wzr-header">
            <span className="wzr-logo">AIDLA</span>
          </header>
          <div className="wzr-card" key="intro">
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
      <div className="wzr-root">

        {/* Header */}
        <header className="wzr-header">
          <span className="wzr-logo">AIDLA</span>
          <span className="wzr-step-label">Step {step + 1} of {TOTAL_STEPS}</span>
        </header>

        {/* Progress */}
        <div
          className="wzr-progress"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS - 1}
          aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          <div className="wzr-prog-bar">
            <div className="wzr-prog-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="wzr-prog-dots" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`wzr-prog-dot${i < step ? " done" : i === step ? " active" : ""}`} />
            ))}
          </div>
        </div>

        {/* Transition screen — shown briefly between steps */}
        {transitioning ? (
          <div className="wzr-card">
            <div className="wzr-transition-screen">
              <span className="wzr-tr-emoji">{transitionMsg.emoji}</span>
              <div className="wzr-tr-dots">
                <span className="wzr-tr-dot" />
                <span className="wzr-tr-dot" />
                <span className="wzr-tr-dot" />
              </div>
              <div className="wzr-tr-badge">✦ AIDLA AI</div>
              <div className="wzr-tr-title">{transitionMsg.title}</div>
              <p className="wzr-tr-sub">{transitionMsg.sub}</p>
              <div className="wzr-tr-bar"><div className="wzr-tr-bar-fill" /></div>
            </div>
          </div>
        ) : (
          /* Step card — key forces fresh animation on step change.
             Steps are called as functions (not JSX components) so React
             never unmounts them mid-type, which would kill cursor focus. */
          <main className="wzr-card" key={step}>
            {step === 0  && StepHook()}
            {step === 1  && StepCareer()}
            {step === 2  && StepGoals()}
            {step === 3  && StepExperience()}
            {step === 4  && StepEducation()}
            {step === 5  && StepSkills()}
            {step === 6  && StepCerts()}
            {step === 7  && StepLinks()}
            {step === 8  && StepPersonal()}
            {step === 9  && StepPreview()}
            {step === 10 && StepAccount()}
          </main>
        )}

        {/* Toast */}
        {toast && <div className={`wzr-toast ${toast.type}`} role="status">{toast.msg}</div>}

      </div>
    </>
  );

  /* ════════════════════════════════════════════════════════════════════════════
     STEP COMPONENTS
     These are functions — not React components — so they capture state by
     closure and never remount unexpectedly (no useState inside these).
  ════════════════════════════════════════════════════════════════════════════ */

  function Nav({ skip = false, nextLabel = "Continue →", nextClass = "", onNext }) {
    return (
      <div className="wzr-nav">
        {step > 0 ? (
          <button className="wzr-back-btn" onClick={goBack}>← Back</button>
        ) : (
          <span />
        )}
        {skip && <button className="wzr-skip-btn" onClick={goNext}>Skip</button>}
        <button
          className={`wzr-next-btn ${nextClass}`}
          onClick={onNext || goNext}
          disabled={!canNext()}
        >
          {nextLabel}
        </button>
      </div>
    );
  }

  /* Intro — Landing screen shown before the wizard starts */
  function StepIntro() {
    return (
      <>
        <div className="wzr-intro-hero">
          <span className="wzr-intro-emoji">📄</span>
          <h1 className="wzr-intro-headline">Stop Getting Rejected.<br/>Start Getting Interviewed.</h1>
          <p className="wzr-intro-sub">
            Are you tired of sending CVs into a void? AIDLA builds you a professional, ATS-optimized CV that makes recruiters stop scrolling — in under 10 minutes. Completely free.
          </p>
        </div>

        <div className="wzr-benefits">
          <div className="wzr-benefit-item">
            <span className="wzr-benefit-icon">🤖</span>
            <div>
              <div className="wzr-benefit-title">AI-Powered ATS Optimization</div>
              <div className="wzr-benefit-desc">Designed to pass automated CV scanners at top companies and reach real hiring managers.</div>
            </div>
          </div>
          <div className="wzr-benefit-item">
            <span className="wzr-benefit-icon">🎨</span>
            <div>
              <div className="wzr-benefit-title">Professional Templates</div>
              <div className="wzr-benefit-desc">17 premium designs. Modern, executive, classic, minimal — chosen by HR professionals.</div>
            </div>
          </div>
          <div className="wzr-benefit-item">
            <span className="wzr-benefit-icon">⚡</span>
            <div>
              <div className="wzr-benefit-title">Ready in Under 10 Minutes</div>
              <div className="wzr-benefit-desc">AI fills your job descriptions, skills summary, and profile automatically. Just answer, we write.</div>
            </div>
          </div>
        </div>

        <div className="wzr-intro-social">✦ Your dream job is looking for someone exactly like you — let's make sure they find you</div>

        <button className="wzr-intro-cta" onClick={() => setShowIntro(false)}>
          Build My Free CV Now →
        </button>
        <p style={{ marginTop: 14, fontSize: ".72rem", color: "#94a3b8", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#2563eb", fontWeight: 700 }}>Log in</a>
        </p>
      </>
    );
  }

  /* Step 0 — Hook */
  function StepHook() {
    return (
      <>
        <span className="wzr-step-icon">✨</span>
        <h1 className="wzr-step-title">Build your professional CV in 5 minutes</h1>
        <p className="wzr-step-sub">
          Used by 50,000+ professionals. 17 premium templates. AI-powered. Free forever.
          Let's start with your name.
        </p>
        <div className="wzr-g2">
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-name">Your Full Name *</label>
            <input
              id="w-name" className="wzr-inp" value={data.fullName}
              placeholder="John Smith" autoComplete="name" autoFocus
              onChange={e => sf("fullName", e.target.value)}
              onKeyDown={e => e.key === "Enter" && goNext()}
            />
          </div>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-email">Email Address *</label>
            <input
              id="w-email" className="wzr-inp" type="email" value={data.email}
              placeholder="you@email.com" autoComplete="email"
              onChange={e => sf("email", e.target.value)}
              onKeyDown={e => e.key === "Enter" && goNext()}
            />
          </div>
        </div>
        <div className="wzr-nav" style={{ marginTop: 28 }}>
          <span />
          <button
            className="wzr-next-btn gold"
            onClick={goNext}
            disabled={!canNext()}
            style={{ flex: 1 }}
          >
            Let's Build My CV →
          </button>
        </div>
      </>
    );
  }

  /* Step 1 — Career Identity */
  function StepCareer() {
    return (
      <>
        <span className="wzr-step-icon">💼</span>
        <h2 className="wzr-step-title">What's your career story?</h2>
        <p className="wzr-step-sub">Help us tailor your CV to stand out in your industry.</p>
        <div className="wzr-g2" style={{ marginBottom: 20 }}>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-title">Current / Target Job Title *</label>
            <input
              id="w-title" className="wzr-inp" value={data.title}
              placeholder="Senior Software Engineer"
              onChange={e => sf("title", e.target.value)}
            />
          </div>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-industry">Target Industry</label>
            <select
              id="w-industry" className="wzr-inp" value={data.targetIndustry}
              onChange={e => sf("targetIndustry", e.target.value)}
            >
              {INDUSTRIES.map(i => <option key={i} value={i}>{i || "— Select Industry —"}</option>)}
            </select>
          </div>
        </div>
        <div className="wzr-lbl" style={{ display:"block", marginBottom:10 }}>Career Level</div>
        <div className="wzr-level-grid">
          {CAREER_LEVELS.map(l => (
            <button
              key={l.id}
              className={`wzr-level-btn${data.careerLevel === l.id ? " on" : ""}`}
              onClick={() => sf("careerLevel", l.id)}
            >
              <span className="lv-icon">{l.icon}</span>
              <span className="lv-title">{l.label}</span>
              <span className="lv-sub">{l.sub}</span>
            </button>
          ))}
        </div>
        <Nav />
      </>
    );
  }

  /* Step 2 — Goals */
  function StepGoals() {
    return (
      <>
        <span className="wzr-step-icon">🎯</span>
        <h2 className="wzr-step-title">Where are you headed?</h2>
        <p className="wzr-step-sub">This shapes your professional summary and helps your CV tell a story.</p>
        <div className="wzr-g2">
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-target">Dream Role / Target Position</label>
            <input
              id="w-target" className="wzr-inp" value={data.targetRole}
              placeholder="Head of Engineering at a tech startup"
              onChange={e => sf("targetRole", e.target.value)}
            />
          </div>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-goal">Career Goal in 1–2 Years</label>
            <textarea
              id="w-goal" className="wzr-inp" rows={3} value={data.careerGoal}
              placeholder="I want to lead a cross-functional team and ship products at scale…"
              onChange={e => sf("careerGoal", e.target.value)}
            />
          </div>
          <div className="wzr-field wzr-span2">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <label className="wzr-lbl" htmlFor="w-summary">Professional Summary</label>
              <button className="wzr-ai-btn" onClick={aiSummary} disabled={aiLoading}>
                {aiLoading ? <><span className="wzr-spinner" /> Writing…</> : "✨ AI Write"}
              </button>
            </div>
            <textarea
              id="w-summary" className="wzr-inp" rows={4} value={data.summary}
              placeholder="A brief summary that grabs the recruiter's attention…"
              onChange={e => sf("summary", e.target.value)}
            />
          </div>
        </div>
        <Nav skip />
      </>
    );
  }

  /* Step 3 — Experience */
  function StepExperience() {
    return (
      <>
        <span className="wzr-step-icon">💼</span>
        <h2 className="wzr-step-title">Work experience</h2>
        <p className="wzr-step-sub">Start with your most recent role. Add as many as you need.</p>
        {!(data.experience || []).length && (
          <div className="wzr-empty">💼 No experience added yet. Tap below to start.</div>
        )}
        {(data.experience || []).map(item => (
          <ExpShell key={item.id} item={item}
            onUpdate={u => updateItem("experience", u)}
            onRemove={() => removeItem("experience", item.id)} />
        ))}
        <button className="wzr-add-btn" onClick={() => addItem("experience", {
          role:"", company:"", empType:"Full-time", industry:"", city:"",
          start:"", end:"", current:false, bullets:"",
        })}>
          + Add Experience
        </button>
        <Nav skip />
      </>
    );
  }

  /* Step 4 — Education */
  function StepEducation() {
    return (
      <>
        <span className="wzr-step-icon">🎓</span>
        <h2 className="wzr-step-title">Your education</h2>
        <p className="wzr-step-sub">Academic background and certifications matter to recruiters.</p>
        {!(data.education || []).length && (
          <div className="wzr-empty">🎓 No education added yet.</div>
        )}
        {(data.education || []).map(item => (
          <EduShell key={item.id} item={item}
            onUpdate={u => updateItem("education", u)}
            onRemove={() => removeItem("education", item.id)} />
        ))}
        <button className="wzr-add-btn" onClick={() => addItem("education", {
          degree:"", degType:"Bachelor's Degree", school:"",
          city:"", start:"", end:"", gpa:"", notes:"",
        })}>
          + Add Education
        </button>
        <Nav skip />
      </>
    );
  }

  /* Step 5 — Skills */
  function StepSkills() {
    const chips = (data.skills || "").split("\n").map(s => s.trim()).filter(Boolean);
    return (
      <>
        <span className="wzr-step-icon">🛠</span>
        <h2 className="wzr-step-title">Your strongest skills</h2>
        <p className="wzr-step-sub">One skill per line. ATS systems read each keyword individually.</p>
        <div className="wzr-banner">
          <span className="wzr-banner-icon">💡</span>
          <span>CVs with 8+ skills are shortlisted 3× more by ATS systems.</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <label className="wzr-lbl" htmlFor="w-skills">Skills (one per line)</label>
          <button className="wzr-ai-btn" onClick={aiSkills} disabled={aiLoading}>
            {aiLoading ? <><span className="wzr-spinner" /> Thinking…</> : "✨ AI Suggest"}
          </button>
        </div>
        <textarea
          id="w-skills" className="wzr-inp" rows={9}
          placeholder={"JavaScript\nProject Management\nPython\nMS Excel\nLeadership\nCommunication"}
          value={data.skills}
          onChange={e => sf("skills", e.target.value)}
        />
        {chips.length > 0 && (
          <div className="wzr-chips" aria-label="Skill chips">
            {chips.map((s, i) => <span key={i} className="wzr-chip">{s}</span>)}
          </div>
        )}
        <Nav skip />
      </>
    );
  }

  /* Step 6 — Certifications & Awards */
  function StepCerts() {
    return (
      <>
        <span className="wzr-step-icon">🏆</span>
        <h2 className="wzr-step-title">Certifications & Awards</h2>
        <p className="wzr-step-sub">These set you apart. Add any credentials or recognition you've earned.</p>

        <div style={{ marginBottom: 20 }}>
          <div className="wzr-section-title">
            <span>Certifications</span>
            <button className="wzr-mini-add"
              onClick={() => addItem("certifications", { name:"", issuer:"", year:"", credId:"", expiry:"" })}>
              + Add
            </button>
          </div>
          {!(data.certifications || []).length && (
            <div className="wzr-empty" style={{ marginBottom:0 }}>✅ No certifications yet.</div>
          )}
          {(data.certifications || []).map(item => (
            <CertShell key={item.id} item={item}
              onUpdate={u => updateItem("certifications", u)}
              onRemove={() => removeItem("certifications", item.id)} />
          ))}
        </div>

        <div className="wzr-divider" />

        <div>
          <div className="wzr-section-title">
            <span>Awards & Recognition</span>
            <button className="wzr-mini-add"
              onClick={() => addItem("awards", { title:"", issuer:"", year:"", desc:"" })}>
              + Add
            </button>
          </div>
          {!(data.awards || []).length && (
            <div className="wzr-empty" style={{ marginBottom:0 }}>🏆 No awards yet.</div>
          )}
          {(data.awards || []).map(item => (
            <AwardShell key={item.id} item={item}
              onUpdate={u => updateItem("awards", u)}
              onRemove={() => removeItem("awards", item.id)} />
          ))}
        </div>

        <Nav skip />
      </>
    );
  }

  /* Step 7 — Links & Languages */
  function StepLinks() {
    return (
      <>
        <span className="wzr-step-icon">🌐</span>
        <h2 className="wzr-step-title">Links & Languages</h2>
        <p className="wzr-step-sub">Your digital presence and language skills open more doors.</p>

        <div className="wzr-g2" style={{ marginBottom: 20 }}>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-linkedin">LinkedIn URL</label>
            <input id="w-linkedin" className="wzr-inp" value={data.linkedin}
              placeholder="linkedin.com/in/yourname"
              onChange={e => sf("linkedin", e.target.value)} />
          </div>
          <div className="wzr-field">
            <label className="wzr-lbl" htmlFor="w-github">GitHub</label>
            <input id="w-github" className="wzr-inp" value={data.github}
              placeholder="github.com/user"
              onChange={e => sf("github", e.target.value)} />
          </div>
          <div className="wzr-field">
            <label className="wzr-lbl" htmlFor="w-website">Portfolio / Website</label>
            <input id="w-website" className="wzr-inp" value={data.website}
              placeholder="yoursite.com"
              onChange={e => sf("website", e.target.value)} />
          </div>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-hobbies">Hobbies & Interests</label>
            <input id="w-hobbies" className="wzr-inp" value={data.hobbies}
              placeholder="Photography, Cricket, Reading, Travel"
              onChange={e => sf("hobbies", e.target.value)} />
          </div>
        </div>

        <div className="wzr-section-title">
          <span>Languages</span>
          <button className="wzr-mini-add"
            onClick={() => addItem("languages", { lang:"", level:"Professional" })}>
            + Add
          </button>
        </div>
        {!(data.languages || []).length && (
          <div className="wzr-empty">🌐 No languages added.</div>
        )}
        {(data.languages || []).map(item => (
          <LangShell key={item.id} item={item}
            onUpdate={u => updateItem("languages", u)}
            onRemove={() => removeItem("languages", item.id)} />
        ))}

        <Nav skip />
      </>
    );
  }

  /* Step 8 — Personal Details */
  function StepPersonal() {
    return (
      <>
        <span className="wzr-step-icon">👤</span>
        <h2 className="wzr-step-title">Personal details</h2>
        <p className="wzr-step-sub">Almost there! A few last touches to complete your CV.</p>

        <div className="wzr-banner">
          <span className="wzr-banner-icon">📸</span>
          <span>CVs with a professional photo get 40% more responses — add yours below!</span>
        </div>

        <div className="wzr-g2" style={{ marginBottom: 20 }}>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl">Phone Number</label>
            <div className="wzr-phone-row">
              <select className="wzr-inp" value={data.phoneCode} aria-label="Country code"
                onChange={e => sf("phoneCode", e.target.value)}>
                {PHONE_CODES.map(p => <option key={p.c} value={p.c}>{p.l} {p.c}</option>)}
              </select>
              <input className="wzr-inp" type="tel" value={data.phoneNum}
                placeholder="50 123 4567"
                onChange={e => sf("phoneNum", e.target.value)} />
            </div>
          </div>
          <div className="wzr-field wzr-span2">
            <label className="wzr-lbl" htmlFor="w-location">Location</label>
            <input id="w-location" className="wzr-inp" value={data.location}
              placeholder="Dubai, UAE"
              onChange={e => sf("location", e.target.value)} />
          </div>
          <div className="wzr-field">
            <label className="wzr-lbl" htmlFor="w-nationality">Nationality</label>
            <input id="w-nationality" className="wzr-inp" value={data.nationality}
              placeholder="e.g. Pakistani"
              onChange={e => sf("nationality", e.target.value)} />
          </div>
          <div className="wzr-field">
            <label className="wzr-lbl" htmlFor="w-dob">Date of Birth</label>
            <input id="w-dob" className="wzr-inp" type="date" value={data.dob}
              onChange={e => sf("dob", e.target.value)} />
          </div>
        </div>

        <div className="wzr-lbl" style={{ display:"block", marginBottom:10 }}>Profile Photo (optional)</div>
        <div className="wzr-photo-row">
          <div className="wzr-photo-thumb">
            {data.photoDataUrl ? <img src={data.photoDataUrl} alt="Profile preview" /> : "👤"}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <label className="wzr-upload-label">
              📷 Upload Photo
              <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display:"none" }} />
            </label>
            {data.photoDataUrl && (
              <button style={{ background:"none", border:"none", color:"#7f1d1d", fontSize:".75rem", fontWeight:700, cursor:"pointer" }}
                onClick={() => sf("photoDataUrl", "")}>
                ✕ Remove
              </button>
            )}
          </div>
        </div>

        <Nav />
      </>
    );
  }

  /* Step 9 — Preview */
  function StepPreview() {
    return (
      <>
        <span className="wzr-step-icon">🎨</span>
        <h2 className="wzr-step-title">Your CV is ready!</h2>
        <p className="wzr-step-sub">Pick a template and colour, then download or save to your account.</p>

        {/* Template picker */}
        <div className="wzr-lbl" style={{ display:"block", marginBottom:10 }}>Choose Template</div>
        <div className="wzr-tmpl-grid">
          {FEATURED_TEMPLATES.map(t => {
            const tobj = PREMIUM_TEMPLATES?.find(x => x.id === t.id);
            return (
              <div
                key={t.id}
                className={`wzr-tmpl-card${tmpl === t.id ? " on" : ""}`}
                onClick={() => setTmpl(t.id)}
                role="button"
                aria-pressed={tmpl === t.id}
                aria-label={`${t.name} template`}
              >
                <div className="wzr-tmpl-thumb">
                  {tobj ? (
                    <svg viewBox="0 0 62 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g dangerouslySetInnerHTML={{ __html: tobj.thumb(accent) }} />
                    </svg>
                  ) : (
                    <span style={{ fontSize:".65rem", color:"#64748b" }}>{t.name}</span>
                  )}
                </div>
                <div className="wzr-tmpl-name">{t.name}</div>
              </div>
            );
          })}
        </div>

        {/* Accent colour */}
        <div className="wzr-lbl" style={{ display:"block", marginBottom:8 }}>Colour</div>
        <div className="wzr-accent-row">
          {ACCENTS.map(c => (
            <button
              key={c}
              className={`wzr-acc-dot${accent === c ? " on" : ""}`}
              style={{ background: c }}
              aria-label={`Accent colour ${c}`}
              aria-pressed={accent === c}
              onClick={() => setAccent(c)}
            />
          ))}
        </div>

        {/* Live CV preview */}
        <div className="wzr-prev-wrap" ref={prevScrollRef} role="region" aria-label="CV preview">
          <div
            className="wzr-prev-inner"
            style={{
              width:  `${PAPERS[paper].w * zoom}px`,
              height: `${PAPERS[paper].h * zoom}px`,
            }}
          >
            <div
              ref={paperRef}
              style={{
                width: `${PAPERS[paper].w}px`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,.12)",
              }}
              dangerouslySetInnerHTML={{ __html: cvHtml }}
            />
          </div>
        </div>

        <div className="wzr-nav" style={{ marginTop: 16 }}>
          <button className="wzr-back-btn" onClick={goBack}>← Back</button>
          {emailChecking ? (
            <button className="wzr-next-btn" disabled>
              <span className="wzr-spinner" /> Checking…
            </button>
          ) : emailExists ? (
            <button className="wzr-next-btn green" onClick={handleExistingUserDownload}>
              Download your CV →
            </button>
          ) : (
            <button className="wzr-next-btn gold" onClick={goNext}>
              Save Forever →
            </button>
          )}
        </div>
      </>
    );
  }

  /* Step 10 — Create Account (new users) or Redirect (existing users) */
  function StepAccount() {
    /* ── Existing user ─────────────────────────────────────────────── */
    if (emailExists) {
      return (
        <>
          <span className="wzr-step-icon">👋</span>
          <h2 className="wzr-step-title">Welcome back!</h2>
          <p className="wzr-step-sub">
            This email already has an AIDLA account. Log in to access your CV dashboard — your new CV is saved and waiting.
          </p>

          <div className="wzr-exists-banner">
            <span className="wzr-exists-ico">✅</span>
            <div className="wzr-exists-text">
              Your CV data is ready.
              <span>Just log in and it will be pre-loaded in your dashboard.</span>
            </div>
          </div>

          <div className="wzr-account-summ">
            <div className="wzr-account-name">{data.fullName}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <div className="wzr-account-email">{data.email}</div>
            </div>
          </div>

          <div className="wzr-nav">
            <button className="wzr-back-btn" onClick={goBack}>← Back</button>
            <button className="wzr-next-btn green" onClick={handleExistingUserDownload}>
              Log in & Access My CV →
            </button>
          </div>
        </>
      );
    }

    /* ── New user ───────────────────────────────────────────────────── */
    return (
      <>
        <span className="wzr-step-icon">🔒</span>
        <h2 className="wzr-step-title">Save your CV forever</h2>
        <p className="wzr-step-sub">
          Create your free account. Your CV is saved instantly — edit, download, and share anytime.
        </p>

        <div className="wzr-account-summ">
          <div className="wzr-account-name">{data.fullName}</div>
          {editingEmail ? (
            <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:8, flexWrap:"wrap" }}>
              <input
                className="wzr-inp"
                type="email"
                value={emailDraft}
                autoFocus
                style={{ flex:"1 1 160px", height:40, fontSize:".82rem" }}
                placeholder="Enter new email"
                onChange={e => setEmailDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") confirmEmailChange();
                  if (e.key === "Escape") setEditingEmail(false);
                }}
              />
              <button
                className="wzr-next-btn green"
                style={{ flex:"none", height:40, padding:"0 16px", fontSize:".8rem", boxShadow:"none" }}
                onClick={confirmEmailChange}
              >
                Save
              </button>
              <button
                className="wzr-back-btn"
                style={{ flex:"none", height:40, padding:"0 12px", fontSize:".8rem" }}
                onClick={() => setEditingEmail(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <div className="wzr-account-email">{data.email}</div>
              <button
                className="wzr-change-email"
                onClick={() => { setEmailDraft(data.email); setEditingEmail(true); }}
                aria-label="Change email address"
              >
                ✏ Change
              </button>
            </div>
          )}
        </div>

        <div className="wzr-field" style={{ marginBottom: 20 }}>
          <label className="wzr-lbl" htmlFor="w-password">Create a Password</label>
          <input
            id="w-password" className="wzr-inp" type="password" value={password}
            placeholder="At least 6 characters" autoComplete="new-password"
            onChange={e => { setPassword(e.target.value); setPwError(""); }}
            onKeyDown={e => e.key === "Enter" && !creating && createAccount()}
          />
          {pwError && <div className="wzr-err">{pwError}</div>}
        </div>

        <div className="wzr-nav">
          <button className="wzr-back-btn" onClick={goBack}>← Back</button>
          <button
            className="wzr-next-btn green"
            onClick={createAccount}
            disabled={creating || !password}
          >
            {creating ? <><span className="wzr-spinner" /> Creating account…</> : "Create Account & Save CV →"}
          </button>
        </div>

        <p style={{ marginTop:16, fontSize:".72rem", color:"#94a3b8", textAlign:"center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color:"#2563eb", fontWeight:700 }}>Log in</a>
        </p>

        <p style={{ marginTop:8, fontSize:".65rem", color:"#cbd5e1", textAlign:"center", lineHeight:1.6 }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
          We never spam or sell your data.
        </p>
      </>
    );
  }
}
