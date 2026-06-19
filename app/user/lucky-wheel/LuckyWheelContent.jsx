"use client";
// app/user/lucky-wheel/page.jsx
// Converted from React Router LuckyWheel.jsx
//
// Changes:
//   1. "use client" directive
//   2. supabase import: ../../lib/supabase → @/lib/supabase
//   3. No useNavigate/Link in original — no router changes needed
//   4. createPortal uses document.body — safe with "use client"
//   5. All logic, CSS, sub-components 100% identical

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

const typeToNice = (t) => {
  switch (t) {
    case "try_again_free": return "🔄 Try Again";
    case "plus1_chance":   return "🍀 +1 Chance";
    case "gift":           return "🎁 Gift";
    case "coins":          return "💰 Coins";
    default:               return t;
  }
};

const UAE_OFFSET_MS = 4 * 60 * 60 * 1000;

function uaeDayStartISO() {
  const nowUAE = new Date(Date.now() + UAE_OFFSET_MS);
  const y=nowUAE.getUTCFullYear(), m=nowUAE.getUTCMonth(), d=nowUAE.getUTCDate();
  return new Date(Date.UTC(y,m,d,0,0,0)-UAE_OFFSET_MS).toISOString();
}

function nextUaeMidnightUTCms() {
  const nowUAE = new Date(Date.now() + UAE_OFFSET_MS);
  const y=nowUAE.getUTCFullYear(), m=nowUAE.getUTCMonth(), d=nowUAE.getUTCDate();
  return Date.UTC(y,m,d+1,0,0,0)-UAE_OFFSET_MS;
}

function msToHMS(ms) {
  const s=Math.max(0,Math.floor(ms/1000));
  const hh=String(Math.floor(s/3600)).padStart(2,"0");
  const mm=String(Math.floor((s%3600)/60)).padStart(2,"0");
  const ss=String(s%60).padStart(2,"0");
  return `${hh}:${mm}:${ss}`;
}

const SLICE_COLORS = ["#1E3A8A","#3B82F6","#0EA5E9","#8B5CF6"];

