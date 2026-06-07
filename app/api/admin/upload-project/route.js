import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function slugify(str) {
  return String(str || "")
    .toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `idea-${Date.now()}`;
}

function getFileType(filename) {
  if (!filename) return "other";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["mp4", "mov", "avi"].includes(ext)) return "mp4";
  if (ext === "pdf") return "pdf";
  return "other";
}

async function parseMultipart(request) {
  const buffer = await request.arrayBuffer();
  const bytes  = new Uint8Array(buffer);

  console.log("[upload-project] Raw body size:", bytes.length);
  if (bytes.length === 0) throw new Error("Empty request body");

  console.log("[upload-project] Body hex[0-150]:",
    Array.from(bytes.slice(0, 150)).map(b => b.toString(16).padStart(2,"0")).join(" "));

  const body = new TextDecoder("latin1").decode(bytes);

  const crlfPos = body.indexOf("\r\n");
  const lfPos   = body.indexOf("\n");
  let nl = "\r\n";
  if (crlfPos === -1 && lfPos !== -1) nl = "\n";
  else if (crlfPos !== -1 && lfPos !== -1 && lfPos < crlfPos) nl = "\n";

  const firstLineEnd = nl === "\r\n" ? body.indexOf("\r\n") : body.indexOf("\n");
  if (firstLineEnd === -1) {
    throw new Error(
      `No line ending found. Size=${bytes.length} ` +
      `first20=${Array.from(bytes.slice(0,20)).map(b=>b.toString(16).padStart(2,"0")).join(" ")}`
    );
  }

  const firstLine = body.slice(0, firstLineEnd);
  if (!firstLine.startsWith("--")) {
    throw new Error(`Expected boundary (--), got: ${JSON.stringify(firstLine.slice(0, 60))}`);
  }

  const boundary = firstLine.slice(2).replace(/[\r\n]+$/, "");
  if (!boundary) throw new Error("Empty boundary");
  console.log("[upload-project] Boundary:", boundary, "| nl:", nl === "\r\n" ? "CRLF" : "LF");

  const fields   = {};
  const sections = body.split("--" + boundary);

  for (const section of sections) {
    if (!section.startsWith(nl)) continue;

    const doubleNl  = nl + nl;
    const headerEnd = section.indexOf(doubleNl);
    if (headerEnd === -1) continue;

    const headersStr = section.slice(nl.length, headerEnd);
    let   content    = section.slice(headerEnd + doubleNl.length);
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
  console.log("[upload-project] Request received");
  console.log("[upload-project] Content-Type:", request.headers.get("content-type"));

  // ── Parse body ──────────────────────────────────────────
  let fields;
  try {
    const ct = request.headers.get("content-type") || "";

    if (ct.includes("multipart/form-data") && ct.includes("boundary=")) {
      const fd = await request.formData();
      console.log("[upload-project] Native formData keys:", [...fd.keys()]);
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
      console.log("[upload-project] Using manual multipart parser (header stripped)");
      fields = await parseMultipart(request);
    }

    console.log("[upload-project] Parsed fields:", Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [
        k,
        v && typeof v === "object" && "filename" in v
          ? `FILE:${v.filename}(${v.size}b)`
          : String(v).slice(0, 100),
      ])
    ));
  } catch (e) {
    console.error("[upload-project] Parse error:", e.message);
    return NextResponse.json({ ok: false, error: "Body parse failed: " + e.message }, { status: 400 });
  }

  const get = (key) => (typeof fields[key] === "string" ? fields[key].trim() : undefined);

  // ── Auth ────────────────────────────────────────────────
  const secretKey = get("secret_key");
  if (!secretKey || secretKey !== process.env.UPLOAD_API_SECRET) {
    console.warn("[upload-project] Unauthorized");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  console.log("[upload-project] Auth passed");

  // ── Fields ──────────────────────────────────────────────
  const fileField        = fields["file"];
  const title            = get("title");
  const description      = get("description")       || null;
  const type             = get("type");
  const domain           = get("domain");
  const difficulty       = get("difficulty")        || null;
  const subject          = get("subject")           || null;
  const educational_level= get("educational_level") || null;
  const university       = get("university")        || null;
  const course           = get("course")            || null;
  const estimated_duration = get("estimated_duration") || null;
  const status           = get("status")            || "published";

  const tagsRaw      = get("tags")       || "";
  const techRaw      = get("tech_stack") || "";
  const featuresRaw  = get("features")   || "";
  const tags         = tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  const tech_stack   = techRaw.split(",").map(t => t.trim()).filter(Boolean);
  const features     = featuresRaw.split("\n").map(t => t.trim()).filter(Boolean);
  const team_size_min = Number(get("team_size_min")) || 1;
  const team_size_max = Number(get("team_size_max")) || 4;

  console.log("[upload-project] title:", title, "| type:", type, "| domain:", domain);

  // ── Validate ────────────────────────────────────────────
  if (!title)  return NextResponse.json({ ok: false, error: "title is required" },  { status: 400 });
  if (!type)   return NextResponse.json({ ok: false, error: "type is required" },   { status: 400 });
  if (!domain) return NextResponse.json({ ok: false, error: "domain is required" }, { status: 400 });

  const ALLOWED_TYPES   = ["fyp","mini_project","semester","research","internship","other"];
  const ALLOWED_DOMAINS = ["web","mobile","ai_ml","iot","blockchain","data_science","cybersecurity","ar_vr","other"];

  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return NextResponse.json({ ok: false, error: `Invalid domain. Allowed: ${ALLOWED_DOMAINS.join(", ")}` }, { status: 400 });
  }

  // ── Supabase ────────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // ── Upload file (optional) ──────────────────────────────
  let fileUrl  = null;
  let filePath = null;
  let fileType = null;
  let fileSize = null;

  if (fileField?.bytes?.length) {
    const ext      = fileField.filename.split(".").pop()?.toLowerCase() || "bin";
    const safeFile = slugify(fileField.filename.replace(/\.[^.]+$/, "")) + "." + ext;
    filePath = `uploads/${process.env.ADMIN_USER_ID}/${Date.now()}-${safeFile}`;

    console.log("[upload-project] Uploading:", filePath, "| size:", fileField.size);

    const { error: uploadError } = await supabase.storage
      .from("project-ideas")
      .upload(filePath, fileField.bytes, {
        contentType: fileField.contentType || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("[upload-project] Upload failed:", uploadError.message);
      return NextResponse.json({ ok: false, error: "Upload failed: " + uploadError.message }, { status: 500 });
    }

    const { data: pubData } = supabase.storage.from("project-ideas").getPublicUrl(filePath);
    fileUrl  = pubData.publicUrl;
    fileType = getFileType(fileField.filename);
    fileSize = fileField.size || null;
    console.log("[upload-project] File URL:", fileUrl);
  }

  // ── Slug + RPC ──────────────────────────────────────────
  const slug = slugify(get("slug") || title);
  console.log("[upload-project] Slug:", slug);

  const { data: rpcData, error: rpcError } = await supabase.rpc("project_ideas_admin_upsert", {
    p_id:                 null,
    p_title:              title,
    p_slug:               slug,
    p_description:        description,
    p_html_preview:       null,
    p_difficulty:         difficulty,
    p_type:               type,
    p_domain:             domain,
    p_subject:            subject,
    p_course:             course,
    p_educational_level:  educational_level,
    p_university:         university,
    p_tech_stack:         tech_stack,
    p_features:           features,
    p_challenges:         [],
    p_reference_links:    [],
    p_tags:               tags,
    p_team_size_min:      team_size_min,
    p_team_size_max:      team_size_max,
    p_estimated_duration: estimated_duration,
    p_file_url:           fileUrl,
    p_file_path:          filePath,
    p_file_type:          fileType,
    p_file_size_bytes:    fileSize,
    p_status:             status,
  });

  if (rpcError) {
    console.error("[upload-project] RPC error:", rpcError.message);
    return NextResponse.json({ ok: false, error: "DB error: " + rpcError.message }, { status: 500 });
  }
  if (!rpcData?.ok) {
    console.error("[upload-project] RPC not ok:", rpcData?.error);
    return NextResponse.json({ ok: false, error: rpcData?.error || "Save failed" }, { status: 500 });
  }

  console.log("[upload-project] Done ✓ slug:", slug);
  return NextResponse.json({ ok: true, slug, title });
}
