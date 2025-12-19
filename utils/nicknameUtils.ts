import { PlayerProfile, Position } from '../types';

interface NicknameRule {
  nickname: string;
  condition: (player: PlayerProfile) => boolean;
  priority: number; // Higher priority = more specific/impressive
}

// Nickname database based on playstyle and achievements
const NICKNAME_RULES: NicknameRule[] = [
  // LEGENDARY PERFORMANCE (Priority 100+)
  { nickname: "The GOAT", condition: (p) => Object.values(p.attributes).every(v => v >= 95), priority: 150 },
  { nickname: "The Immortal", condition: (p) => p.careerStats.matches >= 350, priority: 140 },
  { nickname: "Triple Threat", condition: (p) => p.careerStats.goals >= 500 && p.careerStats.disposals >= 5000 && p.careerStats.tackles >= 500, priority: 130 },
  { nickname: "Mr. Clutch", condition: (p) => p.careerStats.premierships >= 3, priority: 120 },
  { nickname: "The Dynasty", condition: (p) => p.careerStats.premierships >= 4, priority: 125 },

  // GOAL SCORING (Priority 80-99)
  { nickname: "Goal Machine", condition: (p) => p.careerStats.goals >= 400, priority: 95 },
  { nickname: "The Sniper", condition: (p) => p.careerStats.goals >= 300 && p.position === Position.FORWARD, priority: 90 },
  { nickname: "The Finisher", condition: (p) => p.careerStats.goals >= 200 && p.attributes.goalSense >= 85, priority: 85 },
  { nickname: "Sharp Shooter", condition: (p) => p.careerStats.goals >= 150 && p.attributes.kicking >= 85, priority: 82 },
  { nickname: "The Threat", condition: (p) => p.careerStats.goals >= 100 && p.position === Position.FORWARD, priority: 80 },

  // MIDFIELD DOMINANCE (Priority 80-99)
  { nickname: "The Engine", condition: (p) => p.careerStats.disposals >= 8000 && p.position === Position.MIDFIELDER, priority: 95 },
  { nickname: "Ball Magnet", condition: (p) => p.careerStats.disposals >= 6000, priority: 92 },
  { nickname: "The Workhorse", condition: (p) => p.careerStats.disposals >= 4000 && p.attributes.stamina >= 85, priority: 88 },
  { nickname: "Playmaker", condition: (p) => p.careerStats.disposals >= 3000 && p.attributes.handball >= 85, priority: 85 },
  { nickname: "The General", condition: (p) => p.careerStats.disposals >= 2000 && p.position === Position.MIDFIELDER, priority: 80 },

  // DEFENSIVE EXCELLENCE (Priority 80-99)
  { nickname: "The Wall", condition: (p) => p.careerStats.tackles >= 800 && p.position === Position.DEFENDER, priority: 95 },
  { nickname: "The Enforcer", condition: (p) => p.careerStats.tackles >= 600, priority: 90 },
  { nickname: "The Lockdown", condition: (p) => p.careerStats.tackles >= 400 && p.attributes.tackling >= 85, priority: 85 },
  { nickname: "Tank", condition: (p) => p.careerStats.tackles >= 300 && p.attributes.stamina >= 80, priority: 82 },

  // ATTRIBUTE-BASED (Priority 70-79)
  { nickname: "Lightning", condition: (p) => p.attributes.speed >= 95, priority: 78 },
  { nickname: "Flash", condition: (p) => p.attributes.speed >= 90 && p.attributes.speed > p.attributes.stamina, priority: 75 },
  { nickname: "The Rocket", condition: (p) => p.attributes.speed >= 85 && p.position === Position.FORWARD, priority: 72 },
  { nickname: "High Flyer", condition: (p) => p.attributes.marking >= 90, priority: 76 },
  { nickname: "The Specky", condition: (p) => p.attributes.marking >= 85 && p.careerStats.goals >= 50, priority: 73 },
  { nickname: "Golden Boot", condition: (p) => p.attributes.kicking >= 90, priority: 75 },
  { nickname: "Silk", condition: (p) => p.attributes.handball >= 90, priority: 74 },

  // CAREER MILESTONES (Priority 60-69)
  { nickname: "The Legend", condition: (p) => p.careerStats.matches >= 250, priority: 68 },
  { nickname: "The Veteran", condition: (p) => p.careerStats.matches >= 200, priority: 65 },
  { nickname: "Iron Man", condition: (p) => (p.injuryFreeStreak || 0) >= 50, priority: 67 },
  { nickname: "The Captain", condition: (p) => p.careerStats.votes >= 80, priority: 66 },
  { nickname: "Brownlow Favorite", condition: (p) => p.careerStats.votes >= 60, priority: 63 },
  { nickname: "The Warrior", condition: (p) => p.careerStats.matches >= 150 && p.morale >= 80, priority: 62 },

  // POSITION-SPECIFIC (Priority 50-59)
  { nickname: "Big Man", condition: (p) => p.position === Position.RUCK && p.careerStats.matches >= 50, priority: 55 },
  { nickname: "The Guardian", condition: (p) => p.position === Position.DEFENDER && p.careerStats.tackles >= 200, priority: 56 },
  { nickname: "The Destroyer", condition: (p) => p.position === Position.DEFENDER && p.attributes.tackling >= 80, priority: 53 },
  { nickname: "The Powerhouse", condition: (p) => p.position === Position.RUCK && p.attributes.stamina >= 80, priority: 52 },

  // STREAK-BASED (Priority 60-69)
  { nickname: "Hot Streak", condition: (p) => (p.winStreak || 0) >= 8, priority: 64 },
  { nickname: "The Winner", condition: (p) => (p.winStreak || 0) >= 5, priority: 61 },
  { nickname: "Consistent", condition: (p) => (p.voteStreak || 0) >= 10, priority: 62 },

  // SPECIAL CIRCUMSTANCES (Priority 40-49)
  { nickname: "The Journeyman", condition: (p) => (p.clubsPlayed?.length || 0) >= 3, priority: 45 },
  { nickname: "One Club Legend", condition: (p) => p.careerStats.matches >= 100 && (p.clubsPlayed?.length || 0) === 1, priority: 48 },
  { nickname: "Fan Favorite", condition: (p) => p.morale >= 95, priority: 42 },
  { nickname: "The Comeback Kid", condition: (p) => p.age >= 32 && (p.winStreak || 0) >= 3, priority: 44 },

  // EARLY CAREER (Priority 30-39)
  { nickname: "The Prospect", condition: (p) => p.age <= 20 && p.careerStats.matches >= 10, priority: 35 },
  { nickname: "Rising Star", condition: (p) => p.age <= 22 && p.careerStats.matches >= 20, priority: 38 },
  { nickname: "Young Gun", condition: (p) => p.age <= 24 && p.careerStats.goals >= 30, priority: 36 },
  { nickname: "The Kid", condition: (p) => p.age <= 21, priority: 32 },

  // DEFAULT FALLBACKS (Priority 10-20)
  { nickname: "The Athlete", condition: (p) => Object.values(p.attributes).reduce((a, b) => a + b, 0) / 7 >= 70, priority: 20 },
  { nickname: "The Player", condition: (p) => p.careerStats.matches >= 25, priority: 15 },
  { nickname: "The Rookie", condition: (p) => p.careerStats.matches < 10, priority: 10 },
];

