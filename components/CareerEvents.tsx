import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import {
  getRarityColor,
  getRiskColor,
  formatEffectPreview
} from '../utils/careerEventUtils';
import { CareerEvent, CareerEventChoice } from '../types';

const CareerEvents: React.FC = () => {
  const { player, resolveEvent, resolveEventChoice, setView } = useGameContext();
  const [selectedEvent, setSelectedEvent] = useState<CareerEvent | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!player) return null;

  const activeEvents = player.activeCareerEvents || [];
  const eventHistory = player.careerEventHistory || [];

  const handleResolveEvent = (event: CareerEvent) => {
    if (event.category === 'CHOICE') {
      setSelectedEvent(event);
    } else {
      resolveEvent(event.id);
    }
  };

  const handleMakeChoice = (eventId: string, choiceId: string) => {
    resolveEventChoice(eventId, choiceId);
    setSelectedEvent(null);
  };

  const renderEventCard = (event: CareerEvent) => {
    const rarityColor = getRarityColor(event.rarity);
    const isChoice = event.category === 'CHOICE';

    // Determine border color based on category
    let borderColor = 'border-gray-600';
    if (event.category === 'POSITIVE') borderColor = 'border-green-500';
    if (event.category === 'NEGATIVE') borderColor = 'border-red-500';
    if (event.category === 'CHOICE') borderColor = 'border-yellow-500';

    return (
      <div
        key={event.id}
        className={`bg-gray-800 border-2 ${borderColor} rounded-xl p-6 hover:bg-gray-750 transition-all`}
      >
        <div className="flex items-start gap-4">
          <div className="text-5xl">{event.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xl text-white">{event.title}</h3>
              <span className={`text-xs font-bold uppercase ${rarityColor}`}>
                {event.rarity}
              </span>
            </div>
            <p className="text-gray-300 mb-3">{event.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>Round {event.round}</span>
              <span>•</span>
              <span>Year {event.year}</span>
              <span>•</span>
              <span className="capitalize">{event.type.toLowerCase().replace('_', ' ')}</span>
            </div>

            {!isChoice && event.immediateEffects && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formatEffectPreview(event.immediateEffects).map((effect, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => handleResolveEvent(event)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                isChoice
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isChoice ? 'Make a Choice' : 'Acknowledge'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderChoiceModal = () => {
    if (!selectedEvent || !selectedEvent.choices) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border-2 border-yellow-500 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">{selectedEvent.icon}</div>
              <div className="flex-1">
                <h2 className="font-bold text-2xl text-white mb-2">{selectedEvent.title}</h2>
                <p className="text-gray-300">{selectedEvent.description}</p>
              </div>
            </div>
            <p className="text-yellow-400 font-bold">Choose wisely - this decision will impact your career!</p>
          </div>

          <div className="p-6 space-y-4">
            {selectedEvent.choices.map((choice: CareerEventChoice) => {
              const riskColor = getRiskColor(choice.risk);
              const effectPreviews = formatEffectPreview(choice.effects);

              return (
                <div
                  key={choice.id}
                  className="bg-gray-800 border-2 border-gray-700 rounded-xl p-5 hover:border-yellow-500 transition-all cursor-pointer"
                  onClick={() => handleMakeChoice(selectedEvent.id, choice.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{choice.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg text-white">{choice.label}</h3>
                        {choice.risk && (
                          <span className={`text-xs font-bold uppercase ${riskColor}`}>
                            {choice.risk} RISK
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{choice.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {effectPreviews.map((effect, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-gray-700">
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryEntry = (entry: any, idx: number) => {
    return (
      <div
        key={idx}
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-start gap-3"
      >
        <div className="text-3xl">{entry.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{entry.title}</h4>
          <p className="text-sm text-gray-300 mb-2">{entry.outcome}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Round {entry.round}, Year {entry.year}</span>
            {entry.choiceMade && (
              <>
                <span>•</span>
                <span className="text-yellow-400">Choice: {entry.choiceMade}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => setView('DASHBOARD')}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black mb-2">Career Events</h1>
            <p className="text-gray-400">Random encounters and opportunities that shape your journey</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              showHistory
                ? 'bg-gray-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {showHistory ? 'Show Active Events' : 'Show History'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {!showHistory ? (
          <>
            {/* Active Events */}
            {activeEvents.length === 0 ? (
              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold mb-2">No Active Events</h3>
                <p className="text-gray-400">
                  Keep playing matches and new events will appear throughout your career!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Pending Events ({activeEvents.length})</h2>
                  <p className="text-sm text-gray-400">Resolve events to continue your journey</p>
                </div>
                {activeEvents.map(event => renderEventCard(event))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Event History */}
            {eventHistory.length === 0 ? (
              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-2">No History Yet</h3>
                <p className="text-gray-400">
                  Events you encounter and resolve will appear here as a record of your career!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Event History ({eventHistory.length})</h2>
                  <p className="text-sm text-gray-400">A record of your career journey</p>
                </div>
                {eventHistory
                  .slice()
                  .reverse()
                  .map((entry, idx) => renderHistoryEntry(entry, idx))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Choice Modal */}
      {renderChoiceModal()}
    </div>
  );
};

export default CareerEvents;
