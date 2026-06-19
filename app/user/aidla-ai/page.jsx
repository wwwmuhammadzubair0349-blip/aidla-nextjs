"use client";
import dynamic from "next/dynamic";
const AidlaAIContent = dynamic(() => import("./AidlaAIContent"), { ssr: false });
export default function AidlaAI() { return <AidlaAIContent />; }
