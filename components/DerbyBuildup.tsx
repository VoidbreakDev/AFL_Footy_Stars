import React from 'react';
import { Rivalry } from '../types';

interface DerbyBuildupProps {
  rivalry: Rivalry;
  opponentName: string;
  opponentRecord: string;
  onProceed: () => void;
}

const DerbyBuildup: React.FC<DerbyBuildupProps> = ({
  rivalry,
  opponentName,
  opponentRecord,
  onProceed,
}) => {
  const h2h = rivalry.headToHead || { wins: 0, losses: 0, draws: 0 };
  const totalGames = h2h.wins + h2h.losses + (h2h.draws || 0);
  const winRate = totalGames > 0 ? Math.round((h2h.wins / totalGames) * 100) : 0;

  const getIntensityColor = () => {
    switch (rivalry.intensity) {
      case 'Low': return 'from-yellow-900/40 to-orange-900/40 border-yellow-500/40';
      case 'Medium': return 'from-orange-900/40 to-red-900/40 border-orange-500/40';
      case 'High': return 'from-red-900/40 to-red-950/60 border-red-500/50';
      case 'Heated': return 'from-red-950/60 to-black border-red-600/60';
      default: return 'from-orange-900/40 to-red-900/40 border-orange-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className={`bg-gradient-to-br ${getIntensityColor()} rounded-2xl p-1 shadow-2xl max-w-sm w-full`}>
        <div className="bg-slate-900/95 rounded-xl p-6 text-center">
          {/* Derby Badge */}
          <div className="inline-block px-4 py-1.5 bg-red-500/20 border border-red-500/40 rounded-full mb-4">
            <span className="text-red-400 font-black text-xs uppercase tracking-wider">🔥 Derby Match</span>
          </div>

          <h2 className="text-2xl font-black text-white italic uppercase mb-1">Rivalry Week</h2>
          <p className="text-slate-400 text-sm italic mb-6">"{rivalry.reason}"</p>

          {/* H2H Record */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">Head-to-Head Record</div>
            <div className="flex justify-center items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">{h2h.wins}</div>
                <div className="text-[9px] text-slate-500 uppercase">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-slate-400">{h2h.draws || 0}</div>
                <div className="text-[9px] text-slate-500 uppercase">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-400">{h2h.losses}</div>
                <div className="text-[9px] text-slate-500 uppercase">Losses</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-400">{winRate}%</span>
            </div>
          </div>

          {/* Opponent */}
          <div className="bg-slate-800/30 rounded-lg p-3 mb-6">
            <div className="text-white font-bold text-lg">{opponentName}</div>
            <div className="text-slate-500 text-xs">{opponentRecord}</div>
          </div>

          {/* Bonus XP Info */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
            <div className="text-amber-400 font-bold text-xs uppercase mb-1">Derby Bonus</div>
            <div className="text-slate-300 text-xs">Win this match for +50 bonus XP and +1 derby trophy</div>
          </div>

          <button
            onClick={onProceed}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase rounded-xl shadow-lg shadow-red-900/30 active:scale-95 transition-all"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DerbyBuildup;
