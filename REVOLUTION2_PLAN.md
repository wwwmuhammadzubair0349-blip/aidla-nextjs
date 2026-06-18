# AIDLA 2nd Revolution — Master Execution Roadmap

**Version:** 1.0  
**Created:** 2026-06-18  
**Status:** Phase 1 — Pending Start  
**Context:** Builds on top of the completed SEO Revolution (Phases 1–10 in REVOLUTION_PLAN.md).  
**Mission:** Transform AIDLA from a feature-collection into a world-class, scalable product trusted by millions of students and professionals.

---

## Revolution Overview

| # | Phase | Mission | Status | Target |
|---|-------|---------|--------|--------|
| 1 | Foundation Revolution | Fix security, architecture, dead code, component foundation, auto-content safety | ⏳ Pending | Week 1–2 |
| 2 | UX Revolution | Onboarding, navigation redesign, dashboard overhaul, profile/settings split | ⏳ Pending | Week 3–5 |
| 3 | Content & Learning Revolution | AI Content Engine upgrade, course UX, community hub, tools cleanup | ⏳ Pending | Week 6–9 |
| 4 | Growth & Retention Revolution | Achievement system, streak engine, viral profile, coin economy redesign | ⏳ Pending | Week 10–12 |
| 5 | Scale Revolution | Multi-admin roles, DB consolidation, performance, legal compliance | ⏳ Pending | Week 13–18 |

---

## PHASE 1 — Foundation Revolution

### Objective
Fix every critical issue that blocks safe, clean growth. Security vulnerabilities must be resolved before anything is built on top of them. The foundation must be solid before the house is designed.

### Why This Matters
The app currently has a publicly-exposed admin email (`NEXT_PUBLIC_ADMIN_EMAIL`), no component reuse across 92 pages, dead database tables accumulating noise, auto-content pipelines that post to social without approval gates, and a new-user experience that shows blank zeros on every metric. None of these are cosmetic. They are structural. Building Phase 2 on top of them means rebuilding it again later.

### Tasks

---

#### 1.1 — Critical Security: Remove NEXT_PUBLIC_ADMIN_EMAIL Exposure

**Problem:** `NEXT_PUBLIC_ADMIN_EMAIL` is a public environment variable baked into client-side JavaScript. Anyone can open DevTools and see the admin email, then target it.

**Fix:**
- Create a new API endpoint: `POST /api/admin/check-session`
  - Reads the user's Supabase JWT from the Authorization header
  - Server-side: verifies the email against `process.env.ADMIN_EMAIL` (private, not NEXT_PUBLIC)
  - Returns `{ isAdmin: true/false }`
- Update `hooks/useAuth.js`:
  - Replace `user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL` with a fetch to `/api/admin/check-session`
  - Cache the result in component state to avoid per-render API calls
- Update `app/auth/callback/page.jsx`:
  - Replace the direct email comparison with a call to the new endpoint
- Update `lib/adminAuth.js`:
  - Existing `verifyAdmin()` function already uses `ADMIN_EMAIL` (private) — confirm this is correct and document it clearly
- Remove `NEXT_PUBLIC_ADMIN_EMAIL` from all `.env.*` files
- Add `ADMIN_EMAIL` (non-public) to `.env.local` and `.env.production`

**Pages Affected:** `app/auth/callback/page.jsx`, `app/admin/AdminLayoutClient.jsx`, `hooks/useAuth.js`  
**DB Changes:** None  
**Edge Function Changes:** None  
**Expected Impact:** Admin email is no longer exposed. Zero-cost security fix.  
**Difficulty:** Low  
**Dependencies:** None

---

#### 1.2 — Admin Roles Foundation (Database)

**Problem:** The system supports only one admin. No content editors, no moderators, no finance-only admins. If the founder shares admin access, they must share full access.

**Fix (Phase 1 — schema only, UI in Phase 5):**
- Create new table `admin_roles`:
  ```sql
  CREATE TABLE admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin','content_editor','moderator','finance_admin')),
    granted_by TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
  );
  ```
- Seed the table with the founder's email as `super_admin`
- The existing `verifyAdmin()` function in `lib/adminAuth.js` will be updated in Phase 5 to check this table. In Phase 1, we only create the table and seed it.

**Pages Affected:** None (schema-only phase)  
**DB Changes:** New table `admin_roles`  
**Edge Function Changes:** None  
**Expected Impact:** Foundation for multi-admin support. No user-visible change.  
**Difficulty:** Low  
**Dependencies:** 1.1

---

#### 1.3 — Skeleton Loading Screens for All /user/* Pages

