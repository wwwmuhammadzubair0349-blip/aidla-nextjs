// app/tools/ai/linkedin-bio/page.jsx
import { Suspense } from "react";
import LinkedInBioClient from "./LinkedInBioClient";

export const metadata = {
  title: "AI LinkedIn Bio Generator — Write a Powerful About Section | AIDLA",
  description: "Free AI LinkedIn bio generator. Create a powerful LinkedIn About section in seconds. Choose your tone, length and style. Powered by AIDLA AI.",
  keywords: "LinkedIn bio generator, AI LinkedIn profile, LinkedIn About section, LinkedIn summary generator, professional bio writer, AIDLA AI LinkedIn",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/ai/linkedin-bio" },
  openGraph: { title: "AI LinkedIn Bio Generator | AIDLA", description: "Generate a powerful LinkedIn About section in seconds with AIDLA AI.", type: "website", url: "https://www.aidla.online/tools/ai/linkedin-bio", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA AI LinkedIn Bio Generator" }] },
  twitter: { card: "summary_large_image", title: "AI LinkedIn Bio Generator | AIDLA", images: ["https://www.aidla.online/og-home.jpg"] },
};

function JsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context":"https://schema.org","@type":"WebApplication",
    name:"AI LinkedIn Bio Generator by AIDLA","url":"https://www.aidla.online/tools/ai/linkedin-bio",
    description:"Free AI LinkedIn bio and About section generator.",
    applicationCategory:"ProductivityApplication","operatingSystem":"Web",
    offers:{"@type":"Offer","price":"0","priceCurrency":"PKR"},
    publisher:{"@type":"Organization","name":"AIDLA","url":"https://www.aidla.online"},
  })}} />;
}

export default function LinkedInBioPage() {
  return (<><JsonLd /><Suspense fallback={<div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)" }} />}><LinkedInBioClient /></Suspense></>);
}