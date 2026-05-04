"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./QuotesCarousel.module.css";

const QUOTES = [
  {
    text: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    translation: "Seeking knowledge is an obligation upon every Muslim.",
    source: "Prophet Muhammad ﷺ (Ibn Majah)",
    lang: "ar",
    theme: "quoteTheme1",
  },
  {
    text: "خِيرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    translation: "The best of people are those most beneficial to others.",
    source: "Prophet Muhammad ﷺ",
    lang: "ar",
    theme: "quoteTheme2",
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    source: "Nelson Mandela",
    lang: "en",
    theme: "quoteTheme3",
  },
  {
    text: "علم کی شمع جلاؤ، جہالت کا اندھیرا مٹاؤ",
    translation: "Light the candle of knowledge, erase the darkness of ignorance.",
    source: "Allama Iqbal",
    lang: "ur",
    theme: "quoteTheme4",
  },
  {
    text: "خود کو کر بلند اتنا کہ ہر تقدیر سے پہلے\nخدا بندے سے خود پوچھے — بتا تیری رضا کیا ہے",
    translation: "Raise yourself so high that before every decree, God Himself asks: what is your desire?",
    source: "Allama Iqbal",
    lang: "ur",
    theme: "quoteTheme5",
  },
  {
    text: "The ink of the scholar is more sacred than the blood of the martyr.",
    source: "Prophet Muhammad ﷺ",
    lang: "en",
    theme: "quoteTheme6",
  },
  {
    text: "وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا",
    translation: "Whoever is given wisdom has been given much good.",
    source: "Quran 2:269",
    lang: "ar",
    theme: "quoteTheme7",
  },
];

const INTERVAL_MS = 5200;
const TRANSITION_MS = 380;

export default function QuotesCarousel() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const idxRef = useRef(0);
  const intervalRef = useRef(null);

  // Use a ref to always call the latest advance without stale closures
  const advanceRef = useRef(null);
  advanceRef.current = () => {
    setVisible(false);
    setTimeout(() => {
      idxRef.current = (idxRef.current + 1) % QUOTES.length;
      setIdx(idxRef.current);
      setVisible(true);
    }, TRANSITION_MS);
  };

  function startTimer() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => advanceRef.current(), INTERVAL_MS);
  }

  function goTo(newIdx) {
    if (newIdx === idxRef.current) return;
    clearInterval(intervalRef.current);
    setVisible(false);
    setTimeout(() => {
      idxRef.current = newIdx;
      setIdx(newIdx);
      setVisible(true);
      startTimer();
    }, TRANSITION_MS);
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const q = QUOTES[idx];

  return (
    <div className={styles.carouselWrap}>
      <div
        className={styles.qsOuter}
        role="region"
        aria-label="Inspirational quotes — auto-rotating"
      >
        <article
          className={`${styles.qsSlide} ${styles[q.theme]} ${
            visible ? styles.qsVisible : styles.qsHidden
          }`}
          aria-live="polite"
          aria-atomic="true"
          itemScope
          itemType="https://schema.org/Quotation"
        >
          <div className={styles.qsDeco} aria-hidden="true">
            <div className={`${styles.qsDecoCircle} ${styles.qsDecoCircle1}`} />
            <div className={`${styles.qsDecoCircle} ${styles.qsDecoCircle2}`} />
            <div className={styles.qsDecoLine} />
          </div>

          <div className={styles.qsContent}>
            <blockquote
              className={`${styles.qsText} ${
                q.lang === "en" ? styles.qsTextEn : styles.qsTextArUr
              }`}
              lang={q.lang}
              itemProp="text"
            >
              {q.text}
            </blockquote>

            {q.translation && (
              <p className={styles.qsTranslation} lang="en">
                {q.translation}
              </p>
            )}

            <cite className={styles.qsSource} itemProp="spokenByCharacter">
              {q.source}
            </cite>
          </div>
        </article>
      </div>

      <div
        className={styles.qsDots}
        role="tablist"
        aria-label="Navigate quotes"
      >
        {QUOTES.map((_, i) => (
          <button
            key={i}
            className={`${styles.qsDot} ${i === idx ? styles.qsDotActive : ""}`}
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Show quote ${i + 1} of ${QUOTES.length}`}
          />
        ))}
      </div>
    </div>
  );
}
