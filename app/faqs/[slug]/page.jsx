import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import FaqPageClient from "./FaqPageClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

export async function generateStaticParams() {
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) return [];
  
  const { data } = await supabase
    .from("faqs")
    .select("slug")
    .eq("status", "published")
    .eq("is_visible", true)
    .limit(100);
  return (data || []).map(f => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) return { title: "FAQ Not Found — AIDLA" };
  
  const { data: faq } = await supabase
    .from("faqs")
    .select("question, answer, slug")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_visible", true)
    .single();

  if (!faq) return { title: "FAQ Not Found — AIDLA" };

  const desc = faq.answer.replace(/<[^>]+>/g, "").slice(0, 155);
  const canonical = `${SITE_URL}/faqs/${faq.slug}`;

  return {
    title: `${faq.question} — AIDLA FAQ`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${faq.question} — AIDLA FAQ`,
      description: desc,
      url: canonical,
      siteName: "AIDLA",
      type: "article",
      images: [{ url: `${SITE_URL}/og-home.jpg` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${faq.question} — AIDLA FAQ`,
      description: desc,
      images: [`${SITE_URL}/og-home.jpg`],
    },
  };
}

export default async function FAQSlugPage({ params }) {
  const { slug } = await params;

  // Simple single fetch
const { data: faq, error } = await supabase
  .from("faqs")
  .select("*")
  .eq("slug", slug)
  .eq("status", "published")
  .eq("is_visible", true)
  .single();

if (error || !faq) notFound();



  const canonical = `${SITE_URL}/faqs/${faq.slug}`;

  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: faq.question,
      text: faq.question,
      dateCreated: faq.created_at,
      answerCount: 1,
      author: { "@type": "Organization", name: "AIDLA", url: SITE_URL },
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        dateCreated: faq.updated_at || faq.created_at,
        upvoteCount: faq.helpful_yes,
        url: canonical,
        author: { "@type": "Organization", name: "AIDLA", url: SITE_URL },
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faqs` },
      { "@type": "ListItem", position: 3, name: faq.question, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
      />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FaqPageClient faq={faq} />
    </>
  );
}