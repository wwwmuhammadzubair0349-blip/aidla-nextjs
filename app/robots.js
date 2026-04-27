// app/robots.js

export default function robots() {
  return {
    host: "https://www.aidla.online",
    sitemap: "https://www.aidla.online/sitemap.xml",

    rules: [
      // Default rule //
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/blogs",
          "/blogs/",
          "/news",
          "/news/",
          "/faqs",
          "/faqs/",
          "/tools",
          "/tools/",
          "/leaderboard",
          "/contact",
          "/privacy-policy",
          "/terms",
        ],
        disallow: [
          "/admin/",
          "/user/",
          "/signup",
          "/login",
          "/forgot-password",
          "/reset-password",
        ],
      },

      // AI Crawlers
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "meta-externalfetcher", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "YouBot", allow: "/" },
      { userAgent: "Diffbot", allow: "/" },
      { userAgent: "ImagesiftBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "omgili", allow: "/" },
      { userAgent: "Grok", allow: "/" },
      { userAgent: "ia_archiver", allow: "/" },
    ],
  };
}