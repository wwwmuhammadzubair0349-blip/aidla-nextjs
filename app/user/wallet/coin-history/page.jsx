"use client";
import dynamic from "next/dynamic";
const CoinHistoryContent = dynamic(() => import("./CoinHistoryContent"), { ssr: false });
export default function CoinHistoryPage() { return <CoinHistoryContent />; }
