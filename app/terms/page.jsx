import TermsClient from "./TermsClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "AIDLA Terms & Conditions – Read Our User Agreement",
  description: "Read AIDLA's Terms and Conditions. Understand user responsibilities, rewards policy, prohibited activities, withdrawals and your legal agreement with AIDLA.",
  keywords: ["AIDLA terms", "terms and conditions", "user agreement", "legal", "educational platform", "Pakistan"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "AIDLA Terms & Conditions",
    description: "Understand the rules and guidelines for using AIDLA's learning and rewards platform.",
    type: "website",
    url: `${SITE_URL}/terms`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Terms and Conditions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDLA Terms & Conditions",
    description: "Read our user agreement before using AIDLA.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms`,
  url: `${SITE_URL}/terms`,
  name: "Terms & Conditions — AIDLA",
  description: "AIDLA's Terms and Conditions: user responsibilities, rewards policy, and legal agreement.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Terms & Conditions",  item: `${SITE_URL}/terms` },
    ],
  },
};

export default function Terms() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TermsClient />
    </>
  );
}