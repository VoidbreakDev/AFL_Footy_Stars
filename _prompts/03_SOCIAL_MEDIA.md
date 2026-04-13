# AFL Footy Stars — Social & Media Feature Prompts

> **Sub-agent instructions:** You are working on the AFL Footy Stars codebase. Before making any changes, read `CLAUDE.md` for full architecture context, then read the specific files listed under each feature. Implement features in order. Preserve all existing TypeScript types — do not remove any fields from `PlayerProfile`. Confirm zero TypeScript errors via `npm run build` before finishing.

---

## Feature 1 — Fan mail & supporter interaction

**Goal:** Make the fan follower count feel alive by surfacing personal fan interactions as career events once the player's following grows. Responding to fans affects morale and reputation.

**Files to read first:**
- `utils/careerEventUtils.ts` — full file (event generation patterns)
- `utils/mediaUtils.ts` — fan milestones, mediaReputation
- `types.ts` — `CareerEvent`, `MediaReputation`, `FanMilestone`
- `constants.ts` — existing CareerEvent templates

**What to build:**

1. Add 6 new `CareerEvent` templates to `constants.ts` in the fan mail category. Each should have `type: 'FAN_MAIL'` (add this to the event type union in `types.ts` if not already present). Templates:
   - **Young Supporter** — a junior player asks for career advice. Choices: MENTOR (morale +5, reputation +3) / BRUSH_OFF (no effect)
   - **Superfan Obsession** — an overly devoted fan. Choices: ACKNOWLEDGE (+fans, –privacy concern) / SET_LIMITS (media –2, morale +3)
   - **Critical Doubter** — a fan publicly doubts your ability. Choices: PROVE_WRONG (bonus match motivation) / IGNORE (no effect)
   - **Charity Request** — fan asks you to support a local cause. Choices: DONATE (wallet –500, reputation +10) / DECLINE (no change)
   - **Kids' Hospital Visit** — community request. Choices: ATTEND (morale +8, fans +500) / SKIP (reputation –5)
   - **Fan Tribute Video** — supporters made a highlights video. Choices: SHARE_IT (+socialMediaPosts, fans +200) / PRIVATE_MOMENT (morale +5)

2. In `utils/careerEventUtils.ts`, add a `generateFanMailEvent()` function that selects a random fan mail template. This event should only generate when `player.mediaReputation.fanFollowers >= 5000`.

3. Call `generateFanMailEvent()` in `GameContext.tsx` once per season (at season start or a defined round trigger), adding the result to `player.activeCareerEvents` if no fan mail event is already active.

4. Display fan mail events in `components/CareerEvents.tsx` using existing event card UI — fan mail events should have a distinctive icon/colour (use a warm amber tone) to differentiate from standard career events.

**Constraints:**
- Fan mail events use the existing `CareerEvent` and choice resolution system — no new state fields required
- Maximum one active fan mail event at a time to avoid flooding
- Works cleanly with the existing `resolveEventChoice(eventId, choiceId)` function

---

## Feature 2 — Club culture & fan base personality

**Goal:** Give each AFL club a culture archetype that affects media event frequency, crowd atmosphere in matches, and fan tolerance for losses.

**Files to read first:**
- `types.ts` — `Team` interface
- `constants.ts` — team definitions, TEAM_NAMES_AFL
- `utils/mediaUtils.ts` — media event generation
- `utils/simulationUtils.ts` — match events (crowd noise)

**What to build:**

1. Add a `CultureType` to `types.ts`:
   ```typescript
   export type CultureType =
     'PREMIERSHIP_HUNGRY' | 'REBUILDING' | 'STORIED_CLUB' | 'UNDERDOG' | 'BIG_CITY';
   ```

2. Add `culture?: CultureType` to the `Team` interface in `types.ts`.

3. In `constants.ts`, assign a culture to each AFL team in the team definitions (or generate one procedurally in `leagueUtils.ts` if teams are generated dynamically). Suggested assignments:
   - Collingwood, Richmond, Hawthorn → STORIED_CLUB
   - GWS, Gold Coast, Brisbane Lions → REBUILDING
   - Melbourne, Geelong, West Coast → PREMIERSHIP_HUNGRY
   - North Melbourne, St Kilda → UNDERDOG
   - Sydney, Carlton, Essendon → BIG_CITY

4. Apply culture effects in the relevant utils:
   - **STORIED_CLUB**: media events more frequent (+20% chance per round), higher fan sensitivity to losses (–10% reputation on loss)
   - **REBUILDING**: transfer offers more likely from rival clubs, media pressure lower, fan tolerance higher
   - **PREMIERSHIP_HUNGRY**: coaching events more intense, motivation boost from coaches stronger (+5%)
   - **UNDERDOG**: win events generate +50% more fan followers, morale bonus on upsets
   - **BIG_CITY**: social media events more frequent, higher baseline fan followers (+2000 at contract start)

5. In `simulationUtils.ts`, use the player's current club culture to add flavour to crowd-noise GENERIC match events — e.g. STORIED_CLUB clubs reference "the faithful" in crowd phrases; UNDERDOG clubs reference "the believers".

**Constraints:**
- `culture` is optional on `Team` — defaults to no modifier if absent (backward compatible)
- Culture effects are passive modifiers, not hard gates on features

---

## Feature 3 — Rivalry system expansion

**Goal:** Give rivalries a lifecycle — they escalate, resolve, and trigger reactive events when rivals are faced on the field.

**Files to read first:**
- `types.ts` — `Rivalry` interface, `PlayerProfile.rivalries`
- `utils/simulationUtils.ts` — rivalry event handling in match sim
- `utils/careerEventUtils.ts` — event generation patterns
- `constants.ts` — existing rivalry-related content

**What to build:**

1. Extend the `Rivalry` interface in `types.ts`:
   ```typescript
   export interface Rivalry {
     opponentName: string;
     club: string;
     reason: string;
     intensity: 'Low' | 'Medium' | 'High' | 'Heated';
     history?: RivalryEvent[];
     headToHead?: { wins: number; losses: number };
     resolved?: boolean;
   }

   export interface RivalryEvent {
     round: number;
     year: number;
     description: string;
     intensityChange: number; // positive = escalated, negative = cooled
   }
   ```

2. In `simulationUtils.ts`, when a rivalry match event fires (type `'RIVALRY'`), add a post-event rivalry update:
   - If the player won the one-on-one: record win in `headToHead`, small intensity escalation
   - If the player lost: record loss, larger intensity escalation
   - Add the event to `rivalry.history[]`

3. Add head-to-head stat tracking in `commitMatchResult()` in `GameContext.tsx` — after each match, check if the opposing club has a rivalry entry and update `headToHead`.

4. Add 3 new rivalry career event templates to `constants.ts`:
   - **Pre-Match Trash Talk** — rival quoted in media before facing each other. CLAP_BACK (morale +5, intensity +1) / STAY_FOCUSED (no change)
   - **Post-Match Handshake** — after beating your rival. RESPECT (intensity –1, sportsmanship +media) / GLOAT (fans +200, intensity escalates to max)
   - **Rivalry Resolved** — after 5 wins vs the rival. BURY_THE_HATCHET (marks rivalry as resolved, +achievement unlock) / KEEP_THE_FIRE (morale permanent +2)

5. In `PlayerStats.tsx` or a new tab in `LeagueView.tsx`, show a "Rivalries" card listing active rivalries with head-to-head record and intensity badge.

**Constraints:**
- New fields on `Rivalry` are all optional — existing saves with `{ opponentName, club, reason, intensity }` remain valid
- Maximum 3 active (non-resolved) rivalries at any time — same as current design
