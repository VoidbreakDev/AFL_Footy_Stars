# AGENTS.md — AFL Footy Stars

> **Purpose:** This is the definitive reference for AI coding agents working on this codebase. Read this entire file before touching anything. It supersedes `CLAUDE.md` wherever they conflict — this file reflects the actual current state of the code.

> **Skills:** Workflow skills are auto-discovered from `.vibe/skills/`. Key skills:
> - Fixing a bug → `systematic-debugging` then `bug-fix`
> - Planning a new feature → `brainstorming` then `writing-plans`
> - Implementing from a plan → `new-feature` + `typescript-react-patterns`
> - Validating before handoff → `testing`
> - Reviewing code quality → `code-review`
>
> **Docs:** Design specs live in `docs/superpowers/specs/`. Implementation plans live in `docs/superpowers/plans/`.

---

## 1. Project snapshot

| Field | Value |
|-------|-------|
| Name | AFL Footy Stars |
| Version | **1.1.0.0** |
| Type | React SPA — no router, no backend, no auth |
| Runtime | Browser only — Vite dev server on `localhost:3000` |
| Persistence | `localStorage` only |
| Save key format | `footyLegendSave_slot{N}` (slots 0–2); legacy key `footyLegendSave` auto-migrates |
| Entry point | `index.tsx` → `App.tsx` → `GameProvider` → view switch |
| Build tool | Vite 6.2 |
| Language | TypeScript 5.8 (non-strict, isolated modules) |
| Styling | Tailwind CSS — utility classes only, no CSS modules |
| State | Single React Context in `context/GameContext.tsx` (~2200 lines) |
| External APIs | Google Gemini (`@google/genai` v1.30) — optional; DiceBear avatar SVGs |

---

## 2. How to run

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # → /dist (confirm zero TS errors here)
npm run preview    # preview production build
```

**Environment variables** (game works without them):
```
GEMINI_API_KEY=your_key_here
```
Vite exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` (both defined in `vite.config.ts`). `geminiService.ts` checks both.

**Path alias:** `@/` → project root. Use it for all cross-directory imports:
```typescript
import { useGameContext } from '@/context/GameContext';
```

---

## 3. Top-level file map

```
AFL_Footy_Stars/
├── App.tsx                  # Root — renders GameProvider + view switch
├── index.tsx                # ReactDOM.createRoot mount point
├── index.html               # HTML shell
├── types.ts                 # ALL interfaces & enums (~700 lines) ← read first
├── constants.ts             # ALL game data & config (~1723 lines) ← read second
├── vite.config.ts           # Port 3000, host 0.0.0.0, @/ alias, env injection
├── context/
│   └── GameContext.tsx      # Single source of all game state & actions (~2200 lines)
├── components/              # 37 React UI components (see Section 10)
├── utils/                   # 19 pure business-logic files (see Section 7)
├── services/
│   └── geminiService.ts     # Gemini AI commentary wrapper
└── _prompts/                # Sub-agent feature prompts (v1.1 roadmap)
```

---

## 4. View routing

No React Router. Navigation is a `view` string in `GameContext`:

```typescript
type View =
  'SLOT_SELECT' | 'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' |
  'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' |
  'MILESTONES' | 'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' |
  'CAREER_SUMMARY' | 'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' |
  'COACHING_STAFF' | 'MASTER_SKILLS'
```

`App.tsx` renders the matching component. To navigate: `setView('TRAINING')`.

**App starts at `'SLOT_SELECT'`** — never `'ONBOARDING'` or `'DASHBOARD'` directly. `loadGame()` redirects retired players to `'CAREER_SUMMARY'` automatically.

**Modal overlays** — boolean flags in GameContext, render on top of the current view:

| Flag | Component | Triggered by |
|------|-----------|-------------|
| `showFinalsIntro` | `FinalsIntro.tsx` | `currentRound === SEASON_LENGTH` in `advanceRound` |
| `showSemiFinalsResults` | `SemiFinalsResults.tsx` | `currentRound === SEASON_LENGTH + 1` |
| `showGrandFinalResult` | `GrandFinalResult.tsx` | `currentRound === SEASON_LENGTH + 2` |
| `showSeasonRecap` | `SeasonRecap.tsx` | `seasonEnded === true` in `advanceRound` |
| `showAwardsCeremony` | `AwardsCeremony.tsx` | After season recap dismissal |

Finals rounds are `SEASON_LENGTH + 1` (semis) and `SEASON_LENGTH + 2` (GF) — the season is logically 16 rounds long including finals even though `SEASON_LENGTH = 14`.

---

## 5. Save system

```typescript
// In GameContext.tsx
const SAVE_KEY = (slot: number) => `footyLegendSave_slot${slot}`;
const LEGACY_SAVE_KEY = 'footyLegendSave';
```

**Save payload:**
```typescript
{ player: PlayerProfile, league: Team[], fixtures: Fixture[], currentRound: number }
```

`lastMatchResult` is also saved (see GameContext `useEffect` auto-save).

**Migration:** `loadGame()` contains 8 explicit migration blocks that patch old saves missing newer fields. When adding new `PlayerProfile` fields, **add a migration block in `loadGame()`** — do not assume saves will have your new field:

```typescript
// Pattern used in loadGame():
if (data.player.newField === undefined) {
    data.player.newField = defaultValue;
}
```

Existing migration blocks cover: `energy`, `wallet`, `lifetimeEarnings`, `itemsPurchased`, `currentYear`, `seasonsPlayed`, `careerHistory`, `mediaReputation`, `teammates`/`teamChemistry`, `coachingStaff`, `activeCareerEvents`/`careerEventHistory`.

