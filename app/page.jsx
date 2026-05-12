// app/page.jsx
import {
  buildGraph, buildEducationalOrgSchema,
  buildWebPageSchema, buildBreadcrumbSchema,
  buildHowToSchema,
} from "@/lib/schemas";
import { SITE } from "@/lib/siteConfig";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewsSection from "@/components/ReviewsSection";

const SITE_URL = SITE.url;
const LAST_MODIFIED = "2026-05-09";
export const revalidate = 3600;

export const metadata = {
  title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
  description:
    "AIDLA is Pakistan's #1 AI learning platform. Free courses, AI tools, quizzes, AIDLA Coins, rewards, CV builder and cover letter maker for global learners.",
  keywords: [
    "AIDLA","Pakistan #1 AI powered learning platform","global AI learning platform",
    "online courses","AI tools","career tools","career switching","freshers CV builder",
    "cover letter maker","data analytics courses","AI for beginners","AI engineer courses",
    "startup advice","career mentoring","AIDLA coins","learn and earn",
  ],
  authors: [{ name: "AIDLA", url: SITE_URL }],
  creator: "AIDLA",
  publisher: "AIDLA",
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: { "en-PK": `${SITE_URL}/`, "en-US": `${SITE_URL}/`, "x-default": `${SITE_URL}/` },
  },
  openGraph: {
    type: "website", siteName: "AIDLA", locale: "en_PK", url: `${SITE_URL}/`,
    title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
    description: "Free courses, AI tools, career resources, quizzes, AIDLA Coins and rewards for learners, professionals, freshers and career switchers worldwide.",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630, alt: "AIDLA free AI learning and rewards platform", type: "image/jpeg" }],
  },
  twitter: {
    card: "summary_large_image", site: "@AIDLA_online", creator: "@AIDLA_online",
    title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
    description: "Learn with free courses, AI tools, career resources, quizzes, daily competitions and AIDLA Coins.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

/* ─── Static data ─────────────────────────────────────── */

const PLATFORM_STATS = [
  { value: "500+",    label: "Registered Learners",  icon: "👨‍🎓" },
  { value: "10,000+", label: "AIDLA Coins Distributed", icon: "🪙" },
  { value: "100%",    label: "Free to Join",          icon: "🎁" },
  { value: "#1",      label: "AI Platform from Pakistan", icon: "🏆" },
];

const TRUST_ITEMS = [
  "✦ Curriculum Quizzes",
  "✦ Daily Quiz Winners",
  "✦ AI Career Tools",
  "✦ AIDLA Coins & Rewards",
  "✦ Wallet & Shop",
  "✦ Mobile Friendly",
  "✦ 100% Free",
  "✦ Global Access",
];

const STEPS = [
  {
    num: "01",
    title: "Learn",
    text: "Take quizzes, courses, and practice activities built for learners, professionals, freshers, and career switchers worldwide.",
    icon: "📖",
    color: "#f59e0b",
  },
  {
    num: "02",
    title: "Earn",
    text: "Collect AIDLA Coins as you complete learning actions and build daily momentum.",
    icon: "🪙",
    color: "#10b981",
  },
  {
    num: "03",
    title: "Redeem",
    text: "Use your coins for platform rewards, prizes, and future learner benefits.",
    icon: "🎁",
    color: "#3b82f6",
  },
];

const FEATURES = [
  { emoji: "🎯", title: "Daily Quizz", text: "Compete every day, see yesterday's winners, and earn coins for consistent learning.", href: "/user/dailyquizz", label: "Play daily quiz" },
  { emoji: "📚", title: "Courses & Resources", text: "Structured courses and study resources for learners who want clear next steps.", href: "/courses", label: "Browse courses" },
  { emoji: "🤖", title: "AI Career Tools", text: "CV, cover letter, summarizer, paraphraser, interview prep, email writer, and more.", href: "/tools", label: "Open tools" },
  { emoji: "🪙", title: "Rewards, Wallet & Shop", text: "Earn AIDLA Coins, track wallet activity, redeem products, and manage withdrawals.", href: "/user/shop", label: "See rewards" },
  { emoji: "🏆", title: "Leaderboards & Tests", text: "Live rankings, quiz champions, test winners, and prize history in one place.", href: "/leaderboard", label: "View ranks" },
  { emoji: "🤝", title: "Community Learning", text: "Forum, social learning, lucky draw, lucky wheel, referrals, and learner milestones.", href: "/user", label: "Go to dashboard" },
];

const FALLBACK_FAQS = [
  { question: "Is AIDLA free?", answer: "Yes. AIDLA is free to join and gives learners access to quizzes, tools, and rewards-focused learning features.", slug: "is-aidla-free" },
  { question: "How do AIDLA Coins work?", answer: "Learners earn coins by completing learning activities. Coins are designed to unlock rewards and keep students motivated.", slug: "how-aidla-coins-work" },
  { question: "Who is AIDLA for?", answer: "AIDLA is built for students, professionals, freshers, job seekers, career switchers, startup builders, and self-learners worldwide.", slug: "who-is-aidla-for" },
];

const FALLBACK_REVIEWS = [
  { id: "r1", full_name: "Ahmed Khan", rating: 5, review_text: "AIDLA changed how I study. The daily quizzes kept me consistent and the AIDLA Coins made it fun. Best free platform for learning and career growth!", created_at: "2026-04-12T00:00:00Z" },
  { id: "r2", full_name: "Fatima Malik", rating: 5, review_text: "The AI career tools helped me write my CV and prepare for interviews. I got my first job offer after using the tools here. Highly recommend!", created_at: "2026-04-06T00:00:00Z" },
  { id: "r3", full_name: "Bilal Hussain", rating: 5, review_text: "I never thought a completely free platform could offer so much. AIDLA has real courses, AI tools, and daily competitions. Absolutely love it.", created_at: "2026-03-30T00:00:00Z" },
];

/* ─── Helpers ─────────────────────────────────────────── */

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getDateKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDateKey(dateKey) {
  if (!dateKey) return "";
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ─── Data fetching ───────────────────────────────────── */

async function getHomeData() {
  const winnerDate = getDateKey(-1);

  if (!supabase) {
    return { posts: [], reviews: FALLBACK_REVIEWS, faqs: FALLBACK_FAQS, dailyWinners: [], winnerDate, featuredCourses: [] };
  }

  const [blogsRes, newsRes, reviewsRes, faqsRes, dailyQuizRes, coursesRes] = await Promise.all([
    supabase.from("blogs_posts").select("id,title,excerpt,published_at,slug,view_count").is("deleted_at", null).eq("status", "published").order("published_at", { ascending: false }).limit(2),
    supabase.from("news_posts").select("id,title,excerpt,published_at,slug,view_count").is("deleted_at", null).eq("status", "published").order("published_at", { ascending: false }).limit(2),
    supabase.from("user_reviews").select("id,full_name,rating,review_text,created_at,avatar_url").eq("is_approved", true).order("created_at", { ascending: false }).limit(6),
    supabase.from("faqs").select("id,question,answer,slug").eq("status", "published").eq("is_visible", true).order("helpful_yes", { ascending: false }).limit(4),
    supabase.rpc("daily_quiz_leaderboard", { p_date: winnerDate }),
    supabase.from("course_courses").select("id,title,description,category,slug").eq("status", "published").order("created_at", { ascending: false }).limit(6),
  ]);

  const posts = [
    ...(blogsRes.data || []).map((item) => ({ ...item, type: "Blog", href: `/blogs/${item.slug}` })),
    ...(newsRes.data || []).map((item) => ({ ...item, type: "News", href: `/news/${item.slug}` })),
  ].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)).slice(0, 3);

  const faqs = (faqsRes.data || FALLBACK_FAQS).map((faq) => ({ ...faq, answer: stripHtml(faq.answer) }));

  return {
    posts,
    reviews: reviewsRes.data?.length ? reviewsRes.data : FALLBACK_REVIEWS,
    faqs: faqs.length ? faqs : FALLBACK_FAQS,
    dailyWinners: (dailyQuizRes.data?.winners || []).slice(0, 3),
    winnerDate,
    featuredCourses: coursesRes.data || [],
  };
}

