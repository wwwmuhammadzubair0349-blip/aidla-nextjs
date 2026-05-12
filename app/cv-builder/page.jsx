import CvBuilderClient from "./CvBuilderClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free AI CV Builder for Freshers & Professionals | AIDLA",
  description:
    "Build an ATS-ready CV for freshers, job seekers, professionals and career switchers. AI writing, 17 templates, instant PDF download. Free forever.",
  alternates: { canonical: `${SITE_URL}/tools/career/cv-maker` },
  openGraph: {
    title: "Free AI CV Builder for Freshers & Professionals | AIDLA",
    description:
      "AI CV builder for freshers, professionals and career switchers. 17 templates. Download instantly.",
    type: "website",
    url: `${SITE_URL}/tools/career/cv-maker`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Free CV Builder — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI CV Builder for Freshers & Professionals | AIDLA",
    description: "AI CV builder for freshers, professionals and career switchers. 17 templates. Download instantly.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default function CvBuilderPage() {
  return <CvBuilderClient />;
}
