import LeaderboardClient from "./LeaderboardClient";
import { supabase } from "@/lib/supabase";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildItemListSchema } from "@/lib/schemas";

const SITE_URL = "https://www.aidla.online";

function getDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

export const metadata = {
  title: "Leaderboard — Top Learners, Winners & Rankings | AIDLA",
  description:
    "See AIDLA's live leaderboards: top quiz scorers, lucky draw winners, lucky wheel results, and highest coin earners. Updated in real-time.",
  keywords: [
    "AIDLA leaderboard", "top learners Pakistan", "quiz rankings", "lucky draw winners",
    "coin earners", "AIDLA rankings", "education leaderboard",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: `${SITE_URL}/leaderboard` },
  openGraph: {
    title: "AIDLA Leaderboard — Top Learners & Winners",
    description: "Live rankings: quiz top scorers, lucky draw winners, and highest coin earners on AIDLA.",
    type: "website",
    url: `${SITE_URL}/leaderboard`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Leaderboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDLA Leaderboard — Top Learners & Winners",
    description: "Live rankings of Pakistan's top quiz scorers and prize winners.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default async function LeaderboardPage() {
  let topUsers = [];
  if (supabase) {
    const { data } = await supabase.rpc("daily_quiz_leaderboard", { p_date: getDateKey(-1) });
    topUsers = (data?.winners || []).slice(0, 10);
  }

  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: "/leaderboard",
      name: "AIDLA Leaderboard — Top Learners & Winners",
      description: "Live leaderboards showing top quiz scorers, lucky draw winners, and highest coin earners on AIDLA.",
    }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "Leaderboard", url: "/leaderboard" }],
      "/leaderboard",
    ),
    topUsers.length
      ? buildItemListSchema({
          id:   "leaderboard-top-users",
          name: "AIDLA Top Daily Quiz Learners",
          items: topUsers.map((u, i) => ({
            name: u.full_name || "AIDLA Learner",
            url:  `/leaderboard?rank=${i + 1}`,
          })),
        })
      : null,
  );

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LeaderboardClient />
    </>
  );
}
