// app/news/[slug]/page.jsx
import { notFound }        from "next/navigation";
import { supabase }        from "@/lib/supabase";
import NewsPageClient      from "./NewsPageClient";

/* ─────────────────────────────────────────────
   ISR — revalidate every 60 seconds
   Static paths pre-built at deploy time for top 50 posts
───────────────────────────────────────────── */
export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

/* Pre-build the 50 most-viewed slugs at deploy time */
export async function generateStaticParams() {
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) return [];
  
  const { data } = await supabase
    .from("news_posts")
    .select("slug")
    .is("deleted_at", null)
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(50);

  return (data || []).map(p => ({ slug: p.slug }));
}

/* ─────────────────────────────────────────────
   Dynamic metadata — per-article SEO
   Native Next.js — no react-helmet needed
───────────────────────────────────────────── */
export async function generateMetadata({ params }) {
    const { slug } = await params;
  
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) {
    return {
      title:       "News Not Found — AIDLA",
      description: "This article could not be found.",
    };
  }
  
  const { data: post } = await supabase
    .from("news_posts")
    .select("title,excerpt,cover_image_url,published_at,tags,slug")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  if (!post) {
    return {
      title:       "News Not Found — AIDLA",
      description: "This article could not be found.",
    };
  }

  const title       = `${post.title} — AIDLA News`;
  const description = post.excerpt
    ? post.excerpt.slice(0, 155)
    : `Read the latest news from AIDLA: ${post.title}`;
  const canonical   = `${SITE_URL}/news/${post.slug}`;
  const image       = post.cover_image_url || OG_IMAGE;

  return {
    title,
    description,
    keywords: (post.tags || []).join(", "),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url:          canonical,
      siteName:     "AIDLA",
      type:         "article",
      publishedTime: post.published_at,
      modifiedTime:  post.updated_at || post.published_at,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
    },
  };
}

/* ─────────────────────────────────────────────
   Page — server component
   Fetches article + related in parallel server-side.
   AI crawlers (ClaudeBot, GPTBot, Googlebot) see
   full content — no JS execution required.
───────────────────────────────────────────── */
export default async function NewsArticlePage({ params }) {
     const { slug } = await params;
  /* Parallel fetch: article + all published for related */
  const [{ data: post, error }, { data: allPosts }] = await Promise.all([
    supabase
      .from("news_posts")
      .select("*")
      .eq("slug", slug) 
      .eq("status", "published")
      .is("deleted_at", null)
      .single(),
    supabase
      .from("news_posts")
      .select("id,title,slug,cover_image_url,published_at,tags,view_count")
      .is("deleted_at", null)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20),
  ]);

  if (error || !post) notFound();

  /* Related: same-tag posts, exclude current, max 4 */
  const postTags   = post.tags || [];
  const relatedRaw = (allPosts || []).filter(p =>
    p.slug !== post.slug &&
    (p.tags || []).some(t => postTags.includes(t))
  ).slice(0, 4);

  /* Fallback: recents if no tag overlap */
  const related = relatedRaw.length >= 2
    ? relatedRaw
    : (allPosts || []).filter(p => p.slug !== post.slug).slice(0, 4);

  /* ── JSON-LD: NewsArticle + BreadcrumbList ── */
  const canonical = `${SITE_URL}/news/${slug}`;

  const articleSchema = {
    "@context":       "https://schema.org",
    "@type":          "NewsArticle",
    headline:         post.title,
    description:      post.excerpt || "",
    url:              canonical,
    datePublished:    post.published_at,
    dateModified:     post.updated_at || post.published_at,
    image:            post.cover_image_url || OG_IMAGE,
    keywords:         (post.tags || []).join(", "),
    inLanguage:       "en",
    publisher: {
      "@type": "Organization",
      name:    "AIDLA",
      url:     SITE_URL,
      logo: {
        "@type": "ImageObject",
        url:     `${SITE_URL}/logo.png`,
        width:   200,
        height:  60,
      },
    },
    author: {
      "@type": "Organization",
      name:    "AIDLA",
      url:     SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":   canonical,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "News",       item: `${SITE_URL}/news` },
      { "@type": "ListItem", position: 3, name: post.title,   item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NewsPageClient post={post} related={related} />
    </>
  );
}