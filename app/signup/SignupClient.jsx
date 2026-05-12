"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const CSS = `
/* ═══════════════════════════════════════
   PAGE
═══════════════════════════════════════ */
.sn-pg {
  position: fixed; inset: 0;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(10px,2vh,24px) 16px clamp(14px,3vh,32px);
  z-index: 9999;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.sn-pg::before {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none; z-index: 0;
}
.sn-pg::after {
  content: '';
  position: fixed;
  width: 560px; height: 560px;
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 68%);
  pointer-events: none; z-index: 0;
}

/* ═══════════════════════════════════════
   LAPTOP ASSEMBLY
═══════════════════════════════════════ */
.sn-lt {
  position: relative; z-index: 1;
  width: 100%;
  max-width: 420px;
  animation: sn-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes sn-enter {
  from { opacity:0; transform: translateY(18px) scale(0.97); }
  to   { opacity:1; transform: none; }
}

/* Bezel */
.sn-bezel {
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border-radius: 14px 14px 0 0;
  padding: 8px 8px 0;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.07),
    0 28px 64px rgba(15,23,42,0.52),
    0 8px 20px rgba(15,23,42,0.32),
    inset 0 1px 0 rgba(255,255,255,0.1);
}

/* Camera */
.sn-cam {
  display: block;
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.06);
  margin: 2px auto 5px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
}

