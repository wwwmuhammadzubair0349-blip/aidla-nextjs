import ProjectIdeaGenerator from "@/components/ProjectIdeaGenerator";
import { buildBreadcrumbSchema, buildGraph, buildHowToSchema, buildWebPageSchema } from "@/lib/schemas";

const DESCRIPTION = "Generate AI-powered project ideas for FYP, mini projects, semester projects, and research with features, tech stack, milestones, and challenges.";

export const metadata = {
  title: "AI Project Idea Generator | AIDLA",
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/projects/generate" },
};

export default function GenerateIdeaPage() {
  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: "/projects/generate",
      name: "AI Project Idea Generator | AIDLA",
      description: DESCRIPTION,
      dateModified: "2026-05-12",
      speakableSelectors: ["#project-generator-heading"],
    }),
    buildBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Projects", url: "/projects" }, { name: "Generate", url: "/projects/generate" }], "/projects/generate"),
    buildHowToSchema([
      { title: "Choose project requirements", text: "Select domain, project type, difficulty, team size, duration, and preferred tech stack." },
      { title: "Generate ideas", text: "AIDLA creates three AI-powered project recommendations." },
      { title: "Use or submit your idea", text: "Copy the generated idea or submit it to the AIDLA projects community." },
    ], "/projects/generate")
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProjectIdeaGenerator />
    </>
  );
}
