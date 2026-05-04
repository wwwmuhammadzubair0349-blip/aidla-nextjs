"use client";

import { useEffect, useRef, useCallback } from "react";
import styles from "./GoogleSearchHero.module.css";

const QUERIES = [
  {
    q: "Pakistan's #1 educational platform",
    title: "AIDLA — Free Learning, Earn Coins & Win Prizes | Pakistan's #1 Education Platform",
    snip: "<span class='gbold'>AIDLA</span> is Pakistan's number one free education platform. Take quizzes, earn <span class='gbold'>AIDLA Coins</span>, spin the lucky wheel, win real prizes. 100% free.",
    path: "",
    favColor: "#1a73e8",
  },
  {
    q: "how to create CV",
    title: "AIDLA CV Builder — Create Professional Resume Online Free",
    snip: "Build a professional CV in minutes with <span class='gbold'>AIDLA's free CV builder</span>. Templates designed for Pakistani students and job seekers. No cost, no watermark.",
    path: "cv-builder",
    favColor: "#34a853",
  },
  {
    q: "free AI tools for students",
    title: "AIDLA AI Tools — Free AI Paraphraser, Summarizer & More",
    snip: "Access <span class='gbold'>free AI tools</span> for students including paraphraser, summarizer, grammar checker, and cover letter generator. Powered by advanced AI.",
    path: "tools",
    favColor: "#fbbc05",
  },
  {
    q: "AI-powered learning platform",
    title: "AIDLA — AI-Powered Learning Platform for Pakistani Students",
    snip: "Experience <span class='gbold'>AI-powered education</span> with personalized quizzes, smart recommendations, and adaptive learning paths. Completely free for all students.",
    path: "",
    favColor: "#ea4335",
  },
  {
    q: "best educational website in Pakistan",
    title: "AIDLA — Pakistan's Best Free Educational Website | #1 Rated",
    snip: "Rated Pakistan's <span class='gbold'>best educational website</span> by students nationwide. Free courses, quizzes, news, and rewards — all in one platform.",
    path: "",
    favColor: "#1a73e8",
  },
  {
    q: "online learning with AI",
    title: "AIDLA — Online Learning with AI | Free Courses & Quizzes",
    snip: "Learn online with <span class='gbold'>AI-assisted tutoring</span>, smart quizzes, and instant feedback. Pakistan curriculum aligned. Join thousands of students today.",
    path: "courses",
    favColor: "#34a853",
  },
  {
    q: "AI CV builder Pakistan",
    title: "Free AI CV Builder Pakistan — Create Resume in 5 Minutes | AIDLA",
    snip: "Pakistan's first <span class='gbold'>AI CV builder</span>. Generate professional resumes with AI suggestions. Free templates, ATS-friendly, instant download.",
    path: "cv-builder",
    favColor: "#fbbc05",
  },
  {
    q: "AI resume tools",
    title: "AIDLA AI Resume Tools — Free Resume Builder & Cover Letter",
    snip: "Free <span class='gbold'>AI resume and cover letter tools</span> for Pakistani job seekers. Create ATS-friendly resumes with AI-powered content suggestions.",
    path: "cover-letter",
    favColor: "#ea4335",
  },
  {
    q: "free courses online",
    title: "AIDLA Free Online Courses — Pakistan Curriculum | Learn Free",
    snip: "Access <span class='gbold'>100% free online courses</span> aligned with Pakistan curriculum. Matric, Intermediate, and competitive exam preparation.",
    path: "courses",
    favColor: "#1a73e8",
  },
  {
    q: "educational blogs Pakistan",
    title: "AIDLA Blogs — Pakistan Education News, Tips & Career Guides",
    snip: "Read <span class='gbold'>educational blogs</span> on Pakistan education news, scholarships, career tips, and study guides. Updated daily by education experts.",
    path: "blogs",
    favColor: "#34a853",
  },
];

