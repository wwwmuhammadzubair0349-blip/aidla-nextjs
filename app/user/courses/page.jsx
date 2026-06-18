// app/user/courses/page.jsx — redirects to /user/learn
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function CoursesPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/user/learn"); }, [router]);
  return null;
}
