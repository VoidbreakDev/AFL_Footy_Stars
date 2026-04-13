import { LeagueTier, Position, AvatarConfig } from "./types";

export const INITIAL_ATTRIBUTE_POINTS = 15;
export const MAX_ATTRIBUTE_LEVEL = 99;

export const TEAM_NAMES_LOCAL = [
  "Mudcrabs", "Bushrangers", "Magpies", "Tigers", "Blues", "Demons", "Lions", "Hawks"
];

export const TEAM_NAMES_STATE = [
  "Wildcats", "Scorpions", "Thunder", "Lightning", "Flames", "Cyclones", "Dragons", "Sharks"
];

export const TEAM_NAMES_AFL = [
  "Collingwood", "Carlton", "Essendon", "Richmond", "Hawthorn", "Geelong", "Sydney", "Brisbane"
];

export const TEAM_NAMES_LOCAL_W = [
  "She-Devils", "Stingrays", "Kookaburras", "Vixens", "Darters", "Wrens", "Fillies", "Tigresses"
];

export const TEAM_NAMES_STATE_W = [
  "Tempest", "Valkyries", "Phoenix", "Banshees", "Sirens", "Raptors", "Storm", "Vipers"
];

export const TEAM_NAMES_AFLW = [
  "Adelaide", "Brisbane Lions", "Carlton", "Collingwood", "Essendon", "Fremantle", "Geelong", "Gold Coast"
];

// Team Logo Mappings
// For local images: place files in public/images/logos/[league]/[teamname].png
// Files in public/ are served from root (e.g., /images/logos/local/mudcrabs.png)
export const TEAM_LOGOS: { [key: string]: string } = {
  // Local League - Using local image files
  // Place your team logo images in: public/images/logos/local/
  // Supported formats: .png, .jpg, .svg
  "Mudcrabs": "/images/logos/local/mudcrabs.png",
  "Bushrangers": "/images/logos/local/bushrangers.png",
  "Magpies": "/images/logos/local/magpies.png",
  "Tigers": "/images/logos/local/tigers.png",
  "Blues": "/images/logos/local/blues.png",
  "Demons": "/images/logos/local/demons.png",
  "Lions": "/images/logos/local/lions.png",
  "Hawks": "/images/logos/local/hawks.png",

  // State League - Emoji fallbacks (replace with image paths when ready)
  "Wildcats": "🐱",
  "Scorpions": "🦂",
  "Thunder": "⚡",
  "Lightning": "🌩️",
  "Flames": "🔥",
  "Cyclones": "🌪️",
  "Dragons": "🐉",
  "Sharks": "🦈",

  // AFL - Emoji fallbacks (replace with image paths when ready)
  "Collingwood": "🐦‍⬛",
  "Carlton": "💙",
  "Essendon": "✈️",
  "Richmond": "🐯",
  "Hawthorn": "🦅",
  "Geelong": "🐱",
  "Sydney": "🦢",
  "Brisbane": "🦁"
};

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

// --- SHOP ITEMS ---
export const SHOP_ITEMS = [
  // RECOVERY ITEMS
  { id: 'energy_drink', name: 'Energy Drink', description: 'Instant +25 energy boost', price: 50, icon: '⚡', category: 'RECOVERY' as const, effect: { type: 'ENERGY' as const, value: 25 } },
  { id: 'sports_drink', name: 'Sports Drink', description: 'Restore +50 energy', price: 100, icon: '🥤', category: 'RECOVERY' as const, effect: { type: 'ENERGY' as const, value: 50 } },
  { id: 'recovery_session', name: 'Recovery Session', description: 'Full energy restore', price: 250, icon: '🧘', category: 'RECOVERY' as const, effect: { type: 'ENERGY' as const, value: 100 } },
  { id: 'physio_treatment', name: 'Physio Treatment', description: 'Reduce injury by 1 week', price: 500, icon: '💆', category: 'RECOVERY' as const, effect: { type: 'INJURY_HEAL' as const, value: 1 } },
  { id: 'surgery', name: 'Surgery', description: 'Instantly heal any injury', price: 2000, icon: '🏥', category: 'RECOVERY' as const, effect: { type: 'INJURY_HEAL' as const, value: 99 } },

  // TRAINING ITEMS
  { id: 'personal_trainer', name: 'Personal Trainer', description: '+5 skill points', price: 300, icon: '👟', category: 'TRAINING' as const, effect: { type: 'SKILL_POINTS' as const, value: 5 } },
  { id: 'elite_coaching', name: 'Elite Coaching', description: '+10 skill points', price: 600, icon: '📋', category: 'TRAINING' as const, effect: { type: 'SKILL_POINTS' as const, value: 10 } },
  { id: 'sports_psychologist', name: 'Sports Psychologist', description: '+30 morale boost', price: 200, icon: '🧠', category: 'TRAINING' as const, effect: { type: 'MORALE' as const, value: 30 } },
  { id: 'motivational_speaker', name: 'Motivational Speaker', description: 'Max out morale', price: 400, icon: '🎤', category: 'TRAINING' as const, effect: { type: 'MORALE' as const, value: 100 } },
  { id: 'xp_booster', name: 'XP Booster', description: '+500 XP instantly', price: 350, icon: '📈', category: 'TRAINING' as const, effect: { type: 'XP_BOOST' as const, value: 500 } },

  // ATTRIBUTE BOOSTERS (Expensive, permanent +1 boosts)
  { id: 'kicking_masterclass', name: 'Kicking Masterclass', description: '+1 permanent kicking', price: 1000, icon: '🦶', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'kicking' as const }, oneTime: true },
  { id: 'handball_clinic', name: 'Handball Clinic', description: '+1 permanent handball', price: 1000, icon: '✋', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'handball' as const }, oneTime: true },
  { id: 'tackling_workshop', name: 'Tackling Workshop', description: '+1 permanent tackling', price: 1000, icon: '🛡️', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'tackling' as const }, oneTime: true },
  { id: 'marking_school', name: 'Marking School', description: '+1 permanent marking', price: 1000, icon: '🙌', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'marking' as const }, oneTime: true },
  { id: 'speed_program', name: 'Speed Program', description: '+1 permanent speed', price: 1000, icon: '💨', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'speed' as const }, oneTime: true },
  { id: 'stamina_course', name: 'Stamina Course', description: '+1 permanent stamina', price: 1000, icon: '💪', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'stamina' as const }, oneTime: true },
  { id: 'goal_sense_training', name: 'Goal Sense Training', description: '+1 permanent goal sense', price: 1000, icon: '🎯', category: 'TRAINING' as const, effect: { type: 'ATTRIBUTE_BOOST' as const, value: 1, attribute: 'goalSense' as const }, oneTime: true },

  // VETERAN ITEMS
  { id: 'veteran_boost', name: 'Peak Conditioning Programme', description: 'Negates all attribute decline for one full season (age 30+). One use — consumed at season end.', price: 8000, icon: '🏋️', category: 'RECOVERY' as const, effect: { type: 'COSMETIC' as const, value: 0 } },

  // CAREER ITEMS (One-time purchases with special effects)
  { id: 'agent', name: 'Hire Agent', description: 'Better transfer offers', price: 5000, icon: '💼', category: 'CAREER' as const, effect: { type: 'COSMETIC' as const, value: 0 }, oneTime: true },
  { id: 'pr_manager', name: 'PR Manager', description: 'Boost fan popularity', price: 3000, icon: '📱', category: 'CAREER' as const, effect: { type: 'COSMETIC' as const, value: 0 }, oneTime: true },
  { id: 'lucky_charm', name: 'Lucky Charm', description: 'Better match performance', price: 2500, icon: '🍀', category: 'CAREER' as const, effect: { type: 'COSMETIC' as const, value: 0 }, oneTime: true },
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

