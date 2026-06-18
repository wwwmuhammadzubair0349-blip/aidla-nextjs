"use client";
// app/user/search/page.jsx — Universal Search

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FILTERS = [
  { id: "all",       label: "All" },
  { id: "courses",   label: "Courses" },
  { id: "blogs",     label: "Articles" },
  { id: "news",      label: "News" },
  { id: "faqs",      label: "FAQs" },
  { id: "resources", label: "Resources" },
];

const CSS = `
.sr-wrap { font-family: 'DM Sans', system-ui, sans-serif; min-height: 50vh; }
.sr-top { margin-bottom: 20px; }
.sr-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: #0f172a; margin-bottom: 14px; }
.sr-input-wrap { position: relative; }
.sr-input {
  width: 100%; padding: 13px 16px 13px 44px;
  border: 2px solid #e2e8f0; border-radius: 14px;
  font-size: 1rem; color: #0f172a; outline: none;
  font-family: inherit; background: #fafbff;
  transition: border-color 0.15s;
}
.sr-input:focus { border-color: #1a3a8f; }
.sr-input-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; pointer-events: none;
}
.sr-input-clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; padding: 4px;
}
.sr-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.sr-filter {
  padding: 5px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #64748b; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.sr-filter.active { background: #1a3a8f; color: #fff; border-color: #1a3a8f; }
.sr-filter:hover:not(.active) { border-color: #1a3a8f; color: #1a3a8f; }

.sr-section { margin-bottom: 24px; }
.sr-section-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px; }
.sr-items { display: flex; flex-direction: column; gap: 6px; }
.sr-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 11px 14px; border: 1px solid #f1f5f9; border-radius: 12px;
  background: #fff; text-decoration: none; color: inherit; transition: all 0.15s;
}
.sr-item:hover { border-color: #cbd5e1; box-shadow: 0 4px 14px rgba(15,23,42,0.07); }
.sr-item-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
.sr-item-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-bottom: 2px; line-height: 1.3; }
.sr-item-meta { font-size: 0.74rem; color: #64748b; }
.sr-item-badge { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 0.64rem; font-weight: 800; background: #f0f4ff; color: #1a3a8f; margin-left: 6px; }

.sr-empty { text-align: center; padding: 48px 20px; }
.sr-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.sr-empty-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.sr-empty-sub { font-size: 0.84rem; color: #64748b; }
.sr-hint { text-align: center; padding: 48px 20px; }
.sr-hint-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
.sr-hint-text { font-size: 0.88rem; color: #94a3b8; }
.sr-count { font-size: 0.74rem; color: #94a3b8; margin-bottom: 14px; font-weight: 600; }

.sr-shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:sr-shim 1.4s infinite; border-radius:10px; }
@keyframes sr-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sr-skel { height: 52px; border-radius: 12px; margin-bottom: 6px; }
`;

export default function SearchPage() {
  const [query,   setQuery]   = useState("");
  const [filter,  setFilter]  = useState("all");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Keyboard shortcut Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => { runSearch(query.trim()); }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, filter]);

  const runSearch = async (q) => {
    const like = `%${q}%`;
    const searches = [];

    if (filter === "all" || filter === "courses") {
      searches.push(
        supabase.from("course_courses").select("id,title,category,level,instructor_name")
          .ilike("title", like).eq("is_published", true).limit(5)
          .then(r => (r.data || []).map(c => ({ type: "course", icon: "📚", title: c.title, meta: `${c.category || "Course"} · ${c.level || ""}`, href: `/user/course/${c.id}` })))
      );
    }
    if (filter === "all" || filter === "blogs") {
      searches.push(
        supabase.from("blogs_posts").select("id,title,slug,author_name,published_at")
          .ilike("title", like).eq("status", "published").limit(5)
          .then(r => (r.data || []).map(b => ({ type: "blog", icon: "✍️", title: b.title, meta: `Article · ${b.author_name || "AIDLA"}`, href: `/blogs/${b.slug}` })))
      );
    }
    if (filter === "all" || filter === "news") {
      searches.push(
        supabase.from("news_posts").select("id,title,slug,published_at")
          .ilike("title", like).eq("status", "published").limit(5)
          .then(r => (r.data || []).map(n => ({ type: "news", icon: "📰", title: n.title, meta: "News", href: `/news/${n.slug}` })))
      );
    }
    if (filter === "all" || filter === "faqs") {
      searches.push(
        supabase.from("faqs").select("id,question,category,slug")
          .ilike("question", like).eq("status", "published").limit(5)
          .then(r => (r.data || []).map(f => ({ type: "faq", icon: "❓", title: f.question, meta: `FAQ · ${f.category || "General"}`, href: `/faqs` })))
      );
    }
    if (filter === "all" || filter === "resources") {
      searches.push(
        supabase.from("resources").select("id,title,category,file_type")
          .ilike("title", like).eq("status", "published").limit(5)
          .then(r => (r.data || []).map(res => ({ type: "resource", icon: "📁", title: res.title, meta: `Resource · ${res.file_type || res.category || ""}`, href: `/user/learn` })))
      );
    }

    const resolved = await Promise.all(searches);
    const flat = resolved.flat();
    setResults(flat);
    setLoading(false);
  };

  const total = results?.length || 0;

  return (
    <div className="sr-wrap">
      <style>{CSS}</style>

      <div className="sr-top">
        <div className="sr-title">Search AIDLA</div>
        <div className="sr-input-wrap">
          <span className="sr-input-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            className="sr-input"
            type="search"
            placeholder="Search courses, articles, FAQs, resources…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="sr-input-clear" onClick={() => { setQuery(""); setResults(null); }}>✕</button>
          )}
        </div>
        <div className="sr-filters" role="group" aria-label="Filter results">
          {FILTERS.map(f => (
            <button key={f.id} className={`sr-filter${filter === f.id ? " active" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      {!query && (
        <div className="sr-hint">
          <span className="sr-hint-icon">🔍</span>
          <div className="sr-hint-text">Type to search across courses, articles, news, FAQs and resources</div>
          <div style={{ fontSize: "0.72rem", color: "#cbd5e1", marginTop: 8 }}>Keyboard shortcut: Ctrl+K / ⌘K</div>
        </div>
      )}

      {loading && query && (
        <div>
          {[1,2,3,4].map(i => <div key={i} className="sr-skel sr-shimmer" />)}
        </div>
      )}

      {!loading && results !== null && total === 0 && (
        <div className="sr-empty">
          <span className="sr-empty-icon">😔</span>
          <div className="sr-empty-title">No results for "{query}"</div>
          <div className="sr-empty-sub">Try different keywords or remove filters.</div>
        </div>
      )}

      {!loading && results !== null && total > 0 && (
        <>
          <div className="sr-count">{total} result{total !== 1 ? "s" : ""} for "{query}"</div>
          <div className="sr-items">
            {results.map((r, i) => (
              <Link key={i} href={r.href} className="sr-item">
                <span className="sr-item-icon" aria-hidden="true">{r.icon}</span>
                <div>
                  <div className="sr-item-title">{r.title}<span className="sr-item-badge">{r.type}</span></div>
                  <div className="sr-item-meta">{r.meta}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
