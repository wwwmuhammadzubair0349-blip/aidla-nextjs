import LeaderboardClient from "./LeaderboardClient";

const SITE_URL = "https://www.aidla.online";

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

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/leaderboard`,
  url: `${SITE_URL}/leaderboard`,
  name: "AIDLA Leaderboard — Top Learners & Winners",
  description: "Live leaderboards showing top quiz scorers, lucky draw winners, and highest coin earners on AIDLA.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",        item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Leaderboard", item: `${SITE_URL}/leaderboard` },
    ],
  },
};

export default function LeaderboardPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LeaderboardClient />
    </>
  );
}
