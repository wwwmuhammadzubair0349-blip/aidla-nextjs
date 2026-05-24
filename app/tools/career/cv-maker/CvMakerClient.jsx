"use client";
// app/tools/career/cv-maker/CvMakerClient.jsx
// Main orchestrator — state, AI calls, ATS score, layout logic
// v5.0 - Apex Design System Upgrade

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Link from "next/link";
import Templates from "./cv/Templates";
import Preview   from "./cv/Preview";
import Print     from "./cv/Print";
import { buildCvHtml, PREMIUM_TEMPLATES, PREMIUM_CATS } from "./cv/cvRenderer";

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
  --r:      10px;
  --r-sm:   8px;
  --touch:  38px;
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
  background: linear-gradient(160deg,#eef2fb 0%,#fefdf7 55%,#edf7f4 100%);
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
  padding: 10px clamp(8px,3vw,12px) 22px;
  overflow-x: hidden;
}
@media (min-width: 640px) { .cv-wrap { padding: 14px 16px 22px; } }
@media (min-width: 960px) { .cv-wrap { max-width: 1240px; padding: 18px 20px 26px; } }

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
  margin-bottom: 8px; flex-wrap: wrap;
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
  font-size: clamp(1rem,3.8vw,1.75rem);
  font-weight: 900; line-height: 1.1; margin-bottom: 4px;
  word-break: break-word;
}
.cv-grad {
  background: linear-gradient(135deg,#1a3a8f,#2563eb 60%,#0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cv-hero-sub { color: var(--slate); font-size: clamp(.68rem,1.8vw,.78rem); line-height: 1.35; margin-bottom: 6px; }
.cv-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.cv-pill {
  background: rgba(37,99,235,.07); border: 1px solid rgba(37,99,235,.18);
  border-radius: 99px; padding: 2px 7px;
  font-size: .58rem; font-weight: 700; color: #1e3a8a;
}

.cv-ats-wrap { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.cv-ats-ring {
  width: 58px; height: 58px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background .5s;
  box-shadow: 0 2px 10px rgba(217,119,6,.18);
}
.cv-ats-inner {
  width: 44px; height: 44px; border-radius: 50%;
  background: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 5px rgba(0,0,0,.07);
}
.cv-ats-score { font-family:'Sora',sans-serif; font-size: 1rem; font-weight: 900; line-height: 1; }
.cv-ats-lbl { font-size: .36rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: .06em; }
.cv-ats-btn {
  background: none; border: none; font-size: .65rem; font-weight: 700; color: var(--sky);
  min-height: var(--touch); display: flex; align-items: center;
}
.cv-ats-panel {
  display: none;
  grid-template-columns: repeat(auto-fill, minmax(145px,1fr));
  gap: 4px; margin-bottom: 10px;
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 10px;
}
.cv-ats-panel.open { display: grid; }
.cv-ck { display:flex;align-items:center;gap:5px;padding:5px 7px;border-radius:7px;font-size:.62rem;font-weight:700; }
.cv-ck.ok   { background:rgba(4,120,87,.08); color:#064e3b; }
.cv-ck.fail { background:rgba(185,28,28,.07); color:#7f1d1d; }

.cv-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 6px; margin-bottom: 8px; flex-wrap: wrap; width: 100%;
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
  margin-bottom: 8px;
  background: rgba(255,255,255,.85);
  border-radius: 10px; padding: 4px;
  border: 1px solid var(--border); width: 100%;
}
.cv-ftabs::-webkit-scrollbar { display: none; }
.cv-ftab {
  flex: 1; min-width: 38px; height: 38px; padding: 0 4px;
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
  box-shadow: var(--sh); padding: 9px; margin-bottom: 8px;
  width: 100%; overflow: hidden; word-break: break-word;
}
@media (min-width: 640px) { .cv-card { padding: 11px; } }
.cv-start { display:grid; grid-template-columns:1fr; gap:18px; align-items:center; padding:22px 0 28px; }
@media (min-width:900px) { .cv-start { grid-template-columns:1.08fr .92fr; padding:28px 0 34px; } }
.cv-start h1 { font-family:'Sora',sans-serif; font-size:clamp(1.9rem,5vw,3.7rem); line-height:1.08; letter-spacing:0; margin-bottom:12px; max-width:760px; animation:cvRise .55s ease both; }
.cv-start p { color:#374151; font-size:clamp(.86rem,1.6vw,1.05rem); line-height:1.65; max-width:650px; margin-bottom:20px; animation:cvRise .55s .08s ease both; }
.cv-start-actions { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:18px; }
.cv-start-actions .cv-btn { border-radius:7px; min-height:46px; font-size:.9rem; padding:0 18px; animation:cvRise .55s .14s ease both; }
@media (max-width:360px) { .cv-start-actions .cv-btn { width:100%; } }
.cv-start-proof { display:flex; flex-wrap:wrap; gap:16px; color:#374151; font-weight:700; font-size:.82rem; animation:cvRise .55s .2s ease both; }
.cv-stars { color:#10b981; letter-spacing:2px; }
.cv-start-art { display:none; justify-content:center; position:relative; }
@media (min-width:900px) { .cv-start-art { display:flex; } }
.cv-resume-shot { width:min(292px,90%); min-height:360px; background:#fff; border-radius:12px; box-shadow:0 24px 58px rgba(11,20,55,.16); transform:rotate(4deg); padding:20px; animation:cvFloat 4.8s ease-in-out infinite; }
.cv-resume-shot h3 { font-size:1rem; margin-bottom:6px; }
.cv-resume-line { height:6px; border-radius:99px; background:#dbeafe; margin:9px 0; }
.cv-resume-line.dark { background:#111827; width:62%; }
.cv-resume-line.green { background:#10b981; width:42%; }
.cv-ai-float { position:absolute; right:8%; bottom:2%; background:#fff; border-radius:12px; box-shadow:var(--sh-lg); padding:12px; min-width:190px; font-size:.72rem; font-weight:700; animation:cvRise .7s .22s ease both; }
.cv-scan { position:fixed; inset:0; z-index:9998; display:grid; place-items:center; background:rgba(238,242,251,.78); backdrop-filter:blur(12px); }
.cv-scan-box { width:min(420px,calc(100vw - 32px)); background:#fff; border:1px solid var(--border); border-radius:16px; box-shadow:var(--sh-lg); padding:22px; text-align:center; }
.cv-scan-doc { height:210px; border-radius:12px; background:linear-gradient(#fff,#f8fafc); border:1px solid #dbeafe; margin-bottom:16px; position:relative; overflow:hidden; padding:24px; }
.cv-scan-doc::after { content:""; position:absolute; left:0; right:0; top:-35%; height:34%; background:linear-gradient(180deg,transparent,rgba(16,185,129,.35),transparent); animation:cvScan 1.25s linear infinite; }
.cv-scan-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1rem; margin-bottom:6px; }
.cv-scan-sub { color:var(--slate); font-size:.78rem; }
@keyframes cvRise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
@keyframes cvFloat { 0%,100%{transform:rotate(4deg) translateY(0)} 50%{transform:rotate(3deg) translateY(-10px)} }
@keyframes cvScan { to{top:105%} }
.cv-report {
  display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:14px;align-items:start;
  background:linear-gradient(135deg,#f8fbff,#fff);
  border:1px solid rgba(37,99,235,.16);border-radius:18px;
  padding:14px;box-shadow:0 18px 50px rgba(15,23,42,.08);
}
@media (min-width:920px){.cv-report{grid-template-columns:260px minmax(0,1fr);padding:18px;}}
.cv-report-side{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:14px;text-align:center;box-shadow:var(--sh);}
.cv-report-score{font-family:'Sora',sans-serif;font-size:2.45rem;font-weight:900;color:#f59e0b;line-height:1;margin:8px 0 4px;}
.cv-report-meter{height:9px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin:16px 0;}
.cv-report-fill{height:100%;background:linear-gradient(90deg,#ef4444,#f59e0b,#10b981);border-radius:99px;transition:width .6s ease;}
.cv-report-pill{display:inline-flex;align-items:center;justify-content:center;border-radius:99px;padding:5px 10px;font-size:.68rem;font-weight:800;background:#eff6ff;color:#1e3a8a;border:1px solid #bfdbfe;}
.cv-report-main{background:#eaf0fb;border-radius:18px;padding:clamp(8px,3vw,14px);align-self:start;min-width:0;}
.cv-report-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap;}
.cv-report-title{font-family:'Sora',sans-serif;font-size:1.25rem;font-weight:900;color:#0f172a;letter-spacing:0;}
.cv-report-count{background:#fff;border-radius:99px;padding:8px 14px;font-size:.76rem;font-weight:800;color:#0f172a;}
.cv-report-top-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.cv-report-top-actions .cv-btn{min-height:36px;border-radius:99px;font-size:.72rem;padding:0 14px;}
.cv-report-print [data-print-ignore] button{min-height:36px!important;padding:0 14px!important;border-radius:99px!important;font-size:.72rem!important;box-shadow:var(--sh)!important;white-space:nowrap!important;}
.cv-audit-print-src{position:absolute;left:-99999px;top:0;width:794px;pointer-events:none;opacity:0;}
.cv-report-grid{display:grid;gap:10px;}
.cv-report-section{background:#fff;border:1px solid #dbeafe;border-radius:14px;padding:14px;}
.cv-report-section h3{font-size:.88rem;font-weight:900;color:#0f172a;margin-bottom:10px;text-transform:uppercase;letter-spacing:.03em;}
.cv-report-row{display:flex;gap:8px;align-items:flex-start;padding:8px 9px;border-radius:10px;margin-top:7px;font-size:.72rem;line-height:1.35;color:#334155;background:#f8fafc;}
.cv-report-row.bad{background:#fff1f2;color:#7f1d1d;}
.cv-report-row.good{background:#ecfdf5;color:#064e3b;}
.cv-report-row.fix{background:#eff6ff;color:#1e3a8a;}
.cv-report-icon{font-weight:900;flex:0 0 auto;}
.cv-report-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}
.cv-compare{--cmp-scale:.35;position:relative;height:421px;background:#fff;border:1px solid #dbeafe;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08);}
@media (min-width:360px){.cv-compare{--cmp-scale:.4;height:477px;}}
@media (min-width:440px){.cv-compare{--cmp-scale:.5;height:590px;}}
@media (min-width:560px){.cv-compare{--cmp-scale:.62;height:724px;}}
@media (min-width:700px){.cv-compare{--cmp-scale:.76;height:880px;}}
.cv-compare-page{position:absolute;inset:0;background:#fff;border-radius:16px;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;padding:14px;}
.cv-compare-paper{width:794px;height:1123px;overflow:hidden;background:#fff;transform:scale(var(--cmp-scale));transform-origin:top center;box-shadow:0 6px 22px rgba(15,23,42,.12);}
.cv-compare-paper .cv-doc{width:794px!important;min-height:1123px!important;}
.cv-compare-old{padding:22px;color:#334155;font-size:.58rem;line-height:1.35;white-space:pre-wrap;font-family:Arial,sans-serif;}
.cv-compare-old.has-image{padding:12px;}
.cv-compare-old img{width:100%;height:100%;object-fit:contain;display:block;background:#fff;}
.cv-compare-old h4{font-size:1rem;color:#0f172a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em;}
.cv-compare-old .line{height:5px;background:#e2e8f0;border-radius:99px;margin:7px 0;}
.cv-compare-old .dark{background:#0f172a;width:55%;}
.cv-compare-old .blue{background:#2563eb;width:35%;}
.cv-compare-new{clip-path:inset(0 0 0 var(--split,50%));transition:clip-path .9s cubic-bezier(.2,.8,.2,1);}
.cv-compare-new #cv-paper{box-shadow:none!important;}
.cv-compare-label{position:absolute;top:14px;z-index:4;background:#0f172a;color:#fff;border-radius:99px;padding:5px 10px;font-size:.65rem;font-weight:900;box-shadow:var(--sh);}
.cv-compare-label.old{left:18px;background:#64748b;}
.cv-compare-label.new{right:18px;background:#1e3a8a;}
.cv-compare-line{position:absolute;top:0;bottom:0;left:var(--split,50%);width:2px;background:#2563eb;z-index:5;box-shadow:0 0 0 9999px transparent;transition:left .9s cubic-bezier(.2,.8,.2,1);}
.cv-compare-knob{position:absolute;top:50%;left:var(--split,50%);z-index:6;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid #2563eb;display:grid;place-items:center;font-weight:900;color:#1e3a8a;box-shadow:var(--sh-lg);pointer-events:none;transition:left .9s cubic-bezier(.2,.8,.2,1);}
.cv-compare-range{position:absolute;inset:0;z-index:7;opacity:0;cursor:ew-resize;}
.cv-compare-note{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;color:#475569;font-size:.76rem;font-weight:700;}
.cv-compare-ai{display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;border-radius:99px;padding:5px 10px;font-size:.68rem;font-weight:900;}
@media (max-width:360px){.cv-compare-note{align-items:flex-start;flex-direction:column}.cv-compare-label{font-size:.58rem;padding:4px 7px}.cv-compare-knob{width:32px;height:32px}}
.cv-card-h { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:6px;flex-wrap:wrap; }
.cv-card-t { font-family:'Sora',sans-serif;font-size:clamp(.72rem,2.3vw,.8rem);font-weight:800;color:var(--navy);margin:0; }

.cv-g2 { display:grid;grid-template-columns:1fr;gap:6px; }
@media (min-width:380px) { .cv-g2 { grid-template-columns:repeat(2,1fr); } }
.cv-span2 { grid-column:1/-1; }

.cv-field { display:flex;flex-direction:column;gap:4px;min-width:0; }
.cv-lbl { font-size:.52rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#374151; }
.cv-inp {
  width:100%;min-width:0;
  padding:0 9px;height:34px;
  border-radius:var(--r-sm);
  border:1.5px solid rgba(37,99,235,.2);
  background:#fff;font-size:.72rem;font-weight:500;
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
textarea.cv-inp { height:auto;min-height:64px;padding:8px 9px;resize:vertical;line-height:1.45; }

.cv-phone-row { display:grid;grid-template-columns:88px 1fr;gap:6px; }
@media (max-width:340px) { .cv-phone-row { grid-template-columns:1fr; } }

.cv-photo-row {
  display:flex;align-items:center;gap:9px;margin-top:8px;padding:9px;
  background:#f8fafc;border-radius:10px;border:1px solid var(--border);flex-wrap:wrap;
}
.cv-photo-thumb {
  width:44px;height:44px;border-radius:50%;border:2px solid var(--border);
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
  margin-top:6px;padding:8px;
  background:#f8fafc;border-radius:10px;border:1px solid var(--border);
  transition:box-shadow .15s;width:100%;overflow:hidden;word-break:break-word;
}
.cv-shell:focus-within { box-shadow:0 0 0 2px rgba(217,119,6,.2); }
.cv-shell-h { display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px; }
.cv-shell-t { font-size:.72rem;font-weight:700;color:var(--slate);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0; }
.cv-empty {
  display:flex;align-items:center;gap:8px;padding:9px;color:var(--slate);
  font-size:.68rem;font-weight:600;border-radius:10px;background:#f8fafc;
  border:1.5px dashed rgba(37,99,235,.18);
}

.cv-btn {
  display:inline-flex;align-items:center;justify-content:center;gap:5px;
  min-height:34px;padding:0 11px;
  border-radius:8px;border:none;font-size:.68rem;font-weight:800;
  cursor:pointer;transition:transform .12s,box-shadow .12s,background .1s;
  white-space:nowrap;-webkit-tap-highlight-color:transparent;text-decoration:none;
  max-width:100%;
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
  font-size:.66rem;padding:0 9px;min-height:32px;
}
.cv-btn-sm { font-size:.68rem;padding:0 10px;min-height:32px; }
.cv-btn-add {
  display:inline-flex;align-items:center;gap:4px;
  min-height:32px;padding:0 10px;border-radius:99px;border:none;
  background:linear-gradient(135deg,var(--gold),var(--gold-l));
  color:#1c1917;font-size:.68rem;font-weight:800;
  cursor:pointer;box-shadow:0 2px 7px rgba(217,119,6,.22);
  transition:transform .12s;-webkit-tap-highlight-color:transparent;
}
.cv-btn-add:hover { transform:scale(1.04); }
.cv-btn-rm {
  display:inline-flex;align-items:center;justify-content:center;
  min-height:28px;min-width:28px;padding:0 6px;
  background:#fff;border:1px solid rgba(185,28,28,.25);color:#7f1d1d;
  border-radius:7px;font-size:.67rem;font-weight:700;
  cursor:pointer;flex-shrink:0;transition:background .1s;
  -webkit-tap-highlight-color:transparent;
}
.cv-btn-rm:hover { background:rgba(185,28,28,.07); }
.cv-ai-btn {
  display:inline-flex;align-items:center;gap:4px;
  min-height:30px;padding:0 9px;border-radius:99px;
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
  .cv-grid { display:grid;grid-template-columns:350px minmax(0,1fr);gap:10px;align-items:start;overflow:visible; }
  .cv-col-form,.cv-col-prev{height:auto;overflow:visible;padding-right:0;}
  .cv-col-prev { min-width: 0; }
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
.cv-drop {
  display:grid;place-items:center;gap:8px;text-align:center;
  min-height:180px;margin:14px 0;padding:24px;border-radius:18px;
  border:2px dashed #bfdbfe;background:linear-gradient(180deg,#f8fbff,#eef6ff);
  color:#1e3a8a;cursor:pointer;transition:.16s;
}
.cv-drop.drag { border-color:#2563eb;background:#eff6ff;transform:scale(1.01); }
.cv-drop input { display:none; }
.cv-drop strong { font-size:1rem;font-weight:900;color:#0f172a; }
.cv-drop span { font-size:.75rem;font-weight:700;color:#64748b; }
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
const jsonFromAi = v => JSON.parse(String(v || "").replace(/^```(?:json)?|```$/g, "").trim());
const txt = v => Array.isArray(v) ? v.join("\n") : String(v || "");
const skills10 = v => txt(v).split(/[\n,]+/).map(s => s.trim()).filter(Boolean).slice(0, 10).join(", ");
const score100 = (v, fallback = 0) => {
  let n = Number(v);
  if (!Number.isFinite(n)) n = fallback;
  if (n > 0 && n <= 10) n *= 10;
  return Math.max(0, Math.min(100, Math.round(n)));
};
const auditPrompt = text => `Audit this CV honestly and rewrite it into a premium, full, ATS-friendly CV.

Return ONLY valid JSON:
{
  "data": {
    "fullName": "", "title": "", "email": "", "phone": "", "location": "",
    "linkedin": "", "summary": "", "skills": "",
    "experience": [{ "role": "", "company": "", "city": "", "start": "", "end": "", "bullets": "" }],
    "education": [{ "degree": "", "school": "", "city": "", "start": "", "end": "", "notes": "" }],
    "projects": [{ "name": "", "tech": "", "status": "", "bullets": "" }],
    "certifications": [{ "name": "", "issuer": "", "year": "" }]
  },
  "audit": {
    "score": 0,
    "level": "",
    "issues": [],
    "strengths": [],
    "fixes": []
  },
  "recommended": { "template": "executive-split" }
}

Scoring rules:
- 90-100 exceptional, quantified, targeted, ATS-safe
- 75-89 strong but needs small fixes
- 55-74 average/generic/missing proof
- 35-54 weak structure or missing core sections
- 0-34 unreadable, very incomplete, or non-CV
Never give the same score by default. Base score on actual CV quality, keyword depth, metrics, gaps, formatting, and recruiter risk.
Rewrite rules:
- Preserve EVERY real job, project, education item, award, certification, tool, city, date, and metric from the uploaded CV.
- Do NOT compress a detailed CV into a short CV.
- If the uploaded CV is too long, tighten wording to a professional 1-2 page limit while keeping all important evidence.
- If the uploaded CV is short, expand only from the user's real context; do not invent employers, degrees, dates, tools, awards, or metrics.
- Summary must be 3-4 strong lines.
- Each experience role must have 4-6 ATS bullet lines when source detail exists.
- Each project must have 2-3 ATS bullet lines when source detail exists.
- Keep achievements specific: scope, tools, standards, systems, numbers, locations, and outcomes.
- Limit skills to the best 10 comma-separated ATS skills.
- Use human senior CV writing, not generic two-line summaries.

CV:
${text}`;
const normalizeAudit = (audit = {}, fallbackScore = 0) => ({
  score: score100(audit.score, fallbackScore),
  level: audit.level || "",
  issues: Array.isArray(audit.issues) ? audit.issues.filter(Boolean) : [],
  strengths: Array.isArray(audit.strengths) ? audit.strengths.filter(Boolean) : [],
  fixes: Array.isArray(audit.fixes) ? audit.fixes.filter(Boolean) : [],
});

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
  answerBlocks, trustStats, templates, features, audiences, regions
}) {
  const [data,      setData]      = useState(INIT_DATA);
  const [tmpl,      setTmpl]      = useState("modern-stack");
  const [accent,    setAccent]    = useState("#1e3a8a");
  const [fontId,    setFontId]    = useState("outfit");
  const [fontSize,  setFontSize]  = useState("medium");
  const [paper,     setPaper]     = useState("a4");
  const [zoom,      setZoom]      = useState(1);
  const [activeTab, setActiveTab] = useState("personal");
  const [mainTab,   setMainTab]   = useState("edit");
  const [activeCat, setActiveCat] = useState("All");
  const [atsOpen,   setAtsOpen]   = useState(false);
  const [toasts,    setToasts]    = useState([]);
  const [aiLoading, setAiLoading] = useState({});
  const [started,   setStarted]   = useState(false);
  const [aiAudit,   setAiAudit]   = useState(null);
  const [auditView, setAuditView] = useState(false);
  const [comparePos, setComparePos] = useState(88);
  const [originalCvText, setOriginalCvText] = useState("");
  const [originalCvImage, setOriginalCvImage] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [draggingCv, setDraggingCv] = useState(false);

  const prevScrollRef = useRef(null);
  const paperRef      = useRef(null);
  const auditPaperRef = useRef(null);
  const saveTimer     = useRef(null);

  const toast = useCallback((msg, type = "inf", dur = 3200) => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), dur);
  }, []);
  const dismissToast = id => setToasts(t => t.filter(x => x.id !== id));

  useEffect(() => {
    document.body.dataset.cvMakerStarted = started ? "1" : "0";
    return () => { delete document.body.dataset.cvMakerStarted; };
  }, [started]);
  useEffect(() => {
    if (!auditView || !aiAudit) return;
    setComparePos(88);
    const t = setTimeout(() => setComparePos(12), 350);
    return () => clearTimeout(t);
  }, [auditView, aiAudit]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, tmpl, accent, fontId, fontSize, paper })); } catch {}
    }, 400);
  }, [data, tmpl, accent, fontId, fontSize, paper]);

  const fitZoom = useCallback(() => {
    if (!prevScrollRef.current) return;
    const cw = prevScrollRef.current.clientWidth - 20;
    setZoom(Math.min(1, +(cw / PAPERS[paper].w).toFixed(3)));
  }, [paper]);

  useEffect(() => { fitZoom(); }, [fitZoom, paper]);
  useEffect(() => {
    window.addEventListener("resize", fitZoom);
    return () => window.removeEventListener("resize", fitZoom);
  }, [fitZoom]);

  useEffect(() => {
    const pp = paperRef.current;
    if (!pp) return;
    const { w, h } = PAPERS[paper];
    pp.style.width = `${w}px`;
    pp.style.minHeight = `${h}px`;
    pp.style.transform = `scale(${zoom})`;
    pp.style.transformOrigin = "top left";
    pp.style.position = "absolute";
    pp.style.left = "0";
    pp.style.top = "0";
    const sc = pp.parentElement;
    if (sc) {
      sc.style.width = `${w * zoom}px`;
      sc.style.minHeight = `${h * zoom}px`;
      sc.style.height = "auto";
    }
  }, [zoom, paper]);

  useEffect(() => { if (mainTab === "preview") setTimeout(fitZoom, 50); }, [mainTab, fitZoom]);

  const sf         = (k, v) => setData(d => ({ ...d, [k]: v }));
  const addItem    = (sec, tpl) => setData(d => ({ ...d, [sec]: [...(d[sec] || []), { id: uid(), ...tpl }] }));
  const removeItem = (sec, id)  => setData(d => ({ ...d, [sec]: d[sec].filter(x => x.id !== id) }));
  const updateItem = (sec, upd) => setData(d => ({ ...d, [sec]: d[sec].map(x => x.id === upd.id ? upd : x) }));

  const uploadPhoto = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast("Pick an image file", "err");
    if (f.size > 5e6)                  return toast("Max 5MB", "err");
    const r = new FileReader();
    r.onload = ev => { sf("photoDataUrl", ev.target.result); toast("Photo uploaded ✅", "ok"); };
    r.readAsDataURL(f);
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

  const importJSON = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const o = JSON.parse(ev.target.result);
        if (o.data)     setData(d => ({ ...d, ...o.data }));
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

  const resetAll = () => {
    if (!window.confirm("Reset all CV data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setData(INIT_DATA());
    setTmpl("modern-stack");
    setAccent("#1e3a8a");
    setFontId("outfit");
    setFontSize("medium");
    setPaper("a4");
    toast("Reset complete ✅", "ok");
  };

  const callClaude = async (prompt, mode, max_tokens = 2400) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cv-ai`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, mode, max_tokens }) }
    );
    const json = await res.json();
    return json.result || "";
  };

  const extractCvText = async (file) => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc ||= new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const first = await pdf.getPage(1);
      const viewport = first.getViewport({ scale: 1.25 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        await first.render({ canvasContext: ctx, viewport }).promise;
        setOriginalCvImage(canvas.toDataURL("image/jpeg", 0.88));
      }
      const out = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        out.push(text.items.map(x => x.str).join(" "));
      }
      return out.join("\n");
    }
    if (file.name.toLowerCase().endsWith(".docx")) {
      const mammoth = await import("mammoth/mammoth.browser");
      const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return r.value || "";
    }
    return file.text();
  };

  const hydrateCvData = (src = {}) => {
    const p = String(src.phone || "").match(/^(\+\d{1,4})?\s*(.*)$/) || [];
    return {
      ...INIT_DATA(),
      ...src,
      phoneCode: p[1] || data.phoneCode || "+971",
      phoneNum: src.phoneNum || p[2] || src.phone || "",
      skills: skills10(src.skills),
      experience: (src.experience || []).map(x => ({
        id: uid(), role: x.role || "", company: x.company || "", city: x.city || "",
        start: x.start || x.startDate || "", end: x.end || x.endDate || "",
        current: /present|current/i.test(x.end || x.endDate || ""), empType: x.empType || "Full-time",
        industry: x.industry || "", bullets: txt(x.bullets),
      })),
      education: (src.education || []).map(x => ({
        id: uid(), degType: x.degType || "Bachelor's Degree", degree: x.degree || x.subject || "",
        school: x.school || x.institution || "", city: x.city || "", gpa: x.gpa || "",
        start: x.start || x.startYear || "", end: x.end || x.endYear || "", notes: x.notes || "",
      })),
      projects: (src.projects || []).map(x => ({ id: uid(), name: x.name || "", tech: x.tech || "", url: x.url || "", status: x.status || "Completed", bullets: txt(x.bullets || x.description) })),
      certifications: (src.certifications || []).map(x => ({ id: uid(), name: x.name || "", issuer: x.issuer || "", year: x.year || "", credId: x.credId || "", expiry: x.expiry || "" })),
      languages: (src.languages || []).map(x => ({ id: uid(), lang: x.lang || x.language || "", level: x.level || "Professional" })),
    };
  };

  const handleCvFile = async (file) => {
    if (!file) return;
    setAiLoading(l => ({ ...l, upload: true }));
    setOriginalCvImage("");
    toast("Reading CV…", "inf", 8000);
    try {
      const text = await extractCvText(file);
      if (text.trim().length < 80) throw new Error("Could not read enough text");
      setOriginalCvText(text);
      toast("AI auditing CV…", "inf", 12000);
      const parsed = jsonFromAi(await callClaude(auditPrompt(text.slice(0, 48000)), "parse_audit", 4500));
      const nextData = hydrateCvData(parsed.data || parsed);
      setData(nextData);
      setAiAudit(normalizeAudit(parsed.audit, 0));
      if (parsed.recommended?.template) setTmpl(parsed.recommended.template);
      setStarted(true);
      setAuditView(true);
      setAtsOpen(true);
      setUploadOpen(false);
      toast("CV imported and audited", "ok");
    } catch (err) {
      toast(err?.message || "CV upload failed", "err");
    } finally {
      setAiLoading(l => ({ ...l, upload: false }));
    }
  };

  const uploadCv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    await handleCvFile(file);
  };

  const aiSummary = async () => {
    setAiLoading(l => ({ ...l, summary: true }));
    toast("AI writing summary…", "inf", 8000);
    try {
      const sk = lines(data.skills).slice(0, 6).join(", ") || "various skills";
      const expLine = (data.experience || []).slice(0, 2).map(e => `${e.role} at ${e.company}`).join("; ");
      const existing = data.summary?.trim();
      const text = await callClaude(
        `You are an expert CV writer. ${existing
          ? `Improve and expand this existing summary: "${existing}"\n\nUse this additional context:`
          : "Write a punchy 2-3 sentence professional CV summary using this context:"}
Job Title: ${data.title || "Professional"}
Skills: ${sk}
Experience: ${expLine || "Not specified"}
Rules:
- 2-3 sentences maximum
- Start with a strong action word
- Quantify impact where logical
- Output only the summary text, no labels or preamble`
      );
      if (text) { sf("summary", text); toast("Summary written ✅", "ok"); }
    } catch { toast("AI error — check console", "err"); }
    finally   { setAiLoading(l => ({ ...l, summary: false })); }
  };

  const aiCompass = async () => {
    setAiLoading(l => ({ ...l, compass: true }));
    toast("AI writing professional compass…", "inf", 8000);
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
      if (text) { sf("compass", text); toast("Professional compass written ✅", "ok"); }
    } catch { toast("AI error", "err"); }
    finally { setAiLoading(l => ({ ...l, compass: false })); }
  };

  const aiSkills = async () => {
    setAiLoading(l => ({ ...l, skills: true }));
    try {
      const expLine = (data.experience || []).slice(0, 3).map(e => `${e.role} at ${e.company}`).join(", ");
      const text = await callClaude(
        `You are an expert CV writer. Generate exactly 10 ATS-optimized professional skills for:
Name: ${data.fullName || "Professional"}
Job Title: ${data.title || "Professional"}
Experience: ${expLine || "Not specified"}
Summary: ${data.summary || "Not specified"}
Rules:
- Comma-separated on one line
- Mix technical and soft skills relevant to their role
- No bullets, numbers, or preamble
- Just the skill names`
      );
      if (text) { sf("skills", skills10(text)); toast("Skills added ✅", "ok"); }
    } catch { toast("AI error", "err"); }
    finally   { setAiLoading(l => ({ ...l, skills: false })); }
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
    let sc = 0;
    const checks = [];
    const ck = (ok, msg, pts) => { if (ok) sc += pts; checks.push({ ok, msg }); };

    ck(d.fullName?.trim(),                                                            "Full name present",                 8);
    ck(d.email?.trim(),                                                               "Email address",                     8);
    ck(d.phoneNum?.trim(),                                                            "Phone number",                      5);
    ck(d.location?.trim(),                                                            "Location present",                  5);
    ck((d.summary || d.compass || "").length > 60,                                     "Professional summary (60+ chars)",  15);
    const sk = lines(d.skills).length;
    ck(sk >= 6,                                                                       `${sk} skills listed (aim 6+)`,     12);
    const ex = (d.experience || []).filter(x => (x.role || x.company || "").trim()).length;
    ck(ex >= 1,                                                                       `${ex} experience entr${ex === 1 ? "y" : "ies"}`, 18);
    ck((d.education || []).filter(x => (x.degree || x.school || "").trim()).length >= 1, "Education section",             10);
    ck(d.linkedin?.trim(),                                                            "LinkedIn URL added",                5);
    ck((d.certifications || []).filter(x => x.name?.trim()).length >= 1,              "Certifications added",             5);
    ck((d.experience || []).some(x => txt(x.bullets).trim().length > 10),         "Achievement bullets in experience", 9);

    return { score: Math.min(sc, 100), checks };
  }, [data]);

  const atsColor = atsScore >= 80 ? "#047857" : atsScore >= 50 ? "#d97706" : "#b91c1c";

  const cvHtml = useMemo(
    () => buildCvHtml(data, tmpl, accent, fontId, fontSize, paper, FONTS, FSIZES, PAPERS),
    [data, tmpl, accent, fontId, fontSize, paper]
  );
  const compareCvHtml = useMemo(
    () => buildCvHtml(data, "executive-split", "#1683ff", fontId, fontSize, paper, FONTS, FSIZES, PAPERS),
    [data, fontId, fontSize, paper]
  );
  const reportScore = score100(aiAudit?.score, 0);
  const originalPreview = useMemo(() => lines(originalCvText).slice(0, 20), [originalCvText]);

  return (
    <>
      <style>{APP_CSS}</style>

      <div className="cv-bg" aria-hidden="true" />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
      {uploadOpen && (
        <div className="cv-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setUploadOpen(false)}>
          <div className="cv-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Upload CV</h2>
            <label
              className={`cv-drop${draggingCv ? " drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDraggingCv(true); }}
              onDragLeave={() => setDraggingCv(false)}
              onDrop={e => {
                e.preventDefault();
                setDraggingCv(false);
                handleCvFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input type="file" accept=".pdf,.docx,.txt" onChange={uploadCv} disabled={!!aiLoading.upload} />
              <strong>{aiLoading.upload ? "Reading CV..." : "Drop your CV here"}</strong>
              <span>PDF, DOCX, or TXT - or select from device</span>
            </label>
            <button className="cv-btn cv-btn-ghost" style={{ width: "100%" }} onClick={() => setUploadOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      {aiLoading.upload && (
        <div className="cv-scan" role="status" aria-live="polite">
          <div className="cv-scan-box">
            <div className="cv-scan-doc">
              <div className="cv-resume-line dark" />
              <div className="cv-resume-line green" />
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="cv-resume-line" style={{ width: `${50 + (i % 4) * 10}%` }} />)}
            </div>
            <div className="cv-scan-title">Building your job-winning CV</div>
            <div className="cv-scan-sub">AI is preserving your details, rewriting weak sections, and fitting a full ATS CV into AIDLA templates.</div>
          </div>
        </div>
      )}

      <div className="cvapp">
        <div className="cv-wrap">

          {started && !auditView && <header className="cv-hero">
            <div className="cv-hero-l">
              <nav aria-label="Breadcrumb" style={{ fontSize: ".65rem", color: "#94a3b8", marginBottom: 6, display: "flex", gap: 4, alignItems: "center" }}>
                <Link href="/" style={{ color: "#1a3a8f", textDecoration: "none", fontWeight: 600 }}>Home</Link>
                <span aria-hidden="true">›</span>
                <Link href="/tools" style={{ color: "#1a3a8f", textDecoration: "none", fontWeight: 600 }}>Tools</Link>
                <span aria-hidden="true">›</span>
                <Link href="/tools/career" style={{ color: "#1a3a8f", textDecoration: "none", fontWeight: 600 }}>Career</Link>
                <span aria-hidden="true">›</span>
                <span style={{ color: "#0b1437", fontWeight: 700 }} aria-current="page">CV Maker</span>
              </nav>
              <span className="cv-badge">🧑‍💼 Career Tools</span>
              <h1>Professional <span className="cv-grad">CV Maker</span></h1>
              <p className="cv-hero-sub">
                AI-powered · 17 premium templates · ATS checker · perfect PDF. 100% free.
              </p>
              <ul className="cv-pills" role="list" aria-label="Features">
                {["17 Templates","AI Writing","ATS Score","PDF Print"].map(p => (
                  <li key={p} className="cv-pill">✓ {p}</li>
                ))}
              </ul>
            </div>

            <div className="cv-ats-wrap">
              <div
                className="cv-ats-ring"
                style={{ background: `conic-gradient(${atsColor} ${atsScore}%, #e2e8f0 ${atsScore}%)` }}
                role="meter"
                aria-valuenow={atsScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`ATS score: ${atsScore} out of 100`}
              >
                <div className="cv-ats-inner">
                  <span className="cv-ats-score" aria-hidden="true">{atsScore}</span>
                  <span className="cv-ats-lbl" aria-hidden="true">ATS Score</span>
                </div>
              </div>
              <button className="cv-ats-btn" onClick={() => setAtsOpen(o => !o)} aria-expanded={atsOpen}
                aria-controls="ats-panel">
                {atsOpen ? "Hide ↑" : "Checks ↓"}
              </button>
            </div>
          </header>}

          {!started && (
            <section className="cv-start" aria-label="Start CV maker">
              <div>
                <h1>Land more interviews with AIDLA's <span className="cv-grad">CV Maker</span></h1>
                <p>ATS check, AI writing, and one-click template fitting help your CV stand out to recruiters.</p>
                <div className="cv-start-actions">
                  <button className="cv-btn cv-btn-primary" type="button" onClick={() => setStarted(true)}>Start From Scratch</button>
                  <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setUploadOpen(true)} disabled={!!aiLoading.upload}>
                    {aiLoading.upload ? "Reading CV…" : "Upload Existing CV"}
                  </button>
                  <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setUploadOpen(true)} disabled={!!aiLoading.upload}>
                    Check ATS Score
                  </button>
                </div>
                <div className="cv-start-proof">
                  <span><span className="cv-stars">★★★★★</span> 5,247 Reviews</span>
                  <span>28,452 users improved CVs last month</span>
                </div>
              </div>
              <div className="cv-start-art" aria-hidden="true">
                <div className="cv-resume-shot">
                  <h3>ETHAN SMITH</h3>
                  <div className="cv-resume-line green" />
                  <div className="cv-resume-line dark" />
                  {Array.from({ length: 15 }).map((_, i) => <div key={i} className="cv-resume-line" style={{ width: `${45 + (i % 5) * 10}%` }} />)}
                </div>
                <div className="cv-ai-float">AI ASSISTANT<br />Generate Skills from Job<br />Improve my bullets</div>
              </div>
            </section>
          )}

          {started && (
            <>
          {auditView && aiAudit && (
            <section className="cv-report" aria-label="AI CV audit report">
              <aside className="cv-report-side">
                <div style={{ fontSize: ".82rem", fontWeight: 900, color: "#0f172a" }}>Your CV Score</div>
                <div className="cv-report-score">{reportScore}<span style={{ fontSize: "1rem", color: "#64748b" }}>/100</span></div>
                <div className="cv-report-pill">{aiAudit.level || (reportScore >= 80 ? "Excellent" : reportScore >= 55 ? "Good" : "Needs work")}</div>
                <div className="cv-report-meter"><div className="cv-report-fill" style={{ width: `${reportScore}%` }} /></div>
                <div style={{ display: "grid", gap: 8, textAlign: "left", marginTop: 14 }}>
                  <div className="cv-report-row bad"><span className="cv-report-icon">x</span><span>{aiAudit.issues?.length || 0} issues found</span></div>
                  <div className="cv-report-row good"><span className="cv-report-icon">✓</span><span>{aiAudit.strengths?.length || 0} strong areas</span></div>
                  <div className="cv-report-row fix"><span className="cv-report-icon">+</span><span>{aiAudit.fixes?.length || 0} suggested fixes</span></div>
                </div>
                {!!aiAudit.issues?.length && (
                  <div style={{ marginTop: 14, textAlign: "left" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 900, color: "#7f1d1d", marginBottom: 6, textTransform: "uppercase" }}>Critical Issues</div>
                    {aiAudit.issues.slice(0, 5).map((x, i) => <div key={`side-i${i}`} className="cv-report-row bad"><span className="cv-report-icon">x</span><span>{x}</span></div>)}
                  </div>
                )}
                <div className="cv-report-grid" style={{ marginTop: 14, textAlign: "left" }}>
                  {!!aiAudit.fixes?.length && (
                    <div className="cv-report-section">
                      <h3>Recommended Fixes</h3>
                      {aiAudit.fixes.slice(0, 5).map((x, i) => <div key={`rf${i}`} className="cv-report-row fix"><span className="cv-report-icon">+</span><span>{x}</span></div>)}
                    </div>
                  )}
                  {!!aiAudit.strengths?.length && (
                    <div className="cv-report-section">
                      <h3>Strong Areas</h3>
                      {aiAudit.strengths.slice(0, 4).map((x, i) => <div key={`rs${i}`} className="cv-report-row good"><span className="cv-report-icon">✓</span><span>{x}</span></div>)}
                    </div>
                  )}
                </div>
                <div className="cv-report-actions">
                  <button className="cv-btn cv-btn-primary" onClick={() => { setAuditView(false); setMainTab("templates"); setTmpl("executive-split"); setAtsOpen(false); }}>
                    Get your AIDLA Job Winning CV
                  </button>
                  <button className="cv-btn cv-btn-ghost" type="button" onClick={() => setUploadOpen(true)} disabled={!!aiLoading.upload}>
                    Upload Another CV
                  </button>
                </div>
              </aside>

              <div className="cv-report-main">
                <div className="cv-report-head">
                  <div>
                    <div className="cv-report-title">Resume Check Report</div>
                    <div style={{ color: "#475569", fontSize: ".82rem", marginTop: 4 }}>AI reviewed your uploaded CV and prepared it for AIDLA templates.</div>
                  </div>
                  <div className="cv-report-top-actions">
                    <div className="cv-report-print">
                      <Print paperRef={auditPaperRef} paper={paper} fullName={data.fullName} toast={toast} />
                    </div>
                    <button className="cv-btn cv-btn-ghost" onClick={() => { setAuditView(false); setMainTab("templates"); setTmpl("executive-split"); setAtsOpen(false); }}>
                      More Templates
                    </button>
                    <span className="cv-report-count">{(aiAudit.issues?.length || 0) + (aiAudit.fixes?.length || 0)} findings</span>
                  </div>
                </div>
                <div className="cv-audit-print-src" ref={auditPaperRef} dangerouslySetInnerHTML={{ __html: compareCvHtml }} />

                <div className="cv-compare-note">
                  <span>Drag to compare uploaded CV with AIDLA's rewritten template</span>
                  <span className="cv-compare-ai">AI filled gaps + rewrote weak sections</span>
                </div>
                <div className="cv-compare" style={{ "--split": `${comparePos}%` }}>
                  <span className="cv-compare-label old">Uploaded CV</span>
                  <span className="cv-compare-label new">AIDLA CV</span>
                  <div className={`cv-compare-page cv-compare-old ${originalCvImage ? "has-image" : ""}`}>
                    {originalCvImage ? <div className="cv-compare-paper"><img src={originalCvImage} alt="Uploaded CV first page" /></div> : <div className="cv-compare-paper">
                      <h4>{data.fullName || "Uploaded CV"}</h4>
                      <div className="line dark" />
                      <div className="line blue" />
                      {(originalPreview.length ? originalPreview : ["Uploaded CV preview"]).map((x, i) => (
                        <div key={i} style={{ marginTop: i < 2 ? 8 : 6 }}>{x}</div>
                      ))}
                    </div>}
                  </div>
                  <div className="cv-compare-page cv-compare-new"><div className="cv-compare-paper" dangerouslySetInnerHTML={{ __html: compareCvHtml }} /></div>
                  <div className="cv-compare-line" />
                  <div className="cv-compare-knob">↔</div>
                  <input className="cv-compare-range" type="range" min="12" max="88" value={comparePos} onChange={e => setComparePos(Number(e.target.value))} aria-label="Compare old and new CV" />
                </div></div>
            </section>
          )}

          {!auditView && (
            <>
          <div
            id="ats-panel"
            className={`cv-ats-panel${atsOpen ? " open" : ""}`}
            aria-hidden={!atsOpen}
            role="region"
            aria-label="ATS checklist"
          >
            {atsChecks.map((c, i) => (
              <div key={i} className={`cv-ck ${c.ok ? "ok" : "fail"}`}>
                <b aria-hidden="true">{c.ok ? "✓" : "✗"}</b>
                <span>{c.msg}</span>
              </div>
            ))}
          </div>
          <nav className="cv-toolbar" aria-label="CV file actions">
            <div className="cv-tbr">
              <label className="cv-btn cv-btn-ghost cv-btn-sm cv-file-btn" title="Load saved CV">
                <span aria-hidden="true">📂</span> Load
                <input type="file" accept=".json" onChange={importJSON} aria-label="Load CV from JSON file" />
              </label>
              <button className="cv-btn cv-btn-ghost cv-btn-sm" type="button" title="Import CV" onClick={() => setUploadOpen(true)} disabled={!!aiLoading.upload}>
                <span aria-hidden="true">+</span> Import CV
              </button>
              <button className="cv-btn cv-btn-ghost cv-btn-sm" onClick={exportJSON}>
                <span aria-hidden="true">💾</span> Save
              </button>
            </div>
          </nav>

          <nav className="cv-main-tabs" role="tablist" aria-label="CV editor sections">
            {[
              { id: "edit",      ico: "✍️", lbl: "Edit"      },
              { id: "templates", ico: "🎨", lbl: "Templates" },
              { id: "preview",   ico: "👁",  lbl: "Preview"  },
            ].map(tab => (
              <button
                key={tab.id}
                className={`cv-main-tab${mainTab === tab.id ? " on" : ""}`}
                role="tab"
                aria-selected={mainTab === tab.id}
                onClick={() => setMainTab(tab.id)}
              >
                <span className="tab-ico" aria-hidden="true">{tab.ico}</span>
                <span>{tab.lbl}</span>
              </button>
            ))}
          </nav>

          <div className="cv-grid">

            <section
              className={`cv-col-form cv-panel${mainTab === "edit" ? " on" : ""}`}
              id="panel-edit"
              role="tabpanel"
              aria-label="Edit CV content"
            >
              <nav className="cv-ftabs" role="tablist" aria-label="CV form sections">
                {[
                  ["personal",   "👤", "Personal"],
                  ["experience", "💼", "Work"],
                  ["education",  "🎓", "Edu"],
                  ["skills",     "🛠",  "Skills"],
                  ["extras",     "⭐", "Extras"],
                ].map(([tab, ico, lbl]) => (
                  <button
                    key={tab}
                    className={`cv-ftab${activeTab === tab ? " on" : ""}`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="ico" aria-hidden="true">{ico}</span>
                    <span>{lbl}</span>
                  </button>
                ))}
              </nav>

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

                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">🧭 Professional Compass</h2>
                    <button className="cv-ai-btn" disabled={!!aiLoading.compass} onClick={aiCompass}
                      aria-label="Generate compass with AI">
                      {aiLoading.compass ? <><span className="cv-spinner" />…</> : "✨ AI Write"}
                    </button>
                  </div>
                  <p style={{ fontSize: ".7rem", color: "#4b5563", marginBottom: 6 }}>
                    A future-focused career narrative. Used in Apex Pro and executive templates.
                  </p>
                  <label className="cv-lbl" htmlFor="p-compass" style={{ marginBottom: 4 }}>Career direction statement</label>
                  <textarea id="p-compass" className="cv-inp" rows={3}
                    placeholder="A data-driven transformation leader with a 14-year compass pointing from engineering deep dives to C-suite strategy…"
                    value={data.compass || ""} onChange={e => sf("compass", e.target.value)} />
                </div>
              </div>

              {/* EXPERIENCE TAB */}
              <div className={`cv-tpanel${activeTab === "experience" ? " on" : ""}`} role="tabpanel">
                <div className="cv-card">
                  <div className="cv-card-h">
                    <h2 className="cv-card-t">💼 Work Experience</h2>
                    <button className="cv-btn-add" aria-label="Add experience" onClick={() => addItem("experience", {
                      role:"", company:"", companyLogo:"", empType:"Full-time",
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
                    Separate skills with commas.
                  </p>
                  <label className="cv-lbl" htmlFor="p-skills" style={{ marginBottom: 4 }}>Skills list</label>
                  <textarea id="p-skills" className="cv-inp" rows={9}
                    placeholder={"AutoCAD, Project Management, Python, MS Excel, Leadership, HVAC Design"}
                    value={data.skills || ""} onChange={e => sf("skills", e.target.value)} />
                  <div className="cv-chips" aria-label="Skill chips preview">
                    {txt(data.skills).split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map((s, i) => <span key={i} className="cv-chip">{s}</span>)}
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
                  onClick={resetAll}>
                  🗑️ Reset All Data
                </button>
              </div>
            </section>

            <section
              className={`cv-col-prev cv-panel${mainTab === "templates" || mainTab === "preview" ? " on" : ""}`}
              id="panel-right"
              role="tabpanel"
              aria-label="Templates and CV preview"
            >
              <div className={mainTab === "preview" ? "cv-desktop-only" : ""}>
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

              <div
                className={mainTab === "templates" ? "cv-desktop-only" : ""}
                style={{ marginTop: mainTab === "preview" ? 0 : 14 }}
              >
                <Preview
                  cvHtml={cvHtml}
                  zoom={zoom}
                  setZoom={setZoom}
                  fitZoom={fitZoom}
                  paperRef={paperRef}
                  prevScrollRef={prevScrollRef}
                  accent={accent}
                  setAccent={setAccent}
                  fontId={fontId}
                  setFontId={setFontId}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  paper={paper}
                  setPaper={setPaper}
                  ACCENTS={ACCENTS}
                  FONTS={FONTS}
                  FSIZES={FSIZES}
                  PAPERS={PAPERS}
                  fullName={data.fullName}
                  toast={toast}
                />
              </div>
            </section>

          </div>
            </>
          )}
            </>
          )}
        </div>
      </div>
    </>
  );
}


