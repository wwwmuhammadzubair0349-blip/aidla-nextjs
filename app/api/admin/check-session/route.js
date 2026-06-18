// Admin token verification via Supabase REST API (no JS client — edge compatible).
// Supports: single ADMIN_EMAIL env var + multi-admin via admin_roles table.
// Returns { isAdmin: true/false } — never throws, never leaks email.
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL  || "";
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_EMAIL  = (process.env.ADMIN_EMAIL || "").toLowerCase();

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token || !SUPABASE_URL) return Response.json({ isAdmin: false });

    const apiKey = SERVICE_KEY || ANON_KEY;
    if (!apiKey) return Response.json({ isAdmin: false });

    // 1. Verify token and get user
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: apiKey },
    });
    if (!res.ok) return Response.json({ isAdmin: false });

    const user  = await res.json();
    const email = (user?.email || "").toLowerCase();
    const uid   = user?.id;

    // 2. Check primary admin email
    if (ADMIN_EMAIL && email === ADMIN_EMAIL) {
      return Response.json({ isAdmin: true, role: "super_admin" });
    }

    // 3. Check admin_roles table (multi-admin support)
    if (uid && SERVICE_KEY) {
      const roleRes = await fetch(
        `${SUPABASE_URL}/rest/v1/admin_roles?user_id=eq.${uid}&is_active=eq.true&select=role&limit=1`,
        { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Accept: "application/json" } }
      );
      if (roleRes.ok) {
        const roles = await roleRes.json();
        if (Array.isArray(roles) && roles.length > 0) {
          return Response.json({ isAdmin: true, role: roles[0].role });
        }
      }
    }

    return Response.json({ isAdmin: false });
  } catch (e) {
    console.error("[check-session]", e?.message);
    return Response.json({ isAdmin: false });
  }
}
