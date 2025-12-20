import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { TeammateRelationship } from '../types';
import {
  getStatusColor,
  getChemistryColor,
  getPersonalityIcon,
  getBestMate,
  getRivals
} from '../utils/chemistryUtils';

const TeamChemistry: React.FC = () => {
  const { player, setView } = useGameContext();
  const [selectedTab, setSelectedTab] = useState<'OVERVIEW' | 'TEAMMATES' | 'HISTORY'>('OVERVIEW');
  const [selectedTeammate, setSelectedTeammate] = useState<TeammateRelationship | null>(null);

  if (!player) return null;

  const teammates = player.teammates || [];
  const teamChemistry = player.teamChemistry;

  if (!teamChemistry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView('DASHBOARD')}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
          >
            ← Back
          </button>
          <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-2">No Team Chemistry Data</h3>
            <p className="text-gray-400">Play some matches to build relationships with your teammates!</p>
          </div>
        </div>
      </div>
    );
  }

  const bestMate = getBestMate(teammates);
  const rivals = getRivals(teammates);

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Overall Team Chemistry */}
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> Team Chemistry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-black ${getChemistryColor(teamChemistry.overallChemistry)}`}>
                {teamChemistry.overallChemistry}
              </div>
              <div className="text-sm text-gray-400 mt-1">Overall Chemistry</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-black ${getChemistryColor(teamChemistry.morale)}`}>
                {teamChemistry.morale}
              </div>
              <div className="text-sm text-gray-400 mt-1">Team Morale</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-black ${getChemistryColor(teamChemistry.cohesion)}`}>
                {teamChemistry.cohesion}
              </div>
              <div className="text-sm text-gray-400 mt-1">Cohesion</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-black ${teamChemistry.chemistryBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {teamChemistry.chemistryBonus > 0 ? '+' : ''}{teamChemistry.chemistryBonus}%
              </div>
              <div className="text-sm text-gray-400 mt-1">Performance Bonus</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-gray-400">Team Form:</span>
            <span className={`font-bold ${
              teamChemistry.recentForm === 'HOT' ? 'text-red-400' :
              teamChemistry.recentForm === 'WARM' ? 'text-orange-400' :
              teamChemistry.recentForm === 'NEUTRAL' ? 'text-yellow-400' :
              teamChemistry.recentForm === 'COLD' ? 'text-blue-400' :
              'text-cyan-400'
            }`}>
              {teamChemistry.recentForm}
            </span>
          </div>
        </div>

        {/* Key Relationships */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Best Mate */}
          {bestMate && (
            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>👥</span> Best Mate
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getPersonalityIcon(bestMate.personality)}</div>
                <div className="flex-1">
                  <div className="font-bold text-white">{bestMate.name}</div>
                  <div className="text-sm text-gray-300">{bestMate.subPosition}</div>
                  <div className="text-sm text-green-400">Friendship: {bestMate.friendship}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* Rivals */}
          {rivals.length > 0 && (
            <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>⚔️</span> Tensions
              </h3>
              <div className="space-y-2">
                {rivals.slice(0, 2).map(rival => (
                  <div key={rival.id} className="flex items-center gap-2">
                    <div className="text-2xl">{getPersonalityIcon(rival.personality)}</div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{rival.name}</div>
                      <div className="text-xs text-red-400">Friction: {100 - rival.friendship}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Relationship Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {teammates.filter(tm => tm.status === 'BEST_MATE' || tm.status === 'CLOSE_FRIEND').length}
              </div>
              <div className="text-sm text-gray-400">Close Friends</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {teammates.filter(tm => tm.status === 'FRIEND').length}
              </div>
              <div className="text-sm text-gray-400">Friends</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {teammates.filter(tm => tm.status === 'ACQUAINTANCE').length}
              </div>
              <div className="text-sm text-gray-400">Acquaintances</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {rivals.length}
              </div>
              <div className="text-sm text-gray-400">Rivals</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeammatesList = () => {
    const sortedTeammates = [...teammates].sort((a, b) => b.chemistry - a.chemistry);

    return (
      <div className="space-y-3">
        {sortedTeammates.map(teammate => (
          <div
            key={teammate.id}
            onClick={() => setSelectedTeammate(teammate)}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{getPersonalityIcon(teammate.personality)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{teammate.name}</span>
                  <span className={`text-xs font-bold uppercase ${getStatusColor(teammate.status)}`}>
                    {teammate.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-400">{teammate.subPosition} • Rating: {teammate.rating}</div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Chemistry:</span>
                    <span className={`ml-1 font-bold ${getChemistryColor(teammate.chemistry)}`}>
                      {teammate.chemistry}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Friendship:</span>
                    <span className={`ml-1 font-bold ${getChemistryColor(teammate.friendship)}`}>
                      {teammate.friendship}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Trust:</span>
                    <span className={`ml-1 font-bold ${getChemistryColor(teammate.trust)}`}>
                      {teammate.trust}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Respect:</span>
                    <span className={`ml-1 font-bold ${getChemistryColor(teammate.respect)}`}>
                      {teammate.respect}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeammateDetail = () => {
    if (!selectedTeammate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border-2 border-blue-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-5xl">{getPersonalityIcon(selectedTeammate.personality)}</div>
                <div>
                  <h2 className="font-bold text-2xl text-white">{selectedTeammate.name}</h2>
                  <p className="text-gray-400">{selectedTeammate.subPosition} • Age {selectedTeammate.age}</p>
                </div>
              </div>
              <span className={`text-sm font-bold uppercase ${getStatusColor(selectedTeammate.status)}`}>
                {selectedTeammate.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Relationship Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getChemistryColor(selectedTeammate.chemistry)}`}>
                  {selectedTeammate.chemistry}/100
                </div>
                <div className="text-sm text-gray-400">Chemistry</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getChemistryColor(selectedTeammate.friendship)}`}>
                  {selectedTeammate.friendship}/100
                </div>
                <div className="text-sm text-gray-400">Friendship</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getChemistryColor(selectedTeammate.trust)}`}>
                  {selectedTeammate.trust}/100
                </div>
                <div className="text-sm text-gray-400">Trust</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className={`text-2xl font-bold ${getChemistryColor(selectedTeammate.respect)}`}>
                  {selectedTeammate.respect}/100
                </div>
                <div className="text-sm text-gray-400">Respect</div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-3">Shared History</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Matches Together:</span>
                  <span className="ml-2 font-bold text-white">{selectedTeammate.matchesTogether}</span>
                </div>
                <div>
                  <span className="text-gray-400">Their Assists:</span>
                  <span className="ml-2 font-bold text-green-400">{selectedTeammate.assists || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Your Assists:</span>
                  <span className="ml-2 font-bold text-blue-400">{selectedTeammate.youAssisted || 0}</span>
                </div>
                <div>
                  <span className="text-gray-400">Conflicts:</span>
                  <span className="ml-2 font-bold text-red-400">{selectedTeammate.conflicts || 0}</span>
                </div>
              </div>
            </div>

            {/* Last Interaction */}
            {selectedTeammate.lastInteraction && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-bold mb-2">Last Interaction</h4>
                <p className="text-sm text-gray-300">{selectedTeammate.lastInteraction.event}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Round {selectedTeammate.lastInteraction.round}, Year {selectedTeammate.lastInteraction.year}
                </div>
              </div>
            )}

            {/* Personality */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-2">Personality</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPersonalityIcon(selectedTeammate.personality)}</span>
                <span className="text-gray-300">{selectedTeammate.personality}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700">
            <button
              onClick={() => setSelectedTeammate(null)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setView('DASHBOARD')}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-4xl font-black mb-2">Team Chemistry</h1>
          <p className="text-gray-400">Manage your relationships with teammates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('OVERVIEW')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'OVERVIEW'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('TEAMMATES')}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedTab === 'TEAMMATES'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Teammates ({teammates.length})
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'OVERVIEW' && renderOverview()}
        {selectedTab === 'TEAMMATES' && renderTeammatesList()}
      </div>

      {/* Teammate Detail Modal */}
      {renderTeammateDetail()}
    </div>
  );
};

export default TeamChemistry;
