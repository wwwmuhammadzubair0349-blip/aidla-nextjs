"use client";
// app/login/page.jsx
// FIX 1: After login, reads ?redirect= param and pushes there instead of hardcoding /user or /admin
// FIX 2: Admin check uses NEXT_PUBLIC_ADMIN_EMAIL env var
// Everything else (UI, CSS, animations) identical to original

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const prefillEmail = searchParams.get("email") || "";
  // ── FIX: read the redirect destination set by proxy.js ──
  const redirectTo   = searchParams.get("redirect") || null;
  const adminEmail   = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();

  const [email,          setEmail]          = useState(prefillEmail);
  const [password,       setPassword]       = useState("");
  const [userName,       setUserName]       = useState("");
  const [userExists,     setUserExists]     = useState(null);
  const [userNotFoundMsg,setUserNotFoundMsg]= useState("");
  const [rememberMe,     setRememberMe]     = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [msg,            setMsg]            = useState("");
  const [showPassword,   setShowPassword]   = useState(false);

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("aidla_remembered_email");
    if (saved && !prefillEmail) { setEmail(saved); setRememberMe(true); }
  }, [prefillEmail]);

  // Real-time user existence check
  useEffect(() => {
    const check = async () => {
      if (!email || !email.includes("@")) {
        setUserName(""); setUserExists(null); setUserNotFoundMsg(""); return;
      }
      try {
        const { data } = await supabase
          .from("users_profiles")
          .select("full_name")
          .eq("email", email.toLowerCase())
          .maybeSingle();
        if (data?.full_name) {
          setUserName(data.full_name.split(" ")[0]);
          setUserExists(true); setUserNotFoundMsg("");
        } else {
          setUserName(""); setUserExists(false);
          setUserNotFoundMsg("No account found. Please create account first");
        }
      } catch (err) { console.error(err); }
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (rememberMe) localStorage.setItem("aidla_remembered_email", email);
      else            localStorage.removeItem("aidla_remembered_email");

      const userEmail = (data.user?.email || "").toLowerCase();
      const isAdmin   = userEmail === adminEmail;

      // Determine destination — honour the ?redirect= param
      let destination;
      if (redirectTo) {
        const isAdminRedirect = redirectTo.startsWith("/admin");
        destination = (isAdminRedirect && !isAdmin) ? "/user" : redirectTo;
      } else {
        destination = isAdmin ? "/admin" : "/user";
      }

      // Supabase stores the session in localStorage (not cookies).
      // router.replace() works perfectly here — no cookie flush needed.
      router.replace(destination);

    } catch (err) {
      setMsg(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .fullscreen-wrapper {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #f0f4f8; overflow-y: auto; overflow-x: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      z-index: 99999; padding: 50px 20px;
    }

    .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); z-index: -1; animation: float 20s infinite alternate ease-in-out; }
    .orb-1  { width: 400px; height: 400px; background: rgba(30,58,138,0.15); top: -100px; left: -100px; }
    .orb-2  { width: 300px; height: 300px; background: rgba(59,130,246,0.15); bottom: -50px; right: -50px; animation-duration: 25s; }
    @keyframes float { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(50px,50px) scale(1.1)} }

    .card-2060 {
      width: 100%; max-width: 480px; margin: 0 auto;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,1); border-radius: 28px; padding: 40px;
      box-shadow: 20px 20px 60px rgba(15,23,42,0.08), -20px -20px 60px rgba(255,255,255,0.9), inset 0 0 0 2px rgba(255,255,255,0.5);
      animation: popIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
      opacity: 0; transform: translateY(30px) scale(0.95); position: relative;
    }
    @keyframes popIn { to { opacity: 1; transform: translateY(0) scale(1); } }

    .back-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; margin-bottom: 10px;
      background: #fff; color: #1e3a8a; text-decoration: none; font-weight: 700; font-size: 0.85rem;
      border-radius: 12px; box-shadow: 4px 4px 10px rgba(15,23,42,0.05),-4px -4px 10px rgba(255,255,255,1);
      transition: all 0.2s ease;
    }
    .back-btn:hover { color: #3b82f6; transform: translateY(-2px); }
    .back-btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 3; fill: none; }
    .back-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; border-radius: 12px; }

    .brand-header { text-align: center; margin-bottom: 30px; margin-top: 10px; }
    .brand-title {
      font-size: 3rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(2px 4px 6px rgba(30,58,138,0.2));
    }
    .brand-subtitle { font-size: 0.95rem; color: #64748b; font-weight: 600; letter-spacing: 0.5px; transition: all 0.3s; }
    .name-highlight { color: #1e3a8a; font-weight: 800; animation: fadeInName 0.5s ease forwards; }
    @keyframes fadeInName { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

    .eco-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 20px; }
    .eco-badge {
      display: flex; flex-direction: column; align-items: center; padding: 10px 5px;
      background: #fff; border-radius: 14px; font-size: 0.65rem; font-weight: 700; color: #1e3a8a;
      box-shadow: 5px 5px 15px rgba(15,23,42,0.05),-5px -5px 15px rgba(255,255,255,0.8);
      transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
    }
    .eco-badge:hover { transform: translateY(-4px) scale(1.05); }
    .eco-badge svg { width: 18px; height: 18px; margin-bottom: 4px; stroke: #3b82f6; stroke-width: 2; fill: none; }

    .input-group { margin-bottom: 20px; position: relative; }
    .label-3d { display: block; margin-bottom: 8px; font-weight: 700; color: #334155; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .input-wrapper { position: relative; width: 100%; }

    .input-3d {
      width: 100%; padding: 16px 20px; border-radius: 16px; border: 2px solid transparent;
      background: #f8fafc; color: #0f172a; font-size: 1rem; font-weight: 600;
      box-shadow: inset 5px 5px 10px rgba(15,23,42,0.06), inset -5px -5px 10px rgba(255,255,255,1);
      transition: all 0.3s ease;
    }
    .input-3d::placeholder { color: #cbd5e1; font-weight: 500; }
    .input-3d:focus { outline: none; background: #fff; border-color: rgba(59,130,246,0.4); box-shadow: inset 2px 2px 5px rgba(15,23,42,0.03),inset -2px -2px 5px rgba(255,255,255,1),0 0 15px rgba(59,130,246,0.2); }
    .input-error { border-color: rgba(239,68,68,0.5)!important; box-shadow: 0 0 15px rgba(239,68,68,0.1)!important; }
    .error-text  { color: #ef4444; font-size: 0.75rem; font-weight: 600; margin-top: 6px; display: block; animation: fadeIn 0.3s ease; }

    .eye-btn {
      position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #94a3b8;
      display: flex; align-items: center; justify-content: center; transition: color 0.2s;
    }
    .eye-btn:hover { color: #1e3a8a; }
    .eye-btn:focus-visible { outline: 2px solid #3b82f6; outline-offset: 2px; border-radius: 4px; }

    .remember-wrapper { display: flex; align-items: center; gap: 12px; margin-top: 10px; margin-bottom: 24px; cursor: pointer; user-select: none; }
    .checkbox-3d {
      appearance: none; -webkit-appearance: none; width: 24px; height: 24px; border-radius: 8px; cursor: pointer;
      background: #f8fafc; box-shadow: inset 4px 4px 8px rgba(15,23,42,0.08),inset -4px -4px 8px rgba(255,255,255,1);
      transition: all 0.2s; position: relative; flex-shrink: 0;
    }
    .checkbox-3d:checked { background: #3b82f6; box-shadow: inset 2px 2px 5px rgba(15,23,42,0.2); }
    .checkbox-3d:checked::after { content:''; position:absolute; width:6px; height:12px; border:solid white; border-width:0 2.5px 2.5px 0; transform:rotate(45deg) translate(3px,-1px); }
    .remember-label { font-size: 0.9rem; font-weight: 600; color: #64748b; }

    .btn-2060 {
      width: 100%; padding: 18px; border-radius: 16px; border: none;
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: #fff; font-size: 1.15rem; font-weight: 800; letter-spacing: 1px; cursor: pointer;
      box-shadow: 0 10px 0 #1e3a8a, 0 20px 25px rgba(30,58,138,0.3), inset 0 2px 0 rgba(255,255,255,0.2);
      transition: all 0.15s cubic-bezier(0.4,0,0.2,1); position: relative;
    }
    .btn-2060:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 12px 0 #1e3a8a,0 25px 30px rgba(30,58,138,0.4),inset 0 2px 0 rgba(255,255,255,0.2); }
    .btn-2060:active:not(:disabled) { transform: translateY(10px); box-shadow: 0 0 0 #1e3a8a,0 5px 10px rgba(30,58,138,0.3),inset 0 2px 0 rgba(255,255,255,0.2); }
    .btn-2060:disabled { background: #94a3b8; box-shadow: 0 10px 0 #64748b; cursor: not-allowed; opacity: 0.8; }
    .btn-2060:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }

    .links-row { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; gap: 10px; flex-wrap: wrap; }
    .link-3d { color: #64748b; font-weight: 600; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
    .link-3d span { color: #3b82f6; font-weight: 800; }
    .link-3d:hover { color: #1e3a8a; }
    .link-3d:hover span { color: #1e3a8a; text-decoration: underline; }

    .msg-box { margin-top: 20px; padding: 16px; border-radius: 14px; text-align: center; font-weight: 700; font-size: 0.95rem; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }

    /* Redirect notice */
    .redirect-notice {
      margin-bottom: 16px; padding: 10px 14px; border-radius: 12px;
      background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.18);
      font-size: 0.78rem; font-weight: 600; color: #1e40af;
      display: flex; align-items: center; gap: 7px;
    }

    @media (max-width: 500px) {
      .fullscreen-wrapper { padding: 30px 15px; }
      .card-2060 { padding: 30px 20px; border-radius: 20px; }
      .brand-title { font-size: 2.4rem; }
      .input-3d { padding: 14px 16px; font-size: 0.95rem; }
      .btn-2060 { padding: 16px; font-size: 1.05rem; }
      .eco-grid { gap: 6px; }
      .eco-badge { padding: 8px 2px; font-size: 0.55rem; }
      .links-row { justify-content: center; text-align: center; gap: 15px; }
    }
  `;

  return (
    <div className="fullscreen-wrapper">
      <style>{css}</style>

      <div className="bg-orb orb-1" aria-hidden="true"/>
      <div className="bg-orb orb-2" aria-hidden="true"/>

      <div className="card-2060" role="main">
        <Link href="/" className="back-btn" aria-label="Back to home">
          <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>

        {/* Show redirect notice if coming from a protected page */}
        {redirectTo && (
          <div className="redirect-notice" role="status">
            🔐 Please log in to continue to <strong>{redirectTo}</strong>
          </div>
        )}

        <div className="brand-header">
          <h1 className="brand-title">AIDLA</h1>
          <p className="brand-subtitle">
            Welcome Back{userName ? <span className="name-highlight">, {userName}</span> : ""}
          </p>

          <div className="eco-grid" aria-hidden="true">
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Education
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              Mining
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Earning
            </div>
            <div className="eco-badge">
              <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="login-email" className="label-3d">Email Address</label>
            <input
              id="login-email"
              className={`input-3d${userNotFoundMsg ? " input-error" : ""}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              placeholder="name@example.com"
              autoComplete="email"
              aria-describedby={userNotFoundMsg ? "email-error" : undefined}
            />
            {userNotFoundMsg && <span id="email-error" className="error-text" role="alert">{userNotFoundMsg}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="login-password" className="label-3d">Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                className="input-3d"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                style={{ paddingRight:"45px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <label className="remember-wrapper">
            <input
              type="checkbox"
              className="checkbox-3d"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              aria-label="Remember me"
            />
            <span className="remember-label">Remember Me</span>
          </label>

          <button disabled={loading} className="btn-2060" type="submit" aria-busy={loading}>
            {loading ? "AUTHENTICATING…" : "SECURE LOGIN"}
          </button>

          <div className="links-row">
            <Link href="/forgot-password" className="link-3d">Forgot password?</Link>
            <Link href="/signup" className="link-3d">New here? <span>Create Account</span></Link>
          </div>

          {msg && (
            <div className="msg-box" role="alert"
              style={{ color:"#b91c1c", background:"#fee2e2", boxShadow:"inset 0 0 0 2px #f87171" }}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{ width:"100vw", height:"100vh", background:"#f0f4f8" }}/>}>
      <LoginForm />
    </Suspense>
  );
}