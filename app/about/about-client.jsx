"use client";
// app/about/about-client.jsx â€” CLIENT COMPONENT

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./about-client.css";

/* â”€â”€ Scroll reveal hook â”€â”€ */
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

/* â”€â”€ 3D Tilt card â€” desktop only (hover: hover devices) â”€â”€ */
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

/* â”€â”€ Static data â”€â”€ */
const MILESTONES = [
  { year: "2026", title: "The Spark", desc: "Identified the global access gap learners, freshers, and professionals face when premium education and career tools are locked behind paywalls." },
  { year: "2026", title: "Platform Launched", desc: "AIDLA goes live with AI tools, CV maker, and daily quiz competitions â€” 100% free, no watermarks." },
  { year: "2026", title: "Rewards Engine", desc: "AIDLA Coins system activated - real learn-to-earn rewards for active learners worldwide." },
  { year: "Now",  title: "500+ Learners", desc: "A growing global AI learning platform for students, professionals, and lifelong learners worldwide." },
];

const VALUES = [
  { icon: "ðŸ¤", title: "Inclusivity",    desc: "Education and career growth should be accessible to students, professionals, freshers, and self-learners everywhere." },
  { icon: "ðŸ’¡", title: "Innovation",     desc: "Leveraging cutting-edge AI to solve real learning, productivity, career, and skill-building challenges." },
  { icon: "ðŸ”", title: "Transparency",   desc: "From lucky draws to coin withdrawals â€” everything on AIDLA is openly tracked and verified." },
  { icon: "ðŸš€", title: "Accessibility",  desc: "Every tool, course, and reward is designed to work on any device for users worldwide." },
];

const IMPACT_STATS = [
  { value: "500+",  label: "Active Learners",     desc: "Students & professionals learning free" },
  { value: "10K+",  label: "Coins Distributed",   desc: "Real rewards earned by learners" },
  { value: "15+",   label: "Free AI Tools",        desc: "CV, cover letter, interview prep & more" },
  { value: "100%",  label: "Free â€” Forever",       desc: "No subscriptions, no paywalls, ever" },
];