**Problem:** All `/user/*` routes are `force-static`. Auth runs client-side via `useAuth`. Until auth resolves (~300–800ms), the page either shows nothing or a content flash. This makes the app feel broken even when it isn't.

**Fix:**
- Create a new shared component: `components/SkeletonDashboard.jsx`
  - A full-page skeleton that mimics the dashboard layout (header bar, 3 stat cards, 2 content columns)
  - Uses CSS animated shimmer effect (no JS, no dependencies)
- Create: `components/SkeletonCard.jsx` — single card skeleton for lists
- Create: `components/SkeletonTable.jsx` — table row skeletons for admin/user tables
- Update `app/user/UserLayoutClient.jsx`:
  - When `loading === true`, render `<SkeletonDashboard />` instead of children or redirect
  - Remove any blank screen flash by ensuring something is always rendered on first paint

**Components Created:**
- `components/SkeletonDashboard.jsx`
- `components/SkeletonCard.jsx`
- `components/SkeletonTable.jsx`
- `components/SkeletonDashboard.module.css`

**Pages Affected:** All `/user/*` pages (via `UserLayoutClient.jsx`)  
**DB Changes:** None  
**Edge Function Changes:** None  
**Expected Impact:** Eliminates blank-screen flash. App feels intentional and fast even on slow connections.  
**Difficulty:** Low  
**Dependencies:** None

---

#### 1.4 — Admin Skeleton Loading

**Problem:** Same auth flash issue exists for `/admin/*` pages.

**Fix:**
- Create: `components/SkeletonAdmin.jsx` — admin-specific skeleton (sidebar + content area)
- Update `app/admin/AdminLayoutClient.jsx` to use it during `loading === true`

**Components Created:** `components/SkeletonAdmin.jsx`, `components/SkeletonAdmin.module.css`  
**Pages Affected:** All `/admin/*` pages  
**DB Changes:** None  
**Difficulty:** Low  
**Dependencies:** 1.3 (reuse shimmer CSS)

---

#### 1.5 — Base Component Library: Phase 1 Set

**Problem:** 92 pages share 8 reusable components. Every page is a one-off island. Bugs require 20+ file edits. Visual inconsistency is inevitable.

**Fix — Create these 6 foundational components. Do not refactor existing pages yet (Phase 2 will apply them):**

1. **`components/ui/PageHeader.jsx`** — Title + subtitle + optional action button. Used at the top of every page.
   ```jsx
   // Props: title, subtitle, action (optional: { label, href, onClick })
   ```

2. **`components/ui/StatCard.jsx`** — Single metric card with icon, value, label, optional trend.
   ```jsx
   // Props: icon, value, label, trend (optional: { value, direction: 'up'|'down' })
   ```

3. **`components/ui/EmptyState.jsx`** — Empty state with illustration slot, message, and CTA.
   ```jsx
   // Props: icon, title, description, action (optional: { label, href, onClick })
   ```

4. **`components/ui/DataTable.jsx`** — Table with header, rows, loading state, empty state, and optional pagination.
   ```jsx
   // Props: columns, data, loading, emptyState, onRowClick
   ```

5. **`components/ui/Modal.jsx`** — Accessible modal with backdrop, close button, and slot for content.
   ```jsx
   // Props: isOpen, onClose, title, children, size ('sm'|'md'|'lg')
   ```

6. **`components/ui/Badge.jsx`** — Small status/category badge.
   ```jsx
   // Props: label, variant ('success'|'warning'|'error'|'info'|'neutral')
   ```

**Directory Created:** `components/ui/`  
**Pages Affected:** None yet (components built, applied in Phase 2+)  
**DB Changes:** None  
**Difficulty:** Medium  
**Dependencies:** None

---

#### 1.6 — Fix New User Empty Dashboard

**Problem:** A new user signs up and sees: Coins: 0, Courses: 0, Tests: 0, nothing to do. No guidance. This is the #1 retention killer. Users who see value in the first 5 minutes are 3× more likely to return.

**Fix:**
- Update `app/user/page.jsx`:
  - Add a "Getting Started" section that shows when the user has no courses enrolled and no quiz attempts
  - This section shows: 3 recommended courses (query top-rated from `course_courses`), 1 daily quiz CTA, 1 AI tool CTA
  - Condition: `coursesEnrolled.length === 0 && quizAttempts === 0`
- Add a welcome banner for users whose accounts are < 7 days old:
  ```
  "Welcome to AIDLA! Here's how to earn your first 50 coins →"
  ```
- This does NOT require an onboarding flow yet (Phase 2). It's a fast fallback.