// ===== AWARDS & HONORS =====
export enum AwardType {
  BROWNLOW_MEDAL = 'Brownlow Medal',
  COLEMAN_MEDAL = 'Coleman Medal',
  ALL_AUSTRALIAN = 'All-Australian Team',
  CLUB_BEST_AND_FAIREST = 'Club Best & Fairest',
  RISING_STAR = 'Rising Star',
  LEADING_DISPOSAL_WINNER = 'Leading Disposal Winner',
  LEADING_TACKLER = 'Leading Tackler',
  MARK_OF_THE_YEAR = 'Mark of the Year',
  GOAL_OF_THE_YEAR = 'Goal of the Year'
}

export const AWARD_DESCRIPTIONS = {
  [AwardType.BROWNLOW_MEDAL]: 'Most votes for best & fairest player across the season',
  [AwardType.COLEMAN_MEDAL]: 'Leading goal scorer of the season',
  [AwardType.ALL_AUSTRALIAN]: 'Selected in the best 22 players of the season',
  [AwardType.CLUB_BEST_AND_FAIREST]: 'Voted best player at your club',
  [AwardType.RISING_STAR]: 'Outstanding young player (under 21)',
  [AwardType.LEADING_DISPOSAL_WINNER]: 'Most disposals in the season',
  [AwardType.LEADING_TACKLER]: 'Most tackles in the season',
  [AwardType.MARK_OF_THE_YEAR]: 'Most spectacular mark of the season',
  [AwardType.GOAL_OF_THE_YEAR]: 'Most spectacular goal of the season'
};

export const AWARD_ICONS = {
  [AwardType.BROWNLOW_MEDAL]: '🏅',
  [AwardType.COLEMAN_MEDAL]: '⚽',
  [AwardType.ALL_AUSTRALIAN]: '⭐',
  [AwardType.CLUB_BEST_AND_FAIREST]: '🏆',
  [AwardType.RISING_STAR]: '🌟',
  [AwardType.LEADING_DISPOSAL_WINNER]: '🎯',
  [AwardType.LEADING_TACKLER]: '💪',
  [AwardType.MARK_OF_THE_YEAR]: '🙌',
  [AwardType.GOAL_OF_THE_YEAR]: '🔥'
};

// ===== CAREER EVENTS & RANDOM ENCOUNTERS =====

export interface CareerEventTemplate {
  id?: string;
  type: 'PERSONAL' | 'PROFESSIONAL' | 'RIVALRY' | 'TEAMMATE' | 'INJURY' | 'FINANCIAL' | 'OPPORTUNITY' | 'CRISIS' | 'FAN_MAIL' | 'RIVALRY_EVENT';
  category: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CHOICE';
  title: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  triggerCondition?: string;
  immediateEffects?: any;
  choices?: any[];
}

