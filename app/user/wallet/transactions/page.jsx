"use client";
import dynamic from "next/dynamic";
const WalletTransactionsContent = dynamic(() => import("./WalletTransactionsContent"), { ssr: false });
export default function WalletTransactions() { return <WalletTransactionsContent />; }
