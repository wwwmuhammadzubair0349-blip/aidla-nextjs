"use client";

import dynamic from "next/dynamic";

const CoverLetterClient = dynamic(() => import("./CoverLetterClient"), {
  ssr: false,
  loading: () => null,
});

export default function CoverLetterClientOnly(props) {
  return <CoverLetterClient {...props} />;
}
