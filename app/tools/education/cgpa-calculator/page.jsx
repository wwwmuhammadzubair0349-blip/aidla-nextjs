// app/tools/education/cgpa-calculator/page.jsx
import CGPAClient from "./CGPAClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildFAQSchema } from "@/lib/schemas";
import Link from "next/link";

const SITE_URL = "https://www.aidla.online";
const CANONICAL = `${SITE_URL}/tools/education/cgpa-calculator`;

export const metadata = {
  title: "Free CGPA Calculator — GPA to Percentage Converter | AIDLA",
  description: "Calculate your CGPA on 4.0 scale instantly. Add courses, credit hours and grades to get your semester CGPA, percentage, and grade standing. Free, no sign-up.",
  keywords: [
    "CGPA calculator", "GPA calculator", "CGPA to percentage", "percentage to CGPA",
    "university CGPA calculator", "4.0 scale calculator", "HEC CGPA", "semester GPA",
    "free CGPA calculator online", "CGPA calculator Pakistan",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Free CGPA Calculator — GPA & Percentage Converter | AIDLA",
    description: "Add your subjects, credit hours, and grades to instantly calculate CGPA on 4.0 scale + percentage equivalent.",
    type: "website", url: CANONICAL, siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "CGPA Calculator — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free CGPA Calculator | AIDLA",
    description: "Calculate semester CGPA on 4.0 scale + percentage. Free, no login.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const FAQS = [
  { question: "How is CGPA calculated?", answer: "CGPA = Total Quality Points ÷ Total Credit Hours. Quality points for each subject = Grade Points × Credit Hours. Add all quality points, divide by total credit hours." },
  { question: "How do I convert CGPA to percentage?", answer: "Multiply your CGPA by 25. For example, 3.5 CGPA × 25 = 87.5%. This is the standard formula used by HEC and most Pakistani universities on a 4.0 scale." },
  { question: "What is the minimum CGPA for HEC scholarships?", answer: "HEC typically requires a minimum CGPA of 3.0 out of 4.0 (75%) for most scholarships and postgraduate programs. Some programs require 3.5 or higher." },
  { question: "What is the difference between GPA and CGPA?", answer: "GPA (Grade Point Average) is calculated for a single semester. CGPA (Cumulative GPA) is the average across all completed semesters, giving a cumulative picture of academic performance." },
];

const jsonLd = buildGraph(
  buildWebPageSchema({
    path: "/tools/education/cgpa-calculator",
    name: "Free CGPA Calculator — GPA to Percentage Converter",
    description: "Calculate semester CGPA on 4.0 scale with credit hours and grades. Includes CGPA to percentage converter and grade reference table.",
  }),
  buildBreadcrumbSchema(
    [
      { name: "Home", url: "/" },
      { name: "Tools", url: "/tools" },
      { name: "Education", url: "/tools" },
      { name: "CGPA Calculator", url: "/tools/education/cgpa-calculator" },
    ],
    "/tools/education/cgpa-calculator",
  ),
  {
    "@type": "SoftwareApplication",
    "@id": `${CANONICAL}#app`,
    name: "CGPA Calculator",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: CANONICAL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online CGPA calculator for university students. Supports 4.0 scale, credit-hour weighting, CGPA-to-percentage conversion.",
    provider: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
  },
  buildFAQSchema(FAQS, "/tools/education/cgpa-calculator"),
);

export default function CGPAPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "2rem 1.25rem 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/tools" style={{ color: "#64748b", textDecoration: "none" }}>Tools</Link>
          {" / "}
          <span>CGPA Calculator</span>
        </nav>
        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
          Free CGPA Calculator
        </h1>
        <p style={{ color: "#475569", fontSize: "1rem", marginBottom: "1.5rem" }}>
          Add your courses, credit hours, and grades to instantly calculate your semester CGPA on a 4.0 scale — plus percentage and grade standing.
        </p>
      </div>

      <CGPAClient />

      {/* FAQ section */}
      <section style={{ maxWidth: "780px", margin: "0 auto", padding: "0 1.25rem 4rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: "2.5rem 0 1.25rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0", borderTop: "1px solid #e2e8f0" }}>
          {FAQS.map((faq, i) => (
            <details key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <summary style={{ padding: "1rem 0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", color: "#0f172a", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {faq.question} <span style={{ color: "#6366f1" }}>+</span>
              </summary>
              <p style={{ padding: "0 0.5rem 1rem", color: "#475569", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
