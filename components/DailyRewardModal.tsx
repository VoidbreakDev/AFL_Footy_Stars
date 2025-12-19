import React from 'react';
import { DAILY_REWARDS } from '../utils/dailyRewardUtils';

interface DailyRewardModalProps {
  streak: number;
  skillPoints: number;
  energy: number;
  description: string;
  onClaim: () => void;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  streak,
  skillPoints,
  energy,
  description,
  onClaim
}) => {
  // Get the next few rewards to preview
  const upcomingRewards = DAILY_REWARDS.slice(0, 7);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="text-6xl mb-2 animate-bounce">🎁</div>
          <h2 className="text-2xl font-black text-white uppercase">Daily Reward!</h2>
          <p className="text-emerald-100 text-sm mt-1">{description}</p>
        </div>

        {/* Reward Display */}
        <div className="p-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-4">
            <div className="text-center mb-4">
              <div className="text-4xl font-black text-emerald-400 mb-1">DAY {streak}</div>
              <div className="text-xs text-slate-400 uppercase">Login Streak</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-2xl font-black text-yellow-400">+{skillPoints}</div>
                <div className="text-xs text-slate-400 uppercase">Skill Points</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">⚡</div>
                <div className="text-2xl font-black text-blue-400">+{energy}</div>
                <div className="text-xs text-slate-400 uppercase">Energy</div>
              </div>
            </div>
          </div>

          {/* Upcoming Rewards Preview */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Upcoming Rewards</h3>
            <div className="grid grid-cols-7 gap-1">
              {upcomingRewards.map((reward, index) => {
                const dayNum = reward.day;
                const isToday = dayNum === ((streak - 1) % 14) + 1;
                const isFuture = dayNum > ((streak - 1) % 14) + 1;

                return (
                  <div
                    key={reward.day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                      isToday
                        ? 'bg-emerald-500 border-2 border-emerald-300 scale-110 shadow-lg'
                        : isFuture
                        ? 'bg-slate-700 border border-slate-600'
                        : 'bg-slate-800 border border-slate-700 opacity-50'
                    }`}
                  >
                    <div className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-slate-400'}`}>
                      {dayNum}
                    </div>
                    {reward.day === 7 || reward.day === 14 ? (
                      <div className="text-lg">🏆</div>
                    ) : (
                      <div className={`text-[9px] ${isToday ? 'text-white' : 'text-slate-500'}`}>
                        {reward.skillPoints}SP
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2 italic">
              Login daily to maintain your streak and earn bonus rewards!
            </p>
          </div>

          {/* Claim Button */}
          <button
            onClick={onClaim}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white font-black text-lg rounded-xl uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            Claim Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardModal;
