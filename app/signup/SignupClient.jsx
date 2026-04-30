"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./signup.module.css";

// ── Social Proof Data ──
const SP_NAMES = [
  "Ali Khan","Muhammad Usman","Ahmed Raza","Fatima Noor",
  "Ayesha Khan","Hassan Ali","Sana Ahmed","Usman Tariq",
  "Zainab Malik","Omar Sheikh","Bilal Chaudhry","Hira Baig",
  "Imran Siddiqui","Maria Qureshi","Saad Butt","Nadia Iqbal",
];
const SP_DOMAINS = ["gmail.com","yahoo.com","hotmail.com","outlook.com"];
const SP_CITIES = ["Karachi","Lahore","Dubai","Islamabad","London","Toronto"];

function spMaskEmail(name) {
  const parts = name.toLowerCase().split(" ");
  const local = (parts[0].slice(0,2) + parts[1]?.slice(0,1) || "").replace(/\s/g,"");
  const stars = "*".repeat(Math.floor(Math.random()*3)+3);
  const domain = SP_DOMAINS[Math.floor(Math.random()*SP_DOMAINS.length)];
  return `${local}${stars}@${domain}`;
}

function spRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState(searchParams.get("ref") || "");
  const[password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const[nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const[emailFormatError, setEmailFormatError] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [refCodeError, setRefCodeError] = useState("");
  const[showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [spToasts, setSpToasts] = useState([]);
const spTimerRef = useRef(null);
const spExitTimerRef = useRef(null);


  // 1) Real-Time Name Validation
  useEffect(() => {
    if (!fullName.trim()) setNameError("Please enter your name");
    else setNameError("");
  }, [fullName]);

  // 2) Real-Time Email Validation & Supabase Check
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

        if (data) setEmailError("Email already registered. Please login.");
        else setEmailError("");
      } catch (err) {
        console.error("Email check error:", err);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // 3) Password Strength
  useEffect(() => {
    let strength = 0;
    if (password.length > 5) strength += 1;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  // 4) Password Match Check
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) setPasswordMismatch(true);
    else setPasswordMismatch(false);
  }, [password, confirmPassword]);

  // 5) Referral Code Validation
  useEffect(() => {
    if (!refCode.trim()) {
      setRefCodeError("");
      return;
    }

    const refCodeRegex = /^AIDLA-\d{6}$/;
    if (!refCodeRegex.test(refCode.trim())) {
      setRefCodeError("Invalid format. Use AIDLA-XXXXXX");
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

        if (!data) setRefCodeError("Invalid or missing code");
        else setRefCodeError("");
      } catch (err) {
        console.error("Ref code error:", err);
        setRefCodeError("Error verifying code");
      }
    };

    const timeoutId = setTimeout(verifyRefCode, 500);
    return () => clearTimeout(timeoutId);
  }, [refCode]);

  // 6) Auto Redirect Countdown Timer
  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (showSuccessModal && countdown === 0) {
      router.push("/login");
    }
    return () => clearInterval(timer);
  }, [showSuccessModal, countdown, router]);

  // ── Social Proof Effect ──
