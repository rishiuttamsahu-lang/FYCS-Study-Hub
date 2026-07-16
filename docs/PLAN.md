# PLAN.md — Sequenced Implementation Plan

This is the execution order for turning DESIGN.md into code, respecting AGENT.md's
guardrails. It is organized into phases so the project can be checkpointed (and reviewed
against real screenshots) after each one, rather than attempted as one giant diff.

Each task lists: **files touched**, **what changes**, **what must NOT change**, and a
**done-when** check pulled from AGENT.md §6.

---

## Phase 0 — Baseline Capture (do this before writing any code)

1. Run the app (`npm run dev`) and screenshot every route at 375px and 390px width:
   `/`, `/semester/1`, `/semester/1/:subjectId`, `/library`, `/upload`, `/profile`,
   `/admin/analytics` (and its other tabs), `/login` (logged-out state), `/banned` state
   if reachable. These screenshots are the ground truth for AGENT.md §6 checklist item 1.
2. Note current Tailwind config confirms default breakpoints (`sm=640, md=768, lg=1024,
   xl=1280, 2xl=1536`) — already true, just confirm no custom `screens` override exists
   in `tailwind.config.js` (it doesn't, as of this read).
3. Confirm build tooling: Vite 7 + `@tailwindcss/postcss` v4 (Tailwind v4's CSS-first
   config via `@import "tailwindcss"` + `@config` in `src/index.css`) — all responsive
   utility classes used in this plan (`lg:`, `md:`, `xl:`, `2xl:`) work out of the box
   with zero config changes.

**Done when:** a screenshot folder exists and the two structural facts above are
confirmed (no config changes needed to start).

---

## Phase 1 — Shared Navigation Shell (highest leverage, unlocks everything else)

**Goal:** introduce the desktop sidebar + top bar shell described in DESIGN.md §3 and
§6 ("Navbar → Sidebar"), without touching a single mobile pixel.

1. **Extract `useNavItems()` hook** from `src/components/Navbar.jsx`
   - Files: new `src/hooks/useNavItems.js` (or colocate in `Navbar.jsx` if the team
     prefers fewer files — either is fine, this is a "may extract" not a hard
     requirement).
   - Moves: the `navItems` array construction (admin vs. non-admin), the `isActive()`
     logic, the unread-notification `onSnapshot` listener, the unresolved-reports
     `onSnapshot` listener, and `loadingPath` state/`handleTabClick`.
   - Must not change: any Firestore query shape, any `localStorage` key
     (`lastCheckedReports`), any conditions inside `isActive`/the admin route matching.
   - `Navbar.jsx` becomes a consumer of this hook; its JSX output is **byte-for-byte
     identical** to today, just sourced from the hook instead of inline `useState`s.
2. **Build `DesktopSidebar.jsx`** (new file, `src/components/DesktopSidebar.jsx`)
   - Consumes the same `useNavItems()` hook.
   - Renders the vertical sidebar per DESIGN.md §3/§6: logo top, nav items with icon +
     label, active-state styling, notification dot logic reused as-is, user chip at the
     bottom (avatar + name from `useApp()`'s `user`, reusing whatever `Profile.jsx`
     already reads for avatar/display name — no new Firestore fields).
   - Wrapped `hidden lg:flex`.
3. **Build `DesktopTopBar.jsx`** (new file, optional if time-constrained — this is the
   one component in the whole plan that could be safely deferred to Phase 2 without
   blocking anything else) — page-title/breadcrumb + notification bell + avatar,
   `hidden lg:flex`.
4. **Wire both into `App.jsx`**
   - Files: `src/App.jsx`.
   - Change: wrap the existing `<main>` content in a new layout container that renders
     `<DesktopSidebar />` beside a `<div className="flex-1">` holding the current
     `<Toaster/>`, `<Suspense><Routes>...</Routes></Suspense>`, `<Navbar/>` (now
     `flex lg:hidden` internally or wrapped externally), `<GlobalUploadBlob/>`,
     `<FloatingAIButton/>` exactly as they are today.
   - Must not change: the `<Routes>` block contents, any `<Route>` path/guard, the
     loading/banned/logged-out branches above the router return, `GlobalUploadBlob`'s
     drag/position logic, `FloatingAIButton`'s modal/link logic (only its anchoring
     position gains an `lg:bottom-8 lg:right-8` override per DESIGN.md §6).
   - `Navbar` itself gets one small wrapping change: its root `<nav>` gains
     `lg:hidden` (visible on mobile/tablet, hidden once the sidebar takes over at
     `1024px`) — this is the only edit to `Navbar.jsx`'s actual rendered className tree
     beyond the hook-extraction refactor above.

