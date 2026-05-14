// app/about/page.jsx � SERVER COMPONENT
import { serverFetch } from "@/lib/supabaseServer";
import { SITE } from "@/lib/siteConfig";
import AboutClient from "./about-client";

const SITE_URL = SITE.url;

export const revalidate = 3600;

export const metadata = {
  title: "About AIDLA | AI Powered Learning Platform in Pakistan",
  description:
    "Discover AIDLA's story and mission: a Pakistan-based AI learning platform helping learners access free courses, AI tools, resources and rewards.",
  keywords: [
    "About AIDLA", "Pakistan AI powered learning platform",
    "global AI learning platform", "AI courses", "career tools",
    "career switching", "startup advice", "career mentoring", "AIDLA rewards",
  ],
  authors: [{ name: "AIDLA", url: `${SITE_URL}/about` }],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website", siteName: "AIDLA", locale: "en_PK",
    url: `${SITE_URL}/about`,
    title: "About AIDLA | AI Powered Learning Platform in Pakistan",
    description: "Free courses, AI tools, career resources, AIDLA Coins and rewards for learners and professionals worldwide.",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "About AIDLA", type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image", site: "@AIDLA_online", creator: "@AIDLA_online",
    title: "About AIDLA | AI Powered Learning Platform in Pakistan",
    description: "Free courses, AI tools, AIDLA Coins, career resources and rewards for global learners.",
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
    }, { revalidate: 3600 }),
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

  /* -- Structured data -- */
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: "AIDLA",
    alternateName: ["AI Digital Learning Academy", "AIDLA Online"],
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    foundingDate: "2026",
    description: "Pakistan-based AI-powered digital learning academy offering global courses, AI career tools, daily quiz competitions, AIDLA Coins rewards, and a Learn-to-Earn system.",
    areaServed: [
      { "@type": "Country", name: "Pakistan" },
      { "@type": "Place", name: "Worldwide" },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressRegion: "Khyber Pakhtunkhwa",
      addressLocality: "Peshawar",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "ceo@aidla.online",
      contactType: "customer support",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Urdu"],
    },
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: "Engineer Muhammad Zubair Afridi",
      jobTitle: "Founder & CEO",
      description: "Gold Medalist Electrical Engineer and founder of AIDLA, a Pakistan-based free AI-powered learning platform.",
      url: `${SITE_URL}/about`,
      sameAs: [
        "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
        "https://www.facebook.com/engrzubairafridi/",
        "https://www.instagram.com/muhammad.zubair.afridi/",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Peshawar",
        addressRegion: "Khyber Pakhtunkhwa",
        addressCountry: "PK",
      },
    },
    sameAs: [
      "https://www.instagram.com/aidla_official/",
      "https://www.facebook.com/profile.php?id=61586195563121",
      "https://www.linkedin.com/company/aidla",
      "https://www.tiktok.com/@aidla_official",
      "https://twitter.com/AIDLA_online",
    ],
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: "Engineer Muhammad Zubair Afridi",
    givenName: "Muhammad Zubair",
    familyName: "Afridi",
    honorificPrefix: "Engineer",
    jobTitle: "Founder & CEO",
    description: "Gold Medalist Electrical Engineer from Peshawar, KPK. Founder of AIDLA, a Pakistan-based free AI-powered digital learning academy.",
    worksFor: { "@id": `${SITE_URL}/#organization` },
    email: "ceo@aidla.online",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Peshawar",
      addressRegion: "Khyber Pakhtunkhwa",
      addressCountry: "PK",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Sarhad University Peshawar",
      address: { "@type": "PostalAddress", addressLocality: "Peshawar", addressCountry: "PK" },
    },
    award: "Gold Medal � Electrical Engineering",
    sameAs: [
      "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
      "https://www.facebook.com/engrzubairafridi/",
      "https://www.instagram.com/muhammad.zubair.afridi/",
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about`,
    url: `${SITE_URL}/about`,
    name: "About AIDLA - AI Powered Learning Platform in Pakistan",
    description: "Learn about AIDLA's mission, AI tools, courses, career resources, rewards, and how AIDLA supports learners and professionals worldwide.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    mentions: { "@id": `${SITE_URL}/#founder` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "About AIDLA", item: `${SITE_URL}/about` },
      ],
    },
  };

  const faqSchema = faqs.length ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      {faqSchema && <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <AboutClient reviews={reviews} faqs={faqs} featuredIn={featuredIn} />
    </>
  );
}
