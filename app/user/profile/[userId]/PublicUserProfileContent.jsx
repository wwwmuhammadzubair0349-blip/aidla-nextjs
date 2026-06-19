"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const RANKS = [
  { key: "learner", label: "Learner", icon: "🌱", color: "#059669", bg: "#ECFDF5" },
  { key: "achiever", label: "Achiever", icon: "⭐", color: "#D97706", bg: "#FFFBEB" },
  { key: "champion", label: "Champion", icon: "🔥", color: "#DC2626", bg: "#FEF2F2" },
  { key: "ambassador", label: "Ambassador", icon: "💎", color: "#7C3AED", bg: "#F5F3FF" },
  { key: "legend", label: "Legend", icon: "👑", color: "#B45309", bg: "#FFFBEB" },
];

function maskEmail(email = "") {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 3)}***********@${domain}`;
}

export default function PublicUserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("users_profiles")
        .select("full_name,avatar_url,email,is_verified,rank,profession,city,country,educational_level,institute_company,interests,bio,total_aidla_coins,profile_completion_pct")
        .eq("user_id", userId)
        .single();
      setProfile(data || null);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="pub-profile">Loading profile...</div>;
  if (!profile) return <div className="pub-profile">Profile not found.</div>;

  const rank = RANKS.find(r => r.key === profile.rank) || RANKS[0];
  const initials = profile.full_name?.[0]?.toUpperCase() || "A";

  return (
    <div className="pub-profile">
      <style>{`
        .pub-profile{font-family:'DM Sans',system-ui,sans-serif;color:#0f172a}
        .pub-back{display:inline-flex;margin-bottom:14px;color:#64748b;font-weight:800;text-decoration:none;font-size:.82rem}
        .pub-card{position:relative;text-align:center;border:1px solid rgba(245,158,11,.48);border-radius:20px;padding:28px 18px;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.86),transparent 34%),linear-gradient(135deg,#fffaf0,#fef3c7 55%,#fcd34d);box-shadow:0 20px 56px rgba(146,64,14,.16);overflow:hidden}
        .pub-avatar{width:104px;height:104px;border-radius:50%;margin:0 auto 12px;background:#fff;border:4px solid #fff;box-shadow:0 10px 26px rgba(15,23,42,.16);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:2.5rem;font-weight:900}
        .pub-avatar img{width:100%;height:100%;object-fit:cover}
        .pub-name{margin:0;font:900 clamp(1.45rem,7vw,2.15rem) 'Playfair Display',Georgia,serif;line-height:1.1}
        .pub-tick{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-left:7px;border-radius:50%;background:#1877f2;color:#fff;font:900 .85rem system-ui;vertical-align:4px}
        .pub-rank{display:inline-flex;gap:5px;align-items:center;margin-top:9px;padding:6px 12px;border-radius:999px;border:1px solid rgba(15,23,42,.08);font-size:.78rem;font-weight:900}
        .pub-meta{max-width:620px;margin:14px auto 0;color:#475569;line-height:1.6;font-size:.9rem}
        .pub-grid{display:grid;gap:10px;margin-top:16px}
        .pub-info{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:14px}
        .pub-label{font-size:.68rem;color:#94a3b8;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
        .pub-value{font-size:.88rem;font-weight:800;line-height:1.45}
        @media(min-width:640px){.pub-grid{grid-template-columns:repeat(2,1fr)}.pub-card{padding:34px 24px}}
        @media(max-width:360px){.pub-card{padding:24px 12px}}
      `}</style>
      <Link href="/user/forum" className="pub-back">← Back to Forum</Link>
      <section className="pub-card">
        <div className="pub-avatar">
          {profile.avatar_url ? <Image src={profile.avatar_url} alt={profile.full_name || "User"} width={104} height={104} unoptimized /> : initials}
        </div>
        <h1 className="pub-name">
          {profile.full_name || "AIDLA Learner"}
          {profile.is_verified && <span className="pub-tick">✓</span>}
        </h1>
        <div className="pub-rank" style={{ background: rank.bg, color: rank.color }}>{rank.icon} {rank.label}</div>
        <p className="pub-meta">
          {[profile.profession, profile.city, profile.country].filter(Boolean).join(" · ") || "AIDLA learner"}
          {profile.bio ? ` · ${profile.bio}` : ""}
        </p>
      </section>
      <div className="pub-grid">
        {[
          ["Education", profile.educational_level || "Not added"],
          ["Institute / Company", profile.institute_company || "Not added"],
          ["Interests", profile.interests || "Not added"],
          ["Email", maskEmail(profile.email) || "Hidden"],
        ].map(([label, value]) => (
          <div className="pub-info" key={label}>
            <div className="pub-label">{label}</div>
            <div className="pub-value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
