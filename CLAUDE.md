# CLAUDE.md — AFL Footy Stars

> Read this file **before touching any code**. It reflects the actual current state of the codebase as of v1.4.
> Where this file and AGENTS.md conflict, treat AGENTS.md as the deeper technical reference — this file is your orientation and rules layer.

---

## 1. Project snapshot

| Field | Value |
|-------|-------|
| Name | AFL Footy Stars |
| **Current version** | **v1.4** (Capacitor mobile + Xcode pipeline) |
| **Next version** | **v1.5** (see Section 9) |
| Type | React SPA — no router, no backend, no auth |
| Runtime | Browser + native iOS via Capacitor |
| Persistence | `localStorage` (web) / `@capacitor/preferences` (native) — see `services/storageService.ts` |
| Save key format | `footyLegendSave_slot{N}` (slots 0–2); legacy key `footyLegendSave` auto-migrates |
| Entry point | `index.tsx` → `App.tsx` → `GameProvider` → view switch |
| Build tool | Vite 6.2 |
| Language | TypeScript 5.8 (non-strict, isolated modules) |
| Styling | Tailwind CSS — utility classes only, no CSS modules |
| State | Single React Context in `context/GameContext.tsx` (~2200 lines) |
| External APIs | Google Gemini (`@google/genai` v1.30) — optional; DiceBear avatar SVGs |
| App ID | `com.aflstars.game` |

---

## 2. Dev environment & build commands

### Web (primary dev)
```bash
npm install
npm run dev        # Vite dev server → http://localhost:3000
npm run build      # TypeScript compile + Vite bundle — MUST pass with zero errors
npm run preview    # Preview production build from /dist
```

### iOS / Xcode (Capacitor)
```bash
npm run build                # Build web assets to /dist first — always do this before cap sync
npx cap sync ios             # Copy /dist into Xcode project, sync plugins
npx cap open ios             # Open Xcode (or open ios/App/App.xcworkspace manually)
```

**Xcode workspace:** `ios/App/App.xcworkspace` — always open the `.xcworkspace`, not the `.xcodeproj`.

**Live reload in dev:** Set `VITE_LOCAL_IP` in `.env` to your machine's local IP. `capacitor.config.ts` will proxy the Capacitor shell to `http://<IP>:3000` during development only.