**Inspect in devtools:** `JSON.parse(localStorage.getItem('footyLegendSave_slot0'))`

---

## 6. PlayerProfile — complete field reference

Central data object. Every system hangs off it. **Never remove a field. Only add optional ones. Always add a migration block in `loadGame()`.**

```typescript
// Core identity
name, gender, avatar, position, subPosition, age, potential
bio?: string          // Legacy static bio string
biography?: string[]  // v1.3 dynamic bio — array of season paragraphs
                      // Display code must check both: use biography[] if present,
                      // fall back to [bio] for old saves

// Personality — affects match sim, career events
personality?: 'PROFESSIONAL' | 'FLAIR' | 'WARRIOR' | 'LEADER' | 'ENIGMA'

// Attributes (all 0–99, hard cap: player.potential)
attributes: { kicking, handball, tackling, marking, speed, stamina, goalSense }

// Status
xp, level, skillPoints
energy: number        // 0–100
morale: number        // 0–100
injury: PlayerInjury | null  // { name, weeksRemaining, rehabChoice?: 'REST'|'LIGHT'|'PUSH' }

// Stats
careerStats: PlayerStats   // lifetime totals (never reset)
seasonStats: PlayerStats   // reset to zero at season start

// Extended stats (all optional — backward compat)
// In PlayerStats: kicks?, handballs?, marks?, inside50s?, clearances?,
// hitOuts?, brownlowVotes1/2/3?, effectiveDisposals?, contendedPossessions?

// Milestones & achievements
milestones: Milestone[]
achievements?: UnlockedAchievement[]

// Achievement tracking counters
totalSkillPointsEarned?, trainingSessions?, winStreak?, injuryFreeStreak?
highMoraleStreak?, voteStreak?, clubsPlayed?: string[]

// Personalisation
nickname?, jerseyNumber?
dailyRewards?: DailyReward
seenTips?: Record<string, boolean>  // keyed by view name — controls TipCard visibility

// Contract & economy
contract: Contract     // salary, yearsLeft, clubName, tier, role?,
                       // performanceBonus?, playerOption?, teamOption?,
                       // noTradeClause?, signingBonus?
wallet?, lifetimeEarnings?, itemsPurchased?: string[]
transferOffers?: TransferOffer[]

// Multi-season
currentYear?, seasonsPlayed?
careerHistory?: SeasonHistory[]

// Media & reputation
mediaReputation?: MediaReputation  // score(0–100), tier, fanFollowers, events[]

// Career events
activeCareerEvents?: CareerEvent[]
careerEventHistory?: CareerEventHistory[]

// Chemistry & coaching
teammates?: TeammateRelationship[]
teamChemistry?: TeamChemistry
chemistryEvents?: ChemistryEvent[]
coachingStaff?: CoachingStaff
coachingEvents?: CoachingEvent[]
motivationBoost?: number   // % performance boost
motivationExpiry?: number  // round when boost expires

// Master skills
masterSkills?: UnlockedMasterSkill[]

// UX
seenTips?: Record<string, boolean>

// Objectives & predictions
seasonObjectives?: SeasonObjective[]
matchPrediction?: MatchPrediction  // cleared to undefined each advanceRound()

// Pre-season camp
preSeasonCamp?: PreSeasonCamp

// Team selection drama
droppedToReserves?: boolean
selectionDrama?: { round, reason, response: null | 'TRAIN_HARDER'|'CONFRONT_COACH'|'MEDIA_BLITZ', resolved }

// Representative football
representativeHonours?: { team, round, year, disposals, goals, xpEarned }[]
selectedForRep?: boolean  // set true at round 7 if avg disposals >= 18 or goals >= 15

// Training periodization
trainingFocus?: { day, focus, completed }[]
weeklyTrainingBonus?: number

// Progression (v1.1+)
legacyScore?: number           // recalculated every advanceRound via calculateLegacyScore()
postCareerPath?: 'MEDIA' | 'AMBASSADOR' | 'COACHING'
retirementDecisionMade?: boolean
retireAtSeasonEnd?: boolean    // UNTYPED — set as (extra as any).retireAtSeasonEnd in GameContext
                               // Controls whether farewell flag fires at SEASON_LENGTH
farewell?: boolean
isCaptain?: boolean
captaincyYear?: number
captainSpeechUsed?: boolean    // reset to false each season start in advanceRound
lowChemistryStreak?: number    // captain loses role after 3 consecutive COLD/FREEZING rounds
leagueGender?: 'MENS' | 'WOMENS'

// Story arc system (v1.3)
activeStoryArcs?: StoryArc[]
completedStoryArcs?: StoryArc[]
narrativeTags?: string[]  // accumulates choice.narrativeTag values; influences future arc/event generation

// Media conference system (v1.3)
pendingMediaConference?: MediaConference  // cleared to undefined after all questions answered
mediaConferenceHistory?: MediaConference[]
```

---

## 7. All systems & their utils

### 7.1 Match simulation — `utils/simulationUtils.ts`
- `calculateMatchOutcome(homeTeam, awayTeam, player, currentRound, tactic?)` → `MatchResult`
- `simulateCPUMatch(homeTeam, awayTeam)` → lightweight `MatchResult` (no player stats)

`MatchResult` fields: `homeScore`, `awayScore`, `winnerId`, `playerStats` (with extended stats + `performanceGrade`), `timeline: MatchEvent[]`, `highlights?: MatchEvent[]` (top 5, selected in `commitMatchResult`), `energyUsed?: number`, `tactic?: Tactic`, `topPerformers`, `achievedMilestones`, `newRivalry?`, `playerInjury?`, `summary`.

