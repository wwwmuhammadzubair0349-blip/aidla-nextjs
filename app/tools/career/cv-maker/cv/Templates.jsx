"use client";
// app/tools/career/cv-maker/cv/Templates.jsx
// Change from original: added "use client" directive only.
// All logic, CSS, and rendering is identical to the original.

const TEMPLATES_CSS = `
.cv-tmpl-panel {
  background: rgba(255,255,255,.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.6);
  box-shadow: 0 10px 40px -10px rgba(15,23,42,.08);
  padding: 16px;
  width: 100%;
}
@media (min-width: 640px) { .cv-tmpl-panel { padding: 20px; } }

.cv-panel-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 8px;
  flex-wrap: wrap;
}
.cv-panel-t {
  font-family: 'Sora', sans-serif;
  font-size: .95rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -.02em;
}
.cv-cur-lbl {
  font-size: .72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 99px;
  padding: 4px 12px;
  box-shadow: 0 4px 12px rgba(37,99,235,.25);
  white-space: nowrap;
}

.cv-cat-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.cv-cat-btn {
  padding: 5px 13px;
  border-radius: 99px;
  border: 1px solid rgba(15,23,42,.1);
  background: #fff;
  color: #475569;
  font-size: .72rem;
  font-weight: 700;
  transition: all .18s;
  cursor: pointer;
  min-height: 32px;
  -webkit-tap-highlight-color: transparent;
}
.cv-cat-btn:hover { background: #f8fafc; transform: translateY(-1px); }
.cv-cat-btn.on {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15,23,42,.2);
}
.cv-cat-btn:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }

.cv-tmpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}
@media (min-width: 400px) {
  .cv-tmpl-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
}

.cv-tmpl-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 10px;
  border-radius: 14px;
  border: 2px solid transparent;
  background: linear-gradient(to bottom, #fff, #f8fafc);
  box-shadow: 0 4px 15px rgba(0,0,0,.04);
  transition: all .22s cubic-bezier(.4,0,.2,1);
  cursor: pointer;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}
.cv-tmpl-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 24px rgba(15,23,42,.08);
}
.cv-tmpl-card:active { transform: scale(.97); }
.cv-tmpl-card.on {
  background: #fff;
  border-color: transparent;
  box-shadow: 0 0 0 3px var(--ac, #3b82f6), 0 8px 22px rgba(59,130,246,.18);
}
.cv-tmpl-card:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
.cv-tmpl-thumb svg {
  display: block;
  height: 62px;
  width: auto;
  filter: drop-shadow(0 3px 5px rgba(0,0,0,.06));
  transition: transform .28s ease;
}
.cv-tmpl-card:hover .cv-tmpl-thumb svg { transform: scale(1.07); }
.cv-tmpl-lbl {
  font-size: .66rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  line-height: 1.3;
}
`;

function renderThumbSvg(template, accent) {
  const body = typeof template.thumb === "function" ? template.thumb(accent) : "";
  return `<svg viewBox="0 0 62 82" xmlns="http://www.w3.org/2000/svg" height="62" aria-hidden="true" focusable="false">
    ${body || `
      <rect width="62" height="82" rx="4" fill="#fff"/>
      <rect x="0" y="0" width="62" height="6" fill="${accent}"/>
      <rect x="8" y="14" width="26" height="4" rx="2" fill="#0f172a"/>
      <rect x="8" y="22" width="18" height="2" rx="1" fill="#94a3b8"/>
      <rect x="8" y="34" width="46" height="1.5" rx=".75" fill="#e2e8f0"/>
      <rect x="8" y="40" width="38" height="1.5" rx=".75" fill="#e2e8f0"/>
      <rect x="8" y="52" width="20" height="2" rx="1" fill="#0f172a"/>
      <rect x="8" y="58" width="46" height="1.5" rx=".75" fill="#e2e8f0"/>
    `}
  </svg>`;
}

export default function Templates({
  currentTemplate,
  setTemplate,
  accent,
  activeCat,
  setActiveCat,
  TEMPLATES,
  CATS,
}) {
  const visibleTemplates = activeCat === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.cat === activeCat);

  const currentLabel = (TEMPLATES.find(t => t.id === currentTemplate) || { l: currentTemplate }).l;

  return (
    <>
      <style>{TEMPLATES_CSS}</style>
      <div className="cv-tmpl-panel">
        <div className="cv-panel-h">
          <span className="cv-panel-t">🌟 Premium Templates</span>
          <span className="cv-cur-lbl" aria-live="polite">{currentLabel}</span>
        </div>

        <div className="cv-cat-row" role="group" aria-label="Filter templates by category">
          {CATS.map(cat => (
            <button
              key={cat}
              type="button"
              className={`cv-cat-btn${activeCat === cat ? " on" : ""}`}
              aria-pressed={activeCat === cat}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="cv-tmpl-grid" role="list" aria-label="CV templates">
          {visibleTemplates.map(t => (
            <button
              key={t.id}
              type="button"
              role="listitem"
              className={`cv-tmpl-card${currentTemplate === t.id ? " on" : ""}`}
              style={{ "--ac": accent }}
              aria-pressed={currentTemplate === t.id}
              aria-label={`Select ${t.l} template${currentTemplate === t.id ? " (currently selected)" : ""}`}
              onClick={() => setTemplate(t.id)}
            >
              <span
                className="cv-tmpl-thumb"
                dangerouslySetInnerHTML={{ __html: renderThumbSvg(t, accent) }}
              />
              <span className="cv-tmpl-lbl">{t.l}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}