### Environment variables
```
GEMINI_API_KEY=your_key_here     # Optional — game works without it
VITE_LOCAL_IP=192.168.x.x        # Optional — enables Capacitor live reload
```
Vite exposes both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` (both defined in `vite.config.ts`).

### Path alias
`@/` resolves to the project root. Use it for all cross-directory imports:
```typescript
import { useGameContext } from '@/context/GameContext';
```

---

## 3. Xcode & Capacitor — critical notes

### ⚠️ Never edit files inside `ios/` directly
`npx cap sync` regenerates the `ios/` directory from your web build and `capacitor.config.ts`. Any manual edits to Xcode project files will be overwritten on the next sync. iOS-specific config belongs in `capacitor.config.ts` only.

### Current Capacitor config (`capacitor.config.ts`)
```typescript
appId: 'com.aflstars.game'
appName: 'AFL Footy Stars'
webDir: 'dist'
backgroundColor: '#0f172a'
ios.contentInset: 'always'
ios.scrollEnabled: false
plugins: SplashScreen, StatusBar, Keyboard (all configured)
```

### Installed Capacitor plugins (from package.json)
```
@capacitor/core ^8.3.1        @capacitor/ios ^8.3.1
@capacitor/android ^8.3.1     @capacitor/app ^8.1.0
@capacitor/haptics ^8.0.2     @capacitor/local-notifications ^8.0.2
@capacitor/preferences ^8.0.1 @capacitor/share ^8.0.1
@capacitor/splash-screen ^8.0.1  @capacitor/status-bar ^8.0.2
```

### Common Xcode issues
| Symptom | Fix |
|---------|-----|
| Blank white screen on launch | `cap sync` not run after web build — run `npm run build && npx cap sync ios` |
| Signing error on build | Set Team to your Apple ID under Signing & Capabilities in Xcode |
| Old save data loading after code change | Delete app from Simulator — `@capacitor/preferences` persists across installs |
| "module not found" build error | Run `npx cap sync ios` then `pod install` inside `ios/App/` |
| EXC_BAD_ACCESS crash on launch | `AdService` or `IAPService` was accidentally re-enabled — both must stay disabled in dev |

### Storage on native vs web
`services/storageService.ts` routes saves to:
- **Native (iOS):** `@capacitor/preferences` (survives app updates, persists across Capacitor sync)
- **Web:** `localStorage` (existing behaviour)

Legacy `footyLegendSave` key auto-migrates to `footyLegendSave_slot0` on first native run.

---

## 4. Full file map

```
AFL_Footy_Stars/
├── App.tsx                       # Root — GameProvider + view switch
├── index.tsx                     # ReactDOM.createRoot mount
├── index.html                    # HTML shell
├── types.ts                      # ALL interfaces & enums (~700 lines) — read first
├── constants.ts                  # ALL game data & config (~1723 lines) — read second
├── capacitor.config.ts           # Capacitor/iOS/Android config
├── vite.config.ts                # Port 3000, host 0.0.0.0, @/ alias, env injection
├── package.json                  # Dependencies & scripts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── metadata.json
├── .env.example
│
├── context/
│   └── GameContext.tsx           # Single source of all game state & actions (~2200 lines)
│
├── components/                   # 37 React UI components
│   ├── SlotSelect.tsx            # 3-slot save picker — app start screen
│   ├── Onboarding.tsx            # Player creation wizard
│   ├── Dashboard.tsx             # Main hub — fixtures, quick stats, nav
│   ├── Hub.tsx                   # Secondary hub component
│   ├── BackHeader.tsx            # Shared back-navigation header
│   ├── Layout.tsx                # Nav shell wrapper
│   ├── MatchSim.tsx              # Match flow — tactic picker → live sim → result
│   ├── MatchPredictionCard.tsx   # Pre-match prediction UI
│   ├── DerbyBuildup.tsx          # Pre-match rivalry build-up screen
│   ├── Training.tsx              # Attribute training + rehab panel
│   ├── PlayerStats.tsx           # Career & season stats
│   ├── LeagueView.tsx            # Ladder standings
│   ├── ClubHub.tsx               # Team info, captain speech, club history
│   ├── TransferMarket.tsx        # Transfer offer cards
│   ├── Shop.tsx                  # 28+ purchasable items
│   ├── MasterSkillTree.tsx       # Skill unlock interface
│   ├── MediaHub.tsx              # Reputation, media events, social posts, conferences
│   ├── CareerEvents.tsx          # Active event cards with choice UI
│   ├── StoryArcPanel.tsx         # v1.3 story arc display
│   ├── TeamChemistry.tsx         # Teammate relationship grid
│   ├── CoachingStaff.tsx         # Hire/view coaching staff
│   ├── Achievements.tsx          # Achievement grid
│   ├── MilestonesGallery.tsx     # Career milestone timeline
│   ├── PlayerComparison.tsx      # Side-by-side stats comparison
│   ├── Draft.tsx                 # Interactive draft board
│   ├── SeasonRecap.tsx           # End-of-season summary (modal overlay)
│   ├── AwardsCeremony.tsx        # Season award presentations (modal overlay)
│   ├── FinalsIntro.tsx           # Finals series entry (modal overlay)
│   ├── SemiFinalsResults.tsx     # Semi-final results (modal overlay)
│   ├── GrandFinalResult.tsx      # Grand Final result + celebration (modal overlay)
│   ├── CareerSummary.tsx         # Retirement overview
│   ├── CareerTimeline.tsx        # Season-by-season history (inline in CareerSummary)
│   ├── CareerExport.tsx          # Shareable career card (inline in CareerSummary)
│   ├── PostMatchPress.tsx        # Post-match press conference (inline in MatchSim)
│   ├── Settings.tsx              # App settings, reset
│   ├── TipCard.tsx               # Dismissible tip banner (utility)
│   ├── DailyRewardModal.tsx      # Daily login reward UI
│   ├── Avatar.tsx                # DiceBear SVG renderer (utility)
│   └── TeamLogo.tsx              # Team logo with emoji fallback (utility)
│
├── utils/                        # 19 pure business-logic files
│   ├── simulationUtils.ts        # Match simulation engine
│   ├── leagueUtils.ts            # League generation, fixtures, ladder
│   ├── seasonUtils.ts            # Promotion/relegation, salary, season wrap-up
│   ├── careerEventUtils.ts       # Career event generation & resolution
│   ├── storyArcUtils.ts          # v1.3 story arc system
│   ├── mediaUtils.ts             # Media reputation, conferences, social posts
│   ├── chemistryUtils.ts         # Team chemistry & relationship tracking
│   ├── coachingUtils.ts          # Coaching staff initialisation & effects
│   ├── transferUtils.ts          # Transfer offer generation & salary logic
│   ├── draftUtils.ts             # Draft prospect generation & pick simulation
│   ├── awardUtils.ts             # Season award calculation
│   ├── achievementUtils.ts       # Achievement checking & unlocking
│   ├── masterSkillUtils.ts       # Skill tree unlocking & prerequisites
│   ├── legacyUtils.ts            # Legacy score calculation
│   ├── objectiveUtils.ts         # Season & weekly objectives
│   ├── preSeasonUtils.ts         # Pre-season camp system
│   ├── rosterUtils.ts            # AI team roster turnover
│   ├── nicknameUtils.ts          # Nickname generation
│   └── dailyRewardUtils.ts       # Daily reward streak tracking
│
├── services/                     # Native/external service wrappers (all added in v1.4)
│   ├── storageService.ts         # ✅ ACTIVE — Capacitor Preferences vs localStorage routing
│   ├── iapService.ts             # ⛔ STUBBED — RevenueCat IAP (disabled, NSIndexPath crash)
│   ├── adService.ts              # ⛔ STUBBED — AdMob rewarded ads (disabled, EXC_BAD_ACCESS)
│   ├── hapticsService.ts         # ✅ ACTIVE — Capacitor Haptics wrapper
│   ├── notificationService.ts    # ✅ ACTIVE — Capacitor Local Notifications wrapper
│   ├── audioService.ts           # ✅ ACTIVE — Audio playback service
│   └── geminiService.ts          # ✅ ACTIVE (optional) — Gemini AI commentary
│
├── _prompts/                     # Sub-agent feature prompt files
│   ├── README.md
│   ├── 01_GAMEPLAY.md
│   ├── 02_PROGRESSION.md
│   ├── 03_SOCIAL_MEDIA.md
│   ├── 04_POLISH_UX.md
│   └── 05_CONTENT.md
│
├── Feature Specs/                # Version specification documents
│   ├── AFL_FootyStars_v1.3_Spec.md
│   ├── AFL_FootyStars_v1.3_Spec.docx
│   └── AFL_FootyStars_v1.3.1_UI_Spec.md
│
├── ios/                          # ⚠️ Capacitor-generated — DO NOT edit directly
│   └── App/
│       ├── App.xcworkspace       # ← Open this in Xcode
│       └── App.xcodeproj
├── android/                      # Capacitor-generated Android project
└── dist/                         # Vite production build output (gitignored)
```

---

## 5. Version history

| Version | Status | Summary |
|---------|--------|---------|
| v0.0.1.0_Gamma | ✅ Done | Initial feature-complete — achievements, daily rewards, nicknames, milestones |
| v1.0 | ✅ Done | Full career sim — draft, seasons, training, match engine, finals, awards, 70+ achievements |
| v1.1 | ✅ Done | Fan mail, club culture, rivalry expansion, training mini-games, club history, AFLW path |
| v1.2 | ✅ Done | Objectives, pre-season camp, representative honours, team selection drama, legacy score |
| v1.3 | ✅ Done | Story Arcs, Media Conferences, Club Culture active effects, Legacy Moments, Dynamic Biography |
| v1.3.1 | ✅ Done | UI polish — Hub redesign, Shop redesign, mobile responsive pass |
| **v1.4** | ✅ **Current** | Capacitor iOS/Android wrapper, Xcode build pipeline, `storageService.ts`, `iapService.ts` stub, `adService.ts` stub, `hapticsService.ts`, `notificationService.ts`, `audioService.ts` |
| **v1.5** | 🔄 **Next** | See Section 9 |

---

## 6. Architecture overview

### View routing
No React Router. Navigation is the `view` string in GameContext:
```typescript
type View =
  'SLOT_SELECT' | 'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' |
  'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' |
  'MILESTONES' | 'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' |
  'CAREER_SUMMARY' | 'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' |
  'COACHING_STAFF' | 'MASTER_SKILLS'
