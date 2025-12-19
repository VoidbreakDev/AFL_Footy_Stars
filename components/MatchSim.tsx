import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { generateMatchCommentary } from '../services/geminiService';
import { MatchResult, MatchEvent, Position, Team } from '../types';
import Avatar from './Avatar';

const LOADING_MESSAGES = [
    "Compiling match statistics...",
    "Checking with the goal umpire...",
    "Interviewing coaches...",
    "Cooling down players...",
    "Finalizing Brownlow votes...",
    "Generating match report..."
];

// Coordinates for a standard 18-man field + bench
const FIELD_POSITIONS = [
    // BACKLINE
    { id: 'BP1', label: 'BP', sub: 'BP', top: 85, left: 20 },
    { id: 'FB', label: 'FB', sub: 'FB', top: 92, left: 50 },
    { id: 'BP2', label: 'BP', sub: 'BP', top: 85, left: 80 },
    
    // HALF BACK
    { id: 'HBF1', label: 'HBF', sub: 'HBF', top: 70, left: 15 },
    { id: 'CHB', label: 'CHB', sub: 'CHB', top: 75, left: 50 },
    { id: 'HBF2', label: 'HBF', sub: 'HBF', top: 70, left: 85 },

    // CENTER LINE
    { id: 'W1', label: 'W', sub: 'W', top: 50, left: 10 },
    { id: 'C', label: 'C', sub: 'C', top: 50, left: 50 },
    { id: 'W2', label: 'W', sub: 'W', top: 50, left: 90 },

    // FOLLOWERS (On ball)
    { id: 'RUCK', label: 'RUCK', sub: 'RUCK', top: 42, left: 50 },
    { id: 'RR', label: 'RR', sub: 'RR', top: 55, left: 42 },
    { id: 'ROV', label: 'ROV', sub: 'ROV', top: 55, left: 58 },

    // HALF FORWARD
    { id: 'HFF1', label: 'HFF', sub: 'HFF', top: 30, left: 15 },
    { id: 'CHF', label: 'CHF', sub: 'CHF', top: 25, left: 50 },
    { id: 'HFF2', label: 'HFF', sub: 'HFF', top: 30, left: 85 },

    // FORWARD LINE
    { id: 'FP1', label: 'FP', sub: 'FP', top: 15, left: 20 },
    { id: 'FF', label: 'FF', sub: 'FF', top: 8, left: 50 },
    { id: 'FP2', label: 'FP', sub: 'FP', top: 15, left: 80 },
];

