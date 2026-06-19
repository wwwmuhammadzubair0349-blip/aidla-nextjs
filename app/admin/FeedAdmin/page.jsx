"use client";
import dynamic from "next/dynamic";
const FeedAdminContent = dynamic(() => import("./FeedAdminContent"), { ssr: false });
export default function FeedAdmin() { return <FeedAdminContent />; }