/* ─── Page ────────────────────────────────────────────── */

export default async function Home() {
  const { posts, reviews, faqs, dailyWinners, winnerDate, featuredCourses } = await getHomeData();

  const jsonLd = buildGraph(
    buildWebPageSchema({
      path: "/",
      name: "AIDLA - Pakistan #1 AI Powered Learning Platform",
      description: "AIDLA helps global learners, students, professionals, freshers, and career switchers grow with courses, AI tools, quizzes, AIDLA Coins, and rewards.",
      dateModified: LAST_MODIFIED,
      speakableSelectors: ["#hero-heading", "#how-heading", "#faq-heading"],
    }),
    buildBreadcrumbSchema([{ name: "Home", url: "/" }], "/"),
    buildHowToSchema(STEPS.map((s) => ({ title: s.title, text: s.text }))),
    buildEducationalOrgSchema(),
  );

  return (
    <div className="hp-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main-content" className="hp-main">

        {/* ══════════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════════ */}
        <section className="hp-hero" aria-labelledby="hero-heading">
          <div className="hp-hero-inner">

            {/* LEFT — copy */}
            <div className="hp-hero-copy">
              <span className="hp-eyebrow">🇵🇰 Pakistan&apos;s #1 AI Powered Learning Platform</span>

              <h1 id="hero-heading" className="hp-hero-title">
                <em>Learn</em> with AI.<br />
                Win Daily.<br />
                Earn <span className="hp-title-accent">AIDLA Coins.</span>
              </h1>

              <p className="hp-hero-sub">
                AIDLA brings courses, daily quiz competitions, AI career tools,
                resources, wallets, rewards, and learner leaderboards into one
                free platform for learners worldwide.
              </p>

              <div className="hp-hero-ctas">
                <Link href="/signup" className="hp-btn-primary">
                  Start Learning Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/user/dailyquizz" className="hp-btn-ghost">
                  Play Daily Quizz →
                </Link>
              </div>

              {/* Social proof row */}
              <div className="hp-hero-proof">
                <div className="hp-proof-avatars" aria-hidden="true">
                  {["A","Z","M","F","R"].map((l,i) => (
                    <span key={i} className="hp-avatar" style={{ "--i": i }}>{l}</span>
                  ))}
                </div>
                <p className="hp-proof-text">
                  <strong>500+ learners</strong> already studying free on AIDLA
                </p>
              </div>
            </div>

            {/* Mobile-only: marquee sits between social proof and quiz card */}
            <div className="hp-marquee-wrap hp-marquee-hero" aria-hidden="true">
              <div className="hp-marquee-track">
                {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
                  <span key={i} className="hp-marquee-item">{item}</span>
                ))}
              </div>
            </div>

            {/* RIGHT — Daily Quiz Winners card */}
            <div className="hp-hero-card" aria-label="AIDLA daily quiz winners preview">

              <div className="hp-card-header">
                <div className="hp-card-brand">
                  <Image src="/icon-192.png" alt="" width={36} height={36} priority fetchPriority="high" decoding="async" />
                </div>
                <div className="hp-card-header-text">
                  <small className="hp-card-kicker">{formatDateKey(winnerDate)}</small>
                  <strong>Yesterday&apos;s Winners</strong>
                </div>
                <Link href="/user/dailyquizz" className="hp-card-badge">Live</Link>
              </div>

              <div className="hp-card-score-bar">
                <div>
                  <span className="hp-score-label">Daily Quiz</span>
                  <strong className="hp-score-num">{dailyWinners.length > 0 ? `${dailyWinners.length} Winners` : "Join Now"}</strong>
                </div>
                <Link href="/user/dailyquizz" className="hp-card-join-btn">Join Today</Link>
              </div>

              <div className="hp-card-winners">
                {dailyWinners.length > 0 ? (
                  dailyWinners.map((winner, idx) => (
                    <div key={`${winner.rank}-${winner.user_id || winner.full_name}`} className="hp-winner-row">
                      <span className={`hp-rank hp-rank-${idx + 1}`} aria-label={`Rank ${winner.rank}`}>
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className="hp-winner-info">
                        <p>{winner.full_name || "AIDLA Learner"}</p>
                        <small>{winner.score}/{winner.total_questions} correct</small>
                      </div>
                      <span className="hp-winner-coins">+{winner.coins_earned || 0} <small>coins</small></span>
                    </div>
                  ))
                ) : (
                  <div className="hp-winner-empty">
                    <span className="hp-winner-empty-icon">🏆</span>
                    <p>Winners being calculated</p>
                    <small>Start today&apos;s quiz and compete!</small>
                  </div>
                )}
              </div>

              <div className="hp-card-progress">
                <div className="hp-progress-labels">
                  <span>Next leaderboard</span>
                  <strong>Today</strong>
                </div>
                <div className="hp-progress-bar" role="progressbar" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: "64%" }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Desktop-only: marquee below hero */}
        <div className="hp-marquee-wrap hp-marquee-desktop" aria-hidden="true">
          <div className="hp-marquee-track">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span key={i} className="hp-marquee-item">{item}</span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            3. PLATFORM STATS
        ══════════════════════════════════════════════════ */}
        <section className="hp-stats-section" aria-label="AIDLA platform statistics">
          <div className="hp-stats-inner">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="hp-stat-card">
                <span className="hp-stat-icon" aria-hidden="true">{stat.icon}</span>
                <strong className="hp-stat-value">{stat.value}</strong>
                <span className="hp-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            4. HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section className="hp-section" aria-labelledby="how-heading">
          <div className="hp-section-head center">
            <span className="hp-eyebrow-dark">Simple Path</span>
            <h2 id="how-heading">How AIDLA Works</h2>
            <p>Three steps, no clutter: learn useful skills, earn coins, and keep moving forward.</p>
          </div>

          <div className="hp-steps-grid">
            {STEPS.map((step, idx) => (
              <article key={step.title} className="hp-step-card" style={{ "--accent": step.color }}>
                <div className="hp-step-top">
                  <span className="hp-step-num">{step.num}</span>
                  <span className="hp-step-icon" aria-hidden="true">{step.icon}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {idx < STEPS.length - 1 && <span className="hp-step-arrow" aria-hidden="true">→</span>}
              </article>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            5. FEATURES
        ══════════════════════════════════════════════════ */}
        <section className="hp-section hp-section-alt" aria-labelledby="features-heading">
          <div className="hp-section-head center">
            <span className="hp-eyebrow-dark">AIDLA Ecosystem</span>
            <h2 id="features-heading">Everything Learners and Professionals Need</h2>
            <p>Public discovery plus a complete learner dashboard — all in one free platform.</p>
          </div>

          <div className="hp-features-grid">
            {FEATURES.map((feature, idx) => (
              <article key={feature.title} className="hp-feature-card">
                <span className="hp-feature-emoji" aria-hidden="true">{feature.emoji}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <Link href={feature.href} className="hp-feature-link">
                  {feature.label} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            6. FEATURED COURSES
        ══════════════════════════════════════════════════ */}
        <section className="hp-section" aria-labelledby="courses-heading">
          <div className="hp-section-head split">
            <div>
              <span className="hp-eyebrow-dark">Learn Something New</span>
              <h2 id="courses-heading">Featured Courses</h2>
              <p>Expert-led courses for students, professionals, freshers, career switchers and founders.</p>
            </div>
            <Link href="/courses" className="hp-link-btn">Browse All Courses →</Link>
          </div>

          {featuredCourses.length > 0 ? (
            <>
              <div className="hp-courses-grid">
                {featuredCourses.map((course) => {
                  const slug = course.slug || course.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  return (
                    <article key={course.id} className="hp-course-card">
                      <div className="hp-course-body">
                        {course.category && <p className="hp-course-cat">{course.category}</p>}
                        <h3 className="hp-course-title">{course.title}</h3>
                        {course.description && <p className="hp-course-desc">{course.description}</p>}
                        <Link href={`/courses/${slug}`} className="hp-course-link">View Course →</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="hp-courses-more-wrap">
                <Link href="/courses" className="hp-btn-primary">
                  Show More Courses
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="hp-courses-grid">
                {[
                  { title: "Academic Writing & Research Skills", cat: "English", desc: "Master essay structure, citation styles, and research methods to improve your academic performance." },
                  { title: "Critical Thinking & Problem Solving", cat: "Life Skills", desc: "Build analytical thinking skills to tackle challenges creatively and find practical solutions." },
                  { title: "AI Tools for Students", cat: "Technology", desc: "Use AI tools for productivity, assignments, CV writing, and building your digital career." },
                  { title: "Communication Skills in English", cat: "Language", desc: "Improve spoken and written English to boost confidence in professional and academic settings." },
                  { title: "Mathematics Fundamentals", cat: "Mathematics", desc: "Strengthen your foundation in key math concepts for academic and professional success." },
                  { title: "Digital Literacy & Computer Basics", cat: "Technology", desc: "Learn essential computer and internet skills to navigate today's digital world with confidence." },
                ].map((c, idx) => (
                  <article key={idx} className="hp-course-card">
                    <div className="hp-course-body">
                      <p className="hp-course-cat">{c.cat}</p>
                      <h3 className="hp-course-title">{c.title}</h3>
                      <p className="hp-course-desc">{c.desc}</p>
                      <Link href="/courses" className="hp-course-link">View Course →</Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hp-courses-more-wrap">
                <Link href="/courses" className="hp-btn-primary">
                  Show More Courses
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </>
          )}
        </section>

        {/* ══════════════════════════════════════════════════
            8. BLOG / NEWS
        ══════════════════════════════════════════════════ */}
        {posts.length > 0 && (
          <section className="hp-section" aria-labelledby="latest-heading">
            <div className="hp-section-head split">
              <div>
                <span className="hp-eyebrow-dark">Latest from AIDLA</span>
                <h2 id="latest-heading">Fresh Learning Updates</h2>
              </div>
              <Link href="/blogs" className="hp-link-btn">View All Articles →</Link>
            </div>

            <div className="hp-posts-grid">
              {posts.map((post) => (
                <Link key={`${post.type}-${post.id}`} href={post.href} className="hp-post-card">
                  <span className="hp-post-type">{post.type}</span>
                  <h3>{post.title}</h3>
                  {post.excerpt && <p>{post.excerpt}</p>}
                  <small>{formatDate(post.published_at)}</small>
                  <span className="hp-post-read-btn">Read Full Article →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            9. FAQ
        ══════════════════════════════════════════════════ */}
        <section className="hp-section hp-section-alt" aria-labelledby="faq-heading">
          <div className="hp-section-head center">
            <span className="hp-eyebrow-dark">Questions</span>
            <h2 id="faq-heading">What Learners Ask First</h2>
            <p>Everything you need to know before you start.</p>
          </div>

          <div className="hp-faq-list">
            {faqs.slice(0, 4).map((faq, idx) => (
              <details key={faq.id || faq.slug} className="hp-faq-item">
                <summary className="hp-faq-summary">
                  <span className="hp-faq-num" aria-hidden="true">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="hp-faq-q">{faq.question}</span>
                  <span className="hp-faq-chevron" aria-hidden="true">+</span>
                </summary>
                <div className="hp-faq-body">
                  <p>{faq.answer}</p>
                  {faq.slug && (
                    <Link href={`/faqs/${faq.slug}`} className="hp-faq-link">Read full answer →</Link>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            11. FINAL CTA
        ══════════════════════════════════════════════════ */}
        <section className="hp-final-cta" aria-labelledby="cta-heading">
          <div className="hp-cta-inner">
            <span className="hp-eyebrow-light">Ready When You Are</span>
            <h2 id="cta-heading">Start Learning on AIDLA Today.</h2>
            <p>Join free, practice daily, and let your learning turn into visible progress.</p>
            <div className="hp-cta-actions">
              <Link href="/signup" className="hp-btn-primary hp-btn-primary--large">
                Create Free Account
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/user/dailyquizz" className="hp-cta-ghost-btn">Play Daily Quizz →</Link>
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviews} />

      </main>
    </div>
  );
}
