// app/tools/ai/summarizer/page.jsx
import { Suspense } from "react";
import SummarizerClient from "./SummarizerClient";

export const metadata = {
  title: "Free AI Text Summarizer — Summarize Any Article Instantly | AIDLA",
  description: "Free AI-powered text summarizer. Paste any article, essay or document and get a concise summary in seconds. Short, medium, long or bullet points. 3 free uses — no login needed.",
  keywords: "AI summarizer free, text summarizer online, article summarizer, summarize text AI, automatic summarization, essay summarizer Pakistan",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/ai/summarizer" },
  openGraph: { title: "Free AI Text Summarizer | AIDLA", description: "Summarize any text in seconds. Paste any article, essay or document and get a concise summary — free.", type: "website", url: "https://www.aidla.online/tools/ai/summarizer", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-summarizer.jpg", width: 1200, height: 630, alt: "AIDLA Free AI Text Summarizer" }] },
  twitter: { card: "summary_large_image", title: "Free AI Text Summarizer | AIDLA", description: "Summarize any article, essay or document in seconds. Free, no login.", images: ["https://www.aidla.online/og-summarizer.jpg"] },
};

function JsonLd() {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "AIDLA AI Text Summarizer", url: "https://www.aidla.online/tools/ai/summarizer",
    applicationCategory: "WritingApplication", operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
    publisher: { "@type": "Organization", name: "AIDLA", url: "https://www.aidla.online" },
    isAccessibleForFree: true,
  })}} />;
}

export default function SummarizerPage() {
  return (<><JsonLd /><Suspense fallback={<div style={{ minHeight:"100vh", background:"#f8fafc" }} />}><SummarizerClient /></Suspense></>);
}