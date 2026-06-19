"use client";
import dynamic from "next/dynamic";
const AdminMiningContent = dynamic(() => import("./AdminMiningContent"), { ssr: false });
export default function AdminMining() { return <AdminMiningContent />; }