**`generateMatchSimulation()` is a pure call** — it does not commit any state. It is safe to call multiple times for preview. Only `commitMatchResult()` writes to state.

`MatchEvent.type` union: `GOAL | BEHIND | MARK | TACKLE | INJURY | GENERIC | RIVALRY | POSSESSION | TURNOVER | FREE_KICK | ONE_ON_ONE | ONE_ON_ONE_DEFENSIVE | HIT_OUT | INTERCEPT`

`Tactic` type: `'ATTACK' | 'BALANCED' | 'DEFENSIVE' | 'PRESS'` — default is `'BALANCED'`.

### 7.2 League & fixtures — `utils/leagueUtils.ts`
- `generateLeague(tier, gender?)` → `Team[]` (8 teams; uses `_W` name arrays when gender is `'WOMENS'`)
- `generateFixtures(teams)` → `Fixture[]` (14-round round-robin)
- `updateLadderTeam(team, result, isHome, matchType?)` → `Team` (skips ladder points for finals)
- `generateSemiFinals(league, fixtures)` → semi-final `Fixture[]`
- `generateGrandFinal(fixtures)` → Grand Final `Fixture`

### 7.3 Season progression — `utils/seasonUtils.ts`
- `shouldPromote(ladderPosition, tier, playerRating)` → `boolean`
- `shouldRelegate(ladderPosition, tier, playerRating)` → `boolean`
- `getPromotedTier(tier)` / `getRelegatedTier(tier)` → `LeagueTier`
- `createSeasonHistory(player, team, promoted, relegated, grandFinalWon)` → `SeasonHistory`
- `generateNewSeasonSalary(currentSalary, newTier, playerRating, promoted)` → `number`
- `applyAgingEffects(player)` → `PlayerProfile` — Speed/Stamina –1/season after 30, –2 after 33; halved with FITNESS_TRAINER; Kicking/Marking +0.5 rounded; minimum 20

### 7.4 Career events — `utils/careerEventUtils.ts`
Event types: `PERSONAL | PROFESSIONAL | RIVALRY | TEAMMATE | INJURY | FINANCIAL | OPPORTUNITY | CRISIS | FAN_MAIL | RIVALRY_EVENT | COMMUNITY | LOCKER_ROOM | LEGACY_MOMENT | MEDIA_CONFERENCE | STORYLINE`

Key functions:
- `generateCareerEvent(player, round, year)` → `CareerEvent | null`
- `generateFanMailEvent(player)` → fan event (only when `fanFollowers >= 5000`)
- `generateCommunityEvent(player, round, year)` → `CareerEvent | null`
- `generateLockerRoomEvent(player, round, year, teammates)` → `CareerEvent | null`
- `generateLegacyMoment(player, round, year)` → `CareerEvent | null`
- `generateFanMail(player, round, year)` → `CareerEvent | null`
- `generateSeasonBioParagraph(player, seasonHistory, year)` → `string` — appended to `player.biography[]`
- `resolveCareerEvent(player, event)` → `{ updatedPlayer, history }`
- `resolveCareerEventChoice(player, event, choiceId)` → `{ updatedPlayer, updatedEvent, history }`

**In GameContext**, two special events are handled inline before hitting `resolveCareerEventChoice`:
- Events with id starting `'captain-offer'` → sets `isCaptain`, `captaincyYear` on ACCEPT
- Events with id starting `'retirement-decision'` → sets `retireAtSeasonEnd` (untyped) or clears `retirementDecisionMade`

⚠️ **Duplicate fan mail generation:** `generateFanMailEvent` is called in **two separate `setPlayer` blocks** inside `advanceRound` — once in the main season-end block and once in the story arc block. This can generate two fan mail events in the same round. Do not add a third call.

### 7.5 Story arc system — `utils/storyArcUtils.ts` (v1.3)
Multi-act narrative arcs spanning multiple rounds.

Arc types: `CONTRACT_SAGA | RIVALRY_ESCALATION | CAPTAINCY_JOURNEY | REDEMPTION_ARC | MEDIA_FIRESTORM | MENTOR_RELATIONSHIP | SLUMP_AND_RETURN | TRADE_SPECULATION | LEGACY_CHASE | FAREWELL_SEASON`

Acts: `SETUP → ESCALATION → RESOLUTION → EPILOGUE`

- `generateStoryArcs(player, round, year?)` → `StoryArc[]` — called at game start AND at round 7
- `advanceStoryArc(arc, player, round)` → `StoryArc`
- `resolveStoryArcChoice(arc, eventId, choiceId, player)` → `{ updatedArc, effects: CareerEventEffect }`
- `checkArcCompletion(arc, player)` → `boolean`
- `finalizeArc(arc)` → `StoryArc` with `legacyImpact` applied
- `getArcLegacyImpact(arc)` → `number`

Arc resolution in GameContext (`resolveStoryArcAction`): applies effects → appends `choice.narrativeTag` to `player.narrativeTags[]` → moves completed arcs to `completedStoryArcs[]` → adds `legacyImpact` to `player.legacyScore`.

`player.narrativeTags[]` is the persistent choice history. It influences which arcs and events are generated — agents writing event/arc generators should check this array.

