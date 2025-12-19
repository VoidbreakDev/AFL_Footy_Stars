
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerProfile, Position } from '../types';
import Avatar from './Avatar';

const PlayerComparison: React.FC = () => {
    const { player, league, setView } = useGame();
    const [selectedOpponent, setSelectedOpponent] = useState<string | null>(null);

    if (!player) return null;

    // Get all CPU players from all teams
    const allCPUPlayers: Array<{ player: PlayerProfile; team: string; colors: string[] }> = [];
    league.forEach(team => {
        team.players.forEach(p => {
            allCPUPlayers.push({ player: p, team: team.name, colors: team.colors });
        });
    });

    // Sort by overall rating (average attributes)
    const calculateOverall = (p: PlayerProfile) => {
        const attrs = Object.values(p.attributes);
        return Math.round(attrs.reduce((a, b) => a + b, 0) / attrs.length);
    };

    const sortedPlayers = allCPUPlayers
        .sort((a, b) => calculateOverall(b.player) - calculateOverall(a.player));

    const opponent = selectedOpponent
        ? allCPUPlayers.find(p => p.player.name === selectedOpponent)
        : null;

    const ComparisonBar = ({ label, playerVal, opponentVal, max = 100 }: { label: string; playerVal: number; opponentVal: number; max?: number }) => {
        const playerPercent = (playerVal / max) * 100;
        const opponentPercent = (opponentVal / max) * 100;
        const playerBetter = playerVal > opponentVal;

        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-1">
                    <span>{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Player Side */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <span className={`text-sm font-mono font-bold ${playerBetter ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {playerVal}
                        </span>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${playerBetter ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                style={{ width: `${playerPercent}%`, marginLeft: 'auto' }}
                            ></div>
                        </div>
                    </div>

                    {/* VS Divider */}
                    <div className="text-xs font-bold text-slate-600 px-1">VS</div>

                    {/* Opponent Side */}
                    <div className="flex-1 flex items-center gap-2">
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${!playerBetter ? 'bg-orange-500' : 'bg-slate-600'}`}
                                style={{ width: `${opponentPercent}%` }}
                            ></div>
                        </div>
                        <span className={`text-sm font-mono font-bold ${!playerBetter ? 'text-orange-400' : 'text-slate-400'}`}>
                            {opponentVal}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const myTeam = league.find(t => t.name === player.contract.clubName);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setView('PLAYER')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-black text-emerald-400 uppercase italic">Player Compare</h1>
                <div className="w-20"></div>
            </div>

            {/* Player Selection */}
            {!selectedOpponent ? (
                <div>
                    <p className="text-sm text-slate-400 mb-4 text-center">Select a player to compare with {player.name}</p>

                    {/* Filter by Position */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedOpponent(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold uppercase whitespace-nowrap"
                        >
                            All Positions
                        </button>
                        {Object.values(Position).map(pos => (
                            <button
                                key={pos}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold uppercase whitespace-nowrap hover:bg-slate-700"
                            >
                                {pos}
                            </button>
                        ))}
                    </div>

                    {/* Player List */}
                    <div className="space-y-2">
                        {sortedPlayers.slice(0, 50).map(({ player: p, team, colors }) => {
                            const overall = calculateOverall(p);
                            return (
                                <button
                                    key={p.name}
                                    onClick={() => setSelectedOpponent(p.name)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 flex items-center gap-3 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600">
                                        <Avatar avatar={p.avatar} teamColors={colors} className="w-full h-full" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-white text-sm">{p.name}</div>
                                        <div className="flex gap-2 text-xs text-slate-400">
                                            <span>{team}</span>
                                            <span>•</span>
                                            <span>{p.position}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold">OVR</div>
                                        <div className="text-xl font-black text-emerald-400">{overall}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Comparison Header */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {/* Your Player */}
                        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800 rounded-xl p-3 border-2 border-emerald-500">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-emerald-500">
                                <Avatar avatar={player.avatar} teamColors={myTeam?.colors} className="w-full h-full" />
                            </div>
                            <div className="text-center">
                                <div className="font-black text-white text-xs mb-1 truncate">{player.name}</div>
                                <div className="text-[10px] text-emerald-400 uppercase font-bold">{player.position}</div>
                                <div className="text-[10px] text-slate-500">{player.contract.clubName}</div>
                            </div>
                        </div>

                        {/* VS */}
                        <div className="flex items-center justify-center">
                            <div className="text-4xl font-black text-slate-700 italic">VS</div>
                        </div>

                        {/* Opponent */}
                        <div className="bg-gradient-to-br from-orange-900/30 to-slate-800 rounded-xl p-3 border-2 border-orange-500">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-orange-500">
                                <Avatar avatar={opponent!.player.avatar} teamColors={opponent!.colors} className="w-full h-full" />
                            </div>
                            <div className="text-center">
                                <div className="font-black text-white text-xs mb-1 truncate">{opponent!.player.name}</div>
                                <div className="text-[10px] text-orange-400 uppercase font-bold">{opponent!.player.position}</div>
                                <div className="text-[10px] text-slate-500">{opponent!.team}</div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Comparison */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Overall Rating</h3>
                        <ComparisonBar
                            label="Overall"
                            playerVal={calculateOverall(player)}
                            opponentVal={calculateOverall(opponent!.player)}
                        />
                    </div>

                    {/* Attributes Comparison */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Attributes</h3>
                        <ComparisonBar label="Kicking" playerVal={player.attributes.kicking} opponentVal={opponent!.player.attributes.kicking} />
                        <ComparisonBar label="Handball" playerVal={player.attributes.handball} opponentVal={opponent!.player.attributes.handball} />
                        <ComparisonBar label="Tackling" playerVal={player.attributes.tackling} opponentVal={opponent!.player.attributes.tackling} />
                        <ComparisonBar label="Marking" playerVal={player.attributes.marking} opponentVal={opponent!.player.attributes.marking} />
                        <ComparisonBar label="Speed" playerVal={player.attributes.speed} opponentVal={opponent!.player.attributes.speed} />
                        <ComparisonBar label="Stamina" playerVal={player.attributes.stamina} opponentVal={opponent!.player.attributes.stamina} />
                        <ComparisonBar label="Goal Sense" playerVal={player.attributes.goalSense} opponentVal={opponent!.player.attributes.goalSense} />
                    </div>

                    {/* Career Stats Comparison */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Career Statistics</h3>
                        <ComparisonBar label="Matches" playerVal={player.careerStats.matches} opponentVal={opponent!.player.careerStats.matches} max={400} />
                        <ComparisonBar label="Goals" playerVal={player.careerStats.goals} opponentVal={opponent!.player.careerStats.goals} max={500} />
                        <ComparisonBar label="Disposals" playerVal={player.careerStats.disposals} opponentVal={opponent!.player.careerStats.disposals} max={8000} />
                        <ComparisonBar label="Tackles" playerVal={player.careerStats.tackles} opponentVal={opponent!.player.careerStats.tackles} max={1000} />
                        <ComparisonBar label="Brownlow Votes" playerVal={player.careerStats.votes} opponentVal={opponent!.player.careerStats.votes} max={100} />
                    </div>

                    {/* Winner Summary */}
                    <div className="bg-gradient-to-r from-purple-900/20 to-slate-800 rounded-xl p-4 border border-purple-500/30">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Comparison Summary</h3>
                        {(() => {
                            let playerWins = 0;
                            let opponentWins = 0;

                            // Count attribute wins
                            Object.keys(player.attributes).forEach(key => {
                                const k = key as keyof typeof player.attributes;
                                if (player.attributes[k] > opponent!.player.attributes[k]) playerWins++;
                                else if (player.attributes[k] < opponent!.player.attributes[k]) opponentWins++;
                            });

                            return (
                                <div className="flex justify-around items-center">
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-emerald-400">{playerWins}</div>
                                        <div className="text-xs text-slate-500">Better Stats</div>
                                    </div>
                                    <div className="text-slate-700 text-2xl">—</div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-orange-400">{opponentWins}</div>
                                        <div className="text-xs text-slate-500">Better Stats</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Change Opponent */}
                    <button
                        onClick={() => setSelectedOpponent(null)}
                        className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors uppercase text-sm"
                    >
                        Compare with Different Player
                    </button>
                </div>
            )}
        </div>
    );
};

export default PlayerComparison;
