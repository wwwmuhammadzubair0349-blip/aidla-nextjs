// ════════════════════════════════════════════════════════
//  app/blogs/[slug]/page.jsx
//  ISR — revalidates every 60 s
//  Top 50 slugs pre-built at deploy time (mirrors news/[slug]/page.jsx)
// ════════════════════════════════════════════════════════
import { notFound }    from "next/navigation";
import { supabase }    from "@/lib/supabase";
import BlogPostClient  from "./BlogPostClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

/* ── Pre-build top 50 slugs at deploy time (new — mirrors News) ── */
export async function generateStaticParams() {
  if (!supabase) return [];

  const { data } = await supabase
    .from("blogs_posts")
    .select("slug")
    .is("deleted_at", null)
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(50);

  return (data || []).map(p => ({ slug: p.slug }));
}

/* ── Dynamic metadata per article ── */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!supabase) return { title: "Insight Not Found — AIDLA" };

  const { data: post } = await supabase
    .from("blogs_posts")
    .select("title,excerpt,cover_image_url,tags,published_at,updated_at,author_name")
    .eq("slug", slug)
    .is("deleted_at", null)
    .eq("status", "published")
    .maybeSingle();

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

  /* Parallel fetch: article + related (new — mirrors News) */
  const [{ data: post, error }, { data: allPosts }] = await Promise.all([
    supabase
      .from("blogs_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .single(),
    supabase
      .from("blogs_posts")
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

  /* Fallback: recent posts if no tag overlap */
  const related = relatedRaw.length >= 2
    ? relatedRaw
    : (allPosts || []).filter(p => p.slug !== post.slug).slice(0, 4);

  const canonical = `${SITE_URL}/blogs/${slug}`;

  /* ── JSON-LD: Article + BreadcrumbList (new — mirrors News) ── */
  const articleSchema = {
    "@context":    "https://schema.org",
    "@type":       "BlogPosting",
    headline:      post.title,
    description:   post.excerpt || "",
    url:           canonical,
    datePublished: post.published_at,
    dateModified:  post.updated_at || post.published_at,
    image:         post.cover_image_url || OG_IMAGE,
    keywords:      (post.tags || []).join(", "),
    inLanguage:    "en",
    publisher: {
      "@type": "Organization",
      name:    "AIDLA",
      url:     SITE_URL,
      logo: {
        "@type":  "ImageObject",
        url:      `${SITE_URL}/logo.png`,
        width:    200,
        height:   60,
      },
    },
    author: {
      "@type": "Person",
      name:    post.author_name || "AIDLA Team",
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
      { "@type": "ListItem", position: 1, name: "Home",     item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogPostClient
        initialPost={post}
        relatedPosts={related}
        slug={slug}
      />
    </>
  );
}