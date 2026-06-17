"use client";
import { useState, useRef, useCallback } from "react";

const S = {
  root: { maxWidth: 860, margin: "0 auto", padding: "2rem 1.25rem 4rem" },
  hero: { textAlign: "center", marginBottom: "2.5rem" },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, background: "#fce7f3", border: "1px solid #ec4899", borderRadius: 6, padding: "4px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#be185d", marginBottom: 16 },
  h1: { fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "#0b1437", margin: "0 0 10px" },
  sub: { color: "#475569", fontSize: "1rem", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" },
  dropzone: (drag) => ({ border: `2px dashed ${drag ? "#ec4899" : "#e2e8f0"}`, borderRadius: 14, padding: "2.5rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: drag ? "rgba(236,72,153,0.04)" : "#f8fafc", marginBottom: "2rem" }),
  dropIcon: { fontSize: "2.5rem", marginBottom: 10 },
  dropText: { color: "#475569", fontSize: "0.95rem" },
  dropBtn: { display: "inline-block", marginTop: 12, padding: "8px 20px", background: "#0b1437", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem", marginBottom: "2rem" },
  card: { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" },
  img: { width: "100%", height: 160, objectFit: "cover", display: "block" },
  cardBody: { padding: "10px 12px" },
  cardName: { fontSize: "0.8rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 },
  cardMeta: { fontSize: "0.72rem", color: "#94a3b8" },
  actions: { display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid #f1f5f9" },
  btnDl: { flex: 1, padding: "6px 0", background: "#ec4899", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" },
  btnRm: { padding: "6px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" },
  dlAll: { display: "flex", justifyContent: "center", gap: 12 },
  btnAll: { padding: "11px 28px", background: "#0b1437", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" },
  clear: { padding: "11px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 9, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" },
  info: { background: "#fdf2f8", border: "1px solid rgba(236,72,153,0.15)", borderRadius: 12, padding: "1.25rem 1.5rem", marginTop: "2rem" },
  infoTitle: { fontWeight: 700, color: "#be185d", marginBottom: 8, fontSize: "0.9rem" },
  infoList: { margin: 0, paddingLeft: 20, color: "#64748b", fontSize: "0.875rem", lineHeight: 2 },
};

function fmtSize(bytes) {
  if (!bytes) return "";
  return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(2)} MB`;
}

function convertToPng(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Conversion failed"));
        resolve(blob);
      }, "image/png");
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function JpgToPngClient() {
  const [items, setItems] = useState([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => /image\/(jpeg|jpg|webp|bmp|gif)/i.test(f.type));
    const newItems = valid.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, "") + ".png",
      origSize: file.size,
      status: "idle",
      pngBlob: null,
      pngSize: null,
    }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const convertOne = useCallback(async (id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: "converting" } : it));
    const item = items.find(it => it.id === id);
    try {
      const blob = await convertToPng(item.file);
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: "done", pngBlob: blob, pngSize: blob.size } : it));
    } catch {
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: "error" } : it));
    }
  }, [items]);

  const downloadOne = useCallback((item) => {
    const url = URL.createObjectURL(item.pngBlob);
    const a = document.createElement("a");
    a.href = url; a.download = item.name;
    a.click(); URL.revokeObjectURL(url);
  }, []);

  const convertAll = useCallback(async () => {
    for (const item of items) {
      if (item.status === "idle") await convertOne(item.id);
    }
  }, [items, convertOne]);

  const downloadAll = useCallback(() => {
    items.filter(it => it.status === "done").forEach(downloadOne);
  }, [items, downloadOne]);

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

  const allDone = items.length > 0 && items.every(it => it.status === "done");
  const hasIdle = items.some(it => it.status === "idle");

  return (
    <div style={S.root}>
      <div style={S.hero}>
        <div style={S.badge}>🎨 Free Browser Tool — No Upload, 100% Private</div>
        <h1 style={S.h1}>JPG to PNG Converter</h1>
        <p style={S.sub}>Convert JPG, JPEG, WEBP or BMP images to lossless PNG instantly. Files never leave your device — all processing is done in your browser.</p>
      </div>

      <div
        style={S.dropzone(drag)}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div style={S.dropIcon}>🖼️</div>
        <p style={S.dropText}>Drag & drop JPG / JPEG / WEBP / BMP files here</p>
        <span style={S.dropBtn}>Choose Files</span>
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/webp,image/bmp,image/gif" multiple hidden onChange={e => addFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <>
          <div style={S.grid}>
            {items.map(item => (
              <div key={item.id} style={S.card}>
                <img src={item.preview} alt={item.name} style={S.img} />
                <div style={S.cardBody}>
                  <div style={S.cardName}>{item.name}</div>
                  <div style={S.cardMeta}>
                    {item.origSize ? fmtSize(item.origSize) : ""}
                    {item.pngSize ? ` → ${fmtSize(item.pngSize)}` : ""}
                    {item.status === "converting" ? " · Converting…" : ""}
                    {item.status === "error" ? " · ❌ Failed" : ""}
                    {item.status === "done" ? " · ✅ Ready" : ""}
                  </div>
                </div>
                <div style={S.actions}>
                  {item.status === "idle" && <button style={S.btnDl} onClick={() => convertOne(item.id)}>Convert</button>}
                  {item.status === "converting" && <button style={{ ...S.btnDl, opacity: 0.6 }} disabled>Converting…</button>}
                  {item.status === "done" && <button style={S.btnDl} onClick={() => downloadOne(item)}>Download PNG</button>}
                  {item.status === "error" && <button style={S.btnDl} onClick={() => convertOne(item.id)}>Retry</button>}
                  <button style={S.btnRm} onClick={() => remove(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={S.dlAll}>
            {hasIdle && <button style={S.btnAll} onClick={convertAll}>Convert All</button>}
            {allDone && <button style={S.btnAll} onClick={downloadAll}>Download All PNGs</button>}
            <button style={S.clear} onClick={clear}>Clear All</button>
          </div>
        </>
      )}

      <div style={S.info}>
        <div style={S.infoTitle}>Why convert JPG to PNG?</div>
        <ul style={S.infoList}>
          <li>PNG supports transparency — ideal for logos, icons, and design assets</li>
          <li>PNG is lossless — no quality degradation on repeated saves</li>
          <li>Required for many design tools, presentations, and web graphics</li>
          <li>Your files are converted locally — nothing is uploaded to any server</li>
        </ul>
      </div>
    </div>
  );
}
