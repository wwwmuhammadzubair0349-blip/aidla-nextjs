import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const metadata = {
  title: "Log In to your AIDLA Account | AIDLA",
  description: "Sign in to your AIDLA account to continue learning, earning coins, and experiencing the future of AI.",
  openGraph: {
    title: "Log In to your AIDLA Account | AIDLA",
    description: "Sign in to your AIDLA account to continue learning, earning coins, and experiencing the future of AI.",
    url: "https://www.aidla.online/login",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Log In to your AIDLA Account | AIDLA",
    description: "Welcome back to the AIDLA ecosystem.",
  },
  alternates: {
    canonical: "https://www.aidla.online/login",
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
    path: "/login",
    name: "Log In to your AIDLA Account | AIDLA",
    description: "Sign in to your AIDLA account to continue learning, earning coins, and experiencing the future of AI.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Log In", url: "/login" }],
    "/login",
  ),
);

export default function LoginPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Suspense fallback={<div style={{ width: '100vw', height: '100dvh', background: '#f4f7fb' }}></div>}>
        <LoginClient />
      </Suspense>
    </>
  );
}