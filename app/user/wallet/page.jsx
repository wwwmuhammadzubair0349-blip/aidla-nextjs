"use client";
import dynamic from "next/dynamic";
const WalletOverviewContent = dynamic(() => import("./WalletOverviewContent"), { ssr: false });
export default function WalletOverview() { return <WalletOverviewContent />; }
