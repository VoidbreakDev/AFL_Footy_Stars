import {
  PlayerProfile,
  CareerEvent,
  CareerEventEffect,
  CareerEventHistory,
  PlayerAttributes
} from '../types';
import { CAREER_EVENT_TEMPLATES, CareerEventTemplate } from '../constants';

/**
 * Generate a random career event for the player based on current game state
 */
export const generateCareerEvent = (
  player: PlayerProfile,
  currentRound: number,
  currentYear: number,
  recentMatchWon?: boolean
): CareerEvent | null => {
  // Don't generate events too frequently (20% chance per round)
  if (Math.random() > 0.20) {
    return null;
  }

  // Filter eligible events based on trigger conditions
  const eligibleEvents = CAREER_EVENT_TEMPLATES.filter(template => {
    if (!template.triggerCondition) return true; // No condition = always eligible

    const condition = template.triggerCondition;

    // Check various trigger conditions
    if (condition === 'WIN_STREAK_3' && (player.winStreak || 0) >= 3) return true;
    if (condition === 'WIN_STREAK_5' && (player.winStreak || 0) >= 5) return true;
    if (condition === 'LOW_MORALE' && player.morale < 30) return true;
    if (condition === 'LOW_ENERGY' && player.energy < 30) return true;
    if (condition === 'HIGH_MEDIA_REP' && (player.mediaReputation?.score || 0) >= 70) return true;
    if (condition === 'GOOD_FORM' && player.morale > 70 && player.energy > 60) return true;
    if (condition === 'AFTER_LOSS' && recentMatchWon === false) return true;
    if (condition === 'HIGH_STATS' && player.level >= 20) return true;
    if (condition === 'INJURY_PRONE' && (player.injury !== null)) return true;
    if (condition === 'FIRST_SEASON' && (player.currentYear || 1) === 1) return true;

    return false;
  });

  if (eligibleEvents.length === 0) return null;

  // Weight events by rarity (rarer events are less likely to occur)
  const rarityWeights: Record<string, number> = {
    COMMON: 50,
    UNCOMMON: 25,
    RARE: 15,
    EPIC: 7,
    LEGENDARY: 3
  };

  // Calculate weighted random selection
  const totalWeight = eligibleEvents.reduce((sum, event) => sum + rarityWeights[event.rarity], 0);
  let random = Math.random() * totalWeight;

  let selectedTemplate: CareerEventTemplate | null = null;
  for (const event of eligibleEvents) {
    random -= rarityWeights[event.rarity];
    if (random <= 0) {
      selectedTemplate = event;
      break;
    }
  }

  if (!selectedTemplate) return null;

  // Convert template to actual event
  const event: CareerEvent = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: selectedTemplate.type,
    category: selectedTemplate.category,
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    icon: selectedTemplate.icon,
    rarity: selectedTemplate.rarity,
    round: currentRound,
    year: currentYear,
    immediateEffects: selectedTemplate.immediateEffects,
    choices: selectedTemplate.choices,
    resolved: selectedTemplate.category !== 'CHOICE', // Auto-resolve non-choice events
    triggerCondition: selectedTemplate.triggerCondition
  };

  return event;
};

/**
 * Apply career event effects to the player
 */
export const applyCareerEventEffects = (
  player: PlayerProfile,
  effects: CareerEventEffect
): PlayerProfile => {
  let updatedPlayer = { ...player };

  // Apply attribute changes
  if (effects.attributeChanges) {
    const updatedAttributes = { ...updatedPlayer.attributes };
    Object.entries(effects.attributeChanges).forEach(([attr, change]) => {
      const attrKey = attr as keyof PlayerAttributes;
      const currentValue = updatedAttributes[attrKey];
      const newValue = Math.max(0, Math.min(99, currentValue + change));
      updatedAttributes[attrKey] = newValue;
    });
    updatedPlayer.attributes = updatedAttributes;
  }

  // Apply morale change
  if (effects.morale !== undefined) {
    updatedPlayer.morale = Math.max(0, Math.min(100, updatedPlayer.morale + effects.morale));
  }

  // Apply energy change
  if (effects.energy !== undefined) {
    updatedPlayer.energy = Math.max(0, Math.min(100, updatedPlayer.energy + effects.energy));
  }

  // Apply XP bonus
  if (effects.xp !== undefined) {
    updatedPlayer.xp += effects.xp;
  }

  // Apply skill points
  if (effects.skillPoints !== undefined) {
    updatedPlayer.skillPoints += effects.skillPoints;
  }

  // Apply wallet change
  if (effects.wallet !== undefined) {
    updatedPlayer.wallet = Math.max(0, (updatedPlayer.wallet || 0) + effects.wallet);
  }

  // Apply media reputation change
  if (effects.mediaReputation !== undefined && updatedPlayer.mediaReputation) {
    const newScore = Math.max(0, Math.min(100, updatedPlayer.mediaReputation.score + effects.mediaReputation));
    updatedPlayer.mediaReputation = {
      ...updatedPlayer.mediaReputation,
      score: newScore,
      tier: getMediaReputationTier(newScore)
    };
  }

  // Apply fan followers change
  if (effects.fanFollowers !== undefined && updatedPlayer.mediaReputation) {
    updatedPlayer.mediaReputation = {
      ...updatedPlayer.mediaReputation,
      fanFollowers: Math.max(0, updatedPlayer.mediaReputation.fanFollowers + effects.fanFollowers)
    };
  }

  // Apply injury
  if (effects.injuryWeeks !== undefined) {
    if (effects.injuryWeeks === 0) {
      // Heal injury
      updatedPlayer.injury = null;
    } else if (effects.injuryWeeks > 0) {
      // Add/extend injury
      updatedPlayer.injury = {
        name: 'Event-related injury',
        weeksRemaining: effects.injuryWeeks
      };
    }
  }

  // Apply contract salary bonus
  if (effects.contractSalaryBonus !== undefined) {
    const bonusMultiplier = 1 + (effects.contractSalaryBonus / 100);
    updatedPlayer.contract = {
      ...updatedPlayer.contract,
      salary: Math.floor(updatedPlayer.contract.salary * bonusMultiplier)
    };
  }

  // Add rivalry
  if (effects.addRivalry) {
    updatedPlayer.rivalries = [...updatedPlayer.rivalries, effects.addRivalry];
  }

  // Unlock achievement
  if (effects.unlockAchievement) {
    const achievements = updatedPlayer.achievements || [];
    const alreadyUnlocked = achievements.some(a => a.achievementId === effects.unlockAchievement);
    if (!alreadyUnlocked) {
      updatedPlayer.achievements = [
        ...achievements,
        {
          achievementId: effects.unlockAchievement,
          unlockedAt: new Date(),
          round: updatedPlayer.careerStats.matches,
          season: updatedPlayer.currentYear || 1
        }
      ];
    }
  }

  return updatedPlayer;
};

