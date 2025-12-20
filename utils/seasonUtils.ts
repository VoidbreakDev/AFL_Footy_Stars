import { PlayerProfile, Team, LeagueTier, SeasonHistory } from '../types';

/**
 * Determines if player should be promoted based on ladder position and performance
 */
export const shouldPromote = (
    ladderPosition: number,
    currentTier: LeagueTier,
    playerRating: number
): boolean => {
    // Can't promote from AFL (top tier)
    if (currentTier === LeagueTier.NATIONAL) return false;

    // LOCAL -> STATE: Top 3 finish + decent rating
    if (currentTier === LeagueTier.LOCAL) {
        return ladderPosition <= 3 && playerRating >= 50;
    }

    // STATE -> AFL: Top 2 finish + good rating
    if (currentTier === LeagueTier.STATE) {
        return ladderPosition <= 2 && playerRating >= 65;
    }

    return false;
};

/**
 * Determines if player should be relegated based on poor performance
 */
export const shouldRelegate = (
    ladderPosition: number,
    currentTier: LeagueTier,
    playerRating: number
): boolean => {
    // Can't relegate from LOCAL (bottom tier)
    if (currentTier === LeagueTier.LOCAL) return false;

    // AFL -> STATE: Bottom 2 + poor rating
    if (currentTier === LeagueTier.NATIONAL) {
        return ladderPosition >= 7 && playerRating < 60;
    }

    // STATE -> LOCAL: Bottom 2 + poor rating
    if (currentTier === LeagueTier.STATE) {
        return ladderPosition >= 7 && playerRating < 50;
    }

    return false;
};

/**
 * Gets the next tier after promotion
 */
export const getPromotedTier = (currentTier: LeagueTier): LeagueTier => {
    if (currentTier === LeagueTier.LOCAL) return LeagueTier.STATE;
    if (currentTier === LeagueTier.STATE) return LeagueTier.NATIONAL;
    return currentTier; // Already at top
};

/**
 * Gets the next tier after relegation
 */
export const getRelegatedTier = (currentTier: LeagueTier): LeagueTier => {
    if (currentTier === LeagueTier.NATIONAL) return LeagueTier.STATE;
    if (currentTier === LeagueTier.STATE) return LeagueTier.LOCAL;
    return currentTier; // Already at bottom
};

/**
 * Creates a season history record for the completed season
 */
export const createSeasonHistory = (
    player: PlayerProfile,
    team: Team,
    promoted: boolean,
    relegated: boolean,
    premiership: boolean
): SeasonHistory => {
    return {
        year: player.currentYear || 1,
        tier: player.contract.tier,
        club: player.contract.clubName,
        ladderPosition: team.points > 0 ? getLadderPosition(team) : 8, // Fallback if not found
        stats: { ...player.seasonStats },
        promoted,
        relegated,
        premiership
    };
};

/**
 * Helper to determine ladder position from team
 * (This is a placeholder - actual position should be calculated from league standings)
 */
const getLadderPosition = (team: Team): number => {
    // This will be properly calculated when we have the full league ladder
    // For now, estimate based on win percentage
    const totalGames = team.wins + team.losses + team.draws;
    if (totalGames === 0) return 8;

    const winPercentage = (team.wins + team.draws * 0.5) / totalGames;

    if (winPercentage >= 0.85) return 1;
    if (winPercentage >= 0.75) return 2;
    if (winPercentage >= 0.65) return 3;
    if (winPercentage >= 0.55) return 4;
    if (winPercentage >= 0.45) return 5;
    if (winPercentage >= 0.35) return 6;
    if (winPercentage >= 0.25) return 7;
    return 8;
};

/**
 * Calculate salary multiplier based on tier
 */
export const getSalaryMultiplier = (tier: LeagueTier): number => {
    switch (tier) {
        case LeagueTier.LOCAL:
            return 1.0;
        case LeagueTier.STATE:
            return 2.5;
        case LeagueTier.NATIONAL:
            return 8.0;
        default:
            return 1.0;
    }
};

/**
 * Generate new contract salary based on tier and performance
 */
export const generateNewSeasonSalary = (
    currentSalary: number,
    newTier: LeagueTier,
    playerRating: number,
    promoted: boolean
): number => {
    const baseSalary = 500;
    const tierMultiplier = getSalaryMultiplier(newTier);
    const ratingBonus = Math.floor((playerRating - 50) / 10) * 100;
    const promotionBonus = promoted ? 500 : 0;

    return Math.max(
        baseSalary * tierMultiplier + ratingBonus + promotionBonus,
        baseSalary
    );
};
