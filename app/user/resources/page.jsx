"use client";
import dynamic from "next/dynamic";
const ResourcesPageContent = dynamic(() => import("./ResourcesPageContent"), { ssr: false });
export default function ResourcesPage() { return <ResourcesPageContent />; }
