"use client";
// app/tools/ai/email-writer/EmailWriterClient.jsx
// Changes: "use client", import.meta.env → process.env, Link to→href, framer-motion → CSS, Helmet → removed

import { useState, useRef, useCallback } from "react";
import "./EmailWriterClient.css";
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