**Pages Affected:** `app/user/page.jsx`  
**DB Changes:** None  
**Edge Function Changes:** None  
**Expected Impact:** New users see meaningful content instead of zeros. First-session engagement improves.  
**Difficulty:** Low  
**Dependencies:** None

---

#### 1.7 — Onboarding Redirect Infrastructure

**Problem:** No onboarding flow exists. We can't build the onboarding UI in Phase 1, but we CAN lay the infrastructure so it's ready for Phase 2.

**Fix:**
- Add column to `users_profiles`:
  ```sql
  ALTER TABLE users_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  ALTER TABLE users_profiles ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
  ALTER TABLE users_profiles ADD COLUMN user_goal TEXT;
  ALTER TABLE users_profiles ADD COLUMN user_level TEXT;
  ALTER TABLE users_profiles ADD COLUMN user_field TEXT;
  ```
- Update `app/auth/callback/page.jsx`: after profile creation for new users, `onboarding_completed = false` (already default)
- Update `app/user/UserLayoutClient.jsx`: 
  - After auth resolves, if `onboarding_completed === false` and current path is `/user` (exact), redirect to `/user/onboarding`
  - Create a placeholder page `app/user/onboarding/page.jsx` that says "Onboarding coming soon — redirecting to dashboard" with auto-redirect
  - This placeholder prevents a 404 while the real onboarding is built in Phase 2

**Pages Affected:** `app/user/UserLayoutClient.jsx`, `app/auth/callback/page.jsx`  
**DB Changes:** 5 new columns on `users_profiles`  
**Edge Function Changes:** None  
**Difficulty:** Low  
**Dependencies:** None

---

#### 1.8 — Auto-Content Safety Layer (AI Content Engine — Foundation)

**Problem:** Auto-blog, auto-news, and auto-FAQ pipelines can post content directly to `status='published'` or `status='scheduled'` without any human review gate. One bad auto-generated post that goes viral destroys the brand. The auto-social-posting behavior (if enabled) amplifies this risk.

**This is NOT about removing automation. It's about making it professional and safe.**

**Fix — Add approval layer to auto-content:**

**Database:**
```sql
ALTER TABLE blogs_posts ADD COLUMN ai_generated BOOLEAN DEFAULT false;
ALTER TABLE blogs_posts ADD COLUMN ai_quality_score INTEGER;
ALTER TABLE blogs_posts ADD COLUMN ai_review_status TEXT DEFAULT 'auto_approved' 
  CHECK (ai_review_status IN ('auto_approved','pending_review','approved','flagged'));
ALTER TABLE blogs_posts ADD COLUMN ai_review_flag_reason TEXT;

ALTER TABLE news_posts ADD COLUMN ai_generated BOOLEAN DEFAULT false;
ALTER TABLE news_posts ADD COLUMN ai_quality_score INTEGER;
ALTER TABLE news_posts ADD COLUMN ai_review_status TEXT DEFAULT 'auto_approved'
  CHECK (ai_review_status IN ('auto_approved','pending_review','approved','flagged'));
ALTER TABLE news_posts ADD COLUMN ai_review_flag_reason TEXT;

-- Same for faqs:
ALTER TABLE faqs ADD COLUMN ai_generated BOOLEAN DEFAULT false;
ALTER TABLE faqs ADD COLUMN ai_quality_score INTEGER;
ALTER TABLE faqs ADD COLUMN ai_review_status TEXT DEFAULT 'auto_approved';
```

**Edge Function Logic Update:**

In `supabase/functions/auto-blog/index.ts` and `supabase/functions/auto-news/index.ts`:
- Add a `reviewGate()` function that evaluates the generated content:
  - If `qualityScore >= 85` → `ai_review_status = 'auto_approved'`, proceed normally
  - If `qualityScore >= 70 && < 85` → `ai_review_status = 'auto_approved'` but flag for spot-check
  - If `qualityScore < 70` → `ai_review_status = 'pending_review'`, set `status = 'draft'`, do NOT publish
  - If content contains flagged keywords (competitor names, legal terms, explicit content) → `ai_review_status = 'flagged'`, set `status = 'draft'`
- Mark all auto-generated posts with `ai_generated = true`

**Admin Panel:**
- Update `app/admin/blogs/page.jsx` to show a "Pending AI Review" filter tab
- Update `app/admin/news/page.jsx` same
- Show `ai_quality_score` and `ai_review_flag_reason` in the admin table for each post
- One-click "Approve" and "Reject" actions on pending posts

