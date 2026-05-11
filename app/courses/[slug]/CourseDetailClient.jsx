"use client";
// app/courses/[slug]/CourseDetailClient.jsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toSlug } from "../CoursesClient";

const LEVELS = {
  beginner:     { label: "Beginner",     color: "#059669", bg: "#ECFDF5", icon: "🌱" },
  intermediate: { label: "Intermediate", color: "#D97706", bg: "#FFFBEB", icon: "🔥" },
  advanced:     { label: "Advanced",     color: "#DC2626", bg: "#FEF2F2", icon: "⚡" },
  "all-levels": { label: "All Levels",   color: "#92400e", bg: "#fde68a", icon: "🎯" },
};

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden;width:100%}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

.pcd-root{
  min-height:100vh;
  background:#fffbeb;
  font-family:'DM Sans',sans-serif;color:#0f172a;
  display:flex;flex-direction:column;overflow-x:hidden;position:relative;
  -webkit-font-smoothing:antialiased;
}
.pcd-root::before{
  content:'';position:fixed;inset:0;
  background-image:
    linear-gradient(rgba(245,158,11,0.04) 1px,transparent 1px),
    linear-gradient(90deg,rgba(245,158,11,0.04) 1px,transparent 1px);
  background-size:40px 40px;pointer-events:none;z-index:0;
}

