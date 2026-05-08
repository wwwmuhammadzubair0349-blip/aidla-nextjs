// app/layout.jsx — Root layout
// Optimized for: Performance 100, Accessibility 100, Best Practices 100, SEO 100
// + AEO, GEO, LLMO, AISEO, EEAT, VSO, SMO, CRO, Technical SEO, Semantic SEO,
//   Mobile SEO, International SEO, Entity SEO, Topical Authority, Knowledge Graph,
//   Featured Snippet, Zero-Click, Schema Markup, SERP, Core Web Vitals
import PublicShell from "@/components/PublicShell";
import localFont from "next/font/local";
import "@/app/globals.css";

const SITE_URL = "https://www.aidla.online";

// ── SELF‑HOSTED FONTS (no more Google Fonts blocking) ──
const dmSans = localFont({
  src: [
    { path: "../public/fonts/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/DMSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "optional",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

const playfairDisplay = localFont({
  src: [
    { path: "../public/fonts/PlayfairDisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/PlayfairDisplay-ExtraBold.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "optional",
  fallback: ["Georgia", "serif"],
});

// Optional: keep Noto Nastaliq Urdu self‑hosted if you use it heavily
const notoUrdu = localFont({
  src: [
    { path: "../public/fonts/NotoNastaliqUrdu-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoNastaliqUrdu-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-urdu",
  display: "optional",
  fallback: ["serif"],
});

// ─────────────────────────────────────────────────────────────────────
// METADATA (unchanged – already perfect)
// ─────────────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
    template: "%s | AIDLA",
  },
  description:
    "AIDLA is Pakistan's #1 free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free study resources — 100% free, no subscription.",
  keywords: [
    "AIDLA",
    "free learning Pakistan",
    "earn coins online Pakistan",
    "online quizzes Pakistan",
    "lucky draw Pakistan",
    "student prizes Pakistan",
    "education platform Pakistan",
    "free online education",
    "AIDLA coins",
    "Pakistan #1 education",
    "earn money learning",
    "AI learning platform",
  ],
  authors: [{ name: "AIDLA", url: SITE_URL }],
  creator: "AIDLA",
  publisher: "AIDLA",
  category: "Education",
  classification: "Education / E-Learning / Rewards",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      "en-PK": `${SITE_URL}/`,
      "en-US": `${SITE_URL}/`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "AIDLA",
    locale: "en_PK",
    alternateLocale: ["ur_PK", "en_US"],
    images: [
      {
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "AIDLA — Learn, Earn Coins & Win Prizes | Pakistan's #1 Free Education Platform",
        type: "image/jpeg",
      },
      {
        url: `${SITE_URL}/og-home-square.jpg`,
        width: 1200,
        height: 1200,
        alt: "AIDLA — Pakistan's #1 Free Education Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIDLA_online",
    creator: "@AIDLA_online",
    images: [`${SITE_URL}/og-home.jpg`],
  },
  applicationName: "AIDLA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AIDLA",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "j4kq2LCJC89N6mrn45InACrIPLowwr3JyLkp1HNusbk",
  },
  other: {
    "theme-color": "#0b1437",
    "color-scheme": "light",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0b1437",
    "geo.region": "PK",
    "geo.country": "Pakistan",
    "geo.placename": "Pakistan",
  },
};

// ─────────────────────────────────────────────────────────────────────
// GLOBAL JSON-LD (unchanged – EEAT & Knowledge Graph power)
// ─────────────────────────────────────────────────────────────────────
const GLOBAL_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization", "OnlineBusiness"],
      "@id": `${SITE_URL}/#organization`,
      name: "AIDLA",
      alternateName: [
        "AI-Digital Learning Academy",
        "Artificial Intelligence Digital Learning Academy",
        "AIDLA Pakistan",
        "AIDLA Online",
      ],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.webp`,
        contentUrl: `${SITE_URL}/logo.webp`,
        width: 200,
        height: 60,
        caption: "AIDLA — Pakistan's #1 Free Education Platform",
        representativeOfPage: true,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      description:
        "AIDLA is Pakistan's number one free education and rewards platform. Students take curriculum-aligned quizzes, earn AIDLA Coins, spin the lucky wheel, win real cash prizes and gadgets, and access thousands of free study materials — entirely free, no subscription required.",
      slogan: "Learn. Earn Coins. Redeem Rewards.",
      foundingDate: "2026",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 10 },
      inLanguage: ["en", "ur"],
      areaServed: [
        { "@type": "Country", name: "Pakistan", "@id": "https://www.wikidata.org/wiki/Q843" },
        { "@type": "AdministrativeArea", name: "Punjab, Pakistan" },
        { "@type": "AdministrativeArea", name: "Sindh, Pakistan" },
        { "@type": "AdministrativeArea", name: "KPK, Pakistan" },
      ],
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
          availableLanguage: [
            { "@type": "Language", name: "English" },
            { "@type": "Language", name: "Urdu" },
          ],
        },
        {
          "@type": "ContactPoint",
          contactType: "technical support",
          url: `${SITE_URL}/contact`,
          availableLanguage: [{ "@type": "Language", name: "English" }],
        },
      ],
      sameAs: [
        "https://www.facebook.com/aidlaonline",
        "https://www.instagram.com/aidlaonline",
        "https://www.youtube.com/@aidlaonline",
        "https://twitter.com/AIDLA_online",
        "https://www.linkedin.com/company/aidla",
        "https://www.tiktok.com/@aidlaonline",
      ],
      knowsAbout: [
        "Online Education",
        "E-Learning",
        "Pakistan Education System",
        "Gamified Learning",
        "Cryptocurrency Rewards",
        "Educational Quizzes",
        "Digital Rewards",
      ],
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Educational Platform",
        recognizedBy: { "@type": "Organization", name: "Pakistan" },
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AIDLA Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Free Online Quizzes",
              description: "Curriculum-aligned quizzes for Pakistan students",
            },
            price: "0",
            priceCurrency: "PKR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Lucky Draw",
              description: "Win real prizes through lucky draws",
            },
            price: "0",
            priceCurrency: "PKR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Lucky Wheel",
              description: "Spin to earn AIDLA Coins daily",
            },
            price: "0",
            priceCurrency: "PKR",
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "AIDLA",
      alternateName: "AIDLA — Pakistan's #1 Free Education Platform",
      description:
        "Pakistan's free education and rewards platform. Complete quizzes, earn coins, win prizes.",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["en", "ur"],
      copyrightYear: 2026,
      copyrightHolder: { "@id": `${SITE_URL}/#organization` },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/faqs?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        {
          "@type": "RegisterAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/signup` },
          name: "Sign up for AIDLA",
          object: { "@id": `${SITE_URL}/#website` },
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "AIDLA",
      url: SITE_URL,
      applicationCategory: "EducationApplication",
      applicationSubCategory: "E-Learning",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PKR",
      },
      screenshot: `${SITE_URL}/og-home.jpg`,
      featureList: [
        "Free online quizzes",
        "Earn AIDLA coins",
        "Lucky draw prizes",
        "Lucky wheel",
        "Leaderboard",
        "Free study materials",
        "Cash withdrawals",
      ],
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#edu-org`,
      name: "AIDLA Learning Academy",
      url: SITE_URL,
      description: "Free online academy offering curriculum-aligned quizzes and courses for Pakistani students",
      educationalCredentialAwarded: "AIDLA Achievement Certificate",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AIDLA Courses",
        itemListElement: [
          {
            "@type": "Course",
            name: "Pakistan Studies",
            description: "Comprehensive quizzes and resources for Pakistan Studies",
            provider: { "@id": `${SITE_URL}/#organization` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
          },
          {
            "@type": "Course",
            name: "Mathematics",
            description: "Practice quizzes for Matric and Intermediate Mathematics",
            provider: { "@id": `${SITE_URL}/#organization` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
          },
          {
            "@type": "Course",
            name: "English Language",
            description: "English language improvement quizzes and resources",
            provider: { "@id": `${SITE_URL}/#organization` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
          },
        ],
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={`${dmSans.variable} ${playfairDisplay.variable} ${notoUrdu.variable}`}>
      <head>
        {/* ══ PERFORMANCE — Critical Hints (only what’s needed) ══ */}
        <link rel="dns-prefetch" href="//static.cloudflareinsights.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* No more fonts.googleapis.com – we’re self‑hosted */}

        {/* ── SELF‑HOSTED FONT PRELOAD ── */}
        <link
          rel="preload"
          href="/fonts/DMSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PlayfairDisplay-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* ── PWA / App Manifest ── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta name="theme-color" content="#0b1437" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta httpEquiv="content-language" content="en, ur" />
        <meta name="ICBM" content="30.3753, 69.3451" />
        <meta name="copyright" content="AIDLA 2026" />
        <meta name="subject" content="Free Online Education, Quizzes, Rewards, Pakistan Students" />
        <meta name="classification" content="Education / E-Learning / Gamified Learning" />
        <meta name="coverage" content="Pakistan" />
        <meta name="target" content="Students, Learners, Pakistan" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="pinterest" content="nopin" />

        {/* ── Global JSON-LD ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_SCHEMA) }}
          suppressHydrationWarning
        />

        {/* ── Speculation Rules (instant navigation) ── */}
        <script
          type="speculationrules"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: {
                    and: [
                      { href_matches: "/*" },
                      { not: { href_matches: "/api/*" } },
                      { not: { href_matches: "/user/*" } },
                      { not: { href_matches: "/admin/*" } },
                      { not: { href_matches: "/login" } },
                      { not: { href_matches: "/signup" } },
                      { not: { href_matches: "/forgot-password" } },
                      { not: { href_matches: "/reset-password" } },
                      { not: { href_matches: "/email-confirmed" } },
                    ],
                  },
                  eagerness: "moderate",
                },
              ],
            }),
          }}
        />
      </head>

      <body>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}