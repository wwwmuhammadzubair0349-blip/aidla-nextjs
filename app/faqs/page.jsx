import { serverFetch } from "@/lib/supabaseServer";
import FaqsClient from "./FaqsClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Frequently Asked Questions — AIDLA Pakistan Education Platform",
  description: "Find answers to the most common questions about AIDLA — earn coins, tests, lucky draw, withdrawals, and Pakistan education system.",
  keywords:["AIDLA FAQ", "AIDLA questions", "Pakistan education FAQ", "AIDLA coins help"],
  alternates: { canonical: `${SITE_URL}/faqs` },
  openGraph: {
    title: "FAQs — AIDLA",
    description: "Find answers to the most common questions about AIDLA.",
    url: `${SITE_URL}/faqs`,
    siteName: "AIDLA",
    images:[{ url: `${SITE_URL}/og-home.jpg` }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs — AIDLA",
    description: "Find answers to the most common questions about AIDLA.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default async function FAQsPage({ searchParams }) {
  // 1. Read URL params for SSR perfection
  const params = await searchParams;
  const initialCat = params?.cat || "all";

  const { data: faqs, error } = await serverFetch("faqs", {
    select: "*",
    "status": "eq.published",
    "is_visible": "eq.true",
    order: "sort_order.asc,created_at.asc",
  });
  
  const fetchError = !!error;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs ||[]).map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement:[
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
        initialFaqs={faqs ||[]} 
        fetchError={fetchError} 
        initialCat={initialCat} 
      />
    </>
  );
}