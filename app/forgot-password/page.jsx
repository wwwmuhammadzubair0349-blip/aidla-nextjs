"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; 

// ── Constants ──────────────────────────────────────────────
const OTP_EXPIRY_SECONDS = 180;   // 3 min
const RESEND_COOLDOWN    = 60;    // 60 s
const MAX_REQUESTS       = 3;
const WINDOW_HOURS       = 12;
const STORAGE_PREFIX     = "aidla_otp_v3__";
const REDIRECT_DELAY     = 5;     // 5 seconds countdown before redirect

// ── Rate-limit helpers (per email) ────────────────────────
const eKey  = (e) => STORAGE_PREFIX + e.trim().toLowerCase();
const lMeta = (e) => { 
  if (typeof window === "undefined") return { count: 0, windowStart: null };
  try { const r = localStorage.getItem(eKey(e)); return r ? JSON.parse(r) : { count:0, windowStart:null }; } catch { return { count:0, windowStart:null }; } 
};
const sMeta = (e, m) => { try { localStorage.setItem(eKey(e), JSON.stringify(m)); } catch {} };
const cMeta = (e) => { try { localStorage.removeItem(eKey(e)); } catch {} };

function getStatus(email) {
  if (!email) return { remaining: MAX_REQUESTS, resetMs: 0 };
  const meta = lMeta(email);
  const now  = Date.now();
  const win  = WINDOW_HOURS * 3600_000;
  if (!meta.windowStart || now - meta.windowStart > win) {
    sMeta(email, { count: 0, windowStart: now });
    return { remaining: MAX_REQUESTS, resetMs: 0 };
  }
  return {
    remaining: Math.max(0, MAX_REQUESTS - meta.count),
    resetMs:   Math.max(0, win - (now - meta.windowStart)),
  };
}

function recordReq(email) {
  const meta = lMeta(email);
  const now  = Date.now();
  const win  = WINDOW_HOURS * 3600_000;
  if (!meta.windowStart || now - meta.windowStart > win)
    sMeta(email, { count: 1, windowStart: now });
  else
    sMeta(email, { count: meta.count + 1, windowStart: meta.windowStart });
}

// ── Email regex ────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtSec(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function fmtMs(ms) {
  const m = Math.ceil(ms / 60_000);
  return m >= 60 ? `${Math.ceil(m/60)}h ${m%60 ? m%60+"m" : ""}`.trim() : `${m}m`;
}

