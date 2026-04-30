# 🏉 AFL Footy Stars — v1.5 Feature Specification
**Deep Match Simulation Engine**
*April 2026 | Prepared for Claude Code / Sub-agents*

---

## 1. Overview

v1.5 upgrades `utils/simulationUtils.ts` from a stat-distribution engine into a genuine play-by-play simulation. The current engine pre-rolls the player's final stats at the start (`pGoals = 2`, `pDisposals = 18`) and then stages them as events — the outcome is determined before the quarter loop even runs. v1.5 flips this so the simulation runs and stats emerge from what happens, with opponent quality, team chemistry, fatigue, and match context all feeding into results.

**A second file is created:** `utils/matchEngineUtils.ts` holds the Team Battle Engine calculations. This keeps `simulationUtils.ts` from becoming unmanageably large and lets future agents extend the battle engine independently.

The function signature of `calculateMatchOutcome` does **not change**. All calling code in `GameContext.tsx` and `MatchSim.tsx` is untouched.

---

### 1.1 Confirmed current state (read the source before writing)

The following has been verified by reading the actual files. Do not assume anything beyond this list is implemented.

**What already exists in `simulationUtils.ts`:**
- Tactic modifiers (`ATTACK`, `BALANCED`, `DEFENSIVE`, `PRESS`) adjusting `playerScoringBonus` and `opponentScoringPenalty` ✓
- Morale multiplier (1.1 above 80, 0.85 below 40) ✓
- Personality modifiers for all 5 types (`PROFESSIONAL`, `FLAIR`, `WARRIOR`, `LEADER`, `ENIGMA`) with `consistencyMod`, `tacklingBonus`, `bigGameBonus`, `energyDrainMod` ✓
- Pressure system (`pressureLevel` 0–3 for grand final / finals / derby / return from injury) × personality `pressureModifier` ✓
- Momentum system with `homeMomentum`, `homeConsecutiveScores`, `awayConsecutiveScores`, per-quarter decay (`* 0.85`) ✓
- Culture-aware crowd phrases (`CROWD_PHRASES_BY_CULTURE`) ✓
- Brownlow 3-2-1 vote calculation across all top performers ✓
- Performance grade `A+` to `D` with position-specific scoring ✓
- Position-specific events: `HIT_OUT` (Ruck), `INTERCEPT`/`ONE_ON_ONE_DEFENSIVE` (Defender), `ONE_ON_ONE` (Forward) ✓
- Extended stats tracking: `effectiveDisposals`, `ineffectiveDisposals`, `kicks`, `handballs`, `marks`, `contendedPossessions`, `inside50s`, `clearances`, `hitOuts`, `brownlowVotes1/2/3` ✓
- Fisher-Yates shuffle for top performer selection ✓
- `simulateCPUMatch` uses normal distribution with rating differential ✓
- Energy drain tracked per quarter and returned as `energyUsed` ✓

**What does NOT yet exist:**
- `utils/matchEngineUtils.ts` — file does not exist
- `MatchContext` interface — not in `types.ts`
- `matchContext` or `battleReport` fields on `MatchResult` — not in `types.ts`
- Team Battle Engine (contested possession, zone defence, synergy multiplier)
- `matchCtx` variable inside `calculateMatchOutcome`
- Fatigue decay model (per-quarter performance decay based on starting energy)
- Dynamic per-quarter injury risk (currently a single upfront roll: `if (Math.random() < injuryChance)`)
- Opponent team rating affecting goal probability in the filler loop (currently fixed `0.25` threshold)
- Chemistry bonus wired into simulation (calculated in `chemistryUtils.ts` but never imported in `simulationUtils.ts`)
- `selectContextualPhrase` helper for state-aware GENERIC commentary
- Contextual phrase pools (`COMEBACK`, `BLOWOUT_HOME`, `BLOWOUT_AWAY`, `FINALS_TENSION`, `LATE_PRESSURE`)
- `pStats.clearances` accumulation bug (currently overwrites each quarter instead of accumulating)
- `pStats.kicks + pStats.handballs` normalisation (they don't sum to `pStats.disposals`)
- Forward multiplier applied AFTER Brownlow (should be before)
- `pickTeammate()` and `pickOpponent()` helpers
- `generateQuarterTimestamps()` helper (timestamps are still `MM:00`)
- All chain phrase templates (`CHAIN_KICK_TO_GOAL`, `CHAIN_TACKLE_TURNOVER`, etc.)
- Chain-aware filler event loop
- Synergy commentary events
- Rivalry buildup/resolution events
- `View` type — already exists in `types.ts` ✓ (do not add again)

---

### 1.2 What v1.5 must NOT change

- The function signature of `calculateMatchOutcome(homeTeam, awayTeam, player, currentRound, tactic?)` — identical
- The function signature of `simulateCPUMatch(homeTeam, awayTeam)` — identical
- Any file outside `utils/simulationUtils.ts`, `utils/matchEngineUtils.ts`, and `types.ts`
- Any existing export from `simulationUtils.ts` (`INJURY_TYPES`, `PHRASES`, `simulateCPUMatch`, `calculateMatchOutcome`)
- All existing systems listed as "already exists" above — preserve them exactly

---

### 1.3 Scope of files changed

| File | Action | What changes |
|------|--------|-------------|
| `utils/matchEngineUtils.ts` | **Create new file** | Team Battle Engine — all three battles, context builder, battle report generator, highlight scorer |
| `utils/simulationUtils.ts` | **Modify** | Import matchEngineUtils; add timestamp generator; add team/player name helpers; add chain/synergy/rivalry/contextual phrases to PHRASES; wire matchCtx modifiers; replace upfront injury with per-quarter dynamic risk; add fatigue decay model; fix clearances accumulation; fix kicks+handballs normalisation; move forward multiplier before Brownlow; add chain-aware filler loop; add synergy events; add rivalry events; add `selectContextualPhrase`; update return statement |
| `types.ts` | **Modify** | Add `MatchContext` interface; add `matchContext?` and `battleReport?` to `MatchResult` |

---

## 2. `types.ts` — changes required

### 2.1 Add `MatchContext` interface

Add after the existing `PerformerStats` interface:

```typescript
export interface MatchContext {
  contestedPossessionWinner: 'HOME' | 'AWAY' | 'EVEN';
  defenceAdvantage: 'HOME' | 'AWAY' | 'EVEN';
  synergyDelta: number;          // -20 to +20, positive = home team chemistry advantage
  pressureRating: number;        // 0–3 (mirrors pressureLevel already used in simulationUtils)
  homeTeamRating: number;        // average player rating 0–99
  awayTeamRating: number;
  ratingDifferential: number;    // homeTeamRating - awayTeamRating
}
```

### 2.2 Extend `MatchResult`

In the existing `MatchResult` interface, add two optional fields at the end. Both are optional so existing code that constructs `MatchResult` without them compiles without changes:

```typescript
export interface MatchResult {
  // ... all existing fields unchanged ...
  matchContext?: MatchContext;   // output from Team Battle Engine
  battleReport?: string[];       // human-readable battle outcome sentences
}
```

The existing `energyUsed?: number` and `tactic?: Tactic` optional fields are already present — do not add them again.

---

## 3. Create `utils/matchEngineUtils.ts`

This is a new file. Create it at `utils/matchEngineUtils.ts`. It has no side effects — all functions are pure and exported for use in `simulationUtils.ts` and `GameContext.tsx`.

```typescript
import { Team, PlayerProfile, TeamChemistry, MatchEvent, MatchContext } from '../types';

// ─────────────────────────────────────────────
// TEAM RATING
// ─────────────────────────────────────────────

/**
 * Calculate the overall quality rating for a team based on its roster.
 * Returns a 0–99 average across all players on the team.
 */
export const calculateTeamRating = (team: Team): number => {
  if (!team.players || team.players.length === 0) return 50;
  const total = team.players.reduce((sum, p) => sum + p.rating, 0);
  return Math.round(total / team.players.length);
};

// ─────────────────────────────────────────────
// BATTLE 1 — CONTESTED POSSESSION
// ─────────────────────────────────────────────

/**
 * Simulates midfield/ruck dominance for the match.
 * The winner gains a clearance and inside-50 rate bonus applied
 * to playerScoringBonus and opponentScoringPenalty in calculateMatchOutcome.
 *
 * Inputs:
 *   homeTeam / awayTeam  — full Team objects (players array required)
 *   homePlayer           — the user's PlayerProfile if they are the home team, else null
 *                          (null when player is away — only home player boosts home score)
 *
 * Returns: 'HOME' | 'AWAY' | 'EVEN'
 */
export const contestedPossessionBattle = (
  homeTeam: Team,
  awayTeam: Team,
  homePlayer: PlayerProfile | null
): 'HOME' | 'AWAY' | 'EVEN' => {
  // Rate each team by their top-4 players (represents the key midfield/ruck brigade)
  const getTopFourRating = (team: Team): number => {
    const sorted = [...team.players].sort((a, b) => b.rating - a.rating);
    const top4 = sorted.slice(0, 4);
    if (top4.length === 0) return 50;
    return top4.reduce((sum, p) => sum + p.rating, 0) / top4.length;
  };

  let homeScore = getTopFourRating(homeTeam);
  let awayScore = getTopFourRating(awayTeam);

  // If the user is on the home team, their stamina + handball attributes
  // contribute 30% of the home contested-ball score
  if (homePlayer) {
    const playerContrib = (homePlayer.attributes.stamina + homePlayer.attributes.handball) / 2;
    homeScore = homeScore * 0.70 + playerContrib * 0.30;
  }

  // Add natural match-day variance (±7.5 points either way)
  homeScore += (Math.random() - 0.5) * 15;
  awayScore += (Math.random() - 0.5) * 15;

  const diff = homeScore - awayScore;
  if (diff > 5) return 'HOME';
  if (diff < -5) return 'AWAY';
  return 'EVEN';
};

// ─────────────────────────────────────────────
// BATTLE 2 — ZONE DEFENCE
// ─────────────────────────────────────────────

/**
 * Simulates defensive quality for the match.
 * The winner reduces the opposition's scoring rate via opponentScoringPenalty.
 *
 * Methodology: uses the BOTTOM half of the roster (by rating) as a proxy for
 * defensive depth. This avoids double-counting the top players already captured
 * by the contested possession battle.
 *
 * Returns: 'HOME' | 'AWAY' | 'EVEN'
 */
export const zoneDefenceBattle = (
  homeTeam: Team,
  awayTeam: Team
): 'HOME' | 'AWAY' | 'EVEN' => {
  const getDefenceRating = (team: Team): number => {
    if (team.players.length === 0) return 50;
    const sorted = [...team.players].sort((a, b) => a.rating - b.rating);
    const defenders = sorted.slice(0, Math.ceil(sorted.length / 2));
    return defenders.reduce((sum, p) => sum + p.rating, 0) / defenders.length;
  };

  const homeDef = getDefenceRating(homeTeam) + (Math.random() - 0.5) * 12;
  const awayDef = getDefenceRating(awayTeam) + (Math.random() - 0.5) * 12;

  const diff = homeDef - awayDef;
  if (diff > 4) return 'HOME';
  if (diff < -4) return 'AWAY';
  return 'EVEN';
};

// ─────────────────────────────────────────────
// BATTLE 3 — TEAM SYNERGY / CHEMISTRY
// ─────────────────────────────────────────────

/**
 * Converts team chemistry into a scoring probability delta.
 * This is the missing wire between chemistryUtils and simulationUtils.
 *
 * The user's teamChemistry (player.teamChemistry) is passed as homeChemistry.
 * The opponent's chemistry is unknown (treated as neutral = 50).
 *
 * Returns: -20 to +20
 *   positive = home team chemistry advantage → adds to home playerScoringBonus
 *   negative = opponent chemistry advantage → subtracts from playerScoringBonus
 */
export const synergyMultiplier = (
  homeChemistry: TeamChemistry | undefined,
  awayChemistry: TeamChemistry | undefined
): number => {
  const getScore = (chem: TeamChemistry | undefined): number =>
    chem?.overallChemistry ?? 50;

  const delta = ((getScore(homeChemistry) - getScore(awayChemistry)) / 100) * 20;
  return Math.max(-20, Math.min(20, delta));
};

// ─────────────────────────────────────────────
// MATCH CONTEXT ASSEMBLY
// ─────────────────────────────────────────────

/**
 * Runs all three battles and assembles the MatchContext object.
 * Called once at the top of calculateMatchOutcome before the quarter loop.
 *
 * pressureRating mirrors the pressureLevel variable already computed in
 * calculateMatchOutcome — pass it in directly to keep them in sync.
 *   0 = normal season match
 *   1 = elevated (return from injury)
 *   2 = high (finals or derby)
 *   3 = extreme (Grand Final)
 */
export const buildMatchContext = (
  homeTeam: Team,
  awayTeam: Team,
  player: PlayerProfile,
  pressureLevel: number   // pass from the already-computed pressureLevel in calculateMatchOutcome
): MatchContext => {
  const isHome = player.contract.clubName === homeTeam.name;

  const possession = contestedPossessionBattle(
    homeTeam,
    awayTeam,
    isHome ? player : null   // only contribute to home score if player is home team
  );

  const defence = zoneDefenceBattle(homeTeam, awayTeam);

  const synergyDelta = synergyMultiplier(
    player.teamChemistry,   // user's own team chemistry — always available
    undefined               // opponent chemistry is unknown; defaults to neutral (50)
  );

  const homeRating = calculateTeamRating(homeTeam);
  const awayRating  = calculateTeamRating(awayTeam);

  return {
    contestedPossessionWinner: possession,
    defenceAdvantage: defence,
    synergyDelta,
    pressureRating: pressureLevel,
    homeTeamRating: homeRating,
    awayTeamRating: awayRating,
    ratingDifferential: homeRating - awayRating,
  };
};

// ─────────────────────────────────────────────
// BATTLE REPORT
// ─────────────────────────────────────────────

/**
 * Converts a MatchContext into 2–4 human-readable sentences for use as
 * the match summary string and as context for Gemini commentary.
 */
export const generateBattleReport = (
  ctx: MatchContext,
  homeTeamName: string,
  awayTeamName: string
): string[] => {
  const lines: string[] = [];

  // Contested possession outcome
  if (ctx.contestedPossessionWinner === 'HOME') {
    lines.push(`${homeTeamName} dominated the contested ball throughout.`);
  } else if (ctx.contestedPossessionWinner === 'AWAY') {
    lines.push(`${awayTeamName} won the contested possession battle.`);
  } else {
    lines.push('Midfield was an even contest — neither side dominated.');
  }

  // Defence outcome (only add if it was decisive)
  if (ctx.defenceAdvantage === 'HOME') {
    lines.push(`${homeTeamName}'s defensive structure was outstanding.`);
  } else if (ctx.defenceAdvantage === 'AWAY') {
    lines.push(`${awayTeamName}'s defensive pressure limited forward entries.`);
  }

  // Synergy (only add if meaningful — ±8 threshold)
  if (ctx.synergyDelta > 8) {
    lines.push(`${homeTeamName}'s team chemistry proved to be a real weapon today.`);
  } else if (ctx.synergyDelta < -8) {
    lines.push('The opposition combined brilliantly as a unit.');
  }

  // Team quality gap (only if meaningful — >8 points)
  if (Math.abs(ctx.ratingDifferential) > 8) {
    const stronger = ctx.ratingDifferential > 0 ? homeTeamName : awayTeamName;
    const weaker   = ctx.ratingDifferential > 0 ? awayTeamName : homeTeamName;
    lines.push(`On paper ${stronger} were the stronger side, but ${weaker} made them work for it.`);
  }

  return lines;
};

