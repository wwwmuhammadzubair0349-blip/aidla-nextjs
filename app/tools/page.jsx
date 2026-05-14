// app/tools/page.jsx � Updated tools home (AI + Career tools only)
import { Suspense } from "react";
import ToolsClient from "./ToolsClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildSoftwareSchema } from "@/lib/schemas";

export const metadata = {
  title: "Free AI Tools: Email Writer, CV, Cover Letter & More | AIDLA",
  description: "Use AIDLA's free AI tools for email writing, CV building, cover letters, summarizing, paraphrasing, LinkedIn bios and interview prep. Perfect for freshers.",
  keywords: "free AI tools, AI email writer, AI summarizer, AI paraphraser, LinkedIn bio generator, interview prep, CV maker, cover letter maker, career tools, productivity tools, AIDLA",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools" },
  openGraph: { title: "Free AI Tools: Email Writer, CV, Cover Letter & More | AIDLA", description: "AI Email Writer, CV Maker, Cover Letter, Summarizer, Paraphraser and more. Free for everyone.", type: "website", url: "https://www.aidla.online/tools", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Tools" }] },
  twitter: { card: "summary_large_image", title: "Free AI Tools for Careers & Productivity | AIDLA", images: ["https://www.aidla.online/og-home.jpg"] },
};

const pageSchema = buildGraph(
  buildWebPageSchema({
    path: "/tools",
    name: "Free AI Tools for Writing, Careers, CVs & Productivity | AIDLA",
    description: "Use free AI tools for writing, CVs, cover letters, summaries, paraphrasing, LinkedIn bios, interview prep, freshers and career switchers.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Free Tools", url: "/tools" }],
    "/tools",
  ),
  buildSoftwareSchema(),
  {
    "@type": "ItemList",
    "@id": "https://www.aidla.online/tools#tool-list",
    name: "AIDLA Free AI & Career Tools",
    numberOfItems: 7,
    itemListElement: [
      { "@type": "ListItem", position: 1,  name: "AI Email Writer",     url: "https://www.aidla.online/tools/ai/email-writer"           },
      { "@type": "ListItem", position: 2,  name: "AI Text Summarizer",  url: "https://www.aidla.online/tools/ai/summarizer"             },
      { "@type": "ListItem", position: 3,  name: "AI Paraphraser",      url: "https://www.aidla.online/tools/ai/paraphraser"            },
      { "@type": "ListItem", position: 4,  name: "AI LinkedIn Bio",     url: "https://www.aidla.online/tools/ai/linkedin-bio"           },
      { "@type": "ListItem", position: 5,  name: "AI Interview Prep",   url: "https://www.aidla.online/tools/ai/interview-prep"         },
      { "@type": "ListItem", position: 6,  name: "CV Maker",            url: "https://www.aidla.online/tools/career/cv-maker"           },
      { "@type": "ListItem", position: 7,  name: "Cover Letter Maker",  url: "https://www.aidla.online/tools/career/cover-letter-maker" },
    ],
  },
);

function JsonLd() {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />;
}

export default function ToolsPage() {
  return (
    <>
      <JsonLd />
      <Suspense fallback={<div style={{ minHeight:"100vh", background:"#eef2ff" }} />}>
        <ToolsClient />
      </Suspense>
    </>
  );
}
