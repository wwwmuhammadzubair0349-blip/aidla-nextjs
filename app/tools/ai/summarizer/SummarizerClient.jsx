"use client";
// app/tools/ai/summarizer/SummarizerClient.jsx
// Changes: "use client", import.meta.env→process.env, Link to→href, useNavigate→useRouter, Helmet→removed

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FREE_LIMIT        = 3;
const STORAGE_KEY       = "aidla_summarizer_uses";

const LENGTHS = [
  { id:"short",   label:"Short",   desc:"2-3 sentences" },
  { id:"medium",  label:"Medium",  desc:"1 paragraph"   },
  { id:"long",    label:"Long",    desc:"2-3 paragraphs" },
  { id:"bullets", label:"Bullets", desc:"Key points"    },
];

const CSS = `

.sum-root{min-height:100vh;background:#f8fafc;font-family:'DM Sans',sans-serif;overflow-x:hidden}
.sum-root*{box-sizing:border-box}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

export default function SummarizerClient() {
  const router  = useRouter();
  const [text,    setText]   = useState("");
  const [length,  setLength] = useState("medium");
  const [result,  setResult] = useState("");
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState("");
  const [uses,    setUses]   = useState(0);
  const [user,    setUser]   = useState(null);
  const [copied,  setCopied] = useState(false);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY)||"0");
    setUses(stored);
    supabase.auth.getUser().then(({ data }) => setUser(data?.user||null));
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - uses);
  const canUse    = user || remaining > 0;

  const handleSummarize = async () => {
    if (!text.trim()) { setError("Please paste some text first."); return; }
    if (text.trim().length < 20) { setError("Text must be at least 20 characters."); return; }
    if (!canUse) return;
    setLoading(true); setError(""); setResult("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-text-tools`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ tool:"summarize", text:text.trim(), options:{ length, language:"auto" } }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to summarize");
      setResult(data.result);
      if (!user) { const n = uses + 1; setUses(n); localStorage.setItem(STORAGE_KEY, String(n)); }
    } catch(e) { setError(e.message || "Something went wrong."); }
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  const wordCount = (t) => t.trim().split(/\s+/).filter(Boolean).length;

  const S = {
    page:  { minHeight:"100vh", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" },
    wrap:  { maxWidth:900, margin:"0 auto", padding:"clamp(16px,4vw,32px) clamp(14px,4vw,24px) 60px", width:"100%" },
    card:  { background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:"clamp(14px,3vw,20px)", marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,.04)" },
    label: { fontSize:"clamp(10px,2.5vw,11px)", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:8 },
    ta:    { width:"100%", padding:"12px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, color:"#0f172a", outline:"none", resize:"vertical", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" },
    btn:   { width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#7c3aed,#8b5cf6)", color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:15, cursor:"pointer", opacity:loading?0.7:1 },
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={S.page}>
        <div style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", padding:"10px clamp(14px,4vw,24px)" }}>
          <nav style={{ maxWidth:900, margin:"0 auto", fontSize:"clamp(10px,2.5vw,12px)", color:"#94a3b8", display:"flex", gap:6, flexWrap:"wrap" }} aria-label="Breadcrumb">
            <Link href="/tools" style={{ color:"#64748b", textDecoration:"none", fontWeight:600 }}>Tools</Link><span>›</span>
            <Link href="/tools" style={{ color:"#64748b", textDecoration:"none", fontWeight:600 }}>AI Tools</Link><span>›</span>
            <span style={{ color:"#0f172a", fontWeight:600 }} aria-current="page">AI Summarizer</span>
          </nav>
        </div>

        <div style={{ background:"linear-gradient(135deg,#1e3a8a,#2563eb)", padding:"clamp(24px,5vw,40px) clamp(14px,4vw,24px)", textAlign:"center" }}>
          <div style={{ fontSize:"clamp(28px,7vw,40px)", marginBottom:10 }} aria-hidden="true">📝</div>
          <h1 style={{ margin:"0 0 8px", fontSize:"clamp(1.4rem,5vw,2rem)", fontWeight:900, color:"#fff" }}>AI Text Summarizer</h1>
          <p style={{ margin:"0 0 14px", fontSize:"clamp(12px,3vw,15px)", color:"rgba(255,255,255,0.75)" }}>Powered by Groq AI · Summarize any text in seconds</p>
          {!user && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:24, padding:"5px 14px", fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.9)", fontWeight:600 }} role="status">
              {remaining > 0 ? `✅ ${remaining} free use${remaining!==1?"s":""} remaining` : "🔐 Free uses used — Login for unlimited"}
            </div>
          )}
          {user && <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:24, padding:"5px 14px", fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.9)", fontWeight:600 }}>✅ Unlimited — Logged in</div>}
        </div>

        <div style={S.wrap}>
          {!canUse && !user && (
            <div style={{ background:"rgba(37,99,235,.07)", border:"1px solid rgba(37,99,235,.25)", borderRadius:16, padding:"clamp(16px,4vw,24px)", marginBottom:16, textAlign:"center" }} role="alert">
              <div style={{ fontSize:32, marginBottom:10 }} aria-hidden="true">🔐</div>
              <div style={{ fontSize:"clamp(14px,3.5vw,17px)", fontWeight:800, color:"#1e3a8a", marginBottom:6 }}>Free uses exhausted</div>
              <p style={{ color:"#64748b", fontSize:"clamp(12px,3vw,14px)", marginBottom:16, lineHeight:1.6 }}>Create a free AIDLA account for unlimited access.</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>router.push("/login?redirect=/tools/ai/summarizer")} style={{ padding:"11px 24px", background:"linear-gradient(135deg,#1e3a8a,#2563eb)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>🔑 Login</button>
                <button onClick={()=>router.push("/signup?redirect=/tools/ai/summarizer")} style={{ padding:"11px 24px", background:"rgba(37,99,235,.1)", color:"#2563eb", border:"1px solid rgba(37,99,235,.25)", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>✨ Sign Up Free</button>
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16, alignItems:"start" }}>
            <div>
              <div style={S.card}>
                <label htmlFor="sum-text" style={S.label}>Paste Your Text</label>
                <textarea id="sum-text" style={{ ...S.ta, minHeight:"clamp(160px,35vw,280px)" }}
                  value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Paste any article, essay, news, document or any text here…"
                  disabled={!canUse && !user} maxLength={10000}/>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"clamp(10px,2.5vw,11px)", color:"#94a3b8", marginTop:6 }}>
                  <span>{wordCount(text).toLocaleString()} words · {text.length.toLocaleString()} chars</span>
                  <span>Max: 10,000 chars</span>
                </div>
              </div>

              <div style={S.card}>
                <span style={S.label} id="length-lbl">Summary Length</span>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:7 }} role="radiogroup" aria-labelledby="length-lbl">
                  {LENGTHS.map(l => (
                    <button key={l.id} onClick={()=>setLength(l.id)} aria-pressed={length===l.id}
                      style={{ padding:"10px 8px", borderRadius:10, border:"1px solid", fontSize:"clamp(11px,2.5vw,13px)", cursor:"pointer", textAlign:"left",
                        background: length===l.id ? "linear-gradient(135deg,#7c3aed,#8b5cf6)" : "#f8fafc",
                        color: length===l.id ? "#fff" : "#334155",
                        borderColor: length===l.id ? "#7c3aed" : "#e2e8f0" }}>
                      <div style={{ fontWeight:700 }}>{l.label}</div>
                      <div style={{ fontSize:"clamp(9px,2vw,11px)", opacity:.75, marginTop:2 }}>{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:14 }} role="alert">{error}</div>}

              <button style={S.btn} onClick={handleSummarize} disabled={loading || (!canUse && !user)} aria-busy={loading}>
                {loading ? "⏳ Summarizing…" : "✨ Summarize with AI"}
              </button>
            </div>

            <div style={S.card}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                <span style={S.label}>Summary</span>
                {result && (
                  <button onClick={handleCopy} aria-label="Copy summary"
                    style={{ padding:"5px 12px", fontSize:11, fontWeight:700, border:`1px solid ${copied?"rgba(22,163,74,.3)":"#e2e8f0"}`, borderRadius:8, cursor:"pointer", background:copied?"rgba(22,163,74,.07)":"#f8fafc", color:copied?"#15803d":"#475569" }}>
                    {copied?"✅ Copied":"📋 Copy"}
                  </button>
                )}
              </div>
              {loading ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }} aria-live="polite">
                  <div style={{ fontSize:36, marginBottom:10 }} aria-hidden="true">🤖</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>AI is summarizing…</div>
                  <div style={{ fontSize:12, marginTop:6 }}>Usually takes 3-8 seconds</div>
                </div>
              ) : result ? (
                <div>
                  <div style={{ fontSize:14, color:"#334155", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div>
                  <div style={{ marginTop:12, fontSize:11, color:"#94a3b8", display:"flex", gap:12 }}>
                    <span>{wordCount(result)} words in summary</span>
                    <span>{wordCount(text)>0?Math.round((1-wordCount(result)/wordCount(text))*100)+"% shorter":""}</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }}>
                  <div style={{ fontSize:40, marginBottom:10 }} aria-hidden="true">📝</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Summary will appear here</div>
                  <div style={{ fontSize:11, marginTop:6 }}>Paste text and click Summarize</div>
                </div>
              )}
            </div>
          </div>

          {!user && remaining > 0 && remaining <= FREE_LIMIT && (
            <div style={{ marginTop:16, background:"rgba(37,99,235,.06)", border:"1px solid rgba(37,99,235,.15)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <div style={{ fontSize:"clamp(12px,3vw,13px)", color:"#1e3a8a" }}><strong>{remaining}</strong> free use{remaining!==1?"s":""} remaining</div>
              <button onClick={()=>router.push("/signup?redirect=/tools/ai/summarizer")}
                style={{ padding:"7px 16px", background:"linear-gradient(135deg,#1e3a8a,#2563eb)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Get Unlimited Free →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}