import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Module-level cache — persists across requests in the same Worker isolate
let wasmReady = false;
let fontCache  = null;

async function ensureFont() {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff2"
  );
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  fontCache = await res.arrayBuffer();
  return fontCache;
}

// Safe base64 for large Uint8Arrays (avoids stack overflow from spread)
function uint8ToBase64(bytes) {
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { html = "", width = 1080, height = 1080 } = body;

    if (!html.trim()) {
      return NextResponse.json(
        { success: false, error: "html is required" },
        { status: 400, headers: CORS }
      );
    }

    const w = Number(width)  || 1080;
    const h = Number(height) || 1080;

    // Load modules + font in parallel
    const [satoriMod, satoriHtmlMod, resvgMod, fontData] = await Promise.all([
      import("satori"),
      import("satori-html"),
      import("@resvg/resvg-wasm"),
      ensureFont(),
    ]);

    const satori  = satoriMod.default;
    const toVNode = satoriHtmlMod.html;
    const { Resvg, initWasm } = resvgMod;

    // Initialize resvg WASM once per isolate lifetime
    if (!wasmReady) {
      const wasmRes = await fetch(
        "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm"
      );
      if (!wasmRes.ok) throw new Error(`WASM fetch failed: ${wasmRes.status}`);
      await initWasm(wasmRes);
      wasmReady = true;
    }

    // HTML string → Satori VNode → SVG string
    const vnode = toVNode(html);
    const svg   = await satori(vnode, {
      width:  w,
      height: h,
      fonts:  [{ name: "Inter", data: fontData, weight: 400, style: "normal" }],
    });

    // SVG string → PNG bytes
    const resvg    = new Resvg(svg, { fitTo: { mode: "width", value: w } });
    const rendered = resvg.render();
    const pngBytes = new Uint8Array(rendered.asPng());

    const base64 = uint8ToBase64(pngBytes);

    return NextResponse.json(
      { success: true, image: `data:image/png;base64,${base64}` },
      { headers: CORS }
    );

  } catch (err) {
    console.error("html-to-png API error:", err.message, err.stack);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS }
    );
  }
}
