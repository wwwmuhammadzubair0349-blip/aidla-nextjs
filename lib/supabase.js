// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if environment variables are available (handles build-time scenario)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── Global stale-token cleanup ──────────────────────────────────────────────
// "Invalid Refresh Token: Refresh Token Not Found" fires when the token in
// localStorage has been revoked server-side (session expiry, password change,
// project reset, etc.). TOKEN_REFRESH_FAILED clears localStorage immediately
// so the error stops repeating. useAuth handles the redirect to /login.
if (typeof window !== "undefined" && supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "TOKEN_REFRESH_FAILED") {
      // scope:"local" clears localStorage without a server round-trip
      supabase.auth.signOut({ scope: "local" }).catch(() => {});
    }
  });
}