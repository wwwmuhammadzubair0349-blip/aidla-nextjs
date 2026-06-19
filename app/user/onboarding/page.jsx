"use client";
import dynamic from "next/dynamic";
const OnboardingPageContent = dynamic(() => import("./OnboardingPageContent"), { ssr: false });
export default function OnboardingPage() { return <OnboardingPageContent />; }
