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

---

## Project Overview

**AFL Footy Stars** is a comprehensive Australian Football League (AFL) career simulation game built as a single-page React application. Players create a custom AFL player and progress through their career from local leagues to the AFL, managing attributes, contracts, matches, achievements, and more.

### Core Features
- **Player Creation**: Customizable player with name, position, avatar, jersey number
- **Career Progression**: Advance through Local League → State League → AFL
- **Match Simulation**: Dynamic match engine with real-time events and AI commentary
- **Training System**: Attribute improvement via skill points
- **Achievement System**: 52 unlockable achievements across 5 categories
- **Daily Rewards**: 14-day login streak system
- **Nicknames**: Dynamic nickname system based on playstyle
- **Player Comparison**: Compare stats with league players
- **Season Recap**: End-of-season performance summaries
- **Milestones Gallery**: Visual career milestone tracking

### Version
Current Version: **0.0.1.0_Gamma** (as per README)

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
│   ├── nicknameUtils.ts     # Nickname generation logic
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
| `constants.ts` | Game configuration, team names, achievements, milestones |

---

## Tech Stack

### Core Technologies
- **React 19.2** - UI framework with modern hooks
- **TypeScript 5.8.2** - Type safety & developer experience
- **Vite 6.2** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first styling (implied from component structure)

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
1. **Local League** - Amateur clubs (e.g., "Mudcrabs", "Bushrangers")
2. **State League** - Regional competition
3. **AFL** - Professional league (e.g., "Collingwood", "Richmond")

### Career Progression
- Start at age 18, retire at 35 (`constants.ts`)
- Earn XP from matches → Level up → Gain skill points
- Train attributes (costs skill points + energy)
- Attributes capped at `player.potential` (varies per player)
- Manage contracts, injuries, morale, energy

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
- Views: `ONBOARDING`, `DASHBOARD`, `MATCH_SIM`, `TRAINING`, `ACHIEVEMENTS`, etc.

### State Management
**Centralized Global State** via React Context:
- Single `GameContext` (`context/GameContext.tsx`) manages all game state
- No Redux or external state libraries
- State includes:
  - `player` - Player profile & stats
  - `league` - Array of teams
  - `fixtures` - Match schedule
  - `currentRound` - Season progress
  - `view` - Current screen

**Persistence**:
- `saveGame()` → Saves to `localStorage`
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
- **Match Simulation**: `utils/simulationUtils.ts`
  - `calculateMatchOutcome()` - Player match simulation
  - `simulateCPUMatch()` - CPU vs CPU matches
- **League Management**: `utils/leagueUtils.ts`
  - `generateLeague()` - Create teams
  - `generateFixtures()` - Season schedule
  - `updateLadderTeam()` - Update standings
- **Achievements**: `utils/achievementUtils.ts`
  - `checkAchievements()` - Validate unlocks
- **Nicknames**: `utils/nicknameUtils.ts`
  - `shouldUpdateNickname()` - Check eligibility
  - `generateNickname()` - Create nickname

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
6. **Add View** to view enum if new screen
7. **Test** manually via dev server

### Adding a New Achievement
```typescript
// 1. Add to constants.ts
export const ACHIEVEMENTS: Achievement[] = [
  // ...existing achievements
  {
    id: 'new_achievement',
    name: 'Achievement Name',
    description: 'Do something amazing',
    icon: '🎯',
    category: 'SPECIAL',
    rarity: 'EPIC',
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

### Adding a New Attribute
```typescript
// 1. Update types.ts
export interface PlayerAttributes {
  kicking: number;
  handball: number;
  // ... existing
  newAttribute: number; // ADD THIS
}

// 2. Update constants.ts INITIAL_ATTRIBUTE_POINTS (if needed)

// 3. Update Onboarding.tsx to include in character creation

// 4. Update Training.tsx to allow training

// 5. Update simulationUtils.ts to use in match calculations
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
  // ... existing
  | 'NEW_SCREEN'; // ADD THIS

// 3. Update App.tsx to render new view
{view === 'NEW_SCREEN' && <NewScreen />}

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
  league: Team[],                      // All teams in current league
  fixtures: Fixture[],                 // Match schedule
  currentRound: number,                // Current round (1-14 regular season)
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
saveGame(): void                      // Manual save
loadGame(): boolean                   // Load from localStorage
retirePlayer(): void                  // End career

