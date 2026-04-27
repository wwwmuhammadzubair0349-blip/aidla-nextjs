// app/blogs/page.jsx
import { serverFetch } from "@/lib/supabaseServer";
import BlogsClient from "./BlogsClient";

export const revalidate = 60;

const CANONICAL_URL = "https://www.aidla.online/blogs";
const OG_IMAGE = "https://www.aidla.online/og-home.jpg";

// 🧠 100% SEO Metadata (Native Next.js)
export const metadata = {
  title: "AIDLA Insights – Educational Blog & Updates",
  description: "Explore AIDLA's blog for learning strategies, platform updates, and tips to earn more coins. Stay informed and maximize your experience.",
  keywords: ["AIDLA blog", "educational insights", "learning tips", "platform updates", "Pakistan edtech"],
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    title: "AIDLA Insights – Educational Blog",
    description: "Learn, earn, and stay updated with AIDLA's official blog.",
    url: CANONICAL_URL,
    siteName: "AIDLA",
    images: [{ url: OG_IMAGE, alt: "AIDLA Insights Blog" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDLA Insights",
    description: "Educational blog by AIDLA – tips, updates, and more.",
    images: [OG_IMAGE],
  },
};

export default async function BlogsPage() {
  const { data: posts, error } = await serverFetch("blogs_posts", {
    select: "id,title,slug,excerpt,cover_image_url,published_at,tags,view_count",
    "deleted_at": "is.null",
    "status": "eq.published",
    order: "published_at.desc",
  });

  // 🤖 AI STRUCTURED DATA (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AIDLA Insights – Educational Blog",
    "description": "Discover educational strategies, app updates, and tips to maximize your learning and earnings on AIDLA.",
    "url": CANONICAL_URL,
    "inLanguage": "en",
    "publisher": { "@type": "Organization", "name": "AIDLA", "url": "https://www.aidla.online" },
    "blogPost": posts?.slice(0, 15).map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `${CANONICAL_URL}/${post.slug}`,
      "datePublished": post.published_at,
      "image": post.cover_image_url,
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Pass the server-fetched data straight into the interactive client layout */}
      <BlogsClient initialPosts={posts} fetchError={!!error} />
    </>
  );
}