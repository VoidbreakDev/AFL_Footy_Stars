import React, { useState } from 'react';
import { MatchPrediction } from '../types';

interface MatchPredictionCardProps {
  homeTeam: string;
  awayTeam: string;
  playerAvgDisposals: number;
  playerAvgGoals: number;
  initialPrediction?: { predictedMargin: 'CLOSE' | 'COMFORTABLE' | 'BLOWOUT'; predictedDisposals: number; predictedGoals: number };
  onSubmit: (prediction: { margin: 'CLOSE' | 'COMFORTABLE' | 'BLOWOUT'; disposals: number; goals: number }) => void;
  onCancel: () => void;
}

const MatchPredictionCard: React.FC<MatchPredictionCardProps> = ({
  homeTeam,
  awayTeam,
  playerAvgDisposals,
  playerAvgGoals,
  initialPrediction,
  onSubmit,
  onCancel,
}) => {
  const [selectedMargin, setSelectedMargin] = useState<'CLOSE' | 'COMFORTABLE' | 'BLOWOUT' | null>(initialPrediction?.predictedMargin || null);
  const [predictedDisposals, setPredictedDisposals] = useState(initialPrediction?.predictedDisposals || Math.round(playerAvgDisposals));
  const [predictedGoals, setPredictedGoals] = useState(initialPrediction?.predictedGoals || Math.round(playerAvgGoals));

  const margins = [
    { value: 'CLOSE' as const, label: 'Close Game', desc: 'Within 10 points', reward: 500 },
    { value: 'COMFORTABLE' as const, label: 'Comfortable Win', desc: '10-30 point margin', reward: 1000 },
    { value: 'BLOWOUT' as const, label: 'Blowout', desc: '30+ point margin', reward: 2000 },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <h3 className="text-sm font-black text-white uppercase">Match Predictions</h3>
        </div>
        <p className="text-slate-400 text-[10px] mt-0.5">Predict the outcome for bonus rewards</p>
      </div>

      <div className="p-3 space-y-3">
        {/* Match Winner Prediction */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Predicted Margin</div>
          <div className="grid grid-cols-3 gap-2">
            {margins.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMargin(m.value)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  selectedMargin === m.value
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[8px] opacity-70">{m.desc}</div>
                <div className="text-[9px] text-amber-400 mt-1">+${m.reward}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Stats Prediction */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Your Disposals</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPredictedDisposals(Math.max(0, predictedDisposals - 5))}
                className="w-7 h-7 rounded bg-slate-700 text-white font-bold text-sm hover:bg-slate-600"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono text-lg font-bold text-white">{predictedDisposals}</span>
              <button
                onClick={() => setPredictedDisposals(predictedDisposals + 5)}
                className="w-7 h-7 rounded bg-slate-700 text-white font-bold text-sm hover:bg-slate-600"
              >
                +
              </button>
            </div>
            <div className="text-[9px] text-slate-500 text-center mt-0.5">Avg: {playerAvgDisposals.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Your Goals</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPredictedGoals(Math.max(0, predictedGoals - 1))}
                className="w-7 h-7 rounded bg-slate-700 text-white font-bold text-sm hover:bg-slate-600"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono text-lg font-bold text-white">{predictedGoals}</span>
              <button
                onClick={() => setPredictedGoals(predictedGoals + 1)}
                className="w-7 h-7 rounded bg-slate-700 text-white font-bold text-sm hover:bg-slate-600"
              >
                +
              </button>
            </div>
            <div className="text-[9px] text-slate-500 text-center mt-0.5">Avg: {playerAvgGoals.toFixed(1)}</div>
          </div>
        </div>

        {/* Submit/Cancel */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-slate-700 text-slate-400 font-bold text-xs uppercase rounded-lg hover:bg-slate-600"
          >
            Skip
          </button>
          <button
            onClick={() => selectedMargin && onSubmit({ margin: selectedMargin, disposals: predictedDisposals, goals: predictedGoals })}
            disabled={!selectedMargin}
            className="flex-1 py-2 bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase rounded-lg hover:bg-blue-500"
          >
            Lock In
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchPredictionCard;
