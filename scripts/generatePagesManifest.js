/**
 * Build-time script: Scans the app/ directory for all page.jsx files,
 * categorizes them as public, user, or admin, and generates a JSON manifest.
 *
 * Run via: node scripts/generatePagesManifest.js
 * Or add to package.json scripts: "prebuild": "node scripts/generatePagesManifest.js"
 */

const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(process.cwd(), "app");
const OUTPUT_FILE = path.join(process.cwd(), "public", "pages-manifest.json");

/**
 * Convert a file path like "app/user/cv-maker/page.jsx" to a route "/user/cv-maker"
 */
function pathToRoute(filePath) {
  let route = filePath
    .replace(/^app\//, "/")
    .replace(/\/page\.jsx$/, "");

  if (!route.startsWith("/")) {
    route = "/" + route;
  }

  if (route === "/") return "/";

  return route;
}

/**
 * Extract a human-readable title from a route path
 * e.g., "/user/cv-maker" -> "CV Maker"
 */
function routeToTitle(route) {
  const parts = route.replace(/^\//, "").split("/");
  const lastPart = parts[parts.length - 1];

  if (!lastPart || lastPart === "page") {
    return parts[parts.length - 2] || "Home";
  }

  // Handle dynamic route segments like [slug], [id], [certId]
  if (lastPart.startsWith("[") && lastPart.endsWith("]")) {
    const parent = parts[parts.length - 2];
    if (parent) {
      return routeToTitle(parent) + " Detail";
    }
    return "Detail";
  }

  return lastPart
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Categorize a route based on its path
 */
function categorizeRoute(route) {
  if (route.startsWith("/admin")) return "admin";
  if (route.startsWith("/user")) return "user";
  return "public";
}

/**
 * Recursively scan the app directory for page.jsx files
 */
function scanPages(dir, relativePath = "") {
  const pages = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = relativePath ? `${relativePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      if (item.name.startsWith("_") || item.name.startsWith(".")) continue;
      pages.push(...scanPages(fullPath, relPath));
    } else if (item.name === "page.jsx" || item.name === "page.tsx") {
      const route = pathToRoute(`app/${relPath}`);
      const category = categorizeRoute(route);

      if (category === "admin") continue;

      pages.push({
        route,
        category,
        title: routeToTitle(route),
        description: null,
      });
    }
  }

  return pages;
}

/**
 * Try to read pageInfo from a page file
 */
function enrichWithPageInfo(pages) {
  for (const page of pages) {
    const filePath = path.join(
      APP_DIR,
      page.route.replace(/^\//, ""),
      "page.jsx"
    );

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const pageInfoMatch = content.match(
          /export\s+(?:const|let|var)\s+pageInfo\s*=\s*({[\s\S]*?})/
        );
        if (pageInfoMatch) {
          const infoStr = pageInfoMatch[1]
            .replace(/'/g, '"')
            .replace(/(\w+):/g, '"$1":');
          try {
            const info = JSON.parse(infoStr);
            if (info.title) page.title = info.title;
            if (info.description) page.description = info.description;
          } catch {
            // Ignore parse errors
          }
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  return pages;
}

/**
 * Main execution
 */
function main() {
  console.log("🔍 Scanning app/ directory for pages...");

  let pages = scanPages(APP_DIR);
  pages = enrichWithPageInfo(pages);

  pages.sort((a, b) => {
    if (a.category !== b.category) {
      const order = { public: 0, user: 1, admin: 2 };
      return order[a.category] - order[b.category];
    }
    return a.route.localeCompare(b.route);
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    categories: {
      public: pages.filter((p) => p.category === "public").length,
      user: pages.filter((p) => p.category === "user").length,
    },
    pages,
  };

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  console.log(`✅ Generated pages manifest: ${OUTPUT_FILE}`);
  console.log(`   📄 Public pages: ${manifest.categories.public}`);
  console.log(`   👤 User pages: ${manifest.categories.user}`);
  console.log(`   🚫 Admin pages: excluded`);
}

main();
