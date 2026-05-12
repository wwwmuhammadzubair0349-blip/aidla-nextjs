"use client";
// app/projects/[slug]/ProjectDetailClient.jsx

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DOMAINS = {
  web:           { label: "Web",            icon: "🌐", color: "#3b82f6" },
  mobile:        { label: "Mobile",         icon: "📱", color: "#8b5cf6" },
  ai_ml:         { label: "AI / ML",        icon: "🤖", color: "#06b6d4" },
  iot:           { label: "IoT",            icon: "📡", color: "#10b981" },
  blockchain:    { label: "Blockchain",     icon: "⛓️", color: "#f59e0b" },
  data_science:  { label: "Data Science",   icon: "📊", color: "#6366f1" },
  cybersecurity: { label: "Cybersecurity",  icon: "🔒", color: "#ef4444" },
  ar_vr:         { label: "AR / VR",        icon: "🥽", color: "#ec4899" },
  other:         { label: "Other",          icon: "📦", color: "#64748b" },
};

const TYPES = {
  fyp:          "FYP",
  mini_project: "Mini Project",
  semester:     "Semester Project",
  research:     "Research",
  internship:   "Internship",
  other:        "Other",
};

const DIFF_COLORS = {
  beginner:     { bg: "rgba(22,163,74,0.08)",  color: "#15803d", border: "rgba(22,163,74,0.2)" },
  intermediate: { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.2)" },
  advanced:     { bg: "rgba(239,68,68,0.08)",  color: "#dc2626", border: "rgba(239,68,68,0.2)" },
};

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function RelatedCard({ item }) {
  const dom = DOMAINS[item.domain] || DOMAINS.other;
  return (
    <Link href={`/projects/${item.slug}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.18s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#dce7fb"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,58,143,0.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${dom.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{dom.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{dom.label} · ⬆ {item.upvotes_count || 0}</div>
        </div>
        <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}

export default function ProjectDetailClient({ slug }) {
  const router = useRouter();

  const [idea,        setIdea]        = useState(null);
  const [related,     setRelated]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [user,        setUser]        = useState(null);
  const [upvoted,     setUpvoted]     = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [togglingUp,  setTogglingUp]  = useState(false);
  const [togglingSave,setTogglingSave]= useState(false);
  const [copied,      setCopied]      = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    supabase.rpc("project_ideas_get_by_slug", { p_slug: slug }).then(({ data, error }) => {
      if (error || !data || data.length === 0) { setNotFound(true); setLoading(false); return; }
      const m = data[0];
      setIdea(m);
      setUpvoteCount(m.upvotes_count || 0);
      setLoading(false);

      supabase.rpc("project_ideas_get_related", { p_id: m.id, p_domain: m.domain, p_type: m.type, p_limit: 4 })
        .then(({ data: rel }) => setRelated(rel || []));
    });
  }, [slug]);

  // load user state (upvoted/saved)
  useEffect(() => {
    if (!idea || !user) return;
    supabase.rpc("project_idea_user_state", { p_idea_id: idea.id, p_user_id: user.id }).then(({ data }) => {
      if (data) { setUpvoted(data.upvoted); setSaved(data.saved); }
    });
  }, [idea, user]);

  const handleUpvote = useCallback(async () => {
    if (!user) { router.push(`/login?redirect=/projects/${slug}`); return; }
    if (togglingUp) return;
    setTogglingUp(true);
    const prev = upvoted;
    setUpvoted(!prev);
    setUpvoteCount(c => prev ? c - 1 : c + 1);
    const { data } = await supabase.rpc("project_idea_toggle_upvote", { p_idea_id: idea.id, p_user_id: user.id });
    if (!data?.ok) { setUpvoted(prev); setUpvoteCount(c => prev ? c + 1 : c - 1); }
    setTogglingUp(false);
  }, [user, upvoted, togglingUp, idea, slug, router]);

  const handleSave = useCallback(async () => {
    if (!user) { router.push(`/login?redirect=/projects/${slug}`); return; }
    if (togglingSave) return;
    setTogglingSave(true);
    const prev = saved;
    setSaved(!prev);
    const { data } = await supabase.rpc("project_idea_toggle_save", { p_idea_id: idea.id, p_user_id: user.id });
    if (!data?.ok) setSaved(prev);
    setTogglingSave(false);
  }, [user, saved, togglingSave, idea, slug, router]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${idea?.title} — Project Idea on AIDLA`);
    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter:  `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    window.open(urls[platform], "_blank");
  };

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div><div style={{ color: "#64748b" }}>Loading idea…</div></div>
    </div>
  );

  // ── 404 ──
  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: 16 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Idea Not Found</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>This project idea may have been removed or the link is incorrect.</p>
        <Link href="/projects" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>
          ← Browse All Ideas
        </Link>
      </div>
    </div>
  );

  const m        = idea;
  const dom      = DOMAINS[m.domain] || DOMAINS.other;
  const diffStyle= DIFF_COLORS[m.difficulty] || DIFF_COLORS.beginner;

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        .pjd-layout{display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:start;}
        @media(max-width:900px){.pjd-layout{grid-template-columns:1fr!important;}}
        .pjd-sidebar{position:sticky;top:20px;display:flex;flex-direction:column;gap:14px;}
        .section-card{background:#fff;border:1px solid #f1f5f9;border-radius:16px;padding:20px 22px;box-shadow:0 1px 6px rgba(0,0,0,0.04);}
        .section-label{font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;}
        .tag-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Breadcrumb */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "10px 16px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>Home</Link>
            <span>›</span>
            <Link href="/projects" style={{ color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>Projects</Link>
            <span>›</span>
            <span style={{ color: "#0f172a", fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(135deg,#0f172a 0%,#1e3a8a 70%,${dom.color}44 100%)`, padding: "24px 16px 28px", borderBottom: "1px solid #1e3a8a" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${dom.color}22`, color: dom.color, border: `1px solid ${dom.color}44` }}>
                {dom.icon} {dom.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
                {TYPES[m.type] || m.type}
              </span>
              {m.difficulty && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}` }}>
                  {m.difficulty}
                </span>
              )}
              {m.is_ai_generated && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)" }}>
                  ✨ AI Generated
                </span>
              )}
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: "clamp(1.25rem,4vw,2rem)", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{m.title}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
              {m.subject           && <span>📖 {m.subject}</span>}
              {m.educational_level && <span>🎓 {m.educational_level}</span>}
              {m.university        && <span>🏛 {m.university}</span>}
              {m.course            && <span>📚 {m.course}</span>}
              {m.estimated_duration && <span>⏱ {m.estimated_duration}</span>}
              {m.team_size_min && <span>👥 {m.team_size_min === m.team_size_max ? m.team_size_min : `${m.team_size_min}–${m.team_size_max}`} members</span>}
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              <span>⬆ {upvoteCount} upvotes</span>
              <span>👁 {m.view_count || 0} views</span>
              <span>💾 {m.saves_count || 0} saved</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 14px 48px" }}>
          <div className="pjd-layout">

            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Description */}
              {m.description && (
                <div className="section-card">
                  <div className="section-label">About This Idea</div>
                  <p style={{ margin: 0, color: "#374151", fontSize: 14, lineHeight: 1.8 }}>{m.description}</p>
                  {m.tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                      {m.tags.map(t => (
                        <Link key={t} href={`/projects?q=${encodeURIComponent(t)}`}
                          style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#eff6ff", color: "#1e3a8a", border: "1px solid rgba(59,130,246,0.2)", textDecoration: "none" }}>
                          #{t}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              {m.features?.length > 0 && (
                <div className="section-card">
                  <div className="section-label">✅ Key Features</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#334155" }}>
                        <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(22,163,74,0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {m.challenges?.length > 0 && (
                <div className="section-card">
                  <div className="section-label">⚡ Challenges</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.challenges.map((c, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "#334155" }}>
                        <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(245,158,11,0.1)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* HTML Preview */}
              {m.html_preview && (
                <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>🖥 Preview</div>
                    <button onClick={() => setShowPreview(v => !v)}
                      style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </button>
                  </div>
                  {showPreview ? (
                    <iframe
                      srcDoc={m.html_preview}
                      style={{ width: "100%", height: "clamp(300px,55vh,600px)", border: "none" }}
                      title={`${m.title} preview`}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div style={{ padding: "20px 18px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                      Click &quot;Show Preview&quot; to view the HTML preview
                    </div>
                  )}
                </div>
              )}

              {/* Reference links */}
              {m.reference_links?.length > 0 && (
                <div className="section-card">
                  <div className="section-label">🔗 Reference Links</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {m.reference_links.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, color: "#1e3a8a", textDecoration: "none", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        🔗 {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="section-card">
                <div className="section-label">Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                  {[
                    { label: "Domain",      value: dom.label },
                    { label: "Type",        value: TYPES[m.type] || m.type },
                    { label: "Difficulty",  value: m.difficulty },
                    { label: "Duration",    value: m.estimated_duration },
                    { label: "Team Size",   value: m.team_size_min && (m.team_size_min === m.team_size_max ? `${m.team_size_min} person` : `${m.team_size_min}–${m.team_size_max} people`) },
                    { label: "Subject",     value: m.subject },
                    { label: "Level",       value: m.educational_level },
                    { label: "Course",      value: m.course },
                    { label: "University",  value: m.university },
                    { label: "File",        value: m.file_type?.toUpperCase() },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related */}
              {related.length > 0 && (
                <div className="section-card">
                  <div className="section-label">Related Ideas</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {related.map(r => <RelatedCard key={r.id} item={r} />)}
                  </div>
                  <Link href="/projects" style={{ display: "block", textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 700, color: "#3b82f6", textDecoration: "none" }}>
                    Browse all ideas →
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="pjd-sidebar">

              {/* Tech stack + actions */}
              <div className="section-card">
                {m.tech_stack?.length > 0 && (
                  <>
                    <div className="section-label">🛠 Tech Stack</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {m.tech_stack.map(t => (
                        <span key={t} className="tag-pill">{t}</span>
                      ))}
                    </div>
                  </>
                )}

                {/* Upvote + Save */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <button onClick={handleUpvote} disabled={togglingUp}
                    style={{ padding: "11px 0", border: `1px solid ${upvoted ? "#3b82f6" : "#e2e8f0"}`, borderRadius: 10, background: upvoted ? "#eff6ff" : "#fff", color: upvoted ? "#1e3a8a" : "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                    ⬆ {upvoteCount} {upvoted ? "Upvoted" : "Upvote"}
                  </button>
                  <button onClick={handleSave} disabled={togglingSave}
                    style={{ padding: "11px 0", border: `1px solid ${saved ? "#f59e0b" : "#e2e8f0"}`, borderRadius: 10, background: saved ? "#fffbeb" : "#fff", color: saved ? "#b45309" : "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                    {saved ? "🔖 Saved" : "🔖 Save"}
                  </button>
                </div>

                {/* File download */}
                {m.file_url && (
                  <a href={m.file_url} target="_blank" rel="noopener noreferrer" download
                    style={{ display: "block", width: "100%", padding: "12px 0", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", textAlign: "center", textDecoration: "none", marginBottom: 12 }}>
                    ⬇ Download File ({m.file_type?.toUpperCase()}{m.file_size_bytes ? ` · ${formatBytes(m.file_size_bytes)}` : ""})
                  </a>
                )}

                {/* Share */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                  <div className="section-label" style={{ marginBottom: 10 }}>Share</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 8 }}>
                    {[
                      { id: "whatsapp", label: "WhatsApp", bg: "#25D366", icon: "💬" },
                      { id: "twitter",  label: "Twitter",  bg: "#000",    icon: "🐦" },
                      { id: "telegram", label: "Telegram", bg: "#26A5E4", icon: "✈️" },
                    ].map(s => (
                      <button key={s.id} onClick={() => handleShare(s.id)}
                        style={{ padding: "8px 4px", background: s.bg, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleCopyLink}
                    style={{ width: "100%", padding: "9px 0", background: copied ? "rgba(22,163,74,0.07)" : "#f8fafc", color: copied ? "#15803d" : "#475569", border: `1px solid ${copied ? "rgba(22,163,74,0.25)" : "#e2e8f0"}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                    {copied ? "✅ Link Copied!" : "🔗 Copy Link"}
                  </button>
                </div>
              </div>

              {/* AI Generator CTA */}
              <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius: 16, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✨</div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: 13, marginBottom: 6 }}>Need More Ideas?</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 12, lineHeight: 1.5 }}>Use our AI generator to get 3 custom project ideas</div>
                <Link href="/projects/generate"
                  style={{ display: "block", padding: "9px 0", background: "#3b82f6", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  Generate Ideas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}