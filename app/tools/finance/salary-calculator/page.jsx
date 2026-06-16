// app/tools/finance/salary-calculator/page.jsx
import SalaryClient from "./SalaryClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema, buildFAQSchema } from "@/lib/schemas";
import Link from "next/link";

const SITE_URL  = "https://www.aidla.online";
const CANONICAL = `${SITE_URL}/tools/finance/salary-calculator`;

export const metadata = {
  title: "Free Salary Calculator 2025 — Pakistan, UAE, US, UK, India | AIDLA",
  description: "Calculate your monthly take-home salary after income tax for Pakistan (FBR 2024-25), UAE (tax-free), US, UK, and India. Free, no sign-up required.",
  keywords: [
    "salary calculator Pakistan", "salary calculator UAE", "income tax calculator Pakistan",
    "FBR tax calculator 2024", "net salary calculator", "take home pay calculator",
    "salary after tax", "salary calculator 2025", "Pakistan income tax slabs",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Free Salary Calculator 2025 — Pakistan, UAE, US, UK & India | AIDLA",
    description: "Enter your gross salary and see monthly take-home, tax deduction, and effective tax rate for 5 countries instantly.",
    type: "website", url: CANONICAL, siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Salary Calculator — AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Salary Calculator 2025 | AIDLA",
    description: "Calculate take-home salary after tax — Pakistan, UAE, US, UK, India. Free & instant.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const FAQS = [
  { question: "What are Pakistan's income tax slabs for 2024-25?", answer: "FBR 2024-25: Up to Rs. 600,000 — 0%. Rs. 600,001–1,200,000 — 5% on excess. Rs. 1,200,001–2,400,000 — Rs. 30,000 + 15%. Rs. 2,400,001–3,600,000 — Rs. 2,10,000 + 25%. Rs. 3,600,001–6,000,000 — Rs. 5,10,000 + 30%. Above Rs. 6,000,000 — Rs. 12,30,000 + 35%." },
  { question: "Does UAE have income tax?", answer: "No, UAE has no personal income tax. Employees keep 100% of their salary. However, UAE introduced a 9% corporate tax in 2023 for businesses." },
  { question: "How is take-home salary calculated in Pakistan?", answer: "Monthly take-home = Gross Monthly Salary − (Annual Tax ÷ 12). Tax is calculated on annual income using FBR slabs. Employers also deduct EOBI (Rs. 370/month) and, if applicable, PESSI/SESSI contributions." },
  { question: "What is the minimum salary in Pakistan?", answer: "The federal minimum wage in Pakistan was set at Rs. 37,000 per month in 2024. Some provinces have set higher minimums." },
];

const jsonLd = buildGraph(
  buildWebPageSchema({
    path: "/tools/finance/salary-calculator",
    name: "Free Salary Calculator 2025 — Pakistan, UAE, US, UK, India",
    description: "Calculate monthly take-home salary after income tax for Pakistan (FBR 2024-25), UAE, US, UK, and India.",
  }),
  buildBreadcrumbSchema(
    [
      { name: "Home",   url: "/" },
      { name: "Tools",  url: "/tools" },
      { name: "Finance",url: "/tools" },
      { name: "Salary Calculator", url: "/tools/finance/salary-calculator" },
    ],
    "/tools/finance/salary-calculator",
  ),
  {
    "@type": "SoftwareApplication",
    "@id": `${CANONICAL}#app`,
    name: "Salary & Tax Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: CANONICAL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free online salary calculator with income tax estimates for Pakistan, UAE, US, UK, and India. Supports FBR 2024-25 tax slabs.",
    provider: { "@type": "Organization", "@id": `${SITE_URL}/#organization` },
  },
  buildFAQSchema(FAQS, "/tools/finance/salary-calculator"),
);

export default function SalaryPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1.25rem 0" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          {" / "}
          <Link href="/tools" style={{ color: "#64748b", textDecoration: "none" }}>Tools</Link>
          {" / "}
          <span>Salary Calculator</span>
        </nav>
        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
          Free Salary Calculator 2025
        </h1>
        <p style={{ color: "#475569", fontSize: "1rem", marginBottom: "1.5rem" }}>
          Select a country, enter your gross salary, and instantly see your monthly take-home pay after income tax — Pakistan (FBR 2024-25), UAE, US, UK, and India.
        </p>
      </div>

      <SalaryClient />

      {/* FAQ section */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.25rem 4rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: "2.5rem 0 1.25rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #e2e8f0" }}>
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
