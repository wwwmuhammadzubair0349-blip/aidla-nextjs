// app/about/page.jsx  —  SERVER COMPONENT
import { createClient } from "@supabase/supabase-js";
import AboutPage from "./about";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildFAQSchema } from "@/lib/schemas";

export const metadata = {
  title: "About AIDLA | Pakistan's #1 Free AI Tools & Learn-to-Earn Academy",
  description:
    "Discover AIDLA — Pakistan's leading AI-digital academy. Free AI-powered Online Courses, tools, CV maker & a Learn-to-Earn rewards system. 100% free, forever.",
  keywords:
    "AIDLA, Free online Courses, Free CV Maker, Free Cover letter maker, free AI tools, learn and earn, CV maker, AI paraphraser, dailyquizz. spin & win, free learning platform Pakistan, online quizzes Pakistan, education Pakistan, earn coins online, lucky draw Pakistan",
  alternates: { canonical: "https://www.aidla.online/about" },
  openGraph: {
    title: "About AIDLA — Pakistan's #1 Free AI Tools Academy",
    description:
      "Discover AIDLA — Pakistan's leading AI-digital academy. Free AI-powered Online Courses, tools, CV maker & a Learn-to-Earn rewards system. 100% free, forever.",
    url: "https://www.aidla.online/about",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
    images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AIDLA — Pakistan's #1 Free AI Powered Learning Academy",
    description: "Free AI tools, CV maker & Learn-to-Earn rewards. 100% free for All.",
    images: ["https://www.aidla.online/og-home.jpg"],
  },
};

async function getFaqs() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("status", "published")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const faqs = await getFaqs();

  const schema = buildGraph(
    buildWebPageSchema({
      path: "/about",
      name: "About AIDLA | Pakistan's #1 Free AI Tools & Learn-to-Earn Academy",
      description: "Discover AIDLA — Pakistan's leading AI-digital academy. Free AI-powered Online Courses, tools, CV maker & a Learn-to-Earn rewards system. 100% free, forever.",
    }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "About", url: "/about" }],
      "/about",
    ),
    faqs.length
      ? buildFAQSchema(faqs.map((f) => ({
          question: f.question,
          answer: f.answer.replace(/<[^>]+>/g, "").trim(),
        })))
      : null,
  );

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <AboutPage faqs={faqs} />
    </>
  );
}