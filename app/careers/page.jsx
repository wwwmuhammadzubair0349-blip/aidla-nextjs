import Link from "next/link";
import { SITE } from "@/lib/siteConfig";

const SITE_URL = SITE.url;

export const metadata = {
  title: "Careers at AIDLA | Join Pakistan's #1 AI Learning Platform",
  description: "Join the AIDLA team and help build Pakistan's leading free AI-powered digital learning academy. Opportunities in engineering, education, design, and growth.",
  alternates: { canonical: `${SITE_URL}/careers` },
};

const WHY = [
  { icon: "🎯", title: "Real Impact", desc: "Your work directly helps thousands of Pakistani students access free education and career tools." },
  { icon: "🚀", title: "Fast-Moving Team", desc: "We move quickly, ship often, and trust every team member to own their domain fully." },
  { icon: "🤖", title: "AI-First Culture", desc: "We use cutting-edge AI in everything we build — and we expect our team to think the same way." },
  { icon: "🪙", title: "Learn & Earn", desc: "We practice what we preach. Grow your skills, earn rewards, and grow with the platform." },
  { icon: "📍", title: "Remote-Friendly", desc: "Work from anywhere in Pakistan. We care about output, not office hours." },
  { icon: "💡", title: "Mission-Driven", desc: "We're not just building a product — we're fixing education access for millions of people." },
];

