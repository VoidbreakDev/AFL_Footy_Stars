import { PlayerProfile, SeasonObjective, ObjectiveCategory, ObjectiveRarity } from '../types';
import { SEASON_LENGTH } from '../constants';

/**
 * Generate weekly objectives for the current round
 */
export const generateWeeklyObjectives = (
    player: PlayerProfile,
    currentRound: number
): SeasonObjective[] => {
    const objectives: SeasonObjective[] = [];
    const position = player.position;

    // Generate 2 weekly objectives per round
    const categories = getEligibleCategories(position);

    for (let i = 0; i < 2; i++) {
        const category = categories[i % categories.length];
        const objective = createObjective(category, currentRound, 'WEEKLY', player);
        if (objective) objectives.push(objective);
    }

    return objectives;
};

/**
 * Generate season-long objectives at start of season
 */
export const generateSeasonObjectives = (
    player: PlayerProfile,
    currentRound: number
): SeasonObjective[] => {
    const objectives: SeasonObjective[] = [];
    const position = player.position;

    // Generate 3 season-long objectives
    const seasonCategories: ObjectiveCategory[] = ['WINS', 'DISPOSALS', 'GOALS', 'TACKLES', 'TRAINING'];
    const selected = seasonCategories.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const category of selected) {
        const objective = createObjective(category, currentRound, 'SEASON', player);
        if (objective) objectives.push(objective);
    }

    return objectives;
};

/**
 * Get eligible objective categories based on player position
 */
const getEligibleCategories = (position: string): ObjectiveCategory[] => {
    const baseCategories: ObjectiveCategory[] = ['DISPOSALS', 'TACKLES', 'MORALE'];

    switch (position) {
        case 'Forward':
            return ['GOALS', 'DISPOSALS', 'MARKS', ...baseCategories];
        case 'Midfielder':
            return ['DISPOSALS', 'TACKLES', 'MARKS', 'VOTES', ...baseCategories];
        case 'Defender':
            return ['TACKLES', 'MARKS', 'DISPOSALS', ...baseCategories];
        case 'Ruck':
            return ['DISPOSALS', 'MARKS', 'TACKLES', ...baseCategories];
        default:
            return ['DISPOSALS', 'TACKLES', ...baseCategories];
    }
};

/**
 * Create a single objective with appropriate target and reward
 */
const createObjective = (
    category: ObjectiveCategory,
    round: number,
    duration: 'WEEKLY' | 'SEASON',
    player: PlayerProfile
): SeasonObjective | null => {
    const id = `obj-${category}-${duration}-${round}-${Date.now()}`;
    let description = '';
    let target = 0;
    let rarity: ObjectiveRarity = 'COMMON';
    let reward: SeasonObjective['reward'] = {};

    const seasonMatches = Math.max(1, player.seasonStats.matches);
    const avgDisposals = player.seasonStats.disposals / seasonMatches;
    const avgGoals = player.seasonStats.goals / seasonMatches;
    const avgTackles = player.seasonStats.tackles / seasonMatches;

    switch (category) {
        case 'DISPOSALS':
            if (duration === 'WEEKLY') {
                target = Math.max(15, Math.floor(avgDisposals * 1.15) + Math.floor(Math.random() * 5));
                description = `Get ${target}+ disposals this match`;
                reward = { xp: 200, skillPoints: 1 };
                rarity = target > 25 ? 'RARE' : target > 20 ? 'UNCOMMON' : 'COMMON';
            } else {
                target = Math.max(200, Math.floor(avgDisposals * 14) + 50);
                description = `Accumulate ${target}+ disposals this season`;
                reward = { xp: 1000, skillPoints: 3, wallet: 5000 };
                rarity = target > 350 ? 'RARE' : target > 280 ? 'UNCOMMON' : 'COMMON';
            }
            break;

        case 'GOALS':
            if (duration === 'WEEKLY') {
                target = Math.max(2, Math.floor(avgGoals * 1.3) + 1);
                description = `Kick ${target}+ goals this match`;
                reward = { xp: 150, skillPoints: 1, morale: 5 };
                rarity = target > 4 ? 'RARE' : target > 2 ? 'UNCOMMON' : 'COMMON';
            } else {
                target = Math.max(20, Math.floor(avgGoals * 14) + 10);
                description = `Kick ${target}+ goals this season`;
                reward = { xp: 800, wallet: 8000, morale: 10 };
                rarity = target > 60 ? 'RARE' : target > 40 ? 'UNCOMMON' : 'COMMON';
            }
            break;

        case 'TACKLES':
            if (duration === 'WEEKLY') {
                target = Math.max(3, Math.floor(avgTackles * 1.2) + 2);
                description = `Lay ${target}+ tackles this match`;
                reward = { xp: 150, morale: 5 };
                rarity = target > 7 ? 'RARE' : target > 4 ? 'UNCOMMON' : 'COMMON';
            } else {
                target = Math.max(40, Math.floor(avgTackles * 14) + 20);
                description = `Complete ${target}+ tackles this season`;
                reward = { xp: 700, morale: 10 };
                rarity = target > 100 ? 'RARE' : target > 70 ? 'UNCOMMON' : 'COMMON';
            }
            break;

        case 'MARKS':
            if (duration === 'WEEKLY') {
                target = Math.max(3, Math.floor((player.seasonStats.marks || 0) / seasonMatches * 1.2) + 2);
                description = `Take ${target}+ marks this match`;
                reward = { xp: 150, skillPoints: 1 };
                rarity = target > 6 ? 'RARE' : 'COMMON';
            } else {
                target = Math.max(30, Math.floor((player.seasonStats.marks || 0) / seasonMatches * 14) + 15);
                description = `Take ${target}+ marks this season`;
                reward = { xp: 600, skillPoints: 2 };
                rarity = target > 60 ? 'RARE' : 'UNCOMMON';
            }
            break;

        case 'VOTES':
            target = Math.max(3, Math.floor(player.seasonStats.votes / seasonMatches * 1.2) + 2);
            description = `Earn ${target}+ Brownlow votes this match`;
            reward = { xp: 300, skillPoints: 2, morale: 10 };
            rarity = target > 5 ? 'RARE' : 'UNCOMMON';
            break;

        case 'WINS':
            target = Math.min(14, Math.max(8, player.seasonStats.matches + 3));
            description = `Win ${target} matches this season`;
            reward = { xp: 1000, wallet: 10000, morale: 15 };
            rarity = target > 11 ? 'RARE' : 'UNCOMMON';
            break;

        case 'MORALE':
            target = 80;
            description = `Maintain 80+ morale for ${duration === 'WEEKLY' ? 'this match' : 'the season'}`;
            reward = { xp: 200, morale: 10 };
            rarity = 'COMMON';
            break;

        case 'TRAINING':
            target = duration === 'WEEKLY' ? 1 : 10;
            description = `Complete ${target} training session${target > 1 ? 's' : ''} ${duration === 'WEEKLY' ? 'this week' : 'this season'}`;
            reward = { xp: duration === 'WEEKLY' ? 100 : 500, skillPoints: duration === 'WEEKLY' ? 1 : 2 };
            rarity = 'COMMON';
            break;

        default:
            return null;
    }

    return {
        id,
        category,
        description,
        target,
        progress: 0,
        duration,
        round,
        expiresRound: duration === 'WEEKLY' ? round + 1 : undefined,
        rarity,
        completed: false,
        reward
    };
};

