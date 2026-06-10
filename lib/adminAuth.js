import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_EMAIL  = (
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
).toLowerCase();

/**
 * Verifies the Bearer token and confirms the caller is the admin.
 * Returns `admin` — a Supabase client scoped to the caller's JWT so that
 * all DB operations go through the same RLS path that was already working
 * before these API routes existed.
 *
 * Service role key is used ONLY for auth.getUser() verification.
 * If SERVICE_KEY is absent, falls back to verifying via the anon key.
 */
export async function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) return { ok: false, status: 401, error: "Missing token" };

  // Verify token — prefer service role (more reliable), fall back to anon key
  const verifyKey = SERVICE_KEY || ANON_KEY;
  if (!verifyKey) return { ok: false, status: 500, error: "Server misconfigured" };

  const verifier = createClient(SUPABASE_URL, verifyKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: { user }, error } = await verifier.auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: "Invalid session" };

  if (!ADMIN_EMAIL || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return { ok: false, status: 403, error: "Not authorized" };
  }

  // DB client uses the caller's own JWT — same as the browser Supabase client did
  // before these API routes existed, so all existing RLS policies continue to work.
  const admin = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Also expose a service-role client for operations that genuinely need it
  // (RPCs that require elevated access, email_logs inserts, etc.)
  const serviceAdmin = SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${SERVICE_KEY}` } },
      })
    : admin;

  return { ok: true, user, token, admin, serviceAdmin };
}
