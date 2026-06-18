
"use client";
// app/user/lucky-draw/page.jsx
// Converted from React Router LuckyDraw.jsx
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

const UAE_TZ = "Asia/Dubai";

function msToHMS(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const dd = Math.floor(s / 86400);
  const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return dd > 0 ? `${dd}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}
function prizeToText(p) {
  if (!p) return "-";
  if (p.type === "coins") return `${Number(p.coins || 0)} coins`;
  if (p.type === "item") return p.name || "Item";
  return p.name || "Prize";
}
function fmtUAE(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", { timeZone: UAE_TZ });
}
function fmtUAESplit(iso) {
  if (!iso) return { date:"-", time:"" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { timeZone:UAE_TZ, day:"2-digit", month:"short", year:"numeric" }),
    time: d.toLocaleTimeString("en-GB", { timeZone:UAE_TZ, hour:"2-digit", minute:"2-digit" }),
  };
}

function FireworksCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ["#3b82f6","#1e3a8a","#60a5fa","#fbbf24","#f59e0b","#fff","#93c5fd","#fde68a","#f472b6","#a78bfa"];
    function burst(x, y) {
      for (let i = 0; i < 90; i++) {
        const a = (Math.PI * 2 * i) / 90 + (Math.random() - 0.5) * 0.4;
        const spd = 2 + Math.random() * 9;
        particles.push({ x, y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, alpha:1, color:colors[Math.floor(Math.random()*colors.length)], size:1.5+Math.random()*4, gravity:0.1+Math.random()*0.1, trail:[] });
      }
    }
    let n = 0;
    const iv = setInterval(() => { burst(80+Math.random()*(canvas.width-160), 60+Math.random()*(canvas.height*0.55)); if(++n>28) clearInterval(iv); }, 280);
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let i = particles.length-1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({x:p.x,y:p.y}); if(p.trail.length>7) p.trail.shift();
        for(let t=0;t<p.trail.length;t++){
          ctx.beginPath(); ctx.arc(p.trail[t].x,p.trail[t].y,p.size*(t/p.trail.length)*0.5,0,Math.PI*2);
          ctx.fillStyle=p.color; ctx.globalAlpha=p.alpha*(t/p.trail.length)*0.3; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=p.alpha; ctx.fill(); ctx.globalAlpha=1;
        p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.vx*=0.98; p.alpha-=0.013;
        if(p.alpha<=0) particles.splice(i,1);
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { clearInterval(iv); cancelAnimationFrame(rafRef.current); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:1000000,pointerEvents:"none",width:"100%",height:"100%"}}/>;
}

function DrawAnimationOverlay({ participants, drawsCount, winners, onDrawComplete, onAllDone, onClose }) {
  const [phase, setPhase] = useState("countdown");
  const [cdNum, setCdNum] = useState(null);
  const [cdLabel, setCdLabel] = useState("Are you ready?");
  const [displayed, setDisplayed] = useState("● ● ●");
  const [drawIdx, setDrawIdx] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [cursorStyle, setCursorStyle] = useState({ left:"50vw", top:"110vh", opacity:0 });
  const [cursorClick, setCursorClick] = useState(false);
  const btnRef = useRef(null);
  const shuffleRef = useRef(null);
  const drawIdxRef = useRef(0);

  const shufflePool = participants.length >= 3
    ? participants
    : [...participants, ...["Ahmed","Sara","Mohammed","Fatima","Omar","Layla","Hassan","Nour","Zaid","Mia"].filter(n => !participants.includes(n)).slice(0, Math.max(0, 5 - participants.length))];

  useEffect(() => { drawIdxRef.current = drawIdx; }, [drawIdx]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const tt = [
      setTimeout(() => { setCdLabel(null); setCdNum(3); }, 1200),
      setTimeout(() => setCdNum(2), 2300),
      setTimeout(() => setCdNum(1), 3400),
      setTimeout(() => { setCdNum(null); setCdLabel("🎰 DRAW!"); }, 4500),
      setTimeout(() => setPhase("showBtn"), 5400),
    ];
    return () => tt.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "showBtn") return;
    setCdLabel(null); setCdNum(null);
    setCursorStyle({ left:"50vw", top:"110vh", opacity:0 });
    const tt = [
      setTimeout(() => setCursorStyle({ left:"50vw", top:"110vh", opacity:1 }), 100),
      setTimeout(() => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          setCursorStyle({ left:r.left+r.width/2+"px", top:r.top+r.height/2+"px", opacity:1 });
        }
      }, 650),
      setTimeout(() => setCursorClick(true), 1450),
      setTimeout(() => { setCursorClick(false); setPhase("shuffling"); }, 1850),
    ];
    return () => tt.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "shuffling") return;
    const idx = drawIdxRef.current;
    const dbWinner = winners[idx]?.winner_name || null;
    const hasWinner = !!dbWinner;
    let elapsed = 0, speed = 55;
    function tick() {
      setDisplayed(shufflePool[Math.floor(Math.random() * shufflePool.length)]);
      elapsed += speed;
      if (elapsed > 7000)      speed = Math.min(speed + 22, 480);
      else if (elapsed > 5000) speed = Math.min(speed + 10, 220);
      else if (elapsed > 3000) speed = Math.min(speed + 4,  120);
      if (elapsed >= 10500) {
        clearTimeout(shuffleRef.current);
        if (hasWinner) {
          setDisplayed(dbWinner);
          setRevealed(prev => [...prev, { name:dbWinner, prize:winners[idx]?.prize_text||"", num:idx+1, noWinner:false }]);
        } else {
          setDisplayed("—");
          setRevealed(prev => [...prev, { name:null, prize:"", num:idx+1, noWinner:true }]);
        }
        setTimeout(() => onDrawComplete(idx), 800);
        setTimeout(() => {
          if (idx + 1 < drawsCount) { setDrawIdx(idx + 1); setPhase("between"); }
          else { setPhase("finished"); setTimeout(() => onAllDone(), 2000); }
        }, 3400);
        return;
      }
      shuffleRef.current = setTimeout(tick, speed);
    }
    shuffleRef.current = setTimeout(tick, speed);
    return () => clearTimeout(shuffleRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "between") return;
    setDisplayed("● ● ●");
    const t = setTimeout(() => setPhase("showBtn"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  const lastRevealed = revealed[revealed.length - 1];
  const isResultShown = (phase === "between" || phase === "finished") && lastRevealed;
  const isNoWinner    = isResultShown && lastRevealed?.noWinner;
  const isWinnerShown = isResultShown && !lastRevealed?.noWinner;

  return createPortal(
    <div style={{position:"fixed",inset:0,zIndex:99998,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{drawCSS}</style>
      <div className="lda-bg"/>
      <div className="lda-stars"/>
      <button onClick={onClose} style={{position:"fixed",top:12,right:12,zIndex:9999999,padding:"7px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,backdropFilter:"blur(10px)",letterSpacing:1}}>✕ Close</button>

      {phase === "countdown" && (
        <div className="lda-center">
          {cdNum !== null ? <div key={cdNum} className="lda-big-num">{cdNum}</div>
           : cdLabel ? <div key={cdLabel} className={cdLabel.includes("DRAW") ? "lda-draw-label" : "lda-ready-label"}>{cdLabel}</div>
           : null}
        </div>
      )}

      {(phase === "showBtn" || phase === "shuffling" || phase === "between" || phase === "finished") && (
        <div className="lda-center">
          <div className="lda-draw-pill">Draw {drawIdx + 1} of {drawsCount}</div>
          <div className={`lda-name-box ${phase==="shuffling"?"lda-shuffling":""} ${isWinnerShown?"lda-winner-box":""} ${isNoWinner?"lda-no-winner-box":""}`}>
            <div className="lda-name-eyebrow">{isWinnerShown?"🏆 WINNER":isNoWinner?"😔 NO WINNER":phase==="shuffling"?"SELECTING...":"READY"}</div>
            <div className="lda-name-text">{isNoWinner ? "—" : displayed}</div>
            {isWinnerShown && <div className="lda-winner-prize">🎁 {lastRevealed.prize || "Prize"}</div>}
            {isWinnerShown && <div className="lda-winner-sub">Congratulations! 🎉</div>}
            {isNoWinner   && <div className="lda-no-winner-sub">Unfortunately no one was selected for this draw.</div>}
          </div>
          {phase === "showBtn" && <button ref={btnRef} className="lda-draw-btn" disabled><span style={{marginRight:8,fontSize:"1.2rem"}}>🎲</span>DRAW</button>}
          {phase === "shuffling" && <div className="lda-dots"><span/><span/><span/><span/><span/></div>}
          {phase === "finished"  && <div className="lda-done-msg">All draws completed! 🎊</div>}
        </div>
      )}

      {phase === "showBtn" && <div className={`lda-cursor ${cursorClick?"lda-cursor-active":""}`} style={cursorStyle}/>}

      {revealed.length > 0 && (
        <div className="lda-winners-strip">
          {revealed.map((w, i) => (
            <div key={i} className={`lda-w-chip ${w.noWinner?"lda-w-chip-none":""}`}>
              {w.noWinner ? `😔 Draw #${w.num}: No winner`
               : <>{`🏆 Draw #${w.num}: `}<strong>{w.name}</strong>{w.prize?<span style={{opacity:0.7}}>{` · ${w.prize}`}</span>:""}</>}
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

