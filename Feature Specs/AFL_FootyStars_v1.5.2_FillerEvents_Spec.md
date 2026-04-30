# 🏉 AFL Footy Stars — v1.5.2 Feature Specification
**Expanded Filler Events & MM:SS Timestamps**
*April 2026 | Prepared for Claude Code / Sub-agents*

---

## Overview

Two focused changes to `utils/simulationUtils.ts` only:

1. **Timestamps show seconds** — `MM:00` → `MM:SS`
2. **Expanded filler system** — more event types, larger phrase pools, higher event target, nine new situational categories

No changes to any other file.

---

## 1. Timestamps: `MM:SS` format

The `generateQuarterTimestamps` helper from v1.5.1 already assigns unique minutes. Extend it to append random seconds — never `:00` (too artificial):

```typescript
const generateQuarterTimestamps = (count: number): string[] => {
  if (count === 0) return [];
  const slotSize = 20 / count;
  const minutes: number[] = [];
  for (let i = 0; i < count; i++) {
    const base   = Math.floor(i * slotSize) + 1;
    const jitter = Math.floor(Math.random() * 3) - 1;
    minutes.push(Math.max(1, Math.min(20, base + jitter)));
  }
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i] <= minutes[i - 1]) minutes[i] = minutes[i - 1] + 1;
  }
  return minutes.map(m => {
    const seconds = Math.floor(Math.random() * 54) + 3; // 3–56
    return `${Math.min(20, m)}:${String(seconds).padStart(2, '0')}`;
  });
};
```

Produces timestamps like `04:23`, `07:51`, `11:08`.

If v1.5.1 is not yet applied, also replace all inline `time: \`${Math.floor(Math.random()*minutes)+1}:00\`` with `time: nextTime()`.

---

## 2. Higher quarter event target

```typescript
// Replace:
const targetEventCount = Math.floor(Math.random() * 4) + 12;  // 12–15

// With:
const targetEventCount = Math.floor(Math.random() * 7) + 18;  // 18–24

// Update timestamp pre-allocation to match:
const quarterTimeSlots = generateQuarterTimestamps(26); // buffer above 24 max
```

---

## 3. Nine new phrase pools (add to `PHRASES`)

```typescript
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
  "Tap-out to the advantage — clean start from the stoppage.",
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
```

---

## 4. Expanded existing phrase pools (append to each)

```typescript
// Append to PHRASES.GOAL (11 additions, bringing total to 18):
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

// Append to PHRASES.BEHIND (11 additions):
"screws it to the right, just misses.",
"rushes through for a behind — they'll take it.",
"kicks under pressure, clips the post.",
"a speculative snap, narrowly wide.",
"from the boundary — not enough curve, just misses.",
"a rushed behind — defender gets boot to ball.",
"point to the left — unlucky given the angle.",
"the set shot slides past on the right.",
"a dropped chest mark leads to a scrambled behind.",
"the snap from the pocket skews wide.",
"floated on the wind and drifted right.",

// Append to PHRASES.MARK (12 additions):
"soars above the pack in a marking contest!",
"leads at full pace and takes the grab.",
"holds on through heavy contact.",
"takes a one-handed screamer at full stretch!",
"times the leap perfectly, clean hands.",
"a chest mark on the lead — textbook.",
"contested grab through a thicket of arms.",
"a pack mark — grabbed it on the third attempt.",
"outstanding positioning from the pocket player.",
"gloves it overhead — barely touched.",
"high above the pack — total dominance.",
"a courageous overhead in traffic.",

// Append to PHRASES.TACKLE (11 additions):
"brings them to ground with a textbook smother.",
"chases 40 metres and pulls off the run-down tackle.",
"wraps the arms at full pace.",
"stands them up and strips the ball.",
"smothers the kick — blocks it with a closed hand.",
"trips them on the turn — free kick paid.",
"cleans them up after the kick — they won't forget that.",
"forces a holding infringement — heads to goal.",
"a two-man tackle — neither team gets credit.",
"a shepherd leads to a soft holding call.",
"tackles from behind — play on says the umpire.",

// Append to PHRASES.POSSESSION (11 additions):
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

// Append to PHRASES.TURNOVER (10 additions):
"a poor decision — hands it back.",
"boots it out on the full.",
"dithers too long and is dispossessed.",
"kicks across the body — intercepted.",
"the handball is too high — no one gets near it.",
"runs into traffic and drops the ball.",
"chips it short — straight to the opposition.",
"a hospital handball — nobody wanted that.",
"rushed under pressure, straight to the opponent.",
"tries to beat his man and loses the ball.",

// Append to PHRASES.FREE_KICK (10 additions):
"trips the player on the mark.",
"ball in the back — free kick paid.",
"the protected area is pinged — 50 metre penalty!",
"milks a free kick and plays on immediately.",
"contact high — the umpire doesn't hesitate.",
"raking it in the back of the pack — obvious free.",
"a deliberate out of bounds decision — free kick.",
"prior opportunity adjudicated — holding the ball.",
"the third time for high contact — free kick paid.",
"deliberate rushed behind — free kick on the goal line.",

// Append to PHRASES.GENERIC (12 additions):
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

---

## 5. Updated filler event type distribution

Replace the existing type-roll bucketing in the single-event filler section with an expanded distribution that uses all new pools:

```typescript
const typeRoll = Math.random();

