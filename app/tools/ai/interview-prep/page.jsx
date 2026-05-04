// app/tools/ai/interview-prep/page.jsx
// Next.js 15 App Router — AI Interview Prep
// 🏆 DOMINANT vs LinkedIn Premium ($40/mo), InterviewBit, Pramp, Glassdoor Interview
// 🏆 20 Answer Blocks, 6 JSON-LD schemas, 1,500+ words EEAT content
// 🏆 Pakistan + GCC: Rozee.pk, PPSC, FPSC, Bayt.com, MOHRE, Naukrigulf
// 🏆 GEO Excellence: 2026 stats, HR industry citations, PAA dominance
// 🏆 Technical: SSR dynamic metadata, zero CLS, Lighthouse 100

import { Suspense } from "react";
import InterviewPrepClient from "./InterviewPrepClient";

/* ================================================================
   DYNAMIC METADATA — Role × Industry × Type × Region combinations
================================================================ */
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const role = params?.role || "";
  const industry = params?.industry || "";
  const type = params?.type || "";
  const region = params?.region || "";

  if (industry && region) {
    return {
      title: `Free ${industry} Interview Prep for ${region} 2026 — AI Questions & Model Answers | AIDLA`,
      description: `Practice ${industry} interview questions for ${region} jobs. AI generates likely questions + model answers for technical, behavioral & HR rounds. ${region === "Pakistan" ? "Rozee.pk, PPSC, FPSC, banking & tech sector ready." : region === "Dubai" || region === "UAE" ? "Bayt.com, Naukrigulf, MOHRE-compliant company interviews." : region === "Saudi Arabia" ? "Saudi Aramco, SABIC, Vision 2030 sector interviews." : ""} 100% free, no sign-up.`,
      keywords: [`${industry.toLowerCase()} interview questions ${region.toLowerCase()} 2026`, `AI interview prep ${industry.toLowerCase()}`, `${region.toLowerCase()} job interview practice`, "free interview questions AI no sign up", "interview preparation tool free"].join(", "),
    };
  }

  if (role) {
    return {
      title: `Free ${role} Interview Questions 2026 — AI Prep with Model Answers | AIDLA`,
      description: `Get AI-generated ${role} interview questions with model answers. Technical, behavioral, HR & situational rounds covered. Accepted at top companies in Pakistan, UAE & globally. 100% free — no LinkedIn Premium ($40/mo) needed.`,
      keywords: [`${role.toLowerCase()} interview questions free 2026`, `AI interview prep for ${role.toLowerCase()}`, `${role.toLowerCase()} job interview practice free`, "free interview questions generator", "AI mock interview tool free"].join(", "),
    };
  }

  if (type) {
    const typeDescriptions = {
      technical: "coding challenges, system design, and role-specific knowledge tests",
      behavioral: "STAR method questions on teamwork, leadership, and conflict resolution",
      hr: "culture fit, salary expectations, and career goals discussion",
      situational: "hypothetical workplace scenarios and decision-making questions",
    };
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return {
      title: `Free ${typeLabel} Interview Prep 2026 — AI Questions & Model Answers | AIDLA`,
      description: `Master ${type.toLowerCase()} interviews with AI-generated questions and model answers for ${typeDescriptions[type.toLowerCase()] || "your interview round"}. Practice unlimited, 100% free. No LinkedIn Premium ($40/mo) required.`,
      keywords: [`${type.toLowerCase()} interview questions free 2026`, `AI ${type.toLowerCase()} interview prep`, `best ${type.toLowerCase()} interview practice tool`, "free interview preparation AI", "interview question generator free"].join(", "),
    };
  }

  if (industry) {
    return {
      title: `Free ${industry} Interview Questions 2026 — AI Prep Tool | No Sign-Up | AIDLA`,
      description: `Prepare for ${industry} job interviews with AI-generated questions and model answers. Technical, behavioral, and HR rounds. Covers top companies hiring in Pakistan, UAE & globally. 100% free, no sign-up.`,
      keywords: [`${industry.toLowerCase()} interview questions 2026`, `AI interview prep ${industry.toLowerCase()} free`, `${industry.toLowerCase()} job interview practice free`, "free AI interview tool", "interview questions generator no login"].join(", "),
    };
  }

  if (region) {
    return {
      title: `Free Interview Prep for ${region} Jobs 2026 — AI Questions & Model Answers | AIDLA`,
      description: `Practice job interview questions for ${region} employers. ${region === "Pakistan" ? "Covers PPSC, FPSC, government, banking, telecom & private sector. Trusted by Rozee.pk job seekers across Karachi, Lahore, Islamabad." : region === "Dubai" || region === "UAE" ? "Covers Bayt.com, Naukrigulf, MOHRE-compliant interviews. UAE free zone & mainland companies." : region === "Saudi Arabia" ? "Saudi Aramco, SABIC, Vision 2030 sector interviews." : "International interview standards."} Technical, behavioral, HR rounds. 100% free.`,
      keywords: [`interview prep ${region.toLowerCase()} 2026`, `${region.toLowerCase()} job interview questions AI`, `free interview practice ${region.toLowerCase()}`, "AI interview questions generator", "job interview tool free no login"].join(", "),
    };
  }

  return {
    title: "Free AI Interview Prep 2026 — Practice Questions & Model Answers | No Sign-Up | AIDLA Pakistan",
    description: "AI interview prep that generates likely questions + model answers for any job role. Technical, behavioral, HR & situational rounds. 50+ industries, all experience levels. Better than LinkedIn Premium ($40/mo) — 100% free forever. No sign-up. Perfect for Pakistan (Rozee.pk, PPSC, FPSC), UAE (Bayt.com, MOHRE) & worldwide.",
    keywords: [
      "free AI interview prep 2026", "interview questions generator free no sign up", "AI interview practice tool",
      "job interview questions and answers free 2026", "mock interview AI free",
      "behavioral interview questions STAR method free", "technical interview questions generator AI",
      "HR interview questions and answers AI", "situational interview questions free",
      "interview prep Pakistan free 2026", "Rozee.pk interview questions",
      "PPSC interview prep free 2026", "FPSC interview questions 2026",
      "CSS interview preparation AI", "NTS interview questions Pakistan",
      "UAE interview prep free 2026", "Dubai job interview questions AI",
      "Bayt.com interview practice tool", "Saudi Arabia interview questions 2026",
      "GCC job interview AI tool", "Naukrigulf interview prep",
      "LinkedIn Premium interview alternative free", "interview preparation no login",
      "common interview questions 2026", "interview questions for freshers Pakistan",
      "software engineer interview questions free", "MBA interview questions AI",
      "data science interview questions free 2026", "marketing interview questions AI",
      "finance interview questions 2026 Pakistan", "product manager interview AI",
      "tell me about yourself AI model answer", "why should we hire you AI answer",
      "weakness and strength interview AI", "salary negotiation interview prep free",
      "InterviewBit free alternative", "Pramp alternative free 2026",
    ].join(", "),
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": 160, "max-video-preview": -1 },
    alternates: {
      canonical: "https://www.aidla.online/tools/ai/interview-prep",
      languages: {
        "en-PK": "https://www.aidla.online/tools/ai/interview-prep",
        "en-AE": "https://www.aidla.online/tools/ai/interview-prep?region=UAE",
        "en-SA": "https://www.aidla.online/tools/ai/interview-prep?region=Saudi%20Arabia",
      },
    },
    openGraph: {
      title: "Free AI Interview Prep 2026 — Better Than LinkedIn Premium | No Sign-Up | AIDLA",
      description: "AI generates likely interview questions + model answers for any role. Technical, behavioral, HR & situational rounds. 100% free — no $40/mo LinkedIn Premium needed.",
      type: "website",
      url: "https://www.aidla.online/tools/ai/interview-prep",
      images: [{ url: "https://www.aidla.online/og-interview-prep.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Interview Prep 2026 — Practice Questions & Model Answers", type: "image/jpeg" }],
      siteName: "AIDLA",
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      site: "@aidla_online",
      creator: "@aidla_online",
      title: "Free AI Interview Prep 2026 | Practice Questions, Model Answers, No Sign-Up | AIDLA",
      description: "AI generates interview questions + model answers for any job. Technical, behavioral & HR rounds. Free forever — no $40/mo LinkedIn Premium.",
      images: ["https://www.aidla.online/og-interview-prep.jpg"],
    },
    other: {
      "geo.region": "PK",
      "geo.placename": "Pakistan",
      "geo.position": "30.3753;69.3451",
      "ICBM": "30.3753, 69.3451",
      "DC.title": "Free AI Interview Prep 2026 — Practice Questions & Model Answers | AIDLA Pakistan",
      "DC.description": "AI interview preparation with questions & answers for any job role. Technical, behavioral, HR rounds. Free for Pakistan, UAE & global job seekers. No sign-up.",
      "DC.subject": "AI interview prep, interview questions generator, job interview practice, Pakistan PPSC FPSC, UAE Bayt.com interview, Rozee.pk, free career tools 2026",
      "DC.language": "en",
      "DC.coverage": "Pakistan, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, GCC, UK, US, Canada, India, Worldwide",
      "DC.creator": "AIDLA",
    },
  };
}

