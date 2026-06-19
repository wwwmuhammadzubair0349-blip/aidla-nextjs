"use client";
import dynamic from "next/dynamic";
const AdminDailyQuizPageContent = dynamic(() => import("./AdminDailyQuizPageContent"), { ssr: false });
export default function AdminDailyQuizPage() { return <AdminDailyQuizPageContent />; }
