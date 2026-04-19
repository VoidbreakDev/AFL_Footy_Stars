import { PlayerProfile, StoryArc } from '../types';

/**
 * v1.3 Legacy Score Calculation — 6-pillar weighted formula
 */
export const calculateLegacyScore = (player: PlayerProfile): number => {
  const careerStats = player.careerStats || { matches: 0, goals: 0, disposals: 0, tackles: 0, votes: 0 };
  const mediaRep = player.mediaReputation;
  const fanFollowers = mediaRep?.fanFollowers || 0;
  const mediaScore = mediaRep?.score || 0;

  // ===== 1. Statistical Dominance (25%, max 250) =====
  let statsScore = 0;
  // Disposals: benchmark 5000 for max
  statsScore += Math.min(careerStats.disposals / 5000, 1) * 62.5;
  // Goals: benchmark 1000 for max
  statsScore += Math.min(careerStats.goals / 1000, 1) * 62.5;
  // Tackles: benchmark 2000 for max
  statsScore += Math.min(careerStats.tackles / 2000, 1) * 62.5;
  // Votes: benchmark 500 for max
  statsScore += Math.min(careerStats.votes / 500, 1) * 62.5;

  // ===== 2. Awards & Recognition (20%, max 200) =====
  let awardsScore = 0;
  const careerHistory = player.careerHistory || [];
  const allAwards = careerHistory.flatMap(h => h.awards || []);

  allAwards.forEach(award => {
    switch (award.type) {
      case 'BROWNLOW_MEDAL': awardsScore += 30; break;
      case 'COLEMAN_MEDAL': awardsScore += 25; break;
      case 'ALL_AUSTRALIAN': awardsScore += 15; break;
      case 'CLUB_BEST_AND_FAIREST': awardsScore += 10; break;
      case 'RISING_STAR': awardsScore += 20; break;
      default: awardsScore += 8; break;
    }
  });

  const premierships = careerHistory.filter(h => h.grandFinalWon || h.premiership).length;
  awardsScore += premierships * 25;
  awardsScore = Math.min(awardsScore, 200);

  // ===== 3. Longevity (15%, max 150) =====
  let longevityScore = 0;
  const matchesPlayed = careerStats.matches || 0;
  const seasonsPlayed = player.seasonsPlayed || 0;

  // Matches: max at 300
  longevityScore += Math.min(matchesPlayed / 300, 1) * 75;
  // Seasons: max at 15
  longevityScore += Math.min(seasonsPlayed / 15, 1) * 50;
  // Tier reached: AFL = max
  const aflSeasons = careerHistory.filter(h => h.tier === 'NATIONAL').length;
  longevityScore += Math.min(aflSeasons / 10, 1) * 25;
  longevityScore = Math.min(longevityScore, 150);

  // ===== 4. Narrative Impact (20%, max 200) =====
  let narrativeScore = 0;
  const completedArcs = player.completedStoryArcs || [];
  const activeArcs = player.activeStoryArcs || [];

  completedArcs.forEach(arc => {
    if (arc.outcome === 'POSITIVE') narrativeScore += 20;
    else if (arc.outcome === 'NEUTRAL') narrativeScore += 10;
    else narrativeScore += 5;
  });
  activeArcs.forEach(arc => {
    // Partial credit for in-progress arcs
    const actProgress = arc.currentAct === 'SETUP' ? 0.25 : arc.currentAct === 'ESCALATION' ? 0.5 : 0.75;
    narrativeScore += arc.legacyImpact * actProgress;
  });
  narrativeScore = Math.min(narrativeScore, 200);

  // ===== 5. Community & Media (10%, max 100) =====
  let communityScore = 0;
  // Media reputation (0-100 scale, max at 80)
  communityScore += Math.min(mediaScore / 80, 1) * 50;
  // Fan followers (max at 1M)
  communityScore += Math.min(fanFollowers / 1000000, 1) * 30;
  // Milestone bonus for community achievements
  const communityMilestones = player.milestones?.filter(m => m.type === 'NARRATIVE').length || 0;
  communityScore += Math.min(communityMilestones * 5, 20);
  communityScore = Math.min(communityScore, 100);

  // ===== 6. Leadership (10%, max 100) =====
  let leadershipScore = 0;
  if (player.isCaptain) {
    leadershipScore += 30;
    leadershipScore += Math.min((player.captaincyYear || 0) * 5, 20);
  }
  // Chemistry events resolved positively
  const teamChemistry = player.teamChemistry;
  if (teamChemistry) {
    const chemistryBonus = teamChemistry.overallChemistry > 70 ? 20 : teamChemistry.overallChemistry > 40 ? 10 : 0;
    leadershipScore += chemistryBonus;
  }
  // Mentor relationships (teammates where player is mentor)
  const mentees = player.teammates?.filter(t => t.mentee).length || 0;
  leadershipScore += Math.min(mentees * 10, 30);
  leadershipScore = Math.min(leadershipScore, 100);

  // ===== Weighted Total =====
  const total = Math.round(
    statsScore * 0.25 +
    awardsScore * 0.20 +
    longevityScore * 0.15 +
    narrativeScore * 0.20 +
    communityScore * 0.10 +
    leadershipScore * 0.10
  );

  return Math.min(total, 1000);
};

