// app/api/admin/tests/notify/route.js
// Sends test lifecycle emails via the existing send-blast-email edge function.
// Types: new_test | test_started | test_ended_qualified
// (winner emails are handled in /approve-winners)

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

const FROM_EMAIL   = "noreply@aidla.online";
const FROM_NAME    = "AIDLA";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "https://aidla.online";
const TEST_URL     = `${SITE_URL}/user/test`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ── Shared email wrapper (same style as shop-notify) ───────────────────────────

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
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;}
  .badge-green{background:#dcfce7;color:#166534;}
  .badge-yellow{background:#fef3c7;color:#92400e;}
  .badge-blue{background:#dbeafe;color:#1e40af;}
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

// ── Templates ──────────────────────────────────────────────────────────────────

function announcementHtml(test, prizes, sponsors) {
  const fmtUAE = iso => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " UAE";
  const prizeRows = prizes.map(p => {
    const medal = p.rank_no === 1 ? "🥇" : p.rank_no === 2 ? "🥈" : p.rank_no === 3 ? "🥉" : `#${p.rank_no}`;
    const label = p.prize_text || (p.prize_type === "coins" ? `${p.coins_amount} coins` : "Prize");
    return `<div class="info-row"><span>${medal} Rank ${p.rank_no}</span><span><strong>${label}</strong></span></div>`;
  }).join("");
  const sponsorNames = sponsors.map(s => s.name).join(", ");

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;">New Test Available! ⚡</h2>
    <h3 style="color:#1e40af;margin:0 0 16px;">${test.title}</h3>
    ${test.description ? `<p style="color:#475569;margin:0 0 16px;">${test.description}</p>` : ""}
    <div class="info-box">
      <div class="info-row"><span>📅 Start Time</span><span><strong>${fmtUAE(test.test_start_at)}</strong></span></div>
      <div class="info-row"><span>📝 Registration</span><span>Open until test starts</span></div>
    </div>
    ${prizes.length > 0 ? `<div class="info-box"><div style="font-weight:700;margin-bottom:10px;">🏆 Prizes</div>${prizeRows}</div>` : ""}
    ${sponsorNames ? `<p style="color:#64748b;font-size:13px;">Sponsored by: <strong>${sponsorNames}</strong></p>` : ""}
    <div style="text-align:center;"><a href="${TEST_URL}" class="btn">Register Now →</a></div>`;

  return wrapEmail(content, "⚡ AIDLA Test", "New test just announced!");
}

function startedHtml(test) {
  const content = `
    <div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">🚀</div></div>
    <h2 style="margin:0 0 8px;color:#166534;text-align:center;">Test Has Started!</h2>
    <h3 style="color:#1e40af;text-align:center;margin:0 0 16px;">${test.title}</h3>
    <p style="color:#475569;text-align:center;">The test is live now. Join immediately — every second counts!</p>
    <div class="info-box">
      <div class="info-row"><span>Status</span><span><span class="badge badge-green">🟢 Live Now</span></span></div>
    </div>
    <div style="text-align:center;"><a href="${TEST_URL}" class="btn">Enter Test Now →</a></div>`;

  return wrapEmail(content, "🚀 Test is Live!", "Your test has started");
}

function qualifiedHtml(test, userName) {
  const content = `
    <div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">🎓</div></div>
    <h2 style="margin:0 0 8px;color:#166534;text-align:center;">You Qualified!</h2>
    ${userName ? `<p style="color:#475569;text-align:center;">Congratulations, <strong>${userName}</strong>!</p>` : ""}
    <h3 style="color:#1e40af;text-align:center;margin:0 0 16px;">${test.title}</h3>
    <div class="info-box">
      <div class="info-row"><span>Result</span><span><span class="badge badge-green">✅ Qualified</span></span></div>
      <div class="info-row"><span>Next Step</span><span>Awaiting admin approval for prizes</span></div>
    </div>
    <div style="text-align:center;"><a href="${TEST_URL}" class="btn">Check Results →</a></div>`;

  return wrapEmail(content, "🎓 AIDLA Test", "Qualification confirmed!");
}

// ── Helper ─────────────────────────────────────────────────────────────────────

async function sendEmail(admin, to, subject, html) {
  // Send one email per recipient so no user sees others' addresses
  let sentCount = 0;
  const failedEmails = [];

  for (const email of to) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-blast-email`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ to: [email], subject, html, from_email: FROM_EMAIL, from_name: FROM_NAME }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (res?.ok) sentCount++;
    else failedEmails.push(email);
  }

  await admin.from("email_logs").insert({
    subject, html_body: html,
    from_email: FROM_EMAIL, from_name: FROM_NAME,
    recipients: to, recipient_count: to.length,
    sent_count:   sentCount,
    failed_count: failedEmails.length,
    failed_emails: failedEmails,
    status: failedEmails.length > 0
      ? (sentCount > 0 ? "partial" : "failed")
      : "sent",
  }).catch(() => {});

  return { sent: sentCount };
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { test_id, type } = await request.json();
  if (!test_id || !type) {
    return NextResponse.json({ error: "test_id and type required" }, { status: 400 });
  }

  const { data: test, error: testErr } = await auth.admin
    .from("test_tests").select("*").eq("id", test_id).single();
  if (testErr || !test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

  try {
    // ── new_test: blast to all users ──────────────────────────────────────────
    if (type === "new_test") {
      const [{ data: prizes = [] }, { data: sponsors = [] }, { data: profiles = [] }] = await Promise.all([
        auth.admin.from("test_prizes").select("rank_no,prize_type,prize_text,coins_amount").eq("test_id", test_id).eq("enabled", true).order("rank_no"),
        auth.admin.from("test_sponsors").select("name").eq("test_id", test_id).eq("enabled", true),
        auth.admin.from("users_profiles").select("email").not("email", "is", null),
      ]);
      const emails = profiles.map(p => p.email).filter(Boolean);
      if (!emails.length) return NextResponse.json({ ok: true, sent: 0, note: "No users" });

      const result = await sendEmail(
        auth.admin, emails,
        `⚡ New Test Available — ${test.title}`,
        announcementHtml(test, prizes, sponsors),
      );
      return NextResponse.json({ ok: true, ...result });
    }

    // ── test_started: only registered users ──────────────────────────────────
    if (type === "test_started") {
      const { data: regs = [] } = await auth.admin
        .from("test_registrations").select("user_id").eq("test_id", test_id);
      if (!regs.length) return NextResponse.json({ ok: true, sent: 0, note: "No registrations" });

      const { data: profiles = [] } = await auth.admin
        .from("users_profiles").select("email").in("user_id", regs.map(r => r.user_id)).not("email", "is", null);
      const emails = profiles.map(p => p.email).filter(Boolean);
      if (!emails.length) return NextResponse.json({ ok: true, sent: 0 });

      const result = await sendEmail(
        auth.admin, emails,
        `🚀 Your test has started — ${test.title}`,
        startedHtml(test),
      );
      return NextResponse.json({ ok: true, ...result });
    }

    // ── test_ended_qualified: only users who passed ───────────────────────────
    if (type === "test_ended_qualified") {
      const { data: lb = [] } = await auth.admin
        .from("test_leaderboard").select("user_id").eq("test_id", test_id)
        .in("status", ["passed", "qualified", "finished"]);
      if (!lb.length) return NextResponse.json({ ok: true, sent: 0, note: "No qualified users" });

      const { data: profiles = [] } = await auth.admin
        .from("users_profiles").select("user_id,email,full_name")
        .in("user_id", lb.map(r => r.user_id)).not("email", "is", null);

      let sent = 0;
      for (const p of profiles) {
        if (!p.email) continue;
        await sendEmail(
          auth.admin, [p.email],
          `🎓 You qualified in ${test.title}!`,
          qualifiedHtml(test, p.full_name),
        ).catch(() => {});
        sent++;
      }
      return NextResponse.json({ ok: true, sent });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
