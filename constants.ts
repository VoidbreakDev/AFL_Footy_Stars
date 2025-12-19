import { LeagueTier, Position, AvatarConfig } from "./types";

export const INITIAL_ATTRIBUTE_POINTS = 15;
export const MAX_ATTRIBUTE_LEVEL = 99;

export const TEAM_NAMES_LOCAL = [
  "Mudcrabs", "Bushrangers", "Magpies", "Tigers", "Blues", "Demons", "Lions", "Hawks"
];

export const TEAM_NAMES_AFL = [
  "Collingwood", "Carlton", "Essendon", "Richmond", "Hawthorn", "Geelong", "Sydney", "Brisbane"
];

export const POSITIONS = [
  Position.FORWARD,
  Position.MIDFIELDER,
  Position.DEFENDER,
  Position.RUCK
];

// Hybrid System Configuration
export const PRESET_AVATARS: AvatarConfig[] = [
  { faceId: "Liam" },    
  { faceId: "Nolan" },   
  { faceId: "Felix" },   
  { faceId: "Jack" },    
  { faceId: "Aneka" },   
  { faceId: "Leo" },     
  { faceId: "Max" },     
  { faceId: "Christopher" }, 
  { faceId: "Caleb" },   
  { faceId: "Aiden" },   
  { faceId: "Easton" },  
  { faceId: "Wyatt" },   
];

