// ════════════════════════════════════════════════════════
//  app/blogs/[slug]/page.jsx
//  ISR — revalidates every 60 s
//  Top 50 slugs pre-built at deploy time (mirrors news/[slug]/page.jsx)
// ════════════════════════════════════════════════════════
import { notFound }       from "next/navigation";
import { serverFetch }    from "@/lib/supabaseServer";
import BlogPostClient     from "./BlogPostClient";
import { buildGraph, buildArticleSchema, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

/* ── Pre-build top 50 slugs at deploy time ── */
export async function generateStaticParams() {
  const { data } = await serverFetch("blogs_posts", {
    select:        "slug",
    "deleted_at":  "is.null",
    "status":      "eq.published",
    order:         "view_count.desc",
    limit:         "50",
  });
  return (data || []).map(p => ({ slug: p.slug }));
}

/* ── Dynamic metadata per article ── */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const { data: posts } = await serverFetch("blogs_posts", {
    select:       "title,excerpt,cover_image_url,tags,published_at,updated_at,author_name",
    slug:         `eq.${slug}`,
    "deleted_at": "is.null",
    "status":     "eq.published",
    limit:        "1",
  });
  const post = posts?.[0] || null;

  if (!post) return { title: "Insight Not Found — AIDLA" };

  const title       = `${post.title} — AIDLA Insights`;
  const description = post.excerpt
    ? post.excerpt.slice(0, 155)
    : `Read the latest insights from AIDLA: ${post.title}`;
  const canonical   = `${SITE_URL}/blogs/${slug}`;
  const image       = post.cover_image_url || OG_IMAGE;

  return {
    title,
    description,
    keywords:   (post.tags || []).join(", "),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url:           canonical,
      siteName:      "AIDLA",
      type:          "article",
      publishedTime: post.published_at,
      modifiedTime:  post.updated_at,
      authors:       [post.author_name || "AIDLA Team"],
      images:        [{ url: image, alt: post.title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [image],
    },
  };
}

/* ── Page — server component ── */
export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  /* Parallel fetch: article + related */
  const [{ data: postArr, error }, { data: allPosts }] = await Promise.all([
    serverFetch("blogs_posts", {
      select:       "*",
      slug:         `eq.${slug}`,
      "deleted_at": "is.null",
      "status":     "eq.published",
      limit:        "1",
    }),
    serverFetch("blogs_posts", {
      select:       "id,title,slug,cover_image_url,published_at,tags,view_count",
      "deleted_at": "is.null",
      "status":     "eq.published",
      order:        "published_at.desc",
      limit:        "20",
    }),
  ]);

  const post = postArr?.[0] || null;
  if (error || !post) notFound();

  /* Related: same-tag posts, exclude current, max 4 */
  const postTags   = post.tags || [];
  const relatedRaw = (allPosts || []).filter(p =>
    p.slug !== post.slug &&
    (p.tags || []).some(t => postTags.includes(t))
  ).slice(0, 4);

  /* Fallback: recent posts if no tag overlap */
  const related = relatedRaw.length >= 2
    ? relatedRaw
    : (allPosts || []).filter(p => p.slug !== post.slug).slice(0, 4);

  const canonical = `${SITE_URL}/blogs/${slug}`;

  const jsonLd = buildGraph(
    buildWebPageSchema({ path: `/blogs/${slug}`, name: post.title, description: post.excerpt || "" }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "Insights", url: "/blogs" }, { name: post.title, url: `/blogs/${slug}` }],
      `/blogs/${slug}`,
    ),
    buildArticleSchema({
      slug,
      title:       post.title,
      description: post.excerpt || "",
      image:       post.cover_image_url
        ? { "@type": "ImageObject", url: post.cover_image_url, width: 1200, height: 630 }
        : undefined,
      datePublished:      post.published_at,
      dateModified:       post.updated_at || post.published_at,
      keywords:           (post.tags || []).join(", ") || undefined,
      speakableSelectors: ["h1", ".article-lead", "article h2:first-of-type"],
    }),
  );

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient
        initialPost={post}
        relatedPosts={related}
        slug={slug}
      />
    </>
  );
}
