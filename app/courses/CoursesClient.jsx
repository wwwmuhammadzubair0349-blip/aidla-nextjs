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
  "all-levels": { label: "All Levels",   color: "#1a3a8f", bg: "#EBF2FF" },
};

const FILTERS =[
  { key: "all",          label: "All Courses" },
  { key: "beginner",     label: "Beginner"     },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced",     label: "Advanced"     },
  { key: "all-levels",   label: "All Levels"   },
];

const COURSE_CATEGORIES =[
  { icon: "📐", name: "Mathematics",     desc: "Algebra, calculus, statistics and more — from Matric to university level." },
  { icon: "🔬", name: "Science",         desc: "Physics, Chemistry, Biology and Computer Science courses with practicals." },
  { icon: "📖", name: "English",         desc: "Grammar, essay writing, IELTS preparation and communication skills." },
  { icon: "💻", name: "Computer Science",desc: "Programming, web development, AI basics and digital literacy." },
  { icon: "📊", name: "Commerce",        desc: "Accounting, economics, business studies and finance fundamentals." },
  { icon: "🏛️", name: "CSS / PMS",      desc: "Comprehensive preparation courses for CSS, PMS, and other civil service exams." },
];

const FALLBACK_THUMB = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80";

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

.pc-stats{display:flex;align-items:center;justify-content:center;gap:24px;flex-wrap:wrap;margin-top:28px;}
.pc-stat{text-align:center;}
.pc-stat-val{font-family:'Playfair Display',serif;font-size:clamp(1.4rem,4vw,2rem);font-weight:700;color:#1a3a8f;line-height:1;}
.pc-stat-lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-top:3px;}
.pc-stat-div{width:1px;height:36px;background:rgba(59,130,246,.15);}

.pc-main{
  position:relative;z-index:1;
  max-width:1200px;margin:0 auto;width:100%;
  padding:0 clamp(16px,4vw,32px) clamp(48px,8vw,80px);flex:1;
}

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

.pc-section-h{
  font-family:'Playfair Display',serif;font-weight:700;
  font-size:clamp(1.1rem,3vw,1.4rem);color:#0b1437;margin-bottom:20px;
  display:flex;align-items:center;gap:10px;
}
.pc-section-count{font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:700;color:#94a3b8;}

.pc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}

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

