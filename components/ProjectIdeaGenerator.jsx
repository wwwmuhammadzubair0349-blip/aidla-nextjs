"use client";
// components/ProjectIdeaGenerator.jsx

import { useState } from "react";
import Link from "next/link";

const EDGE_FUNCTION_URL = "https://eyhpcztyznrpwnytvakw.supabase.co/functions/v1/generate-project-idea";

const DOMAINS = [
  { value: "engineering", label: "Engineering", icon: "⚙️" },
  { value: "computer_science", label: "Computer Science", icon: "💻" },
  { value: "ai_ml", label: "AI / ML", icon: "🤖" },
  { value: "medical", label: "Medical", icon: "🩺" },
  { value: "business", label: "Business", icon: "📈" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "social_science", label: "Social Science", icon: "🌍" },
  { value: "arts_design", label: "Arts & Design", icon: "🎨" },
  { value: "school", label: "School Level", icon: "🏫" },
  { value: "other", label: "Other", icon: "📦" },
];

const TYPES = [
  { value: "fyp",          label: "FYP" },
  { value: "mini_project", label: "Mini Project" },
  { value: "semester",     label: "Semester Project" },
  { value: "research",     label: "Research" },
  { value: "internship",   label: "Internship" },
  { value: "thesis",       label: "Thesis" },
  { value: "capstone",     label: "Capstone" },
  { value: "science_fair", label: "Science Fair" },
  { value: "case_study",   label: "Case Study" },
];

const DIFFICULTIES = [
  { value: "school",       label: "🏫 School" },
  { value: "beginner",     label: "🟢 Beginner" },
  { value: "intermediate", label: "🟡 Intermediate" },
  { value: "advanced",     label: "🔴 Advanced" },
  { value: "masters",      label: "🎓 Masters" },
];

const LEVELS = [
  "School", "Matric / O-Level", "Intermediate / A-Level", "Diploma",
  "Bachelor", "Master", "MPhil", "PhD", "Professional"
];

const DOMAIN_COLORS = {
  engineering: "#1e3a8a", computer_science: "#3b82f6", ai_ml: "#06b6d4",
  medical: "#10b981", business: "#f59e0b", education: "#6366f1",
  social_science: "#8b5cf6", arts_design: "#ec4899", school: "#14b8a6", other: "#64748b",
};

