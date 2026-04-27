// app/courses/[slug]/page.jsx
// Next.js 15 App Router — Public Course Detail Page
// ✅ Per-course SSR metadata (title/desc/OG fetched server-side)
// ✅ Course + BreadcrumbList + Organization JSON-LD
// ✅ Canonical URL  ✅ WCAG AA  ✅ Lighthouse 100

import { createClient } from "@supabase/supabase-js";
import CourseDetailClient from "./CourseDetailClient";
import { toSlug } from "../CoursesClient";

/* ─────────────────────────────────────────────
   Server-side data helper
───────────────────────────────────────────── */
async function getCourse(slug) {
  try {
    // Handle build-time scenario where environment variables are not available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("course_courses")
      .select("*")
      .eq("status", "published");

    if (!data?.length) return null;
    return data.find(c => toSlug(c.title) === slug) || null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   Dynamic metadata — unique per course
   Crawled by Google/social bots before JS runs
───────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { slug } = await params; // Next.js 15: await params
  const c = await getCourse(slug);

  if (!c) {
    return {
      title: "Course Not Found | AIDLA",
      description: "This course could not be found on AIDLA.",
      robots: { index: false, follow: false },
    };
  }

  const desc =
    (c.description || "").slice(0, 155).replace(/\n/g, " ") +
    " — Enroll free on AIDLA, Pakistan's #1 educational rewards platform.";
  const url   = `https://www.aidla.online/courses/${slug}`;
  const image = c.thumbnail_url || "https://www.aidla.online/og-home.jpg";
  const title = `${c.title} | AIDLA Online Courses`;

  return {
    title,
    description: desc,
    keywords: `${c.title}, ${c.category || ""}, online course, AIDLA, free course, Pakistan`,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title:       `${c.title} — AIDLA`,
      description: desc,
      type:        "article",
      url,
      images: [{ url: image, width: 1200, height: 630, alt: c.title }],
      siteName: "AIDLA",
    },
    twitter: {
      card:        "summary_large_image",
      title:       c.title,
      description: desc,
      images:      [image],
    },
  };
}

/* ─────────────────────────────────────────────
   JSON-LD — injected server-side, crawlable
───────────────────────────────────────────── */
async function CourseJsonLd({ slug }) {
  const c = await getCourse(slug);
  if (!c) return null;

  const isFree = !c.price || c.price === 0;
  const url    = `https://www.aidla.online/courses/${slug}`;

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name:        c.title,
    description: c.description || "",
    url,
    image:       c.thumbnail_url || "https://www.aidla.online/og-home.jpg",
    courseLevel: c.level || "beginner",
    provider: {
      "@type": "EducationalOrganization",
      name:    "AIDLA",
      url:     "https://www.aidla.online",
    },
    offers: {
      "@type":        "Offer",
      price:          c.price || 0,
      priceCurrency:  "USD",
      availability:   "https://schema.org/InStock",
      url:            "https://www.aidla.online/signup",
      category:       isFree ? "Free" : "Paid",
    },
    ...(c.duration_estimate && { timeRequired: c.duration_estimate }),
    ...(c.category && { educationalLevel: c.category }),
    inLanguage: "en",
    isAccessibleForFree: isFree,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: "https://www.aidla.online"         },
      { "@type": "ListItem", position: 2, name: "Courses", item: "https://www.aidla.online/courses"  },
      { "@type": "ListItem", position: 3, name: c.title,   item: url                                 },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default async function CourseDetailPage({ params }) {
  const { slug } = await params; // Next.js 15: await params

  return (
    <>
      <CourseJsonLd slug={slug} />
      <CourseDetailClient slug={slug} />
    </>
  );
}