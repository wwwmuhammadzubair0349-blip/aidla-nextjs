"use client";
// app/tools/career/cv-maker/CvMakerClient.jsx

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Link from "next/link";
import Templates from "./cv/Templates";
import Preview   from "./cv/Preview";
import Print     from "./cv/Print";
import { buildCvHtml, PREMIUM_TEMPLATES, PREMIUM_CATS } from "./cv/cvRenderer";
import "./cv-maker.css";

// ─── legacy APP_CSS kept only as a placeholder so the closing backtick below compiles ───
const APP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700;800;900&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');

:root {
  --navy:   #0b1437;
  --royal:  #1a3a8f;
  --sky:    #2563eb;
  --gold:   #d97706;
  --gold-l: #f59e0b;
  --gold-bg:#fef3c7;
  --slate:  #4b5563;
  --ok:     #047857;
  --red:    #b91c1c;
  --border: rgba(37,99,235,.15);
  --sh:     0 1px 6px rgba(11,20,55,.07);
  --sh-md:  0 3px 14px rgba(11,20,55,.10);
  --sh-lg:  0 6px 28px rgba(11,20,55,.14);
  --r:      12px;
  --r-sm:   8px;
  --touch:  44px;
}

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
body {
  font-family: 'Outfit', sans-serif;
  color: var(--navy);
  background: #eef2fb;
  min-height: 100dvh;
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  width: 100%;
  max-width: 100vw;
}
input,textarea,select,button { font-family: inherit; font-size: inherit; color: inherit; }
button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
img    { display: block; max-width: 100%; }

.cv-bg {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(160deg,#eef2fb 0%,#fefdf7 55%,#edf7f4 100%);
}
.cv-bg::before {
  content:'';
  position: absolute;
  width: min(60vw,400px); height: min(60vw,400px);
  background: radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 70%);
  top:-10%; left:-10%;
}
.cvapp {
  position: relative;
  z-index: 1;
  width: 100%;
  overflow-x: hidden;
}

.cv-wrap {
  width: 100%; max-width: 100vw; margin: 0 auto;
  padding: 12px 12px 24px;
  overflow-x: hidden;
}
@media (min-width: 640px) { .cv-wrap { padding: 16px 16px 24px; } }
@media (min-width: 960px) { .cv-wrap { max-width: 1320px; padding: 24px 20px 28px; } }

