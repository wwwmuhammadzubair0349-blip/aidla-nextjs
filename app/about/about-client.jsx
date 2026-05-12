"use client";
// app/about/about-client.jsx — CLIENT COMPONENT

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/* ── Scroll reveal hook ── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.65s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
      }}
    >
      {children}
    </div>
  );
}

/* ── 3D Tilt card — desktop only (hover: hover devices) ── */
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -14;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
    el.style.boxShadow = "0 28px 60px rgba(15,23,42,0.15)";
  };
  const onLeave = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.boxShadow = "";
  };
  return (
    <div ref={ref} className={`ab-tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

/* ── Static data ── */
const MILESTONES = [
  { year: "2026", title: "The Spark", desc: "Identified the global access gap learners, freshers, and professionals face when premium education and career tools are locked behind paywalls." },
  { year: "2026", title: "Platform Launched", desc: "AIDLA goes live with AI tools, CV maker, and daily quiz competitions — 100% free, no watermarks." },
  { year: "2026", title: "Rewards Engine", desc: "AIDLA Coins system activated - real learn-to-earn rewards for active learners worldwide." },
  { year: "Now",  title: "500+ Learners", desc: "Pakistan's #1 AI-powered learning platform with global access." },
];

const VALUES = [
  { icon: "🤝", title: "Inclusivity",    desc: "Education and career growth should be accessible to students, professionals, freshers, and self-learners everywhere." },
  { icon: "💡", title: "Innovation",     desc: "Leveraging cutting-edge AI to solve real learning, productivity, career, and skill-building challenges." },
  { icon: "🔍", title: "Transparency",   desc: "From lucky draws to coin withdrawals — everything on AIDLA is openly tracked and verified." },
  { icon: "🚀", title: "Accessibility",  desc: "Every tool, course, and reward is designed to work on any device for users worldwide." },
];

const IMPACT_STATS = [
  { value: "500+",  label: "Active Learners",     desc: "Students & professionals learning free" },
  { value: "10K+",  label: "Coins Distributed",   desc: "Real rewards earned by learners" },
  { value: "15+",   label: "Free AI Tools",        desc: "CV, cover letter, interview prep & more" },
  { value: "100%",  label: "Free — Forever",       desc: "No subscriptions, no paywalls, ever" },
];

export default function AboutClient({ reviews = [], faqs = [], featuredIn = [] }) {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  const CARD_GRADIENTS = [
    "linear-gradient(160deg,#f59e0b 0%,#fcd34d 100%)",
    "linear-gradient(160deg,#1e293b 0%,#334155 100%)",
    "linear-gradient(160deg,#374151 0%,#6b7280 100%)",
  ];

  /* Fallback reviews when DB is empty */
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: "r1", full_name: "Ahmed Khan",    rating: 5, review_text: "AIDLA completely changed how I study. The daily quizzes kept me consistent and the coins made it genuinely exciting.", created_at: "2026-04-12T00:00:00Z", avatar_url: null },
    { id: "r2", full_name: "Fatima Malik",  rating: 5, review_text: "The AI career tools helped me write my CV and prepare for interviews. I got my first job offer after using AIDLA.", created_at: "2026-04-06T00:00:00Z", avatar_url: null },
    { id: "r3", full_name: "Bilal Hussain", rating: 5, review_text: "I never thought a completely free platform could offer this much. Real courses, AI tools, competitions. Absolutely love it.", created_at: "2026-03-30T00:00:00Z", avatar_url: null },
  ];

  /* Fallback featured in */
  const displayFeaturedIn = featuredIn.length > 0 ? featuredIn : [
    { id: "f1", name: "Dawn News",       logo_url: null, url: "https://www.dawn.com" },
    { id: "f2", name: "ARY News",        logo_url: null, url: "https://arynews.tv" },
    { id: "f3", name: "The News",        logo_url: null, url: "https://www.thenews.com.pk" },
    { id: "f4", name: "Geo News",        logo_url: null, url: "https://www.geo.tv" },
    { id: "f5", name: "Tribune Express", logo_url: null, url: "https://tribune.com.pk" },
    { id: "f6", name: "TechJuice",       logo_url: null, url: "https://www.techjuice.pk" },
  ];

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="ab-root">
      <style>{CSS}</style>

      {/* ══════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════ */}
      <section className="ab-hero" aria-labelledby="ab-hero-heading">
        <div className="ab-hero-inner">

          {/* Left — copy */}
          <div className="ab-hero-copy">
            {/* Breadcrumb */}
            <nav className="ab-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">About Us</span>
            </nav>

            <span className="ab-eyebrow">🇵🇰 Pakistan&apos;s #1 AI Powered Learning Platform</span>

            <h1 id="ab-hero-heading" className="ab-hero-title">
              Empowering Global<br />
              <em>Digital Learners.</em>
            </h1>

            <p className="ab-hero-sub">
              AIDLA gives students, professionals, freshers, career switchers, founders, and lifelong learners free access to AI education, career tools, courses, resources, and real rewards. Built in Pakistan for the world.
            </p>

            <div className="ab-hero-ctas">
              <Link href="/signup" className="ab-btn-primary">
                Start Learning Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/tools" className="ab-btn-ghost">Explore Tools →</Link>
            </div>

            {/* Quick stats */}
            <div className="ab-hero-stats" aria-label="Platform highlights">
              {[
                { value: "500+",    label: "Learners" },
                { value: "10K+",   label: "Coins Distributed" },
                { value: "15+",    label: "Free AI Tools" },
                { value: "100%",   label: "Free Forever" },
              ].map((s) => (
                <div key={s.label} className="ab-mini-stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — student hero image */}
          <div className="ab-hero-visual" aria-hidden="true">
            <div className="ab-hero-img-wrap">
              <Image
                src="/student-hero.png"
                alt="Global learner using AIDLA"
                fill
                style={{ objectFit: "cover", objectPosition: "top center" }}
                priority
                sizes="(max-width: 600px) 44vw, (max-width: 900px) 38vw, 40vw"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2. FEATURED IN
      ══════════════════════════════════════════════ */}
      {displayFeaturedIn.length > 0 && (
        <section className="ab-featured-section" aria-label="AIDLA featured in">
          <div className="ab-featured-inner">
            <p className="ab-featured-label">
              <span className="ab-featured-label-line" aria-hidden="true" />
              As Featured In
              <span className="ab-featured-label-line" aria-hidden="true" />
            </p>
            <div className="ab-featured-track-wrap" aria-hidden="true">
              <div className="ab-featured-track">
                {[...displayFeaturedIn, ...displayFeaturedIn].map((item, i) => (
                  <a
                    key={`${item.id}-${i}`}
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ab-featured-card"
                    tabIndex={i >= displayFeaturedIn.length ? -1 : 0}
                  >
                    {item.logo_url ? (
                      <img src={item.logo_url} alt={item.name} loading="lazy" className="ab-featured-img" />
                    ) : (
                      <span className="ab-featured-name">{item.name}</span>
                    )}
                    <span className="ab-featured-arrow">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          3. IMPACT NUMBERS
      ══════════════════════════════════════════════ */}
      <section className="ab-impact-section" aria-label="AIDLA impact at a glance">
        <div className="ab-impact-inner">
          {IMPACT_STATS.map((stat) => (
            <div key={stat.label} className="ab-impact-item">
              <strong className="ab-impact-num">{stat.value}</strong>
              <span className="ab-impact-label">{stat.label}</span>
              <p className="ab-impact-desc">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. MISSION & VISION
      ══════════════════════════════════════════════ */}
      <section className="ab-section" aria-labelledby="ab-mission-heading">
        <Reveal>
          <div className="ab-section-head ab-center">
            <span className="ab-eyebrow-dark">Our Purpose</span>
            <h2 id="ab-mission-heading">Mission &amp; Vision</h2>
            <p>Why AIDLA exists and where we&apos;re headed.</p>
          </div>

          <div className="ab-mv-grid">
            <TiltCard className="ab-mv-card ab-mv-card--mission">
              <div className="ab-mv-icon" aria-hidden="true">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower students and professionals across Pakistan by providing
                free access to AI-powered educational tools, career resources, and
                learning opportunities. We remove financial barriers from education
                — helping people build real-world skills and earn real rewards,
                all in one place.
              </p>
            </TiltCard>

            <TiltCard className="ab-mv-card ab-mv-card--vision">
              <div className="ab-mv-icon" aria-hidden="true">🔭</div>
              <h3>Our Vision</h3>
              <p>
                Talent exists everywhere — but opportunity does not. We envision a
                Pakistan where every student, regardless of income or location,
                has access to powerful AI tools, quality courses, and career-building
                resources. A future where learning is not a burden, but an opportunity
                to grow, earn, and thrive.
              </p>
            </TiltCard>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          4. FOUNDER SECTION — 3D card
      ══════════════════════════════════════════════ */}
      <section className="ab-section ab-section-alt" aria-labelledby="ab-founder-heading">
        <Reveal>
          <div className="ab-section-head ab-center">
            <span className="ab-eyebrow-dark">The Person Behind AIDLA</span>
            <h2 id="ab-founder-heading">Meet the Founder</h2>
          </div>

          <div className="ab-founder-wrap">
            {/* Founder card — 3D tilt on desktop, static on mobile */}
            <TiltCard className="ab-founder-card">

              {/* Header band — dark gradient with centered photo */}
              <div className="ab-founder-header">
                <div className="ab-founder-photo-ring">
                  <Image
                    src="/founder-zubair-afridi.jpg"
                    alt="Engineer Muhammad Zubair Afridi — Founder & CEO of AIDLA"
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    sizes="140px"
                  />
                </div>
                <div className="ab-founder-award">
                  <span className="ab-founder-award-icon" aria-hidden="true">🏅</span>
                  <span>Gold Medalist · SUIT Peshawar</span>
                </div>
              </div>

              {/* Body */}
              <div className="ab-founder-body">
                <h3 className="ab-founder-name">Engineer Muhammad<br />Zubair Afridi</h3>
                <p className="ab-founder-role">Founder &amp; CEO · AIDLA</p>
                <p className="ab-founder-location">📍 Peshawar, KPK, Pakistan</p>

                <blockquote className="ab-founder-message">
                  <p>&ldquo;Building AIDLA is my personal mission — to ensure no learner is left behind because of financial barriers. This platform is free, and always will be.&rdquo;</p>
                </blockquote>

                {/* Social icons — icon only circles */}
                <div className="ab-founder-socials">
                  <a href="https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/" target="_blank" rel="author noopener noreferrer" aria-label="LinkedIn" className="ab-social-icon ab-social-icon--li">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/engrzubairafridi/" target="_blank" rel="author noopener noreferrer" aria-label="Facebook" className="ab-social-icon ab-social-icon--fb">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/muhammad.zubair.afridi/" target="_blank" rel="author noopener noreferrer" aria-label="Instagram" className="ab-social-icon ab-social-icon--ig">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                </div>

                <a href="mailto:ceo@aidla.online" className="ab-founder-contact">
                  ✉️ ceo@aidla.online
                </a>
              </div>

            </TiltCard>

            {/* Story — newspaper layout */}
            <div className="ab-newspaper" itemScope itemType="https://schema.org/Person" itemID="#founder">
              <span itemProp="name" style={{ display: "none" }}>Engineer Muhammad Zubair Afridi</span>

              {/* Masthead */}
              <div className="ab-np-masthead">
                <div className="ab-np-rule" aria-hidden="true" />
                <div className="ab-np-masthead-inner">
                  <span className="ab-np-section-tag">Origin Story</span>
                  <h2 className="ab-np-headline">How AIDLA<br /><em>Started</em></h2>
                  <div className="ab-np-byline">
                    <span>By <strong>Engineer Muhammad Zubair Afridi</strong></span>
                    <span className="ab-np-dot" aria-hidden="true">·</span>
                    <span>Peshawar, Pakistan — 2026</span>
                  </div>
                </div>
                <div className="ab-np-rule" aria-hidden="true" />
              </div>

              {/* Two-column body */}
              <div className="ab-np-body">
                <p className="ab-np-dropcap">
                  AIDLA was born in Peshawar from a simple but powerful realization.
                  Millions of talented students work hard every day, yet many are
                  locked out of premium educational tools simply because they cannot
                  afford them.
                </p>

                {/* Pull quote */}
                <blockquote className="ab-np-pullquote">
                  &ldquo;Talent exists everywhere — opportunity does not.&rdquo;
                </blockquote>

                <p>
                  While students globally had access to advanced AI assistants,
                  professional CV builders, and modern learning systems — countless
                  students in Pakistan were still struggling with outdated resources
                  and expensive subscriptions.
                </p>
                <p>
                  <strong>Gold Medalist Electrical Engineer Muhammad Zubair Afridi</strong> decided
                  to challenge that reality. Instead of another paid platform, he
                  envisioned something radically different — an all-in-one AI-powered
                  educational ecosystem, free for learners worldwide. That
                  vision became <strong>AIDLA</strong>.
                </p>
              </div>

              {/* Timeline as sidebar column */}
              <div className="ab-np-timeline-wrap">
                <div className="ab-np-sidebar-head">Milestones</div>
                <div className="ab-timeline" role="list" aria-label="AIDLA milestones">
                  {MILESTONES.map((m, i) => (
                    <div key={i} className="ab-timeline-item" role="listitem">
                      <div className="ab-timeline-dot" aria-hidden="true" />
                      <div className="ab-timeline-body">
                        <span className="ab-timeline-year">{m.year}</span>
                        <h4>{m.title}</h4>
                        <p>{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          5. CORE VALUES
      ══════════════════════════════════════════════ */}
      <section className="ab-section ab-section-alt" aria-labelledby="ab-values-heading">
        <Reveal>
          <div className="ab-section-head ab-center">
            <span className="ab-eyebrow-dark">What We Stand For</span>
            <h2 id="ab-values-heading">Our Core Values</h2>
            <p>The principles that guide every decision we make at AIDLA.</p>
          </div>

          <div className="ab-values-grid">
            {VALUES.map((v) => (
              <article key={v.title} className="ab-value-card">
                <div className="ab-value-icon" aria-hidden="true">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════
          6. LEARNER REVIEWS — portrait layout
      ══════════════════════════════════════════════ */}
      <section className="ab-rv-section" aria-labelledby="ab-rv-heading">
        <div className="ab-rv-inner">
          <h2 id="ab-rv-heading" className="ab-rv-heading">Our Successful Learners Say</h2>

          <div className="ab-rv-body">
            {/* LEFT — animated quote, re-mounts on activeReviewIdx change */}
            <div className="ab-rv-left" key={activeReviewIdx}>
              <span className="ab-rv-openquote" aria-hidden="true">❝</span>
              <p className="ab-rv-featured-text">{displayReviews[activeReviewIdx]?.review_text}</p>
              <div className="ab-rv-stars" aria-label={`${displayReviews[activeReviewIdx]?.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} aria-hidden="true" className={i < displayReviews[activeReviewIdx]?.rating ? "ab-rv-star-filled" : "ab-rv-star-empty"}>★</span>
                ))}
              </div>
              <p className="ab-rv-name">— {displayReviews[activeReviewIdx]?.full_name}</p>
            </div>

            {/* RIGHT — portrait cards */}
            <div className="ab-rv-right">
              {/* Main featured card */}
              <div
                className="ab-rv-portrait ab-rv-portrait-main"
                style={{ "--pc-bg": CARD_GRADIENTS[activeReviewIdx % CARD_GRADIENTS.length] }}
                aria-label={`${displayReviews[activeReviewIdx]?.full_name} — featured`}
              >
                {displayReviews[activeReviewIdx]?.avatar_url
                  ? <img src={displayReviews[activeReviewIdx].avatar_url} alt={displayReviews[activeReviewIdx].full_name} className="ab-rv-img" loading="lazy" />
                  : <span className="ab-rv-initial">{displayReviews[activeReviewIdx]?.full_name?.[0]?.toUpperCase() || "L"}</span>
                }
                <div className="ab-rv-badge-main">{displayReviews[activeReviewIdx]?.full_name?.split(" ")[0] || "Learner"}</div>
              </div>

              {/* Side cards — clickable */}
              <div className="ab-rv-side-stack">
                {displayReviews
                  .map((r, i) => ({ ...r, origIdx: i }))
                  .filter((_, i) => i !== activeReviewIdx)
                  .slice(0, 2)
                  .map((review) => (
                    <button
                      key={review.id}
                      className="ab-rv-portrait ab-rv-portrait-side ab-rv-btn"
                      style={{ "--pc-bg": CARD_GRADIENTS[review.origIdx % CARD_GRADIENTS.length] }}
                      onClick={() => setActiveReviewIdx(review.origIdx)}
                      aria-label={`Show review by ${review.full_name}`}
                      suppressHydrationWarning
                    >
                      {review.avatar_url
                        ? <img src={review.avatar_url} alt={review.full_name} className="ab-rv-img" loading="lazy" />
                        : <span className="ab-rv-initial ab-rv-initial--sm">{review.full_name?.[0]?.toUpperCase() || "L"}</span>
                      }
                      <div className="ab-rv-badge-side">{review.full_name?.split(" ")[0] || "Learner"}</div>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          7. CAREERS TEASER — bulletin board job posting
      ══════════════════════════════════════════════ */}
      <section className="ab-careers-teaser" aria-labelledby="ab-careers-heading">
        {/* torn paper top edge */}
        <div className="ab-careers-torn" aria-hidden="true" />

        <div className="ab-careers-inner">
          {/* HIRING stamp */}
          <div className="ab-careers-stamp" aria-hidden="true">
            <span>NOW</span>
            <span>HIRING</span>
          </div>

          <div className="ab-careers-board">
            {/* Left — headline */}
            <div className="ab-careers-left">
              <p className="ab-careers-dateline">AIDLA · Peshawar, Pakistan · 2026</p>
              <h2 id="ab-careers-heading">Build the Future<br /><em>of Free Education.</em></h2>
              <p>We need builders, educators, designers &amp; dreamers to help us give learners worldwide the tools they deserve — free.</p>
            </div>

            {/* Right — roles + CTA */}
            <div className="ab-careers-right">
              <p className="ab-careers-roles-label">Open Departments</p>
              <div className="ab-careers-roles">
                {["Engineering", "Design", "Content", "Growth", "Education"].map((r) => (
                  <span key={r} className="ab-careers-role-tag">{r}</span>
                ))}
              </div>
              <Link href="/careers" className="ab-careers-btn">
                View Open Positions →
              </Link>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="ab-careers-footer-rule" aria-hidden="true">
            <span />
            <p>AIDLA Careers — Pakistan&apos;s #1 AI Powered Learning Platform</p>
            <span />
          </div>
        </div>
      </section>

    </div>
  );
}