/**
 * Update objective progress after a match
 */
export const updateObjectiveProgress = (
    objectives: SeasonObjective[],
    matchStats: {
        disposals: number;
        goals: number;
        tackles: number;
        marks?: number;
        votes: number;
        morale: number;
        trained: boolean;
        won: boolean;
    }
): { updatedObjectives: SeasonObjective[]; completedIds: string[] } => {
    const completedIds: string[] = [];
    const updatedObjectives = objectives.map(obj => {
        if (obj.completed) return obj;

        let newProgress = obj.progress;

        switch (obj.category) {
            case 'DISPOSALS':
                newProgress += obj.duration === 'WEEKLY' ? matchStats.disposals : matchStats.disposals;
                break;
            case 'GOALS':
                newProgress += obj.duration === 'WEEKLY' ? matchStats.goals : matchStats.goals;
                break;
            case 'TACKLES':
                newProgress += obj.duration === 'WEEKLY' ? matchStats.tackles : matchStats.tackles;
                break;
            case 'MARKS':
                newProgress += obj.duration === 'WEEKLY' ? (matchStats.marks || 0) : (matchStats.marks || 0);
                break;
            case 'VOTES':
                newProgress += obj.duration === 'WEEKLY' ? matchStats.votes : matchStats.votes;
                break;
            case 'MORALE':
                newProgress = matchStats.morale >= obj.target ? obj.target : matchStats.morale;
                break;
            case 'TRAINING':
                if (matchStats.trained) newProgress += 1;
                break;
            case 'WINS':
                if (matchStats.won) newProgress += 1;
                break;
        }

        const completed = newProgress >= obj.target;
        if (completed && !obj.completed) {
            completedIds.push(obj.id);
        }

        return { ...obj, progress: Math.min(newProgress, obj.target), completed };
    });

    return { updatedObjectives, completedIds };
};

/**
 * Apply rewards for completed objectives
 */
export const applyObjectiveRewards = (
    player: PlayerProfile,
    completedObjectives: SeasonObjective[]
): PlayerProfile => {
    let updatedPlayer = { ...player };

    for (const obj of completedObjectives) {
        if (!obj.reward) continue;

        if (obj.reward.xp) {
            updatedPlayer.xp = (updatedPlayer.xp || 0) + obj.reward.xp;
        }
        if (obj.reward.skillPoints) {
            updatedPlayer.skillPoints = (updatedPlayer.skillPoints || 0) + obj.reward.skillPoints;
        }
        if (obj.reward.wallet) {
            updatedPlayer.wallet = (updatedPlayer.wallet || 0) + obj.reward.wallet;
        }
        if (obj.reward.morale) {
            updatedPlayer.morale = Math.min(100, updatedPlayer.morale + obj.reward.morale);
        }
    }

    return updatedPlayer;
};

/**
 * Remove expired objectives (weekly objectives that have passed)
 */
export const expireOldObjectives = (
    objectives: SeasonObjective[],
    currentRound: number
): SeasonObjective[] => {
    return objectives.filter(obj => {
        if (obj.completed) return false; // Remove completed
        if (obj.expiresRound && currentRound >= obj.expiresRound) return false; // Remove expired
        return true; // Keep active
    });
};
