"use client";

import dynamic from "next/dynamic";

const CvMakerClient = dynamic(() => import("./CvMakerClient"), {
  ssr: false,
  loading: () => null,
});

export default function CvMakerClientOnly(props) {
  return <CvMakerClient {...props} />;
}
