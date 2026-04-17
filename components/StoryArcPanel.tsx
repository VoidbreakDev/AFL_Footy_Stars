import React, { useState } from 'react';
import { StoryArc, StoryArcChoice } from '../types';

interface StoryArcPanelProps {
  activeArcs: StoryArc[];
  completedArcs: StoryArc[];
  onResolveChoice: (arcId: string, eventId: string, choiceId: string) => void;
}

const StoryArcPanel: React.FC<StoryArcPanelProps> = ({ activeArcs, completedArcs, onResolveChoice }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedArc, setExpandedArc] = useState<string | null>(null);

  if (activeArcs.length === 0 && completedArcs.length === 0) return null;

  const getActLabel = (act: string) => {
    switch (act) {
      case 'SETUP': return 'Act 1: Setup';
      case 'ESCALATION': return 'Act 2: Escalation';
      case 'RESOLUTION': return 'Act 3: Resolution';
      case 'EPILOGUE': return 'Epilogue';
      default: return act;
    }
  };

  const getActIcon = (act: string) => {
    switch (act) {
      case 'SETUP': return '📖';
      case 'ESCALATION': return '🔥';
      case 'RESOLUTION': return '⚡';
      case 'EPILOGUE': return '📜';
      default: return '📋';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <h3 className="text-sm font-black text-white uppercase">Season Story</h3>
          {activeArcs.length > 0 && (
            <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
              {activeArcs.length} active
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {activeArcs.map(arc => {
          const currentEvent = arc.events.find(e => !e.resolved) || arc.events[arc.events.length - 1];
          const isExpanded = expandedArc === arc.id;

          return (
            <div key={arc.id} className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-700/50 overflow-hidden">
              {/* Arc Header */}
              <button
                onClick={() => setExpandedArc(isExpanded ? null : arc.id)}
                className="w-full p-3 text-left flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-xl">{currentEvent?.icon || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{arc.title}</div>
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    {getActIcon(arc.currentAct)} {getActLabel(arc.currentAct)}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{
                      width: `${arc.currentAct === 'SETUP' ? 25 : arc.currentAct === 'ESCALATION' ? 50 : arc.currentAct === 'RESOLUTION' ? 75 : 100}%`
                    }}
                  ></div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && currentEvent && (
                <div className="px-3 pb-3 border-t border-slate-700/50 pt-3">
                  <p className="text-slate-300 text-xs mb-3 leading-relaxed">{currentEvent.description}</p>

                  {currentEvent.choices && currentEvent.choices.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Your Response</div>
                      {currentEvent.choices.map((choice: StoryArcChoice) => (
                        <button
                          key={choice.id}
                          onClick={() => onResolveChoice(arc.id, currentEvent.id, choice.id)}
                          className="w-full p-2.5 bg-slate-900/80 border border-slate-700/50 rounded-lg text-left hover:border-purple-500/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{choice.icon}</span>
                            <div className="flex-1">
                              <div className="text-white text-xs font-bold">{choice.label}</div>
                              <div className="text-slate-500 text-[10px]">{choice.description}</div>
                            </div>
                            {choice.risk && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                choice.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                choice.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {choice.risk}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] italic">No choices available for this chapter.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Season Stories History */}
        {completedArcs.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-left text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 py-1"
            >
              <svg className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Season Stories ({completedArcs.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5 pl-4">
                {completedArcs.map(arc => (
                  <div key={arc.id} className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>{arc.outcome === 'POSITIVE' ? '✅' : arc.outcome === 'NEGATIVE' ? '❌' : '⚪'}</span>
                    <span>{arc.title}</span>
                    <span className="text-slate-600">({arc.outcome?.toLowerCase()})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryArcPanel;
