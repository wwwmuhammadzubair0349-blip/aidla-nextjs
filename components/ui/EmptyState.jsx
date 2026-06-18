// components/ui/EmptyState.jsx
// Branded empty state with icon, message, and optional CTA.
// Use wherever a list, table, or section has no data.

const CSS = `
.es-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  gap: 12px;
}
.es-icon {
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: 4px;
}
.es-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}
.es-desc {
  font-size: 0.83rem;
  color: #64748b;
  font-weight: 500;
  max-width: 320px;
  line-height: 1.5;
  margin: 0;
}
.es-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 9px 18px;
  background: linear-gradient(135deg, #1a3a8f, #3b82f6);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  transition: filter 0.15s;
}
.es-action:hover { filter: brightness(1.1); }
`;

export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="es-wrap" role="status">
        <div className="es-icon" aria-hidden="true">{icon}</div>
        {title && <p className="es-title">{title}</p>}
        {description && <p className="es-desc">{description}</p>}
        {action && (
          action.href
            ? <a href={action.href} className="es-action">{action.label}</a>
            : <button onClick={action.onClick} className="es-action">{action.label}</button>
        )}
      </div>
    </>
  );
}
