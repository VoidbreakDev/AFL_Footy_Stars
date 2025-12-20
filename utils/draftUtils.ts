import { DraftProspect, DraftPick, DraftClass, Position, Team, PlayerAttributes, LeagueTier } from '../types';
import { FIRST_NAMES, LAST_NAMES } from '../constants';

// Australian states for prospects
const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

// Sub-positions by position
const SUB_POSITIONS: Record<Position, string[]> = {
    [Position.FORWARD]: ['FF', 'CHF', 'HFF', 'FP'],
    [Position.MIDFIELDER]: ['C', 'WING', 'RUCK-ROVER', 'ROVER'],
    [Position.DEFENDER]: ['FB', 'CHB', 'HBF', 'BP'],
    [Position.RUCK]: ['RUCK', 'RUCK-ROVER']
};

// Playstyle templates for bio generation
const PLAYSTYLE_TEMPLATES = {
    [Position.FORWARD]: [
        'Dangerous goal-sneak with elite positioning',
        'Powerful marking target who dominates in the air',
        'Quick-footed small forward with exceptional pressure',
        'Athletic forward who covers the ground well',
        'Natural goal-kicker with ice in his veins'
    ],
    [Position.MIDFIELDER]: [
        'Ball-winning midfielder with elite endurance',
        'Inside contested beast who thrives in traffic',
        'Outside runner with devastating speed',
        'Classy ball-user with elite vision',
        'Hard-running midfielder who racks up disposals'
    ],
    [Position.DEFENDER]: [
        'Lock-down defender with elite one-on-one skills',
        'Intercepting defender who reads the play perfectly',
        'Rebounding half-back with elite kicking',
        'Strong overhead marker who controls the backline',
        'Versatile defender who can shut down any opponent'
    ],
    [Position.RUCK]: [
        'Dominant tap ruckman who controls hit-outs',
        'Mobile ruck who covers the ground like a midfielder',
        'Physical presence who intimidates opponents',
        'Athletic ruck with strong marking ability',
        'Versatile big man who impacts around the ground'
    ]
};

// Strength/weakness descriptions by attribute
const ATTRIBUTE_DESCRIPTIONS = {
    kicking: { strength: 'Elite kicking', weakness: 'Kicking accuracy' },
    handball: { strength: 'Clean hands', weakness: 'Handball skills' },
    tackling: { strength: 'Strong tackler', weakness: 'Tackling technique' },
    marking: { strength: 'Strong overhead', weakness: 'Contested marking' },
    speed: { strength: 'Explosive pace', weakness: 'Foot speed' },
    stamina: { strength: 'Elite endurance', weakness: 'Tank/fitness' },
    goalSense: { strength: 'Natural goal-kicker', weakness: 'Goal sense' }
};

/**
 * Generate a random prospect with realistic attributes
 */
