"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";


function SocialShareCard({ profile, result, cfg, onClose }) {
  const cardRef = React.useRef(null);
  const [imgUrl, setImgUrl] = React.useState(null);
  const passed = result?.passed;
  const score = `${result?.correct_answers || 0}/${result?.total_questions || cfg?.total_questions || "?"}`;
  const rank = result?.rank ? `#${result.rank}` : "—";
  const avatar = profile?.avatar_url;
  const name = profile?.full_name || "Quiz Player";
  const date = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  React.useEffect(() => {
    if (!cardRef.current) return;
    const t = setTimeout(() => {
      import("html-to-image").then(({ toPng }) => {
        toPng(cardRef.current, { pixelRatio: 2, skipFonts: true })
          .then(setImgUrl).catch(() => setImgUrl(null));
      });
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const caption = [
    passed ? "🏆 I just WON today's AIDLA Daily Quiz!" : "🎯 I took the AIDLA Daily Quiz!",
    "",
    `📊 Score: ${score}`,
    result?.rank ? `🥇 Rank: #${result.rank}` : "",
    "🪙 Coins distributed at end of day",
    "",
    `Think you can beat ${name.split(" ")[0]}? 💪`,
    "👉 www.aidla.online/user/dailyquizz",
    "",
    "#AIDLA #DailyQuiz #LearnAndEarn",
  ].filter(Boolean).join("\n");

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:400, display:"flex", flexDirection:"column", gap:10 }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", width:30, height:30, borderRadius:"50%", cursor:"pointer", fontSize:14, fontWeight:700 }}>✕</button>
        </div>

        {/* CARD - fixed 400px width for consistent screenshot */}
        <div ref={cardRef} style={{ borderRadius:16, overflow:"hidden", background:"white", width:400, minWidth:400 }}>
          {/* Header - single line, no wrap */}
          <div style={{ background:"#312e81", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <img src="/logo.png" alt="AIDLA" style={{ width:30, height:30, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:900, color:"white", letterSpacing:1, whiteSpace:"nowrap" }}>AIDLA</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", whiteSpace:"nowrap" }}>Daily Quiz · Learn & Earn</div>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", color:"white", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap", flexShrink:0 }}>
              {passed ? "🏆 Winner" : "💪 Player"}
            </div>
          </div>

          {/* Avatar + Name - no overlap */}
          <div style={{ background:"#f8faff", padding:"24px 20px 18px", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid #6366f1", display:"block" }} crossOrigin="anonymous" />
              : <div style={{ width:80, height:80, borderRadius:"50%", background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, color:"white" }}>{name[0]?.toUpperCase()}</div>}
            <div style={{ fontSize:18, fontWeight:800, color:"#0f172a", textAlign:"center", width:"100%", marginTop:4 }}>{name}</div>
            <div style={{ padding:"5px 16px", borderRadius:20, fontSize:12, fontWeight:700, color:"white", background: passed ? "#059669" : "#6366f1", marginTop:2 }}>
              {passed ? "🏆 Quiz Champion" : "💪 Brave Challenger"}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", borderTop:"1px solid #f1f5f9", background:"white" }}>
            {[["Score", score], ["Rank", rank], ["Date", date]].map(([l,v], i) => (
              <div key={l} style={{ flex:1, padding:"14px 8px", textAlign:"center", borderRight: i<2 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>{v}</div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:3, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ background:"#312e81", padding:"9px", textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600 }}>
            www.aidla.online · Earn While You Learn 🪙
          </div>
        </div>

        {/* Caption */}
        <div style={{ background:"#1e293b", borderRadius:12, padding:14 }}>
          <div style={{ fontSize:11, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>Caption</div>
          <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"monospace" }}>{caption}</div>
        </div>

        {/* Action buttons - simple flat */}
        <div style={{ display:"flex", gap:8 }}>
          {imgUrl
            ? <a href={imgUrl} download="aidla-quiz.png" style={{ flex:1, padding:"11px", background:"#6366f1", color:"white", borderRadius:10, fontWeight:700, fontSize:13, textDecoration:"none", textAlign:"center" }}>⬇ Download</a>
            : <div style={{ flex:1, padding:"11px", background:"#e2e8f0", color:"#94a3b8", borderRadius:10, fontSize:13, textAlign:"center" }}>Generating…</div>}
          <button style={{ flex:1, padding:"11px", background:"#059669", color:"white", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}
            onClick={() => navigator.clipboard.writeText(caption).then(() => alert("Caption copied!"))}>
            📋 Copy Caption
          </button>
        </div>

      </div>
    </div>
  );
}


const GEN_MESSAGES = [
  { icon: "🧠", text: "Analyzing your learning profile..." },
  { icon: "🎯", text: "Picking the perfect questions for you..." },
  { icon: "✨", text: "AIDLA is crafting your quiz..." },
  { icon: "🔬", text: "Calibrating difficulty level..." },
  { icon: "🚀", text: "Almost ready to launch..." },
  { icon: "📚", text: "Personalizing your experience..." },
];

function GeneratingScreen({ progress, name }) {
  const [msgIdx, setMsgIdx] = React.useState(0);
  const [dots, setDots] = React.useState(0);
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % GEN_MESSAGES.length), 1800);
    const dotTimer = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, []);

  React.useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 300);
    return () => clearTimeout(t);
  }, [msgIdx]);

  const msg = GEN_MESSAGES[msgIdx];

  return (
    <div style={{ ...GS.wrap }}>
      <style>{`
        @keyframes spin360 { to { transform: rotate(360deg); } }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeMsg { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 40px rgba(99,102,241,0.7)} }
      `}</style>

      {/* Spinning ring */}
      <div style={GS.ringWrap}>
        <div style={GS.ringOuter}>
          <div style={{ ...GS.ringInner, animation: "spin360 2s linear infinite" }}>
            <div style={GS.ringArc} />
          </div>
          <div style={GS.logoInner}>
            <div style={{ fontSize: 36, animation: "floatUp 2s ease-in-out infinite" }}>
              {msg.icon}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={GS.title}>
        {name ? `${name.split(" ")[0]}'s Quiz` : "Your Quiz"}
        <span style={{ color: "#6366f1" }}> is Loading</span>
        {"...".slice(0, dots + 1)}
      </div>
      <div style={GS.brand}>Powered by AIDLA AI ✦</div>

      {/* Animated message */}
      <div key={msgIdx} style={{ ...GS.msgBox, animation: "fadeMsg 0.4s ease" }}>
        {msg.text}
      </div>

      {/* Progress bar */}
      <div style={GS.barWrap}>
        <div style={{ ...GS.barFill, width: `${progress}%` }} />
      </div>
      <div style={GS.pct}>{progress}% complete</div>

      {/* Steps */}
      <div style={GS.steps}>
        {["Profile", "Questions", "Ready"].map((step, i) => {
          const done = (i === 0 && progress >= 30) || (i === 1 && progress >= 80) || (i === 2 && progress >= 100);
          const active = (i === 0 && progress < 30) || (i === 1 && progress >= 30 && progress < 80) || (i === 2 && progress >= 80 && progress < 100);
          return (
            <div key={step} style={GS.step}>
              <div style={{ ...GS.stepDot, background: done ? "#059669" : active ? "#6366f1" : "#e2e8f0", animation: active ? "glow 1.5s ease-in-out infinite" : "none" }}>
                {done ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 11, color: done ? "#059669" : active ? "#6366f1" : "#94a3b8", fontWeight: 600 }}>{step}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 14, left: "16%", right: "16%", height: 2, background: "#e2e8f0", zIndex: 0 }} />
      </div>
    </div>
  );
}

const GS = {
  wrap: { background: "white", borderRadius: 20, padding: "40px 24px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 12 },
  ringWrap: { display: "flex", justifyContent: "center", marginBottom: 24 },
  ringOuter: { position: "relative", width: 110, height: 110 },
  ringInner: { position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#6366f1", borderRightColor: "#a5b4fc" },
  ringArc: { position: "absolute", inset: 4, borderRadius: "50%", border: "2px dashed #e0e7ff" },
  logoInner: { position: "absolute", inset: 12, borderRadius: "50%", background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", display: "flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 },
  brand: { fontSize: 12, color: "#6366f1", fontWeight: 700, letterSpacing: 0.5, marginBottom: 20 },
  msgBox: { background: "#f8fafc", border: "1px solid #e0e7ff", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#475569", fontWeight: 600, marginBottom: 20, minHeight: 38 },
  barWrap: { width: "100%", height: 6, background: "#e2e8f0", borderRadius: 20, overflow: "hidden", marginBottom: 6 },
  barFill: { height: "100%", background: "linear-gradient(90deg,#6366f1,#a5b4fc)", borderRadius: 20, transition: "width 0.5s ease" },
  pct: { fontSize: 12, color: "#94a3b8", marginBottom: 24 },
  steps: { display: "flex", justifyContent: "center", gap: 32, position: "relative", alignItems: "flex-start" },
  step: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 },
  stepDot: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", transition: "all 0.3s" },
};

// Get user local date in YYYY-MM-DD — timezone safe
function getLocalDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DailyQuizPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("loading"); // loading|info|rules|generating|in_progress|result|no_attempts|disabled
  const [tab, setTab] = useState("quiz"); // quiz|leaderboard

  const [status, setStatus] = useState(null); // from daily_quiz_my_status
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // {correct, correctIndex}
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState({ winners: [], all_attempts: [] });
  const [genProgress, setGenProgress] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [showShareCard, setShowShareCard] = useState(false);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const submitLock = useRef(false);

  useEffect(() => {
    init();
    startMidnightCountdown();
    return () => { clearInterval(timerRef.current); clearInterval(countdownRef.current); };
  }, []);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && view === "in_progress" && !feedback && attempt && !submitLock.current) {
      handleSubmit(null);
    }
  }, [timeLeft]);

  // Tab switch / minimize ban
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && view === "in_progress" && !feedback && !submitLock.current) {
        console.log("[Quiz] Tab switch detected — auto-submitting null");
        handleSubmit(null);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [view, feedback, attempt]);

  async function init() {
    console.log("[Quiz] init start");
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    console.log("[Quiz] session:", session?.user?.id, "err:", sessErr);
    if (!session) { window.location.href = "/login"; return; }
    setUser(session.user);
    const { data: prof, error: profErr } = await supabase.from("users_profiles").select("*").eq("user_id", session.user.id).single();
    console.log("[Quiz] profile:", prof?.user_id, "err:", profErr);
    setProfile(prof);
    await loadStatus();
    await loadLeaderboard();
    setLoading(false);
    console.log("[Quiz] init complete, view should be set");
  }

  async function loadStatus() {
    console.log("[Quiz] loadStatus calling RPC...");
    const { data, error } = await supabase.rpc("daily_quiz_my_status", { p_date: getLocalDate() });
    console.log("[Quiz] my_status raw:", JSON.stringify(data));
    console.log("[Quiz] my_status error:", error);
    if (error) { console.error("[Quiz] RPC error:", error.message); setView("info"); return; }
    if (!data?.ok) { console.error("[Quiz] ok=false:", data); return; }
    setStatus(data);
    const cfg = data.config;
    console.log("[Quiz] config:", JSON.stringify(cfg));
    console.log("[Quiz] is_enabled:", cfg?.is_enabled, "| attempts_left:", data.attempts_left);
    if (!cfg?.is_enabled) { console.log("[Quiz] -> disabled"); setView("disabled"); return; }
    // If last attempt was passed, show winner screen
    // Check if user has ANY passed attempt today
    const hasPassedToday = data.last_attempt?.status === "passed" || 
      (data.attempts_used > 0 && data.passed_today === true);
    if (hasPassedToday) { console.log("[Quiz] -> passed_done"); setView("passed_done"); return; }
    if (data.attempts_left <= 0) { console.log("[Quiz] -> no_attempts"); setView("no_attempts"); return; }
    console.log("[Quiz] -> info");
    setView("info");
  }

  async function loadLeaderboard() {
    const { data } = await supabase.rpc("daily_quiz_leaderboard", { p_date: getLocalDate() });
    if (data) setLeaderboard({ winners: data.winners || [], all_attempts: data.all_attempts || [] });
  }

  function startMidnightCountdown() {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const d = tomorrow - now;
      const h = Math.floor(d / 3600000);
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((d % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${String(h).padStart(2, "0")}:${m}:${s}`);
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
  }

  function startTimer(seconds) {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function startQuiz() {
    // Full reset before every attempt
    submitLock.current = false;
    clearInterval(timerRef.current);
    setMsg("");
    setFeedback(null);
    setSelected(null);
    setHintUsed(false);
    setEliminatedOptions([]);
    setScore({ correct: 0, wrong: 0 });
    setQIndex(0);
    setQuestions([]);
    setAttempt(null);
    setView("generating");
    setGenProgress(10);

    // Start attempt
    const { data: attemptData, error: attemptErr } = await supabase.rpc("daily_quiz_start_attempt", { p_date: getLocalDate() });
    if (attemptErr || !attemptData?.ok) {
      setMsg(attemptData?.error || attemptErr?.message || "Failed to start");
      setView("info");
      return;
    }
    setAttempt(attemptData);
    setGenProgress(30);

    const cfg = status.config;

    // For AI mode: delete old cache so user gets fresh questions on retry
    if (cfg.generation_mode === "ai") {
      const { error: genErr } = await supabase.functions.invoke("daily-quiz-generate", {
        body: {
          user_id: user.id,
          quiz_date: getLocalDate(),
          total_questions: cfg.total_questions,
          difficulty: cfg.difficulty || "medium",
          attempt_number: attemptData.attempt_number,
        },
      });
      if (genErr) { setMsg("Generation failed. Try again."); setView("info"); return; }
    }

    setGenProgress(80);

    const { data: qData } = await supabase.rpc("daily_quiz_get_questions", { p_quiz_date: getLocalDate(), p_attempt_num: attemptData.attempt_number });
    if (!qData?.ok || !qData.questions?.length) {
      setMsg("Failed to load questions."); setView("info"); return;
    }

    setGenProgress(100);
    setQuestions(qData.questions);
    setQIndex(0);
    setFeedback(null);
    setSelected(null);
    submitLock.current = false;
    setView("in_progress");
    startTimer(cfg.time_per_question_sec);
  }

  async function handleSubmit(optionIndex) {
    if (submitLock.current || !attempt) return;
    submitLock.current = true;
    clearInterval(timerRef.current);

    const cfg = status.config;
    const timeTaken = cfg.time_per_question_sec - timeLeft;
    const q = questions[qIndex];

    setSelected(optionIndex);

    const { data, error } = await supabase.rpc("daily_quiz_submit_answer", {
      p_attempt_id: attempt.attempt_id,
      p_question_order: qIndex + 1,
      p_question_text: q.question_text,
      p_selected: optionIndex,
      p_correct_index: q.correct_option_index,
      p_time_taken_sec: timeTaken,
    });

    if (error || !data?.ok) { console.error('[Quiz] submit error:', error?.message, data); setMsg('Submit failed: ' + (error?.message || data?.error || 'unknown')); submitLock.current = false; return; }

    const newScore = { correct: data.correct_answers, wrong: data.wrong_answers };
    setScore(newScore);
    setFeedback({ correct: data.is_correct, correctIndex: data.correct_option_index });

    await new Promise(r => setTimeout(r, 1200));

    if (data.finished || data.eliminated) {
      // Complete attempt
      const { data: comp } = await supabase.rpc("daily_quiz_complete", { p_attempt_id: attempt.attempt_id });
      await loadLeaderboard();
      await loadStatus();
      setResult({ ...comp, correct_answers: newScore.correct, wrong_answers: newScore.wrong, total_questions: cfg.total_questions });
      setView("result");
    } else {
      const nextIndex = qIndex + 1;
      setQIndex(nextIndex);
      setSelected(null);
      setFeedback(null);
      setHintUsed(false);
      setEliminatedOptions([]);
      submitLock.current = false;
      startTimer(cfg.time_per_question_sec);
    }
  }

  async function useHint() {
    if (hintUsed) return;
    const { data, error } = await supabase.rpc("daily_quiz_use_hint", { p_attempt_id: attempt.attempt_id });
    if (error || !data?.ok) { setMsg(data?.error || "Cannot use hint"); return; }

    const q = questions[qIndex];
    const wrongOptions = [0, 1, 2, 3].filter(i => i !== q.correct_option_index);
    const toEliminate = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setHintUsed(true);
    setProfile(prev => ({ ...prev, total_aidla_coins: prev.total_aidla_coins - data.cost }));
  }

  function shareResult() {
    setShowShareCard(true);
  }

  const cfg = status?.config;
  const q = questions[qIndex];
  const timePct = cfg ? (timeLeft / cfg.time_per_question_sec) * 100 : 100;
  const urgent = timeLeft <= 5 && timeLeft > 0;

  if (loading) return <div style={S.center}>Loading...</div>;

  return (
    <div style={S.wrap}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={S.header}>
        <Link href="/user" style={S.back}>←</Link>
        <span style={S.headerTitle}>Daily Quiz</span>
        <span style={S.coins}>🪙 {(profile?.total_aidla_coins || 0).toLocaleString()}</span>
      </div>

      {showShareCard && result && (
        <SocialShareCard profile={profile} result={result} cfg={cfg} onClose={() => setShowShareCard(false)} />
      )}
      {msg && <div style={S.toast} onClick={() => setMsg("")}>{msg}</div>}

      {/* Tabs (only show when not in quiz) */}
      {!["generating", "in_progress"].includes(view) && (
        <div style={S.tabs}>
          <button style={{ ...S.tab, ...(tab === "quiz" ? S.tabActive : {}) }} onClick={() => setTab("quiz")}>Quiz</button>
          <button style={{ ...S.tab, ...(tab === "leaderboard" ? S.tabActive : {}) }} onClick={() => { setTab("leaderboard"); loadLeaderboard(); }}>🏆 Leaderboard</button>
        </div>
      )}

      <div style={S.body}>

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && !["generating", "in_progress"].includes(view) && (
          <div>
            {leaderboard.winners?.length > 0 && (
              <div style={S.card}>
                <div style={S.cardTitle}>🏆 Today's Winners</div>
                {leaderboard.winners.map((w, i) => (
                  <div key={i} style={S.lbRow}>
                    <span style={{ ...S.lbRank, color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#92400e" : "#475569" }}>#{w.rank}</span>
                    {w.avatar_url && <img src={w.avatar_url} alt="" style={S.avatar} />}
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{w.user_id === profile?.user_id ? "🙋 You" : w.full_name}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{w.score}/{w.total_questions}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginLeft: 8 }}>+{w.coins_earned}🪙</span>
                    {w.streak_days >= 3 && <span style={{ fontSize: 12 }}>🔥{w.streak_days}</span>}
                  </div>
                ))}
              </div>
            )}

            <div style={S.card}>
              <div style={S.cardTitle}>📊 All Participants Today</div>
              {leaderboard.all_attempts?.length === 0 ? (
                <p style={S.empty}>No attempts yet today.</p>
              ) : leaderboard.all_attempts?.map((a, i) => (
                <div key={i} style={S.lbRow}>
                  <span style={{ width: 24, fontSize: 12, color: "#94a3b8" }}>{i + 1}</span>
                  {a.avatar_url && <img src={a.avatar_url} alt="" style={S.avatar} />}
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{a.user_id === profile?.user_id ? "🙋 You" : a.full_name}</span>
                  <span style={{ ...S.pill, background: a.status === "passed" ? "#dcfce7" : "#fee2e2", color: a.status === "passed" ? "#166534" : "#991b1b", fontSize: 11 }}>
                    {a.status === "passed" ? "✅" : "❌"} {a.correct_answers}/{a.total_questions}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUIZ TAB VIEWS */}
        {tab === "quiz" && (
          <>

            {/* DISABLED */}
            {view === "disabled" && (
              <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
                <div style={S.bigEmoji}>🔒</div>
                <div style={S.viewTitle}>Quiz Unavailable</div>
                <div style={S.viewSub}>Check back later.</div>
              </div>
            )}

            {/* INFO */}
            {view === "info" && cfg && (
              <div>
                <div style={S.card}>
                  <div style={S.viewTitle}>🧠 Daily Quiz</div>
                  <div style={S.viewSub}>Answer correctly, beat the threshold, earn coins.</div>
                  <div style={S.statsGrid}>
                    {[
                      ["Questions", cfg.total_questions],
                      ["Pass", `${cfg.pass_threshold}/${cfg.total_questions}`],
                      ["Time/Q", `${cfg.time_per_question_sec}s`],
                      ["Prize", `🪙${cfg.prize_coins}`],
                      ["Winners", cfg.max_winners],
                      ["Attempts", `${status.attempts_left} left`],
                    ].map(([k, v]) => (
                      <div key={k} style={S.statBox}>
                        <div style={S.statVal}>{v}</div>
                        <div style={S.statKey}>{k}</div>
                      </div>
                    ))}
                  </div>
                  {cfg.hint_enabled && <div style={S.infoBanner}>💡 Hints available — costs {cfg.hint_cost_coins} coins to eliminate 2 wrong options</div>}
                  {cfg.streak_bonus_enabled && <div style={S.infoBanner}>🔥 3-day streak bonus: +{cfg.streak_bonus_coins} extra coins</div>}
                  {status.attempts_used > 0 && (
                    <div style={{ ...S.infoBanner, background: "#fff7ed", color: "#92400e" }}>
                      {status.attempts_used} attempt(s) used today · {status.attempts_left} remaining
                    </div>
                  )}
                  <button style={S.btnPrimary} onClick={() => setView("rules")}>
                    {status.attempts_used === 0 ? "Start Quiz" : "Try Again"}
                  </button>
                </div>

                {status.last_attempt && ["passed", "eliminated"].includes(status.last_attempt.status) && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>Last Attempt</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ ...S.pill, background: status.last_attempt.status === "passed" ? "#dcfce7" : "#fee2e2", color: status.last_attempt.status === "passed" ? "#166534" : "#991b1b" }}>
                        {status.last_attempt.status === "passed" ? "✅ Passed" : "❌ Eliminated"}
                      </span>
                      <span style={{ ...S.pill, background: "#e0e7ff", color: "#3730a3" }}>
                        {status.last_attempt.correct_answers}/{status.last_attempt.total_questions}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RULES */}
            {view === "rules" && cfg && (
              <div style={S.card}>
                <div style={S.viewTitle}>📋 Rules</div>
                <div style={S.ruleList}>
                  {[
                    `${cfg.total_questions} questions total`,
                    `${cfg.time_per_question_sec} seconds per question`,
                    `Need ${cfg.pass_threshold}/${cfg.total_questions} correct to pass`,
                    "Timeout counts as wrong answer",
                    "Wrong answers over the limit = eliminated",
                    "Answers auto-advance — no going back",
                    cfg.hint_enabled ? `Hints cost ${cfg.hint_cost_coins} coins (eliminates 2 wrong options)` : null,
                    cfg.streak_bonus_enabled ? `3+ day streak = +${cfg.streak_bonus_coins} bonus coins` : null,
                    `Top ${cfg.max_winners} passers earn 🪙${cfg.prize_coins}`,
                  ].filter(Boolean).map((r, i) => (
                    <div key={i} style={S.ruleItem}><span style={S.ruleDot}>•</span>{r}</div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button style={{ ...S.btnGhost, width: "auto", padding: "13px 24px" }} onClick={() => setView("info")}>← Back</button>
                  <button style={{ ...S.btnPrimary, flex: 1, marginTop: 0 }} onClick={startQuiz}>✅ I Agree — Start!</button>
                </div>
              </div>
            )}

            {/* GENERATING */}
            {view === "generating" && (
              <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>AIDLA is preparing your quiz</div>
                <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 20 }}>Personalizing questions just for you...</div>
                <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${genProgress}%` }} /></div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>{genProgress}%</div>
              </div>
            )}

            {/* IN PROGRESS */}
            {view === "in_progress" && q && (
              <div>
                {/* Top bar */}
                <div style={S.topBar}>
                  <span style={{ color: "#059669", fontWeight: 700 }}>✅ {score.correct}</span>
                  <span style={{ fontWeight: 700 }}>Q {qIndex + 1}/{questions.length}</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>❌ {score.wrong}</span>
                </div>

                {/* Timer */}
                <div style={S.timerBar}><div style={{ ...S.timerFill, width: `${timePct}%`, background: urgent ? "#ef4444" : "#6366f1" }} /></div>
                <div style={{ ...S.timerNum, color: urgent ? "#ef4444" : "#0f172a" }}>{timeLeft}s</div>

                <div style={S.card} onContextMenu={e => e.preventDefault()}>
                  <p style={{ ...S.qText, userSelect:"none", WebkitUserSelect:"none" }}>{q.question_text}</p>
                  {q.category && <span style={{ ...S.pill, background: "#f1f5f9", color: "#64748b", fontSize: 11, marginBottom: 12, display: "inline-block" }}>{q.category}</span>}

                  {q.options?.map((opt, i) => {
                    let bg = "white", border = "1px solid #e2e8f0", color = "#0f172a";
                    if (feedback) {
                      if (i === feedback.correctIndex) { bg = "#dcfce7"; border = "1px solid #10b981"; color = "#065f46"; }
                      else if (i === selected && !feedback.correct) { bg = "#fee2e2"; border = "1px solid #ef4444"; color = "#991b1b"; }
                    } else if (selected === i) { bg = "#eef2ff"; border = "1px solid #6366f1"; }
                    const eliminated = eliminatedOptions.includes(i);
                    return (
                      <button key={i} disabled={!!feedback || eliminated} onClick={() => { if (!feedback) { setSelected(i); handleSubmit(i); } }}
                        style={{ ...S.optBtn, background: bg, border, color, opacity: eliminated ? 0.3 : 1, textDecoration: eliminated ? "line-through" : "none", userSelect:"none", WebkitUserSelect:"none" }}>
                        <span style={S.optLabel}>{String.fromCharCode(65 + i)}</span>{opt}
                      </button>
                    );
                  })}

                  {feedback && (
                    <div style={{ textAlign: "center", marginTop: 12, fontWeight: 700, color: feedback.correct ? "#059669" : "#dc2626" }}>
                      {feedback.correct ? "✅ Correct!" : `❌ Correct answer: ${String.fromCharCode(65 + feedback.correctIndex)}`}
                    </div>
                  )}
                </div>

                {/* Hint button */}
                {cfg?.hint_enabled && !hintUsed && !feedback && (
                  <button style={S.hintBtn} onClick={useHint}>
                    💡 Use Hint ({cfg.hint_cost_coins} coins)
                  </button>
                )}
              </div>
            )}

            {/* RESULT */}
            {view === "result" && result && (
              <div>
                <div style={{ ...S.card, textAlign: "center" }}>
                  <div style={S.bigEmoji}>{result.passed ? (result.winner_rank ? "🏆" : "🎉") : "💔"}</div>
                  <div style={S.viewTitle}>
                    {result.passed ? (result.winner_rank ? "You're a Winner!" : "Quiz Passed!") : "Eliminated"}
                  </div>

                  {result.passed && !result.winner_rank && cfg?.max_winners && leaderboard.winners?.length >= cfg.max_winners && (
                    <div style={{ ...S.infoBanner, background: "#fef9c3", color: "#854d0e" }}>
                      ⚠️ You passed but missed the top {cfg.max_winners} winners. Try faster next time!
                    </div>
                  )}

                  <div style={S.statsGrid}>
                    <div style={S.statBox}><div style={S.statVal}>{result.correct_answers}/{result.total_questions}</div><div style={S.statKey}>Score</div></div>
                    <div style={S.statBox}><div style={{ ...S.statVal, color: "#059669" }}>{result.passed ? "⏳ EOD" : "0"}🪙</div><div style={S.statKey}>{result.passed ? "Coins at 23:59" : "Earned"}</div></div>
                    {result.rank && <div style={S.statBox}><div style={S.statVal}>#{result.rank}</div><div style={S.statKey}>Rank</div></div>}
                    {result.streak_bonus > 0 && <div style={S.statBox}><div style={{ ...S.statVal, color: "#f59e0b" }}>+{result.streak_bonus}🪙</div><div style={S.statKey}>Streak Bonus</div></div>}
                  </div>

                  {result.passed && (
                    <button style={{ ...S.btnPrimary, background: "#059669", marginBottom: 10 }} onClick={shareResult}>
                      📤 Share Result
                    </button>
                  )}

                  {!result.passed && status?.attempts_left > 0 ? (
                    <button style={S.btnGhost} onClick={() => { setResult(null); setView("info"); loadStatus(); }}>
                      Try Again ({status.attempts_left} left)
                    </button>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>Next quiz resets in</div>
                      <div style={S.countdown}>{countdown}</div>
                    </div>
                  )}
                </div>

                {/* Leaderboard after result */}
                {leaderboard.winners?.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>🏆 Today's Winners</div>
                    {leaderboard.winners.map((w, i) => (
                      <div key={i} style={S.lbRow}>
                        <span style={{ ...S.lbRank, color: i === 0 ? "#f59e0b" : "#475569" }}>#{w.rank}</span>
                        {w.avatar_url && <img src={w.avatar_url} alt="" style={S.avatar} />}
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{w.user_id === profile?.user_id ? "🙋 You" : w.full_name}</span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{w.score}/{w.total_questions}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginLeft: 8 }}>+{w.coins_earned}🪙</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NO ATTEMPTS */}
            {/* PASSED DONE - winner screen */}
            {view === "passed_done" && (
              <div>
                <div style={{ ...S.card, textAlign: "center", padding: 40, background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac" }}>
                  <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#15803d", marginBottom: 6 }}>You Already Won Today!</div>
                  <div style={{ fontSize: 14, color: "#166534", marginBottom: 4 }}>
                    Score: {status?.last_attempt?.correct_answers}/{status?.last_attempt?.total_questions}
                  </div>
                  <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 600, marginBottom: 16 }}>
                    🪙 Coins will be distributed at 23:59
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Next quiz in</div>
                  <div style={S.countdown}>{countdown}</div>
                  <button style={{ ...S.btnPrimary, background: "#059669", marginTop: 12 }} onClick={() => {
                    if (!result) setResult({ passed: true, correct_answers: status?.last_attempt?.correct_answers, total_questions: status?.last_attempt?.total_questions, coins_earned: 0, rank: status?.last_attempt?.rank });
                    setShowShareCard(true);
                  }}>
                    📤 Share Your Win
                  </button>
                </div>
                {leaderboard.winners?.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>🏆 Today's Winners</div>
                    {leaderboard.winners.map((w, i) => (
                      <div key={i} style={S.lbRow}>
                        <span style={{ ...S.lbRank, color: i === 0 ? "#f59e0b" : "#475569" }}>#{w.rank}</span>
                        {w.avatar_url && <img src={w.avatar_url} alt="" style={S.avatar} />}
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{w.user_id === profile?.user_id ? "🙋 You" : w.full_name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>+{w.coins_earned}🪙</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NO ATTEMPTS - eliminated/failed screen */}
            {view === "no_attempts" && (
              <div>
                <div style={{ ...S.card, textAlign: "center", padding: 40, background: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "1px solid #fca5a5" }}>
                  <div style={{ fontSize: 64, marginBottom: 8 }}>😔</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#991b1b", marginBottom: 8 }}>Better Luck Tomorrow!</div>
                  <div style={{ fontSize: 14, color: "#7f1d1d", marginBottom: 4, lineHeight: 1.6 }}>
                    You gave it your best shot today.<br />
                    The quiz resets at midnight — come back stronger! 💪
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "10px 16px", margin: "12px 0", fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                    📅 A new challenge awaits tomorrow
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Resets in</div>
                  <div style={S.countdown}>{countdown}</div>
                </div>
                {leaderboard.winners?.length > 0 && (
                  <div style={S.card}>
                    <div style={S.cardTitle}>🏆 Today's Winners</div>
                    {leaderboard.winners.map((w, i) => (
                      <div key={i} style={S.lbRow}>
                        <span style={{ ...S.lbRank, color: i === 0 ? "#f59e0b" : "#475569" }}>#{w.rank}</span>
                        {w.avatar_url && <img src={w.avatar_url} alt="" style={S.avatar} />}
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{w.user_id === profile?.user_id ? "🙋 You" : w.full_name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>+{w.coins_earned}🪙</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}

const S = {
  wrap: { fontFamily: "'DM Sans', sans-serif", maxWidth: 560, margin: "0 auto", minHeight: "100vh", background: "#f9fafb" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "white", borderBottom: "1px solid #e2e8f0" },
  back: { textDecoration: "none", color: "#6366f1", fontWeight: 700, fontSize: 18 },
  headerTitle: { fontWeight: 800, fontSize: 16 },
  coins: { fontWeight: 800, fontSize: 14, color: "#0f172a" },
  tabs: { display: "flex", background: "white", borderBottom: "1px solid #e2e8f0" },
  tab: { flex: 1, padding: "12px", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "2px solid transparent", background: "transparent", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#64748b" },
  tabActive: { color: "#6366f1", borderBottom: "2px solid #6366f1" },
  body: { padding: "16px 16px 40px" },
  card: { background: "white", borderRadius: 14, padding: 20, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  cardTitle: { fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#0f172a" },
  bigEmoji: { fontSize: 52, marginBottom: 8 },
  viewTitle: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  viewSub: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 },
  statBox: { background: "#f8fafc", borderRadius: 10, padding: "10px 8px", textAlign: "center" },
  statVal: { fontWeight: 800, fontSize: 16 },
  statKey: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  infoBanner: { background: "#eff6ff", color: "#1e40af", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, marginBottom: 10 },
  btnPrimary: { width: "100%", padding: "13px", background: "#6366f1", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 4 },
  btnGhost: { width: "100%", padding: "12px", background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4 },
  pill: { padding: "3px 10px", borderRadius: 20, fontWeight: 700 },
  ruleList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 },
  ruleItem: { display: "flex", gap: 8, fontSize: 14, color: "#334155" },
  ruleDot: { color: "#6366f1", fontWeight: 800, flexShrink: 0 },
  progressBar: { width: "100%", height: 6, background: "#e2e8f0", borderRadius: 4, margin: "16px 0 8px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#6366f1", borderRadius: 4, transition: "width 0.3s" },
  topBar: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 },
  timerBar: { width: "100%", height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  timerFill: { height: "100%", borderRadius: 4, transition: "width 1s linear" },
  timerNum: { textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 10, fontVariantNumeric: "tabular-nums" },
  qText: { fontWeight: 700, fontSize: 15, lineHeight: 1.5, margin: "0 0 10px" },
  optBtn: { width: "100%", padding: "12px 14px", margin: "5px 0", borderRadius: 10, textAlign: "left", fontSize: 14, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", fontWeight: 500, display: "flex", alignItems: "center", gap: 10 },
  optLabel: { fontWeight: 800, minWidth: 22 },
  hintBtn: { width: "100%", padding: "10px", background: "#fffbeb", border: "1px solid #fde047", borderRadius: 10, color: "#854d0e", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginTop: 4 },
  lbRow: { display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid #f1f5f9" },
  lbRank: { fontWeight: 800, fontSize: 14, width: 28 },
  avatar: { width: 28, height: 28, borderRadius: "50%", objectFit: "cover" },
  empty: { textAlign: "center", color: "#94a3b8", padding: 20, fontSize: 13 },
  countdown: { fontSize: 28, fontWeight: 800, color: "#6366f1", textAlign: "center", margin: "6px 0", fontVariantNumeric: "tabular-nums" },
  toast: { background: "#1e293b", color: "white", padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  center: { textAlign: "center", padding: 80, fontFamily: "sans-serif" },
};