if (typeRoll < adjustedGoalThreshold) {
  // GOAL (~variable, ~18%)
  type = 'GOAL'; desc = `${actorName} ${PHRASES.GOAL[Math.floor(Math.random() * PHRASES.GOAL.length)]}`;
  // ... increment score, momentum

} else if (typeRoll < adjustedGoalThreshold + 0.12) {
  // BEHIND (~12%)
  type = 'BEHIND'; desc = `${actorName} ${PHRASES.BEHIND[Math.floor(Math.random() * PHRASES.BEHIND.length)]}`;
  // ... increment behinds

} else if (typeRoll < 0.42) {
  // CONTESTED (~18%): MARK, TACKLE, or STOPPAGE
  const r = Math.random();
  if (r < 0.35)      { type = 'MARK';    desc = `${actorName} ${PHRASES.MARK[Math.floor(Math.random() * PHRASES.MARK.length)]}`; }
  else if (r < 0.70) { type = 'TACKLE';  desc = `${actorName} ${PHRASES.TACKLE[Math.floor(Math.random() * PHRASES.TACKLE.length)]}`; }
  else               { type = 'GENERIC'; desc = PHRASES.STOPPAGE[Math.floor(Math.random() * PHRASES.STOPPAGE.length)]; }

} else if (typeRoll < 0.50) {
  // RUCK CONTEST (~8%)
  type = 'HIT_OUT'; desc = PHRASES.RUCK_CONTEST[Math.floor(Math.random() * PHRASES.RUCK_CONTEST.length)];

} else if (typeRoll < 0.58) {
  // TURNOVER (~8%)
  type = 'TURNOVER'; desc = `${actorName} ${PHRASES.TURNOVER[Math.floor(Math.random() * PHRASES.TURNOVER.length)]}`;

} else if (typeRoll < 0.64) {
  // FREE KICK (~6%)
  type = 'FREE_KICK'; desc = `${actorName} ${PHRASES.FREE_KICK[Math.floor(Math.random() * PHRASES.FREE_KICK.length)]}`;

} else if (typeRoll < 0.74) {
  // POSSESSION / TRANSITION (~10%): possession, midfield, or forward pressure
  type = 'POSSESSION';
  const r = Math.random();
  if (r < 0.40)      desc = `${actorName} ${PHRASES.POSSESSION[Math.floor(Math.random() * PHRASES.POSSESSION.length)]}`;
  else if (r < 0.70) desc = PHRASES.MIDFIELD_BATTLE[Math.floor(Math.random() * PHRASES.MIDFIELD_BATTLE.length)];
  else               desc = PHRASES.FORWARD_PRESSURE[Math.floor(Math.random() * PHRASES.FORWARD_PRESSURE.length)];

} else if (typeRoll < 0.82) {
  // DEFENSIVE PRESSURE (~8%)
  type = 'GENERIC'; desc = PHRASES.DEFENSIVE_PRESSURE[Math.floor(Math.random() * PHRASES.DEFENSIVE_PRESSURE.length)];

} else if (typeRoll < 0.87) {
  // UMPIRE MOMENT (~5%)
  type = 'FREE_KICK'; desc = PHRASES.UMPIRE[Math.floor(Math.random() * PHRASES.UMPIRE.length)];

} else if (typeRoll < 0.91 && (currentRound <= 6 || currentRound >= 11)) {
  // CONDITIONS (rare, ~4%, early/late season only)
  type = 'GENERIC'; desc = PHRASES.CONDITIONS[Math.floor(Math.random() * PHRASES.CONDITIONS.length)];

} else if (typeRoll < 0.96) {
  // ATMOSPHERE / CROWD (~5%)
  type = 'GENERIC';
  const culturePhrases = playerTeamCulture ? CROWD_PHRASES_BY_CULTURE[playerTeamCulture] : undefined;
  desc = culturePhrases?.length
    ? culturePhrases[Math.floor(Math.random() * culturePhrases.length)]
    : PHRASES.ATMOSPHERE[Math.floor(Math.random() * PHRASES.ATMOSPHERE.length)];

} else {
  // BRILLIANCE (rare ~4%) — replaces the old hardcoded one-liner
  type = 'GENERIC';
  desc = `UNBELIEVABLE! ${actorName} — ${PHRASES.BRILLIANCE[Math.floor(Math.random() * PHRASES.BRILLIANCE.length)]}`;
}
```

**Remove the old hardcoded brilliance check** (`if (Math.random() > 0.95) { desc = "UNBELIEVABLE!..." }`).

---

## 6. `getEventDelay` update (`MatchSim.tsx`)

Ensure `HIT_OUT` and `FREE_KICK` have explicit delay entries:

```typescript
const getEventDelay = (type: MatchEvent['type']): number => ({
  GOAL: 1800, INJURY: 2200, RIVALRY: 1600, BEHIND: 1200,
  MARK: 1100, FREE_KICK: 1100, INTERCEPT: 1300,
  ONE_ON_ONE: 1100, HIT_OUT: 900, TACKLE: 1000,
  POSSESSION: 850, TURNOVER: 950,
})[type] ?? 800;
```

---

## 7. Files changed

| File | Change |
|------|--------|
| `utils/simulationUtils.ts` | `generateQuarterTimestamps` updated for `MM:SS`; target 18–24; slot allocation 26; 9 new PHRASES pools; all existing pools extended to 12+ entries; expanded type distribution; old brilliance one-liner replaced |
| `components/MatchSim.tsx` | `getEventDelay` updated with explicit `HIT_OUT`/`FREE_KICK` entries |

---

## 8. Testing checklist

- [ ] `npm run build` zero TypeScript errors
- [ ] All timestamps in `MM:SS` format — none ending in `:00`
- [ ] No two events in the same quarter share a `MM:SS` string
- [ ] Quarter event count is 18–26 (verify across all 4 quarters)
- [ ] STOPPAGE, RUCK_CONTEST, DEFENSIVE_PRESSURE, FORWARD_PRESSURE, MIDFIELD_BATTLE, ATMOSPHERE, UMPIRE, BRILLIANCE all appear within a full 14-round season
- [ ] CONDITIONS events do not appear in rounds 7–10
- [ ] BRILLIANCE events use the new phrase pool, not the old hardcoded string
- [ ] Goal/behind counts in the final scoreline reconcile with GOAL/BEHIND events in the timeline
- [ ] No single phrase from any pool repeats more than twice in a 4-quarter match
