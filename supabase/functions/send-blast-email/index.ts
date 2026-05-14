// supabase/functions/send-blast-email/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return json({ error: "Missing RESEND_API_KEY secret" }, 500);
    }

    const { to, subject, html, from_email, from_name } = await req.json();

    if (!to || !Array.isArray(to) || to.length === 0) return json({ error: "No recipients" }, 400);
    if (!subject?.trim()) return json({ error: "Subject is required" }, 400);
    if (!html?.trim())    return json({ error: "HTML body is required" }, 400);

    const fromStr = from_name
      ? `${from_name} <${from_email || "noreply@aidla.online"}>`
      : (from_email || "noreply@aidla.online");

    const sent: string[] = [];
    const failed: { email: string; error: string }[] = [];

    // Send in batches of 50 (Resend rate limit)
    const BATCH = 50;
    for (let i = 0; i < to.length; i += BATCH) {
      const batch = to.slice(i, i + BATCH);

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromStr,
          to: batch,
          subject,
          html,
        }),
      });

      const data = await r.json();

      if (r.ok) {
        sent.push(...batch);
      } else {
        // If batch fails, try individually
        for (const email of batch) {
          const r2 = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ from: fromStr, to: [email], subject, html }),
          });
          if (r2.ok) {
            sent.push(email);
          } else {
            const err2 = await r2.json();
            failed.push({ email, error: err2?.message || "Unknown error" });
          }
        }
      }
    }

    return json({
      ok: true,
      sent_count: sent.length,
      failed_count: failed.length,
      failed,
    });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