// ─────────────────────────────────────────────
// CONTEXTUAL HIGHLIGHT SCORING
// ─────────────────────────────────────────────

/**
 * Scores a MatchEvent by its narrative significance, accounting for match context.
 * Used by GameContext.commitMatchResult to select the top 5 highlights.
 *
 * Parameters:
 *   event       — the event to score
 *   quarter     — which quarter (1–4), later quarters weighted more heavily
 *   scoreDiff   — running score difference at the time of the event (positive = player's team leading)
 *   isFinals    — whether this is a finals match
 *
 * Returns: numeric score (higher = more significant)
 */
export const contextHighlightScore = (
  event: MatchEvent,
  quarter: number,
  scoreDiff: number,
  isFinals: boolean
): number => {
  const typeBaseScores: Partial<Record<MatchEvent['type'], number>> = {
    GOAL: 8,
    BEHIND: 1,
    MARK: 4,
    TACKLE: 3,
    INJURY: 7,
    RIVALRY: 9,
    ONE_ON_ONE: 5,
    ONE_ON_ONE_DEFENSIVE: 4,
    INTERCEPT: 6,
    HIT_OUT: 4,
    POSSESSION: 2,
    TURNOVER: 2,
    FREE_KICK: 2,
    GENERIC: 1,
  };

  let score = typeBaseScores[event.type] ?? 1;

  // Player involvement bonus
  if (event.isPlayerInvolved) score += 3;

  // Finals multiplier
  if (isFinals) score *= 1.5;

  // Q4 carries more weight
  if (quarter === 4) score *= 1.3;
  else if (quarter === 3) score *= 1.1;

  // Comeback goal — player scores while their team is losing
  if (event.type === 'GOAL' && scoreDiff < 0 && event.isPlayerInvolved) score += 5;

  // Clutch goal — player scores to take the lead (was tied or 1 pt behind)
  if (event.type === 'GOAL' && scoreDiff >= -6 && scoreDiff <= 0 && event.isPlayerInvolved) score += 4;

  // Injury in a finals match
  if (event.type === 'INJURY' && isFinals) score += 3;

  return Math.round(score);
};
```

---

## 4. Modify `utils/simulationUtils.ts`

### 4.1 Add import at top of file

Add after the existing import line:

```typescript
import { buildMatchContext, generateBattleReport, contextHighlightScore } from './matchEngineUtils';
```

The existing import line is:
```typescript
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position, Tactic, CultureType, PlayerPersonality } from '../types';
```

Add `MatchContext` to this import:
```typescript
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position, Tactic, CultureType, PlayerPersonality, MatchContext } from '../types';
```

---

### 4.2 Add `generateQuarterTimestamps` helper

Add this function immediately before `simulateCPUMatch`. It generates `count` unique `MM:SS` timestamps spread across a 20-minute quarter with natural clustering:

```typescript
/**
 * Pre-generates unique, chronologically ordered MM:SS timestamps for a quarter.
 * Slots are spread evenly across 20 minutes with ±1 minute of natural jitter.
 * Seconds are randomised (3–56) so no event lands on the artificial :00 mark.
 *
 * Usage:
 *   const slots = generateQuarterTimestamps(26); // over-allocate above target
 *   let slotIdx = 0;
 *   const nextTime = () => slots[slotIdx++] ?? '20:00';
 */
