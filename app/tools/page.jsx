// app/tools/page.jsx
import { Suspense } from "react";
import ToolsClient from "./ToolsClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildSoftwareSchema } from "@/lib/schemas";

export const metadata = {
  title: "Free AI & Career Tools: Email Writer, CV, CGPA Calculator & More | AIDLA",
  description: "12 free tools for students and professionals — AI Email Writer, CV Maker, Cover Letter, Summarizer, Paraphraser, LinkedIn Bio, Interview Prep, CGPA Calculator and Salary Calculator.",
  keywords: "free AI tools, CGPA calculator, salary calculator, AI email writer, AI summarizer, AI paraphraser, LinkedIn bio generator, interview prep, CV maker, cover letter maker, career tools, AIDLA",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools" },
  openGraph: {
    title: "Free AI & Career Tools for Students & Professionals | AIDLA",
    description: "12 free tools: AI writing, CV builder, CGPA calculator, salary calculator and more. No sign-up needed.",
    type: "website",
    url: "https://www.aidla.online/tools",
    siteName: "AIDLA",
    locale: "en_US",
    images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA Free Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "12 Free AI & Career Tools | AIDLA",
    images: ["https://www.aidla.online/og-home.jpg"],
  },
};

const pageSchema = buildGraph(
  buildWebPageSchema({
    path: "/tools",
    name: "Free AI & Career Tools for Students and Professionals | AIDLA",
    description: "12 free tools: AI email writer, CV maker, cover letter, summarizer, paraphraser, LinkedIn bio, interview prep, CGPA calculator and salary calculator.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Free Tools", url: "/tools" }],
    "/tools",
  ),
  buildSoftwareSchema(),
  {
    "@type": "ItemList",
    "@id": "https://www.aidla.online/tools#tool-list",
    name: "AIDLA Free AI, Career & Calculator Tools",
    numberOfItems: 12,
    itemListElement: [
      { "@type": "ListItem", position: 1,  name: "AI Email Writer",      url: "https://www.aidla.online/tools/ai/email-writer"                },
      { "@type": "ListItem", position: 2,  name: "AI Text Summarizer",   url: "https://www.aidla.online/tools/ai/summarizer"                  },
      { "@type": "ListItem", position: 3,  name: "AI Paraphraser",       url: "https://www.aidla.online/tools/ai/paraphraser"                 },
      { "@type": "ListItem", position: 4,  name: "AI LinkedIn Bio",      url: "https://www.aidla.online/tools/ai/linkedin-bio"                },
      { "@type": "ListItem", position: 5,  name: "AI Interview Prep",    url: "https://www.aidla.online/tools/ai/interview-prep"              },
      { "@type": "ListItem", position: 6,  name: "CV / Resume Maker",    url: "https://www.aidla.online/tools/career/cv-maker"                },
      { "@type": "ListItem", position: 7,  name: "Cover Letter Maker",   url: "https://www.aidla.online/tools/career/cover-letter-maker"      },
      { "@type": "ListItem", position: 8,  name: "CGPA Calculator",      url: "https://www.aidla.online/tools/education/cgpa-calculator"      },
      { "@type": "ListItem", position: 9,  name: "Salary Calculator",    url: "https://www.aidla.online/tools/finance/salary-calculator"      },
      { "@type": "ListItem", position: 10, name: "Image to PDF",         url: "https://www.aidla.online/tools/pdf/image-to-pdf"               },
      { "@type": "ListItem", position: 11, name: "Word to PDF",          url: "https://www.aidla.online/tools/pdf/word-to-pdf"                },
      { "@type": "ListItem", position: 12, name: "JPG to PNG",           url: "https://www.aidla.online/tools/image/jpg-to-png"               },
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
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f8faff" }} />}>
        <ToolsClient />
      </Suspense>
    </>
  );
}
