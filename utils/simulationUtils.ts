
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position, Tactic, CultureType, PlayerPersonality } from '../types';

export const INJURY_TYPES = [
  { name: "Hamstring Strain", weeks: 2 },
  { name: "Rolled Ankle", weeks: 1 },
  { name: "Concussion", weeks: 1 },
  { name: "ACL Tear", weeks: 10 }, // Season ender usually
  { name: "Calf Strain", weeks: 2 },
  { name: "Shoulder Dislocation", weeks: 4 }
];

export const PHRASES = {
    GOAL: [
        "slots it through!", "kicks a beauty from 50!", "snaps truly around the body!", "never looked like missing.", 
        "drills it through the big sticks!", "kicks a miracle goal from the pocket!", "sails through post-high!"
    ],
    BEHIND: [
        "misses to the left.", "hits the post!", "touched off the boot.", "pushes it wide.", 
        "just scrapes the paint.", "fades late and misses."
    ],
    MARK: [
        "takes a hanger!", "clunks a big contested mark.", "reads the flight well.", "intercepts the pass.", 
        "strong hands overhead.", "flies over the pack!"
    ],
    TACKLE: [
        "lays a bone-crunching tackle!", "holding the ball!", "stops them in their tracks.", 
        "run down from behind!", "wraps them up perfectly."
    ],
    POSSESSION: [
        "collects the loose ball.", "bursts out of the stoppage.", "delivers a lace-out pass.", 
        "finds space on the wing.", "drives it long inside 50.", "wins the hard ball."
    ],
    TURNOVER: [
        "turns it over cheaply.", "kicks it straight to the opposition.", "fumbles at the crucial moment.", 
        "intercepted by the defender.", "misses the target completely."
    ],
    FREE_KICK: [
        "earns a free kick for high contact.", "caught holding the ball!", "push in the back.", 
        "chopped the arms.", "umpire pays the free kick."
    ],
    GENERIC: [
        "The crowd is roaring.", "Tension building here.", "Great passage of play.",
        "Hard ball get in the middle.", "Clearance from the stoppage.", "Arm wrestle in the midfield."
    ],
    HIT_OUT: [
        'wins the tap cleanly!',
        'dominates the ruck contest',
        'gets first hands to it in the centre',
        'tips it to advantage with a powerful jump',
        'outmuscles the opposition ruckman'
    ],
    INTERCEPT: [
        'reads it brilliantly and intercepts!',
        'cuts off the kick with perfect positioning',
        'picks it off at full pace',
        'anticipates the play and takes the ball',
        'flies in for the intercept mark'
    ],
    ONE_ON_ONE: [
        'wins the one-on-one contest!',
        'beats the defender with a quick step',
        'outmarks his opponent in the air',
        'uses his body well to take the ball',
        'wins the physical battle'
    ],
    ONE_ON_ONE_DEFENSIVE: [
        'locks down the opponent',
        'wins the defensive one-on-one',
        'forces the turnover with great pressure',
        'reads the play and denies the mark',
        'sticks the tackle and wins possession'
    ],
};

const CROWD_PHRASES_BY_CULTURE: Partial<Record<CultureType, string[]>> = {
    STORIED_CLUB: [
        'The faithful roar their approval!',
        'A thunderous response from the loyal faithful!',
        'Tradition demands excellence — and they deliver!'
    ],
    UNDERDOG: [
        'The believers go wild!',
        'The crowd dares to dream big tonight!',
        "This is what they've been waiting for!"
    ],
    BIG_CITY: [
        'The big city crowd erupts!',
        'The city is right behind them!',
        'A packed house absolutely loving this!'
    ],
    PREMIERSHIP_HUNGRY: [
        'They want blood — and they get it!',
        'The hungry crowd demands excellence!',
        'This is what finals footy tastes like!'
    ],
    REBUILDING: [
        'A patient crowd beginning to believe...',
        'Signs of life from the rebuilding faithful.',
        'Small moments — but big hope here tonight.'
    ],
};

