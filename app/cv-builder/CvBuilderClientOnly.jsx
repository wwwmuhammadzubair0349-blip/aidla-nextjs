"use client";

import dynamic from "next/dynamic";

const CvBuilderClient = dynamic(() => import("./CvBuilderClient"), {
  ssr: false,
  loading: () => null,
});

export default function CvBuilderClientOnly() {
  return <CvBuilderClient />;
}
