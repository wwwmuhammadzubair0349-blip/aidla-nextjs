"use client";
// app/user/insights/InsightsContent.jsx — Insights Hub (Blogs + News)

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const CSS = `
.ins-wrap { font-family: 'DM Sans', system-ui, sans-serif; }
.ins-header { margin-bottom: 20px; }
.ins-title { font-size: 1.35rem; font-weight: 900; color: #0f172a; margin: 0 0 4px; }
.ins-sub { font-size: 0.8rem; color: #64748b; }
.ins-search-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.ins-search {
  flex: 1; min-width: 180px;
  padding: 9px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.85rem; font-family: inherit; outline: none; color: #0f172a;
  background: #fff; transition: border-color 0.15s;
}
.ins-search:focus { border-color: #1a3a8f; }
.ins-tabs { display: flex; gap: 0; border-bottom: 2px solid #f1f5f9; margin-bottom: 20px; overflow-x: auto; scrollbar-width: none; }
.ins-tabs::-webkit-scrollbar { display: none; }
.ins-tab {
  padding: 10px 18px; border: none; background: none;
  font-size: 0.85rem; font-weight: 700; color: #64748b;
  cursor: pointer; border-bottom: 2.5px solid transparent;
  margin-bottom: -2px; white-space: nowrap; font-family: inherit;
  display: flex; align-items: center; gap: 6px; transition: color 0.15s;
}
.ins-tab:hover { color: #0f172a; }
.ins-tab.active { color: #1a3a8f; border-bottom-color: #1a3a8f; }
.ins-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media(min-width:500px) { .ins-grid { grid-template-columns: 1fr 1fr; } }
@media(min-width:900px) { .ins-grid { grid-template-columns: 1fr 1fr 1fr; } }
.ins-card {
  border: 1.5px solid #e2e8f0; border-radius: 14px; background: #fff;
  text-decoration: none; display: flex; flex-direction: column; overflow: hidden;
  transition: box-shadow 0.18s, border-color 0.18s; cursor: pointer;
}
.ins-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.10); border-color: #c7d2fe; }
.ins-card-thumb {
  width: 100%; padding-bottom: 50%; background: #f1f5f9;
  position: relative; overflow: hidden; flex-shrink: 0;
}
.ins-card-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.ins-card-thumb-ph {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem;
}
.ins-card-body { padding: 13px 15px 15px; flex: 1; display: flex; flex-direction: column; }
.ins-card-badges { display: flex; align-items: center; gap: 6px; margin-bottom: 7px; flex-wrap: wrap; }
.ins-badge {
  font-size: 0.64rem; font-weight: 800; padding: 2px 7px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.ins-badge-blog { background: rgba(59,130,246,0.1); color: #1d4ed8; }
.ins-badge-news { background: rgba(239,68,68,0.1); color: #b91c1c; }
.ins-badge-ai { background: rgba(139,92,246,0.1); color: #7c3aed; }
.ins-card-title {
  font-size: 0.9rem; font-weight: 800; color: #0f172a; line-height: 1.4; margin-bottom: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  flex: 1;
}
.ins-card-excerpt {
  font-size: 0.77rem; color: #64748b; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: 10px;
}
.ins-card-meta { font-size: 0.71rem; color: #94a3b8; font-weight: 600; margin-top: auto; }
.ins-cat-pill {
  font-size: 0.64rem; font-weight: 800; padding: 2px 7px; border-radius: 20px;
  background: rgba(26,58,143,0.08); color: #1a3a8f; text-transform: capitalize;
}
.ins-shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
@keyframes shimmer { to { background-position: -200% 0; } }
.ins-empty { text-align: center; padding: 56px 20px; }
.ins-empty-icon { font-size: 2.8rem; margin-bottom: 12px; }
.ins-empty-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.ins-empty-sub { font-size: 0.82rem; color: #64748b; }
`;

