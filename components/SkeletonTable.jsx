// components/SkeletonTable.jsx
// Table row skeletons for admin/user data tables.

const CSS = `
.skt-wrap { overflow: hidden; border-radius: 12px; }
.skt-shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: skt-shimmer 1.4s infinite;
  border-radius: 5px;
}
@keyframes skt-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skt-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.skt-row:last-child { border-bottom: none; }
.skt-col-sm  { height: 12px; width: 60px;  flex-shrink: 0; }
.skt-col-md  { height: 12px; width: 140px; flex-shrink: 0; }
.skt-col-lg  { height: 12px; flex: 1; }
.skt-col-xs  { height: 20px; width: 50px; border-radius: 10px; flex-shrink: 0; }
`;

export default function SkeletonTable({ rows = 5 }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="skt-wrap" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skt-row">
            <div className="skt-shimmer skt-col-sm" />
            <div className="skt-shimmer skt-col-lg" />
            <div className="skt-shimmer skt-col-md" />
            <div className="skt-shimmer skt-col-xs" />
          </div>
        ))}
      </div>
    </>
  );
}
