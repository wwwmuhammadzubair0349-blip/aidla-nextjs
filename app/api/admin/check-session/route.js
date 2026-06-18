// app/api/admin/check-session/route.js
// Admin token verification via Supabase REST API (no JS client — edge compatible).
// Returns { isAdmin: true/false } — never throws, never leaks admin email.
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL  || "";
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_EMAIL  = (process.env.ADMIN_EMAIL || "").toLowerCase();

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token || !ADMIN_EMAIL || !SUPABASE_URL) {
      return Response.json({ isAdmin: false });
    }

    const apiKey = SERVICE_KEY || ANON_KEY;
    if (!apiKey) return Response.json({ isAdmin: false });

    // Verify token via Supabase REST — native fetch, no package import needed
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
      },
    });

    if (!res.ok) return Response.json({ isAdmin: false });

    const user = await res.json();
    const email = (user?.email || "").toLowerCase();

    return Response.json({ isAdmin: email === ADMIN_EMAIL });
  } catch (e) {
    console.error("[check-session]", e?.message);
    return Response.json({ isAdmin: false });
  }
}
