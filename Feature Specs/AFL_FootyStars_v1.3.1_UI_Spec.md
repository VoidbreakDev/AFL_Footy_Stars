# 🏉 AFL Footy Stars — v1.3.1 Feature Specification
**Mobile UI Polish, Navigation Restructure & Shop Redesign**
*April 2026 | Prepared for Qwen Code*

---

## 1. Overview & Scope

v1.3.1 is a pure UI/UX polish release. No new game mechanics, no new types, no changes to simulation logic. The goal is to make AFL Footy Stars feel like a properly designed mobile-first game rather than a web app that happens to run on phones.

Three areas of focus, in order of impact:

1. **Navigation restructure** — move The Shop out of the Dashboard scroll, clean up routing so every key area is reachable within 1–2 taps from anywhere
2. **Shop redesign** — replace the bloated card-per-item grid layout with a compact, mobile-friendly list design that works on small screens
3. **Global mobile polish** — consistent safe area handling, touch target sizing, scroll behaviour, and visual hierarchy across all screens

> ⚠ Do NOT change any game logic, state management, or `types.ts`. This spec is **presentation-layer only**. All changes are in `components/` and `Layout.tsx`.

---

## 2. Current Problems (Diagnosed from Source)

| Location | Problem | Root Cause in Code |
|---|---|---|
| `Dashboard.tsx` | The Shop is a large full-width banner button sitting above the match card, pushing the primary action (Go to Match) far down the page | Lines 218–232: full-width button with 3-line content block and large `$` icon |
| `Dashboard.tsx` | Notification row, Shop banner, prediction card, match card, player card, objectives, last match — too many stacked sections with no visual hierarchy | No section grouping or collapsing — everything renders at full weight simultaneously |
| `Shop.tsx` | Item cards use `text-4xl` emoji (64px), large item name, description paragraph, and price all in one card — too tall for mobile grid | Lines 139–171: 4xl emoji + lg font name + sm description + xl price = ~150px per card |
| `Shop.tsx` | Grid uses `md:grid-cols-2 lg:grid-cols-3` — these breakpoints never apply on a `max-w-md` constrained layout, so it's always single-column | Line 113: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` on a 448px max-width container |
| `Shop.tsx` | Design language (`gray-800`, `gray-900`, `green-600`) is inconsistent with the rest of the app (`slate-800`, `slate-900`, `emerald-500`) | Shop.tsx uses `gray-*` and `green-*` while the rest of the app uses `slate-*` and `emerald-*` |
| `Layout.tsx` | Bottom nav has 5 buttons but only 4 named destinations (Train, Me, League, Club) + the centre football. The Shop, Media, Career Events, Transfer Market are all buried inside sub-pages with no direct nav access | No overflow navigation pattern — discovery depends entirely on Dashboard placement |
| `Layout.tsx` | Nav labels are `text-[10px]` and hard to read | Line 32: `text-[10px] font-bold uppercase` |
| Multiple | No back-button consistency — some screens use a bottom "← Back" button, others rely on nav | Each component implements its own back navigation independently |

---

## 3. Navigation Restructure

### 3.1 Bottom Nav — Revised 5-Tab Layout

Current slots: Train | Me | [Match] | League | Club

Proposed — same 5 slots, slot 5 (Club) becomes a Hub for all off-field management:

| Slot | Icon | Label | Destination | Change |
|---|---|---|---|---|
| 1 | Lightning bolt | Train | TRAINING view | No change |
| 2 | Person | Me | PLAYER view | No change |
| 3 (centre) | Football | — | DASHBOARD view | No change — keep floating button |
| 4 | Bar chart | League | LEAGUE view | No change |
| 5 | Grid/apps icon | Hub | New HUB view (see 3.2) | **CHANGE:** replace Club with a hub menu |

> ⚠ The existing CLUB view (ClubHub content) is NOT removed — it becomes one tile inside the Hub view.

---

### 3.2 New HUB View — `components/Hub.tsx` (new file)

The Hub is a full-screen menu grid acting as a "More" screen. It replaces the direct Club nav button. Single-screen component, no scrolling needed on typical phones.

**Layout:** 2-column grid of large tappable cards, each navigating to a view. Cards show: icon + label + 1-line dynamic status hint.

