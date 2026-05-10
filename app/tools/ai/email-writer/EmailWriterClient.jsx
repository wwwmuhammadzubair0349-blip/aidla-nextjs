"use client";
// app/tools/ai/email-writer/EmailWriterClient.jsx
// Changes: "use client", import.meta.env → process.env, Link to→href, framer-motion → CSS, Helmet → removed

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function callEmailWriter(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/email-writer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Generation failed");
  return data.result;
}

const CATEGORIES = [
  { id:"professional", icon:"💼", label:"Professional", color:"#1a3a8f", light:"rgba(26,58,143,0.08)", border:"rgba(26,58,143,0.22)",
    types:[{id:"job_application",label:"Job Application",icon:"📋"},{id:"follow_up",label:"Follow Up",icon:"🔄"},{id:"resignation",label:"Resignation",icon:"🚪"},{id:"promotion_request",label:"Promotion Ask",icon:"📈"},{id:"meeting_request",label:"Meeting Request",icon:"📅"},{id:"project_update",label:"Project Update",icon:"📊"}] },
  { id:"business", icon:"🏢", label:"Business", color:"#0369a1", light:"rgba(3,105,161,0.08)", border:"rgba(3,105,161,0.22)",
    types:[{id:"sales_pitch",label:"Sales Pitch",icon:"💰"},{id:"partnership",label:"Partnership",icon:"🤝"},{id:"cold_outreach",label:"Cold Outreach",icon:"📡"},{id:"invoice_followup",label:"Invoice Follow-Up",icon:"🧾"},{id:"client_update",label:"Client Update",icon:"📬"},{id:"complaint",label:"Complaint",icon:"⚠️"}] },
  { id:"personal", icon:"💌", label:"Personal", color:"#be123c", light:"rgba(190,18,60,0.08)", border:"rgba(190,18,60,0.22)",
    types:[{id:"thank_you",label:"Thank You",icon:"🙏"},{id:"apology",label:"Apology",icon:"💙"},{id:"congratulations",label:"Congratulations",icon:"🎉"},{id:"introduction",label:"Introduction",icon:"👋"},{id:"request_favor",label:"Request a Favor",icon:"🌟"},{id:"reconnect",label:"Reconnect",icon:"🔗"}] },
  { id:"academic", icon:"🎓", label:"Academic", color:"#6d28d9", light:"rgba(109,40,217,0.08)", border:"rgba(109,40,217,0.22)",
    types:[{id:"professor_email",label:"Email to Professor",icon:"📚"},{id:"scholarship",label:"Scholarship Ask",icon:"🏆"},{id:"internship",label:"Internship Apply",icon:"🔬"},{id:"recommendation",label:"Recommendation",icon:"✍️"},{id:"thesis_guidance",label:"Thesis Guidance",icon:"📄"},{id:"admission",label:"Admission Inquiry",icon:"🏫"}] },
];

const TONES = [{id:"formal",label:"Formal",icon:"🎩"},{id:"professional",label:"Professional",icon:"💼"},{id:"friendly",label:"Friendly",icon:"😊"},{id:"persuasive",label:"Persuasive",icon:"🎯"},{id:"empathetic",label:"Empathetic",icon:"💙"},{id:"concise",label:"Concise",icon:"⚡"}];
const LENGTHS = [{id:"short",label:"Short",sub:"~100 words",icon:"📝"},{id:"medium",label:"Medium",sub:"~200 words",icon:"📃"},{id:"long",label:"Long",sub:"~350 words",icon:"📜"}];
const LANGUAGES = ["English","Arabic (عربي)","Urdu (اردو)","French","Spanish","German","Hindi","Portuguese","Turkish","Chinese","Japanese"];
const QUICK_CHIPS = ["Make it shorter","More formal","More confident","Add more details","Stronger opening","Better CTA","More friendly","Translate to Arabic","Translate to Urdu","More persuasive"];

const enc = encodeURIComponent;
const openGmail   = d => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${enc(d.to||"")}&su=${enc(d.subject||"")}&body=${enc(d.body||"")}`, "_blank", "noopener");
const openOutlook = d => window.open(`https://outlook.live.com/mail/0/deeplink/compose?to=${enc(d.to||"")}&subject=${enc(d.subject||"")}&body=${enc(d.body||"")}`, "_blank", "noopener");
const openYahoo   = d => window.open(`https://compose.mail.yahoo.com/?to=${enc(d.to||"")}&subject=${enc(d.subject||"")}&body=${enc(d.body||"")}`, "_blank", "noopener");
const openMailto  = d => { window.location.href = `mailto:${enc(d.to||"")}?subject=${enc(d.subject||"")}&body=${enc(d.body||"")}`; };

