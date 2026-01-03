import { PlayerProfile, MatchResult, MediaEvent, MediaReputation, FanMilestone, LeagueTier } from '../types';

// Fan milestone thresholds
const FAN_MILESTONES: Omit<FanMilestone, 'unlocked'>[] = [
    { followers: 1000, title: 'Local Following', icon: '👥' },
    { followers: 5000, title: 'Rising Star', icon: '⭐' },
    { followers: 10000, title: 'Fan Favourite', icon: '❤️' },
    { followers: 50000, title: 'State Hero', icon: '🏆' },
    { followers: 100000, title: 'National Icon', icon: '🌟' },
    { followers: 500000, title: 'Superstar', icon: '💫' },
    { followers: 1000000, title: 'Legend', icon: '👑' }
];

// Calculate reputation tier based on score
export const getReputationTier = (score: number): MediaReputation['tier'] => {
    if (score >= 90) return 'LEGEND';
    if (score >= 75) return 'SUPERSTAR';
    if (score >= 60) return 'POPULAR';
    if (score >= 40) return 'DECENT';
    if (score >= 20) return 'CONTROVERSIAL';
    return 'UNKNOWN';
};

// Initialize media reputation for new player
export const initializeMediaReputation = (): MediaReputation => {
    return {
        score: 50, // Start neutral
        tier: 'UNKNOWN',
        fanFollowers: 100, // Starting followers
        socialMediaPosts: 0,
        mediaEvents: [],
        fanMilestones: FAN_MILESTONES.map(m => ({ ...m, unlocked: false }))
    };
};

// Generate media event after a match
export const generateMediaEvent = (
    player: PlayerProfile,
    matchResult: MatchResult,
    currentRound: number,
    currentYear: number
): MediaEvent | null => {
    const { playerStats } = matchResult;
    const won = matchResult.winnerId === matchResult.homeScore.total > matchResult.awayScore.total ? 'home' : 'away';
    const mediaRep = player.mediaReputation || initializeMediaReputation();

    // Determine if event should trigger (60% base chance, higher for standout performances)
    let eventChance = 0.6; // Increased from 30% to 60%
    const outstandingPerformance = playerStats.goals >= 5 || playerStats.disposals >= 35 || playerStats.votes === 3;
    const poorPerformance = playerStats.disposals < 10 && playerStats.goals === 0;

    if (outstandingPerformance) eventChance = 0.9; // 90% for great performances
    if (poorPerformance) eventChance = 0.5; // 50% for poor performances

    if (Math.random() > eventChance) return null;

    // Generate event based on performance and randomness
    const events: Array<{
        type: MediaEvent['type'];
        title: string;
        description: string;
        reputationImpact: number;
        fanImpact: number;
        condition: boolean;
    }> = [
        // Positive events (rare/high impact)
        {
            type: 'PRAISE',
            title: 'Outstanding Performance!',
            description: `${player.name}'s incredible ${playerStats.goals} goal performance has the media singing their praises!`,
            reputationImpact: 10,
            fanImpact: 2000,
            condition: playerStats.goals >= 5
        },
        {
            type: 'PRAISE',
            title: 'Midfield Maestro',
            description: `A dominant ${playerStats.disposals} disposal game has experts calling ${player.name} the best midfielder in the league.`,
            reputationImpact: 8,
            fanImpact: 1500,
            condition: playerStats.disposals >= 35
        },
        // COMMON POSITIVE EVENTS (trigger frequently)
        {
            type: 'INTERVIEW',
            title: 'Post-Match Interview',
            description: `${player.name} speaks to the media after ${won ? 'a hard-fought victory' : 'the tough loss'}.`,
            reputationImpact: won ? 3 : 1,
            fanImpact: won ? 400 : 150,
            condition: won // Trigger on ANY win
        },
        {
            type: 'PRESS_CONFERENCE',
            title: 'Weekly Press Conference',
            description: `${player.name} addresses the media about their recent form and upcoming challenges.`,
            reputationImpact: 2,
            fanImpact: 200,
            condition: currentRound % 3 === 0 // Every 3 rounds
        },
        {
            type: 'SOCIAL_MEDIA',
            title: 'Social Media Buzz',
            description: `Fans are talking about ${player.name}'s ${playerStats.goals} goal${playerStats.goals > 1 ? 's' : ''} and ${playerStats.disposals} disposal performance!`,
            reputationImpact: 2,
            fanImpact: 300,
            condition: playerStats.goals >= 2 || playerStats.disposals >= 20
        },
        {
            type: 'INTERVIEW',
            title: 'Rising Star Spotlight',
            description: `Media outlets are taking notice of ${player.name}'s consistent performances this season.`,
            reputationImpact: 4,
            fanImpact: 600,
            condition: playerStats.votes > 0
        },
        {
            type: 'SOCIAL_MEDIA',
            title: 'Big Win Celebration',
            description: `The locker room celebrations are trending on social media after the team's dominant victory!`,
            reputationImpact: 3,
            fanImpact: 500,
            condition: won && outstandingPerformance
        },
        // COMMON NEGATIVE EVENTS
        {
            type: 'CRITICISM',
            title: 'Quiet Game Raises Questions',
            description: `Critics question ${player.name}'s impact after a quiet ${playerStats.disposals} disposal game.`,
            reputationImpact: -3,
            fanImpact: -200,
            condition: poorPerformance && !won
        },
        {
            type: 'PRESS_CONFERENCE',
            title: 'Tough Loss Debrief',
            description: `${player.name} faces questions from the media after the disappointing result.`,
            reputationImpact: -1,
            fanImpact: -100,
            condition: !won && playerStats.disposals < 15
        },
        {
            type: 'CONTROVERSY',
            title: 'Physical Play Under Scrutiny',
            description: `${player.name}'s aggressive tackling style has drawn attention from commentators.`,
            reputationImpact: -2,
            fanImpact: 100, // Some fans like it!
            condition: playerStats.tackles >= 8
        },
        // NEUTRAL/ROUTINE EVENTS
        {
            type: 'INTERVIEW',
            title: 'Mid-Week Media Duties',
            description: `${player.name} fulfills their media obligations with a standard interview about the upcoming match.`,
            reputationImpact: 1,
            fanImpact: 100,
            condition: true // Always possible as fallback
        }
    ];

    // Filter valid events and pick one randomly
    const validEvents = events.filter(e => e.condition);
    if (validEvents.length === 0) return null;

    const selectedEvent = validEvents[Math.floor(Math.random() * validEvents.length)];

    return {
        id: `media-${currentYear}-${currentRound}-${Date.now()}`,
        type: selectedEvent.type,
        title: selectedEvent.title,
        description: selectedEvent.description,
        reputationImpact: selectedEvent.reputationImpact,
        fanImpact: selectedEvent.fanImpact,
        round: currentRound,
        year: currentYear,
        hasResponded: false
    };
};

