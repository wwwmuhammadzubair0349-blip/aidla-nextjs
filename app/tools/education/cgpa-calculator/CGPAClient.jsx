"use client";
// app/tools/education/cgpa-calculator/CGPAClient.jsx

import { useState, useCallback } from "react";
import Link from "next/link";

/* ── Grade scales ── */
const GRADE_POINTS_4 = [
  { label: "A+ (4.0)", value: 4.0 },
  { label: "A  (4.0)", value: 4.0 },
  { label: "A- (3.7)", value: 3.7 },
  { label: "B+ (3.3)", value: 3.3 },
  { label: "B  (3.0)", value: 3.0 },
  { label: "B- (2.7)", value: 2.7 },
  { label: "C+ (2.3)", value: 2.3 },
  { label: "C  (2.0)", value: 2.0 },
  { label: "C- (1.7)", value: 1.7 },
  { label: "D+ (1.3)", value: 1.3 },
  { label: "D  (1.0)", value: 1.0 },
  { label: "F  (0.0)", value: 0.0 },
];

const CREDIT_OPTIONS = [1, 2, 3, 4, 5, 6];

const newCourse = () => ({ id: Date.now() + Math.random(), credits: 3, grade: 4.0 });

function calcCGPA(courses) {
  const totalCredits  = courses.reduce((s, c) => s + Number(c.credits), 0);
  const totalPoints   = courses.reduce((s, c) => s + Number(c.credits) * Number(c.grade), 0);
  if (totalCredits === 0) return null;
  return { cgpa: totalPoints / totalCredits, totalCredits };
}

function cgpaToPercent(cgpa) { return Math.min(100, cgpa * 25).toFixed(2); }
function cgpaToGrade(cgpa) {
  if (cgpa >= 3.7) return "A / Distinction";
  if (cgpa >= 3.3) return "B+ / Merit";
  if (cgpa >= 3.0) return "B / Good";
  if (cgpa >= 2.7) return "B- / Above Average";
  if (cgpa >= 2.3) return "C+ / Average";
  if (cgpa >= 2.0) return "C / Satisfactory";
  if (cgpa >= 1.0) return "D / Pass";
  return "F / Fail";
}