export const CAREER_EVENT_TEMPLATES: CareerEventTemplate[] = [
  // ===== POSITIVE EVENTS =====
  {
    type: 'PROFESSIONAL',
    category: 'POSITIVE',
    title: 'Media Coaching Session',
    description: 'Your club has arranged professional media training to help you handle interviews better.',
    icon: '🎤',
    rarity: 'COMMON',
    immediateEffects: {
      mediaReputation: 5,
      skillPoints: 1,
      resultText: 'You feel more confident speaking to the media!'
    }
  },
  {
    type: 'PERSONAL',
    category: 'POSITIVE',
    title: 'Perfect Night Sleep',
    description: 'You had the best sleep of your life. You wake up feeling completely refreshed and ready to dominate!',
    icon: '😴',
    rarity: 'COMMON',
    immediateEffects: {
      energy: 30,
      morale: 10,
      resultText: 'You feel incredible and ready to take on the world!'
    }
  },
  {
    type: 'PROFESSIONAL',
    category: 'POSITIVE',
    title: 'Performance Bonus',
    description: 'Your recent form has earned you a performance bonus from the club!',
    icon: '💰',
    rarity: 'UNCOMMON',
    triggerCondition: 'WIN_STREAK_3',
    immediateEffects: {
      wallet: 5000,
      morale: 15,
      resultText: 'The club rewards your excellent performances with extra cash!'
    }
  },
  {
    type: 'TEAMMATE',
    category: 'POSITIVE',
    title: 'Mentorship Opportunity',
    description: 'A club legend has offered to personally train with you this week.',
    icon: '🤝',
    rarity: 'RARE',
    immediateEffects: {
      attributeChanges: { kicking: 2, marking: 2 },
      skillPoints: 2,
      morale: 20,
      resultText: 'Training with a legend has improved your skills significantly!'
    }
  },
  {
    type: 'PERSONAL',
    category: 'POSITIVE',
    title: 'Charity Event Success',
    description: 'Your charity work in the community has gone viral on social media!',
    icon: '❤️',
    rarity: 'UNCOMMON',
    immediateEffects: {
      mediaReputation: 15,
      fanFollowers: 5000,
      morale: 10,
      resultText: 'Fans love seeing you give back to the community!'
    }
  },

  // ===== NEGATIVE EVENTS =====
  {
    type: 'PERSONAL',
    category: 'NEGATIVE',
    title: 'Food Poisoning',
    description: 'That dodgy kebab from last night is coming back to haunt you...',
    icon: '🤢',
    rarity: 'COMMON',
    immediateEffects: {
      energy: -20,
      morale: -5,
      resultText: 'You spend the day feeling awful. Note to self: avoid that food truck.'
    }
  },
  {
    type: 'PROFESSIONAL',
    category: 'NEGATIVE',
    title: 'Social Media Backlash',
    description: 'An old social media post has resurfaced and fans aren\'t happy.',
    icon: '📱',
    rarity: 'UNCOMMON',
    immediateEffects: {
      mediaReputation: -10,
      fanFollowers: -2000,
      morale: -15,
      resultText: 'The online criticism hurts, but you\'ll learn from this.'
    }
  },
  {
    type: 'INJURY',
    category: 'NEGATIVE',
    title: 'Minor Training Injury',
    description: 'You tweaked something at training. It\'s not serious, but you\'ll need to rest.',
    icon: '🩹',
    rarity: 'COMMON',
    triggerCondition: 'LOW_ENERGY',
    immediateEffects: {
      injuryWeeks: 1,
      morale: -10,
      resultText: 'A week on the sidelines to recover. Time to rest up.'
    }
  },
  {
    type: 'RIVALRY',
    category: 'NEGATIVE',
    title: 'Heated Exchange',
    description: 'You and an opponent had a heated exchange after the match. The media is all over it.',
    icon: '😤',
    rarity: 'UNCOMMON',
    triggerCondition: 'AFTER_LOSS',
    immediateEffects: {
      mediaReputation: -5,
      morale: -5,
      resultText: 'The incident is all over the news. You\'ll need to keep your cool next time.'
    }
  },
  {
    type: 'FINANCIAL',
    category: 'NEGATIVE',
    title: 'Unexpected Expense',
    description: 'Your car broke down and repairs are expensive.',
    icon: '🚗',
    rarity: 'COMMON',
    immediateEffects: {
      wallet: -3000,
      morale: -5,
      resultText: 'Ouch. That hurt the bank account.'
    }
  },

  // ===== CHOICE-BASED EVENTS =====
  {
    type: 'OPPORTUNITY',
    category: 'CHOICE',
    title: 'Sponsorship Deal Offer',
    description: 'A sports brand wants you to become their ambassador. Accept the deal or focus on football?',
    icon: '🏷️',
    rarity: 'RARE',
    triggerCondition: 'HIGH_MEDIA_REP',
    choices: [
      {
        id: 'accept_deal',
        label: 'Accept the Deal',
        description: 'Take the money and build your brand',
        icon: '💼',
        effects: {
          wallet: 10000,
          mediaReputation: 10,
          fanFollowers: 3000,
          energy: -10,
          resultText: 'The sponsorship deal is lucrative, but takes time away from training.'
        },
        risk: 'LOW'
      },
      {
        id: 'decline_deal',
        label: 'Decline Politely',
        description: 'Stay focused on your football career',
        icon: '🏉',
        effects: {
          morale: 5,
          skillPoints: 2,
          resultText: 'You stay focused on football. Your dedication impresses the coaches.'
        },
        risk: 'LOW'
      }
    ]
  },
  {
    type: 'CRISIS',
    category: 'CHOICE',
    title: 'Teammate Conflict',
    description: 'You\'ve had a falling out with a senior teammate. How do you handle it?',
    icon: '⚠️',
    rarity: 'UNCOMMON',
    choices: [
      {
        id: 'apologize',
        label: 'Apologize',
        description: 'Take the high road and make peace',
        icon: '🤝',
        effects: {
          morale: 10,
          mediaReputation: 5,
          resultText: 'You squash the beef and the team is stronger for it.'
        },
        risk: 'LOW'
      },
      {
        id: 'stand_ground',
        label: 'Stand Your Ground',
        description: 'Don\'t back down from your position',
        icon: '💪',
        effects: {
          morale: -10,
          mediaReputation: -10,
          attributeChanges: { tackling: 1 },
          resultText: 'You maintain your integrity, but team chemistry suffers.'
        },
        risk: 'HIGH'
      },
      {
        id: 'avoid',
        label: 'Avoid the Issue',
        description: 'Just focus on football and ignore it',
        icon: '🙈',
        effects: {
          morale: -5,
          energy: -5,
          resultText: 'The tension lingers, but at least there\'s no drama.'
        },
        risk: 'MEDIUM'
      }
    ]
  },
  {
    type: 'PROFESSIONAL',
    category: 'CHOICE',
    title: 'Intense Training Camp Invitation',
    description: 'An elite training camp during the off-season could improve your skills, but it\'s exhausting.',
    icon: '🏋️',
    rarity: 'UNCOMMON',
    choices: [
      {
        id: 'attend_full',
        label: 'Full Commitment',
        description: 'Give it everything you\'ve got',
        icon: '💯',
        effects: {
          attributeChanges: { stamina: 3, speed: 2 },
          energy: -30,
          wallet: -2000,
          skillPoints: 3,
          resultText: 'Brutal but worth it. You\'ve never been fitter!'
        },
        risk: 'HIGH'
      },
      {
        id: 'attend_partial',
        label: 'Partial Participation',
        description: 'Attend but take it easy',
        icon: '⚖️',
        effects: {
          attributeChanges: { stamina: 1 },
          energy: -10,
          wallet: -1000,
          skillPoints: 1,
          resultText: 'A balanced approach yields modest improvements.'
        },
        risk: 'LOW'
      },
      {
        id: 'skip',
        label: 'Skip It',
        description: 'Rest and recover instead',
        icon: '🏖️',
        effects: {
          energy: 20,
          morale: -5,
          resultText: 'You feel refreshed, but wonder if you missed an opportunity.'
        },
        risk: 'LOW'
      }
    ]
  },
  {
    type: 'OPPORTUNITY',
    category: 'CHOICE',
    title: 'Position Change Request',
    description: 'The coach wants to try you in a different position. It could expand your game or throw you off.',
    icon: '🔄',
    rarity: 'RARE',
    choices: [
      {
        id: 'embrace_change',
        label: 'Embrace the Challenge',
        description: 'Learn a new position and become more versatile',
        icon: '🌟',
        effects: {
          morale: 5,
          skillPoints: 5,
          resultText: 'Versatility is valuable. You\'re now a multi-position threat!'
        },
        risk: 'MEDIUM'
      },
      {
        id: 'resist_change',
        label: 'Stick to Your Strengths',
        description: 'Politely decline and stay in your preferred position',
        icon: '🛡️',
        effects: {
          morale: -10,
          mediaReputation: -5,
          resultText: 'The coach respects your decision but isn\'t thrilled.'
        },
        risk: 'MEDIUM'
      }
    ]
  },

  // ===== LEGENDARY/EPIC EVENTS =====
  {
    type: 'OPPORTUNITY',
    category: 'POSITIVE',
    title: 'State Team Selection',
    description: 'You\'ve been selected to represent your state in an exhibition match!',
    icon: '🏆',
    rarity: 'EPIC',
    triggerCondition: 'HIGH_STATS',
    immediateEffects: {
      mediaReputation: 20,
      fanFollowers: 10000,
      morale: 25,
      skillPoints: 5,
      wallet: 5000,
      resultText: 'An incredible honor! Your profile just skyrocketed!'
    }
  },
  {
    type: 'PERSONAL',
    category: 'POSITIVE',
    title: 'Wedding Day',
    description: 'You\'ve tied the knot! Life off the field is looking bright.',
    icon: '💍',
    rarity: 'LEGENDARY',
    immediateEffects: {
      morale: 40,
      energy: 20,
      mediaReputation: 10,
      fanFollowers: 5000,
      wallet: -15000,
      resultText: 'The happiest day of your life! Though expensive, worth every cent.'
    }
  },
  {
    type: 'CRISIS',
    category: 'CHOICE',
    title: 'Serious Injury Setback',
    description: 'A significant injury threatens your season. Surgery and recovery, or risk playing through it?',
    icon: '🏥',
    rarity: 'EPIC',
    triggerCondition: 'INJURY_PRONE',
    choices: [
      {
        id: 'surgery',
        label: 'Get Surgery',
        description: 'Miss 4+ weeks but fully recover',
        icon: '⚕️',
        effects: {
          injuryWeeks: 4,
          morale: -15,
          energy: -40,
          resultText: 'A tough recovery ahead, but you\'ll come back stronger.'
        },
        risk: 'MEDIUM'
      },
      {
        id: 'play_through',
        label: 'Play Through Pain',
        description: 'Take painkillers and push through',
        icon: '💊',
        effects: {
          attributeChanges: { speed: -3, stamina: -2 },
          morale: 10,
          energy: -20,
          resultText: 'You gut it out, but your body pays the price long-term.'
        },
        risk: 'HIGH'
      }
    ]
  },
  {
    type: 'OPPORTUNITY',
    category: 'CHOICE',
    title: 'Reality TV Show Offer',
    description: 'You\'ve been offered a spot on a reality TV show. Big money, but it could impact your reputation.',
    icon: '📺',
    rarity: 'RARE',
    triggerCondition: 'HIGH_MEDIA_REP',
    choices: [
      {
        id: 'accept_tv',
        label: 'Accept the Offer',
        description: 'Cash in on your fame',
        icon: '💵',
        effects: {
          wallet: 25000,
          fanFollowers: 15000,
          mediaReputation: -15,
          morale: 10,
          energy: -20,
          resultText: 'You make bank, but some footy purists aren\'t happy.'
        },
        risk: 'HIGH'
      },
      {
        id: 'decline_tv',
        label: 'Decline the Offer',
        description: 'Stay focused on football',
        icon: '🏉',
        effects: {
          mediaReputation: 10,
          morale: 5,
          resultText: 'You maintain your football-first reputation. Respect.'
        },
        risk: 'LOW'
      }
    ]
  },

  // ===== MORE COMMON EVENTS =====
  {
    type: 'PERSONAL',
    category: 'NEUTRAL',
    title: 'Old Friend Visits',
    description: 'A childhood friend is in town and wants to catch up over coffee.',
    icon: '☕',
    rarity: 'COMMON',
    immediateEffects: {
      morale: 10,
      energy: -5,
      resultText: 'A nice reminder of where you came from. Keeps you grounded.'
    }
  },
  {
    type: 'PROFESSIONAL',
    category: 'POSITIVE',
    title: 'Coach\'s Praise',
    description: 'The coach singled you out at the team meeting for your recent efforts.',
    icon: '👏',
    rarity: 'COMMON',
    triggerCondition: 'GOOD_FORM',
    immediateEffects: {
      morale: 15,
      skillPoints: 1,
      resultText: 'Public recognition from the coach boosts your confidence!'
    }
  },
  {
    type: 'TEAMMATE',
    category: 'POSITIVE',
    title: 'Team Bonding Activity',
    description: 'The boys organized a team dinner. Great for morale!',
    icon: '🍻',
    rarity: 'COMMON',
    immediateEffects: {
      morale: 12,
      energy: -5,
      resultText: 'Team chemistry is important. You bond with your teammates.'
    }
  },
  {
    type: 'PROFESSIONAL',
    category: 'NEGATIVE',
    title: 'Coach\'s Criticism',
    description: 'The coach wasn\'t impressed with your recent training efforts.',
    icon: '😠',
    rarity: 'COMMON',
    triggerCondition: 'LOW_ENERGY',
    immediateEffects: {
      morale: -10,
      resultText: 'Ouch. Time to lift your intensity at training.'
    }
  },
  {
    type: 'PERSONAL',
    category: 'POSITIVE',
    title: 'Fan Encounter',
    description: 'A young fan asked for your autograph. Made their day!',
    icon: '✍️',
    rarity: 'COMMON',
    immediateEffects: {
      morale: 8,
      fanFollowers: 500,
      resultText: 'Small moments like this remind you why you play.'
    }
  },

  // ===== FAN MAIL EVENTS =====
  {
    id: 'fan_mail_young_supporter',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: 'Young Supporter',
    description: 'A junior footballer has written asking for career advice.',
    icon: '👦',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'MENTOR', label: 'Mentor Them', description: 'Take time to help', icon: '🤝', effects: { morale: 5, mediaReputation: 3 } },
      { id: 'BRUSH_OFF', label: 'Too Busy', description: "You're in the middle of a season", icon: '🚫', effects: {} },
    ]
  },
  {
    id: 'fan_mail_superfan',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: 'Superfan Obsession',
    description: 'An overly devoted fan keeps showing up at training sessions.',
    icon: '😤',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'ACKNOWLEDGE', label: 'Acknowledge Them', description: 'Give them a wave and a moment', icon: '👋', effects: { fanFollowers: 200 } },
      { id: 'SET_LIMITS', label: 'Set Boundaries', description: 'Politely ask them to keep their distance', icon: '🚧', effects: { morale: 3, mediaReputation: -2 } },
    ]
  },
  {
    id: 'fan_mail_critical_doubter',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: 'Critical Doubter',
    description: 'A fan publicly questions your ability on social media.',
    icon: '👎',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'PROVE_WRONG', label: 'Prove Them Wrong', description: 'Use it as fuel', icon: '🔥', effects: { morale: 5 } },
      { id: 'IGNORE', label: 'Ignore It', description: "Don't feed the negativity", icon: '🙄', effects: {} },
    ]
  },
  {
    id: 'fan_mail_charity',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: 'Charity Request',
    description: 'A fan asks you to support a local community fundraiser.',
    icon: '❤️',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'DONATE', label: 'Donate ($500)', description: 'Give back to the community', icon: '💸', effects: { wallet: -500, mediaReputation: 10 } },
      { id: 'DECLINE', label: 'Decline', description: 'Keep your funds for now', icon: '🚫', effects: {} },
    ]
  },
  {
    id: 'fan_mail_hospital',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: "Kids' Hospital Visit",
    description: "You've been invited to visit children at the local hospital.",
    icon: '🏥',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'ATTEND', label: 'Attend', description: 'Make their day', icon: '💛', effects: { morale: 8, fanFollowers: 500 } },
      { id: 'SKIP', label: 'Skip', description: 'Too busy this week', icon: '🚫', effects: { mediaReputation: -5 } },
    ]
  },
  {
    id: 'fan_mail_tribute_video',
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: 'Fan Tribute Video',
    description: 'Supporters created a highlights video in your honour.',
    icon: '🎬',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'SHARE_IT', label: 'Share It', description: 'Post it for everyone to see', icon: '📲', effects: { fanFollowers: 200 } },
      { id: 'PRIVATE_MOMENT', label: 'Keep It Private', description: 'A personal moment to cherish', icon: '🤍', effects: { morale: 5 } },
    ]
  },

  // ===== RIVALRY EVENT TEMPLATES =====
  {
    id: 'rivalry_trash_talk',
    type: 'RIVALRY_EVENT',
    category: 'CHOICE',
    title: 'Pre-Match Trash Talk',
    description: 'Your rival was quoted in the media before your upcoming clash.',
    icon: '🗣️',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'CLAP_BACK', label: 'Fire Back', description: 'Hit back with confidence', icon: '🔥', effects: { morale: 5 } },
      { id: 'STAY_FOCUSED', label: 'Stay Focused', description: 'Ignore the noise', icon: '🎯', effects: {} },
    ]
  },
  {
    id: 'rivalry_handshake',
    type: 'RIVALRY_EVENT',
    category: 'CHOICE',
    title: 'Post-Match Handshake',
    description: 'After beating your rival, a moment of sportsmanship awaits.',
    icon: '🤝',
    rarity: 'UNCOMMON',
    choices: [
      { id: 'RESPECT', label: 'Show Respect', description: 'Be magnanimous in victory', icon: '🫡', effects: { mediaReputation: 5 } },
      { id: 'GLOAT', label: 'Gloat', description: 'Let them know it', icon: '😏', effects: { fanFollowers: 200 } },
    ]
  },
  {
    id: 'rivalry_resolved',
    type: 'RIVALRY_EVENT',
    category: 'CHOICE',
    title: 'Rivalry Resolved',
    description: "After five wins over your rival, you've proven your dominance.",
    icon: '🏅',
    rarity: 'RARE',
    choices: [
      { id: 'BURY_HATCHET', label: 'Bury the Hatchet', description: 'End it with class', icon: '🕊️', effects: { rivalryResolved: true } },
      { id: 'KEEP_FIRE', label: 'Keep the Fire Burning', description: 'The rivalry lives on', icon: '🔥', effects: { morale: 2 } },
    ]
  },
];

