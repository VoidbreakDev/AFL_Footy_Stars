import { Team, Fixture, LeagueTier, Position, MatchResult, Stadium } from '../types';
import { TEAM_NAMES_LOCAL, FIRST_NAMES, LAST_NAMES, SEASON_LENGTH, STADIUM_TEMPLATES } from '../constants';

// Template for a balanced 22-man squad with specific positions
export const ROSTER_TEMPLATE = [
    { pos: Position.DEFENDER, sub: 'FB' },
    { pos: Position.DEFENDER, sub: 'BP' },
    { pos: Position.DEFENDER, sub: 'BP' },
    { pos: Position.DEFENDER, sub: 'CHB' },
    { pos: Position.DEFENDER, sub: 'HBF' },
    { pos: Position.DEFENDER, sub: 'HBF' },
    { pos: Position.MIDFIELDER, sub: 'C' },
    { pos: Position.MIDFIELDER, sub: 'W' },
    { pos: Position.MIDFIELDER, sub: 'W' },
    { pos: Position.RUCK, sub: 'RUCK' },
    { pos: Position.MIDFIELDER, sub: 'RR' }, // Ruck Rover
    { pos: Position.MIDFIELDER, sub: 'ROV' }, // Rover
    { pos: Position.FORWARD, sub: 'CHF' },
    { pos: Position.FORWARD, sub: 'HFF' },
    { pos: Position.FORWARD, sub: 'HFF' },
    { pos: Position.FORWARD, sub: 'FF' },
    { pos: Position.FORWARD, sub: 'FP' },
    { pos: Position.FORWARD, sub: 'FP' },
    { pos: Position.MIDFIELDER, sub: 'INT' }, // Interchange
    { pos: Position.DEFENDER, sub: 'INT' },
    { pos: Position.FORWARD, sub: 'INT' },
    { pos: Position.RUCK, sub: 'INT' },
];

// Helper to generate random name
export const getRandomName = () => {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${first} ${last}`;
};

// Helper to generate a stadium
const generateStadium = (teamName: string, tier: LeagueTier): Stadium => {
    const template = STADIUM_TEMPLATES[tier] || STADIUM_TEMPLATES[LeagueTier.LOCAL];
    const suffix = template.suffixes[Math.floor(Math.random() * template.suffixes.length)];
    
    // Generate capacity within range, rounded to nearest 100
    const rawCap = template.minCap + Math.floor(Math.random() * (template.maxCap - template.minCap));
    const capacity = Math.round(rawCap / 100) * 100;

    const type = template.types[Math.floor(Math.random() * template.types.length)] as any;
    
    return {
        name: `${teamName} ${suffix}`,
        capacity,
        type,
        turfQuality: Math.random() > 0.8 ? 'Elite' : Math.random() > 0.4 ? 'Good' : 'Average'
    };
};

// Helper to generate random teams with balanced rosters
export const generateLeague = (tier: LeagueTier): Team[] => {
  const names = TEAM_NAMES_LOCAL;
  return names.map((name, i) => {
      // Generate players based on template
      const players = ROSTER_TEMPLATE.map((slot, j) => ({
          name: getRandomName(), // Uses real names now
          position: slot.pos,
          subPosition: slot.sub,
          rating: 50 + Math.floor(Math.random() * 40)
      }));

      // Procedural Stadium
      const stadium = generateStadium(name, tier);

      return {
        id: `team-${i}`,
        name: tier === LeagueTier.NATIONAL ? `${name} FC` : `${name} District`,
        wins: 0,
        losses: 0,
        draws: 0,
        percentage: 100,
        points: 0,
        players: players,
        coach: `Coach ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
        stadium: stadium,
        colors: [
        ['#e11d48', '#ffffff'], // Red
        ['#2563eb', '#ffffff'], // Blue
        ['#16a34a', '#facc15'], // Green/Gold
        ['#facc15', '#000000'], // Yellow/Black
        ['#ffffff', '#000000'], // B&W
        ['#9333ea', '#ffffff'], // Purple
        ['#ea580c', '#1e293b'], // Orange
        ['#475569', '#ffffff']  // Slate
        ][i % 8] as [string, string]
    };
  });
};

