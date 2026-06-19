// app/admin/post-generator/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const DOMAIN = "aidla.online";

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --navy: #0b1437;
    --royal: #1a3a8f;
    --sky: #3b82f6;
    --gold: #f59e0b;
    --gold-light: #fcd34d;
    --slate: #64748b;
    --card-bg: rgba(255,255,255,0.97);
    --green: #10b981;
    --red: #ef4444;
  }
  * { box-sizing: border-box; }

  .hp-root {
    min-height: 100vh;
    background: linear-gradient(160deg, #f0f4ff 0%, #fffbf0 60%, #e8f4fd 100%);
    font-family: 'DM Sans', sans-serif;
    position: relative; overflow-x: hidden;
  }
  .bg-orbs { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .bg-orb-1 { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: rgba(59,130,246,0.06); filter: blur(80px); top: -200px; left: -200px; }
  .bg-orb-2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: rgba(245,158,11,0.05); filter: blur(80px); top: 300px; right: -250px; }

  .hp-container {
    max-width: 1000px; margin: 0 auto;
    padding: clamp(20px,5vw,60px) clamp(14px,4vw,32px) clamp(40px,8vw,80px);
    position: relative; z-index: 2; width: 100%;
  }

  .sec-label {
    display: inline-block;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: var(--navy); padding: 6px 14px; border-radius: 30px;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(245,158,11,0.25);
  }
  .sec-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem,6vw,2.5rem); font-weight: 900;
    color: var(--navy); line-height: 1.15; margin-bottom: 8px;
  }
  .sec-title span {
    background: linear-gradient(135deg, var(--royal), var(--sky));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .sec-desc { color: var(--slate); font-size: clamp(0.85rem,2vw,1rem); line-height: 1.5; margin-bottom: 32px; }

  /* ── Test Grid ── */
  .test-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(280px,100%),1fr));
    gap: 16px; margin-bottom: 32px;
  }
  .test-card {
    background: var(--card-bg); border-radius: 20px;
    border: 1px solid rgba(59,130,246,0.1);
    box-shadow: 0 4px 20px rgba(11,20,55,0.06);
    padding: 20px 22px 18px; cursor: pointer; transition: all 0.22s;
    position: relative; overflow: hidden;
  }
  .test-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--royal), var(--sky));
    opacity: 0; transition: opacity 0.2s;
  }
  .test-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(11,20,55,0.12); }
  .test-card:hover::before, .test-card.selected::before { opacity: 1; }
  .test-card.selected { border-color: var(--sky); box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 12px 36px rgba(11,20,55,0.1); }

  .test-card-title {
    font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 800;
    color: var(--navy); margin-bottom: 6px; line-height: 1.3;
  }
  .test-card-desc {
    font-size: 0.73rem; color: var(--slate); line-height: 1.4; margin-bottom: 10px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .test-card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .test-badge {
    padding: 3px 9px; border-radius: 20px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .badge-draft    { background: rgba(100,116,139,0.1); color: var(--slate); }
  .badge-active   { background: rgba(16,185,129,0.1);  color: #065f46; }
  .badge-live     { background: rgba(239,68,68,0.1);   color: #991b1b; }
  .badge-finished { background: rgba(59,130,246,0.1);  color: var(--royal); }
  .badge-free     { background: rgba(16,185,129,0.1);  color: #065f46; }
  .badge-paid     { background: rgba(245,158,11,0.1);  color: #92400e; }
  .badge-open     { background: rgba(99,102,241,0.1);  color: #3730a3; }

  /* Prize pills inside test card */
  .prize-pills { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 6px; }
  .prize-pill {
    display: flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 20px; font-size: 0.6rem; font-weight: 700;
  }
  .prize-pill-1 { background: rgba(245,158,11,0.12); color: #92400e; border: 1px solid rgba(245,158,11,0.2); }
  .prize-pill-2 { background: rgba(148,163,184,0.12); color: #475569; border: 1px solid rgba(148,163,184,0.2); }
  .prize-pill-3 { background: rgba(205,127,50,0.12);  color: #78350f; border: 1px solid rgba(205,127,50,0.2); }
  .prize-pill-n { background: rgba(59,130,246,0.08);  color: var(--royal); border: 1px solid rgba(59,130,246,0.15); }

  .test-card-arrow {
    position: absolute; right: 18px; top: 50%; transform: translateY(-50%);
    font-size: 1.1rem; opacity: 0.25; transition: all 0.2s;
  }
  .test-card:hover .test-card-arrow { opacity: 1; transform: translateY(-50%) translateX(3px); }

  /* ── Post Panel ── */
  .post-panel {
    background: var(--card-bg); border-radius: 24px;
    box-shadow: 0 8px 40px rgba(11,20,55,0.08);
    border: 1px solid rgba(59,130,246,0.1); overflow: hidden;
    animation: panelIn 0.3s ease;
  }
  @keyframes panelIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .post-panel-header {
    padding: 20px 28px; border-bottom: 1px solid rgba(59,130,246,0.08);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  }
  .post-panel-title {
    font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 800; color: var(--navy);
    display: flex; align-items: center; gap: 10px;
  }
  .back-btn {
    background: rgba(59,130,246,0.08); border: none; border-radius: 10px;
    padding: 7px 14px; font-size: 0.75rem; font-weight: 700; color: var(--royal);
    cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .back-btn:hover { background: rgba(59,130,246,0.15); }

  /* Prize row inside panel header */
  .panel-prizes {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding: 10px 28px; background: rgba(245,158,11,0.03);
    border-bottom: 1px solid rgba(59,130,246,0.07);
  }
  .panel-prize-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.72rem; font-weight: 700; color: var(--navy);
    background: var(--card-bg); border: 1px solid rgba(245,158,11,0.2);
    border-radius: 20px; padding: 4px 10px;
  }

  .post-tabs { display: flex; gap: 8px; padding: 16px 28px; border-bottom: 1px solid rgba(59,130,246,0.07); flex-wrap: wrap; }
  .post-tab {
    padding: 8px 16px; border-radius: 20px; font-size: 0.72rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
    background: transparent; color: var(--slate); border: 1px solid rgba(59,130,246,0.12);
    transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .post-tab:hover { color: var(--navy); border-color: var(--sky); }
  .post-tab.active {
    background: linear-gradient(135deg, var(--royal), var(--sky));
    color: #fff; border-color: transparent; box-shadow: 0 3px 12px rgba(26,58,143,0.25);
  }

  .post-content { padding: 24px 28px; }

  .canvas-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 20px; }
  .canvas-preview {
    border-radius: 14px; overflow: hidden; display: block;
    box-shadow: 0 8px 40px rgba(11,20,55,0.15); max-width: 100%;
    border: 1px solid rgba(59,130,246,0.1);
  }

  .action-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 24px; }
  .action-btn {
    padding: 10px 22px; border-radius: 30px; font-size: 0.78rem; font-weight: 800;
    cursor: pointer; border: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 7px;
  }
  .btn-download { background: linear-gradient(135deg, var(--royal), var(--sky)); color: #fff; box-shadow: 0 4px 14px rgba(26,58,143,0.3); }
  .btn-download:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,58,143,0.4); }
  .btn-copy { background: rgba(16,185,129,0.1); color: #065f46; border: 1px solid rgba(16,185,129,0.2); }
  .btn-copy:hover { background: rgba(16,185,129,0.18); }

  .caption-section { margin-bottom: 18px; }
  .caption-label { font-size: 0.67rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--slate); margin-bottom: 7px; }
  .caption-box {
    background: rgba(59,130,246,0.03); border: 1px solid rgba(59,130,246,0.1);
    border-radius: 14px; padding: 14px 16px 14px 16px; font-size: 0.84rem; color: var(--navy);
    line-height: 1.65; white-space: pre-wrap; font-family: 'DM Sans', sans-serif; position: relative;
  }
  .caption-copy-btn {
    position: absolute; top: 10px; right: 10px;
    background: rgba(59,130,246,0.08); border: none; border-radius: 8px;
    padding: 5px 10px; font-size: 0.65rem; font-weight: 700; color: var(--royal);
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .caption-copy-btn:hover { background: rgba(59,130,246,0.15); }

  .skel-bg {
    background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);
    background-size: 400% 100%; animation: skel-load 1.5s ease-in-out infinite; border-radius: 8px;
  }
  @keyframes skel-load { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  .hp-empty { text-align: center; padding: 48px 20px; color: var(--slate); font-size: 0.88rem; }
  .hp-empty-icon { font-size: 2.2rem; display: block; margin-bottom: 10px; }
  .hp-error {
    background: rgba(254,226,226,0.9); border: 1px solid #fca5a5; color: #991b1b;
    padding: 10px 16px; border-radius: 12px; font-size: 0.82rem; font-weight: 600; margin-bottom: 16px;
  }

  @media (max-width: 600px) {
    .post-panel-header, .panel-prizes, .post-tabs, .post-content { padding-left: 14px; padding-right: 14px; }
    .test-card-arrow { display: none; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}
function statusBadge(s) {
  return { draft: "badge-draft", active: "badge-active", live: "badge-live", finished: "badge-finished", out: "badge-finished" }[s] || "badge-draft";
}

// Format a prize row from test_prizes into a human-readable string
function fmtPrize(p) {
  if (!p) return null;
  const coins = Number(p.coins_amount);
  if (coins > 0) return `🪙 ${Math.floor(coins).toLocaleString()} Coins`;
  if (p.prize_text) return `🎁 ${p.prize_text}`;
  return "🎁 Prize";
}

function rankEmoji(r) {
  return r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
}

function prizePillClass(r) {
  return r === 1 ? "prize-pill prize-pill-1" : r === 2 ? "prize-pill prize-pill-2" : r === 3 ? "prize-pill prize-pill-3" : "prize-pill prize-pill-n";
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS RENDERER
═══════════════════════════════════════════════════════════════ */
function drawPost(canvas, test, prizes, type) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const isFB    = type === "facebook";
  const isStory = type === "story";

  ctx.clearRect(0, 0, W, H);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b1437");
  bg.addColorStop(0.5, "#1a3a8f");
  bg.addColorStop(1, "#0b1437");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  const circ = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); };
  circ(W*0.85, H*0.1,  W*0.24, "rgba(59,130,246,0.1)");
  circ(W*0.1,  H*0.9,  W*0.18, "rgba(245,158,11,0.08)");
  circ(W*0.5,  H*0.5,  W*0.45, "rgba(255,255,255,0.015)");

  // Gold bars top + bottom
  const barH = isStory ? 8 : 5;
  const barG = ctx.createLinearGradient(0,0,W,0);
  barG.addColorStop(0,"#f59e0b"); barG.addColorStop(1,"#fcd34d");
  ctx.fillStyle = barG;
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H-barH, W, barH);

  // Brand
  const brandY   = isStory ? 140 : isFB ? 68 : 98;
  const brandSz  = isStory ? 52 : isFB ? 30 : 38;
  ctx.font = `900 ${brandSz}px Arial`;
  ctx.fillStyle = "#f59e0b";
  ctx.textAlign = "center";
  ctx.fillText("AIDLA", W/2, brandY);

  // Sub-label
  const subSz = isStory ? 22 : isFB ? 13 : 17;
  ctx.font = `700 ${subSz}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("◆  TEST COMPETITION  ◆", W/2, brandY + brandSz * 1.1);

  // Title
  const title    = test.title || "Untitled Test";
  const titleSz  = isStory ? 66 : isFB ? 42 : 54;
  ctx.font = `900 ${titleSz}px Georgia`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  const maxW = W * 0.82;
  const words = title.split(" ");
  const lines = [];
  let cur = "";
  words.forEach(w => {
    const t2 = cur ? cur+" "+w : w;
    if (ctx.measureText(t2).width > maxW && cur) { lines.push(cur); cur=w; }
    else cur = t2;
  });
  if (cur) lines.push(cur);
  const titleY  = isStory ? H*0.36 : H*0.40;
  const lineH   = titleSz * 1.2;
  const startY  = titleY - ((lines.length-1)*lineH)/2;
  lines.forEach((l,i) => ctx.fillText(l, W/2, startY + i*lineH));

  // Divider
  const divY  = startY + lines.length*lineH + (isStory?32:20);
  const divW  = W*0.22;
  const divG  = ctx.createLinearGradient(W/2-divW,0,W/2+divW,0);
  divG.addColorStop(0,"transparent"); divG.addColorStop(0.5,"#f59e0b"); divG.addColorStop(1,"transparent");
  ctx.fillStyle=divG;
  ctx.fillRect(W/2-divW, divY, divW*2, 2);

  // Info lines
  const infoSz  = isStory ? 26 : isFB ? 15 : 19;
  ctx.font = `600 ${infoSz}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.textAlign = "center";
  const infos = [];
  if (test.entry_type === "free") infos.push("✅ Free Entry");
  else if (test.entry_cost > 0)   infos.push(`🪙 ${test.entry_cost} Coins to Enter`);
  if (test.questions_per_user)    infos.push(`📝 ${test.questions_per_user} Questions  ⏱ ${test.time_per_question_sec}s each`);
  // Registration window
  if (test.registration_open_at && test.registration_close_at)
    infos.push(`📋 Reg: ${fmtDate(test.registration_open_at)} → ${fmtDate(test.registration_close_at)}`);
  else if (test.registration_open_at)
    infos.push(`📋 Reg opens: ${fmtDate(test.registration_open_at)}`);
  else if (test.registration_close_at)
    infos.push(`📋 Reg closes: ${fmtDate(test.registration_close_at)}`);
  // Test window
  if (test.test_start_at && test.test_end_at)
    infos.push(`🏁 Test: ${fmtDate(test.test_start_at)} → ${fmtDate(test.test_end_at)}`);
  else if (test.test_start_at)
    infos.push(`🏁 Test starts: ${fmtDate(test.test_start_at)}`);
  else if (test.test_end_at)
    infos.push(`🏁 Test ends: ${fmtDate(test.test_end_at)}`);
  // Results announcement
  if (test.results_announce_at)
    infos.push(`📢 Results: ${fmtDate(test.results_announce_at)}`);

  const infoY   = divY + (isStory?52:34);
  const lineH2  = infoSz * 1.65;
  infos.forEach((inf, i) => ctx.fillText(inf, W/2, infoY + i*lineH2));

  // Prize section (if prizes exist)
  const enabledPrizes = prizes.filter(p => p.enabled).sort((a,b)=>a.rank_no-b.rank_no);
  if (enabledPrizes.length > 0) {
    const prizeStartY = infoY + infos.length * lineH2 + (isStory ? 40 : 26);
    const prizeLabelSz = isStory ? 22 : isFB ? 13 : 17;
    ctx.font = `800 ${prizeLabelSz}px Arial`;
    ctx.fillStyle = "#f59e0b";
    ctx.textAlign = "center";
    ctx.fillText("🏆  PRIZES", W/2, prizeStartY);

    const prizeSz  = isStory ? 24 : isFB ? 14 : 18;
    ctx.font = `600 ${prizeSz}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    const lineH3 = prizeSz * 1.7;
    enabledPrizes.slice(0,4).forEach((p, i) => {
      const label = `${rankEmoji(p.rank_no)}  ${fmtPrize(p)}`;
      ctx.fillText(label, W/2, prizeStartY + prizeLabelSz*1.6 + i*lineH3);
    });
  }

  // CTA button
  const ctaY   = H - (isStory ? 220 : isFB ? 95 : 145);
  const ctaW   = W * 0.52;
  const ctaHh  = isStory ? 78 : isFB ? 42 : 56;
  const ctaX   = (W-ctaW)/2;
  const ctaR   = ctaHh/2;
  const ctaG   = ctx.createLinearGradient(ctaX,0,ctaX+ctaW,0);
  ctaG.addColorStop(0,"#f59e0b"); ctaG.addColorStop(1,"#fcd34d");
  ctx.beginPath();
  ctx.moveTo(ctaX+ctaR, ctaY);
  ctx.lineTo(ctaX+ctaW-ctaR, ctaY);
  ctx.arcTo(ctaX+ctaW, ctaY, ctaX+ctaW, ctaY+ctaHh, ctaR);
  ctx.lineTo(ctaX+ctaR, ctaY+ctaHh);
  ctx.arcTo(ctaX, ctaY+ctaHh, ctaX, ctaY, ctaR);
  ctx.closePath();
  ctx.fillStyle = ctaG;
  ctx.fill();
  const ctaSz = isStory ? 30 : isFB ? 17 : 22;
  ctx.font = `900 ${ctaSz}px Arial`;
  ctx.fillStyle = "#0b1437";
  ctx.textAlign = "center";
  ctx.fillText("JOIN NOW →", W/2, ctaY + ctaHh/2 + ctaSz*0.36);

  // Domain watermark
  const tagSz = isStory ? 22 : isFB ? 13 : 17;
  ctx.font = `500 ${tagSz}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.textAlign = "center";
  ctx.fillText(DOMAIN, W/2, H-(isStory?58:28));
}

/* ═══════════════════════════════════════════════════════════════
   POST TYPES
═══════════════════════════════════════════════════════════════ */
const POST_TYPES = [
  { id: "facebook", label: "📘 Facebook Post",   w: 1200, h: 630  },
  { id: "whatsapp", label: "💚 WhatsApp Status", w: 1080, h: 1080 },
  { id: "story",    label: "📱 Story / Reel",    w: 1080, h: 1920 },
];

/* ═══════════════════════════════════════════════════════════════
   CAPTION GENERATOR — now includes prizes
═══════════════════════════════════════════════════════════════ */
function generateCaption(test, prizes, type) {
  const link    = `https://${DOMAIN}/tests/${test.id}`;
  const isFree  = test.entry_type === "free";

  const emojis = type === "facebook"
    ? ["📣","🎓","🏆","✨","🔗"]
    : type === "whatsapp"
    ? ["🔥","🎯","🧠","💪","📲"]
    : ["⚡","🚀","🎉","🌟","👇"];
  const [e1,e2,e3,e4,e5] = emojis;

  const enabledPrizes = prizes.filter(p=>p.enabled).sort((a,b)=>a.rank_no-b.rank_no);

  const rawDesc = test.description || "New test competition on AIDLA. Prove your knowledge and win!";
  const shortDesc = rawDesc.length > 100 ? rawDesc.slice(0, 97).trimEnd() + "…" : rawDesc;

  const lines = [
    `${e1} *${test.title}*`,
    ``,
    `${e2} ${shortDesc}`,
    ``,
    `${e3} *Details:*`,
    `• Entry: ${isFree ? "FREE 🎁" : `${test.entry_cost} AIDLA Coins 🪙`}`,
    `• Questions: ${test.questions_per_user} per participant`,
    `• Time per question: ${test.time_per_question_sec}s`,
    `• Winners: Top ${test.max_winners}`,
    test.registration_open_at ? `• Reg opens: ${fmtDate(test.registration_open_at)}` : null,
    test.registration_close_at ? `• Reg closes: ${fmtDate(test.registration_close_at)}` : null,
    test.test_start_at ? `• Test starts: ${fmtDate(test.test_start_at)}` : null,
    test.test_end_at ? `• Test ends: ${fmtDate(test.test_end_at)}` : null,
    test.results_announce_at ? `• Results: ${fmtDate(test.results_announce_at)}` : null,
    test.max_participants ? `• Limited to ${test.max_participants} participants` : null,
    ``,
    enabledPrizes.length > 0 ? `🏆 *Prize Pool:*` : null,
    ...enabledPrizes.map(p => `  ${rankEmoji(p.rank_no)} Rank ${p.rank_no}: ${fmtPrize(p)}`),
    enabledPrizes.length > 0 ? `` : null,
    `${e4} *Don't miss your chance to win!*`,
    ``,
    `${e5} Register now 👇`,
    link,
    ``,
    `#AIDLA #TestCompetition #OnlineQuiz #WinPrizes #KnowledgeTest`,
  ].filter(l => l !== null);

  return lines.join("\n");
}

/* ═══════════════════════════════════════════════════════════════
   POST PANEL
═══════════════════════════════════════════════════════════════ */
function PostPanel({ test, prizes, onBack }) {
  const [activeType,    setActiveType]    = useState("facebook");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink,    setCopiedLink]    = useState(false);
  const canvasRef = useRef(null);

  const config  = POST_TYPES.find(p => p.id === activeType);
  const caption = generateCaption(test, prizes, activeType);
  const link    = `https://${DOMAIN}/tests/${test.id}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = config.w;
    canvas.height = config.h;
    drawPost(canvas, test, prizes, activeType);
  }, [activeType, test, prizes, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `aidla-${test.title.replace(/\s+/g,"-").toLowerCase()}-${activeType}.png`;
    a.click();
  };

  const copyCaption = () => navigator.clipboard.writeText(caption).then(() => { setCopiedCaption(true); setTimeout(()=>setCopiedCaption(false),2200); });
  const copyLink    = () => navigator.clipboard.writeText(link).then(()    => { setCopiedLink(true);    setTimeout(()=>setCopiedLink(false),2200);    });

  const scale    = Math.min(580/config.w, 1);
  const prevW    = Math.round(config.w * scale);
  const prevH    = Math.round(config.h * scale);
  const enabled  = prizes.filter(p=>p.enabled).sort((a,b)=>a.rank_no-b.rank_no);

  return (
    <div className="post-panel">

      {/* Header */}
      <div className="post-panel-header">
        <div className="post-panel-title">📣 {test.title}</div>
        <button className="back-btn" onClick={onBack}>← All Tests</button>
      </div>

      {/* Prize strip */}
      {enabled.length > 0 && (
        <div className="panel-prizes">
          <span style={{ fontSize:"0.65rem", fontWeight:800, color:"var(--slate)", textTransform:"uppercase", letterSpacing:"0.05em", alignSelf:"center" }}>Prizes:</span>
          {enabled.map(p => (
            <div key={p.id} className="panel-prize-item">
              {rankEmoji(p.rank_no)} {fmtPrize(p)}
            </div>
          ))}
        </div>
      )}

      {/* Type tabs */}
      <div className="post-tabs">
        {POST_TYPES.map(pt => (
          <button key={pt.id} className={`post-tab ${activeType===pt.id?"active":""}`} onClick={()=>setActiveType(pt.id)}>
            {pt.label}
          </button>
        ))}
      </div>

      <div className="post-content">
        {/* Canvas */}
        <div className="canvas-wrap">
          <canvas ref={canvasRef} className="canvas-preview" style={{ width:prevW, height:prevH }} />
          <p style={{ fontSize:"0.67rem", color:"var(--slate)", margin:0 }}>
            {config.w} × {config.h}px · Full resolution PNG download
          </p>
        </div>

        {/* Actions */}
        <div className="action-row">
          <button className="action-btn btn-download" onClick={handleDownload}>⬇️ Download Image</button>
          <button className="action-btn btn-copy" onClick={copyLink}>
            {copiedLink ? "✅ Copied!" : "🔗 Copy Link"}
          </button>
        </div>

        {/* Caption */}
        <div className="caption-section">
          <div className="caption-label">📝 Auto-Generated Caption</div>
          <div className="caption-box">
            {caption}
            <button className="caption-copy-btn" onClick={copyCaption}>
              {copiedCaption ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>

        {/* Link */}
        <div className="caption-section">
          <div className="caption-label">🔗 Direct Test Link</div>
          <div className="caption-box" style={{ fontSize:"0.8rem", wordBreak:"break-all", paddingRight:80 }}>
            {link}
            <button className="caption-copy-btn" onClick={copyLink}>
              {copiedLink ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function Homepage() {
  const [tests,        setTests]        = useState([]);
  const [prizesMap,    setPrizesMap]    = useState({});   // { [test_id]: prize[] }
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      // 1. Fetch tests
      const { data: testData, error: testErr } = await supabase
        .from("test_tests")
        .select("id,title,description,status,entry_type,entry_cost,registration_open_at,registration_close_at,test_start_at,test_end_at,results_announce_at,questions_per_user,time_per_question_sec,max_participants,max_winners,created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (testErr) { setError(testErr.message); setLoading(false); return; }
      const tests = testData || [];
      setTests(tests);

      if (tests.length === 0) { setLoading(false); return; }

      // 2. Fetch all prizes for those tests in one query
      const testIds = tests.map(t => t.id);
      const { data: prizeData, error: prizeErr } = await supabase
        .from("test_prizes")
        .select("id,test_id,rank_no,prize_type,prize_text,coins_amount,enabled")
        .in("test_id", testIds)
        .order("rank_no", { ascending: true });

      if (prizeErr) { setError(prizeErr.message); }
      else {
        // Group by test_id
        const map = {};
        (prizeData || []).forEach(p => {
          if (!map[p.test_id]) map[p.test_id] = [];
          map[p.test_id].push(p);
        });
        setPrizesMap(map);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const prizesForSelected = selectedTest ? (prizesMap[selectedTest.id] || []) : [];

  return (
    <div className="hp-root">
      <style>{CSS}</style>
      <div className="bg-orbs"><div className="bg-orb-1"/><div className="bg-orb-2"/></div>

      <div className="hp-container">
        <div className="section-title-wrap" style={{ animation: "panelIn 0.5s ease" }}>
          <span className="sec-label">Admin</span>
          <h2 className="sec-title">Post <span>Generator</span></h2>
          <p className="sec-desc">
            Generate ready-to-share promotional images and captions for every test —
            Facebook banners, WhatsApp statuses & Stories — with prizes, entry details and your direct link.
          </p>
        </div>

        {error && <div className="hp-error">⚠️ {error}</div>}

        {selectedTest ? (
          <PostPanel key="panel"
            test={selectedTest}
            prizes={prizesForSelected}
            onBack={() => setSelectedTest(null)}
          />
        ) : (
          <div className="grid-wrap" style={{ animation: "panelIn 0.3s ease" }}>

            {loading ? (
              <div className="test-grid">
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} style={{ borderRadius:20, overflow:"hidden", border:"1px solid rgba(59,130,246,0.08)" }}>
                    <div className="skel-bg" style={{ height:140 }}/>
                  </div>
                ))}
              </div>
            ) : tests.length === 0 ? (
              <div className="hp-empty">
                <span className="hp-empty-icon">📋</span>
                No tests found. Create a test first.
              </div>
            ) : (
              <>
                <p style={{ fontSize:"0.8rem", color:"var(--slate)", marginBottom:16, fontWeight:600 }}>
                  {tests.length} test{tests.length!==1?"s":""} — click any to generate posts
                </p>
                <div className="test-grid">
                  {tests.map((t,i) => {
                    const tPrizes = (prizesMap[t.id]||[]).filter(p=>p.enabled).sort((a,b)=>a.rank_no-b.rank_no);
                    return (
                      <div key={t.id}
                        className={`test-card ${selectedTest?.id===t.id?"selected":""}`}
                        style={{ animation: `panelIn 0.3s ease ${Math.min(i*0.05,0.4)}s both` }}
                        onClick={()=>setSelectedTest(t)}>
                        <div className="test-card-title">{t.title}</div>
                        {t.description && <div className="test-card-desc">{t.description}</div>}
                        <div className="test-card-meta">
                          <span className={`test-badge ${statusBadge(t.status)}`}>{t.status}</span>
                          <span className={`test-badge ${t.entry_type==="free"?"badge-free":"badge-paid"}`}>
                            {t.entry_type==="free" ? "Free" : `🪙 ${t.entry_cost}`}
                          </span>
                          {t.registration_open_at && (
                            <span className="test-badge badge-open">📅 {fmtDate(t.registration_open_at)}</span>
                          )}
                        </div>
                        {/* Prize pills */}
                        {tPrizes.length > 0 && (
                          <div className="prize-pills">
                            {tPrizes.slice(0,4).map(p=>(
                              <span key={p.id} className={prizePillClass(p.rank_no)}>
                                {rankEmoji(p.rank_no)} {fmtPrize(p)}
                              </span>
                            ))}
                            {tPrizes.length > 4 && (
                              <span className="prize-pill prize-pill-n">+{tPrizes.length-4} more</span>
                            )}
                          </div>
                        )}
                        <span className="test-card-arrow">→</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}