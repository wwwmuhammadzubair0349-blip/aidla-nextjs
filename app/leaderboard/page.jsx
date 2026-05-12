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
  title: "AIDLA Leaderboard � Quiz Winners, Battles & Rankings",
  description:
    "See AIDLA live rankings, daily quiz winners, battle leaders, test champions, lucky draw results, lucky wheel wins, rewards and learner achievements.",
  keywords: [
    "AIDLA leaderboard", "quiz winners", "battle leaderboard", "test rankings", "lucky draw winners",
    "learning rewards", "AIDLA rankings", "online learning leaderboard",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: `${SITE_URL}/leaderboard` },
  openGraph: {
    title: "AIDLA Leaderboard � Quiz Winners, Battles & Rankings",
    description: "Live rankings: daily quiz winners, battle leaders, test champions, lucky draw and wheel winners on AIDLA.",
    type: "website",
    url: `${SITE_URL}/leaderboard`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Leaderboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDLA Leaderboard � Quiz Winners, Battles & Rankings",
    description: "Live AIDLA rankings for quizzes, battles, tests and prize winners.",
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
      name: "AIDLA Leaderboard � Quiz Winners, Battles & Rankings",
      description: "Live leaderboards showing daily quiz winners, battle leaders, test champions, lucky draw results, lucky wheel wins and learner achievements.",
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