/* Screen */
.sn-screen {
  background: #ffffff;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

/* Content inside */
.sn-content {
  padding: 14px 16px 12px;
}

/* ─── Top bar ─── */
.sn-top-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 9px;
}
.sn-back {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
  color: #475569; font-size: 0.68rem; font-weight: 700;
  text-decoration: none; white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.sn-back svg { width: 10px; height: 10px; stroke: currentColor; stroke-width: 2.5; fill: none; }
.sn-back:hover { background: #fff; color: #0f172a; border-color: #cbd5e1; }

.sn-brand { text-align: right; line-height: 1; }
.sn-logo {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.12rem; font-weight: 900;
  color: #0f172a; letter-spacing: -0.04em; line-height: 1;
}
.sn-logo span { color: #f59e0b; }
.sn-logo-sub {
  display: block; font-size: 0.52rem; font-weight: 700;
  color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px;
}

/* ─── Subtitle ─── */
.sn-subtitle {
  margin: 0 0 8px;
  font-size: 0.78rem; font-weight: 600; color: #475569;
  text-align: center;
}
.sn-subtitle span { color: #d97706; font-weight: 800; }

/* ─── Google button ─── */
.sn-google {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 14px;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.84rem; font-weight: 700; color: #0f172a;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 2px 6px rgba(15,23,42,0.06);
}
.sn-google:hover:not(:disabled) {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15,23,42,0.1);
  transform: translateY(-1px);
}
.sn-google:disabled { opacity: 0.6; cursor: not-allowed; }
.sn-spin {
  width: 13px; height: 13px;
  border: 2px solid #e2e8f0; border-top-color: #f59e0b;
  border-radius: 50%; animation: sn-spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes sn-spin { to { transform: rotate(360deg); } }

/* ─── Divider ─── */
.sn-divider {
  display: flex; align-items: center; gap: 8px;
  margin: 8px 0;
}
.sn-div-line { flex: 1; height: 1px; background: #e2e8f0; }
.sn-div-text {
  font-size: 0.58rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
}

/* ─── Form ─── */
.sn-group { margin-bottom: 7px; }
.sn-label {
  display: flex; justify-content: space-between;
  margin-bottom: 3px; font-size: 0.65rem; font-weight: 700; color: #334155;
}
.sn-label-opt { color: #94a3b8; font-weight: 500; font-size: 0.6rem; }
.sn-input-wrap { position: relative; }
.sn-input {
  width: 100%; padding: 7px 11px;
  border-radius: 7px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; color: #0f172a;
  font-size: 16px;
  font-family: 'DM Sans', system-ui, sans-serif; font-weight: 500;
  transition: all 0.18s;
  -webkit-appearance: none; appearance: none;
}
.sn-input::placeholder { color: #94a3b8; font-weight: 400; }
.sn-input:focus {
  outline: none; background: #fff;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
}
.sn-input-err { border-color: #ef4444 !important; }
.sn-input-err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }

.sn-eye {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; padding: 4px; border-radius: 4px;
  transition: color 0.15s;
}
.sn-eye:hover { color: #0f172a; }

.sn-err { display: block; margin-top: 2px; font-size: 0.6rem; font-weight: 600; color: #ef4444; animation: sn-fadein 0.2s ease; }
@keyframes sn-fadein { from { opacity:0; transform: translateY(-3px); } to { opacity:1; transform: none; } }
.sn-req { color: #ef4444; margin-left: 2px; font-weight: 800; }

/* 2-column password row */
.sn-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-bottom: 4px;
}

/* Password strength bar */
.sn-strength { display: flex; gap: 3px; margin-top: 3px; height: 2px; border-radius: 2px; overflow: hidden; }
.sn-strength-seg { flex: 1; background: #e2e8f0; border-radius: 2px; transition: background 0.3s; }
.sn-s1 { background: #ef4444; }
.sn-s2 { background: #f59e0b; }
.sn-s3 { background: #3b82f6; }
.sn-s4 { background: #10b981; }

/* ─── Submit ─── */
.sn-submit {
  width: 100%; padding: 10px; border-radius: 10px; border: none;
  background: #f59e0b; color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.88rem; font-weight: 800;
  cursor: pointer; margin-top: 6px;
  box-shadow: 0 4px 14px rgba(245,158,11,0.3);
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.sn-submit:hover:not(:disabled) {
  background: #d97706; transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(245,158,11,0.4);
}
.sn-submit:active:not(:disabled) { transform: translateY(1px); }
.sn-submit:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; }

/* ─── Switch link ─── */
.sn-switch {
  display: block; text-align: center; margin-top: 8px;
  font-size: 0.66rem; font-weight: 600; color: #64748b;
  text-decoration: none; transition: color 0.15s;
}
.sn-switch span { color: #d97706; font-weight: 700; }
.sn-switch:hover span { text-decoration: underline; }

/* ═══════════════════════════════════════
   KEYBOARD BASE
═══════════════════════════════════════ */
.sn-keyboard {
  background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%);
  border-radius: 0 0 5px 5px;
  height: 20px; margin: 0 -2px;
  position: relative;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.sn-trackpad {
  position: absolute;
  bottom: 3px; left: 50%; transform: translateX(-50%);
  width: 52px; height: 11px; border-radius: 2px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
}
.sn-foot {
  height: 6px;
  background: linear-gradient(to bottom, #0f172a, #080e18);
  border-radius: 0 0 8px 8px;
  margin: 0 clamp(12px,5%,24px);
  box-shadow: 0 6px 18px rgba(15,23,42,0.45);
}

.sn-tagline {
  margin-top: 13px; font-size: 0.62rem; font-weight: 700;
  color: rgba(15,23,42,0.38); letter-spacing: 0.09em;
  text-transform: uppercase; position: relative; z-index: 1; text-align: center;
}

/* ═══════════════════════════════════════
   SUCCESS MODAL
═══════════════════════════════════════ */
.sn-modal-bg {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(15,23,42,0.55);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: sn-fadein 0.3s ease;
}
.sn-modal {
  background: #fff; border-radius: 20px; padding: 28px 24px;
  width: 100%; max-width: 340px; text-align: center;
  box-shadow: 0 24px 48px rgba(15,23,42,0.22);
  animation: sn-modal-in 0.4s cubic-bezier(0.16,1,0.3,1);
}
@keyframes sn-modal-in {
  from { opacity:0; transform: scale(0.94) translateY(10px); }
  to   { opacity:1; transform: none; }
}
.sn-modal-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg,#d1fae5,#a7f3d0);
  color: #059669;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 4px 12px rgba(5,150,105,0.15);
}
.sn-modal-icon svg { width: 26px; height: 26px; stroke-width: 2.5; }
.sn-modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem; font-weight: 900; color: #0f172a; margin: 0 0 7px;
}
.sn-modal-desc { color: #64748b; font-size: 0.82rem; line-height: 1.6; margin: 0 0 18px; }
.sn-modal-gmail {
  width: 100%; padding: 11px; border-radius: 9px; border: none;
  background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff;
  font-family: 'DM Sans',sans-serif; font-size: 0.88rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  cursor: pointer; margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(220,38,38,0.25);
  transition: all 0.18s;
}
.sn-modal-gmail:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(220,38,38,0.35); }
.sn-modal-login {
  width: 100%; padding: 11px; border-radius: 9px;
  border: 1.5px solid #e2e8f0; background: #fff; color: #334155;
  font-family: 'DM Sans',sans-serif; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.sn-modal-login:hover { background: #f8fafc; border-color: #cbd5e1; }
.sn-modal-timer { margin-top: 12px; font-size: 0.7rem; color: #94a3b8; }

@media (max-width: 380px) {
  .sn-content { padding: 12px 12px 10px; }
  .sn-two-col { grid-template-columns: 1fr; gap: 7px; }
}
@media (prefers-reduced-motion: reduce) {
  .sn-lt { animation: none; }
  .sn-modal { animation: none; }
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
  const [nameTouched,      setNameTouched]      = useState(false);
  const [emailTouched,     setEmailTouched]     = useState(false);

  useEffect(() => {
    if (!nameTouched) return;
    setNameError(fullName.trim() ? "" : "Full name is required");
  }, [fullName, nameTouched]);

  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailFmtError(emailTouched ? "Email address is required" : "");
      setEmailError("");
      return;
    }
    if (!regex.test(email)) { setEmailFmtError("Please enter a valid email"); return; }
    setEmailFmtError("");
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.from("users_profiles").select("email").eq("email", email.toLowerCase()).maybeSingle();
        setEmailError(data ? "Email already registered. Please login." : "");
      } catch (err) { console.error(err); }
    }, 500);
    return () => clearTimeout(t);
  }, [email, emailTouched]);

  useEffect(() => {
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 7) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(Math.min(s, 4));
  }, [password]);

  useEffect(() => {
    setPasswordMismatch(!!(confirmPassword && password !== confirmPassword));
  }, [password, confirmPassword]);

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

  useEffect(() => {
    if (!showModal) return;
    if (countdown === 0) { router.push("/login"); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [showModal, countdown, router]);

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

  async function onSubmit(e) {
    e.preventDefault();
    setNameTouched(true);
    setEmailTouched(true);
    if (!fullName.trim()) { setNameError("Full name is required"); return; }
    if (!email.trim()) { setEmailFmtError("Email address is required"); return; }
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

  const strengthClass = ["", "sn-s1", "sn-s2", "sn-s3", "sn-s4"][strength] || "";

  return (
    <>
      <style>{CSS}</style>
      <div className="sn-pg">

        {/* ── Laptop assembly ── */}
        <div className="sn-lt">

          {/* Bezel */}
          <div className="sn-bezel">
            <div className="sn-cam" aria-hidden="true" />

            {/* White screen */}
            <div className="sn-screen">
              <div className="sn-content">

                {/* Top bar */}
                <div className="sn-top-bar">
                  <Link href="/" className="sn-back" aria-label="Back to home">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </Link>
                  <div className="sn-brand">
                    <span className="sn-logo">AID<span>L</span>A</span>
                    <span className="sn-logo-sub">Create Account</span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="sn-subtitle">
                  Join <span>Pakistan's #1</span> AI powered learning platform
                </p>

                {/* Google */}
                <button
                  type="button"
                  className="sn-google"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  aria-label="Sign up with Google"
                >
                  {googleLoading
                    ? <><div className="sn-spin" aria-hidden="true" /> Connecting…</>
                    : <><GoogleIcon /> Continue with Google</>
                  }
                </button>

                {/* Divider */}
                <div className="sn-divider" aria-hidden="true">
                  <div className="sn-div-line" />
                  <span className="sn-div-text">or sign up with email</span>
                  <div className="sn-div-line" />
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} noValidate>

                  {/* Full name */}
                  <div className="sn-group">
                    <label className="sn-label">
                      Full Name <span className="sn-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      className={`sn-input${nameError ? " sn-input-err" : ""}`}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onBlur={() => setNameTouched(true)}
                      placeholder="Your full name"
                      required
                      aria-required="true"
                    />
                    {nameError && <span className="sn-err" role="alert">{nameError}</span>}
                  </div>

                  {/* Email */}
                  <div className="sn-group">
                    <label className="sn-label">
                      Email Address <span className="sn-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      className={`sn-input${emailFmtError || emailError ? " sn-input-err" : ""}`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      type="email"
                      placeholder="name@example.com"
                      required
                      aria-required="true"
                    />
                    {emailFmtError && <span className="sn-err">{emailFmtError}</span>}
                    {!emailFmtError && emailError && <span className="sn-err">{emailError}</span>}
                  </div>

                  {/* Referral code */}
                  <div className="sn-group">
                    <label className="sn-label">
                      Referral Code
                      <span className="sn-label-opt">(Optional)</span>
                    </label>
                    <input
                      className={`sn-input${refCodeError ? " sn-input-err" : ""}`}
                      value={refCode}
                      onChange={e => setRefCode(e.target.value.toUpperCase())}
                      placeholder="AIDLA-XXXXXX"
                    />
                    {refCodeError && <span className="sn-err">{refCodeError}</span>}
                  </div>

                  {/* Password + Confirm — 2 columns */}
                  <div className="sn-two-col">
                    <div className="sn-group" style={{ marginBottom: 0 }}>
                      <label className="sn-label">Password</label>
                      <div className="sn-input-wrap">
                        <input
                          className="sn-input"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          required
                          style={{ paddingRight: 32 }}
                        />
                        <button
                          type="button"
                          className="sn-eye"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide" : "Show"}
                        >
                          {showPassword
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                      </div>
                    </div>

                    <div className="sn-group" style={{ marginBottom: 0 }}>
                      <label className="sn-label">Confirm</label>
                      <input
                        className={`sn-input${passwordMismatch ? " sn-input-err" : ""}`}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="Repeat"
                        required
                      />
                    </div>
                  </div>

                  {/* Strength bar + mismatch error */}
                  {password.length > 0 && (
                    <div className="sn-strength" aria-label={`Password strength: ${strength}/4`}>
                      {[1,2,3,4].map(l => (
                        <div key={l} className={`sn-strength-seg${strength >= l ? ` ${strengthClass}` : ""}`} />
                      ))}
                    </div>
                  )}
                  {passwordMismatch && <span className="sn-err" style={{ display:"block", marginTop:3 }}>Passwords do not match</span>}

                  <button
                    type="submit"
                    className="sn-submit"
                    disabled={isDisabled}
                    aria-busy={loading}
                  >
                    {loading ? "Creating account…" : "Create Account →"}
                  </button>

                  <Link href="/login" className="sn-switch">
                    Already have an account? <span>Sign in</span>
                  </Link>
                </form>

              </div>
            </div>
          </div>

          {/* Keyboard base */}
          <div className="sn-keyboard" aria-hidden="true">
            <div className="sn-trackpad" />
          </div>
          <div className="sn-foot" aria-hidden="true" />
        </div>

        <p className="sn-tagline" aria-hidden="true">Free forever · No subscription · Built in Pakistan for the world</p>

      </div>

      {/* ── Success modal ── */}
      {showModal && (
        <div className="sn-modal-bg" role="dialog" aria-modal="true" aria-labelledby="sn-modal-title">
          <div className="sn-modal">
            <div className="sn-modal-icon" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 id="sn-modal-title" className="sn-modal-title">Check Your Email</h2>
            <p className="sn-modal-desc">
              We sent a verification link to<br /><strong>{email}</strong>
            </p>
            <button onClick={handleOpenGmail} className="sn-modal-gmail">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"/>
                <path d="M2.5 7L11.2929 13.5964C11.7071 13.9071 12.2929 13.9071 12.7071 13.5964L21.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open Gmail
            </button>
            <button onClick={() => router.push("/login")} className="sn-modal-login">
              Continue to Login
            </button>
            <p className="sn-modal-timer">Redirecting in {countdown}s…</p>
          </div>
        </div>
      )}
    </>
  );
}
