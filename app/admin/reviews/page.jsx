"use client";
import dynamic from "next/dynamic";
const AdminReviewsPageContent = dynamic(() => import("./AdminReviewsPageContent"), { ssr: false });
export default function AdminReviewsPage() { return <AdminReviewsPageContent />; }
