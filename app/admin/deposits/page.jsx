"use client";
import dynamic from "next/dynamic";
const DepositsContent = dynamic(() => import("./DepositsContent"), { ssr: false });
export default function Deposits() { return <DepositsContent />; }
