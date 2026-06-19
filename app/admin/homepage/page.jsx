"use client";
import dynamic from "next/dynamic";
const HomepageContent = dynamic(() => import("./HomepageContent"), { ssr: false });
export default function Homepage() { return <HomepageContent />; }
