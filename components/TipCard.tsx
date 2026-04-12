
import React from 'react';
import { useGame } from '../context/GameContext';

interface TipCardProps {
  tipKey: string;
  title: string;
  body: string;
}

const TipCard: React.FC<TipCardProps> = ({ tipKey, title, body }) => {
  const { player, setPlayer, saveGame } = useGame();

  if (!player) return null;
  // Existing saves where seenTips is undefined: don't display tips (non-intrusive default)
  if (player.seenTips === undefined) return null;
  // New players have seenTips: {} — show until dismissed
  if (player.seenTips[tipKey]) return null;

  const dismiss = () => {
    setPlayer(prev => {
      if (!prev) return null;
      return { ...prev, seenTips: { ...(prev.seenTips ?? {}), [tipKey]: true } };
    });
    saveGame();
  };

  return (
    <div className="bg-blue-900/80 border border-blue-400/30 rounded-xl p-4 mb-4 flex items-start gap-3">
      <span className="text-blue-300 text-xl shrink-0">💡</span>
      <div className="flex-1 min-w-0">
        <div className="text-blue-200 font-bold text-sm">{title}</div>
        <div className="text-blue-100/80 text-xs mt-1 leading-relaxed">{body}</div>
      </div>
      <button
        onClick={dismiss}
        className="text-blue-300 hover:text-white text-xl font-bold shrink-0 leading-none"
        aria-label="Dismiss tip"
      >
        ×
      </button>
    </div>
  );
};

export default TipCard;
