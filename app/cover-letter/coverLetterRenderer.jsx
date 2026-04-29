// Shared cover letter renderer — imported by wizard and dashboard

export const CL_TEMPLATES = [
  { id: "modern",    name: "Modern"    },
  { id: "classic",   name: "Classic"   },
  { id: "minimal",   name: "Minimal"   },
  { id: "executive", name: "Executive" },
];

export const CL_ACCENTS = [
  "#1e3a8a","#0f766e","#7c2d12","#4c1d95",
  "#065f46","#1f2937","#be123c","#0369a1",
];

const FF = {
  outfit:   "'Outfit',sans-serif",
  sora:     "'Sora',sans-serif",
  jakarta:  "'Plus Jakarta Sans',sans-serif",
  lora:     "'Lora','Georgia',serif",
  garamond: "'Cormorant Garamond','Georgia',serif",
  playfair: "'Playfair Display','Georgia',serif",
};

const GFONTS = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Sora:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:wght@400;500;600&family=Playfair+Display:wght@400;500;700&display=swap" rel="stylesheet">`;

export function buildCoverLetterHtml(data = {}, tmpl = "modern", accent = "#1e3a8a", fontId = "outfit") {
  const ff      = FF[fontId] || FF.outfit;
  const today   = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const contact = [
    data.email || "",
    data.phoneNum ? `${data.phoneCode || ""} ${data.phoneNum}`.trim() : "",
    data.location || "",
  ].filter(Boolean).join("  ·  ");

  const letter  = (data.letterContent || "").trim();
  const paras   = letter ? letter.split(/\n+/).filter(Boolean) : [];
  const body    = paras.map(p => `<p style="margin:0 0 14px;line-height:1.85;font-size:12.5px;color:#1a1a2e;">${p}</p>`).join("");
  const content = body || `<p style="color:#94a3b8;font-style:italic;font-size:13px;line-height:1.8;">Your cover letter will appear here.</p>`;

  const baseStyle = `<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:${ff};background:#fff;width:794px;min-height:1123px;}</style>`;
  const head      = `<head>${GFONTS}${baseStyle}</head>`;

  const recipientBlock = (data.targetCompany || data.targetRole) ? `<div style="margin-bottom:26px;">
    <div style="font-size:12px;font-weight:700;color:#0f172a;">Hiring Team${data.targetCompany ? `, ${data.targetCompany}` : ""}</div>
    ${data.targetRole ? `<div style="font-size:12px;color:#475569;margin-top:3px;">Re: ${data.targetRole}</div>` : ""}
  </div>` : "";

  if (tmpl === "modern") {
    return `<html>${head}<body><div style="width:794px;min-height:1123px;background:#fff;overflow:hidden;">
  <div style="background:${accent};padding:44px 56px 38px;position:relative;">
    <div style="position:absolute;top:0;right:0;width:200px;height:200px;background:rgba(255,255,255,.06);border-radius:0 0 0 100%;"></div>
    <div style="font-size:27px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:7px;">${data.fullName || "Your Name"}</div>
    ${data.currentTitle ? `<div style="font-size:12px;color:rgba(255,255,255,.75);font-weight:600;margin-bottom:5px;">${data.currentTitle}</div>` : ""}
    <div style="font-size:11px;color:rgba(255,255,255,.7);">${contact}</div>
  </div>
  <div style="padding:44px 56px;">
    <div style="font-size:11px;color:#94a3b8;margin-bottom:26px;">${today}</div>
    ${recipientBlock}${content}
  </div>
</div></body></html>`;
  }

  if (tmpl === "classic") {
    return `<html>${head}<body><div style="width:794px;min-height:1123px;background:#fff;padding:64px 68px;">
  <div style="font-size:28px;font-weight:800;color:${accent};letter-spacing:-.5px;margin-bottom:6px;">${data.fullName || "Your Name"}</div>
  ${data.currentTitle ? `<div style="font-size:12px;color:#64748b;font-weight:600;margin-bottom:5px;">${data.currentTitle}</div>` : ""}
  <div style="font-size:11px;color:#64748b;margin-bottom:4px;">${contact}</div>
  <div style="height:2px;background:${accent};margin:16px 0;border-radius:2px;opacity:.8;"></div>
  <div style="font-size:11px;color:#94a3b8;margin-bottom:20px;">${today}</div>
  ${(data.targetCompany || data.targetRole) ? `<div style="margin-bottom:26px;">
    <div style="font-size:12.5px;font-weight:700;color:#0f172a;">Hiring Team${data.targetCompany ? `, ${data.targetCompany}` : ""}</div>
    ${data.targetRole ? `<div style="font-size:12px;color:#475569;margin-top:3px;">Re: ${data.targetRole} Position</div>` : ""}
  </div>` : ""}
  ${content}
</div></body></html>`;
  }

  if (tmpl === "minimal") {
    return `<html>${head}<body><div style="width:794px;min-height:1123px;background:#fff;padding:72px 80px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;">
    <div>
      <div style="font-size:25px;font-weight:800;color:#0f172a;letter-spacing:-.5px;">${data.fullName || "Your Name"}</div>
      ${data.currentTitle ? `<div style="font-size:11.5px;color:#64748b;font-weight:600;margin-top:4px;">${data.currentTitle}</div>` : ""}
    </div>
    <div style="text-align:right;font-size:10.5px;color:#94a3b8;line-height:1.8;">${contact.split("  ·  ").join("<br>")}</div>
  </div>
  <div style="height:1px;background:#e2e8f0;margin-bottom:30px;"></div>
  <div style="font-size:11px;color:#94a3b8;margin-bottom:22px;">${today}</div>
  ${(data.targetCompany || data.targetRole) ? `<div style="margin-bottom:22px;">
    <div style="font-size:12.5px;font-weight:600;color:#334155;">${[data.targetCompany, data.targetRole].filter(Boolean).join("  ·  ")}</div>
  </div>` : ""}
  ${content}
</div></body></html>`;
  }

  // executive
  return `<html>${head}<body><div style="width:794px;min-height:1123px;background:#fff;display:flex;">
  <div style="width:7px;background:${accent};flex-shrink:0;"></div>
  <div style="flex:1;padding:64px 58px;">
    <div style="border-left:3px solid ${accent};padding-left:16px;margin-bottom:30px;">
      <div style="font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-.5px;margin-bottom:5px;">${data.fullName || "Your Name"}</div>
      ${data.currentTitle ? `<div style="font-size:11.5px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;">${data.currentTitle}</div>` : ""}
      <div style="font-size:11px;color:#64748b;">${contact}</div>
    </div>
    <div style="font-size:11px;color:#94a3b8;margin-bottom:20px;">${today}</div>
    ${(data.targetCompany || data.targetRole) ? `<div style="margin-bottom:22px;">
      <div style="font-size:12.5px;font-weight:700;color:#0f172a;">Hiring Manager${data.targetCompany ? `, ${data.targetCompany}` : ""}</div>
      ${data.targetRole ? `<div style="font-size:12px;color:#475569;margin-top:3px;">Re: ${data.targetRole}</div>` : ""}
    </div><div style="height:1px;background:#e2e8f0;margin-bottom:22px;"></div>` : ""}
    ${content}
  </div>
</div></body></html>`;
}

