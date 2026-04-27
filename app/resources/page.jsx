import { Suspense } from "react";
import ResourcesClient from "./ResourcesClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free Study Materials — Notes, Past Papers & Books | AIDLA",
  description:
    "Download free study materials, notes, past papers, thesis, templates and books on AIDLA. Organized by subject, university and class level.",
  keywords: [
    "study materials Pakistan", "free notes", "past papers", "thesis", "templates",
    "free books", "AIDLA resources", "Pakistan education resources",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: `${SITE_URL}/resources` },
  openGraph: {
    title: "Free Study Materials — Notes, Past Papers & Books | AIDLA",
    description: "Download free notes, past papers, thesis and books organized by subject and class.",
    type: "website",
    url: `${SITE_URL}/resources`,
    siteName: "AIDLA",
    locale: "en_US",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Study Materials" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study Materials — AIDLA",
    description: "Download free notes, past papers, thesis and books.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/resources`,
  url: `${SITE_URL}/resources`,
  name: "Free Study Materials — Notes, Past Papers & Books",
  description: "Free study materials including notes, past papers, thesis, templates and books organized by subject and class level.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
  about: { "@type": "Thing", name: "Educational Resources" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
    ],
  },
};

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Suspense fallback={null}>
        <ResourcesClient />
      </Suspense>
    </>
  );
}