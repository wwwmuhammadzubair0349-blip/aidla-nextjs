"use client";
// app/user/onboarding/page.jsx
// Phase 1 placeholder — infrastructure ready, full flow built in Phase 2.
// New users are redirected here from UserLayoutClient when onboarding_completed=false.
// Marks onboarding as complete and redirects to /user dashboard.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState("loading");

  useEffect(() => {
    async function markAndRedirect() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/login"); return; }

        await supabase
          .from("users_profiles")
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          })
          .eq("user_id", session.user.id);

        setStep("done");
        setTimeout(() => router.replace("/user"), 1200);
      } catch (_) {
        router.replace("/user");
      }
    }
    markAndRedirect();
  }, [router]);

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      textAlign: "center",
      padding: "0 24px",
    }}>
      {step === "loading" ? (
        <>
          <div style={{
            width: 40, height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(245,158,11,0.2)",
            borderTopColor: "#f59e0b",
            animation: "spin 0.7s linear infinite",
          }} />
          <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>
            Setting up your account…
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: "2.5rem" }}>🎉</div>
          <p style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
            Welcome to AIDLA!
          </p>
          <p style={{ fontSize: "0.83rem", color: "#64748b" }}>
            Taking you to your dashboard…
          </p>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