const generateProspect = (id: number, draftYear: number): DraftProspect => {
    // Random position
    const positions = [Position.FORWARD, Position.MIDFIELDER, Position.DEFENDER, Position.RUCK];
    const position = positions[Math.floor(Math.random() * positions.length)];

    // Random sub-position for that position
    const subPositions = SUB_POSITIONS[position];
    const subPosition = subPositions[Math.floor(Math.random() * subPositions.length)];

    // Random name
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    // Random state
    const state = STATES[Math.floor(Math.random() * STATES.length)];

    // Age (17-19 for draft prospects)
    const age = 17 + Math.floor(Math.random() * 3);

    // Potential (65-95) - this is their ceiling
    // Distribution: Most players 70-80, some elite 85-95, few busts 65-70
    const potentialRoll = Math.random();
    let potential: number;
    if (potentialRoll < 0.05) {
        // 5% chance: Elite potential (90-95)
        potential = 90 + Math.floor(Math.random() * 6);
    } else if (potentialRoll < 0.20) {
        // 15% chance: High potential (85-89)
        potential = 85 + Math.floor(Math.random() * 5);
    } else if (potentialRoll < 0.70) {
        // 50% chance: Good potential (75-84)
        potential = 75 + Math.floor(Math.random() * 10);
    } else if (potentialRoll < 0.90) {
        // 20% chance: Average potential (70-74)
        potential = 70 + Math.floor(Math.random() * 5);
    } else {
        // 10% chance: Low potential (65-69) - "busts"
        potential = 65 + Math.floor(Math.random() * 5);
    }

    // Current attributes (50-70% of potential)
    const developmentRatio = 0.5 + Math.random() * 0.2; // 50-70%

    const baseAttribute = Math.floor(potential * developmentRatio);
    const variance = 8; // Attributes can vary by ±8 from base

    const attributes: PlayerAttributes = {
        kicking: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        handball: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        tackling: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        marking: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        speed: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        stamina: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance)),
        goalSense: Math.max(30, Math.min(85, baseAttribute + Math.floor(Math.random() * variance * 2) - variance))
    };

    // Position-specific attribute adjustments
    if (position === Position.FORWARD) {
        attributes.goalSense = Math.min(85, attributes.goalSense + 5);
        attributes.kicking = Math.min(85, attributes.kicking + 3);
    } else if (position === Position.MIDFIELDER) {
        attributes.stamina = Math.min(85, attributes.stamina + 5);
        attributes.speed = Math.min(85, attributes.speed + 3);
    } else if (position === Position.DEFENDER) {
        attributes.tackling = Math.min(85, attributes.tackling + 5);
        attributes.marking = Math.min(85, attributes.marking + 3);
    } else if (position === Position.RUCK) {
        attributes.marking = Math.min(85, attributes.marking + 5);
        attributes.stamina = Math.min(85, attributes.stamina + 3);
    }

    // Calculate current overall rating
    const rating = Math.floor(
        (attributes.kicking + attributes.handball + attributes.tackling +
         attributes.marking + attributes.speed + attributes.stamina + attributes.goalSense) / 7
    );

    // Generate bio
    const bioTemplates = PLAYSTYLE_TEMPLATES[position];
    const bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];

    // Find strengths (top 2 attributes)
    const attrEntries = Object.entries(attributes) as [keyof PlayerAttributes, number][];
    attrEntries.sort((a, b) => b[1] - a[1]);
    const strengths = attrEntries.slice(0, 2).map(([attr]) => ATTRIBUTE_DESCRIPTIONS[attr].strength);

    // Find weaknesses (bottom 2 attributes)
    const weaknesses = attrEntries.slice(-2).map(([attr]) => ATTRIBUTE_DESCRIPTIONS[attr].weakness);

    return {
        id: `prospect-${draftYear}-${id}`,
        name,
        age,
        position,
        subPosition,
        state,
        attributes,
        potential,
        rating,
        bio,
        strengths,
        weaknesses,
        draftRank: 0 // Will be set after sorting
    };
};

/**
 * Generate a full draft class with 30 prospects
 */
export const generateDraftClass = (year: number): DraftProspect[] => {
    const prospects: DraftProspect[] = [];

    // Generate 30 prospects
    for (let i = 0; i < 30; i++) {
        prospects.push(generateProspect(i + 1, year));
    }

    // Sort by rating (best to worst) and assign draft ranks
    prospects.sort((a, b) => {
        // Primary sort: potential (higher is better)
        if (b.potential !== a.potential) {
            return b.potential - a.potential;
        }
        // Secondary sort: current rating
        return b.rating - a.rating;
    });

    // Assign draft ranks with some randomness (scouts aren't perfect)
    prospects.forEach((prospect, index) => {
        // Add ±3 variance to draft rank to simulate scouting uncertainty
        const baseRank = index + 1;
        const variance = Math.floor(Math.random() * 7) - 3; // -3 to +3
        prospect.draftRank = Math.max(1, Math.min(30, baseRank + variance));
    });

    // Re-sort by draft rank for display
    prospects.sort((a, b) => a.draftRank - b.draftRank);

    return prospects;
};

