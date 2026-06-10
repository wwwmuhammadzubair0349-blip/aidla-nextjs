// app/api/admin/tests/route.js
// Server-side protected CRUD for test_tests.
// All mutations verify admin identity via SUPABASE_SERVICE_ROLE_KEY before touching the DB.

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

// POST: create test
export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { data, error } = await auth.admin
    .from("test_tests")
    .insert([{ ...body }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}

// PUT: update test — blocks mutations to live tests (except status/schedule fields)
export async function PUT(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body       = await request.json();
  const { id, ...payload } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Prevent modifying core settings while test is live
  const { data: existing } = await auth.admin
    .from("test_tests")
    .select("status")
    .eq("id", id)
    .single();

  if (existing?.status === "live" && payload.status === "live") {
    const LIVE_ALLOWED = new Set(["status", "updated_at", "results_announce_at", "test_end_at"]);
    const restricted = Object.keys(payload).filter(k => !LIVE_ALLOWED.has(k));
    if (restricted.length > 0) {
      return NextResponse.json(
        { error: "Cannot edit a live test. Only status and schedule fields can change." },
        { status: 400 }
      );
    }
  }

  const { error } = await auth.admin.from("test_tests").update(payload).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE: soft-delete — blocked for live tests
export async function DELETE(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: existing } = await auth.admin
    .from("test_tests")
    .select("status")
    .eq("id", id)
    .single();

  if (existing?.status === "live") {
    return NextResponse.json({ error: "Cannot delete a live test." }, { status: 400 });
  }

  const { error } = await auth.admin
    .from("test_tests")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
