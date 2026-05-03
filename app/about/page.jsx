import Link from "next/link";
import styles from "./about.module.css";

const SITE_URL = "https://www.aidla.online";

const FAQ_TEASER = [
  { q: "What is AIDLA and how does it work?", a: "AIDLA is Pakistan's #1 educational rewards platform. Create a free account, complete quizzes and tests, earn AIDLA Coins for every achievement, then redeem them for real prizes or cash withdrawals." },
  { q: "How do I earn AIDLA Coins?", a: "Earn coins by completing quizzes, topping leaderboards, spinning the daily Lucky Wheel, entering Lucky Draws, and achieving high ranks in tests. The more you learn, the more you earn." },
  { q: "Is AIDLA completely free to join?", a: "Yes — 100% free. No subscription, no hidden fees. Sign up, start learning, and start earning real rewards from day one." },
  { q: "How do I withdraw my earnings?", a: "Once you hit the minimum withdrawal threshold, convert your AIDLA Coins to cash and withdraw directly to your bank account or via EasyPaisa/JazzCash." },
  { q: "Are the Lucky Draws and Wheel spins fair?", a: "Absolutely. Our draw and wheel systems use verified random selection. Every participant has an equal, transparent chance. Results are logged so you can verify outcomes any time." },
];

const FREE_TOOLS = [
  { icon:"📄", title:"Free CV Maker",          desc:"Build a professional, ATS-friendly CV in minutes — no design skills needed. Pick a template, fill in your details, and download a polished PDF resume instantly. Completely free.",                              badge:"Live",  color:"#dbeafe", link:"/tools/career/cv-maker" },
  { icon:"✉️", title:"Cover Letter Maker",     desc:"Generate a tailored, professional cover letter for any job in seconds. Our AI-assisted builder helps you write compelling cover letters that hiring managers actually read.",                              badge:"Live",  color:"#d1fae5", link:"/tools/career/cover-letter-maker" },
  { icon:"🖼️", title:"Image to PDF",           desc:"Convert JPG, PNG, or any image file into a clean, shareable PDF document instantly. No account required, no watermarks — completely free every time.",                                                  badge:"Soon",  color:"#fef3c7", link:"/tools/pdf/image-to-pdf" },
  { icon:"📝", title:"Word to PDF",            desc:"Upload your .docx Word document and convert it to a perfectly formatted PDF file in one click. Fast, free, and fully secure — your files are never stored.",                                             badge:"Soon",  color:"#ede9fe", link:"/tools/pdf/word-to-pdf" },
  { icon:"🎨", title:"JPG to PNG Converter",   desc:"Convert JPG images to transparent-background PNG files instantly. Perfect for logos, profile pictures, and any design work. Free, fast, and requires no account.",                                      badge:"Soon",  color:"#fce7f3", link:"/tools/image/jpg-to-png" },
  { icon:"🔧", title:"More Tools Coming Soon", desc:"We're constantly building new free tools — PDF compressor, background remover, QR code generator, image resizer, text to PDF, and much more. Follow AIDLA to be first to know when they launch.", badge:"Soon",  color:"#f1f5f9", link:"/tools" },
];