const generateQuarterTimestamps = (count: number): string[] => {
  if (count === 0) return [];

  const slotSize = 20 / count;
  const minutes: number[] = [];

  for (let i = 0; i < count; i++) {
    const base   = Math.floor(i * slotSize) + 1;
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    minutes.push(Math.max(1, Math.min(20, base + jitter)));
  }

  // Ensure strictly ascending — no two events at the same minute
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i] <= minutes[i - 1]) {
      minutes[i] = minutes[i - 1] + 1;
    }
  }

  // Append random seconds (3–56) — never :00 (too artificial) and never :59 (ambiguous)
  return minutes.map(m => {
    const seconds = Math.floor(Math.random() * 54) + 3;
    return `${Math.min(20, m)}:${String(seconds).padStart(2, '0')}`;
  });
};
```

---

### 4.3 Expand `PHRASES` object

The existing `PHRASES` object is a top-level `const` exported from the file. All additions below are new keys added to this object — do not remove or modify existing keys.

#### 4.3.1 Expand existing pools to 12+ entries each

Each pool currently has 5–7 entries. With 18–24 events per quarter the current pools repeat within a single match. **Append** the following (do not remove existing entries):

```typescript
// Append to PHRASES.GOAL — brings total to 18
"bends it truly from the boundary!",
"snaps on the run — no angle, no problem!",
"takes the mark and drills the set shot.",
"receives the handball and goals on the burst!",
"marks strongly at the top of the square and converts.",
"a dribble kick through traffic — screws between the posts!",
"wheels onto the right foot and nails it.",
"on the run from 40 out — perfect drop punt!",
"a chest mark and a clean set shot — never in doubt.",
"goals off the ground — it bounces through somehow!",
"snaps truly from the pocket off two steps.",

// Append to PHRASES.BEHIND — brings total to 17
"screws it to the right, just misses.",
"rushes through for a behind — they'll take it.",
"kicks under pressure, clips the post.",
"a speculative snap, narrowly wide.",
"from the boundary — not enough curl, just misses.",
"a rushed behind — defender gets boot to ball.",
"point to the left — unlucky given the angle.",
"the set shot slides past on the right.",
"a dropped chest mark leads to a scrambled behind.",
"the snap from the pocket skews wide.",
"floated on the wind and drifted right.",

// Append to PHRASES.MARK — brings total to 18
"soars above the pack in a marking contest!",
"leads at full pace and takes the grab.",
"holds on through heavy contact.",
"takes a one-handed screamer at full stretch!",
"times the leap perfectly, clean hands.",
"a chest mark on the lead — textbook.",
"contested grab through a thicket of arms.",
"a pack mark grabbed on the third attempt.",
"outstanding positioning from the pocket player.",
"gloves it overhead — barely touched.",
"high above the pack — total dominance.",
"a courageous overhead in heavy traffic.",

// Append to PHRASES.TACKLE — brings total to 16
"brings them to ground with a textbook smother.",
"chases 40 metres and pulls off the run-down tackle.",
"wraps the arms at full pace.",
"stands them up and strips the ball.",
"smothers the kick — closed fist blocks it cold.",
"trips them on the turn — free kick paid.",
"cleans them up after the kick — they won't forget that.",
"forces a holding infringement.",
"a two-man tackle — neither team gets credit.",
"tackles from behind — play on says the umpire.",
"a shepherd leads to a soft holding call.",

// Append to PHRASES.POSSESSION — brings total to 17
"crumbs the contest and kicks long.",
"reads the play two moves ahead.",
"snaps out of traffic on the forward flank.",
"takes the uncontested mark on the wing.",
"picks up the ground ball under pressure.",
"handballs on the run — perfectly timed.",
"dribbles through the pack on his knees — incredible!",
"a quick handball chain bypasses the press.",
"leads to the open side and takes the kick.",
"wins the loose ball at the contest boundary.",
"a neat little banana off the outside of the boot.",

// Append to PHRASES.TURNOVER — brings total to 15
"a poor decision — hands it back cheaply.",
"boots it out on the full.",
"dithers too long and is dispossessed.",
"kicks across the body — intercepted.",
"the handball is too high — no one gets near it.",
"runs into traffic and drops the ball.",
"chips it short — straight to the opposition.",
"a hospital handball — nobody wanted that.",
"rushed under pressure, straight to the opponent.",
"tries to beat his man and loses it.",

// Append to PHRASES.FREE_KICK — brings total to 15
"trips the player on the mark.",
"ball in the back — free kick paid.",
"the protected area is pinged — 50 metre penalty!",
"milks a free kick and plays on immediately.",
"contact high — the umpire doesn't hesitate.",
"raking it in the back of the pack — obvious free.",
"a deliberate out of bounds decision.",
"prior opportunity adjudicated — holding the ball.",
"the third time for high contact today — free kick.",
"deliberate rushed behind — free kick on the goal line.",

// Append to PHRASES.GENERIC — brings total to 18
"Both teams fighting for every contest.",
"A real arm wrestle in the midfield.",
"The coaches will be restless on the bench.",
"Mistakes creeping in from both sides.",
"A goal from here could change everything.",
"The interchange bench is working overtime.",
"The runner is sprinting onto the ground with instructions.",
"This is the passage of play the season could turn on.",
"Hard to separate these two teams right now.",
"Pressure footy — every disposal under scrutiny.",
"The scoreboard barely reflects how tight this is.",
"Tags being applied — the game plan is being tested.",
```

#### 4.3.2 New phrase pools

Add all of the following as new keys on the `PHRASES` object. Every phrase is verified to describe a real AFL play type.

```typescript
// 9 new filler pools
STOPPAGE: [
  "Ball up in the centre — both rucks competing hard.",
  "Throw-in at the boundary, bodies flying.",
  "Stoppage at the top of the square, packs forming.",
  "The umpire calls play on — both sides disputing it.",
  "A scrimmage breaks out near the goal square.",
  "Hard at the ball at the centre bounce.",
  "Multiple players down after a heavy contest.",
  "The ball is trapped at half-back — ball up called.",
  "Stoppage near the wing, both midfields flooding in.",
  "A boundary throw-in turns into a full pack contest.",
  "Neither team can break the deadlock at the stoppage.",
  "Whistle for the ball-up — defenders hold their shape.",
],

RUCK_CONTEST: [
  "The rucks go head-to-head at the centre bounce.",
  "A hitout to advantage — the midfield is off and running.",
  "Tap-out to the benefit of the forwards.",
  "Both big men leave the ground simultaneously.",
  "A controlled tap from the ruck sets up the play.",
  "The ruckman wins possession on the way down.",
  "A powerful contest at the ball-up — the crowd winces.",
  "Hitout directly to a running midfielder.",
  "The ruck wins despite being outweighed.",
  "Aerial battle in the centre — contested mark taken.",
],

DEFENSIVE_PRESSURE: [
  "Smother on the boot — ball goes back the other way.",
  "The press is working — three turnovers in a row now.",
  "Shepherd sends the opponent out of bounds.",
  "A body-on-body contest in the defensive 50, no give.",
  "The back line holds firm — nothing gets through.",
  "Spoil from the back pocket ends the scoring threat.",
  "Full-back takes the intercept and clears the danger.",
  "A brilliant spoil — the forward marks nothing.",
  "Defensive lockdown — five shots and nothing to show.",
  "Zone defence holding — the forward line is starved.",
  "Defensive 50 under siege but they hold the line.",
],

FORWARD_PRESSURE: [
  "The forwards are flooding inside 50 in waves.",
  "A desperate behind saves the goal — but only just.",
  "Three entries inside 50 in under a minute.",
  "Quick hands from the forward flank creates the chance.",
  "The centre clearance lands directly in the forward pocket.",
  "A banana from tight on the boundary — just misses.",
  "The full-forward holds his position superbly.",
  "Repeat inside-50 entries keeping the scoreboard ticking.",
  "A set shot from 35 metres — nerves in the crowd.",
  "Strong lead from the key forward, spoiled away.",
  "Forward craft on display — working the angle beautifully.",
],

MIDFIELD_BATTLE: [
  "Contested possessions flying in the guts.",
  "A handball chain breaks down the middle of the ground.",
  "Burst from the stoppage — three quick kicks in transition.",
  "The wing is outpacing everyone up the ground.",
  "A switchkick from CHB to the opposite flank opens the game.",
  "Midfield tags are working — the star is being blanketed.",
  "Transition footy at full pace — both ends scrambling.",
  "The handball chain unravels — ball spilled at half-back.",
  "Corridor opened — the kick finds a lead at the top of the square.",
  "Both midfields rotating quickly to cover the ground.",
  "A superb crumb from the pack, sidestep and goes forward.",
],

CONDITIONS: [
  "The wet ball is making clean possession difficult.",
  "Wind at their backs this quarter — long kicks are floating.",
  "Into the breeze now — the kicking game is compromised.",
  "The turf is cutting up — footing is unreliable.",
  "A greasy ball slipping through fingers all day.",
  "The sun is a factor at this end — three dropped marks already.",
  "Wind swirling — neither team committing to the long kick.",
  "Heavy dew on the oval — the ball is like a bar of soap.",
],

ATMOSPHERE: [
  "The crowd has risen as one.",
  "Noise levels through the roof — you cannot hear yourself think.",
  "A stunned silence from the opposition supporters.",
  "The home crowd willing every kick to go straight.",
  "Away supporters finding something to cheer.",
  "A wave of nervous energy around the ground.",
  "The cheer squad is in full voice.",
  "Crowd on their feet — every contest feeling enormous.",
  "The coaches are animated on the bench.",
  "The interchange bench is buzzing with instruction.",
  "The roar when they take the mark is deafening.",
],

