"use client";
import dynamic from "next/dynamic";
const UserCvMakerPageContent = dynamic(() => import("./UserCvMakerPageContent"), { ssr: false });
export default function UserCvMakerPage() { return <UserCvMakerPageContent />; }
