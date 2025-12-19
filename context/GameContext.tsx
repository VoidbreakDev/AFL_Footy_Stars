
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, Team, Fixture, LeagueTier, Position, MatchResult, MatchEvent, Rivalry, PlayerInjury, Milestone, PerformerStats } from '../types';
import { SEASON_LENGTH, TEAM_NAMES_LOCAL, FIRST_NAMES, LAST_NAMES, MILESTONES } from '../constants';
import { generateLeague, generateFixtures, updateLadderTeam, generateSemiFinals, generateGrandFinal } from '../utils/leagueUtils';
import { calculateMatchOutcome, simulateCPUMatch } from '../utils/simulationUtils';

interface GameContextType {
  player: PlayerProfile | null;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerProfile | null>>;
  league: Team[];
  fixtures: Fixture[];
  currentRound: number;
  startNewGame: (profile: PlayerProfile) => void;
  generateMatchSimulation: (fixtureIndex: number) => MatchResult;
  commitMatchResult: (fixtureIndex: number, result: MatchResult) => void;
  trainAttribute: (attr: keyof PlayerProfile['attributes']) => void;
  advanceRound: () => void;
  simulateRound: () => void; // New function for injured players to skip match
  view: 'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'SETTINGS' | 'CAREER_SUMMARY';
  setView: React.Dispatch<React.SetStateAction<any>>;
  lastMatchResult: MatchResult | null;
  saveGame: () => void;
  loadGame: () => boolean;
  acknowledgeMilestone: () => void;
  retirePlayer: () => void; // Marks player as retired
  resetGame: () => void; // Wipes data for new game
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [league, setLeague] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [view, setView] = useState<'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'SETTINGS' | 'CAREER_SUMMARY'>('ONBOARDING');
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);

  const startNewGame = (profile: PlayerProfile) => {
    const newLeague = generateLeague(LeagueTier.LOCAL);
    
    // 1. Map User Position to a Specific Sub-Position
    let defaultSub = 'INT';
    if (profile.position === Position.FORWARD) defaultSub = 'HFF';
    if (profile.position === Position.MIDFIELDER) defaultSub = 'C';
    if (profile.position === Position.DEFENDER) defaultSub = 'HBF';
    if (profile.position === Position.RUCK) defaultSub = 'RUCK';

    const updatedProfile = { ...profile, subPosition: defaultSub };

    updatedProfile.contract = {
      clubName: newLeague[0].name,
      salary: 500,
      yearsLeft: 2,
      tier: LeagueTier.LOCAL
    };

    // 2. Inject User into Team Roster
    // Find the team in the league and swap the generic player in the user's slot with the user.
    const teamIndex = 0; // Default to first team
    const myTeam = newLeague[teamIndex];
    
    // Calculate initial rating based on attributes
    const userRating = Math.floor(Object.values(updatedProfile.attributes).reduce((a,b) => a + b, 0) / 7);

    const userPlayerObj = {
        name: updatedProfile.name,
        position: updatedProfile.position,
        subPosition: updatedProfile.subPosition,
        rating: userRating
    };

    // Find a player to replace (prioritize exact sub-position, then broad position)
    let replaceIndex = myTeam.players.findIndex(p => p.subPosition === defaultSub);
    if (replaceIndex === -1) {
        replaceIndex = myTeam.players.findIndex(p => p.position === updatedProfile.position);
    }

    if (replaceIndex !== -1) {
        myTeam.players[replaceIndex] = userPlayerObj;
    } else {
        // Fallback: Replace the last player on the bench if no slot found
        myTeam.players[myTeam.players.length - 1] = userPlayerObj;
    }

    newLeague[teamIndex] = myTeam;
    
    setLeague(newLeague);
    setFixtures(generateFixtures(newLeague));
    setPlayer(updatedProfile);
    setCurrentRound(1);
    setView('DASHBOARD');
  };

  const trainAttribute = (attr: keyof PlayerProfile['attributes']) => {
    if (!player) return;
    
    // CAP CHECK: Cannot train if attribute is at or above potential
    if (player.attributes[attr] >= player.potential) return;
    // ENERGY CHECK: Cannot train if energy is too low
    if (player.energy < 10) return;

    if (player.skillPoints > 0) {
        setPlayer(prev => {
            if(!prev) return null;
            return {
                ...prev,
                skillPoints: prev.skillPoints - 1,
                energy: prev.energy - 10,
                attributes: {
                    ...prev.attributes,
                    [attr]: prev.attributes[attr] + 1
                }
            }
        })
    }
  };

  const generateMatchSimulation = (fixtureIndex: number): MatchResult => {
      const fixture = fixtures[fixtureIndex];
      const homeTeam = league.find(t => t.id === fixture.homeTeamId);
      const awayTeam = league.find(t => t.id === fixture.awayTeamId);
      
      if(!homeTeam || !awayTeam || !player) throw new Error("Invalid match data");

      return calculateMatchOutcome(homeTeam, awayTeam, player, currentRound);
  };

  const commitMatchResult = (fixtureIndex: number, result: MatchResult) => {
      const fixture = fixtures[fixtureIndex];
      if(!player) return;

      // 1. Determine Match Outcome for Morale
      const myTeam = league.find(t => t.name === player.contract.clubName);
      const isHome = fixture.homeTeamId === myTeam?.id;
      const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
      const opponent = league.find(t => t.id === opponentId);

      const myScore = isHome ? result.homeScore.total : result.awayScore.total;
      const oppScore = isHome ? result.awayScore.total : result.homeScore.total;
      
      let moraleChange = 0;
      if (myScore > oppScore) moraleChange += 5; // Win
      else if (myScore < oppScore) moraleChange -= 5; // Loss
      
      // Check if Rivalry Match
      const rivalryMatch = player.rivalries?.find(r => r.club === opponent?.name);
      if (rivalryMatch) {
          if (myScore > oppScore) moraleChange += 15; // Beat rival
          else if (myScore < oppScore) moraleChange -= 15; // Lost to rival
      }

      // --- MILESTONE CHECKING ---
      const achievedMilestones: Milestone[] = [];
      const prevStats = player.careerStats;
      const newStats = {
          matches: prevStats.matches + 1,
          goals: prevStats.goals + result.playerStats.goals,
          disposals: prevStats.disposals + result.playerStats.disposals,
          tackles: prevStats.tackles + result.playerStats.tackles
      };

      // Matches
      MILESTONES.MATCHES.forEach(threshold => {
          if (prevStats.matches < threshold && newStats.matches >= threshold) {
              achievedMilestones.push({
                  id: `matches-${threshold}-${Date.now()}`,
                  type: 'MATCHES',
                  value: threshold,
                  description: `${threshold} Games Played`,
                  achievedRound: currentRound,
                  achievedYear: 1
              });
          }
      });

      // Goals
      MILESTONES.GOALS.forEach(threshold => {
          if (prevStats.goals < threshold && newStats.goals >= threshold) {
              achievedMilestones.push({
                  id: `goals-${threshold}-${Date.now()}`,
                  type: 'GOALS',
                  value: threshold,
                  description: `${threshold} Career Goals`,
                  achievedRound: currentRound,
                  achievedYear: 1
              });
          }
      });

      // Disposals
      MILESTONES.DISPOSALS.forEach(threshold => {
          if (prevStats.disposals < threshold && newStats.disposals >= threshold) {
              achievedMilestones.push({
                  id: `disp-${threshold}-${Date.now()}`,
                  type: 'DISPOSALS',
                  value: threshold,
                  description: `${threshold} Career Disposals`,
                  achievedRound: currentRound,
                  achievedYear: 1
              });
          }
      });

      // Tackles
      MILESTONES.TACKLES.forEach(threshold => {
          if (prevStats.tackles < threshold && newStats.tackles >= threshold) {
              achievedMilestones.push({
                  id: `tackles-${threshold}-${Date.now()}`,
                  type: 'TACKLES',
                  value: threshold,
                  description: `${threshold} Career Tackles`,
                  achievedRound: currentRound,
                  achievedYear: 1
              });
          }
      });
      
      // Result update with milestones
      const resultWithMilestones = { ...result, achievedMilestones };


      // 2. Update Player's Match
      const updatedFixtures = [...fixtures];
      updatedFixtures[fixtureIndex] = { ...fixture, played: true, result: resultWithMilestones };
      setLastMatchResult(resultWithMilestones);

      let updatedLeague = [...league];

      // Helper to find team in local league array and update
      // NOTE: If it's a Finals match, we do NOT update Ladder Points (updateLadderTeam handles this check inside)
      updatedLeague = updatedLeague.map(t => {
          if (t.id === fixture.homeTeamId) return updateLadderTeam(t, resultWithMilestones, true);
          if (t.id === fixture.awayTeamId) return updateLadderTeam(t, resultWithMilestones, false);
          return t;
      });

      // 3. SIMULATE OTHER MATCHES IN ROUND
      // Find all other fixtures for this round that haven't been played
      const otherFixturesIndices = updatedFixtures
          .map((f, i) => ({ ...f, originalIndex: i }))
          .filter(f => f.round === fixture.round && f.originalIndex !== fixtureIndex && !f.played);

      otherFixturesIndices.forEach(otherFix => {
          const home = updatedLeague.find(t => t.id === otherFix.homeTeamId);
          const away = updatedLeague.find(t => t.id === otherFix.awayTeamId);
          
          if (home && away) {
              const simResult = simulateCPUMatch(home, away);
              
              // Only tag as Finals if EXPLICITLY set to Semi or Grand Final
              // Regular matches have matchType='League', which is truthy, but we MUST update ladder for them
              if (otherFix.matchType === 'Semi Final' || otherFix.matchType === 'Grand Final') {
                  simResult.summary = "Finals"; 
              }
              
              updatedFixtures[otherFix.originalIndex] = { ...updatedFixtures[otherFix.originalIndex], played: true, result: simResult };
              
              updatedLeague = updatedLeague.map(t => {
                if (t.id === otherFix.homeTeamId) return updateLadderTeam(t, simResult, true);
                if (t.id === otherFix.awayTeamId) return updateLadderTeam(t, simResult, false);
                return t;
              });
          }
      });

      setFixtures(updatedFixtures);
      setLeague(updatedLeague);

      // 4. Update Player Stats & Morale
      setPlayer(prev => {
          if(!prev) return null;
          const updatedRivalries = [...(prev.rivalries || [])];
          if (result.newRivalry) {
              updatedRivalries.push(result.newRivalry);
          }

          // Add milestones
          const updatedMilestones = [...(prev.milestones || [])];
          if (achievedMilestones.length > 0) {
              updatedMilestones.push(...achievedMilestones);
          }
          
          // Clamp Morale
          const newMorale = Math.min(100, Math.max(0, prev.morale + moraleChange));

          // --- DYNAMIC POTENTIAL UPDATE ---
          // If the player receives 3 Brownlow Votes (Best on Ground), there's a chance to increase Potential
          let newPotential = prev.potential;
          if (result.playerStats.votes === 3 && Math.random() > 0.5) {
              newPotential = Math.min(99, prev.potential + 1);
          }

          return {
              ...prev,
              potential: newPotential,
              morale: newMorale,
              skillPoints: prev.skillPoints + 1,
              rivalries: updatedRivalries,
              milestones: updatedMilestones,
              injury: result.playerInjury || prev.injury, // Set new injury if occurred
              seasonStats: {
                  ...prev.seasonStats,
                  matches: prev.seasonStats.matches + 1,
                  goals: prev.seasonStats.goals + result.playerStats.goals,
                  disposals: prev.seasonStats.disposals + result.playerStats.disposals,
                  votes: prev.seasonStats.votes + result.playerStats.votes,
                  tackles: prev.seasonStats.tackles + result.playerStats.tackles
              },
              careerStats: {
                  ...prev.careerStats,
                  matches: prev.careerStats.matches + 1,
                  goals: prev.careerStats.goals + result.playerStats.goals,
                  disposals: prev.careerStats.disposals + result.playerStats.disposals,
                  votes: prev.careerStats.votes + result.playerStats.votes,
                  tackles: prev.careerStats.tackles + result.playerStats.tackles
              }
          }
      });
  };

  const advanceRound = () => {
      // LOGIC: Check if we are transitioning into finals
      const nextRound = currentRound + 1;
      
      let nextFixtures = [...fixtures];

      if (currentRound === SEASON_LENGTH) {
          // End of Regular Season -> Generate Semis
          nextFixtures = generateSemiFinals(league, fixtures);
      } else if (currentRound === SEASON_LENGTH + 1) {
          // End of Semis -> Generate Grand Final
          nextFixtures = generateGrandFinal(fixtures);
      } else if (currentRound === SEASON_LENGTH + 2) {
          // End of Grand Final -> End Season logic (can just stay here for now or loop)
          // For now, just increment round but no games left
      }

      setFixtures(nextFixtures);
      setCurrentRound(nextRound);
      
      // Heal Player & Restore Energy
      setPlayer(prev => {
          if(!prev) return null;
          let updatedInjury = prev.injury;
          if(prev.injury) {
              const weeksLeft = prev.injury.weeksRemaining - 1;
              updatedInjury = weeksLeft <= 0 ? null : { ...prev.injury, weeksRemaining: weeksLeft };
          }
          return {
              ...prev,
              energy: 100, // Restore Energy
              injury: updatedInjury
          };
      });

      setView('DASHBOARD');
  };

  // Simulate results for the whole round (used when player is injured OR eliminated from finals)
  const simulateRound = () => {
      // Find all unplayed games for this round
      const roundFixturesIndices = fixtures
            .map((f, i) => ({ ...f, index: i }))
            .filter(f => f.round === currentRound && !f.played);
      
      let newFixtures = [...fixtures];
      let updatedLeague = [...league];

      roundFixturesIndices.forEach(fix => {
          const homeTeam = updatedLeague.find(t => t.id === fix.homeTeamId)!;
          const awayTeam = updatedLeague.find(t => t.id === fix.awayTeamId)!;
          
          const result = simulateCPUMatch(homeTeam, awayTeam);
          
          // Only tag as Finals if strictly Semi or Grand Final
          if (fix.matchType === 'Semi Final' || fix.matchType === 'Grand Final') {
              result.summary = "Finals";
          }

          // Update Fixture
          newFixtures[fix.index] = { ...newFixtures[fix.index], played: true, result };

          // Update Ladder (Only if regular season)
          updatedLeague = updatedLeague.map(t => {
                if (t.id === fix.homeTeamId) return updateLadderTeam(t, result, true);
                if (t.id === fix.awayTeamId) return updateLadderTeam(t, result, false);
                return t;
          });
      });

      // Handle Finals generation if simulating past R14
      if (currentRound === SEASON_LENGTH) {
          newFixtures = generateSemiFinals(updatedLeague, newFixtures);
      } else if (currentRound === SEASON_LENGTH + 1) {
          newFixtures = generateGrandFinal(newFixtures);
      }

      setFixtures(newFixtures);
      setLeague(updatedLeague);
      
      // Manual advance since simulateRound calls advanceRound usually, but we have custom logic inside advanceRound
      // so let's just increment round state and heal player here to avoid double-calling fixtures generation
      setCurrentRound(prev => prev + 1);
      
      setPlayer(prev => {
          if(!prev) return null;
          let updatedInjury = prev.injury;
          if(prev.injury) {
              const weeksLeft = prev.injury.weeksRemaining - 1;
              updatedInjury = weeksLeft <= 0 ? null : { ...prev.injury, weeksRemaining: weeksLeft };
          }
          return {
              ...prev,
              energy: 100, // Restore Energy
              injury: updatedInjury
          };
      });
      
      setView('DASHBOARD');
  };

  const saveGame = () => {
    if (!player) return;
    const gameState = {
      player,
      league,
      fixtures,
      currentRound,
      lastMatchResult
    };
    try {
      localStorage.setItem('footyLegendSave', JSON.stringify(gameState));
    } catch (e) {
      console.error("Failed to save game", e);
    }
  };

  const retirePlayer = () => {
      if (!player) return;
      
      // Mark as retired
      const retiredPlayer = { ...player, isRetired: true };
      setPlayer(retiredPlayer);
      
      // Save the "Retired State"
      const gameState = {
          player: retiredPlayer,
          league,
          fixtures,
          currentRound,
          lastMatchResult
      };
      try {
          localStorage.setItem('footyLegendSave', JSON.stringify(gameState));
      } catch (e) {
          console.error("Failed to save retirement", e);
      }
      
      setView('CAREER_SUMMARY');
  };

  const resetGame = () => {
      localStorage.removeItem('footyLegendSave');
      setPlayer(null);
      setLeague([]);
      setFixtures([]);
      setCurrentRound(1);
      setLastMatchResult(null);
      setView('ONBOARDING');
  };

  const loadGame = () => {
    try {
      const saved = localStorage.getItem('footyLegendSave');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.player && data.league && data.fixtures) {
            // Migration for old saves missing energy
            if (data.player.energy === undefined) {
                data.player.energy = 100;
            }

            setPlayer(data.player);
            setLeague(data.league);
            setFixtures(data.fixtures);
            setCurrentRound(data.currentRound);
            setLastMatchResult(data.lastMatchResult || null);
            
            // Redirect retired players to summary
            if (data.player.isRetired) {
                setView('CAREER_SUMMARY');
            } else {
                setView('DASHBOARD');
            }
            return true;
        }
      }
    } catch (e) {
      console.error("Failed to load game", e);
    }
    return false;
  };

  const acknowledgeMilestone = () => {
      if (lastMatchResult) {
          setLastMatchResult({
              ...lastMatchResult,
              achievedMilestones: []
          });
      }
  };

  return (
    <GameContext.Provider value={{ 
        player, setPlayer, league, fixtures, currentRound, startNewGame, generateMatchSimulation, commitMatchResult, trainAttribute, advanceRound, simulateRound, view, setView, lastMatchResult, saveGame, loadGame, acknowledgeMilestone, retirePlayer, resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
