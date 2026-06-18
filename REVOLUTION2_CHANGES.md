# AIDLA 2nd Revolution — Engineering Change Log

**Purpose:** Every change made during the 2nd Revolution is recorded here. This is the permanent engineering history.  
**Format:** Newest entries at top within each phase.  
**Rule:** No change ships without an entry here. No exceptions.

---

## HOW TO ADD AN ENTRY

Copy this template and fill every field:

```
---

## [DATE] — [PHASE] — [TASK ID]: [SHORT DESCRIPTION]

**Date:** YYYY-MM-DD  
**Phase:** Phase X — [Phase Name]  
**Task:** X.Y — [Task Name]  
**Status:** ✅ Complete | 🔄 In Progress | ⚠️ Partial | ❌ Rolled Back

### Before
[Describe the old behavior, old code, or old state. Be specific. "No file existed" is valid.]

### After
[Describe the new behavior, new code, or new state. Be specific.]

### Files Changed
- `path/to/file.jsx` — [what changed and why]
- `path/to/file.ts` — [what changed and why]

### Database Changes
[List every ALTER TABLE, CREATE TABLE, CREATE INDEX, or "None"]

### Edge Functions Changed
[List every function deployed with `npx supabase functions deploy X`, or "None"]

### Pages Changed
[List every page that now behaves differently, or "None"]

### Reason
[Why was this change necessary? Link to the audit finding or plan task.]

### Impact
[What does this fix/improve for users or the system?]

### Testing Done
[How was this verified? What was checked?]

### Rollback Notes
[How to undo this change if needed. Be specific.]

---
```

---

## Change Log

---

## 2026-06-18 — Phase 1 — Task 1.10: Branded Error Pages

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.10 — Error Pages  
**Status:** ✅ Complete

### Before
Next.js default 404 and runtime error pages (generic, no AIDLA branding).

### After
Branded full-page error states matching AIDLA dark-blue gradient theme.

### Files Changed
- `app/not-found.jsx` — created: 404 page with AIDLA branding, Dashboard + Home CTAs, quick nav links
- `app/error.jsx` — created: runtime error boundary (client), Try Again + Go Home CTAs, console-only logging

### Database Changes
None

### Edge Functions Changed
None

### Pages Changed
- `/[any 404 route]` — now shows AIDLA branded 404
- Runtime errors — now show AIDLA branded error page

---

## 2026-06-18 — Phase 1 — Task 1.8e: Admin AI Review Queue UI

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.8e — Admin Panel AI Review Queue  
**Status:** ✅ Complete

### Before
Admin blogs, news, and FAQ pages had no awareness of AI-generated content. No way to see which posts were AI-generated or review/approve them.

### After
- "🤖 AI Review (N)" filter button appears when pending_review posts exist
- AI badge shows score (e.g., "🤖 AI 78/100") on each AI-generated post
- Inline ✓ Approve / ✗ Reject buttons on pending_review posts
- Admin FAQs page shows AI badge + AI Review stat card

### Files Changed
- `app/admin/blogs/page.jsx` — aiFilter state, ai columns in select, onApproveAI/onRejectAI, AI badge
- `app/admin/news/page.jsx` — same + ai columns in filteredPosts useMemo
- `app/admin/adminfaqs/page.jsx` — ai_generated badge in FAQ cards, stats.aiPending stat card

---

## 2026-06-18 — Phase 1 — Tasks 1.8b/c/d: Auto-Content AI Safety Metadata

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.8b/c/d — Edge Function AI Metadata  
**Status:** ✅ Complete (code done; deploy pending)

### Before
Auto-blog, auto-news, and auto-faq-generator published content with no tracking of AI origin, quality score, or review status.

### After
All 3 functions now stamp every generated post with:
- `ai_generated: true`
- `ai_quality_score: [score]`
- `ai_review_status: "auto_approved"`

### Files Changed
- `supabase/functions/auto-blog/index.ts` — 3 fields added to Step 15b DB update
- `supabase/functions/auto-news/index.ts` — 3 new params in news_update_seo_data RPC call
- `supabase/functions/auto-faq-generator/index.ts` — 3 fields in full insert at lines ~1107

### Edge Functions Changed
Pending deploy: auto-blog, auto-news, auto-faq-generator

---

## 2026-06-18 — Phase 1 — Task 1.8a: AI Content Safety DB Columns

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.8a — Database AI Safety Columns  
**Status:** ✅ Complete (migration written; run pending)

### Before
No columns to track AI origin, quality, or review status on content tables.