const DASHBOARD_FEATURES = [
  { icon:"🎓", title:"Courses",          desc:"Access structured online courses across Mathematics, Science, English, Islamiat, Computer Science, and more. Learn at your own pace and earn AIDLA Coins for every course you complete." },
  { icon:"🤖", title:"AI Learning",      desc:"Personalised AI-powered learning paths that adapt to your strengths and weaknesses. Get smart explanations, instant feedback, and topic recommendations tailored to your exact level." },
  { icon:"💬", title:"Free AI Chatbot",  desc:"AIDLA's built-in AI chatbot is available 24/7 to help you understand difficult topics, solve problems, get homework help, and answer any question — completely free, no limits." },
  { icon:"🎲", title:"Lucky Draw",       desc:"Enter daily and weekly Lucky Draws using your AIDLA Coins for a chance to win real cash, gadgets, and exclusive prizes. Every draw is fully transparent, fair, and verified." },
  { icon:"🎡", title:"Lucky Wheel",      desc:"Spin the daily Lucky Wheel to instantly win bonus coins, discount vouchers, and surprise rewards. A new spin resets every 24 hours — and it's always free." },
  { icon:"📝", title:"Tests & Quizzes",  desc:"Challenge yourself with thousands of topic-based quizzes and timed tests. Earn coins for every correct answer, top the leaderboard, and track your improvement over time." },
  { icon:"🛍️", title:"Rewards Shop",    desc:"Spend your hard-earned AIDLA Coins in our Rewards Shop. Choose from gift cards, branded merchandise, gadgets, or convert your coins directly to cash in seconds." },
  { icon:"🏆", title:"Leaderboard",      desc:"Compete with thousands of learners across Pakistan on our real-time leaderboard. Top rankers earn special bonus coins, exclusive badges, and featured recognition on the platform." },
];

const CORE_VALUES = [
  { icon:"🔍", title:"Transparency",     desc:"Every draw, result, and coin transaction is openly logged. No smoke, no mirrors — just honest outcomes." },
  { icon:"🤝", title:"Inclusivity",      desc:"We build for every learner — regardless of background, city, or device. Free for absolutely everyone." },
  { icon:"⚡", title:"Motivation",       desc:"Tangible prizes and real coins keep students engaged and coming back every single day of the year." },
  { icon:"🎓", title:"Academic Quality", desc:"Quiz content reviewed by educators. Fun and rigor absolutely coexist here on AIDLA." },
  { icon:"🔒", title:"Trust & Safety",   desc:"Your data, your coins, your privacy — protected with the highest standards of security and fair play." },
  { icon:"🚀", title:"Constant Growth",  desc:"We listen to our community and ship improvements weekly. Tomorrow is always better than today." },
];

const MISSION_PILLARS = [
  { icon:"📚", color:"#dbeafe", title:"Quality Learning",  desc:"Structured courses and quizzes built for Pakistan's curriculum, from primary to professional level." },
  { icon:"🪙", color:"#fef3c7", title:"Real Rewards",      desc:"AIDLA Coins are redeemable for products, gift cards, or direct bank / EasyPaisa / JazzCash withdrawals." },
  { icon:"🔧", color:"#d1fae5", title:"Free Useful Tools", desc:"CV maker, cover letter builder, image to PDF, Word to PDF, JPG to PNG — all 100% free, no account needed." },
];

const STORY_HIGHLIGHTS = [
  { icon:"🏆", title:"Top-Ranked Platform",   desc:"Trusted by Pakistani learners nationwide" },
  { icon:"💵", title:"Real Cash Withdrawals", desc:"EasyPaisa, JazzCash & direct bank transfers" },
  { icon:"🎲", title:"Verified Fair Draws",   desc:"Transparent random selection every draw" },
  { icon:"🔧", title:"Free Tools No Login",   desc:"CV maker, PDF tools — use without an account" },
  { icon:"🤖", title:"Free AI Chatbot",       desc:"24/7 homework & study help, completely free" },
  { icon:"📱", title:"Mobile First",          desc:"Works perfectly on any smartphone browser" },
];

const COIN_STEPS = [
  { icon:"📝", num:"01", title:"Learn",      desc:"Complete quizzes, tests, and challenges at your own pace." },
  { icon:"🪙", num:"02", title:"Earn Coins", desc:"Every quiz, top rank, and lucky spin rewards you with AIDLA Coins." },
  { icon:"🛍️", num:"03", title:"Redeem",    desc:"Use coins in the Rewards Shop for gadgets, gift cards, and more." },
  { icon:"💵", num:"04", title:"Cash Out",   desc:"Convert coins to real money and withdraw to your bank." },
];

