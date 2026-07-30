"use client";
import dynamic from "next/dynamic";
const AdminLuckyWheelContent = dynamic(() => import("./AdminLuckyWheelContent"), { ssr: false });
export default function AdminLuckyWheel() { return <AdminLuckyWheelContent />; }
