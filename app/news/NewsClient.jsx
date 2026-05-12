// app/news/NewsClient.jsx
"use client";

import React, {
  useEffect, useState, useMemo, useRef, useCallback
} from "react";
import Link          from "next/link";
import Image         from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import "./news.css";

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const PAGE_SIZE = 10;
const MAX_TAGS  = 15;

const CAT_COLORS = {
  general:       "#3b82f6",
  politics:      "#8b5cf6",
  education:     "#0891b2",
  technology:    "#0f766e",
  community:     "#16a34a",
  events:        "#d97706",
  announcements: "#dc2626",
};

const CAT_LABELS = {
  general:       "🌐 General",
  politics:      "🏛️ Politics",
  education:     "📚 Education",
  technology:    "💻 Technology",
  community:     "🤝 Community",
  events:        "🎯 Events",
  announcements: "📢 Announcements",
};

const KNOWN_CATS = Object.keys(CAT_COLORS);

/* ══════════════════════════════════════════════
   PURE HELPERS
══════════════════════════════════════════════ */
function formatDate(d) {
  if (!d) return "New";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function readTime(text = "") {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const normalizeTag = (t) => t.toLowerCase().trim();

async function sharePost(title, slug) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/news/${slug}`;
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch {}
  }
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  } catch {
    prompt("Copy this link:", url);
  }
}

const BOOKMARK_KEY = "aidla_news_bookmarks";

function getBookmarks() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"); }
  catch { return []; }
}

function toggleBookmark(id) {
  const current = getBookmarks();
  const next = current.includes(id)
    ? current.filter(b => b !== id)
    : [...current, id];
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  return next;
}

/* ══════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════ */
function useDarkMode() {
  const [dark,    setDark]    = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const isDark = localStorage.getItem("aidla_theme") === "dark";
      setDark(isDark);
      setMounted(true);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }, 0);
    return () => {
      clearTimeout(t);
      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      try { localStorage.setItem("aidla_theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  return [dark, toggle, mounted];
}

function useDebounce(value, delay = 300) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ══════════════════════════════════════════════
   DARK MODE TOGGLE
   Matches Blogs exactly — hydration-safe via mounted guard
══════════════════════════════════════════════ */
function DarkModeToggle({ dark, onToggle, mounted }) {
  // Render placeholder during SSR/hydration to avoid mismatch
  if (!mounted) return <div className="dm-toggle" style={{ width: 80, height: 24 }} />;

  return (
    <div className="dm-toggle">
      <span className="dm-toggle-label">{dark ? "Dark" : "Light"}</span>
      <button
        className="dm-toggle-track"
        onClick={onToggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={dark}
      >
        <span className="dm-toggle-knob">{dark ? "🌙" : "☀️"}</span>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TAG FILTER — 1 row collapsed, CSS-only expand
══════════════════════════════════════════════ */
function TagFilter({ allTags, activeTag, onTagChange }) {
  const [expanded, setExpanded] = useState(false);
  const hasActive = activeTag !== "all";

  const handleClear = () => { onTagChange("all"); setExpanded(false); };

  return (
    <div className="news-tagfilter-root">
      <div className="news-tagfilter-header">
        <div className="news-tagfilter-left">
          <span className="news-tag-filter-label">🏷 Tags</span>
          {hasActive && (
            <span className="news-active-tag-badge">
              #{activeTag}
              <button
                className="news-active-tag-clear"
                onClick={handleClear}
                aria-label={`Remove tag filter: ${activeTag}`}
              >✕</button>
            </span>
          )}
          {hasActive && (
            <button className="news-clear-tag-btn" onClick={handleClear}>Clear</button>
          )}
        </div>
        <div className="news-tagfilter-right">
          <button
            className={`news-expand-btn${expanded ? " expanded" : ""}`}
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
          >
            <span>{expanded ? "Less" : "More"}</span>
            <span className="news-expand-icon">↓</span>
          </button>
        </div>
      </div>

      <div className={`news-tags-row${expanded ? " expanded" : ""}`}>
        <button
          className={`news-tag-btn${activeTag === "all" ? " active" : ""}`}
          onClick={() => onTagChange("all")}
          aria-pressed={activeTag === "all"}
        >All</button>

        {allTags.map(t => (
          <button
            key={t}
            className={`news-tag-btn${activeTag === t ? " active" : ""}`}
            onClick={() => onTagChange(t)}
            aria-pressed={activeTag === t}
          >#{t}</button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   HERO CARD
══════════════════════════════════════════════ */
function HeroCard({ post, bookmarks, onBookmark, onShare }) {
  const isBookmarked = bookmarks.includes(post.id);
  const pTags      = post.tags || [];
  const pCat       = pTags.find(t => KNOWN_CATS.includes(t));
  const isBreaking = pTags.includes("breaking");
  const rt         = readTime(post.excerpt);

  return (
    <div className="news-hero-card">
      {/* Image block — tabIndex -1 so keyboard lands on the title link instead */}
      <Link href={`/news/${post.slug}`} tabIndex={-1} aria-label={post.title}>
        <div className="news-hero-img-wrap">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="news-hero-ph" aria-hidden="true">📰</div>
          )}
          <div className="news-hero-overlay" aria-hidden="true" />
        </div>
      </Link>

      <div className="news-hero-body">
        <div className="news-hero-eyebrow">
          <span className="news-hero-featured-badge">⭐ Top Story</span>
          {isBreaking && (
            <span className="news-hero-breaking-badge">🔴 Breaking</span>
          )}
          {pCat && (
            <span
              className="news-hero-cat-badge"
              style={{
                background: `${CAT_COLORS[pCat]}18`,
                color:       CAT_COLORS[pCat],
                border:      `1px solid ${CAT_COLORS[pCat]}30`,
              }}
            >{CAT_LABELS[pCat]}</span>
          )}
        </div>

        {/* Title is the primary keyboard/screen-reader target */}
        <Link href={`/news/${post.slug}`} style={{ textDecoration: "none" }}>
          <h2 className="news-hero-title">{post.title}</h2>
        </Link>

        {post.excerpt && (
          <p className="news-hero-excerpt">{post.excerpt}</p>
        )}

        <div className="news-hero-meta">
          <div className="news-hero-meta-left">
            <span className="news-date-pill">
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </span>
            <span className="news-read-time">⏱ {rt} min read</span>
            <span className="news-views">👁 {(post.view_count || 0).toLocaleString()}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className={`news-action-btn${isBookmarked ? " bookmarked" : ""}`}
              onClick={e => { e.preventDefault(); onBookmark(post.id); }}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
              title={isBookmarked ? "Bookmarked" : "Bookmark"}
            >
              {isBookmarked ? "🔖" : "🏷"}
            </button>

            <button
              className="news-action-btn share-btn"
              onClick={e => { e.preventDefault(); onShare(post.title, post.slug); }}
              aria-label="Share this article"
              title="Share"
            >📤</button>

            <Link href={`/news/${post.slug}`} className="news-hero-read-more">
              Read
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   NEWS CARD
══════════════════════════════════════════════ */
function NewsCard({ post, index, bookmarks, onBookmark, onShare }) {
  const isBookmarked = bookmarks.includes(post.id);
  const pTags        = post.tags || [];
  const pCat         = pTags.find(t => KNOWN_CATS.includes(t));
  const isBreaking   = pTags.includes("breaking");
  const displayTags  = pTags
    .filter(t => !KNOWN_CATS.includes(t) && t !== "breaking")
    .slice(0, 2);
  const rt = readTime(post.excerpt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.06, 0.4) }}
    >
      <div className="news-card">
        {/* Thumbnail */}
        <Link href={`/news/${post.slug}`} tabIndex={-1} aria-hidden="true">
          <div className="news-img-wrap">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                sizes="100px"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <div className="news-img-placeholder" aria-hidden="true">
                <span style={{ fontSize: "1.5rem" }}>📰</span>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <Link
          href={`/news/${post.slug}`}
          className="news-content"
          style={{ textDecoration: "none" }}
        >
          <h3 className="news-title">{post.title}</h3>

          <div className="news-badges">
            {isBreaking && (
              <span className="news-breaking-badge">🔴 Breaking</span>
            )}
            {pCat && (
              <span
                className="news-cat-badge"
                style={{
                  background: `${CAT_COLORS[pCat]}18`,
                  color:       CAT_COLORS[pCat],
                  border:      `1px solid ${CAT_COLORS[pCat]}30`,
                }}
              >{CAT_LABELS[pCat]}</span>
            )}
            {displayTags.map(t => (
              <span key={t} className="news-tag-pill">#{t}</span>
            ))}
          </div>

          <div className="news-meta">
            <div className="news-meta-left">
              <span className="news-date-pill">
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </span>
              <span className="news-read-time">⏱ {rt}m</span>
            </div>
            <div className="news-stats">
              <span className="news-stat">👁 {(post.view_count || 0).toLocaleString()}</span>
              <span className="news-read-more" aria-hidden="true">
                Read
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="news-card-actions">
          <button
            className={`news-action-btn${isBookmarked ? " bookmarked" : ""}`}
            onClick={() => onBookmark(post.id)}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
            title={isBookmarked ? "Bookmarked" : "Bookmark"}
          >
            {isBookmarked ? "🔖" : "🏷"}
          </button>
          <button
            className="news-action-btn share-btn"
            onClick={() => onShare(post.title, post.slug)}
            aria-label="Share this article"
            title="Share"
          >📤</button>
        </div>
      </div>
    </motion.article>
  );
}

/* ══════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   Props: initialPosts (server-fetched), fetchError (bool)
══════════════════════════════════════════════ */
export default function NewsClient({ initialPosts, fetchError }) {
  const [dark, toggleDark, mounted] = useDarkMode();

  // Bookmarks — client only, avoid SSR mismatch
  const [bookmarks, setBookmarks] = useState([]);
  const filterKeyRef = useRef("");
  useEffect(() => {
    const t = setTimeout(() => setBookmarks(getBookmarks()), 0);
    return () => clearTimeout(t);
  }, []);

  // Filters & sort
  const [search,    setSearch]    = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [activeCat, setActiveCat] = useState("all");
  const [sort,      setSort]      = useState("newest");

  // Pagination
  const [page,        setPage]        = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const loadTimerRef = useRef(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset pagination whenever filters change
  useEffect(() => {
    const key = `${debouncedSearch}|${activeTag}|${activeCat}|${sort}`;
    if (!filterKeyRef.current) {
      filterKeyRef.current = key;
      return undefined;
    }
    filterKeyRef.current = key;
    const t = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(t);
  }, [debouncedSearch, activeTag, activeCat, sort]);

  /* ── Derived data ── */

  // Breaking posts — for the ticker
  const breakingPosts = useMemo(
    () => initialPosts.filter(p => (p.tags || []).includes("breaking")),
    [initialPosts]
  );

  // Top 5 by views — popular strip
  const popularPosts = useMemo(
    () => [...initialPosts]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5),
    [initialPosts]
  );

  // Categories present in data
  const allCats = useMemo(() => {
    const s = new Set();
    initialPosts.forEach(p =>
      (p.tags || []).forEach(t => { if (KNOWN_CATS.includes(t)) s.add(t); })
    );
    return Array.from(s);
  }, [initialPosts]);

  // Top 15 non-system tags by frequency
  const allTags = useMemo(() => {
    const freq = {};
    initialPosts.forEach(p =>
      (p.tags || []).forEach(t => {
        if (KNOWN_CATS.includes(t) || t === "breaking") return;
        const n = normalizeTag(t);
        if (n) freq[n] = (freq[n] || 0) + 1;
      })
    );
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TAGS)
      .map(([tag]) => tag);
  }, [initialPosts]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let r = [...initialPosts];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      r = r.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        (p.tags || []).some(t => normalizeTag(t).includes(q))
      );
    }

    if (activeCat !== "all") {
      r = r.filter(p => (p.tags || []).includes(activeCat));
    }

    if (activeTag !== "all") {
      r = r.filter(p => (p.tags || []).map(normalizeTag).includes(activeTag));
    }

    if (sort === "newest") {
      r.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    } else if (sort === "most_viewed") {
      r.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    return r;
  }, [initialPosts, debouncedSearch, activeCat, activeTag, sort]);

  // Pagination slices
  const heroPost    = filtered[0];
  const listPosts   = filtered.slice(1);
  const visibleList = listPosts.slice(0, page * PAGE_SIZE);
  const hasMore     = visibleList.length < listPosts.length;

  /* ── Infinite scroll ── */
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && !loadTimerRef.current) {
          setLoadingMore(true);
          loadTimerRef.current = setTimeout(() => {
            setPage(p => p + 1);
            setLoadingMore(false);
            loadTimerRef.current = null;
          }, 250);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, [hasMore, loadingMore, visibleList.length]);

  /* ── Handlers ── */
  const handleBookmark = useCallback((id) => {
    setBookmarks(toggleBookmark(id));
  }, []);

  const handleShare = useCallback((title, slug) => {
    sharePost(title, slug);
  }, []);

  const clearFilters = () => {
    setSearch(""); setActiveTag("all"); setActiveCat("all"); setSort("newest");
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="news-root">
      {/* Decorative orbs — aria-hidden so screen readers skip */}
      <div className="news-bg-orbs" aria-hidden="true">
        <div className="news-orb-1" />
        <div className="news-orb-2" />
      </div>

      <main className="news-container">

        {/* ── Page Header ── */}
        <motion.header
          className="news-page-header"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="news-header-text">
            <span className="sec-label">✦ Latest News</span>
            <h1 className="sec-title">AIDLA <span>News</span></h1>
            <p className="sec-desc">
              Stay updated with the latest announcements, events, and community news.
            </p>
          </div>
          <DarkModeToggle dark={dark} onToggle={toggleDark} mounted={mounted} />
        </motion.header>

        {/* ── Error ── */}
        {fetchError && (
          <div className="news-error-alert" role="alert">
            Unable to load news right now. Please try again later.
          </div>
        )}

        {/* ── Breaking Ticker ── */}
        {breakingPosts.length > 0 && (
          <motion.div
            className="news-breaking-bar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38 }}
            aria-label="Breaking news ticker"
          >
            <span className="news-breaking-label" aria-hidden="true">🔴 Breaking</span>
            <div className="news-breaking-scroll" aria-live="off" aria-atomic="false">
              <div className="news-breaking-text">
                {breakingPosts.map(p => p.title).join("  •  ")}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Popular Strip ── */}
        {popularPosts.length > 0 && (
          <motion.section
            className="news-popular-section"
            aria-labelledby="popular-heading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <h2 id="popular-heading" className="news-popular-title">🔥 Most Read</h2>
            <div className="news-popular-list" role="list">
              {popularPosts.map((p, i) => (
                <Link
                  href={`/news/${p.slug}`}
                  key={p.id}
                  className="news-popular-card"
                  role="listitem"
                  aria-label={p.title}
                >
                  {p.cover_image_url ? (
                    <div style={{ position: "relative", width: "100%", height: "82px" }}>
                      <Image
                        src={p.cover_image_url}
                        alt={p.title}
                        fill
                        sizes="150px"
                        style={{ objectFit: "cover" }}
                        priority={i === 0}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ) : (
                    <div className="news-popular-img-ph" aria-hidden="true">📰</div>
                  )}
                  <div className="news-popular-info">
                    <h3
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: "0 0 5px",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >{p.title}</h3>
                    <div className="news-popular-stat">
                      👁 {(p.view_count || 0).toLocaleString()} views
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12 }}
        >
          <div className="news-search-wrap">
            <label htmlFor="news-search" className="sr-only">Search news</label>
            <input
              id="news-search"
              className="news-search-input"
              placeholder="Search news, topics, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck="false"
            />
            {search
              ? (
                <button
                  className="news-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >✕</button>
              ) : (
                <span className="news-search-icon" aria-hidden="true">🔍</span>
              )
            }
          </div>
        </motion.div>

        {/* ── Category Filter ── */}
        {allCats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.16 }}
          >
            <section className="news-cat-section" aria-labelledby="cat-filter-label">
              <span id="cat-filter-label" className="news-cat-label">Category</span>
              <div className="news-cat-wrap" role="group" aria-label="Filter by category">
                <button
                  className={`news-cat-btn${activeCat === "all" ? " active" : ""}`}
                  onClick={() => setActiveCat("all")}
                  aria-pressed={activeCat === "all"}
                >All</button>
                {allCats.map(c => (
                  <button
                    key={c}
                    className={`news-cat-btn${activeCat === c ? " active" : ""}`}
                    onClick={() => setActiveCat(c)}
                    aria-pressed={activeCat === c}
                  >{CAT_LABELS[c] || c}</button>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Tag Filter ── */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.20 }}
          >
            <TagFilter
              allTags={allTags}
              activeTag={activeTag}
              onTagChange={setActiveTag}
            />
          </motion.div>
        )}

        {/* ── Sort + Result Count ── */}
        <div className="news-sort-wrap">
          <span
            className="news-result-count"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            {activeCat !== "all" ? ` in ${CAT_LABELS[activeCat] || activeCat}` : ""}
            {activeTag !== "all" ? ` tagged #${activeTag}` : ""}
          </span>
          <div className="news-sort-btns" role="group" aria-label="Sort articles">
            <button
              className={`news-sort-btn${sort === "newest" ? " active" : ""}`}
              onClick={() => setSort("newest")}
              aria-pressed={sort === "newest"}
            >🕐 Newest</button>
            <button
              className={`news-sort-btn${sort === "most_viewed" ? " active" : ""}`}
              onClick={() => setSort("most_viewed")}
              aria-pressed={sort === "most_viewed"}
            >👁 Most Viewed</button>
          </div>
        </div>

        {/* ── Posts ── */}
        {filtered.length > 0 ? (
          <div>
            {/* Hero — first filtered result */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <HeroCard
                post={heroPost}
                bookmarks={bookmarks}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            </motion.div>

            {/* List */}
            <div className="news-list" role="list">
              {visibleList.map((p, i) => (
                <NewsCard
                  key={p.id}
                  post={p}
                  index={i}
                  bookmarks={bookmarks}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <>
                <div
                  ref={sentinelRef}
                  className="news-load-sentinel"
                  aria-hidden="true"
                />
                {loadingMore && (
                  <div className="news-loading-more" aria-live="polite">
                    <div className="news-spinner" aria-hidden="true" />
                    <span>Loading more…</span>
                  </div>
                )}
              </>
            )}

            {/* End of feed */}
            {!hasMore && filtered.length > 1 && (
              <div className="news-end-message" aria-live="polite">
                <div className="news-end-line" />
                <span>You&apos;re all caught up ✦</span>
                <div className="news-end-line" />
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {debouncedSearch || activeCat !== "all" || activeTag !== "all" ? (
              <motion.div
                className="news-no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
              >
                <span style={{ fontSize: "2.2rem", display: "block", marginBottom: "10px" }} aria-hidden="true">
                  🔍
                </span>
                <h2 className="news-no-results" style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
                  No results found
                </h2>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 20px", fontSize: "0.88rem" }}>
                  Try a different search term or clear the filters.
                </p>
                <button className="news-clear-btn" onClick={clearFilters}>
                  Clear Filters
                </button>
              </motion.div>
            ) : !fetchError && (
              <motion.div
                className="news-empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
              >
                <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }} aria-hidden="true">
                  📰
                </span>
                <h2 className="news-empty-title">No News Yet</h2>
                <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.85rem" }}>
                  We&apos;re preparing the latest news. Check back soon!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </main>
    </div>
  );
}