// ===== TEAM CHEMISTRY & RELATIONSHIPS =====

export const PERSONALITY_TYPES = [
  'LEADER',
  'JOKER',
  'QUIET',
  'INTENSE',
  'SUPPORTIVE',
  'COMPETITIVE'
] as const;

export const RELATIONSHIP_STATUS_THRESHOLDS = {
  ENEMY: 0,
  RIVAL: 20,
  STRANGER: 40,
  ACQUAINTANCE: 55,
  FRIEND: 70,
  CLOSE_FRIEND: 85,
  BEST_MATE: 95
};

export const CHEMISTRY_FORM_THRESHOLDS = {
  FREEZING: 0,
  COLD: 30,
  NEUTRAL: 50,
  WARM: 70,
  HOT: 85
};

// ===== COACHING & STAFF SYSTEM =====

export const COACH_PERSONALITIES = [
  'DISCIPLINARIAN',
  'MENTOR',
  'TACTICIAN',
  'MOTIVATOR',
  'INNOVATOR',
  'VETERAN'
] as const;

export const COACH_SPECIALTIES = [
  'TACTICS',
  'LEADERSHIP',
  'FITNESS',
  'Forward',
  'Midfielder',
  'Defender',
  'Ruck'
] as const;

export const STAFF_ROLES = {
  FITNESS_TRAINER: { icon: '💪', effect: 'TRAINING' },
  PHYSIO: { icon: '🏥', effect: 'RECOVERY' },
  NUTRITIONIST: { icon: '🥗', effect: 'INJURY_PREVENTION' },
  MENTAL_COACH: { icon: '🧠', effect: 'MORALE' },
  SKILLS_COACH: { icon: '⚽', effect: 'ATTRIBUTES' }
} as const;

