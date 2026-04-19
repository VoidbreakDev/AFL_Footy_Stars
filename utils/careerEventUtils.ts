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
    if (condition === 'HIGH_STATS' && player.skillPoints >= 20) return true;
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

  // XP is no longer used - converted to skill points instead
  // (XP was intended for a level system that was never implemented)

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
 * Generate a fan mail event if conditions are met (5000+ followers, no active fan mail)
 */
export const generateFanMailEvent = (player: PlayerProfile): CareerEvent | null => {
  if ((player.mediaReputation?.fanFollowers ?? 0) < 5000) return null;
  if (player.activeCareerEvents?.some(e => e.type === 'FAN_MAIL')) return null;

  const templates = CAREER_EVENT_TEMPLATES.filter(t => t.type === 'FAN_MAIL');
  if (!templates.length) return null;

  const template = templates[Math.floor(Math.random() * templates.length)];
  return {
    id: `${template.id ?? 'fan_mail'}_${Date.now()}`,
    type: template.type as CareerEvent['type'],
    category: template.category as CareerEvent['category'],
    title: template.title,
    description: template.description,
    icon: template.icon,
    rarity: template.rarity as CareerEvent['rarity'],
    round: 0,
    year: 0,
    choices: template.choices,
    resolved: false,
  };
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
  // XP removed - no longer used
  if (effects.skillPoints) previews.push(`+${effects.skillPoints} skill points`);
  if (effects.wallet) previews.push(`${effects.wallet > 0 ? '+' : ''}$${Math.abs(effects.wallet)}`);
  if (effects.mediaReputation) previews.push(`${effects.mediaReputation > 0 ? '+' : ''}${effects.mediaReputation} media rep`);
  if (effects.fanFollowers) previews.push(`${effects.fanFollowers > 0 ? '+' : ''}${Math.abs(effects.fanFollowers)} fans`);
  if (effects.injuryWeeks && effects.injuryWeeks > 0) previews.push(`${effects.injuryWeeks} week injury`);
  if (effects.injuryWeeks === 0) previews.push('Heal injury');

  return previews;
};

// ===== v1.3 NEW EVENT CATEGORIES =====

/**
 * COMMUNITY events — fan mail, school visits, charity events
 */
