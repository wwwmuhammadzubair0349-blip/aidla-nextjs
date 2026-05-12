"use client";
// app/projects/ProjectsClient.jsx

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProjectIdeaGenerator from "@/components/ProjectIdeaGenerator";

const LIMIT = 12;

const DOMAINS = [
  { value: "",              label: "All Domains",    icon: "🗂️" },
  { value: "engineering",   label: "Engineering",    icon: "⚙️" },
  { value: "medical",       label: "Medical",        icon: "🩺" },
  { value: "education",     label: "Education",      icon: "📚" },
  { value: "business",      label: "Business",       icon: "📈" },
  { value: "school",        label: "School",         icon: "🏫" },
  { value: "web",           label: "Web / IT",       icon: "🌐" },
  { value: "mobile",        label: "Mobile",         icon: "📱" },
  { value: "ai_ml",         label: "AI / ML",        icon: "🤖" },
  { value: "iot",           label: "IoT",            icon: "📡" },
  { value: "blockchain",    label: "Blockchain",     icon: "⛓️" },
  { value: "data_science",  label: "Data Science",   icon: "📊" },
  { value: "cybersecurity", label: "Cybersecurity",  icon: "🔒" },
  { value: "ar_vr",         label: "AR / VR",        icon: "🥽" },
  { value: "other",         label: "Other",          icon: "📦" },
];

const TYPES = [
  { value: "",             label: "All Types" },
  { value: "fyp",          label: "FYP" },
  { value: "mini_project", label: "Mini Project" },
  { value: "semester",     label: "Semester Project" },
  { value: "research",     label: "Research" },
  { value: "internship",   label: "Internship" },
  { value: "other",        label: "Other" },
];

const DIFFICULTIES = [
  { value: "",             label: "Any Difficulty" },
  { value: "beginner",     label: "🟢 Beginner" },
  { value: "intermediate", label: "🟡 Intermediate" },
  { value: "advanced",     label: "🔴 Advanced" },
];

const DIFF_COLORS = {
  beginner:     { bg: "rgba(22,163,74,0.08)",  color: "#15803d", border: "rgba(22,163,74,0.2)" },
  intermediate: { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.2)" },
  advanced:     { bg: "rgba(239,68,68,0.08)",  color: "#dc2626", border: "rgba(239,68,68,0.2)" },
};

const DOMAIN_COLORS = {
  engineering:   "#1e3a8a",
  medical:       "#10b981",
  education:     "#6366f1",
  business:      "#f59e0b",
  school:        "#14b8a6",
  web:           "#3b82f6",
  mobile:        "#8b5cf6",
  ai_ml:         "#06b6d4",
  iot:           "#10b981",
  blockchain:    "#f59e0b",
  data_science:  "#6366f1",
  cybersecurity: "#ef4444",
  ar_vr:         "#ec4899",
  other:         "#64748b",
};

