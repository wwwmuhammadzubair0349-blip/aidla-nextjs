"use client";

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import Print from "./Print";
import "./preview.css";

const ICON_STRIP = { email: "Email:", location: "Location:", linkedin: "LinkedIn:", github: "GitHub:", website: "Web:" };

export default function Preview({
  cvHtml,
  paperRef,
  paper,
  PAPERS,
  fullName,
  toast,
  onFieldChange,
  aiRunning = false,
  flashSignal = 0,
}) {
  const [editMode, setEditMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [manualZoom, setManualZoom] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(1);
  const containerRef = useRef(null);

  const pageW = (PAPERS[paper] || PAPERS.a4).w;
  const pageH = (PAPERS[paper] || PAPERS.a4).h;

  const fitAuto = useCallback(() => {
    if (!containerRef.current) return;
    const z = Math.min((containerRef.current.clientWidth - 48) / pageW, (containerRef.current.clientHeight - 48) / pageH, 1.05);
    setZoom(+Math.max(0.24, z).toFixed(3));
    setManualZoom(false);
  }, [pageW, pageH]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => { if (!manualZoom) fitAuto(); });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [fitAuto, manualZoom]);

  useLayoutEffect(() => {
    if (!paperRef.current) return;
    paperRef.current.innerHTML = cvHtml;
    const n = Math.max(1, Math.ceil(Math.max(paperRef.current.scrollHeight, pageH) / pageH));
    setNumPages(n);
    setCurrentPage(p => Math.min(p, n - 1));
  }, [cvHtml, pageH, paperRef]);

  useEffect(() => {
    if (!flashSignal || !containerRef.current) return;
    const el = containerRef.current;
    el.classList.remove("cv-flash");
    void el.offsetWidth;
    el.classList.add("cv-flash");
    const t = setTimeout(() => el.classList.remove("cv-flash"), 1600);
    return () => clearTimeout(t);
  }, [flashSignal]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = e => {
      if (e.key === "ArrowLeft") setCurrentPage(p => Math.max(0, p - 1));
      if (e.key === "ArrowRight") setCurrentPage(p => Math.min(numPages - 1, p + 1));
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [numPages]);

  const handlePreviewInput = useCallback(() => {
    if (!editMode || !onFieldChange) return;
    const node = window.getSelection()?.anchorNode;
    const editedEl = node?.nodeType === 3 ? node.parentElement : node;
    const fieldEl = editedEl?.closest?.("[data-cv-field]");
    if (!fieldEl) return;
    const field = fieldEl.dataset.cvField;
    const article = fieldEl.closest("[data-cv-id]");
    const id = article ? article.dataset.cvId : null;
    let value = field === "bullets"
      ? Array.from(fieldEl.querySelectorAll("li")).map(li => li.textContent.trim()).filter(Boolean).join("\n")
      : fieldEl.textContent.trim();
    if (field !== "bullets" && ICON_STRIP[field]) value = value.replace(new RegExp(`^${ICON_STRIP[field]}\\s*`), "").trim();
    onFieldChange(field, value, id);
  }, [editMode, onFieldChange]);

  const adjustZoom = useCallback(delta => {
    setZoom(z => Math.min(2, Math.max(0.2, +(z + delta).toFixed(2))));
    setManualZoom(true);
  }, []);

  return (
    <div className="cv-preview-shell" style={{ "--cv-page-w": `${pageW}px`, "--cv-page-h": `${pageH}px` }}>
      <div className="cv-prev-header">
        <div className="cv-prev-title">
          <span className="cv-prev-label">Live Preview</span>
          <button type="button" className={`cv-edit-toggle${editMode ? " on" : ""}`} onClick={() => setEditMode(v => !v)} aria-pressed={editMode}>
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
        <div className="cv-prev-zoom">
          <button className="cv-zoom-btn" onClick={() => adjustZoom(-0.05)} aria-label="Zoom out">-</button>
          <span className="cv-prev-zoom-value" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button className="cv-zoom-btn" onClick={() => adjustZoom(+0.05)} aria-label="Zoom in">+</button>
          <button className="cv-zoom-btn cv-zoom-fit" onClick={fitAuto} aria-label="Fit page">Fit</button>
        </div>
      </div>

      <div className="cv-viewport" ref={containerRef} aria-label="CV preview" role="region" tabIndex={0}>
        {aiRunning && <div className="cv-prev-shimmer" aria-hidden="true"><div className="cv-prev-shimmer-bar" /></div>}
        <div className="cv-page-stage" style={{ width: pageW * zoom, height: pageH * zoom }}>
          <div className="cv-page-track" style={{ width: pageW * zoom * numPages, transform: `translateX(-${currentPage * pageW * zoom}px)` }}>
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="cv-page-frame" style={{ width: pageW * zoom, height: pageH * zoom }} aria-hidden={i !== currentPage}>
                <div
                  className="cv-page-slice"
                  contentEditable={editMode && i === currentPage}
                  suppressContentEditableWarning
                  onInput={handlePreviewInput}
                  dangerouslySetInnerHTML={{ __html: cvHtml }}
                  style={{
                    width: pageW,
                    minHeight: Math.max(pageH, numPages * pageH),
                    transform: `scale(${zoom}) translateY(-${i * pageH}px)`,
                    transformOrigin: "top center",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div id="cv-paper" ref={paperRef} style={{ width: pageW, minHeight: pageH }} aria-hidden="true" />
      </div>

      {numPages > 1 && (
        <div className="cv-page-nav" role="group" aria-label="Page navigation">
          <button className="cv-page-btn" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} aria-label="Previous page">←</button>
          <span className="cv-page-indicator" aria-live="polite">Page {currentPage + 1} of {numPages}</span>
          <button className="cv-page-btn" onClick={() => setCurrentPage(p => Math.min(numPages - 1, p + 1))} disabled={currentPage === numPages - 1} aria-label="Next page">→</button>
        </div>
      )}

      <div className="cv-prev-download">
        <Print paperRef={paperRef} paper={paper} fullName={fullName} toast={toast} />
      </div>
    </div>
  );
}
