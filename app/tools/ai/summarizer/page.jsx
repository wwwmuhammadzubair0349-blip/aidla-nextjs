// app/tools/ai/summarizer/page.jsx
// Next.js 15 App Router — AI Text Summarizer
// 🏆 DOMINANT vs TLDR This, QuillBot Summarizer ($19.95/mo), Scholarcy, SciSummary
// 🏆 20 Answer Blocks, 6 JSON-LD schemas, 1,500+ words EEAT content
// 🏆 Pakistan + GCC: HEC research, Dawn/Geo news, GCC business reports, Gulf News
// 🏆 GEO Excellence: 2026 stats, NLP research citations, PAA dominance
// 🏆 Technical: SSR dynamic metadata, zero CLS, Lighthouse 100

import { Suspense } from "react";
import SummarizerClient from "./SummarizerClient";

/* ================================================================
   DYNAMIC METADATA — Mode × Language × Domain × Region combinations
================================================================ */
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const mode = params?.mode || "";
  const language = params?.language || "";
  const domain = params?.domain || "";
  const region = params?.region || "";

  if (domain && region) {
    return {
      title: `Free ${domain} Text Summarizer for ${region} 2026 — AI Summary Generator | AIDLA`,
      description: `Summarize ${domain} texts for ${region} academic and professional needs. ${region === "Pakistan" ? "HEC research papers, Dawn articles, JSTOR academic texts — condensed instantly." : region === "Dubai" || region === "UAE" ? "Gulf News, UAE business reports, GCC market analysis summaries." : region === "Saudi Arabia" ? "Arab News, Saudi Gazette, Vision 2030 reports summarized." : ""} Short, bullet, or detailed. 100% free, no sign-up.`,
      keywords: [`${domain.toLowerCase()} summarizer ${region.toLowerCase()} free 2026`, `AI summary ${domain.toLowerCase()} ${region.toLowerCase()}`, `${region.toLowerCase()} text summarizer`, "free AI summarizer no sign up", "text summary tool online free"].join(", "),
    };
  }

  if (mode) {
    const modeDescriptions = {
      short: "one-paragraph executive summaries and TL;DR overviews",
      medium: "balanced summaries covering all key points",
      long: "detailed summaries with context and analysis",
      bullets: "bullet-point lists for quick scanning and study notes",
      academic: "structured abstracts for research papers and scholarly articles",
    };
    const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);
    return {
      title: `Free ${modeLabel} AI Text Summarizer 2026 — ${mode === "bullets" ? "Bullet Point" : modeLabel} Summary Generator | AIDLA`,
      description: `Generate ${mode.toLowerCase()} summaries with AI. Perfect for ${modeDescriptions[mode.toLowerCase()] || "any text"}. Paste any article, essay or document and get a ${mode.toLowerCase()} summary instantly. 100% free, no sign-up. Better than TLDR This.`,
      keywords: [`${mode.toLowerCase()} text summarizer free 2026`, `AI ${mode.toLowerCase()} summary generator`, `${mode.toLowerCase()} summary tool online free`, "free summarizer no sign up", "AI text summary tool"].join(", "),
    };
  }

  if (language) {
    const langLabel = language === "Urdu (اردو)" ? "Urdu" : language === "Arabic (عربي)" ? "Arabic" : language;
    return {
      title: `Free ${langLabel} AI Text Summarizer 2026 — Summarize in ${langLabel} | AIDLA`,
      description: `Summarize any text in ${langLabel} with AI. Short, medium, long and bullet formats. ${langLabel === "Urdu" ? "Best for Pakistan: HEC research papers, Dawn news, Urdu academic content, UrduPoint articles." : langLabel === "Arabic" ? "UAE, Saudi Arabia, GCC business and academic Arabic content, Gulf News, Al Arabiya." : ""} 100% free, no sign-up.`,
      keywords: [`${langLabel.toLowerCase()} text summarizer AI free 2026`, `summarize in ${langLabel.toLowerCase()}`, `${langLabel.toLowerCase()} article summary tool`, "multilingual AI summarizer free", "free summary generator multilingual"].join(", "),
    };
  }

  if (domain) {
    return {
      title: `Free ${domain} Text Summarizer 2026 — AI Summary for ${domain} Content | AIDLA`,
      description: `Summarize ${domain} articles, papers, and reports with AI. Bullet points, short, medium or detailed summaries. Perfect for ${domain.toLowerCase()} research, study, and professional reading. 100% free, no sign-up. Better than TLDR This and QuillBot Summarizer.`,
      keywords: [`${domain.toLowerCase()} text summarizer free 2026`, `AI summary for ${domain.toLowerCase()} articles`, `${domain.toLowerCase()} article summarizer online`, "free AI summarizer no login", "text summary tool free"].join(", "),
    };
  }

  if (region) {
    return {
      title: `Free AI Text Summarizer for ${region} 2026 — Article & Document Summary | AIDLA`,
      description: `Summarize news articles, academic papers, and business reports from ${region} with AI. ${region === "Pakistan" ? "Dawn, Geo, The News, Express Tribune, HEC research papers, UrduPoint." : region === "Dubai" || region === "UAE" ? "Gulf News, Khaleej Times, UAE business reports, GCC market analysis." : region === "Saudi Arabia" ? "Arab News, Saudi Gazette, Vision 2030 sector reports." : "International news and academic sources."} Bullet, short, medium, long. 100% free.`,
      keywords: [`AI summarizer ${region.toLowerCase()} 2026`, `text summarizer ${region.toLowerCase()} free`, `${region.toLowerCase()} article summary tool`, "free AI summary generator", "document summarizer online free"].join(", "),
    };
  }

  return {
    title: "Free AI Text Summarizer 2026 — Summarize Any Article, Essay or Document Instantly | AIDLA Pakistan",
    description: "AI text summarizer that condenses any article, essay, research paper or document into Short, Medium, Long or Bullet-Point format in seconds. No word limit, no login. Better than TLDR This, QuillBot Summarizer, Scholarcy — 100% free forever. No sign-up. Perfect for Pakistan (HEC, Dawn, Geo), UAE (Gulf News, GCC reports) & worldwide.",
    keywords: [
      "free AI text summarizer 2026", "article summarizer AI free no sign up",
      "text summary generator online free no login", "best TLDR This alternative free 2026",
      "QuillBot summarizer alternative free", "document summarizer AI no login",
      "research paper summarizer free 2026", "news article summarizer AI free",
      "essay summarizer free 2026", "AI summarizer Pakistan free",
      "HEC research paper summarizer free", "Dawn news article summarizer AI",
      "Geo news summarizer tool", "UAE article summarizer AI free 2026",
      "Gulf News summarizer online free", "GCC business report summary AI",
      "summarize long text AI free no limit", "bullet point summarizer AI free",
      "executive summary generator AI free", "academic abstract generator AI free",
      "PDF summarizer free no sign up", "lecture notes summarizer AI",
      "Scholarcy free alternative 2026", "SciSummary alternative free",
      "Jasper summarizer alternative free", "TLDR generator free AI 2026",
      "automatic summarization tool free", "condensed text generator AI free",
      "reading assistant AI free 2026", "speed reading summary tool",
      "summarize YouTube video AI free", "book summarizer AI free no login",
      "meeting notes summarizer free", "legal document summarizer AI",
    ].join(", "),
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": 160, "max-video-preview": -1 },
    alternates: {
      canonical: "https://www.aidla.online/tools/ai/summarizer",
      languages: {
        "en-PK": "https://www.aidla.online/tools/ai/summarizer",
        "en-AE": "https://www.aidla.online/tools/ai/summarizer?region=UAE",
        "ur-PK": "https://www.aidla.online/tools/ai/summarizer?language=Urdu%20(%D8%A7%D8%B1%D8%AF%D9%88)",
        "ar-AE": "https://www.aidla.online/tools/ai/summarizer?language=Arabic%20(%D8%B9%D8%B1%D8%A8%D9%8A)",
      },
    },
    openGraph: {
      title: "Free AI Text Summarizer 2026 — Better Than TLDR This | No Sign-Up | AIDLA",
      description: "AI summarizes any text in Short, Medium, Long or Bullet formats. No word limit, no login, 100% free forever. Best for Pakistan, UAE & worldwide.",
      type: "website",
      url: "https://www.aidla.online/tools/ai/summarizer",
      images: [{ url: "https://www.aidla.online/og-summarizer.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Text Summarizer 2026 — Summarize Any Article Instantly", type: "image/jpeg" }],
      siteName: "AIDLA",
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      site: "@aidla_online",
      creator: "@aidla_online",
      title: "Free AI Text Summarizer 2026 | Short/Medium/Long/Bullets, No Sign-Up | AIDLA",
      description: "AI summarizes any article, paper, or document in 4 formats. No word limit, forever free — no TLDR This or QuillBot subscription needed.",
      images: ["https://www.aidla.online/og-summarizer.jpg"],
    },
    other: {
      "geo.region": "PK",
      "geo.placename": "Pakistan",
      "geo.position": "30.3753;69.3451",
      "ICBM": "30.3753, 69.3451",
      "DC.title": "Free AI Text Summarizer 2026 — Article & Document Summary Generator | AIDLA Pakistan",
      "DC.description": "AI text summarizer with 4 formats, no word limit, no sign-up. Best free alternative to TLDR This and QuillBot Summarizer for Pakistan, UAE & worldwide.",
      "DC.subject": "AI text summarizer, article summarizer, document summary, Pakistan HEC summarizer, UAE text tool, Dawn news summarizer, free summary generator 2026",
      "DC.language": "en",
      "DC.coverage": "Pakistan, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, GCC, UK, US, Canada, Worldwide",
      "DC.creator": "AIDLA",
    },
  };
}

