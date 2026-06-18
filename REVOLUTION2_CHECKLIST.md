# AIDLA 2nd Revolution — Live Checklist

**Purpose:** This is the live progress tracker. Update every task as it completes.  
**Format:** When a task completes, change `[ ]` → `[x]`, update Status, and fill in the completion block.  
**Rule:** Never mark a task complete without filling the completion block. This is the audit trail.

---

## HOW TO UPDATE A TASK

When you finish a task, replace this:
```
[ ] Task name
Status: Pending
```

With this:
```
[x] Task name
Status: Completed
Date: YYYY-MM-DD
Files Changed:
  - path/to/file.jsx (describe what changed)
  - path/to/file.sql (describe what changed)
DB Changes: (list any table/column/index changes, or "None")
Functions Changed: (list any edge functions deployed, or "None")
Testing Done: (what was verified)
Notes: (anything unusual, rollback info, follow-up needed)
```

---

# PHASE 1 — Foundation Revolution

**Goal:** Fix security, architecture, dead code, component foundation, auto-content safety.  
**Status:** ✅ Complete  
**Started:** 2026-06-18  
**Completed:** 2026-06-18

---

### 1.1 — Critical Security: Remove NEXT_PUBLIC_ADMIN_EMAIL Exposure

```
[x] Create POST /api/admin/check-session endpoint
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/api/admin/check-session/route.js (created — calls verifyAdmin(), returns {isAdmin})

[x] Update hooks/useAuth.js — replace email comparison with check-session call
Status: Completed
Date: 2026-06-18
Files Changed:
  - hooks/useAuth.js (removed NEXT_PUBLIC_ADMIN_EMAIL, added checkIsAdmin() async fn)

[x] Update app/auth/callback/page.jsx — use check-session instead of env var
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/auth/callback/page.jsx (fetch check-session to determine admin vs user redirect)

[x] Remove NEXT_PUBLIC_ADMIN_EMAIL from .env.local and .env.production
Status: Completed
Date: 2026-06-18
Files Changed:
  - .env.local (removed line 3)
  - .env.production (rewritten, only 2 public vars remain)

[x] Verify lib/adminAuth.js already uses private ADMIN_EMAIL (confirm + document)
Status: Completed — confirmed uses process.env.ADMIN_EMAIL (private)
```

**BLOCK:** Do not start any other task until 1.1 is fully complete and tested.

---

### 1.2 — Admin Roles Foundation

```
[x] Write migration SQL for admin_roles table
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/migrations/20260618000001_admin_roles.sql (created)
DB Changes: admin_roles table with id, user_id, email, role, granted_by, granted_at, is_active, notes

[ ] Run migration in Supabase SQL Editor
Status: Pending — run 20260618000001_admin_roles.sql in Supabase dashboard

[ ] Seed admin_roles with founder email as super_admin
Status: Pending — uncomment seed line in migration after running

[ ] Verify table exists with correct columns and constraints
Status: Pending
```

---

### 1.3 — Skeleton Loading Screens (User Dashboard)

```
[x] Create components/SkeletonDashboard.jsx
Status: Completed
Date: 2026-06-18
Files Changed:
  - components/SkeletonDashboard.jsx (created — full-page skeleton with shimmer animation)

[x] Create components/SkeletonCard.jsx
Status: Completed
Date: 2026-06-18
Files Changed:
  - components/SkeletonCard.jsx (created — count prop for multiple cards)

[x] Create components/SkeletonTable.jsx
Status: Completed
Date: 2026-06-18
Files Changed:
  - components/SkeletonTable.jsx (created — rows prop, 4 col layout)

[x] Update app/user/UserLayoutClient.jsx — show SkeletonDashboard when loading===true
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/user/UserLayoutClient.jsx (replaced spinner with SkeletonDashboard)
```

---

### 1.4 — Skeleton Loading Screens (Admin Panel)

```
[x] Create components/SkeletonAdmin.jsx
Status: Completed
Date: 2026-06-18
Files Changed:
  - components/SkeletonAdmin.jsx (created — sidebar + content area with stat cards)

[x] Update app/admin/AdminLayoutClient.jsx — show SkeletonAdmin when loading===true
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/admin/AdminLayoutClient.jsx (replaced spinner with SkeletonAdmin)
```

---

