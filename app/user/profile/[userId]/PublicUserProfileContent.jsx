"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const RANKS = [
  { key: "learner",    label: "Learner",    icon: "🌱", color: "#059669", bg: "#ECFDF5" },
  { key: "achiever",   label: "Achiever",   icon: "⭐", color: "#D97706", bg: "#FFFBEB" },
  { key: "champion",   label: "Champion",   icon: "🔥", color: "#DC2626", bg: "#FEF2F2" },
  { key: "ambassador", label: "Ambassador", icon: "💎", color: "#7C3AED", bg: "#F5F3FF" },
  { key: "legend",     label: "Legend",     icon: "👑", color: "#B45309", bg: "#FFFBEB" },
];

const CSS = `
.pp-wrap { font-family:'DM Sans',system-ui,sans-serif; color:#0f172a; max-width:680px; margin:0 auto; }
.pp-back { display:inline-flex; margin-bottom:14px; color:#64748b; font-weight:800; text-decoration:none; font-size:.82rem; }
.pp-hero { text-align:center; border-radius:22px; padding:32px 20px 24px; background:linear-gradient(135deg,#0b1437 0%,#1a3a8f 60%,#0b1437 100%); position:relative; margin-bottom:14px; }
.pp-avatar { width:96px; height:96px; border-radius:50%; margin:0 auto 12px; border:3px solid #f59e0b; box-shadow:0 0 0 4px rgba(245,158,11,.25); display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:2.4rem; font-weight:900; color:#fff; background:#1e3a8a; }
.pp-avatar img { width:100%; height:100%; object-fit:cover; }
.pp-name { margin:0 0 6px; font-family:'Playfair Display',serif; font-size:1.55rem; font-weight:900; color:#fff; }
.pp-tick { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; margin-left:6px; border-radius:50%; background:#1877f2; color:#fff; font-size:.75rem; font-weight:900; vertical-align:3px; }
.pp-rank-pill { display:inline-flex; gap:5px; align-items:center; padding:5px 12px; border-radius:999px; font-size:.76rem; font-weight:900; margin-bottom:12px; }
.pp-bio { font-size:.84rem; color:rgba(255,255,255,.7); max-width:400px; margin:0 auto 16px; line-height:1.55; }
.pp-stats { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.pp-stat { text-align:center; min-width:64px; }
.pp-stat-val { font-size:1.3rem; font-weight:900; color:#f59e0b; line-height:1; }
.pp-stat-label { font-size:.66rem; color:rgba(255,255,255,.55); font-weight:700; margin-top:2px; text-transform:uppercase; letter-spacing:.06em; }
.pp-share-btn { margin-top:14px; padding:8px 20px; background:rgba(245,158,11,.15); border:1.5px solid rgba(245,158,11,.4); border-radius:30px; color:#f59e0b; font-weight:800; font-size:.8rem; cursor:pointer; transition:all .15s; }
.pp-share-btn:hover { background:rgba(245,158,11,.25); }

.pp-section { background:#fff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:12px; }
.pp-section-title { font-size:.68rem; font-weight:900; color:#94a3b8; text-transform:uppercase; letter-spacing:.08em; margin:0 0 12px; }

/* Activity heatmap */
.pp-heat { display:flex; gap:3px; flex-wrap:nowrap; overflow-x:auto; }
.pp-heat-col { display:flex; flex-direction:column; gap:3px; }
.pp-heat-cell { width:11px; height:11px; border-radius:2px; flex-shrink:0; }
.pp-heat-cell[data-level="0"] { background:#f1f5f9; }
.pp-heat-cell[data-level="1"] { background:#bfdbfe; }
.pp-heat-cell[data-level="2"] { background:#60a5fa; }
.pp-heat-cell[data-level="3"] { background:#1d4ed8; }
.pp-heat-legend { display:flex; align-items:center; gap:5px; margin-top:8px; font-size:.68rem; color:#94a3b8; }
.pp-heat-legend span { width:10px; height:10px; border-radius:2px; display:inline-block; }

/* Certs */
.pp-certs { display:flex; flex-direction:column; gap:8px; }
.pp-cert { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0; }
.pp-cert-icon { font-size:1.3rem; flex-shrink:0; }
.pp-cert-name { font-size:.84rem; font-weight:800; color:#0f172a; }
.pp-cert-date { font-size:.72rem; color:#94a3b8; }

/* Info grid */
.pp-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.pp-info { background:#f8fafc; border-radius:12px; padding:12px 14px; }
.pp-info-label { font-size:.65rem; color:#94a3b8; font-weight:900; text-transform:uppercase; letter-spacing:.06em; margin-bottom:3px; }
.pp-info-val { font-size:.84rem; font-weight:700; }

/* Share modal */
.pp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px; }
.pp-modal { background:#fff; border-radius:20px; padding:24px; width:100%; max-width:380px; position:relative; }
.pp-modal-close { position:absolute; top:14px; right:16px; background:none; border:none; font-size:1.4rem; cursor:pointer; color:#94a3b8; line-height:1; }
.pp-modal-title { font-size:1rem; font-weight:900; margin:0 32px 14px 0; }
.pp-modal-link { background:#f1f5f9; border-radius:10px; padding:10px 12px; font-size:.82rem; word-break:break-all; color:#1e3a8a; font-weight:700; margin-bottom:12px; }
.pp-modal-btns { display:flex; flex-direction:column; gap:8px; }
.pp-modal-btn { padding:11px; border-radius:10px; border:none; font-weight:800; font-size:.84rem; cursor:pointer; transition:opacity .15s; }
.pp-modal-btn:hover { opacity:.85; }
.pp-modal-btn-copy { background:#1e3a8a; color:#fff; }
.pp-modal-btn-wa { background:#25d366; color:#fff; }
.pp-modal-btn-li { background:#0a66c2; color:#fff; }
.pp-copied { font-size:.76rem; color:#15803d; font-weight:700; text-align:center; margin-top:6px; }

@media(max-width:420px) { .pp-info-grid { grid-template-columns:1fr; } }
`;

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function buildHeatmap(quizDates, lessonDates) {
  const countMap = {};
  [...quizDates, ...lessonDates].forEach(d => {
    const key = d?.slice(0, 10);
    if (key) countMap[key] = (countMap[key] || 0) + 1;
  });
  const weeks = 16;
  const today = new Date();
  const cols = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const key = date.toISOString().slice(0, 10);
      const count = countMap[key] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
      col.push({ key, level });
    }
    cols.push(col);
  }
  return cols;
}

