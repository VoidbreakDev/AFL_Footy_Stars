
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';
import { getLegacyTier } from '../utils/legacyUtils';

const CareerSummary: React.FC = () => {
    const { player, setPlayer, resetGame, league } = useGame();

    if (!player) return null;
    const myTeam = league.find(t => t.name === player.contract.clubName);

    const legacyScore = player.legacyScore ?? 0;
    const legacyTier = getLegacyTier(legacyScore);
    const isRetired = player.age >= 35 || !!(player as any).isRetired;
    const [showPostCareerModal, setShowPostCareerModal] = useState(
        isRetired && legacyScore >= 300 && !player.postCareerPath
    );

    const selectPostCareerPath = (path: 'MEDIA' | 'AMBASSADOR' | 'COACHING') => {
        setPlayer(prev => {
            if (!prev) return null;
            const updates: Partial<typeof prev> = { postCareerPath: path };
            if (path === 'MEDIA') {
                updates.mediaReputation = {
                    ...prev.mediaReputation,
                    score: (prev.mediaReputation?.score ?? 0) + 20
                } as any;
            }
            return { ...prev, ...updates };
        });
        setShowPostCareerModal(false);
    };

    const bestSeason = player.careerHistory?.reduce<any>((best, h: any) =>
        (h.stats?.goals ?? 0) > (best?.stats?.goals ?? 0) ? h : best,
        player.careerHistory?.[0]
    );
    const firstAward = player.careerHistory?.find((h: any) => h.awards?.length)?.awards?.[0];

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-4 pb-12 overflow-y-auto">
            {/* Header */}
            <div className="text-center py-8">
                <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-widest mb-2 drop-shadow-lg">Hall of Fame</h1>
                <div className="w-24 h-1 bg-yellow-600 mx-auto rounded-full"></div>
            </div>

            {/* Legacy Score Card */}
            <div className="bg-gradient-to-r from-yellow-600 to-amber-500 rounded-2xl p-5 mb-6 text-center shadow-lg">
                <div className="text-yellow-100/80 text-sm font-semibold">Legacy Score</div>
                <div className="text-5xl font-black text-white mt-1">{legacyScore}</div>
                <div className="text-yellow-100 font-semibold text-lg mt-1">{legacyTier.title}</div>
            </div>

            {/* Player Card */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 border border-yellow-500/30 shadow-2xl relative overflow-hidden mb-8">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 text-6xl opacity-5 grayscale pointer-events-none">🏅</div>
                
                <div className="flex flex-col items-center relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-yellow-500 shadow-xl overflow-hidden mb-4">
                        <Avatar avatar={player.avatar} teamColors={myTeam?.colors} className="w-full h-full" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-white uppercase text-center mb-1">{player.name}</h2>
                    <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-6">Legend</p>

                    {/* Career Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-700">
                            <div className="text-2xl font-black text-white">{player.careerStats.matches}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Games</div>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-700">
                            <div className="text-2xl font-black text-white">{player.careerStats.goals}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Goals</div>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-700">
                            <div className="text-2xl font-black text-white">{player.careerStats.disposals}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Disposals</div>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl text-center border border-slate-700">
                            <div className="text-2xl font-black text-white">{player.careerStats.votes}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Votes</div>
                        </div>
                    </div>

                    {/* Milestones List */}
                    <div className="w-full">
                        <h3 className="text-slate-400 font-bold uppercase text-xs mb-3 text-center">Career Milestones</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                            {player.milestones.length > 0 ? player.milestones.map((m, i) => (
                                <div key={i} className="bg-slate-800 p-2 rounded text-center text-xs text-yellow-100 border border-slate-700">
                                    {m.description}
                                </div>
                            )) : (
                                <div className="text-slate-600 text-xs italic text-center">No major milestones recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legacy Wall */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-5 mb-6">
                <h3 className="text-white font-bold mb-3">🏆 Legacy Wall</h3>
                {bestSeason && (
                    <div className="text-white/60 text-sm mb-1">
                        Best Season: {bestSeason.year ?? '—'} — {bestSeason.stats?.goals ?? 0} goals
                    </div>
                )}
                <div className="text-white/60 text-sm mb-1">
                    Career Goals: {player.careerStats?.goals ?? 0}
                </div>
                {firstAward && (
                    <div className="text-white/60 text-sm">Most Memorable Award: {firstAward.name}</div>
                )}
                {player.postCareerPath && (
                    <div className="text-amber-400 text-sm mt-2 font-semibold">
                        Post-Career: {player.postCareerPath === 'MEDIA' ? '📺 Media Pundit' : player.postCareerPath === 'AMBASSADOR' ? '🏆 Club Ambassador' : '🎯 Coaching Path'}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
                <button 
                    onClick={resetGame}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-xl rounded-xl uppercase shadow-lg shadow-emerald-900/50 active:scale-95 transition-transform"
                >
                    Start New Career
                </button>
                <p className="text-center text-xs text-slate-500">
                    Starting a new career will overwrite this save file.
                </p>
            </div>

            {/* Post-Career Path Modal */}
            {showPostCareerModal && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h2 className="text-xl font-black mb-1">Your Next Chapter</h2>
                        <p className="text-gray-500 text-sm mb-4">Your legacy score qualifies you for a post-career role.</p>
                        {([
                            { id: 'MEDIA' as const, label: '📺 Media Pundit', desc: '+20 media reputation score' },
                            { id: 'AMBASSADOR' as const, label: '🏆 Club Ambassador', desc: 'Honour your club permanently' },
                            { id: 'COACHING' as const, label: '🎯 Coaching Path', desc: 'Former Player recognition on career wall' },
                        ]).map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => selectPostCareerPath(opt.id)}
                                className="w-full text-left border border-gray-200 rounded-xl p-3 mb-2 hover:bg-gray-50 transition"
                            >
                                <div className="font-bold text-sm">{opt.label}</div>
                                <div className="text-gray-500 text-xs mt-0.5">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerSummary;
