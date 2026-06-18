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
.ach-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
.ach-card { border-radius:18px; padding:20px; border:1.5px solid #e2e8f0; background:#fff; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; }
.ach-card.earned { border-color:#3b82f6; background:linear-gradient(135deg,#eff6ff,#fff); box-shadow:0 4px 20px rgba(59,130,246,.12); }
.ach-card.locked { opacity:.6; }
.ach-card:not(.locked):hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(15,23,42,.1); }
.ach-icon { font-size:2.4rem; line-height:1; margin-bottom:12px; }
.ach-name { font-size:.95rem; font-weight:800; margin:0 0 4px; }
.ach-desc { font-size:.8rem; color:#64748b; margin:0 0 10px; line-height:1.5; }
.ach-status { display:inline-flex; align-items:center; gap:5px; font-size:.76rem; font-weight:700; padding:3px 10px; border-radius:20px; }
.ach-status.done { background:#dbeafe; color:#1e3a8a; }
.ach-status.todo { background:#f1f5f9; color:#94a3b8; }
.ach-date { font-size:.73rem; color:#94a3b8; margin-top:6px; }
.ach-lock { position:absolute; top:14px; right:14px; font-size:1.1rem; opacity:.4; }
.ach-shimmer { background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sh .9s infinite; border-radius:18px; height:160px; }
@keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@media(max-width:640px){ .ach-grid{ grid-template-columns:1fr 1fr; gap:10px; } .ach-card{ padding:14px; } }
@media(max-width:360px){ .ach-grid{ grid-template-columns:1fr; } }
`;

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}

export default function AchievementsContent() {
  const [user,   setUser]   = useState(null);
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: d }) => setUser(d?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const uid = user.id;
      const [
        { count: quizCount },
        { data: streak },
        { count: txnCount },
        { count: enrollCount },
        { count: certCount },
        { data: profile },
      ] = await Promise.all([
        supabase.from("daily_quiz_attempts").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("daily_quiz_attempts").select("streak_days,created_at").eq("user_id",uid).order("created_at",{ascending:false}).limit(1).maybeSingle(),
        supabase.from("users_transactions").select("id",{count:"exact",head:true}).eq("user_id",uid).gt("amount",0),
        supabase.from("course_enrollments").select("id",{count:"exact",head:true}).eq("user_id",uid),
        supabase.from("course_certificates").select("id,created_at",{count:"exact"}).eq("user_id",uid).limit(1),
        supabase.from("users_profiles").select("total_referrals,full_name,bio,avatar_url,rank,is_verified").eq("user_id",uid).maybeSingle(),
      ]);

      const streakDays = streak?.streak_days || 0;
      const profileComplete = !!(profile?.full_name && profile?.bio && profile?.avatar_url && profile?.rank);

      setData({
        quizCount: quizCount || 0,
        streakDays,
        txnCount: txnCount || 0,
        enrollCount: enrollCount || 0,
        certCount: certCount || 0,
        certDate: certCount?.data?.[0]?.created_at || null,
        referrals: profile?.total_referrals || 0,
        profileComplete,
        isVerified: !!profile?.is_verified,
      });
      setLoading(false);
    })();
  }, [user]);

  const achievements = data ? [
    {
      icon: "🎯",
      name: "First Quiz",
      desc: "Complete your very first daily quiz",
      earned: data.quizCount > 0,
    },
    {
      icon: "🔥",
      name: "7-Day Streak",
      desc: "Maintain a 7-day learning streak",
      earned: data.streakDays >= 7,
    },
    {
      icon: "💥",
      name: "30-Day Streak",
      desc: "Maintain a 30-day learning streak",
      earned: data.streakDays >= 30,
    },
    {
      icon: "🪙",
      name: "First Coin",
      desc: "Earn your first AIDLA coin",
      earned: data.txnCount > 0,
    },
    {
      icon: "📚",
      name: "Course Starter",
      desc: "Enroll in your first course",
      earned: data.enrollCount > 0,
    },
    {
      icon: "🎓",
      name: "Graduate",
      desc: "Complete a course and earn a certificate",
      earned: data.certCount > 0,
    },
    {
      icon: "🤝",
      name: "Connector",
      desc: "Refer 10 friends to AIDLA",
      earned: data.referrals >= 10,
    },
    {
      icon: "✅",
      name: "Verified",
      desc: "Complete your profile 100%",
      earned: data.profileComplete,
    },
  ] : [];

  const earned = achievements.filter(a => a.earned).length;

  return (
    <div className="ach-wrap">
      <style>{CSS}</style>
      <div className="ach-head">
        <h1>Achievements</h1>
        <p>Track your milestones and unlock badges as you grow.</p>
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
              <div className="ach-stat-val">{earned}</div>
              <div className="ach-stat-label">Earned</div>
            </div>
            <div className="ach-stat">
              <div className="ach-stat-val">{achievements.length - earned}</div>
              <div className="ach-stat-label">Locked</div>
            </div>
            <div className="ach-stat">
              <div className="ach-stat-val">{Math.round(earned / achievements.length * 100)}%</div>
              <div className="ach-stat-label">Complete</div>
            </div>
          </div>
          <div className="ach-grid">
            {achievements.map(a => (
              <div key={a.name} className={`ach-card ${a.earned ? "earned" : "locked"}`}>
                {!a.earned && <span className="ach-lock">🔒</span>}
                <div className="ach-icon">{a.icon}</div>
                <div className="ach-name">{a.name}</div>
                <div className="ach-desc">{a.desc}</div>
                <span className={`ach-status ${a.earned ? "done" : "todo"}`}>
                  {a.earned ? "✓ Earned" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