function FAQItem({ q, a }) {
  return (
    <div className={styles.faqItem}>
      <details>
        <summary>
          <span>{q}</span>
          <span className={styles.faqChevron} aria-hidden="true">▼</span>
        </summary>
        <div className={styles.faqAnswer}>
          <span>{a}</span>
        </div>
      </details>
    </div>
  );
}

// JSON-LD structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "EducationalOrganization"],
  "@id": `${SITE_URL}/#organization`,
  "name": "AIDLA",
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE_URL}/logo.png`,
    "width": 200,
    "height": 60,
  },
  "foundingDate": "2024",
  "areaServed": { "@type": "Country", "name": "Pakistan" },
  "sameAs": [
    "https://www.facebook.com/aidlaonline",
    "https://www.instagram.com/aidlaonline",
    "https://www.youtube.com/@aidlaonline",
    "https://twitter.com/AIDLA_online",
    "https://www.linkedin.com/company/aidla",
    "https://www.tiktok.com/@aidlaonline",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
    { "@type": "ListItem", "position": 2, "name": "About", "item": `${SITE_URL}/about` }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_TEASER.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

export const metadata = {
  title: "About AIDLA — Free Tools, AI Learning & Rewards Platform Pakistan",
  description:
    "AIDLA offers free CV maker, cover letter maker, image to PDF, Word to PDF, JPG to PNG converter tools, plus AI-powered courses, a free AI chatbot, lucky draws, lucky wheel, quizzes, and a rewards shop. Pakistan's #1 free education and rewards platform.",
  keywords:
    "AIDLA, free CV maker Pakistan, cover letter maker free, image to PDF online, word to PDF free, JPG to PNG converter, AI learning Pakistan, online quizzes Pakistan, lucky draw Pakistan, AIDLA coins, free AI chatbot Pakistan, education rewards Pakistan",
  authors: [{ name: "AIDLA" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "About AIDLA — Free Tools, AI Learning & Rewards Platform Pakistan",
    description:
      "AIDLA offers free CV maker, cover letter maker, image to PDF, Word to PDF, JPG to PNG converter tools, plus AI-powered courses, a free AI chatbot, lucky draws, lucky wheel, quizzes, and a rewards shop.",
    images: [{ url: `${SITE_URL}/og-home.jpg` }],
    siteName: "AIDLA",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "About AIDLA — Free Tools, AI Learning & Rewards Platform Pakistan",
    description:
      "AIDLA offers free CV maker, cover letter maker, image to PDF, Word to PDF, JPG to PNG converter tools, plus AI-powered courses, a free AI chatbot, lucky draws, lucky wheel, quizzes, and a rewards shop.",
    images: [`${SITE_URL}/og-home.jpg`],
  },
};

export default function About() {
  return (
    <div className={styles.root}>
      {/* JSON-LD scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className={styles.hero} aria-label="About AIDLA">
        <div className={styles.heroAurora} aria-hidden="true">
          <div className={styles.auroraBlob1} />
          <div className={styles.auroraBlob2} />
        </div>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <Link href="/" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span aria-hidden="true">›</span>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <span itemProp="name">About</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>
        <span className={styles.eyebrow}>✨ Our Story</span>
        <h1 className={styles.heroTitle}>
          Education That<br /><span>Rewards You</span>
        </h1>
        <p className={styles.heroSub}>
          AIDLA is Pakistan's all-in-one free learning platform — AI-powered courses, a free AI chatbot, free productivity tools like CV maker and PDF converters, daily lucky draws, quizzes, and a real rewards system where your coins convert to actual cash.
        </p>
        <div className={styles.heroButtons}>
          <Link href="/signup" className={styles.btnGold}>✨ Join Free Today</Link>
          <Link href="/tools" className={styles.btnGhost}>🔧 Free Tools</Link>
          <Link href="/faqs" className={styles.btnGhost}>💬 FAQs</Link>
        </div>
        <div className={styles.heroStats} aria-label="Platform statistics">
          <div className={styles.heroStat}><strong>50K+</strong><span>Learners</span></div>
          <div className={styles.heroStatDivider} aria-hidden="true" />
          <div className={styles.heroStat}><strong>₨2M+</strong><span>Coins Earned</span></div>
          <div className={styles.heroStatDivider} aria-hidden="true" />
          <div className={styles.heroStat}><strong>1,200+</strong><span>Prizes Won</span></div>
          <div className={styles.heroStatDivider} aria-hidden="true" />
          <div className={styles.heroStat}><strong>100%</strong><span>Free Forever</span></div>
        </div>
      </section>


      <div className={styles.body}>
        {/* Who We Are / Mission Block */}
        
            

           
        <div className={styles.missionBlock}>
          <div className={styles.missionDecor} aria-hidden="true">
            <div className={styles.missionDecorIcon}>🎓</div>
            <div className={styles.missionDecorGrid}>
              <span>📚</span><span>🪙</span><span>🏆</span>
              <span>🎲</span><span>🤖</span><span>🔧</span>
            </div>
          </div>
          <div className={styles.missionText}>
            <span className={styles.label}>Our Mission</span>
            <h2 className={styles.title}>Why We Built <span>AIDLA</span></h2>
            <p className={styles.desc}>
              Millions of Pakistani students study hard every day but feel unseen and unrewarded. AIDLA changes that. Every quiz you complete, every test you top, every Lucky Wheel spin — it translates into real coins and real rewards. On top of that, we give you free professional tools — CV maker, cover letter builder, file converters — that you'd normally pay for elsewhere, all completely free.
            </p>
            <div className={styles.pillars}>
              {MISSION_PILLARS.map((p, i) => (
                <div key={i} className={styles.pillar}>
                  <div className={styles.pillarIcon} style={{ background: p.color }}>{p.icon}</div>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Free Tools Section */}
        <section className={styles.section} aria-labelledby="tools-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>100% Free — No Account Needed</span>
          </div>
          <h2 className={`${styles.title} ${styles.titleCenter}`} id="tools-heading">
            Free Online <span>Tools for Everyone</span>
          </h2>
          <p className={`${styles.desc} ${styles.descCenter}`}>
            Powerful free tools built for Pakistani students and professionals. No hidden charges. No watermarks. Just free tools available right now on AIDLA.
          </p>
          <div className={styles.toolsGrid}>
            {FREE_TOOLS.map((tool, i) => (
              <div key={i} className={styles.toolCard}>
                <div className={styles.toolTop}>
                  <div className={styles.toolIcon} style={{ background: tool.color }}>{tool.icon}</div>
                  <span className={`${styles.toolBadge} ${tool.badge === "Soon" ? styles.toolBadgeSoon : ""}`}>
                    {tool.badge === "Live" ? "✅ Live" : "🔜 Coming Soon"}
                  </span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                {tool.badge === "Live" ? (
                  <Link href={tool.link} className={styles.toolLink}>Use Free Tool →</Link>
                ) : (
                  <span className={`${styles.toolLink} ${styles.toolLinkSoon}`}>Stay tuned →</span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Link href="/tools" className={styles.btnPrimary}>🔧 Browse All Free Tools →</Link>
          </div>
        </section>

        <div className={styles.divider} />

        {/* Dashboard Features (Our Expertise) */}
        <section className={styles.section} aria-labelledby="features-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Inside Your Dashboard</span>
          </div>
          <h2 className={`${styles.title} ${styles.titleCenter}`} id="features-heading">
            Everything in <span>Your AIDLA Account</span>
          </h2>
          <p className={`${styles.desc} ${styles.descCenter}`}>
            Sign up free and unlock a full ecosystem of learning, earning, and winning. Here's exactly what's waiting inside your AIDLA dashboard.
          </p>
          <div className={styles.featuresGrid}>
            {DASHBOARD_FEATURES.map((f, i) => (
              <article key={i} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                </div>
                <div className={styles.featureBody}>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Link href="/signup" className={styles.btnGold}>✨ Create Free Account &amp; Unlock All →</Link>
          </div>
        </section>

        <div className={styles.divider} />

        {/* Our Story (includes Vision) */}
        <div className={styles.storyBlock}>
          <div className={styles.storyText}>
            <span className={styles.label}>Our Story</span>
            <h2 className={styles.storyTitle}>Born in <span>Pakistan</span>,<br />Built for Learners</h2>
            <p className={styles.storyBody}>
              AIDLA started with a simple question: why do Pakistani students work so hard with so little recognition? We built a platform where every correct answer, every quiz, every rank achieved earns something tangible. We then added free tools — CV builder, cover letter maker, PDF converters — because we believe every Pakistani student deserves access to professional resources for free. We're not just an app. We're a movement.
            </p>
            <Link href="/faqs" className={styles.btnGold} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              💬 Got questions? Read our FAQs →
            </Link>
          </div>
          <div className={styles.storyHighlights}>
            {STORY_HIGHLIGHTS.map((h, i) => (
              <div key={i} className={styles.storyHighlight}>
                <div className={styles.storyHighlightIcon}>{h.icon}</div>
                <div>
                  <strong>{h.title}</strong>
                  <span>{h.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Coins Work */}
        <section className={styles.section} aria-labelledby="coins-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>The Coin System</span>
          </div>
          <h2 className={`${styles.title} ${styles.titleCenter}`} id="coins-heading">How <span>AIDLA Coins</span> Work</h2>
          <p className={`${styles.desc} ${styles.descCenter}`}>From learning to earning — a transparent, simple, powerful cycle.</p>
          <div className={styles.coinsFlow}>
            {COIN_STEPS.map((s, i) => (
              <div key={i} className={styles.coinStep}>
                <div className={styles.coinStepNum}>{s.num}</div>
                <span className={styles.coinStepIcon} aria-hidden="true">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us (Core Values) */}
        <section className={styles.section} aria-labelledby="values-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.label}>What We Stand For</span>
          </div>
          <h2 className={`${styles.title} ${styles.titleCenter}`} id="values-heading">Our Core <span>Values</span></h2>
          <p className={`${styles.desc} ${styles.descCenter}`}>Everything we build is guided by these principles.</p>
          <div className={styles.valuesGrid}>
            {CORE_VALUES.map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <span className={styles.valueIcon} aria-hidden="true">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className={styles.section} aria-labelledby="faq-heading">
          <div className={styles.faqInner}>
            <div className={styles.faqLeft}>
              <span className={styles.label}>Got Questions?</span>
              <h2 className={styles.title} id="faq-heading">Frequently Asked<br /><span>Questions</span></h2>
              <p className={styles.desc}>Quick answers to what people ask us most. We have {FAQ_TEASER.length} here — many more on our full FAQ page.</p>
              <br />
              <Link href="/faqs" className={styles.faqSeeAll}>📚 Browse All FAQs →</Link>
              <div className={styles.faqHelpBox}>
                💡 Can't find your answer?{" "}
                <Link href="/faqs#ask-question" className={styles.faqHelpLink}>Ask us directly →</Link>
              </div>
            </div>
            <div>
              <div className={styles.faqList}>
                {FAQ_TEASER.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
              </div>
              <Link href="/faqs" className={styles.faqMore}>💬 See all questions &amp; answers on the FAQ page →</Link>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <div className={styles.ctaBlock}>
          <div className={styles.ctaInner}>
            <h2>Ready to Start<br /><span>Your Journey?</span></h2>
            <p>Join thousands of Pakistani learners already earning real rewards, using free tools, and unlocking their full potential — all on one completely free platform.</p>
            <div className={styles.ctaButtons}>
              <Link href="/signup" className={styles.ctaBtnPrimary}>✨ Create Free Account</Link>
              <Link href="/tools" className={styles.ctaBtnGhost}>🔧 Try Free Tools</Link>
              <Link href="/faqs" className={styles.ctaBtnGhost}>💬 Read FAQs</Link>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}