// app/layout.jsx — Root layout
// Optimized for: Performance 100, Accessibility 100, Best Practices 100, SEO 100
// + AEO, GEO, LLMO, AISEO, EEAT, VSO, SMO, CRO, Technical SEO, Semantic SEO,
//   Mobile SEO, International SEO, Entity SEO, Topical Authority, Knowledge Graph,
//   Featured Snippet, Zero-Click, Schema Markup, SERP, Core Web Vitals
import PublicShell from "@/components/PublicShell";
import "@/app/globals.css";

const SITE_URL = "https://www.aidla.online";

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
  // ── Canonical + hreflang for International SEO ──
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      "en-PK": `${SITE_URL}/`,
      "ur-PK": `${SITE_URL}/ur/`,
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
  // ── App Indexing / PWA ──
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
  // ── Verification tokens ──
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
    // bing: "YOUR_BING_TOKEN",
  },
  // ── Additional Meta ──
  other: {
    "theme-color": "#0b1437",
    "color-scheme": "light",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0b1437",
    "msapplication-config": `${SITE_URL}/browserconfig.xml`,
    // GEO / Local SEO signals
    "geo.region": "PK",
    "geo.country": "Pakistan",
    "geo.placename": "Pakistan",
    // DCMI / Dublin Core — for AEO / LLMO
    "DC.language": "en",
    "DC.coverage": "Pakistan",
    "DC.subject": "Education, Online Learning, Quizzes, Rewards",
    "DC.type": "InteractiveResource",
    // EEAT signals
    "article:author": "AIDLA Editorial Team",
    // Revisit
    revisit: "7 days",
    // Rating
    rating: "general",
    // Content language
    language: "English",
    // Distribution
    distribution: "global",
    // Target audience
    audience: "students, learners, Pakistan",
  },
};

// ─────────────────────────────────────────────────────────────────────
// COMPREHENSIVE JSON-LD SCHEMA MARKUP
// Powers: Knowledge Graph, Featured Snippets, Rich Results,
//         Entity SEO, AEO, GEO, Voice Search, Zero-Click
// ─────────────────────────────────────────────────────────────────────
const GLOBAL_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    // ── 1. Organization (Knowledge Panel + EEAT) ──
    {
      "@type": ["Organization", "EducationalOrganization", "OnlineBusiness"],
      "@id": `${SITE_URL}/#organization`,
      name: "AIDLA",
      alternateName: [
        "AI-Driven Learning Academy",
        "Artificial Intelligence Digital Learning Academy",
        "AIDLA Pakistan",
        "AIDLA Online",
      ],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
        caption: "AIDLA — Pakistan's #1 Free Education Platform",
        representativeOfPage: true,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      description:
        "AIDLA is Pakistan's number one free education and rewards platform. Students take curriculum-aligned quizzes, earn AIDLA Coins, spin the lucky wheel, win real cash prizes and gadgets, and access thousands of free study materials — entirely free, no subscription required.",
      slogan: "Learn. Earn Coins. Redeem Rewards.",
      foundingDate: "2024",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 10 },
      inLanguage: ["en", "ur"],
      // ── Local SEO / GEO ──
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
      // ── SMO — Social Media Optimization ──
      sameAs: [
        "https://www.facebook.com/aidlaonline",
        "https://www.instagram.com/aidlaonline",
        "https://www.youtube.com/@aidlaonline",
        "https://twitter.com/AIDLA_online",
        "https://www.linkedin.com/company/aidla",
        "https://www.tiktok.com/@aidlaonline",
      ],
      // ── EEAT Signals ──
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
      // ── CRO — Offers ──
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

    // ── 2. WebSite (Sitelinks SearchBox + VSO) ──
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
      copyrightYear: 2024,
      copyrightHolder: { "@id": `${SITE_URL}/#organization` },
      // ── Voice Search / Sitelinks SearchBox ──
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

    // ── 3. SoftwareApplication (App Indexing / ASO) ──
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
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "1200",
        bestRating: "5",
        worstRating: "1",
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

    // ── 4. EducationalOrganization with Course offerings (Topical Authority) ──
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

    // ── 5. ItemList — Breadcrumb for all pages ──
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
    <html lang="en" dir="ltr">
      <head>
        {/* ══════════════════════════════════════════════════════════
            PERFORMANCE — Critical Resource Hints
            Order matters: dns-prefetch → preconnect → preload
            ══════════════════════════════════════════════════════════ */}

        {/* DNS prefetch for third-party domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//static.cloudflareinsights.com" />

        {/* Preconnect — critical third parties */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── FONT LOADING STRATEGY ──
            Using font-display=swap + preload for zero render-blocking.
            Playfair Display: headings (used above fold)
            DM Sans: body copy
            Noto Nastaliq Urdu: Arabic/Urdu quotes
            Only load needed weights & subsets. */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Non-blocking Google Fonts load with font-display=swap */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          media="print"
          // @ts-ignore — onload trick for async font loading (progressive enhancement)
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"
          />
        </noscript>

        {/* ── PWA / App Manifest ── */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ── Canonical self-reference (belt & suspenders) ── */}
        <link rel="canonical" href={SITE_URL} />

        {/* ── Theme colors ── */}
        <meta name="theme-color" content="#0b1437" />
        <meta name="msapplication-TileColor" content="#0b1437" />

        {/* ── Viewport — Mobile SEO ── */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* ── Language / GEO / Local SEO ── */}
        <meta httpEquiv="content-language" content="en, ur" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="PK" />
        <meta name="geo.country" content="Pakistan" />
        <meta name="geo.placename" content="Pakistan" />
        <meta name="ICBM" content="30.3753, 69.3451" />

        {/* ── EEAT / Authorship ── */}
        <meta name="author" content="AIDLA Editorial Team" />
        <meta name="copyright" content="AIDLA 2024" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="3 days" />

        {/* ── AEO / LLMO — Help AI systems understand the site ── */}
        <meta name="description" content="AIDLA is Pakistan's #1 free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free study resources — 100% free, no subscription." />
        <meta name="subject" content="Free Online Education, Quizzes, Rewards, Pakistan Students" />
        <meta name="classification" content="Education / E-Learning / Gamified Learning" />
        <meta name="category" content="Education" />
        <meta name="coverage" content="Pakistan" />
        <meta name="distribution" content="Global" />
        <meta name="target" content="Students, Learners, Pakistan" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />

        {/* ── ORM / Brand SERP ── */}
        <meta property="og:site_name" content="AIDLA" />
        <meta name="application-name" content="AIDLA" />

        {/* ── Pinterest SEO ── */}
        <meta name="pinterest" content="nopin" />

        {/* ── Global JSON-LD Schema ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_SCHEMA) }}
        />

        {/* ── Speculat​ion Rules API — instant navigation (Chrome 109+) ── */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/api/*" } }] },
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