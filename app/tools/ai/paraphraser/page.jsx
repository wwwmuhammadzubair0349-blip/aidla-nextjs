// app/tools/ai/paraphraser/page.jsx
import { Suspense } from "react";
import ParaphraserClient from "./ParaphraserClient";

export const metadata = {
  title: "Free AI Paraphraser — Rewrite Text in Any Style | AIDLA",
  description: "Free AI-powered text paraphraser. Rewrite any text in formal, academic, casual, creative or simplified style. Powered by Groq AI. 3 free uses — no sign-up needed.",
  keywords: "AI paraphraser free, rewrite text online, paraphrase tool, text rewriter, rephrase generator, paraphrasing tool Pakistan, essay rewriter",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/ai/paraphraser" },
  openGraph: { title: "Free AI Paraphraser | AIDLA", description: "Rewrite text in formal, academic, casual, creative or simplified style instantly. Free, no sign-up.", type: "website", url: "https://www.aidla.online/tools/ai/paraphraser", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-paraphraser.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Paraphraser" }] },
  twitter: { card: "summary_large_image", title: "Free AI Paraphraser | AIDLA", description: "Rewrite any text in formal, academic, casual, creative or simplified style. Free, no sign-up.", images: ["https://www.aidla.online/og-paraphraser.jpg"] },
};

const ldJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AIDLA AI Paraphraser",
  url: "https://www.aidla.online/tools/ai/paraphraser",
  applicationCategory: "WritingApplication",
  operatingSystem: "Any",
  description: "Free AI paraphrasing tool to rewrite text in formal, academic, casual, creative or simplified style.",
  publisher: { "@type": "Organization", name: "AIDLA", url: "https://www.aidla.online" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
  isAccessibleForFree: true,
});

export default function ParaphraserPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />
      <Suspense fallback={<div style={{ minHeight:"100vh", background:"#f8fafc" }} />}>
        <ParaphraserClient />
      </Suspense>
    </>
  );
}