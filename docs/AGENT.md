# AGENT.md — Operating Rules for the FYCS Study Hub Desktop Responsiveness Project

This file is the constitution for any AI agent (Claude Code, Cursor, Copilot, or a human
following along) that implements this project. It exists because the single biggest risk
in this task is not "can we build a nice desktop UI" — it's **accidentally breaking or
subtly shifting the mobile experience while doing it**. Every rule below is written to
close a specific way that could happen, based on a real read of this codebase (Vite +
React 19 + React Router 7 + Tailwind CSS v4 + Firebase, glassmorphic dark/gold theme).

Read this file in full before writing a single line of code. Re-read the relevant section
before touching each file.

---

## 1. The Prime Directive

> **Mobile pixels do not move.** If a mobile user (or a `max-width: 1023px` viewport) would
> see, feel, or measure ANY difference before and after this project, that is a bug —
> not a nitpick, a bug — and it must be fixed before the task is considered done.

Everything else in this project — the desktop sidebar, the grid layouts, the hover states —
is *additive*. It only activates at `1024px` and above (Tailwind's `lg:` breakpoint, per
the existing `tailwind.config.js`, which is un-prefixed/default, meaning `sm=640`,
`md=768`, `lg=1024`, `xl=1280`, `2xl=1536`). Nothing new is subtracted from the mobile
experience, and nothing existing mobile-only class is removed unless it is being
**wrapped**, not replaced, by a responsive variant.

## 2. How Changes Must Be Made (Technique)

- **Additive Tailwind variants only.** To change something only on desktop, add `lg:`
  (or `md:` for the tablet transition zone) utility classes *alongside* the existing
  mobile classes. Never delete a mobile utility class to "make room" for a desktop one
  unless the new desktop class is itself scoped with `lg:`.
  - ✅ `className="max-w-md mx-auto lg:max-w-6xl"`
  - ❌ `className="max-w-6xl mx-auto"` (this changes mobile too — forbidden)
- **No new mobile breakpoints, no shrinking the mobile viewport contract.** The app
  currently assumes `max-w-md` (28rem/448px) as its mobile canvas on every page (Home,
  Subjects, Materials, Library, Upload, Admin, Profile all use this pattern). That
  constant must remain literally unchanged below `lg:`.
  - **Tablet (`md:` 768–1023px)** is the only zone where "adapt the layout naturally" per
  the user's ask means some quiet widening (e.g. `max-w-md md:max-w-2xl lg:max-w-6xl`) is
  allowed, since the user explicitly asked for the tablet layout to adapt. But tablet
  changes should be conservative, not a second desktop redesign — see DESIGN.md §7.
- **Never fork components into `*.mobile.jsx` / `*.desktop.jsx` pairs.** The user
  explicitly asked for "responsive breakpoints and responsive CSS/Tailwind utilities
  instead of creating separate pages." One component, one file, conditional Tailwind
  classes (and, where layout structure genuinely diverges — e.g. bottom tab bar vs.
  sidebar — a single component that internally branches on breakpoint via CSS, not JS,
  wherever possible; see §5).
- **Prefer CSS-only responsive branching over JS `useMediaQuery` + conditional render**
  wherever the two layouts are structurally similar (e.g. a grid going from 2 columns to
  4). Reserve JS-based breakpoint detection (`window.matchMedia`) only for the small
  number of cases where the desktop version needs genuinely different DOM (the nav —
  see §5) and even then, render both DOM trees and toggle visibility with
  `hidden lg:flex` / `flex lg:hidden` pairs rather than mounting/unmounting, so there is
  zero risk of a hydration or state-loss bug when the window is resized (e.g. during a
  DevTools test or an actual foldable/multi-monitor drag).
- **Do not touch `.glass-card`, `.glass-nav`, `.btn-primary`, `.btn-danger`,
  `.select-premium*`, `.badge-live`, or any other utility class defined in
  `src/index.css` in a way that changes their mobile output.** If a desktop-only variant
  of one of these is needed (e.g. a wider card), create a new class or add scoped
  `lg:` overrides in the *same* `@layer components` block, clearly commented as
  desktop-only additions, and never rewrite the base declaration.