export default function GoogleSearchHero() {
  const typedRef    = useRef(null);
  const resultsRef  = useRef(null);
  const mainTitleRef = useRef(null);
  const mainSnipRef  = useRef(null);
  const rowRefs     = useRef([]);
  const qiRef       = useRef(0);
  const charIdxRef  = useRef(0);
  const timerRef    = useRef(null);

  const showResults = useCallback(() => {
    const qi = qiRef.current;
    const q  = QUERIES[qi];
    const results   = resultsRef.current;
    const mainTitle = mainTitleRef.current;
    const mainSnip  = mainSnipRef.current;
    if (!results || !mainTitle || !mainSnip) return;

    results.style.display = "flex";
    mainTitle.textContent = q.title;
    mainSnip.innerHTML    = q.snip;

    rowRefs.current.forEach((r, i) => {
      if (r) setTimeout(() => r.classList.add(styles.show), i * 90);
    });
  }, []);

  const hideResults = useCallback((cb) => {
    rowRefs.current.forEach((r) => {
      if (r) r.classList.remove(styles.show);
    });
    setTimeout(() => {
      if (resultsRef.current) resultsRef.current.style.display = "none";
      cb?.();
    }, 380);
  }, []);

  const typeNext = useCallback(() => {
    const q = QUERIES[qiRef.current].q;
    if (charIdxRef.current <= q.length) {
      if (typedRef.current) typedRef.current.textContent = q.slice(0, charIdxRef.current);
      charIdxRef.current++;
      const delay = charIdxRef.current < 4 ? 60 : 45 + Math.random() * 40;
      timerRef.current = setTimeout(typeNext, delay);
    } else {
      timerRef.current = setTimeout(() => {
        showResults();
        timerRef.current = setTimeout(startErase, 2800);
      }, 400);
    }
  }, [showResults]);

  const startErase = useCallback(() => {
    hideResults(() => eraseNext());
  }, [hideResults]);

  const eraseNext = useCallback(() => {
    if (charIdxRef.current > 0) {
      charIdxRef.current--;
      if (typedRef.current)
        typedRef.current.textContent = QUERIES[qiRef.current].q.slice(0, charIdxRef.current);
      timerRef.current = setTimeout(eraseNext, 28);
    } else {
      qiRef.current = (qiRef.current + 1) % QUERIES.length;
      timerRef.current = setTimeout(typeNext, 400);
    }
  }, [typeNext]);

  useEffect(() => {
    timerRef.current = setTimeout(typeNext, 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [typeNext]);

  return (
    <div className={styles.gwrapOuter}>
      {/* Browser chrome */}
      <div className={styles.browserChrome} aria-hidden="true">
        <div className={styles.browserDots}>
          <span className={`${styles.bdot} ${styles.bdotR}`} />
          <span className={`${styles.bdot} ${styles.bdotY}`} />
          <span className={`${styles.bdot} ${styles.bdotG}`} />
        </div>
        <div className={styles.browserAddr}>
          <span className={styles.lockIcon}>🔒</span>
          google.com/search
        </div>
        <div className={styles.browserRight} />
      </div>

      {/* Google content */}
      <div className={styles.gwrap}>
        {/* Google logo */}
        <div className={styles.glogoWrap}>
          <svg
            className={styles.glogo}
            viewBox="0 0 272 92"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
            <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
            <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.67-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.26zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
            <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
            <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
            <path d="M35.29 41.41V32H66v9.41H35.29z" fill="#4285F4" />
            <path d="M35.29 32v9.41h30.45c-.93 4.96-3.61 9.16-7.64 12.02l12.35 9.58C77.16 55.3 80 46.77 80 36.58c0-2.77-.25-5.46-.71-8.07L35.29 32z" fill="#4285F4" />
            <path d="M15.96 52.74l-2.87 2.2L2.18 62.73C8.49 75.3 21.58 84 36.5 84c9.66 0 17.78-3.19 23.7-8.65L47.85 65.77c-3.19 2.18-7.31 3.44-11.35 3.44-8.74 0-16.16-5.88-18.82-13.86l-.02-.09-.02-.09c-.5-1.67-.8-3.44-.8-5.27 0-1.83.3-3.61.8-5.28l-.18.07z" fill="#FBBC05" />
            <path d="M36.5 8c5.46 0 10.33 1.93 14.2 5.04l10.58-10.58C54.95 1.93 46.16 0 36.5 0 21.58 0 8.49 8.7 2.18 21.27l11.06 8.57C15.84 21.88 23.26 8 36.5 8z" fill="#EA4335" />
          </svg>
        </div>

        {/* Search bar */}
        <div className={styles.gbar} role="search" aria-label="Google search animation">
          <div className={styles.gbarIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#9aa0a6" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span ref={typedRef} className={styles.gbarText} aria-live="polite" />
          <span className={styles.cursor} aria-hidden="true" />
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className={styles.gresults}
          style={{ display: "none" }}
          aria-live="polite"
          aria-label="Search results"
        >
          {/* Featured / #1 result */}
          <div ref={(el) => (rowRefs.current[0] = el)} className={styles.gresult}>
            <div className={styles.featuredBox}>
              <div className={styles.rankBadge} aria-label="Ranked #1">
                <span aria-hidden="true">🥇</span>
                <span>Ranked #1</span>
              </div>
              <div className={styles.gurl}>
                <div className={styles.gfavicon}>
                  <img src="/icon-192.png" className={styles.gfaviconImg} alt="" />
                </div>
                <span className={styles.gsite}>www.aidla.online</span>
                <span className={styles.gsepArrow}>›</span>
                {QUERIES[0].path && (
                  <span className={styles.gpath}>{QUERIES[0].path}</span>
                )}
              </div>
              <div className={styles.gtitle} ref={mainTitleRef}>
                {QUERIES[0].title}
              </div>
              <div
                className={styles.gsnip}
                ref={mainSnipRef}
                dangerouslySetInnerHTML={{ __html: QUERIES[0].snip }}
              />
              <div className={styles.glinks}>
                <span className={styles.glink}>Sign Up Free</span>
                <span className={styles.glink}>Quizzes</span>
                <span className={styles.glink}>Lucky Draw</span>
                <span className={styles.glink}>Leaderboard</span>
              </div>
            </div>
          </div>

          <div className={styles.gsepLine} />

          <div ref={(el) => (rowRefs.current[1] = el)} className={`${styles.gresult} ${styles.otherResult}`}>
            <div className={styles.gurl}>
              <div className={styles.gfavicon}>
                <img src="/icon-192.png" className={styles.gfaviconImg} alt="" />
              </div>
              <span className={styles.gsite}>aidla.online</span>
              <span className={styles.gsepArrow}>›</span>
              <span className={styles.gpath}>blogs</span>
            </div>
            <div className={styles.gtitle}>AIDLA Blogs — Education News, Career Tips &amp; Study Guides</div>
            <div className={styles.gsnip}>Expert articles on Pakistan education, scholarships, and career development — updated daily, completely free.</div>
          </div>

          <div ref={(el) => (rowRefs.current[2] = el)} className={`${styles.gresult} ${styles.otherResult}`}>
            <div className={styles.gurl}>
              <div className={styles.gfavicon}>
                <img src="/icon-192.png" className={styles.gfaviconImg} alt="" />
              </div>
              <span className={styles.gsite}>aidla.online</span>
              <span className={styles.gsepArrow}>›</span>
              <span className={styles.gpath}>faqs</span>
            </div>
            <div className={styles.gtitle}>AIDLA FAQs — How to Earn Coins, Lucky Draw &amp; Withdrawals</div>
            <div className={styles.gsnip}>
              Get answers about earning <span className={styles.gbold}>AIDLA Coins</span>, entering lucky draws, cash withdrawals, and more.
            </div>
          </div>

          <div ref={(el) => (rowRefs.current[3] = el)} className={`${styles.gresult} ${styles.otherResult}`}>
            <div className={styles.gurl}>
              <div className={styles.gfavicon}>
                <img src="/icon-192.png" className={styles.gfaviconImg} alt="" />
              </div>
              <span className={styles.gsite}>aidla.online</span>
              <span className={styles.gsepArrow}>›</span>
              <span className={styles.gpath}>leaderboard</span>
            </div>
            <div className={styles.gtitle}>AIDLA Leaderboard — Top Students in Pakistan</div>
            <div className={styles.gsnip}>
              Compete with thousands of learners and climb the{" "}
              <span className={styles.gbold}>national rankings</span> — updated in real time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