### 7.6 Media & reputation — `utils/mediaUtils.ts`
- `initializeMediaReputation()` → default `MediaReputation`
- `generateMediaEvent(player, round, year)` → `MediaEvent | null`
- `generateMediaConference(type, player, round, year)` → `MediaConference`
- `applyConferenceResponses(conference, player)` → `{ reputationChange, fanChange }`
- `respondToMediaEvent(event, 'HUMBLE'|'CONFIDENT'|'IGNORE')` → updated `MediaEvent`
- `updateMediaReputation(rep, event)` → `MediaReputation`
- `createSocialMediaPost(player, content, round, year)` → updated media object
- `calculatePassiveFanGrowth(player)` → `number`

**Media conference trigger logic** (in `advanceRound`):
- `mediaRep.score < 30` → generates `CONTROVERSY_RESPONSE` conference
- `mediaRep.score > 70 && nextRound % 4 === 0` → generates `MID_SEASON_CHECK` conference
- Only one `pendingMediaConference` at a time (checked before generating)
- Conference is cleared from `player.pendingMediaConference` to `undefined` once all questions are answered

Conference question tones: `HOSTILE | NEUTRAL | FRIENDLY | PROBING`
Response tones: `CONFIDENT | HUMBLE | DEFLECT | CONTROVERSIAL | DIPLOMATIC`

### 7.7 Team chemistry — `utils/chemistryUtils.ts`
- `initializeTeamChemistry(team)` → `{ teammates: TeammateRelationship[], teamChemistry: TeamChemistry }`
- `calculateOverallChemistry(teammates)` → `number`
- `updateTeamChemistryAfterMatch(chemistry, won, playerMatchRating)` → `TeamChemistry`
- `generateTeammateInteraction(teammate, matchRating, won, round, year)` → interaction or null
- `updateTeammateRelationship(teammate, interaction)` → `TeammateRelationship`
- `calculateChemistryBonus(chemistry)` → `number` (% modifier –20% to +20%)

Relationship statuses: `ENEMY → RIVAL → STRANGER → ACQUAINTANCE → FRIEND → CLOSE_FRIEND → BEST_MATE`
Chemistry state field: **`teamChemistry.recentForm`** (`FREEZING | COLD | NEUTRAL | WARM | HOT`)

⚠️ **Known bug:** The captaincy eligibility check in `advanceRound` reads `prev.teamChemistry?.state` but the `TeamChemistry` interface uses the field name `recentForm`, not `state`. This check always evaluates falsy. Do not propagate this pattern — use `recentForm`.

### 7.8 Coaching staff — `utils/coachingUtils.ts`
- `initializeCoachingStaff(tier)` → `CoachingStaff`
- `generateCoachInteraction(coach, matchRating, won, round, year)` → `CoachingEvent | null`
- `updateCoachRelationship(coach, interaction)` → `Coach`
- `hireStaff(coachingStaff, staffMember, contractType)` → `CoachingStaff`
- `processStaffContracts(coachingStaff, round)` → `CoachingStaff` (expires temporary contracts)

Coach personalities: `DISCIPLINARIAN | MENTOR | TACTICIAN | MOTIVATOR | INNOVATOR | VETERAN`
Staff roles: `FITNESS_TRAINER | PHYSIO | NUTRITIONIST | MENTAL_COACH | SKILLS_COACH`

⚠️ **Known bug / interface mismatch:** `CoachingStaff` interface defines `fitnessStaff[]` and `medicalStaff[]`, but GameContext rehab logic accesses `coachingStaff?.staffMembers?.some(s => s.role === 'PHYSIO')`. The field `staffMembers` does not exist on the typed interface. The physio rehab bonus never actually fires. When fixing, use `coachingStaff.medicalStaff` and check `s.role === 'PHYSIO'`.

Staff contract types: `PERMANENT` (season cost) or `TEMPORARY` (`weeklyCost`, expires at `contractExpiry` round).

Staff effects on gameplay:
- **PHYSIO:** should reduce rehab risk (blocked by above bug)
- **FITNESS_TRAINER:** halves Speed/Stamina age decline in `applyAgingEffects()`
- **TACTICIAN coach:** intended to unlock PRESS tactic (not yet wired in `MatchSim.tsx`)

### 7.9 Transfer market — `utils/transferUtils.ts`
- `generateTransferOffers(player, round, league, season)` → `TransferOffer[]`
- `shouldGenerateOffers(player, round)` → `boolean`
- `clearExpiredOffers(offers, round)` → `TransferOffer[]`
- `acceptTransferOffer(player, offer)` → `PlayerProfile`
- `isFreeAgencyPeriod(round, seasonLength?)` → `boolean` (rounds 12–14)
- `generateFreeAgencyOffers(player, round, league)` → `TransferOffer[]`

`TransferOffer` extra fields (v1.1+): `isFreeAgency?, performanceBonus?, signingBonus?, playerOption?, teamOption?`

### 7.10 Draft system — `utils/draftUtils.ts`
- `createDraftClass(year, tier)` → `DraftClass`
- `generateDraftClassWithPlayer(year, player, league)` → `DraftClass` (includes user as a prospect; takes the AFL league `Team[]` for correct team names)
- `shouldHoldDraft(tier)` → `boolean`
- `simulateDraftPick(draftClass, pickNumber, teams)` → `DraftClass`
- `isPlayerDraftEligible(player)` → `boolean`
- `wasPlayerDrafted(player)` → `boolean`

Draft is triggered at season end in `advanceRound` when `shouldHoldDraft(prev.contract.tier) && isPlayerDraftEligible(prev)`. An AFL-tier league is generated specifically to provide correct AFL team names to the draft class.

