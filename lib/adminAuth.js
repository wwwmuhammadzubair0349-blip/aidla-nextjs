// lib/adminAuth.js
// Server-side admin verification for API routes.
// Uses SUPABASE_SERVICE_ROLE_KEY (private) to verify the caller's JWT,
// then checks their email against ADMIN_EMAIL (private env var).
// Falls back to NEXT_PUBLIC_ADMIN_EMAIL during migration.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  || "";
const ADMIN_EMAIL  = (
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
).toLowerCase();

/**
 * Verifies the Bearer token from `request.headers.authorization`,
 * confirms the user is the admin, and returns an admin Supabase client.
 *
 * @returns { ok, user, admin } on success
 * @returns { ok: false, status, error } on failure
 */
export async function verifyAdmin(request) {
  const auth  = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (!token)       return { ok: false, status: 401, error: "Missing token" };
  if (!SERVICE_KEY) return { ok: false, status: 500, error: "Server misconfigured" };

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: "Invalid session" };

  if (!ADMIN_EMAIL || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return { ok: false, status: 403, error: "Not authorized" };
  }

  return { ok: true, user, admin };
}
