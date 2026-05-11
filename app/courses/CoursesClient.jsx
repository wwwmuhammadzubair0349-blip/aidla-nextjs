"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function toSlug(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const LEVELS = {
  beginner:     { label: "Beginner",     color: "#059669", bg: "#ECFDF5" },
  intermediate: { label: "Intermediate", color: "#D97706", bg: "#FFFBEB" },
  advanced:     { label: "Advanced",     color: "#DC2626", bg: "#FEF2F2" },
  "all-levels": { label: "All Levels",   color: "#0f172a", bg: "#fde68a" },
};

const FILTERS = [
  { key: "all",          label: "✦ All Courses" },
  { key: "beginner",     label: "Beginner"      },
  { key: "intermediate", label: "Intermediate"  },
  { key: "advanced",     label: "Advanced"      },
  { key: "all-levels",   label: "All Levels"    },
];

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden;width:100%}

.pc-root{
  min-height:100vh;
  background:#fffbeb;
  font-family:'DM Sans',system-ui,sans-serif;
  color:#0f172a;
  display:flex;flex-direction:column;
  overflow-x:hidden;position:relative;
  -webkit-font-smoothing:antialiased;
}
.pc-root::before{
  content:'';position:fixed;inset:0;
  background-image:
    linear-gradient(rgba(245,158,11,0.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(245,158,11,0.045) 1px,transparent 1px);
  background-size:40px 40px;pointer-events:none;z-index:0;
}

/* ── HERO ── */
.pc-hero{
  position:relative;z-index:1;
  background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 55%,#fde68a 100%);
  border-bottom:1px solid #f0c96a;
  padding:clamp(28px,4vw,48px) clamp(20px,5vw,48px);
  text-align:center;overflow:hidden;
}
.pc-hero::after{
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(circle,rgba(15,23,42,0.035) 1px,transparent 1px);
  background-size:22px 22px;pointer-events:none;
}
.pc-hero-inner{max-width:700px;margin:0 auto;position:relative;z-index:1;}
.pc-hero-badge{
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(15,23,42,0.08);border:1px solid rgba(15,23,42,0.14);
  color:#0f172a;padding:6px 16px;border-radius:999px;
  font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  margin-bottom:18px;
}
.pc-hero-h1{
  font-family:'Playfair Display',Georgia,serif;
  font-size:clamp(1.7rem,4.5vw,2.9rem);font-weight:900;line-height:1.08;
  letter-spacing:-.03em;margin-bottom:10px;color:#0f172a;
}
.pc-hero-h1 em{font-style:italic;color:#d97706;}
.pc-hero-sub{
  font-size:clamp(.88rem,2vw,1rem);color:rgba(15,23,42,0.68);line-height:1.65;
  margin:0 auto 20px;max-width:540px;
}

/* search */
.pc-search-wrap{
  max-width:520px;margin:0 auto 20px;
  display:flex;align-items:center;gap:10px;
  background:#fff;
  border:1.5px solid rgba(217,119,6,0.25);
  border-radius:999px;padding:11px 20px;
  box-shadow:0 4px 20px rgba(245,158,11,0.12);
  transition:border-color .2s,box-shadow .2s;
}
.pc-search-wrap:focus-within{
  border-color:#f59e0b;
  box-shadow:0 0 0 3px rgba(245,158,11,0.15),0 4px 20px rgba(245,158,11,0.12);
}
.pc-search-icon{color:#d97706;font-size:15px;flex-shrink:0;}
.pc-search-wrap input{
  flex:1;border:none;outline:none;background:transparent;
  font-family:'DM Sans',sans-serif;font-size:.93rem;color:#0f172a;min-width:0;
}
.pc-search-wrap input::placeholder{color:#94a3b8;}
.pc-search-clear{
  background:rgba(15,23,42,0.07);border:none;color:#475569;
  font-size:18px;cursor:pointer;line-height:1;padding:0;
  width:22px;height:22px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:background .15s;
}
.pc-search-clear:hover{background:rgba(15,23,42,0.14);}

/* stats */
.pc-stats{
  display:inline-flex;align-items:center;
  background:rgba(15,23,42,0.06);border:1px solid rgba(15,23,42,0.1);
  border-radius:999px;padding:10px 24px;flex-wrap:wrap;justify-content:center;
}
.pc-stat{text-align:center;padding:0 16px;}
.pc-stat-val{
  font-family:'Playfair Display',serif;
  font-size:clamp(1.1rem,3vw,1.5rem);font-weight:800;color:#d97706;line-height:1;
}
.pc-stat-lbl{font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-top:3px;}
.pc-stat-div{width:1px;height:28px;background:rgba(15,23,42,0.12);}

/* ── MAIN ── */
.pc-main{
  position:relative;z-index:1;
  max-width:1200px;margin:0 auto;width:100%;
  padding:clamp(24px,4vw,40px) clamp(16px,4vw,32px) clamp(64px,8vw,96px);
  flex:1;
}

/* filters */
.pc-filters-row{
  display:flex;align-items:center;gap:8px;
  overflow-x:auto;padding-bottom:4px;margin-bottom:32px;
  scrollbar-width:none;-ms-overflow-style:none;flex-wrap:nowrap;
}
.pc-filters-row::-webkit-scrollbar{display:none;}
.pc-filter-pill{
  padding:8px 18px;border-radius:999px;
  font-size:.78rem;font-weight:700;line-height:1;
  border:1.5px solid rgba(217,119,6,0.2);
  background:#fff;color:#475569;cursor:pointer;
  transition:all .15s;flex-shrink:0;white-space:nowrap;
}
.pc-filter-pill:hover{border-color:#d97706;color:#d97706;background:#fffbeb;}
.pc-filter-pill.active{
  background:#f59e0b;color:#0f172a;border-color:#f59e0b;
  box-shadow:0 3px 12px rgba(245,158,11,0.32);font-weight:800;
}
.pc-sort{
  margin-left:auto;flex-shrink:0;
  padding:8px 14px;border-radius:12px;
  border:1.5px solid rgba(217,119,6,0.2);
  font-family:'DM Sans',sans-serif;
  font-size:.78rem;font-weight:600;color:#475569;
  background:#fff;cursor:pointer;outline:none;transition:border-color .15s;
}
.pc-sort:focus{border-color:#f59e0b;}

/* section headings */
.pc-section-h{
  font-family:'Playfair Display',serif;font-weight:800;
  font-size:clamp(1.1rem,2.5vw,1.35rem);color:#0f172a;
  margin-bottom:16px;display:flex;align-items:center;gap:10px;
  padding-bottom:12px;border-bottom:2px solid rgba(245,158,11,0.2);
}
.pc-section-count{
  font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:700;
  color:#d97706;background:rgba(245,158,11,0.12);
  padding:3px 10px;border-radius:999px;
}

/* grid */
.pc-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));
  gap:16px;
}

/* ── CARD ── */
.pc-card{
  background:#fff;border-radius:20px;
  border:1px solid rgba(245,158,11,0.15);
  box-shadow:0 2px 16px rgba(245,158,11,0.07),0 1px 4px rgba(15,23,42,0.04);
  overflow:hidden;display:flex;flex-direction:column;
  transition:transform .22s ease,box-shadow .22s ease,border-color .22s;
  text-decoration:none;color:inherit;
}
.pc-card:hover{
  transform:translateY(-5px);
  box-shadow:0 16px 48px rgba(245,158,11,0.18),0 4px 12px rgba(15,23,42,0.06);
  border-color:rgba(245,158,11,0.35);
}
.pc-card:focus-visible{outline:3px solid #f59e0b;outline-offset:2px;}

/* thumbnail */
.pc-card-thumb{
  position:relative;height:0;padding-bottom:52%;
  background:linear-gradient(135deg,#fde68a,#f59e0b);
  overflow:hidden;flex-shrink:0;
}
.pc-card-thumb img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:transform .4s ease;
}
.pc-card:hover .pc-card-thumb img{transform:scale(1.04);}
.pc-card-level{
  position:absolute;top:10px;left:10px;
  padding:3px 10px;border-radius:999px;
  font-size:.62rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
  backdrop-filter:blur(8px);
}
.pc-card-price{
  position:absolute;top:10px;right:10px;
  padding:4px 11px;border-radius:999px;
  font-size:.7rem;font-weight:800;color:#fff;backdrop-filter:blur(8px);
}

/* card body */
.pc-card-body{padding:16px 16px 18px;display:flex;flex-direction:column;flex:1;}
.pc-card-meta{
  font-size:.62rem;font-weight:700;text-transform:uppercase;
  letter-spacing:.07em;color:#d97706;margin-bottom:7px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.pc-card-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(.95rem,2.5vw,1.05rem);font-weight:800;
  color:#0f172a;line-height:1.3;margin-bottom:8px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.pc-card-desc{
  font-size:.82rem;color:#64748b;line-height:1.65;flex:1;margin-bottom:14px;
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}
.pc-card-footer{display:flex;gap:8px;align-items:center;margin-top:auto;flex-wrap:wrap;}
.pc-card-coins{
  flex:1;font-size:.7rem;color:#d97706;font-weight:700;
  display:flex;align-items:center;gap:4px;white-space:nowrap;
}
.pc-btn-view{
  padding:8px 14px;border-radius:10px;font-size:.75rem;font-weight:700;
  border:1.5px solid rgba(217,119,6,0.3);background:transparent;color:#d97706;
  cursor:pointer;transition:all .15s;text-decoration:none;
  display:inline-flex;align-items:center;gap:4px;white-space:nowrap;
}
.pc-btn-view:hover{background:rgba(245,158,11,0.08);border-color:#d97706;}
.pc-btn-enroll{
  padding:8px 16px;border-radius:10px;font-size:.75rem;font-weight:800;
  border:none;cursor:pointer;
  background:#0f172a;color:#f59e0b;
  transition:all .15s;box-shadow:0 3px 10px rgba(15,23,42,0.18);
  text-decoration:none;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;
}
.pc-btn-enroll:hover{background:#1e293b;box-shadow:0 6px 18px rgba(15,23,42,0.25);transform:translateY(-1px);}

/* skeleton */
.pc-skeleton{
  background:linear-gradient(90deg,#fef3c7 25%,#fde68a 50%,#fef3c7 75%);
  background-size:200% 100%;animation:pc-shimmer 1.4s ease-in-out infinite;
  border-radius:20px;height:320px;
}
@keyframes pc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* empty */
.pc-empty{text-align:center;padding:72px 20px;grid-column:1/-1;}
.pc-empty-icon{font-size:48px;margin-bottom:16px;}
.pc-empty-h{font-family:'Playfair Display',serif;font-size:1.3rem;color:#0f172a;margin-bottom:8px;}
.pc-empty-p{color:#94a3b8;font-size:.88rem;margin-bottom:24px;}
.pc-empty-btn{
  padding:11px 28px;border:none;border-radius:999px;
  background:#f59e0b;color:#0f172a;
  font-size:.88rem;font-weight:800;cursor:pointer;
  box-shadow:0 4px 14px rgba(245,158,11,0.28);
  transition:box-shadow .2s,transform .2s;font-family:'DM Sans',sans-serif;
}
.pc-empty-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(245,158,11,0.35);}

.pc-result-count{font-size:.78rem;color:#94a3b8;font-weight:600;margin-bottom:20px;}

@keyframes pc-fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.pc-fade{animation:pc-fadeUp .38s ease both;}

@media(max-width:480px){
  .pc-hero{padding:44px 16px 36px;}
  .pc-stats{padding:8px 12px;}
  .pc-stat{padding:0 10px;}
  .pc-grid{grid-template-columns:1fr;gap:12px;}
  .pc-filter-pill{padding:7px 14px;font-size:.74rem;}
}
@media(min-width:640px){.pc-grid{gap:18px;}}
@media(min-width:1024px){.pc-grid{gap:20px;}}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

function SkeletonCard() {
  return <div className="pc-skeleton" aria-hidden="true" />;
}

function CourseCard({ course, delay = 0 }) {
  const levelValue = course.level || course.difficulty || "beginner";
  const lm = LEVELS[levelValue] || LEVELS.beginner;
  const slug = toSlug(course.title);
  const isFree = course.is_free === true || !course.price || course.price === 0;

  return (
    <article className="pc-card pc-fade" style={{ animationDelay: `${delay}ms` }}>
      <div className="pc-card-thumb">
        <img
          src={course.thumbnail_url || FALLBACK_THUMB}
          alt=""
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_THUMB; }}
          width={600}
          height={312}
        />
        <span className="pc-card-level" style={{ background: lm.bg, color: lm.color }}>
          {lm.label}
        </span>
        <span className="pc-card-price" style={{ background: isFree ? "#059669" : "#0f172a" }}>
          {isFree ? "FREE" : `PKR ${Number(course.price || 0).toLocaleString()}`}
        </span>
      </div>

      <div className="pc-card-body">
        <p className="pc-card-meta">
          {course.category || "General"}
          {course.lesson_count ? ` · ${course.lesson_count} Lessons` : ""}
        </p>
        <h3 className="pc-card-title">{course.title}</h3>
        <p className="pc-card-desc">
          {course.description || "Explore this course to discover what you'll learn."}
        </p>
        <div className="pc-card-footer">
          {course.coin_reward > 0
            ? <span className="pc-card-coins">🪙 {course.coin_reward} Coins</span>
            : <span style={{ flex: 1 }} />
          }
          <Link href={`/courses/${slug}`} className="pc-btn-view">Details →</Link>
          <Link href="/login" className="pc-btn-enroll">
            {isFree ? "Enroll Free" : "Enroll"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CoursesClient({ initialCourses = [], initialLevel = "all", initialSort = "newest", initialSearch = "" }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [loading, setLoading] = useState(initialCourses.length === 0);
  const [filter, setFilter] = useState(initialLevel);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState(initialSearch);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

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

  useEffect(() => {
    const channel = supabase
      .channel("public-courses-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "course_courses" }, fetchCourses)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchCourses]);

  const updateParams = useCallback((newFilter, newSort, newSearch) => {
    const params = new URLSearchParams();
    if (newFilter !== "all") params.set("level", newFilter);
    if (newSort !== "newest") params.set("sort", newSort);
    if (newSearch) params.set("q", newSearch);
    const qs = params.toString();
    router.replace(`/courses${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  const handleFilter = (key) => { setFilter(key); updateParams(key, sort, search); };
  const handleSort = (val) => { setSort(val); updateParams(filter, val, search); };
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

  const filtered = courses
    .filter(c => {
      const cLevel = c.level || c.difficulty || "beginner";
      return filter === "all" || cLevel === filter;
    })
    .filter(c =>
      !search || [c.title, c.description, c.category]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "newest")     return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "price-asc")  return (a.price || 0) - (b.price || 0);
      if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sort === "az")         return a.title.localeCompare(b.title);
      return 0;
    });

  const free = filtered.filter(c => c.is_free === true || !c.price || c.price === 0);
  const paid = filtered.filter(c => c.price > 0 && c.is_free !== true);
  const subjects = [...new Set(courses.map(c => c.category).filter(Boolean))].length;
  const freeCount = courses.filter(c => c.is_free === true || !c.price || c.price === 0).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="pc-root">

        <header className="pc-hero">
          <div className="pc-hero-inner">
            <span className="pc-hero-badge">📚 Online Learning Platform</span>
            <h1 className="pc-hero-h1">
              Learn Something<br /><em>Extraordinary</em> Today.
            </h1>
            <p className="pc-hero-sub">
              Expert-led courses across Mathematics, Science, English, Computer Science and more.
              Earn real coins as you learn. Get verified certificates. 100% free to join.
            </p>

            <div className="pc-search-wrap" role="search">
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
                <button className="pc-search-clear" onClick={handleClear} aria-label="Clear search">×</button>
              )}
            </div>

            {!loading && courses.length > 0 && (
              <div className="pc-stats pc-fade">
                <div className="pc-stat">
                  <div className="pc-stat-val">{courses.length}</div>
                  <div className="pc-stat-lbl">Courses</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">{freeCount}</div>
                  <div className="pc-stat-lbl">Free</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">{subjects || "10+"}</div>
                  <div className="pc-stat-lbl">Subjects</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">🏆</div>
                  <div className="pc-stat-lbl">Certificates</div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="pc-main" id="main-content">
          <div className="pc-filters-row" role="toolbar" aria-label="Course filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`pc-filter-pill${filter === f.key ? " active" : ""}`}
                onClick={() => handleFilter(f.key)}
                aria-pressed={filter === f.key}
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
              suppressHydrationWarning
            >
              <option value="newest">Newest First</option>
              <option value="az">A → Z</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {loading ? "Loading courses…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {loading ? (
            <div className="pc-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {filtered.length > 0 && (
                <p className="pc-result-count">
                  {search
                    ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                    : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} available`}
                </p>
              )}

              {free.length > 0 && (
                <section aria-labelledby="free-courses-heading" style={{ marginBottom: 48 }}>
                  <h2 className="pc-section-h" id="free-courses-heading">
                    🎓 Free Courses
                    <span className="pc-section-count">{free.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list">
                    {free.map((c, i) => (
                      <div key={c.id} role="listitem">
                        <CourseCard key={c.id} course={c} delay={i * 50} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {paid.length > 0 && (
                <section aria-labelledby="premium-courses-heading" style={{ marginBottom: 48 }}>
                  <h2 className="pc-section-h" id="premium-courses-heading">
                    💎 Premium Courses
                    <span className="pc-section-count">{paid.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list">
                    {paid.map((c, i) => (
                      <div key={c.id} role="listitem">
                        <CourseCard key={c.id} course={c} delay={i * 50} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filtered.length === 0 && (
                <div className="pc-grid">
                  <div className="pc-empty" role="alert">
                    <p className="pc-empty-icon" aria-hidden="true">🔍</p>
                    <h3 className="pc-empty-h">No courses found</h3>
                    <p className="pc-empty-p">Try a different keyword or filter.</p>
                    <button className="pc-empty-btn" onClick={() => { setSearch(""); setFilter("all"); handleClear(); }}>
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
