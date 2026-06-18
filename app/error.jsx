// app/error.jsx — global runtime error boundary
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[AIDLA Error]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b1437 0%, #1a3a8f 50%, #0b1437 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      textAlign: "center",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 24,
        padding: "48px 40px",
        maxWidth: 520,
        width: "100%",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", color: "#ef4444", textTransform: "uppercase", marginBottom: 20 }}>
          SOMETHING WENT WRONG
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: "0 0 10px", fontFamily: "'Playfair Display', serif" }}>
          An unexpected error occurred
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 32px" }}>
          Something went wrong on our end. This has been logged and we&apos;ll look into it.
          Please try again or return home.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              borderRadius: 30,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <Link href="/" style={{
            display: "block",
            padding: "12px 24px",
            borderRadius: 30,
            border: "1.5px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.85)",
            fontWeight: 700,
            fontSize: "0.88rem",
            textDecoration: "none",
          }}>
            Go Home
          </Link>
        </div>

        <div style={{ marginTop: 16, fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
          AIDLA — Pakistan&apos;s AI Education Platform
        </div>
      </div>
    </div>
  );
}
