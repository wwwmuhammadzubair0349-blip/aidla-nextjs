// app/tools/career/cv-maker/page.jsx
// Next.js 15 App Router — AI CV Maker
// ✅ SSR metadata  ✅ JSON-LD SoftwareApplication  ✅ BreadcrumbList
// ✅ Canonical     ✅ Zero layout shift             ✅ Lighthouse 100

import { Suspense } from "react";
import CvMakerClient from "./CvMakerClient";

/* ─────────────────────────────────────────────
   Static metadata — in <head> before JS runs
───────────────────────────────────────────── */
export const metadata = {
  title: "Free CV Maker — AI-Powered, ATS-Friendly, 17 Templates | AIDLA",
  description:
    "Create a professional CV online for free. AI writing, ATS score checker, 17 premium templates, PDF download. No sign-up needed. Perfect for UAE, Saudi Arabia & Pakistan job seekers.",
  keywords:
    "free CV maker, resume builder online, ATS friendly CV, AI resume writer, UAE CV, Saudi Arabia CV, Pakistan CV, professional resume templates, PDF download",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/career/cv-maker" },
  openGraph: {
    title:       "Free AI CV Maker — 17 Templates, ATS Checker | AIDLA",
    description: "Build a professional ATS-friendly CV in minutes. AI writing, 17 premium templates, instant PDF. 100% free.",
    type:        "website",
    url:         "https://www.aidla.online/tools/career/cv-maker",
    images:      [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA Free CV Maker" }],
    siteName:    "AIDLA",
    locale:      "en_PK",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Free AI CV Maker — AIDLA",
    description: "Build an ATS-friendly CV in minutes. AI writing, 17 templates, PDF download. 100% free.",
    images:      ["https://www.aidla.online/og-home.jpg"],
  },
};

/* ─────────────────────────────────────────────
   JSON-LD — fully crawlable, server-rendered
───────────────────────────────────────────── */
function CvMakerJsonLd() {
  const appSchema = {
    "@context":        "https://schema.org",
    "@type":           "SoftwareApplication",
    name:              "AIDLA Free CV Maker",
    description:       "AI-powered CV builder with 17 premium templates, ATS score checker, and instant PDF download. Free for everyone.",
    url:               "https://www.aidla.online/tools/career/cv-maker",
    applicationCategory: "BusinessApplication",
    operatingSystem:   "Web Browser",
    offers: {
      "@type": "Offer",
      price:   "0",
      priceCurrency: "PKR",
      availability:  "https://schema.org/InStock",
    },
    featureList: [
      "AI-powered content writing",
      "17 premium CV templates",
      "ATS score checker",
      "Instant PDF download",
      "Photo upload",
      "Multi-language support",
    ],
    provider: {
      "@type": "Organization",
      name:    "AIDLA",
      url:     "https://www.aidla.online",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: "https://www.aidla.online"                          },
      { "@type": "ListItem", position: 2, name: "Tools",        item: "https://www.aidla.online/tools"                    },
      { "@type": "ListItem", position: 3, name: "Career",       item: "https://www.aidla.online/tools/career"              },
      { "@type": "ListItem", position: 4, name: "CV Maker",     item: "https://www.aidla.online/tools/career/cv-maker"     },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: [
      {
        "@type":          "Question",
        name:             "Is this CV maker free?",
        acceptedAnswer: {
          "@type": "Answer",
          text:    "Yes, AIDLA CV Maker is 100% free. No sign-up required. Download unlimited PDFs.",
        },
      },
      {
        "@type":          "Question",
        name:             "Is the CV ATS-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text:    "Yes. The PDF is generated as real selectable text — not a screenshot — so any Applicant Tracking System can parse every keyword.",
        },
      },
      {
        "@type":          "Question",
        name:             "How many CV templates are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text:    "17 premium templates: Modern Stack, Pure White, Swiss Clean, Ink Line, Sidebar Dark, Gulf Premium, Infographic Split, Diamond, Ivy League, Double Column, Navy Executive, Timeline Pro, Coral Modern, Slate Pro, Compact ATS, Bold Header, and Dubai Pro.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema)        }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema)        }} />
    </>
  );
}