### 7.11 Awards — `utils/awardUtils.ts`
- `calculateSeasonAwards(player, league, year)` → `Award[]`

Award types: `BROWNLOW_MEDAL | COLEMAN_MEDAL | ALL_AUSTRALIAN | CLUB_BEST_FAIREST | RISING_STAR | LEADING_DISPOSAL | LEADING_TACKLER | MARK_OF_YEAR | GOAL_OF_YEAR`

AFLW equivalents apply when `player.leagueGender === 'WOMENS'`.

### 7.12 Achievements — `utils/achievementUtils.ts`
- `checkAchievements(player, matchResult?)` → `UnlockedAchievement[]`

70+ achievements in `constants.ts` as `ACHIEVEMENTS: Achievement[]`. Categories: `CAREER | MATCH | SKILL | SPECIAL | LEGEND`. Rarities: `COMMON | RARE | EPIC | LEGENDARY`.

### 7.13 Master skill tree — `utils/masterSkillUtils.ts`
30+ skills. Each requires `prerequisiteLevel` (attribute min), `xpCost` (2500–12000), `spCost` (10–30). Effect types: `MATCH_BONUS | HIGHLIGHT_UNLOCK | ATTRIBUTE_MULTIPLIER`.

### 7.14 Season objectives — `utils/objectiveUtils.ts`
- `generateSeasonObjectives(player, year)` → `SeasonObjective[]`
- `generateWeeklyObjectives(player, round)` → `SeasonObjective[]`
- `updateObjectiveProgress(player, matchResult)` → `PlayerProfile`
- `applyObjectiveRewards(player, objectiveId)` → `PlayerProfile`
- `expireOldObjectives(player, round)` → `PlayerProfile`

Categories: `DISPOSALS | GOALS | TACKLES | MARKS | VOTES | WINS | MORALE | TRAINING`
Durations: `WEEKLY` (expires after 1 round) | `SEASON` (lasts full season)

### 7.15 Pre-season camp — `utils/preSeasonUtils.ts`
- `generatePreSeasonCamp(player)` → `PreSeasonCamp`
- `completePreSeasonTraining(player, camp)` → `PlayerProfile`
- `findTrainingPartner(player, teammates)` → `AIPlayer | null`
- `applyTrainingPartnership(player, partner)` → `PlayerProfile`

**Source of truth:** `GameContext.preSeasonCamp` local state (not `player.preSeasonCamp`). Camp is set via `startPreSeasonCamp()` and completed via `completePreSeasonCamp(focusAttr)`. Do not double-write to both locations.

### 7.16 Legacy score — `utils/legacyUtils.ts`
- `calculateLegacyScore(player)` → `number` (0–1000+)
- `getLegacyTier(score)` → `string` (Local Hero | Club Legend | State Great | AFL Star | Superstar | All-Time Legend)
- `getLegacyBreakdown(player)` → breakdown object by category

Recalculated on every `advanceRound()` call (second `setPlayer` block). Also incremented directly when story arcs complete (`getArcLegacyImpact`). Stored at `player.legacyScore`.

Score contributions: premierships 150, Brownlow 100, Coleman 80, All-Australian 50, Best & Fairest 30, other awards 20, matches 1 (cap 300), goals 0.5 (cap 200), milestones 10, AFL seasons 20.

### 7.17 Roster turnover — `utils/rosterUtils.ts`
- `processLeagueRosterTurnover(league, tier)` → `{ league: Team[], summary: string }`

Called at season end (same-tier path) to retire old AI players and generate new ones. The `summary` string is logged to console.

### 7.18 Daily rewards — `utils/dailyRewardUtils.ts`
- `canClaimDailyReward(dailyRewards)` → `boolean`
- `claimDailyReward(dailyRewards)` → `{ updatedRewards, reward: { skillPoints, energy } }`

14-day streak cycle. Stored at `player.dailyRewards: { lastClaimDate, streak, totalLogins }`.

### 7.19 Nicknames — `utils/nicknameUtils.ts`
- `shouldUpdateNickname(player, matchResult)` → `boolean`
- `generateNickname(player)` → `string`

70+ nicknames. Auto-fires after strong performances in `commitMatchResult`.

---

## 8. Constants reference — `constants.ts` (~1723 lines)

| Constant | Value / type |
|----------|-------------|
| `SEASON_LENGTH` | `14` |
| `STARTING_AGE` | `18` |
| `RETIREMENT_AGE` | `35` |
| `INITIAL_ATTRIBUTE_POINTS` | `15` |
| `MAX_ATTRIBUTE_LEVEL` | `99` |
| `TEAM_NAMES_LOCAL` | 8 men's local names |
| `TEAM_NAMES_STATE` | 8 men's state names |
| `TEAM_NAMES_AFL` | 8 AFL names (Collingwood, Carlton, etc.) |
| `TEAM_NAMES_LOCAL_W` | 8 women's local names |
| `TEAM_NAMES_STATE_W` | 8 women's state names |
| `TEAM_NAMES_AFLW` | 8 AFLW club names |
| `TEAM_LOGOS` | `Record<string, string>` — image path or emoji per team |
| `MILESTONES` | `{ MATCHES, GOALS, DISPOSALS, TACKLES }` threshold arrays |
| `ACHIEVEMENTS` | `Achievement[]` — 70+ entries |
| `SHOP_ITEMS` | `ShopItem[]` — 28+ entries |
| `STADIUM_TEMPLATES` | Capacity/type ranges per tier |
| `PRESET_AVATARS` | 12 DiceBear seed names |
| `getFaceUrl(faceId)` | Helper → DiceBear SVG URL |
| `FIRST_NAMES / LAST_NAMES` | Name pools for AI player generation |

