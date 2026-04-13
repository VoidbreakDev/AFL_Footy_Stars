# AFL Footy Stars — Progression Feature Prompts

> **Sub-agent instructions:** You are working on the AFL Footy Stars codebase. Before making any changes, read `CLAUDE.md` for full architecture context, then read the specific files listed under each feature. Implement features in order. Preserve all existing TypeScript types — do not remove any fields from `PlayerProfile`. Confirm zero TypeScript errors via `npm run build` before finishing.

---

## Feature 1 — Legacy score & career arc

**Goal:** Add a single "Legacy Score" metric calculated from awards, premierships, milestones, and seasons played. Display it on the career timeline and unlock post-career roles at retirement.

**Files to read first:**
- `types.ts` — `PlayerProfile`, `SeasonHistory`, `Award`
- `utils/seasonUtils.ts` — end-of-season processing
- `components/CareerSummary.tsx` — full file
- `constants.ts` — award types, milestones

**What to build:**

1. Add `legacyScore?: number` to `PlayerProfile` in `types.ts`.

2. Create `utils/legacyUtils.ts` with a `calculateLegacyScore(player: PlayerProfile): number` function. Score formula (total out of ~1000):
   - Premierships: 150 pts each
   - Brownlow Medal: 100 pts each
   - Coleman Medal: 80 pts each
   - All-Australian: 50 pts each
   - Club Best & Fairest: 30 pts each
   - Other awards (Rising Star, Mark of Year, etc.): 20 pts each
   - Career matches played: 1 pt each (cap at 300)
   - Career goals: 0.5 pts each (cap at 200)
   - Milestones achieved: 10 pts each
   - Seasons in AFL tier: 20 pts each

3. Call `calculateLegacyScore()` at end of each season in `seasonUtils.ts` and persist the result to `player.legacyScore`.

4. Update `CareerSummary.tsx` to display:
   - A prominent Legacy Score with a tier label:
     - 0–99: "Local Hero"
     - 100–299: "Club Legend"
     - 300–499: "State Great"
     - 500–699: "AFL Star"
     - 700–899: "Superstar"
     - 900+: "All-Time Legend"
   - A visual breakdown bar showing which categories contributed most
   - A career timeline showing season-by-season history from `player.careerHistory`

5. At retirement (age 35 or manual retire), if legacyScore >= 300, unlock a post-career path selection modal with three options:
   - **Media Pundit** — boosts `mediaReputation.score` by 20, adds a fan milestone
   - **Club Ambassador** — adds 50 legacy points, unlocks an achievement
   - **Coaching Path** — adds a "Former Player" bonus note to career summary (placeholder for a future coaching mode)

**Constraints:**
- `legacyScore` is optional — existing saves without it default to 0 (recalculated on first load)
- Post-career modal is shown only once at retirement, not on every load

---

## Feature 2 — Captaincy & leadership system

**Goal:** Let players earn club captaincy through high team chemistry, loyalty, and seasons served. Captains gain morale bonuses and a once-per-season ability.

**Files to read first:**
- `types.ts` — `PlayerProfile`, `TeamChemistry`, `TeammateRelationship`
- `utils/chemistryUtils.ts` — full file
- `context/GameContext.tsx` — season start/end logic
- `components/ClubHub.tsx` — club information display

**What to build:**

1. Add `isCaptain?: boolean` and `captaincyYear?: number` to `PlayerProfile` in `types.ts`.

2. Add captaincy eligibility check in `GameContext.tsx` at the start of each new season:
   - Eligible if: seasonsPlayed >= 3 at current club AND teamChemistry.state is 'HOT' or 'WARM' AND player is NOT already captain
   - If eligible, generate a career event (using the existing `CareerEvent` system) titled "Club Captain Offer" with ACCEPT/DECLINE choices
   - On ACCEPT: set `player.isCaptain = true`, `player.captaincyYear = currentYear`, +10 morale, +5 mediaReputation

3. Captain passive benefits (apply each round in `GameContext.tsx`):
   - Team morale gets +2 each round while player is captain
   - Brownlow vote probability slightly increased (+5% weight)

4. Add a "Captain's Speech" ability — once per season the player can trigger it from `ClubHub.tsx`:
   - Sets all teammates with relationship STRANGER or below to ACQUAINTANCE
   - Gives +15 morale for 3 rounds (store as `motivationBoost` / `motivationExpiry` — these fields already exist)
   - Button is disabled after use and resets at season start