const inputSt = { width: "100%", padding: "11px 12px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

function IdeaResultCard({ idea, index }) {
  const [copied, setCopied] = useState(false);
  const accentColor = DOMAIN_COLORS[idea.domain] || "#3b82f6";

  const handleCopy = () => {
    const text = `${idea.title}\n\n${idea.description}\n\nFeatures:\n${idea.features?.map(f => `• ${f}`).join("\n")}\n\nTech Stack: ${idea.tech_stack?.join(", ")}\n\nChallenges:\n${idea.challenges?.map(c => `• ${c}`).join("\n")}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 28px rgba(15,23,42,0.08)" }}>
      <div style={{ height: 4, background: accentColor }} />
      <div style={{ padding: "18px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Idea {index + 1}</div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{idea.title}</h3>
          </div>
          <button onClick={handleCopy}
            style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: copied ? "rgba(22,163,74,0.06)" : "#f8fafc", color: copied ? "#15803d" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>

        {/* Description */}
        <p style={{ margin: "0 0 14px", color: "#374151", fontSize: 13, lineHeight: 1.7 }}>{idea.description}</p>

        {/* Features */}
        {idea.features?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✅ Features</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {idea.features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(22,163,74,0.1)", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech stack */}
        {idea.tech_stack?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🛠 Tech Stack</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {idea.tech_stack.map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Challenges */}
        {idea.challenges?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>⚡ Challenges</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {idea.challenges.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(245,158,11,0.1)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        {idea.milestones?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📅 Milestones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {idea.milestones.map((ms, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#334155" }}>
                  <span style={{ fontWeight: 700, color: accentColor, flexShrink: 0 }}>{i + 1}.</span>
                  {ms}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference links */}
        {idea.reference_links?.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🔗 References</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {idea.reference_links.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#1e3a8a", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                  🔗 {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectIdeaGenerator({ embedded = false }) {
  const [form, setForm] = useState({
    domain: "engineering",
    type: "mini_project",
    difficulty: "intermediate",
    level: "Bachelor",
    subject: "",
    tech_stack: "",
    team_size: "2",
    duration: "",
    extra_notes: "",
  });
  const [loading,  setLoading]  = useState(false);
  const [ideas,    setIdeas]    = useState([]);
  const [error,    setError]    = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setIdeas([]);

    const systemPrompt = `You are a project idea generator for university students. Generate exactly 3 distinct project ideas based on the user's requirements.

Respond ONLY with a valid JSON array of 3 objects. No preamble, no markdown, no explanation — only raw JSON.

Each object must have these exact keys:
{
  "title": string,
  "description": string (2-3 sentences),
  "domain": string,
  "features": string[] (4-6 items),
  "tech_stack": string[] (3-6 items),
  "challenges": string[] (2-4 items),
  "milestones": string[] (3-5 items),
  "reference_links": string[] (1-3 real URLs, optional)
}`;

    const userMessage = `Generate 3 project ideas with these requirements:
- Domain: ${form.domain}
- Project Type: ${form.type}
- Difficulty: ${form.difficulty}
- Education Level: ${form.level}
- Subject / Field: ${form.subject || "any"}
- Tech Stack Preference: ${form.tech_stack || "any"}
- Team Size: ${form.team_size} people
- Duration: ${form.duration || "not specified"}
- Extra Notes: ${form.extra_notes || "none"}

Return ONLY a JSON array of 3 ideas.`;

    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          user_id: "generate-idea",
          history: [],
          site_context: systemPrompt,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "";

      // Parse JSON from reply
      const clean = reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setIdeas(parsed);
      } else {
        setError("Unexpected response format. Try again.");
      }
    } catch {
      setError("Failed to generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        .gen-layout{display:grid;grid-template-columns:1fr;gap:14px;align-items:start;}
        .gen-card{background:#fff;border:1px solid #fed7aa;border-radius:16px;padding:16px;box-shadow:0 10px 28px rgba(15,23,42,.08);}
        .gen-choice{padding:7px 11px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer;border:1px solid #e2e8f0;background:#fff;color:#475569;font-family:inherit;}
        .gen-choice.active{background:#f59e0b;color:#111827;border-color:#f59e0b;}
        .gen-primary{width:100%;padding:13px 0;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;border:none;border-radius:10px;font-weight:900;font-size:15px;cursor:pointer;font-family:inherit;}
        .gen-primary:disabled{cursor:not-allowed;opacity:.55;}
        @media(min-width:880px){.gen-layout{grid-template-columns:minmax(280px,340px) 1fr;gap:22px}.gen-card{padding:22px;position:sticky;top:20px;}}
        @media(max-width:480px){.gen-card{padding:14px;border-radius:14px}.gen-two{grid-template-columns:1fr!important}.gen-choice{font-size:11px;padding:6px 9px}}
      `}</style>

      <div style={{ minHeight: embedded ? "auto" : "100vh", background: embedded ? "transparent" : "linear-gradient(180deg,#fff7ed 0%,#f8fafc 40%,#fff 100%)", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Header */}
        {!embedded && <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a8a 70%,#f59e0b 130%)", padding: "28px 16px 34px", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 12, fontWeight: 600, marginBottom: 14 }}>
              ← Back to Projects
            </Link>
            <div style={{ fontSize: 44, marginBottom: 10 }}>✨</div>
            <h1 id="project-generator-heading" style={{ margin: "0 0 8px", fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, color: "#fff" }}>AI Project Idea Generator</h1>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
              Tell us your requirements — get 3 custom project ideas with features, tech stack, milestones and challenges.
            </p>
          </div>
        </div>}

        <div style={{ maxWidth: embedded ? "none" : 1200, margin: "0 auto", padding: embedded ? 0 : "24px 14px 48px" }}>
          <div className="gen-layout">

            {/* Form */}
            <div className="gen-card">
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 18 }}>🎯 Your Requirements</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Domain */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Domain *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {DOMAINS.map(d => (
                      <button key={d.value} onClick={() => setForm(f => ({ ...f, domain: d.value }))}
                        className={`gen-choice${form.domain === d.value ? " active" : ""}`}>
                        {d.icon} {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gen-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Level *</label>
                    <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={{ ...inputSt, cursor: "pointer" }}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Subject / Field</label>
                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="e.g. Electrical, Nursing, Biology" style={inputSt} />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Project Type *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={`gen-choice${form.type === t.value ? " active" : ""}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Difficulty *</label>
                  <div style={{ display: "flex", gap: 5 }}>
                    {DIFFICULTIES.map(d => (
                      <button key={d.value} onClick={() => setForm(f => ({ ...f, difficulty: d.value }))}
                        className={`gen-choice${form.difficulty === d.value ? " active" : ""}`} style={{ flex: 1, borderRadius: 10 }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tech stack preference */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Tools / Tech / Method Preference</label>
                  <input value={form.tech_stack} onChange={e => setForm(f => ({ ...f, tech_stack: e.target.value }))}
                    placeholder="e.g. MATLAB, lab study, survey, Python, Flutter…" style={inputSt} />
                </div>

                {/* Team size + duration */}
                <div className="gen-two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Team Size</label>
                    <select value={form.team_size} onChange={e => setForm(f => ({ ...f, team_size: e.target.value }))} style={{ ...inputSt, cursor: "pointer" }}>
                      {["1", "2", "3", "4", "5+"].map(s => <option key={s} value={s}>{s} person{s !== "1" ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Duration</label>
                    <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      placeholder="e.g. 3 months" style={inputSt} />
                  </div>
                </div>

                {/* Extra notes */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Extra Notes</label>
                  <textarea value={form.extra_notes} onChange={e => setForm(f => ({ ...f, extra_notes: e.target.value }))}
                    placeholder="Any specific requirements, problem you want to solve, target audience…"
                    rows={3} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
                </div>

                {/* Generate button */}
                <button onClick={handleGenerate} disabled={loading}
                  className="gen-primary">
                  {loading ? "✨ Generating 3 Ideas…" : "✨ Generate 3 Ideas"}
                </button>
              </div>
            </div>

            {/* Results */}
            <div>
              {!loading && ideas.length === 0 && !error && (
                <div style={{ textAlign: "center", padding: "clamp(34px,8vw,60px) 16px", border: "2px dashed #fed7aa", borderRadius: 16, background: "#fff" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 }}>Ready to Generate</div>
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>Fill in your requirements and click Generate to get 3 custom project ideas</div>
                </div>
              )}

              {loading && (
                <div style={{ textAlign: "center", padding: "clamp(34px,8vw,60px) 16px", border: "2px dashed #fed7aa", borderRadius: 16, background: "#fff" }}>
                  <div style={{ fontSize: 48, marginBottom: 14, animation: "spin 2s linear infinite", display: "inline-block" }}>✨</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 }}>Generating Ideas…</div>
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>AI is crafting 3 custom project ideas for you</div>
                  <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
                </div>
              )}

              {error && (
                <div style={{ padding: "16px 18px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#dc2626", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
                  ⚠️ {error}
                  <button onClick={handleGenerate} style={{ marginLeft: 12, padding: "4px 12px", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, background: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                    Retry
                  </button>
                </div>
              )}

              {ideas.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>✨ {ideas.length} Ideas Generated</div>
                    <button onClick={handleGenerate} disabled={loading}
                      style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#0f172a", fontFamily: "inherit" }}>
                      🔄 Regenerate
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {ideas.map((idea, i) => <IdeaResultCard key={i} idea={idea} index={i} />)}
                  </div>
                  <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(26,58,143,0.05)", border: "1px solid rgba(26,58,143,0.15)", borderRadius: 12, fontSize: 13, color: "#1e3a8a", fontWeight: 600 }}>
                    💡 Like an idea? <Link href="/user/projects" style={{ color: "#1e3a8a", fontWeight: 800 }}>Submit it to the community →</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
