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
.lp-root {
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

/* Decorative background */
.lp-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 10% 20%, rgba(245,158,11,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 90% 80%, rgba(15,23,42,0.04) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

/* dot grid */
.lp-root::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.lp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: clamp(28px,4vh,40px) clamp(24px,5vw,36px);
  box-shadow: 0 8px 40px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04);
  animation: lp-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
}

@keyframes lp-enter {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

/* ── Header ── */
.lp-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  margin-bottom: 24px;
  width: fit-content;
}
.lp-back:hover { background: #fff; color: #0f172a; border-color: #cbd5e1; }
.lp-back svg  { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.5; fill: none; }

.lp-brand {
  text-align: center;
  margin-bottom: 8px;
}
.lp-brand-logo {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.8rem,5vw,2.4rem);
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  display: block;
  line-height: 1;
  margin-bottom: 6px;
}
.lp-brand-logo span { color: #f59e0b; }

.lp-brand-sub {
  font-size: 0.88rem;
  color: #64748b;
  font-weight: 500;
}
.lp-name-hi {
  color: #d97706;
  font-weight: 800;
  animation: lp-fadein 0.4s ease both;
}
@keyframes lp-fadein { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: none; } }

/* Eco badges */
.lp-badges {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 14px 0 24px;
}
.lp-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.58rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: border-color 0.15s, transform 0.15s;
}
.lp-badge:hover { border-color: #f59e0b; transform: translateY(-2px); }
.lp-badge svg { width: 14px; height: 14px; stroke: #f59e0b; stroke-width: 2; fill: none; }

/* Redirect notice */
.lp-redirect {
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  font-size: 0.78rem;
  font-weight: 600;
  color: #92400e;
  text-align: center;
}

/* ── Divider ── */
.lp-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}
.lp-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
.lp-divider-text { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }

/* ── Google button ── */
.lp-google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 20px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 2px 8px rgba(15,23,42,0.06);
  margin-bottom: 4px;
}
.lp-google-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(15,23,42,0.10);
  transform: translateY(-1px);
}
.lp-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.lp-google-spinner {
  width: 16px; height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: lp-spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes lp-spin { to { transform: rotate(360deg); } }

/* ── Form fields ── */
.lp-group { margin-bottom: 14px; }
.lp-label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
}
.lp-input-wrap { position: relative; }
.lp-input {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 500;
  transition: all 0.18s;
  appearance: none;
}
.lp-input::placeholder { color: #94a3b8; font-weight: 400; }
.lp-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
}
.lp-input--error { border-color: #ef4444 !important; }
.lp-input--error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }

.lp-eye {
  position: absolute;
  right: 8px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  padding: 6px; border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.lp-eye:hover { color: #0f172a; background: #f1f5f9; }

.lp-error-text {
  display: block;
  margin-top: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #ef4444;
  animation: lp-fadein 0.2s ease;
}

/* Remember me */
.lp-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 20px;
  cursor: pointer;
  user-select: none;
}
.lp-remember input { position: absolute; opacity: 0; width: 0; height: 0; }
.lp-checkbox {
  width: 18px; height: 18px;
  border: 1.5px solid #cbd5e1;
  border-radius: 5px;
  background: #f8fafc;
  position: relative;
  flex-shrink: 0;
  transition: all 0.15s;
}
.lp-remember input:checked ~ .lp-checkbox {
  background: #f59e0b;
  border-color: #f59e0b;
}
.lp-remember input:checked ~ .lp-checkbox::after {
  content: '';
  position: absolute;
  left: 4px; top: 1px;
  width: 5px; height: 9px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}
.lp-remember-label { font-size: 0.78rem; font-weight: 600; color: #475569; }

/* ── Submit button ── */
.lp-submit {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: #f59e0b;
  color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(245,158,11,0.32);
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.lp-submit:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245,158,11,0.42);
}
.lp-submit:active:not(:disabled) { transform: translateY(1px); }
.lp-submit:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; }

