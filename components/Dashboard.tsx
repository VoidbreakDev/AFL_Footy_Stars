import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Fixture, Milestone, MediaEvent } from '../types';
import { SEASON_LENGTH } from '../constants';
import Avatar from './Avatar';
import DailyRewardModal from './DailyRewardModal';
import SeasonRecap from './SeasonRecap';
import AwardsCeremony from './AwardsCeremony';
import PostMatchPress from './PostMatchPress';
import FinalsIntro from './FinalsIntro';
import SemiFinalsResults from './SemiFinalsResults';
import GrandFinalResult from './GrandFinalResult';
import TeamLogo from './TeamLogo';
import TipCard from './TipCard';
import DerbyBuildup from './DerbyBuildup';
import MatchPredictionCard from './MatchPredictionCard';
import StoryArcPanel from './StoryArcPanel';
import { getDailyRewardForStreak } from '../utils/dailyRewardUtils';

const Dashboard: React.FC = () => {
  const { player, setPlayer, currentRound, fixtures, league, setView, simulateRound, lastMatchResult, acknowledgeMilestone, canClaimReward, claimReward, showSeasonRecap, dismissSeasonRecap, seasonAwards, dismissAwardsCeremony, respondToMedia, showFinalsIntro, dismissFinalsIntro, showSemiFinalsResults, dismissSemiFinalsResults, showGrandFinalResult, dismissGrandFinalResult, resolveStoryArcAction } = useGame();
  const [showMilestone, setShowMilestone] = useState<Milestone | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showMediaEvent, setShowMediaEvent] = useState<MediaEvent | null>(null);
  const [showDerbyBuildup, setShowDerbyBuildup] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [guideStep, setGuideStep] = useState<number | null>(null);

  useEffect(() => {
    if (lastMatchResult && lastMatchResult.achievedMilestones && lastMatchResult.achievedMilestones.length > 0) {
        setShowMilestone(lastMatchResult.achievedMilestones[0]);
    }
  }, [lastMatchResult]);

  // Check for daily reward on mount
  useEffect(() => {
    if (canClaimReward()) {
      setShowDailyReward(true);
    }
  }, []);

  // Check for unresponded media events
  useEffect(() => {
    if (player?.mediaReputation) {
      const unrespondedEvents = player.mediaReputation.mediaEvents.filter(e => !e.hasResponded);
      if (unrespondedEvents.length > 0 && !showMediaEvent) {
        // Show the most recent unresponded event
        setShowMediaEvent(unrespondedEvents[unrespondedEvents.length - 1]);
      }
    }
  }, [player?.mediaReputation?.mediaEvents]);

  const handleMediaResponse = (responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE') => {
    if (showMediaEvent && respondToMedia) {
      respondToMedia(showMediaEvent.id, responseType);
      setShowMediaEvent(null);
    }
  };

  if (!player) return null;

  const myTeam = league.find(t => t.name === player.contract.clubName);
  const currentFixture = fixtures.find(f => f.round === currentRound && (f.homeTeamId === myTeam?.id || f.awayTeamId === myTeam?.id));
  const isHome = currentFixture?.homeTeamId === myTeam?.id;
  const opponent = currentFixture 
    ? league.find(t => t.id === (currentFixture.homeTeamId === myTeam?.id ? currentFixture.awayTeamId : currentFixture.homeTeamId))
    : null;

  const lastFixture = fixtures.find(f => f.round === currentRound - 1 && (f.homeTeamId === myTeam?.id || f.awayTeamId === myTeam?.id));
  const lastOpponent = lastFixture?.played
     ? league.find(t => t.id === (lastFixture.homeTeamId === myTeam?.id ? lastFixture.awayTeamId : lastFixture.homeTeamId))
     : null;

  const totalAttrs = (Object.values(player.attributes) as number[]).reduce((a, b) => a + b, 0);
  const avgRating = Math.floor(totalAttrs / 7); 

  const renderStars = (rating: number) => {
      const starCount = Math.max(1, Math.min(5, Math.round(rating / 20)));
      return (
        <div className="flex justify-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
                key={star} 
                className={`text-xs ${star <= starCount ? 'text-yellow-400' : 'text-slate-600'}`}
            >
                ★
            </span>
          ))}
        </div>
      );
  };

  const isFinals = currentRound > SEASON_LENGTH;
  const isGrandFinal = currentRound === SEASON_LENGTH + 2;
  const isEliminated = isFinals && !currentFixture;

  // Count pending alerts for notification badge
  const pendingAlerts = [
    player.injury ? 1 : 0,
    (player.transferOffers?.length || 0) > 0 ? 1 : 0,
    (player.mediaReputation?.mediaEvents?.filter(e => !e.hasResponded).length || 0) > 0 ? 1 : 0,
    (player.activeCareerEvents?.length || 0) > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0); 

  return (
    <div className="p-4 space-y-6 pb-24 relative">

      <TipCard
        tipKey="DASHBOARD"
        title="Welcome to your career!"
        body="Tap 'Play Match' each round to earn XP and progress your career. Check your energy and morale before each game."
      />

      {/* Post-Match Press Conference Modal */}
      {showMediaEvent && (
        <PostMatchPress
          event={showMediaEvent}
          onRespond={handleMediaResponse}
          playerName={player.name}
        />
      )}

      {showMilestone && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 animate-fade-in" onClick={() => { setShowMilestone(null); acknowledgeMilestone(); }} style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
        }}>
               <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-1 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                   
                   <div className="bg-slate-900 rounded-xl p-8 text-center border border-yellow-500/50 relative z-10">
                       <div className="text-6xl mb-4 animate-bounce">🏆</div>
                       <h2 className="text-2xl font-black text-yellow-400 uppercase italic mb-2">Milestone!</h2>
                       <div className="w-16 h-1 bg-yellow-500 mx-auto mb-6"></div>
                       
                       <h3 className="text-3xl font-black text-white mb-2">{showMilestone.value}</h3>
                       <p className="text-slate-300 uppercase tracking-widest text-sm font-bold mb-8">{showMilestone.type}</p>
                       
                       <button 
                        onClick={(e) => { e.stopPropagation(); setShowMilestone(null); acknowledgeMilestone(); }}
                        className="w-full py-3 bg-yellow-500 text-slate-900 font-black uppercase rounded-lg shadow-lg hover:bg-yellow-400 transition-colors"
                       >
                           Celebrate
                       </button>
                   </div>
               </div>
          </div>
      )}

      <div className="flex items-center justify-between">
         <div>
             <h2 className={`text-3xl font-black italic uppercase ${isGrandFinal ? 'text-yellow-400' : 'text-white'}`}>
                 {isGrandFinal ? 'Grand Final' : isFinals ? 'Finals Series' : 'Match Day'}
             </h2>
             <p className="text-slate-400 text-sm">
                 {isFinals ? `Finals Week ${currentRound - SEASON_LENGTH}` : `Round ${currentRound} of ${SEASON_LENGTH}`}
             </p>
         </div>
         <div className="flex items-center gap-2">
            <div className="bg-emerald-900/30 p-2 px-4 rounded-full border border-emerald-500/30">
                <span className="text-emerald-400 font-bold text-sm">{player.contract.clubName}</span>
            </div>
            <button 
                onClick={() => setView('SETTINGS')}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
         </div>
      </div>

      {player.injury && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl animate-fade-in shadow-lg">
              <div className="flex items-start gap-3">
                  <div className="text-2xl">🚑</div>
                  <div>
                      <h3 className="font-bold text-red-400 uppercase text-sm">Medical Report</h3>
                      <p className="text-white font-bold text-lg">{player.injury.name}</p>
                      <p className="text-red-300 text-sm">Unavailable for {player.injury.weeksRemaining} week{player.injury.weeksRemaining > 1 ? 's' : ''}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Compact Notification Row */}
      {pendingAlerts > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {player.transferOffers && player.transferOffers.length > 0 && (
                  <button
                      onClick={() => setView('TRANSFER_MARKET')}
                      className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/40 px-3 py-2 rounded-xl shadow-lg animate-fade-in"
                  >
                      <span className="text-lg">📨</span>
                      <div className="text-left">
                          <div className="text-purple-400 font-bold text-xs uppercase">Transfer</div>
                          <div className="text-white text-xs">{player.transferOffers.length} {player.transferOffers.length === 1 ? 'offer' : 'offers'}</div>
                      </div>
                  </button>
              )}
              {player.mediaReputation && player.mediaReputation.mediaEvents.filter(e => !e.hasResponded).length > 0 && (
                  <button
                      onClick={() => setView('MEDIA_HUB')}
                      className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-500/40 px-3 py-2 rounded-xl shadow-lg animate-fade-in"
                  >
                      <span className="text-lg">📱</span>
                      <div className="text-left">
                          <div className="text-pink-400 font-bold text-xs uppercase">Media</div>
                          <div className="text-white text-xs">{player.mediaReputation.mediaEvents.filter(e => !e.hasResponded).length} event{player.mediaReputation.mediaEvents.filter(e => !e.hasResponded).length > 1 ? 's' : ''}</div>
                      </div>
                  </button>
              )}
              {player.activeCareerEvents && player.activeCareerEvents.length > 0 && (
                  <button
                      onClick={() => setView('CAREER_EVENTS')}
                      className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-900/60 to-orange-900/60 border border-amber-500/40 px-3 py-2 rounded-xl shadow-lg animate-fade-in"
                  >
                      <span className="text-lg">✨</span>
                      <div className="text-left">
                          <div className="text-amber-400 font-bold text-xs uppercase">Events</div>
                          <div className="text-white text-xs">{player.activeCareerEvents.length} available</div>
                      </div>
                  </button>
              )}
          </div>
      )}

      {/* Quick-Access Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
              onClick={() => setView('TRAINING')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-700 transition-colors active:scale-95"
          >
              <span className="text-lg">💪</span>
              <span>Train</span>
          </button>
          
          <button
              onClick={() => setView('SHOP')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-700 transition-colors active:scale-95 relative"
          >
              <span className="text-lg">🛒</span>
              <span>Shop</span>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  ${(player.wallet || 0).toLocaleString()}
              </div>
          </button>
          
          <button
              onClick={() => setView('MASTER_SKILLS')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-700 transition-colors active:scale-95 relative"
          >
              <span className="text-lg">⭐</span>
              <span>Skill Tree</span>
              {player.skillPoints && player.skillPoints > 0 && (
                  <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                      {player.skillPoints}
                  </div>
              )}
          </button>
          
          <button
              onClick={() => setView('HUB')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 min-h-[44px] bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold uppercase hover:bg-slate-700 transition-colors active:scale-95"
          >
              <span className="text-lg">📱</span>
              <span>Hub</span>
          </button>
      </div>

      {/* Match Prediction Card */}
      {showPrediction && currentFixture && (
        <MatchPredictionCard
          homeTeam={isHome ? myTeam?.name || '' : opponent?.name || ''}
          awayTeam={isHome ? opponent?.name || '' : myTeam?.name || ''}
          playerAvgDisposals={player.seasonStats.matches > 0 ? player.seasonStats.disposals / player.seasonStats.matches : 15}
          playerAvgGoals={player.seasonStats.matches > 0 ? player.seasonStats.goals / player.seasonStats.matches : 1}
          initialPrediction={player.matchPrediction && !player.matchPrediction.completed ? player.matchPrediction : undefined}
          onSubmit={({ margin, disposals, goals }) => {
            setPlayer(prev => prev ? {
              ...prev,
              matchPrediction: {
                round: currentRound,
                year: prev.currentYear || 1,
                predictedMargin: margin,
                predictedDisposals: disposals,
                predictedGoals: goals,
                completed: false,
              }
            } : null);
            setShowPrediction(false);
          }}
          onCancel={() => setShowPrediction(false)}
        />
      )}

      <div className={`rounded-2xl border overflow-hidden shadow-xl relative ${isGrandFinal ? 'bg-gradient-to-br from-yellow-900 to-slate-900 border-yellow-500' : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${isGrandFinal ? 'bg-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-yellow-400'}`}></div>
        
        <div className="p-6 text-center">
            {isEliminated ? (
                <div className="py-4">
                    <div className="text-4xl mb-3">📺</div>
                    <h3 className="text-xl font-bold text-slate-300 uppercase">Season Over</h3>
                    <p className="text-slate-500 text-sm mb-4">You did not qualify for this round of finals.</p>
                    
                    <button 
                       onClick={simulateRound}
                       className="w-full py-3 bg-slate-700 text-white font-bold uppercase rounded-lg hover:bg-slate-600 transition-colors shadow-lg"
                    >
                        Simulate Finals
                    </button>
                </div>
            ) : currentFixture ? (
                <>
                    <div className={`text-xs font-bold uppercase mb-4 tracking-widest ${isGrandFinal ? 'text-yellow-400 animate-pulse' : 'text-slate-400'}`}>
                        {isGrandFinal ? '🏆 The Big Dance 🏆' : 'Upcoming Match'}
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col items-center w-1/3">
                            {myTeam && <TeamLogo team={myTeam} size="lg" showBorder={isGrandFinal} />}
                            <span className="mt-2 font-bold text-sm leading-tight">{myTeam?.name}</span>
                            <span className="text-xs text-slate-400">{myTeam?.wins}-{myTeam?.losses}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-500 italic">VS</div>
                        <div className="flex flex-col items-center w-1/3">
                            {opponent && <TeamLogo team={opponent} size="lg" showBorder={isGrandFinal} />}
                            <span className="mt-2 font-bold text-sm leading-tight">{opponent?.name}</span>
                            <span className="text-xs text-slate-400">{opponent?.wins}-{opponent?.losses}</span>
                        </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-lg p-2 text-xs text-slate-400 mb-4">
                        Venue: {currentFixture.homeTeamId === myTeam?.id ? myTeam?.stadium.name : opponent?.stadium.name}
                    </div>
                    
                    {player.injury ? (
                         <button 
                            onClick={simulateRound}
                            className="w-full py-3 bg-slate-700 text-slate-300 font-bold uppercase rounded-lg hover:bg-slate-600 transition-colors shadow-lg"
                         >
                             Simulate Round (Injured)
                         </button>
                    ) : (
                         <>
                         {/* Prediction Section */}
                         {!player.matchPrediction && !showPrediction && (
                             <button
                                onClick={() => setShowPrediction(true)}
                                className="w-full py-2 bg-blue-900/40 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase rounded-lg mb-2 hover:bg-blue-900/60 transition-colors"
                             >
                                 🎯 Make Predictions — Win bonus $ &amp; XP
                             </button>
                         )}
                         {player.matchPrediction && !player.matchPrediction.completed && !showPrediction && (
                             <div className="w-full py-2 bg-blue-900/40 border border-blue-500/30 rounded-lg mb-2 flex items-center justify-between px-3">
                                 <div className="text-left">
                                     <div className="text-blue-400 font-bold text-xs uppercase">🎯 Predictions Locked In</div>
                                     <div className="text-slate-400 text-[10px]">
                                         {player.matchPrediction.predictedMargin} • {player.matchPrediction.predictedDisposals} disp • {player.matchPrediction.predictedGoals} goals
                                     </div>
                                 </div>
                                 <button
                                    onClick={() => setShowPrediction(true)}
                                    className="text-blue-400 text-xs font-bold hover:text-blue-300"
                                 >
                                     Edit
                                 </button>
                             </div>
                         )}
                         {player.matchPrediction?.completed && !showPrediction && (
                             <div className="w-full py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg mb-2 flex items-center justify-between px-3">
                                 <div className="text-left">
                                     <div className="text-slate-400 font-bold text-xs uppercase">🎯 Predictions Complete</div>
                                     <div className="text-slate-500 text-[10px]">
                                         Margin: ${player.matchPrediction.marginReward || 0} • Stats: +{player.matchPrediction.statReward || 0} XP
                                     </div>
                                 </div>
                             </div>
                         )}
                         <button
                            onClick={() => {
                              const isDerby = player.rivalries?.some(r => r.club === opponent?.name && !r.resolved);
                              if (isDerby) {
                                setShowDerbyBuildup(true);
                              } else {
                                setView('MATCH_PREVIEW');
                              }
                            }}
                            className={`w-full py-3 text-slate-900 font-bold uppercase rounded-lg transition-colors shadow-lg ${isGrandFinal ? 'bg-yellow-400 hover:bg-yellow-300 shadow-yellow-500/30' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20'}`}
                         >
                             {player.rivalries?.some(r => r.club === opponent?.name && !r.resolved) ? '🔥 Derby Match' : 'Go to Match'}
                         </button>
                         </>
                    )}
                </>
            ) : (
                <div className="py-10">
                    <h3 className="text-xl font-bold text-slate-300">Season Finished!</h3>
                    <p className="text-slate-500 text-sm mb-4">Review your stats in the player menu.</p>
                </div>
            )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-4 border-b border-slate-700 pb-4 mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500 overflow-hidden">
                <Avatar avatar={player.avatar} teamColors={myTeam?.colors} className="w-full h-full" />
              </div>
              <div>
                  <h3 className="font-bold text-lg text-white">{player.name}</h3>
                  <p className="text-sm text-emerald-400">{player.position} • Level {player.level}</p>
                  <p className="text-xs text-slate-400">{player.contract.clubName}</p>
              </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-700/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase">Avg Disp</div>
                  <div className="font-mono font-bold text-emerald-300">
                      {player.careerStats.matches > 0 ? (player.careerStats.disposals / player.careerStats.matches).toFixed(1) : 0}
                  </div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase">Goals</div>
                  <div className="font-mono font-bold text-emerald-300">{player.careerStats.goals}</div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-400 uppercase">Rating</div>
                  {renderStars(avgRating)}
              </div>
          </div>
      </div>

      {lastFixture && lastFixture.result && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 opacity-75">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Last Match</div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{myTeam?.name}</span>
                <span className="font-mono text-emerald-400">{lastFixture.result.homeScore.total} - {lastFixture.result.awayScore.total}</span>
                <span className="font-bold text-right">{lastOpponent?.name}</span>
              </div>
              <div className="text-xs text-slate-300 italic">
                  "{lastFixture.result.summary.slice(0, 60)}..."
              </div>
          </div>
      )}

      {/* Season Objectives Card */}
      {player.seasonObjectives && player.seasonObjectives.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-3 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <h3 className="text-sm font-black text-white uppercase">Season Objectives</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{player.seasonObjectives.filter(o => o.completed).length}/{player.seasonObjectives.length} Done</span>
                  </div>
              </div>
              <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {player.seasonObjectives.map((obj) => {
                      const pct = obj.target > 0 ? Math.min(100, Math.round((obj.progress / obj.target) * 100)) : 0;
                      const rarityColor = obj.rarity === 'RARE' ? 'text-amber-400' : obj.rarity === 'UNCOMMON' ? 'text-blue-400' : 'text-slate-400';
                      const rarityIcon = obj.rarity === 'RARE' ? '★★' : obj.rarity === 'UNCOMMON' ? '★' : '☆';
                      return (
                          <div key={obj.id} className={`rounded-lg p-2.5 border ${obj.completed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                          {obj.completed && <span className="text-emerald-400 text-xs">✅</span>}
                                          <span className={`text-xs font-bold ${obj.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>{obj.description}</span>
                                      </div>
                                  </div>
                                  <span className={`text-[9px] font-bold ${rarityColor} ml-2`}>{rarityIcon}</span>
                              </div>
                              {!obj.completed && (
                                  <div className="mt-1.5">
                                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                          <div
                                              className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-slate-600'}`}
                                              style={{ width: `${pct}%` }}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between mt-0.5">
                                          <span className="text-[9px] text-slate-500">{obj.progress}/{obj.target}</span>
                                          <span className="text-[9px] text-slate-500">
                                              {obj.reward.xp && `+${obj.reward.xp}XP `}
                                              {obj.reward.skillPoints && `+${obj.reward.skillPoints}SP`}
                                              {obj.reward.wallet && `+$${(obj.reward.wallet / 1000).toFixed(0)}K`}
                                          </span>
                                      </div>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      {/* Season Story Arcs */}
      {player && (player.activeStoryArcs?.length || 0) + (player.completedStoryArcs?.length || 0) > 0 && (
          <StoryArcPanel
            activeArcs={player.activeStoryArcs || []}
            completedArcs={player.completedStoryArcs || []}
            onResolveChoice={(arcId, eventId, choiceId) => {
              // This will be wired through context in full implementation
              resolveStoryArcAction(arcId, eventId, choiceId);
            }}
          />
      )}

      {/* Daily Reward Modal */}
      {showDailyReward && player && (
        <DailyRewardModal
          streak={player.dailyRewards?.streak || 1}
          skillPoints={getDailyRewardForStreak(player.dailyRewards?.streak || 1).skillPoints}
          energy={getDailyRewardForStreak(player.dailyRewards?.streak || 1).energy}
          description={getDailyRewardForStreak(player.dailyRewards?.streak || 1).description}
          onClaim={() => {
            claimReward();
            setShowDailyReward(false);
            // Show first-round guide for brand-new players (seenTips is {})
            if (player && player.seenTips !== undefined && Object.keys(player.seenTips).length === 0) {
              setGuideStep(1);
            }
          }}
        />
      )}

      {/* First-Round Guide Overlay (shown after daily login for new players) */}
      {guideStep !== null && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-6 pb-24" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh'
        }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-xs text-slate-500 mb-1 uppercase tracking-widest">Step {guideStep} of 3</div>
            {guideStep === 1 && (
              <>
                <h3 className="font-black text-lg text-white mb-2">Play Your First Match</h3>
                <p className="text-slate-400 text-sm mb-4">Tap the football button in the centre of the nav bar to go to your dashboard and play your first match. You'll earn XP and your first Skill Point.</p>
              </>
            )}
            {guideStep === 2 && (
              <>
                <h3 className="font-black text-lg text-white mb-2">Train After Matches</h3>
                <p className="text-slate-400 text-sm mb-4">After each match, visit Training (the lightning bolt) to spend Skill Points and improve your attributes.</p>
              </>
            )}
            {guideStep === 3 && (
              <>
                <h3 className="font-black text-lg text-white mb-2">Track Your Progress</h3>
                <p className="text-slate-400 text-sm mb-4">Tap "Me" in the nav bar to see your career stats, season breakdown, and milestones.</p>
              </>
            )}
            <button
              onClick={() => {
                if (guideStep < 3) {
                  setGuideStep(guideStep + 1);
                } else {
                  setGuideStep(null);
                }
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl py-3 font-black uppercase tracking-wider active:scale-95 transition-all"
            >
              {guideStep < 3 ? "Got it →" : "Let's Go!"}
            </button>
          </div>
        </div>
      )}

      {/* Season Recap Modal */}
      {showSeasonRecap && (
        <SeasonRecap onContinue={dismissSeasonRecap} />
      )}

      {/* Awards Ceremony Modal */}
      {seasonAwards.length > 0 && player && (
        <AwardsCeremony
          awards={seasonAwards}
          playerName={player.name}
          onDismiss={dismissAwardsCeremony}
          leagueGender={player.leagueGender}
        />
      )}

      {/* Finals Intro Modal */}
      {showFinalsIntro && player && (
        <FinalsIntro
          player={player}
          league={league}
          onContinue={dismissFinalsIntro}
        />
      )}

      {/* Semi Finals Results Modal */}
      {showSemiFinalsResults && (
        <SemiFinalsResults
          fixtures={fixtures}
          league={league}
          onContinue={dismissSemiFinalsResults}
        />
      )}

      {/* Grand Final Result Modal */}
      {showGrandFinalResult && player && (() => {
        const grandFinal = fixtures.find(f => f.round === SEASON_LENGTH + 2);
        return grandFinal ? (
          <GrandFinalResult
            fixture={grandFinal}
            league={league}
            player={player}
            onContinue={dismissGrandFinalResult}
          />
        ) : null;
      })()}

      {/* Derby Buildup Modal */}
      {showDerbyBuildup && opponent && (() => {
        const derbyRivalry = player.rivalries?.find(r => r.club === opponent.name && !r.resolved);
        if (!derbyRivalry) return null;
        return (
          <DerbyBuildup
            rivalry={derbyRivalry}
            opponentName={opponent.name}
            opponentRecord={`${opponent.wins}-${opponent.losses}`}
            onProceed={() => {
              setShowDerbyBuildup(false);
              setView('MATCH_PREVIEW');
            }}
          />
        );
      })()}
    </div>
  );
};

export default Dashboard;