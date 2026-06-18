// components/ui/StatCard.jsx
// Single metric stat card with icon, value, label, optional trend indicator.

const CSS = `
.sc-card {
  background: #fff;
  border: 1px solid rgba(226,232,240,0.8);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(15,23,42,0.05);
}
.sc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sc-icon {
  font-size: 1.25rem;
  line-height: 1;
}
.sc-trend {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}
.sc-trend-up   { background: #dcfce7; color: #15803d; }
.sc-trend-down { background: #fee2e2; color: #b91c1c; }
.sc-trend-flat { background: #f1f5f9; color: #64748b; }
.sc-value {
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.sc-label {
  font-size: 0.77rem;
  color: #64748b;
  font-weight: 600;
}
`;

export default function StatCard({ icon, value, label, trend }) {
  const trendClass = !trend ? "" : trend.direction === "up" ? "sc-trend-up" : trend.direction === "down" ? "sc-trend-down" : "sc-trend-flat";
  const trendSymbol = !trend ? "" : trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";

  return (
    <>
      <style>{CSS}</style>
      <div className="sc-card">
        <div className="sc-top">
          <span className="sc-icon" aria-hidden="true">{icon}</span>
          {trend && (
            <span className={`sc-trend ${trendClass}`}>
              {trendSymbol} {trend.value}
            </span>
          )}
        </div>
        <div className="sc-value">{value}</div>
        <div className="sc-label">{label}</div>
      </div>
    </>
  );
}
