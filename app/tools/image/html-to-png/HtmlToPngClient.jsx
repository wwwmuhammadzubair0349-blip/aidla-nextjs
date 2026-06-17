"use client";
import { useState, useCallback, useMemo } from "react";

/* ── Presets ─────────────────────────────────────────────────────────────── */
const PRESETS = [
  { id: "fb",     label: "Facebook Post",   icon: "📘", w: 1080, h: 1080 },
  { id: "ig",     label: "Instagram Post",  icon: "📸", w: 1080, h: 1080 },
  { id: "story",  label: "Instagram Story", icon: "📱", w: 1080, h: 1920 },
  { id: "li",     label: "LinkedIn Post",   icon: "💼", w: 1200, h: 627  },
  { id: "tw",     label: "Twitter/X Post",  icon: "🐦", w: 1600, h: 900  },
  { id: "custom", label: "Custom Size",     icon: "✏️", w: null,  h: null  },
];

const DEFAULT_HTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:'Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:48px;box-sizing:border-box;text-align:center;">
  <div style="background:rgba(255,255,255,0.18);border-radius:50px;padding:8px 22px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;">🚀 New Announcement</div>
  <h1 style="font-size:52px;font-weight:900;margin:0 0 20px;line-height:1.1;">Your Headline<br>Goes Here</h1>
  <p style="font-size:19px;opacity:0.88;max-width:520px;line-height:1.65;margin:0 0 36px;">Add your message, tagline, or call to action. Make it clear and compelling.</p>
  <div style="background:#fff;color:#764ba2;padding:14px 38px;border-radius:50px;font-weight:800;font-size:17px;">Learn More →</div>
