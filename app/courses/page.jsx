// app/courses/page.jsx
import { Suspense } from "react";
import { serverFetch } from "@/lib/supabaseServer";
import CoursesClient from "./CoursesClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

function toSlug(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ─────────────────────────────────────────────
   Static metadata (crawled by every bot)
───────────────────────────────────────────── */
export const metadata = {
  title: "Online Courses | AIDLA — Learn, Earn & Grow",
  description:
    "Browse free and paid online courses on AIDLA. Learn AI, DataScience, Electrical Engineering, IT, Technical Skills and more. Earn coins and certificates as you learn.",
  keywords:
    "AIDLA courses, free online courses Pakistan, learn online, earn coins, certificates, AI, data analytics, Electrical engineering, IT courses, technical skills, online learning platform Pakistan",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/courses` },
  openGraph: {
    title: "Online Courses — AIDLA",
    description:
      "Browse expert-led courses, earn coins, and get verified certificates on AIDLA — Pakistan's #1 Online educational platform.",
    type: "website",
    url: `${SITE_URL}/courses`,
    images:[{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630 }],
    siteName: "AIDLA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Courses — AIDLA",
    description:
      "Browse expert-led courses, earn coins, and get verified certificates on AIDLA.",
    images:[`${SITE_URL}/og-home.jpg`],
  },
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default async function CoursesPage({ searchParams }) {
  // ✅ FIXED: Safely handle searchParams — can be undefined when bots hit /courses directly
  let level = "all";
  let sort = "newest";
  let q = "";
  
  try {
    const params = searchParams ? await searchParams : {};
    level = params?.level || "all";
    sort = params?.sort || "newest";
    q = params?.q || "";
  } catch (e) {
    // If searchParams fails, use defaults — don't block the page
    console.warn("Failed to parse searchParams:", e);
  }

  const { data: coursesData } = await serverFetch("course_courses", {
    select: "*",
    "status": "eq.published",
    order: "created_at.desc",
  });

  const courses = coursesData || [];
  
  // Filter courses on server for SEO
  let filteredCourses = courses;
  if (level !== "all") {
    filteredCourses = courses.filter(c => c.level === level || c.difficulty === level);
  }
  if (q.trim()) {
    const query = q.toLowerCase();
    filteredCourses = filteredCourses.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.subject?.toLowerCase().includes(query)
    );
  }
  
  // Sort
  if (sort === "newest") {
    filteredCourses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sort === "oldest") {
    filteredCourses.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sort === "title") {
    filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `AIDLA Online Courses ${level !== "all" ? `- ${level.toUpperCase()}` : ""}`,
    description: "Free and paid online courses on AIDLA — Pakistan's #1 educational rewards platform.",
    url: `${SITE_URL}/courses${level !== "all" ? `?level=${level}` : ""}`,
    itemListElement: filteredCourses
      .slice(0, 15) // Limit to 15 for schema
      .map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        description: c.description || "",
        url: `${SITE_URL}/courses/${toSlug(c.title)}`,
        provider: { "@type": "Organization", name: "AIDLA", url: SITE_URL },
      },
    })),
  };


  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE_URL}/courses` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesClient 
          initialCourses={filteredCourses} 
          initialLevel={level} 
          initialSort={sort} 
          initialSearch={q} 
        />
      </Suspense>
    </>
  );
}

function CoursesPageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ padding: "80px 24px 64px", textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ height: 22, width: 180, borderRadius: 30, background: "#e2e8f0", margin: "0 auto 20px" }} />
        <div style={{ height: 52, width: "80%", borderRadius: 10, background: "#e2e8f0", margin: "0 auto 14px" }} />
        <div style={{ height: 20, width: "60%", borderRadius: 8, background: "#e2e8f0", margin: "0 auto" }} />
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 320, borderRadius: 20, background: "linear-gradient(90deg,#e8edf5 25%,#dde3ee 50%,#e8edf5 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}