**Done when:** at ≤1023px the app looks and behaves 100% as before (bottom tab bar,
no sidebar, no top bar); at ≥1024px a sidebar appears on the left, bottom tab bar
disappears, and every nav destination still routes correctly with the exact same
active-state and notification-dot logic as mobile. Full AGENT.md §6 checklist run
against `/`, `/library`, `/profile` at 375/390/768/1024/1440px.

---

## Phase 2 — Page-by-Page Content Layout (in this order, easiest → hardest)

For every page below: add a shared, thin **content container** convention —
`className="p-5 pt-8 max-w-md mx-auto lg:max-w-6xl lg:p-0"` style patterns per
DESIGN.md §3 (exact max-width per §6 page notes) — then apply the grid/column rules
from DESIGN.md §4. No page's existing state, hooks, or handlers change; only the JSX
returned changes shape via added `md:`/`lg:`/`xl:` classes.

1. **Login.jsx** (simplest — good warm-up) — cap card width, add optional desktop side
   panel. No functional change to Google auth call.
2. **Upload.jsx** — center form in wider card, no multi-column form fields. Reuses all
   existing form state/validation/submit logic.
3. **Subjects.jsx** — header moves conceptually into `DesktopTopBar` at `lg:` (mobile
   header markup stays, just becomes `lg:hidden` if truly duplicated by the top bar, or
   stays visible if the team decides the top bar shouldn't duplicate per-page context —
   **decision point, flag it**, default recommendation: keep mobile header as-is,
   `lg:hidden`, and let `DesktopTopBar` show the equivalent title). Row list widens,
   single column retained.
4. **Materials.jsx** — pill tab bar + search combine into one row at `lg:`. Same
   `getMaterialsBySubject` data, same filter state.
5. **Home.jsx** — semester grid `2→3→4` cols; optional two-column dashboard split
   (semesters + recent activity) at `lg:` per DESIGN.md §6. This is the first page where
   the "enhancement tier" (two-column dashboard) vs. "baseline tier" (just wider grid)
   distinction from DESIGN.md §4 matters — implement baseline first, enhancement second,
   commit/checkpoint between them.
6. **Library.jsx** — filter row extends its *already-existing* `md:grid-cols-3` pattern
   to `lg:grid-cols-4`; results list padding/row height grows at `lg:`. Enhancement tier
   (left filter rail) attempted only after baseline is verified.
7. **Profile.jsx** (996 lines — largest single non-admin page) — split into left
   avatar/cover column + right details/stats/uploads column at `lg:`, per DESIGN.md §6.
   Because this file is large, work section-by-section (cover+avatar block, then
   stats-row block, then uploads-list block) rather than as one diff, checkpointing
   visually after each section.