useEffect(() => {
  const MAX = 3;

  function showNext() {
    const name = SP_NAMES[spRandInt(0, SP_NAMES.length - 1)];
    const city = SP_CITIES[spRandInt(0, SP_CITIES.length - 1)];
    const useEmail = Math.random() > 0.5;
    const text = useEmail
      ? `New user ${spMaskEmail(name)} joined`
      : `${name} just signed up from ${city}`;
    const id = Date.now();

    setSpToasts(prev => {
      const next = [...prev, { id, text, exiting: false }];
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });

    // mark exiting after 3.2s
    spExitTimerRef.current = setTimeout(() => {
      setSpToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      // remove after exit anim
      setTimeout(() => {
        setSpToasts(prev => prev.filter(t => t.id !== id));
      }, 380);
    }, 3200);

    spTimerRef.current = setTimeout(showNext, spRandInt(5000, 12000));
  }

  spTimerRef.current = setTimeout(showNext, spRandInt(3000, 6000));

  return () => {
    clearTimeout(spTimerRef.current);
    clearTimeout(spExitTimerRef.current);
  };
}, []);

  // Robust cross-platform Gmail handler
  const handleOpenGmail = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
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
  };

  async function onSubmit(e) {
    e.preventDefault();

    if (emailError) return;
    if (refCode && refCodeError) return;
    if (password !== confirmPassword) return;
    if (password.length < 6) return;

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
          
          if (!existing) isUnique = true;
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

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={`${styles.orb} ${styles.orbBlue}`}></div>
      <div className={`${styles.orb} ${styles.orbCyan}`}></div>

      <div className={styles.authCard}>
        <div className={styles.headerSection}>
          <Link href="/" className={styles.backBtn}>
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>
          <h1 className={styles.brandTitle}>AIDLA</h1>
          <p className={styles.brandSubtitle}>The Ecosystem of Tomorrow</p>
          
          <div className={styles.ecoGrid}>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              Learn
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              Mine
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
              Earn
            </div>
            <div className={styles.ecoBadge}>
              <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              Shop
            </div>
          </div>
        </div>
        {/* Social Proof Toasts */}
      <div className={styles.toastContainer}>
        {spToasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${t.exiting ? styles.toastExiting : ""}`}>
            <div className={styles.toastDot} />
            <div>
              <div className={styles.toastText}>{t.text}</div>
              <div className={styles.toastSub}>just joined AIDLA</div>
            </div>
          </div>
        ))}
      </div>

        <form onSubmit={onSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.labelCompact}>Full Name</label>
            <input
              className={`${styles.inputCore} ${nameError ? styles.inputError : ''}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
            {nameError && <span className={styles.errorMsg}>{nameError}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.labelCompact}>Email Address</label>
            <input
              className={`${styles.inputCore} ${emailFormatError || emailError ? styles.inputError : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="name@example.com"
            />
            {emailFormatError && <span className={styles.errorMsg}>{emailFormatError}</span>}
            {!emailFormatError && emailError && <span className={styles.errorMsg}>{emailError}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.labelCompact}>
              Referral Code <span className={styles.optionalText}>(Optional)</span>
            </label>
            <input
              className={`${styles.inputCore} ${refCodeError ? styles.inputError : ''}`}
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="AIDLA-XXXXXX"
            />
            {refCodeError && <span className={styles.errorMsg}>{refCodeError}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.labelCompact}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.inputCore}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create password"
                style={{ paddingRight: "40px" }}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <div className={styles.strengthContainer}>
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`${styles.strengthSegment} ${passwordStrength >= level ? styles[`strength${passwordStrength}`] : ''}`} />
                ))}
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.labelCompact}>Confirm Password</label>
            <input
              className={`${styles.inputCore} ${passwordMismatch ? styles.inputError : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              placeholder="Confirm password"
            />
            {passwordMismatch && <span className={styles.errorMsg}>Passwords do not match</span>}
          </div>

          <button disabled={loading || !!nameError || !!emailFormatError || !!emailError || !!refCodeError || passwordMismatch || !fullName.trim() || !email.trim() || password.length < 6} className={styles.submitBtn}>
            {loading ? "INITIALIZING..." : "CREATE ACCOUNT"}
          </button>

          <Link href="/login" className={styles.switchLink}>
            Already have an account? <span>Sign in</span>
          </Link>
        </form>
      </div>

      {showSuccessModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={styles.modalTitle}>Check Your Email</h2>
            <p className={styles.modalDesc}>
              We sent a verification link to <br/><strong>{email}</strong>.
            </p>

            <button onClick={handleOpenGmail} className={styles.gmailBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" fill="currentColor"/>
                <path d="M2.5 7L11.2929 13.5964C11.7071 13.9071 12.2929 13.9071 12.7071 13.5964L21.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open Gmail
            </button>

            <button onClick={() => router.push("/login")} className={styles.loginBtnSecondary}>
              Continue to Login
            </button>

            <p className={styles.timerText}>
              Redirecting automatically in {countdown}s...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}