UMPIRE: [
  "Play on! — the umpire waves it through. Both benches dispute that.",
  "Fifty metre penalty — the full-forward is now on the goal square.",
  "The deliberate rushed behind is paid — free kick on the goal line.",
  "Umpire calls prior opportunity — free kick against.",
  "Protected zone infringement — 50 metres added.",
  "Holding the man — umpire reaches for the whistle.",
  "Ball up called after the ball becomes trapped in the pack.",
  "The umpires confer — a contentious holding decision.",
  "A throw adjudicated against the midfielder — opposition free.",
],

BRILLIANCE: [
  "Outrageous skill — the crowd simply cannot believe it.",
  "That is something very special. Replay that a hundred times.",
  "Pure instinct. The coaching staff are on their feet.",
  "What a footballer. That takes your breath away.",
  "The sort of skill that wins Brownlow votes on its own.",
  "A highlight reel moment — this will be replayed all week.",
  "That is why they call him dangerous every single week.",
  "He has separated himself from everyone on this ground today.",
],

// 5 contextual state pools for selectContextualPhrase()
COMEBACK: [
  "They refuse to give in!",
  "Against all odds — they are back in this!",
  "The crowd cannot believe what they are seeing!",
  "Don't write this team off yet!",
  "A miraculous turn of events here!",
  "The momentum has completely shifted.",
  "This is the passage of play that will be remembered.",
],

BLOWOUT_HOME: [
  "The visitors are being completely overrun.",
  "This is turning into an embarrassment for the away side.",
  "The home side is putting on a clinic.",
  "There is no way back from here.",
  "A commanding performance from the home side.",
  "The scoreboard is a fair reflection of this contest.",
],

BLOWOUT_AWAY: [
  "The home side cannot live with the visitors today.",
  "This is one of the great away performances.",
  "The crowd has gone quiet at this venue.",
  "Total domination from the away team.",
  "A masterclass in away football.",
],

FINALS_TENSION: [
  "Finals football — every possession matters.",
  "The tension is absolutely palpable.",
  "Hearts in mouths for everyone involved.",
  "This is what they play all season for.",
  "You cannot take your eyes off this contest.",
  "No room for error at this time of year.",
  "Finals football — you either want it or you don't.",
],

LATE_PRESSURE: [
  "Clock is ticking — desperation setting in.",
  "Every inside-50 could be the last.",
  "Time is running out for the trailing team.",
  "The pressure is immense in these final minutes.",
  "This could come down to the very last kick.",
  "Deep into time-on — anything can happen.",
],

// Chain phrase templates (functions, not strings)
CHAIN_KICK_TO_GOAL: [
  (k: string, g: string) => `${k} finds ${g} on the lead — ${g} marks and goals!`,
  (k: string, g: string) => `A pinpoint kick inside 50 from ${k}, ${g} takes the mark and converts!`,
  (k: string, g: string) => `${k} threads it to ${g} who nails the set shot.`,
  (k: string, g: string) => `${k} with the precision kick to ${g} — it's a major!`,
],

CHAIN_HANDBALL_GOAL: [
  (h: string, g: string) => `${h} wins it from the stoppage, handballs to ${g} — GOAL!`,
  (h: string, g: string) => `Quick hands from ${h} finds ${g} in space. The snap is true!`,
  (h: string, g: string) => `${h} reads the play perfectly, ${g} receives and finishes coolly.`,
],

CHAIN_TACKLE_TURNOVER: [
  (t: string, v: string) => `${t} lays the tackle on ${v}! Holding the ball — opposition wins possession.`,
  (t: string, v: string) => `${v} is caught holding by ${t}. Free kick to the opposition.`,
  (t: string, v: string) => `${t} runs down ${v} from behind and wins the ball!`,
],

CHAIN_RUCK_CLEARANCE: [
  (r: string, m: string) => `${r} wins the tap to ${m} who bursts out of the stoppage.`,
  (r: string, m: string) => `Dominant ruck work from ${r}, ${m} collects at ground level and drives forward.`,
  (r: string, m: string) => `${r} with the clean hitout, ${m} leads up and takes possession.`,
],

CHAIN_INTERCEPT_FORWARD: [
  (d: string, f: string) => `${d} intercepts brilliantly and finds ${f} on the wing with a laser kick.`,
  (d: string, f: string) => `${d} reads it perfectly — turns defence into attack, ${f} leads up strongly.`,
  (d: string, f: string) => `A stunning intercept from ${d}, immediately moving forward to ${f}.`,
],

CHAIN_SYNERGY_POSITIVE: [
  (a: string, b: string) => `Pure instinct between ${a} and ${b} — the combination looks almost telepathic.`,
  (a: string, b: string) => `${a} and ${b} have been combining brilliantly all day — another smooth exchange.`,
  (a: string, b: string) => `The understanding between ${a} and ${b} is a real weapon for this team.`,
  (a: string, b: string) => `Time and again ${a} finds ${b} — it's like they share the same brain.`,
],

CHAIN_SYNERGY_NEGATIVE: [
  (a: string, b: string) => `A miscommunication — ${a} and ${b} both called for the ball and neither got it.`,
  (a: string, b: string) => `${a} expected the handball from ${b} but it never came. Opportunity wasted.`,
  (a: string, b: string) => `${a} and ${b} are not on the same page today — the coach won't be happy.`,
],

RIVALRY_BUILDUP: {
  Low:    [
    (o: string) => `${o} has had run-ins with our player before — both well aware of each other today.`,
    (o: string) => `A subplot to watch: a quiet rivalry with ${o}. History between these two.`,
  ],
  Medium: [
    (o: string) => `${o} and our player are at each other today — this rivalry is heating up.`,
    (o: string) => `The umpires are keeping a close eye on these two. A clear flashpoint.`,
  ],
  High:   [
    (o: string) => `There is genuine anger between our player and ${o}. The crowd loves it.`,
    (o: string) => `${o} has had a word — and it has not gone unnoticed.`,
  ],
  Heated: [
    (o: string) => `These two are at boiling point — the officials have been warned.`,
    (o: string) => `Absolute hatred on that field between our player and ${o}. This WILL spill over.`,
  ],
},

RIVALRY_RESOLUTION: {
  playerWon: [
    (o: string) => `Got the better of ${o} today — the rivalry points go our way.`,
    (o: string) => `A statement performance against ${o}. Won't be forgotten.`,
  ],
  oppWon: [
    (o: string) => `${o} had the last laugh. The rivalry heats up another notch.`,
    (o: string) => `${o} controlled this matchup. A response will be needed.`,
  ],
  even: [
    (o: string) => `Honours even today against ${o}. This rivalry is far from over.`,
  ],
},
```

**Important TypeScript note:** The `CHAIN_*` arrays contain function values `(a: string, b: string) => string` not plain strings. The `RIVALRY_BUILDUP` and `RIVALRY_RESOLUTION` entries are nested objects. TypeScript will infer `PHRASES` as a mixed-type object — this is fine as long as you access these fields explicitly (e.g. `PHRASES.CHAIN_KICK_TO_GOAL[0](kicker, scorer)`) rather than iterating over all phrase arrays generically.

---

### 4.4 Add player name helpers inside `calculateMatchOutcome`

Add these immediately after the `playerTeamId` and `playerTeamCulture` declarations at the top of `calculateMatchOutcome` (before the tactic modifiers block):

```typescript
// Player name helpers — used by chain events and synergy/rivalry commentary
const playerTeamPlayers = (isHome ? homeTeam : awayTeam).players;
const opponentPlayers   = (isHome ? awayTeam : homeTeam).players;

// Returns a random teammate's name (never the user player's own name)
const pickTeammate = (): string => {
  const filtered = playerTeamPlayers.filter(p => p.name !== player.name);
  if (filtered.length === 0) return playerTeamPlayers[0]?.name ?? 'A teammate';
  return filtered[Math.floor(Math.random() * filtered.length)].name;
};

// Returns a random opponent player's name
const pickOpponent = (): string => {
  if (opponentPlayers.length === 0) return 'An opponent';
  return opponentPlayers[Math.floor(Math.random() * opponentPlayers.length)].name;
};
```

---

### 4.5 Add matchCtx after pressureLevel is computed

The `pressureLevel` variable is already computed in the existing code (section `-- 0.6 MATCH-DAY PRESSURE SYSTEM --`). Add the following **immediately after** the `pressureLevel` block (after the closing brace of the `if (isGrandFinal)...` chain):

```typescript
// -- TEAM BATTLE ENGINE --
// Build match context from the three pre-match battles.
// Pass pressureLevel (already computed above) so the context stays in sync.
const matchCtx: MatchContext = buildMatchContext(homeTeam, awayTeam, player, pressureLevel);
const battleReport: string[] = generateBattleReport(matchCtx, homeTeam.name, awayTeam.name);

// Translate battle outcomes into scoring probability modifiers.
// These accumulate ON TOP OF the tactic modifiers already set above.

// 1. Team quality differential — stronger team scores slightly more
let teamQualityModifier = matchCtx.ratingDifferential * 0.004; // ±0.02 per 5-point diff
if (!isHome) teamQualityModifier *= -1;  // flip perspective for away player

// 2. Contested possession winner gets a clearance/inside-50 rate bonus
const possessionBonus =
  matchCtx.contestedPossessionWinner === (isHome ? 'HOME' : 'AWAY') ? 0.06 :
  matchCtx.contestedPossessionWinner === 'EVEN' ? 0 :
  -0.04;

