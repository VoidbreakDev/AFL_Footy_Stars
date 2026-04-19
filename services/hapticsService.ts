import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const guard = (fn: () => Promise<void>) => {
  if (!Capacitor.isNativePlatform()) return;
  fn().catch(() => {});
};

export const HapticsService = {
  light:   () => guard(() => Haptics.impact({ style: ImpactStyle.Light })),
  medium:  () => guard(() => Haptics.impact({ style: ImpactStyle.Medium })),
  heavy:   () => guard(() => Haptics.impact({ style: ImpactStyle.Heavy })),
  success: () => guard(() => Haptics.notification({ type: NotificationType.Success })),
  warning: () => guard(() => Haptics.notification({ type: NotificationType.Warning })),
  error:   () => guard(() => Haptics.notification({ type: NotificationType.Error })),
  
  grandFinal: () => guard(async () => {
    // Custom celebratory pattern
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impact({ style: ImpactStyle.Medium });
  }),
};