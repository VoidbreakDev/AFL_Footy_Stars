import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { MASTER_SKILLS } from '../constants';
import { MasterSkill, PlayerAttributes } from '../types';
import {
  getMasterSkillStatus,
  unlockMasterSkill,
  hasMasterSkill
} from '../utils/masterSkillUtils';

const MasterSkillTree: React.FC = () => {
  const { player, setPlayer, setView, currentRound } = useGameContext();
  const [selectedAttribute, setSelectedAttribute] = useState<keyof PlayerAttributes | 'ALL'>('ALL');
  const [confirmUnlock, setConfirmUnlock] = useState<string | null>(null);

  if (!player) return null;

  // Group skills by attribute
  const attributeCategories: (keyof PlayerAttributes)[] = [
    'kicking',
    'marking',
    'handball',
    'tackling',
    'speed',
    'stamina',
    'goalSense'
  ];

  const getAttributeIcon = (attr: keyof PlayerAttributes): string => {
    const icons = {
      kicking: '🦵',
      marking: '🙌',
      handball: '✋',
      tackling: '🛡️',
      speed: '⚡',
      stamina: '💪',
      goalSense: '🎯'
    };
    return icons[attr];
  };

  const getAttributeName = (attr: keyof PlayerAttributes): string => {
    const names = {
      kicking: 'Kicking',
      marking: 'Marking',
      handball: 'Handball',
      tackling: 'Tackling',
      speed: 'Speed',
      stamina: 'Stamina',
      goalSense: 'Goal Sense'
    };
    return names[attr];
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'COMMON': return 'from-gray-600 to-gray-700';
      case 'RARE': return 'from-blue-600 to-blue-700';
      case 'EPIC': return 'from-purple-600 to-purple-700';
      case 'LEGENDARY': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRarityBorderColor = (rarity: string): string => {
    switch (rarity) {
      case 'COMMON': return 'border-gray-500';
      case 'RARE': return 'border-blue-500';
      case 'EPIC': return 'border-purple-500';
      case 'LEGENDARY': return 'border-yellow-400';
      default: return 'border-gray-500';
    }
  };

  const handleUnlockSkill = (skillId: string) => {
    try {
      const updatedPlayer = unlockMasterSkill(player, skillId, currentRound);
      setPlayer(updatedPlayer);
      setConfirmUnlock(null);
    } catch (error) {
      console.error('Failed to unlock skill:', error);
    }
  };

  // Filter skills based on selected attribute
  const filteredSkills = selectedAttribute === 'ALL'
    ? MASTER_SKILLS
    : MASTER_SKILLS.filter(skill => skill.category === selectedAttribute);

  // Count unlocked skills per attribute
  const getUnlockedCount = (attr: keyof PlayerAttributes): number => {
    return MASTER_SKILLS.filter(
      skill => skill.category === attr && hasMasterSkill(player, skill.id)
    ).length;
  };

  const getTotalSkillsInCategory = (attr: keyof PlayerAttributes): number => {
    return MASTER_SKILLS.filter(skill => skill.category === attr).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => setView('DASHBOARD')}
          className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">⚡</div>
            <div>
              <h1 className="text-4xl font-black">Master Skill Tree</h1>
              <p className="text-yellow-300 mt-1">
                Unlock legendary abilities with high attributes, XP, and Skill Points
              </p>
            </div>
          </div>

          {/* Currency Display */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/30">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Experience Points</p>
              <p className="text-2xl font-black text-blue-400">{player.xp.toLocaleString()} XP</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/30">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Skill Points</p>
              <p className="text-2xl font-black text-green-400">{player.skillPoints} SP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attribute Filter Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedAttribute('ALL')}
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              selectedAttribute === 'ALL'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            All Skills
          </button>
          {attributeCategories.map(attr => (
            <button
              key={attr}
              onClick={() => setSelectedAttribute(attr)}
              className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedAttribute === attr
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {getAttributeIcon(attr)} {getAttributeName(attr)}{' '}
              <span className="text-xs opacity-75">
                ({getUnlockedCount(attr)}/{getTotalSkillsInCategory(attr)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map(skill => {
          const status = getMasterSkillStatus(player, skill);
          const isUnlocked = status.unlocked;

          return (
            <div
              key={skill.id}
              className={`bg-gradient-to-br ${getRarityColor(skill.rarity)} border-2 ${getRarityBorderColor(
                skill.rarity
              )} rounded-xl p-4 transition-all ${
                isUnlocked
                  ? 'opacity-100 shadow-lg'
                  : status.canUnlock
                  ? 'opacity-100 hover:scale-105 cursor-pointer'
                  : 'opacity-60'
              }`}
            >
              {/* Skill Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{skill.icon}</div>
                  <div>
                    <h3 className="font-black text-lg">{skill.name}</h3>
                    <p className="text-xs uppercase font-bold opacity-75">{skill.rarity}</p>
                  </div>
                </div>
                {isUnlocked && (
                  <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    ✓ UNLOCKED
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm mb-3 leading-relaxed">{skill.description}</p>

              {/* Requirements */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    {getAttributeIcon(skill.category)} {getAttributeName(skill.category)}:
                  </span>
                  <span
                    className={`font-bold ${
                      status.attributeReady ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {player.attributes[skill.category]} / {skill.prerequisiteLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">XP Cost:</span>
                  <span
                    className={`font-bold ${status.xpReady ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {skill.xpCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">SP Cost:</span>
                  <span
                    className={`font-bold ${status.spReady ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {skill.spCost}
                  </span>
                </div>
              </div>

              {/* Unlock Button */}
              {!isUnlocked && (
                <>
                  {status.canUnlock ? (
                    confirmUnlock === skill.id ? (
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-300 font-bold">Confirm unlock?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnlockSkill(skill.id)}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmUnlock(null)}
                            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmUnlock(skill.id)}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-black transition-colors"
                      >
                        UNLOCK NOW
                      </button>
                    )
                  ) : (
                    <div className="bg-slate-800/50 px-3 py-2 rounded-lg text-xs text-slate-400 text-center">
                      {status.reason}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MasterSkillTree;
