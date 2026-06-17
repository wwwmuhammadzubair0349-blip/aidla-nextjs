import JpgToPngClient from "./JpgToPngClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "JPG to PNG Converter — Free Online Tool | AIDLA",
  description:
    "Convert JPG, JPEG, WEBP or BMP images to lossless PNG instantly in your browser. No upload, no account, no watermark — 100% free and private.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/image/jpg-to-png` },
  openGraph: {
    title: "JPG to PNG Converter — Free Online Tool | AIDLA",
    description: "Convert JPG images to PNG instantly. Runs in your browser — files never leave your device.",
    type: "website",
    url: `${SITE_URL}/tools/image/jpg-to-png`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "JPG to PNG — AIDLA" }],
  },
};

export default function JpgToPngPage() {
  return <JpgToPngClient />;
}
