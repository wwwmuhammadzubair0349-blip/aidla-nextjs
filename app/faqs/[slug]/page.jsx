// app/faqs/[slug]/page.jsx
import { notFound }    from "next/navigation";
import { serverFetch } from "@/lib/supabaseServer";
import FaqPageClient   from "./FaqPageClient";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildFounderSchema,
  buildGraph,
  buildWebPageSchema,
} from "@/lib/schemas";

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
    robots:      { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1 } },
    alternates:  { canonical },
    openGraph: {
      title:        `${faq.question} — AIDLA FAQ`,
      description:  desc,
      url:          canonical,
      siteName:     "AIDLA",
      locale:       "en_PK",
      type:         "article",
      modifiedTime: faq.updated_at || faq.created_at,
      images:       [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: faq.question }],
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

  const plainAnswer = faq.answer.replace(/<[^>]+>/g, "").trim();

  const qaSchema = {
    "@type":     "QAPage",
    "@id":       `${canonical}#qapage`,
    url:         canonical,
    mainEntity: {
      "@type":       "Question",
      "@id":         `${canonical}#question`,
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
        "@id":         `${canonical}#answer`,
        text:          plainAnswer,
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

  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: `/faqs/${faq.slug}`,
      name: `${faq.question} - AIDLA FAQ`,
      description: plainAnswer.slice(0, 155),
      dateModified: (faq.updated_at || faq.created_at || "").slice(0, 10),
      speakableSelectors: [".faqp-hero-title", ".faqp-answer-text"],
    }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "FAQs", url: "/faqs" }, { name: faq.question, url: `/faqs/${faq.slug}` }],
      `/faqs/${faq.slug}`,
    ),
    buildFAQSchema([{ question: faq.question, answer: plainAnswer }], `/faqs/${faq.slug}`),
    qaSchema,
    buildFounderSchema(),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqPageClient faq={faq} />
    </>
  );
}
