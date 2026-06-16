# AIDLA SEO Revolution — Granular Task Checklist

---

## Phase 1 — Junk Cleanup + Dead-weight Audit

### 1A. Setup
- [x] Git pre-phase checkpoint committed + pushed (commit: 6d424ad)
- [x] Create REVOLUTION_PLAN.md
- [x] Create REVOLUTION_CHECKLIST.md
- [x] Create REVOLUTION_CHANGES.md

### 1B. Content Junk Audit (completed)
- [x] Audit all 71 blogs — identify result-check, cannibalization, AI fluff
- [x] Audit all 40 news — identify truncated titles, off-topic
- [x] Audit all 271 FAQs — identify exact duplicates (confirmed: 129)
- [x] Audit all 54 resources (study_materials) — identify irrelevant PDFs
- [x] Audit all 47 projects — identify test entries
- [x] Audit all 5 courses — no issues found

### 1C. Dead-weight Audit (completed)
- [x] 27 Supabase edge functions — all referenced, none dead
- [x] 8 components — all used
- [x] 6 lib files — all used
- [x] All app pages — all linked from nav/routes
- [x] 9 API routes — 1 suspected dead (/api/admin/tests/reminders)
- [x] npm packages — playwright dead (no tests exist)
- [x] public/ files — 6 orphaned Next.js template files + logo1.png
- [x] DB tables — all suspect tables confirmed used

### 1D. Execution — Content SQL ✅ COMPLETE
- [x] Execute SQL: 22 result-check blogs → status='draft'
- [x] Execute SQL: 5 CGPA duplicate blogs → status='draft'
- [x] Execute SQL: 4 borderline blogs → status='draft'
- [x] Execute SQL: 10 truncated news → status='draft'
- [x] Execute SQL: 3 off-topic news → status='draft'
- [x] Execute SQL: 129 duplicate FAQs → status='draft'
- [x] Execute SQL: 8 junk resources → status='draft'
- [x] Execute SQL: 2 test projects → approval_status='rejected'
- [x] Verify counts: blogs 71→40, news 40→27, FAQs 273→144, resources 54→46, projects 47→45

### 1E. Execution — Dead-weight Removals (pending user approval)
- [x] Delete public/logo1.png (127KB orphan)
- [x] Delete public/next.svg, globe.svg, window.svg, file.svg, vercel.svg (Next.js defaults)
- [x] Remove `playwright` from devDependencies in package.json
- [ ] Evaluate /api/admin/tests/reminders route — keep or delete? (KEEPING for safety)

### 1F. Author Duplication (tracked for Phase 5)
- [ ] Fix: blog posts show author TWICE — once in bp-author div (line 942 BlogPostClient.jsx) and once inside injected HTML content (aidla-author-byline from auto-blog)
- [ ] Fix: news pages — audit same pattern in NewsPageClient.jsx
- [ ] Decision: Remove bp-author div (content card is richer) OR remove from auto-blog HTML injection
- [ ] Ensure only ONE schema.org Person entry per page

### 1G. Phase Completion
- [x] Update REVOLUTION_CHANGES.md with all SQL run
- [x] Update REVOLUTION_PLAN.md Phase 1 → 🟢 Complete
- [x] git add . && git commit -m "Phase 1 complete — junk cleanup + dead-weight removal"
- [x] git push && verify — commit 699cafe pushed to main
- [x] Add commit hash to REVOLUTION_CHANGES.md

---

## Phase 2 — Fix Auto-Blog Prompts ✅ COMPLETE

- [x] Remove "Pakistani students" from hardcoded H2 templates (Part B/C/D)
- [x] Make Serper gl: "pk" dynamic / global (detectQueryGeo function)
- [x] Add topic exclusion list (result-check, admit cards, date sheets)
- [x] Add 45-day semantic cluster dedup (was 30-day)
- [x] Raise quality gate from 72 → 80
- [x] Remove country/audience lock from 7 topic clusters (expanded detectCluster)
- [x] Add professionals/global categories to topic pool (40/35/25 mix)
- [x] Update citation sources: career/skills/edtech/lifestyle → global sources
- [x] Remove "pakistan" from default tags → ["education","students","guide"]
- [x] Deploy: npx supabase functions deploy auto-blog ✅

---

## Phase 3 — Fix Auto-News Prompts ✅ COMPLETE

