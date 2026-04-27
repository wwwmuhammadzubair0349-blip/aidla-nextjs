import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

import styles from "./home.module.css";

const SITE_URL = "https://www.aidla.online";
const LAST_MODIFIED = "2025-07-01";

export const metadata = {
  title: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
  description:
    "AIDLA is Pakistan's #1 free education platform. Take quizzes, earn AIDLA Coins, spin the lucky wheel, win real prizes, and access free learning resources.",
  keywords:[
    "AIDLA",
    "free learning platform",
    "online quizzes",
    "education Pakistan",
    "earn coins",
    "lucky draw",
    "student prizes",
    "study online Pakistan",
  ],
  authors:[{ name: "AIDLA" }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      en: `${SITE_URL}/`,
      ur: `${SITE_URL}/`,
      ar: `${SITE_URL}/`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "AIDLA",
    locale: "en_US",
    url: `${SITE_URL}/`,
    title: "AIDLA — Free Learning, Earn Coins & Win Prizes",
    description: "Pakistan's #1 free education platform. Take quizzes, earn coins, win real prizes.",
    images:[
      {
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "AIDLA — Learn, Earn, Win",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIDLA",
    title: "AIDLA — Free Learning, Earn Coins & Win Prizes",
    description: "Pakistan's #1 free education platform.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const QUOTES =[
  {
    text: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    translation: "Seeking knowledge is an obligation upon every Muslim.",
    source: "Prophet Muhammad ﷺ (Ibn Majah)",
    lang: "ar",
    theme: styles.quoteTheme1,
  },
  {
    text: "خِيرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    translation: "The best of people are those most beneficial to others.",
    source: "Prophet Muhammad ﷺ",
    lang: "ar",
    theme: styles.quoteTheme2,
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    source: "Nelson Mandela",
    lang: "en",
    theme: styles.quoteTheme3,
  },
  {
    text: "علم کی شمع جلاؤ، جہالت کا اندھیرا مٹاؤ",
    translation: "Light the candle of knowledge, erase the darkness of ignorance.",
    source: "Allama Iqbal",
    lang: "ur",
    theme: styles.quoteTheme4,
  },
  {
    text: "خود کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے — بتا تیری رضا کیا ہے",
    translation: "Raise yourself so high that before every decree, God Himself asks: what is your desire?",
    source: "Allama Iqbal",
    lang: "ur",
    theme: styles.quoteTheme5,
  },
  {
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    source: "Prophet Muhammad ﷺ",
    lang: "en",
    theme: styles.quoteTheme6,
  },
  {
    text: "وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا",
    translation: "Whoever is given wisdom has been given much good.",
    source: "Quran 2:269",
    lang: "ar",
    theme: styles.quoteTheme7,
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "AIDLA",
      alternateName: "AIDLA — Learn, Earn & Grow",
      description: "Pakistan's #1 free education platform. Complete quizzes, earn coins, win prizes, access free learning resources.",
      inLanguage: ["en", "ur"],
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/faqs?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": ["Organization", "EducationalOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: "AIDLA",
      alternateName: "AI-Driven Learning Academy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        contentUrl: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
        caption: "AIDLA",
      },
      image: { "@id": `${SITE_URL}/#logo` },
      description: "AIDLA is Pakistan's #1 free education and rewards platform. Students take quizzes, earn AIDLA Coins, spin the lucky wheel, win real cash prizes, and access free study materials — all 100% free.",
      foundingDate: "2024",
      inLanguage: ["en", "ur"],
      areaServed: { "@type": "Country", name: "Pakistan" },
      address: { "@type": "PostalAddress", addressCountry: "PK" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${SITE_URL}/contact`,
        availableLanguage: ["English", "Urdu"],
      },
      sameAs: [
        "https://facebook.com/aidla",
        "https://instagram.com/aidla",
        "https://youtube.com/aidla",
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
      dateModified: LAST_MODIFIED,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }],
      },
    },
    {
      "@type": "HowTo",
      name: "How to Earn Coins on AIDLA",
      description: "Four simple steps from sign-up to cash in hand on AIDLA.",
      step: [
        { "@type": "HowToStep", name: "Sign Up Free",  text: "Create your account in under 30 seconds — no payment needed." },
        { "@type": "HowToStep", name: "Learn & Play",  text: "Take quizzes, enter lucky draws, spin the lucky wheel." },
        { "@type": "HowToStep", name: "Earn Coins",    text: "Collect AIDLA Coins for every quiz, draw entry, and achievement." },
        { "@type": "HowToStep", name: "Cash Out",      text: "Redeem rewards or withdraw your earnings to your bank account." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is AIDLA free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. AIDLA is 100% free — no subscription, no hidden fees." },
        },
        {
          "@type": "Question",
          name: "How do I earn coins on AIDLA?",
          acceptedAnswer: { "@type": "Answer", text: "Complete quizzes, enter lucky draws, spin the lucky wheel, and refer friends to earn AIDLA Coins." },
        },
        {
          "@type": "Question",
          name: "Can I withdraw my AIDLA coins?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. AIDLA Coins can be redeemed for prizes or withdrawn to your bank account once you reach the minimum threshold." },
        },
      ],
    },
  ],
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = new Date() - d;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function maskName(name) {
  if (!name) return "A";
  return name.trim().split(" ")[0];
}

const STATUS_META = {
  voting: { cls: styles.sbVoting, label: "Voting Open" },
  selected: { cls: styles.sbSelected, label: "Shortlisted" },
  soon: { cls: styles.sbSoon, label: "Coming Soon" },
  live: { cls: styles.sbLive, label: "Live" },
};

export default async function Home() {
  // ✅ FIX: Await cookies() to support Next.js 15+ asynchronous dynamic APIs
  const cookieStore = await cookies();
  const votedFeatures = cookieStore.get("aidla_voted_fp")?.value || "{}";
  const userVoted = JSON.parse(votedFeatures);

  let blogs = null, news = null, announcements = null, draws = null, wheelRaw = null, testers = null, reviews = null, faqs = null;

  // Only fetch data if supabase is initialized
  if (supabase) {
    const results = await Promise.all([
      supabase.from("blogs_posts").select("id,title,excerpt,tags,published_at,slug,view_count").is("deleted_at", null).eq("status", "published").order("published_at", { ascending: false }).limit(6),
      supabase.from("news_posts").select("id,title,excerpt,tags,published_at,slug,view_count").is("deleted_at", null).eq("status", "published").order("published_at", { ascending: false }).limit(6),
      supabase.from("announcements").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
      supabase.from("luckydraw_results").select("id,winner_name,draw_title,prize_text,announced_at").order("announced_at", { ascending: false }).limit(5),
      supabase.from("luckywheel_history").select("id,user_id,result_type,coins_won,created_at").in("result_type", ["coins", "gift"]).order("created_at", { ascending: false }).limit(5),
      supabase.from("test_winners").select("id,user_name,rank_no,approved_at,test_id,test_tests(title)").order("approved_at", { ascending: false }).limit(5),
      supabase.from("user_reviews").select("id,full_name,rating,review_text,created_at").eq("is_approved", true).order("created_at", { ascending: false }).limit(10),
      supabase.from("faqs").select("id,question,answer,slug,category").eq("status", "published").eq("is_visible", true).order("helpful_yes", { ascending: false }).limit(6),
    ]);
    blogs = results[0].data;
    news = results[1].data;
    announcements = results[2].data;
    draws = results[3].data;
    wheelRaw = results[4].data;
    testers = results[5].data;
    reviews = results[6].data;
    faqs = results[7].data;
  }

  const userIds = wheelRaw?.map((w) => w.user_id) ||[];
  let userMap = {};
  if (userIds.length && supabase) {
    const { data: profiles } = await supabase.from("users_profiles").select("id,full_name").in("id", userIds);
    if (profiles) userMap = Object.fromEntries(profiles.map((p) =>[p.id, p.full_name || "Anonymous"]));
  }
  const wheel = wheelRaw?.map((w) => ({ ...w, user_name: userMap[w.user_id] || "Anonymous" })) ||[];
  const maxVotes = Math.max(...(announcements?.map((i) => i.vote_count || 0) ||[1]), 1);

  // Next.js Server Actions for Forms (Zero Client JS)
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

    // ✅ FIX: revalidate the home page after voting
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
    // ✅ FIX: revalidate the home page after newsletter signup (though not strictly needed, it's safe)
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  }

  async function submitReview(formData) {
    "use server";
    if (formData.get("honey")) return;
    const full_name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const rating = parseInt(formData.get("rating")?.toString() || "5", 10);
    const review_text = formData.get("review")?.toString().trim();
    if (full_name && email && review_text) {
      await supabase.from("user_reviews").insert({ full_name, email, rating, review_text, is_approved: false });
    }
    // ✅ FIX: revalidate the home page after review submission
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  }

  return (
    <div className={styles.pageRoot}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      <main id="main-content">
        {/* ════════════════ HERO ════════════════ */}
        <section className={styles.heroSection} aria-labelledby="hero-heading">
          <div className={styles.heroAurora} aria-hidden="true">
            <div className={`${styles.auroraBlob} ${styles.auroraBlob1}`} />
            <div className={`${styles.auroraBlob} ${styles.auroraBlob2}`} />
            <div className={`${styles.auroraBlob} ${styles.auroraBlob3}`} />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <span className={styles.coinBadge} aria-label="AIDLA Coins — earn by learning">
                🪙 AIDLA Coins — Learn &amp; Earn
              </span>

              <div className={styles.heroH1Wrap}>
                <h1 id="hero-heading" className={styles.heroH1}>
                  Learn. <span className={styles.heroH1Accent}>Earn Coins.</span> Redeem Rewards.
                </h1>
              </div>

              <p className={styles.heroPara}>
                Pakistan&apos;s number one free education platform. Complete quizzes, spin the lucky wheel, and win real prizes. Convert your <strong>AIDLA Coins</strong> to products or cash.
              </p>

              <div className={styles.heroBtns}>
                <Link href="/signup" className={styles.btnPrimary}>🚀 Start Free</Link>
                <Link href="/about" className={styles.btnSecondary}>Learn More</Link>
              </div>

              <div className={styles.trustStrip} aria-label="Trust indicators">
                <span>✅ Free to Join</span>
                <span>🏆 Daily Prizes</span>
                <span>🇵🇰 Made in Pakistan</span>
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.heroStatCard}>
                <div className={styles.heroStatVal}>50K+</div>
                <div className={styles.heroStatLbl}>Active Learners</div>
              </div>
              <div className={`${styles.heroStatCard} ${styles.heroStatCardGold}`}>
                <div className={styles.heroStatVal}>₨2M+</div>
                <div className={styles.heroStatLbl}>Coins Earned</div>
              </div>
              <div className={styles.heroStatCard}>
                <div className={styles.heroStatVal}>1,200+</div>
                <div className={styles.heroStatLbl}>Prizes Claimed</div>
              </div>
              <div className={`${styles.heroStatCard} ${styles.heroStatCardSky}`}>
                <div className={styles.heroStatVal}>500+</div>
                <div className={styles.heroStatLbl}>Daily Quizzes</div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ TRUST BAR ════════════════ */}
        <section className={styles.trustBar} aria-label="Platform highlights">
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
        <section className={styles.sectionWrap} aria-labelledby="quotes-heading">
          <h2 className={styles.sectionHeading} id="quotes-heading">Words of Wisdom</h2>
          <p className={styles.sectionSub}>Inspired by Quran, Hadith, great thinkers and poets across languages</p>
          
          <div className={styles.qsOuter} role="region" aria-label="Inspirational quotes">
            <div className={styles.nativeScrollContainer}>
              {QUOTES.map((q, i) => (
                <article key={i} className={`${styles.qsSlide} ${q.theme} ${styles.scrollItem}`}>
                  <div className={styles.qsDeco} aria-hidden="true">
                    <div className={`${styles.qsDecoCircle} ${styles.qsDecoCircle1}`} />
                    <div className={`${styles.qsDecoCircle} ${styles.qsDecoCircle2}`} />
                    <div className={styles.qsDecoLine} />
                  </div>
                  <div className={styles.qsContent}>
                    <div className={`${styles.qsText} ${q.lang === "en" ? styles.qsTextEn : styles.qsTextArUr}`} lang={q.lang}>
                      &quot;{q.text}&quot;
                    </div>
                    {q.translation && <div className={styles.qsTranslation}>{q.translation}</div>}
                    <span className={styles.qsSource}>{q.source}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="how-heading">
          <h2 className={styles.sectionHeading} id="how-heading">How It Works</h2>
          <p className={styles.sectionSub}>Four simple steps from sign-up to cash in hand</p>
          <ol className={styles.stepsRow} aria-label="Steps to earn on AIDLA">
            {[
              { icon: "📝", title: "Sign Up Free", desc: "Create your account in under 30 seconds." },
              { icon: "📚", title: "Learn & Play", desc: "Take quizzes, enter draws, spin the wheel." },
              { icon: "🪙", title: "Earn Coins", desc: "Collect AIDLA Coins for every achievement." },
              { icon: "💵", title: "Cash Out", desc: "Redeem rewards or withdraw to your bank." },
            ].map((step, i) => (
              <li key={i} className={styles.stepItem}>
                <div className={styles.stepCircle} aria-hidden="true">{step.icon}</div>
                <strong className={styles.stepTitle}>{step.title}</strong>
                <p className={styles.stepDesc}>{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ════════════════ FEATURES ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="features-heading">
          <h2 className={styles.sectionHeading} id="features-heading">The AIDLA Ecosystem</h2>
          <p className={styles.sectionSub}>Everything you need to learn, play and earn in one place</p>
          <div className={styles.featuresGrid}>
            {[
              { icon: "📚", color: styles.featBlue, label: "Smart Quizzes", desc: "Curriculum-aligned tests designed to maximise learning outcomes." },
              { icon: "🎲", color: styles.featAmber, label: "Lucky Draws", desc: "Enter exclusive prize draws with your coins and win weekly." },
              { icon: "🎡", color: styles.featGreen, label: "Lucky Wheel", desc: "Spin daily for bonus coins, gifts, and extra draw chances." },
              { icon: "🛍️", color: styles.featPurple, label: "Rewards Shop", desc: "Redeem coins for gadgets, gift cards and vouchers." },
              { icon: "💵", color: styles.featRed, label: "Cash Withdrawals", desc: "Transfer your coin balance directly to your bank account." },
              { icon: "📊", color: styles.featSky, label: "Leaderboards", desc: "Compete with thousands and climb the global rankings." },
              { icon: "📰", color: styles.featPink, label: "Education News", desc: "Stay updated with latest Pakistan education news daily." },
            ].map((f, i) => (
              <article key={i} className={`${styles.featCard} ${f.color}`}>
                <div className={styles.featIcon} aria-hidden="true">{f.icon}</div>
                <h3 className={styles.featTitle}>{f.label}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ════════════════ BLOGS ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="blogs-heading">
          <h2 className={styles.sectionHeading} id="blogs-heading">📝 Latest Blogs</h2>
          <p className={styles.sectionSub}>Expert education insights, tips and guides</p>
          
          <div className={styles.csWrap}>
            <div className={styles.nativeScrollContainer}>
              {blogs?.map((item) => (
                <div key={item.id} className={styles.scrollItem}>
                  <Link href={`/blogs/${item.slug}`} className={`${styles.ccCard} ${styles.ccCardBlog}`} aria-label={`Blog: ${item.title}`}>
                    <div className={styles.ccAccent} aria-hidden="true" />
                    <div className={styles.ccBody}>
                      <div className={styles.ccMetaTop}>
                        <span className={`${styles.ccPill} ${styles.ccPillBlog}`}>Blog</span>
                        <span className={styles.ccDate}>{formatDate(item.published_at)}</span>
                      </div>
                      <h3 className={styles.ccTitle}>{item.title}</h3>
                      {item.excerpt && <p className={styles.ccExcerpt}>{item.excerpt}</p>}
                      <div className={styles.ccFooter}>
                        <span className={styles.ccViews}>👁 {(item.view_count || 0).toLocaleString()}</span>
                        <span className={`${styles.ccRead} ${styles.ccReadBlog}`}>Read →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className={styles.csViewAll}>
              <Link href="/blogs" className={styles.viewAllBtn}>View All Blogs →</Link>
            </div>
          </div>
        </section>

        {/* ════════════════ NEWS ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="news-heading">
          <h2 className={styles.sectionHeading} id="news-heading">📰 Latest Education News</h2>
          <p className={styles.sectionSub}>Stay updated with Pakistan's education sector</p>
          
          <div className={styles.csWrap}>
            <div className={styles.nativeScrollContainer}>
              {news?.map((item) => (
                <div key={item.id} className={styles.scrollItem}>
                  <Link href={`/news/${item.slug}`} className={`${styles.ccCard} ${styles.ccCardNews}`} aria-label={`News: ${item.title}`}>
                    <div className={styles.ccAccent} aria-hidden="true" />
                    <div className={styles.ccBody}>
                      <div className={styles.ccMetaTop}>
                        <span className={`${styles.ccPill} ${styles.ccPillNews}`}>News</span>
                        <span className={styles.ccDate}>{formatDate(item.published_at)}</span>
                      </div>
                      <h3 className={styles.ccTitle}>{item.title}</h3>
                      {item.excerpt && <p className={styles.ccExcerpt}>{item.excerpt}</p>}
                      <div className={styles.ccFooter}>
                        <span className={styles.ccViews}>👁 {(item.view_count || 0).toLocaleString()}</span>
                        <span className={`${styles.ccRead} ${styles.ccReadNews}`}>Read →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className={styles.csViewAll}>
              <Link href="/news" className={styles.viewAllBtn}>View All News →</Link>
            </div>
          </div>
        </section>

        {/* ════════════════ UPCOMING FEATURES ════════════════ */}
        <section className={styles.sectionWrap}>
          <div className={styles.upcomingSection} aria-labelledby="upcoming-heading">
            <h2 className={styles.sectionHeading} id="upcoming-heading" style={{ textAlign: "left", marginBottom: 4 }}>
              You Decide What We Build
            </h2>
            <p className={styles.sectionSub} style={{ textAlign: "left" }}>Tap to vote instantly — no sign-up needed.</p>

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
                        <button type="submit" className={`${styles.voteBtn} ${voted ? styles.voteBtnVoted : ""}`} disabled={voted}>
                          {voted ? "✅ Voted" : "👍 Vote"}
                        </button>
                      </form>
                    )}
                  </div>
                  {f.description && <p className={styles.fvDesc}>{f.description}</p>}
                  <div className={styles.fvBarWrap}>
                    <div className={styles.fvBar} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className={`${styles.fvFill} ${voted ? styles.fvFillVoted : ""}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.fvCount}><strong>{(f.vote_count || 0).toLocaleString()}</strong> votes</span>
                  </div>
                </article>
              );
            })}
            <p className={styles.fvHow}>Vote → Shortlist → Launch — we build the most-voted features first.</p>
          </div>
        </section>

        {/* ════════════════ NEWSLETTER ════════════════ */}
        <section className={styles.sectionWrap}>
          <div className={styles.nlSection} aria-labelledby="nl-heading">
            <div className={styles.nlBg} aria-hidden="true" />
            <div className={styles.nlInner}>
              <h2 id="nl-heading" className={styles.nlTitle}>📬 Never Miss an Update</h2>
              <p className={styles.nlSub}>Get daily education news, prize alerts, and new feature announcements.</p>

              <form action={submitNewsletter} className={styles.nlForm}>
                <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                  <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
                </div>
                <label htmlFor="nl-email" className={styles.srOnly}>Email address</label>
                <input id="nl-email" name="email" type="email" className={styles.nlInput} placeholder="Enter your email address…" required />
                <button type="submit" className={styles.nlBtn}>Subscribe 🚀</button>
              </form>
              <p className={styles.nlPrivacy}>No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </section>

        {/* ════════════════ WINNERS ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="winners-heading">
          <h2 className={styles.sectionHeading} id="winners-heading">🏆 Recent Winners</h2>
          <p className={styles.sectionSub}>Real people. Real rewards. Updated live.</p>

          <div className={styles.winnersGrid}>
            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">🎲</span>
                <h3>Lucky Draw</h3>
              </div>
              <table className={styles.winnerTable}>
                <thead>
                  <tr><th scope="col">Winner</th><th scope="col">Prize</th><th scope="col">When</th></tr>
                </thead>
                <tbody>
                  {draws?.map((row) => (
                    <tr key={row.id}>
                      <td><strong>{row.winner_name}</strong><br /><small>{row.draw_title}</small></td>
                      <td className={styles.tdPrize}>{row.prize_text}</td>
                      <td className={styles.tdDate}>{formatDate(row.announced_at)}</td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </article>

            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">🎡</span>
                <h3>Wheel Winners</h3>
              </div>
              <table className={styles.winnerTable}>
                <thead>
                  <tr><th scope="col">User</th><th scope="col">Reward</th><th scope="col">When</th></tr>
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
                      <td className={styles.tdDate}>{formatDate(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className={styles.winnerCard}>
              <div className={styles.winnerCardHd}>
                <span aria-hidden="true">📝</span>
                <h3>Test Toppers</h3>
              </div>
              <table className={styles.winnerTable}>
                <thead>
                  <tr><th scope="col">Rank</th><th scope="col">Student</th><th scope="col">Test</th><th scope="col">When</th></tr>
                </thead>
                <tbody>
                  {testers?.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className={`${styles.rankBadge} ${row.rank_no === 1 ? styles.rank1 : row.rank_no === 2 ? styles.rank2 : row.rank_no === 3 ? styles.rank3 : styles.rankO}`}>
                          #{row.rank_no}
                        </span>
                       </td>
                      <td><strong>{row.user_name}</strong></td>
                      <td>{row.test_tests?.title || "Untitled"}</td>
                      <td className={styles.tdDate}>{formatDate(row.approved_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </section>

        {/* ════════════════ REVIEWS ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="reviews-heading">
          <h2 className={styles.sectionHeading} id="reviews-heading">⭐ What Our Learners Say</h2>
          <p className={styles.sectionSub}>Real reviews from real students — verified and approved</p>

          <div className={styles.rvSliderOuter}>
             <div className={styles.nativeScrollContainer}>
              {reviews?.map((r) => (
                <article key={r.id} className={`${styles.rvCard} ${styles.scrollItem}`}>
                  <div className={styles.rvStars} role="img" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} aria-hidden="true">{i < r.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <p className={styles.rvText}>&quot;{r.review_text}&quot;</p>
                  <div className={styles.rvAuthor}>
                    <div className={styles.rvAvatar} aria-hidden="true">{(r.full_name?.[0] || "A").toUpperCase()}</div>
                    <div>
                      <div className={styles.rvName}>{maskName(r.full_name)}</div>
                      <div className={styles.rvWhen}>{formatDate(r.created_at)}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.rvFormBox} aria-labelledby="rv-form-heading">
            <h3 id="rv-form-heading" className={styles.rvFormTitle}>✍️ Share Your Experience</h3>
            <p className={styles.rvFormSub}>No login needed. Reviews appear after approval.</p>
            <form action={submitReview}>
              <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                <input type="text" name="honey" tabIndex={-1} autoComplete="off" />
              </div>
              <div className={styles.rvRow2}>
                <div>
                  <label className={styles.rvLabel} htmlFor="rv-name">Name</label>
                  <input id="rv-name" name="name" className={styles.rvInput} placeholder="Your name" required />
                </div>
                <div>
                  <label className={styles.rvLabel} htmlFor="rv-email">Email</label>
                  <input id="rv-email" name="email" type="email" className={styles.rvInput} placeholder="you@email.com" required />
                </div>
              </div>
              <div className={styles.rvRow2}>
                <div>
                   <label className={styles.rvLabel} htmlFor="rv-rating">Rating</label>
                   <select id="rv-rating" name="rating" className={styles.rvInput} required>
                     <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                     <option value="4">⭐⭐⭐⭐ Very Good</option>
                     <option value="3">⭐⭐⭐ Good</option>
                     <option value="2">⭐⭐ Fair</option>
                     <option value="1">⭐ Poor</option>
                   </select>
                </div>
              </div>
              <label className={styles.rvLabel} htmlFor="rv-text">Your Review</label>
              <textarea id="rv-text" name="review" className={styles.rvTextarea} placeholder="Share your experience with AIDLA (min. 20 characters)..." required minLength={20} maxLength={500} rows={4} />
              <button type="submit" className={styles.rvSubmit}>Submit Review</button>
            </form>
          </div>
        </section>

        {/* ════════════════ FAQ ════════════════ */}
        <section className={styles.sectionWrap} aria-labelledby="faq-heading">
          <h2 className={styles.sectionHeading} id="faq-heading">Frequently Asked Questions</h2>
          <p className={styles.sectionSub}>Quick answers to what students ask most</p>
          <div className={styles.faqList}>
            {faqs?.map((f) => (
              <details key={f.id} className={styles.faqItem}>
                <summary className={styles.faqQ}>
                  <span>{f.question}</span>
                  <span className={styles.faqChevron} aria-hidden="true">▼</span>
                </summary>
                <div className={styles.faqA}>
                  <div className={styles.faqAInner} dangerouslySetInnerHTML={{ __html: f.answer }} />
                  <Link href={`/faqs/${f.slug}`} className={styles.faqFullLink}>Read full answer →</Link>
                </div>
              </details>
            ))}
          </div>
          <div className={styles.faqSeeAll}>
            <Link href="/faqs" className={styles.viewAllBtn}>Browse All FAQs →</Link>
          </div>
        </section>

        {/* ════════════════ CTA ════════════════ */}
        <section className={styles.ctaSection} aria-labelledby="cta-heading">
          <div className={styles.ctaBg} aria-hidden="true">
            <div className={`${styles.ctaBlob} ${styles.ctaBlob1}`} />
            <div className={`${styles.ctaBlob} ${styles.ctaBlob2}`} />
          </div>
          <div className={styles.ctaInner}>
            <span className={styles.ctaBadge}>🌟 Join Thousands of Learners Today</span>
            <h2 id="cta-heading" className={styles.ctaTitle}>Your Knowledge is Your Greatest Asset</h2>
            <p className={styles.ctaSub}>Every quiz you complete earns real, redeemable AIDLA Coins. Start your journey today — it&apos;s completely free.</p>
            <Link href="/signup" className={styles.ctaBtn}>✨ Get Started — It&apos;s Free</Link>
          </div>
        </section>

      </main>
    </div>
  );
}