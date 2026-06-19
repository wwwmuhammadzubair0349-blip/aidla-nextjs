"use client";
import dynamic from "next/dynamic";
const AdminTestsContent = dynamic(() => import("./AdminTestsContent"), { ssr: false });
export default function AdminTests() { return <AdminTestsContent />; }
