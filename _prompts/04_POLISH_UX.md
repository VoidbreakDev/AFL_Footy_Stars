# AFL Footy Stars — Polish & UX Feature Prompts

> **Sub-agent instructions:** You are working on the AFL Footy Stars codebase. Before making any changes, read `CLAUDE.md` for full architecture context, then read the specific files listed under each feature. Implement features in order. Preserve all existing TypeScript types — do not remove any fields from `PlayerProfile`. Confirm zero TypeScript errors via `npm run build` before finishing.

---

## Feature 1 — Fix AFL draft team name bug (known TODO)

**Goal:** Fix the documented bug where draft picks at the AFL tier show placeholder names instead of real AFL club names.

**Files to read first:**
- `context/GameContext.tsx` — line 693 and surrounding draft pick logic
- `utils/draftUtils.ts` — full file
- `constants.ts` — `TEAM_NAMES_AFL` array

**What to build:**

1. Read `GameContext.tsx` around line 693. Locate where simulated draft picks are generated for AFL-tier teams and note the placeholder/incorrect team name being used.

2. In `draftUtils.ts`, find `simulateDraft()` (or equivalent function). Ensure it accepts a `teams: Team[]` parameter (or a `string[]` of team names) rather than hardcoding placeholder names.

3. Pass the correct AFL league team array from `GameContext.tsx` into `draftUtils.ts` when calling the simulated draft picks at AFL tier. The team names should come from `TEAM_NAMES_AFL` in `constants.ts` or the currently generated league's `Team[]` array — whichever is contextually correct.

4. Verify that Local League and State League draft picks also use `TEAM_NAMES_LOCAL` and `TEAM_NAMES_STATE` respectively — fix those too if they have the same issue.

5. In `components/Draft.tsx`, confirm the draft UI renders the corrected team names correctly for all three tiers.

**Constraints:**
- Do not change the draft pick logic or prospect generation — this is purely a data-passing fix
- The fix must not break existing save games with draft history stored

---

## Feature 2 — Save slot system (multiple careers)

**Goal:** Support 3 save slots so players can run multiple careers without overwriting each other. Add a start screen showing slot snapshots.

**Files to read first:**
- `context/GameContext.tsx` — `saveGame()`, `loadGame()`, localStorage key `'footyLegendSave'`
- `components/Onboarding.tsx` — player creation flow
- `App.tsx` — root component and view routing

**What to build:**

1. Define a slot key helper in `GameContext.tsx`:
   ```typescript
   const SAVE_KEY = (slot: number) => `footyLegendSave_slot${slot}`; // slots 0, 1, 2
   ```

2. Add `currentSlot: number` to the game state in `GameContext.tsx` (default 0). Update `saveGame()` and `loadGame()` to use `SAVE_KEY(currentSlot)` instead of the hardcoded `'footyLegendSave'`.

3. Keep backward compatibility: on first load, if `'footyLegendSave'` exists in localStorage and `'footyLegendSave_slot0'` does not, migrate the old save to slot 0 automatically.

4. Create a new view state `'SLOT_SELECT'` and a corresponding `components/SlotSelect.tsx` component. This screen shows 3 slot cards:
   - **Occupied slot**: shows player name, club, age, level, and tier (Local/State/AFL)
   - **Empty slot**: shows "New Career" with a + icon
   - Clicking an occupied slot loads that save and sets `currentSlot`
   - Clicking an empty slot starts `Onboarding` for that slot

5. Add a "Change Career" button in `components/Settings.tsx` that returns the player to `'SLOT_SELECT'` (with a confirmation prompt if mid-season: "Your progress this round will be saved first").

6. Show the active slot number as a small badge somewhere subtle in `components/Layout.tsx` (e.g. "Career 1 of 3").

**Constraints:**
- Old saves on `'footyLegendSave'` must migrate automatically — no data loss
- Slot 0 is the default — unchanged behaviour for new installs
- The slot select screen should appear on initial app load if no slot was previously active

---

## Feature 3 — Match highlights reel

