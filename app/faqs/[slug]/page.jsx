// app/faqs/[slug]/page.jsx
import { notFound }    from "next/navigation";
import { serverFetch } from "@/lib/supabaseServer";
import FaqPageClient   from "./FaqPageClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

/* ── Pre-build top 100 slugs by view_count at deploy time ── */
export async function generateStaticParams() {
  const { data } = await serverFetch("faqs", {
    select:       "slug",
    "status":     "eq.published",
    "is_visible": "eq.true",
    order:        "view_count.desc",
    limit:        "100",
  });
  return (data || []).map(f => ({ slug: f.slug }));
}

/* ── Dynamic metadata per FAQ ── */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: faqs } = await serverFetch("faqs", {
    select:       "question,answer,slug,updated_at,created_at",
    slug:         `eq.${slug}`,
    "status":     "eq.published",
    "is_visible": "eq.true",
    limit:        "1",
  });
  const faq = faqs?.[0] || null;

  if (!faq) return { title: "FAQ Not Found — AIDLA" };

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

  const { data: faqs, error } = await serverFetch("faqs", {
    select:       "*",
    slug:         `eq.${slug}`,
    "status":     "eq.published",
    "is_visible": "eq.true",
    limit:        "1",
  });
  const faq = faqs?.[0] || null;

  if (error || !faq) notFound();

  const canonical = `${SITE_URL}/faqs/${faq.slug}`;

  /* ── JSON-LD: QAPage ── */
  const qaSchema = {
    "@context":  "https://schema.org",
    "@type":     "QAPage",
    mainEntity: {
      "@type":       "Question",
      name:          faq.question,
      text:          faq.question,
      dateCreated:   faq.created_at,
      answerCount:   1,
      author: {
        "@type": "Organization",
        name:    "AIDLA",
        url:     SITE_URL,
      },
      acceptedAnswer: {
        "@type":       "Answer",
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
