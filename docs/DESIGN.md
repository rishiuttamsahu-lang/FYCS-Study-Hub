# DESIGN.md — Desktop Design System for FYCS Study Hub

This is the visual specification for the new desktop (`lg:` 1024px+) experience. It
extends — never replaces — the existing mobile design system already documented in
`docs/ui.md` and implemented in `src/index.css` / `tailwind.config.js`. Every token below
that already exists on mobile is reused verbatim on desktop; this document only adds what
mobile doesn't need: scale, multi-column composition, a sidebar, hover/focus choreography,
and whitespace rules for large canvases.

---

## 1. Inherited Tokens (Do Not Redefine)

These come straight from `src/index.css` / `docs/ui.md` and apply identically at every
breakpoint:

| Token | Value | Notes |
|---|---|---|
| Background | `#0a0a0a` | Global page background, all breakpoints |
| Card fill | `rgba(255,255,255,0.08)` (`.glass-card`) | Same blur (`10px`), same border (`1px solid rgba(255,255,255,0.15)`), same radius (`16px`) |
| Accent gold | `#FFD700` / hover `#FFC107` | Primary actions, active states, focus rings |
| Text | `#fff` primary / `rgba(255,255,255,.55)` secondary / `rgba(255,255,255,.35)` muted | unchanged |
| Success / danger | emerald `#10b981` / rose `#f43f5e` | unchanged |
| Font | Inter | unchanged |
| Base radius scale | `12–16px` on cards, `9999px` (pill) on badges/tabs | unchanged |

**Rule:** the desktop system is a *scale and composition* layer on top of this palette —
never a new palette. A reviewer glancing at a desktop screenshot and a mobile screenshot
side by side should immediately recognize them as the same product, just given room to
breathe.

## 2. Breakpoint Strategy

Using Tailwind's default scale (already configured, unprefixed):

| Breakpoint | Width | Role |
|---|---|---|
| *(default, no prefix)* | 0–767px | **Mobile — current production UI. Untouched.** |
| `md:` | 768–1023px | **Tablet transition zone.** Widen containers modestly, go from 2-col to 3-col grids where it already exists (e.g. Library's filter row is `grid-cols-2 md:grid-cols-3` today — that pattern is the template), keep the **bottom tab bar** (sidebar doesn't appear until `lg:`), keep single-column reading order for detail pages. |
| `lg:` | 1024–1279px | **Desktop begins.** Sidebar nav replaces bottom tab bar. Content containers widen to `max-w-5xl`/`max-w-6xl`. Grids go to 3–4 columns. Hover states activate. |
| `xl:` | 1280–1535px | Comfortable desktop. Sidebar can show text labels (not just icons) if space allows; content grids may add a 5th column on very dense lists (Library). |
| `2xl:` | 1536px+ | Wide/ultra-wide monitors. **Cap content width** (`max-w-[1440px]` or similar) and center it with `mx-auto` — never let cards/text lines stretch full-bleed across a 27"+ monitor. Whitespace, not stretching, absorbs the extra room. |

`sm:` (640–767px) is intentionally **not used** for anything new — it sits inside the
"current mobile experience" zone the user asked us not to touch, since the production
app today is designed against real phone widths (375–430px) and the `max-w-md` (448px)
container already covers small tablets in portrait without needing a distinct `sm:` pass.

## 3. Layout Shell (New: `DesktopShell`)

Today every page independently does `<div className="p-5 pt-8 max-w-md mx-auto ...">`.
On desktop this becomes a shared shell concept (see AGENT.md §4/§5 on extraction
discipline — implemented as a lightweight wrapper, not a rewrite of each page):

```
┌──────────────────────────────────────────────────────────────────┐
│ [Sidebar 240–280px]  │  Top utility bar (search / notif / avatar) │
│  - Logo              ├─────────────────────────────────────────── │
│  - Home              │                                            │
│  - Library           │        Page content                        │
│  - Upload            │        max-w-6xl / 2xl:max-w-[1440px]      │
│  - Admin (if admin)  │        mx-auto, px-8 lg:px-12               │
│  - Profile           │                                            │
│  - (bottom) user chip│                                            │
└──────────────────────────────────────────────────────────────────┘
```

- **Sidebar**: fixed, `lg:flex hidden`, width `18rem` (`w-72`) at `lg`, background a
  slightly denser glass than cards (`rgba(0,0,0,0.35)` + `backdrop-blur-2xl`, i.e. the
  *same* recipe as `.glass-nav` today, just oriented vertically instead of horizontally
  — visual continuity with the mobile nav is intentional). Border on the right
  (`border-r border-white/10`) instead of top.
