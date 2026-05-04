"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./ContentCarousel.module.css";

const INTERVAL_MS = 5200;
const TRANSITION_MS = 350;

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

export default function ContentCarousel({ items, type, viewAllHref, viewAllLabel }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const idxRef = useRef(0);
  const intervalRef = useRef(null);
  const advanceRef = useRef(null);

  const isBlog = type === "blog";

  advanceRef.current = () => {
    if (!items || items.length <= 1) return;
    setVisible(false);
    setTimeout(() => {
      idxRef.current = (idxRef.current + 1) % items.length;
      setIdx(idxRef.current);
      setVisible(true);
    }, TRANSITION_MS);
  };

  function startTimer() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => advanceRef.current(), INTERVAL_MS);
  }

  function goTo(i) {
    if (i === idxRef.current) return;
    setVisible(false);
    setTimeout(() => {
      idxRef.current = i;
      setIdx(i);
      setVisible(true);
    }, TRANSITION_MS);
    startTimer();
  }

  useEffect(() => {
    if (!items || items.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  if (!items || items.length === 0) return null;

  const item = items[idx];
  const href = isBlog ? `/blogs/${item.slug}` : `/news/${item.slug}`;

  return (
    <div className={styles.ccOuter}>
      <div
        className={`${styles.ccCard} ${isBlog ? styles.ccCardBlog : styles.ccCardNews} ${visible ? styles.ccVisible : styles.ccHidden}`}
      >
        <div className={styles.ccAccent} aria-hidden="true" />
        <Link
          href={href}
          className={styles.ccBody}
          aria-label={`Read ${type}: ${item.title}`}
        >
          <div className={styles.ccMetaTop}>
            <span className={`${styles.ccPill} ${isBlog ? styles.ccPillBlog : styles.ccPillNews}`}>
              {isBlog ? "Blog" : "News"}
            </span>
            <time className={styles.ccDate} dateTime={item.published_at}>
              {formatDate(item.published_at)}
            </time>
          </div>
          <h3 className={styles.ccTitle}>{item.title}</h3>
          {item.excerpt && <p className={styles.ccExcerpt}>{item.excerpt}</p>}
          <div className={styles.ccFooter}>
            <span className={styles.ccViews}>
              👁 {(item.view_count || 0).toLocaleString()}
            </span>
            <span
              className={`${styles.ccRead} ${isBlog ? styles.ccReadBlog : styles.ccReadNews}`}
              aria-hidden="true"
            >
              Read →
            </span>
          </div>
        </Link>
      </div>

      {items.length > 1 && (
        <div className={styles.ccDots} role="tablist" aria-label={`${type} carousel navigation`}>
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === idx}
              aria-label={`${isBlog ? "Blog" : "News"} ${i + 1} of ${items.length}`}
              className={`${styles.ccDot} ${i === idx ? styles.ccDotActive : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}

      <div className={styles.csViewAll}>
        <Link href={viewAllHref} className={styles.viewAllBtn}>
          {viewAllLabel} →
        </Link>
      </div>
    </div>
  );
}
