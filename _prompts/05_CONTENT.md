# AFL Footy Stars — Content Feature Prompts

> **Sub-agent instructions:** You are working on the AFL Footy Stars codebase. Before making any changes, read `CLAUDE.md` for full architecture context, then read the specific files listed under each feature. Implement features in order. Preserve all existing TypeScript types — do not remove any fields from `PlayerProfile`. Confirm zero TypeScript errors via `npm run build` before finishing.

---

## Feature 1 — Training mini-games

**Goal:** Replace the flat "click attribute, spend points" training flow with 3 optional mini-game drills that reward active play with bonus XP and a small attribute bump.

**Files to read first:**
- `components/Training.tsx` — full file
- `context/GameContext.tsx` — `trainAttribute()` function
- `types.ts` — `PlayerAttributes`, `PlayerProfile.energy`
- `constants.ts` — training-related constants

**What to build:**

1. In `Training.tsx`, add a "Drill of the Day" section above the standard attribute training panel. It shows one available mini-game per session (rotates based on `currentRound % 3`).

2. Implement 3 mini-game components as inline React components within `Training.tsx` (or as separate files in `components/` if they grow large):

   **Kick Accuracy Drill** (for Kicking attribute):
   - Shows 5 "targets" as buttons arranged in a pattern
   - Player has 5 seconds (use a countdown timer via `setInterval`) to tap/click as many as possible
   - Score: each hit = +1 accuracy point
   - Reward: 3+ hits → +1 Kicking (capped at potential), +150 XP; 5 hits → +2 Kicking, +300 XP

   **Reaction Speed Drill** (for Speed attribute):
   - A coloured circle appears at a random position after a 1–3 second random delay
   - Player must click it as fast as possible (measure ms from appearance to click)
   - Reward: < 500ms → +2 Speed, +200 XP; 500–1000ms → +1 Speed, +100 XP; > 1000ms → +50 XP only

   **Strength Circuit** (for Tackling attribute):
   - A simple "button mashing" or rapid-click challenge: click a target button as many times as possible in 5 seconds
   - Count clicks
   - Reward: 10+ clicks → +1 Tackling, +150 XP; 20+ clicks → +2 Tackling, +250 XP

3. Each mini-game costs 10 energy to attempt (same as a normal training session). Deduct energy in `GameContext` after completion.

4. Each mini-game can only be completed once per round. Store completion state in a local `sessionStorage` key (resets each page load / round naturally) — do NOT add it to `PlayerProfile`.

5. After completing a mini-game, show a result card: "Drill Complete — +1 Kicking, +150 XP" with a brief animation class transition.

**Constraints:**
- Mini-games are optional — standard attribute training remains fully functional
- Rewards are capped by `player.potential` — same cap logic as `trainAttribute()`
- No new `PlayerProfile` fields required

---

## Feature 2 — Club history & record books

**Goal:** Give each club a procedurally generated history — all-time leading goalkicker, most capped player, premiership years — and track whether the player is breaking any club records.

**Files to read first:**
- `types.ts` — `Team` interface
- `utils/leagueUtils.ts` — `generateLeague()` function
- `components/ClubHub.tsx` — full file
- `constants.ts` — team definitions

**What to build:**

1. Add a `ClubHistory` interface to `types.ts`:
   ```typescript
   export interface ClubRecord {
     playerName: string;
     value: number;
     year: number;
   }

   export interface ClubHistory {
     foundingYear: number;
     premierships: number[];       // years won (e.g. [1998, 2005, 2019])
     allTimeGoals: ClubRecord;     // top goalkicker
     allTimeCaps: ClubRecord;      // most matches
     allTimeDisposals: ClubRecord; // most career disposals
   }
   ```

2. Add `history?: ClubHistory` to the `Team` interface in `types.ts`.

