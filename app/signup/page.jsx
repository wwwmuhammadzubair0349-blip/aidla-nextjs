import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const metadata = {
  title: "Create Free AIDLA Account — Learn, Use AI Tools & Earn Rewards",
  description: "Join AIDLA for free to access courses, AI tools, career resources, CVs, cover letters, quizzes, certificates, AIDLA Coins and rewards.",
  openGraph: {
    title: "Create Free AIDLA Account — Courses, AI Tools & Rewards",
    description: "Join AIDLA to access courses, AI tools, career resources, quizzes, certificates and rewards.",
    url: "https://www.aidla.online/signup",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Free AIDLA Account — Courses, AI Tools & Rewards",
    description: "Join AIDLA free today.",
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
    name: "Create Free AIDLA Account — Learn, Use AI Tools & Earn Rewards",
    description: "Join AIDLA for free to access courses, AI tools, career resources, CVs, cover letters, quizzes, certificates, AIDLA Coins and rewards.",
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
