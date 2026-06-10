// app/api/admin/tests/generate-candidates/route.js
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

export async function POST(request) {
  const auth = await verifyAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { test_id } = await request.json();
  if (!test_id) return NextResponse.json({ error: "test_id required" }, { status: 400 });

  const { data, error } = await auth.admin.rpc("test_generate_candidates", {
    p_test_id: test_id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data?.ok) return NextResponse.json({ error: data?.error || "Generate failed" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
