import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log In | AIDLA",
  description: "Sign in to your AIDLA account to continue learning, earning coins, and experiencing the future of AI.",
  openGraph: {
    title: "Log In | AIDLA",
    description: "Sign in to your AIDLA account to continue learning, earning coins, and experiencing the future of AI.",
    url: "https://www.aidla.online/login",
    siteName: "AIDLA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Log In | AIDLA",
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100dvh', background: '#f4f7fb' }}></div>}>
      <LoginClient />
    </Suspense>
  );
}