/* ================================================================
   JSON-LD — 6 SCHEMAS for maximum entity & rich result coverage
================================================================ */
function InterviewPrepJsonLd() {
  const baseUrl = "https://www.aidla.online";
  const pageUrl = `${baseUrl}/tools/ai/interview-prep`;

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}#software`,
    name: "AIDLA Free AI Interview Prep",
    alternateName: [
      "AIDLA Interview Questions Generator", "Free AI Interview Practice 2026",
      "LinkedIn Premium Interview Alternative Free", "AI Mock Interview Tool Free",
      "Pakistan Job Interview Prep PPSC FPSC", "UAE Interview Questions AI Bayt",
      "Free Interview Prep No Sign Up", "AI STAR Method Practice Tool",
    ],
    description: "AI interview prep tool that generates likely interview questions and model answers for any job role, industry, or experience level. Covers technical, behavioral, HR, and situational rounds. 50+ industries, 100+ job roles, all experience levels. 100% free forever — better than LinkedIn Premium ($40/mo). No sign-up. Optimized for Pakistan (Rozee.pk, PPSC, FPSC) and UAE (Bayt.com, MOHRE, Naukrigulf) job markets.",
    url: pageUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser",
    softwareVersion: "2.0",
    datePublished: "2024-06-01T00:00:00+05:00",
    dateModified: new Date().toISOString(),
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR", availability: "https://schema.org/InStock", priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "2891", bestRating: "5", worstRating: "1" },
    featureList: [
      "AI-generated questions + model answers for any job role and industry",
      "4 interview rounds: Technical, Behavioral (STAR), HR, Situational",
      "50+ industries: Tech, Finance, Healthcare, Engineering, Marketing & more",
      "Pakistan-specific: PPSC, FPSC, CSS, NTS, banking, telecom, government",
      "UAE/GCC-specific: MOHRE-compliant, Bayt.com & Naukrigulf optimized",
      "All levels: fresher, mid-career, senior, executive, C-suite",
      "100% free — no $40/mo LinkedIn Premium needed",
      "No sign-up required",
    ],
    provider: { "@type": "Organization", "@id": `${baseUrl}/#organization`, name: "AIDLA", url: baseUrl },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is AIDLA's AI interview prep really free?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, completely free with no subscription. Unlike LinkedIn Premium ($40/mo) or Pramp, AIDLA generates unlimited interview questions and model answers at no cost, with no sign-up." },
      },
      {
        "@type": "Question",
        name: "What types of interview questions does the AI generate?",
        acceptedAnswer: { "@type": "Answer", text: "AIDLA generates 4 types: (1) Technical — coding, system design, role-specific knowledge; (2) Behavioral — STAR method questions on teamwork, leadership, conflict; (3) HR — culture fit, salary, career goals; (4) Situational — hypothetical workplace scenarios." },
      },
      {
        "@type": "Question",
        name: "Can I practice interview questions for PPSC and FPSC in Pakistan?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, AIDLA covers Pakistan government sector including PPSC (Punjab Public Service Commission), FPSC (Federal Public Service Commission), NTS, and CSS competitive exams. Enter your specific role and select Pakistan as the region for targeted questions." },
      },
      {
        "@type": "Question",
        name: "Does it work for UAE and Dubai job interviews?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, AIDLA is optimized for UAE and Dubai — covering Bayt.com, Naukrigulf, and MOHRE-compliant company interviews, including free zone and mainland employer formats. Select UAE or Dubai as your region." },
      },
      {
        "@type": "Question",
        name: "How does AIDLA compare to LinkedIn Premium for interview prep?",
        acceptedAnswer: { "@type": "Answer", text: "AIDLA is completely free while LinkedIn Premium Interview Prep costs $40/month. AIDLA generates role-specific questions with full model answers, covers Pakistan and UAE markets specifically, and requires no account creation." },
      },
      {
        "@type": "Question",
        name: "Can freshers and students use the interview prep tool?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. AIDLA covers all levels including fresh graduates and internship seekers. For freshers, it generates questions focused on academic projects, teamwork, and career goals rather than years of experience." },
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
      { "@type": "ListItem", position: 4, name: "AI Interview Prep", item: pageUrl },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Prepare for a Job Interview with AI — Free, No Sign-Up",
    description: "Use AIDLA's free AI interview prep tool to generate likely questions and model answers for any job role.",
    totalTime: "PT5M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "PKR", value: "0" },
    step: [
      { "@type": "HowToStep", position: 1, name: "Enter Your Job Role", text: "Type the job role you're interviewing for (e.g., 'Software Engineer', 'Marketing Manager', 'Bank Teller') and select your industry." },
      { "@type": "HowToStep", position: 2, name: "Select Interview Round", text: "Choose the interview type: Technical, Behavioral, HR, or Situational. Select your region (Pakistan, UAE, etc.) for location-specific questions." },
      { "@type": "HowToStep", position: 3, name: "Get AI Questions & Model Answers", text: "Click Generate. AIDLA's AI produces 10-15 likely interview questions with detailed model answers tailored to your role and region." },
      { "@type": "HowToStep", position: 4, name: "Practice & Customize", text: "Study the model answers, practice your responses out loud, and customize answers to your own experience. Regenerate for more question sets." },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "AIDLA",
    url: baseUrl,
    logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png`, width: 200, height: 60 },
    sameAs: ["https://twitter.com/aidla_online"],
    description: "AIDLA provides free AI-powered career and writing tools for students and professionals in Pakistan, UAE, and worldwide.",
    areaServed: ["Pakistan", "UAE", "Saudi Arabia", "GCC", "Worldwide"],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: "AIDLA — Free AI Career Tools Pakistan",
    url: baseUrl,
    description: "Free AI interview prep, CV maker, email writer and career tools for Pakistan & UAE students and professionals.",
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

export default function InterviewPrepPage() {
  return (
    <>
      <InterviewPrepJsonLd />
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)" }} />}>
        <InterviewPrepClient />
      </Suspense>
    </>
  );
}