// Generate nickname based on player's current stats and playstyle
export const generateNickname = (player: PlayerProfile): string => {
  if (!player) return "The Player";

  // Find all matching nicknames
  const matchingNicknames = NICKNAME_RULES
    .filter(rule => rule.condition(player))
    .sort((a, b) => b.priority - a.priority);

  // Return highest priority nickname, or a default
  if (matchingNicknames.length > 0) {
    return matchingNicknames[0].nickname;
  }

  return "The Player";
};

// Get all possible nicknames for this player (for selection UI)
export const getEligibleNicknames = (player: PlayerProfile): { nickname: string; priority: number }[] => {
  return NICKNAME_RULES
    .filter(rule => rule.condition(player))
    .sort((a, b) => b.priority - a.priority)
    .map(rule => ({ nickname: rule.nickname, priority: rule.priority }));
};

// Fun nickname suggestions based on player name
export const getNameBasedNicknames = (playerName: string): string[] => {
  const firstName = playerName.split(' ')[0];
  const lastName = playerName.split(' ')[1] || '';

  const suggestions: string[] = [];

  // Abbreviations
  if (firstName.length >= 3 && lastName.length >= 3) {
    suggestions.push(firstName[0] + '. ' + lastName);
  }

  // First name variations
  if (firstName.length > 4) {
    suggestions.push(firstName.substring(0, 4));
  }

  // Last name variations
  if (lastName.length > 4) {
    suggestions.push(lastName);
    suggestions.push('The ' + lastName);
  }

  // Initials
  if (firstName && lastName) {
    suggestions.push(firstName[0] + lastName[0]);
  }

  return suggestions.filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
};

// Check if nickname should be updated (player achieved something new)
export const shouldUpdateNickname = (player: PlayerProfile): boolean => {
  const currentNickname = player.nickname || '';
  const newNickname = generateNickname(player);

  // Find priority of current and new nicknames
  const currentRule = NICKNAME_RULES.find(r => r.nickname === currentNickname);
  const newRule = NICKNAME_RULES.find(r => r.nickname === newNickname);

  // Update if new nickname has higher priority
  if (newRule && currentRule) {
    return newRule.priority > currentRule.priority;
  }

  // Update if no current nickname
  return !currentNickname || currentNickname === '';
};
