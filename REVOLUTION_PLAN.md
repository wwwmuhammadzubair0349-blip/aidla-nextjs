# AIDLA SEO + Content Revolution — Master Plan

**Goal:** 49 clicks → 5,000/month by M6 → 50,000/month by M12
**Audience pivot:** Pakistan-only → **Global** | Students-only → **Students + Professionals**
**Started:** 2026-06-16

---

## Phase Overview

| # | Phase | What It Does | Status | Started | Completed |
|---|-------|-------------|--------|---------|-----------|
| 1 | Junk Cleanup + Dead-weight Audit | Archive 183+ junk pages, remove dead code/files, set up tracking | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 2 | Fix Auto-Blog Prompts | Globalize topics, remove Pakistan hardcoding in H2s, add topic exclusion list, raise quality gate 72→80 | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 3 | Fix Auto-News Prompts | Remove 15-pt Pakistan geo penalty, fix truncated titles, allow global tech/edu/career news | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 4 | Fix Auto-FAQ Prompts | Remove 150-record dedup limit, add global categories, balance 40/30/30 | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 5 | Critical Technical Fixes | noindex on filter URLs, robots.txt, meta_title/desc on news/[slug], course slug stability, missing OG image, security headers, author deduplication | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 6 | Homepage + About + llms.txt Pivot | Rewrite for global + professional audience, update all schema.org | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 7 | Programmatic SEO Templates | /faqs/category/[category] (21 pages), /projects/domain/[domain] (14 pages), sitemap updated | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 8 | New High-Traffic Tools | CGPA Calculator (4.0 scale + % converter + FAQ schema), Salary Calculator (PK/UAE/US/UK/IN + FBR slabs), sitemap updated | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 9 | On-Page SEO Sweep | Related sections, breadcrumbs, Last Updated dates, author bylines, internal linking | 🟢 Complete | 2026-06-16 | 2026-06-16 |
| 10 | Resume + Monitoring | All auto-systems confirmed running with new prompts, sitemap updated, 20-page QA sweep, admin SQL view | 🟢 Complete | 2026-06-16 | 2026-06-16 |

---

## Post-Phase-10 Production Sync — ✅ LIVE (2026-06-16)

All SQL deployed to Supabase. No manual changes outstanding.

| SQL File | What It Does | Status |
|----------|-------------|--------|
| `20260616120000_news_seo_update_rpc.sql` | `news_update_seo_data()` SECURITY DEFINER RPC | ✅ Live |
| `20260616200000_auto_content_cron.sql` | 4 pg_cron jobs: auto-blog-daily (33), auto-news-6h (34), auto-faq-daily (35), auto-publish-scheduled (36) | ✅ Live |
| `20260616200001_admin_monitoring_views.sql` | `aidla_content_dashboard` + `aidla_recent_quality` views | ✅ Live |

**Auto-content schedule (UTC):**
- 6am — `auto-blog-daily` fires (11am PKT)
- 0am/6am/12pm/6pm — `auto-news-6h` fires
- 8am — `auto-faq-daily` fires (1pm PKT)
- Every 5 min — scheduled posts auto-publish

**Monitor:**
```sql
SELECT * FROM public.aidla_content_dashboard;
SELECT * FROM public.aidla_recent_quality LIMIT 20;
```

---

## Baseline Metrics (2026-06-16)
- Clicks: 49 (6-month total)
- Impressions: 793
- CTR: 6.2%
- Avg Position: 10.9
- Indexed pages: ~480 (71 blogs + 40 news + 271 FAQs + 54 resources + 47 projects + 5 courses)
- Junk rate: ~38% (183/480 pages are low quality or duplicates)
