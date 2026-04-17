import { useCallback, useRef } from 'react';

/**
 * Audio System for AFL Footy Stars
 * Uses Web Audio API to generate simple synthesized sounds
 * No external audio files needed
 */

type SoundType = 'SIREN_START' | 'SIREN_END' | 'GOAL' | 'BEHIND' | 'CROWD_CHEER' | 'CROWD_BOO' | 'UI_TAP' | 'UI_NAV' | 'MILESTONE';

interface AudioConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

const SOUND_CONFIGS: Record<SoundType, AudioConfig[]> = {
  SIREN_START: [
    { frequency: 440, duration: 0.3, type: 'square', volume: 0.15 },
    { frequency: 660, duration: 0.3, type: 'square', volume: 0.15 },
  ],
  SIREN_END: [
    { frequency: 330, duration: 0.5, type: 'sawtooth', volume: 0.12 },
  ],
  GOAL: [
    { frequency: 523, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 659, duration: 0.15, type: 'sine', volume: 0.2 },
    { frequency: 784, duration: 0.3, type: 'sine', volume: 0.2 },
  ],
  BEHIND: [
    { frequency: 330, duration: 0.2, type: 'triangle', volume: 0.15 },
  ],
  CROWD_CHEER: [
    { frequency: 200, duration: 0.4, type: 'sawtooth', volume: 0.05 },
    { frequency: 250, duration: 0.4, type: 'sawtooth', volume: 0.05 },
    { frequency: 300, duration: 0.4, type: 'sawtooth', volume: 0.05 },
  ],
  CROWD_BOO: [
    { frequency: 150, duration: 0.5, type: 'sawtooth', volume: 0.08 },
  ],
  UI_TAP: [
    { frequency: 800, duration: 0.05, type: 'sine', volume: 0.1 },
  ],
  UI_NAV: [
    { frequency: 600, duration: 0.03, type: 'sine', volume: 0.05 },
  ],
  MILESTONE: [
    { frequency: 440, duration: 0.1, type: 'sine', volume: 0.15 },
    { frequency: 554, duration: 0.1, type: 'sine', volume: 0.15 },
    { frequency: 659, duration: 0.1, type: 'sine', volume: 0.15 },
    { frequency: 880, duration: 0.2, type: 'sine', volume: 0.15 },
  ],
};

export const useAudioSystem = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterVolumeRef = useRef<number>(0.5);
  const sfxVolumeRef = useRef<number>(0.8);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((sound: SoundType) => {
    try {
      const ctx = getAudioContext();
      const configs = SOUND_CONFIGS[sound];
      const masterVol = masterVolumeRef.current;
      const sfxVol = sfxVolumeRef.current;

      configs.forEach((config, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime + index * 0.05);

        const volume = config.volume * masterVol * sfxVol;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime + index * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.05 + config.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime + index * 0.05);
        oscillator.stop(ctx.currentTime + index * 0.05 + config.duration);
      });
    } catch (e) {
      // Audio not available - silently fail
    }
  }, [getAudioContext]);

  const setVolumes = useCallback((music: number, sfx: number) => {
    masterVolumeRef.current = music / 100;
    sfxVolumeRef.current = sfx / 100;
  }, []);

  return { playSound, setVolumes };
};

// Pre-defined sound effects for easy use
export const SoundEffects = {
  matchStart: 'SIREN_START' as SoundType,
  matchEnd: 'SIREN_END' as SoundType,
  goal: 'GOAL' as SoundType,
  behind: 'BEHIND' as SoundType,
  crowdCheer: 'CROWD_CHEER' as SoundType,
  crowdBoo: 'CROWD_BOO' as SoundType,
  uiTap: 'UI_TAP' as SoundType,
  uiNav: 'UI_NAV' as SoundType,
  milestone: 'MILESTONE' as SoundType,
};