.pc-cat-card{
  background:rgba(255,255,255,0.8);border:1px solid rgba(59,130,246,0.15);
  border-radius:16px;padding:24px;text-decoration:none;color:inherit;
  transition:all 0.2s;display:flex;flex-direction:column;gap:12px;
  backdrop-filter:blur(6px);
}
.pc-cat-card:hover{
  transform:translateY(-4px);box-shadow:0 12px 32px rgba(26,58,143,0.08);
  background:#fff;border-color:rgba(59,130,246,0.3);
}
.pc-cat-icon{font-size:28px;line-height:1;}
.pc-cat-title{font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700;color:#0b1437;}
.pc-cat-desc{font-size:0.85rem;color:#64748b;line-height:1.5;}

.pc-skeleton{
  background:linear-gradient(90deg,#e8edf5 25%,#dde3ee 50%,#e8edf5 75%);
  background-size:200% 100%;animation:pc-shimmer 1.4s infinite;
  border-radius:20px;height:320px;
}
@keyframes pc-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

.pc-empty{text-align:center;padding:80px 20px;grid-column:1/-1;}
.pc-empty-icon{font-size:52px;margin-bottom:16px;}
.pc-empty-h{font-family:'Playfair Display',serif;font-size:1.3rem;color:#0b1437;margin-bottom:8px;}
.pc-empty-p{color:#94a3b8;font-size:.88rem;}

@keyframes pc-fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.pc-fade{animation:pc-fadeUp .42s ease both;}

@media(max-width:480px){
  .pc-hero{padding:40px 16px 32px;}
  .pc-stats{gap:16px;}
  .pc-grid{grid-template-columns:1fr;gap:14px;}
  .pc-card-body{padding:14px 14px 16px;}
}
`;

function SkeletonCard() {
  return <div className="pc-skeleton" aria-hidden="true" />;
}

function CourseCard({ course, delay = 0 }) {
  // Defensive check: handle cases where 'level' or 'difficulty' is used in the DB
  const levelValue = course.level || course.difficulty || "beginner";
  const lm = LEVELS[levelValue] || LEVELS.beginner;
  const slug = toSlug(course.title);
  
  // Checking for 'is_free' boolean or price 0
  const isFree = course.is_free === true || !course.price || course.price === 0;

  return (
    <article className="pc-card pc-fade" style={{ animationDelay: `${delay}ms` }}>
      <div className="pc-card-thumb">
        <img
          src={course.thumbnail_url || FALLBACK_THUMB}
          alt={`${course.title} course thumbnail`}
          onError={e => { e.currentTarget.src = FALLBACK_THUMB; }}
          loading="lazy"
          width={600}
          height={338}
        />
        <span className="pc-card-level" style={{ background: lm.bg, color: lm.color }} aria-label={`Level: ${lm.label}`}>
          {lm.label}
        </span>
        <span className="pc-card-price" style={{ background: isFree ? "#059669" : "#0b1437" }}>
          {isFree ? "FREE" : `$${Number(course.price || 0).toFixed(0)}`}
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
          <span className="pc-card-info">
            {course.coin_reward > 0 ? `💰 Earn ${course.coin_reward} Coins` : ""}
          </span>
          <Link href={`/courses/${slug}`} className="pc-btn-view">Details →</Link>
          <Link href="/login" className="pc-btn-enroll">
            {isFree ? "Enroll Free" : "Enroll"}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function CoursesClient({ initialCourses =[], initialLevel = "all", initialSort = "newest", initialSearch = "" }) {
  const router = useRouter();

  const [courses, setCourses] = useState(initialCourses);
  const[loading, setLoading] = useState(initialCourses.length === 0); 
  const [filter, setFilter] = useState(initialLevel);
  const [sort, setSort] = useState(initialSort);
  const[search, setSearch] = useState(initialSearch);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    // select(*) to guarantee we don't crash Supabase with missing column names
    const { data } = await supabase
      .from("course_courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    
    setCourses(data ||[]);
    setLoading(false);
  },[]);

  // FIX: Added the fallback back! If the server data failed for ANY reason, this saves the page.
  useEffect(() => {
    if (initialCourses.length === 0) {
      fetchCourses();
    }
  }, [fetchCourses, initialCourses.length]);

  useEffect(() => {
    const channel = supabase
      .channel("public-courses-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "course_courses" }, fetchCourses)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },[fetchCourses]);

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

  const filtered = courses
    .filter(c => {
      // Defensive check for level / difficulty
      const cLevel = c.level || c.difficulty || "beginner";
      return filter === "all" || cLevel === filter;
    })
    .filter(c =>
      !search ||[c.title, c.description, c.category]
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
  const subjects =[...new Set(courses.map(c => c.category).filter(Boolean))].length;

  return (
    <>
      <style>{CSS}</style>

      <div className="pc-root">
        <div className="pc-orb1" aria-hidden="true" />
        <div className="pc-orb2" aria-hidden="true" />
        <div className="pc-orb3" aria-hidden="true" />

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

            <div className="pc-search-wrap" role="search" aria-label="Search courses">
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
              <div className="pc-stats pc-fade" aria-label="Course statistics">
                <div className="pc-stat">
                  <div className="pc-stat-val" aria-label={`${courses.length} courses`}>{courses.length}</div>
                  <div className="pc-stat-lbl">Courses</div>
                </div>
                <div className="pc-stat-div" aria-hidden="true" />
                <div className="pc-stat">
                  <div className="pc-stat-val">{courses.filter(c => c.is_free === true || !c.price || c.price === 0).length}</div>
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

        <main className="pc-main" id="main-content">
          <div className="pc-filters" role="toolbar" aria-label="Course filters">
            {FILTERS.map(f => {
              const newParams = new URLSearchParams();
              if (f.key !== "all") newParams.set("level", f.key);
              if (sort !== "newest") newParams.set("sort", sort);
              if (search) newParams.set("q", search);
              const href = `/courses${newParams.toString() ? `?${newParams.toString()}` : ""}`;

              return (
                <Link key={f.key} href={href} scroll={false} prefetch={false} style={{ textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); handleFilter(f.key); }}>
                  <div className={`pc-filter-pill${filter === f.key ? " active" : ""}`} aria-pressed={filter === f.key} aria-label={`Filter by ${f.label}`}>
                    {f.label}
                  </div>
                </Link>
              );
            })}

            <label htmlFor="sort-select" className="sr-only">Sort courses</label>
            <select id="sort-select" className="pc-sort" value={sort} onChange={e => handleSort(e.target.value)} aria-label="Sort courses" suppressHydrationWarning>
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
            <div className="pc-grid" aria-label="Loading courses">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {free.length > 0 && (
                <section aria-labelledby="free-courses-heading" style={{ marginBottom: 44 }}>
                  <h2 className="pc-section-h" id="free-courses-heading">
                    🎓 Free Courses
                    <span className="pc-section-count">{free.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list" aria-label="Free courses">
                    {free.map((c, i) => <div key={c.id} role="listitem"><CourseCard course={c} delay={i * 50} /></div>)}
                  </div>
                </section>
              )}

              {paid.length > 0 && (
                <section aria-labelledby="premium-courses-heading" style={{ marginBottom: 44 }}>
                  <h2 className="pc-section-h" id="premium-courses-heading">
                    💎 Premium Courses
                    <span className="pc-section-count">{paid.length} available</span>
                  </h2>
                  <div className="pc-grid" role="list" aria-label="Premium courses">
                    {paid.map((c, i) => <div key={c.id} role="listitem"><CourseCard course={c} delay={i * 50} /></div>)}
                  </div>
                </section>
              )}

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

          <section aria-labelledby="explore-subjects-heading" style={{ marginTop: 80, borderTop: "1px solid rgba(59,130,246,0.15)", paddingTop: 60, paddingBottom: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 className="pc-hero-h1" id="explore-subjects-heading" style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", marginBottom: 12 }}>
                Explore by <em>Subject</em>
              </h2>
              <p style={{ color: "#64748b", maxWidth: 600, margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.6 }}>
                Click below to instantly browse expert-led courses tailored for your curriculum. 
              </p>
            </div>
            
            <div className="pc-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
              {COURSE_CATEGORIES.map(c => (
                <Link 
                  key={c.name} 
                  href={`/courses?q=${encodeURIComponent(c.name)}`} 
                  className="pc-cat-card" 
                  scroll={true}
                  onClick={(e) => {
                    e.preventDefault();
                    if(searchRef.current) searchRef.current.value = c.name;
                    handleSearch(c.name);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <div className="pc-cat-icon" aria-hidden="true">{c.icon}</div>
                  <h3 className="pc-cat-title">{c.name}</h3>
                  <p className="pc-cat-desc">{c.desc}</p>
                </Link>
              ))}
            </div>
          </section>

        </main>
      </div>
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`}</style>
    </>
  );
}