// Helper to construct the URL
export const getFaceUrl = (faceId: string) => {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${faceId}&radius=50&backgroundColor=transparent`;
}

export const STARTING_AGE = 18;
export const RETIREMENT_AGE = 35;

export const SEASON_LENGTH = 14; 

// --- STADIUM ASSETS ---
export const STADIUM_TEMPLATES = {
    [LeagueTier.LOCAL]: {
        suffixes: ["Oval", "Park", "Reserve", "Rec Ground", "Paddock"],
        minCap: 200,
        maxCap: 3000,
        types: ['OVAL']
    },
    [LeagueTier.STATE]: {
        suffixes: ["Arena", "Showgrounds", "Oval", "Sportsplex", "Center"],
        minCap: 5000,
        maxCap: 15000,
        types: ['OVAL', 'BOUTIQUE']
    },
    [LeagueTier.NATIONAL]: {
        suffixes: ["Stadium", "Colosseum", "G", "Dome", "Arena"],
        minCap: 30000,
        maxCap: 100000,
        types: ['BOUTIQUE', 'COLOSSEUM']
    }
};

// --- MILESTONE THRESHOLDS ---
export const MILESTONES = {
  MATCHES: [1, 50, 100, 150, 200, 250, 300, 350, 400],
  GOALS: [1, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  DISPOSALS: [500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
  TACKLES: [100, 250, 500, 750, 1000]
};

// --- ACHIEVEMENT DEFINITIONS ---
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'CAREER' | 'MATCH' | 'SKILL' | 'SPECIAL' | 'LEGEND';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  requirement: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // CAREER ACHIEVEMENTS
  { id: 'first_game', name: 'First Bounce', description: 'Play your first match', icon: '🏉', category: 'CAREER', rarity: 'COMMON', requirement: 'matches >= 1' },
  { id: 'veteran_50', name: 'Half Century', description: 'Play 50 career matches', icon: '🎖️', category: 'CAREER', rarity: 'COMMON', requirement: 'matches >= 50' },
  { id: 'veteran_100', name: 'Centurion', description: 'Play 100 career matches', icon: '💯', category: 'CAREER', rarity: 'RARE', requirement: 'matches >= 100' },
  { id: 'veteran_200', name: 'Legend Status', description: 'Play 200 career matches', icon: '👑', category: 'CAREER', rarity: 'EPIC', requirement: 'matches >= 200' },
  { id: 'veteran_300', name: 'Immortal', description: 'Play 300 career matches', icon: '⚡', category: 'CAREER', rarity: 'LEGENDARY', requirement: 'matches >= 300' },

  // MATCH ACHIEVEMENTS
  { id: 'first_goal', name: 'First Major', description: 'Kick your first goal', icon: '⚽', category: 'MATCH', rarity: 'COMMON', requirement: 'goals >= 1' },
  { id: 'bag_5', name: 'Five Star', description: 'Kick 5 goals in a single match', icon: '⭐', category: 'MATCH', rarity: 'RARE', requirement: 'single_match_goals >= 5' },
  { id: 'bag_10', name: 'Perfect 10', description: 'Kick 10 goals in a single match', icon: '🌟', category: 'MATCH', rarity: 'LEGENDARY', requirement: 'single_match_goals >= 10' },
  { id: 'disposal_king', name: 'Ball Magnet', description: 'Get 30+ disposals in a match', icon: '🧲', category: 'MATCH', rarity: 'RARE', requirement: 'single_match_disposals >= 30' },
  { id: 'disposal_40', name: 'Possession Beast', description: 'Get 40+ disposals in a match', icon: '👹', category: 'MATCH', rarity: 'EPIC', requirement: 'single_match_disposals >= 40' },
  { id: 'tackle_machine', name: 'Tackle Machine', description: 'Lay 10+ tackles in a match', icon: '🛑', category: 'MATCH', rarity: 'RARE', requirement: 'single_match_tackles >= 10' },

  // CAREER TOTALS
  { id: 'goals_50', name: 'Sharp Shooter', description: 'Kick 50 career goals', icon: '🎯', category: 'CAREER', rarity: 'COMMON', requirement: 'career_goals >= 50' },
  { id: 'goals_100', name: 'Century of Goals', description: 'Kick 100 career goals', icon: '💥', category: 'CAREER', rarity: 'RARE', requirement: 'career_goals >= 100' },
  { id: 'goals_300', name: 'Goal Machine', description: 'Kick 300 career goals', icon: '🔥', category: 'CAREER', rarity: 'EPIC', requirement: 'career_goals >= 300' },
  { id: 'goals_500', name: 'Coleman Legend', description: 'Kick 500 career goals', icon: '🏆', category: 'CAREER', rarity: 'LEGENDARY', requirement: 'career_goals >= 500' },
  { id: 'disposals_1000', name: 'Ball Winner', description: 'Get 1,000 career disposals', icon: '🏅', category: 'CAREER', rarity: 'COMMON', requirement: 'career_disposals >= 1000' },
  { id: 'disposals_5000', name: 'Midfield Master', description: 'Get 5,000 career disposals', icon: '👑', category: 'CAREER', rarity: 'EPIC', requirement: 'career_disposals >= 5000' },
  { id: 'tackles_500', name: 'Enforcer', description: 'Lay 500 career tackles', icon: '💪', category: 'CAREER', rarity: 'RARE', requirement: 'career_tackles >= 500' },

  // SKILL ACHIEVEMENTS
  { id: 'maxed_attribute', name: 'Elite Skill', description: 'Max out any attribute to 99', icon: '📈', category: 'SKILL', rarity: 'EPIC', requirement: 'max_attribute >= 99' },
  { id: 'all_80', name: 'All-Rounder', description: 'Get all attributes to 80+', icon: '🎓', category: 'SKILL', rarity: 'LEGENDARY', requirement: 'min_attribute >= 80' },
  { id: 'potential_unlocked', name: 'Peak Performance', description: 'Reach your potential in any attribute', icon: '🔓', category: 'SKILL', rarity: 'RARE', requirement: 'attribute_at_potential' },
  { id: 'fast_learner', name: 'Quick Study', description: 'Earn 100 skill points', icon: '📚', category: 'SKILL', rarity: 'COMMON', requirement: 'total_sp_earned >= 100' },

  // AWARDS & ACCOLADES
  { id: 'best_on_ground', name: 'Best on Ground', description: 'Earn 3 Brownlow votes', icon: '🥇', category: 'MATCH', rarity: 'RARE', requirement: 'single_match_votes >= 3' },
  { id: 'brownlow_50', name: 'Brownlow Contender', description: 'Earn 50 career votes', icon: '🎖️', category: 'CAREER', rarity: 'EPIC', requirement: 'career_votes >= 50' },
  { id: 'win_streak_5', name: 'On a Roll', description: 'Win 5 matches in a row', icon: '🔥', category: 'SPECIAL', rarity: 'RARE', requirement: 'win_streak >= 5' },
  { id: 'win_streak_10', name: 'Unstoppable', description: 'Win 10 matches in a row', icon: '⚡', category: 'SPECIAL', rarity: 'LEGENDARY', requirement: 'win_streak >= 10' },

  // SPECIAL ACHIEVEMENTS
  { id: 'comeback_king', name: 'Never Say Die', description: 'Win after being 30+ points down', icon: '💪', category: 'SPECIAL', rarity: 'EPIC', requirement: 'comeback_win' },
  { id: 'grand_final_hero', name: 'Big Game Player', description: 'Win a Grand Final', icon: '🏆', category: 'SPECIAL', rarity: 'LEGENDARY', requirement: 'premiership >= 1' },
  { id: 'injury_warrior', name: 'Iron Man', description: 'Play 50 games without injury', icon: '🦾', category: 'SPECIAL', rarity: 'EPIC', requirement: 'injury_free_streak >= 50' },
  { id: 'rivalry_born', name: 'Bad Blood', description: 'Start your first rivalry', icon: '⚔️', category: 'SPECIAL', rarity: 'COMMON', requirement: 'rivalries >= 1' },
  { id: 'rival_dominator', name: 'Rivalry Resolved', description: 'Beat a rival 5 times', icon: '👊', category: 'SPECIAL', rarity: 'RARE', requirement: 'rival_wins >= 5' },

  // POSITION-SPECIFIC
  { id: 'forward_specialist', name: 'Goal Sneak', description: 'Kick 3+ goals in 10 matches (Forward)', icon: '🎯', category: 'SPECIAL', rarity: 'RARE', requirement: 'forward_goals_consistency' },
  { id: 'midfielder_workhorse', name: 'Engine Room', description: 'Get 25+ disposals in 20 matches (Midfielder)', icon: '⚙️', category: 'SPECIAL', rarity: 'RARE', requirement: 'mid_disposal_consistency' },
  { id: 'defender_wall', name: 'The Wall', description: 'Average 5+ tackles over 20 matches (Defender)', icon: '🛡️', category: 'SPECIAL', rarity: 'RARE', requirement: 'def_tackle_consistency' },
  { id: 'ruck_dominance', name: 'Big Man', description: 'Play 50 matches as Ruck', icon: '🏔️', category: 'SPECIAL', rarity: 'RARE', requirement: 'ruck_matches >= 50' },

  // CONTRACT & CAREER
  { id: 'big_money', name: 'Paid Player', description: 'Sign a contract worth $1000+', icon: '💰', category: 'CAREER', rarity: 'RARE', requirement: 'contract_salary >= 1000' },
  { id: 'loyal_servant', name: 'One Club Player', description: 'Play 100 games with one team', icon: '❤️', category: 'CAREER', rarity: 'EPIC', requirement: 'same_club_100' },
  { id: 'journeyman', name: 'Journeyman', description: 'Play for 3 different clubs', icon: '🧳', category: 'CAREER', rarity: 'COMMON', requirement: 'clubs_played >= 3' },

  // MORALE & ENERGY
  { id: 'high_morale', name: 'Fan Favorite', description: 'Maintain 90+ morale for 10 matches', icon: '😊', category: 'SPECIAL', rarity: 'RARE', requirement: 'morale_streak >= 10' },
  { id: 'clutch_performer', name: 'Clutch', description: 'Win 5 matches with low morale', icon: '🎯', category: 'SPECIAL', rarity: 'EPIC', requirement: 'low_morale_wins >= 5' },

  // TRAINING & DEVELOPMENT
  { id: 'gym_rat', name: 'Dedicated Trainer', description: 'Complete 50 training sessions', icon: '💪', category: 'SKILL', rarity: 'COMMON', requirement: 'training_sessions >= 50' },
  { id: 'speed_demon', name: 'Lightning Fast', description: 'Reach 90+ speed', icon: '⚡', category: 'SKILL', rarity: 'RARE', requirement: 'speed >= 90' },
  { id: 'boot_perfect', name: 'Golden Boot', description: 'Reach 90+ kicking', icon: '👢', category: 'SKILL', rarity: 'RARE', requirement: 'kicking >= 90' },
  { id: 'marking_king', name: 'Specky King', description: 'Reach 90+ marking', icon: '🙌', category: 'SKILL', rarity: 'RARE', requirement: 'marking >= 90' },

  // LEGEND TIER
  { id: 'hall_of_fame', name: 'Hall of Famer', description: 'Enter the Hall of Fame', icon: '🌟', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'retired' },
  { id: 'perfectionist', name: 'The GOAT', description: 'Reach 99 in all attributes', icon: '🐐', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'all_99' },
  { id: 'triple_crown', name: 'Triple Crown', description: '1000 goals, 10000 disposals, 1000 tackles', icon: '👑', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'triple_crown' },
  { id: 'dynasty', name: 'Dynasty', description: 'Win 3 premierships', icon: '🏆', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'premierships >= 3' },
  { id: 'brownlow_winner', name: 'Brownlow Medallist', description: 'Win a Brownlow Medal (100+ votes in a season)', icon: '🏅', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'season_votes >= 100' },
  { id: 'mr_consistent', name: 'Mr. Consistent', description: 'Earn votes in 20 consecutive matches', icon: '📊', category: 'LEGEND', rarity: 'LEGENDARY', requirement: 'vote_streak >= 20' },
];

// --- NAME GENERATION DATA ---
export const FIRST_NAMES = [
  "Aaron", "Adam", "Adrian", "Aidan", "Alex", "Alexander", "Ali", "Angus", "Anthony", "Archie",
  "Austin", "Bailey", "Ben", "Benjamin", "Blake", "Beau", "Billy", "Bradley", "Brandon", "Brayden",
  "Brodie", "Bryce", "Caleb", "Callum", "Cameron", "Charles", "Charlie", "Christian", "Christopher",
  "Cody", "Connor", "Cooper", "Corey", "Daniel", "Darcy", "David", "Declan", "Dominic", "Dylan",
  "Edward", "Eli", "Elijah", "Ethan", "Felix", "Finn", "Fletcher", "Flynn", "Gabriel", "George",
  "Hamish", "Harrison", "Harry", "Harvey", "Hayden", "Heath", "Henry", "Hudson", "Hugh", "Hugo",
  "Isaac", "Jack", "Jackson", "Jacob", "Jaeger", "Jake", "James", "Jared", "Jasper", "Jaxon",
  "Jayden", "Jeremy", "Jesse", "Jett", "Joel", "John", "Jonathon", "Jordan", "Joseph", "Josh",
  "Joshua", "Jude", "Julian", "Kade", "Kai", "Kane", "Kieren", "Kyle", "Lachlan", "Lance",
  "Leo", "Levi", "Lewis", "Liam", "Lincoln", "Lochie", "Lucas", "Luke", "Marcus", "Mark",
  "Mason", "Matthew", "Max", "Michael", "Mitchell", "Nathan", "Nathaniel", "Nicholas", "Noah",
  "Oliver", "Oscar", "Owen", "Patrick", "Paul", "Peter", "Philip", "Quinn", "Reece", "Rhys",
  "Richard", "Riley", "Robert", "Rory", "Ryan", "Sam", "Samuel", "Scott", "Sebastian", "Seth",
  "Simon", "Sonny", "Spencer", "Stefan", "Steven", "Taj", "Tate", "Thomas", "Timothy", "Toby",
  "Todd", "Tom", "Travis", "Trent", "Tyler", "Will", "William", "Xavier", "Zac", "Zachary"
];

export const LAST_NAMES = [
  "Abbott", "Adams", "Allen", "Anderson", "Andrews", "Armstrong", "Atkins", "Bailey", "Baker", "Barker",
  "Barnes", "Barrett", "Barry", "Bartlett", "Bates", "Bell", "Bennett", "Berry", "Black", "Bond",
  "Boyd", "Bradley", "Brennan", "Brooks", "Brown", "Bryant", "Buckley", "Burgess", "Burns", "Burton",
  "Butler", "Byrne", "Cameron", "Campbell", "Carey", "Carr", "Carroll", "Carter", "Casey", "Chapman",
  "Clark", "Clarke", "Cole", "Coleman", "Collins", "Connolly", "Cook", "Cooper", "Costello", "Cox",
  "Craig", "Crawford", "Cross", "Cunningham", "Curtis", "Dalton", "Daly", "Daniels", "Davidson", "Davies",
  "Davis", "Dawson", "Day", "Dean", "Delaney", "Dennis", "Dixon", "Dodd", "Donnelly", "Douglas",
  "Doyle", "Duffy", "Duncan", "Dunn", "Dwyer", "Edwards", "Elliott", "Ellis", "Evans", "Farrell",
  "Ferguson", "Fisher", "Fitzgerald", "Fleming", "Fletcher", "Flynn", "Ford", "Foster", "Fowler", "Fox",
  "Francis", "Fraser", "Freeman", "Fuller", "Gallagher", "Gardiner", "Garrett", "George", "Gibson", "Gilbert",
  "Giles", "Gill", "Glover", "Gorman", "Graham", "Grant", "Gray", "Green", "Gregory", "Griffin",
  "Griffiths", "Hall", "Hamilton", "Hammond", "Hansen", "Harding", "Hardy", "Harper", "Harris", "Harrison",
  "Hart", "Harvey", "Hawkins", "Hayes", "Haynes", "Healy", "Henderson", "Henry", "Higgins", "Hill",
  "Hogan", "Holland", "Holmes", "Hopkins", "Horton", "Howard", "Howe", "Hughes", "Hunt", "Hunter",
  "Hurley", "Hutchinson", "Jackson", "James", "Jamieson", "Jenkins", "Jennings", "Johns", "Johnson", "Johnston",
  "Jones", "Jordan", "Joyce", "Kane", "Kavanagh", "Keane", "Kearney", "Kelly", "Kennedy", "Kenny",
  "Kerr", "King", "Knight", "Lambert", "Lane", "Lang", "Larkin", "Lawrence", "Lawson", "Leahy",
  "Lee", "Lewis", "Lloyd", "Long", "Lynch", "Lyons", "MacDonald", "MacKay", "Madden", "Maguire",
  "Mahoney", "Malone", "Mann", "Manning", "Marshall", "Martin", "Mason", "Matthews", "May", "McCarthy",
  "McDonald", "McGrath", "McGuire", "McIntosh", "McKay", "McKenzie", "McLean", "McMahon", "McMillan", "McNamara",
  "McNeil", "McPherson", "Mead", "Meyer", "Miles", "Miller", "Mills", "Mitchell", "Molloy", "Montgomery",
  "Moore", "Morgan", "Morris", "Morrison", "Morrow", "Morton", "Moss", "Muir", "Mullins", "Murphy",
  "Murray", "Myers", "Nash", "Neil", "Nelson", "Newman", "Newton", "Nicholls", "Nicholson", "Nolan",
  "Norman", "Norris", "Norton", "O'Brien", "O'Connell", "O'Connor", "O'Donnell", "O'Keeffe", "O'Leary", "O'Neill",
  "O'Reilly", "O'Shea", "O'Sullivan", "Oliver", "Olsen", "Osborne", "Owen", "Page", "Palmer", "Parker",
  "Parsons", "Paterson", "Patrick", "Patterson", "Payne", "Pearce", "Pearson", "Perry", "Peters", "Peterson",
  "Phillips", "Pike", "Pitt", "Porter", "Potter", "Powell", "Power", "Price", "Pryor", "Quinn",
  "Ralph", "Ramsay", "Randall", "Read", "Reardon", "Reed", "Reid", "Reilly", "Reynolds", "Richards",
  "Richardson", "Riley", "Rioli", "Ritchie", "Roberts", "Robertson", "Robinson", "Robson", "Roche", "Rodgers",
  "Rogers", "Rose", "Ross", "Rowe", "Russell", "Ryan", "Salmon", "Saunders", "Savage", "Schmidt",
  "Schultz", "Scott", "Sharp", "Shaw", "Sheahan", "Shepherd", "Sheridan", "Short", "Simmons", "Simpson",
  "Sims", "Sinclair", "Skinner", "Slater", "Small", "Smart", "Smith", "Smyth", "Spence", "Spencer",
  "Stanley", "Steele", "Stephens", "Stephenson", "Stevens", "Stevenson", "Stewart", "Stone", "Sullivan", "Sutherland",
  "Sutton", "Swan", "Sweeney", "Tait", "Taylor", "Thomas", "Thompson", "Thomson", "Thornton", "Tierney",
  "Tobin", "Todd", "Tucker", "Turner", "Vaughan", "Wade", "Walker", "Wall", "Wallace", "Walsh",
  "Walters", "Ward", "Warner", "Warren", "Waters", "Watson", "Watt", "Watts", "Webb", "Webster",
  "Wells", "West", "Wheeler", "White", "Whitehead", "Wilkins", "Wilkinson", "Williams", "Williamson", "Willis",
  "Wills", "Wilson", "Winter", "Wise", "Wood", "Woods", "Wright", "Yates", "Young"
];