8. **Admin.jsx** (1860 lines, multi-tab) — largest and riskiest file. Recommended
   sub-order:
   a. Stat tiles → `2→4` cols (low risk, high visual payoff, do first).
   b. Tab selector → wider horizontal pill row at `lg:` (baseline). Vertical tab rail
      (enhancement) only after (a) and (b) are verified and only if time allows — this
      is explicitly the first thing to descope under time pressure.
   c. Each tab's content (Analytics/Materials/Users/Reports/Subjects/Settings, per the
      `src/components/admin/Admin*.jsx` sub-components) gets the same single-column-row
      or `2/4`-stat-grid treatment as the rest of the app, applied one sub-component at a
      time (`AdminAnalytics.jsx`, `AdminMaterials.jsx`, `AdminReports.jsx`,
      `AdminSettings.jsx`, `AdminSubjects.jsx`, `AdminUsers.jsx`, `CustomSelect.jsx`) so
      each can be checkpointed independently. `CustomSelect.jsx` in particular is shared
      UI — treat any change to it as a "shared primitive" change requiring re-testing
      everywhere it's used, not just in Admin.

**Done when:** every page above passes the full AGENT.md §6 checklist independently,
and — critically — passing the checklist for a later page in this list does not
regress an earlier one (spot-check Login/Upload again after finishing Admin).

---

## Phase 3 — Polish Pass

1. Hover/focus states (DESIGN.md §7) added consistently across all new desktop-only
   interactive elements — do this as its own pass across all pages rather than
   per-page, so the motion language stays consistent site-wide.
2. `2xl:` max-width caps applied to every page's outer container so nothing full-bleeds
   on ultra-wide monitors (DESIGN.md §2/§6).
3. Keyboard-navigation pass: tab through the entire desktop sidebar + top bar + every
   page's interactive elements; confirm visible focus rings everywhere per DESIGN.md §8.
4. `prefers-reduced-motion` check on any new `framer-motion`/CSS-transition additions
   (nice-to-have, not blocking).
5. Full re-run of AGENT.md §6 checklist across **every** route at **every** breakpoint
   (375, 390, 768, 1024, 1280, 1440, 1920) — this is the final gate before calling the
   project complete.

---

## Phase 4 — Handoff

1. Update `docs/ui.md` (or add a new `docs/ui-desktop.md`) documenting the new sidebar/
   top-bar components and desktop breakpoint rules, so future contributors have the same
   reference for desktop that already exists for mobile — mirrors the existing
   documentation quality bar set by the current `docs/ui.md`.
2. Final PR/commit should separate cleanly into the phases above (or at minimum: "Phase
   1 — nav shell", "Phase 2 — page layouts", "Phase 3 — polish") so a reviewer can verify
   mobile-parity claims phase by phase rather than reviewing one enormous diff.

---

## Risk Register (things to watch for while executing this plan)

| Risk | Where it could bite | Mitigation |
|---|---|---|
| Sidebar/top-bar accidentally adds fixed-height chrome that shifts mobile content | `App.jsx` layout wrapper | Sidebar/top-bar wrapper divs must use `hidden lg:flex` / `lg:block`, contributing **zero** layout box on mobile (`display:none`, not just `width:0`) |
| Shared `CustomSelect.jsx`/dropdown components get a desktop tweak that changes mobile dropdown behavior | `src/components/admin/CustomSelect.jsx`, the inline `CustomSelect` in `Library.jsx` | Treat as "shared primitive" — any change gets tested against every page that imports it, per Phase 2 step 8c note |
| `AppContext.jsx`'s granular loading skeletons (`AppSkeleton`, per-page skeletons in `App.jsx`) fall out of sync with new desktop layouts (skeleton shows old mobile-only shape while real content shows new desktop shape) | `App.jsx` skeleton components | Skeletons should get the same `lg:` grid-column treatment as their real counterparts so the loading→loaded transition doesn't visibly jump on desktop |
| Large files (`Admin.jsx` 1860 lines, `AppContext.jsx` 1056 lines, `Profile.jsx` 996 lines) tempt a "just rewrite it cleaner while I'm in there" refactor | Any large file | Forbidden per AGENT.md §4 — resist scope creep, add classes/wrappers only |
| Firestore `onSnapshot` listeners duplicated because desktop nav re-implements what mobile nav already subscribes to | `DesktopSidebar.jsx` | Solved structurally by `useNavItems()` extraction — both nav variants consume one subscription, not two |
