"use client";
import dynamic from "next/dynamic";
const UserProjectsPageContent = dynamic(() => import("./UserProjectsPageContent"), { ssr: false });
export default function UserProjectsPage() { return <UserProjectsPageContent />; }
