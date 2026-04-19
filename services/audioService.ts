import { useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Audio System for AFL Footy Stars
 * Native audio is currently disabled due to NSIndexPath crashes in development
 * Falls back to silent mode on mobile, Web Audio API would be used in browser
 */

export const SoundEffects = {
  goal: 'goal',
  behind: 'behind',
  sirenStart: 'siren_start',
  sirenEnd: 'siren_end',
  crowdCheer: 'crowd_cheer',
  crowdBoo: 'crowd_boo',
  uiTap: 'ui_tap',
  uiNav: 'ui_nav',
  milestone: 'milestone',
  achievement: 'achievement',
};

let sfxVolume = 0.8;
let musicVolume = 0.5;
let audioReady = false;

export const initAudio = async () => {
  if (!Capacitor.isNativePlatform() || audioReady) return;
  console.log('Audio: Native audio disabled in development mode');
  // NativeAudio.preload would go here when re-enabled
  audioReady = true;
};

export const useAudioSystem = () => {
  const playSound = useCallback((soundId: string) => {
    if (!Capacitor.isNativePlatform()) return; // silent in browser during dev
    console.log(`Audio: Simulating sound playback: ${soundId}`);
    // NativeAudio.play would go here when re-enabled
  }, []);

  const setVolumes = useCallback((music: number, sfx: number) => {
    musicVolume = music / 100;
    sfxVolume = sfx / 100;
  }, []);

  return { playSound, setVolumes };
};

// Pre-defined sound effects for easy use
