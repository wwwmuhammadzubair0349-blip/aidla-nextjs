"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handle = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/user";

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?error=auth_failed");
        return;
      }

      // Create profile for new Google users if one doesn't exist
      const userId = session.user.id;
      const userEmail = (session.user.email || "").toLowerCase();
      const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";

      const { data: existing } = await supabase
        .from("users_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existing) {
        let myReferCode = "", isUnique = false;
        while (!isUnique) {
          const n = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
          myReferCode = `AIDLA-${n}`;
          const { data: ex } = await supabase
            .from("users_profiles")
            .select("user_id")
            .eq("my_refer_code", myReferCode)
            .maybeSingle();
          if (!ex) isUnique = true;
        }
        await supabase.from("users_profiles").insert([{
          user_id: userId,
          full_name: fullName,
          email: userEmail,
          my_refer_code: myReferCode,
        }]);
      }

      // Check if admin
      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase();
      const destination = userEmail === adminEmail ? "/admin" : next;

      router.replace(destination);
    };

    handle();
  }, [router, searchParams]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #e2e8f0",
          borderTopColor: "#f59e0b", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto 14px",
        }} />
        <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600 }}>Signing you in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
