"use client";
import dynamic from "next/dynamic";
const UserShopContent = dynamic(() => import("./UserShopContent"), { ssr: false });
export default function UserShop() { return <UserShopContent />; }
