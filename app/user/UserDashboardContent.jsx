"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function Avatar({ url, name, size = 64 }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "U";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: url ? "transparent" : "linear-gradient(135deg,#f59e0b,#d97706)",
      border: "3px solid #f59e0b",
      boxShadow: "0 0 0 3px rgba(245,158,11,.2), 0 6px 20px rgba(0,0,0,.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: size * 0.35, fontWeight: 900, color: "#fff" }}>{initials}</span>
      }
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.vd { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; animation: vdIn .35s cubic-bezier(.16,1,.3,1) both; }
@keyframes vdIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

/* HERO */
.vd-hero {
  background: linear-gradient(160deg, #09102b 0%, #0d1b4b 50%, #18103a 100%);
  border-radius: 26px; padding: 22px 20px 20px;
  margin-bottom: 16px; position: relative; overflow: hidden;
}
.vd-hero::before {
  content:''; position:absolute; top:-50px; right:-50px;
  width:200px; height:200px;
  background:radial-gradient(circle,rgba(245,158,11,.18) 0%,transparent 70%);
  pointer-events:none;
}
.vd-hero-top { display:flex; align-items:center; gap:14px; margin-bottom:16px; position:relative; z-index:1; }
.vd-hero-name { font-size:1.45rem; font-weight:900; color:#fff; letter-spacing:-0.04em; line-height:1.1; }
.vd-hero-rank {
  display:inline-flex; align-items:center; gap:4px; margin-top:4px;
  background:rgba(245,158,11,.15); border:1px solid rgba(245,158,11,.3);
  border-radius:20px; padding:3px 10px;
  font-size:0.68rem; font-weight:700; color:#f59e0b;
}
.vd-stats-row { display:flex; gap:8px; position:relative; z-index:1; }
.vd-stat {
  flex:1; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.09);
  border-radius:14px; padding:10px 8px; text-align:center;
}
.vd-stat-val { font-size:1.15rem; font-weight:900; color:#fff; line-height:1; margin-bottom:3px; }
.vd-stat-val.gold { color:#f59e0b; }
.vd-stat-lbl { font-size:0.58rem; font-weight:700; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:.07em; }

/* STREAK */
.vd-streak {
  background:#fff; border:1px solid rgba(226,232,240,.8);
  border-radius:20px; padding:16px 18px; margin-bottom:18px;
  box-shadow:0 2px 10px rgba(15,23,42,.05);
}
.vd-streak-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.vd-streak-title { font-size:0.7rem; font-weight:800; color:#64748b; letter-spacing:.08em; text-transform:uppercase; }
.vd-streak-count { font-size:0.7rem; font-weight:800; color:#f59e0b; }
.vd-streak-days { display:flex; gap:4px; }
.vd-s-day { display:flex; flex-direction:column; align-items:center; gap:3px; flex:1; }
.vd-s-circle {
  width:30px; height:30px; border-radius:50%;
  background:#f8fafc; border:2px solid #e2e8f0;
  display:flex; align-items:center; justify-content:center;
  font-size:0.58rem; font-weight:700; color:#94a3b8; transition:all .2s;
}
.vd-s-circle.done { background:linear-gradient(135deg,#f59e0b,#ef4444); border-color:transparent; color:#fff; font-size:.72rem; }
.vd-s-circle.today { box-shadow:0 0 0 3px rgba(245,158,11,.22); }
.vd-s-lbl { font-size:0.55rem; color:#94a3b8; font-weight:600; }

/* QUICK ACTIONS */
.vd-quick {
  display:flex; gap:10px; overflow-x:auto; padding-bottom:4px; margin-bottom:20px;
  scrollbar-width:none; -ms-overflow-style:none;
}
.vd-quick::-webkit-scrollbar { display:none; }
.vd-qa {
  display:flex; flex-direction:column; align-items:center; gap:6px;
  flex-shrink:0; min-width:66px; cursor:pointer;
  background:none; border:none; padding:0; font-family:inherit;
}
.vd-qa-icon {
  width:52px; height:52px; border-radius:16px;
  display:flex; align-items:center; justify-content:center; font-size:1.35rem;
  border:1px solid transparent; box-shadow:0 2px 8px rgba(15,23,42,.08);
  transition:transform .2s cubic-bezier(.34,1.56,.64,1);
}
.vd-qa:active .vd-qa-icon { transform:scale(.92); }
.vd-qa:hover  .vd-qa-icon { transform:translateY(-2px); }
.vd-qa-lbl { font-size:0.61rem; font-weight:700; color:#475569; white-space:nowrap; }
.qa-1 { background:linear-gradient(135deg,#fef3c7,#fde68a); border-color:rgba(252,211,77,.4); }
.qa-2 { background:linear-gradient(135deg,#dbeafe,#bfdbfe); border-color:rgba(147,197,253,.4); }
.qa-3 { background:linear-gradient(135deg,#ede9fe,#ddd6fe); border-color:rgba(196,181,253,.4); }
.qa-4 { background:linear-gradient(135deg,#fce7f3,#fbcfe8); border-color:rgba(249,168,212,.4); }
.qa-5 { background:linear-gradient(135deg,#d1fae5,#a7f3d0); border-color:rgba(110,231,183,.4); }
.qa-6 { background:linear-gradient(135deg,#fff7ed,#fed7aa); border-color:rgba(253,186,116,.4); }

/* CONTINUE LEARNING */
.vd-continue {
  background:#fff; border:1px solid rgba(226,232,240,.8);
  border-radius:18px; padding:14px 16px; margin-bottom:20px;
  display:flex; align-items:center; gap:12px; cursor:pointer;
  box-shadow:0 2px 8px rgba(15,23,42,.05); transition:box-shadow .2s;
  width:100%; font-family:inherit; text-align:left;
}
.vd-continue:hover { box-shadow:0 4px 18px rgba(15,23,42,.09); }
.vd-cont-icon {
  width:44px; height:44px; border-radius:13px; flex-shrink:0;
  background:linear-gradient(135deg,#ede9fe,#ddd6fe);
  display:flex; align-items:center; justify-content:center; font-size:1.2rem;
}
.vd-cont-info { flex:1; min-width:0; }
.vd-cont-label { font-size:0.58rem; font-weight:800; color:#6d28d9; text-transform:uppercase; letter-spacing:.08em; margin-bottom:2px; }
.vd-cont-title { font-size:0.8rem; font-weight:700; color:#0f172a; margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.vd-cont-bar { height:4px; background:#f1f5f9; border-radius:4px; overflow:hidden; }
.vd-cont-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,#6d28d9,#a78bfa); }
.vd-cont-arrow { font-size:1.1rem; color:#cbd5e1; flex-shrink:0; }

/* GET STARTED */
.vd-start {
  background:linear-gradient(135deg,rgba(99,102,241,.07),rgba(168,85,247,.05));
  border:1px solid rgba(99,102,241,.18); border-radius:20px; padding:18px; margin-bottom:20px;
}
.vd-start-title { font-size:0.86rem; font-weight:900; color:#1e1b4b; margin-bottom:3px; }
.vd-start-sub   { font-size:0.7rem; color:#64748b; margin-bottom:12px; line-height:1.5; }
.vd-start-grid  { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.vd-start-item {
  background:#fff; border:1px solid rgba(226,232,240,.9); border-radius:14px; padding:12px;
  display:flex; flex-direction:column; gap:3px; cursor:pointer; text-align:left;
  font-family:inherit; box-shadow:0 1px 4px rgba(15,23,42,.04); transition:box-shadow .15s;
}
.vd-start-item:hover { box-shadow:0 4px 12px rgba(15,23,42,.08); }
.vd-si-icon  { font-size:1rem; }
.vd-si-title { font-size:0.74rem; font-weight:800; color:#0f172a; }
.vd-si-perks { font-size:0.63rem; font-weight:700; color:#d97706; }

/* SECTIONS */
.vd-section { margin-bottom:22px; }
.vd-sec-head { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.vd-sec-title { font-size:0.66rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#64748b; white-space:nowrap; }
.vd-sec-line  { flex:1; height:1px; background:rgba(226,232,240,.8); }
.vd-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.vd-card {
  background:#fff; border:1px solid rgba(226,232,240,.8); border-radius:16px; padding:13px 12px;
  display:flex; align-items:center; gap:11px; cursor:pointer; text-align:left;
  box-shadow:0 1px 4px rgba(15,23,42,.04); transition:box-shadow .18s,transform .15s;
  width:100%; font-family:inherit;
}
.vd-card:hover  { box-shadow:0 4px 14px rgba(15,23,42,.08); }
.vd-card:active { transform:scale(.96); }
.vd-ci {
  width:40px; height:40px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:1.05rem;
}
.vd-card-title { font-size:0.76rem; font-weight:800; color:#0f172a; margin-bottom:1px; }
.vd-card-sub   { font-size:0.63rem; color:#64748b; line-height:1.3; }
.ci-b { background:rgba(219,234,254,.8); border:1px solid rgba(147,197,253,.35); }
.ci-p { background:rgba(237,233,254,.8); border:1px solid rgba(196,181,253,.35); }
.ci-a { background:rgba(254,243,199,.8); border:1px solid rgba(252,211,77,.35);  }
.ci-g { background:rgba(209,250,229,.8); border:1px solid rgba(110,231,183,.35); }
.ci-r { background:rgba(255,228,230,.8); border:1px solid rgba(252,165,165,.35); }
.ci-o { background:rgba(255,237,213,.8); border:1px solid rgba(253,186,116,.35); }

/* RESPONSIVE */
@media(max-width:360px){
  .vd-hero{border-radius:20px;padding:18px 14px 16px;}
  .vd-hero-name{font-size:1.25rem;}
  .vd-s-circle{width:26px;height:26px;}
}
@media(min-width:540px){
  .vd-qa-icon{width:58px;height:58px;}
}
@media(min-width:768px){
  .vd-grid{grid-template-columns:1fr 1fr 1fr;}
  .vd-start-grid{grid-template-columns:repeat(4,1fr);}
}
`;

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function UserDashboardContent() {
  const router = useRouter();
  const [profile,    setProfile]    = useState({ name: "", perks: 0, rank: "Learner", avatarUrl: null });
  const [streak,     setStreak]     = useState(0);
  const [weekDays,   setWeekDays]   = useState([]);
  const [lastCourse, setLastCourse] = useState(null);
  const [isNew,      setIsNew]      = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;
        const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
        const [pRes, eRes, wRes] = await Promise.all([
          supabase.from("users_profiles").select("full_name,total_aidla_perks,rank,avatar_url,current_streak").eq("user_id", uid).single(),
          supabase.from("course_enrollments").select("course_id,progress,enrolled_at,course_courses(id,title,category)").eq("user_id", uid).order("enrolled_at", { ascending: false }).limit(10),
          supabase.from("daily_quiz_attempts").select("attempt_date").eq("user_id", uid).gte("attempt_date", sevenDaysAgo),
        ]);
        const p = pRes.data || {};
        setProfile({ name: p.full_name || "", perks: p.total_aidla_perks || 0, rank: p.rank || "Learner", avatarUrl: p.avatar_url || null });
        setStreak(p.current_streak || 0);
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

  function go(p) { router.push(p); }

  return (
    <div className="vd">
      <style>{CSS}</style>

      {/* HERO — no greeting (header already has it) */}
      <div className="vd-hero">
        <div className="vd-hero-top">
          <Avatar url={profile.avatarUrl} name={profile.name} size={62} />
          <div>
            <div className="vd-hero-name">{firstName}</div>
            <div className="vd-hero-rank">📈 {profile.rank}</div>
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

      {/* STREAK */}
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

      {/* QUICK ACTIONS — shortcuts only, unique destinations */}
      <div className="vd-quick">
        {[
          { icon:"❓", label:"Daily Quiz",  cls:"qa-1", path:"/user/dailyquizz"  },
          { icon:"🤖", label:"AIDLA AI",    cls:"qa-2", path:"/user/aidla-ai"    },
          { icon:"📚", label:"Learn",       cls:"qa-3", path:"/user/learn"        },
          { icon:"⚔️", label:"Battle",      cls:"qa-4", path:"/user/battle"       },
          { icon:"🎡", label:"Lucky Wheel", cls:"qa-5", path:"/user/lucky-wheel"  },
          { icon:"🎁", label:"Perks Store", cls:"qa-6", path:"/user/perks"        },
        ].map(a => (
          <button key={a.path} className="vd-qa" onClick={() => go(a.path)}>
            <div className={`vd-qa-icon ${a.cls}`}>{a.icon}</div>
            <span className="vd-qa-lbl">{a.label}</span>
          </button>
        ))}
      </div>

      {/* CONTINUE LEARNING */}
      {lastCourse && (
        <button className="vd-continue" onClick={() => go(`/user/course/${lastCourse.id}`)}>
          <div className="vd-cont-icon">📚</div>
          <div className="vd-cont-info">
            <div className="vd-cont-label">Continue Learning</div>
            <div className="vd-cont-title">{lastCourse.title}</div>
            <div className="vd-cont-bar">
              <div className="vd-cont-fill" style={{ width:`${Math.min(100, lastCourse.progress || 0)}%` }} />
            </div>
          </div>
          <span className="vd-cont-arrow">›</span>
        </button>
      )}

      {/* GET STARTED — new users only */}
      {isNew && (
        <div className="vd-start">
          <div className="vd-start-title">👋 Welcome to AIDLA</div>
          <div className="vd-start-sub">Complete these to earn perks and unlock your full profile.</div>
          <div className="vd-start-grid">
            {[
              { icon:"❓", title:"Daily Quiz",     perks:"+15 perks",  path:"/user/dailyquizz"  },
              { icon:"🎓", title:"Enroll a Course", perks:"+10/lesson", path:"/user/learn"        },
              { icon:"📝", title:"Build your CV",   perks:"AI-powered", path:"/user/cv-maker"     },
              { icon:"⚔️", title:"Quiz Battle",     perks:"Win perks",  path:"/user/battle"       },
            ].map(s => (
              <button key={s.path} className="vd-start-item" onClick={() => go(s.path)}>
                <span className="vd-si-icon">{s.icon}</span>
                <span className="vd-si-title">{s.title}</span>
                <span className="vd-si-perks">{s.perks}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* LEARNING — no Daily Quiz (it's in Quick Actions) */}
      <div className="vd-section">
        <div className="vd-sec-head">
          <span className="vd-sec-title">📘 Learning</span>
          <div className="vd-sec-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon:"✅", title:"Assessments",  sub:"Tests & skill evaluations",     cls:"ci-b", path:"/user/test"         },
            { icon:"📄", title:"Resources",    sub:"Study materials & past papers",  cls:"ci-b", path:"/user/resources"    },
            { icon:"🛠️", title:"Projects",     sub:"Project ideas & FYP guidance",  cls:"ci-b", path:"/user/projects"     },
            { icon:"🎓", title:"Browse Courses",sub:"Free & paid courses",           cls:"ci-b", path:"/user/learn"        },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-ci ${c.cls}`}>{c.icon}</div>
              <div><div className="vd-card-title">{c.title}</div><div className="vd-card-sub">{c.sub}</div></div>
            </button>
          ))}
        </div>
      </div>

      {/* CAREER */}
      <div className="vd-section">
        <div className="vd-sec-head">
          <span className="vd-sec-title">💼 Career Toolkit</span>
          <div className="vd-sec-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon:"📝", title:"CV Maker",      sub:"Build & download your CV",  cls:"ci-p", path:"/user/cv-maker"     },
            { icon:"✉️", title:"Cover Letters", sub:"AI-crafted letters",        cls:"ci-p", path:"/user/cover-letter" },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-ci ${c.cls}`}>{c.icon}</div>
              <div><div className="vd-card-title">{c.title}</div><div className="vd-card-sub">{c.sub}</div></div>
            </button>
          ))}
        </div>
      </div>

      {/* PERKS & COMMUNITY — no Battle/Wheel/Perks duplication with quick actions, but they belong here as the full menu */}
      <div className="vd-section">
        <div className="vd-sec-head">
          <span className="vd-sec-title">⭐ Perks & Community</span>
          <div className="vd-sec-line" />
        </div>
        <div className="vd-grid">
          {[
            { icon:"⚔️", title:"Battle Arena",  sub:"1v1 quiz battles",          cls:"ci-a", path:"/user/battle"       },
            { icon:"🎟️", title:"Lucky Draw",    sub:"Draws & prizes",            cls:"ci-a", path:"/user/lucky-draw"   },
            { icon:"🎡", title:"Lucky Wheel",   sub:"Spin & win",                cls:"ci-g", path:"/user/lucky-wheel"  },
            { icon:"🎁", title:"Perks Store",   sub:"Redeem perks for content",  cls:"ci-o", path:"/user/perks"        },
            { icon:"💬", title:"Community",     sub:"Forum & social",            cls:"ci-r", path:"/user/community"    },
          ].map(c => (
            <button key={c.path} className="vd-card" onClick={() => go(c.path)}>
              <div className={`vd-ci ${c.cls}`}>{c.icon}</div>
              <div><div className="vd-card-title">{c.title}</div><div className="vd-card-sub">{c.sub}</div></div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