| Card | Icon | Destination View | Status Hint (dynamic) |
|---|---|---|---|
| Club | 🏟️ | CLUB | e.g. "4th on the ladder" |
| The Shop | 🛒 | SHOP | e.g. "$12,500 available" |
| Transfer Market | 📨 | TRANSFER_MARKET | e.g. "2 offers waiting" or "No current offers" |
| Media Hub | 📱 | MEDIA_HUB | e.g. "1 event needs response" or reputation tier |
| Career Events | ✨ | CAREER_EVENTS | e.g. "3 active events" or "All clear" |
| Achievements | 🏆 | ACHIEVEMENTS | e.g. "72 / 100 unlocked" |
| Milestones | 🎖️ | MILESTONES | e.g. next milestone approaching |
| Skill Tree | 🌟 | MASTER_SKILLS | e.g. "2 skills available to unlock" |
| Settings | ⚙️ | SETTINGS | "Sound, saves, display" |

Header: "Your Career Hub" with player name and current season year. Back behaviour: Hub has no back button — use the football nav button to return to Dashboard.

> ⚠ Add `'HUB'` to the view type union in `types.ts` (single addition). Add case to `App.tsx` router. This is the **only** `types.ts` change permitted in v1.3.1.

---

### 3.3 Dashboard — Remove Shop Banner, Add Compact Quick-Access Row

**Remove** the large Shop banner button entirely from `Dashboard.tsx` (lines 218–232).

**Replace** with a compact Quick-Access row — a horizontally scrollable strip of small pill buttons positioned above the match card. Each pill is 36–40px tall, icon + short label only. No descriptions, no dollar amounts.

Quick-Access pills (always visible):

- 💪 **Train** — `setView('TRAINING')`
- 🛒 **Shop** — `setView('SHOP')` — with wallet balance as a small number badge
- ⚡ **Skill Tree** — `setView('MASTER_SKILLS')` — with "N SP available" badge if `skillPoints > 0`
- 📋 **Hub** — `setView('HUB')`

Design: `h-10` pills, `bg-slate-800 border border-slate-700`, active/highlighted uses `border-emerald-500/50`. Horizontally scrollable with `overflow-x-auto`.

---

### 3.4 Consistent Back Navigation — `components/BackHeader.tsx` (new file)

Reusable back header component. Every sub-view that's not in the bottom nav should use this.

**Props:** `title: string`, `subtitle?: string`, `onBack: () => void`, `rightSlot?: ReactNode`

**Design:** sticky top bar, `bg-slate-950/90 backdrop-blur-sm`, `h-14`, chevron-left icon + title + optional right slot (e.g. wallet balance for Shop).

Apply to: Shop, Transfer Market, Media Hub, Career Events, Achievements, Milestones, Skill Tree, Settings, Club, League.

> ⚠ Replace existing ad-hoc back buttons in each component with BackHeader. Standardise across all sub-views.

---

## 4. Shop Redesign — `components/Shop.tsx`

### 4.1 Design Principles

- **Mobile-first:** every item row must be legible and tappable in a single thumb reach
- **Compact:** reduce item card height from ~150px to ~64px (row layout instead of card layout)
- **Consistent:** use `slate-*` / `emerald-*` colour tokens, not `gray-*` / `green-*`
- **No grid:** replace the broken `md:grid-cols-2` grid with a flat vertical list
- **Reduce emoji size:** `text-4xl` (64px) → `text-2xl` (32px) max

---

### 4.2 New Shop Layout

#### Header
Use the new `BackHeader` component. Keep wallet display — simplify to player name + wallet balance. Remove "Lifetime earnings" line (move to PlayerStats where career financials belong).

#### Category Filter
Current: large pill buttons with icon + text.
Change to: compact tabs with icon + small label. 5 tabs: **All | 💊 Recovery | 💪 Training | ⭐ Career | 🎨 Cosmetic**. Each tab: `h-10`, `px-3`, `text-xs` label. Horizontally scrollable.

#### Item List — Row Layout (replaces card grid)

Each item is a horizontal row, ~64px tall. Structure left to right:

- **Left:** item icon — `text-2xl` in a `w-10 h-10 rounded-lg bg-slate-800` container
- **Centre:** item name (`text-sm font-bold text-white`) + effect description (`text-xs text-slate-400`) stacked vertically
- **Right:** price pill + buy button or status badge

Row states:

| State | Style |
|---|---|
| Affordable & available | `border-l-2 border-emerald-500` — tap to open purchase confirm |
| Cannot afford | `border-l-2 border-slate-600`, price `text-red-400`, `opacity-60` |
| Already owned (one-time) | `border-l-2 border-purple-500`, shows "✓ Owned" badge, `opacity-50`, not tappable |

