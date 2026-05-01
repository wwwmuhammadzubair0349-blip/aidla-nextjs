"use client";
// app/user/mining/page.jsx
// Converted from React Router Mining.jsx
//
// Changes:
//   1. "use client" directive
//   2. import { useNavigate } from "react-router-dom" → import { useRouter } from "next/navigation"
//   3. const navigate = useNavigate() → const router = useRouter()
//   4. navigate("/user/wallet/invite") → router.push("/user/wallet/invite")
//   5. supabase import: ../../lib/supabase → @/lib/supabase
//   6. createPortal already uses document.body — safe with "use client"
//   7. All logic, CSS, sub-components 100% identical

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const COIN_DECIMALS = 2;
const fmt  = (n) => Number(n).toFixed(COIN_DECIMALS);
const fmtS = (n) => Number(n).toFixed(2);

function msToHMS(ms) {
  const s  = Math.max(0, Math.floor(ms / 1000));
  const h  = Math.floor(s / 3600);
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sc = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}h ${m}m ${sc}s` : `${m}m ${sc}s`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone:"Asia/Dubai", day:"2-digit", month:"short",
    year:"numeric", hour:"2-digit", minute:"2-digit",
  });
}

function OdometerDigit({ digit }) {
  return (
    <span style={{ display:"inline-block", width:"0.6em", height:"1em", overflow:"hidden", verticalAlign:"top" }}>
      <span style={{ display:"flex", flexDirection:"column", transform:`translateY(-${digit*10}%)`, transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        {[0,1,2,3,4,5,6,7,8,9].map(d=>(
          <span key={d} style={{ height:"1em", display:"flex", alignItems:"center", justifyContent:"center" }}>{d}</span>
        ))}
      </span>
    </span>
  );
}

function OdometerCounter({ value, color="#2563eb" }) {
  const str = String(Math.floor(Math.abs(value))).padStart(4,"0");
  const dec = fmt(value).split(".")[1] || "00";
  return (
    <div style={{ fontFamily:"'Inter',monospace", fontSize:"2.4rem", fontWeight:800, color, display:"flex", justifyContent:"center", alignItems:"baseline", gap:2, letterSpacing:"-0.02em" }}>
      <div style={{ display:"flex" }}>{str.split("").map((d,i)=><OdometerDigit key={i} digit={parseInt(d)}/>)}</div>
      <span style={{ margin:"0 2px" }}>.</span>
      <div style={{ display:"flex" }}>{dec.split("").map((d,i)=><OdometerDigit key={i} digit={parseInt(d)}/>)}</div>
    </div>
  );
}

function MiningVisual({ isMining, isDone, pct=0, earned=0, rate=0 }) {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    if (!isMining||isDone) return;
    const iv = setInterval(()=>setDots(d=>(d+1)%4), 600);
    return () => clearInterval(iv);
  }, [isMining, isDone]);
  const statusColor  = isDone?"#16a34a":isMining?"#2563eb":"#94a3b8";
  const statusBg     = isDone?"#f0fdf4":isMining?"#eff6ff":"#f8fafc";
  const statusBorder = isDone?"#bbf7d0":isMining?"#bfdbfe":"#e2e8f0";
  return (
    <div style={{ padding:"28px 24px 24px", background:statusBg, borderBottom:`1px solid ${statusBorder}`, transition:"background 0.4s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ position:"relative", width:10, height:10 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:statusColor }}/>
          {isMining&&!isDone&&<div style={{ position:"absolute", inset:0, borderRadius:"50%", background:statusColor, opacity:0.3, animation:"pulse 1.8s ease-in-out infinite" }}/>}
        </div>
        <span style={{ fontSize:"0.72rem", fontWeight:700, color:statusColor, textTransform:"uppercase", letterSpacing:"0.08em" }}>
          {isDone?"Session complete":isMining?`Mining${".".repeat(dots)}`:"Ready to mine"}
        </span>
        {isMining&&!isDone&&<span style={{ marginLeft:"auto", fontSize:"0.7rem", color:"#64748b", fontWeight:600 }}>{fmtS(rate)}/hr</span>}
      </div>
      {isMining&&(
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ position:"relative", width:110, height:110 }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="46" fill="none" stroke={isDone?"#bbf7d0":"#dbeafe"} strokeWidth="8"/>
              <circle cx="55" cy="55" r="46" fill="none" stroke={isDone?"#16a34a":"#2563eb"} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*46}`} strokeDashoffset={`${2*Math.PI*46*(1-(pct/100))}`}
                style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
              <span style={{ fontSize:"1.1rem", fontWeight:800, color:statusColor, letterSpacing:"-0.02em" }}>{Math.floor(pct)}%</span>
              <span style={{ fontSize:"0.58rem", color:"#94a3b8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>complete</span>
            </div>
          </div>
        </div>
      )}
      {!isMining&&(
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"#f1f5f9", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>⛏️</div>
        </div>
      )}
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(2.2);opacity:0}}`}</style>
    </div>
  );
}

function FloatingClaimBtn({ show, earned, claiming, onClick }) {
  if (!show) return null;
  return (
    <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", width:"calc(100% - 24px)", maxWidth:500, zIndex:9990 }}>
      <button onClick={onClick} disabled={claiming}
        style={{ width:"100%", background:"linear-gradient(135deg,#16a34a,#22c55e)", border:"none", borderRadius:40, padding:"15px 20px", color:"white", fontWeight:700, fontSize:"0.95rem", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 24px rgba(34,197,94,0.3)", cursor:claiming?"not-allowed":"pointer" }}>
        <span style={{ fontSize:"1.2rem" }}>🎁</span>
        <div style={{ flex:1, textAlign:"left" }}>
          <div style={{ fontSize:"0.85rem" }}>{claiming?"Processing…":"Claim Rewards"}</div>
          <div style={{ fontSize:"0.68rem", opacity:0.8 }}>+{fmtS(earned)} coins ready</div>
        </div>
        <span style={{ fontSize:"1.1rem" }}>→</span>
      </button>
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:20, overflow:"hidden", marginBottom:14, boxShadow:"0 2px 8px rgba(0,0,0,0.03)", ...style }}>{children}</div>;
}
function CardHeader({ title, right }) {
  return (
    <div style={{ padding:"14px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ fontSize:"0.7rem", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em" }}>{title}</div>
      {right}
    </div>
  );
}
function StatPill({ label, value }) {
  return (
    <div style={{ background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:14, padding:"11px 8px", textAlign:"center", flex:1 }}>
      <div style={{ fontSize:"0.58rem", textTransform:"uppercase", color:"#94a3b8", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#0f172a" }}>{value}</div>
    </div>
  );
}
function StreakBadge({ count }) {
  if (!count||count<1) return null;
  const hot=count>=7, warm=count>=3;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4, background:"#fff", border:"1px solid #e2e8f0", borderRadius:40, padding:"4px 10px", fontSize:"0.7rem", fontWeight:700, boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
      <span>{hot?"🔥":warm?"🌟":"⚡"}</span>
      <span style={{ color:hot?"#dc2626":warm?"#b45309":"#2563eb" }}>{count}</span>
      <span style={{ opacity:0.55, fontSize:"0.6rem" }}>day streak</span>
    </div>
  );
}
function Btn({ children, onClick, disabled, variant="primary", style={} }) {
  const base = { width:"100%", padding:"13px", borderRadius:14, border:"none", fontWeight:700, fontSize:"0.9rem", cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, transition:"all 0.15s", fontFamily:"inherit", ...style };
  const variants = {
    primary:{ background:"linear-gradient(135deg,#2563eb,#0ea5e9)", color:"white", boxShadow:"0 4px 0 #1e40af" },
    claim:  { background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"white", boxShadow:"0 4px 0 #15803d" },
    ghost:  { background:"transparent", border:"1px solid #e2e8f0", color:"#334155", padding:"8px 14px", width:"auto", fontSize:"0.8rem", boxShadow:"none" },
    shop:   { background:"linear-gradient(135deg,#2563eb,#0ea5e9)", color:"white", padding:"8px", fontSize:"0.75rem", borderRadius:10, boxShadow:"none" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

export default function Mining() {
  const router = useRouter(); // ← replaces useNavigate

  const [mounted,      setMounted]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [msg,          setMsg]          = useState({ text:"", type:"" });
  const [modalData,    setModalData]    = useState(null);
  const [settings,     setSettings]     = useState(null);
  const [session,      setSession]      = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [history,      setHistory]      = useState([]);
  const [boosters,     setBoosters]     = useState([]);
  const [myBoosters,   setMyBoosters]   = useState([]);
  const [streak,       setStreak]       = useState(0);
  const [showHistory,  setShowHistory]  = useState(false);
  const [buying,       setBuying]       = useState(null);
  const [claiming,     setClaiming]     = useState(false);
  const [starting,     setStarting]     = useState(false);
  const [confirmBooster, setConfirmBooster] = useState(null);
  const [buySuccess,   setBuySuccess]   = useState(null);

  const [nowMs, setNowMs] = useState(Date.now());
  const rafRef = useRef(null);
  const tick = useCallback(() => { setNowMs(Date.now()); rafRef.current = requestAnimationFrame(tick); }, []);
  useEffect(() => { rafRef.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(rafRef.current); }, [tick]);

  const loadAll = useCallback(async (silent=false) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { setMsg({ text:"Please login first.", type:"err" }); setLoading(false); return; }
    const uid = auth.user.id;
    const [settRes,profRes,sessRes,histRes,boostCatRes,myBoostRes] = await Promise.all([
      supabase.from("mining_settings").select("*").eq("id",1).single(),
      supabase.from("users_profiles").select("*").eq("user_id",uid).single(),
      supabase.from("mining_sessions").select("*").eq("user_id",uid).in("status",["active","completed"]).order("created_at",{ascending:false}).limit(1).maybeSingle(),
      supabase.from("mining_sessions").select("id,started_at,actual_coins,effective_rate,duration_hours,status,claimed_at").eq("user_id",uid).eq("status","claimed").order("claimed_at",{ascending:false}).limit(10),
      supabase.from("mining_boosters").select("*").eq("enabled",true).order("price_coins"),
      supabase.from("mining_user_boosters").select("*, mining_boosters(name,multiplier,icon)").eq("user_id",uid).or("expires_at.is.null,expires_at.gt."+new Date().toISOString()),
    ]);
    if (settRes.data)     setSettings(settRes.data);
    if (profRes.data)     setProfile(profRes.data);
    setSession(sessRes.data||null);
    setHistory(histRes.data||[]);
    setBoosters(boostCatRes.data||[]);
    setMyBoosters(myBoostRes.data||[]);
    if (histRes.data) {
      let s=0; const now=Date.now();
      for (let i=0;i<histRes.data.length;i++) {
        const hoursSince=(now-new Date(histRes.data[i].claimed_at).getTime())/3600000;
        if (i===0&&hoursSince<48) s++;
        else if (i>0) s++;
        else break;
      }
      setStreak(s);
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    loadAll();
    const iv = setInterval(()=>loadAll(true), 5000);
    return () => clearInterval(iv);
  }, [loadAll]);

  useEffect(() => {
    let t;
    if (modalData) t=setTimeout(()=>setModalData(null), 5000);
    return () => clearTimeout(t);
  }, [modalData]);

  const effectiveRate = useMemo(() => {
    if (!settings) return 0;
    const base = Number(settings.base_rate_per_hour||0);
    const mult = myBoosters.reduce((a,b)=>a*Number(b.mining_boosters?.multiplier||1),1);
    return base*mult;
  }, [settings, myBoosters]);

  const liveDur = settings?.session_duration_hours??12;

  const sd = useMemo(() => {
    if (!session||session.status==="claimed") return null;
    const startMs    = new Date(session.started_at).getTime();
    const durationMs = liveDur*3600*1000;
    const elapsed    = Math.min(nowMs-startMs, durationMs);
    const earned     = (effectiveRate/3600)*(elapsed/1000);
    const remaining  = Math.max((startMs+durationMs)-nowMs, 0);
    const pct        = Math.min((elapsed/durationMs)*100, 100);
    const done       = nowMs>=startMs+durationMs;
    return { earned, remaining, pct, done };
  }, [session, nowMs, effectiveRate, liveDur]);

  const showMsg_ = (text,type="ok",ms=4000) => {
    setMsg({ text, type });
    setTimeout(()=>setMsg({ text:"", type:"" }), ms);
  };

  const onStart = async () => {
    setStarting(true);
    const { data, error } = await supabase.rpc("mining_start");
    setStarting(false);
    if (error||!data?.ok) { showMsg_(error?.message||data?.error||"Failed","err"); return; }
    await loadAll();
  };
  const onClaim = async () => {
    setClaiming(true);
    const { data, error } = await supabase.rpc("mining_claim",{ p_session_id:session.id });
    setClaiming(false);
    if (error||!data?.ok) { showMsg_(error?.message||data?.error||"Claim failed","err"); return; }
    
    // Send session completed email
    try {
      await supabase.functions.invoke("mining-notify", {
        body: {
          type: "mining_session_completed",
          user_email: profile?.email,
          user_name: profile?.full_name || "there",
          coins_earned: Number(data.coins_claimed || 0).toFixed(2),
          session_id: session.id,
        }
      });
    } catch (e) {
      console.log("Email error:", e);
    }

    await loadAll();
    setModalData({ type:"claim", amount:data.coins_claimed });
  };
  const onBuyBooster = (b) => {
    if (Number(profile?.total_aidla_coins||0)<b.price_coins) { showMsg_("Insufficient coins.","err"); return; }
    setConfirmBooster(b);
  };
  const confirmPurchase = async () => {
    const b=confirmBooster; setConfirmBooster(null); setBuying(b.id);
    const { data, error } = await supabase.rpc("mining_buy_booster",{ p_booster_id:b.id });
    setBuying(null);
    if (error||!data?.ok) { showMsg_(error?.message||data?.error||"Purchase failed","err"); return; }
    await loadAll();
    setBuySuccess({ name:b.name, icon:b.icon, multiplier:b.multiplier });
    setTimeout(()=>setBuySuccess(null), 4000);
  };

  const balance   = Number(profile?.total_aidla_coins||0);
  const hasActive = !!session&&session.status==="active";
  const isDone    = sd?.done??false;

  return (
    <>
      {/* Claim success modal */}
      {modalData?.type==="claim"&&mounted&&createPortal(
        <div onClick={()=>setModalData(null)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99998 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:"32px 24px", textAlign:"center", width:280, position:"relative", boxShadow:"0 24px 60px rgba(0,0,0,0.12)" }}>
            <button onClick={()=>setModalData(null)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#94a3b8" }}>✕</button>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", margin:"0 auto 16px" }}>🎁</div>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#16a34a", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Coins Claimed</div>
            <div style={{ fontSize:"1.05rem", fontWeight:800, color:"#0f172a", marginBottom:6 }}>Added to your balance</div>
            <div style={{ fontSize:"1.8rem", fontWeight:800, color:"#16a34a" }}>+{fmtS(modalData.amount)}</div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm purchase modal */}
      {confirmBooster&&mounted&&createPortal(
        <div onClick={()=>setConfirmBooster(null)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99999, padding:"0 24px" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:"28px 24px", textAlign:"center", width:"100%", maxWidth:320, boxShadow:"0 24px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", margin:"0 auto 16px" }}>{confirmBooster.icon||"⚡"}</div>
            <div style={{ fontSize:"0.65rem", fontWeight:700, color:"#2563eb", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Confirm Purchase</div>
            <div style={{ fontSize:"1.05rem", fontWeight:800, color:"#0f172a", marginBottom:4 }}>{confirmBooster.name}</div>
            <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:16 }}>
              <span style={{ background:"#dbeafe", color:"#1e40af", padding:"3px 10px", borderRadius:20, fontSize:"0.68rem", fontWeight:700 }}>{confirmBooster.multiplier}× speed</span>
              <span style={{ background:"#f1f5f9", color:"#475569", padding:"3px 10px", borderRadius:20, fontSize:"0.68rem", fontWeight:700 }}>{confirmBooster.duration_hours?`${confirmBooster.duration_hours}h`:"Permanent"}</span>
            </div>
            <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:"0.82rem", fontWeight:600, color:"#854d0e" }}>
              💰 {confirmBooster.price_coins} coins will be deducted
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmBooster(null)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#fff", fontWeight:600, fontSize:"0.88rem", color:"#64748b", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={confirmPurchase} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#2563eb,#0ea5e9)", color:"#fff", fontWeight:700, fontSize:"0.88rem", cursor:"pointer", boxShadow:"0 4px 0 #1e40af", fontFamily:"inherit" }}>Confirm Buy</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Buy success toast */}
      {buySuccess&&mounted&&createPortal(
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99998, pointerEvents:"none", width:"calc(100% - 32px)", maxWidth:400 }}>
          <div style={{ background:"#fff", border:"1px solid #bbf7d0", borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0 }}>{buySuccess.icon||"⚡"}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.8rem", fontWeight:700, color:"#166534" }}>Booster Activated!</div>
              <div style={{ fontSize:"0.72rem", color:"#64748b", marginTop:2 }}>{buySuccess.name} · {buySuccess.multiplier}× mining speed</div>
            </div>
            <div style={{ width:24, height:24, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem" }}>✓</div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating claim button */}
      {isDone&&hasActive&&mounted&&createPortal(
        <FloatingClaimBtn show={true} earned={sd?.earned??0} claiming={claiming} onClick={onClaim}/>,
        document.body
      )}

      {/* Page */}
      <div style={{ fontFamily:"'Inter',system-ui,-apple-system,sans-serif", background:"#f8fafc", minHeight:"100vh", padding:"16px 14px 32px", maxWidth:500, margin:"0 auto", color:"#0f172a" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#2563eb,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>⛏️</div>
            <div>
              <div style={{ fontSize:"1.25rem", fontWeight:800, letterSpacing:"-0.02em" }}>Mining</div>
              <div style={{ fontSize:"0.7rem", color:"#64748b", marginTop:1 }}>Earn while you wait</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <StreakBadge count={streak}/>
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:40, padding:"6px 14px", fontSize:"0.85rem", fontWeight:600, display:"flex", alignItems:"center", gap:6, boxShadow:"0 2px 6px rgba(0,0,0,0.03)" }}>
              💰 <strong>{fmtS(balance)}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #e2e8f0", borderTopColor:"#2563eb", animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:"0.8rem", color:"#94a3b8" }}>Loading…</span>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !settings?.enabled ? (
          <Card>
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <div style={{ fontSize:"2rem", marginBottom:12 }}>🔧</div>
              <div style={{ fontWeight:700, color:"#0f172a", marginBottom:6 }}>Mining Offline</div>
              <div style={{ fontSize:"0.82rem", color:"#64748b" }}>Mining is currently undergoing maintenance. Check back soon.</div>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <MiningVisual isMining={hasActive} isDone={isDone} pct={sd?.pct??0} earned={sd?.earned??0} rate={effectiveRate}/>
              <div style={{ padding:"18px 16px" }}>
                {!hasActive ? (
                  <div>
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      <StatPill label="Duration"   value={`${liveDur}h`}/>
                      <StatPill label="Rate/hr"    value={fmtS(effectiveRate)}/>
                      <StatPill label="Est. Total" value={`~${fmtS(effectiveRate*liveDur)}`}/>
                    </div>
                    {myBoosters.length>0&&(
                      <div style={{ background:"#fef9c3", border:"1px solid #fde047", borderRadius:40, padding:"6px 14px", fontSize:"0.72rem", fontWeight:600, color:"#854d0e", marginBottom:14, textAlign:"center" }}>
                        ⚡ {myBoosters.map(b=>b.mining_boosters?.name).join(", ")}
                      </div>
                    )}
                    <Btn variant="primary" onClick={onStart} disabled={starting}>{starting?"Starting…":"⛏️  Start Mining"}</Btn>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <OdometerCounter value={sd?.earned??0} color={isDone?"#16a34a":"#2563eb"}/>
                    <div>
                      <div style={{ height:6, background:"#e2e8f0", borderRadius:8, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${sd?.pct??0}%`, background:isDone?"linear-gradient(90deg,#16a34a,#22c55e)":"linear-gradient(90deg,#2563eb,#0ea5e9)", borderRadius:8, transition:"width 0.4s" }}/>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.68rem", color:"#94a3b8", marginTop:5 }}>
                        <span>{Math.floor(sd?.pct??0)}% complete</span>
                        <span>{isDone?"Ready to claim!":msToHMS(sd?.remaining??0)}</span>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <div style={{ background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:"10px 12px" }}>
                        <div style={{ fontSize:"0.58rem", color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Started</div>
                        <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#334155" }}>{fmtDate(session.started_at)}</div>
                      </div>
                      <div style={{ background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:"10px 12px" }}>
                        <div style={{ fontSize:"0.58rem", color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>Session</div>
                        <div style={{ fontSize:"0.72rem", fontWeight:600, color:"#334155" }}>{liveDur}h · {fmtS(effectiveRate)}/hr</div>
                      </div>
                    </div>
                    {isDone&&<Btn variant="claim" onClick={onClaim} disabled={claiming}>{claiming?"Processing…":`🎁  Claim ${fmtS(sd?.earned??0)} coins`}</Btn>}
                  </div>
                )}
              </div>
            </Card>

            {msg.text&&(
              <div style={{ padding:"11px 16px", borderRadius:12, fontSize:"0.83rem", fontWeight:600, marginBottom:14, background:msg.type==="err"?"#fee2e2":"#dcfce7", color:msg.type==="err"?"#991b1b":"#166534", border:`1px solid ${msg.type==="err"?"#fecaca":"#86efac"}` }}>
                {msg.type==="err"?"⚠️":"✅"} {msg.text}
              </div>
            )}

            {myBoosters.length>0&&(
              <Card>
                <CardHeader title="Active Boosters" right={<span style={{ background:"#dbeafe", color:"#1e40af", borderRadius:20, padding:"2px 8px", fontSize:"0.68rem", fontWeight:700 }}>{myBoosters.length}</span>}/>
                <div style={{ padding:"10px 16px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                  {myBoosters.map(b=>(
                    <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8fafc", border:"1px solid #f1f5f9", borderRadius:12, padding:"10px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" }}>{b.mining_boosters?.icon||"⚡"}</div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{b.mining_boosters?.name}</div>
                          <div style={{ fontSize:"0.62rem", color:"#94a3b8" }}>{b.expires_at?`Expires ${fmtDate(b.expires_at)}`:"Permanent"}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight:800, color:"#2563eb", fontSize:"0.9rem" }}>{b.mining_boosters?.multiplier}×</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              {/* ← navigate → router.push */}
              <CardHeader title="Booster Shop" right={<Btn variant="ghost" onClick={()=>router.push("/user/wallet/invite")}>Invite &amp; Earn</Btn>}/>
              {boosters.length===0 ? (
                <div style={{ padding:"28px 20px", textAlign:"center", color:"#94a3b8", fontSize:"0.85rem" }}>No boosters available.</div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:14 }}>
                  {boosters.map(b=>{
                    const owned     = myBoosters.some(mb=>mb.booster_id===b.id);
                    const canAfford = balance>=b.price_coins;
                    return (
                      <div key={b.id} style={{ background:owned?"#f0fdf4":"#f8fafc", border:`1px solid ${owned?"#86efac":"#e2e8f0"}`, borderRadius:16, padding:14, display:"flex", flexDirection:"column", gap:8, opacity:(!owned&&!canAfford)?0.7:1 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:owned?"#dcfce7":"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" }}>{b.icon||"⚡"}</div>
                        <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{b.name}</div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          <span style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:"0.6rem", fontWeight:600 }}>{b.multiplier}×</span>
                          <span style={{ background:"#e2e8f0", padding:"2px 6px", borderRadius:4, fontSize:"0.6rem", fontWeight:600 }}>{b.duration_hours?`${b.duration_hours}h`:"∞"}</span>
                        </div>
                        <div style={{ fontSize:"0.78rem", fontWeight:600, color:"#b45309" }}>💰 {b.price_coins}</div>
                        {owned ? (
                          <div style={{ textAlign:"center", padding:"6px", background:"rgba(22,163,74,0.1)", borderRadius:8, fontSize:"0.68rem", fontWeight:600, color:"#166534" }}>✅ Active</div>
                        ) : (
                          <Btn variant="shop" onClick={()=>onBuyBooster(b)} disabled={buying===b.id||!canAfford}>
                            {buying===b.id?"Buying…":canAfford?"Buy Now":"Need coins"}
                          </Btn>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {history.length>0&&(
              <Card>
                <button onClick={()=>setShowHistory(p=>!p)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", font:"inherit" }}>
                  <span style={{ fontSize:"0.7rem", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.1em" }}>Mining History</span>
                  <span style={{ color:"#94a3b8", fontSize:"0.68rem", transition:"transform 0.2s", display:"inline-block", transform:showHistory?"rotate(180deg)":"rotate(0deg)" }}>▼</span>
                </button>
                {showHistory&&(
                  <div style={{ padding:"0 16px 14px" }}>
                    {history.map((h,i)=>(
                      <div key={h.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<history.length-1?"1px solid #f8fafc":"none" }}>
                        <div>
                          <div style={{ fontSize:"0.75rem", fontWeight:600, color:"#0f172a" }}>{fmtDate(h.claimed_at)}</div>
                          <div style={{ fontSize:"0.62rem", color:"#94a3b8", marginTop:2 }}>{h.duration_hours}h · {fmtS(h.effective_rate)}/hr</div>
                        </div>
                        <div style={{ fontWeight:700, color:"#16a34a", fontSize:"0.9rem" }}>+{fmtS(h.actual_coins)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {isDone&&<div style={{ height:80 }}/>}
          </>
        )}
      </div>
    </>
  );
}