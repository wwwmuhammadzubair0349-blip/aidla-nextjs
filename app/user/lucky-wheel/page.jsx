"use client";
import dynamic from "next/dynamic";
const LuckyWheelContent = dynamic(() => import("./LuckyWheelContent"), { ssr: false });
export default function LuckyWheel() { return <LuckyWheelContent />; }