</div>`;

/* ── Preview constraints ──────────────────────────────────────────────────── */
const PREV_MAX_W = 490;
const PREV_MAX_H = 390;

/* ── CORS detector ───────────────────────────────────────────────────────── */
function detectExternalResources(html) {
  if (/<link[^>]+href=["']https?:/i.test(html)) return true;
  if (/@import\s+["']?https?:/i.test(html)) return true;
  if (/<script[^>]+src=["']https?:/i.test(html)) return true;
  return false;
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  root:   { maxWidth: 1120, margin: "0 auto", padding: "2rem 1.25rem 4rem" },
  hero:   { textAlign: "center", marginBottom: "1.75rem" },
  badge:  { display: "inline-flex", alignItems: "center", gap: 6, background: "#fce7f3", border: "1px solid #ec4899", borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#be185d", marginBottom: 14 },
  h1:     { fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 10px" },
  sub:    { color: "#475569", fontSize: "1rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" },

  grid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))", gap: "1.5rem", alignItems: "start" },

  card:   { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: "1rem" },
  cHead:  { padding: "11px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: "0.83rem", color: "#374151" },
  cBody:  { padding: "1rem" },

  lbl:    { fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" },

  presetGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: "0.5rem" },
  presetBtn: (a) => ({
    padding: "9px 6px", border: `2px solid ${a ? "#ec4899" : "#e2e8f0"}`,
    borderRadius: 8, background: a ? "#fdf2f8" : "#f8fafc",
    color: a ? "#be185d" : "#374151", fontSize: "0.72rem", fontWeight: 700,
    cursor: "pointer", textAlign: "center", lineHeight: 1.45, transition: "all 0.15s",
  }),
  presetDim: { fontSize: "0.63rem", color: "#94a3b8", fontWeight: 400, marginTop: 2 },

  row:    { display: "flex", gap: 8, marginBottom: "0.75rem", alignItems: "center" },
  inp:    { flex: 1, padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: "0.875rem", color: "#0f172a", background: "#f8fafc", outline: "none" },

  textarea: {
    width: "100%", minHeight: 280, padding: "12px", boxSizing: "border-box",
    border: "1px solid #e2e8f0", borderRadius: 8, background: "#0f172a",
    color: "#e2e8f0", fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
    fontSize: "0.77rem", lineHeight: 1.7, resize: "vertical", outline: "none",
    tabSize: 2,
  },

  corsWarn: {
    background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8,
    padding: "9px 12px", fontSize: "0.78rem", color: "#92400e", marginTop: 8,
    display: "flex", gap: 7, alignItems: "flex-start",
  },

  dlBtn: (s) => ({
    width: "100%", padding: "13px", marginTop: "0.75rem",
    background: s === "loading" ? "#d1d5db" : s === "done" ? "#059669" : s === "error" ? "#dc2626" : "#ec4899",
    color: "#fff", border: "none", borderRadius: 10, fontWeight: 800,
    fontSize: "0.95rem", cursor: s === "loading" ? "not-allowed" : "pointer",
    transition: "background 0.2s",
  }),

  dimNote: { textAlign: "center", fontSize: "0.74rem", color: "#94a3b8", marginTop: 8 },

  infoBox:   { background: "#fdf2f8", border: "1px solid rgba(236,72,153,0.15)", borderRadius: 12, padding: "1.25rem 1.5rem", marginTop: "2rem" },
  infoTitle: { fontWeight: 700, color: "#be185d", marginBottom: 8, fontSize: "0.9rem" },
  infoList:  { margin: 0, paddingLeft: 20, color: "#64748b", fontSize: "0.875rem", lineHeight: 2 },
};

/* ── Component ───────────────────────────────────────────────────────────── */
export default function HtmlToPngClient() {
  const [presetId, setPresetId] = useState("ig");
  const [customW,  setCustomW]  = useState(1200);
  const [customH,  setCustomH]  = useState(630);
  const [html,     setHtml]     = useState(DEFAULT_HTML);
  const [status,   setStatus]   = useState("idle");

  const preset  = PRESETS.find(p => p.id === presetId);
  const canvasW = presetId === "custom" ? (Number(customW) || 800) : preset.w;
  const canvasH = presetId === "custom" ? (Number(customH) || 600) : preset.h;

  const scale    = Math.min(PREV_MAX_W / canvasW, PREV_MAX_H / canvasH);
  const displayW = Math.round(canvasW * scale);
  const displayH = Math.round(canvasH * scale);

  const corsWarning = useMemo(() => detectExternalResources(html), [html]);

  const download = useCallback(async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const canvas = document.createElement("canvas");
      canvas.width  = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width",  canvasW);
      svg.setAttribute("height", canvasH);
      const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      fo.setAttribute("width",  "100%");
      fo.setAttribute("height", "100%");
      fo.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${canvasW}px;height:${canvasH}px;overflow:hidden;">${html}</div>`;
      svg.appendChild(fo);

      const xml  = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url  = URL.createObjectURL(blob);

      console.log("SVG xml length:", xml.length);
      console.log("Blob URL:", url);

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href     = dataUrl;
      a.download = `aidla-${preset?.id ?? "custom"}-${canvasW}x${canvasH}.png`;
      a.click();
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Download error:", err.message, err.stack);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [html, canvasW, canvasH, preset, status]);

  const btnLabel = {
    idle:    "⬇ Download PNG",
    loading: "⏳ Generating…",
    done:    "✅ Downloaded!",
    error:   "❌ Failed — try again",
  }[status];

  return (
    <div style={S.root}>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.badge}>🎨 Free Browser Tool — No Upload, 100% Private</div>
        <h1 style={S.h1}>HTML to PNG Converter</h1>
        <p style={S.sub}>
          Paste any HTML, pick a social media preset or custom size, and download a pixel-perfect PNG.
          Optimized for ads, posts, and banners. Runs entirely in your browser.
        </p>
      </div>

      {/* ── Main grid ── */}
      <div style={S.grid}>

        {/* ── LEFT: Controls + Editor ── */}
        <div>

          {/* Canvas Size */}
          <div style={S.card}>
            <div style={S.cHead}>📐 Canvas Size</div>
            <div style={S.cBody}>
              <div style={S.presetGrid}>
                {PRESETS.map(p => (
                  <button key={p.id} style={S.presetBtn(presetId === p.id)} onClick={() => setPresetId(p.id)}>
                    <div>{p.icon} {p.label}</div>
                    <div style={S.presetDim}>{p.w ? `${p.w}×${p.h}` : "Enter below"}</div>
                  </button>
                ))}
              </div>
              {presetId === "custom" && (
                <div style={{ ...S.row, marginTop: "0.75rem" }}>
                  <input style={S.inp} type="number" min={100} max={4000} value={customW} onChange={e => setCustomW(e.target.value)} placeholder="Width px" />
                  <span style={{ color: "#94a3b8", fontWeight: 700 }}>×</span>
                  <input style={S.inp} type="number" min={100} max={4000} value={customH} onChange={e => setCustomH(e.target.value)} placeholder="Height px" />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap" }}>px</span>
                </div>
              )}
            </div>
          </div>

          {/* HTML Editor */}
          <div style={S.card}>
            <div style={S.cHead}>💻 HTML Code</div>
            <div style={S.cBody}>
              <textarea
                style={S.textarea}
                value={html}
                onChange={e => setHtml(e.target.value)}
                placeholder="Paste your HTML here…"
                spellCheck={false}
              />
              {corsWarning && (
                <div style={S.corsWarn}>
                  <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                  <div>
                    <strong>CORS Warning:</strong> External CSS or scripts detected (e.g. CDN link, @import). These will likely <em>not load</em> in the captured image due to browser security. Use <strong>inline styles</strong> instead for reliable output.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT: Preview + Download ── */}
        <div style={{ position: "sticky", top: 16 }}>

          {/* Preview panel */}
          <div style={S.card}>
            <div style={S.cHead}>
              👁️ Live Preview
              <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#94a3b8", fontWeight: 400 }}>
                {canvasW}×{canvasH}px
              </span>
            </div>
            <div style={{ ...S.cBody, display: "flex", flexDirection: "column", alignItems: "center" }}>

              <div style={{
                width: displayW,
                height: displayH,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                flexShrink: 0,
                position: "relative",
              }}>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: canvasW,
                    height: canvasH,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>

              <div style={S.dimNote}>
                {preset?.label ?? "Custom"} · {canvasW} × {canvasH} px · PNG
              </div>

              <button style={S.dlBtn(status)} onClick={download} disabled={status === "loading"}>
                {btnLabel}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div style={S.card}>
            <div style={S.cHead}>💡 Tips for best results</div>
            <div style={{ ...S.cBody, padding: "0.75rem 1rem" }}>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: "0.8rem", lineHeight: 2.2 }}>
                <li>Use <strong>inline styles</strong> — no external CSS loaded</li>
                <li>Add <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3, fontSize: "0.72rem" }}>height:100%</code> to your root <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3, fontSize: "0.72rem" }}>&lt;div&gt;</code></li>
                <li>Use <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 3, fontSize: "0.72rem" }}>box-sizing:border-box</code> for padding</li>
                <li>Set background color in your HTML — tool adds no background</li>
                <li>Avoid Google Fonts — use system fonts for reliability</li>
                <li>Preview is scaled down — download is full resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div style={S.infoBox}>
        <div style={S.infoTitle}>How it works</div>
        <ul style={S.infoList}>
          <li>Paste HTML with inline CSS — external stylesheets are not supported</li>
          <li>Pick a social media preset (Facebook, Instagram, LinkedIn, Twitter/X) or enter a custom size</li>
          <li>Live preview updates as you type — see exactly what you'll get</li>
          <li>Click Download PNG — your image is generated in the browser. No server, no upload, no account needed</li>
        </ul>
      </div>

      {/* More Free Tools */}
      <div style={{ marginTop: "2.5rem" }}>
        <div style={{ fontWeight: 700, color: "#0b1437", fontSize: "1rem", marginBottom: "1rem" }}>More Free Tools</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.75rem" }}>
          {[
            { href: "/tools/image/jpg-to-png",          icon: "🎨", label: "JPG to PNG",       desc: "Convert images to lossless PNG" },
            { href: "/tools/pdf/image-to-pdf",          icon: "🖼️", label: "Image to PDF",      desc: "Combine images into one PDF" },
            { href: "/tools/pdf/word-to-pdf",           icon: "📝", label: "Word to PDF",       desc: "Convert .docx files to PDF" },
            { href: "/tools/career/cv-maker",           icon: "📄", label: "CV Maker",          desc: "Build a professional CV for free" },
            { href: "/tools/career/cover-letter-maker", icon: "✉️", label: "Cover Letter",      desc: "Write a cover letter in minutes" },
            { href: "/tools/utility/qr-code-generator", icon: "📱", label: "QR Code Generator", desc: "Generate QR codes instantly" },
          ].map(t => (
            <a key={t.href} href={t.href} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none" }}>
              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{t.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>{t.label}</div>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 2 }}>{t.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