function StatBox({ label, value }) {
  return (
    <div className="lw-stat-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WheelCanvas({ slices, rotation, onDraw, drawDisabled, spinning }) {
  const bg = `conic-gradient(
    ${SLICE_COLORS[0]} 0deg 90deg,
    ${SLICE_COLORS[1]} 90deg 180deg,
    ${SLICE_COLORS[2]} 180deg 270deg,
    ${SLICE_COLORS[3]} 270deg 360deg
  )`;
  return (
    <div className="lw-wheel-wrap">
      <div className="lw-pointer" aria-hidden="true">
        <svg width="32" height="42" viewBox="0 0 40 50">
          <defs>
            <linearGradient id="ptrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1e3a8a"/>
            </linearGradient>
          </defs>
          <path d="M20 50 L0 10 Q10 0 20 0 Q30 0 40 10 Z" fill="url(#ptrGrad)" stroke="#fff" strokeWidth="2"/>
        </svg>
      </div>
      <div className="lw-rim">
        <div className="lw-disc" style={{ background:bg, transform:`rotate(${rotation}deg)` }}>
          {slices.map((s,i)=>(
            <div key={i} className="lw-slice-label" style={{ transform:`rotate(${i*90+45}deg)` }}>
              <div className="lw-slice-inner">
                {typeToNice(s.type)}
                {s.type==="coins"&&<div className="lw-slice-val">{s.value}</div>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onDraw} disabled={drawDisabled} className={`lw-center-btn${spinning?" lw-center-spinning":""}`}>
          {spinning?"🤞":"DRAW"}
        </button>
      </div>
    </div>
  );
}

export default function LuckyWheel() {
  const [mounted,        setMounted]        = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [spinning,       setSpinning]       = useState(false);
  const spinningRef                         = useRef(false);
  const [msg,            setMsg]            = useState("");
  const [settings,       setSettings]       = useState(null);
  const [profile,        setProfile]        = useState(null);
  const [drawsToday,     setDrawsToday]     = useState(0);
  const [rotation,       setRotation]       = useState(0);
  const [lastResult,     setLastResult]     = useState(null);
  const [showModal,      setShowModal]      = useState(false);
  const [history,        setHistory]        = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [nowMs,  setNowMs]  = useState(()=>Date.now());
  const rafRef               = useRef(null);
  const tickRaf = useCallback(()=>{ setNowMs(Date.now()); rafRef.current=requestAnimationFrame(tickRaf); },[]);
  useEffect(()=>{ rafRef.current=requestAnimationFrame(tickRaf); return ()=>cancelAnimationFrame(rafRef.current); },[tickRaf]);

  const dataIntervalRef = useRef(null);

  const slices = useMemo(()=>{
    const s=settings?.slices;
    if (Array.isArray(s)&&s.length===4) return s;
    return [
      { label:"Slice 1", type:"try_again_free", value:0 },
      { label:"Slice 2", type:"plus1_chance",   value:0 },
      { label:"Slice 3", type:"gift",            value:0 },
      { label:"Slice 4", type:"coins",           value:10 },
    ];
  },[settings]);

  const entryText = useMemo(()=>{
    if (!settings) return "";
    if (settings.entry_type==="paid") return `Paid entry: ${settings.entry_cost} coins`;
    return "Free entry";
  },[settings]);

  const canClaim  = (profile?.lw_earned_coins??0)>0;
  const drawsLeft = profile?.lw_draws_remaining??0;

  const nextUaeMidnightMs = useMemo(()=>Math.max(0,nextUaeMidnightUTCms()-nowMs),[nowMs]);

  const loadAll = useCallback(async()=>{
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr||!authData?.user) { setMsg("Please login first."); setLoading(false); return; }
    const userId = authData.user.id;
    await supabase.rpc("lw_sync_remaining");
    const [settingsRes,profileRes,historyCountRes,historyListRes] = await Promise.all([
      supabase.from("luckywheel_settings").select("*").eq("id",1).single(),
      supabase.from("users_profiles").select("*").eq("user_id",userId).single(),
      supabase.from("luckywheel_history").select("id",{count:"exact",head:true}).eq("user_id",userId).gte("created_at",uaeDayStartISO()),
      supabase.from("luckywheel_history").select("id,created_at,result_type,coins_won,entry_type,entry_cost,slice_index").eq("user_id",userId).order("created_at",{ascending:false}).limit(50),
    ]);
    if (settingsRes.data) setSettings(settingsRes.data);
    if (profileRes.data)  setProfile(profileRes.data);
    setDrawsToday(historyCountRes.count||0);
    setHistory(historyListRes.data||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{
    setMounted(true); setLoading(true); loadAll();
    dataIntervalRef.current=setInterval(()=>{ if(!spinningRef.current) loadAll(); },3000);
    return ()=>clearInterval(dataIntervalRef.current);
  },[loadAll]);

  useEffect(()=>{
    let timer;
    if (showModal) timer=setTimeout(()=>setShowModal(false),5000);
    return ()=>clearTimeout(timer);
  },[showModal]);

  const spinToSlice = (sliceIndex)=>{
    const sliceAngle  =360/slices.length;
    const targetCenter=sliceIndex*sliceAngle+sliceAngle/2;
    const targetAngle =360-targetCenter;
    const currentMod  =rotation%360;
    let angleDiff     =targetAngle-currentMod;
    if (angleDiff<0) angleDiff+=360;
    setRotation(rotation+angleDiff+15*360);
  };

  const onDraw = async()=>{
    setMsg(""); setLastResult(null); setShowModal(false);
    if (!settings||!profile) return;
    if (drawsLeft<=0) { setMsg("Daily limit reached."); return; }
    if (settings.entry_type==="paid") {
      const cost=Number(settings.entry_cost||0);
      const bal =Number(profile.total_aidla_coins||0);
      if (bal<cost) { setMsg("Insufficient coins for paid entry."); return; }
    }
    setSpinning(true); spinningRef.current=true;
    const { data, error } = await supabase.rpc("lw_draw");
    if (error) { setSpinning(false); spinningRef.current=false; setMsg(`Draw failed: ${error.message}`); return; }
    if (!data?.ok) { setSpinning(false); spinningRef.current=false; setMsg(data?.error||"Draw failed"); return; }
    spinToSlice(data.slice_index??0);
    setLastResult(data);
    setTimeout(async()=>{ await loadAll(); setSpinning(false); spinningRef.current=false; setShowModal(true); },10200);
  };

  const onClaim = async()=>{
    setMsg("");
    const { data, error } = await supabase.rpc("lw_claim");
    if (error) { setMsg(`Claim failed: ${error.message}`); return; }
    if (!data?.ok) { setMsg(data?.error||"Nothing to claim"); return; }
    setMsg(`🎉 Claimed ${data.claimed} coins!`);
    await loadAll();
  };

  const drawDisabled     = spinning||loading||drawsLeft<=0;
  const displayedHistory = showAllHistory?history:history.slice(0,3);

  const renderModal = ()=>{
    if (!showModal||!lastResult||!mounted) return null;
    return createPortal(
      <div className="lw-modal-overlay" onClick={()=>setShowModal(false)}>
        <div className="lw-modal-content" onClick={e=>e.stopPropagation()}>
          <button className="lw-modal-close" onClick={()=>setShowModal(false)}>×</button>
          <div className="lw-modal-emoji">🎉</div>
          <h2 className="lw-modal-title">Congratulations!</h2>
          <div className="lw-modal-result-text">
            {typeToNice(lastResult.result_type)}
            {lastResult.result_type==="coins"?` +${lastResult.coins_won}`:""}
          </div>
          <div className="lw-modal-footer">Closes in 5 seconds</div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <style>{CSS}</style>
      {renderModal()}

      <div className="lw-page">
        <div className="lw-header">
          <div className="lw-header-left">
            <span className="lw-header-icon">🎡</span>
            <div>
              <h1 className="lw-title">Lucky Wheel</h1>
              <div className="lw-entry-badge">{entryText}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="lw-loader">
            <div className="lw-spin-ring"/>
            <span>Loading your luck…</span>
          </div>
        ) : (
          <>
            <div className="lw-grid">
              <div className="lw-col-wheel">
                <div className="lw-card lw-wheel-card">
                  <WheelCanvas slices={slices} rotation={rotation} onDraw={onDraw} drawDisabled={drawDisabled} spinning={spinning}/>
                  <div className="lw-legend">
                    {slices.map((s,i)=>(
                      <div key={i} className="lw-legend-item">
                        <div className="lw-legend-dot" style={{ background:SLICE_COLORS[i] }}/>
                        <span>{typeToNice(s.type)}{s.type==="coins"?` (${s.value})`:""}</span>
                      </div>
                    ))}
                  </div>
                  <div className="lw-tip">💡 Try Again costs 1 draw · +1 Chance keeps draws the same</div>
                </div>
              </div>

              <div className="lw-col-stats">
                <div className="lw-card">
                  <div className={`lw-chances-hero${spinning?" lw-pulse-fast":" lw-pulse-soft"}`}>
                    <span className="lw-chances-label">Chances Left</span>
                    <div className="lw-chances-num">{drawsLeft}</div>
                  </div>
                  <div className="lw-stat-grid">
                    <StatBox label="Draws today"  value={drawsToday}/>
                    <StatBox label="Daily limit"  value={Number(settings?.daily_limit??0)}/>
                    <StatBox label="Your balance" value={Number(profile?.total_aidla_coins??0)}/>
                    <StatBox label="Total earned" value={Number(profile?.total_lw_earned??0)}/>
                  </div>
                  <div className="lw-claim-box">
                    <div className="lw-claim-row">
                      <span>Claimable Coins</span>
                      <strong className="lw-claim-val">{Number(profile?.lw_earned_coins??0)}</strong>
                    </div>
                    <button onClick={onClaim} disabled={!canClaim||spinning} className="lw-btn">
                      {canClaim?"CLAIM COINS":"NOTHING TO CLAIM"}
                    </button>
                  </div>
                  {drawsLeft<=0&&(
                    <div className="lw-countdown-box">
                      <div className="lw-countdown-label">Next draws in</div>
                      <div className="lw-countdown-time">{msToHMS(nextUaeMidnightMs)}</div>
                      <div className="lw-countdown-sub">Resets at 00:00 UAE time</div>
                    </div>
                  )}
                  {msg&&(
                    <div className={`lw-msg${msg.toLowerCase().includes("fail")||msg.toLowerCase().includes("insufficient")||msg.toLowerCase().includes("limit")?" lw-msg-err":" lw-msg-ok"}`}>
                      {msg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lw-card lw-history-card">
              <div className="lw-history-hdr">
                <h3 className="lw-history-title">My Spin History</h3>
                {history.length>3&&(
                  <button className="lw-seemore-btn" onClick={()=>setShowAllHistory(p=>!p)}>
                    {showAllHistory?"See Less":"See More"}
                  </button>
                )}
              </div>
              {history.length===0 ? (
                <div className="lw-empty">No spins yet. Hit DRAW to get started!</div>
              ) : (
                <div className="lw-table-wrap">
                  <table className="lw-table">
                    <thead>
                      <tr><th>Date</th><th>Result</th><th>Prize</th><th>Entry</th><th>Fee</th></tr>
                    </thead>
                    <tbody>
                      {displayedHistory.map(h=>(
                        <tr key={h.id}>
                          <td className="lw-td-date">{new Date(h.created_at).toLocaleString()}</td>
                          <td className="lw-td-result">{typeToNice(h.result_type)}</td>
                          <td className="lw-td-prize" style={{ color:h.result_type==="coins"?"#3b82f6":"inherit" }}>
                            {h.result_type==="coins"?`+${h.coins_won}`:"—"}
                          </td>
                          <td><span className={`lw-entry-tag${h.entry_type==="paid"?" paid":" free"}`}>{h.entry_type==="paid"?"Paid":"Free"}</span></td>
                          <td>{h.entry_type==="paid"?`${h.entry_cost}C`:"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
.lw-page *{box-sizing:border-box;}
.lw-page{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#0f172a;padding:12px;max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:16px;}
.lw-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:10px 0 4px;animation:lwIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes lwIn{from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:none;}}
.lw-header-left{display:flex;align-items:center;gap:10px;}
.lw-header-icon{font-size:2rem;line-height:1;}
.lw-title{font-size:clamp(1.5rem,5vw,2.2rem);font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(1px 2px 4px rgba(30,58,138,0.15));}
.lw-entry-badge{display:inline-block;background:#e0f2fe;color:#0284c7;padding:3px 12px;border-radius:20px;font-weight:700;font-size:0.75rem;margin-top:3px;}
.lw-card{background:rgba(255,255,255,0.88);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,1);border-radius:22px;padding:18px;box-shadow:16px 16px 48px rgba(15,23,42,0.07),-10px -10px 36px rgba(255,255,255,0.9),inset 0 0 0 1.5px rgba(255,255,255,0.6);}
.lw-loader{display:flex;align-items:center;gap:12px;padding:48px;justify-content:center;color:#64748b;font-weight:600;}
.lw-spin-ring{width:32px;height:32px;border:4px solid #e0f2fe;border-top:4px solid #3b82f6;border-radius:50%;animation:lwSpin 0.9s linear infinite;flex-shrink:0;}
@keyframes lwSpin{to{transform:rotate(360deg);}}
.lw-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}
@media(max-width:640px){.lw-grid{grid-template-columns:1fr;}.lw-col-wheel{order:1;}.lw-col-stats{order:2;}}
.lw-wheel-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px;}
.lw-wheel-wrap{width:100%;max-width:min(280px,80vw);position:relative;display:flex;flex-direction:column;align-items:center;}
.lw-pointer{position:absolute;top:-14px;left:50%;transform:translateX(-50%);z-index:10;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));}
.lw-rim{width:100%;aspect-ratio:1;border-radius:50%;padding:10px;background:linear-gradient(135deg,#f8fafc,#cbd5e1,#94a3b8,#f8fafc);box-shadow:0 18px 40px rgba(15,23,42,0.22),inset 0 3px 10px rgba(255,255,255,0.8);border:3px solid #fff;position:relative;}
.lw-disc{width:100%;height:100%;border-radius:50%;border:3px solid #fff;box-shadow:inset 0 0 18px rgba(0,0,0,0.28);transition:transform 10s cubic-bezier(0.1,0,0.1,1.035);position:relative;overflow:hidden;}
.lw-slice-label{position:absolute;top:0;left:50%;width:90px;height:50%;margin-left:-45px;transform-origin:bottom center;display:flex;flex-direction:column;align-items:center;padding-top:14px;z-index:5;}
.lw-slice-inner{color:#fff;font-weight:800;font-size:clamp(0.65rem,2vw,0.85rem);text-align:center;text-shadow:0 2px 5px rgba(0,0,0,0.9);line-height:1.2;}
.lw-slice-val{font-size:1.1rem;font-weight:900;margin-top:3px;text-shadow:0 2px 6px rgba(0,0,0,0.9);}
.lw-center-btn{position:absolute;inset:28%;border-radius:50%;border:3px solid #fff;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-weight:900;font-size:clamp(0.85rem,2.5vw,1.1rem);letter-spacing:1px;box-shadow:0 6px 0 #0f172a,0 12px 18px rgba(30,58,138,0.4),inset 0 2px 0 rgba(255,255,255,0.2);cursor:pointer;display:grid;place-items:center;z-index:15;transition:all 0.15s cubic-bezier(0.4,0,0.2,1);font-family:inherit;}
.lw-center-btn:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 8px 0 #0f172a,0 16px 22px rgba(30,58,138,0.5),inset 0 2px 0 rgba(255,255,255,0.2);}
.lw-center-btn:active:not(:disabled){transform:translateY(6px);box-shadow:0 1px 0 #0f172a,0 3px 8px rgba(30,58,138,0.3);}
.lw-center-btn:disabled{background:#94a3b8;box-shadow:0 6px 0 #64748b;cursor:not-allowed;}
.lw-center-spinning{animation:lwCenterPulse 0.5s infinite;background:linear-gradient(135deg,#3b82f6,#60a5fa)!important;}
@keyframes lwCenterPulse{0%,100%{transform:scale(1);}50%{transform:scale(0.94);}}
.lw-legend{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;width:100%;}
.lw-legend-item{display:flex;align-items:center;gap:6px;font-size:0.78rem;font-weight:600;color:#475569;}
.lw-legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0;}
.lw-tip{padding:10px 12px;background:#eff6ff;color:#1e3a8a;border-radius:10px;font-size:0.78rem;text-align:center;border:1px dashed #93c5fd;line-height:1.4;width:100%;}
.lw-chances-hero{background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;border-radius:16px;padding:16px;text-align:center;box-shadow:0 8px 20px rgba(30,58,138,0.28),inset 0 2px 0 rgba(255,255,255,0.18);margin-bottom:14px;}
.lw-chances-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.88;}
.lw-chances-num{font-size:clamp(2.2rem,8vw,3rem);font-weight:900;line-height:1;margin-top:4px;text-shadow:0 3px 8px rgba(0,0,0,0.25);}
.lw-pulse-soft{animation:lwPulse 3s ease-in-out infinite;}
.lw-pulse-fast{animation:lwPulse 0.7s ease-in-out infinite;}
@keyframes lwPulse{0%,100%{transform:scale(1);}50%{transform:scale(0.97);}}
.lw-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;}
.lw-stat-box{background:#f8fafc;border-radius:12px;padding:10px;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:inset 3px 3px 7px rgba(15,23,42,0.05),inset -3px -3px 7px rgba(255,255,255,1);}
.lw-stat-box span{font-size:0.68rem;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;}
.lw-stat-box strong{font-size:1rem;color:#0f172a;margin-top:3px;font-weight:800;}
.lw-claim-box{background:#f0f4f8;border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:inset 3px 3px 7px rgba(15,23,42,0.05),inset -3px -3px 7px rgba(255,255,255,1);}
.lw-claim-row{display:flex;justify-content:space-between;align-items:center;font-weight:700;margin-bottom:10px;color:#334155;font-size:0.88rem;}
.lw-claim-val{font-size:1.1rem;color:#3b82f6;}
.lw-btn{width:100%;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-size:0.95rem;font-weight:800;letter-spacing:0.8px;cursor:pointer;box-shadow:0 6px 0 #0f172a,0 12px 20px rgba(30,58,138,0.28),inset 0 2px 0 rgba(255,255,255,0.18);transition:all 0.15s cubic-bezier(0.4,0,0.2,1);font-family:inherit;}
.lw-btn:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 8px 0 #0f172a,0 16px 22px rgba(30,58,138,0.38);}
.lw-btn:active:not(:disabled){transform:translateY(6px);box-shadow:0 0px 0 #0f172a;}
.lw-btn:disabled{background:#94a3b8;box-shadow:0 6px 0 #64748b;cursor:not-allowed;opacity:0.85;}
.lw-countdown-box{background:#0f172a;color:#f8fafc;padding:14px;border-radius:14px;text-align:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08),0 8px 16px rgba(15,23,42,0.2);margin-bottom:12px;}
.lw-countdown-label{font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:0.7;margin-bottom:4px;}
.lw-countdown-time{font-size:clamp(1.4rem,5vw,1.9rem);font-weight:900;font-family:'Courier New',monospace;color:#3b82f6;letter-spacing:2px;}
.lw-countdown-sub{color:#475569;font-size:0.7rem;margin-top:4px;}
.lw-msg{padding:10px 14px;border-radius:10px;margin-top:8px;font-weight:700;font-size:0.85rem;text-align:center;}
.lw-msg-ok{background:#dcfce7;color:#15803d;box-shadow:inset 0 0 0 1.5px #4ade80;}
.lw-msg-err{background:#fee2e2;color:#b91c1c;box-shadow:inset 0 0 0 1.5px #f87171;}
.lw-history-card{padding:16px 18px;}
.lw-history-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.lw-history-title{font-size:1.1rem;font-weight:800;color:#0f172a;}
.lw-empty{text-align:center;padding:24px;color:#64748b;font-weight:600;background:#f8fafc;border-radius:12px;font-size:0.88rem;}
.lw-table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:10px;}
.lw-table{width:100%;border-collapse:collapse;min-width:400px;}
.lw-table th{text-align:left;background:#f1f5f9;color:#475569;padding:9px 12px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;}
.lw-table th:first-child{border-radius:10px 0 0 10px;}.lw-table th:last-child{border-radius:0 10px 10px 0;}
.lw-table td{padding:11px 12px;border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#334155;}
.lw-table tr:hover td{background:#f8fafc;}
.lw-td-date{font-size:0.75rem;color:#64748b;white-space:nowrap;}
.lw-td-result{font-weight:700;}.lw-td-prize{font-weight:800;}
.lw-entry-tag{padding:3px 8px;border-radius:10px;font-size:0.68rem;font-weight:700;}
.lw-entry-tag.free{background:#e0f2fe;color:#0284c7;}.lw-entry-tag.paid{background:#ede9fe;color:#6d28d9;}
.lw-seemore-btn{background:#f8fafc;border:1.5px solid #3b82f6;color:#1e3a8a;padding:7px 16px;border-radius:10px;font-weight:800;font-size:0.8rem;cursor:pointer;transition:all 0.18s;box-shadow:3px 3px 8px rgba(15,23,42,0.05),-3px -3px 8px rgba(255,255,255,1);font-family:inherit;}
.lw-seemore-btn:hover{background:#3b82f6;color:#fff;transform:translateY(-1px);box-shadow:0 6px 12px rgba(59,130,246,0.28);}
.lw-modal-overlay{position:fixed!important;inset:0;width:100vw;height:100vh;background:rgba(15,23,42,0.55);backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:999999!important;padding:16px;}
.lw-modal-content{background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);padding:36px 28px 28px;border-radius:24px;text-align:center;box-shadow:16px 16px 50px rgba(15,23,42,0.18),-16px -16px 50px rgba(255,255,255,0.9),inset 0 0 0 1.5px rgba(255,255,255,0.6);position:relative;width:min(400px,90vw);animation:lwModalIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;}
@keyframes lwModalIn{0%{opacity:0;transform:scale(0.8);}50%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
.lw-modal-emoji{font-size:3rem;display:block;margin-bottom:6px;}
.lw-modal-close{position:absolute;top:12px;right:14px;background:none;border:none;font-size:24px;font-weight:700;color:#94a3b8;cursor:pointer;line-height:1;}
.lw-modal-close:hover{color:#1e3a8a;}
.lw-modal-title{font-size:1.4rem;font-weight:900;color:#1e3a8a;margin-bottom:10px;}
.lw-modal-result-text{font-size:1.8rem;font-weight:900;color:#3b82f6;margin-bottom:18px;text-shadow:1px 1px 3px rgba(0,0,0,0.08);}
.lw-modal-footer{font-size:0.78rem;color:#94a3b8;font-weight:600;}
@media(max-width:380px){.lw-page{padding:12px 10px 32px;}.lw-card{padding:14px 12px;border-radius:18px;}.lw-stat-grid{gap:6px;}.lw-stat-box{padding:8px 4px;}.lw-stat-box span{font-size:0.6rem;}.lw-chances-num{font-size:2rem;}}
`;