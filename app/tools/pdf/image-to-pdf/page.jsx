const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Image to PDF Converter — Coming Soon | AIDLA Free Tools",
  description:
    "Convert JPG, PNG, or any image to a clean PDF instantly. No account required, no watermarks — completely free. Coming soon on AIDLA.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/pdf/image-to-pdf` },
  openGraph: {
    title: "Image to PDF Converter — Coming Soon | AIDLA",
    description: "Free image to PDF converter launching soon on AIDLA.",
    type: "website",
    url: `${SITE_URL}/tools/pdf/image-to-pdf`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Image to PDF — AIDLA" }],
  },
};

export default function ImageToPdfPage() {
  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      textAlign: "center",
      background: "#f8fafc",
    }}>
      <div style={{
        background: "#fef3c7",
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        marginBottom: 24,
      }}>
        🖼️
      </div>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 12px" }}>
        Image to PDF Converter
      </h1>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#fef3c7",
        border: "1px solid #f59e0b",
        borderRadius: 6,
        padding: "4px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "#b45309",
        marginBottom: 20,
      }}>
        🔜 Coming Soon
      </div>
      <p style={{ color: "#475569", maxWidth: 480, lineHeight: 1.7, marginBottom: 32, fontSize: "1rem" }}>
        Convert JPG, PNG, or any image file into a clean, shareable PDF document instantly.
        No account required, no watermarks — completely free every time.
        We&apos;re putting the finishing touches on this tool.
      </p>
      <a
        href="/tools"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#0b1437",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 8,
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "0.95rem",
        }}
      >
        🔧 Browse Available Free Tools
      </a>
    </div>
  );
}
