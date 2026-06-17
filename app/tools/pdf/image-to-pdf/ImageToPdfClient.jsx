"use client";
import { useState, useRef, useCallback } from "react";

const S = {
  root: { maxWidth: 860, margin: "0 auto", padding: "2rem 1.25rem 4rem" },
  hero: { textAlign: "center", marginBottom: "2.5rem" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#b45309", marginBottom: 16 },
  h1: { fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 10px" },
  sub: { color: "#475569", fontSize: "1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" },
  dropzone: (drag) => ({ border: `2px dashed ${drag ? "#f59e0b" : "#e2e8f0"}`, borderRadius: 14, padding: "2.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: drag ? "rgba(245,158,11,0.04)" : "#f8fafc", marginBottom: "2rem" }),
  dropIcon: { fontSize: "2.5rem", marginBottom: 10 },
  dropText: { color: "#475569", fontSize: "0.95rem" },
  dropBtn: { display: "inline-block", marginTop: 12, padding: "8px 20px", background: "#0b1437", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" },
  controls: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" },
  label: { fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 4 },
  select: { padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: "0.875rem", color: "#0f172a", background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" },
  card: { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff", position: "relative" },
  numBadge: { position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700 },
  img: { width: "100%", height: 140, objectFit: "cover", display: "block" },
  cardBody: { padding: "8px 10px" },
  cardName: { fontSize: "0.78rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  moveRow: { display: "flex", gap: 6, padding: "8px 10px", borderTop: "1px solid #f1f5f9" },
  moveBtn: { flex: 1, padding: "4px 0", background: "#f1f5f9", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#475569" },
  rmBtn: { padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" },
  bottom: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
  btnConvert: { padding: "12px 32px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" },
  btnClear: { padding: "12px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 9, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" },
  hint: { textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: 12 },
  info: { background: "#fffbeb", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "1.25rem 1.5rem", marginTop: "2rem" },
  infoTitle: { fontWeight: 700, color: "#b45309", marginBottom: 8, fontSize: "0.9rem" },
  infoList: { margin: 0, paddingLeft: 20, color: "#64748b", fontSize: "0.875rem", lineHeight: 2 },
};

const PAGE_SIZES = {
  A4:     { w: 794, h: 1123 },
  Letter: { w: 816, h: 1056 },
  A3:     { w: 1123, h: 1587 },
};

export default function ImageToPdfClient() {
  const [items, setItems] = useState([]);
  const [drag, setDrag] = useState(false);
  const [pageSize, setPageSize] = useState("A4");
  const [fit, setFit] = useState("contain");
  const inputRef = useRef();

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    const newItems = valid.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const move = useCallback((id, dir) => {
    setItems(prev => {
      const idx = prev.findIndex(x => x.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    setItems(prev => {
      const it = prev.find(x => x.id === id);
      if (it?.preview) URL.revokeObjectURL(it.preview);
      return prev.filter(x => x.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    items.forEach(it => { if (it?.preview) URL.revokeObjectURL(it.preview); });
    setItems([]);
  }, [items]);

  const convertToPdf = useCallback(() => {
    if (!items.length) return;
    const { w, h } = PAGE_SIZES[pageSize];
    const fitStyle = fit === "contain"
      ? `max-width:100%;max-height:100%;object-fit:contain;`
      : `width:100%;height:100%;object-fit:cover;`;

    const pages = items.map(it =>
      `<div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;page-break-after:always;overflow:hidden;">
        <img src="${it.preview}" style="${fitStyle}" />
      </div>`
    ).join("\n");

    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups for this site to download the PDF."); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>AIDLA — Image to PDF</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        @page { size:${w}px ${h}px; margin:0; }
        body { background:#fff; }
        @media print { body { width:${w}px; } }
      </style>
      </head><body>${pages}
      <script>window.onload=function(){ setTimeout(function(){ window.print(); }, 400); }<\/script>
      </body></html>`);
    win.document.close();
  }, [items, pageSize, fit]);

  return (
    <div style={S.root}>
      <div style={S.hero}>
        <div style={S.badge}>🖼️ Free Browser Tool — No Upload, 100% Private</div>
        <h1 style={S.h1}>Image to PDF Converter</h1>
        <p style={S.sub}>Convert one or multiple JPG, PNG, or WEBP images into a single PDF. Reorder pages, choose page size. Files never leave your device.</p>
      </div>

      <div
        style={S.dropzone(drag)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div style={S.dropIcon}>📄</div>
        <p style={S.dropText}>Drag & drop images here — JPG, PNG, WEBP, GIF</p>
        <span style={S.dropBtn}>Choose Images</span>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <>
          <div style={S.controls}>
            <div>
              <div style={S.label}>Page Size</div>
              <select style={S.select} value={pageSize} onChange={e => setPageSize(e.target.value)}>
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">US Letter (8.5 × 11 in)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
              </select>
            </div>
            <div>
              <div style={S.label}>Image Fit</div>
              <select style={S.select} value={fit} onChange={e => setFit(e.target.value)}>
                <option value="contain">Fit to Page (contain)</option>
                <option value="cover">Fill Page (cover)</option>
              </select>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {items.length} image{items.length !== 1 ? "s" : ""} · {items.length} page{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div style={S.grid}>
            {items.map((item, idx) => (
              <div key={item.id} style={S.card}>
                <div style={S.numBadge}>Page {idx + 1}</div>
                <img src={item.preview} alt={item.name} style={S.img} />
                <div style={S.cardBody}>
                  <div style={S.cardName}>{item.name}</div>
                </div>
                <div style={S.moveRow}>
                  <button style={S.moveBtn} onClick={() => move(item.id, -1)} disabled={idx === 0}>↑</button>
                  <button style={S.moveBtn} onClick={() => move(item.id, 1)} disabled={idx === items.length - 1}>↓</button>
                  <button style={S.rmBtn} onClick={() => remove(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={S.bottom}>
            <button style={S.btnConvert} onClick={convertToPdf}>Convert to PDF →</button>
            <button style={S.btnClear} onClick={clear}>Clear All</button>
          </div>
          <p style={S.hint}>A print dialog will open — select "Save as PDF" to download.</p>
        </>
      )}

      <div style={S.info}>
        <div style={S.infoTitle}>How it works</div>
        <ul style={S.infoList}>
          <li>Upload one or more images — JPG, PNG, WEBP, GIF all supported</li>
          <li>Drag pages to reorder them, choose your paper size</li>
          <li>Click "Convert to PDF" → a print dialog opens → choose Save as PDF</li>
          <li>Everything runs in your browser — no file is uploaded to any server</li>
        </ul>
      </div>
    </div>
  );
}
