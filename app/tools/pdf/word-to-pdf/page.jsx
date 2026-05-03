const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "Word to PDF Converter — Coming Soon | AIDLA Free Tools",
  description:
    "Convert .docx Word documents to perfectly formatted PDF files in one click. Fast, free, and fully secure. Coming soon on AIDLA.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/pdf/word-to-pdf` },
  openGraph: {
    title: "Word to PDF Converter — Coming Soon | AIDLA",
    description: "Free Word to PDF converter launching soon on AIDLA.",
    type: "website",
    url: `${SITE_URL}/tools/pdf/word-to-pdf`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Word to PDF — AIDLA" }],
  },
};

export default function WordToPdfPage() {
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
        background: "#ede9fe",
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        marginBottom: 24,
      }}>
        📝
      </div>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 12px" }}>
        Word to PDF Converter
      </h1>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#ede9fe",
        border: "1px solid #8b5cf6",
        borderRadius: 6,
        padding: "4px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "#6d28d9",
        marginBottom: 20,
      }}>
        🔜 Coming Soon
      </div>
      <p style={{ color: "#475569", maxWidth: 480, lineHeight: 1.7, marginBottom: 32, fontSize: "1rem" }}>
        Upload your .docx Word document and convert it to a perfectly formatted PDF file in one click.
        Fast, free, and fully secure — your files are never stored.
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
