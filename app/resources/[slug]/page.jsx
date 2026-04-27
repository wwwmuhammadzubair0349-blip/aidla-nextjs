// app/resources/[slug]/page.jsx

import { createClient } from "@supabase/supabase-js";
import ResourceDetailClient from "./ResourceDetailClient";

async function getMaterial(slug) {
  try {
    // Handle build-time scenario where environment variables are not available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase.rpc("study_materials_get_by_slug", { p_slug: slug });
    return data?.[0] || null;
  } catch {
    return null;
  }
}

// ✅ await params before accessing .slug
export async function generateMetadata({ params }) {
  const { slug } = await params;                          // <-- fix here
  const m     = await getMaterial(slug);
  const title = m ? `${m.title} — Download Free | AIDLA` : "Resource | AIDLA";
  const desc  = m?.description || (m ? `Download ${m.title} — free study material on AIDLA` : "Free study material on AIDLA");
  const url   = `https://www.aidla.online/resources/${slug}`;

  return {
    title,
    description: desc,
    robots: "index, follow",
    alternates: { canonical: url },
    openGraph: { title, description: desc, type: "article", url, images: [{ url: "https://www.aidla.online/og-home.jpg" }], siteName: "AIDLA" },
    twitter:    { card: "summary_large_image", title, description: desc, images: ["https://www.aidla.online/og-home.jpg"] },
  };
}

// ✅ await params here too
export default async function ResourceDetailPage({ params }) {
  const { slug } = await params;                          // <-- fix here
  return <ResourceDetailClient slug={slug} />;
}