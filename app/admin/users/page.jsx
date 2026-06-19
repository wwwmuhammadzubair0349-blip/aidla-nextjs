"use client";
import dynamic from "next/dynamic";
const UsersContent = dynamic(() => import("./UsersContent"), { ssr: false });
export default function Users() { return <UsersContent />; }