export const generateCommunityEvent = (player: PlayerProfile, round: number, year: number): CareerEvent | null => {
  const fanFollowers = player.mediaReputation?.fanFollowers || 0;
  if (fanFollowers < 1000) return null;

  const roll = Math.random();
  if (roll < 0.25) {
    return {
      id: `community-school-${round}-${year}-${Date.now()}`,
      type: 'COMMUNITY',
      category: 'CHOICE',
      title: 'School Visit Request',
      description: 'A local school has invited you to speak to students about health and footy. Will you attend?',
      round,
      year,
      icon: '🏫',
      rarity: 'COMMON',
      resolved: false,
      immediateEffects: { energy: -5, morale: 5, fanFollowers: 200 },
      choices: [
        { id: 'attend', label: 'Attend', description: 'Spend the afternoon inspiring young fans.', icon: '✅', effects: { morale: 5, fanFollowers: 300, resultText: 'The kids loved it! You signed autographs and answered questions.' }, risk: 'LOW' },
        { id: 'decline', label: 'Decline', description: 'Focus on training instead.', icon: '❌', effects: { energy: 5, resultText: 'Management appreciates the focus, but some fans are disappointed.' }, risk: 'LOW' },
      ]
    };
  } else if (roll < 0.5) {
    return {
      id: `community-charity-${round}-${year}-${Date.now()}`,
      type: 'COMMUNITY',
      category: 'CHOICE',
      title: 'Charity Match Invitation',
      description: 'A charity organization wants you to participate in a fundraising match. It costs time and money but boosts reputation.',
      round,
      year,
      icon: '💝',
      rarity: 'UNCOMMON',
      resolved: false,
      immediateEffects: { morale: 3 },
      choices: [
        { id: 'participate', label: 'Participate', description: 'Spend $2000 and 1 energy for a good cause.', icon: '💰', effects: { wallet: -2000, energy: -5, mediaReputation: 10, fanFollowers: 500, resultText: 'The charity match raised $50,000! You were the star attraction.' }, risk: 'LOW' },
        { id: 'donate', label: 'Donate Instead', description: 'Contribute $500 without attending.', icon: '🤝', effects: { wallet: -500, mediaReputation: 3, resultText: 'A modest donation. The charity thanks you publicly.' }, risk: 'LOW' },
        { id: 'decline_c', label: 'Decline', description: 'Not the right time.', icon: '❌', effects: { resultText: 'The charity understands, but some supporters are disappointed.' }, risk: 'MEDIUM' },
      ]
    };
  } else if (roll < 0.75) {
    return {
      id: `community-sponsor-${round}-${year}-${Date.now()}`,
      type: 'COMMUNITY',
      category: 'CHOICE',
      title: 'Sponsor Appearance Request',
      description: 'A major sponsor wants you at a corporate event. Good money, but it takes time away from training.',
      round,
      year,
      icon: '💼',
      rarity: 'UNCOMMON',
      resolved: false,
      immediateEffects: {},
      choices: [
        { id: 'attend_s', label: 'Attend', description: 'Earn $3000 but spend 2 energy.', icon: '💵', effects: { wallet: 3000, energy: -5, mediaReputation: -3, resultText: 'The sponsor was thrilled with your professionalism. Coach wasn\'t impressed.' }, risk: 'MEDIUM' },
        { id: 'delegate_s', label: 'Send Video Message', description: 'A compromise.', icon: '📹', effects: { wallet: 1000, resultText: 'A decent compromise. The sponsor accepts it for now.' }, risk: 'LOW' },
      ]
    };
  } else {
    return {
      id: `community-juniors-${round}-${year}-${Date.now()}`,
      type: 'COMMUNITY',
      category: 'CHOICE',
      title: 'Juniors Footy Clinic',
      description: 'Run a coaching clinic for young players. Low cost, high reward for morale and fans.',
      round,
      year,
      icon: '⚽',
      rarity: 'COMMON',
      resolved: false,
      immediateEffects: { energy: -3 },
      choices: [
        { id: 'run_clinic', label: 'Run the Clinic', description: 'Spend 3 energy for a memorable experience.', icon: '🏃', effects: { energy: -3, morale: 10, fanFollowers: 400, legacyImpact: 5, resultText: 'The kids were amazing! You showed them some drills and signed every jumper.' }, risk: 'LOW' },
        { id: 'skip_clinic', label: 'Skip', description: 'Too busy this week.', icon: '❌', effects: { energy: 3, resultText: 'The club sends an apology. The juniors are disappointed.' }, risk: 'LOW' },
      ]
    };
  }
};

/**
 * LOCKER_ROOM events — faction splits, star fallouts, newcomer welcomes
 */
export const generateLockerRoomEvent = (player: PlayerProfile, round: number, year: number, teammates: any[]): CareerEvent | null => {
  const chemistry = player.teamChemistry;
  if (!chemistry) return null;

  const roll = Math.random();

  if (chemistry.overallChemistry < 40 && roll < 0.3) {
    return {
      id: `locker-faction-${round}-${year}-${Date.now()}`,
      type: 'LOCKER_ROOM',
      category: 'CHOICE',
      title: 'Faction Split',
      description: 'Two groups are forming in the locker room. Veterans vs new recruits. You\'re caught in the middle.',
      round,
      year,
      icon: '💔',
      rarity: 'RARE',
      resolved: false,
      immediateEffects: { morale: -10 },
      choices: [
        { id: 'mediate', label: 'Mediate', description: 'Try to bring both sides together.', icon: '🤝', effects: { morale: 10, resultText: 'Your mediation skills impressed everyone. The room feels more united.' }, risk: 'MEDIUM' },
        { id: 'take_side', label: 'Take a Side', description: 'Side with the veterans who\'ve been loyal.', icon: '👥', effects: { morale: -5, resultText: 'You backed the veterans. The new boys aren\'t happy.' }, risk: 'HIGH' },
      ]
    };
  }

  if (roll < 0.25) {
    return {
      id: `locker-newcomer-${round}-${year}-${Date.now()}`,
      type: 'LOCKER_ROOM',
      category: 'CHOICE',
      title: 'Newcomer Welcome',
      description: 'A highly-touted draftee has joined the club. How do you welcome them?',
      round,
      year,
      icon: '🌟',
      rarity: 'COMMON',
      resolved: false,
      immediateEffects: {},
      choices: [
        { id: 'mentor', label: 'Take Them Under Your Wing', description: 'Become their unofficial mentor.', icon: '👑', effects: { morale: 5, resultText: 'The kid looks up to you now. They\'re working hard to follow your example.' }, risk: 'LOW' },
        { id: 'challenge', label: 'Challenge Them', description: 'Push them to earn their spot.', icon: '💪', effects: { resultText: 'Tough love. The kid might struggle but they\'ll grow from it.' }, risk: 'MEDIUM' },
        { id: 'ignore_n', label: 'Leave Them Alone', description: 'Let them find their own way.', icon: '👋', effects: { resultText: 'They\'ll figure it out. Some players thrive on their own.' }, risk: 'LOW' },
      ]
    };
  }

  if (roll < 0.45) {
    return {
      id: `locker-celebration-${round}-${year}-${Date.now()}`,
      type: 'LOCKER_ROOM',
      category: 'POSITIVE',
      title: 'Celebration Moment',
      description: 'After a huge win, the locker room is buzzing. Everyone\'s in great spirits.',
      round,
      year,
      icon: '🎉',
      rarity: 'COMMON',
      resolved: false,
      immediateEffects: { morale: 10 }
    };
  }

  return null;
};