When showing ALL items, add sticky section headers between categories: `text-xs uppercase text-slate-500 bg-slate-950 py-1 px-4`.

#### Purchase Confirmation Modal

Keep existing modal structure — it's already well-designed. Minor changes only:

- `text-6xl` icon → `text-4xl`
- `gray-900` / `gray-800` → `slate-900` / `slate-800`
- `green-600` confirm button → `emerald-500`

> ⚠ The purchase confirmation modal is solid — do not over-engineer it. Just align colour tokens.

---

### 4.3 Shop Access from Dashboard

With the Shop removed from the Dashboard scroll, it is now accessed via:

- The Shop pill in the Quick-Access row on Dashboard (wallet balance visible here)
- The Shop card in the Hub view

Both routes are faster than the old position (scroll past notifications to find the banner).

---

## 5. Dashboard Cleanup — `components/Dashboard.tsx`

### 5.1 Section Order & Visual Hierarchy

**Current order (top to bottom):**
1. TipCard
2. Modals (PostMatchPress, milestone overlay)
3. Header row (Match Day / Round X)
4. Injury banner
5. Notification row (transfer, media, events)
6. Shop banner ← **REMOVE**
7. Match prediction card (conditional)
8. Match card (VS block + Play button)
9. Player card (stats)
10. Last match result
11. Season Objectives