// 3. Chemistry synergy — the wire between chemistryUtils and simulationUtils
// Converts the ±20 synergyDelta into a ±0.20 scoring probability modifier
const chemistryBonus = isHome
  ? matchCtx.synergyDelta / 100
  : -matchCtx.synergyDelta / 100;

// Apply all to the existing playerScoringBonus
playerScoringBonus += teamQualityModifier + possessionBonus + chemistryBonus;

// 4. Defence advantage reduces opponent scoring rate
if (matchCtx.defenceAdvantage === (isHome ? 'HOME' : 'AWAY')) {
  opponentScoringPenalty += 0.08;   // our defence is better — they score less
} else if (matchCtx.defenceAdvantage === (isHome ? 'AWAY' : 'HOME')) {
  opponentScoringPenalty -= 0.04;   // opponent defence is better — we score less
}
```

---

### 4.6 Replace upfront injury roll with per-quarter dynamic risk

**Remove** the existing single upfront injury block (currently between `-- 1. INJURY CHECK --` and `-- 2. DECIDE PLAYER STATS FIRST --`):

```typescript
// REMOVE THIS ENTIRE BLOCK:
// -- 1. INJURY CHECK --
// let injuryData: PlayerInjury | undefined = undefined;
// let injuryQuarter = 0;
// const injuryChance = 0.015 + personalityInjuryMod;
// if (Math.random() < injuryChance) { ... }
```

**Replace with** declarations only (the roll happens inside the quarter loop):

```typescript
// -- 1. INJURY SETUP (rolled per-quarter, not upfront) --
let injuryData: PlayerInjury | undefined = undefined;
let injuryQuarter = 0;
const baseInjuryRisk = 0.015 + personalityInjuryMod; // personality-adjusted base risk

// Helper: compute per-quarter injury risk based on fatigue, contact, and pressure
const computeQuarterInjuryRisk = (
  fatigueMod: number,       // current fatigue multiplier 0.65–1.0 (lower = more fatigued)
  contactCount: number,     // number of TACKLE + FREE_KICK events generated this quarter
  pressureRating: number    // 0–3 from matchCtx
): number => {
  const fatigueFactor  = 1 + (1 - fatigueMod) * 1.5;   // up to 1.53× at zero energy
  const contactFactor  = 1 + contactCount * 0.003;       // +0.3% per contact event
  const pressureFactor = 1 + pressureRating * 0.01;      // +1% per pressure level
  return baseInjuryRisk * fatigueFactor * contactFactor * pressureFactor;
};
```

---

### 4.7 Add fatigue decay model

Add this block immediately after the injury setup (before the `-- 2. DECIDE PLAYER STATS FIRST --` comment):

```typescript
// -- FATIGUE DECAY MODEL --
// Computes a per-quarter performance multiplier based on starting energy.
// At full energy all four quarters run at 1.0.
// At zero energy the multiplier floor is 0.65 — the player still contributes but fades.
// Personality affects how fast the player tires:
//   PROFESSIONAL / LEADER — slowest decay
//   WARRIOR / FLAIR        — fastest decay
const computeQuarterFatigueMods = (
  startingEnergy: number,
  personality: PlayerPersonality | undefined
): number[] => {
  const decayRates: Partial<Record<string, number>> = {
    PROFESSIONAL: 0.011,
    LEADER:       0.012,
    ENIGMA:       0.014,
    FLAIR:        0.015,
    WARRIOR:      0.017,
  };
  const decayRate = decayRates[personality ?? ''] ?? 0.013;

  const mods: number[] = [];
  let energy = Math.max(0, Math.min(100, startingEnergy));

  for (let q = 1; q <= 4; q++) {
    // Performance multiplier: 1.0 at full energy, 0.65 at zero
    mods.push(0.65 + (energy / 100) * 0.35);

    // Energy cost increases each quarter (accumulating fatigue)
    // Quarter 1: ~11–16, Quarter 2: ~14–19, Quarter 3: ~17–22, Quarter 4: ~20–25
    const quarterCost = 8 + (q * 3) + Math.floor(Math.random() * 6);
    energy = Math.max(0, energy - quarterCost);
  }

  return mods;
};

const quarterFatigueMods = computeQuarterFatigueMods(player.energy, personality);

// Approximate total energy used (for return in MatchResult.energyUsed)
// More accurate than the flat random cost used previously
const approxEnergyUsed = Math.min(
  player.energy,
  Math.round(quarterFatigueMods.reduce((sum, mod) => sum + (1 - mod) * 60, 0))
);
```

---

### 4.8 Apply fatigue mods in the quarter loop

Inside the `for(let q=1; q<=4; q++)` loop, immediately after the `const playerActive = ...` line, add:

```typescript
const fatigueMod = quarterFatigueMods[q - 1]; // 0.65–1.0 for this quarter
```

Then in the player stat raw calculation section (`-- 2. DECIDE PLAYER STATS FIRST --`), the raw values are already pre-computed outside the loop. The fatigue effect is applied when distributing them per quarter. In the quarter disposal distribution line, multiply by `fatigueMod`:

```typescript
// Current line:
// const qDisposals = Math.floor(remainingPlayerDisposals / ((injuryQuarter || 5) - q));

// Replace with fatigue-adjusted version:
const baseQDisposals = Math.floor(remainingPlayerDisposals / Math.max(1, (injuryQuarter || 5) - q));
const qDisposals     = Math.floor(baseQDisposals * fatigueMod);
```

Similarly for tackles and goal probability per quarter, apply fatigue:
```typescript
// After qTackles is computed, clamp by fatigueMod
const qTacklesAdjusted = Math.floor(qTackles * fatigueMod);
```

---

### 4.9 Add per-quarter injury roll inside the quarter loop

In the quarter loop, after all player events are generated (after the position-specific event block) and BEFORE the filler event loop, add the injury check:

```typescript
// -- DYNAMIC INJURY RISK CHECK (per quarter) --
// Only rolls if the player has not already been injured this match
if (!injuryData && playerActive) {
  // Count contact events already generated for this quarter
  const contactThisQuarter = events.filter(
    e => e.type === 'TACKLE' || e.type === 'FREE_KICK'
  ).length;

  const quarterRisk = computeQuarterInjuryRisk(
    fatigueMod,
    contactThisQuarter,
    matchCtx.pressureRating
  );

  if (Math.random() < quarterRisk) {
    const injType = INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)];
    injuryData = { name: injType.name, weeksRemaining: injType.weeks };
    injuryQuarter = q;

    events.push({
      quarter: q,
      time: nextTime(), // use the slot-based time (see 4.10)
      description: `${player.name} has gone down clutching their leg! Looks like a ${injType.name}. They are being helped off the ground.`,
      type: 'INJURY',
      isPlayerInvolved: true,
      teamId: playerTeamId,
    });
  }
}
```

---

### 4.10 Add timestamp slot system to the quarter loop

At the start of the `for(let q=1; q<=4; q++)` loop body, before `const playerActive`, add:

```typescript
// Pre-generate unique MM:SS timestamps for this quarter
// Over-allocate to 26 slots — unused slots are simply not consumed
const quarterTimeSlots = generateQuarterTimestamps(26);
let timeSlotIdx = 0;
const nextTime = (): string =>
  quarterTimeSlots[timeSlotIdx++] ?? `${Math.min(20, timeSlotIdx)}:30`;
```

Then replace **every occurrence** of:
```typescript
time: `${Math.floor(Math.random()*minutes)+1}:00`
```
and:
```typescript
time: `${Math.floor(Math.random() * 5) + 15}:00`
```
with:
```typescript
time: nextTime()
```

This affects: player goal events, player behind events, player disposal events, player tackle events, player mark events, injury event, position-specific events, and all filler events.

Also remove the sort at the end of each quarter (currently `events.sort((a,b) => parseInt(a.time) - parseInt(b.time))`). Events are now generated in chronological order by construction — the sort is no longer needed. You may leave it as a safety measure if preferred, but note `parseInt('07:23')` returns `7` (correct) whereas `parseInt('20:00')` returns `20` — the sort still works correctly on the minute component.

---

### 4.11 Add `selectContextualPhrase` helper

Add this helper function inside `calculateMatchOutcome`, just before the quarter loop. It selects the appropriate GENERIC phrase pool based on the current game state:

```typescript
// Returns a contextually appropriate GENERIC phrase based on current match state.
// Parameters:
//   quarter          — current quarter (1–4)
//   scoreDiff        — approximate score difference (positive = player's team leading)
//   momentum         — homeMomentum value at this point in the quarter (-10 to +10)
//   isFinals         — whether this is a finals match
//   minuteInQuarter  — approximate minute into the quarter (from the nextTime() call)
const selectContextualPhrase = (
  quarter: number,
  scoreDiff: number,
  momentum: number,
  isFinals: boolean,
  minuteInQuarter: number
): string => {
  const absScore       = Math.abs(scoreDiff);
  const isLastQuarter  = quarter === 4;
  const isLateGame     = minuteInQuarter >= 16;

  // Finals tension takes priority
  if (isFinals && Math.random() < 0.35) {
    return PHRASES.FINALS_TENSION[Math.floor(Math.random() * PHRASES.FINALS_TENSION.length)];
  }

  // Late Q4, within a kick — maximum tension
  if (isLastQuarter && isLateGame && absScore <= 18) {
    return PHRASES.LATE_PRESSURE[Math.floor(Math.random() * PHRASES.LATE_PRESSURE.length)];
  }

  // Blowout — different flavour depending on who's winning
  if (absScore > 48) {
    const pool = scoreDiff > 0 ? PHRASES.BLOWOUT_HOME : PHRASES.BLOWOUT_AWAY;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Comeback — team was behind but momentum is swinging back
  if (momentum < -4 && scoreDiff > 0) {
    return PHRASES.COMEBACK[Math.floor(Math.random() * PHRASES.COMEBACK.length)];
  }

  // Default — culture-specific crowd phrase or generic
  const culturePhrases = playerTeamCulture
    ? CROWD_PHRASES_BY_CULTURE[playerTeamCulture]
    : undefined;
  const pool = culturePhrases?.length
    ? culturePhrases
    : PHRASES.ATMOSPHERE.length > 0
      ? PHRASES.ATMOSPHERE
      : PHRASES.GENERIC;
  return pool[Math.floor(Math.random() * pool.length)];
};
```

---

### 4.12 Replace the filler event loop

**Remove** the existing `for(let i=0; i<fillerNeeded; i++)` loop entirely and replace it with the following chain-aware, expanded-distribution loop. The replacement starts from where the `fillerNeeded` variable is declared and replaces through the closing `}` of the old for-loop.

```typescript
// --- FILLER / CHAIN EVENT GENERATION ---
// Target: 18–24 events per quarter (up from 12–15)
const targetEventCount = Math.floor(Math.random() * 7) + 18;
const fillerNeeded     = Math.max(0, targetEventCount - events.length);