export default function CGPAClient() {
  const [courses, setCourses] = useState([newCourse(), newCourse(), newCourse()]);
  const [tab, setTab] = useState("cgpa"); // "cgpa" | "convert"
  const [pctInput, setPctInput] = useState("");
  const [cgpaInput, setCgpaInput] = useState("");

  const result = calcCGPA(courses);

  const addCourse   = () => setCourses(p => [...p, newCourse()]);
  const removeCourse = (id) => setCourses(p => p.filter(c => c.id !== id));
  const updateCourse = (id, key, val) =>
    setCourses(p => p.map(c => c.id === id ? { ...c, [key]: val } : c));

  const pctToCgpa  = pctInput ? Math.min(4.0, Math.max(0, Number(pctInput) / 25)).toFixed(2) : null;
  const cgpaToPct  = cgpaInput ? Math.min(100, Math.max(0, Number(cgpaInput) * 25)).toFixed(2) : null;

  return (
    <div className="cgpa-root">

      {/* Tab switcher */}
      <div className="cgpa-tabs" role="tablist">
        <button role="tab" aria-selected={tab === "cgpa"} className={tab === "cgpa" ? "cgpa-tab active" : "cgpa-tab"} onClick={() => setTab("cgpa")}>
          🧮 CGPA Calculator
        </button>
        <button role="tab" aria-selected={tab === "convert"} className={tab === "convert" ? "cgpa-tab active" : "cgpa-tab"} onClick={() => setTab("convert")}>
          🔄 Convert CGPA ↔ %
        </button>
      </div>

      {tab === "cgpa" && (
        <section className="cgpa-section" aria-label="CGPA Calculator">
          <p className="cgpa-hint">Enter each subject&apos;s credit hours and grade to calculate your semester CGPA.</p>

          {/* Course rows */}
          <div className="cgpa-courses" role="list">
            <div className="cgpa-row-header" aria-hidden="true">
              <span>Subject</span><span>Credit Hours</span><span>Grade</span><span></span>
            </div>
            {courses.map((c, idx) => (
              <div key={c.id} className="cgpa-row" role="listitem">
                <span className="cgpa-row-num">{idx + 1}</span>
                <select
                  value={c.credits}
                  onChange={e => updateCourse(c.id, "credits", e.target.value)}
                  aria-label={`Subject ${idx + 1} credit hours`}
                  className="cgpa-select"
                >
                  {CREDIT_OPTIONS.map(n => <option key={n} value={n}>{n} Credit{n > 1 ? "s" : ""}</option>)}
                </select>
                <select
                  value={c.grade}
                  onChange={e => updateCourse(c.id, "grade", e.target.value)}
                  aria-label={`Subject ${idx + 1} grade`}
                  className="cgpa-select"
                >
                  {GRADE_POINTS_4.map(g => <option key={g.label} value={g.value}>{g.label}</option>)}
                </select>
                <button
                  onClick={() => courses.length > 1 && removeCourse(c.id)}
                  aria-label="Remove subject"
                  className="cgpa-remove"
                  disabled={courses.length <= 1}
                >×</button>
              </div>
            ))}
          </div>

          <button onClick={addCourse} className="cgpa-add-btn">+ Add Subject</button>

          {/* Result card */}
          {result && (
            <div className="cgpa-result" aria-live="polite">
              <div className="cgpa-result-main">
                <div className="cgpa-result-block">
                  <span className="cgpa-result-label">Your CGPA</span>
                  <strong className="cgpa-result-value">{result.cgpa.toFixed(2)}</strong>
                  <span className="cgpa-result-scale">/ 4.0 scale</span>
                </div>
                <div className="cgpa-result-block">
                  <span className="cgpa-result-label">Percentage</span>
                  <strong className="cgpa-result-value">{cgpaToPercent(result.cgpa)}%</strong>
                  <span className="cgpa-result-scale">equivalent</span>
                </div>
                <div className="cgpa-result-block">
                  <span className="cgpa-result-label">Total Credits</span>
                  <strong className="cgpa-result-value">{result.totalCredits}</strong>
                  <span className="cgpa-result-scale">credit hours</span>
                </div>
              </div>
              <div className="cgpa-grade-band">
                <span>Grade standing: </span>
                <strong>{cgpaToGrade(result.cgpa)}</strong>
              </div>
            </div>
          )}

          {/* GEO block */}
          <aside className="cgpa-geo" aria-label="CGPA scale information">
            <h2>How CGPA is Calculated</h2>
            <p>CGPA (Cumulative Grade Point Average) = Total Quality Points ÷ Total Credit Hours. Quality points = Grade Points × Credit Hours for each subject.</p>
            <p>Most Pakistani universities use a <strong>4.0 scale</strong>. To convert CGPA to percentage: <strong>CGPA × 25</strong> (e.g., 3.5 CGPA = 87.5%). HEC guidelines specify that 2.5 CGPA is the minimum for most graduate programs.</p>
          </aside>
        </section>
      )}

      {tab === "convert" && (
        <section className="cgpa-section" aria-label="CGPA Percentage Converter">
          <div className="cgpa-convert-grid">

            <div className="cgpa-convert-card">
              <label className="cgpa-convert-label" htmlFor="pct-input">Percentage → CGPA (4.0 scale)</label>
              <div className="cgpa-convert-row">
                <input
                  id="pct-input"
                  type="number"
                  min="0" max="100"
                  value={pctInput}
                  onChange={e => setPctInput(e.target.value)}
                  placeholder="e.g. 85"
                  className="cgpa-input"
                />
                <span className="cgpa-convert-unit">%</span>
              </div>
              {pctToCgpa !== null && (
                <div className="cgpa-convert-result">
                  <strong>{pctToCgpa}</strong> / 4.0
                  <span className="cgpa-convert-grade"> — {cgpaToGrade(Number(pctToCgpa))}</span>
                </div>
              )}
            </div>

            <div className="cgpa-convert-card">
              <label className="cgpa-convert-label" htmlFor="cgpa-input">CGPA → Percentage</label>
              <div className="cgpa-convert-row">
                <input
                  id="cgpa-input"
                  type="number"
                  min="0" max="4"
                  step="0.01"
                  value={cgpaInput}
                  onChange={e => setCgpaInput(e.target.value)}
                  placeholder="e.g. 3.5"
                  className="cgpa-input"
                />
                <span className="cgpa-convert-unit">/ 4.0</span>
              </div>
              {cgpaToPct !== null && (
                <div className="cgpa-convert-result">
                  <strong>{cgpaToPct}%</strong>
                  <span className="cgpa-convert-grade"> — {cgpaToGrade(Number(cgpaInput))}</span>
                </div>
              )}
            </div>

          </div>

          {/* Reference table */}
          <div className="cgpa-table-wrap">
            <h2 className="cgpa-table-heading">CGPA to Percentage Reference Table</h2>
            <table className="cgpa-table" aria-label="CGPA to percentage conversion table">
              <thead>
                <tr><th>CGPA (4.0)</th><th>Percentage</th><th>Grade</th><th>Standing</th></tr>
              </thead>
              <tbody>
                {[
                  [4.0,"100%","A+","Distinction"],
                  [3.7,"92.5%","A-","Distinction"],
                  [3.5,"87.5%","A-","High Merit"],
                  [3.3,"82.5%","B+","Merit"],
                  [3.0,"75%","B","Good"],
                  [2.7,"67.5%","B-","Above Average"],
                  [2.5,"62.5%","C+","HEC Minimum (PG)"],
                  [2.0,"50%","C","Satisfactory"],
                  [1.0,"25%","D","Pass"],
                ].map(([cgpa, pct, grade, standing]) => (
                  <tr key={cgpa}>
                    <td>{cgpa}</td><td>{pct}</td><td>{grade}</td><td>{standing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related tools */}
      <div className="cgpa-related">
        <span>Related: </span>
        <Link href="/tools/education/mdcat-ecat-calculator">MDCAT/ECAT Calculator</Link>
        <Link href="/tools/education/percentage-calculator">Percentage Calculator</Link>
        <Link href="/tools/education/grade-calculator">Grade Calculator</Link>
        <Link href="/tools">All Tools →</Link>
      </div>

      <style>{`
        .cgpa-root { max-width: 780px; margin: 0 auto; padding: 2rem 1.25rem 4rem; font-family: inherit; }
        .cgpa-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; }
        .cgpa-tab { padding: 0.6rem 1.1rem; border: none; background: none; cursor: pointer; font-size: 0.95rem; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
        .cgpa-tab.active { color: #6366f1; border-color: #6366f1; font-weight: 600; }
        .cgpa-hint { color: #64748b; font-size: 0.9rem; margin-bottom: 1.25rem; }
        .cgpa-row-header { display: grid; grid-template-columns: 2rem 1fr 1fr 2rem; gap: 0.5rem; font-size: 0.78rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 0.5rem; padding: 0 0.25rem; }
        .cgpa-row { display: grid; grid-template-columns: 2rem 1fr 1fr 2rem; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
        .cgpa-row-num { font-size: 0.8rem; color: #94a3b8; text-align: center; }
        .cgpa-select { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 0.6rem; font-size: 0.9rem; color: #0f172a; background: #fff; width: 100%; }
        .cgpa-select:focus { outline: 2px solid #6366f1; border-color: #6366f1; }
        .cgpa-remove { border: 1px solid #fca5a5; background: #fff5f5; color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 1.1rem; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .cgpa-remove:disabled { opacity: 0.35; cursor: not-allowed; }
        .cgpa-remove:not(:disabled):hover { background: #fee2e2; }
        .cgpa-add-btn { margin-top: 0.75rem; padding: 0.5rem 1.25rem; border: 2px dashed #c7d2fe; background: #f5f3ff; color: #6366f1; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: background 0.15s; }
        .cgpa-add-btn:hover { background: #ede9fe; }
        .cgpa-result { margin-top: 2rem; background: linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%); border-radius: 16px; padding: 1.5rem; color: #fff; }
        .cgpa-result-main { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .cgpa-result-block { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 100px; }
        .cgpa-result-label { font-size: 0.78rem; opacity: 0.8; text-transform: uppercase; letter-spacing: .05em; }
        .cgpa-result-value { font-size: 2.2rem; font-weight: 800; line-height: 1.1; }
        .cgpa-result-scale { font-size: 0.78rem; opacity: 0.7; }
        .cgpa-grade-band { text-align: center; background: rgba(255,255,255,0.12); border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.9rem; }
        .cgpa-geo { margin-top: 2rem; padding: 1.25rem; background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 0 8px 8px 0; }
        .cgpa-geo h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #0f172a; }
        .cgpa-geo p { font-size: 0.875rem; color: #475569; line-height: 1.7; margin-bottom: 0.5rem; }
        .cgpa-convert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
        .cgpa-convert-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; background: #fff; }
        .cgpa-convert-label { display: block; font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-bottom: 0.75rem; }
        .cgpa-convert-row { display: flex; align-items: center; gap: 0.5rem; }
        .cgpa-input { border: 2px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 0.75rem; font-size: 1rem; width: 100%; transition: border-color 0.15s; }
        .cgpa-input:focus { outline: none; border-color: #6366f1; }
        .cgpa-convert-unit { font-size: 0.875rem; color: #94a3b8; white-space: nowrap; }
        .cgpa-convert-result { margin-top: 1rem; padding: 0.75rem 1rem; background: #f5f3ff; border-radius: 8px; font-size: 1.1rem; color: #0f172a; }
        .cgpa-convert-result strong { color: #6366f1; font-size: 1.4rem; }
        .cgpa-convert-grade { font-size: 0.875rem; color: #64748b; }
        .cgpa-table-wrap { overflow-x: auto; }
        .cgpa-table-heading { font-size: 1rem; font-weight: 600; color: #0f172a; margin-bottom: 0.75rem; }
        .cgpa-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .cgpa-table th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 0.6rem 0.75rem; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .cgpa-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
        .cgpa-table tr:hover td { background: #f8fafc; }
        .cgpa-related { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.875rem; align-items: center; }
        .cgpa-related span { color: #94a3b8; }
        .cgpa-related a { color: #6366f1; text-decoration: none; }
        .cgpa-related a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
