# 📱 AFL Footy Stars — v1.4 Feature Specification
**Mobile-First Architecture Migration**
*April 2026 | Prepared for Claude Code / Sub-agents*

---

## 1. Overview

v1.4 is a pure infrastructure and platform update. It has **zero gameplay changes**. The goal is to take the existing React/Vite web application and transform it into a properly packaged iOS and Android native application using Capacitor, replacing fragile browser-only APIs with production-grade native equivalents, and laying the monetisation and cloud infrastructure needed for App Store / Google Play submission.

The component layer, game logic, TypeScript types, and all business logic utilities remain **completely unchanged**. Agents working on this spec must not modify `types.ts`, `constants.ts`, any file in `utils/`, or any component in `components/` unless explicitly instructed in a specific task below.

**Target outcome:** A production build that passes App Store and Google Play review, runs fully offline, persists saves reliably on-device, and is ready for IAP and ad integration.

---

### 1.1 What v1.4 Is NOT

- No new gameplay features, systems, or content
- No UI redesigns — layouts, colours, and component structure are preserved
- No React Native migration — the existing React/Vite/Tailwind stack is kept entirely
- No multiplayer or social features
- No changes to `GameContext.tsx` game logic — only `saveGame()` and `loadGame()` change (storage backend swap)
- No changes to any file in `utils/` or `types.ts`

---

### 1.2 v1.3 Foundation — What Exists

| Current State | v1.4 Replacement / Fix |
|---|---|
| React pulled from `aistudiocdn.com` importmap | Removed — bundled locally via Vite |
| Tailwind loaded from `cdn.tailwindcss.com` | Replaced with local npm Tailwind v4 + PostCSS pipeline |
| `localStorage` for save data | `@capacitor/preferences` (UserDefaults on iOS, SharedPreferences on Android) |
| Web Audio API oscillators for sound | `@capacitor-community/native-audio` with bundled .mp3 files |
| No native shell | Capacitor 8 wrapping the Vite `dist/` output |
| No safe area / notch handling | CSS `env(safe-area-inset-*)` + StatusBar plugin |
| No haptic feedback | `@capacitor/haptics` wired to key game moments |
| No push notifications | `@capacitor/local-notifications` for engagement reminders |
| No native share | `@capacitor/share` replacing clipboard export in `CareerExport.tsx` |
| No IAP | RevenueCat (`@revenuecat/purchases-capacitor`) |
| No rewarded ads | `@capacitor-community/admob` for opt-in energy/coin rewards |

---

### 1.3 Implementation phases

| Phase | Focus | Blocks submission? |
|---|---|---|
| Phase 1 — Foundation | Capacitor setup, CDN fix, base plugins | Yes — must complete first |
| Phase 2 — Persistence | Storage migration, cloud saves, audio | Yes — data integrity required |
| Phase 3 — Native layer | Haptics, notifications, share, IAP, ads | No — can ship without, add post-launch |
| Phase 4 — Polish | Safe area, splash screen, touch targets, offline | Partial — safe area required |

**Minimum viable submission:** Phases 1, 2, and 4 complete.

---

## 2. Phase 1 — Foundation

### 2.1 Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/app @capacitor/status-bar @capacitor/keyboard @capacitor/haptics @capacitor/splash-screen
npx cap init "AFL Footy Stars" "com.aflstars.game" --web-dir dist
npx cap add ios
npx cap add android
```

**`capacitor.config.ts`** (create in project root):

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.aflstars.game',
  appName: 'AFL Footy Stars',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  ...(isDev && process.env.VITE_LOCAL_IP ? {
    server: { url: `http://${process.env.VITE_LOCAL_IP}:3000`, cleartext: true },
  } : {}),
  ios: { contentInset: 'always', scrollEnabled: false },
  android: { backgroundColor: '#0f172a' },
  plugins: {
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#0f172a', showSpinner: false, launchAutoHide: false },
    StatusBar: { style: 'dark', backgroundColor: '#0f172a' },
    Keyboard: { resize: 'body', style: 'dark', resizeOnFullScreen: true },
  },
};

