"use client";
import dynamic from "next/dynamic";
const AdminCommandCenterContent = dynamic(() => import("./AdminCommandCenterContent"), { ssr: false });
export default function AdminCommandCenter() { return <AdminCommandCenterContent />; }