/* ════════════════════════════════════════════════
   CSS — white + yellow, matches homepage exactly
════════════════════════════════════════════════ */
const CSS = `
/* ── Root ── */
.ab-root {
  background: #ffffff;
  color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Typography helpers ── */
.ab-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  padding: 5px 14px;
  background: rgba(255,255,255,0.55);
  border: 1px solid rgba(215,119,6,0.3);
  border-radius: 999px;
  color: #92400e;
  font-size: clamp(0.68rem,1.8vw,0.78rem);
  font-weight: 700;
  letter-spacing: 0.06em;
}

.ab-eyebrow-dark {
  display: block;
  margin-bottom: 8px;
  color: #d97706;
  font-size: clamp(0.68rem,1.8vw,0.75rem);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ab-eyebrow-light {
  display: block;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.55);
  font-size: clamp(0.68rem,1.8vw,0.75rem);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* ── Section layout ── */
.ab-section {
  padding: clamp(28px,6vw,72px) clamp(14px,4vw,48px);
  max-width: 1140px;
  margin: 0 auto;
}
.ab-section-alt {
  background: #f8fafc;
  max-width: 100%;
  padding: clamp(28px,6vw,72px) clamp(14px,4vw,48px);
}
.ab-section-alt > * {
  max-width: 1140px;
  margin-left: auto;
  margin-right: auto;
}
.ab-section-head { margin-bottom: clamp(20px,3vw,40px); }
.ab-section-head h2 {
  margin: 0 0 8px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.4rem,4vw,2.4rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.ab-section-head p {
  margin: 0;
  color: #475569;
  font-size: clamp(0.92rem,2vw,1.02rem);
  line-height: 1.7;
}
.ab-center { text-align: center; max-width: 640px; margin-left: auto; margin-right: auto; }

/* ── Buttons ── */
.ab-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  min-height: 50px;
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(245,158,11,0.32);
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
}
.ab-btn-primary:hover { background: #d97706; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(245,158,11,0.4); }

.ab-btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  min-height: 50px;
  border-radius: 999px;
  background: transparent;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid #e2e8f0;
  transition: border-color 0.18s, background 0.18s;
}
.ab-btn-ghost:hover { border-color: #0f172a; background: #f8fafc; }

.ab-btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 999px;
  border: 2px solid #e2e8f0;
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.18s, color 0.18s, background 0.18s;
  white-space: nowrap;
}
.ab-btn-outline:hover { border-color: #f59e0b; color: #d97706; background: #fffbeb; }

/* ── 3D tilt base ── */
.ab-tilt {
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s;
  transform-style: preserve-3d;
  will-change: transform;
}

/* ── Breadcrumb ── */
.ab-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
}
.ab-breadcrumb a { color: #92400e; text-decoration: none; transition: color 0.15s; opacity: 0.7; }
.ab-breadcrumb a:hover { opacity: 1; }
.ab-breadcrumb span[aria-current] { color: #0f172a; }

/* ════════════════════════════════
   1. HERO — mobile-first, 320px+
════════════════════════════════ */
.ab-hero {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%);
  padding: 0 clamp(14px,4vw,48px) 0;
  border-bottom: 1px solid #f0c96a;
  overflow: hidden;
}
.ab-hero-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 44%;
  align-items: stretch;
  gap: 0;
  min-height: clamp(280px, 72vw, 420px);
}
@media (min-width: 600px) {
  .ab-hero-inner { grid-template-columns: 1fr 38%; min-height: clamp(320px, 55vw, 420px); }
}
@media (min-width: 900px) {
  .ab-hero-inner { grid-template-columns: 1fr 40%; min-height: 420px; }
}
.ab-hero-copy {
  padding: clamp(12px,3vw,32px) 8px clamp(12px,3vw,32px) 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.ab-hero-title {
  margin: 0 0 6px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.05rem, 5.5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.ab-hero-title em { font-style: italic; color: #d97706; }
.ab-hero-sub {
  margin: 0 0 10px;
  color: #475569;
  font-size: clamp(0.7rem, 2.2vw, 1.05rem);
  line-height: 1.65;
}
.ab-hero-ctas { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.ab-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 clamp(10px,2.5vw,28px);
  min-height: clamp(34px,6vw,50px);
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: clamp(0.68rem,2vw,0.94rem);
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(245,158,11,0.3);
  transition: background 0.18s, transform 0.18s;
  white-space: nowrap;
}
.ab-btn-primary:hover { background: #d97706; transform: translateY(-2px); }
.ab-btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0 clamp(10px,2.5vw,24px);
  min-height: clamp(34px,6vw,50px);
  border-radius: 999px;
  background: rgba(255,255,255,0.5);
  color: #0f172a;
  font-size: clamp(0.68rem,2vw,0.94rem);
  font-weight: 700;
  text-decoration: none;
  border: 2px solid rgba(15,23,42,0.2);
  transition: border-color 0.18s, background 0.18s;
  white-space: nowrap;
}
.ab-btn-ghost:hover { border-color: #0f172a; background: rgba(255,255,255,0.8); }
/* stats row — 2 cols on 320, flex row on 480+ */
.ab-hero-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}
@media (min-width: 480px) {
  .ab-hero-stats { display: flex; flex-wrap: wrap; gap: 5px; }
}
.ab-mini-stat {
  display: flex;
  flex-direction: column;
  padding: clamp(5px,1vw,10px) clamp(6px,1.5vw,16px);
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(215,119,6,0.2);
  border-radius: 8px;
}
.ab-mini-stat strong {
  font-family: 'Playfair Display', serif;
  font-size: clamp(0.82rem,3vw,1.8rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}
.ab-mini-stat span { font-size: clamp(0.5rem,1.4vw,0.68rem); font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

/* Hero image col */
.ab-hero-visual {
  position: relative;
  align-self: stretch;
  background: transparent;
  overflow: hidden;
}
.ab-hero-img-wrap { position: absolute; inset: 0; }

@media (max-width: 360px) {
  .ab-hero-sub  { display: none; }
  .ab-hero-stats { display: none; }
}

@keyframes ab-float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ════════════════════════════════
   2. FEATURED IN — enhanced
════════════════════════════════ */
.ab-featured-section {
  background: #fff;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: clamp(28px,4vw,44px) 0;
  overflow: hidden;
}
.ab-featured-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.ab-featured-label {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #94a3b8;
  white-space: nowrap;
  padding: 0 clamp(20px,5vw,48px);
}
.ab-featured-label-line {
  display: block;
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  min-width: 40px;
}
/* scrolling marquee track */
.ab-featured-track-wrap {
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}
.ab-featured-track {
  display: flex;
  gap: 12px;
  width: max-content;
  animation: ab-scroll 28s linear infinite;
  padding: 4px 0;
}
.ab-featured-track:hover { animation-play-state: paused; }
@keyframes ab-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.ab-featured-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.ab-featured-card:hover {
  border-color: #f59e0b;
  background: #fffbeb;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(245,158,11,0.18);
}
.ab-featured-img { height: 22px; width: auto; object-fit: contain; filter: grayscale(100%); transition: filter 0.2s; }
.ab-featured-card:hover .ab-featured-img { filter: none; }
.ab-featured-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #334155;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}
.ab-featured-card:hover .ab-featured-name { color: #92400e; }
.ab-featured-arrow {
  font-size: 0.72rem;
  color: #94a3b8;
  transition: color 0.2s, transform 0.2s;
}
.ab-featured-card:hover .ab-featured-arrow { color: #f59e0b; transform: translate(2px,-2px); }

/* ════════════════════════════════
   CAREERS TEASER — bulletin board
════════════════════════════════ */
.ab-careers-teaser {
  background: #fdf6e3;
  position: relative;
  border-top: none;
  overflow: visible;
}
/* torn paper top edge */
.ab-careers-torn {
  position: relative;
  height: 22px;
  background: #fdf6e3;
  clip-path: polygon(0% 100%,1% 30%,3% 90%,5% 10%,7% 75%,9% 5%,11% 85%,13% 20%,15% 95%,17% 15%,19% 80%,21% 0%,23% 70%,25% 35%,27% 90%,29% 10%,31% 65%,33% 40%,35% 95%,37% 20%,39% 75%,41% 5%,43% 88%,45% 25%,47% 80%,49% 0%,51% 70%,53% 40%,55% 92%,57% 15%,59% 72%,61% 30%,63% 90%,65% 8%,67% 65%,69% 38%,71% 95%,73% 18%,75% 78%,77% 5%,79% 68%,81% 30%,83% 85%,85% 10%,87% 75%,89% 22%,91% 88%,93% 12%,95% 82%,97% 28%,99% 60%,100% 100%);
  margin-top: -4px;
}
.ab-careers-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: clamp(16px,2.5vw,28px) clamp(20px,5vw,48px) clamp(20px,3vw,36px);
  position: relative;
}
/* HIRING stamp */
.ab-careers-stamp {
  position: absolute;
  top: clamp(10px,2vw,20px);
  right: clamp(14px,4vw,48px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: clamp(58px,14vw,72px);
  height: clamp(58px,14vw,72px);
  border: clamp(2px,0.5vw,3px) solid #c0392b;
  border-radius: 4px;
  transform: rotate(12deg);
  opacity: 0.85;
}
.ab-careers-stamp span {
  font-family: 'Playfair Display', serif;
  font-size: clamp(0.5rem,1.2vw,0.6rem);
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #c0392b;
  text-transform: uppercase;
  line-height: 1.3;
}
.ab-careers-stamp span:first-child { font-size: clamp(0.44rem,1vw,0.52rem); }
.ab-careers-stamp span:last-child  { font-size: clamp(0.7rem,1.6vw,0.85rem); letter-spacing: 0.08em; }

/* Board layout */
.ab-careers-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: clamp(76px,18vw,90px);
}
.ab-careers-dateline {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a7355;
  margin: 0 0 8px;
}
.ab-careers-left h2 {
  margin: 0 0 10px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.5rem,4vw,2.4rem);
  font-weight: 900;
  color: #1a1208;
  line-height: 1.08;
  letter-spacing: -0.02em;
}
.ab-careers-left h2 em { font-style: italic; color: #8a7355; }
.ab-careers-left > p { margin: 0; color: #4a3c2a; font-size: clamp(0.82rem,1.8vw,0.92rem); line-height: 1.75; max-width: 420px; }
.ab-careers-right { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.ab-careers-roles-label {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8a7355;
  border-top: 1.5px solid #1a1208;
  padding-top: 6px;
  margin: 0;
}
.ab-careers-roles { display: flex; flex-wrap: wrap; gap: 6px; }
.ab-careers-role-tag {
  padding: 5px 14px;
  background: #fff8e8;
  border: 1px solid #c9b48a;
  border-radius: 3px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #4a3c2a;
  letter-spacing: 0.04em;
  font-family: 'Playfair Display', serif;
}
.ab-careers-btn {
  display: inline-flex;
  align-items: center;
  padding: 0 22px;
  min-height: 42px;
  border-radius: 3px;
  background: #1a1208;
  color: #fdf6e3;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: background 0.18s, transform 0.18s;
  white-space: nowrap;
  margin-top: 4px;
}
.ab-careers-btn:hover { background: #2d2416; transform: translateY(-1px); }
/* Footer rule */
.ab-careers-footer-rule {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  border-top: 1px solid #c9b48a;
  padding-top: 10px;
}
.ab-careers-footer-rule span {
  flex: 1;
  height: 1px;
  background: #c9b48a;
}
.ab-careers-footer-rule p {
  margin: 0;
  font-size: clamp(0.52rem,1.4vw,0.6rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a7355;
  font-style: italic;
  text-align: center;
  flex-shrink: 1;
  min-width: 0;
}
@media (min-width: 768px) {
  .ab-careers-board { flex-direction: row; align-items: flex-start; gap: 48px; padding-right: 100px; }
  .ab-careers-left  { flex: 1; }
  .ab-careers-right { flex-shrink: 0; min-width: 220px; }
}

/* ════════════════════════════════
   3. IMPACT NUMBERS — Notion style
════════════════════════════════ */
.ab-impact-section {
  background: #0f172a;
  padding: clamp(20px,3vw,36px) clamp(16px,5vw,48px);
}
.ab-impact-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  overflow: hidden;
}
.ab-impact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(14px,2vw,24px) clamp(10px,2vw,20px);
  background: #0f172a;
  gap: 2px;
  transition: background 0.2s;
}
.ab-impact-item:hover { background: #1e293b; }
.ab-impact-num {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.6rem,4vw,2.8rem);
  font-weight: 900;
  color: #f59e0b;
  line-height: 1;
  letter-spacing: -0.03em;
}
.ab-impact-label {
  font-size: clamp(0.6rem,1.3vw,0.75rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.ab-impact-desc {
  margin: 2px 0 0;
  font-size: clamp(0.58rem,1.1vw,0.7rem);
  color: rgba(255,255,255,0.4);
  line-height: 1.45;
}
@media (min-width: 640px) {
  .ab-impact-inner { grid-template-columns: repeat(4, 1fr); }
}

/* ════════════════════════════════
   4. MISSION & VISION
════════════════════════════════ */
.ab-mv-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.ab-mv-card {
  padding: clamp(18px,3vw,32px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  cursor: default;
}
.ab-mv-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  border-radius: 0;
}
.ab-mv-card--mission::before { background: linear-gradient(90deg,#f59e0b,#d97706); }
.ab-mv-card--vision::before  { background: linear-gradient(90deg,#0f172a,#475569); }
.ab-mv-icon { font-size: 2.2rem; margin-bottom: 16px; display: block; }
.ab-mv-card h3 {
  margin: 0 0 10px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.1rem,2.5vw,1.3rem);
  font-weight: 800;
  color: #0f172a;
}
.ab-mv-card p {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.75;
}

/* ════════════════════════════════
   4. FOUNDER — enhanced card
════════════════════════════════ */
.ab-founder-wrap {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.ab-founder-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  overflow: hidden;
  cursor: default;
  box-shadow: 0 8px 32px rgba(15,23,42,0.08);
}

/* Dark gradient header band */
.ab-founder-header {
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #1a2744 100%);
  padding: clamp(24px,4vw,36px) clamp(16px,3vw,28px) clamp(48px,6vw,60px);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.ab-founder-header::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 50%, #f59e0b 100%);
}

/* Circular photo with gold ring */
.ab-founder-photo-ring {
  position: relative;
  width: clamp(100px,18vw,130px);
  height: clamp(100px,18vw,130px);
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f59e0b;
  box-shadow: 0 0 0 4px rgba(245,158,11,0.2), 0 12px 32px rgba(0,0,0,0.4);
  flex-shrink: 0;
}

/* Gold medal award badge */
.ab-founder-award {
  position: absolute;
  bottom: -1px;
  left: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  background: linear-gradient(135deg, #f59e0b, #fcd34d);
  color: #0f172a;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(245,158,11,0.4);
  transform: translateX(-50%) translateY(50%);
}
.ab-founder-award-icon { font-size: 0.82rem; }

/* Card body */
.ab-founder-body {
  padding: clamp(32px,5vw,44px) clamp(16px,3vw,28px) clamp(20px,3vw,28px);
  text-align: center;
}
.ab-founder-name {
  margin: 0 0 5px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.05rem,3vw,1.3rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.18;
}
.ab-founder-role {
  margin: 0 0 3px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #d97706;
  letter-spacing: 0.02em;
}
.ab-founder-location {
  margin: 0 0 18px;
  font-size: 0.75rem;
  color: #94a3b8;
}
.ab-founder-message {
  margin: 0 0 18px;
  padding: 14px 16px;
  border-left: 3px solid #f59e0b;
  background: #fffbeb;
  border-radius: 0 10px 10px 0;
  text-align: left;
}
.ab-founder-message p {
  margin: 0;
  color: #0f172a;
  font-size: clamp(0.78rem,1.8vw,0.88rem);
  line-height: 1.72;
  font-style: italic;
}

/* Social icon circles */
.ab-founder-socials {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
}
.ab-social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  text-decoration: none;
  transition: transform 0.18s, opacity 0.18s;
  flex-shrink: 0;
}
.ab-social-icon:hover { transform: translateY(-3px) scale(1.1); opacity: 0.9; }
.ab-social-icon--li { background: #0077b5; color: #fff; }
.ab-social-icon--fb { background: #1877f2; color: #fff; }
.ab-social-icon--ig { background: linear-gradient(135deg,#f09433,#dc2743,#bc1888); color: #fff; }

.ab-founder-contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #d97706;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s;
  width: 100%;
}
.ab-founder-contact:hover { color: #0f172a; text-decoration: underline; }

/* ── Newspaper Origin Story ── */
.ab-newspaper {
  background: #faf8f2;
  border: 1px solid #ddd5c0;
  border-radius: 4px;
  padding: clamp(20px,3vw,36px);
  position: relative;
}
.ab-np-masthead { text-align: center; margin-bottom: 20px; }
.ab-np-rule {
  height: 1px;
  background: #b8a98a;
  margin: 8px 0;
}
.ab-np-masthead-inner { padding: 10px 0 8px; }
.ab-np-section-tag {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8a7355;
  margin-bottom: 6px;
}
.ab-np-headline {
  margin: 0 0 8px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.5rem,4vw,2.4rem);
  font-weight: 900;
  color: #1a1208;
  line-height: 1.08;
  letter-spacing: -0.02em;
}
.ab-np-headline em { font-style: italic; color: #8a7355; }
.ab-np-byline {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: clamp(0.62rem,1.6vw,0.72rem);
  color: #8a7355;
  font-style: italic;
}
.ab-np-byline strong { font-style: normal; color: #1a1208; font-weight: 700; }
.ab-np-dot { color: #b8a98a; }

/* Two-column body */
.ab-np-body {
  column-count: 1;
  column-gap: 32px;
  column-rule: 1px solid #ddd5c0;
  margin-bottom: 20px;
}
.ab-np-body p {
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: #2d2416;
  line-height: 1.82;
  text-align: justify;
  hyphens: auto;
  break-inside: avoid;
}
/* Drop cap */
.ab-np-dropcap::first-letter {
  float: left;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3.8em;
  font-weight: 900;
  line-height: 0.78;
  margin: 4px 8px 0 0;
  color: #8a7355;
}
/* Pull quote */
.ab-np-pullquote {
  margin: 0 0 14px;
  padding: 14px 16px;
  border-top: 2px solid #1a1208;
  border-bottom: 2px solid #1a1208;
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: clamp(0.9rem,2vw,1.05rem);
  font-style: italic;
  font-weight: 700;
  color: #1a1208;
  line-height: 1.5;
  break-inside: avoid;
}

/* Milestones sidebar */
.ab-np-sidebar-head {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8a7355;
  border-top: 2px solid #1a1208;
  padding-top: 8px;
  margin-bottom: 12px;
}
.ab-np-timeline-wrap .ab-timeline-body p { color: #4a3c2a; }
.ab-np-timeline-wrap .ab-timeline-body h4 { color: #1a1208; }
.ab-np-timeline-wrap .ab-timeline::before { background: linear-gradient(to bottom,#b8a98a,#ddd5c0); }
.ab-np-timeline-wrap .ab-timeline-dot { background: #8a7355; box-shadow: 0 0 0 2px rgba(138,115,85,0.25); border-color: #faf8f2; }

@media (min-width: 640px) {
  .ab-np-body { column-count: 2; }
}

/* Timeline */
.ab-timeline { position: relative; padding-left: 24px; margin-top: 28px; }
.ab-timeline::before {
  content: '';
  position: absolute;
  left: 7px; top: 8px; bottom: 8px;
  width: 2px;
  background: linear-gradient(to bottom,#f59e0b,#e2e8f0);
  border-radius: 2px;
}
.ab-timeline-item {
  position: relative;
  padding: 0 0 24px 20px;
  display: flex;
  flex-direction: column;
}
.ab-timeline-item:last-child { padding-bottom: 0; }
.ab-timeline-dot {
  position: absolute;
  left: -17px; top: 5px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #f59e0b;
  border: 2.5px solid #fff;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.3);
}
.ab-timeline-year {
  font-size: 0.68rem;
  font-weight: 800;
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 3px;
}
.ab-timeline-body h4 {
  margin: 0 0 4px;
  font-size: 0.97rem;
  font-weight: 800;
  color: #0f172a;
}
.ab-timeline-body p {
  margin: 0;
  font-size: 0.86rem;
  color: #64748b;
  line-height: 1.6;
}


/* ════════════════════════════════
   6. VALUES
════════════════════════════════ */
.ab-values-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 14px;
}
.ab-value-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: clamp(18px,3vw,24px) 18px;
  text-align: center;
  transition: box-shadow 0.2s, transform 0.2s;
}
.ab-value-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.08); transform: translateY(-3px); }
.ab-value-icon {
  display: flex;
  width: 48px; height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg,#fffbeb,#fef3c7);
  border: 1px solid rgba(245,158,11,0.2);
  font-size: 1.3rem;
  margin: 0 auto 12px;
}
.ab-value-card h3 { margin: 0 0 6px; font-family: 'Playfair Display', serif; font-size: 0.98rem; font-weight: 800; color: #0f172a; }
.ab-value-card p  { margin: 0; font-size: 0.82rem; color: #64748b; line-height: 1.6; }

/* ════════════════════════════════
   9. PORTRAIT REVIEWS (below CTA)
════════════════════════════════ */
.ab-rv-section {
  background: #f8fafc;
  padding: clamp(32px,6vw,80px) clamp(14px,4vw,48px);
}
.ab-rv-inner { max-width: 1140px; margin: 0 auto; }
.ab-rv-heading {
  margin: 0 0 clamp(24px,5vw,56px);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.3rem,5vw,2.8rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
}
.ab-rv-body { display: flex; flex-direction: column; gap: 28px; align-items: center; }
.ab-rv-left { max-width: 480px; width: 100%; animation: ab-rv-fadein 0.36s ease both; }
@keyframes ab-rv-fadein {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.ab-rv-openquote {
  display: block;
  font-family: Georgia, serif;
  font-size: clamp(4rem,12vw,10rem);
  color: #dde3ec;
  line-height: 0.65;
  margin-bottom: 14px;
  user-select: none;
}
.ab-rv-featured-text { margin: 0 0 18px; font-size: clamp(0.88rem,2.8vw,1.15rem); font-style: italic; color: #0f172a; line-height: 1.75; }
.ab-rv-stars { display: flex; gap: 4px; font-size: 1.5rem; }
.ab-rv-star-filled { color: #f59e0b; }
.ab-rv-star-empty  { color: #e2e8f0; }
.ab-rv-name { margin: 16px 0 0; font-size: 0.92rem; font-weight: 700; color: #0f172a; }
.ab-rv-right { display: flex; gap: 14px; align-items: flex-end; flex-shrink: 0; }
.ab-rv-portrait {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: var(--pc-bg, linear-gradient(160deg,#f59e0b,#fcd34d));
  display: flex;
  align-items: center;
  justify-content: center;
}
.ab-rv-side-stack { display: flex; flex-direction: column; gap: 14px; align-self: flex-end; }
.ab-rv-portrait-side { border-radius: 14px; }
.ab-rv-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ab-rv-initial {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
  color: rgba(255,255,255,0.8);
  user-select: none;
  position: relative;
  z-index: 1;
  font-size: 3rem;
}
.ab-rv-initial--sm { font-size: 1.9rem; }
.ab-rv-badge-main {
  position: absolute;
  bottom: 16px; left: 16px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 999px;
  white-space: nowrap;
  z-index: 2;
}
.ab-rv-badge-side {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 7px 8px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
}
.ab-rv-btn {
  border: none; padding: 0; cursor: pointer;
  -webkit-appearance: none; appearance: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.ab-rv-btn:hover { transform: scale(1.05) translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.22); }
.ab-rv-btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; border-radius: 18px; }
/* Sizes — 320px base */
.ab-rv-portrait-main { width: clamp(110px,32vw,150px); height: clamp(160px,48vw,224px); }
.ab-rv-portrait-side { width: clamp(70px,20vw,96px);  height: clamp(76px,22vw,104px); }
.ab-rv-badge-main { bottom: 10px; left: 10px; font-size: 0.72rem; padding: 6px 12px; }
@media (min-width: 400px) {
  .ab-rv-portrait-main { width: 150px; height: 224px; }
  .ab-rv-portrait-side { width: 96px;  height: 104px; }
  .ab-rv-badge-main { bottom: 14px; left: 14px; font-size: 0.82rem; padding: 7px 16px; }
}
@media (min-width: 480px) {
  .ab-rv-portrait-main { width: 176px; height: 264px; }
  .ab-rv-portrait-side { width: 112px; height: 120px; }
  .ab-rv-initial { font-size: 3.6rem; }
  .ab-rv-initial--sm { font-size: 2.2rem; }
}
@media (min-width: 768px) {
  .ab-rv-body { flex-direction: row; gap: 48px; align-items: center; }
  .ab-rv-left { flex: 1; max-width: none; }
  .ab-rv-portrait-main { width: 210px; height: 320px; }
  .ab-rv-portrait-side { width: 138px; height: 148px; border-radius: 18px; }
  .ab-rv-initial { font-size: 4rem; }
  .ab-rv-initial--sm { font-size: 2.4rem; }
}


/* ════════════════════════════════
   9. FINAL CTA — yellow theme, compact
════════════════════════════════ */
.ab-final-cta {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: clamp(32px,4vw,52px) clamp(20px,5vw,48px);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.ab-final-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}
.ab-cta-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
.ab-eyebrow-light { color: rgba(15,23,42,0.55); }
.ab-cta-inner h2 {
  margin: 4px 0 10px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem,4vw,2.4rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.ab-cta-inner p { margin: 0 0 20px; color: rgba(15,23,42,0.7); font-size: clamp(0.88rem,2vw,0.97rem); line-height: 1.65; }
.ab-cta-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.ab-cta-btn-dark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  min-height: 48px;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(15,23,42,0.25);
  transition: background 0.18s, transform 0.18s;
}
.ab-cta-btn-dark:hover { background: #1e293b; transform: translateY(-2px); }
.ab-cta-ghost-btn {
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  min-height: 48px;
  border-radius: 999px;
  border: 2px solid rgba(15,23,42,0.25);
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 0.18s, background 0.18s;
}
.ab-cta-ghost-btn:hover { border-color: #0f172a; background: rgba(15,23,42,0.08); }

/* ════════════════════════════════
   RESPONSIVE BREAKPOINTS
════════════════════════════════ */

/* 320–479px: tighten paddings */
@media (max-width: 479px) {
  .ab-section { padding: clamp(24px,5vw,48px) clamp(12px,4vw,24px); }
  .ab-section-alt { padding: clamp(24px,5vw,48px) clamp(12px,4vw,24px); }
  .ab-featured-label { padding: 0 12px; }
  .ab-impact-section { padding: clamp(14px,3vw,28px) clamp(12px,4vw,24px); }
  .ab-newspaper { padding: 16px 14px; }
  .ab-np-dropcap::first-letter { font-size: 3em; }
  .ab-founder-photo-ring { width: 90px; height: 90px; }
  .ab-founder-body { padding-top: 36px; }
  .ab-values-grid { grid-template-columns: 1fr 1fr; }
  .ab-rv-section { padding: clamp(24px,5vw,48px) clamp(12px,4vw,24px); }
  .ab-careers-inner { padding: 12px 12px 16px; }
  .ab-careers-footer-rule { flex-wrap: wrap; gap: 8px; }
}

/* 480–639px */
@media (min-width: 480px) and (max-width: 639px) {
  .ab-values-grid { grid-template-columns: repeat(2,1fr); }
}

/* 640px+ */
@media (min-width: 640px) {
  .ab-mv-grid { grid-template-columns: repeat(2,1fr); }
}

/* 768px+ */
@media (min-width: 768px) {
  .ab-values-grid { grid-template-columns: repeat(2,1fr); }
}

/* 900px+ */
@media (min-width: 900px) {
  .ab-founder-wrap { flex-direction: row; gap: 48px; align-items: flex-start; }
  .ab-founder-card { flex: 0 0 320px; position: sticky; top: 90px; }
  .ab-newspaper    { flex: 1; min-width: 0; }
  .ab-values-grid  { grid-template-columns: repeat(4,1fr); }
}

/* 1024px+ */
@media (min-width: 1024px) {
  .ab-founder-card { flex: 0 0 340px; }
}

@media (prefers-reduced-motion: reduce) {
  .ab-root *, .ab-root *::before, .ab-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
