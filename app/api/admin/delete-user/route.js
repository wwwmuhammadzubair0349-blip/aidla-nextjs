import { NextResponse } from "next/server";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function dbDel(table, filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "return=minimal",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${table}] ${text}`);
  }
}

export async function DELETE(request) {
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "Server misconfigured: missing service role key" }, { status: 500 });
  }

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // 1. Get study_material IDs belonging to this user
  const smRes = await fetch(
    `${SUPABASE_URL}/rest/v1/study_materials?uploaded_by_user_id=eq.${userId}&select=id`,
    {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    }
  );
  const materials = smRes.ok ? await smRes.json() : [];
  const materialIds = materials.map((m) => m.id);

  // 2. Delete child rows of study_materials (add more tables here if needed)
  if (materialIds.length > 0) {
    const ids = materialIds.join(",");
    await Promise.allSettled([
      dbDel("study_material_reviews",  `material_id=in.(${ids})`),
      dbDel("study_material_comments", `material_id=in.(${ids})`),
      dbDel("study_material_likes",    `material_id=in.(${ids})`),
    ]);
  }

  // 3. Delete study_materials
  try { await dbDel("study_materials", `uploaded_by_user_id=eq.${userId}`); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }

  // 4. Delete profile
  try { await dbDel("users_profiles", `user_id=eq.${userId}`); }
  catch (_) {}

  // 5. Delete auth user
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });

  if (!authRes.ok) {
    const text = await authRes.text();
    return NextResponse.json({ error: `Auth delete failed: ${text}` }, { status: authRes.status });
  }

  return NextResponse.json({ success: true });
}
