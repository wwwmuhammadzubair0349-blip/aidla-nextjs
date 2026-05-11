"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ── Google SVG icon ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const CSS = `
.sp-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: #ffffff;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'DM Sans', system-ui, sans-serif;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px,3vh,32px) clamp(16px,4vw,24px);
  -webkit-font-smoothing: antialiased;
}
.sp-root::before {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 90% 10%, rgba(245,158,11,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 10% 90%, rgba(15,23,42,0.04) 0%, transparent 60%);
  pointer-events: none; z-index: 0;
}
.sp-root::after {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none; z-index: 0;
}

.sp-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: clamp(24px,4vh,36px) clamp(24px,5vw,36px);
  box-shadow: 0 8px 40px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04);
  animation: sp-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes sp-enter {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}

.sp-back {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  color: #475569; font-size: 0.78rem; font-weight: 700;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  margin-bottom: 20px; width: fit-content;
}
.sp-back:hover { background: #fff; color: #0f172a; border-color: #cbd5e1; }
.sp-back svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.5; fill: none; }

.sp-brand { text-align: center; margin-bottom: 6px; }
.sp-brand-logo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.8rem,5vw,2.4rem);
  font-weight: 900; color: #0f172a;
  letter-spacing: -0.04em; display: block; line-height: 1; margin-bottom: 4px;
}
.sp-brand-logo span { color: #f59e0b; }
.sp-brand-sub { font-size: 0.82rem; color: #64748b; font-weight: 500; }

.sp-badges {
  display: flex; justify-content: center; gap: 6px; margin: 12px 0 20px;
}
.sp-badge {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 6px 10px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  font-size: 0.58rem; font-weight: 800; color: #475569;
  text-transform: uppercase; letter-spacing: 0.04em;
  transition: border-color 0.15s, transform 0.15s;
}
.sp-badge:hover { border-color: #f59e0b; transform: translateY(-2px); }
.sp-badge svg { width: 14px; height: 14px; stroke: #f59e0b; stroke-width: 2; fill: none; }

/* Google button */
.sp-google-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 13px 20px;
  background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.92rem; font-weight: 700; color: #0f172a;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 2px 8px rgba(15,23,42,0.06);
  margin-bottom: 4px;
}
.sp-google-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(15,23,42,0.10);
  transform: translateY(-1px);
}
.sp-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.sp-google-note { text-align: center; font-size: 0.68rem; color: #94a3b8; font-weight: 500; margin-bottom: 2px; }
.sp-spinner {
  width: 16px; height: 16px;
  border: 2px solid #e2e8f0; border-top-color: #f59e0b;
  border-radius: 50%; animation: sp-spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes sp-spin { to { transform: rotate(360deg); } }

/* Divider */
.sp-divider {
  display: flex; align-items: center; gap: 12px; margin: 18px 0;
}
.sp-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
.sp-divider-text { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }

/* Form */
.sp-group { margin-bottom: 12px; }
.sp-label {
  display: flex; justify-content: space-between;
  margin-bottom: 5px; font-size: 0.78rem; font-weight: 700; color: #334155;
}
.sp-label-opt { color: #94a3b8; font-weight: 400; }
.sp-input-wrap { position: relative; }
.sp-input {
  width: 100%; padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: #f8fafc;
  color: #0f172a; font-size: 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 500; transition: all 0.18s; appearance: none;
}
.sp-input::placeholder { color: #94a3b8; font-weight: 400; }
.sp-input:focus {
  outline: none; background: #ffffff;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
}
.sp-input--error { border-color: #ef4444 !important; }
.sp-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }

.sp-eye {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  padding: 6px; border-radius: 6px; transition: color 0.15s, background 0.15s;
}
.sp-eye:hover { color: #0f172a; background: #f1f5f9; }

.sp-error { display: block; margin-top: 3px; font-size: 0.68rem; font-weight: 600; color: #ef4444; animation: sp-fadein 0.2s ease; }
@keyframes sp-fadein { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: none; } }

/* Strength bar */
.sp-strength { display: flex; gap: 3px; margin-top: 5px; height: 3px; border-radius: 2px; overflow: hidden; }
.sp-strength-seg { flex: 1; background: #e2e8f0; transition: background 0.3s; border-radius: 2px; }
.sp-s1 { background: #ef4444; }
.sp-s2 { background: #f59e0b; }
.sp-s3 { background: #3b82f6; }
.sp-s4 { background: #10b981; }

/* Submit */
.sp-submit {
  width: 100%; padding: 12px; border-radius: 12px; border: none;
  background: #f59e0b; color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.94rem; font-weight: 800; letter-spacing: 0.02em;
  cursor: pointer; margin-top: 6px;
  box-shadow: 0 4px 16px rgba(245,158,11,0.32);
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.sp-submit:hover:not(:disabled) { background: #d97706; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.42); }
.sp-submit:active:not(:disabled) { transform: translateY(1px); }
.sp-submit:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; }

.sp-switch {
  display: block; text-align: center; margin-top: 14px;
  font-size: 0.78rem; font-weight: 600; color: #64748b; text-decoration: none; transition: color 0.15s;
}
.sp-switch span { color: #d97706; font-weight: 700; }
.sp-switch:hover span { text-decoration: underline; }

/* Success modal */
.sp-modal-bg {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: sp-fadein 0.3s ease;
}
.sp-modal {
  background: #fff; border-radius: 20px; padding: 32px 28px;
  width: 100%; max-width: 360px; text-align: center;
  box-shadow: 0 24px 48px rgba(15,23,42,0.2);
  animation: sp-modal-in 0.4s cubic-bezier(0.16,1,0.3,1);
}
@keyframes sp-modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.sp-modal-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg,#d1fae5,#a7f3d0);
  color: #059669; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; box-shadow: 0 4px 12px rgba(5,150,105,0.15);
}
.sp-modal-icon svg { width: 28px; height: 28px; stroke-width: 2.5; }
.sp-modal-title { font-family: 'Playfair Display',serif; font-size: 1.3rem; font-weight: 900; color: #0f172a; margin: 0 0 8px; }
.sp-modal-desc  { color: #64748b; font-size: 0.84rem; line-height: 1.6; margin: 0 0 22px; }
.sp-modal-gmail {
  width: 100%; padding: 12px; border-radius: 10px; border: none;
  background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff;
  font-family: 'DM Sans',sans-serif; font-size: 0.9rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(220,38,38,0.25);
  transition: all 0.18s;
}
.sp-modal-gmail:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(220,38,38,0.35); }
.sp-modal-login {
  width: 100%; padding: 12px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: #fff; color: #334155;
  font-family: 'DM Sans',sans-serif; font-size: 0.9rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.sp-modal-login:hover { background: #f8fafc; border-color: #cbd5e1; }
.sp-modal-timer { margin-top: 14px; font-size: 0.72rem; color: #94a3b8; }

@media (prefers-reduced-motion: reduce) {
  .sp-card, .sp-modal { animation: none; }
}
`;

export default function SignupClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [fullName,         setFullName]         = useState("");
  const [email,            setEmail]            = useState("");
  const [refCode,          setRefCode]          = useState(searchParams.get("ref") || "");
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [loading,          setLoading]          = useState(false);
  const [googleLoading,    setGoogleLoading]    = useState(false);
  const [nameError,        setNameError]        = useState("");
  const [emailError,       setEmailError]       = useState("");
  const [emailFmtError,    setEmailFmtError]    = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [refCodeError,     setRefCodeError]     = useState("");
  const [showPassword,     setShowPassword]     = useState(false);
  const [strength,         setStrength]         = useState(0);
  const [showModal,        setShowModal]        = useState(false);
  const [countdown,        setCountdown]        = useState(5);

  // Name validation
  useEffect(() => {
    setNameError(fullName.trim() ? "" : fullName ? "Please enter your name" : "");
  }, [fullName]);

  // Email validation + duplicate check
  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { setEmailFmtError(""); setEmailError(""); return; }
    if (!regex.test(email)) { setEmailFmtError("Please enter a valid email"); return; }
    setEmailFmtError("");
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.from("users_profiles").select("email").eq("email", email.toLowerCase()).maybeSingle();
        setEmailError(data ? "Email already registered. Please login." : "");
      } catch (err) { console.error(err); }
    }, 500);
    return () => clearTimeout(t);
  }, [email]);

  // Password strength
  useEffect(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 7) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(Math.min(s, 4));
  }, [password]);

  // Confirm password
  useEffect(() => {
    setPasswordMismatch(!!(confirmPassword && password !== confirmPassword));
  }, [password, confirmPassword]);

  // Ref code validation
  useEffect(() => {
    if (!refCode.trim()) { setRefCodeError(""); return; }
    if (!/^AIDLA-\d{6}$/.test(refCode.trim())) { setRefCodeError("Invalid format. Use AIDLA-XXXXXX"); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.from("users_profiles").select("user_id").eq("my_refer_code", refCode.trim()).maybeSingle();
        setRefCodeError(data ? "" : "Invalid or missing referral code");
      } catch { setRefCodeError("Error verifying code"); }
    }, 500);
    return () => clearTimeout(t);
  }, [refCode]);

  // Countdown timer
  useEffect(() => {
    if (!showModal) return;
    if (countdown === 0) { router.push("/login"); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [showModal, countdown, router]);

  // ── Google OAuth ──
  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch {
      alert("Google sign-up failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  // ── Gmail handler ──
  function handleOpenGmail() {
    const isIOS     = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = "googlegmail://";
      setTimeout(() => { window.location.href = "https://mail.google.com/"; }, 1500);
    } else if (isAndroid) {
      window.location.href = "intent://#Intent;package=com.google.android.gm;scheme=mailto;end;";
      setTimeout(() => { window.location.href = "https://mail.google.com/"; }, 1500);
    } else {
      window.open("https://mail.google.com/", "_blank");
    }
  }

  // ── Email signup ──
  async function onSubmit(e) {
    e.preventDefault();
    if (emailError || (refCode && refCodeError) || password !== confirmPassword || password.length < 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://www.aidla.online/email-confirmed",
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId) {
        let myReferCode = "", isUnique = false;
        while (!isUnique) {
          const n = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
          myReferCode = `AIDLA-${n}`;
          const { data: ex } = await supabase.from("users_profiles").select("user_id").eq("my_refer_code", myReferCode).maybeSingle();
          if (!ex) isUnique = true;
        }
        const { error: profileError } = await supabase.from("users_profiles").insert([{
          user_id: userId,
          full_name: fullName,
          email: email.toLowerCase(),
          referral_code_used: refCode.trim() || null,
          my_refer_code: myReferCode,
        }]);
        if (profileError) throw profileError;
      }
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || !!nameError || !!emailFmtError || !!emailError ||
    !!refCodeError || passwordMismatch || !fullName.trim() || !email.trim() || password.length < 6;

  const strengthClass = ["", "sp-s1", "sp-s2", "sp-s3", "sp-s4"][strength] || "";

  return (
    <>
      <style>{CSS}</style>
      <div className="sp-root">
        <div className="sp-card">

          <Link href="/" className="sp-back">
            <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>

          <div className="sp-brand">
            <span className="sp-brand-logo">AID<span>L</span>A</span>
            <p className="sp-brand-sub">The Ecosystem of Tomorrow</p>
          </div>

          <div className="sp-badges" aria-hidden="true">
            {[
              { label: "Learn", path: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
              { label: "Mine",  path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { label: "Earn",  path: "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6" },
              { label: "Shop",  path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" },
            ].map((b) => (
              <div key={b.label} className="sp-badge">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={b.path}/></svg>
                {b.label}
              </div>
            ))}
          </div>

          {/* Google button */}
          <button type="button" className="sp-google-btn" onClick={handleGoogle} disabled={googleLoading || loading} aria-label="Sign up with Google">
            {googleLoading
              ? <><div className="sp-spinner" aria-hidden="true" /> Connecting to Google...</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>
          <p className="sp-google-note">No email verification needed with Google</p>

          <div className="sp-divider" aria-hidden="true">
            <div className="sp-divider-line" />
            <span className="sp-divider-text">or sign up with email</span>
            <div className="sp-divider-line" />
          </div>

          <form onSubmit={onSubmit} noValidate>
            {/* Full name */}
            <div className="sp-group">
              <label className="sp-label">Full Name</label>
              <input className={`sp-input${nameError ? " sp-input--error" : ""}`} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required />
              {nameError && <span className="sp-error">{nameError}</span>}
            </div>

            {/* Email */}
            <div className="sp-group">
              <label className="sp-label">Email Address</label>
              <input className={`sp-input${emailFmtError || emailError ? " sp-input--error" : ""}`} value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@example.com" required />
              {emailFmtError && <span className="sp-error">{emailFmtError}</span>}
              {!emailFmtError && emailError && <span className="sp-error">{emailError}</span>}
            </div>

            {/* Referral */}
            <div className="sp-group">
              <label className="sp-label">
                Referral Code
                <span className="sp-label-opt">(Optional)</span>
              </label>
              <input className={`sp-input${refCodeError ? " sp-input--error" : ""}`} value={refCode} onChange={e => setRefCode(e.target.value.toUpperCase())} placeholder="AIDLA-XXXXXX" />
              {refCodeError && <span className="sp-error">{refCodeError}</span>}
            </div>

            {/* Password */}
            <div className="sp-group">
              <label className="sp-label">Password</label>
              <div className="sp-input-wrap">
                <input className="sp-input" value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Create a password" required style={{ paddingRight: 40 }} />
                <button type="button" className="sp-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {password.length > 0 && (
                <div className="sp-strength" aria-label={`Password strength: ${strength}/4`}>
                  {[1,2,3,4].map(l => (
                    <div key={l} className={`sp-strength-seg${strength >= l ? ` ${strengthClass}` : ""}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="sp-group">
              <label className="sp-label">Confirm Password</label>
              <input className={`sp-input${passwordMismatch ? " sp-input--error" : ""}`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Confirm your password" required />
              {passwordMismatch && <span className="sp-error">Passwords do not match</span>}
            </div>

            <button type="submit" className="sp-submit" disabled={isDisabled} aria-busy={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>

            <Link href="/login" className="sp-switch">
              Already have an account? <span>Sign in</span>
            </Link>
          </form>
        </div>
      </div>

      {/* Success modal */}
      {showModal && (
        <div className="sp-modal-bg" role="dialog" aria-modal="true" aria-labelledby="sp-modal-title">
          <div className="sp-modal">
            <div className="sp-modal-icon" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 id="sp-modal-title" className="sp-modal-title">Check Your Email</h2>
            <p className="sp-modal-desc">
              We sent a verification link to<br /><strong>{email}</strong>
            </p>
            <button onClick={handleOpenGmail} className="sp-modal-gmail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"/><path d="M2.5 7L11.2929 13.5964C11.7071 13.9071 12.2929 13.9071 12.7071 13.5964L21.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Open Gmail
            </button>
            <button onClick={() => router.push("/login")} className="sp-modal-login">Continue to Login</button>
            <p className="sp-modal-timer">Redirecting in {countdown}s…</p>
          </div>
        </div>
      )}
    </>
  );
}