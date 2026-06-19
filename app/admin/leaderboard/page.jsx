"use client";
import dynamic from "next/dynamic";
const LeaderboardContent = dynamic(() => import("./LeaderboardContent"), { ssr: false });
export default function Leaderboard() { return <LeaderboardContent />; }
