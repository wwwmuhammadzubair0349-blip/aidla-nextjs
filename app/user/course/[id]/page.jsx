"use client";
import dynamic from "next/dynamic";
const CoursePlayerClient = dynamic(() => import("./CoursePlayerClient"), { ssr: false });
export default function IdPage() { return <CoursePlayerClient />; }
