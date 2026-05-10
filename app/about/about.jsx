"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ============================================================
   AIDLA — About Page
   Ultra-Premium · 3D · Mobile-First · SEO/GEO/AEO Ready
   Founder: Engineer Muhammad Zubair Afridi
   ============================================================ */



// ── STATIC DATA ──
const TOOLS_CATEGORIES = [
  {
    category: "AI Power Tools", icon: "🤖", color: "#eff6ff", borderColor: "#bfdbfe",
    items: [
      { name: "Email Writer", href: "/tools/ai/email-writer", desc: "Draft professional, high-converting emails in seconds." },
      { name: "Interview Prep", href: "/tools/ai/interview-prep", desc: "Practice with realistic AI-driven interview scenarios." },
      { name: "LinkedIn Bio", href: "/tools/ai/linkedin-bio", desc: "Generate a highly optimized LinkedIn profile summary." },
      { name: "Paraphraser", href: "/tools/ai/paraphraser", desc: "Rewrite and refine text for maximum clarity and originality." },
      { name: "Summarizer", href: "/tools/ai/summarizer", desc: "Condense long articles and documents into key points." },
    ],
  },
  {
    category: "Career Builders", icon: "💼", color: "#f0fdf4", borderColor: "#bbf7d0",
    items: [
      { name: "CV Maker", href: "/tools/career/cv-maker", desc: "Create ATS-friendly, professional resumes instantly." },
      { name: "Cover Letter Maker", href: "/tools/career/cover-letter-maker", desc: "Write perfectly tailored cover letters using AI." },
    ],
  },
  {
    category: "File Converters", icon: "🔄", color: "#fef2f2", borderColor: "#fecaca",
    items: [
      { name: "Word to PDF", href: "/tools/pdf/word-to-pdf", desc: "Convert DOCX files to perfectly formatted PDFs." },
      { name: "Image to PDF", href: "/tools/pdf/image-to-pdf", desc: "Compile multiple JPGs or PNGs into a single document." },
      { name: "JPG to PNG", href: "/tools/image/jpg-to-png", desc: "Convert image formats with high-quality retention." },
    ],
  },
];

const CORE_VALUES = [
  { icon: "🤝", title: "Inclusivity", desc: "Education is a right. We build for every learner in Pakistan, regardless of background or financial standing." },
  { icon: "💡", title: "Innovation", desc: "Leveraging cutting-edge AI to solve real-world student and professional challenges every single day." },
  { icon: "🔍", title: "Transparency", desc: "From lucky draws to coin withdrawals, everything is openly logged, audited, and verified on AIDLA." },
  { icon: "🚀", title: "Accessibility", desc: "Every tool, every course, every reward — designed to work on the cheapest Android phone in Pakistan." },
];

const MILESTONES = [
  { year: "2026", title: "The Spark", desc: "Identified Pakistan's digital education gap in Pakistan." },
  { year: "2026", title: "Tools Deployed", desc: "AI, CV & PDF suite launched — 100% free, no watermarks." },
  { year: "2026", title: "Rewards Engine", desc: "Learn-to-Earn system activated — real cash for real learning." },
  { year: "Now",  title: "500+ Users", desc: "Pakistan's fastest-growing free digital academy." },
];

const STATS = [
  { value: "500+", label: "Active Users" },
  { value: "15+",  label: "Free AI Tools" },
  { value: "100%", label: "Free Forever" },
  { value: "3",    label: "Tool Categories" },
];

