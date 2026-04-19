import { Capacitor } from '@capacitor/core';

// AdMob is currently disabled due to EXC_BAD_ACCESS crashes in development
// To re-enable, install @capacitor-community/admob and uncomment the AdMob imports

let isInitialized = false;

export const AdService = {
  async init() {
    if (!Capacitor.isNativePlatform() || isInitialized) return;
    try {
      // AdMob.initialize would go here when re-enabled
      console.log('AdService: AdMob disabled in development mode');
      isInitialized = true;
    } catch (e) {
      console.log('AdService initialization:', e);
    }
  },

  async showRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true; // dev mode always rewards

    // Initialize on first use
    if (!isInitialized) {
      await this.init();
    }

    // For now, always return true in development mode
    // When AdMob is re-enabled, this would show the actual rewarded ad
    console.log('AdService: Simulating rewarded ad completion');
    return true;
  },
};