---

## 9. GameContext — complete action reference

All consumed via `useGameContext()` (alias: `useGame()`).

| Action | Signature | Notes |
|--------|-----------|-------|
| `startNewGame` | `(profile) => void` | Generates league/fixtures, inits all systems, sets view to DASHBOARD |
| `generateMatchSimulation` | `(fixtureIndex, tactic?) => MatchResult` | **Pure — no state changes** |
| `commitMatchResult` | `(fixtureIndex, result) => void` | Persists result, updates ladder, simulates other round fixtures, runs all post-match systems |
| `trainAttribute` | `(attr) => void` | –1 SP, –10 energy, +1 attr (chance of +2 with coaching bonus) |
| `advanceRound` | `() => void` | Main round-tick; runs ALL between-round systems; ends with `setView('DASHBOARD')` |
| `simulateRound` | `() => void` | For injured players — sims all round fixtures without player involvement, then calls `advanceRound` logic |
| `setRehabChoice` | `(choice) => void` | Sets `player.injury.rehabChoice`; applied next `advanceRound` |
| `useCaptainSpeech` | `() => void` | Sets all STRANGER-or-below teammates to ACQUAINTANCE; +15 morale; sets `captainSpeechUsed = true` |
| `resolveEvent` | `(eventId) => void` | Resolves a non-choice career event via `resolveCareerEvent` |
| `resolveEventChoice` | `(eventId, choiceId) => void` | **choiceId required for CHOICE events**; handles captain-offer and retirement-decision inline before generic resolution |
| `resolveStoryArcAction` | `(arcId, eventId, choiceId) => void` | Resolves a v1.3 story arc choice; applies effects; appends narrativeTag; moves completed arcs |
| `respondToMedia` | `(eventId, type) => void` | `type`: `'HUMBLE'|'CONFIDENT'|'IGNORE'` |
| `createSocialPost` | `(content) => void` | Creates post, updates mediaReputation |
| `respondToMediaConference` | `(conferenceId, questionId, responseId) => void` | Accumulates responses; applies effects when all questions answered |
| `acceptTransfer` | `(offerId) => void` | Moves player to new club, generates new league |
| `rejectTransfer` | `(offerId) => void` | Removes offer from list |
| `purchaseItem` | `(itemId) => boolean` | Returns false if insufficient wallet or already purchased (one-time) |
| `hireCoachingStaff` | `(staffMember, contractType) => void` | Typed as `any` in context interface — needs proper typing |
| `draftProspect` | `(prospectId) => void` | User selects a draft prospect |
| `simulateDraft` | `() => void` | Sims all remaining picks |
| `completeDraft` | `() => void` | Finalises draft, transitions season |
| `startPreSeasonCamp` | `() => void` | Generates camp, finds training partner from teammates |
| `completePreSeasonCamp` | `(focusAttr) => void` | Applies camp bonuses to player |
| `retirePlayer` | `() => void` | Sets `isRetired = true`, navigates to CAREER_SUMMARY |
| `saveGame` | `() => void` | Writes to `SAVE_KEY(currentSlot)` |
| `loadGame` | `(slotOverride?) => boolean` | Runs 8 migration patches; returns false if no save found |
| `resetGame` | `() => void` | Wipes current slot, returns to SLOT_SELECT |
| `canClaimReward` | `() => boolean` | Delegates to `canClaimDailyReward` |
| `claimReward` | `() => void` | Claims daily reward, updates streak |
| `acknowledgeMilestone` | `() => void` | Clears `achievedMilestones` from `lastMatchResult` |

**Auto-save:** A `useEffect` watching `[player, league, fixtures, currentRound, lastMatchResult]` auto-saves whenever these change (guarded by `hasAttemptedLoad`).

---

## 10. Component map (all 37)

