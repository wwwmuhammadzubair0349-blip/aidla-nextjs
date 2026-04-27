// app/blogs/[slug]/page.jsx
import { supabase } from "@/lib/supabase"; 
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 60; 

export async function generateMetadata({ params }) {
  // ⬅️ FIX: Await the params object (Required for Next.js 15+)
  const { slug } = await params; 
  
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) return { title: "Insight Not Found | AIDLA" };
  
  const { data: post } = await supabase
    .from("blogs_posts")
    .select("title, excerpt, cover_image_url, tags, published_at, author_name")
    .eq("slug", slug)
    .is("deleted_at", null)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return { title: "Insight Not Found | AIDLA" };

  const canonicalUrl = `https://www.aidla.online/blogs/${slug}`;

  return {
    title: `${post.title} | AIDLA Insights`,
    description: post.excerpt,
    keywords: post.tags?.join(", "),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.published_at,
      authors:[post.author_name || "AIDLA Team"],
      images: post.cover_image_url ? [{ url: post.cover_image_url }] :[],
      siteName: "AIDLA",
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] :[],
    },
  };
}

export default async function BlogPostPage({ params }) {
  // ⬅️ FIX: Await the params object here too
  const { slug } = await params;

  // 1. Fetch Post
  const { data: post, error } = await supabase
    .from("blogs_posts")
    .select("*")
    .is("deleted_at", null)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  // If no post is found in the database, trigger 404
  if (error || !post) {
    notFound(); 
  }

  // 2. Fetch Related Posts
  const { data: relatedPosts } = await supabase
    .from("blogs_posts")
    .select("id,title,slug,cover_image_url,published_at")
    .is("deleted_at", null)
    .eq("status", "published")
    .neq("slug", slug)
    .limit(4);

  const canonicalUrl = `https://www.aidla.online/blogs/${slug}`;

  // 3. Perfect AI Bot Schema
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.cover_image_url ? [post.cover_image_url] :[],
    "author": { "@type": "Person", "name": post.author_name || "AIDLA Team" },
    "publisher": { "@type": "Organization", "name": "AIDLA", "url": "https://www.aidla.online" },
    "datePublished": post.published_at,
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
    "keywords": post.tags?.join(", ")
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient 
        initialPost={post} 
        relatedPosts={relatedPosts ||[]} 
        slug={slug} 
      />
    </>
  );
}