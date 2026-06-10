// app/api/test/mark-out/route.js
// Receives sendBeacon POST from user test page on window unload.
// Always returns 200 so the browser doesn't retry.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  || "";

export async function POST(request) {
  try {
    const { session_id, reason } = await request.json();
    if (session_id && SERVICE_KEY) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
      await admin.rpc("test_mark_out", {
        p_session_id: session_id,
        p_reason:     reason || "left_page",
      });
    }
  } catch (_) {}

  return new Response("ok", { status: 200 });
}
