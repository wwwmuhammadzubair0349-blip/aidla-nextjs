import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const metadata = {
  title: "Create Account and Join thousands of Students | AIDLA",
  description: "Join the AIDLA ecosystem. Create your free account to start learning, earn rewards, and experience the future of AI.",
  openGraph: {
    title: "Create Account and Join thousands of Students | AIDLA",
    description: "Join the AIDLA ecosystem. Create your free account to start learning, earn rewards, and experience the future of AI.",
    url: "https://www.aidla.online/signup",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Account and Join thousands of Students | AIDLA",
    description: "Join the AIDLA ecosystem today.",
  },
  alternates: {
    canonical: "https://www.aidla.online/signup",
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const schema = buildGraph(
  buildWebPageSchema({
    path: "/signup",
    name: "Create Account and Join thousands of Students | AIDLA",
    description: "Join the AIDLA ecosystem. Create your free account to start learning, earn rewards, and experience the future of AI.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Sign Up", url: "/signup" }],
    "/signup",
  ),
);

export default function SignupPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Suspense fallback={<div style={{ width: '100vw', height: '100dvh', background: '#f4f7fb' }}></div>}>
        <SignupClient />
      </Suspense>
    </>
  );
}