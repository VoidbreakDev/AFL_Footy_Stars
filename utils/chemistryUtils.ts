import {
  TeammateRelationship,
  TeamChemistry,
  RelationshipInteraction,
  Team,
  AIPlayer,
  PlayerProfile,
  ChemistryEvent
} from '../types';
import {
  PERSONALITY_TYPES,
  RELATIONSHIP_STATUS_THRESHOLDS,
  CHEMISTRY_FORM_THRESHOLDS,
  FIRST_NAMES,
  LAST_NAMES
} from '../constants';

/**
 * Initialize team chemistry system when joining a new team
 */
export const initializeTeamChemistry = (team: Team): {
  teammates: TeammateRelationship[];
  teamChemistry: TeamChemistry;
} => {
  // Convert AI players to teammate relationships
  const teammates: TeammateRelationship[] = team.players.map((aiPlayer: AIPlayer) => {
    const personality = PERSONALITY_TYPES[Math.floor(Math.random() * PERSONALITY_TYPES.length)];

    // Initialize relationship values (start relatively neutral)
    const baseChemistry = 40 + Math.floor(Math.random() * 20); // 40-60
    const baseFriendship = 35 + Math.floor(Math.random() * 20); // 35-55
    const baseTrust = 40 + Math.floor(Math.random() * 15); // 40-55
    const baseRespect = 45 + Math.floor(Math.random() * 20); // 45-65

    return {
      id: `teammate_${aiPlayer.name.replace(/\s/g, '_')}`,
      name: aiPlayer.name,
      position: aiPlayer.position,
      subPosition: aiPlayer.subPosition,
      rating: aiPlayer.rating,
      age: aiPlayer.age,
      chemistry: baseChemistry,
      friendship: baseFriendship,
      trust: baseTrust,
      respect: baseRespect,
      status: determineRelationshipStatus(baseFriendship),
      personality,
      matchesTogether: 0,
      assists: 0,
      youAssisted: 0,
      conflicts: 0,
      interactionHistory: []
    };
  });

  const teamChemistry: TeamChemistry = {
    overallChemistry: 50, // Start neutral
    morale: 60,
    cohesion: 50,
    leadership: 60,
    conflicts: [],
    recentForm: 'NEUTRAL',
    chemistryBonus: 0
  };

  return { teammates, teamChemistry };
};

/**
 * Determine relationship status based on friendship level
 */
export const determineRelationshipStatus = (
  friendship: number
): 'STRANGER' | 'ACQUAINTANCE' | 'FRIEND' | 'CLOSE_FRIEND' | 'BEST_MATE' | 'RIVAL' | 'ENEMY' => {
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.RIVAL) return 'ENEMY';
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.STRANGER) return 'RIVAL';
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.ACQUAINTANCE) return 'STRANGER';
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.FRIEND) return 'ACQUAINTANCE';
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.CLOSE_FRIEND) return 'FRIEND';
  if (friendship < RELATIONSHIP_STATUS_THRESHOLDS.BEST_MATE) return 'CLOSE_FRIEND';
  return 'BEST_MATE';
};

/**
 * Calculate overall team chemistry from all teammate relationships
 */
export const calculateOverallChemistry = (teammates: TeammateRelationship[]): number => {
  if (teammates.length === 0) return 50;

  const avgChemistry = teammates.reduce((sum, tm) => sum + tm.chemistry, 0) / teammates.length;
  return Math.round(avgChemistry);
};

/**
 * Calculate chemistry bonus for match performance
 */
export const calculateChemistryBonus = (teamChemistry: TeamChemistry): number => {
  const overall = teamChemistry.overallChemistry;

  // Map chemistry (0-100) to bonus (-20% to +20%)
  // 50 chemistry = 0% bonus (neutral)
  // 100 chemistry = +20% bonus
  // 0 chemistry = -20% bonus
  const bonus = ((overall - 50) / 50) * 20;
  return Math.max(-20, Math.min(20, bonus));
};

/**
 * Update team chemistry after a match result
 */
export const updateTeamChemistryAfterMatch = (
  teamChemistry: TeamChemistry,
  won: boolean,
  performanceRating: number // 0-10 scale
): TeamChemistry => {
  let moraleChange = 0;
  let cohesionChange = 0;

  // Win/loss impact
  if (won) {
    moraleChange += 5;
    cohesionChange += 3;
  } else {
    moraleChange -= 5;
    cohesionChange -= 2;
  }

  // Performance impact
  if (performanceRating >= 8) {
    moraleChange += 3;
    cohesionChange += 2;
  } else if (performanceRating <= 3) {
    moraleChange -= 3;
    cohesionChange -= 2;
  }

  const updatedMorale = Math.max(0, Math.min(100, teamChemistry.morale + moraleChange));
  const updatedCohesion = Math.max(0, Math.min(100, teamChemistry.cohesion + cohesionChange));

  // Update recent form
  const recentForm = determineRecentForm(updatedMorale);

  return {
    ...teamChemistry,
    morale: updatedMorale,
    cohesion: updatedCohesion,
    recentForm,
    chemistryBonus: calculateChemistryBonus({
      ...teamChemistry,
      overallChemistry: calculateOverallChemistry([]) // Will be calculated separately
    })
  };
};

/**
 * Determine team form based on morale
 */
const determineRecentForm = (morale: number): 'HOT' | 'WARM' | 'NEUTRAL' | 'COLD' | 'FREEZING' => {
  if (morale >= CHEMISTRY_FORM_THRESHOLDS.HOT) return 'HOT';
  if (morale >= CHEMISTRY_FORM_THRESHOLDS.WARM) return 'WARM';
  if (morale >= CHEMISTRY_FORM_THRESHOLDS.NEUTRAL) return 'NEUTRAL';
  if (morale >= CHEMISTRY_FORM_THRESHOLDS.COLD) return 'COLD';
  return 'FREEZING';
};

