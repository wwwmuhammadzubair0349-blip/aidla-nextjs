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

function fmtUAE(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }) + " UAE";
}

// ── Templates ──────────────────────────────────────────────────────────────────

function announcementHtml(test, prizes, sponsors) {
  const prizeRows = prizes.map(p => {
    const medal = p.rank_no === 1 ? "🥇" : p.rank_no === 2 ? "🥈" : p.rank_no === 3 ? "🥉" : `#${p.rank_no}`;
    const label = p.prize_text || (p.prize_type === "coins" ? `${p.coins_amount} coins` : "Prize");
    return `<tr><td style="padding:6px 12px;color:#94a3b8;">${medal} Rank ${p.rank_no}</td><td style="padding:6px 12px;color:#f1f5f9;font-weight:700;">${label}</td></tr>`;
  }).join("");
  const sponsorNames = sponsors.map(s => s.name).join(", ");

  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:8px;">⚡</div>
      <h1 style="font-size:1.6rem;font-weight:900;color:#fff;margin:0;">New Test Available!</h1>
    </div>
    <h2 style="color:#60a5fa;margin:0 0 8px;">${test.title}</h2>
    ${test.description ? `<p style="color:#94a3b8;margin:0 0 16px;">${test.description}</p>` : ""}
    <div style="background:#1e293b;border-radius:10px;padding:16px;margin:16px 0;">
      <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">START TIME</div>
      <div style="color:#f1f5f9;font-size:1.1rem;font-weight:700;">${fmtUAE(test.test_start_at)}</div>
      <div style="color:#64748b;font-size:11px;margin-top:4px;">Registration open until test starts</div>
    </div>
    ${prizes.length > 0 ? `<div style="background:#1e293b;border-radius:10px;padding:16px;margin:16px 0;"><div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:10px;">🏆 PRIZES</div><table style="width:100%;border-collapse:collapse;">${prizeRows}</table></div>` : ""}
    ${sponsorNames ? `<div style="color:#64748b;font-size:12px;margin:12px 0;">Sponsored by: <strong style="color:#94a3b8;">${sponsorNames}</strong></div>` : ""}
    <div style="text-align:center;margin-top:28px;">
      <a href="${TEST_URL}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">Register Now →</a>
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">AIDLA · Pakistan's Premier Learning Platform</p>
  </div>`;
}

function startedHtml(test) {
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:8px;">🚀</div>
      <h1 style="font-size:1.6rem;font-weight:900;color:#4ade80;margin:0;">Your Test Has Started!</h1>
    </div>
    <h2 style="color:#60a5fa;text-align:center;margin:0 0 16px;">${test.title}</h2>
    <p style="color:#94a3b8;text-align:center;">The test is now live. Click below to enter immediately.</p>
    <div style="text-align:center;margin-top:28px;">
      <a href="${TEST_URL}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#15803d,#4ade80);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">Enter Test Now →</a>
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">AIDLA · Pakistan's Premier Learning Platform</p>
  </div>`;
}

function qualifiedHtml(test, userName) {
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:8px;">🎓</div>
      <h1 style="font-size:1.6rem;font-weight:900;color:#4ade80;margin:0;">You Qualified!</h1>
    </div>
    ${userName ? `<p style="color:#94a3b8;text-align:center;margin-bottom:8px;">Congratulations, <strong style="color:#f1f5f9;">${userName}</strong>!</p>` : ""}
    <h2 style="color:#60a5fa;text-align:center;margin:0 0 16px;">${test.title}</h2>
    <div style="background:#1e293b;border-radius:10px;padding:16px;margin:16px 0;text-align:center;">
      <div style="color:#4ade80;font-weight:700;margin-bottom:6px;">✅ Qualification Confirmed</div>
      <p style="color:#94a3b8;font-size:0.85rem;margin:0;">You passed the test. Awaiting admin approval for final results and prizes.</p>
    </div>
    <div style="text-align:center;margin-top:20px;">
      <a href="${TEST_URL}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">Check Results →</a>
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">AIDLA · Pakistan's Premier Learning Platform</p>
  </div>`;
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