export default function AboutClient({ reviews = [], faqs = [], featuredIn = [] }) {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  const CARD_GRADIENTS = [
    "linear-gradient(160deg,#f59e0b 0%,#fcd34d 100%)",
    "linear-gradient(160deg,#1e293b 0%,#334155 100%)",
    "linear-gradient(160deg,#374151 0%,#6b7280 100%)",
  ];

  /* Fallback reviews when DB is empty */
  const displayReviews = reviews;

  /* Fallback featured in */
  const displayFeaturedIn = featuredIn.filter((item) => item.url && item.url !== "#");

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="ab-root">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          1. HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ab-hero" aria-labelledby="ab-hero-heading">
        <div className="ab-hero-inner">

          {/* Left â€” copy */}
          <div className="ab-hero-copy">
            {/* Breadcrumb */}
            <nav className="ab-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">About Us</span>
            </nav>

            <span className="ab-eyebrow">ðŸŒ Global AI Learning Platform for Students &amp; Professionals</span>

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
              <Link href="/tools" className="ab-btn-ghost">Explore Tools â†’</Link>
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

          {/* Right â€” student hero image */}
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          2. FEATURED IN
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                    <span className="ab-featured-arrow">â†—</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          3. IMPACT NUMBERS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          4. MISSION & VISION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ab-section" aria-labelledby="ab-mission-heading">
        <Reveal>
          <div className="ab-section-head ab-center">
            <span className="ab-eyebrow-dark">Our Purpose</span>
            <h2 id="ab-mission-heading">Mission &amp; Vision</h2>
            <p>Why AIDLA exists and where we&apos;re headed.</p>
          </div>

          <div className="ab-mv-grid">
            <TiltCard className="ab-mv-card ab-mv-card--mission">
              <div className="ab-mv-icon" aria-hidden="true">ðŸŽ¯</div>
              <h3>Our Mission</h3>
              <p>
                To empower students and professionals worldwide by providing
                free access to AI-powered educational tools, career resources, and
                learning opportunities. We remove financial barriers from education
                â€” helping people build real-world skills and earn real rewards,
                all in one place.
              </p>
            </TiltCard>

            <TiltCard className="ab-mv-card ab-mv-card--vision">
              <div className="ab-mv-icon" aria-hidden="true">ðŸ”­</div>
              <h3>Our Vision</h3>
              <p>
                Talent exists everywhere â€” but opportunity does not. We envision a
                world where every student and professional, regardless of income or location,
                has access to powerful AI tools, quality courses, and career-building
                resources. A future where learning is not a burden, but an opportunity
                to grow, earn, and thrive.
              </p>
            </TiltCard>
          </div>
        </Reveal>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          4. FOUNDER SECTION â€” 3D card
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="ab-section ab-section-alt" aria-labelledby="ab-founder-heading">
        <Reveal>
          <div className="ab-section-head ab-center">
            <span className="ab-eyebrow-dark">The Person Behind AIDLA</span>
            <h2 id="ab-founder-heading">Meet the Founder</h2>
          </div>

          <div className="ab-founder-wrap">
            {/* Founder card â€” 3D tilt on desktop, static on mobile */}
            <TiltCard className="ab-founder-card">

              {/* Header band â€” dark gradient with centered photo */}
              <div className="ab-founder-header">
                <div className="ab-founder-photo-ring">
                  <Image
                    src="/founder-zubair-afridi.jpg"
                    alt="Engineer Muhammad Zubair Afridi â€” Founder & CEO of AIDLA"
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    sizes="140px"
                  />
                </div>
                <div className="ab-founder-award">
                  <span className="ab-founder-award-icon" aria-hidden="true">ðŸ…</span>
                  <span>Gold Medalist Â· SUIT Peshawar</span>
                </div>
              </div>

              {/* Body */}
              <div className="ab-founder-body">
                <h3 className="ab-founder-name">Engineer Muhammad<br />Zubair Afridi</h3>
                <p className="ab-founder-role">Founder &amp; CEO Â· AIDLA</p>
                <p className="ab-founder-location">ðŸ“ Peshawar, KPK, Pakistan</p>

                <blockquote className="ab-founder-message">
                  <p>&ldquo;Building AIDLA is my personal mission â€” to ensure no learner is left behind because of financial barriers. This platform is free, and always will be.&rdquo;</p>
                </blockquote>

                {/* Social icons â€” icon only circles */}
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
                  âœ‰ï¸ ceo@aidla.online
                </a>
              </div>

            </TiltCard>

            {/* Story â€” newspaper layout */}
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
                    <span className="ab-np-dot" aria-hidden="true">Â·</span>
                    <span>Peshawar, Pakistan â€” 2026</span>
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
                  &ldquo;Talent exists everywhere â€” opportunity does not.&rdquo;
                </blockquote>

                <p>
                  While students globally had access to advanced AI assistants,
                  professional CV builders, and modern learning systems â€” countless
                  students in Pakistan were still struggling with outdated resources
                  and expensive subscriptions.
                </p>
                <p>
                  <strong>Gold Medalist Electrical Engineer Muhammad Zubair Afridi</strong> decided
                  to challenge that reality. Instead of another paid platform, he
                  envisioned something radically different â€” an all-in-one AI-powered
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          5. CORE VALUES
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          6. LEARNER REVIEWS â€” portrait layout
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {displayReviews.length > 0 && <section className="ab-rv-section" aria-labelledby="ab-rv-heading">
        <div className="ab-rv-inner">
          <h2 id="ab-rv-heading" className="ab-rv-heading">Our Successful Learners Say</h2>

          <div className="ab-rv-body">
            {/* LEFT â€” animated quote, re-mounts on activeReviewIdx change */}
            <div className="ab-rv-left" key={activeReviewIdx}>
              <span className="ab-rv-openquote" aria-hidden="true">â</span>
              <p className="ab-rv-featured-text">{displayReviews[activeReviewIdx]?.review_text}</p>
              <div className="ab-rv-stars" aria-label={`${displayReviews[activeReviewIdx]?.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} aria-hidden="true" className={i < displayReviews[activeReviewIdx]?.rating ? "ab-rv-star-filled" : "ab-rv-star-empty"}>â˜…</span>
                ))}
              </div>
              <p className="ab-rv-name">â€” {displayReviews[activeReviewIdx]?.full_name}</p>
            </div>

            {/* RIGHT â€” portrait cards */}
            <div className="ab-rv-right">
              {/* Main featured card */}
              <div
                className="ab-rv-portrait ab-rv-portrait-main"
                style={{ "--pc-bg": CARD_GRADIENTS[activeReviewIdx % CARD_GRADIENTS.length] }}
                aria-label={`${displayReviews[activeReviewIdx]?.full_name} â€” featured`}
              >
                {displayReviews[activeReviewIdx]?.avatar_url
                  ? <img src={displayReviews[activeReviewIdx].avatar_url} alt={displayReviews[activeReviewIdx].full_name} className="ab-rv-img" loading="lazy" />
                  : <span className="ab-rv-initial">{displayReviews[activeReviewIdx]?.full_name?.[0]?.toUpperCase() || "L"}</span>
                }
                <div className="ab-rv-badge-main">{displayReviews[activeReviewIdx]?.full_name?.split(" ")[0] || "Learner"}</div>
              </div>

              {/* Side cards â€” clickable */}
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
      </section>}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          7. CAREERS TEASER â€” bulletin board job posting
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
            {/* Left â€” headline */}
            <div className="ab-careers-left">
              <p className="ab-careers-dateline">AIDLA Â· Peshawar, Pakistan Â· 2026</p>
              <h2 id="ab-careers-heading">Build the Future<br /><em>of Free Education.</em></h2>
              <p>We need builders, educators, designers &amp; dreamers to help us give learners worldwide the tools they deserve â€” free.</p>
            </div>

            {/* Right â€” roles + CTA */}
            <div className="ab-careers-right">
              <p className="ab-careers-roles-label">Open Departments</p>
              <div className="ab-careers-roles">
                {["Engineering", "Design", "Content", "Growth", "Education"].map((r) => (
                  <span key={r} className="ab-careers-role-tag">{r}</span>
                ))}
              </div>
              <Link href="/careers" className="ab-careers-btn">
                View Open Positions â†’
              </Link>
            </div>
          </div>

          {/* Bottom rule */}
          <div className="ab-careers-footer-rule" aria-hidden="true">
            <span />
            <p>AIDLA Careers â€” Pakistan&apos;s #1 AI Powered Learning Platform</p>
            <span />
          </div>
        </div>
      </section>

    </div>
  );
}
`;
