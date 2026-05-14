// app/projects/page.jsx
import { createClient } from "@supabase/supabase-js";
import ProjectsClient from "./ProjectsClient";
import {
  buildBreadcrumbSchema,
  buildEducationalOrgSchema,
  buildGraph,
  buildHowToSchema,
  buildItemListSchema,
  buildWebPageSchema,
} from "@/lib/schemas";

export const revalidate = 60;

const SITE_URL = "https://www.aidla.online";
const DESCRIPTION = "Browse free FYP, mini project, semester project, research, and AI-powered project recommendations on AIDLA. Filter by domain, difficulty, tech stack, subject, and university.";
const LAST_MODIFIED = "2026-05-12";

export const metadata = {
  title: "Project Ideas, FYP Topics & AI Recommendations | AIDLA",
  description: DESCRIPTION,
  keywords: ["project ideas", "FYP ideas", "mini projects", "AI project generator", "semester projects", "research project ideas", "AIDLA projects"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    title: "Project Ideas, FYP Topics & AI Recommendations | AIDLA",
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/projects`,
    siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA project ideas and AI recommendations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Ideas, FYP Topics & AI Recommendations | AIDLA",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function ProjectsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const search = params.q || "";
  const domain = params.domain || "";
  const type = params.type || "";
  const difficulty = params.difficulty || "";
  const subject = params.subject || "";
  const course = params.course || "";
  const educational_level = params.level || "";
  const university = params.university || "";
  const tech_stack = params.tech || "";
  const page = parseInt(params.page) || 1;

  const [{ data: ideas }, { data: options }] = await Promise.all([
    supabase.rpc("project_ideas_public_list", {
      p_search: search || null,
      p_domain: domain || null,
      p_type: type || null,
      p_difficulty: difficulty || null,
      p_subject: subject || null,
      p_course: course || null,
      p_educational_level: educational_level || null,
      p_university: university || null,
      p_tech_stack: tech_stack || null,
      p_limit: 12,
      p_offset: (page - 1) * 12,
    }),
    supabase.rpc("project_ideas_filter_options"),
  ]);

  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: "/projects",
      name: "Project Ideas, FYP Topics & AI Recommendations | AIDLA",
      description: DESCRIPTION,
      dateModified: LAST_MODIFIED,
      speakableSelectors: ["#projects-heading", "#projects-description"],
    }),
    buildBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Projects", url: "/projects" }], "/projects"),
    buildEducationalOrgSchema(),
    buildHowToSchema([
      { title: "Search project ideas", text: "Use AIDLA Projects to search free FYP, mini project, semester, and research ideas." },
      { title: "Filter by requirements", text: "Filter ideas by domain, difficulty, tech stack, subject, university, and education level." },
      { title: "Generate custom recommendations", text: "Use the AIDLA AI Project Idea Generator to get tailored project recommendations." },
    ], "/projects"),
    buildItemListSchema({
      id: "project-ideas-list",
      name: "AIDLA Project Ideas",
      items: (ideas || []).slice(0, 12).map((idea) => ({ name: idea.title, url: `/projects/${idea.slug}` })),
    })
  );

  const safeIdeas = ideas || [];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        <h1>Project Ideas, FYP Topics &amp; AI Recommendations — AIDLA</h1>
        <p>Browse free FYP, mini project, semester project, research, and AI-powered project recommendations on AIDLA. Filter by domain, difficulty, tech stack, subject, and university.</p>
        <ul>
          {safeIdeas.map(idea => (
            <li key={idea.id || idea.slug}>
              <a href={`/projects/${idea.slug}`}>{idea.title}</a>
              {idea.description && <p>{idea.description}</p>}
            </li>
          ))}
        </ul>
      </div>
      <ProjectsClient
        initialIdeas={safeIdeas}
        initialTotal={safeIdeas?.[0]?.total_count || 0}
        initialOptions={options || { subjects: [], courses: [], educational_levels: [], universities: [], tech_stacks: [] }}
      />
    </>
  );
}
