import { PlayerProfile, MasterSkill, UnlockedMasterSkill } from '../types';
import { MASTER_SKILLS } from '../constants';

/**
 * Check if a player can unlock a specific master skill
 */
export const canUnlockMasterSkill = (
  player: PlayerProfile,
  skillId: string
): { canUnlock: boolean; reason?: string } => {
  const skill = MASTER_SKILLS.find(s => s.id === skillId);

  if (!skill) {
    return { canUnlock: false, reason: 'Skill not found' };
  }

  // Check if already unlocked
  const alreadyUnlocked = player.masterSkills?.some(s => s.skillId === skillId);
  if (alreadyUnlocked) {
    return { canUnlock: false, reason: 'Already unlocked' };
  }

  // Check attribute level requirement
  const currentAttributeLevel = player.attributes[skill.category];
  if (currentAttributeLevel < skill.prerequisiteLevel) {
    return {
      canUnlock: false,
      reason: `Requires ${skill.category} level ${skill.prerequisiteLevel} (currently ${currentAttributeLevel})`
    };
  }

  // Check XP requirement
  if (player.xp < skill.xpCost) {
    return {
      canUnlock: false,
      reason: `Requires ${skill.xpCost} XP (you have ${player.xp})`
    };
  }

  // Check SP requirement
  if (player.skillPoints < skill.spCost) {
    return {
      canUnlock: false,
      reason: `Requires ${skill.spCost} SP (you have ${player.skillPoints})`
    };
  }

  return { canUnlock: true };
};

/**
 * Unlock a master skill for the player
 */
export const unlockMasterSkill = (
  player: PlayerProfile,
  skillId: string,
  currentRound: number
): PlayerProfile => {
  const skill = MASTER_SKILLS.find(s => s.id === skillId);

  if (!skill) {
    throw new Error('Skill not found');
  }

  const checkResult = canUnlockMasterSkill(player, skillId);
  if (!checkResult.canUnlock) {
    throw new Error(checkResult.reason || 'Cannot unlock skill');
  }

  // Deduct costs
  const updatedPlayer: PlayerProfile = {
    ...player,
    xp: player.xp - skill.xpCost,
    skillPoints: player.skillPoints - skill.spCost,
    masterSkills: [
      ...(player.masterSkills || []),
      {
        skillId,
        unlockRound: currentRound,
        unlockYear: player.currentYear || 1
      }
    ]
  };

  return updatedPlayer;
};

/**
 * Get all master skills available for a specific attribute
 */
export const getMasterSkillsByAttribute = (attribute: string): MasterSkill[] => {
  return MASTER_SKILLS.filter(skill => skill.category === attribute);
};

/**
 * Get all unlocked master skills for a player
 */
export const getUnlockedMasterSkills = (player: PlayerProfile): MasterSkill[] => {
  if (!player.masterSkills || player.masterSkills.length === 0) {
    return [];
  }

  return player.masterSkills
    .map(unlocked => MASTER_SKILLS.find(skill => skill.id === unlocked.skillId))
    .filter(skill => skill !== undefined) as MasterSkill[];
};

/**
 * Check if player has unlocked a specific skill
 */
export const hasMasterSkill = (player: PlayerProfile, skillId: string): boolean => {
  return player.masterSkills?.some(s => s.skillId === skillId) || false;
};

/**
 * Get master skill unlock status for display
 */
export const getMasterSkillStatus = (
  player: PlayerProfile,
  skill: MasterSkill
): {
  unlocked: boolean;
  canUnlock: boolean;
  attributeReady: boolean;
  xpReady: boolean;
  spReady: boolean;
  reason?: string;
} => {
  const unlocked = hasMasterSkill(player, skill.id);

  if (unlocked) {
    return {
      unlocked: true,
      canUnlock: false,
      attributeReady: true,
      xpReady: true,
      spReady: true
    };
  }

  const attributeLevel = player.attributes[skill.category];
  const attributeReady = attributeLevel >= skill.prerequisiteLevel;
  const xpReady = player.xp >= skill.xpCost;
  const spReady = player.skillPoints >= skill.spCost;

  const checkResult = canUnlockMasterSkill(player, skill.id);

  return {
    unlocked: false,
    canUnlock: checkResult.canUnlock,
    attributeReady,
    xpReady,
    spReady,
    reason: checkResult.reason
  };
};

/**
 * Get all available skills (can unlock right now)
 */
export const getAvailableMasterSkills = (player: PlayerProfile): MasterSkill[] => {
  return MASTER_SKILLS.filter(skill => {
    const status = getMasterSkillStatus(player, skill);
    return status.canUnlock;
  });
};

/**
 * Get locked skills (cannot unlock yet)
 */
export const getLockedMasterSkills = (player: PlayerProfile): MasterSkill[] => {
  return MASTER_SKILLS.filter(skill => {
    const status = getMasterSkillStatus(player, skill);
    return !status.unlocked && !status.canUnlock;
  });
};

/**
 * Calculate total master skill effects for match simulation
 * Returns multipliers and bonuses for each attribute
 */
export const calculateMasterSkillEffects = (player: PlayerProfile): {
  attributeMultipliers: { [key: string]: number };
  matchBonuses: { [key: string]: number };
  unlockedHighlights: string[];
} => {
  const unlockedSkills = getUnlockedMasterSkills(player);

  const attributeMultipliers: { [key: string]: number } = {};
  const matchBonuses: { [key: string]: number } = {};
  const unlockedHighlights: string[] = [];

  unlockedSkills.forEach(skill => {
    switch (skill.effectType) {
      case 'ATTRIBUTE_MULTIPLIER':
        attributeMultipliers[skill.category] =
          (attributeMultipliers[skill.category] || 1) * skill.effectValue;
        break;

      case 'MATCH_BONUS':
        matchBonuses[skill.id] = skill.effectValue;
        break;

      case 'HIGHLIGHT_UNLOCK':
        unlockedHighlights.push(skill.id);
        break;
    }
  });

  return {
    attributeMultipliers,
    matchBonuses,
    unlockedHighlights
  };
};
