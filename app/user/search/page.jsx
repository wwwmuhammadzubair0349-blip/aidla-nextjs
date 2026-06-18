"use client";
import dynamic from "next/dynamic";
const SearchContent = dynamic(() => import("./SearchContent"), { ssr: false });
export default function SearchPage() { return <SearchContent />; }