### 1.5 — Base Component Library (Phase 1 Set)

```
[x] Create components/ui/ directory + all 6 components + barrel export
Status: Completed
Date: 2026-06-18
Files Changed:
  - components/ui/PageHeader.jsx (title, subtitle, action prop)
  - components/ui/StatCard.jsx (icon, value, label, trend prop)
  - components/ui/EmptyState.jsx (icon, title, description, action prop)
  - components/ui/Badge.jsx (label, variant: success/warning/error/info/neutral/ai)
  - components/ui/Modal.jsx (isOpen, onClose, title, children, size prop)
  - components/ui/DataTable.jsx (columns, data, loading, emptyState, onRowClick)
  - components/ui/index.js (barrel export)
```

---

### 1.6 — Fix New User Empty Dashboard

```
[x] Update app/user/page.jsx — add Getting Started section
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/user/page.jsx (added isNewUser state, GettingStartedBanner inline component with 4 action steps)
Notes: New user = 0 course_enrollments. Shows coin rewards for each action.
```

---

### 1.7 — Onboarding Redirect Infrastructure

```
[x] Write migration SQL + create placeholder page + update UserLayoutClient
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/migrations/20260618000002_onboarding_columns.sql (5 new columns on users_profiles)
  - app/user/onboarding/page.jsx (placeholder — marks onboarding_completed=true, redirects to /user)
  - app/user/UserLayoutClient.jsx (redirect to /user/onboarding if onboarding_completed===false)
DB Changes: users_profiles ADD onboarding_completed, onboarding_completed_at, user_goal, user_level, user_field
Notes: Existing users backfilled with onboarding_completed=true. Full 5-step wizard deferred to Phase 2.

[ ] Run migration in Supabase SQL Editor
Status: Pending — run 20260618000002_onboarding_columns.sql
```

---

### 1.8 — Auto-Content Safety Layer

#### 1.8a — Database Changes

```
[x] Write migration SQL for all 3 tables
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/migrations/20260618000003_ai_content_safety.sql (ai columns on blogs_posts, news_posts, faqs + updated news RPC)
DB Changes: ADD ai_generated BOOL, ai_quality_score INT, ai_review_status TEXT CHECK, ai_review_flag_reason TEXT
Notes: news_update_seo_data RPC updated with 3 new optional params (DEFAULT NULL, backward-compatible)

[ ] Run migration in Supabase SQL Editor
Status: Pending — run 20260618000003_ai_content_safety.sql
```

#### 1.8b — Edge Function: auto-blog

```
[x] Set ai_generated=true, ai_quality_score, ai_review_status='auto_approved' on all auto-blog posts
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/functions/auto-blog/index.ts (added 3 fields to Step 15b update)

[ ] Deploy: npx supabase functions deploy auto-blog
Status: Pending
```

#### 1.8c — Edge Function: auto-news

```
[x] Add 3 new params to news_update_seo_data RPC call
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/functions/auto-news/index.ts (p_ai_generated, p_ai_quality_score, p_ai_review_status added)

[ ] Deploy: npx supabase functions deploy auto-news
Status: Pending
```

#### 1.8d — Edge Function: auto-faq-generator

```
[x] Add ai_generated=true, ai_quality_score, ai_review_status to both insert locations
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/functions/auto-faq-generator/index.ts (lines ~1107 and ~1133, full insert only)

[ ] Deploy: npx supabase functions deploy auto-faq-generator
Status: Pending
```

#### 1.8e — Admin Panel: Pending Review Queue

```
[x] Update app/admin/blogs/page.jsx — AI review filter + badge + approve/reject buttons
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/admin/blogs/page.jsx (aiFilter state, select includes ai columns, onApproveAI/onRejectAI, AI badge in list)

[x] Update app/admin/news/page.jsx — same changes
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/admin/news/page.jsx (aiFilter state, ai columns in select, onApproveAI/onRejectAI, AI badge, filter button)

[x] Update app/admin/adminfaqs/page.jsx — show ai_generated badge and quality score
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/admin/adminfaqs/page.jsx (ai_generated badge in FAQ cards, stats.aiPending stat card)
```

---

### 1.9 — Dead Code Archive

