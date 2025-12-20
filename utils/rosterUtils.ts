import { Team, AIPlayer, Position, DraftProspect, LeagueTier } from '../types';
import { getRandomName, ROSTER_TEMPLATE, generateAIPlayerAttributes } from './leagueUtils';

// Age all players in a team by 1 year
export const ageTeamPlayers = (team: Team): Team => {
    return {
        ...team,
        players: team.players.map(p => ({
            ...p,
            age: p.age + 1
        }))
    };
};

// Determine if a player should retire
export const shouldRetire = (player: AIPlayer): boolean => {
    // Mandatory retirement at 37+
    if (player.age >= 37) return true;

    // Increasing chance of retirement after 33
    if (player.age >= 33) {
        const retirementChance = (player.age - 32) * 0.15; // 15% per year after 33

        // Lower rated players more likely to retire early
        const ratingModifier = player.rating < 60 ? 0.2 : 0;

        return Math.random() < (retirementChance + ratingModifier);
    }

    // Rare early retirement due to injury (very low chance)
    if (player.age >= 25 && player.rating < 50) {
        return Math.random() < 0.03; // 3% chance for struggling players
    }

    return false;
};

// Remove retired players from team
export const removeRetiredPlayers = (team: Team): { team: Team; retiredCount: number } => {
    const activePlayers = team.players.filter(p => !shouldRetire(p));
    const retiredCount = team.players.length - activePlayers.length;

    return {
        team: {
            ...team,
            players: activePlayers
        },
        retiredCount
    };
};

// Generate a new young player (18-21) to fill roster spots
const generateYoungPlayer = (position: Position, subPosition: string): AIPlayer => {
    const age = 18 + Math.floor(Math.random() * 4); // 18-21
    const potential = 65 + Math.floor(Math.random() * 25); // 65-90
    const baseRating = 45 + Math.floor(Math.random() * 15); // 45-60 (raw talent)
    const finalRating = Math.min(baseRating, potential - 10);
    const attributes = generateAIPlayerAttributes(finalRating, position);

    return {
        name: getRandomName(),
        position,
        subPosition,
        age,
        potential,
        rating: finalRating,
        attributes
    };
};

// Fill empty roster spots with young players or draft picks
export const fillRosterGaps = (
    team: Team,
    draftPicks?: DraftProspect[]
): Team => {
    const currentPlayers = [...team.players];
    const targetRosterSize = 22; // Standard AFL roster
    const spotsToFill = targetRosterSize - currentPlayers.length;

    if (spotsToFill <= 0) return team;

    // Try to fill with draft picks first (if available)
    let picksUsed = 0;
    if (draftPicks && draftPicks.length > 0) {
        for (let i = 0; i < Math.min(spotsToFill, draftPicks.length); i++) {
            const pick = draftPicks[i];
            currentPlayers.push({
                name: pick.name,
                position: pick.position,
                subPosition: pick.subPosition,
                age: pick.age,
                potential: pick.potential,
                rating: pick.rating,
                attributes: pick.attributes // Draft prospects already have attributes
            });
            picksUsed++;
        }
    }

    // Fill remaining spots with generated young players
    const remainingSpots = spotsToFill - picksUsed;
    for (let i = 0; i < remainingSpots; i++) {
        // Find which position we're missing by comparing to roster template
        const positionIndex = currentPlayers.length % ROSTER_TEMPLATE.length;
        const templateSlot = ROSTER_TEMPLATE[positionIndex];

        currentPlayers.push(generateYoungPlayer(templateSlot.pos, templateSlot.sub));
    }

    return {
        ...team,
        players: currentPlayers
    };
};

// Simulate player development/decline based on age
export const developPlayer = (player: AIPlayer): AIPlayer => {
    let ratingChange = 0;

    // Development phase (18-25): Players improve toward potential
    if (player.age <= 25) {
        const growthRoom = player.potential - player.rating;
        if (growthRoom > 0) {
            // 40% chance to improve, larger growth for younger players
            if (Math.random() < 0.4) {
                const maxGrowth = player.age <= 21 ? 3 : 2;
                ratingChange = 1 + Math.floor(Math.random() * maxGrowth);
            }
        }
    }

    // Peak phase (26-30): Minimal change, slight improvements possible
    else if (player.age <= 30) {
        const growthRoom = player.potential - player.rating;
        if (growthRoom > 0 && Math.random() < 0.2) {
            ratingChange = 1;
        }
    }

    // Decline phase (31+): Players gradually decline
    else {
        const declineRate = (player.age - 30) * 0.15; // Accelerating decline
        if (Math.random() < declineRate) {
            ratingChange = -1 - Math.floor(Math.random() * 2); // -1 to -2
        }
    }

    const newRating = Math.max(40, Math.min(player.potential, player.rating + ratingChange));

    return {
        ...player,
        rating: newRating
    };
};

// Process full roster turnover for a team (called each season)
export const processSeasonRosterTurnover = (
    team: Team,
    draftPicks?: DraftProspect[]
): { team: Team; changes: string[] } => {
    const changes: string[] = [];

    // Step 1: Age all players
    let updatedTeam = ageTeamPlayers(team);

    // Step 2: Remove retired players
    const retirementResult = removeRetiredPlayers(updatedTeam);
    updatedTeam = retirementResult.team;
    if (retirementResult.retiredCount > 0) {
        changes.push(`${retirementResult.retiredCount} player(s) retired`);
    }

    // Step 3: Develop/decline remaining players
    updatedTeam = {
        ...updatedTeam,
        players: updatedTeam.players.map(developPlayer)
    };

    // Step 4: Fill roster gaps with draft picks or free agents
    const beforeFill = updatedTeam.players.length;
    updatedTeam = fillRosterGaps(updatedTeam, draftPicks);
    const addedPlayers = updatedTeam.players.length - beforeFill;
    if (addedPlayers > 0) {
        changes.push(`${addedPlayers} new player(s) added`);
    }

    // Step 5: Reset team record for new season
    updatedTeam = {
        ...updatedTeam,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        percentage: 100
    };

    return {
        team: updatedTeam,
        changes
    };
};

// Process entire league roster turnover
export const processLeagueRosterTurnover = (
    league: Team[],
    tier: LeagueTier,
    completedDraft?: { picks: { teamName: string; prospect: DraftProspect }[] }
): { league: Team[]; summary: string[] } => {
    const summary: string[] = [];

    const updatedLeague = league.map(team => {
        // Find draft picks for this team (if any)
        const teamDraftPicks = completedDraft?.picks
            .filter(p => p.teamName === team.name)
            .map(p => p.prospect) || [];

        const result = processSeasonRosterTurnover(team, teamDraftPicks);

        if (result.changes.length > 0) {
            summary.push(`${team.name}: ${result.changes.join(', ')}`);
        }

        return result.team;
    });

    return {
        league: updatedLeague,
        summary
    };
};
