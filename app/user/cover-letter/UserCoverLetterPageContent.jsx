"use client";

import { useState, useEffect } from "react";
import CoverLetterDashboard from "./CoverLetterDashboard";
import CoverLetterClient from "@/app/tools/career/cover-letter-maker/CoverLetterClient";

export default function UserCoverLetterPage() {
  // If the user just came from the public tool (clicked download while logged
  // out), show the SAME editor they were using — their letter is already in
  // localStorage (aidla_clm_v3) and download works now that they're logged in.
  const [carried, setCarried] = useState(null); // null = deciding

  useEffect(() => {
    let c = false;
    try { c = localStorage.getItem("clm_carry") === "1"; } catch {}
    if (c) { try { localStorage.removeItem("clm_carry"); } catch {} }
    setCarried(c);
  }, []);

  if (carried === null) return null;
  return carried ? <CoverLetterClient /> : <CoverLetterDashboard />;
}
