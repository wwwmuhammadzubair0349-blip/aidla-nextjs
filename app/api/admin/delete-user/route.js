import { NextResponse } from "next/server";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function DELETE(request) {
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "Server misconfigured: missing service role key" }, { status: 500 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Delete from Supabase Auth (cascades or we handle profiles below)
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

  // Explicitly remove profile row (safety net if no cascade)
  await fetch(`${SUPABASE_URL}/rest/v1/users_profiles?user_id=eq.${userId}`, {
    method: "DELETE",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  return NextResponse.json({ success: true });
}
