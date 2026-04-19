import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  },

  async scheduleDailyReward(streakExpiresAt: Date) {
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.schedule({
      notifications: [{
        id: 1001,
        title: 'Daily reward ready',
        body: 'Your login streak reward is waiting — don\'t break the streak!',
        schedule: { at: streakExpiresAt },
        smallIcon: 'ic_notification',
        iconColor: '#10b981',
      }]
    });
  },

  async scheduleMatchReminder(roundNumber: number, daysFromNow: number) {
    if (!Capacitor.isNativePlatform()) return;
    const at = new Date();
    at.setDate(at.getDate() + daysFromNow);
    at.setHours(18, 0, 0, 0); // 6pm local time
    await LocalNotifications.schedule({
      notifications: [{
        id: 2000 + roundNumber,
        title: `Round ${roundNumber} is ready`,
        body: 'Your next match is waiting. Get out there.',
        schedule: { at },
        smallIcon: 'ic_notification',
      }]
    });
  },

  async scheduleTransferExpiry(offerId: string, clubName: string, expiresRound: number) {
    if (!Capacitor.isNativePlatform()) return;
    const at = new Date();
    at.setDate(at.getDate() + 1); // Prompt next day
    const numericId = Math.abs(offerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 100000;
    await LocalNotifications.schedule({
      notifications: [{
        id: 3000 + numericId,
        title: 'Transfer offer expiring',
        body: `${clubName} wants you — their offer expires round ${expiresRound}`,
        schedule: { at },
        smallIcon: 'ic_notification',
      }]
    });
  },

  async cancelAll() {
    if (!Capacitor.isNativePlatform()) return;
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  },
};