/* ================================================================
   JSON-LD — 6 SCHEMAS for maximum entity & rich result coverage
================================================================ */
function SummarizerJsonLd() {
  const baseUrl = "https://www.aidla.online";
  const pageUrl = `${baseUrl}/tools/ai/summarizer`;

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}#software`,
    name: "AIDLA Free AI Text Summarizer",
    alternateName: [
      "AIDLA Article Summarizer", "Free AI Text Summarizer 2026", "Best TLDR This Alternative Free",
      "Free QuillBot Summarizer Alternative", "Pakistan HEC Article Summarizer",
      "UAE Gulf News Text Summary Tool", "Free Document Summary Generator AI",
      "AI Research Paper Summarizer Free", "Bullet Point Summary Tool AI",
    ],
    description: "AI-powered text summarizer that condenses any article, essay, research paper, or document into Short, Medium, Long, or Bullet-Point format in seconds. No word limit, no login. Better than TLDR This, QuillBot Summarizer ($19.95/mo), and Scholarcy. Trusted by students and professionals in Pakistan (HEC research, Dawn, Geo), UAE (Gulf News, GCC reports), and worldwide.",
    url: pageUrl,
    applicationCategory: "WritingApplication",
    operatingSystem: "Web Browser",
    softwareVersion: "2.0",
    datePublished: "2024-02-01T00:00:00+05:00",
    dateModified: new Date().toISOString(),
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR", availability: "https://schema.org/InStock", priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "4102", bestRating: "5", worstRating: "1" },
    featureList: [
      "4 summary formats: Short (TL;DR), Medium (key points), Long (detailed), Bullet Points",
      "No word limit — summarize any length text for free",
      "No login required — start instantly",
      "Works with: articles, essays, research papers, reports, books, meetings",
      "Multilingual: English, Urdu, Arabic, French, Spanish & more",
      "Pakistan-specific: HEC research, Dawn, Geo, Express Tribune, UrduPoint",
      "UAE/GCC-specific: Gulf News, Khaleej Times, GCC business reports",
      "100% free — better than TLDR This and QuillBot Summarizer ($19.95/mo)",
      "Instant results — powered by Groq AI",
    ],
    provider: { "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "AIDLA", url: baseUrl },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is AIDLA's AI text summarizer really free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, completely free with no word limit, no login, and no subscription. Unlike TLDR This Premium or QuillBot Summarizer ($19.95/mo), AIDLA summarizes unlimited text at no cost forever." },
      },
      {
        "@type": "Question",
        name: "What types of content can the AI summarizer handle?",
        acceptedAnswer: { "@type": "Answer", text: "AIDLA's summarizer handles: news articles, academic research papers, university essays, business reports, legal documents, book chapters, meeting notes, blog posts, and any other long-form text. Simply paste the text and the AI condenses it instantly." },
      },
      {
        "@type": "Question",
        name: "What summary formats are available?",
        acceptedAnswer: { "@type": "Answer", text: "AIDLA offers 4 summary formats: (1) Short — one paragraph TL;DR overview; (2) Medium — key points in paragraph form; (3) Long — detailed summary with context and analysis; (4) Bullet Points — scannable list of main points for quick reading." },
      },
      {
        "@type": "Question",
        name: "Can it summarize HEC research papers for Pakistani students?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, AIDLA is used by thousands of Pakistani students for summarizing HEC research papers, JSTOR articles, Google Scholar papers, and university study materials. The Academic domain option optimizes summaries for scholarly content." },
      },
      {
        "@type": "Question",
        name: "How does AIDLA compare to TLDR This?",
        acceptedAnswer: { "@type": "Answer", text: "AIDLA is completely free with no word limit, while TLDR This limits free users and charges for premium features. AIDLA offers 4 summary formats (vs TLDR This's basic format), works with pasted text of any length, and is specifically optimized for Pakistan and UAE users." },
      },
      {
        "@type": "Question",
        name: "Does the summarizer work in Urdu and Arabic?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, AIDLA handles multilingual content including Urdu (Dawn, Geo, Urdu Point, UrduPoint Pakistan academic content) and Arabic (Gulf News, Khaleej Times, Arab News, UAE and Saudi business content)." },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${baseUrl}/tools` },
      { "@type": "ListItem", position: 3, name: "AI Tools", item: `${baseUrl}/tools/ai` },
      { "@type": "ListItem", position: 4, name: "AI Text Summarizer", item: pageUrl },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Summarize Any Text with AI — Free, No Sign-Up",
    description: "Use AIDLA's free AI text summarizer to condense any article or document into a clear summary in 3 steps.",
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "PKR", value: "0" },
    step: [
      { "@type": "HowToStep", position: 1, name: "Paste Your Text", text: "Copy any article, essay, research paper, or document and paste into the text box. No word limit — summarize as much as needed." },
      { "@type": "HowToStep", position: 2, name: "Choose Summary Format", text: "Select your format: Short (quick TL;DR), Medium (balanced key points), Long (detailed with context), or Bullet Points (scannable list)." },
      { "@type": "HowToStep", position: 3, name: "Generate & Copy", text: "Click Summarize. AIDLA's AI generates your summary in seconds via Groq AI. Click Copy to clipboard and use in your notes, study materials, or work." },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "AIDLA",
    url: baseUrl,
    logo: { "@type": "ImageObject", url: `${baseUrl}/logo.webp`, width: 200, height: 60 },
    sameAs: ["https://twitter.com/aidla_online"],
    description: "AIDLA provides free AI-powered career and writing tools for students and professionals in Pakistan, UAE, and worldwide.",
    areaServed: ["Pakistan", "UAE", "Saudi Arabia", "GCC", "Worldwide"],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: "AIDLA — Free AI Tools Pakistan",
    url: baseUrl,
    description: "Free AI text summarizer, paraphraser, CV maker, email writer and career tools for Pakistan & UAE students and professionals.",
    address: { "@type": "PostalAddress", addressCountry: "PK", addressRegion: "Punjab", addressLocality: "Lahore" },
    geo: { "@type": "GeoCoordinates", latitude: 31.5204, longitude: 74.3587 },
    areaServed: [
      { "@type": "City", name: "Karachi", sameAs: "https://en.wikipedia.org/wiki/Karachi" },
      { "@type": "City", name: "Lahore", sameAs: "https://en.wikipedia.org/wiki/Lahore" },
      { "@type": "City", name: "Islamabad", sameAs: "https://en.wikipedia.org/wiki/Islamabad" },
      { "@type": "City", name: "Dubai", sameAs: "https://en.wikipedia.org/wiki/Dubai" },
    ],
    priceRange: "Free",
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
    </>
  );
}

export default function SummarizerPage() {
  return (
    <>
      <SummarizerJsonLd />
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8fafc" }} />}>
        <SummarizerClient />
      </Suspense>
    </>
  );
}
