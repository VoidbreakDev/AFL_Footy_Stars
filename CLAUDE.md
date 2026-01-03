# CLAUDE.md - AFL Footy Stars Development Guide

> **For AI Assistants**: This document provides comprehensive guidance for understanding and working with the AFL Footy Stars codebase.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack](#tech-stack)
4. [Key Concepts & Domain Knowledge](#key-concepts--domain-knowledge)
5. [Game Systems Deep Dive](#game-systems-deep-dive)
6. [Architecture & Patterns](#architecture--patterns)
7. [Development Workflow](#development-workflow)
8. [Code Conventions](#code-conventions)
9. [Adding New Features](#adding-new-features)
10. [State Management](#state-management)
11. [Common Tasks](#common-tasks)
12. [Important Files Reference](#important-files-reference)

---

## Project Overview

**AFL Footy Stars** is a comprehensive Australian Football League (AFL) career simulation game built as a single-page React application. Players create a custom AFL player and progress through their career from local leagues to the AFL, managing attributes, contracts, matches, achievements, and more.

### Core Features
- **Player Creation**: Customizable player with name, gender, position, avatar (12 presets), jersey number (1-99)
- **Career Progression**: Advance through Local League → State League → AFL
- **Match Simulation**: Dynamic match engine with real-time events and AI commentary (via Google Gemini)
- **Training System**: Attribute improvement via skill points (capped by potential)
- **Achievement System**: **50 unlockable achievements** across 5 categories (CAREER, MATCH, SKILL, SPECIAL, LEGEND)
- **Daily Rewards**: 14-day login streak system with escalating rewards
- **Nicknames**: Dynamic nickname system with **52 unique nicknames** based on playstyle, stats, and achievements
- **Player Comparison**: Compare your stats with any league player across all attributes
- **Season Recap**: End-of-season performance summaries with letter grades (A+ to D)
- **Milestones Gallery**: Visual career milestone tracking across 4 categories
- **Stadium System**: Detailed venue generation with capacity, type, and turf quality
- **Rivalries**: Dynamic rivalry system based on match events
- **Injuries**: Realistic injury system with recovery weeks

### Version
- **Latest**: **0.0.5.0_ANTHR** (current development build)
- **Stable**: **0.0.1.0_Gamma** (as documented in README)

---

## Repository Structure

```
AFL_Footy_Stars/
├── components/              # React UI components
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
│   └── Avatar.tsx           # Avatar display component
│
├── context/
│   └── GameContext.tsx      # Global game state (React Context)
│
├── utils/                   # Business logic & utilities
│   ├── simulationUtils.ts   # Match simulation engine
│   ├── leagueUtils.ts       # League generation & ladder logic
│   ├── achievementUtils.ts  # Achievement checking & unlocking
│   ├── nicknameUtils.ts     # Nickname generation logic (52 nicknames)
│   └── dailyRewardUtils.ts  # Daily reward streak tracking
│
├── services/
│   └── geminiService.ts     # Google Gemini AI commentary integration
│
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Game constants & configuration data
├── App.tsx                  # Root React component
├── index.tsx                # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies & scripts
├── metadata.json            # Project metadata
├── .env.example             # Environment variable template
├── CLAUDE.md                # This file - AI assistant guide
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
| `constants.ts` | Game configuration: achievements (50), team names, milestones, nicknames data |

---

## Tech Stack

### Core Technologies
- **React 19.2** - UI framework with modern hooks
- **TypeScript 5.8.2** - Type safety & developer experience
- **Vite 6.2** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first styling (component-based)

### External APIs
- **Google Gemini AI** (`@google/genai` v1.30.0) - AI-powered match commentary (optional, has fallback)
- **DiceBear API** - SVG avatar generation (Micah style, 12 preset seeds)

### Build Tools
- **@vitejs/plugin-react** - React Fast Refresh support
- **TypeScript** - Type checking & compilation

### Data Persistence
- **LocalStorage** - Save game persistence (no backend required)
  - Key: `footySaveData`
  - Contains: player, league, fixtures, currentRound

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
- **FORWARD** - Scoring specialists (Goal Sense, Kicking important)
- **MIDFIELDER** - All-rounders (Disposals, Speed, Stamina)
- **DEFENDER** - Defensive specialists (Tackling, Marking)
- **RUCK** - Tall players who contest ball-ups (Marking, Stamina)

**Sub-positions** (assigned automatically in `GameContext.tsx`):
- Forward: HFF (Half Forward Flank)
- Midfielder: C (Centre)
- Defender: HBF (Half Back Flank)
- Ruck: RUCK

### Player Attributes (all 0-99)
From `PlayerAttributes` interface in `types.ts`:
- `kicking` - Goal accuracy, long kicks
- `handball` - Short passing
- `tackling` - Defensive pressure
- `marking` - Catching ability
- `speed` - Movement & agility
- `stamina` - Endurance & energy recovery
- `goalSense` - Scoring instinct

**Training**: Costs 1 skill point + 10 energy per session. Capped at `player.potential`.

### League Tiers
Progression system (`LeagueTier` enum):
1. **Local League** - Amateur clubs (e.g., "Mudcrabs", "Bushrangers", "Magpies")
2. **State League** - Regional competition
3. **AFL** - Professional league (e.g., "Collingwood", "Carlton", "Richmond")

### Season Structure
- **14-round regular season** (`SEASON_LENGTH = 14` in `constants.ts`)
- **Finals** (Top 4 teams):
  - Round 15: Semi-finals (1v4, 2v3)
  - Round 16: Grand Final (winners of semis)
- **Total season length**: 14-16 rounds depending on finals qualification

### Career Progression
- Start at age **18**, retire at **35** (`constants.ts`)
- Earn XP from matches → Level up → Gain skill points
- Train attributes (costs skill points + energy)
- Attributes capped at `player.potential` (70-95 range, generated at creation)
- Manage contracts, injuries, morale (0-100), energy (0-100)

---

## Game Systems Deep Dive

### Achievement System (50 Total)

**Categories & Distribution**:
- **CAREER** (15): Matches played, career totals, contracts, loyalty
- **MATCH** (6): Single-match performance milestones
- **SKILL** (9): Attribute training and development
- **SPECIAL** (14): Streaks, rivalries, special circumstances
- **LEGEND** (6): Ultimate achievements for hall of fame

**Rarity Tiers**:
- **COMMON**: Entry-level achievements
- **RARE**: Significant milestones
- **EPIC**: Exceptional feats
- **LEGENDARY**: Elite, career-defining achievements

**Examples** (from `constants.ts`):
- `first_game`: "First Bounce" - Play your first match (COMMON)
- `veteran_300`: "Immortal" - Play 300 career matches (LEGENDARY)
- `bag_10`: "Perfect 10" - Kick 10 goals in a match (LEGENDARY)
- `grand_final_hero`: "Big Game Player" - Win a Grand Final (LEGENDARY)
- `perfectionist`: "The GOAT" - Reach 99 in all attributes (LEGENDARY, LEGEND tier)

**Checking**: `achievementUtils.ts` - `checkAchievements()` runs after each match

### Nickname System (52 Nicknames)

**Priority-Based System** (`nicknameUtils.ts`):
- Nicknames have priority values (10-150)
- Higher priority = more specific/impressive
- System chooses highest-priority matching nickname

**Tiers** (by priority):
1. **Legendary** (100+): "The GOAT", "The Immortal", "Triple Threat", "The Dynasty"
2. **Elite Performance** (80-99): "Goal Machine", "The Engine", "The Wall", "Ball Magnet"
3. **Attribute-Based** (70-79): "Lightning", "High Flyer", "Golden Boot", "Silk"
4. **Career Milestones** (60-69): "The Legend", "Iron Man", "The Captain"
5. **Position-Specific** (50-59): "Big Man", "The Guardian", "The Destroyer"
6. **Early Career** (30-39): "Rising Star", "Young Gun", "The Prospect"
7. **Default** (10-20): "The Athlete", "The Player", "The Rookie"

**Updating**: `shouldUpdateNickname()` checks if player qualifies for a better nickname

### Daily Rewards (14-Day Cycle)

**Reward Structure** (`dailyRewardUtils.ts`):
```typescript
Day 1:  1 SP, 10 Energy - "Welcome back!"
Day 2:  1 SP, 15 Energy - "Keep it up!"
Day 3:  2 SP, 20 Energy - "On a roll!"
Day 4:  2 SP, 25 Energy - "Consistency!"
Day 5:  3 SP, 30 Energy - "Dedicated!"
Day 6:  3 SP, 35 Energy - "Almost there!"
Day 7:  5 SP, 50 Energy - "Weekly Bonus!" ⭐
Day 8:  2 SP, 20 Energy - "Keep going!"
Day 9:  2 SP, 20 Energy - "Staying strong!"
Day 10: 3 SP, 30 Energy - "Double digits!"
Day 11: 3 SP, 30 Energy - "Unstoppable!"
Day 12: 3 SP, 30 Energy - "Legendary streak!"
Day 13: 4 SP, 35 Energy - "Amazing!"
Day 14: 7 SP, 75 Energy - "2 Week Bonus!" 🎁
```

**Total Rewards per Cycle**: 36 Skill Points, 380 Energy

**Streak Tracking**:
- Stored in `player.dailyRewards.streak`
- Resets to 1 if day is missed
- Cycles back to Day 1 after Day 14

### Stadium System

**Stadium Types** (by league tier):
```typescript
Local League:
  - Types: OVAL only
  - Capacity: 200-3,000
  - Suffixes: "Oval", "Park", "Reserve", "Rec Ground", "Paddock"

State League:
  - Types: OVAL, BOUTIQUE
  - Capacity: 5,000-15,000
  - Suffixes: "Arena", "Showgrounds", "Oval", "Sportsplex", "Center"

AFL (National):
  - Types: BOUTIQUE, COLOSSEUM
  - Capacity: 30,000-100,000
  - Suffixes: "Stadium", "Colosseum", "G", "Dome", "Arena"
```

**Turf Quality**: 'Average' | 'Good' | 'Elite' | 'Mud Heap' (affects match dynamics)

**Stadium Interface** (`types.ts`):
```typescript
interface Stadium {
  name: string;
  capacity: number;
  type: 'OVAL' | 'BOUTIQUE' | 'COLOSSEUM';
  turfQuality: 'Average' | 'Good' | 'Elite' | 'Mud Heap';
}
```

### Milestones

**Four Categories** (from `constants.ts`):
- **MATCHES**: [1, 50, 100, 150, 200, 250, 300, 350, 400]
- **GOALS**: [1, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
- **DISPOSALS**: [500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]
- **TACKLES**: [100, 250, 500, 750, 1000]

**Tracking**: Stored in `player.milestones[]` with `achievedRound` and `achievedYear`

### Match Types

Three types (`Fixture.matchType`):
- **'League'**: Regular season matches (Rounds 1-14)
- **'Semi Final'**: Playoff matches (Round 15)
- **'Grand Final'**: Championship match (Round 16)

### Avatar System

**12 Preset Avatars** (`constants.ts`):
- Seeds: "Liam", "Nolan", "Felix", "Jack", "Aneka", "Leo", "Max", "Christopher", "Caleb", "Aiden", "Easton", "Wyatt"
- API: DiceBear Micah style
- URL format: `https://api.dicebear.com/9.x/micah/svg?seed=${faceId}&radius=50&backgroundColor=transparent`

---

## Architecture & Patterns

### Component Architecture
**Container/Presentational Pattern** (implicit):
- Most components in `components/` are container components
- They consume `GameContext` for state
- Handle both logic and presentation

**View Routing** via `view` state:
- No React Router - single-page app with view switching
- `view` state in `GameContext` determines which component renders
- **All Views** (from `App.tsx`):
  - `ONBOARDING` - Player creation
  - `DASHBOARD` - Main hub
  - `MATCH_PREVIEW` - Pre-match screen
  - `MATCH_SIM` - Live match simulation
  - `MATCH_RESULT` - Post-match summary
  - `TRAINING` - Attribute training
  - `CLUB` - Club/team information
  - `LEAGUE` - League ladder
  - `PLAYER` - Player stats
  - `ACHIEVEMENTS` - Achievement screen
  - `MILESTONES` - Milestone gallery
  - `PLAYER_COMPARISON` - Compare with other players
  - `SETTINGS` - Game settings
  - `CAREER_SUMMARY` - Retirement/career overview

### State Management
**Centralized Global State** via React Context:
- Single `GameContext` (`context/GameContext.tsx`) manages all game state
- No Redux or external state libraries
- State includes:
  - `player` - Player profile & stats
  - `league` - Array of teams (8 teams per league)
  - `fixtures` - Match schedule
  - `currentRound` - Season progress (1-16)
  - `view` - Current screen
  - `lastMatchResult` - Most recent match outcome
  - `showSeasonRecap` - Modal state

**Persistence**:
- `saveGame()` → Saves to `localStorage` (key: 'footySaveData')
- `loadGame()` → Loads from `localStorage`
- Auto-save on state changes (implicit in context functions)

### Data Flow
```
User Action (Component)
    ↓
Context Function (e.g., trainAttribute, commitMatchResult)
    ↓
Update State (setPlayer, setLeague, setFixtures)
    ↓
Component Re-renders
    ↓
Auto-save to LocalStorage
```

### Business Logic Location
- **Match Simulation**: `utils/simulationUtils.ts`
  - `calculateMatchOutcome()` - Player match simulation (quarter-by-quarter)
  - `simulateCPUMatch()` - CPU vs CPU matches
  - Generates match events, stats, votes, injuries, rivalries
- **League Management**: `utils/leagueUtils.ts`
  - `generateLeague()` - Create 8 teams with players, stadiums, coaches
  - `generateFixtures()` - Season schedule (14 rounds, home/away balance)
  - `updateLadderTeam()` - Update team standings (wins, losses, percentage)
  - `generateSemiFinals()` - Create playoff fixtures
  - `generateGrandFinal()` - Create championship match
- **Achievements**: `utils/achievementUtils.ts`
  - `checkAchievements()` - Validate unlocks based on player stats and match results
- **Nicknames**: `utils/nicknameUtils.ts`
  - `shouldUpdateNickname()` - Check eligibility (every 10 matches)
  - `generateNickname()` - Create nickname based on priority system
- **Daily Rewards**: `utils/dailyRewardUtils.ts`
  - `canClaimDailyReward()` - Check if 24 hours elapsed
  - `claimDailyReward()` - Award skill points and energy

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

**Environment Variables**:
- `VITE_API_KEY` → Google Gemini API key (optional)
- Note: `vite.config.ts` maps `GEMINI_API_KEY` to `process.env.GEMINI_API_KEY`

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
- **Experimental Decorators**: Enabled
- **useDefineForClassFields**: false

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
6. **Add View** to view enum if new screen
7. **Update App.tsx** to route to new view
8. **Test** manually via dev server

### Adding a New Achievement
```typescript
// 1. Add to constants.ts ACHIEVEMENTS array
export const ACHIEVEMENTS: Achievement[] = [
  // ...existing achievements (currently 50)
  {
    id: 'new_achievement',
    name: 'Achievement Name',
    description: 'Do something amazing',
    icon: '🎯',
    category: 'SPECIAL', // CAREER | MATCH | SKILL | SPECIAL | LEGEND
    rarity: 'EPIC', // COMMON | RARE | EPIC | LEGENDARY
    requirement: 'custom_condition'
  },
];

// 2. Update achievementUtils.ts checkAchievements()
export const checkAchievements = (player: PlayerProfile, result?: MatchResult): string[] => {
  // ...existing checks

  // Add custom check
  if (customCondition && !hasAchievement('new_achievement')) {
    newUnlocks.push('new_achievement');
  }

  return newUnlocks;
};
```

### Adding a New Nickname
```typescript
// Add to nicknameUtils.ts NICKNAME_RULES array
const NICKNAME_RULES: NicknameRule[] = [
  // ...existing nicknames (currently 52)
  {
    nickname: "Your New Nickname",
    condition: (p) => p.careerStats.goals >= 100 && p.age < 25,
    priority: 75 // Higher = higher priority
  },
];
```

### Adding a New Attribute
```typescript
// 1. Update types.ts
export interface PlayerAttributes {
  kicking: number;
  handball: number;
  tackling: number;
  marking: number;
  speed: number;
  stamina: number;
  goalSense: number;
  newAttribute: number; // ADD THIS
}

// 2. Update Onboarding.tsx to include in character creation

// 3. Update Training.tsx to allow training

// 4. Update simulationUtils.ts to use in match calculations

// 5. Update achievementUtils.ts if tracking related achievements

// 6. Consider adding nickname rules in nicknameUtils.ts
```

### Adding a New Component Screen
```typescript
// 1. Create components/NewScreen.tsx
export const NewScreen: React.FC = () => {
  const { player, setView } = useGameContext();

  return (
    <div className="p-4">
      <button onClick={() => setView('DASHBOARD')}>Back</button>
      {/* ... content */}
    </div>
  );
};

// 2. Update GameContext.tsx view type
type ViewType =
  | 'ONBOARDING'
  | 'DASHBOARD'
  // ... existing views
  | 'NEW_SCREEN'; // ADD THIS

// 3. Update App.tsx ScreenSelector to handle new view
case 'NEW_SCREEN':
  return <NewScreen />;

// 4. Add navigation from existing components
<button onClick={() => setView('NEW_SCREEN')}>
  Go to New Screen
</button>
```

---

## State Management

### GameContext API

#### State Properties
```typescript
{
  player: PlayerProfile | null,        // Current player data
  league: Team[],                      // All teams in current league (8 teams)
  fixtures: Fixture[],                 // Match schedule (14 regular + 2 finals max)
  currentRound: number,                // Current round (1-16)
  view: ViewType,                      // Current screen
  lastMatchResult: MatchResult | null, // Most recent match result
  showSeasonRecap: boolean             // Show recap modal
}
```

#### Key Functions
```typescript
// Game Lifecycle
startNewGame(profile: PlayerProfile): void
resetGame(): void                     // Wipe save data
saveGame(): void                      // Manual save to localStorage
loadGame(): boolean                   // Load from localStorage, returns success
retirePlayer(): void                  // End career, show CareerSummary

// Match Flow
generateMatchSimulation(fixtureIndex: number): MatchResult
commitMatchResult(fixtureIndex: number, result: MatchResult): void
advanceRound(): void                  // Progress to next round (handles finals logic)
simulateRound(): void                 // Skip round (if injured), simulates CPU matches

// Training
trainAttribute(attr: keyof PlayerProfile['attributes']): void
  // Costs 1 skill point + 10 energy
  // Capped at player.potential

// Daily Rewards
canClaimReward(): boolean             // Check if 24 hours elapsed
claimReward(): void                   // Award skill points + energy, update streak

// UI
setView(view: ViewType): void
dismissSeasonRecap(): void
acknowledgeMilestone(): void
```

### LocalStorage Schema
```javascript
// Key: 'footySaveData'
{
  player: PlayerProfile,
  league: Team[],
  fixtures: Fixture[],
  currentRound: number
}
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
console.log('Timeline:', result.timeline);
```

### Adjusting Difficulty
```typescript
// constants.ts
export const INITIAL_ATTRIBUTE_POINTS = 15; // Increase for easier start (default: 15)

// utils/simulationUtils.ts
// Adjust opponent team rating calculations
const opponentTeamRating = calculateTeamRating(opponentTeam) * 0.9; // 10% nerf

// Or boost player performance
const playerBoost = 1.1; // 10% boost to player stats
```

### Adding New Team Names
```typescript
// constants.ts
export const TEAM_NAMES_LOCAL = [
  "Mudcrabs", "Bushrangers", "Magpies", "Tigers", "Blues", "Demons", "Lions", "Hawks"
  // ADD NEW TEAM NAME HERE
];

export const TEAM_NAMES_AFL = [
  "Collingwood", "Carlton", "Essendon", "Richmond", "Hawthorn", "Geelong", "Sydney", "Brisbane"
  // ADD NEW AFL TEAM HERE
];
```

### Modifying Season Length
```typescript
// constants.ts
export const SEASON_LENGTH = 14; // Change to desired rounds (default: 14)

// NOTE: Finals logic in GameContext.tsx assumes 14-round season
// Update these conditions in advanceRound():
if (currentRound === SEASON_LENGTH) {
  // End of regular season - generate semi-finals
}
else if (currentRound === SEASON_LENGTH + 1) {
  // After semi-finals - generate grand final
}
else if (currentRound === SEASON_LENGTH + 2) {
  // After grand final - show season recap
}
```

### Testing AI Commentary
```typescript
// 1. Create .env file with VITE_API_KEY=your_gemini_key
// 2. services/geminiService.ts will be used for commentary
// 3. Check console for API errors
// 4. Fallback commentary is used if API fails or key missing
```

### Verifying Achievement Count
```bash
# Count achievements in constants.ts
awk '/export const ACHIEVEMENTS/,/^];/' constants.ts | grep -E "^\s*\{" | wc -l
# Should output: 50
```

### Verifying Nickname Count
```bash
# Count nicknames in nicknameUtils.ts
grep -c '{ nickname:' utils/nicknameUtils.ts
# Should output: 52
```

---

## Important Files Reference

### Critical Files (Modify with Care)
| File | Purpose | Caution |
|---|---|---|
| `context/GameContext.tsx` | Core game state & logic | Breaking changes affect entire app. 690+ lines. |
| `types.ts` | Type definitions (183 lines) | Changes ripple through codebase. Update all usages. |
| `utils/simulationUtils.ts` | Match engine (620+ lines) | Complex logic, test thoroughly. Affects game balance. |
| `constants.ts` | Game configuration (219 lines) | Balance-sensitive: achievements (50), names, milestones |

### Feature-Specific Files
| File | Purpose | Notes |
|---|---|---|
| `utils/achievementUtils.ts` | Achievement logic (50 achievements) | Self-contained, safe to modify |
| `utils/nicknameUtils.ts` | Nickname generation (52 nicknames) | Priority-based system, self-contained |
| `utils/dailyRewardUtils.ts` | Daily reward logic (14-day cycle) | Self-contained streak tracking |
| `utils/leagueUtils.ts` | League/team generation | Stadium system, fixture generation |

### Safe to Modify
| File | Purpose | Notes |
|---|---|---|
| `components/*.tsx` | UI components (16 components) | Mostly presentation, safe to edit |
| `README.md` | User documentation | Safe to update, no code impact |
| `CLAUDE.md` | AI assistant guide (this file) | Documentation only |

### Configuration Files
| File | Purpose |
|---|---|
| `vite.config.ts` | Build configuration, dev server (port 3000), path aliases |
| `tsconfig.json` | TypeScript compiler options (ES2022, ESNext) |
| `package.json` | Dependencies (React 19.2, TypeScript 5.8, Vite 6.2, Gemini 1.30) |
| `.env` | Environment variables (VITE_API_KEY for Gemini) |
| `metadata.json` | Project metadata (mobile-first flag) |

### Entry Points
| File | Purpose |
|---|---|
| `index.html` | HTML template, mounts React app |
| `index.tsx` | React app mount point, wraps with GameProvider |
| `App.tsx` | Root component, view router (ScreenSelector switch) |

---

## AI Assistant Guidelines

### When Modifying Code
1. **Always read existing files first** before making changes
2. **Preserve game balance** - don't make player too powerful
3. **Maintain TypeScript types** - update `types.ts` if adding properties
4. **Follow existing patterns** - match component structure
5. **Test match simulation** - changes to `simulationUtils.ts` need testing
6. **Update constants.ts** - for new achievements, teams, milestones
7. **Don't break saves** - avoid removing required fields from `PlayerProfile`
8. **Check achievement count** - Currently 50, not 52
9. **Season length** - 14 regular rounds, not 22

### When Adding Features
1. Check if similar features exist (e.g., achievements, milestones, nicknames)
2. Reuse existing utilities where possible
3. Add TypeScript types before implementation
4. Update `GameContext` only if state/actions needed
5. Consider mobile-first design (game is mobile-optimized)
6. Follow priority system for nickname additions (10-150 range)
7. Respect rarity tiers for achievements (COMMON → LEGENDARY)

### When Debugging
1. Check browser console for errors
2. Inspect `localStorage` for save data corruption (key: 'footySaveData')
3. Verify TypeScript compilation (`npm run build`)
4. Test without API key (fallback paths should work)
5. Check match simulation timeline for event generation
6. Verify achievement unlocks in `achievementUtils.ts`

### Red Flags to Avoid
- ❌ Removing fields from `PlayerProfile` without migration logic
- ❌ Changing `SEASON_LENGTH` without updating finals logic (rounds 15-16)
- ❌ Modifying `types.ts` without updating all usages
- ❌ Breaking LocalStorage schema compatibility
- ❌ Removing required props from components
- ❌ Saying there are 52 achievements (there are 50)
- ❌ Saying season is 22 rounds (it's 14 regular + 2 finals max)
- ❌ Modifying nickname priorities without understanding impact on selection

---

## Version History

- **0.0.5.0_ANTHR** (Current Development Build - 2026-01-03)
  - Latest updates and refinements
  - Enhanced stability

- **0.0.1.0_Gamma** (Stable Release - documented in README)
  - All 7 Quick Wins features implemented:
    1. Achievement system (50 achievements across 5 categories)
    2. Daily login rewards (14-day cycle)
    3. Dynamic nicknames (52 unique nicknames with priority system)
    4. Jersey numbers (1-99 selection)
    5. Milestones gallery (4 categories: Matches, Goals, Disposals, Tackles)
    6. Player comparison tool
    7. Season recap with performance grades (A+ to D)
  - Stadium system with detailed venue data (capacity, type, turf quality)
  - Rivalry system
  - Injury system with recovery tracking
  - 14-round season + finals structure
  - Google Gemini AI commentary integration (optional)
  - DiceBear avatar system (12 presets)
  - LocalStorage save/load system

- **Initial Commit** (eb4d318)
  - Project scaffolding
  - Basic React + TypeScript + Vite setup

---

## Known Discrepancies & Notes

### Documentation vs Implementation
1. **Achievement Count**: README says 52, actual implementation has **50**
2. **Season Length**: README mentions "22-round" but code implements **14-round** regular season + 2 finals
3. **Version**: README shows 0.0.1.0_Gamma, latest build is **0.0.5.0_ANTHR**

### Future Considerations
- State league implementation (currently only Local and AFL tiers are fully implemented)
- Contract negotiation system expansion
- Trade system between clubs
- Hall of Fame induction ceremony
- Career mode longevity (age 35 retirement may need balancing)

---

## Contact & Contribution

This is a **private project** (per README.md).
- No public contributions accepted
- Feedback/suggestions welcome through project owner
- Repository: VoidbreakDev/AFL_Footy_Stars

---

**Last Updated**: 2026-01-03
**Generated for**: Claude AI Assistant
**Repository**: AFL_Footy_Stars
**Documentation Version**: 2.0 (Comprehensive Analysis)