**Pages Affected:** `app/admin/blogs/page.jsx`, `app/admin/news/page.jsx`, `app/admin/adminfaqs/page.jsx`  
**DB Changes:** 9 new columns across 3 tables  
**Edge Functions Changed:** `auto-blog/index.ts`, `auto-news/index.ts`, `auto-faq-generator/index.ts`  
**Expected Impact:** Auto-content continues running 24/7. Low-quality or flagged content goes to draft for human review. Brand is protected. Admin gets a clear queue of content to review.  
**Difficulty:** Medium  
**Dependencies:** None (can be done in parallel with other tasks)

---

#### 1.9 — Dead Code Audit & Archive

**Problem:** Database tables exist for features that were removed or never built. They add noise to queries, confuse future developers, and waste storage.

**Tables to investigate and action:**

| Table | Finding (from audit) | Action |
|---|---|---|
| `autotube_history` | YouTube automation feature removed from UI | Archive: rename to `_archive_autotube_history`, remove from any active queries |
| `career_counselor_sessions` | No UI page built for this | Archive: rename to `_archive_career_counselor_sessions` |
| `featured_in` | No clear UI usage found | Investigate: check if any page queries this table before archiving |

**Process:**
```sql
-- Archive autotube_history
ALTER TABLE autotube_history RENAME TO _archive_autotube_history;

-- Archive career_counselor_sessions (after confirming no active code uses it)  
ALTER TABLE career_counselor_sessions RENAME TO _archive_career_counselor_sessions;

-- featured_in — investigate first:
SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'featured_in';
-- Check all edge functions and pages for "featured_in" references before archiving
```

**Pages Affected:** Any page querying these tables (need to verify none exist)  
**DB Changes:** Table renames (reversible)  
**Edge Function Changes:** Verify no edge functions write to these tables  
**Difficulty:** Low (archival is reversible — just a rename)  
**Dependencies:** Must verify all references are removed from code first

---

#### 1.10 — Error Pages (404 + 500)

**Problem:** Next.js default 404 and 500 pages have no AIDLA branding. Users who hit a broken link leave the site.

**Fix:**
- Create `app/not-found.jsx`:
  - AIDLA branded 404 page
  - Helpful links: Home, Courses, Tools, Contact
  - Search bar (links to /search?q=...)
  - "Go back" button
- Create `app/error.jsx` (client component):
  - Branded error page for uncaught runtime errors
  - "Try refreshing" and "Go home" CTAs
  - Do NOT show stack traces

**Pages Created:** `app/not-found.jsx`, `app/error.jsx`  
**DB Changes:** None  
**Difficulty:** Low  
**Dependencies:** None

---

### Phase 1 Summary

| Task | Difficulty | Priority | Impact |
|---|---|---|---|
| 1.1 Admin email security | Low | CRITICAL | Security |
| 1.2 Admin roles table | Low | High | Foundation |
| 1.3 Skeleton screens (user) | Low | High | UX |
| 1.4 Skeleton screens (admin) | Low | Medium | UX |
| 1.5 Base component library | Medium | High | Architecture |
| 1.6 New user empty states | Low | High | Retention |
| 1.7 Onboarding infrastructure | Low | High | Retention |
| 1.8 Auto-content safety layer | Medium | High | Brand protection |
| 1.9 Dead code archive | Low | Medium | Cleanliness |
| 1.10 Error pages | Low | Medium | Polish |

**Total Estimated Time:** 5–8 days (solo developer)  
**Deploy Strategy:** Each task can be deployed independently. No big-bang release required.

---

## PHASE 2 — User Experience Revolution

### Objective
Transform the user experience from confusing and empty to clear, warm, and immediately rewarding. Every new user must find value in under 5 minutes. Every returning user must see a reason to come back.

### Why This Matters
The best product with the worst onboarding loses. AIDLA already has strong content and gamification systems. The problem is that users never discover them. No onboarding = no activation. No clear navigation = no exploration. Phase 2 fixes the first impression permanently.

### Tasks

#### 2.1 — Complete Onboarding Flow
Build `/user/onboarding` — a 5-step wizard:
- Step 1: Goal selection (Get a job / Grow in career / Learn AI / Prepare for exams)
- Step 2: Level (Student / Fresh grad / 1–3 years / 3+ years)
- Step 3: Field (CS / Engineering / Business / Medicine / Other)
- Step 4: Personalized content preview — "Here are your first 3 actions"
- Step 5: Quick profile fill (name, university/company, photo optional)
- On complete: mark `onboarding_completed = true`, redirect to `/user`
- Skip option available at any step (marks as completed)

