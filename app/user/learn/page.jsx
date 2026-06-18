"use client";
import dynamic from "next/dynamic";
const LearnContent = dynamic(() => import("./LearnContent"), { ssr: false });
export default function LearnPage() { return <LearnContent />; }
