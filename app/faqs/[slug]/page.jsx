// app/faqs/[slug]/page.jsx
import { notFound }    from "next/navigation";
import { supabase }    from "@/lib/supabase";
import FaqPageClient   from "./FaqPageClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

/* ── Pre-build top 100 slugs by view_count at deploy time (fixed — was unordered) ── */
export async function generateStaticParams() {
  if (!supabase) return [];

  const { data } = await supabase
    .from("faqs")
    .select("slug")
    .eq("status", "published")
    .eq("is_visible", true)
    .order("view_count", { ascending: false })  // top viewed first (new)
    .limit(100);

  return (data || []).map(f => ({ slug: f.slug }));
}

/* ── Dynamic metadata per FAQ ── */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!supabase) return { title: "FAQ Not Found — AIDLA" };

  const { data: faq } = await supabase
    .from("faqs")
    .select("question,answer,slug,updated_at,created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_visible", true)
    .single();

  if (!faq) return { title: "FAQ Not Found — AIDLA" };

  // Strip HTML for clean meta description (unchanged — already correct)
  const desc      = faq.answer.replace(/<[^>]+>/g, "").slice(0, 155);
  const canonical = `${SITE_URL}/faqs/${faq.slug}`;

  return {
    title:       `${faq.question} — AIDLA FAQ`,
    description: desc,
    alternates:  { canonical },
    openGraph: {
      title:        `${faq.question} — AIDLA FAQ`,
      description:  desc,
      url:          canonical,
      siteName:     "AIDLA",
      type:         "article",
      // modifiedTime added for freshness signal (new)
      modifiedTime: faq.updated_at || faq.created_at,
      images:       [{ url: `${SITE_URL}/og-home.jpg` }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${faq.question} — AIDLA FAQ`,
      description: desc,
      images:      [`${SITE_URL}/og-home.jpg`],
    },
  };
}

/* ── Page — server component ── */
export default async function FAQSlugPage({ params }) {
  const { slug } = await params;

  const { data: faq, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_visible", true)
    .single();

  if (error || !faq) notFound();

  const canonical = `${SITE_URL}/faqs/${faq.slug}`;

  /* ── JSON-LD: QAPage — answer HTML stripped for clean schema text (fixed) ── */
  const qaSchema = {
    "@context":  "https://schema.org",
    "@type":     "QAPage",
    mainEntity: {
      "@type":       "Question",
      name:          faq.question,
      text:          faq.question,
      dateCreated:   faq.created_at,
      answerCount:   1,
      // author added at Question level (was missing in original)
      author: {
        "@type": "Organization",
        name:    "AIDLA",
        url:     SITE_URL,
      },
      acceptedAnswer: {
        "@type":       "Answer",
        // Strip HTML for clean schema text (fixed — was raw HTML in original)
        text:          faq.answer.replace(/<[^>]+>/g, "").trim(),
        dateCreated:   faq.updated_at || faq.created_at,
        upvoteCount:   faq.helpful_yes,
        url:           canonical,
        author: {
          "@type": "Organization",
          name:    "AIDLA",
          url:     SITE_URL,
        },
      },
    },
  };

  /* ── JSON-LD: BreadcrumbList ── */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faqs` },
      { "@type": "ListItem", position: 3, name: faq.question, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqPageClient faq={faq} />
    </>
  );
}