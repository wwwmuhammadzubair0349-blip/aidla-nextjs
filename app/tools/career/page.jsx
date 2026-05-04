import { redirect } from "next/navigation";

export const metadata = {
  title: "Free Career Tools — CV Maker & Cover Letter Maker | AIDLA",
  description: "Free AI-powered career tools: CV Maker with 17 ATS templates and Cover Letter Maker with 6 professional templates. No sign-up needed.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/career" },
};

export default function CareerToolsPage() {
  redirect("/tools");
}
