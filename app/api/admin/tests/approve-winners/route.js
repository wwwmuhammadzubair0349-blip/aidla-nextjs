// app/api/admin/tests/approve-winners/route.js
// Server-side winner approval with audit log and automatic winner emails.

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

const FROM_EMAIL   = "noreply@aidla.online";
const FROM_NAME    = "AIDLA";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "https://aidla.online";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

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
  .badge-yellow{background:#fef3c7;color:#92400e;}
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

function winnerHtml(testTitle, rankNo, prizeText) {
  const medal = rankNo === 1 ? "🥇 1st Place" : rankNo === 2 ? "🥈 2nd Place" : rankNo === 3 ? "🥉 3rd Place" : `#${rankNo}`;
  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:56px;">🏆</div>
      <h2 style="color:#d97706;margin:8px 0;">Congratulations!</h2>
      <p style="color:#475569;margin:0;">You are a winner!</p>
    </div>
    <h3 style="color:#1e40af;text-align:center;margin:0 0 16px;">${testTitle}</h3>
    <div class="info-box">
      <div class="info-row"><span>Your Rank</span><span><span class="badge badge-yellow">${medal}</span></span></div>
      ${prizeText ? `<div class="info-row"><span>Prize</span><span><strong>${prizeText}</strong></span></div>` : ""}
    </div>
    <p style="color:#475569;text-align:center;font-size:14px;">Please contact AIDLA admin to claim your prize.</p>
    <div style="text-align:center;"><a href="${SITE_URL}/user/test" class="btn">View Results →</a></div>`;

  return wrapEmail(content, "🏆 AIDLA Test", "Winner announcement");
}

export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { test_id, winner_ids } = await request.json();
  if (!test_id || !Array.isArray(winner_ids) || winner_ids.length === 0) {
    return NextResponse.json({ error: "test_id and winner_ids required" }, { status: 400 });
  }

  // 1. Approve winners via RPC
  const { data, error } = await auth.admin.rpc("test_approve_winners", {
    p_test_id: test_id,
    p_winners: winner_ids,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.ok) return NextResponse.json({ error: data?.error || "Approve failed" }, { status: 400 });

  // 2. Audit log (stored in email_logs with [AUDIT] prefix — no schema change needed)
  await auth.admin.from("email_logs").insert({
    subject:         `[AUDIT] Winners approved — test ${test_id}`,
    html_body:       `Admin ${auth.user.email} approved winners [${winner_ids.join(", ")}] for test ${test_id} at ${new Date().toISOString()}`,
    from_email:      auth.user.email,
    from_name:       "Admin Audit",
    recipients:      [auth.user.email],
    recipient_count: 1,
    sent_count:      0,
    failed_count:    0,
    failed_emails:   [],
    status:          "sent",
  }).catch(() => {});

  // 3. Send winner emails
  try {
    const { data: test } = await auth.admin
      .from("test_tests").select("title").eq("id", test_id).single();

    const { data: winners = [] } = await auth.admin
      .from("test_winners")
      .select("rank_no, user_id, prize_text, user_name")
      .eq("test_id", test_id)
      .in("user_id", winner_ids);

    const userIds = winners.map(w => w.user_id).filter(Boolean);
    const { data: profiles = [] } = await auth.admin
      .from("users_profiles")
      .select("user_id, email")
      .in("user_id", userIds)
      .not("email", "is", null);

    const emailMap = Object.fromEntries(profiles.map(p => [p.user_id, p.email]));

    for (const w of winners) {
      const email = emailMap[w.user_id];
      if (!email) continue;

      const subject = `🏆 You won! — ${test?.title || "AIDLA Test"}`;
      const html    = winnerHtml(test?.title || "AIDLA Test", w.rank_no, w.prize_text);

      const _res = await fetch(`${SUPABASE_URL}/functions/v1/send-blast-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to: [email], subject, html, from_email: FROM_EMAIL, from_name: FROM_NAME }),
      }).catch(() => null);
      const result = _res ? await _res.json().catch(() => null) : null;

      await auth.admin.from("email_logs").insert({
        subject, html_body: html,
        from_email: FROM_EMAIL, from_name: FROM_NAME,
        recipients: [email], recipient_count: 1,
        sent_count: result?.sent_count ?? 1,
        failed_count: result?.failed_count ?? 0,
        failed_emails: result?.failed ?? [],
        status: "sent",
      }).catch(() => {});
    }
  } catch (_) {
    // Email errors don't block winner approval
  }

  return NextResponse.json({ ok: true });
}
