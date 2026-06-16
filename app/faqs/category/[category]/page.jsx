// app/faqs/category/[category]/page.jsx
import { notFound }    from "next/navigation";
import { serverFetch } from "@/lib/supabaseServer";
import Link            from "next/link";
import {
  buildGraph,
  buildFAQSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/schemas";

export const revalidate = 3600;

const SITE_URL = "https://www.aidla.online";

const CATEGORY_META = {
  pakistan_boards:       { label: "Pakistan Boards",          desc: "Answers to the most common questions about BISE boards, matric, intermediate results, date sheets, and board exams in Pakistan." },
  university_admissions: { label: "University Admissions",    desc: "FAQs about HEC, entry tests, merit lists, NUST, LUMS, IBA, and university admission processes in Pakistan and abroad." },
  css_pms:               { label: "CSS & PMS Exams",          desc: "Common questions about CSS and PMS competitive exam preparation, eligibility, syllabus, FPSC and PPSC processes." },
  scholarships:          { label: "Scholarships",             desc: "Answers to common scholarship questions — HEC scholarships, Ehsaas, study abroad funding, and merit-based awards for students worldwide." },
  study_abroad:          { label: "Study Abroad",             desc: "FAQs about studying in the UK, US, Canada, Australia — visas, admissions, funding, IELTS requirements, and application timelines." },
  technology:            { label: "Technology",               desc: "Common questions about software development, IT careers, programming languages, tech tools, and breaking into the digital industry." },
  ai_tools:              { label: "AI Tools",                 desc: "FAQs about ChatGPT, AI writing tools, prompt engineering, AI for students and professionals, and using AI in your daily workflow." },
  health:                { label: "Health & Wellness",        desc: "Common questions about student health, mental wellbeing, productivity habits, exercise routines, and maintaining a healthy study lifestyle." },
  education:             { label: "Education",                desc: "FAQs about online learning, study strategies, certifications, degrees, and how to get the most from modern education platforms worldwide." },
  finance:               { label: "Finance & Money",          desc: "Common questions about personal finance, budgeting, student loans, freelance income, investing, and financial planning for young professionals." },
  job_search:            { label: "Job Search",               desc: "FAQs about writing CVs, navigating job portals, optimizing LinkedIn, interview preparation, and landing your first or next job." },
  freelancing:           { label: "Freelancing",              desc: "Common questions about Upwork, Fiverr, remote freelance work, client proposals, pricing strategies, and building a sustainable freelance career." },
  remote_work:           { label: "Remote Work",              desc: "FAQs about work-from-home jobs, remote job portals, productivity for distributed teams, and building a remote career from anywhere in the world." },
  career_growth:         { label: "Career Growth",            desc: "Common questions about professional development, skill-building, promotions, career switching, salary negotiation, and long-term career strategy." },
  coins_rewards:         { label: "Coins & Rewards",          desc: "FAQs about AIDLA Coins, how to earn rewards on the platform, the wallet system, redemption options, and coin withdrawal rules." },
  general:               { label: "General",                  desc: "General frequently asked questions about the AIDLA platform — how it works, what's free, features, and how to get started." },
  tests_quizzes:         { label: "Tests & Quizzes",          desc: "Common questions about AIDLA's daily quiz competitions, how scoring works, the leaderboard, and how to win prizes." },
  lucky_draw:            { label: "Lucky Draw",               desc: "FAQs about AIDLA's lucky draw and lucky wheel — prizes, eligibility, how winners are selected, and how to participate." },
  account_profile:       { label: "Account & Profile",        desc: "Common questions about creating an AIDLA account, updating your profile, managing account settings, and fixing login issues." },
  withdrawals:           { label: "Withdrawals",              desc: "FAQs about withdrawing AIDLA Coins — supported payment methods, minimum thresholds, processing times, and withdrawal conditions." },
  career:                { label: "Career",                   desc: "Common career questions — job search strategies, resume tips, interview advice, salary negotiation, and long-term professional growth." },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META);

function toDbCategory(slug) { return slug.replace(/-/g, "_"); }
function toUrlSlug(cat)     { return cat.replace(/_/g, "-"); }

function stripHtml(v = "") {
  return v.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateStaticParams() {
  return ALL_CATEGORIES.map(cat => ({ category: toUrlSlug(cat) }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const dbCat = toDbCategory(category);
  const meta  = CATEGORY_META[dbCat];
  if (!meta) return { title: "FAQs | AIDLA", robots: { index: false, follow: true } };

  const title = `${meta.label} FAQs — Questions & Answers | AIDLA`;
  const url   = `${SITE_URL}/faqs/category/${category}`;

  return {
    title,
    description: meta.desc,
    keywords:    `${meta.label.toLowerCase()} FAQs, ${meta.label.toLowerCase()} questions answers, AIDLA FAQs`,
    alternates:  { canonical: url },
    openGraph: {
      title, description: meta.desc, url, siteName: "AIDLA", type: "website",
      images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: `${meta.label} FAQs — AIDLA` }],
    },
    twitter: { card: "summary_large_image", title, description: meta.desc, images: [`${SITE_URL}/og-home.jpg`] },
  };
}

export default async function FaqCategoryPage({ params }) {
  const { category } = await params;
  const dbCat = toDbCategory(category);
  const meta  = CATEGORY_META[dbCat];
  if (!meta) notFound();

  const { data: rawFaqs } = await serverFetch("faqs", {
    select:     "id,question,answer,slug,helpful_yes",
    status:     "eq.published",
    is_visible: "eq.true",
    category:   `eq.${dbCat}`,
    order:      "helpful_yes.desc,created_at.asc",
    limit:      "30",
  });

  const faqs = (rawFaqs || []).map(f => ({ ...f, answer: stripHtml(f.answer) }));
  const urlPath = `/faqs/category/${category}`;

  const jsonLd = buildGraph(
    buildWebPageSchema({ path: urlPath, name: `${meta.label} FAQs`, description: meta.desc }),
    buildBreadcrumbSchema(
      [{ name: "Home", url: "/" }, { name: "FAQs", url: "/faqs" }, { name: meta.label, url: urlPath }],
      urlPath,
    ),
    faqs.length ? buildFAQSchema(faqs, urlPath) : null,
  );

  const siblings = ALL_CATEGORIES.filter(c => c !== dbCat);

  return (
    <>
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="faq-cat-root">
        <nav aria-label="Breadcrumb" className="faq-cat-breadcrumb">
          <Link href="/">Home</Link> / <Link href="/faqs">FAQs</Link> / <span>{meta.label}</span>
        </nav>

        <header className="faq-cat-header">
          <h1>{meta.label} — Frequently Asked Questions</h1>
          <p>{meta.desc}</p>
          <Link href="/faqs" className="faq-cat-back">← All FAQ categories</Link>
        </header>

        {faqs.length === 0 ? (
          <div className="faq-cat-empty">
            <p>No FAQs yet in this category.</p>
            <Link href="/faqs">Browse all FAQs →</Link>
          </div>
        ) : (
          <>
            <p className="faq-cat-count">{faqs.length} question{faqs.length !== 1 ? "s" : ""} answered</p>
            <div className="faq-cat-list">
              {faqs.map((faq, idx) => (
                <details key={faq.id} className="faq-cat-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <summary className="faq-cat-summary" itemProp="name">
                    <span>{faq.question}</span>
                    <span className="faq-cat-chevron" aria-hidden="true">+</span>
                  </summary>
                  <div className="faq-cat-body" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p itemProp="text">{faq.answer}</p>
                    {faq.slug && (
                      <Link href={`/faqs/${faq.slug}`} className="faq-cat-readmore">Read full answer →</Link>
                    )}
                  </div>
                </details>
              ))}
            </div>

            <div className="faq-cat-cta">
              <p>Have more questions? Browse all FAQ categories or try AIDLA&apos;s free AI tools.</p>
              <div className="faq-cat-cta-btns">
                <Link href="/faqs">All FAQs</Link>
                <Link href="/tools" className="faq-cat-cta-ghost">AI Tools →</Link>
              </div>
            </div>
          </>
        )}

        <section className="faq-cat-siblings" aria-label="Other FAQ categories">
          <h2>More FAQ Categories</h2>
          <div className="faq-cat-tags">
            {siblings.map(c => (
              <Link key={c} href={`/faqs/category/${toUrlSlug(c)}`} className="faq-cat-tag">
                {CATEGORY_META[c].label}
              </Link>
            ))}
          </div>
        </section>

        <style>{`
          .faq-cat-root { max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
          .faq-cat-breadcrumb { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; }
          .faq-cat-breadcrumb a { color: #64748b; text-decoration: none; }
          .faq-cat-breadcrumb a:hover { color: #6366f1; }
          .faq-cat-header { margin-bottom: 2.5rem; }
          .faq-cat-header h1 { font-size: clamp(1.5rem,4vw,2rem); font-weight: 700; color: #0f172a; margin-bottom: 0.75rem; }
          .faq-cat-header p { color: #475569; font-size: 1rem; line-height: 1.7; max-width: 640px; margin-bottom: 1rem; }
          .faq-cat-back { font-size: 0.875rem; color: #6366f1; text-decoration: none; }
          .faq-cat-count { color: #64748b; font-size: 0.875rem; margin-bottom: 1.25rem; }
          .faq-cat-list { border-top: 1px solid #e2e8f0; }
          .faq-cat-item { border-bottom: 1px solid #e2e8f0; }
          .faq-cat-summary { cursor: pointer; padding: 1.1rem 0.5rem; font-weight: 600; font-size: 1rem; color: #0f172a; list-style: none; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
          .faq-cat-summary::-webkit-details-marker { display: none; }
          .faq-cat-chevron { font-size: 1.25rem; flex-shrink: 0; color: #6366f1; margin-top: 0.1rem; transition: transform 0.2s; }
          details[open] .faq-cat-chevron { transform: rotate(45deg); }
          .faq-cat-body { padding: 0 0.5rem 1.25rem; }
          .faq-cat-body p { color: #475569; line-height: 1.75; margin: 0; }
          .faq-cat-readmore { display: inline-block; margin-top: 0.75rem; font-size: 0.875rem; color: #6366f1; text-decoration: none; }
          .faq-cat-empty { text-align: center; padding: 3rem 0; color: #64748b; }
          .faq-cat-empty a { color: #6366f1; text-decoration: none; display: block; margin-top: 0.5rem; }
          .faq-cat-cta { margin-top: 3rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; text-align: center; }
          .faq-cat-cta p { color: #475569; margin-bottom: 1rem; }
          .faq-cat-cta-btns { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
          .faq-cat-cta-btns a:first-child { padding: 0.5rem 1.25rem; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-size: 0.875rem; }
          .faq-cat-cta-ghost { padding: 0.5rem 1.25rem; border: 1px solid #e2e8f0; color: #475569; border-radius: 8px; text-decoration: none; font-size: 0.875rem; }
          .faq-cat-siblings { margin-top: 3rem; }
          .faq-cat-siblings h2 { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem; }
          .faq-cat-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
          .faq-cat-tag { padding: 0.375rem 0.875rem; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 0.8rem; color: #475569; text-decoration: none; transition: border-color 0.15s, color 0.15s; }
          .faq-cat-tag:hover { border-color: #6366f1; color: #6366f1; }
        `}</style>
      </main>
    </>
  );
}
