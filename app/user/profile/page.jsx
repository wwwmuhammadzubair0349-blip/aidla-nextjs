"use client";
// app/user/profile/page.jsx
// Tabs: Profile · Certificates · Wallet
// Features: completion tracker, blue tick popup, rank badges,
//           achievements, sharable social card, wallet link card
// Zero SSR — all client side. Mobile first 320px+

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import MyCertificates from "@/components/MyCertificates";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */

const COMPLETION_FIELDS = [
  { key: "avatar_url",        label: "Profile Photo",      icon: "📸" },
  { key: "full_name",         label: "Full Name",           icon: "👤" },
  { key: "phone",             label: "Phone Number",        icon: "📱" },
  { key: "date_of_birth",     label: "Date of Birth",       icon: "🎂" },
  { key: "city",              label: "City",                icon: "🏙️" },
  { key: "country",           label: "Country",             icon: "🌍" },
  { key: "educational_level", label: "Educational Level",   icon: "🎓" },
  { key: "profession",        label: "Profession",          icon: "💼" },
  { key: "bio",               label: "Bio",                 icon: "✍️" },
];

const RANKS = [
  { key: "learner",    label: "Learner",    icon: "🌱", color: "#059669", bg: "#ECFDF5", minReferrals: 0,   minStreak: 0  },
  { key: "achiever",   label: "Achiever",   icon: "⭐", color: "#D97706", bg: "#FFFBEB", minReferrals: 5,   minStreak: 7  },
  { key: "champion",   label: "Champion",   icon: "🔥", color: "#DC2626", bg: "#FEF2F2", minReferrals: 15,  minStreak: 30 },
  { key: "ambassador", label: "Ambassador", icon: "💎", color: "#7C3AED", bg: "#F5F3FF", minReferrals: 50,  minStreak: 0  },
  { key: "legend",     label: "Legend",     icon: "👑", color: "#B45309", bg: "#FFFBEB", minReferrals: 100, minStreak: 0  },
];

const ACHIEVEMENTS = [
  { key: "first_quiz",      label: "First Quiz",       icon: "🎯", desc: "Complete your first daily quiz"         },
  { key: "streak_7",        label: "7 Day Streak",      icon: "🔥", desc: "7 consecutive quiz days"               },
  { key: "streak_30",       label: "30 Day Streak",     icon: "⚡", desc: "30 consecutive quiz days"              },
  { key: "first_coin",      label: "First Coin",        icon: "🪙", desc: "Earn your first AIDLA Coin"            },
  { key: "first_referral",  label: "First Referral",    icon: "🤝", desc: "Invite your first person"              },
  { key: "course_starter",  label: "Course Starter",    icon: "📚", desc: "Enroll in your first course"          },
  { key: "graduate",        label: "Graduate",          icon: "🎓", desc: "Complete a course and earn a cert"     },
  { key: "connector",       label: "Connector",         icon: "👥", desc: "Reach 10 referrals"                    },
  { key: "ambassador_ach",  label: "Ambassador",        icon: "💎", desc: "Reach 50 referrals + 2 certificates"  },
  { key: "verified",        label: "Verified",          icon: "✅", desc: "Complete your profile 100%"            },
];

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */

function calcCompletion(profile) {
  if (!profile) return 0;
  const filled = COMPLETION_FIELDS.filter(({ key }) => {
    const v = profile[key];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length;
  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

function getMissing(profile) {
  if (!profile) return COMPLETION_FIELDS;
  return COMPLETION_FIELDS.filter(({ key }) => {
    const v = profile[key];
    return !v || String(v).trim() === "";
  });
}

function computeRank(referrals = 0, streak = 0) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (referrals >= r.minReferrals && (r.minStreak === 0 || streak >= r.minStreak)) {
      rank = r;
    }
  }
  return rank;
}

function maskEmail(email = "") {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 3)}***********@${domain}`;
}

function computeAchievements(profile, quizData, enrollments, certs) {
  const toEarn = new Set();

  const referrals   = profile?.my_referals    || 0;
  const coins       = profile?.total_aidla_coins || 0;
  const streak      = quizData?.maxStreak      || 0;
  const quizCount   = quizData?.totalQuizzes   || 0;
  const certCount   = certs?.length            || 0;
  const courseCount = enrollments?.length      || 0;
  const completedCourses = enrollments?.filter(e => e.completed_at)?.length || 0;

  if (quizCount > 0)    toEarn.add("first_quiz");
  if (streak >= 7)      toEarn.add("streak_7");
  if (streak >= 30)     toEarn.add("streak_30");
  if (coins > 0)        toEarn.add("first_coin");
  if (referrals >= 1)   toEarn.add("first_referral");
  if (courseCount >= 1) toEarn.add("course_starter");
  if (completedCourses >= 1 && certCount >= 1) toEarn.add("graduate");
  if (referrals >= 10)  toEarn.add("connector");
  if (referrals >= 50 && certCount >= 2) toEarn.add("ambassador_ach");
  if (profile?.is_verified) toEarn.add("verified");

  return ACHIEVEMENTS.map(a => ({
    ...a,
    earned: toEarn.has(a.key),
  }));
}

/* ══════════════════════════════════════════════
   CSS
══════════════════════════════════════════════ */
const CSS = `
*,*::before,*::after { box-sizing: border-box; }

