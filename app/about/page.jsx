// app/about/page.jsx  —  SERVER COMPONENT
import { createClient } from "@supabase/supabase-js";
import AboutPage from "./about";

export const metadata = {
  title: "About AIDLA | Pakistan's #1 Free AI Tools & Learn-to-Earn Academy",
  description:
    "Discover AIDLA — Pakistan's leading digital academy founded by Engineer Muhammad Zubair Afridi. Free AI tools, CV maker, career builders & a Learn-to-Earn rewards system. 100% free, forever.",
  keywords:
    "AIDLA, free AI tools Pakistan, learn and earn Pakistan, CV maker Pakistan, AI paraphraser Pakistan, online education Pakistan, digital academy Pakistan, Engineer Muhammad Zubair Afridi, AIDLA Peshawar",
  alternates: { canonical: "https://www.aidla.online/about" },
  openGraph: {
    title: "About AIDLA — Pakistan's #1 Free AI Tools Academy",
    description:
      "Free AI tools, career builders & cash rewards for Pakistani students. Founded in Peshawar by Engineer Muhammad Zubair Afridi.",
    url: "https://www.aidla.online/about",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
    images: [{ url: "https://www.aidla.online/og-about.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AIDLA — Pakistan's #1 Free AI Tools Academy",
    description: "Free AI tools, CV maker & Learn-to-Earn rewards. 100% free for Pakistan.",
    images: ["https://www.aidla.online/og-about.png"],
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
  return <AboutPage faqs={faqs} />;
}