#### 2.2 — Dashboard Hero Redesign
Rebuild the above-the-fold section of `/user/page.jsx`:
- Streak counter (prominent, with fire emoji on 3+ day streaks)
- Continue Learning widget (last enrolled course, lesson X of Y)
- Today's Challenge widget (daily quiz + battle mode CTAs)
- Stats bar: Rank | Coins | Courses completed | Current streak
- AI-personalized recommendations (based on user_field + user_goal from onboarding)

#### 2.3 — Context-Aware Navigation
- Public navbar: simplified — Learn, Tools, Community, Leaderboard + Login/Signup
- User navbar: Dashboard, Learn, Compete, + Search icon + Notifications bell + Avatar dropdown
- Admin: sidebar-only navigation (no shared navbar with public site)
- Mobile (user area): bottom tab bar — Home, Learn, Compete, Tools, Me

#### 2.4 — Merge Learning Hub
- Merge `/user/learning` + `/user/courses` → `/user/learn`
- Single page with tabs: "My Courses" | "Discover" | "Resources"
- Remove `/user/learning` route (redirect to `/user/learn`)
- Remove `/user/courses` route (redirect to `/user/learn`)

#### 2.5 — Merge Community Hub
- Merge `/user/social` + `/user/forum` → `/user/community`
- Two tabs: "Feed" (social posts) | "Forum" (course discussions + Q&A)
- Remove `/user/social` and `/user/forum` (redirect to `/user/community`)

#### 2.6 — Profile / Settings Split
- `/user/profile/[userId]` = public profile (read-only for others, editable for self)
  - Avatar, cover, name, title, bio, stats, badges, certificate gallery, activity heatmap
- `/user/settings` = private account settings (new page)
  - Tabs: Account | Notifications | Privacy | Security | Linked Accounts | Danger Zone
- Remove profile editing from `/user/profile` — move to `/user/settings/profile`

#### 2.7 — Universal Search Page
- New page: `/search`
- Single search input that queries: courses, resources, blogs, news, projects, FAQs, tools
- Filter tabs: All | Courses | Resources | Articles | Tools | Projects
- Keyboard shortcut: Cmd+K / Ctrl+K opens search modal from anywhere
- Connect search icon in user navbar to this page

#### 2.8 — Notifications Center
- New page: `/user/notifications`
- Groups: Today | Yesterday | This Week | Older
- Types: Coins earned, rank changes, new content in your field, replies to your posts, test results, certificate ready
- Mark all as read button
- Link to notification bell in navbar

#### 2.9 — Empty States for All Sections
Apply `<EmptyState>` component (from Phase 1.5) to every zero-state:
- No courses enrolled → "Start your first course" + 3 recommended
- No quiz attempts → "Try today's daily quiz" CTA
- No wallet activity → "Complete a quiz to earn your first coins"
- No forum posts → "Ask your first question"
- No certificates → "Complete a course to earn a certificate"
- No battle history → "Challenge someone to a battle"

#### 2.10 — Loading States Polish
- Apply `<SkeletonCard>` and `<SkeletonTable>` (from Phase 1.5) to all data-fetching sections
- Ensure no section ever shows a blank white box while loading

**Phase 2 Expected Impact:** 
- 3× improvement in new user activation rate (onboarding)
- 40% reduction in bounce rate (clear navigation + empty states)
- Measurable improvement in Day-1 and Day-7 retention

---

## PHASE 3 — Content & Learning Revolution

### Objective
Make AIDLA's content the reason people come back. Upgrade the auto-content pipeline from a "post machine" into a professional AI Content Engine. Transform the learning experience from a course list into an actual learning journey. Clean up the tools section.

### Why This Matters
After Phase 1 fixes the security and architecture, and Phase 2 fixes the user experience, Phase 3 is about the substance — the actual content and learning. This is where AIDLA earns long-term trust.

### Tasks

#### 3.1 — AI Content Engine (Professional Upgrade of Auto-Blog + Auto-News)

This is the centerpiece of Phase 3. Build a proper editorial system around the existing automation.

**New Admin Section: `/admin/content-engine`**
- Content Calendar: visual calendar showing scheduled auto-content (blog, news, FAQ)
- Quality Dashboard: avg quality score over time, flagged posts, auto-approval rate
- Brand Voice Settings: editable rules that are injected into every auto-content prompt
  - Brand personality (professional, friendly, expert)
  - Topics to always include
  - Topics to always avoid (competitor mentions, political topics, etc.)
  - Target audience settings (global vs Pakistan weight)
  - Tone guidelines
