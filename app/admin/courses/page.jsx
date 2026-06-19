"use client";
import dynamic from "next/dynamic";
const AdminCoursesContent = dynamic(() => import("./AdminCoursesContent"), { ssr: false });
export default function AdminCourses() { return <AdminCoursesContent />; }
