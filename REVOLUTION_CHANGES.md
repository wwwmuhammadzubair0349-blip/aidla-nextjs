# AIDLA SEO Revolution — Detailed Change Log

Newest entries at top.

---

## 2026-06-16 — Post-Revolution: Frontend Author Deduplication ✅ COMPLETE

**Root cause found:** Both admin pages had `AUTHOR_BYLINE` constant that re-injected the author card on every save, defeating the DB SQL cleanup.

### app/admin/blogs/page.jsx
- Removed `AUTHOR_BYLINE` constant (hardcoded rich HTML card)
- `onSave`: removed injection logic — `finalHtml` now uses `contentHtml` directly

### app/admin/news/page.jsx
- Same: removed `AUTHOR_BYLINE` constant and injection logic

### supabase/functions/auto-blog/index.ts
- Step 7 HTML assembly: removed `authorByline` — `finalHtml` now starts with `geoBlock`
- **ACTION REQUIRED:** `npx supabase functions deploy auto-blog`

### supabase/functions/auto-news/index.ts
- Step 8 HTML assembly: removed `authorByline` — `finalHtml` now starts with `geoBlock`
- **ACTION REQUIRED:** `npx supabase functions deploy auto-news`

### app/blogs/[slug]/BlogPostClient.jsx
- Removed `bp-author` div + separator dot from meta row (top compact byline gone)
- Added static `bp-author-card` after article content (before RelatedPosts): photo + name + role + LinkedIn + Author Profile links

### app/blogs/[slug]/BlogPost.css
- Added `.bp-author-card` and child class styles (blue theme)

### app/news/[slug]/NewsPageClient.jsx
- Removed `np-author` div + separator dot from meta row
- Added static `np-author-card` in the padded block before RelatedPosts

### app/news/[slug]/newspage.css
- Added `.np-author-card` and child class styles (amber theme)

---

## 2026-06-16 — Phase 10: Resume + Monitoring ✅ COMPLETE

### app/tools/page.jsx
- OG locale: `en_PK` → `en_US` (caught during 20-page QA sweep)

### supabase/migrations/20260616200000_auto_content_cron.sql — ✅ RUN LIVE 2026-06-16
- `auto-blog-daily` (job 33): pg_cron `0 6 * * *` → `net.http_post` to `/functions/v1/auto-blog` — active: true
- `auto-news-6h` (job 34): pg_cron `0 */6 * * *` → `net.http_post` to `/functions/v1/auto-news` — active: true
- `auto-faq-daily` (job 35): pg_cron `0 8 * * *` → `net.http_post` to `/functions/v1/auto-faq-generator` — active: true
- `auto-publish-scheduled` (job 36): pg_cron `*/5 * * * *` → `auto_publish_scheduled_posts()` RPC — active: true

### supabase/migrations/20260616120000_news_seo_update_rpc.sql — ✅ RUN LIVE 2026-06-16
- `news_update_seo_data()` SECURITY DEFINER RPC created — allows auto-news to update word_count/meta without RLS block

### supabase/migrations/20260616200001_admin_monitoring_views.sql — ✅ RUN LIVE 2026-06-16
- `aidla_content_dashboard` view: total_published, new_last_7d, new_last_30d, avg_word_count, avg_views, last_created_at per content type (blogs, news, faqs, resources, projects)
- `aidla_recent_quality` view: last 7 days of blog + news posts with status, word_count, view_count for daily QA
- Both views granted SELECT to `authenticated` and `anon`

### 20-Page QA Sweep — all clean except tools OG locale (fixed above)

---

## 2026-06-16 — Phase 9: On-Page SEO Sweep ✅ COMPLETE

### app/blogs/[slug]/BlogPostClient.jsx
- Added `TAG_TO_FAQ_CAT` mapping — 20 tags mapped to FAQ category slugs
- Added `<nav aria-label="Breadcrumb" className="bp-breadcrumb">` — Home / Insights / [post title] — inserted inside the back-link motion div
- Tags now render as `<Link>` instead of `<span>` — mapped tags → `/faqs/category/[cat]`; unmapped → `/blogs?tag=[t]`
- Added "Explore More on AIDLA" block after RelatedPosts — links to /faqs, /faqs/category/[relevant], /tools, /courses, /tools/education/cgpa-calculator, /tools/finance/salary-calculator

### app/blogs/[slug]/BlogPost.css
- Added `.bp-breadcrumb` styles
- Added `.bp-tag` `text-decoration:none` for anchor override
- Added `.bp-explore-more`, `.bp-explore-links`, `.bp-explore-link` styles

### app/news/[slug]/NewsPageClient.jsx
- Same `TAG_TO_FAQ_CAT` mapping added
- Added `<nav aria-label="Breadcrumb" className="np-breadcrumb">` after back link — Home / News / [post title]
- `displayTags` now render as `<Link>` — mapped tags → `/faqs/category/[cat]`; unmapped → `/news?tag=[t]`
- Added "Explore More on AIDLA" block after RelatedPosts (inside the 0 16px padding div)

