// app/courses/[slug]/page.jsx
import { notFound }    from "next/navigation";
import { serverFetch } from "@/lib/supabaseServer";
import CourseDetailClient from "./CourseDetailClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

/* ---------------------------------------------
   Slug utility � must match CoursesClient.toSlug
--------------------------------------------- */
function toSlug(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ---------------------------------------------
   Server-side data helper
--------------------------------------------- */
async function getAllCourses() {
  const { data } = await serverFetch("course_courses", {
    select:   "*",
    "status": "eq.published",
  });
  return data || [];
}

export async function generateStaticParams() {
  const courses = await getAllCourses();
  return courses.map(c => ({ slug: toSlug(c.title) }));
}

/* ---------------------------------------------
   Dynamic metadata � unique per course
--------------------------------------------- */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const courses  = await getAllCourses();
  const c        = courses.find(c => toSlug(c.title) === slug) || null;

  if (!c) {
    return {
      title:       "Course Not Found | AIDLA",
      description: "This course could not be found on AIDLA.",
      robots:      { index: false, follow: false },
    };
  }

  const desc =
    (c.description || "").slice(0, 155).replace(/\n/g, " ") +
    " � Learn on AIDLA with courses for students, professionals, freshers, career switchers, founders and lifelong learners.";
  const url   = `${SITE_URL}/courses/${slug}`;
  const image = c.thumbnail_url || `${SITE_URL}/og-home.jpg`;
  const title = `${c.title} | AIDLA Online Courses`;

  return {
    title,
    description: desc,
    keywords: `${c.title}, ${c.category || ""}, online course, AIDLA, free course, career growth, professional skills, AI learning, certificates`,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title:       `${c.title} � AIDLA`,
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

/* ---------------------------------------------
   Page component
--------------------------------------------- */
export default async function CourseDetailPage({ params }) {
  const { slug }  = await params;
  const courses   = await getAllCourses();
  const course    = courses.find(c => toSlug(c.title) === slug) || null;

  if (!course) notFound();

  /* Related: same category or level, exclude current, max 4 */
  const related = courses
    .filter(c => c.id !== course.id && (c.category === course.category || c.level === course.level))
    .slice(0, 4);

  const isFree = !course.price || course.price === 0;
  const url    = `${SITE_URL}/courses/${slug}`;

  const courseSchema = {
    "@context": "https://schema.org",
    "@type":    "Course",
    name:        course.title,
    description: course.description || "",
    url,
    image:       course.thumbnail_url || `${SITE_URL}/og-home.jpg`,
    courseLevel: course.level || "beginner",
    provider: {
      "@type": "EducationalOrganization",
      "@id":   `${SITE_URL}/#organization`,
      name:    "AIDLA",
      url:     SITE_URL,
    },
    offers: {
      "@type":        "Offer",
      price:          course.price || 0,
      priceCurrency:  "PKR",
      availability:   "https://schema.org/InStock",
      url:            `${SITE_URL}/signup`,
      category:       isFree ? "Free" : "Paid",
    },
    hasCourseInstance: {
      "@type":       "CourseInstance",
      courseMode:    "online",
      inLanguage:    "en",
      ...(course.duration_estimate && { courseWorkload: course.duration_estimate }),
    },
    ...(course.duration_estimate && { timeRequired: course.duration_estimate }),
    ...(course.category && { educationalLevel: course.category }),
    inLanguage:          "en",
    isAccessibleForFree: isFree,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE_URL}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CourseDetailClient
        slug={slug}
        initialCourse={course}
        initialRelated={related}
      />
    </>
  );
}
