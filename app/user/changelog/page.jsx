"use client";
import dynamic from "next/dynamic";
const ChangelogPageContent = dynamic(() => import("./ChangelogPageContent"), { ssr: false });
export default function ChangelogPage() { return <ChangelogPageContent />; }
