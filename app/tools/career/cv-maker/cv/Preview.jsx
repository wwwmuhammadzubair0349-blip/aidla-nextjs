"use client";
// app/tools/career/cv-maker/cv/Preview.jsx
// FIX: Print is a default export — import WITHOUT curly braces.
// "got: object" error was caused by a stale { Print } named import.

import { useEffect, useRef, useCallback } from "react";
import Print from "./Print";   // ← default import, no { } — this is the fix

const PREVIEW_CSS = `
.cv-prev-ctrls {
  background: rgba(255,255,255,.94);
  border: 1px solid var(--border);
  border-radius: var(--r) var(--r) 0 0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-ctrl-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cv-ctrl-lbl {
  font-size: .6rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: .06em;
  min-width: 46px;
  flex-shrink: 0;
}

.cv-dots { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
.cv-dot {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,.15);
  cursor: pointer;
  transition: transform .18s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cv-dot:hover { transform: scale(1.25); }
.cv-dot.on { outline: 3px solid #0f172a; outline-offset: 2px; }
.cv-dot:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }

.cv-tog-g { display: flex; gap: 5px; flex-wrap: wrap; }
.cv-tog {
  padding: 5px 11px;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: .68rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: .16s;
  min-height: 30px;
  -webkit-tap-highlight-color: transparent;
}
.cv-tog:hover { background: #e2e8f0; }
.cv-tog.on { background: #0f172a; color: #fff; box-shadow: 0 3px 9px rgba(15,23,42,.18); }
.cv-tog:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

.cv-prev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 11px;
  background: rgba(255,255,255,.92);
  border: 1px solid var(--border);
  border-top: none;
  border-bottom: none;
  font-size: .7rem;
  font-weight: 700;
  color: #1e3a8a;
}
.cv-prev-zoom {
  display: flex;
  gap: 4px;
  align-items: center;
}
.cv-prev-zoom-value {
  font-size: .65rem;
  font-weight: 700;
  min-width: 32px;
  text-align: center;
  color: #0f172a;
}
.cv-zoom-btn {
  width: 28px; height: 28px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: .85rem;
  font-weight: 700;
  color: #1e3a8a;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cv-zoom-btn:hover { background: #eff6ff; }
.cv-zoom-btn:focus-visible { outline: 2px solid #2563eb; outline-offset: 1px; }

.cv-prev-scroll {
  background: #c5cfe0;
  padding: 10px;
  border: 1px solid var(--border);
  border-top: none;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 52vh;
  width: 100%;
  min-width: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(37,99,235,.3) transparent;
}
@media (min-width: 640px) { .cv-prev-scroll { max-height: 60vh; } }
@media (min-width: 960px) { .cv-prev-scroll { max-height: 70vh; } }
.cv-prev-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
.cv-prev-scroll::-webkit-scrollbar-thumb { background: rgba(37,99,235,.3); border-radius: 99px; }

.cv-prev-scale {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
}
#cv-paper {
  background: #fff;
  box-shadow: 0 3px 20px rgba(15,23,42,.16);
  transform-origin: top left;
  flex-shrink: 0;
}

.cv-prev-download {
  background: rgba(255,255,255,.94);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--r) var(--r);
  padding: 10px 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}
`;