.pf-root {
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #0f172a;
  animation: pf-in 0.35s cubic-bezier(0.16,1,0.3,1) both;
  min-height: 60vh;
}
@keyframes pf-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
@keyframes pf-spin { to { transform: rotate(360deg); } }
@keyframes pf-fadein { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }

/* ── Page title ── */
.pf-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.3rem,4vw,1.8rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.03em;
  margin: 0 0 20px;
}
.pf-shell { display:grid; gap:14px; }
.pf-main-panel { min-width:0; }

/* ── Tabs ── */
.pf-tabs {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.pf-tabs::-webkit-scrollbar { display: none; }

.pf-tab {
  flex: 1;
  min-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 9px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}
.pf-tab:hover:not(.active) { color: #0f172a; background: rgba(255,255,255,0.6); }
.pf-tab.active {
  background: #ffffff;
  color: #0f172a;
  font-weight: 800;
  box-shadow: 0 1px 4px rgba(15,23,42,0.08);
}
.pf-public-card {
  background: radial-gradient(circle at 50% 0%,rgba(255,255,255,.82),transparent 34%),linear-gradient(135deg,#fffaf0 0%,#fef3c7 54%,#fcd34d 100%);
  border: 1px solid rgba(245,158,11,0.5);
  border-radius: 18px;
  padding: 18px 16px;
  margin-bottom: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(146,64,14,.16), inset 0 1px 0 rgba(255,255,255,.8);
}
.pf-public-card::before {
  content:""; position:absolute; inset:0; pointer-events:none;
  background: linear-gradient(120deg,transparent 0 35%,rgba(255,255,255,.38) 46%,transparent 58%);
}
.pf-public-actions {
  position:absolute; top:12px; right:12px;
  display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;
}
.pf-public-edit {
  padding:7px 11px; border:none; border-radius:999px;
  background:#0f172a; color:#fff; font-size:.72rem; font-weight:800; cursor:pointer;
}
.pf-public-edit:disabled { opacity:.55; cursor:not-allowed; }
.pf-public-avatar {
  width:102px; height:102px; margin:10px auto 12px; border-radius:50%;
  border:4px solid #fff; box-shadow:0 8px 24px rgba(15,23,42,.16);
  overflow:hidden; background:#fff7ed; display:flex; align-items:center; justify-content:center; position:relative;
}
.pf-public-avatar img { width:100%; height:100%; object-fit:cover; }
.pf-public-initial { font-size:2.4rem; font-weight:900; color:#0f172a; }
.pf-public-name {
  margin:0; font-family:'Playfair Display', Georgia, serif;
  font-size:clamp(1.25rem,6vw,1.8rem); font-weight:900; color:#0f172a; line-height:1.1;
}
.pf-blue-tick {
  display:inline-flex; align-items:center; justify-content:center; width:19px; height:19px;
  margin-left:6px; border-radius:50%; background:#1877f2; color:#fff; font-size:.78rem; vertical-align:2px;
}
.pf-public-rank {
  display:inline-flex; align-items:center; gap:5px; margin-top:7px; padding:5px 10px;
  border-radius:999px; border:1px solid rgba(15,23,42,.08); font-size:.74rem; font-weight:900; cursor:pointer;
}
.pf-public-meta { margin:9px auto 0; max-width:520px; color:#475569; font-size:.82rem; line-height:1.5; }
.pf-mini-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-top:14px; }
.pf-mini-stat { background:rgba(255,255,255,.62); border:1px solid rgba(255,255,255,.82); border-radius:12px; padding:9px 6px; }
.pf-mini-stat strong { display:block; font-size:.92rem; color:#0f172a; }
.pf-mini-stat span { display:block; margin-top:2px; font-size:.62rem; color:#92400e; font-weight:800; text-transform:uppercase; }
.pf-summary-grid { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:16px; }
.pf-summary-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:13px 14px; }
.pf-summary-label { font-size:.68rem; font-weight:900; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
.pf-summary-value { font-size:.86rem; font-weight:700; color:#0f172a; line-height:1.45; }
.pf-rank-progress-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:15px; margin-bottom:16px; }
.pf-rank-progress-head { display:flex; justify-content:space-between; gap:10px; margin-bottom:10px; font-size:.82rem; font-weight:800; }
.pf-rank-progress-text { color:#64748b; font-size:.76rem; line-height:1.5; }

/* ── Blue tick popup ── */
.pf-popup-bg {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: pf-fadein 0.3s ease;
}
.pf-popup {
  background: #ffffff;
  border-radius: 20px;
  padding: clamp(24px,4vw,36px);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 48px rgba(15,23,42,0.18);
  animation: pf-popin 0.4s cubic-bezier(0.16,1,0.3,1);
  position: relative;
}
@keyframes pf-popin {
  from { opacity:0; transform:scale(0.94) translateY(12px); }
  to   { opacity:1; transform:none; }
}
.pf-popup-close {
  position: absolute; top: 14px; right: 14px;
  width: 30px; height: 30px;
  border-radius: 50%; border: none;
  background: #f1f5f9; color: #64748b;
  font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.pf-popup-close:hover { background: #e2e8f0; color: #0f172a; }

.pf-popup-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  border: 2px solid rgba(245,158,11,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; margin: 0 auto 16px;
}
.pf-popup-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem; font-weight: 900;
  color: #0f172a; text-align: center;
  margin: 0 0 8px;
}
.pf-popup-sub {
  font-size: 0.88rem; color: #475569;
  text-align: center; line-height: 1.7;
  margin: 0 0 20px;
}

/* Progress bar */
.pf-prog-wrap { margin-bottom: 16px; }
.pf-prog-header {
  display: flex; justify-content: space-between;
  font-size: 0.78rem; font-weight: 700;
  color: #475569; margin-bottom: 8px;
}
.pf-prog-track {
  height: 8px; background: #e2e8f0;
  border-radius: 999px; overflow: hidden;
}
.pf-prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  border-radius: inherit;
  transition: width 0.6s ease;
}

/* Missing fields list */
.pf-missing-list {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;
}
.pf-missing-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; color: #b91c1c;
}

.pf-popup-btn {
  display: block; width: 100%;
  padding: 13px;
  background: #f59e0b; color: #0f172a;
  border: none; border-radius: 12px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.94rem; font-weight: 800;
  cursor: pointer; text-align: center;
  box-shadow: 0 4px 16px rgba(245,158,11,0.3);
  transition: background 0.18s, transform 0.18s;
  margin-bottom: 10px;
}
.pf-popup-btn:hover { background: #d97706; transform: translateY(-1px); }

.pf-popup-skip {
  display: block; width: 100%;
  padding: 11px;
  background: transparent; color: #94a3b8;
  border: 1.5px solid #e2e8f0; border-radius: 12px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.pf-popup-skip:hover { color: #475569; border-color: #cbd5e1; }

/* ── Completion banner (inside profile tab) ── */
.pf-completion-banner {
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  border: 1.5px solid rgba(245,158,11,0.3);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.pf-completion-left { flex: 1; min-width: 180px; }
.pf-completion-pct {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  display: block;
}
.pf-completion-label {
  font-size: 0.78rem; font-weight: 700;
  color: #92400e; text-transform: uppercase;
  letter-spacing: 0.08em;
  display: block; margin-top: 4px;
}
.pf-completion-right { flex: 2; min-width: 200px; }
.pf-comp-bar-wrap { margin-bottom: 8px; }
.pf-comp-bar {
  height: 8px; background: rgba(245,158,11,0.2);
  border-radius: 999px; overflow: hidden; margin-top: 4px;
}
.pf-comp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg,#f59e0b,#d97706);
  border-radius: inherit; transition: width 0.6s ease;
}
.pf-comp-missing {
  font-size: 0.76rem; color: #92400e; font-weight: 600;
  line-height: 1.6;
}

/* Verified badge */
.pf-verified-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg,#f59e0b,#d97706);
  color: #0f172a; border-radius: 999px;
  font-size: 0.84rem; font-weight: 800;
  box-shadow: 0 4px 12px rgba(245,158,11,0.3);
}
.pf-verified-badge svg { width: 16px; height: 16px; stroke: #0f172a; stroke-width: 3; fill: none; }

/* ── Rank section ── */
.pf-rank-section { margin-bottom: 24px; }
.pf-section-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1rem,3vw,1.2rem);
  font-weight: 800; color: #0f172a;
  margin: 0 0 14px;
}
.pf-rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px,1fr));
  gap: 8px;
}
.pf-rank-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 14px 10px;
  border-radius: 14px;
  border: 1.5px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pf-rank-card--active {
  box-shadow: 0 4px 16px rgba(15,23,42,0.1);
  transform: translateY(-2px);
}
.pf-rank-icon { font-size: 1.6rem; }
.pf-rank-name { font-size: 0.74rem; font-weight: 800; }
.pf-rank-req  { font-size: 0.64rem; font-weight: 600; color: #94a3b8; text-align: center; line-height: 1.4; }

/* ── Achievements ── */
.pf-ach-section { margin-bottom: 24px; }
.pf-ach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
  gap: 8px;
}
.pf-ach-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; padding: 14px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  text-align: center;
  transition: all 0.18s;
}
.pf-ach-card--earned {
  background: #fff;
  border-color: rgba(245,158,11,0.3);
  box-shadow: 0 2px 10px rgba(245,158,11,0.12);
}
.pf-ach-card--locked { opacity: 0.45; filter: grayscale(1); }
.pf-ach-card--earned:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.18); }
.pf-ach-icon { font-size: 1.5rem; }
.pf-ach-name { font-size: 0.72rem; font-weight: 800; color: #0f172a; }
.pf-ach-desc { font-size: 0.62rem; color: #94a3b8; line-height: 1.4; }

/* ── Share popup ── */
.pf-share-bg {
  position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center;
  background:rgba(15,23,42,.45); backdrop-filter:blur(8px); padding:18px;
}
.pf-share-pop {
  width:min(100%,460px); background:#fff; border-radius:18px; padding:18px;
  box-shadow:0 24px 60px rgba(15,23,42,.2); position:relative;
}
.pf-share-close {
  position:absolute; top:10px; right:10px; width:30px; height:30px; border:0; border-radius:50%;
  background:#f1f5f9; color:#0f172a; font-weight:900; cursor:pointer;
}
.pf-share-title { margin:0 34px 12px 0; font:900 1.1rem 'Playfair Display',Georgia,serif; color:#0f172a; }
.pf-share-link {
  margin:0 0 12px; padding:10px; border-radius:10px; background:#eff6ff; color:#2563eb;
  font-size:.75rem; font-weight:800; word-break:break-all;
}
.pf-card-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.pf-share-caption {
  width:100%; min-height:96px; margin:0 0 12px; resize:vertical;
  border:1px solid #e2e8f0; border-radius:12px; padding:12px;
  font:600 .82rem/1.55 'DM Sans',system-ui,sans-serif; color:#0f172a; background:#fff;
}
.pf-card-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px;
  border-radius: 999px; border: none;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.86rem; font-weight: 700;
  cursor: pointer; transition: all 0.18s;
}
.pf-card-btn--primary {
  background: #f59e0b; color: #0f172a;
  box-shadow: 0 4px 14px rgba(245,158,11,0.3);
}
.pf-card-btn--primary:hover { background: #d97706; transform: translateY(-1px); }
.pf-card-btn--outline {
  background: #f8fafc; color: #0f172a;
  border: 1.5px solid #e2e8f0;
}
.pf-card-btn--outline:hover { border-color: #cbd5e1; background: #fff; }

/* ── Wallet link card ── */
.pf-wallet-card {
  background: linear-gradient(135deg,#0f172a,#1e293b);
  border-radius: 20px;
  padding: clamp(24px,4vw,36px);
  display: flex; align-items: center;
  gap: 20px; flex-wrap: wrap;
  position: relative; overflow: hidden;
  margin-bottom: 20px;
}
.pf-wallet-card::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}
.pf-wallet-icon {
  font-size: 2.8rem;
  flex-shrink: 0;
  position: relative; z-index: 1;
}
.pf-wallet-body { flex: 1; min-width: 160px; position: relative; z-index: 1; }
.pf-wallet-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.1rem,3vw,1.4rem);
  font-weight: 900; color: #ffffff; margin: 0 0 6px;
}
.pf-wallet-sub { font-size: 0.88rem; color: rgba(255,255,255,0.6); margin: 0 0 4px; }
.pf-wallet-coins {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.5rem; font-weight: 900;
  color: #f59e0b;
}
.pf-wallet-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 12px 24px;
  background: #f59e0b; color: #0f172a;
  border: none; border-radius: 999px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9rem; font-weight: 800;
  text-decoration: none; cursor: pointer;
  box-shadow: 0 4px 16px rgba(245,158,11,0.35);
  transition: all 0.18s;
  position: relative; z-index: 1;
  flex-shrink: 0;
}
.pf-wallet-btn:hover { background: #d97706; transform: translateY(-1px); }

/* ── Profile form ── */
.pf-form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: clamp(16px,3vw,24px);
  margin-bottom: 20px;
}
.pf-form-card-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem; font-weight: 800;
  color: #0f172a; margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 8px;
}
.pf-edit-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.74rem; font-weight: 700; color: #475569;
  cursor: pointer; transition: all 0.15s;
}
.pf-edit-btn:hover { background: #fff; border-color: #f59e0b; color: #d97706; }

.pf-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.pf-form-group { display: flex; flex-direction: column; gap: 5px; }
.pf-label {
  font-size: 0.74rem; font-weight: 700;
  color: #334155; text-transform: uppercase;
  letter-spacing: 0.06em;
}
.pf-input {
  width: 100%; padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 500;
  transition: all 0.18s;
  appearance: none;
}
.pf-input::placeholder { color: #94a3b8; font-weight: 400; }
.pf-input:focus {
  outline: none; background: #fff;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
}
.pf-input:read-only {
  background: #e2e8f0; color: #64748b;
  cursor: not-allowed;
}
textarea.pf-input { resize: vertical; min-height: 80px; }

.pf-form-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.pf-save-btn {
  padding: 11px 24px;
  background: #f59e0b; color: #0f172a;
  border: none; border-radius: 10px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9rem; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245,158,11,0.3);
  transition: all 0.18s;
}
.pf-save-btn:hover:not(:disabled) { background: #d97706; transform: translateY(-1px); }
.pf-save-btn:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.pf-cancel-btn {
  padding: 11px 20px;
  background: #f8fafc; color: #475569;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.pf-cancel-btn:hover { background: #fff; border-color: #cbd5e1; }

/* Avatar section */
.pf-avatar-wrap { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.pf-avatar {
  width: 72px; height: 72px;
  border-radius: 50%; overflow: hidden;
  border: 3px solid #f59e0b;
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; position: relative;
  box-shadow: 0 4px 14px rgba(245,158,11,0.2);
}
.pf-avatar img { width:100%; height:100%; object-fit:cover; }
.pf-avatar-placeholder { font-size: 1.8rem; }
.pf-avatar-actions { display: flex; flex-direction: column; gap: 6px; }
.pf-upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: #f8fafc; border: 1.5px solid #e2e8f0;
  border-radius: 9px; color: #475569;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.pf-upload-btn:hover { border-color: #f59e0b; color: #d97706; background: #fffbeb; }
.pf-upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.pf-delete-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: #fef2f2; border: 1.5px solid #fecaca;
  border-radius: 9px; color: #b91c1c;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.pf-delete-btn:hover { background: #fee2e2; }
.pf-delete-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.pf-upload-hint { font-size: 0.68rem; color: #94a3b8; font-weight: 500; }

/* Message box */
.pf-msg {
  padding: 11px 14px; border-radius: 10px;
  font-size: 0.84rem; font-weight: 600;
  margin-bottom: 16px;
  animation: pf-fadein 0.3s ease;
}
.pf-msg--ok  { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
.pf-msg--err { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

/* Loading */
.pf-loading {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 12px;
}
.pf-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(245,158,11,0.2);
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: pf-spin 0.7s linear infinite;
}
.pf-loading-text { font-size: 0.84rem; font-weight: 600; color: #94a3b8; }

/* ── RESPONSIVE ── */
@media (min-width: 480px) {
  .pf-form-grid { grid-template-columns: repeat(2, 1fr); }
  .pf-ach-grid  { grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); }
  .pf-summary-grid { grid-template-columns: repeat(2,1fr); }
}
@media (min-width: 640px) {
  .pf-rank-grid { grid-template-columns: repeat(5,1fr); }
}
@media (min-width: 820px) {
  .pf-tabs { width:max-content; max-width:100%; margin-bottom:18px; }
  .pf-tab { flex:0 0 auto; padding:7px 11px; font-size:.72rem; }
  .pf-public-card { padding:22px 20px; }
}
@media (max-width: 360px) {
  .pf-tabs { gap: 2px; }
  .pf-tab  { padding: 7px 8px; font-size: 0.68rem; }
  .pf-rank-grid { grid-template-columns: repeat(3,1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .pf-root *, .pf-root *::before, .pf-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();

  const [activeTab,    setActiveTab]    = useState("profile");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [isEdit,       setIsEdit]       = useState(false);
  const [msg,          setMsg]          = useState({ text: "", type: "" });
  const [userId,       setUserId]       = useState(null);
  const [showPopup,    setShowPopup]    = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [shareCopied,  setShareCopied]  = useState("");

  const [profile,      setProfile]      = useState(null);
  const [quizData,     setQuizData]     = useState(null);
  const [enrollments,  setEnrollments]  = useState([]);
  const [certs,        setCerts]        = useState([]);

  const [form, setForm] = useState({
    avatar_url: "", full_name: "", email: "", phone: "",
    date_of_birth: "", city: "", country: "",
    educational_level: "", profession: "", institute_company: "",
    interests: "", bio: "",
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── Load all data ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const [profRes, quizRes, enrollRes, certRes] = await Promise.all([
        supabase.from("users_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_quiz_attempts").select("streak_days,status,coins_earned")
          .eq("user_id", user.id).eq("status", "passed"),
        supabase.from("course_enrollments").select("*").eq("user_id", user.id),
        supabase.from("course_certificates").select("*, course:course_id(title,level,category)")
          .eq("user_id", user.id).order("issued_at", { ascending: false }),
      ]);

      const prof = profRes.data;
      if (prof) {
        setProfile(prof);
        setForm({
          avatar_url:        prof.avatar_url || "",
          full_name:         prof.full_name  || "",
          email:             prof.email      || user.email || "",
          phone:             prof.phone      || "",
          date_of_birth:     prof.date_of_birth || "",
          city:              prof.city       || "",
          country:           prof.country    || "",
          educational_level: prof.educational_level || "",
          profession:        prof.profession || "",
          institute_company: prof.institute_company || "",
          interests:         Array.isArray(prof.interests) ? prof.interests.join(", ") : "",
          bio:               prof.bio        || "",
        });

        // Show popup if profile incomplete
        const pct = calcCompletion(prof);
        if (pct < 100) setShowPopup(true);
      }

      // Quiz stats
      const attempts = quizRes.data || [];
      const maxStreak = attempts.reduce((m, a) => Math.max(m, a.streak_days || 0), 0);
      setQuizData({ totalQuizzes: attempts.length, maxStreak });

      setEnrollments(enrollRes.data || []);
      setCerts(certRes.data || []);
      setLoading(false);
    })();
  }, [router]);

  /* ── Auto update completion + verify ── */
  useEffect(() => {
    if (!profile || !userId) return;
    const pct = calcCompletion(profile);
    const updates = { profile_completion_pct: pct };
    if (pct >= 100 && !profile.is_verified) {
      updates.is_verified = true;
      updates.rank = computeRank(profile.my_referals || 0, quizData?.maxStreak || 0).key;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(p => ({ ...p, ...updates }));
    }
    supabase.from("users_profiles").update(updates).eq("user_id", userId);
  }, [profile, userId, quizData]);

  /* ── Upload avatar ── */
  async function uploadAvatar(file) {
    if (!file || !userId) return;
    if (file.size > 3 * 1024 * 1024) { setMsg({ text: "Max 3MB", type: "err" }); return; }
    if (!file.type.startsWith("image/")) { setMsg({ text: "Please select an image", type: "err" }); return; }
    setUploading(true);
    try {
      const ext      = file.name.split(".").pop() || "jpg";
      const fileName = `${userId}/avatar_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars")
        .upload(fileName, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      await supabase.from("users_profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", userId);
      setField("avatar_url", urlData.publicUrl);
      setProfile(p => ({ ...p, avatar_url: urlData.publicUrl }));
      setMsg({ text: "Photo updated ✅", type: "ok" });
    } catch (e) {
      setMsg({ text: e.message || "Upload failed", type: "err" });
    } finally {
      setUploading(false);
    }
  }

  /* ── Delete avatar ── */
  async function deleteAvatar() {
    if (!userId || !form.avatar_url) return;
    setUploading(true);
    try {
      const match = form.avatar_url.match(/avatars\/([^?]+)/);
      if (match) await supabase.storage.from("avatars").remove([match[1]]);
      await supabase.from("users_profiles").update({ avatar_url: null }).eq("user_id", userId);
      setField("avatar_url", "");
      setProfile(p => ({ ...p, avatar_url: null }));
      setMsg({ text: "Photo removed", type: "ok" });
    } catch (e) {
      setMsg({ text: e.message, type: "err" });
    } finally {
      setUploading(false);
    }
  }

  /* ── Save profile ── */
  async function saveProfile(e) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const interests = form.interests.split(",").map(s => s.trim()).filter(Boolean);
      const payload   = {
        full_name:         form.full_name.trim(),
        phone:             form.phone.trim()             || null,
        date_of_birth:     form.date_of_birth            || null,
        city:              form.city.trim()              || null,
        country:           form.country.trim()           || null,
        educational_level: form.educational_level.trim() || null,
        profession:        form.profession.trim()        || null,
        institute_company: form.institute_company.trim() || null,
        interests:         interests.length ? interests  : null,
        bio:               form.bio.trim()               || null,
      };
      const { error } = await supabase.from("users_profiles").update(payload).eq("user_id", userId);
      if (error) throw error;
      setProfile(p => ({ ...p, ...payload }));
      setIsEdit(false);
      setMsg({ text: "Profile saved ✅", type: "ok" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (e) {
      setMsg({ text: e.message || "Save failed", type: "err" });
    } finally {
      setSaving(false);
    }
  }

  const inviteLink = profile?.my_refer_code && typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(profile.my_refer_code)}`
    : "";
  const shareCaption = `I am building my future with AIDLA, an AI learning platform in Pakistan.\n\nJoin through my invite link and start learning AI, skills, and career-ready projects:\n${inviteLink}`;

  async function copyShare(text, key) {
    await navigator.clipboard.writeText(text);
    setShareCopied(key);
    setTimeout(() => { setShareCopied(""); setShareOpen(false); }, 900);
  }

  function handleShareProfile() { setShareOpen(true); }

  /* ── Derived values ── */
  const pct         = calcCompletion(profile);
  const missing     = getMissing(profile);
  const rank        = computeRank(profile?.my_referals || 0, quizData?.maxStreak || 0);
  const achievements = computeAchievements(profile, quizData, enrollments, certs);
  const isVerified  = profile?.is_verified || false;
  const rankIndex   = RANKS.findIndex(r => r.key === rank.key);
  const nextRank    = RANKS[rankIndex + 1] || null;
  const refs        = profile?.my_referals || 0;
  const streak      = quizData?.maxStreak || 0;
  const nextRefPct  = nextRank?.minReferrals ? Math.min(100, Math.round((refs / nextRank.minReferrals) * 100)) : 100;
  const nextStrPct  = nextRank?.minStreak ? Math.min(100, Math.round((streak / nextRank.minStreak) * 100)) : 100;
  const nextPct     = nextRank ? Math.min(nextRefPct, nextStrPct) : 100;
  const earnedAchievements = achievements.filter(a => a.earned);

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pf-loading">
          <div className="pf-spinner" aria-hidden="true" />
          <p className="pf-loading-text">Loading profile…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="pf-root">

        {/* ── Blue tick popup ── */}
        {showPopup && pct < 100 && (
          <div className="pf-popup-bg" role="dialog" aria-modal="true" aria-labelledby="pf-popup-title">
            <div className="pf-popup">
              <button className="pf-popup-close" onClick={() => setShowPopup(false)} aria-label="Close">×</button>

              <div className="pf-popup-icon" aria-hidden="true">✨</div>
              <h2 id="pf-popup-title" className="pf-popup-title">Get Your Blue Tick!</h2>
              <p className="pf-popup-sub">
                Complete your profile to unlock your verified blue tick badge and full AIDLA access.
              </p>

              <div className="pf-prog-wrap">
                <div className="pf-prog-header">
                  <span>Profile completion</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="pf-prog-track">
                  <div className="pf-prog-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {missing.length > 0 && (
                <div className="pf-missing-list" aria-label="Missing fields">
                  {missing.map(f => (
                    <span key={f.key} className="pf-missing-tag">
                      {f.icon} {f.label}
                    </span>
                  ))}
                </div>
              )}

              <button className="pf-popup-btn" onClick={() => { setShowPopup(false); setIsEdit(true); setActiveTab("profile"); }}>
                Complete Profile →
              </button>
              <button className="pf-popup-skip" onClick={() => setShowPopup(false)}>
                Remind me later
              </button>
            </div>
          </div>
        )}

        <div className="pf-shell">
          <aside className="pf-tabs" role="tablist" aria-label="Profile sections">
            {[
              { key: "profile",      label: "Profile"      },
              { key: "rank",         label: "Rank"         },
              { key: "achievements", label: "Badges"       },
              { key: "certificates", label: "Certs"        },
              { key: "wallet",       label: "Wallet"       },
            ].map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                className={`pf-tab${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </aside>

          <section className="pf-main-panel">
            <h1 className="pf-title">My Profile</h1>

        {/* ══════════════ TAB: CERTIFICATES ══════════════ */}
        {activeTab === "certificates" && <MyCertificates />}

        {/* ══════════════ TAB: WALLET ══════════════ */}
        {activeTab === "wallet" && (
          <div>
            <div className="pf-wallet-card">
              <div className="pf-wallet-icon" aria-hidden="true">💎</div>
              <div className="pf-wallet-body">
                <h2 className="pf-wallet-title">My Wallet</h2>
                <p className="pf-wallet-sub">Total AIDLA Coins</p>
                <span className="pf-wallet-coins">
                  🪙 {Math.round(profile?.total_aidla_coins || 0).toLocaleString()} Coins
                </span>
              </div>
              <a href="/user/wallet" className="pf-wallet-btn">
                Open Wallet →
              </a>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12 }}>
              {[
                { icon: "🪙", label: "Total Coins",     value: Math.round(profile?.total_aidla_coins || 0).toLocaleString() },
                { icon: "🎡", label: "Wheel Coins",     value: Math.round(profile?.lw_earned_coins || 0).toLocaleString() },
                { icon: "📊", label: "Total LW Earned", value: Math.round(profile?.total_lw_earned || 0).toLocaleString() },
                { icon: "🎟️", label: "LW Draws Left",   value: profile?.lw_draws_remaining || 0 },
              ].map(s => (
                <div key={s.label} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 14, padding: "16px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 900, color: "#0f172a" }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rank" && (
          <>
            <div className="pf-rank-progress-card">
              <div className="pf-rank-progress-head">
                <span>Current: {rank.icon} {rank.label}</span>
                <span>{nextRank ? `Next: ${nextRank.icon} ${nextRank.label}` : "Top rank reached"}</span>
              </div>
              <div className="pf-prog-track">
                <div className="pf-prog-fill" style={{ width: `${nextPct}%` }} />
              </div>
              <p className="pf-rank-progress-text">
                {nextRank
                  ? `${refs}/${nextRank.minReferrals || refs} referrals${nextRank.minStreak ? ` and ${streak}/${nextRank.minStreak} day streak` : ""}.`
                  : "You have reached the highest AIDLA rank."}
              </p>
            </div>
            <div className="pf-rank-grid" role="list">
              {RANKS.map(r => {
                const isActive = rank.key === r.key;
                const isReached = RANKS.indexOf(r) <= rankIndex;
                return (
                  <div key={r.key} role="listitem" className={`pf-rank-card${isActive ? " pf-rank-card--active" : ""}`}
                    style={{ background: isReached ? r.bg : "#f8fafc", borderColor: isActive ? r.color : isReached ? `${r.color}40` : "#e2e8f0", opacity: isReached ? 1 : 0.45 }}>
                    <span className="pf-rank-icon">{r.icon}</span>
                    <span className="pf-rank-name" style={{ color: isReached ? r.color : "#94a3b8" }}>{r.label}</span>
                    <span className="pf-rank-req">{r.minReferrals ? `${r.minReferrals}+ refs` : "Default"}{r.minStreak ? ` · ${r.minStreak}d streak` : ""}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "achievements" && (
          <>
            <div className="pf-rank-progress-card">
              <div className="pf-rank-progress-head">
                <span>Achievements</span>
                <span>{earnedAchievements.length}/{achievements.length} earned</span>
              </div>
              <div className="pf-prog-track">
                <div className="pf-prog-fill" style={{ width: `${Math.round((earnedAchievements.length / achievements.length) * 100)}%` }} />
              </div>
            </div>
            <div className="pf-ach-grid" role="list">
              {achievements.map(a => (
                <div key={a.key} role="listitem" className={`pf-ach-card${a.earned ? " pf-ach-card--earned" : " pf-ach-card--locked"}`}>
                  <span className="pf-ach-icon">{a.icon}</span>
                  <span className="pf-ach-name">{a.label}</span>
                  <span className="pf-ach-desc">{a.desc}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════════ TAB: PROFILE ══════════════ */}
        {activeTab === "profile" && (
          <>
            {/* Message */}
            {msg.text && (
              <div className={`pf-msg pf-msg--${msg.type}`} role="alert">{msg.text}</div>
            )}

            {!isEdit ? (
              <>
                <div className="pf-public-card">
                  <div className="pf-public-actions">
                    <button className="pf-public-edit" onClick={handleShareProfile} disabled={!inviteLink}>
                      Share Profile
                    </button>
                    <button className="pf-public-edit" onClick={() => setIsEdit(true)}>Edit Profile</button>
                  </div>
                  <div className="pf-public-avatar">
                    {form.avatar_url
                      ? <Image src={form.avatar_url} alt={form.full_name || "Avatar"} width={92} height={92} unoptimized />
                      : <span className="pf-public-initial">{form.full_name?.[0]?.toUpperCase() || "A"}</span>}
                  </div>
                  <h2 className="pf-public-name">
                    {form.full_name || "AIDLA Learner"}
                    {isVerified && <span className="pf-blue-tick" title="Verified">✓</span>}
                  </h2>
                  <button className="pf-public-rank" onClick={() => setActiveTab("rank")} style={{ background: rank.bg, color: rank.color }}>
                    {rank.icon} {rank.label}
                  </button>
                  <p className="pf-public-meta">
                    {[form.profession, form.city, form.country].filter(Boolean).join(" · ") || "AIDLA learner"}
                    {form.bio ? ` · ${form.bio}` : ""}
                  </p>
                  <div className="pf-mini-stats">
                    <div className="pf-mini-stat"><strong>{pct}%</strong><span>Complete</span></div>
                    <div className="pf-mini-stat"><strong>{earnedAchievements.length}</strong><span>Badges</span></div>
                    <div className="pf-mini-stat"><strong>{Math.round(profile?.total_aidla_coins || 0).toLocaleString()}</strong><span>Coins</span></div>
                  </div>
                </div>

                <div className="pf-summary-grid">
                  {[
                    ["Education", form.educational_level || "Not added"],
                    ["Institute / Company", form.institute_company || "Not added"],
                    ["Interests", form.interests || "Not added"],
                    ["Email", maskEmail(form.email) || "Not added"],
                  ].map(([label, value]) => (
                    <div className="pf-summary-card" key={label}>
                      <div className="pf-summary-label">{label}</div>
                      <div className="pf-summary-value">{value}</div>
                    </div>
                  ))}
                </div>

                {shareOpen && (
                  <div className="pf-share-bg" role="dialog" aria-modal="true" aria-labelledby="pf-share-title">
                    <div className="pf-share-pop">
                      <button className="pf-share-close" onClick={() => setShareOpen(false)} aria-label="Close">×</button>
                      <h2 id="pf-share-title" className="pf-share-title">Share Profile</h2>
                      <div className="pf-share-link">{inviteLink}</div>
                      <textarea className="pf-share-caption" readOnly value={shareCaption} />
                      <div className="pf-card-actions">
                        <button className="pf-card-btn pf-card-btn--primary" onClick={() => copyShare(shareCaption, "caption")}>
                          {shareCopied === "caption" ? "Copied" : "Copy Caption"}
                        </button>
                        <button className="pf-card-btn pf-card-btn--outline" onClick={() => copyShare(inviteLink, "link")}>
                          {shareCopied === "link" ? "Copied" : "Copy Link"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
            {/* Avatar */}
            <div className="pf-form-card">
              <div className="pf-form-card-title">Profile Photo</div>
              <div className="pf-avatar-wrap">
                <div className="pf-avatar">
                  {form.avatar_url
                    ? <Image src={form.avatar_url} alt={form.full_name || "Avatar"} width={72} height={72} unoptimized />
                    : <span className="pf-avatar-placeholder" aria-hidden="true">
                        {form.full_name?.[0]?.toUpperCase() || "?"}
                      </span>
                  }
                </div>
                <div className="pf-avatar-actions">
                  <label className={`pf-upload-btn${uploading ? " disabled" : ""}`}>
                    <input type="file" accept="image/*" disabled={uploading} style={{ display: "none" }}
                      onChange={e => { if (e.target.files?.[0]) { uploadAvatar(e.target.files[0]); e.target.value = ""; } }} />
                    📸 {uploading ? "Uploading…" : "Change Photo"}
                  </label>
                  {form.avatar_url && (
                    <button type="button" className="pf-delete-btn" disabled={uploading} onClick={deleteAvatar}>
                      🗑 Remove
                    </button>
                  )}
                  <span className="pf-upload-hint">Max 3MB · JPG, PNG</span>
                </div>
              </div>
            </div>

            {/* Personal details form */}
            <div className="pf-form-card">
              <div className="pf-form-card-title">
                <span>Personal Details</span>
                {!isEdit && (
                  <button className="pf-edit-btn" onClick={() => setIsEdit(true)}>
                    ✏️ Edit
                  </button>
                )}
              </div>

              <form onSubmit={saveProfile}>
                <div className="pf-form-grid">
                  {[
                    { key: "full_name",         label: "Full Name",          type: "text",     placeholder: "Your full name",          required: true  },
                    { key: "email",              label: "Email",              type: "email",    placeholder: "—",                       readOnly: true  },
                    { key: "phone",              label: "Phone",              type: "tel",      placeholder: "+92 300 1234567"                          },
                    { key: "date_of_birth",      label: "Date of Birth",      type: "date",     placeholder: ""                                         },
                    { key: "city",               label: "City",               type: "text",     placeholder: "e.g. Peshawar"                            },
                    { key: "country",            label: "Country",            type: "text",     placeholder: "e.g. Pakistan"                            },
                    { key: "educational_level",  label: "Educational Level",  type: "text",     placeholder: "e.g. Bachelor's Degree"                   },
                    { key: "profession",         label: "Profession",         type: "text",     placeholder: "e.g. Software Engineer"                   },
                    { key: "institute_company",  label: "Institute / Company",type: "text",     placeholder: "e.g. NUST, Islamabad"                     },
                    { key: "interests",          label: "Interests (comma separated)", type: "text", placeholder: "AI, Web Dev, Finance"               },
                  ].map(f => (
                    <div key={f.key} className="pf-form-group">
                      <label className="pf-label" htmlFor={`pf-${f.key}`}>{f.label}</label>
                      <input
                        id={`pf-${f.key}`}
                        className="pf-input"
                        type={f.type}
                        value={form[f.key] || ""}
                        onChange={e => setField(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        readOnly={f.readOnly || !isEdit}
                        required={f.required}
                      />
                    </div>
                  ))}

                  {/* Bio — full width */}
                  <div className="pf-form-group" style={{ gridColumn: "1/-1" }}>
                    <label className="pf-label" htmlFor="pf-bio">Bio</label>
                    <textarea
                      id="pf-bio"
                      className="pf-input"
                      value={form.bio || ""}
                      onChange={e => setField("bio", e.target.value)}
                      placeholder="Tell us a little about yourself…"
                      rows={3}
                      readOnly={!isEdit}
                    />
                  </div>
                </div>

                {isEdit && (
                  <div className="pf-form-actions">
                    <button type="button" className="pf-cancel-btn" onClick={() => setIsEdit(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="pf-save-btn" disabled={saving}>
                      {saving ? "Saving…" : "Save Changes →"}
                    </button>
                  </div>
                )}
              </form>
            </div>

              </>
            )}

          </>
        )}

          </section>
        </div>
      </div>
    </>
  );
}
