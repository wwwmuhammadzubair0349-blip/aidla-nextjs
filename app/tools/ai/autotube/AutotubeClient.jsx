// app/autotube/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MAX_FREE_TRIES = 3;
const STORAGE_KEY = "autotube_free_tries";
// After 3 generations the RESULTS are blurred/locked — input is ALWAYS enabled

const TOOLS = [
  { icon:"⚡", label:"Quick Generator",   desc:"Instant titles, 30 tags & full SEO description from just a topic",  color:"#3b82f6" },
  { icon:"🎬", label:"Full Video A–Z",    desc:"Complete script, hook, intro, outro, CTA, upload checklist & more",  color:"#ef4444" },
  { icon:"📅", label:"30-Day Calendar",   desc:"Strategic content calendar with publish-ready titles for your niche", color:"#8b5cf6" },
  { icon:"💡", label:"Idea → Full Video", desc:"Pick an idea and generate the complete production package instantly",  color:"#f59e0b" },
  { icon:"🔤", label:"Title Optimizer",   desc:"Paste any title — AI rewrites it 5 ways with CTR scores & analysis",  color:"#06b6d4" },
  { icon:"💬", label:"Comment Replier",   desc:"Generate 3 smart, human-sounding replies for any YouTube comment",   color:"#10b981" },
  { icon:"📊", label:"Niche Analyzer",    desc:"Deep keyword research, content gaps & growth strategy for your niche", color:"#f97316" },
];

const STATS = [
  { value:"30+",  label:"SEO Tags Generated",   icon:"🏷️" },
  { value:"5",    label:"Optimized Title Variants", icon:"✏️" },
  { value:"A–Z",  label:"Complete Video Package",   icon:"🎬" },
  { value:"Free", label:"No Credit Card",           icon:"💳" },
];

/* ── Score ring (mini) ─────────────────────────────── */
function MiniRing({ score, color = "#22c55e" }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:44, height:44, flexShrink:0 }}>
      <svg width={44} height={44} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={4}/>
        <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#0f172a" }}>{score}</div>
    </div>
  );
}

/* ── Animated counter ──────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 40;
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Tag pill ──────────────────────────────────────── */
function TagPill({ text, color = "#ef4444" }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", background:`${color}12`, color, border:`1px solid ${color}28`, borderRadius:20 }}>
      {text}
    </span>
  );
}

