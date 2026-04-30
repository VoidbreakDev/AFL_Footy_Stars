# 🏉 AFL Footy Stars — v1.5.1 Feature Specification
**Commentary & Event Narration Engine**
*April 2026 | Prepared for Claude Code / Sub-agents*

---

## 1. Overview

v1.5.1 upgrades match commentary and event narration across two layers: simulation (`simulationUtils.ts`) and display (`MatchSim.tsx`, `geminiService.ts`).

**Problems being solved:**
1. **Timestamp collisions** — multiple events share the same `MM:00` string
2. **No event chaining** — events are isolated sentences with no causal link
3. **No synergy language** — chemistry/relationship systems have no voice in commentary
4. **No rivalry flavour in-game** — rivalry context never referenced during play
5. **Gemini commentary is content-starved** — prompt gives only scores and 2 stats

**Scope:** `utils/simulationUtils.ts`, `services/geminiService.ts`, `components/MatchSim.tsx` only.

---

### 1.1 What v1.5.1 Is NOT

- No changes to scoring or stat generation logic from v1.5
- No new views or navigation
- No changes to `types.ts`
- No changes to `GameContext.tsx`

---

## 2. Fix: Non-colliding timestamps

### 2.1 Add `generateQuarterTimestamps` to `simulationUtils.ts`

```typescript
const generateQuarterTimestamps = (count: number): string[] => {
  if (count === 0) return [];
  const slotSize = 20 / count;
  const minutes: number[] = [];
  for (let i = 0; i < count; i++) {
    const base = Math.floor(i * slotSize) + 1;
    const jitter = Math.floor(Math.random() * 3) - 1;
    minutes.push(Math.max(1, Math.min(20, base + jitter)));
  }
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i] <= minutes[i - 1]) minutes[i] = minutes[i - 1] + 1;
  }
  return minutes.map(m => {
    const seconds = Math.floor(Math.random() * 54) + 3; // 3–56, never :00
    return `${Math.min(20, m)}:${String(seconds).padStart(2, '0')}`;
  });
};
```

**Usage in quarter loop:**
```typescript
const quarterTimeSlots = generateQuarterTimestamps(16);
let slotIdx = 0;
const nextTime = () => quarterTimeSlots[slotIdx++] ?? `${Math.min(20, slotIdx)}:30`;
```

Replace every `time: \`${Math.floor(Math.random()*minutes)+1}:00\`` with `time: nextTime()`.

---

## 3. Event chaining

### 3.1 Player name helpers

Add near the top of `calculateMatchOutcome`:

```typescript
const playerTeamPlayers = (isHome ? homeTeam : awayTeam).players;
const opponentPlayers   = (isHome ? awayTeam : homeTeam).players;

const pickTeammate = (): string => {
  const filtered = playerTeamPlayers.filter(p => p.name !== player.name);
  return filtered.length > 0
    ? filtered[Math.floor(Math.random() * filtered.length)].name
    : playerTeamPlayers[0]?.name ?? 'A teammate';
};

const pickOpponent = (): string =>
  opponentPlayers.length > 0
    ? opponentPlayers[Math.floor(Math.random() * opponentPlayers.length)].name
    : 'An opponent';
```

### 3.2 Chain phrase templates (add to `PHRASES`)

```typescript
CHAIN_KICK_TO_GOAL: [
  (k: string, g: string) => `${k} finds ${g} on the lead — ${g} marks and goals!`,
  (k: string, g: string) => `A pinpoint kick from ${k}, ${g} marks and converts!`,
  (k: string, g: string) => `${k} threads it to ${g} who nails the set shot.`,
],
CHAIN_HANDBALL_GOAL: [
  (h: string, g: string) => `${h} wins it from the stoppage, handballs to ${g} — GOAL!`,
  (h: string, g: string) => `Quick hands from ${h} finds ${g} in space. The snap is true!`,
],
CHAIN_TACKLE_TURNOVER: [
  (t: string, v: string) => `${t} lays the tackle on ${v}! Holding the ball — opposition wins possession.`,
  (t: string, v: string) => `${v} is caught holding by ${t}. Free kick to the opposition.`,
],
CHAIN_RUCK_CLEARANCE: [
  (r: string, m: string) => `${r} wins the tap to ${m} who bursts out of the stoppage.`,
  (r: string, m: string) => `Dominant ruck work from ${r}, ${m} collects and drives forward.`,
],
CHAIN_INTERCEPT_FORWARD: [
  (d: string, f: string) => `${d} intercepts and finds ${f} on the wing with a laser kick.`,
  (d: string, f: string) => `${d} reads it perfectly — turns defence into attack, ${f} leads up.`,
],
CHAIN_SYNERGY_POSITIVE: [
  (a: string, b: string) => `Pure instinct between ${a} and ${b} — almost telepathic.`,
  (a: string, b: string) => `${a} and ${b} have been combining brilliantly all day.`,
  (a: string, b: string) => `The understanding between ${a} and ${b} is a real weapon.`,
],
CHAIN_SYNERGY_NEGATIVE: [
  (a: string, b: string) => `A miscommunication — ${a} and ${b} both called for it and neither got it.`,
  (a: string, b: string) => `${a} expected the handball from ${b} but it never came.`,
],
```

