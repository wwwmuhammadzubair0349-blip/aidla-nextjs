import CvBuilderClient from "./CvBuilderClient";

export const metadata = {
  title: "Free Professional CV Builder — AIDLA",
  description:
    "Build a stunning, ATS-ready CV in 5 minutes. 17 premium templates, AI writing assistant, instant PDF download. Used by 50,000+ professionals. Free forever.",
  openGraph: {
    title: "Free Professional CV Builder — AIDLA",
    description:
      "Step-by-step CV builder. AI-powered. 17 premium templates. Download instantly.",
    type: "website",
  },
};

export default function CvBuilderPage() {
  return <CvBuilderClient />;
}
