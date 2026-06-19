"use client";
import dynamic from "next/dynamic";
const ErrorsContent = dynamic(() => import("./ErrorsContent"), { ssr: false });
export default function AdminErrorsPage() { return <ErrorsContent />; }