const MatchSim: React.FC = () => {
  const { player, currentRound, fixtures, league, generateMatchSimulation, commitMatchResult, view, setView, advanceRound, lastMatchResult } = useGame();
  const [simStep, setSimStep] = useState(0); // 0=Preview, 1=Q1, 2=Q2, 3=Q3, 4=Q4, 5=Result
  const [resultPage, setResultPage] = useState(1); // 1=Overview, 2=PersonalStats
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [commentary, setCommentary] = useState("");
  const [currentSimData, setCurrentSimData] = useState<MatchResult | null>(null);
  
  // Preview State
  const [previewTeamId, setPreviewTeamId] = useState<string | null>(null);

  // "Live" State
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const [isPlayingQuarter, setIsPlayingQuarter] = useState(false);
  const [liveHomeScore, setLiveHomeScore] = useState({ goals: 0, behinds: 0, total: 0 });
  const [liveAwayScore, setLiveAwayScore] = useState({ goals: 0, behinds: 0, total: 0 });

  // Determine teams
  const myTeam = league.find(t => t.name === player?.contract.clubName);
  const currentFixtureIndex = fixtures.findIndex(f => f.round === currentRound && (f.homeTeamId === myTeam?.id || f.awayTeamId === myTeam?.id));
  
  const fixtureData = currentFixtureIndex !== -1 ? fixtures[currentFixtureIndex] : null;
  const opponentId = fixtureData && myTeam ? (fixtureData.homeTeamId === myTeam.id ? fixtureData.awayTeamId : fixtureData.homeTeamId) : null;
  const opponent = league.find(t => t.id === opponentId);

  // Refs for intervals
  const quarterIntervalRef = useRef<number | null>(null);
  const loadingIntervalRef = useRef<number | null>(null);

  // Initialize preview team
  useEffect(() => {
      if (myTeam && !previewTeamId) {
          setPreviewTeamId(myTeam.id);
      }
  }, [myTeam, previewTeamId]);

  useEffect(() => {
      return () => {
          if (quarterIntervalRef.current) clearInterval(quarterIntervalRef.current);
          if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      };
  }, []);

  // Fake Progress Bar Logic
  useEffect(() => {
      if (loading) {
          setProgress(0);
          setLoadingMsgIndex(0);
          setTimeout(() => setProgress(30), 100);
          setTimeout(() => setProgress(60), 800);
          setTimeout(() => setProgress(90), 1800);
          loadingIntervalRef.current = window.setInterval(() => {
              setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
          }, 800);
      } else {
          if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
          setProgress(100);
      }
  }, [loading]);

  if (currentFixtureIndex === -1 || !player || !myTeam || !opponent || !fixtureData) return <div>Error: Match data unavailable</div>;

  const isHome = fixtureData.homeTeamId === myTeam.id;
  const homeTeam = isHome ? myTeam : opponent;
  const awayTeam = isHome ? opponent : myTeam;

  const handleStartMatch = () => {
    const result = generateMatchSimulation(currentFixtureIndex);
    setCurrentSimData(result);
    setSimStep(1);
    setResultPage(1);
    setView('MATCH_SIM');
    playQuarter(1, result);
  };

  const playQuarter = (quarterNum: number, data: MatchResult) => {
      setIsPlayingQuarter(true);
      setVisibleEvents([]);
      
      const qEvents = data.timeline.filter(e => e.quarter === quarterNum);
      let eventIndex = 0;
      const timePerEvent = 1200; 

      quarterIntervalRef.current = window.setInterval(() => {
          if (eventIndex >= qEvents.length) {
              if (quarterIntervalRef.current) clearInterval(quarterIntervalRef.current);
              setIsPlayingQuarter(false);
              return;
          }

          const event = qEvents[eventIndex];
          setVisibleEvents(prev => [event, ...prev]);
          
          if (event.type === 'GOAL') {
              const isHomeEvent = event.teamId === homeTeam.id;
              if(isHomeEvent) setLiveHomeScore(prev => ({ ...prev, goals: prev.goals + 1, total: prev.total + 6 }));
              else setLiveAwayScore(prev => ({ ...prev, goals: prev.goals + 1, total: prev.total + 6 }));
          } else if (event.type === 'BEHIND') {
               const isHomeEvent = event.teamId === homeTeam.id;
               if(isHomeEvent) setLiveHomeScore(prev => ({ ...prev, behinds: prev.behinds + 1, total: prev.total + 1 }));
               else setLiveAwayScore(prev => ({ ...prev, behinds: prev.behinds + 1, total: prev.total + 1 }));
          }

          eventIndex++;
      }, timePerEvent);
  };

  const handleNextQuarter = () => {
    if (isPlayingQuarter) return;

    if (simStep < 4) {
        const nextQ = simStep + 1;
        setSimStep(nextQ);
        if(currentSimData) playQuarter(nextQ, currentSimData);
    } else {
        if (!currentSimData) return;
        
        setLoading(true);
        commitMatchResult(currentFixtureIndex, currentSimData);
        
        generateMatchCommentary(
            fixtureData.homeTeamId === myTeam.id ? myTeam : opponent, 
            fixtureData.homeTeamId === myTeam.id ? opponent : myTeam, 
            currentSimData, 
            player
        ).then(text => {
            setCommentary(text);
            setSimStep(5);
            setLoading(false);
            setView('MATCH_RESULT');
        });
    }
  };

  const getEventIcon = (type: MatchEvent['type']) => {
      switch(type) {
          case 'GOAL': return '🏉';
          case 'BEHIND': return '🏳️';
          case 'MARK': return '👐';
          case 'TACKLE': return '🛑';
          case 'INJURY': return '🚑';
          case 'POSSESSION': return '⚡';
          case 'TURNOVER': return '🔄';
          case 'FREE_KICK': return '🎺';
          case 'RIVALRY': return '🤬';
          default: return '•';
      }
  };

  const getEventStyle = (event: MatchEvent) => {
      if (event.type === 'INJURY') return 'bg-red-900/30 border-red-500 shadow-lg shadow-red-900/20 animate-pulse';
      if (event.isPlayerInvolved) return 'bg-emerald-900/30 border-emerald-500 shadow-lg shadow-emerald-900/20';
      switch(event.type) {
          case 'GOAL': return 'bg-slate-800 border-green-500/50';
          case 'BEHIND': return 'bg-slate-800 border-slate-600';
          case 'TURNOVER': return 'bg-red-900/20 border-red-500/50';
          case 'FREE_KICK': return 'bg-yellow-900/20 border-yellow-500/50';
          case 'POSSESSION': return 'bg-slate-800 border-blue-500/30';
          case 'MARK': return 'bg-slate-800 border-purple-500/30';
          case 'TACKLE': return 'bg-slate-800 border-orange-500/30';
          default: return 'bg-slate-800 border-slate-700';
      }
  };

  const getFieldLayout = (team: Team) => {
      const roster = [...team.players];
      const fieldMap: any[] = [];
      const bench: any[] = [];

      FIELD_POSITIONS.forEach(pos => {
          const playerIndex = roster.findIndex(p => p.subPosition === pos.sub);
          if (playerIndex !== -1) {
              fieldMap.push({ ...pos, player: roster[playerIndex] });
              roster.splice(playerIndex, 1);
          } else {
              if (roster.length > 0) {
                  fieldMap.push({ ...pos, player: roster[0] });
                  roster.splice(0, 1);
              }
          }
      });
      bench.push(...roster);
      return { field: fieldMap, bench };
  };

  if (loading) {
      return (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 w-full max-w-xs">
                <div className="w-20 h-20 mx-auto mb-6 text-emerald-500 animate-bounce">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-lg shadow-emerald-500/50">
                        <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 c0-4.41,3.59-8,8-8s8,3.59,8,8C20,16.41,16.41,20,12,20z M11,6v4h2V6H11z M11,14v4h2v-4H11z"/>
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase mb-2 tracking-wider">Final Siren</h2>
                <div className="h-12 flex items-center justify-center">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse transition-all duration-300">
                        {LOADING_MESSAGES[loadingMsgIndex]}
                    </p>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full mt-6 overflow-hidden border border-slate-700 shadow-inner relative">
                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out rounded-full relative" style={{ width: `${progress}%` }}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
                    </div>
                </div>
                <div className="mt-2 text-right text-xs text-emerald-500 font-mono">{progress}%</div>
            </div>
        </div>
      );
  }

  if (view === 'MATCH_PREVIEW') {
      const displayTeam = previewTeamId === myTeam.id ? myTeam : opponent;
      const { field, bench } = getFieldLayout(displayTeam);

      return (
        <div className="flex flex-col h-full pb-24 bg-slate-950">
           <div className="bg-slate-800 p-4 border-b border-slate-700 shadow-xl z-10 relative">
                <button onClick={() => setView('DASHBOARD')} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-white hover:text-slate-900 transition-colors z-20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col items-center w-1/3">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-black mb-1 ${homeTeam.id === previewTeamId ? 'border-emerald-500 scale-110 transition-transform' : 'border-slate-600 bg-slate-700'}`} style={{ backgroundColor: homeTeam.id === previewTeamId ? undefined : undefined }}>
                             <span style={{color: homeTeam.colors[0]}}>{homeTeam.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs font-bold text-white leading-tight">{homeTeam.name}</span>
                        <span className="text-[10px] text-slate-400">{homeTeam.wins}-{homeTeam.losses}</span>
                    </div>
                    <div className="text-center w-1/3">
                        <div className="text-slate-500 font-black text-xl italic">VS</div>
                        <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded mt-1 border border-slate-700 inline-block">{homeTeam.stadium.name}</div>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-black mb-1 ${awayTeam.id === previewTeamId ? 'border-emerald-500 scale-110 transition-transform' : 'border-slate-600 bg-slate-700'}`}>
                             <span style={{color: awayTeam.colors[0]}}>{awayTeam.name.charAt(0)}</span>
                        </div>
                        <span className="text-xs font-bold text-white leading-tight">{awayTeam.name}</span>
                        <span className="text-[10px] text-slate-400">{awayTeam.wins}-{awayTeam.losses}</span>
                    </div>
                </div>
           </div>
           <div className="flex-1 relative overflow-hidden p-4 flex justify-center items-center">
               <div className="relative w-full max-w-xs aspect-[3/4] bg-green-700 border-4 border-white/80 shadow-inner overflow-hidden" style={{ borderRadius: '50%' }}>
                   <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 -translate-x-1/2"></div>
                   <div className="absolute top-1/2 left-1/2 w-full h-px bg-white/20 -translate-y-1/2"></div>
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[25%] border-b-2 border-white/30 rounded-b-[100%]"></div>
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[25%] border-t-2 border-white/30 rounded-t-[100%]"></div>
                   <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/40 -translate-x-1/2 -translate-y-1/2"></div>
                   <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                   <div className="absolute top-0 left-1/2 w-16 h-4 border-x-2 border-b-2 border-white/40 -translate-x-1/2"></div>
                   <div className="absolute bottom-0 left-1/2 w-16 h-4 border-x-2 border-t-2 border-white/40 -translate-x-1/2"></div>
                   {field.map((pos: any) => {
                       const isMe = pos.player.name === player.name;
                       return (
                        <div key={pos.id} className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-500" style={{ top: `${pos.top}%`, left: `${pos.left}%` }}>
                            <div className={`w-8 h-8 rounded-full border-2 overflow-hidden shadow-sm ${isMe ? 'border-yellow-400 scale-110 ring-2 ring-yellow-400/50' : 'border-white'}`}>
                                {isMe ? (<Avatar avatar={player.avatar} teamColors={displayTeam.colors} className="w-full h-full" />) : (<div className="w-full h-full flex items-center justify-center font-bold text-[10px]" style={{backgroundColor: displayTeam.colors[0], color: displayTeam.colors[1]}}>{pos.player.name.charAt(0)}</div>)}
                            </div>
                            <span className="text-[8px] font-bold text-white bg-black/40 px-1 rounded mt-0.5 whitespace-nowrap backdrop-blur-sm">{isMe ? 'YOU' : pos.player.name.split(' ')[1] || pos.player.name}</span>
                        </div>
                       )
                   })}
               </div>
               <div className="absolute right-2 top-10 bottom-10 flex flex-col justify-center gap-3">
                   <div className="text-[8px] font-bold text-slate-500 uppercase -rotate-90 mb-2">Interchange</div>
                   {bench.map((p: any, i: number) => (
                       <div key={i} className="w-8 h-8 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-[10px] font-bold shadow-lg relative group">
                           {p.name.charAt(0)}
                           <div className="absolute right-full mr-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{p.name}</div>
                       </div>
                   ))}
               </div>
           </div>
           <div className="px-4 pt-2 pb-4 space-y-3">
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                   <button onClick={() => setPreviewTeamId(homeTeam.id)} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${previewTeamId === homeTeam.id ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>{homeTeam.name}</button>
                   <button onClick={() => setPreviewTeamId(awayTeam.id)} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${previewTeamId === awayTeam.id ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>{awayTeam.name}</button>
               </div>
               <button onClick={handleStartMatch} className="w-full py-4 bg-white text-slate-900 font-black text-xl rounded-xl uppercase shadow-lg shadow-white/20 active:scale-95 transition-transform">First Bounce</button>
           </div>
        </div>
      );
  }

  if (simStep >= 1 && simStep <= 4 && currentSimData) {
      const myLiveScore = isHome ? liveHomeScore : liveAwayScore;
      const oppLiveScore = isHome ? liveAwayScore : liveHomeScore;

      return (
        <div className="fixed inset-0 z-50 flex flex-col h-[100dvh] bg-slate-900 overflow-hidden">
            <div className="flex flex-col h-full w-full max-w-md mx-auto">
                <div className="shrink-0 p-4 pb-0">
                    <div className="flex justify-between items-center bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl">
                        <div className="text-center w-1/3">
                            <div className="text-3xl font-bold text-emerald-400">{myLiveScore.total}</div>
                            <div className="text-xs font-mono text-emerald-600 mb-1">{myLiveScore.goals}.{myLiveScore.behinds}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{myTeam.name}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-slate-400 font-black text-xl">Q{simStep}</div>
                            <div className={`text-xs uppercase font-bold ${isPlayingQuarter ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`}>{isPlayingQuarter ? 'Live' : 'End Q'}</div>
                        </div>
                        <div className="text-center w-1/3">
                            <div className="text-3xl font-bold text-red-400">{oppLiveScore.total}</div>
                            <div className="text-xs font-mono text-red-600 mb-1">{oppLiveScore.goals}.{oppLiveScore.behinds}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{opponent.name}</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-4 space-y-3 scrollbar-hide flex flex-col-reverse">
                    {visibleEvents.length === 0 && isPlayingQuarter && (
                        <div className="text-center text-slate-600 italic py-10 animate-pulse">Waiting for play...</div>
                    )}
                    {visibleEvents.map((event, idx) => {
                        const eventTeam = league.find(t => t.id === event.teamId);
                        const teamColor = eventTeam?.colors[0] || '#64748b';
                        return (
                            <div key={idx} className={`p-3 rounded-lg text-sm border-l-4 animate-fade-in transition-all flex gap-3 items-start shrink-0 ${getEventStyle(event)} ${event.isPlayerInvolved ? 'scale-105' : ''}`}>
                                <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black border-2 border-white/20 text-xs shadow-sm" style={{ backgroundColor: teamColor, color: '#fff' }}>{eventTeam ? eventTeam.name.charAt(0) : '?'}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-bold text-xs ${event.isPlayerInvolved ? 'text-emerald-400' : event.type === 'INJURY' ? 'text-red-400' : 'text-slate-400'}`}>{event.time} • {event.type}</span>
                                    </div>
                                    <div className="text-slate-200 leading-snug break-words">{event.description}</div>
                                </div>
                                <div className="text-2xl shrink-0 opacity-80 select-none">{getEventIcon(event.type)}</div>
                            </div>
                        );
                    })}
                    {visibleEvents.length === 0 && !isPlayingQuarter && (
                         <div className="text-center text-slate-500 text-xs uppercase py-4">Quarter ready to start</div>
                    )}
                </div>
                <div className="shrink-0 p-4 pt-0 bg-slate-900">
                    <button onClick={handleNextQuarter} disabled={isPlayingQuarter} className={`w-full py-4 font-black text-xl rounded-xl uppercase tracking-widest transition-all shadow-lg ${isPlayingQuarter ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-emerald-50 active:scale-95'}`}>{isPlayingQuarter ? "Playing..." : simStep === 4 ? "Final Siren" : "Play Next Quarter"}</button>
                </div>
            </div>
        </div>
      );
  }

  if (simStep === 5 && lastMatchResult) {
      const myScore = isHome ? lastMatchResult.homeScore : lastMatchResult.awayScore;
      const oppScore = isHome ? lastMatchResult.awayScore : lastMatchResult.homeScore;
      const won = myScore.total > oppScore.total;

      const allPerformers = lastMatchResult.topPerformers || [];
      
      const homePerformers = allPerformers.filter(p => p.teamId === homeTeam.id);
      const awayPerformers = allPerformers.filter(p => p.teamId === awayTeam.id);

      const homeGoals = [...homePerformers].sort((a,b) => b.goals - a.goals).slice(0,3).filter(p => p.goals > 0);
      const homeDisp = [...homePerformers].sort((a,b) => b.disposals - a.disposals).slice(0,3);

      const awayGoals = [...awayPerformers].sort((a,b) => b.goals - a.goals).slice(0,3).filter(p => p.goals > 0);
      const awayDisp = [...awayPerformers].sort((a,b) => b.disposals - a.disposals).slice(0,3);

      return (
          <div className="p-4 pb-24 h-full flex flex-col">
              
              {resultPage === 1 && (
                  <div className="animate-fade-in flex flex-col h-full">
                      <div className={`rounded-xl p-6 text-center mb-6 border-2 ${won ? 'bg-emerald-900/20 border-emerald-500' : 'bg-red-900/20 border-red-500'}`}>
                          <h1 className={`text-4xl font-black uppercase italic mb-2 ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                              {won ? 'Victory!' : 'Defeat'}
                          </h1>
                          <div className="flex justify-center items-center gap-6 font-mono text-3xl font-bold text-white">
                              <div className="flex flex-col">
                                  <span className="text-sm font-sans text-slate-400 font-bold uppercase">{myTeam.name}</span>
                                  <span>{myScore.total}</span>
                                  <span className="text-xs font-normal text-slate-400">{myScore.goals}.{myScore.behinds}</span>
                              </div>
                              <span className="text-slate-500 text-xl">-</span>
                              <div className="flex flex-col">
                                  <span className="text-sm font-sans text-slate-400 font-bold uppercase">{opponent.name}</span>
                                  <span>{oppScore.total}</span>
                                  <span className="text-xs font-normal text-slate-400">{oppScore.goals}.{oppScore.behinds}</span>
                              </div>
                          </div>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6 shadow-lg">
                          <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 border-b border-slate-700 pb-2 tracking-widest">Match Report</h3>
                          <p className="text-sm text-slate-300 leading-relaxed italic">"{commentary}"</p>
                      </div>

                      <div className="flex-1 overflow-y-auto min-h-0">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">{homeTeam.name} Best</div>
                                  <div className="space-y-2">
                                      {homeGoals.length > 0 && (
                                          <div>
                                              <div className="text-[10px] text-emerald-500 uppercase font-bold">Goals</div>
                                              {homeGoals.map((p, i) => (
                                                  <div key={i} className="flex justify-between text-xs text-white"><span className={`truncate pr-2 ${p.isUser ? 'text-yellow-400 font-bold' : ''}`}>{p.name}</span><span className="font-mono font-bold">{p.goals}</span></div>
                                              ))}
                                          </div>
                                      )}
                                      {homeDisp.length > 0 && (
                                          <div className="mt-2">
                                              <div className="text-[10px] text-blue-500 uppercase font-bold">Disposals</div>
                                              {homeDisp.map((p, i) => (
                                                  <div key={i} className="flex justify-between text-xs text-white"><span className={`truncate pr-2 ${p.isUser ? 'text-yellow-400 font-bold' : ''}`}>{p.name}</span><span className="font-mono font-bold">{p.disposals}</span></div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">{awayTeam.name} Best</div>
                                  <div className="space-y-2">
                                      {awayGoals.length > 0 && (
                                          <div>
                                              <div className="text-[10px] text-emerald-500 uppercase font-bold">Goals</div>
                                              {awayGoals.map((p, i) => (
                                                  <div key={i} className="flex justify-between text-xs text-white"><span className={`truncate pr-2 ${p.isUser ? 'text-yellow-400 font-bold' : ''}`}>{p.name}</span><span className="font-mono font-bold">{p.goals}</span></div>
                                              ))}
                                          </div>
                                      )}
                                      {awayDisp.length > 0 && (
                                          <div className="mt-2">
                                              <div className="text-[10px] text-blue-500 uppercase font-bold">Disposals</div>
                                              {awayDisp.map((p, i) => (
                                                  <div key={i} className="flex justify-between text-xs text-white"><span className={`truncate pr-2 ${p.isUser ? 'text-yellow-400 font-bold' : ''}`}>{p.name}</span><span className="font-mono font-bold">{p.disposals}</span></div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <button 
                        onClick={() => setResultPage(2)}
                        className="w-full py-4 bg-white text-slate-900 font-black text-xl rounded-xl uppercase tracking-widest shadow-lg mt-4 hover:bg-gray-100 active:scale-95 transition-all"
                      >
                        Player Stats &rarr;
                      </button>
                  </div>
              )}

              {resultPage === 2 && (
                  <div className="animate-fade-in flex flex-col h-full">
                      <div className="text-center mb-6">
                          <h2 className="text-2xl font-black text-white uppercase italic">Performance</h2>
                          <p className="text-slate-400 text-sm">Your impact on the game</p>
                      </div>

                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6 shadow-xl">
                          <div className="flex items-center justify-center mb-6">
                               <div className="w-20 h-20 rounded-full border-4 border-emerald-500 overflow-hidden shadow-lg">
                                   <Avatar avatar={player.avatar} teamColors={myTeam.colors} className="w-full h-full" />
                               </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{lastMatchResult.playerStats.disposals}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Disposals</div>
                              </div>
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{lastMatchResult.playerStats.goals}.{lastMatchResult.playerStats.behinds}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
                              </div>
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{lastMatchResult.playerStats.tackles}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tackles</div>
                              </div>
                               <div className={`bg-slate-900/50 p-3 rounded-lg text-center border ${lastMatchResult.playerStats.votes > 0 ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-slate-700/50'}`}>
                                  <div className={`text-3xl font-black ${lastMatchResult.playerStats.votes > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>{lastMatchResult.playerStats.votes}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Votes</div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-3 mb-6">
                          <div className="bg-gradient-to-r from-yellow-900/40 to-slate-800 p-4 rounded-xl border border-yellow-600/30 flex justify-between items-center animate-pulse">
                              <div className="flex items-center gap-3">
                                  <div className="text-2xl">⚡</div>
                                  <div>
                                      <div className="text-yellow-400 font-bold text-sm uppercase">Development</div>
                                      <div className="text-white text-xs">Experience gained from match</div>
                                  </div>
                              </div>
                              <div className="font-black text-xl text-yellow-400">+1 SP</div>
                          </div>

                          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                  <div className="text-2xl">{player.morale >= 50 ? '🔥' : '❄️'}</div>
                                  <div>
                                      <div className="text-white font-bold text-sm uppercase">Morale</div>
                                      <div className="text-slate-400 text-xs">Current State</div>
                                  </div>
                              </div>
                              <div className={`font-bold text-lg ${player.morale >= 80 ? 'text-emerald-400' : player.morale <= 40 ? 'text-red-400' : 'text-white'}`}>
                                  {player.morale}
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                          {lastMatchResult.playerInjury && (
                              <div className="bg-red-900/30 border border-red-500 p-3 rounded-xl flex items-center gap-3">
                                   <div className="text-2xl">🤕</div>
                                   <div>
                                       <div className="text-red-400 font-bold text-xs uppercase">Injury Sustained</div>
                                       <div className="text-white text-sm font-bold">{lastMatchResult.playerInjury.name}</div>
                                       <div className="text-red-300 text-xs">{lastMatchResult.playerInjury.weeksRemaining} week recovery</div>
                                   </div>
                              </div>
                          )}

                          {lastMatchResult.newRivalry && (
                               <div className="bg-orange-900/30 border border-orange-500 p-3 rounded-xl flex items-center gap-3">
                                   <div className="text-2xl">🤬</div>
                                   <div>
                                       <div className="text-orange-400 font-bold text-xs uppercase">Rivalry Started</div>
                                       <div className="text-white text-sm">vs <span className="font-bold">{lastMatchResult.newRivalry.opponentName}</span></div>
                                   </div>
                               </div>
                          )}
                          
                          {lastMatchResult.achievedMilestones && lastMatchResult.achievedMilestones.map((m, i) => (
                              <div key={i} className="bg-yellow-600/20 border border-yellow-500 p-3 rounded-xl flex items-center gap-3">
                                  <div className="text-2xl">🏆</div>
                                  <div>
                                      <div className="text-yellow-400 font-bold text-xs uppercase">Milestone Reached</div>
                                      <div className="text-white text-sm font-bold">{m.description}</div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <button 
                        onClick={advanceRound}
                        className="w-full py-4 bg-emerald-500 text-slate-900 font-black text-xl rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-900/50 mt-4 hover:bg-emerald-400 active:scale-95 transition-all"
                      >
                        Continue Season
                      </button>
                  </div>
              )}
          </div>
      );
  }

  return null;
};

export default MatchSim;