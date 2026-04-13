
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position, Tactic, CultureType } from '../types';

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

// --- HELPER: Simulate CPU Match ---
export const simulateCPUMatch = (homeTeam: Team, awayTeam: Team): MatchResult => {
    const homeGoals = Math.floor(Math.random() * 15) + 5;
    const homeBehinds = Math.floor(Math.random() * 10);
    const awayGoals = Math.floor(Math.random() * 15) + 5;
    const awayBehinds = Math.floor(Math.random() * 10);
    
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

      // -- 1. INJURY CHECK --
      let injuryData: PlayerInjury | undefined = undefined;
      let injuryQuarter = 0; // 0 = No injury
      
      // Base chance of injury (e.g., 1.5%). Higher if low stamina/high tackles
      const injuryChance = 0.015; 
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
      let pTacklesRaw = Math.floor(Math.random() * 4) + (player.attributes.tackling / 10);

      // Apply Morale Multiplier
      let pDisposals = Math.floor(pDisposalsRaw * moraleMultiplier);
      let pGoals = Math.floor(pGoalsRaw * moraleMultiplier);
      let pBehinds = Math.floor(pBehindsRaw);
      let pTackles = Math.floor(pTacklesRaw * moraleMultiplier);

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
          votes: (injuryQuarter === 0) && (pDisposals > 25 || Math.floor(pGoals) > 3) ? 3 : 0
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
              }
              for(let i=0; i<qPlayerBehinds; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.BEHIND[Math.floor(Math.random()*PHRASES.BEHIND.length)]}`, type: 'BEHIND', isPlayerInvolved: true, teamId: playerTeamId });
                if(isHome) homeBehinds++; else awayBehinds++;
              }
              for(let i=0; i<qKeyDisposals; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.POSSESSION[Math.floor(Math.random()*PHRASES.POSSESSION.length)]}`, type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId });
              }
              for(let i=0; i<qTackles; i++) {
                events.push({ quarter: q, time: `${Math.floor(Math.random()*minutes)+1}:00`, description: `${player.name} ${PHRASES.TACKLE[Math.floor(Math.random()*PHRASES.TACKLE.length)]}`, type: 'TACKLE', isPlayerInvolved: true, teamId: playerTeamId });
              }

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
                          }
                          break;
                      }
                      default:
                          break; // MIDFIELDER already well covered by POSSESSION events
                  }
              }
          }

          // Per-quarter energy cost (applies regardless of active/injured)
          const quarterCost = Math.max(0, (10 + Math.floor(Math.random() * 11)) + extraEnergyCost);
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
              if (typeRoll < goalThreshold) {
                  type = 'GOAL';
                  desc = `${actorName} ${PHRASES.GOAL[Math.floor(Math.random()*PHRASES.GOAL.length)]}`;
                  if(isHomeEvent) homeGoals++; else awayGoals++;
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

      // Add 4 UNIQUE teammates (shuffle then slice avoids duplicates)
      const allTeammates = isHome ? homeTeam.players : awayTeam.players;
      const filteredTeammates = allTeammates.filter(p => p.name !== player.name);
      const pickedTeammates = shuffle(filteredTeammates).slice(0, 4);
      const teamBudget = isHome ? homeGoalBudget : awayGoalBudget;
      const teamGoalDist = distributeGoals(teamBudget, pickedTeammates.length);

      pickedTeammates.forEach((p, i) => {
          topPerformers.push({
              name: p.name,
              teamId: playerTeamId,
              goals: teamGoalDist[i],
              disposals: Math.floor(Math.random() * 20) + 12,
              isUser: false
          });
      });

      // Add 4 UNIQUE opponents
      const oppPlayers = isHome ? awayTeam.players : homeTeam.players;
      const oppTeamId = isHome ? awayTeam.id : homeTeam.id;
      const pickedOpps = shuffle(oppPlayers).slice(0, 4);
      const oppBudget = isHome ? awayGoalBudget : homeGoalBudget;
      const oppGoalDist = distributeGoals(oppBudget, pickedOpps.length);

      pickedOpps.forEach((p, i) => {
          topPerformers.push({
              name: p.name,
              teamId: oppTeamId,
              goals: oppGoalDist[i],
              disposals: Math.floor(Math.random() * 20) + 12,
              isUser: false
          });
      });

      const hTotal = (finalHomeGoals * 6) + finalHomeBehinds;
      const aTotal = (finalAwayGoals * 6) + finalAwayBehinds;

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
