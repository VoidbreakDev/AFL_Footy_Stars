
import React from 'react';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';

const CareerSummary: React.FC = () => {
    const { player, resetGame, league } = useGame();

    if (!player) return null;
    const myTeam = league.find(t => t.name === player.contract.clubName);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-4 pb-12 overflow-y-auto">
            {/* Header */}
            <div className="text-center py-8">
                <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-widest mb-2 drop-shadow-lg">Hall of Fame</h1>
                <div className="w-24 h-1 bg-yellow-600 mx-auto rounded-full"></div>
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
        </div>
    );
};

export default CareerSummary;
