import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rokomari.bspr.curriculum',
  appName: 'Rokomari BSPR',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#0d0d0f',
      launchShowDuration: 2000,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#00c4db',
    },
    StatusBar: {
      backgroundColor: '#18181b',
      style: 'DARK',
    }
  }
};

export default config;
