"use client";
import dynamic from "next/dynamic";
const AchievementsContent = dynamic(() => import("./AchievementsContent"), { ssr: false });
export default function AchievementsPage() { return <AchievementsContent />; }
