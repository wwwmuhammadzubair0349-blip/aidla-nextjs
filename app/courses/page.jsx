// app/courses/page.jsx
import { Suspense } from "react";
import { serverFetch } from "@/lib/supabaseServer";
import CoursesClient from "./CoursesClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

function toSlug(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ---------------------------------------------
   Static metadata (crawled by every bot)
--------------------------------------------- */
export const metadata = {
  title: "Online Courses for AI, Data, Career & Startup Skills | AIDLA",
  description:
    "Explore AI, data analytics, engineering, medical, career switching and mentoring courses on AIDLA. Learn from school to master level, all free.",
  keywords:
    "AIDLA courses, online courses, AI for beginners, AI engineer course, data analytics, medical courses, power electronics, career switching, startup advice, career mentoring, certificates",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/courses` },
  openGraph: {
    title: "Online Courses for AI, Data, Career & Startup Skills – AIDLA",
    description:
      "Browse courses for students, freshers, professionals, career switchers, founders and lifelong learners.",
    type: "website",
    url: `${SITE_URL}/courses`,
    images:[{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630 }],
    siteName: "AIDLA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Courses for Career Growth – AIDLA",
    description:
      "Browse expert-led courses, earn coins, and get verified certificates on AIDLA.",
    images:[`${SITE_URL}/og-home.jpg`],
  },
};

/* ---------------------------------------------
   Page
--------------------------------------------- */
export default async function CoursesPage() {
  const { data: coursesData } = await serverFetch("course_courses", {
    select: "*",
    "status": "eq.published",
    order: "created_at.desc",
  });

  const courses = coursesData || [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AIDLA Online Courses",
    description: "Online courses on AIDLA for AI, data analytics, medical fields, power electronics, career switching, startup skills, mentoring, certificates and rewards.",
    url: `${SITE_URL}/courses`,
    itemListElement: courses
      .slice(0, 15)
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
          initialCourses={courses}
          initialLevel="all"
          initialSort="newest"
          initialSearch=""
        />
      </Suspense>
    </>
  );
}

function CoursesPageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#fffbeb", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg,#fffbeb 0%,#fef3c7 55%,#fde68a 100%)", borderBottom: "1px solid #f0c96a", padding: "48px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ height: 22, width: 200, borderRadius: 999, background: "rgba(15,23,42,0.1)", margin: "0 auto 20px" }} />
          <div style={{ height: 50, width: "80%", borderRadius: 10, background: "rgba(15,23,42,0.1)", margin: "0 auto 14px" }} />
          <div style={{ height: 20, width: "60%", borderRadius: 8, background: "rgba(15,23,42,0.08)", margin: "0 auto" }} />
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 320, borderRadius: 20, background: "linear-gradient(90deg,#fef3c7 25%,#fde68a 50%,#fef3c7 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
