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
- [ ] git add . && git commit -m "Phase 1 complete — junk cleanup + dead-weight removal"
- [ ] git push && verify
- [ ] Add commit hash to REVOLUTION_CHANGES.md

---

## Phase 2 — Fix Auto-Blog Prompts

- [ ] Remove "Pakistani students" from hardcoded H2 templates (Part B/C/D)
- [ ] Make Serper gl: "pk" dynamic / global
- [ ] Add topic exclusion list (result-check, navigational queries)
- [ ] Add 45-day semantic cluster dedup
- [ ] Raise quality gate from 72 → 80
- [ ] Remove country/audience lock from 7 topic clusters
- [ ] Add professionals/global categories to topic pool
- [ ] Test: generate 3 sample outputs and show before enabling

---

## Phase 3 — Fix Auto-News Prompts

- [ ] Remove 15-point Pakistan geo term penalty from scoreNewsContent()
- [ ] Fix news headline generation — no more truncated titles
- [ ] Allow global tech/education/career news sources
- [ ] Fix word_count update bug (silently failing)
- [ ] Test: generate 3 sample outputs

---

## Phase 4 — Fix Auto-FAQ Prompts

- [ ] Remove 150-record limit from getRecentFAQQuestions() — query ALL published FAQs
- [ ] Add global categories: job search, career growth, freelancing, AI tools, remote work
- [ ] Rebalance: 40% Pakistan, 30% global students, 30% professionals/career
- [ ] Test: generate 3 sample outputs

---

## Phase 5 — Critical Technical Fixes

- [ ] noindex on blogs/news/projects/faqs filter/search URLs (canonical + robots meta)
- [ ] robots.txt: disallow /login, /signup, /verify/, /auth/, /user/ (private pages)
- [ ] news/[slug] page: read + use stored meta_title/meta_description from DB
- [ ] Course slug URL stability: use DB slug, not toSlug(title) dynamic generation
- [ ] og-email-writer.jpg: check if missing, add or fix reference
- [ ] Security headers in next.config.js (X-Frame-Options, X-Content-Type, etc.)
- [ ] **Author duplication fix** (moved from Phase 1):
  - [ ] Blog: remove bp-author div from BlogPostClient.jsx OR remove aidla-author-byline injection
  - [ ] News: audit + fix NewsPageClient.jsx author duplication
  - [ ] Ensure single schema.org Person entry per article

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
