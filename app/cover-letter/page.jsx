import CoverLetterClient from "./CoverLetterClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Free AI Cover Letter Builder — AIDLA",
  description: "Write a powerful, ATS-optimized cover letter in 3 minutes. AI-powered. Tailored to your role. Free forever.",
  alternates: { canonical: `${SITE_URL}/tools/career/cover-letter-maker` },
  openGraph: {
    title: "Free AI Cover Letter Builder — AIDLA",
    description: "Write a powerful, ATS-optimized cover letter in 3 minutes. AI-powered. Tailored to your role. Free forever.",
    type: "website",
    url: `${SITE_URL}/tools/career/cover-letter-maker`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Free Cover Letter Builder — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Cover Letter Builder — AIDLA",
    description: "Write a powerful, ATS-optimized cover letter in 3 minutes. AI-powered. Tailored to your role.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default function CoverLetterPage() {
  return <CoverLetterClient />;
}
