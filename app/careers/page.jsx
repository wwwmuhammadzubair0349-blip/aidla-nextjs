import Link from "next/link";
import "./careers.css";
import { SITE } from "@/lib/siteConfig";
import { buildGraph, buildWebPageSchema, buildBreadcrumbSchema } from "@/lib/schemas";

const SITE_URL = SITE.url;

export const metadata = {
  title: "Careers at AIDLA | Build AI Learning & Career Tools",
  description: "Join AIDLA and help build a Pakistan-based AI learning platform. Work on courses, AI tools, career resources, rewards and mentoring. Apply now.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: {
    title: "Careers at AIDLA â€“ Build the Future of Free AI Learning",
    description: "Join AIDLA and help build a Pakistan-based AI learning platform. Work on courses, AI tools, career resources and rewards.",
    type: "website",
    url: `${SITE_URL}/careers`,
    siteName: "AIDLA",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "Careers at AIDLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at AIDLA â€“ Build AI Learning & Career Tools",
    description: "Join AIDLA and work on courses, AI tools, career resources and rewards.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const schema = buildGraph(
  buildWebPageSchema({
    path: "/careers",
    name: "Careers at AIDLA | Build AI Learning & Career Tools",
    description: "Join AIDLA and help build a Pakistan-based AI learning platform. Work on courses, AI tools, career resources, rewards and mentoring. Apply now.",
  }),
  buildBreadcrumbSchema(
    [{ name: "Home", url: "/" }, { name: "Careers", url: "/careers" }],
    "/careers",
  ),
);

const WHY = [
  { icon: "ðŸŽ¯", title: "Real Impact", desc: "Your work helps learners, freshers, professionals, and career switchers access free education and career tools." },
  { icon: "ðŸš€", title: "Fast-Moving Team", desc: "We move quickly, ship often, and trust every team member to own their domain fully." },
  { icon: "ðŸ¤–", title: "AI-First Culture", desc: "We use cutting-edge AI in everything we build â€” and we expect our team to think the same way." },
  { icon: "ðŸª™", title: "Learn & Earn", desc: "We practice what we preach. Grow your skills, earn rewards, and grow with the platform." },
  { icon: "ðŸ“", title: "Remote-Friendly", desc: "Work remotely with a team building from Pakistan for users worldwide. We care about output, not office hours." },
  { icon: "ðŸ’¡", title: "Mission-Driven", desc: "We're not just building a product â€” we're fixing education access for millions of people." },
];

export default function CareersPage() {
  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <main>
      <div className="cr-root">

        {/* â”€â”€ HERO â”€â”€ */}
        <section className="cr-hero">
          <div className="cr-hero-inner">
            <span className="cr-eyebrow">ðŸš€ We&apos;re Growing</span>
            <h1 className="cr-title">
              Help Us Build the Future of<br />
              <em>Free AI Learning.</em>
            </h1>
            <p className="cr-sub">
              AIDLA is on a mission to give learners worldwide access to AI-powered tools, courses, career resources, mentoring, and real rewards. We&apos;re looking for people who care deeply about that mission.
            </p>
            <div className="cr-hero-ctas">
              <a href="mailto:ceo@aidla.online" className="cr-btn-primary">
                Express Your Interest â†’
              </a>
              <Link href="/about" className="cr-btn-ghost">Learn About AIDLA</Link>
            </div>
          </div>
        </section>

        {/* â”€â”€ COMING SOON â”€â”€ */}
        <section className="cr-soon-section">
          <div className="cr-soon-inner">
            <div className="cr-soon-badge">ðŸ”” Openings Coming Soon</div>
            <h2>We&apos;re Preparing Our First Job Listings</h2>
            <p>
              Our team is growing and we&apos;re finalising open roles across engineering,
              content, design, and growth. If you want to be among the first to apply â€”
              send us a short note now.
            </p>
            <a href="mailto:ceo@aidla.online" className="cr-btn-primary" style={{ display: "inline-flex", marginTop: "8px" }}>
              âœ‰ï¸ ceo@aidla.online â€” Get in Early
            </a>
          </div>
        </section>

        {/* â”€â”€ WHY AIDLA â”€â”€ */}
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

        {/* â”€â”€ BOTTOM CTA â”€â”€ */}
        <section className="cr-cta-section">
          <div className="cr-cta-inner">
            <h2>Ready to Build With Us?</h2>
            <p>Send your portfolio, LinkedIn, and a short note about why you want to join AIDLA.</p>
            <a href="mailto:ceo@aidla.online" className="cr-cta-btn">
              Send Your Interest â†’
            </a>
          </div>
        </section>

      </div>
    </main>
    </>
  );
}

`;