export default function CareersPage() {
  return (
    <main>
      <style>{CSS}</style>
      <div className="cr-root">

        {/* ── HERO ── */}
        <section className="cr-hero">
          <div className="cr-hero-inner">
            <span className="cr-eyebrow">🚀 We&apos;re Growing</span>
            <h1 className="cr-title">
              Help Us Build the Future of<br />
              <em>Free Education in Pakistan.</em>
            </h1>
            <p className="cr-sub">
              AIDLA is on a mission to give every Pakistani student access to
              world-class AI-powered tools, courses, and real rewards — completely
              free. We&apos;re looking for people who care deeply about that mission.
            </p>
            <div className="cr-hero-ctas">
              <a href="mailto:ceo@aidla.online" className="cr-btn-primary">
                Express Your Interest →
              </a>
              <Link href="/about" className="cr-btn-ghost">Learn About AIDLA</Link>
            </div>
          </div>
        </section>

        {/* ── COMING SOON ── */}
        <section className="cr-soon-section">
          <div className="cr-soon-inner">
            <div className="cr-soon-badge">🔔 Openings Coming Soon</div>
            <h2>We&apos;re Preparing Our First Job Listings</h2>
            <p>
              Our team is growing and we&apos;re finalising open roles across engineering,
              content, design, and growth. If you want to be among the first to apply —
              send us a short note now.
            </p>
            <a href="mailto:ceo@aidla.online" className="cr-btn-primary" style={{ display: "inline-flex", marginTop: "8px" }}>
              ✉️ ceo@aidla.online — Get in Early
            </a>
          </div>
        </section>

        {/* ── WHY AIDLA ── */}
        <section className="cr-why-section">
          <div className="cr-why-inner">
            <div className="cr-why-head">
              <span className="cr-eyebrow-dark">Why Join Us</span>
              <h2>What Makes AIDLA Different</h2>
              <p>We&apos;re not just another startup. We&apos;re building something that genuinely matters.</p>
            </div>
            <div className="cr-why-grid">
              {WHY.map((item) => (
                <div key={item.title} className="cr-why-card">
                  <span className="cr-why-icon" aria-hidden="true">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="cr-cta-section">
          <div className="cr-cta-inner">
            <h2>Ready to Build With Us?</h2>
            <p>Send your portfolio, LinkedIn, and a short note about why you want to join AIDLA.</p>
            <a href="mailto:ceo@aidla.online" className="cr-cta-btn">
              Send Your Interest →
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}

const CSS = `
.cr-root {
  background: #fff;
  color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── EYEBROW ── */
.cr-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  padding: 6px 16px;
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 999px;
  color: #d97706;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.cr-eyebrow-dark {
  display: block;
  margin-bottom: 8px;
  color: #d97706;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* ── HERO ── */
.cr-hero {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%);
  padding: clamp(56px,8vw,100px) clamp(20px,5vw,48px);
  text-align: center;
  border-bottom: 1px solid #f0c96a;
}
.cr-hero-inner { max-width: 760px; margin: 0 auto; }
.cr-title {
  margin: 0 0 16px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 5.5vw, 3.8rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #0f172a;
}
.cr-title em { font-style: italic; color: #d97706; }
.cr-sub {
  margin: 0 0 28px;
  color: rgba(15,23,42,0.7);
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  line-height: 1.72;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.cr-hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }

/* ── BUTTONS ── */
.cr-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 28px;
  min-height: 50px;
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(245,158,11,0.35);
  transition: background 0.18s, transform 0.18s;
}
.cr-btn-primary:hover { background: #d97706; transform: translateY(-2px); }
.cr-btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  min-height: 50px;
  border-radius: 999px;
  background: rgba(255,255,255,0.55);
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid rgba(15,23,42,0.2);
  transition: border-color 0.18s, background 0.18s;
}
.cr-btn-ghost:hover { border-color: #0f172a; background: rgba(255,255,255,0.85); }

/* ── COMING SOON ── */
.cr-soon-section {
  padding: clamp(56px,8vw,88px) clamp(20px,5vw,48px);
  text-align: center;
  background: #fff;
}
.cr-soon-inner { max-width: 640px; margin: 0 auto; }
.cr-soon-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #0f172a;
  color: #f59e0b;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 24px;
}
.cr-soon-inner h2 {
  margin: 0 0 14px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.15;
}
.cr-soon-inner p {
  margin: 0 0 8px;
  color: #475569;
  font-size: 0.97rem;
  line-height: 1.72;
}

/* ── WHY SECTION ── */
.cr-why-section {
  background: #f8fafc;
  padding: clamp(56px,8vw,88px) clamp(20px,5vw,48px);
}
.cr-why-inner { max-width: 1140px; margin: 0 auto; }
.cr-why-head { text-align: center; max-width: 560px; margin: 0 auto clamp(32px,4vw,48px); }
.cr-why-head h2 {
  margin: 6px 0 10px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
}
.cr-why-head p { margin: 0; color: #475569; font-size: 0.97rem; line-height: 1.7; }
.cr-why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 16px;
}
.cr-why-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
}
.cr-why-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.09); transform: translateY(-3px); border-color: rgba(245,158,11,0.3); }
.cr-why-icon { display: block; font-size: 1.8rem; margin-bottom: 12px; }
.cr-why-card h3 { margin: 0 0 6px; font-family: 'Playfair Display', serif; font-size: 1.02rem; font-weight: 800; color: #0f172a; }
.cr-why-card p { margin: 0; font-size: 0.88rem; color: #475569; line-height: 1.68; }

/* ── BOTTOM CTA ── */
.cr-cta-section {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: clamp(48px,6vw,72px) clamp(20px,5vw,48px);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.cr-cta-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}
.cr-cta-inner { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; }
.cr-cta-inner h2 {
  margin: 0 0 12px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
}
.cr-cta-inner p { margin: 0 0 24px; color: rgba(15,23,42,0.7); font-size: 0.97rem; line-height: 1.65; }
.cr-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 32px;
  min-height: 52px;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 0.97rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(15,23,42,0.25);
  transition: background 0.18s, transform 0.18s;
}
.cr-cta-btn:hover { background: #1e293b; transform: translateY(-2px); }

@media (max-width: 480px) {
  .cr-hero-ctas { flex-direction: column; align-items: center; }
  .cr-btn-primary, .cr-btn-ghost { width: 100%; justify-content: center; }
}
`;