// Double Round Robin Fixture Generator
export const generateFixtures = (teams: Team[]): Fixture[] => {
  const fixtures: Fixture[] = [];
  const numTeams = teams.length;
  const teamIds = teams.map(t => t.id);
  
  // SIMPLER APPROACH: Generate Single RR, then duplicate and swap
  const singleRRFixtures: Fixture[] = [];
  for (let r = 0; r < numTeams - 1; r++) {
      const rotating = teamIds.slice(1);
      const rotated = [
          ...rotating.slice(rotating.length - r),
          ...rotating.slice(0, rotating.length - r)
      ];
      const currentRoundTeams = [teamIds[0], ...rotated];
      
      for(let i=0; i<numTeams/2; i++) {
          const t1 = currentRoundTeams[i];
          const t2 = currentRoundTeams[numTeams-1-i];
          
          // Alternate home/away for the fixed team
          let home = t1; 
          let away = t2;
          if (i === 0 && r % 2 === 1) { home = t2; away = t1; }
          
          // Randomize others for variety or keep static. 
          if (i !== 0 && r % 2 === 0) { home = t2; away = t1; }

          singleRRFixtures.push({
              round: r + 1,
              homeTeamId: home,
              awayTeamId: away,
              played: false,
              matchType: 'League'
          });
      }
  }

  // Second half
  const doubleRRFixtures: Fixture[] = [];
  singleRRFixtures.forEach(f => {
      doubleRRFixtures.push(f);
      // Return leg
      doubleRRFixtures.push({
          round: f.round + (numTeams - 1),
          homeTeamId: f.awayTeamId, // Swap
          awayTeamId: f.homeTeamId,
          played: false,
          matchType: 'League'
      });
  });

  return doubleRRFixtures.sort((a,b) => a.round - b.round);
};

// --- HELPER: Calculate Ladder Logic ---
export const updateLadderTeam = (team: Team, result: MatchResult, isHome: boolean, matchType?: string): Team => {
    const won = (isHome && result.winnerId === team.id) || (!isHome && result.winnerId === team.id);
    const lost = (isHome && result.winnerId !== team.id && result.winnerId !== null) || (!isHome && result.winnerId !== team.id && result.winnerId !== null);
    const draw = result.winnerId === null;

    const myScore = isHome ? result.homeScore.total : result.awayScore.total;
    const oppScore = isHome ? result.awayScore.total : result.homeScore.total;

    // DO NOT update ladder points for finals matches
    // Check matchType to determine if this is a finals match (Semi Final or Grand Final)
    if (matchType === 'Semi Final' || matchType === 'Grand Final') return team;

    return {
        ...team,
        wins: team.wins + (won ? 1 : 0),
        losses: team.losses + (lost ? 1 : 0),
        draws: team.draws + (draw ? 1 : 0),
        points: team.points + (won ? 4 : draw ? 2 : 0),
        percentage: team.percentage + ((myScore - oppScore) * 0.1)
    };
};

// --- FINALS LOGIC ---
export const generateSemiFinals = (currentLeague: Team[], currentFixtures: Fixture[]) => {
    // 1. Sort League to get Top 4
    const sortedTeams = [...currentLeague].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.percentage - a.percentage;
    });

    const top4 = sortedTeams.slice(0, 4);
    
    // SF1: 1st vs 4th
    // SF2: 2nd vs 3rd
    const sf1: Fixture = {
        round: SEASON_LENGTH + 1,
        homeTeamId: top4[0].id,
        awayTeamId: top4[3].id,
        played: false,
        matchType: 'Semi Final'
    };

    const sf2: Fixture = {
        round: SEASON_LENGTH + 1,
        homeTeamId: top4[1].id,
        awayTeamId: top4[2].id,
        played: false,
        matchType: 'Semi Final'
    };

    return [...currentFixtures, sf1, sf2];
};

export const generateGrandFinal = (currentFixtures: Fixture[]) => {
    // Find Semi Final results
    const semis = currentFixtures.filter(f => f.round === SEASON_LENGTH + 1);
    if (semis.length !== 2) return currentFixtures; // Error or not ready

    const getWinnerId = (fix: Fixture) => fix.result?.winnerId;
    const w1 = getWinnerId(semis[0]);
    const w2 = getWinnerId(semis[1]);

    if (w1 && w2) {
        const gf: Fixture = {
            round: SEASON_LENGTH + 2,
            homeTeamId: w1,
            awayTeamId: w2,
            played: false,
            matchType: 'Grand Final'
        };
        return [...currentFixtures, gf];
    }
    return currentFixtures;
};