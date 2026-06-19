"use client";
import dynamic from "next/dynamic";
const MiningContent = dynamic(() => import("./MiningContent"), { ssr: false });
export default function Mining() { return <MiningContent />; }
