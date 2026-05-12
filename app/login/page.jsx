import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export const metadata = {
  title: "Login to AIDLA — Courses, AI Tools, Rewards & Career Growth",
  description: "Sign in to AIDLA to continue your courses, use AI tools, access career resources, quizzes, certificates, AIDLA Coins, rewards and professional learning.",
  openGraph: {
    title: "Login to AIDLA — Courses, AI Tools & Rewards",
    description: "Sign in to continue learning, using AI tools, building career resources and earning rewards.",
    url: "https://www.aidla.online/login",
    siteName: "AIDLA",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login to AIDLA — Courses, AI Tools & Rewards",
    description: "Welcome back to AIDLA.",
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
    name: "Login to AIDLA — Courses, AI Tools, Rewards & Career Growth",
    description: "Sign in to AIDLA to continue courses, AI tools, career resources, quizzes, certificates, AIDLA Coins and rewards.",
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