- **Top bar** (desktop-only, `hidden lg:flex`): houses a page title/breadcrumb, the
  existing notification bell logic (reused, not reimplemented), and the user's avatar
  (reused from `Profile`/`AppContext`'s `user` object) — this replaces the mobile pattern
  of putting identity/back-button/title inline at the top of each page's own `<div>`.
- **Content area**: `flex-1`, own scroll container, `px-8 py-10 lg:px-12` padding, inner
  `max-w-6xl mx-auto` (widen to `max-w-[1440px]` only at `2xl:` for pages with rich grids
  like Library/Admin; keep `max-w-4xl` for reading-focused pages like a single material
  detail or Profile's account section, per §6 page notes).

## 4. Grid & Card Composition Rules

- **Card sizing scales, card *style* does not.** A `.glass-card` on desktop keeps the
  same border, blur, and radius token — only its internal padding increases
  (`p-4 lg:p-6`) and its min-height may grow to accommodate larger type.
- **Column counts by breakpoint**, applied via Tailwind `grid-cols-*`:
  - Semester/subject/material grid cards: `grid-cols-2` (mobile, unchanged) →
    `md:grid-cols-3` → `lg:grid-cols-4` → `xl:grid-cols-4` (hold at 4 — beyond 4 columns
    a card grid starts to feel like a spreadsheet, not a dashboard).
  - List-style rows (Library results, Materials list, Admin pending-moderation queue):
    stay **single-column rows** even on desktop (this matches "modern dashboard" patterns
    — e.g. an email inbox or ticket queue does not go multi-column), but each row grows
    in height/padding and gains a persistent action area on the right (approve/reject,
    download, edit) that on mobile only appears via a smaller icon-only affordance.
  - Stat/summary cards (Home's top section, Profile's stats, Admin's analytics tiles):
    `grid-cols-2` (mobile) → `md:grid-cols-2` → `lg:grid-cols-4` (all stats in one row on
    desktop, a hallmark SaaS dashboard pattern).
- **Two-pane desktop-only patterns** (optional enhancement, not required for parity):
  where it clearly improves usability without changing functionality — e.g. Library —
  desktop *may* place filters in a persistent left rail (`w-64`) beside the results list
  instead of a stacked filter bar, since the underlying `searchQuery`/filter state in the
  page is unchanged, only its container. This is called out per-page in PLAN.md as an
  "enhancement" tier, distinct from the "required" baseline responsive pass, so it can be
  descoped first if time is tight.

## 5. Typography Scale (Desktop Additions)

Mobile keeps its existing scale from `docs/ui.md` exactly (`24px` headings, `16px` card
titles, `11px` labels, etc.). Desktop adds one step up for primary headings only, so
large screens don't feel like mobile type stretched thin:

| Element | Mobile (unchanged) | Desktop (`lg:`) |
|---|---|---|
| Page heading | `text-2xl` (24px) bold | `lg:text-4xl` (36px) bold, tighter tracking (`lg:tracking-tight`) |
| Section heading | `text-base`/`text-lg` | `lg:text-xl` |
| Card title | `text-base` (16px) bold | `lg:text-lg` |
| Body/description | `text-sm`/`text-xs` | unchanged — desktop reading text should **not** balloon; whitespace and layout do the "premium" work, not oversized paragraphs |
| Labels/badges | `text-[10px]`–`text-[11px]` uppercase | unchanged |

## 6. Per-Page Desktop Notes

- **Home** (`src/pages/Home.jsx`): semester grid `2 → 3 → 4` cols; "Recent materials"
  becomes a right-side or below-fold section that on desktop can sit alongside the
  semester grid in a two-column layout (`lg:grid-cols-[2fr_1fr]`) — semesters left,
  recent activity as a persistent sidebar-like feed on the right, similar to a dashboard
  "recent activity" panel. All existing logic (`recentApproved`, `isNewMaterial`,
  `convertToDownloadLink`, `semestersVm`) is reused unchanged.
- **Subjects** (`src/pages/Subjects.jsx`): row list stays single column even on desktop
  (per §4) but rows widen and gain right-aligned metadata (material count, last updated)
  that today is implicit; back button + title pattern moves into the desktop top bar
  instead of the in-page header row (mobile keeps its own header exactly as-is).
- **Materials** (`src/pages/Materials.jsx`): tab bar (Notes/Practicals/IMP/Assignment
  pill switcher) stays a pill row on desktop too (it's already a good pattern — DESIGN.md
  does not touch what's already working), but sits inline with a search box in one row
  (`lg:flex lg:items-center lg:justify-between`) instead of stacked.
- **Library** (`src/pages/Library.jsx`): candidate for the two-pane "filters rail + results
  list" enhancement described in §4. Baseline (required) treatment: filter row goes
  `grid-cols-2 → md:grid-cols-3 → lg:grid-cols-4` (extending the existing
  `md:grid-cols-3` already in the code), results list gains `lg:` row padding.
- **Profile** (`src/pages/Profile.jsx`): today a single stacked column with a cover
  banner. Desktop: banner + avatar area becomes a left column (`lg:w-80`), account
  details/uploads/stats become a right column (`lg:flex-1`) — a standard SaaS "account
  settings" split-pane, still reading the exact same `user`/stats data.
- **Upload** (`src/pages/Upload.jsx`): form stays a single reading column even on
  desktop (forms should not go multi-column — it hurts completion rates and isn't asked
  for) but is centered in a `max-w-2xl` card with more generous internal spacing, not
  stretched to `max-w-6xl`.
- **Admin** (`src/pages/Admin.jsx`, 1860 lines, multiple tabs — Analytics, Materials,
  Users, Reports, Subjects, Settings): this is the page that benefits most from desktop
  treatment. Baseline: stat tiles `2 → 4` cols (§4), tab bar becomes a horizontal set of
  larger pill/segmented buttons or, as an enhancement, a left-hand vertical tab rail
  reusing the same `activeTab` URL param logic already in `App.jsx`'s
  `/admin/:activeTab` route — no routing change, just a different tab-selector
  *rendering*. Pending-moderation cards keep the single-column row treatment (§4) with a
  wider action-button area.
- **Login** (`src/pages/Login.jsx`) and **BannedPage**: centered single-card layouts on
  mobile already; desktop simply caps card width (`lg:max-w-md`) and centers with more
  surrounding negative space plus an optional decorative side panel/illustration — no
  functional change to the Google sign-in flow.
- **Navbar → Sidebar**: see AGENT.md §5 for the structural approach; visually the
  sidebar reuses the exact icon set (`lucide-react` Home/Library/Upload/Shield/User),
  gold-active/zinc-inactive color logic, and notification-dot logic from `Navbar.jsx`,
  laid out vertically with text labels beside icons (mobile only shows labels below
  icons in a 10px caption; desktop can afford a full label at `14px` beside each icon).
- **Floating AI Assistant button** (`FloatingAIButton` in `App.jsx`): keep as a floating
  button on desktop too (it's already conditionally shown only on `/`, `/library`,
  `/profile`), but anchor it clear of the new top bar/sidebar (`lg:bottom-8 lg:right-8`)
  and keep its `animate-in`/modal behavior identical — it is explicitly excluded from the
  "mobile only" float animation already (`.mobile-float-btn` is gated at `max-width:
  768px` in `index.css`), so no change needed there beyond position on very large
  screens.

## 7. Motion & Interaction

- Hover transitions: `transition-all duration-200 ease-out` as the default for new
  desktop-only hover states (cards lifting `hover:-translate-y-0.5`, subtle
  `hover:border-[#FFD700]/40`, `hover:bg-white/[0.06]`), consistent with the existing
  `active:scale-[0.98]` press feedback already used in `.btn-primary`.
- Sidebar active-item indicator: a `2px` gold left-border or pill background
  (`bg-[#FFD700]/10 text-[#FFD700]`), animated with the same color-transition speed as
  the mobile nav's `transition-colors`.
- No new animation libraries — `framer-motion` is already a dependency and may be used
  for desktop-only entrance transitions (e.g. sidebar item stagger) sparingly, matching
  the restrained, professional tone requested (no gimmicky motion).
- Respect `prefers-reduced-motion` for any new transitions introduced (the existing
  codebase does not universally do this today — new desktop code should not regress
  further, and doing so as a small drive-by improvement is welcome, but not required in
  scope).

## 8. Accessibility & Whitespace Discipline

- Minimum content margin at `lg:` and up: `px-8`; at `2xl:` and up with capped max-width,
  effective visual margin will be larger automatically once max-width is reached.
- Maintain WCAG AA contrast for all new text on `.glass-card`/sidebar backgrounds — the
  existing gold-on-dark and white/55%-on-dark combinations already pass and should be
  reused rather than inventing new opacity values.
- Every new interactive desktop element must have a visible focus ring
  (`focus-visible:ring-2 focus-visible:ring-[#FFD700]/60`) since desktop users navigate
  by keyboard/tab far more than mobile users.

---

*Pair this document with PLAN.md (execution order) and AGENT.md (guardrails). Nothing in
this document authorizes changing any value in §1's inherited token table — those are
frozen by definition of "preserve the mobile UI exactly as it is."*
