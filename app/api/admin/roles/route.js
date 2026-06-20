// Service-role CRUD for admin_roles table.
// RLS blocks client writes; this endpoint uses SERVICE_KEY to bypass it.
// Auth: verified via same logic as check-session (ADMIN_EMAIL env var).
export const dynamic = "force-dynamic";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const ADMIN_EMAIL   = (process.env.ADMIN_EMAIL || "").toLowerCase();

async function verifyAdmin(request) {
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token || !SUPABASE_URL) return null;
  const apiKey = SERVICE_KEY || ANON_KEY;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: apiKey },
  });
  if (!res.ok) return null;
  const user = await res.json();
  const email = (user?.email || "").toLowerCase();
  if (ADMIN_EMAIL && email === ADMIN_EMAIL) return user;
  // Check admin_roles table
  if (user?.id && SERVICE_KEY) {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_roles?user_id=eq.${user.id}&is_active=eq.true&select=role&limit=1`,
      { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Accept: "application/json" } }
    );
    if (r.ok) {
      const roles = await r.json();
      if (Array.isArray(roles) && roles.length > 0) return user;
    }
  }
  return null;
}

// GET /api/admin/roles — list all admin roles
export async function GET(request) {
  const user = await verifyAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_roles?select=*&order=granted_at.desc`,
    { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, Accept: "application/json" } }
  );
  const data = await res.json();
  return Response.json(data);
}

// POST /api/admin/roles — upsert a role entry
export async function POST(request) {
  const user = await verifyAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { user_id, email, role, notes } = body;
  if (!user_id || !email || !role) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ user_id, email, role, notes, is_active: true, granted_by: user.email }),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

// DELETE /api/admin/roles?id=<uuid> — deactivate a role
export async function DELETE(request) {
  const user = await verifyAdmin(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/admin_roles?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ is_active: false }),
    }
  );
  return Response.json({ ok: res.ok });
}
