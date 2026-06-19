#!/usr/bin/env node
// Converts all admin/* and user/* page.jsx files to thin-shell + ssr:false pattern.
// For re-exports: wraps the existing Content file with dynamic ssr:false.
// For inline components: moves code to *Content.jsx and creates thin shell.

const fs = require("fs");
const path = require("path");

const PAGES = [
  "app/admin/AdminHome/page.jsx",
  "app/admin/AdminProjects/page.jsx",
  "app/admin/AdminStudyMaterials/page.jsx",
  "app/admin/AutoBlogTab/page.jsx",
  "app/admin/AutoNewsTab/page.jsx",
  "app/admin/FeedAdmin/page.jsx",
  "app/admin/adminfaqs/page.jsx",
  "app/admin/battle/page.jsx",
  "app/admin/blogs/page.jsx",
  "app/admin/courses/page.jsx",
  "app/admin/dailyquizz/page.jsx",
  "app/admin/deposits/page.jsx",
  "app/admin/email-blast/page.jsx",
  "app/admin/homepage/page.jsx",
  "app/admin/invite/page.jsx",
  "app/admin/leaderboard/page.jsx",
  "app/admin/lucky-draw/page.jsx",
  "app/admin/lucky-wheel/page.jsx",
  "app/admin/mining/page.jsx",
  "app/admin/news/page.jsx",
  "app/admin/page.jsx",
  "app/admin/reviews/page.jsx",
  "app/admin/shop/page.jsx",
  "app/admin/tests/page.jsx",
  "app/admin/users/page.jsx",
  "app/admin/withdraws/page.jsx",
  "app/user/aidla-ai/page.jsx",
  "app/user/certificate/[certId]/page.jsx",
  "app/user/changelog/page.jsx",
  "app/user/course/[id]/page.jsx",
  "app/user/cover-letter/page.jsx",
  "app/user/cv-maker/page.jsx",
  "app/user/lucky-draw/page.jsx",
  "app/user/lucky-wheel/page.jsx",
  "app/user/mining/page.jsx",
  "app/user/onboarding/page.jsx",
  "app/user/page.jsx",
  "app/user/profile/[userId]/page.jsx",
  "app/user/profile/page.jsx",
  "app/user/projects/page.jsx",
  "app/user/resources/page.jsx",
  "app/user/shop/page.jsx",
  "app/user/test/page.jsx",
  "app/user/wallet/page.jsx",
  "app/user/wallet/transactions/page.jsx",
  "app/user/wallet/withdraw/page.jsx",
];

// Derive a PascalCase component name from a directory path segment
function toPascal(str) {
  return str
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

let converted = 0;
let skipped = 0;

for (const rel of PAGES) {
  const absPath = path.resolve(rel);
  if (!fs.existsSync(absPath)) {
    console.log(`SKIP (not found): ${rel}`);
    skipped++;
    continue;
  }

  const src = fs.readFileSync(absPath, "utf-8");

  // Already a thin shell — skip
  if (src.includes("ssr: false")) {
    console.log(`SKIP (already thin): ${rel}`);
    skipped++;
    continue;
  }

  const dir = path.dirname(absPath);
  const dirName = path.basename(dir); // e.g. "AdminHome", "lucky-draw", "[certId]"

  // Case A: re-export pattern  →  export { default } from "./XXX"
  const reExportMatch = src.match(/export\s*\{\s*default\s*\}\s*from\s*["'](.+?)["']/);
  if (reExportMatch) {
    const importPath = reExportMatch[1]; // e.g. "./CertificateClient"
    const compName = toPascal(importPath.replace(/^\.\//, ""));
    const fnName = toPascal(dirName) + "Page";
    const shell = `"use client";\nimport dynamic from "next/dynamic";\nconst ${compName} = dynamic(() => import("${importPath}"), { ssr: false });\nexport default function ${fnName}() { return <${compName} />; }\n`;
    fs.writeFileSync(absPath, shell, "utf-8");
    console.log(`CONVERTED (re-export): ${rel} → wraps ${importPath} with ssr:false`);
    converted++;
    continue;
  }

  // Case B: inline component — move to *Content.jsx and create thin shell
  // Derive component name from "export default function XXX"
  const fnMatch = src.match(/export\s+default\s+function\s+(\w+)/);
  let compName;
  if (fnMatch) {
    compName = fnMatch[1];
  } else {
    // arrow/anonymous — derive from directory
    compName = toPascal(dirName);
  }

  const contentFile = path.join(dir, `${compName}Content.jsx`);

  // Write content file with original source
  fs.writeFileSync(contentFile, src, "utf-8");

  // Write thin shell
  const shell = `"use client";\nimport dynamic from "next/dynamic";\nconst ${compName}Content = dynamic(() => import("./${compName}Content"), { ssr: false });\nexport default function ${compName}() { return <${compName}Content />; }\n`;
  fs.writeFileSync(absPath, shell, "utf-8");
  console.log(`CONVERTED (inline): ${rel} → ${compName}Content.jsx`);
  converted++;
}

console.log(`\nDone: ${converted} converted, ${skipped} skipped.`);
