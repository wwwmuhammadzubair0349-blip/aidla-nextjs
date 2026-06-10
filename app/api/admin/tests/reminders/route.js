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

function wrapEmail(content, title, subtitle) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:0;}
  .wrap{max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);}
  .header{background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;}
  .header p{color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;}
  .body{padding:28px 32px;color:#0f172a;line-height:1.7;}
  .btn{display:inline-block;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff!important;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:15px;margin:18px 0;}
  .info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin:16px 0;font-size:14px;}
  .info-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;}
  .info-row:last-child{border-bottom:none;}
  .footer{background:#f8fafc;padding:16px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;}
  .badge-yellow{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:#fef3c7;color:#92400e;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>${title}</h1>
    <p>${subtitle}</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    © 2026 AIDLA · <a href="https://aidla.online" style="color:#3b82f6">aidla.online</a><br>
    You received this because you have an AIDLA account.
  </div>
</div>
</body>
</html>`;
}

function reminderHtml(test) {
  const fmtUAE = iso => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " UAE";
  const content = `
    <div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">⏰</div></div>
    <h2 style="color:#92400e;text-align:center;margin:0 0 8px;">Test Starts in 30 Minutes!</h2>
    <h3 style="color:#1e40af;text-align:center;margin:0 0 16px;">${test.title}</h3>
    <div class="info-box">
      <div class="info-row"><span>⏱️ Starting</span><span><strong>${fmtUAE(test.test_start_at)}</strong></span></div>
      <div class="info-row"><span>Status</span><span><span class="badge-yellow">Starting Soon</span></span></div>
    </div>
    <p style="color:#475569;text-align:center;font-size:14px;">Don't miss it — make sure you're registered!</p>
    <div style="text-align:center;"><a href="${SITE_URL}/user/test" class="btn">Register &amp; Join →</a></div>`;

  return wrapEmail(content, "⏰ AIDLA Reminder", "Your test starts soon");
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
