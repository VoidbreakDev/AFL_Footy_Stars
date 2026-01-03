import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Team, LeagueTier, Stadium } from '../types';
import Avatar from './Avatar';
import TeamLogo from './TeamLogo';

const ClubHub: React.FC = () => {
    const { player, setPlayer, setView, league, fixtures, currentRound } = useGame();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTRACT' | 'HISTORY'>('OVERVIEW');
    const [transferState, setTransferState] = useState<'IDLE' | 'SEARCHING' | 'OFFERS'>('IDLE');
    const [offers, setOffers] = useState<{ team: Team, salary: number, years: number }[]>([]);
    const [negotiationStatus, setNegotiationStatus] = useState<'NONE' | 'OFFER' | 'ACCEPTED'>('NONE');

    if (!player) return null;
    const myTeam = league.find(t => t.name === player.contract.clubName);
    if (!myTeam) return null;

    // -- DATA PREP --
    const myFixtures = fixtures.filter(f => f.homeTeamId === myTeam.id || f.awayTeamId === myTeam.id);
    const playedFixtures = myFixtures.filter(f => f.played).sort((a, b) => b.round - a.round).slice(0, 3);
    const upcomingFixtures = myFixtures.filter(f => !f.played).sort((a, b) => a.round - b.round).slice(0, 3);
    
    const ladderPos = [...league].sort((a, b) => b.points - a.points || b.percentage - a.percentage).findIndex(t => t.id === myTeam.id) + 1;

    // -- PROCEDURAL HISTORY GENERATOR --
    const teamHistory = useMemo(() => {
        let seed = myTeam.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        const foundedYear = 1890 + Math.floor(random() * 60);
        
        const numFlags = Math.floor(random() * 12); 
        const premierships = [];
        for (let i = 0; i < numFlags; i++) {
            const year = foundedYear + 5 + Math.floor(random() * (2023 - foundedYear));
            if (!premierships.includes(year)) premierships.push(year);
        }
        premierships.sort((a, b) => b - a);

        const firstNames = ['Jack', 'Harry', 'Bill', 'Tom', 'Alf', 'Ted', 'Bob', 'Dick', 'Norm', 'Syd'];
        const lastNames = ['Dyer', 'Coventry', 'Whitten', 'Barassi', 'Ablett', 'Lockett', 'Skilton', 'Bunton', 'Reynolds', 'Farmer'];
        
        const legends = [];
        const numLegends = 3 + Math.floor(random() * 4);
        for (let i = 0; i < numLegends; i++) {
            legends.push({
                name: `${firstNames[Math.floor(random() * firstNames.length)]} ${lastNames[Math.floor(random() * lastNames.length)]}`,
                games: 200 + Math.floor(random() * 200),
                goals: 50 + Math.floor(random() * 800),
                years: `${1950 + Math.floor(random() * 40)} - ${1965 + Math.floor(random() * 40)}`
            });
        }

        return { foundedYear, premierships, legends };
    }, [myTeam.name]);

    const handleNegotiate = () => {
        setNegotiationStatus('OFFER');
    };

    const acceptExtension = () => {
        setPlayer(prev => {
            if(!prev) return null;
            return {
                ...prev,
                morale: Math.min(100, prev.morale + 20), 
                contract: {
                    ...prev.contract,
                    salary: Math.floor(prev.contract.salary * 1.15), 
                    yearsLeft: prev.contract.yearsLeft + 2
                }
            };
        });
        setNegotiationStatus('ACCEPTED');
    };

    const startTransferSearch = () => {
        setTransferState('SEARCHING');
        setTimeout(() => {
            const potentialTeams = league.filter(t => t.id !== myTeam.id).sort(() => 0.5 - Math.random()).slice(0, 3);
            const newOffers = potentialTeams.map(t => ({
                team: t,
                salary: Math.floor(player.contract.salary * (0.9 + Math.random() * 0.4)), 
                years: Math.floor(Math.random() * 3) + 1
            }));
            setOffers(newOffers);
            setTransferState('OFFERS');
        }, 1500);
    };

    const acceptTransfer = (offer: { team: Team, salary: number, years: number }) => {
        setPlayer(prev => {
            if(!prev) return null;
            return {
                ...prev,
                morale: 60, 
                contract: {
                    ...prev.contract,
                    clubName: offer.team.name,
                    salary: offer.salary,
                    yearsLeft: offer.years,
                }
            };
        });
        setTransferState('IDLE');
        setActiveTab('OVERVIEW');
        setNegotiationStatus('NONE');
    };

    const getTeamName = (id: string) => league.find(t => t.id === id)?.name || 'Unknown';

    const renderStars = (rating: number) => {
        const starCount = Math.max(1, Math.min(5, Math.round(rating / 20)));
        return (
          <div className="flex gap-0.5" title={`Rating: ${rating}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                  key={star} 
                  className={`text-xs ${star <= starCount ? 'text-yellow-400' : 'text-slate-700'}`}
              >
                  ★
              </span>
            ))}
          </div>
        );
    };

    const StadiumVisual: React.FC<{ stadium: Stadium }> = ({ stadium }) => {
        const typeConfig = {
            'OVAL': { icon: '🌳', color: 'bg-green-800' },
            'BOUTIQUE': { icon: '🏟️', color: 'bg-blue-900' },
            'COLOSSEUM': { icon: '🏛️', color: 'bg-slate-950' }
        };
        const conf = typeConfig[stadium.type] || typeConfig['OVAL'];

        return (
            <div className={`relative overflow-hidden rounded-xl p-4 border border-slate-700 ${conf.color} text-white shadow-lg`}>
                <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-20 pointer-events-none select-none">
                    {conf.icon}
                </div>
                <div className="relative z-10">
                    <h4 className="text-xs text-white/70 font-bold uppercase tracking-wider mb-1">Home Ground</h4>
                    <h3 className="text-xl font-black italic uppercase leading-none mb-2">{stadium.name}</h3>
                    <div className="flex gap-4 text-xs font-mono text-white/80">
                        <div>
                            <span className="text-white/50 block text-[9px] uppercase">Capacity</span>
                            {stadium.capacity.toLocaleString()}
                        </div>
                        <div>
                            <span className="text-white/50 block text-[9px] uppercase">Type</span>
                            {stadium.type}
                        </div>
                        <div>
                            <span className="text-white/50 block text-[9px] uppercase">Turf</span>
                            {stadium.turfQuality}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24 bg-slate-900 min-h-full">
            {/* HERO SECTION */}
            <div 
                className="relative p-6 pb-12 overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${myTeam.colors[0]} 0%, ${myTeam.colors[1]} 100%)`
                }}
            >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 flex flex-col items-center text-white">
                    <TeamLogo team={myTeam} size="2xl" className="mb-3" />
                    <h1 className="text-3xl font-black uppercase italic tracking-wider text-center drop-shadow-md">{myTeam.name}</h1>
                    <p className="text-white/80 font-medium text-sm">Est. {teamHistory.foundedYear}</p>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="bg-slate-800 border-y border-slate-700 flex justify-around py-3 relative z-20 -mt-4 mx-4 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ladder</div>
                    <div className="text-xl font-black text-white">{ladderPos}<span className="text-xs align-top text-slate-500 font-normal">/{league.length}</span></div>
                </div>
                <div className="text-center border-l border-slate-700 pl-4">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Record</div>
                    <div className="text-xl font-black text-emerald-400">{myTeam.wins}-{myTeam.losses}</div>
                </div>
                <div className="text-center border-l border-slate-700 pl-4">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Percent</div>
                    <div className="text-xl font-black text-white">{myTeam.percentage.toFixed(0)}%</div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 p-4">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`flex-1 py-2 font-bold text-xs uppercase rounded-lg transition-colors ${activeTab === 'OVERVIEW' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-2 font-bold text-xs uppercase rounded-lg transition-colors ${activeTab === 'HISTORY' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}
                >
                    History
                </button>
                <button 
                    onClick={() => setActiveTab('CONTRACT')}
                    className={`flex-1 py-2 font-bold text-xs uppercase rounded-lg transition-colors ${activeTab === 'CONTRACT' ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400'}`}
                >
                    Contract
                </button>
            </div>

            {/* CONTENT */}
            <div className="px-4 space-y-6">
                
                {/* --- TAB: OVERVIEW --- */}
                {activeTab === 'OVERVIEW' && (
                    <div className="animate-fade-in">
                        {/* Team Management Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {/* Team Chemistry */}
                            {player.teamChemistry && (
                                <button
                                    onClick={() => setView('TEAM_CHEMISTRY')}
                                    className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/30 p-4 rounded-xl shadow-lg hover:border-cyan-400 transition-all"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">🤝</div>
                                        <h3 className="font-bold text-cyan-400 uppercase text-xs mb-1">Team Chemistry</h3>
                                        <div className={`text-2xl font-black ${
                                            player.teamChemistry.overallChemistry >= 70 ? 'text-green-400' :
                                            player.teamChemistry.overallChemistry >= 50 ? 'text-blue-400' :
                                            player.teamChemistry.overallChemistry >= 30 ? 'text-yellow-400' :
                                            'text-orange-400'
                                        }`}>
                                            {player.teamChemistry.overallChemistry}
                                        </div>
                                        <p className="text-cyan-300 text-xs mt-1">
                                            {player.teamChemistry.recentForm === 'HOT' && '🔥 On Fire!'}
                                            {player.teamChemistry.recentForm === 'WARM' && '⬆️ Building'}
                                            {player.teamChemistry.recentForm === 'NEUTRAL' && '➡️ Steady'}
                                            {player.teamChemistry.recentForm === 'COLD' && '⬇️ Cooling'}
                                            {player.teamChemistry.recentForm === 'FREEZING' && '❄️ Struggling'}
                                        </p>
                                    </div>
                                </button>
                            )}

                            {/* Coaching Staff */}
                            {player.coachingStaff && (
                                <button
                                    onClick={() => setView('COACHING_STAFF')}
                                    className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-500/30 p-4 rounded-xl shadow-lg hover:border-amber-400 transition-all"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">👔</div>
                                        <h3 className="font-bold text-amber-400 uppercase text-xs mb-1">Coaching Staff</h3>
                                        <div className={`text-2xl font-black ${
                                            player.coachingStaff.staffRating >= 80 ? 'text-green-400' :
                                            player.coachingStaff.staffRating >= 60 ? 'text-blue-400' :
                                            player.coachingStaff.staffRating >= 40 ? 'text-yellow-400' :
                                            'text-orange-400'
                                        }`}>
                                            {player.coachingStaff.staffRating}
                                        </div>
                                        <p className="text-amber-300 text-xs mt-1">
                                            +{player.coachingStaff.trainingBonus}% Training
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Stadium & Coach Grid */}
                        <div className="grid gap-4 mb-6">
                            <StadiumVisual stadium={myTeam.stadium} />
                            
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">👨‍💼</div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Senior Coach</div>
                                    <div className="text-white font-bold">
                                        {player.coachingStaff?.headCoach?.name || myTeam.coach}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Squad List */}
                        <div className="mb-6">
                            <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 pl-1">Squad List</h3>
                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden max-h-64 overflow-y-auto scrollbar-hide">
                                {myTeam.players.map((p, i) => (
                                     <div key={i} className="flex justify-between items-center p-3 border-b border-slate-700 last:border-0">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                 {p.name.charAt(0)}
                                             </div>
                                             <div>
                                                 <div className="text-sm font-bold text-white leading-none">{p.name}</div>
                                                 <div className="text-[10px] text-slate-400 uppercase mt-0.5">{p.subPosition}</div>
                                             </div>
                                         </div>
                                         {renderStars(p.rating)}
                                     </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Results */}
                        <div className="mb-6">
                            <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 pl-1">Recent Results</h3>
                            <div className="space-y-2">
                                {playedFixtures.length > 0 ? playedFixtures.map((f, i) => {
                                    const isHome = f.homeTeamId === myTeam.id;
                                    const opponentName = isHome ? getTeamName(f.awayTeamId) : getTeamName(f.homeTeamId);
                                    const myScore = isHome ? f.result?.homeScore.total : f.result?.awayScore.total;
                                    const oppScore = isHome ? f.result?.awayScore.total : f.result?.homeScore.total;
                                    const won = (myScore || 0) > (oppScore || 0);

                                    return (
                                        <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1 h-8 rounded-full ${won ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase">Rd {f.round}</div>
                                                    <div className="text-sm font-bold text-white">{opponentName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-lg font-black ${won ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {won ? 'W' : 'L'}
                                                </div>
                                                <div className="text-xs font-mono text-slate-300">
                                                    {myScore} - {oppScore}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-slate-500 italic text-sm p-2">No games played yet.</div>
                                )}
                            </div>
                        </div>

                         {/* Upcoming */}
                         <div>
                            <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 pl-1">Upcoming Fixtures</h3>
                            <div className="space-y-2">
                                {upcomingFixtures.length > 0 ? upcomingFixtures.map((f, i) => {
                                    const isHome = f.homeTeamId === myTeam.id;
                                    const opponentId = isHome ? f.awayTeamId : f.homeTeamId;
                                    const opponent = league.find(t => t.id === opponentId);

                                    return (
                                        <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center opacity-80">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-600">
                                                    {opponent?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase">Rd {f.round} • {isHome ? 'Home' : 'Away'}</div>
                                                    <div className="text-sm font-bold text-white">vs {opponent?.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-slate-500 italic text-sm p-2">Season finished.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: HISTORY --- */}
                {activeTab === 'HISTORY' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Trophy Cabinet */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
                            <h3 className="text-yellow-400 font-black uppercase text-lg mb-1">Trophy Cabinet</h3>
                            <div className="h-1 w-12 bg-yellow-500 mx-auto mb-6 rounded-full"></div>
                            
                            {teamHistory.premierships.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4">
                                    {teamHistory.premierships.map(year => (
                                        <div key={year} className="flex flex-col items-center">
                                            <div className="text-2xl mb-1">🏆</div>
                                            <div className="font-bold text-white font-mono">{year}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 italic text-sm">The cabinet is empty... for now.</div>
                            )}
                        </div>

                        {/* Hall of Fame */}
                        <div>
                            <h3 className="text-emerald-400 font-bold uppercase text-xs mb-3 pl-1">Hall of Fame</h3>
                            <div className="space-y-3">
                                {teamHistory.legends.map((legend, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl grayscale">🏅</div>
                                        <div className="font-bold text-white text-lg">{legend.name}</div>
                                        <div className="text-xs text-slate-400 uppercase font-bold mb-3">{legend.years}</div>
                                        <div className="flex gap-4">
                                            <div className="bg-slate-900 px-2 py-1 rounded text-xs">
                                                <span className="text-slate-500 mr-2">GMS</span>
                                                <span className="text-white font-mono">{legend.games}</span>
                                            </div>
                                            <div className="bg-slate-900 px-2 py-1 rounded text-xs">
                                                <span className="text-slate-500 mr-2">GLS</span>
                                                <span className="text-white font-mono">{legend.goals}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: CONTRACT & TRANSFER --- */}
                {activeTab === 'CONTRACT' && (
                    <div className="animate-fade-in">
                         {/* Contract Card */}
                         <div className="bg-[#fffaf0] text-slate-900 p-6 rounded-xl shadow-xl relative overflow-hidden transform rotate-1">
                            <div className="absolute top-4 right-4 opacity-20 font-serif italic text-4xl pointer-events-none">Official</div>
                            <h3 className="font-serif font-bold text-xl mb-4 border-b-2 border-slate-900 pb-2">Playing Contract</h3>
                            
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Club:</span>
                                    <span className="font-bold uppercase">{myTeam.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Player:</span>
                                    <span className="font-bold uppercase">{player.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Salary:</span>
                                    <span className="font-bold text-emerald-700">${player.contract.salary}/yr</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tenure:</span>
                                    <span className="font-bold">{player.contract.yearsLeft} Years remaining</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-300 flex gap-2">
                                <div className="h-8 w-24 bg-slate-200 skew-x-12"></div>
                                <div className="text-[10px] text-slate-500 self-end">Signed by Club Official</div>
                            </div>
                         </div>

                         {/* Contract Actions */}
                         {transferState === 'IDLE' && negotiationStatus !== 'ACCEPTED' && (
                             <div className="space-y-3 mt-6">
                                 {negotiationStatus === 'NONE' && (
                                     <button 
                                         onClick={handleNegotiate}
                                         className="w-full py-3 bg-slate-800 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold uppercase tracking-wide hover:bg-slate-700 transition-colors"
                                     >
                                         Negotiate Extension
                                     </button>
                                 )}
                                 
                                 {negotiationStatus === 'OFFER' && (
                                     <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500 animate-fade-in">
                                         <p className="text-sm text-white mb-3">The club offers a <span className="text-emerald-400 font-bold">15% raise</span> to extend for 2 more years.</p>
                                         <div className="flex gap-2">
                                             <button onClick={() => setNegotiationStatus('NONE')} className="flex-1 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold uppercase">Reject</button>
                                             <button onClick={acceptExtension} className="flex-1 py-2 bg-emerald-500 text-slate-900 rounded-lg text-xs font-bold uppercase">Accept</button>
                                         </div>
                                     </div>
                                 )}

                                 <button 
                                     onClick={startTransferSearch}
                                     className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-wide shadow-lg hover:bg-slate-200 transition-colors"
                                 >
                                     Explore Transfer Market
                                 </button>
                             </div>
                         )}

                         {negotiationStatus === 'ACCEPTED' && (
                             <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-500 text-center mt-6">
                                 <div className="text-2xl mb-2">✍️</div>
                                 <div className="text-emerald-400 font-bold text-lg">Contract Extended!</div>
                                 <p className="text-slate-300 text-sm">You have committed your future to {myTeam.name}.</p>
                             </div>
                         )}

                         {/* Transfer Search UI */}
                         {transferState === 'SEARCHING' && (
                             <div className="py-10 text-center">
                                 <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                 <p className="text-slate-400 animate-pulse uppercase text-xs font-bold">Contacting Agents...</p>
                             </div>
                         )}

                         {/* Transfer Offers */}
                         {transferState === 'OFFERS' && (
                             <div className="space-y-4 mt-6">
                                 <div className="flex justify-between items-center">
                                     <h3 className="text-white font-bold uppercase text-sm">Offers Received</h3>
                                     <button onClick={() => setTransferState('IDLE')} className="text-xs text-slate-500 underline">Cancel</button>
                                 </div>
                                 
                                 {offers.map((offer, idx) => (
                                     <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                         <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: offer.team.colors[0] }}></div>
                                         <div className="flex justify-between items-start mb-3 pl-2">
                                             <div>
                                                 <div className="font-black text-lg text-white">{offer.team.name}</div>
                                                 <div className="text-xs text-slate-400">League Tier: {player.contract.tier}</div>
                                             </div>
                                             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold border border-slate-600" style={{ color: offer.team.colors[0] }}>
                                                 {offer.team.name.charAt(0)}
                                             </div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-4 mb-4 pl-2">
                                             <div>
                                                 <div className="text-[10px] text-slate-500 uppercase">Salary</div>
                                                 <div className="text-emerald-400 font-mono font-bold">${offer.salary}</div>
                                             </div>
                                             <div>
                                                 <div className="text-[10px] text-slate-500 uppercase">Contract</div>
                                                 <div className="text-white font-mono font-bold">{offer.years} Years</div>
                                             </div>
                                         </div>
                                         <button 
                                            onClick={() => acceptTransfer(offer)}
                                            className="w-full py-2 bg-slate-700 hover:bg-white hover:text-slate-900 transition-colors text-white font-bold uppercase text-xs rounded-lg"
                                         >
                                             Accept Offer
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ClubHub;