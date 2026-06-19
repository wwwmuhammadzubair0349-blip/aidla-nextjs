"use client";
import dynamic from "next/dynamic";
const WalletWithdrawContent = dynamic(() => import("./WalletWithdrawContent"), { ssr: false });
export default function WalletWithdraw() { return <WalletWithdrawContent />; }
