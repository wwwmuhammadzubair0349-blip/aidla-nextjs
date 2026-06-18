"use client";
// app/user/learn/page.jsx — Learning Hub

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CSS = `
.lh-wrap { font-family: 'DM Sans', system-ui, sans-serif; min-height: 40vh; }
.lh-tabs {
  display: flex; gap: 0;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 20px; overflow-x: auto; scrollbar-width: none;
}
.lh-tabs::-webkit-scrollbar { display: none; }
.lh-tab {
  padding: 11px 18px; border: none; background: none;
  font-size: 0.86rem; font-weight: 700; color: #64748b;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -2px; white-space: nowrap;
  font-family: inherit; display: flex; align-items: center; gap: 6px;
  transition: color 0.15s;
}
.lh-tab:hover { color: #0f172a; }
.lh-tab.active { color: #1a3a8f; border-bottom-color: #1a3a8f; }

.lh-ai-banner {
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(135deg, rgba(26,58,143,0.05), rgba(59,130,246,0.05));
  border: 1px solid rgba(26,58,143,0.1); border-radius: 14px;
  padding: 12px 16px; margin-bottom: 20px; cursor: pointer;
  text-decoration: none; transition: background 0.15s;
}
.lh-ai-banner:hover { background: linear-gradient(135deg, rgba(26,58,143,0.09), rgba(59,130,246,0.09)); }
.lh-ai-title { font-size: 0.85rem; font-weight: 800; color: #0f172a; }
.lh-ai-sub { font-size: 0.74rem; color: #64748b; }

.lh-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media(min-width:480px) { .lh-grid { grid-template-columns: 1fr 1fr; } }
@media(min-width:900px) { .lh-grid { grid-template-columns: 1fr 1fr 1fr; } }

.lh-card {
  border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
  background: #fff; cursor: pointer; text-decoration: none; display: block;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.lh-card:hover { box-shadow: 0 8px 28px rgba(15,23,42,0.10); border-color: #cbd5e1; }
.lh-card-thumb {
  width: 100%; padding-bottom: 52%; background: #f1f5f9; position: relative; overflow: hidden;
}
.lh-card-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.lh-card-thumb-placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
.lh-card-body { padding: 12px 14px 14px; }
.lh-card-cat { font-size: 0.68rem; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.lh-card-title { font-size: 0.88rem; font-weight: 800; color: #0f172a; line-height: 1.35; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lh-card-meta { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
.lh-prog-wrap { margin: 8px 0 4px; }
.lh-prog-row { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
.lh-prog-bar { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.lh-prog-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #1a3a8f, #3b82f6); transition: width 0.4s ease; }
.lh-prog-fill.done { background: linear-gradient(90deg, #059669, #10b981); }

.lh-empty { text-align: center; padding: 48px 20px; }
.lh-empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.lh-empty-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.lh-empty-sub { font-size: 0.84rem; color: #64748b; margin-bottom: 20px; }
.lh-empty-btn {
  display: inline-block; padding: 10px 22px;
  background: linear-gradient(135deg, #1a3a8f, #3b82f6);
  color: #fff; border-radius: 30px; font-weight: 800; font-size: 0.84rem; text-decoration: none;
}

.lh-shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation:lh-shim 1.4s infinite; border-radius:10px; }
@keyframes lh-shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.lh-skel-card { border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; background:#fff; }
.lh-skel-thumb { width:100%; padding-bottom:52%; }
.lh-skel-body { padding:12px 14px 14px; display:flex; flex-direction:column; gap:8px; }
.lh-skel-line { height:10px; border-radius:6px; }

.lh-res-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media(min-width:500px) { .lh-res-grid { grid-template-columns: 1fr 1fr; } }
@media(min-width:800px) { .lh-res-grid { grid-template-columns: 1fr 1fr 1fr; } }
.lh-res-card {
  border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;
  background: #fff; text-decoration: none; display: block; transition: box-shadow 0.2s;
}
.lh-res-card:hover { box-shadow: 0 6px 20px rgba(15,23,42,0.08); }
.lh-res-icon { font-size: 1.5rem; margin-bottom: 8px; }
.lh-res-title { font-size: 0.85rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lh-res-meta { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
.lh-res-type { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 800; background: #f0f4ff; color: #1a3a8f; margin-bottom: 6px; }
`;

const SKELETON = Array(6).fill(0).map((_, i) => (
  <div key={i} className="lh-skel-card">
    <div className="lh-skel-thumb lh-shimmer" />
    <div className="lh-skel-body">
      <div className="lh-skel-line lh-shimmer" style={{ width: "40%" }} />
      <div className="lh-skel-line lh-shimmer" style={{ width: "85%" }} />
      <div className="lh-skel-line lh-shimmer" style={{ width: "60%" }} />
    </div>
  </div>
));

