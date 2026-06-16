// app/about/page.jsx — SERVER COMPONENT
import { serverFetch } from "@/lib/supabaseServer";
import { SITE } from "@/lib/siteConfig";
import AboutClient from "./about-client";
import {
  buildGraph, buildOrganizationSchema, buildFounderSchema,
  buildWebPageSchema, buildBreadcrumbSchema, buildFAQSchema,
} from "@/lib/schemas";

const SITE_URL = SITE.url;

export const revalidate = 3600;

export const metadata = {
  title: "About AIDLA | Global AI Learning Platform for Students & Professionals",
  description:
    "Discover AIDLA's story and mission: a global AI learning platform giving students, professionals, freshers, and career switchers free access to courses, AI tools, and real rewards.",
  keywords: [
    "About AIDLA", "global AI learning platform", "free online learning",
    "AI courses", "career tools", "professional development",
    "career switching", "AIDLA mission", "AIDLA rewards",
  ],
  authors: [{ name: "AIDLA", url: `${SITE_URL}/about` }],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website", siteName: "AIDLA", locale: "en_US",
    url: `${SITE_URL}/about`,
    title: "About AIDLA | Global AI Learning Platform for Students & Professionals",
    description: "Free courses, AI tools, career resources, AIDLA Coins and rewards for students, professionals, and lifelong learners worldwide.",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "About AIDLA", type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image", site: "@AIDLA_online", creator: "@AIDLA_online",
    title: "About AIDLA | Global AI Learning Platform for Students & Professionals",
    description: "Free courses, AI tools, AIDLA Coins, career resources and rewards for students and professionals worldwide.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

function stripHtml(v = "") {
  return v.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function getAboutData() {
  const [reviewsRes, faqsRes, featuredInRes] = await Promise.all([
    serverFetch("user_reviews", {
      select: "id,full_name,rating,review_text,created_at,avatar_url",
      is_approved: "eq.true",
      order: "created_at.desc",
      limit: "3",
    }, { revalidate: 300 }),
    serverFetch("faqs", {
      select: "id,question,answer,slug",
      status: "eq.published",
      is_visible: "eq.true",
      order: "helpful_yes.desc",
      limit: "4",
    }, { revalidate: 3600 }),
    serverFetch("featured_in", {
      select: "id,name,logo_url,url,sort_order",
      is_active: "eq.true",
      order: "sort_order.asc",
    }, { revalidate: 3600 }),
  ]);

  const faqs = (faqsRes.data || []).map((f) => ({ ...f, answer: stripHtml(f.answer) }));

  return {
    reviews: reviewsRes.data || [],
    faqs,
    featuredIn: featuredInRes.data || [],
  };
}

export default async function AboutPage() {
  const { reviews, faqs, featuredIn } = await getAboutData();

  const jsonLd = buildGraph(
    buildOrganizationSchema(),
    buildFounderSchema(),
    buildWebPageSchema({
      path: "/about",
      name: "About AIDLA | Global AI Learning Platform for Students & Professionals",
      description: "Learn about AIDLA's mission, AI tools, courses, career resources, rewards, and how AIDLA supports students and professionals worldwide.",
    }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "About", url: "/about" }],
      "/about",
    ),
    faqs.length ? buildFAQSchema(faqs, "/about") : null,
  );

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AboutClient reviews={reviews} faqs={faqs} featuredIn={featuredIn} />
    </>
  );
}