**Proposed order after v1.3.1:**
1. Header row (unchanged)
2. Quick-Access row (new — section 3.3)
3. Injury banner (if applicable)
4. Notification chips (unchanged — already compact)
5. **Match card (VS block + Play button) — moved UP** — it's the primary action
6. Match prediction (stays below match card)
7. Season Objectives — collapsed to 2 items + "See all X" link by default
8. Player card (compact, tappable shortcut to PLAYER view)
9. Last match result (moved to bottom — it's historical)
10. TipCard (moved to bottom — it's supplementary)

> ⚠ The Match card should be the **first** substantive content a player sees after the header. It is the primary action on this screen.

---

### 5.2 Season Objectives — Collapsible

The current objectives list renders all objectives at full height.

**Change:** show only the first 2 objectives (`slice(0, 2)`) by default. Add a "Show all X objectives" expand button. Use `useState(false)` expanded flag. Purely presentational — no changes to player object.

---

### 5.3 Player Card — Make It Tappable

Add `onClick={() => setView('PLAYER')}` to the player card container. Add a subtle "View full stats →" text in the bottom-right corner. Makes the player card a navigation shortcut.

---

## 6. Global Mobile Polish

### 6.1 Touch Target Sizing

Minimum touch target: 44×44px (Apple HIG / Material Design). Known violations to fix:

| Component | Current Issue | Fix |
|---|---|---|
| `Layout.tsx` nav labels | `text-[10px]` — hard to read | Change to `text-xs` (12px) |
| Dashboard notification chips | `py-2` ≈ 32px tall — under 44px | Change to `py-2.5 min-h-[44px]` |
| Shop category tabs (current) | `py-2` ≈ 36px tall | Change to `py-2.5 min-h-[44px]` |
| Back buttons (various) | Inconsistent sizes | Standardised via BackHeader (`h-14` = 56px) |

---

### 6.2 Consistent Colour Token Substitutions

Apply when touching any component in this update:

| Find (current in Shop) | Replace With |
|---|---|
| `bg-gray-800` | `bg-slate-800` |
| `bg-gray-900` | `bg-slate-900` |
| `bg-gray-700` | `bg-slate-700` |
| `text-gray-400` | `text-slate-400` |
| `border-gray-700` | `border-slate-700` |
| `bg-green-600` | `bg-emerald-500` |
| `hover:bg-green-500` | `hover:bg-emerald-400` |
| `text-green-400` | `text-emerald-400` |
| `from-green-950` | `from-slate-950` |

---

### 6.3 `pb-24` Safe Area Padding

All scrollable views must use at least `pb-24` to clear the 80px bottom nav. Verify:

- `Shop.tsx` uses `p-6` at root — add `pb-24` to the inner scroll container
- `Training.tsx` — verify `pb-24` is present
- Any new views added in v1.3 (`StoryArcPanel`, `MediaHub` extension) should include `pb-24` on their root scroll div

---

### 6.4 Active Tap Feedback

Any button that triggers an action should have `active:scale-95 transition-all` for tactile tap feedback. Verify the new Shop row buy buttons include it.

---

## 7. Implementation Plan

### 7.1 Build Order

| # | Task | File(s) | Complexity | Priority |
|---|---|---|---|---|
| 1 | Add `'HUB'` to view union in `types.ts`. Add Hub case to `App.tsx` router. | `types.ts`, `App.tsx` | Low | P1 |
| 2 | Create `BackHeader.tsx` reusable component | `components/BackHeader.tsx` (new) | Low | P1 |
| 3 | Create `Hub.tsx` — 2-column grid of destination cards with dynamic status hints | `components/Hub.tsx` (new) | Medium | P1 |
| 4 | `Layout.tsx` — change nav slot 5 from Club to Hub | `components/Layout.tsx` | Low | P1 |
| 5 | `Shop.tsx` — full redesign: colour tokens, row list layout, compact category tabs, BackHeader | `components/Shop.tsx` | Medium | P1 |
| 6 | `Dashboard.tsx` — remove Shop banner, add Quick-Access pill row, reorder sections, collapsible objectives, tappable player card | `components/Dashboard.tsx` | Medium | P1 |
| 7 | Apply BackHeader to: Training, TransferMarket, MediaHub, Achievements, MilestonesGallery, MasterSkillTree, Settings | Multiple components | Low (repetitive) | P2 |
| 8 | Touch target audit: update `py` values on notification chips and category tabs | `Dashboard.tsx`, `Shop.tsx` | Low | P2 |
| 9 | `pb-24` audit: verify all scrollable views clear the nav bar | All components | Low | P3 |

---

### 7.2 What NOT to Change

- `utils/` — no changes. Presentation-only release.
- `context/GameContext.tsx` — no changes.
- `types.ts` — one addition only: add `'HUB'` to the view string union.
- `constants.ts` — no changes.
- `MatchSim.tsx`, `simulationUtils.ts` — do not touch.
- The match card itself (VS block, Play button, prediction) — layout is good, leave it alone.
- Modal components (DailyRewardModal, AwardsCeremony, etc.) — do not touch.

---

### 7.3 Design Reference — Visual Language

When building new components (Hub, BackHeader) and updating existing ones:

| Element | Tailwind Classes |
|---|---|
| Screen background | `bg-slate-900 text-white` |
| Card / Panel | `bg-slate-800 rounded-xl border border-slate-700` |
| Elevated card (featured) | `bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl` |
| Primary action button | `bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black uppercase rounded-lg py-3 active:scale-95 transition-all` |
| Secondary action button | `bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg py-3 transition-colors` |
| Destructive / warning button | `bg-red-900/40 border border-red-500/40 text-red-400 rounded-lg` |
| Small accent pill / badge | `bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full` |
| Section label | `text-xs font-bold text-slate-400 uppercase tracking-widest` |
| Body text | `text-sm text-slate-300` |
| Muted text | `text-xs text-slate-500` |
| Nav active indicator | `text-emerald-400` — thin `h-0.5` bar at top of nav button |
| Back header bar | `bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 h-14 sticky top-0 z-10` |

---

## 8. Handoff Notes for Qwen

### Hub.tsx — Status Hints

Dynamic status hints need to read from the player context via `useGame()`. Derive as follows:

- **Club:** `league.findIndex(t => t.name === player.contract.clubName) + 1` → e.g. `"4th on the ladder"`
- **Shop:** `(player.wallet || 0).toLocaleString() + " available"`
- **Transfer Market:** `player.transferOffers?.length > 0 ? X + " offers waiting" : "No current offers"`
- **Media Hub:** count of unresponded media events, or reputation tier label
- **Career Events:** `player.activeCareerEvents?.length + " active"` or `"All clear"`
- **Achievements:** count of unlocked vs total achievements
- **Skill Tree:** `player.skillPoints > 0 ? player.skillPoints + " SP to spend" : "All skills up to date"`

### Quick-Access Pill — Wallet Badge

Show wallet balance as a small badge below the "Shop" label. Use `text-[10px] text-emerald-400 font-mono`. Keep it single-line — do not expand pill height beyond `h-10`.

### Collapsible Objectives

Show first 2 items (`slice(0, 2)`) with a "Show all X objectives" button that toggles a local `useState(false)` expanded flag. Purely presentational — no changes to the player object.

### Back Button Destination

Most sub-views should call `setView('DASHBOARD')` on back. Keep it simple — DASHBOARD is always the correct back destination for sub-views regardless of how they were reached (Dashboard chips or Hub tiles).

---

*AFL Footy Stars v1.3.1 Specification — End of Document*
*Prepared April 2026 | VoidbreakDev / Ryan Sinclair*
