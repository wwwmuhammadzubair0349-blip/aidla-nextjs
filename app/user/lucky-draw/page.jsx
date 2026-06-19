"use client";
import dynamic from "next/dynamic";
const LuckyDrawContent = dynamic(() => import("./LuckyDrawContent"), { ssr: false });
export default function LuckyDraw() { return <LuckyDrawContent />; }
