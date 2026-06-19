"use client";
import dynamic from "next/dynamic";
const EmailBlastPageContent = dynamic(() => import("./EmailBlastPageContent"), { ssr: false });
export default function EmailBlastPage() { return <EmailBlastPageContent />; }
