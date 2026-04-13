# AFL Footy Stars - Project Context

## Project Overview

**AFL Footy Stars** is a full-featured Australian Football League (AFL) career simulation game built as a single-page React application. Players create a custom player, progress from local amateur leagues through to the AFL, manage their career attributes, contracts, injuries, and media reputation, and chase legendary status.

- **Version:** 1.0.0.0 Beta1
- **Platform:** Web (mobile-first PWA)
- **Persistence:** Browser LocalStorage (no backend, no database, no account required)
- **Save Key:** `footyLegendSave`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19.2 |
| Language | TypeScript 5.8 |
| Build Tool | Vite 6.2 |
| Styling | Tailwind CSS |
| AI Commentary | Google Gemini (`@google/genai` v1.30) — optional |
| Avatars | DiceBear API (Micah style) |
| State Management | React Context API (centralized in `GameContext.tsx`) |

---

## Building and Running

### Prerequisites
- Node.js v16+
- npm

### Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### AI Commentary (Optional)
```bash
# Copy env template
cp .env.example .env
```
Then add your Gemini API key to `.env`:
```
VITE_API_KEY=your_gemini_api_key_here
```
The game works fully without this key — AI commentary is a bonus feature.

---

## Project Structure

```
AFL_Footy_Stars/
├── components/              # React UI components (32 files)
│   ├── Dashboard.tsx        # Main hub — fixtures, stats, quick actions
│   ├── Onboarding.tsx       # Player creation wizard
│   ├── MatchSim.tsx         # Live match simulation & result screen
│   ├── Training.tsx         # Attribute training interface
│   ├── TransferMarket.tsx   # Transfer offers & contract negotiation
│   ├── Shop.tsx             # In-game shop (28+ items)
│   ├── MasterSkillTree.tsx  # Advanced skill progression
│   ├── MediaHub.tsx         # Media events & reputation management
│   ├── TeamChemistry.tsx    # Teammate relationships
│   ├── CoachingStaff.tsx    # Hire and manage coaching staff
│   ├── CareerEvents.tsx     # Random career events with choices
│   ├── Draft.tsx            # AFL draft screen
│   ├── AwardsCeremony.tsx   # End-of-season awards presentation
│   ├── SeasonRecap.tsx      # Season summary screen
│   ├── CareerSummary.tsx    # Retirement & career overview
│   ├── SlotSelect.tsx       # Save slot selection
│   └── ...                  # (see full list in components/)
│
├── context/
│   └── GameContext.tsx      # All game state & actions (~3000 lines)
│
├── utils/                   # Business logic (15 files)
│   ├── simulationUtils.ts   # Match engine
│   ├── seasonUtils.ts       # Season progression & promotion/relegation
│   ├── achievementUtils.ts  # Achievement checking
│   ├── awardUtils.ts        # Brownlow, Coleman, All-Australian calculation
│   ├── transferUtils.ts     # Transfer offer generation
│   ├── chemistryUtils.ts    # Team relationship tracking
│   ├── coachingUtils.ts     # Staff initialisation & passive buffs
│   ├── careerEventUtils.ts  # Random event generation & resolution
│   ├── masterSkillUtils.ts  # Skill tree unlocking
│   ├── mediaUtils.ts        # Reputation events & fan milestones
│   ├── draftUtils.ts        # Draft prospect generation & simulation
│   ├── leagueUtils.ts       # League generation & ladder logic
│   ├── nicknameUtils.ts     # Dynamic nickname generation
│   ├── dailyRewardUtils.ts  # Daily reward streak tracking
│   └── rosterUtils.ts       # AI team roster turnover
│
├── services/
│   └── geminiService.ts     # Google Gemini AI commentary
│
├── types.ts                 # All TypeScript interfaces & enums (~720 lines)
├── constants.ts             # Game data & configuration (~1275 lines)
├── App.tsx                  # Root component & view router
├── _prompts/                # Sub-agent development prompts (v1.1 features)
└── CLAUDE.md                # Full developer & AI-assistant reference guide
```

---

## Key Architecture Concepts

### View-Based Routing
The app uses a **view state** system (no React Router) managed in `GameContext`. The `view` string determines which component renders in `App.tsx`.

**Current Views (23):**
```
'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' |
'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' | 'MILESTONES' |
'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' | 'CAREER_SUMMARY' |
'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' | 'COACHING_STAFF' |
'MASTER_SKILLS' | 'SLOT_SELECT'
```

**Modal overlays** (boolean flags, not view states):
- `showFinalsIntro` → `FinalsIntro.tsx`
- `showSemiFinalsResults` → `SemiFinalsResults.tsx`
- `showGrandFinalResult` → `GrandFinalResult.tsx`
- `showSeasonRecap` → `SeasonRecap.tsx`
- `showDailyReward` → `DailyRewardModal.tsx`
- `showAwardsCeremony` → `AwardsCeremony.tsx`

### State Management
- **Single source of truth:** `context/GameContext.tsx` (~3000 lines)
- **Pattern:** React Context API with functional state updates
- **Persistence:** Auto-saves to `localStorage` under key `footyLegendSave`

### Data Flow
```
User Action → Context Function → State Update → Re-render → Auto-save
```

---

## Game Mechanics Summary

