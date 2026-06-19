"use client";
import dynamic from "next/dynamic";
const AutoBlogTabContent = dynamic(() => import("./AutoBlogTabContent"), { ssr: false });
export default function AutoBlogTab() { return <AutoBlogTabContent />; }
