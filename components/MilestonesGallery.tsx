
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Milestone } from '../types';

const MilestonesGallery: React.FC = () => {
    const { player, setView } = useGame();
    const [filter, setFilter] = useState<'ALL' | 'CAREER' | 'MATCH' | 'SKILL'>('ALL');

    if (!player) return null;

    // Categorize milestones by type
    const categorizeMilestone = (description: string): 'CAREER' | 'MATCH' | 'SKILL' => {
        const desc = description.toLowerCase();
        if (desc.includes('match') || desc.includes('game') || desc.includes('debut')) return 'MATCH';
        if (desc.includes('goal') || desc.includes('disposal') || desc.includes('tackle') || desc.includes('vote')) return 'SKILL';
        return 'CAREER';
    };

    const milestones = player.milestones || [];
    const filteredMilestones = filter === 'ALL'
        ? milestones
        : milestones.filter(m => categorizeMilestone(m.description) === filter);

    // Sort by achievement round (most recent first)
    const sortedMilestones = [...filteredMilestones].sort((a, b) => b.achievedRound - a.achievedRound);

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'MATCH': return '⚽';
            case 'SKILL': return '⭐';
            case 'CAREER': return '🏆';
            default: return '📍';
        }
    };

    const getCategoryColor = (category: string) => {
        switch(category) {
            case 'MATCH': return 'from-blue-900/20 to-blue-800 border-blue-500';
            case 'SKILL': return 'from-purple-900/20 to-purple-800 border-purple-500';
            case 'CAREER': return 'from-yellow-900/20 to-yellow-800 border-yellow-500';
            default: return 'from-slate-900/20 to-slate-800 border-slate-500';
        }
    };

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
                <h1 className="text-2xl font-black text-emerald-400 uppercase italic">Milestone Gallery</h1>
                <div className="w-20"></div>
            </div>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800 rounded-xl p-4 mb-6 border border-emerald-500/30">
                <div className="flex justify-around items-center">
                    <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">{milestones.length}</div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Total Milestones</div>
                    </div>
                    <div className="w-px h-12 bg-slate-700"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-blue-400">
                            {milestones.filter(m => categorizeMilestone(m.description) === 'MATCH').length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Match</div>
                    </div>
                    <div className="w-px h-12 bg-slate-700"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-purple-400">
                            {milestones.filter(m => categorizeMilestone(m.description) === 'SKILL').length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Skill</div>
                    </div>
                    <div className="w-px h-12 bg-slate-700"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-yellow-400">
                            {milestones.filter(m => categorizeMilestone(m.description) === 'CAREER').length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase font-bold">Career</div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['ALL', 'CAREER', 'MATCH', 'SKILL'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as any)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs uppercase whitespace-nowrap transition-all ${
                            filter === cat
                                ? 'bg-emerald-500 text-slate-900 shadow-lg'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {cat === 'ALL' ? '🌟 All' : cat === 'CAREER' ? '🏆 Career' : cat === 'MATCH' ? '⚽ Match' : '⭐ Skill'}
                    </button>
                ))}
            </div>

            {/* Timeline View */}
            {sortedMilestones.length > 0 ? (
                <div className="space-y-4">
                    {sortedMilestones.map((milestone, index) => {
                        const category = categorizeMilestone(milestone.description);
                        return (
                            <div
                                key={index}
                                className="relative"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Timeline connector */}
                                {index < sortedMilestones.length - 1 && (
                                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-emerald-500 to-slate-700"></div>
                                )}

                                {/* Milestone Card */}
                                <div className={`bg-gradient-to-r ${getCategoryColor(category)} rounded-xl border-l-4 p-4 flex gap-4 items-start transform transition-all hover:scale-[1.02] hover:shadow-xl`}>
                                    {/* Icon Circle */}
                                    <div className="w-12 h-12 rounded-full bg-slate-900/50 border-2 border-emerald-500/50 flex items-center justify-center text-2xl shrink-0">
                                        {getCategoryIcon(category)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-white text-lg leading-tight">
                                                {milestone.description}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                category === 'MATCH' ? 'bg-blue-500/20 text-blue-400' :
                                                category === 'SKILL' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {category}
                                            </span>
                                        </div>

                                        <div className="flex gap-4 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-emerald-400">Round {milestone.achievedRound}</span>
                                            </div>
                                            {milestone.achievedYear && (
                                                <div className="flex items-center gap-1">
                                                    <span>•</span>
                                                    <span>Year {milestone.achievedYear}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Milestones Yet</h3>
                    <p className="text-sm text-slate-500">
                        {filter === 'ALL'
                            ? 'Keep playing to achieve your first milestone!'
                            : `No ${filter.toLowerCase()} milestones achieved yet.`
                        }
                    </p>
                </div>
            )}

            {/* Upcoming Milestones Hint */}
            {milestones.length > 0 && milestones.length < 5 && (
                <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">💡 Next Milestones</h4>
                    <ul className="space-y-2 text-xs text-slate-500">
                        {player.careerStats.matches < 50 && (
                            <li>• Play {50 - player.careerStats.matches} more matches to reach 50 games</li>
                        )}
                        {player.careerStats.goals < 100 && (
                            <li>• Score {100 - player.careerStats.goals} more goals to reach 100 career goals</li>
                        )}
                        {player.careerStats.disposals < 1000 && (
                            <li>• Get {1000 - player.careerStats.disposals} more disposals to reach 1000 career disposals</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MilestonesGallery;
