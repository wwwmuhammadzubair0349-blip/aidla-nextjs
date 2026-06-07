import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

// Robust multipart parser — works when Content-Type header is stripped.
// Uses latin1 (1:1 byte mapping) so binary file data survives string ops.
// Handles both \r\n and \n line endings.
async function parseMultipart(request) {
  const buffer = await request.arrayBuffer();
  const bytes  = new Uint8Array(buffer);

  console.log("[upload-resource] Raw body size:", bytes.length);
  if (bytes.length === 0) throw new Error("Empty request body");

  // Hex preview of first 150 bytes for debugging
  console.log("[upload-resource] Body hex[0-150]:",
    Array.from(bytes.slice(0, 150)).map(b => b.toString(16).padStart(2,"0")).join(" "));

  // Decode with latin1 — safe for binary
  const body = new TextDecoder("latin1").decode(bytes);

  // Detect line ending style
  const crlfPos = body.indexOf("\r\n");
  const lfPos   = body.indexOf("\n");
  let nl = "\r\n";
  if (crlfPos === -1 && lfPos !== -1) nl = "\n";
  else if (crlfPos !== -1 && lfPos !== -1 && lfPos < crlfPos) nl = "\n";

  // Find first line (the boundary line: --<boundary>)
  const firstLineEnd = nl === "\r\n" ? body.indexOf("\r\n") : body.indexOf("\n");
  if (firstLineEnd === -1) {
    throw new Error(
      `No line ending found. Size=${bytes.length} ` +
      `first20bytes=${Array.from(bytes.slice(0,20)).map(b=>b.toString(16).padStart(2,"0")).join(" ")}`
    );
  }

  const firstLine = body.slice(0, firstLineEnd);
  console.log("[upload-resource] First line:", JSON.stringify(firstLine));

  if (!firstLine.startsWith("--")) {
    throw new Error(`Expected boundary marker (--), got: ${JSON.stringify(firstLine.slice(0, 60))}`);
  }

  const boundary = firstLine.slice(2).replace(/[\r\n]+$/, "");
  if (!boundary) throw new Error("Empty boundary");
  console.log("[upload-resource] Boundary:", boundary, "| nl:", nl === "\r\n" ? "CRLF" : "LF");

  const fields   = {};
  const sections = body.split("--" + boundary);

  for (const section of sections) {
    // Each part starts with the nl after the boundary
    if (!section.startsWith(nl)) continue;

    const doubleNl  = nl + nl;
    const headerEnd = section.indexOf(doubleNl);
    if (headerEnd === -1) continue;

    const headersStr = section.slice(nl.length, headerEnd);
    let   content    = section.slice(headerEnd + doubleNl.length);
    // Strip trailing nl (boundary separator)
    if (content.endsWith(nl)) content = content.slice(0, -nl.length);

    const dispositionMatch = headersStr.match(
      /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i
    );
    if (!dispositionMatch) continue;

    const name     = dispositionMatch[1];
    const filename = dispositionMatch[2];

    if (filename !== undefined) {
      const ctMatch     = headersStr.match(/Content-Type:\s*([^\r\n]+)/i);
      const contentType = ctMatch ? ctMatch[1].trim() : "application/octet-stream";
      const fileBytes   = new Uint8Array(content.length);
      for (let i = 0; i < content.length; i++) fileBytes[i] = content.charCodeAt(i) & 0xff;
      fields[name] = { filename, contentType, bytes: fileBytes, size: fileBytes.length };
    } else {
      fields[name] = content;
    }
  }

  return fields;
}