const CAT_COLORS = {
  general:"#3b82f6", politics:"#8b5cf6", education:"#0891b2",
  technology:"#0f766e", community:"#16a34a", events:"#d97706", announcements:"#dc2626",
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TABS = [
  { id: "all", label: "All", icon: "✨" },
  { id: "blog", label: "Blogs", icon: "✍️" },
  { id: "news", label: "News", icon: "📰" },
];

function SkeletonCard() {
  return (
    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
      <div className="ins-shimmer" style={{ paddingBottom: "50%", position: "relative" }} />
      <div style={{ padding: "13px 15px 15px" }}>
        <div className="ins-shimmer" style={{ height: 10, width: "40%", marginBottom: 10 }} />
        <div className="ins-shimmer" style={{ height: 14, width: "90%", marginBottom: 6 }} />
        <div className="ins-shimmer" style={{ height: 14, width: "70%", marginBottom: 12 }} />
        <div className="ins-shimmer" style={{ height: 10, width: "30%" }} />
      </div>
    </div>
  );
}

export default function InsightsContent() {
  const [tab, setTab]         = useState("all");
  const [query, setQuery]     = useState("");
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef           = useRef(null);

  const fetchPosts = useCallback(async (t, q) => {
    setLoading(true);
    const like = `%${q}%`;
    let blogs = [], news = [];

    if (t !== "news") {
      const { data } = await supabase
        .from("blogs_posts")
        .select("id,title,author_name,slug,excerpt,cover_image_url,published_at,created_at,tags,ai_generated")
        .eq("status", "published")
        .is("deleted_at", null)
        .ilike("title", like)
        .order("published_at", { ascending: false })
        .limit(24);
      blogs = (data || []).map(p => ({ ...p, _type: "blog" }));
    }

    if (t !== "blog") {
      const { data } = await supabase
        .from("news_posts")
        .select("id,title,slug,excerpt,cover_image_url,published_at,created_at,tags,category,ai_generated")
        .eq("status", "published")
        .ilike("title", like)
        .order("published_at", { ascending: false })
        .limit(24);
      news = (data || []).map(p => ({ ...p, _type: "news" }));
    }

    let merged = [...blogs, ...news].sort(
      (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
    );
    if (t === "blog") merged = blogs;
    if (t === "news") merged = news;

    setPosts(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPosts(tab, query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [tab, query, fetchPosts]);

  function handleCardClick(post) {
    if (post._type === "blog" && post.slug) {
      window.open(`/blog/${post.slug}`, "_blank");
    } else if (post._type === "news" && post.slug) {
      window.open(`/news/${post.slug}`, "_blank");
    }
  }

  return (
    <div className="ins-wrap">
      <style>{CSS}</style>

      <div className="ins-header">
        <h1 className="ins-title">Insights</h1>
        <p className="ins-sub">Latest blogs, articles, and news from AIDLA</p>
      </div>

      <div className="ins-search-row">
        <input
          className="ins-search"
          type="search"
          placeholder="Search articles and news…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search insights"
        />
      </div>

      <div className="ins-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`ins-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ins-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="ins-empty">
          <div className="ins-empty-icon">{query ? "🔍" : "📭"}</div>
          <div className="ins-empty-title">{query ? "No results found" : "No content yet"}</div>
          <div className="ins-empty-sub">{query ? `Nothing matched "${query}"` : "Check back soon for new articles and news."}</div>
        </div>
      ) : (
        <div className="ins-grid">
          {posts.map(post => {
            const date = post.published_at || post.created_at;
            const catColor = CAT_COLORS[post.category] || "#3b82f6";
            return (
              <div key={`${post._type}-${post.id}`} className="ins-card" onClick={() => handleCardClick(post)} role="article" tabIndex={0} onKeyDown={e => e.key === "Enter" && handleCardClick(post)}>
                <div className="ins-card-thumb">
                  {post.cover_image_url
                    ? <img src={post.cover_image_url} alt={post.title} loading="lazy" />
                    : <div className="ins-card-thumb-ph">{post._type === "news" ? "📰" : "✍️"}</div>
                  }
                </div>
                <div className="ins-card-body">
                  <div className="ins-card-badges">
                    <span className={`ins-badge ins-badge-${post._type}`}>{post._type === "blog" ? "Blog" : "News"}</span>
                    {post.category && <span className="ins-cat-pill" style={{ background: `${catColor}18`, color: catColor }}>{post.category}</span>}
                    {post.ai_generated && <span className="ins-badge ins-badge-ai">AI</span>}
                  </div>
                  <div className="ins-card-title">{post.title}</div>
                  {post.excerpt && <div className="ins-card-excerpt">{post.excerpt}</div>}
                  <div className="ins-card-meta">
                    {post.author_name && <>{post.author_name} · </>}{timeAgo(date)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