function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = async (text, id = "x") => {
    try { await navigator.clipboard.writeText(text); } catch { const el = document.createElement("textarea"); el.value = text; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); }
    setCopied(id); setTimeout(() => setCopied(""), 2200);
  };
  return { copied, copy };
}

const CSS = `

.ew-root*,.ew-root*::before,.ew-root*::after{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes ewPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes ewFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.fade-up{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}
.fade-up-1{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .1s both}
.fade-up-2{animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .15s both}
.fade-in{animation:fadeIn .35s ease both}
.ew-root{overflow-x:hidden;max-width:100vw;width:100%}
.ew-page{min-height:100vh;background:linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%);font-family:'DM Sans',sans-serif;overflow-x:hidden;width:100%;position:relative}
.ew-wrap{width:100%;max-width:1160px;margin:0 auto;padding:clamp(20px,5vw,56px) clamp(14px,4vw,28px) 60px;overflow-x:hidden}
.ew-grid{display:grid;grid-template-columns:1fr;gap:16px;width:100%}
@media(min-width:900px){.ew-grid{grid-template-columns:1fr 1fr;align-items:start}}
.ew-card{background:rgba(255,255,255,.92);border-radius:18px;border:1px solid rgba(59,130,246,.1);box-shadow:0 4px 16px rgba(11,20,55,.06);padding:16px;margin-bottom:12px;width:100%;overflow:hidden;word-break:break-word;overflow-wrap:anywhere}
@media(min-width:640px){.ew-card{padding:20px}}
.ew-sec{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px;display:block}
.ew-cats{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
.ew-cat-btn{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;border:1.5px solid rgba(59,130,246,.1);background:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;min-width:0;overflow:hidden;width:100%;text-align:left}
.ew-cat-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(11,20,55,.08)}
.ew-cat-btn.active{border-color:var(--cc);background:var(--cl);box-shadow:0 4px 14px var(--cl)}
.ew-cat-btn:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
.ew-cat-label{font-size:12px;font-weight:700;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}
.ew-cat-btn.active .ew-cat-label{color:var(--cc)}
.ew-cat-dot{width:6px;height:6px;border-radius:50%;background:var(--cc);flex-shrink:0;animation:ewPulse 2s ease infinite}
.ew-types{display:flex;flex-wrap:wrap;gap:7px;width:100%}
.ew-type{display:inline-flex;align-items:center;gap:4px;padding:6px 11px;border-radius:99px;border:1px solid rgba(59,130,246,.1);background:#fff;font-size:12px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
.ew-type:hover{transform:translateY(-1px)}
.ew-type.active{border-color:var(--cc);background:var(--cl);color:var(--cc)}
.ew-type:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
.ew-tones{display:flex;flex-wrap:wrap;gap:7px;width:100%}
.ew-tone{display:inline-flex;align-items:center;gap:4px;padding:6px 11px;border-radius:99px;border:1px solid rgba(59,130,246,.1);background:#fff;font-size:12px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ew-tone.active{border-color:rgba(11,20,55,.25);background:#0b1437;color:#fff}
.ew-tone:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
.ew-lengths{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%}
.ew-len{padding:10px 6px;border:1px solid rgba(59,130,246,.1);border-radius:10px;cursor:pointer;background:#fff;text-align:center;font-family:'DM Sans',sans-serif;transition:all .13s}
.ew-len.active{border-color:rgba(11,20,55,.22);background:#f8fafc;box-shadow:0 2px 8px rgba(11,20,55,.06)}
.ew-len:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
.ew-len-icon{font-size:15px;margin-bottom:2px}
.ew-len-lbl{font-size:12px;font-weight:800;color:#64748b}
.ew-len.active .ew-len-lbl{color:#0b1437}
.ew-len-sub{font-size:10px;color:#94a3b8;margin-top:1px}
.ew-people{display:grid;grid-template-columns:1fr;gap:10px;width:100%}
@media(min-width:480px){.ew-people{grid-template-columns:1fr 1fr}}
.ew-label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px}
.ew-input,.ew-textarea,.ew-select{width:100%;padding:10px 13px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#fff;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s,box-shadow .15s;max-width:100%;box-sizing:border-box;-webkit-appearance:none;appearance:none}
.ew-input::placeholder,.ew-textarea::placeholder{color:rgba(100,116,139,.45)}
.ew-input:focus,.ew-textarea:focus,.ew-select:focus{border-color:rgba(239,68,68,.35);box-shadow:0 0 0 3px rgba(239,68,68,.07)}
.ew-input:focus-visible,.ew-textarea:focus-visible,.ew-select:focus-visible{outline:3px solid rgba(239,68,68,.5);outline-offset:2px}
.ew-textarea{min-height:90px;resize:vertical;line-height:1.65}
.ew-select{cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
.ew-prog-wrap{margin-bottom:11px}
.ew-prog-row{display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:5px;font-weight:600}
.ew-prog-track{height:4px;background:#f1f5f9;border-radius:99px;overflow:hidden}
.ew-prog-bar{height:100%;border-radius:99px;transition:width .5s ease}
.ew-gen-btn{width:100%;padding:14px 16px;border:none;border-radius:14px;font-weight:800;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;color:#fff;max-width:100%;box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ew-gen-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07)}
.ew-gen-btn:disabled{cursor:not-allowed;opacity:.65}
.ew-gen-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
.ew-error{font-size:13px;color:#dc2626;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:10px 13px;margin-bottom:11px}
.ew-result-card{background:#fff;border-radius:18px;border:1px solid rgba(59,130,246,.1);box-shadow:0 8px 28px rgba(11,20,55,.08);overflow:hidden;margin-bottom:12px;width:100%}
.ew-result-header{padding:13px 16px;background:#f8fafc;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ew-result-meta{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.ew-result-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.ew-result-btns{display:flex;gap:6px;flex-wrap:wrap}
.ew-result-btn{padding:6px 11px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font-size:11px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
.ew-result-btn:hover{background:#f8fafc}
.ew-result-btn.copied{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.25);color:#059669}
.ew-result-btn.active-edit{border-color:rgba(26,58,143,.22);background:rgba(26,58,143,.08);color:#1a3a8f}
.ew-section-row{padding:13px 16px;border-bottom:1px solid #f8fafc}
.ew-body-row{padding:16px}
.ew-pre{font-size:13.5px;color:#374151;line-height:1.82;white-space:pre-wrap;font-family:'DM Sans',sans-serif;margin:0;word-break:break-word;overflow-wrap:anywhere;max-width:100%;overflow-x:auto}
.ew-send-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;width:100%}
.ew-send-btn{display:flex;align-items:center;gap:9px;padding:11px 12px;border-radius:12px;border:1px solid #e2e8f0;background:#f8fafc;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;min-width:0;overflow:hidden;width:100%;text-align:left}
.ew-send-btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(11,20,55,.1)}
.ew-send-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
.ew-send-name{font-size:12px;font-weight:800;color:#0f172a}
.ew-send-sub{font-size:10px;color:#94a3b8}
.ew-chips{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0;width:100%}
.ew-chip{padding:4px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:99px;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ew-chip:hover{background:rgba(26,58,143,.08);color:#1a3a8f;border-color:rgba(26,58,143,.2)}
.ew-regen-row{display:grid;grid-template-columns:1fr;gap:8px}
.ew-regen-row.has-clear{grid-template-columns:1fr auto}
.ew-regen-btn{width:100%;padding:12px 14px;border:none;border-radius:12px;font-weight:800;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ew-regen-btn:disabled{cursor:not-allowed;opacity:.55}
.ew-clear-btn{padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;font-size:12px;color:#94a3b8;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;white-space:nowrap;transition:all .13s}
.ew-clear-btn:hover{color:#64748b;background:#f1f5f9}
.ew-ai-badge{font-size:9px;font-weight:800;color:#059669;background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.2);border-radius:99px;padding:1px 7px;white-space:nowrap;flex-shrink:0}
.ew-copy-sub-btn{margin-top:6px;padding:3px 10px;background:transparent;border:1px solid #e2e8f0;border-radius:6px;font-size:10px;font-weight:700;color:#94a3b8;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s}
.ew-copy-sub-btn.copied{background:rgba(5,150,105,.07);border-color:rgba(5,150,105,.2);color:#059669}
.ew-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:340px;text-align:center;padding:28px 16px}
@media(min-width:900px){.ew-empty{min-height:480px}}
.ew-empty-icon{width:72px;height:72px;border-radius:50%;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:18px;animation:ewFloat 3s ease-in-out infinite}
.ew-feat-list{display:flex;flex-direction:column;gap:7px;width:100%;max-width:320px;margin-top:22px}
.ew-feat-item{display:flex;align-items:center;gap:9px;padding:9px 12px;background:#fff;border-radius:10px;border:1px solid rgba(59,130,246,.08);box-shadow:0 1px 4px rgba(11,20,55,.04)}
.ew-feat-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.ew-feat-text{font-size:12px;color:#64748b;font-weight:600}
.ew-pills{display:flex;flex-wrap:wrap;justify-content:center;gap:7px}
.ew-pill{font-size:11px;font-weight:700;color:#475569;background:rgba(255,255,255,.8);border:1px solid rgba(11,20,55,.07);border-radius:99px;padding:4px 11px}
.ew-edit-btns{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.ew-save-btn{flex:1;min-width:100px;padding:10px 14px;border:none;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;color:#fff;transition:all .15s}
.ew-cancel-btn{padding:10px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-weight:700;font-size:13px;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ew-cancel-btn:hover{background:#f1f5f9}
.ew-accent-line{height:3px;width:100%}
.ew-cta{background:linear-gradient(135deg,#0b1437 0%,#1a3a8f 60%,#0b1437 100%);border-radius:28px;padding:clamp(24px,5vw,44px) clamp(20px,4vw,40px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;margin:44px 0 0;border:1px solid rgba(245,158,11,.12);box-shadow:0 16px 40px rgba(11,20,55,.22);position:relative;overflow:hidden;width:100%}
.ew-cta-link{padding:13px 30px;background:linear-gradient(135deg,#f59e0b,#fcd34d);color:#0b1437;border-radius:99px;font-weight:900;font-size:14px;text-decoration:none;box-shadow:0 5px 20px rgba(245,158,11,.38);white-space:nowrap;display:inline-block;flex-shrink:0}
@media(max-width:520px){.ew-cta{flex-direction:column;text-align:center}.ew-cta-link{width:100%;text-align:center}}
`;