/**
 * Helper function to determine media reputation tier
 */
const getMediaReputationTier = (score: number): 'UNKNOWN' | 'CONTROVERSIAL' | 'DECENT' | 'POPULAR' | 'SUPERSTAR' | 'LEGEND' => {
  if (score < 10) return 'UNKNOWN';
  if (score < 30) return 'CONTROVERSIAL';
  if (score < 50) return 'DECENT';
  if (score < 75) return 'POPULAR';
  if (score < 90) return 'SUPERSTAR';
  return 'LEGEND';
};

/**
 * Resolve a choice-based career event
 */
export const resolveCareerEventChoice = (
  player: PlayerProfile,
  event: CareerEvent,
  choiceId: string
): { updatedPlayer: PlayerProfile; updatedEvent: CareerEvent; history: CareerEventHistory } => {
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) {
    throw new Error('Invalid choice ID');
  }

  // Apply effects from the choice
  const updatedPlayer = applyCareerEventEffects(player, choice.effects);

  // Mark event as resolved
  const updatedEvent: CareerEvent = {
    ...event,
    choiceMade: choiceId,
    resolved: true
  };

  // Create history entry
  const history: CareerEventHistory = {
    eventId: event.id,
    title: event.title,
    round: event.round,
    year: event.year,
    choiceMade: choice.label,
    outcome: choice.effects.resultText || 'Event resolved',
    icon: event.icon
  };

  return { updatedPlayer, updatedEvent, history };
};

/**
 * Resolve a non-choice career event
 */
export const resolveCareerEvent = (
  player: PlayerProfile,
  event: CareerEvent
): { updatedPlayer: PlayerProfile; history: CareerEventHistory } => {
  if (!event.immediateEffects) {
    throw new Error('Event has no immediate effects');
  }

  // Apply effects
  const updatedPlayer = applyCareerEventEffects(player, event.immediateEffects);

  // Create history entry
  const history: CareerEventHistory = {
    eventId: event.id,
    title: event.title,
    round: event.round,
    year: event.year,
    outcome: event.immediateEffects.resultText || 'Event occurred',
    icon: event.icon
  };

  return { updatedPlayer, history };
};

/**
 * Check if player has too many active events (prevent event spam)
 */
export const canGenerateNewEvent = (player: PlayerProfile): boolean => {
  const activeEvents = player.activeCareerEvents || [];
  return activeEvents.length < 3; // Max 3 pending events at once
};

/**
 * Get rarity color for UI display
 */
export const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    COMMON: 'text-gray-400',
    UNCOMMON: 'text-green-400',
    RARE: 'text-blue-400',
    EPIC: 'text-purple-400',
    LEGENDARY: 'text-yellow-400'
  };
  return colors[rarity] || 'text-gray-400';
};

/**
 * Get risk color for UI display
 */
export const getRiskColor = (risk?: string): string => {
  if (!risk) return 'text-gray-400';
  const colors: Record<string, string> = {
    LOW: 'text-green-400',
    MEDIUM: 'text-yellow-400',
    HIGH: 'text-red-400'
  };
  return colors[risk] || 'text-gray-400';
};

/**
 * Format effects for display
 */
export const formatEffectPreview = (effects: CareerEventEffect): string[] => {
  const previews: string[] = [];

  if (effects.attributeChanges) {
    Object.entries(effects.attributeChanges).forEach(([attr, change]) => {
      const sign = change > 0 ? '+' : '';
      previews.push(`${sign}${change} ${attr}`);
    });
  }

  if (effects.morale) previews.push(`${effects.morale > 0 ? '+' : ''}${effects.morale} morale`);
  if (effects.energy) previews.push(`${effects.energy > 0 ? '+' : ''}${effects.energy} energy`);
  if (effects.xp) previews.push(`+${effects.xp} XP`);
  if (effects.skillPoints) previews.push(`+${effects.skillPoints} skill points`);
  if (effects.wallet) previews.push(`${effects.wallet > 0 ? '+' : ''}$${Math.abs(effects.wallet)}`);
  if (effects.mediaReputation) previews.push(`${effects.mediaReputation > 0 ? '+' : ''}${effects.mediaReputation} media rep`);
  if (effects.fanFollowers) previews.push(`${effects.fanFollowers > 0 ? '+' : ''}${Math.abs(effects.fanFollowers)} fans`);
  if (effects.injuryWeeks && effects.injuryWeeks > 0) previews.push(`${effects.injuryWeeks} week injury`);
  if (effects.injuryWeeks === 0) previews.push('Heal injury');

  return previews;
};
