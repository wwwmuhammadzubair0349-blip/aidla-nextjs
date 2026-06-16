"use client";
// app/tools/finance/salary-calculator/SalaryClient.jsx

import { useState, useMemo } from "react";
import Link from "next/link";

/* ── Pakistan FBR income tax slabs 2024-25 (annual PKR) ── */
function calcPakistanTax(annualPKR) {
  const slabs = [
    { max: 600_000,    base: 0,          rate: 0,    over: 0 },
    { max: 1_200_000,  base: 0,          rate: 0.05, over: 600_000 },
    { max: 2_400_000,  base: 30_000,     rate: 0.15, over: 1_200_000 },
    { max: 3_600_000,  base: 210_000,    rate: 0.25, over: 2_400_000 },
    { max: 6_000_000,  base: 510_000,    rate: 0.30, over: 3_600_000 },
    { max: Infinity,   base: 1_230_000,  rate: 0.35, over: 6_000_000 },
  ];
  const slab = slabs.find(s => annualPKR <= s.max) || slabs[slabs.length - 1];
  return slab.base + (annualPKR - slab.over) * slab.rate;
}

/* ── US federal tax estimate 2024 (single filer, simplified) ── */
function calcUSTax(annualUSD) {
  const slabs = [
    { max: 11_600,   base: 0,       rate: 0.10, over: 0 },
    { max: 47_150,   base: 1_160,   rate: 0.12, over: 11_600 },
    { max: 100_525,  base: 5_426,   rate: 0.22, over: 47_150 },
    { max: 191_950,  base: 17_169,  rate: 0.24, over: 100_525 },
    { max: 243_725,  base: 39_111,  rate: 0.32, over: 191_950 },
    { max: 609_350,  base: 55_679,  rate: 0.35, over: 243_725 },
    { max: Infinity, base: 183_647, rate: 0.37, over: 609_350 },
  ];
  const slab = slabs.find(s => annualUSD <= s.max) || slabs[slabs.length - 1];
  return slab.base + (annualUSD - slab.over) * slab.rate;
}

/* ── UK income tax 2024-25 ── */
function calcUKTax(annualGBP) {
  const personal = 12_570;
  const basic    = 50_270;
  const higher   = 125_140;
  let tax = 0;
  if (annualGBP > personal) tax += Math.min(annualGBP - personal, basic - personal) * 0.20;
  if (annualGBP > basic)    tax += Math.min(annualGBP - basic, higher - basic) * 0.40;
  if (annualGBP > higher)   tax += (annualGBP - higher) * 0.45;
  return tax;
}

const COUNTRIES = [
  { id: "pk",  label: "🇵🇰 Pakistan",     currency: "PKR", symbol: "Rs.",  placeholder: "e.g. 150000",    freq: "monthly" },
  { id: "ae",  label: "🇦🇪 UAE",           currency: "AED", symbol: "AED", placeholder: "e.g. 8000",      freq: "monthly" },
  { id: "us",  label: "🇺🇸 United States", currency: "USD", symbol: "$",   placeholder: "e.g. 80000",     freq: "annual"  },
  { id: "uk",  label: "🇬🇧 United Kingdom",currency: "GBP", symbol: "£",   placeholder: "e.g. 45000",     freq: "annual"  },
  { id: "in",  label: "🇮🇳 India",         currency: "INR", symbol: "₹",   placeholder: "e.g. 800000",    freq: "annual"  },
];

function fmt(n, symbol) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return symbol + " " + Math.round(n).toLocaleString("en");
}

function calcResult(country, gross) {
  if (!gross || isNaN(gross) || gross <= 0) return null;

  if (country === "pk") {
    const monthly    = gross;
    const annual     = gross * 12;
    const annualTax  = calcPakistanTax(annual);
    const monthlyTax = annualTax / 12;
    const net        = monthly - monthlyTax;
    return { monthly, annual, tax: monthlyTax, net, effectiveRate: (annualTax / annual) * 100 };
  }

  if (country === "ae") {
    // No income tax in UAE
    return { monthly: gross, annual: gross * 12, tax: 0, net: gross, effectiveRate: 0, note: "UAE has no personal income tax." };
  }

  if (country === "us") {
    const annual    = gross; // input is annual
    const annualTax = calcUSTax(annual);
    const fica      = Math.min(annual, 168_600) * 0.0765; // SS + Medicare 7.65%
    const totalTax  = annualTax + fica;
    const net       = annual - totalTax;
    return { monthly: annual / 12, annual, tax: totalTax / 12, net: net / 12, effectiveRate: (totalTax / annual) * 100, note: "Federal tax + FICA (7.65%). State tax not included." };
  }

  if (country === "uk") {
    const annual    = gross;
    const annualTax = calcUKTax(annual);
    const ni        = Math.max(0, (Math.min(annual, 50_270) - 12_570) * 0.08 + Math.max(0, annual - 50_270) * 0.02);
    const totalTax  = annualTax + ni;
    const net       = annual - totalTax;
    return { monthly: annual / 12, annual, tax: totalTax / 12, net: net / 12, effectiveRate: (totalTax / annual) * 100, note: "Income tax + National Insurance (Class 1, employee)." };
  }

  if (country === "in") {
    // India new tax regime 2024-25 (simplified)
    const annual = gross;
    const slabs  = [
      { max: 300_000,    base: 0,        rate: 0,    over: 0 },
      { max: 700_000,    base: 0,        rate: 0.05, over: 300_000 },
      { max: 1_000_000,  base: 20_000,   rate: 0.10, over: 700_000 },
      { max: 1_200_000,  base: 50_000,   rate: 0.15, over: 1_000_000 },
      { max: 1_500_000,  base: 80_000,   rate: 0.20, over: 1_200_000 },
      { max: Infinity,   base: 140_000,  rate: 0.30, over: 1_500_000 },
    ];
    const slab      = slabs.find(s => annual <= s.max) || slabs[slabs.length - 1];
    let   annualTax = slab.base + (annual - slab.over) * slab.rate;
    // Rebate under 87A (new regime: up to 7L)
    if (annual <= 700_000) annualTax = 0;
    const net       = annual - annualTax;
    return { monthly: annual / 12, annual, tax: annualTax / 12, net: net / 12, effectiveRate: (annualTax / annual) * 100, note: "New tax regime 2024-25. Rebate u/s 87A applied." };
  }

  return null;
}

