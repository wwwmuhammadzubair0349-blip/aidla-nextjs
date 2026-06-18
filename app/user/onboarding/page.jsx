"use client";
// app/user/onboarding/page.jsx — Phase 2 full 5-step onboarding wizard

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const GOALS = [
  { value: "get_job",      label: "Get a Job",           icon: "💼", desc: "Land your first or next role" },
  { value: "grow_career",  label: "Grow in Career",      icon: "📈", desc: "Level up your current path" },
  { value: "learn_ai",     label: "Learn AI & Tech",     icon: "🤖", desc: "Build future-proof skills" },
  { value: "exam_prep",    label: "Prepare for Exams",   icon: "📝", desc: "CSS, PMS, boards & more" },
];

const LEVELS = [
  { value: "student",    label: "Student",          icon: "🎒", desc: "Currently studying" },
  { value: "fresh_grad", label: "Fresh Graduate",   icon: "🎓", desc: "Recently graduated" },
  { value: "1_3_years",  label: "1–3 Years Exp",   icon: "⭐", desc: "Growing professional" },
  { value: "3_plus",     label: "3+ Years Exp",     icon: "🏆", desc: "Experienced professional" },
];

const FIELDS = [
  { value: "cs_it",       label: "CS / IT",           icon: "💻" },
  { value: "engineering", label: "Engineering",         icon: "⚙️" },
  { value: "business",    label: "Business / Finance",  icon: "📊" },
  { value: "medicine",    label: "Medicine / Health",   icon: "🏥" },
  { value: "education",   label: "Education / Teaching",icon: "🍎" },
  { value: "law",         label: "Law / Social Sciences",icon: "⚖️" },
  { value: "arts",        label: "Arts / Media",        icon: "🎨" },
  { value: "other",       label: "Other",               icon: "🌐" },
];

const FIRST_ACTIONS = {
  get_job:     ["Create a professional CV →", "Try AI Interview Prep →", "Explore career courses →"],
  grow_career: ["Browse advanced courses →", "Connect with community →", "Take a skill assessment →"],
  learn_ai:    ["Start an AI course →", "Chat with AIDLA AI →", "Read latest AI blogs →"],
  exam_prep:   ["Take a daily quiz →", "Browse study resources →", "Join the forum →"],
};

