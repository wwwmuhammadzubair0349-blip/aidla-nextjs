import PrivacyPolicyClient from "./PrivacyPolicyClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Privacy Policy | AIDLA – Your Data, Our Commitment",
  description: "AIDLA's Privacy Policy explains how we collect, use, and protect your personal information. Learn about your rights and our data practices.",
  keywords: ["AIDLA privacy policy", "data protection", "user rights", "cookies", "information collection", "Pakistan edtech"],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: "AIDLA Privacy Policy",
    description: "Read how AIDLA safeguards your data and respects your privacy.",
    type: "website",
    url: `${SITE_URL}/privacy-policy`,
    siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIDLA Privacy Policy",
    description: "Your privacy matters to us. Read our full policy.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy-policy`,
  url: `${SITE_URL}/privacy-policy`,
  name: "Privacy Policy — AIDLA",
  description: "AIDLA's Privacy Policy: how we collect, use, and protect your personal data.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Privacy Policy", item: `${SITE_URL}/privacy-policy` },
    ],
  },
};

export default function PrivacyPolicy() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PrivacyPolicyClient />
    </>
  );
}