- Keyword Performance: which auto-generated topics get the most views/clicks (from SEO data)
- Pending Review Queue: posts that scored < 85 and need human approval
- One-click approve/reject/edit workflow

**Edge Function Upgrades:**
- `auto-blog/index.ts`: Read brand voice settings from `content_engine_settings` table before generating
- `auto-news/index.ts`: Same
- `auto-faq-generator/index.ts`: Same
- Add `brand_voice_rules` as a config block in each function

**New Database Tables:**
```sql
CREATE TABLE content_engine_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_personality TEXT DEFAULT 'professional and helpful',
  topics_always_include TEXT[],
  topics_always_avoid TEXT[],
  target_audience_pk_weight INTEGER DEFAULT 40,  -- 40% Pakistan, 60% global
  tone_guidelines TEXT,
  min_quality_score_auto_approve INTEGER DEFAULT 85,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_engine_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT,  -- 'auto-blog', 'auto-news', 'auto-faq'
  content_id UUID,
  content_type TEXT,
  quality_score INTEGER,
  review_status TEXT,
  topics_tried TEXT[],
  generation_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2 — Course Experience Improvements
- Add visual progress bar to every enrolled course card
- Lesson completion UI: checkmark animations when completing a lesson
- Course notes are accessible inline (not hidden in a separate page)
- Related courses suggested at course completion
- "Continue where you left off" button on course detail page

#### 3.3 — Resources Discovery
- Better category filtering (currently a flat list)
- Add subject tags, level tags (Beginner/Intermediate/Advanced)
- "Popular this week" section on resources listing
- Download count visible on resource cards

#### 3.4 — Tools Section Cleanup
Remove from the tools public page (keep as internal APIs if needed):
- `/tools/image/html-to-png` — internal tool, remove public page
- `/tools/image/jpg-to-png` — generic utility with no brand value
- `/tools/pdf/image-to-pdf` — same
- `/tools/pdf/word-to-pdf` — same

Reorganize tools page into clear sections:
- Career Tools (flagship): CV Maker, Cover Letter, Interview Prep, LinkedIn Bio, Salary Calculator
- Study Tools: Summarizer, Paraphraser, Email Writer, CGPA Calculator, Project Generator

#### 3.5 — Blogs + News → Unified Insights Hub
- Change public nav label "Blogs" + "News" → single "Insights" entry
- `/insights` page with tabs: "Guides" (blogs) | "News" | "FAQs"
- Individual blog/news pages remain at their current URLs (no redirect needed for SEO)
- Cross-promotion: blog articles suggest related news, news articles suggest related FAQs

#### 3.6 — Certificate Sharing Upgrade
- Dynamic OG image generation for each certificate (using the existing `/api/html-to-png` endpoint)
- Certificate detail page: large preview, download button, LinkedIn share button (with pre-filled post text), Twitter/X share, WhatsApp share
- Certificate URL: `/verify/[certId]` already exists — improve its public-facing design
- Add certificate to public profile automatically on issuance

**Phase 3 Expected Impact:**
- Auto-content quality improves measurably (tracked via `content_engine_log`)
- Brand voice becomes consistent across all 100+ auto-generated articles per month
- Users spend more time in learning (better course UX)
- Certificate sharing drives organic referral traffic

---

## PHASE 4 — Growth & Retention Revolution

### Objective
Build the mechanics that make users come back every day, tell their friends, and feel proud of their progress. Replace casino-style gamification with merit-based achievement systems that reinforce learning behavior.

### Why This Matters
AIDLA's greatest retention tools (daily quiz, battle mode, leaderboard) are already built. The problem is they exist in isolation. Phase 4 connects them into a coherent motivation system where every learning action earns visible progress.

### Tasks

#### 4.1 — Achievement & Badges System
Replace lucky draw + lucky wheel as the primary gamification reward:

**New database tables:**
```sql
CREATE TABLE achievement_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('learning','competition','community','career','milestone')),
  requirement_type TEXT,  -- 'course_complete', 'quiz_streak', 'rank_top10', etc.
  requirement_value INTEGER,
  coin_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**First 15 achievements to seed:**
- Newcomer: Complete profile
- First Step: Enroll in first course
- Fast Learner: Complete first lesson
- Course Graduate: Complete a full course
- Quiz Starter: Attempt first daily quiz
- Quiz Streak 3: 3-day quiz streak
- Quiz Streak 7: 7-day quiz streak
- Quiz Streak 30: 30-day quiz streak
- Battle Starter: Win first battle
- Battle Champion: Win 10 battles
- Top 100: Reach leaderboard top 100
- Top 10: Reach leaderboard top 10
- CV Pro: Create and download a CV
- Sharer: Share a certificate
- Referrer: Refer a friend who signs up

