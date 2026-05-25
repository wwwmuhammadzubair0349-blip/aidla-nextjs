import { NextResponse } from "next/server";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function dbDel(table, filter) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "return=minimal",
    },
  });
}

export async function DELETE(request) {
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "Server misconfigured: missing service role key" }, { status: 500 });
  }

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Delete all linked data first (order matters for FK chains)
  await dbDel("study_materials",  `uploaded_by_user_id=eq.${userId}`);
  await dbDel("users_profiles",   `user_id=eq.${userId}`);

  // Delete from Supabase Auth
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!authRes.ok) {
    const text = await authRes.text();
    return NextResponse.json({ error: `Auth delete failed: ${text}` }, { status: authRes.status });
  }

  return NextResponse.json({ success: true });
}
