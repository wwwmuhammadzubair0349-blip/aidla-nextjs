"use client";
import dynamic from "next/dynamic";
const AdminStudyMaterialsContent = dynamic(() => import("./AdminStudyMaterialsContent"), { ssr: false });
export default function AdminStudyMaterials() { return <AdminStudyMaterialsContent />; }