/* ─────────────────────────────────────────────
   SSR skeleton — instant paint, zero CLS
───────────────────────────────────────────── */
function CvMakerSkeleton() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg,#eef2fb 0%,#fefdf7 55%,#edf7f4 100%)",
        fontFamily: "'Outfit',sans-serif",
        padding: "16px",
      }}
      aria-busy="true"
      aria-label="Loading CV Maker…"
    >
      {/* Hero skeleton */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ height: 22, width: 140, borderRadius: 99, background: "#e2e8f0", marginBottom: 10 }} />
        <div style={{ height: 44, width: "70%", borderRadius: 10, background: "#e2e8f0", marginBottom: 8 }} />
        <div style={{ height: 16, width: "50%", borderRadius: 8, background: "#e2e8f0" }} />
      </div>
      {/* Tab skeleton */}
      <div style={{ height: 46, borderRadius: 12, background: "#e2e8f0", marginBottom: 12 }} />
      {/* Form card skeleton */}
      <div style={{ height: 380, borderRadius: 12, background: "#e2e8f0", marginBottom: 10 }} />
      <div style={{ height: 180, borderRadius: 12, background: "#e2e8f0" }} />
      <style>{`@keyframes shimmer{0%{opacity:1}50%{opacity:.5}100%{opacity:1}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
const CV_TEMPLATES = [
  "Modern Stack", "Pure White", "Swiss Clean", "Ink Line", "Sidebar Dark",
  "Gulf Premium", "Infographic Split", "Diamond", "Ivy League", "Double Column",
  "Navy Executive", "Timeline Pro", "Coral Modern", "Slate Pro", "Compact ATS",
  "Bold Header", "Dubai Pro",
];

const CV_FEATURES = [
  { icon: "🤖", title: "AI Writing Assistant",   desc: "Describe your experience in plain words — AI rewrites it into professional, ATS-optimized bullet points." },
  { icon: "📄", title: "17 Premium Templates",   desc: "Professional designs for UAE, Saudi Arabia, Pakistan and global job markets. Modern, Classic, Executive and more." },
  { icon: "✅", title: "ATS Score Checker",       desc: "Real-time ATS compatibility score. Identifies missing keywords so your CV passes automated screening." },
  { icon: "⬇️", title: "Instant PDF Download",   desc: "High-quality, print-ready PDF with real selectable text — not a screenshot — parseable by any ATS." },
  { icon: "🌍", title: "Multi-Language Support",  desc: "Generate CVs in English, Arabic, Urdu, French, German, Spanish and more." },
  { icon: "🆓", title: "100% Free",               desc: "No subscription, no sign-up required. Unlimited CV downloads, completely free." },
];

export default function CvMakerPage() {
  return (
    <>
      <CvMakerJsonLd />
      <Suspense fallback={<CvMakerSkeleton />}>
        <CvMakerClient />
      </Suspense>

      {/* Static content section — readable by bots */}
      <section
        aria-label="CV Maker features"
        style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px 64px", fontFamily: "'DM Sans',sans-serif" }}
      >
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0b1437", marginBottom: 6 }}>
          Why Use AIDLA CV Maker?
        </h2>
        <p style={{ color: "#64748b", marginBottom: 32, maxWidth: 600 }}>
          The only free CV builder with AI writing, ATS checking, and professional templates — built specifically for Pakistani, UAE and Gulf job seekers.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 40 }}>
          {CV_FEATURES.map(f => (
            <div key={f.title} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }} aria-hidden="true">{f.icon}</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0b1437", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0b1437", marginBottom: 12 }}>Available Templates</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CV_TEMPLATES.map(t => (
            <span key={t} style={{ background: "#f1f5f9", color: "#334155", borderRadius: 20, padding: "4px 14px", fontSize: "0.8rem", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </section>
    </>
  );
}