**New page:** `/user/achievements` — grid of all badges, earned vs locked, progress to next unlock

#### 4.2 — Learning Streak Engine
- Track consecutive days with at least one learning action (quiz attempt, lesson completion, resource download)
- Store current streak + longest streak in `users_profiles` (or a dedicated `user_streaks` table)
- Streak displayed prominently on dashboard (🔥 5-day streak)
- Breaking a streak shows a "restore streak" option (spend coins)
- Streak milestone achievements (see 4.1)

#### 4.3 — Coin Economy Redesign
Current problem: Coins can be earned by clicking (mining) and won by luck (lucky draw/wheel). These reward passive behavior, not learning.

**New coin earning rules:**
| Action | Coins Earned |
|---|---|
| Complete a lesson | +10 |
| Complete a course | +200 |
| Pass daily quiz | +15 |
| Top 3 in daily quiz | +50 |
| Win a test | +100–500 (prize) |
| Win a battle | +25 |
| Complete 7-day streak | +50 bonus |
| Refer a friend (who signs up) | +100 |
| Refer a friend (who completes a course) | +200 bonus |
| Share a certificate | +20 |
| Answer a forum question (marked helpful) | +10 |

Remove or deprioritize:
- Mining (idle clicking): Convert to "daily login reward" instead (log in = +5 coins, simple and honest)
- Lucky draw / Lucky wheel: Move to "earn a spin by completing X" (merit-gated, not random access)

#### 4.4 — Shareable Public Profile
Upgrade `/user/profile/[userId]` into a LinkedIn-style mini-profile:
- GitHub-style activity heatmap (daily learning activity for past year)
- Certificate gallery (with share buttons per cert)
- Skill badges (populated from completed courses)
- Top achievements
- Public stats: Rank, Courses completed, Total coins earned, Battle win rate
- Share button generates a custom OG image (dynamic, like LinkedIn profile share)

#### 4.5 — Referral System Improvements
Current referral system exists but likely has low visibility. Upgrade:
- Referral link visible prominently in user profile and wallet
- Referral progress tracker: "You've referred 3 people. Refer 2 more for bonus badge."
- Multi-tier rewards: refer 1 = coins, refer 5 = badge, refer 10 = premium badge
- Referral leaderboard: top referrers of the month

#### 4.6 — Changelog Page
New public page: `/updates`
- Reverse-chronological list of product updates
- Format: Week of [date] → bullet list of new features, fixes, improvements
- Auto-filled from this document (REVOLUTION2_CHANGES.md)
- Builds trust, creates "what's new" engagement loop for returning users

#### 4.7 — Lucky Draw / Lucky Wheel Reform
Keep these features but gate them behind merit:
- Lucky draw entry: awarded automatically for completing the daily quiz that week (not purchasable)
- Lucky wheel spin: earned by completing any lesson (1 spin per lesson, up to 3 per day)
- This transforms them from casino mechanics to learning incentives

**Phase 4 Expected Impact:**
- Daily active users increase (streak + achievement system)
- Certificate sharing drives measurable referral traffic
- Coin economy becomes something users talk about ("I earned X coins this week")

---

## PHASE 5 — Scale Revolution

### Objective
Prepare AIDLA for 100,000+ concurrent users. Fix database architecture for long-term maintainability. Implement proper multi-admin access control. Add monitoring, alerting, and performance optimization.

### Why This Matters
Everything built in Phases 1–4 will start to crack under scale if the foundation is not hardened. 93 database tables with redundant patterns, no query optimization, no error alerting, and a single-admin security model will all become blockers.

### Tasks

#### 5.1 — Full Multi-Admin Role System
Using the `admin_roles` table created in Phase 1:
- Update `lib/adminAuth.js` to check `admin_roles` table instead of email comparison
- Role-based access: each admin role sees only their sections
  - `content_editor`: blogs, news, FAQs, courses, resources
  - `moderator`: feed, forum, reviews, user reports
  - `finance_admin`: wallet, withdrawals, deposits, shop
  - `super_admin`: everything
- Admin panel sidebar shows only sections the current role can access
- Audit log: all admin actions (edit, delete, approve) logged to `admin_audit_log` table

#### 5.2 — Database Consolidation
**Polymorphic likes (migrate all to one table):**
```sql
CREATE TABLE content_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN ('blog','news','feed','comment','project','faq')),
  content_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);
-- Migration: copy data from blogs_likes, news_likes, feed_likes into content_likes
-- Archive old tables after migration
```

