// app/news/[slug]/page.jsx
import { notFound }        from "next/navigation";
import { serverFetch }     from "@/lib/supabaseServer";
import NewsPageClient      from "./NewsPageClient";
import { buildGraph, buildArticleSchema, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

/* ─────────────────────────────────────────────
   ISR — revalidate every 60 seconds
   Static paths pre-built at deploy time for top 50 posts
───────────────────────────────────────────── */
export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

/* Pre-build the 50 most-viewed slugs at deploy time */
export async function generateStaticParams() {
  const { data } = await serverFetch("news_posts", {
    select: "slug",
    deleted_at: "is.null",
    status: "eq.published",
    order: "view_count.desc",
    limit: "50",
  });

  return (data || []).map(p => ({ slug: p.slug }));
}

/* ─────────────────────────────────────────────
   Dynamic metadata — per-article SEO
   Native Next.js — no react-helmet needed
───────────────────────────────────────────── */
export async function generateMetadata({ params }) {
    const { slug } = await params;
  
  const { data: posts } = await serverFetch("news_posts", {
    select: "title,excerpt,cover_image_url,published_at,updated_at,tags,slug",
    slug: `eq.${slug}`,
    status: "eq.published",
    deleted_at: "is.null",
    limit: "1",
  });
  const post = posts?.[0] || null;

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
    serverFetch("news_posts", {
      select: "*",
      slug: `eq.${slug}`,
      status: "eq.published",
      deleted_at: "is.null",
      limit: "1",
    }),
    serverFetch("news_posts", {
      select: "id,title,slug,cover_image_url,published_at,tags,view_count",
      deleted_at: "is.null",
      status: "eq.published",
      order: "published_at.desc",
      limit: "20",
    }),
  ]);

  const article = post?.[0] || null;
  if (error || !article) notFound();

  /* Related: same-tag posts, exclude current, max 4 */
  const postTags   = article.tags || [];
  const relatedRaw = (allPosts || []).filter(p =>
    p.slug !== article.slug &&
    (p.tags || []).some(t => postTags.includes(t))
  ).slice(0, 4);

  /* Fallback: recents if no tag overlap */
  const related = relatedRaw.length >= 2
    ? relatedRaw
    : (allPosts || []).filter(p => p.slug !== article.slug).slice(0, 4);

  const canonical = `${SITE_URL}/news/${slug}`;

  const jsonLd = buildGraph(
    buildWebPageSchema({ path: `/news/${slug}`, name: article.title, description: article.excerpt || "" }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "News", url: "/news" }, { name: article.title, url: `/news/${slug}` }],
      `/news/${slug}`,
    ),
    buildArticleSchema({
      slug,
      type:        "NewsArticle",
      basePath:    "news",
      title:       article.title,
      description: article.excerpt || "",
      image:       article.cover_image_url || undefined,
      datePublished:   article.published_at,
      dateModified:    article.updated_at || article.published_at,
      keywords:        (article.tags || []).join(", ") || undefined,
    }),
  );

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsPageClient post={article} related={related} />
    </>
  );
}
