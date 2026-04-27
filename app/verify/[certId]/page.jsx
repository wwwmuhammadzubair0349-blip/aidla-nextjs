// app/verify/[certId]/page.jsx
// Pure server component — fetches certificate data server-side
// No useEffect, no useState, no client JS needed

import { supabase } from "@/lib/supabase";
import styles from "./verify.module.css";

const SITE_URL = "https://www.aidla.online";

export async function generateMetadata({ params }) {
  const { certId } = await params;
  return {
    title: "Certificate Verification — AIDLA",
    description: "Verify the authenticity of an AIDLA certificate of completion.",
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/verify/${certId}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/verify/${certId}`,
      title: "Certificate Verification — AIDLA",
      description: "Verify the authenticity of an AIDLA certificate of completion.",
      images: [{ url: `${SITE_URL}/og-home.jpg` }],
      siteName: "AIDLA",
    },
  };
}

/* ── Seal Badge SVG ── */
function SealBadge({ size = 46 }) {
  return (
    <svg viewBox="0 0 90 90" width={size} height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <radialGradient id="vsg2" cx="38%" cy="36%" r="65%">
          <stop offset="0%" stopColor="#FFD85C" />
          <stop offset="55%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#D4860A" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="46" r="43" fill="rgba(0,0,0,0.07)" />
      <circle cx="45" cy="45" r="43" fill="url(#vsg2)" />
      <circle cx="45" cy="45" r="43" fill="none" stroke="white" strokeWidth="3" opacity="0.85" />
      <circle cx="45" cy="45" r="40" fill="none" stroke="#D4860A" strokeWidth="1" />
      <circle cx="45" cy="45" r="33" fill="none" stroke="#78350F" strokeWidth="1" strokeDasharray="3 2.5" opacity="0.4" />
      <text x="45" y="37" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="8" fontWeight="900" fill="#78350F" letterSpacing="1.5">AIDLA</text>
      <text x="45" y="50" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="12" fontWeight="900" fill="#78350F">✓</text>
      <text x="45" y="61" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="7" fontWeight="900" fill="#78350F" letterSpacing="2">CERT</text>
      <circle cx="45" cy="4" r="2.2" fill="#D4860A" />
      <circle cx="45" cy="86" r="2.2" fill="#D4860A" />
      <circle cx="4" cy="45" r="2.2" fill="#D4860A" />
      <circle cx="86" cy="45" r="2.2" fill="#D4860A" />
    </svg>
  );
}

/* ── Server-side data fetch ── */
async function getCertificate(certId) {
  // Handle build-time scenario where supabase is not initialized
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from("course_certificates")
      .select("*")
      .eq("id", certId)
      .single();

    if (error || !data) return null;

    const [{ data: course }, { data: profile }] = await Promise.all([
      supabase.from("course_courses")
        .select("title,level,category")
        .eq("id", data.course_id)
        .single(),
      supabase.from("users_profiles")
        .select("full_name")
        .eq("user_id", data.user_id)
        .single(),
    ]);

    return {
      ...data,
      course_title: course?.title || "—",
      course_level: course?.level || "",
      course_category: course?.category || "",
      student_name: profile?.full_name || "Learner",
    };
  } catch {
    return null;
  }
}

/* ── JSON-LD ── */
function buildJsonLd(cert, certId) {
  if (!cert) return null;
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: "Certificate of Completion",
    description: `AIDLA Certificate of Completion for ${cert.course_title}`,
    url: `${SITE_URL}/verify/${certId}`,
    credentialCategory: "Certificate",
    recognizedBy: {
      "@type": "Organization",
      name: "AIDLA",
      url: SITE_URL,
    },
    about: {
      "@type": "Course",
      name: cert.course_title,
    },
  };
}

/* ── Main Page ── */
export default async function VerifyPage({ params }) {
  const { certId } = await params;
  const cert = await getCertificate(certId);
  const valid = !!cert;

  const issued = cert
    ? new Date(cert.issued_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "";

  const jsonLd = buildJsonLd(cert, certId);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className={styles.page}>
        {/* Top bar */}
        <div className={styles.topbar}>
          <span className={styles.topbarBrand}>AIDLA</span>
          <span className={styles.topbarLabel}>Certificate<br />Verification</span>
        </div>

        {/* Main */}
        <main className={styles.main}>
          {valid && cert ? (
            <>
              {/* Verified banner */}
              <div className={styles.hero}>
                <div className={styles.checkRing}>
                  <span className={styles.checkIcon}>✓</span>
                </div>
                <div className={styles.heroBody}>
                  <div className={styles.heroTitle}>Certificate Verified</div>
                  <div className={styles.heroSub}>Authentic, unmodified AIDLA certificate.</div>
                </div>
              </div>

              {/* Details card */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardEyebrow}>AIDLA · Verified</div>
                  <div className={styles.cardTitle}>Certificate of Completion</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Awarded To</span>
                    <span className={`${styles.rowVal} ${styles.large}`}>{cert.student_name}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Course</span>
                    <span className={styles.rowVal}>{cert.course_title}</span>
                  </div>
                  {cert.course_level && (
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Level</span>
                      <span className={styles.rowVal}>{cert.course_level}</span>
                    </div>
                  )}
                  {cert.course_category && (
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Category</span>
                      <span className={styles.rowVal}>{cert.course_category}</span>
                    </div>
                  )}
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Date Issued</span>
                    <span className={styles.rowVal}>{issued}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Cert No</span>
                    <span className={`${styles.rowVal} ${styles.mono}`}>{cert.certificate_number}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Cert ID</span>
                    <span className={`${styles.rowVal} ${styles.mono}`}>{cert.id}</span>
                  </div>
                </div>
              </div>

              {/* Issuer strip */}
              <div className={styles.issuer}>
                <SealBadge size={44} />
                <div className={styles.issuerText}>
                  <div className={styles.issuerName}>Issued by AIDLA</div>
                  <div className={styles.issuerSub}>AI Digital Learning Academy · aidla.online</div>
                </div>
                <div className={styles.validChip}>✓ Valid</div>
              </div>

              {/* Cert ID chip */}
              <div className={styles.idChip}>
                <div className={styles.idChipLabel}>Certificate ID</div>
                <div className={styles.idChipVal}>{certId}</div>
              </div>
            </>
          ) : (
            <div className={styles.invalid}>
              <span className={styles.invalidIcon}>❌</span>
              <div className={styles.invalidTitle}>Certificate Not Found</div>
              <div className={styles.invalidBody}>
                This certificate ID does not exist in our records, or may have been revoked.
                Contact AIDLA support if you believe this is an error.
              </div>
              <code className={styles.invalidId}>{certId}</code>
            </div>
          )}
        </main>

      </div>
    </>
  );
}