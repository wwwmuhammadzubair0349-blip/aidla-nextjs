"use client";
import dynamic from "next/dynamic";
const ForumContent = dynamic(() => import("./ForumContent"), { ssr: false });
export default function ForumPage() { return <ForumContent />; }
