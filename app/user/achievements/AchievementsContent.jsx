"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.ach-wrap { font-family:'DM Sans',system-ui,sans-serif; color:#0f172a; }
.ach-head { margin-bottom:24px; }
.ach-head h1 { font-size:1.5rem; font-weight:900; margin:0 0 4px; }
.ach-head p { font-size:.88rem; color:#64748b; margin:0; }
.ach-stats { display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
.ach-stat { flex:1; min-width:100px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:14px 16px; text-align:center; }
.ach-stat-val { font-size:1.6rem; font-weight:900; color:#1e3a8a; line-height:1; }
.ach-stat-label { font-size:.76rem; color:#64748b; font-weight:600; margin-top:3px; }
.ach-filter { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px; }
.ach-filter-btn { padding:5px 13px; border-radius:20px; border:1.5px solid #e2e8f0; background:#fff; font-size:.76rem; font-weight:700; color:#64748b; cursor:pointer; transition:all .15s; }
.ach-filter-btn.active { background:#1e3a8a; color:#fff; border-color:#1e3a8a; }
.ach-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
.ach-card { border-radius:18px; padding:20px; border:1.5px solid #e2e8f0; background:#fff; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; }
.ach-card.earned { border-color:#3b82f6; background:linear-gradient(135deg,#eff6ff,#fff); box-shadow:0 4px 20px rgba(59,130,246,.12); }
.ach-card.locked { opacity:.55; }
.ach-card.new-earn { border-color:#f59e0b; background:linear-gradient(135deg,#fffbeb,#fff); box-shadow:0 4px 20px rgba(245,158,11,.18); }
.ach-card:not(.locked):hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(15,23,42,.1); }
.ach-icon { font-size:2.4rem; line-height:1; margin-bottom:12px; }
.ach-name { font-size:.95rem; font-weight:800; margin:0 0 4px; }
.ach-desc { font-size:.8rem; color:#64748b; margin:0 0 10px; line-height:1.5; }
.ach-reward { font-size:.73rem; color:#f59e0b; font-weight:700; margin-bottom:8px; }
.ach-status { display:inline-flex; align-items:center; gap:5px; font-size:.76rem; font-weight:700; padding:3px 10px; border-radius:20px; }
.ach-status.done { background:#dbeafe; color:#1e3a8a; }
.ach-status.todo { background:#f1f5f9; color:#94a3b8; }
.ach-date { font-size:.73rem; color:#94a3b8; margin-top:6px; }
.ach-lock { position:absolute; top:14px; right:14px; font-size:1.1rem; opacity:.4; }
.ach-new { position:absolute; top:12px; right:12px; background:#f59e0b; color:#fff; font-size:.65rem; font-weight:900; padding:2px 8px; border-radius:20px; }
.ach-shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sh .9s infinite; border-radius:18px; height:160px; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@media(max-width:640px){ .ach-grid{ grid-template-columns:1fr 1fr; gap:10px; } .ach-card{ padding:14px; } }
@media(max-width:360px){ .ach-grid{ grid-template-columns:1fr; } }
`;

const CAT_LABELS = { all:"All", learning:"Learning", competition:"Competition", community:"Community", career:"Career", milestone:"Milestone" };

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default function AchievementsContent() {
  const [user,    setUser]    = useState(null);
  const [defs,    setDefs]    = useState([]);
  const [earned,  setEarned]  = useState([]);
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [newIds,  setNewIds]  = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: d }) => setUser(d?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const uid = user.id;

      const [
        { data: defData },
        { data: earnedData },
        { count: quizCount },
        { data: streakRow },
        { count: enrollCount },
        { count: certCount },
        { data: profile },
        { count: lessonCount },
        { data: battleWinRow },
      ] = await Promise.all([
        supabase.from("achievement_definitions").select("*").eq("is_active", true).order("category"),
        supabase.from("user_achievements").select("achievement_id, earned_at").eq("user_id", uid),
        supabase.from("daily_quiz_attempts").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("daily_quiz_attempts").select("streak_days").eq("user_id",uid).order("created_at",{ascending:false}).limit(1).maybeSingle(),
        supabase.from("course_enrollments").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("course_certificates").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("users_profiles").select("total_referrals,full_name,bio,avatar_url,rank,is_verified,total_aidla_perks").eq("user_id",uid).maybeSingle(),
        supabase.from("course_lesson_completion").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("battle_rooms").select("id",{count:"exact",head:true}).eq("winner_user_id",uid),
      ]);

      const streakDays   = streakRow?.streak_days || 0;
      const certCompleted = certCount || 0;
      const battleWins   = battleWinRow?.length ?? 0;
      const referrals    = profile?.total_referrals || 0;
      const profileComplete = !!(profile?.full_name && profile?.avatar_url);

      const raw = {
        profile_complete: profileComplete ? 1 : 0,
        course_enrollments: enrollCount || 0,
        lesson_completions: lessonCount || 0,
        course_completions: certCompleted,
        quiz_attempts: quizCount || 0,
        quiz_streak: streakDays,
        battle_wins: battleWins,
        certificates: certCompleted,
        referrals,
        cv_created: 0,
        leaderboard_rank: parseInt(profile?.rank?.replace(/[^0-9]/g, "") || "9999") || 9999,
      };

      setDefs(defData || []);
      setRawData(raw);

      const earnedMap = new Map((earnedData || []).map(e => [e.achievement_id, e.earned_at]));
      setEarned(earnedMap);

      // Check for newly unlocked achievements and persist them
      const toUnlock = (defData || []).filter(d => {
        if (earnedMap.has(d.id)) return false;
        const val = raw[d.requirement_type] ?? 0;
        if (d.requirement_type === "leaderboard_rank") return val <= d.requirement_value;
        return val >= d.requirement_value;
      });

      if (toUnlock.length > 0) {
        const insertRows = toUnlock.map(d => ({ user_id: uid, achievement_id: d.id }));
        const { data: inserted } = await supabase.from("user_achievements").upsert(insertRows, { onConflict: "user_id,achievement_id" }).select("achievement_id");
        if (inserted?.length) {
          setNewIds(inserted.map(r => r.achievement_id));
          const newMap = new Map(earnedMap);
          inserted.forEach(r => newMap.set(r.achievement_id, new Date().toISOString()));
          setEarned(newMap);
        }
      }

      setLoading(false);
    })();
  }, [user]);

  const cats = ["all", ...new Set((defs).map(d => d.category))];

  const visible = defs.filter(d => filter === "all" || d.category === filter);
  const earnedCount = defs.filter(d => earned.has(d.id)).length;

  function isEarned(d) {
    return earned.has(d.id);
  }

  return (
    <div className="ach-wrap">
      <style>{CSS}</style>
      <div className="ach-head">
        <h1>Achievements</h1>
        <p>Track your milestones and unlock badges as you grow on AIDLA.</p>
      </div>

      {loading ? (
        <>
          <div className="ach-stats">
            {[1,2,3].map(i => <div key={i} className="ach-shimmer" style={{height:70}} />)}
          </div>
          <div className="ach-grid">
            {Array.from({length:8}).map((_,i) => <div key={i} className="ach-shimmer" />)}
          </div>
        </>
      ) : (
        <>
          <div className="ach-stats">
            <div className="ach-stat">
              <div className="ach-stat-val">{earnedCount}</div>
              <div className="ach-stat-label">Earned</div>
            </div>
            <div className="ach-stat">
              <div className="ach-stat-val">{defs.length - earnedCount}</div>
              <div className="ach-stat-label">Locked</div>
            </div>
            <div className="ach-stat">
              <div className="ach-stat-val">{defs.length ? Math.round(earnedCount / defs.length * 100) : 0}%</div>
              <div className="ach-stat-label">Complete</div>
            </div>
          </div>

          <div className="ach-filter">
            {cats.map(c => (
              <button key={c} className={`ach-filter-btn${filter===c?" active":""}`} onClick={() => setFilter(c)}>
                {CAT_LABELS[c] || c}
              </button>
            ))}
          </div>

          <div className="ach-grid">
            {visible.map(d => {
              const e = isEarned(d);
              const isNew = newIds.includes(d.id);
              return (
                <div key={d.id} className={`ach-card ${e ? (isNew ? "new-earn" : "earned") : "locked"}`}>
                  {isNew && <span className="ach-new">NEW!</span>}
                  {!e && !isNew && <span className="ach-lock">🔒</span>}
                  <div className="ach-icon">{d.icon}</div>
                  <div className="ach-name">{d.name}</div>
                  <div className="ach-desc">{d.description}</div>
                  {d.coin_reward > 0 && <div className="ach-reward">+{d.coin_reward} perks</div>}
                  <span className={`ach-status ${e ? "done" : "todo"}`}>
                    {e ? "✓ Earned" : "Locked"}
                  </span>
                  {e && earned.get(d.id) && (
                    <div className="ach-date">{fmt(earned.get(d.id))}</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