// Running score diff for contextual phrase selection
const currentPlayerScore = isHome
  ? homeGoals * 6 + homeBehinds
  : awayGoals * 6 + awayBehinds;
const currentOppScore = isHome
  ? awayGoals * 6 + awayBehinds
  : homeGoals * 6 + homeBehinds;
let runningScoreDiff = currentPlayerScore - currentOppScore;

let fillerGenerated = 0;

while (fillerGenerated < fillerNeeded) {
  // ── CHAIN EVENT (30% chance, only if budget remains for 2 events) ──
  const isChainedPlay = Math.random() < 0.30 && fillerGenerated < fillerNeeded - 1;

  if (isChainedPlay) {
    const chainRoll = Math.random();

    if (chainRoll < 0.28) {
      // KICK-TO-GOAL CHAIN
      const kicker    = Math.random() < 0.40 ? player.name : pickTeammate();
      const scorer    = pickTeammate();
      const templates = PHRASES.CHAIN_KICK_TO_GOAL as Array<(k: string, g: string) => string>;
      const tpl       = templates[Math.floor(Math.random() * templates.length)];

      events.push({
        quarter: q, time: nextTime(),
        description: `${kicker} drives it long inside 50.`,
        type: 'POSSESSION', isPlayerInvolved: kicker === player.name, teamId: playerTeamId,
      });
      events.push({
        quarter: q, time: nextTime(),
        description: tpl(kicker, scorer),
        type: 'GOAL', isPlayerInvolved: scorer === player.name, teamId: playerTeamId,
      });
      if (isHome) homeGoals++; else awayGoals++;
      runningScoreDiff += 6;
      fillerGenerated += 2;

    } else if (chainRoll < 0.52) {
      // TACKLE-TURNOVER CHAIN
      const tackler    = pickOpponent();
      const victim     = Math.random() < 0.50 ? player.name : pickTeammate();
      const templates  = PHRASES.CHAIN_TACKLE_TURNOVER as Array<(t: string, v: string) => string>;
      const tpl        = templates[Math.floor(Math.random() * templates.length)];
      const oppTeamId  = isHome ? awayTeam.id : homeTeam.id;
      const followType = Math.random() < 0.35 ? 'GOAL' : 'POSSESSION';

      events.push({
        quarter: q, time: nextTime(),
        description: tpl(tackler, victim),
        type: 'TACKLE', isPlayerInvolved: victim === player.name, teamId: oppTeamId,
      });
      events.push({
        quarter: q, time: nextTime(),
        description: followType === 'GOAL'
          ? `${tackler} converts the opportunity — GOAL!`
          : `${tackler} wins it and drives forward under pressure.`,
        type: followType as MatchEvent['type'], isPlayerInvolved: false, teamId: oppTeamId,
      });
      if (followType === 'GOAL') {
        if (isHome) awayGoals++; else homeGoals++;
        runningScoreDiff -= 6;
      }
      fillerGenerated += 2;

    } else if (chainRoll < 0.72) {
      // RUCK-CLEARANCE CHAIN
      const ruckman = playerTeamPlayers.find(p => p.subPosition === 'RUCK')?.name ?? pickTeammate();
      const mid     = pickTeammate();
      const templates = PHRASES.CHAIN_RUCK_CLEARANCE as Array<(r: string, m: string) => string>;
      const tpl     = templates[Math.floor(Math.random() * templates.length)];

      events.push({
        quarter: q, time: nextTime(),
        description: tpl(ruckman, mid),
        type: 'HIT_OUT',
        isPlayerInvolved: ruckman === player.name || mid === player.name,
        teamId: playerTeamId,
      });
      fillerGenerated += 1;

    } else {
      // INTERCEPT-TO-FORWARD CHAIN
      const def = playerTeamPlayers.find(p =>
        p.subPosition === 'HBF' || p.subPosition === 'FB'
      )?.name ?? pickTeammate();
      const fwd = pickTeammate();
      const templates = PHRASES.CHAIN_INTERCEPT_FORWARD as Array<(d: string, f: string) => string>;
      const tpl = templates[Math.floor(Math.random() * templates.length)];

      events.push({
        quarter: q, time: nextTime(),
        description: tpl(def, fwd),
        type: 'INTERCEPT',
        isPlayerInvolved: def === player.name || fwd === player.name,
        teamId: playerTeamId,
      });
      fillerGenerated += 1;
    }

  } else {
    // ── SINGLE FILLER EVENT — expanded type distribution ──
    const isHomeEvent  = Math.random() > 0.5;
    const actingTeam   = isHomeEvent ? homeTeam : awayTeam;
    const actingTeamId = actingTeam.id;

    const teammates    = actingTeam.players.filter(p => p.name !== player.name);
    const randomPlayer = teammates[Math.floor(Math.random() * teammates.length)];
    const actorName    = randomPlayer ? randomPlayer.name : actingTeam.name;

    // Rating-aware goal threshold (v1.5 — replaces fixed 0.25)
    const isOpponentEvent      = actingTeam.id !== playerTeamId;
    const opponentRatingBonus  = (matchCtx.ratingDifferential * -0.003);
    const baseOpponentThreshold = 0.25 + (isHome ? opponentRatingBonus : -opponentRatingBonus);
    const goalThreshold = isOpponentEvent
      ? Math.max(0.04, baseOpponentThreshold * (1 - opponentScoringPenalty))
      : Math.max(0.10, 0.25 + (isHome ? -opponentRatingBonus : opponentRatingBonus) + playerScoringBonus * 0.5);

    // Momentum adjustment (±0.05 max)
    const momentumAdj = homeMomentum * 0.005;
    const adjustedGoalThreshold = isHomeEvent
      ? goalThreshold + momentumAdj
      : goalThreshold - momentumAdj;

    const typeRoll = Math.random();
    let type: MatchEvent['type'] = 'GENERIC';
    let desc = '';

    if (typeRoll < adjustedGoalThreshold) {
      // GOAL
      type = 'GOAL';
      desc = `${actorName} ${PHRASES.GOAL[Math.floor(Math.random() * PHRASES.GOAL.length)]}`;
      if (isHomeEvent) homeGoals++; else awayGoals++;
      runningScoreDiff += isHomeEvent === isHome ? 6 : -6;
      if (isHomeEvent) { homeConsecutiveScores++; awayConsecutiveScores = 0; }
      else             { awayConsecutiveScores++;  homeConsecutiveScores = 0; }

    } else if (typeRoll < adjustedGoalThreshold + 0.12) {
      // BEHIND
      type = 'BEHIND';
      desc = `${actorName} ${PHRASES.BEHIND[Math.floor(Math.random() * PHRASES.BEHIND.length)]}`;
      if (isHomeEvent) homeBehinds++; else awayBehinds++;

    } else if (typeRoll < 0.42) {
      // CONTESTED — MARK, TACKLE, or STOPPAGE
      const r = Math.random();
      if (r < 0.35) {
        type = 'MARK';
        desc = `${actorName} ${PHRASES.MARK[Math.floor(Math.random() * PHRASES.MARK.length)]}`;
      } else if (r < 0.70) {
        type = 'TACKLE';
        desc = `${actorName} ${PHRASES.TACKLE[Math.floor(Math.random() * PHRASES.TACKLE.length)]}`;
      } else {
        type = 'GENERIC';
        desc = PHRASES.STOPPAGE[Math.floor(Math.random() * PHRASES.STOPPAGE.length)];
      }

    } else if (typeRoll < 0.50) {
      // RUCK CONTEST
      type = 'HIT_OUT';
      desc = PHRASES.RUCK_CONTEST[Math.floor(Math.random() * PHRASES.RUCK_CONTEST.length)];

    } else if (typeRoll < 0.58) {
      // TURNOVER
      type = 'TURNOVER';
      desc = `${actorName} ${PHRASES.TURNOVER[Math.floor(Math.random() * PHRASES.TURNOVER.length)]}`;

    } else if (typeRoll < 0.64) {
      // FREE KICK
      type = 'FREE_KICK';
      desc = `${actorName} ${PHRASES.FREE_KICK[Math.floor(Math.random() * PHRASES.FREE_KICK.length)]}`;

    } else if (typeRoll < 0.74) {
      // POSSESSION / TRANSITION / FORWARD PRESSURE
      type = 'POSSESSION';
      const r = Math.random();
      if (r < 0.40)      desc = `${actorName} ${PHRASES.POSSESSION[Math.floor(Math.random() * PHRASES.POSSESSION.length)]}`;
      else if (r < 0.70) desc = PHRASES.MIDFIELD_BATTLE[Math.floor(Math.random() * PHRASES.MIDFIELD_BATTLE.length)];
      else               desc = PHRASES.FORWARD_PRESSURE[Math.floor(Math.random() * PHRASES.FORWARD_PRESSURE.length)];

    } else if (typeRoll < 0.82) {
      // DEFENSIVE PRESSURE
      type = 'GENERIC';
      desc = PHRASES.DEFENSIVE_PRESSURE[Math.floor(Math.random() * PHRASES.DEFENSIVE_PRESSURE.length)];

    } else if (typeRoll < 0.87) {
      // UMPIRE MOMENT
      type = 'FREE_KICK';
      desc = PHRASES.UMPIRE[Math.floor(Math.random() * PHRASES.UMPIRE.length)];

    } else if (typeRoll < 0.91 && (currentRound <= 6 || currentRound >= 11)) {
      // CONDITIONS (early/late season only — rounds 1–6 and 11+)
      type = 'GENERIC';
      desc = PHRASES.CONDITIONS[Math.floor(Math.random() * PHRASES.CONDITIONS.length)];

    } else if (typeRoll < 0.96) {
      // ATMOSPHERE / CROWD (culture-aware)
      type = 'GENERIC';
      const minuteApprox = parseInt(quarterTimeSlots[Math.max(0, timeSlotIdx - 1)]?.split(':')[0] ?? '10');
      desc = selectContextualPhrase(q, runningScoreDiff, homeMomentum, isFinals, minuteApprox);

    } else {
      // BRILLIANCE (rare ~4%) — replaces the old hardcoded one-liner
      type = 'GENERIC';
      desc = `UNBELIEVABLE! ${actorName} — ${PHRASES.BRILLIANCE[Math.floor(Math.random() * PHRASES.BRILLIANCE.length)]}`;
    }

    events.push({
      quarter: q, time: nextTime(),
      description: desc, type,
      isPlayerInvolved: false, teamId: actingTeamId,
    });
    fillerGenerated += 1;
  }
}

