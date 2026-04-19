import { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.aflstars.game',
  appName: 'AFL Footy Stars',
  webDir: 'dist',
  backgroundColor: '#0f172a',
  ...(isDev && process.env.VITE_LOCAL_IP ? {
    server: {
      url: `http://${process.env.VITE_LOCAL_IP}:3000`,
      cleartext: true,
    },
  } : {}),
  ios: {
    contentInset: 'always',
    scrollEnabled: false,
  },
  android: {
    backgroundColor: '#0f172a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      launchAutoHide: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f172a',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
