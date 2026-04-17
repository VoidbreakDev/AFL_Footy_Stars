# AFL Footy Stars

A full-featured Australian Football League career simulation game built with React, TypeScript, and Vite. Create a custom player, rise through the ranks from local footy to the AFL, manage your career, and chase legendary status.

**Version:** 1.3.1 &nbsp;|&nbsp; **Platform:** Web (mobile-first PWA) &nbsp;|&nbsp; **Save system:** LocalStorage (no account required)

---

---

## What's Updated in v1.3 & v1.3.1

### v1.3 — Off-Field Management & Narrative Depth
- **Career Story Arcs** — season-spanning narrative threads with Setup → Escalation → Resolution acts. 10 arc types (Contract Saga, Rivalry Escalation, Captaincy Journey, Media Firestorm, Redemption Arc, Legacy Chase, Farewell Season, and more)
- **Media Conference System** — structured pre-match and post-match press interactions with choice-driven reputation consequences
- **Club Culture Activation** — each club culture type (Premiership Hungry, Rebuilding, Storied Club, Underdog, Big City) now generates unique events and passive gameplay effects
- **Locker Room Drama** — faction splits, star player fallouts, captain crises, and team-building moments tied to chemistry
- **Legacy Score Overhaul** — milestone-gated legacy system with 6 tiers (Journeyman → AFL Icon) tracking statistical dominance, awards, longevity, narrative impact, and community standing
- **Community Engagement** — fan mail interactions, school visits, charity matches, and sponsor appearances that build the sense of a living world
- **Dynamic Biography** — career story auto-generates each season using Gemini AI (with template fallback), turning your career into a living narrative
- **Expanded Milestones** — legacy path visualization, new milestone categories (Votes, Awards, Seasons, Chemistry, Legacy, Narrative)

