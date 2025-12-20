import { PlayerProfile, Team, LeagueTier, Award } from '../types';
import { AwardType } from '../constants';

/**
 * Calculate all awards for the player at end of season
 */
export const calculateSeasonAwards = (
    player: PlayerProfile,
    league: Team[],
    currentYear: number
): Award[] => {
    const awards: Award[] = [];
    const seasonStats = player.seasonStats;
    const tier = player.contract.tier;

    // 1. BROWNLOW MEDAL - Most Brownlow votes in the league
    if (seasonStats.votes > 0) {
        const brownlowWon = checkBrownlowMedal(player, league);
        if (brownlowWon) {
            awards.push({
                type: AwardType.BROWNLOW_MEDAL,
                year: currentYear,
                tier,
                value: seasonStats.votes
            });
        }
    }

    // 2. COLEMAN MEDAL - Leading goal scorer
    if (seasonStats.goals > 0) {
        const colemanWon = checkColemanMedal(player, league);
        if (colemanWon) {
            awards.push({
                type: AwardType.COLEMAN_MEDAL,
                year: currentYear,
                tier,
                value: seasonStats.goals
            });
        }
    }

    // 3. ALL-AUSTRALIAN - Top performers (simplified: top 22 players by rating)
    const allAustralian = checkAllAustralian(player, league);
    if (allAustralian) {
        awards.push({
            type: AwardType.ALL_AUSTRALIAN,
            year: currentYear,
            tier
        });
    }

    // 4. CLUB BEST & FAIREST - Highest votes at your club
    const clubBF = checkClubBestAndFairest(player, league);
    if (clubBF) {
        awards.push({
            type: AwardType.CLUB_BEST_AND_FAIREST,
            year: currentYear,
            tier,
            value: seasonStats.votes
        });
    }

    // 5. RISING STAR - Under 21 with strong performance
    if (player.age <= 21) {
        const risingStar = checkRisingStar(player, league);
        if (risingStar) {
            awards.push({
                type: AwardType.RISING_STAR,
                year: currentYear,
                tier
            });
        }
    }

    // 6. LEADING DISPOSAL WINNER - Most disposals
    if (seasonStats.disposals > 0) {
        const leadingDisposals = checkLeadingDisposals(player, league);
        if (leadingDisposals) {
            awards.push({
                type: AwardType.LEADING_DISPOSAL_WINNER,
                year: currentYear,
                tier,
                value: seasonStats.disposals
            });
        }
    }

    // 7. LEADING TACKLER - Most tackles
    if (seasonStats.tackles > 0) {
        const leadingTackler = checkLeadingTackler(player, league);
        if (leadingTackler) {
            awards.push({
                type: AwardType.LEADING_TACKLER,
                year: currentYear,
                tier,
                value: seasonStats.tackles
            });
        }
    }

    // 8. MARK/GOAL OF THE YEAR - Random chance based on performance
    if (seasonStats.goals >= 20 && Math.random() > 0.9) {
        awards.push({
            type: AwardType.GOAL_OF_THE_YEAR,
            year: currentYear,
            tier
        });
    }

    if (seasonStats.disposals >= 300 && Math.random() > 0.92) {
        awards.push({
            type: AwardType.MARK_OF_THE_YEAR,
            year: currentYear,
            tier
        });
    }

    return awards;
};

/**
 * Check if player won Brownlow Medal (most votes in league)
 */
const checkBrownlowMedal = (player: PlayerProfile, league: Team[]): boolean => {
    // Player needs at least 15 votes to be competitive
    if (player.seasonStats.votes < 15) return false;

    // Simulate competition from other players
    // Top 3 teams will have players with strong vote counts
    const sortedTeams = [...league].sort((a, b) => b.points - a.points);
    const topTeams = sortedTeams.slice(0, 3);

    // Generate simulated vote counts for top players
    const competitorVotes = topTeams.map(() => {
        return Math.floor(Math.random() * 18) + 8; // 8-25 votes
    });

    // Player wins if they have more votes than all competitors
    return competitorVotes.every(votes => player.seasonStats.votes > votes);
};

/**
 * Check if player won Coleman Medal (most goals)
 */
const checkColemanMedal = (player: PlayerProfile, league: Team[]): boolean => {
    // Need significant goals
    if (player.seasonStats.goals < 30) return false;

    // Simulate competition
    const competitorGoals = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 40) + 20 // 20-59 goals
    );

    return competitorGoals.every(goals => player.seasonStats.goals > goals);
};

/**
 * Check if player makes All-Australian team (top 22 players by rating)
 */
const checkAllAustralian = (player: PlayerProfile, league: Team[]): boolean => {
    const playerRating = Math.floor(
        (Object.values(player.attributes) as number[]).reduce((a, b) => a + b, 0) / 7
    );

    // Need high rating and good stats
    if (playerRating < 70) return false;
    if (player.seasonStats.matches < 10) return false;

    // Strong performers with good stats have a chance
    const avgStatsPerGame = player.seasonStats.disposals / player.seasonStats.matches;
    if (avgStatsPerGame >= 20 && playerRating >= 70) return true;
    if (avgStatsPerGame >= 25 && playerRating >= 65) return true;

    return false;
};

/**
 * Check if player won Club Best & Fairest
 */
const checkClubBestAndFairest = (player: PlayerProfile, league: Team[]): boolean => {
    // Need at least 10 votes
    if (player.seasonStats.votes < 10) return false;

    // Simulate 1-2 teammates competing
    const teammateVotes = Math.floor(Math.random() * 12) + 5; // 5-16 votes

    return player.seasonStats.votes > teammateVotes;
};

/**
 * Check if player won Rising Star (best young player)
 */
const checkRisingStar = (player: PlayerProfile, league: Team[]): boolean => {
    if (player.age > 21) return false;

    const playerRating = Math.floor(
        (Object.values(player.attributes) as number[]).reduce((a, b) => a + b, 0) / 7
    );

    // Need to be a standout young player
    if (playerRating < 60) return false;
    if (player.seasonStats.matches < 8) return false;

    // Strong young players with good participation win
    return true;
};

/**
 * Check if player won leading disposals
 */
const checkLeadingDisposals = (player: PlayerProfile, league: Team[]): boolean => {
    if (player.seasonStats.disposals < 250) return false;

    // Simulate competition
    const competitorDisposals = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 300) + 200 // 200-499
    );

    return competitorDisposals.every(disposals => player.seasonStats.disposals > disposals);
};

/**
 * Check if player won leading tackler
 */
const checkLeadingTackler = (player: PlayerProfile, league: Team[]): boolean => {
    if (player.seasonStats.tackles < 80) return false;

    // Simulate competition
    const competitorTackles = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * 100) + 50 // 50-149
    );

    return competitorTackles.every(tackles => player.seasonStats.tackles > tackles);
};
