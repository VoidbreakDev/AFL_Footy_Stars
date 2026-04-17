# 🏉 AFL Footy Stars — v1.3 Feature Specification
**Off-Field Management & Narrative Depth**
*April 2026 | Prepared for Qwen Code*

---

## 1. Overview

v1.3 focuses on deepening the off-field experience and weaving a narrative layer throughout the career. The core match engine and tactical systems (game plan) remain as-is from v1.2. This update adds story arcs, reputation consequences, media conferences, club culture dynamics, legacy tracking, and a richer set of player life moments — all building toward the fully playable coach/player dual-mode planned for v2.

**Key design principle:** every system added in v1.3 should feel like something that *happens to* the player and demands a response, not just a passive stat display. The player should feel like a person inside a living club, not a spreadsheet entry.

---

### 1.1 What v1.3 Is NOT

- No changes to the match simulation engine (`simulationUtils.ts`)
- No new tactical systems — the existing `ATTACK` / `BALANCED` / `DEFENSIVE` / `PRESS` Tactic enum stays as-is
- No v2 features (coach mode, halftime strategy, budget management, full media conferences) — explicitly deferred
- No backend or multiplayer — still localStorage only

---

### 1.2 v1.2 Foundation — What Exists

The following systems from v1.2 already exist. v1.3 builds **on top of** them without replacing them:

| Existing System | v1.3 Extension Approach |
|---|---|
| PlayerPersonality (5 types) | Personality now actively affects narrative event options and dialogue tone |
| Rivalry system (Rivalry, RivalryEvent) | Rivalries now generate seasonal story arcs with escalation/resolution milestones |
| MediaReputation (6 tiers) | New media conference system generates structured post/pre-match prompts with tone choices |
| TeamChemistry + TeammateRelationship | Chemistry events now feed into a seasonal narrative thread; locker room drama becomes story moments |
| CareerEvent system (30+ events) | New event categories: STORYLINE, MEDIA_CONFERENCE, LEGACY_MOMENT, COMMUNITY |
| SeasonObjectives | New NARRATIVE objective type (story-driven goals beyond just stats) |
| Contract depth (role, clauses, renegotiation) | Contract holdout and public saga mechanics added as narrative events |
| CoachingStaff + CoachInteraction | Coach relationship now generates seasonal narrative arcs (loss of faith, mentorship, fallout) |
| DailyReward + wallet | Community engagement events now spend/earn wallet currency |

---

## 2. Career Story Arcs

### 2.1 Overview

Career Story Arcs are season-spanning narrative threads that give each season a distinct feel and identity. Unlike the existing CareerEvent system (which fires individual isolated events), Story Arcs are multi-act structures that unfold over 4–8 rounds, building toward a climax and resolution.

Each season, 1–2 arcs are active simultaneously. Arcs are seeded based on the player's current situation (contract year, rival present, low morale, captaincy, etc.) and progress through 3 acts: **Setup → Escalation → Resolution**.

---

### 2.2 New Types — `types.ts`

Add the following interfaces and types:

| Type/Interface | Description |
|---|---|
| `StoryArcType` (enum) | `CONTRACT_SAGA \| RIVALRY_ESCALATION \| CAPTAINCY_JOURNEY \| REDEMPTION_ARC \| MEDIA_FIRESTORM \| MENTOR_RELATIONSHIP \| SLUMP_AND_RETURN \| TRADE_SPECULATION \| LEGACY_CHASE \| FAREWELL_SEASON` |
| `StoryArcAct` | `'SETUP' \| 'ESCALATION' \| 'RESOLUTION' \| 'EPILOGUE'` |
| `StoryArcEvent` | A single chapter in an arc — `id`, `title`, `description`, `act`, `round`, `icon`, `choices?: StoryArcChoice[]`, `resolved: boolean`, `outcomeText?: string` |
| `StoryArcChoice` | `id`, `label`, `description`, `icon`, `effects: CareerEventEffect`, `risk`, `narrativeTag: string` (used to influence future arc events) |
| `StoryArc` | `id`, `type: StoryArcType`, `title`, `synopsis`, `currentAct`, `events: StoryArcEvent[]`, `startRound`, `endRound?`, `completed`, `outcome?: 'POSITIVE' \| 'NEGATIVE' \| 'NEUTRAL'`, `legacyImpact: number` |
| `PlayerProfile` additions | `activeStoryArcs?: StoryArc[]`, `completedStoryArcs?: StoryArc[]`, `narrativeTags?: string[]` (choice history tags that influence future events) |

