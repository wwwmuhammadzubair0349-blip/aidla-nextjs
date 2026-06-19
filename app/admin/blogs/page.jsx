"use client";
import dynamic from "next/dynamic";
const BlogsContent = dynamic(() => import("./BlogsContent"), { ssr: false });
export default function Blogs() { return <BlogsContent />; }