.cv-toasts {
  position: fixed; top: 10px; right: 10px; z-index: 9999;
  display: flex; flex-direction: column; gap: 6px;
  max-width: min(280px, calc(100vw - 20px));
  pointer-events: none;
}
.cv-toast {
  pointer-events: all;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 10px;
  font-size: .8rem; font-weight: 700;
  box-shadow: var(--sh-lg);
  animation: toastIn .2s ease;
}
.cv-toast button {
  background: none; border: none; margin-left: auto;
  padding: 0 2px; font-size: 1rem; font-weight: 900; opacity: .65;
  min-width: var(--touch); min-height: var(--touch);
  display: flex; align-items: center; justify-content: center;
}
.t-ok  { background:#ecfdf5; border:1px solid #6ee7b7; color:#064e3b; }
.t-err { background:#fef2f2; border:1px solid #fca5a5; color:#7f1d1d; }
.t-inf { background:#eff6ff; border:1px solid #93c5fd; color:#1e3a8a; }
@keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:none} }

.cv-hero {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 10px;
  margin-bottom: 12px; flex-wrap: wrap;
  width: 100%; overflow: hidden;
}
.cv-hero-l { flex: 1; min-width: 0; }
.cv-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: linear-gradient(135deg,var(--gold),var(--gold-l));
  color: #1c1917;
  padding: 3px 10px; border-radius: 99px;
  font-size: .58rem; font-weight: 800;
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 6px;
  box-shadow: 0 2px 8px rgba(217,119,6,.25);
}
.cv-hero h1 {
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.2rem,5.5vw,2.3rem);
  font-weight: 900; line-height: 1.1; margin-bottom: 4px;
  word-break: break-word;
}
.cv-grad {
  background: linear-gradient(135deg,#1a3a8f,#2563eb 60%,#0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cv-hero-sub { color: var(--slate); font-size: clamp(.74rem,2.2vw,.86rem); line-height: 1.6; margin-bottom: 8px; }
.cv-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.cv-pill {
  background: rgba(37,99,235,.07); border: 1px solid rgba(37,99,235,.18);
  border-radius: 99px; padding: 2px 7px;
  font-size: .58rem; font-weight: 700; color: #1e3a8a;
}

.cv-ats-wrap { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.cv-ats-ring {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background .5s;
  box-shadow: 0 2px 10px rgba(217,119,6,.18);
}
.cv-ats-inner {
  width: 56px; height: 56px; border-radius: 50%;
  background: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 5px rgba(0,0,0,.07);
}
.cv-ats-score { font-family:'Sora',sans-serif; font-size: 1.25rem; font-weight: 900; line-height: 1; }
.cv-ats-lbl { font-size: .44rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .06em; }
.cv-ats-btn {
  background: none; border: none; font-size: .65rem; font-weight: 700; color: var(--sky);
  min-height: var(--touch); display: flex; align-items: center;
}
.cv-ats-panel {
  display: none;
  grid-template-columns: repeat(auto-fill, minmax(180px,1fr));
  gap: 4px; margin-bottom: 10px;
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 10px;
}
.cv-ats-panel.open { display: grid; }
.cv-ck { display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:7px;font-size:.68rem;font-weight:600; }
.cv-ck.ok   { background:rgba(4,120,87,.08); color:#064e3b; }
.cv-ck.fail { background:rgba(185,28,28,.07); color:#7f1d1d; }

.cv-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 10px; flex-wrap: wrap; width: 100%;
}
.cv-tbr { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

.cv-main-tabs {
  display: flex; gap: 0;
  border-radius: var(--r); overflow: hidden;
  border: 1.5px solid var(--border);
  background: rgba(255,255,255,.9);
  margin-bottom: 12px; width: 100%;
  position: sticky; top: 0; z-index: 50;
  box-shadow: var(--sh);
}
.cv-main-tab {
  flex: 1; height: 46px;
  border: none; border-right: 1px solid var(--border);
  background: transparent;
  font-size: clamp(.62rem,2.5vw,.76rem);
  font-weight: 700; color: var(--slate);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; cursor: pointer; transition: background .15s,color .15s; padding: 0 4px;
}
.cv-main-tab:last-child { border-right: none; }
.cv-main-tab .tab-ico { font-size: 1rem; }
.cv-main-tab.on {
  background: linear-gradient(135deg,var(--gold),var(--gold-l));
  color: #1c1917;
  box-shadow: inset 0 -2px 0 rgba(0,0,0,.1);
}

.cv-panel { display: none; width: 100%; }
.cv-panel.on { display: block; }

.cv-ftabs {
  display: flex; gap: 2px; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  margin-bottom: 10px;
  background: rgba(255,255,255,.85);
  border-radius: 10px; padding: 4px;
  border: 1px solid var(--border); width: 100%;
}
.cv-ftabs::-webkit-scrollbar { display: none; }
.cv-ftab {
  flex: 1; min-width: 44px; height: 46px; padding: 0 4px;
  border-radius: 8px; border: none; background: transparent;
  font-size: clamp(.52rem,1.8vw,.64rem);
  font-weight: 700; color: var(--slate); transition: .12s;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; white-space: nowrap; flex-shrink: 0; cursor: pointer;
}
.cv-ftab .ico { font-size: .9rem; }
.cv-ftab.on { background: #fff; color: var(--navy); box-shadow: 0 2px 7px rgba(11,20,55,.09); }
.cv-tpanel { display: none; }
.cv-tpanel.on { display: block; }

.cv-card {
  background: rgba(255,255,255,.94);
  border-radius: var(--r); border: 1px solid var(--border);
  box-shadow: var(--sh); padding: 13px; margin-bottom: 10px;
  width: 100%; overflow: hidden; word-break: break-word;
}
@media (min-width: 640px) { .cv-card { padding: 16px; } }
.cv-card-h { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap; }
.cv-card-t { font-family:'Sora',sans-serif;font-size:clamp(.8rem,2.8vw,.88rem);font-weight:700;color:var(--navy);margin:0; }

.cv-g2 { display:grid;grid-template-columns:1fr;gap:8px; }
@media (min-width:380px) { .cv-g2 { grid-template-columns:repeat(2,1fr); } }
.cv-span2 { grid-column:1/-1; }

.cv-field { display:flex;flex-direction:column;gap:4px;min-width:0; }
.cv-lbl { font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#374151; }
.cv-inp {
  width:100%;min-width:0;
  padding:0 11px;height:var(--touch);
  border-radius:var(--r-sm);
  border:1.5px solid rgba(37,99,235,.2);
  background:#fff;font-size:.85rem;font-weight:500;
  outline:none;transition:border-color .15s,box-shadow .15s;color:var(--navy);
  -webkit-appearance:none;appearance:none;max-width:100%;
}
.cv-inp:focus { border-color:var(--gold);box-shadow:0 0 0 3px rgba(217,119,6,.15); }
.cv-inp:focus-visible,button:focus-visible,[tabindex]:focus-visible { outline:3px solid var(--gold);outline-offset:2px; }
select.cv-inp {
  cursor:pointer;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234b5563' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;
}
textarea.cv-inp { height:auto;min-height:80px;padding:10px 11px;resize:vertical;line-height:1.6; }

.cv-phone-row { display:grid;grid-template-columns:95px 1fr;gap:6px; }

.cv-photo-row {
  display:flex;align-items:center;gap:11px;margin-top:10px;padding:11px;
  background:#f8fafc;border-radius:10px;border:1px solid var(--border);flex-wrap:wrap;
}
.cv-photo-thumb {
  width:52px;height:52px;border-radius:50%;border:2px solid var(--border);
  overflow:hidden;background:#f1f5f9;
  display:flex;align-items:center;justify-content:center;
  font-size:1.3rem;flex-shrink:0;
}
.cv-photo-thumb img { width:100%;height:100%;object-fit:cover;object-position:top center; }
.cv-photo-btns { display:flex;flex-wrap:wrap;gap:6px;align-items:center; }

.cv-chips { display:flex;flex-wrap:wrap;gap:4px;margin-top:8px; }
.cv-chip {
  padding:2px 8px;border-radius:99px;
  background:rgba(37,99,235,.07);border:1px solid rgba(37,99,235,.16);
  font-size:.62rem;font-weight:700;color:#1e3a8a;
}

.cv-shell {
  margin-top:8px;padding:12px;
  background:#f8fafc;border-radius:10px;border:1px solid var(--border);
  transition:box-shadow .15s;width:100%;overflow:hidden;word-break:break-word;
}
.cv-shell:focus-within { box-shadow:0 0 0 2px rgba(217,119,6,.2); }
.cv-shell-h { display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px; }
.cv-shell-t { font-size:.72rem;font-weight:700;color:var(--slate);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0; }
.cv-empty {
  display:flex;align-items:center;gap:8px;padding:13px;color:var(--slate);
  font-size:.76rem;font-weight:600;border-radius:10px;background:#f8fafc;
  border:1.5px dashed rgba(37,99,235,.18);
}

.cv-btn {
  display:inline-flex;align-items:center;justify-content:center;gap:5px;
  min-height:var(--touch);padding:0 16px;
  border-radius:99px;border:none;font-size:.8rem;font-weight:800;
  cursor:pointer;transition:transform .12s,box-shadow .12s,background .1s;
  white-space:nowrap;-webkit-tap-highlight-color:transparent;text-decoration:none;
}
.cv-btn:disabled { opacity:.4;cursor:not-allowed;transform:none!important; }
.cv-btn-primary {
  background:linear-gradient(135deg,var(--gold),var(--gold-l));
  color:#1c1917;box-shadow:0 3px 12px rgba(217,119,6,.3);
}
.cv-btn-primary:hover:not(:disabled) { transform:scale(1.03);box-shadow:0 5px 16px rgba(217,119,6,.4); }
.cv-btn-ghost {
  background:rgba(255,255,255,.92);border:1.5px solid var(--border);color:#1e3a8a;
}
.cv-btn-ghost:hover:not(:disabled) { background:rgba(37,99,235,.06); }
.cv-btn-danger {
  background:rgba(185,28,28,.07);border:1px solid rgba(185,28,28,.22);color:#7f1d1d;
  font-size:.72rem;padding:0 11px;min-height:36px;
}
.cv-btn-sm { font-size:.75rem;padding:0 12px;min-height:36px; }
.cv-btn-add {
  display:inline-flex;align-items:center;gap:4px;
  min-height:36px;padding:0 12px;border-radius:99px;border:none;
  background:linear-gradient(135deg,var(--gold),var(--gold-l));
  color:#1c1917;font-size:.68rem;font-weight:800;
  cursor:pointer;box-shadow:0 2px 7px rgba(217,119,6,.22);
  transition:transform .12s;-webkit-tap-highlight-color:transparent;
}
.cv-btn-add:hover { transform:scale(1.04); }
.cv-btn-rm {
  display:inline-flex;align-items:center;justify-content:center;
  min-height:32px;min-width:32px;padding:0 7px;
  background:#fff;border:1px solid rgba(185,28,28,.25);color:#7f1d1d;
  border-radius:7px;font-size:.67rem;font-weight:700;
  cursor:pointer;flex-shrink:0;transition:background .1s;
  -webkit-tap-highlight-color:transparent;
}
.cv-btn-rm:hover { background:rgba(185,28,28,.07); }
.cv-ai-btn {
  display:inline-flex;align-items:center;gap:4px;
  min-height:32px;padding:0 10px;border-radius:99px;
  border:1.5px solid rgba(217,119,6,.35);
  background:rgba(217,119,6,.07);color:#78350f;
  font-size:.68rem;font-weight:700;cursor:pointer;transition:background .12s;
  white-space:nowrap;-webkit-tap-highlight-color:transparent;
}
.cv-ai-btn:hover:not(:disabled) { background:rgba(217,119,6,.14); }
.cv-ai-btn:disabled { opacity:.4;cursor:not-allowed; }
.cv-file-btn { cursor:pointer; }
.cv-file-btn input[type="file"] { display:none; }
.cv-spinner {
  width:11px;height:11px;
  border:2px solid currentColor;border-top-color:transparent;
  border-radius:50%;animation:spin .6s linear infinite;
  display:inline-block;flex-shrink:0;
}
@keyframes spin { to{transform:rotate(360deg)} }

@media (min-width:960px) {
  .cv-main-tabs { display:none; }
  .cv-panel { display:block!important; }
  .cv-grid { display:grid;grid-template-columns:440px 1fr;gap:14px;align-items:start; }
  .cv-col-prev { min-width: 500px; }
  .cv-desktop-only { display:block!important; }
}
@media (max-width:959px) {
  .cv-grid { display:block; }
  .cv-desktop-only { display:none!important; }
}

.cv-modal-backdrop {
  position:fixed;inset:0;z-index:999;
  background:rgba(0,0,0,.48);
  display:flex;align-items:flex-end;padding:0;
}
@media (min-width:560px) { .cv-modal-backdrop { align-items:center;padding:20px; } }
.cv-modal {
  background:#fff;border-radius:16px 16px 0 0;
  padding:20px 16px;width:100%;
  animation:slideUp .22s ease;
  box-shadow:0 -6px 28px rgba(0,0,0,.18);
}
@media (min-width:560px) { .cv-modal { border-radius:16px;max-width:420px;margin:0 auto;animation:fadeScl .18s ease; } }
@keyframes slideUp { from{transform:translateY(100%)} to{transform:none} }
@keyframes fadeScl { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:none} }
`;

const STORAGE_KEY = "cvmk_v12_apex";

const FONTS = [
  { id: "outfit",    l: "Outfit",    s: "'Outfit',sans-serif" },
  { id: "sora",      l: "Sora",      s: "'Sora',sans-serif" },
  { id: "jakarta",   l: "Jakarta",   s: "'Plus Jakarta Sans',sans-serif" },
  { id: "dmsans",    l: "DM Sans",   s: "'DM Sans','Inter',sans-serif" },
  { id: "inter",     l: "Inter",     s: "'Inter','Outfit',sans-serif" },
  { id: "lora",      l: "Lora",      s: "'Lora','Georgia',serif" },
  { id: "garamond",  l: "Garamond",  s: "'Cormorant Garamond','Georgia',serif" },
  { id: "playfair",  l: "Playfair",  s: "'Playfair Display','Georgia',serif" },
  { id: "sourceserif", l: "Source Serif", s: "'Source Serif 4','Georgia',serif" },
];

const FSIZES = { small: "10.5px", medium: "12px", large: "13.5px" };

const PAPERS = {
  a4:     { w: 794,  h: 1123, l: "A4" },
  letter: { w: 816,  h: 1056, l: "Letter" },
  legal:  { w: 816,  h: 1344, l: "Legal" },
};

const ACCENTS = [
  "#1e3a8a","#0f766e","#7c2d12","#4c1d95",
  "#065f46","#1f2937","#be123c","#0369a1",
  "#92400e","#166534","#0c4a6e","#3b0764",
];

const COLOR_NAMES = {
  "#1e3a8a": "Navy Blue",   "#0f766e": "Teal",       "#7c2d12": "Rust",
  "#4c1d95": "Purple",      "#065f46": "Forest Green","#1f2937": "Charcoal",
  "#be123c": "Crimson",     "#0369a1": "Ocean Blue",  "#92400e": "Amber",
  "#166534": "Dark Green",  "#0c4a6e": "Sapphire",    "#3b0764": "Violet",
};

const TEMPLATES = PREMIUM_TEMPLATES;
const CATS      = PREMIUM_CATS;

const LANG_LEVELS  = ["Native","Fluent","Professional","Conversational","Elementary"];
const REL_TYPES    = ["Manager","Supervisor","Colleague","Professor","Client","Mentor","HR"];
const EMP_TYPES    = ["Full-time","Part-time","Contract","Freelance","Internship","Apprenticeship","Temporary"];
const DEG_TYPES    = ["High School","Diploma","Associate Degree","Bachelor's Degree","Master's Degree","PhD","MBA","Professional Certification","Short Course","Online Certificate"];
const PROJ_STATUS  = ["Completed","In Progress","Open Source","Personal","Academic","Client Work"];

const PHONE_CODES = [
  {c:"+971",l:"🇦🇪 UAE"},{c:"+966",l:"🇸🇦 KSA"},{c:"+974",l:"🇶🇦 Qatar"},
  {c:"+973",l:"🇧🇭 Bahrain"},{c:"+968",l:"🇴🇲 Oman"},{c:"+965",l:"🇰🇼 Kuwait"},
  {c:"+44",l:"🇬🇧 UK"},{c:"+1",l:"🇺🇸 USA"},{c:"+91",l:"🇮🇳 India"},
  {c:"+92",l:"🇵🇰 Pakistan"},{c:"+20",l:"🇪🇬 Egypt"},{c:"+880",l:"🇧🇩 Bangladesh"},
  {c:"+94",l:"🇱🇰 Sri Lanka"},{c:"+63",l:"🇵🇭 Philippines"},{c:"+60",l:"🇲🇾 Malaysia"},
  {c:"+62",l:"🇮🇩 Indonesia"},{c:"+49",l:"🇩🇪 Germany"},{c:"+33",l:"🇫🇷 France"},
  {c:"+39",l:"🇮🇹 Italy"},{c:"+34",l:"🇪🇸 Spain"},{c:"+7",l:"🇷🇺 Russia"},
  {c:"+86",l:"🇨🇳 China"},{c:"+81",l:"🇯🇵 Japan"},{c:"+82",l:"🇰🇷 Korea"},
  {c:"+55",l:"🇧🇷 Brazil"},{c:"+27",l:"🇿🇦 S.Africa"},{c:"+234",l:"🇳🇬 Nigeria"},
  {c:"+254",l:"🇰🇪 Kenya"},{c:"+212",l:"🇲🇦 Morocco"},{c:"+213",l:"🇩🇿 Algeria"},
];

const NATIONALITIES = [
  "Afghan","Albanian","Algerian","American","Argentine","Australian","Austrian",
  "Bahraini","Bangladeshi","Belgian","Brazilian","British","Bulgarian",
  "Cameroonian","Canadian","Chilean","Chinese","Colombian","Croatian","Czech",
  "Danish","Dutch","Egyptian","Emirati","Ethiopian","Filipino",
  "Finnish","French","German","Ghanaian","Greek","Hungarian",
  "Indian","Indonesian","Iranian","Iraqi","Irish","Italian","Ivorian",
  "Japanese","Jordanian","Kenyan","Korean","Kuwaiti",
  "Lebanese","Libyan","Malaysian","Moroccan","Mexican",
  "Nepali","New Zealander","Nigerian","Norwegian","Omani","Pakistani",
  "Palestinian","Polish","Portuguese","Qatari","Romanian","Russian",
  "Saudi","Serbian","Singaporean","South African","Spanish","Sri Lankan",
  "Sudanese","Swedish","Swiss","Syrian","Taiwanese","Thai","Tunisian",
  "Turkish","Ugandan","Ukrainian","Uzbek","Venezuelan","Vietnamese","Yemeni","Zimbabwean",
];

const MARITAL_STATUS = ["","Single","Married","Divorced","Widowed","Prefer not to say"];
const GENDERS        = ["","Male","Female","Non-binary","Other","Prefer not to say"];
const NOTICE_PERIODS = ["","Immediately Available","1 Week","2 Weeks","1 Month","2 Months","3 Months","6 Months"];
const DRIVING_LIC    = ["","UAE Light Vehicle","UAE Heavy Vehicle","Saudi Arabia","Kuwait","Qatar","Bahrain","Oman","UK Full","US Driver's License","European","International","Class A","Class B","Class C"];

const uid   = () => Math.random().toString(36).slice(2, 9);
const lines = v  => String(v || "").split("\n").map(s => s.trim()).filter(Boolean);

const INIT_DATA = () => ({
  fullName:"", title:"", email:"", phoneCode:"+971", phoneNum:"",
  location:"", linkedin:"", github:"", website:"",
  nationality:"", dob:"", drivingLicense:"", marital:"", gender:"", notice:"",
  summary:"", skills:"", hobbies:"", photoDataUrl:"", qrDataUrl:"",
  compass:"",
  kpis:[],
  caseStudies:[],
  experience:[], education:[], projects:[], certifications:[],
  languages:[], awards:[], publications:[], volunteer:[], references:[],
});

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="cv-toasts" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`cv-toast t-${t.type}`} role="alert">
          <span>{t.msg}</span>
          <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">×</button>
        </div>
      ))}
    </div>
  );
}

function Field({ label, id, children, span2 }) {
  return (
    <div className={`cv-field${span2 ? " cv-span2" : ""}`}>
      <label className="cv-lbl" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function ExpItem({ item, onUpdate, onRemove }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  const bid = `exp-${L.id}`;

  useEffect(() => { setL({ ...item }); }, [item.bullets]);

  return (
    <div className="cv-shell">
      <div className="cv-shell-h">
        <span className="cv-shell-t">{L.role || "New Role"}{L.company ? " @ " + L.company : ""}</span>
        <button className="cv-btn-rm" onClick={onRemove} aria-label={`Remove ${L.role || "role"}`}>✕</button>
      </div>
      <div className="cv-g2">
        <Field label="Role / Position *" id={`${bid}-role`}>
          <input id={`${bid}-role`} className="cv-inp" value={L.role} placeholder="Senior Engineer"
            onChange={e => upd("role", e.target.value)} />
        </Field>
        <Field label="Employment Type" id={`${bid}-emptype`}>
          <select id={`${bid}-emptype`} className="cv-inp" value={L.empType}
            onChange={e => upd("empType", e.target.value)}>
            {EMP_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Company" id={`${bid}-company`} span2>
          <input id={`${bid}-company`} className="cv-inp" value={L.company} placeholder="Company name"
            onChange={e => upd("company", e.target.value)} />
        </Field>
        <Field label="City" id={`${bid}-city`}>
          <input id={`${bid}-city`} className="cv-inp" value={L.city} placeholder="Dubai, UAE"
            onChange={e => upd("city", e.target.value)} />
        </Field>
        <Field label="Industry" id={`${bid}-industry`}>
          <select id={`${bid}-industry`} className="cv-inp" value={L.industry || ""}
            onChange={e => upd("industry", e.target.value)}>
            {["","Construction","Engineering","IT & Software","Finance","Healthcare","Education",
              "Hospitality","Marketing","Legal","Manufacturing","Oil & Gas","Real Estate",
              "Retail","Telecom","Transport","Other"].map(o =>
              <option key={o} value={o}>{o || "— Select —"}</option>)}
          </select>
        </Field>
        <Field label="Start Date" id={`${bid}-start`}>
          <input id={`${bid}-start`} className="cv-inp" value={L.start} placeholder="Jan 2022"
            onChange={e => upd("start", e.target.value)} />
        </Field>
        <Field label="End Date" id={`${bid}-end`}>
          <input id={`${bid}-end`} className="cv-inp" value={L.current ? "Present" : L.end}
            placeholder="Present" disabled={L.current}
            onChange={e => upd("end", e.target.value)} />
        </Field>
        <div className="cv-field cv-span2">
          <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:".8rem", fontWeight:600, cursor:"pointer", minHeight:"44px" }}>
            <input type="checkbox" checked={!!L.current}
              onChange={e => { const n = { ...L, current: e.target.checked }; setL(n); onUpdate(n); }} />
            {" "}Currently working here
          </label>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, flexWrap:"wrap", gap:6 }}>
          <label className="cv-lbl" htmlFor={`${bid}-bullets`}>Key Achievements (one per line)</label>
          <button className="cv-ai-btn" onClick={() => onUpdate({ ...L, _aiBullets: true })}>✨ AI Write</button>
        </div>
        <textarea id={`${bid}-bullets`} className="cv-inp" rows={4}
          placeholder={"Led a team of 8 engineers delivering $2M project on time\nReduced operational costs by 23% through automation"}
          value={L.bullets} onChange={e => upd("bullets", e.target.value)} />
      </div>
    </div>
  );
}

function EduItem({ item, onUpdate, onRemove, onAiNotes }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  const bid = `edu-${L.id}`;

  useEffect(() => { setL({ ...item }); }, [item.notes]);

  return (
    <div className="cv-shell">
      <div className="cv-shell-h">
        <span className="cv-shell-t">{L.degree || "New Education"}{L.school ? " — " + L.school : ""}</span>
        <button className="cv-btn-rm" onClick={onRemove} aria-label={`Remove ${L.degree || "education"}`}>✕</button>
      </div>
      <div className="cv-g2">
        <Field label="Degree Type" id={`${bid}-degtype`}>
          <select id={`${bid}-degtype`} className="cv-inp" value={L.degType}
            onChange={e => upd("degType", e.target.value)}>
            {DEG_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Subject / Major *" id={`${bid}-degree`}>
          <input id={`${bid}-degree`} className="cv-inp" value={L.degree} placeholder="Mechanical Engineering"
            onChange={e => upd("degree", e.target.value)} />
        </Field>
        <Field label="University / School" id={`${bid}-school`} span2>
          <input id={`${bid}-school`} className="cv-inp" value={L.school} placeholder="University name"
            onChange={e => upd("school", e.target.value)} />
        </Field>
        <Field label="City" id={`${bid}-city`}>
          <input id={`${bid}-city`} className="cv-inp" value={L.city} placeholder="London, UK"
            onChange={e => upd("city", e.target.value)} />
        </Field>
        <Field label="GPA / Grade" id={`${bid}-gpa`}>
          <input id={`${bid}-gpa`} className="cv-inp" value={L.gpa} placeholder="3.8/4.0 or First Class"
            onChange={e => upd("gpa", e.target.value)} />
        </Field>
        <Field label="Start Year" id={`${bid}-start`}>
          <input id={`${bid}-start`} className="cv-inp" value={L.start} placeholder="2018"
            onChange={e => upd("start", e.target.value)} />
        </Field>
        <Field label="End Year" id={`${bid}-end`}>
          <input id={`${bid}-end`} className="cv-inp" value={L.end} placeholder="2022"
            onChange={e => upd("end", e.target.value)} />
        </Field>
      </div>
      <div className="cv-field" style={{ marginTop: 8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
          <label className="cv-lbl" htmlFor={`${bid}-notes`}>Achievements / Notes</label>
          <button className="cv-ai-btn" onClick={() => onAiNotes(L)}>✨ AI Write</button>
        </div>
        <textarea id={`${bid}-notes`} className="cv-inp" rows={2}
          placeholder="Dean's List · Thesis: Renewable Energy Systems"
          value={L.notes} onChange={e => upd("notes", e.target.value)} />
      </div>
    </div>
  );
}

function SItem({ item, onUpdate, onRemove, onAiDesc, onAiNotes, children }) {
  const [L, setL] = useState({ ...item });
  const upd = (k, v) => { const n = { ...L, [k]: v }; setL(n); onUpdate(n); };
  useEffect(() => { setL({ ...item }); }, [item.bullets, item.notes]);
  return children(L, upd, onRemove, onAiDesc, onAiNotes);
}

export default function CvMakerClient({
  answerBlocks, trustStats, templates, features, audiences, regions, helpfulContent
}) {
  const [data,      setData]      = useState(INIT_DATA);
  const [tmpl,      setTmpl]      = useState("modern-stack");
  const [accent,    setAccent]    = useState("#1e3a8a");
  const [fontId,    setFontId]    = useState("outfit");
  const [fontSize,  setFontSize]  = useState("medium");
  const [paper,     setPaper]     = useState("a4");
  const [activeTab, setActiveTab] = useState("personal");
  const [mobileTab, setMobileTab] = useState("edit");   // "edit" | "preview" | "templates"
  const [previewTab,setPreviewTab]= useState("preview"); // "preview" | "templates"
  const [activeCat, setActiveCat] = useState("All");
  const [atsOpen,   setAtsOpen]   = useState(false);
  const [toasts,    setToasts]    = useState([]);
  const [aiLoading, setAiLoading] = useState({});
  const [aiCmd,           setAiCmd]          = useState("");
  const [aiCmdLoading,    setAiCmdLoading]    = useState(false);
  const [jobPosting,      setJobPosting]      = useState("");
  const [jobTailorOpen,   setJobTailorOpen]   = useState(false);
  const [jobTailorLoading,setJobTailorLoading]= useState(false);
  const [tailorDiff,      setTailorDiff]      = useState(null);
  const [showReset,       setShowReset]       = useState(false);
  const [aiOverlayMsg,    setAiOverlayMsg]    = useState("");
  const [phIdx,           setPhIdx]           = useState(0);
  const [progressIdx,     setProgressIdx]     = useState(0);
  const [flashSignal,     setFlashSignal]     = useState(0);

  const aiRunning = aiCmdLoading || jobTailorLoading || !!aiOverlayMsg;
  const flashPreview = useCallback(() => setFlashSignal(s => s + 1), []);

  const AI_PLACEHOLDERS = [
    'e.g. "Tailor for Electrical Maintenance Engineer jobs in New Zealand"',
    'e.g. "Optimize my whole CV for ATS"',
    'e.g. "Rewrite my experience in a natural human tone"',
    'e.g. "Add solar energy keywords throughout"',
    'e.g. "Make my summary stronger and more specific"',
  ];
  const AI_PROGRESS = [
    "Analyzing your CV…",
    "Writing content…",
    "Optimizing for ATS…",
    "Polishing wording…",
  ];

  // Cycle the AI command placeholder every 3s while the input is empty and idle
  useEffect(() => {
    if (aiCmd || aiCmdLoading) return;
    const t = setInterval(() => setPhIdx(i => (i + 1) % AI_PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, [aiCmd, aiCmdLoading]);

  // Cycle the overlay progress message every 2s while AI runs
  useEffect(() => {
    if (!aiOverlayMsg) { setProgressIdx(0); return; }
    const t = setInterval(() => setProgressIdx(i => (i + 1) % AI_PROGRESS.length), 2000);
    return () => clearInterval(t);
  }, [aiOverlayMsg]);

  // Lightweight ripple on primary button clicks
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e) => {
      const btn = e.target.closest(".cv-btn-primary, .cv-btn-add");
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement("span");
      r.className = "cv-ripple";
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size / 2}px`;
      r.style.top  = `${e.clientY - rect.top  - size / 2}px`;
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const paperRef      = useRef(null);
  const saveTimer     = useRef(null);

  const toast = useCallback((msg, type = "inf", dur = 3200) => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), dur);
  }, []);
  const dismissToast = id => setToasts(t => t.filter(x => x.id !== id));

  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      // Migrate from legacy storage keys (cvmk_v1 through cvmk_v11, with or without _apex suffix)
      if (!raw) {
        const suffixes = ["_apex", ""];
        outer: for (let v = 11; v >= 1; v--) {
          for (const suf of suffixes) {
            const legacy = localStorage.getItem(`cvmk_v${v}${suf}`);
            if (legacy) { raw = legacy; break outer; }
          }
        }
      }
      if (!raw) return;
      const sv = JSON.parse(raw);
      if (sv.data)     setData(d => ({ ...d, ...sv.data }));
      if (sv.tmpl)     setTmpl(sv.tmpl);
      if (sv.accent)   setAccent(sv.accent);
      if (sv.fontId)   setFontId(sv.fontId);
      if (sv.fontSize) setFontSize(sv.fontSize);
      if (sv.paper)    setPaper(sv.paper);
    } catch {}
  }, []);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const payload = JSON.stringify({ data, tmpl, accent, fontId, fontSize, paper });
        localStorage.setItem(STORAGE_KEY, payload);
        // Warn when approaching the typical 5 MB localStorage limit
        if (payload.length > 3_500_000) {
          toast("Storage nearly full — your photo may not save next time. Consider removing or resizing the photo.", "inf", 7000);
        }
      } catch (e) {
        if (e?.name === "QuotaExceededError") {
          toast("Storage full — remove the photo or use JSON save/load to preserve your CV.", "err", 8000);
        }
      }
    }, 400);
  }, [data, tmpl, accent, fontId, fontSize, paper]);




  const handlePreviewFieldChange = useCallback((field, value, id) => {
    setData(prev => {
      if (!id) return { ...prev, [field]: value };
      const next = { ...prev };
      for (const section of ["experience", "education"]) {
        const idx = (prev[section] || []).findIndex(x => x.id === id);
        if (idx !== -1) {
          next[section] = prev[section].map((x, i) => i === idx ? { ...x, [field]: value } : x);
          return next;
        }
      }
      return next;
    });
  }, []);

  const sf         = (k, v) => setData(d => ({ ...d, [k]: v }));
  const addItem    = (sec, tpl) => setData(d => ({ ...d, [sec]: [...(d[sec] || []), { id: uid(), ...tpl }] }));
  const removeItem = (sec, id)  => setData(d => ({ ...d, [sec]: d[sec].filter(x => x.id !== id) }));
  const updateItem = (sec, upd) => setData(d => ({ ...d, [sec]: d[sec].map(x => x.id === upd.id ? upd : x) }));

  const uploadPhoto = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Pick an image file", "err");
    if (f.size > 5e6) return toast("Max 5MB", "err");
    const objectUrl = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      sf("photoDataUrl", canvas.toDataURL("image/jpeg", 0.85));
      toast("Photo uploaded ✅", "ok");
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); toast("Failed to process image", "err"); };
    img.src = objectUrl;
  };

  const uploadQR = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Pick an image file", "err");
    if (f.size > 2e6)                  return toast("Max 2MB", "err");
    const r = new FileReader();
    r.onload = ev => { sf("qrDataUrl", ev.target.result); toast("QR code uploaded ✅", "ok"); };
    r.readAsDataURL(f);
  };

  const exportJSON = () => {
    const b = new Blob([JSON.stringify({ data, tmpl, accent, fontId, fontSize, paper }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = (data.fullName || "cv").replace(/\s+/g, "_") + "_cv.json";
    a.click();
    toast("CV saved as JSON ✅", "ok");
  };

  const ALLOWED_DATA_KEYS = new Set([
    "fullName","title","email","phoneCode","phoneNum","location","linkedin","github","website",
    "nationality","dob","drivingLicense","marital","gender","notice","summary","skills","hobbies",
    "photoDataUrl","qrDataUrl","compass","kpis","caseStudies",
    "experience","education","projects","certifications","languages","awards",
    "publications","volunteer","references",
  ]);

  const importJSON = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const o = JSON.parse(ev.target.result);
        if (o.data && typeof o.data === "object" && !Array.isArray(o.data)) {
          const safe = {};
          for (const k of ALLOWED_DATA_KEYS) {
            if (k in o.data) safe[k] = o.data[k];
          }
          setData(d => ({ ...d, ...safe }));
        }
        if (o.tmpl)     setTmpl(o.tmpl);
        if (o.accent)   setAccent(o.accent);
        if (o.fontId)   setFontId(o.fontId);
        if (o.fontSize) setFontSize(o.fontSize);
        if (o.paper)    setPaper(o.paper);
        toast("CV loaded ✅", "ok");
      } catch { toast("Invalid JSON file", "err"); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const doReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(INIT_DATA());
    setTmpl("modern-stack");
    setAccent("#1e3a8a");
    setFontId("outfit");
    setFontSize("medium");
    setPaper("a4");
    setShowReset(false);
    toast("Reset complete ✅", "ok");
  };

  const callClaude = async (prompt, opts = {}) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cv-ai`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, ...opts }) }
    );
    const json = await res.json();
    return json.result || "";
  };

  const applyAIPatch = (patch) => {
    setData(prev => {
      const next = { ...prev };
      [
        "fullName","title","email","phoneNum","phoneCode","location",
        "linkedin","github","website","nationality","dob","drivingLicense",
        "marital","gender","notice","summary","skills","hobbies","compass",
      ].forEach(f => { if (patch[f] !== undefined) next[f] = patch[f]; });

      ["experience","education","certifications","projects","awards","volunteer","publications","kpis","caseStudies"].forEach(section => {
        if (!Array.isArray(patch[section]) || !patch[section].length) return;
        const removeIds = new Set(patch[section].filter(x => x._remove).map(x => x.id));
        next[section] = (prev[section] || [])
          .filter(item => !removeIds.has(item.id))
          .map(item => {
            const u = patch[section].find(x => x.id === item.id && !x._remove);
            return u ? { ...item, ...u } : item;
          });
      });
      return next;
    });
  };

  // Escape literal control chars inside JSON string values (model sometimes forgets to escape \n)
  const sanitizeJson = (s) => {
    let out = '', inStr = false, esc = false;
    for (const ch of s) {
      if (esc)                          { out += ch; esc = false; continue; }
      if (ch === '\\' && inStr)         { out += ch; esc = true;  continue; }
      if (ch === '"')                   { inStr = !inStr; out += ch; continue; }
      if (inStr && ch === '\n')         { out += '\\n'; continue; }
      if (inStr && ch === '\r')         { out += '\\r'; continue; }
      if (inStr && ch === '\t')         { out += '\\t'; continue; }
      out += ch;
    }
    return out;
  };

  const parseAiJson = (raw) => {
    const cleaned = String(raw || "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(sanitizeJson(cleaned));
    return parsed?.patch ? parsed : { patch: parsed };
  };

  const runAiCommand = async () => {
    const cmd = aiCmd.trim();
    if (!cmd) return;
    setAiCmdLoading(true);
    setAiOverlayMsg("AI updating your CV…");
    try {
      const payload = {
        fullName: data.fullName, title: data.title, email: data.email,
        phoneNum: data.phoneNum, location: data.location, linkedin: data.linkedin,
        github: data.github, website: data.website, nationality: data.nationality,
        summary: data.summary, skills: data.skills, hobbies: data.hobbies,
        experience: (data.experience || []).map(e => ({
          id: e.id, role: e.role, company: e.company, empType: e.empType,
          industry: e.industry, city: e.city, start: e.start, end: e.end,
          current: e.current, bullets: e.bullets,
        })),
        education: (data.education || []).map(e => ({
          id: e.id, degree: e.degree, degType: e.degType, school: e.school,
          gpa: e.gpa, notes: e.notes,
        })),
        certifications: (data.certifications || []).map(c => ({
          id: c.id, name: c.name, issuer: c.issuer, year: c.year,
        })),
      };
      const prompt = `USER COMMAND: "${cmd}"\n\nCURRENT CV:\n${JSON.stringify(payload, null, 2)}`;
      const raw = await callClaude(prompt, { mode: "command", model: "llama-3.3-70b-versatile" });
      const { patch } = parseAiJson(raw);
      applyAIPatch(patch);
      flashPreview();
      toast("CV updated ✅", "ok");
      setAiCmd("");
    } catch (e) {
      console.error("AI command error:", e);
      toast("AI error — try again", "err");
    } finally {
      setAiCmdLoading(false);
      setAiOverlayMsg("");
    }
  };

  const runJobTailor = async () => {
    const jd = jobPosting.trim();
    if (!jd) return;
    setJobTailorLoading(true);
    setAiOverlayMsg("AI tailoring CV to job posting…");
    // Snapshot key fields before patch so we can show a diff
    const before = {
      title:   data.title,
      summary: data.summary,
      skills:  data.skills,
      experience: (data.experience || []).map(e => ({ id: e.id, bullets: e.bullets })),
    };
    try {
      const payload = {
        fullName: data.fullName, title: data.title, summary: data.summary,
        skills: data.skills, location: data.location,
        experience: (data.experience || []).map(e => ({
          id: e.id, role: e.role, company: e.company, empType: e.empType,
          industry: e.industry, city: e.city, start: e.start, end: e.end,
          current: e.current, bullets: e.bullets,
        })),
        education: (data.education || []).map(e => ({
          id: e.id, degree: e.degree, degType: e.degType, school: e.school,
        })),
        certifications: (data.certifications || []).map(c => ({
          id: c.id, name: c.name, issuer: c.issuer, year: c.year,
        })),
      };
      const prompt = `JOB POSTING:\n${jd}\n\nCANDIDATE CV:\n${JSON.stringify(payload, null, 2)}`;
      const raw = await callClaude(prompt, { mode: "job_tailor", model: "llama-3.3-70b-versatile" });
      const aiResult = parseAiJson(raw);
      const patch = aiResult.patch || {};
      applyAIPatch(patch);
      // Build diff for display
      const diffItems = [];
      if (patch.title   && patch.title   !== before.title)   diffItems.push({ field: "Title",   before: before.title   || "—", after: patch.title });
      if (patch.summary && patch.summary !== before.summary) diffItems.push({ field: "Summary", before: before.summary || "—", after: patch.summary });
      if (patch.skills  && patch.skills  !== before.skills)  diffItems.push({ field: "Skills",  before: before.skills  || "—", after: patch.skills });
      (patch.experience || []).forEach(pe => {
        const old = before.experience.find(b => b.id === pe.id);
        if (pe.bullets && old && pe.bullets !== old.bullets) {
          diffItems.push({ field: "Experience bullets", before: old.bullets || "—", after: pe.bullets });
        }
      });
      if (diffItems.length) setTailorDiff(diffItems);
      flashPreview();
      toast("CV tailored to job posting ✅", "ok");
      setJobPosting("");
      setJobTailorOpen(false);
    } catch (e) {
      console.error("Job tailor error:", e);
      toast("AI error — try again", "err");
    } finally {
      setJobTailorLoading(false);
      setAiOverlayMsg("");
    }
  };

  const aiSummary = async () => {
    setAiLoading(l => ({ ...l, summary: true }));
    setAiOverlayMsg("AI writing your summary…");
    try {
      const sk = lines(data.skills).slice(0, 8).join(", ") || "various skills";
      const expItems = data.experience || [];
      const expLine  = expItems.map(e =>
        `${e.role} at ${e.company}${e.industry ? ` (${e.industry})` : ''}${e.current ? ' — current' : ''}`
      ).join("; ");
      const seniorityHint = expItems.length >= 5
        ? "senior / leadership level"
        : expItems.length >= 2
          ? "mid-level"
          : expItems.length === 1
            ? "early career"
            : "recent graduate / entry level";
      const existing = data.summary?.trim();
      const text = await callClaude(
        `You are an expert CV writer. ${existing
          ? `Improve and expand this existing summary: "${existing}"\n\nAdditional context:`
          : "Write a punchy 2-3 sentence professional CV summary:"}
Job Title: ${data.title || "Professional"}
Career Level: ${seniorityHint}
Skills: ${sk}
Experience: ${expLine || "Not specified"}
Rules:
- 2-3 sentences maximum
- No first person pronouns
- Start with a strong noun or verb phrase
- Quantify impact where logical
- Output only the summary text, no labels or preamble
- Avoid: utilize, leverage, synergy, dynamic, results-driven, detail-oriented, passionate about, hardworking, team player, go-getter, self-motivated, responsible for`
      );
      if (text) { sf("summary", text); flashPreview(); toast("Summary written ✅", "ok"); }
    } catch { toast("AI error — try again", "err"); }
    finally   { setAiLoading(l => ({ ...l, summary: false })); setAiOverlayMsg(""); }
  };

  const aiCompass = async () => {
    setAiLoading(l => ({ ...l, compass: true }));
    setAiOverlayMsg("AI writing your professional compass…");
    try {
      const text = await callClaude(
        `Write a powerful 2-3 sentence "Professional Compass" for this person:
Name: ${data.fullName || "Professional"}
Job Title: ${data.title || "Professional"}
Current Summary: ${data.summary || "Not specified"}
Experience: ${(data.experience || []).slice(0, 3).map(e => `${e.role} at ${e.company}`).join("; ") || "Not specified"}
Rules:
- Future-focused career narrative
- States where they're heading professionally
- Mentions years of experience and core expertise
- Inspiring but realistic
- Output only the compass text, no labels`
      );
      if (text) { sf("compass", text); flashPreview(); toast("Professional compass written ✅", "ok"); }
    } catch { toast("AI error", "err"); }
    finally { setAiLoading(l => ({ ...l, compass: false })); setAiOverlayMsg(""); }
  };

  const aiSkills = async () => {
    setAiLoading(l => ({ ...l, skills: true }));
    setAiOverlayMsg("AI suggesting skills…");
    try {
      const expItems = data.experience || [];
      const expLine  = expItems.map(e => `${e.role} at ${e.company}${e.industry ? ` (${e.industry})` : ''}`).join("; ");
      const existingSkills = lines(data.skills).join(", ");
      const text = await callClaude(
        `You are an expert CV writer. Suggest ATS-optimized professional skills for this candidate.
Job Title: ${data.title || "Professional"}
Experience: ${expLine || "Not specified"}
Summary: ${data.summary || "Not specified"}
${existingSkills ? `Existing skills (build on these, do not duplicate): ${existingSkills}` : ""}
Rules:
- Suggest 10-14 skills, one per line
- Only include skills the candidate plausibly has based on their title, experience, and summary
- Do NOT invent software, certifications, or technologies not implied by their background
- Mix hard technical skills and relevant soft skills
- No bullets, numbers, or preamble — just skill names, one per line
- Avoid generic filler: "team player", "hardworking", "detail-oriented", "passionate about", "go-getter"`
      );
      if (text) { sf("skills", text); flashPreview(); toast("Skills added ✅", "ok"); }
    } catch { toast("AI error", "err"); }
    finally   { setAiLoading(l => ({ ...l, skills: false })); setAiOverlayMsg(""); }
  };

  const aiProjectDesc = async (projItem) => {
    toast("AI writing project description…", "inf", 8000);
    try {
      const existing = projItem.bullets?.trim();
      const text = await callClaude(
        `You are an expert CV writer. ${existing
          ? `Improve and expand these existing project bullet points: "${existing}"\n\nUse this additional context:`
          : "Write 2-3 impressive bullet points using this context:"}
Person: ${data.fullName || "Developer"} | Title: ${data.title || "Professional"}
Project: ${projItem.name || "Project"} | Tech: ${projItem.tech || "Not specified"} | Status: ${projItem.status || "Completed"}
Rules:
- 2-3 short powerful bullet points
- Start each with a strong action verb
- Mention technologies used
- Quantify impact where logical
- One bullet per line, no bullet characters or numbers`
      );
      if (text) { updateItem("projects", { ...projItem, bullets: text }); toast("Project description written ✅", "ok"); }
    } catch { toast("AI error", "err"); }
  };

  const aiEduNotes = async (eduItem) => {
    toast("AI writing education notes…", "inf", 8000);
    try {
      const existing = eduItem.notes?.trim();
      const text = await callClaude(
        `You are an expert CV writer. ${existing
          ? `Improve and expand these existing education notes: "${existing}"\n\nUse this additional context:`
          : "Write 2-3 impressive achievement notes using this context:"}
Degree: ${eduItem.degType || ""} in ${eduItem.degree || ""} | University: ${eduItem.school || ""} | GPA: ${eduItem.gpa || "N/A"}
Rules:
- 2-3 short achievement notes
- Include thesis, projects, awards, dean's list if relevant
- One note per line, no bullet characters`
      );
      if (text) { updateItem("education", { ...eduItem, notes: text }); toast("Education notes written ✅", "ok"); }
    } catch { toast("AI error", "err"); }
  };

  const aiBullets = async (expItem) => {
    toast("AI writing bullets…", "inf", 8000);
    try {
      const existing = expItem.bullets?.trim();
      const text = await callClaude(
        `You are an expert CV writer. ${existing
          ? `Improve and expand these existing bullet points: "${existing}"\n\nUse this additional context:`
          : "Write 3 powerful achievement bullet points using this context:"}
Person: ${data.fullName || "Professional"} | Title: ${data.title || "Professional"}
Role: ${expItem.role || "Professional"} at ${expItem.company || "Company"} | Industry: ${expItem.industry || "N/A"}
Duration: ${expItem.start || ""}${expItem.current ? " - Present" : expItem.end ? " - " + expItem.end : ""}
Rules:
- Start each bullet with a strong past-tense action verb
- Quantify impact with numbers/percentages where logical
- Keep each bullet under 20 words
- One bullet per line, no bullet characters or numbers`
      );
      if (text) {
        updateItem("experience", { ...expItem, bullets: text, _aiBullets: false });
        toast("Bullets written ✅", "ok");
      }
    } catch { toast("AI error", "err"); }
  };

  useEffect(() => {
    const t = (data.experience || []).find(x => x._aiBullets);
    if (t) aiBullets(t);
  }, [data.experience]);

  const { score: atsScore, checks: atsChecks } = useMemo(() => {
    const d = data;
    const doc = [
      d.title, d.summary, d.skills,
      ...(d.experience || []).flatMap(x => [x.role, x.company, x.industry, x.bullets]),
      ...(d.education || []).flatMap(x => [x.degree, x.degType, x.school, x.notes]),
      ...(d.certifications || []).flatMap(x => [x.name, x.issuer]),
      ...(d.projects || []).flatMap(x => [x.name, x.tech, x.bullets]),
    ].filter(Boolean).join(" ").toLowerCase();
    const jdTerms = [...new Set(String(jobPosting || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3 && !["with","from","that","this","will","your","have","must","able","work","role","team"].includes(w)))].slice(0, 40);
    const matchRatio = jdTerms.length ? jdTerms.filter(w => doc.includes(w)).length / jdTerms.length : 1;
    const checks = [];
    let sc = 0;
    const ck = (ok, msg, pts) => { if (ok) sc += pts; checks.push({ ok: !!ok, msg }); };

    const summaryLen = (d.summary || d.compass || "").trim().length;
    const sk = lines(d.skills).length;
    const ex = (d.experience || []).filter(x => (x.role || x.company || "").trim());
    const bullets = ex.flatMap(x => lines(x.bullets));
    const action = bullets.filter(b => /^(led|built|managed|delivered|created|improved|reduced|increased|designed|implemented|developed|maintained|optimized|coordinated|trained|analyzed|resolved)\b/i.test(b)).length;
    const evidence = bullets.filter(b => /\d|%|\$|aed|usd|kpi|revenue|cost|time|downtime|sla/i.test(b)).length;

    ck(d.fullName?.trim() && d.email?.trim() && d.phoneNum?.trim(), "Contact essentials present", 12);
    ck(d.location?.trim() && d.linkedin?.trim(), "Location and LinkedIn present", 8);
    ck(summaryLen >= 90 && summaryLen <= 520, `Summary length ${summaryLen || 0} chars`, 14);
    ck(sk >= 8 && sk <= 24, `${sk} focused skills`, 14);
    ck(ex.length >= 1, `${ex.length} experience entr${ex.length === 1 ? "y" : "ies"}`, 14);
    ck(bullets.length >= Math.min(3, ex.length * 2), `${bullets.length} achievement bullets`, 10);
    ck(action >= Math.min(2, bullets.length), `${action} action-led bullets`, 8);
    ck(evidence >= 1 || bullets.length < 2, evidence ? `${evidence} evidence-rich bullets` : "Add truthful metrics where available", 7);
    ck((d.education || []).some(x => (x.degree || x.school || "").trim()), "Education section present", 6);
    ck((d.certifications || []).some(x => x.name?.trim()) || sk >= 10, "Certifications or strong skills coverage", 4);
    ck(matchRatio >= .55, jdTerms.length ? `JD keyword match ${Math.round(matchRatio * 100)}%` : "Paste a JD for match scoring", 3);

    return { score: Math.min(100, Math.round(sc)), checks };
  }, [data, jobPosting]);

  const atsColor = atsScore >= 80 ? "#047857" : atsScore >= 50 ? "#d97706" : "#b91c1c";

  const cvHtml = useMemo(
    () => buildCvHtml(data, tmpl, accent, fontId, fontSize, paper, FONTS, FSIZES, PAPERS),
    [data, tmpl, accent, fontId, fontSize, paper]
  );

  return (
    <>
      <div className="cv-bg" aria-hidden="true" />
      <Toasts toasts={toasts} onDismiss={dismissToast} />

      {/* AI loading overlay */}
      {aiOverlayMsg && (
        <div className="cv-ai-overlay" role="status" aria-live="polite">
          <div className="cv-ai-overlay-box">
            <div className="cv-ai-overlay-spinner" aria-hidden="true" />
            <div className="cv-ai-overlay-msg">{aiOverlayMsg}</div>
            <div className="cv-ai-overlay-sub">{AI_PROGRESS[progressIdx]}</div>
            <div className="cv-ai-overlay-dots" aria-hidden="true"><span /><span /><span /></div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="cv-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reset-title"
          onClick={e => e.target === e.currentTarget && setShowReset(false)}>
          <div className="cv-modal" style={{ maxWidth: 360 }}>
            <h2 id="reset-title" style={{ fontSize: ".95rem", fontWeight: 800, marginBottom: 8, color: "#7f1d1d" }}>
              🗑️ Reset all CV data?
            </h2>
            <p style={{ fontSize: ".8rem", color: "#475569", marginBottom: 18, lineHeight: 1.6 }}>
              This will permanently erase everything you've entered. Download a JSON backup first if you want to save your work.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="cv-btn cv-btn-ghost cv-btn-sm" style={{ flex: 1 }} onClick={() => setShowReset(false)}>
                Cancel
              </button>
              <button className="cv-btn cv-btn-danger" style={{ flex: 1, minHeight: 36 }} onClick={doReset}>
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job tailor diff panel */}
      {tailorDiff && (
        <div style={{
          position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9000, width: "min(540px, calc(100vw - 24px))",
          background: "#fff", border: "1.5px solid #86efac", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,.18)", overflow: "hidden",
        }} role="region" aria-label="Job tailor changes">
          <div style={{ background: "#f0fdf4", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: ".78rem", fontWeight: 800, color: "#166534" }}>
              ✅ {tailorDiff.length} field{tailorDiff.length !== 1 ? "s" : ""} updated by job tailoring
            </span>
            <button onClick={() => setTailorDiff(null)} style={{ background: "none", border: "none", fontWeight: 800, color: "#6b7280", cursor: "pointer", fontSize: ".85rem" }}>✕</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "10px 14px" }}>
            {tailorDiff.map((d, i) => (
              <div key={i} style={{ marginBottom: 10, fontSize: ".74rem" }}>
                <div style={{ fontWeight: 800, color: "#0b1437", marginBottom: 3 }}>{d.field}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ background: "#fef2f2", borderRadius: 6, padding: "5px 8px", color: "#7f1d1d", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, fontSize: ".62rem", opacity: .7, marginBottom: 2 }}>BEFORE</div>
                    {d.before.length > 200 ? d.before.slice(0, 200) + "…" : d.before}
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 6, padding: "5px 8px", color: "#166534", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, fontSize: ".62rem", opacity: .7, marginBottom: 2 }}>AFTER</div>
                    {d.after.length > 200 ? d.after.slice(0, 200) + "…" : d.after}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cvapp">

          {/* ── COMPACT TOP BAR ── */}
          <header className="cv-topbar">
            <div className="cv-topbar-brand">
              <nav className="crumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link><span aria-hidden="true">›</span>
                <Link href="/tools">Tools</Link><span aria-hidden="true">›</span>
                <Link href="/tools/career">Career</Link><span aria-hidden="true">›</span>
                <span style={{ color: "var(--text-1)", fontWeight: 700 }} aria-current="page">CV Maker</span>
              </nav>
              <span className="cv-topbar-title">Professional <span className="cv-grad">CV Maker</span></span>
            </div>

            <div className="cv-topbar-spacer" />

            <div className="cv-topbar-actions">
              <label className="cv-btn cv-btn-ghost cv-btn-sm cv-file-btn" title="Load saved CV">
                <span aria-hidden="true">📂</span> Load
                <input type="file" accept=".json" onChange={importJSON} aria-label="Load CV from JSON file" />
              </label>
              <button className="cv-btn cv-btn-ghost cv-btn-sm" onClick={exportJSON}>
                <span aria-hidden="true">💾</span> Save
              </button>

              {/* ATS score chip with animated ring + checklist popover */}
              <div style={{ position: "relative" }}>
                <button
                  className="cv-ats-chip"
                  onClick={() => setAtsOpen(o => !o)}
                  aria-expanded={atsOpen}
                  aria-controls="ats-panel"
                  aria-label={`ATS score ${atsScore} out of 100. Show checklist.`}
                >
                  <span className="cv-ats-ring-sm" aria-hidden="true">
                    <svg width="34" height="34" viewBox="0 0 34 34">
                      <circle className="track" cx="17" cy="17" r="14" fill="none" strokeWidth="3.5" />
                      <circle
                        className="fill" cx="17" cy="17" r="14" fill="none" strokeWidth="3.5"
                        stroke={atsColor}
                        strokeDasharray={2 * Math.PI * 14}
                        strokeDashoffset={(2 * Math.PI * 14) * (1 - atsScore / 100)}
                      />
                    </svg>
                  </span>
                  <span className="cv-ats-chip-txt">
                    <span className="cv-ats-chip-num" style={{ color: atsColor }}>{atsScore}</span>
                    <span className="cv-ats-chip-lbl">ATS</span>
                  </span>
                </button>
                {atsOpen && (
                  <div id="ats-panel" className="cv-ats-pop" role="region" aria-label="ATS checklist">
                    {atsChecks.map((c, i) => (
                      <div key={i} className={`cv-ck ${c.ok ? "ok" : "fail"}`}>
                        <b aria-hidden="true">{c.ok ? "✓" : "✗"}</b>
                        <span>{c.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Print paperRef={paperRef} paper={paper} fullName={data.fullName} toast={toast} />
            </div>
          </header>

          <div className="cv-grid2">

            {/* ── FORM COLUMN ── */}
            <section
              className={`cv-col-form${mobileTab === "edit" ? " m-on" : ""}`}
              id="panel-edit"
              aria-label="Edit CV content"
            >
            <div className="cv-col-form-scroll">
              {/* ── AI Command Bar ── */}
              <div className="cv-aicmd">
                <div className="cv-aicmd-head">
                  <span className="cv-aicmd-dot" aria-hidden="true" />
                  <span className="cv-aicmd-title">✨ AI Command</span>
                  <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>
                    — tell the AI what to do
                  </span>
                </div>
                <div className="cv-aicmd-row">
                  <input
                    className="cv-aicmd-input"
                    value={aiCmd}
                    onChange={e => setAiCmd(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !aiCmdLoading && runAiCommand()}
                    placeholder={AI_PLACEHOLDERS[phIdx]}
                    disabled={aiCmdLoading}
                    aria-label="AI CV command"
                  />
                  <button
                    className="cv-btn cv-btn-primary cv-btn-sm"
                    onClick={runAiCommand}
                    disabled={aiCmdLoading || !aiCmd.trim()}
                    aria-label="Run AI command"
                    style={{ minWidth: 84 }}
                  >
                    {aiCmdLoading ? <><span className="cv-spinner" aria-hidden="true" /> …</> : "✨ Apply"}
                  </button>
                </div>
                <div className="cv-aicmd-ex">
                  {["Optimize for ATS", "Rewrite in human tone", "Focus on solar energy", "Tailor for UAE market"].map(ex => (
                    <button key={ex} onClick={() => setAiCmd(ex)}>{ex}</button>
                  ))}
                </div>

                {/* Job Posting Tailor */}
                <div style={{ borderTop: "1px solid rgba(37,99,235,.1)", margin: "8px 0 0", padding: "8px 0 0" }}>
                  <button
                    onClick={() => setJobTailorOpen(o => !o)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: ".76rem", fontWeight: 700,
                      color: jobTailorOpen ? "var(--royal)" : "#475569",
                      padding: "0 0 8px",
                    }}
                  >
                    <span>🎯</span>
                    Tailor CV to a Job Posting
                    <span style={{ fontSize: ".65rem", opacity: .6 }}>{jobTailorOpen ? "▲" : "▼"}</span>
                  </button>

                  {jobTailorOpen && (
                    <div style={{ marginBottom: 10 }}>
                      <textarea
                        value={jobPosting}
                        onChange={e => setJobPosting(e.target.value)}
                        placeholder={"Paste the full job description here…\n\nThe AI will read the job requirements and rewrite your summary, reorder skills, enhance experience bullets, and inject ATS keywords — all based on your real background."}
                        disabled={jobTailorLoading}
                        rows={8}
                        style={{
                          width: "100%", padding: "10px 12px",
                          borderRadius: "var(--r-sm)",
                          border: "1.5px solid rgba(37,99,235,.3)",
                          fontSize: ".78rem", lineHeight: 1.6,
                          resize: "vertical", outline: "none",
                          background: jobTailorLoading ? "#f8faff" : "#fff",
                          color: "var(--navy)",
                        }}
                      />
                      <button
                        onClick={runJobTailor}
                        disabled={jobTailorLoading || !jobPosting.trim()}
                        style={{
                          marginTop: 8, width: "100%", padding: "10px",
                          borderRadius: "var(--r-sm)", border: "none",
                          background: jobTailorLoading || !jobPosting.trim()
                            ? "#94a3b8"
                            : "linear-gradient(135deg,var(--gold),var(--gold-l))",
                          color: jobTailorLoading || !jobPosting.trim() ? "#fff" : "#1c1917",
                          fontWeight: 800, fontSize: ".8rem",
                          cursor: jobTailorLoading || !jobPosting.trim() ? "not-allowed" : "pointer",
                        }}
                      >
                        {jobTailorLoading
                          ? "⏳ Tailoring your CV…"
                          : "🎯 Tailor My CV to This Job"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <nav className="cv-ftabs" role="tablist" aria-label="CV form sections">
                {[
                  ["personal",   "👤", "Personal",   "Name, contact, photo, summary"],
                  ["experience", "💼", "Work",        "Jobs, roles, achievements"],
                  ["education",  "🎓", "Edu",         "Degrees, projects, certs"],
                  ["skills",     "🛠",  "Skills",      "Skills & languages"],
                  ["extras",     "⭐", "Extras",      "Awards, KPIs, volunteer, refs"],
                ].map(([tab, ico, lbl, hint]) => (
                  <button
                    key={tab}
                    className={`cv-ftab${activeTab === tab ? " on" : ""}`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    title={hint}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="ico" aria-hidden="true">{ico}</span>
                    <span>{lbl}</span>
                  </button>
                ))}
              </nav>

              {/* Section hint bar */}
              <div style={{ fontSize: ".64rem", color: "#94a3b8", fontWeight: 600, padding: "0 2px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                <span aria-hidden="true">
                  { activeTab === "personal"   ? "👤"
                  : activeTab === "experience" ? "💼"
                  : activeTab === "education"  ? "🎓"
                  : activeTab === "skills"     ? "🛠"
                  : "⭐" }
                </span>
                { activeTab === "personal"   ? "Personal details — name, contact info, photo, and professional summary"
                : activeTab === "experience" ? "Work experience — roles, companies, and AI-written achievement bullets"
                : activeTab === "education"  ? "Education, academic projects, and certifications"
                : activeTab === "skills"     ? "Skills list (one per line) and languages"
                : "Extras — awards, KPIs, volunteer work, publications, and references" }
              </div>

              {/* PERSONAL TAB */}
              <div className={`cv-tpanel${activeTab === "personal" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <h2 className="cv-card-t" style={{ marginBottom: 12 }}>👤 Personal Details</h2>
                  <div className="cv-g2">
                    <Field label="Full Name *" id="p-fullname">
                      <input id="p-fullname" className="cv-inp" value={data.fullName || ""} placeholder="John Smith"
                        autoComplete="name" onChange={e => sf("fullName", e.target.value)} />
                    </Field>
                    <Field label="Job Title" id="p-title">
                      <input id="p-title" className="cv-inp" value={data.title || ""} placeholder="Senior Engineer"
                        onChange={e => sf("title", e.target.value)} />
                    </Field>
                    <Field label="Email *" id="p-email">
                      <input id="p-email" className="cv-inp" type="email" value={data.email || ""}
                        placeholder="you@email.com" autoComplete="email"
                        onChange={e => sf("email", e.target.value)} />
                    </Field>
                    <div className="cv-field">
                      <label className="cv-lbl" htmlFor="p-phonenum">Phone Number</label>
                      <div className="cv-phone-row">
                        <select id="p-phonecode" className="cv-inp" aria-label="Phone country code"
                          value={data.phoneCode || "+971"} onChange={e => sf("phoneCode", e.target.value)}>
                          {PHONE_CODES.map(p => <option key={p.c} value={p.c}>{p.l} {p.c}</option>)}
                        </select>
                        <input id="p-phonenum" className="cv-inp" type="tel" value={data.phoneNum || ""}
                          placeholder="50 123 4567" onChange={e => sf("phoneNum", e.target.value)} />
                      </div>
                    </div>
                    <Field label="Location" id="p-location">
                      <input id="p-location" className="cv-inp" value={data.location || ""} placeholder="Dubai, UAE"
                        onChange={e => sf("location", e.target.value)} />
                    </Field>
                    <Field label="LinkedIn URL" id="p-linkedin">
                      <input id="p-linkedin" className="cv-inp" value={data.linkedin || ""}
                        placeholder="linkedin.com/in/you" onChange={e => sf("linkedin", e.target.value)} />
                    </Field>
                    <Field label="GitHub" id="p-github">
                      <input id="p-github" className="cv-inp" value={data.github || ""}
                        placeholder="github.com/user" onChange={e => sf("github", e.target.value)} />
                    </Field>
                    <Field label="Website / Portfolio" id="p-website">
                      <input id="p-website" className="cv-inp" value={data.website || ""}
                        placeholder="yoursite.com" onChange={e => sf("website", e.target.value)} />
                    </Field>
                    <Field label="Nationality" id="p-nationality">
                      <select id="p-nationality" className="cv-inp" value={data.nationality || ""}
                        onChange={e => sf("nationality", e.target.value)}>
                        <option value="">— Select nationality —</option>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </Field>
                    <Field label="Date of Birth" id="p-dob">
                      <input id="p-dob" className="cv-inp" type="date" value={data.dob || ""}
                        onChange={e => sf("dob", e.target.value)} />
                    </Field>
                    <Field label="Driving License" id="p-driving">
                      <select id="p-driving" className="cv-inp" value={data.drivingLicense || ""}
                        onChange={e => sf("drivingLicense", e.target.value)}>
                        {DRIVING_LIC.map(o => <option key={o} value={o}>{o || "— None —"}</option>)}
                      </select>
                    </Field>
                    <Field label="Notice Period" id="p-notice">
                      <select id="p-notice" className="cv-inp" value={data.notice || ""}
                        onChange={e => sf("notice", e.target.value)}>
                        {NOTICE_PERIODS.map(o => <option key={o} value={o}>{o || "— Not specified —"}</option>)}
                      </select>
                    </Field>
                    <Field label="Marital Status" id="p-marital">
                      <select id="p-marital" className="cv-inp" value={data.marital || ""}
                        onChange={e => sf("marital", e.target.value)}>
                        {MARITAL_STATUS.map(o => <option key={o} value={o}>{o || "— Prefer not to say —"}</option>)}
                      </select>
                    </Field>
                    <Field label="Gender" id="p-gender">
                      <select id="p-gender" className="cv-inp" value={data.gender || ""}
                        onChange={e => sf("gender", e.target.value)}>
                        {GENDERS.map(o => <option key={o} value={o}>{o || "— Prefer not to say —"}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="cv-photo-row">
                    <div className="cv-photo-thumb" aria-hidden="true">
                      {data.photoDataUrl ? <img src={data.photoDataUrl} alt="Profile preview" /> : "👤"}
                    </div>
                    <div className="cv-photo-btns">
                      <label className="cv-btn cv-btn-ghost cv-btn-sm cv-file-btn">
                        <span aria-hidden="true">📷</span> Upload Photo
                        <input type="file" accept="image/*" onChange={uploadPhoto} aria-label="Upload profile photo" />
                      </label>
                      {data.photoDataUrl && (
                        <button className="cv-btn cv-btn-danger" onClick={() => sf("photoDataUrl", "")}>
                          ✕ Remove
                        </button>
                      )}
                      <span style={{ fontSize: ".63rem", color: "#4b5563" }}>Max 5MB · JPG/PNG</span>
                    </div>
                  </div>
                </div>

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">📝 Professional Summary</h2>
                    <button className="cv-ai-btn" disabled={!!aiLoading.summary} onClick={aiSummary}
                      aria-label="Generate summary with AI">
                      {aiLoading.summary ? <><span className="cv-spinner" aria-hidden="true" /> Writing…</> : "✨ AI Write"}
                    </button>
                  </div>
                  <label className="cv-lbl" htmlFor="p-summary" style={{ marginBottom: 4 }}>Summary text</label>
                  <textarea id="p-summary" className="cv-inp" rows={4}
                    placeholder="Results-driven engineer with 8+ years delivering complex projects on time and under budget…"
                    value={data.summary || ""} onChange={e => sf("summary", e.target.value)} />
                </div>


              </div>

              {/* EXPERIENCE TAB */}
              <div className={`cv-tpanel${activeTab === "experience" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">💼 Work Experience</h2>
                    <button className="cv-btn-add" aria-label="Add experience" onClick={() => addItem("experience", {
                      role:"", company:"", empType:"Full-time",
                      industry:"", city:"", start:"", end:"", current:false, bullets:"",
                    })}>+ Add</button>
                  </div>
                  {!(data.experience || []).length && (
                    <div className="cv-empty" role="status">💼 No experience added. Click + Add to start.</div>
                  )}
                  {(data.experience || []).map(item => (
                    <ExpItem key={item.id} item={item}
                      onUpdate={upd => updateItem("experience", upd)}
                      onRemove={() => removeItem("experience", item.id)} />
                  ))}
                </div>

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">📋 Case Studies</h2>
                    <button className="cv-btn-add" aria-label="Add case study" onClick={() => addItem("caseStudies", {
                      name:"", challenge:"", approach:"", result:"", outcome:"",
                    })}>+ Add</button>
                  </div>
                  {!(data.caseStudies || []).length && (
                    <div className="cv-empty" role="status">📋 No case studies yet. Used in Apex Pro template.</div>
                  )}
                  {(data.caseStudies || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("caseStudies", u)}
                      onRemove={() => removeItem("caseStudies", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `cs-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.name || "New Case Study"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label="Remove case study">✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Project Name *" id={`${bid}-name`} span2>
                                <input id={`${bid}-name`} className="cv-inp" value={L.name}
                                  placeholder="Digital Transformation Project" onChange={e => upd("name", e.target.value)} />
                              </Field>
                              <Field label="Outcome Summary" id={`${bid}-outcome`} span2>
                                <input id={`${bid}-outcome`} className="cv-inp" value={L.outcome}
                                  placeholder="Saved $2M annually" onChange={e => upd("outcome", e.target.value)} />
                              </Field>
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <label className="cv-lbl" htmlFor={`${bid}-challenge`}>Challenge</label>
                              <textarea id={`${bid}-challenge`} className="cv-inp" rows={2}
                                value={L.challenge} placeholder="What problem were you solving?"
                                onChange={e => upd("challenge", e.target.value)} />
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <label className="cv-lbl" htmlFor={`${bid}-approach`}>Approach</label>
                              <textarea id={`${bid}-approach`} className="cv-inp" rows={2}
                                value={L.approach} placeholder="How did you solve it?"
                                onChange={e => upd("approach", e.target.value)} />
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <label className="cv-lbl" htmlFor={`${bid}-result`}>Result</label>
                              <textarea id={`${bid}-result`} className="cv-inp" rows={2}
                                value={L.result} placeholder="What was the measurable impact?"
                                onChange={e => upd("result", e.target.value)} />
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>
              </div>

              {/* EDUCATION TAB */}
              <div className={`cv-tpanel${activeTab === "education" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🎓 Education</h2>
                    <button className="cv-btn-add" aria-label="Add education" onClick={() => addItem("education", {
                      degree:"", degType:"Bachelor's Degree", school:"",
                      city:"", start:"", end:"", gpa:"", notes:"",
                    })}>+ Add</button>
                  </div>
                  {!(data.education || []).length && (
                    <div className="cv-empty" role="status">🎓 No education added yet.</div>
                  )}
                  {(data.education || []).map(item => (
                    <EduItem key={item.id} item={item}
                      onUpdate={u => updateItem("education", u)}
                      onRemove={() => removeItem("education", item.id)}
                      onAiNotes={aiEduNotes} />
                  ))}
                </div>

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🛠 Projects</h2>
                    <button className="cv-btn-add" aria-label="Add project" onClick={() => addItem("projects", {
                      name:"", tech:"", url:"", status:"Completed", bullets:"",
                    })}>+ Add</button>
                  </div>
                  {!(data.projects || []).length && <div className="cv-empty" role="status">🛠 No projects yet.</div>}
                  {(data.projects || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("projects", u)}
                      onRemove={() => removeItem("projects", item.id)}
                      onAiDesc={aiProjectDesc}>
                      {(L, upd, rm, onAiDesc) => {
                        const bid = `proj-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.name || "New Project"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label={`Remove ${L.name || "project"}`}>✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Name *" id={`${bid}-name`}>
                                <input id={`${bid}-name`} className="cv-inp" value={L.name} placeholder="Smart Dashboard"
                                  onChange={e => upd("name", e.target.value)} />
                              </Field>
                              <Field label="Status" id={`${bid}-status`}>
                                <select id={`${bid}-status`} className="cv-inp" value={L.status}
                                  onChange={e => upd("status", e.target.value)}>
                                  {PROJ_STATUS.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </Field>
                              <Field label="Tech / Year" id={`${bid}-tech`}>
                                <input id={`${bid}-tech`} className="cv-inp" value={L.tech}
                                  placeholder="React, Python · 2026" onChange={e => upd("tech", e.target.value)} />
                              </Field>
                              <Field label="URL" id={`${bid}-url`}>
                                <input id={`${bid}-url`} className="cv-inp" value={L.url}
                                  placeholder="github.com/…" onChange={e => upd("url", e.target.value)} />
                              </Field>
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                                <label className="cv-lbl" htmlFor={`${bid}-desc`}>Description</label>
                                <button className="cv-ai-btn" onClick={() => onAiDesc(L)}>✨ AI Write</button>
                              </div>
                              <textarea id={`${bid}-desc`} className="cv-inp" rows={2}
                                value={L.bullets} onChange={e => upd("bullets", e.target.value)} />
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">✅ Certifications</h2>
                    <button className="cv-btn-add" aria-label="Add certification" onClick={() => addItem("certifications", {
                      name:"", issuer:"", year:"", credId:"", expiry:"",
                    })}>+ Add</button>
                  </div>
                  {!(data.certifications || []).length && <div className="cv-empty" role="status">✅ No certifications yet.</div>}
                  {(data.certifications || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("certifications", u)}
                      onRemove={() => removeItem("certifications", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `cert-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.name || "New Cert"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label={`Remove ${L.name || "cert"}`}>✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Name *" id={`${bid}-name`}>
                                <input id={`${bid}-name`} className="cv-inp" value={L.name}
                                  placeholder="AWS Solutions Architect" onChange={e => upd("name", e.target.value)} />
                              </Field>
                              <Field label="Issuer" id={`${bid}-issuer`}>
                                <input id={`${bid}-issuer`} className="cv-inp" value={L.issuer}
                                  placeholder="Amazon Web Services" onChange={e => upd("issuer", e.target.value)} />
                              </Field>
                              <Field label="Year" id={`${bid}-year`}>
                                <input id={`${bid}-year`} className="cv-inp" value={L.year}
                                  placeholder="2026" onChange={e => upd("year", e.target.value)} />
                              </Field>
                              <Field label="Expiry" id={`${bid}-expiry`}>
                                <input id={`${bid}-expiry`} className="cv-inp" value={L.expiry}
                                  placeholder="2027 / No Expiry" onChange={e => upd("expiry", e.target.value)} />
                              </Field>
                              <Field label="Credential ID" id={`${bid}-credid`} span2>
                                <input id={`${bid}-credid`} className="cv-inp" value={L.credId}
                                  placeholder="ABC-12345" onChange={e => upd("credId", e.target.value)} />
                              </Field>
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>
              </div>

              {/* SKILLS TAB */}
              <div className={`cv-tpanel${activeTab === "skills" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🛠 Skills</h2>
                    <button className="cv-ai-btn" disabled={!!aiLoading.skills} onClick={aiSkills}
                      aria-label="Suggest skills with AI">
                      {aiLoading.skills ? <><span className="cv-spinner" aria-hidden="true" />…</> : "✨ AI Suggest"}
                    </button>
                  </div>
                  <p style={{ fontSize: ".7rem", color: "#4b5563", marginBottom: 6 }}>
                    One skill per line — ATS reads each keyword individually
                  </p>
                  <label className="cv-lbl" htmlFor="p-skills" style={{ marginBottom: 4 }}>Skills list</label>
                  <textarea id="p-skills" className="cv-inp" rows={9}
                    placeholder={"AutoCAD\nProject Management\nPython\nMS Excel\nLeadership\nHVAC Design"}
                    value={data.skills || ""} onChange={e => sf("skills", e.target.value)} />
                  <div className="cv-chips" aria-label="Skill chips preview">
                    {lines(data.skills).map((s, i) => <span key={i} className="cv-chip">{s}</span>)}
                  </div>
                </div>

                <div className="cv-card">
                  <h2 className="cv-card-t" style={{ marginBottom: 10 }}>🌐 Languages</h2>
                  {!(data.languages || []).length && <div className="cv-empty" role="status">🌐 No languages added.</div>}
                  {(data.languages || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("languages", u)}
                      onRemove={() => removeItem("languages", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `lang-${L.id}`;
                        return (
                          <div className="cv-shell" style={{ padding: "10px 11px", marginTop: 6 }}>
                            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                              <input id={`${bid}-lang`} className="cv-inp" value={L.lang}
                                placeholder="e.g. Arabic" style={{ flex: 1 }}
                                aria-label="Language name" onChange={e => upd("lang", e.target.value)} />
                              <select id={`${bid}-level`} className="cv-inp" value={L.level}
                                style={{ flex: 1 }} aria-label="Language proficiency level"
                                onChange={e => upd("level", e.target.value)}>
                                {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                              </select>
                              <button className="cv-btn-rm" onClick={rm} aria-label={`Remove ${L.lang || "language"}`}>✕</button>
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                  <button className="cv-btn-add" style={{ marginTop: 9 }}
                    onClick={() => addItem("languages", { lang: "", level: "Professional" })}>
                    + Add Language
                  </button>
                </div>

                <div className="cv-card">
                  <h2 className="cv-card-t" style={{ marginBottom: 8 }}>🎯 Hobbies &amp; Interests</h2>
                  <p style={{ fontSize: ".7rem", color: "#4b5563", marginBottom: 6 }}>One per line or comma-separated</p>
                  <label className="cv-lbl" htmlFor="p-hobbies" style={{ marginBottom: 4 }}>Hobbies</label>
                  <textarea id="p-hobbies" className="cv-inp" rows={3}
                    placeholder="Photography · Cricket · Reading · Travel"
                    value={data.hobbies || ""} onChange={e => sf("hobbies", e.target.value)} />
                </div>
              </div>

              {/* EXTRAS TAB */}
              <div className={`cv-tpanel${activeTab === "extras" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🏆 Awards</h2>
                    <button className="cv-btn-add" aria-label="Add award"
                      onClick={() => addItem("awards", { title:"", issuer:"", year:"", desc:"" })}>+ Add</button>
                  </div>
                  {!(data.awards || []).length && <div className="cv-empty" role="status">🏆 No awards yet.</div>}
                  {(data.awards || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("awards", u)}
                      onRemove={() => removeItem("awards", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `award-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.title || "New Award"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label="Remove award">✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Title *" id={`${bid}-title`}>
                                <input id={`${bid}-title`} className="cv-inp" value={L.title}
                                  placeholder="Employee of the Year" onChange={e => upd("title", e.target.value)} />
                              </Field>
                              <Field label="Issuer" id={`${bid}-issuer`}>
                                <input id={`${bid}-issuer`} className="cv-inp" value={L.issuer}
                                  placeholder="Organization" onChange={e => upd("issuer", e.target.value)} />
                              </Field>
                              <Field label="Year" id={`${bid}-year`}>
                                <input id={`${bid}-year`} className="cv-inp" value={L.year}
                                  placeholder="2026" onChange={e => upd("year", e.target.value)} />
                              </Field>
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <label className="cv-lbl" htmlFor={`${bid}-desc`}>Description</label>
                              <textarea id={`${bid}-desc`} className="cv-inp" rows={2}
                                value={L.desc} onChange={e => upd("desc", e.target.value)} />
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>

                {/* KPI / Impact Highlights — used by Double Column and Apex Pro templates */}
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">📊 Impact Highlights (KPIs)</h2>
                    <button className="cv-btn-add" aria-label="Add KPI" onClick={() => addItem("kpis", { value: "", label: "" })}>+ Add</button>
                  </div>
                  <p style={{ fontSize: ".68rem", color: "#4b5563", marginBottom: 8 }}>
                    Big numbers shown as a visual block — used by Double Column &amp; Apex Pro templates
                  </p>
                  {!(data.kpis || []).length && <div className="cv-empty" role="status">📊 No KPIs yet. E.g. value "95%" label "Customer Satisfaction"</div>}
                  {(data.kpis || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("kpis", u)}
                      onRemove={() => removeItem("kpis", item.id)}>
                      {(L, upd, rm) => (
                        <div className="cv-shell" style={{ padding: "10px 11px", marginTop: 6 }}>
                          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                            <input className="cv-inp" value={L.value} placeholder='95%'
                              aria-label="KPI value" style={{ flex: "0 0 90px" }}
                              onChange={e => upd("value", e.target.value)} />
                            <input className="cv-inp" value={L.label} placeholder='Customer Satisfaction'
                              aria-label="KPI label" style={{ flex: 1 }}
                              onChange={e => upd("label", e.target.value)} />
                            <button className="cv-btn-rm" onClick={rm} aria-label="Remove KPI">✕</button>
                          </div>
                        </div>
                      )}
                    </SItem>
                  ))}
                </div>

                {/* Volunteer Work */}
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🤝 Volunteer Work</h2>
                    <button className="cv-btn-add" aria-label="Add volunteer" onClick={() => addItem("volunteer", {
                      org: "", role: "", start: "", end: "", bullets: "",
                    })}>+ Add</button>
                  </div>
                  {!(data.volunteer || []).length && <div className="cv-empty" role="status">🤝 No volunteer work added yet.</div>}
                  {(data.volunteer || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("volunteer", u)}
                      onRemove={() => removeItem("volunteer", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `vol-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.role || "New Volunteer Role"}{L.org ? " @ " + L.org : ""}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label="Remove volunteer">✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Role *" id={`${bid}-role`}>
                                <input id={`${bid}-role`} className="cv-inp" value={L.role} placeholder="Community Coordinator"
                                  onChange={e => upd("role", e.target.value)} />
                              </Field>
                              <Field label="Organisation" id={`${bid}-org`}>
                                <input id={`${bid}-org`} className="cv-inp" value={L.org} placeholder="Red Crescent"
                                  onChange={e => upd("org", e.target.value)} />
                              </Field>
                              <Field label="Start" id={`${bid}-start`}>
                                <input id={`${bid}-start`} className="cv-inp" value={L.start} placeholder="Jan 2023"
                                  onChange={e => upd("start", e.target.value)} />
                              </Field>
                              <Field label="End" id={`${bid}-end`}>
                                <input id={`${bid}-end`} className="cv-inp" value={L.end} placeholder="Present"
                                  onChange={e => upd("end", e.target.value)} />
                              </Field>
                            </div>
                            <div className="cv-field" style={{ marginTop: 8 }}>
                              <label className="cv-lbl" htmlFor={`${bid}-bullets`}>What you did (one per line)</label>
                              <textarea id={`${bid}-bullets`} className="cv-inp" rows={2}
                                value={L.bullets} placeholder="Coordinated food drives for 200+ families"
                                onChange={e => upd("bullets", e.target.value)} />
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>

                {/* Publications */}
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">📄 Publications</h2>
                    <button className="cv-btn-add" aria-label="Add publication" onClick={() => addItem("publications", {
                      title: "", publisher: "", year: "", url: "",
                    })}>+ Add</button>
                  </div>
                  {!(data.publications || []).length && <div className="cv-empty" role="status">📄 No publications yet.</div>}
                  {(data.publications || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("publications", u)}
                      onRemove={() => removeItem("publications", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `pub-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.title || "New Publication"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label="Remove publication">✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Title *" id={`${bid}-title`} span2>
                                <input id={`${bid}-title`} className="cv-inp" value={L.title}
                                  placeholder="Optimizing HVAC Systems in Gulf Climate"
                                  onChange={e => upd("title", e.target.value)} />
                              </Field>
                              <Field label="Publisher / Journal" id={`${bid}-pub`}>
                                <input id={`${bid}-pub`} className="cv-inp" value={L.publisher}
                                  placeholder="IEEE" onChange={e => upd("publisher", e.target.value)} />
                              </Field>
                              <Field label="Year" id={`${bid}-year`}>
                                <input id={`${bid}-year`} className="cv-inp" value={L.year}
                                  placeholder="2024" onChange={e => upd("year", e.target.value)} />
                              </Field>
                              <Field label="URL" id={`${bid}-url`} span2>
                                <input id={`${bid}-url`} className="cv-inp" value={L.url}
                                  placeholder="doi.org/…" onChange={e => upd("url", e.target.value)} />
                              </Field>
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">📋 References</h2>
                    <button className="cv-btn-add" aria-label="Add reference" onClick={() => addItem("references", {
                      name:"", refTitle:"", company:"", email:"", phone:"", relationship:"Manager",
                    })}>+ Add</button>
                  </div>
                  {!(data.references || []).length && <div className="cv-empty" role="status">📋 No references added.</div>}
                  {(data.references || []).map(item => (
                    <SItem key={item.id} item={item}
                      onUpdate={u => updateItem("references", u)}
                      onRemove={() => removeItem("references", item.id)}>
                      {(L, upd, rm) => {
                        const bid = `ref-${L.id}`;
                        return (
                          <div className="cv-shell">
                            <div className="cv-shell-h">
                              <span className="cv-shell-t">{L.name || "New Reference"}</span>
                              <button className="cv-btn-rm" onClick={rm} aria-label="Remove reference">✕</button>
                            </div>
                            <div className="cv-g2">
                              <Field label="Name *" id={`${bid}-name`}>
                                <input id={`${bid}-name`} className="cv-inp" value={L.name}
                                  placeholder="Dr. Sarah Johnson" onChange={e => upd("name", e.target.value)} />
                              </Field>
                              <Field label="Relationship" id={`${bid}-rel`}>
                                <select id={`${bid}-rel`} className="cv-inp" value={L.relationship}
                                  onChange={e => upd("relationship", e.target.value)}>
                                  {REL_TYPES.map(r => <option key={r}>{r}</option>)}
                                </select>
                              </Field>
                              <Field label="Job Title" id={`${bid}-reftitle`}>
                                <input id={`${bid}-reftitle`} className="cv-inp" value={L.refTitle}
                                  placeholder="Head of Engineering" onChange={e => upd("refTitle", e.target.value)} />
                              </Field>
                              <Field label="Company" id={`${bid}-company`}>
                                <input id={`${bid}-company`} className="cv-inp" value={L.company}
                                  placeholder="Tech Corp" onChange={e => upd("company", e.target.value)} />
                              </Field>
                              <Field label="Email" id={`${bid}-email`}>
                                <input id={`${bid}-email`} className="cv-inp" value={L.email}
                                  placeholder="s@company.com" onChange={e => upd("email", e.target.value)} />
                              </Field>
                              <Field label="Phone" id={`${bid}-phone`}>
                                <input id={`${bid}-phone`} className="cv-inp" value={L.phone}
                                  placeholder="+971…" onChange={e => upd("phone", e.target.value)} />
                              </Field>
                            </div>
                          </div>
                        );
                      }}
                    </SItem>
                  ))}
                </div>

                <button className="cv-btn cv-btn-danger cv-btn-sm"
                  style={{ marginTop: 8, width: "100%", justifyContent: "center", borderRadius: "var(--r)" }}
                  onClick={() => setShowReset(true)}>
                  🗑️ Reset All Data
                </button>
              </div>
            </div>{/* end cv-col-form-scroll */}
            </section>

            {/* ── RIGHT COLUMN: Preview + Templates ── */}
            <div
              className={`cv-col-right${mobileTab !== "edit" ? " m-on" : ""}`}
              id="panel-right"
            >
              {/* Preview / Templates tab strip (desktop only — hidden on mobile) */}
              <div className="cv-right-tabs" role="tablist" aria-label="Right panel">
                <button
                  className={`cv-right-tab${previewTab === "preview" ? " on" : ""}`}
                  role="tab" aria-selected={previewTab === "preview"}
                  onClick={() => setPreviewTab("preview")}
                >
                  👁 Preview
                </button>
                <button
                  className={`cv-right-tab${previewTab === "templates" ? " on" : ""}`}
                  role="tab" aria-selected={previewTab === "templates"}
                  onClick={() => setPreviewTab("templates")}
                >
                  🌟 Templates
                </button>
              </div>

              {/* Controls strip — always visible */}
              <div className="cv-controls-strip" role="group" aria-label="Appearance controls">
                <span className="cv-cs-lbl">Color</span>
                <div className="cv-cs-dots" role="radiogroup" aria-label="Accent colour">
                  {ACCENTS.map(c => {
                    const name = COLOR_NAMES[c] || c;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={`cv-dot${accent === c ? " on" : ""}`}
                        style={{ background: c, "--col": c }}
                        title={name}
                        aria-label={`${name}${accent === c ? " (selected)" : ""}`}
                        aria-pressed={accent === c}
                        onClick={() => setAccent(c)}
                      />
                    );
                  })}
                </div>
                <div className="cv-cs-sep" />
                <span className="cv-cs-lbl">Font</span>
                <select
                  className="cv-cs-font"
                  value={fontId}
                  onChange={e => setFontId(e.target.value)}
                  aria-label="Font family"
                  style={{ fontFamily: FONTS.find(f => f.id === fontId)?.s }}
                >
                  {FONTS.map(f => (
                    <option key={f.id} value={f.id} style={{ fontFamily: f.s }}>{f.l}</option>
                  ))}
                </select>
                <div className="cv-cs-sep" />
                <span className="cv-cs-lbl">Size</span>
                {Object.keys(FSIZES).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`cv-cs-tog${fontSize === s ? " on" : ""}`}
                    aria-pressed={fontSize === s}
                    onClick={() => setFontSize(s)}
                  >
                    {s === "small" ? "S" : s === "medium" ? "M" : "L"}
                  </button>
                ))}
                <div className="cv-cs-sep" />
                <span className="cv-cs-lbl">Paper</span>
                {Object.entries(PAPERS).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    className={`cv-cs-tog${paper === key ? " on" : ""}`}
                    aria-pressed={paper === key}
                    onClick={() => setPaper(key)}
                  >
                    {val.l}
                  </button>
                ))}
              </div>

              {/* Content panel: Preview OR Templates */}
              <div className="cv-right-panel">
                {previewTab === "preview" && (
                  <Preview
                    cvHtml={cvHtml}
                    paperRef={paperRef}
                    paper={paper}
                    PAPERS={PAPERS}
                    fullName={data.fullName}
                    toast={toast}
                    onFieldChange={handlePreviewFieldChange}
                    aiRunning={aiRunning}
                    flashSignal={flashSignal}
                  />
                )}
                {previewTab === "templates" && (
                  <div className="cv-templates-panel">
                    <Templates
                      currentTemplate={tmpl}
                      setTemplate={setTmpl}
                      accent={accent}
                      activeCat={activeCat}
                      setActiveCat={setActiveCat}
                      TEMPLATES={TEMPLATES}
                      CATS={CATS}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── MOBILE BOTTOM NAV (inside cvapp flex flow) ── */}
          <nav className="cv-bottom-nav" role="tablist" aria-label="Sections">
            {[
              { id: "edit",      pt: null,        ico: "✍️", lbl: "Edit"      },
              { id: "preview",   pt: "preview",   ico: "👁",  lbl: "Preview"  },
              { id: "templates", pt: "templates", ico: "🌟", lbl: "Templates" },
            ].map(t => (
              <button
                key={t.id}
                className={`cv-bottom-nav-btn${mobileTab === t.id ? " on" : ""}`}
                role="tab"
                aria-selected={mobileTab === t.id}
                onClick={() => {
                  setMobileTab(t.id);
                  if (t.pt) setPreviewTab(t.pt);
                }}
              >
                <span className="ico" aria-hidden="true">{t.ico}</span>
                <span>{t.lbl}</span>
              </button>
            ))}
          </nav>

      </div>
    </>
  );
}
