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
   PAGE — fixed fullscreen, yellow hero bg
═══════════════════════════════════════ */
.ln-pg {
  position: fixed; inset: 0;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 55%, #fde68a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(12px,3vh,32px) 16px clamp(20px,4vh,40px);
  z-index: 9999;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  font-family: 'DM Sans', system-ui, sans-serif;
}
/* Dot grid overlay */
.ln-pg::before {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}
/* Amber radial glow behind laptop */
.ln-pg::after {
  content: '';
  position: fixed;
  width: 560px; height: 560px;
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 68%);
  pointer-events: none;
  z-index: 0;
}

/* ═══════════════════════════════════════
   LAPTOP ASSEMBLY
═══════════════════════════════════════ */
.ln-lt {
  position: relative; z-index: 1;
  width: 100%;
  max-width: 400px;
  animation: ln-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes ln-enter {
  from { opacity:0; transform: translateY(18px) scale(0.97); }
  to   { opacity:1; transform: none; }
}

/* Dark screen bezel */
.ln-bezel {
  background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
  border-radius: 14px 14px 0 0;
  padding: 8px 8px 0;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.07),
    0 28px 64px rgba(15,23,42,0.52),
    0 8px 20px rgba(15,23,42,0.32),
    inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
}

/* Camera dot */
.ln-cam {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.06);
  margin: 2px auto 6px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.4), 0 0 4px rgba(255,255,255,0.04);
}