// ── INLINE STYLES (zero runtime deps, SSR-safe) ──
const S = {
  root: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    background: "#f8fafc",
    color: "#0f172a",
    overflowX: "hidden",
    WebkitFontSmoothing: "antialiased",
    minHeight: "100vh",
  },

  /* ── HERO ── */
  hero: {
    position: "relative",
    background: "linear-gradient(135deg,#0b1437 0%,#1a3a8f 55%,#1e40af 100%)",
    overflow: "hidden",
    padding: "clamp(28px,4vw,44px) clamp(16px,4vw,28px) clamp(28px,4vw,44px)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroCanvas: {
    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
  },
  heroInner: { position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", width: "100%" },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#bfdbfe", padding: "4px 14px", borderRadius: 99,
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 12,
  },
  heroPulse: {
    width: 8, height: 8, borderRadius: "50%", background: "#34d399",
    display: "inline-block",
    boxShadow: "0 0 0 0 rgba(52,211,153,0.4)",
    animation: "pulse 2s infinite",
  },
  heroH1: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "clamp(1.7rem, 4.5vw, 2.8rem)",
    fontWeight: 900, color: "#fff",
    lineHeight: 1.1, letterSpacing: "-0.02em",
    margin: "0 0 12px",
  },
  heroH1Accent: { color: "#93c5fd", background: "linear-gradient(135deg,#93c5fd,#bfdbfe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: {
    fontSize: "clamp(0.875rem,2vw,1rem)",
    color: "rgba(255,255,255,0.8)", lineHeight: 1.6,
    maxWidth: 560, margin: "0 auto 20px",
  },
  heroButtons: {
    display: "flex", flexWrap: "wrap", gap: 10,
    justifyContent: "center", marginBottom: 28,
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "#fff", color: "#1e3a8a",
    padding: "14px 28px", borderRadius: 14,
    fontWeight: 800, fontSize: "0.95rem",
    textDecoration: "none", border: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    transition: "box-shadow 0.25s",
    cursor: "pointer",
  },
  btnOutlineHero: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.08)", color: "#fff",
    padding: "14px 28px", borderRadius: 14,
    fontWeight: 700, fontSize: "0.95rem",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(8px)",
    transition: "background 0.25s",
    cursor: "pointer",
  },

  /* Stats bar */
  statsBar: {
    display: "flex", flexWrap: "wrap", justifyContent: "center",
    gap: "10px 0",
    background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 16, padding: "14px 20px",
    maxWidth: "max-content", margin: "0 auto",
  },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" },
  statValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1,
  },
  statLabel: { fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 },
  statDivider: { width: 1, background: "rgba(255,255,255,0.2)", alignSelf: "stretch", margin: "3px 0" },

  /* Scroll indicator */
  scrollIndicator: {
    position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
    zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
  },
  scrollText: { fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" },
  scrollDot: { width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: "scrollBounce 1.5s ease-in-out infinite" },

  /* ── BODY ── */
  body: { maxWidth: 1140, margin: "0 auto", padding: "0 16px clamp(40px,6vw,60px)" },

  section: { marginBottom: "clamp(36px,6vw,60px)", paddingTop: "clamp(36px,6vw,60px)" },
  sectionHeader: { textAlign: "center", marginBottom: "clamp(20px,4vw,36px)", display: "flex", flexDirection: "column", alignItems: "center" },

  pill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(26,58,143,0.08)", color: "#1a3a8f",
    padding: "4px 14px", borderRadius: 99,
    fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.05em",
    textTransform: "uppercase", border: "1px solid rgba(26,58,143,0.15)", marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.4rem,3.5vw,2.2rem)",
    fontWeight: 900, lineHeight: 1.15, margin: "0 0 10px",
    letterSpacing: "-0.02em", color: "#0b1437",
  },
  sectionTitleAccent: { background: "linear-gradient(135deg,#1a3a8f,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sectionDesc: { color: "#4b5563", fontSize: "clamp(0.875rem,2vw,1rem)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" },

  /* ── MISSION / VISION CARDS (3D tilt) ── */
  splitGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(12px,2vw,20px)" },

  card3D: {
    borderRadius: 18, padding: "clamp(20px,3vw,28px)",
    border: "1px solid rgba(59,130,246,0.1)",
    boxShadow: "0 2px 8px rgba(11,20,55,0.06)",
    transition: "box-shadow 0.3s, transform 0.3s",
    transformStyle: "preserve-3d",
    cursor: "default",
    position: "relative", overflow: "hidden",
  },
  missionGrad: { background: "rgba(255,255,255,0.98)" },
  visionGrad:  { background: "rgba(255,255,255,0.98)" },

  cardShine: {
    position: "absolute", inset: 0, borderRadius: 18,
    background: "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.18) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  cardIcon: { fontSize: "1.8rem", display: "block", marginBottom: 12 },
  cardH2: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 900,
    margin: "0 0 8px", color: "#0b1437",
  },
  cardP: { color: "#374151", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 },

  /* ── FOUNDER — bots only, hidden from users ── */
  founderHidden: {
    position: "absolute", width: 1, height: 1,
    overflow: "hidden", clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap", border: 0,
  },

  /* ── TOOLS ── */
  toolsContainer: { display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,28px)" },
  toolBlock: {
    background: "#fff", borderRadius: 20,
    border: "1px solid #e2e8f0", overflow: "hidden",
    boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
  },
  toolHeader: { display: "flex", alignItems: "center", gap: 12, padding: "16px 24px" },
  toolHeaderIcon: { fontSize: "1.5rem" },
  toolHeaderTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.1rem,3vw,1.3rem)", fontWeight: 800, color: "#0f172a", margin: 0,
  },
  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 1, background: "#e2e8f0",
  },
  toolCard: {
    background: "#fff", padding: "14px 16px",
    textDecoration: "none", display: "flex", flexDirection: "column",
    transition: "background 0.2s",
  },
  toolName: { fontSize: "0.875rem", fontWeight: 800, color: "#0b1437", margin: "0 0 4px" },
  toolDesc: { fontSize: "0.78rem", color: "#4b5563", lineHeight: 1.45, margin: "0 0 10px", flex: 1 },
  toolCTA: { fontSize: "0.75rem", fontWeight: 700, color: "#1a3a8f", marginTop: "auto" },

  /* ── STORY / TIMELINE ── */
  storyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "clamp(32px,5vw,60px)", alignItems: "center",
  },
  timeline: {
    position: "relative",
    paddingLeft: 28,
    display: "flex", flexDirection: "column", gap: 0,
  },
  timelineLine: {
    position: "absolute", left: 9, top: 12, bottom: 12,
    width: 2, background: "linear-gradient(to bottom,#1d4ed8,#bfdbfe)",
    borderRadius: 99,
  },
  milestoneRow: {
    position: "relative", display: "flex", flexDirection: "column",
    paddingBottom: 28, paddingLeft: 24,
  },
  milestoneDot: {
    position: "absolute", left: -19, top: 4,
    width: 14, height: 14, borderRadius: "50%",
    background: "#1d4ed8", border: "3px solid #fff",
    boxShadow: "0 0 0 3px #bfdbfe",
  },
  milestoneYear: { fontSize: "0.75rem", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 },
  milestoneTitle: { fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  milestoneDesc: { fontSize: "0.9rem", color: "#64748b", lineHeight: 1.55, margin: 0 },

  /* ── VALUES ── */
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "clamp(10px,2vw,16px)" },
  valueCard: {
    background: "rgba(255,255,255,0.98)", padding: "clamp(18px,3vw,24px) 18px",
    borderRadius: 18, textAlign: "center",
    border: "1px solid rgba(59,130,246,0.08)",
    boxShadow: "0 2px 8px rgba(11,20,55,0.05)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  valueIcon: {
    width: 48, height: 48, borderRadius: "50%",
    background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
    border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.3rem", margin: "0 auto 12px",
  },
  valueTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 900, margin: "0 0 6px", color: "#0b1437" },
  valueDesc: { color: "#4b5563", fontSize: "0.8rem", lineHeight: 1.55, margin: 0 },

  /* ── FAQ ── */
  faqGrid: { display: "grid", gridTemplateColumns: "1fr", gap: "clamp(32px,5vw,60px)", alignItems: "start" },
  faqList: { display: "flex", flexDirection: "column", gap: 10 },
  faqItem: {
    background: "#fff", borderRadius: 14,
    border: "1px solid #e2e8f0", overflow: "hidden",
    boxShadow: "0 2px 10px rgba(15,23,42,0.03)",
  },
  faqSummary: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "clamp(16px,3vw,20px) 24px",
    fontWeight: 700, cursor: "pointer",
    listStyle: "none", color: "#0f172a", gap: 12, fontSize: "0.95rem",
  },
  faqChevron: { fontSize: "0.7rem", color: "#94a3b8", flexShrink: 0 },
  faqAnswer: { padding: "0 24px 20px", fontSize: "0.93rem", lineHeight: 1.65, color: "#475569" },

  /* ── CTA ── */
  ctaBlock: {
    background: "linear-gradient(135deg,#0b1437 0%,#1a3a8f 60%,#1e5abf 100%)",
    borderRadius: "clamp(16px,3vw,24px)",
    textAlign: "center",
    padding: "clamp(36px,6vw,64px) 20px",
    boxShadow: "0 8px 40px rgba(11,20,55,0.18)",
    position: "relative", overflow: "hidden",
  },
  ctaContent: { position: "relative", zIndex: 2 },
  ctaTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.5rem,4vw,2.8rem)", fontWeight: 900,
    color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em",
  },
  ctaDesc: {
    fontSize: "clamp(0.875rem,2vw,1rem)", color: "rgba(255,255,255,0.85)",
    maxWidth: 480, margin: "0 auto clamp(20px,4vw,28px)", lineHeight: 1.6,
  },
  ctaBtns: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  ctaBtnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg,#f59e0b,#fcd34d)", color: "#0b1437",
    padding: "12px 28px", borderRadius: 50,
    fontWeight: 800, fontSize: "0.9rem", textDecoration: "none",
    boxShadow: "0 8px 24px rgba(245,158,11,0.4)", border: "none",
    letterSpacing: "-0.01em",
  },
  ctaBtnOutline: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.08)", color: "#fff",
    padding: "12px 28px", borderRadius: 50,
    fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)",
  },

  /* ── BREADCRUMB ── */
  breadcrumb: { marginBottom: 20 },
  breadcrumbOl: {
    display: "flex", justifyContent: "center", gap: 8,
    listStyle: "none", padding: 0, margin: 0,
    fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.5)",
    flexWrap: "wrap",
  },
  breadcrumbA: { color: "rgba(255,255,255,0.7)", textDecoration: "none" },
};