// Famous coach name templates (Australian football theme)
export const COACH_FIRST_NAMES = [
  'John', 'Michael', 'David', 'Chris', 'Mark', 'Paul', 'Peter', 'Tony',
  'Kevin', 'Ross', 'Leigh', 'Mick', 'Alastair', 'Denis', 'Robert', 'Malcolm'
];

export const COACH_LAST_NAMES = [
  'Thompson', 'Clarkson', 'Matthews', 'Sheedy', 'Jeans', 'Hafey', 'Malthouse',
  'Worsfold', 'Roos', 'Longmire', 'Hardwick', 'Scott', 'Simpson', 'Beveridge'
];

export const COACH_PERSONALITY_EFFECTS = {
  DISCIPLINARIAN: {
    trainingBonus: 15,
    moraleImpact: -5,
    trustRequired: 70,
    description: 'Demands excellence, tough but fair'
  },
  MENTOR: {
    trainingBonus: 10,
    moraleImpact: 10,
    trustRequired: 50,
    description: 'Supportive and developmental'
  },
  TACTICIAN: {
    trainingBonus: 12,
    moraleImpact: 0,
    trustRequired: 60,
    description: 'Strategic mastermind'
  },
  MOTIVATOR: {
    trainingBonus: 8,
    moraleImpact: 15,
    trustRequired: 40,
    description: 'Inspires peak performance'
  },
  INNOVATOR: {
    trainingBonus: 13,
    moraleImpact: 5,
    trustRequired: 55,
    description: 'Cutting-edge methods'
  },
  VETERAN: {
    trainingBonus: 11,
    moraleImpact: 8,
    trustRequired: 45,
    description: 'Wise and experienced'
  }
};

