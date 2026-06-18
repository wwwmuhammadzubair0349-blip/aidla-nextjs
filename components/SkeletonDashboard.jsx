// components/SkeletonDashboard.jsx
// Full-page skeleton shown while auth resolves on /user/* pages.
// Uses CSS shimmer animation — no JS, no dependencies, no layout shift.

const CSS = `
.skd-wrap {
  padding: clamp(14px,3vw,32px);
  font-family: 'DM Sans', system-ui, sans-serif;
  animation: skd-fadein 0.2s ease both;
}
@keyframes skd-fadein { from { opacity:0; } to { opacity:1; } }

.skd-shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: skd-shimmer 1.4s infinite;
  border-radius: 8px;
}
@keyframes skd-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skd-header   { height: 28px; width: 38%; margin-bottom: 8px; }
.skd-subheader{ height: 14px; width: 55%; margin-bottom: 28px; }

.skd-hero-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}
.skd-hero-card {
  height: 140px;
  border-radius: 22px;
}

.skd-section-label { height: 10px; width: 18%; margin-bottom: 12px; }
.skd-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}
.skd-reg-card  { height: 64px; border-radius: 16px; }

@media (max-width: 640px) {
  .skd-hero-card { height: 110px; }
  .skd-reg-card  { height: 56px; }
}
`;

export default function SkeletonDashboard() {
  return (
    <>
      <style>{CSS}</style>
      <div className="skd-wrap" aria-hidden="true">
        <div className="skd-shimmer skd-header" />
        <div className="skd-shimmer skd-subheader" />

        <div className="skd-hero-row">
          <div className="skd-shimmer skd-hero-card" />
          <div className="skd-shimmer skd-hero-card" />
        </div>

        <div className="skd-shimmer skd-section-label" />
        <div className="skd-cards-grid">
          {[0,1,2,3].map(i => <div key={i} className="skd-shimmer skd-reg-card" />)}
        </div>

        <div className="skd-shimmer skd-section-label" />
        <div className="skd-cards-grid">
          {[0,1].map(i => <div key={i} className="skd-shimmer skd-reg-card" />)}
        </div>

        <div className="skd-shimmer skd-section-label" />
        <div className="skd-cards-grid">
          {[0,1,2,3].map(i => <div key={i} className="skd-shimmer skd-reg-card" />)}
        </div>
      </div>
    </>
  );
}
