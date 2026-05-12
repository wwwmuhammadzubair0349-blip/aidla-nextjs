import CoverLetterClient from "./CoverLetterClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free AI Cover Letter Builder for Jobs & Careers | AIDLA",
  description: "Write ATS-optimized cover letters for freshers, job seekers, professionals and career switchers. AI-powered, role-specific, instantly downloadable and free.",
  alternates: { canonical: `${SITE_URL}/tools/career/cover-letter-maker` },
  openGraph: {
    title: "Free AI Cover Letter Builder for Jobs & Career Switches | AIDLA",
    description: "Write ATS-optimized cover letters for freshers, job seekers, professionals and career switchers. AI-powered, role-specific and free forever.",
    type: "website",
    url: `${SITE_URL}/tools/career/cover-letter-maker`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Free Cover Letter Builder — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Cover Letter Builder for Jobs & Career Switches | AIDLA",
    description: "Write role-specific cover letters for freshers, professionals and career switchers with AI.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = buildGraph(
  buildWebPageSchema({
    path: "/cover-letter",
    name: "Free AI Cover Letter Builder for Jobs & Careers | AIDLA",
    description: "Write ATS-optimized cover letters for freshers, job seekers, professionals and career switchers. AI-powered, role-specific, instantly downloadable and free.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Cover Letter Builder", url: "/cover-letter" }],
    "/cover-letter",
  ),
);

export default function CoverLetterPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <CoverLetterClient />
    </>
  );
}
