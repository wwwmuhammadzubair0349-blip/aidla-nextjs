"use client";
import dynamic from "next/dynamic";
const CertificateClient = dynamic(() => import("./CertificateClient"), { ssr: false });
export default function CertIdPage() { return <CertificateClient />; }
