// app/api/admin/tests/approve-winners/route.js
// Server-side winner approval with audit log and automatic winner emails.

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

const FROM_EMAIL   = "noreply@aidla.online";
const FROM_NAME    = "AIDLA";
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL || "https://aidla.online";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function winnerHtml(testTitle, rankNo, prizeText) {
  const medal = rankNo === 1 ? "🥇 1st Place" : rankNo === 2 ? "🥈 2nd Place" : rankNo === 3 ? "🥉 3rd Place" : `#${rankNo}`;
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🏆</div>
      <h1 style="font-size:1.8rem;font-weight:900;color:#fbbf24;margin:0;">Congratulations!</h1>
      <p style="color:#94a3b8;margin:8px 0 0;">You are a winner!</p>
    </div>
    <h2 style="color:#60a5fa;text-align:center;margin:0 0 20px;">${testTitle}</h2>
    <div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
      <div style="color:#fbbf24;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">YOUR RANK</div>
      <div style="font-size:2rem;font-weight:900;color:#fbbf24;">${medal}</div>
    </div>
    ${prizeText ? `<div style="background:#1e293b;border-radius:10px;padding:16px;margin:16px 0;text-align:center;"><div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;">YOUR PRIZE</div><div style="color:#f1f5f9;font-size:1.2rem;font-weight:700;">${prizeText}</div></div>` : ""}
    <p style="color:#94a3b8;text-align:center;font-size:0.85rem;">Please contact AIDLA admin to claim your prize.</p>
    <div style="text-align:center;margin-top:20px;">
      <a href="${SITE_URL}/user/test" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;">View Results →</a>
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">AIDLA · Pakistan's Premier Learning Platform</p>
  </div>`;
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
