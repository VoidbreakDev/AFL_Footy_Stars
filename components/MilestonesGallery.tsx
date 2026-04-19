import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getLegacyBreakdown, getLegacyTier } from '../utils/legacyUtils';
import { LEGACY_TIERS, MILESTONE_DEFINITIONS } from '../constants';

const MilestonesGallery: React.FC = () => {
    const { player, setView } = useGame();
    const [filter, setFilter] = useState<'ALL' | 'STATS' | 'AWARDS' | 'LEGACY' | 'NARRATIVE'>('ALL');

    if (!player) return null;

    const milestones = player.milestones || [];
    const legacyScore = player.legacyScore || 0;
    const legacyTier = getLegacyTier(legacyScore);
    const legacyBreakdown = getLegacyBreakdown(player);

    const filterOptions: { key: typeof filter; label: string; icon: string }[] = [
        { key: 'ALL', label: 'All', icon: '🌟' },
        { key: 'STATS', label: 'Stats', icon: '📊' },
        { key: 'AWARDS', label: 'Awards', icon: '🏆' },
        { key: 'LEGACY', label: 'Legacy', icon: '⭐' },
        { key: 'NARRATIVE', label: 'Narrative', icon: '📖' },
    ];

    const typeToFilter = (type: string): typeof filter => {
        switch (type) {
            case 'MATCHES': case 'GOALS': case 'DISPOSALS': case 'TACKLES': case 'VOTES': return 'STATS';
            case 'AWARDS': case 'SEASONS': case 'CHEMISTRY': return 'AWARDS';
            case 'LEGACY': return 'LEGACY';
            case 'NARRATIVE': return 'NARRATIVE';
            default: return 'STATS';
        }
    };

    const filteredMilestones = filter === 'ALL'
        ? milestones
        : milestones.filter(m => typeToFilter(m.type) === filter);

    const sortedMilestones = [...filteredMilestones].sort((a, b) => b.achievedRound - a.achievedRound);

    // Compute locked milestone progress
    const getMilestoneProgress = (def: typeof MILESTONE_DEFINITIONS[0]) => {
        switch (def.type) {
            case 'MATCHES': return player.careerStats?.matches || 0;
            case 'GOALS': return player.careerStats?.goals || 0;
            case 'DISPOSALS': return player.careerStats?.disposals || 0;
            case 'TACKLES': return player.careerStats?.tackles || 0;
            case 'VOTES': return player.careerStats?.votes || 0;
            case 'AWARDS': return player.careerStats?.awards?.length || 0;
            case 'SEASONS': return player.seasonsPlayed || 0;
            case 'CHEMISTRY': return player.teammates?.filter(t => t.status === 'BEST_MATE').length || 0;
            case 'LEGACY': return legacyScore;
            case 'NARRATIVE': return player.completedStoryArcs?.length || 0;
            default: return 0;
        }
    };

    const getCategoryIcon = (type: string) => {
        switch(type) {
            case 'MATCHES': return '⚽';
            case 'GOALS': return '🥅';
            case 'DISPOSALS': return '🏉';
            case 'TACKLES': return '🛑';
            case 'VOTES': return '🗳️';
            case 'AWARDS': return '🏆';
            case 'SEASONS': return '📅';
            case 'CHEMISTRY': return '🤝';
            case 'LEGACY': return '⭐';
            case 'NARRATIVE': return '📖';
            default: return '📍';
        }
    };

    const getCategoryColor = (type: string) => {
        switch(type) {
            case 'VOTES': case 'AWARDS': return 'from-yellow-900/20 to-yellow-800 border-yellow-500';
            case 'LEGACY': return 'from-amber-900/20 to-amber-800 border-amber-500';
            case 'NARRATIVE': return 'from-purple-900/20 to-purple-800 border-purple-500';
            default: return 'from-emerald-900/20 to-emerald-800 border-emerald-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setView('PLAYER')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-black text-emerald-400 uppercase italic">Milestones</h1>
                <div className="w-20"></div>
            </div>

            {/* Legacy Path Section */}
            <div className="bg-gradient-to-r from-amber-900/30 to-slate-800 rounded-xl border border-amber-500/30 p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="text-amber-400 font-black text-sm uppercase">Legacy Path</h3>
                        <p className="text-slate-500 text-[10px]">Your journey to immortality</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-white">{legacyScore}</div>
                        <div className="text-[10px] text-amber-400 font-bold">{legacyTier.title}</div>
                    </div>
                </div>

                {/* Legacy Score Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((legacyScore / 850) * 100, 100)}%` }}
                    ></div>
                </div>

                {/* Tier Progress */}
                {LEGACY_TIERS.find(t => legacyScore >= t.minScore && legacyScore < t.maxScore) && (
                    <div className="text-[10px] text-slate-500 mb-3">
                        Next: {LEGACY_TIERS.find(t => t.minScore > legacyScore)?.title || 'MAX'} — {((LEGACY_TIERS.find(t => t.minScore > legacyScore)?.minScore || 850) - legacyScore)} points needed
                    </div>
                )}

                {/* Pillar Breakdown */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Stats', value: legacyBreakdown.stats, max: 63, color: 'bg-blue-500' },
                        { label: 'Awards', value: legacyBreakdown.awards, max: 40, color: 'bg-yellow-500' },
                        { label: 'Longevity', value: legacyBreakdown.longevity, max: 23, color: 'bg-green-500' },
                        { label: 'Narrative', value: legacyBreakdown.narrative, max: 40, color: 'bg-purple-500' },
                        { label: 'Community', value: legacyBreakdown.community, max: 10, color: 'bg-pink-500' },
                        { label: 'Leadership', value: legacyBreakdown.leadership, max: 10, color: 'bg-orange-500' },
                    ].map(pillar => (
                        <div key={pillar.label} className="text-center">
                            <div className="text-[9px] text-slate-500 uppercase font-bold">{pillar.label}</div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                <div className={`h-full ${pillar.color} rounded-full`} style={{ width: `${(pillar.value / pillar.max) * 100}%` }}></div>
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold">{pillar.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filterOptions.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setFilter(opt.key)}
                        className={`px-3 py-2 rounded-lg font-bold text-xs uppercase whitespace-nowrap transition-all ${
                            filter === opt.key
                                ? 'bg-emerald-500 text-slate-900 shadow-lg'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        {opt.icon} {opt.label}
                    </button>
                ))}
            </div>

            {/* Achieved Milestones */}
            {sortedMilestones.length > 0 ? (
                <div className="space-y-4">
                    {sortedMilestones.map((milestone, index) => (
                        <div key={index} className={`bg-gradient-to-r ${getCategoryColor(milestone.type)} rounded-xl border-l-4 p-4 flex gap-4 items-start`}>
                            <div className="w-12 h-12 rounded-full bg-slate-900/50 border-2 border-emerald-500/50 flex items-center justify-center text-2xl shrink-0">
                                {getCategoryIcon(milestone.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-white text-lg leading-tight mb-1">{milestone.description}</h3>
                                <div className="flex gap-4 text-xs text-slate-400">
                                    <span className="font-bold text-emerald-400">Round {milestone.achievedRound}</span>
                                    {milestone.achievedYear && <span>• Year {milestone.achievedYear}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-bold text-slate-400 mb-1">
                        {filter === 'ALL' ? 'No Milestones Yet' : `No ${filter.toLowerCase()} milestones achieved`}
                    </h3>
                    <p className="text-xs text-slate-500">Keep playing to unlock milestones!</p>
                </div>
            )}

            {/* Locked/Upcoming Milestones */}
            <div className="mt-8">
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-3">🔒 Upcoming Milestones</h3>
                <div className="space-y-2">
                    {MILESTONE_DEFINITIONS
                        .filter(def => typeToFilter(def.type) === filter || filter === 'ALL')
                        .slice(0, 5)
                        .map((def, i) => {
                            const progress = getMilestoneProgress(def);
                            const isComplete = progress >= def.value;
                            const pct = Math.min((progress / def.value) * 100, 100);
                            return (
                                <div key={i} className={`bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 ${isComplete ? 'opacity-40' : ''}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{getCategoryIcon(def.type)}</span>
                                            <span className="text-xs text-slate-300 font-bold">{def.description}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold">{progress}/{def.value}</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-600 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default MilestonesGallery;
