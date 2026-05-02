// next.config.ts
// Optimized for: Performance 100, Core Web Vitals, Image SEO, Technical SEO
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Compiler options ──
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ── Experimental: Modern browsers only = smaller JS bundles ──
  // This eliminates the "Legacy JavaScript" Lighthouse warning (13.5 KiB wasted)
  experimental: {
    // Optimize package imports to reduce unused JS
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-icons",
    ],
  },

  // ── Image Optimization (Image SEO + Performance) ──
  images: {
    // ─ Modern formats first: AVIF > WebP > original ─
    formats: ["image/avif", "image/webp"],
    // ─ Device sizes for responsive srcset ─
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year — fixes "No cache TTL" Lighthouse warning
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ── HTTP Headers ──
  async headers() {
    return [
      // ── Sitemap ──
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },

      // ── robots.txt ──
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },

      // ── Static assets (images, fonts) — long cache ──
      // Fixes "Use efficient cache lifetimes" Lighthouse warning for logo image
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ── Public static files (logo, favicon, og images) ──
      {
        source: "/:file(.*\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ── API routes (no cache) ──
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache" }],
      },

      // ── Security + Performance headers (all routes) ──
      {
        source: "/:path*",
        headers: [
          // Security
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.pexels.com https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co https://cloudflareinsights.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // Performance
          {
            key: "Link",
            value: [
              '<https://fonts.googleapis.com>; rel=preconnect',
              '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
            ].join(", "),
          },
        ],
      },

      // ── HTML pages — short cache with revalidation ──
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
          // Vary for proper CDN caching
          { key: "Vary", value: "Accept-Encoding, Accept" },
        ],
      },
    ];
  },

  // ── Redirects for SEO (301 permanent) ──
  async redirects() {
    return [
      // Ensure www canonical
      {
        source: "/:path*",
        has: [{ type: "host", value: "aidla.online" }],
        destination: "https://www.aidla.online/:path*",
        permanent: true,
      },
    ];
  },

  // ── Rewrites (Programmatic SEO) ──
  // async rewrites() {
  //   return [];
  // },

  // ── Compress responses ──
  compress: true,

  // ── Power headers for static export ──
  poweredByHeader: false, // Remove X-Powered-By for security + best practices
};

export default nextConfig;

// Dev-only Cloudflare init
if (process.env.NODE_ENV !== "production") {
  import("@opennextjs/cloudflare").then((m) =>
    m.initOpenNextCloudflareForDev()
  );
}