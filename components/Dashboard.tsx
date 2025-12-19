import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Fixture, Milestone } from '../types';
import { SEASON_LENGTH } from '../constants';
import Avatar from './Avatar';
import DailyRewardModal from './DailyRewardModal';
import SeasonRecap from './SeasonRecap';
import { getDailyRewardForStreak } from '../utils/dailyRewardUtils';

const Dashboard: React.FC = () => {
  const { player, currentRound, fixtures, league, setView, simulateRound, lastMatchResult, acknowledgeMilestone, canClaimReward, claimReward, showSeasonRecap, dismissSeasonRecap } = useGame();
  const [showMilestone, setShowMilestone] = useState<Milestone | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);

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

  if (!player) return null;

  const myTeam = league.find(t => t.name === player.contract.clubName);
  const currentFixture = fixtures.find(f => f.round === currentRound && (f.homeTeamId === myTeam?.id || f.awayTeamId === myTeam?.id));
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

  return (
    <div className="p-4 space-y-6 pb-24 relative">
      
      {showMilestone && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 animate-fade-in" onClick={() => { setShowMilestone(null); acknowledgeMilestone(); }}>
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
                            <div className={`w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-black border-2 ${isGrandFinal ? 'border-yellow-500' : 'border-slate-600'}`}>
                                {myTeam?.name.charAt(0)}
                            </div>
                            <span className="mt-2 font-bold text-sm leading-tight">{myTeam?.name}</span>
                            <span className="text-xs text-slate-400">{myTeam?.wins}-{myTeam?.losses}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-500 italic">VS</div>
                        <div className="flex flex-col items-center w-1/3">
                            <div className={`w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-black border-2 ${isGrandFinal ? 'border-yellow-500' : 'border-slate-600'}`}>
                                {opponent?.name.charAt(0)}
                            </div>
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
                         <button 
                            onClick={() => setView('MATCH_PREVIEW')}
                            className={`w-full py-3 text-slate-900 font-bold uppercase rounded-lg transition-colors shadow-lg ${isGrandFinal ? 'bg-yellow-400 hover:bg-yellow-300 shadow-yellow-500/30' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20'}`}
                         >
                             Go to Match
                         </button>
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
          }}
        />
      )}

      {/* Season Recap Modal */}
      {showSeasonRecap && (
        <SeasonRecap onContinue={dismissSeasonRecap} />
      )}
    </div>
  );
};

export default Dashboard;