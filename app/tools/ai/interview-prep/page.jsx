// app/tools/ai/interview-prep/page.jsx
import { Suspense } from "react";
import InterviewPrepClient from "./InterviewPrepClient";

export const metadata = {
  title: "AI Interview Prep — Practice Questions & Model Answers | AIDLA",
  description: "Free AI interview preparation tool. Get likely interview questions and model answers for any job role — technical, behavioral, HR and situational. Powered by AIDLA AI.",
  keywords: "AI interview prep, interview questions generator, job interview practice, technical interview questions, behavioral interview questions, AIDLA AI interview",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/ai/interview-prep" },
  openGraph: { title: "AI Interview Prep | AIDLA", description: "Get AI-generated interview questions and model answers for any job role.", type: "website", url: "https://www.aidla.online/tools/ai/interview-prep", siteName: "AIDLA", locale: "en_PK", images: [{ url: "https://www.aidla.online/og-home.jpg", width: 1200, height: 630, alt: "AIDLA AI Interview Prep" }] },
  twitter: { card: "summary_large_image", title: "AI Interview Prep | AIDLA", images: ["https://www.aidla.online/og-home.jpg"] },
};

function JsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context":"https://schema.org","@type":"WebApplication",
    name:"AI Interview Prep by AIDLA","url":"https://www.aidla.online/tools/ai/interview-prep",
    description:"Free AI interview preparation — questions and model answers for any job.",
    applicationCategory:"ProductivityApplication","operatingSystem":"Web",
    offers:{"@type":"Offer","price":"0","priceCurrency":"PKR"},
    publisher:{"@type":"Organization","name":"AIDLA","url":"https://www.aidla.online"},
  })}} />;
}

export default function InterviewPrepPage() {
  return (<><JsonLd /><Suspense fallback={<div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)" }} />}><InterviewPrepClient /></Suspense></>);
}