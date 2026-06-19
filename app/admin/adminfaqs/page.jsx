"use client";
import dynamic from "next/dynamic";
const AdminFAQsContent = dynamic(() => import("./AdminFAQsContent"), { ssr: false });
export default function AdminFAQs() { return <AdminFAQsContent />; }
