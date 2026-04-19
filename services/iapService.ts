import { Capacitor } from '@capacitor/core';

// RevenueCat IAP is currently disabled due to NSIndexPath crashes in development
// To re-enable, install @revenuecat/purchases-capacitor and uncomment the Purchases imports

const RC_API_KEY_IOS = 'appl_YOUR_KEY_HERE';
const RC_API_KEY_ANDROID = 'goog_YOUR_KEY_HERE';

// Map existing shop item IDs to App Store / Play Store product IDs
export const PRODUCT_MAP: Record<string, string> = {
  'energy_drink':         'com.aflstars.energy_drink',
  'sports_drink':         'com.aflstars.sports_drink',
  'recovery_session':     'com.aflstars.recovery_session',
  'peak_conditioning':    'com.aflstars.peak_conditioning',
  'remove_ads':           'com.aflstars.remove_ads',
  'season_pass':          'com.aflstars.season_pass',
  'coins_small':          'com.aflstars.coins_099',
  'coins_medium':         'com.aflstars.coins_299',
  'coins_large':          'com.aflstars.coins_999',
};

export const IAPService = {
  async init(uid?: string) {
    if (!Capacitor.isNativePlatform()) return;
    console.log('IAPService: RevenueCat disabled in development mode');
    // Purchases.configure would go here when re-enabled
  },

  async getOfferings() {
    if (!Capacitor.isNativePlatform()) return null;
    console.log('IAPService: Simulating offerings fetch');
    // Purchases.getOfferings would go here when re-enabled
    return null;
  },

  async purchase(productId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true; // dev mode always succeeds
    console.log(`IAPService: Simulating purchase of ${productId}`);
    // Purchases.purchasePackage would go here when re-enabled
    return true;
  },

  async hasEntitlement(entitlementId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    console.log(`IAPService: Simulating entitlement check for ${entitlementId}`);
    // Purchases.getCustomerInfo would go here when re-enabled
    return false;
  },

  async restorePurchases() {
    if (!Capacitor.isNativePlatform()) return;
    console.log('IAPService: Simulating purchase restoration');
    // Purchases.restorePurchases would go here when re-enabled
  },
};