// ── REMOVE the old hardcoded brilliance check — it is now inside the loop above ──
// DELETE: if (Math.random() > 0.95) { desc = `UNBELIEVABLE!...`; }
```

---

### 4.13 Add synergy commentary event (once per match, Q2+)

Add this block immediately after the filler loop (before the momentum calculation section):

```typescript
// -- SYNERGY COMMENTARY EVENT --
// Fires at most once per match, in Q2 or later, when the player has a BEST_MATE
// or an ENEMY/RIVAL teammate relationship.
const hasFiredSynergy = timeline.some(e =>
  e.description.includes('telepathic') || e.description.includes('miscommunication') ||
  e.description.includes('same page')
);

if (!hasFiredSynergy && q >= 2 && player.teammates && Math.random() < 0.25) {
  const bestMate = player.teammates.find(t => t.status === 'BEST_MATE');
  const negRel   = player.teammates.find(t => t.status === 'ENEMY' || t.status === 'RIVAL');

  if (negRel && Math.random() < 0.40) {
    const templates = PHRASES.CHAIN_SYNERGY_NEGATIVE as Array<(a: string, b: string) => string>;
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    events.push({
      quarter: q, time: nextTime(),
      description: tpl(player.name, negRel.name),
      type: 'GENERIC', isPlayerInvolved: true, teamId: playerTeamId,
    });
  } else if (bestMate) {
    const templates = PHRASES.CHAIN_SYNERGY_POSITIVE as Array<(a: string, b: string) => string>;
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    events.push({
      quarter: q, time: nextTime(),
      description: tpl(player.name, bestMate.name),
      type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId,
    });
  }
}
```

---

### 4.14 Add rivalry commentary events

**Find the active rivalry** — add this declaration block right after the `pickTeammate` and `pickOpponent` helpers (section 4.4), before the tactic modifiers:

```typescript
// Identify if there is an active (non-resolved) rivalry against today's opponent
const opponentTeamName = isHome ? awayTeam.name : homeTeam.name;
const activeRivalry = player.rivalries?.find(
  r => r.club === opponentTeamName && !r.resolved
);
```

**Quarter 1 rivalry buildup** — add this block in the Q1 iteration, after the injury/synergy blocks but before the filler loop. Guard with `if (q === 1 && activeRivalry)`:

```typescript
if (q === 1 && activeRivalry) {
  const intensity = activeRivalry.intensity as keyof typeof PHRASES.RIVALRY_BUILDUP;
  const pool      = PHRASES.RIVALRY_BUILDUP[intensity] ?? PHRASES.RIVALRY_BUILDUP.Low;
  const buildupPhrases = pool as Array<(o: string) => string>;
  const tpl = buildupPhrases[Math.floor(Math.random() * buildupPhrases.length)];

  events.push({
    quarter: 1, time: nextTime(),
    description: tpl(activeRivalry.opponentName),
    type: 'RIVALRY', isPlayerInvolved: true, teamId: playerTeamId,
  });
}
```

**Quarter 4 rivalry resolution** — add this block at the very end of the quarter 4 iteration, after the filler loop and synergy block but BEFORE the momentum calculation. Guard with `if (q === 4 && activeRivalry)`:

```typescript
if (q === 4 && activeRivalry) {
  const playerTeamTotalScore = isHome
    ? homeGoals * 6 + homeBehinds
    : awayGoals * 6 + awayBehinds;
  const opponentTotalScore = isHome
    ? awayGoals * 6 + awayBehinds
    : homeGoals * 6 + homeBehinds;

  let resPool: Array<(o: string) => string>;
  if (playerTeamTotalScore > opponentTotalScore) {
    resPool = PHRASES.RIVALRY_RESOLUTION.playerWon as Array<(o: string) => string>;
  } else if (opponentTotalScore > playerTeamTotalScore) {
    resPool = PHRASES.RIVALRY_RESOLUTION.oppWon as Array<(o: string) => string>;
  } else {
    resPool = PHRASES.RIVALRY_RESOLUTION.even as Array<(o: string) => string>;
  }

  const tpl = resPool[Math.floor(Math.random() * resPool.length)];
  events.push({
    quarter: 4, time: nextTime(),
    description: tpl(activeRivalry.opponentName),
    type: 'RIVALRY', isPlayerInvolved: true, teamId: playerTeamId,
  });
}
```

---

### 4.15 Fix three existing stat bugs

These are bugs in the current code that produce incorrect data. Fix all three.

**Bug 1 — `clearances` overwrites each quarter (only Q4 survives)**

Current code (inside the quarter loop):
```typescript
pStats.clearances = Math.floor(qDisposals * 0.3);
```

Replace with:
```typescript
pStats.clearances = (pStats.clearances ?? 0) + Math.floor(qDisposals * 0.3);
```

**Bug 2 — `kicks + handballs ≠ disposals`**

After the quarter loop ends (after the `for(let q=1; q<=4; q++)` closing brace), add:

```typescript
// Normalise kicks + handballs to sum exactly to pStats.disposals
const kh = (pStats.kicks ?? 0) + (pStats.handballs ?? 0);
if (kh > 0 && kh !== pStats.disposals) {
  const ratio       = pStats.disposals / kh;
  pStats.kicks      = Math.round((pStats.kicks ?? 0) * ratio);
  pStats.handballs  = pStats.disposals - pStats.kicks;
}
```

**Bug 3 — forward multiplier applied AFTER Brownlow**

Current code (after the quarter loop):
```typescript
// Forward position stat multiplier  ← currently here, AFTER the Brownlow block
if (player.position === Position.FORWARD && pStats.goals > 0) {
    pStats.goals = Math.round(pStats.goals * 1.1);
}
```

Move this entire block to BEFORE the `// -- BROWNLOW 3-2-1 VOTE CALCULATION --` comment so goals fed into the Brownlow calculation include the forward bonus.

---

### 4.16 Add context-aware AI disposal generation

In the teammate and opponent top-performer stat generation, add a win/loss context modifier so the winning team's players reflect higher disposal counts:

```typescript
// After the quarter loop, before topPerformers construction:
const playerTeamTotalFinal = isHome
  ? (finalHomeGoals * 6 + finalHomeBehinds)
  : (finalAwayGoals * 6 + finalAwayBehinds);
const opponentTotalFinal = isHome
  ? (finalAwayGoals * 6 + finalAwayBehinds)
  : (finalHomeGoals * 6 + finalHomeBehinds);
const playerTeamWonFinal = playerTeamTotalFinal > opponentTotalFinal;

// In the teammate disposal generation:
const winnerDisposalBonus = playerTeamWonFinal ? 2 : -2;
const teammateDisposals   = Math.max(5, baseDisposals + ratingBonus + winnerDisposalBonus);

// In the opponent disposal generation:
const oppDisposals = Math.max(5, baseDisposals + ratingBonus - winnerDisposalBonus);
```

---

### 4.17 Update the return statement

