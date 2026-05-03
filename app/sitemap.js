// app/sitemap.js

export const revalidate = 3600;

function toDate(ts) {
  if (!ts) return new Date();
  return new Date(ts);
}

async function fetchTable(table, select, filters = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) return [];

  const params = new URLSearchParams();
  params.set("select", select);
  filters.forEach(([key, value]) => params.set(key, value));

  const res = await fetch(`${baseUrl}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function sitemap() {
  const base = "https://www.aidla.online";
  const now  = new Date();

  const [blogs, news, faqs, studyMaterials, courses] = await Promise.all([
    fetchTable("blogs_posts", "slug,updated_at,created_at", [
      ["status", "eq.published"],
      ["deleted_at", "is.null"],
    ]),
    fetchTable("news_posts", "slug,updated_at,created_at", [
      ["status", "eq.published"],
      ["deleted_at", "is.null"],
    ]),
    fetchTable("faqs", "slug,updated_at,created_at", [
      ["status", "eq.published"],
      ["is_visible", "eq.true"],
    ]),
    fetchTable("study_materials", "slug,updated_at,created_at", [
      ["status", "eq.published"],
      ["deleted_at", "is.null"],
    ]),
    fetchTable("course_courses", "slug,updated_at,created_at", [
      ["status", "eq.published"],
    ]),
  ]);

  const staticPages = [
    {
      url: `${base}/`,
      priority: 1.0,
      changefreq: "daily",
      lastModified: now,
    },
    {
      url: `${base}/about`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/blogs`,
      priority: 0.9,
      changefreq: "daily",
      lastModified: now,
    },
    {
      url: `${base}/news`,
      priority: 0.9,
      changefreq: "hourly",
      lastModified: now,
    },
    {
      url: `${base}/faqs`,
      priority: 0.85,
      changefreq: "weekly",
      lastModified: now,
    },
    {
      url: `${base}/resources`,
      priority: 0.85,
      changefreq: "weekly",
      lastModified: now,
    },
    {
      url: `${base}/leaderboard`,
      priority: 0.7,
      changefreq: "hourly",
      lastModified: now,
    },
    {
      url: `${base}/tools`,
      priority: 0.85,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/ai/summarizer`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/ai/paraphraser`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/ai/email-writer`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/ai/interview-prep`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/ai/linkedin-bio`,
      priority: 0.8,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },

    {
      url: `${base}/tools/career/cv-maker`,
      priority: 0.85,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/tools/career/cover-letter-maker`,
      priority: 0.85,
      changefreq: "monthly",
      lastModified: new Date("2025-01-01"),
    },
    {
      url: `${base}/courses`,
      priority: 0.9,
      changefreq: "daily",
      lastModified: now,
    },
    {
      url: `${base}/contact`,
      priority: 0.6,
      changefreq: "monthly",
      lastModified: new Date("2026-01-01"),
    },
    {
      url: `${base}/privacy-policy`,
      priority: 0.3,
      changefreq: "yearly",
      lastModified: new Date("2026-01-01"),
    },
    {
      url: `${base}/terms`,
      priority: 0.3,
      changefreq: "yearly",
      lastModified: new Date("2026-01-01"),
    },
  ];

  const blogPages = blogs.map(b => ({
    url: `${base}/blogs/${b.slug}`,
    priority: 0.75,
    changefreq: "weekly",
    lastModified: toDate(b.updated_at || b.created_at),
  }));

  const newsPages = news.map(n => ({
    url: `${base}/news/${n.slug}`,
    priority: 0.8,
    changefreq: "daily",
    lastModified: toDate(n.updated_at || n.created_at),
  }));

  const faqPages = faqs.map(f => ({
    url: `${base}/faqs/${f.slug}`,
    priority: 0.7,
    changefreq: "monthly",
    lastModified: toDate(f.updated_at || f.created_at),
  }));

  const resourcePages = studyMaterials.map(m => ({
    url: `${base}/resources/${m.slug}`,
    priority: 0.7,
    changefreq: "monthly",
    lastModified: toDate(m.updated_at || m.created_at),
  }));

  const coursePages = courses.map(c => ({
    url: `${base}/courses/${c.slug}`,
    priority: 0.8,
    changefreq: "weekly",
    lastModified: toDate(c.updated_at || c.created_at),
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...newsPages,
    ...faqPages,
    ...resourcePages,
    ...coursePages,
  ];
}
