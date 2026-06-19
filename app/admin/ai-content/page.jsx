"use client";
import dynamic from "next/dynamic";
const AiContentContent = dynamic(() => import("./AiContentContent"), { ssr: false });
export default function AiContentPage() { return <AiContentContent />; }
