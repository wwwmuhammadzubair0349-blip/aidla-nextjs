// app/tools/page.jsx — Updated tools home (AI + Career tools only)
import { Suspense } from "react";
import ToolsClient from "./ToolsClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildSoftwareSchema } from "@/lib/schemas";

export const metadata = {
  title: "Free AI powered Career Tools Email Writer, CV Maker, Cover Letter & More",
  description: "Access free AI powered career tools Email Writer, Summarizer, Paraphraser, LinkedIn Bio Generator, Interview Prep, CV Maker and Cover Letter Maker.",
  keywords: "AI email writer, AI summarizer, AI paraphraser, LinkedIn bio generator, interview prep, CV maker, cover letter maker, free AI tools, AIDLA",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools" },
  openGraph: { title: "Free AI Powered Career Tools | AIDLA", description: "AI Email Writer, CV Maker, Cover Letter, Summarizer and more. All free.", type: "website", url: "https://www.aidla.online/tools", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Powered Career Tools" }] },
  twitter: { card: "summary_large_image", title: "Free AI & Career Tools | AIDLA", images: ["https://www.aidla.online/og-home.jpg"] },
};

const pageSchema = buildGraph(
  buildWebPageSchema({
    path: "/tools",
    name: "Free AI powered Career Tools Email Writer, CV Maker, Cover Letter & More | AIDLA",
    description: "Access free AI powered career tools Email Writer, Summarizer, Paraphraser, LinkedIn Bio Generator, Interview Prep, CV Maker and Cover Letter Maker.",
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
    numberOfItems: 10,
    itemListElement: [
      { "@type": "ListItem", position: 1,  name: "AI Email Writer",     url: "https://www.aidla.online/tools/ai/email-writer"           },
      { "@type": "ListItem", position: 2,  name: "AI Text Summarizer",  url: "https://www.aidla.online/tools/ai/summarizer"             },
      { "@type": "ListItem", position: 3,  name: "AI Paraphraser",      url: "https://www.aidla.online/tools/ai/paraphraser"            },
      { "@type": "ListItem", position: 4,  name: "AI LinkedIn Bio",     url: "https://www.aidla.online/tools/ai/linkedin-bio"           },
      { "@type": "ListItem", position: 5,  name: "AI Interview Prep",   url: "https://www.aidla.online/tools/ai/interview-prep"         },
      { "@type": "ListItem", position: 6,  name: "CV Maker",            url: "https://www.aidla.online/tools/career/cv-maker"           },
      { "@type": "ListItem", position: 7,  name: "Cover Letter Maker",  url: "https://www.aidla.online/tools/career/cover-letter-maker" },
      { "@type": "ListItem", position: 8,  name: "Image to PDF",        url: "https://www.aidla.online/tools/pdf/image-to-pdf"          },
      { "@type": "ListItem", position: 9,  name: "Word to PDF",         url: "https://www.aidla.online/tools/pdf/word-to-pdf"           },
      { "@type": "ListItem", position: 10, name: "JPG to PNG",          url: "https://www.aidla.online/tools/image/jpg-to-png"          },
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