// ── Component ──────────────────────────────────────────────
export default function ForgotPassword() {
  const router = useRouter();

  // Next.js fix: Ensure component is mounted before using createPortal
  const [mounted, setMounted] = useState(false);

  const [step,           setStep]           = useState(1);
  const [email,          setEmail]          = useState("");
  const [emailTouched,   setEmailTouched]   = useState(false);
  const[emailChecking,  setEmailChecking]  = useState(false);
  const [emailValid,     setEmailValid]     = useState(null); // null | true | false
  const [emailStatus,    setEmailStatus]    = useState(""); // "found" | "notfound" | ""

  const [otp,            setOtp]            = useState("");
  const [newPwd,         setNewPwd]         = useState("");
  const[confirmPwd,     setConfirmPwd]     = useState("");
  const [showPwd,        setShowPwd]        = useState(false);

  const [loading,        setLoading]        = useState(false);
  const [msg,            setMsg]            = useState({ text:"", type:"" });

  const[resendCD,       setResendCD]       = useState(0);
  const [otpExpiry,      setOtpExpiry]      = useState(0);
  const [otpSentAt,      setOtpSentAt]      = useState(null);

  const [remaining,      setRemaining]      = useState(MAX_REQUESTS);
  const [resetMs,        setResetMs]        = useState(0);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(REDIRECT_DELAY);

  const resendRef  = useRef(null);
  const expiryRef  = useRef(null);
  const resetRef   = useRef(null);
  const debounceRef = useRef(null);
  const redirectIntervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  },[]);

  // ── Countdown effect for success popup ──
  useEffect(() => {
    if (showSuccessPopup) {
      setRedirectCountdown(REDIRECT_DELAY);
      redirectIntervalRef.current = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(redirectIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (redirectIntervalRef.current) {
        clearInterval(redirectIntervalRef.current);
      }
    };
  }, [showSuccessPopup]);

  // ── Redirect effect when countdown reaches 0 ──
  useEffect(() => {
    if (showSuccessPopup && redirectCountdown === 0) {
      router.push("/login");
    }
  }, [redirectCountdown, showSuccessPopup, router]);

  // ── Refresh rate-limit whenever email changes ──
  useEffect(() => {
    if (!email) { setRemaining(MAX_REQUESTS); setResetMs(0); return; }
    const { remaining: r, resetMs: ms } = getStatus(email);
    setRemaining(r); setResetMs(ms);
  }, [email]);

  useEffect(() => {
    clearInterval(resetRef.current);
    if (resetMs > 0) {
      resetRef.current = setInterval(() => {
        const { remaining: r, resetMs: ms } = getStatus(email);
        setRemaining(r); setResetMs(ms);
      }, 60_000);
    }
    return () => clearInterval(resetRef.current);
  }, [resetMs, email]);

  useEffect(() => () => {
    clearInterval(resendRef.current);
    clearInterval(expiryRef.current);
    clearInterval(resetRef.current);
    clearTimeout(debounceRef.current);
    if (redirectIntervalRef.current) {
      clearInterval(redirectIntervalRef.current);
    }
  },[]);

  // ── Check email in DB (debounced 500ms after user stops typing) ──
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setEmailValid(null);
    setEmailStatus("");

    if (!EMAIL_RE.test(email)) return; 

    debounceRef.current = setTimeout(async () => {
      setEmailChecking(true);
      try {
        const { data, error } = await supabase
          .from("users_profiles")
          .select("email")
          .eq("email", email.trim().toLowerCase())
          .maybeSingle();

        if (error) throw error;
        if (data) { setEmailValid(true);  setEmailStatus("found"); }
        else      { setEmailValid(false); setEmailStatus("notfound"); }
      } catch {
        setEmailValid(false); setEmailStatus("error");
      } finally {
        setEmailChecking(false);
      }
    }, 500); 
  }, [email]);

  // ── Timers ──
  function startResendTimer() {
    setResendCD(RESEND_COOLDOWN);
    clearInterval(resendRef.current);
    resendRef.current = setInterval(() => setResendCD(p => { if (p<=1){clearInterval(resendRef.current);return 0;} return p-1; }), 1000);
  }

  function startExpiryTimer() {
    clearInterval(expiryRef.current);
    setOtpExpiry(OTP_EXPIRY_SECONDS);
    expiryRef.current = setInterval(() => setOtpExpiry(p => {
      if (p<=1) { clearInterval(expiryRef.current); setMsg({ text:"OTP expired. Request a new code.", type:"error" }); return 0; }
      return p-1;
    }), 1000);
  }

  // ── Send OTP ──
  async function handleSendOtp(e) {
    e.preventDefault();
    setMsg({ text:"", type:"" });
    if (!emailValid) return;
    const { remaining: r } = getStatus(email);
    if (r <= 0) { setMsg({ text:`Limit reached. Try again in ${fmtMs(resetMs)}.`, type:"error" }); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: undefined });
      if (error) throw error;
      recordReq(email);
      const s = getStatus(email); setRemaining(s.remaining); setResetMs(s.resetMs);
      setOtpSentAt(Date.now()); startResendTimer(); startExpiryTimer();
      setStep(2);
      setMsg({ text:"6-digit OTP sent! Check your email. Expires in 3 minutes.", type:"success" });
    } catch (err) {
      setMsg({ text: err.message || "Failed to send OTP.", type:"error" });
    } finally { setLoading(false); }
  }

  // ── Resend ──
  async function handleResend() {
    if (resendCD > 0) return;
    const { remaining: r, resetMs: ms } = getStatus(email);
    if (r <= 0) { setMsg({ text:`Limit reached. Try again in ${fmtMs(ms)}.`, type:"error" }); return; }
    setMsg({ text:"", type:"" }); setOtp(""); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: undefined });
      if (error) throw error;
      recordReq(email);
      const s = getStatus(email); setRemaining(s.remaining); setResetMs(s.resetMs);
      setOtpSentAt(Date.now()); startResendTimer(); startExpiryTimer();
      setMsg({ text:"New OTP sent! Previous code is now invalid.", type:"success" });
    } catch (err) {
      setMsg({ text: err.message || "Failed to resend.", type:"error" });
    } finally { setLoading(false); }
  }

  // ── Verify + Reset ──
  async function handleVerifyAndReset(e) {
    e.preventDefault(); setMsg({ text:"", type:"" });
    if (otpExpiry === 0) { setMsg({ text:"OTP expired. Request a new code.", type:"error" }); return; }
    if (otp.length !== 6) { setMsg({ text:"Please enter the full 6-digit OTP.", type:"error" }); return; }
    if (newPwd !== confirmPwd) { setMsg({ text:"Passwords do not match.", type:"error" }); return; }
    if (newPwd.length < 6) { setMsg({ text:"Password must be at least 6 characters.", type:"error" }); return; }

    setLoading(true);
    try {
      const { error: ve } = await supabase.auth.verifyOtp({ email, token: otp, type:"recovery" });
      if (ve) throw ve;
      const { error: ue } = await supabase.auth.updateUser({ password: newPwd });
      if (ue) throw ue;
      cMeta(email);
      clearInterval(resendRef.current); clearInterval(expiryRef.current);
      
      // Show success popup instead of regular message
      setMsg({ text:"", type:"" });
      setShowSuccessPopup(true);
      
    } catch (err) {
      setMsg({ text: err.message || "Invalid or expired OTP.", type:"error" });
    } finally { setLoading(false); }
  }

  function goBack() {
    setStep(1); setMsg({ text:"",type:"" }); setOtp("");
    clearInterval(expiryRef.current); clearInterval(resendRef.current);
  }

  // Manual redirect from popup
  function handleManualRedirect() {
    if (redirectIntervalRef.current) {
      clearInterval(redirectIntervalRef.current);
    }
    router.push("/login");
  }

  // ── Password Strength Calculator ──
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(newPwd);
  
  const getStrengthColor = (score) => {
    if (score === 0) return '#e5e7eb';
    if (score === 1) return '#ef4444';
    if (score === 2) return '#f97316';
    if (score === 3) return '#eab308';
    return '#22c55e';
  };

  const getStrengthLabel = (score) => {
    if (score === 0) return '';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  // ── Derived State ──
  const emailComplete = EMAIL_RE.test(email);
  const otpExpired    = step === 2 && otpSentAt && otpExpiry === 0;
  const expiryUrgent  = otpExpiry > 0 && otpExpiry <= 60;
  const limitReached  = remaining <= 0;
  
  // Password mismatch detection
  const passwordsMismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
  
  // Button canSubmit logic
  const canSubmit = step === 1 
    ? (emailValid && !emailChecking && !limitReached && emailStatus !== "error")
    : (otp.trim().length === 6 && newPwd.length >= 6 && confirmPwd.length >= 6 && !passwordsMismatch && !otpExpired);

  // Derive input class based on email validation state
  let emailInputClass = "fp-inp";
  if (emailComplete) {
    if (emailChecking) emailInputClass += " fp-inp-checking";
    else if (emailValid === true) emailInputClass += " fp-inp-success";
    else if (emailValid === false) emailInputClass += " fp-inp-error";
  }

  // Prevent SSR hydration mismatch for createPortal
  if (!mounted) return null;

  const css = `
    .fp-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: #f4f7fb; overflow-y: auto; overflow-x: hidden;
      display: flex; align-items: center; justify-content: center;
      padding: clamp(10px, 3vh, 30px) clamp(12px, 4vw, 20px);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fp-overlay * { box-sizing: border-box; }

    .fp-orb {
      position: fixed; border-radius: 50%; filter: blur(80px);
      z-index: -1; will-change: transform;
      animation: fpFloat 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    .fp-orb-1 {
      width: clamp(250px, 40vw, 450px); height: clamp(250px, 40vw, 450px);
      background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(30, 58, 138, 0.1) 100%);
      top: -10%; left: -5%;
    }
    .fp-orb-2 {
      width: clamp(200px, 30vw, 350px); height: clamp(200px, 30vw, 350px);
      background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.1) 100%);
      bottom: -5%; right: -5%;
      animation-duration: 25s; animation-direction: alternate-reverse;
    }

    @keyframes fpFloat {
      0% { transform: translate3d(0, 0, 0) scale(1); }
      100% { transform: translate3d(40px, 30px, 0) scale(1.05); }
    }

    .fp-card {
      width: 100%; max-width: 400px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 20px;
      padding: clamp(20px, 4vh, 30px) clamp(20px, 5vw, 28px);
      box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      animation: fpModalEnter 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      opacity: 0; transform: translate3d(0, 15px, 0) scale(0.98);
      position: relative;
    }

    @keyframes fpModalEnter { to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }

    .fp-backBtn {
      position: absolute; left: 16px; top: 16px;
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 10px; background: rgba(255, 255, 255, 0.6);
      color: #1e3a8a; font-weight: 600; font-size: 0.75rem;
      border-radius: 8px; border: none; cursor: pointer; text-decoration: none;
      transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .fp-backBtn:hover { background: #ffffff; color: #3b82f6; transform: translate3d(0, -1px, 0); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    
    .fp-brandWrap { text-align: center; margin-bottom: 20px; margin-top: 10px; }
    .fp-brandTitle {
      font-size: clamp(1.8rem, 5vw, 2.2rem); font-weight: 800; letter-spacing: -0.03em;
      background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 2px; display: block; line-height: 1.1;
    }
    .fp-brandSub { font-size: 0.8rem; color: #64748b; font-weight: 600; }

    .fp-rateBar { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .fp-rateDot { width: 8px; height: 8px; border-radius: 50%; transition: background 0.3s; }
    .fp-dotUsed { background: #fca5a5; }
    .fp-dotAvail { background: #10b981; }
    .fp-rateLabel { font-size: 0.7rem; color: #64748b; font-weight: 600; }
    .fp-rateReset { font-size: 0.65rem; color: #b45309; font-weight: 700; background: #fef3c7; padding: 2px 8px; border-radius: 10px; }

    .fp-fieldWrap { margin-bottom: 14px; position: relative; }
    .fp-label { display: block; margin-bottom: 6px; font-weight: 600; color: #334155; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .fp-inputWrap { position: relative; width: 100%; }
    
    .fp-inp {
      width: 100%; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1;
      background: rgba(255, 255, 255, 0.9); color: #0f172a; font-size: 16px; font-weight: 500;
      transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1); appearance: none; outline: none;
    }
    .fp-inp::placeholder { color: #94a3b8; font-weight: 400; }
    .fp-inp:focus { background: #ffffff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
    
    .fp-inp-checking { border-color: rgba(251,191,36,0.8); }
    .fp-inp-success { border-color: #10b981; }
    .fp-inp-error { border-color: #ef4444; }
    .fp-inp-error:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }
    .fp-inp-danger { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important; }

    .fp-inp-otp { 
      text-align: center; letter-spacing: 0.5em; font-size: 1.8rem; font-weight: 800; 
      padding-left: 14px; padding-right: 14px;
    }
    
    .fp-eyeBtn {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #94a3b8;
      display: flex; align-items: center; padding: 6px; border-radius: 6px; transition: all 0.2s;
    }
    .fp-eyeBtn:hover { background: #f1f5f9; color: #1e3a8a; }

    .fp-badge {
      display: inline-flex; align-items: center; gap: 4px; margin-top: 6px;
      padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;
      animation: fpFadeIn 0.3s ease;
    }
    .fp-badge-found { background: #d1fae5; color: #047857; }
    .fp-badge-notfound { background: #fee2e2; color: #b91c1c; }
    .fp-badge-checking { background: #fef3c7; color: #92400e; }
    .fp-badge-error { background: #fee2e2; color: #b91c1c; }
    .fp-badge-danger { background: #fee2e2; color: #b91c1c; font-weight: 700; }

    .fp-warnBox {
      display: flex; align-items: flex-start; gap: 8px;
      background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px;
      padding: 10px 12px; margin-bottom: 14px; font-size: 0.75rem; color: #9a3412; font-weight: 600; line-height: 1.5;
    }

    .fp-btn {
      width: 100%; padding: 14px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.5px;
      cursor: pointer; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.25);
      transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .fp-btn:hover:not(:disabled) { transform: translate3d(0, -2px, 0); box-shadow: 0 6px 16px rgba(30, 58, 138, 0.35); filter: brightness(1.05); }
    .fp-btn:active:not(:disabled) { transform: translate3d(0, 1px, 0); }
    .fp-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; opacity: 0.8; }

    .fp-otpMeta { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .fp-resendBtn { background: none; border: none; font-size: 0.75rem; font-weight: 700; border-radius: 6px; padding: 4px 8px; transition: all 0.2s; }
    .fp-resendBtn:not(:disabled) { color: #3b82f6; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
    .fp-resendBtn:not(:disabled):hover { background: rgba(59,130,246,0.1); }
    .fp-resendBtn:disabled { color: #94a3b8; cursor: not-allowed; }
    .fp-resendHint { font-size: 0.7rem; color: #64748b; text-align: center; margin-bottom: 14px; }

    .fp-msgBox {
      margin-top: 14px; padding: 10px 14px; border-radius: 10px; text-align: center;
      font-weight: 600; font-size: 0.8rem; line-height: 1.5; animation: fpFadeIn 0.3s ease;
    }
    .fp-msg-success { color: #047857; background: #d1fae5; border: 1px solid #34d399; }
    .fp-msg-error { color: #b91c1c; background: #fee2e2; border: 1px solid #f87171; }

    .fp-blockedBox { text-align: center; padding: 10px 0; }
    .fp-blockedIcon { font-size: 2.4rem; display: block; margin-bottom: 8px; }
    .fp-blockedHint { color: #64748b; font-size: 0.75rem; margin-top: 8px; line-height: 1.5; }

    .fp-strengthWrap { margin-top: 8px; }
    .fp-strengthBar { display: flex; gap: 4px; margin-bottom: 4px; }
    .fp-strengthBlock { flex: 1; height: 4px; border-radius: 2px; transition: all 0.3s; }
    .fp-strengthLabel { font-size: 0.7rem; font-weight: 700; }
    
    .fp-checklist { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
    .fp-checklist-item { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; color: #94a3b8; transition: color 0.2s; }
    .fp-checklist-item.fulfilled { color: #10b981; }

    /* ── Success Popup Styles ── */
    .fp-success-overlay {
      position: fixed; inset: 0; z-index: 100000;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: fpOverlayFadeIn 0.3s ease;
    }

    @keyframes fpOverlayFadeIn { from { opacity: 0; } to { opacity: 1; } }

    .fp-success-popup {
      background: #ffffff; border-radius: 24px; padding: clamp(30px, 5vh, 40px) clamp(24px, 5vw, 36px);
      max-width: 420px; width: 100%; text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5);
      animation: fpPopupBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative; overflow: hidden;
    }

    @keyframes fpPopupBounce {
      0% { opacity: 0; transform: scale(0.8) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .fp-success-popup::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7, #34d399, #10b981);
      background-size: 200% 100%; animation: fpShimmer 2s linear infinite;
    }

    @keyframes fpShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .fp-success-icon {
      width: 80px; height: 80px; margin: 0 auto 20px;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      animation: fpSuccessPulse 2s ease-in-out infinite;
    }

    @keyframes fpSuccessPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
    }

    .fp-success-title {
      font-size: 1.5rem; font-weight: 800; color: #065f46; margin-bottom: 8px;
      background: linear-gradient(135deg, #047857, #10b981);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .fp-success-message {
      font-size: 0.9rem; color: #64748b; margin-bottom: 20px; line-height: 1.6;
    }

    .fp-success-email {
      font-weight: 700; color: #1e293b; background: #f1f5f9;
      padding: 4px 12px; border-radius: 6px; font-size: 0.85rem;
    }

    .fp-countdown-ring {
      width: 64px; height: 64px; margin: 0 auto 16px; position: relative;
    }

    .fp-countdown-ring svg { transform: rotate(-90deg); width: 100%; height: 100%; }
    
    .fp-countdown-bg { fill: none; stroke: #e2e8f0; stroke-width: 4; }
    
    .fp-countdown-progress {
      fill: none; stroke: #10b981; stroke-width: 4; stroke-linecap: round;
      transition: stroke-dashoffset 1s linear;
    }

    .fp-countdown-text {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 1.5rem; font-weight: 800; color: #065f46;
    }

    .fp-success-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; border-radius: 12px; border: none;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .fp-success-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); }
    .fp-success-btn:active { transform: translateY(0); }

    @keyframes fpFadeIn { from { opacity: 0; transform: translate3d(0,-5px,0); } to { opacity: 1; transform: translate3d(0,0,0); } }
  `;

  // Password checklist items
  const passwordChecks = [
    { label: 'At least 8 characters', passed: newPwd.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(newPwd) },
    { label: 'One number', passed: /[0-9]/.test(newPwd) },
    { label: 'One special character', passed: /[^A-Za-z0-9]/.test(newPwd) },
  ];

  // Calculate countdown ring circumference
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - redirectCountdown / REDIRECT_DELAY);

  return createPortal(
    <>
      <style>{css}</style>
      
      {/* Main forgot password modal */}
      {!showSuccessPopup && (
        <div className="fp-overlay">
          <div className="fp-orb fp-orb-1" />
          <div className="fp-orb fp-orb-2" />

          <div className="fp-card">
            {step === 1 ? (
              <Link href="/login" className="fp-backBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </Link>
            ) : (
              <button onClick={goBack} className="fp-backBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Change Email
              </button>
            )}

            <div className="fp-brandWrap">
              <span className="fp-brandTitle">AIDLA</span>
              <p className="fp-brandSub">{step === 1 ? "Secure Account Recovery" : "Enter OTP & Set New Password"}</p>
            </div>

            {emailComplete && emailValid === true && (
              <div className="fp-rateBar">
                {Array.from({ length: MAX_REQUESTS }).map((_, i) => (
                  <div key={i} className={`fp-rateDot ${i < MAX_REQUESTS - remaining ? 'fp-dotUsed' : 'fp-dotAvail'}`} />
                ))}
                <span className="fp-rateLabel">{remaining}/{MAX_REQUESTS} requests left</span>
                {limitReached && resetMs > 0 && (
                  <span className="fp-rateReset">⏳ resets in {fmtMs(resetMs)}</span>
                )}
              </div>
            )}

            {/* ═══ STEP 1 ═══ */}
            {step === 1 && (
              <>
                {emailComplete && emailValid === true && limitReached ? (
                  <div className="fp-blockedBox">
                    <span className="fp-blockedIcon">🔒</span>
                    <div className="fp-msgBox fp-msg-error">
                      Too many OTP requests for <b>{email}</b>.<br/>
                      {resetMs > 0 ? `Please wait ${fmtMs(resetMs)} before trying again.` : "Please try again later."}
                    </div>
                    <p className="fp-blockedHint">Each email address has its own independent limit. You can try a different email.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendOtp}>
                    <div className="fp-fieldWrap">
                      <label className="fp-label">Registered Email</label>
                      <div className="fp-inputWrap">
                        <input
                          className={emailInputClass}
                          value={email}
                          onChange={e => { setEmail(e.target.value); setEmailTouched(true); }}
                          onBlur={() => setEmailTouched(true)}
                          type="email"
                          required
                          placeholder="name@example.com"
                          autoComplete="email"
                        />
                      </div>

                      {emailTouched && !emailComplete && email.length > 0 && (
                        <div className="fp-badge fp-badge-error">⚠ Enter a valid email address</div>
                      )}
                      {emailComplete && emailChecking && (
                        <div className="fp-badge fp-badge-checking">⏳ Checking email…</div>
                      )}
                      {emailComplete && !emailChecking && emailStatus === "found" && (
                        <div className="fp-badge fp-badge-found">✓ Account verified</div>
                      )}
                      {emailComplete && !emailChecking && emailStatus === "notfound" && (
                        <div className="fp-badge fp-badge-notfound">✗ No account found with this email</div>
                      )}
                      {emailComplete && !emailChecking && emailStatus === "error" && (
                        <div className="fp-badge fp-badge-error">⚠ Could not verify email. Check connection.</div>
                      )}
                    </div>

                    {emailComplete && emailValid === true && remaining > 0 && remaining < MAX_REQUESTS && (
                      <div className="fp-warnBox">
                        ⚠️ You have used {MAX_REQUESTS - remaining} of {MAX_REQUESTS} attempts.
                        {" "}{remaining} attempt{remaining !== 1 ? "s" : ""} remaining.
                        {resetMs > 0 && ` Resets in ${fmtMs(resetMs)}.`}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="fp-btn"
                      disabled={!canSubmit || loading}
                    >
                      {loading ? "SENDING..." : "SEND RECOVERY CODE"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ═══ STEP 2 ═══ */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndReset}>
                <div className="fp-otpMeta">
                  <span className={`fp-badge ${otpExpired ? 'fp-badge-error' : expiryUrgent ? 'fp-badge-error' : 'fp-badge-found'}`} style={{ margin: 0 }}>
                    ⏱ {otpExpired ? "Expired" : `Expires ${fmtSec(otpExpiry)}`}
                  </span>
                  <button 
                    type="button" 
                    className="fp-resendBtn"
                    onClick={handleResend} 
                    disabled={resendCD > 0 || loading || limitReached}
                  >
                    {limitReached ? "Limit reached" : resendCD > 0 ? `Resend in ${resendCD}s` : "Resend OTP"}
                  </button>
                </div>
                <div className="fp-resendHint">
                  New OTP <b>invalidates</b> previous · <b>{remaining}/{MAX_REQUESTS}</b> requests left
                </div>

                <div className="fp-fieldWrap">
                  <label className="fp-label">6-Digit OTP Code</label>
                  <input
                    className="fp-inp fp-inp-otp"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    required maxLength={6} placeholder="••••••"
                    disabled={otpExpired} autoComplete="one-time-code"
                  />
                </div>

                <div className="fp-fieldWrap">
                  <label className="fp-label">New Password</label>
                  <div className="fp-inputWrap">
                    <input
                      className="fp-inp"
                      style={{ paddingRight: 44 }}
                      value={newPwd} onChange={e => setNewPwd(e.target.value)}
                      type={showPwd ? "text" : "password"} required placeholder="Enter new password"
                    />
                    <button type="button" className="fp-eyeBtn" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                      {showPwd
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {newPwd.length > 0 && (
                    <div className="fp-strengthWrap">
                      <div className="fp-strengthBar">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className="fp-strengthBlock"
                            style={{
                              background: index < passwordStrength ? getStrengthColor(passwordStrength) : '#e5e7eb'
                            }}
                          />
                        ))}
                      </div>
                      <div className="fp-strengthLabel" style={{ color: getStrengthColor(passwordStrength) }}>
                        {getStrengthLabel(passwordStrength)}
                      </div>
                      
                      {/* Password Requirements Checklist */}
                      <div className="fp-checklist">
                        {passwordChecks.map((check, index) => (
                          <div key={index} className={`fp-checklist-item ${check.passed ? 'fulfilled' : ''}`}>
                            <span>{check.passed ? '✓' : '○'}</span>
                            <span>{check.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="fp-fieldWrap">
                  <label className="fp-label">Confirm New Password</label>
                  <input
                    className={`fp-inp ${passwordsMismatch ? 'fp-inp-danger' : ''}`}
                    value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                    type={showPwd ? "text" : "password"} required placeholder="Confirm new password"
                  />
                  {passwordsMismatch && (
                    <div className="fp-badge fp-badge-danger" style={{ marginTop: 6 }}>
                      ✗ Passwords do not match
                    </div>
                  )}
                </div>

                <button type="submit"
                  className="fp-btn"
                  disabled={!canSubmit || loading}>
                  {loading ? "VERIFYING..." : "RESET PASSWORD"}
                </button>
              </form>
            )}

            {msg.text && (
              <div className={`fp-msgBox ${msg.type === 'success' ? 'fp-msg-success' : 'fp-msg-error'}`}>
                {msg.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Popup - shown after password reset */}
      {showSuccessPopup && (
        <div className="fp-success-overlay">
          <div className="fp-success-popup">
            <div className="fp-success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            
            <h2 className="fp-success-title">Password Updated! 🎉</h2>
            <p className="fp-success-message">
              Your password has been successfully reset.<br/>
              You can now login with your new password.
            </p>
            
            <div className="fp-countdown-ring">
              <svg viewBox="0 0 64 64">
                <circle className="fp-countdown-bg" cx="32" cy="32" r="28" />
                <circle 
                  className="fp-countdown-progress" 
                  cx="32" cy="32" r="28"
                  style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
                />
              </svg>
              <span className="fp-countdown-text">{redirectCountdown}</span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
              Redirecting to login in <b>{redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}</b>...
            </p>
            
            <button className="fp-success-btn" onClick={handleManualRedirect}>
              Go to Login Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}