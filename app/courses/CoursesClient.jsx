"use client";
// app/courses/CoursesClient.jsx
// Interactive course catalog — filters, search, sort, realtime updates
// All heavy interactivity isolated here so page.jsx stays server-rendered

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ─────────────────────────────────────────────
   Slug generator — MUST match detail page exactly
───────────────────────────────────────────── */
export function toSlug(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ─────────────────────────────────────────────
   Config
───────────────────────────────────────────── */
const LEVELS = {
  beginner:     { label: "Beginner",     color: "#059669", bg: "#ECFDF5" },
  intermediate: { label: "Intermediate", color: "#D97706", bg: "#FFFBEB" },
  advanced:     { label: "Advanced",     color: "#DC2626", bg: "#FEF2F2" },
  "all-levels": { label: "All Levels",   color: "#1a3a8f", bg: "#EBF2FF" },
};

const FILTERS = [
  { key: "all",          label: "All Courses" },
  { key: "beginner",     label: "Beginner"     },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced",     label: "Advanced"     },
  { key: "all-levels",   label: "All Levels"   },
];

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80";

/* ─────────────────────────────────────────────
   Styles (single <style> tag, no runtime cost)
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden;width:100%}

.pc-root{
  min-height:100vh;
  background:linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%);
  font-family:'DM Sans',sans-serif;
  color:#0b1437;
  display:flex;flex-direction:column;
  overflow-x:hidden;position:relative;
}
.pc-orb1,.pc-orb2,.pc-orb3{
  position:fixed;border-radius:50%;pointer-events:none;z-index:0;
}
.pc-orb1{width:700px;height:700px;background:radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 70%);top:-200px;left:-200px;}
.pc-orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(245,158,11,.06) 0%,transparent 70%);top:40%;right:-180px;}
.pc-orb3{width:400px;height:400px;background:radial-gradient(circle,rgba(16,185,129,.05) 0%,transparent 70%);bottom:10%;left:20%;}

/* Hero */
.pc-hero{
  position:relative;z-index:1;
  padding:clamp(48px,8vw,96px) clamp(16px,4vw,32px) clamp(40px,6vw,72px);
  text-align:center;overflow:hidden;
}
.pc-hero-inner{max-width:700px;margin:0 auto;}
.pc-hero-badge{
  display:inline-block;
  background:linear-gradient(135deg,#f59e0b,#fcd34d);
  color:#0b1437;padding:5px 16px;border-radius:30px;
  font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;
  margin-bottom:18px;box-shadow:0 4px 14px rgba(245,158,11,.28);
}
.pc-hero-h1{
  font-family:'Playfair Display',serif;
  font-size:clamp(2rem,6vw,3.6rem);font-weight:900;line-height:1.1;
  margin-bottom:16px;color:#0b1437;
}
.pc-hero-h1 em{font-style:italic;color:#1a3a8f;}
.pc-hero-sub{
  font-size:clamp(.9rem,2.5vw,1.05rem);color:#64748b;line-height:1.65;
  margin-bottom:32px;max-width:540px;margin-left:auto;margin-right:auto;
}

/* Search */
.pc-search-wrap{
  max-width:520px;margin:0 auto 12px;
  display:flex;align-items:center;gap:10px;
  background:rgba(255,255,255,.95);
  border:1.5px solid rgba(59,130,246,.15);
  border-radius:50px;padding:10px 18px;
  box-shadow:0 4px 24px rgba(26,58,143,.1);
  backdrop-filter:blur(8px);
}
.pc-search-icon{color:#94a3b8;font-size:16px;flex-shrink:0;}
.pc-search-wrap input{
  flex:1;border:none;outline:none;background:transparent;
  font-family:'DM Sans',sans-serif;font-size:.92rem;color:#0b1437;min-width:0;
}
.pc-search-wrap input::placeholder{color:#94a3b8;}
.pc-search-clear{
  background:none;border:none;color:#94a3b8;font-size:20px;
  cursor:pointer;line-height:1;padding:0;flex-shrink:0;
}

/* Stats */
.pc-stats{display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;margin-top:28px;}
.pc-stat{text-align:center;}
.pc-stat-val{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,4vw,2rem);font-weight:700;color:#1a3a8f;line-height:1;}
.pc-stat-lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-top:3px;}
.pc-stat-div{width:1px;height:36px;background:rgba(59,130,246,.15);}

/* Main */
.pc-main{
  position:relative;z-index:1;
  max-width:1200px;margin:0 auto;width:100%;
  padding:0 clamp(16px,4vw,32px) clamp(48px,8vw,80px);flex:1;
}

/* Filter bar */
.pc-filters{
  display:flex;gap:8px;align-items:center;
  overflow-x:auto;padding-bottom:4px;margin-bottom:32px;
  scrollbar-width:none;-ms-overflow-style:none;
}
.pc-filters::-webkit-scrollbar{display:none;}
.pc-filter-pill{
  padding:8px 18px;border-radius:100px;
  font-size:.8rem;font-weight:700;line-height:1;
  border:1.5px solid rgba(59,130,246,.15);
  background:rgba(255,255,255,.8);color:#475569;cursor:pointer;
  transition:all .15s;flex-shrink:0;white-space:nowrap;
  backdrop-filter:blur(6px);
}
.pc-filter-pill:hover{border-color:#3b82f6;color:#1a3a8f;background:rgba(235,242,255,.9);}
.pc-filter-pill.active{
  background:linear-gradient(135deg,#1a3a8f,#3b82f6);
  color:#fff;border-color:transparent;
  box-shadow:0 3px 12px rgba(26,58,143,.28);
}
.pc-sort{
  margin-left:auto;flex-shrink:0;
  padding:8px 14px;border-radius:10px;
  border:1.5px solid rgba(59,130,246,.15);
  font-family:'DM Sans',sans-serif;
  font-size:.78rem;font-weight:600;color:#475569;
  background:rgba(255,255,255,.8);cursor:pointer;outline:none;
}

/* Section heading */
.pc-section-h{
  font-family:'Playfair Display',serif;font-weight:700;
  font-size:clamp(1.1rem,3vw,1.4rem);color:#0b1437;margin-bottom:20px;
  display:flex;align-items:center;gap:10px;
}
.pc-section-count{font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:700;color:#94a3b8;}

/* Grid */
.pc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}

/* Card */
.pc-card{
  background:rgba(255,255,255,.95);border-radius:20px;
  border:1px solid rgba(59,130,246,.09);
  box-shadow:0 4px 20px rgba(11,20,55,.06);
  overflow:hidden;display:flex;flex-direction:column;
  transition:transform .22s ease,box-shadow .22s ease;
  text-decoration:none;color:inherit;
}
.pc-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(26,58,143,.13);}
.pc-card:focus-visible{outline:3px solid #3b82f6;outline-offset:2px;}

/* Thumbnail */
.pc-card-thumb{
  position:relative;height:0;padding-bottom:56.25%;
  background:linear-gradient(135deg,#EBF2FF,#dbeafe);
  overflow:hidden;flex-shrink:0;
}
.pc-card-thumb img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:transform .4s ease;
}
.pc-card:hover .pc-card-thumb img{transform:scale(1.04);}
.pc-card-level{
  position:absolute;top:10px;left:10px;
  padding:3px 10px;border-radius:100px;
  font-size:.65rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
  backdrop-filter:blur(6px);
}
.pc-card-price{
  position:absolute;top:10px;right:10px;
  padding:4px 11px;border-radius:100px;
  font-size:.72rem;font-weight:800;color:#fff;
  backdrop-filter:blur(6px);
}

/* Card body */
.pc-card-body{padding:18px 18px 20px;display:flex;flex-direction:column;flex:1;}
.pc-card-meta{
  font-size:.65rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.07em;color:#94a3b8;margin-bottom:7px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pc-card-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(.95rem,2.5vw,1.05rem);font-weight:700;
  color:#0b1437;line-height:1.35;margin-bottom:10px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.pc-card-desc{
  font-size:.82rem;color:#64748b;line-height:1.65;flex:1;margin-bottom:16px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}
.pc-card-footer{display:flex;gap:8px;align-items:center;margin-top:auto;}
.pc-card-info{flex:1;font-size:.72rem;color:#94a3b8;font-weight:600;}
.pc-btn-view{
  padding:9px 16px;border-radius:10px;font-size:.78rem;font-weight:700;
  border:1.5px solid rgba(26,58,143,.2);background:transparent;color:#1a3a8f;
  cursor:pointer;transition:all .15s;text-decoration:none;
  display:inline-flex;align-items:center;gap:5px;white-space:nowrap;
}
.pc-btn-view:hover{background:#EBF2FF;border-color:#1a3a8f;}
.pc-btn-enroll{
  padding:9px 16px;border-radius:10px;font-size:.78rem;font-weight:700;
  border:none;cursor:pointer;
  background:linear-gradient(135deg,#1a3a8f,#3b82f6);color:#fff;
  transition:all .15s;box-shadow:0 3px 10px rgba(26,58,143,.22);
  text-decoration:none;display:inline-flex;align-items:center;white-space:nowrap;
}
.pc-btn-enroll:hover{box-shadow:0 6px 18px rgba(26,58,143,.3);transform:translateY(-1px);}

/* Skeleton */
.pc-skeleton{
  background:linear-gradient(90deg,#e8edf5 25%,#dde3ee 50%,#e8edf5 75%);
  background-size:200% 100%;animation:pc-shimmer 1.4s infinite;
  border-radius:20px;height:320px;
}
@keyframes pc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Empty state */
.pc-empty{text-align:center;padding:80px 20px;grid-column:1/-1;}
.pc-empty-icon{font-size:52px;margin-bottom:16px;}
.pc-empty-h{font-family:'Playfair Display',serif;font-size:1.3rem;color:#0b1437;margin-bottom:8px;}
.pc-empty-p{color:#94a3b8;font-size:.88rem;}

/* Fade animation */
@keyframes pc-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.pc-fade{animation:pc-fadeUp .42s ease both;}

@media(max-width:480px){
  .pc-hero{padding:40px 16px 32px;}
  .pc-stats{gap:16px;}
  .pc-grid{grid-template-columns:1fr;gap:14px;}
  .pc-card-body{padding:14px 14px 16px;}
}
`;

/* ─────────────────────────────────────────────
   Skeleton Card
───────────────────────────────────────────── */
function SkeletonCard() {
  return <div className="pc-skeleton" aria-hidden="true" />;
}

/* ─────────────────────────────────────────────
   Course Card
   Uses <article> + Next Link for semantics + prefetch
───────────────────────────────────────────── */
function CourseCard({ course, delay = 0 }) {
  const lm   = LEVELS[course.level] || LEVELS.beginner;
  const slug = toSlug(course.title);
  const isFree = !course.price || course.price === 0;

  return (
    <article className="pc-card pc-fade" style={{ animationDelay: `${delay}ms` }}>
      {/* Thumbnail */}
      <div className="pc-card-thumb">
        <img
          src={course.thumbnail_url || FALLBACK_THUMB}
          alt={`${course.title} course thumbnail`}
          onError={e => { e.currentTarget.src = FALLBACK_THUMB; }}
          loading="lazy"
          width={600}
          height={338}
        />
        <span
          className="pc-card-level"
          style={{ background: lm.bg, color: lm.color }}
          aria-label={`Level: ${lm.label}`}
        >
          {lm.label}
        </span>
        <span
          className="pc-card-price"
          style={{ background: isFree ? "#059669" : "#0b1437" }}
          aria-label={isFree ? "Free course" : `Price: $${Number(course.price).toFixed(0)}`}
        >
          {isFree ? "FREE" : `$${Number(course.price).toFixed(0)}`}
        </span>
      </div>

      {/* Body */}
      <div className="pc-card-body">
        <p className="pc-card-meta">
          {course.category || "General"}
          {course.duration_estimate ? ` · ${course.duration_estimate}` : ""}
        </p>
        <h3 className="pc-card-title">{course.title}</h3>
        <p className="pc-card-desc">
          {course.description || "Explore this course to discover what you'll learn."}
        </p>

        <div className="pc-card-footer">
          <span className="pc-card-info" aria-label="Certificate available">
            {course.certificate_price > 0 ? "🏆 Certificate available" : ""}
          </span>
          <Link
            href={`/courses/${slug}`}
            className="pc-btn-view"
            aria-label={`View details for ${course.title}`}
          >
            Details →
          </Link>
          <Link
            href="/signup"
            className="pc-btn-enroll"
            aria-label={isFree ? `Enroll free in ${course.title}` : `Enroll in ${course.title}`}
          >
            {isFree ? "Enroll Free" : "Enroll"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   Main Client Component
───────────────────────────────────────────── */
export default function CoursesClient({ initialCourses = [] }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [courses,  setCourses]  = useState(initialCourses);
  const [loading,  setLoading]  = useState(initialCourses.length === 0);
  const [filter,   setFilter]   = useState(searchParams.get("level") || "all");
  const [sort,     setSort]     = useState(searchParams.get("sort")  || "newest");
  const [search,   setSearch]   = useState(searchParams.get("q")     || "");

  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  /* Fetch courses — skip if server already provided data */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("course_courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialCourses.length === 0) fetchCourses();
  }, [fetchCourses, initialCourses.length]);

  /* Realtime: new course published → auto-appears */
  useEffect(() => {
    const channel = supabase
      .channel("public-courses-realtime")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "course_courses",
      }, fetchCourses)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchCourses]);

  /* Sync URL params */
  const updateParams = useCallback((newFilter, newSort, newSearch) => {
    const params = new URLSearchParams();
    if (newFilter !== "all") params.set("level", newFilter);
    if (newSort !== "newest") params.set("sort", newSort);
    if (newSearch) params.set("q", newSearch);
    const qs = params.toString();
    router.replace(`/courses${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  const handleFilter = (key) => {
    setFilter(key);
    updateParams(key, sort, search);
  };

  const handleSort = (val) => {
    setSort(val);
    updateParams(filter, val, search);
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams(filter, sort, val), 350);
  };

  const handleClear = () => {
    setSearch("");
    if (searchRef.current) searchRef.current.value = "";
    updateParams(filter, sort, "");
  };

  /* Filter + sort */
  const filtered = courses
    .filter(c => filter === "all" || c.level === filter)
    .filter(c =>
      !search ||
      [c.title, c.description, c.category]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "newest")     return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "price-asc")  return (a.price || 0) - (b.price || 0);
      if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sort === "az")         return a.title.localeCompare(b.title);
      return 0;
    });

  const free = filtered.filter(c => !c.price || c.price === 0);
  const paid = filtered.filter(c => c.price > 0);

  const subjects = [...new Set(courses.map(c => c.category).filter(Boolean))].length;

  return (
    <>
      <style>{CSS}</style>

      <div className="pc-root">
        {/* Decorative orbs — aria-hidden */}
        <div className="pc-orb1" aria-hidden="true" />
        <div className="pc-orb2" aria-hidden="true" />
        <div className="pc-orb3" aria-hidden="true" />

        {/* ── Hero ── */}
        <header className="pc-hero">
          <div className="pc-hero-inner">
            <p className="pc-hero-badge" aria-label="Online Learning Platform">
              📚 Online Learning Platform
            </p>
            <h1 className="pc-hero-h1">
              Learn Something<br />
              <em>Extraordinary</em> Today.
            </h1>
            <p className="pc-hero-sub">
              Expert-led courses across Mathematics, Science, English, Computer Science and more.
              Earn real coins as you learn. Get verified certificates. 100% free to join.
            </p>

            {/* Search */}
            <div
              className="pc-search-wrap"
              role="search"
              aria-label="Search courses"
            >
              <span className="pc-search-icon" aria-hidden="true">🔍</span>
              <input
                ref={searchRef}
                type="search"
                placeholder="Search courses, topics, skills…"
                defaultValue={search}
                onChange={e => handleSearch(e.target.value)}
                aria-label="Search courses"
                autoComplete="off"
              />
              {search && (
                <button
                  className="pc-search-clear"
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Stats — only when data loaded */}
            {!loading && courses.length > 0 && (
              <div className="pc-stats pc-fade" aria-label="Course statistics">
                <div className="pc-stat">
                  <div className="pc-stat-val" aria-label={`${courses.length} courses`}>{courses.length}</div>
                  <div className="pc-stat-lbl">Courses</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">{courses.filter(c => !c.price || c.price === 0).length}</div>
                  <div className="pc-stat-lbl">Free</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">{subjects || "10+"}</div>
                  <div className="pc-stat-lbl">Subjects</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val" aria-hidden="true">🏆</div>
                  <div className="pc-stat-lbl">Certificates</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Main ── */}
        <main className="pc-main" id="main-content">

          {/* Filter + Sort bar */}
          <div
            className="pc-filters"
            role="toolbar"
            aria-label="Course filters"
          >
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`pc-filter-pill${filter === f.key ? " active" : ""}`}
                onClick={() => handleFilter(f.key)}
                aria-pressed={filter === f.key}
                aria-label={`Filter by ${f.label}`}
              >
                {f.label}
              </button>
            ))}
            <label htmlFor="sort-select" className="sr-only">Sort courses</label>
            <select
              id="sort-select"
              className="pc-sort"
              value={sort}
              onChange={e => handleSort(e.target.value)}
              aria-label="Sort courses"
            >
              <option value="newest">Newest First</option>
              <option value="az">A → Z</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Results status for screen readers */}
          <p className="sr-only" role="status" aria-live="polite">
            {loading
              ? "Loading courses…"
              : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {/* Loading skeletons */}
          {loading ? (
            <div className="pc-grid" aria-label="Loading courses">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Free courses */}
              {free.length > 0 && (
                <section aria-labelledby="free-courses-heading" style={{ marginBottom: 44 }}>
                  <h2 className="pc-section-h" id="free-courses-heading">
                    🎓 Free Courses
                    <span className="pc-section-count">{free.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list" aria-label="Free courses">
                    {free.map((c, i) => (
                      <div key={c.id} role="listitem">
                        <CourseCard course={c} delay={i * 50} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Paid courses */}
              {paid.length > 0 && (
                <section aria-labelledby="premium-courses-heading" style={{ marginBottom: 44 }}>
                  <h2 className="pc-section-h" id="premium-courses-heading">
                    💎 Premium Courses
                    <span className="pc-section-count">{paid.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list" aria-label="Premium courses">
                    {paid.map((c, i) => (
                      <div key={c.id} role="listitem">
                        <CourseCard course={c} delay={i * 50} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="pc-grid">
                  <div className="pc-empty" role="alert">
                    <p className="pc-empty-icon" aria-hidden="true">🔍</p>
                    <h3 className="pc-empty-h">No courses found</h3>
                    <p className="pc-empty-p">Try a different keyword or filter</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* sr-only utility */}
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
    </>
  );
}