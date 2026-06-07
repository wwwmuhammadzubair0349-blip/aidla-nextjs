import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function slugify(str) {
  return String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `material-${Date.now()}`;
}

function getFileType(filename) {
  if (!filename) return "link";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["mp4", "mov", "avi"].includes(ext)) return "mp4";
  if (ext === "pdf") return "pdf";
  return "link";
}

export async function POST(request) {
  console.log("[upload-resource] Request received");

  // ── Auth check ──────────────────────────────────────────
  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    console.error("[upload-resource] Failed to parse formData:", e.message);
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const secretKey = formData.get("secret_key");
  if (!secretKey || secretKey !== process.env.UPLOAD_API_SECRET) {
    console.warn("[upload-resource] Unauthorized — invalid secret_key");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  console.log("[upload-resource] Auth passed");

  // ── Extract fields ──────────────────────────────────────
  const file          = formData.get("file");
  const grokTitle     = formData.get("grok_title")?.trim();
  const grokDesc      = formData.get("grok_description")?.trim();
  const rawTitle      = formData.get("title")?.trim();
  const title         = grokTitle || rawTitle;
  const description   = grokDesc  || formData.get("description")?.trim() || "";
  const category      = formData.get("category")?.trim();
  const language      = formData.get("language")?.trim()    || "en";
  const subject       = formData.get("subject")?.trim()     || null;
  const class_level   = formData.get("class_level")?.trim() || null;
  const university    = formData.get("university")?.trim()  || null;
  const year          = formData.get("year")?.trim()        || null;
  const tagsRaw       = formData.get("tags")?.trim()        || "";
  const tags          = tagsRaw ? tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  const access        = formData.get("access")?.trim()      || "free";
  const status        = formData.get("status")?.trim()      || "published";

  console.log("[upload-resource] Fields:", { title, category, language, subject, class_level, university, year, access, status });

  // ── Validate required fields ────────────────────────────
  if (!title) {
    return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ ok: false, error: "category is required" }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
  }

  const ALLOWED_CATEGORIES = ["notes", "past_papers", "thesis", "templates", "books", "video_link", "external_link", "other"];
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ ok: false, error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(", ")}` }, { status: 400 });
  }

  // ── Supabase service role client ────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // ── Upload file to Supabase storage ────────────────────
  const adminUserId = process.env.ADMIN_USER_ID;
  const safeFilename = slugify(file.name.replace(/\.[^.]+$/, "")) + "." + (file.name.split(".").pop()?.toLowerCase() || "bin");
  const storagePath = `uploads/${adminUserId}/${Date.now()}-${safeFilename}`;

  console.log("[upload-resource] Uploading to storage path:", storagePath);

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer  = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("study-materials")
    .upload(storagePath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    console.error("[upload-resource] Storage upload failed:", uploadError.message);
    return NextResponse.json({ ok: false, error: "File upload failed: " + uploadError.message }, { status: 500 });
  }
  console.log("[upload-resource] File uploaded successfully");

  const { data: pubData } = supabase.storage.from("study-materials").getPublicUrl(storagePath);
  const fileUrl  = pubData.publicUrl;
  const fileType = formData.get("file_type")?.trim() || getFileType(file.name);

  console.log("[upload-resource] Public URL:", fileUrl);

  // ── Generate slug ───────────────────────────────────────
  const slug = slugify(title);
  console.log("[upload-resource] Slug:", slug);

  // ── Call RPC ────────────────────────────────────────────
  const payload = {
    p_id:               null,
    p_title:            title,
    p_slug:             slug,
    p_description:      description,
    p_language:         language,
    p_category:         category,
    p_subject:          subject,
    p_class_level:      class_level,
    p_university:       university,
    p_year:             year,
    p_tags:             tags,
    p_file_url:         fileUrl,
    p_file_path:        storagePath,
    p_file_type:        fileType,
    p_file_size_bytes:  file.size || null,
    p_external_url:     null,
    p_access:           access,
    p_meta_title:       null,
    p_meta_description: null,
    p_status:           status,
  };

  console.log("[upload-resource] Calling RPC study_materials_admin_upsert");
  const { data: rpcData, error: rpcError } = await supabase.rpc("study_materials_admin_upsert", payload);

  if (rpcError) {
    console.error("[upload-resource] RPC error:", rpcError.message);
    return NextResponse.json({ ok: false, error: "Database error: " + rpcError.message }, { status: 500 });
  }
  if (!rpcData?.ok) {
    console.error("[upload-resource] RPC returned not ok:", rpcData?.error);
    return NextResponse.json({ ok: false, error: rpcData?.error || "Save failed" }, { status: 500 });
  }
  console.log("[upload-resource] RPC success");

  // ── Set admin fields on inserted record ─────────────────
  const { data: inserted } = await supabase
    .from("study_materials")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (inserted?.id) {
    console.log("[upload-resource] Setting admin fields on id:", inserted.id);
    await supabase
      .from("study_materials")
      .update({
        is_free:         true,
        coin_price:      0,
        uploader_type:   "admin",
        approval_status: "approved",
      })
      .eq("id", inserted.id);
  }

  console.log("[upload-resource] Done. Returning success.");
  return NextResponse.json({ ok: true, file_url: fileUrl, slug, title }, { status: 200 });
}