/* White screen */
.ln-screen {
  background: #ffffff;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

/* Form content inside screen */
.ln-content {
  padding: 16px 18px 14px;
}

/* ─── Top bar ─── */
.ln-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.ln-back {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 7px;
  color: #475569; font-size: 0.7rem; font-weight: 700;
  text-decoration: none; white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.ln-back svg { width: 11px; height: 11px; stroke: currentColor; stroke-width: 2.5; fill: none; }
.ln-back:hover { background: #fff; color: #0f172a; border-color: #cbd5e1; }

.ln-brand { text-align: right; line-height: 1; }
.ln-logo {
  display: block;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.18rem;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.ln-logo span { color: #f59e0b; }
.ln-logo-sub {
  display: block;
  font-size: 0.54rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ─── Welcome ─── */
.ln-welcome {
  margin: 0 0 10px;
  font-size: 0.86rem;
  font-weight: 600;
  color: #475569;
  text-align: center;
}
.ln-name { color: #d97706; font-weight: 800; }

/* ─── Redirect notice ─── */
.ln-redirect {
  margin-bottom: 8px; padding: 7px 10px;
  border-radius: 8px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.22);
  font-size: 0.68rem; font-weight: 600; color: #92400e;
  text-align: center;
}

/* ─── Google button ─── */
.ln-google {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px;
  background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.86rem; font-weight: 700; color: #0f172a;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 2px 6px rgba(15,23,42,0.06);
}
.ln-google:hover:not(:disabled) {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15,23,42,0.1);
  transform: translateY(-1px);
}
.ln-google:disabled { opacity: 0.6; cursor: not-allowed; }
.ln-spin {
  width: 14px; height: 14px;
  border: 2px solid #e2e8f0; border-top-color: #f59e0b;
  border-radius: 50%; animation: ln-spin 0.7s linear infinite; flex-shrink: 0;
}
@keyframes ln-spin { to { transform: rotate(360deg); } }

/* ─── Divider ─── */
.ln-divider {
  display: flex; align-items: center; gap: 8px;
  margin: 10px 0;
}
.ln-div-line { flex: 1; height: 1px; background: #e2e8f0; }
.ln-div-text {
  font-size: 0.6rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap;
}

/* ─── Form fields ─── */
.ln-group { margin-bottom: 9px; }
.ln-label {
  display: block; margin-bottom: 3px;
  font-size: 0.68rem; font-weight: 700; color: #334155;
}
.ln-input-wrap { position: relative; }
.ln-input {
  width: 100%; padding: 8px 12px;
  border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; color: #0f172a;
  font-size: 16px;
  font-family: 'DM Sans', system-ui, sans-serif; font-weight: 500;
  transition: all 0.18s;
  -webkit-appearance: none; appearance: none;
}
.ln-input::placeholder { color: #94a3b8; font-weight: 400; }
.ln-input:focus {
  outline: none; background: #fff;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.11);
}
.ln-input-err { border-color: #ef4444 !important; }
.ln-input-err:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }

.ln-eye {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; padding: 5px; border-radius: 4px;
  transition: color 0.15s;
}
.ln-eye:hover { color: #0f172a; }
.ln-err {
  display: block; margin-top: 2px;
  font-size: 0.62rem; font-weight: 600; color: #ef4444;
}

/* ─── Remember me ─── */
.ln-remember {
  display: flex; align-items: center; gap: 6px;
  margin: 6px 0 10px; cursor: pointer; user-select: none;
}
.ln-remember input { position: absolute; opacity: 0; width: 0; height: 0; }
.ln-checkbox {
  width: 14px; height: 14px;
  border: 1.5px solid #cbd5e1; border-radius: 3px;
  background: #f8fafc; position: relative; flex-shrink: 0;
  transition: all 0.15s;
}
.ln-remember input:checked ~ .ln-checkbox { background: #f59e0b; border-color: #f59e0b; }
.ln-remember input:checked ~ .ln-checkbox::after {
  content: '';
  position: absolute; left: 3px; top: 0;
  width: 4px; height: 7px;
  border: 2px solid #fff; border-top: none; border-left: none;
  transform: rotate(45deg);
}
.ln-remember-label { font-size: 0.68rem; font-weight: 600; color: #475569; }

/* ─── Submit ─── */
.ln-submit {
  width: 100%; padding: 10px; border-radius: 10px; border: none;
  background: #f59e0b; color: #0f172a;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9rem; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245,158,11,0.3);
  transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
}
.ln-submit:hover:not(:disabled) {
  background: #d97706; transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(245,158,11,0.4);
}
.ln-submit:active:not(:disabled) { transform: translateY(1px); }
.ln-submit:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; }

/* ─── Links ─── */
.ln-links {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; flex-wrap: wrap; gap: 6px;
}
.ln-link { font-size: 0.68rem; font-weight: 600; color: #64748b; text-decoration: none; transition: color 0.15s; }
.ln-link span { color: #d97706; font-weight: 700; }
.ln-link:hover { color: #0f172a; }
.ln-link:hover span { text-decoration: underline; }

/* ─── Error message ─── */
.ln-msg {
  margin-top: 8px; padding: 8px 10px;
  border-radius: 8px; font-size: 0.72rem; font-weight: 600;
  text-align: center;
  background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
  animation: ln-fadein 0.25s ease;
}
@keyframes ln-fadein { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: none; } }

/* ═══════════════════════════════════════
   KEYBOARD BASE
═══════════════════════════════════════ */
.ln-keyboard {
  background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%);
  border-radius: 0 0 5px 5px;
  height: 20px;
  margin: 0 -2px;
  position: relative;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.ln-trackpad {
  position: absolute;
  bottom: 3px; left: 50%; transform: translateX(-50%);
  width: 52px; height: 11px;
  border-radius: 2px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
}

/* Thin foot */
.ln-foot {
  height: 6px;
  background: linear-gradient(to bottom, #0f172a, #080e18);
  border-radius: 0 0 8px 8px;
  margin: 0 clamp(12px,5%,24px);
  box-shadow: 0 6px 18px rgba(15,23,42,0.45);
}

/* Tagline below */
.ln-tagline {
  margin-top: 14px;
  font-size: 0.64rem;
  font-weight: 700;
  color: rgba(15,23,42,0.38);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  position: relative; z-index: 1;
  text-align: center;
}

@media (max-width: 380px) {
  .ln-content { padding: 14px 14px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .ln-lt { animation: none; }
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

  useEffect(() => {
    const saved = localStorage.getItem("aidla_remembered_email");
    if (saved && !prefillEmail) { setEmail(saved); setRememberMe(true); }
  }, [prefillEmail]);

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
      <div className="ln-pg">

        {/* ── Laptop assembly ── */}
        <div className="ln-lt">

          {/* Bezel */}
          <div className="ln-bezel">
            <div className="ln-cam" aria-hidden="true" />

            {/* White screen */}
            <div className="ln-screen">
              <div className="ln-content">

                {/* Top bar */}
                <div className="ln-top-bar">
                  <Link href="/" className="ln-back" aria-label="Back to home">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                  </Link>
                  <div className="ln-brand">
                    <span className="ln-logo">AID<span>L</span>A</span>
                    <span className="ln-logo-sub">AI Learning</span>
                  </div>
                </div>

                {/* Welcome */}
                <p className="ln-welcome">
                  Welcome back{userName
                    ? <span className="ln-name">, {userName} 👋</span>
                    : " to AIDLA"
                  }
                </p>

                {/* Redirect notice */}
                {redirectTo && (
                  <div className="ln-redirect" role="status">
                    🔐 Login required for <strong>{redirectTo}</strong>
                  </div>
                )}

                {/* Google */}
                <button
                  type="button"
                  className="ln-google"
                  onClick={handleGoogle}
                  disabled={googleLoading || loading}
                  aria-label="Continue with Google"
                >
                  {googleLoading
                    ? <><div className="ln-spin" aria-hidden="true" /> Connecting…</>
                    : <><GoogleIcon /> Continue with Google</>
                  }
                </button>

                {/* Divider */}
                <div className="ln-divider" aria-hidden="true">
                  <div className="ln-div-line" />
                  <span className="ln-div-text">or sign in with email</span>
                  <div className="ln-div-line" />
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} noValidate>
                  <div className="ln-group">
                    <label htmlFor="ln-email" className="ln-label">Email</label>
                    <input
                      id="ln-email"
                      className={`ln-input${userNotFoundMsg ? " ln-input-err" : ""}`}
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      aria-describedby={userNotFoundMsg ? "ln-email-err" : undefined}
                    />
                    {userNotFoundMsg && <span id="ln-email-err" className="ln-err" role="alert">{userNotFoundMsg}</span>}
                  </div>

                  <div className="ln-group">
                    <label htmlFor="ln-pass" className="ln-label">Password</label>
                    <div className="ln-input-wrap">
                      <input
                        id="ln-pass"
                        className="ln-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        style={{ paddingRight: 36 }}
                      />
                      <button
                        type="button"
                        className="ln-eye"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  <label className="ln-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      aria-label="Remember me"
                    />
                    <div className="ln-checkbox" aria-hidden="true" />
                    <span className="ln-remember-label">Remember me</span>
                  </label>

                  <button
                    type="submit"
                    className="ln-submit"
                    disabled={isDisabled}
                    aria-busy={loading}
                  >
                    {loading ? "Signing in…" : "Sign In →"}
                  </button>

                  <div className="ln-links">
                    <Link href="/forgot-password" className="ln-link">Forgot password?</Link>
                    <Link href="/signup" className="ln-link">New here? <span>Create account</span></Link>
                  </div>
                </form>

                {msg && <div className="ln-msg" role="alert">{msg}</div>}

              </div>
            </div>
          </div>

          {/* Keyboard base */}
          <div className="ln-keyboard" aria-hidden="true">
            <div className="ln-trackpad" />
          </div>
          <div className="ln-foot" aria-hidden="true" />
        </div>

        <p className="ln-tagline" aria-hidden="true">AI Powered Learning Platform in Pakistan 🇵🇰</p>
      </div>
    </>
  );
}
