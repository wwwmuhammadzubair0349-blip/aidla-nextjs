// app/user/test-arena/page.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

const UAE_TZ = "Asia/Dubai";

function fmtUAE(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", { timeZone: UAE_TZ });
}
function fmtUAESplit(iso) {
  if (!iso) return { date: "-", time: "" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-GB", { timeZone: UAE_TZ, day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { timeZone: UAE_TZ, hour: "2-digit", minute: "2-digit" }),
  };
}
function msToHMS(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
function normalizeOptions(options) {
  if (Array.isArray(options)) return { A: options[0], B: options[1], C: options[2], D: options[3] };
  return options || {};
}

// ── Slug helper for share URL ─────────────────────────────────────────────────
function slugify(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Sound Engine ──────────────────────────────────────────────────────────────
function useCountdownSound() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    return ctxRef.current;
  };
  const playTick = useCallback((isFinal = false) => {
    const ctx = getCtx(); if (!ctx) return;
    try {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = isFinal ? 880 : 660; osc.type = "sine";
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.4 : 0.18));
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + (isFinal ? 0.4 : 0.18));
    } catch {}
  }, []);
  const playFail = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    try {
      [0, 0.18, 0.36].forEach(delay => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 300 - delay * 100; osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.15);
      });
    } catch {}
  }, []);
  const playSuccess = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return;
    try {
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.22);
        osc.start(ctx.currentTime + i * 0.12); osc.stop(ctx.currentTime + i * 0.12 + 0.22);
      });
    } catch {}
  }, []);
  return { playTick, playFail, playSuccess };
}

// ── Fireworks Canvas ──────────────────────────────────────────────────────────
function FireworksCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const particles = [];
    const colors = ["#3b82f6","#1e3a8a","#60a5fa","#fbbf24","#f59e0b","#fff","#93c5fd","#fde68a","#f472b6","#a78bfa"];
    function burst(x, y) {
      for (let i = 0; i < 80; i++) {
        const a = (Math.PI*2*i)/80 + (Math.random()-0.5)*0.4, spd = 2+Math.random()*8;
        particles.push({ x,y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, alpha:1, color:colors[Math.floor(Math.random()*colors.length)], size:1.5+Math.random()*4, gravity:0.1+Math.random()*0.1, trail:[] });
      }
    }
    let n = 0;
    const iv = setInterval(() => { burst(80+Math.random()*(canvas.width-160), 60+Math.random()*(canvas.height*0.55)); if(++n>22) clearInterval(iv); }, 300);
    function draw() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i];
        p.trail.push({x:p.x,y:p.y}); if(p.trail.length>7) p.trail.shift();
        for(let t=0;t<p.trail.length;t++){ctx.beginPath();ctx.arc(p.trail[t].x,p.trail[t].y,p.size*(t/p.trail.length)*0.5,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.alpha*(t/p.trail.length)*0.3;ctx.fill();}
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fillStyle=p.color;ctx.globalAlpha=p.alpha;ctx.fill();ctx.globalAlpha=1;
        p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.vx*=0.98;p.alpha-=0.013;
        if(p.alpha<=0) particles.splice(i,1);
      }
      rafRef.current=requestAnimationFrame(draw);
    }
    draw();
    return () => { clearInterval(iv); cancelAnimationFrame(rafRef.current); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:1000001,pointerEvents:"none",width:"100%",height:"100%"}}/>;
}

