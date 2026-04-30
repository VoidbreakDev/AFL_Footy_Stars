import { Team, PlayerProfile, TeamChemistry, MatchEvent, MatchContext } from '../types';

// Helper function to calculate the average rating of a team
export function calculateTeamRating(team: Team): number {
  if (!team.players || team.players.length === 0) return 50;
  
  const validPlayers = team.players.filter(p => p && p.attributes);
  if (validPlayers.length === 0) return 50;

  const totalRating = validPlayers.reduce((sum, player) => {
    const playerRating = (player.attributes.kicking + player.attributes.handball +
      player.attributes.tackling + player.attributes.marking +
      player.attributes.speed + player.attributes.stamina) / 6;
    return sum + playerRating;
  }, 0);
  
  return Math.round(totalRating / validPlayers.length);
}

// Function to simulate a contested possession battle
export function contestedPossessionBattle(
  homeTeam: Team,
  awayTeam: Team,
  homePlayer?: PlayerProfile
): 'HOME' | 'AWAY' | 'EVEN' {
  // Get top 4 players by rating for each team
  const getTopPlayers = (team: Team) => {
    return [...team.players]
      .filter(p => p && p.attributes)
      .sort((a, b) => {
        const aRating = ((a.attributes?.kicking || 0) + (a.attributes?.handball || 0) +
          (a.attributes?.tackling || 0) + (a.attributes?.marking || 0) +
          (a.attributes?.speed || 0) + (a.attributes?.stamina || 0)) / 6;
        const bRating = ((b.attributes?.kicking || 0) + (b.attributes?.handball || 0) +
          (b.attributes?.tackling || 0) + (b.attributes?.marking || 0) +
          (b.attributes?.speed || 0) + (b.attributes?.stamina || 0)) / 6;
        return bRating - aRating;
      })
      .slice(0, 4);
  };

  const homeTopPlayers = getTopPlayers(homeTeam);
  const awayTopPlayers = getTopPlayers(awayTeam);

  // Calculate home team score
  let homeScore = homeTopPlayers.reduce((sum, player) => {
    const playerRating = ((player.attributes?.kicking || 0) + (player.attributes?.handball || 0) +
      (player.attributes?.tackling || 0) + (player.attributes?.marking || 0) +
      (player.attributes?.speed || 0) + (player.attributes?.stamina || 0)) / 6;
    return sum + playerRating;
  }, 0);

  // Add home player contribution if provided
  if (homePlayer) {
    const playerContribution = (homePlayer.attributes.stamina + homePlayer.attributes.handball) / 2;
    homeScore += playerContribution * 0.3;
  }

  // Calculate away team score
  const awayScore = awayTopPlayers.reduce((sum, player) => {
    const playerRating = ((player.attributes?.kicking || 0) + (player.attributes?.handball || 0) +
      (player.attributes?.tackling || 0) + (player.attributes?.marking || 0) +
      (player.attributes?.speed || 0) + (player.attributes?.stamina || 0)) / 6;
    return sum + playerRating;
  }, 0);

  // Add natural variance
  const variance = (Math.random() * 15) - 7.5;
  const diff = (homeScore - awayScore) + variance;

  if (diff > 5) return 'HOME';
  if (diff < -5) return 'AWAY';
  return 'EVEN';
}

// Function to simulate a zone defence battle
export function zoneDefenceBattle(homeTeam: Team, awayTeam: Team): 'HOME' | 'AWAY' | 'EVEN' {
  // Get bottom half of each roster by rating
  const getBottomHalf = (team: Team) => {
    return [...team.players]
      .filter(p => p && p.attributes)
      .sort((a, b) => {
        const aRating = ((a.attributes?.kicking || 0) + (a.attributes?.handball || 0) +
          (a.attributes?.tackling || 0) + (a.attributes?.marking || 0) +
          (a.attributes?.speed || 0) + (a.attributes?.stamina || 0)) / 6;
        const bRating = ((b.attributes?.kicking || 0) + (b.attributes?.handball || 0) +
          (b.attributes?.tackling || 0) + (b.attributes?.marking || 0) +
          (b.attributes?.speed || 0) + (b.attributes?.stamina || 0)) / 6;
        return bRating - aRating;
      })
      .slice(Math.floor(team.players.length / 2));
  };

  const homeBottomHalf = getBottomHalf(homeTeam);
  const awayBottomHalf = getBottomHalf(awayTeam);

  // Calculate home team score
  const homeScore = homeBottomHalf.reduce((sum, player) => {
    const playerRating = ((player.attributes?.kicking || 0) + (player.attributes?.handball || 0) +
      (player.attributes?.tackling || 0) + (player.attributes?.marking || 0) +
      (player.attributes?.speed || 0) + (player.attributes?.stamina || 0)) / 6;
    return sum + playerRating;
  }, 0);

  // Calculate away team score
  const awayScore = awayBottomHalf.reduce((sum, player) => {
    const playerRating = ((player.attributes?.kicking || 0) + (player.attributes?.handball || 0) +
      (player.attributes?.tackling || 0) + (player.attributes?.marking || 0) +
      (player.attributes?.speed || 0) + (player.attributes?.stamina || 0)) / 6;
    return sum + playerRating;
  }, 0);

  // Add natural variance
  const variance = (Math.random() * 12) - 6;
  const diff = (homeScore - awayScore) + variance;

  if (diff > 4) return 'HOME';
  if (diff < -4) return 'AWAY';
  return 'EVEN';
}

