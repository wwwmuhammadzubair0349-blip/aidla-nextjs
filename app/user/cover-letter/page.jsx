"use client";
import dynamic from "next/dynamic";
const UserCoverLetterPageContent = dynamic(() => import("./UserCoverLetterPageContent"), { ssr: false });
export default function UserCoverLetterPage() { return <UserCoverLetterPageContent />; }
