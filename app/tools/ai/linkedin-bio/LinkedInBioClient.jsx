"use client";
// app/tools/ai/linkedin-bio/LinkedInBioClient.jsx
// Changes: "use client", import.meta.env→process.env, Link to→href,
//          framer-motion→CSS animations, Helmet→removed

import { useState, useCallback, useRef } from "react";
import "./LinkedInBioClient.css";
import Link from "next/link";

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function callLinkedInBio(payload) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/linkedin-bio`, {
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

const TONES = [
  { id:"professional",  label:"💼 Professional",  desc:"Formal, achievement-focused" },
  { id:"conversational",label:"😊 Conversational", desc:"Warm, approachable, human"   },
  { id:"bold",          label:"🔥 Bold",           desc:"Confident, direct, impactful" },
  { id:"creative",      label:"🎨 Creative",        desc:"Unique, storytelling style"   },
];

const LENGTHS = [
  { id:"short",  label:"Short",  sub:"~100 words" },
  { id:"medium", label:"Medium", sub:"~200 words" },
  { id:"long",   label:"Long",   sub:"~300 words" },
];

/* ── CSS (framer-motion replaced with CSS keyframes) ── */

export default function LinkedInBioClient() {
  const [name,         setName]         = useState("");
  const [title,        setTitle]        = useState("");
  const [industry,     setIndustry]     = useState("");
  const [experience,   setExperience]   = useState("");
  const [skills,       setSkills]       = useState("");
  const [achievements, setAchievements] = useState("");
  const [goal,         setGoal]         = useState("");
  const [tone,         setTone]         = useState("professional");
  const [length,       setLength]       = useState("medium");
  const [loading,      setLoading]      = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState("");
  const [copied,       setCopied]       = useState(false);
  const [regenNote,    setRegenNote]    = useState("");
  const resultRef = useRef(null);

  const generate = useCallback(async (isRegen = false) => {
    if (!title.trim()) return;
    setLoading(true); setError("");
    if (!isRegen) setResult(null);
    setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p + 10, 88)), 500);
    try {
      const res = await callLinkedInBio({
        name, title, industry, experience, skills, achievements, goal,
        tone, length, isRegen,
        regenNote: isRegen ? regenNote : "",
      });
      clearInterval(tick); setProgress(100);
      setTimeout(() => {
        setResult(res);
        setRegenNote("");
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }, 200);
    } catch (e) {
      clearInterval(tick); setProgress(0);
      setError(e.message || "Generation failed — please try again.");
    }
    setTimeout(() => setLoading(false), 300);
  }, [name, title, industry, experience, skills, achievements, goal, tone, length, regenNote]);

  const copy = async () => {
    if (!result?.bio) return;
    try { await navigator.clipboard.writeText(result.bio); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };

  const charCount = result?.bio?.length || 0;

  return (
    <>

      <div className="lb-root">
        <div className="lb-wrap">

          {/* Breadcrumb */}
          <nav className="lb-crumb" aria-label="Breadcrumb">
            <Link href="/tools">Tools</Link>
            <span aria-hidden="true">›</span>
            <Link href="/tools">AI Tools</Link>
            <span aria-hidden="true">›</span>
            <span style={{ color:"#475569" }} aria-current="page">LinkedIn Bio</span>
          </nav>

          {/* Hero */}
          <header className="lb-hero lb-fade-1">
            <div className="lb-badge">💼 AIDLA AI — LinkedIn Bio</div>
            <h1 className="lb-h1">
              <span className="lb-accent">AI LinkedIn</span> Bio Generator
            </h1>
            <p className="lb-sub">
              Generate a powerful LinkedIn About section that gets noticed. Choose your tone and style.
            </p>
          </header>

          <div className="lb-fade-2">

            {/* Profile info */}
            <section className="lb-card" aria-labelledby="profile-heading">
              <h2 className="lb-sec" id="profile-heading">Your Profile</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div className="lb-grid2">
                  <div>
                    <label htmlFor="lb-name" className="lb-label">Your Name</label>
                    <input id="lb-name" className="lb-input" placeholder="e.g. Ahmed Ali"
                      value={name} onChange={e => setName(e.target.value)} autoComplete="name"/>
                  </div>
                  <div>
                    <label htmlFor="lb-title" className="lb-label">Current Job Title *</label>
                    <input id="lb-title" className="lb-input" placeholder="e.g. Software Engineer"
                      value={title} onChange={e => setTitle(e.target.value)}/>
                  </div>
                </div>
                <div className="lb-grid2">
                  <div>
                    <label htmlFor="lb-industry" className="lb-label">Industry</label>
                    <input id="lb-industry" className="lb-input" placeholder="e.g. FinTech, Healthcare"
                      value={industry} onChange={e => setIndustry(e.target.value)}/>
                  </div>
                  <div>
                    <label htmlFor="lb-exp" className="lb-label">Years of Experience</label>
                    <input id="lb-exp" className="lb-input" placeholder="e.g. 5 years"
                      value={experience} onChange={e => setExperience(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label htmlFor="lb-skills" className="lb-label">Top Skills</label>
                  <input id="lb-skills" className="lb-input"
                    placeholder="e.g. React, Python, AWS, Team Leadership"
                    value={skills} onChange={e => setSkills(e.target.value)}/>
                </div>
                <div>
                  <label htmlFor="lb-achievements" className="lb-label">Key Achievements (optional)</label>
                  <textarea id="lb-achievements" className="lb-textarea"
                    placeholder="e.g. Led team of 10, increased revenue by 30%, published 3 research papers…"
                    value={achievements} onChange={e => setAchievements(e.target.value)}/>
                </div>
                <div>
                  <label htmlFor="lb-goal" className="lb-label">What You&apos;re Looking For (optional)</label>
                  <input id="lb-goal" className="lb-input"
                    placeholder="e.g. Open to remote roles, seeking leadership positions"
                    value={goal} onChange={e => setGoal(e.target.value)}/>
                </div>
              </div>
            </section>

            {/* Tone + Length */}
            <section className="lb-card" aria-labelledby="style-heading">
              <h2 className="lb-sec" id="tone-lbl">Tone</h2>
              <div className="lb-tones" style={{ marginBottom:18 }} role="radiogroup" aria-labelledby="tone-lbl">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    className={`lb-tone-btn${tone === t.id ? " active" : ""}`}
                    aria-pressed={tone === t.id}
                    onClick={() => setTone(t.id)}
                  >
                    <div className="lb-tone-title">{t.label}</div>
                    <div className="lb-tone-desc">{t.desc}</div>
                  </button>
                ))}
              </div>

              <span className="lb-sec" id="length-lbl">Length</span>
              <div className="lb-lengths" role="radiogroup" aria-labelledby="length-lbl">
                {LENGTHS.map(l => (
                  <button
                    key={l.id}
                    className={`lb-len-btn${length === l.id ? " active" : ""}`}
                    aria-pressed={length === l.id}
                    onClick={() => setLength(l.id)}
                  >
                    <div className="lb-len-label">{l.label}</div>
                    <div className="lb-len-sub">{l.sub}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="lb-error" role="alert">⚠️ {error}</div>
            )}

            {/* Progress */}
            {loading && (
              <div className="lb-prog-wrap" aria-live="polite" aria-label={`Generating: ${Math.round(progress)}%`}>
                <div className="lb-prog-row">
                  <span>✍️ Writing your LinkedIn bio…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="lb-prog-track">
                  <div className="lb-prog-bar" style={{ width:`${progress}%` }}/>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              className="lb-gen-btn"
              onClick={() => generate(false)}
              disabled={loading || !title.trim()}
              aria-busy={loading}
              aria-label="Generate LinkedIn bio with AI"
            >
              {loading ? "✍️ Writing Your Bio…" : "💼 Generate LinkedIn Bio"}
            </button>
          </div>

          {/* Result */}
          <div ref={resultRef}>
            {result?.bio && (
              <div className="lb-slide-down">
                {/* Bio card */}
                <div className="lb-result-card">
                  <div className="lb-result-hdr">
                    <div className="lb-result-meta">
                      <div className="lb-li-icon" aria-hidden="true">in</div>
                      <div>
                        <div className="lb-result-name">
                          LinkedIn About Section
                          <span className="lb-ai-badge">✨ AI</span>
                        </div>
                        <div className="lb-result-sub">
                          {tone} · {length} · {charCount} characters
                        </div>
                      </div>
                    </div>
                    <div className="lb-result-btns">
                      <button
                        className={`lb-result-btn${copied ? " copied" : ""}`}
                        onClick={copy}
                        aria-label="Copy LinkedIn bio"
                      >
                        {copied ? "✅ Copied!" : "📋 Copy Bio"}
                      </button>
                    </div>
                  </div>

                  <div className="lb-bio-body">
                    <pre className="lb-bio-text">{result.bio}</pre>
                    <div className="lb-char-count">
                      <span style={{ fontWeight:700, color: charCount > 2600 ? "#dc2626" : charCount > 2000 ? "#d97706" : "#059669" }}>
                        {charCount}
                      </span>
                      {" / 2,600 LinkedIn characters"}
                      {charCount > 2600 && (
                        <span style={{ color:"#dc2626", display:"block", marginTop:4, fontSize:10 }}>
                          ⚠️ Exceeds limit — regenerate with &apos;Short&apos;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Regenerate */}
                <div className="lb-regen-card">
                  <div style={{ fontSize:13, fontWeight:800, color:"#0b1437", marginBottom:4 }}>
                    🔄 Tweak It
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>
                    Tell AI what to change
                  </div>
                  <label htmlFor="lb-regen-note" className="sr-only">Refinement instructions</label>
                  <input
                    id="lb-regen-note"
                    className="lb-regen-input"
                    placeholder="e.g. Make it shorter, add more about leadership, less formal…"
                    value={regenNote}
                    onChange={e => setRegenNote(e.target.value)}
                    maxLength={200}
                  />
                  <button
                    className="lb-regen-btn"
                    onClick={() => generate(true)}
                    disabled={loading}
                    aria-busy={loading}
                    aria-label={regenNote.trim() ? "Apply instructions and rewrite bio" : "Generate a new variation"}
                  >
                    {loading
                      ? "✍️ Rewriting…"
                      : regenNote.trim()
                        ? "✨ Apply & Rewrite"
                        : "🔄 New Variation"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="lb-cta lb-fade-3">
            <div className="lb-cta-text">
              <h2>More AI Tools 🚀</h2>
              <p>AI Email Writer, Interview Prep, Cover Letter and more.</p>
            </div>
            <Link href="/tools" className="lb-cta-btn" aria-label="Explore all AIDLA tools">
              Explore Tools ✨
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}