### After
Migration adds 4 columns to blogs_posts and news_posts, 3 to faqs. Updates news_update_seo_data RPC with 3 optional params.

### Files Changed
- `supabase/migrations/20260618000003_ai_content_safety.sql` — created

### Database Changes
- `blogs_posts` ADD: ai_generated BOOL DEFAULT false, ai_quality_score INT, ai_review_status TEXT CHECK, ai_review_flag_reason TEXT
- `news_posts` ADD: same 4 columns
- `faqs` ADD: ai_generated BOOL, ai_quality_score INT, ai_review_status TEXT CHECK
- `news_update_seo_data()` RPC — updated with p_ai_generated, p_ai_quality_score, p_ai_review_status (all DEFAULT NULL)

---

## 2026-06-18 — Phase 1 — Task 1.9: Archive Dead Tables

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.9 — Dead Code Archive  
**Status:** ✅ Complete (migration written; run pending)

### Before
autotube_history table existed with no code references. career_counselor_sessions and featured_in suspected dead.

### After
autotube_history renamed to _archive_autotube_history. career_counselor_sessions and featured_in confirmed active and kept.

### Files Changed
- `supabase/migrations/20260618000004_archive_autotube.sql` — RENAME autotube_history

### Database Changes
- `autotube_history` → `_archive_autotube_history`

---

## 2026-06-18 — Phase 1 — Task 1.7: Onboarding Infrastructure

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.7 — Onboarding Redirect Infrastructure  
**Status:** ✅ Complete (migration written; run pending)

### Before
No onboarding flow. All users landed directly on /user dashboard regardless of account age.

### After
Infrastructure ready: new users (onboarding_completed=false) redirected to /user/onboarding placeholder. Existing users backfilled with onboarding_completed=true.

### Files Changed
- `supabase/migrations/20260618000002_onboarding_columns.sql` — 5 new columns on users_profiles
- `app/user/onboarding/page.jsx` — created: placeholder marks complete, redirects to /user
- `app/user/UserLayoutClient.jsx` — redirect logic added

### Database Changes
- `users_profiles` ADD: onboarding_completed BOOL DEFAULT false, onboarding_completed_at TIMESTAMPTZ, user_goal TEXT, user_level TEXT, user_field TEXT
- All existing users UPDATE: onboarding_completed=true (backfill)

---

## 2026-06-18 — Phase 1 — Task 1.6: Fix New User Empty Dashboard

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.6 — Fix New User Empty Dashboard  
**Status:** ✅ Complete

### Before
New users with no enrollments saw an empty dashboard with no guidance.

### After
GettingStartedBanner shows 4 action steps with coin rewards when course_enrollments count = 0.

### Files Changed
- `app/user/page.jsx` — added isNewUser state, GettingStartedBanner inline component

---

## 2026-06-18 — Phase 1 — Task 1.5: Base Component Library

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.5 — Base Component Library  
**Status:** ✅ Complete

### Before
No shared UI component library. Every admin/user page had its own inline components.

### After
components/ui/ with 6 reusable components: PageHeader, StatCard, EmptyState, Badge, Modal, DataTable.

### Files Changed
- `components/ui/PageHeader.jsx` — created
- `components/ui/StatCard.jsx` — created
- `components/ui/EmptyState.jsx` — created
- `components/ui/Badge.jsx` — created
- `components/ui/Modal.jsx` — created
- `components/ui/DataTable.jsx` — created
- `components/ui/index.js` — created (barrel export)

---

## 2026-06-18 — Phase 1 — Tasks 1.3 & 1.4: Skeleton Loading Screens

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.3/1.4 — Skeleton Screens  
**Status:** ✅ Complete

### Before
Auth loading state showed a blank spinner on /user and /admin, causing layout flash.

### After
SkeletonDashboard (user) and SkeletonAdmin (admin) show branded shimmer skeletons matching page layout during auth resolution.

### Files Changed
- `components/SkeletonDashboard.jsx` — created
- `components/SkeletonCard.jsx` — created
- `components/SkeletonTable.jsx` — created
- `components/SkeletonAdmin.jsx` — created
- `app/user/UserLayoutClient.jsx` — replaced spinner with SkeletonDashboard
- `app/admin/AdminLayoutClient.jsx` — replaced spinner with SkeletonAdmin

---

## 2026-06-18 — Phase 1 — Task 1.2: Admin Roles Table

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.2 — Admin Roles Foundation  
**Status:** ✅ Complete (migration written; run pending)

### Before
Admin authorization was binary (email match). No role system.

