import { DailyReward } from '../types';

// Daily reward tiers based on streak
export const DAILY_REWARDS = [
  { day: 1, skillPoints: 1, energy: 10, description: 'Welcome back!' },
  { day: 2, skillPoints: 1, energy: 15, description: 'Keep it up!' },
  { day: 3, skillPoints: 2, energy: 20, description: 'On a roll!' },
  { day: 4, skillPoints: 2, energy: 25, description: 'Consistency!' },
  { day: 5, skillPoints: 3, energy: 30, description: 'Dedicated!' },
  { day: 6, skillPoints: 3, energy: 35, description: 'Almost there!' },
  { day: 7, skillPoints: 5, energy: 50, description: 'Weekly Bonus!' }, // Big reward
  { day: 8, skillPoints: 2, energy: 20, description: 'Keep going!' },
  { day: 9, skillPoints: 2, energy: 20, description: 'Staying strong!' },
  { day: 10, skillPoints: 3, energy: 30, description: 'Double digits!' },
  { day: 11, skillPoints: 3, energy: 30, description: 'Unstoppable!' },
  { day: 12, skillPoints: 3, energy: 30, description: 'Legendary streak!' },
  { day: 13, skillPoints: 4, energy: 35, description: 'Amazing!' },
  { day: 14, skillPoints: 7, energy: 75, description: '2 Week Bonus!' }, // Mega reward
];

// Calculate if user can claim reward today
export const canClaimDailyReward = (dailyRewards?: DailyReward): boolean => {
  if (!dailyRewards || !dailyRewards.lastClaimDate) return true;

  const lastClaim = new Date(dailyRewards.lastClaimDate);
  const today = new Date();

  // Reset time to start of day for comparison
  lastClaim.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Can claim if last claim was yesterday or earlier
  return today.getTime() > lastClaim.getTime();
};

// Check if streak should be maintained or broken
export const calculateNewStreak = (dailyRewards?: DailyReward): number => {
  if (!dailyRewards || !dailyRewards.lastClaimDate) return 1;

  const lastClaim = new Date(dailyRewards.lastClaimDate);
  const today = new Date();

  // Reset time to start of day
  lastClaim.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day - continue streak
    return dailyRewards.streak + 1;
  } else if (daysDiff > 1) {
    // Missed a day - reset streak
    return 1;
  }

  // Same day (shouldn't happen if canClaimDailyReward is checked first)
  return dailyRewards.streak;
};

// Get reward for current streak day
export const getDailyRewardForStreak = (streak: number) => {
  // Loop rewards after day 14
  const effectiveDay = ((streak - 1) % 14) + 1;
  return DAILY_REWARDS.find(r => r.day === effectiveDay) || DAILY_REWARDS[0];
};

// Claim the daily reward
export const claimDailyReward = (currentRewards?: DailyReward) => {
  const newStreak = calculateNewStreak(currentRewards);
  const reward = getDailyRewardForStreak(newStreak);

  const updatedRewards: DailyReward = {
    lastClaimDate: new Date().toISOString(),
    streak: newStreak,
    totalLogins: (currentRewards?.totalLogins || 0) + 1
  };

  return {
    updatedRewards,
    reward: {
      ...reward,
      streak: newStreak
    }
  };
};