5. Display the captaincy status in `ClubHub.tsx` — show a captain badge next to the player's name, and the "Captain's Speech" button with remaining uses.

6. Captaincy can be lost if chemistry drops to FREEZING or COLD for 3 consecutive rounds — add a tracking counter `lowChemistryStreak?: number` to `PlayerProfile`.

**Constraints:**
- `isCaptain`, `captaincyYear`, `lowChemistryStreak` are all optional fields — backward compatible
- Captain status resets if the player transfers to a new club

---

## Feature 3 — Player retirement planning & post-career

**Goal:** Replace the abrupt age-35 cutoff with a graceful retirement arc: a decision phase in the final 1–2 seasons, a farewell game, and a post-career path selection.

**Files to read first:**
- `context/GameContext.tsx` — age progression, retirement logic
- `components/CareerSummary.tsx` — retirement screen
- `types.ts` — `PlayerProfile`, `SeasonHistory`
- `utils/seasonUtils.ts` — season wrap-up

**What to build:**

1. Add `retirementDecisionMade?: boolean` and `farewell?: boolean` to `PlayerProfile` in `types.ts`.

2. At season end when `player.age >= 33`, trigger a "Retirement Decision" career event (using the existing `CareerEvent` system) if `retirementDecisionMade` is not true:
   - Show the player their current stats, legacy score, and attribute decline warning
   - Options: **Retire This Season** / **Play One More Year** / **Keep Going**
   - On "Retire This Season": set `player.isRetired = true` after the season ends
   - On "Play One More Year": set a flag that auto-retires them next season
   - Hard retire still triggers at age 35 regardless

3. If the player chose to retire this season, flag the final match of the season as `player.farewell = true`. In `MatchSim.tsx`, detect this flag and:
   - Add a pre-match banner: "Farewell Game — [Player Name]'s Last Match"
   - After the match, display a special "Final Whistle" card with a career snapshot

4. Extend `CareerSummary.tsx` to show the post-career path selection (from the Legacy Score feature) and a "Legacy Wall" — a stylised card showing: best season, career highlight stat, most memorable award.

**Constraints:**
- Hard age-35 retirement cap remains — this feature adds ceremony, not a bypass
- New fields are all optional — fully backward compatible

---

## Feature 4 — Attribute decline with age

**Goal:** After age 30, speed and stamina slowly decline each season unless offset by shop items or a fitness trainer. Kicking and marking can improve with age.

**Files to read first:**
- `utils/seasonUtils.ts` — end-of-season processing
- `types.ts` — `PlayerAttributes`, `PlayerProfile`
- `constants.ts` — `RETIREMENT_AGE`, attribute caps
- `components/Training.tsx` — to inform how attribute changes are displayed

**What to build:**

1. In `utils/seasonUtils.ts`, add an `applyAgingEffects(player: PlayerProfile): PlayerProfile` function called at end of each season:

   - If `player.age >= 30`:
     - Speed: –1 per season after 30 (–2 after 33)
     - Stamina: –1 per season after 30 (–2 after 33)
     - Kicking: +0.5 (rounded, veterans improve their craft)
     - Marking: +0.5 (rounded)
     - Minimum attribute value: 20 (no stat goes to zero)

   - If the player has a FITNESS_TRAINER in `coachingStaff`:
     - Speed and Stamina decline is halved

   - If the player owns a relevant shop item (e.g. "Recovery Protocol" — check `player.itemsPurchased`):
     - Stamina decline is negated for that season

2. Call `applyAgingEffects()` during end-of-season processing in `seasonUtils.ts` (after stats are locked for the season record).

3. In `Training.tsx`, when `player.age >= 30`, show a subtle "Veteran" indicator near Speed and Stamina with a tooltip: "Declining with age — consider investing in recovery."

4. Add a `VETERAN_BOOST` shop item to `constants.ts` (under RECOVERY category):
   - Name: "Peak Conditioning Programme"
   - Effect: negates all attribute decline for one full season
   - Price: 8000 wallet
   - One-time use per season (not one-time per career)

**Constraints:**
- Attribute minimums must be respected (never go below 20)
- Decline only begins at age 30 — players under 30 are unaffected
- Changes are applied once per season end, not per round