/* ── 3D TILT CARD ── */
function TiltCard({ children, style }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const rx = ((cy / rect.height) - 0.5) * -12;
    const ry = ((cx / rect.width)  - 0.5) * 12;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    el.style.boxShadow = "0 20px 50px rgba(15,23,42,0.12)";
    const shine = el.querySelector("[data-shine]");
    if (shine) { shine.style.setProperty("--mx", `${(cx/rect.width)*100}%`); shine.style.setProperty("--my", `${(cy/rect.height)*100}%`); }
  };
  const handleLeave = (e) => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    el.style.boxShadow = "0 8px 40px rgba(15,23,42,0.06)";
  };
  return (
    <div ref={ref} style={{ ...S.card3D, ...style }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div data-shine style={S.cardShine} aria-hidden="true" />
      {children}
    </div>
  );
}

/* ── ANIMATED COUNTER ── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const num = parseInt(target.replace(/\D/g, ""));
      let start = 0;
      const step = Math.ceil(num / 40);
      const t = setInterval(() => {
        start = Math.min(start + step, num);
        setVal(start);
        if (start >= num) clearInterval(t);
      }, 35);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix || (target.includes("+") ? "+" : target.includes("%") ? "%" : "")}</span>;
}

/* ── HERO PARTICLE CANVAS ── */
function HeroCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.4 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ ...S.heroCanvas, width: "100%", height: "100%" }} aria-hidden="true" />;
}

