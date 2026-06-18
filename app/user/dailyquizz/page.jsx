"use client";
import dynamic from "next/dynamic";
const DailyQuizzContent = dynamic(() => import("./DailyQuizzContent"), { ssr: false });
export default function DailyQuizzPage() { return <DailyQuizzContent />; }
