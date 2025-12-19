
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position } from '../types';

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
    ]
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
    currentRound: number
): MatchResult => {
      // Identify Player's Team ID for later
      const isHome = player.contract.clubName === homeTeam.name;
      const playerTeamId = isHome ? homeTeam.id : awayTeam.id;

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
      let pBehinds = Math.floor(pBehindsRaw); // Accuracy not necessarily affected by quantity
      let pTackles = Math.floor(pTacklesRaw * moraleMultiplier);

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
                      time: `${Math.floor(Math.random() * 5) + 15}:00`, // Late in the quarter
                      description: `${player.name} has gone down clutching their leg! Looks like a ${injuryData.name}. They are being helped off the ground.`,
                      type: 'INJURY',
                      isPlayerInvolved: true,
                      teamId: playerTeamId
                  });
              }
          }

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

              if (typeRoll < 0.25) {
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
                  desc = PHRASES.GENERIC[Math.floor(Math.random()*PHRASES.GENERIC.length)];
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

      // -- 4. GENERATE "OFFICIAL" BOX SCORE --
      const topPerformers: PerformerStats[] = [];

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

      // Helper to distribute goals among simulated players
      const distributeGoals = (budget: number, count: number) => {
          const distribution = new Array(count).fill(0);
          for (let i = 0; i < budget; i++) {
              // 70% chance a goal goes to one of our top 3 players
              // 30% chance it goes to "rest of team" (effectively discarded/not shown)
              if (Math.random() < 0.7) {
                  const idx = Math.floor(Math.random() * count);
                  distribution[idx]++;
              }
          }
          return distribution;
      };

      // Add 3 random teammates
      const teammates = isHome ? homeTeam.players : awayTeam.players;
      const teamBudget = isHome ? homeGoalBudget : awayGoalBudget;
      const teamGoalDist = distributeGoals(teamBudget, 3); // Distribute budget

      for(let i=0; i<3; i++) {
          const p = teammates.filter(p => p.name !== player.name)[Math.floor(Math.random() * (teammates.length - 1))];
          if(p) {
              topPerformers.push({
                  name: p.name,
                  teamId: playerTeamId,
                  goals: teamGoalDist[i], // Assign drawn goal count
                  disposals: Math.floor(Math.random() * 20) + 12, // Realistic 12-32 disposals
                  isUser: false
              });
          }
      }

      // Add 3 random opponents
      const oppPlayers = isHome ? awayTeam.players : homeTeam.players;
      const oppTeamId = isHome ? awayTeam.id : homeTeam.id;
      const oppBudget = isHome ? awayGoalBudget : homeGoalBudget;
      const oppGoalDist = distributeGoals(oppBudget, 3); // Distribute budget

      for(let i=0; i<3; i++) {
          const p = oppPlayers[Math.floor(Math.random() * oppPlayers.length)];
          if(p) {
              topPerformers.push({
                  name: p.name,
                  teamId: oppTeamId,
                  goals: oppGoalDist[i], // Assign drawn goal count
                  disposals: Math.floor(Math.random() * 20) + 12, // Realistic 12-32 disposals
                  isUser: false
              });
          }
      }

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
          topPerformers
      };
};
