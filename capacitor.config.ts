import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rokomari.bspr.curriculum',
  appName: 'Rokomari BSPR',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#00a2b8',
      launchShowDuration: 2000,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
    },
    StatusBar: {
      backgroundColor: '#00a2b8',
      style: 'DARK',
    }
  }
};

export default config;
