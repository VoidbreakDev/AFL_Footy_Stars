import { PlayerProfile, PlayerAttributes, Position } from '../types';

/**
 * Pre-Season Training Camp
 * Before season starts, player chooses ONE attribute to focus on.
 * Gets a bigger boost than regular training (free, but costs energy).
 */

export type PreSeasonFocus = keyof PlayerAttributes | 'NONE';

export interface PreSeasonCamp {
  completed: boolean;
  focusAttribute: PreSeasonFocus;
  energyCost: number;
  attributeBoost: number; // How many points gained
  trainingPartnership?: {
    teammateName: string;
    teammateId: string;
    bonusAttribute: keyof PlayerAttributes;
    bonusAmount: number;
  };
}

/**
 * Generate pre-season camp options based on player's weakest attributes
 */
export const generatePreSeasonCamp = (player: PlayerProfile): PreSeasonCamp => {
  // Find weakest attribute
  const attrs = Object.entries(player.attributes) as [keyof PlayerAttributes, number][];
  const weakest = attrs.sort((a, b) => a[1] - b[1])[0];

  return {
    completed: false,
    focusAttribute: weakest[0] as PreSeasonFocus,
    energyCost: 20,
    attributeBoost: 2, // Pre-season gives +2 instead of +1
    trainingPartnership: undefined,
  };
};

/**
 * Complete pre-season training
 * Returns updated player with boosted attribute
 */
export const completePreSeasonTraining = (
  player: PlayerProfile,
  camp: PreSeasonCamp
): PlayerProfile => {
  if (camp.completed) return player;
  if (camp.focusAttribute === 'NONE') return player;

  const attrKey = camp.focusAttribute as keyof PlayerAttributes;
  const currentValue = player.attributes[attrKey];
  const newValue = Math.min(currentValue + camp.attributeBoost, player.potential);

  return {
    ...player,
    energy: Math.max(0, player.energy - camp.energyCost),
    attributes: {
      ...player.attributes,
      [attrKey]: newValue,
    },
  };
};

/**
 * Check if training partnership is available (teammate with same position)
 */
export const findTrainingPartner = (
  player: PlayerProfile,
  teammates: any[]
): { name: string; id: string; bonusAttribute: keyof PlayerAttributes; bonusAmount: number } | null => {
  if (!teammates || teammates.length === 0) return null;

  // Find teammate with same position
  const samePosition = teammates.find(t => t.position === player.position);
  if (!samePosition) return null;

  // Partnership gives small bonus to a secondary attribute
  const secondaryAttrs: Partial<Record<Position, keyof PlayerAttributes>> = {
    FORWARD: 'marking',
    MIDFIELDER: 'stamina',
    DEFENDER: 'tackling',
    RUCK: 'marking',
  };

  const bonusAttr = secondaryAttrs[player.position] || 'speed';

  return {
    name: samePosition.name,
    id: samePosition.id,
    bonusAttribute: bonusAttr,
    bonusAmount: 1,
  };
};

/**
 * Apply training partnership bonus
 */
export const applyTrainingPartnership = (
  player: PlayerProfile,
  partnership: NonNullable<PreSeasonCamp['trainingPartnership']>
): PlayerProfile => {
  const currentValue = player.attributes[partnership.bonusAttribute];
  const newValue = Math.min(currentValue + partnership.bonusAmount, player.potential);

  return {
    ...player,
    attributes: {
      ...player.attributes,
      [partnership.bonusAttribute]: newValue,
    },
  };
};