### Career Progression
- **3-tier league system:** Local League (8 teams) → State League (8 teams) → AFL (8 teams)
- **Promotion/relegation** based on ladder position
- **Career span:** Age 18 to 35
- **Season length:** 14 regular rounds + finals (top 4)

### Player Attributes (0–99)
- **Kicking** — Goal accuracy, long kicks
- **Handball** — Short passing
- **Tackling** — Defensive pressure
- **Marking** — Catching ability
- **Speed** — Movement & agility
- **Stamina** — Endurance & energy recovery
- **Goal Sense** — Scoring instinct

### Positions
| Position | Key Attributes |
|----------|---------------|
| Forward | Goal Sense, Marking, Kicking |
| Midfielder | Speed, Handball, Stamina |
| Defender | Tackling, Marking, Speed |
| Ruck | Stamina, Marking, Kicking |

### Core Systems
- **Match Simulation:** Dynamic quarter-by-quarter engine with event timeline
- **Training:** Spend skill points to improve attributes (capped by player potential)
- **Contracts & Transfers:** Salary negotiations, transfer offers, club roles
- **Injury System:** 6 injury types with varying recovery times
- **Media & Reputation:** 6-tier scale, fan followers, social media posts
- **Team Chemistry:** 7-tier relationship system with teammates
- **Coaching Staff:** Hire coaches with personality types affecting passive bonuses
- **Master Skill Tree:** 30+ advanced skills across 5 categories (Common → Legendary)
- **Career Events:** 30+ random events with choice-based outcomes
- **Shop:** 28+ items across Recovery, Training, Boosters, Career categories
- **Awards:** 9 types — Brownlow, Coleman, All-Australian, Rising Star, etc.
- **Achievements:** 70+ across 5 categories with 4 rarity tiers

---

## Development Guidelines

### Critical Files (modify with care)
| File | Why It's Critical |
|------|------------------|
| `context/GameContext.tsx` | All game state & logic — changes ripple everywhere |
| `types.ts` | TypeScript interfaces — changes propagate codebase-wide |
| `utils/simulationUtils.ts` | Match engine — complex logic, test thoroughly |
| `constants.ts` | Balance-sensitive game data (teams, items, events) |

### Safe to Modify
- Components in `components/` — mostly presentation, isolated
- Individual utils (e.g., `achievementUtils.ts`, `nicknameUtils.ts`) — self-contained

### Adding Features — General Pattern
1. Define types in `types.ts` (if needed)
2. Add constants in `constants.ts` (if needed)
3. Create utility functions in appropriate `utils/*.ts`
4. Update `GameContext.tsx` if state/actions needed
5. Create/update component in `components/`
6. Add to view type union if new screen
7. Test via dev server

### Save Data Compatibility
- **Never remove fields** from `PlayerProfile` — only add optional (`?`) fields
- Save key is `footyLegendSave`

### Code Style
- **Components:** PascalCase `.tsx` files
- **Utils:** camelCase `.ts` files
- **Styling:** Tailwind CSS utility classes (mobile-first)
- **State updates:** Always use functional updates (`setPlayer(prev => ({ ...prev, ... }))`)

### Path Aliases
```typescript
import { GameContext } from '@/context/GameContext'  // @/ resolves to root
```

---

## Debugging Tips

### Inspect Save Data
```javascript
// Browser console:
JSON.parse(localStorage.getItem('footyLegendSave'))
```

### Test AI Commentary
1. Add `.env` with `VITE_API_KEY`
2. `services/geminiService.ts` activates automatically
3. Falls back to built-in commentary if API fails

### Match Simulation Debugging
- Add `console.log` statements in `utils/simulationUtils.ts`
- Log events and player stats to trace simulation flow

---

## Key Files Quick Reference

| File | Lines | Purpose |
|------|-------|---------|
| `context/GameContext.tsx` | ~3000 | All game state, actions, persistence |
| `types.ts` | ~720 | TypeScript interfaces & enums |
| `constants.ts` | ~1275 | Teams, awards, shop items, events, milestones |
| `App.tsx` | ~90 | Root component, view router |
| `utils/simulationUtils.ts` | — | Match engine |
| `utils/seasonUtils.ts` | — | Season progression, promotion/relegation |
| `utils/awardUtils.ts` | — | Award calculations |
| `services/geminiService.ts` | — | AI commentary integration |

---

## v1.1 Roadmap

The `_prompts/` folder contains detailed sub-agent prompts for v1.1 feature development:

| File | Category | Highlights |
|------|----------|------------|
| `_prompts/01_GAMEPLAY.md` | Gameplay | Position-specific roles, energy management, tactical setup, injury rehab |
| `_prompts/02_PROGRESSION.md` | Progression | Legacy score, captaincy system, retirement planning, attribute decline |
| `_prompts/03_SOCIAL_MEDIA.md` | Social & Media | Fan mail, club culture, rivalry lifecycle |
| `_prompts/04_POLISH_UX.md` | Polish & UX | Draft bug fixes, 3-slot save system, match highlights, onboarding tutorial |
| `_prompts/05_CONTENT.md` | Content | Training mini-games, club history, AFLW women's league |

See `_prompts/README.md` for merge order and coordination notes.

---

## Additional Resources

- **CLAUDE.md** — Comprehensive developer reference with architecture patterns, how-to guides, and AI assistant guidelines
- **README.md** — User-facing documentation with game features and mechanics
- **_prompts/** — Sub-agent development prompts for v1.1 features
