
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerProfile, Team, Fixture, LeagueTier, Position, MatchResult, MatchEvent, Rivalry, PlayerInjury, Milestone, PerformerStats, Award, DraftClass, CareerEvent } from '../types';
import { SEASON_LENGTH, TEAM_NAMES_LOCAL, FIRST_NAMES, LAST_NAMES, MILESTONES, RETIREMENT_AGE, SHOP_ITEMS } from '../constants';
import { generateLeague, generateFixtures, updateLadderTeam, generateSemiFinals, generateGrandFinal } from '../utils/leagueUtils';
import { calculateMatchOutcome, simulateCPUMatch } from '../utils/simulationUtils';
import { checkAchievements } from '../utils/achievementUtils';
import { canClaimDailyReward, claimDailyReward } from '../utils/dailyRewardUtils';
import { shouldUpdateNickname, generateNickname } from '../utils/nicknameUtils';
import { generateTransferOffers, shouldGenerateOffers, clearExpiredOffers, acceptTransferOffer } from '../utils/transferUtils';
import { shouldPromote, shouldRelegate, getPromotedTier, getRelegatedTier, createSeasonHistory, generateNewSeasonSalary } from '../utils/seasonUtils';
import { calculateSeasonAwards } from '../utils/awardUtils';
import { createDraftClass, shouldHoldDraft, simulateDraftPick, isPlayerDraftEligible, generateDraftClassWithPlayer, wasPlayerDrafted } from '../utils/draftUtils';
import { processLeagueRosterTurnover } from '../utils/rosterUtils';
import { initializeMediaReputation, generateMediaEvent, updateMediaReputation, respondToMediaEvent, createSocialMediaPost, calculatePassiveFanGrowth } from '../utils/mediaUtils';
import { generateCareerEvent, canGenerateNewEvent, resolveCareerEvent, resolveCareerEventChoice } from '../utils/careerEventUtils';
import { initializeTeamChemistry, calculateOverallChemistry, updateTeamChemistryAfterMatch, generateTeammateInteraction, updateTeammateRelationship, incrementMatchesTogether, calculateChemistryBonus } from '../utils/chemistryUtils';
import { initializeCoachingStaff, generateCoachInteraction, updateCoachRelationship, hireStaff, processStaffContracts } from '../utils/coachingUtils';

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
  view: 'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' | 'MILESTONES' | 'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' | 'CAREER_SUMMARY' | 'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' | 'COACHING_STAFF' | 'MASTER_SKILLS';
  setView: React.Dispatch<React.SetStateAction<any>>;
  lastMatchResult: MatchResult | null;
  saveGame: () => void;
  loadGame: () => boolean;
  acknowledgeMilestone: () => void;
  retirePlayer: () => void;
  canClaimReward: () => boolean;
  claimReward: () => void;
  resetGame: () => void; // Wipes data for new game
  showSeasonRecap: boolean;
  dismissSeasonRecap: () => void;
  seasonAwards: Award[];
  dismissAwardsCeremony: () => void;
  draftClass: DraftClass | null;
  draftProspect: (prospectId: string) => void;
  simulateDraft: () => void;
  completeDraft: () => void;
  acceptTransfer: (offerId: string) => void;
  rejectTransfer: (offerId: string) => void;
  purchaseItem: (itemId: string) => boolean;
  respondToMedia?: (eventId: string, responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE') => void;
  createSocialPost?: (content: string) => void;
  resolveEvent: (eventId: string) => void;
  resolveEventChoice: (eventId: string) => void;
  hireCoachingStaff?: (staffMember: any, contractType: 'PERMANENT' | 'TEMPORARY') => void;
  showFinalsIntro: boolean;
  dismissFinalsIntro: () => void;
  showSemiFinalsResults: boolean;
  dismissSemiFinalsResults: () => void;
  showGrandFinalResult: boolean;
  dismissGrandFinalResult: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [league, setLeague] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [view, setView] = useState<'ONBOARDING' | 'DASHBOARD' | 'MATCH_PREVIEW' | 'MATCH_SIM' | 'MATCH_RESULT' | 'TRAINING' | 'CLUB' | 'LEAGUE' | 'PLAYER' | 'ACHIEVEMENTS' | 'MILESTONES' | 'PLAYER_COMPARISON' | 'TRANSFER_MARKET' | 'SHOP' | 'SETTINGS' | 'CAREER_SUMMARY' | 'DRAFT' | 'MEDIA_HUB' | 'CAREER_EVENTS' | 'TEAM_CHEMISTRY' | 'COACHING_STAFF' | 'MASTER_SKILLS'>('ONBOARDING');
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);
  const [showSeasonRecap, setShowSeasonRecap] = useState(false);
  const [seasonAwards, setSeasonAwards] = useState<Award[]>([]);
  const [draftClass, setDraftClass] = useState<DraftClass | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Finals progression screens
  const [showFinalsIntro, setShowFinalsIntro] = useState(false);
  const [showSemiFinalsResults, setShowSemiFinalsResults] = useState(false);
  const [showGrandFinalResult, setShowGrandFinalResult] = useState(false);

  // Helper function to inject player into team roster
  const injectPlayerIntoTeam = (league: Team[], player: PlayerProfile, teamName: string): Team[] => {
      const teamIndex = league.findIndex(t => t.name === teamName);
      if (teamIndex === -1) return league;

      const team = league[teamIndex];
      const userRating = Math.floor((Object.values(player.attributes) as number[]).reduce((a,b) => a + b, 0) / 7);

      const userPlayerObj = {
          name: player.name,
          position: player.position,
          subPosition: player.subPosition,
          rating: userRating
      };

      // Find a player to replace (prioritize exact sub-position, then broad position)
      let replaceIndex = team.players.findIndex(p => p.subPosition === player.subPosition);
      if (replaceIndex === -1) {
          replaceIndex = team.players.findIndex(p => p.position === player.position);
      }

      if (replaceIndex !== -1) {
          team.players[replaceIndex] = userPlayerObj;
      } else {
          // Fallback: Replace the last player on the bench
          team.players[team.players.length - 1] = userPlayerObj;
      }

      league[teamIndex] = team;
      return league;
  };

  const startNewGame = (profile: PlayerProfile) => {
    const newLeague = generateLeague(LeagueTier.LOCAL);
    
    // 1. Map User Position to a Specific Sub-Position
    let defaultSub = 'INT';
    if (profile.position === Position.FORWARD) defaultSub = 'HFF';
    if (profile.position === Position.MIDFIELDER) defaultSub = 'C';
    if (profile.position === Position.DEFENDER) defaultSub = 'HBF';
    if (profile.position === Position.RUCK) defaultSub = 'RUCK';

    // Initialize team chemistry and coaching staff for the first team
    const myTeam = newLeague[0];
    const { teammates, teamChemistry } = initializeTeamChemistry(myTeam);
    const coachingStaff = initializeCoachingStaff(LeagueTier.LOCAL);

    const updatedProfile = {
      ...profile,
      subPosition: defaultSub,
      wallet: 0,
      lifetimeEarnings: 0,
      itemsPurchased: [],
      currentYear: 1,
      seasonsPlayed: 0,
      careerHistory: [],
      mediaReputation: initializeMediaReputation(),
      teammates,
      teamChemistry,
      coachingStaff
    };

    updatedProfile.contract = {
      clubName: newLeague[0].name,
      salary: 500,
      yearsLeft: 2,
      tier: LeagueTier.LOCAL
    };

    // 2. Inject User into Team Roster
    // Find the team in the league and swap the generic player in the user's slot with the user.
    const teamIndex = 0; // Default to first team
    // (myTeam already declared above for chemistry initialization)
    
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

            // Calculate training bonus from coaching staff
            const coachingBonus = prev.coachingStaff?.trainingBonus || 0;

            // Base attribute increase is 1
            let attributeIncrease = 1;

            // Apply coaching bonus (up to +25%)
            // Chance to get additional +1 based on bonus percentage
            if (coachingBonus > 0) {
                const bonusChance = coachingBonus / 100; // Convert to 0.0-0.25 range
                if (Math.random() < bonusChance) {
                    attributeIncrease = 2; // Double improvement!
                }
            }

            // Apply motivation boost if active
            let additionalBonus = 0;
            if (prev.motivationBoost && prev.motivationExpiry && currentRound < prev.motivationExpiry) {
                // Motivation boost gives another chance for +1
                const motivationChance = prev.motivationBoost / 100;
                if (Math.random() < motivationChance) {
                    additionalBonus = 1;
                }
            }

            const newAttributeValue = Math.min(
                prev.potential,
                prev.attributes[attr] + attributeIncrease + additionalBonus
            );

            return {
                ...prev,
                skillPoints: prev.skillPoints - 1,
                energy: prev.energy - 10,
                trainingSessions: (prev.trainingSessions || 0) + 1,
                attributes: {
                    ...prev.attributes,
                    [attr]: newAttributeValue
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
          if (t.id === fixture.homeTeamId) return updateLadderTeam(t, resultWithMilestones, true, fixture.matchType);
          if (t.id === fixture.awayTeamId) return updateLadderTeam(t, resultWithMilestones, false, fixture.matchType);
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

          if (!home || !away) {
              console.error(`Cannot simulate other match: Teams not found (Home: ${otherFix.homeTeamId}, Away: ${otherFix.awayTeamId})`);
              return;
          }

          const simResult = simulateCPUMatch(home, away);

          updatedFixtures[otherFix.originalIndex] = { ...updatedFixtures[otherFix.originalIndex], played: true, result: simResult };

          updatedLeague = updatedLeague.map(t => {
              if (t.id === otherFix.homeTeamId) return updateLadderTeam(t, simResult, true, otherFix.matchType);
              if (t.id === otherFix.awayTeamId) return updateLadderTeam(t, simResult, false, otherFix.matchType);
              return t;
          });
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

          // Update tracking stats for achievements
          const won = myScore > oppScore;
          const newWinStreak = won ? (prev.winStreak || 0) + 1 : 0;
          const newInjuryFreeStreak = result.playerInjury ? 0 : (prev.injuryFreeStreak || 0) + 1;
          const newHighMoraleStreak = newMorale >= 90 ? (prev.highMoraleStreak || 0) + 1 : 0;
          const newVoteStreak = result.playerStats.votes > 0 ? (prev.voteStreak || 0) + 1 : 0;
          const totalSPEarned = (prev.totalSkillPointsEarned || 0) + 1;

          // Track clubs played
          const clubsPlayed = prev.clubsPlayed || [prev.contract.clubName];

          // Calculate match payment (salary per week)
          const matchPayment = prev.contract.salary || 0;
          const newWallet = (prev.wallet || 0) + matchPayment;
          const newLifetimeEarnings = (prev.lifetimeEarnings || 0) + matchPayment;

          // Calculate energy drain based on match intensity
          // Base drain: 10-20 energy
          // Additional factors: disposals (workload), tackles (physical effort), injury
          const baseEnergyDrain = Math.floor(Math.random() * 11) + 10; // 10-20
          const disposalDrain = Math.floor(result.playerStats.disposals / 10); // ~1-3 extra per 10 disposals
          const tackleDrain = Math.floor(result.playerStats.tackles / 5); // ~1-2 extra per 5 tackles
          const injuryDrain = result.playerInjury ? 10 : 0; // Extra 10 if injured
          const totalEnergyDrain = baseEnergyDrain + disposalDrain + tackleDrain + injuryDrain;
          const newEnergy = Math.max(0, prev.energy - totalEnergyDrain);

          // Create updated player for achievement checking
          const updatedPlayer: PlayerProfile = {
              ...prev,
              potential: newPotential,
              morale: newMorale,
              energy: newEnergy,
              skillPoints: prev.skillPoints + 1,
              rivalries: updatedRivalries,
              milestones: updatedMilestones,
              injury: result.playerInjury || prev.injury,
              totalSkillPointsEarned: totalSPEarned,
              winStreak: newWinStreak,
              injuryFreeStreak: newInjuryFreeStreak,
              highMoraleStreak: newHighMoraleStreak,
              voteStreak: newVoteStreak,
              clubsPlayed,
              wallet: newWallet,
              lifetimeEarnings: newLifetimeEarnings,
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
          };

          // Check for new achievements
          const newAchievements = checkAchievements(updatedPlayer, currentRound, 1, result);
          const existingAchievements = prev.achievements || [];

          // Check if nickname should be updated based on new performance
          let updatedNickname = updatedPlayer.nickname;
          if (shouldUpdateNickname(updatedPlayer)) {
              updatedNickname = generateNickname(updatedPlayer);
          }

          // Generate media event based on performance
          let updatedMediaRep = updatedPlayer.mediaReputation || initializeMediaReputation();
          const mediaEvent = generateMediaEvent(
              updatedPlayer,
              result,
              currentRound,
              updatedPlayer.currentYear || 1
          );

          if (mediaEvent) {
              updatedMediaRep = updateMediaReputation(updatedMediaRep, mediaEvent);
          }

          // Passive fan growth each match
          const passiveFanGrowth = calculatePassiveFanGrowth(updatedPlayer, updatedPlayer.contract.tier);
          updatedMediaRep = {
              ...updatedMediaRep,
              fanFollowers: updatedMediaRep.fanFollowers + passiveFanGrowth
          };

          // Generate career event (random encounters)
          let activeCareerEvents = updatedPlayer.activeCareerEvents || [];
          if (canGenerateNewEvent(updatedPlayer)) {
              const newEvent = generateCareerEvent(
                  updatedPlayer,
                  currentRound,
                  updatedPlayer.currentYear || 1,
                  won
              );
              if (newEvent) {
                  activeCareerEvents = [...activeCareerEvents, newEvent];
              }
          }

          // --- TEAM CHEMISTRY & COACHING INTERACTIONS ---
          let updatedTeammates = updatedPlayer.teammates || [];
          let updatedTeamChemistry = updatedPlayer.teamChemistry;
          let updatedCoachingStaff = updatedPlayer.coachingStaff;
          let motivationBoost = updatedPlayer.motivationBoost || 0;
          let motivationExpiry = updatedPlayer.motivationExpiry || 0;

          // Calculate player match rating (0-10 scale)
          const playerMatchRating = Math.min(10, Math.floor(
              (result.playerStats.goals * 2) +
              (result.playerStats.disposals / 5) +
              (result.playerStats.tackles / 3)
          ));

          // Generate teammate interactions (30% chance per teammate, max 3 interactions)
          if (updatedTeammates.length > 0) {
              const interactionCount = Math.min(3, updatedTeammates.length);
              const shuffledTeammates = [...updatedTeammates].sort(() => Math.random() - 0.5);

              for (let i = 0; i < interactionCount; i++) {
                  const teammate = shuffledTeammates[i];
                  const interaction = generateTeammateInteraction(
                      teammate,
                      playerMatchRating,
                      won,
                      currentRound,
                      updatedPlayer.currentYear || 1
                  );

                  if (interaction) {
                      // Update this specific teammate
                      updatedTeammates = updatedTeammates.map(tm => {
                          if (tm.id === teammate.id) {
                              return updateTeammateRelationship(tm, interaction);
                          }
                          return tm;
                      });
                  }
              }

              // Increment matchesTogether for all teammates
              updatedTeammates = updatedTeammates.map(tm => ({
                  ...tm,
                  matchesTogether: tm.matchesTogether + 1
              }));

              // Update team chemistry based on match result
              if (updatedTeamChemistry) {
                  updatedTeamChemistry = updateTeamChemistryAfterMatch(
                      updatedTeamChemistry,
                      won,
                      playerMatchRating
                  );
              }
          }

          // Generate coach interaction (40% chance)
          if (updatedCoachingStaff) {
              const coachInteraction = generateCoachInteraction(
                  updatedCoachingStaff.headCoach,
                  playerMatchRating,
                  won,
                  currentRound,
                  updatedPlayer.currentYear || 1
              );

              if (coachInteraction) {
                  // Update head coach relationship
                  const updatedHeadCoach = updateCoachRelationship(
                      updatedCoachingStaff.headCoach,
                      coachInteraction
                  );

                  updatedCoachingStaff = {
                      ...updatedCoachingStaff,
                      headCoach: updatedHeadCoach
                  };

                  // Apply morale change from coach interaction
                  updatedPlayer.morale = Math.max(0, Math.min(100,
                      updatedPlayer.morale + (coachInteraction.playerMoraleChange || 0)
                  ));

                  // Apply motivation boost if received
                  if (coachInteraction.motivationGained && coachInteraction.motivationGained > 0) {
                      motivationBoost = coachInteraction.motivationGained;
                      motivationExpiry = currentRound + 3; // Lasts 3 rounds
                  }
              }
          }

          return {
              ...updatedPlayer,
              nickname: updatedNickname,
              achievements: [...existingAchievements, ...newAchievements],
              mediaReputation: updatedMediaRep,
              activeCareerEvents,
              teammates: updatedTeammates,
              teamChemistry: updatedTeamChemistry,
              coachingStaff: updatedCoachingStaff,
              motivationBoost,
              motivationExpiry: motivationExpiry > currentRound ? motivationExpiry : 0
          };
      });
  };

  const advanceRound = () => {
      // LOGIC: Check if we are transitioning into finals
      const nextRound = currentRound + 1;

      let nextFixtures = [...fixtures];

      if (currentRound === SEASON_LENGTH) {
          // End of Regular Season -> Show Finals Intro
          setShowFinalsIntro(true);
          nextFixtures = generateSemiFinals(league, fixtures);
      } else if (currentRound === SEASON_LENGTH + 1) {
          // End of Semis -> Show Semi Finals Results
          setShowSemiFinalsResults(true);
          nextFixtures = generateGrandFinal(fixtures);
      } else if (currentRound === SEASON_LENGTH + 2) {
          // End of Grand Final -> Show Grand Final Result
          setShowGrandFinalResult(true);
      }

      setFixtures(nextFixtures);
      setCurrentRound(nextRound);

      // Check if season has ended (after Grand Final)
      const seasonEnded = currentRound === SEASON_LENGTH + 2;

      // Show season recap before processing season end
      if (seasonEnded) {
          setShowSeasonRecap(true);
      }

      // Heal Player & Restore Energy
      setPlayer(prev => {
          if(!prev) return null;
          let updatedInjury = prev.injury;
          if(prev.injury) {
              const weeksLeft = prev.injury.weeksRemaining - 1;
              updatedInjury = weeksLeft <= 0 ? null : { ...prev.injury, weeksRemaining: weeksLeft };
          }

          // Age increment and contract management at end of season
          let newAge = prev.age;
          let updatedContract = prev.contract;
          let newCurrentYear = prev.currentYear || 1;
          let newSeasonsPlayed = prev.seasonsPlayed || 0;
          let newCareerHistory = prev.careerHistory || [];
          let promoted = false;
          let relegated = false;

          if (seasonEnded) {
              newAge = prev.age + 1;
              newSeasonsPlayed += 1;

              // Find player's team for ladder position
              const myTeam = league.find(t => t.name === prev.contract.clubName);
              const playerRating = Math.floor((Object.values(prev.attributes) as number[]).reduce((a,b) => a + b, 0) / 7);

              // Calculate season awards
              const awards = calculateSeasonAwards(prev, league, newCurrentYear);
              setSeasonAwards(awards);

              // Check if player is eligible for AFL draft (from State League)
              if (shouldHoldDraft(prev.contract.tier) && isPlayerDraftEligible(prev)) {
                  // TODO: We need AFL league teams for draft picks
                  // For now, generate a temporary AFL league for draft purposes
                  const aflLeague = generateLeague(LeagueTier.NATIONAL);
                  const draft = generateDraftClassWithPlayer(newCurrentYear, prev, aflLeague);
                  setDraftClass(draft);

                  // Navigate to draft after awards ceremony
                  setTimeout(() => {
                      if (awards.length === 0) {
                          setView('DRAFT');
                      }
                  }, 1000);
              }

              // Check promotion/relegation
              if (myTeam) {
                  // Sort league by points to get ladder position
                  const sortedLeague = [...league].sort((a, b) => b.points - a.points);
                  const ladderPosition = sortedLeague.findIndex(t => t.id === myTeam.id) + 1;

                  promoted = shouldPromote(ladderPosition, prev.contract.tier, playerRating);
                  relegated = shouldRelegate(ladderPosition, prev.contract.tier, playerRating);

                  // Check if won grand final
                  const grandFinal = fixtures.find(f => f.round === SEASON_LENGTH + 2);
                  let grandFinalWon = false;
                  if (grandFinal && grandFinal.played) {
                      const playerTeamIsHome = grandFinal.homeTeamId === myTeam.id;
                      const playerTeamScore = playerTeamIsHome ? grandFinal.homeScore : grandFinal.awayScore;
                      const opponentScore = playerTeamIsHome ? grandFinal.awayScore : grandFinal.homeScore;
                      grandFinalWon = (playerTeamScore || 0) > (opponentScore || 0);
                  }

                  // Create season history record with awards
                  const seasonRecord = createSeasonHistory(prev, myTeam, promoted, relegated, grandFinalWon);
                  seasonRecord.awards = awards; // Add awards to season history
                  newCareerHistory = [...newCareerHistory, seasonRecord];

                  // Update tier and generate new contract if promoted/relegated
                  if (promoted || relegated) {
                      const newTier = promoted ? getPromotedTier(prev.contract.tier) : getRelegatedTier(prev.contract.tier);
                      const newSalary = generateNewSeasonSalary(prev.contract.salary, newTier, playerRating, promoted);

                      updatedContract = {
                          ...prev.contract,
                          tier: newTier,
                          salary: newSalary,
                          yearsLeft: 2, // New 2-year contract
                          clubName: prev.contract.clubName // Keep current club for now
                      };

                      // Show notification
                      setTimeout(() => {
                          if (promoted) {
                              alert(`🎉 PROMOTED! You've been promoted to the ${newTier}! New salary: $${newSalary}/week`);
                          } else {
                              alert(`⬇️ Relegated. You've been relegated to the ${newTier}. New salary: $${newSalary}/week`);
                          }
                      }, 300);

                      // Generate new league for new tier
                      setTimeout(() => {
                          let newLeague = generateLeague(newTier);
                          const newClubName = newLeague[0].name;

                          // Inject player into the new team
                          newLeague = injectPlayerIntoTeam(newLeague, prev, newClubName);

                          setLeague(newLeague);
                          setFixtures(generateFixtures(newLeague));
                          setCurrentRound(1);

                          // Update player's club to first team in new league
                          setPlayer(p => {
                              if (!p) return null;
                              return {
                                  ...p,
                                  contract: {
                                      ...p.contract,
                                      clubName: newClubName
                                  },
                                  seasonStats: {
                                      matches: 0,
                                      goals: 0,
                                      behinds: 0,
                                      disposals: 0,
                                      tackles: 0,
                                      votes: 0,
                                      premierships: 0,
                                      awards: []
                                  }
                              };
                          });
                      }, 500);
                  } else {
                      // No tier change - just decrement contract
                      const newYearsLeft = Math.max(0, prev.contract.yearsLeft - 1);
                      updatedContract = {
                          ...prev.contract,
                          yearsLeft: newYearsLeft
                      };

                      // Notify player if contract is expiring
                      if (newYearsLeft === 0) {
                          setTimeout(() => {
                              alert(`Your contract with ${prev.contract.clubName} has expired! You may receive transfer offers.`);
                          }, 200);
                      }

                      // Reset for new season (same league) - USE PERSISTENT ROSTERS
                      setTimeout(() => {
                          setCurrentRound(1);

                          // Process roster turnover (aging, retirements, development, new players)
                          const turnoverResult = processLeagueRosterTurnover(league, prev.contract.tier);
                          let newLeague = turnoverResult.league;

                          // Inject player into their current team
                          newLeague = injectPlayerIntoTeam(newLeague, prev, prev.contract.clubName);

                          setLeague(newLeague);
                          setFixtures(generateFixtures(newLeague));

                          // Log roster changes to console
                          console.log('🔄 Season Roster Changes:', turnoverResult.summary);

                          // Reset season stats
                          setPlayer(p => {
                              if (!p) return null;
                              return {
                                  ...p,
                                  seasonStats: {
                                      matches: 0,
                                      goals: 0,
                                      behinds: 0,
                                      disposals: 0,
                                      tackles: 0,
                                      votes: 0,
                                      premierships: 0,
                                      awards: []
                                  }
                              };
                          });
                      }, 500);
                  }
              }

              // Increment year for next season
              newCurrentYear += 1;
          }

          // Check for forced retirement
          if (newAge >= RETIREMENT_AGE) {
              // Automatically retire player
              setTimeout(() => {
                  alert(`You have reached retirement age (${RETIREMENT_AGE}). Your career has come to an end.`);
                  retirePlayer();
              }, 100);
          }

          // Generate transfer offers if conditions are met
          let updatedOffers = clearExpiredOffers(prev.transferOffers || [], nextRound);

          if (shouldGenerateOffers(prev, nextRound)) {
              const newOffers = generateTransferOffers(prev, nextRound, league, Math.floor(nextRound / SEASON_LENGTH) + 1);
              updatedOffers = [...updatedOffers, ...newOffers];
          }

          // Process staff contracts (remove expired temporary/seasonal staff)
          let updatedCoachingStaff = prev.coachingStaff;
          if (updatedCoachingStaff) {
              updatedCoachingStaff = processStaffContracts(updatedCoachingStaff, nextRound);
          }

          // Update career premiership count if won grand final
          let updatedCareerStats = prev.careerStats;
          if (grandFinalWon) {
              updatedCareerStats = {
                  ...prev.careerStats,
                  premierships: prev.careerStats.premierships + 1
              };
          }

          return {
              ...prev,
              age: newAge,
              contract: updatedContract,
              currentYear: newCurrentYear,
              seasonsPlayed: newSeasonsPlayed,
              careerHistory: newCareerHistory,
              careerStats: updatedCareerStats,
              energy: 100, // Restore Energy
              injury: updatedInjury,
              transferOffers: updatedOffers,
              coachingStaff: updatedCoachingStaff
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
          const homeTeam = updatedLeague.find(t => t.id === fix.homeTeamId);
          const awayTeam = updatedLeague.find(t => t.id === fix.awayTeamId);

          // Safety check: skip if teams not found
          if (!homeTeam || !awayTeam) {
              console.error(`Cannot simulate match: Teams not found (Home: ${fix.homeTeamId}, Away: ${fix.awayTeamId})`);
              return;
          }

          const result = simulateCPUMatch(homeTeam, awayTeam);

          // Update Fixture
          newFixtures[fix.index] = { ...newFixtures[fix.index], played: true, result };

          // Update Ladder (Only if regular season)
          updatedLeague = updatedLeague.map(t => {
                if (t.id === fix.homeTeamId) return updateLadderTeam(t, result, true, fix.matchType);
                if (t.id === fix.awayTeamId) return updateLadderTeam(t, result, false, fix.matchType);
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

      // Check if season has ended (after Grand Final)
      const seasonEnded = currentRound === SEASON_LENGTH + 2;

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

          // Age increment and contract management at end of season
          let newAge = prev.age;
          let updatedContract = prev.contract;
          if (seasonEnded) {
              newAge = prev.age + 1;

              // Decrement contract years
              const newYearsLeft = Math.max(0, prev.contract.yearsLeft - 1);
              updatedContract = {
                  ...prev.contract,
                  yearsLeft: newYearsLeft
              };

              // Notify player if contract is expiring
              if (newYearsLeft === 0) {
                  setTimeout(() => {
                      alert(`Your contract with ${prev.contract.clubName} has expired! You may receive transfer offers.`);
                  }, 200);
              }
          }

          // Check for forced retirement
          if (newAge >= RETIREMENT_AGE) {
              // Automatically retire player
              setTimeout(() => {
                  alert(`You have reached retirement age (${RETIREMENT_AGE}). Your career has come to an end.`);
                  retirePlayer();
              }, 100);
          }

          return {
              ...prev,
              age: newAge,
              contract: updatedContract,
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

  const dismissSeasonRecap = () => {
      setShowSeasonRecap(false);
      // Reset season stats after recap
      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              seasonStats: {
                  matches: 0,
                  goals: 0,
                  behinds: 0,
                  disposals: 0,
                  tackles: 0,
                  votes: 0,
                  premierships: 0,
                  awards: []
              }
          };
      });
  };

  const dismissAwardsCeremony = () => {
      setSeasonAwards([]);

      // If draft exists, navigate to it
      if (draftClass) {
          setView('DRAFT');
      }
  };

  // Draft Functions
  const draftProspect = (prospectId: string) => {
      if (!draftClass || !player) return;

      // Find the current pick
      const currentPick = draftClass.picks.find(p => !p.prospectId);
      if (!currentPick || currentPick.teamName !== player.contract.clubName) return;

      // Assign prospect to pick
      currentPick.prospectId = prospectId;

      setDraftClass({
          ...draftClass,
          picks: [...draftClass.picks]
      });

      // If draft is complete, mark it
      const allPicksMade = draftClass.picks.every(p => p.prospectId);
      if (allPicksMade) {
          setDraftClass({
              ...draftClass,
              completed: true
          });
      }
  };

  const simulateDraft = () => {
      if (!draftClass) return;

      // Find the current pick
      const currentPick = draftClass.picks.find(p => !p.prospectId);
      if (!currentPick) return;

      // Get available prospects
      const draftedIds = draftClass.picks.filter(p => p.prospectId).map(p => p.prospectId!);
      const availableProspects = draftClass.prospects.filter(p => !draftedIds.includes(p.id));

      if (availableProspects.length === 0) return;

      // Find team making the pick
      const team = league.find(t => t.id === currentPick.teamId);
      if (!team) return;

      // Simulate AI team's selection
      const selectedProspect = simulateDraftPick(currentPick, availableProspects, team);
      currentPick.prospectId = selectedProspect.id;

      setDraftClass({
          ...draftClass,
          picks: [...draftClass.picks]
      });

      // Check if draft is complete
      const allPicksMade = draftClass.picks.every(p => p.prospectId);
      if (allPicksMade) {
          setDraftClass({
              ...draftClass,
              completed: true
          });
      }
  };

  const completeDraft = () => {
      if (!draftClass || !player) return;

      // Check if player was drafted
      const playerProspectId = `prospect-user-${draftClass.year}`;
      const draftResult = wasPlayerDrafted(draftClass, playerProspectId);

      if (draftResult.drafted && draftResult.team) {
          // Player was drafted! Promote to AFL
          const draftedTeam = draftResult.team;

          setPlayer(prev => {
              if (!prev) return null;

              return {
                  ...prev,
                  contract: {
                      ...prev.contract,
                      tier: LeagueTier.NATIONAL,
                      clubName: draftedTeam,
                      salary: 2000, // Entry-level AFL salary
                      yearsLeft: 2 // Standard rookie contract
                  }
              };
          });

          // Generate AFL league with player's new team
          setTimeout(() => {
              let aflLeague = generateLeague(LeagueTier.NATIONAL);

              // Inject player into the team that drafted them
              if (player) {
                  aflLeague = injectPlayerIntoTeam(aflLeague, player, draftedTeam);
              }

              setLeague(aflLeague);
              setFixtures(generateFixtures(aflLeague));
              setCurrentRound(1);
              setDraftClass(null);

              alert(`🎉 Congratulations! You were drafted by ${draftedTeam} with pick #${draftResult.pickNumber}! Welcome to the AFL!`);
              setView('DASHBOARD');
          }, 500);
      } else {
          // Player was not drafted - stay in State League for another season
          setTimeout(() => {
              let stateLeague = generateLeague(LeagueTier.STATE);

              // Inject player into a State League team
              if (player) {
                  const newTeamName = stateLeague[0].name;
                  stateLeague = injectPlayerIntoTeam(stateLeague, player, newTeamName);

                  // Update player's contract with new team
                  setPlayer(prev => {
                      if (!prev) return null;
                      return {
                          ...prev,
                          contract: {
                              ...prev.contract,
                              clubName: newTeamName
                          }
                      };
                  });
              }

              setLeague(stateLeague);
              setFixtures(generateFixtures(stateLeague));
              setCurrentRound(1);
              setDraftClass(null);

              alert(`You weren't selected in the draft. Keep working hard in the State League and try again next year!`);
              setView('DASHBOARD');
          }, 500);
      }
  };

  const acceptTransfer = (offerId: string) => {
      if (!player) return;

      const offer = player.transferOffers?.find(o => o.id === offerId);
      if (!offer) return;

      const updatedPlayer = acceptTransferOffer(player, offer);
      setPlayer(updatedPlayer);

      // Update league with new team assignment
      // (Player is now on new team, old team needs new player generated)
      setLeague(prevLeague => {
          return prevLeague.map(team => {
              if (team.name === offer.clubName) {
                  // Add player to new team
                  return {
                      ...team,
                      players: team.players // In future, could add actual player swap logic
                  };
              }
              return team;
          });
      });

      // Show success message and navigate to dashboard
      setTimeout(() => {
          alert(`Transfer complete! Welcome to ${offer.clubName}!`);
          setView('DASHBOARD');
      }, 100);
  };

  const rejectTransfer = (offerId: string) => {
      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              transferOffers: (prev.transferOffers || []).filter(o => o.id !== offerId)
          };
      });
  };

  const canClaimReward = (): boolean => {
      if (!player) return false;
      return canClaimDailyReward(player.dailyRewards);
  };

  const claimReward = () => {
      if (!player || !canClaimReward()) return;

      const { updatedRewards, reward } = claimDailyReward(player.dailyRewards);

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              skillPoints: prev.skillPoints + reward.skillPoints,
              energy: Math.min(100, prev.energy + reward.energy),
              dailyRewards: updatedRewards
          };
      });
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

            // Migration for old saves missing wallet fields
            if (data.player.wallet === undefined) {
                data.player.wallet = 0;
            }
            if (data.player.lifetimeEarnings === undefined) {
                data.player.lifetimeEarnings = 0;
            }
            if (data.player.itemsPurchased === undefined) {
                data.player.itemsPurchased = [];
            }

            // Migration for old saves missing season tracking
            if (data.player.currentYear === undefined) {
                data.player.currentYear = 1;
            }
            if (data.player.seasonsPlayed === undefined) {
                data.player.seasonsPlayed = 0;
            }
            if (data.player.careerHistory === undefined) {
                data.player.careerHistory = [];
            }

            // Migration for old saves missing media reputation
            if (data.player.mediaReputation === undefined) {
                data.player.mediaReputation = initializeMediaReputation();
            }

            // Migration for old saves missing team chemistry
            if (data.player.teammates === undefined || data.player.teamChemistry === undefined) {
                const playerTeam = data.league.find((t: Team) => t.name === data.player.contract.clubName);
                if (playerTeam) {
                    const { teammates, teamChemistry } = initializeTeamChemistry(playerTeam);
                    data.player.teammates = teammates;
                    data.player.teamChemistry = teamChemistry;
                }
            }

            // Migration for old saves missing coaching staff
            if (data.player.coachingStaff === undefined) {
                data.player.coachingStaff = initializeCoachingStaff(data.player.contract.tier);
            }

            // Migration for old saves missing career events
            if (data.player.activeCareerEvents === undefined) {
                data.player.activeCareerEvents = [];
            }
            if (data.player.careerEventHistory === undefined) {
                data.player.careerEventHistory = [];
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

  const purchaseItem = (itemId: string): boolean => {
      if (!player) return false;

      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return false;

      const wallet = player.wallet || 0;
      const purchasedItems = player.itemsPurchased || [];

      // Check if already purchased (one-time items)
      if (item.oneTime && purchasedItems.includes(itemId)) {
          return false;
      }

      // Check if can afford
      if (wallet < item.price) {
          return false;
      }

      // Process purchase
      setPlayer(prev => {
          if (!prev) return null;

          const newWallet = (prev.wallet || 0) - item.price;
          const newPurchasedItems = item.oneTime
              ? [...(prev.itemsPurchased || []), itemId]
              : (prev.itemsPurchased || []);

          let updatedPlayer = {
              ...prev,
              wallet: newWallet,
              itemsPurchased: newPurchasedItems
          };

          // Apply item effects
          switch (item.effect.type) {
              case 'ENERGY':
                  updatedPlayer.energy = Math.min(100, prev.energy + item.effect.value);
                  break;
              case 'SKILL_POINTS':
                  updatedPlayer.skillPoints = prev.skillPoints + item.effect.value;
                  break;
              case 'MORALE':
                  updatedPlayer.morale = Math.min(100, Math.max(0, prev.morale + item.effect.value));
                  break;
              case 'INJURY_HEAL':
                  if (prev.injury) {
                      const newWeeks = Math.max(0, prev.injury.weeksRemaining - item.effect.value);
                      updatedPlayer.injury = newWeeks > 0 ? { ...prev.injury, weeksRemaining: newWeeks } : null;
                  }
                  break;
              case 'ATTRIBUTE_BOOST':
                  if (item.effect.attribute) {
                      const currentValue = prev.attributes[item.effect.attribute];
                      const newValue = Math.min(99, currentValue + item.effect.value);
                      updatedPlayer.attributes = {
                          ...prev.attributes,
                          [item.effect.attribute]: newValue
                      };
                      // Also increase potential if needed
                      if (newValue > prev.potential) {
                          updatedPlayer.potential = newValue;
                      }
                  }
                  break;
              case 'XP_BOOST':
                  // Store temporary boost (could be used in next match)
                  // For now, just give immediate skill points
                  updatedPlayer.skillPoints = prev.skillPoints + Math.floor(item.effect.value / 10);
                  break;
              case 'COSMETIC':
                  // Cosmetic items don't have gameplay effects
                  break;
          }

          return updatedPlayer;
      });

      return true;
  };

  // Media & Fan System Functions
  const respondToMediaFn = (eventId: string, responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE') => {
      if (!player || !player.mediaReputation) return;

      const event = player.mediaReputation.mediaEvents.find(e => e.id === eventId);
      if (!event) return;

      const respondedEvent = respondToMediaEvent(event, responseType);
      const updatedMediaRep = updateMediaReputation(player.mediaReputation, respondedEvent);

      // Remove old event and add updated one
      const updatedEvents = player.mediaReputation.mediaEvents.filter(e => e.id !== eventId);
      updatedMediaRep.mediaEvents = [...updatedEvents, respondedEvent];

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              mediaReputation: updatedMediaRep
          };
      });
  };

  const createSocialPostFn = (content: string) => {
      if (!player || !player.mediaReputation) return;

      const post = createSocialMediaPost(
          player,
          content,
          currentRound,
          player.currentYear || 1
      );

      const updatedMediaRep = updateMediaReputation(player.mediaReputation, post);
      updatedMediaRep.socialMediaPosts = (player.mediaReputation.socialMediaPosts || 0) + 1;

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              mediaReputation: updatedMediaRep
          };
      });
  };

  // Career Events Functions
  const resolveEventFn = (eventId: string) => {
      if (!player) return;

      const activeEvents = player.activeCareerEvents || [];
      const event = activeEvents.find(e => e.id === eventId);

      if (!event) return;

      const { updatedPlayer, history } = resolveCareerEvent(player, event);

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...updatedPlayer,
              activeCareerEvents: (prev.activeCareerEvents || []).filter(e => e.id !== eventId),
              careerEventHistory: [...(prev.careerEventHistory || []), history]
          };
      });
  };

  const hireCoachingStaffFn = (staffMember: any, contractType: 'PERMANENT' | 'TEMPORARY') => {
      if (!player || !player.coachingStaff) return;

      const { updatedStaff, cost } = hireStaff(player.coachingStaff, staffMember, contractType, currentRound);

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...prev,
              coachingStaff: updatedStaff,
              wallet: (prev.wallet || 0) - cost
          };
      });
  };

  const resolveEventChoiceFn = (eventId: string, choiceId: string) => {
      if (!player) return;

      const activeEvents = player.activeCareerEvents || [];
      const event = activeEvents.find(e => e.id === eventId);

      if (!event) return;

      const { updatedPlayer, updatedEvent, history } = resolveCareerEventChoice(player, event, choiceId);

      setPlayer(prev => {
          if (!prev) return null;
          return {
              ...updatedPlayer,
              activeCareerEvents: (prev.activeCareerEvents || []).filter(e => e.id !== eventId),
              careerEventHistory: [...(prev.careerEventHistory || []), history]
          };
      });
  };

  // Auto-load save file on mount
  useEffect(() => {
      if (!hasAttemptedLoad) {
          setHasAttemptedLoad(true);
          loadGame();
      }
  }, []);

  // Auto-save whenever game state changes
  useEffect(() => {
      // Only auto-save if we have a player and have attempted initial load
      if (player && hasAttemptedLoad) {
          console.log('Auto-saving game state...');
          const gameState = {
              player,
              league,
              fixtures,
              currentRound,
              lastMatchResult
          };
          try {
              localStorage.setItem('footyLegendSave', JSON.stringify(gameState));
              console.log('Game auto-saved successfully');
          } catch (e) {
              console.error("Failed to auto-save game", e);
          }
      }
  }, [player, league, fixtures, currentRound, lastMatchResult, hasAttemptedLoad]);

  const dismissFinalsIntro = () => setShowFinalsIntro(false);
  const dismissSemiFinalsResults = () => setShowSemiFinalsResults(false);
  const dismissGrandFinalResult = () => setShowGrandFinalResult(false);

  return (
    <GameContext.Provider value={{
        player, setPlayer, league, fixtures, currentRound, startNewGame, generateMatchSimulation, commitMatchResult, trainAttribute, advanceRound, simulateRound, view, setView, lastMatchResult, saveGame, loadGame, acknowledgeMilestone, retirePlayer, resetGame, canClaimReward, claimReward, showSeasonRecap, dismissSeasonRecap, seasonAwards, dismissAwardsCeremony, draftClass, draftProspect, simulateDraft, completeDraft, acceptTransfer, rejectTransfer, purchaseItem, respondToMedia: respondToMediaFn, createSocialPost: createSocialPostFn, resolveEvent: resolveEventFn, resolveEventChoice: resolveEventChoiceFn, hireCoachingStaff: hireCoachingStaffFn, showFinalsIntro, dismissFinalsIntro, showSemiFinalsResults, dismissSemiFinalsResults, showGrandFinalResult, dismissGrandFinalResult
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

export const useGameContext = useGame;
