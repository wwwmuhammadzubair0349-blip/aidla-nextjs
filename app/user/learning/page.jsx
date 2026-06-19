"use client";
import dynamic from "next/dynamic";
const LearningContent = dynamic(() => import("./LearningContent"), { ssr: false });
export default function Learning() { return <LearningContent />; }