export function TemplateSVG({ id, accent = "#1e3a8a" }) {
  const c = accent;
  const rows = [28, 35, 42, 49, 56, 63];
  const widths = [52, 48, 50, 44, 52, 38];

  if (id === "modern") return (
    <svg viewBox="0 0 62 82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="62" height="22" fill={c}/>
      <rect x="5" y="6" width="32" height="5" rx="1" fill="rgba(255,255,255,.9)"/>
      <rect x="5" y="14" width="22" height="2.5" rx="1" fill="rgba(255,255,255,.5)"/>
      {rows.map((y, i) => <rect key={i} x="5" y={y} width={widths[i]} height="2.5" rx="1" fill="#e2e8f0"/>)}
    </svg>
  );

  if (id === "classic") return (
    <svg viewBox="0 0 62 82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="28" height="5" rx="1" fill={c}/>
      <rect x="5" y="12" width="18" height="2.5" rx="1" fill="#94a3b8"/>
      <rect x="0" y="19" width="62" height="2" rx="1" fill={c} fillOpacity=".6"/>
      <rect x="5" y="24" width="12" height="2" rx="1" fill="#cbd5e1"/>
      {rows.map((y, i) => <rect key={i} x="5" y={y} width={widths[i]} height="2.5" rx="1" fill="#e2e8f0"/>)}
    </svg>
  );

  if (id === "minimal") return (
    <svg viewBox="0 0 62 82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="25" height="5" rx="1" fill="#0f172a"/>
      <rect x="6" y="13" width="16" height="2.5" rx="1" fill="#94a3b8"/>
      <rect x="6" y="20" width="50" height="1" rx=".5" fill="#e2e8f0"/>
      <rect x="6" y="25" width="12" height="2" rx="1" fill="#cbd5e1"/>
      {rows.map((y, i) => <rect key={i} x="6" y={y} width={widths[i] - 2} height="2.5" rx="1" fill="#e2e8f0"/>)}
    </svg>
  );

  return ( // executive
    <svg viewBox="0 0 62 82" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="5" height="82" fill={c}/>
      <rect x="10" y="6" width="3" height="14" rx="1.5" fill={c} fillOpacity=".6"/>
      <rect x="16" y="7" width="25" height="5" rx="1" fill="#0f172a"/>
      <rect x="16" y="14" width="18" height="2.5" rx="1" fill="#94a3b8"/>
      <rect x="10" y="26" width="12" height="2" rx="1" fill="#cbd5e1"/>
      {rows.map((y, i) => <rect key={i} x="10" y={y} width={widths[i] - 4} height="2.5" rx="1" fill="#e2e8f0"/>)}
    </svg>
  );
}