// --- HELPER: Simulate CPU Match with realistic scoring ---
export const simulateCPUMatch = (homeTeam: Team, awayTeam: Team): MatchResult => {
    // Calculate team rating differential to influence scoring
    const homeRating = homeTeam.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, homeTeam.players.length);
    const awayRating = awayTeam.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, awayTeam.players.length);
    const ratingDiff = homeRating - awayRating;

    // Use normal-ish distribution via sum of randoms (Central Limit Theorem approximation)
    // Typical AFL scores: 70-110 total, ~10-16 goals, 8-14 behinds
    const randomNormal = (mean: number, std: number): number => {
        let sum = 0;
        for (let i = 0; i < 6; i++) sum += Math.random();
        return Math.round(mean + (sum - 3) * std);
    };

    // Base goals: mean ~12, std ~3 (range roughly 5-20)
    // Rating differential shifts the mean by ~0.3 goals per point of rating diff
    const homeGoalMean = 12 + ratingDiff * 0.3;
    const awayGoalMean = 12 - ratingDiff * 0.3;

    const homeGoals = Math.max(2, randomNormal(homeGoalMean, 3));
    const awayGoals = Math.max(2, randomNormal(awayGoalMean, 3));

    // Behinds: mean ~8, std ~3 (roughly 0.6-0.8 behinds per goal, realistic AFL ratio)
    const homeBehinds = Math.max(1, randomNormal(8 + homeGoals * 0.3, 3));
    const awayBehinds = Math.max(1, randomNormal(8 + awayGoals * 0.3, 3));

    const hTotal = homeGoals * 6 + homeBehinds;
    const aTotal = awayGoals * 6 + awayBehinds;

    return {
        homeScore: { goals: homeGoals, behinds: homeBehinds, total: hTotal, quarters: [] },
        awayScore: { goals: awayGoals, behinds: awayBehinds, total: aTotal, quarters: [] },
        winnerId: hTotal > aTotal ? homeTeam.id : aTotal > hTotal ? awayTeam.id : null,
        playerStats: { goals: 0, behinds: 0, disposals: 0, tackles: 0, votes: 0 },
        summary: "Simulated Match",
        timeline: [],
        topPerformers: []
    };
};