```
[x] Audit dead tables and archive truly dead ones
Status: Completed
Date: 2026-06-18
Files Changed:
  - supabase/migrations/20260618000004_archive_autotube.sql (RENAME autotube_history → _archive_autotube_history)
Notes: career_counselor_sessions KEPT (used in aidla-ai/page.jsx, learning/page.jsx).
       featured_in KEPT (used in about/page.jsx). Only autotube_history was truly dead.

[ ] Run migration in Supabase SQL Editor
Status: Pending — run 20260618000004_archive_autotube.sql
```

---

### 1.10 — Error Pages

```
[x] Create app/not-found.jsx — branded 404 page
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/not-found.jsx (AIDLA branding, Go to Dashboard + Back to Home CTAs, quick nav links)

[x] Create app/error.jsx — branded runtime error page (client component)
Status: Completed
Date: 2026-06-18
Files Changed:
  - app/error.jsx (Try Again + Go Home CTAs, no stack trace, logs to console only)
```

---

### Phase 1 Completion Gate

All items below must be true before Phase 2 begins:

```
[x] All Phase 1 code tasks complete
[x] NEXT_PUBLIC_ADMIN_EMAIL removed from all .env files
[x] components/ui/ directory has all 6 components
[x] Skeleton screens created for /user and /admin
[x] Auto-content safety columns added to edge functions
[x] Admin review queue UI added to blogs, news, adminfaqs
[x] Dead tables audited (autotube archived, career_counselor + featured_in kept)
[x] Error pages created (not-found.jsx, error.jsx)

[ ] Run 4 SQL migrations in Supabase SQL Editor
    - 20260618000001_admin_roles.sql
    - 20260618000002_onboarding_columns.sql
    - 20260618000003_ai_content_safety.sql
    - 20260618000004_archive_autotube.sql

[ ] Deploy 3 edge functions:
    - npx supabase functions deploy auto-blog
    - npx supabase functions deploy auto-news
    - npx supabase functions deploy auto-faq-generator

[ ] Git commit: "Phase 1 complete — Foundation Revolution"
[ ] REVOLUTION2_CHANGES.md updated with all entries
```

---

# PHASE 2 — User Experience Revolution

**Status:** 🔒 Locked (begins after Phase 1 complete)

```
[ ] 2.1 — Complete onboarding flow (/user/onboarding)
[ ] 2.2 — Dashboard hero redesign
[ ] 2.3 — Context-aware navigation (public / user / admin)
[ ] 2.4 — Merge learning hub (/user/learn)
[ ] 2.5 — Merge community hub (/user/community)
[ ] 2.6 — Profile / settings split
[ ] 2.7 — Universal search page (/search)
[ ] 2.8 — Notifications center (/user/notifications)
[ ] 2.9 — Empty states for all sections
[ ] 2.10 — Loading states polish
```

*Detailed sub-tasks will be expanded when Phase 2 is unlocked.*

---

# PHASE 3 — Content & Learning Revolution

**Status:** 🔒 Locked (begins after Phase 2 complete)

```
[ ] 3.1 — AI Content Engine (admin section + brand voice + quality dashboard)
[ ] 3.2 — Course experience improvements
[ ] 3.3 — Resources discovery improvements
[ ] 3.4 — Tools section cleanup
[ ] 3.5 — Blogs + News → Insights hub
[ ] 3.6 — Certificate sharing upgrade
```

---

# PHASE 4 — Growth & Retention Revolution

**Status:** 🔒 Locked (begins after Phase 3 complete)

```
[ ] 4.1 — Achievement & badges system
[ ] 4.2 — Learning streak engine
[ ] 4.3 — Coin economy redesign
[ ] 4.4 — Shareable public profile
[ ] 4.5 — Referral system improvements
[ ] 4.6 — Changelog page
[ ] 4.7 — Lucky draw / lucky wheel merit reform
```

---

# PHASE 5 — Scale Revolution

**Status:** 🔒 Locked (begins after Phase 4 complete)

```
[ ] 5.1 — Full multi-admin role system
[ ] 5.2 — Database consolidation (polymorphic likes, comments, settings)
[ ] 5.3 — Performance optimization (indexes, caching)
[ ] 5.4 — Error monitoring & alerting
[ ] 5.5 — Wallet / withdrawal legal compliance
[ ] 5.6 — Real-time system optimization
```

---

*Last Updated: 2026-06-18*  
*Next Review: After Phase 1 completion*
