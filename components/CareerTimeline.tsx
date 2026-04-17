import React from 'react';
import { SeasonHistory, LeagueTier } from '../types';
import TeamLogo from './TeamLogo';

interface CareerTimelineProps {
  history: SeasonHistory[];
  league: any[];
}

const CareerTimeline: React.FC<CareerTimelineProps> = ({ history, league }) => {
  const getTierColor = (tier: LeagueTier) => {
    switch (tier) {
      case LeagueTier.LOCAL: return 'from-green-900/30 to-green-800/20 border-green-500/30';
      case LeagueTier.STATE: return 'from-blue-900/30 to-blue-800/20 border-blue-500/30';
      case LeagueTier.NATIONAL: return 'from-purple-900/30 to-purple-800/20 border-purple-500/30';
    }
  };

  const getTierBadge = (tier: LeagueTier) => {
    switch (tier) {
      case LeagueTier.LOCAL: return 'bg-green-500/20 text-green-400';
      case LeagueTier.STATE: return 'bg-blue-500/20 text-blue-400';
      case LeagueTier.NATIONAL: return 'bg-purple-500/20 text-purple-400';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/30 p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-black text-white uppercase">Career Timeline</h3>
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            No career history yet. Play your first season!
          </div>
        ) : (
          history.map((season, i) => {
            const team = league?.find((t: any) => t.name === season.club);
            const avgDisp = season.stats.matches > 0 ? (season.stats.disposals / season.stats.matches).toFixed(1) : '0';
            const avgGoals = season.stats.matches > 0 ? (season.stats.goals / season.stats.matches).toFixed(1) : '0';

            return (
              <div key={i} className={`bg-gradient-to-r ${getTierColor(season.tier)} rounded-lg p-3 border`}>
                {/* Season Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
                      {team?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{season.club}</div>
                      <div className="text-slate-500 text-[10px]">
                        Season {season.year} • <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getTierBadge(season.tier)}`}>{season.tier}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">#{season.ladderPosition}</div>
                    <div className="text-[9px] text-slate-500">Ladder</div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="bg-slate-900/50 rounded p-1.5 text-center">
                    <div className="text-xs font-bold text-white">{season.stats.matches}</div>
                    <div className="text-[8px] text-slate-500">Games</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-1.5 text-center">
                    <div className="text-xs font-bold text-emerald-400">{season.stats.goals}</div>
                    <div className="text-[8px] text-slate-500">Goals</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-1.5 text-center">
                    <div className="text-xs font-bold text-blue-400">{avgDisp}</div>
                    <div className="text-[8px] text-slate-500">Avg Disp</div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-1.5 text-center">
                    <div className="text-xs font-bold text-yellow-400">{avgGoals}</div>
                    <div className="text-[8px] text-slate-500">Avg Goals</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  {season.promoted && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">⬆️ Promoted</span>
                  )}
                  {season.relegated && (
                    <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded">⬇️ Relegated</span>
                  )}
                  {season.premiership && (
                    <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded">🏆 Premiers</span>
                  )}
                  {season.awards && season.awards.length > 0 && season.awards.map((award, j) => (
                    <span key={j} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">🏅 {award.type}</span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CareerTimeline;