/* ── SCROLL REVEAL HOOK ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function RevealSection({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function AboutPage({ faqs = [] }) {

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": "https://www.aidla.online/#organization",
    name: "AIDLA",
    alternateName: "AI DLA",
    url: "https://www.aidla.online",
    logo: { "@type": "ImageObject", url: "https://www.aidla.online/logo.png" },
    foundingDate: "2026",
    description: "Pakistan's #1 digital learning academy offering free AI tools, career resources, and a learn-to-earn rewards system.",
    areaServed: [
      { "@type": "Country", name: "Pakistan" },
      { "@type": "City", name: "Peshawar" },
    ],
    address: { "@type": "PostalAddress", addressCountry: "PK", addressRegion: "Khyber Pakhtunkhwa", addressLocality: "Peshawar" },
    contactPoint: { "@type": "ContactPoint", telephone: "+923044678929", contactType: "customer support", areaServed: "PK" },
    founder: {
      "@type": "Person",
      name: "Engineer Muhammad Zubair Afridi",
      jobTitle: "Founder & CEO",
      url: "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
      sameAs: [
        "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
        "https://www.facebook.com/engrzubairafridi/",
        "https://www.instagram.com/muhammad.zubair.afridi/",
      ],
      address: { "@type": "PostalAddress", addressLocality: "Peshawar", addressCountry: "PK" },
    },
    sameAs: [
      "https://www.instagram.com/aidla_official/",
      "https://www.facebook.com/profile.php?id=61586195563121",
      "https://www.linkedin.com/company/110859146/",
      "https://www.tiktok.com/@aidla_official",
      "https://twitter.com/aidla_official",
      "https://www.youtube.com/@aidla_official",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.aidla.online" },
      { "@type": "ListItem", position: 2, name: "About AIDLA", item: "https://www.aidla.online/about" },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://www.aidla.online/about",
    url: "https://www.aidla.online/about",
    name: "About AIDLA — Pakistan's #1 Free AI Tools & Learn-to-Earn Academy",
    description: "Learn about AIDLA's mission, vision, free AI tools, and the founder Engineer Muhammad Zubair Afridi.",
    inLanguage: "en",
    isPartOf: { "@id": "https://www.aidla.online/#website" },
    about: { "@id": "https://www.aidla.online/#organization" },
    breadcrumb: { "@id": "https://www.aidla.online/about#breadcrumb" },
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.aidla.online/#founder",
    name: "Engineer Muhammad Zubair Afridi",
    givenName: "Muhammad Zubair",
    familyName: "Afridi",
    honorificPrefix: "Engineer",
    jobTitle: "Founder & CEO",
    worksFor: { "@id": "https://www.aidla.online/#organization" },
    telephone: "+923044678929",
    address: { "@type": "PostalAddress", addressLocality: "Peshawar", addressRegion: "Khyber Pakhtunkhwa", addressCountry: "PK" },
    sameAs: [
      "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
      "https://www.facebook.com/engrzubairafridi/",
      "https://www.instagram.com/muhammad.zubair.afridi/",
    ],
  };

  const toolsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free Professional Tools by AIDLA",
    description: "A comprehensive suite of free AI, Career, and PDF tools for Pakistani students.",
    numberOfItems: TOOLS_CATEGORIES.reduce((a, c) => a + c.items.length, 0),
    itemListElement: TOOLS_CATEGORIES.flatMap((cat, ci) =>
      cat.items.map((tool, ii) => ({
        "@type": "ListItem",
        position: ci * 10 + ii + 1,
        name: tool.name,
        description: tool.desc,
        url: `https://www.aidla.online${tool.href}`,
      }))
    ),
  };

  const keywordsSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.aidla.online/#website",
    url: "https://www.aidla.online",
    name: "AIDLA",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://www.aidla.online/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main style={S.root} id="main-content" lang="en" itemScope itemType="https://schema.org/AboutPage">
      {/* ── JSON-LD SCHEMAS ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(keywordsSchema) }} />

      {/* ── SKIP LINK ── */}
      <a href="#main-content" style={{ position: "absolute", left: -9999, top: 0, zIndex: 999, background: "#1d4ed8", color: "#fff", padding: "8px 16px", borderRadius: 6, fontWeight: 700, textDecoration: "none" }} onFocus={e => e.target.style.left = "16px"} onBlur={e => e.target.style.left = "-9999px"}>Skip to main content</a>

      {/* ──────────────────── HERO ──────────────────── */}
      <header style={S.hero} aria-label="About AIDLA — Pakistan's Digital Academy">

        <div style={S.heroInner}>
          {/* Breadcrumb */}
          <nav style={S.breadcrumb} aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
            <ol style={S.breadcrumbOl}>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link href="/" style={S.breadcrumbA} itemProp="item"><span itemProp="name">Home</span></Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true" style={{ color: "rgba(255,255,255,0.3)" }}>›</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span itemProp="name" style={{ color: "rgba(255,255,255,0.8)" }}>About Us</span>
                <meta itemProp="position" content="2" />
              </li>
            </ol>
          </nav>

          <div style={S.heroBadge} aria-hidden="true">
            <span style={S.heroPulse} />
            Pakistan's First AI Digital Academy · Est. 2026
          </div>

          <h1 style={S.heroH1} itemProp="headline">
            Empowering Pakistan's<br />
            <span style={S.heroH1Accent}>Digital Learners</span>
          </h1>

          <p style={S.heroSub} itemProp="description">
            We're on a mission to transform how Pakistani students learn, grow, and get rewarded — combining cutting-edge AI tools with a real Learn-to-Earn economy. 100% free, forever.
          </p>

          <div style={S.heroButtons}>
            <Link href="/signup" style={S.btnPrimary} aria-label="Create a free AIDLA account">✨ Start for Free</Link>
            <Link href="/tools" style={S.btnOutlineHero} aria-label="Browse all free AI tools on AIDLA">🔧 Explore Tools</Link>
          </div>

          {/* Stats Bar */}
          <div style={S.statsBar} aria-label="AIDLA Platform Statistics" role="region">
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "contents" }}>
                {i > 0 && <div style={S.statDivider} aria-hidden="true" />}
                <div style={S.statItem}>
                  <strong style={S.statValue}>
                    <Counter target={s.value} />
                  </strong>
                  <span style={S.statLabel}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


      </header>

      {/* ──────────────────── BODY ──────────────────── */}
      <div style={S.body}>

        {/* ── MISSION & VISION ── */}
        <section style={S.section} aria-labelledby="mission-vision-heading" itemScope itemType="https://schema.org/Organization">
          <RevealSection>
            <header style={S.sectionHeader}>
              <span style={S.pill}>🎯 Our Purpose</span>
              <h2 style={S.sectionTitle} id="mission-vision-heading">
                Mission &amp; <span style={S.sectionTitleAccent}>Vision</span>
              </h2>
            </header>
            <div style={S.splitGrid}>
              <TiltCard style={S.missionGrad}>
                <span style={S.cardIcon} aria-hidden="true">🎯</span>
                <h3 style={S.cardH2}>Our Mission</h3>
                <p style={S.cardP} itemProp="description">
                  The mission of AIDLA is to empower students and professionals by providing free access to AI-powered educational tools, career resources, and learning opportunities. We aim to remove financial barriers from education, help people build real-world skills, and create a platform where users can learn, grow, and earn — all in one place.

                </p>
              </TiltCard>
              <TiltCard style={S.visionGrad}>
                <span style={S.cardIcon} aria-hidden="true">🔭</span>
                <h3 style={S.cardH2}>Our Vision</h3>
                <p style={S.cardP}>
                  At AIDLA
