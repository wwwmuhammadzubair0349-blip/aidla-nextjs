"use client";
import dynamic from "next/dynamic";
const AdminWithdrawsContent = dynamic(() => import("./AdminWithdrawsContent"), { ssr: false });
export default function AdminWithdraws() { return <AdminWithdrawsContent />; }