export default function Preview({
  cvHtml,
  zoom,
  setZoom,
  fitZoom,
  paperRef,
  prevScrollRef,
  accent,
  setAccent,
  fontId,
  setFontId,
  fontSize,
  setFontSize,
  paper,
  setPaper,
  ACCENTS,
  FONTS,
  FSIZES,
  PAPERS,
  fullName,
  toast,
}) {
  const autoFitAppliedRef = useRef(false);

  const applyAutoFit = useCallback(() => {
    const container = prevScrollRef?.current;
    const paperEl   = paperRef?.current;
    if (!container || !paperEl) return;
    const cw = container.clientWidth - 20;
    const ch = container.clientHeight - 20;
    const pw = paperEl.offsetWidth;
    const ph = paperEl.offsetHeight;
    if (!pw || !ph) return;
    const newZoom = +(Math.min(1.4, Math.max(0.25, Math.min(cw / pw, ch / ph))).toFixed(2));
    if (newZoom !== zoom) setZoom(newZoom);
    autoFitAppliedRef.current = true;
  }, [prevScrollRef, paperRef, zoom, setZoom]);

  useEffect(() => {
    const onResize = () => { if (autoFitAppliedRef.current) applyAutoFit(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyAutoFit]);

  return (
    <>
      <style>{PREVIEW_CSS}</style>

      {/* Controls strip */}
      <div className="cv-prev-ctrls" role="group" aria-label="CV appearance controls">

        {/* Accent colour */}
        <div className="cv-ctrl-row">
          <span className="cv-ctrl-lbl" id="colour-label">Colour</span>
          <div className="cv-dots" role="radiogroup" aria-labelledby="colour-label">
            {ACCENTS.map(c => (
              <button
                key={c}
                type="button"
                className={`cv-dot${accent === c ? " on" : ""}`}
                style={{ background: c }}
                aria-label={`Accent colour ${c}`}
                aria-pressed={accent === c}
                onClick={() => setAccent(c)}
              />
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="cv-ctrl-row">
          <span className="cv-ctrl-lbl" id="font-label">Font</span>
          <div className="cv-tog-g" role="radiogroup" aria-labelledby="font-label">
            {FONTS.map(f => (
              <button
                key={f.id}
                type="button"
                className={`cv-tog${fontId === f.id ? " on" : ""}`}
                aria-pressed={fontId === f.id}
                onClick={() => setFontId(f.id)}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="cv-ctrl-row">
          <span className="cv-ctrl-lbl" id="size-label">Size</span>
          <div className="cv-tog-g" role="radiogroup" aria-labelledby="size-label">
            {Object.keys(FSIZES).map(s => (
              <button
                key={s}
                type="button"
                className={`cv-tog${fontSize === s ? " on" : ""}`}
                aria-pressed={fontSize === s}
                onClick={() => setFontSize(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Paper */}
        <div className="cv-ctrl-row">
          <span className="cv-ctrl-lbl" id="paper-label">Paper</span>
          <div className="cv-tog-g" role="radiogroup" aria-labelledby="paper-label">
            {Object.entries(PAPERS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                className={`cv-tog${paper === key ? " on" : ""}`}
                aria-pressed={paper === key}
                onClick={() => setPaper(key)}
              >
                {val.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom bar */}
      <div className="cv-prev-header">
        <span>Live Preview</span>
        <div className="cv-prev-zoom">
          <button
            className="cv-zoom-btn"
            onClick={() => setZoom(z => Math.max(0.25, +(z - 0.1).toFixed(2)))}
            aria-label="Zoom out"
          >−</button>
          <span
            className="cv-prev-zoom-value"
            aria-live="polite"
            aria-label={`Zoom ${Math.round(zoom * 100)}%`}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="cv-zoom-btn"
            onClick={() => setZoom(z => Math.min(1.4, +(z + 0.1).toFixed(2)))}
            aria-label="Zoom in"
          >+</button>
          <button
            className="cv-zoom-btn"
            style={{ fontSize: ".58rem", width: "auto", padding: "0 7px" }}
            onClick={fitZoom}
            aria-label="Fit to window"
          >Fit</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="cv-prev-scroll" ref={prevScrollRef} aria-label="CV preview" role="region">
        <div className="cv-prev-scale">
          <div
            id="cv-paper"
            ref={paperRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            dangerouslySetInnerHTML={{ __html: cvHtml }}
            aria-label="CV document preview"
          />
        </div>
      </div>

      {/* Download strip */}
      <div className="cv-prev-download">
        <Print
          paperRef={paperRef}
          paper={paper}
          fullName={fullName}
          toast={toast}
        />
      </div>
    </>
  );
}