// Update media reputation based on performance
export const updateMediaReputation = (
    mediaRep: MediaReputation,
    event: MediaEvent
): MediaReputation => {
    const newScore = Math.max(0, Math.min(100, mediaRep.score + event.reputationImpact));
    const newFollowers = Math.max(0, mediaRep.fanFollowers + event.fanImpact);

    // Check for newly unlocked milestones
    const updatedMilestones = mediaRep.fanMilestones?.map(milestone => {
        if (!milestone.unlocked && newFollowers >= milestone.followers) {
            return { ...milestone, unlocked: true };
        }
        return milestone;
    });

    return {
        ...mediaRep,
        score: newScore,
        tier: getReputationTier(newScore),
        fanFollowers: newFollowers,
        mediaEvents: [...mediaRep.mediaEvents, event],
        fanMilestones: updatedMilestones
    };
};

// Passive fan growth per round based on performance
export const calculatePassiveFanGrowth = (
    player: PlayerProfile,
    tier: LeagueTier
): number => {
    const mediaRep = player.mediaReputation || initializeMediaReputation();

    // Base growth
    let growth = 50;

    // Tier multipliers
    if (tier === 'AFL') growth *= 5;
    else if (tier === 'State League') growth *= 2;

    // Reputation bonus
    const reputationBonus = Math.floor(mediaRep.score / 10) * 10;
    growth += reputationBonus;

    // Performance bonus (season stats)
    const seasonGoals = player.seasonStats.goals;
    const seasonVotes = player.seasonStats.votes;

    if (seasonGoals >= 20) growth += 100;
    if (seasonVotes >= 10) growth += 150;

    return Math.floor(growth);
};

// Get newly unlocked milestones
export const getNewlyUnlockedMilestones = (
    oldReputation: MediaReputation,
    newReputation: MediaReputation
): FanMilestone[] => {
    if (!oldReputation.fanMilestones || !newReputation.fanMilestones) return [];

    return newReputation.fanMilestones.filter((newM, index) => {
        const oldM = oldReputation.fanMilestones![index];
        return newM.unlocked && !oldM.unlocked;
    });
};

// Generate social media post (player-initiated)
export const createSocialMediaPost = (
    player: PlayerProfile,
    content: string,
    currentRound: number,
    currentYear: number
): MediaEvent => {
    const mediaRep = player.mediaReputation || initializeMediaReputation();

    // Impact based on current reputation
    const reputationMultiplier = mediaRep.score / 50; // 0-2x
    const baseImpact = 300;
    const fanImpact = Math.floor(baseImpact * reputationMultiplier);

    return {
        id: `post-${currentYear}-${currentRound}-${Date.now()}`,
        type: 'SOCIAL_MEDIA',
        title: 'Social Media Update',
        description: content,
        reputationImpact: 1,
        fanImpact,
        round: currentRound,
        year: currentYear,
        hasResponded: true // User created
    };
};

// Respond to media event (player's response affects impact)
export const respondToMediaEvent = (
    event: MediaEvent,
    responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE'
): MediaEvent => {
    let additionalRepImpact = 0;
    let additionalFanImpact = 0;

    // Response effects based on event type and response
    if (event.type === 'PRAISE') {
        if (responseType === 'HUMBLE') {
            additionalRepImpact = 3;
            additionalFanImpact = 500;
        } else if (responseType === 'CONFIDENT') {
            additionalRepImpact = 1;
            additionalFanImpact = 300;
        }
    } else if (event.type === 'CRITICISM') {
        if (responseType === 'HUMBLE') {
            additionalRepImpact = 5; // Good recovery
            additionalFanImpact = 400;
        } else if (responseType === 'CONFIDENT') {
            additionalRepImpact = -3; // Seen as defensive
            additionalFanImpact = -200;
        } else {
            additionalRepImpact = -2; // Ignoring looks bad
            additionalFanImpact = -100;
        }
    } else if (event.type === 'INTERVIEW') {
        if (responseType === 'HUMBLE' || responseType === 'CONFIDENT') {
            additionalRepImpact = 2;
            additionalFanImpact = 200;
        }
    }

    return {
        ...event,
        reputationImpact: event.reputationImpact + additionalRepImpact,
        fanImpact: event.fanImpact + additionalFanImpact,
        hasResponded: true
    };
};