export default function PublicUserProfile() {
  const { userId } = useParams();
  const [profile,  setProfile]  = useState(null);
  const [certs,    setCerts]    = useState([]);
  const [heatCols, setHeatCols] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 112 * 86400000).toISOString().slice(0, 10);
      const [
        { data: prof },
        { data: certData },
        { data: quizData },
        { data: lessonData },
      ] = await Promise.all([
        supabase.from("users_profiles")
          .select("full_name,avatar_url,email,is_verified,rank,profession,city,country,educational_level,institute_company,interests,bio,total_aidla_perks,current_streak,longest_streak,my_refer_code")
          .eq("user_id", userId).single(),
        supabase.from("course_certificates")
          .select("id,issued_at,course_courses(title)")
          .eq("user_id", userId)
          .order("issued_at", { ascending: false })
          .limit(5),
        supabase.from("daily_quiz_attempts")
          .select("quiz_date")
          .eq("user_id", userId)
          .eq("status", "completed")
          .gte("quiz_date", since),
        supabase.from("course_lesson_completion")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", since),
      ]);
      setProfile(prof || null);
      setCerts(certData || []);
      setHeatCols(buildHeatmap(
        (quizData || []).map(r => r.quiz_date),
        (lessonData || []).map(r => r.created_at?.slice(0, 10))
      ));
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div style={{padding:32,textAlign:"center",color:"#94a3b8"}}>Loading profile…</div>;
  if (!profile) return <div style={{padding:32,textAlign:"center",color:"#94a3b8"}}>Profile not found.</div>;

  const rank    = RANKS.find(r => r.key === profile.rank) || RANKS[0];
  const initials = profile.full_name?.[0]?.toUpperCase() || "A";
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/user/profile/${userId}` : "";
  const shareText  = `Check out ${profile.full_name || "this learner"}'s profile on AIDLA — Pakistan's AI learning platform!\n${profileUrl}`;

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="pp-wrap">
      <style>{CSS}</style>
      <Link href="/user/community?tab=forum" className="pp-back">← Back to Community</Link>

      {/* Hero */}
      <div className="pp-hero">
        <div className="pp-avatar">
          {profile.avatar_url
            ? <Image src={profile.avatar_url} alt={profile.full_name || "User"} width={96} height={96} unoptimized />
            : initials}
        </div>
        <h1 className="pp-name">
          {profile.full_name || "AIDLA Learner"}
          {profile.is_verified && <span className="pp-tick">✓</span>}
        </h1>
        <div className="pp-rank-pill" style={{ background: rank.bg, color: rank.color }}>{rank.icon} {rank.label}</div>
        {profile.bio && <p className="pp-bio">{profile.bio}</p>}
        <div className="pp-stats">
          <div className="pp-stat">
            <div className="pp-stat-val">{profile.current_streak || 0}</div>
            <div className="pp-stat-label">🔥 Streak</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-val">{profile.longest_streak || 0}</div>
            <div className="pp-stat-label">Best</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-val">{certs.length}</div>
            <div className="pp-stat-label">Certs</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-val">{profile.total_aidla_perks || 0}</div>
            <div className="pp-stat-label">Perks</div>
          </div>
        </div>
        <button className="pp-share-btn" onClick={() => setShareOpen(true)}>
          Share Profile
        </button>
      </div>

      {/* Activity Heatmap */}
      <div className="pp-section">
        <p className="pp-section-title">Activity — last 16 weeks</p>
        <div className="pp-heat">
          {heatCols.map((col, ci) => (
            <div key={ci} className="pp-heat-col">
              {col.map(cell => (
                <div key={cell.key} className="pp-heat-cell" data-level={cell.level} title={cell.key} />
              ))}
            </div>
          ))}
        </div>
        <div className="pp-heat-legend">
          Less <span style={{background:"#f1f5f9"}} />
          <span style={{background:"#bfdbfe"}} />
          <span style={{background:"#60a5fa"}} />
          <span style={{background:"#1d4ed8"}} /> More
        </div>
      </div>

      {/* Certificates */}
      {certs.length > 0 && (
        <div className="pp-section">
          <p className="pp-section-title">Certificates</p>
          <div className="pp-certs">
            {certs.map(c => (
              <div key={c.id} className="pp-cert">
                <span className="pp-cert-icon">📜</span>
                <div>
                  <div className="pp-cert-name">{c.course_courses?.title || "Certificate"}</div>
                  <div className="pp-cert-date">{fmt(c.issued_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info grid */}
      <div className="pp-section">
        <p className="pp-section-title">About</p>
        <div className="pp-info-grid">
          {[
            ["Field", profile.educational_level],
            ["Institute / Company", profile.institute_company],
            ["Location", [profile.city, profile.country].filter(Boolean).join(", ")],
            ["Interests", profile.interests],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="pp-info">
              <div className="pp-info-label">{label}</div>
              <div className="pp-info-val">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Share modal */}
      {shareOpen && (
        <div className="pp-modal-bg" onClick={e => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="pp-modal">
            <button className="pp-modal-close" onClick={() => setShareOpen(false)}>×</button>
            <h2 className="pp-modal-title">Share this Profile</h2>
            <div className="pp-modal-link">{profileUrl}</div>
            <div className="pp-modal-btns">
              <button className="pp-modal-btn pp-modal-btn-copy" onClick={copyLink}>
                {copied ? "Copied!" : "Copy Profile Link"}
              </button>
              <button className="pp-modal-btn pp-modal-btn-wa" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}>
                Share on WhatsApp
              </button>
              <button className="pp-modal-btn pp-modal-btn-li" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`)}>
                Share on LinkedIn
              </button>
            </div>
            {copied && <p className="pp-copied">Link copied to clipboard!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