/**
 * Update individual teammate relationship
 */
export const updateTeammateRelationship = (
  teammate: TeammateRelationship,
  interaction: RelationshipInteraction
): TeammateRelationship => {
  const updatedChemistry = Math.max(0, Math.min(100, teammate.chemistry + interaction.chemistryChange));
  const updatedFriendship = Math.max(0, Math.min(100, teammate.friendship + interaction.friendshipChange));
  const updatedTrust = Math.max(0, Math.min(100, teammate.trust + (interaction.trustChange || 0)));
  const updatedRespect = Math.max(0, Math.min(100, teammate.respect + (interaction.respectChange || 0)));

  const updatedStatus = determineRelationshipStatus(updatedFriendship);

  const updatedHistory = [...(teammate.interactionHistory || []), interaction];

  // Track conflicts
  const conflicts = interaction.type === 'NEGATIVE' ? (teammate.conflicts || 0) + 1 : teammate.conflicts;

  return {
    ...teammate,
    chemistry: updatedChemistry,
    friendship: updatedFriendship,
    trust: updatedTrust,
    respect: updatedRespect,
    status: updatedStatus,
    lastInteraction: interaction,
    interactionHistory: updatedHistory,
    conflicts
  };
};

/**
 * Generate random teammate interaction after a match
 */
export const generateTeammateInteraction = (
  teammate: TeammateRelationship,
  playerPerformance: number, // 0-10 rating
  matchWon: boolean,
  round: number,
  year: number
): RelationshipInteraction | null => {
  // 30% chance of interaction per match
  if (Math.random() > 0.30) return null;

  let type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  let event: string;
  let chemistryChange: number;
  let friendshipChange: number;
  let trustChange: number = 0;
  let respectChange: number = 0;

  // Determine interaction type based on performance and result
  if (playerPerformance >= 7 && matchWon) {
    type = 'POSITIVE';
    event = `${teammate.name} congratulates you on a great performance!`;
    chemistryChange = 3 + Math.floor(Math.random() * 4); // 3-7
    friendshipChange = 2 + Math.floor(Math.random() * 3); // 2-5
    respectChange = 2;
  } else if (playerPerformance <= 3 && !matchWon) {
    type = 'NEGATIVE';
    event = `${teammate.name} seems disappointed with the team's performance.`;
    chemistryChange = -(2 + Math.floor(Math.random() * 3)); // -2 to -5
    friendshipChange = -(1 + Math.floor(Math.random() * 2)); // -1 to -3
  } else {
    type = 'NEUTRAL';
    event = `Brief chat with ${teammate.name} after the match.`;
    chemistryChange = Math.floor(Math.random() * 2); // 0-1
    friendshipChange = Math.floor(Math.random() * 2); // 0-1
  }

  return {
    type,
    event,
    round,
    year,
    chemistryChange,
    friendshipChange,
    trustChange,
    respectChange
  };
};

/**
 * Increment matches played together for all teammates
 */
export const incrementMatchesTogether = (teammates: TeammateRelationship[]): TeammateRelationship[] => {
  return teammates.map(tm => ({
    ...tm,
    matchesTogether: tm.matchesTogether + 1
  }));
};

/**
 * Record an assist from/to a teammate
 */
export const recordAssist = (
  teammates: TeammateRelationship[],
  teammateName: string,
  assistedYou: boolean
): TeammateRelationship[] => {
  return teammates.map(tm => {
    if (tm.name === teammateName) {
      return {
        ...tm,
        assists: assistedYou ? (tm.assists || 0) + 1 : tm.assists,
        youAssisted: !assistedYou ? (tm.youAssisted || 0) + 1 : tm.youAssisted,
        chemistry: Math.min(100, tm.chemistry + 2) // Small chemistry boost
      };
    }
    return tm;
  });
};

/**
 * Get the player's best mate (highest friendship)
 */
export const getBestMate = (teammates: TeammateRelationship[]): TeammateRelationship | null => {
  if (teammates.length === 0) return null;

  return teammates.reduce((best, current) =>
    current.friendship > best.friendship ? current : best
  );
};

/**
 * Get teammates with negative relationships
 */
export const getRivals = (teammates: TeammateRelationship[]): TeammateRelationship[] => {
  return teammates.filter(tm => tm.status === 'RIVAL' || tm.status === 'ENEMY');
};

/**
 * Get color for relationship status
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ENEMY: 'text-red-600',
    RIVAL: 'text-orange-500',
    STRANGER: 'text-gray-400',
    ACQUAINTANCE: 'text-blue-400',
    FRIEND: 'text-green-400',
    CLOSE_FRIEND: 'text-green-500',
    BEST_MATE: 'text-yellow-400'
  };
  return colors[status] || 'text-gray-400';
};

/**
 * Get color for team chemistry level
 */
export const getChemistryColor = (chemistry: number): string => {
  if (chemistry >= 80) return 'text-green-400';
  if (chemistry >= 60) return 'text-blue-400';
  if (chemistry >= 40) return 'text-yellow-400';
  if (chemistry >= 20) return 'text-orange-400';
  return 'text-red-400';
};

/**
 * Get personality icon
 */
export const getPersonalityIcon = (personality: string): string => {
  const icons: Record<string, string> = {
    LEADER: '👑',
    JOKER: '🤡',
    QUIET: '🤫',
    INTENSE: '🔥',
    SUPPORTIVE: '🤝',
    COMPETITIVE: '💪'
  };
  return icons[personality] || '👤';
};