export async function POST(request) {
  console.log("[upload-resource] Request received");
  console.log("[upload-resource] Content-Type:", request.headers.get("content-type"));

  // ── Parse body ──────────────────────────────────────────
  let fields;
  try {
    const ct = request.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data") && ct.includes("boundary=")) {
      // Native formData — Content-Type header intact
      const fd = await request.formData();
      console.log("[upload-resource] Native formData keys:", [...fd.keys()]);
      fields = {};
      for (const [k, v] of fd.entries()) {
        if (v instanceof File) {
          const ab = await v.arrayBuffer();
          fields[k] = { filename: v.name, contentType: v.type, bytes: new Uint8Array(ab), size: v.size };
        } else {
          fields[k] = v;
        }
      }
    } else {
      // Header stripped — parse raw body
      console.log("[upload-resource] Using manual multipart parser (header stripped)");
      fields = await parseMultipart(request);
    }

    console.log("[upload-resource] Parsed fields:", Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [
        k,
        v && typeof v === "object" && "filename" in v
          ? `FILE:${v.filename}(${v.size}b)`
          : String(v).slice(0, 100),
      ])
    ));
  } catch (e) {
    console.error("[upload-resource] Parse error:", e.message);
    return NextResponse.json({ ok: false, error: "Body parse failed: " + e.message }, { status: 400 });
  }

  const get = (key) => (typeof fields[key] === "string" ? fields[key].trim() : undefined);

  // ── Auth ────────────────────────────────────────────────
  const secretKey = get("secret_key");
  if (!secretKey || secretKey !== process.env.UPLOAD_API_SECRET) {
    console.warn("[upload-resource] Unauthorized. Received key:", secretKey ? "[present]" : "[missing]");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  console.log("[upload-resource] Auth passed");

  // ── Fields ──────────────────────────────────────────────
  const fileField   = fields["file"];
  const title       = get("grok_title")       || get("title");
  const description = get("grok_description") || get("description") || "";
  const category    = get("category");
  const language    = get("language")    || "en";
  const subject     = get("subject")     || null;
  const class_level = get("class_level") || null;
  const university  = get("university")  || null;
  const year        = get("year")        || null;
  const tagsRaw     = get("tags")        || "";
  const tags        = tagsRaw ? tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  const access      = get("access")  || "free";
  const status      = get("status")  || "published";

  console.log("[upload-resource] title:", title, "| category:", category, "| file:", fileField?.filename);

  // ── Validate ────────────────────────────────────────────
  if (!title)          return NextResponse.json({ ok: false, error: "title is required" },    { status: 400 });
  if (!category)       return NextResponse.json({ ok: false, error: "category is required" }, { status: 400 });
  if (!fileField?.bytes) return NextResponse.json({ ok: false, error: "file is required" },   { status: 400 });

  const ALLOWED = ["notes","past_papers","thesis","templates","books","video_link","external_link","other"];
  if (!ALLOWED.includes(category)) {
    return NextResponse.json({ ok: false, error: `Invalid category. Allowed: ${ALLOWED.join(", ")}` }, { status: 400 });
  }

  // ── Supabase ────────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // ── Upload file ─────────────────────────────────────────
  const ext         = fileField.filename.split(".").pop()?.toLowerCase() || "bin";
  const safeFile    = slugify(fileField.filename.replace(/\.[^.]+$/, "")) + "." + ext;
  const storagePath = `uploads/${process.env.ADMIN_USER_ID}/${Date.now()}-${safeFile}`;

  console.log("[upload-resource] Uploading:", storagePath, "| size:", fileField.size);

  const { error: uploadError } = await supabase.storage
    .from("study-materials")
    .upload(storagePath, fileField.bytes, {
      contentType: fileField.contentType || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    console.error("[upload-resource] Upload failed:", uploadError.message);
    return NextResponse.json({ ok: false, error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const { data: pubData } = supabase.storage.from("study-materials").getPublicUrl(storagePath);
  const fileUrl  = pubData.publicUrl;
  const fileType = get("file_type") || getFileType(fileField.filename);
  console.log("[upload-resource] File URL:", fileUrl);

  // ── Slug + RPC ──────────────────────────────────────────
  const slug = slugify(title);

  const { data: rpcData, error: rpcError } = await supabase.rpc("study_materials_admin_upsert", {
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
    p_file_size_bytes:  fileField.size || null,
    p_external_url:     null,
    p_access:           access,
    p_meta_title:       null,
    p_meta_description: null,
    p_status:           status,
  });

  if (rpcError) {
    console.error("[upload-resource] RPC error:", rpcError.message);
    return NextResponse.json({ ok: false, error: "DB error: " + rpcError.message }, { status: 500 });
  }
  if (!rpcData?.ok) {
    console.error("[upload-resource] RPC not ok:", rpcData?.error);
    return NextResponse.json({ ok: false, error: rpcData?.error || "Save failed" }, { status: 500 });
  }
  console.log("[upload-resource] RPC success, slug:", slug);

  // ── Admin fields ────────────────────────────────────────
  const { data: inserted } = await supabase
    .from("study_materials").select("id").eq("slug", slug).maybeSingle();

  if (inserted?.id) {
    await supabase.from("study_materials").update({
      is_free:         true,
      coin_price:      0,
      uploader_type:   "admin",
      approval_status: "approved",
    }).eq("id", inserted.id);
    console.log("[upload-resource] Admin fields set on id:", inserted.id);
  }

  console.log("[upload-resource] Done ✓");
  return NextResponse.json({ ok: true, file_url: fileUrl, slug, title });
}