export default function LearnPage() {
  const router = useRouter();
  const [tab,        setTab]        = useState("enrolled");
  const [enrolled,   setEnrolled]   = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [userId,     setUserId]     = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      const [{ data: enr }, { data: courses }, { data: res }] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select("course_id, progress_percent, course_courses(id,title,thumbnail_url,category,level)")
          .eq("user_id", session.user.id)
          .order("enrolled_at", { ascending: false }),
        supabase
          .from("course_courses")
          .select("id,title,thumbnail_url,category,level,instructor_name,lessons_count")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("resources")
          .select("id,title,description,file_type,category,thumbnail_url,download_count")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      setEnrolled(enr || []);
      setAllCourses(courses || []);
      setResources(res || []);
      setLoading(false);
    })();
  }, []);

  const enrolledIds = new Set((enrolled || []).map(e => e.course_id));

  const ResourceIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("pdf"))   return "📄";
    if (t.includes("video")) return "🎬";
    if (t.includes("link"))  return "🔗";
    if (t.includes("image")) return "🖼️";
    return "📁";
  };

  return (
    <div className="lh-wrap">
      <style>{CSS}</style>

      {/* AI Tutor banner */}
      <div className="lh-ai-banner" onClick={() => router.push("/user/learning")} role="button" tabIndex={0}>
        <span style={{ fontSize: "1.6rem" }}>🤖</span>
        <div>
          <div className="lh-ai-title">AI Learning Assistant</div>
          <div className="lh-ai-sub">Get personalized career & study guidance</div>
        </div>
        <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "1.1rem" }}>→</span>
      </div>

      {/* Tabs */}
      <div className="lh-tabs" role="tablist">
        {[
          { id: "enrolled",  label: "My Courses",  icon: "📚" },
          { id: "discover",  label: "Discover",    icon: "🔭" },
          { id: "resources", label: "Resources",   icon: "📁" },
        ].map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id}
            className={`lh-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}>
            <span aria-hidden="true">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* My Courses */}
      {tab === "enrolled" && (
        loading ? <div className="lh-grid">{SKELETON}</div>
        : enrolled.length === 0 ? (
          <div className="lh-empty">
            <span className="lh-empty-icon">📚</span>
            <div className="lh-empty-title">No courses yet</div>
            <div className="lh-empty-sub">Discover courses and start your learning journey.</div>
            <a href="#" className="lh-empty-btn" onClick={e => { e.preventDefault(); setTab("discover"); }}>Browse Courses →</a>
          </div>
        ) : (
          <div className="lh-grid">
            {enrolled.map(e => {
              const c = e.course_courses;
              if (!c) return null;
              const pct = e.progress_percent || 0;
              return (
                <Link key={e.course_id} href={`/user/course/${c.id}`} className="lh-card">
                  <div className="lh-card-thumb">
                    {c.thumbnail_url
                      ? <img src={c.thumbnail_url} alt={c.title} loading="lazy" />
                      : <div className="lh-card-thumb-placeholder">📚</div>}
                  </div>
                  <div className="lh-card-body">
                    <div className="lh-card-cat">{c.category || "Course"}</div>
                    <div className="lh-card-title">{c.title}</div>
                    <div className="lh-prog-wrap">
                      <div className="lh-prog-row">
                        <span>Progress</span><span>{pct}%</span>
                      </div>
                      <div className="lh-prog-bar">
                        <div className={`lh-prog-fill${pct === 100 ? " done" : ""}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {pct === 100 && <div style={{ fontSize: "0.72rem", color: "#059669", fontWeight: 800, marginTop: 4 }}>✓ Completed</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Discover */}
      {tab === "discover" && (
        loading ? <div className="lh-grid">{SKELETON}</div>
        : allCourses.length === 0 ? (
          <div className="lh-empty">
            <span className="lh-empty-icon">🔭</span>
            <div className="lh-empty-title">No courses available</div>
            <div className="lh-empty-sub">Check back soon — new courses are added regularly.</div>
          </div>
        ) : (
          <div className="lh-grid">
            {allCourses.map(c => (
              <Link key={c.id} href={`/user/course/${c.id}`} className="lh-card">
                <div className="lh-card-thumb">
                  {c.thumbnail_url
                    ? <img src={c.thumbnail_url} alt={c.title} loading="lazy" />
                    : <div className="lh-card-thumb-placeholder">📚</div>}
                </div>
                <div className="lh-card-body">
                  <div className="lh-card-cat">{c.category || "Course"}</div>
                  <div className="lh-card-title">{c.title}</div>
                  <div className="lh-card-meta">
                    {c.instructor_name && `${c.instructor_name} · `}{c.level || "All levels"}
                    {c.lessons_count > 0 && ` · ${c.lessons_count} lessons`}
                  </div>
                  {enrolledIds.has(c.id) && (
                    <div style={{ fontSize: "0.7rem", color: "#1a3a8f", fontWeight: 800, marginTop: 6 }}>✓ Enrolled</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Resources */}
      {tab === "resources" && (
        loading ? <div className="lh-res-grid">{SKELETON.slice(0,6)}</div>
        : resources.length === 0 ? (
          <div className="lh-empty">
            <span className="lh-empty-icon">📁</span>
            <div className="lh-empty-title">No resources yet</div>
            <div className="lh-empty-sub">Study materials and resources coming soon.</div>
          </div>
        ) : (
          <div className="lh-res-grid">
            {resources.map(r => (
              <Link key={r.id} href={`/user/resources`} className="lh-res-card">
                <div className="lh-res-type">{r.file_type || r.category || "Resource"}</div>
                <div className="lh-res-icon">{ResourceIcon(r.file_type)}</div>
                <div className="lh-res-title">{r.title}</div>
                <div className="lh-res-meta">
                  {r.download_count > 0 ? `${r.download_count} downloads` : r.category || ""}
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