**Polymorphic comments (same pattern):**
```sql
CREATE TABLE content_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users_profiles(id) ON DELETE CASCADE,
  content_type TEXT CHECK (content_type IN ('blog','news','feed','project')),
  content_id UUID,
  parent_comment_id UUID REFERENCES content_comments(id),  -- for nested replies
  body TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Feature settings consolidation:**
```sql
CREATE TABLE feature_settings (
  feature_key TEXT PRIMARY KEY,  -- 'mining', 'luckydraw', 'luckywheel', 'daily_quiz', 'withdrawals', 'resources'
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);
-- Migrate data from: mining_settings, luckydraw_settings, luckywheel_settings, daily_quiz_config, withdraw_settings, resource_settings
```

#### 5.3 — Performance Optimization
- Add database indexes on all foreign keys and frequently-queried columns
- Add composite indexes for common query patterns:
  ```sql
  CREATE INDEX idx_blogs_status_published ON blogs_posts(status, published_at DESC) WHERE status='published';
  CREATE INDEX idx_news_status_published ON news_posts(status, published_at DESC) WHERE status='published';
  CREATE INDEX idx_users_profiles_referral ON users_profiles(referral_code);
  CREATE INDEX idx_test_answers_session ON test_answers(session_id);
  ```
- Review and optimize any N+1 query patterns in admin panel pages
- Add Redis caching layer (Cloudflare KV) for leaderboard queries (most expensive)

#### 5.4 — Error Monitoring & Alerting
- Integrate Sentry (or similar) for client-side error tracking
- Add Supabase webhook → Resend email alert for:
  - Auto-content function failures
  - Withdrawal requests pending > 48 hours
  - Any user reports > 5 on same content
- Add a `/admin/system` health dashboard showing:
  - Edge function run history (success/fail from `content_engine_log`)
  - Database size and growth
  - Active user counts
  - Pending queue depths (withdrawals, pending content, orders)

#### 5.5 — Wallet / Withdrawal Legal Compliance Review
The withdrawal system allows users to cash out coins for real money. This creates legal obligations:
- **KYC requirement**: Users must verify their CNIC before first withdrawal
- **Tax compliance**: Withdrawals above a threshold require NTN recording (Pakistan)
- **AML check**: Unusual withdrawal patterns must be flagged
- **Payment gateway**: Formal agreement with JazzCash/EasyPaisa/HBL required

This task requires legal consultation, not just code changes. Phase 5 includes:
- Adding `kyc_status` and `kyc_documents` columns to `users_profiles`
- Building a KYC verification flow in the admin panel
- Adding withdrawal limits and compliance flags
- Documenting the full compliance checklist

#### 5.6 — Real-Time System Optimization
Battle mode and live quiz features use Supabase Realtime. Under load:
- Review Supabase Realtime subscription patterns in battle mode
- Ensure subscriptions are cleaned up on component unmount (memory leaks)
- Add connection retry logic for dropped connections
- Consider Cloudflare Durable Objects for battle room state if Supabase Realtime proves insufficient

**Phase 5 Expected Impact:**
- System can handle 10× current load without degradation
- Admin team can scale beyond one person safely
- Database is maintainable long-term (not 93 disconnected tables)
- Legal risk from the wallet system is addressed

---

## Non-Negotiable Principles Across All Phases

1. **Auto-content stays.** Auto-blog, auto-news, auto-FAQ are competitive advantages. We improve them, never remove them.
2. **No big-bang releases.** Every task deploys independently. If task X breaks, it rolls back without affecting tasks A–W.
3. **Preserve existing URLs.** Every SEO gain from the 1st Revolution is protected. No URL changes without 301 redirects.
4. **Security first.** Phase 1 security tasks block everything else. Do not start Phase 2 until 1.1 is complete.
5. **Measure everything.** Every phase has an expected impact. If the impact doesn't materialize, investigate before moving to the next phase.
6. **Component library grows incrementally.** Do not try to refactor all 92 pages at once. Apply new components to new pages and to pages being edited anyway.

---

## Progress Tracker

| Phase | Tasks | Completed | Status |
|---|---|---|---|
| Phase 1 | 10 | 0 | ⏳ Pending |
| Phase 2 | 10 | 0 | 🔒 Locked |
| Phase 3 | 6 | 0 | 🔒 Locked |
| Phase 4 | 7 | 0 | 🔒 Locked |
| Phase 5 | 6 | 0 | 🔒 Locked |

*Update this table as phases complete.*
