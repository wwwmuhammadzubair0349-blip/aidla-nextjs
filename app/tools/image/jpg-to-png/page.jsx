const SITE_URL = "https://www.aidla.online";

export const metadata = {
  title: "JPG to PNG Converter — Coming Soon | AIDLA Free Tools",
  description:
    "Convert JPG images to transparent-background PNG files instantly. Perfect for logos and design work. Free, fast, no account required. Coming soon on AIDLA.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/tools/image/jpg-to-png` },
  openGraph: {
    title: "JPG to PNG Converter — Coming Soon | AIDLA",
    description: "Free JPG to PNG image converter launching soon on AIDLA.",
    type: "website",
    url: `${SITE_URL}/tools/image/jpg-to-png`,
    siteName: "AIDLA",
    locale: "en_PK",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "JPG to PNG — AIDLA" }],
  },
};

export default function JpgToPngPage() {
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
        background: "#fce7f3",
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        marginBottom: 24,
      }}>
        🎨
      </div>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 12px" }}>
        JPG to PNG Converter
      </h1>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#fce7f3",
        border: "1px solid #ec4899",
        borderRadius: 6,
        padding: "4px 14px",
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "#be185d",
        marginBottom: 20,
      }}>
        🔜 Coming Soon
      </div>
      <p style={{ color: "#475569", maxWidth: 480, lineHeight: 1.7, marginBottom: 32, fontSize: "1rem" }}>
        Convert JPG images to transparent-background PNG files instantly.
        Perfect for logos, profile pictures, and any design work.
        Free, fast, and no account required.
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