```
**App always starts at `'SLOT_SELECT'`** — never `'DASHBOARD'` or `'ONBOARDING'` directly.

Finals/recap screens are modal overlays (boolean flags in GameContext), not view states:

| Flag | Component | Triggered when |
|------|-----------|---------------|
| `showFinalsIntro` | `FinalsIntro.tsx` | `currentRound === SEASON_LENGTH` |
| `showSemiFinalsResults` | `SemiFinalsResults.tsx` | `currentRound === SEASON_LENGTH + 1` |
| `showGrandFinalResult` | `GrandFinalResult.tsx` | `currentRound === SEASON_LENGTH + 2` |
| `showSeasonRecap` | `SeasonRecap.tsx` | `seasonEnded === true` |
| `showAwardsCeremony` | `AwardsCeremony.tsx` | After season recap dismissal |

Finals rounds are `SEASON_LENGTH + 1` (semis) and `SEASON_LENGTH + 2` (GF) — the season is logically 16 rounds long even though `SEASON_LENGTH = 14`.

### State management
Single global `GameContext` via React Context API. No Redux. Auto-save fires on every state change via `useEffect` watching `[player, league, fixtures, currentRound, lastMatchResult]`.

### Save system
```typescript
// Key format
`footyLegendSave_slot${N}`   // slots 0, 1, 2

