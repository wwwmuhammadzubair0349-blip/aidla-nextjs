// app/faqs/page.jsx
import { serverFetch } from "@/lib/supabaseServer";
import FaqsClient      from "./FaqsClient";
import { buildGraph, buildFAQSchema, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online"; // used in metadata only

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
  // ✅ FIXED: Safely handle searchParams — can be undefined when bots hit /faqs directly
  let initialCat = "all";
  
  try {
    const params = searchParams ? await searchParams : {};
    initialCat = params?.cat || "all";
  } catch (e) {
    // If searchParams fails, use default — don't block the page
    console.warn("Failed to parse searchParams:", e);
    initialCat = "all";
  }

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

  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: "/faqs",
      name: "Frequently Asked Questions — AIDLA Pakistan Education Platform",
      description: "Find answers to the most common questions about AIDLA — earn coins, tests, lucky draw, withdrawals, and Pakistan education system.",
    }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "FAQs", url: "/faqs" }],
      "/faqs",
    ),
    buildFAQSchema(
      safeFaqs.map(f => ({
        question: f.question,
        answer:   f.answer.replace(/<[^>]+>/g, "").trim(),
      }))
    ),
  );

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqsClient
        initialFaqs={filteredFaqs}
        fetchError={fetchError}
        initialCat={initialCat}
      />
    </>
  );
}