// app/contact/page.jsx — Server component for SEO
import ContactClient from "./ContactClient";

const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Contact AIDLA – Get Support, Help & Partnership Info",
  description: "Get in touch with the AIDLA team for support, questions, course help, partnership inquiries or to report issues. We're here to help you learn and earn.",
  keywords: ["AIDLA contact", "support", "help", "customer service", "education platform", "Pakistan"],
  authors: [{ name: "AIDLA" }],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contact`,
    title: "Contact AIDLA — Support, Help & Inquiries",
    description: "Reach out to AIDLA for any questions or support. We are here to assist you.",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Contact AIDLA" }],
    siteName: "AIDLA",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact AIDLA Support",
    description: "Get help from the AIDLA support team.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${SITE_URL}/contact`,
  name: "Contact AIDLA",
  description: "Contact AIDLA support for help, questions, or partnership inquiries.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <ContactClient />
    </>
  );
}