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

## Phase 6 — Homepage + About + llms.txt Pivot

- [ ] Rewrite hero copy for global + professional audience
- [ ] Update sub-sections to mention professionals, freelancers, career switchers
- [ ] Rewrite About page (remove Pakistan-exclusive framing)
- [ ] Expand llms.txt with global + professional context
- [ ] Update all page-level metadata (title, description) for global positioning
- [ ] Update schema.org Organization, WebSite descriptions
- [ ] Verify og-home.jpg is appropriate for global audience

---

## Phase 7 — Programmatic SEO Templates

- [ ] /universities/[slug] — 50 universities (Pakistan + global)
- [ ] /resources/[subject]/[level] — subject/level matrix
- [ ] /projects/domain/[domain] — project domain pages
- [ ] /faqs/category/[category] — FAQ category landing pages
- [ ] /resources/university/[university] — university resource pages
- [ ] Create DB tables/schemas via migrations as needed

---

## Phase 8 — New High-Traffic Tools

- [ ] CGPA Calculator page (Pakistan + US + UK + percentage conversion)
- [ ] Salary Calculator page (Pakistan + UAE + US + UK + India)
- [ ] Study Plan Generator (using existing AI edge function)
- [ ] Tool comparison pages (5 tools × 3 competitors = 15 pages)

---

## Phase 9 — On-Page SEO Sweep

- [ ] Add "Related Articles" sections to blogs, news, FAQs
- [ ] Add breadcrumbs where missing
- [ ] Show "Last Updated" dates on all content types
- [ ] Ensure author bylines are visible (post Phase 5 fix)
- [ ] Internal linking sweep — cross-link related content types

---

## Phase 10 — Resume + Monitoring

- [ ] Confirm auto-blog running with new prompts
- [ ] Confirm auto-news running with new prompts
- [ ] Confirm auto-faq running with new prompts
- [ ] Sitemap updated with all new routes
- [ ] 20-page QA sweep
- [ ] Create admin SQL view for daily quality monitoring
- [ ] Set up GSC monitoring alerts
