"use client";
// app/tools/career/cv-maker/cv/Print.jsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const PAPER_SIZES = {
  a4:     { mm_w: 210, mm_h: 297, label: "A4"     },
  letter: { mm_w: 216, mm_h: 279, label: "Letter" },
  legal:  { mm_w: 216, mm_h: 356, label: "Legal"  },
};

// All font weights loaded in both the app and the print window
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900" +
  "&family=Sora:wght@400;600;700;800;900" +
  "&family=Plus+Jakarta+Sans:wght@400;500;600;700;800" +
  "&family=Lora:ital,wght@0,400;0,700;1,400" +
  "&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400" +
  "&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400" +
  "&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400" +
  "&family=DM+Serif+Display:ital@0;1" +
  "&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400" +
  "&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900" +
  "&display=swap";

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
}

function buildPrintCss(paper) {
  const { mm_w, mm_h } = PAPER_SIZES[paper] || PAPER_SIZES.a4;
  return `
    @page { size: ${mm_w}mm ${mm_h}mm; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0 !important; padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
      width: ${mm_w}mm; height: auto !important;
    }
    .cv-doc { width: ${mm_w}mm !important; min-height: 0 !important; margin: 0 !important; padding: 10mm 8mm !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; }
    .layout-swiss-clean .cv-doc, .layout-sidebar-dark .cv-doc, .layout-infographic .cv-doc,
    .layout-gulf-premium .cv-doc, .layout-double-col .cv-doc, .layout-slate-pro .cv-doc,
    .layout-dubai-pro .cv-doc, .layout-bold-header .cv-doc, .layout-coral-modern .cv-doc,
    .layout-navy-exec .cv-doc, .layout-apex-pro .cv-doc { padding: 0 !important; }
    .layout-gulf-premium .cv-doc { border-top: 0 !important; box-shadow: inset 0 12mm 0 var(--ac) !important; padding-top: 18mm !important; }
    .layout-sidebar-dark .cv-sidebar { background: #0b1120 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .cv-section { page-break-inside: avoid !important; break-inside: avoid-page !important; }
    .cv-sec-title { page-break-after: avoid !important; break-after: avoid-page !important; display: block !important; }
    .cv-sec-title + .cv-sec-body, .cv-sec-title + * { page-break-before: avoid !important; break-before: avoid-page !important; }
    .cv-item { page-break-inside: avoid !important; break-inside: avoid-page !important; display: block !important; margin-bottom: 12px; }
    .cv-exp-item { page-break-inside: avoid !important; break-inside: avoid-page !important; }
    .cv-item-header { page-break-after: avoid !important; break-after: avoid-page !important; page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-bullets { page-break-inside: avoid !important; break-inside: avoid-page !important; }
    .cv-bullets li { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-photo-wrapper { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-header { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-info-card { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-lang-item { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-kpi-grid, .cv-kpi-item { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-case-study { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-cert-item { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-refs-grid { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-qr-wrapper { page-break-inside: avoid !important; break-inside: avoid !important; }
    .cv-body.has-right { display: grid !important; }
    .cv-body.has-sidebar { display: block !important; }
    .cv-body.has-sidebar::after { content: ""; display: table; clear: both; }
    .cv-section { orphans: 3 !important; widows: 3 !important; }
    .cv-summary { orphans: 3 !important; widows: 3 !important; }
    .layout-sidebar-dark .cv-sidebar { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #0b1120 !important; }
    .layout-slate-pro .cv-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #1e293b !important; }
    .layout-double-col .cv-header, .layout-coral-modern .cv-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  `;
}

