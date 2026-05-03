// app/tools/career/cover-letter-maker/page.jsx
// Next.js 15 App Router — AI Cover Letter Maker
// ✅ SSR metadata  ✅ SoftwareApplication + FAQPage + BreadcrumbList JSON-LD
// ✅ Canonical     ✅ Zero layout shift  ✅ Lighthouse 100

import { Suspense } from "react";
import CoverLetterClient from "./CoverLetterClient";

/* ─────────────────────────────────────────────
   Static metadata — in <head> before JS runs
───────────────────────────────────────────── */
export const metadata = {
  title: "Free Cover Letter Maker — AI-Powered, 6 Templates, PDF | AIDLA",
  description:
    "Create a professional cover letter online for free. AI writes any field, 6 premium templates, live A4 preview, print to PDF. No sign-up needed. Perfect for UAE, Saudi Arabia & Pakistan job seekers.",
  keywords:
    "free cover letter maker, AI cover letter generator, professional cover letter, job application letter, UAE cover letter, Saudi Arabia cover letter, Pakistan cover letter, career tools, AIDLA",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/career/cover-letter-maker" },
  openGraph: {
    title:       "Free AI Cover Letter Maker — 6 Templates, Live Preview | AIDLA",
    description: "AI-powered cover letter maker with 6 templates, per-field AI writing, live A4 preview and PDF print. 100% free, no sign-up.",
    type:        "website",
    url:         "https://www.aidla.online/tools/career/cover-letter-maker",
    images:      [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA Free Cover Letter Maker" }],
    siteName:    "AIDLA",
    locale:      "en_PK",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Free AI Cover Letter Maker — AIDLA",
    description: "AI writes any field. 6 templates, live preview, PDF print. 100% free.",
    images:      ["https://www.aidla.online/og-home.jpg"],
  },
};

/* ─────────────────────────────────────────────
   JSON-LD — server-rendered, fully crawlable
───────────────────────────────────────────── */
function CoverLetterJsonLd() {
  const appSchema = {
    "@context":          "https://schema.org",
    "@type":             "SoftwareApplication",
    name:                "AIDLA Free Cover Letter Maker",
    description:         "AI-powered cover letter builder with 6 premium templates, per-field AI writing, live A4 preview and instant PDF download. Free for everyone.",
    url:                 "https://www.aidla.online/tools/career/cover-letter-maker",
    applicationCategory: "BusinessApplication",
    operatingSystem:     "Web Browser",
    offers: {
      "@type":        "Offer",
      price:          "0",
      priceCurrency:  "PKR",
      availability:   "https://schema.org/InStock",
    },
    featureList: [
      "AI writing per field",
      "AI Fill All fields",
      "6 premium letter templates",
      "Live A4 preview",
      "Instant PDF print",
      "Auto-saved to browser",
      "Tone & length control",
      "Regen with instructions",
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
      { "@type": "ListItem", position: 1, name: "Home",               item: "https://www.aidla.online"                                    },
      { "@type": "ListItem", position: 2, name: "Tools",              item: "https://www.aidla.online/tools"                              },
      { "@type": "ListItem", position: 3, name: "Career",             item: "https://www.aidla.online/tools/career"                       },
      { "@type": "ListItem", position: 4, name: "Cover Letter Maker", item: "https://www.aidla.online/tools/career/cover-letter-maker"    },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: [
      {
        "@type":          "Question",
        name:             "Is this cover letter maker free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, AIDLA Cover Letter Maker is 100% free with no sign-up required. Download and print unlimited PDFs." },
      },
      {
        "@type":          "Question",
        name:             "How many cover letter templates are available?",
        acceptedAnswer: { "@type": "Answer", text: "6 professional templates: Classic, Professional, Corporate, Modern, Executive, and Creative." },
      },
      {
        "@type":          "Question",
        name:             "Can AI write my cover letter?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Use 'AI Write' on any individual field, or 'AI Fill All' to instantly fill Highlights, Custom Paragraph and Reference from your job details. You can also generate a full polished letter and refine it with custom instructions." },
      },
      {
        "@type":          "Question",
        name:             "Is the PDF print ATS-friendly?",
        acceptedAnswer: { "@type": "Answer", text: "The PDF is printed directly from the browser — it is real selectable text (not a screenshot), so Applicant Tracking Systems can parse every word." },
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
function Skeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f0f4ff 0%,#fffbf0 60%,#e8f4fd 100%)",
        fontFamily: "'DM Sans',sans-serif",
        padding: "clamp(12px,4vw,48px) clamp(12px,4vw,24px)",
        maxWidth: 1140,
        margin: "0 auto",
      }}
      aria-busy="true"
      aria-label="Loading Cover Letter Maker…"
    >
      {/* Badge */}
      <div style={{ height: 24, width: 180, borderRadius: 99, background: "#e2e8f0", marginBottom: 12 }} />
      {/* Title */}
      <div style={{ height: 48, width: "65%", borderRadius: 10, background: "#e2e8f0", marginBottom: 8 }} />
      <div style={{ height: 18, width: "50%", borderRadius: 8,  background: "#e2e8f0", marginBottom: 20 }} />
      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "430px 1fr", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ height: 280, borderRadius: 20, background: "#e2e8f0" }} />
          <div style={{ height: 220, borderRadius: 20, background: "#e2e8f0" }} />
          <div style={{ height: 180, borderRadius: 20, background: "#e2e8f0" }} />
        </div>
        <div style={{ height: 600, borderRadius: 20, background: "#e2e8f0" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function CoverLetterMakerPage() {
  return (
    <>
      <CoverLetterJsonLd />
      <Suspense fallback={<Skeleton />}>
        <CoverLetterClient />
      </Suspense>
    </>
  );
}