/**
 * LEGACY_MOMENT events — match milestones, premierships, awards
 */
export const generateLegacyMoment = (player: PlayerProfile, round: number, year: number): CareerEvent | null => {
  const matches = player.careerStats?.matches || 0;
  const premierships = player.careerStats?.premierships || 0;

  if (matches === 100) {
    return {
      id: `legacy-100-${round}-${year}-${Date.now()}`,
      type: 'LEGACY_MOMENT',
      category: 'POSITIVE',
      title: 'A Century of Service',
      description: '100 games. The club has organized a ceremony. Former teammates, coaches, and fans are all here to celebrate.',
      round,
      year,
      icon: '💯',
      rarity: 'LEGENDARY',
      resolved: false,
      immediateEffects: { morale: 20, fanFollowers: 1000, legacyImpact: 15 }
    };
  }

  if (matches === 200) {
    return {
      id: `legacy-200-${round}-${year}-${Date.now()}`,
      type: 'LEGACY_MOMENT',
      category: 'POSITIVE',
      title: 'Two Hundred Reasons',
      description: 'A career-defining milestone. Full tribute round. Media coverage guaranteed. Your place in club history is secure.',
      round,
      year,
      icon: '🏟️',
      rarity: 'LEGENDARY',
      resolved: false,
      immediateEffects: { morale: 30, fanFollowers: 2000, legacyImpact: 30, mediaReputation: 15 }
    };
  }

  if (premierships === 1 && !player.seasonStats?.awards?.includes('First Premiership')) {
    return {
      id: `legacy-premiership-${round}-${year}-${Date.now()}`,
      type: 'LEGACY_MOMENT',
      category: 'CHOICE',
      title: 'The Flag',
      description: 'You\'ve won your first premiership. The更衣室 is electric. How do you handle the moment?',
      round,
      year,
      icon: '🏆',
      rarity: 'LEGENDARY',
      resolved: false,
      immediateEffects: { morale: 30 },
      choices: [
        { id: 'celebrate_quietly', label: 'Celebrate Quietly', description: 'Let the moment sink in. Hug your teammates.', icon: '🤗', effects: { morale: 10, legacyImpact: 10, resultText: 'A quiet moment of pure joy. You\'ll carry this forever.' }, risk: 'LOW' },
        { id: 'celebrate_publicly', label: 'Go Big', description: 'Grab the mic. Tell the crowd what it means.', icon: '🎤', effects: { fanFollowers: 2000, legacyImpact: 15, mediaReputation: 5, resultText: 'Your speech went viral. The club loves it.' }, risk: 'LOW' },
      ]
    };
  }

  return null;
};

/**
 * FAN MAIL system — fires every 2-3 rounds once fans > 1000
 */
