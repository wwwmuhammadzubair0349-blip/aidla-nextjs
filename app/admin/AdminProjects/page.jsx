"use client";
import dynamic from "next/dynamic";
const AdminProjectsContent = dynamic(() => import("./AdminProjectsContent"), { ssr: false });
export default function AdminProjects() { return <AdminProjectsContent />; }