export default function EmailWriterClient() {
  const { copied, copy } = useCopy();
  const resultRef = useRef(null);

  const [activeCat,      setActiveCat]      = useState("professional");
  const [emailType,      setEmailType]      = useState("job_application");
  const [tone,           setTone]           = useState("professional");
  const [length,         setLength]         = useState("medium");
  const [language,       setLanguage]       = useState("English");
  const [senderName,     setSenderName]     = useState("");
  const [recipientName,  setRecipientName]  = useState("");
  const [recipientRole,  setRecipientRole]  = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [context,        setContext]        = useState("");
  const [loading,        setLoading]        = useState(false);
  const [regenLoading,   setRegenLoading]   = useState(false);
  const [progress,       setProgress]       = useState(0);
  const [regenProg,      setRegenProg]      = useState(0);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState("");
  const [regenError,     setRegenError]     = useState("");
  const [editMode,       setEditMode]       = useState(false);
  const [editSubject,    setEditSubject]    = useState("");
  const [editBody,       setEditBody]       = useState("");
  const [regenInstr,     setRegenInstr]     = useState("");

  const cat = CATEGORIES.find(c => c.id === activeCat);

  const basePayload = useCallback(() => ({
    type: emailType, tone, length, language,
    senderName, recipientName, recipientRole, context,
  }), [emailType, tone, length, language, senderName, recipientName, recipientRole, context]);

  const handleGenerate = useCallback(async () => {
    if (loading || regenLoading) return;
    setLoading(true); setError(""); setResult(null);
    setProgress(0); setEditMode(false); setRegenInstr("");
    const tick = setInterval(() => setProgress(p => Math.min(p + 10, 88)), 500);
    try {
      const res = await callEmailWriter(basePayload());
      clearInterval(tick); setProgress(100);
      setTimeout(() => {
        setResult(res); setEditSubject(res.subject); setEditBody(res.body);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }, 200);
    } catch (e) { clearInterval(tick); setProgress(0); setError(e.message || "Generation failed."); }
    setTimeout(() => setLoading(false), 300);
  }, [loading, regenLoading, basePayload]);

  const handleRegen = useCallback(async () => {
    if (regenLoading || loading || !result) return;
    setRegenLoading(true); setRegenError(""); setRegenProg(0); setEditMode(false);
    const tick = setInterval(() => setRegenProg(p => Math.min(p + 10, 88)), 500);
    try {
      const res = await callEmailWriter({
        ...basePayload(), isRegen: true,
        previousEmail: `SUBJECT: ${result.subject}\n---\n${result.body}`,
        regenInstructions: regenInstr.trim() || "Write a fresh variation with the same intent",
      });
      clearInterval(tick); setRegenProg(100);
      setTimeout(() => { setResult(res); setEditSubject(res.subject); setEditBody(res.body); setRegenInstr(""); }, 200);
    } catch (e) { clearInterval(tick); setRegenProg(0); setRegenError(e.message || "Regeneration failed."); }
    setTimeout(() => setRegenLoading(false), 300);
  }, [regenLoading, loading, result, basePayload, regenInstr]);

  const saveEdit = () => { setResult({ subject: editSubject, body: editBody }); setEditMode(false); };
  const emailData = { to: recipientEmail, subject: result?.subject || "", body: result?.body || "" };

  return (
    <>
      <style>{CSS}</style>
      <div className="ew-root">
        <div className="ew-page">
          <div aria-hidden="true" style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
            <div style={{ position:"absolute", width:"min(700px,130vw)", height:"min(700px,130vw)", borderRadius:"50%", background:"radial-gradient(circle,rgba(239,68,68,.07) 0%,transparent 65%)", filter:"blur(60px)", top:"-25%", left:"-15%" }}/>
            <div style={{ position:"absolute", width:"min(500px,110vw)", height:"min(500px,110vw)", borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%)", filter:"blur(60px)", top:"30%", right:"-15%" }}/>
          </div>

          <div className="ew-wrap" style={{ position:"relative", zIndex:1 }}>

            {/* Hero */}
            <div style={{ textAlign:"center", marginBottom:40 }} className="fade-up">
              <div className="fade-up-1" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"linear-gradient(135deg,#1a3a8f,#3b82f6)", color:"#fff", padding:"5px 16px", borderRadius:99, fontSize:11, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase", marginBottom:18, boxShadow:"0 5px 18px rgba(26,58,143,.28)" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,.7)", animation:"ewPulse 1.6s ease infinite" }}/>
                ✉️ AI Email Writer — AIDLA AI
              </div>
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" style={{ display:"flex", justifyContent:"center", gap:6, fontSize:11, fontWeight:600, color:"#94a3b8", marginBottom:16, flexWrap:"wrap" }}>
                <Link href="/" style={{ color:"#94a3b8", textDecoration:"none" }}>Home</Link><span>›</span>
                <Link href="/tools" style={{ color:"#94a3b8", textDecoration:"none" }}>Tools</Link><span>›</span>
                <span style={{ color:"#475569" }} aria-current="page">AI Email Writer</span>
              </nav>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,6vw,3.2rem)", fontWeight:900, color:"#0b1437", lineHeight:1.1, marginBottom:12, letterSpacing:"-.02em", wordBreak:"break-word" }}>
                Write{" "}
                <span style={{ background:"linear-gradient(135deg,#ef4444 20%,#f97316 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>perfect emails</span>
                {" "}instantly
              </h1>
              <p style={{ fontSize:"clamp(13px,2.5vw,16px)", color:"#475569", maxWidth:520, margin:"0 auto 18px", lineHeight:1.75 }}>
                AI crafts your email in seconds — professional, business, personal or academic. Open directly in Gmail, Outlook, or your mail app.
              </p>
              <ul className="ew-pills" role="list" aria-label="Features" style={{ listStyle:"none", padding:0 }}>
                {["✅ 24 email types","✅ 6 tones","✅ 11 languages","✅ Gmail · Outlook · Mail","✅ Regenerate with instructions"].map(p => (
                  <li key={p} className="ew-pill">{p}</li>
                ))}
              </ul>
            </div>

            <div className="ew-grid">
              {/* Form */}
              <div className="fade-up-2">
                {/* Category */}
                <div className="ew-card" style={{ "--cc": cat?.color, "--cl": cat?.light }}>
                  <span className="ew-sec">Email Category</span>
                  <div className="ew-cats" role="radiogroup" aria-label="Email category">
                    {CATEGORIES.map(c => (
                      <button key={c.id} className={`ew-cat-btn${activeCat===c.id?" active":""}`}
                        style={{ "--cc": c.color, "--cl": c.light }}
                        onClick={() => { setActiveCat(c.id); setEmailType(c.types[0].id); }}
                        aria-pressed={activeCat===c.id}>
                        <span aria-hidden="true" style={{ fontSize:17, flexShrink:0 }}>{c.icon}</span>
                        <span className="ew-cat-label">{c.label}</span>
                        {activeCat===c.id && <span className="ew-cat-dot" aria-hidden="true"/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div className="ew-card" style={{ "--cc": cat?.color, "--cl": cat?.light }}>
                  <span className="ew-sec">Email Type</span>
                  <div className="ew-types" role="group" aria-label="Email type">
                    {cat?.types.map(t => (
                      <button key={t.id} className={`ew-type${emailType===t.id?" active":""}`}
                        style={{ "--cc": cat.color, "--cl": cat.light }}
                        onClick={() => setEmailType(t.id)} aria-pressed={emailType===t.id}>
                        <span aria-hidden="true">{t.icon}</span> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone + Length + Language */}
                <div className="ew-card">
                  <div style={{ marginBottom:16 }}>
                    <span className="ew-sec" id="tone-lbl">Tone</span>
                    <div className="ew-tones" role="radiogroup" aria-labelledby="tone-lbl">
                      {TONES.map(t => (
                        <button key={t.id} className={`ew-tone${tone===t.id?" active":""}`}
                          onClick={() => setTone(t.id)} aria-pressed={tone===t.id}>
                          <span aria-hidden="true">{t.icon}</span> {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <span className="ew-sec" id="len-lbl">Length</span>
                    <div className="ew-lengths" role="radiogroup" aria-labelledby="len-lbl">
                      {LENGTHS.map(l => (
                        <button key={l.id} className={`ew-len${length===l.id?" active":""}`}
                          onClick={() => setLength(l.id)} aria-pressed={length===l.id}>
                          <div className="ew-len-icon" aria-hidden="true">{l.icon}</div>
                          <div className="ew-len-lbl">{l.label}</div>
                          <div className="ew-len-sub">{l.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ew-lang" className="ew-label">Language</label>
                    <select id="ew-lang" className="ew-select" value={language} onChange={e => setLanguage(e.target.value)}>
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                {/* People */}
                <div className="ew-card">
                  <span className="ew-sec">People</span>
                  <div className="ew-people">
                    <div><label htmlFor="ew-sender" className="ew-label">Your Name</label><input id="ew-sender" className="ew-input" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Ahmed Ali" autoComplete="name"/></div>
                    <div><label htmlFor="ew-recip" className="ew-label">Recipient Name</label><input id="ew-recip" className="ew-input" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="John Smith"/></div>
                    <div><label htmlFor="ew-role" className="ew-label">Recipient Role</label><input id="ew-role" className="ew-input" value={recipientRole} onChange={e => setRecipientRole(e.target.value)} placeholder="Hiring Manager"/></div>
                    <div><label htmlFor="ew-email" className="ew-label">To: Email (optional)</label><input id="ew-email" className="ew-input" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="john@company.com" autoComplete="email"/></div>
                  </div>
                </div>

                {/* Context */}
                <div className="ew-card">
                  <label htmlFor="ew-context" className="ew-sec" style={{ display:"block", marginBottom:5 }}>Context &amp; Key Points</label>
                  <p style={{ fontSize:11, color:"#94a3b8", marginBottom:8, lineHeight:1.5 }}>What should the AI include?</p>
                  <textarea id="ew-context" className="ew-textarea" value={context} onChange={e => setContext(e.target.value)}
                    placeholder="e.g. Applying for Senior Frontend Dev. 5 years React. Previously at XYZ Corp..."/>
                </div>

                {error && <div className="ew-error" role="alert">⚠️ {error}</div>}

                {loading && (
                  <div className="ew-prog-wrap" aria-live="polite">
                    <div className="ew-prog-row"><span>✍️ AI is writing your email…</span><span>{Math.round(progress)}%</span></div>
                    <div className="ew-prog-track"><div className="ew-prog-bar" style={{ width:`${progress}%`, background:`linear-gradient(90deg,${cat?.color}88,${cat?.color})` }}/></div>
                  </div>
                )}

                <button className="ew-gen-btn" onClick={handleGenerate} disabled={loading || regenLoading}
                  style={{ background: loading ? "#f1f5f9" : `linear-gradient(135deg,${cat?.color},${cat?.color}cc)`, color: loading ? "#94a3b8" : "#fff" }}
                  aria-busy={loading}>
                  {loading ? "✍️ AI is writing…" : `${cat?.icon}  Write Email with AI`}
                </button>
              </div>

              {/* Result */}
              <div ref={resultRef}>
                {result ? (
                  <div className="fade-in" style={{ "--cc": cat?.color, "--cl": cat?.light, "--cb": cat?.border }}>
                    <div className="ew-result-card">
                      <div className="ew-accent-line" style={{ background:`linear-gradient(90deg,${cat?.color},${cat?.color}88,transparent)` }}/>
                      <div className="ew-result-header">
                        <div className="ew-result-meta">
                          <div className="ew-result-icon" style={{ background:cat?.light, border:`1px solid ${cat?.border}` }} aria-hidden="true">{cat?.icon}</div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                              <span style={{ fontSize:12, fontWeight:800, color:"#0b1437" }}>AI-Generated Email</span>
                              <span className="ew-ai-badge">✨ AI</span>
                            </div>
                            <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{cat?.types.find(t=>t.id===emailType)?.label} · {tone} · {length}</div>
                          </div>
                        </div>
                        <div className="ew-result-btns">
                          <button className={`ew-result-btn${copied==="all"?" copied":""}`}
                            onClick={() => copy(`Subject: ${result.subject}\n\n${result.body}`, "all")} aria-label="Copy full email">
                            {copied==="all" ? "✅ Copied!" : "📋 Copy All"}
                          </button>
                          <button className={`ew-result-btn${editMode?" active-edit":""}`}
                            onClick={() => { setEditMode(!editMode); setEditSubject(result.subject); setEditBody(result.body); }}
                            aria-pressed={editMode}>
                            {editMode ? "💾 Editing…" : "✏️ Edit"}
                          </button>
                        </div>
                      </div>

                      <div className="ew-section-row">
                        <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Subject</div>
                        {editMode
                          ? <input className="ew-input" value={editSubject} onChange={e => setEditSubject(e.target.value)} style={{ fontWeight:700 }} aria-label="Email subject"/>
                          : <>
                              <div style={{ fontSize:15, fontWeight:700, color:"#0f172a", lineHeight:1.4, wordBreak:"break-word" }}>{result.subject}</div>
                              <button className={`ew-copy-sub-btn${copied==="subj"?" copied":""}`} onClick={() => copy(result.subject, "subj")} aria-label="Copy subject">
                                {copied==="subj" ? "✅ Copied" : "📋 Copy subject"}
                              </button>
                            </>
                        }
                      </div>

                      {recipientEmail && (
                        <div className="ew-section-row" style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                          <span style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em" }}>To</span>
                          <span style={{ fontSize:13, color:"#2563eb", fontWeight:600, wordBreak:"break-all" }}>{recipientEmail}</span>
                        </div>
                      )}

                      <div className="ew-body-row">
                        <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em", marginBottom:11 }}>Body</div>
                        {editMode
                          ? <>
                              <textarea className="ew-textarea" value={editBody} onChange={e => setEditBody(e.target.value)} style={{ minHeight:240 }} aria-label="Email body"/>
                              <div className="ew-edit-btns">
                                <button className="ew-save-btn" onClick={saveEdit}
                                  style={{ background:`linear-gradient(135deg,${cat?.color},${cat?.color}cc)` }}>💾 Save Changes</button>
                                <button className="ew-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                              </div>
                            </>
                          : <>
                              <pre className="ew-pre">{result.body}</pre>
                              <button className={`ew-copy-sub-btn${copied==="body"?" copied":""}`} style={{ marginTop:11 }}
                                onClick={() => copy(result.body, "body")} aria-label="Copy body">
                                {copied==="body" ? "✅ Copied" : "📋 Copy body"}
                              </button>
                            </>
                        }
                      </div>
                    </div>

                    {/* Send */}
                    <div className="ew-card">
                      <span className="ew-sec">📤 Open &amp; Send Directly</span>
                      <div className="ew-send-grid">
                        <button className="ew-send-btn" onClick={() => openGmail(emailData)} aria-label="Open in Gmail" style={{ background:"rgba(234,67,53,.05)", borderColor:"rgba(234,67,53,.2)" }}>
                          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ flexShrink:0 }}><path d="M6 36h6V22.8L6 18v18zm30 0h6V18l-6 4.8V36z" fill="#EA4335"/><path d="M6 18l18 13.2L42 18 24 6 6 18z" fill="#FBBC05"/><path d="M6 18l6 4.8V36H6V18zm30 4.8L42 18v18h-6V22.8z" fill="#34A853"/><path d="M12 22.8L6 18l18 13.2L42 18l-6 4.8L24 31.2 12 22.8z" fill="#4285F4"/></svg>
                          <div><div className="ew-send-name">Gmail</div><div className="ew-send-sub">Open draft</div></div>
                        </button>
                        <button className="ew-send-btn" onClick={() => openOutlook(emailData)} aria-label="Open in Outlook" style={{ background:"rgba(0,120,212,.05)", borderColor:"rgba(0,120,212,.2)" }}>
                          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ flexShrink:0 }}><rect width="48" height="48" rx="6" fill="#0078D4"/><path d="M10 12h16v24H10z" fill="#50D9FF"/><path d="M10 12l8 12-8 12V12z" fill="rgba(0,0,0,.15)"/><path d="M26 12h12v8L26 28V12z" fill="#fff" opacity=".9"/><path d="M26 28l12-8v16H26V28z" fill="#fff" opacity=".7"/></svg>
                          <div><div className="ew-send-name">Outlook</div><div className="ew-send-sub">Open draft</div></div>
                        </button>
                        <button className="ew-send-btn" onClick={() => openYahoo(emailData)} aria-label="Open in Yahoo Mail" style={{ background:"rgba(99,2,211,.05)", borderColor:"rgba(99,2,211,.2)" }}>
                          <div style={{ width:20, height:20, borderRadius:5, background:"#6002d3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }} aria-hidden="true">Y!</div>
                          <div><div className="ew-send-name">Yahoo Mail</div><div className="ew-send-sub">Open draft</div></div>
                        </button>
                        <button className="ew-send-btn" onClick={() => openMailto(emailData)} aria-label="Open in default mail app">
                          <div style={{ width:20, height:20, borderRadius:5, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }} aria-hidden="true">✉️</div>
                          <div><div className="ew-send-name">Mail App</div><div className="ew-send-sub">Default app</div></div>
                        </button>
                      </div>
                      {!recipientEmail && <p style={{ fontSize:11, color:"#94a3b8", marginTop:9, textAlign:"center" }}>💡 Add recipient email above to pre-fill the To field</p>}
                    </div>

                    {/* Regen */}
                    <div className="ew-card">
                      <div style={{ display:"flex", alignItems:"flex-start", gap:9, marginBottom:4 }}>
                        <span aria-hidden="true" style={{ fontSize:18, flexShrink:0 }}>🔄</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#0b1437" }}>Regenerate with Instructions</div>
                          <div style={{ fontSize:11, color:"#94a3b8", marginTop:1, lineHeight:1.5 }}>Tell the AI what to change</div>
                        </div>
                      </div>
                      <div className="ew-chips" role="group" aria-label="Quick instruction suggestions">
                        {QUICK_CHIPS.map(chip => (
                          <button key={chip} className="ew-chip"
                            onClick={() => setRegenInstr(prev => prev ? prev + ". " + chip : chip)}>+ {chip}</button>
                        ))}
                      </div>
                      <label htmlFor="ew-regen-instr" className="ew-label">Your Instructions</label>
                      <textarea id="ew-regen-instr" className="ew-textarea"
                        value={regenInstr} onChange={e => setRegenInstr(e.target.value)}
                        placeholder="e.g. Make it shorter and more direct"/>
                      {regenError && <div className="ew-error" role="alert" style={{ marginTop:8 }}>⚠️ {regenError}</div>}
                      {regenLoading && (
                        <div className="ew-prog-wrap" style={{ marginTop:8 }} aria-live="polite">
                          <div className="ew-prog-row"><span>✍️ Rewriting…</span><span>{Math.round(regenProg)}%</span></div>
                          <div className="ew-prog-track"><div className="ew-prog-bar" style={{ width:`${regenProg}%`, background:`linear-gradient(90deg,${cat?.color}88,${cat?.color})` }}/></div>
                        </div>
                      )}
                      <div className={`ew-regen-row${regenInstr?" has-clear":""}`} style={{ marginTop:10 }}>
                        <button className="ew-regen-btn" onClick={handleRegen} disabled={regenLoading||loading}
                          style={{ background: regenLoading ? "#f1f5f9" : `linear-gradient(135deg,${cat?.color}99,${cat?.color}66)`, color: regenLoading ? "#94a3b8" : "#fff" }}>
                          {regenLoading ? "✍️ Rewriting…" : regenInstr.trim() ? "✨ Apply & Rewrite" : "🔄 New Variation"}
                        </button>
                        {regenInstr && <button className="ew-clear-btn" onClick={() => setRegenInstr("")}>Clear</button>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ew-empty fade-in">
                    <div className="ew-empty-icon" aria-hidden="true">✉️</div>
                    <div style={{ fontSize:17, fontWeight:800, color:"#334155", marginBottom:7 }}>Your AI email will appear here</div>
                    <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.65, maxWidth:260 }}>Pick a category, fill in the details, and click Write Email with AI.</div>
                    <ul className="ew-feat-list" aria-label="Features" style={{ listStyle:"none", padding:0 }}>
                      {[["📤 Open in Gmail, Outlook, Yahoo or Mail","#2563eb"],["✏️ Edit inline before sending","#7c3aed"],["🔄 Regenerate with custom instructions","#059669"],["🌍 Write in 11 languages","#d97706"]].map(([t,c]) => (
                        <li key={t} className="ew-feat-item">
                          <div className="ew-feat-dot" style={{ background:c }} aria-hidden="true"/>
                          <span className="ew-feat-text">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="ew-cta fade-up">
              <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(245,158,11,.5),transparent)", pointerEvents:"none" }} aria-hidden="true"/>
              <div style={{ position:"relative" }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.3)", borderRadius:99, padding:"3px 11px", fontSize:10, fontWeight:800, color:"#fbbf24", marginBottom:10 }}>✨ FREE · NO ACCOUNT NEEDED</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.2rem,4vw,1.8rem)", fontWeight:900, color:"#fff", marginBottom:6, lineHeight:1.2, letterSpacing:"-.02em" }}>More AI Tools by AIDLA</h2>
                <p style={{ color:"rgba(255,255,255,.55)", fontSize:"clamp(12px,2.5vw,14px)", lineHeight:1.6, maxWidth:380 }}>YouTube automation, board results, PDF tools and more — all free.</p>
              </div>
              <Link href="/tools" className="ew-cta-link">Explore All Tools ✨</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}