export const generateFanMail = (player: PlayerProfile, round: number, year: number): CareerEvent | null => {
  const fanFollowers = player.mediaReputation?.fanFollowers || 0;
  if (fanFollowers < 1000) return null;
  if (round % 3 !== 0) return null; // Every 3 rounds

  const types = ['ENCOURAGEMENT', 'CRITICISM', 'CHALLENGE', 'HEARTFELT', 'FUNNY', 'WEIRD'] as const;
  const type = types[Math.floor(Math.random() * types.length)];

  const messages: Record<string, string[]> = {
    ENCOURAGEMENT: ['Keep going! You\'re my hero!', 'Watching you play makes my day!', 'Best player in the league!'],
    CRITICISM: ['You\'re overpaid and underperforming.', 'My 8-year-old could do better.', 'The media is too soft on you.'],
    CHALLENGE: ['Bet you can\'t kick 5 this week!', 'I\'ll donate $100 if you lay 8 tackles.', 'Prove the critics wrong!'],
    HEARTFELT: ['Your story inspires my recovery. Thank you.', 'I named my son after you. No pressure.', 'You helped me through a tough time.'],
    FUNNY: ['If you were a sausage, you\'d be a footy sausage.', 'My dog plays better defense. Love ya!', 'Are you a magician? Because every game you magic the crowd!'],
    WEIRD: ['Please marry my sister. She has your poster on the wall.', 'I dreamt you scored 10 goals last night. Make it real!', 'Can you send me your boots? I\'ll pay in kangaroo meat.'],
  };

  const msgList = messages[type] || messages.ENCOURAGEMENT;
  const message = msgList[Math.floor(Math.random() * msgList.length)];

  return {
    id: `fanmail-${round}-${year}-${Date.now()}`,
    type: 'FAN_MAIL',
    category: 'CHOICE',
    title: `Fan Mail: ${type}`,
    description: message,
    round,
    year,
    icon: type === 'HEARTFELT' ? '💌' : type === 'CRITICISM' ? '😤' : type === 'FUNNY' ? '😂' : '📬',
    rarity: type === 'HEARTFELT' ? 'RARE' : 'COMMON',
    resolved: false,
    choices: [
      { id: 'reply_kindly', label: 'Reply Kindly', description: 'Take the time to respond personally.', icon: '💬', effects: { fanFollowers: 100, morale: 3, resultText: 'The fan was thrilled to hear from you!' }, risk: 'LOW' },
      { id: 'share_publicly', label: 'Share Publicly', description: 'Post it on social media for your fans.', icon: '📱', effects: { fanFollowers: 300, mediaReputation: -2, resultText: 'The post went viral. Great engagement!' }, risk: 'MEDIUM' },
      { id: 'ignore_f', label: 'Ignore', description: 'Can\'t respond to every message.', icon: '🤷', effects: { resultText: 'You moved on. Some fans understand, others don\'t.' }, risk: 'LOW' },
    ]
  };
};

/**
 * Generate season biography paragraph for the player
 */
export const generateSeasonBioParagraph = (
  player: PlayerProfile,
  seasonHistory: any,
  year: number
): string => {
  const stats = seasonHistory?.stats || player.seasonStats;
  const matches = stats?.matches || 0;
  const goals = stats?.goals || 0;
  const disposals = stats?.disposals || 0;

  const avgDisposals = matches > 0 ? (disposals / matches).toFixed(1) : '0';
  const tier = player.contract?.tier || 'Unknown';

  // Template-based generation (Gemini fallback would be handled in UI layer)
  let paragraph = `In season ${year}, ${player.name} played ${matches} games for ${player.contract?.clubName || 'the club'} in the ${tier}. `;

  if (goals > 10) {
    paragraph += `A productive year in front of goal with ${goals} majors. `;
  }
  if (avgDisposals && parseFloat(avgDisposals) > 20) {
    paragraph += `Consistently influential with an average of ${avgDisposals} disposals per game. `;
  }
  if (seasonHistory?.promoted) {
    paragraph += 'The highlight was earning promotion to a higher league. ';
  }
  if (seasonHistory?.premiership) {
    paragraph += 'Capped off a fairy-tale season with a premiership. ';
  }
  if (seasonHistory?.relegated) {
    paragraph += 'A challenging year that ended in relegation. ';
  }

  return paragraph;
};
