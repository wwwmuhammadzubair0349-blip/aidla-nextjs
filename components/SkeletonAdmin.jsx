// components/SkeletonAdmin.jsx
// Admin panel skeleton — sidebar + content area shimmer.

const CSS = `
.ska-wrap {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.ska-shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: ska-shimmer 1.4s infinite;
  border-radius: 8px;
}
@keyframes ska-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.ska-sidebar {
  width: 286px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #dbe5f3;
  padding: 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ska-brand { height: 28px; width: 120px; }
.ska-nav-group { display: flex; flex-direction: column; gap: 8px; }
.ska-nav-label { height: 8px; width: 60px; margin-bottom: 4px; }
.ska-nav-item  { height: 34px; width: 100%; }
.ska-content {
  flex: 1;
  padding: 22px;
  background: #f6f8fc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ska-page-title { height: 22px; width: 30%; }
.ska-stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.ska-stat-card { height: 80px; border-radius: 14px; }
.ska-table-area { flex: 1; border-radius: 16px; }
@media (max-width: 1080px) {
  .ska-sidebar { display: none; }
}
`;

export default function SkeletonAdmin() {
  return (
    <>
      <style>{CSS}</style>
      <div className="ska-wrap" aria-hidden="true">
        <aside className="ska-sidebar">
          <div className="ska-shimmer ska-brand" />
          {[0,1,2].map(g => (
            <div key={g} className="ska-nav-group">
              <div className="ska-shimmer ska-nav-label" />
              {[0,1,2].map(i => <div key={i} className="ska-shimmer ska-nav-item" />)}
            </div>
          ))}
        </aside>
        <main className="ska-content">
          <div className="ska-shimmer ska-page-title" />
          <div className="ska-stat-row">
            {[0,1,2,3].map(i => <div key={i} className="ska-shimmer ska-stat-card" />)}
          </div>
          <div className="ska-shimmer ska-table-area" />
        </main>
      </div>
    </>
  );
}
