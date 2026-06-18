// Error logging endpoint — called by app/error.jsx on client-side crashes.
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request) {
  try {
    const { message, stack, url, userId } = await request.json();
    if (!message || !SUPABASE_URL || !SERVICE_KEY) {
      return Response.json({ ok: false });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/platform_errors`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        message: String(message).slice(0, 500),
        stack:   String(stack || "").slice(0, 2000),
        url:     String(url || "").slice(0, 500),
        user_id: userId || null,
      }),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
