"use client";
// hooks/useAuth.js
// Client-side auth guard used by UserLayout and AdminLayout.
// Since Supabase JS v2 stores sessions in localStorage (not cookies),
// all auth protection must happen client-side.
//
// Admin check uses POST /api/admin/check-session (server-side) so the
// admin email is NEVER exposed in client-side JavaScript or env vars.

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

async function checkIsAdmin(accessToken) {
  try {
    const res = await fetch("/api/admin/check-session", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return data.isAdmin === true;
  } catch {
    return false;
  }
}

export function useAuth({ requireAdmin = false } = {}) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function clearAndRedirect() {
      try { await supabase.auth.signOut({ scope: "local" }); } catch (_) {}
      if (mounted) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.warn("[useAuth] Session error:", error.message);
          await clearAndRedirect();
          return;
        }

        if (!session) {
          await clearAndRedirect();
          return;
        }

        const u = session.user;

        if (requireAdmin) {
          const isAdmin = await checkIsAdmin(session.access_token);
          if (!mounted) return;
          if (!isAdmin) {
            router.replace("/user");
            return;
          }
        }

        setUser(u);
        setLoading(false);

      } catch (err) {
        console.warn("[useAuth] Unexpected auth error:", err?.message);
        if (mounted) await clearAndRedirect();
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT") {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        if (event === "TOKEN_REFRESHED" && session) {
          const u = session.user;
          if (requireAdmin) {
            const isAdmin = await checkIsAdmin(session.access_token);
            if (!mounted) return;
            if (!isAdmin) {
              router.replace("/user");
              return;
            }
          }
          setUser(u);
          setLoading(false);
          return;
        }

        if (!session) {
          await clearAndRedirect();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return { user, loading, logout };
}
