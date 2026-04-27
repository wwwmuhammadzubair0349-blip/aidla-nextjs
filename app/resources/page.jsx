import { Suspense } from "react";
import ResourcesClient from "./ResourcesClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free Study Materials — Notes, Past Papers & Books | AIDLA",
  description:
    "Download free study materials, notes, past papers, thesis, templates and books on AIDLA. Organized by subject, university and class level.",
  keywords: [
    "study materials Pakistan", "free notes", "past papers", "thesis", "templates",
    "free books", "AIDLA resources", "Pakistan education resources",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: `${SITE_URL}/resources` },
  openGraph: {
    title: "Free Study Materials — Notes, Past Papers & Books | AIDLA",
    description: "Download free notes, past papers, thesis and books organized by subject and class.",
    type: "website",
    url: `${SITE_URL}/resources`,
    siteName: "AIDLA",
    locale: "en_US",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Study Materials" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study Materials — AIDLA",
    description: "Download free notes, past papers, thesis and books.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/resources`,
  url: `${SITE_URL}/resources`,
  name: "Free Study Materials — Notes, Past Papers & Books",
  description: "Free study materials including notes, past papers, thesis, templates and books organized by subject and class level.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
  about: { "@type": "Thing", name: "Educational Resources" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
    ],
  },
};

const RESOURCE_CATEGORIES = [
  { icon: "📄", name: "Notes",        desc: "Handwritten and typed notes for all subjects — Maths, Physics, Chemistry, Biology, English and more." },
  { icon: "📝", name: "Past Papers",  desc: "Board and university past papers with solutions for Matric, FSc, A-Level, and degree programs." },
  { icon: "🎓", name: "Thesis",       desc: "Sample thesis and research papers from Pakistani universities to help students with formatting and references." },
  { icon: "📋", name: "Templates",    desc: "CV templates, assignment templates, lab reports, and academic writing templates — all free to download." },
  { icon: "📚", name: "Books",        desc: "Free textbooks and reference books aligned with Punjab, Sindh, KPK, and Federal board curricula." },
  { icon: "🏛️", name: "University",  desc: "University-level resources covering engineering, medical, business, CS and social sciences." },
];

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Static content — fully visible to bots before JS loads */}
      <section
        style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px 0", fontFamily: "'DM Sans',sans-serif" }}
        aria-label="Resource categories"
      >
        <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", fontWeight: 900, color: "#0b1437", marginBottom: 8 }}>
          Free Study Materials
        </h1>
        <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: 36, maxWidth: 640 }}>
          Download free notes, past papers, thesis, templates and books for Pakistani students — organized by subject, class level and university.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16, marginBottom: 48 }}>
          {RESOURCE_CATEGORIES.map(c => (
            <div key={c.name} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 10 }} aria-hidden="true">{c.icon}</div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0b1437", marginBottom: 6 }}>{c.name}</h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive client component — loads after static shell */}
      <Suspense fallback={null}>
        <ResourcesClient />
      </Suspense>
    </>
  );
}