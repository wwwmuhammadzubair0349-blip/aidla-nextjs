"use client";
// app/tools/ai/interview-prep/InterviewPrepClient.jsx
// Changes: "use client", import.meta.env→process.env, Link to→href,
//          useNavigate→useRouter, framer-motion→CSS animations, Helmet→removed

import { useState, useCallback, useRef } from "react";
import "./InterviewPrepClient.css";
import Link from "next/link";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function callInterviewPrep(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/interview-prep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Generation failed");
  return data.result;
}

const JOB_CATEGORIES = [
  { id:"tech",       label:"💻 Technology",   roles:["Software Engineer","Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","AI/ML Engineer","DevOps Engineer","Cybersecurity Analyst","Product Manager","UI/UX Designer"] },
  { id:"business",   label:"📊 Business",     roles:["Business Analyst","Marketing Manager","Sales Executive","HR Manager","Finance Manager","Operations Manager","Project Manager","Supply Chain Manager"] },
  { id:"medical",    label:"🏥 Medical",      roles:["Doctor","Nurse","Pharmacist","Medical Lab Technician","Physiotherapist","Dentist"] },
  { id:"education",  label:"🎓 Education",    roles:["Teacher","Lecturer","School Principal","Curriculum Developer","Education Coordinator"] },
  { id:"engineering",label:"⚙️ Engineering",  roles:["Civil Engineer","Mechanical Engineer","Electrical Engineer","Chemical Engineer","Industrial Engineer"] },
  { id:"custom",     label:"✏️ Custom Role",  roles:[] },
];

const LEVELS = [
  { id:"fresher", label:"🌱 Fresher / Entry Level" },
  { id:"mid",     label:"💼 Mid Level (2–5 years)" },
  { id:"senior",  label:"🚀 Senior (5+ years)"     },
];

const TYPES = [
  { id:"technical",   label:"🔧 Technical"    },
  { id:"behavioral",  label:"🧠 Behavioral"   },
  { id:"situational", label:"🎯 Situational"  },
  { id:"hr",          label:"👔 HR & General" },
  { id:"mixed",       label:"🔀 Mixed (All)"  },
];

/* ── CSS (framer-motion replaced with CSS keyframes) ── */