const drawCSS = `
.lda-bg{position:fixed;inset:0;z-index:-2;background:linear-gradient(135deg,#020617 0%,#0f172a 45%,#1e1b4b 100%);}
.lda-stars{position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:radial-gradient(1.5px 1.5px at 8% 12%,rgba(255,255,255,0.7) 0%,transparent 100%),radial-gradient(1px 1px at 22% 55%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 38% 8%,rgba(147,197,253,0.7) 0%,transparent 100%),radial-gradient(2px 2px at 52% 40%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 66% 78%,rgba(255,255,255,0.6) 0%,transparent 100%),radial-gradient(1px 1px at 78% 22%,rgba(147,197,253,0.5) 0%,transparent 100%),radial-gradient(1px 1px at 90% 60%,rgba(255,255,255,0.4) 0%,transparent 100%),radial-gradient(2px 2px at 14% 85%,rgba(147,197,253,0.4) 0%,transparent 100%),radial-gradient(1px 1px at 44% 92%,rgba(255,255,255,0.5) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 72% 5%,rgba(255,255,255,0.6) 0%,transparent 100%);animation:ldaStarsTwinkle 3s ease-in-out infinite alternate;}
@keyframes ldaStarsTwinkle{0%{opacity:0.6}100%{opacity:1}}
.lda-bg::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 40% at 18% 28%,rgba(59,130,246,0.2) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 82% 72%,rgba(30,58,138,0.25) 0%,transparent 70%);animation:ldaBgBreath 5s ease-in-out infinite alternate;}
@keyframes ldaBgBreath{0%{opacity:0.5}100%{opacity:1}}
.lda-center{display:flex;flex-direction:column;align-items:center;gap:20px;position:relative;z-index:2;padding:0 16px;width:100%;max-width:600px;}
.lda-big-num{font-size:clamp(80px,20vw,200px);font-weight:900;color:#fff;line-height:1;font-family:Georgia,serif;text-shadow:0 0 80px rgba(59,130,246,1),0 0 160px rgba(59,130,246,0.5);animation:ldaNumPop 0.32s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes ldaNumPop{from{opacity:0;transform:scale(2.8)}to{opacity:1;transform:scale(1)}}
.lda-ready-label{font-size:clamp(22px,6vw,60px);font-weight:900;color:#fff;text-align:center;letter-spacing:-1px;text-shadow:0 0 50px rgba(255,255,255,0.4);animation:ldaLabelUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards;}
.lda-draw-label{font-size:clamp(38px,9vw,100px);font-weight:900;letter-spacing:-2px;text-align:center;background:linear-gradient(135deg,#fbbf24,#fde68a,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 40px rgba(251,191,36,1));animation:ldaDrawBounce 0.5s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes ldaLabelUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes ldaDrawBounce{0%{opacity:0;transform:scale(0.25)rotate(-10deg)}70%{transform:scale(1.1)rotate(2deg)}100%{opacity:1;transform:scale(1)rotate(0)}}
.lda-draw-pill{padding:5px 18px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;background:rgba(59,130,246,0.18);border:1px solid rgba(59,130,246,0.4);color:#93c5fd;}
.lda-name-box{width:100%;max-width:480px;padding:22px 32px;border-radius:22px;text-align:center;background:rgba(255,255,255,0.04);border:2px solid rgba(59,130,246,0.35);backdrop-filter:blur(24px);box-shadow:0 0 60px rgba(59,130,246,0.18),inset 0 1px 0 rgba(255,255,255,0.07);transition:border-color 0.3s,box-shadow 0.4s,background 0.3s;}
.lda-name-eyebrow{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#60a5fa;margin-bottom:10px;}
.lda-name-text{font-size:clamp(22px,6vw,52px);font-weight:900;color:#fff;letter-spacing:-0.5px;min-height:1.1em;text-shadow:0 2px 20px rgba(0,0,0,0.5);word-break:break-word;}
.lda-winner-prize{color:#93c5fd;font-size:clamp(12px,2.5vw,15px);font-weight:700;margin-top:8px;}
.lda-winner-sub{color:#fde68a;font-size:clamp(12px,2.5vw,15px);font-weight:700;margin-top:4px;letter-spacing:0.5px;}
.lda-shuffling{border-color:rgba(147,197,253,0.7)!important;box-shadow:0 0 80px rgba(59,130,246,0.6),inset 0 1px 0 rgba(255,255,255,0.1)!important;}
.lda-shuffling .lda-name-text{color:#93c5fd;}
.lda-winner-box{border-color:#fbbf24!important;background:rgba(251,191,36,0.07)!important;box-shadow:0 0 90px rgba(251,191,36,0.7),0 0 180px rgba(251,191,36,0.25),inset 0 1px 0 rgba(255,255,255,0.15)!important;animation:ldaWinPulse 0.8s ease infinite alternate;}
.lda-winner-box .lda-name-text{color:#fde68a!important;}
@keyframes ldaWinPulse{from{transform:scale(1)}to{transform:scale(1.022)}}
.lda-no-winner-box{border-color:rgba(148,163,184,0.6)!important;background:rgba(148,163,184,0.06)!important;box-shadow:0 0 40px rgba(148,163,184,0.2),inset 0 1px 0 rgba(255,255,255,0.08)!important;}
.lda-no-winner-box .lda-name-text{color:#94a3b8!important;font-size:3rem!important;}
.lda-no-winner-sub{color:#94a3b8;font-size:clamp(11px,2.2vw,14px);font-weight:600;margin-top:8px;letter-spacing:0.3px;}
.lda-w-chip-none{background:rgba(148,163,184,0.1)!important;border-color:rgba(148,163,184,0.3)!important;color:#94a3b8!important;}
.lda-draw-btn{padding:clamp(14px,2.5vw,20px) clamp(36px,8vw,64px);border-radius:16px;border:none;cursor:not-allowed;position:relative;overflow:hidden;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-size:clamp(1rem,2.5vw,1.3rem);font-weight:900;letter-spacing:3px;box-shadow:0 5px 0 #1e40af,0 12px 30px rgba(30,58,138,0.5),0 0 70px rgba(59,130,246,0.7);animation:ldaBtnPulse 1s ease infinite alternate;}
.lda-draw-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent 60%);}
.lda-draw-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent);animation:ldaShine 1.6s ease infinite;}
@keyframes ldaShine{0%{left:-100%}100%{left:220%}}
@keyframes ldaBtnPulse{from{box-shadow:0 5px 0 #1e40af,0 12px 30px rgba(30,58,138,0.5),0 0 40px rgba(59,130,246,0.5)}to{box-shadow:0 5px 0 #1e40af,0 12px 30px rgba(30,58,138,0.5),0 0 90px rgba(59,130,246,1)}}
.lda-dots{display:flex;gap:8px;}
.lda-dots span{width:9px;height:9px;border-radius:50%;background:#3b82f6;animation:ldaDot 0.55s ease-in-out infinite alternate;}
.lda-dots span:nth-child(2){animation-delay:0.1s;background:#60a5fa;}
.lda-dots span:nth-child(3){animation-delay:0.2s;background:#93c5fd;}
.lda-dots span:nth-child(4){animation-delay:0.3s;background:#60a5fa;}
.lda-dots span:nth-child(5){animation-delay:0.4s;background:#3b82f6;}
@keyframes ldaDot{from{transform:scale(0.5);opacity:0.4}to{transform:scale(1.5);opacity:1}}
.lda-done-msg{font-size:clamp(1rem,3.5vw,1.4rem);font-weight:900;color:#fde68a;text-align:center;text-shadow:0 0 30px rgba(251,191,36,0.8);animation:ldaLabelUp 0.4s ease forwards;}
.lda-cursor{position:fixed;width:28px;height:28px;z-index:9999999;pointer-events:none;transform:translate(-4px,-4px);transition:left 0.85s cubic-bezier(0.34,1.4,0.64,1),top 0.85s cubic-bezier(0.34,1.4,0.64,1),opacity 0.3s;}
.lda-cursor::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cpath d='M4 2L4 24L10 18L14 28L18 26.5L14 16.5L24 16.5Z' fill='white' stroke='%231e3a8a' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat;background-size:contain;filter:drop-shadow(0 2px 8px rgba(30,58,138,0.8));}
.lda-cursor-active{transform:translate(-4px,-4px)scale(0.75);}
.lda-cursor-active::before{filter:drop-shadow(0 0 12px rgba(59,130,246,1));}
.lda-winners-strip{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;flex-wrap:wrap;justify-content:center;z-index:3;max-width:92%;}
.lda-w-chip{padding:7px 14px;border-radius:100px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:12px;font-weight:600;backdrop-filter:blur(14px);box-shadow:0 0 20px rgba(251,191,36,0.2);animation:ldaChipIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes ldaChipIn{from{opacity:0;transform:translateY(18px)scale(0.8)}to{opacity:1;transform:none}}
`;

