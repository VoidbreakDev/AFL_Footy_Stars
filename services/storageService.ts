import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const SAVE_KEY = (slot: number) => `footyLegendSave_slot${slot}`;
const LEGACY_SAVE_KEY = 'footyLegendSave';

export const StorageService = {
  async save(slot: number, data: object): Promise<void> {
    const value = JSON.stringify(data);
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: SAVE_KEY(slot), value });
    } else {
      localStorage.setItem(SAVE_KEY(slot), value);
    }
  },

  async load(slot: number): Promise<object | null> {
    if (Capacitor.isNativePlatform()) {
      // Migrate legacy key on first native run
      const legacy = await Preferences.get({ key: LEGACY_SAVE_KEY });
      if (legacy.value) {
        await Preferences.set({ key: SAVE_KEY(0), value: legacy.value });
        await Preferences.remove({ key: LEGACY_SAVE_KEY });
      }
      const result = await Preferences.get({ key: SAVE_KEY(slot) });
      return result.value ? JSON.parse(result.value) : null;
    } else {
      // Browser fallback — existing localStorage logic
      const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
      if (legacy && !localStorage.getItem(SAVE_KEY(0))) {
        localStorage.setItem(SAVE_KEY(0), legacy);
        localStorage.removeItem(LEGACY_SAVE_KEY);
      }
      const saved = localStorage.getItem(SAVE_KEY(slot));
      return saved ? JSON.parse(saved) : null;
    }
  },

  async listSlots(): Promise<{ slot: number; exists: boolean }[]> {
    return Promise.all([0, 1, 2].map(async (slot) => {
      if (Capacitor.isNativePlatform()) {
        const result = await Preferences.get({ key: SAVE_KEY(slot) });
        return { slot, exists: !!result.value };
      } else {
        return { slot, exists: !!localStorage.getItem(SAVE_KEY(slot)) };
      }
    }));
  },

  async clear(slot: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: SAVE_KEY(slot) });
    } else {
      localStorage.removeItem(SAVE_KEY(slot));
    }
  },
};