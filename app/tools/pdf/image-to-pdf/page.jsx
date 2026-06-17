import ImageToPdfClient from "./ImageToPdfClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Image to PDF Converter — Free Online Tool | AIDLA",
  description:
    "Convert JPG, PNG, WEBP or GIF images to a single PDF document in your browser. Multi-image, reorderable pages, A4/Letter/A3 sizes. No upload, no watermark.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/pdf/image-to-pdf` },
  openGraph: {
    title: "Image to PDF Converter — Free Online Tool | AIDLA",
    description: "Convert multiple images to PDF instantly. Runs in your browser — files never leave your device.",
    type: "website",
    url: `${SITE_URL}/tools/pdf/image-to-pdf`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Image to PDF — AIDLA" }],
  },
};

export default function ImageToPdfPage() {
  return <ImageToPdfClient />;
}
