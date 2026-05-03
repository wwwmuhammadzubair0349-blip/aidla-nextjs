// app/tools/ai/email-writer/page.jsx
import { Suspense } from "react";
import EmailWriterClient from "./EmailWriterClient";

export const metadata = {
  title: "AI Email Writer — Write Professional Emails Instantly | AIDLA",
  description: "AI email writer that crafts professional, business, personal and academic emails in seconds. 24 email types, 6 tones, 11 languages. Open directly in Gmail, Outlook or Mail app — free.",
  keywords: "AI email writer, professional email generator, email writing tool, job application email, business email AI, Gmail draft, Outlook email writer, free email tool, AIDLA",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/ai/email-writer" },
  openGraph: {
    title: "AI Email Writer — Write Professional Emails Instantly | AIDLA",
    description: "AI writes professional emails in seconds. 24 types, 6 tones, 11 languages. Opens directly in Gmail or Outlook. Free.",
    type: "website",
    url: "https://www.aidla.online/tools/ai/email-writer",
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: "https://www.aidla.online/og-email-writer.jpg", width: 1200, height: 630, alt: "AIDLA AI Email Writer" }],
  },
  twitter: { card: "summary_large_image", title: "AI Email Writer — AIDLA", description: "AI writes professional emails in seconds. Opens directly in Gmail, Outlook or Mail app.", images: ["https://www.aidla.online/og-email-writer.jpg"] },
};

function JsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "WebApplication",
      name: "AI Email Writer by AIDLA", url: "https://www.aidla.online/tools/ai/email-writer",
      description: "AI-powered email writer. Generate professional, business, personal and academic emails instantly.",
      applicationCategory: "ProductivityApplication", operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
      publisher: { "@type": "Organization", name: "AIDLA", url: "https://www.aidla.online" },
    })}} />
  );
}

export default function EmailWriterPage() {
  return (
    <>
      <JsonLd />
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%)" }} />}>
        <EmailWriterClient />
      </Suspense>

      {/* Static example output — visible to bots, hidden from users via CSS overlap */}
      <section
        aria-label="Email example"
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", fontFamily: "'DM Sans',sans-serif" }}
      >
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0b1437", marginBottom: 8 }}>Example — Job Application Email</h2>
        <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 20 }}>
          AIDLA's AI Email Writer generates complete, professional emails like this in seconds:
        </p>
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", border: "1px solid #e2e8f0", lineHeight: 1.7, fontSize: "0.9rem", color: "#334155" }}>
          <p><strong>Subject:</strong> Application for Software Engineer Position — Muhammad Ali</p>
          <br />
          <p>Dear Hiring Manager,</p>
          <br />
          <p>I am writing to express my strong interest in the Software Engineer position advertised on your company website. With a Bachelor's degree in Computer Science from FAST-NUCES and 3 years of hands-on experience in React, Node.js, and cloud infrastructure, I am confident I can contribute meaningfully to your team.</p>
          <br />
          <p>In my current role at TechCorp Lahore, I led the migration of a monolithic application to microservices architecture, reducing deployment time by 40% and improving system reliability. I thrive in collaborative, fast-paced environments and am passionate about writing clean, maintainable code.</p>
          <br />
          <p>I would welcome the opportunity to discuss how my background aligns with your team's goals. Please find my CV attached for your review.</p>
          <br />
          <p>Thank you for your time and consideration.</p>
          <br />
          <p>Warm regards,<br />Muhammad Ali<br />muhammad.ali@email.com | +92 300 1234567</p>
        </div>
        <p style={{ marginTop: 16, fontSize: "0.8rem", color: "#94a3b8" }}>
          24 email types · 6 tones · 11 languages · Opens directly in Gmail &amp; Outlook · 100% free
        </p>
      </section>
    </>
  );
}