3. In `utils/leagueUtils.ts`, inside `generateLeague()`, call a new `generateClubHistory(teamName: string, tier: LeagueTier): ClubHistory` function that procedurally generates plausible history:
   - `foundingYear`: random between 1925–1965 (AFL), 1965–1990 (State), 1980–2000 (Local)
   - `premierships`: 2–8 random years between foundingYear and 2023
   - `allTimeGoals`: a generated player name + a value between 400–900 (AFL), 200–500 (State), 100–300 (Local)
   - `allTimeCaps`: a generated name + value between 200–350 (AFL), 100–200 (State), 50–120 (Local)
   - `allTimeDisposals`: similar ranges

4. In `ClubHub.tsx`, add a "Club History" tab (alongside any existing tabs):
   - Show founding year, list of premiership years as a badge row
   - Show the three all-time record cards (Goals, Caps, Disposals) with the record-holder's name and value

5. Add live record comparison: check if `player.careerStats.goals`, `player.careerStats.matches`, or `player.careerStats.disposals` (sum of kicks + handballs from `careerStats`) exceeds the club record **at the player's current club**:
   - If within 10% of breaking a record: show a "Record Watch" banner in `ClubHub.tsx` — "You're X away from becoming the all-time goals leader at [Club]"
   - If the record is broken: trigger a career event using the existing `CareerEvent` system ("You've broken the club goals record!")

**Constraints:**
- `history` is optional on `Team` — generated on league creation, not required on old saves
- Record comparison only applies to the player's current club (not past clubs)
- Procedural generation must be deterministic for the same team name (use a simple string hash as a seed) so records don't change on reload

---

## Feature 3 — AFLW women's league path

**Goal:** Legitimise the female player option by adding a parallel AFLW league path with AFLW-branded teams and a dedicated awards set.

**Files to read first:**
- `types.ts` — `PlayerProfile.gender`, `LeagueTier`, `Award`
- `constants.ts` — `TEAM_NAMES_AFL`, `TEAM_NAMES_STATE`, `TEAM_NAMES_LOCAL`, award definitions
- `utils/leagueUtils.ts` — `generateLeague()` function
- `utils/awardUtils.ts` — award calculation
- `components/Onboarding.tsx` — gender selection step

**What to build:**

1. Add `AFLW` as a league path variant. Add a `LeagueGender` type to `types.ts`:
   ```typescript
   export type LeagueGender = 'MENS' | 'WOMENS';
   ```
   Add `leagueGender?: LeagueGender` to `PlayerProfile`.

2. Add AFLW team name arrays to `constants.ts`:
   ```typescript
   export const TEAM_NAMES_AFLW = [
     "Adelaide Crows", "Brisbane Lions", "Carlton", "Collingwood",
     "Essendon", "Fremantle", "GWS Giants", "Geelong",
     // add all 14 current AFLW clubs
   ];
   export const TEAM_NAMES_STATE_W = [/* 8 women's state league names */];
   export const TEAM_NAMES_LOCAL_W = [/* 8 local women's league names */];
   ```

3. In `utils/leagueUtils.ts`, update `generateLeague()` to accept a `gender: LeagueGender` parameter. When `gender === 'WOMENS'`, use the `_W` team name arrays.

4. In `components/Onboarding.tsx`, when the player selects Female gender, set `player.leagueGender = 'WOMENS'` and pass this into the league generation call.

5. Add AFLW-specific awards to `constants.ts` and `utils/awardUtils.ts`:
   - AFLW Best & Fairest (equivalent of Brownlow)
   - AFLW Coleman Medal (leading goalkicker)
   - AFLW All-Australian Team
   - Replace the standard award names in award calculations when `player.leagueGender === 'WOMENS'`

6. In `components/AwardsCeremony.tsx` and `components/SeasonRecap.tsx`, conditionally display AFLW award names and branding when playing the women's path.

7. Update `LeagueView.tsx` to show "AFLW" or "Women's AFL" as the league label when on the women's path.

**Constraints:**
- Male players are completely unaffected — the men's path is identical to current behaviour
- `leagueGender` is optional — existing saves without it default to `'MENS'`
- Do not rename or modify existing award types used by the men's game — add parallel AFLW award types only
