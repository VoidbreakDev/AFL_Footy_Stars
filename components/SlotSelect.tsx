import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { StorageService } from '../services/storageService';

interface SlotSnapshot {
  name: string;
  club: string;
  age: number;
  level: number;
  tier: string;
}

const getSlotSnapshot = async (slot: number): Promise<SlotSnapshot | null> => {
  try {
    const data = await StorageService.load(slot);
    if (!data || !(data as any).player) return null;
    const p = (data as any).player;
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
  const [slots, setSlots] = useState<{slot: number; snapshot: SlotSnapshot | null}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slotData = await Promise.all([0, 1, 2].map(async (slot) => ({
          slot,
          snapshot: await getSlotSnapshot(slot)
        })));
        setSlots(slotData);
      } catch (e) {
        console.error('Failed to load slot data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, []);

  const handleSelectSlot = async (slot: number) => {
    setCurrentSlot(slot);
    const snapshot = slots.find(s => s.slot === slot)?.snapshot;
    if (snapshot) {
      // Pass slot directly — avoids stale closure on currentSlot state
      await loadGame(slot);
    } else {
      setView('ONBOARDING');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">🏈</div>
          <div className="text-lg">Loading careers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🏈</div>
        <h1 className="text-4xl font-black text-white">AFL Footy Stars</h1>
        <p className="text-green-200 mt-2">Select a career slot to continue or start fresh</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {slots.map(({ slot, snapshot }) => {
          return (
            <button
              key={slot}
              onClick={() => handleSelectSlot(slot)}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-2xl p-5 text-left transition-all shadow-lg"
            >
              {snapshot ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                    {snapshot.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold truncate">{snapshot.name}</div>
                    <div className="text-green-200 text-sm">{snapshot.club} · Age {snapshot.age} · Lvl {snapshot.level}</div>
                    <div className="text-green-400 text-xs mt-0.5">{snapshot.tier} · Career {slot + 1}</div>
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