---

### 2.3 Story Arc Templates

Add to `constants.ts` — a `STORY_ARC_TEMPLATES` array. Each template defines the arc structure with placeholder text filled at generation time. Key templates:

- **CONTRACT_SAGA** — fires when contract has 1 year remaining. Acts: club offers lowball → player choice (accept/hold out/go public) → resolution (signing/trade/delisting). Influences: salary outcome, media reputation, fan sentiment.
- **RIVALRY_ESCALATION** — fires when a Rivalry reaches 'High' intensity. Escalates to 'Heated' over 3 acts with confrontation moments. Can resolve (`resolved = true`) or become a career-defining feud.
- **CAPTAINCY_JOURNEY** — fires when `isCaptain` becomes true. 3-act arc: earning trust → leadership test (team in form crisis) → captaincy legacy established. Stat bonuses for successful leadership moments.
- **REDEMPTION_ARC** — fires after a POOR or FAILING performance grade season. Player must regain form, trust of coach, and media standing over 5 rounds.
- **MEDIA_FIRESTORM** — fires when MediaReputation drops suddenly or a CONTROVERSY event hits. Player must manage press across 3 rounds. Choices affect long-term reputation tier.
- **TRADE_SPECULATION** — fires in off-season if transferOffers exist and player hasn't committed. Media speculates, club reacts, player must decide publicly.
- **LEGACY_CHASE** — fires in final 2 years of career when legacyScore is within 20 points of a milestone tier. Season-long narrative about cementing legacy.
- **FAREWELL_SEASON** — fires automatically in final season (age 34–35 or `isRetired` decision pending). Farewell events: speeches, tributes, last game emotion.

---

### 2.4 New Utility — `utils/storyArcUtils.ts` (new file)

Create this new utility file with the following functions:

- `generateStoryArcs(player: PlayerProfile, round: number): StoryArc[]` — evaluates player state and seeds 1–2 arcs for the season
- `advanceStoryArc(arc: StoryArc, player: PlayerProfile, round: number): StoryArc` — progresses the arc to the next act, generates the next StoryArcEvent
- `resolveStoryArcChoice(arc: StoryArc, eventId: string, choiceId: string, player: PlayerProfile): { updatedArc: StoryArc, effects: CareerEventEffect }` — applies a choice and records narrativeTag
- `checkArcCompletion(arc: StoryArc, player: PlayerProfile): boolean` — determines if resolution conditions are met
- `getArcLegacyImpact(arc: StoryArc): number` — calculates final legacy score change from arc outcome

---

### 2.5 UI — `components/StoryArcPanel.tsx` (new component)

New component that displays in the Dashboard as a "Season Story" card. Shows:

- Active arc title, act indicator (Setup / Escalation / Resolution), progress bar
- Most recent story event with description and choice buttons (if unresolved)
- Completed arcs in a collapsible "Season Stories" history panel
- Visual tone: cinematic, dark gradient card, distinct from the existing CareerEvents UI

---

### 2.6 `GameContext.tsx` Integration

- Add `activeStoryArcs` and `completedStoryArcs` to PlayerProfile state
- Call `generateStoryArcs()` at season start (after SeasonRecap close)
- Call `advanceStoryArc()` at each round advance
- Add `resolveStoryArcChoice()` action to context
- Story arc completion feeds `legacyScore` via `getArcLegacyImpact()`

---

## 3. Expanded Reputation & Media Conference System

### 3.1 Overview

