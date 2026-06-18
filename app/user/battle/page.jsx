"use client";
import dynamic from "next/dynamic";
const BattleContent = dynamic(() => import("./BattleContent"), { ssr: false });
export default function BattlePage() { return <BattleContent />; }
