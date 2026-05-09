// app/page.jsx
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://www.aidla.online";
const LAST_MODIFIED = "2026-05-09";

export const revalidate = 3600;

export const metadata = {
  title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
  description:
    "AIDLA is Pakistan #1 AI powered learning platform for free quizzes, courses, AI tools, daily quiz winners, AIDLA Coins, and learner rewards.",
  keywords: [
    "AIDLA",
    "free learning platform Pakistan",
    "Pakistan #1 AI powered learning platform",
    "AI learning Pakistan",
    "online quizzes Pakistan",
    "AIDLA coins",
    "free education app Pakistan",
    "student rewards Pakistan",
    "daily quiz Pakistan",
    "learn and earn Pakistan",
    "KPK learning platform",
    "Peshawar education",
    "AI digital learning academy",
  ],
  authors: [{ name: "AIDLA", url: SITE_URL }],
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
    title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
    description:
      "Free quizzes, courses, AI tools, daily quiz winners, AIDLA Coins, and real rewards for Pakistani learners.",
    images: [
      {
        url: `${SITE_URL}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "AIDLA free AI learning and rewards platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIDLA_online",
    creator: "@AIDLA_online",
    title: "AIDLA - Pakistan #1 AI Powered Learning Platform",
    description:
      "Study with free quizzes, AI tools, courses, daily quiz competitions, and AIDLA Coins.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

const STATS = [
  { value: "100%", label: "Free to join" },
  { value: "#1", label: "AI powered learning" },
  { value: "PK", label: "Built for Pakistan" },
];

const TRUST_ITEMS = [
  "Curriculum quizzes",
  "Daily quiz winners",
  "AI career tools",
  "Coins and rewards",
  "Wallet and shop",
  "Mobile friendly",
];

const STEPS = [
  {
    eyebrow: "01",
    title: "Learn",
    text: "Take short quizzes, courses, and practice activities made for Pakistani learners.",
  },
  {
    eyebrow: "02",
    title: "Earn",
    text: "Collect AIDLA Coins as you complete learning actions and build daily momentum.",
  },
  {
    eyebrow: "03",
    title: "Redeem",
    text: "Use your coins for platform rewards, prizes, and future learner benefits.",
  },
];

const FEATURES = [
  {
    title: "Daily Quizz",
    text: "Compete every day, see yesterday's winners, and earn coins for consistent learning.",
    href: "/user/dailyquizz",
    label: "Play daily quiz",
  },
  {
    title: "Courses and Resources",
    text: "Structured courses and study resources for learners who want clear next steps.",
    href: "/courses",
    label: "Browse courses",
  },
  {
    title: "AI Career Tools",
    text: "CV, cover letter, summarizer, paraphraser, interview prep, email writer, and more.",
    href: "/tools",
    label: "Open tools",
  },
  {
    title: "Rewards, Wallet and Shop",
    text: "Earn AIDLA Coins, track wallet activity, redeem products, and manage withdrawals.",
    href: "/user/shop",
    label: "See rewards",
  },
  {
    title: "Leaderboards and Tests",
    text: "Live rankings, quiz champions, test winners, and prize history in one place.",
    href: "/leaderboard",
    label: "View ranks",
  },
  {
    title: "Community Learning",
    text: "Forum, social learning, lucky draw, lucky wheel, referrals, and learner milestones.",
    href: "/user",
    label: "Go to dashboard",
  },
];

const FALLBACK_FAQS = [
  {
    question: "Is AIDLA free?",
    answer:
      "Yes. AIDLA is free to join and gives learners access to quizzes, tools, and rewards-focused learning features.",
    slug: "is-aidla-free",
  },
  {
    question: "How do AIDLA Coins work?",
    answer:
      "Learners earn coins by completing learning activities. Coins are designed to unlock rewards and keep students motivated.",
    slug: "how-aidla-coins-work",
  },
  {
    question: "Who is AIDLA for?",
    answer:
      "AIDLA is built for students, job seekers, and self-learners in Pakistan who want free digital learning support.",
    slug: "who-is-aidla-for",
  },
];

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateKey(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDateKey(dateKey) {
  if (!dateKey) return "";
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function getHomeData() {
  const winnerDate = getDateKey(-1);

  if (!supabase) {
    return { posts: [], reviews: [], faqs: FALLBACK_FAQS, dailyWinners: [], winnerDate };
  }

  const [blogsRes, newsRes, reviewsRes, faqsRes, dailyQuizRes] = await Promise.all([
    supabase
      .from("blogs_posts")
      .select("id,title,excerpt,published_at,slug,view_count")
      .is("deleted_at", null)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2),
    supabase
      .from("news_posts")
      .select("id,title,excerpt,published_at,slug,view_count")
      .is("deleted_at", null)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2),
    supabase
      .from("user_reviews")
      .select("id,full_name,rating,review_text,created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("faqs")
      .select("id,question,answer,slug")
      .eq("status", "published")
      .eq("is_visible", true)
      .order("helpful_yes", { ascending: false })
      .limit(4),
    supabase.rpc("daily_quiz_leaderboard", { p_date: winnerDate }),
  ]);

  const posts = [
    ...(blogsRes.data || []).map((item) => ({ ...item, type: "Blog", href: `/blogs/${item.slug}` })),
    ...(newsRes.data || []).map((item) => ({ ...item, type: "News", href: `/news/${item.slug}` })),
  ]
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))
    .slice(0, 3);

  const faqs = (faqsRes.data || FALLBACK_FAQS).map((faq) => ({
    ...faq,
    answer: stripHtml(faq.answer),
  }));

  return {
    posts,
    reviews: reviewsRes.data || [],
    faqs: faqs.length ? faqs : FALLBACK_FAQS,
    dailyWinners: (dailyQuizRes.data?.winners || []).slice(0, 3),
    winnerDate,
  };
}

export default async function Home() {
  const { posts, reviews, faqs, dailyWinners, winnerDate } = await getHomeData();

  /* ── Full structured data: AEO, GEO, Local SEO, Technical SEO, International SEO ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      /* ── Organization ── */
      {
        "@type": ["Organization", "EducationalOrganization", "OnlineBusiness", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: "AIDLA",
        legalName: "AIDLA - AI Digital Learning Academy",
        alternateName: [
          "AI Digital Learning Academy",
          "AIDLA Online",
          "AIDLA Pakistan",
          "Pakistan #1 AI Powered Learning Platform",
        ],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/logo.png`,
          contentUrl: `${SITE_URL}/logo.png`,
          width: 200,
          height: 60,
        },
        image: `${SITE_URL}/og-home.jpg`,
        foundingDate: "2026",
        slogan: "Study smarter. Earn coins. Build your future.",
        description:
          "AIDLA is Pakistan #1 AI powered learning platform offering free courses, daily quizzes, AI tools, career resources, AIDLA Coins, and rewards.",
        /* ── Local SEO: full address with postal code ── */
        areaServed: [
          { "@type": "Country", name: "Pakistan", "@id": "https://www.wikidata.org/wiki/Q843" },
          { "@type": "City", name: "Peshawar" },
          { "@type": "AdministrativeArea", name: "Khyber Pakhtunkhwa" },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Peshawar",
          addressLocality: "Peshawar",
          addressRegion: "Khyber Pakhtunkhwa",
          postalCode: "25000",
          addressCountry: "PK",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "34.0150",
          longitude: "71.5249",
        },
        hasMap: "https://maps.google.com/?q=Peshawar,+Khyber+Pakhtunkhwa,+Pakistan",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+923044678929",
          contactType: "customer support",
          areaServed: "PK",
          availableLanguage: ["English", "Urdu"],
          url: `${SITE_URL}/contact`,
        },
        founder: { "@id": `${SITE_URL}/#founder` },
        /* ── GEO / International SEO ── */
        knowsAbout: [
          "AI Learning",
          "Online Education",
          "Pakistan Education",
          "Daily Quizzes",
          "Career Tools",
          "CV Builder",
          "Rewards Based Learning",
          "Student Wallets",
          "KPK Education",
          "Peshawar Online Learning",
        ],
        sameAs: [
          "https://www.instagram.com/aidla_official/",
          "https://www.facebook.com/profile.php?id=61586195563121",
          "https://www.linkedin.com/company/110859146/",
          "https://www.tiktok.com/@aidla_official",
          "https://twitter.com/aidla_official",
          "https://www.youtube.com/@aidla_official",
        ],
      },

      /* ── Founder Person — for indexing ── */
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: "Engineer Muhammad Zubair Afridi",
        givenName: "Muhammad Zubair",
        familyName: "Afridi",
        honorificPrefix: "Engineer",
        jobTitle: "Founder & CEO",
        worksFor: { "@id": `${SITE_URL}/#organization` },
        telephone: "+923044678929",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Peshawar",
          addressLocality: "Peshawar",
          addressRegion: "Khyber Pakhtunkhwa",
          postalCode: "25000",
          addressCountry: "PK",
        },
        /* Founder social profiles — bot/crawler visible for Knowledge Panel */
        sameAs: [
          "https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/",
          "https://www.facebook.com/engrzubairafridi/",
          "https://www.instagram.com/muhammad.zubair.afridi/",
        ],
      },

      /* ── WebSite ── */
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "AIDLA",
        alternateName: "AIDLA Online",
        description:
          "Pakistan #1 AI powered learning platform for free quizzes, AI tools, courses, and learner rewards.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "ur"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/faqs?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },

      /* ── WebPage ── */
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: "AIDLA - Pakistan #1 AI Powered Learning Platform",
        description:
          "AIDLA helps Pakistani learners study with free quizzes, AI tools, courses, daily quiz competitions, AIDLA Coins, and rewards.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: `${SITE_URL}/og-home.jpg`,
        inLanguage: "en",
        dateModified: LAST_MODIFIED,
        breadcrumb: { "@id": `${SITE_URL}/#breadcrumb` },
        mainContentOfPage: { "@type": "WebPageElement", cssSelector: "#main-content" },
        /* speakable for AEO / voice assistants */
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#hero-heading", "#how-heading", "#faq-heading"],
        },
      },

      /* ── Breadcrumb ── */
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ],
      },

      /* ── HowTo — AEO ── */
      {
        "@type": "HowTo",
        "@id": `${SITE_URL}/#howto`,
        name: "How AIDLA Works",
        description: "Learn how to study, earn AIDLA Coins, and redeem rewards on Pakistan's #1 AI learning platform.",
        step: STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.text,
        })),
      },

      /* ── Site sections ItemList ── */
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#site-sections`,
        name: "AIDLA public and learner sections",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Courses", url: `${SITE_URL}/courses` },
          { "@type": "ListItem", position: 2, name: "Daily Quizz", url: `${SITE_URL}/user/dailyquizz` },
          { "@type": "ListItem", position: 3, name: "AI Tools", url: `${SITE_URL}/tools` },
          { "@type": "ListItem", position: 4, name: "Leaderboard", url: `${SITE_URL}/leaderboard` },
          { "@type": "ListItem", position: 5, name: "Resources", url: `${SITE_URL}/resources` },
          { "@type": "ListItem", position: 6, name: "News", url: `${SITE_URL}/news` },
          { "@type": "ListItem", position: 7, name: "FAQs", url: `${SITE_URL}/faqs` },
        ],
      },

      /* ── Daily quiz winners ── */
      ...(dailyWinners.length
        ? [
            {
              "@type": "ItemList",
              "@id": `${SITE_URL}/#daily-quiz-winners`,
              name: `AIDLA Daily Quizz Winners - ${winnerDate}`,
              itemListElement: dailyWinners.map((winner, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: winner.full_name || "AIDLA Learner",
                url: `${SITE_URL}/user/dailyquizz`,
              })),
            },
          ]
        : []),

      /* ── FAQ — AEO rich result ── */
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faqpage`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },

      /* ── EducationalOrganization extra — GEO / International SEO ── */
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#edu-org`,
        name: "AIDLA - AI Digital Learning Academy",
        url: SITE_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Peshawar",
          addressLocality: "Peshawar",
          addressRegion: "Khyber Pakhtunkhwa",
          postalCode: "25000",
          addressCountry: "PK",
        },
        telephone: "+923044678929",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Free Learning Courses and Quizzes",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: "Free Online Quizzes",
                description: "Daily quiz competitions for Pakistani learners with AIDLA Coins rewards.",
                provider: { "@id": `${SITE_URL}/#organization` },
              },
              price: "0",
              priceCurrency: "PKR",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: "AI Career Tools",
                description: "CV builder, cover letter generator, interview prep, and more.",
                provider: { "@id": `${SITE_URL}/#organization` },
              },
              price: "0",
              priceCurrency: "PKR",
              availability: "https://schema.org/InStock",
            },
          ],
        },
      },
    ],
  };

  async function submitNewsletter(formData) {
    "use server";
    if (!supabase || formData.get("honey")) return;

    const email = formData.get("email")?.toString().trim().toLowerCase();
    if (email && email.includes("@")) {
      await supabase.from("newsletter_subscribers").insert({ email });
    }
  }

  return (
    <div className={"home-page-root"}>
      {/* ── Structured data — bots only ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
        LCP OPTIMISATION: Preload the hero heading font subset.
        The Playfair Display woff2 for bold Latin is the LCP text element on mobile.
        This hint fires before CSS is parsed, cutting ~300-400ms off LCP.
        ⚠️  Replace the href with the actual chunk URL from your build output
            (found in .next/static/media/ or from the network waterfall).
        If using next/font, this is handled automatically — remove this link.
      */}
      {/* <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/_next/static/media/playfair-display-latin-900.woff2"
        crossOrigin="anonymous"
      /> */}

      {/*
        Founder social links — .home-founder-links uses clip visually hidden
        but NOT aria-hidden, so links remain accessible AND crawler-visible.
        tabIndex={-1} keeps them out of tab order while staying in a11y tree.
        Helps Google build a Knowledge Panel for Engineer Muhammad Zubair Afridi.
      */}
      <nav className="home-founder-links" aria-label="Founder social profiles">
        <a href="https://www.linkedin.com/in/muhammad-zubair-afridi-191319216/" rel="author noopener noreferrer" tabIndex={-1}>
          Engineer Muhammad Zubair Afridi on LinkedIn
        </a>
        <a href="https://www.facebook.com/engrzubairafridi/" rel="author noopener noreferrer" tabIndex={-1}>
          Engineer Muhammad Zubair Afridi on Facebook
        </a>
        <a href="https://www.instagram.com/muhammad.zubair.afridi/" rel="author noopener noreferrer" tabIndex={-1}>
          Engineer Muhammad Zubair Afridi on Instagram
        </a>
      </nav>

      <main id="main-content" className={"home-main"}>

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section className={"home-hero"} aria-labelledby="hero-heading">
          <div className="home-hero-copy">
            <p className={"home-eyebrow"}>Pakistan #1 AI powered learning platform</p>
            <h1 id="hero-heading" className="home-hero-title">
              Learn with AI. Win daily. Earn AIDLA Coins.
            </h1>
            <p className="home-hero-text">
              AIDLA brings courses, daily quiz competitions, AI career tools, resources,
              wallets, rewards, and learner leaderboards into one free platform for Pakistan.
            </p>

            <div className="home-hero-actions">
              <Link href="/signup" className={"home-primary-btn"}>
                Start learning free
              </Link>
              <Link href="/user/dailyquizz" className={"home-secondary-btn"}>
                Play daily quizz
              </Link>
            </div>

            <dl className={"home-stats-grid"} aria-label="AIDLA highlights">
              {STATS.map((stat) => (
                <div key={stat.label} className={"home-stat-item"}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Product visual — LCP optimised: no lazy-load on brand icon */}
          <div className={"home-product-visual"} aria-label="AIDLA daily quiz winners preview">
            <div className={"home-preview-top"}>
              <div className={"home-brand-mark"}>
                {/* priority + fetchPriority="high" fixes mobile LCP */}
                <Image
                  src="/icon-192.png"
                  alt=""
                  width={42}
                  height={42}
                  priority
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              <div>
                <p className={"home-preview-kicker"}>{formatDateKey(winnerDate)}</p>
                <strong>Yesterday&apos;s Daily Quizz Winners</strong>
              </div>
            </div>

            <div className={"home-score-panel"}>
              <div>
                <span className={"home-small-label"}>Daily winners</span>
                <strong>{dailyWinners.length || "Live"}</strong>
              </div>
              <Link href="/user/dailyquizz" className={"home-panel-link"}>
                Join today
              </Link>
            </div>

            <div className={"home-preview-list"}>
              {dailyWinners.length > 0 ? (
                dailyWinners.map((winner) => (
                  <div
                    key={`${winner.rank}-${winner.user_id || winner.full_name}`}
                    className={"home-winner-row"}
                  >
                    <span aria-label={`Rank ${winner.rank}`}>#{winner.rank}</span>
                    <div>
                      <p>{winner.full_name || "AIDLA Learner"}</p>
                      <small>{winner.score}/{winner.total_questions} score</small>
                    </div>
                    <strong>+{winner.coins_earned || 0}</strong>
                  </div>
                ))
              ) : (
                <div className={"home-winner-empty"}>
                  <p>Yesterday&apos;s winners are being calculated.</p>
                  <small>Start today&apos;s quiz and compete for the next leaderboard.</small>
                </div>
              )}
            </div>

            <div className={"home-progress-block"}>
              <div className={"home-progress-header"}>
                <span>Next winner board</span>
                <strong>Today</strong>
              </div>
              <div
                className={"home-progress-track"}
                role="progressbar"
                aria-label="Progress toward next winner board"
                aria-valuenow={64}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: "64%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            TRUST BAND
        ══════════════════════════════ */}
        <section className={"home-trust-band"} aria-label="Platform strengths">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </section>

        {/* ══════════════════════════════
            HOW IT WORKS
        ══════════════════════════════ */}
        <section className={"home-section"} aria-labelledby="how-heading">
          <div className="home-section-header">
            <p className={"home-eyebrow"}>Simple path</p>
            <h2 id="how-heading">How AIDLA works</h2>
            <p>Three steps, no clutter: learn useful skills, earn coins, and keep moving.</p>
          </div>

          <div className={"home-steps-grid"}>
            {STEPS.map((step) => (
              <article key={step.title} className={"home-step-card"}>
                <span aria-hidden="true">{step.eyebrow}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            FEATURES
        ══════════════════════════════ */}
        <section className={"home-section"} aria-labelledby="features-heading">
          <div className={"home-split-header"}>
            <div>
              <p className={"home-eyebrow"}>AIDLA ecosystem</p>
              <h2 id="features-heading">
                Public discovery plus a complete learner dashboard.
              </h2>
            </div>
          </div>

          <div className={"home-feature-grid"}>
            {FEATURES.map((feature) => (
              <article key={feature.title} className={"home-feature-card"}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <Link href={feature.href}>{feature.label}</Link>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            REVIEWS
        ══════════════════════════════ */}
        {reviews.length > 0 && (
          <section className={"home-section"} aria-labelledby="proof-heading">
            <div className="home-section-header">
              <p className={"home-eyebrow"}>Learner proof</p>
              <h2 id="proof-heading">Trusted by real learners</h2>
              <p>Honest feedback from students and professionals across Pakistan.</p>
            </div>

            <div className={"home-review-grid"}>
              {reviews.map((review) => (
                <article key={review.id} className={"home-review-card"}>
                  <div
                    className={"home-rating"}
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} aria-hidden="true">
                        {index < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <blockquote>&quot;{review.review_text}&quot;</blockquote>
                  <footer>
                    <strong>{review.full_name?.split(" ")[0] || "Learner"}</strong>
                    <span>{formatDate(review.created_at)}</span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════
            BLOG / NEWS POSTS
        ══════════════════════════════ */}
        {posts.length > 0 && (
          <section className={"home-section"} aria-labelledby="latest-heading">
            <div className={"home-split-header"}>
              <div>
                <p className={"home-eyebrow"}>Latest from AIDLA</p>
                <h2 id="latest-heading">Fresh learning updates</h2>
              </div>
              <Link href="/blogs" className={"home-text-link"}>
                View all articles
              </Link>
            </div>

            <div className={"home-post-grid"}>
              {posts.map((post) => (
                <Link
                  key={`${post.type}-${post.id}`}
                  href={post.href}
                  className={"home-post-card"}
                >
                  <span>{post.type}</span>
                  <h3>{post.title}</h3>
                  {post.excerpt && <p>{post.excerpt}</p>}
                  <small>{formatDate(post.published_at)}</small>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════
            FAQ
        ══════════════════════════════ */}
        <section className={"home-section"} aria-labelledby="faq-heading">
          <div className="home-section-header">
            <p className={"home-eyebrow"}>Questions</p>
            <h2 id="faq-heading">What learners ask first</h2>
          </div>

          <div className={"home-faq-grid"}>
            {faqs.slice(0, 4).map((faq) => (
              <details key={faq.id || faq.slug} className={"home-faq-item"}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
                {faq.slug && (
                  <Link href={`/faqs/${faq.slug}`} className={"home-faq-link"}>
                    Read full answer
                  </Link>
                )}
              </details>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            FINAL CTA  ← moved above newsletter
        ══════════════════════════════ */}
        <section className={"home-final-cta"} aria-labelledby="cta-heading">
          <p className={"home-eyebrow"}>Ready when you are</p>
          <h2 id="cta-heading">Start learning on AIDLA today.</h2>
          <p>Join free, practice daily, and let your learning turn into visible progress.</p>
          <Link href="/signup" className={"home-primary-btn"}>
            Create free account
          </Link>
        </section>

      </main>
    </div>
  );
}