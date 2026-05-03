// app/resources/page.jsx
import { serverRpc } from "@/lib/supabaseServer";
import ResourcesClient from "./ResourcesClient";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free Study Materials — Notes, Past Papers & Books | AIDLA",
  description:
    "Download free study materials, notes, past papers, thesis, templates and books on AIDLA. Organized by subject, university and class level.",
  keywords:[
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
    locale: "en_PK",
    images:[{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA Study Materials" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Study Materials — AIDLA",
    description: "Download free notes, past papers, thesis and books.",
    images:[`${SITE_URL}/og-home.jpg`],
  },
};

export default async function ResourcesPage({ searchParams }) {
  // Safely handle searchParams
  let q = "";
  let category = "";
  let subject = "";
  let university = "";
  let class_level = "";
  let year = "";
  let page = 1;
  
  if (searchParams) {
    const params = await searchParams;
    q = params?.q || "";
    category = params?.category || "";
    subject = params?.subject || "";
    university = params?.university || "";
    class_level = params?.class || "";
    year = params?.year || "";
    page = parseInt(params?.page) || 1;
  }

  const [{ data: materialsData }, { data: optionsData }] = await Promise.all([
    serverRpc("study_materials_public_list", {
      p_search: q || null,
      p_category: category || null,
      p_subject: subject || null,
      p_class_level: class_level || null,
      p_university: university || null,
      p_year: year || null,
      p_limit: 12,
      p_offset: (page - 1) * 12,
    }),
    serverRpc("study_materials_filter_options"),
  ]);

  const initialMaterials = materialsData || [];
  const initialTotal = materialsData?.[0]?.total_count || 0;
  const initialOptions = optionsData || { subjects: [], universities:[], classes: [], years:[] };

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/resources${category ? `?category=${category}` : ""}`,
    url: `${SITE_URL}/resources`,
    name: `Free Study Materials ${category ? `- ${category.toUpperCase()}` : "— Notes, Past Papers & Books"}`,
    description: "Free study materials including notes, past papers, thesis, templates and books.",
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