### v1.3.1 — Mobile UI Polish & Navigation Restructure
- **Bottom Nav Overhaul** — replaced Club tab with new Hub view; all off-field screens (Shop, Transfer Market, Media, Career Events, Achievements, Skills, Settings) now accessible from a unified 2-column grid with dynamic status hints
- **Shop Redesign** — full mobile-first rewrite: replaced tall card grid with compact ~64px row layout, streamlined category tabs, colour token consistency (`slate-*` / `emerald-*`), improved wallet visibility
- **Dashboard Cleanup** — removed large Shop banner; added Quick-Access pill row (Train, Shop, Skills, Hub) above the match card for faster navigation
- **Consistent Back Navigation** — new `BackHeader` component standardises header bar (`sticky`, `backdrop-blur`, 56px height) across all sub-views
- **Touch Target Audit** — minimum 44×44px compliance: nav labels, notification chips, and category tabs now properly sized for thumb reach
- **Safe Area Padding** — all scrollable views now use `pb-24` to clear the 80px bottom nav

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [How to Play](#how-to-play)
3. [Features](#features)
4. [Game Mechanics](#game-mechanics)
5. [Project Structure](#project-structure)
6. [Tech Stack](#tech-stack)
7. [Development](#development)
8. [Roadmap](#roadmap)

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm

### Install & run

```bash
# Install dependencies
npm install

# Start the dev server (localhost:3000)
npm run dev
```

### Optional — AI match commentary

The game ships with built-in fallback commentary. To enable AI-powered commentary via Google Gemini:

```bash
# Copy the env template
cp .env.example .env
```

Then add your key to `.env`:
```
VITE_API_KEY=your_gemini_api_key_here
```

The game works fully without a key — AI commentary is a bonus, not a requirement.

### Build for production

```bash
npm run build    # Outputs to /dist
npm run preview  # Preview the production build locally
```

---

## How to Play

### 1. Create your player
Pick a name, gender, position, jersey number, and avatar. Allocate your starting attribute points — these shape your early career ceiling.

### 2. Play the season
Each season runs 14 rounds of regular fixtures plus finals. From the Dashboard each round you can:
- **Play your match** — simulate the game and earn XP, stats, and Brownlow votes
- **Train** — spend skill points to improve attributes
- **Manage your club** — review teammates, chemistry, and coaching staff
- **Check the market** — review transfer offers before they expire

### 3. Progress your career
- **Local League → State League → AFL** — earn promotion by finishing in the top positions
- Attributes grow through training up to your player's potential cap
- Contracts expire and new offers come in — weigh up salary, club ranking, and playing role
- Injuries, rivalries, media events, and random career events keep each season unpredictable

### 4. Chase legacy
Win premierships, rack up Brownlow votes, break milestone records, and unlock legendary master skills to cement your place in AFL history.

---

## Features

### Career & progression
- **3-tier league system** — Local League (8 teams) → State League (8 teams) → AFL (8 teams)
- **Promotion & relegation** — finish top of the ladder to move up; struggle and risk dropping down
- **Multi-season career history** — full season-by-season record stored throughout your career
- **Age progression** — career spans age 18 to 35; manage the long game
- **Contract system** — salary negotiations, contract length, and club role (Star / Starter / Rotation / Depth)
- **Transfer market** — dynamic offers from rival clubs with expiry timers
- **Draft system** — interactive AFL draft when promoted; pick prospects, simulate remaining picks

### Match simulation
- **Dynamic match engine** — quarter-by-quarter simulation with a full event timeline
- **Position-aware events** — goals, marks, tackles, free kicks, turnovers, and rivalries
- **Injury system** — 6 injury types with varying recovery times (1–10 weeks)
- **Rivalry events** — head-to-head moments fire when facing established rivals
- **AI commentary** — Gemini-powered narration (optional) with built-in fallback phrases
- **Post-match press conference** — respond to media after every game

### Player development
- **7 attributes** — Kicking, Handball, Tackling, Marking, Speed, Stamina, Goal Sense (all 0–99)
- **Potential system** — each player has a ceiling; training pushes you toward it
- **Skill points & XP** — earned from matches and milestones, spent on training
- **Master Skill Tree** — 30+ advanced skills across 5 attribute categories (Common → Legendary rarity)
- **Energy & morale management** — both affect match performance and training capacity

### Club & team systems
- **Team chemistry** — 7-tier relationship system with each teammate (Enemy → Best Mate); locker room drama events affect morale and splits
- **Chemistry events** — interactive moments that shift relationships (faction splits, star player fallouts, captain crises, celebration moments, training incidents)
- **Club culture** — 5 culture archetypes (Premiership Hungry, Rebuilding, Storied Club, Underdog, Big City) each generate unique events, passive bonuses, and narrative flavour
- **Coaching staff** — hire a head coach and support staff (Physio, Fitness Trainer, Nutritionist, Mental Coach, Skills Coach); each has a personality type that affects passive bonuses
- **Club hub** — unified access point for club info, team roster, stadium details, and team colours; redesigned as a mobile-friendly grid with status hints

### Media & reputation
- **Media reputation system** — 6-tier scale from Unknown to Legend, now actively unlocks/blocks content and generates unique events per tier
- **Media conferences** — pre-match and post-match press interactions with 2–3 contextual questions; responses affect reputation, fan sentiment, and coaching relationships
- **Fan followers** — grow your fanbase through performances, community engagement, and social media
- **Media events** — interviews, controversies, praise, and criticism; respond with HUMBLE / CONFIDENT / IGNORE
- **Social media posts** — create posts that grow followers and trigger fan milestones
- **Fan mail** — periodic fan letters (encouragement, criticism, challenges) with reply options that boost community connection
- **Community engagement** — school visits, charity matches, sponsor appearances, and local clinic hosting build fan goodwill

### Career events & narrative
- **30+ random career events** — sponsorships, mentorships, conflicts, community moments, and more
- **Choice-based outcomes** — most events offer 2–3 responses with different consequences
- **Event history** — full log of past events for reference
- **Career Story Arcs** — season-spanning narrative threads (Contract Saga, Rivalry Escalation, Captaincy Journey, Media Firestorm, Legacy Chase, Farewell Season, and more)
- **Dynamic biography** — auto-generated seasonal career paragraphs using AI (or templates), reflecting your journey
- **Locker room drama** — faction splits, star player conflicts, team-building moments tied to chemistry dynamics

### Awards & achievements
- **9 season award types** — Brownlow Medal, Coleman Medal, All-Australian Team, Club Best & Fairest, Rising Star, Leading Disposal Winner, Leading Tackler, Mark of the Year, Goal of the Year
- **Awards ceremony** — dedicated end-of-season presentation screen
- **70+ achievements** — across 5 categories with 4 rarity tiers (Common / Rare / Epic / Legendary)
- **Milestone gallery** — visual career timeline with expanded categories: match/goal/disposal/tackle records, votes, awards, seasons, chemistry, legacy tiers, and narrative completions
- **Legacy Path** — 6-tier system (Journeyman → AFL Icon) tracking statistical dominance, awards, longevity, narrative impact, and community standing; unlock special events and post-career paths at higher tiers

### Season flow
- **Finals system** — top 4 qualify; semi-finals and Grand Final each have dedicated screens
- **Season recap** — performance grade, season highlights, and team summary at year end
- **Player comparison** — compare your stats and attributes against any league player

### Economy & shop
- **Wallet system** — earn from contracts and bonuses; spend in the shop
- **28+ shop items** — across 4 categories: Recovery, Training, Boosters, Career
- **Daily login rewards** — 14-day streak cycle with escalating bonuses

### Personalisation
- **Avatar builder** — DiceBear-powered Micah-style avatars
- **Dynamic nicknames** — 70+ earned nicknames based on playstyle, updated automatically
- **Jersey number** — choose any number 1–99


---

## Game Mechanics

### Positions
| Position | Key attributes | Playstyle |
|----------|---------------|-----------|
| Forward | Goal Sense, Marking, Kicking | Scoring specialist |
| Midfielder | Speed, Handball, Stamina | Contested ball, disposals |
| Defender | Tackling, Marking, Speed | Defensive pressure, intercepts |
| Ruck | Stamina, Marking, Kicking | Hitouts, contested marks |

### Scoring (AFL rules)
- **Goal** — ball kicked through the two tall posts = 6 points
- **Behind** — ball through the outer posts, or touched off the boot = 1 point
- Final score displayed as: Goals.Behinds.Total (e.g. 12.8.80)

### Key awards
| Award | Description |
|-------|-------------|
| Brownlow Medal | Most votes for best-on-ground across the season |
| Coleman Medal | Leading goalkicker |
| All-Australian | Selected in the league's best 22 |
| Club Best & Fairest | Best player at your club |
| Rising Star | Best young player (first 2 seasons) |

### Morale & energy
- **Morale** (0–100) — affects match performance and training effectiveness; boosted by wins, awards, positive career events
- **Energy** (0–100) — depleted by matches and training; recovered by rest items and the physio
- Both are managed round-to-round and feed into your match simulation rolls

### Contracts & salary
- Salary is calculated based on league tier, player rating, and negotiation outcomes
- Higher-rated clubs pay more but may offer a lesser role
- Wallet accumulates from salary payments; spent in the shop or on coaching staff

---

## Project Structure

```
AFL_Footy_Stars/
├── components/              # All React UI components (30 files)
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
│   └── ...                  # (see CLAUDE.md for full list)
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
│   └── ...
│
├── services/
│   └── geminiService.ts     # Google Gemini AI commentary
│
├── types.ts                 # All TypeScript interfaces & enums (~670 lines)
├── constants.ts             # Game data & configuration (~1275 lines)
├── App.tsx                  # Root component & view router
├── _prompts/                # Sub-agent development prompts (v1.1 features)
└── CLAUDE.md                # Full developer & AI-assistant reference guide
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 19.2 |
| Language | TypeScript 5.8 |
| Build tool | Vite 6.2 |
| Styling | Tailwind CSS |
| AI commentary | Google Gemini (`@google/genai` v1.30) — optional |
| Avatars | DiceBear API (Micah style) |
| Persistence | Browser LocalStorage |
| Save key | `footyLegendSave` |

No backend. No database. No account required. Everything runs in the browser.

---

## Development

### Key files to know

| File | Purpose | Caution level |
|------|---------|---------------|
| `context/GameContext.tsx` | All game state & actions | High — changes ripple everywhere |
| `types.ts` | TypeScript interfaces | High — changes propagate codebase-wide |
| `utils/simulationUtils.ts` | Match engine | High — test thoroughly |
| `constants.ts` | Teams, awards, shop items, milestones | Medium — balance-sensitive |
| `components/*.tsx` | UI components | Low — mostly safe to edit |

### Adding features
Before writing any code, read `CLAUDE.md` — it covers architecture patterns, state management, how to add achievements/events/teams, and common pitfalls to avoid.

### Save data
```javascript
// Inspect current save in browser console:
JSON.parse(localStorage.getItem('footyLegendSave'))
```

### Rules for safe development
- **Never remove fields from `PlayerProfile`** — only add optional (`?`) fields to maintain save compatibility
- **Zero TypeScript errors** — run `npm run build` and confirm clean output before committing
- **Mobile-first** — all UI must work on small screens; use Tailwind responsive classes

---

## Roadmap

### Completed
- ✅ **v1.3** — Off-Field Management & Narrative Depth (story arcs, media conferences, club culture, legacy system, community events, dynamic biography)
- ✅ **v1.3.1** — Mobile UI Polish & Navigation Restructure (Hub view, Shop redesign, Dashboard cleanup, BackHeader standardisation, touch target audit)

### v2 Preview (Planned)
Planned features for future releases:
- **Coach Mode** — play as a coach managing tactics, halftime adjustments, and team strategy
- **Player Mode** — on-field decision-making during live match events
- **Budget Management** — club-level budget system with salary caps
- **Strategy Board** — pre-match formation setup and matchup assignments
- **Halftime Address** — locker room decision-making with momentum consequences
- **Full Media Conference UI** — journalist avatars, live typing effects, camera cinematics

All v1.3+ core narrative and legacy systems are designed to support these v2 features.

---

## License

Private project — not licensed for redistribution.

---

*Built with React + TypeScript. Powered by a love of AFL footy. 🏉*