function AnnounceBanner({ winner, prize, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 7000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:999997,display:"flex",justifyContent:"center",padding:"12px 16px",pointerEvents:"none"}}>
      <style>{bannerCSS}</style>
      <div className="ldb-banner">
        <div className="ldb-icon">🏆</div>
        <div className="ldb-content">
          <div className="ldb-eyebrow">Winner Announced</div>
          <div className="ldb-body"><strong>{winner}</strong> won <strong>{prize}</strong></div>
        </div>
        <button className="ldb-close" style={{pointerEvents:"all"}} onClick={onClose}>×</button>
      </div>
    </div>,
    document.body
  );
}

const bannerCSS = `
.ldb-banner{display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:16px;background:rgba(10,16,30,0.94);backdrop-filter:blur(20px);border:1.5px solid rgba(251,191,36,0.5);box-shadow:0 8px 40px rgba(0,0,0,0.35),0 0 30px rgba(251,191,36,0.18);color:#fff;pointer-events:all;max-width:460px;animation:ldbIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes ldbIn{from{opacity:0;transform:translateY(-44px)scale(0.88)}to{opacity:1;transform:none}}
.ldb-icon{font-size:26px;flex-shrink:0;}
.ldb-eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#fbbf24;margin-bottom:2px;}
.ldb-body{font-size:13px;font-weight:600;color:#e2e8f0;}
.ldb-close{background:rgba(255,255,255,0.1);border:none;color:#94a3b8;font-size:17px;cursor:pointer;border-radius:8px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;margin-left:auto;transition:all 0.15s;}
.ldb-close:hover{background:rgba(255,255,255,0.2);color:#fff}
`;

function CelebrationModal({ win, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 9000); return () => clearTimeout(t); }, [onClose]);
  return createPortal(
    <>
      <FireworksCanvas/>
      <style>{celebCSS}</style>
      <div className="ldc-overlay" onClick={onClose}>
        <div className="ldc-modal" onClick={e => e.stopPropagation()}>
          <div className="ldc-ring"/>
          {[...Array(14)].map((_, i) => <div key={i} className="ldc-sp" style={{"--si":i}}/>)}
          <button className="ldc-close" onClick={onClose}>×</button>
          <div className="ldc-trophy">🏆</div>
          <div className="ldc-congrats">CONGRATULATIONS!</div>
          <div className="ldc-name">{win?.winner_name}</div>
          <div className="ldc-prize-box">
            <div className="ldc-prize-label">YOU WON</div>
            <div className="ldc-prize-val">{win?.prize_text}</div>
          </div>
          {win?.announced_at && <div className="ldc-date">Announced: {fmtUAE(win.announced_at)}</div>}
          <div className="ldc-hint">Closing in 9 seconds…</div>
        </div>
      </div>
    </>,
    document.body
  );
}