// Payload
{ player: PlayerProfile, league: Team[], fixtures: Fixture[], currentRound: number }
```
On native iOS, `storageService.ts` routes saves through `@capacitor/preferences` instead of `localStorage`.

**When adding new `PlayerProfile` fields, always add a migration block in `loadGame()`:**
```typescript
if (data.player.newField === undefined) {
    data.player.newField = defaultValue;
}
```
Existing migration blocks already cover: `energy`, `wallet`, `lifetimeEarnings`, `itemsPurchased`, `currentYear`, `seasonsPlayed`, `careerHistory`, `mediaReputation`, `teammates`/`teamChemistry`, `coachingStaff`, `activeCareerEvents`/`careerEventHistory`.

---

## 7. Services layer (v1.4 additions)

### `services/storageService.ts` — ACTIVE
Routes save/load to `@capacitor/preferences` on native, `localStorage` on web. GameContext should use this for new storage operations rather than calling `localStorage` directly.

### `services/iapService.ts` — STUBBED, DISABLED
RevenueCat IAP. **Disabled due to `NSIndexPath` crashes in development.**
- All methods return safe mock values
- `PRODUCT_MAP` is defined and ready (energy items, `remove_ads`, `season_pass`, coin packs)
- `@revenuecat/purchases-capacitor` is **not in package.json** — do not install it unless explicitly instructed
- Re-enabling: install package, uncomment `Purchases` imports, test on real device only

### `services/adService.ts` — STUBBED, DISABLED
AdMob rewarded ads. **Disabled due to `EXC_BAD_ACCESS` crashes in development.**
- `showRewardedAd()` always returns `true` in dev (player always gets the reward)
- `@capacitor-community/admob` is **not in package.json** — do not install it
- Re-enabling: install package, uncomment `AdMob` imports, test on real device only

### `services/hapticsService.ts` / `notificationService.ts` / `audioService.ts` — ACTIVE
All wrap Capacitor APIs with native/web guards. Safe to call — no-ops on web.

### `services/geminiService.ts` — ACTIVE (optional)
Gemini AI commentary. Works without `GEMINI_API_KEY` — falls back to template commentary.

---

## 8. Known bugs (as of v1.4)

Fix only what you are explicitly assigned. Do not touch these as side effects of other work.

| # | File | Line (approx.) | Bug | Severity |
|---|------|----------------|-----|----------|
| 1 | `GameContext.tsx` | ~1175 | Captaincy eligibility reads `teamChemistry?.state` — field doesn't exist on `TeamChemistry`. Should be `teamChemistry?.recentForm`. Captaincy offers **never fire**. | Medium |
| 2 | `GameContext.tsx` | ~920 | Rehab physio bonus: `coachingStaff?.staffMembers?.some(...)` — `staffMembers` not in `CoachingStaff` interface. Should be `coachingStaff.medicalStaff`. Physio bonus **never applies**. | Medium |
| 3 | `GameContext.tsx` | `useCaptainSpeech` | Sets `motivationBoost: 15` but never sets `motivationExpiry`. Boost **never expires**. | Low |
| 4 | `GameContext.tsx` | `advanceRound` | `generateFanMailEvent` called in **two separate `setPlayer` blocks** — can generate duplicate fan mail in the same round. Do not add a third call. | Low |
| 5 | `GameContext.tsx` | `advanceRound` | `legacyScore` recalculated twice per round — second write wins, no data loss. | Low |
| 6 | `types.ts` | `PlayerProfile` | `retireAtSeasonEnd` set via `(extra as any).retireAtSeasonEnd` — untyped. Should be added as `retireAtSeasonEnd?: boolean` to `PlayerProfile`. | Low |
| 7 | `CoachingStaff.tsx` | — | `hireCoachingStaff` context action typed as `(staffMember: any, contractType)` — needs proper `StaffMember` typing. | Low |
| 8 | Display components | `PlayerStats.tsx` + others | Some components may still read legacy `bio` string. Correct pattern: `biography?.[biography.length-1] ?? bio`. | Low |

---

## 9. v1.5 — Next version targets

v1.5 activates the monetisation layer stubbed in v1.4, and prepares for App Store submission.

### Priority goals
1. **Activate IAP** — install `@revenuecat/purchases-capacitor`, wire `iapService.ts` into `GameContext.purchaseItem()`, test against App Store sandbox
2. **Activate rewarded ads** — install `@capacitor-community/admob`, wire `adService.ts` into the energy refill flow, test on real device
3. **Sign In with Apple** — required for App Store if any third-party auth exists; install `@capacitor/sign-in-with-apple`, enable capability in Xcode under Signing & Capabilities
4. **Cloud save (optional)** — Firebase Firestore sync so saves persist across reinstalls; `storageService.ts` is the integration point
5. **App Store submission prep** — screenshots, metadata, privacy policy, age rating
6. **Bug fixes** — bugs #1 (captaincy) and #2 (physio) above are the highest-value fixes for v1.5

### What must not change in v1.5
- `simulationUtils.ts` and `seasonUtils.ts` — match sim and season logic is stable, don't touch
- Existing career event types — additive only, never remove from the `CareerEvent.type` union
- `PlayerProfile` existing fields — never remove or rename; only add new optional (`?`) fields
- `SAVE_KEY` format — any change requires a migration path for existing slots
- `SEASON_LENGTH` — any change requires updating all `SEASON_LENGTH + 1` / `SEASON_LENGTH + 2` finals logic in `GameContext.tsx`

---

## 10. Non-negotiable rules

1. **Zero TypeScript errors.** `npm run build` must complete clean. Fix all errors before finishing.
2. **Never remove a field from `PlayerProfile`.** Saves will break for existing users.
3. **Always add a migration block in `loadGame()` for every new `PlayerProfile` field.**
4. **`ios/` is Capacitor-generated — never edit it directly.**
5. **Do not install new npm packages without confirming with the project owner.**
6. **Do not re-enable `iapService` or `adService` unless explicitly instructed.** Both are disabled for good reason.
7. **Do not add a third `generateFanMailEvent` call in `advanceRound`.** It already fires twice.
8. **Do not write `teamChemistry?.state`.** The correct field is `teamChemistry.recentForm`.
9. **Add new game logic to util files**, not inline in `GameContext.tsx` — it is already ~2200 lines.
10. **No sub-agents.** Complete one task at a time. Ask before moving on.
11. **Read before writing.** Always read a file before editing it.
12. **Mobile-first UI.** All new UI must work at 375px+ width. Use Tailwind responsive classes.
13. **Dark theme only.** Background `bg-gray-900`, surfaces `bg-gray-800`, cards `bg-gray-800 rounded-xl border border-gray-700`. No `dark:` variant classes.
14. **Do not add a backend, database, or auth system** without explicit instruction — client-only by design.

---

## 11. Key patterns

### State updates — always use functional form
```typescript
// ✅ GOOD
setPlayer(prev => ({ ...prev, energy: prev.energy - 10 }));

