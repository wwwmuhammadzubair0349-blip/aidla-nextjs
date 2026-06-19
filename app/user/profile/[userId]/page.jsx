"use client";
import dynamic from "next/dynamic";
const PublicUserProfileContent = dynamic(() => import("./PublicUserProfileContent"), { ssr: false });
export default function PublicUserProfile() { return <PublicUserProfileContent />; }