| Component | View / Usage | Purpose |
|-----------|-------------|---------|
| `SlotSelect.tsx` | SLOT_SELECT | 3-slot save picker — app start screen |
| `Onboarding.tsx` | ONBOARDING | Player creation wizard |
| `Dashboard.tsx` | DASHBOARD | Main hub — fixtures, quick stats, nav |
| `MatchSim.tsx` | MATCH_PREVIEW / MATCH_SIM / MATCH_RESULT | Full match flow — tactic picker → live sim → result |
| `MatchPredictionCard.tsx` | inline in MatchSim | Pre-match prediction UI; submits `MatchPrediction` to context |
| `DerbyBuildup.tsx` | inline in MatchSim | Pre-match screen when facing a rivalry opponent; shows `headToHead` record |
| `Training.tsx` | TRAINING | Attribute training; shows rehab panel when `player.injury !== null` |
| `PlayerStats.tsx` | PLAYER | Career & season stats display |
| `LeagueView.tsx` | LEAGUE | Ladder standings |
| `ClubHub.tsx` | CLUB | Team info; captain speech button; club history tab |
| `TransferMarket.tsx` | TRANSFER_MARKET | Offer cards with expiry rounds |
| `Shop.tsx` | SHOP | 28+ purchasable items |
| `MasterSkillTree.tsx` | MASTER_SKILLS | Skill unlock interface |
| `MediaHub.tsx` | MEDIA_HUB | Reputation, media events, social posts, conference responses |
| `CareerEvents.tsx` | CAREER_EVENTS | Active event cards with choice UI |
| `StoryArcPanel.tsx` | inline in CareerEvents / Dashboard | v1.3 story arc display; shows act progress, active events, choice buttons |
| `TeamChemistry.tsx` | TEAM_CHEMISTRY | Teammate relationship grid |
| `CoachingStaff.tsx` | COACHING_STAFF | Hire/view coaching staff and contracts |
| `Achievements.tsx` | ACHIEVEMENTS | Unlocked + locked achievement grid |
| `MilestonesGallery.tsx` | MILESTONES | Career milestone timeline |
| `PlayerComparison.tsx` | PLAYER_COMPARISON | Side-by-side attribute + stats comparison |
| `Draft.tsx` | DRAFT | Interactive draft board |
| `SeasonRecap.tsx` | modal overlay | End-of-season performance summary |
| `AwardsCeremony.tsx` | modal overlay | Season award presentations |
| `FinalsIntro.tsx` | modal overlay | Finals series entry screen |
| `SemiFinalsResults.tsx` | modal overlay | Semi-final result screen |
| `GrandFinalResult.tsx` | modal overlay | Grand Final result + celebration |
| `CareerSummary.tsx` | CAREER_SUMMARY | Retirement overview, legacy score, post-career path |
| `CareerTimeline.tsx` | inline in CareerSummary | Visual season-by-season history using `player.careerHistory` |
| `CareerExport.tsx` | inline in CareerSummary | Generates a shareable career card as exportable text/data |
| `PostMatchPress.tsx` | inline in MatchSim result | Press conference response UI after each match |
| `Settings.tsx` | SETTINGS | App settings, slot select shortcut, reset |
| `TipCard.tsx` | inline in multiple views | Reusable dismissible tip banner; reads/writes `player.seenTips` |
| `DailyRewardModal.tsx` | modal / Dashboard | Daily login reward claim UI |
| `Layout.tsx` | wrapper | Nav shell around all views |
| `Avatar.tsx` | utility | DiceBear SVG avatar renderer |
| `TeamLogo.tsx` | utility | Team logo display (image or emoji fallback) |

---

## 11. Key data flows

### New game
```
Onboarding → startNewGame(profile)
  generateLeague(LOCAL, leagueGender)
  initializeTeamChemistry(myTeam)
  initializeCoachingStaff(LOCAL)
  initializeMediaReputation()
  generateStoryArcs(player, round=1)
  generateSeasonObjectives(player, year=1)
  setFixtures(generateFixtures(league))
  setView('DASHBOARD')
```

### Playing a match
```
Dashboard → setView('MATCH_PREVIEW')
  [DerbyBuildup shown if facing rivalry opponent]
  [MatchPredictionCard shown for user prediction]
  user selects tactic → generateMatchSimulation(fixtureIndex, tactic)  [pure]
  setView('MATCH_SIM')
  user commits → commitMatchResult(fixtureIndex, result)
    selectHighlights(timeline) → result.highlights (top 5)
    updateLadderTeam for all round fixtures (simulates CPU matches)
    checkAchievements → new achievements
    updateTeamChemistryAfterMatch
    generateTeammateInteraction (up to 3 teammates)
    generateCoachInteraction (40% chance)
    updateObjectiveProgress
    shouldUpdateNickname → generateNickname
    generateMediaEvent
    generateCareerEvent (if canGenerateNewEvent)
    auto-save
  setView('MATCH_RESULT')
  [PostMatchPress shown]
```

### Advancing a round
```
advanceRound()
  [Team selection drama check — drop player if poor form/low morale]
  [Rep selection check at round 7]
  if round === SEASON_LENGTH → setShowFinalsIntro(true), generateSemiFinals
  if round === SEASON_LENGTH+1 → setShowSemiFinalsResults(true), generateGrandFinal
  if round === SEASON_LENGTH+2 → setShowGrandFinalResult(true)
  setCurrentRound(nextRound)
  setPlayer (main block):
    applyRehabChoice (if injured)
    processStaffContracts
    clearExpiredOffers + generateTransferOffers + generateFreeAgencyOffers
    if seasonEnded:
      age++, seasonsPlayed++
      calculateSeasonAwards → setSeasonAwards
      shouldHoldDraft → setDraftClass, setView('DRAFT')
      shouldPromote / shouldRelegate → new tier, new league
      createSeasonHistory → careerHistory
      applyAgingEffects
      retirementDecisionMade check (age >= 33)
      captaincy offer check
      generateFanMailEvent ← [⚠️ also called in second block below]
      captainSpeechUsed reset to false
    lowChemistryStreak / captain loss check
    matchPrediction cleared to undefined
    energy reset to 100
    legacyScore recalculated via calculateLegacyScore
  setPlayer (story arc block):
    advanceStoryArc for all active arcs
    generateStoryArcs again at round 7
    generateCommunityEvent / generateLockerRoomEvent / generateLegacyMoment / generateFanMail
    generateMediaConference if conditions met
    generateSeasonBioParagraph at season end
    recalculate legacyScore (again)
  setView('DASHBOARD')
```

### Season end (within advanceRound)
```
seasonEnded = (currentRound === SEASON_LENGTH + 2)
  setShowSeasonRecap(true)
  calculateSeasonAwards → setSeasonAwards
  createSeasonHistory → newCareerHistory
  applyAgingEffects
  calculateLegacyScore
  processLeagueRosterTurnover (same-tier path only)
  generateFixtures (new season)
  reset seasonStats
  setCurrentRound(1)
```

---

## 12. Styling conventions

