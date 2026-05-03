import CvBuilderClient from "./CvBuilderClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free Professional CV Builder — AIDLA",
  description:
    "Build a stunning, ATS-ready CV in 5 minutes. 17 premium templates, AI writing assistant, instant PDF download. Used by 50,000+ professionals. Free forever.",
  alternates: { canonical: `${SITE_URL}/tools/career/cv-maker` },
  openGraph: {
    title: "Free Professional CV Builder — AIDLA",
    description:
      "Step-by-step CV builder. AI-powered. 17 premium templates. Download instantly.",
    type: "website",
    url: `${SITE_URL}/tools/career/cv-maker`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Free CV Builder — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Professional CV Builder — AIDLA",
    description: "Step-by-step CV builder. AI-powered. 17 premium templates. Download instantly.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default function CvBuilderPage() {
  return <CvBuilderClient />;
}
