
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { SEASON_LENGTH } from '../constants';
import TeamLogo from './TeamLogo';

const LeagueView: React.FC = () => {
  const { league, player, fixtures, currentRound } = useGame();
  const [activeTab, setActiveTab] = useState<'LADDER' | 'FIXTURE'>('LADDER');
  const [viewRound, setViewRound] = useState(currentRound);

  if (!player) return null;

  // -- LOGIC: LADDER --
  const sortedLeague = [...league].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.percentage - a.percentage;
  });

  // -- LOGIC: FIXTURE --
  const roundFixtures = fixtures.filter(f => f.round === viewRound);
  
  const handleRoundChange = (dir: -1 | 1) => {
      const newRound = viewRound + dir;
      if (newRound >= 1 && newRound <= SEASON_LENGTH) {
          setViewRound(newRound);
      }
  };

  const getTeam = (id: string) => league.find(t => t.id === id);

  return (
    <div className="pb-24 bg-slate-900 min-h-screen">
       {/* HEADER */}
       <div className="p-4 bg-slate-800 border-b border-slate-700 shadow-md">
           <h2 className="text-3xl font-black text-white italic uppercase mb-4">League Central</h2>
           <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                <button 
                    onClick={() => setActiveTab('LADDER')}
                    className={`flex-1 py-2 font-bold text-xs uppercase rounded-md transition-colors ${activeTab === 'LADDER' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                    Ladder
                </button>
                <button 
                    onClick={() => setActiveTab('FIXTURE')}
                    className={`flex-1 py-2 font-bold text-xs uppercase rounded-md transition-colors ${activeTab === 'FIXTURE' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                    Season Fixture
                </button>
           </div>
       </div>

       <div className="p-4">
           {activeTab === 'LADDER' ? (
               <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg animate-fade-in">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                           <tr>
                               <th className="p-3">Pos</th>
                               <th className="p-3">Club</th>
                               <th className="p-3 text-center">P</th>
                               <th className="p-3 text-center">Pts</th>
                               <th className="p-3 text-center">%</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-700">
                           {sortedLeague.map((team, index) => (
                               <tr key={team.id} className={team.name === player.contract.clubName ? 'bg-emerald-900/20' : ''}>
                                   <td className="p-3 font-bold text-slate-500 border-r border-slate-700/50">{index + 1}</td>
                                   <td className="p-3 font-bold text-white flex items-center gap-2">
                                       <TeamLogo team={team} size="xs" showBorder={false} />
                                       {team.name}
                                   </td>
                                   <td className="p-3 text-center text-slate-400">{team.wins + team.losses + team.draws}</td>
                                   <td className="p-3 text-center font-bold text-emerald-400 border-x border-slate-700/50">{team.points}</td>
                                   <td className="p-3 text-center text-slate-400">{team.percentage.toFixed(1)}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           ) : (
               <div className="animate-fade-in space-y-4">
                   {/* Round Selector */}
                   <div className="flex items-center justify-between bg-slate-800 p-2 rounded-xl border border-slate-700">
                       <button 
                         onClick={() => handleRoundChange(-1)}
                         disabled={viewRound <= 1}
                         className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 text-emerald-400 disabled:opacity-30 disabled:text-slate-500 hover:bg-slate-600 transition-colors"
                       >
                           ❮
                       </button>
                       <div className="text-center">
                           <div className="text-[10px] text-slate-400 uppercase font-bold">Round</div>
                           <div className="text-xl font-black text-white">{viewRound} <span className="text-sm font-normal text-slate-500">/ {SEASON_LENGTH}</span></div>
                       </div>
                       <button 
                         onClick={() => handleRoundChange(1)}
                         disabled={viewRound >= SEASON_LENGTH}
                         className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 text-emerald-400 disabled:opacity-30 disabled:text-slate-500 hover:bg-slate-600 transition-colors"
                       >
                           ❯
                       </button>
                   </div>

                   {/* Matches List */}
                   <div className="space-y-3">
                       {roundFixtures.map((fix, i) => {
                           const home = getTeam(fix.homeTeamId);
                           const away = getTeam(fix.awayTeamId);
                           if (!home || !away) return null;

                           const isMyMatch = player.contract.clubName === home.name || player.contract.clubName === away.name;

                           return (
                               <div key={i} className={`rounded-xl border p-4 relative overflow-hidden ${isMyMatch ? 'bg-slate-800 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                   {isMyMatch && <div className="absolute top-0 right-0 bg-emerald-500 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-bl">YOUR MATCH</div>}
                                   
                                   <div className="flex items-center justify-between">
                                       {/* Home Team */}
                                       <div className="flex-1 flex flex-col items-center gap-1">
                                           <TeamLogo team={home} size="sm" />
                                           <span className="text-xs font-bold text-center leading-tight">{home.name}</span>
                                           {fix.played && fix.result && (
                                               <span className={`text-xs ${fix.result.winnerId === home.id ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                                                   {fix.result.homeScore.goals}.{fix.result.homeScore.behinds} ({fix.result.homeScore.total})
                                               </span>
                                           )}
                                       </div>

                                       {/* Center Status */}
                                       <div className="w-16 text-center">
                                           {fix.played && fix.result ? (
                                               <div className="bg-slate-950 rounded px-1 py-0.5 text-xs text-slate-400 font-mono">FT</div>
                                           ) : (
                                               <div className="text-2xl font-black text-slate-600 italic">VS</div>
                                           )}
                                       </div>

                                       {/* Away Team */}
                                       <div className="flex-1 flex flex-col items-center gap-1">
                                           <TeamLogo team={away} size="sm" />
                                           <span className="text-xs font-bold text-center leading-tight">{away.name}</span>
                                           {fix.played && fix.result && (
                                               <span className={`text-xs ${fix.result.winnerId === away.id ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                                                   {fix.result.awayScore.goals}.{fix.result.awayScore.behinds} ({fix.result.awayScore.total})
                                               </span>
                                           )}
                                       </div>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default LeagueView;
