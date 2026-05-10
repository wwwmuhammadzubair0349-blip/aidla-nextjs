"use client";
// app/tools/ai/paraphraser/ParaphraserClient.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FREE_LIMIT        = 3;
const STORAGE_KEY       = "aidla_paraphraser_uses";

const STYLES = [
  { id:"formal",     label:"Formal",      desc:"Professional & business",  color:"#1a3a8f" },
  { id:"academic",   label:"Academic",    desc:"Scholarly & precise",       color:"#2563eb" },
  { id:"casual",     label:"Casual",      desc:"Friendly & conversational", color:"#16a34a" },
  { id:"creative",   label:"Creative",    desc:"Vivid & engaging",          color:"#d97706" },
  { id:"simplified", label:"Simplified",  desc:"Simple & easy to read",     color:"#0284c7" },
];

export default function ParaphraserClient() {
  const router  = useRouter();
  const [text,    setText]   = useState("");
  const [style,   setStyle]  = useState("formal");
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

  const handleParaphrase = async () => {
    if (!text.trim()) { setError("Please enter some text first."); return; }
    if (text.trim().length < 20) { setError("Text must be at least 20 characters."); return; }
    if (!canUse) return;
    setLoading(true); setError(""); setResult("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-text-tools`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ tool:"paraphrase", text:text.trim(), options:{ style, language:"auto" } }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Failed to paraphrase");
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
  const currentStyle = STYLES.find(s => s.id === style);

  const S = {
    page:  { minHeight:"100vh", background:"#f8fafc", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden" },
    wrap:  { maxWidth:900, margin:"0 auto", padding:"clamp(16px,4vw,32px) clamp(14px,4vw,24px) 60px", width:"100%" },
    card:  { background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:"clamp(14px,3vw,20px)", marginBottom:14, boxShadow:"0 1px 4px rgba(0,0,0,.04)" },
    label: { fontSize:"clamp(10px,2.5vw,11px)", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em", display:"block", marginBottom:8 },
    ta:    { width:"100%", padding:"12px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, color:"#0f172a", outline:"none", resize:"vertical", lineHeight:1.7, fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" },
    btn:   { width:"100%", padding:"13px 0", background:"linear-gradient(135deg,#0284c7,#3b82f6)", color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:15, cursor:"pointer", opacity:loading?0.7:1 },
  };

  return (
    <>
      <style>{`*{box-sizing:border-box}`}</style>
      <div style={S.page}>
        <div style={{ background:"#fff", borderBottom:"1px solid #f1f5f9", padding:"10px clamp(14px,4vw,24px)" }}>
          <nav style={{ maxWidth:900, margin:"0 auto", fontSize:"clamp(10px,2.5vw,12px)", color:"#94a3b8", display:"flex", gap:6, flexWrap:"wrap" }} aria-label="Breadcrumb">
            <Link href="/tools" style={{ color:"#64748b", textDecoration:"none", fontWeight:600 }}>Tools</Link><span>›</span>
            <Link href="/tools" style={{ color:"#64748b", textDecoration:"none", fontWeight:600 }}>AI Tools</Link><span>›</span>
            <span style={{ color:"#0f172a", fontWeight:600 }} aria-current="page">AI Paraphraser</span>
          </nav>
        </div>

        <div style={{ background:"linear-gradient(135deg,#0c4a6e,#0284c7)", padding:"clamp(24px,5vw,40px) clamp(14px,4vw,24px)", textAlign:"center" }}>
          <div style={{ fontSize:"clamp(28px,7vw,40px)", marginBottom:10 }} aria-hidden="true">🔄</div>
          <h1 style={{ margin:"0 0 8px", fontSize:"clamp(1.4rem,5vw,2rem)", fontWeight:900, color:"#fff" }}>AI Text Paraphraser</h1>
          <p style={{ margin:"0 0 14px", fontSize:"clamp(12px,3vw,15px)", color:"rgba(255,255,255,0.75)" }}>Powered by Groq AI · Rewrite in any style instantly</p>
          {!user && <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:24, padding:"5px 14px", fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.9)", fontWeight:600 }} role="status">
            {remaining > 0 ? `✅ ${remaining} free use${remaining!==1?"s":""} remaining` : "🔐 Login for unlimited"}
          </div>}
          {user && <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:24, padding:"5px 14px", fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.9)", fontWeight:600 }}>✅ Unlimited — Logged in</div>}
        </div>

        <div style={S.wrap}>
          {!canUse && !user && (
            <div style={{ background:"rgba(2,132,199,.07)", border:"1px solid rgba(2,132,199,.25)", borderRadius:16, padding:"clamp(16px,4vw,24px)", marginBottom:16, textAlign:"center" }} role="alert">
              <div style={{ fontSize:32, marginBottom:10 }} aria-hidden="true">🔐</div>
              <div style={{ fontSize:"clamp(14px,3.5vw,17px)", fontWeight:800, color:"#0c4a6e", marginBottom:6 }}>Free uses exhausted</div>
              <p style={{ color:"#64748b", fontSize:"clamp(12px,3vw,14px)", marginBottom:16, lineHeight:1.6 }}>Create a free AIDLA account for unlimited paraphrasing.</p>
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>router.push("/login?redirect=/tools/ai/paraphraser")} style={{ padding:"11px 24px", background:"linear-gradient(135deg,#0284c7,#3b82f6)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>🔑 Login</button>
                <button onClick={()=>router.push("/signup?redirect=/tools/ai/paraphraser")} style={{ padding:"11px 24px", background:"rgba(2,132,199,.1)", color:"#0284c7", border:"1px solid rgba(2,132,199,.25)", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>✨ Sign Up Free</button>
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16, alignItems:"start" }}>
            <div>
              <div style={S.card}>
                <label htmlFor="para-text" style={S.label}>Original Text</label>
                <textarea id="para-text" style={{ ...S.ta, minHeight:"clamp(160px,35vw,280px)" }}
                  value={text} onChange={e=>setText(e.target.value)}
                  placeholder="Type or paste the text you want to rewrite…"
                  disabled={!canUse && !user} maxLength={10000}/>
                <div style={{ fontSize:"clamp(10px,2.5vw,11px)", color:"#94a3b8", marginTop:6 }}>
                  {wordCount(text)} words · {text.length}/10,000 chars
                </div>
              </div>

              <div style={S.card}>
                <span style={S.label} id="style-lbl">Rewriting Style</span>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }} role="radiogroup" aria-labelledby="style-lbl">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={()=>setStyle(s.id)} aria-pressed={style===s.id}
                      style={{ padding:"10px 14px", borderRadius:10, border:"1px solid", fontSize:"clamp(12px,3vw,13px)", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between",
                        background: style===s.id ? `${s.color}12` : "#f8fafc",
                        color: style===s.id ? s.color : "#334155",
                        borderColor: style===s.id ? s.color : "#e2e8f0" }}>
                      <span style={{ fontWeight:700 }}>{s.label}</span>
                      <span style={{ fontSize:"clamp(10px,2vw,11px)", opacity:.7 }}>{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:14 }} role="alert">{error}</div>}

              <button style={S.btn} onClick={handleParaphrase} disabled={loading || (!canUse && !user)} aria-busy={loading}>
                {loading ? "⏳ Rewriting…" : `🔄 Rewrite in ${currentStyle?.label} Style`}
              </button>
            </div>

            <div style={S.card}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                <span style={S.label}>Rewritten Text</span>
                {result && (
                  <button onClick={handleCopy} aria-label="Copy rewritten text"
                    style={{ padding:"5px 12px", fontSize:11, fontWeight:700, border:`1px solid ${copied?"rgba(22,163,74,.3)":"#e2e8f0"}`, borderRadius:8, cursor:"pointer", background:copied?"rgba(22,163,74,.07)":"#f8fafc", color:copied?"#15803d":"#475569" }}>
                    {copied?"✅ Copied":"📋 Copy"}
                  </button>
                )}
              </div>
              {loading ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }} aria-live="polite">
                  <div style={{ fontSize:36, marginBottom:10 }} aria-hidden="true">🤖</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>AI is rewriting…</div>
                  <div style={{ fontSize:12, marginTop:6 }}>Usually takes 3-8 seconds</div>
                </div>
              ) : result ? (
                <div>
                  <div style={{ fontSize:14, color:"#334155", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result}</div>
                  <div style={{ marginTop:12, fontSize:11, color:"#94a3b8" }}>{wordCount(result)} words</div>
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }}>
                  <div style={{ fontSize:40, marginBottom:10 }} aria-hidden="true">🔄</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>Rewritten text will appear here</div>
                  <div style={{ fontSize:11, marginTop:6 }}>Choose a style and click Rewrite</div>
                </div>
              )}
            </div>
          </div>

          {!user && remaining > 0 && (
            <div style={{ marginTop:16, background:"rgba(2,132,199,.06)", border:"1px solid rgba(2,132,199,.15)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <div style={{ fontSize:"clamp(12px,3vw,13px)", color:"#0c4a6e" }}><strong>{remaining}</strong> free use{remaining!==1?"s":""} remaining</div>
              <button onClick={()=>router.push("/signup?redirect=/tools/ai/paraphraser")}
                style={{ padding:"7px 16px", background:"linear-gradient(135deg,#0284c7,#3b82f6)", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Get Unlimited Free →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}