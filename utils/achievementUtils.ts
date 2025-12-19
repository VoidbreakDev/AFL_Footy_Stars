import { PlayerProfile, UnlockedAchievement, MatchResult } from '../types';
import { ACHIEVEMENTS, Achievement } from '../constants';

// Check if player has unlocked a specific achievement
export const hasAchievement = (player: PlayerProfile, achievementId: string): boolean => {
  return player.achievements?.some(a => a.achievementId === achievementId) || false;
};

// Check all achievements and return newly unlocked ones
export const checkAchievements = (
  player: PlayerProfile,
  currentRound: number,
  currentSeason: number = 1,
  lastMatchResult?: MatchResult
): UnlockedAchievement[] => {
  const newlyUnlocked: UnlockedAchievement[] = [];
  const stats = player.careerStats;
  const attrs = player.attributes;

  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already unlocked
    if (hasAchievement(player, achievement.id)) return;

    let unlocked = false;

    // Check requirements based on achievement type
    switch (achievement.id) {
      // Career matches
      case 'first_game':
        unlocked = stats.matches >= 1;
        break;
      case 'veteran_50':
        unlocked = stats.matches >= 50;
        break;
      case 'veteran_100':
        unlocked = stats.matches >= 100;
        break;
      case 'veteran_200':
        unlocked = stats.matches >= 200;
        break;
      case 'veteran_300':
        unlocked = stats.matches >= 300;
        break;

      // Goals
      case 'first_goal':
        unlocked = stats.goals >= 1;
        break;
      case 'goals_50':
        unlocked = stats.goals >= 50;
        break;
      case 'goals_100':
        unlocked = stats.goals >= 100;
        break;
      case 'goals_300':
        unlocked = stats.goals >= 300;
        break;
      case 'goals_500':
        unlocked = stats.goals >= 500;
        break;

      // Single match goals
      case 'bag_5':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.goals >= 5 : false;
        break;
      case 'bag_10':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.goals >= 10 : false;
        break;

      // Disposals
      case 'disposals_1000':
        unlocked = stats.disposals >= 1000;
        break;
      case 'disposals_5000':
        unlocked = stats.disposals >= 5000;
        break;
      case 'disposal_king':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.disposals >= 30 : false;
        break;
      case 'disposal_40':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.disposals >= 40 : false;
        break;

      // Tackles
      case 'tackles_500':
        unlocked = stats.tackles >= 500;
        break;
      case 'tackle_machine':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.tackles >= 10 : false;
        break;

      // Votes
      case 'best_on_ground':
        unlocked = lastMatchResult ? lastMatchResult.playerStats.votes >= 3 : false;
        break;
      case 'brownlow_50':
        unlocked = stats.votes >= 50;
        break;
      case 'brownlow_winner':
        unlocked = player.seasonStats.votes >= 100;
        break;

      // Attributes
      case 'maxed_attribute':
        unlocked = Math.max(...Object.values(attrs)) >= 99;
        break;
      case 'all_80':
        unlocked = Math.min(...Object.values(attrs)) >= 80;
        break;
      case 'potential_unlocked':
        unlocked = Object.values(attrs).some(val => val >= player.potential);
        break;
      case 'speed_demon':
        unlocked = attrs.speed >= 90;
        break;
      case 'boot_perfect':
        unlocked = attrs.kicking >= 90;
        break;
      case 'marking_king':
        unlocked = attrs.marking >= 90;
        break;

      // Skill points
      case 'fast_learner':
        unlocked = (player.totalSkillPointsEarned || 0) >= 100;
        break;

      // Training
      case 'gym_rat':
        unlocked = (player.trainingSessions || 0) >= 50;
        break;

      // Special
      case 'rivalry_born':
        unlocked = (player.rivalries?.length || 0) >= 1;
        break;
      case 'grand_final_hero':
        unlocked = stats.premierships >= 1;
        break;
      case 'dynasty':
        unlocked = stats.premierships >= 3;
        break;
      case 'hall_of_fame':
        unlocked = player.isRetired === true;
        break;
      case 'perfectionist':
        unlocked = Object.values(attrs).every(val => val >= 99);
        break;
      case 'triple_crown':
        unlocked = stats.goals >= 1000 && stats.disposals >= 10000 && stats.tackles >= 1000;
        break;

      // Contract
      case 'big_money':
        unlocked = player.contract.salary >= 1000;
        break;
      case 'journeyman':
        unlocked = (player.clubsPlayed?.length || 0) >= 3;
        break;

      // Streaks
      case 'win_streak_5':
        unlocked = (player.winStreak || 0) >= 5;
        break;
      case 'win_streak_10':
        unlocked = (player.winStreak || 0) >= 10;
        break;
      case 'injury_warrior':
        unlocked = (player.injuryFreeStreak || 0) >= 50;
        break;
      case 'high_morale':
        unlocked = (player.highMoraleStreak || 0) >= 10;
        break;
      case 'mr_consistent':
        unlocked = (player.voteStreak || 0) >= 20;
        break;

      // Position-specific (simplified for now)
      case 'ruck_dominance':
        unlocked = player.position === 'Ruck' && stats.matches >= 50;
        break;
    }

    if (unlocked) {
      newlyUnlocked.push({
        achievementId: achievement.id,
        unlockedAt: new Date(),
        round: currentRound,
        season: currentSeason
      });
    }
  });

  return newlyUnlocked;
};

// Get achievement progress for display
export const getAchievementProgress = (player: PlayerProfile, achievementId: string): { current: number; target: number; percentage: number } | null => {
  const stats = player.careerStats;
  const attrs = player.attributes;

  const progressMap: Record<string, { current: number; target: number }> = {
    veteran_50: { current: stats.matches, target: 50 },
    veteran_100: { current: stats.matches, target: 100 },
    veteran_200: { current: stats.matches, target: 200 },
    veteran_300: { current: stats.matches, target: 300 },
    goals_50: { current: stats.goals, target: 50 },
    goals_100: { current: stats.goals, target: 100 },
    goals_300: { current: stats.goals, target: 300 },
    goals_500: { current: stats.goals, target: 500 },
    disposals_1000: { current: stats.disposals, target: 1000 },
    disposals_5000: { current: stats.disposals, target: 5000 },
    tackles_500: { current: stats.tackles, target: 500 },
    brownlow_50: { current: stats.votes, target: 50 },
    fast_learner: { current: player.totalSkillPointsEarned || 0, target: 100 },
    gym_rat: { current: player.trainingSessions || 0, target: 50 },
    speed_demon: { current: attrs.speed, target: 90 },
    boot_perfect: { current: attrs.kicking, target: 90 },
    marking_king: { current: attrs.marking, target: 90 },
  };

  const progress = progressMap[achievementId];
  if (!progress) return null;

  return {
    ...progress,
    percentage: Math.min(100, (progress.current / progress.target) * 100)
  };
};

// Get rarity color for UI
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'COMMON': return 'text-slate-400 border-slate-600';
    case 'RARE': return 'text-blue-400 border-blue-600';
    case 'EPIC': return 'text-purple-400 border-purple-600';
    case 'LEGENDARY': return 'text-yellow-400 border-yellow-600';
  }
};