// ❌ BAD — stale state risk
setPlayer({ ...player, energy: player.energy - 10 });
```

### Adding a new PlayerProfile field
```typescript
// 1. types.ts — always optional
newField?: SomeType;

// 2. GameContext.tsx loadGame() migration
if (data.player.newField === undefined) {
    data.player.newField = defaultValue;
}
```

### Inspect save data in browser devtools
```javascript
JSON.parse(localStorage.getItem('footyLegendSave_slot0'))
```

### Reading large files in chunks
`GameContext.tsx` is ~2200 lines. `constants.ts` is ~1723 lines. Always chunk:
```
read_file path="context/GameContext.tsx" length=300 offset=0
read_file path="context/GameContext.tsx" length=300 offset=300
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

## 12. Quick reference — critical constants

| Constant / value | Where |
|-----------------|-------|
| `SEASON_LENGTH = 14` | `constants.ts` |
| `STARTING_AGE = 18` | `constants.ts` |
| `RETIREMENT_AGE = 35` | `constants.ts` |
| `INITIAL_ATTRIBUTE_POINTS = 15` | `constants.ts` |
| `MAX_ATTRIBUTE_LEVEL = 99` | `constants.ts` |
| Save key: `footyLegendSave_slot{0\|1\|2}` | `services/storageService.ts` |
| App ID: `com.aflstars.game` | `capacitor.config.ts` |
| Dev server port: `3000` | `vite.config.ts` |
| Finals: `SEASON_LENGTH + 1` semis, `SEASON_LENGTH + 2` GF | `GameContext.tsx` |

---

## 13. Deeper references

For full detail on every system, util function, component, data flow, and bug location, read:

- **`AGENTS.md`** — 715-line technical deep-dive; supersedes this file on implementation specifics
- **`Feature Specs/AFL_FootyStars_v1.3_Spec.md`** — v1.3 feature specification
- **`Feature Specs/AFL_FootyStars_v1.3.1_UI_Spec.md`** — v1.3.1 UI polish specification
- **`_prompts/README.md`** — sub-agent prompt file index and merge order

---

*AFL Footy Stars — CLAUDE.md*
*Last updated: April 2026 | v1.4 current | VoidbreakDev / Ryan Sinclair*
