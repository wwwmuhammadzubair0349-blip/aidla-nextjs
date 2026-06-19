"use client";
import dynamic from "next/dynamic";
const AdminLuckyDrawContent = dynamic(() => import("./AdminLuckyDrawContent"), { ssr: false });
export default function AdminLuckyDraw() { return <AdminLuckyDrawContent />; }
