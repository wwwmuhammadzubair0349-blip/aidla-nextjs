"use client";
import dynamic from "next/dynamic";
const InsightsContent = dynamic(() => import("./InsightsContent"), { ssr: false });
export default function InsightsPage() { return <InsightsContent />; }