// ========================================
// MASTER SKILL TREE
// ========================================
// Special abilities unlocked with high attribute levels + XP + SP

import { MasterSkill } from './types';

export const MASTER_SKILLS: MasterSkill[] = [
  // ========== KICKING SKILLS ==========
  {
    id: 'long_bombing',
    name: 'Long Bombing',
    description: 'Unlock the ability to kick goals from outside 50 meters',
    icon: '🚀',
    category: 'kicking',
    prerequisiteLevel: 25,
    xpCost: 2500,
    spCost: 10,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.15, // 15% chance on long shots
    rarity: 'RARE'
  },
  {
    id: 'banana_kick',
    name: 'Banana Kick Specialist',
    description: 'Master the art of curving kicks around defenders',
    icon: '🍌',
    category: 'kicking',
    prerequisiteLevel: 40,
    xpCost: 5000,
    spCost: 15,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.2, // 20% chance for banana goals
    rarity: 'EPIC'
  },
  {
    id: 'clutch_kicker',
    name: 'Clutch Kicker',
    description: '+15% goal accuracy in close matches (within 12 points)',
    icon: '🎯',
    category: 'kicking',
    prerequisiteLevel: 50,
    xpCost: 7500,
    spCost: 20,
    effectType: 'MATCH_BONUS',
    effectValue: 0.15,
    rarity: 'EPIC'
  },
  {
    id: 'torpedo_king',
    name: 'Torpedo King',
    description: 'Devastating long-range torpedoes that split the defense',
    icon: '💥',
    category: 'kicking',
    prerequisiteLevel: 70,
    xpCost: 12000,
    spCost: 30,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.25,
    rarity: 'LEGENDARY'
  },

  // ========== MARKING SKILLS ==========
  {
    id: 'pack_crasher',
    name: 'Pack Crasher',
    description: 'Increased chance to take contested marks in heavy traffic',
    icon: '🦘',
    category: 'marking',
    prerequisiteLevel: 30,
    xpCost: 3000,
    spCost: 12,
    effectType: 'MATCH_BONUS',
    effectValue: 0.2, // +20% contested mark chance
    rarity: 'RARE'
  },
  {
    id: 'specky_machine',
    name: 'Specky Machine',
    description: 'Master the spectacular mark - leap over opponents',
    icon: '⭐',
    category: 'marking',
    prerequisiteLevel: 40,
    xpCost: 5000,
    spCost: 15,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.18, // 18% chance for spectacular marks
    rarity: 'EPIC'
  },
  {
    id: 'intercept_master',
    name: 'Intercept Master',
    description: '+25% chance to intercept opposition kicks',
    icon: '🛡️',
    category: 'marking',
    prerequisiteLevel: 55,
    xpCost: 8000,
    spCost: 22,
    effectType: 'MATCH_BONUS',
    effectValue: 0.25,
    rarity: 'EPIC'
  },
  {
    id: 'aerial_dominance',
    name: 'Aerial Dominance',
    description: 'Completely dominate aerial contests - near unstoppable',
    icon: '👑',
    category: 'marking',
    prerequisiteLevel: 75,
    xpCost: 15000,
    spCost: 35,
    effectType: 'ATTRIBUTE_MULTIPLIER',
    effectValue: 1.3, // 30% marking effectiveness boost
    rarity: 'LEGENDARY'
  },

  // ========== HANDBALL SKILLS ==========
  {
    id: 'bullet_handball',
    name: 'Bullet Handball',
    description: 'Lightning-fast handballs that cut through traffic',
    icon: '⚡',
    category: 'handball',
    prerequisiteLevel: 30,
    xpCost: 3000,
    spCost: 12,
    effectType: 'MATCH_BONUS',
    effectValue: 0.15, // +15% handball effectiveness
    rarity: 'RARE'
  },
  {
    id: 'handball_receive',
    name: 'Handball Receive Specialist',
    description: 'Expert at receiving and delivering in tight spaces',
    icon: '🤝',
    category: 'handball',
    prerequisiteLevel: 45,
    xpCost: 6000,
    spCost: 18,
    effectType: 'MATCH_BONUS',
    effectValue: 0.2, // +5 disposals per game average
    rarity: 'EPIC'
  },
  {
    id: 'dont_argue',
    name: 'Don\'t Argue',
    description: 'Powerful fend-off technique to create space',
    icon: '💪',
    category: 'handball',
    prerequisiteLevel: 60,
    xpCost: 9000,
    spCost: 25,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.15,
    rarity: 'EPIC'
  },

  // ========== TACKLING SKILLS ==========
  {
    id: 'shutdown_defender',
    name: 'Shutdown Defender',
    description: 'Lock down your opponent - they can\'t shake you',
    icon: '🔒',
    category: 'tackling',
    prerequisiteLevel: 35,
    xpCost: 4000,
    spCost: 14,
    effectType: 'MATCH_BONUS',
    effectValue: 0.25, // +25% tackle effectiveness
    rarity: 'RARE'
  },
  {
    id: 'gang_tackle',
    name: 'Gang Tackle Coordinator',
    description: 'Organize multi-player tackles for turnovers',
    icon: '👥',
    category: 'tackling',
    prerequisiteLevel: 50,
    xpCost: 7000,
    spCost: 20,
    effectType: 'MATCH_BONUS',
    effectValue: 0.2, // +20% turnover chance
    rarity: 'EPIC'
  },
  {
    id: 'bump_master',
    name: 'Bump Master',
    description: 'Devastating hip-and-shoulder that rocks opponents',
    icon: '💢',
    category: 'tackling',
    prerequisiteLevel: 65,
    xpCost: 10000,
    spCost: 28,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.2,
    rarity: 'LEGENDARY'
  },

  // ========== SPEED SKILLS ==========
  {
    id: 'burst_speed',
    name: 'Burst Speed',
    description: 'Explosive acceleration to break away from opponents',
    icon: '💨',
    category: 'speed',
    prerequisiteLevel: 35,
    xpCost: 4000,
    spCost: 14,
    effectType: 'MATCH_BONUS',
    effectValue: 0.2, // +20% breakaway chance
    rarity: 'RARE'
  },
  {
    id: 'coast_to_coast',
    name: 'Coast to Coast',
    description: 'Run the length of the field for spectacular goals',
    icon: '🏃',
    category: 'speed',
    prerequisiteLevel: 55,
    xpCost: 8000,
    spCost: 22,
    effectType: 'HIGHLIGHT_UNLOCK',
    effectValue: 0.12, // 12% chance for coast-to-coast goals
    rarity: 'EPIC'
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Peak speed - opponents can\'t lay a finger on you',
    icon: '👻',
    category: 'speed',
    prerequisiteLevel: 80,
    xpCost: 18000,
    spCost: 40,
    effectType: 'ATTRIBUTE_MULTIPLIER',
    effectValue: 1.4, // 40% speed effectiveness boost
    rarity: 'LEGENDARY'
  },

  // ========== STAMINA SKILLS ==========
  {
    id: 'fourth_quarter_beast',
    name: 'Fourth Quarter Beast',
    description: '+30% performance in the final quarter when tired',
    icon: '🔥',
    category: 'stamina',
    prerequisiteLevel: 40,
    xpCost: 5000,
    spCost: 16,
    effectType: 'MATCH_BONUS',
    effectValue: 0.3,
    rarity: 'EPIC'
  },
  {
    id: 'workhorse',
    name: 'Workhorse',
    description: 'Never tire - maintain peak performance all game',
    icon: '🐎',
    category: 'stamina',
    prerequisiteLevel: 60,
    xpCost: 9000,
    spCost: 25,
    effectType: 'MATCH_BONUS',
    effectValue: 0.25, // +25% overall stamina
    rarity: 'EPIC'
  },
  {
    id: 'iron_man',
    name: 'Iron Man',
    description: 'Legendary endurance - play every second without fatigue',
    icon: '🦾',
    category: 'stamina',
    prerequisiteLevel: 85,
    xpCost: 20000,
    spCost: 45,
    effectType: 'ATTRIBUTE_MULTIPLIER',
    effectValue: 1.5, // 50% stamina boost
    rarity: 'LEGENDARY'
  },

  // ========== GOAL SENSE SKILLS ==========
  {
    id: 'goal_sneak',
    name: 'Goal Sneak',
    description: 'Find space in the forward 50 - always dangerous',
    icon: '🎪',
    category: 'goalSense',
    prerequisiteLevel: 30,
    xpCost: 3000,
    spCost: 12,
    effectType: 'MATCH_BONUS',
    effectValue: 0.2, // +20% goal scoring chance
    rarity: 'RARE'
  },
  {
    id: 'crumb_master',
    name: 'Crumb Master',
    description: 'Elite at gathering ground balls in the goal square',
    icon: '🍞',
    category: 'goalSense',
    prerequisiteLevel: 45,
    xpCost: 6000,
    spCost: 18,
    effectType: 'MATCH_BONUS',
    effectValue: 0.25, // +25% crumbing ability
    rarity: 'EPIC'
  },
  {
    id: 'goal_sense_master',
    name: 'Goal Sense Master',
    description: 'Uncanny ability to find goals from anywhere',
    icon: '🧭',
    category: 'goalSense',
    prerequisiteLevel: 70,
    xpCost: 12000,
    spCost: 30,
    effectType: 'ATTRIBUTE_MULTIPLIER',
    effectValue: 1.35, // 35% goal sense boost
    rarity: 'LEGENDARY'
  },
  {
    id: 'Coleman_medal_threat',
    name: 'Coleman Medal Threat',
    description: 'Elite goal-kicking prowess - bag 5+ goals regularly',
    icon: '🏅',
    category: 'goalSense',
    prerequisiteLevel: 90,
    xpCost: 25000,
    spCost: 50,
    effectType: 'ATTRIBUTE_MULTIPLIER',
    effectValue: 1.6, // 60% goal sense boost
    rarity: 'LEGENDARY'
  }
];