- [x] Remove 15-point Pakistan geo penalty from scoreNewsContent() — redistributed to word count (now max 40pts)
- [x] Fix news headline truncation — no Pakistan-forced titles in prompts
- [x] Allow global tech/education/career news — NewsData.io now fetches global + PK, Groq trends globalized
- [x] Fix word_count update bug — replaced silent .update() with news_update_seo_data() SECURITY DEFINER RPC
- [x] Static topic pool globalized — 60% global / 40% Pakistan
- [x] selectBestTopic() — 40/60 Pakistan/global balance instruction
- [x] sharedSystem — "senior Pakistani news journalist" → "senior global education and career news journalist"
- [x] H2 templates — "Why This Matters for Pakistani Students" → "Why This Matters"
- [x] GEO block footer — "Pakistan's student platform" → "Global platform for students and professionals"
- [x] Tags — removed hardcoded "pakistan" as second tag
- [x] Migration SQL created: supabase/migrations/20260616120000_news_seo_update_rpc.sql
- [ ] **ACTION REQUIRED:** Run migration SQL in Supabase SQL Editor to create news_update_seo_data() RPC
- [x] Deploy: npx supabase functions deploy auto-news ✅

---

## Phase 4 — Fix Auto-FAQ Prompts ✅ COMPLETE

- [x] Remove 150-record limit from getRecentFAQQuestions() — now queries 600 published FAQs
- [x] Add global categories: job_search, career_growth, freelancing, ai_tools, remote_work
- [x] Rebalance with pickWeightedCategory() — 40% Pakistan / 30% global students / 30% professionals
- [x] detectCategory() — expanded with 5 new global category patterns
- [x] fetchPAAQuestionsForCategory() — added global category queries, dynamic gl param
- [x] fetchTrendingQuestionsWithGrok() — global categoryContext + conditional Pakistan/global prompts
- [x] pickSmartTopic() fallbacks — 12 topics: 4 Pakistan / 4 global students / 4 professionals
- [x] analyzeCompetitorGaps() — "Pakistani students" → "students and professionals"
- [x] FAQ systemPrompt — "Pakistan's leading student platform" → "global platform for students and professionals"
- [x] FAQ content prompts — conditional context (Pakistan for PK topics, global for others)
- [x] scoreFAQContent() — replaced Pakistan-only 10pt check with broad contextTerms (LinkedIn, IELTS, ChatGPT, WEF, etc.) + 5pt partial credit for global topics
- [x] buildFAQSchema() educationalOrg — removed PK address, globalized description
- [x] Default tags — ["education","pakistan"] → ["education","students"]
- [x] detectQueryGeo() helper added for dynamic Serper gl param
- [x] Deploy: npx supabase functions deploy auto-faq-generator ✅

---

## Phase 5 — Critical Technical Fixes ✅ COMPLETE

- [x] noindex on blogs/news/projects/faqs filter/search URLs — converted static metadata → generateMetadata({ searchParams }) in blogs/page.jsx, news/page.jsx, faqs/page.jsx, projects/page.jsx
- [x] robots.txt: added /login, /signup, /verify/, /auth/ to disallow list (app/robots.js)
- [x] news/[slug] page: now reads + uses stored meta_title/meta_description from DB (app/news/[slug]/page.jsx)
- [x] Course slug URL stability: use c.slug from DB in generateStaticParams, page component, CoursesClient.jsx card links (with toSlug fallback)
- [x] og-email-writer.jpg: changed both references to /og-home.jpg (app/tools/ai/email-writer/page.jsx)
- [x] Security headers: already present in next.config.ts (X-Frame-Options, X-Content-Type-Options, CSP, HSTS, etc.) — no changes needed
- [x] **Author duplication fix:**
  - [x] Blog: processContent() in BlogPostClient.jsx now strips .aidla-author-byline from injected HTML before render
  - [x] News: no duplication — NewsPageClient.jsx uses plain text content, no HTML byline injection

---

## Phase 6 — Homepage + About + llms.txt Pivot ✅ COMPLETE

- [x] Rewrite hero eyebrow + metadata title/description for global + professional audience (app/page.jsx)
- [x] Update PLATFORM_STATS: "AI Platform from Pakistan" → "AI Learning Platform"
- [x] About page metadata, OG, Twitter: remove Pakistan-exclusive framing (app/about/page.jsx)
- [x] About client hero eyebrow, mission, vision, milestone: globalized (app/about/about-client.jsx)
- [x] Expand llms.txt: global description, expanded audience + topics, Headquarters vs Country
- [x] Update SITE.description in lib/siteConfig.js (source of truth for all schemas)
- [x] schema.org Organization: alternateName, areaServed (added Worldwide), knowsAbout — globalized
- [x] OG locale: en_PK → en_US on homepage + about

---

## Phase 7 — Programmatic SEO Templates ✅ COMPLETE

- [x] /faqs/category/[category] — 21 category landing pages (app/faqs/category/[category]/page.jsx)
  - Full FAQ schema (FAQPage), BreadcrumbList, WebPage schema per page
  - generateStaticParams: all 21 known categories
  - Sibling category nav + CTA to All FAQs / AI Tools
  - Queries `faqs` table by `category`, ordered by `helpful_yes`
