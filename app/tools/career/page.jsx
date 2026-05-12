import { redirect } from "next/navigation";

export const metadata = {
  title: "Free Career Tools for Freshers, Jobs & Career Switching | AIDLA",
  description: "Free AI career tools for freshers, job seekers, professionals and career switchers: CV Maker, Cover Letter Maker, interview prep and job-ready resources.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.aidla.online/tools/career" },
};

export default function CareerToolsPage() {
  redirect("/tools");
}