/* ── Bottom links ── */
.lp-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  flex-wrap: wrap;
  gap: 8px;
}
.lp-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: color 0.15s;
}
.lp-link span { color: #d97706; font-weight: 700; }
.lp-link:hover { color: #0f172a; }
.lp-link:hover span { text-decoration: underline; }

/* ── Error message box ── */
.lp-msg {
  margin-top: 14px;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  animation: lp-fadein 0.3s ease;
}

@media (max-width: 400px) {
  .lp-links { justify-content: center; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-card, .lp-name-hi { animation: none; }
}
`;

export default function LoginClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const prefillEmail = searchParams.get("email") || "";
  const redirectTo   = searchParams.get("redirect") || null;
  const oauthError   = searchParams.get("error");
  const adminEmail   = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();

  const [email,           setEmail]           = useState(prefillEmail);
  const [password,        setPassword]        = useState("");
  const [userName,        setUserName]        = useState("");
  const [userExists,      setUserExists]      = useState(null);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState("");
  const [rememberMe,      setRememberMe]      = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [googleLoading,   setGoogleLoading]   = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);
  const [msg,             setMsg]             = useState(
    oauthError ? "Google sign-in failed. Please try again." : ""
  );

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("aidla_remembered_email");
    if (saved && !prefillEmail) { setEmail(saved); setRememberMe(true); }
  }, [prefillEmail]);

  // Real-time user check
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
          setUserExists(true);
          setUserNotFoundMsg("");
        } else {
          setUserName(""); setUserExists(false);
          setUserNotFoundMsg("No account found. Please create an account first.");
        }
      } catch (err) { console.error(err); }
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [email]);

  // ── Google OAuth ──
  async function handleGoogle() {
    setGoogleLoading(true); setMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch {
      setMsg("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  // ── Email/password login ──
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
      let destination;
      if (redirectTo) {
        destination = (redirectTo.startsWith("/admin") && !isAdmin) ? "/user" : redirectTo;
      } else {
        destination = isAdmin ? "/admin" : "/user";
      }
      router.replace(destination);
    } catch (err) {
      setMsg(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  const isDisabled = loading || !password.trim() || userExists !== true;

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">
        <div className="lp-card">

          {/* Back */}
          <Link href="/" className="lp-back">
            <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>

          {/* Brand */}
          <div className="lp-brand">
            <span className="lp-brand-logo">AID<span>L</span>A</span>
            <p className="lp-brand-sub">
              Welcome back{userName ? <span className="lp-name-hi">, {userName} 👋</span> : ""}
            </p>
          </div>

          {/* Eco badges */}
          <div className="lp-badges" aria-hidden="true">
            {[
              { label: "Learn", path: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
              { label: "Mine",  path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { label: "Earn",  path: "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6" },
              { label: "Shop",  path: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0" },
            ].map((b) => (
              <div key={b.label} className="lp-badge">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={b.path}/></svg>
                {b.label}
              </div>
            ))}
          </div>

          {/* Redirect notice */}
          {redirectTo && (
            <div className="lp-redirect" role="status">
              🔐 Login required to access <strong>{redirectTo}</strong>
            </div>
          )}

          {/* Google button */}
          <button
            type="button"
            className="lp-google-btn"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            aria-label="Continue with Google"
          >
            {googleLoading
              ? <><div className="lp-google-spinner" aria-hidden="true" /> Connecting to Google...</>
              : <><GoogleIcon /> Continue with Google</>
            }
          </button>

          {/* Divider */}
          <div className="lp-divider" aria-hidden="true">
            <div className="lp-divider-line" />
            <span className="lp-divider-text">or sign in with email</span>
            <div className="lp-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate>
            <div className="lp-group">
              <label htmlFor="lp-email" className="lp-label">Email Address</label>
              <input
                id="lp-email"
                className={`lp-input${userNotFoundMsg ? " lp-input--error" : ""}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                aria-describedby={userNotFoundMsg ? "lp-email-err" : undefined}
              />
              {userNotFoundMsg && <span id="lp-email-err" className="lp-error-text" role="alert">{userNotFoundMsg}</span>}
            </div>

            <div className="lp-group">
              <label htmlFor="lp-password" className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="lp-password"
                  className="lp-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button type="button" className="lp-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? "Hide" : "Show"}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <label className="lp-remember">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} aria-label="Remember me" />
              <div className="lp-checkbox" aria-hidden="true" />
              <span className="lp-remember-label">Remember me</span>
            </label>

            <button type="submit" className="lp-submit" disabled={isDisabled} aria-busy={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>

            <div className="lp-links">
              <Link href="/forgot-password" className="lp-link">Forgot password?</Link>
              <Link href="/signup" className="lp-link">New here? <span>Create account</span></Link>
            </div>

            {msg && <div className="lp-msg" role="alert">{msg}</div>}
          </form>

        </div>
      </div>
    </>
  );
}