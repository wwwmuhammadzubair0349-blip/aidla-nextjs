// app/robots.js

export default function robots() {
  return {
    host: "https://www.aidla.online",
    sitemap: "https://www.aidla.online/sitemap.xml",

    rules: [
      // Default rule — deny-list (allow everything except private routes)
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/admin/",
          "/user/",
          "/api/",
          "/forgot-password",
          "/reset-password",
          "/email-confirmed",
        ],
      },

      // AI Crawlers — explicitly permitted for full site
      { userAgent: "GPTBot",                allow: "/" },
      { userAgent: "ChatGPT-User",          allow: "/" },
      { userAgent: "Google-Extended",       allow: "/" },
      { userAgent: "ClaudeBot",             allow: "/" },
      { userAgent: "Claude-Web",            allow: "/" },
      { userAgent: "anthropic-ai",          allow: "/" },
      { userAgent: "PerplexityBot",         allow: "/" },
      { userAgent: "Amazonbot",             allow: "/" },
      { userAgent: "Bytespider",            allow: "/" },
      { userAgent: "CCBot",                 allow: "/" },
      { userAgent: "Applebot",              allow: "/" },
      { userAgent: "Applebot-Extended",     allow: "/" },
      { userAgent: "meta-externalagent",    allow: "/" },
      { userAgent: "FacebookBot",           allow: "/" },
      { userAgent: "meta-externalfetcher",  allow: "/" },
      { userAgent: "OAI-SearchBot",         allow: "/" },
      { userAgent: "YouBot",                allow: "/" },
      { userAgent: "Diffbot",               allow: "/" },
      { userAgent: "ImagesiftBot",          allow: "/" },
      { userAgent: "cohere-ai",             allow: "/" },
      { userAgent: "omgili",                allow: "/" },
      { userAgent: "Grok",                  allow: "/" },
      { userAgent: "ia_archiver",           allow: "/" },
      { userAgent: "Gemini-AI-Bot",         allow: "/" },
      { userAgent: "MistralBot",            allow: "/" },
      { userAgent: "Kangaroo Bot",          allow: "/" },
      { userAgent: "PetalBot",              allow: "/" },
    ],
  };
}