## 3. What Counts as "Functionality" (Hands Off)

The user was explicit: **do not change functionality, routing, Firebase integration,
authentication, business logic, or APIs.** In this codebase that means, concretely:

- `src/context/AppContext.jsx` (1056 lines) — all Firestore reads/writes
  (`onSnapshot`, `getDocs`, `addDoc`, `updateDoc`, `deleteDoc`, `setDoc`), all derived
  getters (`getSubjectById`, `getSemesterById`, `getSubjectsBySemester`,
  `getMaterialsBySubject`, `getRecentMaterials`, etc.), all auth logic
  (`signInWithPopup`/`signInWithRedirect`, `onAuthStateChanged`), the granular loading
  flags (`authLoading`, `materialsLoading`, `subjectsLoading`), `isAdmin`/`isBanned`
  logic, `CREATOR_EMAILS`, and `globalUploadState` — **none of this is touched.** UI
  work consumes this context exactly as pages do today; it does not add new fields,
  rename existing ones, or change when/how listeners fire.
- `src/firebase.js` and all Firestore/Storage calls — untouched.
- `src/App.jsx` route table (`<Routes>`/`<Route>` block) — the set of routes, their
  paths, their guards (`ProtectedRoute`, `requiredRole="admin"`), and the
  redirect/fallback behavior (`<Navigate>`) stay exactly as they are. You may touch the
  *presentational* wrapper markup around `<Routes>` (e.g. adding a desktop shell/sidebar
  container) but never the `<Route>` definitions themselves.
- `firestore.rules` — never touched by this project.
- Any `localStorage` keys already in use (`lastVisitDate_${uid}`, `lastCheckedReports`,
  etc.) — untouched.
