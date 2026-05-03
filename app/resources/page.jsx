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
  // 1. Await searchParams for Next.js 15 compatibility & read values
  const params = await searchParams;
  const q = params?.q || "";
  const category = params?.category || "";
  const subject = params?.subject || "";
  const university = params?.university || "";
  const class_level = params?.class || "";
  const year = params?.year || "";
  const page = parseInt(params?.page) || 1;

  // 2. Fetch Data ON THE SERVER for 100% AI Readability
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

  // 3. Dynamic Schema for SEO/Bots based on current category
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ResourcesClient 
        initialMaterials={initialMaterials} 
        initialTotal={initialTotal} 
        initialOptions={initialOptions}
      />
    </>
  );
}