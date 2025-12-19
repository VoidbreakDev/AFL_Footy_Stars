# AFL Footy Stars - Career Simulation Game

A comprehensive AFL (Australian Football League) career simulation game built with React, TypeScript, and Vite.

## 🎮 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The game will load automatically

### Optional: AI Commentary

To enable AI-powered match commentary with Google Gemini:

1. Create a `.env` file in the project root
2. Add your Gemini API key:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```

**Note:** The game works perfectly without an API key - it will use fallback commentary instead.

## 🏆 Features

### Core Gameplay
- **Player Creation**: Customize your player with name, position, avatar, and jersey number
- **Career Mode**: Progress through your AFL career from Local League to AFL
- **Match Simulation**: Dynamic match engine with real-time events and statistics
- **Training System**: Improve your attributes through targeted training
- **Contracts**: Manage your career with contract negotiations and transfers
- **Injuries**: Realistic injury system affecting gameplay
- **Rivalries**: Develop rivalries with opponents over time

### Quick Wins Features (NEW!)

#### 1. **Achievement System** 🏆
- 52 unlockable achievements across 5 categories
- 4 rarity tiers: Common, Rare, Epic, Legendary
- Track progress and unlock rewards
- Achievements screen with filtering

#### 2. **Daily Login Rewards** 🎁
- 14-day reward cycle with increasing bonuses
- Streak tracking system
- Earn skill points and energy boosts
- Beautiful modal interface

#### 3. **Dynamic Nicknames** 🎯
- 70+ nicknames based on your playstyle
- Automatic nickname updates after impressive performances
- Manual selection from earned nicknames
- Name-based suggestions

#### 4. **Jersey Numbers** 🔢
- Choose your jersey number (1-99)
- Quick-select popular numbers
- Displayed alongside your name

#### 5. **Milestones Gallery** 📸
- Visual timeline of career milestones
- Filter by category (Career, Match, Skill)
- Stats dashboard
- Hints for upcoming milestones

#### 6. **Player Comparison** ⚔️
- Compare your stats with any league player
- Visual comparison bars for all attributes
- Career stats comparison
- Performance summary

#### 7. **Season Recap** 📊
- Beautiful end-of-season summary
- Performance grade (A+ to D)
- Season highlights and achievements
- Team performance overview

## 🎯 How to Play

1. **Create Your Player**
   - Choose name, position, appearance, and jersey number
   - Allocate starting attribute points

2. **Play Matches**
   - View upcoming fixtures on the dashboard
   - Simulate matches and earn XP
   - Track your performance stats

3. **Train & Improve**
   - Use skill points to upgrade attributes
   - Manage energy levels
   - Work towards your potential

4. **Progress Your Career**
   - Win matches to improve team standings
   - Earn Brownlow votes for best performances
   - Compete for premierships
   - Unlock achievements

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
AFL_Footy_Stars/
├── components/          # React components
│   ├── Dashboard.tsx    # Main game dashboard
│   ├── Onboarding.tsx   # Player creation
│   ├── MatchSim.tsx     # Match simulation
│   ├── Achievements.tsx # Achievement screen
│   └── ...
├── context/            # React Context (Game State)
│   └── GameContext.tsx
├── services/           # External services
│   └── geminiService.ts # AI commentary
├── utils/              # Utility functions
│   ├── achievementUtils.ts
│   ├── nicknameUtils.ts
│   └── ...
├── types.ts            # TypeScript types
└── constants.ts        # Game constants & data
```

## 🎨 Tech Stack

- **React 19.2** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Optional AI commentary
- **DiceBear API** - Avatar generation
- **LocalStorage** - Save game persistence

## 🎲 Game Mechanics

### Attributes
- **Kicking**: Goal accuracy and long kicks
- **Handball**: Short passing and ball distribution
- **Tackling**: Defensive pressure
- **Marking**: Catching contested marks
- **Speed**: Movement and agility
- **Stamina**: Endurance and energy
- **Goal Sense**: Scoring ability

### Progression
- Earn XP from matches
- Level up to gain skill points
- Train attributes to reach your potential
- Unlock achievements for special accomplishments

### Seasons
- 22-round regular season
- Top 4 teams make finals
- Semi-finals → Grand Final
- Season recap with performance summary

## 📝 Version

Current Version: **0.0.1.0_Gamma**

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

This project is private and not licensed for redistribution.

---

**Enjoy your AFL career! 🏉⚽🏆**
