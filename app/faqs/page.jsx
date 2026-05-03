// app/faqs/page.jsx
import { serverFetch } from "@/lib/supabaseServer";
import FaqsClient      from "./FaqsClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

/* ── SEO Metadata ── */
export const metadata = {
  title:       "Frequently Asked Questions — AIDLA Pakistan Education Platform",
  description: "Find answers to the most common questions about AIDLA — earn coins, tests, lucky draw, withdrawals, and Pakistan education system.",
  keywords:    ["AIDLA FAQ", "AIDLA questions", "Pakistan education FAQ", "AIDLA coins help"],
  robots:      { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1 } },
  alternates:  { canonical: `${SITE_URL}/faqs` },
  openGraph: {
    title:       "FAQs — AIDLA",
    description: "Find answers to the most common questions about AIDLA.",
    url:         `${SITE_URL}/faqs`,
    siteName:    "AIDLA",
    locale:      "en_PK",
    images:      [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA FAQs" }],
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "FAQs — AIDLA",
    description: "Find answers to the most common questions about AIDLA.",
    images:      [`${SITE_URL}/og-home.jpg`],
  },
};

export default async function FAQsPage({ searchParams }) {
  const params     = await searchParams;
  const initialCat = params?.cat || "all";

  const { data: faqs, error } = await serverFetch("faqs", {
    select:        "*",
    "status":      "eq.published",
    "is_visible":  "eq.true",
    order:         "sort_order.asc,created_at.asc",
  });

  const safeFaqs   = faqs   || [];
  const fetchError = !!error;

  // Filter FAQs by category on server for SEO
  let filteredFaqs = safeFaqs;
  if (initialCat !== "all") {
    filteredFaqs = safeFaqs.filter(f => f.category === initialCat);
  }

  /* ── JSON-LD: FAQPage — answer HTML stripped for clean schema text (fixed) ── */
  const structuredData = {
    "@context":   "https://schema.org",
    "@type":      "FAQPage",
    mainEntity:   safeFaqs.map(f => ({
      "@type": "Question",
      name:    f.question,
      // Strip HTML tags so schema text is clean plain text (was missing in original)
      acceptedAnswer: {
        "@type": "Answer",
        text:    f.answer.replace(/<[^>]+>/g, "").trim(),
      },
    })),
  };

  /* ── JSON-LD: BreadcrumbList ── */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faqs` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqsClient
        initialFaqs={filteredFaqs}
        fetchError={fetchError}
        initialCat={initialCat}
      />
    </>
  );
}