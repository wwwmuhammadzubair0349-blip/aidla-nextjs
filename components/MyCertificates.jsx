"use client";
// components/MyCertificates.jsx  (or app/user/profile/MyCertificates.jsx)
// Converted from React Router MyCertificates.jsx
//
// Changes:
//   1. "use client" directive
//   2. import { useNavigate } from "react-router-dom" → import { useRouter } from "next/navigation"
//   3. const navigate = useNavigate() → const router = useRouter()
//   4. navigate("/user/courses") → router.push("/user/courses")
//   5. navigate(`/user/certificate/${cert.id}`) → router.push(`/user/certificate/${cert.id}`)
//   6. supabase import path: ../../lib/supabase → @/lib/supabase

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  blue:      "#0056D2",
  blueDark:  "#003A8C",
  blueLight: "#EBF2FF",
  ink:       "#1A1A2E",
  slate:     "#475569",
  muted:     "#94A3B8",
  border:    "#E8EDF5",
  bg:        "#F7F9FC",
  white:     "#FFFFFF",
  amber:     "#F5A623",
  success:   "#12B76A",
  successBg: "#ECFDF3",
};

export default function MyCertificates() {
  const router = useRouter();   // ← replaces useNavigate

  const [certs,       setCerts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [userId,      setUserId]      = useState(null);
  const [copiedId,    setCopiedId]    = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
        fetchCerts(data.user.id);
      }
    });
  }, []);

  const fetchCerts = async (uid) => {
    setLoading(true);
    const { data } = await supabase
      .from("course_certificates")
      .select("*, course:course_id(title, level, category, thumbnail_url)")
      .eq("user_id", uid)
      .order("issued_at", { ascending: false });
    setCerts(data || []);
    setLoading(false);
  };

  const copyLink = (certId) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareLinkedIn = (cert) => {
    const url = encodeURIComponent(`${window.location.origin}/verify/${cert.id}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const shareTwitter = (cert) => {
    const url  = encodeURIComponent(`${window.location.origin}/verify/${cert.id}`);
    const text = encodeURIComponent(`I just earned a certificate in "${cert.course?.title}" on AIDLA! 🎓`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const downloadPDF = async (cert) => {
    setDownloading(cert.id);
    const { data: profile } = await supabase
      .from("users_profiles").select("full_name").eq("user_id", cert.user_id).single();

    const studentName = profile?.full_name || "Learner";
    const issued      = new Date(cert.issued_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    const verifyUrl   = `${window.location.origin}/verify/${cert.id}`;
    const qrUrl       = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verifyUrl)}&bgcolor=FFFEF9&color=003A8C&margin=4`;

    const win = window.open("", "_blank", "width=1200,height=850");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AIDLA Certificate — ${studentName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page { size: landscape; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { margin: 0; background: white; font-family: 'Plus Jakarta Sans', sans-serif; }
          .cert { width:100vw; height:100vh; background:#FFFEF9; position:relative; overflow:hidden; }
          .cert-frame { position:absolute; inset:0; border:28px solid #003A8C; pointer-events:none; z-index:1; }
          .cert-frame-inner { position:absolute; inset:32px; border:1.5px solid #F5A623; pointer-events:none; z-index:1; }
          .corner { position:absolute; width:52px; height:52px; z-index:2; border:2.5px solid #F5A623; }
          .corner.tl { top:40px;left:40px;border-right:none;border-bottom:none; }
          .corner.tr { top:40px;right:40px;border-left:none;border-bottom:none; }
          .corner.bl { bottom:40px;left:40px;border-right:none;border-top:none; }
          .corner.br { bottom:40px;right:40px;border-left:none;border-top:none; }
          .cert-bg { position:absolute; inset:0; z-index:0; opacity:.025; background-image:repeating-linear-gradient(45deg,#003A8C 0,#003A8C 1px,transparent 0,transparent 50%); background-size:24px 24px; }
          .cert-brand { position:absolute;top:44px;left:50%;transform:translateX(-50%);font-weight:900;font-size:20px;letter-spacing:3px;color:#003A8C;z-index:4; }
          .cert-body { position:relative;z-index:3;padding:70px 100px;display:flex;flex-direction:column;align-items:center;text-align:center;height:100%;justify-content:center; }
          .cert-overline { font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:#94A3B8;margin-bottom:8px; }
          .cert-heading { font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:64px;color:#003A8C;line-height:1;margin-bottom:28px; }
          .rule { display:flex;align-items:center;gap:14px;width:100%;max-width:360px;margin-bottom:22px; }
          .rule-line { flex:1;height:1px;background:linear-gradient(90deg,transparent,#F5A623,transparent); }
          .rule-diamond { width:8px;height:8px;background:#F5A623;transform:rotate(45deg); }
          .cert-presented { font-size:14px;color:#475569;margin-bottom:12px; }
          .cert-name { font-family:'Instrument Serif',serif;font-weight:400;font-size:52px;color:#1A1A2E;line-height:1.1;border-bottom:1.5px solid #E8EDF5;padding-bottom:14px;margin-bottom:16px;min-width:55%; }
          .cert-for { font-size:12px;color:#94A3B8;margin-bottom:8px; }
          .cert-course { font-family:'Instrument Serif',serif;font-size:28px;color:#0056D2;font-weight:400;margin-bottom:20px; }
          .cert-meta { display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:36px; }
          .cert-footer { display:flex;align-items:flex-end;justify-content:space-between;width:100%;gap:20px;margin-top:auto; }
          .sig { display:flex;flex-direction:column;align-items:center;flex:1; }
          .sig-script { font-family:'Instrument Serif',serif;font-style:italic;font-size:26px;color:#003A8C;border-bottom:1.5px solid #CBD5E1;padding-bottom:4px;min-width:180px;text-align:center;margin-bottom:6px; }
          .sig-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94A3B8; }
          .seal-wrap { width:90px;height:90px;flex-shrink:0; }
          .seal-outer { width:100%;height:100%;border-radius:50%;background:conic-gradient(#F5A623 0deg,#F0C040 120deg,#F5A623 240deg,#F0C040 360deg);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px white,0 0 0 5px #F5A623; }
          .seal-inner { width:80%;height:80%;border-radius:50%;border:1.5px dashed rgba(120,53,15,.35);display:flex;align-items:center;justify-content:center;flex-direction:column; }
          .seal-text { font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;color:#78350F;line-height:1.4;text-align:center; }
          .cert-qr { position:absolute;bottom:44px;right:72px;z-index:4;display:flex;flex-direction:column;align-items:center;gap:4px; }
          .cert-qr-label { font-size:7px;color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:1px; }
          .cert-id { position:absolute;bottom:44px;left:72px;font-size:9px;color:#94A3B8;font-family:monospace;line-height:1.7;z-index:3; }
        </style>
      </head>
      <body onload="window.print();window.close();">
        <div class="cert">
          <div class="cert-bg"></div>
          <div class="cert-frame"></div>
          <div class="cert-frame-inner"></div>
          <div class="corner tl"></div><div class="corner tr"></div>
          <div class="corner bl"></div><div class="corner br"></div>
          <div class="cert-brand"><img src="/logo.png" alt="AIDLA" style="height:36px;object-fit:contain;"></div>
          <div class="cert-body">
            <div class="cert-overline">Certificate of Completion</div>
            <h1 class="cert-heading">Verified Achievement</h1>
            <div class="rule"><div class="rule-line"></div><div class="rule-diamond"></div><div class="rule-line"></div></div>
            <p class="cert-presented">This is to proudly certify that</p>
            <div class="cert-name">${studentName}</div>
            <p class="cert-for">has successfully completed all requirements for</p>
            <div class="cert-course">${cert.course?.title || "—"}</div>
            ${cert.course?.level || cert.course?.category ? `
            <div class="cert-meta">
              ${cert.course?.level ? `<span>${cert.course.level}</span>` : ""}
              ${cert.course?.level && cert.course?.category ? '<div style="width:3px;height:3px;border-radius:50%;background:#E8EDF5;"></div>' : ""}
              ${cert.course?.category ? `<span>${cert.course.category}</span>` : ""}
            </div>` : ""}
            <div class="cert-footer">
              <div class="sig">
                <div class="sig-script">AIDLA Director</div>
                <div class="sig-label">Program Director</div>
              </div>
              <div class="seal-wrap">
                <div class="seal-outer"><div class="seal-inner"><div class="seal-text">AIDLA<br/>✓<br/>CERT</div></div></div>
              </div>
              <div class="sig">
                <div class="sig-script">${issued}</div>
                <div class="sig-label">Date of Issue</div>
              </div>
            </div>
          </div>
          <div class="cert-qr">
            <img src="${qrUrl}" width="80" height="80" alt="QR Code">
            <div class="cert-qr-label">Scan to verify</div>
          </div>
          <div class="cert-id">
            Certificate No: ${cert.certificate_number}<br>
            Verify: ${verifyUrl}
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setDownloading(null);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    .certs-wrapper { font-family:'Plus Jakarta Sans',sans-serif; color:${C.ink}; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to { transform:rotate(360deg); } }
    .cert-card { animation:fadeUp .4s ease both; }
    .cert-card:hover { transform:translateY(-3px) !important; box-shadow:0 12px 32px rgba(0,86,210,.12) !important; }
    .action-btn { transition:all .15s; }
    .action-btn:hover { opacity:.85; transform:translateY(-1px); }
    .action-btn:focus-visible { outline:2px solid ${C.blue}; outline-offset:2px; }
  `;

  if (loading) return (
    <div style={{ padding:"48px 0", textAlign:"center" }}>
      <style>{css}</style>
      <div style={{ width:36, height:36, border:`3px solid ${C.border}`, borderTopColor:C.blue, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }}/>
      <p style={{ color:C.muted, fontWeight:600, fontSize:14 }}>Loading your certificates…</p>
    </div>
  );

  return (
    <div className="certs-wrapper">
      <style>{css}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h2 style={{ fontFamily:"'Instrument Serif',serif", fontWeight:400, fontSize:22, color:C.ink }}>
            My Certificates
          </h2>
          <p style={{ fontSize:13, color:C.muted, marginTop:3 }}>
            {certs.length} certificate{certs.length !== 1 ? "s" : ""} earned
          </p>
        </div>
        {/* navigate → router.push */}
        <button onClick={() => router.push("/user/courses")}
          style={{ background:C.blue, color:C.white, border:"none", borderRadius:8, padding:"10px 18px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          + Earn More
        </button>
      </div>

      {/* Empty state */}
      {certs.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", background:C.white, borderRadius:16, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:56, marginBottom:16 }} aria-hidden="true">🎓</div>
          <h3 style={{ fontFamily:"'Instrument Serif',serif", fontWeight:400, fontSize:20, color:C.ink, marginBottom:8 }}>
            No certificates yet
          </h3>
          <p style={{ color:C.muted, fontSize:14, marginBottom:20 }}>
            Complete a course to earn your first AIDLA certificate
          </p>
          <button onClick={() => router.push("/user/courses")}
            style={{ background:C.blue, color:C.white, border:"none", borderRadius:8, padding:"11px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
            Browse Courses
          </button>
        </div>
      )}

      {/* Certificates grid */}
      <div style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))" }}>
        {certs.map((cert, i) => {
          const issued     = new Date(cert.issued_at).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
          const isCopied   = copiedId === cert.id;
          const isDl       = downloading === cert.id;

          return (
            <div key={cert.id} className="cert-card"
              style={{ animationDelay:`${i * 60}ms`, background:C.white, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.05)", overflow:"hidden", transition:"all .2s" }}>

              {/* Banner */}
              <div style={{ background:`linear-gradient(135deg,${C.blueDark} 0%,${C.blue} 100%)`, padding:"20px 20px 16px", position:"relative" }}>
                <div style={{ position:"absolute", top:10, right:14, fontWeight:900, fontSize:11, letterSpacing:2, color:"rgba(255,255,255,.3)", textTransform:"uppercase" }}>AIDLA</div>
                <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>Certificate of Completion</div>
                <div style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:20, color:C.white, lineHeight:1.3, marginBottom:4 }}>{cert.course?.title || "—"}</div>
                {(cert.course?.level || cert.course?.category) && (
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", fontWeight:600 }}>
                    {[cert.course?.level, cert.course?.category].filter(Boolean).join(" · ")}
                  </div>
                )}
                {/* Gold seal */}
                <div style={{ position:"absolute", bottom:-18, right:20, width:44, height:44, borderRadius:"50%", background:`conic-gradient(${C.amber} 0deg,#F0C040 120deg,${C.amber} 240deg,#F0C040 360deg)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 0 3px ${C.white},0 0 0 5px ${C.amber}`, zIndex:2 }}>
                  <span style={{ fontSize:16, fontWeight:900, color:"#78350F" }}>✓</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding:"22px 20px 16px" }}>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.6, marginBottom:3 }}>Issued</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.slate }}>{issued}</div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:.6, marginBottom:3 }}>Certificate No</div>
                  <div style={{ fontSize:11, fontFamily:"monospace", color:C.slate, wordBreak:"break-all" }}>{cert.certificate_number}</div>
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {/* View — navigate → router.push */}
                  <button className="action-btn" onClick={() => router.push(`/user/certificate/${cert.id}`)}
                    style={{ flex:1, padding:"9px 12px", background:C.blue, color:C.white, border:"none", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    👁 View
                  </button>
                  <button className="action-btn" onClick={() => downloadPDF(cert)} disabled={isDl}
                    style={{ flex:1, padding:"9px 12px", background:C.successBg, color:C.success, border:`1px solid #A7F3D0`, borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    {isDl ? "⏳" : "⬇ PDF"}
                  </button>
                  <button className="action-btn" onClick={() => copyLink(cert.id)}
                    style={{ flex:1, padding:"9px 12px", background:isCopied ? C.successBg : C.bg, color:isCopied ? C.success : C.slate, border:`1px solid ${isCopied ? "#A7F3D0" : C.border}`, borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                    {isCopied ? "✓ Copied" : "🔗 Link"}
                  </button>
                </div>

                {/* Share */}
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <button className="action-btn" onClick={() => shareLinkedIn(cert)}
                    style={{ flex:1, padding:"8px 10px", background:"#EFF5FB", color:"#0077B5", border:"none", borderRadius:8, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                    LinkedIn
                  </button>
                  <button className="action-btn" onClick={() => shareTwitter(cert)}
                    style={{ flex:1, padding:"8px 10px", background:"#EFF8FF", color:"#1DA1F2", border:"none", borderRadius:8, fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                    Twitter / X
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}