const CSS = `
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
.ob-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1437 0%, #1a3a8f 50%, #0b1437 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 24px; font-family: 'DM Sans', system-ui, sans-serif;
}
.ob-card {
  background: rgba(255,255,255,0.97);
  border-radius: 24px; padding: 36px 32px;
  width: 100%; max-width: 520px;
  box-shadow: 0 24px 80px rgba(11,20,55,0.35);
  animation: obIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes obIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
.ob-progress { display: flex; gap: 6px; margin-bottom: 28px; }
.ob-prog-dot {
  flex: 1; height: 4px; border-radius: 99px;
  background: #e2e8f0; transition: background 0.3s;
}
.ob-prog-dot.done { background: #1a3a8f; }
.ob-prog-dot.active { background: #f59e0b; }
.ob-step-label {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: #f59e0b; margin-bottom: 6px;
}
.ob-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem; font-weight: 900; color: #0f172a;
  margin-bottom: 6px; line-height: 1.2;
}
.ob-sub { font-size: 0.88rem; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
.ob-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
.ob-grid-3 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.ob-option {
  border: 2px solid #e2e8f0; border-radius: 14px;
  padding: 14px 12px; cursor: pointer; text-align: center;
  background: #fff; transition: all 0.15s; position: relative;
}
.ob-option:hover { border-color: #1a3a8f; background: #f0f4ff; }
.ob-option.selected { border-color: #1a3a8f; background: #f0f4ff; box-shadow: 0 0 0 3px rgba(26,58,143,0.12); }
.ob-option-icon { font-size: 1.6rem; display: block; margin-bottom: 6px; }
.ob-option-label { font-size: 0.82rem; font-weight: 800; color: #0f172a; display: block; margin-bottom: 2px; }
.ob-option-desc { font-size: 0.7rem; color: #64748b; display: block; line-height: 1.4; }
.ob-check {
  position: absolute; top: 8px; right: 8px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #1a3a8f; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.ob-option.selected .ob-check { opacity: 1; }
.ob-check svg { width: 10px; height: 10px; stroke: #fff; stroke-width: 3; fill: none; }
.ob-actions { display: flex; gap: 10px; }
.ob-btn-primary {
  flex: 1; padding: 13px 20px; border: none; border-radius: 30px;
  background: linear-gradient(135deg, #1a3a8f, #3b82f6);
  color: #fff; font-weight: 800; font-size: 0.9rem;
  cursor: pointer; transition: opacity 0.2s;
}
.ob-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.ob-btn-ghost {
  padding: 13px 20px; border: 1.5px solid #e2e8f0; border-radius: 30px;
  background: #fff; color: #64748b; font-weight: 700; font-size: 0.88rem;
  cursor: pointer;
}
.ob-actions-list { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
.ob-action-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 12px;
  background: #f8faff; border: 1px solid rgba(26,58,143,0.1);
  font-size: 0.88rem; font-weight: 700; color: #1a3a8f;
}
.ob-action-item::before { content: "→"; font-weight: 900; }
.ob-input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid #e2e8f0; border-radius: 12px;
  font-size: 0.95rem; color: #0f172a; outline: none;
  font-family: inherit; margin-bottom: 12px;
  transition: border-color 0.15s;
}
.ob-input:focus { border-color: #1a3a8f; }
.ob-skip { text-align: center; margin-top: 16px; }
.ob-skip button { background: none; border: none; color: #94a3b8; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
.ob-skip button:hover { color: #64748b; }
.ob-done { text-align: center; padding: 12px 0; }
.ob-done-icon { font-size: 4rem; display: block; margin-bottom: 12px; }
.ob-done-title { font-size: 1.4rem; font-weight: 900; color: #0f172a; margin-bottom: 6px; font-family: 'Playfair Display', serif; }
.ob-done-sub { font-size: 0.88rem; color: #64748b; }
@keyframes spin { to { transform: rotate(360deg); } }
.ob-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(26,58,143,0.15); border-top-color: #1a3a8f; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
`;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]       = useState(1); // 1–5, then "done"
  const [goal, setGoal]       = useState("");
  const [level, setLevel]     = useState("");
  const [field, setField]     = useState("");
  const [name, setName]       = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      // Pre-fill name if available
      const { data } = await supabase.from("users_profiles")
        .select("full_name, onboarding_completed").eq("user_id", session.user.id).single();
      if (data?.onboarding_completed) { router.replace("/user"); return; }
      if (data?.full_name) setName(data.full_name);
    })();
  }, [router]);

  const skip = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("users_profiles").update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        ...(goal  && { user_goal: goal }),
        ...(level && { user_level: level }),
        ...(field && { user_field: field }),
      }).eq("user_id", session.user.id);
    }
    router.replace("/user");
  };

  const finish = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }
    const updates = {
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      user_goal: goal,
      user_level: level,
      user_field: field,
    };
    if (name.trim()) updates.full_name = name.trim();
    await supabase.from("users_profiles").update(updates).eq("user_id", session.user.id);
    setStep("done");
    setTimeout(() => router.replace("/user"), 1800);
  };

  const prog = (n) => {
    if (step === "done") return "done";
    if (n < step) return "done";
    if (n === step) return "active";
    return "";
  };

  if (step === "done") {
    return (
      <div className="ob-wrap">
        <style>{CSS}</style>
        <div className="ob-card">
          <div className="ob-done">
            <span className="ob-done-icon">🎉</span>
            <div className="ob-done-title">Welcome to AIDLA!</div>
            <div className="ob-done-sub">Setting up your personalized experience…</div>
            <div style={{ marginTop: 20 }}><div className="ob-spinner" /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-wrap">
      <style>{CSS}</style>
      <div className="ob-card">
        {/* Progress dots */}
        <div className="ob-progress" aria-label="Onboarding progress">
          {[1,2,3,4,5].map(n => <div key={n} className={`ob-prog-dot ${prog(n)}`} />)}
        </div>

        {/* Step 1 — Goal */}
        {step === 1 && (
          <>
            <div className="ob-step-label">Step 1 of 5</div>
            <div className="ob-title">What's your main goal?</div>
            <div className="ob-sub">We'll personalize AIDLA for you.</div>
            <div className="ob-grid">
              {GOALS.map(g => (
                <div key={g.value} className={`ob-option${goal === g.value ? " selected" : ""}`} onClick={() => setGoal(g.value)}>
                  <div className="ob-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <span className="ob-option-icon">{g.icon}</span>
                  <span className="ob-option-label">{g.label}</span>
                  <span className="ob-option-desc">{g.desc}</span>
                </div>
              ))}
            </div>
            <div className="ob-actions">
              <button className="ob-btn-primary" disabled={!goal} onClick={() => setStep(2)}>Continue →</button>
            </div>
            <div className="ob-skip"><button onClick={skip}>Skip onboarding</button></div>
          </>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <>
            <div className="ob-step-label">Step 2 of 5</div>
            <div className="ob-title">What's your experience level?</div>
            <div className="ob-sub">This helps us show the right content.</div>
            <div className="ob-grid">
              {LEVELS.map(l => (
                <div key={l.value} className={`ob-option${level === l.value ? " selected" : ""}`} onClick={() => setLevel(l.value)}>
                  <div className="ob-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <span className="ob-option-icon">{l.icon}</span>
                  <span className="ob-option-label">{l.label}</span>
                  <span className="ob-option-desc">{l.desc}</span>
                </div>
              ))}
            </div>
            <div className="ob-actions">
              <button className="ob-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="ob-btn-primary" disabled={!level} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 3 — Field */}
        {step === 3 && (
          <>
            <div className="ob-step-label">Step 3 of 5</div>
            <div className="ob-title">What's your field?</div>
            <div className="ob-sub">We'll highlight the most relevant courses and news.</div>
            <div className="ob-grid ob-grid-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              {FIELDS.map(f => (
                <div key={f.value} className={`ob-option${field === f.value ? " selected" : ""}`}
                  style={{ padding: "10px 8px" }}
                  onClick={() => setField(f.value)}>
                  <div className="ob-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <span className="ob-option-icon" style={{ fontSize: "1.3rem" }}>{f.icon}</span>
                  <span className="ob-option-label" style={{ fontSize: "0.72rem" }}>{f.label}</span>
                </div>
              ))}
            </div>
            <div className="ob-actions">
              <button className="ob-btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="ob-btn-primary" disabled={!field} onClick={() => setStep(4)}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 4 — Preview */}
        {step === 4 && (
          <>
            <div className="ob-step-label">Step 4 of 5</div>
            <div className="ob-title">Your personalized plan ✨</div>
            <div className="ob-sub">Based on your answers, here's where to start:</div>
            <ul className="ob-actions-list">
              {(FIRST_ACTIONS[goal] || FIRST_ACTIONS.get_job).map((a, i) => (
                <li key={i} className="ob-action-item">{a}</li>
              ))}
            </ul>
            <div style={{ background: "linear-gradient(135deg, rgba(26,58,143,0.06), rgba(59,130,246,0.06))", borderRadius: 14, padding: "14px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>🪙</span>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>Earn 50 coins today</div>
                <div style={{ fontSize: "0.74rem", color: "#64748b" }}>Complete the daily quiz to earn your first coins</div>
              </div>
            </div>
            <div className="ob-actions">
              <button className="ob-btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="ob-btn-primary" onClick={() => setStep(5)}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 5 — Name */}
        {step === 5 && (
          <>
            <div className="ob-step-label">Step 5 of 5</div>
            <div className="ob-title">What should we call you?</div>
            <div className="ob-sub">Your display name on AIDLA.</div>
            <input
              className="ob-input"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 20 }}>
              You can add a profile photo and more details in Settings.
            </div>
            <div className="ob-actions">
              <button className="ob-btn-ghost" onClick={() => setStep(4)}>← Back</button>
              <button className="ob-btn-primary" disabled={saving} onClick={finish}>
                {saving ? "Setting up…" : "Go to Dashboard 🚀"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
