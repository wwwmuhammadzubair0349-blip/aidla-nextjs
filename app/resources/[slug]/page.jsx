// app/resources/[slug]/page.jsx

import { serverFetch } from "@/lib/supabaseServer";
import ResourceDetailClient from "./ResourceDetailClient";

const SITE_URL = "https://www.aidla.online";

async function getMaterial(slug) {
  const { data } = await serverFetch("study_materials", {
    select: "id,title,slug,description,file_type,subject,class_level,university,created_at",
    "slug": `eq.${slug}`,
    "status": "eq.published",
  });
  return data?.[0] || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m    = await getMaterial(slug);
  const title = m ? `${m.title} — Free Download | AIDLA` : "Study Material | AIDLA";
  const desc  = m?.description
    || (m ? `Download ${m.title} free on AIDLA — study materials for Pakistani students.` : "Free study material on AIDLA.");
  const url   = `${SITE_URL}/resources/${slug}`;
  const img   = { url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: title };

  return {
    title,
    description: desc,
    robots: { index: true, follow: true, "max-image-preview": "large" },
    alternates: { canonical: url },
    openGraph: { title, description: desc, type: "article", url, siteName: "AIDLA", locale: "en_US", images: [img] },
    twitter:    { card: "summary_large_image", title, description: desc, images: [`${SITE_URL}/og-home.jpg`] },
  };
}

export default async function ResourceDetailPage({ params }) {
  const { slug } = await params;
  const m = await getMaterial(slug);

  const schema = m ? {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${SITE_URL}/resources/${slug}`,
    name: m.title,
    description: m.description || `Free ${m.file_type || "study material"} on AIDLA.`,
    url: `${SITE_URL}/resources/${slug}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
    educationalLevel: m.class_level || undefined,
    about: m.subject ? { "@type": "Thing", name: m.subject } : undefined,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",      item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
        { "@type": "ListItem", position: 3, name: m.title,     item: `${SITE_URL}/resources/${slug}` },
      ],
    },
  } : null;

  return (
    <>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <ResourceDetailClient slug={slug} />
    </>
  );
}