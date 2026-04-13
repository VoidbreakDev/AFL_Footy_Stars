# AFL Footy Stars — Gameplay Feature Prompts

> **Sub-agent instructions:** You are working on the AFL Footy Stars codebase. Before making any changes, read `CLAUDE.md` for full architecture context, then read the specific files listed under each feature. Implement features in order. Preserve all existing TypeScript types — do not remove any fields from `PlayerProfile`. Confirm zero TypeScript errors via `npm run build` before finishing.

---

## Feature 1 — Position-specific match roles

**Goal:** Give each position a meaningfully different on-field experience during match simulation rather than all positions sharing the same generic event pool.

**Files to read first:**
- `utils/simulationUtils.ts` — full file
- `types.ts` — `Position` enum, `PlayerAttributes`, `MatchEvent`
- `constants.ts` — existing PHRASES arrays

**What to build:**

1. In `utils/simulationUtils.ts`, inside `calculateMatchOutcome()`, branch the player-involved event generation based on `player.position`:
   - **FORWARD** — higher weight on GOAL/BEHIND events; add `ONE_ON_ONE` event where goalSense + marking determine outcome
   - **MIDFIELDER** — higher weight on POSSESSION/TURNOVER; clearance events using speed + handball
   - **DEFENDER** — add `INTERCEPT` and `ONE_ON_ONE_DEFENSIVE` events using tackling + marking; a successful intercept gives bonus disposals
   - **RUCK** — add `HIT_OUT` event type; contests use stamina + marking; winning a hit-out gives the team a possession bonus for that quarter

2. Add new event types to the `MatchEvent.type` union in `types.ts`:
   ```
   'ONE_ON_ONE' | 'ONE_ON_ONE_DEFENSIVE' | 'HIT_OUT' | 'INTERCEPT'
   ```

3. Add phrase arrays for the new event types inside the `PHRASES` object in `simulationUtils.ts`:
   - `HIT_OUT`: 4–5 phrases (e.g. "wins the tap cleanly!", "dominates the ruck contest")
   - `INTERCEPT`: 4–5 phrases (e.g. "reads it brilliantly and intercepts!")
   - `ONE_ON_ONE`: 4–5 phrases for win/loss variants

4. Apply small position-based stat multipliers to the returned `playerStats` after the match — e.g. forwards get +10% goalSense contribution to goals scored.

5. Update `MatchSim.tsx` to display the new event types with appropriate colours in the match timeline, using existing event-type colour logic as a pattern.

**Constraints:**
- Do not change the function signature of `calculateMatchOutcome()`
- `simulateCPUMatch()` (CPU vs CPU) does not need position logic
- No new required fields in saved `PlayerProfile` data

---

## Feature 2 — Quarter-by-quarter energy management

**Goal:** Make `player.energy` matter inside a match. Energy depletes across quarters and visibly affects Q4 performance.

**Files to read first:**
- `utils/simulationUtils.ts` — `calculateMatchOutcome()` and quarter loop
- `types.ts` — `PlayerProfile.energy`, `MatchResult`
- `components/MatchSim.tsx` — quarter display and match flow
- `constants.ts` — energy-related constants

**What to build:**

1. In `simulationUtils.ts`, modify the quarter loop so each quarter reduces an effective in-match energy level:
   - Start from `player.energy` (0–100)
   - Each quarter costs 10–20 energy (randomised, higher if player was heavily involved)
   - Below 50 energy: mild performance penalty (–5% on speed/stamina rolls)
   - Below 25 energy: noticeable penalty (–15%), higher chance of sub-par events
   - Return `energyUsed: number` in `MatchResult`

2. Add `energyUsed: number` to the `MatchResult` interface in `types.ts`.

3. In `GameContext.tsx`, inside `commitMatchResult()`, deduct the returned `energyUsed` from `player.energy` (clamp minimum to 5).

4. In `MatchSim.tsx`, add a small energy bar (green → amber → red) to the quarter-by-quarter display showing energy dropping across the match.

5. If `player.energy < 30` when a match is started, show a warning banner in `MatchSim.tsx`: "Low energy — expect a tough game."

**Constraints:**
- `player.energy` already exists in `PlayerProfile` — do not add new top-level fields
- Energy cannot go below 0
- CPU matches are unaffected

---

## Feature 3 — Tactical pre-match setup

**Goal:** Add a simple pre-match tactical choice (Attack / Balanced / Defensive) that modifies match simulation weights.

**Files to read first:**
- `components/MatchSim.tsx` — match preview stage
- `utils/simulationUtils.ts` — `calculateMatchOutcome()` parameter signature
- `context/GameContext.tsx` — match state management
- `types.ts` — existing match-related types

**What to build:**

1. Add a `Tactic` type to `types.ts`:
   ```typescript
   export type Tactic = 'ATTACK' | 'BALANCED' | 'DEFENSIVE' | 'PRESS';
   ```

2. Add a `selectedTactic` field to match state in `GameContext.tsx` (local state only — not persisted to `PlayerProfile`).

3. In `MatchSim.tsx` at the match preview stage, add a tactic selector with three buttons:
   - **Attack** — "Higher scoring chance, burns more energy"
   - **Balanced** — "Default — no modifier"
   - **Defensive** — "Fewer goals against, lower scoring chance"

4. Pass the selected tactic into `calculateMatchOutcome()` as an optional parameter (`tactic?: Tactic`) and apply modifiers:
   - ATTACK: player scoring event weights +20%, energy cost per quarter +5
   - BALANCED: no change
   - DEFENSIVE: opponent scoring events –15%, player scoring events –10%, energy cost –3

5. If the player has a TACTICIAN coach in `player.coachingStaff`, unlock the **Press** tactic: high energy drain, high turnover generation, big stamina penalty.

6. Display which tactic was used in the post-match result summary in `MatchSim.tsx`.

**Constraints:**
- Default tactic is BALANCED — must be backward compatible with existing saves
- Tactic resets each match (not persisted)

---

## Feature 4 — Injury rehab mini-flow

**Goal:** Replace the passive "wait for the counter to hit zero" injury mechanic with an active weekly rehab choice.

**Files to read first:**
- `types.ts` — `PlayerInjury` interface
- `context/GameContext.tsx` — injury handling and round-advance logic
- `components/Training.tsx` — UI patterns for attribute/energy displays

**What to build:**

1. Extend `PlayerInjury` in `types.ts`:
   ```typescript
   export interface PlayerInjury {
     name: string;
     weeksRemaining: number;
     rehabChoice?: 'REST' | 'LIGHT' | 'PUSH';
   }
   ```

2. When `player.injury` is not null, replace the normal training panel in `Training.tsx` with a rehab panel showing three options:
   - **Rest** — normal –1 week recovery, no risk, +3 morale
   - **Train Light** — 50% chance: heals 1 extra week; 10% chance: re-injury extends by 1 week
   - **Push Through** — 30% chance: heals 2 extra weeks; 25% chance: re-injury extends by 2 weeks

3. If the player has a PHYSIO staff member in `player.coachingStaff`:
   - Train Light heal chance improves to 60%
   - Push Through re-injury risk reduces by 10%

4. Display the current injury name, weeks remaining, and the active physio bonus (if applicable) clearly on the panel.

5. In `GameContext.tsx` round-advance logic, read `player.injury.rehabChoice`, apply the appropriate outcome (using `Math.random()` for the probabilistic results), then clear `rehabChoice`.

**Constraints:**
- Backward compatible with saves containing `injury: { name, weeksRemaining }` (rehabChoice is optional)
- No new top-level `PlayerProfile` fields beyond extending `PlayerInjury`
