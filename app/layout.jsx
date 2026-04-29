// app/layout.jsx  — Root layout
import { Inter } from "next/font/google";
import PublicShell from "@/components/PublicShell";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
    template: "%s | AIDLA",
  },
  description:
    "AIDLA is Pakistan's #1 free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free study resources.",
  keywords: ["AIDLA", "free learning Pakistan", "earn coins", "online quizzes", "lucky draw", "student prizes", "education platform"],
  authors: [{ name: "AIDLA" }],
  creator: "AIDLA",
  publisher: "AIDLA",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    siteName: "AIDLA",
    locale: "en_US",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA — Learn, Earn, Win" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIDLA",
    creator: "@AIDLA",
  },
};

// Global Organization + WebSite schema — injected on every page.
// Powers Google's Knowledge Panel (name, logo, sameAs, SearchAction).
const GLOBAL_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "AIDLA",
      alternateName: "AI-Driven Learning Academy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
        caption: "AIDLA",
      },
      image: { "@id": `${SITE_URL}/#logo` },
      description:
        "AIDLA is Pakistan's #1 free education and rewards platform. Students take quizzes, earn AIDLA Coins, spin the lucky wheel, win real cash prizes, and access free study materials.",
      foundingDate: "2024",
      inLanguage: ["en", "ur"],
      areaServed: { "@type": "Country", name: "Pakistan" },
      address: {
        "@type": "PostalAddress",
        addressCountry: "PK",
        addressRegion: "Punjab",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: `${SITE_URL}/contact`,
          availableLanguage: ["English", "Urdu"],
        },
      ],
      sameAs: [
        "https://facebook.com/aidla",
        "https://instagram.com/aidla",
        "https://youtube.com/aidla",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "AIDLA",
      description: "Pakistan's #1 free education and rewards platform.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en", "ur"],
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/faqs?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PERFORMANCE FIX: Preconnect to Google Fonts domains BEFORE fetching */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ✅ PERFORMANCE FIX: Load Playfair Display + DM Sans via <link> (non-blocking)
            instead of CSS @import (render-blocking).
            Only load weights actually used: Playfair 700+900, DM Sans 400+600+700 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_SCHEMA) }}
        />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}