"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Make sure this path matches your Next.js project structure

// We wrap the main form logic in a sub-component so useSearchParams() doesn't
// cause de-optimization warnings during Next.js build.
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState(searchParams.get("ref") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailFormatError, setEmailFormatError] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [refCodeError, setRefCodeError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 1) Real-Time Name Validation Check
  useEffect(() => {
    if (!fullName.trim()) {
      setNameError("Please enter your name");
    } else {
      setNameError("");
    }
  }, [fullName]);

  // 2) Real-Time Email Validation Check
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setEmailFormatError("");
      setEmailError("");
      return;
    }
    
    if (!emailRegex.test(email)) {
      setEmailFormatError("Please enter a valid email");
      return;
    }
    
    setEmailFormatError("");
    
    const checkEmail = async () => {
      try {
        const { data } = await supabase
          .from("users_profiles")
          .select("email")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (data) {
          setEmailError("This email is already registered. Please login.");
        } else {
          setEmailError("");
        }
      } catch (err) {
        console.error("Email check error:", err);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // 3) Password Strength Calculator
  useEffect(() => {
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  // 4) Real-Time Password Match Check
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  // 5) Real-Time Referral Code Validation
  useEffect(() => {
    if (!refCode.trim()) {
      setRefCodeError("");
      return;
    }

    const refCodeRegex = /^AIDLA-\d{6}$/;
    if (!refCodeRegex.test(refCode.trim())) {
      setRefCodeError("Invalid format. Use AIDLA-XXXXXX (6 digits)");
      return;
    }

    const verifyRefCode = async () => {
      try {
        const { data, error } = await supabase
          .from("users_profiles")
          .select("user_id")
          .eq("my_refer_code", refCode.trim())
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setRefCodeError("Invalid code or does not exist");
        } else {
          setRefCodeError("");
        }
      } catch (err) {
        console.error("Referral code check error:", err);
        setRefCodeError("Error verifying code");
      }
    };

    const timeoutId = setTimeout(verifyRefCode, 500);
    return () => clearTimeout(timeoutId);
  }, [refCode]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (emailError) return;

    if (refCode && refCodeError) {
      setMsg("Please enter a valid referral code");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://www.aidla.online/email-confirmed",
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;

      const userId = data.user?.id;

      if (userId) {
        let myReferCode;
        let isUnique = false;
        
        while (!isUnique) {
          const randomDigits = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
          myReferCode = `AIDLA-${randomDigits}`;
          
          const { data: existing } = await supabase
            .from("users_profiles")
            .select("user_id")
            .eq("my_refer_code", myReferCode)
            .maybeSingle();
          
          if (!existing) {
            isUnique = true;
          }
        }

        const { error: profileError } = await supabase
          .from("users_profiles")
          .insert([
            {
              user_id: userId,
              full_name: fullName,
              email: email.toLowerCase(),
              referral_code_used: refCode.trim() || null,
              my_refer_code: myReferCode,
            },
          ]);
        if (profileError) throw profileError;
      }

      setMsg("Signup successful. Check your email for confirmation, then login.");
      // Changed navigate() to router.push() for Next.js
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setMsg(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .fullscreen-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #f0f4f8;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      z-index: 99999;
      padding: 50px 20px; 
    }

    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      z-index: -1;
      animation: float 20s infinite alternate ease-in-out;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: rgba(30, 58, 138, 0.15);
      top: -100px;
      left: -100px;
    }
    .orb-2 {
      width: 300px;
      height: 300px;
      background: rgba(59, 130, 246, 0.15);
      bottom: -50px;
      right: -50px;
      animation-duration: 25s;
    }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(50px, 50px) scale(1.1); }
    }

    .card-2060 {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 1);
      border-radius: 28px;
      padding: 40px;
      box-shadow: 
        20px 20px 60px rgba(15, 23, 42, 0.08), 
        -20px -20px 60px rgba(255, 255, 255, 0.9),
        inset 0 0 0 2px rgba(255, 255, 255, 0.5);
      animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
      transform: translateY(30px) scale(0.95);
      position: relative;
    }

    @keyframes popIn {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      margin-bottom: 10px;
      background: #ffffff;
      color: #1e3a8a;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 12px;
      box-shadow: 
        4px 4px 10px rgba(15, 23, 42, 0.05), 
        -4px -4px 10px rgba(255, 255, 255, 1);
      transition: all 0.2s ease;
    }
    .back-btn:hover { color: #3b82f6; transform: translateY(-2px); }
    .back-btn:active {
      transform: translateY(1px);
      box-shadow: inset 2px 2px 5px rgba(15,23,42,0.05), inset -2px -2px 5px rgba(255,255,255,1);
    }
    .back-btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 3; fill: none; }

    .brand-header { text-align: center; margin-bottom: 30px; margin-top: 10px; }
    .brand-title {
      font-size: 3rem;
      font-weight: 900;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(2px 4px 6px rgba(30, 58, 138, 0.2));
      margin-bottom: 5px;
    }
    .brand-subtitle { font-size: 0.9rem; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }

    .eco-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 20px;
    }
    .eco-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 5px;
      background: #ffffff;
      border-radius: 14px;
      font-size: 0.65rem;
      font-weight: 700;
      color: #1e3a8a;
      box-shadow: 5px 5px 15px rgba(15, 23, 42, 0.05), -5px -5px 15px rgba(255, 255, 255, 0.8);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .eco-badge:hover { transform: translateY(-4px) scale(1.05); }
    .eco-badge svg { width: 18px; height: 18px; margin-bottom: 4px; stroke: #3b82f6; stroke-width: 2; fill: none; }

    .input-group { margin-bottom: 20px; position: relative; }
    .label-3d { display: block; margin-bottom: 8px; font-weight: 700; color: #334155; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .input-wrapper { position: relative; width: 100%; }
    .input-3d {
      width: 100%;
      padding: 16px 20px;
      border-radius: 16px;
      border: 2px solid transparent;
      background: #f8fafc;
      color: #0f172a;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: inset 5px 5px 10px rgba(15, 23, 42, 0.06), inset -5px -5px 10px rgba(255, 255, 255, 1);
      transition: all 0.3s ease;
    }
    .input-3d::placeholder { color: #cbd5e1; font-weight: 500; }
    .input-3d:focus {
      outline: none;
      background: #ffffff;
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 
        inset 2px 2px 5px rgba(15, 23, 42, 0.03), 
        inset -2px -2px 5px rgba(255, 255, 255, 1),
        0 0 15px rgba(59, 130, 246, 0.2);
    }

    .input-error { border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); }
    .error-text { color: #ef4444; font-size: 0.75rem; font-weight: 600; margin-top: 6px; display: block; animation: fadeIn 0.3s ease; }

    .eye-btn {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: #1e3a8a; }
    
    .strength-meter { display: flex; gap: 4px; margin-top: 8px; height: 4px; border-radius: 2px; overflow: hidden; }
    .strength-bar { flex: 1; background: #e2e8f0; transition: all 0.4s ease; border-radius: 2px; }
    .strength-1 { background: #ef4444; }
    .strength-2 { background: #f59e0b; }
    .strength-3 { background: #3b82f6; }
    .strength-4 { background: #10b981; }

    .btn-2060 {
      width: 100%;
      padding: 18px;
      margin-top: 10px;
      border-radius: 16px;
      border: none;
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: #ffffff;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 1px;
      cursor: pointer;
      box-shadow: 
        0 10px 0 #1e3a8a, 
        0 20px 25px rgba(30, 58, 138, 0.3),
        inset 0 2px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .btn-2060:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-2px);
      box-shadow: 0 12px 0 #1e3a8a, 0 25px 30px rgba(30, 58, 138, 0.4), inset 0 2px 0 rgba(255,255,255,0.2);
    }
    .btn-2060:active:not(:disabled) {
      transform: translateY(10px);
      box-shadow: 0 0px 0 #1e3a8a, 0 5px 10px rgba(30, 58, 138, 0.3), inset 0 2px 0 rgba(255,255,255,0.2);
    }
    .btn-2060:disabled {
      background: #94a3b8; box-shadow: 0 10px 0 #64748b; cursor: not-allowed; opacity: 0.8;
    }

    .login-link {
      display: block;
      text-align: center;
      margin-top: 25px;
      color: #64748b;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    .login-link span { color: #3b82f6; font-weight: 800; }
    .login-link:hover span { color: #1e3a8a; text-decoration: underline; }

    .msg-box {
      margin-top: 20px; padding: 16px; border-radius: 14px; text-align: center; font-weight: 700; font-size: 0.95rem;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 500px) {
      .fullscreen-wrapper { padding: 30px 15px; }
      .card-2060 { padding: 30px 20px; border-radius: 20px; }
      .brand-title { font-size: 2.4rem; }
      .input-3d { padding: 14px 16px; font-size: 0.95rem; }
      .btn-2060 { padding: 16px; font-size: 1.05rem; }
      .eco-grid { gap: 6px; }
      .eco-badge { padding: 8px 2px; font-size: 0.55rem; }
    }
  `;

  return (
    <div className="fullscreen-wrapper">
      <style>{css}</style>
      
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="card-2060">
        
        {/* Changed 'to' prop to 'href' for Next.js Link component */}
        <Link href="/" className="back-btn">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>
        
        <div className="brand-header">
          <h1 className="brand-title">AIDLA</h1>
          <p className="brand-subtitle">The Ecosystem of Tomorrow</p>
          
          <div className="eco-grid">
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              Education
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              Mining
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              Earning
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              Shop
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          
          <div className="input-group">
            <label className="label-3d">Full Name</label>
            <input
              className={`input-3d ${nameError ? 'input-error' : ''}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your name"
            />
            {nameError && <span className="error-text">{nameError}</span>}
          </div>

          <div className="input-group">
            <label className="label-3d">Email Address</label>
            <input
              className={`input-3d ${emailFormatError || emailError ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="name@example.com"
            />
            {emailFormatError && <span className="error-text">{emailFormatError}</span>}
            {!emailFormatError && emailError && <span className="error-text">{emailError}</span>}
          </div>

          <div className="input-group">
            <label className="label-3d">Referral Code <span style={{ color: "#94a3b8", textTransform: "none" }}>(Optional)</span></label>
            <input
              className={`input-3d ${refCodeError ? 'input-error' : ''}`}
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="e.g. AIDLA-123456"
            />
            {refCodeError && <span className="error-text">{refCodeError}</span>}
          </div>

          <div className="input-group">
            <label className="label-3d">Password</label>
            <div className="input-wrapper">
              <input
                className="input-3d"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a strong password"
                style={{ paddingRight: "45px" }}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className="strength-meter">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`strength-bar ${passwordStrength >= level ? `strength-${passwordStrength}` : ''}`} />
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="label-3d">Confirm Password</label>
            <input
              className={`input-3d ${passwordMismatch ? 'input-error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              placeholder="Confirm your password"
            />
            {passwordMismatch && <span className="error-text">Passwords do not match</span>}
          </div>

          <button disabled={loading || !!nameError || !!emailFormatError || !!emailError || !!refCodeError || passwordMismatch || !fullName.trim() || !email.trim()} className="btn-2060">
            {loading ? "INITIALIZING..." : "SECURE ACCOUNT"}
          </button>

          <Link href="/login" className="login-link">
            Already have an account? <span>Login</span>
          </Link>

          {msg && (
            <div
              className="msg-box"
              style={{
                color: msg.includes("successful") ? "#047857" : "#b91c1c",
                background: msg.includes("successful") ? "#d1fae5" : "#fee2e2",
                boxShadow: msg.includes("successful") ? "inset 0 0 0 2px #34d399" : "inset 0 0 0 2px #f87171"
              }}
            >
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Wrapping the main component in Suspense handles Next.js de-opt warnings for `useSearchParams()`
export default function Signup() {
  return (
    <Suspense fallback={<div style={{ width: '100vw', height: '100vh', background: '#f0f4f8' }}></div>}>
      <SignupForm />
    </Suspense>
  );
}