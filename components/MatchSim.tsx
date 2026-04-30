import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { generateMatchCommentary } from '../services/geminiService';
import { MatchResult, MatchEvent, Position, Team, Tactic } from '../types';
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

const getEventDelay = (type: MatchEvent['type']): number => {
  const delays: Partial<Record<MatchEvent['type'], number>> = {
    GOAL:        2300,
    INJURY:      2700,
    RIVALRY:     2100,
    BEHIND:      1700,
    MARK:        1600,
    FREE_KICK:   1600,
    INTERCEPT:   1800,
    ONE_ON_ONE:             1600,
    ONE_ON_ONE_DEFENSIVE:   1600,
    HIT_OUT:     1400,
    TACKLE:      1500,
    POSSESSION:  1350,
    TURNOVER:    1450,
  };
  return delays[type] ?? 1300;
};

const MatchSim: React.FC = () => {
  const { player, currentRound, fixtures, league, generateMatchSimulation, commitMatchResult, view, setView, advanceRound, lastMatchResult } = useGame();
  const [simStep, setSimStep] = useState(0); // 0=Preview, 1=Q1, 2=Q2, 3=Q3, 4=Q4, 5=Result
  const [resultPage, setResultPage] = useState(1); // 1=Overview, 2=PersonalStats
  const [activeResultTab, setActiveResultTab] = useState<'stats' | 'highlights'>('stats');
  const [selectedTactic, setSelectedTactic] = useState<Tactic>('BALANCED');
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
  const quarterTimeoutsRef = useRef<number[]>([]);

  // Initialize preview team
  useEffect(() => {
      if (myTeam && !previewTeamId) {
          setPreviewTeamId(myTeam.id);
      }
  }, [myTeam, previewTeamId]);

  // Cleanup intervals when component unmounts or view changes
  useEffect(() => {
      return () => {
          if (quarterIntervalRef.current) clearInterval(quarterIntervalRef.current);
          if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
          quarterTimeoutsRef.current.forEach(id => window.clearTimeout(id));
          quarterTimeoutsRef.current = [];
      };
  }, []);

  // Clear intervals when view changes away from match screens
  useEffect(() => {
      if (view !== 'MATCH_PREVIEW' && view !== 'MATCH_SIM' && view !== 'MATCH_RESULT') {
          if (quarterIntervalRef.current) {
              clearInterval(quarterIntervalRef.current);
              quarterIntervalRef.current = null;
          }
          if (loadingIntervalRef.current) {
              clearInterval(loadingIntervalRef.current);
              loadingIntervalRef.current = null;
          }
          quarterTimeoutsRef.current.forEach(id => window.clearTimeout(id));
          quarterTimeoutsRef.current = [];
      }
  }, [view]);

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
    const result = generateMatchSimulation(currentFixtureIndex, selectedTactic);
    setCurrentSimData(result);
    setSimStep(1);
    setResultPage(1);
    setView('MATCH_SIM');
    playQuarter(1, result);
  };

  const playQuarter = (quarterNum: number, data: MatchResult) => {
      quarterTimeoutsRef.current.forEach(id => window.clearTimeout(id));
      quarterTimeoutsRef.current = [];
      setIsPlayingQuarter(true);
      setVisibleEvents([]);
      
      const qEvents = data.timeline.filter(e => e.quarter === quarterNum);

      const scheduleEvents = (events: MatchEvent[], index: number) => {
        if (index >= events.length) {
            setIsPlayingQuarter(false);
            return;
        }

        const event = events[index];
        const delay = getEventDelay(event.type);
        const timeoutId = window.setTimeout(() => {
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

            scheduleEvents(events, index + 1);
        }, delay);
        quarterTimeoutsRef.current.push(timeoutId);
      };

      scheduleEvents(qEvents, 0);
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

        const finishMatch = (text: string) => {
            console.log('[MatchSim] finishMatch called, simStep=5, currentSimData exists:', !!currentSimData);
            setCommentary(text);
            setSimStep(5);
            setLoading(false);
            setView('MATCH_RESULT');
        };

        generateMatchCommentary(
            fixtureData.homeTeamId === myTeam.id ? myTeam : opponent,
            fixtureData.homeTeamId === myTeam.id ? opponent : myTeam,
            currentSimData,
            player
        )
        .then(text => finishMatch(text))
        .catch(err => {
            console.error('Commentary generation failed:', err);
            finishMatch(`Full Time: ${myTeam.name} ${currentSimData.homeScore.total} def ${opponent.name} ${currentSimData.awayScore.total}. ${player.name} had ${currentSimData.playerStats.disposals} disposals and ${currentSimData.playerStats.goals} goals.`);
        });

        // Safety timeout: force show result after 10 seconds if commentary is still loading
        setTimeout(() => {
            finishMatch(`Full Time: ${myTeam.name} ${currentSimData.homeScore.total} def ${opponent.name} ${currentSimData.awayScore.total}.`);
        }, 10000);
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
          case 'ONE_ON_ONE': return '⚡';
          case 'ONE_ON_ONE_DEFENSIVE': return '🛡️';
          case 'HIT_OUT': return '✊';
          case 'INTERCEPT': return '🦅';
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
          case 'ONE_ON_ONE': return 'bg-slate-800 border-orange-400/40';
          case 'ONE_ON_ONE_DEFENSIVE': return 'bg-slate-800 border-blue-400/40';
          case 'HIT_OUT': return 'bg-slate-800 border-purple-400/40';
          case 'INTERCEPT': return 'bg-slate-800 border-teal-400/40';
          default: return 'bg-slate-800 border-slate-700';
      }
  };

  const isChainedPair = (events: MatchEvent[], idx: number): boolean => {
      if (idx === 0) return false;
      const prev = events[idx - 1];
      const curr = events[idx];
      if (prev.quarter !== curr.quarter) return false;
      const parseTime = (t: string): number => {
          const [m, s] = t.split(':').map(Number);
          return m * 60 + (s || 0);
      };
      const timeDiff = Math.abs(parseTime(curr.time) - parseTime(prev.time));
      return timeDiff <= 60 && (prev.isPlayerInvolved || curr.isPlayerInvolved);
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
                {/* Skip button in case commentary hangs */}
                <button
                    onClick={() => {
                        setSimStep(5);
                        setLoading(false);
                        setView('MATCH_RESULT');
                    }}
                    className="mt-4 text-slate-500 text-xs underline hover:text-slate-300"
                >
                    Skip commentary →
                </button>
            </div>
        </div>
      );
  }

  if (view === 'MATCH_PREVIEW') {
      const displayTeam = previewTeamId === myTeam.id ? myTeam : opponent;
      const { field, bench } = getFieldLayout(displayTeam);

      return (
        <div className="flex flex-col h-full pb-24 bg-slate-950">
           {/* Page Indicator Dots */}
           <div className="flex justify-center gap-1.5 py-2 bg-slate-950">
               <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
               <div className="w-2 h-2 rounded-full bg-slate-700"></div>
               <div className="w-2 h-2 rounded-full bg-slate-700"></div>
           </div>
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
               {player?.farewell && (
                   <div className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-xl p-4 text-center shadow-lg">
                       <div className="text-white font-black text-lg">🎓 Farewell Game</div>
                       <div className="text-amber-100 text-sm mt-0.5">{player.name}'s Last Match</div>
                   </div>
               )}
               {player && player.energy < 30 && (
                   <div className="bg-red-900/70 border border-red-500/40 rounded-xl p-3 text-red-200 text-sm flex items-center gap-2">
                       <span>⚠️</span>
                       <span>Low energy — expect a tough game this round.</span>
                   </div>
               )}
               <div>
                   <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">Game Plan</h3>
                   <div className="grid grid-cols-1 gap-2">
                       {([
                           { tactic: 'ATTACK' as Tactic, label: '⚔️ Attack', desc: 'Higher scoring chance — burns more energy' },
                           { tactic: 'BALANCED' as Tactic, label: '⚖️ Balanced', desc: 'No modifier — the default approach' },
                           { tactic: 'DEFENSIVE' as Tactic, label: '🛡️ Defensive', desc: 'Fewer goals against — lower scoring chance' },
                       ]).map(({ tactic, label, desc }) => (
                           <button
                               key={tactic}
                               onClick={() => setSelectedTactic(tactic)}
                               className={`p-3 rounded-xl border text-left transition ${
                                   selectedTactic === tactic
                                       ? 'bg-green-700 border-green-400 text-white'
                                       : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                               }`}
                           >
                               <span className="font-semibold text-sm">{label}</span>
                               <span className="text-xs opacity-70 block mt-0.5">{desc}</span>
                           </button>
                       ))}
                       {player?.coachingStaff?.staffMembers?.some(s => s.personality === 'TACTICIAN') && (
                           <button
                               onClick={() => setSelectedTactic('PRESS')}
                               className={`p-3 rounded-xl border text-left transition ${
                                   selectedTactic === 'PRESS'
                                       ? 'bg-purple-700 border-purple-400 text-white'
                                       : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                               }`}
                           >
                               <span className="font-semibold text-sm">🔒 Press</span>
                               <span className="text-xs opacity-70 block mt-0.5">High pressure — high energy drain (Tactician unlock)</span>
                           </button>
                       )}
                   </div>
               </div>
               <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                   <button onClick={() => setPreviewTeamId(homeTeam.id)} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${previewTeamId === homeTeam.id ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>{homeTeam.name}</button>
                   <button onClick={() => setPreviewTeamId(awayTeam.id)} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${previewTeamId === awayTeam.id ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}>{awayTeam.name}</button>
               </div>
               <button onClick={handleStartMatch} className="w-full py-4 bg-white text-slate-900 font-black text-xl rounded-xl uppercase shadow-lg shadow-white/20 active:scale-95 transition-transform">First Bounce</button>
           </div>
        </div>
      );
  }

  // Debug logging to understand component state
  if (typeof window !== 'undefined') {
    console.log(`[MatchSim] Render debug: simStep=${simStep}, playing=${isPlayingQuarter}, hasData=${!!currentSimData}, view=${view}, loading=${loading}`);
  }

  if (simStep >= 1 && simStep <= 4 && currentSimData) {
      const myLiveScore = isHome ? liveHomeScore : liveAwayScore;
      const oppLiveScore = isHome ? liveAwayScore : liveHomeScore;

      return (
        <div className="fixed inset-0 z-50 flex flex-col h-[100dvh] bg-slate-900 overflow-hidden" style={{ 
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
        }}>
            {/* Page Indicator Dots */}
            <div className="flex justify-center gap-1.5 py-2 bg-slate-900">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <div className={`w-2 h-2 rounded-full ${simStep >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
            </div>
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
                <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-2 space-y-3 scrollbar-hide">
                    {visibleEvents.length === 0 && isPlayingQuarter && (
                        <div className="text-center text-slate-600 italic py-10 animate-pulse">Waiting for play...</div>
                    )}
                    {visibleEvents.map((event, idx) => {
                        const eventTeam = league.find(t => t.id === event.teamId);
                        const teamColor = eventTeam?.colors[0] || '#64748b';
                        return (
                            <React.Fragment key={idx}>
                                {isChainedPair(visibleEvents, idx) && (
                                    <div style={{
                                        width: 2,
                                        height: 12,
                                        backgroundColor: 'currentColor',
                                        opacity: 0.3,
                                        marginLeft: 20,
                                    }} />
                                )}
                                <div className={`p-3 rounded-lg text-sm border-l-4 animate-fade-in transition-all flex gap-3 items-start shrink-0 ${getEventStyle(event)} ${event.isPlayerInvolved ? 'scale-105' : ''}`}>
                                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-black border-2 border-white/20 text-xs shadow-sm" style={{ backgroundColor: teamColor, color: '#fff' }}>{eventTeam ? eventTeam.name.charAt(0) : '?'}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className={`font-bold text-xs ${event.isPlayerInvolved ? 'text-emerald-400' : event.type === 'INJURY' ? 'text-red-400' : 'text-slate-400'}`}>{event.time} • {event.type}</span>
                                        </div>
                                        <div className="text-slate-200 leading-snug break-words">{event.description}</div>
                                    </div>
                                    <div className="text-2xl shrink-0 opacity-80 select-none">{getEventIcon(event.type)}</div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                    {visibleEvents.length === 0 && !isPlayingQuarter && (
                         <div className="text-center text-slate-500 text-xs uppercase py-4">Quarter ready to start</div>
                    )}
                </div>
                <div className="shrink-0 p-4 bg-slate-900 border-t border-slate-800 mt-auto">
                    <button onClick={handleNextQuarter} disabled={isPlayingQuarter} className={`w-full py-4 font-black text-xl rounded-xl uppercase tracking-widest transition-all shadow-lg ${isPlayingQuarter ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-emerald-50 active:scale-95'}`} style={{ minHeight: '3rem' }}>
                        {isPlayingQuarter ? "Playing..." : simStep === 4 ? "Final Siren" : "Play Next Quarter"}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (simStep === 5 && currentSimData) {
      console.log('[MatchSim] Rendering result screen, simStep:', simStep, 'currentSimData:', !!currentSimData, 'lastMatchResult:', !!lastMatchResult);
      const resultData = lastMatchResult || currentSimData;
      const myScore = isHome ? resultData.homeScore : resultData.awayScore;
      const oppScore = isHome ? resultData.awayScore : resultData.homeScore;
      const won = myScore.total > oppScore.total;

      // Quarter / worm derived data
      const homeQ = resultData.homeScore.quarters;
      const awayQ = resultData.awayScore.quarters;
      const hasQuarterData = homeQ.length === 4 && awayQ.length === 4;
      const myQCum  = isHome ? homeQ : awayQ;
      const oppQCum = isHome ? awayQ : homeQ;
      const wormPoints = hasQuarterData ? [0, ...myQCum.map((v, i) => v - oppQCum[i])] : [];
      const isDraw = myScore.total === oppScore.total;
      const wormColor = won ? '#10b981' : isDraw ? '#f59e0b' : '#ef4444';
      const wormFill  = won ? 'rgba(16,185,129,0.12)' : isDraw ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)';
      const maxAbs = wormPoints.length ? Math.max(...wormPoints.map(Math.abs), 30) : 30;
      const yScale = 45 / maxAbs;
      const wy = (m: number) => 60 - Math.max(-45, Math.min(45, m * yScale));
      const wx = (i: number) => 30 + i * 60;

      const allPerformers = resultData.topPerformers || [];

      const homePerformers = allPerformers.filter(p => p.teamId === homeTeam.id);
      const awayPerformers = allPerformers.filter(p => p.teamId === awayTeam.id);

      const homeGoals = [...homePerformers].sort((a,b) => b.goals - a.goals).filter(p => p.goals > 0).slice(0,3);
      const homeDisp = [...homePerformers].sort((a,b) => b.disposals - a.disposals).slice(0,3);

      const awayGoals = [...awayPerformers].sort((a,b) => b.goals - a.goals).filter(p => p.goals > 0).slice(0,3);
      const awayDisp = [...awayPerformers].sort((a,b) => b.disposals - a.disposals).slice(0,3);

      return (
          <div className="p-4 pb-24 h-full flex flex-col">
              {/* Page Indicator Dots */}
              <div className="flex justify-center gap-1.5 py-2 -mt-4">
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>

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

                          {/* Score Worm */}
                          {hasQuarterData && (
                              <div className="bg-slate-800 rounded-xl border border-slate-700 mb-4 p-4">
                                  <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 tracking-widest">Score Worm</h3>
                                  <svg viewBox="0 0 300 120" className="w-full" preserveAspectRatio="none">
                                      <line x1="30" y1="60" x2="270" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="4,3" />
                                      {[1,2,3].map(i => (
                                          <line key={i} x1={wx(i)} y1="18" x2={wx(i)} y2="102" stroke="#1e293b" strokeWidth="1" />
                                      ))}
                                      <polygon
                                          points={[...wormPoints.map((m,i) => `${wx(i)},${wy(m)}`), `${wx(4)},60`, `${wx(0)},60`].join(' ')}
                                          fill={wormFill}
                                      />
                                      <polyline
                                          points={wormPoints.map((m,i) => `${wx(i)},${wy(m)}`).join(' ')}
                                          fill="none" stroke={wormColor} strokeWidth="2.5"
                                          strokeLinejoin="round" strokeLinecap="round"
                                      />
                                      {wormPoints.map((m,i) => (
                                          <circle key={i} cx={wx(i)} cy={wy(m)} r="4"
                                              fill={wormColor} stroke="#1e293b" strokeWidth="2" />
                                      ))}
                                      {(['S','Q1','Q2','Q3','Q4'] as const).map((label,i) => (
                                          <text key={i} x={wx(i)} y="115" textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">{label}</text>
                                      ))}
                                      <text x="8" y="22" fontSize="8" fill="#64748b" dominantBaseline="middle">{myTeam.name.charAt(0)}</text>
                                      <text x="8" y="98" fontSize="8" fill="#64748b" dominantBaseline="middle">{opponent.name.charAt(0)}</text>
                                      {(() => {
                                          const fm = wormPoints[4];
                                          const labelY = fm >= 0 ? wy(fm) - 10 : wy(fm) + 16;
                                          return <text x={wx(4)} y={labelY} textAnchor="middle" fontSize="9" fill={wormColor} fontWeight="bold">
                                              {fm > 0 ? `+${fm}` : fm === 0 ? 'DRAW' : `${fm}`}
                                          </text>;
                                      })()}
                                  </svg>
                              </div>
                          )}

                          {/* Quarter Breakdown */}
                          {hasQuarterData && (
                              <div className="bg-slate-800 rounded-xl border border-slate-700 mb-4 overflow-hidden">
                                  <h3 className="text-emerald-400 font-bold uppercase text-xs px-4 pt-3 pb-2 border-b border-slate-700 tracking-widest">Quarter Breakdown</h3>
                                  <div className="grid grid-cols-7 text-[10px] font-bold uppercase text-slate-500 px-3 py-2 border-b border-slate-700/50">
                                      <div className="col-span-2">Team</div>
                                      <div className="text-center">Q1</div>
                                      <div className="text-center">Q2</div>
                                      <div className="text-center">Q3</div>
                                      <div className="text-center">Q4</div>
                                      <div className="text-center">Total</div>
                                  </div>
                                  {[
                                      { team: homeTeam, qArr: homeQ, score: resultData.homeScore },
                                      { team: awayTeam, qArr: awayQ, score: resultData.awayScore },
                                  ].map(({ team, qArr, score }) => (
                                      <div key={team.id}
                                          className={`grid grid-cols-7 items-center px-3 py-3 border-b border-slate-700/30 last:border-0 ${team.id === myTeam.id ? 'bg-emerald-900/10' : ''}`}
                                      >
                                          <div className="col-span-2 text-[11px] font-bold text-white truncate">{team.name.split(' ')[0]}</div>
                                          {[0,1,2,3].map(i => (
                                              <div key={i} className="text-center font-mono text-sm text-slate-300">
                                                  {qArr[i] - (i > 0 ? qArr[i-1] : 0)}
                                              </div>
                                          ))}
                                          <div className="text-center">
                                              <span className="font-mono text-sm font-bold text-white">{score.goals}.{score.behinds}</span>
                                              <span className="font-mono text-[10px] text-slate-400 block">({score.total})</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}

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
                      <div className="text-center mb-4">
                          <h2 className="text-2xl font-black text-white uppercase italic">Performance</h2>
                          <p className="text-slate-400 text-sm">Your impact on the game</p>
                      </div>

                      {/* Tab Toggle */}
                      <div className="flex bg-slate-800 rounded-xl p-1 mb-4 border border-slate-700">
                          <button
                              onClick={() => setActiveResultTab('stats')}
                              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeResultTab === 'stats' ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
                          >
                              Stats
                          </button>
                          <button
                              onClick={() => setActiveResultTab('highlights')}
                              className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeResultTab === 'highlights' ? 'bg-emerald-500 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
                          >
                              Highlights
                          </button>
                      </div>

                      {activeResultTab === 'highlights' ? (
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                              {(resultData.highlights && resultData.highlights.length > 0) ? resultData.highlights.map((h, i) => {
                                  const icons: Record<string, string> = {
                                      GOAL: '⚽', MARK: '🙌', TACKLE: '💪', DISPOSAL: '🏉', INJURY: '🤕',
                                      RIVALRY: '🤬', ONE_ON_ONE: '⚡', ONE_ON_ONE_DEFENSIVE: '🛡️',
                                      HIT_OUT: '✊', INTERCEPT: '🦅',
                                  };
                                  const icon = icons[h.type] ?? '🏆';
                                  return (
                                      <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-start gap-3">
                                          <div className="text-2xl flex-shrink-0">{icon}</div>
                                          <div className="flex-1 min-w-0">
                                              <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">{h.type.replace(/_/g, ' ')}</div>
                                              <div className="text-white text-sm leading-snug">{h.description}</div>
                                              {h.quarter && <div className="text-slate-500 text-xs mt-1">Q{h.quarter}</div>}
                                          </div>
                                      </div>
                                  );
                              }) : (
                                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                      <div className="text-4xl mb-3">🏉</div>
                                      <div className="text-sm font-bold uppercase">No highlights this game</div>
                                  </div>
                              )}
                          </div>
                      ) : (
                      <>
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6 shadow-xl">
                          <div className="flex items-center justify-center mb-6">
                               <div className="w-20 h-20 rounded-full border-4 border-emerald-500 overflow-hidden shadow-lg">
                                   <Avatar avatar={player.avatar} teamColors={myTeam.colors} className="w-full h-full" />
                               </div>
                          </div>

                          {/* Performance Grade */}
                          {resultData.playerStats.performanceGrade && (
                              <div className="text-center mb-4">
                                  <div className={`inline-block px-6 py-2 rounded-xl border-2 text-4xl font-black ${
                                      resultData.playerStats.performanceGrade.startsWith('A')
                                          ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                                          : resultData.playerStats.performanceGrade.startsWith('B')
                                          ? 'border-blue-500 bg-blue-900/30 text-blue-400'
                                          : resultData.playerStats.performanceGrade.startsWith('C')
                                          ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400'
                                          : 'border-red-500 bg-red-900/30 text-red-400'
                                  }`}>
                                      {resultData.playerStats.performanceGrade}
                                  </div>
                                  <div className="text-slate-500 text-xs uppercase font-bold mt-1">Performance Grade</div>
                              </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 mb-4">
                              {/* Core Stats */}
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{resultData.playerStats.disposals}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Disposals</div>
                              </div>
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{resultData.playerStats.goals}.{resultData.playerStats.behinds}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</div>
                              </div>
                              <div className="bg-slate-900/50 p-3 rounded-lg text-center border border-slate-700/50">
                                  <div className="text-3xl font-black text-white">{resultData.playerStats.tackles}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tackles</div>
                              </div>
                               <div className={`bg-slate-900/50 p-3 rounded-lg text-center border ${resultData.playerStats.votes > 0 ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-slate-700/50'}`}>
                                  <div className={`text-3xl font-black ${resultData.playerStats.votes > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>{resultData.playerStats.votes}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Brownlow Votes</div>
                              </div>
                          </div>

                          {/* Brownlow Vote Breakdown */}
                          {(resultData.playerStats.brownlowVotes3 || resultData.playerStats.brownlowVotes2 || resultData.playerStats.brownlowVotes1) && (
                              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 text-center">Vote Breakdown</div>
                                  <div className="flex justify-center gap-6">
                                      {resultData.playerStats.brownlowVotes3 ? (
                                          <div className="text-center">
                                              <div className="text-2xl font-black text-yellow-400">3</div>
                                              <div className="text-[9px] text-slate-500 uppercase">Best on Ground</div>
                                          </div>
                                      ) : null}
                                      {resultData.playerStats.brownlowVotes2 ? (
                                          <div className="text-center">
                                              <div className="text-2xl font-black text-blue-400">2</div>
                                              <div className="text-[9px] text-slate-500 uppercase">Second Place</div>
                                          </div>
                                      ) : null}
                                      {resultData.playerStats.brownlowVotes1 ? (
                                          <div className="text-center">
                                              <div className="text-2xl font-black text-slate-400">1</div>
                                              <div className="text-[9px] text-slate-500 uppercase">Third Place</div>
                                          </div>
                                      ) : null}
                                  </div>
                              </div>
                          )}

                          {/* Extended Stats Grid */}
                          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30 mb-2">
                              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 text-center">Extended Stats</div>
                              <div className="grid grid-cols-3 gap-3">
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-blue-400">{resultData.playerStats.kicks || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Kicks</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-green-400">{resultData.playerStats.handballs || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Handballs</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-purple-400">{resultData.playerStats.marks || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Marks</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-orange-400">{resultData.playerStats.contendedPossessions || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Contended</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-teal-400">{resultData.playerStats.clearances || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Clearances</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-lg font-bold text-pink-400">{resultData.playerStats.inside50s || 0}</div>
                                      <div className="text-[9px] text-slate-500 uppercase">Inside 50</div>
                                  </div>
                              </div>
                          </div>

                          {/* Disposal Effectiveness Bar */}
                          {(() => {
                              const eff = resultData.playerStats.effectiveDisposals || 0;
                              const ineff = resultData.playerStats.ineffectiveDisposals || 0;
                              const total = eff + ineff;
                              if (total === 0) return null;
                              const pct = Math.round((eff / total) * 100);
                              return (
                                  <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                                      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                          <span>Disposal Efficiency</span>
                                          <span className={pct > 70 ? 'text-emerald-400' : pct > 50 ? 'text-yellow-400' : 'text-red-400'}>{pct}%</span>
                                      </div>
                                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <div
                                              className={`h-full rounded-full transition-all ${pct > 70 ? 'bg-emerald-500' : pct > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                              style={{ width: `${pct}%` }}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                                          <span>{eff} effective</span>
                                          <span>{ineff} ineffective</span>
                                      </div>
                                  </div>
                              );
                          })()}

                          {/* Hit Outs for Ruck */}
                          {(resultData.playerStats.hitOuts || 0) > 0 && (
                              <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30 mt-2">
                                  <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-400 uppercase font-bold">Hit Outs</span>
                                      <span className="text-xl font-black text-purple-400">{resultData.playerStats.hitOuts}</span>
                                  </div>
                              </div>
                          )}
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
                          {resultData.playerInjury && (
                              <div className="bg-red-900/30 border border-red-500 p-3 rounded-xl flex items-center gap-3">
                                   <div className="text-2xl">🤕</div>
                                   <div>
                                       <div className="text-red-400 font-bold text-xs uppercase">Injury Sustained</div>
                                       <div className="text-white text-sm font-bold">{resultData.playerInjury.name}</div>
                                       <div className="text-red-300 text-xs">{resultData.playerInjury.weeksRemaining} week recovery</div>
                                   </div>
                              </div>
                          )}

                          {resultData.newRivalry && (
                               <div className="bg-orange-900/30 border border-orange-500 p-3 rounded-xl flex items-center gap-3">
                                   <div className="text-2xl">🤬</div>
                                   <div>
                                       <div className="text-orange-400 font-bold text-xs uppercase">Rivalry Started</div>
                                       <div className="text-white text-sm">vs <span className="font-bold">{resultData.newRivalry.opponentName}</span></div>
                                   </div>
                               </div>
                          )}
                          
                          {resultData.achievedMilestones && resultData.achievedMilestones.map((m, i) => (
                              <div key={i} className="bg-yellow-600/20 border border-yellow-500 p-3 rounded-xl flex items-center gap-3">
                                  <div className="text-2xl">🏆</div>
                                  <div>
                                      <div className="text-yellow-400 font-bold text-xs uppercase">Milestone Reached</div>
                                      <div className="text-white text-sm font-bold">{m.description}</div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      </>
                      )}

                      {resultData?.tactic && resultData.tactic !== 'BALANCED' && (
                          <div className="text-white/40 text-xs text-center mt-2">
                              Game plan: {resultData.tactic.charAt(0) + resultData.tactic.slice(1).toLowerCase()}
                          </div>
                      )}

                      {player?.farewell && (
                          <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl p-6 text-center mt-4 shadow-xl">
                              <div className="text-5xl mb-3">🎓</div>
                              <h2 className="text-white font-black text-2xl">Final Whistle</h2>
                              <p className="text-amber-200 mt-2 text-sm">
                                  {player.careerStats?.matches ?? 0} career matches · {player.careerStats?.goals ?? 0} goals
                              </p>
                          </div>
                      )}

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



  // Fallback: show result screen using currentSimData if we somehow got past Q4
  if (simStep === 5 && !currentSimData) {
      return <div className="p-8 text-center text-red-400">Error: Match data lost. <button onClick={() => advanceRound()} className="underline">Continue</button></div>;
  }

  console.warn('[MatchSim] No view matched! view:', view, 'simStep:', simStep, 'loading:', loading, 'hasCurrentSimData:', !!currentSimData);
  return (
      <div className="p-8 text-center text-slate-400">
          <p>Match sequence ended unexpectedly.</p>
          <p className="text-xs mt-2">view={view} simStep={simStep} loading={String(loading)}</p>
          <button onClick={() => advanceRound()} className="mt-4 underline text-emerald-400">Continue Season</button>
      </div>
  );
};

export default MatchSim;