/**
 * Generate draft picks based on ladder positions (reverse order)
 */
export const generateDraftPicks = (league: Team[], year: number): DraftPick[] => {
    const picks: DraftPick[] = [];

    // Sort teams by ladder position (worst to best)
    const sortedTeams = [...league].sort((a, b) => a.points - b.points);

    // Round 1: Picks 1-8 (based on ladder position, reverse order)
    sortedTeams.forEach((team, index) => {
        picks.push({
            pickNumber: index + 1,
            round: 1,
            teamId: team.id,
            teamName: team.name
        });
    });

    // Round 2: Picks 9-16 (same order as round 1)
    sortedTeams.forEach((team, index) => {
        picks.push({
            pickNumber: index + 9,
            round: 2,
            teamId: team.id,
            teamName: team.name
        });
    });

    // Round 3: Picks 17-24
    sortedTeams.forEach((team, index) => {
        picks.push({
            pickNumber: index + 17,
            round: 3,
            teamId: team.id,
            teamName: team.name
        });
    });

    // Round 4: Picks 25-30 (only first 6 teams get round 4 picks)
    for (let i = 0; i < 6; i++) {
        picks.push({
            pickNumber: i + 25,
            round: 4,
            teamId: sortedTeams[i].id,
            teamName: sortedTeams[i].name
        });
    }

    return picks;
};

/**
 * Simulate AI teams making draft selections
 */
export const simulateDraftPick = (
    pick: DraftPick,
    availableProspects: DraftProspect[],
    team: Team
): DraftProspect => {
    // AI draft strategy: Pick best available with some position need consideration

    // Find team's weakest positions (positions with lowest average rating)
    const positionNeeds: Record<Position, number> = {
        [Position.FORWARD]: 0,
        [Position.MIDFIELDER]: 0,
        [Position.DEFENDER]: 0,
        [Position.RUCK]: 0
    };

    team.players.forEach(player => {
        positionNeeds[player.position] += player.rating;
    });

    // Calculate average rating per position
    Object.keys(positionNeeds).forEach(pos => {
        const playersInPosition = team.players.filter(p => p.position === pos as Position).length;
        if (playersInPosition > 0) {
            positionNeeds[pos as Position] /= playersInPosition;
        }
    });

    // Find weakest position
    const weakestPosition = (Object.entries(positionNeeds) as [Position, number][])
        .sort((a, b) => a[1] - b[1])[0][0];

    // 70% chance to pick best player available, 30% chance to prioritize position need
    const prioritizeNeed = Math.random() < 0.3;

    if (prioritizeNeed) {
        // Filter to weakest position
        const positionProspects = availableProspects.filter(p => p.position === weakestPosition);
        if (positionProspects.length > 0) {
            // Pick best available at that position
            return positionProspects[0];
        }
    }

    // Default: Pick best available (first in sorted list)
    return availableProspects[0];
};

/**
 * Create a complete draft class object
 */
export const createDraftClass = (year: number, league: Team[], userTeamId?: string): DraftClass => {
    const prospects = generateDraftClass(year);
    const picks = generateDraftPicks(league, year);

    // Find if user's team has a pick in round 1
    const userPick = userTeamId ? picks.find(p => p.teamId === userTeamId && p.round === 1) : undefined;

    return {
        year,
        prospects,
        picks,
        userPickNumber: userPick?.pickNumber,
        completed: false
    };
};

/**
 * Check if player is eligible for AFL draft
 * Must be in State League with good performance
 */
export const isPlayerDraftEligible = (player: PlayerProfile): boolean => {
    // Must be in State League
    if (player.contract.tier !== LeagueTier.STATE) return false;

    // Age check: typically 18-21 for draft eligibility
    if (player.age > 21) return false;

    // Calculate player rating
    const rating = Math.floor(
        (Object.values(player.attributes) as number[]).reduce((a, b) => a + b, 0) / 7
    );

    // Performance check: Must have played matches and have decent rating
    if (player.seasonStats.matches < 8) return false; // At least half a season
    if (rating < 55) return false; // Must be decent quality

    return true;
};