const celebCSS = `
.ldc-overlay{position:fixed;inset:0;z-index:999998;background:rgba(8,14,28,0.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;}
.ldc-modal{width:min(420px,92vw);background:rgba(255,255,255,0.97);border-radius:26px;padding:clamp(28px,5vw,44px) clamp(20px,4vw,32px) clamp(24px,4vw,36px);text-align:center;position:relative;overflow:hidden;border:2px solid rgba(251,191,36,0.5);box-shadow:0 0 0 4px rgba(251,191,36,0.1),0 0 80px rgba(251,191,36,0.4),0 30px 70px rgba(30,58,138,0.2);animation:ldcIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes ldcIn{from{opacity:0;transform:scale(0.35)rotate(-7deg)}70%{transform:scale(1.04)rotate(1.5deg)}to{opacity:1;transform:none}}
.ldc-ring{position:absolute;inset:-30px;border-radius:50%;background:conic-gradient(from 0deg,rgba(251,191,36,0.15) 0%,transparent 20%,rgba(251,191,36,0.1) 40%,transparent 60%,rgba(59,130,246,0.1) 80%,transparent 100%);animation:ldcRing 8s linear infinite;}
@keyframes ldcRing{to{transform:rotate(360deg)}}
.ldc-sp{position:absolute;width:7px;height:7px;border-radius:50%;background:radial-gradient(circle,#fde68a,#f59e0b);left:calc(4% + var(--si)*7%);top:calc(6% + var(--si)*6%);animation:ldcSp calc(1.2s + var(--si)*0.17s) ease infinite;box-shadow:0 0 6px #fbbf24;}
@keyframes ldcSp{0%,100%{opacity:0;transform:scale(0)translateY(0)}50%{opacity:1;transform:scale(1.9)translateY(-16px)}}
.ldc-close{position:absolute;right:12px;top:10px;border:none;background:rgba(100,116,139,0.12);color:#64748b;font-size:18px;cursor:pointer;border-radius:9px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:700;transition:all 0.15s;}
.ldc-close:hover{background:rgba(100,116,139,0.22);color:#334155}
.ldc-trophy{font-size:clamp(52px,10vw,72px);display:block;margin:0 auto 4px;animation:ldcTrophy 0.8s cubic-bezier(0.16,1,0.3,1) forwards;filter:drop-shadow(0 8px 20px rgba(245,158,11,0.55));}
@keyframes ldcTrophy{0%{transform:scale(0)rotate(-35deg);opacity:0}65%{transform:scale(1.18)rotate(5deg)}85%{transform:scale(0.96)}100%{transform:none;opacity:1}}
.ldc-congrats{font-size:clamp(1.1rem,4vw,1.5rem);font-weight:900;letter-spacing:2px;margin-bottom:5px;background:linear-gradient(135deg,#b45309,#f59e0b,#fde68a,#f59e0b,#b45309);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:ldcGold 2.5s linear infinite;}
@keyframes ldcGold{0%{background-position:100%}100%{background-position:-100%}}
.ldc-name{font-size:clamp(1.05rem,3.5vw,1.3rem);font-weight:900;color:#1e3a8a;margin-bottom:14px;animation:ldcUp 0.5s 0.35s ease both;}
@keyframes ldcUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.ldc-prize-box{background:linear-gradient(135deg,rgba(30,58,138,0.06),rgba(59,130,246,0.1));border:2px solid rgba(59,130,246,0.22);border-radius:16px;padding:13px 20px;margin:0 0 12px;animation:ldcUp 0.5s 0.5s ease both;}
.ldc-prize-label{font-size:9px;font-weight:800;letter-spacing:3px;color:#64748b;text-transform:uppercase;margin-bottom:4px}
.ldc-prize-val{font-size:clamp(1.15rem,3.5vw,1.4rem);font-weight:900;color:#3b82f6}
.ldc-date{font-size:11px;color:#94a3b8;margin-bottom:5px}
.ldc-hint{font-size:11px;color:#cbd5e1}
`;

