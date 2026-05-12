// app/resources/page.jsx
import { serverRpc } from "@/lib/supabaseServer";
import ResourcesClient from "./ResourcesClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free Study & Career Resources, Notes, PDFs, Books | AIDLA",
  description:
    "Access free study materials, career resources, notes, PDFs, books, thesis, templates and professional learning resources organized by subject and level.",
  keywords:[
    "free study materials", "career resources", "free notes", "PDF resources", "thesis", "templates",
    "free books", "AIDLA resources", "professional learning resources", "global education resources",
  ],
  robots: { index: true, follow: true, "max-image-preview": "large" },
  alternates: { canonical: `${SITE_URL}/resources` },
  openGraph: {
    title: "Free Study & Career Resources – AIDLA",
    description: "Download free notes, PDFs, thesis, books, templates and career resources organized by subject and level.",
    type: "website",
    url: `${SITE_URL}/resources`,
    siteName: "AIDLA",
    locale: "en_PK",
    images:[{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Study Materials" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study & Career Resources – AIDLA",
    description: "Download free notes, PDFs, thesis, books, templates and career resources.",
    images:[`${SITE_URL}/og-home.jpg`],
  },
};

export default async function ResourcesPage() {
  const [{ data: materialsData }, { data: optionsData }] = await Promise.all([
    serverRpc("study_materials_public_list", {
      p_search:      null,
      p_category:    null,
      p_subject:     null,
      p_class_level: null,
      p_university:  null,
      p_year:        null,
      p_limit:       12,
      p_offset:      0,
    }),
    serverRpc("study_materials_filter_options"),
  ]);

  const initialMaterials = materialsData || [];
  const initialTotal     = materialsData?.[0]?.total_count || 0;
  const initialOptions   = optionsData || { subjects: [], universities: [], classes: [], years: [] };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/resources`,
    url: `${SITE_URL}/resources`,
    name: "Free Study Materials – Notes, Past Papers & Books",
    description: "Free study and career materials including notes, PDFs, thesis, templates, books, and professional learning resources.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ResourcesClient
        initialMaterials={initialMaterials}
        initialTotal={initialTotal}
        initialOptions={initialOptions}
      />
    </>
  );
}
