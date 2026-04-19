
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerAttributes } from '../types';

// ===== DRILL MINI-GAME COMPONENTS =====

const KickDrill: React.FC<{ onComplete: (hits: number) => void }> = ({ onComplete }) => {
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [started, setStarted] = useState(false);
  const [tapped, setTapped] = useState(Array(5).fill(false));

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); onComplete(hits); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [started, timeLeft, hits, onComplete]);

  if (!started) {
    return (
      <button onClick={() => setStarted(true)} className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 font-bold">
        Start — Tap all targets!
      </button>
    );
  }

  return (
    <div>
      <p className="text-white/70 text-sm mb-3">Time: {timeLeft}s · Hits: {hits} / 5</p>
      <div className="grid grid-cols-3 gap-3">
        {tapped.map((hit, i) => (
          <button
            key={i}
            disabled={hit || timeLeft <= 0}
            onClick={() => {
              setTapped(prev => prev.map((v, j) => j === i ? true : v));
              setHits(h => h + 1);
            }}
            className={`h-16 rounded-xl font-bold text-2xl transition ${
              hit ? 'bg-gray-600 text-white/30' : 'bg-red-500 hover:bg-red-400 text-white active:scale-95'
            }`}
          >
            {hit ? '✓' : '🎯'}
          </button>
        ))}
      </div>
    </div>
  );
};

const ReactionDrill: React.FC<{ onComplete: (ms: number) => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'done'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (phase !== 'waiting') return;
    const delay = 1000 + Math.random() * 2000;
    const id = setTimeout(() => {
      setPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
      setStartTime(Date.now());
      setPhase('ready');
    }, delay);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === 'done') return <p className="text-white/50 text-sm text-center py-4">Calculating...</p>;

  return (
    <div
      className="relative h-48 bg-white/5 rounded-xl overflow-hidden cursor-pointer select-none"
      onClick={() => {
        if (phase === 'ready') {
          const ms = Date.now() - startTime;
          setPhase('done');
          onComplete(ms);
        }
      }}
    >
      {phase === 'waiting' && (
        <p className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
          Wait for the target...
        </p>
      )}
      {phase === 'ready' && (
        <button
          className="absolute w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg animate-bounce"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          TAP!
        </button>
      )}
    </div>
  );
};

const StrengthDrill: React.FC<{ onComplete: (clicks: number) => void }> = ({ onComplete }) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); onComplete(clicks); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [started, timeLeft, clicks, onComplete]);

  if (!started) {
    return (
      <button onClick={() => setStarted(true)} className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-xl py-3 font-bold">
        Start — Tap as fast as you can!
      </button>
    );
  }

  return (
    <div className="text-center">
      <p className="text-white/70 text-sm mb-4">Time: {timeLeft}s · Reps: {clicks}</p>
      <button
        onClick={() => { if (timeLeft > 0) setClicks(c => c + 1); }}
        disabled={timeLeft <= 0}
        className="w-32 h-32 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 rounded-full text-white font-black text-xl active:scale-95 transition-transform select-none"
      >
        TAP!
      </button>
    </div>
  );
};
import { getAvailableMasterSkills } from '../utils/masterSkillUtils';
import TipCard from './TipCard';