export default function InterviewPrepClient() {
  const [category,   setCategory]   = useState("tech");
  const [role,       setRole]       = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [level,      setLevel]      = useState("mid");
  const [type,       setType]       = useState("mixed");
  const [count,      setCount]      = useState(10);
  const [company,    setCompany]    = useState("");
  const [skills,     setSkills]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState("");
  const [openIdx,    setOpenIdx]    = useState(null);
  const [copied,     setCopied]     = useState("");
  const resultRef = useRef(null);

  const finalRole = category === "custom" ? customRole : role;

  const generate = useCallback(async () => {
    if (!finalRole.trim()) return;
    setLoading(true); setError(""); setResult(null); setProgress(0); setOpenIdx(null);
    const tick = setInterval(() => setProgress(p => Math.min(p + 8, 88)), 600);
    try {
      const res = await callInterviewPrep({ role: finalRole, level, type, count, company, skills });
      clearInterval(tick); setProgress(100);
      setTimeout(() => {
        setResult(res);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }, 200);
    } catch (e) {
      clearInterval(tick); setProgress(0);
      setError(e.message || "Generation failed — please try again.");
    }
    setTimeout(() => setLoading(false), 300);
  }, [finalRole, level, type, count, company, skills]);

  const copyAll = async () => {
    if (!result?.questions) return;
    const text = result.questions.map((q, i) => `Q${i+1}: ${q.question}\n\nAnswer: ${q.answer}\n\n---`).join("\n");
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied("all"); setTimeout(() => setCopied(""), 2200);
  };

  const copyOne = async (q, i) => {
    const text = `Q: ${q.question}\n\nAnswer: ${q.answer}`;
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(String(i)); setTimeout(() => setCopied(""), 2200);
  };

  const cat = JOB_CATEGORIES.find(c => c.id === category);

  return (
    <>

      <div className="ip-root">
        <div className="ip-wrap">

          {/* Breadcrumb */}
          <nav className="ip-crumb" aria-label="Breadcrumb">
            <Link href="/tools">Tools</Link>
            <span aria-hidden="true">›</span>
            <Link href="/tools">AI Tools</Link>
            <span aria-hidden="true">›</span>
            <span style={{ color:"#475569" }} aria-current="page">Interview Prep</span>
          </nav>

          {/* Hero */}
          <header className="ip-hero ip-fade-1">
            <div className="ip-badge">
              <span className="ip-badge-dot" aria-hidden="true"/>
              🎯 AIDLA AI — Interview Prep
            </div>
            <h1 className="ip-h1">
              <span className="ip-accent">AI Interview</span> Prep
            </h1>
            <p className="ip-sub">
              Get likely interview questions and model answers for any job role — technical, behavioral, HR and more.
            </p>
          </header>

          <div className="ip-fade-2">

            {/* Category + Role */}
            <section className="ip-card" aria-labelledby="cat-heading">
              <h2 className="ip-sec" id="cat-heading">Job Category</h2>
              <div className="ip-cats" role="radiogroup" aria-label="Job category">
                {JOB_CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`ip-cat-btn${category === c.id ? " active" : ""}`}
                    aria-pressed={category === c.id}
                    onClick={() => {
                      setCategory(c.id);
                      if (c.roles.length) setRole(c.roles[0]);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {category !== "custom" && cat?.roles.length > 0 && (
                <>
                  <h3 className="ip-sec" style={{ marginTop:14 }}>Select Role</h3>
                  <div className="ip-roles" role="radiogroup" aria-label="Select role">
                    {cat.roles.map(r => (
                      <button
                        key={r}
                        className={`ip-role-btn${role === r ? " active" : ""}`}
                        aria-pressed={role === r}
                        onClick={() => setRole(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {category === "custom" && (
                <div style={{ marginTop:14 }}>
                  <label htmlFor="ip-custom-role" className="ip-label">Enter Job Title</label>
                  <input
                    id="ip-custom-role"
                    className="ip-input"
                    placeholder="e.g. Blockchain Developer, Fashion Designer…"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                  />
                </div>
              )}
            </section>

            {/* Level, Type, Count */}
            <section className="ip-card" aria-labelledby="settings-heading">
              <h2 className="ip-sec" id="settings-heading" style={{ display:"none" }}>Settings</h2>
              <div className="ip-grid2" style={{ marginBottom:14 }}>
                <div>
                  <span className="ip-sec" id="level-lbl">Experience Level</span>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }} role="radiogroup" aria-labelledby="level-lbl">
                    {LEVELS.map(l => (
                      <button
                        key={l.id}
                        className={`ip-chip${level === l.id ? " active" : ""}`}
                        aria-pressed={level === l.id}
                        onClick={() => setLevel(l.id)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="ip-sec" id="type-lbl">Question Type</span>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }} role="radiogroup" aria-labelledby="type-lbl">
                    {TYPES.map(t => (
                      <button
                        key={t.id}
                        className={`ip-chip${type === t.id ? " active" : ""}`}
                        aria-pressed={type === t.id}
                        onClick={() => setType(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <span className="ip-sec" id="count-lbl">Number of Questions</span>
              <div className="ip-count-row" role="group" aria-labelledby="count-lbl">
                <button
                  className="ip-count-btn"
                  onClick={() => setCount(c => Math.max(5, c - 5))}
                  aria-label="Decrease question count"
                >−</button>
                <span className="ip-count-val" aria-live="polite" aria-label={`${count} questions`}>{count}</span>
                <button
                  className="ip-count-btn"
                  onClick={() => setCount(c => Math.min(20, c + 5))}
                  aria-label="Increase question count"
                >+</button>
                <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>questions</span>
              </div>
            </section>

            {/* Optional context */}
            <section className="ip-card" aria-labelledby="context-heading">
              <h2 className="ip-sec" id="context-heading">Optional Context (makes questions more targeted)</h2>
              <div className="ip-grid2">
                <div>
                  <label htmlFor="ip-company" className="ip-label">Company Name</label>
                  <input
                    id="ip-company"
                    className="ip-input"
                    placeholder="e.g. Google, PTCL, Nestle"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ip-skills" className="ip-label">Your Key Skills</label>
                  <input
                    id="ip-skills"
                    className="ip-input"
                    placeholder="e.g. React, Python, SQL"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="ip-error" role="alert">⚠️ {error}</div>
            )}

            {/* Progress */}
            {loading && (
              <div className="ip-prog-wrap" aria-live="polite" aria-label={`Generating: ${Math.round(progress)}%`}>
                <div className="ip-prog-row">
                  <span>🤖 AIDLA AI is preparing your questions…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="ip-prog-track">
                  <div className="ip-prog-bar" style={{ width:`${progress}%` }}/>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              className="ip-gen-btn"
              onClick={generate}
              disabled={loading || !finalRole.trim()}
              aria-busy={loading}
              aria-label={`Generate ${count} interview questions for ${finalRole || "selected role"}`}
            >
              {loading ? "🤖 Generating Questions…" : `🎯 Generate ${count} Interview Questions`}
            </button>
          </div>

          {/* Results */}
          <div ref={resultRef}>
            {result?.questions?.length > 0 && (
              <div className="ip-card ip-fade-in" style={{ marginTop:8 }}>
                <div className="ip-result-hdr">
                  <div>
                    <div className="ip-result-title">
                      🎯 {result.questions.length} Questions for {result.role || finalRole}
                      <span className="ip-ai-badge" style={{ marginLeft:8 }}>✨ AIDLA AI</span>
                    </div>
                    <div className="ip-result-sub">{result.level || level} · {result.type || type}</div>
                  </div>
                  <button
                    className={`ip-copy-all${copied === "all" ? " copied" : ""}`}
                    onClick={copyAll}
                    aria-label="Copy all questions and answers"
                  >
                    {copied === "all" ? "✅ Copied All" : "📋 Copy All"}
                  </button>
                </div>

                <div role="list" aria-label="Interview questions">
                  {result.questions.map((q, i) => (
                    <div key={i} className="ip-qa-item" role="listitem">
                      <button
                        className="ip-qa-btn"
                        onClick={() => setOpenIdx(openIdx === i ? null : i)}
                        aria-expanded={openIdx === i}
                        aria-controls={`qa-body-${i}`}
                        id={`qa-btn-${i}`}
                      >
                        <div className="ip-qa-num" aria-hidden="true">{i + 1}</div>
                        <div className="ip-qa-q">{q.question}</div>
                        {q.type && (
                          <span className="ip-qa-type">{q.type}</span>
                        )}
                        <span
                          className={`ip-qa-chevron${openIdx === i ? " open" : ""}`}
                          aria-hidden="true"
                        >›</span>
                      </button>

                      {/* Answer panel — CSS max-height animation, no framer-motion */}
                      <div
                        id={`qa-body-${i}`}
                        className={`ip-qa-body${openIdx === i ? " open" : ""}`}
                        role="region"
                        aria-labelledby={`qa-btn-${i}`}
                      >
                        <pre className="ip-qa-answer">{q.answer}</pre>
                        <button
                          className={`ip-qa-copy${copied === String(i) ? " copied" : ""}`}
                          onClick={() => copyOne(q, i)}
                          aria-label={`Copy question ${i + 1} and answer`}
                        >
                          {copied === String(i) ? "✅ Copied" : "📋 Copy Q&A"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="ip-cta ip-fade-3">
            <div>
              <h2 className="ip-cta" style={{ all:"unset", fontFamily:"'Playfair Display',serif", fontSize:"clamp(1rem,4vw,1.3rem)", fontWeight:900, color:"#fff", display:"block", marginBottom:3 }}>More AI Tools 🚀</h2>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>AI Email Writer, LinkedIn Bio, Cover Letter and more.</p>
            </div>
            <Link href="/tools" className="ip-cta-btn" aria-label="Explore all AIDLA tools">
              Explore Tools ✨
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}