### 3.3 Chain-aware filler loop

Replace approximately 30% of single filler events with chained pairs. In the filler generation section:

```typescript
const isChainedPlay = Math.random() < 0.30 && fillerGenerated < fillerNeeded - 1;

if (isChainedPlay) {
  const chainRoll = Math.random();
  if (chainRoll < 0.30) {
    // Kick-to-goal chain
    const kicker = Math.random() < 0.4 ? player.name : pickTeammate();
    const scorer = pickTeammate();
    const tpl = PHRASES.CHAIN_KICK_TO_GOAL[Math.floor(Math.random() * PHRASES.CHAIN_KICK_TO_GOAL.length)];
    events.push({ quarter: q, time: nextTime(), description: `${kicker} drives it long inside 50.`,
      type: 'POSSESSION', isPlayerInvolved: kicker === player.name, teamId: playerTeamId });
    events.push({ quarter: q, time: nextTime(), description: tpl(kicker, scorer),
      type: 'GOAL', isPlayerInvolved: scorer === player.name, teamId: playerTeamId });
    if (isHome) homeGoals++; else awayGoals++;
    fillerGenerated += 2;
  } else if (chainRoll < 0.55) {
    // Tackle-turnover chain
    const tackler = pickOpponent();
    const victim = Math.random() < 0.5 ? player.name : pickTeammate();
    const tpl = PHRASES.CHAIN_TACKLE_TURNOVER[Math.floor(Math.random() * PHRASES.CHAIN_TACKLE_TURNOVER.length)];
    const followType = Math.random() < 0.35 ? 'GOAL' : 'POSSESSION';
    events.push({ quarter: q, time: nextTime(), description: tpl(tackler, victim),
      type: 'TACKLE', isPlayerInvolved: victim === player.name,
      teamId: isHome ? awayTeam.id : homeTeam.id });
    events.push({ quarter: q, time: nextTime(),
      description: followType === 'GOAL' ? `${tackler} converts the opportunity — GOAL!` : `${tackler} wins it and drives forward.`,
      type: followType as MatchEvent['type'], isPlayerInvolved: false,
      teamId: isHome ? awayTeam.id : homeTeam.id });
    if (followType === 'GOAL') { if (isHome) awayGoals++; else homeGoals++; }
    fillerGenerated += 2;
  } else {
    // Ruck-clearance or intercept chain (single event, chain-narrated)
    const useRuck = Math.random() < 0.5;
    if (useRuck) {
      const ruckman = playerTeamPlayers.find(p => p.subPosition === 'RUCK')?.name ?? pickTeammate();
      const mid = pickTeammate();
      const tpl = PHRASES.CHAIN_RUCK_CLEARANCE[Math.floor(Math.random() * PHRASES.CHAIN_RUCK_CLEARANCE.length)];
      events.push({ quarter: q, time: nextTime(), description: tpl(ruckman, mid),
        type: 'HIT_OUT', isPlayerInvolved: ruckman === player.name || mid === player.name,
        teamId: playerTeamId });
    } else {
      const def = playerTeamPlayers.find(p => ['HBF','FB'].includes(p.subPosition ?? ''))?.name ?? pickTeammate();
      const fwd = pickTeammate();
      const tpl = PHRASES.CHAIN_INTERCEPT_FORWARD[Math.floor(Math.random() * PHRASES.CHAIN_INTERCEPT_FORWARD.length)];
      events.push({ quarter: q, time: nextTime(), description: tpl(def, fwd),
        type: 'INTERCEPT', isPlayerInvolved: def === player.name || fwd === player.name,
        teamId: playerTeamId });
    }
    fillerGenerated += 1;
  }
}
```

---

## 4. Synergy commentary (once per match, Q2+)

```typescript
const hasFiredSynergy = timeline.some(e =>
  e.description.includes('telepathic') || e.description.includes('miscommunication'));

if (!hasFiredSynergy && q >= 2 && player.teammates && Math.random() < 0.25) {
  const bestMate = player.teammates.find(t => t.status === 'BEST_MATE');
  const rival    = player.teammates.find(t => t.status === 'ENEMY' || t.status === 'RIVAL');
  if (rival && Math.random() < 0.4) {
    const tpl = PHRASES.CHAIN_SYNERGY_NEGATIVE[Math.floor(Math.random() * PHRASES.CHAIN_SYNERGY_NEGATIVE.length)];
    events.push({ quarter: q, time: nextTime(), description: tpl(player.name, rival.name),
      type: 'GENERIC', isPlayerInvolved: true, teamId: playerTeamId });
  } else if (bestMate) {
    const tpl = PHRASES.CHAIN_SYNERGY_POSITIVE[Math.floor(Math.random() * PHRASES.CHAIN_SYNERGY_POSITIVE.length)];
    events.push({ quarter: q, time: nextTime(), description: tpl(player.name, bestMate.name),
      type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId });
  }
}
```

