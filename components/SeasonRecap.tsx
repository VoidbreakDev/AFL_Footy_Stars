
import React from 'react';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';

interface SeasonRecapProps {
    onContinue: () => void;
}

const SeasonRecap: React.FC<SeasonRecapProps> = ({ onContinue }) => {
    const { player, league, currentRound } = useGame();

    if (!player) return null;

    const myTeam = league.find(t => t.name === player.contract.clubName);
    const sortedLadder = [...league].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return b.pointsFor - a.pointsFor;
    });
    const teamPosition = sortedLadder.findIndex(t => t.name === player.contract.clubName) + 1;

    // Season highlights
    const seasonGoals = player.seasonStats.goals;
    const seasonDisposals = player.seasonStats.disposals;
    const seasonTackles = player.seasonStats.tackles;
    const seasonVotes = player.seasonStats.votes;
    const seasonMatches = player.seasonStats.matches;

    // Check for season awards
    const hasSeasonAward = player.careerStats.awards.some(a => a.includes('Season'));

    // Overall rating
    const calculateOverall = () => {
        const attrs = Object.values(player.attributes);
        return Math.round(attrs.reduce((a, b) => a + b, 0) / attrs.length);
    };

    const overall = calculateOverall();

    // Performance grade
    const getSeasonGrade = () => {
        if (seasonVotes >= 15) return { grade: 'A+', color: 'text-yellow-400', desc: 'Elite Performance' };
        if (seasonVotes >= 10) return { grade: 'A', color: 'text-emerald-400', desc: 'Outstanding' };
        if (seasonVotes >= 5) return { grade: 'B', color: 'text-blue-400', desc: 'Solid Season' };
        if (seasonVotes >= 2) return { grade: 'C', color: 'text-slate-400', desc: 'Average' };
        return { grade: 'D', color: 'text-orange-400', desc: 'Below Expectations' };
    };

    const gradeInfo = getSeasonGrade();

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-md w-full my-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-t-2xl p-6 text-center border-t-4 border-emerald-500">
                    <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Season Complete</div>
                    <h1 className="text-4xl font-black text-white italic uppercase mb-4">Year {Math.floor(currentRound / 22) + 1} Recap</h1>

                    {/* Player Card */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-20 h-20 rounded-full border-4 border-emerald-500 overflow-hidden">
                            <Avatar avatar={player.avatar} teamColors={myTeam?.colors} className="w-full h-full" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-white">{player.name}</h2>
                            <div className="text-sm text-emerald-400">{player.contract.clubName}</div>
                            <div className="text-xs text-slate-400">{player.position} • #{player.jerseyNumber}</div>
                        </div>
                    </div>
                </div>

                {/* Season Grade */}
                <div className="bg-slate-900 border-x-2 border-slate-700 p-6">
                    <div className="bg-slate-800 rounded-xl p-6 text-center border-2 border-slate-700">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Season Performance</div>
                        <div className={`text-8xl font-black ${gradeInfo.color} mb-2`}>{gradeInfo.grade}</div>
                        <div className="text-sm text-slate-400">{gradeInfo.desc}</div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-slate-900 border-x-2 border-slate-700 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Season Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-2xl font-black text-white">{seasonMatches}</div>
                            <div className="text-xs text-slate-500 uppercase">Matches</div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-2xl font-black text-emerald-400">{seasonGoals}</div>
                            <div className="text-xs text-slate-500 uppercase">Goals</div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-2xl font-black text-blue-400">{seasonDisposals}</div>
                            <div className="text-xs text-slate-500 uppercase">Disposals</div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
                            <div className="text-2xl font-black text-purple-400">{seasonTackles}</div>
                            <div className="text-xs text-slate-500 uppercase">Tackles</div>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700 col-span-2">
                            <div className="text-3xl font-black text-yellow-400">{seasonVotes}</div>
                            <div className="text-xs text-slate-500 uppercase">Brownlow Votes</div>
                        </div>
                    </div>
                </div>

                {/* Team Performance */}
                <div className="bg-slate-900 border-x-2 border-slate-700 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Team Performance</h3>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-bold text-white">{myTeam?.name}</div>
                            <div className="text-xs text-slate-500">Final Ladder Position</div>
                        </div>
                        <div className="flex items-end gap-4">
                            <div className={`text-5xl font-black ${teamPosition <= 4 ? 'text-emerald-400' : teamPosition <= 8 ? 'text-blue-400' : 'text-slate-500'}`}>
                                #{teamPosition}
                            </div>
                            <div className="flex-1 text-right text-xs text-slate-400 pb-2">
                                <div>{myTeam?.wins}W - {myTeam?.losses}L - {myTeam?.draws}D</div>
                                <div className="text-slate-500">Percentage: {myTeam?.percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Season Highlights */}
                <div className="bg-slate-900 border-x-2 border-slate-700 p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Season Highlights</h3>
                    <div className="space-y-2">
                        {seasonGoals >= 50 && (
                            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">⚽</span>
                                <div>
                                    <div className="text-sm font-bold text-yellow-400">Goal Machine</div>
                                    <div className="text-xs text-slate-500">Kicked {seasonGoals} goals this season</div>
                                </div>
                            </div>
                        )}
                        {seasonVotes >= 15 && (
                            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">🏅</span>
                                <div>
                                    <div className="text-sm font-bold text-yellow-400">Brownlow Contender</div>
                                    <div className="text-xs text-slate-500">Polled {seasonVotes} votes</div>
                                </div>
                            </div>
                        )}
                        {seasonDisposals >= 400 && (
                            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">💨</span>
                                <div>
                                    <div className="text-sm font-bold text-blue-400">Ball Magnet</div>
                                    <div className="text-xs text-slate-500">{seasonDisposals} disposals this season</div>
                                </div>
                            </div>
                        )}
                        {teamPosition <= 4 && (
                            <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">🎯</span>
                                <div>
                                    <div className="text-sm font-bold text-emerald-400">Finals Bound</div>
                                    <div className="text-xs text-slate-500">Team finished {teamPosition}{teamPosition === 1 ? 'st' : teamPosition === 2 ? 'nd' : teamPosition === 3 ? 'rd' : 'th'} on the ladder</div>
                                </div>
                            </div>
                        )}
                        {overall >= 80 && (
                            <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <div className="text-sm font-bold text-purple-400">Elite Athlete</div>
                                    <div className="text-xs text-slate-500">Overall rating: {overall}</div>
                                </div>
                            </div>
                        )}
                        {player.morale >= 90 && (
                            <div className="bg-pink-900/20 border border-pink-600/30 rounded-lg p-3 flex items-center gap-3">
                                <span className="text-2xl">😊</span>
                                <div>
                                    <div className="text-sm font-bold text-pink-400">High Spirits</div>
                                    <div className="text-xs text-slate-500">Excellent morale maintained</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Career Progress */}
                <div className="bg-slate-900 border-x-2 border-b-2 border-slate-700 rounded-b-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 text-center">Career Totals</h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-xl font-black text-white">{player.careerStats.matches}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Matches</div>
                        </div>
                        <div>
                            <div className="text-xl font-black text-emerald-400">{player.careerStats.goals}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Goals</div>
                        </div>
                        <div>
                            <div className="text-xl font-black text-yellow-400">{player.careerStats.votes}</div>
                            <div className="text-[10px] text-slate-500 uppercase">Votes</div>
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-lg rounded-xl uppercase tracking-wider shadow-2xl active:scale-95 transition-all"
                >
                    Continue to Next Season
                </button>
            </div>
        </div>
    );
};

export default SeasonRecap;
