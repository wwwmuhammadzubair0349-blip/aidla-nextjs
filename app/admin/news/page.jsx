"use client";
import dynamic from "next/dynamic";
const AdminNewsContent = dynamic(() => import("./AdminNewsContent"), { ssr: false });
export default function AdminNews() { return <AdminNewsContent />; }
