"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import styles from "./email-confirmed.module.css";

const CIRC = 2 * Math.PI * 22;
const REDIRECT_SECS = 5;

export default function EmailConfirmedClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(REDIRECT_SECS);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkAccess() {
      const hash = window.location.hash;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        setEmail(session.user.email ?? "");
        if (session.user.id) {
          const { data: profile } = await supabase
            .from("users_profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
          if (profile?.full_name) setName(profile.full_name);
        }
        setStatus("confirmed");
      } else {
        if (hash && hash.includes("access_token")) {
          setErrorMsg("The confirmation link is invalid or has expired.");
          setStatus("error");
        } else {
          setStatus("no_access");
          setTimeout(() => router.push("/"), 2000);
        }
      }
    }

    checkAccess();
    return () => { isMounted = false; };
  }, [router]);

  useEffect(() => {
    if (status !== "confirmed") return;
    if (seconds <= 0) {
      router.push(`/login`);
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, router, status]);

  const dashOffset = CIRC - (CIRC * seconds) / REDIRECT_SECS;
  const firstName = name ? name.split(" ")[0] : null;

  /* ── Loading ── */
  if (status === "loading") {
    return (
      <div className={styles.root}>
        <div className={styles.orb1} /><div className={styles.orb2} />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.bar} />
            <div className={styles.inner} style={{ paddingBottom: 40 }}>
              <div className={styles.skelBg} style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 22px" }} />
              <div className={styles.skelBg} style={{ width: 120, height: 20, margin: "0 auto 14px" }} />
              <div className={styles.skelBg} style={{ width: 200, height: 28, margin: "0 auto 20px" }} />
              <div className={styles.skelBg} style={{ width: 280, height: 48, margin: "0 auto" }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── No access ── */
  if (status === "no_access") {
    return (
      <div className={styles.root}>
        <div className={styles.orb1} /><div className={styles.orb2} />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.bar} />
            <div className={styles.inner}>
              <span className={styles.badgeError}>⛔ Access Denied</span>
              <h1 className={styles.title}>Not Allowed</h1>
              <p className={styles.sub}>This page is only accessible through a valid email confirmation link. You will be redirected shortly.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error ── */
  if (status === "error") {
    return (
      <div className={styles.root}>
        <div className={styles.orb1} /><div className={styles.orb2} />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.bar} />
            <div className={styles.inner}>
              <span className={styles.badgeError}>❌ Error</span>
              <h1 className={styles.title}>Invalid Link</h1>
              <p className={styles.sub}>{errorMsg}</p>
              <button className={styles.btn} onClick={() => router.push("/")}>Go to Home</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Confirmed ── */
  return (
    <div className={styles.root}>
      <div className={styles.orb1} /><div className={styles.orb2} />
      <main className={styles.main}>
        <motion.div className={styles.card}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}>
          <div className={styles.bar} />
          <div className={styles.inner}>

            {/* Logo */}
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ marginBottom: 22 }}>
              <Image
                src="/logo.png"
                alt="AIDLA Logo"
                width={80} height={80}
                style={{ borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto",
                  boxShadow: "0 8px 28px rgba(11,20,55,0.18)", border: "2px solid rgba(59,130,246,0.12)" }}
              />
            </motion.div>

            {/* Badge */}
            <motion.span className={styles.badge}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>
              Email Verified
            </motion.span>

            {/* Heading */}
            <motion.h1 className={styles.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}>
              You&apos;re <span className={styles.titleAccent}>All Set!</span>
            </motion.h1>

            {/* Sub */}
            <motion.p className={styles.sub}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}>
              {firstName ? (
                <>Welcome aboard, <span className={styles.nameHighlight}>{firstName}</span>! Your email has been confirmed.</>
              ) : "Your email has been confirmed."}{" "}
              You can now sign in and start learning, winning, and earning on AIDLA.
            </motion.p>

            {/* Countdown ring */}
            <motion.div className={styles.countdownWrap}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}>
              <div className={styles.ring}>
                <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                  <defs>
                    <linearGradient id="countGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1a3a8f" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle className={styles.ringTrack} cx="26" cy="26" r="22" />
                  <circle className={styles.ringFill} cx="26" cy="26" r="22"
                    strokeDasharray={CIRC} strokeDashoffset={dashOffset} />
                </svg>
                <div className={styles.ringNum}>{seconds}</div>
              </div>
              <div className={styles.countdownLabel}>
                <strong>Redirecting to login</strong><br />
                in {seconds} second{seconds !== 1 ? "s" : ""}…
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button className={styles.btn} onClick={() => router.push("/login")}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}>
              Go to Login →
            </motion.button>
          </div>

          {/* Info strip */}
          <div className={styles.strip}>
            <div className={styles.stripIcon}>🔒</div>
            <p>Your email <strong>{email || "address"}</strong> will be pre-filled on the login page so you can sign in instantly.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}