// Match Flow
generateMatchSimulation(fixtureIndex: number): MatchResult
commitMatchResult(fixtureIndex: number, result: MatchResult): void
advanceRound(): void                  // Progress to next round
simulateRound(): void                 // Skip round (if injured)

// Training
trainAttribute(attr: keyof PlayerProfile['attributes']): void

// Daily Rewards
canClaimReward(): boolean
claimReward(): void

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
```

### Adjusting Difficulty
```typescript
// constants.ts
export const INITIAL_ATTRIBUTE_POINTS = 15; // Increase for easier start

// utils/simulationUtils.ts
// Adjust opponent rating calculations
const opponentTeamRating = calculateTeamRating(opponentTeam) * 0.9; // 10% nerf
```

### Adding New Team Names
```typescript
// constants.ts
export const TEAM_NAMES_LOCAL = [
  "Mudcrabs", "Bushrangers", /* ... */,
  "New Team Name" // ADD HERE
];

export const TEAM_NAMES_AFL = [
  "Collingwood", "Carlton", /* ... */,
  "New AFL Team" // ADD HERE
];
```

### Modifying Season Length
```typescript
// constants.ts
export const SEASON_LENGTH = 14; // Change to desired rounds

// Note: Finals logic in GameContext.tsx assumes 14-round season
// May need to adjust finals qualification logic
```

### Testing AI Commentary
```typescript
// 1. Add .env file with VITE_API_KEY
// 2. services/geminiService.ts will be used
// 3. Check console for API errors
// 4. Fallback commentary used if API fails
```

---

## Important Files Reference

### Critical Files (Modify with Care)
| File | Purpose | Caution |
|---|---|---|
| `context/GameContext.tsx` | Core game state & logic | Breaking changes affect entire app |
| `types.ts` | Type definitions | Changes ripple through codebase |
| `utils/simulationUtils.ts` | Match engine | Complex logic, test thoroughly |
| `constants.ts` | Game configuration | Balance-sensitive data |

### Safe to Modify
| File | Purpose | Notes |
|---|---|---|
| `components/*.tsx` | UI components | Mostly presentation, safe to edit |
| `utils/achievementUtils.ts` | Achievement logic | Self-contained |
| `utils/nicknameUtils.ts` | Nickname generation | Self-contained |
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
2. **Preserve game balance** - don't make player too powerful
3. **Maintain TypeScript types** - update `types.ts` if adding properties
4. **Follow existing patterns** - match component structure
5. **Test match simulation** - changes to `simulationUtils.ts` need testing
6. **Update constants.ts** - for new achievements, teams, milestones
7. **Don't break saves** - avoid removing required fields from `PlayerProfile`

### When Adding Features
1. Check if similar features exist (e.g., achievements, milestones)
2. Reuse existing utilities where possible
3. Add TypeScript types before implementation
4. Update `GameContext` only if state/actions needed
5. Consider mobile-first design (game is mobile-optimized)

### When Debugging
1. Check browser console for errors
2. Inspect `localStorage` for save data corruption
3. Verify TypeScript compilation (`npm run build`)
4. Test without API key (fallback paths)

### Red Flags to Avoid
- ❌ Removing fields from `PlayerProfile` without migration logic
- ❌ Changing `SEASON_LENGTH` without updating finals logic
- ❌ Modifying `types.ts` without updating all usages
- ❌ Breaking LocalStorage schema compatibility
- ❌ Removing required props from components

---

## Version History

- **0.0.1.0_Gamma** (Current) - Initial feature-complete version
  - All 7 Quick Wins features implemented
  - Achievement system (52 achievements)
  - Daily rewards
  - Nicknames, jersey numbers, player comparison
  - Milestones gallery, season recap

---

## Contact & Contribution

This is a **private project** (per README.md).
- No public contributions accepted
- Feedback/suggestions welcome through project owner

---

**Last Updated**: 2025-12-20
**Generated for**: Claude AI Assistant
**Repository**: AFL_Footy_Stars
