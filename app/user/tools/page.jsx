"use client";
import dynamic from "next/dynamic";
const ToolsContent = dynamic(() => import("./ToolsContent"), { ssr: false });
export default function ToolsPage() { return <ToolsContent />; }
