import WordToPdfClient from "./WordToPdfClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Word to PDF Converter — Free Online Tool | AIDLA",
  description:
    "Convert .docx Word documents to PDF with preserved formatting — headings, tables, lists, and images. Runs entirely in your browser. Free, private, no account needed.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/pdf/word-to-pdf` },
  openGraph: {
    title: "Word to PDF Converter — Free Online Tool | AIDLA",
    description: "Convert Word .docx to PDF instantly. Runs in your browser — files never leave your device.",
    type: "website",
    url: `${SITE_URL}/tools/pdf/word-to-pdf`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Word to PDF — AIDLA" }],
  },
};

export default function WordToPdfPage() {
  return <WordToPdfClient />;
}
