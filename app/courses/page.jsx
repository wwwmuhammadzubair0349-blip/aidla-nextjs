// app/courses/page.jsx
import { Suspense } from "react";
import { serverFetch } from "@/lib/supabaseServer";
import CoursesClient from "./CoursesClient";

export const revalidate = 60;

/* ─────────────────────────────────────────────
   Static metadata (crawled by every bot)
───────────────────────────────────────────── */
export const metadata = {
  title: "Online Courses | AIDLA — Learn, Earn & Grow",
  description:
    "Browse free and paid online courses on AIDLA. Learn Mathematics, Science, English, Computer Science and more. Earn coins and certificates as you learn.",
  keywords:
    "AIDLA courses, free online courses Pakistan, learn online, earn coins, certificates, mathematics, science, English",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/courses" },
  openGraph: {
    title: "Online Courses — AIDLA",
    description:
      "Browse expert-led courses, earn coins, and get verified certificates on AIDLA — Pakistan's #1 educational rewards platform.",
    type: "website",
    url: "https://www.aidla.online/courses",
    images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630 }],
    siteName: "AIDLA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Courses — AIDLA",
    description:
      "Browse expert-led courses, earn coins, and get verified certificates on AIDLA.",
    images: ["https://www.aidla.online/og-home.jpg"],
  },
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default async function CoursesPage() {
  const { data: courses } = await serverFetch("course_courses", {
    select: "id,title,slug,description,cover_image_url,category,difficulty,enrollment_count,is_free,coin_reward,lesson_count,created_at,status",
    "status": "eq.published",
    order: "created_at.desc",
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AIDLA Online Courses",
    description: "Free and paid online courses on AIDLA — Pakistan's #1 educational rewards platform.",
    url: "https://www.aidla.online/courses",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        description: c.description || "",
        url: `https://www.aidla.online/courses/${c.slug}`,
        provider: { "@type": "Organization", name: "AIDLA", url: "https://www.aidla.online" },
      },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "AIDLA",
    url: "https://www.aidla.online",
    logo: "https://www.aidla.online/logo.png",
    description: "Pakistan's #1 educational rewards platform. Learn, earn coins and win real prizes.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesClient initialCourses={courses} />
      </Suspense>
    </>
  );
}

/* SSR-rendered skeleton — no layout shift, instant paint */
function CoursesPageSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {/* Hero placeholder */}
      <div
        style={{
          padding: "80px 24px 64px",
          textAlign: "center",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            height: 22,
            width: 180,
            borderRadius: 30,
            background: "#e2e8f0",
            margin: "0 auto 20px",
          }}
        />
        <div
          style={{
            height: 52,
            width: "80%",
            borderRadius: 10,
            background: "#e2e8f0",
            margin: "0 auto 14px",
          }}
        />
        <div
          style={{
            height: 20,
            width: "60%",
            borderRadius: 8,
            background: "#e2e8f0",
            margin: "0 auto",
          }}
        />
      </div>
      {/* Cards placeholder */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 320,
              borderRadius: 20,
              background: "linear-gradient(90deg,#e8edf5 25%,#dde3ee 50%,#e8edf5 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}