"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefillEmail = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirect") || null;
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();

  const[email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [userExists, setUserExists] = useState(null);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const[msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("aidla_remembered_email");
    if (saved && !prefillEmail) { 
      setEmail(saved); 
      setRememberMe(true); 
    }
  }, [prefillEmail]);

  // Real-time user existence check
  useEffect(() => {
    const check = async () => {
      if (!email || !email.includes("@")) {
        setUserName(""); 
        setUserExists(null); 
        setUserNotFoundMsg(""); 
        return;
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
          setUserName(""); 
          setUserExists(false);
          setUserNotFoundMsg("No account found. Please create an account first");
        }
      } catch (err) { 
        console.error(err); 
      }
    };
    const t = setTimeout(check, 400);
    return () => clearTimeout(t);
  }, [email]);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(""); 
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem("aidla_remembered_email", email);
      } else {
        localStorage.removeItem("aidla_remembered_email");
      }

      const userEmail = (data.user?.email || "").toLowerCase();
      const isAdmin = userEmail === adminEmail;

      // Determine destination — honour the ?redirect= param
      let destination;
      if (redirectTo) {
        const isAdminRedirect = redirectTo.startsWith("/admin");
        destination = (isAdminRedirect && !isAdmin) ? "/user" : redirectTo;
      } else {
        destination = isAdmin ? "/admin" : "/user";
      }

      // Replace history state for cleaner navigation
      router.replace(destination);

    } catch (err) {
      setMsg(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  }

  // Evaluate if the button should be disabled
  const isLoginDisabled = loading || !password.trim() || userExists !== true;

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.orb} ${styles.orbBlue}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbCyan}`} aria-hidden="true" />

      <div className={styles.authCard} role="main">
        <div className={styles.headerSection}>
          <Link href="/" className={styles.backBtn} aria-label="Back to home">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>

          {/* Show redirect notice if coming from a protected page */}
          {redirectTo && (
            <div className={styles.redirectNotice} role="status">
              🔐 Please log in to continue to <strong>{redirectTo}</strong>
            </div>
          )}

          <h1 className={styles.brandTitle}>AIDLA</h1>
          <p className={styles.brandSubtitle}>
            Welcome Back{userName ? <span className={styles.nameHighlight}>, {userName}</span> : ""}
          </p>

          <div className={styles.ecoGrid} aria-hidden="true">
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Learn
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              Mine
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Earn
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="login-email" className={styles.labelCompact}>Email Address</label>
            <input
              id="login-email"
              className={`${styles.inputCore} ${userNotFoundMsg ? styles.inputError : ""}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              required
              placeholder="name@example.com"
              autoComplete="email"
              aria-describedby={userNotFoundMsg ? "email-error" : undefined}
            />
            {userNotFoundMsg && (
              <span id="email-error" className={styles.errorText} role="alert">
                {userNotFoundMsg}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="login-password" className={styles.labelCompact}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                className={styles.inputCore}
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                style={{ paddingRight: "40px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <label className={styles.rememberWrapper}>
            <input
              type="checkbox"
              className={styles.checkboxHidden}
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              aria-label="Remember me"
            />
            <div className={styles.checkboxCustom} aria-hidden="true"></div>
            <span className={styles.rememberLabel}>Remember Me</span>
          </label>

          {/* Secure Login Button - Disabled dynamically */}
          <button 
            disabled={isLoginDisabled} 
            className={styles.submitBtn} 
            type="submit" 
            aria-busy={loading}
          >
            {loading ? "AUTHENTICATING..." : "SECURE LOGIN"}
          </button>

          <div className={styles.linksRow}>
            <Link href="/forgot-password" className={styles.link3d}>Forgot password?</Link>
            <Link href="/signup" className={styles.link3d}>New here? <span>Create Account</span></Link>
          </div>

          {msg && (
            <div className={styles.msgBox} role="alert">
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}