### app/news/[slug]/newspage.css
- Added `.np-breadcrumb`, `.np-tag` anchor override, `.np-explore-more`, `.np-explore-links`, `.np-explore-link` styles

---

## 2026-06-16 — Phase 8: New High-Traffic Tools ✅ COMPLETE

### app/tools/education/cgpa-calculator/ (NEW)
- `page.jsx`: server component — metadata (title, description, keywords, OG, Twitter), SoftwareApplication schema, FAQPage schema (4 Q&As), breadcrumbs, H1, intro paragraph
- `CGPAClient.jsx`: "use client" — two tabs:
  - Tab 1 (CGPA Calculator): dynamic course rows (add/remove), credit hours select (1–6), grade select (A+ 4.0 → F 0.0), instant CGPA + percentage + grade standing
  - Tab 2 (Convert): CGPA ↔ percentage converter + full reference table (9 rows)
  - GEO key facts block, related tools links, scoped inline CSS

### app/tools/finance/salary-calculator/ (NEW)
- `page.jsx`: server component — metadata, SoftwareApplication schema, FAQPage schema (4 Q&As), breadcrumbs, H1
- `SalaryClient.jsx`: "use client" — 5 country tabs:
  - Pakistan: FBR 2024-25 6-slab tax, monthly input, monthly/annual breakdown, effective rate bar, collapsible slab table
  - UAE: No tax, 100% take-home
  - US: Federal tax (7 brackets) + FICA 7.65%
  - UK: Income tax (3 bands) + National Insurance (Class 1)
  - India: New regime 2024-25 (6 slabs + 87A rebate)
  - Visual: gross/tax/net stat blocks, breakdown table, color bar (green=net, red=tax)

### app/sitemap.js
- Added `/tools/education/cgpa-calculator` (priority 0.85)
- Added `/tools/finance/salary-calculator` (priority 0.85)

---

## 2026-06-16 — Phase 7: Programmatic SEO Templates ✅ COMPLETE

### app/faqs/category/[category]/page.jsx (NEW — 21 landing pages)
- Route: `/faqs/category/[category]` with hyphenated slugs (pakistan_boards → pakistan-boards)
- `generateStaticParams`: hardcoded list of all 21 known FAQ categories
- `generateMetadata`: category-specific title, description, keywords, canonical, OG, Twitter
- `buildGraph` with FAQPage schema (all Q&A pairs), BreadcrumbList, WebPage
- Fetches up to 30 FAQs by category from `faqs` table, ordered by helpful_yes desc
- `<details>/<summary>` accordion with `itemScope FAQPage` microdata
- Sibling categories nav at bottom for internal linking
- Inline scoped CSS (no global CSS file needed)

### app/projects/domain/[domain]/page.jsx (NEW — 14 landing pages)
- Route: `/projects/domain/[domain]` with hyphenated slugs (ai_ml → ai-ml)
- `generateStaticParams`: hardcoded list of all 14 project domains
- `generateMetadata`: domain-specific title, description, keywords, canonical, OG, Twitter
- `buildGraph` with ItemList schema, BreadcrumbList, WebPage
- Fetches up to 30 projects by domain from `project_ideas` table (approved, not deleted)
- Project cards with type/difficulty badges, tech stack chips, view details link
- AI Project Idea Generator CTA for empty states and at bottom
- Sibling domains nav at bottom for internal linking

### app/sitemap.js
- Added 21 FAQ category URLs: `/faqs/category/*` (priority 0.75, weekly)
- Added 14 project domain URLs: `/projects/domain/*` (priority 0.75, weekly)
- Total new sitemap entries: 35

### Pages NOT built yet (deferred):
- `/universities/[slug]` — needs university data source
- `/resources/[subject]/[level]` — needs data quality verification

---

## 2026-06-16 — Phase 6: Homepage + About + llms.txt Global Pivot ✅ COMPLETE

### app/page.jsx
- `metadata` title: "AI Powered Learning Platform in Pakistan" → "Free AI Learning Platform for Students & Professionals"
- `metadata` description, OG description, Twitter description: Pakistan framing removed
- `metadata` OG `locale`: `"en_PK"` → `"en_US"`
- `metadata` keywords: removed "Pakistan AI powered learning platform", added global equivalents
- `PLATFORM_STATS[3]` label: "AI Platform from Pakistan" → "AI Learning Platform"
- Hero eyebrow: "🇵🇰 Pakistan's #1 AI Powered Learning Platform" → "🌐 Global AI Learning Platform for Students & Professionals"
- `buildWebPageSchema` name + description: updated to global framing
- `LAST_MODIFIED`: "2026-05-09" → "2026-06-16"