// ── Status Overlay ────────────────────────────────────────────────────────────
function StatusOverlay({ type, reason, testEndAt, testTitle, qualifiedCount, winners, myWinnerData, tick, onRewatch, onClose }) {
  const nowMs = Date.now();
  const endMs = testEndAt ? new Date(testEndAt).getTime() : 0;
  const timeToEnd = endMs ? Math.max(0, endMs - nowMs) : 0;
  const ended = endMs ? nowMs >= endMs : true;
  const hasWinners = winners && winners.length > 0;

  const AUTO_CLOSE_SEC = 10;
  const [autoCloseLeft, setAutoCloseLeft] = React.useState(type === "winner" ? AUTO_CLOSE_SEC : null);
  const autoCloseRef = React.useRef(null);

  React.useEffect(() => {
    if (type !== "winner") return;
    setAutoCloseLeft(AUTO_CLOSE_SEC);
    autoCloseRef.current = setInterval(() => {
      setAutoCloseLeft(prev => {
        if (prev <= 1) { clearInterval(autoCloseRef.current); onClose && onClose(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(autoCloseRef.current);
  }, [type]);

  const handleClose = () => { clearInterval(autoCloseRef.current); onClose && onClose(); };

  const reasonLabel =
    reason === "TIMEOUT"    ? "Time Ran Out"    :
    reason === "WRONG"      ? "Wrong Answer"    :
    reason === "left_page"  ? "Left the Test"   :
    reason === "manual_out" ? "Exited Manually" : "Eliminated";

  const configs = {
    eliminated: { icon: "💀", title: "ELIMINATED", titleColor: "#f87171", glowColor: "rgba(239,68,68,0.14)", borderColor: "rgba(239,68,68,0.25)", desc: `You were eliminated (${reasonLabel}). Better luck next time!` },
    not_registered: { icon: "🚫", title: "NOT REGISTERED", titleColor: "#fb923c", glowColor: "rgba(249,115,22,0.12)", borderColor: "rgba(249,115,22,0.25)", desc: "You did not register for this test in time." },
    qualified: { icon: "🎓", title: "QUALIFIED!", titleColor: "#4ade80", glowColor: "rgba(74,222,128,0.14)", borderColor: "rgba(74,222,128,0.3)", desc: hasWinners ? "You completed the test! Results have been announced." : "You completed the test successfully! Awaiting admin approval for final results." },
    winner: { icon: "🏆", title: "YOU WON!", titleColor: "#fbbf24", glowColor: "rgba(251,191,36,0.2)", borderColor: "rgba(251,191,36,0.45)", desc: `Congratulations! You are a winner of "${testTitle || "this test"}"!` },
  };
  const cfg = configs[type] || configs.eliminated;

  return createPortal(
    <div className={`taso-overlay taso-overlay--${type}`}>
      <style>{statusOverlayCSS}</style>
      {type === "winner" && <FireworksCanvas />}
      <div className="taso-bg" style={{ background: `radial-gradient(ellipse 65% 55% at 50% 42%, ${cfg.glowColor} 0%, transparent 70%)` }} />
      <div className="taso-card" style={{ borderColor: cfg.borderColor }}>
        <button className="taso-x-btn" onClick={handleClose} title="Close">×</button>
        {type === "winner" && autoCloseLeft !== null && autoCloseLeft > 0 && (
          <div className="taso-auto-close">
            <svg className="taso-ring-svg" viewBox="0 0 36 36">
              <circle className="taso-ring-bg" cx="18" cy="18" r="15.9" />
              <circle className="taso-ring-fill" cx="18" cy="18" r="15.9" strokeDasharray={`${(autoCloseLeft / AUTO_CLOSE_SEC) * 100} 100`} />
            </svg>
            <span className="taso-auto-close-num">{autoCloseLeft}</span>
          </div>
        )}
        <div className="taso-icon">{cfg.icon}</div>
        <div className="taso-title" style={{ color: cfg.titleColor }}>{cfg.title}</div>
        <div className="taso-desc">{cfg.desc}</div>
        {type === "winner" && myWinnerData && (
          <div className="taso-prize-box">
            <div className="taso-prize-label">YOUR PRIZE</div>
            <div className="taso-prize-val">{myWinnerData.prize_text || myWinnerData.prize || "Prize"}</div>
            {myWinnerData.rank_no && <div className="taso-prize-rank">Rank #{myWinnerData.rank_no}</div>}
          </div>
        )}
        {type === "qualified" && (
          <div className="taso-qual-box">
            <div className="taso-q-num">{qualifiedCount || "—"}</div>
            <div className="taso-q-label">Players Qualified</div>
          </div>
        )}
        {!ended && (type === "eliminated" || type === "not_registered" || type === "qualified") && (
          <div className="taso-cd-wrap">
            <div className="taso-cd-label">{type === "qualified" ? "Results announced in" : "Test ends in"}</div>
            <div className="taso-cd-timer">{msToHMS(timeToEnd)}</div>
            <div className="taso-cd-sub">Pending admin approval</div>
          </div>
        )}
        {ended && hasWinners && (
          <div className="taso-winners-reveal">
            <div className="taso-wr-title">🎖 Winners Announced</div>
            {winners.map((w, i) => (
              <div key={i} className="taso-wr-row">
                <span className="taso-wr-rank">{w.rank_no === 1 ? "🥇" : w.rank_no === 2 ? "🥈" : w.rank_no === 3 ? "🥉" : `#${w.rank_no}`}</span>
                <span className="taso-wr-name">{w.user_name}</span>
                {w.prize_text && <span className="taso-wr-prize">{w.prize_text}</span>}
              </div>
            ))}
          </div>
        )}
        {ended && !hasWinners && type !== "winner" && (
          <div className="taso-cd-wrap" style={{ background: "rgba(22,163,74,0.1)", borderColor: "rgba(22,163,74,0.25)" }}>
            <div className="taso-cd-label" style={{ color: "#4ade80" }}>Test Has Ended</div>
            {qualifiedCount > 0 && <div className="taso-q-num" style={{ color: "#4ade80" }}>{qualifiedCount}</div>}
            {qualifiedCount > 0 && <div className="taso-q-label">Qualified · Awaiting results</div>}
            {!qualifiedCount && <div className="taso-cd-sub">Awaiting admin approval of results</div>}
          </div>
        )}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
          {onClose && type !== "winner" && <button className="taso-back-btn" onClick={handleClose}>← Back to Lobby</button>}
          {onRewatch && <button className="taso-rewatch-btn" onClick={onRewatch}>🎬 Replay Test</button>}
        </div>
      </div>
    </div>,
    document.body
  );
}

const statusOverlayCSS = `
.taso-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;}
.taso-overlay--eliminated{background:linear-gradient(135deg,#1a0505 0%,#2d1010 50%,#1a0505 100%);}
.taso-overlay--not_registered{background:linear-gradient(135deg,#1a0e05 0%,#2d1e0a 50%,#1a0e05 100%);}
.taso-overlay--qualified{background:linear-gradient(135deg,#051a0a 0%,#0a2d15 50%,#051a0a 100%);}
.taso-overlay--winner{background:linear-gradient(135deg,#0f0d00 0%,#1a1500 50%,#0f0d00 100%);}
.taso-bg{position:absolute;inset:0;animation:tasoBreath 4s ease-in-out infinite alternate;}
@keyframes tasoBreath{0%{opacity:0.5}100%{opacity:1}}
.taso-card{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;padding:clamp(28px,5vw,48px) clamp(24px,4vw,44px);text-align:center;max-width:500px;width:100%;background:rgba(255,255,255,0.06);border:1px solid;border-radius:28px;backdrop-filter:blur(24px);box-shadow:0 0 100px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.08);animation:tasoIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;}
@keyframes tasoIn{from{opacity:0;transform:scale(0.88) translateY(20px)}to{opacity:1;transform:none}}
.taso-icon{font-size:clamp(60px,12vw,80px);margin-bottom:8px;margin-top:8px;animation:tasoIconIn 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;}
@keyframes tasoIconIn{from{transform:scale(0)rotate(-30deg);opacity:0}70%{transform:scale(1.2)rotate(5deg)}to{transform:none;opacity:1}}
.taso-overlay--winner .taso-icon{font-size:clamp(72px,14vw,96px);}
.taso-title{font-size:clamp(1.7rem,5.5vw,2.6rem);font-weight:900;letter-spacing:2px;margin-bottom:8px;text-shadow:0 0 60px currentColor;}
.taso-desc{font-size:clamp(0.8rem,2vw,0.92rem);color:rgba(148,163,184,0.9);margin-bottom:22px;line-height:1.6;max-width:360px;}
.taso-cd-wrap{padding:18px 26px;border-radius:16px;margin-bottom:20px;background:rgba(30,58,138,0.15);border:1px solid rgba(59,130,246,0.25);width:100%;}
.taso-cd-label{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#60a5fa;margin-bottom:7px;}
.taso-cd-timer{font-family:'Courier New',monospace;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:900;color:#93c5fd;letter-spacing:3px;}
.taso-cd-sub{font-size:10px;color:rgba(148,163,184,0.6);margin-top:5px;font-weight:600;}
.taso-qual-box{display:flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:18px;}
.taso-q-num{font-size:clamp(2.4rem,8vw,3.5rem);font-weight:900;color:#4ade80;line-height:1;text-shadow:0 0 50px rgba(74,222,128,0.5);}
.taso-q-label{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(74,222,128,0.7);}
.taso-prize-box{padding:20px 28px;border-radius:16px;margin-bottom:20px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.35);width:100%;}
.taso-prize-label{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#fbbf24;margin-bottom:8px;}
.taso-prize-val{font-size:clamp(1.4rem,5vw,2rem);font-weight:900;color:#fde68a;text-shadow:0 0 40px rgba(251,191,36,0.7);}
.taso-prize-rank{font-size:12px;font-weight:700;color:rgba(251,191,36,0.7);margin-top:6px;letter-spacing:1px;}
.taso-winners-reveal{width:100%;padding:16px 20px;border-radius:16px;background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.25);margin-bottom:20px;}
.taso-wr-title{font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#fbbf24;margin-bottom:12px;}
.taso-wr-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
.taso-wr-row:last-child{border-bottom:none;}
.taso-wr-rank{font-size:18px;flex-shrink:0;}
.taso-wr-name{font-weight:700;font-size:0.9rem;color:#e2e8f0;flex:1;}
.taso-wr-prize{font-size:0.78rem;font-weight:700;color:#93c5fd;background:rgba(59,130,246,0.12);padding:3px 10px;border-radius:100px;}
.taso-rewatch-btn{padding:12px 26px;border-radius:14px;border:1px solid rgba(59,130,246,0.3);background:rgba(59,130,246,0.12);color:#93c5fd;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px;min-height:44px;}
.taso-rewatch-btn:hover{background:rgba(59,130,246,0.25);color:#bfdbfe;transform:translateY(-2px);}
.taso-back-btn{padding:12px 26px;border-radius:14px;border:1px solid rgba(148,163,184,0.25);background:rgba(148,163,184,0.08);color:#94a3b8;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.2s;min-height:44px;}
.taso-back-btn:hover{background:rgba(148,163,184,0.18);color:#cbd5e1;transform:translateY(-2px);}
.taso-x-btn{position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;z-index:10;}
.taso-x-btn:hover{background:rgba(255,255,255,0.2);color:#fff;transform:scale(1.1);}
.taso-auto-close{position:absolute;top:12px;left:14px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;}
.taso-ring-svg{width:40px;height:40px;transform:rotate(-90deg);}
.taso-ring-bg{fill:none;stroke:rgba(255,255,255,0.1);stroke-width:3;}
.taso-ring-fill{fill:none;stroke:#fbbf24;stroke-width:3;stroke-linecap:round;transition:stroke-dasharray 1s linear;}
.taso-auto-close-num{position:absolute;font-size:12px;font-weight:900;color:#fbbf24;font-family:'Courier New',monospace;}
@media(prefers-reduced-motion:reduce){.taso-bg,.taso-icon,.taso-card{animation:none!important;}}
`;

// ── Fail Modal ────────────────────────────────────────────────────────────────
function FailModal({ failReason, canRevive, reviveUsed, reviveLimit, selectedTest, busyDecision, onRevive, onGiveUp }) {
  const isTimeout = failReason === "TIMEOUT";
  return createPortal(
    <div className="ta-modal-overlay">
      <style>{modalCSS}</style>
      <div className="ta-modal-box" onClick={e => e.stopPropagation()}>
        <div className="ta-modal-icon">{isTimeout ? "⏱" : "❌"}</div>
        <div className="ta-modal-title">{isTimeout ? "Time's Up!" : "Wrong Answer!"}</div>
        <div className="ta-modal-desc">
          {isTimeout ? "You ran out of time." : "That answer was incorrect."}
          {canRevive ? " Use a Revive to continue (0 score), or give up." : " No Revives left — you must give up."}
        </div>
        <div className="ta-modal-urgency">⚡ You're about to be eliminated — decide quickly!</div>
        <div className="ta-modal-actions">
          <button className={`ta-modal-btn-revive${!canRevive ? " ta-modal-btn-dim" : ""}`} onClick={onRevive} disabled={!canRevive||busyDecision}>
            {busyDecision ? "⏳ Processing…" : `⚡ Revive (${selectedTest?.revive_price||0} coins)`}
          </button>
          <button className="ta-modal-btn-danger" onClick={onGiveUp} disabled={busyDecision}>☠️ Give Up</button>
        </div>
        <div className="ta-modal-revive-info">Revives: <strong>{reviveUsed}</strong>/<strong>{reviveLimit}</strong> used</div>
      </div>
    </div>,
    document.body
  );
}
const modalCSS = `
.ta-modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,0.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:999998;padding:16px;}
.ta-modal-box{width:min(460px,92vw);background:#fff;border-radius:24px;padding:clamp(24px,5vw,40px);text-align:center;animation:taMdIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;border:1px solid rgba(239,68,68,0.15);box-shadow:0 30px 80px rgba(239,68,68,0.12),0 8px 32px rgba(2,6,23,0.18);}
@keyframes taMdIn{from{opacity:0;transform:scale(0.82) translateY(24px)}to{opacity:1;transform:none}}
.ta-modal-icon{font-size:60px;margin-bottom:12px;animation:taMdIconIn 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;}
@keyframes taMdIconIn{from{transform:scale(0);opacity:0}60%{transform:scale(1.2)}to{transform:none;opacity:1}}
.ta-modal-title{font-size:1.6rem;font-weight:900;color:#0f172a;margin-bottom:8px;}
.ta-modal-desc{font-size:0.9rem;color:#475569;line-height:1.65;margin-bottom:20px;}
.ta-modal-urgency{display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;border-radius:10px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.18);margin-bottom:22px;font-size:0.8rem;font-weight:700;color:#dc2626;}
.ta-modal-actions{display:flex;flex-direction:column;gap:10px;}
.ta-modal-btn-revive{padding:16px 24px;border-radius:16px;border:none;font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.18s;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;box-shadow:0 4px 0 #1e40af,0 8px 24px rgba(30,58,138,0.3);min-height:56px;width:100%;}
.ta-modal-btn-revive:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 6px 0 #1e40af,0 12px 32px rgba(30,58,138,0.4);}
.ta-modal-btn-danger{padding:11px 20px;border-radius:12px;border:1.5px solid rgba(239,68,68,0.22);background:rgba(239,68,68,0.05);color:#dc2626;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.18s;min-height:44px;width:100%;}
.ta-modal-btn-danger:hover:not(:disabled){background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.38);}
.ta-modal-btn-dim{background:#f1f5f9!important;color:#94a3b8!important;cursor:not-allowed!important;box-shadow:none!important;border:1.5px solid #e2e8f0!important;}
.ta-modal-revive-info{margin-top:14px;font-size:12px;color:#94a3b8;}
@media(prefers-reduced-motion:reduce){.ta-modal-box,.ta-modal-icon{animation:none!important;}}
`;

// ── Test Ended Banner ─────────────────────────────────────────────────────────
function TestEndedBanner({ qualifiedCount, winnersAnnounced }) {
  return (
    <div className="ta-ended-banner">
      <div className="ta-ended-icon">🏁</div>
      <div className="ta-ended-content">
        <div className="ta-ended-title">Test Period Ended</div>
        <div className="ta-ended-sub">
          {winnersAnnounced ? "🎉 Winners have been announced!" : "Awaiting admin approval · Results coming soon"}
        </div>
      </div>
      {qualifiedCount > 0 && (
        <div className="ta-ended-count">
          <span className="ta-ended-num">{qualifiedCount}</span>
          <span className="ta-ended-num-label">Qualified</span>
        </div>
      )}
    </div>
  );
}

// ── Prizes Section Component ──────────────────────────────────────────────────
function PrizesSection({ prizes }) {
  if (!prizes || prizes.length === 0) return null;

  const rankMedal = (r) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
  const rankColor = (r) => r === 1 ? { bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)", text: "#b45309" }
                         : r === 2 ? { bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.30)", text: "#475569" }
                         : r === 3 ? { bg: "rgba(180,83,9,0.08)",   border: "rgba(180,83,9,0.22)",   text: "#92400e" }
                         :           { bg: "rgba(30,58,138,0.05)",   border: "rgba(30,58,138,0.12)",  text: "#1e3a8a" };

  return (
    <div className="ta-section">
      <div className="ta-section-title">🎁 Prizes</div>
      <div className="ta-prizes-grid">
        {prizes.map((p) => {
          const c = rankColor(p.rank_no);
          return (
            <div
              key={p.rank_no}
              className="ta-prize-card"
              style={{ background: c.bg, borderColor: c.border }}
            >
              <div className="ta-prize-medal">{rankMedal(p.rank_no)}</div>
              <div className="ta-prize-body">
                <div className="ta-prize-rank" style={{ color: c.text }}>Rank {p.rank_no}</div>
                <div className="ta-prize-text">
                  {p.prize_text || (p.prize_type === "coins" ? `${Number(p.coins_amount).toLocaleString()} coins` : "Prize")}
                </div>
                {p.prize_type === "coins" && p.coins_amount > 0 && p.prize_text && (
                  <div className="ta-prize-coins">💰 {Number(p.coins_amount).toLocaleString()} coins</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Error Boundary ────────────────────────────────────────────────────────────
class TestErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, info) { console.error("[TestArena]", e, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="ta-error-state">
        <style>{mainCSS}</style>
        <div className="ta-error-icon">⚠️</div>
        <div className="ta-error-title">Something went wrong</div>
        <div className="ta-error-desc">{String(this.state.error?.message || "An unexpected error occurred")}</div>
        <button className="ta-error-btn" onClick={() => this.setState({ hasError: false, error: null })}>
          Try Again
        </button>
      </div>
    );
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
function TestArenaInner() {
  const [loading, setLoading]           = useState(true);
  const [msg, setMsg]                   = useState("");
  const [tests, setTests]               = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [registered, setRegistered]     = useState(false);
  const [tick, setTick]                 = useState(0);
  const [userId, setUserId]             = useState(null);

  // ── NEW: prizes state ──
  const [prizes, setPrizes]             = useState([]);
  const [shareCopied, setShareCopied]   = useState(false);

  // session
  const [sessionId, setSessionId]       = useState(null);
  const [seqNo, setSeqNo]               = useState(1);
  const [question, setQuestion]         = useState(null);
  const [selected, setSelected]         = useState("");

  // flow
  const [inTest, setInTest]             = useState(false);
  const [runPhase, setRunPhase]         = useState("IDLE");
  const [timeLeft, setTimeLeft]         = useState(0);
  const startedAtRef                    = useRef(Date.now());
  const timerIdRef                      = useRef(null);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason]     = useState(null);
  const [busyDecision, setBusyDecision] = useState(false);

  // powerups
  const [reviveUsed, setReviveUsed]     = useState(0);
  const [skipUsed, setSkipUsed]         = useState(0);
  const [addTimeUsed, setAddTimeUsed]   = useState(0);

  // leaderboard + winners
  const [leaderboard, setLeaderboard]   = useState([]);
  const [winners, setWinners]           = useState([]);
  const [qualifiedCount, setQualifiedCount] = useState(0);

  // status overlay
  const [statusOverlay, setStatusOverlay] = useState(null);
  const [outReason, setOutReason]         = useState(null);
  const [myWinnerData, setMyWinnerData]   = useState(null);

  const selectedTestIdRef = useRef(null);
  const shownWinRef       = useRef(false);
  const uidRef            = useRef(null);
  const sessionIdRef      = useRef(null); // kept in sync for sendBeacon
  const submittingRef     = useRef(false); // submit-once guard
  const realtimeRef       = useRef(null); // Supabase Realtime channel

  const { playTick, playFail, playSuccess } = useCountdownSound();
  const lastTickRef = useRef(null);

  const nowMs = Date.now();

  // Keep sessionIdRef in sync for sendBeacon (can't close over state in beforeunload)
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Session heartbeat: refresh token every 4 minutes during active test
  // Prevents TOKEN_REFRESH_FAILED mid-test on long sessions
  useEffect(() => {
    if (!inTest) return;
    const iv = setInterval(() => { supabase.auth.refreshSession().catch(() => {}); }, 4 * 60 * 1000);
    return () => clearInterval(iv);
  }, [inTest]);

  // Realtime helpers
  const stopRealtime = useCallback(() => {
    if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current = null; }
  }, []);

  const startRealtime = useCallback((testId, uid) => {
    stopRealtime();
    realtimeRef.current = supabase
      .channel(`test-live-${testId}`)
      .on("postgres_changes", { event: "*",      schema: "public", table: "test_leaderboard", filter: `test_id=eq.${testId}` },
          () => loadLeaderboard(testId, uid))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "test_winners",     filter: `test_id=eq.${testId}` },
          () => loadWinners(testId, uid, true))
      .subscribe();
  }, [stopRealtime]);

  // ── Tick ──
  useEffect(() => {
    const iv = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Phase — registration closes at test_start_at (not registration_close_at) ──
  const phase = useMemo(() => {
    if (!selectedTest) return "NONE";
    const t  = selectedTest;
    const ro  = t.registration_open_at ? new Date(t.registration_open_at).getTime() : 0;
    const ts  = t.test_start_at        ? new Date(t.test_start_at).getTime()        : 0;
    const end = t.test_end_at          ? new Date(t.test_end_at).getTime()           : 0;
    if (ro && nowMs < ro)               return "BEFORE_REG";
    if (ts && nowMs >= ro && nowMs < ts) return "REG_OPEN";
    if (end && ts && nowMs >= ts && nowMs < end) return "TEST_LIVE";
    if (end && nowMs >= end)            return "ENDED";
    return "UNKNOWN";
  }, [selectedTest, tick]);

  const countdownMs = useMemo(() => {
    if (!selectedTest) return 0;
    const t  = selectedTest;
    const ro  = t.registration_open_at ? new Date(t.registration_open_at).getTime() : 0;
    const ts  = t.test_start_at        ? new Date(t.test_start_at).getTime()        : 0;
    const end = t.test_end_at          ? new Date(t.test_end_at).getTime()           : 0;
    if (phase === "BEFORE_REG") return ro  - nowMs;
    if (phase === "REG_OPEN")   return ts  - nowMs; // counts to test start
    if (phase === "TEST_LIVE")  return end - nowMs;
    return 0;
  }, [selectedTest, phase, tick]);

  // ── Load ──
  const loadTests = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { setMsg("Please login first."); setLoading(false); return; }
    const uid = auth.user.id;
    setUserId(uid);
    uidRef.current = uid;
    const { data, error } = await supabase.from("test_tests").select("*").is("deleted_at", null).order("updated_at", { ascending: false });
    if (error) { setMsg("Load failed: " + error.message); setLoading(false); return; }
    setTests(data || []);
    setLoading(false);
  };

  const loadRegistration = async (testId, uid) => {
    const reg = await supabase.from("test_registrations").select("id").eq("test_id", testId).eq("user_id", uid).maybeSingle();
    setRegistered(!!reg.data);
    return !!reg.data;
  };

  const loadLeaderboard = async (testId, uid) => {
    const lb = await supabase.from("test_leaderboard").select("user_name,score,correct_count,total_time_ms,status,user_id").eq("test_id", testId).order("score", { ascending: false }).order("total_time_ms", { ascending: true }).limit(50);
    setLeaderboard(lb.data || []);
    const qc = (lb.data || []).filter(r => ["passed","qualified","finished"].includes(r.status)).length;
    setQualifiedCount(qc);
    if (uid) {
      const myRow = (lb.data || []).find(r => r.user_id === uid);
      if (myRow && ["passed","qualified","finished"].includes(myRow.status)) return "qualified";
    }
    return null;
  };

  // ── NEW: load prizes from test_prizes table ──
  const loadPrizes = async (testId) => {
    if (!testId) return;
    const { data, error } = await supabase
      .from("test_prizes")
      .select("rank_no,prize_type,prize_text,coins_amount,prize")
      .eq("test_id", testId)
      .eq("enabled", true)
      .order("rank_no", { ascending: true });
    if (error) {
      console.error("loadPrizes error:", error.message);
      return;
    }
    setPrizes(data || []);
  };

  const loadWinners = async (testId, uid, autoShowCelebration = false) => {
    if (!testId) return null;
    const { data, error } = await supabase
      .from("test_winners")
      .select("rank_no,user_name,user_id,prize_text,prize,coins_amount")
      .eq("test_id", testId)
      .order("rank_no", { ascending: true });
    if (error) { console.error("loadWinners error:", error.message); setMsg("Winners load error: " + error.message); return null; }
    setWinners(data || []);
    if (uid && data?.length > 0) {
      const myWin = data.find(r => r.user_id === uid);
      if (myWin) {
        setMyWinnerData(myWin);
        if (autoShowCelebration && !shownWinRef.current) { shownWinRef.current = true; setStatusOverlay("winner"); }
        return myWin;
      }
    }
    return null;
  };

  // ── Initial load ──
  useEffect(() => { loadTests(); }, []);

  // ── Realtime cleanup on unmount ──
  useEffect(() => () => stopRealtime(), [stopRealtime]);

  // ── 30-second fallback poll (Realtime handles most updates) ──
  useEffect(() => {
    const iv = setInterval(() => {
      const tid = selectedTestIdRef.current;
      const uid = uidRef.current;
      if (tid && uid) { loadLeaderboard(tid, uid); loadWinners(tid, uid, true); }
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    selectedTestIdRef.current = selectedTest?.id || null;
  }, [selectedTest]);

  // ── 5-sec countdown sound ──
  useEffect(() => {
    if (!inTest || runPhase !== "PLAYING") return;
    if (timeLeft <= 5 && timeLeft > 0) {
      if (lastTickRef.current !== timeLeft) { lastTickRef.current = timeLeft; playTick(timeLeft === 1); }
    }
  }, [timeLeft, inTest, runPhase]);

  // ── OUT on page leave — sendBeacon is reliable in beforeunload (unlike async fetch) ──
  useEffect(() => {
    const beforeUnload = () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      const body = JSON.stringify({ session_id: sid, reason: "left_page" });
      // sendBeacon survives page unload; fallback to keepalive fetch if unavailable
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/test/mark-out", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/test/mark-out", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  // ── Block copy/paste in test ──
  useEffect(() => {
    if (!inTest) return;
    const block = e => e.preventDefault();
    document.addEventListener("copy", block); document.addEventListener("paste", block); document.addEventListener("cut", block);
    return () => { document.removeEventListener("copy", block); document.removeEventListener("paste", block); document.removeEventListener("cut", block); };
  }, [inTest]);

  const stopTimer = () => { if (timerIdRef.current) clearInterval(timerIdRef.current); timerIdRef.current = null; };

  const resetRunState = () => {
    stopTimer(); setSessionId(null); setSeqNo(1); setQuestion(null); setSelected("");
    setInTest(false); setRunPhase("IDLE"); setTimeLeft(0); setShowFailModal(false);
    setFailReason(null); setBusyDecision(false); setReviveUsed(0); setSkipUsed(0); setAddTimeUsed(0);
  };

  const selectTest = async (t) => {
    setSelectedTest(t);
    selectedTestIdRef.current = t.id;
    setMsg(""); setRegistered(false); setStatusOverlay(null); setMyWinnerData(null); setWinners([]);
    setPrizes([]);
    resetRunState();
    const uid = uidRef.current;
    if (!uid) return;

    // Registration closes at test_start_at (not registration_close_at)
    const ro  = t.registration_open_at ? new Date(t.registration_open_at).getTime() : 0;
    const ts  = t.test_start_at        ? new Date(t.test_start_at).getTime()        : 0;
    const end = t.test_end_at          ? new Date(t.test_end_at).getTime()           : 0;
    const now = Date.now();
    const tPhase = !ro ? "UNKNOWN" : now < ro ? "BEFORE_REG" : ts && now < ts ? "REG_OPEN" : end && now < end ? "TEST_LIVE" : "ENDED";

    const isReg    = await loadRegistration(t.id, uid);
    const lbStatus = await loadLeaderboard(t.id, uid);
    const myWin    = await loadWinners(t.id, uid, false);
    await loadPrizes(t.id);

    // Start Realtime subscription for live updates
    startRealtime(t.id, uid);

    if (myWin) { shownWinRef.current = true; setStatusOverlay("winner"); }
    else if (lbStatus === "qualified" && (tPhase === "ENDED" || tPhase === "TEST_LIVE")) { setStatusOverlay("qualified"); }
    else if ((tPhase === "ENDED" || tPhase === "TEST_LIVE") && !isReg) { setStatusOverlay("not_registered"); }
  };

  // ── Share button handler ──
  const handleShare = () => {
    if (!selectedTest) return;
    const slug = slugify(selectedTest.title);
    const url = `${window.location.origin}/user/test?t=${slug}&id=${selectedTest.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch(() => {
      // fallback: select text
      const ta = document.createElement("textarea");
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  };

  // ── Register ──
  const onRegister = async () => {
    setMsg("");
    const { data, error } = await supabase.rpc("test_register", { p_test_id: selectedTest.id });
    if (error) return setMsg("Register failed: " + error.message);
    if (!data?.ok) return setMsg(data?.error || "Register failed");
    setRegistered(true); setMsg("Registered ✅");
  };

  // ── Question ──
  const fetchQuestion = async (sid, seq) => {
    const { data, error } = await supabase.rpc("test_get_question", { p_session_id: sid, p_seq_no: seq });
    if (error) throw new Error(error.message);
    if (!data?.ok) throw new Error(data?.error || "Question load failed");
    return { question_id: data.question_id, question_text: data.question_text, options: normalizeOptions(data.options), time_limit_sec: Number(data.time_limit_sec || 10) };
  };

  const loadQuestionAndStart = async (sid, seq) => {
    const q = await fetchQuestion(sid, seq);
    setQuestion(q); setSelected(""); setTimeLeft(q.time_limit_sec);
    startedAtRef.current = Date.now(); setRunPhase("PLAYING");
    lastTickRef.current = null;
  };

  // ── Timer ──
  useEffect(() => {
    stopTimer();
    if (!inTest || runPhase !== "PLAYING" || !question) return;
    timerIdRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => stopTimer();
  }, [inTest, runPhase, question?.question_id]);

  useEffect(() => {
    if (!inTest || runPhase !== "PLAYING" || !question || timeLeft > 0) return;
    stopTimer(); playFail(); setFailReason("TIMEOUT"); setRunPhase("WAITING_DECISION"); setShowFailModal(true);
  }, [timeLeft, inTest, runPhase, question]);

  // ── Start test ──
  const onStartTest = async () => {
    setMsg(""); setStatusOverlay(null);
    const { data, error } = await supabase.rpc("test_start", { p_test_id: selectedTest.id });
    if (error) return setMsg("Start failed: " + error.message);
    if (!data?.ok) return setMsg(data?.error || "Start failed");
    const sid = data.session_id;
    setSessionId(sid); setInTest(true); setSeqNo(1);
    setReviveUsed(0); setSkipUsed(0); setAddTimeUsed(0);
    try { await loadQuestionAndStart(sid, 1); } catch (e) { setMsg(String(e.message || e)); }
  };

  // ── End / Out ──
  const endTest = async () => {
    stopTimer();
    if (sessionId) await supabase.rpc("test_finish", { p_session_id: sessionId });
    setInTest(false); setQuestion(null); setRunPhase("IDLE"); setShowFailModal(false); setFailReason(null);
    const uid = uidRef.current;
    const tid = selectedTestIdRef.current;
    const myWin = await loadWinners(tid, uid, false);
    await loadLeaderboard(tid, uid);
    if (myWin) { shownWinRef.current = true; setStatusOverlay("winner"); }
    else { setStatusOverlay("qualified"); }
  };

  const outMe = async (reason) => {
    stopTimer();
    if (sessionId) await supabase.rpc("test_mark_out", { p_session_id: sessionId, p_reason: reason || "out" });
    setInTest(false); setQuestion(null); setRunPhase("OUT");
    setShowFailModal(false); setFailReason(null);
    setOutReason(reason);
    setTimeout(() => setStatusOverlay("eliminated"), 200);
  };

  // ── Next question ──
  const nextQuestionOrFinish = async () => {
    const next = seqNo + 1; setSeqNo(next);
    try { await loadQuestionAndStart(sessionId, next); } catch { await endTest(); }
  };

  // ── Submit — submit-once guard prevents double-submission on fast clicks ──
  const onSubmitAuto = async (chosen) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setMsg("");
    if (!sessionId || !question || runPhase !== "PLAYING") { submittingRef.current = false; return; }
    stopTimer();
    const tt = Date.now() - startedAtRef.current;
    const { data, error } = await supabase.rpc("test_submit_answer", { p_session_id: sessionId, p_question_id: question.question_id, p_selected: chosen, p_time_taken_ms: Number(tt), p_used_powerup: "none" });
    submittingRef.current = false;
    if (error) { setMsg("Submit failed: " + error.message); setRunPhase("PLAYING"); return; }
    if (!data?.ok) { setMsg(data?.error || "Submit failed"); setRunPhase("PLAYING"); return; }
    if (data?.is_correct === false) { playFail(); setFailReason("WRONG"); setRunPhase("WAITING_DECISION"); setShowFailModal(true); return; }
    playSuccess();
    await nextQuestionOrFinish();
  };

  // ── Powerups ──
  const reviveLimit  = Number(selectedTest?.revive_limit   || 0);
  const skipLimit    = Number(selectedTest?.skip_limit     || 0);
  const addTimeLimit = Number(selectedTest?.add_time_limit || 0);
  const canRevive  = !!selectedTest?.revive_enabled   && reviveLimit > 0  && reviveUsed < reviveLimit  && !!sessionId && !!question;
  const canSkip    = !!selectedTest?.skip_enabled     && skipLimit > 0    && skipUsed < skipLimit      && !!sessionId && !!question && runPhase === "PLAYING" && timeLeft > 0;
  const canAddTime = !!selectedTest?.add_time_enabled && addTimeLimit > 0 && addTimeUsed < addTimeLimit && !!sessionId && !!question && runPhase === "PLAYING" && timeLeft > 0;

  const useAddTime = async () => {
    if (!canAddTime) return;
    const { data, error } = await supabase.rpc("test_use_powerup", { p_session_id: sessionId, p_question_id: question.question_id, p_type: "add_time" });
    if (error) return setMsg("Add time failed: " + error.message);
    if (!data?.ok) return setMsg(data?.error || "Add time failed");
    setAddTimeUsed(x => x + 1);
    const add = Number(data.add_time_seconds || selectedTest.add_time_seconds || 5);
    setTimeLeft(t => t + add); setMsg(`+${add}s added ✅`);
  };

  const useSkip = async () => {
    if (!canSkip) return;
    stopTimer();
    const { data: pData, error: pErr } = await supabase.rpc("test_use_powerup", { p_session_id: sessionId, p_question_id: question.question_id, p_type: "skip" });
    if (pErr) { setMsg("Skip failed: " + pErr.message); setRunPhase("PLAYING"); return; }
    if (!pData?.ok) { setMsg(pData?.error || "Skip failed"); setRunPhase("PLAYING"); return; }
    setSkipUsed(x => x + 1);
    await supabase.rpc("test_submit_answer", { p_session_id: sessionId, p_question_id: question.question_id, p_selected: "", p_time_taken_ms: 0, p_used_powerup: "skip" });
    await nextQuestionOrFinish();
  };

  const reviveAndNext = async () => {
    if (busyDecision) return;
    setBusyDecision(true);
    if (!canRevive) { setBusyDecision(false); await outMe(failReason === "TIMEOUT" ? "timeout_no_revive" : "wrong_no_revive"); return; }
    const tt = Date.now() - startedAtRef.current;
    const { data: pData, error: pErr } = await supabase.rpc("test_use_powerup", { p_session_id: sessionId, p_question_id: question.question_id, p_type: "revive" });
    if (pErr) { setBusyDecision(false); setMsg("Revive failed: " + pErr.message); return; }
    if (!pData?.ok) { setBusyDecision(false); setMsg(pData?.error || "Revive failed"); return; }
    setReviveUsed(x => x + 1);
    await supabase.rpc("test_submit_answer", { p_session_id: sessionId, p_question_id: question.question_id, p_selected: "", p_time_taken_ms: Number(tt), p_used_powerup: "revive" });
    setShowFailModal(false); setFailReason(null); setBusyDecision(false);
    await nextQuestionOrFinish();
  };

  const giveUp = async () => { setShowFailModal(false); setFailReason(null); await outMe(failReason === "TIMEOUT" ? "timeout_giveup" : "wrong_giveup"); };

  const timerColor = timeLeft <= 3 ? "#ef4444" : timeLeft <= 5 ? "#f97316" : timeLeft <= 10 ? "#f59e0b" : "#3b82f6";
  const timerPct = question ? (timeLeft / question.time_limit_sec) * 100 : 100;
  const winnersAnnounced = winners.length > 0;

  return (
    <div className={`ta-arena-root${inTest ? " ta-arena-in-test" : ""}`} style={{ padding: "clamp(8px,3vw,12px)", maxWidth: 1100, margin: "0 auto", minHeight: "100vh" }}>
      <style>{mainCSS}</style>
      {/* prefers-reduced-motion: FireworksCanvas respects user preference */}
      <style>{`@media (prefers-reduced-motion: reduce) { canvas { display: none !important; } }`}</style>

      {statusOverlay && selectedTest && (
        <StatusOverlay
          type={statusOverlay}
          reason={outReason}
          testEndAt={selectedTest.test_end_at}
          testTitle={selectedTest.title}
          qualifiedCount={qualifiedCount}
          winners={winners}
          myWinnerData={myWinnerData}
          tick={tick}
          onRewatch={(statusOverlay === "winner" || statusOverlay === "qualified") ? () => { setStatusOverlay(null); } : null}
          onClose={() => { setStatusOverlay(null); }}
        />
      )}

      {showFailModal && (
        <FailModal failReason={failReason} canRevive={canRevive} reviveUsed={reviveUsed} reviveLimit={reviveLimit}
          selectedTest={selectedTest} busyDecision={busyDecision} onRevive={reviveAndNext} onGiveUp={giveUp} />
      )}

      {/* Header */}
      <div className="ta-header">
        <div className="ta-header-icon">⚡</div>
        <div>
          <h1 className="ta-title">Test Arena</h1>
          <div className="ta-sub">Live Competitive Quiz · UAE</div>
        </div>
      </div>

      {msg && <div className="ta-msg">{msg}<button className="ta-msg-close" onClick={() => setMsg("")}>×</button></div>}

      {loading ? (
        <div className="ta-loading">
          <div className="ta-skel-header" />
          <div className="ta-skel-card">
            <div className="ta-skel-line ta-skel-line--medium" />
            <div className="ta-skel-line ta-skel-line--full" />
            <div className="ta-skel-line ta-skel-line--short" />
          </div>
          <div className="ta-skel-card">
            <div className="ta-skel-line ta-skel-line--full" />
            <div className="ta-skel-line ta-skel-line--medium" />
            <div className="ta-skel-line ta-skel-line--short" />
          </div>
        </div>
      ) : (
        <div className="ta-grid">
          {/* LEFT */}
          <div className="ta-card ta-tests-list">
            <div className="ta-card-title">All Tests</div>
            {tests.length === 0 ? <div className="ta-empty">No tests available.</div> : (
              <div className="ta-tests-scroll">
                {tests.map(t => {
                  const ro  = t.registration_open_at ? new Date(t.registration_open_at).getTime() : 0;
                  const ts  = t.test_start_at        ? new Date(t.test_start_at).getTime()        : 0;
                  const end = t.test_end_at          ? new Date(t.test_end_at).getTime()           : 0;
                  const tPhase = !ro ? "unknown" : nowMs < ro ? "soon" : ts && nowMs < ts ? "reg" : end && nowMs < end ? "live" : "ended";
                  return (
                    <button key={t.id} onClick={() => selectTest(t)} className={`ta-test-item ${selectedTest?.id === t.id ? "ta-test-item-active" : ""}`}>
                      <div className="ta-test-item-top">
                        <span className="ta-test-item-name">{t.title}</span>
                        <span className={`ta-test-pill ta-test-pill-${tPhase}`}>
                          {tPhase === "live" ? "🟢 Live" : tPhase === "reg" ? "📝 Reg" : tPhase === "soon" ? "⏳ Soon" : tPhase === "ended" ? "🏁 Ended" : "—"}
                        </span>
                      </div>
                      <div className="ta-test-item-meta">
                        {t.entry_type === "paid" ? `💰 ${t.entry_cost} coins` : "🆓 Free"} · {t.questions_per_user} Qs · {t.time_per_question_sec}s/Q
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!selectedTest ? (
              <div className="ta-card ta-select-prompt">
                <div style={{ fontSize: 44, marginBottom: 10 }}>⚡</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#334155" }}>Select a test to begin</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>Choose from the list on the left</div>
              </div>
            ) : (
              <>
                {/* ── Test Info Card ── */}
                <div className="ta-card">
                  <div className="ta-detail-top">
                    <div className="ta-detail-left">
                      <div className="ta-detail-title-row">
                        <span className="ta-detail-name">{selectedTest.title}</span>
                        <span className={`ta-test-pill ta-test-pill-${phase === "TEST_LIVE" ? "live" : phase === "REG_OPEN" ? "reg" : phase === "BEFORE_REG" ? "soon" : "ended"}`}>
                          {phase === "TEST_LIVE" ? "🟢 Live" : phase === "REG_OPEN" ? "📝 Reg Open" : phase === "BEFORE_REG" ? "⏳ Soon" : "🏁 Ended"}
                        </span>
                      </div>
                      <div className="ta-detail-chips">
                        <span className="ta-chip">{selectedTest.entry_type === "paid" ? `💰 ${selectedTest.entry_cost} coins` : "🆓 Free"}</span>
                        <span className="ta-chip">❓ {selectedTest.questions_per_user} Questions</span>
                        <span className="ta-chip">⏱ {selectedTest.time_per_question_sec}s / Q</span>
                        {registered && <span className="ta-chip ta-chip-green">✅ Registered</span>}
                        {myWinnerData && <span className="ta-chip ta-chip-gold" onClick={() => setStatusOverlay("winner")} style={{cursor:"pointer"}}>🏆 I Won!</span>}
                      </div>
                    </div>
                    <div className="ta-detail-actions">
                      {/* ── Share Button ── */}
                      <button className={`ta-btn ta-btn-share ${shareCopied ? "ta-btn-share-copied" : ""}`} onClick={handleShare}>
                        {shareCopied ? "✅ Copied!" : "🔗 Share"}
                      </button>
                      <button
                        onClick={onRegister}
                        disabled={registered || phase !== "REG_OPEN"}
                        title={registered ? "Already registered" : phase === "BEFORE_REG" ? "Registration not open yet" : phase !== "REG_OPEN" ? "Registration is closed" : "Register for this test"}
                        className={`ta-btn ${registered || phase !== "REG_OPEN" ? "ta-btn-dim" : "ta-btn-primary"}`}>
                        {registered ? "✅ Registered" : "Register"}
                      </button>
                      <button
                        onClick={onStartTest}
                        disabled={!registered || phase !== "TEST_LIVE" || !!sessionId}
                        title={!registered ? "Register first to start" : phase !== "TEST_LIVE" ? "Test is not live yet" : sessionId ? "Already in test" : "Start the test now"}
                        className={`ta-btn ${!registered || phase !== "TEST_LIVE" || !!sessionId ? "ta-btn-dim" : "ta-btn-gold"}`}>
                        {sessionId ? "⚡ In Test" : "▶ Start Test"}
                      </button>
                    </div>
                  </div>

                  {phase !== "ENDED" && phase !== "NONE" && (
                    <div className={`ta-cd-bar ta-cd-${phase}`}>
                      <span className="ta-cd-icon">{phase === "BEFORE_REG" ? "⏳" : phase === "REG_OPEN" ? "📝" : "⚡"}</span>
                      <span className="ta-cd-label">{phase === "BEFORE_REG" ? "Registration opens in" : phase === "REG_OPEN" ? "Registration closes in" : "Test ends in"}</span>
                      <span className="ta-cd-timer">{msToHMS(countdownMs)}</span>
                    </div>
                  )}
                  {phase === "ENDED" && <TestEndedBanner qualifiedCount={qualifiedCount} winnersAnnounced={winnersAnnounced} />}

                  {/* Schedule */}
                  <div className="ta-section">
                    <div className="ta-section-title">📅 Schedule</div>
                    <div className="ta-timeline">
                      {[
                        { label: "Reg Opens",  iso: selectedTest.registration_open_at, icon: "🟢" },
                        { label: "Test Starts", iso: selectedTest.test_start_at,       icon: "🚀" },
                        { label: "Test Ends",  iso: selectedTest.test_end_at,          icon: "🏁" },
                      ].map((s, i) => {
                        const ms = s.iso ? new Date(s.iso).getTime() : 0;
                        const past = ms && nowMs > ms;
                        const { date, time } = fmtUAESplit(s.iso);
                        return (
                          <div key={i} className={`ta-tl-step ${past ? "ta-tl-past" : ""}`}>
                            <div className={`ta-tl-dot ${past ? "ta-tl-dot-done" : ""}`}>{past ? "✓" : s.icon}</div>
                            <div className="ta-tl-info">
                              <div className="ta-tl-label">{s.label}</div>
                              <div className={`ta-tl-date ${past ? "ta-tl-past-text" : ""}`}>{date}</div>
                              <div className="ta-tl-time">{time} <span className="ta-tl-tz">UAE</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Prizes Section ── always shown when prizes exist ── */}
                  <PrizesSection prizes={prizes} />

                  {/* Powerups */}
                  {(selectedTest.revive_enabled || selectedTest.skip_enabled || selectedTest.add_time_enabled) && (
                    <div className="ta-section">
                      <div className="ta-section-title">⚡ Power-Ups</div>
                      <div className="ta-powerups-info">
                        {selectedTest.revive_enabled  && <div className="ta-pu-chip"><span className="ta-pu-icon">💊</span><div><div className="ta-pu-name">Revive</div><div className="ta-pu-meta">{selectedTest.revive_price} coins · {selectedTest.revive_limit}x max</div></div></div>}
                        {selectedTest.skip_enabled    && <div className="ta-pu-chip"><span className="ta-pu-icon">⏭</span><div><div className="ta-pu-name">Skip</div><div className="ta-pu-meta">{selectedTest.skip_price} coins · {selectedTest.skip_limit}x max</div></div></div>}
                        {selectedTest.add_time_enabled && <div className="ta-pu-chip"><span className="ta-pu-icon">⌛</span><div><div className="ta-pu-name">+Time</div><div className="ta-pu-meta">{selectedTest.add_time_price} coins · {selectedTest.add_time_limit}x max</div></div></div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Question Runner — own card ── */}
                {inTest && question && (
                  <div className={`ta-card ta-question-card${timeLeft <= 3 && timeLeft > 0 ? " ta-question-card--danger" : ""}`}>
                    <div className="ta-timer-bar-wrap">
                      <div className="ta-timer-bar-track">
                        <div
                          className={`ta-timer-bar-fill${timeLeft <= 5 && timeLeft > 0 ? " ta-timer-bar-fill--danger" : ""}`}
                          style={{ width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.3s" }}
                        />
                      </div>
                      <div className="ta-timer-display" style={{ color: timerColor }}>
                        {timeLeft <= 5 && timeLeft > 0 && <span className="ta-timer-pulse">⚠ </span>}
                        {timeLeft}s
                      </div>
                    </div>
                    <div className="ta-progress-dots">
                      {Array.from({ length: selectedTest.questions_per_user }, (_, i) => (
                        <div key={i} className={`ta-progress-dot${i < seqNo - 1 ? " ta-progress-dot--done" : i === seqNo - 1 ? " ta-progress-dot--current" : ""}`} />
                      ))}
                    </div>
                    <div className="ta-q-header">
                      <span className="ta-q-num">Question {seqNo}</span>
                      <span className="ta-q-progress">of {selectedTest.questions_per_user}</span>
                    </div>
                    <div className="ta-q-text">{question.question_text}</div>
                    <div className="ta-options">
                      {Object.entries(question.options).map(([k, v]) => (
                        <label key={k} className={`ta-option ${selected===k?"ta-option-selected":""} ${runPhase!=="PLAYING"?"ta-option-disabled":""}`}>
                          <input type="radio" name="opt" value={k} checked={selected===k}
                            onChange={() => { if (runPhase!=="PLAYING") return; setSelected(k); onSubmitAuto(k); }}
                            disabled={runPhase!=="PLAYING"} style={{ display:"none" }} />
                          <span className="ta-option-key">{k}</span>
                          <span className="ta-option-text">{String(v)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="ta-powerup-row">
                      <button className={`ta-pu-btn ${canAddTime?"ta-pu-btn-active":"ta-pu-btn-off"}`} disabled={!canAddTime} onClick={useAddTime}>
                        <span className="ta-pu-btn-icon">⌛</span><span>+Time</span><span className="ta-pu-btn-count">{addTimeUsed}/{addTimeLimit}</span>
                      </button>
                      <button className={`ta-pu-btn ${canSkip?"ta-pu-btn-active":"ta-pu-btn-off"}`} disabled={!canSkip} onClick={useSkip}>
                        <span className="ta-pu-btn-icon">⏭</span><span>Skip</span><span className="ta-pu-btn-count">{skipUsed}/{skipLimit}</span>
                      </button>
                      <div className="ta-pu-revive-info">💊 Revive: <strong>{reviveUsed}/{reviveLimit}</strong></div>
                    </div>
                  </div>
                )}

                {/* ── Live Leaderboard — own card, always visible ── */}
                <div className="ta-card">
                  <div className="ta-section-title" style={{ marginBottom: 12 }}>
                    🏆 Live Leaderboard
                    {qualifiedCount > 0 && <span className="ta-qualified-badge">{qualifiedCount} Qualified</span>}
                  </div>
                  {leaderboard.length === 0 ? (
                    <div className="ta-lb-empty">
                      <div className="ta-lb-empty-icon">📋</div>
                      <div className="ta-lb-empty-text">No players yet</div>
                      <div className="ta-lb-empty-sub">Be the first to register and compete!</div>
                    </div>
                  ) : (
                    <div className="ta-lb-list">
                      {leaderboard.map((r, i) => (
                        <div key={i} className={`ta-lb-row ${i===0?"ta-lb-first":i===1?"ta-lb-second":i===2?"ta-lb-third":""}`}>
                          <div className="ta-lb-rank">{i===0?"🥇":i===1?"🥈":i===2?"🥉":<span className="ta-lb-rank-num">{i+1}</span>}</div>
                          <div className="ta-lb-name">{r.user_name}{r.user_id === userId && <span className="ta-lb-you-tag">You</span>}</div>
                          <div className="ta-lb-score"><strong>{r.score}</strong> pts</div>
                          <div className="ta-lb-correct">{r.correct_count}✓</div>
                          <div className="ta-lb-time">{(r.total_time_ms/1000).toFixed(1)}s</div>
                          <div className={`ta-lb-status ta-lb-status-${r.status}`}>{r.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Winners — own card ── */}
                {winnersAnnounced && (
                  <div className="ta-card ta-winners-card">
                    <div className="ta-section-title" style={{ marginBottom: 12 }}>🎖 Winners</div>
                    {(() => {
                      const w1 = winners.find(w => w.rank_no === 1);
                      const w2 = winners.find(w => w.rank_no === 2);
                      const w3 = winners.find(w => w.rank_no === 3);
                      const rest = winners.filter(w => w.rank_no > 3);
                      const WCard = ({ w, cls, medal }) => (
                        <div className={`ta-winner-card${cls ? " " + cls : ""}`}>
                          <div className="ta-winner-rank-medal">{medal}</div>
                          <div className="ta-winner-info">
                            <div className="ta-winner-name">{w.user_name}</div>
                            {(w.prize_text || w.prize) && <div className="ta-winner-prize">{w.prize_text || w.prize}</div>}
                            {myWinnerData?.user_id === w.user_id && <span className="ta-winner-you-tag">🌟 You</span>}
                          </div>
                        </div>
                      );
                      return (
                        <>
                          <div className="ta-winners-podium">
                            {w2 && <div className="ta-winners-podium-2nd"><WCard w={w2} medal="🥈" /></div>}
                            {w1 && <div className="ta-winners-podium-1st"><WCard w={w1} cls="ta-winner-card--1st" medal="🥇" /></div>}
                            {w3 && <div className="ta-winners-podium-3rd"><WCard w={w3} medal="🥉" /></div>}
                          </div>
                          {rest.length > 0 && (
                            <div className="ta-winners-rest">
                              {rest.map(w => (
                                <div key={w.rank_no} className="ta-winner-row">
                                  <div className="ta-winner-row-rank">#{w.rank_no}</div>
                                  <div className="ta-winner-info">
                                    <div className="ta-winner-name">{w.user_name}</div>
                                    {(w.prize_text || w.prize) && <div className="ta-winner-prize">{w.prize_text || w.prize}</div>}
                                  </div>
                                  {myWinnerData?.user_id === w.user_id && <span className="ta-winner-you-tag">🌟 You</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {myWinnerData && (
                      <button className="ta-winner-celebrate-btn" onClick={() => { shownWinRef.current = true; setStatusOverlay("winner"); }}>
                        🎊 View My Win & Celebrate
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public export — wraps inner component in error boundary ──────────────────
export default function TestArena() {
  return (
    <TestErrorBoundary>
      <TestArenaInner />
    </TestErrorBoundary>
  );
}

const endedBannerCSS = `
.ta-ended-banner{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:16px;background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);margin-top:14px;flex-wrap:wrap;}
.ta-ended-icon{font-size:24px;flex-shrink:0;}
.ta-ended-content{flex:1;min-width:0;}
.ta-ended-title{font-weight:800;font-size:0.92rem;color:#15803d;}
.ta-ended-sub{font-size:11px;color:#64748b;margin-top:3px;line-height:1.4;}
.ta-ended-count{display:flex;flex-direction:column;align-items:center;padding:8px 16px;border-radius:12px;background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.2);}
.ta-ended-num{font-size:1.5rem;font-weight:900;color:#16a34a;line-height:1;}
.ta-ended-num-label{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(22,163,74,0.7);}
`;

const mainCSS = `
  ${endedBannerCSS}
  :root{--ta-deep:#1e3a8a;--ta-blue:#3b82f6;--ta-light:#60a5fa;--ta-pale:#93c5fd;--ta-text:#0f172a;--ta-sub:#334155;--ta-muted:#64748b;--ta-gold:#f59e0b;}
  .ta-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px 0 6px;animation:taIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;}
  @keyframes taIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
  .ta-header-icon{font-size:clamp(28px,4vw,38px);animation:taSpin 1.5s ease-out;}
  @keyframes taSpin{from{transform:rotate(-180deg)scale(0)}to{transform:none}}
  .ta-title{font-size:clamp(1.4rem,3.5vw,1.9rem);font-weight:900;letter-spacing:-0.5px;margin:0;background:linear-gradient(135deg,#1e3a8a,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .ta-sub{color:var(--ta-muted);font-size:clamp(0.6rem,1.4vw,0.75rem);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;}
  /* Grid: 2-col desktop, 1-col + pill row mobile */
  .ta-grid{display:grid;grid-template-columns:300px 1fr;gap:14px;align-items:start;}
  /* Cards */
  .ta-card{background:#fff;border-radius:20px;padding:clamp(14px,3vw,20px);box-shadow:0 1px 3px rgba(15,23,42,0.08),0 4px 16px rgba(15,23,42,0.05);border:1px solid rgba(226,232,240,0.8);animation:taCardIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;transform:translateY(12px);}
  @keyframes taCardIn{to{opacity:1;transform:none}}
  .ta-card-title{font-weight:800;font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--ta-muted);margin-bottom:12px;}
  /* Test list */
  .ta-tests-list{position:sticky;top:12px;}
  .ta-tests-scroll{display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow-y:auto;padding-right:2px;}
  .ta-tests-scroll::-webkit-scrollbar{width:4px;}
  .ta-tests-scroll::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:100px;}
  .ta-test-item{text-align:left;padding:12px 14px;border-radius:14px;border:1.5px solid rgba(226,232,240,0.9);background:#fff;cursor:pointer;transition:all 0.15s;min-height:44px;box-shadow:0 1px 3px rgba(15,23,42,0.04);}
  .ta-test-item:hover{border-color:rgba(59,130,246,0.3);box-shadow:0 2px 8px rgba(59,130,246,0.08);}
  .ta-test-item-active{border-color:transparent!important;background:linear-gradient(#fff,#fff) padding-box,linear-gradient(135deg,#1e3a8a,#3b82f6) border-box!important;box-shadow:0 4px 20px rgba(59,130,246,0.15)!important;}
  .ta-test-item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:4px;}
  .ta-test-item-name{font-weight:800;font-size:0.85rem;color:var(--ta-text);}
  .ta-test-item-meta{font-size:10px;color:var(--ta-muted);font-weight:600;}
  .ta-test-pill{padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;white-space:nowrap;}
  .ta-test-pill-live{background:rgba(22,163,74,0.1);color:#15803d;border:1px solid rgba(22,163,74,0.25);}
  .ta-test-pill-reg{background:rgba(59,130,246,0.1);color:#1e3a8a;border:1px solid rgba(59,130,246,0.25);}
  .ta-test-pill-soon{background:rgba(245,158,11,0.1);color:#b45309;border:1px solid rgba(245,158,11,0.25);}
  .ta-test-pill-ended{background:rgba(100,116,139,0.1);color:#475569;border:1px solid rgba(100,116,139,0.2);}
  .ta-select-prompt{text-align:center;padding:48px 20px;}
  /* Detail card */
  .ta-detail-top{display:flex;flex-direction:column;gap:12px;margin-bottom:14px;}
  .ta-detail-left{flex:1;min-width:0;}
  .ta-detail-title-row{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
  .ta-detail-name{font-size:clamp(1.1rem,2.5vw,1.3rem);font-weight:900;color:var(--ta-text);letter-spacing:-0.5px;}
  .ta-detail-chips{display:flex;gap:6px;flex-wrap:wrap;}
  .ta-chip{padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;color:var(--ta-sub);background:rgba(30,58,138,0.06);border:1px solid rgba(30,58,138,0.1);}
  .ta-chip-green{background:rgba(22,163,74,0.08);color:#15803d;border-color:rgba(22,163,74,0.2);}
  .ta-chip-gold{background:rgba(251,191,36,0.12);color:#b45309;border-color:rgba(251,191,36,0.3);animation:taGoldPulse 2s ease infinite;}
  @keyframes taGoldPulse{0%,100%{box-shadow:0 0 0 rgba(251,191,36,0)}50%{box-shadow:0 0 12px rgba(251,191,36,0.5)}}
  /* Action buttons — full width stacked, min 48px */
  .ta-detail-actions{display:flex;flex-direction:column;gap:8px;}
  .ta-btn{padding:12px 16px;border-radius:12px;border:none;font-size:0.88rem;font-weight:700;cursor:pointer;transition:all 0.18s;white-space:nowrap;min-height:48px;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;}
  .ta-btn-primary{background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;box-shadow:0 3px 0 #1e40af,0 6px 16px rgba(30,58,138,0.25);}
  .ta-btn-primary:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-2px);}
  .ta-btn-gold{background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;box-shadow:0 3px 0 #b45309,0 6px 16px rgba(245,158,11,0.3);animation:taGold 2s ease infinite;}
  @keyframes taGold{0%,100%{box-shadow:0 3px 0 #b45309,0 6px 16px rgba(245,158,11,0.3)}50%{box-shadow:0 3px 0 #b45309,0 6px 28px rgba(245,158,11,0.6)}}
  .ta-btn-dim{background:#f1f5f9;color:#94a3b8;cursor:not-allowed;border:1px solid #e2e8f0;}
  .ta-btn-share{background:rgba(30,58,138,0.06);color:#1e3a8a;border:1.5px solid rgba(30,58,138,0.15);}
  .ta-btn-share:hover{background:rgba(30,58,138,0.12);transform:translateY(-1px);}
  .ta-btn-share-copied{background:rgba(22,163,74,0.08)!important;color:#15803d!important;border-color:rgba(22,163,74,0.25)!important;}
  /* Countdown bar — bigger timer */
  .ta-cd-bar{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;border:1px solid;margin-top:12px;flex-wrap:wrap;}
  .ta-cd-BEFORE_REG{background:rgba(30,58,138,0.05);border-color:rgba(30,58,138,0.18)!important;}
  .ta-cd-REG_OPEN{background:rgba(22,163,74,0.05);border-color:rgba(22,163,74,0.2)!important;}
  .ta-cd-TEST_LIVE{background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.22)!important;}
  .ta-cd-icon{font-size:1.1rem;}
  .ta-cd-label{font-weight:700;font-size:0.82rem;color:var(--ta-sub);flex:1;}
  .ta-cd-timer{font-family:'Courier New',monospace;font-size:clamp(1.2rem,3vw,2rem);font-weight:900;color:var(--ta-deep);letter-spacing:2px;}
  .ta-section{margin-top:18px;}
  .ta-section-title{font-weight:800;font-size:0.7rem;letter-spacing:2px;text-transform:uppercase;color:var(--ta-muted);margin-bottom:12px;display:flex;align-items:center;gap:8px;}
  .ta-qualified-badge{padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;background:rgba(22,163,74,0.1);color:#15803d;border:1px solid rgba(22,163,74,0.25);text-transform:none;letter-spacing:0;}
  /* Timeline — horizontal + connecting line on desktop */
  .ta-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:0;position:relative;}
  .ta-timeline::before{content:'';position:absolute;top:27px;left:16%;right:16%;height:2px;background:linear-gradient(90deg,rgba(30,58,138,0.12),rgba(59,130,246,0.3),rgba(30,58,138,0.12));z-index:0;}
  .ta-tl-step{display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px 8px;position:relative;z-index:1;}
  .ta-tl-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;background:#f8fafc;border:2px solid rgba(30,58,138,0.15);flex-shrink:0;transition:all 0.3s;margin-bottom:8px;}
  .ta-tl-dot-done{background:linear-gradient(135deg,#1e3a8a,#3b82f6);border-color:transparent;color:#fff;font-weight:900;}
  .ta-tl-info{text-align:center;}
  .ta-tl-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--ta-muted);margin-bottom:3px;}
  .ta-tl-date{font-size:11px;font-weight:800;color:var(--ta-text);}
  .ta-tl-past-text{text-decoration:line-through;color:var(--ta-muted)!important;font-weight:600!important;}
  .ta-tl-time{font-size:10px;color:var(--ta-muted);font-weight:600;margin-top:1px;}
  .ta-tl-tz{font-size:8px;letter-spacing:1px;font-weight:700;opacity:0.6;}
  .ta-tl-past .ta-tl-label,.ta-tl-past .ta-tl-time{opacity:0.5;}
  /* Prizes — 1st place full-width prominent */
  .ta-prizes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;}
  .ta-prize-card{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;border:1px solid;transition:transform 0.15s;box-shadow:0 1px 3px rgba(15,23,42,0.04);}
  .ta-prize-card:hover{transform:translateY(-2px);}
  .ta-prize-card:first-child{grid-column:1/-1;padding:16px 18px;}
  .ta-prize-medal{font-size:24px;flex-shrink:0;line-height:1;}
  .ta-prize-card:first-child .ta-prize-medal{font-size:32px;}
  .ta-prize-body{min-width:0;}
  .ta-prize-rank{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;}
  .ta-prize-text{font-weight:800;font-size:clamp(0.82rem,2vw,0.9rem);color:var(--ta-text);line-height:1.3;word-break:break-word;}
  .ta-prize-coins{font-size:10px;font-weight:700;color:var(--ta-blue);margin-top:3px;}
  /* Power-ups */
  .ta-powerups-info{display:flex;gap:8px;flex-wrap:wrap;}
  .ta-pu-chip{display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:14px;background:#fafafa;border:1px solid rgba(226,232,240,0.9);flex:1;min-width:100px;}
  .ta-pu-icon{font-size:18px;flex-shrink:0;}
  .ta-pu-name{font-weight:800;font-size:0.82rem;color:var(--ta-sub);}
  .ta-pu-meta{font-size:10px;color:var(--ta-muted);font-weight:600;margin-top:1px;}
  /* Question card — border flashes red ≤3s */
  .ta-question-card{border:2px solid rgba(59,130,246,0.2)!important;transition:border-color 0.3s,box-shadow 0.3s;}
  .ta-question-card--danger{border-color:rgba(239,68,68,0.55)!important;box-shadow:0 0 0 3px rgba(239,68,68,0.08),0 4px 20px rgba(239,68,68,0.1)!important;animation:taDangerFlash 0.5s ease infinite alternate;}
  @keyframes taDangerFlash{from{border-color:rgba(239,68,68,0.3)}to{border-color:rgba(239,68,68,0.75)}}
  /* Timer */
  .ta-timer-bar-wrap{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .ta-timer-bar-track{flex:1;height:10px;border-radius:100px;background:rgba(226,232,240,0.8);overflow:hidden;}
  .ta-timer-bar-fill{height:100%;border-radius:100px;}
  .ta-timer-bar-fill--danger{animation:taBarPulse 0.5s ease infinite alternate;}
  @keyframes taBarPulse{from{opacity:0.65}to{opacity:1}}
  .ta-timer-display{font-family:'Courier New',monospace;font-size:clamp(1.2rem,3vw,2rem);font-weight:900;min-width:56px;text-align:right;transition:color 0.3s;}
  .ta-timer-pulse{animation:taPulse 0.5s ease infinite alternate;}
  @keyframes taPulse{from{opacity:1}to{opacity:0.3}}
  /* Progress dots */
  .ta-progress-dots{display:flex;gap:4px;align-items:center;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}
  .ta-progress-dot{width:8px;height:8px;border-radius:50%;background:rgba(226,232,240,0.9);border:1px solid rgba(30,58,138,0.1);transition:all 0.2s;}
  .ta-progress-dot--done{background:linear-gradient(135deg,#1e3a8a,#3b82f6);border-color:transparent;}
  .ta-progress-dot--current{background:#3b82f6;border-color:#1e3a8a;width:10px;height:10px;box-shadow:0 0 6px rgba(59,130,246,0.5);}
  .ta-q-header{display:flex;align-items:baseline;gap:6px;margin-bottom:8px;}
  .ta-q-num{font-weight:900;font-size:clamp(0.85rem,2.5vw,1rem);color:var(--ta-deep);}
  .ta-q-progress{font-size:0.78rem;color:var(--ta-muted);font-weight:600;}
  .ta-q-text{font-size:clamp(0.95rem,2.5vw,1.1rem);font-weight:700;color:var(--ta-text);line-height:1.6;margin-bottom:16px;}
  /* Options — 2×2 grid ≥640px */
  .ta-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .ta-option{display:flex;align-items:center;gap:10px;padding:14px;min-height:52px;border-radius:14px;border:1.5px solid rgba(226,232,240,0.9);background:#fff;cursor:pointer;transition:all 0.15s;}
  .ta-option:hover:not(.ta-option-disabled){border-color:rgba(59,130,246,0.4);background:rgba(59,130,246,0.03);transform:translateY(-1px);box-shadow:0 3px 10px rgba(59,130,246,0.08);}
  .ta-option-selected{border-color:var(--ta-blue)!important;background:rgba(59,130,246,0.06)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.1)!important;}
  .ta-option-disabled{cursor:not-allowed;opacity:0.5;}
  .ta-option-key{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ta-option-text{font-weight:600;font-size:clamp(0.85rem,2vw,0.92rem);color:var(--ta-sub);line-height:1.4;}
  .ta-powerup-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;align-items:center;}
  .ta-pu-btn{display:flex;align-items:center;gap:5px;padding:9px 14px;min-height:44px;border-radius:12px;border:none;font-size:0.8rem;font-weight:700;cursor:pointer;transition:all 0.15s;}
  .ta-pu-btn-active{background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;box-shadow:0 3px 10px rgba(30,58,138,0.25);}
  .ta-pu-btn-active:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);}
  .ta-pu-btn-off{background:#f1f5f9;color:#94a3b8;cursor:not-allowed;}
  .ta-pu-btn-icon{font-size:14px;}
  .ta-pu-btn-count{padding:2px 6px;border-radius:100px;background:rgba(255,255,255,0.25);font-size:10px;font-weight:800;}
  .ta-pu-revive-info{font-size:11px;color:var(--ta-muted);font-weight:600;margin-left:4px;}
  /* Leaderboard */
  .ta-lb-empty{display:flex;flex-direction:column;align-items:center;padding:32px 16px;gap:6px;}
  .ta-lb-empty-icon{font-size:36px;opacity:0.35;}
  .ta-lb-empty-text{font-weight:700;font-size:0.9rem;color:var(--ta-muted);}
  .ta-lb-empty-sub{font-size:0.8rem;color:#94a3b8;font-weight:500;}
  .ta-lb-list{display:flex;flex-direction:column;gap:6px;}
  .ta-lb-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:#fff;border:1px solid rgba(226,232,240,0.8);box-shadow:0 1px 3px rgba(15,23,42,0.03);flex-wrap:wrap;transition:transform 0.15s;}
  .ta-lb-row:hover{transform:translateX(2px);}
  .ta-lb-first{background:linear-gradient(135deg,rgba(251,191,36,0.09),rgba(245,158,11,0.04))!important;border-color:rgba(245,158,11,0.32)!important;}
  .ta-lb-second{background:linear-gradient(135deg,rgba(148,163,184,0.09),rgba(100,116,139,0.04))!important;border-color:rgba(148,163,184,0.3)!important;}
  .ta-lb-third{background:linear-gradient(135deg,rgba(180,83,9,0.07),rgba(194,65,12,0.03))!important;border-color:rgba(180,83,9,0.2)!important;}
  .ta-lb-rank{font-size:16px;flex-shrink:0;width:26px;text-align:center;}
  .ta-lb-rank-num{font-size:11px;font-weight:900;color:var(--ta-muted);}
  .ta-lb-name{flex:1;min-width:80px;font-weight:700;font-size:0.88rem;color:var(--ta-text);display:flex;align-items:center;gap:6px;}
  .ta-lb-you-tag{padding:2px 7px;border-radius:100px;font-size:9px;font-weight:800;background:#dbeafe;color:#1e40af;border:1px solid rgba(59,130,246,0.3);}
  .ta-lb-score{font-size:0.85rem;color:var(--ta-blue);min-width:50px;font-weight:700;}
  .ta-lb-correct{font-size:0.8rem;color:var(--ta-muted);font-weight:600;min-width:28px;}
  .ta-lb-time{font-size:0.78rem;color:var(--ta-muted);font-weight:600;font-family:'Courier New',monospace;min-width:40px;}
  .ta-lb-status{font-size:10px;font-weight:700;padding:3px 9px;border-radius:100px;}
  .ta-lb-status-passed,.ta-lb-status-qualified,.ta-lb-status-finished{background:rgba(22,163,74,0.1);color:#15803d;}
  .ta-lb-status-out,.ta-lb-status-eliminated{background:rgba(239,68,68,0.1);color:#dc2626;}
  .ta-lb-status-playing{background:rgba(59,130,246,0.1);color:#1e3a8a;animation:taPulse2 1.5s ease infinite;}
  @keyframes taPulse2{0%,100%{opacity:1}50%{opacity:0.5}}
  /* Winners podium */
  .ta-winners-card{border:1px solid rgba(251,191,36,0.3)!important;background:linear-gradient(135deg,rgba(251,191,36,0.04),rgba(245,158,11,0.02))!important;}
  .ta-winners-podium{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:end;margin-bottom:14px;}
  .ta-winners-podium-1st{grid-column:2;}
  .ta-winners-podium-2nd{grid-column:1;}
  .ta-winners-podium-3rd{grid-column:3;}
  .ta-winner-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 12px;border-radius:14px;background:rgba(255,255,255,0.8);border:1px solid rgba(245,158,11,0.18);}
  .ta-winner-card--1st{background:linear-gradient(135deg,rgba(251,191,36,0.12),rgba(245,158,11,0.06));border-color:rgba(245,158,11,0.38);padding:18px 16px;}
  .ta-winner-rank-medal{font-size:28px;margin-bottom:6px;}
  .ta-winner-card--1st .ta-winner-rank-medal{font-size:42px;}
  .ta-winner-info{width:100%;}
  .ta-winner-name{font-weight:800;font-size:0.88rem;color:var(--ta-text);}
  .ta-winner-card--1st .ta-winner-name{font-size:1rem;}
  .ta-winner-prize{font-size:0.75rem;font-weight:700;color:var(--ta-blue);margin-top:3px;}
  .ta-winner-you-tag{padding:3px 10px;border-radius:100px;font-size:9px;font-weight:800;background:rgba(251,191,36,0.15);color:#b45309;border:1px solid rgba(251,191,36,0.35);white-space:nowrap;margin-top:5px;display:inline-block;}
  .ta-winners-rest{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}
  .ta-winner-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:13px;background:rgba(255,255,255,0.7);border:1px solid rgba(245,158,11,0.15);}
  .ta-winner-row-rank{font-size:14px;font-weight:900;color:var(--ta-muted);flex-shrink:0;}
  .ta-winner-celebrate-btn{width:100%;padding:12px;border-radius:14px;border:1px solid rgba(251,191,36,0.35);background:rgba(251,191,36,0.1);color:#b45309;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;animation:taGold 2s ease infinite;min-height:44px;}
  .ta-winner-celebrate-btn:hover{background:rgba(251,191,36,0.2);transform:translateY(-2px);}
  /* Skeleton loading */
  .ta-loading{display:flex;flex-direction:column;gap:12px;}
  .ta-skel-header{height:52px;border-radius:16px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:taSkelShimmer 1.4s ease infinite;}
  .ta-skel-card{border-radius:20px;padding:20px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,0.05);display:flex;flex-direction:column;gap:10px;}
  .ta-skel-line{height:14px;border-radius:8px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:taSkelShimmer 1.4s ease infinite;}
  .ta-skel-line--short{width:50%;}
  .ta-skel-line--medium{width:72%;}
  .ta-skel-line--full{width:100%;}
  @keyframes taSkelShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  /* Error state */
  .ta-error-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;text-align:center;min-height:40vh;}
  .ta-error-icon{font-size:56px;margin-bottom:16px;}
  .ta-error-title{font-size:1.2rem;font-weight:800;color:var(--ta-text);margin-bottom:8px;}
  .ta-error-desc{color:var(--ta-muted);font-size:0.88rem;max-width:320px;line-height:1.6;margin-bottom:24px;}
  .ta-error-btn{padding:12px 28px;border-radius:12px;border:1.5px solid rgba(30,58,138,0.2);background:#fff;color:var(--ta-deep);font-weight:700;font-size:0.9rem;cursor:pointer;transition:all 0.18s;min-height:44px;}
  .ta-error-btn:hover{background:rgba(30,58,138,0.05);transform:translateY(-1px);}
  /* Misc */
  .ta-empty{color:var(--ta-muted);font-size:0.85rem;padding:8px 0;font-weight:600;}
  .ta-msg{padding:12px 16px;border-radius:14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.18);color:var(--ta-deep);font-weight:600;font-size:0.85rem;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;animation:taMsgIn 0.3s ease;}
  @keyframes taMsgIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
  .ta-msg-close{background:transparent;border:none;color:var(--ta-muted);font-size:18px;cursor:pointer;padding:0 0 0 10px;font-weight:700;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:flex-end;}
  .ta-msg-close:hover{color:var(--ta-text);}
  /* ── Responsive ── */
  /* Mobile <768: stack grid, pill row for tests, hide test list in test */
  @media(max-width:767px){
    .ta-grid{grid-template-columns:1fr;gap:10px;}
    .ta-tests-list{position:static;}
    .ta-tests-scroll{flex-direction:row;max-height:none;overflow-x:auto;overflow-y:visible;padding-bottom:4px;gap:8px;padding-right:0;}
    .ta-tests-scroll::-webkit-scrollbar{height:3px;}
    .ta-test-item{flex-shrink:0;min-width:150px;max-width:195px;border-radius:20px;padding:10px 12px;}
    .ta-test-item-top{flex-direction:column;gap:3px;margin-bottom:3px;}
    .ta-arena-in-test .ta-tests-list{display:none;}
  }
  /* Options 1-col on small mobile */
  @media(max-width:639px){
    .ta-options{grid-template-columns:1fr;}
    .ta-cd-timer{font-size:clamp(1.1rem,4vw,1.6rem);}
  }
  /* Timeline vertical on very small screens */
  @media(max-width:479px){
    .ta-timeline{grid-template-columns:1fr;gap:0;}
    .ta-timeline::before{display:none;}
    .ta-tl-step{flex-direction:row;align-items:flex-start;text-align:left;padding:10px 8px;border-bottom:1px solid rgba(226,232,240,0.6);}
    .ta-tl-step:last-child{border-bottom:none;}
    .ta-tl-dot{margin-bottom:0;margin-right:10px;width:28px;height:28px;}
    .ta-tl-info{text-align:left;}
    /* Winners: stack on narrow mobile */
    .ta-winners-podium{grid-template-columns:1fr;gap:6px;}
    .ta-winners-podium-1st,.ta-winners-podium-2nd,.ta-winners-podium-3rd{grid-column:1;}
    .ta-winner-card{flex-direction:row;text-align:left;padding:12px;}
    .ta-winner-rank-medal{margin-bottom:0;margin-right:10px;font-size:24px!important;}
    /* Prizes 2-col */
    .ta-prizes-grid{grid-template-columns:1fr 1fr;}
    .ta-prize-card:first-child{grid-column:1/-1;}
  }
  @media(max-width:399px){
    .ta-card{border-radius:16px;padding:12px;}
    .ta-btn{font-size:0.82rem;}
    .ta-detail-name{font-size:0.95rem;}
    .ta-lb-time,.ta-lb-correct{display:none;}
  }
  @media(prefers-reduced-motion:reduce){
    *,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;}
  }
`;