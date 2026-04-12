import React from 'react';
import { useGameContext } from '../context/GameContext';

const SAVE_KEY = (slot: number) => `footyLegendSave_slot${slot}`;

interface SlotSnapshot {
  name: string;
  club: string;
  age: number;
  level: number;
  tier: string;
}

const getSlotSnapshot = (slot: number): SlotSnapshot | null => {
  try {
    const raw = localStorage.getItem(SAVE_KEY(slot));
    if (!raw) return null;
    const data = JSON.parse(raw);
    const p = data.player;
    if (!p) return null;
    return {
      name: p.name ?? 'Unknown',
      club: p.contract?.clubName ?? 'Unknown',
      age: p.age ?? 0,
      level: p.level ?? 1,
      tier: p.contract?.tier ?? 'LOCAL',
    };
  } catch {
    return null;
  }
};

const SlotSelect: React.FC = () => {
  const { setCurrentSlot, loadGame, setView } = useGameContext();

  const handleSelectSlot = (slot: number) => {
    setCurrentSlot(slot);
    // loadGame reads currentSlot — give state a tick to update then load
    // We replicate the load logic inline to avoid stale closure issue
    try {
      const raw = localStorage.getItem(SAVE_KEY(slot));
      if (raw) {
        // Slot has a save — trigger a real load through context after slot is set
        // Use a small timeout so setCurrentSlot flushes first
        setTimeout(() => {
          loadGame();
        }, 0);
      } else {
        setView('ONBOARDING');
      }
    } catch {
      setView('ONBOARDING');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🏈</div>
        <h1 className="text-4xl font-black text-white">AFL Footy Stars</h1>
        <p className="text-green-200 mt-2">Select a career slot to continue or start fresh</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {[0, 1, 2].map(slot => {
          const snap = getSlotSnapshot(slot);
          return (
            <button
              key={slot}
              onClick={() => handleSelectSlot(slot)}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-2xl p-5 text-left transition-all shadow-lg"
            >
              {snap ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {snap.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{snap.name}</div>
                    <div className="text-green-200 text-sm">{snap.club} · Age {snap.age} · Lvl {snap.level}</div>
                    <div className="text-green-400 text-xs mt-0.5">{snap.tier} · Career {slot + 1}</div>
                  </div>
                  <div className="text-green-300 text-xl">▶</div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center text-white/40 text-2xl shrink-0">
                    +
                  </div>
                  <div>
                    <div className="text-white/70 font-semibold">New Career</div>
                    <div className="text-white/40 text-sm">Career Slot {slot + 1}</div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-green-400/50 text-xs mt-8 text-center">
        AFL Footy Stars v1.1
      </p>
    </div>
  );
};

export default SlotSelect;