### After
admin_roles table created with super_admin/content_editor/moderator/finance_admin roles. Full RLS to be implemented in Phase 5.

### Files Changed
- `supabase/migrations/20260618000001_admin_roles.sql` — created

### Database Changes
- New table: `admin_roles` (id, user_id, email, role, granted_by, granted_at, is_active, notes)

---

## 2026-06-18 — Phase 1 — Task 1.1: Critical Security Fix — Admin Email Exposure

**Date:** 2026-06-18  
**Phase:** Phase 1 — Foundation Revolution  
**Task:** 1.1 — Critical Security: Remove NEXT_PUBLIC_ADMIN_EMAIL Exposure  
**Status:** ✅ Complete

### Before
`NEXT_PUBLIC_ADMIN_EMAIL` was a public env var readable by any browser client. Admin detection in `useAuth.js` and `auth/callback/page.jsx` compared the logged-in user's email directly against this exposed value.

### After
Admin check is now server-side only. `POST /api/admin/check-session` calls `verifyAdmin()` which reads the private `ADMIN_EMAIL` env var. Client code sends a Bearer token and receives `{isAdmin: true/false}` — the admin email is never exposed.

### Files Changed
- `app/api/admin/check-session/route.js` — created: server-side admin check endpoint
- `hooks/useAuth.js` — removed email comparison, added checkIsAdmin() async fn calling the API
- `app/auth/callback/page.jsx` — replaced env var check with fetch to check-session
- `.env.local` — removed NEXT_PUBLIC_ADMIN_EMAIL line
- `.env.production` — rewritten, only 2 public vars (Supabase URL + anon key)

### Rollback Notes
Re-add `NEXT_PUBLIC_ADMIN_EMAIL` to .env files and revert useAuth.js and auth/callback/page.jsx to email comparison.

---

## Phase Status Summary

| Phase | Changes Logged | Last Entry |
|---|---|---|
| Phase 1 — Foundation Revolution | 10 | 2026-06-18 |
| Phase 2 — UX Revolution | 0 | — |
| Phase 3 — Content & Learning Revolution | 0 | — |
| Phase 4 — Growth & Retention Revolution | 0 | — |
| Phase 5 — Scale Revolution | 0 | — |

---

## Quick Reference — All DB Changes

*Will be populated as changes are made. This section provides a single-place view of all database changes across the entire revolution.*

### New Tables
- `admin_roles` — role-based admin authorization (2026-06-18)

### Altered Tables
- `users_profiles` — ADD 5 onboarding columns (2026-06-18)
- `blogs_posts` — ADD 4 AI safety columns (2026-06-18)
- `news_posts` — ADD 4 AI safety columns (2026-06-18)
- `faqs` — ADD 3 AI safety columns (2026-06-18)

### New Columns
- `users_profiles.onboarding_completed`, `onboarding_completed_at`, `user_goal`, `user_level`, `user_field`
- `blogs_posts.ai_generated`, `ai_quality_score`, `ai_review_status`, `ai_review_flag_reason`
- `news_posts.ai_generated`, `ai_quality_score`, `ai_review_status`, `ai_review_flag_reason`
- `faqs.ai_generated`, `ai_quality_score`, `ai_review_status`

### Archived Tables
- `autotube_history` → `_archive_autotube_history` (2026-06-18)

### New Indexes
*(none)*

### New Functions / RPCs
- `news_update_seo_data()` — updated with 3 new optional AI params (backward-compatible)

---

## Quick Reference — All Edge Function Deployments

| Date | Function | Deploy Reason | Commit |
|---|---|---|---|
| 2026-06-18 | auto-blog | AI safety metadata (ai_generated, ai_quality_score, ai_review_status) | Phase 1 |
| 2026-06-18 | auto-news | AI safety metadata via news_update_seo_data RPC params | Phase 1 |
| 2026-06-18 | auto-faq-generator | AI safety metadata on both insert paths | Phase 1 |

---

## Quick Reference — All Pages Created / Deleted / Redirected

| Date | Page | Action | Notes |
|---|---|---|---|
| 2026-06-18 | `/user/onboarding` | Created | Phase 1 placeholder; full wizard in Phase 2 |
| 2026-06-18 | `/[404]` | Created | Branded not-found.jsx |
| 2026-06-18 | `/[error]` | Created | Branded error.jsx (client component) |
| 2026-06-18 | `/api/admin/check-session` | Created | Server-side admin check endpoint |

---

*Log started: 2026-06-18*  
*Format version: 1.0*
