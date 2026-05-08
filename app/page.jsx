// app/page.jsx
// Optimized for: Performance 100, Accessibility 100, Best Practices 100, SEO 100
// + Complete SEO/AEO/GEO/LLMO/AISEO/EEAT/VSO/SMO/CRO/Technical SEO suite
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import GoogleSearchHero from "@/components/GoogleSearchHero";
import QuotesCarousel from "@/components/QuotesCarousel";
import ContentCarousel from "@/components/ContentCarousel";
import styles from "./home.module.css";

const SITE_URL = "https://www.aidla.online";
const LAST_MODIFIED = "2025-07-01";

// ──────────────────────────────────────────────────────────────────────
// METADATA — SEO 100 optimized
// Covers: Technical SEO, Mobile SEO, International SEO, EEAT,
//         Open Graph (SMO), Twitter Cards, AEO meta signals
// ──────────────────────────────────────────────────────────────────────
export const metadata = {
  title: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
  description:
    "AIDLA is Pakistan's number one free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free learning resources. 100% free — no subscription required.",
  keywords: [
    "AIDLA", "free learning platform Pakistan", "online quizzes Pakistan",
    "education Pakistan", "earn coins online", "lucky draw Pakistan",
    "student prizes", "study online Pakistan", "AIDLA coins", "free education app",
    "gamified learning", "Pakistan curriculum quizzes",
  ],
  authors: [{ name: "Engr-Muhammad Zubair", url: SITE_URL }],
  creator: "AIDLA",
  publisher: "AIDLA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      "en-PK": `${SITE_URL}/`,
      "en-US": `${SITE_URL}/`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "AIDLA",
    locale: "en_PK",
    url: `${SITE_URL}/`,
    title: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
    description:
      "Pakistan's #1 free education platform. Take quizzes, earn coins, win real prizes. 100% free.",
    images: [
      {
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "AIDLA — Learn, Earn Coins & Win Prizes | Pakistan's #1 Free Education Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIDLA_online",
    creator: "@AIDLA_online",
    title: "AIDLA — Free Learning, Earn Coins & Win Prizes",
    description: "Pakistan's #1 free education platform. Take quizzes, earn coins, win prizes.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

// ── Utility functions ──
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function maskName(name) {
  if (!name) return "A";
  return name.trim().split(" ")[0];
}

const STATUS_META = {
  voting:   { cls: styles.sbVoting,   label: "Voting Open" },
  selected: { cls: styles.sbSelected, label: "Shortlisted" },
  soon:     { cls: styles.sbSoon,     label: "Coming Soon" },
  live:     { cls: styles.sbLive,     label: "Live" },
};

// ──────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const cookieStore = await cookies();
  const votedFeatures = cookieStore.get("aidla_voted_fp")?.value || "{}";
  const userVoted = JSON.parse(votedFeatures);

  let blogs = null, news = null, announcements = null, draws = null,
    wheelRaw = null, reviews = null, faqs = null,
    dailyQuizWinners = null;

  if (supabase) {
    const results = await Promise.all([
      supabase.from("blogs_posts").select("id,title,excerpt,tags,published_at,slug,view_count")
        .is("deleted_at", null).eq("status", "published")
        .order("published_at", { ascending: false }).limit(6),
      supabase.from("news_posts").select("id,title,excerpt,tags,published_at,slug,view_count")
        .is("deleted_at", null).eq("status", "published")
        .order("published_at", { ascending: false }).limit(6),
      supabase.from("announcements").select("*")
        .eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("luckydraw_results").select("id,winner_name,draw_title,prize_text,announced_at")
        .order("announced_at", { ascending: false }).limit(5),
      supabase.from("luckywheel_history").select("id,user_id,result_type,coins_won,created_at")
        .in("result_type", ["coins", "gift"]).order("created_at", { ascending: false }).limit(5),
      supabase.rpc("daily_quiz_leaderboard"),
      supabase.from("user_reviews").select("id,full_name,rating,review_text,created_at")
        .eq("is_approved", true).order("created_at", { ascending: false }).limit(10),
      supabase.from("faqs").select("id,question,answer,slug,category")
        .eq("status", "published").eq("is_visible", true)
        .order("helpful_yes", { ascending: false }).limit(6),
    ]);
    [blogs, news, announcements, draws, wheelRaw, dailyQuizWinners, reviews, faqs] =
      results.map(r => r.data);
  }

  const userIds = wheelRaw?.map(w => w.user_id) || [];
  let userMap = {};
  if (userIds.length && supabase) {
    const { data: profiles } = await supabase
      .from("users_profiles").select("id,full_name").in("id", userIds);
    if (profiles) userMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name || "Anonymous"]));
  }
  const wheel = wheelRaw?.map(w => ({ ...w, user_name: userMap[w.user_id] || "Anonymous" })) || [];
  const maxVotes = Math.max(...(announcements?.map(i => i.vote_count || 0) || [1]), 1);

  // ── Dynamic JSON-LD (built from live Supabase data) ──
  const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
        headline: "AIDLA — Pakistan's #1 Free Education Platform",
        description:
          "AIDLA is Pakistan's number one free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free learning resources.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
        dateModified: LAST_MODIFIED,
        datePublished: "2026-04-01",
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "Engr-Muhammad Zubair",
          url: SITE_URL,
        },
        speakable: {
          "@type": "SpeakableSpecification",
          xpath: [
            "/html/head/title",
            "/html/head/meta[@name='description']/@content",
          ],
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          ],
        },
        potentialAction: { "@type": "ReadAction", target: [SITE_URL] },
        mainContentOfPage: { "@type": "WebPageElement", cssSelector: "#main-content" },
      },
      {
        "@type": "HowTo",
        "@id": `${SITE_URL}/#howto`,
        name: "How to Earn Coins and Win Prizes on AIDLA",
        description:
          "Four simple steps to start learning and earning real rewards on AIDLA, Pakistan's number one free education platform.",
        totalTime: "PT2M",
        estimatedCost: { "@type": "MonetaryAmount", currency: "PKR", value: "0" },
        supply: [{ "@type": "HowToSupply", name: "Email address" }],
        tool: [{ "@type": "HowToTool", name: "AIDLA website or app" }],
        step: [
          { "@type": "HowToStep", position: 1, name: "Sign Up Free",
            text: "Create your AIDLA account in under 30 seconds — no payment required, no subscription needed.",
            url: `${SITE_URL}/signup`, image: `${SITE_URL}/og-home.jpg` },
          { "@type": "HowToStep", position: 2, name: "Learn and Play",
            text: "Take curriculum-aligned quizzes, enter lucky draws, and spin the lucky wheel daily.",
            url: `${SITE_URL}/courses` },
          { "@type": "HowToStep", position: 3, name: "Earn AIDLA Coins",
            text: "Collect AIDLA Coins for every quiz completed, draw entered, and achievement unlocked.",
            url: `${SITE_URL}/leaderboard` },
          { "@type": "HowToStep", position: 4, name: "Cash Out or Redeem",
            text: "Redeem your coins for gadgets and gift cards in the Rewards Shop, or withdraw directly to your bank account.",
            url: `${SITE_URL}/signup` },
        ],
      },
      // FAQPage — built from live Supabase data for AEO, featured snippets, Voice Search
      ...(faqs && faqs.length > 0 ? [{
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faqpage`,
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: (f.answer || "").replace(/<[^>]*>/g, "").trim(),
          },
        })),
      }] : []),
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#features`,
        name: "AIDLA Platform Features",
        description: "Complete list of features available on AIDLA, Pakistan's free education and rewards platform",
        numberOfItems: 7,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Smart Quizzes", url: `${SITE_URL}/courses` },
          { "@type": "ListItem", position: 2, name: "Lucky Draws",   url: `${SITE_URL}/signup` },
          { "@type": "ListItem", position: 3, name: "Lucky Wheel",   url: `${SITE_URL}/signup` },
          { "@type": "ListItem", position: 4, name: "Rewards Shop",  url: `${SITE_URL}/signup` },
          { "@type": "ListItem", position: 5, name: "Cash Withdrawals", url: `${SITE_URL}/signup` },
          { "@type": "ListItem", position: 6, name: "Leaderboards", url: `${SITE_URL}/leaderboard` },
          { "@type": "ListItem", position: 7, name: "Education News", url: `${SITE_URL}/news` },
        ],
      },
      {
        "@type": "Event",
        "@id": `${SITE_URL}/#lucky-draw`,
        name: "AIDLA Weekly Lucky Draw",
        description: "Weekly lucky draw for AIDLA members. Enter using coins and win real cash and prizes.",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        organizer: { "@id": `${SITE_URL}/#organization` },
        location: { "@type": "VirtualLocation", url: SITE_URL },
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/signup`,
        },
      },
    ],
  };

  // Server Actions
  async function submitVote(formData) {
    "use server";
    const id = formData.get("id");
    const actionCookieStore = await cookies();
    const currentVotedRaw = actionCookieStore.get("aidla_voted_fp")?.value || "{}";
    const currentVoted = JSON.parse(currentVotedRaw);
    if (!id || currentVoted[id]) return;
    await supabase.from("announcement_votes").insert({ announcement_id: id, voter_email: "server_cookie" });
    const { data } = await supabase.from("announcements").select("vote_count").eq("id", id).single();
    if (data) await supabase.from("announcements").update({ vote_count: data.vote_count + 1 }).eq("id", id);
    currentVoted[id] = true;
    actionCookieStore.set("aidla_voted_fp", JSON.stringify(currentVoted), { maxAge: 60 * 60 * 24 * 365 });
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  }

  async function submitNewsletter(formData) {
    "use server";
    if (formData.get("honey")) return;
    const email = formData.get("email")?.toString().trim().toLowerCase();
    if (email && email.includes("@")) {
      await supabase.from("newsletter_subscribers").insert({ email });
    }
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  }

  async function submitReview(formData) {
    "use server";
    if (formData.get("honey")) return;
    const full_name  = formData.get("name")?.toString().trim();
    const email      = formData.get("email")?.toString().trim().toLowerCase();
    const rating     = parseInt(formData.get("rating")?.toString() || "5", 10);
    const review_text = formData.get("review")?.toString().trim();
    if (full_name && email && review_text) {
      await supabase.from("user_reviews").insert({ full_name, email, rating, review_text, is_approved: false });
    }
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  }

  return (
    <div className={styles.pageRoot}>
      {/* ── Page-level JSON-LD (dynamic — uses live Supabase FAQ data) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <main id="main-content" role="main">

        {/* ════════════════ HERO ════════════════ */}
        <section
          className={styles.heroSection}
          aria-labelledby="hero-heading"
          itemScope
          itemType="https://schema.org/WPHeader"
        >
          <div className={styles.heroAurora} aria-hidden="true">
            <div className={`${styles.auroraBlob} ${styles.auroraBlob1}`} />
            <div className={`${styles.auroraBlob} ${styles.auroraBlob2}`} />
            <div className={`${styles.auroraBlob} ${styles.auroraBlob3}`} />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <span
                className={styles.coinBadge}
                aria-label="AIDLA Coins — earn by learning and win real prizes"
              >
                🪙 AIDLA Coins — Learn &amp; Earn
              </span>

              <div className={styles.heroH1Wrap}>
                <h1 id="hero-heading" className={styles.heroH1}>
                  Learn.{" "}
                  <span className={styles.heroH1Accent}>Earn Coins.</span>{" "}
                  Redeem Rewards.
                </h1>
              </div>

              <p className={styles.heroPara}>
                Pakistan&apos;s number one free education platform.
                Complete quizzes, spin the lucky wheel, and win real prizes.
                Convert your <strong>AIDLA Coins</strong> to products or cash — completely free.
              </p>

              <div className={styles.heroBtns}>
                <Link href="/signup" className={styles.btnPrimary}>
                  🚀 Start Free — No Sign-up Fee
                </Link>
                <Link href="/about" className={styles.btnSecondary}>
                  Learn More About AIDLA
                </Link>
              </div>

              <div className={styles.trustStrip} aria-label="Trust indicators">
                <span>✅ Free to Join</span>
                <span>🏆 Daily Prizes</span>
                <span>🇵🇰 Made in Pakistan</span>
              </div>
            </div>

            {/* Google Search Hero Animation — demonstrates AIDLA ranking #1 */}
            <div
              className={styles.heroVisual}
              aria-label="AIDLA Google search results demonstration"
              role="img"
            >
              <GoogleSearchHero />
            </div>
          </div>
        </section>

        {/* ════════════════ TRUST BAR ════════════════ */}
        <section
          className={styles.trustBar}
          aria-label="Platform trust highlights and features"
          role="complementary"
        >
          {[
            { icon: "🎓", label: "Pakistan Curriculum" },
            { icon: "🔒", label: "Safe & Secure" },
            { icon: "⚡", label: "Instant Rewards" },
            { icon: "📱", label: "Mobile Friendly" },
            { icon: "🌐", label: "Urdu & English" },
          ].map((t) => (
            <div key={t.label} className={styles.trustBarItem}>
              <span aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </section>

        {/* ════════════════ QUOTES ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="quotes-heading"
        >
          <h2 className={styles.sectionHeading} id="quotes-heading">
            Words of Wisdom
          </h2>
          <p className={styles.sectionSub}>
            Inspired by the Quran, Hadith, and great thinkers across languages
          </p>
          <QuotesCarousel />
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="how-heading"
          itemScope
          itemType="https://schema.org/HowTo"
        >
          <h2
            className={styles.sectionHeading}
            id="how-heading"
            itemProp="name"
          >
            How It Works
          </h2>
          <p className={styles.sectionSub} itemProp="description">
            Four simple steps from sign-up to cash in hand
          </p>
          <ol className={styles.stepsRow} aria-label="Steps to earn on AIDLA">
            {[
              { icon: "📝", title: "Sign Up Free",  desc: "Create your account in under 30 seconds — no payment needed." },
              { icon: "📚", title: "Learn & Play",  desc: "Take quizzes, enter draws, spin the lucky wheel." },
              { icon: "🪙", title: "Earn Coins",    desc: "Collect AIDLA Coins for every quiz, draw, and achievement." },
              { icon: "💵", title: "Cash Out",      desc: "Redeem rewards or withdraw directly to your bank." },
            ].map((step, i) => (
              <li
                key={i}
                className={styles.stepItem}
                itemScope
                itemType="https://schema.org/HowToStep"
                itemProp="step"
              >
                <div className={styles.stepCircle} aria-hidden="true">{step.icon}</div>
                <strong className={styles.stepTitle} itemProp="name">{step.title}</strong>
                <p className={styles.stepDesc} itemProp="text">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ════════════════ FEATURES / ECOSYSTEM ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="features-heading"
        >
          <h2 className={styles.sectionHeading} id="features-heading">
            The AIDLA Ecosystem
          </h2>
          <p className={styles.sectionSub}>
            Everything you need to learn, play, and earn — in one free platform
          </p>
          <div className={styles.featuresGrid} role="list">
            {[
              { icon: "📚", color: styles.featBlue,   label: "Smart Quizzes",    desc: "Curriculum-aligned tests designed to maximise learning outcomes.", href: "/courses" },
              { icon: "🎲", color: styles.featAmber,  label: "Lucky Draws",      desc: "Enter exclusive prize draws with your coins and win weekly.", href: "/" },
              { icon: "🎡", color: styles.featGreen,  label: "Lucky Wheel",      desc: "Spin daily for bonus coins, gifts, and extra draw chances.", href: "/" },
              { icon: "🛍️", color: styles.featPurple, label: "Rewards Shop",     desc: "Redeem coins for gadgets, gift cards and vouchers.", href: "/" },
              { icon: "💵", color: styles.featRed,    label: "Cash Withdrawals", desc: "Transfer your coin balance directly to your bank account.", href: "/" },
              { icon: "📊", color: styles.featSky,    label: "Leaderboards",     desc: "Compete with thousands and climb the global rankings.", href: "/leaderboard" },
              { icon: "📰", color: styles.featPink,   label: "Education News",   desc: "Stay updated with latest Pakistan education news daily.", href: "/news" },
            ].map((f, i) => (
              <article
                key={i}
                className={`${styles.featCard} ${f.color}`}
                role="listitem"
                itemScope
                itemType="https://schema.org/Service"
              >
                <span className={styles.featIcon} aria-hidden="true">{f.icon}</span>
                <h3 className={styles.featTitle} itemProp="name">{f.label}</h3>
                <p className={styles.featDesc} itemProp="description">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════ BLOGS ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="blogs-heading"
        >
          <h2 className={styles.sectionHeading} id="blogs-heading">
            <span className={styles.headingIcon} aria-hidden="true">📝</span>
            Latest Blogs
          </h2>
          <p className={styles.sectionSub}>
            Expert education insights, study tips, and guides for Pakistani students
          </p>

          <ContentCarousel
            items={blogs}
            type="blog"
            viewAllHref="/blogs"
            viewAllLabel="View All Education Blogs"
          />
        </section>

        {/* ════════════════ NEWS ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="news-heading"
        >
          <h2 className={styles.sectionHeading} id="news-heading">
            <span className={styles.headingIcon} aria-hidden="true">📰</span>
            Latest Education News
          </h2>
          <p className={styles.sectionSub}>
            Stay updated with Pakistan&apos;s education sector — board results, policy changes, and more
          </p>

          <ContentCarousel
            items={news}
            type="news"
            viewAllHref="/news"
            viewAllLabel="View All Education News"
          />
        </section>

        {/* ════════════════ UPCOMING FEATURES / VOTING ════════════════ */}
        <section className={styles.sectionWrap}>
          <div className={styles.upcomingSection} aria-labelledby="upcoming-heading">
            <h2
              className={styles.sectionHeading}
              id="upcoming-heading"
              style={{ textAlign: "left", marginBottom: 4 }}
            >
              You Decide What We Build
            </h2>
            <p className={styles.sectionSub} style={{ textAlign: "left" }}>
              Tap to vote — no sign-up needed. Most-voted features launch first.
            </p>

            {announcements?.map((f) => {
              const pct = Math.round(((f.vote_count || 0) / maxVotes) * 100);
              const voted = userVoted[f.id];
              const s = STATUS_META[f.status] || STATUS_META.voting;

              return (
                <article key={f.id} className={styles.fvCard}>
                  <div className={styles.fvTop}>
                    <div className={styles.fvName}>
                      <span className={styles.fvIcon} aria-hidden="true">{f.icon}</span>
                      <div className={styles.fvText}>
                        <h3 className={styles.fvTitle}>{f.title}</h3>
                        <div className={styles.fvBadges}>
                          <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>
                          {f.launch_date && <span className={styles.fvDate}>{f.launch_date}</span>}
                        </div>
                      </div>
                    </div>
                    {f.status === "voting" && (
                      <form action={submitVote}>
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          className={`${styles.voteBtn} ${voted ? styles.voteBtnVoted : ""}`}
                          disabled={voted}
                          aria-label={
                            voted
                              ? `Already voted for ${f.title}`
                              : `Vote for ${f.title} — ${(f.vote_count || 0).toLocaleString()} votes`
                          }
                        >
                          {voted ? "✅ Voted" : "👍 Vote"}
                        </button>
                      </form>
                    )}
                  </div>
                  {f.description && <p className={styles.fvDesc}>{f.description}</p>}
                  <div className={styles.fvBarWrap}>
                    <div
                      className={styles.fvBar}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${pct}% of maximum votes`}
                    >
                      <div
                        className={`${styles.fvFill} ${voted ? styles.fvFillVoted : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={styles.fvCount}>
                      <strong>{(f.vote_count || 0).toLocaleString()}</strong> votes
                    </span>
                  </div>
                </article>
              );
            })}
            <p className={styles.fvHow}>
              Vote → Shortlist → Launch — we build the most-voted features first.
            </p>
          </div>
        </section>

        {/* ════════════════ NEWSLETTER ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="nl-heading">
          <div className={styles.nlSection}>
            <div className={styles.nlBg} aria-hidden="true" />
            <div className={styles.nlInner}>
              <h2 id="nl-heading" className={styles.nlTitle}>
                📬 Never Miss an Update
              </h2>
              <p className={styles.nlSub}>
                Get daily education news, prize alerts, and new feature announcements — free.
              </p>
              <form action={submitNewsletter} className={styles.nlForm} noValidate>
                <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                  <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
                </div>
                <label htmlFor="nl-email" className={styles.srOnly}>Your email address</label>
                <input
                  id="nl-email"
                  name="email"
                  type="email"
                  className={styles.nlInput}
                  placeholder="Enter your email address…"
                  required
                  autoComplete="email"
                  aria-required="true"
                  suppressHydrationWarning
                />
                <button type="submit" className={styles.nlBtn} suppressHydrationWarning>
                  Subscribe 🚀
                </button>
              </form>
              <p className={styles.nlPrivacy}>No spam, ever. Unsubscribe with one click, anytime.</p>
            </div>
          </div>
        </section>

        {/* ════════════════ WINNERS ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="winners-heading"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <h2 className={styles.sectionHeading} id="winners-heading">
            <span className={styles.headingIcon} aria-hidden="true">🏆</span>
            Recent Winners
          </h2>
          <p className={styles.sectionSub}>
            Real people. Real rewards. Updated live — proving AIDLA pays out.
          </p>

          <div className={styles.winnersGrid}>
            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">🎲</span>
                <h3>Lucky Draw Winners</h3>
              </div>
              <table className={styles.winnerTable}>
                <caption className={styles.srOnly}>Recent AIDLA lucky draw winners</caption>
                <thead>
                  <tr>
                    <th scope="col">Winner</th>
                    <th scope="col">Prize</th>
                    <th scope="col">When</th>
                  </tr>
                </thead>
                <tbody>
                  {draws?.map((row) => (
                    <tr key={row.id}>
                      <td><strong>{row.winner_name}</strong><br /><small>{row.draw_title}</small></td>
                      <td className={styles.tdPrize}>{row.prize_text}</td>
                      <td className={styles.tdDate}><time dateTime={row.announced_at}>{formatDate(row.announced_at)}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">🎡</span>
                <h3>Lucky Wheel Winners</h3>
              </div>
              <table className={styles.winnerTable}>
                <caption className={styles.srOnly}>Recent AIDLA lucky wheel winners</caption>
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Reward</th>
                    <th scope="col">When</th>
                  </tr>
                </thead>
                <tbody>
                  {wheel?.map((row) => (
                    <tr key={row.id}>
                      <td><strong>{row.user_name}</strong></td>
                      <td>
                        <span className={`${styles.wb} ${row.result_type === "coins" ? styles.wbCoins : styles.wbGift}`}>
                          {row.result_type === "coins" ? `🪙 ${row.coins_won} Coins` : "🎁 Gift"}
                        </span>
                      </td>
                      <td className={styles.tdDate}><time dateTime={row.created_at}>{formatDate(row.created_at)}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">📝</span>
                <h3>Daily Quizz Winners</h3>
              </div>
              <table className={styles.winnerTable}>
                <caption className={styles.srOnly}>Recent AIDLA daily quiz winners</caption>
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Student</th>
                    <th scope="col">Score</th>
                    <th scope="col">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {(dailyQuizWinners?.winners || dailyQuizWinners?.all_attempts || [])?.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          className={`${styles.rankBadge} ${
                            row.rank === 1 ? styles.rank1
                            : row.rank === 2 ? styles.rank2
                            : row.rank === 3 ? styles.rank3
                            : styles.rankO
                          }`}
                          aria-label={`Rank ${row.rank || idx + 1}`}
                        >
                          #{row.rank || idx + 1}
                        </span>
                      </td>
                      <td><strong>{row.full_name || "Anonymous"}</strong></td>
                      <td>{row.score || row.correct_answers || 0}/{row.total_questions || "?"}</td>
                      <td className={styles.tdDate}>🪙 {row.coins_earned || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* ════════════════ REVIEWS ════════════════ */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="reviews-heading"
          itemScope
          itemType="https://schema.org/Product"
        >
          <meta itemProp="name" content="AIDLA Learning Platform" />
          <meta itemProp="brand" content="AIDLA" />

          <h2 className={styles.sectionHeading} id="reviews-heading">
            <span className={styles.headingIcon} aria-hidden="true">⭐</span>
            What Our Learners Say
          </h2>
          <p className={styles.sectionSub}>
            Real reviews from verified Pakistani students — approved by our team
          </p>

          {reviews?.length > 0 && (
            <div
              itemProp="aggregateRating"
              itemScope
              itemType="https://schema.org/AggregateRating"
              className={styles.srOnly}
            >
              <meta itemProp="ratingValue" content={String((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))} />
              <meta itemProp="reviewCount" content={String(reviews.length)} />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
            </div>
          )}

          <div className={styles.rvSliderOuter}>
            <div className={styles.nativeScrollContainer} role="list">
              {reviews?.map((r) => (
                <article
                  key={r.id}
                  className={`${styles.rvCard} ${styles.scrollItem}`}
                  role="listitem"
                  itemScope
                  itemType="https://schema.org/Review"
                  itemProp="review"
                >
                  <div
                    className={styles.rvStars}
                    role="img"
                    aria-label={`${r.rating} out of 5 stars`}
                    itemProp="reviewRating"
                    itemScope
                    itemType="https://schema.org/Rating"
                  >
                    <meta itemProp="ratingValue" content={String(r.rating)} />
                    <meta itemProp="bestRating" content="5" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} aria-hidden="true">{i < r.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <blockquote className={styles.rvText} itemProp="reviewBody">
                    &quot;{r.review_text}&quot;
                  </blockquote>
                  <div className={styles.rvAuthor}>
                    <div className={styles.rvAvatar} aria-hidden="true">
                      {(r.full_name?.[0] || "A").toUpperCase()}
                    </div>
                    <div itemProp="author" itemScope itemType="https://schema.org/Person">
                      <div className={styles.rvName} itemProp="name">{maskName(r.full_name)}</div>
                      <time className={styles.rvWhen} dateTime={r.created_at} itemProp="datePublished">
                        {formatDate(r.created_at)}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Review form */}
          <div className={styles.rvFormBox} aria-labelledby="rv-form-heading">
            <h3 id="rv-form-heading" className={styles.rvFormTitle}>✍️ Share Your Experience</h3>
            <p className={styles.rvFormSub}>No login needed. Reviews appear after approval within 24 hours.</p>
            <form action={submitReview} noValidate>
              <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={styles.rvRow2}>
                <div>
                  <label className={styles.rvLabel} htmlFor="rv-name">Your Name <span aria-hidden="true">*</span></label>
                  <input id="rv-name" name="name" className={styles.rvInput} placeholder="Your name" required autoComplete="name" aria-required="true" suppressHydrationWarning />
                </div>
                <div>
                  <label className={styles.rvLabel} htmlFor="rv-email">Email <span aria-hidden="true">*</span></label>
                  <input id="rv-email" name="email" type="email" className={styles.rvInput} placeholder="you@email.com" required autoComplete="email" aria-required="true" suppressHydrationWarning />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label className={styles.rvLabel} htmlFor="rv-rating">Rating</label>
                <select id="rv-rating" name="rating" className={styles.rvInput} required aria-required="true" suppressHydrationWarning>
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Very Good</option>
                  <option value="3">⭐⭐⭐ Good</option>
                  <option value="2">⭐⭐ Fair</option>
                  <option value="1">⭐ Poor</option>
                </select>
              </div>
              <label className={styles.rvLabel} htmlFor="rv-text">Your Review <span aria-hidden="true">*</span></label>
              <textarea
                id="rv-text"
                name="review"
                className={styles.rvTextarea}
                placeholder="Share your experience with AIDLA (minimum 20 characters)…"
                required
                minLength={20}
                maxLength={500}
                rows={4}
                aria-required="true"
                aria-describedby="rv-text-hint"
              />
              <p id="rv-text-hint" className={styles.srOnly}>Minimum 20 characters, maximum 500 characters</p>
              <button type="submit" className={styles.rvSubmit} suppressHydrationWarning>Submit Review</button>
            </form>
          </div>
        </section>

        {/* ════════════════ FAQ ════════════════ */}
        {/* AEO-optimized: featured snippets, zero-click, voice search */}
        <section
          className={styles.sectionWrap}
          aria-labelledby="faq-heading"
        >
          <h2 className={styles.sectionHeading} id="faq-heading">
            Frequently Asked Questions
          </h2>
          <p className={styles.sectionSub}>
            Quick answers to what students ask most about AIDLA
          </p>

          <div className={styles.faqList} itemScope itemType="https://schema.org/FAQPage">
            {faqs && faqs.length > 0 ? (
              faqs.map((f) => (
                <details
                  key={f.id}
                  className={styles.faqItem}
                  itemScope
                  itemType="https://schema.org/Question"
                  itemProp="mainEntity"
                >
                  <summary className={styles.faqQ}>
                    <span itemProp="name">{f.question}</span>
                    <span className={styles.faqChevron} aria-hidden="true">▼</span>
                  </summary>
                  <div
                    className={styles.faqA}
                    itemScope
                    itemType="https://schema.org/Answer"
                    itemProp="acceptedAnswer"
                  >
                    <div
                      className={styles.faqAInner}
                      itemProp="text"
                      dangerouslySetInnerHTML={{ __html: f.answer }}
                    />
                    <Link
                      href={`/faqs/${f.slug}`}
                      className={styles.faqFullLink}
                      aria-label={`Read full answer to: ${f.question}`}
                    >
                      Read full answer →
                    </Link>
                  </div>
                </details>
              ))
            ) : (
              <p className={styles.faqEmpty}>
                Frequently asked questions are loading.{" "}
                <Link href="/faqs" className={styles.faqFullLink}>
                  Browse all FAQs →
                </Link>
              </p>
            )}
          </div>

          <div className={styles.faqSeeAll}>
            <Link href="/faqs" className={styles.viewAllBtn}>
              Browse All Frequently Asked Questions →
            </Link>
          </div>
        </section>

        {/* ════════════════ CTA ════════════════ */}
        <section
          className={styles.ctaSection}
          aria-labelledby="cta-heading"
        >
          <div className={styles.ctaBg} aria-hidden="true">
            <div className={`${styles.ctaBlob} ${styles.ctaBlob1}`} />
            <div className={`${styles.ctaBlob} ${styles.ctaBlob2}`} />
          </div>
          <div className={styles.ctaInner}>
            <span className={styles.ctaBadge}>🌟 Join Learners Across Pakistan</span>
            <h2 id="cta-heading" className={styles.ctaTitle}>
              Your Knowledge is Your Greatest Asset
            </h2>
            <p className={styles.ctaSub}>
              Every quiz you complete earns real, redeemable AIDLA Coins.
              Start your journey today — it&apos;s completely free, always.
            </p>
            <Link href="/signup" className={styles.ctaBtn}>
              ✨ Get Started Free — Join AIDLA Now
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