function IdeaCard({ item }) {
  const domainObj = DOMAINS.find(d => d.value === item.domain);
  const diffStyle = DIFF_COLORS[item.difficulty] || DIFF_COLORS.beginner;
  const accentColor = DOMAIN_COLORS[item.domain] || "#64748b";

  return (
    <Link href={`/projects/${item.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
      <article style={{
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}22`;
          e.currentTarget.style.borderColor = `${accentColor}44`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
          e.currentTarget.style.borderColor = "#f1f5f9";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ height: 4, background: accentColor }} />
        <div style={{ padding: "14px 14px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 20 }}>{domainObj?.icon || "📦"}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {domainObj?.label || "Other"}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                  {TYPES.find(t => t.value === item.type)?.label || item.type}
                </div>
              </div>
            </div>
            {item.difficulty && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}`, textTransform: "uppercase", flexShrink: 0 }}>
                {item.difficulty}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.description}
            </p>
          )}

          {/* Tech stack */}
          {item.tech_stack?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {item.tech_stack.slice(0, 3).map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                  {t}
                </span>
              ))}
              {item.tech_stack.length > 3 && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                  +{item.tech_stack.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto", paddingTop: 4 }}>
            {item.subject          && <span style={{ fontSize: 10, color: "#64748b" }}>📖 {item.subject}</span>}
            {item.educational_level && <span style={{ fontSize: 10, color: "#64748b" }}>🎓 {item.educational_level}</span>}
            {item.estimated_duration && <span style={{ fontSize: 10, color: "#64748b" }}>⏱ {item.estimated_duration}</span>}
            {item.team_size_min && (
              <span style={{ fontSize: 10, color: "#64748b" }}>
                👥 {item.team_size_min === item.team_size_max ? item.team_size_min : `${item.team_size_min}-${item.team_size_max}`}
              </span>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #f1f5f9", marginTop: 4 }}>
            <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8" }}>
              <span>⬆ {item.upvotes_count || 0}</span>
              <span>👁 {item.view_count || 0}</span>
              {item.is_ai_generated && <span style={{ color: "#06b6d4", fontWeight: 700 }}>✨ AI</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>View →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #f1f5f9" }}>
      <div style={{ height: 4, background: "#f1f5f9" }} />
      <div style={{ padding: 14 }}>
        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 6, marginBottom: 10, width: "40%" }} />
        <div style={{ height: 16, background: "#f1f5f9", borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, width: "70%", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ height: 20, width: 50, background: "#f1f5f9", borderRadius: 20 }} />
          <div style={{ height: 20, width: 60, background: "#f1f5f9", borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, options, onChange, onReset, total, isMobile, onClose }) {
  const hasActive = filters.domain || filters.type || filters.difficulty || filters.subject || filters.university || filters.course || filters.educational_level || filters.tech_stack;
  const sel = { width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#334155", background: "#fff", cursor: "pointer", outline: "none" };

  return (
    <aside style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 18, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>🔍 Filters</div>
        <div style={{ display: "flex", gap: 8 }}>
          {hasActive && (
            <button onClick={onReset} style={{ fontSize: 11, color: "#dc2626", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontWeight: 700 }}>
              ✕ Clear
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>✕</button>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>{total.toLocaleString()} ideas total</div>

      {/* Domain pills */}
      <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Domain</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {DOMAINS.map(d => (
          <button key={d.value} onClick={() => onChange("domain", d.value)}
            style={{ padding: "4px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid", background: filters.domain === d.value ? "#0f172a" : "#f8fafc", color: filters.domain === d.value ? "#fff" : "#475569", borderColor: filters.domain === d.value ? "#0f172a" : "#e2e8f0" }}>
            {d.icon} {d.label}
          </button>
        ))}
      </div>

      {/* Type */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Project Type</div>
        <select style={sel} value={filters.type} onChange={e => onChange("type", e.target.value)}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Difficulty</div>
        <select style={sel} value={filters.difficulty} onChange={e => onChange("difficulty", e.target.value)}>
          {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Dynamic filters from DB */}
      {options.subjects?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Subject</div>
          <select style={sel} value={filters.subject} onChange={e => onChange("subject", e.target.value)}>
            <option value="">All Subjects</option>
            {options.subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {options.educational_levels?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Level</div>
          <select style={sel} value={filters.educational_level} onChange={e => onChange("educational_level", e.target.value)}>
            <option value="">All Levels</option>
            {options.educational_levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      )}
      {options.universities?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>University</div>
          <select style={sel} value={filters.university} onChange={e => onChange("university", e.target.value)}>
            <option value="">All Institutions</option>
            {options.universities.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      )}
      {options.tech_stacks?.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Tech Stack</div>
          <select style={sel} value={filters.tech_stack} onChange={e => onChange("tech_stack", e.target.value)}>
            <option value="">Any Tech</option>
            {options.tech_stacks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}
    </aside>
  );
}

const EMPTY_FILTERS = { search: "", domain: "", type: "", difficulty: "", subject: "", course: "", educational_level: "", university: "", tech_stack: "" };

export default function ProjectsClient({ initialIdeas = [], initialTotal = 0, initialOptions = {} }) {
  const router       = useRouter();

  const [ideas,      setIdeas]      = useState(initialIdeas);
  const [total,      setTotal]      = useState(initialTotal);
  const [options]                   = useState(initialOptions);
  const [loading,    setLoading]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [filters,    setFilters]    = useState(EMPTY_FILTERS);

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  const load = useCallback(async (f, p = 1) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("project_ideas_public_list", {
      p_search:             f.search            || null,
      p_domain:             f.domain            || null,
      p_type:               f.type              || null,
      p_difficulty:         f.difficulty        || null,
      p_subject:            f.subject           || null,
      p_course:             f.course            || null,
      p_educational_level:  f.educational_level || null,
      p_university:         f.university        || null,
      p_tech_stack:         f.tech_stack        || null,
      p_limit:              LIMIT,
      p_offset:             (p - 1) * LIMIT,
    });
    if (!error && data) { setIdeas(data); setTotal(data[0]?.total_count || 0); }
    setLoading(false);
  }, []);

  const pushParams = (f, p = 1) => {
    const params = new URLSearchParams();
    if (f.search)             params.set("q",          f.search);
    if (f.domain)             params.set("domain",     f.domain);
    if (f.type)               params.set("type",       f.type);
    if (f.difficulty)         params.set("difficulty", f.difficulty);
    if (f.subject)            params.set("subject",    f.subject);
    if (f.educational_level)  params.set("level",      f.educational_level);
    if (f.university)         params.set("university", f.university);
    if (f.tech_stack)         params.set("tech",       f.tech_stack);
    if (p > 1)                params.set("page",       p);
    router.replace(`/projects${params.toString() ? `?${params}` : ""}`, { scroll: false });
  };

  const applyFilters = (f, p = 1) => {
    setFilters(f); setPage(p); pushParams(f, p); load(f, p);
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    applyFilters(next);
    setShowFilter(false);
  };

  const handleSearch = (value) => {
    const next = { ...filters, search: value };
    setFilters(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(next), 400);
  };

  const handleReset = () => {
    router.replace("/projects", { scroll: false });
    setFilters(EMPTY_FILTERS); setPage(1);
    if (searchRef.current) searchRef.current.value = "";
    load(EMPTY_FILTERS, 1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        .pj-layout{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start;}
        .pj-sidebar-desktop{display:block;}
        .pj-filter-fab{display:none;}
        .pj-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
        .pj-ai-tab{max-width:1200px;margin:-20px auto 0;padding:0 14px;position:relative;z-index:2;}
        .pj-ai-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:#fff;border:1px solid #fed7aa;border-radius:16px;box-shadow:0 10px 30px rgba(15,23,42,.08);cursor:pointer;font-family:inherit;text-align:left;}
        .pj-ai-title{font-size:15px;font-weight:900;color:#0f172a;}
        .pj-ai-sub{font-size:12px;color:#64748b;margin-top:2px;}
        .pj-ai-pill{background:#f59e0b;color:#111827;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:900;white-space:nowrap;}
        .pj-ai-panel{margin-top:12px;padding:16px;background:#fff;border:1px solid #fed7aa;border-radius:18px;box-shadow:0 12px 34px rgba(15,23,42,.08);}
        @media(max-width:900px){
          .pj-layout{grid-template-columns:1fr!important;}
          .pj-sidebar-desktop{display:none!important;}
          .pj-filter-fab{display:flex!important;}
        }
        @media(max-width:520px){.pj-cards{grid-template-columns:1fr!important;}}
        @media(min-width:1100px){.pj-cards{grid-template-columns:repeat(3,1fr)!important;}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#fff7ed 0%,#f8fafc 34%,#ffffff 100%)", fontFamily: "'DM Sans',sans-serif", color: "#0f172a" }}>

        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 58%,#f59e0b 120%)", padding: "30px 16px 44px", textAlign: "center" }}>
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 24, padding: "4px 14px", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>
              💡 Project Ideas Hub
            </div>
            <h1 id="projects-heading" style={{ margin: "0 0 10px", fontSize: "clamp(1.5rem,5vw,2.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
              Find Your Next <span style={{ color: "#60a5fa" }}>Project Idea</span>
            </h1>
            <p id="projects-description" style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              FYP, mini projects, semester projects — browse ideas by domain, difficulty and tech stack.
            </p>
            <div style={{ position: "relative", maxWidth: 500, margin: "0 auto 16px" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 17, pointerEvents: "none", filter: "none", color: "#fff", opacity: 1, zIndex: 1 }}>🔍</span>
              <input ref={searchRef} defaultValue={filters.search} onChange={e => handleSearch(e.target.value)}
                placeholder="Search ideas, field, subject, tools…"
                style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 999, fontSize: 14, background: "rgba(255,255,255,0.16)", color: "#fff", outline: "none" }}
              />
            </div>
            {/* Domain pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {DOMAINS.filter(d => d.value).map(d => (
                <button key={d.value} onClick={() => handleFilterChange("domain", filters.domain === d.value ? "" : d.value)}
                  style={{ padding: "5px 11px", borderRadius: 24, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid", background: filters.domain === d.value ? "#f59e0b" : "rgba(255,255,255,0.1)", color: filters.domain === d.value ? "#111827" : "#fff", borderColor: filters.domain === d.value ? "#f59e0b" : "rgba(255,255,255,0.2)", transition: "all 0.15s" }}>
                  {d.icon} {d.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="pj-ai-tab">
          <button className="pj-ai-trigger" onClick={() => setShowGenerator(v => !v)}>
            <div>
              <div className="pj-ai-title">AIDLA AI Project Recommendations</div>
              <div className="pj-ai-sub">Generate 3 custom project ideas from your domain, stack, team size, and duration.</div>
            </div>
            <span className="pj-ai-pill">{showGenerator ? "Hide" : "Generate Ideas"}</span>
          </button>
          {showGenerator && <div className="pj-ai-panel"><ProjectIdeaGenerator embedded /></div>}
        </section>

        {/* Body */}
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 14px 48px" }}>

          {!showGenerator && (
            <button className="pj-filter-fab"
              onClick={() => setShowFilter(true)}
              style={{ width: "100%", padding: "11px 0", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#0f172a", cursor: "pointer", marginBottom: 14, alignItems: "center", justifyContent: "center", gap: 8 }}>
              🔍 Filters {hasFilters && <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 12, padding: "1px 7px", fontSize: 11 }}>●</span>}
            </button>
          )}

          {/* Mobile drawer */}
          {showFilter && (
            <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowFilter(false)}>
              <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "min(88vw,310px)", background: "#f8fafc", padding: 14, overflowY: "auto", zIndex: 1000 }} onClick={e => e.stopPropagation()}>
                <FilterSidebar filters={filters} options={options} onChange={handleFilterChange} onReset={handleReset} total={total} isMobile onClose={() => setShowFilter(false)} />
              </div>
            </div>
          )}

          {!showGenerator && <div className="pj-layout">
            <div className="pj-sidebar-desktop" style={{ position: "sticky", top: 20 }}>
              <FilterSidebar filters={filters} options={options} onChange={handleFilterChange} onReset={handleReset} total={total} isMobile={false} />

              {/* AI Generator CTA */}
              <div style={{ marginTop: 16, background: "linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius: 16, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: 14, marginBottom: 6 }}>AI Idea Generator</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 14, lineHeight: 1.5 }}>Tell us your domain & stack — get 3 custom project ideas instantly</div>
                <Link href="/projects/generate" style={{ display: "block", padding: "10px 0", background: "#3b82f6", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  Generate Ideas →
                </Link>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: 12, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>💡</div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, marginBottom: 6 }}>Have an Idea?</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Share it with the community</div>
                <Link href="/user/projects" style={{ display: "block", padding: "9px 0", background: "#0f172a", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                  Submit Idea →
                </Link>
              </div>
            </div>

            <div>
              {/* Result count */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>
                  {loading ? "Loading…" : `${total.toLocaleString()} Idea${total !== 1 ? "s" : ""}`}
                </span>
                {hasFilters && (
                  <button onClick={handleReset} style={{ fontSize: 12, color: "#dc2626", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}>
                    ✕ Clear all
                  </button>
                )}
              </div>

              {/* Cards */}
              {loading ? (
                <div className="pj-cards">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : ideas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "52px 20px", border: "2px dashed #e2e8f0", borderRadius: 16, background: "#fff" }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>No ideas found</div>
                  <div style={{ color: "#64748b", marginBottom: 18, fontSize: 13 }}>Do not worry, AIDLA has your back.</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setShowGenerator(true)} style={{ padding: "10px 18px", background: "linear-gradient(135deg,#0f172a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Get AI Powered Project Recommendations</button>
                    <button onClick={handleReset} style={{ padding: "10px 18px", background: "#fff7ed", color: "#92400e", border: "1px solid #fed7aa", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Clear filters</button>
                  </div>
                </div>
              ) : (
                <div className="pj-cards">{ideas.map(m => <IdeaCard key={m.id} item={m} />)}</div>
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 28, flexWrap: "wrap" }}>
                  <button onClick={() => applyFilters(filters, Math.max(1, page - 1))} disabled={page === 1}
                    style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#0f172a", fontWeight: 600, fontSize: 13 }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => applyFilters(filters, p)}
                      style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, background: page === p ? "#0f172a" : "#fff", color: page === p ? "#fff" : "#0f172a", borderColor: page === p ? "#0f172a" : "#e2e8f0" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => applyFilters(filters, Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#0f172a", fontWeight: 600, fontSize: 13 }}>
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}
