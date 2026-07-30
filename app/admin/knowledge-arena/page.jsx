"use client";
import dynamic from "next/dynamic";
const AdminBattlePageContent = dynamic(() => import("./AdminBattlePageContent"), { ssr: false });
export default function AdminBattlePage() { return <AdminBattlePageContent />; }