/**
 * Convert player profile to draft prospect
 */
export const convertPlayerToProspect = (player: PlayerProfile, year: number): DraftProspect => {
    const rating = Math.floor(
        (Object.values(player.attributes) as number[]).reduce((a, b) => a + b, 0) / 7
    );

    // Find strengths (top 2 attributes)
    const attrEntries = Object.entries(player.attributes) as [keyof PlayerAttributes, number][];
    attrEntries.sort((a, b) => b[1] - a[1]);
    const strengths = attrEntries.slice(0, 2).map(([attr]) => ATTRIBUTE_DESCRIPTIONS[attr].strength);

    // Find weaknesses (bottom 2 attributes)
    const weaknesses = attrEntries.slice(-2).map(([attr]) => ATTRIBUTE_DESCRIPTIONS[attr].weakness);

    // Estimate draft rank based on rating and potential
    // Higher rating + higher potential = better draft pick
    const avgScore = (rating + player.potential) / 2;
    let estimatedRank: number;
    if (avgScore >= 80) estimatedRank = 1 + Math.floor(Math.random() * 5); // Top 5
    else if (avgScore >= 75) estimatedRank = 6 + Math.floor(Math.random() * 5); // Picks 6-10
    else if (avgScore >= 70) estimatedRank = 11 + Math.floor(Math.random() * 10); // Picks 11-20
    else estimatedRank = 21 + Math.floor(Math.random() * 10); // Picks 21-30

    return {
        id: `prospect-user-${year}`,
        name: player.name,
        age: player.age,
        position: player.position,
        subPosition: player.subPosition,
        state: 'VIC', // Could randomize or track
        attributes: { ...player.attributes },
        potential: player.potential,
        rating,
        bio: player.bio || `Talented ${player.position.toLowerCase()} with ${player.seasonStats.matches} games of State League experience`,
        strengths,
        weaknesses,
        draftRank: estimatedRank
    };
};

/**
 * Generate draft class including the player as a prospect
 */
export const generateDraftClassWithPlayer = (
    year: number,
    player: PlayerProfile,
    league: Team[]
): DraftClass => {
    // Convert player to prospect
    const playerProspect = convertPlayerToProspect(player, year);

    // Generate other prospects (29 instead of 30)
    const otherProspects: DraftProspect[] = [];
    for (let i = 0; i < 29; i++) {
        otherProspects.push(generateProspect(i + 1, year));
    }

    // Combine and sort all prospects
    const allProspects = [...otherProspects, playerProspect];
    allProspects.sort((a, b) => {
        if (b.potential !== a.potential) return b.potential - a.potential;
        return b.rating - a.rating;
    });

    // Assign draft ranks
    allProspects.forEach((prospect, index) => {
        const baseRank = index + 1;
        const variance = Math.floor(Math.random() * 7) - 3;
        prospect.draftRank = Math.max(1, Math.min(30, baseRank + variance));
    });

    allProspects.sort((a, b) => a.draftRank - b.draftRank);

    // Generate picks based on AFL league standings
    const picks = generateDraftPicks(league, year);

    return {
        year,
        prospects: allProspects,
        picks,
        userPickNumber: playerProspect.draftRank, // Player's projected pick
        completed: false
    };
};

/**
 * Check if player was drafted
 */
export const wasPlayerDrafted = (draftClass: DraftClass, playerProspectId: string): { drafted: boolean; team?: string; pickNumber?: number } => {
    const pick = draftClass.picks.find(p => p.prospectId === playerProspectId);
    if (pick) {
        return {
            drafted: true,
            team: pick.teamName,
            pickNumber: pick.pickNumber
        };
    }
    return { drafted: false };
};

/**
 * Check if draft should occur (only in State tier for player)
 */
export const shouldHoldDraft = (tier: LeagueTier): boolean => {
    return tier === LeagueTier.STATE; // Player experiences draft from State League
};
