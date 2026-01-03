import React, { useEffect } from 'react';
import { MediaEvent } from '../types';

interface PostMatchPressProps {
  event: MediaEvent;
  onRespond: (responseType: 'HUMBLE' | 'CONFIDENT' | 'IGNORE') => void;
  playerName: string;
}

const PostMatchPress: React.FC<PostMatchPressProps> = ({ event, onRespond, playerName }) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PRESS_CONFERENCE': return '🎤';
      case 'INTERVIEW': return '📺';
      case 'SOCIAL_MEDIA': return '📱';
      case 'CRITICISM': return '📰';
      case 'CONTROVERSY': return '⚠️';
      case 'MILESTONE': return '🏆';
      default: return '📢';
    }
  };

  const isPositive = event.reputationImpact >= 0;
  const isNegative = event.reputationImpact < 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-slate-700 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-6 border-b-2 ${
          isPositive ? 'bg-gradient-to-r from-green-900/40 to-blue-900/40 border-green-500/30' :
          isNegative ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border-red-500/30' :
          'bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30'
        }`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">{getEventIcon(event.type)}</div>
            <div className="flex-1">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Post-Match Media</p>
              <h2 className="text-2xl font-black text-white">{event.title}</h2>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Event Description */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-white text-lg leading-relaxed">{event.description}</p>
          </div>

          {/* Impact Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Reputation Impact</p>
              <p className={`text-2xl font-black ${
                event.reputationImpact > 0 ? 'text-green-400' :
                event.reputationImpact < 0 ? 'text-red-400' : 'text-slate-400'
              }`}>
                {event.reputationImpact > 0 ? '+' : ''}{event.reputationImpact}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fan Impact</p>
              <p className={`text-2xl font-black ${
                event.fanImpact > 0 ? 'text-green-400' :
                event.fanImpact < 0 ? 'text-red-400' : 'text-slate-400'
              }`}>
                {event.fanImpact > 0 ? '+' : ''}{event.fanImpact >= 1000 ? `${(event.fanImpact / 1000).toFixed(1)}K` : event.fanImpact}
              </p>
            </div>
          </div>

          {/* Response Options */}
          <div>
            <p className="text-sm text-slate-400 uppercase font-bold mb-3">How do you respond?</p>
            <div className="space-y-2">
              {/* Humble Response */}
              <button
                onClick={() => onRespond('HUMBLE')}
                className="w-full p-4 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-2 border-blue-600/50 rounded-xl hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🤝</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-blue-300 mb-1">Humble & Respectful</p>
                    <p className="text-sm text-slate-300">
                      "It's a team effort. Everyone played their part today."
                    </p>
                    <p className="text-xs text-blue-400 mt-2">
                      +15% Reputation, +10% Fans, Builds long-term respect
                    </p>
                  </div>
                </div>
              </button>

              {/* Confident Response */}
              <button
                onClick={() => onRespond('CONFIDENT')}
                className="w-full p-4 bg-gradient-to-r from-yellow-900/40 to-orange-800/40 border-2 border-yellow-600/50 rounded-xl hover:border-yellow-500 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💪</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-yellow-300 mb-1">Confident & Bold</p>
                    <p className="text-sm text-slate-300">
                      "I knew I could deliver. This is just the beginning."
                    </p>
                    <p className="text-xs text-yellow-400 mt-2">
                      +30% Fans, +5% Reputation, Risk: Can backfire if form drops
                    </p>
                  </div>
                </div>
              </button>

              {/* Ignore */}
              <button
                onClick={() => onRespond('IGNORE')}
                className="w-full p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-2 border-slate-600/50 rounded-xl hover:border-slate-500 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🚫</div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-300 mb-1">No Comment</p>
                    <p className="text-sm text-slate-300">
                      Decline to comment and focus on training.
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      No bonus, but avoids controversy risk
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMatchPress;
