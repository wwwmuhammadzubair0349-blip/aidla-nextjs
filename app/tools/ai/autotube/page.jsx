import { Suspense } from "react";
import AutotubeClient from "./AutotubeClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "AI YouTube Tool — Titles, Tags, Scripts & Content Calendar | AIDLA",
  description: "Free AI YouTube tool: generate SEO titles, 30 tags, full video scripts, 30-day content calendars, title optimizer, comment replies, and niche analyzer. No sign-up.",
  keywords: ["YouTube SEO tool", "AI video script generator", "YouTube title generator", "YouTube tags generator", "content calendar YouTube", "AIDLA tools"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/ai/autotube` },
  openGraph: {
    title: "AI YouTube Tool — Titles, Tags, Scripts & Calendars | AIDLA",
    description: "Free AI YouTube tool for creators: titles, tags, scripts, content calendars, and niche analysis.",
    type: "website",
    url: `${SITE_URL}/tools/ai/autotube`,
    siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI YouTube Tool — AIDLA",
    description: "Generate YouTube titles, tags, scripts and content calendars with AI. Free.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AIDLA AI YouTube Tool",
  description: "AI-powered YouTube creator toolkit: SEO titles, 30 tags, full scripts, 30-day content calendar, title optimizer, comment replier, and niche analyzer.",
  url: `${SITE_URL}/tools/ai/autotube`,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
  featureList: [
    "Quick title and tag generator",
    "Full video A–Z script package",
    "30-day content calendar",
    "Idea to full video production",
    "Title optimizer with CTR scores",
    "Comment reply generator",
    "Niche analyzer with keyword research",
  ],
  provider: { "@type": "Organization", name: "AIDLA", url: SITE_URL },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",         item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Tools",        item: `${SITE_URL}/tools` },
      { "@type": "ListItem", position: 3, name: "AI Tools",     item: `${SITE_URL}/tools/ai` },
      { "@type": "ListItem", position: 4, name: "AutoTube AI",  item: `${SITE_URL}/tools/ai/autotube` },
    ],
  },
};

export default function AutotubePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f0f4ff" }} />}>
        <AutotubeClient />
      </Suspense>
    </>
  );
}
