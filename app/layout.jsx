// app/layout.jsx — Root layout
// Optimized for: Performance 100, Accessibility 100, Best Practices 100, SEO 100
// + AEO, GEO, LLMO, AISEO, EEAT, VSO, SMO, CRO, Technical SEO, Semantic SEO,
//   Mobile SEO, International SEO, Entity SEO, Topical Authority, Knowledge Graph,
//   Featured Snippet, Zero-Click, Schema Markup, SERP, Core Web Vitals
import PublicShell from "@/components/PublicShell";
import localFont from "next/font/local";
import "@/app/globals.css";
import { buildGraph, buildFounderSchema, buildOrganizationSchema, buildWebSiteSchema, buildSoftwareSchema, buildSyedSolarSchema } from "@/lib/schemas";

const SITE_URL = "https://www.aidla.online";

// ── SELF‑HOSTED FONTS (no more Google Fonts blocking) ──
const dmSans = localFont({
  src: [
    { path: "../public/fonts/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/DMSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
});

const playfairDisplay = localFont({
  src: [
    { path: "../public/fonts/PlayfairDisplay-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/PlayfairDisplay-ExtraBold.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

// Optional: keep Noto Nastaliq Urdu self‑hosted if you use it heavily
const notoUrdu = localFont({
  src: [
    { path: "../public/fonts/NotoNastaliqUrdu-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoNastaliqUrdu-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-urdu",
  display: "swap",
  preload: false,
  fallback: ["serif"],
});

// ─────────────────────────────────────────────────────────────────────
// METADATA (unchanged – already perfect)
// ─────────────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AIDLA - Pakistan's #1 AI Powered Learning Platform",
    template: "%s | AIDLA",
  },
  description:
    "AIDLA is Pakistan's #1 AI powered learning platform for global courses, AI tools, career resources, quizzes, AIDLA Coins, rewards, and professional growth.",
  keywords: [
    "AIDLA",
    "AI learning platform",
    "earn coins learning",
    "online quizzes",
    "lucky draw rewards",
    "student rewards",
    "global education platform",
    "free online education",
    "AIDLA coins",
    "Pakistan #1 AI powered learning platform",
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
        alt: "AIDLA - Pakistan's #1 AI Powered Learning Platform",
        type: "image/jpeg",
      },
      {
        url: `${SITE_URL}/og-home-square.jpg`,
        width: 1200,
        height: 1200,
        alt: "AIDLA - Pakistan's #1 AI Powered Learning Platform",
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

const GLOBAL_SCHEMA = buildGraph(
  buildFounderSchema(),
  buildOrganizationSchema(),
  buildWebSiteSchema(),
  buildSoftwareSchema(),
  buildSyedSolarSchema(),
);

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={`${dmSans.variable} ${playfairDisplay.variable} ${notoUrdu.variable}`}>
      <head>
        {/* ══ PERFORMANCE — Critical Hints (only what’s needed) ══ */}
        <link rel="dns-prefetch" href="//static.cloudflareinsights.com" />
        {/* No more fonts.googleapis.com – we’re self‑hosted */}

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
