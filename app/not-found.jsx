// app/not-found.jsx
import Link from "next/link";

export const metadata = {
  title: "Page Not Found — AIDLA",
  description: "The page you were looking for doesn't exist.",
};

export default function NotFound() {
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
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "48px 40px",
        maxWidth: 520,
        width: "100%",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: "4.5rem", lineHeight: 1, marginBottom: 8 }}>404</div>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 20 }}>
          PAGE NOT FOUND
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: "0 0 10px", fontFamily: "'Playfair Display', serif" }}>
          Oops! This page got lost
        </h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 32px" }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Let&apos;s get you back on track.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          <Link href="/user" style={{
            display: "block",
            padding: "12px 24px",
            borderRadius: 30,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}>
            Go to Dashboard
          </Link>
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
            Back to Home
          </Link>
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { href: "/blogs", label: "Blogs" },
            { href: "/news", label: "News" },
            { href: "/faqs", label: "FAQs" },
            { href: "/learning", label: "Courses" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 600 }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 32, fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
          AIDLA — Pakistan&apos;s AI Education Platform
        </div>
      </div>
    </div>
  );
}