, we believe talent exists everywhere — but opportunities do not. Our vision is to make powerful AI tools, quality education, and career-building resources accessible to every student, completely free. We want to create a future where learning is not a burden, but an opportunity to grow, build skills, and even earn while learning.
                </p>
              </TiltCard>
            </div>
          </RevealSection>
        </section>

        {/* ── FOUNDER — hidden from users, readable by bots via microdata ── */}
        <div style={S.founderHidden} aria-hidden="true" itemScope itemType="https://schema.org/Person">
          <span itemProp="name">Engineer Muhammad Zubair Afridi</span>
          <span itemProp="jobTitle">Founder &amp; CEO</span>
          <span itemProp="worksFor" itemScope itemType="https://schema.org/Organization"><span itemProp="name">AIDLA</span></span>
          <span itemProp="addressLocality">Peshawar</span>
          <span itemProp="addressRegion">Khyber Pakhtunkhwa</span>
          <span itemProp="addressCountry">PK</span>
          <span itemProp="telephone">+923044678929</span>
          <a itemProp="sameAs" href="https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/">LinkedIn</a>
          <a itemProp="sameAs" href="https://www.facebook.com/engrzubairafridi/">Facebook</a>
          <a itemProp="sameAs" href="https://www.instagram.com/muhammad.zubair.afridi/">Instagram</a>
        </div>

        {/* ── FREE TOOLS ECOSYSTEM ── */}
        <section style={S.section} aria-labelledby="tools-heading">
          <RevealSection delay={0.05}>
            <header style={S.sectionHeader}>
              <span style={S.pill}>🛠️ The Ecosystem</span>
              <h2 style={S.sectionTitle} id="tools-heading">
                Our Free <span style={S.sectionTitleAccent}>Professional Tools</span>
              </h2>
              <p style={S.sectionDesc}>
                Why pay for premium subscriptions? AIDLA offers a complete suite of AI writers, career builders, and file converters — completely free for everyone in Pakistan and beyond.
              </p>
            </header>

            <div style={S.toolsContainer}>
              {TOOLS_CATEGORIES.map((cat, i) => (
                <article key={i} style={S.toolBlock} aria-labelledby={`cat-${i}`}>
                  <div style={{ ...S.toolHeader, backgroundColor: cat.color, borderBottom: `2px solid ${cat.borderColor}` }}>
                    <span style={S.toolHeaderIcon} aria-hidden="true">{cat.icon}</span>
                    <h3 style={S.toolHeaderTitle} id={`cat-${i}`}>{cat.category}</h3>
                  </div>
                  <div style={S.toolGrid} role="list">
                    {cat.items.map((tool, j) => (
                      <Link key={j} href={tool.href} style={S.toolCard} role="listitem" aria-label={`Use ${tool.name} — ${tool.desc}`}>
                        <h4 style={S.toolName}>{tool.name}</h4>
                        <p style={S.toolDesc}>{tool.desc}</p>
                        <span style={S.toolCTA} aria-hidden="true">Launch Tool →</span>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/tools" style={{ ...S.btnPrimary, background: "linear-gradient(135deg,#0b1437,#3b82f6)", color: "#fff", boxShadow: "0 6px 20px rgba(59,130,246,0.35)" }} aria-label="Browse all free tools on AIDLA">
                🔧 Browse All 15+ Free Tools
              </Link>
            </div>
          </RevealSection>
        </section>

        {/* ── OUR STORY ── */}
        <section style={S.section} aria-labelledby="story-heading">
          <RevealSection delay={0.1}>
            <div style={S.storyGrid}>
              <div>
                <span style={S.pill}>📖 Our History</span>
                <h2 style={S.sectionTitle} id="story-heading">
                  How <span style={S.sectionTitleAccent}>AIDLA</span> Started
                </h2>
                <p style={{ ...S.sectionDesc, textAlign: "left", margin: "0 0 16px" }}>
                  AIDLA
 was born in Peshawar from a simple but powerful realization: millions of talented students work tirelessly every day, yet many are locked out of premium educational tools simply because they cannot afford them.
                </p>
                <p style={{ ...S.sectionDesc, textAlign: "left", margin: 0 }}>
                  While students across the world had access to advanced AI assistants, professional CV builders, premium PDF utilities, interview preparation platforms, and modern learning systems, countless students in Pakistan were still struggling with outdated resources, expensive subscriptions, and limited opportunities.

Electrical Engineer and Gold Medalist Muhammad Zubair Afridi decided to challenge that reality.

Instead of creating another paid platform, he envisioned something radically different — an all-in-one AI-powered educational ecosystem that would remain accessible to everyone.

That vision became AIDLA.
                </p>
              </div>

              <div>
                <div style={S.timeline} aria-label="AIDLA Milestones" role="list">
                  <div style={S.timelineLine} aria-hidden="true" />
                  {MILESTONES.map((m, i) => (
                    <div key={i} style={S.milestoneRow} role="listitem">
                      <div style={S.milestoneDot} aria-hidden="true" />
                      <span style={S.milestoneYear}>{m.year}</span>
                      <h3 style={S.milestoneTitle}>{m.title}</h3>
                      <p style={S.milestoneDesc}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* ── CORE VALUES ── */}
        <section style={S.section} aria-labelledby="values-heading">
          <RevealSection>
            <header style={S.sectionHeader}>
              <span style={S.pill}>💎 What We Stand For</span>
              <h2 style={S.sectionTitle} id="values-heading">Our <span style={S.sectionTitleAccent}>Core Values</span></h2>
            </header>
            <div style={S.valuesGrid}>
              {CORE_VALUES.map((v, i) => (
                <article key={i} style={S.valueCard}>
                  <div style={S.valueIcon} aria-hidden="true">{v.icon}</div>
                  <h3 style={S.valueTitle}>{v.title}</h3>
                  <p style={S.valueDesc}>{v.desc}</p>
                </article>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* ── DYNAMIC FAQS ── */}
        {faqs.length > 0 && (
          <section style={S.section} aria-labelledby="faq-heading">
            <RevealSection delay={0.05}>
              <div style={{ ...S.storyGrid, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <div style={{ position: "relative" }}>
                  <span style={S.pill}>❓ Got Questions?</span>
                  <h2 style={S.sectionTitle} id="faq-heading">
                    Frequently Asked <span style={S.sectionTitleAccent}>Questions</span>
                  </h2>
                  <p style={{ ...S.sectionDesc, textAlign: "left", marginBottom: 20 }}>
                    Learn more about how AIDLA operates securely and transparently for every Pakistani user.
                  </p>
                  <Link href="/faqs" style={{ ...S.btnPrimary, background: "#f1f5f9", color: "#0f172a", boxShadow: "none", display: "inline-flex" }} aria-label="Read all frequently asked questions">📚 Read Full FAQs</Link>
                </div>
                <div style={S.faqList}>
                  {faqs.map((f, i) => (
                    <details key={i} style={S.faqItem}>
                      <summary style={S.faqSummary}>
                        {f.question}
                        <span style={S.faqChevron} aria-hidden="true">▼</span>
                      </summary>
                      <div style={S.faqAnswer}>
                        <span>{f.answer}</span>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </RevealSection>
          </section>
        )}

        {/* ── INTERNAL LINKS / SITE MAP ── */}
        <section style={{ ...S.section, marginBottom: "clamp(40px,6vw,64px)" }} aria-labelledby="explore-heading">
          <RevealSection>
            <header style={S.sectionHeader}>
              <span style={S.pill}>🗺️ Explore AIDLA</span>
              <h2 style={S.sectionTitle} id="explore-heading">Everything <span style={S.sectionTitleAccent}>AIDLA</span> Offers</h2>
            </header>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
              {[
{ label: "✍️ Blogs", href: "/blogs" },
{ label: "📰 News", href: "/news" },
{ label: "⛏️ Mining", href: "/user/mining" },
{ label: "🛠️ All Tools", href: "/tools" },
{ label: "📄 CV Maker", href: "/tools/career/cv-maker" },
{ label: "✉️ Cover Letter", href: "/tools/career/cover-letter-maker" },
{ label: "🤖 Email Writer", href: "/tools/ai/email-writer" },
{ label: "🔄 Word to PDF", href: "/tools/pdf/word-to-pdf" },
{ label: "📝 Daily Quiz", href: "/user/dailyquizz" },
{ label: "📚 Courses", href: "/courses" },
{ label: "❓ FAQs", href: "/faqs" },
{ label: "📞 Contact", href: "/contact" },
{ label: "🗂️ Resources", href: "/resources" },
{ label: "🎓 AIDLA AI", href: "/user/learning" },

              ].map((l, i) => (
                <Link key={i} href={l.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px", background: "rgba(255,255,255,0.98)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 12, fontSize: "0.8rem", fontWeight: 700, color: "#0b1437", textDecoration: "none", textAlign: "center", boxShadow: "0 2px 6px rgba(11,20,55,0.04)" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* ── CTA ── */}
        <section style={S.ctaBlock} aria-labelledby="cta-heading">
          <div style={S.ctaContent}>
            <h2 style={S.ctaTitle} id="cta-heading">Ready to join the revolution?</h2>
            <p style={S.ctaDesc}>Stop paying for basic tools. Access our entire AI suite — CV maker, email writer, PDF tools — and start earning real cash rewards for learning.</p>
            <div style={S.ctaBtns}>
              <Link href="/signup" style={S.ctaBtnPrimary} aria-label="Create your free AIDLA account today">✨ Create Free Account</Link>
              <Link href="/tools" style={S.ctaBtnOutline} aria-label="Browse all free tools on AIDLA">🔧 Browse All Tools</Link>
            </div>
            {/* AIDLA social links — bots/crawlers only, footer handles UI */}
            <div style={S.founderHidden} aria-hidden="true">
              <a href="https://www.instagram.com/aidla_official/" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61586195563121" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.linkedin.com/company/110859146/" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://www.tiktok.com/@aidla_official" rel="noopener noreferrer">TikTok</a>
              <a href="https://twitter.com/aidla_official" rel="noopener noreferrer">X</a>
              <a href="https://www.youtube.com/@aidla_official" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </section>

      </div>

      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`


        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity:0.3; }
          50%      { transform: translateY(6px); opacity:0.8; }
        }
        @keyframes drift1 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px,-20px) scale(1.08); }
        }
        @keyframes drift2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-20px,30px) scale(1.05); }
        }
        details[open] summary span:last-child { transform: rotate(180deg); color: #1a3a8f; }
        summary { transition: background 0.2s; }
        details summary::-webkit-details-marker { display:none; }
        details[open] { border-color: #bfdbfe !important; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        @media (min-width: 900px) {
          .faq-sidebar { position: sticky; top: 100px; }
        }
      `}</style>
    </main>
  );
}