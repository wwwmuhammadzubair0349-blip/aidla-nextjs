"use client";
import dynamic from "next/dynamic";
const AdminShopContent = dynamic(() => import("./AdminShopContent"), { ssr: false });
export default function AdminShop() { return <AdminShopContent />; }