**Goal:** After each match, surface the top 5 match events as a "Highlights" tab so players can review memorable moments without re-reading the full timeline.

**Files to read first:**
- `types.ts` — `MatchResult`, `MatchEvent`
- `context/GameContext.tsx` — `commitMatchResult()` and match result state
- `components/MatchSim.tsx` — full file (result display section)

**What to build:**

1. Add `highlights?: MatchEvent[]` to the `MatchResult` interface in `types.ts`.

2. In `GameContext.tsx` inside `commitMatchResult()` (or wherever the match timeline is finalised), select the top 5 highlight events from the timeline using this priority:
   - Goals by the player (highest priority)
   - Injuries (player or opponent)
   - RIVALRY events
   - Big marks or tackles with `isPlayerInvolved: true`
   - Fill remaining slots with highest-impact GENERIC or POSSESSION events
   Store them as `result.highlights`.

3. In `MatchSim.tsx` on the match result screen, add a **Highlights** tab alongside the existing stats display:
   - Each highlight shown as a styled card with: quarter badge, time, event description, event type icon
   - If Gemini AI is available (`geminiService.ts`), generate a 1-sentence colour commentary for each highlight using the event description as input
   - If no API key, display the raw event description

4. Auto-scroll to the first highlight card when the Highlights tab is opened.

**Constraints:**
- `highlights` is optional on `MatchResult` — existing code that doesn't populate it won't break
- Maximum 5 highlights per match
- Highlight selection runs synchronously in `commitMatchResult()` — no async dependency

---

## Feature 4 — Onboarding tutorial & contextual tips

**Goal:** Help new players understand core game systems with first-visit tooltips and a guided first-round walkthrough after onboarding.

**Files to read first:**
- `components/Onboarding.tsx` — player creation wizard
- `components/Dashboard.tsx` — main home screen
- `components/Layout.tsx` — nav/layout wrapper
- `context/GameContext.tsx` — game state initialisation

**What to build:**

1. Add `seenTips?: Record<string, boolean>` to `PlayerProfile` in `types.ts`. Keys are view names (e.g. `'DASHBOARD'`, `'TRAINING'`, `'SHOP'`).

2. Create a reusable `components/TipCard.tsx` component:
   - A dismissible banner (not a modal — it sits below the view title)
   - Props: `tipKey: string`, `title: string`, `body: string`
   - On dismiss, sets `player.seenTips[tipKey] = true` and saves
   - Never shows again once dismissed

3. Add tip cards to 5 key views (displayed only on first visit):
   - **DASHBOARD** — "Tap 'Play Match' each round to earn XP and progress your career. Check your energy and morale before each game."
   - **TRAINING** — "Spend Skill Points to improve your attributes. Each attribute has a cap set by your potential."
   - **SHOP** — "Spend your wallet earnings on recovery items and boosts. Energy recovery items are key for long seasons."
   - **TRANSFER_MARKET** — "Transfer offers expire after a few rounds — check back regularly and weigh up salary vs club ranking."
   - **MASTER_SKILLS** — "Master Skills unlock once your attributes reach the prerequisite level. Legendary skills are game-changers."

4. After `Onboarding` completes, before switching to `DASHBOARD`, run a brief 3-step "First Round Guide" overlay:
   - Step 1: Highlight the Match button — "Your first match is ready. Tap here to play."
   - Step 2: Highlight Training — "After your match, train to improve your attributes."
   - Step 3: Highlight Player Stats — "Track your progress here."
   - Each step has a "Got it →" button. After step 3, dismiss and go to DASHBOARD normally.

5. Add a "Reset Tips" button in `Settings.tsx` that clears `player.seenTips` so players can re-read the guidance if needed.

**Constraints:**
- Tips must never block core game actions — they are dismissible banners, not blocking modals
- `seenTips` is optional — existing saves without it default to all tips shown (no tips display for returning players)
- The first-round guide only shows on a brand new career (detectable by `player.seasonsPlayed === 0 && player.careerStats.matches === 0`)