// --- MAIN SIMULATION ENGINE ---
export const calculateMatchOutcome = (
    homeTeam: Team,
    awayTeam: Team,
    player: PlayerProfile,
    currentRound: number,
    tactic: Tactic = 'BALANCED'
): MatchResult => {
      // Identify Player's Team ID for later
      const isHome = player.contract.clubName === homeTeam.name;
      const playerTeamId = isHome ? homeTeam.id : awayTeam.id;
      const playerTeamCulture = (isHome ? homeTeam : awayTeam).culture as CultureType | undefined;

      // -- TACTIC MODIFIERS --
      let playerScoringBonus = 0;
      let opponentScoringPenalty = 0;
      let extraEnergyCost = 0;

      switch (tactic) {
          case 'ATTACK':
              playerScoringBonus = 0.2;
              extraEnergyCost = 5;
              break;
          case 'DEFENSIVE':
              opponentScoringPenalty = 0.15;
              playerScoringBonus = -0.10;
              extraEnergyCost = -3;
              break;
          case 'PRESS':
              opponentScoringPenalty = 0.20;
              extraEnergyCost = 10;
              break;
          default:
              break;
      }

      // -- 0. MORALE CHECK --
      // High morale (>80) gives slight boost, Low morale (<40) gives slight nerf
      let moraleMultiplier = 1.0;
      if (player.morale > 80) moraleMultiplier = 1.1;
      else if (player.morale < 40) moraleMultiplier = 0.85;

      // -- 0.5 PERSONALITY MODIFIER --
      const personality = player.personality as PlayerPersonality | undefined;
      let personalityInjuryMod = 0; // Negative = reduced injury risk
      let consistencyMod = 0; // How much variance in performance
      let tacklingBonus = 0;
      let bigGameBonus = 0; // Bonus in important matches
      let energyDrainMod = 0; // Extra energy drain

      switch (personality) {
          case 'PROFESSIONAL':
              consistencyMod = 0.8; // More consistent (reduces variance)
              personalityInjuryMod = -0.005; // Lower injury risk
              break;
          case 'FLAIR':
              consistencyMod = 1.3; // More variance (brilliant or poor)
              personalityInjuryMod = 0.008; // Higher injury risk
              break;
          case 'WARRIOR':
              tacklingBonus = 2; // Extra tackles per game
              bigGameBonus = 1; // Better in big games
              energyDrainMod = 3; // Uses more energy
              break;
          case 'LEADER':
              bigGameBonus = 1;
              consistencyMod = 0.9;
              break;
          case 'ENIGMA':
              consistencyMod = 1.5; // Maximum variance
              break;
          default:
              break;
      }

      // -- 0.6 MATCH-DAY PRESSURE SYSTEM --
      // Identify if this is a high-pressure match
      let pressureLevel = 0; // 0 = normal, 1 = elevated, 2 = high, 3 = extreme
      const isFinals = currentRound > 14;
      const isGrandFinal = currentRound === 16;
      const isDerby = player.rivalries?.some(r => r.club === (isHome ? awayTeam.name : homeTeam.name));
      const isReturnFromInjury = player.injury && player.injury.weeksRemaining === 1;

      if (isGrandFinal) pressureLevel = 3;
      else if (isFinals) pressureLevel = 2;
      else if (isDerby) pressureLevel = 2;
      else if (isReturnFromInjury) pressureLevel = 1;

      // Pressure affects performance based on personality
      // LEADER and PROFESSIONAL handle pressure well; FLAIR and ENIGMA struggle
      let pressureModifier = 0;
      if (pressureLevel > 0) {
          const pressureWeight = pressureLevel * 0.03; // 3% per level
          switch (personality) {
              case 'LEADER':
                  pressureModifier = pressureWeight * 1.5; // Thrives under pressure
                  break;
              case 'PROFESSIONAL':
                  pressureModifier = pressureWeight * 0.5; // Slight boost
                  break;
              case 'WARRIOR':
                  pressureModifier = pressureWeight * (bigGameBonus > 0 ? 1.2 : 0.3);
                  break;
              case 'FLAIR':
                  pressureModifier = -pressureWeight * 0.8; // Struggles under pressure
                  break;
              case 'ENIGMA':
                  // 50/50 — either brilliant or terrible
                  pressureModifier = Math.random() > 0.5 ? pressureWeight * 1.5 : -pressureWeight * 1.5;
                  break;
              default:
                  pressureModifier = -pressureWeight * 0.3; // Average player slightly shrinks
                  break;
          }
      }

      // -- 1. INJURY CHECK --
      let injuryData: PlayerInjury | undefined = undefined;
      let injuryQuarter = 0; // 0 = No injury
      
      // Base chance of injury (e.g., 1.5%). Modified by personality.
      const injuryChance = 0.015 + personalityInjuryMod;
      if (Math.random() < injuryChance) {
          const type = INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)];
          injuryData = {
              name: type.name,
              weeksRemaining: type.weeks
          };
          injuryQuarter = Math.floor(Math.random() * 4) + 1;
      }

      // -- 2. DECIDE PLAYER STATS FIRST --
      // Base Calculations
      let pDisposalsRaw = Math.floor(Math.random() * 15) + (player.attributes.stamina / 8) + (player.attributes.speed / 8) + (player.attributes.handball / 10);
      let pGoalsRaw = player.position === Position.FORWARD
          ? Math.floor(Math.random() * 4) + (player.attributes.kicking > 50 ? 1 : 0) + (player.attributes.goalSense / 20)
          : Math.floor(Math.random() * 1.5) + (player.attributes.goalSense / 40);
      let pBehindsRaw = Math.floor(Math.random() * 3);
      let pTacklesRaw = Math.floor(Math.random() * 4) + (player.attributes.tackling / 10) + tacklingBonus;

      // Apply consistency modifier (reduces or increases variance from random)
      if (consistencyMod !== 0) {
          const baseVariance = 7.5; // Half of Math.random() * 15
          const disposalsVariance = baseVariance * consistencyMod;
          pDisposalsRaw = Math.floor(Math.random() * disposalsVariance * 2) + (player.attributes.stamina / 8) + (player.attributes.speed / 8) + (player.attributes.handball / 10);
      }

      // Apply Morale Multiplier
      let pDisposals = Math.floor(pDisposalsRaw * (moraleMultiplier + pressureModifier));
      let pGoals = Math.floor(pGoalsRaw * (moraleMultiplier + pressureModifier));
      let pBehinds = Math.floor(pBehindsRaw);
      let pTackles = Math.floor(pTacklesRaw * (moraleMultiplier + pressureModifier));

      // Apply tactic scoring bonus/penalty to player goals
      if (playerScoringBonus !== 0) {
          pGoals = Math.max(0, Math.round(pGoals * (1 + playerScoringBonus)));
      }

      // Reduce stats if injured
      if (injuryQuarter > 0) {
          const playTimeRatio = (injuryQuarter - 0.5) / 4; 
          pDisposals = Math.floor(pDisposals * playTimeRatio);
          pGoals = Math.floor(pGoals * playTimeRatio);
          pBehinds = Math.floor(pBehinds * playTimeRatio);
          pTackles = Math.floor(pTackles * playTimeRatio);
      }
      
      const pStats = {
          disposals: Math.floor(pDisposals),
          goals: Math.floor(pGoals),
          behinds: pBehinds,
          tackles: Math.floor(pTackles),
          votes: 0, // Will be calculated in Brownlow 3-2-1 system
          // Extended stats
          effectiveDisposals: 0,
          ineffectiveDisposals: 0,
          kicks: 0,
          handballs: 0,
          marks: 0,
          contendedPossessions: 0,
          inside50s: 0,
          clearances: 0,
          hitOuts: 0,
          brownlowVotes3: 0,
          brownlowVotes2: 0,
          brownlowVotes1: 0,
      };

      let timeline: MatchEvent[] = [];

      // In-match energy tracking
      let inMatchEnergy = Math.max(0, Math.min(100, player.energy));
      let totalEnergyUsed = 0;

      let homeGoals = 0; let homeBehinds = 0;
      let awayGoals = 0; let awayBehinds = 0;

      // Track player stats distribution
      let remainingPlayerGoals = pStats.goals;
      let remainingPlayerBehinds = pStats.behinds;
      let remainingPlayerDisposals = pStats.disposals;
      let remainingPlayerTackles = pStats.tackles;

      // -- MOMENTUM SYSTEM --
      // Tracks which team is "on top" — consecutive scoring events build momentum
      // Momentum affects scoring probability for the next quarter
      let homeMomentum = 0; // -10 to +10, positive = home advantage
      let homeConsecutiveScores = 0;
      let awayConsecutiveScores = 0;

      // -- 3. GENERATE QUARTER BY QUARTER --
      for(let q=1; q<=4; q++) {
          
          // If injured in previous quarter, player does nothing
          const playerActive = injuryQuarter === 0 || q <= injuryQuarter;

          const events: MatchEvent[] = [];
          const minutes = 20;
          
          // --- PLAYER EVENTS ---
          if (playerActive) {
              // Goals
              let qPlayerGoals = 0;
              if (remainingPlayerGoals > 0) {
                 qPlayerGoals = Math.random() > 0.5 ? 1 : 0;
                 if (q === 4 || q === injuryQuarter) qPlayerGoals = remainingPlayerGoals; 
                 else if (qPlayerGoals > remainingPlayerGoals) qPlayerGoals = remainingPlayerGoals;
                 remainingPlayerGoals -= qPlayerGoals;
              }

              // Behinds
               let qPlayerBehinds = 0;
               if (remainingPlayerBehinds > 0) {
                  qPlayerBehinds = Math.random() > 0.7 ? 1 : 0;
                  if (q === 4 || q === injuryQuarter) qPlayerBehinds = remainingPlayerBehinds;
                  remainingPlayerBehinds -= qPlayerBehinds;
               }
               
               // Disposals
               const qDisposals = Math.floor(remainingPlayerDisposals / ((injuryQuarter || 5) - q));
               const qKeyDisposals = Math.ceil(qDisposals * 0.3); 
               remainingPlayerDisposals -= qDisposals;

               // Tackles
               let qTackles = 0;
               if (remainingPlayerTackles > 0) {
                   qTackles = Math.random() > 0.5 ? 1 : 0;
                   remainingPlayerTackles -= qTackles;
               }

              // Add Player Events
              for(let i=0; i<qPlayerGoals; i++) {
                  events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.GOAL[Math.floor(Math.random()*PHRASES.GOAL.length)]}`, type: 'GOAL', isPlayerInvolved: true, teamId: playerTeamId });
                  if(isHome) homeGoals++; else awayGoals++;
                  // Goals count as effective disposal
                  pStats.effectiveDisposals++;
                  pStats.inside50s++;
              }
              for(let i=0; i<qPlayerBehinds; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.BEHIND[Math.floor(Math.random()*PHRASES.BEHIND.length)]}`, type: 'BEHIND', isPlayerInvolved: true, teamId: playerTeamId });
                if(isHome) homeBehinds++; else awayBehinds++;
                pStats.inside50s++;
              }
              for(let i=0; i<qKeyDisposals; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.POSSESSION[Math.floor(Math.random()*PHRASES.POSSESSION.length)]}`, type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId });
                // Disposal effectiveness: 60-80% effective based on kicking/handball
                const effectiveChance = (player.attributes.kicking + player.attributes.handball) / 200;
                if (Math.random() < effectiveChance) {
                    pStats.effectiveDisposals++;
                } else {
                    pStats.ineffectiveDisposals++;
                }
                // Split between kicks and handballs
                if (Math.random() < 0.6) {
                    pStats.kicks++;
                } else {
                    pStats.handballs++;
                }
              }
              for(let i=0; i<qTackles; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.TACKLE[Math.floor(Math.random()*PHRASES.TACKLE.length)]}`, type: 'TACKLE', isPlayerInvolved: true, teamId: playerTeamId });
                pStats.contendedPossessions++;
              }

              // Track marks from position-specific events
              if (player.position === Position.FORWARD || player.position === Position.MIDFIELDER) {
                  const markChance = player.attributes.marking / 150;
                  if (Math.random() < markChance) {
                      pStats.marks++;
                      events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} takes a contested mark!`, type: 'MARK', isPlayerInvolved: true, teamId: playerTeamId });
                  }
              } else if (player.position === Position.DEFENDER) {
                  const markChance = player.attributes.marking / 120; // Defenders mark more
                  if (Math.random() < markChance) {
                      pStats.marks++;
                      events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} intercepts with a mark!`, type: 'MARK', isPlayerInvolved: true, teamId: playerTeamId });
                  }
              }

              // Clearances from stoppages (roughly 30% of disposals)
              pStats.clearances = Math.floor(qDisposals * 0.3);

              // INJURY EVENT
              if (injuryQuarter === q && injuryData) {
                  events.push({
                      quarter: q,
                      time: `${Math.floor(Math.random() * 5) + 15}:00`,
                      description: `${player.name} has gone down clutching their leg! Looks like a ${injuryData.name}. They are being helped off the ground.`,
                      type: 'INJURY',
                      isPlayerInvolved: true,
                      teamId: playerTeamId
                  });
              }

              // Position-specific event (once per quarter, 40% chance)
              if (Math.random() < 0.4) {
                  switch (player.position) {
                      case Position.FORWARD: {
                          const roll = (player.attributes.goalSense + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.ONE_ON_ONE[Math.floor(Math.random()*PHRASES.ONE_ON_ONE.length)]}`, type: 'ONE_ON_ONE', isPlayerInvolved: true, teamId: playerTeamId });
                          }
                          break;
                      }
                      case Position.DEFENDER: {
                          const roll = (player.attributes.tackling + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.INTERCEPT[Math.floor(Math.random()*PHRASES.INTERCEPT.length)]}`, type: 'INTERCEPT', isPlayerInvolved: true, teamId: playerTeamId });
                          } else {
                              events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.ONE_ON_ONE_DEFENSIVE[Math.floor(Math.random()*PHRASES.ONE_ON_ONE_DEFENSIVE.length)]}`, type: 'ONE_ON_ONE_DEFENSIVE', isPlayerInvolved: true, teamId: playerTeamId });
                          }
                          break;
                      }
                      case Position.RUCK: {
                          const roll = (player.attributes.stamina + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.HIT_OUT[Math.floor(Math.random()*PHRASES.HIT_OUT.length)]}`, type: 'HIT_OUT', isPlayerInvolved: true, teamId: playerTeamId });
                              pStats.hitOuts += Math.floor(Math.random() * 5) + 8; // 8-12 hit outs per quarter
                          }
                          break;
                      }
                      default:
                          break; // MIDFIELDER already well covered by POSSESSION events
                  }
              }
          }

          // Per-quarter energy cost (applies regardless of active/injured)
          const quarterCost = Math.max(0, (10 + Math.floor(Math.random() * 11)) + extraEnergyCost + Math.floor(energyDrainMod / 4));
          inMatchEnergy = Math.max(0, inMatchEnergy - quarterCost);
          totalEnergyUsed += quarterCost;

          // --- TEAM/FILLER EVENTS ---
          const currentEventCount = events.length;
          const targetEventCount = Math.floor(Math.random() * 4) + 12; 
          const fillerNeeded = Math.max(0, targetEventCount - currentEventCount);

          for(let i=0; i<fillerNeeded; i++) {
              const isHomeEvent = Math.random() > 0.5;
              const actingTeam = isHomeEvent ? homeTeam : awayTeam;
              
              // Pick a random player from the team (excluding the user to avoid stat confusion)
              const teammates = actingTeam.players.filter(p => p.name !== player.name);
              const randomPlayer = teammates[Math.floor(Math.random() * teammates.length)];
              const actorName = randomPlayer ? randomPlayer.name : actingTeam.name;

              const typeRoll = Math.random();
              let type: MatchEvent['type'] = 'GENERIC';
              let desc = "";

              const isOpponentEvent = actingTeam.id !== playerTeamId;
              const goalThreshold = isOpponentEvent
                  ? Math.max(0.05, 0.25 * (1 - opponentScoringPenalty))
                  : 0.25;

              // Apply momentum bonus/penalty to scoring (±5% based on momentum)
              const momentumAdjustment = (homeMomentum * 0.005); // ±0.05 max
              const adjustedGoalThreshold = isHomeEvent
                  ? goalThreshold + momentumAdjustment
                  : goalThreshold - momentumAdjustment;

              if (typeRoll < adjustedGoalThreshold) {
                  type = 'GOAL';
                  desc = `${actorName} ${PHRASES.GOAL[Math.floor(Math.random()*PHRASES.GOAL.length)]}`;
                  if(isHomeEvent) homeGoals++; else awayGoals++;
                  // Build momentum for scoring team
                  if (isHomeEvent) { homeConsecutiveScores++; awayConsecutiveScores = 0; }
                  else { awayConsecutiveScores++; homeConsecutiveScores = 0; }
              } else if (typeRoll < 0.4) {
                  type = 'BEHIND';
                  desc = `${actorName} ${PHRASES.BEHIND[Math.floor(Math.random()*PHRASES.BEHIND.length)]}`;
                  if(isHomeEvent) homeBehinds++; else awayBehinds++;
              } else if (typeRoll < 0.55) {
                  type = 'MARK';
                  if (Math.random() > 0.5) {
                      desc = `${actorName} ${PHRASES.MARK[Math.floor(Math.random()*PHRASES.MARK.length)]}`;
                  } else {
                      desc = `Big mark by ${actorName} inside 50!`;
                  }
              } else if (typeRoll < 0.65) {
                  type = 'TURNOVER';
                  desc = `${actorName} ${PHRASES.TURNOVER[Math.floor(Math.random()*PHRASES.TURNOVER.length)]}`;
              } else if (typeRoll < 0.75) {
                  type = 'FREE_KICK';
                  desc = `${actorName} ${PHRASES.FREE_KICK[Math.floor(Math.random()*PHRASES.FREE_KICK.length)]}`;
              } else if (typeRoll < 0.85) {
                  type = 'POSSESSION';
                   desc = `${actorName} ${PHRASES.POSSESSION[Math.floor(Math.random()*PHRASES.POSSESSION.length)]}`;
              } else {
                  type = 'GENERIC';
                  const culturePhrases = playerTeamCulture ? CROWD_PHRASES_BY_CULTURE[playerTeamCulture] : undefined;
                  const genericPool = culturePhrases?.length ? culturePhrases : PHRASES.GENERIC;
                  desc = genericPool[Math.floor(Math.random() * genericPool.length)];
              }

              // Rare spectacular play
              if (Math.random() > 0.95) {
                  desc = `UNBELIEVABLE! ${actorName} with a play of the year candidate!`;
                  type = 'GENERIC'; 
              }

              events.push({ 
                  quarter: q, 
                  time: `${Math.floor(Math.random()*minutes)+1}:00`, 
                  description: desc, 
                  type, 
                  isPlayerInvolved: false,
                  teamId: actingTeam.id // Assign team ID
              });
          }

          // Sort events by time
          events.sort((a,b) => parseInt(a.time) - parseInt(b.time));
          timeline = [...timeline, ...events];

          // -- END OF QUARTER MOMENTUM CALCULATION --
          // Calculate momentum based on quarter scoring
          const homeQGoals = events.filter(e => e.type === 'GOAL' && e.teamId === homeTeam.id).length;
          const awayQGoals = events.filter(e => e.type === 'GOAL' && e.teamId === awayTeam.id).length;
          const qGoalDiff = homeQGoals - awayQGoals;

          // Momentum shifts based on quarter performance + consecutive scores
          const consecutiveBonus = Math.max(homeConsecutiveScores, awayConsecutiveScores) * 0.5;
          if (homeConsecutiveScores > awayConsecutiveScores) {
              homeMomentum = Math.min(10, homeMomentum + qGoalDiff * 0.8 + consecutiveBonus);
          } else if (awayConsecutiveScores > homeConsecutiveScores) {
              homeMomentum = Math.max(-10, homeMomentum + qGoalDiff * 0.8 - consecutiveBonus);
          } else {
              homeMomentum = Math.max(-10, Math.min(10, homeMomentum + qGoalDiff * 0.8));
          }

          // Decay momentum slightly each quarter (regression to mean)
          homeMomentum *= 0.85;

          // Add crowd momentum phrase if significant
          if (Math.abs(homeMomentum) > 4 && playerTeamCulture) {
              const crowdPhrases = CROWD_PHRASES_BY_CULTURE[playerTeamCulture] || PHRASES.GENERIC;
              const momentumPhrase = homeMomentum > 0
                  ? crowdPhrases[Math.floor(Math.random() * crowdPhrases.length)]
                  : 'The momentum has swung against them.';
              timeline.push({
                  quarter: q,
                  time: '20:00',
                  description: momentumPhrase,
                  type: 'GENERIC',
                  isPlayerInvolved: false,
                  teamId: playerTeamId
              });
          }
      }

      // Calculate quarter-by-quarter scores from timeline events
      const hQScores: number[] = [];
      const aQScores: number[] = [];

      let runningHGoals = 0; let runningHBehinds = 0;
      let runningAGoals = 0; let runningABehinds = 0;

      for(let q=1; q<=4; q++) {
         const qEvents = timeline.filter(e => e.quarter === q);
         qEvents.forEach(e => {
             if(e.type === 'GOAL') {
                 const isHomeGoal = e.teamId === homeTeam.id;
                 if (isHomeGoal) runningHGoals++; else runningAGoals++;
             } else if (e.type === 'BEHIND') {
                 const isHomeBehind = e.teamId === homeTeam.id;
                 if (isHomeBehind) runningHBehinds++; else runningABehinds++;
             }
         });
         hQScores.push((runningHGoals * 6) + runningHBehinds);
         aQScores.push((runningAGoals * 6) + runningABehinds);
      }

      // Use the event-generated scores as the source of truth
      // The recounted scores should match, but we verify and use the timeline version for consistency
      const finalHomeGoals = homeGoals;
      const finalHomeBehinds = homeBehinds;
      const finalAwayGoals = awayGoals;
      const finalAwayBehinds = awayBehinds;

      // Rivalry Check
      let newRivalry: Rivalry | undefined;
      if (pStats.tackles > 4 || pStats.disposals > 25) {
          const opponent = homeTeam.id === player.contract.clubName ? awayTeam : homeTeam;
          if (Math.random() > 0.8) {
              newRivalry = {
                  opponentName: `Opponent #${Math.floor(Math.random() * 10) + 1}`,
                  club: opponent.name,
                  reason: `Intense battle in Round ${currentRound}`,
                  intensity: 'Medium'
              };
              timeline.push({
                  quarter: 4,
                  time: "19:00",
                  description: `${player.name} gets into a scuffle with ${newRivalry.opponentName}! A rivalry is born.`,
                  type: 'RIVALRY',
                  isPlayerInvolved: true,
                  teamId: playerTeamId
              });
          }
      }

      // Forward position stat multiplier
      if (player.position === Position.FORWARD && pStats.goals > 0) {
          pStats.goals = Math.round(pStats.goals * 1.1);
      }

      // -- 4. GENERATE "OFFICIAL" BOX SCORE --
      const topPerformers: PerformerStats[] = [];

      // Fisher-Yates shuffle for unique random selection
      const shuffle = <T>(arr: T[]): T[] => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
      };

      // Determine Goal Budgets (use the scores from event generation)
      let homeGoalBudget = finalHomeGoals;
      let awayGoalBudget = finalAwayGoals;

      // User Stats
      topPerformers.push({
          name: player.name,
          teamId: playerTeamId,
          goals: pStats.goals,
          disposals: pStats.disposals,
          isUser: true
      });

      // Deduct User Goals from their team's budget
      if (isHome) homeGoalBudget -= pStats.goals;
      else awayGoalBudget -= pStats.goals;

      // Ensure budget isn't negative (safeguard)
      homeGoalBudget = Math.max(0, homeGoalBudget);
      awayGoalBudget = Math.max(0, awayGoalBudget);

      // Distribute goals among count players — all budget is assigned (no discard)
      const distributeGoals = (budget: number, count: number): number[] => {
          const distribution = new Array(count).fill(0);
          for (let i = 0; i < budget; i++) {
              distribution[Math.floor(Math.random() * count)]++;
          }
          return distribution;
      };

      // Add 4 UNIQUE teammates with stats based on their actual ratings
      const allTeammates = isHome ? homeTeam.players : awayTeam.players;
      const filteredTeammates = allTeammates.filter(p => p.name !== player.name);
      const pickedTeammates = shuffle(filteredTeammates).slice(0, 4);
      const teamBudget = isHome ? homeGoalBudget : awayGoalBudget;
      const teamGoalDist = distributeGoals(teamBudget, pickedTeammates.length);

      pickedTeammates.forEach((p, i) => {
          // Generate disposals based on player rating (higher rated = more disposals)
          const baseDisposals = Math.floor(Math.random() * 10) + 12; // 12-21
          const ratingBonus = Math.floor((p.rating - 50) / 10); // -3 to +4 based on rating
          const teammateDisposals = Math.max(5, baseDisposals + ratingBonus);

          topPerformers.push({
              name: p.name,
              teamId: playerTeamId,
              goals: teamGoalDist[i],
              disposals: teammateDisposals,
              isUser: false
          });
      });

      // Add 4 UNIQUE opponents with stats based on their actual ratings
      const oppPlayers = isHome ? awayTeam.players : homeTeam.players;
      const oppTeamId = isHome ? awayTeam.id : homeTeam.id;
      const pickedOpps = shuffle(oppPlayers).slice(0, 4);
      const oppBudget = isHome ? awayGoalBudget : homeGoalBudget;
      const oppGoalDist = distributeGoals(oppBudget, pickedOpps.length);

      pickedOpps.forEach((p, i) => {
          const baseDisposals = Math.floor(Math.random() * 10) + 12;
          const ratingBonus = Math.floor((p.rating - 50) / 10);
          const oppDisposals = Math.max(5, baseDisposals + ratingBonus);

          topPerformers.push({
              name: p.name,
              teamId: oppTeamId,
              goals: oppGoalDist[i],
              disposals: oppDisposals,
              isUser: false
          });
      });

      const hTotal = (finalHomeGoals * 6) + finalHomeBehinds;
      const aTotal = (finalAwayGoals * 6) + finalAwayBehinds;

      // -- BROWNLOW 3-2-1 VOTE CALCULATION --
      // Calculate performance score for all top performers
      const allScores = topPerformers.map(p => {
          // For non-user players, simulate tackles and marks based on their random disposals
          const simTackles = p.isUser ? pStats.tackles : Math.floor(p.disposals * 0.15);
          const simMarks = p.isUser ? (pStats.marks || 0) : Math.floor(p.disposals * 0.08);
          const simGoals = p.goals;

          return {
              name: p.name,
              teamId: p.teamId,
              isUser: p.isUser,
              // Brownlow scoring: goals=4, disposals=1, tackles=2, marks=1
              score: simGoals * 4 + p.disposals * 1 + simTackles * 2 + simMarks * 1
          };
      });

      // Sort by score descending
      allScores.sort((a, b) => b.score - a.score);

      // Assign 3-2-1 votes to top 3 (only if they have a positive score)
      if (allScores.length >= 1 && allScores[0].score > 0) {
          if (allScores[0].isUser) pStats.brownlowVotes3 = 3;
      }
      if (allScores.length >= 2 && allScores[1].score > 0) {
          if (allScores[1].isUser) pStats.brownlowVotes2 = 2;
      }
      if (allScores.length >= 3 && allScores[2].score > 0) {
          if (allScores[2].isUser) pStats.brownlowVotes1 = 1;
      }

      pStats.votes = pStats.brownlowVotes3 + pStats.brownlowVotes2 + pStats.brownlowVotes1;

      // -- PERFORMANCE GRADE --
      // Calculate performance grade based on position expectations
      const getPerformanceGrade = (stats: typeof pStats, position: Position): string => {
          let score = 0;
          const disposals = stats.disposals;
          const goals = stats.goals;
          const tackles = stats.tackles;

          // Base score from disposals (40% weight)
          if (disposals >= 35) score += 40;
          else if (disposals >= 28) score += 35;
          else if (disposals >= 22) score += 30;
          else if (disposals >= 18) score += 25;
          else if (disposals >= 14) score += 20;
          else if (disposals >= 10) score += 15;
          else score += 10;

          // Position-specific scoring
          switch (position) {
              case Position.FORWARD:
                  if (goals >= 5) score += 35;
                  else if (goals >= 3) score += 25;
                  else if (goals >= 2) score += 15;
                  else if (goals >= 1) score += 10;
                  break;
              case Position.MIDFIELDER:
                  if (disposals >= 30) score += 20; // Already counted but bonus
                  if (tackles >= 8) score += 20;
                  else if (tackles >= 5) score += 15;
                  else if (tackles >= 3) score += 10;
                  break;
              case Position.DEFENDER:
                  if (tackles >= 6) score += 20;
                  if ((stats.marks || 0) >= 4) score += 20;
                  else if ((stats.marks || 0) >= 2) score += 10;
                  break;
              case Position.RUCK:
                  if ((stats.hitOuts || 0) >= 30) score += 25;
                  if ((stats.marks || 0) >= 3) score += 15;
                  break;
          }

          // Brownlow bonus
          if (stats.votes >= 3) score += 10;
          else if (stats.votes >= 2) score += 5;

          // Disposal effectiveness bonus
          const totalDisposals = (stats.effectiveDisposals || 0) + (stats.ineffectiveDisposals || 0);
          if (totalDisposals > 0) {
              const effectiveness = (stats.effectiveDisposals || 0) / totalDisposals;
              if (effectiveness > 0.75) score += 5;
              else if (effectiveness < 0.5) score -= 5;
          }

          // Convert score to grade
          if (score >= 90) return 'A+';
          if (score >= 80) return 'A';
          if (score >= 70) return 'A-';
          if (score >= 60) return 'B+';
          if (score >= 50) return 'B';
          if (score >= 40) return 'B-';
          if (score >= 30) return 'C+';
          if (score >= 20) return 'C';
          if (score >= 10) return 'C-';
          return 'D';
      };

      pStats.performanceGrade = getPerformanceGrade(pStats, player.position);

      return {
          homeScore: { goals: finalHomeGoals, behinds: finalHomeBehinds, total: hTotal, quarters: hQScores },
          awayScore: { goals: finalAwayGoals, behinds: finalAwayBehinds, total: aTotal, quarters: aQScores },
          winnerId: hTotal > aTotal ? homeTeam.id : aTotal > hTotal ? awayTeam.id : null,
          playerStats: pStats,
          summary: "",
          timeline,
          newRivalry,
          playerInjury: injuryData,
          topPerformers,
          energyUsed: totalEnergyUsed,
          tactic
      };
};