export const getLegacyTier = (score: number): { tier: number; title: string; unlocks: string[] } => {
  if (score >= 850) return { tier: 6, title: 'AFL Icon', unlocks: ['Post-career path unlocks', 'Farewell tribute event'] };
  if (score >= 650) return { tier: 5, title: 'Club Legend', unlocks: ['Club history record eligible', 'Hall of Fame path opens', 'LEGACY_CHASE arc fires'] };
  if (score >= 450) return { tier: 4, title: 'Fan Favourite', unlocks: ['All-Australian consideration', 'Media always friendly'] };
  if (score >= 250) return { tier: 3, title: 'Club Stalwart', unlocks: ['Jersey retirement consideration', 'Fan milestone triggered'] };
  if (score >= 100) return { tier: 2, title: 'Promising Talent', unlocks: ['Nickname pool expands', 'Improved contract role'] };
  return { tier: 1, title: 'Journeyman', unlocks: ['Career started'] };
};

export const getLegacyBreakdown = (player: PlayerProfile): { stats: number; awards: number; longevity: number; narrative: number; community: number; leadership: number } => {
  const score = calculateLegacyScore(player);
  // Approximate breakdown by re-running components
  const careerStats = player.careerStats || { matches: 0, goals: 0, disposals: 0, tackles: 0, votes: 0 };
  const mediaRep = player.mediaReputation;
  const fanFollowers = mediaRep?.fanFollowers || 0;
  const mediaScore = mediaRep?.score || 0;
  const careerHistory = player.careerHistory || [];
  const allAwards = careerHistory.flatMap(h => h.awards || []);
  const premierships = careerHistory.filter(h => h.grandFinalWon || h.premiership).length;

  let statsScore = 0;
  statsScore += Math.min(careerStats.disposals / 5000, 1) * 62.5;
  statsScore += Math.min(careerStats.goals / 1000, 1) * 62.5;
  statsScore += Math.min(careerStats.tackles / 2000, 1) * 62.5;
  statsScore += Math.min(careerStats.votes / 500, 1) * 62.5;

  let awardsScore = 0;
  allAwards.forEach(award => {
    switch (award.type) {
      case 'BROWNLOW_MEDAL': awardsScore += 30; break;
      case 'COLEMAN_MEDAL': awardsScore += 25; break;
      case 'ALL_AUSTRALIAN': awardsScore += 15; break;
      case 'CLUB_BEST_AND_FAIREST': awardsScore += 10; break;
      case 'RISING_STAR': awardsScore += 20; break;
      default: awardsScore += 8; break;
    }
  });
  awardsScore += premierships * 25;
  awardsScore = Math.min(awardsScore, 200);

  const seasonsPlayed = player.seasonsPlayed || 0;
  let longevityScore = 0;
  longevityScore += Math.min(careerStats.matches / 300, 1) * 75;
  longevityScore += Math.min(seasonsPlayed / 15, 1) * 50;
  const aflSeasons = careerHistory.filter(h => h.tier === 'NATIONAL').length;
  longevityScore += Math.min(aflSeasons / 10, 1) * 25;
  longevityScore = Math.min(longevityScore, 150);

  const completedArcs = player.completedStoryArcs || [];
  let narrativeScore = 0;
  completedArcs.forEach(arc => {
    if (arc.outcome === 'POSITIVE') narrativeScore += 20;
    else if (arc.outcome === 'NEUTRAL') narrativeScore += 10;
    else narrativeScore += 5;
  });
  narrativeScore = Math.min(narrativeScore, 200);

  let communityScore = 0;
  communityScore += Math.min(mediaScore / 80, 1) * 50;
  communityScore += Math.min(fanFollowers / 1000000, 1) * 30;
  communityScore = Math.min(communityScore, 100);

  let leadershipScore = 0;
  if (player.isCaptain) leadershipScore += 30;
  if (player.teamChemistry && player.teamChemistry.overallChemistry > 70) leadershipScore += 20;
  else if (player.teamChemistry && player.teamChemistry.overallChemistry > 40) leadershipScore += 10;
  leadershipScore += Math.min((player.teammates?.filter(t => t.mentee).length || 0) * 10, 30);
  leadershipScore = Math.min(leadershipScore, 100);

  return {
    stats: Math.round(statsScore * 0.25),
    awards: Math.round(awardsScore * 0.20),
    longevity: Math.round(longevityScore * 0.15),
    narrative: Math.round(narrativeScore * 0.20),
    community: Math.round(communityScore * 0.10),
    leadership: Math.round(leadershipScore * 0.10),
  };
};
