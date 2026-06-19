"use client";
import dynamic from "next/dynamic";
const InviteContent = dynamic(() => import("./InviteContent"), { ssr: false });
export default function Invite() { return <InviteContent />; }
