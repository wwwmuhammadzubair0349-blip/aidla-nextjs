// app/api/admin/tests/reminders/route.js
// Cron endpoint: sends 30-minute reminder emails for upcoming tests.
//
// Wire it up in Cloudflare (wrangler.toml) or any cron service to call:
//   GET /api/admin/tests/reminders?secret=<CRON_SECRET>  every 5 minutes
//
// Required env: CRON_SECRET (set in .env.local + Cloudflare dashboard)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  || "";
const CRON_SECRET  = process.env.CRON_SECRET || "";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "https://aidla.online";

function reminderHtml(test) {
  const fmtUAE = iso => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " UAE";
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px;">
    <div style="text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">⏰</div>
      <h1 style="font-size:1.6rem;font-weight:900;color:#fff;margin:0 0 8px;">Test Starts in 30 Minutes!</h1>
      <h2 style="color:#60a5fa;margin:0 0 16px;">${test.title}</h2>
      <p style="color:#94a3b8;">Starting: <strong style="color:#f1f5f9;">${fmtUAE(test.test_start_at)}</strong></p>
      <p style="color:#94a3b8;font-size:0.85rem;">Don't miss it — register now if you haven't already.</p>
      <a href="${SITE_URL}/user/test" style="display:inline-block;margin-top:20px;padding:14px 36px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Register &amp; Join →</a>
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">AIDLA · Pakistan's Premier Learning Platform</p>
  </div>`;
}

export async function GET(request) {
  // Protect with a secret so only the cron caller can trigger this
  const { searchParams } = new URL(request.url);
  if (CRON_SECRET && searchParams.get("secret") !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!SERVICE_KEY) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // Tests starting in the next 25–35 minutes (5-minute cron window)
  const now         = new Date();
  const windowStart = new Date(now.getTime() + 25 * 60 * 1000).toISOString();
  const windowEnd   = new Date(now.getTime() + 35 * 60 * 1000).toISOString();

  const { data: tests = [] } = await admin
    .from("test_tests")
    .select("id,title,test_start_at")
    .gte("test_start_at", windowStart)
    .lte("test_start_at", windowEnd)
    .is("deleted_at", null)
    .eq("status", "scheduled");

  if (!tests.length) return NextResponse.json({ ok: true, sent: 0 });

  let totalSent = 0;
  for (const test of tests) {
    // De-duplicate: skip if a reminder for this test was already logged
    const reminderKey = `[REMINDER:${test.id}]`;
    const { data: existing } = await admin
      .from("email_logs").select("id").ilike("subject", `%${reminderKey}%`).limit(1).maybeSingle();
    if (existing) continue;

    const { data: profiles = [] } = await admin
      .from("users_profiles").select("email").not("email", "is", null);
    const emails = profiles.map(p => p.email).filter(Boolean);
    if (!emails.length) continue;

    const subject = `⏰ Test starts in 30 minutes — ${test.title} ${reminderKey}`;
    const html    = reminderHtml(test);

    let sentCount = 0;
    const failedEmails = [];
    for (const email of emails) {
      const _res = await fetch(`${SUPABASE_URL}/functions/v1/send-blast-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to: [email], subject, html, from_email: "noreply@aidla.online", from_name: "AIDLA" }),
      }).catch(() => null);
      if (_res?.ok) sentCount++;
      else failedEmails.push(email);
    }

    await admin.from("email_logs").insert({
      subject, html_body: html,
      from_email: "noreply@aidla.online", from_name: "AIDLA",
      recipients: emails, recipient_count: emails.length,
      sent_count:   sentCount,
      failed_count: failedEmails.length,
      failed_emails: failedEmails,
      status: "sent",
    }).catch(() => {});

    totalSent += sentCount;
  }

  return NextResponse.json({ ok: true, sent: totalSent });
}
