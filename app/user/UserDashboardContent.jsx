"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ url, name, size = 72 }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "U";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: url ? "transparent" : "linear-gradient(135deg,#f59e0b,#d97706)",
      border: "3px solid #f59e0b",
      boxShadow: "0 0 0 3px rgba(245,158,11,.25), 0 8px 24px rgba(0,0,0,.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: size * 0.35, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{initials}</span>
      }
    </div>
  );
}

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.vd { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; }

/* ── HERO ── */
.vd-hero {
  background: linear-gradient(160deg, #0a0f2e 0%, #0d1b4b 40%, #1a1040 100%);
  border-radius: 28px;
  padding: 28px 20px 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.vd-hero::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(245,158,11,.22) 0%, transparent 70%);
  pointer-events: none;
}
.vd-hero::after {
  content: '';
  position: absolute;
  bottom: -40px; left: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%);
  pointer-events: none;
}
.vd-hero-top {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 20px; position: relative; z-index: 1;
}
.vd-hero-info { flex: 1; min-width: 0; }
.vd-greeting {
  font-size: 0.72rem; font-weight: 600;
  color: rgba(245,158,11,.85); letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 3px;
}
.vd-name {
  font-size: 1.5rem; font-weight: 900;
  color: #fff; letter-spacing: -0.04em;
  line-height: 1.1; margin-bottom: 4px;
}
.vd-rank-pill {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(245,158,11,.15); border: 1px solid rgba(245,158,11,.3);
  border-radius: 20px; padding: 3px 10px;
  font-size: 0.7rem; font-weight: 700; color: #f59e0b;
}
.vd-stats-row {
  display: flex; gap: 8px; position: relative; z-index: 1;
}
.vd-stat {
  flex: 1; background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 14px; padding: 10px 8px; text-align: center;
}
.vd-stat-val {
  font-size: 1.15rem; font-weight: 900; color: #fff;
  line-height: 1; margin-bottom: 3px;
}
.vd-stat-val.gold { color: #f59e0b; }
.vd-stat-lbl {
  font-size: 0.58rem; font-weight: 700; color: rgba(255,255,255,.45);
  text-transform: uppercase; letter-spacing: 0.07em;
}

/* ── STREAK BAR ── */
.vd-streak {
  background: #fff; border: 1px solid rgba(226,232,240,.8);
  border-radius: 20px; padding: 16px 18px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(15,23,42,.06);
}
.vd-streak-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.vd-streak-title {
  font-size: 0.72rem; font-weight: 800;
  color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;
}
.vd-streak-count {
  font-size: 0.72rem; font-weight: 800; color: #f59e0b;
}
.vd-streak-days { display: flex; gap: 5px; align-items: center; }
.vd-s-day { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
.vd-s-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: #f8fafc; border: 2px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: #94a3b8;
  transition: all .25s;
}
.vd-s-circle.done {
  background: linear-gradient(135deg,#f59e0b,#ef4444);
  border-color: transparent; color: #fff; font-size: 0.75rem;
}
.vd-s-circle.today { box-shadow: 0 0 0 3px rgba(245,158,11,.25); }
.vd-s-lbl { font-size: 0.56rem; color: #94a3b8; font-weight: 600; }

/* ── QUICK ACTIONS ── */
.vd-quick {
  display: flex; gap: 10px; overflow-x: auto;
  padding-bottom: 4px; margin-bottom: 22px;
  scrollbar-width: none; -ms-overflow-style: none;
}
.vd-quick::-webkit-scrollbar { display: none; }
.vd-qa {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  flex-shrink: 0; min-width: 72px;
  cursor: pointer; background: none; border: none; padding: 0;
  font-family: inherit;
}
.vd-qa-icon {
  width: 52px; height: 52px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; border: 1px solid transparent;
  box-shadow: 0 2px 10px rgba(15,23,42,.08);
  transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
}
.vd-qa:active .vd-qa-icon { transform: scale(0.93); }
.vd-qa:hover .vd-qa-icon  { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15,23,42,.13); }
.vd-qa-lbl { font-size: 0.62rem; font-weight: 700; color: #475569; white-space: nowrap; }
.qa-quiz   { background: linear-gradient(135deg,#fef3c7,#fde68a); border-color: rgba(252,211,77,.4); }
.qa-ai     { background: linear-gradient(135deg,#dbeafe,#bfdbfe); border-color: rgba(147,197,253,.4); }
.qa-battle { background: linear-gradient(135deg,#fce7f3,#fbcfe8); border-color: rgba(249,168,212,.4); }
.qa-wheel  { background: linear-gradient(135deg,#d1fae5,#a7f3d0); border-color: rgba(110,231,183,.4); }
.qa-learn  { background: linear-gradient(135deg,#ede9fe,#ddd6fe); border-color: rgba(196,181,253,.4); }
.qa-perks  { background: linear-gradient(135deg,#fff7ed,#fed7aa); border-color: rgba(253,186,116,.4); }

/* ── FEATURED CARDS ── */
.vd-featured {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-bottom: 24px;
}
.vd-feat {
  border-radius: 22px; padding: 20px 16px;
  cursor: pointer; border: 1px solid transparent;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; overflow: hidden;
  box-shadow: 0 2px 12px rgba(15,23,42,.07);
  transition: box-shadow .2s, transform .2s cubic-bezier(.34,1.56,.64,1);
  min-height: 140px;
}
.vd-feat:active { transform: scale(0.97); }
.vd-feat-ai   { background: linear-gradient(145deg,#0a0f2e,#1a1040); border-color: rgba(99,102,241,.3); }
.vd-feat-quiz { background: linear-gradient(145deg,#fffbeb,#fef3c7); border-color: rgba(245,158,11,.3); }
.vd-feat-tag {
  font-size: 0.58rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 3px 8px;
  border-radius: 20px; display: inline-block; width: fit-content;
}
.vd-feat-ai .vd-feat-tag   { background: rgba(99,102,241,.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,.3); }
.vd-feat-quiz .vd-feat-tag { background: rgba(245,158,11,.15); color: #d97706; border: 1px solid rgba(245,158,11,.3); }
.vd-feat-icon { font-size: 1.6rem; }
.vd-feat-title { font-size: 0.9rem; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }
.vd-feat-ai .vd-feat-title   { color: #fff; }
.vd-feat-quiz .vd-feat-title { color: #0f172a; }
.vd-feat-sub  { font-size: 0.68rem; line-height: 1.4; font-weight: 500; }
.vd-feat-ai .vd-feat-sub   { color: rgba(255,255,255,.5); }
.vd-feat-quiz .vd-feat-sub { color: #64748b; }
.vd-feat-arrow {
  position: absolute; bottom: 14px; right: 14px;
  font-size: 0.9rem; opacity: 0.3;
  transition: opacity .2s, transform .2s;
}
.vd-feat:hover .vd-feat-arrow { opacity: 0.8; transform: translateX(3px); }

/* ── CONTINUE LEARNING ── */
.vd-continue {
  background: #fff; border: 1px solid rgba(226,232,240,.8);
  border-radius: 20px; padding: 16px 18px;
  margin-bottom: 22px;
  display: flex; align-items: center; gap: 14px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(15,23,42,.05);
  transition: box-shadow .2s;
}
.vd-continue:hover { box-shadow: 0 4px 20px rgba(15,23,42,.09); }
.vd-continue-icon {
  width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg,#ede9fe,#ddd6fe);
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
}
.vd-continue-info { flex: 1; min-width: 0; }
.vd-continue-label { font-size: 0.6rem; font-weight: 800; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
.vd-continue-title { font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vd-continue-bar { height: 4px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
.vd-continue-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg,#6d28d9,#a78bfa); transition: width .5s ease; }
.vd-continue-arrow { font-size: 1rem; color: #cbd5e1; flex-shrink: 0; }

/* ── SECTION ── */
.vd-section { margin-bottom: 24px; }
.vd-section-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
}
.vd-section-title {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: #64748b;
}
.vd-section-line { flex: 1; height: 1px; background: rgba(226,232,240,.8); }

/* ── GRID CARDS ── */
.vd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.vd-card {
  background: #fff; border: 1px solid rgba(226,232,240,.8);
  border-radius: 18px; padding: 14px 13px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; text-align: left;
  box-shadow: 0 1px 6px rgba(15,23,42,.04);
  transition: box-shadow .18s, transform .18s cubic-bezier(.34,1.56,.64,1);
  width: 100%; font-family: inherit;
}
.vd-card:hover  { box-shadow: 0 4px 16px rgba(15,23,42,.08); }
.vd-card:active { transform: scale(0.96); }
.vd-card-icon {
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.vd-card-text { flex: 1; min-width: 0; }
.vd-card-title { font-size: 0.78rem; font-weight: 800; color: #0f172a; margin-bottom: 2px; letter-spacing: -0.01em; }
.vd-card-sub   { font-size: 0.65rem; color: #64748b; line-height: 1.3; }
.ci-blue   { background: rgba(219,234,254,.8); border: 1px solid rgba(147,197,253,.35); }
.ci-amber  { background: rgba(254,243,199,.8); border: 1px solid rgba(252,211,77,.35);  }
.ci-purple { background: rgba(237,233,254,.8); border: 1px solid rgba(196,181,253,.35); }
.ci-rose   { background: rgba(255,228,230,.8); border: 1px solid rgba(252,165,165,.35); }
.ci-green  { background: rgba(209,250,229,.8); border: 1px solid rgba(110,231,183,.35); }
.ci-orange { background: rgba(255,237,213,.8); border: 1px solid rgba(253,186,116,.35); }

/* ── GET STARTED BANNER ── */
.vd-start {
  background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.06));
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 22px; padding: 20px;
  margin-bottom: 22px;
}
.vd-start-title { font-size: 0.88rem; font-weight: 900; color: #1e1b4b; margin-bottom: 4px; }
.vd-start-sub   { font-size: 0.72rem; color: #64748b; margin-bottom: 14px; line-height: 1.5; }
.vd-start-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.vd-start-item {
  background: #fff; border: 1px solid rgba(226,232,240,.9);
  border-radius: 14px; padding: 12px;
  display: flex; flex-direction: column; gap: 4px;
  cursor: pointer; text-align: left; font-family: inherit;
  box-shadow: 0 1px 4px rgba(15,23,42,.04);
  transition: box-shadow .15s;
}
.vd-start-item:hover { box-shadow: 0 4px 12px rgba(15,23,42,.08); }
.vd-start-item-icon  { font-size: 1.1rem; }
.vd-start-item-title { font-size: 0.76rem; font-weight: 800; color: #0f172a; }
.vd-start-item-perks { font-size: 0.65rem; font-weight: 700; color: #d97706; }

/* ── RESPONSIVE ── */
@media (max-width: 360px) {
  .vd-hero    { border-radius: 20px; padding: 22px 16px 20px; }
  .vd-name    { font-size: 1.3rem; }
  .vd-stat-val { font-size: 1rem; }
  .vd-s-circle { width: 28px; height: 28px; }
  .vd-grid    { gap: 8px; }
  .vd-card    { padding: 11px 10px; }
}
@media (min-width: 540px) {
  .vd-qa-icon { width: 58px; height: 58px; }
  .vd-card    { padding: 16px 14px; }
  .vd-card-icon { width: 46px; height: 46px; }
  .vd-feat    { min-height: 160px; }
}
@media (min-width: 768px) {
  .vd-featured { grid-template-columns: 1fr 1fr 1fr; }
  .vd-grid     { grid-template-columns: 1fr 1fr 1fr; }
  .vd-start-grid { grid-template-columns: repeat(4, 1fr); }
  .vd-hero     { padding: 32px 28px 28px; }
}

@keyframes vdIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
.vd { animation: vdIn .4s cubic-bezier(.16,1,.3,1) both; }
`;

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function UserDashboardContent() {
  const router = useRouter();
  const [profile,    setProfile]    = useState({ name: "", perks: 0, rank: "Learner", avatarUrl: null });
  const [streak,     setStreak]     = useState(0);
  const [weekDays,   setWeekDays]   = useState([]);
  const [lastCourse, setLastCourse] = useState(null);
  const [isNew,      setIsNew]      = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour >= 5  && hour < 12 ? "Good Morning" :
    hour >= 12 && hour < 17 ? "Good Afternoon" :
    hour >= 17 && hour < 21 ? "Good Evening"   : "Good Night";

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

        const [pRes, eRes, sRes, wRes] = await Promise.all([
          supabase.from("users_profiles").select("full_name,total_aidla_perks,rank,avatar_url").eq("user_id", uid).single(),
          supabase.from("course_enrollments").select("course_id,progress,enrolled_at,course_courses(id,title,category)").eq("user_id", uid).order("enrolled_at", { ascending: false }).limit(10),
          supabase.from("daily_quiz_attempts").select("streak_days").eq("user_id", uid).order("attempt_date", { ascending: false }).limit(1).single(),
          supabase.from("daily_quiz_attempts").select("attempt_date").eq("user_id", uid).gte("attempt_date", sevenDaysAgo),
        ]);

        const p = pRes.data || {};
        setProfile({ name: p.full_name || "", perks: p.total_aidla_perks || 0, rank: p.rank || "Learner", avatarUrl: p.avatar_url || null });
        setStreak(sRes.data?.streak_days || 0);

        const doneDates = new Set((wRes.data || []).map(r => r.attempt_date?.slice(0, 10)));
        const today = new Date();
        setWeekDays(Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const iso = d.toISOString().slice(0, 10);
          return { dayOfWeek: d.getDay(), done: doneDates.has(iso), isToday: i === 6 };
        }));

        const enr = eRes.data || [];
        setIsNew(enr.length === 0);
        const last = enr[0];
        if (last?.course_courses) setLastCourse({ ...last.course_courses, progress: last.progress || 0 });
      } catch (_) {}
    })();
  }, []);

  const firstName  = profile.name.split(" ")[0] || "there";
  const perksLabel = profile.perks >= 1000 ? `${(profile.perks / 1000).toFixed(1)}k` : Math.round(profile.perks);

  function go(path) { router.push(path); }

  return (
    <div className="vd">
      <style>{CSS}</style>

      {/* ── HERO ─────────────────────────────────── */}
      <div className="vd-hero">
        <div className="vd-hero-top">
          <Avatar url={profile.avatarUrl} name={profile.name} size={64} />
          <div className="vd-hero-info">
            <div className="vd-greeting">{greeting}</div>
            <div className="vd-name">{firstName}</div>
            <div className="vd-rank-pill">
              <span>📈</span> {profile.rank}
            </div>
          </div>
        </div>
        <div className="vd-stats-row">
          <div className="vd-stat">
            <div className="vd-stat-val gold">{perksLabel}</div>
            <div className="vd-stat-lbl">⭐ Perks</div>
          </div>
          <div className="vd-stat">
            <div className="vd-stat-val">{streak >= 3 ? `🔥 ${streak}` : streak}</div>
            <div className="vd-stat-lbl">Streak</div>
          </div>
          <div className="vd-stat">
            <div className="vd-stat-val" style={{ fontSize: "0.9rem" }}>{weekDays.filter(d => d.done).length}/7</div>
            <div className="vd-stat-lbl">This Week</div>
          </div>
        </div>
      </div>

      {/* ── STREAK ───────────────────────────────── */}
      {weekDays.length > 0 && (
        <div className="vd-streak">
          <div className="vd-streak-head">
            <span className="vd-streak-title">🔥 Weekly Streak</span>
            <span className="vd-streak-count">{streak} day{streak !== 1 ? "s" : ""}</span>
          </div>
          <div className="vd-streak-days">
            {weekDays.map((d, i) => (
              <div className="vd-s-day" key={i}>
                <div className={`vd-s-circle${d.done ? " done" : ""}${d.isToday ? " today" : ""}`}>
                  {d.done ? "✓" : DAY_NAMES[d.dayOfWeek][0]}
                </div>
                <div className="vd-s-lbl">{DAY_NAMES[d.dayOfWeek]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── QUICK ACTIONS ────────────────────────── */}
      <div className="vd-quick">
        {[
          { icon: "❓", label: "Daily Quiz",  cls: "qa-quiz",   path: "/user/dailyquizz" },
          { icon: "🤖", label: "AIDLA AI",    cls: "qa-ai",     path: "/user/aidla-ai"   },
          { icon: "⚔️", label: "Battle",      cls: "qa-battle", path: "/user/battle"     },
          { icon: "📚", label: "Learn",       cls: "qa-learn",  path: "/user/learn"      },
          { icon: "🎡", label: "Perks Spin",  cls: "qa-wheel",  path: "/user/lucky-wheel"},
          { icon: "🎁", label: "Perks Store", cls: "qa-perks",  path: "/user/perks"      },
        ].map(a => (
          <button key={a.path} className="vd-qa" onClick={() => go(a.path)}>
            <div className={`vd-qa-icon ${a.cls}`}>{a.icon}</div>
            <span className="vd-qa-lbl">{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── FEATURED CARDS ───────────────────────── */}
      <div className="vd-featured">
        <button className="vd-feat vd-feat-ai" onClick={() => go("/user/aidla-ai")}>
          <span className="vd-feat-tag">AI Assistant</span>
          <span className="vd-feat-icon">🤖</span>
          <div className="vd-feat-title">AIDLA AI</div>
          <div className="vd-feat-sub">Chat, plan & grow your career smarter</div>
          <span className="vd-feat-arrow">→</span>
        </button>
        <button className="vd-feat vd-feat-quiz" onClick={() => go("/user/dailyquizz")}>
          <span className="vd-feat-tag">Today</span>
          <span className="vd-feat-icon">❓</span>
          <div className="vd-feat-title">Daily Quiz</div>
          <div className="vd-feat-sub">+15 perks · 2 min challenge</div>
          <span className="vd-feat-arrow">→</span>
        </button>
      </div>

      {/* ── CONTINUE LEARNING ────────────────────── */}
      {lastCourse && (
        <button className="vd-continue" onClick={() => go(`/user/course/${lastCourse.id}`)}>
          <div className="vd-continue-icon">📚</div>
          <div className="vd-continue-info">
            <div className="vd-continue-label">Continue Learning</div>
            <div className="vd-continue-title">{lastCourse.title}</div>
            <div className="vd-continue-bar">
              <div className="vd-continue-fill" style={{ width: `${Math.min(100, lastCourse.progress || 0)}%` }} />
            </div>
          </div>
          <span className="vd-continue-arrow">›</span>
        </button>
      )}

      {/* ── GETTING STARTED ──────────────────────── */}
      {isNew && (
        <div className="vd-start">
          <div className="vd-start-title">👋 Welcome to AIDLA</div>
          <div className="vd-start-sub">Complete these to earn perks and unlock your full profile.</div>
          <div className="vd-start-grid">
            {[
              { icon: "❓", title: "Daily Quiz",      desc: "+15 perks",    path: "/user/dailyquizz" },
              { icon: "🎓", title: "Enroll a Course", desc: "+10/lesson",   path: "/user/learn"      },
              { icon: "📝", title: "Build your CV",   desc: "AI-powered",   path: "/user/cv-maker"   },
              { icon: "⚔️", title: "Quiz Battle",     desc: "Win perks",    path: "/user/battle"     },
            ].map(s => (
              <button key={s.path} className="vd-start-item" onClick={() => go(s.path)}>
                <span className="vd-start-item-icon">{s.icon}</span>
                <span className="vd-start-item-title">{s.title}</span>
                <span className="vd-start-item-perks">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── LEARNING ─────────────────────────────── */}
      <div className="vd-section">
        <div className="vd-section-head">
          <span className="vd-section-title">📘 Learning</span>
          <div className="vd-section-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon: "❓", title: "Daily Quiz",   sub: "Daily knowledge challenge",    cls: "ci-blue",   path: "/user/dailyquizz"  },
            { icon: "✅", title: "Assessments",  sub: "Tests & skill evaluations",    cls: "ci-blue",   path: "/user/test"         },
            { icon: "📚", title: "Resources",    sub: "Study materials & past papers", cls: "ci-blue",   path: "/user/resources"   },
            { icon: "🛠️", title: "Projects",     sub: "Project ideas & FYP guidance", cls: "ci-blue",   path: "/user/projects"    },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-card-icon ${c.cls}`}>{c.icon}</div>
              <div className="vd-card-text">
                <div className="vd-card-title">{c.title}</div>
                <div className="vd-card-sub">{c.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CAREER TOOLKIT ───────────────────────── */}
      <div className="vd-section">
        <div className="vd-section-head">
          <span className="vd-section-title">💼 Career Toolkit</span>
          <div className="vd-section-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon: "📝", title: "CV Maker",       sub: "Build & download your CV",      cls: "ci-purple", path: "/user/cv-maker"     },
            { icon: "✉️", title: "Cover Letters",  sub: "AI-crafted letters",            cls: "ci-purple", path: "/user/cover-letter" },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-card-icon ${c.cls}`}>{c.icon}</div>
              <div className="vd-card-text">
                <div className="vd-card-title">{c.title}</div>
                <div className="vd-card-sub">{c.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── PERKS & REWARDS ──────────────────────── */}
      <div className="vd-section">
        <div className="vd-section-head">
          <span className="vd-section-title">⭐ Perks & Rewards</span>
          <div className="vd-section-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon: "⚔️", title: "Battle Arena",  sub: "1v1 quiz battles",             cls: "ci-amber",  path: "/user/battle"      },
            { icon: "🎟️", title: "Learning Draw",  sub: "Draws & learning prizes",      cls: "ci-amber",  path: "/user/lucky-draw"  },
            { icon: "🎡", title: "Perks Spin",     sub: "Spin & win",                   cls: "ci-green",  path: "/user/lucky-wheel" },
            { icon: "🎁", title: "Perks Store",    sub: "Redeem perks for content",     cls: "ci-orange", path: "/user/perks"       },
            { icon: "💬", title: "Community",      sub: "Forum, channels & social",     cls: "ci-rose",   path: "/user/community"   },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-card-icon ${c.cls}`}>{c.icon}</div>
              <div className="vd-card-text">
                <div className="vd-card-title">{c.title}</div>
                <div className="vd-card-sub">{c.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
