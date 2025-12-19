import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../constants';
import { hasAchievement, getAchievementProgress, getRarityColor } from '../utils/achievementUtils';

const Achievements: React.FC = () => {
  const { player, setView } = useGame();
  const [filter, setFilter] = useState<'ALL' | 'CAREER' | 'MATCH' | 'SKILL' | 'SPECIAL' | 'LEGEND'>('ALL');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  if (!player) return null;

  const filteredAchievements = ACHIEVEMENTS.filter(ach => {
    if (filter !== 'ALL' && ach.category !== filter) return false;
    if (showUnlockedOnly && !hasAchievement(player, ach.id)) return false;
    return true;
  });

  const unlockedCount = ACHIEVEMENTS.filter(ach => hasAchievement(player, ach.id)).length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercentage = Math.floor((unlockedCount / totalCount) * 100);

  return (
    <div className="flex flex-col h-full pb-24 bg-slate-950">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 shadow-xl relative">
        <button
          onClick={() => setView('DASHBOARD')}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-white hover:text-slate-900 transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-black text-white uppercase italic">Achievements</h1>
          <p className="text-sm text-slate-400">
            {unlockedCount} / {totalCount} Unlocked ({completionPercentage}%)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {(['ALL', 'CAREER', 'MATCH', 'SKILL', 'SPECIAL', 'LEGEND'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-emerald-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Unlocked Only */}
        <button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          className={`w-full px-4 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${
            showUnlockedOnly
              ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-600'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {showUnlockedOnly ? '✓ Unlocked Only' : 'Show All'}
        </button>
      </div>

      {/* Achievement List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="text-lg">No achievements found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredAchievements.map(ach => {
            const unlocked = hasAchievement(player, ach.id);
            const progress = getAchievementProgress(player, ach.id);
            const rarityColor = getRarityColor(ach.rarity);
            const unlockedData = player.achievements?.find(a => a.achievementId === ach.id);

            return (
              <div
                key={ach.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  unlocked
                    ? `${rarityColor} bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg`
                    : 'border-slate-700 bg-slate-800/50 opacity-60'
                }`}
              >
                {/* Unlocked Badge */}
                {unlocked && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                    Unlocked
                  </div>
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                    {ach.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {ach.name}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ach.rarity === 'COMMON' ? 'bg-slate-700 text-slate-300' :
                        ach.rarity === 'RARE' ? 'bg-blue-900 text-blue-300' :
                        ach.rarity === 'EPIC' ? 'bg-purple-900 text-purple-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {ach.rarity}
                      </span>
                    </div>

                    <p className={`text-sm mb-2 ${unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                      {ach.description}
                    </p>

                    {/* Unlocked Date */}
                    {unlocked && unlockedData && (
                      <p className="text-xs text-emerald-400">
                        Round {unlockedData.round}, Season {unlockedData.season}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {!unlocked && progress && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{progress.current} / {progress.target}</span>
                          <span>{Math.floor(progress.percentage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Locked Hint */}
                    {!unlocked && !progress && (
                      <p className="text-xs text-slate-600 italic mt-2">
                        Keep playing to unlock this achievement!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Achievements;
