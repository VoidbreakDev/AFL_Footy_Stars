
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerAttributes } from '../types';
import { getAvailableMasterSkills } from '../utils/masterSkillUtils';
import TipCard from './TipCard';

const Training: React.FC = () => {
  const { player, trainAttribute, setView, setRehabChoice } = useGame();
  const [chosenRehab, setChosenRehab] = useState<'REST' | 'LIGHT' | 'PUSH' | null>(null);

  if (!player) return null;

  const attributes: (keyof PlayerAttributes)[] = ['kicking', 'handball', 'tackling', 'marking', 'speed', 'stamina', 'goalSense'];
  const availableSkills = getAvailableMasterSkills(player);

  // Calculate Fatigue Level for color coding
  const fatigueLevel = player.energy;
  const getEnergyColor = () => {
      if (fatigueLevel > 60) return 'bg-emerald-500';
      if (fatigueLevel > 30) return 'bg-yellow-500';
      return 'bg-red-500 animate-pulse';
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-900">

      <TipCard tipKey="TRAINING" title="Training Tips" body="Spend Skill Points to improve your attributes. Each attribute has a cap set by your potential rating." />

      {/* Injury Rehab Panel — shown instead of training when injured */}
      {player.injury && (() => {
          const hasPhysio = player.coachingStaff?.staffMembers?.some(s => s.role === 'PHYSIO') ?? false;
          const REHAB_OPTIONS = [
              { choice: 'REST' as const, label: '😴 Rest', desc: 'Normal –1 week recovery. No risk. +3 morale.' },
              { choice: 'LIGHT' as const, label: '🏃 Train Light', desc: `${hasPhysio ? '60%' : '50%'} chance: heal 1 extra week. 10% re-injury risk.` },
              { choice: 'PUSH' as const, label: '💪 Push Through', desc: `30% chance: heal 2 extra weeks. ${hasPhysio ? '15%' : '25%'} re-injury risk.` },
          ];
          const confirmRehab = (choice: 'REST' | 'LIGHT' | 'PUSH' | null) => {
              if (!choice) return;
              setRehabChoice(choice);
          };
          return (
              <div className="bg-red-900/40 rounded-2xl p-5 mb-6">
                  <h3 className="text-red-200 font-bold text-lg mb-1">🤕 {player.injury!.name}</h3>
                  <p className="text-red-300/70 text-sm mb-1">{player.injury!.weeksRemaining} week(s) remaining</p>
                  {hasPhysio && <p className="text-green-300 text-xs mb-4">✓ Physio staff — improved recovery odds active</p>}
                  <div className="flex flex-col gap-2 mb-4">
                      {REHAB_OPTIONS.map(({ choice, label, desc }) => (
                          <button
                              key={choice}
                              onClick={() => setChosenRehab(choice)}
                              className={`p-4 rounded-xl border text-left transition ${
                                  chosenRehab === choice ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                          >
                              <div className="text-white font-semibold text-sm">{label}</div>
                              <div className="text-white/60 text-xs mt-0.5">{desc}</div>
                          </button>
                      ))}
                  </div>
                  <button
                      onClick={() => confirmRehab(chosenRehab)}
                      disabled={!chosenRehab}
                      className="w-full bg-green-600 disabled:opacity-40 text-white rounded-xl py-3 font-bold"
                  >
                      Confirm Rehab Plan
                  </button>
                  {player.injury?.rehabChoice && (
                      <p className="text-green-400 text-xs text-center mt-2">✓ {player.injury.rehabChoice} selected for this round</p>
                  )}
              </div>
          );
      })()}

      {/* Header with Energy Bar */}
      <div className="mb-6 sticky top-0 bg-slate-900/95 backdrop-blur z-10 py-2 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-black text-white italic uppercase">Training</h2>
              <div className="bg-yellow-900/20 border border-yellow-600/50 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm shadow-sm">
                  SP: {player.skillPoints}
              </div>
          </div>

          {/* Energy / Fatigue Indicator */}
          <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 shadow-md">
              <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Energy</span>
                  <span className={`text-xs font-bold ${fatigueLevel < 30 ? 'text-red-400' : 'text-emerald-400'}`}>{player.energy}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getEnergyColor()}`} 
                    style={{ width: `${player.energy}%` }}
                  ></div>
              </div>
              {player.energy < 10 && (
                  <p className="text-[10px] text-red-400 mt-1 font-bold text-center uppercase animate-pulse">Too Fatigued to Train</p>
              )}
          </div>
      </div>

      {/* Master Skills CTA */}
      <button
          onClick={() => setView('MASTER_SKILLS')}
          className="w-full bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 p-4 rounded-xl mb-6 shadow-lg hover:border-yellow-400 transition-all group"
      >
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="text-4xl">⚡</div>
                  <div className="text-left">
                      <h3 className="font-black text-yellow-400 uppercase text-sm">Master Skill Tree</h3>
                      <p className="text-yellow-300 text-xs">
                          {player.masterSkills?.length || 0} Unlocked · {player.xp.toLocaleString()} XP
                      </p>
                      {availableSkills.length > 0 && (
                          <p className="text-green-400 text-xs font-bold mt-1 animate-pulse">
                              {availableSkills.length} skill{availableSkills.length > 1 ? 's' : ''} ready to unlock!
                          </p>
                      )}
                  </div>
              </div>
              <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
          </div>
      </button>

      {/* Potential Cap Visualization */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex justify-between items-center">
          <div>
              <p className="text-slate-400 text-xs uppercase font-bold">Potential Ceiling</p>
              <p className="text-[10px] text-slate-500">Max trainable level</p>
          </div>
          <div className="text-4xl font-black text-emerald-400">{player.potential} <span className="text-sm text-slate-600 font-normal">/ 99</span></div>
      </div>

      {/* Attribute Cards */}
      <div className="grid gap-3">
          {attributes.map(attr => {
              const currentValue = player.attributes[attr];
              const isCapped = currentValue >= player.potential;
              const canAfford = player.skillPoints > 0 && player.energy >= 10;
              const isProjected = canAfford && !isCapped;

              return (
                  <div key={attr} className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
                      
                      <div className="flex justify-between items-center mb-2 relative z-10">
                          <div className="capitalize font-bold text-slate-200 text-lg flex items-center gap-1">
                              {attr.replace(/([A-Z])/g, ' $1').trim()}
                              {player.age >= 30 && (attr === 'speed' || attr === 'stamina') && (
                                  <span className="text-amber-400 text-xs" title="Declining with age — consider Recovery items.">📉</span>
                              )}
                          </div>
                          
                          {/* Value Display with Projection */}
                          <div className="flex items-center gap-2 bg-slate-950/50 px-3 py-1 rounded-lg">
                              <span className={`font-mono text-xl font-bold ${isCapped ? 'text-yellow-400' : 'text-white'}`}>
                                  {currentValue}
                              </span>
                              {isProjected && (
                                  <>
                                    <span className="text-slate-600 text-xs">➜</span>
                                    <span className="font-mono text-xl font-bold text-emerald-400 animate-pulse">
                                        {currentValue + 1}
                                    </span>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden mb-3">
                          {/* 1. Base Fill */}
                          <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isCapped ? 'bg-yellow-500' : 'bg-emerald-600'}`} 
                            style={{width: `${(currentValue / 99) * 100}%`}}
                          ></div>
                          
                          {/* 2. Projected Fill (Ghost Bar) */}
                          {isProjected && (
                              <div 
                                className="absolute top-0 h-full bg-emerald-400/50 transition-all duration-300 animate-pulse"
                                style={{
                                    left: `${(currentValue / 99) * 100}%`,
                                    width: `${(1 / 99) * 100}%` 
                                }}
                              ></div>
                          )}
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => trainAttribute(attr)}
                        disabled={!canAfford || isCapped}
                        className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                            isCapped 
                                ? 'bg-slate-700 text-yellow-500 cursor-not-allowed border border-yellow-500/30' 
                                : !canAfford 
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-white hover:bg-emerald-50 text-slate-900 shadow-lg shadow-white/10'
                        }`}
                      >
                          {isCapped ? (
                              <><span>🔒</span> Maxed Out</>
                          ) : player.energy < 10 ? (
                              <><span>💤</span> Too Tired</>
                          ) : player.skillPoints === 0 ? (
                              <><span>🚫</span> No SP</>
                          ) : (
                              <><span>⚡</span> Train (-10 Energy)</>
                          )}
                      </button>
                  </div>
              );
          })}
      </div>
      
      {player.skillPoints === 0 && (
          <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm italic">Play matches to earn Skill Points.</p>
              <p className="text-slate-600 text-xs mt-1">Energy recovers fully each week.</p>
          </div>
      )}
    </div>
  );
};

export default Training;