function executePrint({ paperRef, paper, filename, toast }) {
  const paperEl = paperRef?.current;
  if (!paperEl) { toast?.("Preview not ready — please wait.", "err"); return; }

  const cvHtml   = paperEl.innerHTML;
  const { mm_w } = PAPER_SIZES[paper] || PAPER_SIZES.a4;
  const printCss = buildPrintCss(paper);

  // Sanitize filename: strip only characters invalid in filenames; preserve unicode (Arabic, Urdu, etc.)
  const safeTitle = (filename || "CV")
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim() || "CV";

  const mobile = isMobile();

  const mobileScript = mobile
    ? `document.getElementById('msteps').style.display='block'; document.getElementById('dtip').style.display='none';`
    : `document.fonts.ready.then(function(){ setTimeout(function(){ window.print(); }, 300); });`;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #c5cfe0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; font-family: system-ui, sans-serif; }
    .banner { width: 100%; background: #0f172a; color: #fff; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; position: sticky; top: 0; z-index: 100; }
    .banner-text { font-size: 13px; font-weight: 600; line-height: 1.5; }
    .banner-text strong { color: #fcd34d; }
    .save-btn { background: #2563eb; color: #fff; border: none; padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 12px rgba(37,99,235,.4); display: flex; align-items: center; gap: 8px; flex-shrink: 0; font-family: system-ui, sans-serif; }
    .mobile-steps { width: 100%; background: #1e293b; padding: 10px 20px; display: none; }
    .steps-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .step { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #94a3b8; line-height: 1.4; }
    .step-num { background: #2563eb; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
    .cv-wrap { margin: 24px auto; width: ${mm_w}mm; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,.25); }
    @media print {
      html, body { background: #fff !important; display: block !important; min-height: 0 !important; height: auto !important; overflow: visible !important; }
      .banner, .mobile-steps { display: none !important; }
      .cv-wrap { margin: 0 !important; padding: 0 !important; box-shadow: none !important; width: ${mm_w}mm !important; min-height: 0 !important; height: auto !important; overflow: visible !important; break-after: auto !important; page-break-after: auto !important; }
      .cv-wrap > .cv-doc { break-after: avoid !important; page-break-after: avoid !important; }
      ${printCss}
    }
  </style>
</head>
<body>
  <div class="banner">
    <div class="banner-text">
      Your CV is ready &mdash; <strong>ATS-friendly real text PDF</strong>.
      <span id="dtip"> Set Destination &rarr; <strong>Save as PDF</strong> and uncheck <strong>Headers and footers</strong>.</span>
    </div>
    <button class="save-btn" onclick="window.print()">&#8595; Save as PDF</button>
  </div>
  <div class="mobile-steps" id="msteps">
    <div class="steps-row">
      <div class="step"><div class="step-num">1</div><div><strong style="color:#e2e8f0">iOS Safari:</strong> Tap Share &rarr; Print &rarr; Pinch out &rarr; Save as PDF</div></div>
      <div class="step"><div class="step-num">2</div><div><strong style="color:#e2e8f0">Android Chrome:</strong> Tap Save as PDF above &rarr; Done</div></div>
      <div class="step"><div class="step-num">3</div><div><strong style="color:#e2e8f0">Samsung:</strong> Menu &rarr; Print &rarr; Save as PDF</div></div>
    </div>
  </div>
  <div class="cv-wrap">${cvHtml}</div>
  <script>${mobileScript}<\/script>
</body>
</html>`;

  // Use Blob URL instead of document.write (modern, non-deprecated)
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");

  if (!win) {
    URL.revokeObjectURL(url);
    toast?.("Please allow pop-ups for this site to download your PDF.", "err");
    return;
  }

  // Revoke the object URL after the window has had time to load it
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function PrintModal({ defaultName, paper, onConfirm, onCancel }) {
  const [name, setName]   = useState(defaultName);
  const inp               = useRef(null);
  const modalRef          = useRef(null);
  const mobile            = isMobile();

  useEffect(() => { inp.current?.focus(); inp.current?.select(); }, []);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = Array.from(
      modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    const handleKey = (e) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };
    modal.addEventListener("keydown", handleKey);
    return () => modal.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const confirm = () => onConfirm(name?.trim() || defaultName);

  return createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      <div
        ref={modalRef}
        style={{
          background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "440px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)", overflow: "hidden",
          maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
          padding: "20px 24px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0,
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", flexShrink: 0,
          }} aria-hidden="true">📄</div>
          <div>
            <div id="print-modal-title" style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>Save CV as PDF</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", marginTop: "2px" }}>
              ATS-friendly · Real text · Perfect section breaks
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
            fontSize: "0.78rem", color: "#166534",
            display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: 1.55,
          }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }} aria-hidden="true">✅</span>
            <span><strong>Print-optimized.</strong> Sections never split across pages. Headers stay with content. Real text PDF parseable by all ATS systems.</span>
          </div>

          <label
            htmlFor="pdf-filename"
            style={{
              display: "block", fontSize: "0.72rem", fontWeight: 800,
              color: "#334155", marginBottom: "6px",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}
          >
            File Name
          </label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              id="pdf-filename"
              ref={inp}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirm()}
              style={{
                width: "100%", padding: "11px 48px 11px 14px",
                borderRadius: "10px", border: "2px solid #e2e8f0",
                fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                fontWeight: 600, color: "#0f172a", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
              aria-label="PDF file name (without extension)"
            />
            <span style={{
              position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
              fontSize: "0.72rem", color: "#94a3b8", fontWeight: 700,
            }} aria-hidden="true">.pdf</span>
          </div>

          {mobile ? (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
              fontSize: "0.75rem", color: "#1e40af", lineHeight: 1.6,
            }}>
              <strong>📱 Mobile:</strong> A preview opens in a new tab. Tap <strong>"Save as PDF"</strong> at the top, or use your browser's Share / Print menu.
            </div>
          ) : (
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "12px 14px", marginBottom: "20px",
              fontSize: "0.75rem", color: "#334155", lineHeight: 1.6,
            }}>
              <strong>💡 Tip:</strong> Set <strong>Destination → Save as PDF</strong> and uncheck <strong>"Headers and footers"</strong> for the cleanest result.
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1, padding: "12px", background: "#f1f5f9",
                color: "#475569", border: "none", borderRadius: "10px",
                fontWeight: 700, cursor: "pointer", fontSize: "0.88rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              style={{
                flex: 2, padding: "12px",
                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                color: "#fff", border: "none", borderRadius: "10px",
                fontWeight: 800, cursor: "pointer", fontSize: "0.88rem",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor"
                strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Print({ paperRef, paper, fullName, toast }) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!fullName?.trim()) {
      toast?.("Please enter your full name before downloading.", "err");
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = (filename) => {
    setShowModal(false);
    executePrint({ paperRef, paper, filename, toast });
  };

  const defaultFilename = (fullName || "My_CV")
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .trim() + "_CV" || "My_CV";

  return (
    <>
      {showModal && (
        <PrintModal
          defaultName={defaultFilename}
          paper={paper || "a4"}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div data-print-ignore="true" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleClick}
          aria-label="Download CV as PDF"
          style={{
            padding: "7px 18px",
            background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
            color: "#fff", border: "none", borderRadius: "99px",
            fontWeight: 800, cursor: "pointer", fontSize: "0.78rem",
            boxShadow: "0 3px 12px rgba(37,99,235,0.35)",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "transform 0.15s, box-shadow 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseOver={e  => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(37,99,235,0.45)"; }}
          onMouseOut={e   => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 3px 12px rgba(37,99,235,0.35)"; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>
    </>
  );
}