### app/about/page.jsx
- `metadata` title: "AI Powered Learning Platform in Pakistan" → "Global AI Learning Platform for Students & Professionals"
- `metadata` description: "Pakistan-based AI learning platform" → "global AI learning platform"
- OG + Twitter title/description: same pivot
- OG `locale`: `"en_PK"` → `"en_US"`
- `buildWebPageSchema` name: updated

### app/about/about-client.jsx
- Hero eyebrow: "🇵🇰 Pakistan's #1 AI Powered Learning Platform" → "🌐 Global AI Learning Platform for Students & Professionals"
- Mission card: "students and professionals across Pakistan" → "students and professionals worldwide"
- Vision card: "a Pakistan where every student" → "a world where every student and professional"
- MILESTONES[3] desc: "Pakistan-based AI-powered learning platform" → "A growing global AI learning platform for students, professionals, and lifelong learners worldwide"

### lib/siteConfig.js
- `SITE.description`: "Pakistan-based AI powered learning platform" → "global AI learning platform built in Pakistan...for students, professionals...worldwide"

### lib/schemas.js
- Organization `alternateName`: "Pakistan AI Powered Learning Platform" → "Global AI Learning Platform"
- Organization `areaServed`: added `{ "@type": "Place", name: "Worldwide" }` as first entry; removed "Khyber Pakhtunkhwa" entry
- Organization `knowsAbout`: "Pakistan Education" → "Global Education"; "KPK Education" → "Professional Development"

### public/llms.txt
- First line: "Pakistan-based" → "global...built in Pakistan"
- Mission: added professionals, career switchers, worldwide
- Key Facts: "Country: Pakistan" → "Headquarters: Peshawar, Pakistan"; added Audience line; expanded Topics
- No SQL changes required in Phase 6.

---

## 2026-06-16 — Phase 5: Critical Technical Fixes ✅ COMPLETE

### app/robots.js
- Added `/login`, `/signup`, `/verify/`, `/auth/` to disallow list (were missing — letting bots crawl auth pages)

### app/news/[slug]/page.jsx
- `generateMetadata`: select now includes `meta_title,meta_description`
- Title: falls back to `post.meta_title` first, then `"${title} — AIDLA News"`
- Description: falls back to `post.meta_description` first, then excerpt slice, then generic fallback

### app/blogs/page.jsx, app/news/page.jsx, app/faqs/page.jsx, app/projects/page.jsx
- Converted `export const metadata` → `export async function generateMetadata({ searchParams })`
- When any query param is present (filter/search/tag/page), adds `robots: { index: false, follow: true }`
- Canonical URL unchanged — prevents filter URLs from competing with main listing page

### app/courses/[slug]/page.jsx
- `generateStaticParams`: `toSlug(c.title)` → `c.slug` (uses DB slug column directly)
- `generateMetadata`: course lookup now `c.slug === slug` instead of `toSlug(c.title) === slug`
- Page component: course lookup now `c.slug === slug` instead of `toSlug(c.title) === slug`
- Removed `toSlug` utility function (no longer needed in this file)

### app/courses/CoursesClient.jsx
- Card link: `const slug = toSlug(course.title)` → `const slug = course.slug || toSlug(course.title)` (DB slug with toSlug fallback for safety)

