"use client";
// app/user/courses/page.jsx — In-app course catalog (keeps browsing inside /user)

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FALLBACK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1Ij48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgZmlsbD0iIzFlM2E4YSIvPjwvc3ZnPg==";

const CSS = `
.uc-wrap { font-family:'DM Sans',system-ui,sans-serif; }
.uc-head { margin-bottom:18px; }
.uc-title { font-size:1.35rem; font-weight:900; color:#0f172a; margin:0 0 4px; }
.uc-sub { font-size:0.82rem; color:#64748b; }
.uc-grid { display:grid; grid-template-columns:1fr; gap:14px; }
@media(min-width:560px){ .uc-grid{ grid-template-columns:1fr 1fr; } }
@media(min-width:900px){ .uc-grid{ grid-template-columns:1fr 1fr 1fr; } }
.uc-card { border:1.5px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#fff; display:flex; flex-direction:column; }
.uc-thumb { position:relative; aspect-ratio:16/9; background:#0f172a; }
.uc-thumb img { width:100%; height:100%; object-fit:cover; }
.uc-badge { position:absolute; top:8px; left:8px; font-size:0.62rem; font-weight:800; padding:3px 9px; border-radius:20px; color:#fff; }
.uc-body { padding:13px 14px 15px; display:flex; flex-direction:column; gap:6px; flex:1; }
.uc-meta { font-size:0.68rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; }
.uc-name { font-size:0.92rem; font-weight:800; color:#0f172a; line-height:1.3; }
.uc-desc { font-size:0.76rem; color:#64748b; line-height:1.45; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.uc-btn { margin-top:6px; border:none; border-radius:10px; padding:9px 12px; font-size:0.8rem; font-weight:800; cursor:pointer; text-align:center; text-decoration:none; font-family:inherit; }
.uc-btn.go { background:#1a3a8f; color:#fff; }
.uc-btn.free { background:#059669; color:#fff; }
.uc-btn.paid { background:#0f172a; color:#fff; }
.uc-empty, .uc-loading { padding:50px 20px; text-align:center; color:#94a3b8; font-size:0.9rem; }
`;

export default function UserCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      setUserId(uid);
      const [{ data: cs }, enr] = await Promise.all([
        supabase.from("course_courses").select("*").eq("status", "published").order("created_at", { ascending: false }),
        uid ? supabase.from("course_enrollments").select("course_id").eq("user_id", uid) : Promise.resolve({ data: [] }),
      ]);
      setCourses(cs || []);
      setEnrolledIds(new Set((enr.data || []).map(e => e.course_id)));
      setLoading(false);
    })();
  }, []);

  const isFree = c => c.is_free === true || !c.price || c.price === 0;

  async function enrollFree(c) {
    if (!userId) { router.push("/login"); return; }
    setBusy(c.id);
    const { error } = await supabase.from("course_enrollments").insert({ course_id: c.id, user_id: userId });
    setBusy(null);
    if (error && !/duplicate|unique/i.test(error.message)) { alert(error.message); return; }
    router.push(`/user/course/${c.id}`);
  }

  return (
    <div className="uc-wrap">
      <style>{CSS}</style>
      <div className="uc-head">
        <h1 className="uc-title">Courses</h1>
        <p className="uc-sub">Enroll and learn — all inside your dashboard</p>
      </div>

      {loading ? (
        <div className="uc-loading">Loading courses…</div>
      ) : courses.length === 0 ? (
        <div className="uc-empty">No courses available yet. Check back soon.</div>
      ) : (
        <div className="uc-grid">
          {courses.map(c => {
            const enrolled = enrolledIds.has(c.id);
            const free = isFree(c);
            const slug = c.slug || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            return (
              <div className="uc-card" key={c.id}>
                <div className="uc-thumb">
                  <img src={c.thumbnail_url || FALLBACK} alt={c.title} loading="lazy" />
                  <span className="uc-badge" style={{ background: free ? "#059669" : "#0f172a" }}>
                    {free ? "FREE" : `PKR ${Number(c.price || 0).toLocaleString()}`}
                  </span>
                </div>
                <div className="uc-body">
                  <div className="uc-meta">{c.category || "General"}{c.lesson_count ? ` · ${c.lesson_count} lessons` : ""}</div>
                  <div className="uc-name">{c.title}</div>
                  <div className="uc-desc">{c.description || "Explore this course to discover what you'll learn."}</div>
                  {enrolled ? (
                    <a className="uc-btn go" href={`/user/course/${c.id}`}>Continue →</a>
                  ) : free ? (
                    <button className="uc-btn free" disabled={busy === c.id} onClick={() => enrollFree(c)}>
                      {busy === c.id ? "Enrolling…" : "Enroll Free →"}
                    </button>
                  ) : (
                    <a className="uc-btn paid" href={`/courses/${slug}`}>View & Enroll →</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
