// components/SkeletonCard.jsx
// Single card skeleton — use in lists while data loads.

const CSS = `
.skc-card {
  background: #fff;
  border: 1px solid rgba(226,232,240,0.6);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.skc-shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: skc-shimmer 1.4s infinite;
  border-radius: 6px;
  flex-shrink: 0;
}
@keyframes skc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skc-icon   { width: 40px; height: 40px; border-radius: 10px; }
.skc-body   { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skc-title  { height: 14px; width: 65%; }
.skc-sub    { height: 11px; width: 85%; }
`;

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      <style>{CSS}</style>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skc-card" aria-hidden="true">
          <div className="skc-shimmer skc-icon" />
          <div className="skc-body">
            <div className="skc-shimmer skc-title" />
            <div className="skc-shimmer skc-sub" />
          </div>
        </div>
      ))}
    </>
  );
}