---

## 5. Rivalry commentary

Add rivalry buildup (Q1) and resolution (Q4) events when an active rivalry matches the opponent:

```typescript
const opponentTeamName = isHome ? awayTeam.name : homeTeam.name;
const activeRivalry = player.rivalries?.find(r => r.club === opponentTeamName && !r.resolved);
```

**Q1 buildup phrases by intensity:**

```typescript
const RIVALRY_BUILDUP = {
  Low:    [(o: string) => `${o} and ${player.name} have history — both aware of each other.`],
  Medium: [(o: string) => `${o} and ${player.name} are at each other — this rivalry is heating up.`],
  High:   [(o: string) => `Genuine anger between ${player.name} and ${o}. The crowd loves it.`],
  Heated: [(o: string) => `${player.name} and ${o} are at boiling point — this WILL spill over.`],
};
```

**Q4 resolution:**

```typescript
const RIVALRY_RESOLUTION = {
  playerWon: [(o: string) => `${player.name} got the better of ${o} today.`],
  oppWon:    [(o: string) => `${o} had the last laugh. The rivalry heats up another notch.`],
  even:      [(o: string) => `Honours even between ${player.name} and ${o}. Far from over.`],
};
```

---

## 6. Contextual GENERIC phrase selection

Add to `PHRASES`:

```typescript
COMEBACK:       ['They refuse to give in!', 'Against all odds — they are back in this!', ...],
BLOWOUT_HOME:   ['The visitors are being overrun.', 'The home side is putting on a clinic.', ...],
BLOWOUT_AWAY:   ['Total domination from the away team.', 'The crowd has gone quiet.', ...],
FINALS_TENSION: ['Finals football — every possession matters.', 'Hearts in mouths.', ...],
LATE_PRESSURE:  ['Clock ticking — desperation setting in.', 'Every kick could be the last.', ...],
```

Replace generic GENERIC selection with a `selectContextualPhrase(quarter, scoreDiff, momentum, isFinals, minute)` helper that picks from the appropriate pool.

---

## 7. Rewrite `geminiService.ts`

Full rewrite with rich context builder and structured 3-sentence prompt:

```typescript
const buildMatchContext = (homeTeam, awayTeam, result, player): string => {
  // Extract: match type (close/blowout), momentum swing, synergy events,
  // rivalry lines, injury, battle report, performance grade, Brownlow votes
  // Returns a structured briefing string
};

// Prompt rules:
// - Sentence 1: Match result and its nature
// - Sentence 2: Player's contribution (grade, highlight, injury)
// - Sentence 3: Narrative note (synergy, rivalry, season context)
// - Never start with "Full time:" or "In a"
// - Use AFL terminology naturally
```

Fallback commentary (no API key) now includes: performance grade, injury note, rivalry line, synergy line.

---

## 8. Display: Variable event timing (`MatchSim.tsx`)

Replace fixed `1200ms setInterval` with per-event `setTimeout` scheduling:

```typescript
const getEventDelay = (type: MatchEvent['type']): number => ({
  GOAL: 1800, INJURY: 2200, RIVALRY: 1600, BEHIND: 1200,
  MARK: 1100, FREE_KICK: 1100, INTERCEPT: 1300,
  ONE_ON_ONE: 1100, HIT_OUT: 900, TACKLE: 1000,
  POSSESSION: 850, TURNOVER: 950,
})[type] ?? 800;
```

Add `quarterTimeoutsRef = useRef<number[]>([])` and clear all timeouts on unmount/view change.

Chain connector visual: when two consecutive events are ≤1 minute apart and at least one involves the player, render a thin `left-border` connector between the cards.

---

## 9. Files changed

| File | Change |
|------|--------|
| `utils/simulationUtils.ts` | Timestamp generator; chain phrases; chain-aware filler loop; synergy events; rivalry buildup/resolution; contextual phrase selection; contextual phrase pools |
| `services/geminiService.ts` | Full rewrite — rich context builder, structured 3-sentence prompt, improved fallback |
| `components/MatchSim.tsx` | Variable event timing; quarterTimeoutsRef; chain connector visual; updated event icons |

---

## 10. Testing checklist

- [ ] No two events in the same quarter share a `MM:SS` string
- [ ] Events in the feed are in ascending time order within each quarter
- [ ] Kick-to-goal chains: first event is POSSESSION, second is GOAL, same player names appear in both
- [ ] Tackle-turnover chains: if follow-up is GOAL, final scoreline reflects it
- [ ] Synergy event fires at most once per match
- [ ] When facing a rivalry opponent: RIVALRY event in Q1, RIVALRY event at `20:xx` in Q4
- [ ] No rivalry events when no active rivalry against current opponent
- [ ] Gemini fallback includes grade, injury (if applicable), rivalry line (if applicable)
- [ ] With API key: commentary references match type, player grade, and at least one narrative element
- [ ] Goal events visibly hold longer than GENERIC events in the display feed
- [ ] Navigating away mid-quarter cancels all pending timeouts