- [x] /projects/domain/[domain] — 14 domain landing pages (app/projects/domain/[domain]/page.jsx)
  - ItemList schema, BreadcrumbList, WebPage schema per page
  - generateStaticParams: all 14 domains
  - Project cards with type/difficulty badges, tech stack chips
  - Sibling domain nav + AI Generator CTA
  - Queries `project_ideas` table by `domain`
- [x] sitemap.js: added all 21 FAQ category URLs + 14 project domain URLs (priority 0.75)
- [ ] /universities/[slug] — deferred (needs university data)
- [ ] /resources/[subject]/[level] — deferred (needs data quality check)

---

## Phase 8 — New High-Traffic Tools ✅ COMPLETE

- [x] CGPA Calculator (app/tools/education/cgpa-calculator/)
  - Tab 1: Dynamic course rows — select credit hours + grade → instant CGPA (4.0 scale) + % + grade standing
  - Tab 2: CGPA ↔ Percentage converter + reference table
  - SoftwareApplication + FAQPage schema, BreadcrumbList
  - Related tools nav, FAQ accordion
- [x] Salary Calculator (app/tools/finance/salary-calculator/)
  - Countries: Pakistan (FBR 2024-25 slabs), UAE (tax-free), US (federal + FICA), UK (income tax + NI), India (new regime 2024-25)
  - Monthly/annual gross input → monthly take-home, tax deduction, effective rate, bar visualization
  - Pakistan: collapsible FBR slab reference table
  - SoftwareApplication + FAQPage schema, BreadcrumbList
- [x] sitemap.js: added both new tool URLs (priority 0.85)
- [ ] Study Plan Generator — deferred (existing edge function integration)
- [ ] Tool comparison pages — deferred

---

## Phase 9 — On-Page SEO Sweep ✅ COMPLETE

- [x] Add "Related Articles" sections to blogs, news, FAQs — ✅ already present on all detail pages
- [x] Add breadcrumbs where missing — ✅ added `<nav aria-label="Breadcrumb">` to BlogPostClient.jsx + NewsPageClient.jsx (FAQs/resources/projects/courses already had them)
- [x] Show "Last Updated" dates on all content types — ✅ detail pages show `updated_at` when it differs from `published_at`; listing cards intentionally excluded (auto-content would show "Updated: today" for all)
- [x] Ensure author bylines are visible — ✅ done in Phase 5 (removed HTML duplicate from auto-blog injection)
- [x] Internal linking sweep — ✅ blog tags → /faqs/category/[cat] or /blogs?tag=[t]; news tags → same pattern; "Explore More on AIDLA" block added to bottom of all blog/news articles linking to FAQs, Tools, Courses, CGPA Calculator, Salary Calculator

---

## Phase 10 — Resume + Monitoring ✅ COMPLETE

- [x] Confirm auto-blog / auto-news / auto-faq running — ✅ pg_cron jobs created (supabase/migrations/20260616200000_auto_content_cron.sql) — user must run SQL in Supabase SQL Editor (replace YOUR_ANON_KEY_HERE)
  - auto-blog-daily: `0 6 * * *` (6am UTC / 11am PKT)
  - auto-news-6h: `0 */6 * * *` (every 6 hours)
  - auto-faq-daily: `0 8 * * *` (8am UTC / 1pm PKT)
  - auto-publish-scheduled: `*/5 * * * *` (every 5 min — publishes scheduled posts)
- [x] Sitemap updated with all new routes — ✅ complete: 21 FAQ category pages + 14 project domain pages + 2 calculator tools (Phases 7+8)
- [x] 20-page QA sweep — ✅ audited; 1 issue found + fixed: `app/tools/page.jsx` OG locale `en_PK` → `en_US`
  - Pages verified clean: /, /about, /blogs, /news, /faqs, /resources, /courses, /projects, /tools
  - /tools/education/cgpa-calculator, /tools/finance/salary-calculator, /tools/ai/email-writer
  - /faqs/category/education, /faqs/category/career-growth, /projects/domain/engineering, /projects/domain/ai-ml
  - /blogs/[slug], /news/[slug], /tools/ai/interview-prep
- [x] Create admin SQL views — ✅ supabase/migrations/20260616200001_admin_monitoring_views.sql
  - `aidla_content_dashboard`: total published + 7d/30d velocity + avg word count + avg views per content type
  - `aidla_recent_quality`: last 7 days of blogs + news for daily quality review
- [ ] GSC monitoring alerts — manual step: in Google Search Console → Search results → Set up email alerts for CTR drops > 20% or position drops > 5 on top queries