export default config;
```

**`vite.config.ts`** — add `base: './'`:
```typescript
return {
  base: './',   // ADD — required for Capacitor file:// protocol
  server: { port: 3000, host: '0.0.0.0' },
  // ... rest unchanged
};
```

**Add scripts to `package.json`:**
```json
"mobile:sync": "npm run build && npx cap sync",
"mobile:ios": "npm run mobile:sync && npx cap open ios",
"mobile:android": "npm run mobile:sync && npx cap open android"
```

---

### 2.2 Fix CDN dependencies — CRITICAL

Remove from `index.html`:
- The entire `<script type="importmap">` block (points at `aistudiocdn.com` — fails in native)
- `<script src="https://cdn.tailwindcss.com">` (CDN fails offline)

**Install local Tailwind v4:**
```bash
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer
```

**`postcss.config.js`:**
```js
export default { plugins: { '@tailwindcss/postcss': {} } };
```

**`index.css`** — replace all `@tailwind` directives with v4 import:
```css
@import "tailwindcss";
/* paste remaining global styles here (fonts, keyframes, body, scrollbar) */
```

**`index.tsx`** — ensure `import './index.css';` is present.

---

### 2.3 App lifecycle wiring (`App.tsx`)

```typescript
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// In AppShell useEffect (AppShell must be INSIDE GameProvider):
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    SplashScreen.hide({ fadeOutDuration: 300 });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0f172a' });
  }
  const back = CapApp.addListener('backButton', () => {
    if (['DASHBOARD','SLOT_SELECT','ONBOARDING'].includes(view)) CapApp.exitApp();
    else setView('DASHBOARD');
  });
  return () => { back.then(h => h.remove()); };
}, [view]);
```

---

## 3. Phase 2 — Persistence

### 3.1 `services/storageService.ts` (create)

```typescript
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const SAVE_KEY = (slot: number) => `footyLegendSave_slot${slot}`;
const LEGACY_KEY = 'footyLegendSave';

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
      const legacy = await Preferences.get({ key: LEGACY_KEY });
      if (legacy.value) {
        await Preferences.set({ key: SAVE_KEY(0), value: legacy.value });
        await Preferences.remove({ key: LEGACY_KEY });
      }
      const result = await Preferences.get({ key: SAVE_KEY(slot) });
      return result.value ? JSON.parse(result.value) : null;
    } else {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && !localStorage.getItem(SAVE_KEY(0))) {
        localStorage.setItem(SAVE_KEY(0), legacy);
        localStorage.removeItem(LEGACY_KEY);
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
      }
      return { slot, exists: !!localStorage.getItem(SAVE_KEY(slot)) };
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
```

Update `saveGame()` and `loadGame()` in `GameContext.tsx` to call `StorageService.save()` and `StorageService.load()`. All existing migration blocks remain unchanged — only the read/write backend swaps.

---

### 3.2 Audio migration (`services/audioService.ts`)

Add `initAudio` export (required by `App.tsx` dynamic import):

```typescript
import { Capacitor } from '@capacitor/core';

export const initAudio = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  console.log('[AudioService] Native audio ready');
  // NativeAudio preload calls go here once sound files are added to public/sounds/
};
```

---

## 4. Phase 3 — Native layer

### 4.1 `services/hapticsService.ts` (create)

```typescript
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
  grandFinal: () => guard(async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impact({ style: ImpactStyle.Heavy });
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impact({ style: ImpactStyle.Medium });
  }),
};
```

Wire haptics to: goal scored (heavy), achievement unlocked (success), injury (warning), training complete (medium), Grand Final win (grandFinal), nav tap (light).

---

### 4.2 Native share (`components/CareerExport.tsx`)

```typescript
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

const handleShare = async () => {
  const cardText = generateCareerCard();
  if (Capacitor.isNativePlatform()) {
    await Share.share({ title: `${player.name} — AFL Career`, text: cardText, dialogTitle: 'Share your career' });
  } else {
    navigator.clipboard.writeText(cardText);
    setCopied(true);
  }
};
```

---

## 5. Phase 4 — UX & Polish

### 5.1 Safe area insets (`components/Layout.tsx`)

```html
<!-- index.html viewport meta — add viewport-fit=cover -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

```typescript
// Layout.tsx — main content area
<main style={{ paddingTop: 'env(safe-area-inset-top)' }} className="flex-1 overflow-y-auto">

// Bottom nav — replace h-20 with safe-area-aware padding
<div style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '5rem' }}
     className="shrink-0 bg-slate-950 border-t border-slate-800 z-50">
```

### 5.2 App icon & splash screen

```bash
# Create resources/icon.png (1024×1024) and resources/splash.png (2732×2732)
npm install -D @capacitor/assets
npx @capacitor/assets generate --ios --android
```

---

## 6. App Store / Play Store checklist

**iOS:** Bundle ID `com.aflstars.game`, Sign in with Apple enabled, `NSUserTrackingUsageDescription` if using AdMob, age rating 4+, screenshots for 6.5" and 5.5".

**Android:** `applicationId: "com.aflstars.game"`, target SDK 34, release keystore generated and stored securely, `google-services.json` added.

**Both:** Privacy policy URL required.

---

## 7. Files summary

| File | Action |
|------|--------|
| `capacitor.config.ts` | Create |
| `postcss.config.js` | Create (v4 format) |
| `index.css` | Replace CDN `@tailwind` with `@import "tailwindcss"` |
| `vite.config.ts` | Add `base: './'` |
| `index.html` | Remove importmap + CDN Tailwind script |
| `App.tsx` | Restructure — GameProvider wraps AppShell; AppShell handles Capacitor lifecycle |
| `services/storageService.ts` | Create |
| `services/audioService.ts` | Add `initAudio` export |
| `services/hapticsService.ts` | Create |
| `context/GameContext.tsx` | Update `saveGame`/`loadGame` to use StorageService |
| `components/CareerExport.tsx` | Replace clipboard with native Share |
| `components/Layout.tsx` | Add safe area insets |
