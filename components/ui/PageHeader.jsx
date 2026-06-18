// components/ui/PageHeader.jsx
// Standard page header — title, optional subtitle, optional action button.
// Use at the top of every admin and user page for visual consistency.

const CSS = `
.ph-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.ph-text {}
.ph-title {
  font-size: clamp(1.1rem, 3vw, 1.45rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 4px;
}
.ph-subtitle {
  font-size: 0.83rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}
.ph-action {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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
.ph-action:hover { filter: brightness(1.1); }
`;

export default function PageHeader({ title, subtitle, action }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="ph-wrap">
        <div className="ph-text">
          <h1 className="ph-title">{title}</h1>
          {subtitle && <p className="ph-subtitle">{subtitle}</p>}
        </div>
        {action && (
          action.href
            ? <a href={action.href} className="ph-action">{action.label}</a>
            : <button onClick={action.onClick} className="ph-action">{action.label}</button>
        )}
      </div>
    </>
  );
}