### app/tools/ai/email-writer/page.jsx
- OG image: `og-email-writer.jpg` → `og-home.jpg` (file didn't exist in public/)
- Twitter card image: same fix

### app/blogs/[slug]/BlogPostClient.jsx
- `processContent()` DOM block: added `.aidla-author-byline` removal after sanitiseLinks — prevents author showing twice (once in bp-author div at line 942, once injected by auto-blog into content_html)

### No SQL changes required in Phase 5.

---

## 2026-06-16 — Phase 1: Setup + Audit

### Pre-Phase-1 Git Checkpoint
- **Commit:** 6d424ad
- **Message:** Pre-Phase-1 checkpoint — before junk cleanup and dead-weight audit
- **Files:** CHANGES.md (created)

---

## 2026-06-16 — Phase 1: Local Dead-weight Removals (DONE)

### Files Deleted
- `public/logo1.png` (127KB orphan — logo.png is the referenced file)
- `public/next.svg`, `globe.svg`, `window.svg`, `file.svg`, `vercel.svg` (Next.js template defaults)

### Package Removed
- `playwright` removed from `devDependencies` in `package.json`
- playwright + playwright-core removed from `node_modules`

---

## 2026-06-16 — Phase 1 SQL Executed ✅ (via Supabase SQL Editor)

**Results confirmed:**
- blogs_published: 71 → 40 (−31)
- news_published: 40 → 27 (−13)
- faqs_published: 273 → 144 (−129)
- resources_published: 54 → 46 (−8)
- projects_approved: 47 → 45 (−2)
- **Total pages removed from index: 184**

---

## Phase 1 SQL Archive — Content Cleanup

To be run in Supabase SQL Editor after this log entry. Document exact SQL below.

### Blogs → status='draft' (31 total)

**22 result-check blogs:**
```sql
UPDATE blogs_posts SET status='draft' WHERE id IN (
  'd123b119-227b-461f-84cb-a300b879c15f', -- Check FBISE SSC Part 2 Result 2026 Online: Transformation Ahead
  'd2107c74-1c6e-4f31-a2c0-e0e67d7aa646', -- FBISE 10th Class Result 2026: Transformation Ahead
  'd0e4c6f5-1d7d-43d8-8d0f-9cf4616a3890', -- Faisalabad Board 10th Result 2026: Trends & Insights
  'db7d8e4c-a41b-44fa-b8e8-a131869b8b21', -- Matric Result 2026: Transforming Punjab's Education Landscape
  '132824c8-d868-49fe-94c5-10b2817de564', -- Unlock CSS Board Result 2026 Online Now
  '928b57b9-b9e0-4468-8d8b-7db2a2bb1cb0', -- Check Matric Result 2024 Karachi Board Online
  'e5f70613-e057-42d8-a0a2-b58c3950f10a', -- Check Intermediate Board Results 2026 Online Now
  '67d58026-e66f-49dc-969c-93911e114d35', -- Check FA FSc Result 2026 Karachi Board Online
  'c9199f25-8d89-4430-9dd1-655504b57315', -- Check FBISE SSC Part 2 Result 2026 Karachi Board Online
  '36306dc3-eb28-40f3-8d46-dda8f8f5086a', -- Check BISE Lahore Board Matric Result 2026 Online Now
  'baccca2f-6ff0-4091-9184-2edf854d6357', -- FBISE 10th Class Result 2026: Transforming Education
  '1d941884-5786-4243-a0a1-70d6f9371108', -- FSc Part 2 Result 2026: Pakistan's Future Unfolds
  '62ba4509-818e-4b89-87ec-6354462fd396', -- FBISE 10th Class Result 2026: Trends & Projections
  '20a39c59-2951-4fa6-aefb-2eca4a4d938e', -- FBISE 10th Class Result 2026: Future of Education
  '6df44575-d7d4-4978-8e58-fd7edbd2c7d7', -- Matric Result 2026: How Pakistan's Boards Will Announce
  '799e156e-b8b0-4761-99bf-0e2d1eadd0ab', -- Transforming FSC Part 2 Results in 2026
  '25f5822d-6580-4550-af29-af2bcfc6a91a', -- Check Matric Result 2026 Karachi Board Online Easily
  '58b5451f-1054-4255-8c0a-3487439b51d0', -- HSSC 2nd Annual Exam Dates 2026 in Pakistan: Transformation Ahead
  'f7d29abd-9108-48d4-9c44-f48d9720c290', -- Unlock Punjab Board 10th Class Result 2026 Online
  'e20ccdf1-6b4f-47a4-ab7c-d1fa50ab6571', -- Check Matric Result 2026 Pakistan Online Now
  'ec00ba1f-46b6-4a99-8870-86feacb4c63d', -- Check FBISE 10th Class Result 2026 Online: Future of Education
  'f522f81a-c313-4f55-84fa-218348d853f5'  -- Unlock Intermediate Results 2026 Pakistan: Trends & Opportunities
);
```

**5 CGPA duplicate blogs (keep df38ffa8 — "Calculate CGPA in Pakistan: Formula, Calculator & University-Specific Rules"):**
```sql
UPDATE blogs_posts SET status='draft' WHERE id IN (
  'c70c1a63-db51-468a-8516-f64ab8cc5949', -- The Formula Every Pakistani Student Uses to Calculate CGPA...
  '3619645c-0424-45a7-ba0f-50227d80514e', -- How Every Pakistani Student Can Calculate CGPA...
  '7b20dec0-24fc-4ad6-b491-36cd31e171ca', -- How Pakistani Students Calculate CGPA: The Manual Formula...
  'a8858624-ce2e-4084-9895-00b2ca06696a', -- Calculate CGPA in Pakistan Using the Exact Formula...
  '8b8c3d88-295d-454b-8516-022ce057f658'  -- The CGPA Calculation Method Every Pakistani University Student Masters
);
```

**4 borderline blogs:**
```sql
UPDATE blogs_posts SET status='draft' WHERE id IN (
  'b4076d06-a39c-498a-985e-056ae8e4c16c', -- Punjab Surpasses Kerala in Education Metrics
  'b26dc7ba-b7a7-459d-801e-3ce63a55d39f', -- Lusail University Graduates Over 900 Students in Ceremony
  'b2a129c4-e471-45be-90fc-43d9b10faa31', -- Shenyang University Tour: Exploring New Horizons
  'bac2fb29-073e-4f43-b949-b901eed6dcef'  -- CCE 2025: Transforming Hyderabad Students' Futures
);
```

### News → status='draft' (13 total)

**10 truncated/thin titles:**
```sql
UPDATE news_posts SET status='draft' WHERE id IN (
  -- IDs to be resolved via title match query below
);
-- Run this to get IDs:
SELECT id, title FROM news_posts WHERE title IN (
  'Pakistan Sees 20% Rise in Foreign Scholarships',
  'LUMS Launches Scholarship Program',
  'PIEAS Launches AI Program',
  'UET Peshawar, Huawei Sign MoU',
  'Punjab Launches Online Learning',
  'Punjab Minister Lauds Attock Reforms',
  'HEC Announces 10,000 Scholarships',
  'HEC Approves 5 New IT Universities',
  'Punjab Minister: Free Education for 150,000',
  'Punjab Launches Digital Learning'
) AND status='published';
```

**3 off-topic news:**
```sql
-- Get IDs then draft:
SELECT id, title FROM news_posts WHERE title IN (
  'Pakistan Sets 30% Electric Vehicle Target by 2030 Under New Policy',
  'WhatsApp Launches Rs. 599/Month Premium Plan with Custom Themes in May 2026',
  'Karachi Fintech Loses Customer Data After AI Agent Erases Database'
) AND status='published';
```

### FAQs → status='draft' (129 duplicates)
```sql
UPDATE faqs SET status='draft' WHERE id IN ('55939695-41b2-412d-9a6d-65f3ce474868','06aab392-c7cd-452b-be8a-4c53867793e9','98163a29-16b1-4a1c-84dd-dbdbd14853f5','25e1d66f-464b-413a-9f52-2b897cc8d7c5','e282a059-a246-4063-adb4-b43ebe6453ab','c9277be8-079e-436f-b103-33ecfcb72d09','49986c96-ac4f-4d44-9e9a-a8c28f59857a','d5eec526-d956-481d-96cb-c3918090c671','cd30c439-ec35-430a-a589-4214972a2948','ad5e5fe4-40bc-49bb-a6ed-c8b174c1d7c8','2ce91019-7751-4d6c-9967-e2f3f13cf52e','a9a378d2-2806-415d-be15-ff224dc7230f','53cbbcd6-3634-46a6-95c0-eda9656501b2','f4787fc0-51fa-4f12-8dd3-adeffd396e6f','a4f3c413-9f1a-44a0-a207-a4ebccecd3b0','58cff4c2-b540-4b31-8425-ffca1f0a82d1','a6062000-d7e4-4e0f-af71-45f45830c38a','ef9d00fc-db78-4148-bea3-00a71a92f2b9','c9afacfb-514a-4c48-83e6-d520a47ffc59','bb07a8c1-359e-4472-ac48-c291c717e8d0','51e9ec5d-51ba-41b9-a695-e854d01abc97','3cc76388-0142-460c-9a92-9764184d1598','7f46217c-8c7c-49fc-8aa2-e5f19f7b488e','7a7b1bfe-353d-4fe6-9835-3b78705063c4','7d147cbf-8111-474b-923f-d4ff33c4c2cc','37869149-cd4f-442d-bd5e-94e29416df42','1dfd2607-869a-4ffe-937a-5b5325d924ce','8c02a9b6-aea8-456f-b1f9-8c0cfbe1b3a7','7fb68d80-e5a4-4de1-a98c-d5e391fb1ed9','841b2ae2-baa5-474c-960a-5eead5e50ef6','29bb1aa5-2ab4-48da-b02a-a0331fbce696','b695bf0d-5c32-4f9b-aff6-8f6b39e04503','ddcba6f4-61d1-403e-ba60-3cad4d4ae51d','8fad22b9-af6a-4184-ad9c-6baefb76171f','38b9c0a2-fb5e-40b7-ba49-688f26d471e4','3aba0208-fb04-4da3-9bd1-4cefbfc2f548','516dce7c-07d8-4bca-b198-8248f38ffc92','59625195-6a79-4ffa-a583-0bfe7b57888b','5d328fd5-0952-4ad9-bc58-a7fdc253af41','51042ac5-6aeb-4d66-8210-1e3cc4a68daf','06e118ca-a9ef-4e49-a24c-8ab797417b56','8a863b55-6ada-4b9c-9490-f15b59033e55','e0322efd-4031-4089-8edf-bb17b1639d30','17b82f52-64f4-46f8-a885-c231b0dfb610','0284abed-5fc6-4578-b381-1e110ba1a49e','9f260a70-c3df-456d-b8e8-d9c260441c60','29421dea-4cfb-49b8-93a1-7906cc20a21a','2027bf62-7ec4-482f-a2d9-0a563c18ed40','2204253e-2fb3-473b-8263-9347d4a1ae56','eb63dcba-3d91-4d1f-b3e2-6bad08347a6d','58d767ac-1f7e-4b94-8f70-90fd0033ee29','58aa79ad-5969-4e9c-afe2-2ad99b90250e','a4123c98-b61e-4ec6-984e-3d2c93a10e60','68fae635-ce9f-43a3-a051-099ee40ad6ac','f13cdf22-c48b-4bf2-be2a-2aad22fa154b','88002c3d-a7e9-4163-ab9a-e7f219c22ca6','758e41cb-9176-4e29-8d1d-347de9ab49eb','354780e9-9854-4e44-b327-a31026a277b2','6dde250c-3af7-4fcd-9760-97f6e14bb3d2','91e6b907-1af1-40e8-bc04-c471c9eac91a','d161267f-89d7-4e69-84f6-5515a5b8f8c3','0b5fe5d8-8bc2-4ce2-b5b6-7000e2c5e86c','61346346-2ffd-4a2a-9963-d69a963f3c84','f3ce4163-3234-4588-ae39-c153950a0f8e','897b49b7-660d-42da-9a3c-13d278838c74','59c864dd-e5ca-4bfe-820d-15c663ecd5c9','007d9428-d6ad-4339-80f5-35c84f2ab695','e048bcb9-98f4-4f9a-a4b3-eba19be95c1a','698fef59-d664-4d67-8b31-474618427fd9','73ae7f04-7fc3-4e41-bcf5-58a9c28b6cd9','1336a34f-837d-46ef-97b9-21fdabc913f9','1a6fcee5-73ab-4656-b905-b8441dfd2f8c','97b055f9-c5e1-46be-80c6-1e0b44e338c6','42fdb300-b313-49ff-be2f-ac4c5c7e24a0','b1cb6669-d4b6-4835-873e-95bd7e214f39','54c702b1-c3c3-405c-a0d9-26cdf605aa9e','2cb22fb8-fe4d-4a07-b708-ca6f974512fc','0f3b11eb-3519-4268-bd8b-b9482b179ae9','66c21cf4-7456-4eea-8f47-6aa26dc11c4b','32758887-9dd6-4696-922c-a561a8ca3c68','b6b15930-2ec0-47a6-b833-57b1de154ae6','8e87f1b9-1b84-4781-9a48-ef64078541e9','5de446fa-6f09-43c7-bb1b-f8fa15b86508','23ff709d-6679-47ff-882a-37c45f614851','ae244d69-d68d-42e1-87d8-df8816ea2343','8e29f47e-1782-425b-a6e6-cbbab87d693b','dc1b5b4a-b7f2-40c8-816d-1eee2d1f511c','2036ff1d-1bc9-42bd-bba0-5fbf41fb5f22','58ab001b-a2f1-447c-9793-f40d82351889','a495452f-7507-479e-8b9b-f97b7ff78577','afdf0a07-3c44-4039-92bc-21c93da5ed38','10803ea5-ed41-4cc8-ac78-181c7c3c5ddc','9117ad2b-64ea-4978-af63-a58503829384','dceb4d67-86fb-49e7-a30a-bc0a0c0f971a','59daccea-a7f7-44f1-ac0d-0bdf0ba44ce7','cceb5b5e-5d1e-4151-aeb7-80d73e1b4a61','7929d0c5-96d7-417a-8a12-a9c03a0c4224','8566ba9b-aef1-4816-85de-6640b9d2ed8a','090f5047-c33a-4e55-8706-8f88f2411f70','048d9d25-a4e5-4a70-9f96-f81101fd4a00','b6bef0d3-9eff-49c3-be62-949ac96d7605','3230ee17-c727-4f8b-95f5-4fa9839c48f0','cd0a3bc6-01b2-4887-b95e-e959b6f0bdc9','04441320-5ea6-4cc8-8ec4-064cceaa2e4b','af577d4e-3cce-4dc4-ba76-ab980498adea','aa0f70b3-a18e-4192-831e-94859f2a7c10','20904d97-187b-4961-8109-e9e41c15bd04','b1e041c6-3a90-4a4f-b681-11fb7f6d7824','832e0b0a-6f47-4370-ba26-ec37b064d7fd','ba6e2101-f14f-4c04-af7f-e8b5b487b5ac','4fbed897-02ee-4caf-bd7f-537a9384114e','08683cd4-806c-4969-b68d-37d2d0334275','724d78db-443f-4866-a706-dcf29357e5d6','7ddc206d-c143-4972-b5c7-82b0e7e2af46','ef0bd5f2-0e4c-4bc5-930d-48c78548dc0e','a8e07e5e-3b24-4bd9-b663-826c7d73fd96','96db4bca-160f-4dd6-af11-0c4f97b2f8cf','16a2891c-538d-41b6-b2f9-7feac26696e7','18f68de5-e9c9-4aba-b2c6-826911676fd3','683ce5b4-3fe5-46d8-b138-364df6a7ec87','325b862e-345f-4096-ad63-b9491e77e702','6ee78215-ef4d-4e85-973a-d2db48073132','70a89250-21a7-4575-8a68-5d5d77f78d11','d648949d-b31e-4776-a206-dee35a2c4132','080b0074-6d06-4d97-98b4-0aa60ca37583','69e9374a-3e7b-43be-a42e-95309e30166e','0a1867e3-78b4-4146-8cae-1853cfad04cd','0f8969ac-cf32-4755-9ee9-957a6798cc04','2366498a-d3f3-46e1-be09-8b892b67ad10');
```

### Resources → status='draft' (8 junk)
```sql
-- Run to get IDs, then draft:
SELECT id, title FROM study_materials WHERE title IN (
  'Paranormal Notes for Electrical Engineering Students PDF',
  'Soviet Russia Family Life Article PDF',
  'Desert Economy Congress Program PDF Morocco',
  'Desert Economy Congress Energy Economics PDF',
  'Psychic Phenomena Notes for English Students PDF',
  'Psychic Frontier Notes for English Students PDF',
  'Parapsychology Abstracts International Notes PDF',
  'Terrance Lindall Biography English Notes PDF'
) AND status='published';
-- Then: UPDATE study_materials SET status='draft' WHERE id IN (...);
```

### Projects → status (2 test entries)
```sql
UPDATE project_ideas SET approval_status='rejected' WHERE slug IN ('test-fyp-project','test');
```

---

## Git Commit
- **Commit:** 699cafe
- **Branch:** main
- **Pushed:** 2026-06-16 — https://github.com/wwwmuhammadzubair0349-blip/aidla-nextjs/commit/699cafe

---

## 2026-06-16 — Phase 2: Auto-Blog Prompts Globalized ✅

### File Changed: `supabase/functions/auto-blog/index.ts`

**New function `detectQueryGeo(keyword)`** — returns "pk" for Pakistan-specific keywords, "us" for all others
**Serper `gl` param** — was hardcoded `"pk"`, now `detectQueryGeo(keyword)` (dynamic)
**`detectCluster()`** — expanded with global patterns: IELTS, TOEFL, GRE, GMAT, SAT, ACT, certifications, remote work, productivity, ChatGPT, automation, financial aid, bursaries
**Groq trending topics prompt** — rewritten for global + professionals: 40% global students / 35% global professionals / 25% Pakistan students
**"PAKISTAN EDUCATION NEWS"** → **"EDUCATION & CAREER NEWS"** (topic pool header)
**Topic selection prompt** — added HARD-BLOCKED QUERY TYPES (result-check, admit cards, date sheets) + global audience rule
**Retry prompt** — globalized (no Pakistan mention)
**`sharedSystem`** — "Pakistan's #1 student platform" → "global platform for students and professionals"
**Reader persona** — "Pakistani student" → "student or professional who has this exact problem"
**H2 templates (Part B/C/D)** — all "Pakistani students?" / "in Pakistan?" / "How can Pakistani students solve" removed
- Part B H2-1: "What is the core challenge with [keyword]?"
- Part B H2-2: "What do the numbers actually say about [keyword]?"
- Part C H2-1: "How to solve [keyword] step by step"
- Part C H2-2: "Which approach works best for your situation?"
- Part D H2-1: "What are the most common mistakes with [keyword]?"
**Score gate** — `< 72` → `< 80` (quality gate raised)
**Dedup window** — 30-day → 45-day (3 occurrences: comment + `30*24*60*60*1000` + error strings)
**Default tags** — `["education","pakistan","students"]` → `["education","students","guide"]`
**Fallback meta** — removed "Pakistani students" from fallback excerpt + meta_description
**Citation sources (career/skills/edtech/lifestyle)** — replaced Pakistan-only sources with global:
  - career: LinkedIn Talent Trends, Indeed Hiring Lab, WEF Future of Jobs
  - skills: WEF Skills Outlook, Coursera Global Skills Report, UNESCO Education
  - edtech: EdSurge Research, WEF Future of Jobs, OECD Education at a Glance
  - lifestyle: WHO Mental Health, World Bank Human Capital Index, OECD Education

### Deployment
- `npx supabase functions deploy auto-blog` ✅ deployed (103.1kB)

### Git Commit
- **Commit:** c2cd067
- **Branch:** main
- **Pushed:** 2026-06-16

---

---

## 2026-06-16 — Phase 3: Auto-News Prompts Globalized ✅

### File Changed: `supabase/functions/auto-news/index.ts`

**`scoreNewsContent()`** — Removed 15-pt Pakistan geo term penalty; redistributed to word count (now max 40pts: 1000+ → 40, 700+ → 30, 450+ → 18, else → 8). Total still 100pts.
**`fetchTrendingNewsWithGroq()`** — System prompt: "Pakistani news researcher" → "global education and career news researcher"; categoryMap rewritten with global topics; headline request globalized with Pakistan/global mix instruction.
**`fetchNewsDataHeadlines()`** — Removed `country=pk`; now fetches global education + global technology + Pakistan education (3 calls, ~11 headlines).
**`STATIC_TOPIC_POOL`** — Replaced all-Pakistan pool with 60/40 global/Pakistan mix (7 global + 5 Pakistan topics).
**`selectBestTopic()`** — System: "Pakistani news editor" → "global education and career news editor"; instruction: "40/60 Pakistan/global balance".
**`generateMetadata()`** — System: "Pakistani news metadata generator" → "global education and career news metadata generator"; tags rule: removed "second tag must be pakistan"; fallback tags: `[category, "pakistan"]` → `[category, "news"]`.
**`generateContent()` `sharedSystem`** — "senior Pakistani news journalist" → "senior education and career news journalist for global platform for students and professionals"; STATISTICS rule: "real Pakistani sources" → "real authoritative sources (official bodies, WHO, WEF, UNESCO, World Bank)".
**Part A H2** — "Why This Matters for Pakistani Students" → "Why This Matters"
**Part B H2** — "What This Means for Pakistani Students in ${year}" → "What This Means in ${year}"
**GEO block footer** — "Pakistan's student platform" → "Global platform for students and professionals"
**Word_count bug fix** — Replaced silent `.update()` (blocked by RLS) with `.rpc("news_update_seo_data", {...})`; new SECURITY DEFINER function bypasses RLS for SEO column updates.

### Migration Created
- `supabase/migrations/20260616120000_news_seo_update_rpc.sql`
- **ACTION REQUIRED:** Run this SQL in Supabase SQL Editor to create the `news_update_seo_data()` RPC

### Deployment
- `npx supabase functions deploy auto-news` ✅ deployed (93.46kB)

### Git Commit
- TBD

---

## 2026-06-16 — Phase 4: Auto-FAQ Globalized ✅

### File Changed: `supabase/functions/auto-faq-generator/index.ts`

**`getRecentFAQQuestions()`** — removed `.limit(150)` → `.limit(600)` on published FAQs only; prevents duplicate FAQ generation from the same pool.
**New categories (5 added)** — `job_search`, `freelancing`, `remote_work`, `ai_tools`, `career_growth`; total now 17 categories.
**`pickWeightedCategory()`** — new helper; 40% Pakistan (`pakistan_boards`, `university_admissions`, `css_pms`, `scholarships`) / 30% global students (`study_abroad`, `technology`, `ai_tools`, `health`, `education`) / 30% professionals (`career`, `job_search`, `freelancing`, `remote_work`, `career_growth`, `finance`).
**`detectQueryGeo()`** — new helper; returns "pk" for Pakistan-specific questions, "us" for global.
**`detectCategory()`** — 5 new patterns added for new categories.
**`fetchPAAQuestionsForCategory()`** — categoryQueries expanded with 5 new global categories; dynamic `gl` param (pk only for pakistan_boards/university_admissions/css_pms).
**`fetchTrendingQuestionsWithGrok()`** — categoryContext rewritten for all 17 categories; conditional prompt: Pakistan-specific questions for PK categories, global questions for global categories.
**`pickSmartTopic()` fallbacks** — 12 evergreen topics: 4 Pakistan / 4 global students / 4 professionals/career.
**`analyzeCompetitorGaps()`** — "Pakistani students" → "students and professionals".
**FAQ `systemPrompt`** — "Pakistan's leading student education platform" → "global platform for students and professionals"; STATISTICS rule expanded to include WHO, WEF, LinkedIn, World Bank.
**`scoreFAQContent()` context check** — replaced Pakistan-only 10pt check with 17-term contextTerms list (includes LinkedIn, Upwork, IELTS, ChatGPT, WHO, WEF, etc.) + 5pt partial credit for topics that don't hit any contextTerms.
**`buildFAQSchema()` educationalOrg** — removed `addressCountry: "PK"` and `addressRegion: "Pakistan"`; description globalized.
**Default tags** — `["education","pakistan"]` → `["education","students"]`.
**`fetchSERPForQuestion()`** — Serper `gl` now `detectQueryGeo(question)` (dynamic).

### Deployment
- `npx supabase functions deploy auto-faq-generator` ✅ deployed (84.1kB)

### Git Commit
- TBD

---

## DB Sync Status
- Phase 1 SQL: **LOCAL ONLY** — to be run in Supabase SQL Editor
- No schema changes in Phase 1
- No edge function deployments in Phase 1
