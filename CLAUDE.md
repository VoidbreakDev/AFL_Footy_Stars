# CLAUDE.md - AFL Footy Stars Development Guide

> **For AI Assistants**: This document provides comprehensive guidance for understanding and working with the AFL Footy Stars codebase.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack](#tech-stack)
4. [Key Concepts & Domain Knowledge](#key-concepts--domain-knowledge)
5. [Architecture & Patterns](#architecture--patterns)
6. [Development Workflow](#development-workflow)
7. [Code Conventions](#code-conventions)
8. [Adding New Features](#adding-new-features)
9. [State Management](#state-management)
10. [Common Tasks](#common-tasks)
11. [Important Files Reference](#important-files-reference)
12. [Known Issues & TODOs](#known-issues--todos)

---

## Project Overview

**AFL Footy Stars** is a comprehensive Australian Football League (AFL) career simulation game built as a single-page React application. Players create a custom AFL player and progress through their career from local leagues to the AFL, managing attributes, contracts, matches, achievements, and more.

### Core Features
- **Player Creation**: Customizable player with name, position, avatar, jersey number
- **Career Progression**: Advance through Local League → State League → AFL
- **Match Simulation**: Dynamic match engine with real-time events and AI commentary
- **Training System**: Attribute improvement via skill points
- **Achievement System**: 70+ unlockable achievements across 5 categories
- **Daily Rewards**: 14-day login streak system
- **Nicknames**: Dynamic nickname system based on playstyle
- **Player Comparison**: Compare stats with league players
- **Season Recap**: End-of-season performance summaries
- **Milestones Gallery**: Visual career milestone tracking
- **Draft System**: Interactive AFL draft with prospect generation and picks
- **Transfer Market**: Dynamic transfer offers and contract negotiations
- **Shop System**: 28+ purchasable items across 4 categories (recovery, training, boosters, career)
- **Media Hub**: Media reputation, fan followers, social media management
- **Team Chemistry**: Teammate relationships, personality interactions, morale system
- **Coaching Staff**: Hire coaches and staff with specialties and personality effects
- **Career Events**: 30+ random events with choice-based outcomes
- **Master Skill Tree**: 30+ advanced unlockable skills with attribute prerequisites
- **Finals System**: Full finals bracket — semi-finals and Grand Final screens
- **Awards Ceremony**: Season award presentations (Brownlow, Coleman, All-Australian, etc.)
- **Post-Match Press**: Press conference interactions after matches

### Version
Current Version: **1.1.0.0**

---

## Repository Structure

```
AFL_Footy_Stars/
├── components/              # React UI components (30 total)
│   ├── Dashboard.tsx        # Main game dashboard (home screen)
│   ├── Onboarding.tsx       # Player creation wizard
│   ├── MatchSim.tsx         # Live match simulation view
│   ├── Training.tsx         # Attribute training interface
│   ├── Achievements.tsx     # Achievement tracking screen
│   ├── DailyRewardModal.tsx # Daily login rewards popup
│   ├── PlayerComparison.tsx # Player stats comparison tool
│   ├── SeasonRecap.tsx      # End-of-season summary
│   ├── MilestonesGallery.tsx# Career milestones timeline
│   ├── CareerSummary.tsx    # Retirement/career overview
│   ├── LeagueView.tsx       # League ladder & standings
│   ├── ClubHub.tsx          # Team/club information
│   ├── PlayerStats.tsx      # Player statistics display
│   ├── Settings.tsx         # Game settings & preferences
│   ├── Layout.tsx           # App layout wrapper
│   ├── Avatar.tsx           # Avatar display component
│   ├── AwardsCeremony.tsx   # End-of-season award ceremony screen
│   ├── CareerEvents.tsx     # Random career events with choice outcomes
│   ├── CoachingStaff.tsx    # Coaching staff hire/manage interface
│   ├── Draft.tsx            # AFL draft with prospects & picks
│   ├── FinalsIntro.tsx      # Finals series intro screen (modal overlay)
│   ├── GrandFinalResult.tsx # Grand Final result & celebration (modal overlay)
│   ├── MasterSkillTree.tsx  # Advanced unlockable skill progression
│   ├── MediaHub.tsx         # Media events, social media, fan reputation
│   ├── PostMatchPress.tsx   # Post-match press conference interactions
│   ├── SemiFinalsResults.tsx# Semi-finals results screen (modal overlay)
│   ├── Shop.tsx             # In-game shop (28+ items, 4 categories)
│   ├── TeamChemistry.tsx    # Teammate relationships & team morale
│   ├── TeamLogo.tsx         # Team logo display helper component
│   └── TransferMarket.tsx   # Transfer offers & contract negotiation
│
├── context/
│   └── GameContext.tsx      # Global game state (React Context, ~3000 lines)
│
├── utils/                   # Business logic & utilities (15 files)
│   ├── simulationUtils.ts   # Match simulation engine
│   ├── leagueUtils.ts       # League generation & ladder logic
│   ├── achievementUtils.ts  # Achievement checking & unlocking
│   ├── nicknameUtils.ts     # Nickname generation logic
│   ├── dailyRewardUtils.ts  # Daily reward streak tracking
│   ├── awardUtils.ts        # Season award calculation (Brownlow, Coleman, etc.)
│   ├── careerEventUtils.ts  # Career event generation & resolution
│   ├── chemistryUtils.ts    # Team chemistry & relationship tracking
│   ├── coachingUtils.ts     # Coach/staff initialisation & interactions
│   ├── draftUtils.ts        # Draft prospect generation & pick simulation
│   ├── masterSkillUtils.ts  # Skill tree unlocking & progression
│   ├── mediaUtils.ts        # Media reputation, social posts, fan milestones
│   ├── rosterUtils.ts       # Team roster turnover & AI player retirement
│   ├── seasonUtils.ts       # Season progression, promotion/relegation, salary
│   └── transferUtils.ts     # Transfer offer generation & salary logic
│
├── services/
│   └── geminiService.ts     # Google Gemini AI commentary integration
│
├── types.ts                 # TypeScript type definitions (~670 lines)
├── constants.ts             # Game constants & configuration data (~1275 lines)
├── App.tsx                  # Root React component
├── index.tsx                # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies & scripts
├── metadata.json            # Project metadata
├── .env.example             # Environment variable template
└── README.md                # User-facing documentation
```

### Key Directory Purposes

| Directory/File | Purpose |
|---|---|
| `components/` | All React UI components (presentational & container) |
| `context/` | Global state management via React Context API |
| `utils/` | Pure business logic functions (match simulation, calculations) |
| `services/` | External service integrations (AI commentary) |
| `types.ts` | TypeScript interfaces & enums for type safety |
| `constants.ts` | Game configuration, team names, achievements, milestones, shop items |

---

## Tech Stack

### Core Technologies
- **React 19.2** - UI framework with modern hooks
- **TypeScript 5.8.2** - Type safety & developer experience
- **Vite 6.2** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first styling

### External APIs
- **Google Gemini AI** (`@google/genai` v1.30.0) - AI-powered match commentary (optional)
- **DiceBear API** - SVG avatar generation (Micah style)

### Build Tools
- **@vitejs/plugin-react** - React Fast Refresh support
- **TypeScript** - Type checking & compilation

### Data Persistence
- **LocalStorage** - Save game persistence (no backend)

---

## Key Concepts & Domain Knowledge

### AFL (Australian Football League) Basics
AFL is a contact sport played on an oval field with 18 players per team. Key concepts:
- **Goals** (6 points) vs **Behinds** (1 point)
- **Disposals** = Kicks + Handballs
- **Brownlow Medal** - Best & fairest player award (votes)
- **Premiership** - Championship/Grand Final winner
- **Finals** - Top 4 teams compete in playoffs

### Game Positions
Defined in `types.ts` as `Position` enum:
- **FORWARD** - Scoring specialists (Goal Sense important)
- **MIDFIELDER** - All-rounders (Disposals, Speed, Stamina)
- **DEFENDER** - Defensive specialists (Tackling, Marking)
- **RUCK** - Tall players who contest ball-ups (Marking, Stamina)

### Player Attributes (all 0-99)
From `PlayerAttributes` interface in `types.ts`:
- `kicking` - Goal accuracy, long kicks
- `handball` - Short passing
- `tackling` - Defensive pressure
- `marking` - Catching ability
- `speed` - Movement & agility
- `stamina` - Endurance & energy recovery
- `goalSense` - Scoring instinct

### League Tiers
Progression system (`LeagueTier` enum):
1. **Local League** - Amateur clubs (e.g., "Mudcrabs", "Bushrangers") — 8 teams
2. **State League** - Regional competition (e.g., "Wildcats", "Scorpions") — 8 teams
3. **AFL** - Professional league (e.g., "Collingwood", "Richmond") — 8 teams

### Career Progression
- Start at age 18, retire at 35 (`constants.ts`)
- Earn XP from matches → Level up → Gain skill points
- Train attributes (costs skill points + energy)
- Attributes capped at `player.potential` (varies per player)
- Manage contracts, injuries, morale, energy, wallet
- Season length: **14 regular rounds + finals**

### Economy System
- `player.wallet` — current money (earned from contracts, bonuses, shop)
- `player.lifetimeEarnings` — total career earnings
- `player.itemsPurchased[]` — purchase history
- Shop items span 4 categories: RECOVERY, TRAINING, ATTRIBUTE_BOOST, CAREER

### Media & Reputation System
- `player.mediaReputation` — MediaReputation object (score, tier, followers, events)
- Media tiers unlock new event types and sponsor opportunities
- Respond to media events via `respondToMedia()` (HUMBLE / CONFIDENT / IGNORE)
- Create social posts via `createSocialPost()`

### Team Chemistry System
- `player.teammates[]` — TeammateRelationship[] tracking each teammate
- `player.teamChemistry` — TeamChemistry object (team-wide morale/chemistry)
- Relationship statuses: ENEMY → RIVAL → STRANGER → ACQUAINTANCE → FRIEND → CLOSE_FRIEND → BEST_MATE
- Team chemistry states: FREEZING → COLD → NEUTRAL → WARM → HOT

### Coaching Staff System
- `player.coachingStaff` — CoachingStaff object (head coach + staff members)
- Coaches have personalities (DISCIPLINARIAN, MENTOR, TACTICIAN, MOTIVATOR, INNOVATOR, VETERAN)
- Staff roles: FITNESS_TRAINER, PHYSIO, NUTRITIONIST, MENTAL_COACH, SKILLS_COACH
- Hire via `hireCoachingStaff()` — costs wallet funds

### Master Skill Tree
- 30+ advanced skills unlocked via `masterSkillUtils.ts`
- Categories: KICKING, MARKING, HANDBALL, SPEED/STAMINA, TACKLING
- Rarities: COMMON, RARE, EPIC, LEGENDARY
- Requirements: minimum attribute level (25–70+), XP cost (2500–12000), skill point cost (10–30)

### Career Events
- 30+ random event templates in `constants.ts`
- Types: positive (bonuses, mentorship), negative (injury, backlash), choice-based (sponsorship, conflicts)
- Resolved via `resolveEventChoice(eventId, choiceId)` — **choiceId is required for choice events**

### Draft System
- Interactive AFL draft at season end when promoted
- `draftUtils.ts` generates prospect pool; `Draft.tsx` handles UI
- User picks prospect; remaining picks simulated via `simulateDraft()`
- AFL teams use correct names (e.g., "Collingwood", not "Collingwood FC") — fixed in `leagueUtils.ts`

### Finals System
- Top 4 teams qualify after 14 regular rounds
- Finals progression uses modal overlays (not view switches):
  - `showFinalsIntro` → `FinalsIntro.tsx`
  - `showSemiFinalsResults` → `SemiFinalsResults.tsx`
  - `showGrandFinalResult` → `GrandFinalResult.tsx`

### Awards
9 award types tracked via `awardUtils.ts`:
Brownlow Medal, Coleman Medal, All-Australian Team, Club Best & Fairest, Rising Star, Leading Disposal Winner, Leading Tackler, Mark of the Year, Goal of the Year

---

## Architecture & Patterns

### Component Architecture
**Container/Presentational Pattern** (implicit):
- Most components in `components/` are container components
- They consume `GameContext` for state
- Handle both logic and presentation

**View Routing** via `view` state:
- No React Router — single-page app with view switching
- `view` state in `GameContext` determines which component renders
- Full list of 22 view states:

```
'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' |
'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' | 'MILESTONES' |
'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' | 'CAREER_SUMMARY' |
'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' | 'COACHING_STAFF' |
'MASTER_SKILLS'
```

Finals screens (FinalsIntro, SemiFinalsResults, GrandFinalResult) are boolean-flag modal overlays, not view states.

### State Management
**Centralized Global State** via React Context:
- Single `GameContext` (`context/GameContext.tsx`) manages all game state (~3000 lines)
- No Redux or external state libraries

**Persistence**:
- `saveGame()` → Saves to `localStorage` under key **`'footyLegendSave'`**
- `loadGame()` → Loads from `localStorage`
- Auto-save on state changes (implicit in context)

### Data Flow
```
User Action (Component)
    ↓
Context Function (e.g., trainAttribute, commitMatchResult)
    ↓
Update State (setPlayer, setLeague)
    ↓
Component Re-renders
    ↓
Auto-save to LocalStorage
```

### Business Logic Location
- **Match Simulation**: `utils/simulationUtils.ts` — `calculateMatchOutcome()`, `simulateCPUMatch()`
- **League Management**: `utils/leagueUtils.ts` — `generateLeague()`, `generateFixtures()`, `updateLadderTeam()`
- **Season Progression**: `utils/seasonUtils.ts` — promotion/relegation, salary, season wrap-up
- **Achievements**: `utils/achievementUtils.ts` — `checkAchievements()`
- **Awards**: `utils/awardUtils.ts` — Brownlow/Coleman/All-Australian calculations
- **Nicknames**: `utils/nicknameUtils.ts` — `shouldUpdateNickname()`, `generateNickname()`
- **Draft**: `utils/draftUtils.ts` — prospect generation, pick simulation
- **Transfer**: `utils/transferUtils.ts` — offer generation, salary negotiation
- **Media**: `utils/mediaUtils.ts` — reputation events, fan milestones
- **Chemistry**: `utils/chemistryUtils.ts` — relationship tracking, morale effects
- **Coaching**: `utils/coachingUtils.ts` — staff initialisation, passive buffs
- **Career Events**: `utils/careerEventUtils.ts` — event generation, choice resolution
- **Master Skills**: `utils/masterSkillUtils.ts` — skill unlocking, prerequisite checking
- **Roster**: `utils/rosterUtils.ts` — AI team roster turnover between seasons

---

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. (Optional) Add `VITE_API_KEY=your_gemini_key` for AI commentary
3. Game works without API key (uses fallback commentary)

### Development Server
- **Port**: 3000 (configured in `vite.config.ts`)
- **Host**: 0.0.0.0 (accessible from network)
- **HMR**: Fast Refresh enabled via `@vitejs/plugin-react`

### Path Aliases
Configured in `tsconfig.json` and `vite.config.ts`:
- `@/*` → Root directory
- Example: `import { GameContext } from '@/context/GameContext'`

---

## Code Conventions

### TypeScript
- **Strict mode**: Partial (no `strict` flag, but isolated modules enabled)
- **Target**: ES2022
- **Module**: ESNext
- **JSX**: `react-jsx` (automatic runtime)

### File Naming
- **Components**: PascalCase `.tsx` (e.g., `Dashboard.tsx`)
- **Utils**: camelCase `.ts` (e.g., `simulationUtils.ts`)
- **Types**: `types.ts` (singular)
- **Constants**: `constants.ts` (singular)

### Component Structure
```tsx
// 1. Imports
import React from 'react';
import { useGameContext } from '@/context/GameContext';

// 2. Interfaces (if needed)
interface Props {
  // ...
}

// 3. Component
export const ComponentName: React.FC<Props> = ({ props }) => {
  // 4. Hooks
  const { player, setPlayer } = useGameContext();
  const [localState, setLocalState] = useState();

  // 5. Event Handlers
  const handleAction = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

### Styling
- **Tailwind CSS**: Utility classes in JSX
- **No CSS modules**: All styles inline via Tailwind
- **Responsive**: Mobile-first approach (game is mobile-first per metadata.json)

### State Updates
Always use functional updates for context state:
```typescript
// ✅ GOOD
setPlayer(prev => ({
  ...prev,
  energy: prev.energy - 10
}));

// ❌ BAD (potential stale state)
setPlayer({
  ...player,
  energy: player.energy - 10
});
```

---

## Adding New Features

### General Process
1. **Define Types** (if needed) in `types.ts`
2. **Add Constants** (if needed) in `constants.ts`
3. **Create Utility Functions** in appropriate `utils/*.ts` file
4. **Update Context** if state/actions needed (`GameContext.tsx`)
5. **Create/Update Component** in `components/`
6. **Add View** to view type union if new screen
7. **Test** manually via dev server

### Adding a New Achievement
```typescript
// 1. Add to constants.ts ACHIEVEMENTS array
{
  id: 'new_achievement',
  name: 'Achievement Name',
  description: 'Do something amazing',
  icon: '🎯',
  category: 'SPECIAL',
  rarity: 'EPIC',
  requirement: 'custom_condition'
}

// 2. Update achievementUtils.ts checkAchievements() with the new condition
```

### Adding a New Component Screen
```typescript
// 1. Create components/NewScreen.tsx
// 2. Add view to GameContext.tsx view type union: | 'NEW_SCREEN'
// 3. Add render case in App.tsx: {view === 'NEW_SCREEN' && <NewScreen />}
// 4. Add navigation from existing components
```

### Adding a New Shop Item
```typescript
// 1. Add to constants.ts SHOP_ITEMS array with id, name, description, price, category, effect
// 2. Handle effect in GameContext.tsx purchaseItem() function
```

### Adding a New Career Event
```typescript
// 1. Add template to constants.ts CAREER_EVENT_TEMPLATES
// 2. If choice-based, add choices[] array with effects per choice
// 3. careerEventUtils.ts resolveCareerEventChoice() handles effect application
```

---

## State Management

### GameContext API

#### State Properties
```typescript
{
  player: PlayerProfile | null,          // Current player data
  league: Team[],                        // All teams in current league
  fixtures: Fixture[],                   // Match schedule
  currentRound: number,                  // Current round (1-14 regular season)
  view: ViewType,                        // Current screen (22 possible values)
  lastMatchResult: MatchResult | null,   // Most recent match result
  showSeasonRecap: boolean,              // Show recap modal
  seasonAwards: Award[],                 // Current season's award results
  draftClass: DraftClass | null,         // Active draft class
  showFinalsIntro: boolean,              // Finals intro modal flag
  showSemiFinalsResults: boolean,        // Semi-finals results modal flag
  showGrandFinalResult: boolean,         // Grand Final result modal flag
}
```

#### Key Functions
```typescript
// Game Lifecycle
startNewGame(profile: PlayerProfile): void
resetGame(): void                        // Wipe save data
saveGame(): void                         // Manual save
loadGame(): boolean                      // Load from localStorage
retirePlayer(): void                     // End career

// Match Flow
generateMatchSimulation(fixtureIndex: number): MatchResult
commitMatchResult(fixtureIndex: number, result: MatchResult): void
advanceRound(): void                     // Progress to next round
simulateRound(): void                    // Skip round (if injured)

// Training
trainAttribute(attr: keyof PlayerProfile['attributes']): void

// Daily Rewards
canClaimReward(): boolean
claimReward(): void

// Draft
draftProspect(prospectId: string): void
simulateDraft(): void
completeDraft(): void

// Transfer Market
acceptTransfer(offerId: string): void
rejectTransfer(offerId: string): void

// Shop
purchaseItem(itemId: string): boolean

// Media
respondToMedia?(eventId: string, responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE'): void
createSocialPost?(content: string): void

// Career Events
resolveEvent(eventId: string): void
resolveEventChoice(eventId: string, choiceId?: string): void  // choiceId required for choice events

// Coaching
hireCoachingStaff?(staffMember: any, contractType: 'PERMANENT' | 'TEMPORARY'): void

// Finals
dismissFinalsIntro(): void
dismissSemiFinalsResults(): void
dismissGrandFinalResult(): void

// Awards
dismissAwardsCeremony(): void

// UI
setView(view: ViewType): void
dismissSeasonRecap(): void
acknowledgeMilestone(): void
```

### LocalStorage Schema
```javascript
// Key: 'footyLegendSave'   ← NOTE: NOT 'footySaveData'
{
  player: PlayerProfile,
  league: Team[],
  fixtures: Fixture[],
  currentRound: number
}
```

### PlayerProfile — Key Field Groups
```typescript
// Basic
name, gender, position, subPosition, age, potential, avatar, contract

// Attributes
attributes: { kicking, handball, tackling, marking, speed, stamina, goalSense }

// Progression
xp, level, skillPoints, energy, morale, injury
seasonStats, careerStats, milestones, currentYear, seasonsPlayed, careerHistory

// Achievements & Rewards
achievements: UnlockedAchievement[]
dailyRewards, nickname, jerseyNumber

// Economy
wallet, lifetimeEarnings, itemsPurchased[]

// Transfer
transferOffers: TransferOffer[]

// Media
mediaReputation: MediaReputation   // { score, tier, followers, events[] }

// Career Events
activeCareerEvents: CareerEvent[]
careerEventHistory: CareerEventHistory[]

// Chemistry
teammates: TeammateRelationship[]
teamChemistry: TeamChemistry
chemistryEvents: ChemistryEvent[]

// Coaching
coachingStaff: CoachingStaff
coachingEvents: CoachingEvent[]
motivationBoost, motivationExpiry

// Master Skills
masterSkills: UnlockedMasterSkill[]
```

---

## Common Tasks

### Debugging Match Simulation
```typescript
// 1. Open utils/simulationUtils.ts
// 2. Find calculateMatchOutcome()
// 3. Add console.logs to track events
console.log('Match Event:', event);
console.log('Player Stats:', result.playerStats);
```

### Adjusting Difficulty
```typescript
// constants.ts
export const INITIAL_ATTRIBUTE_POINTS = 15; // Increase for easier start

// utils/simulationUtils.ts
const opponentTeamRating = calculateTeamRating(opponentTeam) * 0.9; // 10% nerf
```

### Adding New Team Names
```typescript
// constants.ts
export const TEAM_NAMES_LOCAL = ["Mudcrabs", "Bushrangers", /* ... */, "New Team"];
export const TEAM_NAMES_STATE = ["Wildcats", "Scorpions", /* ... */, "New Team"];
export const TEAM_NAMES_AFL   = ["Collingwood", "Carlton", /* ... */, "New Team"];
```

### Modifying Season Length
```typescript
// constants.ts
export const SEASON_LENGTH = 14; // Change to desired rounds
// Finals logic in GameContext.tsx assumes 14-round season — update accordingly
```

### Testing AI Commentary
```typescript
// 1. Add .env file with VITE_API_KEY
// 2. services/geminiService.ts will be used automatically
// 3. Check console for API errors — fallback commentary used if API fails
```

### Inspecting Save Data
```javascript
// Browser console
JSON.parse(localStorage.getItem('footyLegendSave'))
```

---

## Important Files Reference

### Critical Files (Modify with Care)
| File | Purpose | Caution |
|---|---|---|
| `context/GameContext.tsx` | Core game state & logic (~3000 lines) | Breaking changes affect entire app |
| `types.ts` | Type definitions | Changes ripple through codebase |
| `utils/simulationUtils.ts` | Match engine | Complex logic, test thoroughly |
| `constants.ts` | Game configuration (~1275 lines) | Balance-sensitive data |

### Safe to Modify
| File | Purpose | Notes |
|---|---|---|
| `components/*.tsx` | UI components | Mostly presentation, safe to edit |
| `utils/achievementUtils.ts` | Achievement logic | Self-contained |
| `utils/nicknameUtils.ts` | Nickname generation | Self-contained |
| `utils/mediaUtils.ts` | Media/reputation events | Self-contained |
| `utils/careerEventUtils.ts` | Career event logic | Self-contained |
| `README.md` | User documentation | Safe to update |

### Configuration Files
| File | Purpose |
|---|---|
| `vite.config.ts` | Build configuration, dev server settings |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies, scripts |
| `.env` | Environment variables (API keys) |

### Entry Points
| File | Purpose |
|---|---|
| `index.html` | HTML template |
| `index.tsx` | React app mount point |
| `App.tsx` | Root component, view router |

---

## AI Assistant Guidelines

### When Modifying Code
1. **Always read existing files first** before making changes
2. **Preserve game balance** — don't make player too powerful
3. **Maintain TypeScript types** — update `types.ts` if adding properties
4. **Follow existing patterns** — match component structure
5. **Test match simulation** — changes to `simulationUtils.ts` need testing
6. **Update constants.ts** — for new achievements, teams, milestones, shop items
7. **Don't break saves** — avoid removing required fields from `PlayerProfile`
8. **GameContext is large** — when adding new systems, consider adding dedicated utility functions rather than inline logic

### When Adding Features
1. Check if similar features exist (e.g., achievements, career events)
2. Reuse existing utilities where possible
3. Add TypeScript types before implementation
4. Update `GameContext` only if state/actions needed
5. Consider mobile-first design (game is mobile-optimized)

### When Debugging
1. Check browser console for errors
2. Inspect `localStorage` with key `'footyLegendSave'` for save data
3. Verify TypeScript compilation (`npm run build`)
4. Test without API key (fallback paths)

### Red Flags to Avoid
- ❌ Removing fields from `PlayerProfile` without migration logic
- ❌ Changing `SEASON_LENGTH` without updating finals logic
- ❌ Modifying `types.ts` without updating all usages
- ❌ Breaking LocalStorage schema compatibility (key: `'footyLegendSave'`)
- ❌ Removing required props from components
- ❌ Adding inline game logic to GameContext when a utils function would do

---

## Known Issues & TODOs

### Open TODOs
None currently.

### Recently Fixed
| Issue | Fix |
|---|---|
| AFL draft picks used incorrect team names (e.g., "Collingwood FC") | Fixed in `utils/leagueUtils.ts` — NATIONAL tier teams now use bare names matching `TEAM_NAMES_AFL` |
| `resolveEventChoice` interface was missing `choiceId` parameter | Fixed — signature is now `(eventId: string, choiceId?: string): void` |

---

## Version History

- **1.1.0.0** (Current) — Phase 3-4 Feature Integration
  - Fan Mail & Supporter Interaction (career event system)
  - Club Culture & Fan Base Personality (media frequency, crowd flavour, BIG_CITY bonus)
  - Rivalry System Expansion (head-to-head tracking, history, intensity escalation, resolution)
  - Training Mini-Games (Kick, Reaction, Strength drills for SP bonuses)
  - Club History & Record Books (generateClubHistory, Record Watch banner)
  - AFLW Women's League Path (gender selector, parallel team names, AFLW award names)

- **1.0.0.0 Beta1** — Major feature-complete beta
  - Full finals system (semi-finals + Grand Final screens)
  - Draft, Transfer Market, Shop systems
  - Media Hub, Team Chemistry, Coaching Staff
  - Career Events, Master Skill Tree
  - Awards Ceremony (9 award types)
  - Post-Match Press Conference
  - 70+ achievements, 30+ career events, 30+ master skills

- **0.8.0.0** — Major Update #2
  - Significant gameplay systems expansion

- **0.0.1.0_Gamma** — Initial feature-complete version
  - 7 Quick Wins features implemented
  - Achievement system, daily rewards, nicknames
  - Jersey numbers, player comparison, milestones gallery, season recap

---

## Contact & Contribution

This is a **private project** (per README.md).
- No public contributions accepted
- Feedback/suggestions welcome through project owner

---

**Last Updated**: 2026-04-14
**Generated for**: Claude AI Assistant
**Repository**: AFL_Footy_Stars
