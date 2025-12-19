
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';
import { getEligibleNicknames, getNameBasedNicknames } from '../utils/nicknameUtils';

const PlayerStatsView: React.FC = () => {
    const { player, league, setPlayer, setView } = useGame();

    if (!player) return null;
    const myTeam = league.find(t => t.name === player.contract.clubName);

    const [bio, setBio] = useState(player.bio || "");
    const [isSavingBio, setIsSavingBio] = useState(false);
    const [showNicknameModal, setShowNicknameModal] = useState(false);

    useEffect(() => {
        setBio(player.bio || "");
    }, [player.bio]);

    const handleSaveBio = () => {
        setIsSavingBio(true);
        setTimeout(() => {
            setPlayer(prev => prev ? ({ ...prev, bio }) : null);
            setIsSavingBio(false);
        }, 500);
    };

    const StatRow = ({ label, season, career }: { label: string, season: number, career: number }) => (
        <div className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
            <span className="text-slate-400 font-medium">{label}</span>
            <div className="flex gap-8">
                <span className="font-mono font-bold w-12 text-right">{season}</span>
                <span className="font-mono font-bold w-12 text-right text-emerald-400">{career}</span>
            </div>
        </div>
    );

    // Helper for Morale Visualization
    const getMoraleConfig = (val: number) => {
        if (val >= 80) return { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'On Fire', desc: 'Performance Boost!' };
        if (val >= 60) return { color: 'text-blue-400', bg: 'bg-blue-500', label: 'Happy', desc: 'Playing well.' };
        if (val >= 40) return { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Content', desc: 'Steady performance.' };
        if (val >= 20) return { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Unhappy', desc: 'Performance suffering.' };
        return { color: 'text-red-500', bg: 'bg-red-600', label: 'Depressed', desc: 'Major penalty.' };
    };

    const moraleConf = getMoraleConfig(player.morale);

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500 overflow-hidden">
                     <Avatar avatar={player.avatar} teamColors={myTeam?.colors} className="w-full h-full" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-black text-white italic uppercase">{player.name}</h2>
                        {player.jerseyNumber && (
                            <div className="px-2 py-1 bg-emerald-500 text-slate-900 font-black text-xl rounded">
                                #{player.jerseyNumber}
                            </div>
                        )}
                    </div>
                    {player.nickname && (
                        <div className="text-sm text-emerald-400 italic font-bold mt-1">"{player.nickname}"</div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-1 bg-emerald-900 text-emerald-400 text-xs font-bold rounded uppercase">{player.position}</span>
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded uppercase">Age {player.age}</span>
                        <button
                            onClick={() => setShowNicknameModal(true)}
                            className="px-2 py-1 bg-purple-900 text-purple-300 text-xs font-bold rounded uppercase hover:bg-purple-800 transition-colors"
                        >
                            ✏️ Nickname
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={() => setView('ACHIEVEMENTS')}
                    className="py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-black text-sm rounded-xl uppercase tracking-wide shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
                >
                    <span className="text-xl">🏆</span>
                    <span className="text-xs">Achievements</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                        {player.achievements?.length || 0} / 52
                    </span>
                </button>
                <button
                    onClick={() => setView('PLAYER_COMPARISON')}
                    className="py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm rounded-xl uppercase tracking-wide shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
                >
                    <span className="text-xl">⚔️</span>
                    <span className="text-xs">Compare</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                        vs League
                    </span>
                </button>
            </div>

            {/* BIO SECTION */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6 shadow-lg">
                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">Biography</h3>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write your player's backstory, strengths, and dreams..."
                    className="w-full bg-slate-900/50 text-slate-200 p-3 rounded-lg border border-slate-600 focus:border-emerald-500 outline-none text-sm min-h-[100px] resize-none mb-3 transition-colors placeholder:text-slate-600 placeholder:italic"
                />
                <button
                    onClick={handleSaveBio}
                    disabled={isSavingBio || bio === player.bio}
                    className={`w-full py-2 font-bold uppercase rounded-lg text-xs transition-all ${
                        isSavingBio ? 'bg-slate-700 text-slate-400' : 
                        bio === player.bio ? 'bg-slate-700 text-slate-500' : 
                        'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95'
                    }`}
                >
                    {isSavingBio ? 'Saving...' : bio === player.bio ? 'Saved' : 'Save Bio'}
                </button>
            </div>

            {/* Morale Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                     <div className="text-xs font-bold text-slate-400 uppercase">Morale</div>
                     <div className={`text-xs font-bold uppercase ${moraleConf.color}`}>{moraleConf.label}</div>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mb-2">
                    <div className={`h-full transition-all duration-500 ${moraleConf.bg}`} style={{ width: `${player.morale}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 italic">{moraleConf.desc}</p>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
                <div className="bg-slate-950 p-3 flex justify-end gap-8 text-xs font-bold text-slate-500 uppercase tracking-wider px-4">
                    <span className="w-12 text-right">Seas</span>
                    <span className="w-12 text-right">Car</span>
                </div>
                <div className="p-4 pt-0">
                    <StatRow label="Matches" season={player.seasonStats.matches} career={player.careerStats.matches} />
                    <StatRow label="Goals" season={player.seasonStats.goals} career={player.careerStats.goals} />
                    <StatRow label="Disposals" season={player.seasonStats.disposals} career={player.careerStats.disposals} />
                    <StatRow label="Tackles" season={player.seasonStats.tackles} career={player.careerStats.tackles} />
                    <StatRow label="Brownlow Votes" season={player.seasonStats.votes} career={player.careerStats.votes} />
                </div>
            </div>

            {/* MILESTONES */}
            <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xl font-black text-white italic uppercase">Milestone History</h3>
                     <button
                         onClick={() => setView('MILESTONES')}
                         className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg uppercase tracking-wide hover:shadow-lg transition-all active:scale-95"
                     >
                         📸 Gallery
                     </button>
                 </div>
                 <div className="space-y-3">
                    {player.milestones && player.milestones.length > 0 ? player.milestones.map((milestone, i) => (
                        <div key={i} className="bg-yellow-900/10 border border-yellow-600/20 p-3 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center text-lg">🏆</div>
                            <div>
                                <div className="font-bold text-yellow-500 text-sm">{milestone.description}</div>
                                <div className="text-xs text-slate-500">Achieved Round {milestone.achievedRound}</div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 bg-slate-800 rounded-xl text-center text-slate-500 text-sm italic border border-slate-700">
                            No milestones achieved yet. Keep playing!
                        </div>
                    )}
                 </div>
            </div>

            {/* Rivalries */}
            <h3 className="text-xl font-black text-white italic uppercase mb-4">Active Rivalries</h3>
            <div className="space-y-4 mb-8">
                {player.rivalries && player.rivalries.length > 0 ? player.rivalries.map((rival, i) => (
                    <div key={i} className="bg-gradient-to-r from-orange-900/20 to-slate-800 p-4 rounded-xl border-l-4 border-orange-500 flex justify-between items-center">
                        <div>
                             <div className="font-bold text-white text-lg">{rival.opponentName}</div>
                             <div className="text-xs text-slate-400">{rival.club}</div>
                             <div className="text-xs text-orange-400 mt-1 italic">"{rival.reason}"</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Intensity</div>
                            <div className="font-black text-orange-500 uppercase">{rival.intensity}</div>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 bg-slate-800 rounded-xl text-center text-slate-500 text-sm italic border border-slate-700">
                        No rivalries yet. Play aggressive to make enemies!
                    </div>
                )}
            </div>

            {/* Awards */}
            <h3 className="text-xl font-black text-white italic uppercase mb-4">Awards</h3>
            <div className="grid grid-cols-2 gap-4">
                {player.careerStats.awards.length > 0 ? player.careerStats.awards.map((award, i) => (
                    <div key={i} className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-xl flex flex-col items-center text-center">
                        <span className="text-2xl mb-2">🏆</span>
                        <span className="font-bold text-yellow-500 text-sm">{award}</span>
                    </div>
                )) : (
                    <div className="col-span-2 p-6 border-2 border-dashed border-slate-700 rounded-xl text-center text-slate-500 text-sm">
                        No awards yet. Keep training!
                    </div>
                )}
            </div>

            {/* Nickname Selection Modal */}
            {showNicknameModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl border-2 border-purple-500 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-center">
                            <h3 className="text-xl font-black text-white uppercase">Choose Your Nickname</h3>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Earned Nicknames */}
                            <div>
                                <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Earned Through Performance</h4>
                                <div className="space-y-2">
                                    {getEligibleNicknames(player).slice(0, 8).map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setPlayer(prev => prev ? { ...prev, nickname: item.nickname } : null);
                                                setShowNicknameModal(false);
                                            }}
                                            className={`w-full p-3 rounded-lg text-left transition-all ${
                                                player.nickname === item.nickname
                                                    ? 'bg-purple-600 border-2 border-purple-400'
                                                    : 'bg-slate-800 border border-slate-700 hover:border-purple-500'
                                            }`}
                                        >
                                            <div className="font-bold text-white">{item.nickname}</div>
                                            <div className="text-xs text-slate-400">Priority: {item.priority}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name-based Suggestions */}
                            <div>
                                <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Based on Your Name</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {getNameBasedNicknames(player.name).map((nick, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setPlayer(prev => prev ? { ...prev, nickname: nick } : null);
                                                setShowNicknameModal(false);
                                            }}
                                            className={`p-2 rounded-lg text-sm font-bold transition-all ${
                                                player.nickname === nick
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-blue-900/50'
                                            }`}
                                        >
                                            {nick}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Nickname */}
                            <button
                                onClick={() => {
                                    setPlayer(prev => prev ? { ...prev, nickname: undefined } : null);
                                    setShowNicknameModal(false);
                                }}
                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:border-red-500 hover:text-red-400 transition-all"
                            >
                                Remove Nickname
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowNicknameModal(false)}
                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerStatsView;