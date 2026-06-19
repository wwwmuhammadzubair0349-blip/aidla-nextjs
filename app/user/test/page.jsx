"use client";
import dynamic from "next/dynamic";
const TestArenaContent = dynamic(() => import("./TestArenaContent"), { ssr: false });
export default function TestArena() { return <TestArenaContent />; }
