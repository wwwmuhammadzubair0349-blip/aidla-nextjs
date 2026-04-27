// app/sitemap.js

export const revalidate = 3600;

function toDate(ts) {
  if (!ts) return new Date();
  return new Date(ts);
}

async function fetchTable(table, select, filters = []) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 🛡️ Guard: skip fetch if env vars are missing (build time)
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

  const [blogs, news, faqs, studyMaterials] = await Promise.all([
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
  ]);

  const staticPages = [
    { url: `${base}/`, priority: 1.0 },
    { url: `${base}/about` },
    { url: `${base}/contact` },
    { url: `${base}/privacy-policy` },
    { url: `${base}/terms` },
    { url: `${base}/blogs` },
    { url: `${base}/news` },
    { url: `${base}/faqs` },
    { url: `${base}/resources` },
    { url: `${base}/leaderboard` },
    { url: `${base}/tools` },
    { url: `${base}/tools/ai/summarizer` },
    { url: `${base}/tools/ai/paraphraser` },
    { url: `${base}/tools/ai/email-writer` },
    { url: `${base}/tools/ai/interview-prep` },
    { url: `${base}/tools/ai/linkedin-bio` },
    { url: `${base}/tools/ai/autotube` },
    { url: `${base}/tools/career/cv-maker` },
    { url: `${base}/tools/career/cover-letter-maker` },
  ];

  const blogPages = blogs.map(b => ({
    url: `${base}/blogs/${b.slug}`,
    lastModified: toDate(b.updated_at || b.created_at),
  }));

  const newsPages = news.map(n => ({
    url: `${base}/news/${n.slug}`,
    lastModified: toDate(n.updated_at || n.created_at),
  }));

  const faqPages = faqs.map(f => ({
    url: `${base}/faqs/${f.slug}`,
    lastModified: toDate(f.updated_at || f.created_at),
  }));

  const resourcePages = studyMaterials.map(m => ({
    url: `${base}/resources/${m.slug}`,
    lastModified: toDate(m.updated_at || m.created_at),
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...newsPages,
    ...faqPages,
    ...resourcePages,
  ];
}