/* ── Free tries badge ──────────────────────────────── */
function TriesBadge({ used }) {
  const remaining = MAX_FREE_TRIES - used;
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:99, padding:"5px 14px 5px 8px", fontSize:12, fontWeight:700, color:"#92400e" }}>
      <div style={{ display:"flex", gap:4 }}>
        {Array.from({ length: MAX_FREE_TRIES }).map((_, i) => (
          <div key={i} style={{ width:8, height:8, borderRadius:"50%", background: i < used ? "rgba(0,0,0,0.15)" : "#f59e0b", transition:"background 0.3s", boxShadow: i < used ? "none" : "0 0 6px rgba(245,158,11,0.6)" }}/>
        ))}
      </div>
      {remaining > 0 ? `${remaining} free tr${remaining === 1 ? "y" : "ies"} left` : "Free tries used"}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function AutoTubePublic() {
  const router = useRouter();
  const resultRef = useRef(null);

  const [topic,      setTopic]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [error,      setError]      = useState("");
  const [triesUsed,  setTriesUsed]  = useState(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10); } catch { return 0; }
  });
  const [locked,     setLocked]     = useState(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) >= MAX_FREE_TRIES; } catch { return false; }
  });
  const [progress,   setProgress]   = useState(0);

  useEffect(() => {
    document.title = "AutoTube by AIDLA — Free YouTube SEO & AI Automation Tool";
  }, []);

  const handlePreview = async () => {
    if (!topic.trim() || loading) return;
    // Input is ALWAYS enabled — we just track generations for blur logic
    setLoading(true); setError(""); setPreview(null); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p + 14, 88)), 500);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/autotube`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ tool:"quick_generator", input:{ topic:topic.trim() } }),
      });
      const data = await res.json();
      clearInterval(tick); setProgress(100);

      if (data?.ok && data?.result) {
        // Count this generation — blur kicks in when count >= MAX_FREE_TRIES
        const newTries = triesUsed + 1;
        setTriesUsed(newTries);
        try { localStorage.setItem(STORAGE_KEY, String(newTries)); } catch {}
        setTimeout(() => {
          setPreview(data.result);
          // locked = true means this result shows the blur overlay on full content
          if (newTries >= MAX_FREE_TRIES) setLocked(true);
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 150);
        }, 250);
      } else {
        setError("Could not generate preview. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    clearInterval(tick);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fafbff", fontFamily:"'DM Sans',sans-serif", overflowX:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::placeholder { color:rgba(100,116,139,0.5) !important; }
        input:focus { border-color:rgba(239,68,68,0.4) !important; box-shadow:0 0 0 3px rgba(239,68,68,0.08) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.8)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .skel { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.4s ease infinite; border-radius:8px; }
        .tool-card:hover { transform:translateY(-5px) !important; box-shadow:0 16px 40px rgba(11,20,55,0.12) !important; }
        .try-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(239,68,68,0.4) !important; }
        .try-btn:active:not(:disabled) { transform:none; }
      `}</style>

      {/* ── Layered background ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:"70vw", height:"70vw", maxWidth:700, maxHeight:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 65%)", filter:"blur(60px)", top:"-25%", left:"-15%" }}/>
        <div style={{ position:"absolute", width:"50vw", height:"50vw", maxWidth:500, maxHeight:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 70%)", filter:"blur(60px)", top:"30%", right:"-15%" }}/>
        <div style={{ position:"absolute", width:"40vw", height:"40vw", maxWidth:400, maxHeight:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.05) 0%,transparent 70%)", filter:"blur(60px)", bottom:"-10%", left:"20%" }}/>
        {/* Subtle grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(11,20,55,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(11,20,55,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", opacity:0.6 }}/>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(28px,5vw,72px) clamp(16px,4vw,32px) 80px", position:"relative", zIndex:1 }}>

        {/* ══ HERO ══ */}
        <div className="fade-up-section" style={{ textAlign:"center", marginBottom:52, opacity:0, animation:"fadeUp 0.5s ease forwards", animationDelay:"0.05s" }}>

          {/* Badge */}
          <div className="fade-up-section" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#ef4444,#f97316)", color:"#fff", padding:"6px 18px", borderRadius:99, fontSize:11, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:20, boxShadow:"0 6px 20px rgba(239,68,68,0.35)", opacity:0, animation:"fadeUp 0.5s ease forwards", animationDelay:"0.1s" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.7)", animation:"pulse-dot 1.5s ease infinite" }}/>
            🎬 YouTube Automation Platform
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6.5vw,3.5rem)", fontWeight:900, color:"#0b1437", lineHeight:1.1, marginBottom:16, letterSpacing:"-0.02em" }}>
            Grow Your Channel{" "}
            <span style={{ position:"relative", display:"inline-block" }}>
              <span style={{ background:"linear-gradient(135deg,#ef4444 20%,#f97316 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Faster</span>
              <svg style={{ position:"absolute", bottom:-6, left:0, width:"100%", overflow:"visible" }} height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                <path d="M0 6 Q50 0 100 6" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>{" "}
            with AI
          </h1>

          <p style={{ fontSize:"clamp(14px,2.5vw,17px)", color:"#475569", maxWidth:560, margin:"0 auto 12px", lineHeight:1.75 }}>
            Generate SEO-optimized titles, full scripts, 30 tags, descriptions, thumbnails and complete video packages — in seconds.
          </p>

          {/* Tries badge */}
          <div style={{ marginBottom:28, display:"flex", justifyContent:"center" }}>
            <TriesBadge used={triesUsed}/>
          </div>

          {/* ── Input box ── */}
          <div style={{ maxWidth:660, margin:"0 auto", background:"#fff", borderRadius:24, padding:"clamp(18px,3vw,28px)", border:"1px solid rgba(239,68,68,0.12)", boxShadow:"0 12px 40px rgba(11,20,55,0.08), 0 1px 0 rgba(255,255,255,0.8) inset" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#374151" }}>
                🚀 Try it free — no account needed:
              </div>
              {triesUsed < MAX_FREE_TRIES && (
                <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>
                  {MAX_FREE_TRIES - triesUsed} free preview{MAX_FREE_TRIES - triesUsed !== 1 ? "s" : ""} · full results need login
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePreview()}
                placeholder="e.g. How to make money online as a student in 2025…"
                style={{ flex:"1 1 200px", padding:"13px 16px", border:"1.5px solid #e2e8f0", borderRadius:14, fontSize:14, outline:"none", minWidth:0, color:"#0f172a", background:"#fff", transition:"all 0.15s", fontFamily:"inherit" }}
              />
              <button className="try-btn" onClick={handlePreview} disabled={loading || !topic.trim()}
                style={{ padding:"13px 24px", background:"linear-gradient(135deg,#ef4444,#f97316)", color:"#fff", border:"none", borderRadius:14, fontWeight:800, fontSize:14, cursor:loading||!topic.trim()?"not-allowed":"pointer", boxShadow:"0 4px 16px rgba(239,68,68,0.3)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                {loading ? "⏳ Generating…" : "✨ Generate Preview"}
              </button>
            </div>

            {/* Progress bar */}
            {loading && (
              <div style={{ marginTop:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#94a3b8", marginBottom:6, fontWeight:600 }}>
                  <span>⚡ Generating SEO content…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{ height:4, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:99, transition:"width 0.4s ease", boxShadow:"0 0 8px rgba(239,68,68,0.4)" }}/>
                </div>
              </div>
            )}

            {error && (
              <div style={{ marginTop:10, fontSize:12, color:"#dc2626", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:8, padding:"8px 12px" }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Social proof pills */}
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:8, marginTop:20 }}>
            {["✅ No credit card","✅ Free forever","✅ 7 AI tools","✅ Instant results"].map(p => (
              <span key={p} style={{ fontSize:12, fontWeight:700, color:"#475569", background:"rgba(255,255,255,0.8)", border:"1px solid rgba(11,20,55,0.07)", borderRadius:99, padding:"4px 12px" }}>{p}</span>
            ))}
          </div>
        </div>

        {/* ══ STATS ROW ══ */}
        <div className="fade-up-section" style={{ opacity:0, animation:"fadeUp 0.5s ease forwards", animationDelay:"0.2s", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:52 }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ background:"rgba(255,255,255,0.85)", borderRadius:18, padding:"18px 16px", border:"1px solid rgba(11,20,55,0.06)", textAlign:"center", backdropFilter:"blur(10px)", boxShadow:"0 2px 12px rgba(11,20,55,0.05)" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#0b1437", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ══ PREVIEW RESULTS ══ */}
        {(loading || preview) && (
          <div ref={resultRef}
            className="fade-up-section"
            style={{ opacity:0, animation:"fadeUp 0.45s ease forwards", animationDelay:"0.05s", maxWidth:760, margin:"0 auto 52px" }}>

            {/* Result card */}
            <div style={{ background:"#fff", borderRadius:24, border:"1px solid rgba(11,20,55,0.07)", overflow:"hidden", boxShadow:"0 16px 48px rgba(11,20,55,0.09)", position:"relative" }}>

              {/* Card header */}
              <div style={{ padding:"16px 24px", background:"linear-gradient(135deg,#0b1437,#1a3a8f)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#ef4444,#f97316)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚡</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#fff" }}>Quick Generator — Live Preview</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontWeight:600 }}>
                      {topic ? `"${topic.slice(0,50)}${topic.length>50?"…":""}"` : ""}
                    </div>
                  </div>
                </div>
                {!loading && preview?.seo_score && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <MiniRing score={preview.seo_score} color={preview.seo_score >= 85 ? "#22c55e" : preview.seo_score >= 65 ? "#f59e0b" : "#ef4444"}/>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>SEO Score</div>
                  </div>
                )}
              </div>

              {/* ── Titles (ALWAYS visible) ── */}
              <div style={{ padding:"20px 24px", borderBottom:"1px solid #f8fafc" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>
                  🎯 Title Suggestions — Free Preview
                </div>
                {loading ? (
                  [88,72,80].map((w,i) => <div key={i} className="skel" style={{ height:44, marginBottom:8, width:`${w}%` }}/>)
                ) : (
                  preview?.titles?.slice(0,3).map((t, i) => (
                    <div key={i}
                      className="fade-up-section"
                      style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 14px", background:"#f8fafc", borderRadius:12, marginBottom:8, border:"1px solid #f1f5f9", opacity:0, animation:"fadeUp 0.3s ease forwards", animationDelay:`${i*0.08}s` }}>
                      <span style={{ width:20, height:20, borderRadius:6, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#ef4444", flexShrink:0, marginTop:1 }}>{i+1}</span>
                      <span style={{ flex:1, fontSize:14, fontWeight:600, color:"#0f172a", lineHeight:1.45 }}>{t}</span>
                      <span style={{ fontSize:10, color: t.length > 70 ? "#ef4444" : "#94a3b8", fontWeight:700, flexShrink:0 }}>{t.length}</span>
                    </div>
                  ))
                )}
                {!loading && preview?.titles?.length > 3 && (
                  <div style={{ fontSize:12, color:"#94a3b8", padding:"6px 14px", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:16, height:16, borderRadius:"50%", background:"rgba(239,68,68,0.1)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>+</span>
                    {preview.titles.length - 3} more titles available in Studio
                  </div>
                )}
              </div>

              {/* ── Tags (ALWAYS visible — first 8) ── */}
              <div style={{ padding:"18px 24px", borderBottom:"1px solid #f8fafc" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>
                  🏷️ SEO Tags Preview ({loading ? "…" : `${preview?.tags?.length || 0} total`})
                </div>
                {loading ? (
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[60,80,50,70,90,55].map((w,i) => <div key={i} className="skel" style={{ height:24, width:w }}/>)}
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {preview?.tags?.slice(0,8).map(t => <TagPill key={t} text={t}/>)}
                    </div>
                    {preview?.tags?.length > 8 && (
                      <div style={{ marginTop:8, fontSize:11, color:"#94a3b8", fontWeight:600 }}>+ {preview.tags.length - 8} more tags unlocked in Studio</div>
                    )}
                  </>
                )}
              </div>

              {/* ── Description (blurred on 3rd+ generation result) ── */}
              <div style={{ padding:"18px 24px", borderBottom:"1px solid #f8fafc", position:"relative", overflow:"hidden" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>
                  📝 Full SEO Description
                </div>
                <div style={{ filter:locked?"blur(7px)":"none", userSelect:locked?"none":"auto", pointerEvents:locked?"none":"auto", transition:"filter 0.3s" }}>
                  {loading ? (
                    [100,85,92,78,88,60].map((w,i) => <div key={i} className="skel" style={{ height:12, marginBottom:8, width:`${w}%` }}/>)
                  ) : (
                    <div style={{ fontSize:13, color:"#374151", lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                      {preview?.description?.slice(0, 280)}{preview?.description?.length > 280 ? "…" : ""}
                    </div>
                  )}
                </div>
                {/* Lock overlay — appears when this result is the 3rd+ generation */}
                {locked && !loading && (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(248,250,252,0.75)", backdropFilter:"blur(2px)" }}>
                    <div style={{ background:"#fff", border:"1px solid rgba(239,68,68,0.2)", borderRadius:18, padding:"18px 24px", textAlign:"center", boxShadow:"0 12px 32px rgba(0,0,0,0.12)", maxWidth:280 }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>🔐</div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", marginBottom:4 }}>Login to unlock full results</div>
                      <div style={{ fontSize:12, color:"#64748b", marginBottom:14, lineHeight:1.5 }}>Description, all 30 tags, hashtags + 6 more tools — free</div>
                      <Link href="/login?redirect=user/AutoTubeStudio"
                        style={{ display:"block", padding:"10px 20px", background:"linear-gradient(135deg,#ef4444,#f97316)", color:"#fff", borderRadius:12, textDecoration:"none", fontWeight:800, fontSize:13, boxShadow:"0 4px 14px rgba(239,68,68,0.3)" }}>
                        🚀 Login / Sign Up — Free
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Hashtags + Script (always blurred — teaser) ── */}
              <div style={{ padding:"18px 24px", position:"relative", overflow:"hidden" }}>
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>
                  🎬 Full Script + Hashtags + SEO Score + 6 More Tools
                </div>
                <div style={{ filter:"blur(9px)", userSelect:"none", pointerEvents:"none" }}>
                  {[95,70,82,60,88,50,75,65].map((w,i) => (
                    <div key={i} style={{ height:11, background:"#f1f5f9", borderRadius:6, marginBottom:9, width:`${w}%` }}/>
                  ))}
                </div>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Link href="/login?redirect=user/AutoTubeStudio"
                    style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"13px 30px", background:"linear-gradient(135deg,#0b1437,#1a3a8f)", color:"#fff", borderRadius:14, textDecoration:"none", fontWeight:800, fontSize:14, boxShadow:"0 8px 28px rgba(11,20,55,0.3)", transition:"transform 0.15s" }}>
                    <span style={{ fontSize:18 }}>🚀</span> Unlock Full Studio — Free
                  </Link>
                </div>
              </div>
            </div>

            {/* Post-result CTA — stronger after 3rd try, softer before */}
            {preview && !loading && (
              <div className="fade-up-section" style={{ opacity:0, animation:"fadeUp 0.3s ease forwards", animationDelay:"0.2s", marginTop:16, background: locked ? "linear-gradient(135deg,#0b1437,#1a3a8f)" : "rgba(255,255,255,0.9)", borderRadius:20, padding:"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, boxShadow: locked ? "0 12px 32px rgba(11,20,55,0.2)" : "0 4px 16px rgba(11,20,55,0.07)", border: locked ? "1px solid rgba(245,158,11,0.12)" : "1px solid rgba(11,20,55,0.07)" }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:900, color: locked ? "#fff" : "#0b1437", marginBottom:3 }}>
                    {locked ? "🎯 Unlock the full package — it's free" : "🚀 Want the full script, all 30 tags & 6 more tools?"}
                  </div>
                  <div style={{ fontSize:12, color: locked ? "rgba(255,255,255,0.5)" : "#64748b", lineHeight:1.5 }}>
                    Free account · Complete A-Z packages · 7 tools · No credit card
                  </div>
                </div>
                <Link href="/login?redirect=user/AutoTubeStudio"
                  style={{ padding:"11px 26px", background:"linear-gradient(135deg,#f59e0b,#fcd34d)", color:"#0b1437", borderRadius:12, textDecoration:"none", fontWeight:900, fontSize:13, boxShadow:"0 4px 16px rgba(245,158,11,0.35)", whiteSpace:"nowrap" }}>
                  Open Studio Free ✨
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ══ 7 TOOLS GRID ══ */}
        <div style={{ marginBottom:56 }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10 }}>Everything Inside AutoTube Studio</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:900, color:"#0b1437", letterSpacing:"-0.02em", lineHeight:1.2 }}>
              7 Powerful AI Tools
            </h2>
            <p style={{ fontSize:14, color:"#64748b", marginTop:8, maxWidth:480, margin:"8px auto 0", lineHeight:1.6 }}>
              Everything a YouTube creator needs — from idea to upload-ready.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:14 }}>
            {TOOLS.map((t,i) => (
              <div key={i} className="tool-card"
                onClick={() => router.push("/login?redirect=user/AutoTubeStudio")}
                style={{ background:"rgba(255,255,255,0.88)", borderRadius:22, padding:"22px 20px", border:"1px solid rgba(11,20,55,0.07)", boxShadow:"0 4px 16px rgba(11,20,55,0.06)", cursor:"pointer", transition:"all 0.22s", position:"relative", overflow:"hidden", backdropFilter:"blur(10px)" }}>
                {/* Color accent top */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2.5, background:`linear-gradient(90deg,${t.color}66,${t.color})` }}/>
                <div style={{ width:44, height:44, borderRadius:13, background:`${t.color}12`, border:`1px solid ${t.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:12 }}>{t.icon}</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#0b1437", marginBottom:7 }}>{t.label}</div>
                <div style={{ fontSize:12, color:"#64748b", lineHeight:1.65, marginBottom:14 }}>{t.desc}</div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:800, color:t.color }}>
                  Open in Studio <span style={{ fontSize:13 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ HOW IT WORKS ══ */}
        <div style={{ marginBottom:56 }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:10 }}>Simple Process</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:900, color:"#0b1437", letterSpacing:"-0.02em" }}>
              From Idea to Uploaded in Minutes
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {[
              { step:"01", icon:"💡", title:"Enter Your Topic", desc:"Type your video idea or niche — as specific or broad as you want" },
              { step:"02", icon:"⚡", title:"AI Generates", desc:"Our engine creates titles, scripts, tags, descriptions and more in seconds" },
              { step:"03", icon:"📋", title:"Copy & Customize", desc:"Copy any section instantly and tweak to match your voice" },
              { step:"04", icon:"🚀", title:"Upload & Rank", desc:"Upload with confidence — fully SEO-optimized and ready to perform" },
            ].map((s,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.75)", borderRadius:20, padding:"22px 18px", border:"1px solid rgba(11,20,55,0.06)", textAlign:"center", backdropFilter:"blur(8px)" }}>
                <div style={{ fontSize:10, fontWeight:900, color:"#ef4444", letterSpacing:"0.12em", marginBottom:10, opacity:0.7 }}>{s.step}</div>
                <div style={{ fontSize:28, marginBottom:10, display:"block", animation:`float ${3+i*0.4}s ease-in-out infinite` }}>{s.icon}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#0b1437", marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:12, color:"#64748b", lineHeight:1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CTA BANNER ══ */}
        <div style={{ background:"linear-gradient(135deg,#0b1437 0%,#1a3a8f 60%,#0b1437 100%)", borderRadius:32, padding:"clamp(28px,5vw,48px)", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:22, boxShadow:"0 20px 60px rgba(11,20,55,0.25)", border:"1px solid rgba(245,158,11,0.12)", position:"relative", overflow:"hidden" }}>
          {/* Gold shimmer line */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent)" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(239,68,68,0.3),transparent)" }}/>
          <div style={{ position:"absolute", top:"-40%", right:"-5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:99, padding:"4px 12px", fontSize:10, fontWeight:800, color:"#fbbf24", letterSpacing:"0.08em", marginBottom:12 }}>
              ✨ FREE FOREVER
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,4vw,2rem)", fontWeight:900, color:"#fff", marginBottom:8, letterSpacing:"-0.02em", lineHeight:1.2 }}>
              Start Automating Your YouTube Channel
            </h2>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, lineHeight:1.6, maxWidth:420 }}>
              Free account. Complete A-Z video packages. 7 AI tools. Unlimited use. No credit card.
            </p>
          </div>
          <Link href="/login?redirect=user/AutoTubeStudio"
            style={{ position:"relative", padding:"15px 36px", background:"linear-gradient(135deg,#f59e0b,#fcd34d)", color:"#0b1437", borderRadius:99, fontWeight:900, fontSize:15, textDecoration:"none", boxShadow:"0 6px 24px rgba(245,158,11,0.4)", whiteSpace:"nowrap", transition:"transform 0.2s" }}>
            Open Studio Free ✨
          </Link>
        </div>

      </div>
    </div>
  );
}