export default function SalaryClient() {
  const [countryId, setCountryId] = useState("pk");
  const [grossStr,  setGrossStr]  = useState("");

  const country = COUNTRIES.find(c => c.id === countryId);
  const gross   = parseFloat(grossStr.replace(/,/g, "")) || 0;
  const result  = useMemo(() => calcResult(countryId, gross), [countryId, gross]);

  const isMonthly = country.freq === "monthly";

  return (
    <div className="sal-root">

      {/* Country tabs */}
      <div className="sal-countries" role="tablist" aria-label="Select country">
        {COUNTRIES.map(c => (
          <button
            key={c.id}
            role="tab"
            aria-selected={countryId === c.id}
            className={countryId === c.id ? "sal-country active" : "sal-country"}
            onClick={() => { setCountryId(c.id); setGrossStr(""); }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="sal-input-wrap">
        <label className="sal-label" htmlFor="sal-input">
          {isMonthly ? "Gross Monthly Salary" : "Gross Annual Salary"} ({country.currency})
        </label>
        <div className="sal-input-row">
          <span className="sal-symbol">{country.symbol}</span>
          <input
            id="sal-input"
            type="number"
            min="0"
            value={grossStr}
            onChange={e => setGrossStr(e.target.value)}
            placeholder={country.placeholder}
            className="sal-input"
          />
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="sal-result" aria-live="polite">
          <div className="sal-result-grid">
            <div className="sal-stat sal-stat--gross">
              <span className="sal-stat-label">{isMonthly ? "Gross Monthly" : "Gross Annual"}</span>
              <strong>{fmt(isMonthly ? result.monthly : result.annual, country.symbol)}</strong>
            </div>
            <div className="sal-stat sal-stat--tax">
              <span className="sal-stat-label">Tax Deduction{result.effectiveRate > 0 ? ` (${result.effectiveRate.toFixed(1)}%)` : ""}</span>
              <strong>{result.tax > 0 ? "−" + fmt(isMonthly ? result.tax : result.tax * 12, country.symbol) : fmt(0, country.symbol)}</strong>
            </div>
            <div className="sal-stat sal-stat--net">
              <span className="sal-stat-label">{isMonthly ? "Monthly Take-Home" : "Annual Take-Home"}</span>
              <strong>{fmt(isMonthly ? result.net : result.net * 12, country.symbol)}</strong>
            </div>
          </div>

          {/* Monthly / Annual toggle breakdown */}
          <div className="sal-breakdown">
            <div className="sal-breakdown-row">
              <span>Monthly Gross</span><span>{fmt(result.monthly, country.symbol)}</span>
            </div>
            <div className="sal-breakdown-row">
              <span>Monthly Tax</span><span style={{ color: "#ef4444" }}>−{fmt(result.tax, country.symbol)}</span>
            </div>
            <div className="sal-breakdown-row sal-breakdown-total">
              <span>Monthly Net</span><span style={{ color: "#10b981" }}>{fmt(result.net, country.symbol)}</span>
            </div>
            <div className="sal-breakdown-row">
              <span>Annual Gross</span><span>{fmt(result.annual, country.symbol)}</span>
            </div>
            <div className="sal-breakdown-row">
              <span>Annual Tax</span><span style={{ color: "#ef4444" }}>−{fmt(result.tax * 12, country.symbol)}</span>
            </div>
            <div className="sal-breakdown-row sal-breakdown-total">
              <span>Annual Net</span><span style={{ color: "#10b981" }}>{fmt(result.net * 12, country.symbol)}</span>
            </div>
          </div>

          {result.effectiveRate >= 0 && (
            <div className="sal-rate-bar-wrap">
              <div className="sal-rate-bar-labels">
                <span>Take-Home {(100 - result.effectiveRate).toFixed(1)}%</span>
                <span>Tax {result.effectiveRate.toFixed(1)}%</span>
              </div>
              <div className="sal-rate-bar" role="img" aria-label={`${(100 - result.effectiveRate).toFixed(1)}% take-home, ${result.effectiveRate.toFixed(1)}% tax`}>
                <div className="sal-rate-bar-net" style={{ width: `${100 - result.effectiveRate}%` }} />
                <div className="sal-rate-bar-tax" style={{ width: `${result.effectiveRate}%` }} />
              </div>
            </div>
          )}

          {result.note && <p className="sal-note">ℹ️ {result.note}</p>}
        </div>
      )}

      {/* Pakistan tax slab reference */}
      {countryId === "pk" && (
        <details className="sal-slab-details">
          <summary className="sal-slab-summary">Pakistan FBR Tax Slabs 2024-25</summary>
          <table className="sal-table">
            <thead><tr><th>Annual Income (PKR)</th><th>Tax</th></tr></thead>
            <tbody>
              {[
                ["Up to 6,00,000",          "0%"],
                ["6,00,001 – 12,00,000",    "5% on amount above 6,00,000"],
                ["12,00,001 – 24,00,000",   "Rs. 30,000 + 15% above 12,00,000"],
                ["24,00,001 – 36,00,000",   "Rs. 2,10,000 + 25% above 24,00,000"],
                ["36,00,001 – 60,00,000",   "Rs. 5,10,000 + 30% above 36,00,000"],
                ["Above 60,00,000",         "Rs. 12,30,000 + 35% above 60,00,000"],
              ].map(([range, tax]) => (
                <tr key={range}><td>{range}</td><td>{tax}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {/* Related tools */}
      <div className="sal-related">
        <span>Related: </span>
        <Link href="/tools/finance/zakat-calculator">Zakat Calculator</Link>
        <Link href="/tools/finance/loan-emi-calculator">Loan/EMI Calculator</Link>
        <Link href="/tools/education/cgpa-calculator">CGPA Calculator</Link>
        <Link href="/tools">All Tools →</Link>
      </div>

      <style>{`
        .sal-root { max-width: 700px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        .sal-countries { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.75rem; }
        .sal-country { padding: 0.45rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px; background: #fff; cursor: pointer; font-size: 0.875rem; color: #475569; transition: all 0.15s; }
        .sal-country.active { border-color: #6366f1; background: #eef2ff; color: #6366f1; font-weight: 600; }
        .sal-label { display: block; font-size: 0.875rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; }
        .sal-input-row { display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden; transition: border-color 0.15s; }
        .sal-input-row:focus-within { border-color: #6366f1; }
        .sal-symbol { padding: 0 0.875rem; background: #f8fafc; color: #64748b; font-size: 0.9rem; font-weight: 600; border-right: 1px solid #e2e8f0; white-space: nowrap; }
        .sal-input { border: none; padding: 0.75rem 1rem; font-size: 1.1rem; width: 100%; color: #0f172a; outline: none; background: #fff; }
        .sal-result { margin-top: 2rem; }
        .sal-result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .sal-stat { border-radius: 12px; padding: 1.1rem 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .sal-stat--gross { background: #f1f5f9; }
        .sal-stat--tax   { background: #fff5f5; }
        .sal-stat--net   { background: #f0fdf4; }
        .sal-stat-label  { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
        .sal-stat strong { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
        .sal-stat--tax strong { color: #ef4444; }
        .sal-stat--net strong { color: #10b981; }
        .sal-breakdown { background: #f8fafc; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
        .sal-breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; font-size: 0.875rem; color: #475569; border-bottom: 1px solid #f1f5f9; }
        .sal-breakdown-total { font-weight: 700; color: #0f172a; border-bottom: none; padding-top: 0.6rem; }
        .sal-rate-bar-wrap { margin-bottom: 1.25rem; }
        .sal-rate-bar-labels { display: flex; justify-content: space-between; font-size: 0.78rem; color: #64748b; margin-bottom: 0.4rem; }
        .sal-rate-bar { display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: #f1f5f9; }
        .sal-rate-bar-net { background: #10b981; transition: width 0.4s; }
        .sal-rate-bar-tax { background: #ef4444; transition: width 0.4s; }
        .sal-note { font-size: 0.8rem; color: #94a3b8; background: #f8fafc; border-radius: 6px; padding: 0.5rem 0.75rem; margin-top: 0.5rem; }
        .sal-slab-details { margin-top: 2rem; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
        .sal-slab-summary { cursor: pointer; padding: 0.875rem 1rem; font-size: 0.9rem; font-weight: 600; color: #0f172a; background: #f8fafc; }
        .sal-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .sal-table th { background: #f1f5f9; color: #475569; font-weight: 600; padding: 0.6rem 1rem; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .sal-table td { padding: 0.5rem 1rem; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
        .sal-related { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.875rem; align-items: center; }
        .sal-related span { color: #94a3b8; }
        .sal-related a { color: #6366f1; text-decoration: none; }
        .sal-related a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
