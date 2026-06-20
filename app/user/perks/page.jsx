"use client";
import dynamic from "next/dynamic";
const PerksContent = dynamic(() => import("./PerksContent"), { ssr: false });
export default function PerksPage() { return <PerksContent />; }
