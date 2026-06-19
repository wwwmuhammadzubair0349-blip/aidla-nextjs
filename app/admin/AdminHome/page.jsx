"use client";
import dynamic from "next/dynamic";
const AdminHomeContent = dynamic(() => import("./AdminHomeContent"), { ssr: false });
export default function AdminHome() { return <AdminHomeContent />; }
