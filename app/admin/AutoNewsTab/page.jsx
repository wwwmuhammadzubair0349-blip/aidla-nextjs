"use client";
import dynamic from "next/dynamic";
const AutoNewsTabContent = dynamic(() => import("./AutoNewsTabContent"), { ssr: false });
export default function AutoNewsTab() { return <AutoNewsTabContent />; }
