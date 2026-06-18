"use client";
import dynamic from "next/dynamic";
const SocialContent = dynamic(() => import("./SocialContent"), { ssr: false });
export default function SocialPage() { return <SocialContent />; }
