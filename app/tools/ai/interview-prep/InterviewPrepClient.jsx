"use client";
// app/tools/ai/interview-prep/InterviewPrepClient.jsx
// Changes: "use client", import.meta.env→process.env, Link to→href,
//          useNavigate→useRouter, framer-motion→CSS animations, Helmet→removed

import { useState, useCallback, useRef } from "react";
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
const CSS = `

.ip-root*{box-sizing:border-box;margin:0;padding:0}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

@keyframes ipFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ipFadeIn{from{opacity:0}to{opacity:1}}
@keyframes ipPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
@keyframes ipSlideDown{from{height:0;opacity:0}to{height:var(--h);opacity:1}}

.ip-fade-1{animation:ipFadeUp .4s cubic-bezier(.22,1,.36,1) both}
.ip-fade-2{animation:ipFadeUp .4s cubic-bezier(.22,1,.36,1) .08s both}
.ip-fade-3{animation:ipFadeUp .4s cubic-bezier(.22,1,.36,1) .16s both}
.ip-fade-in{animation:ipFadeIn .35s ease both}

.ip-root{min-height:100vh;background:linear-gradient(160deg,#f0f4ff 0%,#fffbf0 55%,#e8f4fd 100%);font-family:'DM Sans',sans-serif;overflow-x:hidden}
.ip-wrap{max-width:700px;margin:0 auto;padding:clamp(20px,5vw,48px) clamp(14px,4vw,24px) 60px;width:100%}

/* Breadcrumb */
.ip-crumb{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:18px;flex-wrap:wrap}
.ip-crumb a{color:#94a3b8;text-decoration:none;transition:color .15s}
.ip-crumb a:hover{color:#1a3a8f}
.ip-crumb a:focus-visible{outline:2px solid #3b82f6;outline-offset:2px;border-radius:3px}

/* Hero */
.ip-hero{text-align:center;margin-bottom:24px}
.ip-badge{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(135deg,#1a3a8f,#3b82f6);color:#fff;padding:5px 16px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;box-shadow:0 4px 16px rgba(26,58,143,.28)}
.ip-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.7);animation:ipPulse 1.6s ease infinite;flex-shrink:0}
.ip-h1{font-family:'Playfair Display',serif;font-size:clamp(1.7rem,6vw,2.5rem);font-weight:900;color:#0b1437;line-height:1.1;margin-bottom:8px}
.ip-accent{background:linear-gradient(135deg,#1a3a8f,#3b82f6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ip-sub{font-size:clamp(13px,3vw,15px);color:#64748b;line-height:1.65;max-width:460px;margin:0 auto}

/* Card */
.ip-card{background:rgba(255,255,255,.95);border:1px solid rgba(59,130,246,.1);border-radius:20px;box-shadow:0 4px 20px rgba(11,20,55,.07);padding:clamp(18px,4vw,26px);margin-bottom:14px}
.ip-sec{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px;display:block}

/* Category grid */
.ip-cats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:4px}
.ip-cat-btn{padding:9px 6px;border-radius:12px;border:1.5px solid #e2e8f0;background:#fff;font-size:11px;font-weight:800;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;text-align:center}
.ip-cat-btn:hover{border-color:rgba(26,58,143,.3);color:#1a3a8f}
.ip-cat-btn.active{background:#0b1437;border-color:#0b1437;color:#fff}
.ip-cat-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

/* Role chips */
.ip-roles{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.ip-role-btn{padding:6px 12px;border-radius:99px;border:1.5px solid #e2e8f0;background:#fff;font-size:12px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ip-role-btn:hover{border-color:rgba(26,58,143,.3);color:#1a3a8f}
.ip-role-btn.active{background:#0b1437;border-color:#0b1437;color:#fff}
.ip-role-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

/* Fields */
.ip-label{display:block;font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
.ip-input{width:100%;padding:11px 13px;border:1.5px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:600;color:#0b1437;background:#fff;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;appearance:none}
.ip-input:focus{border-color:rgba(26,58,143,.4);box-shadow:0 0 0 3px rgba(26,58,143,.07)}
.ip-input::placeholder{color:#94a3b8;font-weight:500;font-size:13px}
.ip-input:focus-visible{outline:3px solid #3b82f6;outline-offset:2px}
.ip-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}

/* Chips (level/type) */
.ip-chips{display:flex;flex-wrap:wrap;gap:6px}
.ip-chip{padding:7px 13px;border-radius:99px;border:1.5px solid #e2e8f0;background:#fff;font-size:12px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ip-chip:hover{border-color:rgba(26,58,143,.3);color:#1a3a8f}
.ip-chip.active{background:#0b1437;border-color:#0b1437;color:#fff}
.ip-chip:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

/* Count row */
.ip-count-row{display:flex;align-items:center;gap:12px}
.ip-count-btn{width:34px;height:34px;border-radius:50%;border:1.5px solid #e2e8f0;background:#fff;font-size:16px;font-weight:800;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .13s;flex-shrink:0}
.ip-count-btn:hover{background:#f0f4ff;border-color:rgba(26,58,143,.3)}
.ip-count-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}
.ip-count-val{font-size:20px;font-weight:900;color:#0b1437;min-width:32px;text-align:center}

/* Progress */
.ip-prog-wrap{margin-bottom:12px}
.ip-prog-row{display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:5px;font-weight:600}
.ip-prog-track{height:4px;background:#f1f5f9;border-radius:99px;overflow:hidden}
.ip-prog-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,#1a3a8f88,#1a3a8f);transition:width .5s ease}

/* Generate button */
.ip-gen-btn{width:100%;padding:14px 16px;border:none;border-radius:14px;font-weight:800;font-size:15px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;color:#fff;background:linear-gradient(135deg,#1a3a8f,#3b82f6);box-shadow:0 4px 16px rgba(26,58,143,.3)}
.ip-gen-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07)}
.ip-gen-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.ip-gen-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}

/* Error */
.ip-error{font-size:13px;color:#dc2626;background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.15);border-radius:10px;padding:10px 13px;margin-bottom:12px}

/* Result header */
.ip-result-hdr{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px}
.ip-result-title{font-size:14px;font-weight:800;color:#0b1437}
.ip-result-sub{font-size:11px;color:#94a3b8;margin-top:2px}
.ip-copy-all{padding:7px 14px;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;font-size:11px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s;white-space:nowrap}
.ip-copy-all:hover{background:#f0f4ff}
.ip-copy-all.copied{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.2);color:#059669}
.ip-copy-all:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

/* Q&A accordion */
.ip-qa-item{border:1px solid rgba(59,130,246,.1);border-radius:14px;background:#fff;margin-bottom:8px;overflow:hidden;transition:box-shadow .13s}
.ip-qa-item:hover{box-shadow:0 4px 14px rgba(11,20,55,.07)}
.ip-qa-btn{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;cursor:pointer;background:transparent;border:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif;transition:background .13s}
.ip-qa-btn:hover{background:#f8faff}
.ip-qa-btn:focus-visible{outline:2px solid #3b82f6;outline-offset:-2px;border-radius:14px}
.ip-qa-num{width:26px;height:26px;border-radius:8px;background:#0b1437;color:#fff;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.ip-qa-q{flex:1;font-size:13px;font-weight:800;color:#0b1437;line-height:1.45;text-align:left}
.ip-qa-type{font-size:8px;font-weight:800;padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;flex-shrink:0;margin-top:2px;background:rgba(26,58,143,.08);color:#1a3a8f;border:1px solid rgba(26,58,143,.15)}
.ip-qa-chevron{font-size:13px;color:#94a3b8;transition:transform .2s;flex-shrink:0;margin-top:4px;display:inline-block}
.ip-qa-chevron.open{transform:rotate(90deg)}

/* Answer panel — CSS height animation via max-height */
.ip-qa-body{padding:0 16px 14px 54px;border-top:1px solid #f1f5f9;overflow:hidden;max-height:0;transition:max-height .25s cubic-bezier(.22,1,.36,1),padding .25s}
.ip-qa-body.open{max-height:600px;padding:14px 16px 14px 54px}
.ip-qa-answer{font-size:13px;color:#475569;line-height:1.75;white-space:pre-wrap;word-break:break-word;font-family:'DM Sans',sans-serif}
.ip-qa-copy{margin-top:10px;padding:5px 12px;border:1px solid #e2e8f0;border-radius:7px;background:#f8faff;font-size:10px;font-weight:700;color:#64748b;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .13s}
.ip-qa-copy:hover{background:#f0f4ff;color:#1a3a8f}
.ip-qa-copy.copied{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.2);color:#059669}
.ip-qa-copy:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}

/* AI badge */
.ip-ai-badge{font-size:9px;font-weight:800;color:#059669;background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.2);border-radius:99px;padding:1px 7px;white-space:nowrap;flex-shrink:0}

/* CTA */
.ip-cta{background:linear-gradient(135deg,#0b1437,#1a3a8f);border-radius:20px;padding:22px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border:1px solid rgba(245,158,11,.15);box-shadow:0 8px 24px rgba(11,20,55,.15);margin-top:28px}
.ip-cta h3{font-family:'Playfair Display',serif;font-size:clamp(1rem,4vw,1.3rem);font-weight:900;color:#fff;margin-bottom:3px}
.ip-cta p{font-size:12px;color:rgba(255,255,255,.6)}
.ip-cta-btn{padding:10px 22px;background:linear-gradient(135deg,#f59e0b,#fcd34d);color:#0b1437;border-radius:99px;font-weight:900;font-size:13px;text-decoration:none;white-space:nowrap;flex-shrink:0;display:inline-block}
.ip-cta-btn:focus-visible{outline:3px solid #fff;outline-offset:3px}

@media(max-width:420px){
  .ip-cats{grid-template-columns:repeat(2,1fr)}
  .ip-grid2{grid-template-columns:1fr}
  .ip-cta{flex-direction:column;text-align:center}
  .ip-cta-btn{width:100%;text-align:center}
}
`;

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
      <style>{CSS}</style>

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