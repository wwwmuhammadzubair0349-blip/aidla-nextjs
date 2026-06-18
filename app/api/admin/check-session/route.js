// app/api/admin/check-session/route.js
// Server-side admin verification — replaces NEXT_PUBLIC_ADMIN_EMAIL client-side check.
// Called by useAuth.js and auth/callback/page.jsx with the user's Bearer token.
// Returns { isAdmin: true/false } — never throws, never leaks admin email.
import { verifyAdmin } from "@/lib/adminAuth";

export const runtime = "edge";

export async function POST(request) {
  const result = await verifyAdmin(request);
  return Response.json({ isAdmin: result.ok });
}