The existing MediaReputation system tracks score and tier passively. v1.3 adds structured **Media Conference** moments — pre-match and post-match press interactions where player responses actively shape their reputation trajectory. This is a stepping-stone toward v2's full media conference UI.

---

### 3.2 New Types — `types.ts`

| Type/Interface | Description |
|---|---|
| `MediaConferenceType` | `'PRE_MATCH' \| 'POST_MATCH_WIN' \| 'POST_MATCH_LOSS' \| 'MID_SEASON_CHECK' \| 'CONTROVERSY_RESPONSE' \| 'CONTRACT_QUESTION' \| 'FORM_SLUMP'` |
| `MediaConferenceQuestion` | `id`, `question: string`, `context: string` (why they're asking), `tone: 'HOSTILE' \| 'NEUTRAL' \| 'FRIENDLY' \| 'PROBING'` |
| `MediaConferenceResponse` | `id`, `label`, `text` (what the player says), `tone: 'CONFIDENT' \| 'HUMBLE' \| 'DEFLECT' \| 'CONTROVERSIAL' \| 'DIPLOMATIC'`, `reputationChange: number`, `fanChange: number`, `coachTrustChange?: number` |
| `MediaConference` | `id`, `type`, `title`, `round`, `year`, `questions: MediaConferenceQuestion[]`, `responses: Record<questionId, responseId>`, `completed: boolean`, `totalReputationChange: number` |
| `PlayerProfile` additions | `pendingMediaConference?: MediaConference`, `mediaConferenceHistory?: MediaConference[]` |

---

### 3.3 Media Conference Logic — `utils/mediaUtils.ts` additions

- `generateMediaConference(type, player, round, matchResult?): MediaConference` — creates a conference with 2–3 contextual questions based on current situation
- `applyConferenceResponses(conference, player): CareerEventEffect` — aggregates all response effects and applies them
- Conference generation triggers: post-match if win/loss margin > 30 points; mid-season if reputation drops/rises 2+ tiers; any active MEDIA_FIRESTORM arc; contract year; finals appearance

---

### 3.4 UI — `components/MediaHub.tsx` (extend existing)

- Add "Press Conference" section to the existing MediaHub component
- Shows pending conference notification with type badge
- Conference view: journalist avatar/name, question text, 3–4 response options with tone indicators (tone icon + reputation impact preview)
- Post-conference: summary of total reputation change, key quote displayed, story arc integration if relevant

---

### 3.5 Reputation Consequence Expansion

Reputation tier now actively unlocks/blocks content:

| Tier | Score Range | New v1.3 Unlocks/Consequences |
|---|---|---|
| UNKNOWN | 0–20 | No media conferences generated. Minimal fan mail. Club may question commitment. |
| CONTROVERSIAL | 21–35 | Hostile questions dominate conferences. Club morale -5 passive. MEDIA_FIRESTORM arc eligible. |
| DECENT | 36–50 | Standard conferences. Occasional fan mail events. No special bonuses. |
| POPULAR | 51–65 | Friendly journalist tone available. Sponsor interest events. +$5 wallet per round passive. |
| SUPERSTAR | 66–80 | Pre-match conferences generate team confidence (+3 team chemistry). Endorsement deal career events. |
| LEGEND | 81–100 | Press always respectful. LEGACY_CHASE arc eligible. Retirement tribute events unlocked. |

---

## 4. Club Culture & Locker Room Dynamics

### 4.1 Overview

The existing `CultureType` enum (`PREMIERSHIP_HUNGRY | REBUILDING | STORIED_CLUB | UNDERDOG | BIG_CITY`) is defined on Team but has no active gameplay effect. v1.3 activates it — club culture now generates unique events, passive effects, and narrative flavour specific to the team the player is at.

---

### 4.2 Culture Effects — `constants.ts` additions

Add a `CULTURE_EFFECTS` record mapping `CultureType` to its mechanical and narrative effects:

| Culture | Passive Effect | Narrative Flavour / Unique Events |
|---|---|---|
| PREMIERSHIP_HUNGRY | +5 match pressure modifier in finals. Coach pushes harder. | "Club demands finals run", "Captain's speech before elimination final", "Management frustration after regular season loss" |
| REBUILDING | +10% XP from training. Coach invests in youth. | "You're the future — leadership offered early", "Club sells experienced teammate (morale hit)", "Media questions rebuild timeline" |
| STORIED_CLUB | +5 fan followers per round. History matters. | "Former legend visits training", "Anniversary of famous premiership (legacy moment)", "Media compares you to club great" |
| UNDERDOG | +8% performance bonus in upset wins. | "No one believes in us — team bond event", "Shock win generates media storm", "Low budget forces creative contract negotiation" |
| BIG_CITY | +500 fan followers per round. Media spotlight always on. | "Paparazzi spotted at training", "Sponsorship offers flood in after good run", "Tabloid runs negative story (reputation risk)" |

---

### 4.3 Locker Room Drama Events

Expand the CareerEvent system with a new `LOCKER_ROOM` event category. These fire based on `TeamChemistry.overallChemistry` and specific teammate relationship states:

- **FACTION_SPLIT** — fires when `overallChemistry < 40`. Two groups forming. Player must choose a side or mediate.
- **STAR_PLAYER_FALLOUT** — fires when a close-friend teammate relationship drops below 30 chemistry. Public disagreement. CONTROVERSY risk.
- **NEWCOMER_WELCOME** — fires when a new season starts and roster is refreshed. Player chooses how to greet new teammates.
- **CAPTAIN_CRISIS** — fires if `isCaptain` and `TeamChemistry.morale < 35`. Leadership tested publicly. Triggers CAPTAINCY_JOURNEY arc.
- **CELEBRATION_MOMENT** — fires after a big win (margin > 40). +5 chemistry to all relationships.
- **TRAINING_INCIDENT** — fires randomly 1x per season. Mild injury risk + relationship test with involved teammate.

---

### 4.4 Club Culture Rating (Dynamic)

Add `cultureRating: number` (0–100) to the `Team` interface. Starts at a baseline per `CultureType` and shifts each season based on results, roster harmony, and player choices. Influences:

- Fan sentiment passive rate
- Contract negotiation leverage
- Coach personality drift over 2–3 seasons

---

## 5. Legacy Score & Legend Path

### 5.1 Overview

`legacyScore` already exists on `PlayerProfile` but is computed simply. v1.3 overhauls it into a visible, milestone-gated system that gives the player a long-term goal spanning multiple seasons.

---

### 5.2 Legacy Score Calculation — `utils/legacyUtils.ts` (extend)

Update `calculateLegacyScore()` to use a weighted formula across these pillars:

| Pillar | Weight | Calculation Basis |
|---|---|---|
| Statistical Dominance | 25% | Career disposals, goals, tackles vs. tier benchmarks |
| Awards & Recognition | 20% | Brownlow votes, All-Australian, Coleman, Rising Star, Premierships |
| Longevity | 15% | Matches played, seasons completed, tier reached (AFL = max) |
| Narrative Impact | 20% | Story arc outcomes (positive = +, negative = ±), legacy moments |
| Community & Media | 10% | Media reputation tier, fan followers milestone, community events |
| Leadership | 10% | Captaincy seasons, chemistry events resolved positively, mentor relationships |

---

### 5.3 Legacy Tiers & Milestones

Add `LEGACY_TIERS` constant to `constants.ts`:

| Tier | Score | Title & Unlock |
|---|---|---|
| 1 | 0–99 | Journeyman — Career started. No special unlock. |
| 2 | 100–249 | Promising Talent — Nickname generation pool expands. Club offers improved contract role. |
| 3 | 250–449 | Club Stalwart — Jersey retirement consideration event (if 200+ matches). Fan milestone triggered. |
| 4 | 450–649 | Fan Favourite — All-Australian consideration regardless of season stats. Media always friendly. |
| 5 | 650–849 | Club Legend — Club history record eligible. Hall of Fame path opens. LEGACY_CHASE arc fires. |
| 6 | 850+ | AFL Icon — Post-career path unlocks (MEDIA, AMBASSADOR, COACHING). Farewell tribute event. |

---

### 5.4 Legacy Moment Events

New `CareerEvent` type: `LEGACY_MOMENT`. Fire at score thresholds and specific career milestones:

- **Match 100** — "A Century of Service". Club ceremony. +legacy, +fan followers, +team chemistry.
- **Match 200** — "Two Hundred Reasons". Full tribute round. Media coverage guaranteed.
- **First Premiership** — "The Flag". Emotional choice: celebrate quietly or publicly.
- **Brownlow Medal win** — "The Count". Acceptance speech choices affect reputation and story arc.
- **Retirement announcement** — "One Last Dance". Triggers FAREWELL_SEASON arc if not already active.

---

### 5.5 UI — `components/MilestonesGallery.tsx` (extend existing)

- Add "Legacy Path" section above the existing milestones list
- Visual legacy score bar with current tier highlighted, next tier shown
- Legacy pillar breakdown (pure CSS/simple SVG bar chart — no external chart library)
- Completed legacy moments displayed as trophy/plaque cards

---

## 6. Community Engagement & Fan Mail

### 6.1 Overview

Players with growing media reputations should feel the real-world weight of fame. v1.3 adds a Fan Mail system and Community Engagement events — small but meaningful interactions that build the sense of a player who exists in a world, not just a stats dashboard.

---

### 6.2 Fan Mail System

- Fan mail fires 1x per 2–3 rounds once `fanFollowers > 1000`
- Each mail has a type: `ENCOURAGEMENT | CRITICISM | CHALLENGE | HEARTFELT | FUNNY | WEIRD`
- Player can: Reply Kindly | Ignore | Share Publicly (each has different fan and reputation effects)
- "Share Publicly" increases fans but raises CONTROVERSY risk
- Accumulate 10 heartfelt replies → unlock "Community Hero" achievement

---

### 6.3 Community Engagement Events

New `COMMUNITY` type in `CareerEvent.type`:

- **SCHOOL_VISIT** — attend a school visit. Spend 1 energy. Gain +fan followers, +morale, +legacy score.
- **CHARITY_MATCH** — participate in charity event. Spend wallet currency. Gain +reputation, +team chemistry.
- **SPONSOR_APPEARANCE** — corporate sponsor requests appearance. Gain +wallet, but time cost (-energy).
- **LOCAL_FOOTY_CLINIC** — run a juniors clinic. Low wallet cost, high morale/fan reward. PROFESSIONAL and LEADER personalities benefit most.
- **FAN_EVENT_CANCELLED** — cancel a community event. Media and fan backlash. CONTROVERSIAL tier players face harsher outcomes.

---

### 6.4 New Types — `types.ts`

Add to `CareerEvent.type` union:
- `'COMMUNITY'`
- `'LOCKER_ROOM'`
- `'LEGACY_MOMENT'`
- `'MEDIA_CONFERENCE'`

---

## 7. Dynamic Player Biography & Career Narrative

### 7.1 Overview

The `PlayerProfile.bio` field currently holds a static string entered at onboarding. v1.3 transforms this into a living document — a dynamic biography that updates each season, reflecting what actually happened.

---

### 7.2 Biography Generation — `utils/careerEventUtils.ts` additions

- `generateSeasonBioParagraph(player, seasonHistory, arcs, year): string` — generates a 2–3 sentence narrative paragraph summarising the season, incorporating story arc outcomes, key stats, and significant events
- `appendBiography(player, newParagraph): PlayerProfile` — appends new paragraph to `biography: string[]` field
- Use Gemini API (`geminiService.ts`) if `VITE_API_KEY` is set — request a human-sounding career biography paragraph. Fall back to template strings if API unavailable.

---

### 7.3 Types — `types.ts`

- Change `PlayerProfile.bio` from `string` to `biography?: string[]` (array of seasonal paragraphs)
- Backward compat: if `biography` is undefined, display the old `bio` string as the first paragraph

---

### 7.4 UI — `components/PlayerStats.tsx` (extend)

- Add "Career Story" tab/section to PlayerStats
- Display biography paragraphs in chronological order with year labels
- Style as a newspaper/journal feel — serif-feel font class, subtle paper texture via Tailwind
- Add "Share Career Story" button that copies full biography to clipboard (extending existing CareerExport functionality)

---

## 8. Milestone & Awards Hall of Fame

### 8.1 New Milestone Types

Extend `Milestone.type` union in `types.ts`:

Add: `'VOTES' | 'AWARDS' | 'SEASONS' | 'CHEMISTRY' | 'LEGACY' | 'NARRATIVE'`
(alongside existing `MATCHES | GOALS | DISPOSALS | TACKLES`)

Add new milestone thresholds to `constants.ts` — `MILESTONE_DEFINITIONS` array:
- **Votes:** 50, 100, 200, 300 career Brownlow votes
- **Awards:** First award, 3 awards, 5 awards, 10 awards
- **Seasons:** 5, 10, 15 seasons played
- **Chemistry:** Reach BEST_MATE status with 3 teammates
- **Legacy:** Reach each Legacy Tier
- **Narrative:** Complete each StoryArcType at least once

---

### 8.2 UI — `MilestonesGallery.tsx` (extend)

- Filter tabs: ALL | STATS | AWARDS | LEGACY | NARRATIVE
- Locked milestones visible but greyed out with progress indicator (e.g. "47/50 career votes")
- Animate unlock with a brief shimmer/glow effect using Tailwind transitions
- Share button per milestone — copies a formatted achievement text

---

## 9. Implementation Plan

### 9.1 Recommended Build Order

Build in this order to avoid circular dependencies:

| # | Task | Details | Est. Complexity |
|---|---|---|---|
| 1 | `types.ts` — all v1.3 additions | Add StoryArc types, MediaConference types, extend CareerEvent union, biography array, cultureRating, new Milestone types. No logic changes. | Low |
| 2 | `constants.ts` additions | STORY_ARC_TEMPLATES, CULTURE_EFFECTS, LEGACY_TIERS, MILESTONE_DEFINITIONS. Data-only, no logic. | Low |
| 3 | `legacyUtils.ts` overhaul | Rewrite `calculateLegacyScore()` with pillar-weighted formula. Add legacy tier function. | Medium |
| 4 | `storyArcUtils.ts` (new) | Create the full story arc generation, advancement, and resolution utility. | High |
| 5 | `careerEventUtils.ts` additions | Add COMMUNITY, LOCKER_ROOM, LEGACY_MOMENT event generators. Add `generateSeasonBioParagraph()`. | Medium |
| 6 | `mediaUtils.ts` additions | Add `generateMediaConference()` and `applyConferenceResponses()`. Extend reputation consequences. | Medium |
| 7 | `GameContext.tsx` integration | Wire all new utils into state. Add story arc advancement on round change. Add media conference state. | High |
| 8 | `StoryArcPanel.tsx` (new) | New Dashboard component for active story arcs. | Medium |
| 9 | `MediaHub.tsx` extension | Add press conference UI to existing component. | Medium |
| 10 | `MilestonesGallery.tsx` extension | Add Legacy Path section, new milestone categories, filter tabs. | Medium |
| 11 | `PlayerStats.tsx` extension | Add Career Story tab with dynamic biography display. | Low |
| 12 | `Dashboard.tsx` integration | Add StoryArcPanel to dashboard layout. Add community event notifications. | Low |
| 13 | Testing & balance pass | Play through 3–4 seasons. Adjust legacy weights, arc trigger conditions, event frequencies. | Medium |

---

### 9.2 Critical Files — Modify With Care

- `context/GameContext.tsx` (~3000 lines) — add state fields, wire new utils into round-advance and season-start logic only. **Avoid refactoring existing logic.**
- `types.ts` — additions only. Never remove existing fields. All new fields optional (`?`) for save compatibility.
- `constants.ts` — additions only. New exported arrays/records, no modifications to existing exports.
- `utils/simulationUtils.ts` — **DO NOT TOUCH.** Match engine is stable and out of scope for v1.3.

---

### 9.3 Save Data Compatibility Rules

- All new `PlayerProfile` fields must be optional (`?`) — existing saves load without them
- Use nullish coalescing (`?? []`) when reading new array fields from save data
- Save key remains `'footyLegendSave'` — no migration needed
- `biography` field: if `biography` is undefined but `bio` string exists, treat `bio` as `biography[0]` in display code

---

## 10. v2 Preview — Deferred Features

The following are explicitly OUT OF SCOPE for v1.3. Documented here so v1.3 architecture leaves the right hooks:

| v2 Feature | v1.3 Hook That Enables It |
|---|---|
| Coach Mode (play as coach) | Tactic enum already exists. Club culture + team chemistry systems provide the data layer. v2 adds direct coaching UI and halftime adjustments. |
| Full Media Conference UI | MediaConference types and logic built in v1.3. v2 adds journalist avatar animations, live typing effects, and camera pan cinematics. |
| Player Mode (play on-field) | Match simulation engine already runs per-player stats. v2 adds a live quarter view where the user makes real-time decisions during match events. |
| Budget Management | `wallet` and `lifetimeEarnings` already on PlayerProfile. v2 moves budget to a Club level, requiring a Club interface extension. |
| Group Training Sessions | TrainingFocus system from v1.2 provides the base. v2 adds teammate participation and interactive mini-game sessions. |
| Strategy Board (pre-match) | Tactic enum and game plan selection from v1.2 is the seed. v2 expands with formation, matchup assignments, set-play setups. |
| Halftime Address | StoryArc choice system built in v1.3 provides the UI pattern. v2 applies it to a halftime locker room screen with momentum consequences. |

---

## 11. Quick Reference — New Files & Modified Files

| Feature | Type | New Types/Fields | Primary File(s) | Priority |
|---|---|---|---|---|
| Story Arc System | NEW | StoryArc, StoryArcType, StoryArcAct, StoryArcEvent, StoryArcChoice | `utils/storyArcUtils.ts`, `components/StoryArcPanel.tsx` | P1 |
| Media Conferences | EXTEND | MediaConferenceType, MediaConferenceQuestion, MediaConferenceResponse, MediaConference | `utils/mediaUtils.ts`, `components/MediaHub.tsx` | P1 |
| Club Culture Active | EXTEND | `cultureRating: number` on Team, CULTURE_EFFECTS constant | `constants.ts`, `context/GameContext.tsx` | P2 |
| Locker Room Events | EXTEND | `'LOCKER_ROOM'` in CareerEvent.type | `utils/careerEventUtils.ts` | P2 |
| Legacy Score Overhaul | EXTEND | LEGACY_TIERS constant, `'LEGACY_MOMENT'` event type | `utils/legacyUtils.ts`, `constants.ts` | P1 |
| Community Events | EXTEND | `'COMMUNITY'` in CareerEvent.type | `utils/careerEventUtils.ts` | P2 |
| Fan Mail Expansion | EXTEND | FAN_MAIL event types extended | `utils/careerEventUtils.ts`, `components/CareerEvents.tsx` | P3 |
| Dynamic Biography | EXTEND | `biography?: string[]` on PlayerProfile (replaces `bio: string`) | `utils/careerEventUtils.ts`, `components/PlayerStats.tsx`, `services/geminiService.ts` | P2 |
| Milestone Extension | EXTEND | Extended Milestone.type union, new milestone thresholds | `types.ts`, `constants.ts`, `components/MilestonesGallery.tsx` | P2 |
| Reputation Consequences | EXTEND | Tier-gated content unlock/block logic | `utils/mediaUtils.ts`, `context/GameContext.tsx` | P2 |

*Priority: P1 = build first (core of v1.3), P2 = build second, P3 = polish pass if time allows.*

---

*AFL Footy Stars v1.3 Specification — End of Document*
*Prepared April 2026 | VoidbreakDev / Ryan Sinclair*