- All styling via Tailwind utility classes in JSX — no CSS files, no CSS modules, no `style={}` unless dynamic values are required
- **Mobile-first** — default classes target small screens; use `md:` / `lg:` for larger breakpoints
- Dark theme — the game uses a dark UI throughout; background pattern: `bg-gray-900`, surfaces: `bg-gray-800`, cards: `bg-gray-800 rounded-xl border border-gray-700`
- No `dark:` classes — dark mode is the only mode
- Responsive grid pattern: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Button pattern: `px-4 py-2 rounded-lg font-semibold transition-colors`
- Do not use arbitrary Tailwind values (e.g. `w-[123px]`) — use standard scale values

---

## 13. Non-negotiable rules

1. **Never remove a field from `PlayerProfile`** — only add optional (`?`) fields
2. **All new `PlayerProfile` fields must be optional** — saves will not have them initially
3. **Always add a migration block in `loadGame()`** for every new `PlayerProfile` field
4. **Zero TypeScript errors** — `npm run build` must complete clean before any PR/commit
5. **Do not add required props to existing components** without providing defaults
6. **Do not change `SEASON_LENGTH`** without updating all finals-round logic (`SEASON_LENGTH + 1`, `SEASON_LENGTH + 2`) throughout `GameContext.tsx`
7. **Do not change `SAVE_KEY` format** without a migration path for existing slots
8. **Do not add a backend, database, or auth system** — client-only by design
9. **Do not install new npm packages** without confirming with the project owner
10. **Add new business logic to util files**, not inline in `GameContext.tsx` — the context is already ~2200 lines
11. **`types.ts` changes ripple everywhere** — after editing it, search all files importing from `types` and update as needed
12. **Do not replicate the `teamChemistry?.state` bug** — the correct field is `teamChemistry.recentForm`
13. **Do not add a third `generateFanMailEvent` call** in `advanceRound` — it already fires twice (known duplication issue)

---

## 14. Known bugs & active issues

| Location | Issue | Severity |
|----------|-------|----------|
| `GameContext.tsx` ~line 1175 | Captaincy eligibility reads `teamChemistry?.state` — field doesn't exist, should be `teamChemistry?.recentForm` | Medium — captaincy offers never fire |
| `GameContext.tsx` ~line 920 | Rehab physio check: `coachingStaff?.staffMembers?.some(s => s.role === 'PHYSIO')` — `staffMembers` not in `CoachingStaff` interface; should use `medicalStaff` | Medium — physio bonus never applies |
| `GameContext.tsx` ~line 310 | `useCaptainSpeech` sets `motivationBoost: 15` but does not set `motivationExpiry` — boost never expires | Low — minor balance issue |
| `GameContext.tsx` `advanceRound` | `generateFanMailEvent` called in two separate `setPlayer` blocks — can generate duplicate fan mail events in the same round | Low |
| `GameContext.tsx` `advanceRound` | `legacyScore` recalculated twice per round (once in main block via `applyAgingEffects` result, once in story arc block) — second write wins | Low — no data loss |
| `PlayerProfile` | `retireAtSeasonEnd` field set as `(extra as any).retireAtSeasonEnd` — untyped, not in `types.ts` | Low — add as `retireAtSeasonEnd?: boolean` to `PlayerProfile` |
| `components/CoachingStaff.tsx` | `hireCoachingStaff` context action is typed as `(staffMember: any, contractType)` — needs proper `StaffMember` typing | Low |
| General | `biography[]` dynamic bio system exists but some display components may still read static `bio` string | Low — add `biography?.[biography.length-1] ?? bio` fallback pattern |
| `PlayerProfile` | `motivationExpiry` not set in `useCaptainSpeech` — see bug above | Low |

---

## 15. AFL domain knowledge

- **Scoring:** Goal (through tall posts) = 6 pts. Behind (outer posts or touched off boot) = 1 pt. Score written `Goals.Behinds.Total` e.g. `12.8.80`
- **Disposals** = kicks + handballs — the primary midfield counting stat
- **Brownlow Medal** — best & fairest; umpires award 3-2-1 per game; season total determines winner
- **Coleman Medal** — season's leading goalkicker
- **All-Australian** — selected in the best 22 players of the season
- **Finals** — top 4 qualify. Week 1: 1st vs 2nd (winner to GF, loser gets another chance) and 3rd vs 4th (loser eliminated). Week 2: Grand Final
- **Premiership** = winning the Grand Final = the championship
- **Inside 50** — entry into the attacking zone (forward half + goal square)
- **Clearance** — winning possession out of a stoppage or ball-up
- **Hit-out** — ruck tap to a teammate at a ball-up or boundary throw-in
- **Hardball get / Contested possession** — winning the ball when an opponent is contesting it
- **Positions:** Forward (scoring), Midfielder (contested ball, disposals), Defender (intercepts, spoils, locks down forwards), Ruck (contests ball-ups, leads ruck division)
- **Sub-positions** used in code: HFF (Half Forward Flank), C (Centre), HBF (Half Back Flank), RUCK, INT (Interchange/utility)
- **Season** runs Feb–Sep in reality; abstracted to 14 rounds + 2 finals rounds in game

---

## 16. Known Gotchas
 - **CSS GOTCHA** — Stacking context breaks fixed overlays:
Any transform value other than `none` on an ancestor element creates a new 
containing block for position: fixed descendants. After animation completes, 
ensure final keyframe uses `transform: none` not `transform: translateY(0)`. 
Affects: FinalsIntro, SeasonRecap, AwardsCeremony, DailyRewardModal, 
SemiFinalsResults, GrandFinalResult — all rendered under animate-slide-in 
wrapper in Layout.tsx.