const Training: React.FC = () => {
  const { player, trainAttribute, setView, setRehabChoice, currentRound, setPlayer } = useGame();
  const [chosenRehab, setChosenRehab] = useState<'REST' | 'LIGHT' | 'PUSH' | null>(null);
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);
  const [drillResult, setDrillResult] = useState<string | null>(null);

  const drillType = (['KICK', 'REACTION', 'STRENGTH'] as const)[currentRound % 3];
  const drillKey = `drill_round_${currentRound}`;
  const drillAlreadyDone = !!player.seenTips?.[drillKey];

  const [activeDrill, setActiveDrill] = useState<'KICK' | 'REACTION' | 'STRENGTH' | null>(null);
  const [drillDone, setDrillDone] = useState(drillAlreadyDone);

  const completeDrill = (raw: number) => {
    let spBonus = 0;
    let resultMsg = '';
    if (drillType === 'KICK') {
      spBonus = raw >= 4 ? 2 : raw >= 2 ? 1 : 0;
      resultMsg = raw >= 4 ? `Perfect! ${raw}/5 hits — +2 SP bonus!` : raw >= 2 ? `Good work! ${raw}/5 hits — +1 SP bonus.` : `Keep practising. ${raw}/5 hits.`;
    } else if (drillType === 'REACTION') {
      spBonus = raw < 300 ? 2 : raw < 600 ? 1 : 0;
      resultMsg = raw < 300 ? `Lightning fast! ${raw}ms — +2 SP bonus!` : raw < 600 ? `Good reflexes! ${raw}ms — +1 SP bonus.` : `Slow reaction. ${raw}ms — no bonus.`;
    } else {
      spBonus = raw >= 20 ? 2 : raw >= 10 ? 1 : 0;
      resultMsg = raw >= 20 ? `Beast mode! ${raw} reps — +2 SP bonus!` : raw >= 10 ? `Solid effort! ${raw} reps — +1 SP bonus.` : `Keep grinding. ${raw} reps.`;
    }
    setDrillResult(resultMsg);
    setDrillDone(true);
    // Persist drill completion to player profile
    setPlayer((prev: any) => prev ? {
      ...prev,
      skillPoints: prev.skillPoints + spBonus,
      seenTips: { ...(prev.seenTips || {}), [drillKey]: true }
    } : prev);
  };

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
    <div className="p-4 pb-24 h-full bg-slate-900" style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
    }}>

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

      {/* Drill of the Day */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-3">
              <div>
                  <p className="text-slate-400 text-xs uppercase font-bold">Drill of the Day</p>
                  <p className="text-white font-bold text-sm">
                      {drillType === 'KICK' ? '🎯 Target Practice' : drillType === 'REACTION' ? '⚡ Reaction Test' : '💪 Strength Circuit'}
                  </p>
              </div>
              {!drillDone && !activeDrill && (
                  <button
                      onClick={() => setActiveDrill(drillType)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                      Start Drill
                  </button>
              )}
          </div>
          {activeDrill === 'KICK' && !drillDone && <KickDrill onComplete={completeDrill} />}
          {activeDrill === 'REACTION' && !drillDone && <ReactionDrill onComplete={completeDrill} />}
          {activeDrill === 'STRENGTH' && !drillDone && <StrengthDrill onComplete={completeDrill} />}
          {drillDone && drillResult && (
              <p className="text-emerald-400 font-bold text-sm text-center py-2">{drillResult}</p>
          )}
          {!activeDrill && !drillDone && (
              <p className="text-slate-500 text-xs">Complete today's drill for bonus Skill Points.</p>
          )}
      </div>

      {/* Attribute Cards - Accordion Style */}
      <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
              <p className="text-slate-400 text-xs uppercase font-bold">Attributes</p>
              <p className="text-slate-500 text-[10px]">Tap to expand</p>
          </div>
          {attributes.map(attr => {
              const currentValue = player.attributes[attr];
              const isCapped = currentValue >= player.potential;
              const canAfford = player.skillPoints > 0 && player.energy >= 10;
              const isProjected = canAfford && !isCapped;
              const isExpanded = expandedAttr === attr;
              const attrLabel = attr.replace(/([A-Z])/g, ' $1').trim();

              return (
                  <div key={attr} className={`rounded-xl border overflow-hidden transition-all ${isExpanded ? 'border-slate-600 bg-slate-800' : 'border-slate-700/50 bg-slate-800/70'}`}>
                      {/* Collapsed Header - Always Visible */}
                      <button
                          onClick={() => setExpandedAttr(isExpanded ? null : attr)}
                          className="w-full flex items-center justify-between p-3"
                      >
                          <div className="flex items-center gap-3 flex-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isCapped ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                  {currentValue}
                              </div>
                              <div className="text-left">
                                  <div className="capitalize font-bold text-slate-200 text-sm flex items-center gap-1">
                                      {attrLabel}
                                      {player.age >= 30 && (attr === 'speed' || attr === 'stamina') && (
                                          <span className="text-amber-400 text-[10px]" title="Declining with age">📉</span>
                                      )}
                                  </div>
                              </div>
                          </div>

                          <div className="flex items-center gap-2">
                              {/* Mini Progress Bar */}
                              <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                  <div
                                      className={`h-full rounded-full ${isCapped ? 'bg-yellow-500' : 'bg-emerald-600'}`}
                                      style={{width: `${(currentValue / 99) * 100}%`}}
                                  ></div>
                              </div>
                              {/* Chevron */}
                              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                          </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                          <div className="px-3 pb-3 border-t border-slate-700/50 pt-3">
                              {/* Projected Value */}
                              <div className="flex items-center justify-between mb-3">
                                  <span className="text-[10px] text-slate-500 uppercase">Current → Next</span>
                                  <div className="flex items-center gap-2">
                                      <span className={`font-mono text-lg font-bold ${isCapped ? 'text-yellow-400' : 'text-white'}`}>{currentValue}</span>
                                      {isProjected && (
                                          <>
                                              <span className="text-slate-600 text-xs">➜</span>
                                              <span className="font-mono text-lg font-bold text-emerald-400">{currentValue + 1}</span>
                                          </>
                                      )}
                                  </div>
                              </div>

                              {/* Full Progress Bar */}
                              <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3">
                                  <div
                                      className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isCapped ? 'bg-yellow-500' : 'bg-emerald-600'}`}
                                      style={{width: `${(currentValue / 99) * 100}%`}}
                                  ></div>
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

                              {/* Train Button */}
                              <button
                                  onClick={() => trainAttribute(attr)}
                                  disabled={!canAfford || isCapped}
                                  className={`w-full py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
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
                      )}
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