The final `return` at the bottom of `calculateMatchOutcome` currently returns:
```typescript
return {
  homeScore: { ... },
  awayScore: { ... },
  winnerId: ...,
  playerStats: pStats,
  summary: "",
  timeline,
  newRivalry,
  playerInjury: injuryData,
  topPerformers,
  energyUsed: totalEnergyUsed,
  tactic
};
```

Replace `totalEnergyUsed` with `approxEnergyUsed` (from the fatigue model), replace `summary: ""` with the battle report, and add the two new optional fields:

```typescript
return {
  homeScore: { goals: finalHomeGoals, behinds: finalHomeBehinds, total: hTotal, quarters: hQScores },
  awayScore: { goals: finalAwayGoals, behinds: finalAwayBehinds, total: aTotal, quarters: aQScores },
  winnerId: hTotal > aTotal ? homeTeam.id : aTotal > hTotal ? awayTeam.id : null,
  playerStats: pStats,
  summary: battleReport.join(' '),   // human-readable battle summary
  timeline,
  newRivalry,
  playerInjury: injuryData,
  topPerformers,
  energyUsed: approxEnergyUsed,      // from fatigue model — replaces totalEnergyUsed
  tactic,
  matchContext: matchCtx,            // NEW — optional field added to MatchResult in types.ts
  battleReport,                      // NEW — optional field added to MatchResult in types.ts
};
```

---

## 5. Update `context/GameContext.tsx` — highlight selection

The `selectHighlights` lambda inside `commitMatchResult` currently uses a simple priority function. Update it to use `contextHighlightScore` from `matchEngineUtils`:

**Add import at the top of `GameContext.tsx`:**
```typescript
import { contextHighlightScore } from '../utils/matchEngineUtils';
```

**Replace the existing `selectHighlights` function inside `commitMatchResult`:**
```typescript
// Current code to replace:
// const selectHighlights = (events: MatchEvent[]): MatchEvent[] => {
//   const priority = (e: MatchEvent): number => { ... }
//   return [...events].sort((a, b) => priority(b) - priority(a)).slice(0, 5);
// };

// Replace with:
const selectHighlights = (events: MatchEvent[]): MatchEvent[] => {
  const isFinals = currentRound > 14;
  let runningDiff = 0;

  return [...events]
    .map(e => {
      // Maintain a running score diff for context scoring
      if (e.type === 'GOAL') {
        const isPlayerTeamGoal = e.teamId === player?.contract?.clubName; // approximate
        runningDiff += isPlayerTeamGoal ? 6 : -6;
      }
      return {
        event: e,
        score: contextHighlightScore(e, e.quarter, runningDiff, isFinals),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(x => x.event);
};
```

---

## 6. Complete testing checklist

Run these checks before considering v1.5 complete.

### 6.1 Build verification
- [ ] `npm run build` exits code 0 with zero TypeScript errors
- [ ] `matchEngineUtils.ts` compiles cleanly with no implicit `any` types
- [ ] No "cannot find module" errors for the new import in `simulationUtils.ts`
- [ ] The new `MatchContext` interface in `types.ts` causes no downstream type errors

### 6.2 Timestamp correctness
- [ ] Open Safari DevTools while a match is playing in the Simulator
- [ ] Inspect the `timeline` array in the match result — all `time` values are `MM:SS` format
- [ ] No two events within the same quarter share the same `MM:SS` value
- [ ] No event has a time value ending in `:00`
- [ ] Events within a quarter appear in ascending minute order

### 6.3 Score integrity
- [ ] The `summary` field on `MatchResult` is now a non-empty string (the battle report)
- [ ] Final `homeScore.total === homeScore.goals * 6 + homeScore.behinds` — always true
- [ ] `pStats.kicks + pStats.handballs === pStats.disposals` — always true after the normalisation fix
- [ ] `pStats.clearances` reflects all 4 quarters (should typically be 5–12, not ≤3)
- [ ] `matchResult.energyUsed` is positive and reasonable (10–60 range for a full 4-quarter match)

### 6.4 Team Battle Engine outputs
- [ ] `matchResult.matchContext` is defined (not undefined) on every `calculateMatchOutcome` call
- [ ] `matchResult.battleReport` is an array of 2–4 sentences
- [ ] `matchResult.summary` equals `battleReport.join(' ')` — they match
- [ ] Playing against a team rated 15+ points higher produces noticeably more opposition goals across a 14-round season (qualitative check — not a strict unit test)

### 6.5 Fatigue model
- [ ] A player starting with `energy < 20` should visibly produce fewer disposals and goals in Q3/Q4 compared to Q1/Q2 (check the `timeline` events)
- [ ] A player starting with `energy = 100` should see consistent performance across all 4 quarters with only slight decline
- [ ] WARRIOR personality drains more energy per quarter than PROFESSIONAL (check the `approxEnergyUsed` return value across multiple matches)

### 6.6 Dynamic injury risk
- [ ] Injuries are not always occurring in Q1 (the old system assigned a random quarter upfront — now risk accumulates so Q3/Q4 injuries should be more common)
- [ ] A match with many TACKLE and FREE_KICK events in the filler loop should have higher injury probability than a quiet match (qualitative check)

### 6.7 Event quality
- [ ] Chain events appear in the timeline — look for descriptions containing two player names (e.g. "Jones finds Williams on the lead")
- [ ] Kick-to-goal chain: POSSESSION event followed by GOAL event with same actor names
- [ ] Tackle-turnover chain: TACKLE event followed by POSSESSION or GOAL for the opponent
- [ ] Synergy positive event appears at least once in a career where the player has a BEST_MATE (look for "telepathic" or "combining brilliantly" in timeline descriptions)
- [ ] Rivalry buildup event appears in Q1 when facing a rivalry club — look for RIVALRY type event in Q1
- [ ] Rivalry resolution event appears at `20:xx` in Q4 when facing a rivalry club
- [ ] FINALS_TENSION, LATE_PRESSURE, COMEBACK, BLOWOUT phrases appear in appropriate match contexts
- [ ] STOPPAGE, RUCK_CONTEST, DEFENSIVE_PRESSURE, FORWARD_PRESSURE, MIDFIELD_BATTLE, UMPIRE, CONDITIONS, ATMOSPHERE, BRILLIANCE events all appear across a 14-round season playthrough
- [ ] CONDITIONS events do not appear in rounds 7–10
- [ ] BRILLIANCE events use the new 8-phrase pool, not the old hardcoded string
- [ ] The old hardcoded brilliance check (`if (Math.random() > 0.95) { desc = "UNBELIEVABLE! ... with a play of the year candidate!" }`) has been removed

### 6.8 Quarter volume
- [ ] Each quarter generates 18–26 total events (count `timeline.filter(e => e.quarter === 1).length`)
- [ ] A full match generates 72–104 total timeline events across all 4 quarters

### 6.9 Forward multiplier timing
- [ ] A forward player's goals in `pStats.goals` are inflated BEFORE Brownlow voting
- [ ] Verify by: a forward with 2 raw goals should have `pStats.goals = 2` (× 1.1 → rounded to 2) or `pStats.goals = 4` (× 1.1 → rounded to 4), and their Brownlow score should use the post-multiplier value

### 6.10 Chemistry wired correctly
- [ ] Player with `teamChemistry.overallChemistry = 90` should produce slightly higher `playerScoringBonus` than a player with `overallChemistry = 50`
- [ ] Verify: `chemistryBonus` at 90 chemistry = `(90 - 50) / 100 * 20 / 100 = +0.08`, at 50 = `0`

---

## 7. Known potential issues to watch for

These are likely TypeScript or runtime problems based on the mixed-type `PHRASES` object:

**Issue 1 — TypeScript rejects function-valued entries in `PHRASES`**

The `CHAIN_*` entries are `Array<(a: string, b: string) => string>` but the existing `PHRASES` const is typed as `{ [key: string]: string[] }` or similar. Fix: either use `as const` typing, declare `PHRASES` with an explicit `Record<string, any>` type annotation, or cast the chain arrays at point of use:

```typescript
const templates = PHRASES.CHAIN_KICK_TO_GOAL as Array<(k: string, g: string) => string>;
const tpl = templates[Math.floor(Math.random() * templates.length)];
const desc = tpl(kicker, scorer); // now correctly typed
```

**Issue 2 — `RIVALRY_BUILDUP` and `RIVALRY_RESOLUTION` are nested objects, not arrays**

When accessing them, do not treat them as arrays. Correct access:
```typescript
const pool = PHRASES.RIVALRY_BUILDUP[intensity] as Array<(o: string) => string>;
```

**Issue 3 — `isDerby` check in `calculateMatchOutcome` vs `pressureLevel`**

The existing code checks `isDerby` but uses the `player.rivalries` array. Make sure `activeRivalry` declared in 4.14 and `isDerby` in the pressure section refer to the same rivalry check. They can coexist — `isDerby` is the boolean for pressure level calculation, `activeRivalry` is the full object for commentary. Do not collapse them.

**Issue 4 — `approxEnergyUsed` vs `totalEnergyUsed`**

The `inMatchEnergy` and `totalEnergyUsed` variables in the existing code are still used during the quarter loop for the per-quarter `quarterCost` calculation. Do not remove them — they track in-match energy for the existing logic. `approxEnergyUsed` is a NEW variable computed from `quarterFatigueMods` and is only used in the return statement. Both can coexist.

**Issue 5 — `nextTime()` closure scope**

`nextTime()` is declared inside the `for` loop body (section 4.10). `quarterTimeSlots` and `timeSlotIdx` reset each quarter. This is correct — each quarter gets its own fresh timestamp pool. Do not hoist these outside the loop.