- Business logic embedded in pages (e.g. `convertToDownloadLink` in `Home.jsx`, the
  `isNewMaterial` 24-hour check, admin moderation approve/reject flows in `Admin.jsx`,
  the upload progress/blob logic in `App.jsx`'s `GlobalUploadBlob`) — untouched. These
  functions may be *called from* new desktop markup (e.g. a desktop table row also needs
  a download button that calls `convertToDownloadLink`), but their implementations do
  not change.

If a task seems to require touching one of the files/behaviors above, stop and treat it
as a UI-only wrapper problem instead — 99% of the time the fix is "render the same data,
same handlers, different container markup."

## 4. Refactor Discipline

The user asked to "refactor components only where necessary" and to "avoid duplicate
code." Concretely:

- **Do not rewrite a component from scratch.** Extend it. If `Home.jsx` currently
  returns one JSX tree, the desktop work adds Tailwind `lg:` classes to that same tree
  (or wraps sections in a responsive grid) — it does not produce a parallel desktop tree
  living in the same file unless the structural divergence is large enough that trying
  to force one shared tree with conditional classes would become unreadable (this is a
  judgment call — see PLAN.md's per-page notes for where this applies, e.g. Navbar).
- **Extract shared visual primitives when three or more pages need the same new desktop
  pattern**, e.g. a `DesktopPageHeader` or `DesktopShell` wrapper — but only extract
  after the third repetition, not speculatively before the first.
- **Never introduce a UI library dependency** (e.g. shadcn, MUI, Chakra) to solve this.
  The project already has Tailwind v4, `lucide-react`, `framer-motion`, `clsx`,
  `tailwind-merge`, and `react-hot-toast`/`sweetalert2` — everything a premium desktop
  UI needs is already installed. Adding a new dependency is out of scope and a red flag
  that the approach has drifted from "responsive CSS utilities" toward "rebuild."

## 5. The One Structural Exception: Navigation

`Navbar.jsx` is a **fixed bottom tab bar** (`.glass-nav`, `fixed bottom-0`,
`max-w-md mx-auto` inner row) — this is correct and must stay pixel-identical on
mobile. On desktop (`lg:` and above) the user explicitly asked for "sidebar or enhanced
navigation if it improves usability," which this project treats as required (a bottom
tab bar stretched across a 1440px screen is the single most common "just stretched the
mobile layout" mistake the user is asking us to avoid).

This is the one place where a second DOM subtree is justified:

- Keep the existing bottom nav markup **exactly as-is**, wrapped so it is
  `flex lg:hidden` (visible below `1024px`, hidden at/above it).
- Add a new `DesktopSidebar` component, visible only via `hidden lg:flex`, that
  **reuses the exact same data** the bottom nav uses today (`navItems` array logic,
  `isAdmin`, unread-notification and unresolved-report listeners, `isActive` logic,
  `handleTabClick` loading-spinner behavior) — ideally by lifting that shared logic into
  a small hook (e.g. `useNavItems()`) consumed by both `Navbar` (mobile) and
  `DesktopSidebar`, so the underlying behavior (what's active, what has a red dot, what
  spins while navigating) is never duplicated or allowed to drift out of sync between
  the two.
- Both subtrees are always mounted; visibility is CSS-only (`hidden`/`flex` toggling by
  breakpoint), so resizing the window never remounts, never loses the
  `loadingPath`/`hasUnread` state, and never causes a flash.

No other component in this codebase needs a second DOM subtree. Everything else (Home's
card grid, Library's list, Subjects' rows, Materials' list, Profile's stat cards, the
Admin panels, the Upload form) can be reshaped with responsive Tailwind
grid/flex/spacing utilities on the **same** markup — see DESIGN.md for the specific
Tailwind patterns per page and PLAN.md for the page-by-page task breakdown.

## 6. Verification Checklist (Run Before Calling Anything "Done")

For every component touched, verify all of the following:

1. **Visual diff at 375px width (iPhone SE) and 390px width (iPhone 12/13/14) against
   the pre-change screenshot** — must be pixel-identical. No spacing shift, no font-size
   shift, no color shift, no animation timing shift.
2. **Visual diff at 768px (iPad portrait)** — should show the "adapt naturally" tablet
   treatment, not the raw mobile layout stretched, and not the full desktop sidebar
   layout either (unless a specific page's plan says the tablet and desktop breakpoints
   converge early — call this out explicitly if so).
3. **Visual check at 1024px, 1280px, 1440px, and 1920px** — desktop layout should use
   available width purposefully (max content width with generous margins, not a
   full-bleed stretch, and not a `max-w-md` column marooned in the middle of the screen).
4. **All existing interactions still fire**: file upload, Google sign-in, material
   approve/reject in Admin, search/filter in Library, semester → subject → materials
   navigation, profile edit, notification bell, report submission. Nothing here should
   need new handlers — only new containers around the old ones.
5. **No new console errors/warnings**, no new Firestore reads introduced by the UI layer
   (i.e. desktop views re-use the same context data as mobile views; they do not call
   `getDocs`/`onSnapshot` a second time).
6. **Keyboard/hover states on desktop** — every clickable element that gained a desktop
   treatment should have a visible, smooth (150–250ms) hover/focus state consistent with
   DESIGN.md's motion tokens, and should remain fully keyboard-navigable (`Tab`/`Enter`).
7. **Lighthouse/perf sanity**: no new render-blocking resources, no layout thrash from
   the added `lg:` classes (Tailwind compiles these to plain CSS media queries — verify
   nothing was implemented as a JS-computed inline style that fires on every resize
   event without a debounce).

## 7. Communication Contract

When implementing this plan (in this or a future session), the agent should:

- Work page-by-page in the order given in `PLAN.md`, not file-by-file at random.
- After each page, state explicitly: *what mobile-visible markup was or was not touched*,
  and *what new `lg:`/`md:` classes were added*, so this can be spot-checked against §6.
- Flag immediately (not silently work around) any spot where satisfying "keep mobile
  identical" and "give desktop a real layout" seem to conflict — e.g. if a shared inline
  style or a JS-computed pixel value (not a Tailwind class) is blocking a clean
  responsive split, that's worth surfacing rather than quietly hacking around.
- Never claim a page is "done" without having actually walked the checklist in §6.

---

*This document, DESIGN.md, PLAN.md, and ANALYSIS.md together form the full spec for this
project. AGENT.md is the rulebook; DESIGN.md is the visual system; PLAN.md is the
sequenced task list; ANALYSIS.md is the reasoning behind the approach, written after a
full read of the actual repository.*