function DrawTimeline({ draw, nowMs }) {
  const steps = [
    { field:"registration_open_at",  label:"Registration Opens",  icon:"🟢", activeColor:"#16a34a", dotGradient:"linear-gradient(135deg,#16a34a,#4ade80)" },
    { field:"registration_close_at", label:"Registration Closes", icon:"🔒", activeColor:"#f97316", dotGradient:"linear-gradient(135deg,#ea580c,#fb923c)" },
    { field:"draw_at",               label:"Lucky Draw",          icon:"🎰", activeColor:"#3b82f6", dotGradient:"linear-gradient(135deg,#1e3a8a,#3b82f6)" },
  ];
  return (
    <div className="ldtl-wrap">
      {steps.map((step, i) => {
        const ms = draw[step.field] ? new Date(draw[step.field]).getTime() : 0;
        const past = ms && nowMs > ms;
        const active = !past && (i === 0 || new Date(draw[steps[i-1].field]).getTime() < nowMs);
        const { date, time } = fmtUAESplit(draw[step.field]);
        return (
          <div key={step.field} className={`ldtl-step ${past?"ldtl-past":active?"ldtl-active":"ldtl-future"}`}>
            <div className="ldtl-dot-wrap">
              <div className="ldtl-dot" style={past||active ? {background:step.dotGradient} : {}}>
                {past ? <span style={{color:"#fff",fontWeight:900,fontSize:13}}>✓</span> : <span style={{fontSize:13}}>{step.icon}</span>}
              </div>
              {active && <div className="ldtl-pulse-ring" style={{borderColor:step.activeColor}}/>}
            </div>
            <div className="ldtl-info">
              <div className="ldtl-label" style={active ? {color:step.activeColor} : {}}>{step.label}</div>
              <div className={`ldtl-date ${past?"ldtl-date-past":""}`}>{date}</div>
              <div className="ldtl-time">{time} <span className="ldtl-tz">UAE</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryCard({ h, idx }) {
  const { date, time } = fmtUAESplit(h.announced_at || h.created_at);
  return (
    <div className="ldhc-card" style={{"--hi":idx}}>
      <div className="ldhc-seq">#{h.seq_no}</div>
      <div className="ldhc-mid">
        <div className="ldhc-draw-name">{h.draw_title}</div>
        <div className="ldhc-winner"><span className="ldhc-avatar">👤</span><span className="ldhc-winner-name">{h.winner_name}</span></div>
      </div>
      <div className="ldhc-right">
        <div className="ldhc-prize">{h.prize_text}</div>
        <div className="ldhc-date-wrap"><span className="ldhc-date">{date}</span><span className="ldhc-time-badge">{time}</span></div>
      </div>
    </div>
  );
}

export default function LuckyDraw() {
  const [mounted,          setMounted]          = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [msg,              setMsg]              = useState("");
  const [draw,             setDraw]             = useState(null);
  const [isRegistered,     setIsRegistered]     = useState(false);
  const [registeredCount,  setRegisteredCount]  = useState(0);
  const [results,          setResults]          = useState([]);
  const [allHistory,       setAllHistory]       = useState([]);
  const [showAllHistory,   setShowAllHistory]   = useState(false);
  const [tick,             setTick]             = useState(0);
  const intervalRef                             = useRef(null);
  const [showCelebration,  setShowCelebration]  = useState(false);
  const [myWin,            setMyWin]            = useState(null);
  const [userId,           setUserId]           = useState(null);
  const [showDrawAnim,     setShowDrawAnim]     = useState(false);
  const showDrawAnimRef                         = useRef(false);
  const [participants,     setParticipants]     = useState([]);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [activeAnnouncement,   setActiveAnnouncement]   = useState(null);
  const [myBalance,            setMyBalance]            = useState(null);
  const lastRunRef      = useRef(0);
  const shownWinIdRef   = useRef(null);
  const lastDrawIdRef   = useRef(null);
  const drawAnimShownRef = useRef(false);
  const announcedIdsRef = useRef(new Set());
  const nowMs = Date.now();

  useEffect(() => {
    try {
      const s = localStorage.getItem("ld_shown_win_id"); if (s) shownWinIdRef.current = s;
      const d = localStorage.getItem("ld_last_draw_id"); if (d) lastDrawIdRef.current = d;
      const a = localStorage.getItem("ld_announced_ids");
      if (a) announcedIdsRef.current = new Set(JSON.parse(a));
      const anim = localStorage.getItem("ld_draw_anim_shown"); if (anim === "true") drawAnimShownRef.current = true;
    } catch {}
  }, []);

  const loadAll = useCallback(async () => {
    const { data:authData, error:authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) { setMsg("Please login first."); setLoading(false); return; }
    const uid = authData.user.id;
    setUserId(uid);

    const activeRes = await supabase.from("luckydraw_active").select("*").eq("id", 1).single();
    if (activeRes.error) { setMsg(`Error: ${activeRes.error.message}`); setLoading(false); return; }
    const d = activeRes.data || null;
    setDraw(d);

    if (d?.draw_id) {
      const curr = String(d.draw_id), prev = lastDrawIdRef.current;
      if (!prev || prev !== curr) {
        lastDrawIdRef.current = curr;
        shownWinIdRef.current = null;
        drawAnimShownRef.current = false;
        announcedIdsRef.current = new Set();
        try {
          localStorage.setItem("ld_last_draw_id", curr);
          localStorage.removeItem("ld_shown_win_id");
          localStorage.removeItem("ld_announced_ids");
          localStorage.removeItem("ld_draw_anim_shown");
        } catch {}
      }
    }

    if (d?.draw_id && d?.draw_at) {
      const drawMs = new Date(d.draw_at).getTime();
      if (Date.now() >= drawMs) {
        const now2 = Date.now();
        if (now2 - lastRunRef.current > 1500) {
          lastRunRef.current = now2;
          const { data:runData, error:runErr } = await supabase.rpc("ld_run_due");
          if (runErr) setMsg(`Auto draw failed: ${runErr.message}`);
          else if (runData?.ok === false) setMsg(runData?.error || "Auto draw failed.");
        }
      }
    }

    if (d?.draw_id) {
      const countRes = await supabase.from("luckydraw_registrations").select("id", { count:"exact", head:true }).eq("draw_id", d.draw_id);
      setRegisteredCount(countRes.count || 0);
      const regRes = await supabase.from("luckydraw_registrations").select("id").eq("draw_id", d.draw_id).eq("user_id", uid).maybeSingle();
      setIsRegistered(!!regRes.data);
      const pRes = await supabase.from("luckydraw_registrations").select("users_profiles(full_name)").eq("draw_id", d.draw_id);
      const pNames = (pRes.data || []).map(r => r.users_profiles?.full_name).filter(Boolean);
      setParticipants(pNames);
    } else {
      setIsRegistered(false); setRegisteredCount(0);
    }

    const profRes = await supabase.from("users_profiles").select("total_aidla_coins").eq("user_id", uid).maybeSingle();
    setMyBalance(profRes.data?.total_aidla_coins ?? null);

    const histRes = await supabase.from("luckydraw_results").select("id,draw_title,winner_name,prize_text,created_at,seq_no,announced_at").order("created_at", {ascending:false}).limit(50);
    setAllHistory(histRes.data || []);

    if (d?.draw_id) {
      const res = await supabase.from("luckydraw_results").select("id,draw_title,winner_name,prize_text,created_at,seq_no,winner_user_id,announced_at").eq("draw_id", d.draw_id).order("seq_no", {ascending:true});
      const rows = res.data || [];
      setResults(rows);

      const drawMs2 = d.draw_at ? new Date(d.draw_at).getTime() : 0;
      const isDrawTimeReached = drawMs2 && Date.now() >= drawMs2;
      const hasResults = rows.length > 0;
      const animationNotShownYet = !drawAnimShownRef.current;

      if (isDrawTimeReached && hasResults && animationNotShownYet) {
        drawAnimShownRef.current = true;
        showDrawAnimRef.current = true;
        try { localStorage.setItem("ld_draw_anim_shown", "true"); } catch {}
        const toAnnounce = rows.filter(r => {
          const annMs = r.announced_at ? new Date(r.announced_at).getTime() : 0;
          return (!annMs || Date.now() >= annMs) && !announcedIdsRef.current.has(String(r.id));
        });
        setPendingAnnouncements(toAnnounce);
        setShowDrawAnim(true);
      } else if (isDrawTimeReached && hasResults && drawAnimShownRef.current) {
        rows.forEach(r => {
          const annMs = r.announced_at ? new Date(r.announced_at).getTime() : 0;
          const isAnn = !annMs || Date.now() >= annMs;
          if (isAnn && !announcedIdsRef.current.has(String(r.id))) {
            announcedIdsRef.current.add(String(r.id));
            try { localStorage.setItem("ld_announced_ids", JSON.stringify([...announcedIdsRef.current])); } catch {}
            setActiveAnnouncement({ winner_name:r.winner_name, prize_text:r.prize_text });
          }
        });
      }

      const mine = rows.find(r => r.winner_user_id === uid);
      if (mine) {
        const annMs2 = mine.announced_at ? new Date(mine.announced_at).getTime() : 0;
        const isAnn = annMs2 ? Date.now() >= annMs2 : true;
        setMyWin(mine);
        if (isAnn && shownWinIdRef.current !== String(mine.id)) {
          shownWinIdRef.current = String(mine.id);
          try { localStorage.setItem("ld_shown_win_id", String(mine.id)); } catch {}
          if (!showDrawAnimRef.current) setShowCelebration(true);
        }
      }
    } else {
      setResults([]); setMyWin(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true); setLoading(true); loadAll();
    intervalRef.current = setInterval(() => { setTick(x => x+1); loadAll(); }, 2000);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDrawComplete = useCallback((drawIndex) => {
    const result = pendingAnnouncements[drawIndex];
    if (result && !announcedIdsRef.current.has(String(result.id))) {
      announcedIdsRef.current.add(String(result.id));
      try { localStorage.setItem("ld_announced_ids", JSON.stringify([...announcedIdsRef.current])); } catch {}
      if (result.winner_name) setActiveAnnouncement({ winner_name:result.winner_name, prize_text:result.prize_text });
    }
  }, [pendingAnnouncements]);

  const handleAllDone = useCallback(() => {
    showDrawAnimRef.current = false;
    setShowDrawAnim(false);
    if (myWin && shownWinIdRef.current === String(myWin.id)) setShowCelebration(true);
  }, [myWin]);

  const regOpenMs  = useMemo(() => draw?.registration_open_at  ? new Date(draw.registration_open_at).getTime()  : 0, [draw]);
  const regCloseMs = useMemo(() => draw?.registration_close_at ? new Date(draw.registration_close_at).getTime() : 0, [draw]);
  const drawAtMs   = useMemo(() => draw?.draw_at               ? new Date(draw.draw_at).getTime()               : 0, [draw]);

  const phase = useMemo(() => {
    if (!draw?.draw_id) return "NO_DRAW";
    if (nowMs < regOpenMs) return "BEFORE_OPEN";
    if (nowMs >= regOpenMs && nowMs < regCloseMs) return "OPEN";
    if (nowMs >= regCloseMs && nowMs < drawAtMs) return "AFTER_CLOSE";
    return "DRAWING_OR_DONE";
  }, [draw, tick, regOpenMs, regCloseMs, drawAtMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const countdownMs = useMemo(() => {
    if (phase==="BEFORE_OPEN") return regOpenMs - nowMs;
    if (phase==="OPEN")        return regCloseMs - nowMs;
    if (phase==="AFTER_CLOSE") return drawAtMs - nowMs;
    return 0;
  }, [phase, regOpenMs, regCloseMs, drawAtMs, nowMs]);

  const canRegister = !!draw?.draw_id && phase === "OPEN" && !isRegistered;

  const onRegister = async () => {
    setMsg("");
    const {data:auth} = await supabase.auth.getUser();
    if (!auth?.user) { setMsg("Please login first."); return; }
    if (!draw?.draw_id) { setMsg("No active draw."); return; }
    if (phase !== "OPEN") { setMsg("Registration not open."); return; }
    const {data, error} = await supabase.rpc("ld_register", {p_draw_id:draw.draw_id});
    if (error) { setMsg(`Register failed: ${error.message}`); return; }
    if (!data?.ok) { setMsg(data?.error || "Register failed"); return; }
    setMsg("Registered ✅"); await loadAll();
  };

  const cdCfgMap = {
    BEFORE_OPEN: { label:"Registration opens in", color:"#1e40af", bg:"rgba(30,58,138,0.07)", border:"rgba(30,58,138,0.2)", icon:"⏳" },
    OPEN:        { label:"Registration closes in", color:"#15803d", bg:"rgba(22,163,74,0.07)", border:"rgba(22,163,74,0.22)", icon:"🟢" },
    AFTER_CLOSE: { label:"Draw starts in",         color:"#b45309", bg:"rgba(245,158,11,0.07)", border:"rgba(245,158,11,0.25)", icon:"⏱" },
  };
  const cdCfg = cdCfgMap[phase];

  const [isSmall, setIsSmall] = useState(typeof window !== "undefined" && window.innerWidth < 600);
  useEffect(() => {
    const h = () => setIsSmall(window.innerWidth < 600);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  const defaultVisible = isSmall ? 1 : 8;
  const displayedHistory = showAllHistory ? allHistory : allHistory.slice(0, defaultVisible);

  return (
    <div style={{padding:"12px",maxWidth:900,margin:"0 auto",minHeight:"100vh"}}>
      <style>{mainCSS}</style>

      {showDrawAnim && (
        <DrawAnimationOverlay
          participants={participants}
          drawsCount={Number(draw?.draws_count || 1)}
          winners={results}
          onDrawComplete={handleDrawComplete}
          onAllDone={handleAllDone}
          onClose={() => { showDrawAnimRef.current = false; setShowDrawAnim(false); }}
        />
      )}

      {showCelebration && mounted && <CelebrationModal win={myWin} onClose={() => setShowCelebration(false)}/>}

      {activeAnnouncement && mounted && (
        <AnnounceBanner winner={activeAnnouncement.winner_name} prize={activeAnnouncement.prize_text} onClose={() => setActiveAnnouncement(null)}/>
      )}

      <div className="ldp-header">
        <div className="ldp-header-icon">🎰</div>
        <div>
          <h1 className="ldp-title">Lucky Draw</h1>
          <div className="ldp-sub">Live Raffle · UAE Time</div>
        </div>
      </div>

      {loading ? (
        <div className="ldp-loading"><div className="ldp-spinner"/><span>Loading…</span></div>
      ) : !draw?.draw_id ? (
        <div className="ldp-card" style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:44,marginBottom:10}}>🎲</div>
          <div style={{fontSize:"1.15rem",fontWeight:800,color:"#334155",marginBottom:5}}>No Active Draw</div>
          <div style={{color:"#94a3b8",fontSize:"0.85rem"}}>Stay tuned for the next lucky draw!</div>
        </div>
      ) : (
        <div className="ldp-card">
          <div className="ldp-top">
            <div className="ldp-top-left">
              <div className="ldp-draw-title-row">
                <span className="ldp-draw-title">{draw.title}</span>
                <span className={`ldp-phase-badge ldp-phase-${phase}`}>
                  {phase==="OPEN"?"🟢 Open":phase==="BEFORE_OPEN"?"⏳ Soon":phase==="AFTER_CLOSE"?"🔒 Closed":"🎰 Drawing"}
                </span>
              </div>
              <div className="ldp-meta-chips">
                <span className="ldp-chip">{draw.entry_type==="paid"?`💰 Paid · ${Number(draw.entry_cost||0)} coins`:"🆓 Free Entry"}</span>
                <span className="ldp-chip">🎯 {Number(draw.draws_count||1)} Draw{Number(draw.draws_count||1)>1?"s":""}</span>
                <span className="ldp-chip">👥 {registeredCount} Registered</span>
                {myBalance !== null && <span className="ldp-chip" style={{background:"#eff6ff",color:"#1e3a8a",fontWeight:800}}>🪙 Your balance: {Number(myBalance).toLocaleString()} coins</span>}
              </div>
            </div>
            <div className="ldp-actions">
              <button disabled={!canRegister} onClick={onRegister} className={`ldp-btn ${canRegister?"ldp-btn-primary":"ldp-btn-dim"}`}>
                {isRegistered ? "✅ Registered" : "Register Now"}
              </button>
              {myWin && <button onClick={() => setShowCelebration(true)} className="ldp-btn ldp-btn-gold">🏆 My Prize</button>}
              {phase === "DRAWING_OR_DONE" && (
                <button onClick={() => { drawAnimShownRef.current = false; showDrawAnimRef.current = true; setShowDrawAnim(true); }} className="ldp-btn ldp-btn-outline">🎬 Replay Draw</button>
              )}
            </div>
          </div>

          {cdCfg && (
            <div className="ldp-cd-bar" style={{background:cdCfg.bg,borderColor:cdCfg.border}}>
              <span style={{fontSize:"1rem"}}>{cdCfg.icon}</span>
              <span className="ldp-cd-label" style={{color:cdCfg.color}}>{cdCfg.label}</span>
              <span className="ldp-cd-timer" style={{color:cdCfg.color}}>{msToHMS(countdownMs)}</span>
            </div>
          )}

          <div className="ldp-section">
            <div className="ldp-section-title">📅 Schedule</div>
            <DrawTimeline draw={draw} nowMs={nowMs}/>
          </div>

          <div className="ldp-section">
            <div className="ldp-section-title">🎁 Prizes</div>
            <div className="ldp-prizes">
              {(draw.prizes||[]).slice(0, Number(draw.draws_count||1)).map((p, i) => (
                <div key={i} className="ldp-prize-card">
                  <div className="ldp-prize-rank">{i+1}</div>
                  <div className="ldp-prize-name">{prizeToText(p)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ldp-section">
            <div className="ldp-section-title">🏆 Results</div>
            {results.length === 0 ? (
              <div className="ldp-empty-note">{phase==="DRAWING_OR_DONE" ? "Draw in progress…" : "Results will appear here after the draw."}</div>
            ) : (
              <div className="ldp-results">
                {results.map(r => {
                  const annMs = r.announced_at ? new Date(r.announced_at).getTime() : 0;
                  const isAnn = annMs ? nowMs >= annMs : true;
                  const isMe  = r.winner_user_id === userId;
                  return (
                    <div key={r.id} className={`ldp-result-row ${isMe?"ldp-result-mine":""}`}>
                      <div className="ldp-result-num">{r.seq_no}</div>
                      <div className="ldp-result-winner">
                        <span className="ldp-result-avatar">{isMe?"🌟":"👤"}</span>
                        <div>
                          <div className="ldp-result-name">
                            {r.winner_name}
                            {isMe && <span className="ldp-you-tag">You</span>}
                          </div>
                        </div>
                      </div>
                      <div className="ldp-result-prize">{r.prize_text}</div>
                      <div>
                        {isAnn
                          ? <span className="ldp-badge-green">✓ Announced</span>
                          : <span className="ldp-badge-orange">⏱ {msToHMS(annMs-nowMs)}</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="ldp-card" style={{marginTop:12}}>
        <div className="ldp-hist-hdr">
          <div>
            <div className="ldp-section-title" style={{margin:0}}>📜 Draw History</div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>{allHistory.length} records</div>
          </div>
          <button onClick={() => setShowAllHistory(x => !x)} className="ldp-btn ldp-btn-ghost">
            {showAllHistory ? "Less ↑" : "All ↓"}
          </button>
        </div>
        {displayedHistory.length === 0 ? (
          <div className="ldp-empty-note">No draw history yet.</div>
        ) : (
          <div className="ldp-hist-list">
            {displayedHistory.map((h, i) => <HistoryCard key={h.id} h={h} idx={i}/>)}
          </div>
        )}
      </div>

      {msg && <div className="ldp-msg">{msg}</div>}
    </div>
  );
}

const mainCSS = `
  :root{--ld-deep:#1e3a8a;--ld-blue:#3b82f6;--ld-light:#60a5fa;--ld-pale:#93c5fd;--ld-text:#0f172a;--ld-sub:#334155;--ld-muted:#64748b;}
  .ldp-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 0 4px;animation:ldpIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;}
  @keyframes ldpIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
  .ldp-header-icon{font-size:clamp(28px,5vw,38px);animation:ldpSpin 1.5s ease-out;}
  @keyframes ldpSpin{from{transform:rotateY(0)}to{transform:rotateY(720deg)}}
  .ldp-title{font-size:clamp(1.4rem,4vw,1.9rem);font-weight:900;letter-spacing:-1px;margin:0;background:linear-gradient(135deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .ldp-sub{color:var(--ld-muted);font-size:clamp(0.62rem,1.5vw,0.78rem);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:1px;}
  .ldp-card{background:rgba(255,255,255,0.88);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.9);border-radius:18px;padding:clamp(14px,3vw,20px);box-shadow:12px 12px 40px rgba(15,23,42,0.07),-8px -8px 30px rgba(255,255,255,0.8),inset 0 0 0 1px rgba(255,255,255,0.5);animation:ldpCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;transform:translateY(14px);}
  @keyframes ldpCardIn{to{opacity:1;transform:none}}
  .ldp-top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:13px;}
  .ldp-top-left{flex:1;min-width:0;}
  .ldp-draw-title-row{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:7px;}
  .ldp-draw-title{font-size:clamp(1rem,3vw,1.25rem);font-weight:900;color:var(--ld-text);letter-spacing:-0.5px;}
  .ldp-phase-badge{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;}
  .ldp-phase-OPEN{background:rgba(22,163,74,0.1);color:#15803d;border:1px solid rgba(22,163,74,0.25);}
  .ldp-phase-BEFORE_OPEN{background:rgba(59,130,246,0.1);color:#1e3a8a;border:1px solid rgba(59,130,246,0.25);}
  .ldp-phase-AFTER_CLOSE{background:rgba(249,115,22,0.1);color:#c2410c;border:1px solid rgba(249,115,22,0.25);}
  .ldp-phase-DRAWING_OR_DONE{background:rgba(30,58,138,0.1);color:#1e3a8a;border:1px solid rgba(30,58,138,0.25);animation:ldpPhasePulse 1.5s ease infinite;}
  @keyframes ldpPhasePulse{0%,100%{opacity:1}50%{opacity:0.55}}
  .ldp-meta-chips{display:flex;gap:6px;flex-wrap:wrap;}
  .ldp-chip{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;color:var(--ld-sub);background:rgba(30,58,138,0.06);border:1px solid rgba(30,58,138,0.1);}
  .ldp-actions{display:flex;flex-direction:column;gap:7px;min-width:130px;}
  .ldp-btn{padding:9px 14px;border-radius:11px;border:none;font-size:clamp(0.78rem,2vw,0.88rem);font-weight:700;cursor:pointer;transition:all 0.15s cubic-bezier(0.4,0,0.2,1);white-space:nowrap;font-family:inherit;}
  .ldp-btn-primary{background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;box-shadow:0 3px 0 #1e40af,0 6px 14px rgba(30,58,138,0.26);}
  .ldp-btn-primary:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);}
  .ldp-btn-primary:active:not(:disabled){transform:translateY(3px);box-shadow:0 0 0 #1e40af;}
  .ldp-btn-dim{background:#e2e8f0;color:#94a3b8;cursor:not-allowed;}
  .ldp-btn-gold{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;box-shadow:0 3px 0 #b45309,0 6px 14px rgba(245,158,11,0.28);animation:ldpGold 2s ease infinite;}
  @keyframes ldpGold{0%,100%{box-shadow:0 3px 0 #b45309,0 6px 14px rgba(245,158,11,0.28)}50%{box-shadow:0 3px 0 #b45309,0 6px 24px rgba(245,158,11,0.56)}}
  .ldp-btn-outline{background:transparent;color:var(--ld-blue);border:1.5px solid rgba(59,130,246,0.3);}
  .ldp-btn-outline:hover{background:rgba(59,130,246,0.06);transform:translateY(-1px);}
  .ldp-btn-ghost{background:transparent;color:var(--ld-muted);border:1px solid rgba(100,116,139,0.2);padding:7px 12px;}
  .ldp-btn-ghost:hover{background:rgba(100,116,139,0.06);color:var(--ld-sub);}
  .ldp-cd-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;border:1px solid;margin-bottom:4px;flex-wrap:wrap;}
  .ldp-cd-label{font-weight:700;font-size:clamp(0.78rem,2vw,0.88rem);flex:1;}
  .ldp-cd-timer{font-family:'Courier New',monospace;font-size:clamp(0.88rem,2.5vw,1.05rem);font-weight:900;letter-spacing:1.5px;}
  .ldp-section{margin-top:18px;}
  .ldp-section-title{font-weight:800;font-size:clamp(0.68rem,1.8vw,0.78rem);letter-spacing:1.8px;text-transform:uppercase;color:var(--ld-muted);margin-bottom:12px;}
  .ldtl-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  @media(max-width:500px){.ldtl-wrap{grid-template-columns:1fr;gap:8px;}}
  .ldtl-step{display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:13px;background:rgba(248,250,252,0.8);border:1px solid rgba(30,58,138,0.07);transition:all 0.2s;}
  .ldtl-active{background:rgba(255,255,255,0.95)!important;box-shadow:4px 4px 12px rgba(15,23,42,0.06),-4px -4px 12px rgba(255,255,255,0.9);}
  .ldtl-dot-wrap{position:relative;flex-shrink:0;}
  .ldtl-dot{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border:2px solid rgba(30,58,138,0.1);box-shadow:3px 3px 8px rgba(15,23,42,0.06),-3px -3px 8px rgba(255,255,255,0.9);transition:all 0.3s;flex-shrink:0;}
  .ldtl-pulse-ring{position:absolute;inset:-5px;border-radius:50%;border:2px solid;opacity:0.5;animation:ldtlPulse 1.4s ease infinite;}
  @keyframes ldtlPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.18);opacity:0.15}}
  .ldtl-label{font-size:clamp(9px,1.5vw,11px);font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--ld-muted);margin-bottom:2px;}
  .ldtl-date{font-size:clamp(11px,2vw,13px);font-weight:800;color:var(--ld-text);}
  .ldtl-date-past{text-decoration:line-through;color:var(--ld-muted)!important;font-weight:600!important;}
  .ldtl-time{font-size:clamp(10px,1.5vw,12px);color:var(--ld-muted);font-weight:600;}
  .ldtl-tz{font-size:9px;letter-spacing:1px;font-weight:700;opacity:0.65;}
  .ldp-prizes{display:flex;gap:8px;flex-wrap:wrap;}
  .ldp-prize-card{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;flex:1;min-width:100px;background:#fff;border:1px solid rgba(30,58,138,0.09);box-shadow:3px 3px 10px rgba(15,23,42,0.05),-3px -3px 10px rgba(255,255,255,0.9);transition:transform 0.2s;}
  .ldp-prize-card:hover{transform:translateY(-2px);}
  .ldp-prize-rank{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ldp-prize-name{font-weight:700;font-size:clamp(0.78rem,2vw,0.88rem);color:var(--ld-sub);}
  .ldp-empty-note{color:var(--ld-muted);font-size:clamp(0.78rem,2vw,0.88rem);padding:8px 0;}
  .ldp-results{display:flex;flex-direction:column;gap:7px;}
  .ldp-result-row{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;background:#fff;border:1px solid rgba(30,58,138,0.07);box-shadow:3px 3px 7px rgba(15,23,42,0.04),-3px -3px 7px rgba(255,255,255,0.9);flex-wrap:wrap;transition:transform 0.2s;}
  .ldp-result-row:hover{transform:translateX(3px);}
  .ldp-result-mine{background:linear-gradient(135deg,rgba(245,158,11,0.07),rgba(251,191,36,0.04))!important;border-color:rgba(245,158,11,0.3)!important;box-shadow:0 0 18px rgba(245,158,11,0.1),3px 3px 7px rgba(15,23,42,0.04)!important;}
  .ldp-result-num{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ldp-result-winner{display:flex;align-items:center;gap:7px;flex:1;min-width:90px;}
  .ldp-result-avatar{font-size:14px;}
  .ldp-result-name{font-weight:700;font-size:clamp(0.78rem,2vw,0.88rem);color:var(--ld-text);}
  .ldp-you-tag{background:rgba(245,158,11,0.15);color:#b45309;padding:1px 7px;border-radius:100px;font-size:10px;font-weight:800;margin-left:5px;letter-spacing:0.5px;}
  .ldp-result-prize{font-size:clamp(0.75rem,1.8vw,0.85rem);font-weight:600;color:var(--ld-muted);flex:1;}
  .ldp-badge-green{padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;background:rgba(22,163,74,0.1);color:#15803d;}
  .ldp-badge-orange{padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;background:rgba(249,115,22,0.1);color:#c2410c;font-family:'Courier New',monospace;}
  .ldp-hist-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:13px;}
  .ldp-hist-list{display:flex;flex-direction:column;gap:8px;}
  .ldhc-card{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;background:#fff;border:1px solid rgba(30,58,138,0.07);box-shadow:3px 3px 10px rgba(15,23,42,0.05),-3px -3px 10px rgba(255,255,255,0.9);flex-wrap:wrap;opacity:0;transform:translateY(8px);animation:ldhcIn 0.4s calc(var(--hi)*0.05s) cubic-bezier(0.16,1,0.3,1) forwards;transition:transform 0.2s;}
  .ldhc-card:hover{transform:translateX(3px);}
  @keyframes ldhcIn{to{opacity:1;transform:none}}
  .ldhc-seq{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,rgba(30,58,138,0.1),rgba(59,130,246,0.16));color:#1e3a8a;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(30,58,138,0.1);}
  .ldhc-mid{flex:2;min-width:110px;}
  .ldhc-draw-name{font-size:clamp(0.78rem,2vw,0.88rem);font-weight:800;color:var(--ld-text);margin-bottom:3px;}
  .ldhc-winner{display:flex;align-items:center;gap:6px;}
  .ldhc-avatar{width:22px;height:22px;border-radius:50%;background:rgba(30,58,138,0.07);display:flex;align-items:center;justify-content:center;font-size:11px;border:1px solid rgba(30,58,138,0.08);}
  .ldhc-winner-name{font-size:clamp(0.75rem,1.8vw,0.85rem);font-weight:700;color:var(--ld-sub);}
  .ldhc-right{flex:1;text-align:right;}
  .ldhc-prize{font-size:clamp(0.78rem,2vw,0.88rem);font-weight:800;color:var(--ld-blue);margin-bottom:3px;}
  .ldhc-date-wrap{display:flex;justify-content:flex-end;align-items:center;gap:4px;flex-wrap:wrap;}
  .ldhc-date{font-size:11px;font-weight:600;color:var(--ld-muted);}
  .ldhc-time-badge{font-size:10px;font-weight:700;color:var(--ld-pale);background:rgba(30,58,138,0.06);padding:2px 6px;border-radius:100px;}
  .ldp-loading{display:flex;align-items:center;gap:10px;padding:36px;color:var(--ld-muted);font-weight:600;justify-content:center;font-size:0.88rem;}
  .ldp-spinner{width:20px;height:20px;border:3px solid rgba(59,130,246,0.2);border-top-color:var(--ld-blue);border-radius:50%;animation:ldpSpin2 0.7s linear infinite;}
  @keyframes ldpSpin2{to{transform:rotate(360deg)}}
  .ldp-msg{margin-top:12px;padding:12px 16px;border-radius:12px;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.18);color:#1e3a8a;font-weight:600;font-size:clamp(0.78rem,2vw,0.88rem);animation:ldpMsgIn 0.3s ease;}
  @keyframes ldpMsgIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
  @media(max-width:600px){.ldp-top{flex-direction:column;}.ldp-actions{flex-direction:row;flex-wrap:wrap;}.ldhc-card{flex-direction:column;align-items:flex-start;}.ldhc-right{text-align:left;}.ldhc-date-wrap{justify-content:flex-start;}.ldp-result-row{gap:7px;}}
  @media(max-width:380px){.ldp-meta-chips{gap:4px;}.ldp-chip{font-size:10px;padding:3px 8px;}.ldp-prizes{flex-direction:column;}}
`;