// Function to calculate synergy multiplier based on team chemistry
export function synergyMultiplier(homeChemistry?: TeamChemistry, awayChemistry?: TeamChemistry): number {
  const homeScore = homeChemistry?.overallChemistry ?? 50;
  const awayScore = awayChemistry?.overallChemistry ?? 50;

  const delta = ((homeScore - awayScore) / 100) * 20;
  return Math.max(-20, Math.min(20, delta));
}

// Function to build match context from team data
export function buildMatchContext(
  homeTeam: Team,
  awayTeam: Team,
  player?: PlayerProfile,
  pressureLevel?: number,
  playerTeamChemistry?: TeamChemistry,
  opponentChemistry?: TeamChemistry
): MatchContext {
  const contestedPossession = contestedPossessionBattle(homeTeam, awayTeam, player);
  const zoneDefence = zoneDefenceBattle(homeTeam, awayTeam);
  const synergyDelta = synergyMultiplier(playerTeamChemistry, opponentChemistry);
  const homeRating = calculateTeamRating(homeTeam);
  const awayRating = calculateTeamRating(awayTeam);

  return {
    contestedPossessionWinner: contestedPossession,
    defenceAdvantage: zoneDefence,
    synergyDelta,
    pressureRating: pressureLevel ?? 0,
    homeTeamRating: homeRating,
    awayTeamRating: awayRating,
    ratingDifferential: homeRating - awayRating,
  };
}

// Function to generate a battle report based on match context
export function generateBattleReport(
  ctx: MatchContext,
  homeTeamName: string,
  awayTeamName: string
): string[] {
  const report: string[] = [];

  // Contested possession report
  if (ctx.contestedPossessionWinner === 'HOME') {
    report.push(`${homeTeamName} dominated contested possessions, controlling the midfield battle.`);
  } else if (ctx.contestedPossessionWinner === 'AWAY') {
    report.push(`${awayTeamName} controlled the midfield, outplaying ${homeTeamName} in contested battles.`);
  } else {
    report.push(`The midfield battle was evenly contested between ${homeTeamName} and ${awayTeamName}.`);
  }

  // Zone defence report
  if (ctx.defenceAdvantage !== 'EVEN') {
    const winner = ctx.defenceAdvantage === 'HOME' ? homeTeamName : awayTeamName;
    const loser = ctx.defenceAdvantage === 'HOME' ? awayTeamName : homeTeamName;
    report.push(`${winner} held firm in their defensive zone, limiting ${loser}'s forward entries.`);
  }

  // Synergy report
  if (Math.abs(ctx.synergyDelta) > 8) {
    const leadingTeam = ctx.synergyDelta > 0 ? homeTeamName : awayTeamName;
    const trailingTeam = ctx.synergyDelta > 0 ? awayTeamName : homeTeamName;
    report.push(`${leadingTeam}'s teamwork gave them a ${Math.abs(ctx.synergyDelta)}% advantage over ${trailingTeam}.`);
  }

  // Team rating gap report
  const ratingDiff = ctx.homeTeamRating - ctx.awayTeamRating;
  if (Math.abs(ratingDiff) > 8) {
    const strongerTeam = ratingDiff > 0 ? homeTeamName : awayTeamName;
    const weakerTeam = ratingDiff > 0 ? awayTeamName : homeTeamName;
    report.push(`${strongerTeam} outrated ${weakerTeam} by ${Math.abs(ratingDiff)} points overall.`);
  }

  return report;
}

// Function to calculate highlight score for a match event
export function contextHighlightScore(
  event: MatchEvent,
  quarter: number,
  scoreDiff: number,
  isFinals: boolean
): number {
  // Base scores by event type
  let score = 0;
  switch (event.type) {
    case 'GOAL':
      score = 8;
      break;
    case 'BEHIND':
      score = 1;
      break;
    case 'MARK':
      score = 4;
      break;
    case 'TACKLE':
      score = 3;
      break;
    case 'INJURY':
      score = 7;
      break;
    case 'RIVALRY':
      score = 9;
      break;
    case 'ONE_ON_ONE':
      score = 5;
      break;
    case 'ONE_ON_ONE_DEFENSIVE':
      score = 4;
      break;
    case 'INTERCEPT':
      score = 6;
      break;
    case 'HIT_OUT':
      score = 4;
      break;
    case 'POSSESSION':
      score = 2;
      break;
    case 'TURNOVER':
      score = 2;
      break;
    case 'FREE_KICK':
      score = 2;
      break;
    case 'GENERIC':
      score = 1;
      break;
  }

  // Player involved modifier
  if (event.isPlayerInvolved) {
    score += 3;
  }

  // Finals modifier
  if (isFinals) {
    score *= 1.5;
  }

  // Quarter modifiers
  if (quarter === 4) {
    score *= 1.3;
  } else if (quarter === 3) {
    score *= 1.1;
  }

  // Comeback goal modifier
  if (event.type === 'GOAL' && event.isPlayerInvolved && scoreDiff < 0) {
    score += 5;
  }

  // Clutch goal modifier
  if (event.type === 'GOAL' && event.isPlayerInvolved && scoreDiff >= -6 && scoreDiff < 0) {
    score += 4;
  }

  // Injury in finals modifier
  if (event.type === 'INJURY' && isFinals) {
    score += 3;
  }

  return Math.round(score);
}
