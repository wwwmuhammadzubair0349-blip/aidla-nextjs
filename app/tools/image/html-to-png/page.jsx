import HtmlToPngClient from "./HtmlToPngClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "HTML to PNG / JPG Converter — Free Online Tool | AIDLA",
  description:
    "Convert HTML to PNG or JPG images instantly. Preset sizes for Facebook, Instagram, LinkedIn, Twitter/X. Runs in your browser — no upload, no account, 100% free.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/image/html-to-png` },
  openGraph: {
    title: "HTML to PNG / JPG Converter — Free Online Tool | AIDLA",
    description: "Paste HTML, pick a social media size, download a pixel-perfect image. Free, private, no login.",
    type: "website",
    url: `${SITE_URL}/tools/image/html-to-png`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "HTML to PNG — AIDLA" }],
  },
};

export default function HtmlToPngPage() {
  return <HtmlToPngClient />;
}
