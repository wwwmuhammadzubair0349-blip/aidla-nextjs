// ════════════════════════════════════════════════════════
//  app/blogs/page.jsx
//  ISR — revalidates every 60 s
//  Static paths pre-built at deploy time (mirrors news/page.jsx)
// ════════════════════════════════════════════════════════
import { serverFetch } from "@/lib/supabaseServer";
import BlogsClient     from "./BlogsClient";

export const revalidate = 60;

const SITE_URL    = "https://www.aidla.online";
const CANONICAL_URL = `${SITE_URL}/blogs`;
const OG_IMAGE    = `${SITE_URL}/og-home.jpg`;

/* ── SEO Metadata ── */
export const metadata = {
  title:       "AIDLA Blog – AI Learning, Career Tips & Platform Updates",
  description: "Explore AIDLA's blog for learning strategies, AI tips, platform updates, and guides to earn more AIDLA Coins. Stay informed and grow your skills today.",
  keywords:    ["AIDLA blog", "educational insights", "learning tips", "platform updates", "Pakistan edtech"],
  alternates:  { canonical: CANONICAL_URL },
  openGraph: {
    title:       "AIDLA Blog – AI Learning, Career Tips & Platform Updates",
    description: "Learn, earn, and stay updated with AIDLA's official blog.",
    url:         CANONICAL_URL,
    siteName:    "AIDLA",
    images:      [{ url: OG_IMAGE, alt: "AIDLA Insights Blog" }],
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AIDLA Insights",
    description: "Educational blog by AIDLA – tips, updates, and more.",
    images:      [OG_IMAGE],
  },
};

export default async function BlogsPage() {
  const { data: posts, error } = await serverFetch("blogs_posts", {
    select:       "id,title,slug,excerpt,cover_image_url,published_at,tags,view_count",
    "deleted_at": "is.null",
    "status":     "eq.published",
    order:        "published_at.desc",
  });

  const safePosts  = posts  || [];
  const fetchError = !!error;

  /* ── JSON-LD: Blog + BlogPosting list (mirrors News @graph pattern) ── */
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":       "Blog",
        name:          "AIDLA Insights – Educational Blog",
        description:   "Discover educational strategies, app updates, and tips to maximize your learning and earnings on AIDLA.",
        url:           CANONICAL_URL,
        inLanguage:    "en",
        isPartOf:      { "@type": "WebSite", name: "AIDLA", url: SITE_URL },
        publisher:     { "@type": "Organization", name: "AIDLA", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",     item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Insights", item: CANONICAL_URL },
        ],
      },
      ...safePosts.slice(0, 15).map(post => ({
        "@type":       "BlogPosting",
        headline:      post.title,
        description:   post.excerpt || "",
        url:           `${CANONICAL_URL}/${post.slug}`,
        datePublished: post.published_at,
        image:         post.cover_image_url || OG_IMAGE,
        publisher:     { "@type": "Organization", name: "AIDLA", url: SITE_URL },
        author:        { "@type": "Organization", name: "AIDLA" },
        keywords:      (post.tags || []).join(", "),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogsClient initialPosts={safePosts} fetchError={fetchError} />
    </>
  );
}