/* Breadcrumb */
.pcd-breadcrumb{
  position:relative;z-index:1;
  max-width:1100px;margin:0 auto;
  padding:16px clamp(16px,4vw,32px) 0;
  display:flex;align-items:center;gap:6px;
  font-size:.75rem;font-weight:600;color:#94a3b8;flex-wrap:wrap;
}
.pcd-breadcrumb a{color:#d97706;text-decoration:none;transition:opacity .15s;}
.pcd-breadcrumb a:hover{opacity:.7;text-decoration:underline;}
.pcd-breadcrumb-sep{color:#cbd5e1;}

/* Hero */
.pcd-hero{
  position:relative;z-index:1;
  background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 55%,#fde68a 100%);
  border-bottom:1px solid #f0c96a;
  padding:clamp(24px,4vw,44px) clamp(16px,4vw,32px) clamp(28px,4vw,44px);
  overflow:hidden;
}
.pcd-hero::after{
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(15,23,42,0.03) 1px,transparent 1px);
  background-size:22px 22px;pointer-events:none;
}
.pcd-hero-inner{
  max-width:1100px;margin:0 auto;position:relative;z-index:1;
  display:grid;grid-template-columns:1fr;gap:32px;align-items:start;
}
@media(min-width:860px){.pcd-hero-inner{grid-template-columns:1fr 360px;}}

/* Badges */
.pcd-hero-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
.pcd-badge-level{padding:4px 12px;border-radius:100px;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;}
.pcd-badge-cat{
  padding:4px 12px;border-radius:100px;font-size:.68rem;font-weight:700;
  background:rgba(15,23,42,0.08);color:#0f172a;border:1px solid rgba(15,23,42,0.14);
}

.pcd-hero-h1{
  font-family:'Playfair Display',serif;
  font-size:clamp(1.6rem,4vw,2.6rem);font-weight:900;line-height:1.15;
  color:#0f172a;margin-bottom:16px;
}
.pcd-hero-desc-intro{
  font-size:clamp(.9rem,2vw,1rem);color:rgba(15,23,42,0.68);line-height:1.7;margin-bottom:24px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}

/* Meta row */
.pcd-hero-meta{display:flex;gap:18px;flex-wrap:wrap;margin-bottom:0;}
.pcd-meta-item{display:flex;align-items:center;gap:6px;font-size:.8rem;font-weight:600;color:#64748b;}
.pcd-meta-icon{font-size:14px;}

/* Enroll card */
.pcd-enroll-card{
  background:#fff;border-radius:22px;
  border:1px solid rgba(245,158,11,0.2);
  box-shadow:0 8px 40px rgba(15,23,42,0.09);
  overflow:hidden;position:sticky;top:76px;
}
@media(max-width:859px){.pcd-enroll-card{position:static;}}

.pcd-enroll-thumb{
  width:100%;height:0;padding-bottom:56.25%;position:relative;
  background:linear-gradient(135deg,#fde68a,#f59e0b);overflow:hidden;
}
.pcd-enroll-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.pcd-enroll-body{padding:22px 22px 24px;}
.pcd-price-row{display:flex;align-items:baseline;gap:10px;margin-bottom:18px;}
.pcd-price{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;color:#0f172a;line-height:1;}
.pcd-price-free{color:#059669;}
.pcd-price-sub{font-size:.78rem;color:#94a3b8;font-weight:600;}

.pcd-enroll-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:14px 20px;border-radius:14px;border:none;
  background:#0f172a;color:#f59e0b;
  font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:800;
  cursor:pointer;box-shadow:0 4px 18px rgba(15,23,42,0.2);
  transition:transform .18s,box-shadow .18s,background .18s;text-decoration:none;margin-bottom:12px;
}
.pcd-enroll-btn:hover{
  transform:translateY(-2px);box-shadow:0 8px 28px rgba(15,23,42,0.28);
  background:#1e293b;
}

.pcd-enroll-note{text-align:center;font-size:.72rem;color:#94a3b8;font-weight:600;margin-bottom:20px;}
.pcd-enroll-features{display:flex;flex-direction:column;gap:10px;list-style:none;padding:0;}
.pcd-enroll-feat{display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:600;color:#475569;}
.pcd-enroll-feat-icon{font-size:16px;flex-shrink:0;width:24px;text-align:center;}

/* Main content */
.pcd-main{
  position:relative;z-index:1;max-width:1100px;margin:0 auto;width:100%;
  padding:clamp(28px,4vw,44px) clamp(16px,4vw,32px) clamp(48px,8vw,80px);flex:1;
}
.pcd-layout{display:grid;grid-template-columns:1fr;gap:32px;align-items:start;}
@media(min-width:860px){.pcd-layout{grid-template-columns:1fr 360px;}}

/* Content cards */
.pcd-desc-card{
  background:#fff;border-radius:20px;
  border:1px solid rgba(245,158,11,0.14);
  box-shadow:0 4px 20px rgba(15,23,42,0.05);
  padding:clamp(20px,4vw,32px);margin-bottom:20px;
}
.pcd-section-title{
  font-family:'Playfair Display',serif;font-size:clamp(1.1rem,3vw,1.3rem);font-weight:700;
  color:#0f172a;margin-bottom:16px;display:flex;align-items:center;gap:8px;
}
.pcd-desc-text{font-size:clamp(.88rem,2vw,.95rem);color:#334155;line-height:1.8;white-space:pre-line;}
.pcd-desc-text p{margin-bottom:12px;}
.pcd-desc-text p:last-child{margin-bottom:0;}

/* Details grid */
.pcd-details-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
@media(max-width:480px){.pcd-details-grid{grid-template-columns:1fr;}}

.pcd-detail-card{
  background:#fff;border-radius:14px;
  border:1px solid rgba(245,158,11,0.14);
  box-shadow:0 2px 12px rgba(15,23,42,0.04);
  padding:16px 18px;display:flex;align-items:center;gap:12px;
}
.pcd-detail-icon{
  width:38px;height:38px;border-radius:10px;
  background:linear-gradient(135deg,#fef3c7,#fde68a);
  display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;
}
.pcd-detail-lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;}
.pcd-detail-val{font-size:.88rem;font-weight:700;color:#0f172a;margin-top:2px;}

/* Certificate callout */
.pcd-cert-card{
  background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(252,211,77,0.06));
  border:1.5px solid rgba(245,158,11,0.22);border-radius:16px;padding:20px 22px;
  display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;
}
.pcd-cert-icon{font-size:36px;flex-shrink:0;}
.pcd-cert-text{flex:1;min-width:200px;}
.pcd-cert-title{font-weight:800;font-size:.95rem;color:#0f172a;margin-bottom:4px;}
.pcd-cert-sub{font-size:.8rem;color:#64748b;line-height:1.5;}


/* Related grid */
.pcd-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}
.pcd-related-card{
  background:#fff;border-radius:14px;
  border:1px solid rgba(245,158,11,0.14);
  box-shadow:0 2px 12px rgba(15,23,42,0.05);
  overflow:hidden;text-decoration:none;color:inherit;
  transition:transform .2s,box-shadow .2s,border-color .2s;display:flex;flex-direction:column;
}
.pcd-related-card:hover{
  transform:translateY(-3px);box-shadow:0 10px 30px rgba(245,158,11,0.18);
  border-color:rgba(245,158,11,0.35);
}
.pcd-related-thumb{height:110px;background:linear-gradient(135deg,#fde68a,#f59e0b);position:relative;overflow:hidden;}
.pcd-related-thumb img{width:100%;height:100%;object-fit:cover;}
.pcd-related-body{padding:12px 13px 14px;}
.pcd-related-level{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;}
.pcd-related-title{
  font-family:'Playfair Display',serif;font-size:.85rem;font-weight:700;
  color:#0f172a;line-height:1.35;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}

/* Not found */
.pcd-not-found{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  flex:1;padding:80px 20px;text-align:center;z-index:1;position:relative;
}
.pcd-nf-icon{font-size:64px;margin-bottom:20px;}
.pcd-nf-h{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;color:#0f172a;margin-bottom:10px;}
.pcd-nf-p{color:#64748b;font-size:.9rem;margin-bottom:24px;}
.pcd-nf-btn{
  padding:12px 28px;border-radius:30px;border:none;
  background:#0f172a;color:#f59e0b;
  font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:800;
  cursor:pointer;text-decoration:none;display:inline-block;
  box-shadow:0 4px 16px rgba(15,23,42,0.2);
}

/* Skeleton */
.pcd-skeleton{
  background:linear-gradient(90deg,#fef3c7 25%,#fde68a 50%,#fef3c7 75%);
  background-size:200% 100%;animation:pcd-shimmer 1.4s infinite;border-radius:20px;
}
@keyframes pcd-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

@keyframes pcd-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.pcd-fade{animation:pcd-fadeUp .42s ease both;}

@media(max-width:859px){.pcd-main{padding-bottom:40px;}}
`;

function LoadingSkeleton() {
  return (
    <div className="pcd-root" aria-busy="true" aria-label="Loading course">
      <div
        style={{
          maxWidth: 1100, margin: "40px auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "1fr 360px", gap: 32,
        }}
      >
        <div>
          <div className="pcd-skeleton" style={{ height: 48, marginBottom: 16 }} />
          <div className="pcd-skeleton" style={{ height: 24, marginBottom: 10, width: "70%" }} />
          <div className="pcd-skeleton" style={{ height: 280, marginTop: 24 }} />
        </div>
        <div className="pcd-skeleton" style={{ height: 420 }} />
      </div>
    </div>
  );
}

export default function CourseDetailClient({ slug, initialCourse = null, initialRelated = [] }) {
  const router    = useRouter();
  const [course,   setCourse]   = useState(initialCourse);
  const [related,  setRelated]  = useState(initialRelated);
  const [loading,  setLoading]  = useState(!initialCourse);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (initialCourse) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("course_courses")
        .select("*")
        .eq("status", "published");

      if (!data?.length) { setNotFound(true); setLoading(false); return; }
      const found = data.find(c => toSlug(c.title) === slug);
      if (!found) { setNotFound(true); setLoading(false); return; }
      setCourse(found);
      setRelated(data.filter(c => c.id !== found.id && (c.category === found.category || c.level === found.level)).slice(0, 4));
      setLoading(false);
    })();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <><style>{CSS}</style><LoadingSkeleton /></>;

  if (notFound) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pcd-root">
          <main className="pcd-not-found">
            <p className="pcd-nf-icon" aria-hidden="true">🔍</p>
            <h1 className="pcd-nf-h">Course Not Found</h1>
            <p className="pcd-nf-p">This course may have been removed or the link is incorrect.</p>
            <Link href="/courses" className="pcd-nf-btn">Browse All Courses</Link>
          </main>
        </div>
      </>
    );
  }

  const lm     = LEVELS[course.level] || LEVELS.beginner;
  const isFree = !course.price || course.price === 0;
  const hasCert = course.certificate_price >= 0;

  const descParagraphs = (course.description || "")
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  const details = [
    { icon: "📊", label: "Level",    val: lm.label },
    { icon: "🗂️", label: "Category", val: course.category || "General" },
    { icon: "⏱️", label: "Duration", val: course.duration_estimate || "Self-paced" },
    { icon: "💰", label: "Price",    val: isFree ? "Free" : `PKR ${Number(course.price).toLocaleString()}` },
  ].filter(d => d.val);

  const enrollLabel = isFree ? "🎓 Enroll for Free" : "Enroll Now →";
  const enrollAriaLabel = isFree
    ? `Enroll free in ${course.title}`
    : `Enroll in ${course.title} for PKR ${Number(course.price).toLocaleString()}`;

  return (
    <>
      <style>{CSS}</style>

      <div className="pcd-root">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="pcd-breadcrumb pcd-fade">
          <Link href="/">Home</Link>
          <span className="pcd-breadcrumb-sep" aria-hidden="true">›</span>
          <Link href="/courses">Courses</Link>
          <span className="pcd-breadcrumb-sep" aria-hidden="true">›</span>
          <span style={{ color: "#475569" }} aria-current="page">{course.title}</span>
        </nav>

        {/* Hero */}
        <header className="pcd-hero">
          <div className="pcd-hero-inner">

            {/* Left: course info */}
            <div className="pcd-fade">
              <div className="pcd-hero-badges">
                <span className="pcd-badge-level" style={{ background: lm.bg, color: lm.color }}>
                  {lm.icon} {lm.label}
                </span>
                {course.category && <span className="pcd-badge-cat">{course.category}</span>}
                {isFree && (
                  <span style={{
                    background: "#ECFDF5", color: "#059669", padding: "4px 12px",
                    borderRadius: 100, fontSize: ".68rem", fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: ".06em",
                  }}>
                    Free
                  </span>
                )}
              </div>

              <h1 className="pcd-hero-h1">{course.title}</h1>

              <p className="pcd-hero-desc-intro">
                {(course.description || "").split("\n")[0]}
              </p>

              <div className="pcd-hero-meta" role="list" aria-label="Course details">
                {course.duration_estimate && (
                  <div className="pcd-meta-item" role="listitem">
                    <span className="pcd-meta-icon" aria-hidden="true">⏱️</span>
                    <span>{course.duration_estimate}</span>
                  </div>
                )}
                <div className="pcd-meta-item" role="listitem">
                  <span className="pcd-meta-icon" aria-hidden="true">📊</span>
                  <span>{lm.label}</span>
                </div>
                {hasCert && (
                  <div className="pcd-meta-item" role="listitem">
                    <span className="pcd-meta-icon" aria-hidden="true">🏆</span>
                    <span>Certificate Available</span>
                  </div>
                )}
                <div className="pcd-meta-item" role="listitem">
                  <span className="pcd-meta-icon" aria-hidden="true">🌍</span>
                  <span>Online · Self-paced</span>
                </div>
              </div>
            </div>

            {/* Right: Enroll card — desktop only */}
            <div className="pcd-fade" style={{ animationDelay: "80ms" }}>
              <aside className="pcd-enroll-card" aria-label="Enrollment options">
                <div className="pcd-enroll-thumb">
                  <img
                    src={course.thumbnail_url || FALLBACK_THUMB}
                    alt={`${course.title} thumbnail`}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_THUMB; }}
                    width={360}
                    height={202}
                  />
                </div>
                <div className="pcd-enroll-body">
                  <div className="pcd-price-row">
                    <div className={`pcd-price${isFree ? " pcd-price-free" : ""}`}>
                      {isFree ? "Free" : `PKR ${Number(course.price).toLocaleString()}`}
                    </div>
                    {!isFree && <div className="pcd-price-sub">One-time payment</div>}
                  </div>

                  <Link href="/login" className="pcd-enroll-btn" aria-label={enrollAriaLabel}>
                    {enrollLabel}
                  </Link>
                  <p className="pcd-enroll-note">
                    {isFree ? "No credit card required" : "Secure checkout · Instant access"}
                  </p>

                  <ul className="pcd-enroll-features" aria-label="Course features">
                    {[
                      { icon: "📱", text: "Mobile-friendly learning" },
                      { icon: "🕐", text: "Learn at your own pace"  },
                      { icon: "🪙", text: "Earn AIDLA Coins as you learn" },
                      hasCert && {
                        icon: "🏆",
                        text: course.certificate_price === 0
                          ? "Free certificate on completion"
                          : `Certificate · PKR ${Number(course.certificate_price).toLocaleString()}`,
                      },
                      { icon: "🤖", text: "AI-powered support 24/7" },
                    ].filter(Boolean).map(feat => (
                      <li key={feat.text} className="pcd-enroll-feat">
                        <span className="pcd-enroll-feat-icon" aria-hidden="true">{feat.icon}</span>
                        {feat.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="pcd-main" id="main-content">
          <div className="pcd-layout">

            <div>
              {/* About */}
              <section className="pcd-desc-card pcd-fade" aria-labelledby="about-heading" style={{ animationDelay: "120ms" }}>
                <h2 className="pcd-section-title" id="about-heading">📖 About This Course</h2>
                <div className="pcd-desc-text">
                  {descParagraphs.length > 0
                    ? descParagraphs.map((para, i) => <p key={i}>{para}</p>)
                    : <p>{course.description || "No description available."}</p>
                  }
                </div>
              </section>

              {/* Details */}
              <section className="pcd-details-grid pcd-fade" aria-labelledby="details-heading" style={{ animationDelay: "160ms" }}>
                <h2 className="sr-only" id="details-heading">Course Details</h2>
                {details.map(d => (
                  <div key={d.label} className="pcd-detail-card">
                    <div className="pcd-detail-icon" aria-hidden="true">{d.icon}</div>
                    <div>
                      <div className="pcd-detail-lbl">{d.label}</div>
                      <div className="pcd-detail-val">{d.val}</div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Certificate callout */}
              {hasCert && (
                <div className="pcd-cert-card pcd-fade" role="region" aria-label="Certificate information" style={{ animationDelay: "200ms" }}>
                  <div className="pcd-cert-icon" aria-hidden="true">🏆</div>
                  <div className="pcd-cert-text">
                    <p className="pcd-cert-title">Verified Certificate of Completion</p>
                    <p className="pcd-cert-sub">
                      {course.certificate_price === 0
                        ? "Complete this course and earn a free verified certificate to share on LinkedIn and your CV."
                        : `Earn a verified certificate for just PKR ${Number(course.certificate_price).toLocaleString()} — a powerful addition to your profile.`}
                    </p>
                  </div>
                  <Link
                    href="/signup"
                    style={{
                      padding: "10px 20px", borderRadius: 30, border: "none",
                      background: "#0f172a", color: "#f59e0b",
                      fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", fontWeight: 800,
                      cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap",
                      boxShadow: "0 3px 12px rgba(15,23,42,0.2)", display: "inline-block",
                    }}
                  >
                    Get Certificate
                  </Link>
                </div>
              )}

              {/* Why AIDLA */}
              <section className="pcd-desc-card pcd-fade" aria-labelledby="why-heading" style={{ animationDelay: "240ms" }}>
                <h2 className="pcd-section-title" id="why-heading">🚀 Why Learn on AIDLA?</h2>
                <ul style={{ display: "flex", flexDirection: "column", gap: 14, listStyle: "none", padding: 0 }}>
                  {[
                    { icon: "🪙", title: "Earn Real Coins", desc: "Every quiz, test, and course completion rewards you with AIDLA Coins — redeemable for real prizes and cash." },
                    { icon: "🤖", title: "AI-Powered Learning", desc: "Personalised learning paths that adapt to your pace and style. Get instant explanations from our AI tutor 24/7." },
                    { icon: "🏆", title: "Compete & Win", desc: "Rise on the leaderboard, enter Lucky Draws, and spin the Lucky Wheel for bonus rewards." },
                    { icon: "💸", title: "100% Free to Join", desc: "No subscription, no hidden fees. Create your free account in 60 seconds and start learning today." },
                  ].map(item => (
                    <li key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      }} aria-hidden="true">{item.icon}</div>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: ".9rem", color: "#0f172a", marginBottom: 3 }}>{item.title}</h3>
                        <p style={{ fontSize: ".82rem", color: "#64748b", lineHeight: 1.6 }}>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Related courses */}
              {related.length > 0 && (
                <section aria-labelledby="related-heading" className="pcd-fade" style={{ animationDelay: "280ms" }}>
                  <h2 className="pcd-section-title" id="related-heading" style={{ marginBottom: 14 }}>
                    📚 You Might Also Like
                  </h2>
                  <div className="pcd-related-grid" role="list">
                    {related.map(c => {
                      const rlm   = LEVELS[c.level] || LEVELS.beginner;
                      const rSlug = toSlug(c.title);
                      return (
                        <Link
                          key={c.id}
                          href={`/courses/${rSlug}`}
                          className="pcd-related-card"
                          role="listitem"
                          aria-label={`View course: ${c.title}`}
                        >
                          <div className="pcd-related-thumb">
                            <img
                              src={c.thumbnail_url || FALLBACK_THUMB}
                              alt={`${c.title} thumbnail`}
                              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_THUMB; }}
                              width={220}
                              height={110}
                            />
                          </div>
                          <div className="pcd-related-body">
                            <p className="pcd-related-level" style={{ color: rlm.color }}>{rlm.label}</p>
                            <p className="pcd-related-title">{c.title}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right column spacer */}
            <div aria-hidden="true" />
          </div>
        </main>
      </div>

    </>
  );
}
