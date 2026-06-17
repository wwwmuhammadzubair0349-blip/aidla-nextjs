"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const S = {
  root: { maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem 4rem" },
  hero: { textAlign: "center", marginBottom: "2.5rem" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "#ede9fe", border: "1px solid #8b5cf6", borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#6d28d9", marginBottom: 16 },
  h1: { fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 10px" },
  sub: { color: "#475569", fontSize: "1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" },
  dropzone: (drag) => ({ border: `2px dashed ${drag ? "#8b5cf6" : "#e2e8f0"}`, borderRadius: 14, padding: "2.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: drag ? "rgba(139,92,246,0.04)" : "#f8fafc", marginBottom: "2rem" }),
  dropIcon: { fontSize: "2.5rem", marginBottom: 10 },
  dropText: { color: "#475569", fontSize: "0.95rem" },
  dropSub: { color: "#94a3b8", fontSize: "0.82rem", marginTop: 4 },
  dropBtn: { display: "inline-block", marginTop: 12, padding: "8px 20px", background: "#0b1437", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" },
  fileBar: { display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: "1.5rem" },
  fileIcon: { fontSize: "1.5rem" },
  fileName: { flex: 1, fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" },
  btnRm: { padding: "4px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" },
  statusRow: { textAlign: "center", padding: "1rem", color: "#6d28d9", fontWeight: 600, fontSize: "0.9rem" },
  preview: {
    border: "1px solid #e2e8f0", borderRadius: 12, padding: "2rem 2.5rem",
    background: "#fff", marginBottom: "1.5rem",
    maxHeight: 520, overflowY: "auto",
    fontFamily: "Georgia, serif", fontSize: "1rem", lineHeight: 1.8, color: "#1e293b",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  bottom: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  btnPrint: { padding: "12px 32px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" },
  btnClear: { padding: "12px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 9, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" },
  hint: { textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: 12 },
  info: { background: "#f5f3ff", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 12, padding: "1.25rem 1.5rem", marginTop: "2rem" },
  infoTitle: { fontWeight: 700, color: "#6d28d9", marginBottom: 8, fontSize: "0.9rem" },
  infoList: { margin: 0, paddingLeft: 20, color: "#64748b", fontSize: "0.875rem", lineHeight: 2 },
};

export default function WordToPdfClient() {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [html, setHtml] = useState("");
  const [mammothReady, setMammothReady] = useState(false);
  const inputRef = useRef();
  const previewRef = useRef();

  useEffect(() => {
    if (document.getElementById("mammoth-cdn")) { setMammothReady(true); return; }
    const script = document.createElement("script");
    script.id = "mammoth-cdn";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";
    script.onload = () => setMammothReady(true);
    script.onerror = () => setMammothReady(false);
    document.head.appendChild(script);
  }, []);

  const processFile = useCallback(async (f) => {
    if (!f || !f.name.match(/\.docx$/i)) {
      setStatus("error"); return;
    }
    setFile(f); setStatus("loading"); setHtml("");

    const waitForMammoth = () => new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        if (window.mammoth) return resolve();
        if (attempts++ > 40) return reject(new Error("Mammoth.js failed to load"));
        setTimeout(check, 200);
      };
      check();
    });

    try {
      await waitForMammoth();
      const buffer = await f.arrayBuffer();
      const result = await window.mammoth.convertToHtml({ arrayBuffer: buffer });
      setHtml(result.value);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const clear = useCallback(() => {
    setFile(null); setHtml(""); setStatus("idle");
  }, []);

  const printPdf = useCallback(() => {
    if (!html) return;
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups for this site."); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${file?.name?.replace(/\.docx$/i,"") || "Document"}</title>
      <style>
        * { box-sizing: border-box; }
        @page { size: A4; margin: 2.5cm 2cm; }
        body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.8; color: #000; }
        h1,h2,h3,h4,h5,h6 { font-weight: bold; margin: 1em 0 0.5em; }
        h1 { font-size: 1.6em; } h2 { font-size: 1.3em; } h3 { font-size: 1.1em; }
        p { margin: 0 0 0.8em; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        td, th { border: 1px solid #999; padding: 6px 10px; }
        th { background: #f0f0f0; font-weight: bold; }
        img { max-width: 100%; }
        ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
        li { margin-bottom: 0.3em; }
      </style>
      </head><body>${html}
      <script>window.onload=function(){ setTimeout(function(){ window.print(); }, 400); }<\/script>
      </body></html>`);
    win.document.close();
  }, [html, file]);

  return (
    <div style={S.root}>
      <div style={S.hero}>
        <div style={S.badge}>📝 Free Browser Tool — No Upload, 100% Private</div>
        <h1 style={S.h1}>Word to PDF Converter</h1>
        <p style={S.sub}>Convert .docx Word documents to PDF with one click. Headings, tables, lists, and formatting are all preserved. Files never leave your device.</p>
      </div>

      {status === "idle" && (
        <div
          style={S.dropzone(drag)}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div style={S.dropIcon}>📄</div>
          <p style={S.dropText}>Drag & drop your .docx file here</p>
          <p style={S.dropSub}>Microsoft Word 2007+ format (.docx only)</p>
          <span style={S.dropBtn}>Choose File</span>
          <input ref={inputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={e => processFile(e.target.files[0])} />
        </div>
      )}

      {file && status !== "idle" && (
        <div style={S.fileBar}>
          <div style={S.fileIcon}>📄</div>
          <div style={S.fileName}>{file.name} — {(file.size / 1024).toFixed(1)} KB</div>
          <button style={S.btnRm} onClick={clear}>✕ Remove</button>
        </div>
      )}

      {status === "loading" && (
        <div style={S.statusRow}>⏳ Parsing document…{!mammothReady ? " (Loading converter…)" : ""}</div>
      )}

      {status === "error" && (
        <div style={{ ...S.statusRow, color: "#dc2626" }}>
          ❌ Could not parse this file. Make sure it is a .docx (Word 2007+) file, not .doc or .odt.
        </div>
      )}

      {status === "ready" && html && (
        <>
          <div
            ref={previewRef}
            style={S.preview}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div style={S.bottom}>
            <button style={S.btnPrint} onClick={printPdf}>Save as PDF →</button>
            <button style={S.btnClear} onClick={clear}>Convert Another</button>
          </div>
          <p style={S.hint}>A print dialog will open — select "Save as PDF" to download.</p>
        </>
      )}

      <div style={S.info}>
        <div style={S.infoTitle}>Supported formatting</div>
        <ul style={S.infoList}>
          <li>Headings (H1–H6), bold, italic, underline, strikethrough</li>
          <li>Bullet lists, numbered lists, nested lists</li>
          <li>Tables with borders and header rows</li>
          <li>Images embedded in the document</li>
          <li>.docx format only (Word 2007 and newer) — not .doc or .odt</li>
        </ul>
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <div style={{ fontWeight: 700, color: "#0b1437", fontSize: "1rem", marginBottom: "1rem" }}>More Free Tools</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.75rem" }}>
          {[
            { href: "/tools/image/jpg-to-png", icon: "🎨", label: "JPG to PNG", desc: "Convert images to lossless PNG" },
            { href: "/tools/pdf/image-to-pdf", icon: "🖼️", label: "Image to PDF", desc: "Convert images to a PDF document" },
            { href: "/tools/career/cv-maker", icon: "📄", label: "CV Maker", desc: "Build a professional CV for free" },
            { href: "/tools/career/cover-letter-maker", icon: "✉️", label: "Cover Letter Maker", desc: "Write a cover letter in minutes" },
          ].map(t => (
            <a key={t.href} href={t.href} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", background: "#f5f3ff", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10, textDecoration: "none" }}>
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
