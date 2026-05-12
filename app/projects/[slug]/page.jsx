// app/projects/[slug]/page.jsx
import { createClient } from "@supabase/supabase-js";
import ProjectDetailClient from "./ProjectDetailClient";

export const revalidate = 3600;

const SITE_URL = "https://www.aidla.online";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function generateStaticParams() {
  const { data } = await supabase
    .from("project_ideas")
    .select("slug")
    .eq("status", "published")
    .eq("approval_status", "approved")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data || []).map(m => ({ slug: m.slug }));
}

async function getIdea(slug) {
  const { data } = await supabase
    .from("project_ideas")
    .select("id,title,slug,description,domain,type,difficulty,tech_stack,subject,educational_level,created_at")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();
  return data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const idea = await getIdea(slug);
  const title = idea ? `${idea.title} | AIDLA Projects` : "Project Idea | AIDLA";
  const desc  = idea?.description || `Explore this project idea on AIDLA — free FYP and mini project ideas.`;
  return {
    title,
    description: desc,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/projects/${slug}` },
    openGraph: { title, description: desc, type: "article", url: `${SITE_URL}/projects/${slug}`, siteName: "AIDLA" },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const idea = await getIdea(slug);

  const schema = idea ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/projects/${slug}`,
    name: idea.title,
    description: idea.description || `Project idea on AIDLA`,
    url: `${SITE_URL}/projects/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home",     item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
        { "@type": "ListItem", position: 3, name: idea.title, item: `${SITE_URL}/projects/${slug}` },
      ],
    },
  } : null;

  return (
    <>
      {schema && <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      <ProjectDetailClient slug={slug} />
    </>
  );
}